(() => {
  'use strict';
  const root = globalThis;
  const core = root.F1M_CORE = root.F1M_CORE || {};
  const FORMAT_V1 = 'F1M_SAVE_ENVELOPE_V1';
  const FORMAT = 'F1M_SAVE_ENVELOPE_V2';
  const EXPORT_FORMAT = 'F1M_PORTABLE_SAVE_V1';
  const JOURNAL_FORMAT = 'F1M_SAVE_JOURNAL_V1';

  function checksum(value){
    const input = typeof value === 'string' ? value : stableStringify(value);
    let hash = 0x811c9dc5;
    for(let index = 0; index < input.length; index++){
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(16).padStart(8, '0');
  }

  function stableStringify(value){
    const seen = new WeakSet();
    const normalize = input => {
      if(input === null || typeof input !== 'object') return input;
      if(seen.has(input)) return '[Circular]';
      seen.add(input);
      if(Array.isArray(input)) return input.map(normalize);
      return Object.keys(input).sort().reduce((acc, key) => {
        acc[key] = normalize(input[key]);
        return acc;
      }, {});
    };
    return JSON.stringify(normalize(value));
  }

  function clone(value){
    return JSON.parse(JSON.stringify(value || {}));
  }

  function byteSize(value){
    return String(value || '').length;
  }

  function createEnvelope(payload, options = {}){
    const normalizedPayload = clone(payload);
    const payloadJson = stableStringify(normalizedPayload);
    const base = {
      format:FORMAT,
      envelopeVersion:2,
      saveSchema:Number(options.schema || normalizedPayload.saveSchema || 0),
      buildCode:String(options.buildCode || 'dev'),
      savedAt:String(normalizedPayload.updatedAt || new Date().toISOString()),
      payloadChecksum:checksum(payloadJson),
      payloadBytes:byteSize(payloadJson),
      payload:normalizedPayload
    };
    base.envelopeChecksum = checksum(stableStringify({...base, envelopeChecksum:null}));
    return base;
  }

  function validateEnvelope(parsed){
    if(!parsed || typeof parsed !== 'object') return { valid:false, reason:'not-object' };
    if(parsed.format === FORMAT_V1 && Object.prototype.hasOwnProperty.call(parsed, 'payload')){
      const payloadJson = JSON.stringify(parsed.payload);
      const valid = parsed.checksum === checksum(payloadJson);
      return { valid, reason:valid ? 'ok-v1' : 'checksum-mismatch-v1', state:valid ? parsed.payload : null, legacyEnvelope:true };
    }
    if(parsed.format === FORMAT && Object.prototype.hasOwnProperty.call(parsed, 'payload')){
      const payloadJson = stableStringify(parsed.payload);
      const payloadValid = parsed.payloadChecksum === checksum(payloadJson);
      const envelopeValid = parsed.envelopeChecksum === checksum(stableStringify({...parsed, envelopeChecksum:null}));
      const valid = payloadValid && envelopeValid;
      return { valid, reason:valid ? 'ok-v2' : !payloadValid ? 'payload-checksum-mismatch' : 'envelope-checksum-mismatch', state:valid ? parsed.payload : null, legacyEnvelope:false, envelope:parsed };
    }
    return { valid:true, reason:'legacy-raw', state:parsed, legacyRaw:true };
  }

  function parsePortable(raw){
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if(parsed?.format !== EXPORT_FORMAT || !Object.prototype.hasOwnProperty.call(parsed, 'payload')){
      throw new Error('Formato de importação não reconhecido. Use um pacote exportado pela Fase 5 ou superior.');
    }
    const payloadJson = stableStringify(parsed.payload);
    if(parsed.checksum !== checksum(payloadJson)) throw new Error('Checksum do pacote importado não confere. O arquivo pode estar incompleto ou alterado.');
    return parsed;
  }

  function createRepository(options = {}){
    const storage = options.storage || root.localStorage;
    const activeKey = String(options.activeKey || 'f1m_active_save');
    const tmpKey = `${activeKey}_tmp`;
    const journalKey = `${activeKey}_journal`;
    const emergencyKey = `${activeKey}_emergency`;
    const legacyKeys = Array.from(new Set((options.legacyKeys || []).map(String).filter(Boolean).filter(key => key !== activeKey)));
    const schema = Number(options.schema || 0);
    const buildCode = String(options.buildCode || 'dev');
    const backupCount = Math.max(3, Math.min(7, Number(options.backupCount || 5)));
    const maxJournal = Math.max(8, Math.min(40, Number(options.maxJournal || 20)));
    const onError = typeof options.onError === 'function' ? options.onError : () => {};
    let lastLoad = null;
    let lastRecovery = null;
    let lastWrite = null;

    function backupKey(index){ return `${activeKey}_backup_${index}`; }
    function safeGet(key){ try { return storage?.getItem(key) ?? null; } catch(error){ onError(error, `persistence:get:${key}`); return null; } }
    function safeSet(key, value){ try { storage?.setItem(key, value); return true; } catch(error){ onError(error, `persistence:set:${key}`); return false; } }
    function safeRemove(key){ try { storage?.removeItem(key); return true; } catch(error){ onError(error, `persistence:remove:${key}`); return false; } }

    function readJournal(){
      try {
        const parsed = JSON.parse(safeGet(journalKey) || '[]');
        return Array.isArray(parsed) ? parsed : [];
      } catch(error){ onError(error, 'persistence:journal:read'); return []; }
    }
    function appendJournal(type, detail = {}){
      const entry = { at:new Date().toISOString(), type:String(type), buildCode, schema, ...detail };
      const next = [entry, ...readJournal()].slice(0, maxJournal);
      safeSet(journalKey, JSON.stringify(next));
      return entry;
    }

    function decode(raw, key){
      if(!raw) return null;
      let parsed;
      try { parsed = JSON.parse(raw); }
      catch(error){ onError(error, `persistence:parse:${key}`); return { state:null, key, valid:false, legacy:false, reason:'json-invalid', bytes:byteSize(raw) }; }
      const validation = validateEnvelope(parsed);
      return { state:validation.state || null, key, valid:Boolean(validation.valid), legacy:Boolean(validation.legacyRaw || validation.legacyEnvelope), reason:validation.reason, envelope:validation.envelope || parsed, bytes:byteSize(raw) };
    }

    function candidateKeys(){
      return [activeKey, tmpKey, ...Array.from({length:backupCount}, (_, index) => backupKey(index + 1)), emergencyKey, ...legacyKeys];
    }

    function bestCandidate(){
      for(const key of candidateKeys()){
        const decoded = decode(safeGet(key), key);
        if(decoded?.state && decoded.valid){
          return decoded;
        }
      }
      return null;
    }

    function load(){
      const decoded = bestCandidate();
      if(decoded?.state){
        lastLoad = { key:decoded.key, valid:decoded.valid, legacy:decoded.legacy, reason:decoded.reason, at:new Date().toISOString() };
        if(decoded.key !== activeKey){
          lastRecovery = { from:decoded.key, to:activeKey, reason:decoded.reason, at:lastLoad.at };
          appendJournal('load-recovered', lastRecovery);
          safeSet(activeKey, JSON.stringify(createEnvelope(decoded.state, { schema, buildCode })));
        }
        return decoded.state;
      }
      lastLoad = { key:null, valid:true, legacy:false, reason:'empty', at:new Date().toISOString() };
      return null;
    }

    function rotateBackups(){
      for(let index = backupCount; index >= 2; index--){
        const previous = safeGet(backupKey(index - 1));
        if(previous) safeSet(backupKey(index), previous);
      }
      const active = safeGet(activeKey);
      if(active) safeSet(backupKey(1), active);
    }

    function atomicCommit(envelope){
      const raw = JSON.stringify(envelope);
      if(!safeSet(tmpKey, raw)) return { ok:false, reason:'tmp-write-failed' };
      const decodedTmp = decode(safeGet(tmpKey), tmpKey);
      if(!decodedTmp?.valid || !decodedTmp.state) return { ok:false, reason:decodedTmp?.reason || 'tmp-verify-failed' };
      rotateBackups();
      if(!safeSet(activeKey, raw)){
        safeSet(emergencyKey, raw);
        return { ok:false, reason:'active-write-failed-emergency-created' };
      }
      const decodedActive = decode(safeGet(activeKey), activeKey);
      if(!decodedActive?.valid || !decodedActive.state){
        safeSet(emergencyKey, raw);
        return { ok:false, reason:decodedActive?.reason || 'active-verify-failed' };
      }
      safeRemove(tmpKey);
      return { ok:true, reason:'ok' };
    }

    function save(state){
      const payload = clone(state || {});
      payload.saveSchema = schema;
      payload.updatedAt = new Date().toISOString();
      payload.saveVault = {
        format:FORMAT,
        journal:JOURNAL_FORMAT,
        backups:backupCount,
        lastWriteAt:payload.updatedAt,
        buildCode
      };
      const envelope = createEnvelope(payload, { schema, buildCode });
      const result = atomicCommit(envelope);
      lastWrite = { at:payload.updatedAt, ok:result.ok, reason:result.reason, bytes:byteSize(JSON.stringify(envelope)), checksum:envelope.payloadChecksum };
      appendJournal(result.ok ? 'save-commit' : 'save-failed', lastWrite);
      return { ok:result.ok, reason:result.reason, state:payload, envelope };
    }

    function inspect(){
      const activeRaw = safeGet(activeKey);
      const active = decode(activeRaw, activeKey);
      const backups = Array.from({length:backupCount}, (_, index) => {
        const key = backupKey(index + 1);
        const raw = safeGet(key);
        const decoded = decode(raw, key);
        return { index:index + 1, key, exists:Boolean(raw), valid:decoded ? Boolean(decoded.valid) : null, reason:decoded?.reason || 'empty', bytes:byteSize(raw) };
      });
      const tmpRaw = safeGet(tmpKey);
      const emergencyRaw = safeGet(emergencyKey);
      return {
        format:active?.legacy ? (active.reason || 'legacy') : active?.envelope?.format || FORMAT,
        active:Boolean(activeRaw),
        valid:active ? Boolean(active.valid) : true,
        reason:active?.reason || 'empty',
        bytes:byteSize(activeRaw),
        schema:Number(active?.state?.saveSchema || active?.envelope?.saveSchema || 0),
        backups:backups.filter(item => item.exists && item.valid).length,
        backupSlots:backups,
        tmp:{ exists:Boolean(tmpRaw), valid:tmpRaw ? Boolean(decode(tmpRaw, tmpKey)?.valid) : null, bytes:byteSize(tmpRaw) },
        emergency:{ exists:Boolean(emergencyRaw), valid:emergencyRaw ? Boolean(decode(emergencyRaw, emergencyKey)?.valid) : null, bytes:byteSize(emergencyRaw) },
        journal:readJournal().slice(0, 10),
        journalCount:readJournal().length,
        lastLoad,
        lastRecovery,
        lastWrite
      };
    }

    function recover(){
      const decoded = bestCandidate();
      if(!decoded?.state) return { ok:false, reason:'no-valid-candidate' };
      const envelope = createEnvelope(decoded.state, { schema, buildCode });
      const result = atomicCommit(envelope);
      lastRecovery = { from:decoded.key, to:activeKey, reason:decoded.reason, at:new Date().toISOString(), ok:result.ok };
      appendJournal(result.ok ? 'manual-recovery' : 'manual-recovery-failed', lastRecovery);
      return { ok:result.ok, reason:result.reason, source:decoded.key, state:decoded.state };
    }

    function verify(rawOrState){
      if(typeof rawOrState === 'string'){
        try {
          const parsed = JSON.parse(rawOrState);
          if(parsed?.format === EXPORT_FORMAT) parsePortable(parsed);
          else {
            const validation = validateEnvelope(parsed);
            if(!validation.valid) throw new Error(validation.reason);
          }
          return { ok:true, reason:'ok' };
        } catch(error){ return { ok:false, reason:String(error?.message || error) }; }
      }
      const payloadJson = stableStringify(rawOrState || {});
      return { ok:true, checksum:checksum(payloadJson), bytes:byteSize(payloadJson) };
    }

    function createPortableExport(state, meta = {}){
      const payload = clone(state || load() || {});
      payload.saveSchema = schema;
      payload.exportedFromBuild = buildCode;
      const payloadJson = stableStringify(payload);
      return {
        format:EXPORT_FORMAT,
        exportVersion:1,
        buildCode,
        saveSchema:schema,
        exportedAt:new Date().toISOString(),
        manager:payload.profile?.name || 'Gestor',
        series:payload.currentSeries || 'F2',
        team:payload.currentTeam || null,
        checksum:checksum(payloadJson),
        payloadBytes:byteSize(payloadJson),
        meta:{ minSchema:0, app:'F1 Manager 3D', ...meta },
        payload
      };
    }

    function importPortable(raw){
      const pack = parsePortable(raw);
      const payload = clone(pack.payload || {});
      payload.importedAt = new Date().toISOString();
      payload.importedFromBuild = pack.buildCode || payload.exportedFromBuild || 'unknown';
      const result = save(payload);
      appendJournal(result.ok ? 'import-commit' : 'import-failed', { sourceBuild:pack.buildCode, importedSchema:pack.saveSchema, ok:result.ok, reason:result.reason });
      return { ok:result.ok, reason:result.reason, state:result.state, package:pack };
    }

    function removeAll(){
      [activeKey, tmpKey, emergencyKey, journalKey, ...Array.from({length:backupCount}, (_, index) => backupKey(index + 1))].forEach(safeRemove);
    }

    return Object.freeze({
      activeKey, legacyKeys:legacyKeys.slice(), format:FORMAT, legacyFormat:FORMAT_V1, exportFormat:EXPORT_FORMAT, journalFormat:JOURNAL_FORMAT,
      schema, backupCount, load, save, inspect, removeAll, decode, checksum, stableStringify, recover, verify, createPortableExport, importPortable, createEnvelope
    });
  }

  core.persistence = Object.freeze({ FORMAT, FORMAT_V1, EXPORT_FORMAT, JOURNAL_FORMAT, checksum, stableStringify, createRepository, validateEnvelope, parsePortable });
})();
