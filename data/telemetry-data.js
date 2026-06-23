(() => {
  'use strict';
  const data = Object.freeze({
    schema: 1,
    phase: 25,
    dataPack: 'realistic-telemetry-simulator-2026-06-20',
    channel: 'realistic-telemetry-simulator',
    goal: 'priorizar simulação técnica, telemetria legível e diagnóstico de engenharia; evitar sensação arcade ou bônus invisível',
    sampling: { hz: 10, packetRetention: 180, miniSectorCount: 3, exportFormat: 'F1M_TELEMETRY_SESSION_V1' },
    signals: [
      { id:'speedKph', label:'Velocidade', unit:'km/h', plausible:[60,365], source:'pace, arrasto, ERS/DRS e perfil da pista' },
      { id:'rpm', label:'RPM', unit:'rpm', plausible:[6500,13000], source:'marcha, velocidade e modo de motor' },
      { id:'gear', label:'Marcha', unit:'', plausible:[1,8], source:'velocidade e fase da curva' },
      { id:'throttle', label:'Acelerador', unit:'%', plausible:[0,100], source:'setor, tração, modo de ritmo e pneus' },
      { id:'brake', label:'Freio', unit:'%', plausible:[0,100], source:'zona de frenagem e temperatura dos freios' },
      { id:'steer', label:'Ângulo volante', unit:'°', plausible:[-32,32], source:'perfil de curva e grip' },
      { id:'lateralG', label:'G lateral', unit:'g', plausible:[0.3,5.5], source:'velocidade, aero e grip' },
      { id:'longitudinalG', label:'G longitudinal', unit:'g', plausible:[-5.2,2.4], source:'freio/aceleração' },
      { id:'tyreSurfaceC', label:'Pneu superfície', unit:'°C', plausible:[70,125], source:'ataque, ar sujo, curva e composto' },
      { id:'tyreCoreC', label:'Pneu carcaça', unit:'°C', plausible:[78,118], source:'energia acumulada por stint' },
      { id:'tyrePressurePsi', label:'Pressão pneus', unit:'psi', plausible:[19,27], source:'temperatura e setup' },
      { id:'brakeTempC', label:'Freio', unit:'°C', plausible:[320,1050], source:'frenagem, resfriamento e tráfego' },
      { id:'fuelKg', label:'Combustível', unit:'kg', plausible:[0,110], source:'voltas restantes e modo motor' },
      { id:'ersPct', label:'ERS', unit:'%', plausible:[0,100], source:'deploy e recuperação' },
      { id:'drsGainKph', label:'Ganho DRS', unit:'km/h', plausible:[0,18], source:'zona DRS e arrasto' },
      { id:'dirtyAirLossPct', label:'Perda ar sujo', unit:'%', plausible:[0,18], source:'gap à frente e downforce' },
      { id:'sectorDelta', label:'Delta setor', unit:'s', plausible:[-2.5,2.5], source:'comparação com referência local' }
    ],
    diagnosisRules: [
      { id:'rear-overheat', threshold:'tyreSurfaceC > 106 && throttle > 78', label:'pneus traseiros acima da janela; perda de tração na saída', advice:'reduzir ataque 1-2 voltas ou antecipar pit' },
      { id:'front-overheat', threshold:'tyreSurfaceC > 103 && brake > 65', label:'dianteiros sobrecarregados em frenagem', advice:'ajustar ritmo e evitar mergulhos em tráfego' },
      { id:'brake-critical', threshold:'brakeTempC > 930', label:'freios em zona crítica', advice:'abrir ar, poupar frenagem e evitar ataque prolongado' },
      { id:'ers-low', threshold:'ersPct < 18', label:'ERS baixo na reta principal', advice:'harvest por uma volta antes de atacar' },
      { id:'dirty-air', threshold:'dirtyAirLossPct > 6', label:'perda de carga por ar sujo', advice:'sair do trem de DRS ou tentar undercut' },
      { id:'fuel-heavy', threshold:'fuelKg > 82', label:'carro pesado no início de stint', advice:'não forçar pneu antes de estabilizar combustível' },
      { id:'pressure-drift', threshold:'tyrePressurePsi > 25.8', label:'pressão alta, área de contato menor', advice:'evitar sobreaquecer e revisar setup no próximo fim de semana' }
    ],
    engineeringViews: ['livePacket','sectorTrace','miniSectorDelta','tyreThermalMap','brakeWindow','ersHarvestDeploy','fuelCorrectedPace','dirtyAirSlipstream','driverComparison','raceEngineerDiagnosis'],
    realismRules: [
      'não criar boost arcade escondido',
      'todo ganho ou perda precisa aparecer em telemetria ou diagnóstico',
      'IA e jogador usam os mesmos sinais de pneus, ERS, combustível, freios, tráfego e pista',
      'aleatoriedade só entra como ruído pequeno e auditável',
      'dados são plausíveis para simulação, não telemetria proprietária oficial',
      'decisão do jogador afeta risco, temperatura e consumo antes de afetar resultado'
    ],
    targetMetrics: { minSignals:17, minDiagnosisRules:7, minViews:10, minRealismRules:6, minScore:98 }
  });
  globalThis.F1M_TELEMETRY_DATA = data;
})();
