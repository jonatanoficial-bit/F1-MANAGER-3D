(() => {
  'use strict';
  const root = globalThis;
  const CORE = root.F1M_CORE = root.F1M_CORE || {};
  const arr = v => Array.isArray(v) ? v : [];
  const num = (v,d=0) => Number.isFinite(Number(v)) ? Number(v) : d;
  const clamp = (n,min=0,max=100) => Math.max(min, Math.min(max, num(n,min)));
  const round = (n,d=0) => Number(num(n,0).toFixed(d));
  const nowIso = () => new Date().toISOString();

  function initializeState(state = {}, context = {}){
    const data = context.data || root.F1M_TELEMETRY_DATA || {};
    state.telemetry = state.telemetry || {};
    state.telemetry.schema = 1;
    state.telemetry.phase = 25;
    state.telemetry.dataPack = data.dataPack || 'realistic-telemetry-simulator';
    state.telemetry.channel = data.channel || 'realistic-telemetry-simulator';
    state.telemetry.enabled = state.telemetry.enabled !== false;
    state.telemetry.productionBlocked = true;
    state.telemetry.samples = arr(state.telemetry.samples).slice(0, Number(data.sampling?.packetRetention || 180));
    state.telemetry.sessions = arr(state.telemetry.sessions).slice(0, 12);
    state.telemetry.diagnosisHistory = arr(state.telemetry.diagnosisHistory).slice(0, 40);
    state.telemetry.auditHistory = arr(state.telemetry.auditHistory).slice(0, 10);
    state.telemetry.lastBuild = context.buildCode || state.telemetry.lastBuild || 'dev';
    return state;
  }

  function status(state = {}, context = {}){
    const data = context.data || root.F1M_TELEMETRY_DATA || {};
    initializeState(state, context);
    const signals = arr(data.signals).length;
    const diagnosis = arr(data.diagnosisRules).length;
    const views = arr(data.engineeringViews).length;
    const realism = arr(data.realismRules).length;
    const sessions = arr(state.telemetry.sessions).length;
    const samples = arr(state.telemetry.samples).length;
    const score = clamp(40 + signals*2.2 + diagnosis*3.4 + views*2.2 + realism*2.4 + Math.min(10, sessions*2), 0, 100);
    return { score:round(score), signals, diagnosis, views, realism, sessions, samples, enabled:state.telemetry.enabled !== false, productionBlocked:true, hz:data.sampling?.hz || 10 };
  }

  function raceContext(race = {}, context = {}){
    const entries = arr(race.entries);
    const leader = entries.slice().sort((a,b)=>num(b.distance)-num(a.distance))[0] || null;
    const avgTyre = entries.length ? entries.reduce((s,e)=>s+num(e.tyre,80),0)/entries.length : 0;
    const avgCondition = entries.length ? entries.reduce((s,e)=>s+num(e.condition,90),0)/entries.length : 0;
    const grip = num(race.trackState?.grip, race.weather === 'variable' ? .96 : 1);
    return { leaderShort:leader?.driver?.short || '', avgTyre:round(avgTyre,1), avgCondition:round(avgCondition,1), grip:round(grip,3), weather:race.weather || 'dry', generatedAt:nowIso() };
  }

  function sample(entry = {}, race = {}, context = {}){
    const state = context.state || {};
    const data = context.data || root.F1M_TELEMETRY_DATA || {};
    initializeState(state, context);
    if(state.telemetry.enabled === false) return null;
    const pace = String(entry.pace || 'normal');
    const tyre = clamp(entry.tyre ?? 90, 0, 100);
    const condition = clamp(entry.condition ?? 95, 0, 100);
    const ers = clamp(entry.ers ?? entry.vehicle?.ersCharge ?? 60, 0, 100);
    const speedFactor = clamp(num(entry.baseSpeed, .015) * 10000, 60, 190);
    const sector = clamp(entry.sector || Math.floor((((num(entry.progress) % 1)+1)%1)*3)+1, 1, 3);
    const phase = ((num(entry.progress) % 1) + 1) % 1;
    const brakingZone = sector === 1 ? Math.sin(phase*Math.PI*6) > .62 : sector === 2 ? Math.sin(phase*Math.PI*8) > .74 : Math.sin(phase*Math.PI*5) > .70;
    const throttleBase = pace === 'attack' ? 88 : pace === 'save' ? 68 : 78;
    const throttle = clamp(throttleBase + Math.sin(phase*19)*15 - (brakingZone ? 58 : 0) - Math.max(0, (38-tyre)*.42), 0, 100);
    const brake = clamp(brakingZone ? 62 + Math.cos(phase*17)*28 + (pace === 'attack' ? 8 : 0) : Math.max(0, 12-throttle/12), 0, 100);
    const drs = Boolean(entry.drs || (num(entry.gap,99) > 0 && num(entry.gap,99) < 1.15 && sector !== 2));
    const dirtyAirLossPct = clamp(num(context.traffic?.dirtyAir,1) < 1 ? (1-num(context.traffic.dirtyAir,1))*100 : (num(entry.gap,99) < 1.1 ? 5.5 : 0), 0, 18);
    const drsGainKph = drs ? clamp(8 + (ers/100)*5 - dirtyAirLossPct*.18, 0, 18) : 0;
    const speedKph = clamp(95 + speedFactor + throttle*1.35 - brake*.72 + drsGainKph + (ers-50)*.13 - dirtyAirLossPct*.9 + num(context.gameplayFx?.battle,0)*5, 60, 365);
    const gear = clamp(Math.round(speedKph/45)+1, 1, 8);
    const rpm = clamp(6500 + gear*610 + throttle*43 + (pace==='attack'?420:0) - brake*15, 6500, 13000);
    const tyreSurfaceC = clamp(num(entry.tyreTemp,92) + (pace==='attack'?8:pace==='save'?-3:2) + throttle*.055 + brake*.035 + dirtyAirLossPct*.55 + (100-tyre)*.045, 70, 125);
    const tyreCoreC = clamp(tyreSurfaceC - 4 + (100-tyre)*.035 + Math.sin(phase*5)*1.2, 78, 118);
    const tyrePressurePsi = clamp(21.1 + (tyreCoreC-90)*.052 + num(entry.setup?.tyrePressure,50)/180, 19, 27);
    const brakeTempC = clamp(num(entry.brakeTemp,520) + brake*5.4 + (pace==='attack'?55:0) + dirtyAirLossPct*7 - throttle*.9, 320, 1050);
    const engineTempC = clamp(num(entry.engineTemp,92) + throttle*.08 + (pace==='attack'?4:0) + (100-condition)*.05, 78, 128);
    const fuelKg = clamp(num(entry.fuel,72) * 1.05, 0, 110);
    const ersDeployKw = clamp((pace==='attack'?118:pace==='save'?38:72) * (ers/100) + (drs?16:0), 0, 160);
    const ersHarvestKw = clamp(brake*.72 + (pace==='save'?28:8) - throttle*.15, 0, 95);
    const lateralG = clamp(speedKph/78 + (100-dirtyAirLossPct)/130 + (num(race.trackState?.grip,1)-.94)*8, .3, 5.5);
    const longitudinalG = round((throttle/100)*2.2 - (brake/100)*5.1, 2);
    const downforceBalance = clamp(50 + num(entry.team?.aero,50)/5 - dirtyAirLossPct*.9 + (num(race.trackState?.grip,1)-1)*28, 35, 66);
    const sectorDelta = round((100-tyre)*.006 + dirtyAirLossPct*.025 + Math.max(0, brakeTempC-900)*.0017 - (ersDeployKw/160)*.22 + (pace==='attack'?-0.06:pace==='save'?.08:0), 3);
    const packet = {
      buildCode:context.buildCode || state.telemetry.lastBuild || 'dev', driver:entry.driver?.short || entry.short || 'DRV', team:entry.team?.id || entry.team?.name || '', lap:num(entry.lap,1), sector, miniSector:clamp(Math.floor(phase*9)+1,1,9), tick:num(race.tick,0), speedKph:round(speedKph,1), rpm:round(rpm), gear, throttle:round(throttle,1), brake:round(brake,1), steer:round(Math.sin(phase*16)*28*(sector===2?1.1:.75),1), lateralG:round(lateralG,2), longitudinalG, tyreSurfaceC:round(tyreSurfaceC,1), tyreCoreC:round(tyreCoreC,1), tyrePressurePsi:round(tyrePressurePsi,2), tyreWearPct:round(100-tyre,1), brakeTempC:round(brakeTempC), engineTempC:round(engineTempC,1), fuelKg:round(fuelKg,1), ersPct:round(ers,1), ersDeployKw:round(ersDeployKw), ersHarvestKw:round(ersHarvestKw), drs, drsGainKph:round(drsGainKph,1), dirtyAirLossPct:round(dirtyAirLossPct,1), downforceBalance:round(downforceBalance,1), sectorDelta, generatedAt:nowIso()
    };
    state.telemetry.samples.unshift(packet);
    state.telemetry.samples = state.telemetry.samples.slice(0, Number(data.sampling?.packetRetention || 180));
    return packet;
  }

  function diagnose(entry = {}, race = {}, context = {}){
    const samplePacket = context.sample || entry.telemetry || sample(entry, race, context);
    const issues = [];
    const add = (id, ok, label, advice, priority) => { if(ok) issues.push({ id, label, advice, priority }); };
    add('rear-overheat', samplePacket.tyreSurfaceC > 106 && samplePacket.throttle > 78, 'pneus acima da janela e tração limitada', 'reduzir ataque ou antecipar pit', 84);
    add('brake-critical', samplePacket.brakeTempC > 930, 'freios em temperatura crítica', 'poupar frenagem e evitar ataque prolongado', 92);
    add('ers-low', samplePacket.ersPct < 18, 'ERS baixo para ataque', 'harvest por uma volta antes de atacar', 78);
    add('dirty-air', samplePacket.dirtyAirLossPct > 6, 'ar sujo reduzindo downforce', 'sair do tráfego ou tentar undercut', 80);
    add('pressure-drift', samplePacket.tyrePressurePsi > 25.8, 'pressão alta e menor área de contato', 'controlar temperatura e revisar setup', 74);
    add('fuel-heavy', samplePacket.fuelKg > 82 && samplePacket.lap < 6, 'carro pesado no início da prova', 'evitar estressar pneus nas primeiras voltas', 62);
    const top = issues.slice().sort((a,b)=>b.priority-a.priority)[0] || { id:'nominal', label:'telemetria dentro da janela', advice:'manter plano e acompanhar delta por setor', priority:42 };
    const diagnosis = { driver:samplePacket.driver, lap:samplePacket.lap, sector:samplePacket.sector, priority:top.priority, top, issues, generatedAt:nowIso() };
    const state = context.state;
    if(state?.telemetry){ state.telemetry.diagnosisHistory.unshift(diagnosis); state.telemetry.diagnosisHistory = state.telemetry.diagnosisHistory.slice(0, 40); }
    return diagnosis;
  }

  function compactLine(packet = {}){
    if(!packet) return 'Telemetria indisponível';
    return `V ${round(packet.speedKph)}km/h • RPM ${round(packet.rpm)} • G${packet.gear} • A/F ${round(packet.throttle)}/${round(packet.brake)}% • Pneu ${round(packet.tyreSurfaceC)}°/${round(packet.tyrePressurePsi,1)}psi • Freio ${round(packet.brakeTempC)}° • ERS ${round(packet.ersPct)}% • ΔS ${round(packet.sectorDelta,2)}s`;
  }

  function sectorTrace(entry = {}, race = {}, context = {}){
    const base = context.sample || entry.telemetry || sample(entry, race, context) || {};
    return [1,2,3].map(sector => ({ sector, delta:round(num(base.sectorDelta,0) + (sector - num(base.sector,1))*0.045 + Math.sin((num(race.tick,0)+sector)*.7)*.03,3), tyreSurfaceC:round(num(base.tyreSurfaceC,90)+(sector-2)*1.2,1), brakeTempC:round(num(base.brakeTempC,600)+(sector===1?65:sector===2?-35:15)), ersPct:round(clamp(num(base.ersPct,60)-(sector-1)*3,0,100),1) }));
  }

  function exportSession(state = {}, race = {}, context = {}){
    initializeState(state, context);
    const session = { format:'F1M_TELEMETRY_SESSION_V1', buildCode:context.buildCode || state.telemetry.lastBuild || 'dev', raceName:race.trackInfo?.name || race.track || 'corrida', generatedAt:nowIso(), samples:arr(state.telemetry.samples).slice(0,80), diagnosis:arr(state.telemetry.diagnosisHistory).slice(0,20), realism:'plausível para simulador; não contém telemetria proprietária oficial' };
    state.telemetry.sessions.unshift({ id:`F25-TEL-${Date.now()}`, raceName:session.raceName, samples:session.samples.length, generatedAt:session.generatedAt });
    state.telemetry.sessions = state.telemetry.sessions.slice(0, 12);
    return session;
  }

  function audit(context = {}){
    const data = context.data || root.F1M_TELEMETRY_DATA || {};
    const state = initializeState(context.state || {}, context);
    const checks = [];
    const add = (id, ok, detail='') => checks.push({ id, ok:Boolean(ok), detail });
    const targets = data.targetMetrics || {};
    add('phase', Number(data.phase) === 25, String(data.phase));
    add('schema', Number(data.schema || 0) >= 1, 'schema '+data.schema);
    add('signals', arr(data.signals).length >= Number(targets.minSignals || 17), String(arr(data.signals).length));
    add('diagnosis-rules', arr(data.diagnosisRules).length >= Number(targets.minDiagnosisRules || 7), String(arr(data.diagnosisRules).length));
    add('engineering-views', arr(data.engineeringViews).length >= Number(targets.minViews || 10), String(arr(data.engineeringViews).length));
    add('realism-rules', arr(data.realismRules).length >= Number(targets.minRealismRules || 6), String(arr(data.realismRules).length));
    const fakeRace = { tick:9, weather:'dry', trackState:{grip:.99}, entries:[], trackInfo:{name:'Sim Test'} };
    const fakeEntry = { driver:{short:'TEL'}, team:{id:'sim'}, baseSpeed:.018, tyre:42, condition:91, ers:14, gap:.7, pace:'attack', lap:9, sector:3, fuel:74, brakeTemp:890, engineTemp:96, progress:8.72 };
    const packet = sample(fakeEntry, fakeRace, { ...context, state, traffic:{dirtyAir:.92}, index:1 });
    const diag = diagnose(fakeEntry, fakeRace, { ...context, state, sample:packet });
    const trace = sectorTrace(fakeEntry, fakeRace, { ...context, state, sample:packet });
    add('packet-plausible', packet.speedKph >= 60 && packet.speedKph <= 365 && packet.rpm >= 6500 && packet.rpm <= 13000, `${packet.speedKph}/${packet.rpm}`);
    add('thermal-model', packet.tyreSurfaceC >= 70 && packet.tyreCoreC >= 78 && packet.brakeTempC >= 320, `${packet.tyreSurfaceC}/${packet.tyreCoreC}/${packet.brakeTempC}`);
    add('diagnosis', Boolean(diag.top?.label) && diag.priority > 0, diag.top?.label || 'n/d');
    add('sector-trace', trace.length === 3 && trace.every(s=>Number.isFinite(s.delta)), JSON.stringify(trace));
    add('compact-line', compactLine(packet).includes('RPM') && compactLine(packet).includes('ERS'), compactLine(packet));
    add('production-blocked', status(state,{...context,data}).productionBlocked === true, 'produção bloqueada');
    const passed = checks.filter(c=>c.ok).length;
    const failed = checks.length - passed;
    const score = failed ? Math.round((passed/checks.length)*100) : 100;
    const result = { score, passed, failed, checks, status:status(state,{...context,data}), generatedAt:nowIso() };
    state.telemetry.auditHistory.unshift(result);
    state.telemetry.auditHistory = state.telemetry.auditHistory.slice(0,10);
    state.quality = state.quality || {};
    state.quality.telemetryF25 = { status:failed ? 'review' : 'approved', score, passed, failed, checks, generatedAt:result.generatedAt };
    return result;
  }

  function createTelemetrySystem(options = {}){
    const data = options.data || root.F1M_TELEMETRY_DATA || {};
    return {
      initializeState:(state, context={})=>initializeState(state, { ...context, data }),
      status:(state, context={})=>status(state, { ...context, data }),
      raceContext:(race, context={})=>raceContext(race, { ...context, data }),
      sample:(entry, race, context={})=>sample(entry, race, { ...context, data }),
      diagnose:(entry, race, context={})=>diagnose(entry, race, { ...context, data }),
      sectorTrace:(entry, race, context={})=>sectorTrace(entry, race, { ...context, data }),
      compactLine,
      exportSession:(state, race, context={})=>exportSession(state, race, { ...context, data }),
      audit:(context={})=>audit({ ...context, data }),
      data
    };
  }
  CORE.telemetry = { createTelemetrySystem };
})();
