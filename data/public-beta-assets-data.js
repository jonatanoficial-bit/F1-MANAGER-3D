(() => {
  'use strict';
  const data = Object.freeze({
    schema: 1,
    phase: 23,
    dataPack: 'public-beta-assets-real-2026-06-20',
    channel: 'public-beta-assets-real',
    goal: 'validar beta público com assets reais restaurados no GitHub/Vercel sem inserir binários pesados no ZIP de fase',
    requiredAssetGroups: [
      { id:'ui-backgrounds', label:'Fundos principais', min:8, examples:['assets/backgrounds/ui/global_lobby.png','assets/backgrounds/podium/podium_stage.png'] },
      { id:'driver-avatars', label:'Avatares e retratos', min:22, examples:['assets/drivers/avatars/f2/nikola_tsolov.png','assets/drivers/avatars/f1/max_verstappen.png'] },
      { id:'team-logos', label:'Logos de equipes', min:11, examples:['assets/teams/f2/campos.png','assets/teams/f1/ferrari.png'] },
      { id:'track-svg', label:'Traçados SVG', min:22, examples:['assets/tracks/svg/australia.svg','assets/tracks/svg/monaco.svg'] },
      { id:'pwa-icons', label:'Ícones PWA', min:2, examples:['assets/icons/app/icon-192.png','assets/icons/app/icon-512.png'] }
    ],
    restoreWorkflow: [
      'baixar ou localizar a pasta assets pesada oficial no PC',
      'copiar a pasta assets real para a raiz do projeto local, preservando nomes e maiúsculas/minúsculas',
      'manter ASSET_MANIFEST.json, ASSET_PATHS_REQUIRED.txt e README_ASSETS.txt dentro da pasta assets',
      'rodar npm run test:assets e npm run test:public-beta-assets',
      'subir para GitHub e aguardar preview Vercel',
      'abrir o preview em aba anônima e limpar cache/PWA se necessário',
      'validar Criar Carreira, escolha de equipe, lobby, corrida, resultados e Central de Assets',
      'registrar evidência visual antes de liberar link de beta público'
    ],
    previewTargets: [
      { id:'github-main', label:'GitHub main atualizado', blocker:'push ausente ou branch errada' },
      { id:'vercel-preview', label:'Preview Vercel com deploy verde', blocker:'build/deploy falhando' },
      { id:'pwa-cache', label:'Cache PWA limpo e shell atualizado', blocker:'service worker antigo servindo cache' },
      { id:'mobile-844', label:'Mobile horizontal 844x390 com scroll', blocker:'conteúdo preso ou cortado' },
      { id:'desktop-1440', label:'Desktop 1440x900 com fundos reais', blocker:'backgrounds ausentes ou contraste fraco' },
      { id:'assets-visible', label:'Paths continuam visíveis quando asset ausente', blocker:'placeholder sem caminho exato' }
    ],
    evidenceChecklist: [
      'print-home-background-real-or-path-visible',
      'print-career-avatar-paths-visible',
      'print-team-logos-real-or-path-visible',
      'print-race-track-rendered',
      'print-assets-panel-with-counts',
      'print-mobile-scroll-844x390',
      'print-vercel-preview-clean-cache',
      'print-github-files-after-push'
    ],
    gateRules: [
      'produção bloqueada se qualquer grupo obrigatório estiver ausente',
      'beta público permitido somente com preview verde e evidências mínimas',
      'Vercel deve servir arquivos com caminhos idênticos ao manifesto',
      'nenhuma chave secreta deve ser incluída no cliente',
      'assets sem licença continuam bloqueados para lançamento comercial'
    ],
    auditTargets: { minGroups:5, minWorkflow:8, minPreviewTargets:6, minEvidence:8, minGateRules:5 }
  });
  globalThis.F1M_PUBLIC_BETA_ASSETS_DATA = data;
})();
