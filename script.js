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
  function teamById(id){ return DATA.f1Teams2026.concat(DATA.f2Teams).find(t => t.id === id); }
  function allDrivers(){ return DATA.f1Drivers2026.concat(DATA.f2Drivers); }
  function allDriversForSeries(series){ return series === 'F1' ? DATA.f1Drivers2026 : DATA.f2Drivers; }
  function defaultRosters(){ const r={}; allDrivers().forEach(d=>{ r[d.team]=r[d.team]||[]; if(!r[d.team].includes(d.short)) r[d.team].push(d.short); }); return r; }
  function ensureRosters(){ state.rosters = state.rosters || defaultRosters(); return state.rosters; }
  function driverCurrentTeamId(short){ const rosters = ensureRosters(); for(const [team,list] of Object.entries(rosters)){ if((list||[]).includes(short)) return team; } const d=allDrivers().find(x=>x.short===short); return d ? d.team : null; }
  function driversForTeam(id){ const rosters = ensureRosters(); const list = rosters[id]; if(Array.isArray(list)) return list.map(s=>allDrivers().find(d=>d.short===s)).filter(Boolean).map(d=>({...d,currentTeam:id})); return allDrivers().filter(d=>d.team===id).map(d=>({...d,currentTeam:id})); }
  function rnd(min,max){ return min + Math.random()*(max-min); }
  function cleanAssetPath(p){ return String(p||'').replace(/^\.?\//,'').replace(/^assets\//,''); }
  function assetCandidates(p){ const rel = cleanAssetPath(p); return ASSET_ROOTS.map(root => root + rel); }
  function asset(p){ return assetCandidates(p)[0]; }
  function initials(text){ return String(text||'').split(/\s+/).filter(Boolean).slice(0,2).map(s=>s[0]).join('').toUpperCase() || 'VG'; }
  function flagPath(code){ return `flags/all/${String(code||'').toLowerCase()}.png`; }
  function colorHex(num){ return `#${(Number(num)||0x333333).toString(16).padStart(6,'0')}`; }
  function colorRgbString(num){ const c = Number(num)||0x333333; return `${(c>>16)&255}, ${(c>>8)&255}, ${c&255}`; }

  function driverByShort(short){ return allDrivers().find(d => d.short === short) || null; }
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
      staff:{ designers:1, mechanics:1, strategists:1, raceEngineers:1, scouts:1, pitCrew:1 },
      facilities:{ hq:1, simulator:1, factory:1, scouting:0 },
      rosters: defaultRosters(),
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
    state.staff = {...{ designers:1, mechanics:1, strategists:1, raceEngineers:1, scouts:1, pitCrew:1 }, ...(state.staff||{})};
    ensureRosters();
    state.car = state.car || { aero:50, engine:50, chassis:50, reliability:55, tyreWear:55, pitStop:55, fuel:55 };
    ensureStandings();
    state.unreadMessages = Number(state.unreadMessages || state.inbox.filter(m => !m.read).length || 0);
    state.seasonYear = state.seasonYear || 2026;
    state.seasonNumber = state.seasonNumber || 1;
    state.seasonStats = state.seasonStats || { races:0, bestFinish:null, podiums:0, wins:0, objectiveProgress:0 };
    if(state.profile && state.currentTeam && !state.inbox.length){
      seedCareerInbox();
      saveState();
    }
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
    const label = b.label || 'Build v0.9.20 • 09/05/2026 • 11:08 BRT';
    const home = document.getElementById('homeBuildPill');
    const global = document.getElementById('globalBuildStamp');
    if(home) home.textContent = label;
    if(global) global.textContent = label;
    document.title = `F1 Manager Career 2026 — ${label}`;
  }

  function init(){
    updateBuildBadges();
    ensureCareerSystems();
    ensureCareerSystems();
    screenBackgrounds();
    bindGlobalActions();
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
      if(tab){ $$('.side-nav button').forEach(b=>b.classList.remove('active')); tab.classList.add('active'); renderTab(tab.dataset.tab); }
      const mode = ev.target.closest('[data-mode]');
      if(mode){ selectedMode = mode.dataset.mode; $$('.mode-card').forEach(b=>b.classList.remove('selected')); mode.classList.add('selected'); syncSeriesWithMode(); renderTeamSelect(); }
      const comp = ev.target.closest('[data-compound]');
      if(comp){ selectedCompound = comp.dataset.compound; $$('.strategy-pills button').forEach(b=>b.classList.remove('selected')); comp.classList.add('selected'); }
      const seriesChoice = ev.target.closest('[data-series]');
      if(seriesChoice){ selectedSeries = seriesChoice.dataset.series; selectedTeam = firstTeamForSeries(selectedSeries).id; renderTeamSelect(); return; }
      const teamChoice = ev.target.closest('[data-team]');
      if(teamChoice){ selectedTeam = teamChoice.dataset.team; renderTeamSelect(); }
    });
  }

  function handleAction(action, el){
    const actions = {
      continueCareer(){ if(state.profile) showScreen('lobby'); else showScreen('career-create'); },
      createProfile(){ createProfile(); },
      startCareer(){ startCareer(); },
      goQualifying(){ showScreen('qualifying'); },
      startQualifying(){ simulateQualifying(); },
      startRaceDirect(){ const sel=document.getElementById('quickRaceSelect'); if(sel) state.roundIndex=Number(sel.value)||0; setupRace(true); showScreen('race'); },
      startRace(){ setupRace(false); showScreen('race'); },
      setPace(){ if(race){ race.playerPace[Number(el.dataset.driver)] = el.dataset.pace; updateRaceHud(); } },
      pitDriver(){ if(race) requestPit(Number(el.dataset.driver)); },
      toggleRaceSpeed(){ if(race){ race.speed = race.speed === 1 ? 4 : race.speed === 4 ? 12 : race.speed === 12 ? 24 : 1; $('#speedLabel').textContent = race.speed; } },
      finishRaceNow(){ if(race) finishRace(); },
      returnLobbyAfterRace(){ showScreen('lobby'); },
      upgradePart(){ upgradePart(el.dataset.part); },
      signSponsor(){ signSponsor(el.dataset.sponsor); },
      hireStaff(){ hireStaff(el.dataset.role); },
      applySetup(){ applySetupPreset(el.dataset.setup); },
      acceptOffer(){ acceptCareerOffer(el.dataset.team); },
      markMailRead(){ markMailRead(el.dataset.mail); },
      signDriver(){ signDriver(el.dataset.driver); },
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
    state.money = state.mode==='sandbox' ? t.budget*2 : t.budget;
    state.reputation = state.mode==='sandbox' ? Math.max(t.reputation, 70) : t.reputation;
    state.car = {...t.car, fuel:55};
    state.roundIndex = series === 'F2' ? 5 : 0;
    state.completedRaces = 0;
    state.lastQualifying = [];
    state.lastRace = [];
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
      content.innerHTML = `<div class="cards-grid">
        <article class="dash-card glass-panel bg" data-asset-bg="${bg}"><div class="dash-overlay"></div><div class="dash-card-top">${teamVisual(team,true)}</div><h3>${team.name}</h3><p>${team.objective || 'Construir reputação e alcançar a Fórmula 1.'}</p><p>Próxima: ${currentRace.name}</p><p>${nextAgenda ? nextAgenda.label : 'Temporada concluída: faça a revisão anual.'}</p></article>
        <article class="dash-card glass-panel"><h3>Agenda Executiva</h3><p><b>${state.seasonYear || 2026}</b> • Temporada ${state.seasonNumber || 1}</p><p>${seasonProgressText()}</p><button class="secondary" data-tab="calendar">VER AGENDA</button></article>
        <article class="dash-card glass-panel"><h3>Caixa de E-mails</h3><p>${unread ? `<b>${unread} mensagem(ns) nova(s)</b>` : 'Nenhuma mensagem não lida.'}</p><p>Convites, relatórios da diretoria e atualizações de agenda aparecem aqui.</p><button class="secondary" data-tab="inbox">ABRIR E-MAILS</button></article>
        <article class="dash-card glass-panel"><h3>Metas da Diretoria</h3><p>${team.objective || 'Pontuar e evoluir a equipe.'}</p><div class="progress"><i style="width:${Math.min(100,state.reputation)}%"></i></div><p>Reputação ${Math.round(state.reputation)}/100</p></article>
        <article class="dash-card glass-panel wide sponsor-card"><h3>Patrocinadores</h3><p>${state.sponsor ? 'Contrato ativo: ' + state.sponsor.name : 'Escolha um patrocinador principal. Metas geram bônus por corrida.'}</p>${sponsorButtons()}</article>
        <article class="dash-card glass-panel career-card"><h3>Carreira do Gestor</h3><p><b>${state.currentSeries === 'F2' ? 'Você começou na F2.' : 'Você está na Fórmula 1.'}</b> Cumpra metas, evolua pilotos e mantenha as finanças saudáveis para avançar.</p><p>Contrato: ${state.contract ? money(state.contract.salary) + ' / temporada' : 'em avaliação'} • ${contractStatusText()}</p><button class="secondary" data-tab="offers">VER PROPOSTAS</button></article>
      </div>`;
    }
    if(tab === 'drivers'){
      content.innerHTML = `<div class="cards-grid">${drivers.map(d=>driverCard(d)).join('')}<article class="dash-card glass-panel"><h3>Mercado de Pilotos</h3><p>Agora cada piloto tem overall, potencial, salário e valor estimado. Contratações afetam grid, classificação e corrida.</p><button class="secondary" data-tab="driver-market">ABRIR MERCADO</button></article></div>`;
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

    if(tab === 'inbox'){
      ensureCareerSystems();
      const messages = state.inbox || [];
      content.innerHTML = `<div class="cards-grid inbox-grid">
        <article class="dash-card glass-panel wide"><h3>Central de E-mails</h3><p>Mensagens da diretoria, convites de equipes, imprensa e calendário da temporada.</p><p>${state.unreadMessages || 0} mensagem(ns) não lida(s).</p></article>
        ${messages.length ? messages.map(mailCard).join('') : '<article class="dash-card glass-panel"><h3>Caixa vazia</h3><p>Avance na temporada para receber relatórios e convites.</p></article>'}
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


  function driverValue(d){
    const ov = Number(d.overall||70), pot = Number(d.potential||70), age = Number(d.age||22);
    const isF1 = DATA.f1Drivers2026.some(x=>x.short===d.short);
    const seriesMul = isF1 ? 4200 : 460;
    const ageFactor = age <= 22 ? 1.18 : age >= 35 ? .82 : 1;
    const scoutDiscount = Math.max(.82, 1 - ((state.staff?.scouts||1)-1)*.025);
    return Math.round(((ov*ov*seriesMul) + (pot*seriesMul*42)) * ageFactor * scoutDiscount);
  }
  function driverSalary(d){ return Math.round(driverValue(d) * 0.035); }
  function driverOverallText(d){ return `OVR ${d.overall||70} • POT ${d.potential||70} • ${money(driverValue(d))}`; }
  function driverMarketCards(){
    const current = new Set(driversForTeam(state.currentTeam).map(d=>d.short));
    return allDriversForSeries(state.currentSeries).filter(d=>!current.has(d.short)).sort((a,b)=>driverValue(b)-driverValue(a)).map(d=>{
      const teamId = driverCurrentTeamId(d.short) || d.team;
      const team = teamById(teamId) || teamById(d.team);
      const cost = driverValue(d);
      const affordable = (state.money||0) >= cost;
      return `<article class="dash-card glass-panel market-driver-card ${affordable?'':'locked'}"><div class="driver-head"><div class="portrait-wrap">${d.portrait?`<img class="driver-portrait" data-asset-src="${d.portrait}" alt="${d.name}" />`:''}<span class="fallback-badge driver-fallback" style="display:${d.portrait?'none':'flex'}">${initials(d.name)}</span></div><div class="driver-meta"><h3>${d.short}</h3><p>${d.name}</p><div class="meta-line"><span class="team-chip">${teamLogoHTML(team)} ${team?team.name:''}</span><span class="flag-chip"><img data-asset-src="${flagPath(d.flag)}" alt="${d.flag}" /><b>${d.flag}</b></span></div></div></div><p>${driverOverallText(d)}</p><div class="progress"><i style="width:${Math.min(100,d.overall||70)}%"></i></div><p>Vel ${d.speed} • Cons ${d.consistency} • Chuva ${d.rain} • Salário ${money(driverSalary(d))}</p><button class="${affordable?'primary':'secondary'}" data-action="signDriver" data-driver="${d.short}" ${affordable?'':'disabled'}>${affordable?'CONTRATAR':'ORÇAMENTO INSUFICIENTE'}</button></article>`;
    }).join('');
  }
  function signDriver(short){
    ensureRosters();
    const d = driverByShort(short); if(!d) return;
    const cost = driverValue(d); if((state.money||0) < cost) return alert('Orçamento insuficiente para contratar este piloto.');
    for(const team of Object.keys(state.rosters)){ state.rosters[team] = (state.rosters[team]||[]).filter(s=>s!==short); }
    const current = state.rosters[state.currentTeam] || driversForTeam(state.currentTeam).map(x=>x.short);
    const replaced = current.length >= 2 ? current.pop() : null;
    current.push(short); state.rosters[state.currentTeam] = current;
    if(replaced){ const oldTeam = d.team || state.currentTeam; state.rosters[oldTeam] = state.rosters[oldTeam] || []; if(!state.rosters[oldTeam].includes(replaced)) state.rosters[oldTeam].push(replaced); }
    state.money -= cost;
    addInboxMessage('market','Departamento Esportivo',`Contrato assinado: ${d.name}`,`${d.name} assinou com ${teamById(state.currentTeam).name} por ${money(cost)}. Overall ${d.overall}, potencial ${d.potential}.`,{driver:short});
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
    state.reputation = Math.min(99, Math.max(10, (state.reputation||0) + (score>=80?6:score>=60?3:-2)));
    refreshCareerOffers();
    notifyOffersIfUnlocked();
    addInboxMessage('season','Diretoria',`Revisão da temporada ${state.seasonYear}`,`Resultado da avaliação: ${score}/100. Bônus pago: ${money(bonus)}. ${score>=75?'A diretoria considera seu trabalho excelente e o mercado está atento.':score>=55?'A diretoria aprovou a continuidade, mas espera evolução.':'A diretoria está pressionando por resultados imediatos.'}`,{score, team:team?.id});
    state.seasonYear += 1;
    state.seasonNumber += 1;
    state.completedRaces = 0;
    state.roundIndex = state.currentSeries === 'F2' ? 5 : 0;
    state.lastQualifying = [];
    state.lastRace = [];
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
    return ({entry_f2:35, mid_f2:52, strong_f2:62, low_f1:72, mid:84, grand:94})[cls] || 70;
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
    state.money = Math.max(state.money || 0, Math.round((target.budget||4000000)*0.55));
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
  function upgradeCost(part){ return 250000 + Math.round((state.car[part]||50)*9000); }
  function staffHireCost(role){ return Math.round((300000 + (state.staff?.[role]||1)*240000) * (role==='scouts'?.85:role==='pitCrew'?1.05:1)); }
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
    return (driver*.54 + machine*.46 + staff) * setup.pace;
  }
  function generateGridPreview(){
    const track = currentTrackProfile();
    return generateRaceDrivers().map(d => {
      const t = teamById(d.team); const car = d.team === state.currentTeam ? state.car : (t.car || estimateCar(t));
      const isPlayer = d.team === state.currentTeam;
      const score = racePerformanceScore(d,car,isPlayer) + rnd(-4.2,4.2) + (isPlayer ? (state.staff?.designers||1)*0.25 : 0);
      const time = 88 - score/5.2 + rnd(0,.35);
      return {driver:d.short, team:d.team, teamName:t.name, score, time:time.toFixed(3), profile:track.label};
    }).sort((a,b)=>b.score-a.score);
  }
  function simulateQualifying(){
    state.lastQualifying = generateGridPreview(); saveState(); renderQualifying();
    setTimeout(()=>{ if(confirm('Classificação finalizada. Iniciar corrida?')){ setupRace(false); showScreen('race'); } }, 300);
  }
  function isPlayerDriver(short){ return driversForTeam(state.currentTeam).some(d=>d.short===short); }

  function setupRace(quick){
    const currentRace = DATA.calendar2026[state.roundIndex] || DATA.calendar2026[0];
    const grid = (state.lastQualifying && state.lastQualifying.length) ? state.lastQualifying : generateGridPreview();
    const allDrivers = generateRaceDrivers();
    const driverMap = new Map(allDrivers.map(d=>[d.short,d]));
    const entries = grid.slice(0,22).map((g,i)=> {
      const d = driverMap.get(g.driver) || allDrivers[i]; const t = teamById(d.team);
      const car = d.team === state.currentTeam ? state.car : (t.car || estimateCar(t));
      const isPlayer = d.team === state.currentTeam;
      const track = currentTrackProfile();
      const setupFx = isPlayer ? setupEffectFor(track,state.setup) : { tyreCare:0, reliability:0, label:'AI' };
      return { driver:d, team:t, pos:i+1, lap:1, progress:i*-0.01, distance:0, tyre:100, fuel:100, condition:100, pits:0, pace:'normal', baseSpeed:baseRaceSpeed(d,car,isPlayer), car, setupFx, color:t.color, secondary:t.secondary, finished:false, totalTime:0, incident:false };
    });
    race = { quick, entries, laps:currentRace.laps || 22, speed:1, playerPace:driversForTeam(state.currentTeam).map(()=> 'normal'), started:Date.now(), weather:currentRace.weather || 'dry', tick:0, trackInfo:currentRace }; 
    updateRaceHud();
  }
  function estimateCar(t){ const tier = t.tier==='top'?88:t.tier==='mid'?78:68; return { aero:tier, engine:tier, chassis:tier, reliability:tier, tyreWear:tier, pitStop:tier, fuel:tier }; }
  function baseRaceSpeed(d,car,isPlayer=false){ const score = racePerformanceScore(d,car,isPlayer); return 0.021 + score / 4700; }
  function requestPit(idx){ const ds = driversForTeam(state.currentTeam); const target = ds[idx]; if(!target || !race) return; const e = race.entries.find(x=>x.driver.short===target.short); if(e && !e.pitCooldown){ const carPit = e.car?.pitStop || state.car.pitStop || 55; const mech = (state.staff?.mechanics || 1) + (state.staff?.pitCrew || 1)*0.85; const pitLoss = Math.max(0.022, 0.074 - carPit/2300 - mech/950); e.tyre = 100; e.condition = Math.min(100,e.condition+8+mech*.6); e.pits++; e.progress -= pitLoss; e.pitCooldown = 7; e.lastAction = `PIT -${Math.round(pitLoss*1000)/10}s`; updateRaceHud(); } }

  function startRaceRenderer(){
    if(!race) setupRace(true);
    const stamp=document.getElementById('raceBuildStamp'); if(stamp) stamp.textContent=(DATA.build&&DATA.build.label)||'';
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
    animate(){ if(!this.renderer) return; requestAnimationFrame(()=>this.animate()); const dt=Math.min(.033,this.clock.getDelta()); updateRaceSimulation(dt); this.race.entries.forEach((e,i)=>this.placeCar(this.cars[i],e,i)); this.renderer.render(this.scene,this.camera); }
    resize(){ if(!this.renderer) return; const w=this.canvas.clientWidth,h=this.canvas.clientHeight; this.camera.aspect=w/h; this.camera.updateProjectionMatrix(); this.renderer.setSize(w,h,false); }
    dispose(){ if(this.renderer){ this.renderer.dispose(); this.renderer=null; } }
  }

  function updateRaceSimulation(dt){
    if(!race) return; race.tick += dt*race.speed;
    const track = currentTrackProfile();
    race.entries.forEach((e)=>{
      const isPlayer = isPlayerDriver(e.driver.short);
      if(isPlayer){ const ds=driversForTeam(state.currentTeam); const pidx=ds.findIndex(d=>d.short===e.driver.short); e.pace = race.playerPace[pidx] || 'normal'; }
      const paceMul = e.pace==='attack'?1.125:e.pace==='save'?0.925:1;
      const car = e.car || estimateCar(e.team);
      const setupFx = e.setupFx || { tyreCare:0, reliability:0 };
      const strategist = isPlayer ? (state.staff?.strategists||1) : 1;
      const mechanic = isPlayer ? (state.staff?.mechanics||1) : 1;
      const tyreBase = Math.max(.052, .135 - ((car.tyreWear||55)-50)/1500 - setupFx.tyreCare - strategist/1200);
      const fuelBase = Math.max(.052, .112 - ((car.fuel||55)-50)/2200);
      const reliability = Math.max(35, (car.reliability||55) + mechanic*1.8 + (setupFx.reliability||0)*100);
      const tyreMul = 0.78 + e.tyre/100*0.27;
      const condMul = 0.80 + e.condition/100*0.22;
      const driverConsistency = ((e.driver.consistency||70)-60)/750;
      const randomRaceNoise = 1 + Math.sin((race.tick+e.pos)*0.7)*0.002 + driverConsistency;
      e.progress += e.baseSpeed * paceMul * tyreMul * condMul * randomRaceNoise * dt * race.speed;
      e.distance = e.progress;
      e.tyre = Math.max(0,e.tyre - dt*race.speed*tyreBase*(e.pace==='attack'?1.48:e.pace==='save'?.72:1));
      e.fuel = Math.max(0,e.fuel - dt*race.speed*fuelBase*(e.pace==='attack'?1.30:e.pace==='save'?.75:1));
      const conditionLoss = Math.max(.003, (104-reliability)/3200) * (e.pace==='attack'?1.34:1) * (track.rain>1.05?1.12:1);
      e.condition = Math.max(0,e.condition - dt*race.speed*conditionLoss);
      const errorChance = dt*race.speed*Math.max(0, (82-reliability))/26000 * (e.pace==='attack'?1.65:1) * (100-(e.driver.consistency||70))/45;
      if(!e.incident && Math.random() < errorChance){ e.progress -= 0.018 + Math.random()*0.028; e.condition = Math.max(12,e.condition - (8+Math.random()*14)); e.incident=true; e.lastAction='ERRO'; }
      if(e.pitCooldown) e.pitCooldown = Math.max(0, e.pitCooldown - dt*race.speed);
      e.lap = Math.min(race.laps, Math.floor(e.progress)+1);
      e.totalTime += dt*race.speed*(1 + (100-e.tyre)/620 + (100-e.condition)/900);
    });
    race.entries.sort((a,b)=>b.distance-a.distance); race.entries.forEach((e,i)=>e.pos=i+1);
    updateRaceHud();
    if(race.entries.some(e=>e.progress>=race.laps)) finishRace();
  }
  function driverAvatarHTML(d){
    return `<span class="race-avatar">${d.portrait ? `<img data-asset-src="${d.portrait}" alt="${d.short}"/>` : ''}<b class="fallback-badge" style="display:${d.portrait ? 'none':'flex'}">${initials(d.short)}</b></span>`;
  }
  function updateRaceHud(){
    if(!race) return;
    $('#lapLabel').textContent = `VOLTA ${Math.max(...race.entries.map(e=>e.lap))}/${race.laps}`;
    if($('#raceTitle')) $('#raceTitle').textContent = race.trackInfo ? race.trackInfo.name : 'CORRIDA';
    if($('#weatherLabel')) $('#weatherLabel').textContent = race.weather === 'variable' ? '☁ Variável' : '☀ Seco';
    if($('#raceBuildStamp')) $('#raceBuildStamp').textContent = (DATA.build&&DATA.build.label)||'';
    if($('#speedLabel')) $('#speedLabel').textContent = race.speed;
    $('#raceLeaderboard').innerHTML = race.entries.slice(0,22).map((e,i)=>`<div class="race-row ${isPlayerDriver(e.driver.short)?'highlight':''}"><span class="race-pos">${i+1}</span>${driverAvatarHTML(e.driver)}${teamLogoHTML(e.team,'team-logo-mini')}<span class="race-name"><b>${e.driver.short}</b><small>${e.team.name}</small></span><span class="race-tyre">${Math.round(e.tyre)}%</span><span class="race-pits">${e.pits}P</span></div>`).join('');
    hydrateAssets($('#raceLeaderboard'));
    const pDrivers = driversForTeam(state.currentTeam); [0,1].forEach(i=>{ const d=pDrivers[i]; if(!d) return; const e=race.entries.find(x=>x.driver.short===d.short); const card=document.getElementById(`controlCard${i+1}`), name=document.getElementById(`controlDriver${i+1}`), cond=document.getElementById(`cond${i+1}`); if(e){ if(name) name.innerHTML = `<span class="control-head">${driverAvatarChip(d,'driver-avatar-inline small')}${teamLogoHTML(teamById(driverCurrentTeamId(d.short)||d.team),'team-logo-inline small')}<span><b>${e.pos}º | ${d.short}</b><small>${teamById(driverCurrentTeamId(d.short)||d.team).name}</small></span></span>`; if(cond) cond.style.width = `${Math.round(e.condition)}%`; if(card){ card.querySelectorAll('[data-pace]').forEach(btn=>btn.classList.toggle('active', btn.dataset.pace === (race.playerPace[i]||'normal'))); const status=card.querySelector('.pilot-status') || document.createElement('div'); status.className='pilot-status'; status.textContent = `Modo: ${(race.playerPace[i]||'normal').toUpperCase()} • Pneu ${Math.round(e.tyre)}% • Cond ${Math.round(e.condition)}% • ${setupLabel(state.setup?.preset)}`; if(!status.parentElement) card.appendChild(status); hydrateAssets(card); } } });
  }
  function finishRace(){
    if(!race) return;
    race.entries.sort((a,b)=>b.distance-a.distance);
    state.lastRace = race.entries.map((e,i)=>({pos:i+1, driver:e.driver.short, team:e.team.id, teamName:e.team.name, points:DATA.points[i]||0, pits:e.pits, tyre:Math.round(e.tyre), condition:Math.round(e.condition), lastAction:e.lastAction||'' }));
    ensureStandings();
    const st = currentStandings();
    state.lastRace.forEach((r,i)=>{ if(st[r.driver]){ st[r.driver].team = driverCurrentTeamId(r.driver)||r.team; st[r.driver].points += r.points; if(i===0) st[r.driver].wins++; if(i<3) st[r.driver].podiums++; st[r.driver].best = st[r.driver].best ? Math.min(st[r.driver].best,r.pos) : r.pos; } });
    state.completedRaces++; state.roundIndex = Math.min(DATA.calendar2026.length-1,state.roundIndex+1);
    const bestPlayer = state.lastRace.filter(r=>driversForTeam(state.currentTeam).some(d=>d.short===r.driver)).sort((a,b)=>a.pos-b.pos)[0];
    if(bestPlayer){
      state.seasonStats = state.seasonStats || { races:0, bestFinish:null, podiums:0, wins:0, objectiveProgress:0 };
      state.seasonStats.races = (state.seasonStats.races||0) + 1;
      state.seasonStats.bestFinish = state.seasonStats.bestFinish ? Math.min(state.seasonStats.bestFinish, bestPlayer.pos) : bestPlayer.pos;
      if(bestPlayer.pos <= 3) state.seasonStats.podiums = (state.seasonStats.podiums||0)+1;
      if(bestPlayer.pos === 1) state.seasonStats.wins = (state.seasonStats.wins||0)+1;
      const playerResults = state.lastRace.filter(r=>driversForTeam(state.currentTeam).some(d=>d.short===r.driver));
      const teamPoints = playerResults.reduce((sum,r)=>sum+(r.points||0),0);
      state.reputation += Math.max(0,12-bestPlayer.pos)*.8 + teamPoints*.12;
      state.money += (state.sponsor?.raceBonus || 120000) + Math.max(0,12-bestPlayer.pos)*50000 + teamPoints*25000;
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
    $('#championshipList').innerHTML = st.map((r,i)=>{ const d = driverByShort(r.driver) || {short:r.driver,name:r.driver,portrait:''}; const t = teamById(r.team); return `<div class="row rich-row ${isPlayerDriver(r.driver)?'highlight':''}"><span class="pos-cell">${i+1}</span><span class="driver-cell">${driverAvatarChip(d)}<span class="driver-text"><b>${r.driver}</b><small>${t ? t.name : ''}</small></span></span><span class="team-cell">${teamLogoHTML(t)}<span>${t ? t.name : ''}</span></span><span class="time-cell">${r.points} pts</span></div>`; }).join('');
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
