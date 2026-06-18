import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const json = rel => JSON.parse(read(rel));
const build = json('BUILD_INFO.json');
const results = [];
const add = (name, ok, detail = '') => { results.push({ name, ok:Boolean(ok), detail:String(detail || '') }); if(!ok) process.exitCode = 1; };
const catalogSource = read('data/i18n.js');
const managerSource = read('src/core/i18n-system.js');
const index = read('index.html');
const script = read('script.js');
const appShell = json('config/app-shell.json').files;
const sw = read('service-worker.js');
try { new vm.Script(catalogSource, { filename:'data/i18n.js' }); add('i18n:catalog-syntax', true); } catch(error){ add('i18n:catalog-syntax', false, error.message); }
try { new vm.Script(managerSource, { filename:'src/core/i18n-system.js' }); add('i18n:manager-syntax', true); } catch(error){ add('i18n:manager-syntax', false, error.message); }

const sandbox = {
  console,
  globalThis:null,
  document:{
    documentElement:{ lang:'', dataset:{} },
    body:{ dataset:{}, querySelectorAll(){ return []; } },
    addEventListener(){},
    createTreeWalker(){ return { nextNode(){ return false; } }; },
    querySelectorAll(){ return []; }
  },
  window:null,
  localStorage:{ map:new Map(), getItem(k){ return this.map.get(k) || null; }, setItem(k,v){ this.map.set(k,String(v)); }, removeItem(k){ this.map.delete(k); } },
  navigator:{ language:'en-US', languages:['en-US'] },
  MutationObserver:class{ observe(){} },
  CustomEvent:class{ constructor(type, init){ this.type=type; this.detail=init?.detail; } },
  NodeFilter:{ SHOW_TEXT:4, FILTER_ACCEPT:1, FILTER_REJECT:2 },
  Intl
};
sandbox.globalThis = sandbox;
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(catalogSource, sandbox, { filename:'data/i18n.js' });
vm.runInContext(managerSource, sandbox, { filename:'src/core/i18n-system.js' });
const catalog = sandbox.F1M_I18N_CATALOG;
const manager = sandbox.F1M_CORE.i18n.createManager({ catalog, document:sandbox.document, window:sandbox, storageKey:'audit_lang' });
const audit = manager.audit();
add('i18n:supported-three-languages', Array.isArray(catalog.supported) && catalog.supported.map(x=>x.code).join(',') === 'pt-BR,en,es', catalog.supported?.map(x=>x.code).join(','));
add('i18n:fallback-ptbr', catalog.fallbackLanguage === 'pt-BR' && audit.fallback === 'pt-BR', `${catalog.fallbackLanguage}/${audit.fallback}`);
add('i18n:phrase-volume', Object.keys(catalog.phrases || {}).length >= 90, String(Object.keys(catalog.phrases || {}).length));
add('i18n:english-coverage', audit.languageCounts?.en >= 90, String(audit.languageCounts?.en || 0));
add('i18n:spanish-coverage', audit.languageCounts?.es >= 90, String(audit.languageCounts?.es || 0));
manager.setLanguage('en');
add('i18n:translate-home-english', manager.t('NOVO JOGO') === 'NEW GAME' && manager.t('CORRIDA') === 'RACE', `${manager.t('NOVO JOGO')}/${manager.t('CORRIDA')}`);
manager.setLanguage('es');
add('i18n:translate-home-spanish', manager.t('NOVO JOGO') === 'NUEVA PARTIDA' && manager.t('CORRIDA') === 'CARRERA', `${manager.t('NOVO JOGO')}/${manager.t('CORRIDA')}`);
manager.setLanguage('fr-FR');
add('i18n:unsupported-normalizes-fallback', manager.current() === 'pt-BR', manager.current());
add('i18n:index-meta', index.includes('name="f1m-i18n-languages" content="pt-BR,en,es"'), 'meta languages');
add('i18n:home-switcher', index.includes('data-i18n-switcher') && index.includes('language-panel'), 'home + mobile switcher');
add('i18n:script-integration', script.includes('CORE.i18n?.createManager') && script.includes('setLanguage(lang)') && script.includes('i18nMiniHTML'), 'manager + UI');
add('i18n:system-panel', script.includes('Idioma e região') && script.includes('Interface preparada para português, inglês e espanhol'), 'system card');
add('i18n:app-shell', appShell.includes('./data/i18n.js') && appShell.includes('./src/core/i18n-system.js') && sw.includes('./data/i18n.js') && sw.includes('./src/core/i18n-system.js'), 'shell + SW');
add('i18n:build-phase', Number(build.phase) === 8 && Number(build.save_schema) === 8, `${build.phase}/${build.save_schema}`);
const summary = { build:build.build_code, generatedAt:new Date().toISOString(), passed:results.filter(r=>r.ok).length, failed:results.filter(r=>!r.ok).length, results, result:results.every(r=>r.ok) ? 'approved' : 'failed' };
fs.mkdirSync(path.join(root,'test-results'), { recursive:true });
fs.writeFileSync(path.join(root,'test-results/i18n-audit.json'), JSON.stringify(summary, null, 2)+'\n');
console.log(results.map(r=>`${r.ok?'PASS':'FAIL'} ${r.name}${r.detail?' — '+r.detail:''}`).join('\n'));
console.log(`TOTAL: ${summary.passed} passed, ${summary.failed} failed`);
