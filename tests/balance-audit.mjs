import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const results=[];
const add=(name,ok,detail='')=>{ results.push({name,ok:Boolean(ok),detail}); if(!ok) process.exitCode=1; };
const context={ console, Math, Date, setTimeout, clearTimeout };
context.globalThis=context; context.window=context;
for(const rel of ['data/balance-data.js','src/core/balance-simulator.js']){
  vm.runInNewContext(fs.readFileSync(path.join(root,rel),'utf8'),context,{filename:rel});
}
add('balance:data-global', Boolean(context.F1M_BALANCE_DATA?.targets?.dnfRate), 'balance-data.js');
add('balance:factory', typeof context.F1M_CORE?.balance?.createBalanceSimulator === 'function', 'createBalanceSimulator');
const sim=context.F1M_CORE.balance.createBalanceSimulator({data:context.F1M_BALANCE_DATA});
const audit=sim.audit();
add('balance:audit-score', audit.score >= 92, String(audit.score));
for(const id of ['monte-carlo-engine','deterministic-seed','dnf-distribution','overtake-distribution','pit-stop-distribution','gap-distribution','team-tier-shares','backmarker-points','progression-model','difficulty-no-cheat','recommendations','confidence-bands']){
  add(`balance:${id}`, audit.checks.some(item=>item.id===id && item.ok));
}
const teams=[
  {id:'top',name:'Top Racing',tier:'top',car:{aero:88,engine:87,chassis:84,reliability:78,tyres:80,pitStop:82}},
  {id:'mid',name:'Mid Motorsport',tier:'mid',car:{aero:66,engine:64,chassis:63,reliability:67,tyres:65,pitStop:60}},
  {id:'back',name:'Backmarker GP',tier:'back',car:{aero:48,engine:49,chassis:46,reliability:58,tyres:55,pitStop:50}}
];
const drivers=[];
for(const team of teams){
  for(let i=0;i<2;i++) drivers.push({short:`${team.id}${i}`,team:team.id,speed:team.tier==='top'?86:team.tier==='mid'?70:56,consistency:70+i*4,racecraft:68+i*3,aggression:62+i*6});
}
const reportA=sim.simulateMonteCarlo({teams,drivers,runs:64,seed:777,laps:24,difficulty:'normal'});
const reportB=sim.simulateMonteCarlo({teams,drivers,runs:64,seed:777,laps:24,difficulty:'normal'});
add('balance:monte-carlo-runs', reportA.runs===64, String(reportA.runs));
add('balance:deterministic-report', JSON.stringify(reportA.metrics)===JSON.stringify(reportB.metrics), JSON.stringify(reportA.metrics));
add('balance:metrics-present', ['dnfRate','pitStopsPerDriver','overtakesPerRace','winningGapSeconds','fieldSpreadSeconds','topTeamWinShare','midfieldPointsShare','backmarkerPointsShare'].every(k=>Number.isFinite(Number(reportA.metrics[k]))), JSON.stringify(reportA.metrics));
add('balance:score-cards', reportA.scoreCards.length >= 8 && reportA.scoreCards.every(c=>Number.isFinite(c.score)), String(reportA.scoreCards.length));
add('balance:distributions', Boolean(reportA.distributions?.overtakes?.median !== undefined && reportA.distributions?.dnfCount?.p95 !== undefined), JSON.stringify(reportA.distributions?.overtakes));
add('balance:recommendations-array', Array.isArray(reportA.recommendations), reportA.recommendations.join(' | '));
const progression=sim.projectTeamProgression(teams,3,222);
add('balance:progression-teams', progression.length===teams.length && progression.every(t=>t.history.length===3), JSON.stringify(progression));
add('balance:difficulty-no-hidden-grip', sim.auditDifficultyModels().every(item=>item.noHiddenGrip && item.playerBonusWithinLimit && item.rivalGrowthDeclared), JSON.stringify(sim.auditDifficultyModels()));
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const script=fs.readFileSync(path.join(root,'script.js'),'utf8');
add('balance:index-scripts', index.includes('data/balance-data.js') && index.includes('src/core/balance-simulator.js'), 'index scripts');
add('balance:system-ui', script.includes('balanceMiniHTML') && script.includes('runBalanceMonteCarlo') && script.includes('Balanceamento F13'), 'script UI');
const build=JSON.parse(fs.readFileSync(path.join(root,'BUILD_INFO.json'),'utf8'));
const report={build:build.build_code,generatedAt:new Date().toISOString(),passed:results.filter(r=>r.ok).length,failed:results.filter(r=>!r.ok).length,results,audit,monteCarlo:reportA};
fs.mkdirSync(path.join(root,'test-results'),{recursive:true});
fs.writeFileSync(path.join(root,'test-results/balance-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(results.map(r=>`${r.ok?'PASS':'FAIL'} ${r.name}${r.detail?' — '+r.detail:''}`).join('\n'));
console.log(`TOTAL: ${report.passed} passed, ${report.failed} failed`);
