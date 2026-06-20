(() => {
  'use strict';
  const data = Object.freeze({
    schema: 1,
    phase: 21,
    dataPack: 'asset-restore-preview-2026-06-20',
    channel: 'public-beta-assets-restore',
    goal: 'guiar restauração dos assets reais fora do ZIP leve, validar preview GitHub/Vercel/PWA e impedir produção quando caminhos obrigatórios estiverem ausentes',
    deliveryPolicy: {
      zipKeepsBinariesOut: true,
      allowedAssetFilesInPhaseZip: ['ASSET_MANIFEST.json','ASSET_PATHS_REQUIRED.txt','README_ASSETS.txt'],
      heavyAssetsSource: 'pasta assets pesada original do usuário',
      restoreMode: 'copiar assets reais por cima da pasta assets leve, sem apagar os documentos de manifesto',
      productionGate: 'blocked-until-required-assets-available'
    },
    restoreChecklist: [
      'baixar e extrair a build F21 na pasta oficial do projeto',
      'copiar a pasta assets pesada original por cima da pasta assets leve',
      'manter assets/ASSET_MANIFEST.json, assets/ASSET_PATHS_REQUIRED.txt e assets/README_ASSETS.txt',
      'confirmar que assets/avatars/selectable/avatar_01.png existe fisicamente',
      'confirmar que assets/backgrounds/race/boxes/box_garage_interior_01.png existe fisicamente',
      'confirmar que assets/tracks/svg/australia.svg existe fisicamente',
      'rodar npm run audit antes do git push',
      'enviar para GitHub e aguardar deploy do Vercel',
      'abrir preview com cache limpo ou aba anônima',
      'validar tela Criar Carreira, Garagem, Corrida, Assets e Sistema',
      'tirar prints de caminhos restaurados e imagens aparecendo',
      'só liberar produção após homologação física mobile'
    ],
    previewTargets: [
      { id:'github-main', label:'GitHub main', expected:['index.html','assets/ASSET_PATHS_REQUIRED.txt','data/asset-catalog.js'] },
      { id:'vercel-preview', label:'Vercel Preview', expected:['home','career-create','assets-panel','service-worker'] },
      { id:'pwa-cache-clean', label:'PWA cache limpo', expected:['new-cache-name','app-shell-F21','runtime-assets'] },
      { id:'mobile-real', label:'Mobile real', expected:['scroll','safe-area','avatar-paths','touch-targets'] },
      { id:'desktop-qc', label:'Desktop QA', expected:['no-console-critical','assets-visible','diagnostics-export'] }
    ],
    requiredRuntimeSamples: [
      'assets/avatars/selectable/avatar_01.png',
      'assets/avatars/selectable/avatar_02.png',
      'assets/backgrounds/home/home_bg.png',
      'assets/backgrounds/race/boxes/box_garage_interior_01.png',
      'assets/backgrounds/garage/garage_base.png',
      'assets/tracks/svg/australia.svg',
      'assets/tracks/svg/bahrein.svg',
      'assets/tracks/svg/monaco.svg',
      'assets/icons/app/icon-192.png',
      'assets/icons/app/icon-512.png'
    ],
    missingKnownFromOriginal: [
      'assets/drivers/avatars/f2/alex_dunne.png',
      'assets/drivers/avatars/f2/enzo_fittipaldi_jr.png',
      'assets/drivers/avatars/f2/john_bennett.png',
      'assets/drivers/avatars/f2/nikola_tsolov.png',
      'assets/drivers/avatars/f2/tasanapol_inthraphuvasak.png',
      'assets/icons/app/icon-192.png',
      'assets/icons/app/icon-512.png'
    ],
    cacheInvalidation: {
      serviceWorkerMustContainBuild: true,
      clearOldCaches: ['f1-manager-career-v0.29.0','f1-manager-career-v0.28.0'],
      userAction: 'botão limpar cache do app ou reinstalar PWA se o preview continuar mostrando assets antigos'
    },
    auditTargets: {
      minRestoreChecklist: 12,
      minPreviewTargets: 5,
      minRuntimeSamples: 10,
      minKnownMissing: 7,
      requiredDocs: ['assets/ASSET_MANIFEST.json','assets/ASSET_PATHS_REQUIRED.txt','assets/README_ASSETS.txt','docs/ASSET_RESTORE_GUIDE_F21.md'],
      requiredSystems: ['guided-restore-plan','preview-health','case-sensitive-paths','pwa-cache-invalidation','required-sample-paths','production-blocker','manual-evidence','github-vercel-check','mobile-scroll-check','asset-doc-preservation']
    }
  });
  globalThis.F1M_ASSET_RESTORE_DATA = data;
})();
