(() => {
  'use strict';
  const data = Object.freeze({
    schema: 1,
    phase: 18,
    dataPack: 'commercial-release-candidate-2026-06-19',
    channel: 'release-candidate',
    goal: 'preparar pacote comercial e não publicar automaticamente nem ocultar pendências de assets/licenças',
    physicalHomologation: {
      status: 'manual-required',
      minimumDevices: [
        { id:'android-low', label:'Android entrada', resolution:'844x390 landscape', checks:['fullscreen','safe-area','scroll','battery-30min','offline-pwa','save-export'] },
        { id:'android-mid', label:'Android intermediário', resolution:'915x412 landscape', checks:['race-3d','thermal','touch-targets','audio','resume-background'] },
        { id:'ios-phone', label:'iPhone', resolution:'932x430 landscape', checks:['safe-area-notch','pwa-standalone','gesture-conflict','storage-quota'] },
        { id:'tablet', label:'Tablet', resolution:'1180x820', checks:['layout-expanded','scroll','performance','font-scaling'] },
        { id:'desktop', label:'Desktop navegador', resolution:'1440x900', checks:['keyboard','mouse','window-resize','devtools-console-clean'] }
      ],
      requiredEvidence: ['screenshot','screen-recording','console-log-clean','diagnostic-export','performance-report']
    },
    storeTargets: [
      { id:'pwa', label:'PWA/Web', artifacts:['manifest','service-worker','https-domain','offline-shell','privacy-link','support-link'], status:'rc-ready' },
      { id:'android', label:'Google Play / Android', artifacts:['aab-signed','adaptive-icon','feature-graphic','privacy-label','age-rating','data-safety'], status:'requires-wrapper-and-signing' },
      { id:'ios', label:'App Store / iOS', artifacts:['ipa-or-wrapper','safe-area-proof','privacy-nutrition','support-url','age-rating'], status:'requires-wrapper-and-review' },
      { id:'windows', label:'Windows', artifacts:['packaging-plan','installer-signing','fullscreen-mode','privacy-policy','support-diagnostics'], status:'requires-packager' }
    ],
    legalReadiness: {
      mode: 'requires-professional-review',
      blockers: ['nomes-marcas-f1-f2-equipes-pilotos-circuitos','logos-e-imagens-reais','trilhas-e-audios-terceiros','politica-de-privacidade-final','termos-de-uso-final'],
      safeAlternatives: ['modo-fictional-branding','nomes-genericos','assets-originais-gerados','licencas-documentadas']
    },
    privacySupport: {
      documents: ['privacy-policy.md','terms-of-use.md','support.md','open-source-notices.md','data-deletion.md'],
      requirements: ['telemetry-off-by-default','consent-log-local','export-save','delete-local-data','support-diagnostics-redacted']
    },
    performanceTargets: {
      mobile: { fpsFloor: 24, frameBudgetMs: 41, startupMs: 3500, memoryMb: 450, batteryMinutesMinimum: 30 },
      tablet: { fpsFloor: 30, frameBudgetMs: 34, startupMs: 3000, memoryMb: 650 },
      desktop: { fpsFloor: 45, frameBudgetMs: 22, startupMs: 2200, memoryMb: 900 }
    },
    publishingPackage: {
      idPrefix: 'F1M3D-RC',
      files: ['BUILD_INFO.json','AUDIT_REPORT.md','CHANGELOG.md','KNOWN_ISSUES.md','FILE_MANIFEST.sha256','assets/ASSET_PATHS_REQUIRED.txt','assets/ASSET_MANIFEST.json','manifest.webmanifest','service-worker.js'],
      evidenceFolders: ['test-results','docs','support','store-listing'],
      releaseBlockers: ['assets-pesados-restaurados','homologacao-fisica-pendente','revisao-juridica-pendente','backend-real-nao-conectado']
    },
    auditTargets: {
      minPhysicalDevices: 5,
      minStores: 4,
      minPrivacyDocs: 5,
      minEvidenceTypes: 5,
      minPerformanceProfiles: 3,
      requiredSystems: ['homologacao-fisica','pwa','android','ios','windows','privacidade','suporte','juridico','performance-real','pacote-publicacao','assets-manifest','rollback']
    }
  });
  globalThis.F1M_RELEASE_CANDIDATE_DATA = data;
})();
