/* Fase 16: Carreira viva profunda.
   Dados leves, sem imagens ou áudio binário. Todos os assets continuam preservados pelo manifesto. */
globalThis.F1M_LIVING_CAREER_DATA = Object.freeze({
  schema: 1,
  phase: 16,
  philosophy: 'multi-season-living-career-no-invisible-cheats',
  departments: [
    { id:'aero', label:'Aerodinâmica', facility:'windTunnel', baseCost:420000, monthlyCost:62000, effect:{ car:'aero', gain:2.1 }, risk:'correlation' },
    { id:'powerUnit', label:'Unidade de potência', facility:'dyno', baseCost:510000, monthlyCost:76000, effect:{ car:'engine', gain:1.9 }, risk:'reliability' },
    { id:'chassis', label:'Chassi e materiais', facility:'composites', baseCost:460000, monthlyCost:69000, effect:{ car:'chassis', gain:1.8 }, risk:'weight' },
    { id:'raceOps', label:'Operações de corrida', facility:'simulator', baseCost:260000, monthlyCost:42000, effect:{ car:'pitStop', gain:1.6 }, risk:'fatigue' },
    { id:'academy', label:'Academia de pilotos', facility:'academyCenter', baseCost:310000, monthlyCost:48000, effect:{ morale:2, scouting:3 }, risk:'longTerm' },
    { id:'commercial', label:'Comercial e patrocínio', facility:'brandStudio', baseCost:230000, monthlyCost:36000, effect:{ sponsor:3, press:2 }, risk:'expectation' }
  ],
  facilities: [
    { id:'windTunnel', label:'Túnel de vento', maxLevel:5, upgradeBase:750000, upkeepBase:65000, unlock:'aero', impact:'Pacotes aerodinâmicos mais previsíveis e menor risco de correlação.' },
    { id:'cfdCluster', label:'Cluster CFD', maxLevel:5, upgradeBase:640000, upkeepBase:56000, unlock:'aero', impact:'Acelera pesquisa e permite trabalhar em dois conceitos por temporada.' },
    { id:'dyno', label:'Dinamômetro', maxLevel:5, upgradeBase:830000, upkeepBase:72000, unlock:'powerUnit', impact:'Melhora potência, refrigeração e confiabilidade do motor.' },
    { id:'composites', label:'Materiais compostos', maxLevel:5, upgradeBase:700000, upkeepBase:61000, unlock:'chassis', impact:'Reduz peso, melhora rigidez e protege contra danos.' },
    { id:'simulator', label:'Simulador de corrida', maxLevel:5, upgradeBase:520000, upkeepBase:49000, unlock:'raceOps', impact:'Melhora setup, estratégia, treino de pilotos e relargadas.' },
    { id:'pitGym', label:'Centro de pit crew', maxLevel:5, upgradeBase:430000, upkeepBase:45000, unlock:'raceOps', impact:'Reduz tempo médio de parada e risco de unsafe release.' },
    { id:'academyCenter', label:'Centro de academia', maxLevel:5, upgradeBase:560000, upkeepBase:44000, unlock:'academy', impact:'Gera jovens talentos, reputação e opções de longo prazo.' },
    { id:'brandStudio', label:'Estúdio de marca', maxLevel:5, upgradeBase:390000, upkeepBase:38000, unlock:'commercial', impact:'Atrai patrocinadores, melhora mídia e protege reputação em crises.' }
  ],
  staffArchetypes: [
    { id:'technicalDirector', label:'Diretor técnico', salary:185000, scarcity:0.22, effects:{ aero:2, chassis:2, politics:1 } },
    { id:'headOfAero', label:'Chefe de aerodinâmica', salary:142000, scarcity:0.28, effects:{ aero:4, correlation:2 } },
    { id:'headOfStrategy', label:'Chefe de estratégia', salary:118000, scarcity:0.35, effects:{ strategy:4, pressure:-1 } },
    { id:'pitCrewCoach', label:'Treinador de pit crew', salary:86000, scarcity:0.42, effects:{ pitStop:4, unsafeRelease:-2 } },
    { id:'sportingDirector', label:'Diretor esportivo', salary:112000, scarcity:0.31, effects:{ market:3, academy:2, politics:2 } },
    { id:'mediaOfficer', label:'Chefe de imprensa', salary:64000, scarcity:0.55, effects:{ press:4, sponsor:2 } }
  ],
  sponsorTiers: [
    { id:'local', label:'Regional', minReputation:0, advance:220000, raceBonus:54000, pressure:2, clauses:['presença em mídia local','meta flexível'] },
    { id:'national', label:'Nacional', minReputation:35, advance:620000, raceBonus:128000, pressure:7, clauses:['top 10 frequente','ativação digital'] },
    { id:'global', label:'Global', minReputation:60, advance:1450000, raceBonus:260000, pressure:13, clauses:['pódios','imagem internacional'] },
    { id:'title', label:'Title sponsor', minReputation:76, advance:2800000, raceBonus:430000, pressure:20, clauses:['nome no time','metas rígidas','obrigações de imprensa'] }
  ],
  academyPipeline: [
    { id:'karting', label:'Karting nacional', cost:90000, months:6, ceiling:72, probability:0.42 },
    { id:'regionalF4', label:'F4 regional', cost:180000, months:9, ceiling:78, probability:0.34 },
    { id:'internationalF3', label:'F3 internacional', cost:420000, months:12, ceiling:84, probability:0.24 },
    { id:'eliteJunior', label:'Programa elite júnior', cost:900000, months:18, ceiling:91, probability:0.14 }
  ],
  boardPolitics: {
    factions:[
      { id:'finance', label:'Conselho financeiro', wants:'caixa positivo', pressureWhen:'déficit mensal', bonus:'orçamento estável' },
      { id:'technical', label:'Ala técnica', wants:'desenvolvimento agressivo', pressureWhen:'carro estagnado', bonus:'upgrades entregues' },
      { id:'commercial', label:'Comercial', wants:'mídia e patrocinadores', pressureWhen:'baixa exposição', bonus:'novos contratos' },
      { id:'sporting', label:'Departamento esportivo', wants:'pilotos motivados', pressureWhen:'moral baixa', bonus:'academia ativa' }
    ],
    boardReviewEveryRaces: 4,
    crisisThreshold: 78,
    confidenceTarget: 62
  },
  regulationChangePool: [
    { id:'aero2027', label:'Novo piso aerodinâmico', season:2027, affected:['aero','chassis'], severity:0.18, preparation:'Investir em túnel de vento e CFD' },
    { id:'engineCooling2027', label:'Regras de refrigeração', season:2027, affected:['engine','reliability'], severity:0.12, preparation:'Melhorar dinamômetro e confiabilidade' },
    { id:'tyreBlankets', label:'Restrição de cobertores de pneus', season:2028, affected:['tyreWear','raceOps'], severity:0.15, preparation:'Simulador e treino de pilotos' },
    { id:'costCapTightening', label:'Teto orçamentário mais rígido', season:2028, affected:['budget','facilities'], severity:0.2, preparation:'Reduzir custo fixo e negociar patrocínios' }
  ],
  pressNarratives: [
    { id:'rise', label:'Projeto em ascensão', trigger:'top8 streak', press:+5, sponsor:+3, pressure:+2 },
    { id:'crisis', label:'Crise de resultados', trigger:'bottom five', press:-7, sponsor:-4, pressure:+9 },
    { id:'academy', label:'Nova geração da academia', trigger:'academy investment', press:+4, sponsor:+2, pressure:-1 },
    { id:'factory', label:'Fábrica trabalha dia e noite', trigger:'major upgrade', press:+2, sponsor:+1, pressure:+3 }
  ],
  auditTargets: {
    minDepartments: 6,
    minFacilities: 8,
    minStaffArchetypes: 6,
    minSponsorTiers: 4,
    minRegulationChanges: 4,
    requiredSystems: ['staff','facilities','departments','research','sponsors','budget','politics','academy','market','press','rivalries','regulations','teamEvolution','multiSeason']
  }
});
