(() => {
  'use strict';
  const root = globalThis;
  const CORE = root.F1M_CORE = root.F1M_CORE || {};
  const arr = value => Array.isArray(value) ? value : [];
  const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, num(value, min)));
  const round = (value, digits = 0) => Number(num(value, 0).toFixed(digits));
  const nowIso = () => new Date().toISOString();

  function defaultSetup(data = {}){
    return Object.fromEntries(arr(data.setupParameters).map(parameter => [parameter.id, parameter.neutral]));
  }

  function initializeState(state = {}, context = {}){
    const data = context.data || root.F1M_SETUP_ENGINEERING_DATA || {};
    state.setupEngineering = state.setupEngineering || {};
    state.setupEngineering.schema = 1;
    state.setupEngineering.phase = 26;
    state.setupEngineering.dataPack = data.dataPack || 'advanced-setup-engineering';
    state.setupEngineering.channel = data.channel || 'advanced-setup-engineering';
    state.setupEngineering.productionBlocked = true;
    state.setupEngineering.activeSetup = { ...defaultSetup(data), ...(state.setupEngineering.activeSetup || {}) };
    state.setupEngineering.practiceRuns = arr(state.setupEngineering.practiceRuns).slice(0, 20);
    state.setupEngineering.correlationHistory = arr(state.setupEngineering.correlationHistory).slice(0, 20);
    state.setupEngineering.auditHistory = arr(state.setupEngineering.auditHistory).slice(0, 10);
    state.setupEngineering.lastBuild = context.buildCode || state.setupEngineering.lastBuild || 'dev';
    return state;
  }

  function inferTrackArchetype(track = {}, context = {}){
    const data = context.data || root.F1M_SETUP_ENGINEERING_DATA || {};
    const name = String(track.name || track.id || '').toLowerCase();
    const weather = String(track.weather || context.weather || '').toLowerCase();
    if(/monaco|singapore|las vegas|baku|street|rua/.test(name)) return arr(data.trackArchetypes).find(x => x.id === 'street-high-downforce') || arr(data.trackArchetypes)[0];
    if(/monza|jeddah|spa|silverstone|power|reta/.test(name)) return arr(data.trackArchetypes).find(x => x.id === 'power-low-drag') || arr(data.trackArchetypes)[1];
    if(/barcelona|hungaroring|front|dianteiro/.test(name)) return arr(data.trackArchetypes).find(x => x.id === 'front-limited') || arr(data.trackArchetypes)[3];
    if(/bahrain|rear|traseiro|traction|tração/.test(name) || weather.includes('hot')) return arr(data.trackArchetypes).find(x => x.id === 'rear-limited') || arr(data.trackArchetypes)[4];
    return arr(data.trackArchetypes).find(x => x.id === 'balanced-permanent') || arr(data.trackArchetypes)[2] || arr(data.trackArchetypes)[0];
  }

  function normaliseSetup(setup = {}, data = {}){
    const base = defaultSetup(data);
    const result = { ...base, ...setup };
    for(const parameter of arr(data.setupParameters)){
      result[parameter.id] = clamp(result[parameter.id], parameter.min, parameter.max);
    }
    return result;
  }

  function scoreSetup(setup = {}, track = {}, context = {}){
    const data = context.data || root.F1M_SETUP_ENGINEERING_DATA || {};
    const normalized = normaliseSetup(setup, data);
    const archetype = inferTrackArchetype(track, context) || { preference:{} };
    const preference = { ...defaultSetup(data), ...(archetype.preference || {}) };
    let raw = 100;
    const penalties = [];
    for(const parameter of arr(data.setupParameters)){
      const span = Math.max(1, num(parameter.max) - num(parameter.min));
      const diff = Math.abs(num(normalized[parameter.id], parameter.neutral) - num(preference[parameter.id], parameter.neutral));
      const penalty = diff / span * (parameter.id.includes('Wing') ? 12 : parameter.id.includes('Pressure') ? 8 : 6);
      raw -= penalty;
      if(penalty > 2.2) penalties.push({ id:parameter.id, label:parameter.label, penalty:round(penalty,2), target:preference[parameter.id] ?? parameter.neutral, current:normalized[parameter.id] });
    }
    const frontWing = num(normalized.frontWing, 6);
    const rearWing = num(normalized.rearWing, 6);
    const aeroBalance = round((frontWing - rearWing) * 1.8, 1);
    const dragIndex = round((frontWing + rearWing) * 4.2 + num(normalized.toeFront,.1)*18 + num(normalized.toeRear,.22)*16, 1);
    const downforceIndex = round((frontWing + rearWing) * 6.5 + (60 - Math.abs(num(normalized.rideHeightFront,33) - 33))*0.18, 1);
    const tyreStressFront = round(40 + Math.abs(num(normalized.camberFront,-3.0)+3.0)*18 + num(normalized.toeFront,.1)*58 + (num(normalized.tyrePressureFront,22.5)-22.5)*4 + Math.max(0, frontWing-7)*2.2, 1);
    const tyreStressRear = round(42 + Math.abs(num(normalized.camberRear,-1.7)+1.7)*20 + num(normalized.toeRear,.22)*38 + (num(normalized.tyrePressureRear,21.5)-21.5)*4.2 + Math.max(0, num(normalized.differentialOnThrottle,65)-68)*.35, 1);
    const brakeStability = round(100 - Math.abs(num(normalized.brakeBias,56)-56)*7 - Math.max(0, num(normalized.differentialOffThrottle,55)-64)*.45, 1);
    const tractionIndex = round(82 + (rearWing-6)*2.2 - (num(normalized.rearAntiRoll,6)-6)*2.4 - (num(normalized.tyrePressureRear,21.5)-21.5)*3 - Math.abs(num(normalized.differentialOnThrottle,65)-62)*.4, 1);
    const bottomingRisk = round(clamp((34-num(normalized.rideHeightFront,33))*3.2 + (54-num(normalized.rideHeightRear,56))*1.7 + downforceIndex*.08, 0, 100), 1);
    const engineStress = round(45 + (num(normalized.engineMap,3)-3)*13 + dragIndex*.06, 1);
    const score = round(clamp(raw - Math.max(0, bottomingRisk-65)*.18 - Math.max(0, engineStress-80)*.12, 0, 100));
    const balance = aeroBalance > 3 ? 'dianteira agressiva' : aeroBalance < -3 ? 'traseira estável' : 'neutra';
    return { score, archetype:archetype.id || 'balanced', archetypeLabel:archetype.label || 'Balanceado', setup:normalized, penalties:penalties.slice(0,6), metrics:{ aeroBalance, dragIndex, downforceIndex, tyreStressFront, tyreStressRear, brakeStability, tractionIndex, bottomingRisk, engineStress, balance }, generatedAt:nowIso() };
  }

  function correlateTelemetry(setup = {}, telemetry = {}, track = {}, context = {}){
    const scoring = scoreSetup(setup, track, context);
    const t = telemetry || {};
    const issues = [];
    const add = (id, priority, label, advice) => issues.push({ id, priority:round(priority), label, advice });
    if(scoring.metrics.aeroBalance < -3 && num(t.steer, 0) > 12) add('understeer-entry', 86, 'subesterço de entrada detectado', 'aumentar asa dianteira 1 click ou reduzir rigidez/barra dianteira');
    if(num(t.tyreSurfaceC, 90) > 106 && scoring.metrics.tyreStressRear > 58) add('rear-thermal', 88, 'traseiros fora da janela térmica', 'baixar pressão traseira, reduzir toe/diferencial ou aliviar ritmo');
    if(num(t.brakeTempC, 600) > 930 || scoring.metrics.brakeStability < 72) add('brake-window', 90, 'freios ou bias em zona de risco', 'corrigir brake bias e evitar ataque prolongado em tráfego');
    if(scoring.metrics.dragIndex > 70 && num(t.drsGainKph, 0) < 7) add('drag', 76, 'arrasto alto limita reta mesmo com DRS', 'reduzir asa traseira/toe se o setor 2 permitir');
    if(scoring.metrics.bottomingRisk > 62) add('bottoming', 82, 'risco de bottoming prejudicando consistência', 'subir altura 1-2 mm e repetir baseline');
    if(num(t.ersPct, 70) < 18 && num(scoring.setup.engineMap, 3) >= 4) add('ers-engine-map', 74, 'mapa agressivo drenando energia', 'usar mapa 3 por uma volta e planejar deploy nos setores críticos');
    issues.sort((a,b)=>b.priority-a.priority);
    return { score:scoring.score, metrics:scoring.metrics, top:issues[0] || { id:'balanced', priority:0, label:'setup dentro da janela', advice:'validar em long run e qualy sim' }, issues, generatedAt:nowIso(), realism:'correlação plausível com telemetria; não usa dados proprietários oficiais' };
  }

  function simulatePractice(programmeId = 'baseline', setup = {}, track = {}, context = {}){
    const data = context.data || root.F1M_SETUP_ENGINEERING_DATA || {};
    const programme = arr(data.practiceProgrammes).find(p => p.id === programmeId) || arr(data.practiceProgrammes)[0] || { id:'baseline', label:'Baseline', laps:5, outputs:[] };
    const scoring = scoreSetup(setup, track, context);
    const confidence = clamp(scoring.score * .74 + arr(programme.outputs).length * 4 + num(programme.laps, 5) * 1.2, 0, 100);
    const tyreWindow = round(100 - Math.abs(scoring.metrics.tyreStressFront - 52)*.6 - Math.abs(scoring.metrics.tyreStressRear - 54)*.6, 1);
    const lapDelta = round((100 - scoring.score) * .018 + scoring.metrics.dragIndex * .002 + scoring.metrics.bottomingRisk * .004, 3);
    return { id:`F26-PR-${Date.now()}`, programme:programme.id, label:programme.label, laps:programme.laps, setupScore:scoring.score, confidence:round(confidence), tyreWindow, lapDelta, outputs:programme.outputs, metrics:scoring.metrics, recommendation:recommendSetup(scoring).label, generatedAt:nowIso() };
  }

  function recommendSetup(scoring = {}){
    const metrics = scoring.metrics || {};
    if(num(metrics.bottomingRisk) > 62) return { label:'subir altura e repetir baseline', priority:90 };
    if(num(metrics.brakeStability) < 74) return { label:'corrigir brake bias/diferencial off-throttle', priority:86 };
    if(num(metrics.tyreStressRear) > 62) return { label:'proteger traseiros com pressão/toe/diferencial', priority:82 };
    if(num(metrics.dragIndex) > 74) return { label:'reduzir arrasto para reta/DRS', priority:76 };
    if(num(metrics.aeroBalance) < -4) return { label:'dar mais frente ao carro', priority:72 };
    if(num(metrics.aeroBalance) > 4) return { label:'estabilizar traseira', priority:72 };
    return { label:'setup competitivo; validar long run e qualy sim', priority:40 };
  }

  function status(state = {}, context = {}){
    const data = context.data || root.F1M_SETUP_ENGINEERING_DATA || {};
    initializeState(state, context);
    const parameters = arr(data.setupParameters).length;
    const programmes = arr(data.practiceProgrammes).length;
    const correlations = arr(data.telemetryCorrelations).length;
    const score = clamp(35 + parameters*2.4 + programmes*4 + arr(data.trackArchetypes).length*3 + correlations*1.6 + arr(data.decisionRules).length*2, 0, 100);
    return { score:round(score), parameters, programmes, correlations, trackArchetypes:arr(data.trackArchetypes).length, practiceRuns:arr(state.setupEngineering.practiceRuns).length, productionBlocked:true };
  }

  function audit(context = {}){
    const data = context.data || root.F1M_SETUP_ENGINEERING_DATA || {};
    const state = initializeState(context.state || {}, context);
    const checks = [];
    const add = (id, ok, detail = '') => checks.push({ id, ok:Boolean(ok), detail });
    const targets = data.targetMetrics || {};
    add('phase', Number(data.phase) === 26, String(data.phase));
    add('schema', Number(data.schema || 0) >= 1, 'schema '+data.schema);
    add('parameters', arr(data.setupParameters).length >= Number(targets.minParameters || 18), String(arr(data.setupParameters).length));
    add('track-archetypes', arr(data.trackArchetypes).length >= Number(targets.minTrackArchetypes || 5), String(arr(data.trackArchetypes).length));
    add('practice-programmes', arr(data.practiceProgrammes).length >= Number(targets.minPracticeProgrammes || 4), String(arr(data.practiceProgrammes).length));
    add('telemetry-correlations', arr(data.telemetryCorrelations).length >= Number(targets.minCorrelations || 9), String(arr(data.telemetryCorrelations).length));
    add('decision-rules', arr(data.decisionRules).length >= Number(targets.minDecisionRules || 6), String(arr(data.decisionRules).length));
    const setup = { ...defaultSetup(data), frontWing:4, rearWing:9, rideHeightFront:29, rideHeightRear:52, brakeBias:59.2, tyrePressureRear:23.6, engineMap:5, differentialOnThrottle:78 };
    const track = { name:'Bahrain rear limited hot' };
    const scoring = scoreSetup(setup, track, context);
    const telemetry = { tyreSurfaceC:112, brakeTempC:965, ersPct:12, drsGainKph:5, steer:15 };
    const corr = correlateTelemetry(setup, telemetry, track, context);
    const practice = simulatePractice('long-run', setup, track, context);
    add('score-model', Number.isFinite(scoring.score) && scoring.score >= 0 && scoring.score <= 100, `${scoring.score}/100`);
    add('metric-model', scoring.metrics.dragIndex > 0 && scoring.metrics.bottomingRisk >= 0 && scoring.metrics.tyreStressRear > 0, JSON.stringify(scoring.metrics));
    add('correlation-issues', corr.issues.length >= 2 && corr.top.priority > 0, corr.top.label);
    add('practice-run', practice.programme === 'long-run' && practice.laps >= 6 && Number.isFinite(practice.lapDelta), JSON.stringify(practice));
    add('recommendation', Boolean(recommendSetup(scoring).label), recommendSetup(scoring).label);
    add('production-blocked', status(state, context).productionBlocked === true, 'produção bloqueada');
    const passed = checks.filter(c=>c.ok).length;
    const failed = checks.length - passed;
    const score = failed ? Math.round((passed/checks.length)*100) : 100;
    const result = { score, passed, failed, checks, status:status(state, context), generatedAt:nowIso() };
    state.setupEngineering.auditHistory.unshift(result);
    state.setupEngineering.auditHistory = state.setupEngineering.auditHistory.slice(0, 10);
    state.quality = state.quality || {};
    state.quality.setupEngineeringF26 = { status:failed ? 'review' : 'approved', score, passed, failed, checks, generatedAt:result.generatedAt };
    return result;
  }

  function createSetupEngineeringSystem(options = {}){
    const data = options.data || root.F1M_SETUP_ENGINEERING_DATA || {};
    return {
      initializeState:(state, context={})=>initializeState(state, { ...context, data }),
      status:(state, context={})=>status(state, { ...context, data }),
      defaultSetup:()=>defaultSetup(data),
      inferTrackArchetype:(track, context={})=>inferTrackArchetype(track, { ...context, data }),
      scoreSetup:(setup, track, context={})=>scoreSetup(setup, track, { ...context, data }),
      correlateTelemetry:(setup, telemetry, track, context={})=>correlateTelemetry(setup, telemetry, track, { ...context, data }),
      simulatePractice:(programmeId, setup, track, context={})=>simulatePractice(programmeId, setup, track, { ...context, data }),
      recommendSetup,
      audit:(context={})=>audit({ ...context, data }),
      data
    };
  }
  CORE.setupEngineering = { createSetupEngineeringSystem };
})();
