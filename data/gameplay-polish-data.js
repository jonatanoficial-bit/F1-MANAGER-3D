(() => {
  'use strict';
  const data = Object.freeze({
    schema: 1,
    phase: 24,
    dataPack: 'gameplay-perfect-beta-2026-06-20',
    channel: 'gameplay-perfect-beta',
    goal: 'aumentar a sensação de jogo real: decisão humana, batalhas claras, pneus relevantes, pit wall útil, ultrapassagens justas e drama esportivo sem trapaça invisível',
    profiles: [
      { id:'realistic', label:'Realista', paceWindow:.022, battleBias:.54, riskBias:.92, tyreWeight:.34, playerAgency:.74 },
      { id:'cinematic', label:'Cinematográfico', paceWindow:.032, battleBias:.72, riskBias:1.05, tyreWeight:.30, playerAgency:.82 },
      { id:'hardcore', label:'Hardcore', paceWindow:.018, battleBias:.48, riskBias:1.18, tyreWeight:.42, playerAgency:.68 }
    ],
    battleTriggers: [
      { id:'drs-train', label:'Trem de DRS', gapMax:1.2, minLap:2, effect:'slipstream pressure and ERS attack' },
      { id:'tyre-offset', label:'Offset de pneus', gapMax:2.4, tyreDelta:14, effect:'fresh tyres attack old tyres' },
      { id:'team-orders', label:'Duelo de equipe', gapMax:1.8, sameTeam:true, effect:'driver morale and board pressure' },
      { id:'undercut-window', label:'Janela de undercut', gapMax:3.5, pitWindow:true, effect:'pit wall recommendation' },
      { id:'rain-risk', label:'Pista instável', weather:'variable', effect:'errors, grip swings and conservative choices' }
    ],
    pitWallRules: [
      'recomendar ataque quando pneus > 55%, ERS alto e gap menor que 1.2s',
      'recomendar economia quando pneus < 25% ou condição < 55%',
      'sugerir pit quando piloto está na janela, perdeu ritmo ou aparece undercut claro',
      'não punir jogador por escolha manual; apenas mostrar risco, oportunidade e consequência',
      'registrar mensagens curtas no rádio para aumentar leitura cinematográfica'
    ],
    fairnessRules: [
      'sem catch-up invisível contra o jogador',
      'IA usa os mesmos fatores de pneu, carro, piloto, pista e tráfego',
      'eventos dramáticos são limitados por volta e por corrida',
      'risco aumenta com ataque, chuva, desgaste e baixa consistência',
      'resultado continua auditável por telemetria e logs'
    ],
    telemetryHud: ['battleIntensity','pitWallAdvice','riskLevel','playerAgency','overtakeWindow','tyreOffset'],
    targetMetrics: { minProfiles:3, minBattleTriggers:5, minPitWallRules:5, minFairnessRules:5, minHudSignals:6, minScore:96 }
  });
  globalThis.F1M_GAMEPLAY_POLISH_DATA = data;
})();
