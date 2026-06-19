import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const root = process.cwd();
const sandbox = { globalThis:{}, console };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
for (const rel of ['data/deployment-data.js','src/core/deployment-system.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, rel), 'utf8'), sandbox, { filename: rel });
}
const system = sandbox.F1M_CORE.deployValidation.createDeploymentValidationSystem({ data:sandbox.F1M_DEPLOYMENT_DATA });
const state = {};
system.initializeState(state, { buildCode:'AUDIT' });
const audit = system.audit({ state, buildCode:'AUDIT' });
const plan = system.assetRestorePlan(state, { buildCode:'AUDIT' });
const beta = system.preparePublicBeta(state, { buildCode:'AUDIT' });
const checks = [];
const add = (id, ok, detail='') => checks.push({ id, ok:Boolean(ok), detail });
add('audit-score', audit.score === 100, String(audit.score));
add('audit-checks', audit.passed >= 14 && audit.failed === 0, `${audit.passed}/${audit.failed}`);
add('asset-docs', plan.requiredDocs.length >= 4, String(plan.requiredDocs.length));
add('asset-sample-paths', plan.samplePaths.some(p=>p.includes('avatar_01.png')), plan.samplePaths.join(','));
add('beta-blocked-production', beta.publishAllowed === false && beta.blockers.length >= 4, beta.packageId);
add('state-migrated', state.deployment?.channel === 'public-beta-candidate', state.deployment?.channel || 'n/d');
add('github-path-memory', sandbox.F1M_DEPLOYMENT_DATA.uploadMemory.gitBashPath.includes('F1 Manager 3D'), sandbox.F1M_DEPLOYMENT_DATA.uploadMemory.gitBashPath);
const failed = checks.filter(c=>!c.ok);
const out = { generated_at:new Date().toISOString(), passed:checks.length-failed.length, failed:failed.length, checks, audit };
fs.mkdirSync(path.join(root,'test-results'), { recursive:true });
fs.writeFileSync(path.join(root,'test-results','deployment-audit.json'), JSON.stringify(out,null,2)+'\n');
if(failed.length){
  console.error(JSON.stringify(out,null,2));
  process.exit(1);
}
console.log(`Deployment F19 audit OK: ${out.passed} checks`);
