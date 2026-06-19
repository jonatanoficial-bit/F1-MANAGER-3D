import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const results=[];
const add=(name,ok,detail='')=>{ results.push({name,ok:Boolean(ok),detail}); if(!ok) process.exitCode=1; };
const context={ console, Math, Date };
context.globalThis=context; context.window=context;
for(const rel of ['data/visual-data.js','src/core/track-visual-system.js']){
  vm.runInNewContext(fs.readFileSync(path.join(root,rel),'utf8'), context, { filename:rel });
}
add('visual:data-global', Boolean(context.F1M_VISUAL_DATA?.visualSystems?.realTrackWidth), 'visual-data.js');
add('visual:factory', typeof context.F1M_CORE?.visual3d?.createTrackVisualSystem === 'function', 'createTrackVisualSystem');
const visual=context.F1M_CORE.visual3d.createTrackVisualSystem({data:context.F1M_VISUAL_DATA});
const audit=visual.audit();
add('visual:audit-score', audit.score >= 94, String(audit.score));
for(const id of ['realTrackWidth','elevationMesh','pitLaneAndBoxes','sectorBoards','drsZoneMarkers','racingLineOverlay','carLod','damageVisuals','rainAndSpray','tvCameras','onboardCamera','pitWallCamera','replayBuffer','rendererDisposal','noBinaryAssetsRequired','camera-presets','quality-profiles','legal-procedural']){
  add(`visual:${id}`, audit.checks.some(item=>item.id===id && item.ok));
}
const model=visual.createTrackModel({id:'spain',name:'Spain GP',track:'classic',weather:'variable'},{width:844,height:390,dpr:1,weather:'variable'});
add('visual:model-width', model.worldWidth >= 4.5 && model.widthMeters >= 12, JSON.stringify({worldWidth:model.worldWidth,widthMeters:model.widthMeters}));
add('visual:model-sectors', model.sectors.length === 3 && model.drsZones.length >= 2, JSON.stringify(model.sectors));
add('visual:elevation-varies', visual.elevationAt(.15,model) !== visual.elevationAt(.55,model), `${visual.elevationAt(.15,model)}/${visual.elevationAt(.55,model)}`);
add('visual:drs-lookup', Boolean(visual.drsAt(.2,model)) && !visual.drsAt(.45,model), JSON.stringify(visual.drsAt(.2,model)));
const buffer=visual.createReplayBuffer(3);
buffer.push({tick:1,marker:'start'});buffer.push({tick:2});buffer.push({tick:3,marker:'overtake'});buffer.push({tick:4});
add('visual:replay-limit', buffer.length===3 && buffer.latest(1)[0].tick===4, String(buffer.length));
add('visual:replay-markers', buffer.markers().length===1 && buffer.markers()[0].marker==='overtake', JSON.stringify(buffer.markers()));
const frame=visual.captureFrame({tick:12.2,cameraMode:'tv',safetyCar:0,entries:[{driver:{short:'PIL'},pos:1,progress:1.21,lap:2,pits:1,vehicle:{aeroDamage:8,chassisDamage:3}}]},model);
add('visual:capture-frame', frame.leader==='PIL' && frame.cars[0].damage===11 && frame.sector==='S1', JSON.stringify(frame));
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const script=fs.readFileSync(path.join(root,'script.js'),'utf8');
add('visual:index-scripts', index.includes('data/visual-data.js') && index.includes('src/core/track-visual-system.js'), 'index scripts');
add('visual:system-ui', script.includes('visual3dMiniHTML') && script.includes('runVisual3DAudit') && script.includes('Corrida 3D F14'), 'script UI');
add('visual:renderer-hooks', script.includes('visualSystem?.createTrackModel') && script.includes('addProfessionalVisuals') && script.includes('recordReplayFrame'), 'renderer hooks');
const build=JSON.parse(fs.readFileSync(path.join(root,'BUILD_INFO.json'),'utf8'));
const report={build:build.build_code,generatedAt:new Date().toISOString(),passed:results.filter(r=>r.ok).length,failed:results.filter(r=>!r.ok).length,results,audit,model,frame};
fs.mkdirSync(path.join(root,'test-results'),{recursive:true});
fs.writeFileSync(path.join(root,'test-results/track-visual-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(results.map(r=>`${r.ok?'PASS':'FAIL'} ${r.name}${r.detail?' — '+r.detail:''}`).join('\n'));
console.log(`TOTAL: ${report.passed} passed, ${report.failed} failed`);
