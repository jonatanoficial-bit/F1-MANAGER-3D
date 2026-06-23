(() => {
  'use strict';
  const data = Object.freeze({
    schema: 1,
    phase: 26,
    dataPack: 'advanced-setup-engineering-2026-06-20',
    channel: 'advanced-setup-engineering',
    goal: 'substituir sensação arcade por engenharia realista de fim de semana: setup altera telemetria, desgaste, estabilidade, velocidade, classificação e ritmo de corrida',
    setupParameters: [
      { id:'frontWing', label:'Asa dianteira', unit:'clicks', min:1, max:11, neutral:6, telemetry:['frontLoad','turnIn','drag','frontTyreTemp'], tradeoff:'mais asa melhora entrada de curva e aquece dianteiros; aumenta arrasto' },
      { id:'rearWing', label:'Asa traseira', unit:'clicks', min:1, max:11, neutral:6, telemetry:['rearLoad','traction','drag','rearTyreTemp'], tradeoff:'mais asa melhora tração e estabilidade; reduz velocidade de reta' },
      { id:'rideHeightFront', label:'Altura dianteira', unit:'mm', min:24, max:42, neutral:33, telemetry:['floorLoad','porpoisingRisk','bottomingRisk'], tradeoff:'mais baixo gera carga; aumenta risco de tocar assoalho' },
      { id:'rideHeightRear', label:'Altura traseira', unit:'mm', min:42, max:70, neutral:56, telemetry:['diffuserLoad','stability','drag'], tradeoff:'rake controla difusor; muito alto perde eficiência' },
      { id:'frontSuspension', label:'Suspensão dianteira', unit:'N/mm lógico', min:1, max:11, neutral:6, telemetry:['kerbHandling','frontPlatform','frontLockupRisk'], tradeoff:'mais rígida melhora plataforma aero; piora zebra e travamento' },
      { id:'rearSuspension', label:'Suspensão traseira', unit:'N/mm lógico', min:1, max:11, neutral:6, telemetry:['traction','rearPlatform','rearOverheatRisk'], tradeoff:'mais macia ajuda tração; muito macia instabiliza alta velocidade' },
      { id:'frontAntiRoll', label:'Barra dianteira', unit:'clicks', min:1, max:11, neutral:6, telemetry:['rotation','frontWear','midCornerBalance'], tradeoff:'mais rígida reduz rolagem; pode gerar subesterço' },
      { id:'rearAntiRoll', label:'Barra traseira', unit:'clicks', min:1, max:11, neutral:6, telemetry:['rotation','rearWear','tractionStability'], tradeoff:'mais rígida gira melhor; piora tração e pneus traseiros' },
      { id:'camberFront', label:'Cambagem dianteira', unit:'°', min:-3.8, max:-2.0, neutral:-3.0, telemetry:['cornerGrip','frontWear','temperatureSpread'], tradeoff:'mais negativa ganha curva rápida; aumenta desgaste interno' },
      { id:'camberRear', label:'Cambagem traseira', unit:'°', min:-2.4, max:-1.0, neutral:-1.7, telemetry:['tractionContact','rearWear','tempSpread'], tradeoff:'menos negativa melhora tração; mais negativa ajuda curva sustentada' },
      { id:'toeFront', label:'Toe dianteiro', unit:'°', min:0.02, max:0.18, neutral:0.1, telemetry:['turnIn','straightDrag','frontTemp'], tradeoff:'mais toe melhora resposta; aumenta arrasto e temperatura' },
      { id:'toeRear', label:'Toe traseiro', unit:'°', min:0.10, max:0.34, neutral:0.22, telemetry:['rearStability','drag','rearTemp'], tradeoff:'mais toe estabiliza; reduz reta e aquece pneu' },
      { id:'differentialOnThrottle', label:'Diferencial aceleração', unit:'%', min:45, max:85, neutral:65, telemetry:['traction','wheelspin','cornerExit'], tradeoff:'mais bloqueado melhora tração progressiva; aumenta subesterço na saída' },
      { id:'differentialOffThrottle', label:'Diferencial desaceleração', unit:'%', min:35, max:75, neutral:55, telemetry:['entryRotation','rearLockRisk','brakingStability'], tradeoff:'mais aberto gira melhor; mais fechado estabiliza frenagem' },
      { id:'brakeBias', label:'Balanço de freio', unit:'% dianteiro', min:52, max:60, neutral:56, telemetry:['frontBrakeTemp','rearLockRisk','rotationEntry'], tradeoff:'dianteiro demais trava frente; traseiro demais instabiliza' },
      { id:'tyrePressureFront', label:'Pressão dianteira', unit:'psi', min:20.0, max:25.0, neutral:22.5, telemetry:['warmup','contactPatch','frontWear'], tradeoff:'maior melhora resposta e reta; reduz contato e aquece' },
      { id:'tyrePressureRear', label:'Pressão traseira', unit:'psi', min:19.0, max:24.0, neutral:21.5, telemetry:['traction','rearWear','warmup'], tradeoff:'menor ajuda tração; pode aumentar deformação e aquecimento' },
      { id:'engineMap', label:'Mapa de motor', unit:'modo', min:1, max:5, neutral:3, telemetry:['fuelUse','engineTemp','deployPace'], tradeoff:'modo alto aumenta ritmo, temperatura e consumo' }
    ],
    trackArchetypes: [
      { id:'street-high-downforce', label:'Rua / alta carga', preference:{ frontWing:8, rearWing:9, rideHeightFront:35, rideHeightRear:60, brakeBias:56.8, tyrePressureRear:20.8 }, focus:['tração','zebra','freio','aquecimento traseiro'] },
      { id:'power-low-drag', label:'Potência / baixa carga', preference:{ frontWing:4, rearWing:4, rideHeightFront:31, rideHeightRear:53, brakeBias:55.2, engineMap:4 }, focus:['reta','DRS','ERS','arrasto'] },
      { id:'balanced-permanent', label:'Autódromo balanceado', preference:{ frontWing:6, rearWing:6, rideHeightFront:33, rideHeightRear:56, brakeBias:56, engineMap:3 }, focus:['setor misto','degradação','janela de pneus'] },
      { id:'front-limited', label:'Limitado dianteiro', preference:{ frontWing:7, frontAntiRoll:5, camberFront:-3.3, tyrePressureFront:22.2 }, focus:['subesterço','aquecimento dianteiro','entrada de curva'] },
      { id:'rear-limited', label:'Limitado traseiro', preference:{ rearWing:7, rearSuspension:5, rearAntiRoll:4, differentialOnThrottle:58, tyrePressureRear:20.6 }, focus:['tração','wheelspin','pneu traseiro'] }
    ],
    practiceProgrammes: [
      { id:'baseline', label:'Baseline aero e mecânico', laps:6, outputs:['correlationScore','balanceOffset','dragIndex','tyreWindow'] },
      { id:'long-run', label:'Long run de corrida', laps:10, outputs:['degradationPerLap','fuelCorrectedPace','thermalDrift','brakeStability'] },
      { id:'qualy-sim', label:'Simulação de classificação', laps:4, outputs:['peakGrip','tyreWarmup','ersDeploy','trafficSensitivity'] },
      { id:'race-start', label:'Largada e tração', laps:3, outputs:['wheelspinRisk','clutchLaunch','rearTempSpike','firstLapRisk'] }
    ],
    telemetryCorrelations: [
      'asa dianteira altera delta de entrada e temperatura dianteira',
      'asa traseira altera tração, arrasto e estabilidade em alta',
      'altura altera carga de assoalho e risco de bottoming',
      'suspensão e barras alteram zebra, rotação e desgaste',
      'cambagem/toe alteram temperatura interna, desgaste e reta',
      'pressão altera contato, aquecimento, desgaste e resposta',
      'diferencial altera tração, wheelspin e rotação',
      'brake bias altera travamento, freio e confiança de entrada',
      'mapa motor altera temperatura, consumo e ritmo real'
    ],
    decisionRules: [
      { id:'understeer-entry', trigger:'frontLoad baixo e brakeBias alto', advice:'aumentar asa dianteira ou reduzir brake bias 0.4-0.8 ponto' },
      { id:'rear-overheat-exit', trigger:'rearTemp alto e wheelspin', advice:'reduzir diferencial on-throttle, amaciar traseira ou baixar pressão traseira' },
      { id:'drag-too-high', trigger:'velocidade baixa com DRS/ERS bom', advice:'reduzir asa traseira ou toe traseiro se a pista permitir' },
      { id:'bottoming', trigger:'perda em reta com altura baixa', advice:'subir altura dianteira/traseira 1-2 mm e preservar carga consistente' },
      { id:'brake-instability', trigger:'freio traseiro quente e lock risk', advice:'mover bias para frente ou fechar diferencial off-throttle' },
      { id:'tyre-pressure-high', trigger:'pressão acima da janela e desgaste acelerado', advice:'baixar pressão inicial e reduzir toe/cambagem agressivos' }
    ],
    targetMetrics: { minParameters:18, minTrackArchetypes:5, minPracticeProgrammes:4, minCorrelations:9, minDecisionRules:6, minScore:98 },
    realismNotice: 'Modelo técnico plausível para simulador; não contém telemetria proprietária oficial nem dados sigilosos de equipes reais.'
  });
  globalThis.F1M_SETUP_ENGINEERING_DATA = data;
})();
