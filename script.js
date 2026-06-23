(() => {
  const DATA = window.F1M_DATA;
  const CORE = window.F1M_CORE || {};
  const SAVE_SCHEMA = Number(DATA.build?.save_schema || 26);
  const SAVE_KEYS = ['f1_manager_career_2026_v0360', 'f1_manager_career_2026_v0350', 'f1_manager_career_2026_v0340', 'f1_manager_career_2026_v0330', 'f1_manager_career_2026_v0320', 'f1_manager_career_2026_v0310', 'f1_manager_career_2026_v0300', 'f1_manager_career_2026_v0290', 'f1_manager_career_2026_v0280', 'f1_manager_career_2026_v0270', 'f1_manager_career_2026_v0260', 'f1_manager_career_2026_v0250', 'f1_manager_career_2026_v0240', 'f1_manager_career_2026_v0230', 'f1_manager_career_2026_v0220', 'f1_manager_career_2026_v0210', 'f1_manager_career_2026_v0200', 'f1_manager_career_2026_v0190', 'f1_manager_career_2026_v0180', 'f1_manager_career_2026_v0170', 'f1_manager_career_2026_v0160', 'f1_manager_career_2026_v0150', 'f1_manager_career_2026_v0140', 'f1_manager_career_2026_v0130', 'f1_manager_career_2026_v0120', 'f1_manager_career_2026_v0110', 'f1_manager_career_2026_v0100', 'f1_manager_career_2026_v090', 'f1_manager_career_2026_v070', 'f1_manager_career_2026_v060', 'f1_manager_career_2026_v050', 'f1_manager_career_2026_v040', 'f1_manager_career_2026_v020'];
  const ACTIVE_SAVE_KEY = SAVE_KEYS[0];
  const RUNTIME_ERROR_KEY = `${ACTIVE_SAVE_KEY}_runtime_errors`;
  const ASSET_ROOTS = ['assets/'];
  const ASSET_CATALOG = window.F1M_ASSET_CATALOG || { entries:[] };
  const QUALITY_BUDGETS = Object.freeze({ dom_nodes:2200, buttons:260, images_tracked:180, local_storage_bytes:900000, active_save_bytes:260000, frame_probe_ms:420, target_frame_ms:34, warning_frame_ms:50, diagnostic_score_min:90 });
  const assetRegistry = CORE.assets?.createRegistry?.({ catalog:ASSET_CATALOG, roots:ASSET_ROOTS, document, onError:(error,context)=>reportRuntimeError(error,context) }) || null;
  const DATA_REGISTRY = CORE.contracts?.createRegistry?.(DATA) || null;
  const appEvents = CORE.events?.createBus?.({ maxHistory:80, onError:(error,context)=>reportRuntimeError(error,context) }) || null;
  const persistence = CORE.persistence?.createRepository?.({
    activeKey:ACTIVE_SAVE_KEY,
    legacyKeys:SAVE_KEYS.slice(1),
    schema:SAVE_SCHEMA,
    buildCode:DATA.build?.build_code || 'dev',
    backupCount:5,
    maxJournal:20,
    onError:(error,context)=>reportRuntimeError(error,context)
  }) || null;
  const i18nManager = CORE.i18n?.createManager?.({
    catalog:window.F1M_I18N_CATALOG,
    storageKey:`${ACTIVE_SAVE_KEY}_language`,
    document,
    window,
    onError:(error,context)=>reportRuntimeError(error,context)
  }) || null;

  const sportingDb = CORE.sporting?.createDatabase?.({
    data:window.F1M_SPORTING_DATA || DATA.sportingData || {},
    legacy:DATA
  }) || null;

  const regulationEngine = CORE.regulations?.createRegulationEngine?.({
    data:window.F1M_REGULATION_DATA || DATA.regulationData || {},
    sporting:sportingDb
  }) || null;

  const vehiclePhysics = CORE.vehiclePhysics?.createVehiclePhysics?.({
    data:window.F1M_VEHICLE_DATA || DATA.vehicleData || {}
  }) || null;

  const strategyAI = CORE.strategyAI?.createRaceStrategyAI?.({
    data:window.F1M_STRATEGY_DATA || DATA.strategyData || {},
    vehiclePhysics,
    regulationEngine,
    sportingDb
  }) || null;

  const balanceSimulator = CORE.balance?.createBalanceSimulator?.({
    data:window.F1M_BALANCE_DATA || DATA.balanceData || {},
    sportingDb,
    regulationEngine,
    vehiclePhysics,
    strategyAI
  }) || null;

  const visualSystem = CORE.visual3d?.createTrackVisualSystem?.({
    data:window.F1M_VISUAL_DATA || DATA.visualData || {}
  }) || null;

  const audioUI = CORE.audioUI?.createAudioUISystem?.({
    data:window.F1M_AUDIO_UI_DATA || DATA.audioUiData || {},
    window,
    document,
    events:appEvents,
    onError:(error,context)=>reportRuntimeError(error,context)
  }) || null;

  const livingCareer = CORE.livingCareer?.createLivingCareerSystem?.({
    data:window.F1M_LIVING_CAREER_DATA || DATA.livingCareerData || {},
    events:appEvents
  }) || null;

  const backendLaunch = CORE.launch?.createBackendLaunchSystem?.({
    data:window.F1M_BACKEND_LAUNCH_DATA || DATA.backendLaunchData || {},
    events:appEvents,
    persistence
  }) || null;

  const releaseCandidate = CORE.releaseCandidate?.createReleaseCandidateSystem?.({
    data:window.F1M_RELEASE_CANDIDATE_DATA || DATA.releaseCandidateData || {},
    events:appEvents,
    launchSystem:backendLaunch,
    persistence
  }) || null;

  const deployValidation = CORE.deployValidation?.createDeploymentValidationSystem?.({
    data:window.F1M_DEPLOYMENT_DATA || DATA.deploymentData || {},
    events:appEvents,
    assetRegistry,
    persistence,
    releaseCandidate
  }) || null;

  const operationsSystem = CORE.operations?.createOperationsSystem?.({
    data:window.F1M_OPERATIONS_DATA || DATA.operationsData || {},
    events:appEvents,
    assetRegistry,
    persistence,
    releaseCandidate,
    deployValidation
  }) || null;

  const assetRestoreSystem = CORE.assetRestore?.createAssetRestoreSystem?.({
    data:window.F1M_ASSET_RESTORE_DATA || DATA.assetRestoreData || {},
    catalog:ASSET_CATALOG,
    events:appEvents,
    assetRegistry,
    deployValidation,
    operationsSystem
  }) || null;

  const visualHotfix = CORE.visualHotfix?.createVisualHotfixSystem?.({
    data:window.F1M_VISUAL_HOTFIX_DATA || DATA.visualHotfixData || {},
    events:appEvents,
    assetRegistry,
    viewportController:null
  }) || null;

  const publicBetaAssets = CORE.publicBetaAssets?.createPublicBetaAssetsSystem?.({
    data:window.F1M_PUBLIC_BETA_ASSETS_DATA || DATA.publicBetaAssetsData || {},
    events:appEvents,
    assetRegistry,
    assetRestoreSystem,
    visualHotfix
  }) || null;

  const gameplayPolish = CORE.gameplayPolish?.createGameplayPolishSystem?.({
    data:window.F1M_GAMEPLAY_POLISH_DATA || DATA.gameplayPolishData || {},
    events:appEvents,
    vehiclePhysics,
    strategyAI,
    regulationEngine,
    visualSystem,
    audioUI
  }) || null;

  const telemetrySystem = CORE.telemetry?.createTelemetrySystem?.({
    data:window.F1M_TELEMETRY_DATA || DATA.telemetryData || {},
    events:appEvents,
    vehiclePhysics,
    strategyAI,
    regulationEngine,
    gameplayPolish
  }) || null;

  const setupEngineering = CORE.setupEngineering?.createSetupEngineeringSystem?.({
    data:window.F1M_SETUP_ENGINEERING_DATA || DATA.setupEngineeringData || {},
    events:appEvents,
    telemetrySystem,
    vehiclePhysics,
    strategyAI,
    regulationEngine,
    gameplayPolish
  }) || null;

  const tyreStint = CORE.tyreStint?.createTyreStintSystem?.({
    data:window.F1M_TYRE_STINT_DATA || DATA.tyreStintData || {},
    events:appEvents,
    telemetrySystem,
    vehiclePhysics,
    strategyAI,
    regulationEngine,
    gameplayPolish,
    setupEngineering
  }) || null;

  let state = loadState() || createInitialState();
  setupEngineering?.initializeState?.(state, { buildCode:DATA.build?.build_code || 'dev' });
  tyreStint?.initializeState?.(state, { buildCode:DATA.build?.build_code || 'dev' });
  let selectedAvatar = 0;
  let selectedMode = 'realistic';
  let selectedSeries = 'F2';
  let selectedTeam = DATA.f2Teams[0].id;
  let selectedCompound = 'soft';
  let race = null;
  let renderer3d = null;
  let raceEngine = null;
  let screenManager = null;
  let runtimeGuard = null;
  let viewportController = null;
  let diagnosticsRunning = false;

  const $ = (q) => document.querySelector(q);
  const $$ = (q) => Array.from(document.querySelectorAll(q));

  function money(n){ return i18nManager?.formatMoney?.(n) || ('$ ' + Math.round(n||0).toLocaleString('pt-BR')); }
  function t(text, vars){ return i18nManager?.t?.(text, vars) || String(text ?? ''); }
  function applyTranslations(root=document.body){ i18nManager?.scan?.(root); }
  function pct(n){ return Math.round((n||0)*100)/100; }
  function teamById(id){ return DATA_REGISTRY?.teamById(id) || DATA.f1Teams2026.concat(DATA.f2Teams).find(t => t.id === id); }
  function allDrivers(){ return DATA_REGISTRY?.allDrivers() || DATA.f1Drivers2026.concat(DATA.f2Drivers); }
  function allDriversForSeries(series){ return (DATA_REGISTRY?.driversForSeries(series) || (series === 'F1' ? DATA.f1Drivers2026 : DATA.f2Drivers)).map(applyDriverProgress); }
  function defaultRosters(){ const r={}; allDrivers().forEach(d=>{ r[d.team]=r[d.team]||[]; if(!r[d.team].includes(d.short)) r[d.team].push(d.short); }); return r; }
  function ensureRosters(){ state.rosters = state.rosters || defaultRosters(); return state.rosters; }
  function applyDriverProgress(d){ if(!d) return d; const p = state && state.driverProgress ? state.driverProgress[d.short] : null; return p ? {...d, ...p} : d; }
  function driverCurrentTeamId(short){ const rosters = ensureRosters(); for(const [team,list] of Object.entries(rosters)){ if((list||[]).includes(short)) return team; } const d=allDrivers().find(x=>x.short===short); return d ? d.team : null; }
  function driversForTeam(id){ const rosters = ensureRosters(); const list = rosters[id]; if(Array.isArray(list)) return list.map(s=>allDrivers().find(d=>d.short===s)).filter(Boolean).map(d=>({...applyDriverProgress(d),currentTeam:id})); return allDrivers().filter(d=>d.team===id).map(d=>({...applyDriverProgress(d),currentTeam:id})); }
  function rnd(min,max){ return min + Math.random()*(max-min); }
  function cleanAssetPath(p){ return (assetRegistry?.normalizePath?.(p) || String(p||'').replace(/^\.?\//,'').replace(/^assets\//,'')).replace(/^assets\//,''); }
  function assetCandidates(p){ return assetRegistry?.candidates?.(p) || ASSET_ROOTS.map(root => root + cleanAssetPath(p)); }
  function asset(p){ return assetRegistry?.resolve?.(p, {placeholder:false}) || assetCandidates(p)[0] || ''; }
  function initials(text){ return String(text||'').split(/\s+/).filter(Boolean).slice(0,2).map(s=>s[0]).join('').toUpperCase() || 'VG'; }
  function flagPath(code){ return `flags/all/${String(code||'').toLowerCase()}.png`; }
  function colorHex(num){ return `#${(Number(num)||0x333333).toString(16).padStart(6,'0')}`; }
  function colorRgbString(num){ const c = Number(num)||0x333333; return `${(c>>16)&255}, ${(c>>8)&255}, ${c&255}`; }

  function driverByShort(short){ const d = allDrivers().find(d => d.short === short); return d ? applyDriverProgress(d) : null; }
  function teamLogoHTML(team, cls='team-logo-inline'){
    if(!team) return `<span class="team-logo-inline fallback-logo">?</span>`;
    return `<span class="${cls} wrap">${team.logo ? `<img data-asset-src="${team.logo}" alt="${team.name}" />` : ''}<b class="fallback-badge" style="display:${team.logo ? 'none':'flex'}">${initials(team.name)}</b></span>`;
  }
  function driverAvatarChip(d, cls='driver-avatar-inline'){
    if(!d) return `<span class="${cls} fallback-avatar">?</span>`;
    return `<span class="${cls}">${d.portrait ? `<img data-asset-src="${d.portrait}" alt="${d.short||d.name}" />` : ''}<b class="fallback-badge" style="display:${d.portrait ? 'none':'flex'}">${initials(d.short||d.name)}</b></span>`;
  }
  function createStandingsForSeries(series){
    const drivers = series === 'F1' ? DATA.f1Drivers2026 : DATA.f2Drivers;
    const obj = {};
    drivers.forEach(d => obj[d.short] = { driver:d.short, team:d.team, points:0, wins:0, podiums:0, best:null });
    return obj;
  }
  function ensureStandings(){
    state.standings = state.standings || {};
    if(!state.standings.F1) state.standings.F1 = state.f1Standings || createStandingsForSeries('F1');
    if(!state.standings.F2) state.standings.F2 = createStandingsForSeries('F2');
    state.f1Standings = state.standings.F1;
  }
  function currentStandings(){ ensureStandings(); return state.standings[state.currentSeries || 'F2'] || state.standings.F2; }

  function activeSeries(series){
    try { return series || state?.currentSeries || selectedSeries || 'F2'; }
    catch(error){ return series || 'F2'; }
  }
  function activeCalendar(series){
    const key = activeSeries(series);
    return sportingDb?.calendarForSeries?.(key) || (key === 'F1' ? DATA.f1Calendar2026 : DATA.f2Calendar2026) || DATA['calendar2026'] || [];
  }
  function activeSportingRules(series){ return sportingDb?.rulesForSeries?.(activeSeries(series)) || DATA.sportingRules2026?.[activeSeries(series)] || {}; }
  function sportingMiniHTML(){
    const audit = sportingDb?.audit?.() || { score:0, passed:0, failed:1, checks:[] };
    const f1 = activeCalendar('F1');
    const f2 = activeCalendar('F2');
    const current = activeCalendar();
    return `<p><b>${audit.score}/100</b> • ${audit.passed} checks aprovados</p><p>F1: <b>${f1.length}</b> etapas • F2: <b>${f2.length}</b> etapas • carreira ativa: <b>${current.length}</b></p><p class="muted-small">Fonte: snapshot oficial 18/06/2026 • modo jurídico: ${window.F1M_SPORTING_DATA?.legalMode?.commercialStatus || 'pendente'}</p>`;
  }
  function setupLabel(key){ return ({balanced:'Equilibrado',downforce:'Mais aerodinâmica',speed:'Velocidade final',tyres:'Preservar pneus',rain:'Chuva/controle'})[key] || 'Equilibrado'; }
  function difficultyKey(){ return state?.quality?.difficulty || (state?.mode === 'sandbox' ? 'sandbox' : 'normal'); }
  function balanceTuning(){
    const table = {
      easy:{ initialBudget:1.18, income:1.12, prize:1.08, sponsor:1.10, cost:.86, damage:.78, repGain:1.18, repLoss:.70, offerGate:-4, rival:.86 },
      normal:{ initialBudget:1.00, income:1.00, prize:1.00, sponsor:1.00, cost:1.00, damage:1.00, repGain:1.00, repLoss:1.00, offerGate:0, rival:1.00 },
      hard:{ initialBudget:.82, income:.92, prize:.92, sponsor:.92, cost:1.18, damage:1.20, repGain:.82, repLoss:1.28, offerGate:5, rival:1.15 },
      sandbox:{ initialBudget:1.85, income:1.20, prize:1.15, sponsor:1.15, cost:.72, damage:.65, repGain:1.20, repLoss:.45, offerGate:-99, rival:.70 }
    };
    return table[difficultyKey()] || table.normal;
  }
  function objectiveExpectedBest(team){
    const text = String(team?.objective || '').toLowerCase();
    if(text.includes('título') || text.includes('titulo') || text.includes('vencer') || text.includes('vitórias')) return 2;
    if(text.includes('pódio') || text.includes('podio')) return 4;
    if(text.includes('pontos') || text.includes('pontuar')) return 10;
    if(text.includes('meio') || text.includes('evoluir')) return 14;
    return team?.tier === 'top' ? 3 : team?.tier === 'mid' ? 8 : 13;
  }
  function budgetStartMultiplier(series){
    const t = balanceTuning();
    if(state.mode === 'sandbox') return t.initialBudget;
    return (series === 'F1' ? .58 : .86) * t.initialBudget;
  }
  function balanceSummary(){
    const t = balanceTuning();
    return `Dificuldade ${difficultyLabel()} • caixa inicial x${budgetStartMultiplier(state.currentSeries||'F2').toFixed(2)} • custos x${t.cost.toFixed(2)} • reputação x${t.repGain.toFixed(2)}`;
  }

  function createInitialState(){
    const standings = { F1:createStandingsForSeries('F1'), F2:createStandingsForSeries('F2') };
    if(CORE.career?.createInitialState){
      return CORE.career.createInitialState({ saveSchema:SAVE_SCHEMA, standings, rosters:defaultRosters() });
    }
    return { profile:null, mode:'realistic', currentSeries:'F2', currentTeam:null, roundIndex:0, money:0, reputation:0, rosters:defaultRosters(), standings, f1Standings:standings.F1, inbox:[], offers:[], lastRace:[], completedRaces:0, saveSchema:SAVE_SCHEMA, createdAt:new Date().toISOString() };
  }
  function saveState(){
    try {
      state.saveSchema = SAVE_SCHEMA;
      state.updatedAt = new Date().toISOString();
      state.session = {...(state.session||{}), lastActiveAt:state.updatedAt};
      if(persistence){
        const result = persistence.save(state);
        if(result.ok) state = result.state;
        appEvents?.emit('save:written', { ok:result.ok, schema:SAVE_SCHEMA, key:ACTIVE_SAVE_KEY });
        return result.ok;
      }
      localStorage.setItem(ACTIVE_SAVE_KEY, JSON.stringify(state));
      appEvents?.emit('save:written', { ok:true, schema:SAVE_SCHEMA, key:ACTIVE_SAVE_KEY, fallback:true });
      return true;
    } catch(error){
      reportRuntimeError(error, 'saveState');
      return false;
    }
  }
  function parseSavedState(raw, key){
    if(!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed?.format === CORE.persistence?.FORMAT && parsed.payload ? parsed.payload : parsed;
    } catch(error){ reportRuntimeError(error, `loadState:${key}`); return null; }
  }
  function loadState(){
    if(persistence){
      const loaded = persistence.load();
      if(loaded) appEvents?.emit('save:loaded', { source:persistence.inspect().lastLoad?.key || ACTIVE_SAVE_KEY, legacy:persistence.inspect().lastLoad?.legacy || false });
      return loaded;
    }
    for(const key of SAVE_KEYS){
      try {
        const parsed = parseSavedState(localStorage.getItem(key), key);
        if(parsed) return parsed;
      } catch(error){ reportRuntimeError(error, `loadState:${key}`); }
    }
    return null;
  }
  function reportRuntimeError(error, context='runtime'){
    const item = runtimeGuard?.capture
      ? runtimeGuard.capture(error, context)
      : { at:new Date().toISOString(), context, message:String(error?.message || error || 'erro desconhecido'), stack:String(error?.stack || '').slice(0,1600), build:DATA.build?.build_code || DATA.build?.version || 'dev' };
    if(!runtimeGuard){
      try {
        const list = JSON.parse(localStorage.getItem(RUNTIME_ERROR_KEY) || '[]');
        list.unshift(item);
        localStorage.setItem(RUNTIME_ERROR_KEY, JSON.stringify(list.slice(0,20)));
      } catch(_){}
    }
    console.error(`[F1M:${context}]`, error);
    const existing = document.getElementById('runtimeErrorBanner');
    if(existing) return;
    const banner = document.createElement('div');
    banner.id = 'runtimeErrorBanner';
    banner.className = 'runtime-error-banner';
    banner.innerHTML = `<b>Recuperação ativa</b><span>Uma falha foi isolada. O diagnóstico foi registrado na build ${DATA.build?.build_code || DATA.build?.version || 'dev'}.</span><button type="button" aria-label="Fechar">×</button>`;
    banner.querySelector('button').onclick = () => banner.remove();
    document.body.appendChild(banner);
  }


  function ensureCareerSystems(){
    let shouldPersistArchitecture = false;
    if(CORE.career?.migrateState){
      const migration = CORE.career.migrateState(state, { targetSchema:SAVE_SCHEMA, calendarLength:activeCalendar()?.length || 1, buildCode:DATA.build?.build_code || 'dev' });
      state = migration.state;
      if(migration.applied.length){ shouldPersistArchitecture = true; appEvents?.emit('career:migrated', migration); }
    } else {
      state.saveSchema = SAVE_SCHEMA;
    }
    state.inbox = Array.isArray(state.inbox) ? state.inbox : [];
    state.setup = state.setup || { preset:'balanced', aeroBalance:50, engineMode:50, suspension:50, tyrePressure:50 };
    state.weekend = state.weekend || { practiceDone:false, setupConfidence:50, tyreKnowledge:50, qualyFocus:'balanced', engineerNote:'Aguardando treino livre.' };
    state.staff = {...{ designers:1, mechanics:1, strategists:1, raceEngineers:1, scouts:1, pitCrew:1 }, ...(state.staff||{})};
    livingCareer?.initializeState?.(state, { buildCode:DATA.build?.build_code || 'dev', data:window.F1M_LIVING_CAREER_DATA || {} });
    // state.livingCareer é mantido pelo módulo F16 para carreira viva multi-temporada.
    backendLaunch?.initializeState?.(state, { buildCode:DATA.build?.build_code || 'dev', data:window.F1M_BACKEND_LAUNCH_DATA || {} });
    // state.backendLaunch é mantido pelo módulo F17 para backend, segurança e lançamento.
    releaseCandidate?.initializeState?.(state, { buildCode:DATA.build?.build_code || 'dev', data:window.F1M_RELEASE_CANDIDATE_DATA || {} });
    // state.releaseCandidate é mantido pelo módulo F18 para RC comercial e homologação final.
    deployValidation?.initializeState?.(state, { buildCode:DATA.build?.build_code || 'dev', data:window.F1M_DEPLOYMENT_DATA || {} });
    // state.deployment é mantido pelo módulo F19 para deploy seguro e beta público.
    operationsSystem?.initializeState?.(state, { buildCode:DATA.build?.build_code || 'dev', data:window.F1M_OPERATIONS_DATA || {} });
    // state.operations é mantido pelo módulo F20 para feedback beta, triagem e hotfix controlado.
    assetRestoreSystem?.initializeState?.(state, { buildCode:DATA.build?.build_code || 'dev', data:window.F1M_ASSET_RESTORE_DATA || {}, catalog:ASSET_CATALOG });
    state.visualHotfix = state.visualHotfix || {};
    visualHotfix?.initializeState?.(state, { buildCode:DATA.build?.build_code || 'dev', data:window.F1M_VISUAL_HOTFIX_DATA || {} });
    publicBetaAssets?.initializeState?.(state, { buildCode:DATA.build?.build_code || 'dev', data:window.F1M_PUBLIC_BETA_ASSETS_DATA || {}, catalog:ASSET_CATALOG });
    gameplayPolish?.initializeState?.(state, { buildCode:DATA.build?.build_code || 'dev', data:window.F1M_GAMEPLAY_POLISH_DATA || {} });
    telemetrySystem?.initializeState?.(state, { buildCode:DATA.build?.build_code || 'dev', data:window.F1M_TELEMETRY_DATA || {} });
    setupEngineering?.initializeState?.(state, { buildCode:DATA.build?.build_code || 'dev', data:window.F1M_SETUP_ENGINEERING_DATA || {} });
    tyreStint?.initializeState?.(state, { buildCode:DATA.build?.build_code || 'dev', data:window.F1M_TYRE_STINT_DATA || {} });
    // state.assetRestore é mantido pelo módulo F21 para restauração guiada de assets reais e validação de preview.
    // state.publicBetaAssets é mantido pelo módulo F23 para beta público com assets reais restaurados.
    // state.gameplayPolish é mantido pelo módulo F24 para gameplay perfeita, pit wall, battles e telemetria legível.
    // state.telemetry é mantido pelo módulo F25 para telemetria realista, sensores, diagnóstico e engenharia de corrida.
    // state.setupEngineering é mantido pelo módulo F26 para setup avançado, treinos e correlação telemétrica.
    // state.tyreStint é mantido pelo módulo F27 para pneus, stint, degradação, graining/blistering e pit wall realista.
    ensureRosters();
    state.car = state.car || { aero:50, engine:50, chassis:50, reliability:55, tyreWear:55, pitStop:55, fuel:55 };
    ensureStandings();
    state.unreadMessages = Number(state.unreadMessages || state.inbox.filter(m => !m.read).length || 0);
    state.seasonYear = state.seasonYear || 2026;
    state.seasonNumber = state.seasonNumber || 1;
    state.seasonStats = state.seasonStats || { races:0, bestFinish:null, podiums:0, wins:0, objectiveProgress:0 };
    state.financeLog = Array.isArray(state.financeLog) ? state.financeLog : [];
    state.seasonArchive = Array.isArray(state.seasonArchive) ? state.seasonArchive : [];
    state.hallOfFame = Array.isArray(state.hallOfFame) ? state.hallOfFame : [];
    state.driverDevelopmentLog = Array.isArray(state.driverDevelopmentLog) ? state.driverDevelopmentLog : [];
    state.carEvolutionLog = Array.isArray(state.carEvolutionLog) ? state.carEvolutionLog : [];
    state.saveSlotsMeta = state.saveSlotsMeta || {};
    state.tutorial = state.tutorial || { completed:false, step:0 };
    state.quality = state.quality || { difficulty:'normal', betaScore:0, lastCheck:null, checks:[] };
    state.viewport = state.viewport || { hudMode:'auto', safeAreaReady:true, mobileUxPhase:7 };
    if(!state.quality.difficulty) state.quality.difficulty = state.mode === 'sandbox' ? 'sandbox' : 'normal';
    state.driverProgress = state.driverProgress || {};
    state.lastRaceReport = state.lastRaceReport || null;
    state.balanceAudit = state.balanceAudit || { version:'0.9.31', lastReview:null, notes:[] };
    state.mediaLog = Array.isArray(state.mediaLog) ? state.mediaLog : [];
    state.boardPressure = Number.isFinite(Number(state.boardPressure)) ? Number(state.boardPressure) : 45;
    state.pressReputation = Number.isFinite(Number(state.pressReputation)) ? Number(state.pressReputation) : 50;
    state.teamMorale = Number.isFinite(Number(state.teamMorale)) ? Number(state.teamMorale) : 62;
    ensureDriverMorale();
    ensureRivalWorld();
    if(state.profile && state.currentTeam && !state.inbox.length){
      seedCareerInbox();
      shouldPersistArchitecture = true;
    }
    if(shouldPersistArchitecture) saveState();
  }


  function ensureDriverMorale(){
    state.driverMorale = state.driverMorale || {};
    driversForTeam(state.currentTeam).forEach((d,idx) => {
      if(!state.driverMorale[d.short]) state.driverMorale[d.short] = 58 + Math.round((d.overall || 70) / 8) - idx*2;
    });
  }
  function clamp(n,min=0,max=100){ return Math.max(min, Math.min(max, Number(n)||0)); }
  function moraleLabel(v){ v=Number(v)||50; return v>=80?'Excelente':v>=65?'Boa':v>=50?'Estável':v>=35?'Tensa':'Crítica'; }
  function pressureLabel(v){ v=Number(v)||50; return v>=78?'Máxima':v>=62?'Alta':v>=42?'Controlada':v>=25?'Baixa':'Muito baixa'; }
  function mediaMoodLabel(v){ v=Number(v)||50; return v>=76?'Favorável':v>=55?'Neutra positiva':v>=40?'Neutra':v>=25?'Crítica':'Hostil'; }
  function driverMoraleRows(){
    ensureDriverMorale();
    return driversForTeam(state.currentTeam).map(d => {
      const m = clamp(state.driverMorale[d.short] || 55);
      return `<div class="row rich-row"><span>${driverAvatarChip(d,'driver-avatar-inline small')}</span><span><b>${d.short}</b><small>${d.name}</small></span><span>${Math.round(m)}</span><span>${moraleLabel(m)}</span></div>`;
    }).join('') || '<p>Sem pilotos na equipe atual.</p>';
  }
  function mediaLogRows(){
    const rows = (state.mediaLog || []).slice(0,8);
    return rows.length ? rows.map(e => `<p><b>${e.title}</b><br><span>${e.body}</span></p>`).join('') : '<p>Nenhuma manchete relevante ainda. Avance corridas ou faça coletiva.</p>';
  }
  function boardPressureText(){
    const p = clamp(state.boardPressure || 45);
    const team = teamById(state.currentTeam);
    return `${pressureLabel(p)} — ${p}/100. ${p>=70?'A diretoria quer resultado imediato.':p>=45?'A diretoria acompanha de perto sua evolução.':'A diretoria está satisfeita com o controle do projeto.'} Meta: ${team?.objective || 'evoluir a equipe'}.`;
  }
  function pressConference(choice){
    ensureCareerSystems();
    const map = {
      ambitious:{ title:'Coletiva ambiciosa', rep:+3, press:+6, morale:+1, pressure:+7, body:'Você prometeu uma postura agressiva. A imprensa gostou, mas a diretoria agora espera entrega.' },
      balanced:{ title:'Coletiva equilibrada', rep:+1, press:+2, morale:+3, pressure:-2, body:'Você reforçou evolução passo a passo. O paddock recebeu bem e o ambiente interno melhorou.' },
      protect:{ title:'Defesa dos pilotos', rep:0, press:-1, morale:+7, pressure:+1, body:'Você protegeu seus pilotos publicamente. O grupo ganhou confiança, mesmo com menos impacto externo.' },
      realistic:{ title:'Mensagem realista', rep:+1, press:+1, morale:+2, pressure:-5, body:'Você alinhou expectativas com orçamento, carro e momento da equipe. A diretoria reduziu a pressão.' }
    };
    const ev = map[choice] || map.balanced;
    state.reputation = clamp((state.reputation||0)+ev.rep,0,100);
    state.pressReputation = clamp((state.pressReputation||50)+ev.press,0,100);
    state.teamMorale = clamp((state.teamMorale||60)+ev.morale,0,100);
    state.boardPressure = clamp((state.boardPressure||45)+ev.pressure,0,100);
    driversForTeam(state.currentTeam).forEach(d => state.driverMorale[d.short] = clamp((state.driverMorale[d.short]||55)+ev.morale,0,100));
    state.mediaLog.unshift({ type:'press', title:ev.title, body:ev.body, year:state.seasonYear, race:state.completedRaces, date:new Date().toISOString() });
    addInboxMessage('media','Sala de Imprensa',ev.title,ev.body,{});
    saveState(); renderTab('media'); updateHud();
  }
  function generateRaceMediaStory(best){
    ensureCareerSystems();
    if(!best) return;
    const team = teamById(state.currentTeam);
    const pos = best.pos || 20;
    let title, body, rep=0, press=0, morale=0, pressure=0;
    if(pos === 1){ title='Vitória vira manchete no paddock'; body=`${team.name} vence e aumenta o respeito pelo projeto. A imprensa coloca o gestor entre os grandes nomes da temporada.`; rep=5; press=8; morale=7; pressure=-6; }
    else if(pos <= 3){ title='Pódio fortalece o projeto'; body=`Pódio da ${team.name} confirma evolução técnica e melhora o clima interno.`; rep=3; press=5; morale=5; pressure=-4; }
    else if(pos <= 8){ title='Resultado sólido mantém confiança'; body=`P${pos} mantém a equipe competitiva e dá argumentos para a diretoria continuar apoiando.`; rep=1; press=2; morale=2; pressure=-1; }
    else if(pos >= 16){ title='Imprensa cobra reação'; body=`Resultado P${pos} aumenta perguntas sobre ritmo, estratégia e desenvolvimento do carro.`; rep=-2; press=-5; morale=-4; pressure=7; }
    else { title='Fim de semana discreto'; body=`A equipe termina em P${pos}. O paddock ainda espera sinais mais fortes de evolução.`; rep=0; press=-1; morale=-1; pressure=2; }
    state.reputation = clamp((state.reputation||0)+rep,0,100);
    state.pressReputation = clamp((state.pressReputation||50)+press,0,100);
    state.teamMorale = clamp((state.teamMorale||60)+morale,0,100);
    state.boardPressure = clamp((state.boardPressure||45)+pressure,0,100);
    driversForTeam(state.currentTeam).forEach(d => state.driverMorale[d.short] = clamp((state.driverMorale[d.short]||55)+morale,0,100));
    state.mediaLog.unshift({ type:'race', title, body, year:state.seasonYear, race:state.completedRaces, pos, date:new Date().toISOString() });
    addInboxMessage('media','Paddock News',title,body,{});
  }

  function ensureRivalWorld(){
    state.rivalDevelopment = state.rivalDevelopment || {};
    state.rivalMarket = state.rivalMarket || { lastRound:-1, moves:[] };
    DATA.f1Teams2026.concat(DATA.f2Teams).forEach(t => {
      if(!state.rivalDevelopment[t.id]){
        const base = t.car || estimateCarBase(t);
        state.rivalDevelopment[t.id] = {
          aero:base.aero||60,
          engine:base.engine||60,
          chassis:base.chassis||60,
          reliability:base.reliability||60,
          tyreWear:base.tyreWear||60,
          pitStop:base.pitStop||60,
          morale:50 + Math.round((t.reputation||60)/3),
          spendPower: t.tier==='top' ? 1.22 : t.tier==='mid' ? 1.0 : .82,
          form:0
        };
      }
    });
  }
  function estimateCarBase(t){
    const tier = t.tier==='top'?88:t.tier==='mid'?78:68;
    return { aero:tier, engine:tier, chassis:tier, reliability:tier, tyreWear:tier, pitStop:tier, fuel:tier };
  }
  function rivalCarForTeam(t){
    ensureRivalWorld();
    const base = t.car || estimateCarBase(t);
    const dev = state.rivalDevelopment[t.id] || {};
    return {
      aero:dev.aero || base.aero || 60,
      engine:dev.engine || base.engine || 60,
      chassis:dev.chassis || base.chassis || 60,
      reliability:dev.reliability || base.reliability || 60,
      tyreWear:dev.tyreWear || base.tyreWear || 60,
      pitStop:dev.pitStop || base.pitStop || 60,
      fuel:base.fuel || 60
    };
  }
  function rivalFormLabel(team){
    const d = state.rivalDevelopment?.[team.id] || {};
    const avg = ((d.aero||60)+(d.engine||60)+(d.chassis||60)+(d.reliability||60)+(d.tyreWear||60))/5;
    if(avg >= 90) return 'elite mundial';
    if(avg >= 82) return 'forte evolução';
    if(avg >= 74) return 'competitiva';
    if(avg >= 66) return 'em reconstrução';
    return 'fragilizada';
  }
  function evolveRivalsAfterRace(){
    ensureRivalWorld();
    const seriesTeams = state.currentSeries === 'F1' ? DATA.f1Teams2026 : DATA.f2Teams;
    const results = state.lastRace || [];
    seriesTeams.forEach(t => {
      if(t.id === state.currentTeam) return;
      const dev = state.rivalDevelopment[t.id];
      const teamResults = results.filter(r => r.team === t.id);
      const best = teamResults.length ? Math.min(...teamResults.map(r=>r.pos)) : 18;
      const points = teamResults.reduce((s,r)=>s+(r.points||0),0);
      const pressure = best <= 3 ? .45 : best <= 8 ? .25 : -.08;
      const moneyPush = (dev.spendPower||1) * (points > 10 ? .42 : .22);
      const randomFocus = ['aero','engine','chassis','reliability','tyreWear','pitStop'][Math.floor(Math.random()*6)];
      const globalGain = Math.max(-.15, Math.min(.85, moneyPush + pressure + rnd(-.18,.22)));
      dev[randomFocus] = Math.max(45, Math.min(99, (dev[randomFocus]||65) + globalGain + rnd(.05,.35)));
      dev.reliability = Math.max(45, Math.min(99, (dev.reliability||65) + globalGain*.38));
      dev.morale = Math.max(20, Math.min(99, (dev.morale||60) + (best<=6?2:best>=15?-2:0)));
      dev.form = Math.round((dev.form||0)*.6 + (points - 5)*.4);
    });
    if((state.completedRaces||0) % 4 === 0) simulateRivalMarketMoves();
  }
  function simulateRivalMarketMoves(){
    ensureRivalWorld();
    if(state.rivalMarket.lastRound === state.completedRaces) return;
    const seriesDrivers = state.currentSeries === 'F1' ? DATA.f1Drivers2026 : DATA.f2Drivers;
    const teams = state.currentSeries === 'F1' ? DATA.f1Teams2026 : DATA.f2Teams;
    const candidates = seriesDrivers.filter(d => driverCurrentTeamId(d.short) !== state.currentTeam).sort((a,b)=>(b.potential||70)-(a.potential||70)).slice(0,8);
    if(!candidates.length) return;
    const d = candidates[Math.floor(Math.random()*candidates.length)];
    const from = driverCurrentTeamId(d.short);
    const possible = teams.filter(t => t.id !== from && t.id !== state.currentTeam);
    const to = possible[Math.floor(Math.random()*possible.length)];
    if(!to || Math.random() < .45) return;
    const rosters = ensureRosters();
    const fromList = rosters[from] || [];
    const toList = rosters[to.id] || [];
    if(toList.length >= 2){
      const removed = toList[toList.length-1];
      rosters[to.id] = toList.filter(x=>x!==removed).concat(d.short).slice(0,2);
      rosters[from] = fromList.filter(x=>x!==d.short).concat(removed).slice(0,2);
    } else {
      rosters[to.id] = toList.concat(d.short).slice(0,2);
      rosters[from] = fromList.filter(x=>x!==d.short).slice(0,2);
    }
    state.rivalMarket.lastRound = state.completedRaces;
    state.rivalMarket.moves.unshift({ round:state.completedRaces, year:state.seasonYear||2026, driver:d.short, from, to:to.id });
    state.rivalMarket.moves = state.rivalMarket.moves.slice(0,10);
    addInboxMessage('media','Paddock News',`Mercado rival: ${d.short} muda de equipe`,`A imprensa informa que ${d.name} fechou com ${to.name}. O mercado de pilotos começa a se mexer e pode alterar a força do grid.`,{});
  }
  function scoutRivals(){
    ensureRivalWorld();
    const cost = 250000 + (state.currentSeries==='F1'?350000:0);
    if((state.money||0) < cost) return alert('Orçamento insuficiente para relatório de inteligência.');
    state.money -= cost;
    addInboxMessage('technical','Departamento de Inteligência',`Relatório de rivais — ${state.currentSeries}`,`Foram analisadas evolução técnica, moral e movimentações do mercado rival. Abra a aba Rivais para revisar ameaças e oportunidades. Custo: ${money(cost)}.`,{});
    saveState(); renderTab('rivals'); updateHud();
  }
  function rivalRows(){
    ensureRivalWorld();
    const teams = state.currentSeries === 'F1' ? DATA.f1Teams2026 : DATA.f2Teams;
    return teams.map(t=>{
      const dev = state.rivalDevelopment[t.id] || {};
      const avg = Math.round(((dev.aero||60)+(dev.engine||60)+(dev.chassis||60)+(dev.reliability||60)+(dev.tyreWear||60))/5);
      const current = t.id === state.currentTeam;
      return `<div class="row rich-row ${current?'highlight':''}"><span class="pos-cell">${teamLogoHTML(t)}</span><span class="driver-cell"><span class="driver-text"><b>${t.name}</b><small>${current?'Sua equipe':'Rival'} • ${rivalFormLabel(t)}</small></span></span><span class="team-cell"><span>AER ${Math.round(dev.aero||0)} • MOT ${Math.round(dev.engine||0)} • CHA ${Math.round(dev.chassis||0)}</span></span><span class="time-cell">${avg}</span></div>`;
    }).join('');
  }
  function rivalMarketRows(){
    ensureRivalWorld();
    const moves = state.rivalMarket?.moves || [];
    if(!moves.length) return '<p>Nenhuma movimentação rival registrada ainda.</p>';
    return moves.map(m=>{
      const d=driverByShort(m.driver)||{short:m.driver,name:m.driver};
      const from=teamById(m.from); const to=teamById(m.to);
      return `<p>${driverAvatarChip(d,'driver-avatar-inline small')} <b>${d.short}</b> saiu de ${from?from.name:m.from} para <b>${to?to.name:m.to}</b> • ${m.year} R${m.round}</p>`;
    }).join('');
  }

  function addInboxMessage(type, from, title, body, meta={}){
    state.inbox = Array.isArray(state.inbox) ? state.inbox : [];
    const id = `mail_${Date.now()}_${Math.random().toString(16).slice(2,7)}`;
    state.inbox.unshift({ id, type, from, title, body, meta, read:false, race:state.completedRaces || 0, year:state.seasonYear || 2026, date:new Date().toISOString() });
    state.unreadMessages = state.inbox.filter(m => !m.read).length;
    return id;
  }

  function seedCareerInbox(){
    const team = teamById(state.currentTeam);
    if(!team) return;
    addInboxMessage('welcome','Diretoria',`Bem-vindo à ${team.name}`,`Você assumiu a ${team.name}. Objetivo inicial: ${team.objective || 'cumprir as metas da diretoria'}. Use a agenda para avançar corrida a corrida, desenvolver o carro e abrir portas para novas propostas.`,{team:team.id});
    addInboxMessage('calendar','FIA / Calendário',`Agenda da temporada ${state.seasonYear || 2026}`,`A temporada tem ${activeCalendar().length} eventos. Bons resultados, finanças saudáveis e evolução técnica aumentam sua reputação e liberam convites para equipes maiores.`,{});
  }

  function markMailRead(id){
    state.inbox = Array.isArray(state.inbox) ? state.inbox : [];
    const msg = state.inbox.find(m => m.id === id);
    if(msg) msg.read = true;
    state.unreadMessages = state.inbox.filter(m => !m.read).length;
    saveState();
    renderTab('inbox');
    updateHud();
  }

  function loadImgWithFallback(img, relPath){
    if(assetRegistry) return assetRegistry.bindImage(img, relPath, { context:img?.alt || img?.className || 'runtime-image' });
    if(!img || !relPath) return null;
    img.src = asset(relPath);
    return { ok:true, path:relPath };
  }
  function loadBgWithFallback(el, relPath){
    if(assetRegistry) return assetRegistry.bindBackground(el, relPath, { context:el?.id || el?.className || 'runtime-background' });
    if(!el || !relPath) return null;
    el.style.backgroundImage = `url('${asset(relPath)}')`;
    return { ok:true, path:relPath };
  }
  function hydrateAssets(root=document){
    if(assetRegistry) return assetRegistry.hydrate(root);
    root.querySelectorAll('[data-asset-src]').forEach(img => loadImgWithFallback(img, img.dataset.assetSrc));
    root.querySelectorAll('[data-asset-bg]').forEach(el => loadBgWithFallback(el, el.dataset.assetBg));
    return { images:0, backgrounds:0 };
  }
  function setScreenBg(screenId, relPath){
    const el = document.getElementById(screenId);
    if(!el) return;
    const normalized = assetRegistry?.normalizePath?.(relPath) || relPath;
    if(el.dataset.assetBg !== normalized){ el.dataset.assetBg = normalized; delete el.dataset.bgBound; delete el.dataset.assetBound; }
    loadBgWithFallback(el, normalized);
  }
  function screenBackgrounds(){
    setScreenBg('screen-home', DATA.assetPaths.menu);
    setScreenBg('screen-career-create', DATA.assetPaths.lobbyGlobal);
    setScreenBg('screen-team-select', DATA.assetPaths.lobbyGlobal);
    setScreenBg('screen-lobby', DATA.assetPaths.lobbyGlobal);
    setScreenBg('screen-qualifying', DATA.assetPaths.classification);
    setScreenBg('screen-results', DATA.assetPaths.podium);
    setScreenBg('screen-single-race', DATA.assetPaths.miami);
    setScreenBg('screen-assets-check', DATA.assetPaths.lobbyGlobal);
  }

  function setMobileViewport(){
    if(viewportController){ return viewportController.apply(); }
    const vh = Math.max(320, window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight || screen.height || 720);
    const vw = Math.max(320, window.visualViewport?.width || window.innerWidth || document.documentElement.clientWidth || screen.width || 1280);
    document.documentElement.style.setProperty('--app-height', `${vh}px`);
    document.documentElement.style.setProperty('--app-width', `${vw}px`);
    document.body.classList.toggle('is-mobile-viewport', Math.min(vw, vh) <= 900 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    document.body.classList.toggle('is-compact-landscape', vw >= vh && vh <= 560);
    return { width:vw, height:vh };
  }

  function bindViewportFixes(){
    setMobileViewport();
    ['resize','orientationchange'].forEach(evt => window.addEventListener(evt, () => setTimeout(setMobileViewport, 120), { passive:true }));
    if(window.visualViewport){
      window.visualViewport.addEventListener('resize', () => setTimeout(setMobileViewport, 60), { passive:true });
      window.visualViewport.addEventListener('scroll', () => setTimeout(setMobileViewport, 60), { passive:true });
    }
  }

  async function enterFullscreen(){
    if(viewportController){
      const result = await viewportController.enterFullscreen();
      updateMobileUxPanel();
      return result;
    }
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if(req){ try { await req.call(el); } catch(e){ reportRuntimeError(e, 'enterFullscreen'); } }
    if(screen.orientation && screen.orientation.lock){ screen.orientation.lock('landscape').catch(()=>{}); }
    setTimeout(setMobileViewport, 120);
  }

  function cycleHudMode(){
    if(viewportController){ viewportController.cycleHudMode(); }
    updateMobileUxPanel();
    updateRaceHud();
  }

  function updateMobileUxPanel(){
    const snap = viewportController?.snapshot?.() || setMobileViewport() || {};
    const hudButton = document.querySelector('#mobileUxPanel [data-action="cycleHudMode"]');
    if(hudButton) hudButton.textContent = `HUD ${(snap.hudMode || 'auto').toUpperCase()}`;
    const fsButton = document.querySelector('#mobileUxPanel [data-action="enterFullscreen"]');
    if(fsButton) fsButton.textContent = snap.fullscreen || snap.standalone ? 'IMERSIVO ATIVO' : 'TELA CHEIA';
  }

  function viewportMiniHTML(){
    const report = viewportController?.report?.() || null;
    const snap = report?.state || viewportController?.snapshot?.() || {};
    const checks = report?.checks || [];
    return `<p><b>${report ? report.score + '/100' : 'não medido'}</b></p><p>${snap.device || 'dispositivo'} • ${snap.width || 0}×${snap.height || 0} • ${snap.orientation || 'n/d'}</p><p class="muted-small">Fullscreen: ${snap.fullscreen ? 'ativo' : snap.standalone ? 'PWA standalone' : 'via botão'} • HUD ${snap.hudMode || 'auto'} • DPR ${snap.dpr || 1}</p>${checks.length ? `<div class="system-mini-checks">${checks.map(c=>`<span class="${c.ok?'ok':'warn'}">${c.ok?'✓':'⚠'} ${c.id}</span>`).join('')}</div>` : ''}`;
  }

  function showScreen(name){
    const previous = screenManager?.current?.() || ($('.screen.active')?.id || '').replace('screen-','') || null;
    const leavingRace = previous === 'race' && name !== 'race';
    if(leavingRace){
      stopRaceRuntime();
      if(name !== 'results') race = null;
    }
    const change = screenManager?.show?.(name);
    if(!change){
      $$('.screen').forEach(s => s.classList.remove('active'));
      const el = $('#screen-' + name);
      if(el) el.classList.add('active');
    }
    state.session = {...(state.session||{}), lastScreen:name, lastActiveAt:new Date().toISOString()};
    appEvents?.emit('screen:changed', { previous, current:name });
    if(name === 'lobby') renderLobby();
    if(name === 'qualifying') renderQualifying(false);
    if(name === 'race') setTimeout(startRaceRenderer, 60);
    if(name === 'assets-check') renderAssetChecklist();
    if(name === 'results') renderResults();
    visualHotfix?.applyHotfixes?.(document, { screen:name, buildCode:DATA.build?.build_code || 'dev' });
  }

  function updateBuildBadges(){
    const b = CORE.build?.getInfo ? CORE.build.getInfo(DATA.build) : (DATA.build || {});
    const label = CORE.build?.format ? CORE.build.format(b) : (b.label || 'Build de desenvolvimento');
    const home = document.getElementById('homeBuildPill');
    const global = document.getElementById('globalBuildStamp');
    if(home) home.textContent = label;
    if(global) global.textContent = label;
    document.title = `F1 Manager Career 2026 — ${b.build_code || label}`;
    CORE.build?.applyToDocument?.(b);
  }

  function init(){
    assetRegistry?.observe?.(document.body);
    i18nManager?.observe?.(document.body);
    window.addEventListener('f1m:languagechange', () => { updateBuildBadges(); updateMobileUxPanel(); if($('#screen-lobby')?.classList.contains('active')) renderTab(document.querySelector('.side-nav button.active')?.dataset.tab || 'dashboard'); applyTranslations(document.body); });
    runtimeGuard = CORE.runtime?.createGuard?.({ storageKey:RUNTIME_ERROR_KEY, maxEntries:30, buildCode:DATA.build?.build_code || 'dev' }) || null;
    viewportController = CORE.viewport?.createViewportManager?.({ document, window, storageKey:`${ACTIVE_SAVE_KEY}_viewport`, onError:(error,context)=>reportRuntimeError(error,context) }) || null;
    viewportController?.bind?.();
    viewportController?.onChange?.(() => updateMobileUxPanel());
    screenManager = CORE.ui?.createScreenManager?.({ document, selector:'.screen', prefix:'screen-', activeClass:'active' }) || null;
    appEvents?.on?.('screen:changed', payload => { if(payload?.current) document.documentElement.dataset.activeScreen = payload.current; });
    window.addEventListener('error', event => reportRuntimeError(event.error || event.message, 'window.error'));
    window.addEventListener('unhandledrejection', event => reportRuntimeError(event.reason, 'unhandledrejection'));
    document.addEventListener('visibilitychange', () => {
      if(document.hidden) stopRaceLoop();
      else if(race && $('#screen-race')?.classList.contains('active')) startRaceLoop();
    });
    bindViewportFixes();
    updateBuildBadges();
    ensureCareerSystems();
    audioUI?.applyDesignTokens?.();
    screenBackgrounds();
    visualHotfix?.applyHotfixes?.(document, { buildCode:DATA.build?.build_code || 'dev' });
    bindGlobalActions();
    initNavLabels();
    renderCreator();
    renderTeamSelect();
    renderQuickRaceSelect();
    updateHud();
    showScreen('home');
    hydrateAssets(document);
    applyTranslations(document.body);
  }

  function bindGlobalActions(){
    document.body.addEventListener('click', (ev) => {
      const lang = ev.target.closest('.lang-btn[data-lang]');
      if(lang){ setLanguage(lang.dataset.lang); return; }
      const nav = ev.target.closest('[data-nav]');
      if(nav){ showScreen(nav.dataset.nav); return; }
      const act = ev.target.closest('[data-action]');
      if(act){ audioUI?.unlock?.(); audioUI?.emit?.('ui.click', { action:act.dataset.action }); handleAction(act.dataset.action, act); }
      const tab = ev.target.closest('[data-tab]');
      if(tab){
        const tabName = tab.dataset.tab;
        $$('.side-nav button').forEach(b=>b.classList.remove('active'));
        const sideButton = document.querySelector(`.side-nav button[data-tab="${tabName}"]`);
        if(sideButton) sideButton.classList.add('active');
        else tab.classList.add('active');
        renderTab(tabName);
      }
      const mode = ev.target.closest('[data-mode]');
      if(mode){ selectedMode = mode.dataset.mode; $$('.mode-card').forEach(b=>b.classList.remove('selected')); mode.classList.add('selected'); syncSeriesWithMode(); renderTeamSelect(); }
      const comp = ev.target.closest('[data-compound]');
      if(comp){ selectedCompound = comp.dataset.compound; state.raceStrategy = {...(state.raceStrategy||{}), startCompound:selectedCompound}; saveState(); $$('.strategy-pills button').forEach(b=>b.classList.remove('selected')); comp.classList.add('selected'); renderStrategyPlan(); }
      const seriesChoice = ev.target.closest('[data-series]');
      if(seriesChoice){ selectedSeries = seriesChoice.dataset.series; selectedTeam = firstTeamForSeries(selectedSeries).id; renderTeamSelect(); return; }
      const teamChoice = ev.target.closest('[data-team]');
      if(teamChoice){ selectedTeam = teamChoice.dataset.team; renderTeamSelect(); }
    });
  }


  function initNavLabels(){
    const labels = {
      dashboard:'Dashboard', drivers:'Pilotos', garage:'Carro', staff:'Staff', facilities:'Base', calendar:'Agenda',
      season:'Temporadas', standings:'Tabelas', 'driver-market':'Mercado', rivals:'Rivais', media:'Mídia',
      offers:'Propostas', inbox:'E-mails', saves:'Saves', 'data-lock':'Dados', qa:'QA', system:'Sistema'
    };
    $$('.side-nav button[data-tab]').forEach(btn => {
      const label = labels[btn.dataset.tab] || btn.dataset.tab;
      btn.dataset.label = label;
      btn.title = label;
      btn.setAttribute('aria-label', label);
    });
  }

  function mobileCoachCard(){
    const nextRace = activeCalendar()[state.roundIndex] || activeCalendar()[0];
    const team = teamById(state.currentTeam);
    return `<article class="dash-card glass-panel wide ux-coach-card"><h3>Central do Manager</h3><p>Próximo passo recomendado: <b>${(state.completedRaces||0) >= activeCalendar().length ? 'revisar temporada' : 'preparar fim de semana em ' + nextRace.name}</b>.</p><div class="quick-action-row"><button class="primary" data-action="goQualifying">PRÓXIMA CORRIDA</button><button class="secondary" data-tab="garage">DESENVOLVER CARRO</button><button class="secondary" data-tab="staff">STAFF</button><button class="secondary" data-tab="inbox">E-MAILS</button></div><p class="muted-small">${team ? team.name : 'Equipe'} • ${state.currentSeries || 'F2'} • ${seasonProgressText()}</p></article>`;
  }

  function handleAction(action, el){
    const actions = {
      continueCareer(){ if(state.profile) showScreen('lobby'); else showScreen('career-create'); },
      enterFullscreen(){ enterFullscreen(); },
      cycleHudMode(){ cycleHudMode(); },
      createProfile(){ createProfile(); },
      startCareer(){ startCareer(); },
      goQualifying(){ ensureCareerSystems(); if((state.completedRaces||0) >= activeCalendar().length){ renderTab('calendar'); return; } showScreen('qualifying'); },
      simulatePractice(){ simulatePracticeSession(); },
      setQualyFocus(){ setQualyFocus(el.dataset.focus); },
      startQualifying(){ simulateQualifying(); },
      simulateSprint(){ simulateSupportSession('sprint'); },
      simulateFeature(){ simulateSupportSession('feature'); },
      startRaceDirect(){ const sel=document.getElementById('quickRaceSelect'); if(sel) state.roundIndex=Number(sel.value)||0; setupRace(true); audioUI?.emit?.('race.start'); showScreen('race'); },
      startRace(){ setupRace(false); audioUI?.emit?.('race.start'); showScreen('race'); },
      setPace(){ if(race){ race.playerPace[Number(el.dataset.driver)] = el.dataset.pace; updateRaceHud(); } },
      pitDriver(){ if(race){ requestPit(Number(el.dataset.driver)); audioUI?.emit?.('race.pit'); } },
      chooseStrategy(){ chooseRaceStrategy(el.dataset.strategy); },
      toggleRaceSpeed(){ if(race){ race.speed = race.speed === 1 ? 2 : race.speed === 2 ? 4 : race.speed === 4 ? 8 : race.speed === 8 ? 16 : 1; $('#speedLabel').textContent = race.speed; } },
      toggleRaceCamera(){ if(race){ const modes=['tv','follow','onboard','pitwall','overhead','replay']; const idx=modes.indexOf(race.cameraMode||'tv'); race.cameraMode=modes[(idx+1)%modes.length]; race.raceLog.unshift('Câmera: '+cameraLabel(race.cameraMode)); updateRaceHud(); } },
      finishRaceNow(){ if(race) finishRace(); },
      returnLobbyAfterRace(){ showScreen('lobby'); },
      nextRaceFromResults(){ advanceToNextRaceScreen(); },
      upgradePart(){ upgradePart(el.dataset.part); },
      signSponsor(){ signSponsor(el.dataset.sponsor); },
      hireStaff(){ hireStaff(el.dataset.role); },
      applySetup(){ applySetupPreset(el.dataset.setup); },
      scoutRivals(){ scoutRivals(); },
      pressConference(){ pressConference(el.dataset.choice); },
      acceptOffer(){ acceptCareerOffer(el.dataset.team); },
      markMailRead(){ markMailRead(el.dataset.mail); },
      signDriver(){ signDriver(el.dataset.driver); },
      offerDriver(){ offerDriverContract(el.dataset.driver, Number(el.dataset.years||1), Number(el.dataset.salary||1)); },
      saveSlot(){ saveToSlot(Number(el.dataset.slot||1)); },
      loadSlot(){ loadFromSlot(Number(el.dataset.slot||1)); },
      exportSave(){ exportCurrentSave(); },
      importSave(){ importSaveFromPrompt(); },
      clearPwaCache(){ clearPwaCache(); },
      exportDiagnostics(){ exportDiagnostics(); },
      resetActiveSave(){ resetActiveSave(); },
      verifySaveVault(){ verifySaveVault(); },
      recoverSaveVault(){ recoverSaveVault(); },
      resetCoach(){ state.tutorial = { completed:false, step:0 }; saveState(); renderTab('saves'); },
      completeCoach(){ state.tutorial = { completed:true, step:99 }; addInboxMessage('tutorial','Engenheiro-chefe','Tutorial concluído','Você concluiu o manual rápido. Agora o foco é desenvolver o carro, cuidar das finanças e buscar convites maiores.',{}); saveState(); renderTab('saves'); updateHud(); },
      runQa(){ runQualityChecklist(); },
      runClosedBeta(){ runClosedBetaAudit(); },
      runSystemDiagnostics(){ runSystemDiagnostics(); },
      runPerformanceAudit(){ runPerformanceAudit(); },
      runVehiclePhysicsAudit(){ runVehiclePhysicsAudit(); },
      runStrategyAIAudit(){ runStrategyAIAudit(); },
      runBalanceAudit(){ runBalanceAudit(); },
      runBalanceMonteCarlo(){ runBalanceMonteCarlo(); },
      runVisual3DAudit(){ runVisual3DAudit(); },
      runAudioUIAudit(){ runAudioUIAudit(); },
      toggleAudioMute(){ toggleAudioMute(); },
      runLivingCareerAudit(){ runLivingCareerAudit(); },
      runLivingCareerReview(){ runLivingCareerReview(); },
      runBackendLaunchAudit(){ runBackendLaunchAudit(); },
      prepareReleaseCandidate(){ prepareReleaseCandidate(); },
      toggleTelemetryConsent(){ toggleTelemetryConsent(); },
      runReleaseCandidateAudit(){ runReleaseCandidateAudit(); },
      prepareCommercialPackage(){ prepareCommercialPackage(); },
      exportStoreChecklist(){ exportStoreChecklist(); },
      runDeploymentAudit(){ runDeploymentAudit(); },
      preparePublicBeta(){ preparePublicBeta(); },
      generateAssetRestorePlan(){ generateAssetRestorePlan(); },
      runOperationsAudit(){ runOperationsAudit(); },
      addBetaFeedbackSample(){ addBetaFeedbackSample(); },
      prepareHotfixPlan(){ prepareHotfixPlan(); },
      runAssetRestoreAudit(){ runAssetRestoreAudit(); },
      prepareGuidedAssetRestore(){ prepareGuidedAssetRestore(); },
      verifyAssetPreview(){ verifyAssetPreview(); },
      runVisualHotfixAudit(){ runVisualHotfixAudit(); },
      recordVisualEvidence(){ recordVisualEvidence(); },
      runPublicBetaAssetsAudit(){ runPublicBetaAssetsAudit(); },
      preparePublicBetaAssetsPreview(){ preparePublicBetaAssetsPreview(); },
      registerPublicBetaEvidence(){ registerPublicBetaEvidence(); },
      runGameplayPolishAudit(){ runGameplayPolishAudit(); },
      registerGameplayEvidence(){ registerGameplayEvidence(); },
      toggleGameplayProfile(){ toggleGameplayProfile(); },
      runTelemetryAudit(){ runTelemetryAudit(); },
      exportTelemetrySession(){ exportTelemetrySession(); },
      runTelemetryDiagnosis(){ runTelemetryDiagnosis(); },
      runSetupEngineeringAudit(){ runSetupEngineeringAudit(); },
      runSetupCorrelation(){ runSetupCorrelation(); },
      simulateSetupPractice(){ simulateSetupPractice(); },
      runTyreStintAudit(){ runTyreStintAudit(); },
      runTyreStintAnalysis(){ runTyreStintAnalysis(); },
      prepareTyrePitPlan(){ prepareTyrePitPlan(); },
      runAssetAudit(){ hydrateAssets(document); setTimeout(renderAssetChecklist, 120); },
      exportAssetReport(){ exportAssetReport(); },
      clearRuntimeErrors(){ clearRuntimeErrors(); },
      setDifficulty(){ setDifficulty(el.dataset.difficulty); },
      endSeason(){ endSeasonReview(); },
      setLanguage(){ setLanguage(el.dataset.lang); }
    };
    if(actions[action]) actions[action]();
  }

  function setLanguage(lang){
    const next = i18nManager?.setLanguage?.(lang) || 'pt-BR';
    state.settings = {...(state.settings||{}), language:next, locale:i18nManager?.info?.(next)?.locale || 'pt-BR'};
    state.quality = {...(state.quality||{}), lastLanguageChange:new Date().toISOString(), i18n:i18nManager?.audit?.()};
    saveState();
    addInboxMessage('system','Sistema', 'Idioma alterado', `Idioma ativo: ${next}. O catálogo mantém fallback em português quando uma frase ainda não tiver tradução específica.`, { language:next });
    updateHud();
    applyTranslations(document.body);
  }

  function renderQuickRaceSelect(){
    const sel = document.getElementById('quickRaceSelect');
    if(!sel || !activeCalendar()) return;
    sel.innerHTML = activeCalendar().map((r,i)=>`<option value="${i}">${String(i+1).padStart(2,'0')} • ${r.name}</option>`).join('');
    const miamiIndex = activeCalendar().findIndex(r => r.svgLayout === 'miami');
    sel.value = String(miamiIndex >= 0 ? miamiIndex : 0);
  }

  function renderCreator(){
    const avatarList = $('#avatarList'); avatarList.innerHTML = '';
    DATA.avatars.forEach((src,i) => {
      const b = document.createElement('button');
      b.className = 'avatar-option' + (i===selectedAvatar ? ' selected':'');
      b.innerHTML = `<img data-asset-src="${src}" alt="Avatar ${i+1}" /><span class="fallback-badge">AV${i+1}</span><small class="asset-path-hint">${assetRegistry?.normalizePath?.(src) || src}</small>`;
      b.onclick = () => { selectedAvatar=i; renderCreator(); };
      avatarList.appendChild(b);
    });
    const sel = $('#managerCountry');
    sel.innerHTML = DATA.countries.map(c=>`<option value="${c.code}">${c.name}</option>`).join('');
    hydrateAssets(avatarList);
  }

  function createProfile(){
    const name = $('#managerName').value.trim() || 'Jonatan Vale';
    const country = $('#managerCountry').value || 'BR';
    state.profile = { name, country, avatar:DATA.avatars[selectedAvatar] };
    state.mode = selectedMode;
    saveState();
    showScreen('team-select');
  }

  function teamVisual(team, large=false){
    const bg = team.card || team.lobby || DATA.assetPaths.lobbyGlobal;
    return `
      <div class="team-visual ${large ? 'large':''}" data-asset-bg="${bg}">
        ${team.logo ? `<img class="team-logo" data-asset-src="${team.logo}" alt="${team.name}" />` : ''}
        <span class="fallback-badge team-fallback" style="display:${team.logo ? 'none':'flex'};background:linear-gradient(135deg,#${(team.color||0x333333).toString(16).padStart(6,'0')}, #111827)">${initials(team.name)}</span>
      </div>`;
  }

  function firstTeamForSeries(series){
    return series === 'F1' ? DATA.f1Teams2026[0] : DATA.f2Teams[0];
  }

  function selectedTeamSeries(){
    return DATA.f1Teams2026.some(t => t.id === selectedTeam) ? 'F1' : 'F2';
  }

  function syncSeriesWithMode(){
    if(selectedMode !== 'sandbox') selectedSeries = 'F2';
    const list = selectedSeries === 'F1' ? DATA.f1Teams2026 : DATA.f2Teams;
    if(!list.some(t => t.id === selectedTeam)) selectedTeam = list[0].id;
  }

  function teamDifficulty(team, series){
    const rep = Number(team.reputation || 50);
    if(series === 'F1'){
      if(rep >= 90) return { label:'Elite mundial', stars:'★★★★★', tag:'Difícil' };
      if(rep >= 82) return { label:'Equipe média/alta', stars:'★★★★☆', tag:'Intermediário' };
      return { label:'Projeto de reconstrução', stars:'★★★☆☆', tag:'Carreira longa' };
    }
    if(rep >= 68) return { label:'F2 forte', stars:'★★★★☆', tag:'Pressão alta' };
    if(rep >= 58) return { label:'F2 média', stars:'★★★☆☆', tag:'Equilíbrio' };
    return { label:'F2 de entrada', stars:'★★☆☆☆', tag:'Modo carreira' };
  }

  function renderTeamSelect(){
    syncSeriesWithMode();
    const chooser = $('#seriesChooser');
    if(chooser){
      const sandbox = selectedMode === 'sandbox';
      chooser.innerHTML = sandbox
        ? `<button class="series-pill ${selectedSeries==='F2'?'selected':''}" data-series="F2">FÓRMULA 2</button><button class="series-pill ${selectedSeries==='F1'?'selected':''}" data-series="F1">FÓRMULA 1</button><span>Sandbox: escolha livre entre F2 e F1. A carreira realista continua começando obrigatoriamente na F2.</span>`
        : `<span><b>Modo carreira realista:</b> início obrigatório na Fórmula 2. Convites para F1 virão por reputação, metas cumpridas e finanças.</span>`;
      chooser.classList.toggle('sandbox-open', sandbox);
    }
    const title = $('#teamSelectTitle');
    if(title) title.textContent = selectedMode === 'sandbox' ? `ESCOLHA SUA EQUIPE DE ${selectedSeries}` : 'ESCOLHA SUA EQUIPE DE F2';
    const path = $('#careerPathText');
    if(path){
      path.innerHTML = selectedMode === 'sandbox'
        ? `<b>Sandbox:</b> escolha qualquer equipe de F2 ou F1 desde o início. Ideal para testes, partidas rápidas e evolução livre.`
        : `<b>Plano de carreira:</b> F2 equipe fraca → F2 média → F2 forte → convite para F1 baixa → F1 média → equipe grande.`;
    }
    const grid = $('#teamSelectGrid'); grid.innerHTML = '';
    const teams = selectedSeries === 'F1' ? DATA.f1Teams2026 : DATA.f2Teams;
    teams.forEach(t => {
      const b = document.createElement('button');
      const diff = teamDifficulty(t, selectedSeries);
      const drivers = driversForTeam(t.id).slice(0,2);
      b.className = 'team-card team-card-premium' + (t.id===selectedTeam?' selected':'');
      b.dataset.team = t.id;
      b.style.setProperty('--team-color', colorHex(t.color));
      b.style.setProperty('--team-bg', `linear-gradient(135deg, rgba(3,7,17,.92), rgba(13,16,32,.78)), radial-gradient(circle at 72% 24%, rgba(${colorRgbString(t.color)}, .42), transparent 42%)`);
      b.innerHTML = `
        <div class="team-card-watermark">${t.logo ? `<img data-asset-src="${t.logo}" alt="${t.name}" />` : ''}</div>
        <div class="team-card-topline"><span>${selectedSeries}</span><strong>${diff.tag}</strong></div>
        ${teamVisual(t)}
        <div class="team-card-main">
          <h3>${t.name}</h3>
          <p class="team-level">${diff.label} <em>${diff.stars}</em></p>
        </div>
        <div class="team-driver-strip">${drivers.map(d => `<span>${driverAvatarChip(d, 'driver-avatar-inline small')}<b>${d.short}</b></span>`).join('')}</div>
        <div class="team-stats premium"><span>Orçamento <b>${money(t.budget)}</b></span><span>Reputação <b>${t.reputation}</b></span><span>Meta <b>${t.objective}</b></span></div>
      `;
      grid.appendChild(b);
    });
    hydrateAssets(grid);
  }

  function startCareer(){
    syncSeriesWithMode();
    const series = selectedTeamSeries();
    const source = series === 'F1' ? DATA.f1Teams2026 : DATA.f2Teams;
    const t = source.find(x=>x.id===selectedTeam) || source[0];
    state.currentSeries = series;
    state.currentTeam = t.id;
    state.money = Math.round((t.budget||4000000) * budgetStartMultiplier(series));
    state.reputation = state.mode==='sandbox' ? Math.max(t.reputation, 70) : Math.max(28, Math.round((t.reputation||50) - (series === 'F2' ? 7 : 12)));
    state.car = {...t.car, fuel:55};
    state.roundIndex = 0;
    state.completedRaces = 0;
    state.lastQualifying = [];
    state.lastRace = [];
    state.weekend = { practiceDone:false, setupConfidence:50, tyreKnowledge:50, qualyFocus:'balanced', engineerNote:'Aguardando treino livre.' };
    state.offers = [];
    state.inbox = [];
    state.unreadMessages = 0;
    state.seasonYear = 2026;
    state.seasonNumber = 1;
    state.seasonStats = { races:0, bestFinish:null, podiums:0, wins:0, objectiveProgress:0 };
    state.careerHistory = state.careerHistory || [];
    state.contract = { team:t.id, series, startedRound:state.completedRaces, salary:Math.round((t.budget||4000000)*0.035), objective:t.objective || 'Cumprir metas da diretoria.' };
    seedCareerInbox();
    saveState();
    updateHud();
    showScreen('lobby');
  }

  function updateHud(){
    if(!state.profile || !state.currentTeam) return;
    const t = teamById(state.currentTeam);
    $('#hudTeam').textContent = t.name;
    $('#hudManager').textContent = `${state.profile.name} • ${state.currentSeries}`;
    $('#hudRep').textContent = `REP ${Math.round(state.reputation)}`;
    $('#hudMoney').textContent = money(state.money);
    const raceNow = Math.min((state.completedRaces||0)+1, activeCalendar().length);
    const unread = state.unreadMessages ? ` • ✉ ${state.unreadMessages}` : '';
    $('#hudRound').textContent = `T${state.seasonNumber||1} ${state.seasonYear||2026} • Corrida ${raceNow}/${activeCalendar().length}${unread}`;
  }

  function renderLobby(){
    ensureCareerSystems();
    updateHud();
    const team = teamById(state.currentTeam);
    setScreenBg('screen-lobby', team.lobby || DATA.assetPaths.lobbyGlobal);
    applyTeamTheme(team);
    refreshCareerOffers();
    renderTab($('.side-nav button.active')?.dataset.tab || 'dashboard');
  }

  function applyTeamTheme(team){
    const screen = $('#screen-lobby');
    if(!screen || !team) return;
    const hex = colorHex(team.color);
    const rgb = colorRgbString(team.color);
    screen.style.setProperty('--team-color', hex);
    screen.style.setProperty('--team-color-rgb', rgb);
  }

  function sponsorButtons(){
    return DATA.sponsors.map(s=>`<div class="sponsor-mini"><div class="sponsor-logo-text">${s.logoText||initials(s.name)}</div><div><b>${s.name}</b><small>${s.goal} • bônus ${money(s.raceBonus)}</small></div><button class="secondary" data-action="signSponsor" data-sponsor="${s.id}">ASSINAR ${money(s.advance)}</button></div>`).join('');
  }

  function renderTab(tab){
    const content = $('#tabContent');
    const team = teamById(state.currentTeam);
    const bg = team.lobby || DATA.assetPaths.lobbyGlobal;
    const currentRace = activeCalendar()[state.roundIndex] || activeCalendar()[5];
    const drivers = driversForTeam(state.currentTeam);

    if(tab === 'dashboard'){
      const nextAgenda = agendaItems()[0];
      const unread = state.unreadMessages || 0;
      content.innerHTML = `<div class="cards-grid dashboard-premium-grid">
        ${mobileCoachCard()}
        <article class="dash-card glass-panel bg" data-asset-bg="${bg}"><div class="dash-overlay"></div><div class="dash-card-top">${teamVisual(team,true)}</div><h3>${team.name}</h3><p>${team.objective || 'Construir reputação e alcançar a Fórmula 1.'}</p><p>Próxima: ${currentRace.name}</p><p>${nextAgenda ? nextAgenda.label : 'Temporada concluída: faça a revisão anual.'}</p></article>
        <article class="dash-card glass-panel"><h3>Agenda Executiva</h3><p><b>${state.seasonYear || 2026}</b> • Temporada ${state.seasonNumber || 1}</p><p>${seasonProgressText()}</p><button class="secondary" data-tab="calendar">VER AGENDA</button></article>
        <article class="dash-card glass-panel"><h3>Caixa de E-mails</h3><p>${unread ? `<b>${unread} mensagem(ns) nova(s)</b>` : 'Nenhuma mensagem não lida.'}</p><p>Convites, relatórios da diretoria e atualizações de agenda aparecem aqui.</p><button class="secondary" data-tab="inbox">ABRIR E-MAILS</button></article>
        <article class="dash-card glass-panel"><h3>Mídia e Moral</h3><p>Imprensa: <b>${mediaMoodLabel(state.pressReputation)}</b></p><p>Moral: <b>${moraleLabel(state.teamMorale)}</b> • Pressão: <b>${pressureLabel(state.boardPressure)}</b></p><button class="secondary" data-tab="media">ABRIR PADDOCK</button></article>
        <article class="dash-card glass-panel"><h3>Beta jogável</h3><p>Dificuldade: <b>${difficultyLabel()}</b></p><p>Score QA: <b>${state.quality?.betaScore || betaReadinessScore()}/100</b></p><button class="secondary" data-tab="qa">ABRIR QA</button></article>
        <article class="dash-card glass-panel"><h3>Sistema Antiquebra</h3><p>Diagnóstico: <b>${systemDiagnosticScoreText()}</b></p><p>Build, save, cache, navegador e erros em uma central verificável.</p><button class="secondary" data-tab="system">ABRIR SISTEMA</button></article>
        <article class="dash-card glass-panel"><h3>Data Lock</h3><p>Conteúdo oficial: <b>${dataLockScore()}/100</b></p><p>Equipes, pilotos, calendário, assets e economia congelados para beta.</p><button class="secondary" data-tab="data-lock">VER DADOS</button></article>
        <article class="dash-card glass-panel"><h3>Balanceamento</h3><p>${balanceSummary()}</p><p>Objetivo esperado: melhor resultado até P${objectiveExpectedBest(team)}.</p><button class="secondary" data-tab="qa">AJUSTAR DIFICULDADE</button></article>
        <article class="dash-card glass-panel"><h3>Metas da Diretoria</h3><p>${team.objective || 'Pontuar e evoluir a equipe.'}</p><div class="progress"><i style="width:${Math.min(100,state.reputation)}%"></i></div><p>Reputação ${Math.round(state.reputation)}/100</p></article>
        <article class="dash-card glass-panel wide sponsor-card"><h3>Patrocinadores</h3><p>${state.sponsor ? 'Contrato ativo: ' + state.sponsor.name : 'Escolha um patrocinador principal. Metas geram bônus por corrida.'}</p>${sponsorButtons()}</article>
        <article class="dash-card glass-panel career-card"><h3>Carreira do Gestor</h3><p><b>${state.currentSeries === 'F2' ? 'Você começou na F2.' : 'Você está na Fórmula 1.'}</b> Cumpra metas, evolua pilotos e mantenha as finanças saudáveis para avançar.</p><p>Contrato: ${state.contract ? money(state.contract.salary) + ' / temporada' : 'em avaliação'} • ${contractStatusText()}</p><button class="secondary" data-tab="offers">VER PROPOSTAS</button></article>
      </div>`;
    }
    if(tab === 'drivers'){
      content.innerHTML = `<div class="cards-grid">${drivers.map(d=>driverCard(d)).join('')}<article class="dash-card glass-panel"><h3>Mercado de Pilotos</h3><p>Agora cada piloto tem overall, potencial, salário, multa rescisória, duração de contrato e chance de aceitar ou recusar proposta.</p><button class="secondary" data-tab="driver-market">ABRIR MERCADO</button></article></div>`;
    }
    if(tab === 'garage'){
      const parts = [['engine','Motor','engine','Aceleração e velocidade final.'],['aero','Aerodinâmica','aero','Curvas, classificação e pistas técnicas.'],['chassis','Chassi','chassis','Consistência, ritmo em stint e estabilidade.'],['reliability','Confiabilidade','reliability','Reduz falhas, perda de condição e abandonos.'],['tyreWear','Pneus','saveTyres','Reduz desgaste e aumenta janela de estratégia.'],['pitStop','Pit Stop','pitStop','Menos tempo perdido no box.'],['fuel','Combustível','fuel','Menos perda de ritmo em modo ataque.']];
      const setup = state.setup || { preset:'balanced' };
      content.innerHTML = `<div class="cards-grid"><article class="dash-card glass-panel bg wide" data-asset-bg="${DATA.assetPaths.garage}"><div class="dash-overlay"></div><h3>Oficina e Acerto Mecânico</h3><p>Agora cada peça, equipe técnica e acerto influencia classificação, ritmo, pneus, pit stop e confiabilidade na corrida 3D.</p><p>Acerto atual: <b>${setupLabel(setup.preset)}</b></p><div class="setup-preset-grid">
        <button class="secondary ${setup.preset==='balanced'?'selected':''}" data-action="applySetup" data-setup="balanced">EQUILIBRADO</button>
        <button class="secondary ${setup.preset==='downforce'?'selected':''}" data-action="applySetup" data-setup="downforce">AERO/CURVA</button>
        <button class="secondary ${setup.preset==='speed'?'selected':''}" data-action="applySetup" data-setup="speed">RETA/MOTOR</button>
        <button class="secondary ${setup.preset==='tyres'?'selected':''}" data-action="applySetup" data-setup="tyres">POUPAR PNEUS</button>
        <button class="secondary ${setup.preset==='rain'?'selected':''}" data-action="applySetup" data-setup="rain">CHUVA/CONTROLE</button>
      </div></article>${parts.map(([key,label,icon,desc])=>`<article class="dash-card glass-panel"><h3>${label}</h3><div class="icon-row"><img class="mini-icon" data-asset-src="${DATA.assetPaths[icon]}" alt="${label}" /><span class="fallback-badge mini-fallback">${initials(label)}</span></div><p>${desc}</p><p>Nível ${Math.round(state.car[key]||50)}</p><div class="progress"><i style="width:${state.car[key]||50}%"></i></div><button class="primary" data-action="upgradePart" data-part="${key}">MELHORAR ${money(upgradeCost(key))}</button></article>`).join('')}</div>`;
    }
    if(tab === 'staff'){
      const roles = ['designers','mechanics','strategists','raceEngineers','scouts','pitCrew'];
      content.innerHTML = `<div class="cards-grid"><article class="dash-card glass-panel wide"><h3>Staff Técnico Avançado</h3><p>Equipe técnica agora afeta upgrade, setup, pit stop, desgaste, scouting e consistência em corrida. Para um manager justo, contratar staff custa caro e precisa caber no orçamento.</p></article>${roles.map(r=>`<article class="dash-card glass-panel staff-card"><h3>${labelRole(r)}</h3><p>Nível ${state.staff[r]||1}</p><p>${roleDesc(r)}</p><p>Impacto real: <b>${staffImpactText(r)}</b></p><div class="progress"><i style="width:${Math.min(100,(state.staff[r]||1)*12)}%"></i></div><button class="primary" data-action="hireStaff" data-role="${r}">CONTRATAR ${money(staffHireCost(r))}</button></article>`).join('')}</div>`;
    }
    if(tab === 'facilities'){
      content.innerHTML = `<div class="cards-grid">${Object.entries(state.facilities).map(([k,v])=>`<article class="dash-card glass-panel"><h3>${facilityLabel(k)}</h3><p>Nível ${v}</p><div class="progress"><i style="width:${v*20}%"></i></div><button class="secondary">EXPANSÃO FUTURA</button></article>`).join('')}</div>`;
    }
    if(tab === 'calendar'){
      const done = (state.completedRaces||0) >= activeCalendar().length;
      content.innerHTML = `<div class="cards-grid agenda-grid">
        <article class="dash-card glass-panel bg wide" data-asset-bg="${DATA.assetPaths.calendar}"><div class="dash-overlay"></div><h3>Agenda da Temporada ${state.seasonYear || 2026}</h3><p>${seasonProgressText()}</p><div class="progress"><i style="width:${Math.min(100, ((state.completedRaces||0)/activeCalendar().length)*100)}%"></i></div>${done ? '<button class="primary" data-action="endSeason">FAZER REVISÃO DA TEMPORADA</button>' : '<button class="primary" data-action="goQualifying">IR PARA PRÓXIMA CORRIDA</button>'}</article>
        ${agendaItems().map(agendaCard).join('')}
      </div>`;
    }


    if(tab === 'season'){
      ensureCareerSystems();
      content.innerHTML = `<div class="cards-grid season-grid">
        <article class="dash-card glass-panel wide"><h3>Temporadas e Mundo Vivo</h3><p>A carreira agora registra histórico anual, campeões, evolução de pilotos, contratos e regressão/evolução técnica do carro.</p><p>Temporada atual: <b>${state.seasonYear || 2026}</b> • Ano ${state.seasonNumber || 1} • ${seasonProgressText()}</p></article>
        <article class="dash-card glass-panel"><h3>Resumo Atual</h3><p>Melhor resultado: <b>${state.seasonStats?.bestFinish ? 'P'+state.seasonStats.bestFinish : 'sem corridas'}</b></p><p>Pódios: <b>${state.seasonStats?.podiums || 0}</b> • Vitórias: <b>${state.seasonStats?.wins || 0}</b></p><p>Status: ${contractStatusText()}</p></article>
        <article class="dash-card glass-panel"><h3>Contratos de Pilotos</h3>${currentDriverContractRows()}</article>
        <article class="dash-card glass-panel"><h3>Evolução Técnica</h3>${carEvolutionRows()}</article>
        <article class="dash-card glass-panel wide"><h3>Arquivo de Temporadas</h3>${seasonArchiveRows()}</article>
        <article class="dash-card glass-panel wide"><h3>Hall da Fama</h3>${hallOfFameRows()}</article>
        <article class="dash-card glass-panel wide"><h3>Desenvolvimento de Pilotos</h3>${driverDevelopmentRows()}</article>
      </div>`;
    }

    if(tab === 'standings'){
      content.innerHTML = `<div class="cards-grid standings-manager-grid">
        <article class="dash-card glass-panel wide"><h3>Classificações ${state.currentSeries}</h3><p>Pilotos com foto/avatar e equipes com logos. Pontos são atualizados ao final das corridas da categoria atual.</p></article>
        <article class="dash-card glass-panel wide"><h3>Classificação de Pilotos</h3><div class="standings-list rich-standings">${driverStandingsRows()}</div></article>
        <article class="dash-card glass-panel wide"><h3>Classificação de Equipes</h3><div class="standings-list rich-standings">${teamStandingsRows()}</div></article>
      </div>`;
    }

    if(tab === 'driver-market'){
      content.innerHTML = `<div class="cards-grid driver-market-grid">
        <article class="dash-card glass-panel wide"><h3>Mercado de Pilotos</h3><p>Contrate pilotos de outras equipes. O preço considera overall, potencial, idade, salário e categoria. A contratação troca o segundo piloto da equipe atual e atualiza o grid.</p><p>Orçamento disponível: <b>${money(state.money)}</b></p></article>
        ${driverMarketCards()}
      </div>`;
    }

    if(tab === 'rivals'){
      ensureRivalWorld();
      content.innerHTML = `<div class="cards-grid rivals-grid">
        <article class="dash-card glass-panel wide"><h3>IA Rival e Mundo Vivo</h3><p>As equipes adversárias agora evoluem entre corridas, reagem aos resultados, movem pilotos no mercado e deixam a dificuldade da carreira mais justa ao longo da temporada.</p><button class="primary" data-action="scoutRivals">COMPRAR RELATÓRIO DE INTELIGÊNCIA</button></article>
        <article class="dash-card glass-panel wide"><h3>Força técnica das equipes — ${state.currentSeries}</h3><div class="standings-list rich-standings">${rivalRows()}</div></article>
        <article class="dash-card glass-panel wide"><h3>Mercado rival</h3>${rivalMarketRows()}</article>
      </div>`;
    }

    if(tab === 'media'){
      ensureCareerSystems();
      content.innerHTML = `<div class="cards-grid media-grid">
        <article class="dash-card glass-panel wide"><h3>Mídia, Moral e Pressão</h3><p>Esta área controla o ambiente do paddock. Coletivas e resultados afetam reputação, pressão da diretoria e moral dos pilotos, influenciando consistência e negociações.</p></article>
        <article class="dash-card glass-panel"><h3>Reputação na imprensa</h3><p><b>${mediaMoodLabel(state.pressReputation)}</b> — ${Math.round(state.pressReputation||50)}/100</p><div class="progress"><i style="width:${clamp(state.pressReputation||50)}%"></i></div></article>
        <article class="dash-card glass-panel"><h3>Moral da equipe</h3><p><b>${moraleLabel(state.teamMorale)}</b> — ${Math.round(state.teamMorale||60)}/100</p><div class="progress"><i style="width:${clamp(state.teamMorale||60)}%"></i></div></article>
        <article class="dash-card glass-panel"><h3>Pressão da diretoria</h3><p>${boardPressureText()}</p><div class="progress"><i style="width:${clamp(state.boardPressure||45)}%"></i></div></article>
        <article class="dash-card glass-panel wide"><h3>Coletiva de imprensa</h3><p>Escolha o tom da entrevista. Isso pode animar pilotos, reduzir pressão ou aumentar expectativa pública.</p><div class="press-buttons"><button class="primary" data-action="pressConference" data-choice="ambitious">PROMETER EVOLUÇÃO FORTE</button><button class="secondary" data-action="pressConference" data-choice="balanced">DISCURSO EQUILIBRADO</button><button class="secondary" data-action="pressConference" data-choice="protect">PROTEGER PILOTOS</button><button class="secondary" data-action="pressConference" data-choice="realistic">ALINHAR EXPECTATIVAS</button></div></article>
        <article class="dash-card glass-panel wide"><h3>Moral dos pilotos</h3><div class="standings-list rich-standings">${driverMoraleRows()}</div></article>
        <article class="dash-card glass-panel wide"><h3>Manchetes recentes</h3>${mediaLogRows()}</article>
      </div>`;
    }

    if(tab === 'inbox'){
      ensureCareerSystems();
      const messages = state.inbox || [];
      content.innerHTML = `<div class="cards-grid inbox-grid">
        <article class="dash-card glass-panel wide"><h3>Central de E-mails</h3><p>Mensagens da diretoria, convites de equipes, imprensa e calendário da temporada.</p><p>${state.unreadMessages || 0} mensagem(ns) não lida(s).</p></article>
        ${messages.length ? messages.map(mailCard).join('') : '<article class="dash-card glass-panel"><h3>Caixa vazia</h3><p>Avance na temporada para receber relatórios e convites.</p></article>'}
      </div>`;
    }

    if(tab === 'saves'){
      ensureCareerSystems();
      content.innerHTML = `<div class="cards-grid save-grid">
        <article class="dash-card glass-panel wide"><h3>Central de Saves, PWA e APK</h3><p>Esta área deixa o jogo pronto para GitHub Pages, Vercel, instalação como PWA e futura conversão para APK. Use os slots para testar sem perder carreiras.</p><p>Save atual: <b>${state.profile?.name || 'sem gestor'}</b> • ${teamById(state.currentTeam)?.name || 'sem equipe'} • ${state.currentSeries || 'F2'} • Temporada ${state.seasonYear || 2026}</p></article>
        <article class="dash-card glass-panel wide"><h3>Status PWA / APK Ready</h3>${pwaStatusHTML()}<button class="primary" data-action="clearPwaCache">LIMPAR CACHE DO APP</button><button class="secondary" data-action="exportDiagnostics">EXPORTAR DIAGNÓSTICO</button><button class="secondary" data-action="resetActiveSave">RESETAR SAVE ATUAL</button></article>
        ${[1,2,3].map(saveSlotCard).join('')}
        <article class="dash-card glass-panel wide"><h3>Cofre de Save Antiquebra</h3>${saveVaultHTML()}<button class="primary" data-action="verifySaveVault">VERIFICAR COFRE</button><button class="secondary" data-action="recoverSaveVault">RECUPERAR MELHOR BACKUP</button></article>
        <article class="dash-card glass-panel wide"><h3>Exportar / Importar carreira segura</h3><p>Exportar gera um pacote portátil com checksum e metadados. Importar valida o pacote antes de gravar no cofre ativo.</p><button class="primary" data-action="exportSave">EXPORTAR PACOTE SEGURO</button><button class="secondary" data-action="importSave">IMPORTAR PACOTE SEGURO</button></article>
        <article class="dash-card glass-panel wide"><h3>Manual rápido do gestor</h3>${coachmarkHTML()}<button class="primary" data-action="completeCoach">CONCLUIR TUTORIAL</button><button class="secondary" data-action="resetCoach">REINICIAR TUTORIAL</button></article>
      </div>`;
    }


    if(tab === 'data-lock'){
      ensureCareerSystems();
      content.innerHTML = `<div class="cards-grid data-lock-grid">
        <article class="dash-card glass-panel wide"><h3>Data Lock / Conteúdo Final</h3><p>Esta área congela os dados oficiais do beta: equipes, pilotos, calendário, pontuação, caminhos de assets, overalls, salários, valores de mercado e metas de diretoria.</p><p>Score de consistência: <b>${dataLockScore()}/100</b> • Build ${DATA.build?.version || '0.9.34'}</p></article>
        <article class="dash-card glass-panel"><h3>Grid oficial</h3>${dataLockGridSummary()}</article>
        <article class="dash-card glass-panel"><h3>Assets oficiais</h3>${dataLockAssetSummary()}</article>
        <article class="dash-card glass-panel"><h3>Economia e atributos</h3>${dataLockEconomySummary()}</article>
        <article class="dash-card glass-panel wide"><h3>Checklist Data Lock</h3><div class="standings-list rich-standings qa-list">${dataLockChecklistRows()}</div></article>
        <article class="dash-card glass-panel wide"><h3>Caminhos críticos preservados</h3>${dataLockPathRows()}</article>
      </div>`;
    }


    if(tab === 'qa'){
      ensureCareerSystems();
      content.innerHTML = `<div class="cards-grid qa-grid">
        <article class="dash-card glass-panel wide"><h3>Centro de Qualidade e Beta Jogável</h3><p>Esta fase verifica se a carreira pode ser jogada do início ao fim sem quebrar fluxo: perfil, equipe, agenda, corrida, economia, mercado, e-mails, saves e assets externos.</p><p>Score atual: <b>${state.quality?.betaScore || betaReadinessScore()}/100</b> • Último check: <b>${state.quality?.lastCheck ? new Date(state.quality.lastCheck).toLocaleString('pt-BR') : 'ainda não executado'}</b></p><button class="primary" data-action="runQa">RODAR CHECKLIST BETA</button></article>
        <article class="dash-card glass-panel"><h3>Dificuldade da carreira</h3><p>Afeta economia, evolução rival, bônus de reputação, custos e pressão da diretoria.</p>${difficultyButtons()}</article>
        <article class="dash-card glass-panel"><h3>Score de prontidão</h3>${betaScorePanel()}</article>
        <article class="dash-card glass-panel wide"><h3>Beta Fechado</h3>${closedBetaPanel()}<button class="primary" data-action="runClosedBeta">RODAR AUDITORIA BETA FECHADO</button></article>
        <article class="dash-card glass-panel wide"><h3>Checklist técnico</h3>${qaChecklistRows()}</article>
        <article class="dash-card glass-panel wide"><h3>Roteiro de teste manual</h3>${manualTestPlan()}</article>
      </div>`;
    }

    if(tab === 'system'){
      ensureCareerSystems();
      const report = state.quality?.systemDiagnostics || null;
      const errors = runtimeGuard?.list?.() || [];
      const buildCheck = CORE.build?.consistency?.(DATA.build);
      content.innerHTML = `<div class="cards-grid system-grid">
        <article class="dash-card glass-panel wide system-hero"><h3>Central Antiquebra e Diagnóstico</h3><p>Verifica build, dados, save, armazenamento, PWA, viewport, registro central de assets, performance mobile, balanceamento científico, corrida 3D profissional, áudio/interface/acessibilidade, carreira viva profunda, backend/segurança/lançamento, deploy/beta público, operação beta F20, restauração de assets F21, hotfix visual F22, beta público com assets reais F23, gameplay perfeita F24, telemetria realista F25, setup avançado F26, pneus/stint F27 e erros reais do navegador.</p><p>Build ativa: <b>${DATA.build?.build_code || 'dev'}</b> • Save schema <b>${SAVE_SCHEMA}</b> • Resultado: <b>${report ? report.score + '/100' : 'não executado'}</b></p><button class="primary" data-action="runSystemDiagnostics" ${diagnosticsRunning?'disabled':''}>${diagnosticsRunning?'ANALISANDO…':'RODAR DIAGNÓSTICO COMPLETO'}</button><button class="secondary" data-action="runPerformanceAudit">MEDIR PERFORMANCE</button><button class="secondary" data-action="exportDiagnostics">EXPORTAR RELATÓRIO</button></article>
        <article class="dash-card glass-panel"><h3>Orçamento mobile</h3>${performanceMiniHTML()}</article>
        <article class="dash-card glass-panel"><h3>Idioma e região</h3>${i18nMiniHTML()}<div class="i18n-switcher-row" data-i18n-switcher></div></article>
        <article class="dash-card glass-panel"><h3>Banco esportivo 2026</h3>${sportingMiniHTML()}</article>
        <article class="dash-card glass-panel"><h3>Regulamento e sessões</h3>${regulationMiniHTML()}</article>
        <article class="dash-card glass-panel"><h3>Física do veículo</h3>${vehicleMiniHTML()}<button class="secondary" data-action="runVehiclePhysicsAudit">AUDITAR FÍSICA</button></article>
        <article class="dash-card glass-panel"><h3>IA e estratégia F12</h3>${strategyMiniHTML()}<button class="secondary" data-action="runStrategyAIAudit">AUDITAR IA</button></article>
        <article class="dash-card glass-panel"><h3>Balanceamento F13</h3>${balanceMiniHTML()}<button class="secondary" data-action="runBalanceAudit">AUDITAR BALANCEAMENTO</button><button class="secondary" data-action="runBalanceMonteCarlo">RODAR MONTE CARLO</button></article>
        <article class="dash-card glass-panel"><h3>Corrida 3D F14</h3>${visual3dMiniHTML()}<button class="secondary" data-action="runVisual3DAudit">AUDITAR 3D</button></article>
        <article class="dash-card glass-panel"><h3>Áudio, UI e acessibilidade F15</h3>${audioUiMiniHTML()}<button class="secondary" data-action="runAudioUIAudit">AUDITAR ÁUDIO/UI</button><button class="secondary" data-action="toggleAudioMute">ÁUDIO ON/OFF</button></article>
        <article class="dash-card glass-panel living-career-card"><h3>Carreira viva F16</h3>${livingCareerMiniHTML()}<button class="secondary" data-action="runLivingCareerAudit">AUDITAR CARREIRA</button><button class="secondary" data-action="runLivingCareerReview">REVISÃO DO CONSELHO</button></article>
        <article class="dash-card glass-panel backend-launch-card"><h3>Backend, segurança e lançamento F17</h3>${backendLaunchMiniHTML()}<button class="secondary" data-action="runBackendLaunchAudit">AUDITAR LANÇAMENTO</button><button class="secondary" data-action="prepareReleaseCandidate">PREPARAR RC</button><button class="secondary" data-action="toggleTelemetryConsent">CONSENTIMENTO</button></article>
        <article class="dash-card glass-panel release-candidate-card"><h3>Release Candidate comercial F18</h3>${releaseCandidateMiniHTML()}<button class="secondary" data-action="runReleaseCandidateAudit">AUDITAR RC</button><button class="secondary" data-action="prepareCommercialPackage">PACOTE FINAL</button><button class="secondary" data-action="exportStoreChecklist">CHECKLIST LOJAS</button></article>
        <article class="dash-card glass-panel deploy-card"><h3>Deploy e Beta Público F19</h3>${deploymentMiniHTML()}<button class="secondary" data-action="runDeploymentAudit">AUDITAR DEPLOY</button><button class="secondary" data-action="preparePublicBeta">PREPARAR BETA</button><button class="secondary" data-action="generateAssetRestorePlan">PLANO ASSETS</button></article>
        <article class="dash-card glass-panel operations-card"><h3>Operação beta F20</h3>${operationsMiniHTML()}<button class="secondary" data-action="runOperationsAudit">AUDITAR OPERAÇÃO</button><button class="secondary" data-action="addBetaFeedbackSample">SIMULAR FEEDBACK</button><button class="secondary" data-action="prepareHotfixPlan">PLANO HOTFIX</button></article>
        <article class="dash-card glass-panel asset-restore-card"><h3>Assets reais e preview F21</h3>${assetRestoreMiniHTML()}<button class="secondary" data-action="runAssetRestoreAudit">AUDITAR ASSETS F21</button><button class="secondary" data-action="prepareGuidedAssetRestore">PLANO RESTAURAÇÃO</button><button class="secondary" data-action="verifyAssetPreview">VERIFICAR PREVIEW</button></article>
        <article class="dash-card glass-panel visual-hotfix-card"><h3>Hotfix visual F22</h3>${visualHotfixMiniHTML()}<button class="secondary" data-action="runVisualHotfixAudit">AUDITAR VISUAL</button><button class="secondary" data-action="recordVisualEvidence">REGISTRAR EVIDÊNCIA</button></article>
        <article class="dash-card glass-panel public-beta-assets-card"><h3>Beta assets reais F23</h3>${publicBetaAssetsMiniHTML()}<button class="secondary" data-action="runPublicBetaAssetsAudit">AUDITAR BETA</button><button class="secondary" data-action="preparePublicBetaAssetsPreview">PLANO PREVIEW</button><button class="secondary" data-action="registerPublicBetaEvidence">REGISTRAR PRINT</button></article>
        <article class="dash-card glass-panel gameplay-polish-card"><h3>Gameplay perfeita F24</h3>${gameplayPolishMiniHTML()}<button class="secondary" data-action="runGameplayPolishAudit">AUDITAR GAMEPLAY</button><button class="secondary" data-action="toggleGameplayProfile">TROCAR PERFIL</button><button class="secondary" data-action="registerGameplayEvidence">REGISTRAR TESTE</button></article>
        <article class="dash-card glass-panel telemetry-card"><h3>Telemetria realista F25</h3>${telemetryMiniHTML()}<button class="secondary" data-action="runTelemetryAudit">AUDITAR TELEMETRIA</button><button class="secondary" data-action="runTelemetryDiagnosis">DIAGNÓSTICO</button><button class="secondary" data-action="exportTelemetrySession">EXPORTAR SESSÃO</button></article>
        <article class="dash-card glass-panel setup-engineering-card"><h3>Setup avançado F26</h3>${setupEngineeringMiniHTML()}<button class="secondary" data-action="runSetupEngineeringAudit">AUDITAR SETUP</button><button class="secondary" data-action="runSetupCorrelation">CORRELACIONAR</button><button class="secondary" data-action="simulateSetupPractice">SIMULAR TREINO</button></article>
        <article class="dash-card glass-panel tyre-stint-card"><h3>Pneus e stint F27</h3>${tyreStintMiniHTML()}<button class="secondary" data-action="runTyreStintAudit">AUDITAR PNEUS</button><button class="secondary" data-action="runTyreStintAnalysis">ANALISAR STINT</button><button class="secondary" data-action="prepareTyrePitPlan">PLANO PIT</button></article>
        <article class="dash-card glass-panel"><h3>Imagens e caminhos</h3><p>Os binários pesados ficam fora do ZIP por regra do projeto, mas os caminhos continuam preservados. Restaure a pasta assets real no GitHub/Vercel para as imagens aparecerem.</p><p class="muted-small">Ex.: assets/avatars/selectable/avatar_01.png</p></article>
        <article class="dash-card glass-panel"><h3>Mobile, fullscreen e safe area</h3>${viewportMiniHTML()}<button class="secondary" data-action="enterFullscreen">ATIVAR FULLSCREEN</button><button class="secondary" data-action="cycleHudMode">ALTERNAR HUD</button></article>
        <article class="dash-card glass-panel"><h3>Fonte única de build</h3><p>${buildCheck?.ok ? '✓ Sincronizada' : '⚠ Divergência detectada'}</p><p>${CORE.build?.format?.(DATA.build, true) || DATA.build?.label || ''}</p><small>HTML, runtime, dados, PWA, pacote e manifesto são auditados na geração.</small></article>
        <article class="dash-card glass-panel"><h3>Erros registrados</h3><p><b>${errors.length}</b> ocorrência(s)</p><p>${errors[0] ? `${errors[0].context}: ${errors[0].message}` : 'Nenhuma falha de execução registrada.'}</p><button class="secondary" data-action="clearRuntimeErrors">LIMPAR REGISTRO</button></article>
        <article class="dash-card glass-panel"><h3>Cofre de Save</h3>${saveVaultMiniHTML()}</article>
        <article class="dash-card glass-panel"><h3>Última execução</h3><p>${report ? new Date(report.generatedAt).toLocaleString('pt-BR') : 'Ainda não executado'}</p><p>${report ? `${report.passed} aprovados • ${report.failed} pendentes` : 'Rode o diagnóstico completo.'}</p><div class="progress"><i style="width:${report?.score || 0}%"></i></div></article>
        <article class="dash-card glass-panel wide"><h3>Checklist verificável</h3>${systemDiagnosticRows(report, buildCheck)}</article>
        <article class="dash-card glass-panel wide"><h3>Relatório de performance</h3>${performanceRows()}</article>
        <article class="dash-card glass-panel wide"><h3>Ambiente atual</h3>${systemEnvironmentRows(report)}</article>
      </div>`;
    }

    if(tab === 'offers'){
      refreshCareerOffers();
      const offers = generateCareerOffers();
      const history = (state.careerHistory || []).slice(-6).reverse();
      content.innerHTML = `<div class="cards-grid offers-grid">
        <article class="dash-card glass-panel career-card wide"><h3>Mercado de Contratos</h3><p><b>${state.mode === 'sandbox' ? 'Sandbox livre:' : 'Carreira realista:'}</b> ${state.mode === 'sandbox' ? 'todas as equipes podem ser escolhidas para testes.' : 'propostas aparecem conforme reputação, resultados, finanças e categoria atual.'}</p><p>Status atual: ${contractStatusText()} • REP ${Math.round(state.reputation||0)}</p><p>Escada: F2 fraca → F2 média → F2 forte → F1 pequena → F1 média → equipe grande.</p></article>
        ${offers.length ? offers.map(offerCard).join('') : '<article class="dash-card glass-panel"><h3>Sem propostas</h3><p>Continue correndo, cumprindo metas e evoluindo a reputação do gestor.</p></article>'}
        <article class="dash-card glass-panel wide"><h3>Histórico da carreira</h3>${history.length ? history.map(h=>`<p>Corrida ${h.round}: ${h.from} → <b>${h.to}</b> • REP ${h.reputation}</p>`).join('') : '<p>Nenhuma troca de equipe registrada ainda.</p>'}</article>
      </div>`;
    }

    hydrateAssets(content);
    i18nManager?.renderSwitchers?.(content);
    applyTranslations(content);
  }



  function i18nMiniHTML(){
    const audit = i18nManager?.audit?.() || { current:'pt-BR', supported:['pt-BR'], phrases:0, languageCounts:{} };
    const langInfo = i18nManager?.info?.() || { name:'Português', code:'pt-BR', locale:'pt-BR' };
    const counts = audit.languageCounts || {};
    return `<p>${t('Interface preparada para português, inglês e espanhol com fallback seguro e auditoria automática.')}</p><p>${t('Idioma')}: <b>${langInfo.name}</b> • Locale <b>${langInfo.locale}</b></p><div class="i18n-meter"><span><b>${audit.supported?.length || 0}</b><small>${t('Idioma')}</small></span><span><b>${audit.phrases || 0}</b><small>${t('Chaves traduzíveis')}</small></span><span><b>${Math.min(counts.en || 0, counts.es || 0)}</b><small>${t('Fallback ativo')}</small></span></div>`;
  }

  function performanceMiniHTML(){
    const report = state.quality?.performanceReport || state.quality?.systemDiagnostics?.environment?.performance || null;
    const score = report?.score ?? null;
    const frame = report?.frameProbe || report?.metrics?.frameProbe || null;
    const metrics = report?.metrics || {};
    return `<p><b>${score === null ? 'não medido' : score + '/100'}</b></p><p>${frame?.detail || 'Sonda rápida disponível na Fase 6.'}</p><p class="muted-small">DOM ${metrics.dom_nodes ?? 'n/d'} • save ${metrics.active_save_bytes ? (metrics.active_save_bytes/1024).toFixed(1)+' KiB' : 'n/d'} • storage ${metrics.local_storage_bytes ? (metrics.local_storage_bytes/1024).toFixed(1)+' KiB' : 'n/d'}</p>`;
  }
  function performanceRows(){
    const report = state.quality?.performanceReport || state.quality?.systemDiagnostics?.environment?.performance || null;
    if(!report) return '<p>Use “MEDIR PERFORMANCE” ou rode o diagnóstico completo para gerar a sonda mobile.</p>';
    const rows = report.checks || [];
    return `<div class="standings-list rich-standings qa-list">${rows.map(item=>`<div class="row rich-row ${item.ok?'qa-ok':'qa-warn'}"><span>${item.ok?'✓':'!'}</span><span><b>${item.label}</b><small>${item.value ?? item.detail ?? ''} • limite ${item.budget ?? '-'}</small></span><span>${item.level === 'critical' ? 'Crítico' : 'Mobile'}</span><span>${item.ok?'OK':'Revisar'}</span></div>`).join('')}</div><p class="muted-small">Status: ${report.status || 'n/d'} • ${report.generatedAt ? new Date(report.generatedAt).toLocaleString('pt-BR') : ''}</p>`;
  }
  async function runPerformanceAudit(){
    try {
      if(!CORE.performance?.run) throw new Error('Módulo de performance não carregado.');
      const report = await CORE.performance.run({ document, state, persistence, assetRegistry, runtimeErrorKey:RUNTIME_ERROR_KEY, buildCode:DATA.build?.build_code || 'dev', budgets:QUALITY_BUDGETS });
      state.quality = state.quality || {};
      state.quality.performanceReport = report;
      state.quality.performanceHistory = Array.isArray(state.quality.performanceHistory) ? state.quality.performanceHistory : [];
      state.quality.performanceHistory.unshift({ generatedAt:report.generatedAt, score:report.score, status:report.status, frame:report.frameProbe?.average_ms || null });
      state.quality.performanceHistory = state.quality.performanceHistory.slice(0,10);
      addInboxMessage('qa','Performance Mobile', report.score >= 90 ? 'Orçamento aprovado' : 'Orçamento requer revisão', `Sonda Fase 6: ${report.score}/100 • ${report.frameProbe?.detail || 'sem frame probe'}.`, {score:report.score});
      saveState(); renderTab('system'); updateHud();
    } catch(error){ reportRuntimeError(error, 'runPerformanceAudit'); }
  }

  function systemDiagnosticScoreText(){
    const report = state?.quality?.systemDiagnostics;
    return report ? `${report.score}/100` : 'não executado';
  }
  function systemDiagnosticRows(report, buildCheck){
    const checks = report?.checks?.length ? report.checks : (buildCheck?.checks || []).map(item => ({...item, label:item.label || item.id, level:'critical'}));
    if(!checks.length) return '<p>Rode o diagnóstico para gerar verificações detalhadas.</p>';
    return `<div class="standings-list rich-standings qa-list">${checks.map(item=>`<div class="row rich-row ${item.ok?'qa-ok':'qa-warn'}"><span>${item.ok?'✓':'!'}</span><span><b>${item.label}</b><small>${item.detail || (item.ok?'OK':'pendente')}</small></span><span>${item.level === 'warning' ? 'Ambiente' : 'Crítico'}</span><span>${item.ok?'OK':'Revisar'}</span></div>`).join('')}</div>`;
  }
  function systemEnvironmentRows(report){
    const env = report?.environment;
    if(!env) return '<p>Os dados do ambiente aparecerão após o diagnóstico.</p>';
    const rows = [
      ['Viewport', env.viewport || 'n/d'],
      ['Idioma', env.language || 'n/d'],
      ['Conectividade', env.online ? 'online' : 'offline'],
      ['Modo instalado', env.standalone ? 'PWA standalone' : 'navegador'],
      ['Carreira', env.state?.hasProfile ? `${env.state.series || 'F2'} • ${env.state.completedRaces || 0} corridas` : 'sem perfil'],
      ['Schema do save', String(env.state?.saveSchema ?? 'n/d')]
    ];
    return `<div class="standings-list rich-standings pwa-status-list">${rows.map(([a,b])=>`<div class="row"><span>•</span><span>${a}</span><span>${b}</span><span></span></div>`).join('')}</div><p class="muted-small">${env.userAgent || ''}</p>`;
  }
  async function runSystemDiagnostics(){
    if(diagnosticsRunning) return;
    diagnosticsRunning = true;
    renderTab('system');
    try {
      if(!CORE.diagnostics?.run) throw new Error('Módulo de diagnóstico não carregado.');
      const report = await CORE.diagnostics.run({ data:DATA, state, saveKey:ACTIVE_SAVE_KEY, runtimeGuard, dataRegistry:DATA_REGISTRY, persistence, raceEngine:ensureRaceEngine(), eventBus:appEvents, assetRegistry, i18nManager, runtimeErrorKey:RUNTIME_ERROR_KEY, viewportController, performanceBudgets:QUALITY_BUDGETS, vehiclePhysics });
      state.quality = state.quality || {};
      state.quality.systemDiagnostics = report;
      state.quality.systemDiagnosticsHistory = Array.isArray(state.quality.systemDiagnosticsHistory) ? state.quality.systemDiagnosticsHistory : [];
      state.quality.systemDiagnosticsHistory.unshift({ generatedAt:report.generatedAt, score:report.score, passed:report.passed, failed:report.failed, build:report.build });
      state.quality.systemDiagnosticsHistory = state.quality.systemDiagnosticsHistory.slice(0,10);
      addInboxMessage('qa','Sistema Antiquebra',report.score >= 95 ? 'Diagnóstico aprovado' : 'Diagnóstico requer revisão',`A build ${report.build} obteve ${report.score}/100, com ${report.passed} verificações aprovadas e ${report.failed} pendentes.`,{score:report.score});
      saveState();
    } catch(error){
      reportRuntimeError(error, 'runSystemDiagnostics');
    } finally {
      diagnosticsRunning = false;
      renderTab('system');
      updateHud();
    }
  }
  function clearRuntimeErrors(){
    runtimeGuard?.clear?.();
    try { localStorage.removeItem(RUNTIME_ERROR_KEY); } catch(_){}
    if(state.quality?.systemDiagnostics) state.quality.systemDiagnostics = null;
    saveState();
    renderTab('system');
  }

  function dataLockTeams(){ return DATA_REGISTRY?.allTeams() || DATA.f1Teams2026.concat(DATA.f2Teams); }
  function dataLockDrivers(){ return DATA_REGISTRY?.allDrivers() || DATA.f1Drivers2026.concat(DATA.f2Drivers); }
  function dataLockChecks(){
    const teams = dataLockTeams();
    const drivers = dataLockDrivers();
    const calendar = activeCalendar() || [];
    const teamIds = new Set(teams.map(t=>t.id));
    const uniqueDrivers = new Set(drivers.map(d=>d.short));
    const checks = [
      {name:'Equipes F1', ok:(DATA.f1Teams2026||[]).length===11, fix:'deve conter 11 equipes F1'},
      {name:'Pilotos F1', ok:(DATA.f1Drivers2026||[]).length===22, fix:'deve conter 22 pilotos F1'},
      {name:'Equipes F2', ok:(DATA.f2Teams||[]).length===11, fix:'deve conter 11 equipes F2'},
      {name:'Pilotos F2', ok:(DATA.f2Drivers||[]).length===22, fix:'deve conter 22 pilotos F2'},
      {name:'Pilotos por equipe', ok:teams.every(t => driversForTeam(t.id).length>=2), fix:'cada equipe precisa de 2 pilotos vinculados'},
      {name:'IDs únicos de pilotos', ok:uniqueDrivers.size===drivers.length, fix:'pilotos não podem repetir short id'},
      {name:'Logos de equipes', ok:teams.every(t => !!t.logo && String(t.logo).startsWith('assets/teams/logos')), fix:'cada equipe precisa de logo no caminho oficial'},
      {name:'Avatares de pilotos', ok:drivers.every(d => !!d.portrait && String(d.portrait).startsWith('assets/drivers/')), fix:'cada piloto precisa de avatar/portrait mapeado'},
      {name:'Calendário', ok:calendar.length>=20 && calendar.every(r => r.name && r.country && r.svgLayout), fix:'calendário precisa de GPs com país/bandeira e SVG'},
      {name:'Pontuação', ok:Array.isArray(DATA.points) && DATA.points.length>=10, fix:'tabela de pontos precisa estar definida'},
      {name:'Atributos de pilotos', ok:drivers.every(d => ['overall','speed','consistency','experience','aggression','rain','potential','salary'].every(k => Number.isFinite(Number(d[k])))), fix:'pilotos precisam de atributos numéricos completos'},
      {name:'Atributos de carros', ok:teams.every(t => t.car && ['aero','engine','chassis','reliability','tyreWear','pitStop'].every(k => Number.isFinite(Number(t.car[k])))), fix:'equipes precisam de atributos técnicos completos'},
      {name:'Metas e orçamento', ok:teams.every(t => t.objective && Number(t.budget)>0 && Number(t.reputation)>0), fix:'equipes precisam de meta, orçamento e reputação'},
      {name:'Patrocinadores', ok:(DATA.sponsors||[]).length>=5 && DATA.sponsors.every(s => s.name && Number(s.advance)>0 && s.goal), fix:'patrocinadores precisam de nome, meta e adiantamento'}
    ];
    return checks;
  }
  function dataLockScore(){ const checks=dataLockChecks(); return Math.round(100*checks.filter(c=>c.ok).length/checks.length); }
  function dataLockChecklistRows(){ return dataLockChecks().map(c=>`<div class="row rich-row ${c.ok?'qa-ok':'qa-warn'}"><span>${c.ok?'✓':'!'}</span><span><b>${c.name}</b><small>${c.ok?'OK':'Verificar: '+c.fix}</small></span><span>${c.ok?'Travado':'Pendente'}</span><span>${c.ok?'Beta':'Corrigir'}</span></div>`).join(''); }
  function dataLockGridSummary(){
    return `<p>F1: <b>${DATA.f1Teams2026.length} equipes</b> / <b>${DATA.f1Drivers2026.length} pilotos</b></p><p>F2: <b>${DATA.f2Teams.length} equipes</b> / <b>${DATA.f2Drivers.length} pilotos</b></p><p>Calendário: <b>${activeCalendar().length} GPs</b></p><p>Pontuação: <b>${DATA.points.join('-')}</b></p>`;
  }
  function dataLockAssetSummary(){
    const f1Logo = DATA.f1Teams2026.every(t=>String(t.logo||'').startsWith('assets/teams/logos/'));
    const f2Logo = DATA.f2Teams.every(t=>String(t.logo||'').startsWith('assets/teams/logos/f2/'));
    const f1Avatar = DATA.f1Drivers2026.every(d=>String(d.portrait||'').startsWith('assets/drivers/current_grid/'));
    const f2Avatar = DATA.f2Drivers.every(d=>String(d.portrait||'').startsWith('assets/drivers/avatars/f2/'));
    return `<p>Logos F1: <b>${f1Logo?'OK':'verificar'}</b></p><p>Logos F2: <b>${f2Logo?'OK':'verificar'}</b></p><p>Avatares F1: <b>${f1Avatar?'OK':'verificar'}</b></p><p>Avatares F2: <b>${f2Avatar?'OK':'verificar'}</b></p>`;
  }
  function dataLockEconomySummary(){
    const drivers=dataLockDrivers(); const values=drivers.map(d=>driverValue(d));
    const avgOverall=Math.round(drivers.reduce((s,d)=>s+(Number(d.overall)||0),0)/Math.max(1,drivers.length));
    const avgValue=Math.round(values.reduce((s,v)=>s+v,0)/Math.max(1,values.length));
    return `<p>Overall médio: <b>${avgOverall}</b></p><p>Valor médio de mercado: <b>${money(avgValue)}</b></p><p>Patrocinadores: <b>${DATA.sponsors.length}</b></p><p>Dificuldade atual: <b>${difficultyLabel()}</b></p>`;
  }
  function dataLockPathRows(){
    const paths=['assets/teams/logos/','assets/teams/logos/f2/','assets/drivers/current_grid/','assets/drivers/avatars/f2/','assets/backgrounds/','assets/icons/','assets/flags/all/','assets/tracks/svg/'];
    return `<div class="asset-path-list">${paths.map(p=>`<code>${p}</code>`).join('')}</div>`;
  }


  function saveVaultHTML(){
    const info = persistence?.inspect?.();
    if(!info) return '<p>Persistência modular indisponível.</p>';
    const rows = [
      ['Formato ativo', info.format || 'n/d'],
      ['Save válido', info.valid !== false ? 'sim' : 'não'],
      ['Backups válidos', `${info.backups || 0}/${info.backupSlots?.length || 0}`],
      ['Journal', `${info.journalCount || 0} evento(s)`],
      ['Última gravação', info.lastWrite?.at ? new Date(info.lastWrite.at).toLocaleString('pt-BR') : 'ainda não registrada'],
      ['Última recuperação', info.lastRecovery?.from ? `${info.lastRecovery.from} → ativo` : 'nenhuma']
    ];
    const backupRows = (info.backupSlots || []).map(slot => `<div class="row"><span>#${slot.index}</span><span>${slot.exists ? 'ocupado' : 'vazio'}</span><span>${slot.valid === null ? '-' : slot.valid ? 'OK' : 'falho'}</span><span>${(slot.bytes/1024).toFixed(1)} KiB</span></div>`).join('');
    return `<div class="standings-list rich-standings pwa-status-list">${rows.map(([a,b])=>`<div class="row"><span>•</span><span>${a}</span><span>${b}</span><span></span></div>`).join('')}</div><h4>Backups rotativos</h4><div class="standings-list rich-standings pwa-status-list">${backupRows}</div>`;
  }
  function saveVaultMiniHTML(){
    const info = persistence?.inspect?.();
    if(!info) return '<p>Indisponível.</p>';
    return `<p><b>${info.valid !== false ? '✓ Válido' : '⚠ Revisar'}</b></p><p>${info.format} • schema ${info.schema}</p><p>${info.backups || 0} backup(s) • ${info.journalCount || 0} evento(s)</p>`;
  }
  function verifySaveVault(){
    const info = persistence?.inspect?.();
    state.saveVault = {...(state.saveVault || {}), lastVerifiedAt:new Date().toISOString(), lastValid:info?.valid !== false, backups:info?.backups || 0, journalCount:info?.journalCount || 0};
    addInboxMessage('save','Sistema','Cofre verificado',`Save ativo ${info?.valid !== false ? 'válido' : 'com pendência'} • ${info?.backups || 0} backup(s) válidos.`,{});
    saveState(); renderTab('saves'); updateHud();
  }
  function recoverSaveVault(){
    const result = persistence?.recover?.();
    if(!result?.ok){ alert('Não foi encontrado backup válido para recuperação.'); return; }
    state = result.state || loadState() || createInitialState();
    ensureCareerSystems();
    addInboxMessage('save','Sistema','Recuperação concluída',`O cofre restaurou a carreira a partir de ${result.source || 'backup válido'}.`,{});
    saveState(); updateHud(); renderTab('saves');
  }

  function pwaStatusHTML(){
    const sw = 'serviceWorker' in navigator;
    const standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    const storage = (() => { try { localStorage.setItem('__f1m_test','1'); localStorage.removeItem('__f1m_test'); return true; } catch(e){ return false; } })();
    const manifest = document.querySelector('link[rel="manifest"]') ? true : false;
    const rows = [
      ['Manifest PWA', manifest ? 'OK' : 'pendente'],
      ['Service Worker', sw ? 'suportado' : 'não suportado'],
      ['Modo instalado', standalone ? 'sim' : 'navegador'],
      ['LocalStorage', storage ? 'OK' : 'bloqueado'],
      ['Build', DATA.build?.label || 'sem build']
    ];
    return `<div class="standings-list rich-standings pwa-status-list">${rows.map(([a,b])=>`<div class="row"><span>•</span><span>${a}</span><span>${b}</span><span></span></div>`).join('')}</div><p class="muted-small">Para APK: usar esta pasta como app web estático em WebView/Capacitor. Assets pesados permanecem no GitHub nos caminhos oficiais.</p>`;
  }
  function clearPwaCache(){
    if('serviceWorker' in navigator && navigator.serviceWorker.controller){
      navigator.serviceWorker.controller.postMessage({type:'CLEAR_CACHE'});
    }
    if(window.caches){ caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).then(()=>addInboxMessage('system','Sistema','Cache limpo','O cache PWA foi limpo. Recarregue a página se algum arquivo antigo continuar aparecendo.',{})).finally(()=>{ saveState(); renderTab('saves'); }); }
    else { addInboxMessage('system','Sistema','Cache não disponível','Este navegador não expôs a API de cache, mas o jogo continua funcionando com localStorage.',{}); saveState(); renderTab('saves'); }
  }
  function exportDiagnostics(){
    const report = {
      build: DATA.build,
      buildConsistency: CORE.build?.consistency?.(DATA.build) || null,
      systemDiagnostics: state.quality?.systemDiagnostics || null,
      performanceReport: state.quality?.performanceReport || null,
      runtimeErrors: runtimeGuard?.list?.() || [],
      userAgent: navigator.userAgent,
      standalone: window.matchMedia && window.matchMedia('(display-mode: standalone)').matches,
      serviceWorker: 'serviceWorker' in navigator,
      hasProfile: !!state.profile,
      currentTeam: state.currentTeam,
      currentSeries: state.currentSeries,
      seasonYear: state.seasonYear,
      completedRaces: state.completedRaces,
      money: state.money,
      reputation: state.reputation,
      assets: ['assets/teams/logos/','assets/teams/logos/f2/','assets/drivers/current_grid/','assets/drivers/avatars/f2/','assets/flags/all/']
    };
    const blob = new Blob([JSON.stringify(report,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob); const a=document.createElement('a');
    a.href=url; a.download=`f1-manager-diagnostico-${DATA.build?.build_code || 'dev'}.json`.replace(/[^a-z0-9._-]+/gi,'-'); document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    addInboxMessage('system','Sistema','Diagnóstico exportado','Foi gerado um JSON com build, navegador, save e caminhos críticos.',{});
    saveState(); renderTab('saves');
  }
  function resetActiveSave(){
    const ok = confirm('Resetar somente o save atual? Os slots 1, 2 e 3 não serão apagados.');
    if(!ok) return;
    if(persistence) persistence.removeAll(); else localStorage.removeItem(ACTIVE_SAVE_KEY);
    state = createInitialState();
    addInboxMessage('system','Sistema','Save atual resetado','O save ativo foi reiniciado. Slots manuais continuam preservados.',{});
    saveState(); updateHud(); showScreen('home');
  }

  function slotKey(n){ return `f1_manager_career_2026_slot_${n}`; }
  function saveSlotCard(n){
    let meta = null;
    try { const raw = localStorage.getItem(slotKey(n)); if(raw){ const s=JSON.parse(raw); meta={ manager:s.profile?.name, team:teamById(s.currentTeam)?.name, series:s.currentSeries, year:s.seasonYear, rep:s.reputation, saved:s.savedAt }; } } catch(e){}
    return `<article class="dash-card glass-panel save-card"><h3>Slot ${n}</h3>${meta ? `<p><b>${meta.manager || 'Gestor'}</b> • ${meta.team || 'Equipe'} • ${meta.series || 'F2'}</p><p>Temporada ${meta.year || 2026} • REP ${Math.round(meta.rep||0)}</p><p class="muted-small">${meta.saved ? new Date(meta.saved).toLocaleString('pt-BR') : 'salvo'}</p>` : '<p>Slot vazio.</p>'}<button class="primary" data-action="saveSlot" data-slot="${n}">SALVAR AQUI</button><button class="secondary" data-action="loadSlot" data-slot="${n}">CARREGAR</button></article>`;
  }
  function saveToSlot(n){
    const snapshot = {...state, savedAt:new Date().toISOString(), build:DATA.build?.version||'0.9.25'};
    localStorage.setItem(slotKey(n), JSON.stringify(snapshot));
    addInboxMessage('save','Sistema','Carreira salva',`A carreira foi salva no Slot ${n}.`,{});
    saveState(); renderTab('saves');
  }
  function loadFromSlot(n){
    const raw = localStorage.getItem(slotKey(n));
    if(!raw) return alert('Este slot ainda está vazio.');
    try {
      state = JSON.parse(raw);
      ensureCareerSystems();
      saveState();
      updateHud();
      addInboxMessage('save','Sistema','Carreira carregada',`O Slot ${n} foi carregado com sucesso.`,{});
      renderLobby();
    } catch(e){ alert('Não foi possível carregar este slot.'); }
  }
  function exportCurrentSave(){
    const portable = persistence?.createPortableExport ? persistence.createPortableExport(state, { reason:'manual-export' }) : { format:'F1M_LEGACY_EXPORT', exportedAt:new Date().toISOString(), build:DATA.build, payload:{...state} };
    const payload = JSON.stringify(portable, null, 2);
    const blob = new Blob([payload], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `f1-manager-save-vault-${DATA.build?.build_code || 'dev'}-${state.profile?.name || 'gestor'}-${state.seasonYear || 2026}.json`.replace(/[^a-z0-9._-]+/gi,'-');
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    addInboxMessage('save','Sistema','Pacote seguro exportado','Um pacote portátil com checksum foi gerado para backup/importação futura.',{});
    saveState(); renderTab('saves'); updateHud();
  }
  function importSaveFromPrompt(){
    const raw = prompt('Cole aqui o JSON exportado do save:');
    if(!raw) return;
    try {
      let imported = JSON.parse(raw);
      if(persistence?.importPortable && imported?.format === persistence.exportFormat){
        const result = persistence.importPortable(imported);
        if(!result.ok) throw new Error(result.reason || 'import-failed');
        state = result.state;
      } else {
        if(!imported || typeof imported !== 'object') throw new Error('invalid');
        state = imported.payload && imported.format === 'F1M_LEGACY_EXPORT' ? imported.payload : imported;
      }
      ensureCareerSystems();
      addInboxMessage('save','Sistema','Save importado','A carreira importada foi validada, carregada e salva no cofre ativo.',{});
      saveState(); updateHud(); renderLobby();
    } catch(e){ alert('JSON inválido. Confira se o conteúdo exportado foi colado completo.'); }
  }
  function coachmarkHTML(){
    const done = state.tutorial?.completed;
    const items = [
      ['1. Agenda', 'Avance GP a GP, leia e-mails e acompanhe reuniões da diretoria.'],
      ['2. Dinheiro', 'Patrocinadores, premiação e salários definem se a equipe cresce ou quebra.'],
      ['3. Carro', 'Motor, aero, chassi, pneus e confiabilidade mudam classificação e corrida.'],
      ['4. Staff', 'Designers, mecânicos, estrategistas, engenheiros, olheiros e pit crew afetam decisões reais.'],
      ['5. Mercado', 'Pilotos melhores custam mais, podem recusar e exigem reputação.'],
      ['6. Carreira', 'Cumpra metas na F2 para receber convites até chegar às grandes da F1.']
    ];
    return `<p>Status: <b>${done ? 'concluído' : 'pendente'}</b></p><div class="coach-list">${items.map(([h,t])=>`<div><b>${h}</b><span>${t}</span></div>`).join('')}</div>`;
  }

  function difficultyLabel(){
    const d = state.quality?.difficulty || (state.mode === 'sandbox' ? 'sandbox' : 'normal');
    return ({easy:'Acessível',normal:'Realista',hard:'Pro Manager',sandbox:'Sandbox'})[d] || 'Realista';
  }
  function difficultyButtons(){
    const cur = state.quality?.difficulty || 'normal';
    const rows = [
      ['easy','ACESSÍVEL','custos menores e carreira mais tolerante'],
      ['normal','REALISTA','balanceamento recomendado para carreira'],
      ['hard','PRO MANAGER','custos altos, pressão maior e rivais agressivos'],
      ['sandbox','SANDBOX','liberdade máxima para testar sistemas']
    ];
    return `<div class="difficulty-grid">${rows.map(([id,label,desc])=>`<button class="secondary ${cur===id?'selected':''}" data-action="setDifficulty" data-difficulty="${id}"><b>${label}</b><span>${desc}</span></button>`).join('')}</div>`;
  }
  function setDifficulty(id){
    ensureCareerSystems();
    state.quality.difficulty = id || 'normal';
    const pressure = {easy:-4, normal:0, hard:8, sandbox:-10}[state.quality.difficulty] || 0;
    state.boardPressure = clamp((state.boardPressure||45) + pressure, 0, 100);
    addInboxMessage('qa','Direção de Prova','Dificuldade atualizada',`O modo de dificuldade foi ajustado para ${difficultyLabel()}. Isso muda o rigor de economia, pressão, evolução rival e recompensa de carreira.`,{});
    saveState(); renderTab('qa'); updateHud();
  }
  function betaReadinessScore(){
    const checks = qualityChecks();
    const score = Math.round(checks.filter(c=>c.ok).length / checks.length * 100);
    return score;
  }
  function qualityChecks(){
    ensureCareerSystems();
    const hasProfile = !!state.profile;
    const hasTeam = !!state.currentTeam && !!teamById(state.currentTeam);
    const hasRoster = driversForTeam(state.currentTeam).length >= 2;
    const hasStandings = !!currentStandings() && Object.keys(currentStandings()).length > 0;
    const expectedCalendar = (state.currentSeries === 'F1' ? 22 : 14);
    const hasCalendar = Array.isArray(activeCalendar()) && activeCalendar().length >= expectedCalendar;
    const hasEconomy = Number.isFinite(Number(state.money));
    const hasInbox = Array.isArray(state.inbox);
    const hasStrategy = !!state.raceStrategy && !!state.weekend;
    const hasAssetsMap = !!DATA.assetPaths && !!teamById(state.currentTeam)?.logo;
    const hasSaves = !!window.localStorage;
    const canRace = hasTeam && hasRoster && hasCalendar && hasStrategy;
    return [
      {name:'Perfil do gestor criado', ok:hasProfile, fix:'criar carreira'},
      {name:'Equipe atual válida', ok:hasTeam, fix:'escolher equipe'},
      {name:'Roster com 2 pilotos', ok:hasRoster, fix:'revisar mercado/roster'},
      {name:'Calendário completo', ok:hasCalendar, fix:'data/calendar'},
      {name:'Classificação ativa', ok:hasStandings, fix:'standings'},
      {name:'Economia numérica', ok:hasEconomy, fix:'money'},
      {name:'Central de e-mails ativa', ok:hasInbox, fix:'inbox'},
      {name:'Estratégia e treino ativos', ok:hasStrategy, fix:'raceStrategy/weekend'},
      {name:'Caminhos de assets preservados', ok:hasAssetsMap, fix:'ASSET_IMAGE_PATHS_CURRENT'},
      {name:'Save local disponível', ok:hasSaves, fix:'localStorage'},
      {name:'Fluxo de corrida disponível', ok:canRace, fix:'classificação/corrida'}
    ];
  }
  function runQualityChecklist(){
    ensureCareerSystems();
    const checks = qualityChecks();
    const score = Math.round(checks.filter(c=>c.ok).length / checks.length * 100);
    state.quality.checks = checks;
    state.quality.betaScore = score;
    state.quality.lastCheck = new Date().toISOString();
    const title = score >= 90 ? 'Beta pronto para teste' : score >= 75 ? 'Beta quase pronto' : 'Atenção: beta precisa de ajustes';
    addInboxMessage('qa','Controle de Qualidade',title,`Checklist executado com score ${score}/100. ${score>=90?'Fluxo principal liberado para teste de temporada completa.':'Revise os itens pendentes antes de chamar a build de beta.'}`,{score});
    saveState(); renderTab('qa'); updateHud();
  }

  function closedBetaChecks(){
    ensureCareerSystems();
    const team = teamById(state.currentTeam);
    const drivers = driversForTeam(state.currentTeam);
    const qa = betaReadinessScore();
    const dl = dataLockScore();
    const hasPwa = !!document.querySelector('link[rel="manifest"]') && ('serviceWorker' in navigator);
    const expectedCalendar = (state.currentSeries === 'F1' ? 22 : 14);
    const calendarOk = Array.isArray(activeCalendar()) && activeCalendar().length >= expectedCalendar;
    const standingsOk = !!currentStandings() && Object.keys(currentStandings()).length >= 20;
    const economyOk = Number.isFinite(Number(state.money)) && !!state.sponsor !== undefined;
    const careerOk = !!state.contract && !!state.careerHistory && Array.isArray(state.inbox);
    const raceOk = !!state.raceStrategy && !!state.weekend && typeof setupRace === 'function' && typeof finishRace === 'function';
    const marketOk = drivers.length >= 2 && DATA.f1Drivers2026.length >= 22 && DATA.f2Drivers.length >= 22;
    const assetsOk = !!team?.logo && DATA.assetPaths && !!DATA.assetPaths.menu;
    return [
      {name:'QA geral acima de 90', ok:qa >= 90, fix:'rodar checklist beta e corrigir pendências'},
      {name:'Data Lock 100/100', ok:dl >= 100, fix:'revisar equipes, pilotos, calendário e assets'},
      {name:'Calendário completo', ok:calendarOk, fix:'revisar activeCalendar()'},
      {name:'Standings ativos', ok:standingsOk, fix:'recriar classificações da categoria'},
      {name:'Economia válida', ok:economyOk, fix:'revisar dinheiro, patrocinador e custos'},
      {name:'Carreira e e-mails ativos', ok:careerOk, fix:'ensureCareerSystems/inbox/contrato'},
      {name:'Corrida e estratégia disponíveis', ok:raceOk, fix:'setupRace/weekend/raceStrategy'},
      {name:'Mercado e roster válidos', ok:marketOk, fix:'revisar pilotos e equipes'},
      {name:'Assets críticos mapeados', ok:assetsOk, fix:'revisar ASSET_IMAGE_PATHS_CURRENT'},
      {name:'PWA preparado', ok:hasPwa, fix:'manifest/service worker'},
      {name:'Save local ativo', ok:!!window.localStorage, fix:'localStorage'},
      {name:'Equipe atual carregada', ok:!!team && drivers.length >= 2, fix:'selecionar equipe válida'}
    ];
  }
  function closedBetaScore(){
    const checks = closedBetaChecks();
    return Math.round(checks.filter(c=>c.ok).length / checks.length * 100);
  }
  function closedBetaPanel(){
    const checks = state.quality?.closedBetaChecks?.length ? state.quality.closedBetaChecks : closedBetaChecks();
    const score = state.quality?.closedBetaScore || closedBetaScore();
    const status = score >= 92 ? 'Candidato a Beta Fechado' : score >= 80 ? 'Quase Beta Fechado' : 'Precisa estabilizar';
    return `<p>Status: <b>${status}</b> • ${score}/100</p><div class="progress"><i style="width:${score}%"></i></div><div class="standings-list rich-standings qa-list">${checks.map(c=>`<div class="row rich-row ${c.ok?'qa-ok':'qa-warn'}"><span>${c.ok?'✓':'!'}</span><span><b>${c.name}</b><small>${c.ok?'OK':'Ação: '+c.fix}</small></span><span>${c.ok?'Liberado':'Pendente'}</span><span>${c.ok?'Beta':'Ajustar'}</span></div>`).join('')}</div>`;
  }
  function runClosedBetaAudit(){
    ensureCareerSystems();
    runQualityChecklist();
    const checks = closedBetaChecks();
    const score = Math.round(checks.filter(c=>c.ok).length / checks.length * 100);
    state.quality.closedBetaChecks = checks;
    state.quality.closedBetaScore = score;
    state.quality.closedBetaLastCheck = new Date().toISOString();
    const title = score >= 92 ? 'Build candidata a Beta Fechado' : score >= 80 ? 'Beta Fechado quase pronto' : 'Beta Fechado bloqueado';
    addInboxMessage('qa','Controle de Qualidade',title,`Auditoria de beta fechado concluída com score ${score}/100. ${score>=92?'A build pode ser testada como candidata final antes da v1.0.':'Revise os itens pendentes antes da v1.0.'}`,{score});
    saveState(); renderTab('qa'); updateHud();
  }

  function qaChecklistRows(){
    const checks = state.quality?.checks?.length ? state.quality.checks : qualityChecks();
    return `<div class="standings-list rich-standings qa-list">${checks.map(c=>`<div class="row rich-row ${c.ok?'qa-ok':'qa-warn'}"><span>${c.ok?'✓':'!'}</span><span><b>${c.name}</b><small>${c.ok?'OK':'Verificar: '+c.fix}</small></span><span>${c.ok?'Pronto':'Pendente'}</span><span>${c.ok?'Liberado':'Ajustar'}</span></div>`).join('')}</div>`;
  }
  function betaScorePanel(){
    const score = state.quality?.betaScore || betaReadinessScore();
    const label = score >= 90 ? 'Beta jogável' : score >= 75 ? 'Quase beta' : 'Em desenvolvimento';
    return `<p><b>${label}</b></p><div class="progress"><i style="width:${score}%"></i></div><p>${score}/100</p><p class="muted-small">Use o checklist após cada build para evitar regressões em lobby, corrida, calendário, mercado e save.</p>`;
  }
  function manualTestPlan(){
    const steps = ['Criar carreira realista na F2','Abrir lobby e navegar por todas as abas','Assinar patrocinador e contratar staff','Simular treino livre e classificação','Correr/encerrar corrida 3D','Validar resultado, dinheiro e reputação','Avançar agenda até novo GP','Contratar piloto e verificar roster','Receber e ler e-mails/propostas','Salvar em slot e recarregar'];
    return `<div class="coach-list test-plan">${steps.map((s,i)=>`<div><b>${String(i+1).padStart(2,'0')}</b><span>${s}</span></div>`).join('')}</div>`;
  }

  function driverValue(d){
    const ov = Number(d.overall||70), pot = Number(d.potential||70), age = Number(d.age||22);
    const isF1 = DATA.f1Drivers2026.some(x=>x.short===d.short);
    const seriesMul = isF1 ? 4200 : 460;
    const ageFactor = age <= 22 ? 1.18 : age >= 35 ? .82 : 1;
    const scoutDiscount = Math.max(.82, 1 - ((state.staff?.scouts||1)-1)*.025);
    const marketInflation = balanceTuning().cost;
    return Math.round(((ov*ov*seriesMul) + (pot*seriesMul*42)) * ageFactor * scoutDiscount * marketInflation);
  }
  function driverSalary(d){ return Math.round(driverValue(d) * 0.035); }
  function driverBuyout(d){
    const base = driverValue(d);
    const current = driverContract(d.short);
    const years = Math.max(1, current.yearsLeft || 1);
    const topTeam = (teamById(driverCurrentTeamId(d.short)||d.team)?.reputation || 50) >= 85;
    return Math.round(base * (0.28 + years * 0.18) * (topTeam ? 1.18 : 1));
  }
  function driverContract(short){
    state.driverContracts = state.driverContracts || {};
    if(!state.driverContracts[short]){
      const d = driverByShort(short) || {};
      const isF1 = DATA.f1Drivers2026.some(x=>x.short===short);
      state.driverContracts[short] = { yearsLeft: isF1 ? 2 : 1, salary: driverSalary(d), buyout: Math.round(driverValue(d)*0.45), morale: 62 };
    }
    return state.driverContracts[short];
  }
  function driverOverallText(d){ return `OVR ${d.overall||70} • POT ${d.potential||70} • Valor ${money(driverValue(d))}`; }
  function driverInterestScore(d, years=1, salaryMul=1){
    const playerTeam = teamById(state.currentTeam);
    const currentTeam = teamById(driverCurrentTeamId(d.short)||d.team);
    const repGap = (playerTeam?.reputation||50) - (currentTeam?.reputation||50);
    const categoryBonus = state.currentSeries === 'F1' ? 14 : -3;
    const scoutBonus = ((state.staff?.scouts||1)-1) * 2.2;
    const moneyBonus = (salaryMul-1) * 34;
    const securityBonus = (years-1) * 4;
    const ambitionPenalty = (d.overall||70) >= 88 && (playerTeam?.reputation||50) < 82 ? -16 : 0;
    const roleBonus = driversForTeam(state.currentTeam).some(x => (x.overall||70) < (d.overall||70)) ? 6 : -2;
    const difficultyPenalty = difficultyKey()==='hard' ? -7 : difficultyKey()==='easy' ? 5 : difficultyKey()==='sandbox' ? 12 : 0;
    return Math.max(8, Math.min(96, 48 + repGap*.75 + categoryBonus + scoutBonus + moneyBonus + securityBonus + roleBonus + ambitionPenalty + difficultyPenalty));
  }
  function driverAccepts(d, years, salaryMul){
    const chance = driverInterestScore(d, years, salaryMul);
    return Math.random()*100 <= chance;
  }
  function driverContractInfo(d){
    const c = driverContract(d.short);
    return `${c.yearsLeft} ano(s) • Salário ${money(c.salary)} • Multa ${money(driverBuyout(d))}`;
  }
  function driverMarketCards(){
    const current = new Set(driversForTeam(state.currentTeam).map(d=>d.short));
    return allDriversForSeries(state.currentSeries).filter(d=>!current.has(d.short)).sort((a,b)=>driverValue(b)-driverValue(a)).map(d=>{
      const teamId = driverCurrentTeamId(d.short) || d.team;
      const team = teamById(teamId) || teamById(d.team);
      const salary = driverSalary(d);
      const buyout = driverBuyout(d);
      const package1 = Math.round(buyout + salary*1.05);
      const package2 = Math.round(buyout + salary*2*1.16);
      const chance1 = Math.round(driverInterestScore(d,1,1.05));
      const chance2 = Math.round(driverInterestScore(d,2,1.16));
      const affordable1 = (state.money||0) >= package1;
      const affordable2 = (state.money||0) >= package2;
      return `<article class="dash-card glass-panel market-driver-card ${(affordable1||affordable2)?'':'locked'}"><div class="driver-head"><div class="portrait-wrap">${d.portrait?`<img class="driver-portrait" data-asset-src="${d.portrait}" alt="${d.name}" />`:''}<span class="fallback-badge driver-fallback" style="display:${d.portrait?'none':'flex'}">${initials(d.name)}</span></div><div class="driver-meta"><h3>${d.short}</h3><p>${d.name}</p><div class="meta-line"><span class="team-chip">${teamLogoHTML(team)} ${team?team.name:''}</span><span class="flag-chip"><img data-asset-src="${flagPath(d.flag)}" alt="${d.flag}" /><b>${d.flag}</b></span></div></div></div><p>${driverOverallText(d)}</p><div class="progress"><i style="width:${Math.min(100,d.overall||70)}%"></i></div><p>Vel ${d.speed} • Cons ${d.consistency} • Chuva ${d.rain}</p><p><b>Contrato atual:</b> ${driverContractInfo(d)}</p><p><b>Interesse:</b> 1 ano ${chance1}% • 2 anos ${chance2}%</p><div class="contract-actions"><button class="${affordable1?'primary':'secondary'}" data-action="offerDriver" data-driver="${d.short}" data-years="1" data-salary="1.05" ${affordable1?'':'disabled'}>1 ANO ${money(package1)}</button><button class="${affordable2?'primary':'secondary'}" data-action="offerDriver" data-driver="${d.short}" data-years="2" data-salary="1.16" ${affordable2?'':'disabled'}>2 ANOS ${money(package2)}</button></div></article>`;
    }).join('');
  }
  function signDriver(short){ offerDriverContract(short, 1, 1.05); }
  function offerDriverContract(short, years=1, salaryMul=1.05){
    ensureRosters(); state.driverContracts = state.driverContracts || {};
    const d = driverByShort(short); if(!d) return;
    const salary = Math.round(driverSalary(d) * salaryMul);
    const buyout = driverBuyout(d);
    const totalCost = Math.round(buyout + salary * years);
    if((state.money||0) < totalCost) return alert('Orçamento insuficiente para esta proposta.');
    if(!driverAccepts(d, years, salaryMul)){
      const chance = Math.round(driverInterestScore(d,years,salaryMul));
      addInboxMessage('market','Agente do Piloto',`Proposta recusada: ${d.name}`,`${d.name} recusou a proposta de ${years} ano(s). Interesse estimado era ${chance}%. Tente melhorar reputação, scouting ou pacote salarial.`,{driver:short});
      state.money -= Math.round(totalCost * 0.015);
      saveState(); renderTab('driver-market'); updateHud(); return;
    }
    const oldTeamId = driverCurrentTeamId(short) || d.team;
    for(const team of Object.keys(state.rosters)){ state.rosters[team] = (state.rosters[team]||[]).filter(s=>s!==short); }
    const current = state.rosters[state.currentTeam] || driversForTeam(state.currentTeam).map(x=>x.short);
    const replaced = current.length >= 2 ? current.pop() : null;
    current.push(short); state.rosters[state.currentTeam] = current;
    if(replaced){ state.rosters[oldTeamId] = state.rosters[oldTeamId] || []; if(!state.rosters[oldTeamId].includes(replaced)) state.rosters[oldTeamId].push(replaced); }
    state.money -= totalCost;
    state.driverContracts[short] = { yearsLeft: years, salary, buyout: Math.round(buyout*.75), morale: 70 };
    if(replaced){ const rd=driverByShort(replaced); state.driverContracts[replaced] = state.driverContracts[replaced] || { yearsLeft:1, salary:rd?driverSalary(rd):250000, buyout:0, morale:55 }; }
    addInboxMessage('market','Departamento Esportivo',`Contrato assinado: ${d.name}`,`${d.name} aceitou contrato de ${years} ano(s) com ${teamById(state.currentTeam).name}. Custo total: ${money(totalCost)}. Salário: ${money(salary)}. ${replaced?`Piloto substituído: ${replaced}.`:''}`,{driver:short});
    saveState(); renderTab('driver-market'); updateHud();
  }
  function driverStandingsRows(){
    ensureStandings();
    const st = Object.values(currentStandings()).sort((a,b)=>(b.points||0)-(a.points||0) || (b.wins||0)-(a.wins||0));
    return st.map((r,i)=>{ const d=driverByShort(r.driver)||{short:r.driver,name:r.driver}; const t=teamById(driverCurrentTeamId(r.driver)||r.team); return `<div class="row rich-row"><span class="pos-cell">${i+1}</span><span class="driver-cell">${driverAvatarChip(d)}<span class="driver-text"><b>${d.short}</b><small>${d.name}</small></span></span><span class="team-cell">${teamLogoHTML(t)}<span>${t?t.name:''}</span></span><span class="time-cell">${r.points||0} pts</span></div>`; }).join('');
  }
  function teamStandingsRows(){
    ensureStandings();
    const points = {};
    Object.values(currentStandings()).forEach(r=>{ const tid=driverCurrentTeamId(r.driver)||r.team; points[tid]=(points[tid]||0)+(r.points||0); });
    const teams = (state.currentSeries==='F1'?DATA.f1Teams2026:DATA.f2Teams).map(t=>({team:t,points:points[t.id]||0})).sort((a,b)=>b.points-a.points);
    return teams.map((r,i)=>`<div class="row rich-row"><span class="pos-cell">${i+1}</span><span class="team-cell big-team-cell">${teamLogoHTML(r.team)}<span><b>${r.team.name}</b><small>${r.team.objective||''}</small></span></span><span class="time-cell">${r.points} pts</span><span class="time-cell">REP ${r.team.reputation||0}</span></div>`).join('');
  }


  function seasonHealthText(){
    const stats = state.seasonStats || {};
    const best = stats.bestFinish ? `melhor P${stats.bestFinish}` : 'sem resultado ainda';
    const budgetRisk = (state.money||0) < 0 ? 'crítico' : (state.money||0) < 1000000 ? 'apertado' : 'saudável';
    return `REP ${Math.round(state.reputation||0)} • ${best} • ${stats.wins||0} vitórias • caixa ${budgetRisk}.`;
  }

  function teamSeasonPoints(teamId){
    const st = currentStandings();
    return Object.values(st).reduce((sum,r)=> (driverCurrentTeamId(r.driver)||r.team) === teamId ? sum + (r.points||0) : sum, 0);
  }

  function raceFinanceReport(playerResults, bestPlayer){
    const team = teamById(state.currentTeam) || {};
    const drivers = driversForTeam(state.currentTeam);
    const teamPoints = playerResults.reduce((sum,r)=>sum+(r.points||0),0);
    const tune = balanceTuning();
    const baseParticipation = Math.round((state.currentSeries === 'F1' ? 650000 : 160000) * tune.income);
    const prize = Math.round((Math.max(0,14-(bestPlayer?.pos||14)) * (state.currentSeries === 'F1' ? 90000 : 26000) + teamPoints * (state.currentSeries === 'F1' ? 55000 : 18000)) * tune.prize);
    const sponsorBonus = state.sponsor ? Math.round(((state.sponsor.raceBonus || 0) + sponsorGoalBonus(playerResults,bestPlayer)) * tune.sponsor) : 0;
    const salaryCost = Math.round(drivers.reduce((sum,d)=>sum + Math.round((d.salary||250000) / activeCalendar().length), 0) * tune.cost);
    const staffCost = Math.round(Object.values(state.staff||{}).reduce((sum,n)=>sum + Number(n||0), 0) * (state.currentSeries === 'F1' ? 18000 : 6500) * tune.cost);
    const operations = Math.round((state.currentSeries === 'F1' ? 420000 : 95000) * tune.cost);
    const damage = Math.round(playerResults.reduce((sum,r)=>sum + Math.max(0,100-(r.condition||100))*2200 + Math.max(0,40-(r.tyre||40))*900,0) * tune.damage);
    const income = Math.round(baseParticipation + prize + sponsorBonus);
    const expenses = Math.round(salaryCost + staffCost + operations + damage);
    const net = income - expenses;
    return { track:(activeCalendar()[state.roundIndex]||{}).name || 'GP', income, expenses, net, baseParticipation, prize:Math.round(prize), sponsorBonus:Math.round(sponsorBonus), salaryCost:Math.round(salaryCost), staffCost:Math.round(staffCost), operations:Math.round(operations), damage:Math.round(damage), teamPoints, bestPos:bestPlayer?.pos||null, team:team.id };
  }

  function sponsorGoalBonus(playerResults,bestPlayer){
    if(!state.sponsor) return 0;
    const teamPoints = playerResults.reduce((sum,r)=>sum+(r.points||0),0);
    const goal = String(state.sponsor.goal||'').toLowerCase();
    if(goal.includes('pódio') || goal.includes('podio')) return bestPlayer && bestPlayer.pos <= 3 ? Math.round((state.sponsor.raceBonus||0)*1.2) : 0;
    if(goal.includes('pontos') || goal.includes('pontuar')) return teamPoints > 0 ? Math.round((state.sponsor.raceBonus||0)*0.9) : 0;
    if(goal.includes('top 10')) return bestPlayer && bestPlayer.pos <= 10 ? Math.round((state.sponsor.raceBonus||0)*0.85) : 0;
    return Math.round((state.sponsor.raceBonus||0)*0.5);
  }

  function recordFinance(report){
    state.financeLog = Array.isArray(state.financeLog) ? state.financeLog : [];
    state.financeLog.unshift({ ...report, race:state.completedRaces, year:state.seasonYear, date:new Date().toISOString() });
    state.financeLog = state.financeLog.slice(0,30);
    state.lastRaceReport = report;
  }

  function reputationDelta(bestPlayer, teamPoints, financeNet){
    if(!bestPlayer) return -1;
    const tune = balanceTuning();
    const team = teamById(state.currentTeam);
    const expected = objectiveExpectedBest(team);
    let delta = Math.max(-3, 11 - bestPlayer.pos) * .55 + (teamPoints||0) * .08;
    if(bestPlayer.pos <= expected) delta += Math.min(3.2, (expected - bestPlayer.pos + 1) * .55);
    else delta -= Math.min(3.8, (bestPlayer.pos - expected) * .28);
    if(bestPlayer.pos === 1) delta += 2.0;
    if(bestPlayer.pos <= 3) delta += 1.0;
    if(financeNet < 0) delta -= .9;
    if((state.money||0) < 0) delta -= 1.4;
    delta *= delta >= 0 ? tune.repGain : tune.repLoss;
    return pct(delta);
  }

  function seasonProgressText(){
    const total = activeCalendar().length;
    const done = Math.min(state.completedRaces||0, total);
    const left = Math.max(0, total-done);
    return `${done}/${total} corridas concluídas • ${left ? left + ' eventos restantes' : 'temporada concluída'}`;
  }

  function agendaItems(){
    const idx = Math.min(state.completedRaces||0, activeCalendar().length);
    const items = [];
    const next = activeCalendar()[idx];
    if(next) items.push({ type:'race', index:idx, race:next, title:next.name, label:`Próximo GP: ${next.name}`, detail:`${next.country ? 'Bandeira ' + next.country + ' • ' : ''}${next.weather || 'clima variável'} • ${next.laps || 22} voltas`, action:'goQualifying' });
    if((state.completedRaces||0) >= 3) items.push({ type:'board', index:idx, title:'Reunião da diretoria', label:'Avaliação de metas e reputação', detail:contractStatusText(), action:'inbox' });
    const offers = generateCareerOffers();
    if(offers.length) items.push({ type:'offer', index:idx, title:'Janela de contratos', label:`${offers.length} proposta(s) monitoradas`, detail:'Equipe interessadas acompanham sua reputação.', action:'offers' });
    if(idx >= activeCalendar().length) items.push({ type:'season_end', index:idx, title:'Fim de temporada', label:'Revisão anual disponível', detail:'Feche o ano para receber bônus, convites finais e iniciar a próxima temporada.', action:'endSeason' });
    return items;
  }

  function agendaCard(item){
    const actionAttr = (item.action === 'endSeason' || item.action === 'goQualifying') ? `data-action="${item.action}"` : `data-tab="${item.action}"`;
    const race = item.race || null;
    const flag = race && race.country ? `<img class="agenda-flag" data-asset-src="${flagPath(race.country)}" alt="${race.country}" />` : `<span class="agenda-emoji">${item.type==='offer'?'🤝':item.type==='board'?'📊':'🏁'}</span>`;
    return `<article class="dash-card glass-panel agenda-card"><div class="agenda-head">${flag}<div><h3>${item.title}</h3><p><b>${item.label}</b></p></div></div><p>${item.detail}</p><button class="secondary" ${actionAttr}>${item.type==='race'?'PREPARAR':'ABRIR'}</button></article>`;
  }

  function mailCard(m){
    const unread = !m.read;
    return `<article class="dash-card glass-panel mail-card ${unread?'unread':''}"><div class="mail-type">${mailIcon(m.type)} ${m.from || 'Equipe'}</div><h3>${m.title}</h3><p>${m.body}</p><small>Temporada ${m.year || state.seasonYear || 2026} • Corrida ${m.race || 0}</small>${unread ? `<button class="secondary" data-action="markMailRead" data-mail="${m.id}">MARCAR COMO LIDO</button>` : ''}</article>`;
  }

  function mailIcon(type){ return ({welcome:'🏁', calendar:'📅', offer:'🤝', board:'📊', season:'🏆', finance:'💰', media:'📰'})[type] || '✉'; }

  function notifyOffersIfUnlocked(){
    const offers = generateCareerOffers();
    if(!offers.length) return;
    const known = new Set((state.inbox||[]).filter(m=>m.type==='offer').map(m=>m.meta && m.meta.team));
    offers.slice(0,3).forEach(o => {
      if(known.has(o.team.id)) return;
      addInboxMessage('offer','Mercado de Contratos',`Interesse: ${o.team.name}`,`${o.team.name} está monitorando seu trabalho. Nível: ${o.label}. Reputação exigida: ${o.required}.`,{team:o.team.id, required:o.required});
    });
  }


  function sortedStandings(series){
    ensureStandings();
    const st = state.standings[series] || createStandingsForSeries(series);
    return Object.values(st).sort((a,b)=>(b.points||0)-(a.points||0) || (b.wins||0)-(a.wins||0) || ((a.best||99)-(b.best||99)));
  }
  function teamPointsForSeries(series){
    const points = {};
    sortedStandings(series).forEach(r => { const tid = driverCurrentTeamId(r.driver) || r.team; points[tid] = (points[tid]||0) + (r.points||0); });
    return Object.entries(points).sort((a,b)=>b[1]-a[1]);
  }
  function seasonChampion(series){
    const dRow = sortedStandings(series)[0];
    const tRow = teamPointsForSeries(series)[0];
    return { driver:dRow ? dRow.driver : null, team:tRow ? tRow[0] : null, points:dRow ? dRow.points||0 : 0, teamPoints:tRow ? tRow[1] : 0 };
  }
  function archiveCurrentSeason(score, bonus){
    const f2 = seasonChampion('F2');
    const f1 = seasonChampion('F1');
    const team = teamById(state.currentTeam);
    const archive = {
      year: state.seasonYear || 2026,
      seasonNumber: state.seasonNumber || 1,
      team: team ? team.name : 'Sem equipe',
      teamId: state.currentTeam,
      series: state.currentSeries,
      reputation: Math.round(state.reputation||0),
      score, bonus,
      bestFinish: state.seasonStats?.bestFinish || null,
      podiums: state.seasonStats?.podiums || 0,
      wins: state.seasonStats?.wins || 0,
      money: Math.round(state.money||0),
      f1Champion: f1.driver,
      f1TeamChampion: f1.team,
      f2Champion: f2.driver,
      f2TeamChampion: f2.team
    };
    state.seasonArchive = state.seasonArchive || [];
    state.seasonArchive.push(archive);
    state.hallOfFame = state.hallOfFame || [];
    if(f1.driver) state.hallOfFame.push({ year:archive.year, series:'F1', driver:f1.driver, team:f1.team, points:f1.points });
    if(f2.driver) state.hallOfFame.push({ year:archive.year, series:'F2', driver:f2.driver, team:f2.team, points:f2.points });
  }
  function evolveDriverPool(){
    state.driverProgress = state.driverProgress || {};
    state.driverDevelopmentLog = state.driverDevelopmentLog || [];
    const logs = [];
    allDrivers().forEach(base => {
      const current = applyDriverProgress(base);
      const age = Number(current.age || 24) + Math.max(0,(state.seasonNumber||1)-1);
      const potential = Number(current.potential || 72);
      const overall = Number(current.overall || 70);
      const contract = driverContract(current.short);
      const teamId = driverCurrentTeamId(current.short) || current.team;
      const row = (state.standings?.F1?.[current.short]) || (state.standings?.F2?.[current.short]);
      const points = row ? Number(row.points||0) : 0;
      let delta = 0;
      if(age <= 23) delta += 1.2;
      if(age <= 20) delta += .8;
      if(potential > overall) delta += Math.min(2.4, (potential-overall)/8);
      if(points > 60) delta += .9;
      if(points > 120) delta += .8;
      if(age >= 34) delta -= .9;
      if(age >= 38) delta -= 1.4;
      delta += rnd(-.45,.65);
      const newOverall = Math.max(45, Math.min(99, Math.round(overall + delta)));
      const technicalGain = Math.max(-1, Math.min(2, Math.round(delta)));
      state.driverProgress[current.short] = {
        overall:newOverall,
        speed:Math.max(40, Math.min(99, Math.round((current.speed||overall) + technicalGain))),
        consistency:Math.max(40, Math.min(99, Math.round((current.consistency||overall) + Math.max(-1,technicalGain)))) ,
        experience:Math.max(40, Math.min(99, Math.round((current.experience||overall) + 1))),
        potential:Math.max(newOverall, potential - (age>30 ? 1 : 0))
      };
      contract.morale = Math.max(35, Math.min(95, (contract.morale||62) + (points>30?4:-2) + (teamId===state.currentTeam?2:0)));
      if(Math.abs(newOverall-overall) >= 1) logs.push({ driver:current.short, name:current.name, from:overall, to:newOverall, delta:newOverall-overall, year:state.seasonYear });
    });
    state.driverDevelopmentLog.unshift(...logs.slice(0,12));
    state.driverDevelopmentLog = state.driverDevelopmentLog.slice(0,30);
    return logs;
  }
  function processContractYearEnd(){
    state.driverContracts = state.driverContracts || {};
    const currentShorts = driversForTeam(state.currentTeam).map(d=>d.short);
    Object.entries(state.driverContracts).forEach(([short,c]) => { c.yearsLeft = Math.max(0, Number(c.yearsLeft||1)-1); });
    currentShorts.forEach(short => {
      const d = driverByShort(short); if(!d) return;
      const c = driverContract(short);
      if(c.yearsLeft <= 0){
        const salary = Math.round(driverSalary(d) * (1 + Math.max(0,(d.overall||70)-72)/120));
        c.yearsLeft = 1;
        c.salary = salary;
        c.buyout = Math.round(driverValue(d)*.35);
        c.morale = Math.max(55,c.morale||60);
        addInboxMessage('market','Agente do Piloto',`Renovação automática: ${d.name}`,`Contrato renovado por 1 temporada para manter o grid estável. Salário anual: ${money(salary)}.`,{driver:short});
      }
    });
  }
  function resetSeasonStandings(){
    state.standings = { F1:createStandingsForSeries('F1'), F2:createStandingsForSeries('F2') };
    state.f1Standings = state.standings.F1;
  }
  function applyAnnualTeamBudgetAndCar(score){
    const oldCar = {...(state.car||{})};
    const team = teamById(state.currentTeam);
    const retention = score >= 75 ? .95 : score >= 55 ? .90 : .84;
    const factoryBonus = ((state.facilities?.factory||1)-1)*.7 + ((state.staff?.designers||1)-1)*.35;
    ['aero','engine','chassis','reliability','tyreWear','pitStop','fuel'].forEach(k=>{
      const base = team?.car?.[k] || 50;
      state.car[k] = Math.max(45, Math.min(99, Math.round((state.car[k]||base)*retention + base*(1-retention) + factoryBonus)));
    });
    const budgetBoost = Math.round((team?.budget||4000000) * (score>=75?.12:score>=55?.06:.025));
    state.money += budgetBoost;
    state.carEvolutionLog = state.carEvolutionLog || [];
    state.carEvolutionLog.unshift({ year:state.seasonYear, score, budgetBoost, from:oldCar, to:{...state.car} });
    state.carEvolutionLog = state.carEvolutionLog.slice(0,10);
    return budgetBoost;
  }
  function currentDriverContractRows(){
    return driversForTeam(state.currentTeam).map(d=>{ const c=driverContract(d.short); return `<p>${driverAvatarChip(d,'driver-avatar-inline small')} <b>${d.short}</b> • ${c.yearsLeft} ano(s) • ${money(c.salary)}</p>`; }).join('') || '<p>Sem pilotos registrados.</p>';
  }
  function seasonArchiveRows(){
    const rows = (state.seasonArchive||[]).slice(-8).reverse();
    if(!rows.length) return '<p>Nenhuma temporada encerrada ainda.</p>';
    return `<div class="standings-list">${rows.map(r=>`<div class="row history-row"><span>${r.year}</span><span>${r.team} / ${r.series}</span><span>${r.bestFinish?'P'+r.bestFinish:'-'}</span><span>REP ${r.reputation}</span></div>`).join('')}</div>`;
  }
  function hallOfFameRows(){
    const rows = (state.hallOfFame||[]).slice(-10).reverse();
    if(!rows.length) return '<p>Campeões serão registrados ao fechar temporadas.</p>';
    return `<div class="standings-list">${rows.map(r=>{ const d=driverByShort(r.driver)||{short:r.driver,name:r.driver}; const t=teamById(r.team); return `<div class="row rich-row"><span>${r.year}</span><span class="driver-cell">${driverAvatarChip(d)}<span><b>${r.series} ${d.short}</b><small>${d.name}</small></span></span><span class="team-cell">${teamLogoHTML(t)}<span>${t?t.name:''}</span></span><span>${r.points} pts</span></div>`; }).join('')}</div>`;
  }
  function driverDevelopmentRows(){
    const rows = (state.driverDevelopmentLog||[]).slice(0,10);
    if(!rows.length) return '<p>A evolução aparecerá no fechamento da temporada.</p>';
    return `<div class="standings-list">${rows.map(r=>`<div class="row history-row"><span>${r.year}</span><span>${r.name}</span><span>${r.from} → ${r.to}</span><span>${r.delta>0?'+':''}${r.delta}</span></div>`).join('')}</div>`;
  }
  function carEvolutionRows(){
    const latest = (state.carEvolutionLog||[])[0];
    if(!latest) return '<p>A evolução anual do carro aparecerá no fechamento da temporada.</p>';
    return `<p>Bônus orçamento: <b>${money(latest.budgetBoost)}</b></p><p>Aero ${latest.from.aero||0} → ${latest.to.aero||0} • Motor ${latest.from.engine||0} → ${latest.to.engine||0}</p><p>Chassi ${latest.from.chassis||0} → ${latest.to.chassis||0} • Confiabilidade ${latest.from.reliability||0} → ${latest.to.reliability||0}</p>`;
  }

  function seasonReviewScore(){
    const stats = state.seasonStats || {};
    const best = stats.bestFinish || 22;
    const rep = Math.round(state.reputation || 0);
    const moneyScore = state.money >= 0 ? 8 : -8;
    return Math.max(0, Math.min(100, rep + Math.max(0, 14-best)*2 + (stats.podiums||0)*3 + (stats.wins||0)*5 + moneyScore));
  }

  function endSeasonReview(){
    ensureCareerSystems();
    if((state.completedRaces||0) < activeCalendar().length) return alert('A temporada ainda não terminou. Complete o calendário antes da revisão anual.');
    const score = seasonReviewScore();
    const team = teamById(state.currentTeam);
    const bonus = Math.round((state.contract?.salary || 300000) * (score >= 75 ? 1.2 : score >= 55 ? .75 : .35));
    state.money += bonus;
    archiveCurrentSeason(score, bonus);
    const budgetBoost = applyAnnualTeamBudgetAndCar(score);
    const devLogs = evolveDriverPool();
    processContractYearEnd();
    state.reputation = Math.min(99, Math.max(10, (state.reputation||0) + (score>=80?6:score>=60?3:-2)));
    refreshCareerOffers();
    notifyOffersIfUnlocked();
    addInboxMessage('season','Diretoria',`Revisão da temporada ${state.seasonYear}`,`Resultado da avaliação: ${score}/100. Bônus pago: ${money(bonus)}. Investimento anual liberado: ${money(budgetBoost)}. ${score>=75?'A diretoria considera seu trabalho excelente e o mercado está atento.':score>=55?'A diretoria aprovou a continuidade, mas espera evolução.':'A diretoria está pressionando por resultados imediatos.'}`,{score, team:team?.id});
    addInboxMessage('technical','Engenharia / Academia',`Evolução anual de pilotos`,`${devLogs.length ? devLogs.slice(0,5).map(x=>`${x.name}: ${x.from}→${x.to}`).join(' • ') : 'Sem grandes mudanças de overall nesta temporada.'}`,{});
    state.seasonYear += 1;
    state.seasonNumber += 1;
    state.completedRaces = 0;
    state.roundIndex = 0;
    state.lastQualifying = [];
    state.lastRace = [];
    resetSeasonStandings();
    state.seasonStats = { races:0, bestFinish:null, podiums:0, wins:0, objectiveProgress:0 };
    addInboxMessage('calendar','FIA / Calendário',`Calendário ${state.seasonYear} aberto`,`Nova temporada iniciada. A agenda foi reiniciada e as equipes continuam monitorando sua evolução.`,{});
    saveState();
    updateHud();
    renderLobby();
    alert('Temporada encerrada. Relatório e novos e-mails adicionados à central.');
  }

  function contractStatusText(){
    const rep = Math.round(state.reputation || 0);
    const team = teamById(state.currentTeam);
    if(!team) return 'sem equipe';
    if(state.currentSeries === 'F2'){
      if(rep >= 72) return 'pronto para F1 pequena';
      if(rep >= 62) return 'brigando por convite da F1';
      return 'construindo reputação na F2';
    }
    if(rep >= 92) return 'candidato a equipe grande';
    if(rep >= 82) return 'candidato a equipe média/alta';
    return 'estabilizando na F1';
  }

  function teamProgressionClass(team){
    const rep = Number(team.reputation || 50);
    if(team.tier === 'top' || rep >= 90) return 'grand';
    if(team.tier === 'mid' || rep >= 82) return 'mid';
    if(DATA.f1Teams2026.some(t => t.id === team.id)) return 'low_f1';
    if(rep >= 68) return 'strong_f2';
    if(rep >= 58) return 'mid_f2';
    return 'entry_f2';
  }

  function requiredRepForTeam(team){
    const cls = teamProgressionClass(team);
    const base = ({entry_f2:35, mid_f2:56, strong_f2:68, low_f1:78, mid:88, grand:95})[cls] || 72;
    return Math.max(25, Math.min(98, base + (balanceTuning().offerGate || 0)));
  }

  function progressionLabel(team){
    const cls = teamProgressionClass(team);
    return ({entry_f2:'F2 de entrada', mid_f2:'F2 média', strong_f2:'F2 forte', low_f1:'F1 pequena', mid:'F1 média/alta', grand:'Equipe grande'})[cls] || 'Equipe';
  }

  function teamUnlocked(team){
    if(state.mode === 'sandbox') return true;
    const rep = state.reputation || 0;
    const required = requiredRepForTeam(team);
    if(state.currentSeries === 'F2'){
      if(DATA.f2Teams.some(t => t.id === team.id)) return rep >= Math.min(required, 62);
      return teamProgressionClass(team) === 'low_f1' && rep >= required;
    }
    if(DATA.f2Teams.some(t => t.id === team.id)) return false;
    const cls = teamProgressionClass(team);
    if(cls === 'low_f1') return rep >= required;
    if(cls === 'mid') return rep >= required;
    if(cls === 'grand') return rep >= required;
    return false;
  }

  function generateCareerOffers(){
    const pool = [...DATA.f2Teams, ...DATA.f1Teams2026]
      .filter(t => t.id !== state.currentTeam)
      .filter(t => state.mode === 'sandbox' || teamUnlocked(t));
    return pool
      .map(t => ({ team:t, required:requiredRepForTeam(t), label:progressionLabel(t), series:DATA.f1Teams2026.some(x=>x.id===t.id)?'F1':'F2' }))
      .sort((a,b)=> a.required-b.required || a.team.reputation-b.team.reputation)
      .slice(0, state.mode === 'sandbox' ? 8 : 5);
  }

  function refreshCareerOffers(){
    const offers = generateCareerOffers().map(o => ({
      team:o.team.id,
      series:o.series,
      level:o.label,
      required:o.required,
      round:state.completedRaces,
      salary:Math.round((o.team.budget||4000000) * (0.03 + Math.min(0.025,(state.reputation||50)/5000))),
      text:`${o.label}: ${o.team.name}`
    }));
    state.offers = offers;
  }

  function acceptCareerOffer(teamId){
    const target = teamById(teamId);
    if(!target) return;
    if(state.mode !== 'sandbox' && !teamUnlocked(target)) return alert('Sua reputação ainda não liberou esta proposta.');
    const previous = teamById(state.currentTeam);
    state.careerHistory = state.careerHistory || [];
    state.careerHistory.push({
      round:state.completedRaces,
      from:previous ? previous.name : 'Início',
      to:target.name,
      series:DATA.f1Teams2026.some(t=>t.id===target.id)?'F1':'F2',
      reputation:Math.round(state.reputation||0),
      date:new Date().toISOString()
    });
    state.currentTeam = target.id;
    state.currentSeries = DATA.f1Teams2026.some(t=>t.id===target.id) ? 'F1' : 'F2';
    state.money = Math.max(state.money || 0, Math.round((target.budget||4000000) * budgetStartMultiplier(DATA.f1Teams2026.some(t=>t.id===target.id) ? 'F1' : 'F2')));
    state.reputation = Math.max(state.reputation || 0, target.reputation - 8);
    state.car = {...target.car, fuel: state.car?.fuel || 55};
    state.contract = { team:target.id, series:state.currentSeries, startedRound:state.completedRaces, salary:Math.round((target.budget||4000000)*0.04), objective:target.objective || 'Cumprir metas da diretoria.' };
    state.lastQualifying = [];
    state.lastRace = [];
    refreshCareerOffers();
    addInboxMessage('offer','Nova Equipe',`Contrato assinado: ${target.name}`,`Você assumiu a ${target.name}. Nova categoria: ${state.currentSeries}. Meta: ${state.contract.objective}.`,{team:target.id});
    saveState();
    updateHud();
    renderLobby();
    alert(`Contrato assinado com ${target.name}.`);
  }

  function offerCard(o){
    const t = o.team;
    const locked = state.mode !== 'sandbox' && !teamUnlocked(t);
    const drivers = driversForTeam(t.id).slice(0,2);
    const pct = Math.min(100, Math.round(((state.reputation||0) / Math.max(1,o.required))*100));
    return `<article class="dash-card glass-panel offer-card ${locked?'locked':''}" style="--team-color:#${(t.color||0x333333).toString(16).padStart(6,'0')}">
      <div class="offer-head">${teamLogoHTML(t,'team-logo-inline offer-logo')}<div><h3>${t.name}</h3><p>${o.series} • ${o.label}</p></div></div>
      <div class="team-driver-strip offer-drivers">${drivers.map(d => `<span>${driverAvatarChip(d, 'driver-avatar-inline small')}<b>${d.short}</b></span>`).join('')}</div>
      <p>Reputação necessária: <b>${o.required}</b> • Sua REP: <b>${Math.round(state.reputation||0)}</b></p>
      <div class="progress"><i style="width:${pct}%"></i></div>
      <p>Meta: ${t.objective || 'Cumprir objetivos de temporada.'}</p>
      <p>Salário estimado: ${money(Math.round((t.budget||4000000)*0.04))}</p>
      <button class="${locked?'secondary':'primary'}" data-action="acceptOffer" data-team="${t.id}" ${locked?'disabled':''}>${locked?'BLOQUEADO':'ASSINAR CONTRATO'}</button>
    </article>`;
  }

  function driverCard(d){
    const team = teamById(d.team);
    const portrait = d.portrait || null;
    return `<article class="dash-card glass-panel driver-card">
      <div class="driver-head">
        <div class="portrait-wrap">
          ${portrait ? `<img class="driver-portrait" data-asset-src="${portrait}" alt="${d.name}" />` : ''}
          <span class="fallback-badge driver-fallback" style="display:${portrait ? 'none':'flex'};background:linear-gradient(135deg,#${(team.color||0x444444).toString(16).padStart(6,'0')},#111827)">${initials(d.name)}</span>
        </div>
        <div class="driver-meta">
          <h3>${d.short}</h3>
          <p>${d.name}</p>
          <div class="meta-line"><span class="team-chip">${team.name}</span><span class="flag-chip"><img data-asset-src="${flagPath(d.flag)}" alt="${d.flag}" /><b>${d.flag}</b></span></div>
        </div>
      </div>
      <p>Overall ${d.overall} • Potencial ${d.potential} • Idade ${d.age}</p>
      <div class="progress"><i style="width:${d.overall}%"></i></div>
      <p>Vel ${d.speed} • Cons ${d.consistency} • Chuva ${d.rain}</p>
    </article>`;
  }

  function labelRole(r){ return ({designers:'Designers',mechanics:'Mecânicos',strategists:'Estrategistas',raceEngineers:'Engenheiros de pista',scouts:'Olheiros',pitCrew:'Pit crew'})[r] || r; }
  function roleDesc(r){ return ({designers:'Aceleram desenvolvimento de peças e melhoram classificação.',mechanics:'Reduzem falhas mecânicas e perda de condição.',strategists:'Melhoram estratégia, ritmo de corrida e desgaste de pneus.',raceEngineers:'Melhoram acerto mecânico, feedback de pilotos e consistência de stint.',scouts:'Reduzem custo de contratação e revelam melhor potencial no mercado.',pitCrew:'Reduzem tempo real de pit stop e risco de erro nos boxes.'})[r] || ''; }
  function staffImpactText(r){ return ({designers:`+${Math.round((state.staff?.designers||1)*0.7)} ganho por upgrade`,mechanics:`-${Math.round((state.staff?.mechanics||1)*2)}% falhas/condição`,strategists:`+${Math.round((state.staff?.strategists||1)*2)} gestão de pneus`,raceEngineers:`+${Math.round((state.staff?.raceEngineers||1)*1.2)} acerto e consistência`,scouts:`-${Math.round((state.staff?.scouts||1)*1.5)}% custo no mercado`,pitCrew:`-${Math.round((state.staff?.pitCrew||1)*2.2)}% tempo de pit`})[r]; }
  function facilityLabel(k){ return ({hq:'Sede',simulator:'Simulador',factory:'Fábrica',scouting:'Observação'})[k]; }
  function upgradeCost(part){
    const tune = balanceTuning();
    const level = Number(state.car?.[part] || 50);
    const base = state.currentSeries === 'F1' ? 840000 : 210000;
    const curve = Math.pow(Math.max(1, level - 38), 1.25);
    return Math.round((base + curve * (state.currentSeries === 'F1' ? 16500 : 5600)) * tune.cost);
  }
  function staffHireCost(role){
    const tune = balanceTuning();
    const level = state.staff?.[role] || 1;
    const seriesBase = state.currentSeries === 'F1' ? 520000 : 180000;
    const roleMul = role==='scouts'?.90:role==='pitCrew'?1.10:role==='raceEngineers'?1.18:1;
    return Math.round((seriesBase + level * (state.currentSeries === 'F1' ? 390000 : 125000)) * roleMul * tune.cost);
  }
  function upgradePart(part){ const cost = upgradeCost(part); if(state.money < cost) return alert('Orçamento insuficiente.'); state.money -= cost; const gain = 2 + (state.staff?.designers||1)*0.7 + ((state.facilities?.factory||1)-1)*0.35; state.car[part] = Math.min(99,(state.car[part]||50) + gain); addInboxMessage('technical','Departamento Técnico',`Upgrade concluído: ${part}`,`A nova peça subiu para nível ${Math.round(state.car[part])}. O impacto será aplicado já na próxima classificação e corrida.`,{}); saveState(); renderTab('garage'); updateHud(); }
  function applySetupPreset(preset){
    const presets = {
      balanced:{ preset:'balanced', aeroBalance:50, engineMode:50, suspension:50, tyrePressure:50 },
      downforce:{ preset:'downforce', aeroBalance:72, engineMode:44, suspension:58, tyrePressure:48 },
      speed:{ preset:'speed', aeroBalance:36, engineMode:72, suspension:46, tyrePressure:54 },
      tyres:{ preset:'tyres', aeroBalance:52, engineMode:42, suspension:42, tyrePressure:38 },
      rain:{ preset:'rain', aeroBalance:68, engineMode:38, suspension:35, tyrePressure:34 }
    };
    state.setup = presets[preset] || presets.balanced;
    addInboxMessage('technical','Engenharia de Corrida',`Acerto aplicado: ${setupLabel(state.setup.preset)}`,`O acerto mecânico selecionado será usado na próxima sessão. Ele altera ritmo, pneus, chance de erro e desempenho por tipo de pista.`,{});
    saveState(); renderTab('garage');
  }
  function signSponsor(id){ const s = DATA.sponsors.find(x=>x.id===id); state.sponsor = s; state.money += s.advance; addInboxMessage('finance','Departamento Comercial',`Patrocinador assinado: ${s.name}`,`${s.name} entrou como patrocinador principal. Meta: ${s.goal}. Bônus por corrida: ${money(s.raceBonus)}.`,{sponsor:id}); saveState(); renderTab('dashboard'); updateHud(); }
  function hireStaff(role){ state.staff = {...{designers:1,mechanics:1,strategists:1,raceEngineers:1,scouts:1,pitCrew:1},...(state.staff||{})}; const cost = staffHireCost(role); if(state.money < cost) return alert('Orçamento insuficiente.'); state.money -= cost; state.staff[role] = (state.staff[role]||1) + 1; addInboxMessage('staff','RH / Engenharia',`${labelRole(role)} contratado`,`O departamento ${labelRole(role)} subiu para nível ${state.staff[role]}. Impacto: ${staffImpactText(role)}.`,{}); saveState(); renderTab('staff'); updateHud(); }


  function chooseRaceStrategy(plan){
    const presets = {
      balanced:{ plan:'balanced', startCompound:selectedCompound||'soft', stopBias:'balanced' },
      aggressive:{ plan:'aggressive', startCompound:selectedCompound||'soft', stopBias:'early' },
      conservative:{ plan:'conservative', startCompound:selectedCompound||'medium', stopBias:'late' }
    };
    state.raceStrategy = presets[plan] || presets.balanced;
    selectedCompound = state.raceStrategy.startCompound;
    saveState();
    renderStrategyPlan();
  }
  function strategyLabel(plan){ return ({balanced:'Estratégia equilibrada',aggressive:'Ataque/undercut',conservative:'Conservadora/overcut'})[plan] || 'Estratégia equilibrada'; }
  function renderStrategyPlan(){
    const el = document.getElementById('strategyPlan');
    if(!el) return;
    const strat = state.raceStrategy || { plan:'balanced', startCompound:selectedCompound||'soft', stopBias:'balanced' };
    const currentRace = activeCalendar()[state.roundIndex] || activeCalendar()[0] || {};
    const track = currentTrackProfile();
    const pitLap = recommendedPitLap(currentRace.laps||22, strat);
    el.innerHTML = `<h4>Plano de corrida</h4><div class="strategy-choice-row">
      <button class="${strat.plan==='balanced'?'selected':''}" data-action="chooseStrategy" data-strategy="balanced">Equilibrada</button>
      <button class="${strat.plan==='aggressive'?'selected':''}" data-action="chooseStrategy" data-strategy="aggressive">Undercut</button>
      <button class="${strat.plan==='conservative'?'selected':''}" data-action="chooseStrategy" data-strategy="conservative">Overcut</button>
    </div><p><b>${strategyLabel(strat.plan)}</b> • Composto inicial: ${compoundLabel(strat.startCompound||selectedCompound)} • Pit sugerido: volta ${pitLap}</p><p>Perfil da pista: ${track.label}. Staff estratégico e acerto mecânico alteram pneus, ritmo e chance de erro.</p>`;
  }
  function compoundLabel(c){ return ({soft:'Macio',medium:'Médio',hard:'Duro',inter:'Intermediário',wet:'Chuva'})[c] || c || 'Macio'; }
  function recommendedPitLap(laps,strat){
    const p = strat?.plan || 'balanced';
    const ratio = p === 'aggressive' ? .34 : (p === 'conservative' ? .68 : .52);
    return Math.max(2, Math.min(laps-2, Math.round(laps*ratio)));
  }
  function compoundWearMultiplier(c){ return ({soft:1.12,medium:1,hard:.88,inter:1.04,wet:1.08})[c] || 1; }
  function compoundPaceMultiplier(c){ return ({soft:1.012,medium:1,hard:.992,inter:.982,wet:.965})[c] || 1; }

  function advanceToNextRaceScreen(){
    state.weekend = { practiceDone:false, setupConfidence:50, tyreKnowledge:50, qualyFocus:'balanced', engineerNote:'Novo fim de semana iniciado. Faça o treino livre antes da classificação.' };
    state.lastQualifying = [];
    saveState();
    if((state.completedRaces||0) >= activeCalendar().length){
      $$('.side-nav button').forEach(b=>b.classList.remove('active'));
      const cal = document.querySelector('.side-nav button[data-tab="calendar"]');
      if(cal) cal.classList.add('active');
      showScreen('lobby');
    } else showScreen('qualifying');
  }

  function setQualyFocus(focus){
    state.weekend = state.weekend || {};
    state.weekend.qualyFocus = focus || 'balanced';
    saveState();
    renderWeekendPanel();
  }

  function focusLabel(focus){ return ({balanced:'Equilibrado', singleLap:'Volta rápida', racePace:'Ritmo de corrida', tyreStudy:'Estudo de pneus'})[focus] || 'Equilibrado'; }

  function simulatePracticeSession(){
    const track = currentTrackProfile();
    const setupFx = setupEffectFor(track, state.setup);
    const engineers = state.staff?.raceEngineers || 1;
    const strategists = state.staff?.strategists || 1;
    const mechanics = state.staff?.mechanics || 1;
    const base = 48 + engineers*4.2 + strategists*2.4 + mechanics*1.2 + (setupFx.pace-1)*95;
    const confidence = Math.max(35, Math.min(96, base + rnd(-7,9)));
    const tyreKnowledge = Math.max(35, Math.min(96, 45 + strategists*4.6 + engineers*1.8 + (setupFx.tyreCare*160) + rnd(-6,8)));
    const qualyFocus = confidence >= 76 ? 'singleLap' : tyreKnowledge >= 72 ? 'racePace' : 'balanced';
    state.weekend = {
      practiceDone:true,
      setupConfidence:Math.round(confidence),
      tyreKnowledge:Math.round(tyreKnowledge),
      qualyFocus,
      engineerNote: confidence >= 78 ? 'Acerto competitivo. A equipe recomenda atacar na classificação.' : confidence >= 60 ? 'Acerto estável. Ainda há margem para ganhar ritmo com estratégia.' : 'Acerto instável. Recomenda-se abordagem conservadora para preservar pneus e evitar erros.'
    };
    addInboxMessage('technical','Engenharia de Corrida',`Treino livre concluído — ${activeCalendar()[state.roundIndex]?.name || 'GP'}`,`Confiança no setup: ${state.weekend.setupConfidence}%. Leitura dos pneus: ${state.weekend.tyreKnowledge}%. Recomendação: ${focusLabel(state.weekend.qualyFocus)}.`,{});
    saveState();
    renderQualifying(false);
  }

  function renderWeekendPanel(){
    const el = document.getElementById('weekendPanel');
    if(!el) return;
    const currentRace = activeCalendar()[state.roundIndex] || activeCalendar()[0] || {};
    const w = state.weekend || { practiceDone:false, setupConfidence:50, tyreKnowledge:50, qualyFocus:'balanced', engineerNote:'Aguardando treino livre.' };
    const track = currentTrackProfile();
    const regulation = weekendRegulationSummary(currentRace);
    el.innerHTML = `<h3>Fim de semana</h3>
      <p><b>${currentRace.name || 'Grande Prêmio'}</b> • ${currentRace.weather || 'dry'} • ${currentRace.laps || 22} voltas • perfil ${track.label}</p>
      <div class="weekend-metrics">
        <span>Confiança setup <b>${w.setupConfidence || 50}%</b></span>
        <span>Leitura pneus <b>${w.tyreKnowledge || 50}%</b></span>
        <span>Foco Q <b>${focusLabel(w.qualyFocus)}</b></span>
      </div>
      ${regulation}
      <p class="engineer-note">${w.engineerNote || 'Aguardando treino livre.'}</p>
      <button class="primary" data-action="simulatePractice">SIMULAR TREINO LIVRE</button>
      ${state.currentSeries === 'F2' && state.lastQualifying?.length ? '<button class="secondary" data-action="simulateSprint">SIMULAR SPRINT F2</button><button class="secondary" data-action="simulateFeature">SIMULAR FEATURE F2</button>' : ''}
      ${state.lastQualifying && state.lastQualifying.length ? '<button class="primary big" data-action="startRace">INICIAR CORRIDA</button>' : ''}
      <div class="strategy-choice-row qualy-focus-row">
        <button class="${w.qualyFocus==='balanced'?'selected':''}" data-action="setQualyFocus" data-focus="balanced">Equilíbrio</button>
        <button class="${w.qualyFocus==='singleLap'?'selected':''}" data-action="setQualyFocus" data-focus="singleLap">Volta rápida</button>
        <button class="${w.qualyFocus==='racePace'?'selected':''}" data-action="setQualyFocus" data-focus="racePace">Ritmo corrida</button>
        <button class="${w.qualyFocus==='tyreStudy'?'selected':''}" data-action="setQualyFocus" data-focus="tyreStudy">Pneus</button>
      </div>`;
  }

  function renderQualifying(){
    const list = state.lastQualifying.length ? state.lastQualifying : generateGridPreview();
    const currentRace = activeCalendar()[state.roundIndex] || activeCalendar()[0];
    const title = document.getElementById('qualifyingHeaderTitle');
    if(title) title.textContent = `CLASSIFICAÇÃO — ${currentRace.name.toUpperCase()}`;
    $('#qualifyingTable').innerHTML = list.map((r,i)=>{
      const d = driverByShort(r.driver) || {short:r.driver,name:r.driver,portrait:''};
      const team = teamById(r.team);
      return `<div class="row rich-row ${isPlayerDriver(r.driver)?'highlight':''}"><span class="pos-cell">${i+1}</span><span class="driver-cell">${driverAvatarChip(d)}<span class="driver-text"><b>${d.short}</b><small>${d.name}</small></span></span><span class="team-cell">${teamLogoHTML(team)}<span>${team ? team.name : r.teamName}</span></span><span class="time-cell"><b>${r.qStage || 'Q'}</b> ${r.time}</span></div>`;
    }).join('');
    setScreenBg('screen-qualifying', DATA.assetPaths.classification);
    hydrateAssets($('#qualifyingTable'));
    renderStrategyPlan();
    renderWeekendPanel();
  }
  function generateRaceDrivers(){
    const baseTeams = state.currentSeries === 'F2' ? DATA.f2Teams : DATA.f1Teams2026;
    return baseTeams.flatMap(t => driversForTeam(t.id).map(d => ({...d, team:t.id, currentTeam:t.id, teamObj:t})));
  }
  function currentTrackProfile(){
    const r = activeCalendar()[state.roundIndex] || activeCalendar()[0] || {};
    const name = String(r.name||'').toLowerCase();
    if(r.weather === 'variable') return { aero:1.08, engine:.94, chassis:1.06, tyre:1.05, rain:1.08, label:'técnica/variável' };
    if(name.includes('monza') || name.includes('baku') || name.includes('jeddah')) return { aero:.92, engine:1.12, chassis:.98, tyre:.98, rain:1, label:'alta velocidade' };
    if(name.includes('monaco') || name.includes('singapore') || name.includes('hungar')) return { aero:1.14, engine:.88, chassis:1.08, tyre:1.04, rain:1, label:'rua/alta pressão' };
    return { aero:1.02, engine:1.02, chassis:1.02, tyre:1, rain:1, label:'mista' };
  }
  function setupEffectFor(track, setup){
    setup = setup || { preset:'balanced', aeroBalance:50, engineMode:50, suspension:50, tyrePressure:50 };
    const aeroFit = 1 - Math.abs((setup.aeroBalance||50) - (track.aero>1.08?70:track.engine>1.08?35:52))/260;
    const engineFit = 1 - Math.abs((setup.engineMode||50) - (track.engine>1.08?72:track.aero>1.08?42:52))/280;
    const suspFit = 1 - Math.abs((setup.suspension||50) - (track.chassis>1.06?42:50))/300;
    const tyreCare = ((100-(setup.tyrePressure||50))/100) * .10;
    return { pace: Math.max(.92, Math.min(1.08, (aeroFit+engineFit+suspFit)/3)), tyreCare, reliability: setup.engineMode>65 ? -.035 : .015, label:setupLabel(setup.preset) };
  }
  function racePerformanceScore(d, car, isPlayer=false){
    const track = currentTrackProfile();
    const setup = isPlayer ? setupEffectFor(track,state.setup) : { pace:1, tyreCare:0, reliability:0 };
    const driver = ((d.speed||70)*.42 + (d.consistency||70)*.30 + (d.experience||60)*.14 + (d.rain||60)*(race?.weather==='variable'?.14:.04));
    const machine = ((car.aero||60)*track.aero + (car.engine||60)*track.engine + (car.chassis||60)*track.chassis)/3;
    const staff = isPlayer ? ((state.staff?.strategists||1)*.9 + (state.staff?.mechanics||1)*.55 + (state.staff?.raceEngineers||1)*.65 + (state.facilities?.simulator||1)*.45) : 1.2;
    const weekend = isPlayer ? (state.weekend || {}) : {};
    const focus = weekend.qualyFocus || 'balanced';
    const confidence = isPlayer ? ((weekend.practiceDone ? (weekend.setupConfidence||50) : 45) - 50) / 14 : 0;
    const focusBoost = isPlayer && focus === 'singleLap' ? 1.8 : isPlayer && focus === 'racePace' ? .6 : isPlayer && focus === 'tyreStudy' ? .2 : .9;
    return ((driver*.54 + machine*.46 + staff) * setup.pace) + confidence + focusBoost;
  }
  function generateGridPreview(){
    const track = currentTrackProfile();
    return generateRaceDrivers().map(d => {
      const t = teamById(d.team); const car = d.team === state.currentTeam ? state.car : estimateCar(t);
      const isPlayer = d.team === state.currentTeam;
      const score = racePerformanceScore(d,car,isPlayer) + rnd(-4.2,4.2) + (isPlayer ? (state.staff?.designers||1)*0.25 : 0);
      const time = 88 - score/5.2 + rnd(0,.35);
      return {driver:d.short, team:d.team, teamName:t.name, score, time:time.toFixed(3), profile:track.label};
    }).sort((a,b)=>b.score-a.score);
  }
  function simulateQualifying(){
    const preview = generateGridPreview();
    state.lastQualifying = regulationEngine?.simulateQualifyingStages ? regulationEngine.simulateQualifyingStages(preview, { series:state.currentSeries, round:activeCalendar()[state.roundIndex] }) : preview.map((r,i)=>({...r, gridPosition:i+1, qStage:'Q'}));
    const pole = state.lastQualifying[0];
    state.weekend = {...(state.weekend||{}), qualifyingComplete:true, pole: pole?.driver || null, regulationPlan: regulationEngine?.activeSessionPlan?.(state.currentSeries, activeCalendar()[state.roundIndex]) || null };
    if(state.currentSeries === 'F2' && pole){ awardPolePointIfNeeded(pole.driver); }
    addInboxMessage('sporting','Direção de Prova','Classificação oficial concluída',`Grid definido para ${activeCalendar()[state.roundIndex]?.name || 'o próximo GP'} com ${state.currentSeries === 'F1' ? 'Q1/Q2/Q3' : 'qualificação F2'}. ${pole ? 'Pole: '+pole.driver+'. ' : ''}Revise estratégia e toque em INICIAR CORRIDA.`,{ pole:pole?.driver, series:state.currentSeries });
    saveState();
    renderQualifying();
  }

  function currentRegulationPlan(){ return regulationEngine?.activeSessionPlan?.(state.currentSeries, activeCalendar()[state.roundIndex]) || null; }
  function weekendRegulationSummary(round){
    const plan = regulationEngine?.activeSessionPlan?.(state.currentSeries, round) || null;
    if(!plan) return '<div class="regulation-strip"><span>Regulamento legado</span></div>';
    const sessions = (plan.sessions||[]).map(s=>`<span>${s.label || s.id}</span>`).join('');
    return `<div class="regulation-strip"><b>${plan.label}</b><div>${sessions}</div><small>Grid: ${plan.gridSource || 'oficial'} • Parque fechado: ${plan.parcFermeStarts || 'n/d'} • Pneus: ${plan.tyreRule || 'n/d'}</small></div>`;
  }
  function regulationMiniHTML(){
    const audit = regulationEngine?.audit?.() || { score:0, passed:0, failed:1, checks:[] };
    const plan = currentRegulationPlan();
    return `<p><b>${audit.score}/100</b> • ${audit.passed} aprovados • ${audit.failed} pendentes</p><p>${plan?.label || 'Regulamento não carregado'}</p><p class="muted-small">${(plan?.sessions||[]).map(s=>s.id.toUpperCase()).join(' → ')}</p>`;
  }

  function vehicleMiniHTML(){
    const audit = vehiclePhysics?.audit?.() || { score:0, passed:0, failed:1, checks:[] };
    const systems = audit.systems?.length ? audit.systems.length : 10;
    return `<p><b>${audit.score}/100</b> • ${audit.passed} aprovados • ${audit.failed} pendentes</p><p>${systems} sistemas físicos monitorados</p><p class="muted-small">Pneus • ERS/DRS • freios • motor • danos • pista</p>`;
  }
  function runVehiclePhysicsAudit(){
    const audit = vehiclePhysics?.audit?.();
    state.quality = state.quality || {};
    state.quality.vehiclePhysicsAudit = audit || { score:0, passed:0, failed:1, checks:[] };
    addInboxMessage('qa','Física do Veículo', audit?.score >= 92 ? 'Modelo físico aprovado' : 'Modelo físico requer revisão', `Fase 11: ${audit?.score ?? 0}/100 • ${audit?.passed ?? 0} verificações aprovadas.`, { score:audit?.score || 0 });
    saveState(); renderTab('system'); updateHud();
  }

  function strategyMiniHTML(){
    const audit = strategyAI?.audit?.() || { score:0, passed:0, failed:1, checks:[] };
    const systems = audit.systems?.length || 12;
    return `<p><b>${audit.score}/100</b> • ${audit.passed} aprovados • ${audit.failed} pendentes</p><p>${systems} sistemas estratégicos ativos</p><p class="muted-small">Undercut/overcut • tráfego • ataque/defesa • pits • SC/VSC/red flag</p>`;
  }
  function runStrategyAIAudit(){
    const audit = strategyAI?.audit?.();
    state.quality = state.quality || {};
    state.quality.strategyAIAudit = audit || { score:0, passed:0, failed:1, checks:[] };
    addInboxMessage('qa','IA e Estratégia', audit?.score >= 92 ? 'Estratégia de corrida aprovada' : 'Estratégia de corrida requer revisão', `Fase 12: ${audit?.score ?? 0}/100 • ${audit?.passed ?? 0} verificações aprovadas.`, { score:audit?.score || 0 });
    saveState(); renderTab('system'); updateHud();
  }

  function balanceMiniHTML(){
    const audit = balanceSimulator?.audit?.() || { score:0, passed:0, failed:1, checks:[] };
    const report = state.quality?.balanceMonteCarlo || null;
    const score = report?.score ? `${report.score}/100` : `${audit.score}/100`;
    const runs = report?.runs || (window.F1M_BALANCE_DATA?.monteCarlo?.quickRuns || 80);
    const dnf = report?.metrics?.dnfRate !== undefined ? `${Math.round(report.metrics.dnfRate*1000)/10}% DNF` : 'DNF alvo auditável';
    const overtakes = report?.metrics?.overtakesPerRace !== undefined ? `${Math.round(report.metrics.overtakesPerRace)} ultrapassagens/corrida` : 'ultrapassagens alvo';
    return `<p><b>${score}</b> • ${audit.passed} sistemas aprovados</p><p>${runs} simulações • ${dnf}</p><p class="muted-small">Monte Carlo • abandono • pits • gaps • progressão • dificuldade sem trapaça invisível • ${overtakes}</p>`;
  }

  function balanceSimulationInputs(){
    const series = state.currentSeries || selectedSeries || 'F2';
    const teams = series === 'F1' ? DATA.f1Teams2026 : DATA.f2Teams;
    const drivers = allDriversForSeries(series);
    return { series, teams, drivers, difficulty:difficultyKey(), seed:132026 + Number(state.completedRaces||0), laps:(activeCalendar(series)[state.roundIndex||0]?.laps || 26) };
  }

  function runBalanceAudit(){
    const audit = balanceSimulator?.audit?.();
    state.quality = state.quality || {};
    state.quality.balanceAudit = audit || { score:0, passed:0, failed:1, checks:[] };
    addInboxMessage('qa','Balanceamento F13', audit?.score >= 92 ? 'Modelo científico aprovado' : 'Modelo científico requer revisão', `Fase 13: ${audit?.score ?? 0}/100 • ${audit?.passed ?? 0} verificações aprovadas.`, { score:audit?.score || 0 });
    saveState(); renderTab('system'); updateHud();
  }

  function runBalanceMonteCarlo(){
    const input = balanceSimulationInputs();
    const quickRuns = Number(window.F1M_BALANCE_DATA?.monteCarlo?.quickRuns || 80);
    const report = balanceSimulator?.simulateMonteCarlo?.({ ...input, runs:quickRuns });
    state.quality = state.quality || {};
    state.quality.balanceMonteCarlo = report || null;
    const txt = report ? `${report.runs} corridas simuladas • score ${report.score}/100 • DNF ${Math.round((report.metrics?.dnfRate||0)*1000)/10}% • ${Math.round(report.metrics?.overtakesPerRace||0)} ultrapassagens/corrida.` : 'Balanceador indisponível.';
    addInboxMessage('qa','Monte Carlo F13','Relatório de balanceamento gerado', txt, { score:report?.score || 0 });
    saveState(); renderTab('system'); updateHud();
  }

  function visual3dMiniHTML(){
    const audit = visualSystem?.audit?.() || { score:0, passed:0, failed:1, checks:[] };
    const model = visualSystem?.createTrackModel?.(activeCalendar()[state.roundIndex] || {}, { width:window.innerWidth, height:window.innerHeight, dpr:window.devicePixelRatio || 1 }) || null;
    const cameras = Object.keys(audit.cameraPresets || {}).length;
    return `<p><b>${audit.score}/100</b> • ${audit.passed} aprovados • ${audit.failed} pendentes</p><p>${model?.name || 'Circuito procedural'} • largura ${model?.widthMeters || 0}m • ${model?.sectors?.length || 0} setores • ${model?.drsZones?.length || 0} DRS</p><p class="muted-small">${cameras} câmeras • replay ${model?.replay?.enabled ? 'ativo' : 'n/d'} • visual procedural sem binários pesados</p>`;
  }

  function runVisual3DAudit(){
    const audit = visualSystem?.audit?.() || { score:0, passed:0, failed:1, checks:[] };
    state.quality = state.quality || {};
    state.quality.visual3dAudit = audit;
    addInboxMessage('qa','Corrida 3D F14', audit.score >= 94 ? 'Renderização profissional aprovada' : 'Renderização 3D requer revisão', `Fase 14: ${audit.score}/100 • pista larga, elevação, pit lane, setores, DRS, racing lines, LOD, danos, chuva, câmeras e replay.`, { score:audit.score });
    saveState(); renderTab('system'); updateHud();
  }


  function audioUiMiniHTML(){
    const audit = audioUI?.audit?.() || { score:0, passed:0, failed:1, channels:[], muted:true, enabled:false, checks:[] };
    const mix = audioUI?.raceMix?.(race || { weather:'dry' }) || {};
    const status = audit.muted ? 'mutado até toque do usuário' : (audit.enabled ? 'ativo' : 'pronto');
    return `<p><b>${audit.score}/100</b> • ${audit.passed} aprovados • ${audit.failed} pendentes</p><p>${audit.channels?.length || 0} canais • ${status}</p><p class="muted-small">Motor ${mix.engine ?? 'n/d'} • Rádio ${mix.radio ?? 'n/d'} • Box ${mix.pit ?? 'n/d'} • UI ${mix.ui ?? 'n/d'} • sem arquivos pesados</p>`;
  }

  function runAudioUIAudit(){
    const audit = audioUI?.audit?.() || { score:0, passed:0, failed:1, checks:[] };
    state.quality = state.quality || {};
    state.quality.audioUI = audit;
    addInboxMessage('qa','Áudio e Interface F15', audit.score >= 96 ? 'Sistema de áudio/UI aprovado' : 'Sistema de áudio/UI requer revisão', `Fase 15: ${audit.score}/100 • áudio procedural, rádio/box, design system, tutorial contextual e acessibilidade.`, { score:audit.score });
    saveState(); renderTab('system'); updateHud();
  }

  function toggleAudioMute(){
    const currentlyMuted = audioUI?.muted !== false;
    audioUI?.setMuted?.(!currentlyMuted);
    audioUI?.unlock?.();
    audioUI?.emit?.(currentlyMuted ? 'ui.confirm' : 'ui.warning');
    state.settings = {...(state.settings||{}), audioMuted:!currentlyMuted};
    addInboxMessage('system','Áudio F15', currentlyMuted ? 'Áudio procedural ativado' : 'Áudio procedural mutado', 'O sistema usa Web Audio procedural e não adiciona arquivos pesados ao ZIP.', {});
    saveState(); renderTab('system');
  }


  function livingCareerMiniHTML(){
    const audit = livingCareer?.audit?.({ state }) || { score:0, passed:0, failed:1, checks:[], board:{confidence:0,status:'indisponível'}, recommendations:[], projection:[] };
    const board = audit.board || livingCareer?.evaluateBoard?.(state) || { confidence:0, status:'n/d', budget:0, facilities:0, departments:0 };
    const projection = audit.projection || livingCareer?.projectMultiSeason?.(state) || [];
    const next = (audit.recommendations || livingCareer?.recommendActions?.(state) || [])[0];
    return `<p><b>${audit.score}/100</b> • ${audit.passed} aprovados • ${audit.failed} pendentes</p><div class="living-metric-grid"><span>Conselho <b>${board.confidence || 0}</b></span><span>Fábrica <b>${board.facilities || 0}</b></span><span>Deptos <b>${board.departments || 0}</b></span><span>Caixa <b>${board.budget || 0}</b></span></div><p>${board.status || 'status n/d'} • ${next ? next.title : 'plano estável'}</p><p class="muted-small">Staff profundo • fábricas • P&D • patrocinadores • política interna • academia • mercado • imprensa • rivalidades • regulamentos • ${projection[1]?.expectedIdentity || 'multi-temporada'}</p>`;
  }

  function runLivingCareerAudit(){
    const audit = livingCareer?.audit?.({ state }) || { score:0, passed:0, failed:1, checks:[] };
    state.quality = state.quality || {};
    state.quality.livingCareerAudit = audit;
    addInboxMessage('qa','Carreira Viva F16', audit.score >= 96 ? 'Carreira viva aprovada' : 'Carreira viva requer revisão', `Fase 16: ${audit.score}/100 • staff, fábricas, P&D, patrocinadores, política, academia, mercado, imprensa, rivalidades e múltiplas temporadas.`, { score:audit.score });
    saveState(); renderTab('system'); updateHud();
  }

  function runLivingCareerReview(){
    ensureCareerSystems();
    const board = livingCareer?.evaluateBoard?.(state) || { confidence:0, status:'indisponível' };
    const reg = livingCareer?.forecastRegulationImpact?.(state) || [];
    const actions = livingCareer?.recommendActions?.(state) || [];
    const projection = livingCareer?.projectMultiSeason?.(state) || [];
    state.quality = state.quality || {};
    state.quality.livingCareerReview = { board, regulation:reg, actions, projection, generatedAt:new Date().toISOString() };
    const topRisk = reg.slice().sort((a,b)=>(b.risk||0)-(a.risk||0))[0];
    addInboxMessage('board','Conselho da Equipe',`Revisão do conselho: ${board.status || 'n/d'}`, `Confiança ${board.confidence || 0}/100. Próxima ação: ${actions[0]?.title || 'manter plano'}. ${topRisk ? 'Risco regulatório: '+topRisk.label+' ('+topRisk.risk+'/100).' : ''}`, { confidence:board.confidence || 0 });
    saveState(); renderTab('system'); updateHud();
  }


  function backendLaunchMiniHTML(){
    const audit = backendLaunch?.audit?.({ state }) || { score:0, passed:0, failed:1, status:{ launchScore:0, channels:[], platforms:[], telemetry:'n/d', cloudSave:'n/d' }, checks:[] };
    const status = audit.status || backendLaunch?.status?.(state) || { launchScore:0, channels:[], platforms:[], cloudSave:'n/d', telemetry:'n/d', liveOps:'n/d' };
    const consent = state.privacy?.telemetryConsent ? 'consentido' : 'desligado por padrão';
    return `<p><b>${audit.score}/100</b> • ${audit.passed} aprovados • ${audit.failed} pendentes</p><div class="backend-metric-grid"><span>Canais <b>${status.channels?.length || 0}</b></span><span>Plataformas <b>${status.platforms?.length || 0}</b></span><span>Cloud <b>${status.cloudSave || 'n/d'}</b></span><span>Telemetria <b>${consent}</b></span></div><p class="muted-small">Contas • cloud save • conflitos • crash report • remote config • rollback • privacidade • lojas • suporte • live ops</p>`;
  }

  function runBackendLaunchAudit(){
    ensureCareerSystems();
    const audit = backendLaunch?.audit?.({ state }) || { score:0, passed:0, failed:1, checks:[] };
    state.quality = state.quality || {};
    state.quality.backendLaunch = audit;
    addInboxMessage('qa','Backend e lançamento F17', audit.score >= 96 ? 'Fundação de lançamento aprovada' : 'Fundação de lançamento requer revisão', `Fase 17: ${audit.score}/100 • contas, cloud save, telemetria consentida, crash report, config remota, rollback e live ops.`, { score:audit.score });
    saveState(); renderTab('system'); updateHud();
  }

  function prepareReleaseCandidate(){
    ensureCareerSystems();
    const rc = backendLaunch?.prepareReleaseCandidate?.(state, { buildCode:DATA.build?.build_code || 'dev' }) || { candidate:'RC-LOCAL', checklist:[] };
    state.quality = state.quality || {};
    state.quality.releaseCandidate = rc;
    const pendingAssets = (rc.checklist || []).filter(item => item.type === 'asset' && !item.done).length;
    addInboxMessage('release','Preparação de lançamento',`Candidato ${rc.candidate || 'RC local'} preparado`, `${rc.checklist?.length || 0} itens no checklist. Assets pendentes: ${pendingAssets}. Backend real permanece por adaptador, sem expor segredos no cliente.`, { candidate:rc.candidate });
    saveState(); renderTab('system'); updateHud();
  }

  function toggleTelemetryConsent(){
    ensureCareerSystems();
    const granted = !Boolean(state.privacy?.telemetryConsent);
    const privacy = backendLaunch?.setTelemetryConsent?.(state, granted, { buildCode:DATA.build?.build_code || 'dev' }) || { telemetryConsent:granted };
    addInboxMessage('privacy','Consentimento de telemetria', granted ? 'Telemetria consentida localmente' : 'Telemetria desligada', `Status: ${privacy.telemetryConsent ? 'ativo com consentimento' : 'inativo por padrão'}. Nenhum dado é vendido e nenhum envio real ocorre sem backend configurado.`, { telemetryConsent:privacy.telemetryConsent });
    saveState(); renderTab('system'); updateHud();
  }


  function releaseCandidateMiniHTML(){
    const audit = releaseCandidate?.audit?.({ state, buildCode:DATA.build?.build_code || 'dev' }) || { score:0, passed:0, failed:1, status:{ channel:'n/d', physicalDevices:0, stores:0, blockers:1 }, checks:[] };
    const status = audit.status || releaseCandidate?.status?.(state) || { channel:'n/d', physicalDevices:0, stores:0, blockers:0, packageReady:false };
    return `<p><b>${audit.score}/100</b> • ${audit.passed} aprovados • ${audit.failed} pendentes</p><div class="release-metric-grid"><span>Canal <b>${status.channel || 'RC'}</b></span><span>Aparelhos <b>${status.physicalDevices || 0}</b></span><span>Lojas <b>${status.stores || 0}</b></span><span>Bloqueios <b>${status.blockers || 0}</b></span></div><p class="muted-small">Homologação física • lojas • privacidade • suporte • jurídico • pacote final • performance real</p>`;
  }

  function runReleaseCandidateAudit(){
    ensureCareerSystems();
    const audit = releaseCandidate?.audit?.({ state, buildCode:DATA.build?.build_code || 'dev' }) || { score:0, passed:0, failed:1, checks:[] };
    state.quality = state.quality || {};
    state.quality.releaseCandidateF18 = audit;
    addInboxMessage('qa','Release Candidate F18', audit.score >= 96 ? 'RC comercial aprovado para revisão manual' : 'RC comercial requer revisão', `Fase 18: ${audit.score}/100 • homologação física, lojas, privacidade, suporte, jurídico e pacote final.`, { score:audit.score });
    saveState(); renderTab('system'); updateHud();
  }

  function prepareCommercialPackage(){
    ensureCareerSystems();
    const pkg = releaseCandidate?.prepareCommercialPackage?.(state, { buildCode:DATA.build?.build_code || 'dev', version:DATA.build?.version || 'dev' }) || { packageId:'F1M-RC-LOCAL', blockers:[] };
    state.quality = state.quality || {};
    state.quality.commercialPackage = pkg;
    addInboxMessage('release','Pacote comercial RC', pkg.blockers?.length ? 'Pacote preparado com pendências' : 'Pacote final preparado', `${pkg.packageId || 'RC local'} • ${pkg.files?.length || 0} artefatos lógicos • ${pkg.blockers?.length || 0} bloqueios.`, { packageId:pkg.packageId });
    saveState(); renderTab('system'); updateHud();
  }

  function exportStoreChecklist(){
    ensureCareerSystems();
    const checklist = releaseCandidate?.storeChecklist?.(state, { buildCode:DATA.build?.build_code || 'dev' }) || [];
    state.quality = state.quality || {};
    state.quality.storeChecklistF18 = { generatedAt:new Date().toISOString(), items:checklist };
    addInboxMessage('release','Checklist de lojas', 'Checklist comercial atualizado', `${checklist.length} itens para PWA, Android, iOS e Windows. Requer revisão jurídica antes de publicação.`, { items:checklist.length });
    saveState(); renderTab('system'); updateHud();
  }

  function deploymentMiniHTML(){
    const st = deployValidation?.status?.(state, { buildCode:DATA.build?.build_code || 'dev' }) || { score:0, envs:0, docs:0, blockers:0, channel:'n/d', productionBlocked:true };
    const audit = state.quality?.deploymentF19;
    return `<p><b>${audit?.score ?? st.score}/100</b> • ${st.channel}</p><p>Ambientes: <b>${st.envs}</b> • docs assets: <b>${st.docs}</b> • bloqueios: <b>${st.blockers}</b></p><p class="muted-small">Produção ${st.productionBlocked ? 'bloqueada por segurança' : 'liberável'} até restaurar assets e validar preview.</p>`;
  }
  function runDeploymentAudit(){
    ensureCareerSystems();
    const audit = deployValidation?.audit?.({ state, buildCode:DATA.build?.build_code || 'dev' }) || { score:0, passed:0, failed:1, checks:[] };
    state.quality = state.quality || {};
    state.quality.deploymentF19 = { status:audit.failed ? 'review' : 'approved', score:audit.score, passed:audit.passed, failed:audit.failed, checks:audit.checks, generatedAt:audit.generatedAt };
    addInboxMessage('qa','Deploy F19', audit.failed ? 'Deploy requer revisão' : 'Deploy seguro validado', `Fase 19: ${audit.score}/100 • ${audit.passed} checks aprovados e ${audit.failed} pendentes.`, { score:audit.score });
    saveState(); renderTab('system'); updateHud();
  }
  function preparePublicBeta(){
    ensureCareerSystems();
    const pkg = deployValidation?.preparePublicBeta?.(state, { buildCode:DATA.build?.build_code || 'dev' }) || { packageId:'F1M3D-F19-LOCAL', blockers:[] };
    state.quality = state.quality || {};
    state.quality.publicBetaF19 = pkg;
    addInboxMessage('qa','Beta público controlado F19','Pacote lógico preparado',`${pkg.packageId} • publicação final segue bloqueada até assets, preview, dispositivos e jurídico.`,{ pkg });
    saveState(); renderTab('system'); updateHud();
  }
  function generateAssetRestorePlan(){
    ensureCareerSystems();
    const plan = deployValidation?.assetRestorePlan?.(state, { buildCode:DATA.build?.build_code || 'dev' }) || { requiredDocs:[], samplePaths:[], restoreSteps:[] };
    state.quality = state.quality || {};
    state.quality.assetRestorePlanF19 = plan;
    addInboxMessage('qa','Plano de assets F19','Caminhos preservados',`Plano gerado com ${plan.requiredDocs.length} documentos e ${plan.samplePaths.length} caminhos de amostra.`,{ plan });
    saveState(); renderTab('system'); updateHud();
  }

  function operationsMiniHTML(){
    const st = operationsSystem?.status?.(state, { buildCode:DATA.build?.build_code || 'dev' }) || { score:0, channel:'n/d', feedbackCount:0, critical:0, high:0, devices:0, productionBlocked:true };
    const audit = state.quality?.operationsF20;
    return `<p><b>${audit?.score ?? st.score}/100</b> • ${st.channel}</p><p>Feedbacks: <b>${st.feedbackCount}</b> • críticos: <b>${st.critical}</b> • altos: <b>${st.high}</b> • aparelhos: <b>${st.devices}</b></p><p class="muted-small">Coleta local, triagem, hotfix e rollback. Produção permanece bloqueada por segurança.</p>`;
  }
  function runOperationsAudit(){
    ensureCareerSystems();
    const audit = operationsSystem?.audit?.({ state, buildCode:DATA.build?.build_code || 'dev' }) || { score:0, passed:0, failed:1, checks:[] };
    state.quality = state.quality || {};
    state.quality.operationsF20 = { status:audit.failed ? 'review' : 'approved', score:audit.score, passed:audit.passed, failed:audit.failed, checks:audit.checks, generatedAt:audit.generatedAt };
    addInboxMessage('qa','Operação beta F20', audit.failed ? 'Operação requer revisão' : 'Operação beta validada', `Fase 20: ${audit.score}/100 • ${audit.passed} checks aprovados e ${audit.failed} pendentes.`, { score:audit.score });
    saveState(); renderTab('system'); updateHud();
  }
  function addBetaFeedbackSample(){
    ensureCareerSystems();
    const item = operationsSystem?.addFeedback?.(state, { category:'mobile-scroll', severity:'high', screen:'Criar Carreira', description:'Validação manual: checar rolagem, caminhos de imagem e botões de toque no beta.', device:navigator.userAgent || 'browser', language:i18nManager?.getLanguage?.() || 'pt-BR' }, { buildCode:DATA.build?.build_code || 'dev' }) || null;
    addInboxMessage('qa','Feedback beta F20','Feedback local registrado', item ? `${item.id} • ${item.category} • ${item.severity}` : 'Sistema de feedback indisponível.', { item });
    saveState(); renderTab('system'); updateHud();
  }
  function prepareHotfixPlan(){
    ensureCareerSystems();
    const plan = operationsSystem?.prepareHotfixPlan?.(state, { buildCode:DATA.build?.build_code || 'dev' }) || { id:'F20-HOTFIX-LOCAL', blockers:['sistema indisponível'], artifacts:[], gates:[] };
    state.quality = state.quality || {};
    state.quality.hotfixPlanF20 = plan;
    addInboxMessage('qa','Plano de hotfix F20','Hotfix controlado preparado', `${plan.id} • ${plan.artifacts?.length || 0} artefatos • ${plan.blockers?.length || 0} bloqueios.`, { plan });
    saveState(); renderTab('system'); updateHud();
  }

  function assetRestoreMiniHTML(){
    const st = assetRestoreSystem?.status?.(state, { buildCode:DATA.build?.build_code || 'dev', catalog:ASSET_CATALOG }) || { score:0, channel:'n/d', cataloguedPaths:0, originalBinaryFiles:0, restoreSteps:0, previewTargets:0, knownMissing:0, productionBlocked:true };
    const audit = state.quality?.assetRestoreF21;
    return `<p><b>${audit?.score ?? st.score}/100</b> • ${st.channel}</p><p>Caminhos: <b>${st.cataloguedPaths}</b> • binários originais: <b>${st.originalBinaryFiles}</b> • passos: <b>${st.restoreSteps}</b> • preview: <b>${st.previewTargets}</b></p><p class="muted-small">Produção bloqueada até restaurar assets reais, limpar cache PWA e validar GitHub/Vercel/mobile.</p>`;
  }
  function runAssetRestoreAudit(){
    ensureCareerSystems();
    const audit = assetRestoreSystem?.audit?.({ state, buildCode:DATA.build?.build_code || 'dev', catalog:ASSET_CATALOG }) || { score:0, passed:0, failed:1, checks:[] };
    state.quality = state.quality || {};
    state.quality.assetRestoreF21 = { status:audit.failed ? 'review' : 'approved', score:audit.score, passed:audit.passed, failed:audit.failed, checks:audit.checks, generatedAt:audit.generatedAt };
    addInboxMessage('qa','Assets reais F21', audit.failed ? 'Restauração requer revisão' : 'Restauração guiada validada', `Fase 21: ${audit.score}/100 • ${audit.passed} checks aprovados e ${audit.failed} pendentes.`, { score:audit.score });
    saveState(); renderTab('system'); updateHud();
  }
  function prepareGuidedAssetRestore(){
    ensureCareerSystems();
    const plan = assetRestoreSystem?.buildPlan?.(state, { buildCode:DATA.build?.build_code || 'dev', catalog:ASSET_CATALOG }) || { id:'F21-ASSETS-LOCAL', requiredDocs:[], restoreSteps:[], samplePaths:[], blocker:'sistema indisponível' };
    state.quality = state.quality || {};
    state.quality.assetRestorePlanF21 = plan;
    addInboxMessage('qa','Plano de assets F21','Restauração guiada preparada', `${plan.id} • ${plan.restoreSteps?.length || 0} passos • ${plan.samplePaths?.length || 0} caminhos de amostra.`, { plan });
    saveState(); renderTab('system'); updateHud();
  }
  function verifyAssetPreview(){
    ensureCareerSystems();
    const health = assetRestoreSystem?.previewHealth?.(state, { buildCode:DATA.build?.build_code || 'dev', catalog:ASSET_CATALOG }) || { previewTargets:[], runtimeSamples:[], productionAllowed:false };
    state.quality = state.quality || {};
    state.quality.assetPreviewF21 = health;
    addInboxMessage('qa','Preview F21','Verificação manual registrada', `Targets: ${health.previewTargets?.length || 0} • samples: ${health.runtimeSamples?.length || 0} • produção bloqueada.`, { health });
    saveState(); renderTab('system'); updateHud();
  }



  function visualHotfixMiniHTML(){
    const st = visualHotfix?.status?.(state, { buildCode:DATA.build?.build_code || 'dev' }) || { score:0, channel:'n/d', screenCount:0, scrollCount:0, backgrounds:0, evidence:0, productionBlocked:true };
    const audit = state.quality?.visualHotfixF22;
    return `<p><b>${audit?.score ?? st.score}/100</b> • ${st.channel}</p><p>Telas: <b>${st.screenCount}</b> • rolagem: <b>${st.scrollCount}</b> • fundos: <b>${st.backgrounds}</b> • evidências: <b>${st.evidence}</b></p><p class="muted-small">Scroll PC/mobile • paths visíveis • fundos restauráveis • beta público com assets reais.</p>`;
  }
  function runVisualHotfixAudit(){
    ensureCareerSystems();
    const audit = visualHotfix?.audit?.({ state, buildCode:DATA.build?.build_code || 'dev' }) || { score:0, passed:0, failed:1, checks:[] };
    state.quality = state.quality || {};
    state.quality.visualHotfixF22 = { status:audit.failed ? 'review' : 'approved', score:audit.score, passed:audit.passed, failed:audit.failed, checks:audit.checks, generatedAt:audit.generatedAt };
    visualHotfix?.applyHotfixes?.(document, { buildCode:DATA.build?.build_code || 'dev' });
    addInboxMessage('qa','Hotfix visual F22', audit.failed ? 'Hotfix visual requer revisão' : 'Hotfix visual validado', `Fase 22: ${audit.score}/100 • ${audit.passed} checks aprovados e ${audit.failed} pendentes.`, { score:audit.score });
    saveState(); renderTab('system'); updateHud();
  }
  function recordVisualEvidence(){
    ensureCareerSystems();
    const ev = visualHotfix?.recordEvidence?.(state, { id:'manual-scroll-asset-check', label:'Validação manual de scroll e caminhos de assets', status:'pending-physical-device' }, { buildCode:DATA.build?.build_code || 'dev' }) || null;
    addInboxMessage('qa','Evidência visual F22','Checklist registrado', ev ? `${ev.id} • ${ev.status}` : 'Sistema visual indisponível.', { ev });
    saveState(); renderTab('system'); updateHud();
  }



  function publicBetaAssetsMiniHTML(){
    const st = publicBetaAssets?.status?.(state, { buildCode:DATA.build?.build_code || 'dev', catalog:ASSET_CATALOG }) || { score:0, channel:'n/d', groupCount:0, previewCount:0, evidenceCount:0, productionBlocked:true };
    const audit = state.quality?.publicBetaAssetsF23;
    return `<p><b>${audit?.score ?? st.score}/100</b> • ${st.channel}</p><p>Grupos: <b>${st.groupCount}</b> • preview: <b>${st.previewCount}</b> • evidências: <b>${st.evidenceCount}</b> • paths: <b>${st.cataloguedPaths || 0}</b></p><p class="muted-small">Beta público F23: GitHub/Vercel, assets reais restaurados, cache PWA limpo e produção bloqueada até validação manual.</p>`;
  }
  function runPublicBetaAssetsAudit(){
    ensureCareerSystems();
    const audit = publicBetaAssets?.audit?.({ state, buildCode:DATA.build?.build_code || 'dev', catalog:ASSET_CATALOG }) || { score:0, passed:0, failed:1, checks:[] };
    state.quality = state.quality || {};
    state.quality.publicBetaAssetsF23 = { status:audit.failed ? 'review' : 'approved', score:audit.score, passed:audit.passed, failed:audit.failed, checks:audit.checks, generatedAt:audit.generatedAt };
    addInboxMessage('qa','Beta assets reais F23', audit.failed ? 'Beta público requer revisão' : 'Beta público validado para preview controlado', `Fase 23: ${audit.score}/100 • ${audit.passed} checks aprovados e ${audit.failed} pendentes.`, { score:audit.score });
    saveState(); renderTab('system'); updateHud();
  }
  function preparePublicBetaAssetsPreview(){
    ensureCareerSystems();
    const plan = publicBetaAssets?.previewPlan?.(state, { buildCode:DATA.build?.build_code || 'dev', catalog:ASSET_CATALOG }) || { id:'F23-PREVIEW-LOCAL', restoreWorkflow:[], previewTargets:[], productionBlocked:true };
    state.quality = state.quality || {};
    state.quality.publicBetaPreviewPlanF23 = plan;
    addInboxMessage('qa','Plano preview F23','Plano de beta público preparado', `${plan.id} • ${plan.restoreWorkflow?.length || 0} passos • ${plan.previewTargets?.length || 0} alvos. Produção segue bloqueada.`, { plan });
    saveState(); renderTab('system'); updateHud();
  }
  function registerPublicBetaEvidence(){
    ensureCareerSystems();
    const ev = publicBetaAssets?.registerEvidence?.(state, { id:'manual-preview-evidence', label:'Print de preview GitHub/Vercel e assets reais', screen:'preview', status:'pending-upload-or-manual-check' }, { buildCode:DATA.build?.build_code || 'dev' }) || null;
    addInboxMessage('qa','Evidência beta F23','Evidência manual registrada', ev ? `${ev.id} • ${ev.status}` : 'Sistema F23 indisponível.', { ev });
    saveState(); renderTab('system'); updateHud();
  }

  function gameplayPolishMiniHTML(){
    const st = gameplayPolish?.status?.(state, { buildCode:DATA.build?.build_code || 'dev' }) || { score:0, profile:'n/d', profileLabel:'n/d', battleTriggers:0, hudSignals:0, productionBlocked:true };
    const audit = state.quality?.gameplayPolishF24;
    return `<p><b>${audit ? audit.score + '/100' : st.score + '/100'}</b> • ${st.profileLabel || st.profile}</p><p>${st.battleTriggers} gatilhos de batalha • ${st.hudSignals} sinais HUD</p><p class="muted-small">Pit wall • DRS • pneus • risco • agência do jogador • sem catch-up invisível</p>`;
  }
  function runGameplayPolishAudit(){
    ensureCareerSystems();
    const audit = gameplayPolish?.audit?.({ state, buildCode:DATA.build?.build_code || 'dev' }) || { score:0, passed:0, failed:1, checks:[] };
    state.quality = state.quality || {};
    state.quality.gameplayPolishF24 = { status:audit.failed ? 'review' : 'approved', score:audit.score, passed:audit.passed, failed:audit.failed, checks:audit.checks, generatedAt:audit.generatedAt };
    addInboxMessage('qa','Gameplay perfeita F24', audit.failed ? 'Gameplay requer revisão' : 'Gameplay aprovada para beta controlado', `Fase 24: ${audit.score}/100 • ${audit.passed} checks aprovados e ${audit.failed} pendentes.`, { score:audit.score });
    saveState(); renderTab('system'); updateHud();
  }
  function registerGameplayEvidence(){
    ensureCareerSystems();
    const ev = gameplayPolish?.registerEvidence?.(state, { id:'manual-gameplay-race-test', label:'Teste manual: batalha, pit wall, pneus e ritmo de corrida', screen:'race', status:'pending-physical-device' }, { buildCode:DATA.build?.build_code || 'dev' }) || null;
    addInboxMessage('qa','Evidência gameplay F24','Teste manual registrado', ev ? `${ev.id} • ${ev.status}` : 'Sistema F24 indisponível.', { ev });
    saveState(); renderTab('system'); updateHud();
  }
  function toggleGameplayProfile(){
    ensureCareerSystems();
    const order = ['realistic','cinematic','hardcore'];
    state.gameplayPolish = state.gameplayPolish || { profile:'realistic' };
    const idx = order.indexOf(state.gameplayPolish.profile || 'realistic');
    state.gameplayPolish.profile = order[(idx+1+order.length)%order.length];
    addInboxMessage('qa','Gameplay F24','Perfil de gameplay alterado', `Perfil ativo: ${state.gameplayPolish.profile}. Realista preserva simulação, cinematográfico aumenta batalhas e hardcore aumenta risco.`, { profile:state.gameplayPolish.profile });
    saveState(); renderTab('system'); updateHud();
  }


  function telemetryMiniHTML(){
    const st = telemetrySystem?.status?.(state, { buildCode:DATA.build?.build_code || 'dev' }) || { score:0, signals:0, diagnosis:0, views:0, hz:0, samples:0, productionBlocked:true };
    const audit = state.quality?.telemetryF25;
    return `<p><b>${audit ? audit.score + '/100' : st.score + '/100'}</b> • ${st.signals} sinais • ${st.hz}Hz lógico</p><p>${st.diagnosis} regras de diagnóstico • ${st.views} visões de engenharia • ${st.samples} pacotes locais</p><p class="muted-small">RPM • marcha • acelerador/freio • pneus superfície/carcaça/pressão • freios • combustível • ERS/DRS • ar sujo • delta por setor</p>`;
  }
  function runTelemetryAudit(){
    ensureCareerSystems();
    const audit = telemetrySystem?.audit?.({ state, buildCode:DATA.build?.build_code || 'dev' }) || { score:0, passed:0, failed:1, checks:[] };
    state.quality = state.quality || {};
    state.quality.telemetryF25 = { status:audit.failed ? 'review' : 'approved', score:audit.score, passed:audit.passed, failed:audit.failed, checks:audit.checks, generatedAt:audit.generatedAt };
    addInboxMessage('qa','Telemetria realista F25', audit.failed ? 'Telemetria requer revisão' : 'Telemetria técnica aprovada', `Fase 25: ${audit.score}/100 • ${audit.passed} checks aprovados e ${audit.failed} pendentes. Sinais: RPM, marcha, pneus, freios, combustível, ERS/DRS, ar sujo e delta por setor.`, { score:audit.score });
    saveState(); renderTab('system'); updateHud();
  }
  function runTelemetryDiagnosis(){
    ensureCareerSystems();
    const entry = race?.entries?.filter(e=>isPlayerDriver(e.driver.short)).sort((a,b)=>a.pos-b.pos)[0] || null;
    const diagnosis = entry ? telemetrySystem?.diagnose?.(entry, race, { state, sample:entry.telemetry, buildCode:DATA.build?.build_code || 'dev' }) : null;
    const top = diagnosis?.top || { label:'sem corrida ativa', advice:'inicie uma corrida para gerar telemetria realista' };
    addInboxMessage('engenharia','Engenheiro de corrida F25', top.label, top.advice, { diagnosis });
    saveState(); renderTab('system'); updateHud();
  }
  function exportTelemetrySession(){
    ensureCareerSystems();
    const session = telemetrySystem?.exportSession?.(state, race || {}, { buildCode:DATA.build?.build_code || 'dev' }) || { format:'F1M_TELEMETRY_SESSION_V1', samples:[] };
    state.quality = state.quality || {};
    state.quality.lastTelemetryExport = { generatedAt:session.generatedAt || new Date().toISOString(), samples:session.samples?.length || 0, raceName:session.raceName || 'sem corrida' };
    addInboxMessage('engenharia','Exportação de telemetria F25','Sessão de telemetria preparada', `${session.samples?.length || 0} pacotes • ${session.diagnosis?.length || 0} diagnósticos • formato ${session.format}.`, { telemetryExport:session });
    saveState(); renderTab('system'); updateHud();
  }
  function setupEngineeringMiniHTML(){
    const st = setupEngineering?.status?.(state, { buildCode:DATA.build?.build_code || 'dev' }) || { score:0, parameters:0, programmes:0, correlations:0, practiceRuns:0, productionBlocked:true };
    const audit = state.quality?.setupEngineeringF26;
    return `<p><b>${audit?.score ?? st.score}/100</b> • ${st.parameters} parâmetros • ${st.programmes} programas de treino</p><p>${st.correlations} correlações telemétricas • ${st.practiceRuns} treinos registrados</p><p class="muted-small">Asa • altura • suspensão • cambagem • toe • diferencial • brake bias • pressão • motor</p>`;
  }

  function currentSetupEngineeringContext(){
    const track = activeCalendar()?.[state.roundIndex || 0] || { name:'GP de teste' };
    const baseSetup = state.setupEngineering?.activeSetup || setupEngineering?.defaultSetup?.() || {};
    const sample = race?.entries?.find(e => driversForTeam(state.currentTeam).some(d => d.short === e.driver?.short))?.telemetry || {};
    return { track, baseSetup, sample };
  }

  function runSetupEngineeringAudit(){
    state.setupEngineering = state.setupEngineering || {};
    const audit = setupEngineering?.audit?.({ state, buildCode:DATA.build?.build_code || 'dev' }) || { score:0, passed:0, failed:1, checks:[] };
    state.quality = state.quality || {};
    state.quality.setupEngineeringF26 = { status:audit.failed ? 'review' : 'approved', score:audit.score, passed:audit.passed, failed:audit.failed, checks:audit.checks, generatedAt:audit.generatedAt };
    addInboxMessage('engenharia','Setup avançado F26', audit.failed ? 'Setup requer revisão' : 'Setup técnico aprovado', `Fase 26: ${audit.score}/100 • ${audit.passed} checks aprovados e ${audit.failed} pendentes.`, { score:audit.score });
    saveState(); renderTab('system'); updateHud();
  }

  function runSetupCorrelation(){
    state.setupEngineering = state.setupEngineering || {};
    const { track, baseSetup, sample } = currentSetupEngineeringContext();
    const result = setupEngineering?.correlateTelemetry?.(baseSetup, sample, track, { state, buildCode:DATA.build?.build_code || 'dev' }) || { top:{ label:'sem dados', advice:'inicie uma corrida ou simule um treino' }, issues:[] };
    state.setupEngineering.lastCorrelation = result;
    state.setupEngineering.correlationHistory = Array.isArray(state.setupEngineering.correlationHistory) ? state.setupEngineering.correlationHistory : [];
    state.setupEngineering.correlationHistory.unshift(result);
    state.setupEngineering.correlationHistory = state.setupEngineering.correlationHistory.slice(0,20);
    addInboxMessage('engenharia','Correlação setup/telemetria F26', result.top?.label || 'correlação preparada', result.top?.advice || 'Use treino livre para aumentar confiança de acerto.', { setupCorrelation:result });
    saveState(); renderTab('system'); updateHud();
  }

  function simulateSetupPractice(){
    state.setupEngineering = state.setupEngineering || {};
    const { track, baseSetup } = currentSetupEngineeringContext();
    const sequence = ['baseline','long-run','qualy-sim','race-start'];
    const next = sequence[(state.setupEngineering.practiceRuns?.length || 0) % sequence.length];
    const practice = setupEngineering?.simulatePractice?.(next, baseSetup, track, { state, buildCode:DATA.build?.build_code || 'dev' }) || { label:'Treino', setupScore:0, confidence:0, lapDelta:0, recommendation:'sem módulo' };
    state.setupEngineering.practiceRuns = Array.isArray(state.setupEngineering.practiceRuns) ? state.setupEngineering.practiceRuns : [];
    state.setupEngineering.practiceRuns.unshift(practice);
    state.setupEngineering.practiceRuns = state.setupEngineering.practiceRuns.slice(0,20);
    addInboxMessage('engenharia','Treino livre F26', `${practice.label}: confiança ${practice.confidence}/100`, `Score setup ${practice.setupScore}/100 • delta estimado ${practice.lapDelta}s • recomendação: ${practice.recommendation}.`, { practice });
    saveState(); renderTab('system'); updateHud();
  }

  function tyreStintMiniHTML(){
    const st = tyreStint?.status?.(state, { buildCode:DATA.build?.build_code || 'dev' }) || { score:0, compounds:0, signals:0, factors:0, analyses:0, productionBlocked:true };
    const audit = state.quality?.tyreStintF27;
    return `<p><b>${st.score}/100</b> • ${st.compounds} compostos • ${st.signals} sinais</p><p>Fatores: <b>${st.factors}</b> • análises: <b>${st.analyses}</b></p><p class="muted-small">graining, blistering, flat spot, pressão, janela térmica, undercut e overcut. ${audit ? `Último: ${audit.score}/100` : 'Ainda não auditado.'}</p>`;
  }

  function runTyreStintAudit(){
    state.tyreStint = state.tyreStint || {};
    const audit = tyreStint?.audit?.({ state, buildCode:DATA.build?.build_code || 'dev' }) || { score:0, passed:0, failed:1, checks:[] };
    state.quality = state.quality || {};
    state.quality.tyreStintF27 = { status:audit.failed ? 'review' : 'approved', score:audit.score, passed:audit.passed, failed:audit.failed, checks:audit.checks, generatedAt:audit.generatedAt, productionBlocked:true };
    addInboxMessage('engenharia','Pneus e stint F27', audit.failed ? 'Pneus requerem revisão' : 'Engenharia de pneus aprovada', `Fase 27: ${audit.score}/100 • ${audit.passed} checks aprovados e ${audit.failed} pendentes.`, { score:audit.score });
    saveState(); renderTab('system');
  }

  function runTyreStintAnalysis(){
    state.tyreStint = state.tyreStint || {};
    const player = race?.entries?.find(e => driversForTeam(state.currentTeam).some(d => d.short === e.driver?.short));
    const input = player ? { compound:player.compound, ageLaps:Math.max(0, (race.tick||0)/80), wearPct:100-(player.tyre||75), surfaceTempC:player.telemetry?.tyreSurfaceC, carcassTempC:player.telemetry?.tyreCarcassC, pressurePsi:player.telemetry?.pressurePsi || 22.4, dirtyAirPct:player.telemetry?.dirtyAirPct || 0, fuelKg:player.fuel || 45, slidingEnergy:player.telemetry?.lateralG ? Math.abs(player.telemetry.lateralG)*18 : 35 } : { compound:selectedCompound || 'medium', ageLaps:8, wearPct:28, surfaceTempC:103, carcassTempC:98, pressurePsi:22.7, dirtyAirPct:15, fuelKg:48, slidingEnergy:42 };
    const analysis = tyreStint?.analyseTyre?.(input, { state, buildCode:DATA.build?.build_code || 'dev' }) || null;
    if(analysis){
      state.tyreStint.analysisHistory = Array.isArray(state.tyreStint.analysisHistory) ? state.tyreStint.analysisHistory : [];
      state.tyreStint.analysisHistory.unshift(analysis);
      state.tyreStint.analysisHistory = state.tyreStint.analysisHistory.slice(0,30);
      addInboxMessage('engenharia','Análise de stint F27', `${analysis.compoundLabel}: saúde ${analysis.tyreHealth}/100`, `Deg ${analysis.degradationPerLap}s/volta • cliff ${analysis.cliffRisk}% • graining ${analysis.grainingPct}% • blistering ${analysis.blisteringPct}% • janela ${analysis.window}.`, { tyreAnalysis:analysis });
    }
    saveState(); renderTab('system');
  }

  function prepareTyrePitPlan(){
    state.tyreStint = state.tyreStint || {};
    const player = race?.entries?.find(e => driversForTeam(state.currentTeam).some(d => d.short === e.driver?.short));
    const currentLap = race ? Math.max(1, Math.round((race.tick||0)/80)) : Math.max(1, (state.completedRaces||0)+1);
    const plan = tyreStint?.planStint?.({ compound:player?.compound || selectedCompound || 'medium', currentLap, lapsTotal:race?.laps || activeCalendar()?.[state.roundIndex||0]?.laps || 50, ageLaps:player ? Math.max(0,(race.tick||0)/80) : 10, wearPct:player ? 100-(player.tyre||74) : 34, surfaceTempC:player?.telemetry?.tyreSurfaceC || 101, carcassTempC:player?.telemetry?.tyreCarcassC || 96, pressurePsi:player?.telemetry?.pressurePsi || 22.5, dirtyAirPct:player?.telemetry?.dirtyAirPct || 8, fuelKg:player?.fuel || 52 }, { state, buildCode:DATA.build?.build_code || 'dev' }) || null;
    const advice = plan ? tyreStint?.pitWallAdvice?.(plan, { state, buildCode:DATA.build?.build_code || 'dev' }) : null;
    if(plan){
      state.tyreStint.activePlans = Array.isArray(state.tyreStint.activePlans) ? state.tyreStint.activePlans : [];
      state.tyreStint.activePlans.unshift({ ...plan, advice });
      state.tyreStint.activePlans = state.tyreStint.activePlans.slice(0,20);
      addInboxMessage('pitwall','Plano de pit F27', advice?.label || 'Plano de stint preparado', `Pit recomendado volta ${plan.recommendedPitLap} • alvo ${plan.target} • confiança ${plan.confidence}/100. ${advice?.advice || ''}`, { tyrePitPlan:plan, tyreAdvice:advice });
    }
    saveState(); renderTab('system');
  }

  function telemetryLine(e){
    return telemetrySystem?.compactLine?.(e?.telemetry) || vehicleTelemetryText(e || {});
  }

  function vehicleTelemetryText(e){
    const snap = vehiclePhysics?.snapshot?.(e) || { tyreLife:e.tyre, fuelMass:e.fuel, reliabilityHealth:e.condition, ers:e.ers, drs:e.drs, brakeTemperature:e.brakeTemp, engineTemperature:e.engineTemp, damage:e.damage };
    return `${compoundLabel(e.compound)} ${Math.round(snap.tyreLife||0)}% • ${Math.round(snap.tyreTemperature||0)}°C • ERS ${Math.round(snap.ers||0)}%${snap.drs?' • DRS':''} • Freio ${Math.round(snap.brakeTemperature||0)}°C • Motor ${Math.round(snap.engineTemperature||0)}°C • Dano ${Math.round(snap.damage||0)} • Comb ${Math.round(snap.fuelMass||0)}%`;
  }
  function awardPolePointIfNeeded(driverShort){
    if(!driverShort || state.currentSeries !== 'F2' || state.weekend?.polePointAwardedFor === driverShort) return;
    ensureStandings();
    const st = currentStandings();
    if(st[driverShort]) st[driverShort].points += regulationEngine?.pointsForPosition?.(99,{series:'F2', pole:true}) || 2;
    state.weekend = {...(state.weekend||{}), polePointAwardedFor:driverShort};
  }
  function simulateSupportSession(type){
    if(!state.lastQualifying?.length){ simulateQualifying(); }
    const entries = (type === 'sprint' && regulationEngine?.sprintGridFromQualifying) ? regulationEngine.sprintGridFromQualifying(state.lastQualifying, state.currentSeries) : state.lastQualifying;
    const points = entries.slice(0, type === 'sprint' ? 8 : 10).map((r,i)=>({ pos:i+1, driver:r.driver, team:r.team, points:regulationEngine?.pointsForPosition?.(i+1,{series:state.currentSeries,eventType:type}) || 0 }));
    state.weekend = {...(state.weekend||{}), [type+'Complete']:true, [type+'Results']:points };
    ensureStandings();
    const st = currentStandings();
    points.forEach(r => { if(st[r.driver]) st[r.driver].points += r.points; });
    addInboxMessage('sporting','Direção de Prova',`${type === 'sprint' ? 'Sprint' : 'Feature'} simulada`,`${points.length} pilotos pontuaram conforme tabela oficial da categoria.`,{ type, points });
    saveState(); renderQualifying(); updateHud();
  }
  function officialRaceResults(raceObj){
    const classified = regulationEngine?.classifyRace?.(raceObj.entries, { series:state.currentSeries, eventType:state.currentSeries === 'F2' ? 'feature' : 'race' }) || raceObj.entries.map((e,i)=>({pos:i+1, driver:e.driver.short, team:e.team.id, points:DATA.points[i]||0}));
    return classified.map((r,i)=>{
      const e = raceObj.entries.find(x=>x.driver.short === r.driver) || {};
      const team = teamById(r.team) || e.team || {};
      return { pos:i+1, driver:r.driver, team:r.team, teamName:team.name || r.team, points:r.points || 0, pits:r.pits || e.pits || 0, tyre:r.tyre ?? Math.round(e.tyre||0), condition:r.condition ?? Math.round(e.condition||0), penaltySeconds:r.penaltySeconds || 0, status:r.status || 'classified', lastAction:e.lastAction || (r.penaltySeconds ? `+${r.penaltySeconds}s punição` : '') };
    });
  }

  function isPlayerDriver(short){ return driversForTeam(state.currentTeam).some(d=>d.short===short); }
  function cameraLabel(mode){ return ({tv:'TV dinâmica',follow:'Follow',overhead:'Helicóptero',onboard:'Onboard',pitwall:'Pit wall',replay:'Replay'})[mode] || 'TV dinâmica'; }


  function aiStrategyFor(d,t,currentRace,gridPos){
    const context = {
      series:activeSeries(),
      track:currentRace,
      regulation:regulationEngine?.activeSessionPlan?.(state.currentSeries, currentRace) || null,
      playerTeam:state.currentTeam,
      weather:currentRace?.weather || 'dry'
    };
    return strategyAI?.initialPlan?.(d,t,context,gridPos) || { plan:'balanced', startCompound:gridPos<6?'soft':'medium', stopBias:'balanced', aggressiveness:0.5, defenseBias:0.45, pitWindow:[Math.max(5,Math.floor((currentRace.laps||22)*.36)),Math.max(8,Math.floor((currentRace.laps||22)*.68))] };
  }
  function setupRace(quick){
    const currentRace = activeCalendar()[state.roundIndex] || activeCalendar()[0];
    const grid = (state.lastQualifying && state.lastQualifying.length) ? state.lastQualifying : generateGridPreview();
    const allDrivers = generateRaceDrivers();
    const driverMap = new Map(allDrivers.map(d=>[d.short,d]));
    const entries = grid.slice(0,22).map((g,i)=> {
      const d = driverMap.get(g.driver) || allDrivers[i]; const t = teamById(d.team);
      const car = d.team === state.currentTeam ? state.car : estimateCar(t);
      const isPlayer = d.team === state.currentTeam;
      const track = currentTrackProfile();
      const setupFx = isPlayer ? setupEffectFor(track,state.setup) : { tyreCare:0, reliability:0, label:'AI' };
      if(isPlayer && state.weekend){
        setupFx.tyreCare += ((state.weekend.tyreKnowledge||50)-50)/900;
        setupFx.reliability += ((state.weekend.setupConfidence||50)-50)/1600;
      }
      const strat = isPlayer ? (state.raceStrategy || { plan:'balanced', startCompound:selectedCompound||'soft' }) : aiStrategyFor(d,t,currentRace,i);
      const compound = strat.startCompound || (isPlayer ? selectedCompound : 'medium');
      const entry = { driver:d, team:t, pos:i+1, previousPos:i+1, gridPosition:g.gridPosition || i+1, lap:1, progress:i*-0.01, distance:0, tyre:100, fuel:100, condition:100, pits:0, pace:'normal', compound, plannedPitLap:recommendedPitLap(currentRace.laps||22,strat), baseSpeed:baseRaceSpeed(d,car,isPlayer)*compoundPaceMultiplier(compound)*(isPlayer && state.weekend?.qualyFocus==='racePace' ? 1.006 : 1), car, setupFx, color:t.color, secondary:t.secondary, finished:false, totalTime:0, incident:false, sector:1, gap:0, lastLap:1, lastAction:'', strategy:strat, aiIntent:'launch', pitQueueTimer:0, pitCrewStatus:'ready', penaltySeconds:0, attackCooldown:0, restartBoost:0 };
      if(vehiclePhysics) entry.vehicle = vehiclePhysics.initialState({ compound, fuel:100, condition:100, car, track:currentRace });
      return entry;
    });
    race = { quick, entries, laps:currentRace.laps || 22, trackState:vehiclePhysics?.trackState?.({ weather:currentRace.weather || 'dry', laps:currentRace.laps || 22 }) || null, visualModel:visualSystem?.createTrackModel?.(currentRace,{ width:window.innerWidth, height:window.innerHeight, dpr:window.devicePixelRatio || 1, weather:currentRace.weather || 'dry' }) || null, replayBuffer:visualSystem?.createReplayBuffer?.() || null, lastReplayCapture:0, speed:1, playerPace:driversForTeam(state.currentTeam).map(()=> 'normal'), started:Date.now(), weather:currentRace.weather || 'dry', tick:0, trackInfo:currentRace, safetyCar:0, vsc:0, redFlag:0, restartTimer:0, cameraMode:'tv', raceLog:['Largada autorizada — F27 ativo: simulador técnico com pneus, stint, telemetria e setup correlacionados.'], regulation:regulationEngine?.activeSessionPlan?.(state.currentSeries, currentRace) || null, strategyState:{ pitLaneBusy:0, redFlags:0, safetyCarDeployments:0, vscDeployments:0, lastNeutralizedAt:0 }, gameplayContext:null, lastGameplayAdvice:null };
    appEvents?.emit('race:created', { track:currentRace.name, laps:race.laps, entries:entries.length, quick:Boolean(quick) });
    updateRaceHud();
  }
  function estimateCar(t){ return rivalCarForTeam(t); }
  function baseRaceSpeed(d,car,isPlayer=false){ const score = racePerformanceScore(d,car,isPlayer); return 0.021 + score / 4700; }
  function requestPit(idx){ const ds = driversForTeam(state.currentTeam); const target = ds[idx]; if(!target || !race) return; const e = race.entries.find(x=>x.driver.short===target.short); if(e && !e.pitCooldown){ const carPit = e.car?.pitStop || state.car.pitStop || 55; const mech = (state.staff?.mechanics || 1) + (state.staff?.pitCrew || 1)*0.85; const pitLoss = Math.max(0.022, 0.074 - carPit/2300 - mech/950); vehiclePhysics?.pitService?.(e); e.baseSpeed = baseRaceSpeed(e.driver,e.car,isPlayerDriver(e.driver.short))*compoundPaceMultiplier(e.compound); e.condition = Math.min(100,e.condition+8+mech*.6); e.pits++; e.progress -= pitLoss; e.pitCooldown = 7; e.lastAction = `PIT -${Math.round(pitLoss*1000)/10}s`; updateRaceHud(); } }

  function ensureRaceEngine(){
    if(raceEngine || !CORE.race?.createEngine) return raceEngine;
    raceEngine = CORE.race.createEngine({
      update:dt => { if(race) updateRaceSimulation(dt); },
      render:() => { if(renderer3d && race) renderer3d.renderFrame(); },
      onError:(error,context) => reportRuntimeError(error, context),
      onState:status => appEvents?.emit('race:engine-state', status),
      maxDelta:.05
    });
    return raceEngine;
  }
  function stopRaceLoop(){
    ensureRaceEngine()?.stop('runtime-stop');
  }
  function startRaceLoop(){
    if(!race) return;
    const engine = ensureRaceEngine();
    if(engine?.isRunning()) return;
    engine?.start();
  }
  function stopRaceRuntime(){
    stopRaceLoop();
    if(renderer3d){ renderer3d.dispose(); renderer3d = null; }
  }
  function startRaceRenderer(){
    if(!race) setupRace(true);
    const stamp=document.getElementById('raceBuildStamp'); if(stamp) stamp.textContent=(DATA.build&&DATA.build.label)||'';
    stopRaceRuntime();
    const wrap = document.getElementById('raceCanvasWrap');
    const oldFallback = document.getElementById('raceRendererFallback');
    if(oldFallback) oldFallback.remove();
    if(typeof THREE === 'undefined'){
      if(wrap){
        const fallback = document.createElement('div');
        fallback.id = 'raceRendererFallback';
        fallback.className = 'glass-panel race-fallback';
        fallback.innerHTML = '<h2>Modo de simulação segura</h2><p>O motor 3D não carregou, mas a corrida continua normalmente pela telemetria, estratégia e placar. O resultado não depende da CDN gráfica.</p><p class="muted-small">F15 mantém pista, setores, DRS, replay lógico e áudio/UI procedural mesmo sem WebGL.</p>';
        wrap.appendChild(fallback);
      }
    } else {
      try { renderer3d = new TrackRenderer3D($('#raceCanvas'), race); }
      catch(error){ reportRuntimeError(error, 'TrackRenderer3D'); renderer3d = null; }
    }
    updateRaceHud();
    startRaceLoop();
  }

  class TrackRenderer3D{
    constructor(canvas,race){
      this.canvas=canvas; this.race=race; this.scene=new THREE.Scene(); this.scene.background=new THREE.Color(0x06101b);
      this.camera=new THREE.PerspectiveCamera(55, canvas.clientWidth/canvas.clientHeight, .1, 1000); this.camera.position.set(0,32,32); this.camera.lookAt(0,0,0);
      this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false}); this.renderer.setSize(canvas.clientWidth,canvas.clientHeight,false); this.renderer.setPixelRatio(Math.min(1.6,window.devicePixelRatio||1));
      this.cars=[]; this.replayTick=0; this.trackPoints=this.createTrackPoints(); this.visualModel=this.race.visualModel || visualSystem?.createTrackModel?.(this.race.trackInfo,{width:canvas.clientWidth,height:canvas.clientHeight,dpr:window.devicePixelRatio||1,weather:this.race.weather}) || null; this.applyElevationProfile(); this.addLights(); this.addTrack(); this.addProfessionalVisuals(); this.addEnvironment(); this.addCars(); this.onResize=()=>this.resize(); window.addEventListener('resize',this.onResize,{passive:true});
    }
    createTrackPoints(){
      const info = this.race.trackInfo || activeCalendar()[state.roundIndex] || {};
      const key = info.svgLayout || info.id;
      const layouts = window.F1M_TRACK_LAYOUTS || {};
      const layout = layouts[key];
      if(layout && Array.isArray(layout.points) && layout.points.length > 20){
        this.svgLayout = layout;
        return layout.points.map(p => new THREE.Vector3(p[0], 0, p[1]));
      }
      // Fallback: Miami-inspired compact street layout.
      const raw = [[-16,-7],[-12,-10],[-6,-11],[1,-10],[8,-7],[14,-4],[17,1],[14,6],[8,8],[2,7],[-3,4],[-8,3],[-14,5],[-18,2],[-19,-3]];
      const pts=[];
      for(let i=0;i<raw.length;i++){
        const a=raw[i], b=raw[(i+1)%raw.length];
        for(let j=0;j<12;j++){
          const t=j/12; pts.push(new THREE.Vector3(a[0]*(1-t)+b[0]*t,0,a[1]*(1-t)+b[1]*t));
        }
      }
      const curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal', 0.45);
      return curve.getPoints(260);
    }
    addLights(){
      this.scene.add(new THREE.HemisphereLight(0xcfeaff,0x19332e,1.25));
      const d=new THREE.DirectionalLight(0xffffff,2.2); d.position.set(-18,34,20); this.scene.add(d);
      const fill=new THREE.DirectionalLight(0xff4b4b,.55); fill.position.set(18,12,-16); this.scene.add(fill);
    }
    addTrack(){
      const info = this.race.trackInfo || {};
      const theme = info.track || 'classic';
      const groundColor = theme === 'desert' ? 0x8a6a3a : theme === 'street' ? 0x174a4b : theme === 'park' ? 0x1d6336 : 0x22513f;
      const grass=new THREE.Mesh(new THREE.PlaneGeometry(82,54), new THREE.MeshStandardMaterial({color:groundColor,roughness:.9}));
      grass.rotation.x=-Math.PI/2; grass.position.y=-.08; this.scene.add(grass);
      const water=new THREE.Mesh(new THREE.PlaneGeometry(22,58), new THREE.MeshStandardMaterial({color:0x0097bd,roughness:.28,metalness:.08}));
      water.rotation.x=-Math.PI/2; water.position.set(-31,-.06,0); this.scene.add(water);
      const roadMat=new THREE.MeshStandardMaterial({color:0x16181d,roughness:.38,metalness:.04});
      const edgeMat=new THREE.MeshStandardMaterial({color:0xdfe7ef,roughness:.52});
      const curbRed=new THREE.MeshStandardMaterial({color:0xd10012,roughness:.42});
      const curbWhite=new THREE.MeshStandardMaterial({color:0xf5f5f0,roughness:.42});
      const barrierMat=new THREE.MeshStandardMaterial({color:0x9aa3b3,roughness:.5,metalness:.15});
      const width=this.visualModel?.worldWidth || 4.85, edgeWidth=.18;
      const roadVerts=[], roadIdx=[], leftEdge=[], rightEdge=[];
      for(let i=0;i<this.trackPoints.length;i++){
        const p=this.trackPoints[i];
        const prev=this.trackPoints[(i-1+this.trackPoints.length)%this.trackPoints.length];
        const next=this.trackPoints[(i+1)%this.trackPoints.length];
        const dir=next.clone().sub(prev).normalize();
        const normal=new THREE.Vector3(-dir.z,0,dir.x).normalize();
        const l=p.clone().add(normal.clone().multiplyScalar(width/2));
        const r=p.clone().add(normal.clone().multiplyScalar(-width/2));
        roadVerts.push(l.x,.02,l.z,r.x,.02,r.z);
        leftEdge.push(l); rightEdge.push(r);
      }
      for(let i=0;i<this.trackPoints.length;i++){
        const a=i*2,b=((i+1)%this.trackPoints.length)*2;
        roadIdx.push(a,b,a+1,b,b+1,a+1);
      }
      const roadGeo=new THREE.BufferGeometry(); roadGeo.setAttribute('position',new THREE.Float32BufferAttribute(roadVerts,3)); roadGeo.setIndex(roadIdx); roadGeo.computeVertexNormals();
      this.scene.add(new THREE.Mesh(roadGeo, roadMat));

      const addRibbon=(edge,offset,mat,y=.05,w=edgeWidth)=>{
        const verts=[],idx=[];
        for(let i=0;i<edge.length;i++){
          const p=this.trackPoints[i], e=edge[i];
          const outward=e.clone().sub(p).normalize();
          const a=e.clone().add(outward.clone().multiplyScalar(offset));
          const b=e.clone().add(outward.clone().multiplyScalar(offset+w));
          verts.push(a.x,y,a.z,b.x,y,b.z);
        }
        for(let i=0;i<edge.length;i++){ const a=i*2,b=((i+1)%edge.length)*2; idx.push(a,b,a+1,b,b+1,a+1); }
        const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3)); geo.setIndex(idx); geo.computeVertexNormals();
        this.scene.add(new THREE.Mesh(geo,mat));
      };
      addRibbon(leftEdge,.06,edgeMat); addRibbon(rightEdge,.06,edgeMat);

      // Curbs and safety barriers as individual blocks following the road tangent.
      for(let i=0;i<this.trackPoints.length;i+=6){
        const p=this.trackPoints[i], next=this.trackPoints[(i+1)%this.trackPoints.length];
        const prev=this.trackPoints[(i-1+this.trackPoints.length)%this.trackPoints.length];
        const dir=next.clone().sub(prev).normalize();
        const normal=new THREE.Vector3(-dir.z,0,dir.x).normalize();
        [-1,1].forEach(side=>{
          const base=p.clone().add(normal.clone().multiplyScalar(side*(width/2+.22)));
          const curb=new THREE.Mesh(new THREE.BoxGeometry(.32,.08,1.08), (Math.floor(i/6)%2===0)?curbRed:curbWhite);
          curb.position.set(base.x,.09,base.z); curb.rotation.y=Math.atan2(dir.x,dir.z); this.scene.add(curb);
          if(i%18===0){
            const barPos=p.clone().add(normal.clone().multiplyScalar(side*(width/2+1.25)));
            const bar=new THREE.Mesh(new THREE.BoxGeometry(.22,.42,1.35),barrierMat);
            bar.position.set(barPos.x,.26,barPos.z); bar.rotation.y=Math.atan2(dir.x,dir.z); this.scene.add(bar);
          }
        });
      }

      // Start/finish line and pit lane.
      const sf=this.trackPoints[2], sfNext=this.trackPoints[5];
      const sfDir=sfNext.clone().sub(sf).normalize();
      const line=new THREE.Mesh(new THREE.BoxGeometry(width+.7,.09,.22),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.2}));
      line.position.set(sf.x,.12,sf.z); line.rotation.y=Math.atan2(sfDir.x,sfDir.z); this.scene.add(line);
      const pitMat=new THREE.MeshStandardMaterial({color:0x2a2d36,roughness:.45});
      for(let i=0;i<20;i++){
        const t=i/20;
        const p=new THREE.Vector3(3+t*17,0,-12.8+t*2.4);
        const seg=new THREE.Mesh(new THREE.BoxGeometry(3.0,.07,.8),pitMat);
        seg.position.set(p.x,.05,p.z); seg.rotation.y=1.42; this.scene.add(seg);
      }
    }
    addEnvironment(){
      const info = this.race.trackInfo || {};
      const theme = info.track || 'classic';
      const isStreet = theme === 'street';
      const isDesert = theme === 'desert';
      const isPark = theme === 'park';
      const matConcrete=new THREE.MeshStandardMaterial({color:0xb9c1cc,roughness:.62,metalness:.04});
      const matDark=new THREE.MeshStandardMaterial({color:0x2d3445,roughness:.58});
      const matGlass=new THREE.MeshStandardMaterial({color:0x8fb7d7,roughness:.18,metalness:.25});
      const matSand=new THREE.MeshStandardMaterial({color:0xc7a05c,roughness:.9});
      const matGrass=new THREE.MeshStandardMaterial({color:0x1b7a3e,roughness:.86});
      const matFence=new THREE.MeshStandardMaterial({color:0xd8dde8,roughness:.5,metalness:.18});

      // Contexto visual por tipo de circuito: rua, deserto, parque ou clássico.
      if(isDesert){
        for(let i=0;i<38;i++){
          const dune=new THREE.Mesh(new THREE.ConeGeometry(rnd(.8,2.4),rnd(.35,1.2),7),matSand);
          dune.position.set(rnd(-38,38),.05,rnd(-24,24)); dune.scale.y=.25; this.scene.add(dune);
        }
      }
      if(isPark){
        for(let i=0;i<42;i++){
          const tree=new THREE.Group();
          const tr=new THREE.Mesh(new THREE.CylinderGeometry(.08,.13,1.35,6),new THREE.MeshStandardMaterial({color:0x6b4329}));
          tr.position.y=.62; tree.add(tr);
          const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(.62,0),matGrass);
          crown.position.y=1.42; tree.add(crown);
          tree.position.set(rnd(-35,35),0,rnd(-22,22));
          if(Math.abs(tree.position.x)<22 && Math.abs(tree.position.z)<14) continue;
          this.scene.add(tree);
        }
      }

      // Cidade/entorno principal.
      const buildingCount = isStreet ? 34 : 18;
      for(let i=0;i<buildingCount;i++){
        const b=new THREE.Mesh(new THREE.BoxGeometry(rnd(1.2,3.6),rnd(1.2,isStreet?8.2:4.2),rnd(1.2,3.4)), i%4===0?matGlass:(i%3===0?matDark:matConcrete));
        const side = i%2===0 ? 1 : -1;
        b.position.set(side*rnd(23,39),b.geometry.parameters.height/2-.05,rnd(-23,23));
        b.rotation.y=rnd(-.08,.08);
        this.scene.add(b);
      }

      // Arquibancadas em múltiplos pontos, mais próximas do circuito.
      const grandMat=new THREE.MeshStandardMaterial({color:0xcfd6e6,roughness:.52});
      const seatMat=new THREE.MeshStandardMaterial({color:0x18223a,roughness:.66});
      for(let i=0;i<10;i++){
        const g=new THREE.Group();
        const base=new THREE.Mesh(new THREE.BoxGeometry(4.6,.35,1.25),grandMat); base.position.y=.18; g.add(base);
        for(let r=0;r<3;r++){ const row=new THREE.Mesh(new THREE.BoxGeometry(4.4,.18,.24),seatMat); row.position.set(0,.46+r*.22,-.42+r*.32); g.add(row); }
        g.position.set(-15+i*3.4,.06,14.5+rnd(-.8,.8)); g.rotation.y=.06; this.scene.add(g);
      }

      // Pit building mais longo, boxes e torre de cronometragem.
      const pitBase=new THREE.Mesh(new THREE.BoxGeometry(24,1.25,2.25),matConcrete);
      pitBase.position.set(11,.6,-16.4); this.scene.add(pitBase);
      const pitTop=new THREE.Mesh(new THREE.BoxGeometry(22,.65,1.45),matGlass);
      pitTop.position.set(11,1.55,-16.4); this.scene.add(pitTop);
      for(let i=0;i<12;i++){
        const door=new THREE.Mesh(new THREE.BoxGeometry(1.4,.82,.08),matDark);
        door.position.set(.5+i*1.8,.45,-15.22); this.scene.add(door);
      }
      const tower=new THREE.Mesh(new THREE.BoxGeometry(1.65,5.2,1.65),matDark);
      tower.position.set(-2.8,2.55,-16.25); this.scene.add(tower);

      // Passarelas e placas.
      const gantryMat=new THREE.MeshStandardMaterial({color:0x111827,roughness:.35,metalness:.2});
      for(let k=0;k<3;k++){
        const p=this.trackPoints[Math.floor((k+.18)*this.trackPoints.length/3)%this.trackPoints.length];
        const nxt=this.trackPoints[(Math.floor((k+.18)*this.trackPoints.length/3)+4)%this.trackPoints.length];
        const dir=nxt.clone().sub(p).normalize();
        const bridge=new THREE.Mesh(new THREE.BoxGeometry(6.4,.25,.35),gantryMat);
        bridge.position.set(p.x,2.2,p.z); bridge.rotation.y=Math.atan2(dir.x,dir.z)+Math.PI/2; this.scene.add(bridge);
        const l1=new THREE.Mesh(new THREE.BoxGeometry(.18,2.2,.18),gantryMat); l1.position.set(p.x+Math.cos(bridge.rotation.y)*3.0,1.1,p.z-Math.sin(bridge.rotation.y)*3.0); this.scene.add(l1);
        const l2=l1.clone(); l2.position.set(p.x-Math.cos(bridge.rotation.y)*3.0,1.1,p.z+Math.sin(bridge.rotation.y)*3.0); this.scene.add(l2);
      }

      // Palmeiras/vegetação urbanas, sem bloquear o traçado.
      const palmMat=new THREE.MeshStandardMaterial({color:0x0f7738}); const trunkMat=new THREE.MeshStandardMaterial({color:0x6b4329});
      for(let i=0;i<30;i++){ const x=rnd(-35,30), z=rnd(-23,23); if(Math.abs(x)<22 && Math.abs(z)<14) continue; const tr=new THREE.Mesh(new THREE.CylinderGeometry(.07,.11,1.45,6),trunkMat); tr.position.set(x,.65,z); this.scene.add(tr); const top=new THREE.Mesh(new THREE.ConeGeometry(.58,1.08,7),palmMat); top.position.set(x,1.48,z); this.scene.add(top); }

      // Cercas e muretas de proteção externas.
      for(let i=0;i<this.trackPoints.length;i+=14){
        const p=this.trackPoints[i], prev=this.trackPoints[(i-1+this.trackPoints.length)%this.trackPoints.length], next=this.trackPoints[(i+1)%this.trackPoints.length];
        const dir=next.clone().sub(prev).normalize();
        const normal=new THREE.Vector3(-dir.z,0,dir.x).normalize();
        [-1,1].forEach(side=>{
          const pos=p.clone().add(normal.clone().multiplyScalar(side*4.4));
          const fence=new THREE.Mesh(new THREE.BoxGeometry(.12,.75,1.35),matFence);
          fence.position.set(pos.x,.42,pos.z); fence.rotation.y=Math.atan2(dir.x,dir.z); this.scene.add(fence);
        });
      }
    }
    addRacingLines(){
      if(!this.visualModel) return;
      const mkLine=(offset,color)=>{
        const pts=this.trackPoints.map((p,i)=>p.clone().add(this.normalAt(i).multiplyScalar(offset)).add(new THREE.Vector3(0,.07,0)));
        const geo=new THREE.BufferGeometry().setFromPoints(pts.concat([pts[0]]));
        const line=new THREE.Line(geo,new THREE.LineBasicMaterial({color,transparent:true,opacity:.62}));
        this.scene.add(line);
      };
      mkLine(0,0x62f7ff); mkLine(-.86,0xffd166); mkLine(.86,0xff4d6d);
    }
    addSectorAndDrsMarkers(){
      if(!this.visualModel) return;
      const boardMat=new THREE.MeshStandardMaterial({color:0x07111f,roughness:.45,metalness:.12});
      const drsMat=new THREE.MeshStandardMaterial({color:0x13ff88,roughness:.28,emissive:0x064e2c,emissiveIntensity:.35});
      const width=this.visualModel.worldWidth || 4.8;
      (this.visualModel.sectors||[]).forEach(sec=>{
        const i=Math.floor(sec.start*this.trackPoints.length)%this.trackPoints.length;
        const p=this.trackPoints[i], dir=this.tangentAt(i), normal=this.normalAt(i);
        const panel=new THREE.Mesh(new THREE.BoxGeometry(.12,1.2,2.4),boardMat);
        const pos=p.clone().add(normal.multiplyScalar(width/2+2.25)); panel.position.set(pos.x,1.0,pos.z); panel.rotation.y=Math.atan2(dir.x,dir.z); this.scene.add(panel);
      });
      (this.visualModel.drsZones||[]).forEach(zone=>{
        const start=Math.floor(zone.start*this.trackPoints.length), end=Math.floor(zone.end*this.trackPoints.length);
        for(let i=start;i<end;i+=6){
          const idx=i%this.trackPoints.length; const p=this.trackPoints[idx]; const dir=this.tangentAt(idx); const normal=this.normalAt(idx);
          const strip=new THREE.Mesh(new THREE.BoxGeometry(.38,.045,1.25),drsMat);
          const pos=p.clone().add(normal.multiplyScalar(-width/2-.34)); strip.position.set(pos.x,p.y+.12,pos.z); strip.rotation.y=Math.atan2(dir.x,dir.z); this.scene.add(strip);
        }
      });
    }
    addWeatherAndSpray(){
      const wet=this.race.weather==='variable' || this.race.trackState?.wetness > 15;
      if(!wet) return;
      const rainMat=new THREE.MeshBasicMaterial({color:0x9bdcff,transparent:true,opacity:.32});
      for(let i=0;i<42;i++){
        const drop=new THREE.Mesh(new THREE.BoxGeometry(.025,.9,.025),rainMat);
        drop.position.set(rnd(-36,36),rnd(5,18),rnd(-24,24)); drop.rotation.z=.35; this.scene.add(drop);
      }
      this.sprayMat=new THREE.MeshBasicMaterial({color:0xd9f3ff,transparent:true,opacity:.26});
    }
    addReplayAndCameraRig(){
      this.cameraRig={ mode:'tv', lastMarker:null };
      if(this.race.replayBuffer && this.visualModel) this.race.replayBuffer.push(visualSystem.captureFrame(this.race,this.visualModel));
    }
    addCars(){ this.race.entries.forEach((e,i)=>{ const car=this.makeCar(e.color,e.secondary); this.scene.add(car); this.cars.push(car); this.placeCar(car,e,i); }); }

    makeCar(color,secondary){
      const g=new THREE.Group();
      const mainMat=new THREE.MeshStandardMaterial({color,roughness:.28,metalness:.16});
      const secMat=new THREE.MeshStandardMaterial({color:secondary||0x111111,roughness:.35,metalness:.08});
      const blackMat=new THREE.MeshStandardMaterial({color:0x050509,roughness:.55});
      const tireMat=new THREE.MeshStandardMaterial({color:0x050505,roughness:.78});
      const body=new THREE.Mesh(new THREE.BoxGeometry(.72,.28,1.55),mainMat); body.position.y=.28; g.add(body);
      const sidepodL=new THREE.Mesh(new THREE.BoxGeometry(.34,.18,.82),mainMat); sidepodL.position.set(-.38,.24,-.08); g.add(sidepodL);
      const sidepodR=sidepodL.clone(); sidepodR.position.x=.38; g.add(sidepodR);
      const nose=new THREE.Mesh(new THREE.BoxGeometry(.30,.18,1.35),mainMat); nose.position.set(0,.25,1.32); g.add(nose);
      const cockpit=new THREE.Mesh(new THREE.BoxGeometry(.40,.25,.42),blackMat); cockpit.position.set(0,.53,.08); g.add(cockpit);
      const halo=new THREE.Mesh(new THREE.TorusGeometry(.28,.025,6,18,Math.PI),secMat); halo.position.set(0,.67,.18); halo.rotation.x=Math.PI/2; g.add(halo);
      const fw=new THREE.Mesh(new THREE.BoxGeometry(1.7,.07,.30),secMat); fw.position.set(0,.16,2.03); g.add(fw);
      const rw=new THREE.Mesh(new THREE.BoxGeometry(1.45,.18,.22),secMat); rw.position.set(0,.62,-.98); g.add(rw);
      const beam=new THREE.Mesh(new THREE.BoxGeometry(.12,.45,.12),secMat); beam.position.set(0,.43,-1.02); g.add(beam);
      [[-.62,.25,.62],[.62,.25,.62],[-.62,.25,-.68],[.62,.25,-.68]].forEach((p,idx)=>{
        const w=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,.18,18),tireMat); w.rotation.z=Math.PI/2; w.position.set(...p); g.add(w);
        const rim=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,.19,14),secMat); rim.rotation.z=Math.PI/2; rim.position.set(...p); g.add(rim);
      });
      const stripe=new THREE.Mesh(new THREE.BoxGeometry(.08,.025,1.75),secMat); stripe.position.set(0,.435,.2); g.add(stripe);
      const damage=new THREE.Mesh(new THREE.BoxGeometry(.38,.05,.34),new THREE.MeshBasicMaterial({color:0xff3b30,transparent:true,opacity:.72})); damage.name='damageVisual'; damage.position.set(0,.74,1.55); damage.visible=false; g.add(damage);
      const lodBadge=new THREE.Mesh(new THREE.BoxGeometry(.18,.03,.18),new THREE.MeshBasicMaterial({color:0x65ffda,transparent:true,opacity:.55})); lodBadge.name='lodBadge'; lodBadge.position.set(.42,.56,-.2); g.add(lodBadge);
      g.scale.set(.78,.78,.78); return g;
    }
    placeCar(car,e,offset){ const prog=(e.progress%1+1)%1; const exact=prog*this.trackPoints.length; const i=Math.floor(exact)%this.trackPoints.length; const j=(i+1)%this.trackPoints.length; const p=this.trackPoints[i].clone().lerp(this.trackPoints[j],exact-i); const n=this.trackPoints[j]; car.position.copy(p); car.position.y=(p.y||0)+.25+(offset%2)*.04; car.rotation.y=Math.atan2(n.x-p.x,n.z-p.z); }
    renderFrame(){ if(!this.renderer || !this.race) return; this.race.entries.forEach((e,i)=>{ const car=this.cars[i]; this.placeCar(car,e,i); if(car){ const dmg=car.getObjectByName('damageVisual'); if(dmg) dmg.visible=((e.vehicle?.aeroDamage||0)+(e.vehicle?.chassisDamage||0))>10; const lod=car.getObjectByName('lodBadge'); if(lod) lod.visible=i<((this.visualModel?.qualityHint?.maxCarsHighDetail)||18); } }); this.recordReplayFrame(); this.updateCameraMode(); this.renderer.render(this.scene,this.camera); }
    updateCameraMode(){
      const mode=this.race.cameraMode||'tv';
      const targetEntry = this.race.entries.find(e=>isPlayerDriver(e.driver.short)) || this.race.entries[0];
      const idx=this.race.entries.indexOf(targetEntry); const car=this.cars[Math.max(0,idx)]; if(!car) return;
      const pos=car.position.clone(); const preset=visualSystem?.data?.cameraPresets?.[mode] || {stiffness:.04};
      if(mode==='overhead'){ this.camera.position.lerp(new THREE.Vector3(0,43,1),preset.stiffness||.035); this.camera.lookAt(0,0,0); return; }
      if(mode==='onboard'){ const fwd=new THREE.Vector3(0,0,1).applyEuler(car.rotation); const eye=pos.clone().add(new THREE.Vector3(0,1.05,0)).add(fwd.clone().multiplyScalar(.7)); this.camera.position.lerp(eye,.22); this.camera.lookAt(pos.x+fwd.x*7,pos.y+.45,pos.z+fwd.z*7); return; }
      if(mode==='pitwall'){ this.camera.position.lerp(new THREE.Vector3(6,7,-20),.04); this.camera.lookAt(pos.x,0,pos.z); return; }
      if(mode==='replay'){ const replay=this.race.replayBuffer?.latest?.(1)?.[0]; const offset=(replay?.tick||0)%8; this.camera.position.lerp(new THREE.Vector3(pos.x+18-Math.sin(offset)*8,13,pos.z+12+Math.cos(offset)*8),.06); this.camera.lookAt(pos.x,0,pos.z); return; }
      if(mode==='follow'){ this.camera.position.lerp(new THREE.Vector3(pos.x-6,8,pos.z+9),preset.stiffness||.055); this.camera.lookAt(pos.x,0,pos.z); return; }
      this.camera.position.lerp(new THREE.Vector3(pos.x+12,18,pos.z+15),preset.stiffness||.025); this.camera.lookAt(pos.x,0,pos.z);
    }
    recordReplayFrame(){
      if(!visualSystem || !this.race.replayBuffer || !this.visualModel) return;
      if((this.race.tick||0) - (this.race.lastReplayCapture||0) < (this.visualModel.replay?.captureEveryTicks || .38)) return;
      this.race.lastReplayCapture=this.race.tick||0;
      const frame=visualSystem.captureFrame(this.race,this.visualModel);
      this.race.replayBuffer.push(frame);
    }
    resize(){ if(!this.renderer) return; const w=this.canvas.clientWidth,h=this.canvas.clientHeight; this.camera.aspect=w/h; this.camera.updateProjectionMatrix(); this.renderer.setSize(w,h,false); }
    dispose(){
      if(this.onResize) window.removeEventListener('resize',this.onResize);
      if(this.scene){
        this.scene.traverse(obj => {
          if(obj.geometry?.dispose) obj.geometry.dispose();
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.filter(Boolean).forEach(mat => {
            Object.values(mat).forEach(value => { if(value?.isTexture && value.dispose) value.dispose(); });
            if(mat.dispose) mat.dispose();
          });
        });
      }
      if(this.renderer){
        if(this.renderer.renderLists?.dispose) this.renderer.renderLists.dispose();
        if(this.renderer.forceContextLoss) this.renderer.forceContextLoss();
        this.renderer.dispose();
        this.renderer=null;
      }
      this.cars=[]; this.scene=null; this.camera=null; this.race=null;
    }
  }


  function autoPitEntry(e){
    const result = strategyAI?.executePitStop?.(e, race, { manual:false, vehiclePhysics, isPlayer:isPlayerDriver(e.driver.short) }) || null;
    if(result){ e.lastAction = result.label; return result; }
    const carPit = e.car?.pitStop || 60;
    const pitLoss = Math.max(0.028, 0.078 - carPit/2400);
    vehiclePhysics?.pitService?.(e);
    e.baseSpeed = baseRaceSpeed(e.driver,e.car,isPlayerDriver(e.driver.short))*compoundPaceMultiplier(e.compound);
    e.condition = Math.min(100,e.condition+5);
    e.progress -= pitLoss;
    e.pits++;
    e.pitCooldown = 8;
    e.lastAction = `PIT AUTO -${Math.round(pitLoss*1000)/10}s`;
    return { label:e.lastAction, loss:pitLoss };
  }
  function updateRaceSimulation(dt){
    if(!race) return;
    race.tick += dt*race.speed;
    const track = currentTrackProfile();
    if(vehiclePhysics && race.trackState) vehiclePhysics.updateTrack(race.trackState, { dt, speed:race.speed, cars:race.entries.length, weather:race.weather });
    const previousOrder = new Map(race.entries.map(e => [e.driver.short, e.pos]));
    const strategyContext = strategyAI?.updateRaceState?.(race, { dt, speed:race.speed, vehiclePhysics }) || { safetyMultiplier:race.safetyCar>0?0.70:1 };
    race.gameplayContext = gameplayPolish?.raceContext?.(race, { state, buildCode:DATA.build?.build_code || 'dev', isPlayer:isPlayerDriver, dt }) || { battleIntensity:0 };
    race.telemetryContext = telemetrySystem?.raceContext?.(race, { state, buildCode:DATA.build?.build_code || 'dev', dt }) || { avgTyre:0, avgCondition:0 };
    race.entries.forEach((e, idx)=>{
      const isPlayer = isPlayerDriver(e.driver.short);
      const decision = strategyAI?.driverDecision?.(e, race, { index:idx, isPlayer, dt, vehiclePhysics, regulationEngine, state, context:strategyContext });
      if(!isPlayer && decision?.pace) e.pace = decision.pace;
      if(decision?.shouldPit && !e.pitCooldown && e.pits < 3){
        const pitResult = autoPitEntry(e);
        race.raceLog.unshift(`${e.driver.short} ${pitResult?.label || 'parou nos boxes por estratégia'}`);
      }
      if(decision?.radio) audioUI?.radio?.(decision.radio);
      if(decision?.defending) e.aiIntent = 'defesa';
      else if(decision?.attacking) e.aiIntent = 'ataque';
      else if(decision?.traffic) e.aiIntent = 'tráfego';
      else e.aiIntent = decision?.intent || e.aiIntent || 'ritmo';
      if(isPlayer){ const ds=driversForTeam(state.currentTeam); const pidx=ds.findIndex(d=>d.short===e.driver.short); e.pace = race.playerPace[pidx] || 'normal'; }
      const car = e.car || estimateCar(e.team);
      const setupFx = e.setupFx || { tyreCare:0, reliability:0 };
      const strategist = isPlayer ? (state.staff?.strategists||1) : 1;
      const mechanic = isPlayer ? (state.staff?.mechanics||1) : 1;
      const traffic = vehiclePhysics?.trafficEffects?.(e, idx, race.entries) || { dirtyAir:1, slipstream:1, pressure:1, gapAhead:99, defending:false };
      const physics = vehiclePhysics?.updateVehicle?.(e, { dt, speed:race.speed, trackState:race.trackState, trackProfile:track, traffic, safetyCarActive:race.safetyCar>0 });
      const grip = race.weather === 'variable' ? 0.965 : 1;
      const legacyPace = (strategyContext?.safetyMultiplier || (race.safetyCar>0 ? 0.70 : 1)) * (e.pace==='attack'?1.122:e.pace==='save'?0.928:1) * grip;
      const reliability = Math.max(35, (car.reliability||55) + mechanic*1.8 + (setupFx.reliability||0)*100);
      const driverConsistency = ((e.driver.consistency||70)-60)/820;
      const randomRaceNoise = 1 + Math.sin((race.tick+e.pos)*0.7)*0.002 + driverConsistency;
      const physicsPace = physics?.paceMultiplier || legacyPace;
      const staffPace = 1 + (strategist-1)*0.0015;
      const gameplayFx = gameplayPolish?.entryModifier?.(e, race, { state, index:idx, isPlayer, buildCode:DATA.build?.build_code || 'dev', raceContext:race.gameplayContext }) || { paceMultiplier:1, riskMultiplier:1, battle:0, advice:null };
      const telemetryPacket = telemetrySystem?.sample?.(e, race, { state, index:idx, isPlayer, physics, gameplayFx, traffic, trackProfile:track, dt, buildCode:DATA.build?.build_code || 'dev' }) || null;
      if(telemetryPacket){
        e.telemetry = telemetryPacket;
        race.telemetrySamples = Array.isArray(race.telemetrySamples) ? race.telemetrySamples : [];
        if(isPlayer){ race.telemetrySamples.unshift(telemetryPacket); race.telemetrySamples = race.telemetrySamples.slice(0, 60); }
        const diagnosis = telemetrySystem?.diagnose?.(e, race, { state, sample:telemetryPacket, buildCode:DATA.build?.build_code || 'dev' }) || null;
        e.engineerDiagnosis = diagnosis;
        if(isPlayer && diagnosis?.priority >= 78 && race.tick - (e.lastTelemetryLog||0) > 10){ e.lastTelemetryLog = race.tick; race.raceLog.unshift(`${e.driver.short}: ${diagnosis.top.label}`); }
      }
      if(tyreStint){
        const tyreAnalysis = tyreStint.sampleEntry?.(e, race, { state, buildCode:DATA.build?.build_code || 'dev' }) || null;
        if(tyreAnalysis){
          e.tyreAnalysis = tyreAnalysis;
          if(isPlayer && (tyreAnalysis.cliffRisk > 72 || tyreAnalysis.blisteringPct > 36 || tyreAnalysis.grainingPct > 38) && race.tick - (e.lastTyreLog||0) > 12){
            e.lastTyreLog = race.tick;
            const tyreAdvice = tyreStint.pitWallAdvice?.({ analysis:tyreAnalysis, currentLap:Math.max(1, Math.round((race.tick||0)/80)), lapsTotal:race.laps || 50 }, { state, buildCode:DATA.build?.build_code || 'dev' }) || null;
            if(tyreAdvice) race.raceLog.unshift(`Pneus ${e.driver.short}: ${tyreAdvice.label} — ${tyreAdvice.advice}`);
          }
        }
      }
      if(isPlayer && gameplayFx.advice && (!race.lastGameplayAdvice || race.tick - (race.lastGameplayAdvice.tick||0) > 7)){ race.lastGameplayAdvice = { tick:race.tick, advice:gameplayFx.advice }; e.aiIntent = gameplayFx.advice.label || e.aiIntent; }
      if(gameplayFx.action && race.tick - (e.lastGameplayLog||0) > 8){ e.lastGameplayLog = race.tick; e.lastAction = gameplayFx.action; if(isPlayer || gameplayFx.battle > .9) race.raceLog.unshift(`${e.driver.short}: ${gameplayFx.action}`); }
      e.progress += e.baseSpeed * physicsPace * staffPace * randomRaceNoise * (gameplayFx.paceMultiplier || 1) * dt * race.speed;
      e.distance = e.progress;
      const conditionLoss = vehiclePhysics ? 0 : Math.max(.003, (104-reliability)/3300) * (e.pace==='attack'?1.35:1) * (track.rain>1.05?1.13:1);
      if(!vehiclePhysics) e.condition = Math.max(0,e.condition - dt*race.speed*conditionLoss);
      const physicalRisk = physics?.risk || 0;
      const errorChance = (dt*race.speed*Math.max(0, (82-reliability))/28000 * (e.pace==='attack'?1.72:1) * (100-(e.driver.consistency||70))/45 + physicalRisk) * (gameplayFx.riskMultiplier || 1);
      if(!e.incident && Math.random() < errorChance){
        e.progress -= 0.018 + Math.random()*0.030;
        if(e.vehicle){ e.vehicle.aeroDamage = Math.min(100,(e.vehicle.aeroDamage||0)+6+Math.random()*12); e.vehicle.reliabilityHealth = Math.max(8,(e.vehicle.reliabilityHealth||e.condition||100)-8); }
        e.condition = Math.max(12,e.condition - (8+Math.random()*14));
        e.incident=true; e.lastAction='ERRO';
        race.raceLog.unshift(`${e.driver.short} perdeu tempo e trouxe danos ao carro`);
      }
      if(e.pitCooldown) e.pitCooldown = Math.max(0, e.pitCooldown - dt*race.speed);
      e.lastLap = e.lap;
      e.lap = Math.min(race.laps, Math.floor(e.progress)+1);
      if(e.lap > e.lastLap && isPlayer) race.raceLog.unshift(`${e.driver.short} abriu a volta ${e.lap}: ${vehicleTelemetryText(e)}`);
      e.sector = Math.min(3, Math.max(1, Math.floor(((e.progress%1)+1)%1*3)+1));
      if(!isPlayer && !e.pitCooldown && e.pits < 2 && !decision?.shouldPit && (e.tyre < 18 || (e.lap >= e.plannedPitLap + 2 && e.tyre < 42))){ const pitResult = autoPitEntry(e); race.raceLog.unshift(`${e.driver.short} ${pitResult?.label || 'parou nos boxes'}`); }
      e.totalTime += dt*race.speed*(1 + (100-e.tyre)/620 + (100-e.condition)/900 + (100-(e.ers||50))/5000 + (e.damage||0)/6000);
    });
    if(race.safetyCar>0) race.safetyCar = Math.max(0, race.safetyCar - dt*race.speed);
    else if(race.tick > 12 && Math.random() < dt*race.speed/27000){ race.safetyCar = 18 + Math.random()*14; race.strategyState.safetyCarDeployments++; race.raceLog.unshift('Safety car virtual por detritos na pista'); }
    strategyAI?.resolveOvertakes?.(race, { dt, speed:race.speed, vehiclePhysics });
    race.entries.sort((a,b)=>b.distance-a.distance);
    race.entries.forEach((e,i)=>{
      const old = previousOrder.get(e.driver.short) || e.pos || i+1;
      e.previousPos = old;
      e.pos=i+1;
      e.gap = i===0 ? 0 : Math.max(0,(race.entries[0].distance-e.distance)*82);
      const delta = old - e.pos;
      if(delta > 0 && race.tick > 3){
        e.lastAction = `+${delta} posição`;
        if(isPlayerDriver(e.driver.short) || delta > 1) race.raceLog.unshift(`${e.driver.short} ganhou ${delta} posição${delta>1?'ões':''}`);
      }
    });
    race.raceLog = race.raceLog.slice(0,5);
    updateRaceHud();
    if(race.entries.some(e=>e.progress>=race.laps)) finishRace();
  }
  function driverAvatarHTML(d){
    return `<span class="race-avatar">${d.portrait ? `<img data-asset-src="${d.portrait}" alt="${d.short}"/>` : ''}<b class="fallback-badge" style="display:${d.portrait ? 'none':'flex'}">${initials(d.short)}</b></span>`;
  }
  function updateRaceHud(){
    if(!race) return;
    const leaderLap = Math.max(...race.entries.map(e=>e.lap));
    $('#lapLabel').textContent = `VOLTA ${leaderLap}/${race.laps}`;
    if($('#raceTitle')) $('#raceTitle').textContent = race.trackInfo ? race.trackInfo.name : 'CORRIDA';
    if($('#weatherLabel')) $('#weatherLabel').textContent = race.safetyCar>0 ? `🟨 VSC ${Math.ceil(race.safetyCar)}s` : `${race.weather === 'variable' ? '☁ Variável' : '☀ Seco'} • pista ${Math.round((race.trackState?.grip||1)*100)}%`; 
    if($('#raceBuildStamp')) $('#raceBuildStamp').textContent = (DATA.build&&DATA.build.label)||'';
    if($('#speedLabel')) $('#speedLabel').textContent = race.speed;
    if($('#cameraLabel')) $('#cameraLabel').textContent = cameraLabel(race.cameraMode||'tv');
    const statusPanel = $('#raceStatusPanel');
    if(statusPanel){
      const playerBest = race.entries.filter(e=>isPlayerDriver(e.driver.short)).sort((a,b)=>a.pos-b.pos)[0];
      const neutralLabel = race.redFlag>0 ? 'BANDEIRA VERMELHA' : race.safetyCar>0 ? 'SAFETY CAR / VSC' : 'RITMO DE CORRIDA';
      const pitAdvice = race.lastGameplayAdvice?.advice?.label || gameplayPolish?.pitAdvice?.(playerBest || {}, race, { state })?.label || 'RITMO';
      const stratText = playerBest ? `${pitAdvice} • ${compoundLabel(playerBest.compound)} ${Math.round(playerBest.tyre)}% • Pit ${playerBest.pits}` : 'Sem piloto';
      const diagText = playerBest?.engineerDiagnosis?.top?.label || 'telemetria estabilizando';
      statusPanel.innerHTML = `<div><b>${neutralLabel}</b><span>${race.trackInfo?.name||'GP'} • Câmera ${cameraLabel(race.cameraMode)}</span></div><div><b>${playerBest ? 'P'+playerBest.pos+' '+playerBest.driver.short : 'Equipe'}</b><span>${stratText}</span><small class="telemetry-inline">${playerBest ? telemetryLine(playerBest) : ''}</small><small class="telemetry-inline">Engenharia: ${diagText}</small></div><div class="race-log-mini">${(race.raceLog||[]).slice(0,3).map(x=>`<small>${x}</small>`).join('')}</div>`;
    }
    $('#raceLeaderboard').innerHTML = race.entries.slice(0,22).map((e,i)=>{
      const delta = (e.previousPos||e.pos)-e.pos;
      const deltaText = delta>0 ? `▲${delta}` : delta<0 ? `▼${Math.abs(delta)}` : '•';
      return `<div class="race-row ${isPlayerDriver(e.driver.short)?'highlight':''}"><span class="race-pos">${i+1}<small>${deltaText}</small></span>${driverAvatarHTML(e.driver)}${teamLogoHTML(e.team,'team-logo-mini')}<span class="race-name"><b>${e.driver.short}</b><small>${e.team.name}</small></span><span class="race-tyre">${compoundLabel(e.compound).slice(0,1)} ${Math.round(e.tyre)}% ${e.drs?'DRS':''}</span><span class="race-pits">${e.pits}P • ${String(e.aiIntent||'ritmo').slice(0,7)} • ${i===0?'LÍDER':'+'+e.gap.toFixed(1)}</span></div>`;
    }).join('');
    hydrateAssets($('#raceLeaderboard'));
    const pDrivers = driversForTeam(state.currentTeam); [0,1].forEach(i=>{ const d=pDrivers[i]; if(!d) return; const e=race.entries.find(x=>x.driver.short===d.short); const card=document.getElementById(`controlCard${i+1}`), name=document.getElementById(`controlDriver${i+1}`), cond=document.getElementById(`cond${i+1}`); if(e){ if(name) name.innerHTML = `<span class="control-head">${driverAvatarChip(d,'driver-avatar-inline small')}${teamLogoHTML(teamById(driverCurrentTeamId(d.short)||d.team),'team-logo-inline small')}<span><b>${e.pos}º | ${d.short}</b><small>${teamById(driverCurrentTeamId(d.short)||d.team).name}</small></span></span>`; if(cond) cond.style.width = `${Math.round(e.condition)}%`; if(card){ card.querySelectorAll('[data-pace]').forEach(btn=>btn.classList.toggle('active', btn.dataset.pace === (race.playerPace[i]||'normal'))); const status=card.querySelector('.pilot-status') || document.createElement('div'); status.className='pilot-status'; const advice = gameplayPolish?.pitAdvice?.(e, race, { state, isPlayer:true })?.label || (e.aiIntent||'ritmo').toUpperCase(); const tyreLine = e.tyreAnalysis ? ` • Pneu ${e.tyreAnalysis.tyreHealth}/100 cliff ${e.tyreAnalysis.cliffRisk}%` : ''; status.textContent = `Modo: ${(race.playerPace[i]||'normal').toUpperCase()} • ${telemetryLine(e)}${tyreLine} • Gap ${e.gap.toFixed(1)}s • S${e.sector} • Pit V${e.plannedPitLap} • Pit wall: ${advice} • Eng: ${e.engineerDiagnosis?.top?.label || 'ok'}`; if(!status.parentElement) card.appendChild(status); hydrateAssets(card); } } });
  }
  function finishRace(){
    if(!race) return;
    stopRaceRuntime();
    race.entries.sort((a,b)=>b.distance-a.distance);
    state.lastRace = officialRaceResults(race);
    ensureStandings();
    const st = currentStandings();
    state.lastRace.forEach((r,i)=>{ if(st[r.driver]){ st[r.driver].team = driverCurrentTeamId(r.driver)||r.team; st[r.driver].points += r.points; if(i===0) st[r.driver].wins++; if(i<3) st[r.driver].podiums++; st[r.driver].best = st[r.driver].best ? Math.min(st[r.driver].best,r.pos) : r.pos; } });
    state.completedRaces++;
    evolveRivalsAfterRace();
    state.roundIndex = Math.min(activeCalendar().length-1,state.roundIndex+1);
    const bestPlayer = state.lastRace.filter(r=>driversForTeam(state.currentTeam).some(d=>d.short===r.driver)).sort((a,b)=>a.pos-b.pos)[0];
    if(bestPlayer){
      state.seasonStats = state.seasonStats || { races:0, bestFinish:null, podiums:0, wins:0, objectiveProgress:0 };
      state.seasonStats.races = (state.seasonStats.races||0) + 1;
      state.seasonStats.bestFinish = state.seasonStats.bestFinish ? Math.min(state.seasonStats.bestFinish, bestPlayer.pos) : bestPlayer.pos;
      if(bestPlayer.pos <= 3) state.seasonStats.podiums = (state.seasonStats.podiums||0)+1;
      if(bestPlayer.pos === 1) state.seasonStats.wins = (state.seasonStats.wins||0)+1;
      generateRaceMediaStory(bestPlayer);
      const playerResults = state.lastRace.filter(r=>driversForTeam(state.currentTeam).some(d=>d.short===r.driver));
      const teamPoints = playerResults.reduce((sum,r)=>sum+(r.points||0),0);
      const finance = raceFinanceReport(playerResults, bestPlayer);
      state.money += finance.net;
      const repDelta = reputationDelta(bestPlayer, teamPoints, finance.net);
      state.reputation = Math.max(1, Math.min(99, (state.reputation||0) + repDelta));
      finance.reputationDelta = repDelta;
      recordFinance(finance);
      if(finance.net < 0) addInboxMessage('finance','Departamento Financeiro',`Alerta financeiro: ${finance.track}`,`O saldo do fim de semana foi negativo (${money(finance.net)}). Controle salários, staff e upgrades para manter a confiança da diretoria.`,finance);
      else addInboxMessage('finance','Departamento Financeiro',`Relatório financeiro: ${finance.track}`,`Saldo do fim de semana: ${money(finance.net)}. Receita ${money(finance.income)} menos custos ${money(finance.expenses)}.`,finance);
      updateCareerOffers(bestPlayer);
      if(state.completedRaces === 3 || state.completedRaces === 8 || state.completedRaces === 15) addInboxMessage('board','Diretoria',`Relatório após ${state.completedRaces} corridas`,`Melhor resultado até aqui: P${state.seasonStats.bestFinish}. Status de carreira: ${contractStatusText()}.`,{});
      notifyOffersIfUnlocked();
      if(state.completedRaces >= activeCalendar().length) addInboxMessage('season','Diretoria','Temporada concluída','A temporada chegou ao fim. Abra a agenda para fazer a revisão anual, receber bônus e iniciar o próximo ano.',{});
    }
    appEvents?.emit('race:finished', { round:state.roundIndex, results:state.lastRace.length, series:state.currentSeries });
    saveState(); renderResults(); race=null; showScreen('results');
  }
  function updateCareerOffers(bestPlayer){
    if(!bestPlayer) return;
    refreshCareerOffers();
  }

  function renderResults(){
    setScreenBg('screen-results', DATA.assetPaths.podium);
    const top3 = state.lastRace.slice(0,3);
    const report = state.lastRaceReport || null;
    const podiumEl = document.getElementById('podiumHighlights');
    if(podiumEl){
      podiumEl.innerHTML = top3.map((r,idx)=>{
        const d = driverByShort(r.driver) || {short:r.driver,name:r.driver,portrait:''};
        const team = teamById(r.team);
        const heights = ['second','first','third'];
        const cls = idx===0 ? 'first' : idx===1 ? 'second' : 'third';
        return `<article class="podium-card glass-panel ${cls}"><div class="podium-pos">${r.pos}º</div><div class="podium-driver">${driverAvatarChip(d,'driver-avatar-inline podium')}${teamLogoHTML(team,'team-logo-inline podium')}</div><h4>${d.short}</h4><p>${team ? team.name : r.teamName}</p><strong>${r.points} pts</strong></article>`;
      }).join('');
    }
    $('#resultList').innerHTML = state.lastRace.map(r=>{ const d = driverByShort(r.driver) || {short:r.driver,name:r.driver,portrait:''}; const t = teamById(r.team); return `<div class="row rich-row ${isPlayerDriver(r.driver)?'highlight':''}"><span class="pos-cell">${r.pos}</span><span class="driver-cell">${driverAvatarChip(d)}<span class="driver-text"><b>${d.short}</b><small>${d.name}</small></span></span><span class="team-cell">${teamLogoHTML(t)}<span>${r.teamName}</span></span><span class="time-cell">${r.points} pts</span></div>`; }).join('');
    const st = Object.values(currentStandings()).sort((a,b)=>b.points-a.points).slice(0,22);
    $('#championshipList').innerHTML = st.map((r,i)=>{ const d = driverByShort(r.driver) || {short:r.driver,name:r.driver,portrait:''}; const t = teamById(driverCurrentTeamId(r.driver)||r.team); return `<div class="row rich-row ${isPlayerDriver(r.driver)?'highlight':''}"><span class="pos-cell">${i+1}</span><span class="driver-cell">${driverAvatarChip(d)}<span class="driver-text"><b>${r.driver}</b><small>${t ? t.name : ''}</small></span></span><span class="team-cell">${teamLogoHTML(t)}<span>${t ? t.name : ''}</span></span><span class="time-cell">${r.points} pts</span></div>`; }).join('');
    const summary = document.getElementById('raceWeekendSummary');
    if(summary){
      summary.innerHTML = report ? `<article class="glass-panel race-summary-card"><h3>Relatório do Fim de Semana</h3><div class="summary-grid"><span>Receita <b>${money(report.income)}</b></span><span>Custos <b>${money(report.expenses)}</b></span><span>Saldo <b>${money(report.net)}</b></span><span>Reputação <b>${report.reputationDelta >= 0 ? '+' : ''}${report.reputationDelta}</b></span></div><p>Premiação: ${money(report.prize)} • Patrocinador: ${money(report.sponsorBonus)} • Salários: ${money(report.salaryCost)} • Operação/danos: ${money(report.operations + report.damage)}</p><button class="primary" data-action="nextRaceFromResults">${(state.completedRaces||0) >= activeCalendar().length ? 'IR PARA REVISÃO DA TEMPORADA' : 'AVANÇAR PARA O PRÓXIMO GP'}</button><button class="secondary" data-action="returnLobbyAfterRace">VOLTAR AO LOBBY</button></article>` : '';
    }
    hydrateAssets(document.getElementById('screen-results'));
    applyTranslations(document.getElementById('screen-results'));
  }

  function assetStatusLabel(status){
    return ({loaded:'CARREGADO',fallback:'PLACEHOLDER',loading:'CARREGANDO',invalid:'INVÁLIDO'})[status] || 'NÃO TESTADO';
  }
  function renderAssetChecklist(){
    const host = $('#assetChecklist');
    if(!host) return;
    if(!assetRegistry){ host.innerHTML = '<p>Registro central de assets indisponível.</p>'; return; }
    const report = assetRegistry.snapshot();
    const missing = report.missingRequired || [];
    const observed = report.statuses || [];
    const important = assetRegistry.list({runtime:true}).filter(entry => entry.required || entry.status).slice(0,80);
    host.innerHTML = `<div class="asset-summary-grid">
      <article><b>${report.counts.catalogued}</b><span>caminhos catalogados</span></article>
      <article><b>${report.counts.runtimeReferenced}</b><span>usados em runtime</span></article>
      <article><b>${report.counts.loaded}</b><span>carregados nesta sessão</span></article>
      <article><b>${report.counts.fallback}</b><span>placeholders ativos</span></article>
      <article><b>${missing.length}</b><span>obrigatórios ausentes na origem</span></article>
      <article><b>${report.counts.invalid}</b><span>caminhos inválidos</span></article>
    </div>
    <h3>Ausências obrigatórias já identificadas</h3>
    <div class="asset-path-list">${missing.length ? missing.map(path=>`<code>${path}</code>`).join('') : '<p>Nenhuma ausência obrigatória.</p>'}</div>
    <h3>Estado observado na sessão</h3>
    <div class="asset-registry-table">${important.map(entry=>{ const status=entry.status?.state || 'untested'; return `<div class="asset-registry-row asset-state-${status}"><span>${assetStatusLabel(status)}</span><code>${entry.path}</code><small>${entry.type} • ${entry.original_present?'origem catalogada':'origem ausente'}</small></div>`; }).join('') || '<p>Nenhum asset dinâmico observado ainda.</p>'}</div>
    <p class="muted-small">Observados: ${observed.length} • colisões de maiúsculas/minúsculas: ${report.counts.caseCollisions} • manifesto ${report.manifestVersion}</p>`;
  }
  function exportAssetReport(){
    if(!assetRegistry) return;
    const payload = { build:DATA.build?.build_code || 'dev', exportedAt:new Date().toISOString(), report:assetRegistry.snapshot() };
    const blob = new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`f1m-assets-${String(DATA.build?.build_code||'dev').toLowerCase()}.json`; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }

  init();
})();
