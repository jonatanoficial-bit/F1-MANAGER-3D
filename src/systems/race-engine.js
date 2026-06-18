(() => {
  'use strict';
  const root = globalThis;
  const core = root.F1M_CORE = root.F1M_CORE || {};

  function createEngine(options = {}){
    const raf = options.requestFrame || root.requestAnimationFrame?.bind(root) || (callback => setTimeout(() => callback(Date.now()), 16));
    const caf = options.cancelFrame || root.cancelAnimationFrame?.bind(root) || clearTimeout;
    const now = options.now || (() => root.performance?.now?.() || Date.now());
    const update = typeof options.update === 'function' ? options.update : () => {};
    const render = typeof options.render === 'function' ? options.render : () => {};
    const onError = typeof options.onError === 'function' ? options.onError : () => {};
    const onState = typeof options.onState === 'function' ? options.onState : () => {};
    const maxDelta = Math.max(.01, Number(options.maxDelta || .05));
    let running = false;
    let frameId = 0;
    let lastFrame = 0;
    let frames = 0;
    let startedAt = 0;

    function frame(timestamp){
      if(!running) return;
      try {
        const delta = Math.min(maxDelta, Math.max(.001, (timestamp - lastFrame) / 1000));
        lastFrame = timestamp;
        update(delta);
        render(delta);
        frames++;
      } catch(error){
        onError(error, 'race-engine-frame');
        stop('error');
        return;
      }
      if(running) frameId = raf(frame);
    }

    function start(){
      if(running) return false;
      running = true;
      frames = 0;
      startedAt = now();
      lastFrame = startedAt;
      onState({ running:true, reason:'start' });
      frameId = raf(frame);
      return true;
    }

    function stop(reason = 'manual'){
      if(frameId) caf(frameId);
      const wasRunning = running;
      running = false;
      frameId = 0;
      lastFrame = 0;
      if(wasRunning) onState({ running:false, reason });
      return wasRunning;
    }

    function step(delta = 1/60){
      if(running) return false;
      try { update(Math.min(maxDelta, Math.max(.001, Number(delta) || 1/60))); render(delta); frames++; return true; }
      catch(error){ onError(error, 'race-engine-step'); return false; }
    }

    function inspect(){
      return { running, frames, startedAt, uptimeMs:running ? Math.max(0, now() - startedAt) : 0, maxDelta };
    }

    return Object.freeze({ start, stop, step, inspect, isRunning:() => running });
  }

  core.race = Object.freeze({ createEngine });
})();
