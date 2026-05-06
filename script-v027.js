/*
  Vale Chess 3D Career
  Build: v0.2.7 - 2026-05-04 17:42 BRT
  Mobile-first landscape, GitHub Pages, assets externos via manifesto.
*/
const BUILD={version:'v0.2.7',datetime:'2026-05-04 17:42 BRT',label:'Build v0.2.7 - 2026-05-04 17:42 BRT'};
const SAVE_KEY='vale_chess_3d_career_save_v027';
const LEGACY_SAVE_KEYS=['vale_chess_3d_career_save_v026','vale_chess_3d_career_save_v025','vale_chess_3d_career_save_v024','vale_chess_3d_career_save_v023','vale_chess_3d_career_save_v022','vale_chess_3d_career_save_v021','vale_chess_3d_career_save_v020'];
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
 {id:'amateur',name:'Liga Nacional Amadora',scope:'Divisão local do seu país',min:0,prize:55,rep:35,logo:ASSET.logos.amateur,trophy:ASSET.trophies.amateur,bg:ASSET.career},
 {id:'professional',name:'Liga Nacional Profissional',scope:'Promoção para circuito profissional',min:900,prize:85,rep:55,logo:ASSET.logos.professional,trophy:ASSET.trophies.professional,bg:ASSET.career},
 {id:'continental',name:'Campeonato Continental',scope:'Ex.: Brasil disputa a América',min:1080,prize:120,rep:75,logo:ASSET.logos.continental,trophy:ASSET.trophies.continental,bg:ASSET.career},
 {id:'world',name:'Campeonato Mundial',scope:'Elite global do xadrez',min:1320,prize:180,rep:110,logo:ASSET.logos.world,trophy:ASSET.trophies.world,bg:ASSET.career}
];
const OPPONENTS=[
 ['Rafael Torres','Brasil',790,'amateur'],['Ana Costa','Brasil',850,'amateur'],['Carlos Vega','Mexico',920,'professional'],['Sofia Miller','Estados Unidos',1040,'professional'],['Isabel Rojas','Espanha',1140,'continental'],['Aiko Tanaka','Japao',1280,'continental'],['Chen Wei','China',1440,'world'],['Oliver Smith','Reino Unido',1570,'world'],['Elena Rossi','Italia',1390,'world']
].map((o,i)=>({name:o[0],country:o[1],rating:o[2],tier:o[3],avatar:ASSET.avatars[i%ASSET.avatars.length],flag:ASSET.flags[o[1]]||''}));
const $=id=>document.getElementById(id);
function safeText(id,text){const el=$(id); if(el) el.textContent=text;}
function bindClick(id,fn){const el=$(id); if(el) el.addEventListener('click',fn); else console.warn('[ValeChess] Elemento nao encontrado:',id);}
let save=null, activeMode='single', selectedAvatar=0, selectedCountry='Brasil', chess=null, selectedSq=null, legal=[], pieces=new Map(), squares=new Map(), highlights=[], renderer,scene,camera,raycaster,pointer,boardGroup,pieceGroup,autoRotate=false,currentTournament=TOURNAMENTS[0],currentOpponent=OPPONENTS[0],playerColor='w',aiBusy=false,moveHistory=[],resultShown=false;
let cameraOrbit={radius:10.9,theta:.62,phi:.92},dragState={active:false,moved:false,startX:0,startY:0,lastX:0,lastY:0,pointerId:null};
const GameState={gameId:null,createGame(){this.gameId='future-'+Date.now(); console.log('[Firebase futuro] createGame cria sala remota com FEN, jogadores e status.'); return this.gameId},joinGame(gameId){this.gameId=gameId; console.log('[Firebase futuro] joinGame:',gameId)},sendMove(move){console.log('[Firebase futuro] sendMove gravaria jogada e FEN:',move)},onGameUpdate(callback){console.log('[Firebase futuro] onGameUpdate escutaria sala.'); this.callback=callback}}; window.GameState=GameState;
function init(){ safeText('buildInfo',BUILD.label); hydrateProfile(); bind(); load(); const cb=$('continueBtn'); if(save){show('coverScreen'); if(cb) cb.disabled=false}else{if(cb) cb.disabled=true; show('coverScreen')} }
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
function load(){try{save=JSON.parse(localStorage.getItem(SAVE_KEY)||'null'); if(!save){for(const k of LEGACY_SAVE_KEYS){const old=localStorage.getItem(k); if(old){save=JSON.parse(old); save.build=BUILD.label; localStorage.setItem(SAVE_KEY,JSON.stringify(save)); break;}}}}catch{save=null}}
function persist(){localStorage.setItem(SAVE_KEY,JSON.stringify(save))}
function defaultSave(name,country,avatar){return{build:BUILD.label,mode:activeMode,profile:{name,country,avatar},career:{rating:800,money:100,reputation:0,wins:0,losses:0,titles:[],mission:'Vença 2 partidas na Liga Amadora para ganhar reputação.'}}}
function saveProfile(){const name=($('playerName').value||'Jogador').trim().slice(0,18); save=defaultSave(name,selectedCountry,selectedAvatar); persist(); show('lobbyScreen'); renderLobby()}
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); $(id).classList.add('active'); if(id==='gameScreen') setTimeout(resizeRenderer,60)}
function flagCode(name){return (COUNTRY_CODE[name]||'--').toUpperCase()}
function flagEmoji(name){const code=flagCode(name); if(!code||code.length!==2||code==='--')return '🏳️'; return [...code].map(c=>String.fromCodePoint(127397+c.charCodeAt(0))).join('')}
function cycleImageFallback(el){const list=(el.dataset.fallbacks||'').split('|').filter(Boolean); const i=Number(el.dataset.fallbackIndex||0); if(i<list.length){el.dataset.fallbackIndex=String(i+1); el.src=list[i]; return;} const code=el.dataset.code||''; if(code){const span=document.createElement('span'); span.className=(el.className||'')+' flag-code'; span.textContent=code; span.title=el.alt||'Bandeira'; el.replaceWith(span); return;} el.style.display='none'; const fb=el.nextElementSibling; if(fb&&fb.classList.contains('fallback-avatar')) fb.style.display='grid';}
function img(src,cls='',alt=''){return `<img class="${cls}" src="${src}" alt="${alt}" onerror="cycleImageFallback(this)">`}
function flagImg(countryName,cls='flag-img'){const c=countryObj(countryName); const [first,...rest]=c.flagCandidates||[c.flag]; return `<img class="${cls}" src="${first}" alt="Bandeira ${c.name}" data-code="${flagCode(c.name)}" data-fallbacks="${rest.join('|')}" onerror="cycleImageFallback(this)">`}
function countryObj(name){return COUNTRIES.find(c=>c.name===name)||COUNTRIES.find(c=>c.name==='Brasil')||COUNTRIES[0]}
function renderLobby(){if(!save)return; const p=save.profile,c=countryObj(p.country),car=save.career; const total=car.wins+car.losses; const winRate=total?Math.round((car.wins/total)*100):0; const level=car.rating>=1400?'Mestre mundial':car.rating>=1150?'Profissional':car.rating>=950?'Competidor nacional':'Amador em evolução'; $('playerCard').innerHTML=`<div class="avatar-stack">${img(ASSET.avatars[p.avatar]||ASSET.avatars[0],'','avatar')}<div class="fallback-avatar">♟</div></div><div class="player-info"><span class="brand-kicker">${activeMode.toUpperCase()}</span><h3>${p.name}</h3><div class="country-chip">${flagImg(p.country,'chip-flag')}<span>${p.country}</span></div><p>${c.continent} • ${level}</p><p>Rating ${car.rating} • Reputação ${car.reputation} • Moedas ${car.money}</p></div>`; const fb=$('playerCard').querySelector('.fallback-avatar'); if(fb) fb.style.display='none'; $('lobbyTitle').textContent=`Olá, ${p.name}`; $('lobbyText').textContent=activeMode==='single'?'Entre no modo carreira, conquiste pontos, suba de divisão e avance dos torneios nacionais até o campeonato mundial.':activeMode==='duo'?'Modo local para dois jogadores no mesmo dispositivo. Um joga com as brancas e o outro com as pretas.': 'Modo online preparado para Firebase, ranking global, missões e desafios futuros.'; $('modeNotice').textContent=activeMode==='single'?car.mission: activeMode==='duo'?'Duo Player: ambos jogam no mesmo aparelho, sem IA.':'Online: estrutura pronta, aguardando Firebase.'; $('careerStats').innerHTML=`<div class="stat country-stat"><span class="stat-country-head">${flagImg(p.country,'stat-flag')}</span><strong>${p.country}</strong>País escolhido</div><div class=stat><strong>${c.continent}</strong>Continente</div><div class=stat><strong>${car.rating}</strong>Rating</div><div class=stat><strong>${car.wins}</strong>Vitórias</div><div class=stat><strong>${car.losses}</strong>Derrotas</div><div class=stat><strong>${winRate}%</strong>Aproveitamento</div><div class=stat><strong>${car.money}</strong>Moedas</div><div class=stat><strong>${car.reputation}</strong>Reputação</div><div class=stat><strong>${car.titles.length}</strong>Títulos</div><div class=stat><strong>${COUNTRIES.length}</strong>Países na base</div>`}




function tryEnterFullscreen(){
  const el=document.documentElement;
  const isSmall=Math.min(window.innerWidth,window.innerHeight)<=900;
  if(!isSmall && !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) return;
  try{
    if(!document.fullscreenElement && el.requestFullscreen){ el.requestFullscreen().catch(()=>{}); }
    if(screen.orientation && screen.orientation.lock){ screen.orientation.lock('landscape').catch(()=>{}); }
  }catch(e){ console.log('[ValeChess] Fullscreen/landscape nao suportado neste navegador.', e); }
}
function renderCareer(){
  if(!save) return;
  const car=save.career;
  const grid=$('tournamentGrid');
  if(!grid) return;
  const unlocked=TOURNAMENTS.filter(t=>car.rating>=t.min).length;
  grid.innerHTML=TOURNAMENTS.map((t,idx)=>{
    const locked=car.rating<t.min;
    const status=locked?`Bloqueado • exige rating ${t.min}`:(idx<unlocked-1?'Aberto':'Próximo desafio');
    const trophy=t.trophy||ASSET.trophies.amateur;
    const logo=t.logo||ASSET.logos.amateur;
    return `<button class="tournament-card glass ${locked?'locked':''}" data-tournament="${t.id}" ${locked?'disabled':''}>
      <span class="badge">${status}</span>
      <h3>${t.name}</h3>
      <p>${t.scope}</p>
      <p><strong>Prêmio:</strong> +${t.prize} moedas • +${t.rep} reputação</p>
      <p><strong>Seu rating:</strong> ${car.rating}</p>
      <img src="${logo}" alt="${t.name}" onerror="this.src='${trophy}';this.onerror=null">
    </button>`;
  }).join('');
  grid.querySelectorAll('[data-tournament]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const t=TOURNAMENTS.find(x=>x.id===btn.dataset.tournament);
      if(t && car.rating>=t.min){ tryEnterFullscreen(); startMatch(t, activeMode); }
    });
  });
}
function chooseOpponent(tournament){
  const pool=OPPONENTS.filter(o=>o.tier===tournament.id || (tournament.id==='amateur'&&o.rating<900) || (tournament.id==='professional'&&o.rating>=900&&o.rating<1150) || (tournament.id==='continental'&&o.rating>=1100&&o.rating<1400) || (tournament.id==='world'&&o.rating>=1300));
  return pool[Math.floor(Math.random()*pool.length)]||OPPONENTS[0];
}
function startMatch(tournament=TOURNAMENTS[0],mode=activeMode){
  tryEnterFullscreen();
  currentTournament=tournament; currentOpponent=chooseOpponent(tournament); resultShown=false; aiBusy=false; moveHistory=[]; selectedSq=null; legal=[]; playerColor='w';
  chess=new Chess();
  show('gameScreen');
  safeText('matchTitle',tournament.name);
  const p=save?.profile||{name:'Jogador',country:'Brasil',avatar:0};
  const opp=currentOpponent;
  const vb=$('versusBox');
  if(vb) vb.innerHTML=`<div class="mini-player">${img(ASSET.avatars[p.avatar]||ASSET.avatars[0],'','Jogador')}<strong>${p.name}</strong><small>${flagImg(p.country,'mini-flag')}</small></div><strong>VS</strong><div class="mini-player">${img(opp.avatar,'','Adversario')}<strong>${opp.name}</strong><small>${flagImg(opp.country,'mini-flag')}</small></div>`;
  setup3D(); updateBoard(); updateHUD(); animate();
}
function setup3D(){
  const canvas=$('gameCanvas'); if(!canvas) return;
  if(!window.THREE){ renderFallbackBoard(); return; }
  if(renderer){ renderer.dispose(); }
  scene=new THREE.Scene(); scene.background=new THREE.Color(0x050b14);
  camera=new THREE.PerspectiveCamera(42,1,.1,100);
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'}); renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));
  scene.add(new THREE.AmbientLight(0xffffff,.72)); const light=new THREE.DirectionalLight(0xffffff,1.1); light.position.set(4,8,6); scene.add(light);
  boardGroup=new THREE.Group(); pieceGroup=new THREE.Group(); scene.add(boardGroup); scene.add(pieceGroup);
  const dark=new THREE.MeshStandardMaterial({color:0x33415f,roughness:.65}); const lightMat=new THREE.MeshStandardMaterial({color:0xc9b178,roughness:.55}); const edge=new THREE.MeshStandardMaterial({color:0x111b2b,roughness:.7});
  const base=new THREE.Mesh(new THREE.BoxGeometry(8.6,.28,8.6),edge); base.position.y=-.18; boardGroup.add(base);
  squares.clear();
  for(let r=0;r<8;r++) for(let f=0;f<8;f++){
    const m=new THREE.Mesh(new THREE.BoxGeometry(1,.08,1),(r+f)%2?dark:lightMat); m.position.set(f-3.5,0,r-3.5); m.userData.square='abcdefgh'[f]+(8-r); boardGroup.add(m); squares.set(m.userData.square,m);
  }
  raycaster=new THREE.Raycaster(); pointer=new THREE.Vector2();
  applyCameraOrbit(); resizeRenderer();
  canvas.onpointerdown=onPointerDown; canvas.onpointermove=onPointerMove; canvas.onpointerup=onPointerUp; canvas.onpointercancel=onPointerUp;
}
function applyCameraOrbit(){
  if(!camera) return; const o=cameraOrbit; const x=Math.sin(o.theta)*o.radius; const z=Math.cos(o.theta)*o.radius; const y=Math.max(4.2,Math.sin(o.phi)*8.8); camera.position.set(x,y,z); camera.lookAt(0,0,0);
}
function resizeRenderer(){
  if(!renderer||!camera) return; const wrap=document.querySelector('.board-wrap'); const w=(wrap?.clientWidth||window.innerWidth); const h=(wrap?.clientHeight||window.innerHeight); renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
}
function onPointerDown(e){dragState={active:true,moved:false,startX:e.clientX,startY:e.clientY,lastX:e.clientX,lastY:e.clientY,pointerId:e.pointerId}; try{e.currentTarget.setPointerCapture(e.pointerId)}catch{} }
function onPointerMove(e){ if(!dragState.active) return; const dx=e.clientX-dragState.lastX, dy=e.clientY-dragState.lastY; if(Math.abs(e.clientX-dragState.startX)+Math.abs(e.clientY-dragState.startY)>6) dragState.moved=true; cameraOrbit.theta-=dx*.006; cameraOrbit.phi=Math.max(.45,Math.min(1.15,cameraOrbit.phi-dy*.003)); dragState.lastX=e.clientX; dragState.lastY=e.clientY; applyCameraOrbit(); }
function onPointerUp(e){ const moved=dragState.moved; dragState.active=false; try{e.currentTarget.releasePointerCapture(e.pointerId)}catch{} if(!moved) handleBoardClick(e); }
function handleBoardClick(e){
  if(!renderer||!camera||!raycaster||!chess) return; const rect=renderer.domElement.getBoundingClientRect(); pointer.x=((e.clientX-rect.left)/rect.width)*2-1; pointer.y=-((e.clientY-rect.top)/rect.height)*2+1; raycaster.setFromCamera(pointer,camera);
  const objs=[...pieces.values(),...squares.values()]; const hits=raycaster.intersectObjects(objs,true); if(!hits.length) return;
  let obj=hits[0].object; while(obj && !obj.userData.square && obj.parent) obj=obj.parent;
  const sq=obj?.userData?.square; if(sq) selectOrMove(sq);
}
function selectOrMove(sq){
  if(!chess || aiBusy) return; const piece=chess.get(sq);
  if(selectedSq){ const mv=legal.find(m=>m.to===sq); if(mv){ const done=chess.move({from:selectedSq,to:sq,promotion:'q'}); if(done){ moveHistory.push(done.san||`${selectedSq}-${sq}`); selectedSq=null; legal=[]; updateBoard(); updateHUD(); afterMove(); return; }} }
  if(piece && piece.color===chess.turn() && (activeMode==='duo' || chess.turn()==='w')){ selectedSq=sq; legal=chess.moves({square:sq,verbose:true}); updateHighlights(); }
}
function afterMove(){
  if(checkGameEnd()) return;
  if(activeMode==='single' || activeMode==='online-preview') setTimeout(makeAiMove,450);
}
function makeAiMove(){ if(!chess||chess.turn()!=='b') return; aiBusy=true; const moves=chess.moves({verbose:true}); const captures=moves.filter(m=>m.captured); const mv=(captures[0]||moves[Math.floor(Math.random()*moves.length)]); if(mv){ const done=chess.move({from:mv.from,to:mv.to,promotion:'q'}); moveHistory.push(done.san||`${mv.from}-${mv.to}`); } aiBusy=false; updateBoard(); updateHUD(); checkGameEnd(); }
function checkGameEnd(){
  if(!chess) return false; const over=chess.isGameOver?chess.isGameOver():chess.game_over(); if(!over) return false;
  const mate=chess.isCheckmate?chess.isCheckmate():chess.in_checkmate(); let won=false; if(mate) won=chess.turn()==='b';
  showResult(won,mate?'Xeque-mate.':'Partida encerrada.'); return true;
}
function showResult(won,reason){
  if(resultShown) return; resultShown=true; const car=save?.career; if(car){ if(won){car.wins++; car.rating+=32; car.money+=currentTournament.prize; car.reputation+=currentTournament.rep; if(!car.titles.includes(currentTournament.name)) car.titles.push(currentTournament.name); car.mission='Continue vencendo para liberar torneios maiores.';} else {car.losses++; car.rating=Math.max(600,car.rating-12); car.mission='Treine novamente e busque a próxima vitória.';} persist(); }
  const screen=$('resultScreen'); if(screen){screen.classList.toggle('bg-victory',won); screen.classList.toggle('bg-defeat',!won);} const tr=$('resultTrophy'); if(tr) tr.src=currentTournament.trophy; safeText('resultTitle',won?'Vitória!':'Derrota'); safeText('resultText',`${reason} ${won?'Você ganhou pontos, reputação e prêmio na carreira.':'Você perdeu rating, mas pode tentar novamente.'}`); show('resultScreen');
}
function updateHUD(){ const turn=chess?.turn()==='w'?'Brancas':'Pretas'; safeText('turnBox',`Turno: ${turn}${chess?.in_check&&chess.in_check()?' • Xeque':''}`); const h=$('historyBox'); if(h) h.innerHTML='<strong>Histórico</strong><br>'+moveHistory.map((m,i)=>`${i+1}. ${m}`).join('<br>'); }
function updateBoard(){ if(!scene||!pieceGroup||!chess){ renderFallbackBoard(); return; } pieceGroup.clear(); pieces.clear(); const b=chess.board(); for(let r=0;r<8;r++)for(let f=0;f<8;f++){ const p=b[r][f]; if(!p) continue; const sq='abcdefgh'[f]+(8-r); const mesh=createPieceMesh(p); mesh.position.set(f-3.5,.28,r-3.5); mesh.userData.square=sq; pieceGroup.add(mesh); pieces.set(sq,mesh); } updateHighlights(); renderFallbackBoard(false); }
function createPieceMesh(p){ const g=new THREE.Group(); const mat=new THREE.MeshStandardMaterial({color:p.color==='w'?0xf1ead7:0x121722,metalness:.12,roughness:.45}); const accent=new THREE.MeshStandardMaterial({color:p.color==='w'?0xc59a34:0x4f86d9,metalness:.25,roughness:.35}); const base=new THREE.Mesh(new THREE.CylinderGeometry(.32,.38,.18,20),mat); base.position.y=.09; g.add(base); let top; const type=p.type; if(type==='p') top=new THREE.Mesh(new THREE.SphereGeometry(.25,18,14),mat); else if(type==='r') top=new THREE.Mesh(new THREE.BoxGeometry(.45,.34,.45),accent); else if(type==='n'){top=new THREE.Mesh(new THREE.ConeGeometry(.28,.62,4),accent); top.rotation.y=.78;} else if(type==='b') top=new THREE.Mesh(new THREE.SphereGeometry(.28,18,14),accent); else if(type==='q') top=new THREE.Mesh(new THREE.SphereGeometry(.34,20,16),accent); else top=new THREE.Mesh(new THREE.CylinderGeometry(.25,.34,.52,20),accent); top.position.y= type==='p'? .46:.55; g.add(top); const body=new THREE.Mesh(new THREE.CylinderGeometry(.22,.30,.44,20),mat); body.position.y=.34; g.add(body); return g; }
function updateHighlights(){ squares.forEach((m,sq)=>{ m.material.emissive=new THREE.Color(0x000000); }); if(selectedSq&&squares.get(selectedSq)) squares.get(selectedSq).material.emissive=new THREE.Color(0x1fff99); legal.forEach(m=>{ const sq=squares.get(m.to); if(sq) sq.material.emissive=new THREE.Color(0x315dff); }); }
function renderFallbackBoard(showIt){ const fb=$('fallbackBoard'); if(!fb) return; if(showIt===false){fb.classList.remove('active');return;} if(window.THREE&&renderer) return; const board=chess?chess.board():[]; const icons={wp:'♙',wr:'♖',wn:'♘',wb:'♗',wq:'♕',wk:'♔',bp:'♟',br:'♜',bn:'♞',bb:'♝',bq:'♛',bk:'♚'}; let html='<div class="fallback-board-grid">'; for(let r=0;r<8;r++) for(let f=0;f<8;f++){ const p=board[r]?.[f]; const sq='abcdefgh'[f]+(8-r); html+=`<button class="fallback-square ${(r+f)%2?'dark':'light'}" onclick="selectOrMove('${sq}')">${p?icons[p.color+p.type]:''}</button>`;} html+='</div>'; fb.innerHTML=html; fb.classList.add('active'); }
function animate(){ if(!renderer||!scene||!camera) return; requestAnimationFrame(animate); if(autoRotate){cameraOrbit.theta+=.004; applyCameraOrbit();} renderer.render(scene,camera); }

// Inicializacao obrigatoria: corrige tela travada sem clique nos botoes.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
console.log('[ValeChess] Build inicializada:', BUILD.label);
