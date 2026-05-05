(() => {
  const DATA = window.F1M_DATA;
  const SAVE_KEYS = ['f1_manager_career_2026_v030', 'f1_manager_career_2026_v020'];
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

  function init(){
    screenBackgrounds();
    bindGlobalActions();
    renderCreator();
    renderTeamSelect();
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
      startRaceDirect(){ setupRace(true); showScreen('race'); },
      startRace(){ setupRace(false); showScreen('race'); },
      setPace(){ if(race) race.playerPace[Number(el.dataset.driver)] = el.dataset.pace; },
      pitDriver(){ if(race) requestPit(Number(el.dataset.driver)); },
      toggleRaceSpeed(){ if(race){ race.speed = race.speed === 1 ? 3 : race.speed === 3 ? 8 : 1; $('#speedLabel').textContent = race.speed; } },
      finishRaceNow(){ if(race) finishRace(); },
      returnLobbyAfterRace(){ showScreen('lobby'); },
      upgradePart(){ upgradePart(el.dataset.part); },
      signSponsor(){ signSponsor(el.dataset.sponsor); },
      hireStaff(){ hireStaff(el.dataset.role); }
    };
    if(actions[action]) actions[action]();
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
        <article class="dash-card glass-panel bg" data-asset-bg="${bg}"><div class="dash-overlay"></div><div class="dash-card-top">${teamVisual(team,true)}</div><h3>${team.name}</h3><p>${team.objective || 'Construir reputação e alcançar a Fórmula 1.'}</p><p>Próxima: ${currentRace.name}</p></article>
        <article class="dash-card glass-panel"><h3>Patrocinadores</h3><p>${state.sponsor ? state.sponsor.name : 'Nenhum contrato principal ativo.'}</p>${sponsorButtons()}</article>
        <article class="dash-card glass-panel"><h3>Metas da Diretoria</h3><p>${team.objective || 'Pontuar e evoluir a equipe.'}</p><div class="progress"><i style="width:${Math.min(100,state.reputation)}%"></i></div><p>Reputação ${Math.round(state.reputation)}/100</p></article>
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
      content.innerHTML = `<div class="glass-panel dash-card bg" data-asset-bg="${DATA.assetPaths.calendar}"><div class="dash-overlay"></div><h3>Temporada 2026</h3><div class="standings-list">${DATA.calendar2026.map((r,i)=>`<div class="row ${i===state.roundIndex?'highlight':''}"><span>${i+1}</span><span>${r.name}</span><span>${r.weather}</span><span>${r.laps}v</span></div>`).join('')}</div></div>`;
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
    $('#qualifyingTable').innerHTML = list.map((r,i)=>`<div class="row ${isPlayerDriver(r.driver)?'highlight':''}"><span>${i+1}</span><span>${r.driver}</span><span>${r.teamName}</span><span>${r.time}</span></div>`).join('');
    setScreenBg('screen-qualifying', DATA.assetPaths.classification);
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
    const grid = (state.lastQualifying && state.lastQualifying.length) ? state.lastQualifying : generateGridPreview();
    const allDrivers = generateRaceDrivers();
    const driverMap = new Map(allDrivers.map(d=>[d.short,d]));
    const entries = grid.map((g,i)=> {
      const d = driverMap.get(g.driver) || allDrivers[i]; const t = teamById(d.team);
      const car = d.team === state.currentTeam ? state.car : (t.car || estimateCar(t));
      return { driver:d, team:t, pos:i+1, lap:1, progress:i*-0.01, distance:0, tyre:100, fuel:100, condition:100, pits:0, pace:'normal', baseSpeed:baseRaceSpeed(d,car), color:t.color, secondary:t.secondary, finished:false, totalTime:0 };
    });
    race = { quick, entries, laps:22, speed:1, playerPace:['normal','normal'], started:Date.now(), weather:'dry', tick:0 };
    updateRaceHud();
  }
  function estimateCar(t){ const tier = t.tier==='top'?88:t.tier==='mid'?78:68; return { aero:tier, engine:tier, chassis:tier, reliability:tier, tyreWear:tier, pitStop:tier, fuel:tier }; }
  function baseRaceSpeed(d,car){ return 0.00042 + ((d.speed+d.consistency+d.overall)/3 + (car.aero+car.engine+car.chassis)/3)/100000; }
  function requestPit(idx){ const ds = driversForTeam(state.currentTeam); const target = ds[idx]; if(!target) return; const e = race.entries.find(x=>x.driver.short===target.short); if(e){ e.tyre = 100; e.condition = Math.min(100,e.condition+8); e.pits++; e.progress -= 0.035; } }

  function startRaceRenderer(){
    if(!race) setupRace(true);
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
    createTrackPoints(){ const pts=[]; for(let i=0;i<160;i++){ const a=i/160*Math.PI*2; const r=12 + Math.sin(a*3)*3 + Math.cos(a*2)*1.8; pts.push(new THREE.Vector3(Math.cos(a)*r,0,Math.sin(a)*r*.72)); } return pts; }
    addLights(){ this.scene.add(new THREE.AmbientLight(0xffffff,.8)); const d=new THREE.DirectionalLight(0xffffff,1.8); d.position.set(-10,30,15); this.scene.add(d); }
    addTrack(){
      const floor=new THREE.Mesh(new THREE.PlaneGeometry(70,45), new THREE.MeshStandardMaterial({color:0x0b4b56,roughness:.7})); floor.rotation.x=-Math.PI/2; floor.position.y=-.04; this.scene.add(floor);
      const roadMat=new THREE.MeshStandardMaterial({color:0x17191d,roughness:.45}); const curbMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.3});
      for(let i=0;i<this.trackPoints.length;i++){ const p=this.trackPoints[i], n=this.trackPoints[(i+1)%this.trackPoints.length]; const mid=p.clone().lerp(n,.5); const len=p.distanceTo(n); const seg=new THREE.Mesh(new THREE.BoxGeometry(4.4,.08,len+.18),roadMat); seg.position.copy(mid); seg.position.y=0; seg.rotation.y=Math.atan2(n.x-p.x,n.z-p.z); this.scene.add(seg); if(i%3===0){ const c=new THREE.Mesh(new THREE.BoxGeometry(5.1,.09,.18),curbMat); c.position.copy(mid); c.position.y=.03; c.rotation.y=seg.rotation.y; this.scene.add(c); } }
    }
    addEnvironment(){
      const water=new THREE.Mesh(new THREE.PlaneGeometry(18,48), new THREE.MeshStandardMaterial({color:0x009ac8,roughness:.35,metalness:.1})); water.rotation.x=-Math.PI/2; water.position.set(-27,-.02,0); this.scene.add(water);
      const matB=new THREE.MeshStandardMaterial({color:0xd6d9df,roughness:.7}); for(let i=0;i<18;i++){ const b=new THREE.Mesh(new THREE.BoxGeometry(rnd(1.2,2.8),rnd(1.2,5),rnd(1.2,2.8)),matB); b.position.set(rnd(18,31),b.geometry.parameters.height/2,rnd(-18,18)); this.scene.add(b); }
      const palmMat=new THREE.MeshStandardMaterial({color:0x0f7738}); const trunkMat=new THREE.MeshStandardMaterial({color:0x6b4329}); for(let i=0;i<28;i++){ const x=rnd(-23,23), z=rnd(-16,16); if(Math.abs(x)<17 && Math.abs(z)<12) continue; const tr=new THREE.Mesh(new THREE.CylinderGeometry(.08,.12,1.3,6),trunkMat); tr.position.set(x,.65,z); this.scene.add(tr); const top=new THREE.Mesh(new THREE.ConeGeometry(.55,1,7),palmMat); top.position.set(x,1.45,z); this.scene.add(top); }
    }
    addCars(){ this.race.entries.forEach((e,i)=>{ const car=this.makeCar(e.color,e.secondary); this.scene.add(car); this.cars.push(car); this.placeCar(car,e,i); }); }
    makeCar(color,secondary){
      const g=new THREE.Group(); const main=new THREE.Mesh(new THREE.BoxGeometry(.75,.32,1.75),new THREE.MeshStandardMaterial({color,roughness:.32,metalness:.1})); main.position.y=.28; g.add(main);
      const nose=new THREE.Mesh(new THREE.BoxGeometry(.38,.22,1.25),new THREE.MeshStandardMaterial({color,roughness:.32})); nose.position.set(0,.25,1.35); g.add(nose);
      const cockpit=new THREE.Mesh(new THREE.BoxGeometry(.42,.28,.42),new THREE.MeshStandardMaterial({color:0x050509})); cockpit.position.set(0,.55,.2); g.add(cockpit);
      const wingMat=new THREE.MeshStandardMaterial({color:secondary||0x111111,roughness:.4}); const fw=new THREE.Mesh(new THREE.BoxGeometry(1.55,.08,.26),wingMat); fw.position.set(0,.18,2.05); g.add(fw); const rw=new THREE.Mesh(new THREE.BoxGeometry(1.4,.18,.2),wingMat); rw.position.set(0,.62,-1.0); g.add(rw);
      const wheelMat=new THREE.MeshStandardMaterial({color:0x080808,roughness:.7}); [[-.58,.25,.65],[.58,.25,.65],[-.58,.25,-.72],[.58,.25,-.72]].forEach(p=>{ const w=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.18,16),wheelMat); w.rotation.z=Math.PI/2; w.position.set(...p); g.add(w); });
      g.scale.set(.75,.75,.75); return g;
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
      e.condition = Math.max(0,e.condition - dt*race.speed*(100-(state.car.reliability||70))/2500);
      e.lap = Math.min(race.laps, Math.floor(e.progress)+1);
      e.totalTime += dt*race.speed*(1 + (100-e.tyre)/650);
    });
    race.entries.sort((a,b)=>b.distance-a.distance); race.entries.forEach((e,i)=>e.pos=i+1);
    updateRaceHud();
    if(race.entries.some(e=>e.progress>=race.laps)) finishRace();
  }
  function updateRaceHud(){
    if(!race) return;
    $('#lapLabel').textContent = `VOLTA ${Math.max(...race.entries.map(e=>e.lap))}/${race.laps}`;
    $('#raceLeaderboard').innerHTML = race.entries.slice(0,22).map((e,i)=>`<div class="row ${isPlayerDriver(e.driver.short)?'highlight':''}"><span>${i+1}</span><span>${e.driver.short}</span><span>${Math.round(e.tyre)}%</span><span>${e.pits}P</span></div>`).join('');
    const pDrivers = driversForTeam(state.currentTeam); [0,1].forEach(i=>{ const d=pDrivers[i]; if(!d) return; const e=race.entries.find(x=>x.driver.short===d.short); const name=$(`#controlDriver${i+1}`), cond=$(`#cond${i+1}`); if(e){ name.textContent = `${e.pos}º | ${d.short}`; cond.style.width = `${Math.round(e.condition)}%`; } });
  }
  function finishRace(){
    if(!race) return;
    race.entries.sort((a,b)=>b.distance-a.distance);
    state.lastRace = race.entries.map((e,i)=>({pos:i+1, driver:e.driver.short, team:e.team.id, teamName:e.team.name, points:DATA.points[i]||0, pits:e.pits }));
    state.lastRace.forEach((r,i)=>{ if(state.f1Standings[r.driver]){ state.f1Standings[r.driver].points += r.points; if(i===0) state.f1Standings[r.driver].wins++; if(i<3) state.f1Standings[r.driver].podiums++; } });
    state.completedRaces++; state.roundIndex = Math.min(DATA.calendar2026.length-1,state.roundIndex+1);
    const bestPlayer = state.lastRace.filter(r=>driversForTeam(state.currentTeam).some(d=>d.short===r.driver)).sort((a,b)=>a.pos-b.pos)[0];
    if(bestPlayer){ state.reputation += Math.max(0,12-bestPlayer.pos)*.8; state.money += (state.sponsor?.raceBonus || 120000) + Math.max(0,12-bestPlayer.pos)*50000; }
    saveState(); renderResults(); race=null; showScreen('results');
  }
  function renderResults(){
    setScreenBg('screen-results', DATA.assetPaths.podium);
    $('#resultList').innerHTML = state.lastRace.map(r=>`<div class="row ${isPlayerDriver(r.driver)?'highlight':''}"><span>${r.pos}</span><span>${r.driver}</span><span>${r.teamName}</span><span>${r.points}</span></div>`).join('');
    const st = Object.values(state.f1Standings).sort((a,b)=>b.points-a.points).slice(0,22);
    $('#championshipList').innerHTML = st.map((r,i)=>`<div class="row"><span>${i+1}</span><span>${r.driver}</span><span>${r.points}</span><span>${r.wins}V</span></div>`).join('');
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
