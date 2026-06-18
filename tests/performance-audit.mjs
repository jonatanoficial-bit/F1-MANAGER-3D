import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const build = readJson('BUILD_INFO.json');
const config = readJson('config/quality-budgets.json');
const budgets = config.budgets || {};
const results = [];
const add = (name, ok, detail = '') => { results.push({ name, ok:Boolean(ok), detail:String(detail || '') }); if(!ok) process.exitCode = 1; };
const walk = dir => fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry => {
  const full = path.join(dir, entry.name);
  if(entry.name === 'node_modules' || entry.name === '.git') return [];
  return entry.isDirectory() ? walk(full) : [full];
});
const files = walk(root);
const size = rel => fs.statSync(path.join(root, rel)).size;
const appShell = readJson('config/app-shell.json').files.map(file => file.replace(/^\.\//,''));
const jsFiles = appShell.filter(file => file.endsWith('.js'));
const jsBytes = jsFiles.reduce((sum, file) => sum + size(file), 0);
const cssBytes = size('style.css');
const htmlBytes = size('index.html');
const dirBytesNoAssets = files.filter(file => !path.relative(root,file).startsWith(`assets${path.sep}`)).reduce((sum, file) => sum + fs.statSync(file).size, 0);
const allowedAssetExt = new Set(['.txt','.json','.md']);
const assetBinaryFiles = files.filter(file => path.relative(root,file).startsWith(`assets${path.sep}`) && !allowedAssetExt.has(path.extname(file).toLowerCase()));

add('budget:build-current', config.build === build.build_code, `${config.build}/${build.build_code}`);
add('budget:javascript-bytes', jsBytes <= Number(budgets.javascript_bytes || Infinity), `${jsBytes}/${budgets.javascript_bytes}`);
add('budget:css-bytes', cssBytes <= Number(budgets.css_bytes || Infinity), `${cssBytes}/${budgets.css_bytes}`);
add('budget:html-bytes', htmlBytes <= Number(budgets.html_bytes || Infinity), `${htmlBytes}/${budgets.html_bytes}`);
add('budget:directory-without-assets', dirBytesNoAssets <= Number(budgets.directory_bytes_without_assets || Infinity), `${dirBytesNoAssets}/${budgets.directory_bytes_without_assets}`);
add('budget:app-shell-size', appShell.length <= Number(budgets.app_shell_files_max || Infinity), `${appShell.length}/${budgets.app_shell_files_max}`);
add('budget:no-asset-binaries', assetBinaryFiles.length === Number(budgets.asset_binary_files_in_phase_zip || 0), assetBinaryFiles.map(file => path.relative(root,file)).join(', '));
add('performance:module-present', fs.existsSync(path.join(root,'src/core/performance-monitor.js')));
add('performance:module-cached', appShell.includes('src/core/performance-monitor.js'));
add('performance:html-load-order', fs.readFileSync(path.join(root,'index.html'),'utf8').indexOf('src/core/performance-monitor.js') > fs.readFileSync(path.join(root,'index.html'),'utf8').indexOf('src/ui/screen-manager.js'));
add('performance:script-action', fs.readFileSync(path.join(root,'script.js'),'utf8').includes('runPerformanceAudit') && fs.readFileSync(path.join(root,'script.js'),'utf8').includes('QUALITY_BUDGETS'));
add('performance:diagnostics-integrated', fs.readFileSync(path.join(root,'src/core/diagnostics.js'),'utf8').includes('core.performance?.run'));

try {
  const sandbox = { globalThis:{}, Blob, innerWidth:844, innerHeight:390, devicePixelRatio:1, performance:{now:()=>1000} };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(root,'src/core/performance-monitor.js'),'utf8'), sandbox, {filename:'performance-monitor.js'});
  const api = sandbox.F1M_CORE?.performance;
  add('performance:api-loaded', Boolean(api?.collectStatic && api?.run));
  const fakeStorage = new Map();
  const storage = { getItem:key => fakeStorage.get(String(key)) || null, setItem:(key,value) => fakeStorage.set(String(key), String(value)), removeItem:key => fakeStorage.delete(String(key)), key:index => Array.from(fakeStorage.keys())[index] || null, get length(){ return fakeStorage.size; } };
  sandbox.localStorage = storage;
  const fakeDocument = { querySelectorAll(selector){ return { length: selector === '*' ? 80 : selector === 'button' ? 22 : selector.includes('img') ? 14 : 0 }; } };
  const report = api.collectStatic({ document:fakeDocument, storage, budgets });
  add('performance:static-probe-pass', report.checks.every(item => item.ok), `${report.checks.filter(item=>item.ok).length}/${report.checks.length}`);
} catch(error){ add('performance:api-execution', false, error.message); }

const summary = { build:build.build_code, generatedAt:new Date().toISOString(), passed:results.filter(item=>item.ok).length, failed:results.filter(item=>!item.ok).length, metrics:{ jsBytes, cssBytes, htmlBytes, dirBytesNoAssets, appShellFiles:appShell.length }, results, result:results.every(item=>item.ok) ? 'approved' : 'failed' };
fs.writeFileSync(path.join(root,'test-results/performance-audit.json'), JSON.stringify(summary,null,2)+'\n');
console.log(results.map(item => `${item.ok?'PASS':'FAIL'} ${item.name}${item.detail?' — '+item.detail:''}`).join('\n'));
console.log(`TOTAL: ${summary.passed} passed, ${summary.failed} failed`);
