(() => {
  'use strict';
  const root = globalThis;
  const core = root.F1M_CORE = root.F1M_CORE || {};

  const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
  const rand = (min, max) => min + Math.random() * (max - min);
  const median = arr => arr.length ? arr.slice().sort((a,b)=>a-b)[Math.floor(arr.length/2)] : 0;

  function createRaceStrategyAI(options = {}){
    const data = options.data || root.F1M_STRATEGY_DATA || {};
    const vehiclePhysics = options.vehiclePhysics || null;
    const regulationEngine = options.regulationEngine || null;
    const pitStop = data.pitStop || {};
    const raceCraft = data.raceCraft || {};
    const neutralization = data.neutralization || {};
    const compoundData = data.compounds || {};

    function audit(){
      const checks = [
        ['initial-plan', typeof initialPlan === 'function'],
        ['undercut-overcut', typeof driverDecision === 'function' && Boolean(compoundData.medium)],
        ['traffic', typeof trafficPressure === 'function'],
        ['attack-defense', typeof choosePace === 'function'],
        ['human-error', typeof humanErrorRisk === 'function'],
        ['pit-crew', typeof executePitStop === 'function'],
        ['double-stacking', Number(pitStop.doubleStackingPenalty || 0) > 0],
        ['unsafe-release', Number(pitStop.unsafeReleaseRisk || 0) > 0],
        ['safety-car', typeof deployNeutralization === 'function'],
        ['vsc', typeof deployNeutralization === 'function'],
        ['red-flag', typeof deployNeutralization === 'function'],
        ['restart', Number(neutralization.restartWindow || 0) > 0],
        ['overtake-resolution', typeof resolveOvertakes === 'function']
      ].map(([id, ok]) => ({ id, ok:Boolean(ok) }));
      const passed = checks.filter(item => item.ok).length;
      return {
        score: Math.round((passed / checks.length) * 100),
        passed,
        failed: checks.length - passed,
        systems: checks.map(item => item.id),
        checks
      };
    }

    function initialPlan(driver, team, context = {}, gridPos = 10){
      const laps = Number(context.track?.laps || 22);
      const aggression = Number(driver?.aggression || 64);
      const consistency = Number(driver?.consistency || 66);
      const tyreCare = Number(team?.car?.tyreWear || team?.car?.tyres || 60);
      const reliability = Number(team?.car?.reliability || 58);
      const startCompound = context.weather === 'wet' ? 'wet' : context.weather === 'variable' ? 'inter' : gridPos <= 6 && aggression > 68 ? 'soft' : tyreCare > 72 ? 'medium' : 'medium';
      const life = compoundData[startCompound]?.lifeTarget || .52;
      const ideal = Math.max(4, Math.round(laps * life));
      const risk = clamp((aggression - 55) / 60 + (gridPos < 8 ? .08 : 0) - (consistency < 58 ? .06 : 0), .18, .88);
      const windowRadius = startCompound === 'soft' ? 2 : 3;
      return {
        plan: risk > .66 ? 'aggressive' : consistency > 76 || reliability < 50 ? 'conservative' : 'balanced',
        startCompound,
        stopBias: risk > .66 ? 'early' : consistency > 76 ? 'late' : 'balanced',
        pitWindow: [Math.max(4, ideal - windowRadius), Math.min(laps - 2, ideal + windowRadius)],
        undercutLap: Math.max(4, ideal - windowRadius - 1),
        overcutLap: Math.min(laps - 1, ideal + windowRadius + 1),
        aggressiveness: risk,
        defenseBias: clamp((aggression + consistency) / 180, .25, .86),
        tyreCareBias: clamp(tyreCare / 100, .35, .92)
      };
    }

    function gapTo(entry, race, direction = 'ahead'){
      const sorted = race.entries.slice().sort((a,b)=>b.distance-a.distance);
      const idx = sorted.findIndex(item => item.driver?.short === entry.driver?.short);
      const other = sorted[idx + (direction === 'ahead' ? -1 : 1)];
      if(!other) return { gap:99, other:null, idx };
      return { gap:Math.abs((other.distance || 0) - (entry.distance || 0)) * 82, other, idx };
    }

    function trafficPressure(entry, race){
      const ahead = gapTo(entry, race, 'ahead');
      const behind = gapTo(entry, race, 'behind');
      return {
        gapAhead: ahead.gap,
        gapBehind: behind.gap,
        carAhead: ahead.other,
        carBehind: behind.other,
        traffic: ahead.gap < 1.2,
        underAttack: behind.gap < 1.0,
        drsRange: ahead.gap <= 1.0,
        cleanAir: ahead.gap > 2.4
      };
    }

    function choosePace(entry, race, pressure, context = {}){
      const strat = entry.strategy || {};
      const tyre = Number(entry.tyre ?? entry.vehicle?.tyreLife ?? 100);
      const fuel = Number(entry.fuel ?? entry.vehicle?.fuelMass ?? 100);
      const lap = Number(entry.lap || 1);
      const [early, late] = strat.pitWindow || [Math.max(4, Math.floor((race.laps || 22)*.4)), Math.max(8, Math.floor((race.laps || 22)*.68))];
      if(context.neutralized) return 'save';
      if(tyre < 22 || fuel < 18) return 'save';
      if(pressure.underAttack && tyre > 38) return 'attack';
      if(pressure.drsRange && tyre > 32) return 'attack';
      if(lap >= early - 1 && lap <= late && strat.plan === 'aggressive' && tyre > 27) return 'attack';
      if(lap < Math.max(3, early - 3) && strat.plan === 'conservative') return 'save';
      return 'normal';
    }

    function shouldPit(entry, race, pressure, context = {}){
      if(entry.pitCooldown || entry.pits >= 3 || context.redFlag) return false;
      const strat = entry.strategy || {};
      const tyre = Number(entry.tyre ?? entry.vehicle?.tyreLife ?? 100);
      const lap = Number(entry.lap || 1);
      const laps = Number(race.laps || 22);
      const [early, late] = strat.pitWindow || [Math.floor(laps*.4), Math.floor(laps*.68)];
      const inWindow = lap >= early && lap <= late;
      const undercut = pressure.traffic && pressure.gapAhead < .9 && lap >= (strat.undercutLap || early - 1);
      const overcut = pressure.cleanAir && lap <= (strat.overcutLap || late + 1) && tyre > 34 && strat.stopBias === 'late';
      const safetyOpportunity = context.neutralized && lap > 4 && tyre < 72;
      return tyre < 18 || (inWindow && tyre < 56 && !overcut) || undercut || safetyOpportunity;
    }

    function humanErrorRisk(entry, pressure, context = {}){
      const consistency = Number(entry.driver?.consistency || 66);
      const aggression = Number(entry.driver?.aggression || 62);
      const damage = Number(entry.damage || entry.vehicle?.aeroDamage || 0);
      const tyre = Number(entry.tyre || entry.vehicle?.tyreLife || 100);
      const base = Number(raceCraft.humanErrorBase || 0.00045);
      return Math.max(0, base * (1 + (aggression - consistency) / 42 + (100 - tyre) / 160 + damage / 85 + (pressure.traffic ? .45 : 0) + (context.restart ? .65 : 0)));
    }

    function driverDecision(entry, race, meta = {}){
      const context = meta.context || {};
      const pressure = trafficPressure(entry, race);
      const pace = choosePace(entry, race, pressure, context);
      const decision = {
        pace,
        shouldPit: shouldPit(entry, race, pressure, context),
        attacking: pace === 'attack' && pressure.drsRange,
        defending: pace === 'attack' && pressure.underAttack,
        traffic: pressure.traffic,
        intent: pressure.traffic ? 'tráfego' : pace === 'attack' ? 'ataque' : pace === 'save' ? 'poupar' : 'ritmo',
        errorRisk: humanErrorRisk(entry, pressure, context)
      };
      if(!entry.incident && Math.random() < decision.errorRisk * Number(meta.dt || 1) * Number(race.speed || 1)){
        entry.progress -= rand(.006,.018);
        entry.condition = Math.max(10, Number(entry.condition||100) - rand(3,9));
        entry.lastAction = 'ERRO HUMANO';
        race.raceLog?.unshift?.(`${entry.driver.short} errou sob pressão estratégica`);
      }
      return decision;
    }

    function executePitStop(entry, race, options = {}){
      const manual = Boolean(options.manual);
      const carPit = Number(entry.car?.pitStop || 58);
      const pitBusy = Number(race.strategyState?.pitLaneBusy || 0);
      const sameTeamPitting = race.entries.filter(other => other !== entry && other.team?.id === entry.team?.id && other.pitCooldown > 6).length;
      let loss = Math.max(.024, Number(pitStop.baseLossProgress || .069) - carPit / 2600);
      let label = manual ? 'PIT MANUAL' : 'PIT ESTRATÉGICO';
      if(pitBusy > 0){ loss += Number(pitStop.pitLaneBusyPenalty || .014); label += ' +TRÁFEGO'; }
      if(sameTeamPitting){ loss += Number(pitStop.doubleStackingPenalty || .028); label += ' +DOUBLE STACK'; entry.penaltySeconds = (entry.penaltySeconds || 0) + (Math.random() < .08 ? 5 : 0); }
      if(Math.random() < Number(pitStop.unsafeReleaseRisk || .045) * (pitBusy > 0 ? 1.7 : 1)){
        entry.penaltySeconds = (entry.penaltySeconds || 0) + 5;
        label += ' +UNSAFE RELEASE';
      }
      const next = entry.compound === 'soft' ? 'medium' : entry.compound === 'medium' ? 'hard' : 'medium';
      options.vehiclePhysics?.pitService?.(entry,{ compound:next });
      entry.compound = next;
      entry.baseSpeed = Number(entry.baseSpeed || .03) * (next === 'hard' ? .992 : next === 'medium' ? .998 : 1.004);
      entry.tyre = 100;
      entry.condition = Math.min(100, Number(entry.condition||100) + 5);
      entry.progress -= loss;
      entry.pits = Number(entry.pits||0) + 1;
      entry.pitCooldown = clamp(rand(Number(pitStop.minCooldown || 5.5), Number(pitStop.maxCooldown || 10.5)), 4, 14);
      if(race.strategyState) race.strategyState.pitLaneBusy = Math.max(race.strategyState.pitLaneBusy || 0, entry.pitCooldown * .72);
      return { label:`${label} -${Math.round(loss*1000)/10}s`, loss, compound:next };
    }

    function deployNeutralization(race, type = 'vsc'){
      race.strategyState = race.strategyState || {};
      if(type === 'red'){
        const [min,max] = neutralization.redFlagDuration || [8,16];
        race.redFlag = rand(min,max);
        race.speed = Math.min(Number(race.speed || 1), 2);
        race.strategyState.redFlags = (race.strategyState.redFlags || 0) + 1;
        race.raceLog?.unshift?.('BANDEIRA VERMELHA — corrida neutralizada e relargada será preparada');
        return;
      }
      if(type === 'sc'){
        const [min,max] = neutralization.safetyCarDuration || [16,30];
        race.safetyCar = rand(min,max);
        race.strategyState.safetyCarDeployments = (race.strategyState.safetyCarDeployments || 0) + 1;
        race.raceLog?.unshift?.('Safety Car na pista — janela estratégica aberta');
        return;
      }
      const [min,max] = neutralization.vscDuration || [10,18];
      race.safetyCar = rand(min,max);
      race.strategyState.vscDeployments = (race.strategyState.vscDeployments || 0) + 1;
      race.raceLog?.unshift?.('VSC acionado — tráfego e pits recalculados');
    }

    function updateRaceState(race, options = {}){
      race.strategyState = race.strategyState || {};
      const dt = Number(options.dt || 0);
      const speed = Number(options.speed || race.speed || 1);
      if(race.strategyState.pitLaneBusy) race.strategyState.pitLaneBusy = Math.max(0, race.strategyState.pitLaneBusy - dt * speed);
      if(race.redFlag > 0){
        race.redFlag = Math.max(0, race.redFlag - dt * speed);
        if(race.redFlag === 0){ race.restartTimer = Number(neutralization.restartWindow || 5); race.raceLog?.unshift?.('Relargada autorizada após bandeira vermelha'); }
        return { neutralized:true, redFlag:true, safetyMultiplier:.32, restart:false };
      }
      if(race.restartTimer > 0){
        race.restartTimer = Math.max(0, race.restartTimer - dt * speed);
      }
      const incidentLoad = race.entries.filter(entry => entry.incident || (entry.damage || 0) > 35 || (entry.condition || 100) < 30).length;
      if(race.tick > 10 && race.safetyCar <= 0 && race.redFlag <= 0){
        const chance = Number(neutralization.debrisChance || .00022) * dt * speed * (1 + incidentLoad * Number(neutralization.incidentEscalation || .18));
        if(Math.random() < chance){
          deployNeutralization(race, Math.random() < Number(neutralization.redFlagEscalation || .035) ? 'red' : (Math.random()<.35?'sc':'vsc'));
        }
      }
      return { neutralized:race.safetyCar > 0 || race.redFlag > 0, redFlag:race.redFlag > 0, safetyMultiplier:race.safetyCar > 0 ? .70 : 1, restart:race.restartTimer > 0 };
    }

    function resolveOvertakes(race, options = {}){
      const dt = Number(options.dt || 0);
      const speed = Number(options.speed || race.speed || 1);
      const sorted = race.entries.slice().sort((a,b)=>b.distance-a.distance);
      for(let i=1;i<sorted.length;i++){
        const attacker = sorted[i];
        const defender = sorted[i-1];
        const gap = Math.max(0, (defender.distance - attacker.distance) * 82);
        if(gap > 1.05 || race.safetyCar > 0 || race.redFlag > 0) continue;
        const tyreDelta = Number(attacker.tyre || 0) - Number(defender.tyre || 0);
        const attackerSkill = (Number(attacker.driver?.racecraft || attacker.driver?.aggression || 62) + Number(attacker.driver?.aggression || 62)) / 2;
        const defenderSkill = (Number(defender.driver?.racecraft || defender.driver?.consistency || 62) + Number(defender.driver?.consistency || 62)) / 2;
        let chance = Number(raceCraft.baseOvertakeChance || .012) + (attackerSkill - defenderSkill) / 2800 + Math.max(0, tyreDelta) * Number(raceCraft.tyreDeltaBoost || .01) / 100;
        if(attacker.drs) chance += Number(raceCraft.drsBoost || .034);
        if(attacker.aiIntent === 'ataque') chance += .012;
        if(defender.aiIntent === 'defesa') chance -= Number(raceCraft.defenseReduction || .022);
        if(race.restartTimer > 0) chance *= Number(raceCraft.restartAggression || 1.38);
        chance = clamp(chance * dt * speed, 0, .18);
        if(Math.random() < chance){
          attacker.progress = Math.max(attacker.progress, defender.progress + rand(.002,.009));
          attacker.lastAction = 'ULTRAPASSAGEM';
          defender.lastAction = 'DEFESA PERDIDA';
          race.raceLog?.unshift?.(`${attacker.driver.short} ultrapassou ${defender.driver.short}`);
        }
      }
    }

    return { audit, initialPlan, trafficPressure, driverDecision, executePitStop, deployNeutralization, updateRaceState, resolveOvertakes };
  }

  core.strategyAI = Object.freeze({ createRaceStrategyAI });
})();
