(() => {
  'use strict';
  const root = globalThis;
  const CORE = root.F1M_CORE = root.F1M_CORE || {};
  const arr = v => Array.isArray(v) ? v : [];
  const clamp = (n,min=0,max=100) => Math.max(min, Math.min(max, Number.isFinite(Number(n)) ? Number(n) : min));
  const round = n => Math.round(Number(n) || 0);
  const nowIso = () => new Date().toISOString();

  function activeProfile(data, id){
    return arr(data.profiles).find(p => p.id === id) || arr(data.profiles)[0] || { id:'realistic', label:'Realista', paceWindow:.022, battleBias:.54, riskBias:.92, tyreWeight:.34, playerAgency:.74 };
  }

  function initializeState(state = {}, context = {}){
    const data = context.data || root.F1M_GAMEPLAY_POLISH_DATA || {};
    state.gameplayPolish = state.gameplayPolish || {};
    state.gameplayPolish.schema = 1;
    state.gameplayPolish.phase = 24;
    state.gameplayPolish.dataPack = data.dataPack || 'gameplay-perfect-beta';
    state.gameplayPolish.channel = data.channel || 'gameplay-perfect-beta';
    state.gameplayPolish.profile = state.gameplayPolish.profile || 'realistic';
    state.gameplayPolish.evidence = arr(state.gameplayPolish.evidence);
    state.gameplayPolish.raceNotes = arr(state.gameplayPolish.raceNotes);
    state.gameplayPolish.auditHistory = arr(state.gameplayPolish.auditHistory);
    state.gameplayPolish.productionBlocked = true;
    state.gameplayPolish.lastBuild = context.buildCode || state.gameplayPolish.lastBuild || 'dev';
    return state;
  }

  function status(state = {}, context = {}){
    const data = context.data || root.F1M_GAMEPLAY_POLISH_DATA || {};
    initializeState(state, context);
    const profile = activeProfile(data, state.gameplayPolish.profile);
    const signals = arr(data.telemetryHud).length;
    const rules = arr(data.fairnessRules).length + arr(data.pitWallRules).length;
    const triggers = arr(data.battleTriggers).length;
    const evidence = arr(state.gameplayPolish.evidence).length;
    const score = round(clamp(42 + arr(data.profiles).length*7 + triggers*5 + rules*3 + signals*3 + Math.min(10,evidence*2)));
    return { score, profile:profile.id, profileLabel:profile.label, battleTriggers:triggers, pitWallRules:arr(data.pitWallRules).length, fairnessRules:arr(data.fairnessRules).length, hudSignals:signals, evidence, productionBlocked:true };
  }

  function raceContext(race = {}, context = {}){
    const state = context.state || {};
    const data = context.data || root.F1M_GAMEPLAY_POLISH_DATA || {};
    initializeState(state, context);
    const profile = activeProfile(data, state.gameplayPolish.profile);
    const leader = arr(race.entries).slice().sort((a,b)=>(b.distance||0)-(a.distance||0))[0] || null;
    const player = arr(race.entries).filter(e => context.isPlayer?.(e.driver?.short)).sort((a,b)=>(a.pos||99)-(b.pos||99))[0] || null;
    const battleIntensity = arr(race.entries).filter((e,idx,list)=>idx>0 && Math.abs((list[idx-1]?.distance||0)-(e.distance||0))*82 < 2.2).length;
    return { profile, leaderShort:leader?.driver?.short || '', playerShort:player?.driver?.short || '', battleIntensity, neutralized:Boolean(race.safetyCar > 0 || race.vsc > 0 || race.redFlag > 0), generatedAt:nowIso() };
  }

  function pitAdvice(entry = {}, race = {}, context = {}){
    const tyre = Number(entry.tyre ?? 100);
    const condition = Number(entry.condition ?? 100);
    const lap = Number(entry.lap || 1);
    const planned = Number(entry.plannedPitLap || Math.max(2, Math.round((race.laps || 22)*.55)));
    const gap = Number(entry.gap || 0);
    const inWindow = lap >= planned - 2 && lap <= planned + 3;
    if(tyre < 18 || condition < 42) return { code:'box-now', label:'BOX AGORA', priority:96, reason:'pneu/condição em zona crítica' };
    if(inWindow && tyre < 44) return { code:'pit-window', label:'JANELA DE PIT', priority:82, reason:`volta ${lap}/${race.laps || '?'} dentro da janela` };
    if(gap < 1.2 && tyre > 52 && condition > 60) return { code:'attack-window', label:'ATAQUE COM DRS/ERS', priority:74, reason:'gap baixo e pneus vivos' };
    if(tyre < 30) return { code:'save-tyres', label:'ECONOMIZAR PNEUS', priority:68, reason:'stint perto do limite' };
    return { code:'hold-rhythm', label:'MANTER RITMO', priority:52, reason:'sem risco urgente' };
  }

  function entryModifier(entry = {}, race = {}, context = {}){
    const data = context.data || root.F1M_GAMEPLAY_POLISH_DATA || {};
    const state = context.state || {};
    const profile = activeProfile(data, state.gameplayPolish?.profile || 'realistic');
    const index = Number(context.index || entry.pos || 1) - 1;
    const ahead = arr(race.entries).slice().sort((a,b)=>(b.distance||0)-(a.distance||0))[Math.max(0,index-1)] || null;
    const gapAhead = ahead ? Math.abs(Number(ahead.distance||0) - Number(entry.distance||0))*82 : 99;
    const tyre = Number(entry.tyre ?? 100);
    const condition = Number(entry.condition ?? 100);
    const pace = String(entry.pace || 'normal');
    const agency = profile.playerAgency || .74;
    const tyreOffset = ahead ? tyre - Number(ahead.tyre ?? 100) : 0;
    let battle = gapAhead < 1.2 ? 1 : gapAhead < 2.4 ? .55 : 0;
    if(tyreOffset > 12 && gapAhead < 3.2) battle += .45;
    if(race.weather === 'variable') battle += .08;
    const playerBoost = context.isPlayer ? agency * .006 : 0;
    const attackBoost = pace === 'attack' ? .014 + battle*.006 : pace === 'save' ? -.012 : 0;
    const tyreBoost = clamp((tyre - 50)/500, -.04, .055) * (profile.tyreWeight || .34);
    const conditionDrag = condition < 60 ? -((60-condition)/2600) : 0;
    const battleBoost = battle * (profile.paceWindow || .022) * .42;
    const paceMultiplier = clamp(1 + playerBoost + attackBoost + tyreBoost + conditionDrag + battleBoost, .93, 1.085);
    const riskBase = pace === 'attack' ? 1.16 : pace === 'save' ? .84 : 1;
    const riskMultiplier = clamp(riskBase * (profile.riskBias || 1) * (condition < 45 ? 1.18 : 1) * (race.weather === 'variable' ? 1.08 : 1), .64, 1.55);
    const advice = pitAdvice(entry, race, context);
    const action = battle >= .9 ? `batalha ${ahead?.driver?.short || ''}` : advice.priority >= 74 ? advice.label : '';
    return { paceMultiplier, riskMultiplier, battle, tyreOffset, advice, action };
  }

  function registerEvidence(state = {}, item = {}, context = {}){
    initializeState(state, context);
    const evidence = { id:item.id || `f24-gameplay-${Date.now()}`, label:item.label || 'evidência de gameplay', screen:item.screen || 'race', status:item.status || 'manual-check', generatedAt:nowIso(), buildCode:context.buildCode || 'dev' };
    state.gameplayPolish.evidence.unshift(evidence);
    state.gameplayPolish.evidence = state.gameplayPolish.evidence.slice(0, 30);
    return evidence;
  }

  function audit(context = {}){
    const data = context.data || root.F1M_GAMEPLAY_POLISH_DATA || {};
    const state = initializeState(context.state || {}, context);
    const targets = data.targetMetrics || {};
    const checks = [];
    const add = (id, ok, detail='') => checks.push({ id, ok:Boolean(ok), detail });
    const st = status(state, { ...context, data });
    add('phase', Number(data.phase) === 24, String(data.phase));
    add('schema', Number(data.schema || 0) >= 1, 'schema '+data.schema);
    add('profiles', arr(data.profiles).length >= Number(targets.minProfiles || 3), String(arr(data.profiles).length));
    add('battle-triggers', arr(data.battleTriggers).length >= Number(targets.minBattleTriggers || 5), String(arr(data.battleTriggers).length));
    add('pitwall-rules', arr(data.pitWallRules).length >= Number(targets.minPitWallRules || 5), String(arr(data.pitWallRules).length));
    add('fairness-rules', arr(data.fairnessRules).length >= Number(targets.minFairnessRules || 5), String(arr(data.fairnessRules).length));
    add('hud-signals', arr(data.telemetryHud).length >= Number(targets.minHudSignals || 6), String(arr(data.telemetryHud).length));
    const fakeRace = { laps:22, entries:[{ driver:{short:'A'}, distance:.50, tyre:72, condition:88, pace:'attack', lap:7, gap:.8, plannedPitLap:12 },{ driver:{short:'B'}, distance:.49, tyre:51, condition:84, pace:'normal', lap:7, plannedPitLap:13 }], weather:'dry' };
    const mod = entryModifier(fakeRace.entries[0], fakeRace, { ...context, state, index:1, isPlayer:true });
    add('entry-modifier', Number(mod.paceMultiplier) > 1 && Number(mod.riskMultiplier) > 0, `${mod.paceMultiplier}/${mod.riskMultiplier}`);
    add('pit-advice', pitAdvice({ tyre:16, condition:80, lap:14, plannedPitLap:12 }, fakeRace, context).code === 'box-now', 'box-now');
    add('production-blocked', st.productionBlocked === true, 'produção bloqueada até homologação');
    const passed = checks.filter(c=>c.ok).length;
    const failed = checks.length - passed;
    const score = failed ? round(clamp((passed / checks.length) * 100)) : 100;
    const result = { score, passed, failed, checks, status:st, generatedAt:nowIso() };
    state.gameplayPolish.auditHistory.unshift(result);
    state.gameplayPolish.auditHistory = state.gameplayPolish.auditHistory.slice(0,10);
    state.quality = state.quality || {};
    state.quality.gameplayPolishF24 = { status: failed ? 'review' : 'approved', score, passed, failed, generatedAt:result.generatedAt, checks };
    return result;
  }

  function createGameplayPolishSystem(options = {}){
    const data = options.data || root.F1M_GAMEPLAY_POLISH_DATA || {};
    return {
      initializeState:(state, context={})=>initializeState(state, { ...context, data }),
      status:(state, context={})=>status(state, { ...context, data }),
      raceContext:(race, context={})=>raceContext(race, { ...context, data }),
      entryModifier:(entry, race, context={})=>entryModifier(entry, race, { ...context, data }),
      pitAdvice:(entry, race, context={})=>pitAdvice(entry, race, { ...context, data }),
      registerEvidence:(state, item, context={})=>registerEvidence(state, item, { ...context, data }),
      audit:(context={})=>audit({ ...context, data }),
      data
    };
  }

  CORE.gameplayPolish = { createGameplayPolishSystem };
})();
