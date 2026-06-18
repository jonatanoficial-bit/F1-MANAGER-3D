(() => {
  'use strict';
  const root = globalThis;
  const core = root.F1M_CORE = root.F1M_CORE || {};

  function safeJson(raw, fallback){
    try { return JSON.parse(raw); }
    catch (_) { return fallback; }
  }

  function createGuard(options = {}){
    const storageKey = String(options.storageKey || 'f1m_runtime_errors');
    const maxEntries = Math.max(5, Number(options.maxEntries || 30));
    const buildCode = String(options.buildCode || 'dev');
    let memoryEntries = [];

    function read(){
      try {
        const value = safeJson(localStorage.getItem(storageKey) || '[]', []);
        return Array.isArray(value) ? value : [];
      } catch (_) { return memoryEntries.slice(); }
    }

    function write(entries){
      const trimmed = entries.slice(0, maxEntries);
      memoryEntries = trimmed;
      try { localStorage.setItem(storageKey, JSON.stringify(trimmed)); }
      catch (_) {}
      return trimmed;
    }

    function capture(error, context = 'runtime', severity = 'error'){
      const entry = {
        at:new Date().toISOString(),
        context:String(context),
        severity:String(severity),
        message:String(error?.message || error || 'erro desconhecido'),
        stack:String(error?.stack || '').slice(0, 2400),
        build:buildCode
      };
      const entries = read();
      const duplicate = entries[0] && entries[0].context === entry.context && entries[0].message === entry.message;
      if(duplicate) entries[0] = {...entries[0], at:entry.at, repeats:Number(entries[0].repeats || 1) + 1};
      else entries.unshift(entry);
      write(entries);
      return entry;
    }

    function list(){ return read(); }
    function clear(){ write([]); }
    function count(){ return read().length; }
    function run(label, fn, fallback = null){
      try { return fn(); }
      catch (error) { capture(error, label); return fallback; }
    }
    async function runAsync(label, fn, fallback = null){
      try { return await fn(); }
      catch (error) { capture(error, label); return fallback; }
    }

    return Object.freeze({ capture, list, clear, count, run, runAsync, storageKey });
  }

  function storageProbe(){
    const key = `__f1m_probe_${Date.now()}`;
    try {
      localStorage.setItem(key, '1');
      const ok = localStorage.getItem(key) === '1';
      localStorage.removeItem(key);
      return { ok, detail:ok ? 'leitura e escrita disponíveis' : 'leitura divergente' };
    } catch (error) { return { ok:false, detail:String(error?.message || error) }; }
  }

  function eventScope(){
    const cleanups = [];
    return Object.freeze({
      listen(target, type, handler, options){
        if(!target?.addEventListener) return () => {};
        target.addEventListener(type, handler, options);
        const cleanup = () => target.removeEventListener(type, handler, options);
        cleanups.push(cleanup);
        return cleanup;
      },
      clear(){ while(cleanups.length){ try { cleanups.pop()(); } catch (_) {} } },
      size(){ return cleanups.length; }
    });
  }

  core.runtime = Object.freeze({ createGuard, storageProbe, eventScope });
})();
