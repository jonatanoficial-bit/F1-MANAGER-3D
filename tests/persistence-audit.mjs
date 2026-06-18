import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const results = [];
const add = (name, ok, detail='') => { results.push({ name, ok:Boolean(ok), detail:String(detail || '') }); if(!ok) process.exitCode = 1; };

const memory = new Map();
const storage = {
  getItem:key => memory.has(String(key)) ? memory.get(String(key)) : null,
  setItem:(key,value) => { memory.set(String(key), String(value)); },
  removeItem:key => { memory.delete(String(key)); },
  clear:() => memory.clear(),
  key:index => Array.from(memory.keys())[index] || null,
  get length(){ return memory.size; }
};
const context = { globalThis:null, localStorage:storage, console, Date, JSON, Math, Object, Array, String, Number, Boolean, Error, WeakSet, Set, Map };
context.globalThis = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'src/systems/persistence-system.js'),'utf8'), context, { filename:'persistence-system.js' });
const build = JSON.parse(fs.readFileSync(path.join(root,'BUILD_INFO.json'),'utf8'));
const repo = context.F1M_CORE.persistence.createRepository({ activeKey:'audit_save', legacyKeys:['legacy_save'], schema:Number(build.save_schema), buildCode:build.build_code, storage, backupCount:5 });

const baseState = { profile:{ name:'Auditoria Save' }, currentSeries:'F2', currentTeam:'prema', completedRaces:2, money:12345, saveSchema:0 };
const first = repo.save(baseState);
add('save:commit-ok', first.ok, first.reason);
add('save:format-v2', JSON.parse(storage.getItem('audit_save')).format === 'F1M_SAVE_ENVELOPE_V2', JSON.parse(storage.getItem('audit_save')).format);
add('save:schema-current', JSON.parse(storage.getItem('audit_save')).payload.saveSchema === Number(build.save_schema), JSON.parse(storage.getItem('audit_save')).payload.saveSchema);
add('save:journal-created', repo.inspect().journalCount >= 1, String(repo.inspect().journalCount));

for(let i=0;i<6;i++) repo.save({ ...baseState, completedRaces:i, money:1000+i });
const info = repo.inspect();
add('backups:five-slots', info.backupSlots.length === 5, String(info.backupSlots.length));
add('backups:valid-count', info.backups === 5, String(info.backups));
add('tmp:clean-after-commit', info.tmp.exists === false, JSON.stringify(info.tmp));

const activeBefore = storage.getItem('audit_save');
storage.setItem('audit_save', activeBefore.slice(0, Math.max(10, Math.floor(activeBefore.length/2))));
const corrupted = repo.inspect();
add('corruption:detected', corrupted.valid === false, corrupted.reason);
const loaded = repo.load();
add('recovery:auto-loads-backup', loaded && Number(loaded.saveSchema) === Number(build.save_schema), JSON.stringify(loaded));
add('recovery:active-restored', repo.inspect().valid === true, repo.inspect().reason);

const pack = repo.createPortableExport(loaded, { audit:true });
add('export:portable-format', pack.format === 'F1M_PORTABLE_SAVE_V1', pack.format);
add('export:checksum-valid', context.F1M_CORE.persistence.parsePortable(JSON.stringify(pack)).checksum === pack.checksum, pack.checksum);
const imported = repo.importPortable(JSON.stringify(pack));
add('import:portable-ok', imported.ok, imported.reason);

let tamperOk = false;
try { const bad = { ...pack, payload:{ ...pack.payload, money:999999 } }; repo.importPortable(JSON.stringify(bad)); } catch(error){ tamperOk = String(error.message).includes('Checksum'); }
add('import:tamper-rejected', tamperOk, 'checksum mismatch esperado');

const summary = { build:build.build_code, generatedAt:new Date().toISOString(), passed:results.filter(item=>item.ok).length, failed:results.filter(item=>!item.ok).length, results };
fs.writeFileSync(path.join(root,'test-results/persistence-audit.json'), JSON.stringify(summary,null,2)+'\n');
console.log(results.map(item => `${item.ok?'PASS':'FAIL'} ${item.name}${item.detail ? ' — '+item.detail : ''}`).join('\n'));
console.log(`TOTAL: ${summary.passed} passed, ${summary.failed} failed`);
