(() => {
  const DATA = window.F1M_DATA;
  const SAVE_KEYS = ['f1_manager_career_2026_v090', 'f1_manager_career_2026_v070', 'f1_manager_career_2026_v060', 'f1_manager_career_2026_v050', 'f1_manager_career_2026_v040', 'f1_manager_career_2026_v020'];
  const ACTIVE_SAVE_KEY = SAVE_KEYS[0];
  const ASSET_ROOTS = ['assets/'];

  let state = loadState() || createInitialState();
  let selectedAvatar = 0;
  let selectedMode = 'realistic';
  let selectedSeries = 'F2';
  let selectedTeam = DATA.f2Teams[0].id;
  let selectedCompound = 'soft';
  let race = null;
  let renderer3d = null;

  const $ = (q) => document.querySelector(q);
  const $$ = (q) => Array.from(document.querySelectorAll(q));

  function money(n){ return '$ ' + Math.round(n||0).toLocaleString('pt-BR'); }
  function pct(n){ return Math.round((n||0)*100)/100; }
  function teamById(id){ return DATA.f1Teams2026.concat(DATA.f2Teams).find(t => t.id === id); }
  function allDrivers(){ return DATA.f1Drivers2026.concat(DATA.f2Drivers); }
  function allDriversForSeries(series){ return (series === 'F1' ? DATA.f1Drivers2026 : DATA.f2Drivers).map(applyDriverProgress); }
  function defaultRosters(){ const r={}; allDrivers().forEach(d=>{ r[d.team]=r[d.team]||[]; if(!r[d.team].includes(d.short)) r[d.team].push(d.short); }); return r; }
  function ensureRosters(){ state.rosters = state.rosters || defaultRosters(); return state.rosters; }
  function applyDriverProgress(d){ if(!d) return d; const p = state && state.driverProgress ? state.driverProgress[d.short] : null; return p ? {...d, ...p} : d; }
  function driverCurrentTeamId(short){ const rosters = ensureRosters(); for(const [team,list] of Object.entries(rosters)){ if((list||[]).includes(short)) return team; } const d=allDrivers().find(x=>x.short===short); return d ? d.team : null; }
  function driversForTeam(id){ const rosters = ensureRosters(); const list = rosters[id]; if(Array.isArray(list)) return list.map(s=>allDrivers().find(d=>d.short===s)).filter(Boolean).map(d=>({...applyDriverProgress(d),currentTeam:id})); return allDrivers().filter(d=>d.team===id).map(d=>({...applyDriverProgress(d),currentTeam:id})); }
  function rnd(min,max){ return min + Math.random()*(max-min); }
  function cleanAssetPath(p){ return String(p||'').replace(/^\.?\//,'').replace(/^assets\//,''); }
  function assetCandidates(p){ const rel = cleanAssetPath(p); return ASSET_ROOTS.map(root => root + rel); }
  function asset(p){ return assetCandidates(p)[0]; }
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
    return {
      profile:null,
      mode:'realistic',
      currentSeries:'F2',
      currentTeam:null,
      roundIndex:5,
      money:0,
      reputation:0,
      sponsor:null,
      raceStrategy:{ plan:'balanced', startCompound:'soft', stopBias:'balanced' },
      staff:{ designers:1, mechanics:1, strategists:1, raceEngineers:1, scouts:1, pitCrew:1 },
      facilities:{ hq:1, simulator:1, factory:1, scouting:0 },
      rosters: defaultRosters(),
      driverContracts:{},
      driverProgress:{},
      seasonArchive:[],
      tutorial:{ completed:false, step:0 },
      quality:{ difficulty:'normal', betaScore:0, lastCheck:null, checks:[] },
      saveSlotsMeta:{},
      hallOfFame:[],
      driverDevelopmentLog:[],
      carEvolutionLog:[],
      car:{ aero:50, engine:50, chassis:50, reliability:55, tyreWear:55, pitStop:55, fuel:55 },
      setup:{ preset:'balanced', aeroBalance:50, engineMode:50, suspension:50, tyrePressure:50 },
      standings:standings,
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
      createdAt:new Date().toISOString()
    };
  }
  function saveState(){ localStorage.setItem(ACTIVE_SAVE_KEY, JSON.stringify(state)); }
  function loadState(){
    for(const key of SAVE_KEYS){
      try {
        const raw = localStorage.getItem(key);
        if(raw) return JSON.parse(raw);
      } catch(e){}
    }
    return null;
  }


  function ensureCareerSystems(){
    state.inbox = Array.isArray(state.inbox) ? state.inbox : [];
    state.setup = state.setup || { preset:'balanced', aeroBalance:50, engineMode:50, suspension:50, tyrePressure:50 };
    state.weekend = state.weekend || { practiceDone:false, setupConfidence:50, tyreKnowledge:50, qualyFocus:'balanced', engineerNote:'Aguardando treino livre.' };
    state.staff = {...{ designers:1, mechanics:1, strategists:1, raceEngineers:1, scouts:1, pitCrew:1 }, ...(state.staff||{})};
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
      saveState();
    }
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
    addInboxMessage('calendar','FIA / Calendário',`Agenda da temporada ${state.seasonYear || 2026}`,`A temporada tem ${DATA.calendar2026.length} eventos. Bons resultados, finanças saudáveis e evolução técnica aumentam sua reputação e liberam convites para equipes maiores.`,{});
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
    if(!img || !relPath || img.dataset.assetBound === '1') return;
    img.dataset.assetBound = '1';
    const tries = assetCandidates(relPath);
    let idx = 0;
    const fallback = () => {
      const fb = img.parentElement && img.parentElement.querySelector('.fallback-badge');
      img.style.display = 'none';
      if(fb) fb.style.display = 'flex';
    };
    img.onerror = () => {
      idx++;
      if(idx < tries.length) img.src = tries[idx];
      else fallback();
    };
    img.src = tries[idx];
  }
  function loadBgWithFallback(el, relPath){
    if(!el || !relPath || el.dataset.bgBound === '1') return;
    el.dataset.bgBound = '1';
    const tries = assetCandidates(relPath);
    let idx = 0;
    const tester = new Image();
    tester.onload = () => { el.style.backgroundImage = `url('${tries[idx]}')`; };
    tester.onerror = () => { idx++; if(idx < tries.length) tester.src = tries[idx]; };
    tester.src = tries[idx];
  }
  function hydrateAssets(root=document){
    root.querySelectorAll('[data-asset-src]').forEach(img => loadImgWithFallback(img, img.dataset.assetSrc));
    root.querySelectorAll('[data-asset-bg]').forEach(el => loadBgWithFallback(el, el.dataset.assetBg));
  }
  function setScreenBg(screenId, relPath){
    const el = document.getElementById(screenId);
    if(!el) return;
    if(el.dataset.assetBg !== relPath){ el.dataset.assetBg = relPath; delete el.dataset.bgBound; }
    loadBgWithFallback(el, relPath);
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
    const vh = Math.max(320, window.innerHeight || document.documentElement.clientHeight || screen.height || 720);
    const vw = Math.max(320, window.innerWidth || document.documentElement.clientWidth || screen.width || 1280);
    document.documentElement.style.setProperty('--app-height', `${vh}px`);
    document.documentElement.style.setProperty('--app-width', `${vw}px`);
    document.body.classList.toggle('is-mobile-viewport', Math.min(vw, vh) <= 900 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }

  function bindViewportFixes(){
    setMobileViewport();
    ['resize','orientationchange'].forEach(evt => window.addEventListener(evt, () => setTimeout(setMobileViewport, 120), { passive:true }));
    if(window.visualViewport){
      window.visualViewport.addEventListener('resize', () => setTimeout(setMobileViewport, 60), { passive:true });
      window.visualViewport.addEventListener('scroll', () => setTimeout(setMobileViewport, 60), { passive:true });
    }
  }

  function enterFullscreen(){
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if(req){ try { req.call(el); } catch(e){} }
    if(screen.orientation && screen.orientation.lock){ screen.orientation.lock('landscape').catch(()=>{}); }
    setTimeout(setMobileViewport, 120);
  }

  function showScreen(name){
    $$('.screen').forEach(s => s.classList.remove('active'));
    const el = $('#screen-' + name);
    if(el) el.classList.add('active');
    if(name === 'lobby') renderLobby();
    if(name === 'qualifying') renderQualifying(false);
    if(name === 'race') setTimeout(startRaceRenderer, 60);
    if(name === 'assets-check') renderAssetChecklist();
    if(name === 'results') renderResults();
  }

  function updateBuildBadges(){
    const b = DATA.build || {};
    const label = b.label || 'Build v0.9.37 • 14/05/2026 • 10:20 BRT';
    const home = document.getElementById('homeBuildPill');
    const global = document.getElementById('globalBuildStamp');
    if(home) home.textContent = label;
    if(global) global.textContent = label;
    document.title = `F1 Manager Career 2026 — ${label}`;
  }

  function init(){
    bindViewportFixes();
    updateBuildBadges();
    ensureCareerSystems();
    screenBackgrounds();
    bindGlobalActions();
    initNavLabels();
    renderCreator();
    renderTeamSelect();
    renderQuickRaceSelect();
    updateHud();
    showScreen('home');
    hydrateAssets(document);
  }

  function bindGlobalActions(){
    document.body.addEventListener('click', (ev) => {
      const nav = ev.target.closest('[data-nav]');
      if(nav){ showScreen(nav.dataset.nav); return; }
      const act = ev.target.closest('[data-action]');
      if(act) handleAction(act.dataset.action, act);
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
      offers:'Propostas', inbox:'E-mails', saves:'Saves', 'data-lock':'Dados', qa:'QA'
    };
    $$('.side-nav button[data-tab]').forEach(btn => {
      const label = labels[btn.dataset.tab] || btn.dataset.tab;
      btn.dataset.label = label;
      btn.title = label;
      btn.setAttribute('aria-label', label);
    });
  }

  function mobileCoachCard(){
    const nextRace = DATA.calendar2026[state.roundIndex] || DATA.calendar2026[0];
    const team = teamById(state.currentTeam);
    return `<article class="dash-card glass-panel wide ux-coach-card"><h3>Central do Manager</h3><p>Próximo passo recomendado: <b>${(state.completedRaces||0) >= DATA.calendar2026.length ? 'revisar temporada' : 'preparar fim de semana em ' + nextRace.name}</b>.</p><div class="quick-action-row"><button class="primary" data-action="goQualifying">PRÓXIMA CORRIDA</button><button class="secondary" data-tab="garage">DESENVOLVER CARRO</button><button class="secondary" data-tab="staff">STAFF</button><button class="secondary" data-tab="inbox">E-MAILS</button></div><p class="muted-small">${team ? team.name : 'Equipe'} • ${state.currentSeries || 'F2'} • ${seasonProgressText()}</p></article>`;
  }

  function handleAction(action, el){
    const actions = {
      continueCareer(){ if(state.profile) showScreen('lobby'); else showScreen('career-create'); },
      enterFullscreen(){ enterFullscreen(); },
      createProfile(){ createProfile(); },
      startCareer(){ startCareer(); },
      goQualifying(){ ensureCareerSystems(); if((state.completedRaces||0) >= DATA.calendar2026.length){ renderTab('calendar'); return; } showScreen('qualifying'); },
      simulatePractice(){ simulatePracticeSession(); },
      setQualyFocus(){ setQualyFocus(el.dataset.focus); },
      startQualifying(){ simulateQualifying(); },
      startRaceDirect(){ const sel=document.getElementById('quickRaceSelect'); if(sel) state.roundIndex=Number(sel.value)||0; setupRace(true); showScreen('race'); },
      startRace(){ setupRace(false); showScreen('race'); },
      setPace(){ if(race){ race.playerPace[Number(el.dataset.driver)] = el.dataset.pace; updateRaceHud(); } },
      pitDriver(){ if(race) requestPit(Number(el.dataset.driver)); },
      chooseStrategy(){ chooseRaceStrategy(el.dataset.strategy); },
      toggleRaceSpeed(){ if(race){ race.speed = race.speed === 1 ? 2 : race.speed === 2 ? 4 : race.speed === 4 ? 8 : race.speed === 8 ? 16 : 1; $('#speedLabel').textContent = race.speed; } },
      toggleRaceCamera(){ if(race){ race.cameraMode = race.cameraMode === 'tv' ? 'follow' : race.cameraMode === 'follow' ? 'overhead' : 'tv'; race.raceLog.unshift('Câmera: '+cameraLabel(race.cameraMode)); } },
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
      resetCoach(){ state.tutorial = { completed:false, step:0 }; saveState(); renderTab('saves'); },
      completeCoach(){ state.tutorial = { completed:true, step:99 }; addInboxMessage('tutorial','Engenheiro-chefe','Tutorial concluído','Você concluiu o manual rápido. Agora o foco é desenvolver o carro, cuidar das finanças e buscar convites maiores.',{}); saveState(); renderTab('saves'); updateHud(); },
      runQa(){ runQualityChecklist(); },
      runClosedBeta(){ runClosedBetaAudit(); },
      setDifficulty(){ setDifficulty(el.dataset.difficulty); },
      endSeason(){ endSeasonReview(); }
    };
    if(actions[action]) actions[action]();
  }

  function renderQuickRaceSelect(){
    const sel = document.getElementById('quickRaceSelect');
    if(!sel || !DATA.calendar2026) return;
    sel.innerHTML = DATA.calendar2026.map((r,i)=>`<option value="${i}">${String(i+1).padStart(2,'0')} • ${r.name}</option>`).join('');
    const miamiIndex = DATA.calendar2026.findIndex(r => r.svgLayout === 'miami');
    sel.value = String(miamiIndex >= 0 ? miamiIndex : 0);
  }

  function renderCreator(){
    const avatarList = $('#avatarList'); avatarList.innerHTML = '';
    DATA.avatars.forEach((src,i) => {
      const b = document.createElement('button');
      b.className = 'avatar-option' + (i===selectedAvatar ? ' selected':'');
      b.innerHTML = `<img data-asset-src="${src}" alt="Avatar ${i+1}" /><span class="fallback-badge">AV${i+1}</span>`;
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
    state.roundIndex = series === 'F2' ? 5 : 0;
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
    const raceNow = Math.min((state.completedRaces||0)+1, DATA.calendar2026.length);
    const unread = state.unreadMessages ? ` • ✉ ${state.unreadMessages}` : '';
    $('#hudRound').textContent = `T${state.seasonNumber||1} ${state.seasonYear||2026} • Corrida ${raceNow}/${DATA.calendar2026.length}${unread}`;
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
    const currentRace = DATA.calendar2026[state.roundIndex] || DATA.calendar2026[5];
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
      const done = (state.completedRaces||0) >= DATA.calendar2026.length;
      content.innerHTML = `<div class="cards-grid agenda-grid">
        <article class="dash-card glass-panel bg wide" data-asset-bg="${DATA.assetPaths.calendar}"><div class="dash-overlay"></div><h3>Agenda da Temporada ${state.seasonYear || 2026}</h3><p>${seasonProgressText()}</p><div class="progress"><i style="width:${Math.min(100, ((state.completedRaces||0)/DATA.calendar2026.length)*100)}%"></i></div>${done ? '<button class="primary" data-action="endSeason">FAZER REVISÃO DA TEMPORADA</button>' : '<button class="primary" data-action="goQualifying">IR PARA PRÓXIMA CORRIDA</button>'}</article>
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
        <article class="dash-card glass-panel wide"><h3>Exportar / Importar carreira</h3><p>Exportar gera um arquivo JSON leve com estado da carreira. Importar aceita JSON colado via prompt para restaurar a carreira em outro navegador ou futura versão APK.</p><button class="primary" data-action="exportSave">EXPORTAR SAVE JSON</button><button class="secondary" data-action="importSave">IMPORTAR SAVE JSON</button></article>
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
  }



  function dataLockTeams(){ return DATA.f1Teams2026.concat(DATA.f2Teams); }
  function dataLockDrivers(){ return DATA.f1Drivers2026.concat(DATA.f2Drivers); }
  function dataLockChecks(){
    const teams = dataLockTeams();
    const drivers = dataLockDrivers();
    const calendar = DATA.calendar2026 || [];
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
    return `<p>F1: <b>${DATA.f1Teams2026.length} equipes</b> / <b>${DATA.f1Drivers2026.length} pilotos</b></p><p>F2: <b>${DATA.f2Teams.length} equipes</b> / <b>${DATA.f2Drivers.length} pilotos</b></p><p>Calendário: <b>${DATA.calendar2026.length} GPs</b></p><p>Pontuação: <b>${DATA.points.join('-')}</b></p>`;
  }
  function dataLockAssetSummary(){
    const f1Logo = DATA.f1Teams2026.every(t=>String(t.logo||'').startsWith('assets/teams/logos/'));
    const f2Logo = DATA.f2Teams.every(t=>String(t.logo||'').startsWith('assets/teams/logos/f2/'));
    const f1Avatar = DATA.f1Drivers2026.every(d=>String(d.portrait||'').startsWith('assets/drivers/current_grid/'));
    const f2Avatar = DATA.f2Drivers.every(d=>String(d.portrait||'').startsWith('assets/drivers/avatars/f2/'));
    return `<p>Logos F1: <b>${f1Logo?'OK':'verificar'}</b></p><p>Logos F2: <b>${f2Logo?'OK':'verificar'}</b></p><p>Avatares F1: <b>${f1Avatar?'OK':'verificar'}</b></p><p>Avatares F2: <b>${f2Avatar?'OK':'verificar'}</b></p>`;
  }
  function dataLockEconomySummary(){
    const drivers=dataLockDrivers(); const values=drivers.map(d=>driverMarketValue(d));
    const avgOverall=Math.round(drivers.reduce((s,d)=>s+(Number(d.overall)||0),0)/Math.max(1,drivers.length));
    const avgValue=Math.round(values.reduce((s,v)=>s+v,0)/Math.max(1,values.length));
    return `<p>Overall médio: <b>${avgOverall}</b></p><p>Valor médio de mercado: <b>${money(avgValue)}</b></p><p>Patrocinadores: <b>${DATA.sponsors.length}</b></p><p>Dificuldade atual: <b>${difficultyLabel()}</b></p>`;
  }
  function dataLockPathRows(){
    const paths=['assets/teams/logos/','assets/teams/logos/f2/','assets/drivers/current_grid/','assets/drivers/avatars/f2/','assets/backgrounds/','assets/icons/','assets/flags/all/','assets/tracks/svg/'];
    return `<div class="asset-path-list">${paths.map(p=>`<code>${p}</code>`).join('')}</div>`;
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
    a.href=url; a.download='f1-manager-diagnostico-v0-9-36.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    addInboxMessage('system','Sistema','Diagnóstico exportado','Foi gerado um JSON com build, navegador, save e caminhos críticos.',{});
    saveState(); renderTab('saves');
  }
  function resetActiveSave(){
    const ok = confirm('Resetar somente o save atual? Os slots 1, 2 e 3 não serão apagados.');
    if(!ok) return;
    localStorage.removeItem(ACTIVE_SAVE_KEY);
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
    const payload = JSON.stringify({...state, exportedAt:new Date().toISOString(), build:DATA.build}, null, 2);
    const blob = new Blob([payload], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `f1-manager-career-save-${state.profile?.name || 'gestor'}-${state.seasonYear || 2026}.json`.replace(/\s+/g,'_');
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    addInboxMessage('save','Sistema','Save exportado','Um arquivo JSON do save foi gerado para backup/importação futura.',{});
    saveState(); renderTab('saves'); updateHud();
  }
  function importSaveFromPrompt(){
    const raw = prompt('Cole aqui o JSON exportado do save:');
    if(!raw) return;
    try {
      const imported = JSON.parse(raw);
      if(!imported || typeof imported !== 'object') throw new Error('invalid');
      state = imported;
      ensureCareerSystems();
      addInboxMessage('save','Sistema','Save importado','A carreira importada foi carregada e salva como save ativo.',{});
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
    const hasCalendar = Array.isArray(DATA.calendar2026) && DATA.calendar2026.length >= 20;
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
    const calendarOk = Array.isArray(DATA.calendar2026) && DATA.calendar2026.length >= 20;
    const standingsOk = !!currentStandings() && Object.keys(currentStandings()).length >= 20;
    const economyOk = Number.isFinite(Number(state.money)) && !!state.sponsor !== undefined;
    const careerOk = !!state.contract && !!state.careerHistory && Array.isArray(state.inbox);
    const raceOk = !!state.raceStrategy && !!state.weekend && typeof setupRace === 'function' && typeof finishRace === 'function';
    const marketOk = drivers.length >= 2 && DATA.f1Drivers2026.length >= 22 && DATA.f2Drivers.length >= 22;
    const assetsOk = !!team?.logo && DATA.assetPaths && !!DATA.assetPaths.menu;
    return [
      {name:'QA geral acima de 90', ok:qa >= 90, fix:'rodar checklist beta e corrigir pendências'},
      {name:'Data Lock 100/100', ok:dl >= 100, fix:'revisar equipes, pilotos, calendário e assets'},
      {name:'Calendário completo', ok:calendarOk, fix:'revisar DATA.calendar2026'},
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
    const salaryCost = Math.round(drivers.reduce((sum,d)=>sum + Math.round((d.salary||250000) / DATA.calendar2026.length), 0) * tune.cost);
    const staffCost = Math.round(Object.values(state.staff||{}).reduce((sum,n)=>sum + Number(n||0), 0) * (state.currentSeries === 'F1' ? 18000 : 6500) * tune.cost);
    const operations = Math.round((state.currentSeries === 'F1' ? 420000 : 95000) * tune.cost);
    const damage = Math.round(playerResults.reduce((sum,r)=>sum + Math.max(0,100-(r.condition||100))*2200 + Math.max(0,40-(r.tyre||40))*900,0) * tune.damage);
    const income = Math.round(baseParticipation + prize + sponsorBonus);
    const expenses = Math.round(salaryCost + staffCost + operations + damage);
    const net = income - expenses;
    return { track:(DATA.calendar2026[state.roundIndex]||{}).name || 'GP', income, expenses, net, baseParticipation, prize:Math.round(prize), sponsorBonus:Math.round(sponsorBonus), salaryCost:Math.round(salaryCost), staffCost:Math.round(staffCost), operations:Math.round(operations), damage:Math.round(damage), teamPoints, bestPos:bestPlayer?.pos||null, team:team.id };
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
    const total = DATA.calendar2026.length;
    const done = Math.min(state.completedRaces||0, total);
    const left = Math.max(0, total-done);
    return `${done}/${total} corridas concluídas • ${left ? left + ' eventos restantes' : 'temporada concluída'}`;
  }

  function agendaItems(){
    const idx = Math.min(state.completedRaces||0, DATA.calendar2026.length);
    const items = [];
    const next = DATA.calendar2026[idx];
    if(next) items.push({ type:'race', index:idx, race:next, title:next.name, label:`Próximo GP: ${next.name}`, detail:`${next.country ? 'Bandeira ' + next.country + ' • ' : ''}${next.weather || 'clima variável'} • ${next.laps || 22} voltas`, action:'goQualifying' });
    if((state.completedRaces||0) >= 3) items.push({ type:'board', index:idx, title:'Reunião da diretoria', label:'Avaliação de metas e reputação', detail:contractStatusText(), action:'inbox' });
    const offers = generateCareerOffers();
    if(offers.length) items.push({ type:'offer', index:idx, title:'Janela de contratos', label:`${offers.length} proposta(s) monitoradas`, detail:'Equipe interessadas acompanham sua reputação.', action:'offers' });
    if(idx >= DATA.calendar2026.length) items.push({ type:'season_end', index:idx, title:'Fim de temporada', label:'Revisão anual disponível', detail:'Feche o ano para receber bônus, convites finais e iniciar a próxima temporada.', action:'endSeason' });
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
    if((state.completedRaces||0) < DATA.calendar2026.length) return alert('A temporada ainda não terminou. Complete o calendário antes da revisão anual.');
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
    state.roundIndex = state.currentSeries === 'F2' ? 5 : 0;
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
    const currentRace = DATA.calendar2026[state.roundIndex] || DATA.calendar2026[0] || {};
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
    if((state.completedRaces||0) >= DATA.calendar2026.length){
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
    addInboxMessage('technical','Engenharia de Corrida',`Treino livre concluído — ${DATA.calendar2026[state.roundIndex]?.name || 'GP'}`,`Confiança no setup: ${state.weekend.setupConfidence}%. Leitura dos pneus: ${state.weekend.tyreKnowledge}%. Recomendação: ${focusLabel(state.weekend.qualyFocus)}.`,{});
    saveState();
    renderQualifying(false);
  }

  function renderWeekendPanel(){
    const el = document.getElementById('weekendPanel');
    if(!el) return;
    const currentRace = DATA.calendar2026[state.roundIndex] || DATA.calendar2026[0] || {};
    const w = state.weekend || { practiceDone:false, setupConfidence:50, tyreKnowledge:50, qualyFocus:'balanced', engineerNote:'Aguardando treino livre.' };
    const track = currentTrackProfile();
    el.innerHTML = `<h3>Fim de semana</h3>
      <p><b>${currentRace.name || 'Grande Prêmio'}</b> • ${currentRace.weather || 'dry'} • ${currentRace.laps || 22} voltas • perfil ${track.label}</p>
      <div class="weekend-metrics">
        <span>Confiança setup <b>${w.setupConfidence || 50}%</b></span>
        <span>Leitura pneus <b>${w.tyreKnowledge || 50}%</b></span>
        <span>Foco Q <b>${focusLabel(w.qualyFocus)}</b></span>
      </div>
      <p class="engineer-note">${w.engineerNote || 'Aguardando treino livre.'}</p>
      <button class="primary" data-action="simulatePractice">SIMULAR TREINO LIVRE</button>
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
    const currentRace = DATA.calendar2026[state.roundIndex] || DATA.calendar2026[0];
    const title = document.getElementById('qualifyingHeaderTitle');
    if(title) title.textContent = `CLASSIFICAÇÃO — ${currentRace.name.toUpperCase()}`;
    $('#qualifyingTable').innerHTML = list.map((r,i)=>{
      const d = driverByShort(r.driver) || {short:r.driver,name:r.driver,portrait:''};
      const team = teamById(r.team);
      return `<div class="row rich-row ${isPlayerDriver(r.driver)?'highlight':''}"><span class="pos-cell">${i+1}</span><span class="driver-cell">${driverAvatarChip(d)}<span class="driver-text"><b>${d.short}</b><small>${d.name}</small></span></span><span class="team-cell">${teamLogoHTML(team)}<span>${team ? team.name : r.teamName}</span></span><span class="time-cell">${r.time}</span></div>`;
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
    const r = DATA.calendar2026[state.roundIndex] || DATA.calendar2026[0] || {};
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
    state.lastQualifying = generateGridPreview();
    addInboxMessage('sporting','Engenharia de Corrida','Classificação concluída',`Grid definido para ${DATA.calendar2026[state.roundIndex]?.name || 'o próximo GP'}. Revise estratégia e toque em INICIAR CORRIDA.`,{});
    saveState();
    renderQualifying();
  }
  function isPlayerDriver(short){ return driversForTeam(state.currentTeam).some(d=>d.short===short); }
  function cameraLabel(mode){ return mode === 'follow' ? 'foco no carro' : mode === 'overhead' ? 'visão aérea' : 'transmissão'; }


  function aiStrategyFor(d,t,currentRace,gridPos){
    const risk = (d.aggression||60) + (t.reputation||60)/4 - gridPos;
    if(risk > 88) return { plan:'aggressive', startCompound:'soft', stopBias:'early' };
    if((d.consistency||60) > 78 || (t.car?.tyreWear||65) > 78) return { plan:'conservative', startCompound:'medium', stopBias:'late' };
    return { plan:'balanced', startCompound:gridPos<6?'soft':'medium', stopBias:'balanced' };
  }
  function setupRace(quick){
    const currentRace = DATA.calendar2026[state.roundIndex] || DATA.calendar2026[0];
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
      return { driver:d, team:t, pos:i+1, previousPos:i+1, lap:1, progress:i*-0.01, distance:0, tyre:100, fuel:100, condition:100, pits:0, pace:'normal', compound, plannedPitLap:recommendedPitLap(currentRace.laps||22,strat), baseSpeed:baseRaceSpeed(d,car,isPlayer)*compoundPaceMultiplier(compound)*(isPlayer && state.weekend?.qualyFocus==='racePace' ? 1.006 : 1), car, setupFx, color:t.color, secondary:t.secondary, finished:false, totalTime:0, incident:false, sector:1, gap:0, lastLap:1, lastAction:'' };
    });
    race = { quick, entries, laps:currentRace.laps || 22, speed:1, playerPace:driversForTeam(state.currentTeam).map(()=> 'normal'), started:Date.now(), weather:currentRace.weather || 'dry', tick:0, trackInfo:currentRace, safetyCar:0, cameraMode:'tv', raceLog:['Largada autorizada — mantenha pneus e estratégia sob controle.'] };  
    updateRaceHud();
  }
  function estimateCar(t){ return rivalCarForTeam(t); }
  function baseRaceSpeed(d,car,isPlayer=false){ const score = racePerformanceScore(d,car,isPlayer); return 0.021 + score / 4700; }
  function requestPit(idx){ const ds = driversForTeam(state.currentTeam); const target = ds[idx]; if(!target || !race) return; const e = race.entries.find(x=>x.driver.short===target.short); if(e && !e.pitCooldown){ const carPit = e.car?.pitStop || state.car.pitStop || 55; const mech = (state.staff?.mechanics || 1) + (state.staff?.pitCrew || 1)*0.85; const pitLoss = Math.max(0.022, 0.074 - carPit/2300 - mech/950); e.tyre = 100; e.compound = e.pits === 0 ? (e.compound==='soft'?'medium':'hard') : 'hard'; e.baseSpeed = baseRaceSpeed(e.driver,e.car,isPlayerDriver(e.driver.short))*compoundPaceMultiplier(e.compound); e.condition = Math.min(100,e.condition+8+mech*.6); e.pits++; e.progress -= pitLoss; e.pitCooldown = 7; e.lastAction = `PIT -${Math.round(pitLoss*1000)/10}s`; updateRaceHud(); } }

  function startRaceRenderer(){
    if(!race) setupRace(true);
    const stamp=document.getElementById('raceBuildStamp'); if(stamp) stamp.textContent=(DATA.build&&DATA.build.label)||'';
    if(typeof THREE === 'undefined'){
      const wrap = document.getElementById('raceCanvasWrap');
      if(wrap) wrap.innerHTML = '<div class="glass-panel race-fallback"><h2>Motor 3D indisponível</h2><p>Não foi possível carregar Three.js. Verifique conexão/CDN ou publique no GitHub/Vercel. Você ainda pode finalizar a corrida pela barra inferior.</p></div><canvas id="raceCanvas"></canvas>';
      updateRaceHud();
      return;
    }
    if(renderer3d) renderer3d.dispose();
    renderer3d = new TrackRenderer3D($('#raceCanvas'), race);
    renderer3d.animate();
  }

  class TrackRenderer3D{
    constructor(canvas,race){
      this.canvas=canvas; this.race=race; this.scene=new THREE.Scene(); this.scene.background=new THREE.Color(0x06101b);
      this.camera=new THREE.PerspectiveCamera(55, canvas.clientWidth/canvas.clientHeight, .1, 1000); this.camera.position.set(0,32,32); this.camera.lookAt(0,0,0);
      this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false}); this.renderer.setSize(canvas.clientWidth,canvas.clientHeight,false); this.renderer.setPixelRatio(Math.min(1.6,window.devicePixelRatio||1));
      this.clock=new THREE.Clock(); this.cars=[]; this.trackPoints=this.createTrackPoints(); this.addLights(); this.addTrack(); this.addEnvironment(); this.addCars(); window.addEventListener('resize',()=>this.resize());
    }
    createTrackPoints(){
      const info = this.race.trackInfo || DATA.calendar2026[state.roundIndex] || {};
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
      const width=4.85, edgeWidth=.18;
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
      g.scale.set(.78,.78,.78); return g;
    }
    placeCar(car,e,offset){ const prog=(e.progress%1+1)%1; const exact=prog*this.trackPoints.length; const i=Math.floor(exact)%this.trackPoints.length; const j=(i+1)%this.trackPoints.length; const p=this.trackPoints[i].clone().lerp(this.trackPoints[j],exact-i); const n=this.trackPoints[j]; car.position.copy(p); car.position.y=.25+(offset%2)*.04; car.rotation.y=Math.atan2(n.x-p.x,n.z-p.z); }
    animate(){ if(!this.renderer) return; requestAnimationFrame(()=>this.animate()); const dt=Math.min(.033,this.clock.getDelta()); updateRaceSimulation(dt); this.race.entries.forEach((e,i)=>this.placeCar(this.cars[i],e,i)); this.updateCameraMode(); this.renderer.render(this.scene,this.camera); }
    updateCameraMode(){ const mode=this.race.cameraMode||'tv'; if(mode==='overhead'){ this.camera.position.lerp(new THREE.Vector3(0,42,1),.035); this.camera.lookAt(0,0,0); return; } const targetEntry = this.race.entries.find(e=>isPlayerDriver(e.driver.short)) || this.race.entries[0]; const idx=this.race.entries.indexOf(targetEntry); const car=this.cars[Math.max(0,idx)]; if(!car) return; const pos=car.position.clone(); if(mode==='follow'){ this.camera.position.lerp(new THREE.Vector3(pos.x-6,8,pos.z+9),.055); this.camera.lookAt(pos.x,0,pos.z); } else { this.camera.position.lerp(new THREE.Vector3(pos.x+12,18,pos.z+15),.025); this.camera.lookAt(pos.x,0,pos.z); } }
    resize(){ if(!this.renderer) return; const w=this.canvas.clientWidth,h=this.canvas.clientHeight; this.camera.aspect=w/h; this.camera.updateProjectionMatrix(); this.renderer.setSize(w,h,false); }
    dispose(){ if(this.renderer){ this.renderer.dispose(); this.renderer=null; } }
  }


  function autoPitEntry(e){
    const carPit = e.car?.pitStop || 60;
    const pitLoss = Math.max(0.028, 0.078 - carPit/2400);
    e.tyre = 100;
    e.compound = e.pits === 0 ? (e.compound === 'soft' ? 'medium' : 'hard') : 'hard';
    e.baseSpeed = baseRaceSpeed(e.driver,e.car,isPlayerDriver(e.driver.short))*compoundPaceMultiplier(e.compound);
    e.condition = Math.min(100,e.condition+5);
    e.progress -= pitLoss;
    e.pits++;
    e.pitCooldown = 8;
    e.lastAction = `PIT AUTO -${Math.round(pitLoss*1000)/10}s`;
  }
  function updateRaceSimulation(dt){
    if(!race) return;
    race.tick += dt*race.speed;
    const track = currentTrackProfile();
    const previousOrder = new Map(race.entries.map(e => [e.driver.short, e.pos]));
    race.entries.forEach((e, idx)=>{
      const isPlayer = isPlayerDriver(e.driver.short);
      if(isPlayer){ const ds=driversForTeam(state.currentTeam); const pidx=ds.findIndex(d=>d.short===e.driver.short); e.pace = race.playerPace[pidx] || 'normal'; }
      const car = e.car || estimateCar(e.team);
      const setupFx = e.setupFx || { tyreCare:0, reliability:0 };
      const strategist = isPlayer ? (state.staff?.strategists||1) : 1;
      const mechanic = isPlayer ? (state.staff?.mechanics||1) : 1;
      const grip = race.weather === 'variable' ? 0.965 : 1;
      const paceMul = (race.safetyCar>0 ? 0.70 : 1) * (e.pace==='attack'?1.122:e.pace==='save'?0.928:1) * grip;
      const tyreBase = Math.max(.050, .133 - ((car.tyreWear||55)-50)/1500 - setupFx.tyreCare - strategist/1200) * compoundWearMultiplier(e.compound);
      const fuelBase = Math.max(.048, .108 - ((car.fuel||55)-50)/2200);
      const reliability = Math.max(35, (car.reliability||55) + mechanic*1.8 + (setupFx.reliability||0)*100);
      const tyreMul = 0.765 + e.tyre/100*0.285;
      const condMul = 0.790 + e.condition/100*0.225;
      const driverConsistency = ((e.driver.consistency||70)-60)/820;
      const inTraffic = idx>0 && Math.abs((race.entries[idx-1].distance||0)-(e.distance||0)) < .035;
      const closeBehind = idx<race.entries.length-1 && Math.abs((e.distance||0)-(race.entries[idx+1].distance||0)) < .032;
      const slipstream = inTraffic && e.sector !== 2 ? 1.006 : 1;
      const dirtyAir = inTraffic && e.sector === 2 ? .996 : 1;
      const pressure = closeBehind ? .998 : 1;
      const randomRaceNoise = 1 + Math.sin((race.tick+e.pos)*0.7)*0.002 + driverConsistency;
      e.progress += e.baseSpeed * paceMul * tyreMul * condMul * randomRaceNoise * slipstream * dirtyAir * pressure * dt * race.speed;
      e.distance = e.progress;
      e.tyre = Math.max(0,e.tyre - dt*race.speed*tyreBase*(e.pace==='attack'?1.48:e.pace==='save'?.72:1)*(inTraffic?1.035:1));
      e.fuel = Math.max(0,e.fuel - dt*race.speed*fuelBase*(e.pace==='attack'?1.30:e.pace==='save'?.75:1));
      const conditionLoss = Math.max(.003, (104-reliability)/3300) * (e.pace==='attack'?1.35:1) * (track.rain>1.05?1.13:1);
      e.condition = Math.max(0,e.condition - dt*race.speed*conditionLoss);
      const errorChance = dt*race.speed*Math.max(0, (82-reliability))/28000 * (e.pace==='attack'?1.72:1) * (100-(e.driver.consistency||70))/45;
      if(!e.incident && Math.random() < errorChance){
        e.progress -= 0.018 + Math.random()*0.030;
        e.condition = Math.max(12,e.condition - (8+Math.random()*14));
        e.incident=true; e.lastAction='ERRO';
        race.raceLog.unshift(`${e.driver.short} escapou e perdeu tempo`);
      }
      if(e.pitCooldown) e.pitCooldown = Math.max(0, e.pitCooldown - dt*race.speed);
      e.lastLap = e.lap;
      e.lap = Math.min(race.laps, Math.floor(e.progress)+1);
      if(e.lap > e.lastLap && isPlayer) race.raceLog.unshift(`${e.driver.short} abriu a volta ${e.lap} com ${Math.round(e.tyre)}% de pneu`);
      e.sector = Math.min(3, Math.max(1, Math.floor(((e.progress%1)+1)%1*3)+1));
      if(!isPlayer && !e.pitCooldown && e.pits < 2 && (e.tyre < 25 || (e.lap >= e.plannedPitLap && e.tyre < 56))){ autoPitEntry(e); race.raceLog.unshift(`${e.driver.short} parou nos boxes`); }
      e.totalTime += dt*race.speed*(1 + (100-e.tyre)/620 + (100-e.condition)/900);
    });
    if(race.safetyCar>0) race.safetyCar = Math.max(0, race.safetyCar - dt*race.speed);
    else if(race.tick > 12 && Math.random() < dt*race.speed/27000){ race.safetyCar = 18 + Math.random()*14; race.raceLog.unshift('Safety car virtual por detritos na pista'); }
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
    if($('#weatherLabel')) $('#weatherLabel').textContent = race.safetyCar>0 ? `🟨 VSC ${Math.ceil(race.safetyCar)}s` : (race.weather === 'variable' ? '☁ Variável' : '☀ Seco');
    if($('#raceBuildStamp')) $('#raceBuildStamp').textContent = (DATA.build&&DATA.build.label)||'';
    if($('#speedLabel')) $('#speedLabel').textContent = race.speed;
    const statusPanel = $('#raceStatusPanel');
    if(statusPanel){
      const playerBest = race.entries.filter(e=>isPlayerDriver(e.driver.short)).sort((a,b)=>a.pos-b.pos)[0];
      statusPanel.innerHTML = `<div><b>${race.safetyCar>0?'SAFETY CAR VIRTUAL':'RITMO DE CORRIDA'}</b><span>${race.trackInfo?.name||'GP'} • Câmera ${cameraLabel(race.cameraMode)}</span></div><div><b>${playerBest ? 'P'+playerBest.pos+' '+playerBest.driver.short : 'Equipe'}</b><span>${playerBest ? compoundLabel(playerBest.compound)+' '+Math.round(playerBest.tyre)+'%' : 'Sem piloto'}</span></div><div class="race-log-mini">${(race.raceLog||[]).slice(0,3).map(x=>`<small>${x}</small>`).join('')}</div>`;
    }
    $('#raceLeaderboard').innerHTML = race.entries.slice(0,22).map((e,i)=>{
      const delta = (e.previousPos||e.pos)-e.pos;
      const deltaText = delta>0 ? `▲${delta}` : delta<0 ? `▼${Math.abs(delta)}` : '•';
      return `<div class="race-row ${isPlayerDriver(e.driver.short)?'highlight':''}"><span class="race-pos">${i+1}<small>${deltaText}</small></span>${driverAvatarHTML(e.driver)}${teamLogoHTML(e.team,'team-logo-mini')}<span class="race-name"><b>${e.driver.short}</b><small>${e.team.name}</small></span><span class="race-tyre">${compoundLabel(e.compound).slice(0,1)} ${Math.round(e.tyre)}%</span><span class="race-pits">${e.pits}P • S${e.sector} • ${i===0?'LÍDER':'+'+e.gap.toFixed(1)}</span></div>`;
    }).join('');
    hydrateAssets($('#raceLeaderboard'));
    const pDrivers = driversForTeam(state.currentTeam); [0,1].forEach(i=>{ const d=pDrivers[i]; if(!d) return; const e=race.entries.find(x=>x.driver.short===d.short); const card=document.getElementById(`controlCard${i+1}`), name=document.getElementById(`controlDriver${i+1}`), cond=document.getElementById(`cond${i+1}`); if(e){ if(name) name.innerHTML = `<span class="control-head">${driverAvatarChip(d,'driver-avatar-inline small')}${teamLogoHTML(teamById(driverCurrentTeamId(d.short)||d.team),'team-logo-inline small')}<span><b>${e.pos}º | ${d.short}</b><small>${teamById(driverCurrentTeamId(d.short)||d.team).name}</small></span></span>`; if(cond) cond.style.width = `${Math.round(e.condition)}%`; if(card){ card.querySelectorAll('[data-pace]').forEach(btn=>btn.classList.toggle('active', btn.dataset.pace === (race.playerPace[i]||'normal'))); const status=card.querySelector('.pilot-status') || document.createElement('div'); status.className='pilot-status'; status.textContent = `Modo: ${(race.playerPace[i]||'normal').toUpperCase()} • ${compoundLabel(e.compound)} ${Math.round(e.tyre)}% • Gap ${e.gap.toFixed(1)}s • Cond ${Math.round(e.condition)}% • S${e.sector} • Pit V${e.plannedPitLap}`; if(!status.parentElement) card.appendChild(status); hydrateAssets(card); } } });
  }
  function finishRace(){
    if(!race) return;
    race.entries.sort((a,b)=>b.distance-a.distance);
    state.lastRace = race.entries.map((e,i)=>({pos:i+1, driver:e.driver.short, team:e.team.id, teamName:e.team.name, points:DATA.points[i]||0, pits:e.pits, tyre:Math.round(e.tyre), condition:Math.round(e.condition), lastAction:e.lastAction||'' }));
    ensureStandings();
    const st = currentStandings();
    state.lastRace.forEach((r,i)=>{ if(st[r.driver]){ st[r.driver].team = driverCurrentTeamId(r.driver)||r.team; st[r.driver].points += r.points; if(i===0) st[r.driver].wins++; if(i<3) st[r.driver].podiums++; st[r.driver].best = st[r.driver].best ? Math.min(st[r.driver].best,r.pos) : r.pos; } });
    state.completedRaces++;
    evolveRivalsAfterRace();
    state.roundIndex = Math.min(DATA.calendar2026.length-1,state.roundIndex+1);
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
      if(state.completedRaces >= DATA.calendar2026.length) addInboxMessage('season','Diretoria','Temporada concluída','A temporada chegou ao fim. Abra a agenda para fazer a revisão anual, receber bônus e iniciar o próximo ano.',{});
    }
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
      summary.innerHTML = report ? `<article class="glass-panel race-summary-card"><h3>Relatório do Fim de Semana</h3><div class="summary-grid"><span>Receita <b>${money(report.income)}</b></span><span>Custos <b>${money(report.expenses)}</b></span><span>Saldo <b>${money(report.net)}</b></span><span>Reputação <b>${report.reputationDelta >= 0 ? '+' : ''}${report.reputationDelta}</b></span></div><p>Premiação: ${money(report.prize)} • Patrocinador: ${money(report.sponsorBonus)} • Salários: ${money(report.salaryCost)} • Operação/danos: ${money(report.operations + report.damage)}</p><button class="primary" data-action="nextRaceFromResults">${(state.completedRaces||0) >= DATA.calendar2026.length ? 'IR PARA REVISÃO DA TEMPORADA' : 'AVANÇAR PARA O PRÓXIMO GP'}</button><button class="secondary" data-action="returnLobbyAfterRace">VOLTAR AO LOBBY</button></article>` : '';
    }
    hydrateAssets(document.getElementById('screen-results'));
  }

  function renderAssetChecklist(){
    const items = [
      ...Object.entries(DATA.assetPaths).map(([k,v])=>({key:k, path:v})),
      ...DATA.avatars.slice(0,3).map((v,i)=>({key:`avatar_${i+1}`, path:v})),
      ...DATA.f1Teams2026.slice(0,3).map(t=>({key:`logo_${t.id}`, path:t.logo}))
    ];
    $('#assetChecklist').innerHTML = items.map(x=>`<div class="asset-item"><span>${x.key}</span><code>${assetCandidates(x.path).join(' | ')}</code></div>`).join('');
  }

  init();
})();
