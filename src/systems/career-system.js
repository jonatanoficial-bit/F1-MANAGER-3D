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
      quality:{ difficulty:'normal', betaScore:0, lastCheck:null, checks:[], performanceReport:null, performanceHistory:[], ciGate:null, mobileUx:null, i18n:null },
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
      architecture:{ version:5, persistence:'F1M_SAVE_ENVELOPE_V2', dataContracts:1, qualityGate:1, modules:['career','race','persistence','ui','assets','save-vault','performance','ci-gate','viewport','mobile-ux','safe-area','i18n','localization'] },
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
      { id:'i18n', ok:Number(targetSchema) < 8 || Boolean(state?.settings?.language) || Number(state?.architecture?.i18n || 0) >= 1, detail:Number(targetSchema) < 8 ? 'não exigido' : (state?.settings?.language || 'ausente') }
    ];
    return { ok:checks.every(check => check.ok), checks };
  }

  core.career = Object.freeze({ createInitialState, migrateState, validateState });
})();
