import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { BUILD_INFO, ASSET_PATHS, TEAMS, DRIVERS, CALENDAR_2026, SPONSORS } from './data/game-data.js';

const BUILD_STAMP = new Date().toLocaleString('pt-BR');
const SAVE_KEY = 'f1_manager_career_2026_save_v010';

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const money = n => Number(n).toLocaleString('pt-BR');
const slug = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
const rand = (a,b) => a + Math.random()*(b-a);

function asset(path){ return path || ''; }
function setAssetBackground(el, path){ if(!el || !path) return; el.style.backgroundImage = `linear-gradient(90deg,#05060bee,#08091488), url("${path}")`; }
function showToast(text){ const t=document.createElement('div'); t.className='toast'; t.textContent=text; document.body.appendChild(t); setTimeout(()=>t.remove(),2200); }
function screen(id){ $$('.screen').forEach(s=>s.classList.remove('active')); $('#screen'+id[0].toUpperCase()+id.slice(1)).classList.add('active'); }

const FLAGS = {BR:'🇧🇷',UK:'🇬🇧',IT:'🇮🇹',MC:'🇲🇨',NL:'🇳🇱',FR:'🇫🇷',AU:'🇦🇺',US:'🇺🇸',ES:'🇪🇸',CA:'🇨🇦',DE:'🇩🇪',MX:'🇲🇽',FI:'🇫🇮',NZ:'🇳🇿',AR:'🇦🇷',CN:'🇨🇳',TH:'🇹🇭'};

const GameState = {
  build: {...BUILD_INFO, buildStamp: BUILD_STAMP},
  screen:'splash',
  manager:{ first:'Jonatan', last:'Vale', country:'BR', avatar:'avatar_01', mode:'realistic', history:'ex_driver' },
  career:{ category:'F2', season:2026, round:6, race:'Miami', reputation:25, balance:5500000, teamId:null, sponsorId:null, completedRaces:0 },
  team:null,
  standings:{ drivers:{}, constructors:{} },
  qualifying:null,
  race:null,
  settings:{ selectedTeamId:'f2_aurora', raceStrategy:'normal' }
};

const CareerManager = {
  initStandings(){
    for(const d of DRIVERS){ if(!(d.id in GameState.standings.drivers)) GameState.standings.drivers[d.id]={points:0,wins:0,podiums:0,races:0}; }
    for(const t of TEAMS){ if(!(t.id in GameState.standings.constructors)) GameState.standings.constructors[t.id]={points:0,wins:0}; }
  },
  start(){
    const t = TEAMS.find(x=>x.id===GameState.settings.selectedTeamId) || TEAMS.find(t=>t.category==='F2');
    GameState.team = structuredClone(t);
    GameState.career.teamId = t.id;
    GameState.career.balance = GameState.manager.mode==='sandbox' ? Math.max(t.budget,25000000) : t.budget;
    GameState.career.reputation = t.reputation;
    this.initStandings();
    UIManager.refreshAll();
    screen('lobby');
  },
  save(){ localStorage.setItem(SAVE_KEY, JSON.stringify(GameState)); showToast('Carreira salva'); },
  load(){
    const raw = localStorage.getItem(SAVE_KEY); if(!raw) return false;
    try{ const data=JSON.parse(raw); Object.assign(GameState,data); UIManager.refreshAll(); return true; } catch(e){ return false; }
  },
  afterRace(results){
    const points=[25,18,15,12,10,8,6,4,2,1];
    results.forEach((r,i)=>{
      const ds=GameState.standings.drivers[r.driver.id] || (GameState.standings.drivers[r.driver.id]={points:0,wins:0,podiums:0,races:0});
      ds.races++; if(i<10) ds.points += points[i]; if(i===0) ds.wins++; if(i<3) ds.podiums++;
      const team = TEAMS.find(t=>t.name===r.driver.team || t.id===slug(r.driver.team));
      const teamId = team?.id || GameState.career.teamId;
      const cs=GameState.standings.constructors[teamId] || (GameState.standings.constructors[teamId]={points:0,wins:0});
      if(i<10) cs.points += points[i]; if(i===0) cs.wins++;
    });
    const playerDrivers = DriverManager.getTeamDrivers(GameState.team.name);
    const best = Math.min(...results.filter(r=>playerDrivers.some(d=>d.id===r.driver.id)).map(r=>r.position));
    const reward = best <= 3 ? 1200000 : best <= 8 ? 650000 : 250000;
    GameState.career.balance += reward;
    GameState.career.completedRaces++;
    GameState.career.reputation += best <= 3 ? 4 : best <= 8 ? 2 : 1;
  }
};

const TeamManager = {
  eligibleStartTeams(){ return TEAMS.filter(t=> t.category==='F2' || (!t.startLocked && ['Baixa'].includes(t.tier))); },
  averageCar(team=GameState.team){ const c=team.car; return (c.aero+c.engine+c.chassis+c.reliability+c.tyreWear+c.pitStop)/6; },
  improveLowest(){
    const c=GameState.team.car; const keys=Object.keys(c); const lowest=keys.sort((a,b)=>c[a]-c[b])[0];
    const cost = GameState.team.category==='F2'?450000:3500000;
    if(GameState.career.balance<cost) return showToast('Orçamento insuficiente');
    GameState.career.balance -= cost; c[lowest]+= rand(2,5); c[lowest]=Math.min(99,Math.round(c[lowest]));
    UIManager.refreshLobby(); showToast(`Melhoria aplicada: ${UIManager.partLabel(lowest)}`);
  }
};

const DriverManager = {
  getTeamDrivers(teamName){ return DRIVERS.filter(d => d.team===teamName || (GameState.team?.category==='F2' && d.team===GameState.team?.name)).slice(0,2); },
  getRaceGrid(){
    const isF2 = GameState.team?.category==='F2';
    return DRIVERS.filter(d=> isF2 ? d.category==='F2' : d.category==='F1');
  },
  driverPower(d, team){
    const car = TeamManager.averageCar(team);
    return d.overall*0.48 + d.speed*0.22 + d.consistency*0.12 + d.experience*0.06 + car*0.12;
  }
};

const RaceSimulator = {
  current:null,
  qualify(){
    const drivers = DriverManager.getRaceGrid();
    const results = drivers.map(d=>{
      const team = TEAMS.find(t=>t.name===d.team) || GameState.team;
      const power = DriverManager.driverPower(d,team);
      const lap = 86 - power*0.18 + rand(-0.65,0.9);
      return {driver:d, team, lap:+lap.toFixed(3)};
    }).sort((a,b)=>a.lap-b.lap).map((r,i)=>({...r,position:i+1}));
    GameState.qualifying = results;
    return results;
  },
  createRaceState(){
    const grid = (GameState.qualifying || this.qualify()).map(r=>({
      driver:r.driver, team:r.team, position:r.position, progress:1-r.position*0.002, lap:1, tyre: r.position%3===0?'medium':'soft', tyreLife:100, fuel:100, condition:100, pace:DriverManager.driverPower(r.driver,r.team), pit:false, gap:0, finished:false
    }));
    this.current = { lap:1, laps:12, running:true, speed:1, elapsed:0, cars:grid, weather:'Seco', rain:0, playerStrategy:'normal' };
    GameState.race = this.current;
    return this.current;
  },
  step(dt){
    const s=this.current; if(!s || !s.running) return;
    s.elapsed+=dt;
    for(const car of s.cars){ if(car.finished) continue;
      let strat = DriverManager.getTeamDrivers(GameState.team.name).some(d=>d.id===car.driver.id) ? s.playerStrategy : 'normal';
      const stratPace = strat==='push'?1.18:strat==='saveTires'?0.88:strat==='saveFuel'?0.92:1;
      const wear = strat==='push'?0.054:strat==='saveTires'?0.018:0.033;
      car.tyreLife=Math.max(0,car.tyreLife-wear*dt*60);
      car.fuel=Math.max(0,car.fuel-(strat==='push'?0.036:strat==='saveFuel'?0.016:0.025)*dt*60);
      const tyrePenalty = car.tyreLife<25 ? (25-car.tyreLife)*0.012 : 0;
      const fuelPenalty = car.fuel<10 ? (10-car.fuel)*0.01 : 0;
      const pace = (car.pace/100)*0.0055*stratPace*(1-tyrePenalty-fuelPenalty) + rand(-0.000015,0.000015);
      car.progress += pace*dt*60;
      if(car.progress>=car.lap){ car.lap++; if(car.lap>s.laps){car.finished=true; car.progress=s.laps+1;} }
      if(car.tyreLife<12 && !car.pit && Math.random()<0.002){ this.pit(car); }
    }
    s.cars.sort((a,b)=>b.progress-a.progress).forEach((c,i)=>{ c.position=i+1; c.gap = i===0?0:((s.cars[0].progress-c.progress)*34).toFixed(3); });
    s.lap = Math.max(...s.cars.map(c=>Math.min(s.laps,c.lap)));
    if(s.cars.every(c=>c.finished)) s.running=false;
  },
  pit(car){ car.pit=true; car.progress-=0.035; car.tyreLife=100; car.tyre = car.tyre==='soft'?'medium':'hard'; setTimeout(()=>car.pit=false,3000); },
  finishNow(){
    const s=this.current; if(!s) this.createRaceState();
    while(this.current.running) this.step(0.8);
    const results=this.current.cars.slice().sort((a,b)=>a.position-b.position).map((c,i)=>({...c,position:i+1}));
    CareerManager.afterRace(results); return results;
  }
};

const UIManager = {
  init(){
    $('#buildBadge').textContent = `${BUILD_INFO.version} • ${BUILD_STAMP}`;
    this.applyBackgrounds(); this.renderCreate(); this.renderTeamSelect(); this.bind();
    if(localStorage.getItem(SAVE_KEY)) $('#btnContinue').classList.remove('disabled');
  },
  applyBackgrounds(){
    $$('[data-bg]').forEach(el=>{
      const key=el.dataset.bg; let path=ASSET_PATHS.backgrounds[key];
      if(!path && key==='garage_base') path=ASSET_PATHS.backgrounds.garage_base;
      if(path) setAssetBackground(el,path);
    });
  },
  refreshAll(){ this.applyBackgrounds(); this.refreshLobby(); this.renderTeamSelect(); this.renderCalendar(); this.renderStandings(); },
  renderCreate(){
    const countries=[['BR','Brasil'],['UK','Reino Unido'],['IT','Itália'],['US','Estados Unidos'],['ES','Espanha'],['FR','França'],['DE','Alemanha'],['MX','México']];
    $('#managerCountry').innerHTML=countries.map(([v,n])=>`<option value="${v}">${FLAGS[v]||''} ${n}</option>`).join('');
    $('#avatarRow').innerHTML=Object.keys(ASSET_PATHS.avatars).map((id,i)=>`<button class="avatar ${i===0?'selected':''}" data-avatar="${id}">${i+1}</button>`).join('');
    const histories=[['ex_driver','Ex-piloto','+50% evolução de pilotos contratados'],['mechanic','Ex-mecânico','+10% pontos de pesquisa'],['finance','Financeiro','-5% custo de compras']];
    $('#historyGrid').innerHTML=histories.map((h,i)=>`<button class="history-card ${i===0?'selected':''}" data-history="${h[0]}"><strong>${h[1]}</strong><p>${h[2]}</p></button>`).join('');
  },
  renderTeamSelect(){
    const teams=TeamManager.eligibleStartTeams();
    $('#teamCards').innerHTML=teams.map(t=>`<button class="team-card ${t.id===GameState.settings.selectedTeamId?'selected':''}" data-team="${t.id}" style="--c1:${t.colors[0]};--c2:${t.colors[1]}"><div class="team-bg"></div><h3>${t.name}</h3><p>${t.category} • ${t.tier}</p><p>Orçamento: $${money(t.budget)}</p></button>`).join('');
    this.updateTeamDetails(GameState.settings.selectedTeamId);
  },
  updateTeamDetails(id){
    const t=TEAMS.find(x=>x.id===id); if(!t) return;
    $('#teamDetails').innerHTML=`<h2>${t.name}</h2><p>${t.category} • ${t.tier}</p><p><b>Meta:</b> ${t.target}</p><p><b>Reputação:</b> ${t.reputation}</p>${Object.entries(t.car).map(([k,v])=>`<div class="stat-row"><span>${this.partLabel(k)}</span><div class="bar"><i style="width:${v}%"></i></div><b>${v}</b></div>`).join('')}`;
  },
  refreshLobby(){
    const t=GameState.team || TEAMS.find(x=>x.id===GameState.settings.selectedTeamId); if(!t) return;
    $('#managerNameTop').textContent=`${GameState.manager.first} ${GameState.manager.last}`;
    $('#careerMeta').textContent=`${t.category} • Temporada ${GameState.career.season} • ${GameState.career.completedRaces} corridas`;
    $('#repVal').textContent=Math.round(GameState.career.reputation);
    $('#budgetVal').textContent=money(GameState.career.balance);
    $('#targetVal').textContent=t.target;
    $('#teamNameHero').textContent=t.name; $('#teamTierHero').textContent=`${t.category} • ${t.tier} • ${t.target}`;
    const bg=ASSET_PATHS.backgrounds.teams[t.id] || ASSET_PATHS.backgrounds.lobby_global; setAssetBackground($('#teamHero'), bg);
    this.renderSponsors(); this.renderGarage(); this.renderDrivers(); this.renderStaffFacilities(); this.renderCalendar(); this.renderStandings();
  },
  renderSponsors(){
    $('#sponsorList').innerHTML=SPONSORS.map(s=>`<article class="game-card"><h3>${s.name}</h3><p>${s.target}</p><p>Bônus: $${money(s.bonus)}</p><button class="btn ${GameState.career.sponsorId===s.id?'primary':''}" data-sponsor="${s.id}">${GameState.career.sponsorId===s.id?'Selecionado':'Assinar'}</button></article>`).join('');
  },
  partLabel(k){ return ({aero:'Aerodinâmica',engine:'Motor',chassis:'Chassi',reliability:'Confiabilidade',tyreWear:'Desgaste pneu',pitStop:'Pit stop',fuel:'Combustível',suspension:'Suspensão'})[k] || k; },
  iconForPart(k){ return ({engine:'engine',aero:'aero',chassis:'chassis',reliability:'reliability',tyreWear:'suspension',pitStop:'pit'})[k] || 'engine'; },
  renderGarage(){
    if(!GameState.team) return;
    $('#carStats').innerHTML=Object.entries(GameState.team.car).map(([k,v])=>`<div class="part-card"><div class="part-icon" style="background-image:url('${ASSET_PATHS.icons.car_parts[this.iconForPart(k)]}')"></div><h3>${this.partLabel(k)}</h3><div class="stat-row"><div class="bar"><i style="width:${v}%"></i></div><b>${Math.round(v)}</b></div></div>`).join('');
  },
  renderDrivers(){
    if(!GameState.team) return;
    const drivers=DriverManager.getTeamDrivers(GameState.team.name);
    $('#driverCards').innerHTML=drivers.map(d=>`<article class="driver-card"><div class="driver-face" style="background-image:url('${ASSET_PATHS.drivers[d.id]||''}')">${FLAGS[d.country]||''}</div><div><h3>${d.name}</h3><p>${d.team} • Idade ${d.age}</p><p>Overall ${d.overall} • Potencial ${d.potential}</p><div class="stat-row"><span>Vel.</span><div class="bar"><i style="width:${d.speed}%"></i></div><b>${d.speed}</b></div></div></article>`).join('');
  },
  renderStaffFacilities(){
    $('#staffCards').innerHTML=['Designers','Mecânicos','Estrategistas'].map((n,i)=>`<article class="game-card"><h3>${n}</h3><p>Nível ${i+1}</p><button class="btn">Ver</button></article>`).join('');
    $('#facilityCards').innerHTML=['Sede','Simulador','Rede de fornecedores'].map((n,i)=>`<article class="game-card"><h3>${n}</h3><p>Melhorias ${i}/30</p><button class="btn">Melhorar</button></article>`).join('');
  },
  renderCalendar(){
    $('#calendarList').innerHTML=CALENDAR_2026.map(r=>`<div class="calendar-row"><b>${r.round}</b><span>${r.name}<br><small>${r.location}</small></span><span>${r.date}</span><span>${r.status==='next'?'Próxima':'2026'}</span></div>`).join('');
  },
  renderStandings(){
    CareerManager.initStandings();
    const rows=DRIVERS.filter(d=>d.category==='F1').map(d=>({d,...GameState.standings.drivers[d.id]})).sort((a,b)=>b.points-a.points || b.wins-a.wins || b.podiums-a.podiums);
    $('#standingsTable').innerHTML=`<div class="table-row header"><span>Pos.</span><span>Piloto</span><span>Pontos</span><span>Vitórias</span></div>`+rows.map((r,i)=>`<div class="table-row"><b>${i+1}</b><span>${FLAGS[r.d.country]||''} ${r.d.name}<br><small>${r.d.team}</small></span><b>${r.points}</b><span>${r.wins}</span></div>`).join('');
  },
  renderQualifying(rows){
    $('#qualiStatus').textContent='Grid definido'; $('#btnGoRace').classList.remove('disabled');
    $('#qualiResults').innerHTML=`<div class="table-row header"><span>Pos.</span><span>Piloto</span><span>Equipe</span><span>Tempo</span></div>`+rows.map(r=>`<div class="table-row"><b>${r.position}</b><span>${FLAGS[r.driver.country]||''} ${r.driver.name}</span><span>${r.driver.team}</span><b>${r.lap}</b></div>`).join('');
  },
  renderRaceHud(){
    const s=RaceSimulator.current; if(!s) return;
    $('#lapHud').textContent=`Volta ${Math.min(s.lap,s.laps)}/${s.laps}`; $('#weatherHud').textContent=`${s.weather} • ${s.rain}%`;
    $('#raceLeaderboard').innerHTML='<h3>CORRIDA</h3>'+s.cars.slice().sort((a,b)=>a.position-b.position).map(c=>`<div class="leader-row ${DriverManager.getTeamDrivers(GameState.team.name).some(d=>d.id===c.driver.id)?'player':''}"><b>${c.position}</b><span>${c.driver.name.split(' ').slice(-1)[0]}</span><span>${c.position===1?'Líder':'+'+c.gap}</span></div>`).join('');
    const player=s.cars.find(c=>DriverManager.getTeamDrivers(GameState.team.name).some(d=>d.id===c.driver.id));
    if(player) $('#driverCommand').innerHTML=`<h3>${player.position}º ${player.driver.name}</h3><p>Condição: <b>${Math.round(player.condition)}%</b></p><p>Pneu: <b>${player.tyre}</b> ${Math.round(player.tyreLife)}%</p><p>Combustível: <b>${Math.round(player.fuel)}%</b></p><p>Estratégia: ${s.playerStrategy}</p>`;
  },
  renderResults(results){
    $('#raceResultsTable').innerHTML=`<div class="table-row header"><span>Pos.</span><span>Piloto</span><span>Equipe</span><span>Pneu</span></div>`+results.map(r=>`<div class="table-row"><b>${r.position}</b><span>${FLAGS[r.driver.country]||''} ${r.driver.name}</span><span>${r.driver.team}</span><span>${r.tyre}</span></div>`).join('');
    const player=results.filter(r=>DriverManager.getTeamDrivers(GameState.team.name).some(d=>d.id===r.driver.id));
    $('#teamRaceSummary').innerHTML=player.map(r=>`<p><b>${r.driver.name}</b>: P${r.position}</p>`).join('')+`<p>Saldo atual: <b>$${money(GameState.career.balance)}</b></p><p>Reputação: <b>${GameState.career.reputation}</b></p>`;
    this.renderStandings();
  },
  bind(){
    $('#btnNewGame').onclick=()=>screen('create');
    $('#btnContinue').onclick=()=>{ if(CareerManager.load()) screen('lobby'); else showToast('Nenhum save encontrado'); };
    $('#btnSingleRace').onclick=()=>{ if(!GameState.team){GameState.team=structuredClone(TEAMS.find(t=>t.id==='f2_vale')); GameState.career.teamId='f2_vale';} RaceRenderer.start(); screen('race'); };
    $$('[data-nav]').forEach(b=>b.onclick=()=>screen(b.dataset.nav));
    $('#btnStartCareer').onclick=()=>{ GameState.manager.first=$('#managerFirst').value||'Gestor'; GameState.manager.last=$('#managerLast').value||'Racing'; GameState.manager.country=$('#managerCountry').value; screen('teamSelect'); };
    $('#btnConfirmTeam').onclick=()=>CareerManager.start();
    $('#btnSave').onclick=()=>CareerManager.save();
    $('#btnNextRace').onclick=()=>screen('qualifying');
    $('#btnRunQuali').onclick=()=>this.renderQualifying(RaceSimulator.qualify());
    $('#btnGoRace').onclick=()=>{ if(!GameState.qualifying) return; RaceRenderer.start(); screen('race'); };
    $('#btnPauseRace').onclick=()=>{ const s=RaceSimulator.current; if(s){s.running=!s.running; $('#btnPauseRace').textContent=s.running?'Pausar':'Continuar';} };
    $('#btnFinishRace').onclick=()=>{ const res=RaceSimulator.finishNow(); RaceRenderer.stop(); this.renderResults(res); screen('results'); };
    $('#btnBackLobbyAfterRace').onclick=()=>{ this.refreshLobby(); screen('lobby'); };
    $('#btnDevelopPart').onclick=()=>TeamManager.improveLowest();
    $('#btnPit').onclick=()=>{ const s=RaceSimulator.current; const p=s?.cars.find(c=>DriverManager.getTeamDrivers(GameState.team.name).some(d=>d.id===c.driver.id)); if(p) RaceSimulator.pit(p); };
    $$('.choice').forEach(c=>c.onclick=()=>{ $$('.choice').forEach(x=>x.classList.remove('selected')); c.classList.add('selected'); GameState.manager.mode=c.dataset.mode; });
    $('#avatarRow').onclick=e=>{ const a=e.target.closest('[data-avatar]'); if(!a)return; $$('.avatar').forEach(x=>x.classList.remove('selected')); a.classList.add('selected'); GameState.manager.avatar=a.dataset.avatar; };
    $('#historyGrid').onclick=e=>{ const h=e.target.closest('[data-history]'); if(!h)return; $$('.history-card').forEach(x=>x.classList.remove('selected')); h.classList.add('selected'); GameState.manager.history=h.dataset.history; };
    $('#teamCards').onclick=e=>{ const c=e.target.closest('[data-team]'); if(!c)return; GameState.settings.selectedTeamId=c.dataset.team; this.renderTeamSelect(); };
    $('.side-nav').onclick=e=>{ const b=e.target.closest('[data-tab]'); if(!b)return; this.openTab(b.dataset.tab); };
    document.body.onclick=e=>{ const j=e.target.closest('[data-tab-jump]'); if(j) this.openTab(j.dataset.tabJump); const s=e.target.closest('[data-sponsor]'); if(s){ GameState.career.sponsorId=s.dataset.sponsor; this.renderSponsors(); showToast('Patrocinador selecionado'); } };
    $$('.race-cmd[data-racecmd]').forEach(b=>b.onclick=()=>{ $$('.race-cmd[data-racecmd]').forEach(x=>x.classList.remove('active')); b.classList.add('active'); if(RaceSimulator.current) RaceSimulator.current.playerStrategy=b.dataset.racecmd; });
  },
  openTab(tab){ $$('.side-nav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab)); $$('.tab-view').forEach(v=>v.classList.toggle('active',v.id===`tab_${tab}`)); this.applyBackgrounds(); }
};

const RaceRenderer = {
  scene:null,camera:null,renderer:null,track:null,carMeshes:new Map(),raf:null,points:[],clock:null,
  start(){
    if(!RaceSimulator.current) RaceSimulator.createRaceState();
    this.init3D(); this.clock=new THREE.Clock(); this.loop();
  },
  stop(){ if(this.raf) cancelAnimationFrame(this.raf); this.raf=null; },
  init3D(){
    const canvas=$('#raceCanvas');
    if(this.renderer){ this.renderer.dispose(); this.carMeshes.clear(); }
    this.scene=new THREE.Scene(); this.scene.background=new THREE.Color(0x060913);
    this.camera=new THREE.PerspectiveCamera(45, innerWidth/innerHeight, .1, 1000); this.camera.position.set(0,46,54); this.camera.lookAt(0,0,0);
    this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false}); this.renderer.setSize(innerWidth,innerHeight); this.renderer.setPixelRatio(Math.min(2,devicePixelRatio));
    this.scene.add(new THREE.HemisphereLight(0xffffff,0x111133,1.7)); const dir=new THREE.DirectionalLight(0xffffff,1.6); dir.position.set(20,40,15); this.scene.add(dir);
    this.createTrack(); this.createCars(); addEventListener('resize',()=>{ if(!this.renderer)return; this.camera.aspect=innerWidth/innerHeight; this.camera.updateProjectionMatrix(); this.renderer.setSize(innerWidth,innerHeight); },{once:true});
  },
  createTrack(){
    const g=new THREE.PlaneGeometry(90,62); const m=new THREE.MeshStandardMaterial({color:0x16202c,roughness:.8}); const ground=new THREE.Mesh(g,m); ground.rotation.x=-Math.PI/2; this.scene.add(ground);
    this.points=[[-34,-18],[-22,-25],[-6,-24],[10,-18],[26,-20],[35,-10],[30,6],[14,12],[0,20],[-19,16],[-34,8],[-38,-6]].map(([x,z])=>new THREE.Vector3(x,.08,z));
    const curve=new THREE.CatmullRomCurve3([...this.points,this.points[0]],true,'catmullrom',0.5);
    const tube=new THREE.TubeGeometry(curve,240,3.8,12,true); const asphalt=new THREE.MeshStandardMaterial({color:0x111111,roughness:.65,metalness:.05}); this.track=new THREE.Mesh(tube,asphalt); this.scene.add(this.track);
    const lineGeo=new THREE.TubeGeometry(curve,240,.12,6,true); const lineMat=new THREE.MeshBasicMaterial({color:0xffffff}); const line=new THREE.Mesh(lineGeo,lineMat); line.position.y=.08; this.scene.add(line);
    for(let i=0;i<34;i++){ const p=curve.getPoint(i/34); const palm=this.makePalm(); palm.position.set(p.x+rand(-8,8),0,p.z+rand(-8,8)); this.scene.add(palm); }
    const water=new THREE.Mesh(new THREE.PlaneGeometry(34,62),new THREE.MeshStandardMaterial({color:0x0094b7,roughness:.35,metalness:.1})); water.rotation.x=-Math.PI/2; water.position.x=-54; water.position.y=-.02; this.scene.add(water);
    for(let i=0;i<8;i++){ const stand=new THREE.Mesh(new THREE.BoxGeometry(8,2,3),new THREE.MeshStandardMaterial({color:0x374057})); stand.position.set(rand(12,42),1,rand(-28,22)); this.scene.add(stand); }
  },
  makePalm(){ const group=new THREE.Group(); const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.15,.28,2.6,8),new THREE.MeshStandardMaterial({color:0x6a3d1d})); trunk.position.y=1.3; group.add(trunk); for(let i=0;i<5;i++){ const leaf=new THREE.Mesh(new THREE.BoxGeometry(.18,.05,2.2),new THREE.MeshStandardMaterial({color:0x1f8b3a})); leaf.position.y=2.8; leaf.rotation.y=i*Math.PI*2/5; leaf.rotation.z=.55; group.add(leaf);} return group; },
  createCars(){
    RaceSimulator.current.cars.forEach(c=>{ const mesh=this.makeCar(c.team?.colors || ['#fff','#222']); this.scene.add(mesh); this.carMeshes.set(c.driver.id,mesh); });
  },
  makeCar(colors){
    const group=new THREE.Group(); const primary=new THREE.Color(colors[0]); const secondary=new THREE.Color(colors[1]);
    const bodyMat=new THREE.MeshStandardMaterial({color:primary,roughness:.4,metalness:.25}); const black=new THREE.MeshStandardMaterial({color:0x050505,roughness:.5}); const accent=new THREE.MeshStandardMaterial({color:secondary,roughness:.35,metalness:.2});
    const body=new THREE.Mesh(new THREE.BoxGeometry(1.1,.35,2.8),bodyMat); body.position.y=.45; group.add(body);
    const nose=new THREE.Mesh(new THREE.BoxGeometry(.45,.22,1.6),bodyMat); nose.position.set(0,.42,-1.9); group.add(nose);
    const cockpit=new THREE.Mesh(new THREE.BoxGeometry(.55,.38,.55),black); cockpit.position.set(0,.75,-.15); group.add(cockpit);
    const fw=new THREE.Mesh(new THREE.BoxGeometry(2.0,.12,.35),accent); fw.position.set(0,.3,-2.65); group.add(fw);
    const rw=new THREE.Mesh(new THREE.BoxGeometry(2.0,.25,.32),accent); rw.position.set(0,.74,1.62); group.add(rw);
    [[-.75,.25,-1.15],[.75,.25,-1.15],[-.78,.25,1.05],[.78,.25,1.05]].forEach(p=>{ const w=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.28,16),black); w.rotation.z=Math.PI/2; w.position.set(...p); group.add(w); });
    group.scale.set(.75,.75,.75); return group;
  },
  loop(){
    this.raf=requestAnimationFrame(()=>this.loop()); const dt=Math.min(.05,this.clock.getDelta()); RaceSimulator.step(dt); this.updateCars(); UIManager.renderRaceHud(); this.renderer.render(this.scene,this.camera);
  },
  updateCars(){
    const s=RaceSimulator.current; if(!s) return; const curve=new THREE.CatmullRomCurve3([...this.points,this.points[0]],true,'catmullrom',0.5);
    s.cars.forEach((c,i)=>{ const mesh=this.carMeshes.get(c.driver.id); if(!mesh)return; const t=(c.progress % 1 + i*0.002)%1; const p=curve.getPoint(t); const p2=curve.getPoint((t+0.005)%1); const lane=((i%4)-1.5)*0.75; mesh.position.set(p.x+lane, .55, p.z+lane*.15); mesh.lookAt(p2.x,.55,p2.z); });
  }
};

UIManager.init();
CareerManager.initStandings();

try{ screen.orientation?.lock?.('landscape').catch(()=>{}); }catch(e){}
