import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const results=[]; const add=(name,ok,detail='')=>{results.push({name,ok:Boolean(ok),detail});if(!ok)process.exitCode=1;};
const modules=['src/core/build-system.js','src/core/runtime-guard.js','src/core/event-bus.js','src/core/data-contracts.js','data/asset-catalog.js','src/core/asset-registry.js','src/systems/persistence-system.js','src/systems/career-system.js','src/systems/race-engine.js','src/ui/screen-manager.js','src/core/performance-monitor.js','src/core/diagnostics.js','data/i18n.js','src/core/i18n-system.js'];
for(const rel of modules){ try{new vm.Script(fs.readFileSync(path.join(root,rel),'utf8'),{filename:rel});add(`syntax:${rel}`,true);}catch(e){add(`syntax:${rel}`,false,e.message);} }
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const order=['data/build-info.js',...modules,'data/game-data.js','data/track-layouts.js','script.js'].map(x=>index.indexOf(x));
add('modules:load-order',order.every((value,index)=>value>=0&&(index===0||value>order[index-1])),order.join(','));
const script=fs.readFileSync(path.join(root,'script.js'),'utf8');
add('architecture:data-registry',script.includes('CORE.contracts?.createRegistry'));
add('architecture:event-bus',script.includes('CORE.events?.createBus'));
add('architecture:persistence',script.includes('CORE.persistence?.createRepository'));
add('architecture:career',script.includes('CORE.career?.migrateState'));
add('architecture:race-engine',script.includes('CORE.race.createEngine'));
add('architecture:screen-manager',script.includes('CORE.ui?.createScreenManager'));
add('architecture:i18n',script.includes('CORE.i18n?.createManager') && script.includes('i18nMiniHTML'));
add('system:tab',index.includes('data-tab="system"'));
add('system:diagnostic-action',script.includes('runSystemDiagnostics(){ runSystemDiagnostics(); }'));
add('save:new-key',script.includes('f1_manager_career_2026_v0150'));
add('save:migration-schema-4',script.includes('targetSchema:SAVE_SCHEMA'));
add('save:envelope-format',fs.readFileSync(path.join(root,'src/systems/persistence-system.js'),'utf8').includes('F1M_SAVE_ENVELOPE_V2'));
add('runtime:guard-used',script.includes('runtimeGuard?.capture'));
add('build:core-used',script.includes('CORE.build?.applyToDocument'));
fs.writeFileSync(path.join(root,'test-results/module-audit.json'),JSON.stringify({generatedAt:new Date().toISOString(),results},null,2)+'\n');
console.log(results.map(r=>`${r.ok?'PASS':'FAIL'} ${r.name}${r.detail?' — '+r.detail:''}`).join('\n'));

