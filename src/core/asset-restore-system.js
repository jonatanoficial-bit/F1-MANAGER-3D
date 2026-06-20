(() => {
  'use strict';
  const root = globalThis;
  const core = root.F1M_CORE = root.F1M_CORE || {};
  const arr = value => Array.isArray(value) ? value : [];
  const nowIso = () => new Date().toISOString();
  const clamp = (n, min=0, max=100) => Math.max(min, Math.min(max, Number(n) || 0));
  const unique = list => [...new Set(arr(list).filter(Boolean).map(String))];

  function catalogue(context = {}){
    return context.catalog || root.F1M_ASSET_CATALOG || { entries:[], counts:{} };
  }

  function initializeState(state = {}, context = {}){
    const data = context.data || root.F1M_ASSET_RESTORE_DATA || {};
    state.assetRestore = state.assetRestore || {};
    state.assetRestore = {
      dataPack: data.dataPack || 'asset-restore-preview',
      channel: data.channel || 'public-beta-assets-restore',
      productionBlocked: true,
      previewChecks: Array.isArray(state.assetRestore?.previewChecks) ? state.assetRestore.previewChecks.slice(0, 20) : [],
      restorePlans: Array.isArray(state.assetRestore?.restorePlans) ? state.assetRestore.restorePlans.slice(0, 10) : [],
      manualEvidence: Array.isArray(state.assetRestore?.manualEvidence) ? state.assetRestore.manualEvidence.slice(0, 20) : [],
      lastAuditAt: state.assetRestore?.lastAuditAt || null,
      lastPlanAt: state.assetRestore?.lastPlanAt || null,
      lastPreviewAt: state.assetRestore?.lastPreviewAt || null,
      migratedBy: String(context.buildCode || state.assetRestore?.migratedBy || 'dev'),
      updatedAt: nowIso()
    };
    state.quality = state.quality || {};
    state.quality.assetRestoreF21 = state.quality.assetRestoreF21 || { status:'not-run', score:null, migratedBy:String(context.buildCode || 'dev') };
    return state;
  }

  function buildPlan(state = {}, context = {}){
    const data = context.data || root.F1M_ASSET_RESTORE_DATA || {};
    const catalog = catalogue(context);
    initializeState(state, context);
    const entries = arr(catalog.entries);
    const required = entries.filter(e => e.required || e.referenced).map(e => e.path);
    const samplePaths = unique([...arr(data.requiredRuntimeSamples), ...required.slice(0, 16)]);
    const docs = arr(data.auditTargets?.requiredDocs);
    const knownMissing = arr(data.missingKnownFromOriginal);
    const plan = {
      id:`F1M3D-F21-ASSETS-${Date.now().toString(36).toUpperCase()}`,
      buildCode:String(context.buildCode || 'dev'),
      generatedAt:nowIso(),
      channel:data.channel || 'public-beta-assets-restore',
      policy:data.deliveryPolicy || {},
      requiredDocs:docs,
      restoreSteps:arr(data.restoreChecklist),
      samplePaths,
      knownMissing,
      catalogCounts:catalog.counts || {},
      productionAllowed:false,
      blocker:'produção bloqueada até assets reais restaurados, preview validado e revisão jurídica concluída'
    };
    state.assetRestore.restorePlans.unshift(plan);
    state.assetRestore.restorePlans = state.assetRestore.restorePlans.slice(0, 10);
    state.assetRestore.lastPlanAt = plan.generatedAt;
    return plan;
  }

  function previewHealth(state = {}, context = {}){
    const data = context.data || root.F1M_ASSET_RESTORE_DATA || {};
    const catalog = catalogue(context);
    initializeState(state, context);
    const counts = catalog.counts || {};
    const expected = arr(data.previewTargets).map(target => ({
      id:target.id,
      label:target.label,
      expected:arr(target.expected),
      status:'needs-manual-preview',
      ok:false
    }));
    const runtimeSamples = arr(data.requiredRuntimeSamples).map(path => ({ path, status:'needs-physical-asset-check' }));
    const health = {
      generatedAt:nowIso(),
      buildCode:String(context.buildCode || 'dev'),
      originalBinaryFiles:Number(counts.original_binary_files || 0),
      cataloguedPaths:Number(counts.all_catalogued_paths || counts.catalogue_entries || 0),
      runtimeReferenced:Number(counts.runtime_referenced_paths || 0),
      missingKnown:arr(data.missingKnownFromOriginal).length,
      previewTargets:expected,
      runtimeSamples,
      productionAllowed:false
    };
    state.assetRestore.previewChecks.unshift(health);
    state.assetRestore.previewChecks = state.assetRestore.previewChecks.slice(0, 20);
    state.assetRestore.lastPreviewAt = health.generatedAt;
    return health;
  }

  function status(state = {}, context = {}){
    const data = context.data || root.F1M_ASSET_RESTORE_DATA || {};
    const catalog = catalogue(context);
    initializeState(state, context);
    const counts = catalog.counts || {};
    const docs = arr(data.auditTargets?.requiredDocs).length;
    const steps = arr(data.restoreChecklist).length;
    const samples = arr(data.requiredRuntimeSamples).length;
    const previews = arr(data.previewTargets).length;
    const knownMissing = arr(data.missingKnownFromOriginal).length;
    const plans = arr(state.assetRestore.restorePlans).length;
    const score = clamp(35 + Math.min(25, steps*2) + Math.min(20, samples*2) + previews*4 + docs*3 - knownMissing*2 + plans*2);
    return {
      score,
      channel:data.channel || 'public-beta-assets-restore',
      cataloguedPaths:Number(counts.all_catalogued_paths || counts.catalogue_entries || 0),
      originalBinaryFiles:Number(counts.original_binary_files || 0),
      runtimeReferenced:Number(counts.runtime_referenced_paths || 0),
      restoreSteps:steps,
      samplePaths:samples,
      previewTargets:previews,
      knownMissing,
      productionBlocked:true,
      plans
    };
  }

  function audit(context = {}){
    const data = context.data || root.F1M_ASSET_RESTORE_DATA || {};
    const state = initializeState(context.state || {}, { ...context, data });
    const catalog = catalogue(context);
    const target = data.auditTargets || {};
    const checks = [];
    const add = (id, ok, detail='') => checks.push({ id, ok:Boolean(ok), detail });
    const counts = catalog.counts || {};
    add('schema', Number(data.schema || 0) >= 1, 'schema '+data.schema);
    add('phase', Number(data.phase) === 21, String(data.phase));
    add('zip-policy', data.deliveryPolicy?.zipKeepsBinariesOut === true, 'sem binários no ZIP de fase');
    add('asset-docs-only-policy', arr(data.deliveryPolicy?.allowedAssetFilesInPhaseZip).length === 3, arr(data.deliveryPolicy?.allowedAssetFilesInPhaseZip).join(','));
    add('catalogue-count', Number(counts.all_catalogued_paths || counts.catalogue_entries || 0) >= 519, String(counts.all_catalogued_paths || counts.catalogue_entries || 0));
    add('original-binaries-count', Number(counts.original_binary_files || 0) >= 416, String(counts.original_binary_files || 0));
    add('restore-checklist', arr(data.restoreChecklist).length >= Number(target.minRestoreChecklist || 12), String(arr(data.restoreChecklist).length));
    add('preview-targets', arr(data.previewTargets).length >= Number(target.minPreviewTargets || 5), String(arr(data.previewTargets).length));
    add('runtime-samples', arr(data.requiredRuntimeSamples).length >= Number(target.minRuntimeSamples || 10), String(arr(data.requiredRuntimeSamples).length));
    add('known-missing', arr(data.missingKnownFromOriginal).length >= Number(target.minKnownMissing || 7), String(arr(data.missingKnownFromOriginal).length));
    add('required-docs', arr(target.requiredDocs).includes('docs/ASSET_RESTORE_GUIDE_F21.md'), arr(target.requiredDocs).join(','));
    add('systems-covered', arr(target.requiredSystems).length >= 10, String(arr(target.requiredSystems).length));
    const plan = buildPlan(state, { ...context, data, catalog });
    add('plan-generated', Boolean(plan.id) && plan.restoreSteps.length >= 12 && plan.samplePaths.length >= 10 && plan.productionAllowed === false, plan.id || 'sem plano');
    const health = previewHealth(state, { ...context, data, catalog });
    add('preview-health', health.previewTargets.length >= 5 && health.productionAllowed === false, String(health.previewTargets.length));
    const st = status(state, { ...context, data, catalog });
    add('status-score', st.score >= 90 && st.productionBlocked === true, `${st.score}/100`);
    const passed = checks.filter(c=>c.ok).length;
    const failed = checks.length - passed;
    const score = failed ? clamp(Math.round((passed/checks.length)*100)) : 100;
    state.assetRestore.lastAuditAt = nowIso();
    state.quality = state.quality || {};
    state.quality.assetRestoreF21 = { status: failed ? 'review' : 'approved', score, passed, failed, generatedAt:nowIso(), checks };
    return { score, passed, failed, checks, status:st, generatedAt:nowIso() };
  }

  function createAssetRestoreSystem(options = {}){
    const data = options.data || root.F1M_ASSET_RESTORE_DATA || {};
    const catalog = options.catalog || root.F1M_ASSET_CATALOG || { entries:[], counts:{} };
    return {
      initializeState:(state, context={})=>initializeState(state, { ...context, data, catalog }),
      status:(state, context={})=>status(state, { ...context, data, catalog }),
      audit:(context={})=>audit({ ...context, data, catalog }),
      buildPlan:(state, context={})=>buildPlan(state, { ...context, data, catalog }),
      previewHealth:(state, context={})=>previewHealth(state, { ...context, data, catalog })
    };
  }

  core.assetRestore = Object.freeze({ createAssetRestoreSystem, audit });
})();
