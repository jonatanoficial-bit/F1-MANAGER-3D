import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const results=[];
const add=(name,ok,detail='')=>{results.push({name,ok:Boolean(ok),detail:String(detail||'')});if(!ok)process.exitCode=1;};
const memory=new Map();
const localStorage={getItem:key=>memory.has(String(key))?memory.get(String(key)):null,setItem:(key,value)=>memory.set(String(key),String(value)),removeItem:key=>memory.delete(String(key)),clear:()=>memory.clear()};
const sandbox={console,localStorage,setTimeout,clearTimeout,performance:{now:()=>1000},requestAnimationFrame:callback=>{sandbox.__frame=callback;return 1;},cancelAnimationFrame:()=>{},navigator:{userAgent:'contract-audit',language:'pt-BR',onLine:true},innerWidth:844,innerHeight:390,devicePixelRatio:1};
sandbox.globalThis=sandbox;sandbox.window=sandbox;
vm.createContext(sandbox);
const load=rel=>vm.runInContext(fs.readFileSync(path.join(root,rel),'utf8'),sandbox,{filename:rel});
for(const rel of ['data/build-info.js','src/core/event-bus.js','src/core/data-contracts.js','data/asset-catalog.js','src/core/asset-registry.js','src/systems/persistence-system.js','src/systems/career-system.js','src/systems/race-engine.js','src/ui/screen-manager.js','src/core/performance-monitor.js','data/game-data.js']) load(rel);
const core=sandbox.F1M_CORE; const data=sandbox.F1M_DATA; const build=sandbox.F1M_BUILD;

const assetRegistry=core.assets.createRegistry({catalog:sandbox.F1M_ASSET_CATALOG,roots:['assets/']});
add('assets:catalogue',assetRegistry.snapshot().counts.catalogued===519,String(assetRegistry.snapshot().counts.catalogued));
add('assets:path-safety',assetRegistry.normalizePath('../escape.png')===''&&assetRegistry.normalizePath('flags/all/br.png')==='assets/flags/all/br.png');
const registry=core.contracts.createRegistry(data);
add('contracts:data-valid',registry.validation.ok,`${registry.validation.score}/100`);
add('contracts:team-index',Boolean(registry.teamById(data.f1Teams2026[0].id)),data.f1Teams2026[0].id);
add('contracts:driver-index',Boolean(registry.driverByShort(data.f1Drivers2026[0].short)),data.f1Drivers2026[0].short);
add('contracts:counts',registry.allTeams().length>=20&&registry.allDrivers().length>=40,JSON.stringify(registry.snapshot()));

const events=[]; const bus=core.events.createBus(); const release=bus.on('audit',payload=>events.push(payload));
bus.emit('audit',{ok:true});release();bus.emit('audit',{ok:false});
add('events:on-off',events.length===1&&events[0].ok===true,JSON.stringify(bus.snapshot()));

const repo=core.persistence.createRepository({activeKey:'audit_active',legacyKeys:['audit_legacy'],schema:Number(build.save_schema),buildCode:build.build_code,storage:localStorage,backupCount:5});
localStorage.setItem('audit_legacy',JSON.stringify({saveSchema:2,currentSeries:'F2',roundIndex:0,inbox:[],lastRace:[],offers:[]}));
const legacy=repo.load();
add('persistence:legacy-read',legacy?.saveSchema===2,repo.inspect().lastLoad?.key);
const migrated=core.career.migrateState(legacy,{targetSchema:Number(build.save_schema),calendarLength:data.calendar2026.length,buildCode:build.build_code});
const saved=repo.save(migrated.state); const loaded=repo.load(); const info=repo.inspect();
add('career:migration-current',migrated.state.saveSchema===Number(build.save_schema)&&migrated.state.architecture?.version>=5&&migrated.state.saveVault?.format==='F1M_SAVE_ENVELOPE_V2'&&migrated.state.quality?.ciGate&&migrated.state.viewport?.safeAreaReady, migrated.applied.join(','));
add('career:state-contract',core.career.validateState(loaded,Number(build.save_schema)).ok);
add('persistence:envelope',saved.ok&&info.format===core.persistence.FORMAT&&info.valid,`${info.format}/${info.bytes}`);
add('persistence:checksum',repo.decode(localStorage.getItem('audit_active'),'audit_active').valid,info.reason);
repo.save({...loaded,money:123});
add('persistence:backup-rotation',repo.inspect().backups>=1,String(repo.inspect().backups));

let updates=0, renders=0; const engine=core.race.createEngine({requestFrame:callback=>{sandbox.__frame=callback;return 7;},cancelFrame:()=>{},now:()=>1000,update:()=>updates++,render:()=>renders++});
engine.start(); sandbox.__frame(1016); engine.stop('audit');
add('race-engine:lifecycle',updates===1&&renders===1&&!engine.isRunning(),JSON.stringify(engine.inspect()));

function classList(){const values=new Set();return{add:value=>values.add(value),remove:value=>values.delete(value),contains:value=>values.has(value)};}
const screens=[{id:'screen-home',classList:classList()},{id:'screen-race',classList:classList()}];screens[0].classList.add('active');
const documentMock={querySelectorAll:selector=>selector==='.screen'?screens:[],querySelector:selector=>selector==='.screen.active'?screens.find(item=>item.classList.contains('active')):null,getElementById:id=>screens.find(item=>item.id===id)||null};
const manager=core.ui.createScreenManager({document:documentMock}); const change=manager.show('race');
add('ui:screen-manager',change.ok&&manager.current()==='race'&&screens[1].classList.contains('active'));

const report={build:build.build_code,generatedAt:new Date().toISOString(),passed:results.filter(item=>item.ok).length,failed:results.filter(item=>!item.ok).length,results};
fs.mkdirSync(path.join(root,'test-results'),{recursive:true});
fs.writeFileSync(path.join(root,'test-results/contracts-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(results.map(item=>`${item.ok?'PASS':'FAIL'} ${item.name}${item.detail?' — '+item.detail:''}`).join('\n'));
console.log(`TOTAL: ${report.passed} passed, ${report.failed} failed`);
