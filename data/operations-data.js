(() => {
  'use strict';
  const data = Object.freeze({
    schema: 1,
    phase: 20,
    dataPack: 'beta-ops-hotfix-2026-06-19',
    channel: 'public-beta-ops',
    goal: 'operar beta público controlado com feedback, triagem de crash, plano de hotfix, rollback e evidências sem publicar automaticamente em produção',
    feedback: {
      categories: ['bug','performance','mobile-scroll','missing-asset','gameplay-balance','translation','accessibility','suggestion'],
      severities: ['low','medium','high','critical'],
      requiredFields: ['category','severity','screen','description','buildCode','device','language'],
      maxLocalItems: 30,
      redaction: ['email','phone','token','apiKey','password','address']
    },
    crashTriage: {
      buckets: ['runtime-error','asset-missing','save-corruption','webgl-fallback','pwa-cache','mobile-viewport','unknown'],
      priorities: { critical: 100, high: 75, medium: 45, low: 20 },
      escalationRules: [
        'crash em tela inicial = critical',
        'perda de save = critical',
        'rolagem bloqueada no mobile = high',
        'asset obrigatório ausente no preview = high',
        'queda de FPS abaixo do orçamento mobile = medium'
      ]
    },
    hotfix: {
      channels: ['internal','public-beta','release-candidate'],
      requiredArtifacts: ['CHANGELOG.md','AUDIT_REPORT.md','FILE_MANIFEST.sha256','test-results/full-audit-summary.json','F1-MANAGER-3D-FASE-20-RESUMO.md'],
      gates: ['sem regressão mobile','sem erro de console crítico','assets obrigatórios documentados','save migrado','rollback disponível','telemetria opt-in'],
      rollbackSchemas: [18,19,20],
      maxUnresolvedCritical: 0,
      maxUnresolvedHighForBeta: 2
    },
    deviceMatrix: [
      { id:'android-low', label:'Android entrada', viewport:'844x390', mustPass:['scroll','touch-targets','save','race-fallback'] },
      { id:'android-mid', label:'Android intermediário', viewport:'915x412', mustPass:['pwa','assets','race-3d-fallback'] },
      { id:'ios', label:'iPhone/iOS', viewport:'932x430', mustPass:['safe-area','fullscreen-button','scroll'] },
      { id:'tablet', label:'Tablet', viewport:'1180x820', mustPass:['layout','tabs','diagnostics'] },
      { id:'desktop', label:'Desktop', viewport:'1440x900', mustPass:['keyboard','scroll','devtools-clean'] }
    ],
    betaOpsChecklist: [
      'confirmar que o GitHub recebeu a build mais recente',
      'validar preview Vercel com cache limpo',
      'restaurar assets reais quando houver pacote pesado disponível',
      'abrir Central Sistema e rodar diagnóstico completo',
      'testar rolagem em Criar Carreira, Garagem, Sistema e Resultado',
      'gerar feedback local para bug/performance/asset',
      'exportar plano de hotfix quando houver crítico',
      'manter produção bloqueada até homologação física'
    ],
    manualEvidence: ['print-home','print-criar-carreira-scroll','print-assets-caminho','print-corrida','print-sistema-f20','relatorio-feedback-json','relatorio-hotfix-json'],
    auditTargets: {
      minFeedbackCategories: 8,
      minDeviceMatrix: 5,
      minChecklist: 8,
      minHotfixArtifacts: 5,
      minManualEvidence: 7,
      requiredSystems: ['feedback-local','crash-triage','hotfix-plan','device-matrix','rollback','redaction','beta-gates','mobile-scroll-watch','asset-preview-watch','diagnostics-export']
    }
  });
  globalThis.F1M_OPERATIONS_DATA = data;
})();
