import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));
const build=read('BUILD_INFO.json');
const sources={
  static:read('test-results/static-audit.json'),
  build_consistency:read('test-results/build-consistency.json'),
  modules:read('test-results/module-audit.json'),
  contracts:read('test-results/contracts-audit.json'),
  assets:read('test-results/assets-audit.json'),
  persistence:read('test-results/persistence-audit.json'),
  browser:read('test-results/browser-audit.json'),
  performance:read('test-results/performance-audit.json'),
  mobile:read('test-results/mobile-ux-audit.json'),
  visual:read('test-results/visual-regression-audit.json'),
  ci:read('test-results/ci-readiness-audit.json'),
  project:read('test-results/project-audit.json')
};
const count=(value,key)=>Array.isArray(value?.[key])?{
  passed:value[key].filter(item=>item.ok!==false&&item.passed!==false).length,
  failed:value[key].filter(item=>item.ok===false||item.passed===false).length
}:{passed:Number(value?.passed||0),failed:Number(value?.failed||0)};
const sections={
  static:count(sources.static,'checks'),
  build_consistency:count(sources.build_consistency,'results'),
  modules:count(sources.modules,'results'),
  contracts:count(sources.contracts,'results'),
  assets:count(sources.assets,'results'),
  persistence:count(sources.persistence,'results'),
  browser_cases:count(sources.browser,'cases'),
  performance:{passed:Number(sources.performance.passed||0),failed:Number(sources.performance.failed||0)},
  mobile:{passed:Number(sources.mobile.passed||0),failed:Number(sources.mobile.failed||0)},
  visual:{passed:Number(sources.visual.passed||0),failed:Number(sources.visual.failed||0)},
  ci:{passed:Number(sources.ci.passed||0),failed:Number(sources.ci.failed||0)},
  project:{passed:Number(sources.project.passed||0),failed:Number(sources.project.failed||0)}
};
const total={passed:Object.values(sections).reduce((sum,item)=>sum+item.passed,0),failed:Object.values(sections).reduce((sum,item)=>sum+item.failed,0)};
const summary={build:build.build_code,version:build.version,phase:build.phase,generated_at:new Date().toISOString(),...sections,total,result:total.failed===0?'approved':'failed'};
fs.writeFileSync(path.join(root,'test-results/full-audit-summary.json'),JSON.stringify(summary,null,2)+'\n');
console.log(`Resumo de auditoria: ${total.passed} aprovadas, ${total.failed} falhas`);
if(total.failed) process.exitCode=1;
