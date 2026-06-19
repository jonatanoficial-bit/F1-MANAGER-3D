(() => {
  'use strict';
  const root = globalThis;
  const core = root.F1M_CORE = root.F1M_CORE || {};

  function clamp(n,min,max){ return Math.max(min, Math.min(max, Number(n)||0)); }
  function createAudioUISystem(options = {}){
    const data = options.data || {};
    const win = options.window || root.window || root;
    const doc = options.document || win.document;
    const onError = typeof options.onError === 'function' ? options.onError : () => {};
    let ctx = null;
    let enabled = false;
    let muted = true;
    let master = Number(data.masterDefault || 0.72);
    const history = [];

    function context(){
      if(!win || !(win.AudioContext || win.webkitAudioContext)) return null;
      if(!ctx) ctx = new (win.AudioContext || win.webkitAudioContext)();
      return ctx;
    }
    async function unlock(){
      try {
        const c = context();
        if(c && c.state === 'suspended') await c.resume();
        enabled = Boolean(c);
        muted = false;
        return enabled;
      } catch(error){ onError(error,'audio-ui:unlock'); return false; }
    }
    function setMuted(value){ muted = Boolean(value); return muted; }
    function setMaster(value){ master = clamp(value,0,1); return master; }
    function envelopeGain(channel, eventGain){
      const ch = data.channels?.[channel] || data.channels?.ui || { volume:0.5 };
      return clamp(master * Number(ch.volume || 0.5) * Number(eventGain || 0.18), 0, 1);
    }
    function emit(name, payload = {}){
      const event = data.events?.[name] || data.events?.['ui.click'];
      history.unshift({ name, channel:event?.channel || 'ui', at:new Date().toISOString(), payload:{...payload, compact:true} });
      if(history.length > 40) history.length = 40;
      if(muted || !event) return { ok:false, muted:true, name };
      try {
        const c = context();
        if(!c) return { ok:false, reason:'no-audio-context' };
        const osc = c.createOscillator();
        const gain = c.createGain();
        const now = c.currentTime;
        const tone = Number(payload.tone || event.tone || 440);
        const duration = Number(payload.duration || event.duration || 0.08);
        osc.type = payload.type || (event.channel === 'engine' ? 'sawtooth' : 'sine');
        osc.frequency.setValueAtTime(tone, now);
        if(event.channel === 'engine') osc.frequency.exponentialRampToValueAtTime(Math.max(70, tone*1.8), now + duration);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, envelopeGain(event.channel, payload.gain || event.gain)), now + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        osc.connect(gain).connect(c.destination);
        osc.start(now); osc.stop(now + duration + 0.02);
        return { ok:true, name, channel:event.channel };
      } catch(error){ onError(error,`audio-ui:${name}`); return { ok:false, error:String(error.message||error) }; }
    }
    function radio(idOrText){
      const msg = (data.radioMessages || []).find(m => m.id === idOrText) || { id:'custom', text:String(idOrText||'Rádio da equipe'), priority:5 };
      emit(msg.priority >= 9 ? 'race.safety' : 'radio.strategy', { message:msg.id });
      return msg;
    }
    function raceMix(race = {}){
      const wet = race.weather === 'variable' || Number(race.trackState?.wetness || 0) > 15;
      return {
        engine:Number((data.channels?.engine?.volume || 0.7).toFixed(2)),
        radio:Number((data.channels?.radio?.volume || 0.85).toFixed(2)),
        pit:Number((data.channels?.pit?.volume || 0.75).toFixed(2)),
        crowd:Number(((race.safetyCar || race.vsc || race.redFlag) ? 0.25 : 0.42).toFixed(2)),
        weather:Number((wet ? 0.62 : 0.22).toFixed(2)),
        ui:Number((data.channels?.ui?.volume || 0.55).toFixed(2))
      };
    }
    function applyDesignTokens(){
      if(!doc?.documentElement) return false;
      const tokens = data.designTokens || {};
      doc.documentElement.dataset.audioUi = 'ready';
      doc.documentElement.style.setProperty('--f15-motion-fast', tokens.motion?.[0] || '120ms');
      doc.documentElement.style.setProperty('--f15-motion-normal', tokens.motion?.[1] || '220ms');
      doc.documentElement.style.setProperty('--f15-focus-ring', '0 0 0 3px rgba(101,255,218,.45)');
      return true;
    }
    function nextTutorial(state = {}){
      const done = state.tutorial?.completed;
      if(done) return null;
      return (data.tutorials || [])[Number(state.tutorial?.step || 0)] || data.tutorials?.[0] || null;
    }
    function audit(){
      const checks = [
        { id:'data', ok:Boolean(data.schema), detail:`schema ${data.schema || 0}` },
        { id:'channels', ok:Object.keys(data.channels || {}).length >= 6, detail:String(Object.keys(data.channels || {}).length) },
        { id:'events', ok:Object.keys(data.events || {}).length >= 8, detail:String(Object.keys(data.events || {}).length) },
        { id:'radio', ok:(data.radioMessages || []).length >= 5, detail:String((data.radioMessages || []).length) },
        { id:'design-tokens', ok:Boolean(data.designTokens?.contrastTarget && data.designTokens?.touchTargetMinPx >= 44), detail:data.designTokens?.contrastTarget || 'n/d' },
        { id:'tutorial', ok:(data.tutorials || []).length >= 3, detail:String((data.tutorials || []).length) },
        { id:'accessibility', ok:Boolean(data.accessibility?.keyboardNavigation && data.accessibility?.ariaLive && data.accessibility?.reducedMotion), detail:'teclado/aria/motion' },
        { id:'no-binary-audio', ok:data.mode === 'procedural-no-binary-assets', detail:data.mode || 'n/d' }
      ];
      const passed = checks.filter(c=>c.ok).length;
      return { score:Math.round((passed/checks.length)*100), passed, failed:checks.length-passed, checks, channels:Object.keys(data.channels || {}), muted, enabled, master, history:history.slice(0,10) };
    }
    return Object.freeze({ unlock, setMuted, setMaster, emit, radio, raceMix, applyDesignTokens, nextTutorial, audit, get muted(){return muted;}, get enabled(){return enabled;}, get master(){return master;} });
  }
  core.audioUI = Object.freeze({ createAudioUISystem });
})();
