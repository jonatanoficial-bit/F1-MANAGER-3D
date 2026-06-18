import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const build = readJson('BUILD_INFO.json');
const baseline = readJson('config/visual-baselines.json');
const browserPath = path.join(root,'test-results/browser-audit.json');
const results = [];
const add = (name, ok, detail = '') => { results.push({ name, ok:Boolean(ok), detail:String(detail || '') }); if(!ok) process.exitCode = 1; };
const index = fs.readFileSync(path.join(root,'index.html'),'utf8');
const css = fs.readFileSync(path.join(root,'style.css'),'utf8');
add('visual:baseline-current', baseline.build === build.build_code, `${baseline.build}/${build.build_code}`);
for(const selector of baseline.protectedSelectors || []){
  const id = selector.startsWith('#') ? selector.slice(1) : '';
  add(`visual:protected-selector:${selector}`, id ? index.includes(`id="${id}"`) || index.includes(`id='${id}'`) : index.includes(selector), 'preservado no HTML');
}
const corpus = (index + '\n' + fs.readFileSync(path.join(root,'script.js'),'utf8')).toLowerCase();
for(const text of baseline.requiredText || []) add(`visual:text:${text}`, corpus.includes(String(text).toLowerCase()), 'texto base');
add('visual:responsive-css', css.includes('@media') && css.includes('max-width'), 'media queries presentes');
add('visual:safe-area-css', css.includes('safe-area-inset') || index.includes('viewport-fit=cover'), 'safe area/notch');
add('visual:orientation-lock', index.includes('orientationLock') && css.includes('orientation-lock'), 'overlay horizontal');
add('visual:assets-placeholders', fs.readFileSync(path.join(root,'src/core/asset-registry.js'),'utf8').includes('placeholder') && css.includes('fallback-badge'), 'fallback visual');

if(fs.existsSync(browserPath)){
  const browser = readJson('test-results/browser-audit.json');
  add('visual:browser-build', browser.build === build.build_code, browser.build || 'sem build');
  for(const item of browser.cases || []){
    const expected = baseline.viewports?.[item.name];
    add(`visual:viewport-executed:${item.name}`, Boolean(expected), `${item.viewport?.join('x')}`);
    add(`visual:viewport-pass:${item.name}`, Boolean(item.passed), item.passed ? 'fluxo passou' : 'fluxo falhou');
    const overflow = Number(item.layout?.scrollWidth || 0) - Number(item.layout?.clientWidth || 0);
    add(`visual:overflow:${item.name}`, overflow <= Number(expected?.maxHorizontalOverflowPx ?? 80), `${overflow}px`);
    add(`visual:orientation-overlay:${item.name}`, Boolean(item.layout?.orientationVisible) === Boolean(expected?.orientationVisible || false), String(item.layout?.orientationVisible));
    const race = item.steps?.find(step => step.race);
    add(`visual:race-results:${item.name}`, Boolean(race?.results >= 20), `${race?.results || 0} linhas`);
  }
} else add('visual:browser-report-present', false, 'rode npm run test:browser antes');

const snapshot = {
  protectedSelectors:baseline.protectedSelectors,
  screens:[...index.matchAll(/<section id="screen-([^"]+)"/g)].map(match => match[1]),
  cssBytes:Buffer.byteLength(css),
  indexBytes:Buffer.byteLength(index)
};
const hash = crypto.createHash('sha256').update(JSON.stringify(snapshot)).digest('hex');
const summary = { build:build.build_code, generatedAt:new Date().toISOString(), snapshotHash:hash, passed:results.filter(item=>item.ok).length, failed:results.filter(item=>!item.ok).length, results, result:results.every(item=>item.ok) ? 'approved' : 'failed' };
fs.writeFileSync(path.join(root,'test-results/visual-regression-audit.json'), JSON.stringify(summary,null,2)+'\n');
console.log(results.map(item => `${item.ok?'PASS':'FAIL'} ${item.name}${item.detail?' — '+item.detail:''}`).join('\n'));
console.log(`SNAPSHOT: ${hash}`);
console.log(`TOTAL: ${summary.passed} passed, ${summary.failed} failed`);
