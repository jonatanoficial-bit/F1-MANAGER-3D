(() => {
  const CORE = globalThis.F1M_CORE = globalThis.F1M_CORE || {};
  const clamp = (v,min,max)=>Math.max(min,Math.min(max,Number(v)||0));
  const round = (v,d=2)=>Math.round((Number(v)||0)*10**d)/10**d;
  function createTrackVisualSystem({ data = globalThis.F1M_VISUAL_DATA || {} } = {}){
    const profiles = data.qualityProfiles || {};
    const systems = data.visualSystems || {};
    function qualityForViewport(width = 1280, height = 720, dpr = 1){
      const pixels = Number(width||0) * Number(height||0) * Number(dpr||1);
      if(pixels < 520000) return { id:'low', ...(profiles.low || {}) };
      if(pixels < 1400000) return { id:'medium', ...(profiles.medium || profiles.low || {}) };
      return { id:'high', ...(profiles.high || profiles.medium || {}) };
    }
    function createTrackModel(track = {}, options = {}){
      const base = data.trackModel || {};
      const weather = String(options.weather || track.weather || 'dry');
      const widthMeters = Number(track.widthMeters || base.widthMeters || 12.5);
      const worldWidth = clamp(widthMeters / Number(data.scale?.metersPerWorldUnit || 6.5), Number(data.scale?.minWorldWidth || 4.5), Number(data.scale?.maxWorldWidth || 6.5));
      const sectorCount = Math.max(3, Number(track.sectorCount || base.sectorCount || 3));
      const sectorFractions = Array.from({length:sectorCount},(_,i)=>round(i/sectorCount,4));
      const drsZones = [
        { id:'drs-1', start:.16, end:.28, detection:.13, label:'DRS 1' },
        { id:'drs-2', start:.61, end:.74, detection:.58, label:'DRS 2' }
      ].slice(0, Number(track.drsZones || base.drsZones || 2));
      return {
        schema:1,
        trackId: track.id || track.svgLayout || 'procedural',
        name: track.name || 'Circuito procedural',
        theme: track.track || 'classic',
        weather,
        widthMeters,
        worldWidth,
        shoulderWorld: round((base.shoulderMeters || 1.2) / Number(data.scale?.metersPerWorldUnit || 6.5),3),
        pitLaneWidthWorld: round((base.pitLaneWidthMeters || 5) / Number(data.scale?.metersPerWorldUnit || 6.5),3),
        elevationAmplitude: weather === 'variable' ? Number(base.elevationAmplitudeMeters||9.5) * .08 : Number(base.elevationAmplitudeMeters||9.5) * .065,
        bankingDegrees: Number(base.bankingDegrees || 5),
        sectors: sectorFractions.map((start,i)=>({ id:i+1, start, end:round((i+1)/sectorCount,4), label:`S${i+1}` })),
        drsZones,
        racingLines: base.racingLines || ['ideal','inside','outside','defensive'],
        replay: { ...(data.replay || {}) },
        legal: data.legal || {},
        qualityHint: qualityForViewport(options.width || 1280, options.height || 720, options.dpr || 1)
      };
    }
    function elevationAt(progress, model = {}){
      const amp = Number(model.elevationAmplitude || 0.45);
      return round(Math.sin(progress*Math.PI*2)*amp + Math.sin(progress*Math.PI*6+.7)*amp*.28, 4);
    }
    function sectorAt(progress, model){
      const p = ((Number(progress)||0)%1+1)%1;
      return (model?.sectors || []).find(s=>p>=s.start && p<s.end) || model?.sectors?.[0] || {id:1,label:'S1'};
    }
    function drsAt(progress, model){
      const p = ((Number(progress)||0)%1+1)%1;
      return (model?.drsZones || []).find(z=>p>=z.start && p<=z.end) || null;
    }
    function createReplayBuffer(limit = data.replay?.maxFrames || 420){
      const frames = [];
      return {
        push(frame){ frames.push({ ...frame, at: frame.at || Date.now() }); while(frames.length > limit) frames.shift(); return frames.length; },
        latest(count = 20){ return frames.slice(-count); },
        markers(){ return frames.filter(f=>f.marker).slice(-24); },
        clear(){ frames.length = 0; },
        get length(){ return frames.length; }
      };
    }
    function captureFrame(race = {}, model = {}){
      const leader = (race.entries || [])[0] || null;
      return {
        tick: round(race.tick || 0, 2),
        lap: leader?.lap || 1,
        camera: race.cameraMode || 'tv',
        leader: leader?.driver?.short || null,
        sector: sectorAt(leader?.progress || 0, model).label,
        neutralized: Boolean(race.safetyCar > 0 || race.vsc > 0 || race.redFlag > 0),
        cars: (race.entries || []).slice(0, 22).map(e => ({ driver:e.driver?.short, pos:e.pos, progress:round(e.progress,4), lap:e.lap, pit:e.pits, damage:round((e.vehicle?.aeroDamage||0)+(e.vehicle?.chassisDamage||0),1) }))
      };
    }
    function audit(){
      const required = ['realTrackWidth','elevationMesh','pitLaneAndBoxes','sectorBoards','drsZoneMarkers','racingLineOverlay','carLod','damageVisuals','rainAndSpray','tvCameras','onboardCamera','pitWallCamera','replayBuffer','rendererDisposal','noBinaryAssetsRequired'];
      const checks = required.map(id => ({ id, ok:Boolean(systems[id]), detail:Boolean(systems[id]) ? 'ativo' : 'ausente' }));
      checks.push({ id:'camera-presets', ok:Object.keys(data.cameraPresets || {}).length >= 6, detail:Object.keys(data.cameraPresets || {}).join(',') });
      checks.push({ id:'quality-profiles', ok:['low','medium','high'].every(k=>profiles[k]), detail:Object.keys(profiles).join(',') });
      checks.push({ id:'legal-procedural', ok:data.legal?.mode === 'procedural-original', detail:data.legal?.mode || 'n/d' });
      const passed = checks.filter(c=>c.ok).length;
      const failed = checks.length - passed;
      return { schema:1, score:Math.round((passed/checks.length)*100), passed, failed, checks, rendererName:data.rendererName || 'F14 Visual', cameraPresets:data.cameraPresets || {}, systems };
    }
    return { data, createTrackModel, elevationAt, sectorAt, drsAt, qualityForViewport, createReplayBuffer, captureFrame, audit };
  }
  CORE.visual3d = { createTrackVisualSystem };
})();
