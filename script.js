(() => {
  const DATA = window.F1M_DATA;
  const SAVE_KEYS = ['f1_manager_career_2026_v090', 'f1_manager_career_2026_v070', 'f1_manager_career_2026_v060', 'f1_manager_career_2026_v050', 'f1_manager_career_2026_v040', 'f1_manager_career_2026_v020'];
  const ACTIVE_SAVE_KEY = SAVE_KEYS[0];
  const ASSET_ROOTS = ['assets/'];
  for(let i=1;i<=15;i++) ASSET_ROOTS.push(`f1_assets_part_${String(i).padStart(2,'0')}/assets/`);

  let state = loadState() || createInitialState();
  let selectedAvatar = 0;
  let selectedMode = 'realistic';
  let selectedTeam = DATA.f2Teams[0].id;
  let selectedCompound = 'soft';
  let race = null;
  let renderer3d = null;

  const $ = (q) => document.querySelector(q);
  const $$ = (q) => Array.from(document.querySelectorAll(q));

  function money(n){ return '$ ' + Math.round(n).toLocaleString('pt-BR'); }
  function teamById(id){ return DATA.f1Teams2026.concat(DATA.f2Teams).find(t => t.id === id); }
  function driversForTeam(id){ return DATA.f1Drivers2026.concat(DATA.f2Drivers).filter(d => d.team === id); }
  function rnd(min,max){ return min + Math.random()*(max-min); }
  function cleanAssetPath(p){ return String(p||'').replace(/^\.?\//,'').replace(/^assets\//,''); }
  function assetCandidates(p){ const rel = cleanAssetPath(p); return ASSET_ROOTS.map(root => root + rel); }
  function asset(p){ return assetCandidates(p)[0]; }
  function initials(text){ return String(text||'').split(/\s+/).filter(Boolean).slice(0,2).map(s=>s[0]).join('').toUpperCase() || 'VG'; }
  function flagPath(code){ return `flags/all/${String(code||'').toLowerCase()}.png`; }

  function driverByShort(short){ return DATA.f1Drivers2026.concat(DATA.f2Drivers).find(d => d.short === short) || null; }
  function teamLogoHTML(team, cls='team-logo-inline'){
    if(!team) return `<span class="team-logo-inline fallback-logo">?</span>`;
    return `<span class="${cls} wrap">${team.logo ? `<img data-asset-src="${team.logo}" alt="${team.name}" />` : ''}<b class="fallback-badge" style="display:${team.logo ? 'none':'flex'}">${initials(team.name)}</b></span>`;
  }
  function driverAvatarChip(d, cls='driver-avatar-inline'){
    if(!d) return `<span class="${cls} fallback-avatar">?</span>`;
    return `<span class="${cls}">${d.portrait ? `<img data-asset-src="${d.portrait}" alt="${d.short||d.name}" />` : ''}<b class="fallback-badge" style="display:${d.portrait ? 'none':'flex'}">${initials(d.short||d.name)}</b></span>`;
  }

  function createInitialState(){
    const standings = {};
    DATA.f1Drivers2026.forEach(d => standings[d.short] = { driver:d.short, team:d.team, points:0, wins:0, podiums:0 });
    return {
      profile:null,
      mode:'realistic',
      currentSeries:'F2',
      currentTeam:null,
      roundIndex:5,
      money:0,
      reputation:0,
      sponsor:null,
      staff:{ designers:1, mechanics:1, strategists:1 },
      facilities:{ hq:1, simulator:1, factory:1, scouting:0 },
      car:{ aero:50, engine:50, chassis:50, reliability:55, tyreWear:55, pitStop:55, fuel:55 },
      f1Standings:standings,
      lastQualifying:[],
      lastRace:[],
      offers:[],
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
    const label = b.label || 'Build v0.9.0 • 06/05/2026 • 16:39 BRT';
    const home = document.getElementById('homeBuildPill');
    const global = document.getElementById('globalBuildStamp');
    if(home) home.textContent = label;
    if(global) global.textContent = label;
    document.title = `F1 Manager Career 2026 — ${label}`;
  }

  function init(){
    updateBuildBadges();
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
      if(mode){ selectedMode = mode.dataset.mode; $$('.mode-card').forEach(b=>b.classList.remove('selected')); mode.classList.add('selected'); }
      const comp = ev.target.closest('[data-compound]');
      if(comp){ selectedCompound = comp.dataset.compound; $$('.strategy-pills button').forEach(b=>b.classList.remove('selected')); comp.classList.add('selected'); }
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
      hireStaff(){ hireStaff(el.dataset.role); }
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

  function renderTeamSelect(){
    const grid = $('#teamSelectGrid'); grid.innerHTML = '';
    DATA.f2Teams.forEach(t => {
      const b = document.createElement('button');
      b.className = 'team-card' + (t.id===selectedTeam?' selected':'');
      b.dataset.team = t.id;
      b.style.setProperty('--team-bg', `linear-gradient(135deg, #000d, #0007), radial-gradient(circle at 70% 30%, #${t.color.toString(16).padStart(6,'0')}, transparent 45%)`);
      b.innerHTML = `${teamVisual(t)}<h3>${t.name}</h3><p>${t.level.toUpperCase()}</p><div class="team-stats"><span>Orçamento ${money(t.budget)}</span><span>Reputação ${t.reputation}</span><span>Meta: ${t.objective}</span></div>`;
      grid.appendChild(b);
    });
    hydrateAssets(grid);
  }

  function startCareer(){
    const t = DATA.f2Teams.find(x=>x.id===selectedTeam);
    state.currentSeries = 'F2';
    state.currentTeam = t.id;
    state.money = state.mode==='sandbox' ? t.budget*2 : t.budget;
    state.reputation = t.reputation;
    state.car = {...t.car, fuel:55};
    state.roundIndex = 5;
    state.completedRaces = 0;
    state.lastQualifying = [];
    state.lastRace = [];
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
    $('#hudRound').textContent = `Corrida ${state.completedRaces+1}/${DATA.calendar2026.length}`;
  }

  function renderLobby(){
    updateHud();
    const team = teamById(state.currentTeam);
    setScreenBg('screen-lobby', team.lobby || DATA.assetPaths.lobbyGlobal);
    renderTab($('.side-nav button.active')?.dataset.tab || 'dashboard');
  }

  function sponsorButtons(){
    return DATA.sponsors.map(s=>`<button class="secondary" data-action="signSponsor" data-sponsor="${s.id}">${s.name} • ${money(s.advance)}</button>`).join('');
  }

  function renderTab(tab){
    const content = $('#tabContent');
    const team = teamById(state.currentTeam);
    const bg = team.lobby || DATA.assetPaths.lobbyGlobal;
    const currentRace = DATA.calendar2026[state.roundIndex] || DATA.calendar2026[5];
    const drivers = driversForTeam(state.currentTeam);

    if(tab === 'dashboard'){
      content.innerHTML = `<div class="cards-grid">
        <article class="dash-card glass-panel bg" data-asset-bg="${bg}"><div class="dash-overlay"></div><div class="dash-card-top">${teamVisual(team,true)}</div><h3>${team.name}</h3><p>${team.objective || 'Construir reputação e alcançar a Fórmula 1.'}</p><p>Próxima: ${currentRace.name}</p><p>${(state.offers&&state.offers.length)?state.offers[state.offers.length-1].text:'Objetivo: conquistar reputação para receber convites da F1.'}</p></article>
        <article class="dash-card glass-panel"><h3>Patrocinadores</h3><p>${state.sponsor ? state.sponsor.name : 'Nenhum contrato principal ativo.'}</p>${sponsorButtons()}</article>
        <article class="dash-card glass-panel"><h3>Metas da Diretoria</h3><p>${team.objective || 'Pontuar e evoluir a equipe.'}</p><div class="progress"><i style="width:${Math.min(100,state.reputation)}%"></i></div><p>Reputação ${Math.round(state.reputation)}/100</p></article>
        <article class="dash-card glass-panel career-card"><h3>Carreira do Gestor</h3><p><b>Você começou na F2.</b> Cumpra metas, evolua pilotos e mantenha as finanças saudáveis para receber convites de equipes pequenas da F1.</p><p>Escada: F2 fraca → F2 média → F2 forte → F1 baixa → F1 média → equipe grande.</p></article>
      </div>`;
    }
    if(tab === 'drivers'){
      content.innerHTML = `<div class="cards-grid">${drivers.map(d=>driverCard(d)).join('')}<article class="dash-card glass-panel"><h3>Mercado</h3><p>Base preparada para futura fase de contratos, observação e negociações.</p><p>Agora os cards de pilotos já tentam usar portraits reais dos assets ou avatares gerados.</p></article></div>`;
    }
    if(tab === 'garage'){
      const parts = [['engine','Motor','engine'],['aero','Aerodinâmica','aero'],['chassis','Chassi','chassis'],['reliability','Confiabilidade','reliability'],['tyreWear','Pneus','saveTyres'],['pitStop','Pit Stop','pitStop'],['fuel','Combustível','fuel']];
      content.innerHTML = `<div class="cards-grid"><article class="dash-card glass-panel bg" data-asset-bg="${DATA.assetPaths.garage}"><div class="dash-overlay"></div><h3>Oficina</h3><p>Desenvolva peças para melhorar ritmo e confiabilidade.</p></article>${parts.map(([key,label,icon])=>`<article class="dash-card glass-panel"><h3>${label}</h3><div class="icon-row"><img class="mini-icon" data-asset-src="${DATA.assetPaths[icon]}" alt="${label}" /><span class="fallback-badge mini-fallback">${initials(label)}</span></div><p>Nível ${Math.round(state.car[key]||50)}</p><div class="progress"><i style="width:${state.car[key]||50}%"></i></div><button class="primary" data-action="upgradePart" data-part="${key}">MELHORAR ${money(upgradeCost(key))}</button></article>`).join('')}</div>`;
    }
    if(tab === 'staff'){
      content.innerHTML = `<div class="cards-grid">${['designers','mechanics','strategists'].map(r=>`<article class="dash-card glass-panel"><h3>${labelRole(r)}</h3><p>Nível ${state.staff[r]}</p><p>${roleDesc(r)}</p><button class="primary" data-action="hireStaff" data-role="${r}">CONTRATAR ${money(300000*state.staff[r])}</button></article>`).join('')}</div>`;
    }
    if(tab === 'facilities'){
      content.innerHTML = `<div class="cards-grid">${Object.entries(state.facilities).map(([k,v])=>`<article class="dash-card glass-panel"><h3>${facilityLabel(k)}</h3><p>Nível ${v}</p><div class="progress"><i style="width:${v*20}%"></i></div><button class="secondary">EXPANSÃO FUTURA</button></article>`).join('')}</div>`;
    }
    if(tab === 'calendar'){
      content.innerHTML = `<div class="glass-panel dash-card bg" data-asset-bg="${DATA.assetPaths.calendar}"><div class="dash-overlay"></div><h3>Temporada 2026 — SVG completa</h3><p>${DATA.calendar2026.length} pistas SVG ativas e jogáveis.</p><div class="standings-list">${DATA.calendar2026.map((r,i)=>`<div class="row ${i===state.roundIndex?'highlight':''}"><span>${i+1}</span><span>${r.name}</span><span>${r.weather}</span><span>${r.laps}v</span></div>`).join('')}</div></div>`;
    }
    hydrateAssets(content);
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

  function labelRole(r){ return ({designers:'Designers',mechanics:'Mecânicos',strategists:'Estrategistas'})[r]; }
  function roleDesc(r){ return ({designers:'Aceleram desenvolvimento de peças.',mechanics:'Reduzem tempo de pit e falhas.',strategists:'Melhoram estratégia e desgaste.'})[r]; }
  function facilityLabel(k){ return ({hq:'Sede',simulator:'Simulador',factory:'Fábrica',scouting:'Observação'})[k]; }
  function upgradeCost(part){ return 250000 + Math.round((state.car[part]||50)*9000); }
  function upgradePart(part){ const cost = upgradeCost(part); if(state.money < cost) return alert('Orçamento insuficiente.'); state.money -= cost; state.car[part] = Math.min(99,(state.car[part]||50) + 2 + state.staff.designers*0.7); saveState(); renderTab('garage'); updateHud(); }
  function signSponsor(id){ const s = DATA.sponsors.find(x=>x.id===id); state.sponsor = s; state.money += s.advance; saveState(); renderTab('dashboard'); updateHud(); }
  function hireStaff(role){ const cost = 300000 * state.staff[role]; if(state.money < cost) return alert('Orçamento insuficiente.'); state.money -= cost; state.staff[role] += 1; saveState(); renderTab('staff'); updateHud(); }

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
    const base = state.currentSeries === 'F2' ? DATA.f2Drivers : DATA.f1Drivers2026;
    return base.map(d => ({...d, teamObj:teamById(d.team)}));
  }
  function generateGridPreview(){
    return generateRaceDrivers().map(d => ({driver:d.short, team:d.team, teamName:teamById(d.team).name, score:d.overall + rnd(-8,8), time:(73 + rnd(0,4)).toFixed(3)})).sort((a,b)=>b.score-a.score);
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
      return { driver:d, team:t, pos:i+1, lap:1, progress:i*-0.01, distance:0, tyre:100, fuel:100, condition:100, pits:0, pace:'normal', baseSpeed:baseRaceSpeed(d,car), color:t.color, secondary:t.secondary, finished:false, totalTime:0 };
    });
    race = { quick, entries, laps:currentRace.laps || 22, speed:1, playerPace:driversForTeam(state.currentTeam).map(()=> 'normal'), started:Date.now(), weather:currentRace.weather || 'dry', tick:0, trackInfo:currentRace }; 
    updateRaceHud();
  }
  function estimateCar(t){ const tier = t.tier==='top'?88:t.tier==='mid'?78:68; return { aero:tier, engine:tier, chassis:tier, reliability:tier, tyreWear:tier, pitStop:tier, fuel:tier }; }
  function baseRaceSpeed(d,car){ const driver=((d.speed||70)+(d.consistency||70)+(d.overall||70))/3; const machine=((car.aero||60)+(car.engine||60)+(car.chassis||60))/3; return 0.026 + (driver + machine) / 7200; }
  function requestPit(idx){ const ds = driversForTeam(state.currentTeam); const target = ds[idx]; if(!target || !race) return; const e = race.entries.find(x=>x.driver.short===target.short); if(e && !e.pitCooldown){ e.tyre = 100; e.condition = Math.min(100,e.condition+8); e.pits++; e.progress -= 0.055; e.pitCooldown = 8; e.lastAction = 'PIT'; updateRaceHud(); } }

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
    race.entries.forEach((e)=>{
      const isPlayer = isPlayerDriver(e.driver.short); if(isPlayer){ const ds=driversForTeam(state.currentTeam); const pidx=ds.findIndex(d=>d.short===e.driver.short); e.pace = race.playerPace[pidx] || 'normal'; }
      const paceMul = e.pace==='attack'?1.12:e.pace==='save'?0.93:1;
      const tyreMul = 0.84 + e.tyre/100*0.22; const condMul = 0.82 + e.condition/100*0.2;
      e.progress += e.baseSpeed * paceMul * tyreMul * condMul * dt * race.speed;
      e.distance = e.progress;
      e.tyre = Math.max(0,e.tyre - dt*race.speed*(e.pace==='attack'?0.16:e.pace==='save'?0.07:0.1));
      e.fuel = Math.max(0,e.fuel - dt*race.speed*(e.pace==='attack'?0.13:e.pace==='save'?0.07:0.1));
      e.condition = Math.max(0,e.condition - dt*race.speed*(100-(state.car.reliability||70))/2500); if(e.pitCooldown) e.pitCooldown = Math.max(0, e.pitCooldown - dt*race.speed);
      e.lap = Math.min(race.laps, Math.floor(e.progress)+1);
      e.totalTime += dt*race.speed*(1 + (100-e.tyre)/650);
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
    const pDrivers = driversForTeam(state.currentTeam); [0,1].forEach(i=>{ const d=pDrivers[i]; if(!d) return; const e=race.entries.find(x=>x.driver.short===d.short); const card=document.getElementById(`controlCard${i+1}`), name=document.getElementById(`controlDriver${i+1}`), cond=document.getElementById(`cond${i+1}`); if(e){ if(name) name.innerHTML = `<span class="control-head">${driverAvatarChip(d,'driver-avatar-inline small')}${teamLogoHTML(teamById(d.team),'team-logo-inline small')}<span><b>${e.pos}º | ${d.short}</b><small>${teamById(d.team).name}</small></span></span>`; if(cond) cond.style.width = `${Math.round(e.condition)}%`; if(card){ card.querySelectorAll('[data-pace]').forEach(btn=>btn.classList.toggle('active', btn.dataset.pace === (race.playerPace[i]||'normal'))); const status=card.querySelector('.pilot-status') || document.createElement('div'); status.className='pilot-status'; status.textContent = `Modo: ${(race.playerPace[i]||'normal').toUpperCase()} • Pneu ${Math.round(e.tyre)}% • Pit ${e.pits}`; if(!status.parentElement) card.appendChild(status); hydrateAssets(card); } } });
  }
  function finishRace(){
    if(!race) return;
    race.entries.sort((a,b)=>b.distance-a.distance);
    state.lastRace = race.entries.map((e,i)=>({pos:i+1, driver:e.driver.short, team:e.team.id, teamName:e.team.name, points:DATA.points[i]||0, pits:e.pits }));
    state.lastRace.forEach((r,i)=>{ if(state.f1Standings[r.driver]){ state.f1Standings[r.driver].points += r.points; if(i===0) state.f1Standings[r.driver].wins++; if(i<3) state.f1Standings[r.driver].podiums++; } });
    state.completedRaces++; state.roundIndex = Math.min(DATA.calendar2026.length-1,state.roundIndex+1);
    const bestPlayer = state.lastRace.filter(r=>driversForTeam(state.currentTeam).some(d=>d.short===r.driver)).sort((a,b)=>a.pos-b.pos)[0];
    if(bestPlayer){ state.reputation += Math.max(0,12-bestPlayer.pos)*.8; state.money += (state.sponsor?.raceBonus || 120000) + Math.max(0,12-bestPlayer.pos)*50000; updateCareerOffers(bestPlayer); }
    saveState(); renderResults(); race=null; showScreen('results');
  }
  function updateCareerOffers(bestPlayer){
    if(!bestPlayer) return;
    const rep = state.reputation || 0;
    const unlocked = [];
    if(state.currentSeries === 'F2' && rep >= 42) unlocked.push('F1 Baixa');
    if(state.currentSeries === 'F1' && rep >= 62) unlocked.push('F1 Média');
    if(state.currentSeries === 'F1' && rep >= 82) unlocked.push('F1 Grande');
    state.offers = unlocked.map(level => ({ level, round: state.completedRaces, text:`Convite disponível: ${level}` }));
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
    const st = Object.values(state.f1Standings).sort((a,b)=>b.points-a.points).slice(0,22);
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
