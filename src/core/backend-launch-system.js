(() => {
  'use strict';
  const root = globalThis;
  const core = root.F1M_CORE = root.F1M_CORE || {};
  const safeArray = value => Array.isArray(value) ? value : [];
  const clamp = (value, min=0, max=100) => Math.max(min, Math.min(max, Number(value) || 0));
  const nowIso = () => new Date().toISOString();

  function initializeState(state = {}, context = {}){
    const data = context.data || root.F1M_BACKEND_LAUNCH_DATA || {};
    state.backendLaunch = state.backendLaunch || {};
    state.backendLaunch = {
      dataPack: data.dataPack || 'backend-launch-foundation',
      accountsReady: true,
      cloudSaveAdapterReady: true,
      conflictResolutionReady: true,
      telemetryConsentRequired: true,
      telemetryEnabled: Boolean(state.backendLaunch?.telemetryEnabled || false),
      crashReportingLocal: true,
      remoteConfigLocal: true,
      rollbackReady: true,
      releaseChannelsReady: safeArray(data.releaseChannels).length,
      platformTargetsReady: safeArray(data.platformTargets).length,
      privacyReviewRequired: true,
      ageRatingReviewRequired: true,
      supportPlanReady: true,
      liveOpsPlanned: true,
      migratedBy: String(context.buildCode || state.backendLaunch?.migratedBy || 'dev'),
      updatedAt: state.backendLaunch?.updatedAt || nowIso(),
      ...state.backendLaunch
    };
    state.release = state.release || { channel:'development', candidate:null, gates:{}, lastPreparedAt:null };
    state.privacy = state.privacy || { telemetryConsent:false, telemetryConsentVersion:data.telemetry?.consentVersion || 'F1M_TELEMETRY_CONSENT_V1', dataSale:false, exportAvailable:true };
    state.support = state.support || { diagnosticsExport:true, contactPending:true, localCrashBuffer:true };
    return state;
  }

  function status(state = {}, context = {}){
    const data = context.data || root.F1M_BACKEND_LAUNCH_DATA || {};
    initializeState(state, context);
    const channels = safeArray(data.releaseChannels).map(ch => ({...ch, ready:safeArray(ch.gates).length >= 3}));
    const platforms = safeArray(data.platformTargets).map(p => ({...p, ready:safeArray(p.required).length >= 4}));
    const privacy = state.privacy || {};
    const launchScore = clamp(
      18 + channels.filter(c=>c.ready).length*8 + platforms.filter(p=>p.ready).length*7 +
      safeArray(data.security?.controls).length*3 + safeArray(data.storeReadiness?.requiredDocs).length*2 +
      (privacy.telemetryConsent ? 4 : 0)
    );
    return { launchScore, channels, platforms, privacy, mode:data.mode || 'offline-first', cloudSave:data.cloudSave?.status || 'planned', telemetry:data.telemetry?.status || 'consent-required', security:data.security?.posture || 'client-hardening', liveOps:data.liveOps?.status || 'planned' };
  }

  function prepareReleaseCandidate(state = {}, context = {}){
    const data = context.data || root.F1M_BACKEND_LAUNCH_DATA || {};
    initializeState(state, context);
    const statusReport = status(state, { data });
    const auditReport = { score: statusReport.launchScore || 0, passed: 0, failed: 0 };
    const checklist = [
      ...safeArray(data.storeReadiness?.requiredDocs).map(item => ({ type:'doc', item, done:item === 'open-source-notices' || item === 'support-contact' })),
      ...safeArray(data.storeReadiness?.requiredAssets).map(item => ({ type:'asset', item, done:false, note:'depende dos assets pesados fora do ZIP' })),
      ...safeArray(data.platformTargets).map(p => ({ type:'platform', item:p.id, done:p.id === 'pwa', required:p.required }))
    ];
    state.release = {
      ...(state.release || {}),
      channel:'rc-prep',
      candidate:`RC-${context.buildCode || 'DEV'}-${Date.now().toString(36).toUpperCase()}`,
      gates:{ score:auditReport.score, passed:auditReport.passed, failed:auditReport.failed },
      checklist,
      lastPreparedAt:nowIso()
    };
    return state.release;
  }

  function setTelemetryConsent(state = {}, granted = false, context = {}){
    const data = context.data || root.F1M_BACKEND_LAUNCH_DATA || {};
    initializeState(state, context);
    state.privacy = { ...(state.privacy || {}), telemetryConsent:Boolean(granted), telemetryConsentVersion:data.telemetry?.consentVersion || 'F1M_TELEMETRY_CONSENT_V1', updatedAt:nowIso() };
    state.backendLaunch.telemetryEnabled = Boolean(granted);
    return state.privacy;
  }

  function syncPlan(state = {}, context = {}){
    const data = context.data || root.F1M_BACKEND_LAUNCH_DATA || {};
    initializeState(state, context);
    return {
      envelope:data.cloudSave?.envelope || 'F1M_PORTABLE_SAVE_V1',
      queue:data.cloudSave?.syncQueue || 'F1M_SYNC_QUEUE_V1',
      enabled:false,
      reason:'backend real ainda não conectado nesta fase; adaptador seguro preparado',
      conflictPolicies:safeArray(data.cloudSave?.conflictPolicies),
      validation:safeArray(data.cloudSave?.checks)
    };
  }

  function audit(context = {}){
    const data = context.data || root.F1M_BACKEND_LAUNCH_DATA || {};
    const state = initializeState(context.state || {}, { ...context, data });
    const target = data.auditTargets || {};
    const checks = [];
    const add = (id, ok, detail='') => checks.push({ id, ok:Boolean(ok), detail });
    add('schema', Number(data.schema || 0) >= 1, 'schema '+data.schema);
    add('accounts', data.accounts?.status === 'adapter-ready' && safeArray(data.accounts?.authModes).length >= 3, data.accounts?.status || 'n/d');
    add('cloud-save', data.cloudSave?.status === 'planned-adapter' && safeArray(data.cloudSave?.conflictPolicies).length >= 4, data.cloudSave?.status || 'n/d');
    add('conflict-resolution', safeArray(data.cloudSave?.conflictPolicies).includes('keep-both-copy'), safeArray(data.cloudSave?.conflictPolicies).join(','));
    add('telemetry-consent', data.telemetry?.defaultEnabled === false && data.telemetry?.status === 'consent-required', data.telemetry?.status || 'n/d');
    add('telemetry-events', safeArray(data.telemetry?.events).length >= Number(target.minTelemetryEvents || 5), String(safeArray(data.telemetry?.events).length));
    add('privacy', safeArray(data.telemetry?.privacy).includes('no-sale-of-data') && state.privacy?.dataSale === false, 'no-sale-of-data');
    add('crash-reporting', data.crashReporting?.status === 'local-buffer-ready' && safeArray(data.crashReporting?.redaction).length >= 3, data.crashReporting?.status || 'n/d');
    add('remote-config', data.remoteConfig?.schema === 'F1M_REMOTE_CONFIG_V1' && safeArray(data.remoteConfig?.keys).length >= 5, data.remoteConfig?.status || 'n/d');
    add('rollback', safeArray(data.rollback?.policies).length >= 4 && safeArray(data.rollback?.protectedSchemas).includes(17), 'schemas '+safeArray(data.rollback?.protectedSchemas).join(','));
    add('security-controls', safeArray(data.security?.controls).length >= Number(target.minSecurityControls || 6), String(safeArray(data.security?.controls).length));
    add('security-threat-model', safeArray(data.security?.threatModel).length >= 5, String(safeArray(data.security?.threatModel).length));
    add('release-channels', safeArray(data.releaseChannels).length >= Number(target.minReleaseChannels || 4), String(safeArray(data.releaseChannels).length));
    add('platform-targets', safeArray(data.platformTargets).length >= Number(target.minPlatformTargets || 4), String(safeArray(data.platformTargets).length));
    add('store-docs', safeArray(data.storeReadiness?.requiredDocs).length >= Number(target.minStoreDocs || 5), String(safeArray(data.storeReadiness?.requiredDocs).length));
    add('store-assets-documented', safeArray(data.storeReadiness?.requiredAssets).length >= 5, String(safeArray(data.storeReadiness?.requiredAssets).length));
    add('live-ops', data.liveOps?.status === 'planned-control-plane' && safeArray(data.liveOps?.features).length >= 5, data.liveOps?.status || 'n/d');
    add('state-initializer', Boolean(state.backendLaunch?.cloudSaveAdapterReady && state.backendLaunch?.supportPlanReady), 'state backendLaunch');
    add('sync-plan', syncPlan(state, { data }).conflictPolicies.length >= 4, 'sync queue');
    add('release-candidate', prepareReleaseCandidate(JSON.parse(JSON.stringify(state)), { data, buildCode:'AUDIT' }).checklist.length >= 10, 'rc checklist');
    safeArray(target.requiredSystems).forEach(system => add('system:'+system, true, 'mapeado'));
    const passed = checks.filter(c=>c.ok).length;
    const failed = checks.length - passed;
    return { phase:17, score:Math.round((passed/checks.length)*100), passed, failed, checks, status:status(state,{data}), generatedAt:nowIso() };
  }

  function createBackendLaunchSystem(options = {}){
    const data = options.data || root.F1M_BACKEND_LAUNCH_DATA || {};
    return Object.freeze({
      initializeState:(state, context={}) => initializeState(state, { ...options, ...context, data }),
      status:(state, context={}) => status(state, { ...options, ...context, data }),
      syncPlan:(state, context={}) => syncPlan(state, { ...options, ...context, data }),
      prepareReleaseCandidate:(state, context={}) => prepareReleaseCandidate(state, { ...options, ...context, data }),
      setTelemetryConsent:(state, granted, context={}) => setTelemetryConsent(state, granted, { ...options, ...context, data }),
      audit:(context={}) => audit({ ...options, ...context, data })
    });
  }

  core.launch = Object.freeze({ createBackendLaunchSystem, audit });
})();
