globalThis.F1M_REGULATION_DATA = Object.freeze({
  schema: 1,
  season: 2026,
  generatedAt: '2026-06-18T16:54:00-03:00',
  sourceTag: 'official-regulations-snapshot-2026-06-18',
  sources: {
    f1Regulations: 'FIA Formula 1 Sporting Regulations category page snapshot 18/06/2026',
    f2Regulations: '2026 FIA Formula 2 Sporting Regulations v1, 10/12/2025',
    f2PublicGuide: 'FIA Formula 2 Regulations guide snapshot 18/06/2026'
  },
  weekendFormats: {
    F1_GRAND_PRIX: {
      series: 'F1',
      label: 'F1 Grand Prix weekend',
      sessions: [
        { id:'fp1', label:'Treino Livre 1', type:'practice', durationMinutes:60, affects:['setupConfidence','tyreKnowledge'] },
        { id:'fp2', label:'Treino Livre 2', type:'practice', durationMinutes:60, affects:['setupConfidence','racePace'] },
        { id:'fp3', label:'Treino Livre 3', type:'practice', durationMinutes:60, affects:['setupConfidence','qualifyingPace'] },
        { id:'q1', label:'Q1', type:'qualifying', durationMinutes:18, eliminationFrom:16, advances:15 },
        { id:'q2', label:'Q2', type:'qualifying', durationMinutes:15, eliminationFrom:11, advances:10 },
        { id:'q3', label:'Q3', type:'qualifying', durationMinutes:12, eliminationFrom:1, advances:10 },
        { id:'race', label:'Grande Prêmio', type:'race', classification:'race' }
      ],
      gridSource: 'q3-q2-q1-official-order',
      points: [25,18,15,12,10,8,6,4,2,1],
      fastestLapPoint: false,
      compulsoryPitStop: false,
      parcFermeStarts: 'qualifying',
      tyreRule: 'recommended-two-dry-compounds-when-dry',
      lapDistanceFactor: 1
    },
    F1_SPRINT: {
      series: 'F1',
      label: 'F1 Sprint weekend',
      sessions: [
        { id:'fp1', label:'Treino Livre 1', type:'practice', durationMinutes:60, affects:['setupConfidence'] },
        { id:'sprintQualifying', label:'Sprint Qualifying', type:'sprintQualifying', durationMinutes:30, stages:['SQ1','SQ2','SQ3'] },
        { id:'sprint', label:'Sprint', type:'sprint', points:[8,7,6,5,4,3,2,1], lapFactor:.33 },
        { id:'q1', label:'Q1', type:'qualifying', durationMinutes:18, eliminationFrom:16, advances:15 },
        { id:'q2', label:'Q2', type:'qualifying', durationMinutes:15, eliminationFrom:11, advances:10 },
        { id:'q3', label:'Q3', type:'qualifying', durationMinutes:12, eliminationFrom:1, advances:10 },
        { id:'race', label:'Grande Prêmio', type:'race', classification:'race' }
      ],
      gridSource: 'sprint-qualifying-for-sprint-q3-q2-q1-for-grand-prix',
      points: [25,18,15,12,10,8,6,4,2,1],
      sprintPoints: [8,7,6,5,4,3,2,1],
      fastestLapPoint: false,
      parcFermeStarts: 'sprintQualifying',
      tyreRule: 'recommended-two-dry-compounds-when-dry',
      lapDistanceFactor: 1
    },
    F2_STANDARD: {
      series: 'F2',
      label: 'F2 Sprint + Feature weekend',
      sessions: [
        { id:'practice', label:'Treino Livre', type:'practice', durationMinutes:45, affects:['setupConfidence','tyreKnowledge'] },
        { id:'qualifying', label:'Classificação', type:'qualifyingSingle', durationMinutes:30, polePoints:2 },
        { id:'sprint', label:'Sprint Race', type:'sprint', reverseGridTop:10, points:[10,8,6,5,4,3,2,1], lapFactor:.35 },
        { id:'feature', label:'Feature Race', type:'feature', points:[25,18,15,12,10,8,6,4,2,1], compulsoryPitStop:true }
      ],
      gridSource: 'qualifying-feature-top10-reversed-sprint',
      sprintPoints: [10,8,6,5,4,3,2,1],
      featurePoints: [25,18,15,12,10,8,6,4,2,1],
      polePoints: 2,
      fastestLapPoint: 1,
      compulsoryPitStop: true,
      parcFermeStarts: 'qualifying',
      tyreRule: 'feature-race-two-dry-compounds-when-dry',
      lapDistanceFactor: .7
    }
  },
  flags: {
    green: { label:'Verde', effect:'normal racing' },
    yellow: { label:'Amarela', effect:'local slow zone, no overtaking in affected sector' },
    doubleYellow: { label:'Dupla amarela', effect:'major slow zone, prepare to stop' },
    virtualSafetyCar: { label:'VSC', effect:'controlled pace delta' },
    safetyCar: { label:'Safety Car', effect:'field neutralised and gaps reduced' },
    red: { label:'Vermelha', effect:'session suspended and race order frozen' },
    blue: { label:'Azul', effect:'lapped traffic must yield' },
    chequered: { label:'Quadriculada', effect:'session complete' }
  },
  penalties: {
    trackLimits: { label:'Limites de pista', seconds:5, severity:'minor', appliesTo:'race' },
    speedingPitLane: { label:'Velocidade no pit lane', seconds:5, severity:'minor', appliesTo:'race' },
    causingCollision: { label:'Causar colisão', seconds:10, severity:'major', appliesTo:'race' },
    unsafeRelease: { label:'Unsafe release', seconds:10, severity:'major', appliesTo:'race' },
    ignoringFlags: { label:'Ignorar bandeiras', gridPenalty:3, severity:'major', appliesTo:'next-session' },
    componentChange: { label:'Troca de componente', gridPenalty:5, severity:'sporting', appliesTo:'grid' }
  },
  classification: {
    raceTieBreakers: ['distance','totalTime','penaltySeconds','gridPosition'],
    qualifyingTieBreakers: ['stage','time','championshipPosition','entryOrder'],
    dnfClassification: 'classified-by-distance-then-laps',
    resultStates: ['classified','dnf','dns','dsq']
  },
  legalMode: {
    commercialStatus: 'requires-licensing-review',
    note: 'Regras e nomes reais são data pack de desenvolvimento/auditoria. Para lançamento comercial, validar licença ou ativar data pack genérico.'
  }
});
