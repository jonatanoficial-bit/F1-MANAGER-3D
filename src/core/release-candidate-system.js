(() => {
  'use strict';
  const root = globalThis;
  const core = root.F1M_CORE = root.F1M_CORE || {};
  const safeArray = value => Array.isArray(value) ? value : [];
  const clamp = (value, min=0, max=100) => Math.max(min, Math.min(max, Number(value) || 0));
  const nowIso = () => new Date().toISOString();

  function initializeState(state = {}, context = {}){
    const data = context.data || root.F1M_RELEASE_CANDIDATE_DATA || {};
    state.releaseCandidate = state.releaseCandidate || {};
    state.releaseCandidate = {
      dataPack: data.dataPack || 'commercial-release-candidate',
      channel: data.channel || 'release-candidate',
      physicalHomologation: 'manual-required',
      pwaReady: true,
      androidReady: false,
      iosReady: false,
      windowsReady: false,
      privacyDocsReady: true,
      supportDocsReady: true,
      legalReviewRequired: true,
      assetsHeavyRestoreRequired: true,
      backendProductionRequired: true,
      packagePrepared: Boolean(state.releaseCandidate?.packagePrepared || false),
      lastAuditAt: state.releaseCandidate?.lastAuditAt || null,
      migratedBy: String(context.buildCode || state.releaseCandidate?.migratedBy || 'dev'),
      updatedAt: state.releaseCandidate?.updatedAt || nowIso(),
      ...state.releaseCandidate
    };
    state.release = state.release || {};
    state.release.channel = state.release.channel || 'rc';
    state.support = state.support || { diagnosticsExport:true, contactPending:true, localCrashBuffer:true };
    return state;
  }

  function status(state = {}, context = {}){
    const data = context.data || root.F1M_RELEASE_CANDIDATE_DATA || {};
    initializeState(state, context);
    const physicalDevices = safeArray(data.physicalHomologation?.minimumDevices);
    const stores = safeArray(data.storeTargets);
    const legalBlockers = safeArray(data.legalReadiness?.blockers);
    const packageBlockers = safeArray(data.publishingPackage?.releaseBlockers);
    const docs = safeArray(data.privacySupport?.documents);
    const perfProfiles = Object.keys(data.performanceTargets || {});
    const blockers = legalBlockers.length + packageBlockers.length;
    const score = clamp(
      25 + physicalDevices.length * 5 + stores.length * 5 + docs.length * 3 + perfProfiles.length * 4 - Math.min(20, blockers * 2) +
      (state.releaseCandidate?.packagePrepared ? 6 : 0)
    );
    return {
      score,
      channel: data.channel || 'release-candidate',
      physicalDevices: physicalDevices.length,
      stores: stores.length,
      privacyDocs: docs.length,
      perfProfiles: perfProfiles.length,
      blockers,
      packageReady: Boolean(state.releaseCandidate?.packagePrepared),
      legalMode: data.legalReadiness?.mode || 'requires-review'
    };
  }

  function storeChecklist(state = {}, context = {}){
    const data = context.data || root.F1M_RELEASE_CANDIDATE_DATA || {};
    initializeState(state, context);
    const storeItems = safeArray(data.storeTargets).flatMap(target => safeArray(target.artifacts).map(item => ({ platform:target.id, item, status:target.status, done:target.status === 'rc-ready' })));
    const docs = safeArray(data.privacySupport?.documents).map(item => ({ platform:'all', item, status:'document-required', done:item.includes('support') || item.includes('open-source') }));
    const legal = safeArray(data.legalReadiness?.blockers).map(item => ({ platform:'legal', item, status:'requires-professional-review', done:false }));
    return [...storeItems, ...docs, ...legal];
  }

  function prepareCommercialPackage(state = {}, context = {}){
    const data = context.data || root.F1M_RELEASE_CANDIDATE_DATA || {};
    initializeState(state, context);
    const packageId = `${data.publishingPackage?.idPrefix || 'F1M3D-RC'}-${context.buildCode || 'DEV'}-${Date.now().toString(36).toUpperCase()}`;
    const files = safeArray(data.publishingPackage?.files);
    const evidenceFolders = safeArray(data.publishingPackage?.evidenceFolders);
    const blockers = safeArray(data.publishingPackage?.releaseBlockers).map(item => ({ item, resolved:false }));
    state.releaseCandidate.packagePrepared = true;
    state.releaseCandidate.packageId = packageId;
    state.releaseCandidate.lastPackageAt = nowIso();
    state.release = { ...(state.release || {}), channel:'rc', candidate:packageId, lastPreparedAt:nowIso() };
    return { packageId, version:context.version || 'dev', files, evidenceFolders, blockers, generatedAt:nowIso(), publishAllowed:blockers.length === 0 };
  }

  function audit(context = {}){
    const data = context.data || root.F1M_RELEASE_CANDIDATE_DATA || {};
    const state = initializeState(context.state || {}, { ...context, data });
    const target = data.auditTargets || {};
    const checks = [];
    const add = (id, ok, detail='') => checks.push({ id, ok:Boolean(ok), detail });
    const physical = safeArray(data.physicalHomologation?.minimumDevices);
    const stores = safeArray(data.storeTargets);
    const docs = safeArray(data.privacySupport?.documents);
    const evidence = safeArray(data.physicalHomologation?.requiredEvidence);
    const perf = Object.keys(data.performanceTargets || {});
    const systems = safeArray(target.requiredSystems);
    add('schema', Number(data.schema || 0) >= 1, 'schema '+data.schema);
    add('channel', data.channel === 'release-candidate', data.channel || 'n/d');
    add('physical-devices', physical.length >= Number(target.minPhysicalDevices || 5), String(physical.length));
    add('evidence-types', evidence.length >= Number(target.minEvidenceTypes || 5), String(evidence.length));
    add('store-targets', stores.length >= Number(target.minStores || 4), String(stores.length));
    add('privacy-support-docs', docs.length >= Number(target.minPrivacyDocs || 5), String(docs.length));
    add('performance-profiles', perf.length >= Number(target.minPerformanceProfiles || 3), perf.join(','));
    add('legal-review-flag', data.legalReadiness?.mode === 'requires-professional-review', data.legalReadiness?.mode || 'n/d');
    add('safe-alternatives', safeArray(data.legalReadiness?.safeAlternatives).length >= 3, String(safeArray(data.legalReadiness?.safeAlternatives).length));
    add('publishing-package', safeArray(data.publishingPackage?.files).length >= 8 && safeArray(data.publishingPackage?.releaseBlockers).length >= 4, 'files/blockers');
    add('systems-covered', systems.length >= 12, String(systems.length));
    add('no-auto-publication', data.goal?.includes('não publicar automaticamente') || data.goal?.includes('nao publicar automaticamente'), data.goal || '');
    const st = status(state, { data });
    state.releaseCandidate.lastAuditAt = nowIso();
    const passed = checks.filter(c=>c.ok).length;
    const failed = checks.length - passed;
    const score = failed ? clamp(Math.round((passed/checks.length)*100)) : 100;
    return { score, passed, failed, checks, status:st, generatedAt:nowIso() };
  }

  function createReleaseCandidateSystem(options = {}){
    const data = options.data || root.F1M_RELEASE_CANDIDATE_DATA || {};
    return {
      initializeState:(state, context={})=>initializeState(state, { ...context, data }),
      status:(state, context={})=>status(state, { ...context, data }),
      audit:(context={})=>audit({ ...context, data }),
      storeChecklist:(state, context={})=>storeChecklist(state, { ...context, data }),
      prepareCommercialPackage:(state, context={})=>prepareCommercialPackage(state, { ...context, data })
    };
  }

  core.releaseCandidate = Object.freeze({ createReleaseCandidateSystem, audit });
})();
