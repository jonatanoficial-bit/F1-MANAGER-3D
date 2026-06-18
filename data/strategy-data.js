globalThis.F1M_STRATEGY_DATA = Object.freeze({
  schema: 1,
  build: 'F1M3D-0.21.0-F12',
  focus: 'IA de corrida, ultrapassagem, estratégia e neutralizações',
  pitStop: {
    baseLossProgress: 0.069,
    pitLaneBusyPenalty: 0.014,
    doubleStackingPenalty: 0.028,
    unsafeReleaseRisk: 0.045,
    minCooldown: 5.5,
    maxCooldown: 10.5
  },
  compounds: {
    soft: { lifeTarget: 0.38, attackWindow: 0.30, defenseWindow: 0.42 },
    medium: { lifeTarget: 0.55, attackWindow: 0.44, defenseWindow: 0.62 },
    hard: { lifeTarget: 0.72, attackWindow: 0.60, defenseWindow: 0.80 },
    inter: { lifeTarget: 0.48, attackWindow: 0.40, defenseWindow: 0.58 },
    wet: { lifeTarget: 0.50, attackWindow: 0.42, defenseWindow: 0.60 }
  },
  raceCraft: {
    baseOvertakeChance: 0.012,
    drsBoost: 0.034,
    slipstreamBoost: 0.018,
    tyreDeltaBoost: 0.010,
    defenseReduction: 0.022,
    trafficPenalty: 0.018,
    humanErrorBase: 0.00045,
    restartAggression: 1.38
  },
  neutralization: {
    vscDuration: [10, 18],
    safetyCarDuration: [16, 30],
    redFlagDuration: [8, 16],
    debrisChance: 0.00022,
    incidentEscalation: 0.18,
    redFlagEscalation: 0.035,
    restartWindow: 5
  },
  audits: [
    'initial-plan','undercut-overcut','traffic','attack-defense','human-error','pit-crew','double-stacking','unsafe-release','safety-car','vsc','red-flag','restart','overtake-resolution'
  ]
});
