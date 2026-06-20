(() => {
  'use strict';
  const data = Object.freeze({
    schema: 1,
    phase: 22,
    dataPack: 'visual-hotfix-scroll-assets-2026-06-20',
    channel: 'public-beta-visual-hotfix',
    goal: 'corrigir rolagem em todas as telas críticas, reforçar caminhos de imagens, restaurar fundos reais quando disponíveis e preparar beta público com assets reais',
    criticalScreens: [
      'home','career-create','team-select','lobby','qualifying','race','results','single-race','assets-check'
    ],
    scrollContracts: [
      { id:'screen-shell', selector:'.screen.active', rule:'min-height:0; overflow:hidden para telas com containers internos' },
      { id:'career-create', selector:'#screen-career-create.active .creator-grid', rule:'grid com minmax(0,1fr), overflow auto e scroll touch' },
      { id:'team-select', selector:'#screen-team-select .team-select-grid', rule:'altura calculada, overflow auto e padding inferior seguro' },
      { id:'lobby-tabs', selector:'#screen-lobby .tab-content', rule:'rolagem principal do dashboard com overscroll containment' },
      { id:'qualifying-results', selector:'#screen-qualifying .split-layout', rule:'cards internos roláveis no mobile horizontal' },
      { id:'results-screen', selector:'#screen-results .results-grid', rule:'resultado e resumo com rolagem total em telas baixas' },
      { id:'asset-check', selector:'#screen-assets-check .asset-check', rule:'lista de caminhos rolável e legível' },
      { id:'race-hud', selector:'#screen-race .race-left, #screen-race .race-right', rule:'HUD compactável com scroll controlado em 844x390' }
    ],
    assetBackgrounds: [
      { id:'home', selector:'#screen-home', path:'assets/backgrounds/ui/global_lobby.png' },
      { id:'career-create', selector:'#screen-career-create', path:'assets/backgrounds/ui/global_lobby.png' },
      { id:'team-select', selector:'#screen-team-select', path:'assets/backgrounds/ui/global_lobby.png' },
      { id:'lobby', selector:'#screen-lobby', path:'assets/backgrounds/ui/global_lobby.png' },
      { id:'qualifying', selector:'#screen-qualifying', path:'assets/backgrounds/ui/classification_clean.png' },
      { id:'results', selector:'#screen-results', path:'assets/backgrounds/podium/podium_stage.png' },
      { id:'garage', selector:'[data-tab="garage"]', path:'assets/backgrounds/garage/garage_base.png' },
      { id:'boxes', selector:'[data-context="boxes"]', path:'assets/backgrounds/race/boxes/box_garage_interior_01.png' }
    ],
    legibilityRules: [
      'text-shadow aplicado sobre fundos fotográficos',
      'glass panels com contraste mínimo e borda visível',
      'asset-path-hint com fonte monoespaçada e overflow ellipsis',
      'botões principais com alvo mínimo 44px no mobile',
      'cards com padding inferior para safe area',
      'side-nav rolável quando a altura for menor que o total de ícones'
    ],
    betaPublicChecklist: [
      'restaurar pasta assets pesada antes do deploy público',
      'validar Criar Carreira em 844x390 e 915x412',
      'validar caminhos de avatar e fallback sem esconder informação',
      'validar lobby, garagem, classificação, corrida e resultados no PC',
      'limpar cache PWA depois do deploy',
      'testar Vercel preview em aba anônima',
      'registrar prints antes de liberar link para beta',
      'manter produção bloqueada se assets obrigatórios ainda estiverem ausentes'
    ],
    requiredEvidence: ['mobile-scroll-ok','desktop-scroll-ok','avatar-paths-visible','backgrounds-loaded-or-path-visible','asset-manifest-preserved','pwa-cache-cleared'],
    auditTargets: { minScreens: 9, minScrollContracts: 8, minBackgrounds: 8, minLegibilityRules: 6, minChecklist: 8, minEvidence: 6 }
  });
  globalThis.F1M_VISUAL_HOTFIX_DATA = data;
})();
