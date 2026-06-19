(() => {
  'use strict';
  const root = globalThis;
  const core = root.F1M_CORE = root.F1M_CORE || {};
  const arr = value => Array.isArray(value) ? value : [];
  const nowIso = () => new Date().toISOString();
  const clamp = (n, min=0, max=100) => Math.max(min, Math.min(max, Number(n) || 0));

  function initializeState(state = {}, context = {}){
    const data = context.data || root.F1M_DEPLOYMENT_DATA || {};
    state.deployment = state.deployment || {};
    state.deployment = {
      dataPack: data.dataPack || 'public-beta-deploy',
      channel: data.channel || 'public-beta-candidate',
      productionBlocked: true,
      betaGate: 'manual-controlled',
      assetRestoreRequired: true,
      githubReady: false,
      vercelPreviewRequired: true,
      pwaDeviceTestRequired: true,
      lastAuditAt: state.deployment?.lastAuditAt || null,
      lastPackageAt: state.deployment?.lastPackageAt || null,
      migratedBy: String(context.buildCode || state.deployment?.migratedBy || 'dev'),
      updatedAt: state.deployment?.updatedAt || nowIso(),
      ...state.deployment
    };
    state.quality = state.quality || {};
    state.quality.deploymentF19 = state.quality.deploymentF19 || { status:'not-run', score:null, migratedBy:String(context.buildCode || 'dev') };
    return state;
  }

  function status(state = {}, context = {}){
    const data = context.data || root.F1M_DEPLOYMENT_DATA || {};
    initializeState(state, context);
    const envs = arr(data.environments);
    const docs = arr(data.assetRestore?.requiredDocs);
    const paths = arr(data.assetRestore?.samplePaths);
    const evidence = arr(data.betaGate?.requiredManualEvidence);
    const rollback = arr(data.rollback?.safeSchemas);
    const blockers = [
      state.deployment?.assetRestoreRequired,
      state.deployment?.vercelPreviewRequired,
      state.deployment?.pwaDeviceTestRequired,
      data.betaGate?.mustBlockStoreProduction
    ].filter(Boolean).length;
    const score = clamp(20 + envs.length*8 + docs.length*5 + paths.length*3 + evidence.length*4 + rollback.length*5 - blockers*4 + (state.deployment?.githubReady ? 5 : 0));
    return { score, envs:envs.length, docs:docs.length, paths:paths.length, evidence:evidence.length, rollbackSchemas:rollback.length, blockers, channel:data.channel || 'public-beta-candidate', productionBlocked:Boolean(data.betaGate?.mustBlockStoreProduction) };
  }

  function assetRestorePlan(state = {}, context = {}){
    const data = context.data || root.F1M_DEPLOYMENT_DATA || {};
    initializeState(state, context);
    const docs = arr(data.assetRestore?.requiredDocs);
    const samples = arr(data.assetRestore?.samplePaths);
    return {
      generatedAt: nowIso(),
      policy: data.assetRestore?.policy || 'assets pesados fora do ZIP; caminhos preservados',
      requiredDocs: docs,
      samplePaths: samples,
      productionRule: data.assetRestore?.missingAllowedInProduction === false ? 'no deploy final, imagens obrigatórias precisam existir' : 'validar manualmente',
      restoreSteps: [
        'copiar a pasta assets pesada original para a raiz do projeto',
        'conferir maiúsculas/minúsculas exatamente como assets/ASSET_PATHS_REQUIRED.txt',
        'rodar npm run assets:catalog e npm run audit',
        'subir no GitHub e testar preview no Vercel/PWA',
        'abrir Check Assets dentro do jogo e validar avatares, fundos e ícones'
      ]
    };
  }

  function preparePublicBeta(state = {}, context = {}){
    const data = context.data || root.F1M_DEPLOYMENT_DATA || {};
    initializeState(state, context);
    const packageId = `F1M3D-F19-BETA-${String(context.buildCode || 'DEV').replace(/[^A-Z0-9]/gi,'')}-${Date.now().toString(36).toUpperCase()}`;
    state.deployment.lastPackageAt = nowIso();
    state.deployment.publicBetaPackage = packageId;
    state.deployment.githubReady = true;
    state.deployment.productionBlocked = true;
    return {
      packageId,
      publishAllowed:false,
      generatedAt:nowIso(),
      channel:data.channel || 'public-beta-candidate',
      repository:data.uploadMemory?.repository || 'não configurado',
      gitBashPath:data.uploadMemory?.gitBashPath || 'não configurado',
      blockers:['restaurar assets pesados reais','testar preview Vercel/PWA','coletar evidências em aparelhos físicos','revisão jurídica antes de loja/produção']
    };
  }

  function audit(context = {}){
    const data = context.data || root.F1M_DEPLOYMENT_DATA || {};
    const state = initializeState(context.state || {}, { ...context, data });
    const target = data.auditTargets || {};
    const checks = [];
    const add = (id, ok, detail='') => checks.push({ id, ok:Boolean(ok), detail });
    const envs = arr(data.environments);
    const docs = arr(data.assetRestore?.requiredDocs);
    const samples = arr(data.assetRestore?.samplePaths);
    const evidence = arr(data.betaGate?.requiredManualEvidence);
    const rollback = arr(data.rollback?.safeSchemas);
    const systems = arr(target.requiredSystems);
    const files = arr(data.cacheBust?.requiredFiles);
    add('schema', Number(data.schema || 0) >= 1, 'schema '+data.schema);
    add('channel', data.channel === 'public-beta-candidate', data.channel || 'n/d');
    add('environments', envs.length >= Number(target.minEnvironments || 4), String(envs.length));
    add('asset-documents', docs.length >= Number(target.minAssetDocs || 4), docs.join(', '));
    add('sample-paths', samples.length >= Number(target.minSamplePaths || 4), String(samples.length));
    add('zip-assets-policy', data.assetRestore?.missingAllowedInZip === true && data.assetRestore?.missingAllowedInProduction === false, 'zip leve / produção exige restauração');
    add('cache-bust', Boolean(data.cacheBust?.serviceWorker) && Number(data.cacheBust?.appShellSchemaMinimum || 0) >= 19, String(data.cacheBust?.appShellSchemaMinimum || 0));
    add('runtime-files', files.length >= 3, files.join(', '));
    add('beta-evidence', evidence.length >= Number(target.minBetaEvidence || 6), String(evidence.length));
    add('telemetry-opt-in', data.betaGate?.mustKeepTelemetryOptIn === true, 'consentimento obrigatório');
    add('production-blocked', data.betaGate?.mustBlockStoreProduction === true, 'publicação automática bloqueada');
    add('rollback', rollback.length >= Number(target.minRollbackSchemas || 3), rollback.join(','));
    add('upload-memory', Boolean(data.uploadMemory?.gitBashPath && data.uploadMemory?.repository), data.uploadMemory?.repository || 'ausente');
    add('systems-covered', systems.length >= 10, String(systems.length));
    const passed = checks.filter(c=>c.ok).length;
    const failed = checks.length - passed;
    const score = failed ? clamp(Math.round((passed/checks.length)*100)) : 100;
    state.deployment.lastAuditAt = nowIso();
    state.quality = state.quality || {};
    state.quality.deploymentF19 = { status: failed ? 'review' : 'approved', score, passed, failed, generatedAt:nowIso() };
    return { score, passed, failed, checks, status:status(state, { data }), generatedAt:nowIso() };
  }

  function createDeploymentValidationSystem(options = {}){
    const data = options.data || root.F1M_DEPLOYMENT_DATA || {};
    return {
      initializeState:(state, context={})=>initializeState(state, { ...context, data }),
      status:(state, context={})=>status(state, { ...context, data }),
      audit:(context={})=>audit({ ...context, data }),
      assetRestorePlan:(state, context={})=>assetRestorePlan(state, { ...context, data }),
      preparePublicBeta:(state, context={})=>preparePublicBeta(state, { ...context, data })
    };
  }

  core.deployValidation = Object.freeze({ createDeploymentValidationSystem, audit });
})();
