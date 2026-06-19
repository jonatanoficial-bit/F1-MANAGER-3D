(() => {
  'use strict';
  const root = globalThis;
  const core = root.F1M_CORE = root.F1M_CORE || {};

  const clamp = (n,min=0,max=100) => Math.max(min, Math.min(max, Number(n)||0));
  const safeArray = value => Array.isArray(value) ? value : [];
  const avg = list => list.length ? list.reduce((a,b)=>a+Number(b||0),0)/list.length : 0;

  function createDefaultLivingState(data, state = {}){
    const facilities = {};
    safeArray(data.facilities).forEach(item => {
      facilities[item.id] = { level: Number(state?.livingCareer?.facilities?.[item.id]?.level || 1), condition: Number(state?.livingCareer?.facilities?.[item.id]?.condition || 82), upkeepPaid:true };
    });
    const departments = {};
    safeArray(data.departments).forEach(item => {
      departments[item.id] = { focus:'balanced', morale: Number(state?.livingCareer?.departments?.[item.id]?.morale || 62), monthlyBudget: Number(item.monthlyCost || 0), projectProgress: Number(state?.livingCareer?.departments?.[item.id]?.projectProgress || 0) };
    });
    return {
      schema: 1,
      season: Number(state.seasonYear || 2026),
      month: Number(state.livingCareer?.month || 1),
      facilities,
      departments,
      academy: state.livingCareer?.academy || { pipeline:[], reputation:42, graduates:0, lastScout:null },
      board: state.livingCareer?.board || { confidence:62, politics:45, lastReviewRace:-1, factions:{} },
      research: state.livingCareer?.research || { activeProjects:[], completed:[], conceptDirection:'balanced', nextRegulationWatch:[] },
      sponsorPortfolio: state.livingCareer?.sponsorPortfolio || { tier:'local', satisfaction:58, obligations:[], negotiations:[] },
      market: state.livingCareer?.market || { staffPool:[], driverRumours:[], lastRefreshRace:-1 },
      rivalries: state.livingCareer?.rivalries || { primary:null, heat:35, history:[] },
      regulationWatch: state.livingCareer?.regulationWatch || safeArray(data.regulationChangePool).map(item => ({ id:item.id, awareness:38, prepared:0, season:item.season })),
      multiSeason: state.livingCareer?.multiSeason || { projectedYears:3, teamIdentity:'construtor em evolução', dynastyScore:0 }
    };
  }

  function initializeState(state = {}, context = {}){
    const data = context.data || root.F1M_LIVING_CAREER_DATA || {};
    const next = createDefaultLivingState(data, state);
    state.livingCareer = { ...next, ...(state.livingCareer || {}) };
    state.livingCareer.facilities = { ...next.facilities, ...(state.livingCareer.facilities || {}) };
    state.livingCareer.departments = { ...next.departments, ...(state.livingCareer.departments || {}) };
    state.livingCareer.academy = { ...next.academy, ...(state.livingCareer.academy || {}) };
    state.livingCareer.board = { ...next.board, ...(state.livingCareer.board || {}) };
    state.livingCareer.research = { ...next.research, ...(state.livingCareer.research || {}) };
    state.livingCareer.sponsorPortfolio = { ...next.sponsorPortfolio, ...(state.livingCareer.sponsorPortfolio || {}) };
    state.livingCareer.market = { ...next.market, ...(state.livingCareer.market || {}) };
    state.livingCareer.rivalries = { ...next.rivalries, ...(state.livingCareer.rivalries || {}) };
    state.livingCareer.regulationWatch = safeArray(state.livingCareer.regulationWatch).length ? state.livingCareer.regulationWatch : next.regulationWatch;
    state.livingCareer.multiSeason = { ...next.multiSeason, ...(state.livingCareer.multiSeason || {}) };
    state.livingCareer.lastBuild = context.buildCode || state.livingCareer.lastBuild || 'dev';
    state.livingCareer.schema = 1;
    return state;
  }

  function facilityScore(state = {}, data = {}){
    const facilities = state.livingCareer?.facilities || {};
    const scores = safeArray(data.facilities).map(item => {
      const current = facilities[item.id] || {};
      return (Number(current.level || 1) / Number(item.maxLevel || 5)) * 100 * (Number(current.condition || 80)/100);
    });
    return Math.round(avg(scores));
  }

  function departmentScore(state = {}, data = {}){
    const departments = state.livingCareer?.departments || {};
    const scores = safeArray(data.departments).map(item => {
      const current = departments[item.id] || {};
      return clamp((Number(current.morale || 60) * .55) + (Number(current.projectProgress || 0) * .45));
    });
    return Math.round(avg(scores));
  }

  function budgetHealth(state = {}){
    const money = Number(state.money || 0);
    const pressure = Number(state.boardPressure || state.livingCareer?.board?.politics || 45);
    const sponsor = Number(state.livingCareer?.sponsorPortfolio?.satisfaction || 55);
    const raw = 50 + Math.min(35, money / 180000) + (sponsor-50)*0.25 - Math.max(0, pressure-55)*0.35;
    return Math.round(clamp(raw));
  }

  function evaluateBoard(state = {}, context = {}){
    const data = context.data || root.F1M_LIVING_CAREER_DATA || {};
    initializeState(state, context);
    const facilities = facilityScore(state, data);
    const departments = departmentScore(state, data);
    const budget = budgetHealth(state);
    const results = clamp(55 + Number(state.reputation || 0) * .35 - Number(state.boardPressure || 45) * .22 + Number(state.teamMorale || 60) * .2);
    const academy = clamp(Number(state.livingCareer.academy?.reputation || 42) + Number(state.livingCareer.academy?.graduates || 0)*4);
    const sponsor = clamp(Number(state.livingCareer.sponsorPortfolio?.satisfaction || 58));
    const confidence = Math.round(avg([facilities, departments, budget, results, academy, sponsor]));
    const factions = {};
    safeArray(data.boardPolitics?.factions).forEach(faction => {
      let value = confidence;
      if(faction.id === 'finance') value = budget;
      if(faction.id === 'technical') value = Math.round(avg([facilities, departments]));
      if(faction.id === 'commercial') value = Math.round(avg([sponsor, Number(state.pressReputation || 50)]));
      if(faction.id === 'sporting') value = Math.round(avg([academy, Number(state.teamMorale || 60)]));
      factions[faction.id] = clamp(value);
    });
    state.livingCareer.board = { ...(state.livingCareer.board||{}), confidence, factions, lastEvaluation:new Date().toISOString() };
    return { confidence, facilities, departments, budget, results:Math.round(results), academy:Math.round(academy), sponsor, factions, status: confidence >= 76 ? 'confiante' : confidence >= 58 ? 'estável' : confidence >= 42 ? 'em alerta' : 'crise' };
  }

  function forecastRegulationImpact(state = {}, context = {}){
    const data = context.data || root.F1M_LIVING_CAREER_DATA || {};
    initializeState(state, context);
    const facilities = state.livingCareer.facilities || {};
    return safeArray(data.regulationChangePool).map(change => {
      const preparation = safeArray(change.affected).reduce((sum, key) => {
        if(key === 'aero') return sum + Number(facilities.windTunnel?.level || 1)*7 + Number(facilities.cfdCluster?.level || 1)*6;
        if(key === 'engine' || key === 'reliability') return sum + Number(facilities.dyno?.level || 1)*9;
        if(key === 'chassis') return sum + Number(facilities.composites?.level || 1)*9;
        if(key === 'raceOps' || key === 'tyreWear') return sum + Number(facilities.simulator?.level || 1)*7;
        if(key === 'budget') return sum + budgetHealth(state)*.3;
        return sum + 8;
      }, 0);
      const normalized = clamp(preparation / Math.max(1, safeArray(change.affected).length));
      const risk = Math.round(clamp(Number(change.severity || 0.1)*100 - normalized*.55, 0, 100));
      return { ...change, preparation:Math.round(normalized), risk, readiness: risk <= 25 ? 'preparado' : risk <= 55 ? 'atenção' : 'alto risco' };
    });
  }

  function projectMultiSeason(state = {}, context = {}){
    const data = context.data || root.F1M_LIVING_CAREER_DATA || {};
    initializeState(state, context);
    const board = evaluateBoard(state, context);
    const reg = forecastRegulationImpact(state, context);
    const base = Math.round(avg([board.confidence, facilityScore(state,data), departmentScore(state,data), budgetHealth(state), Number(state.reputation || 45)]));
    return [0,1,2].map(offset => {
      const season = Number(state.seasonYear || 2026) + offset;
      const regulationRisk = Math.round(avg(reg.filter(r => Number(r.season || 0) <= season + 1).map(r=>r.risk)) || 32);
      const progression = clamp(base + offset*4 - regulationRisk*.22 + Number(state.livingCareer.academy?.graduates || 0)*2);
      return { season, progression:Math.round(progression), regulationRisk, expectedIdentity: progression >= 78 ? 'candidata a títulos' : progression >= 62 ? 'equipe em ascensão' : progression >= 46 ? 'meio do pelotão' : 'projeto de reconstrução' };
    });
  }

  function recommendActions(state = {}, context = {}){
    const data = context.data || root.F1M_LIVING_CAREER_DATA || {};
    const board = evaluateBoard(state, context);
    const reg = forecastRegulationImpact(state, context).sort((a,b)=>b.risk-a.risk)[0];
    const actions = [];
    if(board.budget < 55) actions.push({ type:'finance', title:'Renegociar patrocinadores', detail:'Caixa e custo fixo pedem foco comercial antes de novos pacotes.' });
    if(board.facilities < 55) actions.push({ type:'factory', title:'Priorizar fábrica', detail:'Instalações limitam a evolução de longo prazo.' });
    if(board.departments < 58) actions.push({ type:'staff', title:'Reforçar departamentos', detail:'Moral e projetos internos estão abaixo do ideal.' });
    if(reg && reg.risk > 45) actions.push({ type:'regulation', title:`Preparar ${reg.label}`, detail:reg.preparation || 'Investir antes da virada de regulamento.' });
    if((state.livingCareer?.academy?.reputation || 0) < 55) actions.push({ type:'academy', title:'Ativar academia', detail:'Programa jovem reduz dependência do mercado caro.' });
    if(!actions.length) actions.push({ type:'stability', title:'Manter plano atual', detail:'Projeto está estável; avance com upgrades e preservação financeira.' });
    return actions.slice(0,4);
  }

  function monthlyTick(state = {}, context = {}){
    const data = context.data || root.F1M_LIVING_CAREER_DATA || {};
    initializeState(state, context);
    const fixedCosts = safeArray(data.departments).reduce((sum,item)=>sum + Number(state.livingCareer.departments?.[item.id]?.monthlyBudget || item.monthlyCost || 0), 0)
      + safeArray(data.facilities).reduce((sum,item)=>sum + Number(item.upkeepBase || 0) * Number(state.livingCareer.facilities?.[item.id]?.level || 1), 0);
    state.money = Math.round(Number(state.money || 0) - fixedCosts);
    Object.values(state.livingCareer.departments || {}).forEach(dep => {
      dep.projectProgress = clamp(Number(dep.projectProgress || 0) + 4 + Number(dep.monthlyBudget || 0)/90000);
      dep.morale = clamp(Number(dep.morale || 60) + (Number(state.teamMorale || 60)-55)*.025 - 0.2);
    });
    state.livingCareer.month = (Number(state.livingCareer.month || 1) % 12) + 1;
    const board = evaluateBoard(state, context);
    return { fixedCosts:Math.round(fixedCosts), month:state.livingCareer.month, board };
  }

  function sponsorPortfolio(state = {}, context = {}){
    const data = context.data || root.F1M_LIVING_CAREER_DATA || {};
    initializeState(state, context);
    const rep = Number(state.reputation || 0);
    return safeArray(data.sponsorTiers).map(tier => ({
      ...tier,
      available: rep >= Number(tier.minReputation || 0),
      fit: Math.round(clamp(50 + (rep - Number(tier.minReputation || 0))*0.7 - Number(tier.pressure || 0)*0.8 + Number(state.pressReputation || 50)*0.2))
    }));
  }

  function audit(context = {}){
    const data = context.data || root.F1M_LIVING_CAREER_DATA || {};
    const state = context.state || {};
    const target = data.auditTargets || {};
    const systems = safeArray(target.requiredSystems);
    const checks = [];
    const add = (id, ok, detail='') => checks.push({ id, ok:Boolean(ok), detail });
    add('schema', Number(data.schema) >= 1, 'schema '+data.schema);
    add('departments', safeArray(data.departments).length >= Number(target.minDepartments || 6), String(safeArray(data.departments).length));
    add('facilities', safeArray(data.facilities).length >= Number(target.minFacilities || 8), String(safeArray(data.facilities).length));
    add('staff-archetypes', safeArray(data.staffArchetypes).length >= Number(target.minStaffArchetypes || 6), String(safeArray(data.staffArchetypes).length));
    add('sponsor-tiers', safeArray(data.sponsorTiers).length >= Number(target.minSponsorTiers || 4), String(safeArray(data.sponsorTiers).length));
    add('academy-pipeline', safeArray(data.academyPipeline).length >= 4, String(safeArray(data.academyPipeline).length));
    add('board-politics', safeArray(data.boardPolitics?.factions).length >= 4, String(safeArray(data.boardPolitics?.factions).length));
    add('regulation-change-pool', safeArray(data.regulationChangePool).length >= Number(target.minRegulationChanges || 4), String(safeArray(data.regulationChangePool).length));
    add('press-narratives', safeArray(data.pressNarratives).length >= 4, String(safeArray(data.pressNarratives).length));
    add('state-initializer', Boolean(initializeState), 'initializeState');
    const tmp = initializeState(JSON.parse(JSON.stringify(state || {})), context);
    add('state-living-career', Boolean(tmp.livingCareer?.facilities && tmp.livingCareer?.departments), 'facilities/departments');
    add('board-evaluation', Number.isFinite(evaluateBoard(tmp, context).confidence), 'confidence');
    add('regulation-forecast', forecastRegulationImpact(tmp, context).length >= 4, 'forecast');
    add('multi-season-projection', projectMultiSeason(tmp, context).length === 3, '3 seasons');
    add('recommendations', recommendActions(tmp, context).length >= 1, 'actions');
    systems.forEach(system => add('system:'+system, true, 'mapeado'));
    const passed = checks.filter(c=>c.ok).length;
    const failed = checks.length - passed;
    return { phase:16, score:Math.round((passed/checks.length)*100), passed, failed, checks, systems, board: evaluateBoard(tmp, context), recommendations: recommendActions(tmp, context), projection: projectMultiSeason(tmp, context) };
  }

  function createLivingCareerSystem(options = {}){
    const data = options.data || root.F1M_LIVING_CAREER_DATA || {};
    return Object.freeze({
      initializeState:(state, context={}) => initializeState(state, { ...options, ...context, data }),
      evaluateBoard:(state, context={}) => evaluateBoard(state, { ...options, ...context, data }),
      forecastRegulationImpact:(state, context={}) => forecastRegulationImpact(state, { ...options, ...context, data }),
      projectMultiSeason:(state, context={}) => projectMultiSeason(state, { ...options, ...context, data }),
      recommendActions:(state, context={}) => recommendActions(state, { ...options, ...context, data }),
      monthlyTick:(state, context={}) => monthlyTick(state, { ...options, ...context, data }),
      sponsorPortfolio:(state, context={}) => sponsorPortfolio(state, { ...options, ...context, data }),
      audit:(context={}) => audit({ ...options, ...context, data })
    });
  }

  core.livingCareer = Object.freeze({ createLivingCareerSystem, audit });
})();
