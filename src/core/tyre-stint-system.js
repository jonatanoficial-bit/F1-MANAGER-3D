(() => {
  'use strict';
  const root = globalThis;
  const CORE = root.F1M_CORE = root.F1M_CORE || {};
  const arr = value => Array.isArray(value) ? value : [];
  const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, num(value, min)));
  const round = (value, digits = 0) => Number(num(value, 0).toFixed(digits));
  const nowIso = () => new Date().toISOString();

  function compoundById(data = {}, id = 'medium'){
    return arr(data.compounds).find(c => c.id === id) || arr(data.compounds).find(c => c.id === 'medium') || arr(data.compounds)[0] || { id:'medium', label:'Médio', idealSurface:[88,104], idealCarcass:[86,100], baseLifeLaps:27, wearSlope:1, sensitivity:{} };
  }

  function initializeState(state = {}, context = {}){
    const data = context.data || root.F1M_TYRE_STINT_DATA || {};
    state.tyreStint = state.tyreStint || {};
    state.tyreStint.schema = 1;
    state.tyreStint.phase = 27;
    state.tyreStint.dataPack = data.dataPack || 'tyre-stint-degradation-2026-06-20';
    state.tyreStint.channel = data.channel || 'tyre-stint-degradation-simulator';
    state.tyreStint.productionBlocked = true;
    state.tyreStint.activePlans = Array.isArray(state.tyreStint.activePlans) ? state.tyreStint.activePlans : [];
    state.tyreStint.analysisHistory = Array.isArray(state.tyreStint.analysisHistory) ? state.tyreStint.analysisHistory : [];
    state.tyreStint.pitWallHistory = Array.isArray(state.tyreStint.pitWallHistory) ? state.tyreStint.pitWallHistory : [];
    state.tyreStint.auditHistory = Array.isArray(state.tyreStint.auditHistory) ? state.tyreStint.auditHistory : [];
    state.quality = state.quality || {};
    state.quality.tyreStintF27 = state.quality.tyreStintF27 || { status:'not-run', score:null, compounds:arr(data.compounds).length, signals:arr(data.tyreSignals).length, productionBlocked:true, migratedBy:String(context.buildCode || 'dev') };
    return state;
  }

  function windowScore(value, range = [85,105]){
    const low = num(range[0], 85), high = num(range[1], 105);
    const mid = (low + high) / 2;
    const half = Math.max(1, (high - low) / 2);
    return clamp(100 - Math.abs(num(value, mid) - mid) / half * 38, 0, 100);
  }

  function analyseTyre(input = {}, context = {}){
    const data = context.data || root.F1M_TYRE_STINT_DATA || {};
    const compound = compoundById(data, input.compound || input.compoundId || 'medium');
    const ageLaps = Math.max(0, num(input.ageLaps ?? input.lapAge, 0));
    const wearPct = clamp(input.wearPct ?? (100 - num(input.tyreLife, 78)), 0, 100);
    const surface = num(input.surfaceTempC ?? input.tyreSurfaceC, (compound.idealSurface[0]+compound.idealSurface[1])/2);
    const carcass = num(input.carcassTempC ?? input.tyreCarcassC, (compound.idealCarcass[0]+compound.idealCarcass[1])/2);
    const pressure = num(input.pressurePsi, (compound.pressurePsi?.[0] + compound.pressurePsi?.[1]) / 2 || 22);
    const sliding = clamp(input.slidingEnergy ?? input.slide ?? 28, 0, 160);
    const dirtyAir = clamp(input.dirtyAirPct ?? input.dirtyAir ?? 0, 0, 100);
    const fuelKg = clamp(input.fuelKg ?? input.fuelMass ?? 55, 0, 115);
    const lockup = clamp(input.lockupSeverity ?? input.flatSpotPct ?? 0, 0, 100);
    const evolution = clamp(input.trackEvolution ?? 55, 0, 100);
    const surfaceScore = windowScore(surface, compound.idealSurface);
    const carcassScore = windowScore(carcass, compound.idealCarcass);
    const pressureMid = ((compound.pressurePsi?.[0] || 20) + (compound.pressurePsi?.[1] || 24)) / 2;
    const pressurePenalty = Math.abs(pressure - pressureMid) * 2.8;
    const thermalOver = Math.max(0, surface - compound.idealSurface[1]) + Math.max(0, carcass - compound.idealCarcass[1]) * 0.8;
    const thermalUnder = Math.max(0, compound.idealSurface[0] - surface) * 0.7;
    const grainingPct = clamp((thermalUnder * 2.2 + sliding * .20 + Math.max(0, 48 - evolution) * .26) * num(compound.sensitivity?.graining, 1), 0, 100);
    const blisteringPct = clamp((thermalOver * 2.8 + Math.max(0, pressure - pressureMid) * 7.5 + sliding * .10) * num(compound.sensitivity?.blistering, 1), 0, 100);
    const flatSpotPct = clamp(lockup * .90 + Math.max(0, pressure - pressureMid) * 2.5, 0, 100);
    const baseDeg = (compound.wearSlope || 1) * (1 + ageLaps / Math.max(1, compound.baseLifeLaps) * 0.52);
    const thermalFactor = 1 + Math.max(0, 100 - Math.min(surfaceScore, carcassScore)) / 100 * .44 * num(compound.sensitivity?.thermal, 1);
    const slidingFactor = 1 + sliding / 220 * num(compound.sensitivity?.sliding, 1);
    const fuelFactor = 1 + fuelKg / 780;
    const dirtyFactor = 1 + dirtyAir / 520 * num(compound.sensitivity?.dirtyAir, 1);
    const pressureFactor = 1 + pressurePenalty / 180;
    const degradationPerLap = round((0.024 + baseDeg * 0.018 + wearPct * 0.00115) * thermalFactor * slidingFactor * fuelFactor * dirtyFactor * pressureFactor + grainingPct*.0009 + blisteringPct*.0012 + flatSpotPct*.0014, 3);
    const cliffRisk = round(clamp((wearPct - compound.cliffPct) * 2.2 + thermalOver * 1.5 + blisteringPct * .34 + flatSpotPct * .22, 0, 100));
    const punctureRisk = round(clamp((wearPct - 74) * 2.6 + blisteringPct * .16 + flatSpotPct * .24 + (carcass > compound.idealCarcass[1] + 12 ? 10 : 0), 0, 100), 1);
    const fuelCorrectedPace = round(num(input.rawDeltaSec ?? input.deltaSec, 0) - fuelKg * .032 + degradationPerLap * ageLaps * .34, 3);
    const undercutPower = round(clamp((degradationPerLap * 100) + cliffRisk * .55 + (compound.pitDeltaGain || .5) * 18 - ageLaps * .15, 0, 100));
    const overcutResistance = round(clamp(100 - cliffRisk - degradationPerLap * 90 + surfaceScore * .18 + carcassScore * .12 - dirtyAir * .08, 0, 100));
    const tyreHealth = round(clamp(100 - wearPct * .72 - cliffRisk * .18 - grainingPct * .12 - blisteringPct * .16 - flatSpotPct * .22, 0, 100));
    return { compound:compound.id, compoundLabel:compound.label, surfaceTempC:round(surface,1), carcassTempC:round(carcass,1), pressurePsi:round(pressure,2), ageLaps:round(ageLaps,1), wearPct:round(wearPct,1), surfaceScore:round(surfaceScore), carcassScore:round(carcassScore), grainingPct:round(grainingPct,1), blisteringPct:round(blisteringPct,1), flatSpotPct:round(flatSpotPct,1), degradationPerLap, cliffRisk, punctureRisk, fuelCorrectedPace, undercutPower, overcutResistance, tyreHealth, window:`${compound.idealSurface[0]}-${compound.idealSurface[1]}°C superfície / ${compound.idealCarcass[0]}-${compound.idealCarcass[1]}°C carcaça`, generatedAt:nowIso() };
  }

  function planStint(input = {}, context = {}){
    const data = context.data || root.F1M_TYRE_STINT_DATA || {};
    const compound = compoundById(data, input.compound || 'medium');
    const lapsTotal = Math.max(1, num(input.lapsTotal ?? input.raceLaps, 57));
    const currentLap = clamp(input.currentLap ?? 1, 1, lapsTotal);
    const stintAge = Math.max(0, num(input.ageLaps ?? 0));
    const analysis = analyseTyre({ compound:compound.id, ...input, ageLaps:stintAge }, { ...context, data });
    const remainingLife = Math.max(0, compound.baseLifeLaps - stintAge - analysis.wearPct * .10 - analysis.cliffRisk * .04);
    const pitWindowOpen = currentLap >= Math.max(2, Math.floor(lapsTotal * .22)) && analysis.undercutPower > 50;
    const recommendedPitLap = Math.max(currentLap, Math.min(lapsTotal - 1, Math.round(currentLap + Math.max(1, remainingLife * .42 - analysis.cliffRisk * .03))));
    const target = analysis.cliffRisk > 70 ? 'box-now' : analysis.undercutPower > 72 ? 'undercut' : analysis.overcutResistance > 68 ? 'extend' : 'hold-window';
    const confidence = round(clamp(42 + analysis.undercutPower * .25 + analysis.overcutResistance * .18 - analysis.punctureRisk * .22 + (pitWindowOpen ? 10 : 0), 0, 100));
    return { id:`F27-ST-${Date.now()}`, compound:compound.id, compoundLabel:compound.label, currentLap, lapsTotal, stintAge:round(stintAge,1), recommendedPitLap, target, confidence, analysis, pitWindowOpen, generatedAt:nowIso() };
  }

  function pitWallAdvice(input = {}, context = {}){
    const plan = input.analysis ? { analysis:input.analysis, ...input } : planStint(input, context);
    const a = plan.analysis || analyseTyre(input, context);
    let label = 'MANTER JANELA';
    let priority = 45;
    let advice = 'Manter ritmo e observar delta de pneus por mais uma volta.';
    if(a.cliffRisk >= 78 || a.punctureRisk >= 35){ label = 'BOX AGORA'; priority = 96; advice = 'Pneu em risco crítico: parar imediatamente para evitar penhasco ou furo.'; }
    else if(a.undercutPower >= 74){ label = 'COBRIR / EXECUTAR UNDERCUT'; priority = 88; advice = 'Degradação favorece pneu novo. Parar nesta volta pode ganhar posição líquida.'; }
    else if(a.overcutResistance >= 72){ label = 'ESTENDER STINT'; priority = 78; advice = 'Pneu ainda resiste bem. Usar ar limpo e esperar janela melhor.'; }
    else if(a.grainingPct >= 36){ label = 'AQUECER SEM ESCORREGAR'; priority = 74; advice = 'Graining detectado: suavizar volante/acelerador e evitar ataque por 1-2 voltas.'; }
    else if(a.blisteringPct >= 34){ label = 'RESFRIAR PNEUS'; priority = 76; advice = 'Blistering iniciando: reduzir modo ataque e sair de ar sujo.'; }
    else if(a.flatSpotPct >= 28){ label = 'EVITAR TRAVAMENTO'; priority = 72; advice = 'Flat spot/vibração: ajustar brake bias e preparar pit se delta subir.'; }
    return { label, priority, advice, target:plan.target || 'hold-window', recommendedPitLap:plan.recommendedPitLap, analysis:a, generatedAt:nowIso() };
  }

  function sampleEntry(entry = {}, race = {}, context = {}){
    const t = entry.telemetry || {};
    const compound = entry.compound || t.compound || 'medium';
    const age = num((entry.stintAge ?? entry.lapsOnTyre ?? ((race.tick || 0) / 80)), 0);
    const wearPct = clamp(100 - num(entry.tyre ?? t.tyreLife, 80), 0, 100);
    return analyseTyre({
      compound,
      ageLaps:age,
      wearPct,
      surfaceTempC:t.tyreSurfaceC ?? t.surfaceTempC,
      carcassTempC:t.tyreCarcassC ?? t.carcassTempC,
      pressurePsi:t.pressurePsi || (compound === 'soft' ? 22.2 : compound === 'hard' ? 22.8 : 22.4),
      slidingEnergy:t.lateralG ? Math.abs(t.lateralG) * 18 + Math.abs(num(t.longitudinalG,0))*12 : 30,
      dirtyAirPct:t.dirtyAirPct ?? (entry.dirtyAir ? 100 - entry.dirtyAir*100 : 0),
      fuelKg:entry.fuel || t.fuelKg || 50,
      lockupSeverity:t.lockupSeverity || 0,
      trackEvolution:race.trackState?.grip ? race.trackState.grip * 100 : 55,
      rawDeltaSec:t.deltaSec || 0
    }, context);
  }

  function status(state = {}, context = {}){
    const data = context.data || root.F1M_TYRE_STINT_DATA || {};
    initializeState(state, context);
    const compounds = arr(data.compounds).length;
    const signals = arr(data.tyreSignals).length;
    const factors = arr(data.degradationFactors).length;
    const score = clamp(28 + compounds*7 + signals*1.5 + factors*2.2 + arr(data.strategyModels).length*5 + arr(data.pitWallRules).length*2.4, 0, 100);
    return { score:round(score), compounds, signals, factors, plans:arr(state.tyreStint.activePlans).length, analyses:arr(state.tyreStint.analysisHistory).length, productionBlocked:true };
  }

  function audit(context = {}){
    const data = context.data || root.F1M_TYRE_STINT_DATA || {};
    const state = initializeState(context.state || {}, context);
    const checks = [];
    const add = (id, ok, detail = '') => checks.push({ id, ok:Boolean(ok), detail });
    const target = data.targetMetrics || {};
    add('phase', Number(data.phase) === 27, String(data.phase));
    add('schema', Number(data.schema || 0) >= 1, 'schema '+data.schema);
    add('compounds', arr(data.compounds).length >= Number(target.minCompounds || 5), String(arr(data.compounds).length));
    add('signals', arr(data.tyreSignals).length >= Number(target.minSignals || 18), String(arr(data.tyreSignals).length));
    add('factors', arr(data.degradationFactors).length >= Number(target.minFactors || 9), String(arr(data.degradationFactors).length));
    add('strategy-models', arr(data.strategyModels).length >= Number(target.minStrategyModels || 4), String(arr(data.strategyModels).length));
    add('pit-wall-rules', arr(data.pitWallRules).length >= Number(target.minPitWallRules || 6), String(arr(data.pitWallRules).length));
    const hotSoft = analyseTyre({ compound:'soft', ageLaps:14, wearPct:58, surfaceTempC:115, carcassTempC:107, pressurePsi:24.2, slidingEnergy:78, dirtyAirPct:42, fuelKg:36, lockupSeverity:12, rawDeltaSec:.8 }, { ...context, data });
    const coolHard = analyseTyre({ compound:'hard', ageLaps:8, wearPct:16, surfaceTempC:88, carcassTempC:90, pressurePsi:22.2, slidingEnergy:22, dirtyAirPct:0, fuelKg:70, rawDeltaSec:.2 }, { ...context, data });
    const plan = planStint({ compound:'soft', currentLap:22, lapsTotal:57, ageLaps:14, wearPct:58, surfaceTempC:115, carcassTempC:107, pressurePsi:24.2, slidingEnergy:78, dirtyAirPct:42, fuelKg:36 }, { ...context, data });
    const advice = pitWallAdvice(plan, { ...context, data });
    const sample = sampleEntry({ compound:'medium', tyre:61, fuel:42, telemetry:{ tyreSurfaceC:104, tyreCarcassC:99, pressurePsi:23.1, lateralG:3.8, longitudinalG:-1.7, dirtyAirPct:22 } }, { tick:600, trackState:{ grip:.62 } }, { ...context, data });
    add('hot-soft-risk', hotSoft.degradationPerLap > coolHard.degradationPerLap && hotSoft.cliffRisk > 30, JSON.stringify(hotSoft));
    add('hard-stability', coolHard.tyreHealth > hotSoft.tyreHealth && coolHard.overcutResistance > 35, JSON.stringify(coolHard));
    add('stint-plan', plan.recommendedPitLap >= plan.currentLap && plan.confidence > 0, JSON.stringify(plan));
    add('pit-wall-advice', Boolean(advice.label) && advice.priority > 0 && Boolean(advice.analysis), JSON.stringify(advice));
    add('entry-sample', sample.compound === 'medium' && Number.isFinite(sample.degradationPerLap), JSON.stringify(sample));
    add('production-blocked', status(state, { ...context, data }).productionBlocked === true, 'produção bloqueada');
    const passed = checks.filter(c=>c.ok).length;
    const failed = checks.length - passed;
    const score = failed ? Math.round((passed / checks.length) * 100) : 100;
    const result = { score, passed, failed, checks, status:status(state, { ...context, data }), generatedAt:nowIso() };
    state.tyreStint.auditHistory.unshift(result);
    state.tyreStint.auditHistory = state.tyreStint.auditHistory.slice(0, 10);
    state.quality = state.quality || {};
    state.quality.tyreStintF27 = { status:failed ? 'review' : 'approved', score, passed, failed, checks, generatedAt:result.generatedAt, productionBlocked:true };
    return result;
  }

  function createTyreStintSystem(options = {}){
    const data = options.data || root.F1M_TYRE_STINT_DATA || {};
    return {
      initializeState:(state, context={})=>initializeState(state, { ...context, data }),
      status:(state, context={})=>status(state, { ...context, data }),
      analyseTyre:(input, context={})=>analyseTyre(input, { ...context, data }),
      planStint:(input, context={})=>planStint(input, { ...context, data }),
      pitWallAdvice:(input, context={})=>pitWallAdvice(input, { ...context, data }),
      sampleEntry:(entry, race, context={})=>sampleEntry(entry, race, { ...context, data }),
      audit:(context={})=>audit({ ...context, data }),
      data
    };
  }
  CORE.tyreStint = { createTyreStintSystem };
})();
