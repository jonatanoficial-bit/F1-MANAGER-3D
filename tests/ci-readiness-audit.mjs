import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const build = readJson('BUILD_INFO.json');
const pkg = readJson('package.json');
const shell = readJson('config/app-shell.json');
const results = [];
const add = (name, ok, detail = '') => { results.push({ name, ok:Boolean(ok), detail:String(detail || '') }); if(!ok) process.exitCode = 1; };
const requiredScripts = ['build:sync','manifest:generate','test:static','test:build','test:modules','test:contracts','test:assets','test:persistence','test:performance','test:mobile','test:browser','test:visual','test:ci','test:project','audit:summary','audit'];
for(const script of requiredScripts) add(`ci:script:${script}`, Boolean(pkg.scripts?.[script]), pkg.scripts?.[script] || 'ausente');
const audit = String(pkg.scripts?.audit || '');
for(const script of ['test:performance','test:mobile','test:browser','test:visual','test:ci','test:project','audit:summary','manifest:generate']) add(`ci:audit-chain:${script}`, audit.includes(`npm run ${script}`), audit);
const workflow = path.join(root,'.github/workflows/quality-gate.yml');
add('ci:workflow-file', fs.existsSync(workflow), '.github/workflows/quality-gate.yml');
if(fs.existsSync(workflow)){
  const yml = fs.readFileSync(workflow,'utf8');
  add('ci:workflow-node20', yml.includes("node-version: '20'") || yml.includes('node-version: 20'), 'Node 20');
  add('ci:workflow-npm-ci', yml.includes('npm ci'), 'npm ci');
  add('ci:workflow-audit', yml.includes('npm run audit'), 'npm run audit');
  add('ci:workflow-artifacts', yml.includes('upload-artifact'), 'relatórios exportáveis');
}
for(const rel of ['config/quality-budgets.json','config/visual-baselines.json','src/core/performance-monitor.js','src/core/viewport-manager.js','tests/mobile-ux-audit.mjs','tests/performance-audit.mjs','tests/visual-regression-audit.mjs','tests/ci-readiness-audit.mjs']) add(`ci:file:${rel}`, fs.existsSync(path.join(root,rel)), rel);
add('ci:app-shell-performance-module', shell.files.includes('./src/core/performance-monitor.js'), 'PWA cache');
add('ci:app-shell-viewport-module', shell.files.includes('./src/core/viewport-manager.js'), 'PWA cache');
add('ci:no-postinstall', !pkg.scripts?.postinstall, 'sem execução oculta');
add('ci:private-package', pkg.private === true, 'não publicável acidentalmente');
const fullSummaryPath = path.join(root,'test-results/full-audit-summary.json');
if(fs.existsSync(fullSummaryPath)){
  const full = readJson('test-results/full-audit-summary.json');
  add('ci:summary-readable', Boolean(full.build), full.build || 'sem build');
}
const summary = { build:build.build_code, generatedAt:new Date().toISOString(), passed:results.filter(item=>item.ok).length, failed:results.filter(item=>!item.ok).length, results, result:results.every(item=>item.ok) ? 'approved' : 'failed' };
fs.writeFileSync(path.join(root,'test-results/ci-readiness-audit.json'), JSON.stringify(summary,null,2)+'\n');
console.log(results.map(item => `${item.ok?'PASS':'FAIL'} ${item.name}${item.detail?' — '+item.detail:''}`).join('\n'));
console.log(`TOTAL: ${summary.passed} passed, ${summary.failed} failed`);
