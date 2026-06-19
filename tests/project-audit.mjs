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
for(const rel of ['script.js','service-worker.js','data/game-data.js','data/build-info.js','data/track-layouts.js','src/core/build-system.js','src/core/runtime-guard.js','src/core/event-bus.js','src/core/data-contracts.js','data/asset-catalog.js','src/core/asset-registry.js','src/systems/persistence-system.js','src/systems/career-system.js','src/systems/race-engine.js','src/ui/screen-manager.js','src/core/viewport-manager.js','src/core/performance-monitor.js','src/core/diagnostics.js','data/sporting-data.js','src/core/sporting-database.js','data/regulation-data.js','src/core/regulation-engine.js','data/vehicle-data.js','src/core/vehicle-physics.js','data/strategy-data.js','src/core/race-strategy-ai.js','data/balance-data.js','src/core/balance-simulator.js','data/visual-data.js','src/core/track-visual-system.js','data/audio-ui-data.js','src/core/audio-ui-system.js','data/living-career-data.js','src/core/living-career-system.js','data/backend-launch-data.js','src/core/backend-launch-system.js','data/release-candidate-data.js','src/core/release-candidate-system.js','data/deployment-data.js','src/core/deployment-system.js','data/operations-data.js','src/core/operations-system.js']){
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
add('system:core-modules',['src/core/diagnostics.js','src/core/data-contracts.js','data/asset-catalog.js','src/core/asset-registry.js','src/systems/persistence-system.js','src/systems/career-system.js','src/systems/race-engine.js','src/ui/screen-manager.js','src/core/performance-monitor.js','src/core/viewport-manager.js','data/i18n.js','src/core/i18n-system.js','data/sporting-data.js','src/core/sporting-database.js','data/regulation-data.js','src/core/regulation-engine.js','data/vehicle-data.js','src/core/vehicle-physics.js','data/strategy-data.js','src/core/race-strategy-ai.js','data/balance-data.js','src/core/balance-simulator.js','data/visual-data.js','src/core/track-visual-system.js','data/audio-ui-data.js','src/core/audio-ui-system.js','data/living-career-data.js','src/core/living-career-system.js','data/backend-launch-data.js','src/core/backend-launch-system.js','data/release-candidate-data.js','src/core/release-candidate-system.js','data/deployment-data.js','src/core/deployment-system.js','data/operations-data.js','src/core/operations-system.js'].every(rel=>fs.existsSync(path.join(root,rel))));
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
add('balance:data-present', fs.existsSync(path.join(root,'data/balance-data.js')) && fs.existsSync(path.join(root,'src/core/balance-simulator.js')) && fs.readFileSync(path.join(root,'index.html'),'utf8').includes('src/core/balance-simulator.js'), 'balance simulator');
add('balance:audit-present', fs.existsSync(path.join(root,'test-results/balance-audit.json')) && JSON.parse(fs.readFileSync(path.join(root,'test-results/balance-audit.json'),'utf8')).failed === 0, 'balance audit');
add('balance:ui-present', fs.readFileSync(path.join(root,'script.js'),'utf8').includes('balanceMiniHTML') && fs.readFileSync(path.join(root,'script.js'),'utf8').includes('runBalanceMonteCarlo'), 'system card + monte carlo');
add('visual3d:data-present', fs.existsSync(path.join(root,'data/visual-data.js')) && fs.existsSync(path.join(root,'src/core/track-visual-system.js')) && fs.readFileSync(path.join(root,'index.html'),'utf8').includes('src/core/track-visual-system.js'), 'track visual system');
add('visual3d:audit-present', fs.existsSync(path.join(root,'test-results/track-visual-audit.json')) && JSON.parse(fs.readFileSync(path.join(root,'test-results/track-visual-audit.json'),'utf8')).failed === 0, 'track visual audit');
add('visual3d:ui-present', fs.readFileSync(path.join(root,'script.js'),'utf8').includes('visual3dMiniHTML') && fs.readFileSync(path.join(root,'script.js'),'utf8').includes('runVisual3DAudit') && fs.readFileSync(path.join(root,'script.js'),'utf8').includes('addProfessionalVisuals'), 'system card + renderer hooks');
add('audio-ui:data-present', fs.existsSync(path.join(root,'data/audio-ui-data.js')) && fs.existsSync(path.join(root,'src/core/audio-ui-system.js')) && fs.readFileSync(path.join(root,'index.html'),'utf8').includes('src/core/audio-ui-system.js'), 'audio ui system');
add('audio-ui:audit-present', fs.existsSync(path.join(root,'test-results/audio-ui-audit.json')) && JSON.parse(fs.readFileSync(path.join(root,'test-results/audio-ui-audit.json'),'utf8')).failed === 0, 'audio ui audit');
add('audio-ui:ui-present', fs.readFileSync(path.join(root,'script.js'),'utf8').includes('audioUiMiniHTML') && fs.readFileSync(path.join(root,'script.js'),'utf8').includes('toggleAudioMute') && fs.readFileSync(path.join(root,'style.css'),'utf8').includes('tutorial-coach'), 'system card + accessibility css');
add('living-career:data-present', fs.existsSync(path.join(root,'data/living-career-data.js')) && fs.existsSync(path.join(root,'src/core/living-career-system.js')) && fs.readFileSync(path.join(root,'index.html'),'utf8').includes('src/core/living-career-system.js'), 'living career system');
add('living-career:audit-present', fs.existsSync(path.join(root,'test-results/living-career-audit.json')) && JSON.parse(fs.readFileSync(path.join(root,'test-results/living-career-audit.json'),'utf8')).failed === 0, 'living career audit');
add('living-career:ui-present', fs.readFileSync(path.join(root,'script.js'),'utf8').includes('livingCareerMiniHTML') && fs.readFileSync(path.join(root,'script.js'),'utf8').includes('runLivingCareerReview') && fs.readFileSync(path.join(root,'style.css'),'utf8').includes('living-career-card'), 'system card + review');
add('backend-launch:data-present', fs.existsSync(path.join(root,'data/backend-launch-data.js')) && fs.existsSync(path.join(root,'src/core/backend-launch-system.js')) && fs.readFileSync(path.join(root,'index.html'),'utf8').includes('src/core/backend-launch-system.js'), 'backend launch system');
add('backend-launch:audit-present', fs.existsSync(path.join(root,'test-results/backend-launch-audit.json')) && JSON.parse(fs.readFileSync(path.join(root,'test-results/backend-launch-audit.json'),'utf8')).failed === 0, 'backend launch audit');
add('backend-launch:ui-present', fs.readFileSync(path.join(root,'script.js'),'utf8').includes('backendLaunchMiniHTML') && fs.readFileSync(path.join(root,'script.js'),'utf8').includes('prepareReleaseCandidate') && fs.readFileSync(path.join(root,'style.css'),'utf8').includes('backend-launch-card'), 'system card + RC');
add('release-candidate:data-present', fs.existsSync(path.join(root,'data/release-candidate-data.js')) && fs.existsSync(path.join(root,'src/core/release-candidate-system.js')) && fs.readFileSync(path.join(root,'index.html'),'utf8').includes('src/core/release-candidate-system.js'), 'release candidate system');
add('release-candidate:audit-present', fs.existsSync(path.join(root,'test-results/release-candidate-audit.json')) && JSON.parse(fs.readFileSync(path.join(root,'test-results/release-candidate-audit.json'),'utf8')).failed === 0, 'release candidate audit');
add('release-candidate:ui-present', fs.readFileSync(path.join(root,'script.js'),'utf8').includes('releaseCandidateMiniHTML') && fs.readFileSync(path.join(root,'script.js'),'utf8').includes('prepareCommercialPackage') && fs.readFileSync(path.join(root,'style.css'),'utf8').includes('release-candidate-card'), 'system card + commercial package');

add('deployment:data-present', fs.existsSync(path.join(root,'data/deployment-data.js')) && fs.existsSync(path.join(root,'src/core/deployment-system.js')) && fs.readFileSync(path.join(root,'index.html'),'utf8').includes('src/core/deployment-system.js'), 'deployment system');
add('deployment:audit-present', fs.existsSync(path.join(root,'test-results/deployment-audit.json')) && JSON.parse(fs.readFileSync(path.join(root,'test-results/deployment-audit.json'),'utf8')).failed === 0, 'deployment audit');
add('deployment:ui-present', fs.readFileSync(path.join(root,'script.js'),'utf8').includes('deploymentMiniHTML') && fs.readFileSync(path.join(root,'script.js'),'utf8').includes('preparePublicBeta') && fs.readFileSync(path.join(root,'style.css'),'utf8').includes('deploy-card'), 'system card + beta');
add('operations:data-present', fs.existsSync(path.join(root,'data/operations-data.js')) && fs.existsSync(path.join(root,'src/core/operations-system.js')) && fs.readFileSync(path.join(root,'index.html'),'utf8').includes('src/core/operations-system.js'), 'operations system');
add('operations:audit-present', fs.existsSync(path.join(root,'test-results/operations-audit.json')) && JSON.parse(fs.readFileSync(path.join(root,'test-results/operations-audit.json'),'utf8')).failed === 0, 'operations audit');
add('operations:ui-present', fs.readFileSync(path.join(root,'script.js'),'utf8').includes('operationsMiniHTML') && fs.readFileSync(path.join(root,'script.js'),'utf8').includes('prepareHotfixPlan') && fs.readFileSync(path.join(root,'style.css'),'utf8').includes('operations-card'), 'system card + hotfix');

add('scroll:creator-fix-present', fs.readFileSync(path.join(root,'style.css'),'utf8').includes('correção de rolagem PC/mobile') && fs.readFileSync(path.join(root,'style.css'),'utf8').includes('asset-path-hint'), 'scroll + paths visible');

add('i18n:ui-present', index.includes('data-i18n-switcher') && fs.existsSync(path.join(root,'data/i18n.js')) && fs.existsSync(path.join(root,'src/core/i18n-system.js')) && fs.readFileSync(path.join(root,'script.js'),'utf8').includes('i18nMiniHTML'), 'seletor + sistema');
add('viewport:mobile-ui-present', index.includes('mobileUxPanel') && fs.readFileSync(path.join(root,'style.css'),'utf8').includes('hud-compact'), 'safe area + HUD');
const summary={build:build.build_code,generatedAt:new Date().toISOString(),passed:results.filter(r=>r.ok).length,failed:results.filter(r=>!r.ok).length,results};
fs.writeFileSync(path.join(root,'test-results/project-audit.json'),JSON.stringify(summary,null,2)+'\n');
console.log(results.map(r=>`${r.ok?'PASS':'FAIL'} ${r.name}${r.detail?' — '+r.detail:''}`).join('\n'));
console.log(`TOTAL: ${summary.passed} passed, ${summary.failed} failed`);
