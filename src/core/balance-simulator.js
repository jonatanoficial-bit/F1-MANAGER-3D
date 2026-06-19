(() => {
  'use strict';
  const root = globalThis;
  const core = root.F1M_CORE = root.F1M_CORE || {};

  const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
  const round = (value, digits = 2) => Number((Number(value) || 0).toFixed(digits));
  const avg = arr => arr.length ? arr.reduce((a,b)=>a+b,0) / arr.length : 0;
  const sum = arr => arr.reduce((a,b)=>a+b,0);
  const percentile = (arr, p) => {
    if(!arr.length) return 0;
    const s = arr.slice().sort((a,b)=>a-b);
    const idx = clamp((s.length - 1) * p, 0, s.length - 1);
    const lo = Math.floor(idx), hi = Math.ceil(idx), w = idx - lo;
    return s[lo] * (1 - w) + s[hi] * w;
  };

  function createPrng(seed = 1){
    let t = Number(seed) >>> 0;
    return function rand(){
      t += 0x6D2B79F5;
      let r = Math.imul(t ^ t >>> 15, 1 | t);
      r ^= r + Math.imul(r ^ r >>> 7, 61 | r);
      return ((r ^ r >>> 14) >>> 0) / 4294967296;
    };
  }

  function gaussian(rand){
    const u = Math.max(1e-9, rand());
    const v = Math.max(1e-9, rand());
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function createBalanceSimulator(options = {}){
    const data = options.data || root.F1M_BALANCE_DATA || {};
    const targets = data.targets || {};
    const defaultRuns = Number(data.monteCarlo?.defaultRuns || 256);
    const baseSeed = Number(data.monteCarlo?.seed || 132026);

    function teamTier(team){
      const tier = String(team?.tier || '').toLowerCase();
      if(tier.includes('top') || tier.includes('front')) return 'top';
      if(tier.includes('mid')) return 'mid';
      if(tier.includes('back') || tier.includes('low')) return 'back';
      const perf = Number(team?.performance || team?.car?.aero || team?.car?.overall || 60);
      return perf >= 76 ? 'top' : perf >= 58 ? 'mid' : 'back';
    }

    function carScore(team = {}){
      const car = team.car || team || {};
      const raw = [car.aero, car.engine, car.chassis, car.reliability, car.tyres, car.tyreWear, car.pitStop, team.performance]
        .filter(v => Number.isFinite(Number(v))).map(Number);
      return raw.length ? avg(raw) : 60;
    }

    function driverScore(driver = {}){
      const raw = [driver.speed, driver.consistency, driver.racecraft, driver.rain, driver.overall, driver.aggression]
        .filter(v => Number.isFinite(Number(v))).map(Number);
      return raw.length ? avg(raw) : 64;
    }

    function normalizeRoster(teams = [], drivers = []){
      const teamById = new Map(teams.map(t => [t.id || t.name, t]));
      return drivers.map((driver, index) => {
        const team = teamById.get(driver.team) || teams[index % Math.max(1, teams.length)] || { id:'team', name:'Equipe', car:{} };
        return { driver, team, tier:teamTier(team), power:carScore(team) * 0.58 + driverScore(driver) * 0.42 };
      }).slice(0, Math.max(10, Math.min(24, drivers.length || 22)));
    }

    function simulateRaceOnce(roster, options = {}){
      const rand = createPrng(Number(options.seed || baseSeed));
      const laps = Number(options.laps || data.monteCarlo?.raceDistanceLaps || 26);
      const difficulty = data.difficultyModels?.[options.difficulty || 'normal'] || data.difficultyModels?.normal || {};
      const entries = roster.map((item, index) => {
        const reliability = clamp(Number(item.team?.car?.reliability || item.team?.reliability || 62), 15, 98);
        const tyreWear = clamp(Number(item.team?.car?.tyreWear || item.team?.car?.tyres || 62), 20, 98);
        const consistency = clamp(Number(item.driver?.consistency || 66), 20, 98);
        const racecraft = clamp(Number(item.driver?.racecraft || item.driver?.aggression || 62), 20, 98);
        const noise = gaussian(rand) * 0.55 + gaussian(rand) * (1.35 - consistency / 120);
        const baseLap = 82.4 - item.power / 18 + noise;
        const dnfChance = clamp(0.012 + (92 - reliability) / 950 + (100 - consistency) / 2200, 0.006, 0.19);
        const dnf = rand() < dnfChance;
        const pitStops = dnf ? Math.floor(rand() * 2) : (tyreWear < 50 ? 2 : rand() < 0.22 ? 2 : 1);
        const pitLoss = pitStops * (19.8 + rand() * 5.6 - clamp(Number(item.team?.car?.pitStop || 58), 20, 95) / 9.5);
        const tyreDegradation = laps * (1.55 - tyreWear / 110) + rand() * 4;
        const incidentLoss = rand() < clamp((100 - racecraft) / 900, 0.004, 0.09) ? 8 + rand() * 28 : 0;
        const time = dnf ? Infinity : baseLap * laps + pitLoss + tyreDegradation + incidentLoss;
        const overtakeWeight = clamp((racecraft + Number(item.driver?.aggression || 62)) / 2, 25, 98) / 100;
        return { ...item, index, reliability, time, dnf, pitStops, incidentLoss, overtakeWeight, difficultyEconomy: difficulty.budget || 1 };
      });
      const classified = entries.slice().sort((a,b)=>a.time-b.time);
      const finishers = classified.filter(e => Number.isFinite(e.time));
      const winner = finishers[0] || classified[0];
      const second = finishers[1] || winner;
      const lastFinisher = finishers[finishers.length - 1] || winner;
      const overtakes = Math.max(0, Math.round(sum(entries.map(e => e.overtakeWeight)) * (0.82 + rand() * 0.42) + gaussian(rand) * 5));
      const points = [25,18,15,12,10,8,6,4,2,1];
      classified.forEach((entry, pos) => { entry.pos = pos + 1; entry.points = entry.dnf ? 0 : (points[pos] || 0); });
      return {
        dnfCount: entries.filter(e => e.dnf).length,
        pitStops: sum(entries.map(e => e.pitStops)),
        overtakes,
        winningGapSeconds: Math.max(0, round((second.time || winner.time) - (winner.time || 0), 2)),
        fieldSpreadSeconds: Math.max(0, round((lastFinisher.time || winner.time) - (winner.time || 0), 2)),
        classified,
        winnerTier: winner?.tier || 'mid',
        pointsByTier: ['top','mid','back'].reduce((acc,tier)=>{ acc[tier] = sum(classified.filter(e=>e.tier===tier).map(e=>e.points)); return acc; }, {})
      };
    }

    function simulateMonteCarlo(input = {}){
      const teams = input.teams || [];
      const drivers = input.drivers || [];
      const roster = normalizeRoster(teams, drivers);
      const runs = clamp(input.runs || defaultRuns, 12, 5000);
      const races = [];
      for(let i = 0; i < runs; i++) races.push(simulateRaceOnce(roster, { ...input, seed:(input.seed || baseSeed) + i * 7919 }));
      return analyseRaces(races, roster, { runs, seed:input.seed || baseSeed, difficulty:input.difficulty || 'normal' });
    }

    function analyseRaces(races, roster, meta = {}){
      const driverCount = Math.max(1, roster.length || 22);
      const totalPoints = sum(races.map(r => sum(Object.values(r.pointsByTier || {})))) || 1;
      const topWins = races.filter(r => r.winnerTier === 'top').length;
      const metrics = {
        dnfRate: avg(races.map(r => r.dnfCount / driverCount)),
        pitStopsPerDriver: avg(races.map(r => r.pitStops / driverCount)),
        overtakesPerRace: avg(races.map(r => r.overtakes)),
        winningGapSeconds: avg(races.map(r => r.winningGapSeconds)),
        fieldSpreadSeconds: avg(races.map(r => r.fieldSpreadSeconds)),
        topTeamWinShare: topWins / Math.max(1, races.length),
        midfieldPointsShare: sum(races.map(r => r.pointsByTier.mid || 0)) / totalPoints,
        backmarkerPointsShare: sum(races.map(r => r.pointsByTier.back || 0)) / totalPoints
      };
      const distributions = {
        dnfCount: distribution(races.map(r => r.dnfCount)),
        overtakes: distribution(races.map(r => r.overtakes)),
        pitStops: distribution(races.map(r => r.pitStops)),
        winningGapSeconds: distribution(races.map(r => r.winningGapSeconds)),
        fieldSpreadSeconds: distribution(races.map(r => r.fieldSpreadSeconds))
      };
      const scoreCards = Object.entries(metrics).map(([id,value]) => gradeMetric(id, value));
      const score = Math.round(avg(scoreCards.map(card => card.score)));
      return {
        schema: 1,
        generatedAt: new Date().toISOString(),
        runs: races.length,
        seed: meta.seed,
        difficulty: meta.difficulty,
        driverCount,
        score,
        metrics: Object.fromEntries(Object.entries(metrics).map(([k,v]) => [k, round(v, 4)])),
        scoreCards,
        distributions,
        recommendations: recommendations(scoreCards),
        antiCheat: auditDifficultyModels()
      };
    }

    function distribution(values){
      return {
        min: round(Math.min(...values), 2),
        p05: round(percentile(values, .05), 2),
        p25: round(percentile(values, .25), 2),
        median: round(percentile(values, .50), 2),
        p75: round(percentile(values, .75), 2),
        p95: round(percentile(values, .95), 2),
        max: round(Math.max(...values), 2)
      };
    }

    function gradeMetric(id, value){
      const target = targets[id] || { min:0, ideal:value, max:value || 1 };
      const min = Number(target.min), ideal = Number(target.ideal), max = Number(target.max);
      let score = 100;
      if(value < min) score = Math.max(0, 100 - ((min - value) / Math.max(0.001, ideal - min)) * 45);
      else if(value > max) score = Math.max(0, 100 - ((value - max) / Math.max(0.001, max - ideal)) * 45);
      else score = 100 - Math.abs(value - ideal) / Math.max(0.001, max - min) * 18;
      return { id, value:round(value,4), target, score:Math.round(clamp(score,0,100)), status: score >= 88 ? 'green' : score >= 72 ? 'yellow' : 'red' };
    }

    function recommendations(cards){
      const out = [];
      for(const card of cards){
        if(card.status === 'green') continue;
        if(card.id === 'dnfRate') out.push(card.value < card.target.min ? 'Aumentar risco mecânico de motores/freios em stints longos.' : 'Reduzir falhas mecânicas ou suavizar dano por superaquecimento.');
        if(card.id === 'pitStopsPerDriver') out.push(card.value < card.target.min ? 'Elevar desgaste de pneus ou estreitar janela ótima de compostos.' : 'Reduzir cliff ou ampliar vida útil dos compostos.');
        if(card.id === 'overtakesPerRace') out.push(card.value < card.target.min ? 'Aumentar efeito de DRS/slipstream e erro sob pressão.' : 'Reduzir bônus de DRS em pistas de reta longa.');
        if(card.id === 'topTeamWinShare') out.push(card.value > card.target.max ? 'Diminuir distância carro top/médio ou melhorar progressão do pelotão médio.' : 'Dar maior peso à qualidade de carro/piloto no ritmo final.');
        if(card.id === 'backmarkerPointsShare') out.push(card.value > card.target.max ? 'Reduzir aleatoriedade de pontos de equipes fracas.' : 'Permitir pontos raros por caos, estratégia e confiabilidade.');
      }
      return [...new Set(out)].slice(0, 8);
    }

    function projectTeamProgression(teams = [], seasons = 3, seed = baseSeed){
      const rand = createPrng(seed);
      return teams.map(team => {
        const tier = teamTier(team);
        const max = data.progression?.[tier === 'top' ? 'maxSeasonDeltaTop' : tier === 'mid' ? 'maxSeasonDeltaMid' : 'maxSeasonDeltaBack'] || 6;
        let perf = carScore(team);
        const history = [];
        for(let y=1; y<=seasons; y++){
          const catchup = tier === 'back' ? 1.16 : tier === 'mid' ? 0.98 : 0.72;
          const delta = clamp((rand()*2 - .72) * max * catchup, -max * .55, max);
          perf = clamp(perf + delta, 28, 96);
          history.push({ season:y, performance:round(perf,2), delta:round(delta,2) });
        }
        return { id:team.id, name:team.name, tier, history };
      });
    }

    function auditDifficultyModels(){
      const models = data.difficultyModels || {};
      return Object.entries(models).map(([id,model]) => ({
        id,
        noHiddenGrip: Number(model.hiddenGrip || 1) === 1,
        economyChanges: Number(model.budget || 1) !== 1 || Number(model.cost || 1) !== 1 || id === 'normal',
        rivalGrowthDeclared: Number.isFinite(Number(model.rivalGrowth)),
        playerBonusWithinLimit: Math.abs(Number(model.playerBonusLimit || 0)) <= 0.02,
        description: model.description || ''
      }));
    }

    function audit(){
      const checks = [
        ['monte-carlo-engine', typeof simulateMonteCarlo === 'function'],
        ['deterministic-seed', createPrng(7)() === createPrng(7)()],
        ['dnf-distribution', Boolean(targets.dnfRate)],
        ['overtake-distribution', Boolean(targets.overtakesPerRace)],
        ['pit-stop-distribution', Boolean(targets.pitStopsPerDriver)],
        ['gap-distribution', Boolean(targets.winningGapSeconds && targets.fieldSpreadSeconds)],
        ['team-tier-shares', Boolean(targets.topTeamWinShare && targets.midfieldPointsShare)],
        ['backmarker-points', Boolean(targets.backmarkerPointsShare)],
        ['progression-model', typeof projectTeamProgression === 'function'],
        ['difficulty-no-cheat', auditDifficultyModels().every(item => item.noHiddenGrip && item.playerBonusWithinLimit)],
        ['recommendations', typeof recommendations === 'function'],
        ['confidence-bands', Array.isArray(data.monteCarlo?.confidenceBands) && data.monteCarlo.confidenceBands.length >= 5]
      ].map(([id,ok]) => ({ id, ok:Boolean(ok) }));
      const passed = checks.filter(c=>c.ok).length;
      return { score:Math.round(passed/checks.length*100), passed, failed:checks.length-passed, systems:checks.map(c=>c.id), checks };
    }

    return { audit, simulateMonteCarlo, simulateRaceOnce, analyseRaces, projectTeamProgression, gradeMetric, auditDifficultyModels, targets };
  }

  core.balance = Object.freeze({ createBalanceSimulator });
})();
