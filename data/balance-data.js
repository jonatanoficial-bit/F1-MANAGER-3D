(() => {
  'use strict';
  globalThis.F1M_BALANCE_DATA = Object.freeze({
    schema: 1,
    build_phase: 13,
    name: 'Scientific Balance Model F13',
    monteCarlo: {
      defaultRuns: 256,
      quickRuns: 80,
      seed: 132026,
      raceDistanceLaps: 26,
      confidenceBands: [0.05, 0.25, 0.50, 0.75, 0.95]
    },
    targets: {
      dnfRate: { min: 0.025, ideal: 0.075, max: 0.16 },
      pitStopsPerDriver: { min: 0.72, ideal: 1.18, max: 2.05 },
      overtakesPerRace: { min: 18, ideal: 43, max: 78 },
      winningGapSeconds: { min: 2.5, ideal: 13.5, max: 41 },
      fieldSpreadSeconds: { min: 38, ideal: 84, max: 180 },
      topTeamWinShare: { min: 0.38, ideal: 0.58, max: 0.78 },
      midfieldPointsShare: { min: 0.20, ideal: 0.34, max: 0.48 },
      backmarkerPointsShare: { min: 0.01, ideal: 0.06, max: 0.16 }
    },
    difficultyModels: {
      easy: { budget: 1.18, cost: 0.86, rivalGrowth: 0.86, hiddenGrip: 1.00, playerBonusLimit: 0.012, description: 'alivia economia e pressão sem dar velocidade invisível' },
      normal: { budget: 1.00, cost: 1.00, rivalGrowth: 1.00, hiddenGrip: 1.00, playerBonusLimit: 0.000, description: 'referência neutra sem assistências ocultas' },
      hard: { budget: 0.82, cost: 1.18, rivalGrowth: 1.15, hiddenGrip: 1.00, playerBonusLimit: 0.000, description: 'pressiona orçamento e rivais, não altera física contra o jogador' },
      sandbox: { budget: 1.85, cost: 0.72, rivalGrowth: 0.70, hiddenGrip: 1.00, playerBonusLimit: 0.015, description: 'liberdade de testes, ainda sem rubber band agressivo' }
    },
    progression: {
      developmentNoise: 0.18,
      regressionGuard: 0.60,
      maxSeasonDeltaTop: 5.0,
      maxSeasonDeltaMid: 7.0,
      maxSeasonDeltaBack: 9.0,
      catchupByInfrastructure: 0.35,
      noInvisibleCheatRule: 'Dificuldade muda economia, custos, metas, rivalGrowth e pressão; não altera tempos de volta escondidos contra o jogador.'
    },
    reportCards: [
      'dnfRate','pitStopsPerDriver','overtakesPerRace','winningGapSeconds','fieldSpreadSeconds','topTeamWinShare','midfieldPointsShare','backmarkerPointsShare'
    ]
  });
})();
