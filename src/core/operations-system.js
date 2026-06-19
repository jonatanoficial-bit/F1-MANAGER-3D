(() => {
  'use strict';
  const root = globalThis;
  const core = root.F1M_CORE = root.F1M_CORE || {};
  const arr = value => Array.isArray(value) ? value : [];
  const nowIso = () => new Date().toISOString();
  const clamp = (n, min=0, max=100) => Math.max(min, Math.min(max, Number(n) || 0));
  const safeText = value => String(value ?? '').replace(/(api[_-]?key|token|password|senha|bearer)\s*[:=]\s*[^\s]+/gi, '$1=[redacted]').slice(0, 1200);

  function initializeState(state = {}, context = {}){
    const data = context.data || root.F1M_OPERATIONS_DATA || {};
    state.operations = state.operations || {};
    state.operations = {
      dataPack: data.dataPack || 'beta-ops',
      channel: data.channel || 'public-beta-ops',
      productionBlocked: true,
      feedbackQueue: Array.isArray(state.operations?.feedbackQueue) ? state.operations.feedbackQueue.slice(0, data.feedback?.maxLocalItems || 30) : [],
      crashBuckets: state.operations?.crashBuckets || {},
      hotfixPlans: Array.isArray(state.operations?.hotfixPlans) ? state.operations.hotfixPlans.slice(0, 10) : [],
      lastAuditAt: state.operations?.lastAuditAt || null,
      lastFeedbackAt: state.operations?.lastFeedbackAt || null,
      lastHotfixAt: state.operations?.lastHotfixAt || null,
      migratedBy: String(context.buildCode || state.operations?.migratedBy || 'dev'),
      updatedAt: nowIso()
    };
    state.quality = state.quality || {};
    state.quality.operationsF20 = state.quality.operationsF20 || { status:'not-run', score:null, migratedBy:String(context.buildCode || 'dev') };
    return state;
  }

  function status(state = {}, context = {}){
    const data = context.data || root.F1M_OPERATIONS_DATA || {};
    initializeState(state, context);
    const feedbackCount = arr(state.operations.feedbackQueue).length;
    const critical = arr(state.operations.feedbackQueue).filter(item => item.severity === 'critical').length;
    const high = arr(state.operations.feedbackQueue).filter(item => item.severity === 'high').length;
    const devices = arr(data.deviceMatrix).length;
    const checklist = arr(data.betaOpsChecklist).length;
    const evidence = arr(data.manualEvidence).length;
    const score = clamp(30 + devices*6 + checklist*3 + evidence*3 - critical*18 - high*5 + Math.min(feedbackCount, 8)*2);
    return {
      score,
      channel:data.channel || 'public-beta-ops',
      feedbackCount,
      critical,
      high,
      devices,
      checklist,
      evidence,
      productionBlocked:true,
      hotfixPlans:arr(state.operations.hotfixPlans).length
    };
  }

  function addFeedback(state = {}, payload = {}, context = {}){
    const data = context.data || root.F1M_OPERATIONS_DATA || {};
    initializeState(state, context);
    const categories = arr(data.feedback?.categories);
    const severities = arr(data.feedback?.severities);
    const item = {
      id:`FB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`,
      createdAt:nowIso(),
      buildCode:String(context.buildCode || payload.buildCode || 'dev'),
      category:categories.includes(payload.category) ? payload.category : 'bug',
      severity:severities.includes(payload.severity) ? payload.severity : 'medium',
      screen:safeText(payload.screen || 'system'),
      description:safeText(payload.description || 'Feedback beta sem descrição detalhada.'),
      device:safeText(payload.device || 'manual'),
      language:safeText(payload.language || 'pt-BR'),
      status:'new'
    };
    state.operations.feedbackQueue.unshift(item);
    state.operations.feedbackQueue = state.operations.feedbackQueue.slice(0, Number(data.feedback?.maxLocalItems || 30));
    state.operations.lastFeedbackAt = item.createdAt;
    return item;
  }

  function triage(state = {}, context = {}){
    const data = context.data || root.F1M_OPERATIONS_DATA || {};
    initializeState(state, context);
    const priorities = data.crashTriage?.priorities || {};
    const buckets = {};
    for(const item of arr(state.operations.feedbackQueue)){
      const bucket = item.category === 'missing-asset' ? 'asset-missing' : item.category === 'mobile-scroll' ? 'mobile-viewport' : item.category === 'performance' ? 'pwa-cache' : item.category || 'unknown';
      buckets[bucket] = buckets[bucket] || { count:0, priority:0, critical:0, high:0, items:[] };
      buckets[bucket].count += 1;
      buckets[bucket].priority += Number(priorities[item.severity] || 25);
      if(item.severity === 'critical') buckets[bucket].critical += 1;
      if(item.severity === 'high') buckets[bucket].high += 1;
      buckets[bucket].items.push(item.id);
    }
    state.operations.crashBuckets = buckets;
    return { generatedAt:nowIso(), buckets, total:arr(state.operations.feedbackQueue).length };
  }

  function prepareHotfixPlan(state = {}, context = {}){
    const data = context.data || root.F1M_OPERATIONS_DATA || {};
    initializeState(state, context);
    const triageResult = triage(state, context);
    const unresolvedCritical = Object.values(triageResult.buckets).reduce((sum,b)=>sum + (b.critical || 0), 0);
    const unresolvedHigh = Object.values(triageResult.buckets).reduce((sum,b)=>sum + (b.high || 0), 0);
    const blockers = [];
    if(unresolvedCritical > Number(data.hotfix?.maxUnresolvedCritical ?? 0)) blockers.push('existem críticos pendentes');
    if(unresolvedHigh > Number(data.hotfix?.maxUnresolvedHighForBeta ?? 2)) blockers.push('excesso de severidade alta para beta público');
    blockers.push('produção continua bloqueada até homologação física e revisão jurídica');
    const plan = {
      id:`F1M3D-F20-HOTFIX-${Date.now().toString(36).toUpperCase()}`,
      buildCode:String(context.buildCode || 'dev'),
      generatedAt:nowIso(),
      channel:data.channel || 'public-beta-ops',
      artifacts:arr(data.hotfix?.requiredArtifacts),
      gates:arr(data.hotfix?.gates),
      rollbackSchemas:arr(data.hotfix?.rollbackSchemas),
      triage:triageResult,
      blockers,
      productionAllowed:false
    };
    state.operations.hotfixPlans.unshift(plan);
    state.operations.hotfixPlans = state.operations.hotfixPlans.slice(0, 10);
    state.operations.lastHotfixAt = plan.generatedAt;
    return plan;
  }

  function audit(context = {}){
    const data = context.data || root.F1M_OPERATIONS_DATA || {};
    const state = initializeState(context.state || {}, { ...context, data });
    const target = data.auditTargets || {};
    const checks = [];
    const add = (id, ok, detail='') => checks.push({ id, ok:Boolean(ok), detail });
    const categories = arr(data.feedback?.categories);
    const devices = arr(data.deviceMatrix);
    const checklist = arr(data.betaOpsChecklist);
    const artifacts = arr(data.hotfix?.requiredArtifacts);
    const evidence = arr(data.manualEvidence);
    const systems = arr(target.requiredSystems);
    add('schema', Number(data.schema || 0) >= 1, 'schema '+data.schema);
    add('channel', data.channel === 'public-beta-ops', data.channel || 'n/d');
    add('feedback-categories', categories.length >= Number(target.minFeedbackCategories || 8), String(categories.length));
    add('redaction', arr(data.feedback?.redaction).length >= 5, arr(data.feedback?.redaction).join(','));
    add('device-matrix', devices.length >= Number(target.minDeviceMatrix || 5), String(devices.length));
    add('checklist', checklist.length >= Number(target.minChecklist || 8), String(checklist.length));
    add('hotfix-artifacts', artifacts.length >= Number(target.minHotfixArtifacts || 5), artifacts.join(', '));
    add('hotfix-gates', arr(data.hotfix?.gates).length >= 6, String(arr(data.hotfix?.gates).length));
    add('rollback-schemas', arr(data.hotfix?.rollbackSchemas).includes(20), arr(data.hotfix?.rollbackSchemas).join(','));
    add('manual-evidence', evidence.length >= Number(target.minManualEvidence || 7), String(evidence.length));
    add('systems-covered', systems.length >= 10, String(systems.length));
    const sample = addFeedback(state, { category:'mobile-scroll', severity:'high', screen:'Criar Carreira', description:'Amostra de auditoria F20 sem token=secret', device:'audit', language:'pt-BR' }, { ...context, data });
    add('feedback-redacted', !sample.description.includes('secret'), sample.description);
    const hotfix = prepareHotfixPlan(state, { ...context, data });
    add('hotfix-plan', Boolean(hotfix.id) && hotfix.productionAllowed === false && hotfix.artifacts.length >= 5, hotfix.id || 'sem plano');
    const passed = checks.filter(c=>c.ok).length;
    const failed = checks.length - passed;
    const score = failed ? clamp(Math.round((passed/checks.length)*100)) : 100;
    state.operations.lastAuditAt = nowIso();
    state.quality = state.quality || {};
    state.quality.operationsF20 = { status: failed ? 'review' : 'approved', score, passed, failed, generatedAt:nowIso() };
    return { score, passed, failed, checks, status:status(state, { ...context, data }), generatedAt:nowIso() };
  }

  function createOperationsSystem(options = {}){
    const data = options.data || root.F1M_OPERATIONS_DATA || {};
    return {
      initializeState:(state, context={})=>initializeState(state, { ...context, data }),
      status:(state, context={})=>status(state, { ...context, data }),
      audit:(context={})=>audit({ ...context, data }),
      addFeedback:(state, payload={}, context={})=>addFeedback(state, payload, { ...context, data }),
      triage:(state, context={})=>triage(state, { ...context, data }),
      prepareHotfixPlan:(state, context={})=>prepareHotfixPlan(state, { ...context, data })
    };
  }

  core.operations = Object.freeze({ createOperationsSystem, audit });
})();
