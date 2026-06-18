import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checks = [];
const ok = (name, condition, detail = '') => {
  checks.push({ name, ok:Boolean(condition), detail });
  if(!condition) process.exitCode = 1;
};
const build = JSON.parse(fs.readFileSync(path.join(root,'BUILD_INFO.json'),'utf8'));
const dataBuild = JSON.parse(fs.readFileSync(path.join(root,'data/build.json'),'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
ok('build version synchronized', build.version === dataBuild.version && build.version === manifest.version, `${build.version}/${dataBuild.version}/${manifest.version}`);
ok('build code present', /^F1M3D-/.test(build.build_code), build.build_code);
ok(`phase ${build.phase} build code`, build.build_code.endsWith(`-F${String(build.phase).padStart(2,'0')}`), build.build_code);
ok(`save schema ${build.save_schema}`, Number(build.save_schema) === Number(build.phase), String(build.save_schema));
const script = fs.readFileSync(path.join(root,'script.js'),'utf8');
ok('Data Lock typo removed', !script.includes('driverMarketValue('));
ok('race simulation loop modular', script.includes('function ensureRaceEngine()') && script.includes('CORE.race.createEngine'));
ok('old renderer recursive animate removed', !script.includes('requestAnimationFrame(()=>this.animate())'));
ok('renderer removes resize listener', script.includes("removeEventListener('resize',this.onResize)"));
ok('F2 starts aligned at round zero', !script.includes("series === 'F2' ? 5 : 0"));
ok('diagnostic filename dynamic', !script.includes('diagnostico-v0-9-36'));
ok('system diagnostics present', script.includes('async function runSystemDiagnostics()'));
ok('performance audit UI present', script.includes('async function runPerformanceAudit()') && script.includes('Orçamento mobile'));
ok('quality budgets present', script.includes('QUALITY_BUDGETS') && fs.existsSync(path.join(root,'config/quality-budgets.json')));
ok('save vault UI present', script.includes('function saveVaultHTML()') && script.includes('RECUPERAR MELHOR BACKUP'));
const persistenceSource = fs.readFileSync(path.join(root,'src/systems/persistence-system.js'),'utf8');
ok('portable save export present', script.includes('createPortableExport') && persistenceSource.includes('F1M_PORTABLE_SAVE_V1'));
ok('active save key v0170', script.includes('f1_manager_career_2026_v0170'));
ok('viewport manager present', fs.existsSync(path.join(root,'src/core/viewport-manager.js')) && script.includes('viewportController') && script.includes('cycleHudMode'));
ok('mobile UX panel present', fs.readFileSync(path.join(root,'index.html'),'utf8').includes('mobileUxPanel'));
ok('safe area CSS present', fs.readFileSync(path.join(root,'style.css'),'utf8').includes('safe-area-inset') && fs.readFileSync(path.join(root,'style.css'),'utf8').includes('hud-compact')); 
const syntaxFiles = ['script.js','service-worker.js','data/game-data.js','data/build-info.js','data/track-layouts.js','src/core/build-system.js','src/core/runtime-guard.js','src/core/event-bus.js','src/core/data-contracts.js','data/asset-catalog.js','src/core/asset-registry.js','src/systems/persistence-system.js','src/systems/career-system.js','src/systems/race-engine.js','src/ui/screen-manager.js','src/core/viewport-manager.js','src/core/performance-monitor.js','src/core/diagnostics.js','data/i18n.js','src/core/i18n-system.js'];
for(const rel of syntaxFiles){
  try { new vm.Script(fs.readFileSync(path.join(root,rel),'utf8'),{filename:rel}); ok(`syntax:${rel}`,true); }
  catch(error){ ok(`syntax:${rel}`,false,error.message); }
}
const sandbox={globalThis:{}}; vm.createContext(sandbox); vm.runInContext(fs.readFileSync(path.join(root,'data/build-info.js'),'utf8'),sandbox);
ok('runtime build JS matches JSON', sandbox.globalThis.F1M_BUILD?.build_code === build.build_code);
fs.mkdirSync(path.join(root,'test-results'),{recursive:true});
fs.writeFileSync(path.join(root,'test-results/static-audit.json'),JSON.stringify({build:build.build_code,generatedAt:new Date().toISOString(),checks},null,2)+'\n');
console.log(checks.map(c=>`${c.ok?'PASS':'FAIL'} ${c.name}${c.detail?' — '+c.detail:''}`).join('\n'));
