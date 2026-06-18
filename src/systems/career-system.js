(() => {
  'use strict';
  const root = globalThis;
  const core = root.F1M_CORE = root.F1M_CORE || {};

  function createInitialState(options = {}){
    const standings = options.standings || { F1:{}, F2:{} };
    return {
      profile:null,
      mode:'realistic',
      currentSeries:'F2',
      currentTeam:null,
      roundIndex:0,
      money:0,
      reputation:0,
      sponsor:null,
      raceStrategy:{ plan:'balanced', startCompound:'soft', stopBias:'balanced' },
      staff:{ designers:1, mechanics:1, strategists:1, raceEngineers:1, scouts:1, pitCrew:1 },
      facilities:{ hq:1, simulator:1, factory:1, scouting:0 },
      rosters:options.rosters || {},
      driverContracts:{},
      driverProgress:{},
      seasonArchive:[],
      tutorial:{ completed:false, step:0 },
      quality:{ difficulty:'normal', betaScore:0, lastCheck:null, checks:[], performanceReport:null, performanceHistory:[], ciGate:null, mobileUx:null, i18n:null, vehiclePhysics:null, strategyAI:null },
      settings:{ language:'pt-BR', locale:'pt-BR' },
      viewport:{ hudMode:'auto', safeAreaReady:true, fullscreenPromptSeen:false, touchProfile:'auto', mobileUxPhase:7 },
      saveSlotsMeta:{},
      hallOfFame:[],
      driverDevelopmentLog:[],
      carEvolutionLog:[],
      car:{ aero:50, engine:50, chassis:50, reliability:55, tyreWear:55, pitStop:55, fuel:55 },
      setup:{ preset:'balanced', aeroBalance:50, engineMode:50, suspension:50, tyrePressure:50 },
      standings,
      f1Standings:standings.F1,
      lastQualifying:[],
      lastRace:[],
      offers:[],
      inbox:[],
      unreadMessages:0,
      seasonYear:2026,
      seasonNumber:1,
      seasonStats:{ races:0, bestFinish:null, podiums:0, wins:0, objectiveProgress:0 },
      completedRaces:0,
      saveSchema:Number(options.saveSchema || 0),
      architecture:{ version:10, persistence:'F1M_SAVE_ENVELOPE_V2', dataContracts:1, qualityGate:1, sportingDatabase:1, regulationEngine:1, vehiclePhysics:1, modules:['career','race','persistence','ui','assets','save-vault','performance','ci-gate','viewport','mobile-ux','safe-area','i18n','localization','sporting-db','calendar-f1-f2','rules-engine','weekend-sessions','official-classification','vehicle-physics','tyre-model','ers-drs','damage-model','track-evolution','strategy-ai','overtake-model','pit-strategy','neutralization-model'] },
      saveVault:{ format:'F1M_SAVE_ENVELOPE_V2', backups:5, journal:'F1M_SAVE_JOURNAL_V1', lastVerifiedAt:null },
      createdAt:new Date().toISOString()
    };
  }

  function migrateState(input, options = {}){
    const state = input && typeof input === 'object' ? input : {};
    const targetSchema = Number(options.targetSchema || 0);
    const calendarLength = Math.max(1, Number(options.calendarLength || 1));
    const applied = [];
    let current = Number(state.saveSchema || 0);

    if(current < 1 && targetSchema >= 1){
      const expectedRound = Math.min(Number(state.completedRaces || 0), calendarLength - 1);
      if(state.currentSeries === 'F2' && Number(state.roundIndex || 0) !== expectedRound) state.roundIndex = expectedRound;
      current = 1; applied.push(1);
    }
    if(current < 2 && targetSchema >= 2){
      state.quality = state.quality || { difficulty:'normal', betaScore:0, lastCheck:null, checks:[] };
      state.quality.systemDiagnostics = state.quality.systemDiagnostics || null;
      state.quality.systemDiagnosticsHistory = Array.isArray(state.quality.systemDiagnosticsHistory) ? state.quality.systemDiagnosticsHistory : [];
      current = 2; applied.push(2);
    }
    if(current < 3 && targetSchema >= 3){
      state.architecture = {
        version:1,
        persistence:'F1M_SAVE_ENVELOPE_V1',
        dataContracts:1,
        modules:['career','race','persistence','ui','assets'],
        migratedAt:new Date().toISOString(),
        migratedBy:String(options.buildCode || 'dev')
      };
      state.session = state.session || { lastScreen:'home', lastTab:'dashboard', lastActiveAt:new Date().toISOString() };
      current = 3; applied.push(3);
    }
    if(current < 4 && targetSchema >= 4){
      state.assetIntegrity = state.assetIntegrity || { registryVersion:1, lastAuditAt:null, lastScore:null, fallbackCount:0 };
      state.architecture = {...(state.architecture || {}), version:2, assetRegistry:1, modules:[...new Set([...(state.architecture?.modules || []),'assets'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 4; applied.push(4);
    }
    if(current < 5 && targetSchema >= 5){
      state.saveVault = state.saveVault || {};
      state.saveVault = {
        format:'F1M_SAVE_ENVELOPE_V2',
        journal:'F1M_SAVE_JOURNAL_V1',
        backups:5,
        portableExport:'F1M_PORTABLE_SAVE_V1',
        lastVerifiedAt:new Date().toISOString(),
        migratedBy:String(options.buildCode || 'dev'),
        ...state.saveVault
      };
      state.architecture = {...(state.architecture || {}), version:3, persistence:'F1M_SAVE_ENVELOPE_V2', saveVault:1, modules:[...new Set([...(state.architecture?.modules || []),'save-vault'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 5; applied.push(5);
    }
    if(current < 6 && targetSchema >= 6){
      state.quality = state.quality || {};
      state.quality.performanceReport = state.quality.performanceReport || null;
      state.quality.performanceHistory = Array.isArray(state.quality.performanceHistory) ? state.quality.performanceHistory : [];
      state.quality.ciGate = state.quality.ciGate || { status:'not-run', requiredScripts:['audit','test:performance','test:visual','test:ci'], migratedBy:String(options.buildCode || 'dev') };
      state.architecture = {...(state.architecture || {}), version:4, qualityGate:1, modules:[...new Set([...(state.architecture?.modules || []),'performance','ci-gate'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 6; applied.push(6);
    }
    if(current < 7 && targetSchema >= 7){
      state.viewport = state.viewport || {};
      state.viewport = {
        hudMode:'auto',
        safeAreaReady:true,
        fullscreenPromptSeen:false,
        touchProfile:'auto',
        mobileUxPhase:7,
        migratedBy:String(options.buildCode || 'dev'),
        ...state.viewport
      };
      state.quality = state.quality || {};
      state.quality.mobileUx = state.quality.mobileUx || { status:'not-run', safeArea:true, hudAdaptive:true, fullscreen:true, migratedBy:String(options.buildCode || 'dev') };
      state.architecture = {...(state.architecture || {}), version:5, viewportManager:1, modules:[...new Set([...(state.architecture?.modules || []),'viewport','mobile-ux','safe-area','i18n','localization'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 7; applied.push(7);
    }
    if(current < 8 && targetSchema >= 8){
      state.settings = state.settings || {};
      state.settings.language = state.settings.language || 'pt-BR';
      state.settings.locale = state.settings.locale || 'pt-BR';
      state.quality = state.quality || {};
      state.quality.i18n = state.quality.i18n || { status:'not-run', supported:['pt-BR','en','es'], fallback:'pt-BR', migratedBy:String(options.buildCode || 'dev') };
      state.architecture = {...(state.architecture || {}), version:6, i18n:1, modules:[...new Set([...(state.architecture?.modules || []),'i18n','localization'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 8; applied.push(8);
    }
    if(current < 9 && targetSchema >= 9){
      state.sporting = state.sporting || {};
      state.sporting = {
        season:2026,
        dataPack:'official-snapshot-2026-06-18',
        activeCalendarBySeries:true,
        f1Rounds:22,
        f2Rounds:14,
        rulesVersion:1,
        legalReview:'requires-licensing-review',
        migratedBy:String(options.buildCode || 'dev'),
        ...state.sporting
      };
      state.quality = state.quality || {};
      state.quality.sportingData = state.quality.sportingData || { status:'not-run', f1Rounds:22, f2Rounds:14, f2Drivers:22, f2Teams:11, migratedBy:String(options.buildCode || 'dev') };
      state.architecture = {...(state.architecture || {}), version:7, sportingDatabase:1, modules:[...new Set([...(state.architecture?.modules || []),'sporting-db','calendar-f1-f2','rules-engine','legal-mode'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 9; applied.push(9);
    }

    if(current < 10 && targetSchema >= 10){
      state.regulations = state.regulations || {};
      state.regulations = {
        season:2026,
        dataPack:'official-regulations-snapshot-2026-06-18',
        f1Qualifying:'Q1_Q2_Q3',
        f1Sprint:true,
        f2SprintFeature:true,
        penalties:true,
        flags:true,
        parcFerme:true,
        officialClassification:true,
        legalReview:'requires-licensing-review',
        migratedBy:String(options.buildCode || 'dev'),
        ...state.regulations
      };
      state.weekend = state.weekend || { practiceDone:false, setupConfidence:50, tyreKnowledge:50, qualyFocus:'balanced', engineerNote:'Regulamento Fase 10 ativo: treinos, classificação e direção de prova.' };
      state.quality = state.quality || {};
      state.quality.regulations = state.quality.regulations || { status:'not-run', f1QStages:3, f2Weekend:'sprint-feature', penalties:true, flags:true, migratedBy:String(options.buildCode || 'dev') };
      state.architecture = {...(state.architecture || {}), version:8, regulationEngine:1, modules:[...new Set([...(state.architecture?.modules || []),'rules-engine','weekend-sessions','official-classification','penalties','flags','parc-ferme'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 10; applied.push(10);
    }

    if(current < 11 && targetSchema >= 11){
      state.vehiclePhysics = state.vehiclePhysics || {};
      state.vehiclePhysics = {
        dataPack:'vehicle-physics-development-model-2026-06-18',
        tyres:true,
        tyreTemperature:true,
        fuelMass:true,
        ers:true,
        drs:true,
        brakes:true,
        engineTemperature:true,
        damage:true,
        reliability:true,
        dirtyAir:true,
        trackEvolution:true,
        migratedBy:String(options.buildCode || 'dev'),
        ...state.vehiclePhysics
      };
      state.quality = state.quality || {};
      state.quality.vehiclePhysics = state.quality.vehiclePhysics || { status:'not-run', systems:10, telemetry:true, migratedBy:String(options.buildCode || 'dev') };
      state.architecture = {...(state.architecture || {}), version:9, vehiclePhysics:1, modules:[...new Set([...(state.architecture?.modules || []),'vehicle-physics','tyre-model','ers-drs','brake-thermal','engine-thermal','damage-model','dirty-air','track-evolution','strategy-ai','overtake-model','pit-strategy','neutralization-model'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 11; applied.push(11);
    }

    if(current < 12 && targetSchema >= 12){
      state.strategyAI = state.strategyAI || {};
      state.strategyAI = {
        dataPack:'race-ai-strategy-development-model-2026-06-18',
        undercutOvercut:true,
        trafficModel:true,
        attackDefense:true,
        humanError:true,
        pitCrew:true,
        doubleStacking:true,
        unsafeRelease:true,
        safetyCar:true,
        vsc:true,
        redFlag:true,
        restarts:true,
        migratedBy:String(options.buildCode || 'dev'),
        ...state.strategyAI
      };
      state.quality = state.quality || {};
      state.quality.strategyAI = state.quality.strategyAI || { status:'not-run', systems:13, overtaking:true, neutralizations:true, migratedBy:String(options.buildCode || 'dev') };
      state.architecture = {...(state.architecture || {}), version:10, strategyAI:1, modules:[...new Set([...(state.architecture?.modules || []),'strategy-ai','undercut-overcut','overtake-model','pit-crew','neutralization-model','restarts'])], migratedAt:new Date().toISOString(), migratedBy:String(options.buildCode || 'dev')};
      current = 12; applied.push(12);
    }
    state.saveSchema = Math.min(targetSchema, Math.max(current, Number(state.saveSchema || 0)));
    return { state, from:Number(input?.saveSchema || 0), to:state.saveSchema, applied };
  }

  function validateState(state, targetSchema = 0){
    const checks = [
      { id:'object', ok:Boolean(state) && typeof state === 'object', detail:'estado em memória' },
      { id:'schema', ok:Number(state?.saveSchema || 0) === Number(targetSchema), detail:`${state?.saveSchema || 0}/${targetSchema}` },
      { id:'series', ok:['F1','F2'].includes(state?.currentSeries || 'F2'), detail:String(state?.currentSeries || 'F2') },
      { id:'round', ok:Number.isInteger(Number(state?.roundIndex || 0)) && Number(state?.roundIndex || 0) >= 0, detail:String(state?.roundIndex || 0) },
      { id:'collections', ok:Array.isArray(state?.inbox) && Array.isArray(state?.lastRace) && Array.isArray(state?.offers), detail:'inbox/lastRace/offers' },
      { id:'architecture', ok:Number(state?.architecture?.version || 0) >= 1, detail:String(state?.architecture?.persistence || 'ausente') },
      { id:'asset-integrity', ok:Number(targetSchema) < 4 || Boolean(state?.assetIntegrity), detail:state?.assetIntegrity ? 'registro ativo' : 'ausente' },
      { id:'save-vault', ok:Number(targetSchema) < 5 || state?.saveVault?.format === 'F1M_SAVE_ENVELOPE_V2', detail:state?.saveVault?.format || 'ausente' },
      { id:'quality-gate', ok:Number(targetSchema) < 6 || Boolean(state?.quality?.ciGate) || Number(state?.architecture?.qualityGate || 0) >= 1, detail:Number(targetSchema) < 6 ? 'não exigido' : (state?.quality?.ciGate?.status || 'arquitetura registrada') },
      { id:'viewport-manager', ok:Number(targetSchema) < 7 || Boolean(state?.viewport?.safeAreaReady) || Number(state?.architecture?.viewportManager || 0) >= 1, detail:Number(targetSchema) < 7 ? 'não exigido' : (state?.viewport?.hudMode || 'auto') },
      { id:'i18n', ok:Number(targetSchema) < 8 || Boolean(state?.settings?.language) || Number(state?.architecture?.i18n || 0) >= 1, detail:Number(targetSchema) < 8 ? 'não exigido' : (state?.settings?.language || 'ausente') },
      { id:'sporting-db', ok:Number(targetSchema) < 9 || Boolean(state?.sporting?.activeCalendarBySeries) || Number(state?.architecture?.sportingDatabase || 0) >= 1, detail:Number(targetSchema) < 9 ? 'não exigido' : (state?.sporting?.dataPack || 'registrado') },
      { id:'regulation-engine', ok:Number(targetSchema) < 10 || Boolean(state?.regulations?.officialClassification) || Number(state?.architecture?.regulationEngine || 0) >= 1, detail:Number(targetSchema) < 10 ? 'não exigido' : (state?.regulations?.dataPack || 'registrado') },
      { id:'vehicle-physics', ok:Number(targetSchema) < 11 || Boolean(state?.vehiclePhysics?.tyreTemperature) || Number(state?.architecture?.vehiclePhysics || 0) >= 1, detail:Number(targetSchema) < 11 ? 'não exigido' : (state?.vehiclePhysics?.dataPack || 'registrado') },
      { id:'strategy-ai', ok:Number(targetSchema) < 12 || Boolean(state?.strategyAI?.undercutOvercut) || Number(state?.architecture?.strategyAI || 0) >= 1, detail:Number(targetSchema) < 12 ? 'não exigido' : (state?.strategyAI?.dataPack || 'registrado') }
    ];
    return { ok:checks.every(check => check.ok), checks };
  }

  core.career = Object.freeze({ createInitialState, migrateState, validateState });
})();
