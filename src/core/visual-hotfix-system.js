(() => {
  'use strict';
  const root = globalThis;
  const CORE = root.F1M_CORE = root.F1M_CORE || {};
  const arr = v => Array.isArray(v) ? v : [];
  const clamp = n => Math.max(0, Math.min(100, Math.round(Number(n)||0)));
  const nowIso = () => new Date().toISOString();

  function initializeState(state = {}, context = {}){
    state.visualHotfix = state.visualHotfix || {};
    state.visualHotfix.schema = 1;
    state.visualHotfix.phase = 22;
    state.visualHotfix.lastBuild = context.buildCode || 'dev';
    state.visualHotfix.evidence = arr(state.visualHotfix.evidence);
    state.visualHotfix.auditHistory = arr(state.visualHotfix.auditHistory);
    return state;
  }

  function status(state = {}, context = {}){
    const data = context.data || root.F1M_VISUAL_HOTFIX_DATA || {};
    initializeState(state, context);
    const screenCount = arr(data.criticalScreens).length;
    const scrollCount = arr(data.scrollContracts).length;
    const backgrounds = arr(data.assetBackgrounds).length;
    const rules = arr(data.legibilityRules).length;
    const evidence = arr(state.visualHotfix.evidence).length;
    const score = clamp(38 + screenCount*3 + scrollCount*3 + backgrounds*2 + rules*2 + Math.min(12,evidence*2));
    return { score, channel:data.channel || 'public-beta-visual-hotfix', screenCount, scrollCount, backgrounds, rules, evidence, productionBlocked:true };
  }

  function recordEvidence(state = {}, item = {}, context = {}){
    initializeState(state, context);
    const evidence = { id:item.id || `evidence-${Date.now()}`, label:item.label || item.id || 'evidência', status:item.status || 'manual-check', generatedAt:nowIso(), buildCode:context.buildCode || 'dev' };
    state.visualHotfix.evidence.unshift(evidence);
    state.visualHotfix.evidence = state.visualHotfix.evidence.slice(0, 20);
    return evidence;
  }

  function applyHotfixes(documentRef = root.document, context = {}){
    const data = context.data || root.F1M_VISUAL_HOTFIX_DATA || {};
    if(!documentRef) return { applied:false, reason:'document indisponível' };
    const html = documentRef.documentElement;
    html.dataset.visualHotfix = 'F22';
    arr(data.assetBackgrounds).forEach(bg => {
      if(!bg.selector || !bg.path) return;
      documentRef.querySelectorAll(bg.selector).forEach(el => {
        if(el.classList && el.classList.contains('asset-bg')){
          el.dataset.bg = bg.path;
          el.style.setProperty('--asset-bg-path', `url("${bg.path}")`);
        }
      });
    });
    documentRef.querySelectorAll('[data-asset-src]').forEach(el => {
      const path = el.getAttribute('data-asset-src');
      if(path && !el.getAttribute('data-asset-path-visible')) el.setAttribute('data-asset-path-visible', path);
    });
    return { applied:true, backgrounds:arr(data.assetBackgrounds).length, generatedAt:nowIso() };
  }

  function audit(context = {}){
    const data = context.data || root.F1M_VISUAL_HOTFIX_DATA || {};
    const state = initializeState(context.state || {}, context);
    const checks = [];
    const add = (id, ok, detail='') => checks.push({ id, ok:Boolean(ok), detail });
    const targets = data.auditTargets || {};
    add('phase', Number(data.phase) === 22, String(data.phase));
    add('schema', Number(data.schema || 0) >= 1, 'schema '+data.schema);
    add('critical-screens', arr(data.criticalScreens).length >= Number(targets.minScreens || 9), String(arr(data.criticalScreens).length));
    add('scroll-contracts', arr(data.scrollContracts).length >= Number(targets.minScrollContracts || 8), String(arr(data.scrollContracts).length));
    add('backgrounds', arr(data.assetBackgrounds).length >= Number(targets.minBackgrounds || 8), String(arr(data.assetBackgrounds).length));
    add('legibility', arr(data.legibilityRules).length >= Number(targets.minLegibilityRules || 6), String(arr(data.legibilityRules).length));
    add('beta-checklist', arr(data.betaPublicChecklist).length >= Number(targets.minChecklist || 8), String(arr(data.betaPublicChecklist).length));
    add('evidence-targets', arr(data.requiredEvidence).length >= Number(targets.minEvidence || 6), String(arr(data.requiredEvidence).length));
    add('production-blocked', status(state, { ...context, data }).productionBlocked === true, 'produção bloqueada até validação manual');
    const passed = checks.filter(c=>c.ok).length;
    const failed = checks.length - passed;
    const score = failed ? clamp((passed / checks.length) * 100) : 100;
    const result = { score, passed, failed, checks, status:status(state,{...context,data}), generatedAt:nowIso() };
    state.visualHotfix.auditHistory.unshift(result);
    state.visualHotfix.auditHistory = state.visualHotfix.auditHistory.slice(0, 10);
    state.visualHotfix.lastAuditAt = result.generatedAt;
    state.quality = state.quality || {};
    state.quality.visualHotfixF22 = { status: failed ? 'review' : 'approved', score, passed, failed, generatedAt:result.generatedAt, checks };
    return result;
  }

  function createVisualHotfixSystem(options = {}){
    const data = options.data || root.F1M_VISUAL_HOTFIX_DATA || {};
    return {
      initializeState:(state, context={})=>initializeState(state, { ...context, data }),
      status:(state, context={})=>status(state, { ...context, data }),
      audit:(context={})=>audit({ ...context, data }),
      recordEvidence:(state, item, context={})=>recordEvidence(state, item, { ...context, data }),
      applyHotfixes:(documentRef, context={})=>applyHotfixes(documentRef, { ...context, data }),
      data
    };
  }

  CORE.visualHotfix = { createVisualHotfixSystem };
})();
