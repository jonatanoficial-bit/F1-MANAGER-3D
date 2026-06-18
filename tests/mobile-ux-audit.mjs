import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const json = rel => JSON.parse(read(rel));
const build = json('BUILD_INFO.json');
const budgets = json('config/quality-budgets.json').budgets || {};
const results = [];
const add = (name, ok, detail = '') => { results.push({ name, ok:Boolean(ok), detail:String(detail || '') }); if(!ok) process.exitCode = 1; };
const index = read('index.html');
const css = read('style.css');
const script = read('script.js');
const viewportSource = read('src/core/viewport-manager.js');
const appShell = json('config/app-shell.json').files;
const sw = read('service-worker.js');

add('mobile:build-phase', Number(build.phase) >= 7 && Number(build.save_schema) >= 7, `${build.phase}/${build.save_schema}`);
add('mobile:module-present', fs.existsSync(path.join(root,'src/core/viewport-manager.js')), 'src/core/viewport-manager.js');
add('mobile:module-cached', appShell.includes('./src/core/viewport-manager.js') && sw.includes('./src/core/viewport-manager.js'), 'app shell + SW');
add('mobile:index-load-order', index.indexOf('src/core/viewport-manager.js') > index.indexOf('src/ui/screen-manager.js') && index.indexOf('src/core/viewport-manager.js') < index.indexOf('src/core/performance-monitor.js'), 'entre UI e performance');
add('mobile:panel-present', index.includes('id="mobileUxPanel"') && index.includes('id="viewportDebugPill"'), 'painel imersivo');
add('mobile:actions-present', script.includes('cycleHudMode') && script.includes('viewportMiniHTML') && script.includes('viewportController.enterFullscreen'), 'ações conectadas');
add('mobile:save-key-current', script.includes('f1_manager_career_2026_v0170'), 'v0170');
add('mobile:legacy-key-preserved', script.includes('f1_manager_career_2026_v0150'), 'v0150 legado');
add('mobile:safe-area-css', css.includes('safe-area-inset-top') && css.includes('--safe-bottom') && index.includes('viewport-fit=cover'), 'safe area + viewport fit');
add('mobile:touch-target-css', css.includes('--touch-min:44px') && css.includes('touch-action:manipulation'), '44px + touch action');
add('mobile:compact-landscape-css', css.includes('max-height:560px') && script.includes('is-compact-landscape') && css.includes('hud-compact'), 'landscape compacto');
add('mobile:side-nav-scrollable', css.includes('.side-nav{overflow-y:auto') || css.includes('overflow-y:auto;overflow-x:hidden'), 'nav rolável');
add('mobile:race-hud-adaptive', css.includes('body.hud-compact .race-left') && css.includes('body.hud-compact .race-right') && css.includes('max-height:430px'), 'HUD corrida compacto');
add('mobile:system-card', script.includes('Mobile, fullscreen e safe area') && script.includes('ATIVAR FULLSCREEN') && script.includes('ALTERNAR HUD'), 'Central Sistema');

try {
  const sandbox = {
    globalThis:{},
    innerWidth:844,
    innerHeight:390,
    devicePixelRatio:2,
    navigator:{ userAgent:'Mozilla/5.0 Android Mobile' },
    screen:{ orientation:{ lock:async()=>{} } },
    matchMedia:query => ({ matches: query.includes('pointer: coarse') ? true : false }),
    localStorage:{ getItem:()=>null, setItem:()=>{}, removeItem:()=>{} },
    document:{ documentElement:{ style:{ setProperty(){} }, dataset:{} }, body:{ classList:{ toggle(){} } }, addEventListener(){}, getElementById(){ return null; }, querySelector(){ return { getBoundingClientRect:()=>({height:44}) }; }, querySelectorAll(){ return [{ getBoundingClientRect:()=>({height:44}) }]; }, fullscreenElement:null },
    getComputedStyle:()=>({ getPropertyValue:()=> '0px' }),
    setTimeout:(fn)=>{ fn(); return 1; },
    addEventListener(){},
    visualViewport:{ width:844, height:390, addEventListener(){} }
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(viewportSource, sandbox, {filename:'viewport-manager.js'});
  const manager = sandbox.F1M_CORE.viewport.createViewportManager({ document:sandbox.document, window:sandbox });
  const snap = manager.bind();
  const report = manager.report();
  add('mobile:api-classifies-mobile', snap.device === 'mobile' && snap.orientation === 'landscape' && snap.compact === true, JSON.stringify(snap));
  add('mobile:api-report-score', report.score >= 80 && report.checks.length >= 5, `${report.score}/100`);
  const afterHud = manager.cycleHudMode();
  add('mobile:api-hud-cycle', ['compact','expanded','auto'].includes(afterHud.hudMode), afterHud.hudMode);
} catch(error) {
  add('mobile:api-execution', false, error.message);
}

const minTouch = Number(budgets.touch_target_min_px || 44);
add('mobile:budget-touch-target', minTouch >= 44, String(minTouch));
add('mobile:budget-safe-area', Boolean(budgets.safe_area_required), String(budgets.safe_area_required));
const summary = { build:build.build_code, generatedAt:new Date().toISOString(), passed:results.filter(r=>r.ok).length, failed:results.filter(r=>!r.ok).length, results, result:results.every(r=>r.ok) ? 'approved' : 'failed' };
fs.writeFileSync(path.join(root,'test-results/mobile-ux-audit.json'), JSON.stringify(summary,null,2)+'\n');
console.log(results.map(r=>`${r.ok?'PASS':'FAIL'} ${r.name}${r.detail?' — '+r.detail:''}`).join('\n'));
console.log(`TOTAL: ${summary.passed} passed, ${summary.failed} failed`);
