(() => {
  'use strict';
  const root = globalThis;
  const CORE = root.F1M_CORE = root.F1M_CORE || {};
  const arr = v => Array.isArray(v) ? v : [];
  const clamp = n => Math.max(0, Math.min(100, Math.round(Number(n)||0)));
  const nowIso = () => new Date().toISOString();

  function initializeState(state = {}, context = {}){
    state.publicBetaAssets = state.publicBetaAssets || {};
    state.publicBetaAssets.schema = 1;
    state.publicBetaAssets.phase = 23;
    state.publicBetaAssets.lastBuild = context.buildCode || 'dev';
    state.publicBetaAssets.evidence = arr(state.publicBetaAssets.evidence);
    state.publicBetaAssets.previewChecks = arr(state.publicBetaAssets.previewChecks);
    state.publicBetaAssets.auditHistory = arr(state.publicBetaAssets.auditHistory);
    return state;
  }

  function status(state = {}, context = {}){
    const data = context.data || root.F1M_PUBLIC_BETA_ASSETS_DATA || {};
    const catalog = context.catalog || root.F1M_ASSET_CATALOG || [];
    initializeState(state, context);
    const groupCount = arr(data.requiredAssetGroups).length;
    const workflowCount = arr(data.restoreWorkflow).length;
    const previewCount = arr(data.previewTargets).length;
    const evidenceCount = arr(state.publicBetaAssets.evidence).length;
    const cataloguedPaths = arr(catalog).length || Number(context.cataloguedPaths || 0);
    const score = clamp(35 + groupCount*6 + workflowCount*3 + previewCount*4 + Math.min(12,evidenceCount*2));
    return { score, channel:data.channel || 'public-beta-assets-real', groupCount, workflowCount, previewCount, evidenceCount, cataloguedPaths, betaReady:evidenceCount>=3, productionBlocked:true };
  }

  function registerEvidence(state = {}, item = {}, context = {}){
    initializeState(state, context);
    const evidence = { id:item.id || `f23-evidence-${Date.now()}`, label:item.label || item.id || 'evidência beta assets', status:item.status || 'manual-check', screen:item.screen || 'n/d', generatedAt:nowIso(), buildCode:context.buildCode || 'dev' };
    state.publicBetaAssets.evidence.unshift(evidence);
    state.publicBetaAssets.evidence = state.publicBetaAssets.evidence.slice(0, 30);
    return evidence;
  }

  function previewPlan(state = {}, context = {}){
    const data = context.data || root.F1M_PUBLIC_BETA_ASSETS_DATA || {};
    initializeState(state, context);
    return {
      id:'F23-PUBLIC-BETA-ASSETS-PLAN',
      buildCode:context.buildCode || 'dev',
      generatedAt:nowIso(),
      restoreWorkflow:arr(data.restoreWorkflow),
      previewTargets:arr(data.previewTargets),
      requiredAssetGroups:arr(data.requiredAssetGroups),
      evidenceChecklist:arr(data.evidenceChecklist),
      productionBlocked:true,
      publicBetaAllowed:'manual-after-preview-and-assets-real'
    };
  }

  function audit(context = {}){
    const data = context.data || root.F1M_PUBLIC_BETA_ASSETS_DATA || {};
    const state = initializeState(context.state || {}, context);
    const targets = data.auditTargets || {};
    const checks = [];
    const add = (id, ok, detail='') => checks.push({ id, ok:Boolean(ok), detail });
    const st = status(state, { ...context, data });
    add('phase', Number(data.phase) === 23, String(data.phase));
    add('schema', Number(data.schema || 0) >= 1, 'schema '+data.schema);
    add('asset-groups', arr(data.requiredAssetGroups).length >= Number(targets.minGroups || 5), String(arr(data.requiredAssetGroups).length));
    add('restore-workflow', arr(data.restoreWorkflow).length >= Number(targets.minWorkflow || 8), String(arr(data.restoreWorkflow).length));
    add('preview-targets', arr(data.previewTargets).length >= Number(targets.minPreviewTargets || 6), String(arr(data.previewTargets).length));
    add('evidence-checklist', arr(data.evidenceChecklist).length >= Number(targets.minEvidence || 8), String(arr(data.evidenceChecklist).length));
    add('gate-rules', arr(data.gateRules).length >= Number(targets.minGateRules || 5), String(arr(data.gateRules).length));
    add('critical-paths', arr(data.requiredAssetGroups).some(g=>arr(g.examples).includes('assets/backgrounds/ui/global_lobby.png')) && arr(data.requiredAssetGroups).some(g=>arr(g.examples).includes('assets/icons/app/icon-512.png')), 'global_lobby + icon-512');
    add('production-blocked', st.productionBlocked === true, 'produção bloqueada por segurança');
    const passed = checks.filter(c=>c.ok).length;
    const failed = checks.length - passed;
    const score = failed ? clamp((passed / checks.length) * 100) : 100;
    const result = { score, passed, failed, checks, status:st, generatedAt:nowIso() };
    state.publicBetaAssets.auditHistory.unshift(result);
    state.publicBetaAssets.auditHistory = state.publicBetaAssets.auditHistory.slice(0, 10);
    state.publicBetaAssets.lastAuditAt = result.generatedAt;
    state.quality = state.quality || {};
    state.quality.publicBetaAssetsF23 = { status: failed ? 'review' : 'approved', score, passed, failed, generatedAt:result.generatedAt, checks };
    return result;
  }

  function createPublicBetaAssetsSystem(options = {}){
    const data = options.data || root.F1M_PUBLIC_BETA_ASSETS_DATA || {};
    return {
      initializeState:(state, context={})=>initializeState(state, { ...context, data }),
      status:(state, context={})=>status(state, { ...context, data }),
      registerEvidence:(state, item, context={})=>registerEvidence(state, item, { ...context, data }),
      previewPlan:(state, context={})=>previewPlan(state, { ...context, data }),
      audit:(context={})=>audit({ ...context, data }),
      data
    };
  }

  CORE.publicBetaAssets = { createPublicBetaAssetsSystem };
})();
