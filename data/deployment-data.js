(() => {
  'use strict';
  const data = Object.freeze({
    schema: 1,
    phase: 19,
    dataPack: 'public-beta-deploy-2026-06-19',
    channel: 'public-beta-candidate',
    goal: 'preparar deploy seguro sem publicar automaticamente e sem incluir assets binários pesados no ZIP',
    environments: [
      { id:'local', label:'Teste local', expected:['index.html','manifest.webmanifest','service-worker.js','assets/ASSET_PATHS_REQUIRED.txt'], status:'ready-for-manual-test' },
      { id:'github', label:'GitHub main', expected:['commit-da-build','FILE_MANIFEST.sha256','assets/ASSET_MANIFEST.json'], status:'requires-push' },
      { id:'vercel', label:'Vercel / Web deploy', expected:['cache-bust','pwa-manifest','asset-restore-check'], status:'requires-preview' },
      { id:'pwa', label:'PWA instalada', expected:['app-shell','offline-start','safe-area','fullscreen-button'], status:'requires-device-test' }
    ],
    assetRestore: {
      requiredDocs: ['assets/ASSET_PATHS_REQUIRED.txt','assets/ASSET_MANIFEST.json','README_ASSETS_SEM_BINARIOS.txt','docs/RESTORE_ASSETS.md'],
      samplePaths: ['assets/backgrounds/ui/global_lobby.png','assets/avatars/selectable/avatar_01.png','assets/tracks/svg/bahrein.svg','assets/icons/app/icon-192.png'],
      policy: 'o ZIP de fase não carrega imagens pesadas; o deploy real deve restaurar a pasta assets pesada respeitando caminhos case-sensitive',
      missingAllowedInZip: true,
      missingAllowedInProduction: false
    },
    cacheBust: {
      serviceWorker: true,
      appShellSchemaMinimum: 19,
      expectedBuildCodePattern: 'F1M3D-0.28.0-F19',
      requiredFiles: ['data/deployment-data.js','src/core/deployment-system.js','tests/deployment-audit.mjs']
    },
    betaGate: {
      maxPublicAudience: 'convites/controlado',
      mustShowBuild: true,
      mustAllowDiagnosticsExport: true,
      mustKeepTelemetryOptIn: true,
      mustBlockStoreProduction: true,
      requiredManualEvidence: ['print-home','print-assets','print-corrida','print-sistema','print-pwa','relatorio-dispositivo']
    },
    rollback: {
      safeSchemas: [17,18,19],
      fallbackBuild: 'v0.27.0-F18',
      requiredFiles: ['BUILD_INFO.json','CHANGELOG.md','FILE_MANIFEST.sha256','KNOWN_ISSUES.md']
    },
    uploadMemory: {
      windowsPath: 'C:\\Users\\jonat\\Desktop\\GAME\\¨2026\\F1 Manager 3D',
      gitBashPath: '/c/Users/jonat/Desktop/GAME/¨2026/F1 Manager 3D',
      repository: 'https://github.com/jonatanoficial-bit/F1-MANAGER-3D.git'
    },
    auditTargets: {
      minEnvironments: 4,
      minAssetDocs: 4,
      minSamplePaths: 4,
      minBetaEvidence: 6,
      minRollbackSchemas: 3,
      requiredSystems: ['git-upload','vercel-preview','pwa-cache','asset-restore','beta-gate','diagnostics-export','telemetry-consent','rollback','manual-device-evidence','release-blockers']
    }
  });
  globalThis.F1M_DEPLOYMENT_DATA = data;
})();
