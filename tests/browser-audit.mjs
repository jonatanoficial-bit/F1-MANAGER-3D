import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const build = JSON.parse(fs.readFileSync(path.join(root,'BUILD_INFO.json'),'utf8'));
const saveVersionTag = String(build.version).replace(/\./g,'').padEnd(4,'0').slice(0,4);
const activeSaveKey = `f1_manager_career_2026_v${saveVersionTag}`;
const runtimeErrorKey = `${activeSaveKey}_runtime_errors`;
const debugPort = 9300 + Math.floor(Math.random()*300);
const profileDir = fs.mkdtempSync(path.join(os.tmpdir(),'f1m-cdp-'));
const sleep = ms => new Promise(resolve=>setTimeout(resolve,ms));
const chromium = spawn('/usr/bin/chromium',[
  '--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--disable-software-rasterizer',
  `--remote-debugging-port=${debugPort}`,`--user-data-dir=${profileDir}`,'--no-first-run','--no-default-browser-check','about:blank'
],{stdio:['ignore','pipe','pipe']});

async function waitHttp(url, timeout=15000){
  const started=Date.now();
  while(Date.now()-started<timeout){
    try{const response=await fetch(url);if(response.ok)return response;}catch(_){}
    await sleep(100);
  }
  throw new Error(`Timeout: ${url}`);
}

class CDP {
  constructor(url){ this.ws=new WebSocket(url); this.id=0; this.pending=new Map(); this.handlers=new Map(); }
  async open(){
    await new Promise((resolve,reject)=>{this.ws.addEventListener('open',resolve,{once:true});this.ws.addEventListener('error',reject,{once:true});});
    this.ws.addEventListener('message',event=>{
      const msg=JSON.parse(event.data);
      if(msg.id){const pending=this.pending.get(msg.id);if(pending){this.pending.delete(msg.id);msg.error?pending.reject(new Error(msg.error.message)):pending.resolve(msg.result);}}
      else if(msg.method){for(const fn of this.handlers.get(msg.method)||[])fn(msg.params||{});}
    });
  }
  on(method,fn){const list=this.handlers.get(method)||[];list.push(fn);this.handlers.set(method,list);}
  send(method,params={}){const id=++this.id;this.ws.send(JSON.stringify({id,method,params}));return new Promise((resolve,reject)=>this.pending.set(id,{resolve,reject}));}
  close(){this.ws.close();}
}

async function createTarget(){
  const response=await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`,{method:'PUT'});
  if(!response.ok) throw new Error(`create target HTTP ${response.status}`);
  return response.json();
}

async function evaluate(cdp,expression,awaitPromise=true){
  const result=await cdp.send('Runtime.evaluate',{expression,awaitPromise,returnByValue:true,userGesture:true});
  if(result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text || 'Runtime exception');
  return result.result?.value;
}

async function waitFor(cdp,expression,timeout=15000){
  const started=Date.now();
  while(Date.now()-started<timeout){
    try{if(await evaluate(cdp,`Boolean(${expression})`))return true;}catch(_){}
    await sleep(100);
  }
  throw new Error(`waitFor timeout: ${expression}`);
}

function scriptTag(content,name='inline'){
  return `<script>${String(content).replace(/<\/script/gi,'<\\/script')}\n//# sourceURL=${name}</script>`;
}

function buildInlineHtml(){
  let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const css=fs.readFileSync(path.join(root,'style.css'),'utf8');
  const files={
    'data/build-info.js':fs.readFileSync(path.join(root,'data/build-info.js'),'utf8'),
    'src/core/build-system.js':fs.readFileSync(path.join(root,'src/core/build-system.js'),'utf8'),
    'src/core/runtime-guard.js':fs.readFileSync(path.join(root,'src/core/runtime-guard.js'),'utf8'),
    'src/core/event-bus.js':fs.readFileSync(path.join(root,'src/core/event-bus.js'),'utf8'),
    'src/core/data-contracts.js':fs.readFileSync(path.join(root,'src/core/data-contracts.js'),'utf8'),
    'data/asset-catalog.js':fs.readFileSync(path.join(root,'data/asset-catalog.js'),'utf8'),
    'src/core/asset-registry.js':fs.readFileSync(path.join(root,'src/core/asset-registry.js'),'utf8'),
    'src/systems/persistence-system.js':fs.readFileSync(path.join(root,'src/systems/persistence-system.js'),'utf8'),
    'src/systems/career-system.js':fs.readFileSync(path.join(root,'src/systems/career-system.js'),'utf8'),
    'src/systems/race-engine.js':fs.readFileSync(path.join(root,'src/systems/race-engine.js'),'utf8'),
    'src/ui/screen-manager.js':fs.readFileSync(path.join(root,'src/ui/screen-manager.js'),'utf8'),
    'src/core/viewport-manager.js':fs.readFileSync(path.join(root,'src/core/viewport-manager.js'),'utf8'),
    'src/core/performance-monitor.js':fs.readFileSync(path.join(root,'src/core/performance-monitor.js'),'utf8'),
    'src/core/diagnostics.js':fs.readFileSync(path.join(root,'src/core/diagnostics.js'),'utf8'),
    'data/i18n.js':fs.readFileSync(path.join(root,'data/i18n.js'),'utf8'),
    'src/core/i18n-system.js':fs.readFileSync(path.join(root,'src/core/i18n-system.js'),'utf8'),
    'data/visual-data.js':fs.readFileSync(path.join(root,'data/visual-data.js'),'utf8'),
    'src/core/track-visual-system.js':fs.readFileSync(path.join(root,'src/core/track-visual-system.js'),'utf8'),
    'data/audio-ui-data.js':fs.readFileSync(path.join(root,'data/audio-ui-data.js'),'utf8'),
    'src/core/audio-ui-system.js':fs.readFileSync(path.join(root,'src/core/audio-ui-system.js'),'utf8'),
    'data/game-data.js':fs.readFileSync(path.join(root,'data/game-data.js'),'utf8'),
    'data/track-layouts.js':fs.readFileSync(path.join(root,'data/track-layouts.js'),'utf8'),
    'script.js':fs.readFileSync(path.join(root,'script.js'),'utf8')
  };
  const fetchMap={
    'BUILD_INFO.json':JSON.parse(fs.readFileSync(path.join(root,'BUILD_INFO.json'),'utf8')),
    'data/build.json':JSON.parse(fs.readFileSync(path.join(root,'data/build.json'),'utf8')),
    'assets/ASSET_MANIFEST.json':JSON.parse(fs.readFileSync(path.join(root,'assets/ASSET_MANIFEST.json'),'utf8'))
  };
  const bootstrap=`(() => {
    const memory = new Map();
    const storage = {getItem:k=>memory.has(String(k))?memory.get(String(k)):null,setItem:(k,v)=>memory.set(String(k),String(v)),removeItem:k=>memory.delete(String(k)),clear:()=>memory.clear(),key:i=>Array.from(memory.keys())[i]||null,get length(){return memory.size;}};
    try { localStorage.setItem('__probe','1'); localStorage.removeItem('__probe'); }
    catch (_) { try { Object.defineProperty(window,'localStorage',{value:storage,configurable:true}); } catch(__) { window.__F1M_MEMORY_STORAGE=storage; } }
    const map=${JSON.stringify(fetchMap)};
    window.fetch=async input=>{const raw=String(typeof input==='string'?input:input?.url||'');const key=raw.includes('assets/ASSET_MANIFEST.json')?'assets/ASSET_MANIFEST.json':raw.includes('data/build.json')?'data/build.json':raw.includes('BUILD_INFO.json')?'BUILD_INFO.json':'';if(Object.prototype.hasOwnProperty.call(map,key))return new Response(JSON.stringify(map[key]),{status:200,headers:{'Content-Type':'application/json'}});return new Response('',{status:404});};
  })();`;
  html=html.replace('<link rel="stylesheet" href="style.css" />',()=>`<style>${css}</style>`);
  html=html.replace('<link rel="manifest" href="manifest.webmanifest" />','');
  html=html.replace('<head>',()=>'<head>'+scriptTag(bootstrap,'audit-bootstrap.js'));
  html=html.replace(/<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/three[^>]*><\/script>/,()=>scriptTag('/* THREE deliberately unavailable: fallback test */','three-fallback.js'));
  for(const [src,content] of Object.entries(files)) html=html.replace(`<script src="${src}"></script>`,()=>scriptTag(content,src));
  html=html.replace(/<script>if\('serviceWorker'[\s\S]*?<\/script>/,()=>scriptTag('/* service worker omitted in memory audit */','sw-omit.js'));
  return html;
}
const inlineHtml=buildInlineHtml();

async function runCase(name,width,height){
  const target=await createTarget();
  const cdp=new CDP(target.webSocketDebuggerUrl); await cdp.open();
  const pageErrors=[]; const consoleErrors=[];
  cdp.on('Runtime.exceptionThrown',p=>pageErrors.push({description:p.exceptionDetails?.exception?.description||p.exceptionDetails?.text||'exception',url:p.exceptionDetails?.url,line:p.exceptionDetails?.lineNumber,column:p.exceptionDetails?.columnNumber,scriptId:p.exceptionDetails?.scriptId}));
  cdp.on('Runtime.consoleAPICalled',p=>{if(p.type==='error')consoleErrors.push((p.args||[]).map(a=>a.value||a.description||'').join(' '));});
  await cdp.send('Runtime.enable'); await cdp.send('Page.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<900,screenWidth:width,screenHeight:height});
  const tree=await cdp.send('Page.getFrameTree');
  await cdp.send('Page.setDocumentContent',{frameId:tree.frameTree.frame.id,html:inlineHtml});
  try {
    await waitFor(cdp,`document.readyState === 'complete' && document.documentElement.dataset.buildCode === '${build.build_code}'`,20000);
  } catch(error) {
    console.error('INLINE_DEBUG', await evaluate(cdp,`({ready:document.readyState,title:document.title,home:document.getElementById('homeBuildPill')?.textContent,dataset:{...document.documentElement.dataset},core:Object.keys(window.F1M_CORE||{}),hasData:Boolean(window.F1M_DATA),body:document.body?.innerText?.slice(0,300),scripts:document.scripts.length})`), pageErrors, consoleErrors);
    throw error;
  }

  const steps=[];
  steps.push(await evaluate(cdp,`({home:document.getElementById('screen-home').classList.contains('active'),build:document.getElementById('homeBuildPill').textContent,core:Boolean(window.F1M_CORE?.diagnostics&&window.F1M_CORE?.i18n&&window.F1M_CORE?.performance&&window.F1M_CORE?.viewport&&window.F1M_CORE?.contracts&&window.F1M_CORE?.persistence&&window.F1M_CORE?.career&&window.F1M_CORE?.race&&window.F1M_CORE?.ui&&window.F1M_CORE?.assets),buildCode:document.documentElement.dataset.buildCode,activeScreen:document.documentElement.dataset.activeScreen})`));
  steps.push(await evaluate(cdp,`(()=>{const r=window.F1M_CORE?.viewport ? document.body.classList.contains('is-compact-landscape') || document.body.classList.contains('is-mobile-viewport') || document.body.classList.contains('is-tablet-viewport') || document.body.classList.contains('is-desktop-viewport') : false; return {viewport:true,manager:Boolean(window.F1M_CORE?.viewport),panel:Boolean(document.getElementById('mobileUxPanel')),pill:Boolean(document.getElementById('viewportDebugPill')),classified:r,device:document.documentElement.dataset.viewportDevice,orientation:document.documentElement.dataset.viewportOrientation,compact:document.documentElement.dataset.viewportCompact};})()`));
  await evaluate(cdp,`document.querySelector('[data-nav="career-create"]').click()`);
  await waitFor(cdp,`document.getElementById('screen-career-create').classList.contains('active')`);
  await evaluate(cdp,`document.getElementById('managerName').value='Auditoria F08';document.querySelector('[data-action="createProfile"]').click()`);
  await waitFor(cdp,`document.getElementById('screen-team-select').classList.contains('active')`);
  await evaluate(cdp,`document.querySelector('[data-action="startCareer"]').click()`);
  await waitFor(cdp,`document.getElementById('screen-lobby').classList.contains('active') && document.getElementById('hudRound').textContent.includes('Corrida 1/')`);
  steps.push(await evaluate(cdp,`({career_started:true,round:document.getElementById('hudRound').textContent,saveSchema:JSON.parse(localStorage.getItem(${JSON.stringify(activeSaveKey)})).payload.saveSchema,saveFormat:JSON.parse(localStorage.getItem(${JSON.stringify(activeSaveKey)})).format})`));

  await evaluate(cdp,`document.querySelector('.side-nav [data-tab="system"]').click()`);
  await waitFor(cdp,`(document.getElementById('tabContent').textContent.includes('Central Antiquebra') || document.getElementById('tabContent').textContent.includes('Anti-break'))`);
  await evaluate(cdp,`document.querySelector('[data-lang="en"]')?.click()`);
  await waitFor(cdp,`document.documentElement.lang === 'en' && document.body.innerText.includes('Anti-break')`,8000);
  steps.push(await evaluate(cdp,`({i18n:true,lang:document.documentElement.lang,homeNewGame:window.F1M_CORE.i18n ? true : false,hasSystemEnglish:document.body.innerText.includes('Anti-break')})`));
  await evaluate(cdp,`document.querySelector('[data-lang="pt-BR"]')?.click()`);
  await waitFor(cdp,`document.documentElement.lang === 'pt-BR'`,8000);
  await evaluate(cdp,`document.querySelector('.side-nav [data-tab="system"]')?.click()`);
  await waitFor(cdp,`document.querySelector('[data-action="runSystemDiagnostics"]')`,8000);
  await evaluate(cdp,`document.querySelector('[data-action="runSystemDiagnostics"]')?.click()`);
  await waitFor(cdp,`!document.querySelector('[data-action="runSystemDiagnostics"]')?.disabled && document.getElementById('tabContent').textContent.includes('aprovados')`,20000);
  steps.push(await evaluate(cdp,`(()=>{const t=document.getElementById('tabContent').textContent;const start=t.indexOf('Resultado:');const after=start>=0?t.slice(start+'Resultado:'.length):'';const marker=after.indexOf('/100');const scoreText=marker>=0?after.slice(0,marker).trim():'';return {system:true,score:scoreText?Number(scoreText):null,rows:document.querySelectorAll('.system-grid .qa-list .row').length,errors:document.querySelectorAll('#runtimeErrorBanner').length}})()`));


  await evaluate(cdp,`document.querySelector('[data-action="runPerformanceAudit"]').click()`);
  await waitFor(cdp,`document.getElementById('tabContent').textContent.includes('Status:')`,12000);
  steps.push(await evaluate(cdp,`(()=>{const t=document.getElementById('tabContent').textContent;const match=t.match(new RegExp('Orçamento mobile\\s*(\\d+)\\/100')); return {performance:true,score:match?Number(match[1]):null,text:t.includes('Orçamento mobile')};})()`));

  await evaluate(cdp,`document.querySelector('[data-nav="assets-check"]').click()`);
  await waitFor(cdp,`document.getElementById('screen-assets-check').classList.contains('active') && document.querySelectorAll('.asset-summary-grid article').length === 6`);
  steps.push(await evaluate(cdp,`({assets:true,catalogued:Number(document.querySelector('.asset-summary-grid article b')?.textContent||0),placeholders:document.querySelectorAll('[data-asset-state="fallback"]').length,invalid:document.querySelectorAll('[data-asset-state="invalid"]').length})`));
  await evaluate(cdp,`document.querySelector('[data-nav="home"]').click();document.querySelector('[data-action="continueCareer"]').click()`);
  await waitFor(cdp,`document.getElementById('screen-lobby').classList.contains('active')`);

  await evaluate(cdp,`document.querySelector('[data-action="goQualifying"]').click()`);
  await waitFor(cdp,`document.getElementById('screen-qualifying').classList.contains('active')`);
  await evaluate(cdp,`document.querySelector('[data-action="startQualifying"]').click()`);
  await waitFor(cdp,`document.querySelector('[data-action="startRace"]')`);
  await evaluate(cdp,`document.querySelector('[data-action="startRace"]').click()`);
  await waitFor(cdp,`document.getElementById('screen-race').classList.contains('active') && document.getElementById('lapLabel').textContent.includes('/')`,12000);
  const lapBefore=await evaluate(cdp,`document.getElementById('lapLabel').textContent`);
  await evaluate(cdp,`for(let i=0;i<4;i++)document.querySelector('[data-action="toggleRaceSpeed"]').click()`);
  await waitFor(cdp,`document.getElementById('lapLabel').textContent !== ${JSON.stringify(lapBefore)}`,10000);
  const lapAfter=await evaluate(cdp,`document.getElementById('lapLabel').textContent`);
  await evaluate(cdp,`document.querySelector('[data-action="finishRaceNow"]').click()`);
  await waitFor(cdp,`document.getElementById('screen-results').classList.contains('active') && document.querySelectorAll('#resultList .row').length >= 20`,12000);
  steps.push(await evaluate(cdp,`({race:true,lap_before:${JSON.stringify(lapBefore)},lap_after:${JSON.stringify(lapAfter)},progressed:${JSON.stringify(lapBefore)}!==${JSON.stringify(lapAfter)},results:document.querySelectorAll('#resultList .row').length})`));

  const layout=await evaluate(cdp,`({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,scrollHeight:document.documentElement.scrollHeight,clientHeight:document.documentElement.clientHeight,orientationVisible:getComputedStyle(document.getElementById('orientationLock')).display!=='none'})`);
  const runtimeBanner=await evaluate(cdp,`document.querySelectorAll('#runtimeErrorBanner').length`);
  const runtimeStored=await evaluate(cdp,`JSON.parse(localStorage.getItem(${JSON.stringify(runtimeErrorKey)})||'[]').length`);
  const viewportStep=steps.find(step=>step.viewport); const i18nStep=steps.find(step=>step.i18n); const systemStep=steps.find(step=>step.system); const performanceStep=steps.find(step=>step.performance); const assetStep=steps.find(step=>step.assets); const raceStep=steps.find(step=>step.race);
  const filteredConsole=consoleErrors.filter(item=>!item.includes('Failed to load resource'));
  const passed=steps[0].home&&steps[0].core&&steps[0].buildCode===build.build_code&&steps[0].activeScreen==='home'&&viewportStep?.manager&&viewportStep?.panel&&viewportStep?.classified&&i18nStep?.hasSystemEnglish&&steps.find(step=>step.career_started)?.career_started&&steps.find(step=>step.career_started)?.saveSchema===Number(build.save_schema)&&steps.find(step=>step.career_started)?.saveFormat==='F1M_SAVE_ENVELOPE_V2'&&systemStep?.score>=85&&systemStep?.errors===0&&performanceStep?.text&&assetStep?.catalogued===519&&assetStep?.invalid===0&&raceStep?.progressed&&raceStep?.results>=20&&runtimeBanner===0&&runtimeStored===0&&pageErrors.length===0&&filteredConsole.length===0;
  cdp.close();
  try{await fetch(`http://127.0.0.1:${debugPort}/json/close/${target.id}`);}catch(_){}
  return {name,viewport:[width,height],steps,layout,runtime_banner:runtimeBanner,runtime_stored:runtimeStored,passed,page_errors:pageErrors,console_errors:filteredConsole};
}

try{
  await waitHttp(`http://127.0.0.1:${debugPort}/json/version`);
  const cases=[];
  for(const item of [['mobile_landscape',844,390],['tablet',1180,820],['desktop',1440,900]]) cases.push(await runCase(...item));
  const report={mode:'chromium-cdp-inline-memory-no-three',build:build.build_code,generatedAt:new Date().toISOString(),cases};
  fs.writeFileSync(path.join(root,'test-results/browser-audit.json'),JSON.stringify(report,null,2)+'\n');
  console.log(cases.map(item=>`${item.passed?'PASS':'FAIL'} ${item.name} ${item.viewport.join('x')} • diagnóstico ${item.steps.find(step=>step.system)?.score ?? 'n/d'}/100`).join('\n'));
  if(cases.some(item=>!item.passed)) process.exitCode=1;
} finally {
  chromium.kill('SIGTERM');
  try{fs.rmSync(profileDir,{recursive:true,force:true});}catch(_){}
}
