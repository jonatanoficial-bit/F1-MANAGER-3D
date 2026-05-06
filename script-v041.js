/*
  Vale Chess 3D Career
  Build: v0.4.1 - 2026-05-06 17:25 BRT
  Mobile-first landscape, GitHub Pages, assets externos via manifesto.
*/
const BUILD={version:'v0.4.1',datetime:'2026-05-06 17:25 BRT',label:'Build v0.4.1 - 2026-05-06 17:25 BRT'};
const SAVE_KEY='vale_chess_3d_career_save_v041';
const LEGACY_SAVE_KEYS=['vale_chess_3d_career_save_v040','vale_chess_3d_career_save_v036','vale_chess_3d_career_save_v035','vale_chess_3d_career_save_v034','vale_chess_3d_career_save_v033','vale_chess_3d_career_save_v032','vale_chess_3d_career_save_v031','vale_chess_3d_career_save_v030','vale_chess_3d_career_save_v029','vale_chess_3d_career_save_v028','vale_chess_3d_career_save_v027','vale_chess_3d_career_save_v026','vale_chess_3d_career_save_v025','vale_chess_3d_career_save_v024','vale_chess_3d_career_save_v023','vale_chess_3d_career_save_v022','vale_chess_3d_career_save_v021','vale_chess_3d_career_save_v020'];
// v0.3.6: camada anti-quebra. Nunca deve impedir o jogo de abrir.
const QA_STATE={errors:[],warnings:[],lastRecovery:null};
function reportIssue(level,msg,err){
  const item={level,msg,time:new Date().toISOString(),detail:err&&(err.stack||err.message||String(err))};
  (level==='error'?QA_STATE.errors:QA_STATE.warnings).push(item);
  console[level==='error'?'error':'warn']('[ValeChess QA]',msg,err||'');
  const hud=document.getElementById('qaStatusPill');
  if(hud){hud.textContent=QA_STATE.errors.length?`QA ${QA_STATE.errors.length} erro(s) recuperado(s)`:'QA OK'; hud.classList.toggle('has-error',!!QA_STATE.errors.length);}
}
function safeRun(label,fn,fallback){try{return fn();}catch(e){reportIssue('error',label,e); if(typeof fallback==='function')return fallback(e); return fallback;}}
window.addEventListener('error',e=>reportIssue('error','Erro global capturado',e.error||e.message));
window.addEventListener('unhandledrejection',e=>reportIssue('error','Promise rejeitada capturada',e.reason));
const ASSET={
  cover:'assets/backgrounds/lobby/lobby_main_16x9.png', lobby:'assets/backgrounds/lobby/lobby_main_16x9.png', profile:'assets/backgrounds/profile/profile_creation_16x9.png', career:'assets/backgrounds/career/career_dashboard_16x9.png', victory:'assets/backgrounds/results/victory_16x9.png', defeat:'assets/backgrounds/results/defeat_16x9.png',
  card:'assets/ui/cards/player_card_horizontal.png',
  avatars:['assets/avatars/player/avatar_01.png','assets/avatars/player/avatar_02.png','assets/avatars/player/avatar_03.png','assets/avatars/player/avatar_04.png','assets/avatars/player/avatar_05.png','assets/avatars/player/avatar_06.png','assets/avatars/player/avatar_07.png','assets/avatars/player/avatar_08.png'],
  flags:{Brasil:'assets/flags/world/brazil.png','Estados Unidos':'assets/flags/world/usa.png',Mexico:'assets/flags/world/mexico.png',Espanha:'assets/flags/world/spain.png',China:'assets/flags/world/china.png',Japao:'assets/flags/world/japan.png',Italia:'assets/flags/world/italy.png','Reino Unido':'assets/flags/world/uk.png',Australia:'assets/flags/world/australia.png',Canada:'assets/flags/world/canada.png',Belgica:'assets/flags/world/belgium.png'},
  logos:{amateur:'assets/competitions/logos/amateur_league_logo.png',professional:'assets/competitions/logos/professional_league_logo.png',continental:'assets/competitions/logos/continental_logo.png',world:'assets/competitions/logos/world_championship_logo.png'},
  trophies:{amateur:'assets/competitions/trophies/amateur_trophy.png',professional:'assets/competitions/trophies/professional_trophy.png',continental:'assets/competitions/trophies/continental_trophy.png',world:'assets/competitions/trophies/world_trophy.png'}
};
const COUNTRY_DATA=[["Afeganistão", "Asia", "afghanistan"], ["África do Sul", "Africa", "south_africa"], ["Albânia", "Europa", "albania"], ["Alemanha", "Europa", "germany"], ["Andorra", "Europa", "andorra"], ["Angola", "Africa", "angola"], ["Antígua e Barbuda", "America", "antigua_and_barbuda"], ["Arábia Saudita", "Asia", "saudi_arabia"], ["Argélia", "Africa", "algeria"], ["Argentina", "America", "argentina"], ["Armênia", "Asia", "armenia"], ["Austrália", "Oceania", "australia"], ["Áustria", "Europa", "austria"], ["Azerbaijão", "Asia", "azerbaijan"], ["Bahamas", "America", "bahamas"], ["Bahrein", "Asia", "bahrain"], ["Bangladesh", "Asia", "bangladesh"], ["Barbados", "America", "barbados"], ["Belarus", "Europa", "belarus"], ["Bélgica", "Europa", "belgium"], ["Belize", "America", "belize"], ["Benin", "Africa", "benin"], ["Butão", "Asia", "bhutan"], ["Bolívia", "America", "bolivia"], ["Bósnia e Herzegovina", "Europa", "bosnia_and_herzegovina"], ["Botsuana", "Africa", "botswana"], ["Brasil", "America", "brazil"], ["Brunei", "Asia", "brunei"], ["Bulgária", "Europa", "bulgaria"], ["Burkina Faso", "Africa", "burkina_faso"], ["Burundi", "Africa", "burundi"], ["Cabo Verde", "Africa", "cape_verde"], ["Camboja", "Asia", "cambodia"], ["Camarões", "Africa", "cameroon"], ["Canadá", "America", "canada"], ["Catar", "Asia", "qatar"], ["Cazaquistão", "Asia", "kazakhstan"], ["Chade", "Africa", "chad"], ["Chile", "America", "chile"], ["China", "Asia", "china"], ["Chipre", "Europa", "cyprus"], ["Colômbia", "America", "colombia"], ["Comores", "Africa", "comoros"], ["Congo", "Africa", "congo"], ["Coreia do Norte", "Asia", "north_korea"], ["Coreia do Sul", "Asia", "south_korea"], ["Costa do Marfim", "Africa", "ivory_coast"], ["Costa Rica", "America", "costa_rica"], ["Croácia", "Europa", "croatia"], ["Cuba", "America", "cuba"], ["Dinamarca", "Europa", "denmark"], ["Djibuti", "Africa", "djibouti"], ["Dominica", "America", "dominica"], ["Egito", "Africa", "egypt"], ["El Salvador", "America", "el_salvador"], ["Emirados Árabes Unidos", "Asia", "uae"], ["Equador", "America", "ecuador"], ["Eritreia", "Africa", "eritrea"], ["Eslováquia", "Europa", "slovakia"], ["Eslovênia", "Europa", "slovenia"], ["Espanha", "Europa", "spain"], ["Estados Unidos", "America", "usa"], ["Estônia", "Europa", "estonia"], ["Etiópia", "Africa", "ethiopia"], ["Fiji", "Oceania", "fiji"], ["Filipinas", "Asia", "philippines"], ["Finlândia", "Europa", "finland"], ["França", "Europa", "france"], ["Gabão", "Africa", "gabon"], ["Gâmbia", "Africa", "gambia"], ["Gana", "Africa", "ghana"], ["Geórgia", "Asia", "georgia"], ["Granada", "America", "grenada"], ["Grécia", "Europa", "greece"], ["Guatemala", "America", "guatemala"], ["Guiana", "America", "guyana"], ["Guiné", "Africa", "guinea"], ["Guiné Equatorial", "Africa", "equatorial_guinea"], ["Guiné-Bissau", "Africa", "guinea_bissau"], ["Haiti", "America", "haiti"], ["Honduras", "America", "honduras"], ["Hungria", "Europa", "hungary"], ["Iêmen", "Asia", "yemen"], ["Ilhas Marshall", "Oceania", "marshall_islands"], ["Ilhas Salomão", "Oceania", "solomon_islands"], ["Índia", "Asia", "india"], ["Indonésia", "Asia", "indonesia"], ["Irã", "Asia", "iran"], ["Iraque", "Asia", "iraq"], ["Irlanda", "Europa", "ireland"], ["Islândia", "Europa", "iceland"], ["Israel", "Asia", "israel"], ["Itália", "Europa", "italy"], ["Jamaica", "America", "jamaica"], ["Japão", "Asia", "japan"], ["Jordânia", "Asia", "jordan"], ["Kiribati", "Oceania", "kiribati"], ["Kosovo", "Europa", "kosovo"], ["Kuwait", "Asia", "kuwait"], ["Laos", "Asia", "laos"], ["Lesoto", "Africa", "lesotho"], ["Letônia", "Europa", "latvia"], ["Líbano", "Asia", "lebanon"], ["Libéria", "Africa", "liberia"], ["Líbia", "Africa", "libya"], ["Liechtenstein", "Europa", "liechtenstein"], ["Lituânia", "Europa", "lithuania"], ["Luxemburgo", "Europa", "luxembourg"], ["Macedônia do Norte", "Europa", "north_macedonia"], ["Madagascar", "Africa", "madagascar"], ["Malásia", "Asia", "malaysia"], ["Malawi", "Africa", "malawi"], ["Maldivas", "Asia", "maldives"], ["Mali", "Africa", "mali"], ["Malta", "Europa", "malta"], ["Marrocos", "Africa", "morocco"], ["Maurício", "Africa", "mauritius"], ["Mauritânia", "Africa", "mauritania"], ["México", "America", "mexico"], ["Micronésia", "Oceania", "micronesia"], ["Moçambique", "Africa", "mozambique"], ["Moldávia", "Europa", "moldova"], ["Mônaco", "Europa", "monaco"], ["Mongólia", "Asia", "mongolia"], ["Montenegro", "Europa", "montenegro"], ["Myanmar", "Asia", "myanmar"], ["Namíbia", "Africa", "namibia"], ["Nauru", "Oceania", "nauru"], ["Nepal", "Asia", "nepal"], ["Nicarágua", "America", "nicaragua"], ["Níger", "Africa", "niger"], ["Nigéria", "Africa", "nigeria"], ["Noruega", "Europa", "norway"], ["Nova Zelândia", "Oceania", "new_zealand"], ["Omã", "Asia", "oman"], ["Países Baixos", "Europa", "netherlands"], ["Palau", "Oceania", "palau"], ["Palestina", "Asia", "palestine"], ["Panamá", "America", "panama"], ["Papua-Nova Guiné", "Oceania", "papua_new_guinea"], ["Paquistão", "Asia", "pakistan"], ["Paraguai", "America", "paraguay"], ["Peru", "America", "peru"], ["Polônia", "Europa", "poland"], ["Portugal", "Europa", "portugal"], ["Quênia", "Africa", "kenya"], ["Quirguistão", "Asia", "kyrgyzstan"], ["Reino Unido", "Europa", "uk"], ["República Centro-Africana", "Africa", "central_african_republic"], ["República Democrática do Congo", "Africa", "democratic_republic_of_congo"], ["República Dominicana", "America", "dominican_republic"], ["República Tcheca", "Europa", "czech_republic"], ["Romênia", "Europa", "romania"], ["Ruanda", "Africa", "rwanda"], ["Rússia", "Europa", "russia"], ["Samoa", "Oceania", "samoa"], ["San Marino", "Europa", "san_marino"], ["Santa Lúcia", "America", "saint_lucia"], ["São Cristóvão e Névis", "America", "saint_kitts_and_nevis"], ["São Tomé e Príncipe", "Africa", "sao_tome_and_principe"], ["São Vicente e Granadinas", "America", "saint_vincent_and_the_grenadines"], ["Seicheles", "Africa", "seychelles"], ["Senegal", "Africa", "senegal"], ["Serra Leoa", "Africa", "sierra_leone"], ["Sérvia", "Europa", "serbia"], ["Singapura", "Asia", "singapore"], ["Síria", "Asia", "syria"], ["Somália", "Africa", "somalia"], ["Sri Lanka", "Asia", "sri_lanka"], ["Suazilândia", "Africa", "eswatini"], ["Sudão", "Africa", "sudan"], ["Sudão do Sul", "Africa", "south_sudan"], ["Suécia", "Europa", "sweden"], ["Suíça", "Europa", "switzerland"], ["Suriname", "America", "suriname"], ["Tailândia", "Asia", "thailand"], ["Taiwan", "Asia", "taiwan"], ["Tajiquistão", "Asia", "tajikistan"], ["Tanzânia", "Africa", "tanzania"], ["Timor-Leste", "Asia", "timor_leste"], ["Togo", "Africa", "togo"], ["Tonga", "Oceania", "tonga"], ["Trinidad e Tobago", "America", "trinidad_and_tobago"], ["Tunísia", "Africa", "tunisia"], ["Turcomenistão", "Asia", "turkmenistan"], ["Turquia", "Asia", "turkey"], ["Tuvalu", "Oceania", "tuvalu"], ["Ucrânia", "Europa", "ukraine"], ["Uganda", "Africa", "uganda"], ["Uruguai", "America", "uruguay"], ["Uzbequistão", "Asia", "uzbekistan"], ["Vanuatu", "Oceania", "vanuatu"], ["Vaticano", "Europa", "vatican"], ["Venezuela", "America", "venezuela"], ["Vietnã", "Asia", "vietnam"], ["Zâmbia", "Africa", "zambia"], ["Zimbábue", "Africa", "zimbabwe"]];
const COUNTRY_CODE={"Afeganistão":"AF","África do Sul":"ZA","Albânia":"AL","Alemanha":"DE","Andorra":"AD","Angola":"AO","Antígua e Barbuda":"AG","Arábia Saudita":"SA","Argélia":"DZ","Argentina":"AR","Armênia":"AM","Austrália":"AU","Áustria":"AT","Azerbaijão":"AZ","Bahamas":"BS","Bahrein":"BH","Bangladesh":"BD","Barbados":"BB","Belarus":"BY","Bélgica":"BE","Belize":"BZ","Benin":"BJ","Butão":"BT","Bolívia":"BO","Bósnia e Herzegovina":"BA","Botsuana":"BW","Brasil":"BR","Brunei":"BN","Bulgária":"BG","Burkina Faso":"BF","Burundi":"BI","Cabo Verde":"CV","Camboja":"KH","Camarões":"CM","Canadá":"CA","Catar":"QA","Cazaquistão":"KZ","Chade":"TD","Chile":"CL","China":"CN","Chipre":"CY","Colômbia":"CO","Comores":"KM","Congo":"CG","Coreia do Norte":"KP","Coreia do Sul":"KR","Costa do Marfim":"CI","Costa Rica":"CR","Croácia":"HR","Cuba":"CU","Dinamarca":"DK","Djibuti":"DJ","Dominica":"DM","Egito":"EG","El Salvador":"SV","Emirados Árabes Unidos":"AE","Equador":"EC","Eritreia":"ER","Eslováquia":"SK","Eslovênia":"SI","Espanha":"ES","Estados Unidos":"US","Estônia":"EE","Etiópia":"ET","Fiji":"FJ","Filipinas":"PH","Finlândia":"FI","França":"FR","Gabão":"GA","Gâmbia":"GM","Gana":"GH","Geórgia":"GE","Granada":"GD","Grécia":"GR","Guatemala":"GT","Guiana":"GY","Guiné":"GN","Guiné Equatorial":"GQ","Guiné-Bissau":"GW","Haiti":"HT","Honduras":"HN","Hungria":"HU","Iêmen":"YE","Ilhas Marshall":"MH","Ilhas Salomão":"SB","Índia":"IN","Indonésia":"ID","Irã":"IR","Iraque":"IQ","Irlanda":"IE","Islândia":"IS","Israel":"IL","Itália":"IT","Jamaica":"JM","Japão":"JP","Jordânia":"JO","Kiribati":"KI","Kosovo":"XK","Kuwait":"KW","Laos":"LA","Lesoto":"LS","Letônia":"LV","Líbano":"LB","Libéria":"LR","Líbia":"LY","Liechtenstein":"LI","Lituânia":"LT","Luxemburgo":"LU","Macedônia do Norte":"MK","Madagascar":"MG","Malásia":"MY","Malawi":"MW","Maldivas":"MV","Mali":"ML","Malta":"MT","Marrocos":"MA","Maurício":"MU","Mauritânia":"MR","México":"MX","Micronésia":"FM","Moçambique":"MZ","Moldávia":"MD","Mônaco":"MC","Mongólia":"MN","Montenegro":"ME","Myanmar":"MM","Namíbia":"NA","Nauru":"NR","Nepal":"NP","Nicarágua":"NI","Níger":"NE","Nigéria":"NG","Noruega":"NO","Nova Zelândia":"NZ","Omã":"OM","Países Baixos":"NL","Palau":"PW","Palestina":"PS","Panamá":"PA","Papua-Nova Guiné":"PG","Paquistão":"PK","Paraguai":"PY","Peru":"PE","Polônia":"PL","Portugal":"PT","Quênia":"KE","Quirguistão":"KG","Reino Unido":"GB","República Centro-Africana":"CF","República Democrática do Congo":"CD","República Dominicana":"DO","República Tcheca":"CZ","Romênia":"RO","Ruanda":"RW","Rússia":"RU","Samoa":"WS","San Marino":"SM","Santa Lúcia":"LC","São Cristóvão e Névis":"KN","São Tomé e Príncipe":"ST","São Vicente e Granadinas":"VC","Seicheles":"SC","Senegal":"SN","Serra Leoa":"SL","Sérvia":"RS","Singapura":"SG","Síria":"SY","Somália":"SO","Sri Lanka":"LK","Suazilândia":"SZ","Sudão":"SD","Sudão do Sul":"SS","Suécia":"SE","Suíça":"CH","Suriname":"SR","Tailândia":"TH","Taiwan":"TW","Tajiquistão":"TJ","Tanzânia":"TZ","Timor-Leste":"TL","Togo":"TG","Tonga":"TO","Trinidad e Tobago":"TT","Tunísia":"TN","Turcomenistão":"TM","Turquia":"TR","Tuvalu":"TV","Ucrânia":"UA","Uganda":"UG","Uruguai":"UY","Uzbequistão":"UZ","Vanuatu":"VU","Vaticano":"VA","Venezuela":"VE","Vietnã":"VN","Zâmbia":"ZM","Zimbábue":"ZW"};
function normalizeAssetSlug(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'')}
function flagPathsFor(name,slug){const base=slug||normalizeAssetSlug(name); const code=(COUNTRY_CODE[name]||'').toLowerCase(); const hyphen=base.replace(/_/g,'-'); const compact=base.replace(/_/g,''); const known={Brasil:'brazil','Estados Unidos':'usa','Reino Unido':'uk','Emirados Árabes Unidos':'uae','Arábia Saudita':'saudi_arabia','Países Baixos':'netherlands','Bélgica':'belgium','Canadá':'canada','China':'china','Japão':'japan','México':'mexico','Espanha':'spain','Itália':'italy','Austrália':'australia','Bahrein':'bahrain','Hungria':'hungary','Mônaco':'monaco','Catar':'qatar','Singapura':'singapore'}; const first=known[name]||base; const names=[first,base,hyphen,compact,code].filter(Boolean); const exts=['png','webp','jpg','jpeg','svg']; const roots=['assets/flags/world','assets/flags','assets/flags/countries','assets/flags/flat']; const paths=[]; roots.forEach(root=>names.forEach(n=>exts.forEach(ext=>paths.push(`${root}/${n}.${ext}`)))); return [...new Set(paths)]}
const COUNTRIES=COUNTRY_DATA.map(([name,continent,slug])=>({name,continent,slug,flag:flagPathsFor(name,slug)[0],flagCandidates:flagPathsFor(name,slug)}));
const TOURNAMENTS=[
 {id:'amateur',name:'Liga Nacional Amadora',scope:'Divisão local do seu país',geo:'national',min:0,prize:55,rep:35,aiRange:[0.14,0.36],ratingRange:[650,890],logo:ASSET.logos.amateur,trophy:ASSET.trophies.amateur,bg:ASSET.career},
 {id:'professional',name:'Liga Nacional Profissional',scope:'Promoção para circuito profissional',geo:'national',min:900,prize:85,rep:55,aiRange:[0.36,0.58],ratingRange:[900,1120],logo:ASSET.logos.professional,trophy:ASSET.trophies.professional,bg:ASSET.career},
 {id:'continental',name:'Campeonato Continental',scope:'Rivais do mesmo continente',geo:'continental',min:1080,prize:120,rep:75,aiRange:[0.58,0.78],ratingRange:[1120,1380],logo:ASSET.logos.continental,trophy:ASSET.trophies.continental,bg:ASSET.career},
 {id:'world',name:'Campeonato Mundial',scope:'Elite global do xadrez',geo:'world',min:1320,prize:180,rep:110,aiRange:[0.78,0.94],ratingRange:[1380,1680],logo:ASSET.logos.world,trophy:ASSET.trophies.world,bg:ASSET.career}
];
const OPPONENTS=[
 ['Rafael Torres','Brasil',790,'amateur'],['Ana Costa','Brasil',850,'amateur'],['Carlos Vega','Mexico',920,'professional'],['Sofia Miller','Estados Unidos',1040,'professional'],['Isabel Rojas','Espanha',1140,'continental'],['Aiko Tanaka','Japao',1280,'continental'],['Chen Wei','China',1440,'world'],['Oliver Smith','Reino Unido',1570,'world'],['Elena Rossi','Italia',1390,'world']
].map((o,i)=>({name:o[0],country:o[1],rating:o[2],tier:o[3],avatar:ASSET.avatars[i%ASSET.avatars.length],flag:ASSET.flags[o[1]]||''}));
const $=id=>document.getElementById(id);
function safeText(id,text){const el=$(id); if(el) el.textContent=text;}
function bindClick(id,fn){const el=$(id); if(el) el.addEventListener('click',fn); else console.warn('[ValeChess] Elemento nao encontrado:',id);}
let save=null, activeMode='single', selectedAvatar=0, selectedCountry='Brasil', chess=null, selectedSq=null, legal=[], pieces=new Map(), squares=new Map(), highlights=[], renderer,scene,camera,raycaster,pointer,boardGroup,pieceGroup,highlightGroup,environmentGroup,autoRotate=false,currentTournament=TOURNAMENTS[0],currentOpponent=OPPONENTS[0],playerColor='w',aiBusy=false,aiBusyStarted=0,moveHistory=[],resultShown=false,aiWatchdogStarted=false,currentSeasonContext=null;
let cameraOrbit={radius:10.9,theta:.62,phi:.92},dragState={active:false,moved:false,startX:0,startY:0,lastX:0,lastY:0,pointerId:null};
const GameState={gameId:null,createGame(){this.gameId='future-'+Date.now(); console.log('[Firebase futuro] createGame cria sala remota com FEN, jogadores e status.'); return this.gameId},joinGame(gameId){this.gameId=gameId; console.log('[Firebase futuro] joinGame:',gameId)},sendMove(move){console.log('[Firebase futuro] sendMove gravaria jogada e FEN:',move)},onGameUpdate(callback){console.log('[Firebase futuro] onGameUpdate escutaria sala.'); this.callback=callback}}; window.GameState=GameState;
function init(){ safeText('buildInfo',BUILD.label); installQaPill(); runStartupChecks(); hydrateProfile(); bind(); load(); repairSave(); startAiWatchdog(); const cb=$('continueBtn'); if(save){show('coverScreen'); if(cb) cb.disabled=false}else{if(cb) cb.disabled=true; show('coverScreen')} }
function bind(){document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{show(b.dataset.go); if(b.dataset.go==='lobbyScreen') renderLobby(); if(b.dataset.go==='careerScreen') renderCareer();})); bindClick('newGameBtn',()=>{tryEnterFullscreen(); save=null; localStorage.removeItem(SAVE_KEY); show('modeScreen')}); bindClick('continueBtn',()=>{load(); activeMode=save?.mode||'single'; show('lobbyScreen'); renderLobby()}); document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{tryEnterFullscreen(); selectMode(b.dataset.mode)})); bindClick('saveProfileBtn',saveProfile); bindClick('careerBtn',()=>{tryEnterFullscreen(); show(activeMode==='online'?'onlineLobbyScreen':'careerScreen'); if(activeMode!=='online') renderCareer()}); bindClick('quickMatchBtn',()=>{tryEnterFullscreen(); startMatch(TOURNAMENTS[0], activeMode)}); bindClick('resetSaveBtn',()=>{if(confirm('Reiniciar perfil e progresso?')){localStorage.removeItem(SAVE_KEY); location.reload()}}); bindClick('backFromGameBtn',()=>{show('lobbyScreen'); renderLobby()}); bindClick('resetGameBtn',()=>startMatch(currentTournament, activeMode)); bindClick('rotateCameraBtn',()=>autoRotate=!autoRotate); bindClick('onlinePreviewBtn',()=>startMatch(TOURNAMENTS[0],'online-preview')); window.addEventListener('resize',resizeRenderer)}
function selectMode(mode){activeMode=mode; if(save?.profile){save.mode=mode; persist(); if(mode==='online') show('onlineLobbyScreen'); else {show('lobbyScreen'); renderLobby();}} else show('profileScreen')}
function hydrateProfile(){
  const c=$('playerCountry');
  const search=$('countrySearch');
  const count=$('countryCount');
  function fillCountries(filter=''){
    const q=normalizeAssetSlug(filter).replaceAll('_',' ');
    const list=COUNTRIES.filter(x=>!q||normalizeAssetSlug(x.name).replaceAll('_',' ').includes(q)||normalizeAssetSlug(x.continent).includes(q));
    c.innerHTML=list.map(x=>`<option value="${x.name}">${x.name} • ${x.continent}</option>`).join('');
    if(list.some(x=>x.name===selectedCountry)) c.value=selectedCountry;
    else if(list[0]){c.value=list[0].name; selectedCountry=list[0].name;}
    if(count) count.textContent=`${list.length} de ${COUNTRIES.length} países disponíveis. Role a lista ou pesquise pelo nome.`;
  }
  fillCountries('');
  if(search){search.value=''; search.oninput=()=>fillCountries(search.value);}
  c.onchange=()=>selectedCountry=c.value;
  const grid=$('avatarGrid'); grid.innerHTML=''; ASSET.avatars.forEach((src,i)=>{const b=document.createElement('button'); b.className='avatar-option'+(i===0?' active':''); b.innerHTML=`<img src="${src}" onerror="this.outerHTML='<span class=avatar-fallback>♟</span>'">`; b.onclick=()=>{selectedAvatar=i; document.querySelectorAll('.avatar-option').forEach(x=>x.classList.remove('active')); b.classList.add('active')}; grid.appendChild(b)})
}
function installQaPill(){
  const top=document.querySelector('.topbar'); if(!top||document.getElementById('qaStatusPill')) return;
  const pill=document.createElement('div'); pill.id='qaStatusPill'; pill.className='qa-status-pill'; pill.textContent='QA OK'; top.appendChild(pill);
}
function runStartupChecks(){
  const required=['app','buildInfo','coverScreen','modeScreen','profileScreen','lobbyScreen','careerScreen','gameScreen','resultScreen','gameCanvas'];
  required.forEach(id=>{if(!document.getElementById(id)) reportIssue('error',`Elemento obrigatório ausente: ${id}`);});
  if(!window.THREE) reportIssue('warning','Three.js ainda nao carregou; fallback 2D sera usado se necessario.');
  if(typeof Chess==='undefined') reportIssue('error','Motor Chess ausente. Verifique assets/chess-local.js.');
}
function repairSave(){
  if(!save) return;
  save.mode=save.mode||'single';
  save.profile=save.profile||{name:'Jogador',country:'Brasil',avatar:0};
  if(!countryObj(save.profile.country)) save.profile.country='Brasil';
  save.profile.name=(save.profile.name||'Jogador').toString().slice(0,18);
  save.profile.avatar=Number.isFinite(+save.profile.avatar)?+save.profile.avatar:0;
  const c=save.career||{};
  save.career={rating:Number.isFinite(+c.rating)?+c.rating:800,money:Number.isFinite(+c.money)?+c.money:100,reputation:Number.isFinite(+c.reputation)?+c.reputation:0,wins:Number.isFinite(+c.wins)?+c.wins:0,losses:Number.isFinite(+c.losses)?+c.losses:0,draws:Number.isFinite(+c.draws)?+c.draws:0,titles:Array.isArray(c.titles)?c.titles:[],mission:c.mission||'Vença 2 partidas na Liga Amadora para ganhar reputação.',seasons:(c.seasons&&typeof c.seasons==='object')?c.seasons:{}};
  save.build=BUILD.label;
}
function load(){safeRun('Falha ao carregar save',()=>{save=JSON.parse(localStorage.getItem(SAVE_KEY)||'null'); if(!save){for(const k of LEGACY_SAVE_KEYS){const old=localStorage.getItem(k); if(old){save=JSON.parse(old); repairSave(); localStorage.setItem(SAVE_KEY,JSON.stringify(save)); break;}}}},()=>{save=null});}
function persist(){safeRun('Falha ao salvar progresso',()=>{if(save){save.build=BUILD.label; localStorage.setItem(SAVE_KEY,JSON.stringify(save)); localStorage.setItem(SAVE_KEY+'_backup',JSON.stringify({...save,backupAt:new Date().toISOString()}));}})}
function defaultSave(name,country,avatar){return{build:BUILD.label,mode:activeMode,profile:{name,country,avatar},career:{rating:800,money:100,reputation:0,wins:0,losses:0,draws:0,titles:[],mission:'Vença 2 partidas na Liga Amadora para ganhar reputação.',seasons:{}}}}
function saveProfile(){safeRun('Falha ao criar perfil',()=>{const name=($('playerName').value||'Jogador').trim().slice(0,18); save=defaultSave(name,selectedCountry,selectedAvatar); repairSave(); persist(); show('lobbyScreen'); renderLobby();});}
function show(id){safeRun(`Falha ao abrir tela ${id}`,()=>{const target=$(id); if(!target){reportIssue('error',`Tela inexistente: ${id}`); return;} document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); target.classList.add('active'); if(id==='gameScreen') setTimeout(resizeRenderer,60);});}
function flagCode(name){return (COUNTRY_CODE[name]||'--').toUpperCase()}
function flagEmoji(name){const code=flagCode(name); if(!code||code.length!==2||code==='--')return '🏳️'; return [...code].map(c=>String.fromCodePoint(127397+c.charCodeAt(0))).join('')}
function cycleImageFallback(el){const list=(el.dataset.fallbacks||'').split('|').filter(Boolean); const i=Number(el.dataset.fallbackIndex||0); if(i<list.length){el.dataset.fallbackIndex=String(i+1); el.src=list[i]; return;} const code=el.dataset.code||''; if(code){const span=document.createElement('span'); span.className=(el.className||'')+' flag-code'; span.textContent=code; span.title=el.alt||'Bandeira'; el.replaceWith(span); return;} el.style.display='none'; const fb=el.nextElementSibling; if(fb&&fb.classList.contains('fallback-avatar')) fb.style.display='grid';}
function img(src,cls='',alt=''){return `<img class="${cls}" src="${src}" alt="${alt}" onerror="cycleImageFallback(this)">`}
function flagImg(countryName,cls='flag-img'){const c=countryObj(countryName); const [first,...rest]=c.flagCandidates||[c.flag]; return `<img class="${cls}" src="${first}" alt="Bandeira ${c.name}" data-code="${flagCode(c.name)}" data-fallbacks="${rest.join('|')}" onerror="cycleImageFallback(this)">`}
function countryObj(name){return COUNTRIES.find(c=>c.name===name)||COUNTRIES.find(c=>c.name==='Brasil')||COUNTRIES[0]}

// Build v0.4.1 - rankings offline nacional, continental e mundial.
function rankScore(car){return (car?.rating||800)+(car?.reputation||0)*2+(car?.titles?.length||0)*45+(car?.wins||0)*7+(car?.draws||0)*2-(car?.losses||0)*3}
function generateRankingPool(scope){
  const p=save?.profile||{name:'Jogador',country:'Brasil'};
  const car=save?.career||{rating:800,reputation:0,titles:[],wins:0,draws:0,losses:0};
  const pc=countryObj(p.country);
  const baseCountries=scope==='national'?[pc]:(scope==='continental'?COUNTRIES.filter(c=>c.continent===pc.continent):COUNTRIES);
  const player={id:'player',name:p.name,country:p.country,continent:pc.continent,score:rankScore(car),rating:car.rating,player:true};
  const rows=[player];
  const rng=seededRand(seedFromText(`${p.country}-${scope}-ranking-v041`));
  const size=scope==='national'?24:(scope==='continental'?40:64);
  for(let i=0;i<size;i++){
    const c=baseCountries[Math.floor(rng()*baseCountries.length)]||pc;
    const pool=COUNTRY_NAME_POOLS[c.name]||NAME_POOLS[c.continent]||NAME_POOLS.Europa;
    const name=`${pick(pool.first)} ${pick(pool.last)}`;
    const tier=scope==='national'?760:(scope==='continental'?920:1080);
    const spread=scope==='national'?420:(scope==='continental'?600:780);
    const rating=Math.round(tier+rng()*spread+(i%7)*8);
    const score=rating+Math.round(rng()*220)+(scope==='world'?120:0);
    rows.push({id:`${scope}-${i}`,name,country:c.name,continent:c.continent,score,rating,player:false});
  }
  return rows.sort((a,b)=>b.score-a.score || b.rating-a.rating || a.name.localeCompare(b.name)).map((r,i)=>({...r,rank:i+1}));
}
function currentRanks(){
  const national=generateRankingPool('national');
  const continental=generateRankingPool('continental');
  const world=generateRankingPool('world');
  return {national:national.find(r=>r.player)?.rank||national.length,continental:continental.find(r=>r.player)?.rank||continental.length,world:world.find(r=>r.player)?.rank||world.length};
}
function rankingMiniHtml(){
  const r=currentRanks(); const pc=countryObj(save.profile.country);
  return `<div class="ranking-panel"><div class="ranking-card"><span>Ranking nacional</span><strong>#${r.national}</strong><small>${save.profile.country}</small></div><div class="ranking-card"><span>Ranking continental</span><strong>#${r.continental}</strong><small>${continentLabel(pc.continent)}</small></div><div class="ranking-card"><span>Ranking mundial</span><strong>#${r.world}</strong><small>Global</small></div></div>`;
}
function rankingTableHtml(scope){
  const rows=generateRankingPool(scope).slice(0,6);
  return `<div class="ranking-table"><h4>${scope==='national'?'Top nacional':scope==='continental'?'Top continental':'Top mundial'}</h4>${rows.map(r=>`<div class="rank-row ${r.player?'me':''}"><span>#${r.rank}</span><strong>${r.name}</strong><small>${flagImg(r.country,'tiny-flag')} ${r.country}</small><b>${r.rating}</b></div>`).join('')}</div>`;
}

function renderLobby(){if(!save)return; const p=save.profile,c=countryObj(p.country),car=save.career; const total=car.wins+car.losses+(car.draws||0); const winRate=total?Math.round((car.wins/total)*100):0; const level=car.rating>=1400?'Mestre mundial':car.rating>=1150?'Profissional':car.rating>=950?'Competidor nacional':'Amador em evolução'; $('playerCard').innerHTML=`<div class="avatar-stack">${img(ASSET.avatars[p.avatar]||ASSET.avatars[0],'','avatar')}<div class="fallback-avatar">♟</div></div><div class="player-info"><span class="brand-kicker">${activeMode.toUpperCase()}</span><h3>${p.name}</h3><div class="country-chip">${flagImg(p.country,'chip-flag')}<span>${p.country}</span></div><p>${c.continent} • ${level}</p><p>Rating ${car.rating} • Reputação ${car.reputation} • Moedas ${car.money}</p></div>`; const fb=$('playerCard').querySelector('.fallback-avatar'); if(fb) fb.style.display='none'; $('lobbyTitle').textContent=`Olá, ${p.name}`; $('lobbyText').textContent=activeMode==='single'?'Entre no modo carreira, conquiste pontos, suba de divisão e avance dos torneios nacionais até o campeonato mundial.':activeMode==='duo'?'Modo local para dois jogadores no mesmo dispositivo. Um joga com as brancas e o outro com as pretas.': 'Modo online preparado para Firebase, ranking global, missões e desafios futuros.'; $('modeNotice').textContent=activeMode==='single'?car.mission: activeMode==='duo'?'Duo Player: ambos jogam no mesmo aparelho, sem IA.':'Online: estrutura pronta, aguardando Firebase.'; $('careerStats').innerHTML=`<div class="stat country-stat"><span class="stat-country-head">${flagImg(p.country,'stat-flag')}</span><strong>${p.country}</strong>País escolhido</div><div class=stat><strong>${c.continent}</strong>Continente</div><div class=stat><strong>${car.rating}</strong>Rating</div><div class=stat><strong>${car.wins}</strong>Vitórias</div><div class=stat><strong>${car.losses}</strong>Derrotas</div><div class=stat><strong>${car.draws||0}</strong>Empates</div><div class=stat><strong>${winRate}%</strong>Aproveitamento</div><div class=stat><strong>${car.money}</strong>Moedas</div><div class=stat><strong>${car.reputation}</strong>Reputação</div><div class=stat><strong>${car.titles.length}</strong>Títulos</div><div class=stat><strong>${COUNTRIES.length}</strong>Países na base</div>`}




function tryEnterFullscreen(){
  const el=document.documentElement;
  const isSmall=Math.min(window.innerWidth,window.innerHeight)<=900;
  if(!isSmall && !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) return;
  try{
    if(!document.fullscreenElement && el.requestFullscreen){ el.requestFullscreen().catch(()=>{}); }
    if(screen.orientation && screen.orientation.lock){ screen.orientation.lock('landscape').catch(()=>{}); }
  }catch(e){ console.log('[ValeChess] Fullscreen/landscape nao suportado neste navegador.', e); }
}
function continentLabel(continent){return {America:'América',Asia:'Ásia',Africa:'África',Europa:'Europa',Oceania:'Oceania'}[continent]||continent}
function playerCountryObj(){return countryObj(save?.profile?.country||'Brasil')}
function tournamentGeoLabel(t){
  const pc=playerCountryObj();
  if(t.geo==='national') return `${pc.name} • adversários nacionais`;
  if(t.geo==='continental') return `${continentLabel(pc.continent)} • países do mesmo continente`;
  return `Mundial • adversários de todos os continentes`;
}
function tournamentCountryPool(t){
  const pc=playerCountryObj();
  if(t.geo==='national') return [pc];
  if(t.geo==='continental') return COUNTRIES.filter(c=>c.continent===pc.continent);
  return COUNTRIES;
}
function seasonRoundsFor(t){return t.id==='world'?8:(t.id==='continental'?6:5)}
function seedFromText(text){let h=0; for(let i=0;i<text.length;i++){h=(h*31+text.charCodeAt(i))>>>0;} return h||12345}
function seededRand(seed){let x=seed>>>0; return ()=>{x=(1664525*x+1013904223)>>>0; return x/4294967296}}
function ensureCareerContainers(){ if(!save.career.seasons||typeof save.career.seasons!=='object') save.career.seasons={}; }
function buildSeason(t){
  const rounds=seasonRoundsFor(t);
  const rng=seededRand(seedFromText(`${save.profile.country}-${t.id}-${Date.now()}`));
  const opponents=[];
  for(let i=0;i<rounds;i++) opponents.push(chooseOpponentBase(t,rng));
  const table=[{id:'player',name:save.profile.name,country:save.profile.country,points:0,w:0,d:0,l:0,played:0,player:true}]
    .concat(opponents.map((o,i)=>({id:`opp${i}`,name:o.name,country:o.country,points:0,w:0,d:0,l:0,played:0,player:false})));
  return {id:t.id,name:t.name,active:true,complete:false,round:0,rounds,opponents,table,createdAt:new Date().toISOString(),champion:null};
}
function getSeason(t){ensureCareerContainers(); return save.career.seasons[t.id]||null}
function resetSeason(t){ensureCareerContainers(); save.career.seasons[t.id]=buildSeason(t); persist(); return save.career.seasons[t.id]}
function getOrCreateSeason(t){ensureCareerContainers(); const existing=save.career.seasons[t.id]; if(existing && existing.active && !existing.complete) return existing; return resetSeason(t)}
function tableRowHtml(row,idx){return `<div class="season-row ${row.player?'me':''}"><span>${idx+1}</span><strong>${row.name}</strong><small>${flagImg(row.country,'tiny-flag')} ${row.country}</small><b>${row.points}</b><em>${row.w}V ${row.d}E ${row.l}D</em></div>`}
function seasonSummaryHtml(t){
  const s=getSeason(t); if(!s) return `<div class="season-mini empty">Temporada ainda não iniciada. Formato: ${seasonRoundsFor(t)} rodadas.</div>`;
  const sorted=[...s.table].sort((a,b)=>b.points-a.points || b.w-a.w || a.name.localeCompare(b.name));
  const me=s.table.find(r=>r.player);
  const next=s.active?s.opponents[s.round]:null;
  return `<div class="season-mini">
    <div><strong>Temporada:</strong> Rodada ${Math.min(s.round+1,s.rounds)}/${s.rounds} • ${s.complete?'Finalizada':'Em andamento'}</div>
    <div><strong>Você:</strong> ${me.points} pts • ${me.w}V ${me.d}E ${me.l}D</div>
    ${next?`<div><strong>Próximo rival:</strong> ${flagImg(next.country,'tiny-flag')} ${next.name} (${next.rating})</div>`:`<div><strong>Campeão:</strong> ${s.champion||'a definir'}</div>`}
    <div class="season-table-preview">${sorted.slice(0,3).map(tableRowHtml).join('')}</div>
  </div>`;
}
function renderCareer(){
  if(!save) return;
  ensureCareerContainers();
  const car=save.career;
  const grid=$('tournamentGrid');
  if(!grid) return;
  const unlocked=TOURNAMENTS.filter(t=>car.rating>=t.min).length;
  const pc=playerCountryObj();
  const ranks=currentRanks();
  grid.innerHTML=TOURNAMENTS.map((t,idx)=>{
    const locked=car.rating<t.min;
    const s=getSeason(t);
    const status=locked?`Bloqueado • exige rating ${t.min}`:(s?.active?'Temporada em andamento':(s?.complete?'Temporada finalizada':'Nova temporada'));
    const trophy=t.trophy||ASSET.trophies.amateur;
    const logo=t.logo||ASSET.logos.amateur;
    const pool=tournamentCountryPool(t);
    const preview=pool.slice(0,5).map(c=>flagImg(c.name,'tiny-flag')).join('');
    const geo=tournamentGeoLabel(t);
    const detail=t.geo==='national'
      ? `Se você escolheu ${pc.name}, seus rivais são do próprio país.`
      : t.geo==='continental'
        ? `Classificação continental: rivais da ${continentLabel(pc.continent)}.`
        : `Fase mundial: mistura global com jogadores de todos os continentes.`;
    return `<button class="tournament-card glass ${locked?'locked':''}" data-tournament="${t.id}" ${locked?'disabled':''}>
      <span class="badge">${status}</span>
      <h3>${t.name}</h3>
      <p class="geo-line"><strong>${geo}</strong></p>
      <p>${detail}</p>
      <div class="flag-preview">${preview}<span>${pool.length} país${pool.length>1?'es':''}</span></div>
      ${seasonSummaryHtml(t)}
      <p><strong>Prêmio campeão:</strong> +${t.prize} moedas • +${t.rep} reputação</p>
      <p><strong>Seu rating:</strong> ${car.rating}</p><p><strong>Ranking:</strong> Nacional #${ranks.national} • Continental #${ranks.continental} • Mundial #${ranks.world}</p>
      <img src="${logo}" alt="${t.name}" onerror="this.src='${trophy}';this.onerror=null">
    </button>`;
  }).join('');
  grid.querySelectorAll('[data-tournament]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const t=TOURNAMENTS.find(x=>x.id===btn.dataset.tournament);
      if(t && car.rating>=t.min){ tryEnterFullscreen(); startSeasonRound(t); }
    });
  });
}
const NAME_POOLS={
  Asia:{first:['Aiko','Hiro','Kenji','Mei','Ren','Sora','Yuki','Chen','Min','Arjun'],last:['Tanaka','Sato','Suzuki','Wang','Li','Kim','Patel','Nguyen','Khan','Rahman']},
  Europa:{first:['Luca','Elena','Sofia','Nikolai','Oliver','Isabel','Hans','Marta','Ivan','Amelia'],last:['Rossi','Smith','Garcia','Muller','Petrov','Dubois','Kowalski','Novak','Bianchi','Silva']},
  America:{first:['Rafael','Ana','Carlos','Sofia','Lucas','Valentina','Diego','Maya','Mateo','Isabella'],last:['Torres','Costa','Vega','Miller','Santos','Rojas','Johnson','Silva','Martinez','Ferreira']},
  Africa:{first:['Kwame','Amina','Kofi','Nala','Thabo','Zuri','Amari','Imani','Malik','Ayana'],last:['Mensah','Okafor','Diallo','Mbeki','Ndiaye','Abebe','Hassan','Adeyemi','Kamara','Traore']},
  Oceania:{first:['Jack','Mia','Noah','Ava','Liam','Isla','Kai','Talia','Ethan','Ruby'],last:['Wilson','Brown','Taylor','Smith','Jones','Williams','Walker','Cooper','Murray','King']}
};
const COUNTRY_NAME_POOLS={
  'Brasil':{first:['Rafael','Ana','João','Marina','Lucas','Bianca'],last:['Torres','Costa','Souza','Oliveira','Santos','Lima']},
  'Japão':{first:['Aiko','Haruto','Ren','Yuki','Sora','Mei'],last:['Tanaka','Sato','Suzuki','Yamamoto','Kobayashi','Nakamura']},
  'China':{first:['Chen','Wei','Lin','Ming','Li','Hao'],last:['Wang','Zhang','Liu','Li','Zhao','Chen']},
  'Estados Unidos':{first:['Oliver','Sophia','Ethan','Ava','Mason','Emma'],last:['Miller','Johnson','Smith','Davis','Wilson','Brown']},
  'México':{first:['Carlos','Sofia','Diego','Lucia','Mateo','Valeria'],last:['Vega','Rojas','Garcia','Lopez','Hernandez','Martinez']},
  'Alemanha':{first:['Hans','Lena','Felix','Greta','Jonas','Mila'],last:['Muller','Schmidt','Weber','Fischer','Wagner','Becker']},
  'Afeganistão':{first:['Farid','Laila','Omar','Mina','Nadir','Zara'],last:['Khan','Ahmadi','Rahimi','Hosseini','Noori','Karimi']}
};
function pick(arr){return arr[Math.floor(Math.random()*arr.length)]}
function opponentNameFor(country){const pool=COUNTRY_NAME_POOLS[country.name]||NAME_POOLS[country.continent]||NAME_POOLS.Europa; return `${pick(pool.first)} ${pick(pool.last)}`}
function chooseOpponentBase(tournament,rng=Math.random){
  const countries=tournamentCountryPool(tournament);
  const playerCountry=playerCountryObj();
  let possible=countries;
  if(tournament.geo==='continental' && countries.length>1) possible=countries.filter(c=>c.name!==playerCountry.name);
  const country=(possible.length?possible:countries)[Math.floor(rng()*(possible.length?possible:countries).length)];
  const rr=tournament.ratingRange||[760,980];
  const ar=tournament.aiRange||[.25,.55];
  const rating=Math.round(rr[0]+rng()*(rr[1]-rr[0]));
  const aiSkill=+(ar[0]+rng()*(ar[1]-ar[0])).toFixed(2);
  const style=aiSkill>.86?'Elite mundial':aiSkill>.72?'Mestre tático':aiSkill>.56?'Tático':aiSkill>.38?'Competitivo':'Iniciante';
  return {name:opponentNameFor(country),country:country.name,continent:country.continent,rating,tier:tournament.id,avatar:ASSET.avatars[Math.floor(rng()*ASSET.avatars.length)],flag:country.flag,aiSkill,style};
}
function chooseOpponent(tournament){
  const s=getSeason(tournament);
  if(s && s.active && s.opponents && s.opponents[s.round]) return s.opponents[s.round];
  return chooseOpponentBase(tournament);
}
function startSeasonRound(t){
  const s=getOrCreateSeason(t);
  if(s.complete || !s.active){ resetSeason(t); }
  currentSeasonContext={tournamentId:t.id,round:save.career.seasons[t.id].round};
  startMatch(t,activeMode);
}
function addTableResult(row,score){
  row.played=(row.played||0)+1;
  if(score===3){row.w=(row.w||0)+1; row.points=(row.points||0)+3;}
  else if(score===1){row.d=(row.d||0)+1; row.points=(row.points||0)+1;}
  else{row.l=(row.l||0)+1; row.points=(row.points||0);}
}
function simulateOtherSeasonMatches(season){
  const pending=season.table.filter(r=>!r.player && r.id!==`opp${season.round}`);
  for(let i=0;i<pending.length;i+=2){
    const a=pending[i], b=pending[i+1]||null; if(!a||!b) continue;
    const roll=Math.random();
    if(roll<.42){addTableResult(a,3); addTableResult(b,0);} else if(roll<.74){addTableResult(a,0); addTableResult(b,3);} else {addTableResult(a,1); addTableResult(b,1);}
  }
}
function processSeasonResult(won){
  if(!currentSeasonContext||!save?.career?.seasons) return '';
  const t=TOURNAMENTS.find(x=>x.id===currentSeasonContext.tournamentId)||currentTournament;
  const season=save.career.seasons[t.id]; if(!season||!season.active) return '';
  const player=season.table.find(r=>r.player);
  const opp=season.table.find(r=>r.id===`opp${season.round}`);
  const playerScore=won===true?3:(won===false?0:1);
  const oppScore=won===true?0:(won===false?3:1);
  if(player) addTableResult(player,playerScore);
  if(opp) addTableResult(opp,oppScore);
  simulateOtherSeasonMatches(season);
  season.round++;
  let msg=` Temporada: ${Math.min(season.round,season.rounds)}/${season.rounds} rodadas, ${player?.points||0} pts.`;
  if(season.round>=season.rounds){
    season.active=false; season.complete=true;
    const sorted=[...season.table].sort((a,b)=>b.points-a.points || b.w-a.w || a.name.localeCompare(b.name));
    season.champion=sorted[0]?.name||'Indefinido';
    if(sorted[0]?.player){
      save.career.money+=t.prize; save.career.reputation+=t.rep;
      if(!save.career.titles.includes(t.name)) save.career.titles.push(t.name);
      save.career.mission=`Título conquistado em ${t.name}. Próximo passo: buscar uma competição maior.`;
      msg+=` Você foi campeão da temporada e recebeu o troféu!`;
    }else{
      save.career.mission=`Temporada encerrada. Campeão: ${season.champion}. Tente novamente para subir no ranking.`;
      msg+=` Temporada encerrada. Campeão: ${season.champion}.`;
    }
  }else{
    save.career.mission=`Continue a temporada de ${t.name}: rodada ${season.round+1}/${season.rounds}.`;
  }
  currentSeasonContext=null;
  return msg;
}

function startMatch(tournament=TOURNAMENTS[0],mode=activeMode){
  tryEnterFullscreen();
  currentTournament=tournament||TOURNAMENTS[0]; currentOpponent=chooseOpponent(currentTournament); resultShown=false; aiBusy=false; if(aiMoveTimer){clearTimeout(aiMoveTimer); aiMoveTimer=null;} moveHistory=[]; selectedSq=null; legal=[]; playerColor='w';
  chess=safeRun('Falha ao iniciar motor de xadrez',()=>new Chess(),null); if(!chess){renderFallbackBoard(true); return;}
  validateMatchState('startMatch');
  show('gameScreen');
  safeText('matchTitle',tournament.name);
  const p=save?.profile||{name:'Jogador',country:'Brasil',avatar:0};
  const opp=currentOpponent;
  const vb=$('versusBox');
  if(vb) vb.innerHTML=`<div class="mini-player">${img(ASSET.avatars[p.avatar]||ASSET.avatars[0],'','Jogador')}<strong>${p.name}</strong><small>${flagImg(p.country,'mini-flag')}</small></div><strong>VS</strong><div class="mini-player">${img(opp.avatar,'','Adversario')}<strong>${opp.name}</strong><small>${flagImg(opp.country,'mini-flag')}<br>${opp.country} • ${continentLabel(opp.continent)}<br>IA ${opp.style||'Competitiva'} • ${opp.rating}</small></div>`;
  setup3D(); updateBoard(); updateHUD(); animate();
}
function setup3D(){
  const canvas=$('gameCanvas'); if(!canvas) return;
  if(!window.THREE){ renderFallbackBoard(); return; }
  if(renderer){ renderer.dispose(); }
  scene=new THREE.Scene(); scene.background=null;
  camera=new THREE.PerspectiveCamera(42,1,.1,100);
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'}); renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));
  renderer.setClearColor(0x000000,0);
  scene.add(new THREE.AmbientLight(0xfff4df,.72)); const light=new THREE.DirectionalLight(0xfff0c8,1.25); light.position.set(4,9,6); scene.add(light); const rim=new THREE.DirectionalLight(0x7fb2ff,.45); rim.position.set(-5,4,-6); scene.add(rim);
  boardGroup=new THREE.Group(); pieceGroup=new THREE.Group(); highlightGroup=new THREE.Group(); environmentGroup=new THREE.Group(); scene.add(environmentGroup); scene.add(boardGroup); scene.add(pieceGroup); scene.add(highlightGroup);
  build3DEnvironment();
  const edge=new THREE.MeshStandardMaterial({color:0x0c1422,metalness:.25,roughness:.48});
  const trim=new THREE.MeshStandardMaterial({color:0xc79a32,metalness:.55,roughness:.28});
  const base=new THREE.Mesh(new THREE.BoxGeometry(8.95,.34,8.95),edge); base.position.y=-.24; boardGroup.add(base);
  const trim1=new THREE.Mesh(new THREE.BoxGeometry(9.15,.10,.20),trim); trim1.position.set(0,-.03,4.58); boardGroup.add(trim1);
  const trim2=trim1.clone(); trim2.position.z=-4.58; boardGroup.add(trim2);
  const trim3=new THREE.Mesh(new THREE.BoxGeometry(.20,.10,9.15),trim); trim3.position.set(4.58,-.03,0); boardGroup.add(trim3);
  const trim4=trim3.clone(); trim4.position.x=-4.58; boardGroup.add(trim4);
  squares.clear();
  for(let r=0;r<8;r++) for(let f=0;f<8;f++){
    const isDark=(r+f)%2;
    const mat=new THREE.MeshStandardMaterial({color:isDark?0x263650:0xbda36b,metalness:isDark?.08:.18,roughness:isDark?.52:.43,emissive:0x000000});
    const m=new THREE.Mesh(new THREE.BoxGeometry(1,.085,1),mat); m.position.set(f-3.5,0,r-3.5); m.userData.square='abcdefgh'[f]+(8-r); boardGroup.add(m); squares.set(m.userData.square,m);
  }
  raycaster=new THREE.Raycaster(); pointer=new THREE.Vector2();
  applyCameraOrbit(); resizeRenderer();
  canvas.onpointerdown=onPointerDown; canvas.onpointermove=onPointerMove; canvas.onpointerup=onPointerUp; canvas.onpointercancel=onPointerUp;
}
function build3DEnvironment(){
  if(!environmentGroup||!window.THREE) return;
  // v0.3.3: removido o painel/plano semitransparente atras do tabuleiro,
  // pois criava um efeito visual de vidro/overlay indesejado.
  // O fundo cinematografico agora vem apenas do CSS da tela por tras do canvas.
}
function applyCameraOrbit(){
  if(!camera) return; const o=cameraOrbit; const x=Math.sin(o.theta)*o.radius; const z=Math.cos(o.theta)*o.radius; const y=Math.max(4.2,Math.sin(o.phi)*8.8); camera.position.set(x,y,z); camera.lookAt(0,0,0);
}
function resizeRenderer(){
  if(!renderer||!camera) return; const wrap=document.querySelector('.board-wrap'); const w=(wrap?.clientWidth||window.innerWidth); const h=(wrap?.clientHeight||window.innerHeight); renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
}
function onPointerDown(e){
  dragState={active:true,moved:false,rotating:false,startX:e.clientX,startY:e.clientY,lastX:e.clientX,lastY:e.clientY,pointerId:e.pointerId};
  try{e.currentTarget.setPointerCapture(e.pointerId)}catch{}
}
function onPointerMove(e){
  if(!dragState.active) return;
  const total=Math.hypot(e.clientX-dragState.startX,e.clientY-dragState.startY);
  // v0.3.2: toque curto seleciona/move. So comeca a girar apos arrasto real.
  if(!dragState.rotating && total<16) return;
  dragState.rotating=true; dragState.moved=true;
  const dx=e.clientX-dragState.lastX, dy=e.clientY-dragState.lastY;
  cameraOrbit.theta-=dx*.006;
  cameraOrbit.phi=Math.max(.45,Math.min(1.15,cameraOrbit.phi-dy*.003));
  dragState.lastX=e.clientX; dragState.lastY=e.clientY;
  applyCameraOrbit();
}
function onPointerUp(e){
  const moved=dragState.moved;
  const clickLike=Math.hypot(e.clientX-dragState.startX,e.clientY-dragState.startY)<18;
  dragState.active=false;
  try{e.currentTarget.releasePointerCapture(e.pointerId)}catch{}
  if(!moved || clickLike) handleBoardClick(e);
}
function handleBoardClick(e){
  if(!renderer||!camera||!raycaster||!chess) return;
  const rect=renderer.domElement.getBoundingClientRect();
  pointer.x=((e.clientX-rect.left)/rect.width)*2-1; pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;
  raycaster.setFromCamera(pointer,camera);
  const pieceHits=raycaster.intersectObjects([...pieces.values()],true);
  if(pieceHits.length){
    let obj=pieceHits[0].object;
    while(obj && !obj.userData.square && obj.parent) obj=obj.parent;
    const sq=obj?.userData?.square;
    if(sq){selectOrMove(sq); return;}
  }
  const squareHits=raycaster.intersectObjects([...squares.values()],false);
  if(squareHits.length){
    const sq=squareHits[0].object?.userData?.square;
    if(sq){selectOrMove(sq); return;}
  }
}
function isChessCheck(){
  if(!chess) return false;
  if(typeof chess.isCheck==='function') return chess.isCheck();
  if(typeof chess.in_check==='function') return chess.in_check();
  return false;
}
function isChessMate(){
  if(!chess) return false;
  if(typeof chess.isCheckmate==='function') return chess.isCheckmate();
  if(typeof chess.in_checkmate==='function') return chess.in_checkmate();
  return false;
}
function isInsufficientMaterial(){
  if(!chess || !chess.board) return false;
  const pieces=[];
  chess.board().forEach(row=>row.forEach(p=>{if(p) pieces.push(p);}));
  const nonKings=pieces.filter(p=>p.type!=='k');
  if(nonKings.length===0) return true;
  if(nonKings.length===1 && ['b','n'].includes(nonKings[0].type)) return true;
  return false;
}
function isChessDraw(){
  if(!chess) return false;
  if(typeof chess.isStalemate==='function' && chess.isStalemate()) return true;
  if(typeof chess.in_stalemate==='function' && chess.in_stalemate()) return true;
  if(typeof chess.isThreefoldRepetition==='function' && chess.isThreefoldRepetition()) return true;
  if(typeof chess.in_threefold_repetition==='function' && chess.in_threefold_repetition()) return true;
  if(typeof chess.isInsufficientMaterial==='function' && chess.isInsufficientMaterial()) return true;
  if(typeof chess.insufficient_material==='function' && chess.insufficient_material()) return true;
  if(isInsufficientMaterial()) return true;
  if(typeof chess.isDraw==='function') return chess.isDraw();
  if(typeof chess.in_draw==='function') return chess.in_draw();
  return false;
}
function isChessOver(){
  if(!chess) return false;
  if(typeof chess.isGameOver==='function') return chess.isGameOver();
  if(typeof chess.game_over==='function') return chess.game_over();
  return isChessMate() || isChessDraw();
}
function isAITurn(){
  return !!chess && !resultShown && !aiBusy && (activeMode==='single' || activeMode==='online-preview') && chess.turn && chess.turn()==='b';
}
function scheduleAiMove(delay=420){
  if(!isAITurn()) return;
  if(aiMoveTimer) clearTimeout(aiMoveTimer);
  aiMoveTimer=setTimeout(()=>{ aiMoveTimer=null; if(isAITurn()) makeAiMove(); }, delay);
}
function ensureAiTurn(){ scheduleAiMove(280); }
function startAiWatchdog(){
  if(aiWatchdogStarted) return;
  aiWatchdogStarted=true;
  setInterval(()=>{
    if(!chess || resultShown || !chess.turn) return;
    const aiMode=(activeMode==='single' || activeMode==='online-preview');
    if(!aiMode || chess.turn()!=='b') return;
    if(aiBusy && aiBusyStarted && Date.now()-aiBusyStarted>3000){
      console.warn('[AI] Watchdog liberou IA presa.');
      aiBusy=false; aiBusyStarted=0;
    }
    if(!aiBusy && !aiMoveTimer) scheduleAiMove(160);
  },650);
}
function selectOrMove(sq){
  if(!chess || resultShown) return;
  if(aiBusy || (activeMode!=='duo' && chess.turn()==='b')) return;
  const piece=chess.get(sq);
  if(piece && piece.color===chess.turn() && (activeMode==='duo' || chess.turn()==='w')){
    selectedSq=sq; legal=chess.moves({square:sq,verbose:true}); updateHighlights(); return;
  }
  if(selectedSq){
    const mv=legal.find(m=>m.to===sq);
    if(mv){
      const done=chess.move({from:selectedSq,to:sq,promotion:mv.promotion||'q'});
      if(done){
        moveHistory.push(done.san||`${selectedSq}-${sq}`);
        selectedSq=null; legal=[]; updateBoard(); updateHUD(); afterMove(); return;
      }
    }
  }
  selectedSq=null; legal=[]; updateHighlights();
}
function afterMove(){
  if(checkGameEnd()) return;
  scheduleAiMove(420);
}
function pieceValue(t){return {p:100,n:310,b:320,r:500,q:900,k:20000}[t]||0}
function evaluateBoard(){
  if(!chess) return 0; const b=chess.board(); let score=0;
  for(let r=0;r<8;r++)for(let f=0;f<8;f++){const p=b[r][f]; if(!p) continue; const v=pieceValue(p.type); const center=(3.5-Math.abs(3.5-f))+(3.5-Math.abs(3.5-r)); score+=(p.color==='b'?1:-1)*(v+center*3);}
  return score;
}
function scoreMove(m,skill){
  let score=Math.random()*70*(1-skill);
  if(m.captured) score+=pieceValue(m.captured)+35;
  if(m.promotion) score+=760;
  if(m.san&&m.san.includes('+')) score+=65;
  if(m.san&&m.san.includes('#')) score+=99999;
  const centerFiles={d:18,e:18,c:8,f:8}; score+=centerFiles[m.to?.[0]]||0;
  // v0.3.5: nunca deixar a simulacao da IA corromper o tabuleiro.
  if(typeof chess.undo==='function'){
    let moved=false;
    try{
      const sim=chess.move({from:m.from,to:m.to,promotion:m.promotion||'q'});
      moved=!!sim;
      if(moved){
        score+=evaluateBoard()*skill*.025;
        const replies=chess.moves({verbose:true});
        const dangerous=replies.some(r=>r.captured&&r.to===m.to&&pieceValue(r.captured||'p')>=pieceValue(m.piece));
        if(dangerous&&skill>.45) score-=pieceValue(m.piece)*.55*skill;
      }
    }catch(e){ console.warn('[AI] Simulacao de jogada falhou:',e); }
    finally{ if(moved){ try{chess.undo();}catch(e){ console.error('[AI] Undo falhou apos simulacao',e); } } }
  }
  return score;
}
function chooseAiMove(moves){
  const skill=currentOpponent?.aiSkill ?? .35;
  if(Math.random()>(skill+.12)) return moves[Math.floor(Math.random()*moves.length)];
  const ranked=moves.map(m=>({m,score:scoreMove(m,skill)})).sort((a,b)=>b.score-a.score);
  const spread=skill>.8?2:skill>.6?3:skill>.4?5:8;
  return ranked[Math.floor(Math.random()*Math.min(spread,ranked.length))].m;
}
function makeAiMove(){
  if(!chess || chess.turn()!=='b' || resultShown) return;
  if(!validateMatchState('beforeAiMove')) return;
  aiBusy=true; aiBusyStarted=Date.now();
  try{
    const moves=chess.moves({verbose:true});
    if(!moves.length){ checkGameEnd(); return; }
    const mv=chooseAiMove(moves) || moves[Math.floor(Math.random()*moves.length)];
    const done=chess.move({from:mv.from,to:mv.to,promotion:mv.promotion||'q'});
    if(done) moveHistory.push(done.san||`${mv.from}-${mv.to}`);
  }catch(err){
    console.warn('[AI] Falha ao escolher jogada, usando fallback seguro', err);
    try{
      const fallback=chess.moves({verbose:true})[0];
      if(fallback){ const done=chess.move({from:fallback.from,to:fallback.to,promotion:fallback.promotion||'q'}); if(done) moveHistory.push(done.san||`${fallback.from}-${fallback.to}`); }
    }catch(e){ console.error('[AI] Fallback tambem falhou', e); }
  }finally{
    aiBusy=false; aiBusyStarted=0;
    selectedSq=null; legal=[];
    updateBoard();
    updateHUD();
    validateMatchState('afterAiMove');
    checkGameEnd();
  }
}
function validateMatchState(label){
  if(!chess){reportIssue('error',`${label}: motor ausente`); return false;}
  if(typeof chess.turn!=='function'||typeof chess.moves!=='function'||typeof chess.move!=='function'){reportIssue('error',`${label}: API do motor incompleta`); return false;}
  const turn=chess.turn();
  if(turn!=='w'&&turn!=='b'){reportIssue('error',`${label}: turno invalido ${turn}`); return false;}
  const moves=chess.moves({verbose:true});
  if(!Array.isArray(moves)){reportIssue('error',`${label}: lista de jogadas invalida`); return false;}
  return true;
}
function checkGameEnd(){
  if(!chess) return false;
  const mate=isChessMate();
  const draw=isChessDraw();
  const over=isChessOver();
  if(!over) return false;
  if(mate){
    const won=chess.turn()==='b';
    showResult(won, won?'Xeque-mate! Você venceu a partida.':'Xeque-mate. A IA venceu a partida.');
  }else if(draw){
    showResult(null,'Empate. A partida terminou sem vencedor.');
  }else{
    showResult(false,'Partida encerrada.');
  }
  return true;
}
function showResult(won,reason){
  if(resultShown) return;
  resultShown=true;
  if(aiMoveTimer){clearTimeout(aiMoveTimer); aiMoveTimer=null;}
  const car=save?.career;
  let seasonMsg='';
  if(car){
    if(won===true){
      car.wins++; car.rating+=24; car.money+=12; car.reputation+=8;
      car.mission='Boa vitória. Continue a temporada para buscar o título.';
    }else if(won===false){
      car.losses++; car.rating=Math.max(600,car.rating-10); car.mission='Treine novamente e busque a próxima vitória.';
    }else{
      car.draws=(car.draws||0)+1; car.rating+=3; car.mission='Empates somam experiência, mas a carreira avança com vitórias.';
    }
    seasonMsg=processSeasonResult(won);
    persist();
  }
  const screen=$('resultScreen');
  if(screen){screen.classList.toggle('bg-victory',won===true); screen.classList.toggle('bg-defeat',won!==true);}
  const tr=$('resultTrophy'); if(tr) tr.src=currentTournament.trophy;
  safeText('resultTitle',won===true?'Vitória!':won===false?'Derrota':'Empate');
  const carAfter=save?.career;
  const summary=carAfter?` Rating atual: ${carAfter.rating}. Placar da carreira: ${carAfter.wins}V / ${carAfter.draws||0}E / ${carAfter.losses}D. Títulos: ${carAfter.titles.length}.${seasonMsg}`:'';
  safeText('resultText',`${reason} ${won===true?'Você ganhou pontos, reputação e prêmio na carreira.':won===false?'Você perdeu rating, mas pode tentar novamente.':'Seu rating recebeu um pequeno bônus de experiência.'}${summary}`);
  show('resultScreen');
}
function updateHUD(){
  const turn=chess?.turn()==='w'?'Brancas':'Pretas';
  let suffix='';
  if(isChessMate()) suffix=' • XEQUE-MATE'; else if(isChessCheck()) suffix=' • XEQUE'; else if(isChessDraw()) suffix=' • EMPATE'; else if(isAITurn()||aiBusy) suffix=' • IA pensando';
  safeText('turnBox',`Turno: ${turn}${suffix}`);
  const h=$('historyBox'); if(h) h.innerHTML='<strong>Histórico</strong><br>'+moveHistory.map((m,i)=>`${i+1}. ${m}`).join('<br>');
  if(isAITurn()) ensureAiTurn();
}
function updateBoard(){ safeRun('Falha ao atualizar tabuleiro 3D',()=>{ if(!scene||!pieceGroup||!chess){ renderFallbackBoard(); return; } pieceGroup.clear(); pieces.clear(); const b=chess.board(); for(let r=0;r<8;r++)for(let f=0;f<8;f++){ const p=b[r][f]; if(!p) continue; const sq='abcdefgh'[f]+(8-r); const mesh=createPieceMesh(p); mesh.position.set(f-3.5,.28,r-3.5); mesh.userData.square=sq; mesh.traverse(o=>{if(o.isMesh)o.userData.square=sq}); pieceGroup.add(mesh); pieces.set(sq,mesh); } updateHighlights(); renderFallbackBoard(false); },()=>renderFallbackBoard(true)); }
function createPieceMesh(p){
  const g=new THREE.Group(); g.userData.piece=true;
  const white=p.color==='w';
  const bodyMat=new THREE.MeshStandardMaterial({color:white?0xf3ead7:0x111825,metalness:white?.28:.42,roughness:white?.32:.36});
  const goldMat=new THREE.MeshStandardMaterial({color:white?0xd5a846:0x356fb7,metalness:.62,roughness:.24});
  const jewelMat=new THREE.MeshStandardMaterial({color:white?0x6ea8ff:0xf0c24f,metalness:.45,roughness:.18,emissive:white?0x07112a:0x221200});
  function add(mesh,x,y,z){mesh.position.set(x||0,y||0,z||0); g.add(mesh); return mesh;}
  add(new THREE.Mesh(new THREE.CylinderGeometry(.34,.42,.14,28),goldMat),0,.07,0);
  add(new THREE.Mesh(new THREE.CylinderGeometry(.27,.34,.16,28),bodyMat),0,.21,0);
  add(new THREE.Mesh(new THREE.CylinderGeometry(.20,.27,.38,28),bodyMat),0,.48,0);
  add(new THREE.Mesh(new THREE.TorusGeometry(.225,.026,8,28),goldMat),0,.68,0).rotation.x=Math.PI/2;
  const type=p.type;
  if(type==='p'){
    add(new THREE.Mesh(new THREE.SphereGeometry(.22,24,16),bodyMat),0,.86,0);
  }else if(type==='r'){
    add(new THREE.Mesh(new THREE.CylinderGeometry(.28,.30,.24,6),goldMat),0,.84,0);
    for(let i=0;i<4;i++){const a=i*Math.PI/2; add(new THREE.Mesh(new THREE.BoxGeometry(.11,.12,.11),goldMat),Math.cos(a)*.18,1.02,Math.sin(a)*.18);}
  }else if(type==='n'){
    const neck=add(new THREE.Mesh(new THREE.CylinderGeometry(.16,.23,.42,16),goldMat),0,.82,0); neck.rotation.z=-.28;
    const head=add(new THREE.Mesh(new THREE.SphereGeometry(.20,18,12),goldMat),.08,1.05,-.05);
    const snout=add(new THREE.Mesh(new THREE.BoxGeometry(.24,.13,.16),goldMat),.20,1.03,-.07); snout.rotation.y=.2;
    add(new THREE.Mesh(new THREE.ConeGeometry(.09,.22,4),jewelMat),-.02,1.22,-.02);
  }else if(type==='b'){
    add(new THREE.Mesh(new THREE.SphereGeometry(.24,24,16),goldMat),0,.88,0);
    const cut=add(new THREE.Mesh(new THREE.BoxGeometry(.055,.32,.18),jewelMat),.05,.98,0); cut.rotation.z=.38;
  }else if(type==='q'){
    add(new THREE.Mesh(new THREE.SphereGeometry(.22,24,16),bodyMat),0,.86,0);
    for(let i=0;i<6;i++){const a=i*Math.PI/3; add(new THREE.Mesh(new THREE.ConeGeometry(.055,.24,8),goldMat),Math.cos(a)*.22,1.08,Math.sin(a)*.22);}
    add(new THREE.Mesh(new THREE.SphereGeometry(.075,16,10),jewelMat),0,1.22,0);
  }else{
    add(new THREE.Mesh(new THREE.CylinderGeometry(.22,.27,.38,24),goldMat),0,.86,0);
    add(new THREE.Mesh(new THREE.BoxGeometry(.11,.34,.07),goldMat),0,1.18,0);
    add(new THREE.Mesh(new THREE.BoxGeometry(.28,.10,.07),goldMat),0,1.25,0);
  }
  g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;o.userData.square=g.userData.square;}});
  return g;
}
function markerAtSquare(sq){const f='abcdefgh'.indexOf(sq[0]); const r=8-Number(sq[1]); return {x:f-3.5,z:r-3.5};}
function updateHighlights(){
  if(highlightGroup) highlightGroup.clear();
  pieces.forEach(p=>p.scale.set(1,1,1));
  if(!highlightGroup||!window.THREE) return;
  if(selectedSq&&pieces.get(selectedSq)){
    const p=pieces.get(selectedSq); p.scale.set(1.08,1.08,1.08);
    const pos=markerAtSquare(selectedSq); const ring=new THREE.Mesh(new THREE.TorusGeometry(.43,.035,8,48),new THREE.MeshBasicMaterial({color:0x7dffb6,transparent:true,opacity:.95})); ring.rotation.x=Math.PI/2; ring.position.set(pos.x,.16,pos.z); highlightGroup.add(ring);
  }
  const legalMat=new THREE.MeshBasicMaterial({color:0xf4cf67,transparent:true,opacity:.78});
  legal.forEach(m=>{const pos=markerAtSquare(m.to); const disk=new THREE.Mesh(new THREE.CircleGeometry(m.captured?.length?.toString()?0.24:0.18,24),legalMat); disk.rotation.x=-Math.PI/2; disk.position.set(pos.x,.125,pos.z); highlightGroup.add(disk);});
}
function renderFallbackBoard(showIt){ const fb=$('fallbackBoard'); if(!fb) return; if(showIt===false){fb.classList.remove('active');return;} if(window.THREE&&renderer) return; const board=chess?chess.board():[]; const icons={wp:'♙',wr:'♖',wn:'♘',wb:'♗',wq:'♕',wk:'♔',bp:'♟',br:'♜',bn:'♞',bb:'♝',bq:'♛',bk:'♚'}; let html='<div class="fallback-board-grid">'; for(let r=0;r<8;r++) for(let f=0;f<8;f++){ const p=board[r]?.[f]; const sq='abcdefgh'[f]+(8-r); html+=`<button class="fallback-square ${(r+f)%2?'dark':'light'}" onclick="selectOrMove('${sq}')">${p?icons[p.color+p.type]:''}</button>`;} html+='</div>'; fb.innerHTML=html; fb.classList.add('active'); }
function animate(){ if(!renderer||!scene||!camera) return; requestAnimationFrame(animate); safeRun('Falha no frame 3D',()=>{ if(autoRotate){cameraOrbit.theta+=.004; applyCameraOrbit();} if(isAITurn() && !aiMoveTimer) scheduleAiMove(360); renderer.render(scene,camera); }); }

// Inicializacao obrigatoria: corrige tela travada sem clique nos botoes.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
console.log('[ValeChess] Build inicializada:', BUILD.label);
