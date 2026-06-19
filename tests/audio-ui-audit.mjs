import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const results=[]; const add=(name,ok,detail='')=>{results.push({name,ok:Boolean(ok),detail}); if(!ok) process.exitCode=1;};
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
for(const rel of ['data/audio-ui-data.js','src/core/audio-ui-system.js']){
  try{ new vm.Script(read(rel),{filename:rel}); add(`syntax:${rel}`,true); } catch(error){ add(`syntax:${rel}`,false,error.message); }
}
const sandbox = { globalThis:{}, window:{}, document:{ documentElement:{ dataset:{}, style:{ setProperty(){} } } } };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(read('data/audio-ui-data.js'), sandbox);
vm.runInContext(read('src/core/audio-ui-system.js'), sandbox);
const api = sandbox.F1M_CORE?.audioUI?.createAudioUISystem?.({ data:sandbox.F1M_AUDIO_UI_DATA, window:sandbox.window, document:sandbox.document });
const audit = api?.audit?.();
add('audio:data-loaded', Boolean(sandbox.F1M_AUDIO_UI_DATA?.schema), 'schema '+sandbox.F1M_AUDIO_UI_DATA?.schema);
add('audio:core-api', Boolean(api?.emit && api?.radio && api?.raceMix && api?.applyDesignTokens), 'api completa');
add('audio:audit-score', Number(audit?.score || 0) >= 100, `${audit?.score || 0}/100`);
add('audio:channels', (audit?.channels || []).length >= 6, String((audit?.channels || []).length));
add('audio:procedural-no-binary', sandbox.F1M_AUDIO_UI_DATA?.mode === 'procedural-no-binary-assets', sandbox.F1M_AUDIO_UI_DATA?.mode);
add('audio:radio-messages', (sandbox.F1M_AUDIO_UI_DATA?.radioMessages || []).length >= 5, String((sandbox.F1M_AUDIO_UI_DATA?.radioMessages || []).length));
add('ui:design-tokens', Boolean(sandbox.F1M_AUDIO_UI_DATA?.designTokens?.focusRing && sandbox.F1M_AUDIO_UI_DATA?.designTokens?.touchTargetMinPx >= 44), 'focus/touch');
add('ui:tutorials', (sandbox.F1M_AUDIO_UI_DATA?.tutorials || []).length >= 3, String((sandbox.F1M_AUDIO_UI_DATA?.tutorials || []).length));
add('ui:accessibility', Boolean(sandbox.F1M_AUDIO_UI_DATA?.accessibility?.keyboardNavigation && sandbox.F1M_AUDIO_UI_DATA?.accessibility?.ariaLive), 'teclado/aria');
const index = read('index.html'); const script = read('script.js'); const css = read('style.css'); const pkg = JSON.parse(read('package.json'));
add('index:scripts', index.includes('data/audio-ui-data.js') && index.includes('src/core/audio-ui-system.js'), 'scripts F15');
add('script:system-card', script.includes('audioUiMiniHTML') && script.includes('runAudioUIAudit') && script.includes('toggleAudioMute'), 'central sistema');
add('script:audio-instance', script.includes('CORE.audioUI?.createAudioUISystem') && script.includes('audioUI?.emit'), 'runtime');
add('css:premium-ui', css.includes('F15') && css.includes('focus-visible') && css.includes('tutorial-coach'), 'design/accessibility');
add('package:script', Boolean(pkg.scripts?.['test:audio-ui']), 'test:audio-ui');
const summary={build:JSON.parse(read('BUILD_INFO.json')).build_code, generatedAt:new Date().toISOString(), passed:results.filter(r=>r.ok).length, failed:results.filter(r=>!r.ok).length, results};
fs.mkdirSync(path.join(root,'test-results'),{recursive:true});
fs.writeFileSync(path.join(root,'test-results/audio-ui-audit.json'),JSON.stringify(summary,null,2)+'\n');
console.log(results.map(r=>`${r.ok?'PASS':'FAIL'} ${r.name}${r.detail?' — '+r.detail:''}`).join('\n'));
console.log(`TOTAL: ${summary.passed} passed, ${summary.failed} failed`);
