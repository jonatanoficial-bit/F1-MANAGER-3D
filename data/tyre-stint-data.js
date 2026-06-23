(() => {
  'use strict';
  const data = Object.freeze({
    schema: 1,
    phase: 27,
    dataPack: 'tyre-stint-degradation-2026-06-20',
    channel: 'tyre-stint-degradation-simulator',
    goal: 'aprofundar o simulador com pneus reais de engenharia: janela térmica, degradação por stint, graining, blistering, flat spot, pressão, carcaça, fuel corrected pace, undercut/overcut e plano de pit wall sem comportamento arcade',
    compounds: [
      { id:'soft', label:'Macio', code:'S', grip:1.000, warmupLaps:1.2, idealSurface:[92,108], idealCarcass:[88,102], baseLifeLaps:18, wearSlope:1.42, cliffPct:28, pressurePsi:[20.0,24.5], sensitivity:{ thermal:1.18, sliding:1.24, load:1.10, dirtyAir:1.12, graining:1.08, blistering:1.14 }, pitDeltaGain:0.85 },
      { id:'medium', label:'Médio', code:'M', grip:0.986, warmupLaps:1.8, idealSurface:[88,104], idealCarcass:[86,100], baseLifeLaps:27, wearSlope:1.00, cliffPct:22, pressurePsi:[20.5,24.0], sensitivity:{ thermal:1.00, sliding:1.00, load:1.00, dirtyAir:1.00, graining:0.88, blistering:0.94 }, pitDeltaGain:0.55 },
      { id:'hard', label:'Duro', code:'H', grip:0.972, warmupLaps:2.6, idealSurface:[84,100], idealCarcass:[84,98], baseLifeLaps:39, wearSlope:0.72, cliffPct:18, pressurePsi:[21.0,24.0], sensitivity:{ thermal:0.78, sliding:0.82, load:0.86, dirtyAir:0.88, graining:0.65, blistering:0.72 }, pitDeltaGain:0.32 },
      { id:'intermediate', label:'Intermediário', code:'I', grip:0.940, warmupLaps:1.6, idealSurface:[65,82], idealCarcass:[62,78], baseLifeLaps:25, wearSlope:1.18, cliffPct:24, pressurePsi:[20.0,23.0], sensitivity:{ thermal:1.35, sliding:1.18, load:0.92, dirtyAir:0.90, graining:1.20, blistering:1.25 }, pitDeltaGain:0.70 },
      { id:'wet', label:'Chuva extrema', code:'W', grip:0.905, warmupLaps:2.0, idealSurface:[55,74], idealCarcass:[54,70], baseLifeLaps:30, wearSlope:1.04, cliffPct:26, pressurePsi:[19.5,22.5], sensitivity:{ thermal:1.45, sliding:1.10, load:0.84, dirtyAir:0.80, graining:1.05, blistering:1.42 }, pitDeltaGain:0.60 }
    ],
    tyreSignals: [
      'surfaceTempC','carcassTempC','pressurePsi','wearPct','ageLaps','compound','compoundDelta','thermalDelta','grainingPct','blisteringPct','flatSpotPct','slidingEnergy','verticalLoad','fuelCorrectedPace','degradationPerLap','cliffRisk','punctureRisk','undercutPower','overcutResistance','pitWindowConfidence'
    ],
    degradationFactors: [
      { id:'thermal-over-window', label:'pneu acima da janela', effect:'aumenta degradação e risco de blistering', weight:1.30 },
      { id:'thermal-under-window', label:'pneu abaixo da janela', effect:'graining e baixa aderência em stint inicial', weight:1.12 },
      { id:'sliding', label:'escorregamento lateral/longitudinal', effect:'mata superfície e acelera queda de ritmo', weight:1.22 },
      { id:'fuel-mass', label:'combustível alto', effect:'aumenta carga vertical e temperatura de carcaça', weight:1.10 },
      { id:'dirty-air', label:'ar sujo', effect:'perde carga e desliza mais em curva média/rápida', weight:1.14 },
      { id:'track-evolution', label:'pista emborrachando', effect:'reduz graining e melhora consistência', weight:0.92 },
      { id:'pressure-high', label:'pressão alta', effect:'reduz contato e aumenta temperatura central', weight:1.10 },
      { id:'pressure-low', label:'pressão baixa', effect:'melhora tração mas aumenta deformação/carcaça', weight:1.06 },
      { id:'lockup-flatspot', label:'travamento', effect:'vibração, perda de aderência e risco de pit antecipado', weight:1.28 }
    ],
    strategyModels: [
      { id:'undercut', label:'Undercut', trigger:'pneu atual acima de 48% desgaste ou adversário preso em tráfego', requiredGapSec:2.1, advantageSec:1.3, risk:'tráfego pós-pit e aquecimento do pneu novo' },
      { id:'overcut', label:'Overcut', trigger:'pneu atual ainda na janela e pista livre', requiredGapSec:1.2, advantageSec:0.7, risk:'cliff súbito ou Safety Car adverso' },
      { id:'offset-stint', label:'Stint deslocado', trigger:'piloto fora do DRS train ou Safety Car provável', requiredGapSec:4.0, advantageSec:1.0, risk:'composto frio e tráfego intermediário' },
      { id:'protect-track-position', label:'Proteger posição', trigger:'rival dentro de janela de undercut', requiredGapSec:1.5, advantageSec:0.5, risk:'box duplo e pit lane ocupado' }
    ],
    pitWallRules: [
      { id:'box-now-cliff', priority:96, trigger:'cliffRisk alto e degradação acima de 0.115s/volta', advice:'BOX AGORA: pneu entrando no penhasco de performance' },
      { id:'protect-undercut', priority:90, trigger:'rival com undercutPower alto', advice:'COBRIR UNDERCUT: parar nesta volta ou aumentar ritmo de entrada' },
      { id:'extend-clean-air', priority:82, trigger:'overcutResistance alto e pista livre', advice:'ESTENDER STINT: usar ar limpo e ganhar track position' },
      { id:'cool-tyres', priority:78, trigger:'superfície quente e carcaça dentro da janela', advice:'COOL LAPS: poupar pneus por 1-2 voltas sem perder ERS crítico' },
      { id:'attack-new-tyre', priority:74, trigger:'pneu novo dentro da janela e ERS alto', advice:'ATACAR: janela de aderência ideal com energia disponível' },
      { id:'avoid-flatspot', priority:72, trigger:'freio dianteiro crítico e pressão alta', advice:'AJUSTAR FREIO: evitar flat spot antes do pit' }
    ],
    targetMetrics: { minCompounds:5, minSignals:18, minFactors:9, minStrategyModels:4, minPitWallRules:6, minScore:98 },
    realismNotice: 'Modelo físico plausível para simulador de gestão; não contém telemetria proprietária oficial de equipes reais nem dados sigilosos.'
  });
  globalThis.F1M_TYRE_STINT_DATA = data;
})();
