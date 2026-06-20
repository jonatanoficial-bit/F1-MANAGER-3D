import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));
const build=read('BUILD_INFO.json');
const sourceList=[
  ['static','test-results/static-audit.json','checks'],
  ['build_consistency','test-results/build-consistency.json','results'],
  ['modules','test-results/module-audit.json','results'],
  ['contracts','test-results/contracts-audit.json','results'],
  ['assets','test-results/assets-audit.json','results'],
  ['persistence','test-results/persistence-audit.json','results'],
  ['performance','test-results/performance-audit.json',null],
  ['mobile','test-results/mobile-ux-audit.json',null],
  ['i18n','test-results/i18n-audit.json',null],
  ['sporting','test-results/sporting-data-audit.json',null],
  ['regulations','test-results/regulation-audit.json',null],
  ['vehicle','test-results/vehicle-physics-audit.json',null],
  ['strategy','test-results/strategy-ai-audit.json',null],
  ['balance','test-results/balance-audit.json',null],
  ['visual3d','test-results/track-visual-audit.json',null],
  ['audio_ui','test-results/audio-ui-audit.json',null],
  ['living_career','test-results/living-career-audit.json',null],
  ['backend_launch','test-results/backend-launch-audit.json',null],
  ['release_candidate','test-results/release-candidate-audit.json',null],
  ['deployment','test-results/deployment-audit.json',null],
  ['operations','test-results/operations-audit.json',null],
  ['asset_restore','test-results/asset-restore-audit.json',null],
  ['browser_cases','test-results/browser-audit.json','cases'],
  ['visual','test-results/visual-regression-audit.json',null],
  ['ci','test-results/ci-readiness-audit.json',null],
  ['project','test-results/project-audit.json',null]
];
const count=(value,key)=>Array.isArray(value?.[key])?{
  passed:value[key].filter(item=>item.ok!==false&&item.passed!==false).length,
  failed:value[key].filter(item=>item.ok===false||item.passed===false).length
}:{passed:Number(value?.passed||0),failed:Number(value?.failed||0)};
const sections={};
for(const [name,rel,key] of sourceList){
  const file=path.join(root,rel);
  if(!fs.existsSync(file)) sections[name]={passed:0,failed:1,missing:true};
  else sections[name]=count(read(rel),key);
}
const total={passed:Object.values(sections).reduce((sum,item)=>sum+item.passed,0),failed:Object.values(sections).reduce((sum,item)=>sum+item.failed,0)};
const summary={build:build.build_code,version:build.version,phase:build.phase,generated_at:new Date().toISOString(),...sections,total,result:total.failed===0?'approved':'failed'};
fs.writeFileSync(path.join(root,'test-results/full-audit-summary.json'),JSON.stringify(summary,null,2)+'\n');
console.log(`Resumo de auditoria: ${total.passed} aprovadas, ${total.failed} falhas`);
if(total.failed) process.exitCode=1;
