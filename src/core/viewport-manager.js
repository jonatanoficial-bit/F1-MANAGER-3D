(function(){
  const root = globalThis.F1M_CORE = globalThis.F1M_CORE || {};
  function clamp(n,min,max){ return Math.max(min, Math.min(max, Number(n)||0)); }
  function isStandalone(){
    try { return Boolean(globalThis.matchMedia?.('(display-mode: standalone)').matches || globalThis.navigator?.standalone); }
    catch(_){ return false; }
  }
  function deviceKind(width,height){
    const min = Math.min(width,height), max = Math.max(width,height);
    if(min <= 480 && max <= 950) return 'mobile';
    if(min <= 900 && max <= 1280) return 'tablet';
    return 'desktop';
  }
  function orientation(width,height){ return width >= height ? 'landscape' : 'portrait'; }
  function safeNumber(value){ return Number.isFinite(Number(value)) ? Number(value) : 0; }
  function createViewportManager(options={}){
    const doc = options.document || globalThis.document;
    const win = options.window || globalThis;
    const storageKey = options.storageKey || 'f1_manager_viewport_settings';
    const listeners = [];
    let state = {
      width:0,
      height:0,
      visualWidth:0,
      visualHeight:0,
      orientation:'landscape',
      device:'desktop',
      compact:false,
      veryCompact:false,
      coarse:false,
      standalone:false,
      fullscreen:false,
      dpr:1,
      hudMode:'auto',
      safe:{top:0,right:0,bottom:0,left:0},
      updatedAt:null
    };
    function loadSettings(){
      try { return JSON.parse(win.localStorage?.getItem(storageKey) || '{}') || {}; }
      catch(_){ return {}; }
    }
    function saveSettings(patch){
      try { win.localStorage?.setItem(storageKey, JSON.stringify({...loadSettings(), ...patch, updatedAt:new Date().toISOString()})); }
      catch(_){ }
    }
    function readSafeArea(){
      const styles = doc ? win.getComputedStyle(doc.documentElement) : null;
      const css = name => safeNumber(String(styles?.getPropertyValue(name) || '0').replace('px',''));
      return { top:css('--safe-top'), right:css('--safe-right'), bottom:css('--safe-bottom'), left:css('--safe-left') };
    }
    function snapshot(){
      const vv = win.visualViewport;
      const width = Math.max(320, Math.round(vv?.width || win.innerWidth || doc?.documentElement?.clientWidth || 1280));
      const height = Math.max(300, Math.round(vv?.height || win.innerHeight || doc?.documentElement?.clientHeight || 720));
      const visualWidth = Math.round(vv?.width || width);
      const visualHeight = Math.round(vv?.height || height);
      const currentOrientation = orientation(width,height);
      const settings = loadSettings();
      state = {
        width,
        height,
        visualWidth,
        visualHeight,
        orientation:currentOrientation,
        device:deviceKind(width,height),
        compact: Math.min(width,height) <= 560 || height <= 560,
        veryCompact: height <= 430 || width <= 700,
        coarse: Boolean(win.matchMedia?.('(pointer: coarse)').matches || /Android|iPhone|iPad|iPod/i.test(win.navigator?.userAgent || '')),
        standalone:isStandalone(),
        fullscreen:Boolean(doc?.fullscreenElement || doc?.webkitFullscreenElement || doc?.msFullscreenElement),
        dpr:clamp(win.devicePixelRatio || 1, 1, 4),
        hudMode: settings.hudMode || 'auto',
        safe:readSafeArea(),
        updatedAt:new Date().toISOString()
      };
      return state;
    }
    function apply(){
      if(!doc) return snapshot();
      const s = snapshot();
      const el = doc.documentElement;
      const body = doc.body;
      el.style.setProperty('--app-height', `${s.height}px`);
      el.style.setProperty('--app-width', `${s.width}px`);
      el.style.setProperty('--visual-height', `${s.visualHeight}px`);
      el.style.setProperty('--visual-width', `${s.visualWidth}px`);
      el.dataset.viewportDevice = s.device;
      el.dataset.viewportOrientation = s.orientation;
      el.dataset.viewportCompact = String(s.compact);
      el.dataset.viewportStandalone = String(s.standalone);
      el.dataset.viewportFullscreen = String(s.fullscreen);
      el.dataset.hudMode = s.hudMode;
      body?.classList.toggle('is-mobile-viewport', s.device === 'mobile' || s.coarse);
      body?.classList.toggle('is-tablet-viewport', s.device === 'tablet');
      body?.classList.toggle('is-desktop-viewport', s.device === 'desktop');
      body?.classList.toggle('is-compact-landscape', s.orientation === 'landscape' && s.compact);
      body?.classList.toggle('is-very-compact', s.veryCompact);
      body?.classList.toggle('is-standalone-pwa', s.standalone);
      body?.classList.toggle('is-fullscreen', s.fullscreen);
      body?.classList.toggle('is-coarse-pointer', s.coarse);
      body?.classList.toggle('hud-compact', s.hudMode === 'compact' || (s.hudMode === 'auto' && s.compact));
      body?.classList.toggle('hud-expanded', s.hudMode === 'expanded');
      const pill = doc.getElementById('viewportDebugPill');
      if(pill){
        pill.textContent = `${s.device.toUpperCase()} ${s.width}×${s.height} • ${s.fullscreen ? 'FULL' : s.standalone ? 'PWA' : 'WEB'} • HUD ${s.hudMode}`;
        pill.dataset.device = s.device;
      }
      for(const fn of listeners){ try { fn(s); } catch(error){ options.onError?.(error,'viewport-listener'); } }
      return s;
    }
    function bind(){
      const update = () => win.setTimeout ? win.setTimeout(apply, 60) : apply();
      win.addEventListener?.('resize', update, {passive:true});
      win.addEventListener?.('orientationchange', update, {passive:true});
      doc?.addEventListener?.('fullscreenchange', update, {passive:true});
      doc?.addEventListener?.('webkitfullscreenchange', update, {passive:true});
      win.visualViewport?.addEventListener?.('resize', update, {passive:true});
      win.visualViewport?.addEventListener?.('scroll', update, {passive:true});
      return apply();
    }
    async function enterFullscreen(){
      const target = doc?.documentElement;
      const req = target?.requestFullscreen || target?.webkitRequestFullscreen || target?.msRequestFullscreen;
      let fullscreenOk = false;
      if(req){
        try { await req.call(target); fullscreenOk = true; }
        catch(error){ options.onError?.(error,'viewport-fullscreen-request'); }
      }
      try { await win.screen?.orientation?.lock?.('landscape'); }
      catch(error){ options.onError?.(error,'viewport-orientation-lock'); }
      apply();
      return { ok:fullscreenOk || state.fullscreen || state.standalone, state:{...state} };
    }
    async function exitFullscreen(){
      const exit = doc?.exitFullscreen || doc?.webkitExitFullscreen || doc?.msExitFullscreen;
      if(exit){ try { await exit.call(doc); } catch(error){ options.onError?.(error,'viewport-fullscreen-exit'); } }
      apply();
      return {...state};
    }
    function cycleHudMode(){
      const next = state.hudMode === 'auto' ? 'compact' : state.hudMode === 'compact' ? 'expanded' : 'auto';
      state.hudMode = next;
      saveSettings({ hudMode:next });
      return apply();
    }
    function setHudMode(mode){
      const next = ['auto','compact','expanded'].includes(mode) ? mode : 'auto';
      state.hudMode = next;
      saveSettings({ hudMode:next });
      return apply();
    }
    function onChange(fn){ if(typeof fn === 'function') listeners.push(fn); return () => { const idx=listeners.indexOf(fn); if(idx>=0) listeners.splice(idx,1); }; }
    function report(){
      const s = apply();
      const checks = [
        { id:'viewport-size', ok:s.width >= 320 && s.height >= 300, detail:`${s.width}x${s.height}` },
        { id:'landscape-recommended', ok:s.orientation === 'landscape' || s.device !== 'mobile', detail:s.orientation },
        { id:'safe-area-css', ok:Boolean(doc && getComputedStyle(doc.documentElement).getPropertyValue('--safe-bottom') !== ''), detail:'CSS env aplicado' },
        { id:'touch-targets', ok:Array.from(doc?.querySelectorAll?.('button') || []).every(btn => Math.round(btn.getBoundingClientRect?.().height || 44) >= 38), detail:'botões >= 38px no runtime' },
        { id:'side-nav-scrollable', ok:Boolean(doc?.querySelector?.('.side-nav') && getComputedStyle(doc.querySelector('.side-nav')).overflowY !== 'visible'), detail:'nav lateral rolável' },
        { id:'fullscreen-capability', ok:Boolean(doc?.documentElement?.requestFullscreen || s.standalone), detail:s.fullscreen ? 'ativo' : s.standalone ? 'PWA' : 'disponível via gesto' }
      ];
      return { score:Math.round(checks.filter(c=>c.ok).length / checks.length * 100), state:s, checks, generatedAt:new Date().toISOString() };
    }
    return { bind, apply, snapshot:()=>({...state}), enterFullscreen, exitFullscreen, cycleHudMode, setHudMode, onChange, report };
  }
  root.viewport = Object.freeze({ createViewportManager, deviceKind, orientation });
})();
