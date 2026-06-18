(() => {
  'use strict';
  const root = globalThis;
  const core = root.F1M_CORE = root.F1M_CORE || {};
  const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
  const clone = value => JSON.parse(JSON.stringify(value));

  function createVehiclePhysics({ data = root.F1M_VEHICLE_DATA || {} } = {}){
    const compounds = data.compounds || {};
    const paceModes = data.paceModes || {};
    const systems = data.systems || {};

    function compound(id){ return compounds[id] || compounds.medium || { grip:1, wear:1, warmup:1, heat:1, idealMin:88, idealMax:104, cliff:16, risk:1 }; }
    function mode(id){ return paceModes[id] || paceModes.normal || { pace:1, tyreWear:1, fuel:1, ers:1, brakeHeat:1, risk:1, cooling:1 }; }

    function initialState({ compound:compoundId='medium', fuel=100, condition=100, car={}, track={} } = {}){
      const c = compound(compoundId);
      const reliability = clamp(car.reliability ?? 60, 1, 100);
      return {
        compound: compoundId,
        tyreLife: 100,
        tyreTemperature: clamp((c.idealMin + c.idealMax) / 2 - 4, 45, 130),
        fuelMass: clamp(fuel, 0, 100),
        ers: clamp(62 + (car.engine || 55) * .18, 0, 100),
        drsAvailable: false,
        brakeTemperature: clamp(520 + (track.brakeStress || 1) * 35, 260, 1100),
        engineTemperature: clamp(94 + (car.engine || 55) / 45, 70, 130),
        aeroDamage: 0,
        chassisDamage: 0,
        powerUnitDamage: Math.max(0, 100 - clamp(condition, 0, 100)) * .18,
        reliabilityHealth: clamp(condition, 0, 100),
        lastEffects: { paceMultiplier:1, tyreGrip:1, reliabilityRisk:0, drsBoost:1, ersBoost:1, dirtyAir:1, trackGrip:1 }
      };
    }

    function trackState({ weather='dry', laps=22 } = {}){
      const evo = systems.trackEvolution || {};
      return {
        grip: Number(evo.startGrip || .965),
        rubber: 0,
        wetness: weather === 'variable' ? .22 : weather === 'wet' ? .72 : 0,
        laps: Number(laps || 22),
        phase: 'green'
      };
    }

    function updateTrack(track, { dt=1/60, speed=1, cars=22, weather='dry' } = {}){
      const evo = systems.trackEvolution || {};
      const lapsEquivalent = Math.max(1, Number(cars || 22)) / 22;
      const rubberGain = Number(evo.rubberPerLap || .0019) * Number(dt || 0) * Number(speed || 1) * lapsEquivalent;
      const rainDecay = weather === 'variable' || weather === 'wet' ? Number(evo.rainDecay || .0045) * Number(dt || 0) * Number(speed || 1) : -0.00042 * Number(dt || 0) * Number(speed || 1);
      track.rubber = clamp((track.rubber || 0) + rubberGain, 0, 1);
      track.wetness = clamp((track.wetness || 0) + rainDecay, 0, 1);
      track.grip = clamp((evo.startGrip || .965) + track.rubber * .07 - track.wetness * .16, .72, Number(evo.maxGrip || 1.035));
      track.phase = track.wetness > .55 ? 'wet' : track.wetness > .18 ? 'damp' : 'rubbering-in';
      return track;
    }

    function trafficEffects(entry, index, ordered){
      const evo = systems.trackEvolution || {};
      const ahead = index > 0 ? ordered[index - 1] : null;
      const behind = index < ordered.length - 1 ? ordered[index + 1] : null;
      const gapAhead = ahead ? Math.abs((ahead.distance || 0) - (entry.distance || 0)) : 99;
      const gapBehind = behind ? Math.abs((entry.distance || 0) - (behind.distance || 0)) : 99;
      const inDirtyAir = ahead && gapAhead < .045;
      const inSlipstream = ahead && gapAhead < .055 && Number(entry.sector || 1) !== 2;
      const defending = behind && gapBehind < .040;
      return {
        gapAhead,
        gapBehind,
        dirtyAir: inDirtyAir ? Number(evo.dirtyAirBase || .985) : 1,
        slipstream: inSlipstream ? Number(evo.slipstreamBase || 1.009) : 1,
        defending,
        pressure: defending ? .997 : 1
      };
    }

    function tyreThermalGrip(v, c){
      const temp = Number(v.tyreTemperature || 90);
      if(temp >= c.idealMin && temp <= c.idealMax) return 1;
      const delta = temp < c.idealMin ? c.idealMin - temp : temp - c.idealMax;
      return clamp(1 - delta / 160, .78, 1);
    }

    function updateVehicle(entry, context = {}){
      const dt = Number(context.dt || 1/60);
      const speed = Number(context.speed || 1);
      const car = entry.car || {};
      const paceId = entry.pace || 'normal';
      const pace = mode(paceId);
      const c = compound(entry.compound || entry.vehicle?.compound || 'medium');
      const vehicle = entry.vehicle || initialState({ compound:entry.compound, fuel:entry.fuel, condition:entry.condition, car, track:context.trackProfile || {} });
      const track = context.trackState || { grip:1, wetness:0 };
      const traffic = context.traffic || { dirtyAir:1, slipstream:1, pressure:1, defending:false };
      const safety = context.safetyCarActive ? .70 : 1;
      const weatherGrip = track.wetness > .3 && !c.wetOnly ? clamp(1 - track.wetness * .32, .68, 1) : 1;
      const fuelWeightPace = clamp(1.018 - (vehicle.fuelMass || 0) / 4200, .986, 1.018);
      const fuelBurn = (0.070 + (100 - (car.fuel || 55)) / 1500) * pace.fuel * dt * speed;
      vehicle.fuelMass = clamp((vehicle.fuelMass ?? entry.fuel ?? 100) - fuelBurn, 0, 100);

      const targetTyreTemp = (c.idealMin + c.idealMax) / 2 + (paceId === 'attack' ? 9 : paceId === 'save' ? -7 : 0) + (traffic.dirtyAir < 1 ? 4 : 0) - (track.wetness || 0) * 24;
      vehicle.tyreTemperature += (targetTyreTemp - vehicle.tyreTemperature) * dt * speed * .045 * c.warmup;
      vehicle.tyreTemperature = clamp(vehicle.tyreTemperature, 35, 145);
      const thermalGrip = tyreThermalGrip(vehicle, c);
      const tempWear = vehicle.tyreTemperature > c.idealMax ? 1 + (vehicle.tyreTemperature - c.idealMax) / 90 : vehicle.tyreTemperature < c.idealMin - 12 ? 1.06 : 1;
      const tyreWear = (0.052 + (100 - (car.tyreWear || 55)) / 1600) * c.wear * pace.tyreWear * tempWear * (traffic.dirtyAir < 1 ? 1.035 : 1) * dt * speed;
      vehicle.tyreLife = clamp((vehicle.tyreLife ?? entry.tyre ?? 100) - tyreWear, 0, 100);
      const tyreCliff = vehicle.tyreLife < c.cliff ? clamp(.86 + vehicle.tyreLife / Math.max(1, c.cliff) * .14, .76, 1) : 1;
      const tyreGrip = clamp((.765 + vehicle.tyreLife / 100 * .285) * c.grip * thermalGrip * tyreCliff, .56, 1.08);

      const brake = systems.brakes || {};
      const brakeStress = Number(context.trackProfile?.brakeStress || 1);
      vehicle.brakeTemperature += ((Number(brake.heatBase || 15.4) * brakeStress * pace.brakeHeat * (traffic.dirtyAir < 1 ? 1.12 : 1)) - Number(brake.coolBase || 11.5) * pace.cooling) * dt * speed;
      vehicle.brakeTemperature = clamp(vehicle.brakeTemperature, 250, 1250);
      const brakePenalty = vehicle.brakeTemperature > (brake.overheat || 980) ? clamp(1 - (vehicle.brakeTemperature - brake.overheat) / 1600, .86, 1) : vehicle.brakeTemperature < 360 ? .985 : 1;

      const engine = systems.engine || {};
      vehicle.engineTemperature += (Number(engine.heatBase || .34) * pace.fuel * (paceId === 'attack' ? 1.18 : 1) - Number(engine.coolBase || .22) * pace.cooling + (traffic.dirtyAir < 1 ? .08 : 0)) * dt * speed;
      vehicle.engineTemperature = clamp(vehicle.engineTemperature, 70, 130);
      const enginePenalty = vehicle.engineTemperature > (engine.overheat || 116) ? clamp(1 - (vehicle.engineTemperature - engine.overheat) / 260, .86, 1) : 1;

      const ers = systems.ers || {};
      const deploy = Number(ers.deployBase || .42) * pace.ers * (traffic.gapAhead < .055 || traffic.defending ? 1.16 : .86) * dt * speed;
      const regen = Number(ers.regenBase || .165) * (paceId === 'save' ? 1.72 : 1) * (context.safetyCarActive ? 1.45 : 1) * dt * speed;
      vehicle.ers = clamp((vehicle.ers ?? 60) + regen - deploy, 0, Number(ers.capacity || 100));
      const ersBoost = vehicle.ers > (ers.overtakeThreshold || 70) && traffic.gapAhead < .055 ? 1.010 : vehicle.ers < 8 ? Number(ers.lowPenalty || .974) : 1;

      const drs = systems.drs || {};
      const drsAllowed = !context.safetyCarActive && (!drs.disabledWhenWet || (track.wetness || 0) < .18) && Number(entry.lap || 1) >= Number(drs.enabledAfterLap || 2) && traffic.gapAhead < Number(drs.gapLaps || .090) && Number(entry.sector || 1) === 3;
      vehicle.drsAvailable = Boolean(drsAllowed);
      const drsBoost = drsAllowed ? Number(drs.boost || 1.014) : 1;

      const damage = systems.damage || {};
      const reliabilityBase = clamp((car.reliability || 55) + (entry.setupFx?.reliability || 0) * 100, 35, 105);
      const risk = Math.max(0, (88 - reliabilityBase) / 10000) * pace.risk * c.risk * (vehicle.engineTemperature > (engine.damageAt || 114) ? 1.8 : 1) * (vehicle.brakeTemperature > (brake.overheat || 980) ? 1.35 : 1);
      const deterministicDamage = risk * dt * speed * 10;
      vehicle.powerUnitDamage = clamp((vehicle.powerUnitDamage || 0) + deterministicDamage * .72, 0, 100);
      vehicle.aeroDamage = clamp((vehicle.aeroDamage || 0) + deterministicDamage * (traffic.defending ? .18 : .08), 0, 100);
      vehicle.chassisDamage = clamp((vehicle.chassisDamage || 0) + deterministicDamage * .10, 0, 100);
      const totalDamage = vehicle.aeroDamage + vehicle.chassisDamage + vehicle.powerUnitDamage;
      vehicle.reliabilityHealth = clamp(100 - totalDamage * .48, 0, 100);
      const damagePenalty = clamp(1 - vehicle.aeroDamage * Number(damage.aeroLossPerPoint || .0019) - vehicle.chassisDamage * Number(damage.chassisLossPerPoint || .0013) - vehicle.powerUnitDamage * .0009, .72, 1);
      const reliabilityPenalty = clamp(.790 + vehicle.reliabilityHealth / 100 * .225, .62, 1.02);
      const paceMultiplier = clamp(pace.pace * safety * weatherGrip * tyreGrip * fuelWeightPace * brakePenalty * enginePenalty * ersBoost * drsBoost * traffic.dirtyAir * traffic.slipstream * traffic.pressure * damagePenalty * reliabilityPenalty * (track.grip || 1), .38, 1.18);
      vehicle.lastEffects = { paceMultiplier, tyreGrip, thermalGrip, fuelWeightPace, brakePenalty, enginePenalty, ersBoost, drsBoost, dirtyAir:traffic.dirtyAir, slipstream:traffic.slipstream, trackGrip:track.grip || 1, reliabilityRisk:risk };
      entry.vehicle = vehicle;
      entry.tyre = vehicle.tyreLife;
      entry.fuel = vehicle.fuelMass;
      entry.condition = vehicle.reliabilityHealth;
      entry.drs = vehicle.drsAvailable;
      entry.ers = vehicle.ers;
      entry.brakeTemp = vehicle.brakeTemperature;
      entry.engineTemp = vehicle.engineTemperature;
      entry.damage = Math.round(totalDamage);
      return { paceMultiplier, vehicle, traffic, risk };
    }

    function pitService(entry, { compound:nextCompound } = {}){
      const current = entry.vehicle || initialState({ compound:entry.compound, fuel:entry.fuel, condition:entry.condition, car:entry.car });
      const compoundId = nextCompound || (entry.pits === 0 ? (entry.compound === 'soft' ? 'medium' : 'hard') : 'hard');
      const fresh = initialState({ compound:compoundId, fuel:current.fuelMass, condition:current.reliabilityHealth, car:entry.car });
      fresh.ers = current.ers;
      fresh.brakeTemperature = Math.max(430, current.brakeTemperature - 140);
      fresh.engineTemperature = Math.max(88, current.engineTemperature - 5);
      fresh.aeroDamage = current.aeroDamage;
      fresh.chassisDamage = Math.max(0, current.chassisDamage - 2);
      fresh.powerUnitDamage = current.powerUnitDamage;
      fresh.reliabilityHealth = clamp(current.reliabilityHealth + 4, 0, 100);
      entry.compound = compoundId;
      entry.vehicle = fresh;
      entry.tyre = fresh.tyreLife;
      entry.condition = fresh.reliabilityHealth;
      return entry;
    }

    function snapshot(entry){
      const v = entry.vehicle || {};
      return {
        tyreLife:Math.round(v.tyreLife ?? entry.tyre ?? 0),
        tyreTemperature:Math.round(v.tyreTemperature ?? 0),
        fuelMass:Math.round(v.fuelMass ?? entry.fuel ?? 0),
        ers:Math.round(v.ers ?? 0),
        drs:Boolean(v.drsAvailable),
        brakeTemperature:Math.round(v.brakeTemperature ?? 0),
        engineTemperature:Math.round(v.engineTemperature ?? 0),
        damage:Math.round((v.aeroDamage || 0) + (v.chassisDamage || 0) + (v.powerUnitDamage || 0)),
        reliabilityHealth:Math.round(v.reliabilityHealth ?? entry.condition ?? 0),
        lastEffects:v.lastEffects || {}
      };
    }

    function audit(){
      const sampleTrack = trackState({ weather:'dry', laps:22 });
      const entry = { compound:'medium', pace:'attack', car:{ reliability:62, engine:67, tyreWear:61, fuel:58 }, tyre:100, fuel:100, condition:100, lap:3, sector:3, distance:1.2, vehicle:null };
      entry.vehicle = initialState({ compound:'medium', car:entry.car });
      updateTrack(sampleTrack, { dt:1, speed:4, cars:22, weather:'dry' });
      const effects = updateVehicle(entry, { dt:1, speed:4, trackState:sampleTrack, traffic:{ gapAhead:.040, dirtyAir:.985, slipstream:1.009, pressure:1, defending:false }, safetyCarActive:false });
      const required = data.auditTargets?.requiredSystems || [];
      const checks = [
        { id:'compounds', ok:Object.keys(compounds).length >= 5, detail:String(Object.keys(compounds).length) },
        { id:'pace-modes', ok:Object.keys(paceModes).length >= 3, detail:String(Object.keys(paceModes).length) },
        { id:'tyre-temperature', ok:Number.isFinite(entry.vehicle.tyreTemperature) && entry.vehicle.tyreTemperature > 40, detail:String(Math.round(entry.vehicle.tyreTemperature)) },
        { id:'fuel-mass', ok:entry.vehicle.fuelMass < 100 && entry.vehicle.fuelMass >= 0, detail:String(entry.vehicle.fuelMass.toFixed(2)) },
        { id:'ers', ok:entry.vehicle.ers >= 0 && entry.vehicle.ers <= 100, detail:String(entry.vehicle.ers.toFixed(1)) },
        { id:'drs', ok:entry.vehicle.drsAvailable === true, detail:'enabled in sector 3 close gap' },
        { id:'brakes', ok:entry.vehicle.brakeTemperature > 250, detail:String(Math.round(entry.vehicle.brakeTemperature)) },
        { id:'engine-temperature', ok:entry.vehicle.engineTemperature > 70, detail:String(Math.round(entry.vehicle.engineTemperature)) },
        { id:'damage', ok:entry.vehicle.powerUnitDamage >= 0, detail:String(entry.vehicle.powerUnitDamage.toFixed(2)) },
        { id:'reliability', ok:entry.vehicle.reliabilityHealth <= 100 && entry.vehicle.reliabilityHealth >= 0, detail:String(entry.vehicle.reliabilityHealth.toFixed(1)) },
        { id:'dirty-air', ok:effects.traffic.dirtyAir < 1, detail:String(effects.traffic.dirtyAir) },
        { id:'track-evolution', ok:sampleTrack.grip > .965 && sampleTrack.rubber > 0, detail:`grip ${sampleTrack.grip.toFixed(3)}` },
        { id:'snapshot', ok:Object.prototype.hasOwnProperty.call(snapshot(entry),'engineTemperature'), detail:'telemetry snapshot' }
      ];
      const failed = checks.filter(item=>!item.ok).length;
      return { schema:data.schema || 1, season:data.season || 2026, sourceTag:data.sourceTag || '', systems:required, score:Math.max(0, 100 - failed * 8), passed:checks.length-failed, failed, checks };
    }

    return Object.freeze({ data:clone(data), compounds:clone(compounds), initialState, trackState, updateTrack, trafficEffects, updateVehicle, pitService, snapshot, audit });
  }

  core.vehiclePhysics = Object.freeze({ createVehiclePhysics });
})();
