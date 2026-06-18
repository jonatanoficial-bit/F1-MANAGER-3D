import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const results=[];
const add=(name,ok,detail='')=>{results.push({name,ok:Boolean(ok),detail});if(!ok)process.exitCode=1;};
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{const full=path.join(dir,entry.name);return entry.isDirectory()?walk(full):[full];});
const files=walk(root).filter(file=>!file.includes(`${path.sep}.git${path.sep}`));
for(const file of files.filter(file=>file.endsWith('.json')||file.endsWith('.webmanifest'))){
  try{JSON.parse(fs.readFileSync(file,'utf8'));add(`json:${path.relative(root,file)}`,true);}catch(error){add(`json:${path.relative(root,file)}`,false,error.message);}
}
for(const rel of ['script.js','service-worker.js','data/game-data.js','data/build-info.js','data/track-layouts.js','src/core/build-system.js','src/core/runtime-guard.js','src/core/event-bus.js','src/core/data-contracts.js','data/asset-catalog.js','src/core/asset-registry.js','src/systems/persistence-system.js','src/systems/career-system.js','src/systems/race-engine.js','src/ui/screen-manager.js','src/core/viewport-manager.js','src/core/performance-monitor.js','src/core/diagnostics.js','data/sporting-data.js','src/core/sporting-database.js','data/regulation-data.js','src/core/regulation-engine.js','data/vehicle-data.js','src/core/vehicle-physics.js','data/strategy-data.js','src/core/race-strategy-ai.js']){
  try{new vm.Script(fs.readFileSync(path.join(root,rel),'utf8'),{filename:rel});add(`syntax:${rel}`,true);}catch(error){add(`syntax:${rel}`,false,error.message);}
}
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const shellFiles=JSON.parse(fs.readFileSync(path.join(root,'config/app-shell.json'),'utf8')).files.filter(file=>file!=='./').map(file=>file.replace(/^\.\//,''));
for(const rel of shellFiles) add(`app-shell:${rel}`,fs.existsSync(path.join(root,rel))&&(['manifest.webmanifest','index.html'].includes(rel)||index.includes(rel)),index.includes(rel)||['manifest.webmanifest','index.html'].includes(rel)?'':'não referenciado no index');
const assetDir=path.join(root,'assets');
const allowed=new Set(['.txt','.json','.md']);
const binaryFiles=walk(assetDir).filter(file=>!allowed.has(path.extname(file).toLowerCase()));
add('assets:no-binaries-in-phase-zip',binaryFiles.length===0,binaryFiles.map(file=>path.relative(root,file)).join(', '));
const assetManifest=JSON.parse(fs.readFileSync(path.join(assetDir,'ASSET_MANIFEST.json'),'utf8'));
const build=JSON.parse(fs.readFileSync(path.join(root,'BUILD_INFO.json'),'utf8'));
add('assets:manifest-build',assetManifest.build_code===build.build_code,assetManifest.build_code);
add('assets:manifest-version',Number(assetManifest.manifest_version)===Number(build.assets_manifest),String(assetManifest.manifest_version));
add('assets:original-catalogue',assetManifest.counts.original_binary_files===416,String(assetManifest.counts.original_binary_files));
add('assets:runtime-missing-documented',assetManifest.counts.missing_runtime_required_paths===7,String(assetManifest.counts.missing_runtime_required_paths));
const manifestPaths=new Set(assetManifest.entries.map(entry=>entry.path));
for(const required of ['assets/drivers/avatars/f2/alex_dunne.png','assets/drivers/avatars/f2/enzo_fittipaldi_jr.png','assets/drivers/avatars/f2/john_bennett.png','assets/drivers/avatars/f2/nikola_tsolov.png','assets/drivers/avatars/f2/tasanapol_inthraphuvasak.png','assets/icons/app/icon-192.png','assets/icons/app/icon-512.png']) add(`assets:missing-path-catalogued:${required}`,manifestPaths.has(required));
add('build:visible-home',index.includes('homeBuildPill'));
add('build:visible-global',index.includes('globalBuildStamp'));
add('build:visible-race',index.includes('raceBuildStamp'));
add('build:source-exists',fs.existsSync(path.join(root,'config/build-source.json')));
add('build:single-source-generator',fs.readFileSync(path.join(root,'tools/generate-build.mjs'),'utf8').includes("writeJson('package.json'"));
add('build:save-schema',Number(build.save_schema)===Number(build.phase),String(build.save_schema));
add('system:tab-visible',index.includes('data-tab="system"'));
add('system:core-modules',['src/core/diagnostics.js','src/core/data-contracts.js','data/asset-catalog.js','src/core/asset-registry.js','src/systems/persistence-system.js','src/systems/career-system.js','src/systems/race-engine.js','src/ui/screen-manager.js','src/core/performance-monitor.js','src/core/viewport-manager.js','data/i18n.js','src/core/i18n-system.js','data/sporting-data.js','src/core/sporting-database.js','data/regulation-data.js','src/core/regulation-engine.js','data/vehicle-data.js','src/core/vehicle-physics.js','data/strategy-data.js','src/core/race-strategy-ai.js'].every(rel=>fs.existsSync(path.join(root,rel))));
const persistenceSource=fs.readFileSync(path.join(root,'src/systems/persistence-system.js'),'utf8');
add('persistence:v2-envelope',persistenceSource.includes('F1M_SAVE_ENVELOPE_V2'));
add('persistence:portable-export',persistenceSource.includes('F1M_PORTABLE_SAVE_V1') && persistenceSource.includes('createPortableExport'));
add('persistence:atomic-commit',persistenceSource.includes('atomicCommit') && persistenceSource.includes('_tmp'));
add('persistence:journal',persistenceSource.includes('F1M_SAVE_JOURNAL_V1') && persistenceSource.includes('appendJournal'));
const persistenceReportPath=path.join(root,'test-results/persistence-audit.json');
if(fs.existsSync(persistenceReportPath)){ const persistenceReport=JSON.parse(fs.readFileSync(persistenceReportPath,'utf8')); add('persistence:audit-pass',persistenceReport.failed===0,`${persistenceReport.passed} passed, ${persistenceReport.failed} failed`); }
else add('persistence:audit-present',false,'arquivo ausente');
add('pwa:core-cached',shellFiles.every(rel=>fs.readFileSync(path.join(root,'service-worker.js'),'utf8').includes('./'+rel)||rel==='manifest.webmanifest'));
const browserPath=path.join(root,'test-results/browser-audit.json');
if(fs.existsSync(browserPath)){
  const browser=JSON.parse(fs.readFileSync(browserPath,'utf8'));
  add('browser:all-viewports-pass',browser.cases?.every(item=>item.passed),browser.cases?.map(item=>`${item.name}:${item.passed}`).join(', ')||'sem casos');
  add('browser:current-build',browser.build===build.build_code,browser.build||'sem build');
}else add('browser:audit-present',false,'arquivo ausente');

for (const [label, rel] of [['performance','test-results/performance-audit.json'], ['mobile','test-results/mobile-ux-audit.json'], ['i18n','test-results/i18n-audit.json'], ['visual','test-results/visual-regression-audit.json'], ['ci','test-results/ci-readiness-audit.json']]) {
  const file = path.join(root, rel);
  if(fs.existsSync(file)){
    const report = JSON.parse(fs.readFileSync(file,'utf8'));
    add(`${label}:audit-pass`, Number(report.failed || 0) === 0 || report.result === 'approved', `${report.passed || 0} passed, ${report.failed || 0} failed`);
    add(`${label}:current-build`, report.build === build.build_code, report.build || 'sem build');
  } else add(`${label}:audit-present`, false, 'arquivo ausente');
}
add('ci:workflow-present', fs.existsSync(path.join(root,'.github/workflows/quality-gate.yml')), 'quality-gate.yml');
add('performance:core-present', fs.existsSync(path.join(root,'src/core/performance-monitor.js')), 'performance-monitor.js');
add('viewport:core-present', fs.existsSync(path.join(root,'src/core/viewport-manager.js')) && index.includes('src/core/viewport-manager.js'), 'viewport-manager.js');
add('sporting:data-present', fs.existsSync(path.join(root,'data/sporting-data.js')) && fs.existsSync(path.join(root,'src/core/sporting-database.js')), 'sporting database');
add('sporting:audit-present', fs.existsSync(path.join(root,'test-results/sporting-data-audit.json')) && JSON.parse(fs.readFileSync(path.join(root,'test-results/sporting-data-audit.json'),'utf8')).failed === 0, 'sporting audit');
add('regulations:data-present', fs.existsSync(path.join(root,'data/regulation-data.js')) && fs.existsSync(path.join(root,'src/core/regulation-engine.js')), 'regulation engine');
add('regulations:audit-present', fs.existsSync(path.join(root,'test-results/regulation-audit.json')) && JSON.parse(fs.readFileSync(path.join(root,'test-results/regulation-audit.json'),'utf8')).failed === 0, 'regulation audit');
add('vehicle:data-present', fs.existsSync(path.join(root,'data/vehicle-data.js')) && fs.existsSync(path.join(root,'src/core/vehicle-physics.js')) && fs.readFileSync(path.join(root,'index.html'),'utf8').includes('src/core/vehicle-physics.js'), 'vehicle physics');
add('vehicle:audit-present', fs.existsSync(path.join(root,'test-results/vehicle-physics-audit.json')) && JSON.parse(fs.readFileSync(path.join(root,'test-results/vehicle-physics-audit.json'),'utf8')).failed === 0, 'vehicle audit');
add('vehicle:ui-present', fs.readFileSync(path.join(root,'script.js'),'utf8').includes('vehicleMiniHTML') && fs.readFileSync(path.join(root,'script.js'),'utf8').includes('vehicleTelemetryText'), 'system card + telemetry');
add('strategy:data-present', fs.existsSync(path.join(root,'data/strategy-data.js')) && fs.existsSync(path.join(root,'src/core/race-strategy-ai.js')) && fs.readFileSync(path.join(root,'index.html'),'utf8').includes('src/core/race-strategy-ai.js'), 'strategy ai');
add('strategy:audit-present', fs.existsSync(path.join(root,'test-results/strategy-ai-audit.json')) && JSON.parse(fs.readFileSync(path.join(root,'test-results/strategy-ai-audit.json'),'utf8')).failed === 0, 'strategy audit');
add('strategy:ui-present', fs.readFileSync(path.join(root,'script.js'),'utf8').includes('strategyMiniHTML') && fs.readFileSync(path.join(root,'script.js'),'utf8').includes('runStrategyAIAudit'), 'system card + action');
add('scroll:creator-fix-present', fs.readFileSync(path.join(root,'style.css'),'utf8').includes('correção de rolagem PC/mobile') && fs.readFileSync(path.join(root,'style.css'),'utf8').includes('asset-path-hint'), 'scroll + paths visible');

add('i18n:ui-present', index.includes('data-i18n-switcher') && fs.existsSync(path.join(root,'data/i18n.js')) && fs.existsSync(path.join(root,'src/core/i18n-system.js')) && fs.readFileSync(path.join(root,'script.js'),'utf8').includes('i18nMiniHTML'), 'seletor + sistema');
add('viewport:mobile-ui-present', index.includes('mobileUxPanel') && fs.readFileSync(path.join(root,'style.css'),'utf8').includes('hud-compact'), 'safe area + HUD');
const summary={build:build.build_code,generatedAt:new Date().toISOString(),passed:results.filter(r=>r.ok).length,failed:results.filter(r=>!r.ok).length,results};
fs.writeFileSync(path.join(root,'test-results/project-audit.json'),JSON.stringify(summary,null,2)+'\n');
console.log(results.map(r=>`${r.ok?'PASS':'FAIL'} ${r.name}${r.detail?' — '+r.detail:''}`).join('\n'));
console.log(`TOTAL: ${summary.passed} passed, ${summary.failed} failed`);
