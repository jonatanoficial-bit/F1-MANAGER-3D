globalThis.F1M_VEHICLE_DATA = Object.freeze({
  schema: 1,
  season: 2026,
  generatedAt: '2026-06-18T18:46:00-03:00',
  sourceTag: 'vehicle-physics-development-model-2026-06-18',
  compounds: {
    soft: { label:'Macio', short:'S', grip:1.022, wear:1.23, warmup:1.18, heat:1.14, idealMin:92, idealMax:108, cliff:18, risk:1.08 },
    medium: { label:'Médio', short:'M', grip:1.000, wear:1.00, warmup:1.00, heat:1.00, idealMin:88, idealMax:104, cliff:16, risk:1.00 },
    hard: { label:'Duro', short:'H', grip:.982, wear:.78, warmup:.82, heat:.88, idealMin:82, idealMax:98, cliff:14, risk:.92 },
    intermediate: { label:'Intermediário', short:'I', grip:.948, wear:1.08, warmup:.96, heat:.92, idealMin:72, idealMax:92, cliff:22, wetOnly:true, risk:1.04 },
    wet: { label:'Chuva', short:'W', grip:.910, wear:1.16, warmup:.90, heat:.82, idealMin:60, idealMax:84, cliff:26, wetOnly:true, risk:1.10 }
  },
  paceModes: {
    save: { label:'Poupar', pace:.948, tyreWear:.72, fuel:.76, ers:.55, brakeHeat:.72, risk:.62, cooling:1.18 },
    normal: { label:'Normal', pace:1.000, tyreWear:1.00, fuel:1.00, ers:1.00, brakeHeat:1.00, risk:1.00, cooling:1.00 },
    attack: { label:'Ataque', pace:1.068, tyreWear:1.46, fuel:1.30, ers:1.42, brakeHeat:1.35, risk:1.62, cooling:.84 }
  },
  systems: {
    ers: { capacity:100, regenBase:.165, deployBase:.42, overtakeThreshold:70, defendThreshold:45, lowPenalty:.974 },
    drs: { enabledAfterLap:2, gapLaps:.090, boost:1.014, disabledWhenWet:true, disabledUnderSafetyCar:true },
    brakes: { idealMin:410, idealMax:820, overheat:980, coolBase:11.5, heatBase:15.4 },
    engine: { idealMin:91, idealMax:108, overheat:116, coolBase:.22, heatBase:.34, damageAt:114 },
    damage: { aeroLossPerPoint:.0019, chassisLossPerPoint:.0013, terminalAt:92 },
    trackEvolution: { startGrip:.965, maxGrip:1.035, rubberPerLap:.0019, rainDecay:.0045, dirtyAirBase:.985, slipstreamBase:1.009 }
  },
  auditTargets: {
    requiredSystems: ['tyreTemperature','fuelMass','ers','drs','brakes','engineTemperature','damage','reliability','dirtyAir','trackEvolution'],
    minimumScore: 92
  },
  notes: 'Modelo determinístico de desenvolvimento para manager/simulador. Ajustar coeficientes por telemetria e balanceamento nas fases seguintes.'
});
