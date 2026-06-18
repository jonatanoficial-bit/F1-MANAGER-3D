(() => {
  const CORE = globalThis.F1M_CORE = globalThis.F1M_CORE || {};
  function clone(value){ return JSON.parse(JSON.stringify(value)); }
  function seriesKey(series){ return String(series || 'F2').toUpperCase() === 'F1' ? 'F1' : 'F2'; }
  function isSprintRace(round){ return Boolean(round && (round.sprint || round.format === 'sprint' || round.weekendFormat === 'F1_SPRINT')); }
  function formatKey(series, round){
    const s = seriesKey(series);
    if(s === 'F2') return 'F2_STANDARD';
    return isSprintRace(round) ? 'F1_SPRINT' : 'F1_GRAND_PRIX';
  }
  function createRegulationEngine({ data = {}, sporting = null } = {}){
    const formats = data.weekendFormats || {};
    const penalties = data.penalties || {};
    const flags = data.flags || {};
    const classification = data.classification || {};
    function weekendFormat(series, round){ return clone(formats[formatKey(series, round)] || formats.F2_STANDARD || {}); }
    function sessionList(series, round){ return weekendFormat(series, round).sessions || []; }
    function activeSessionPlan(series, round){
      const fmt = weekendFormat(series, round);
      const sessions = fmt.sessions || [];
      return {
        key: formatKey(series, round),
        label: fmt.label || 'Weekend',
        series: seriesKey(series),
        sessions,
        gridSource: fmt.gridSource || '',
        parcFermeStarts: fmt.parcFermeStarts || '',
        tyreRule: fmt.tyreRule || '',
        points: fmt.points || fmt.featurePoints || []
      };
    }
    function simulateQualifyingStages(entries, { series='F2', round=null } = {}){
      const s = seriesKey(series);
      const ranked = entries.map((entry, idx) => ({...entry, entryOrder:idx+1})).sort((a,b)=>b.score-a.score);
      if(s === 'F1'){
        const q1 = ranked.map((e,i)=>({...e, stage:'Q1', eliminated:i>=15, gridBucket:i>=15?'Q1':'Q2'}));
        const q2Ranks = ranked.slice(0,15).map((e,i)=>({...e, score:e.score + (e.focusBoost||0) + (15-i)*.015})).sort((a,b)=>b.score-a.score);
        const q2 = q2Ranks.map((e,i)=>({...e, stage:'Q2', eliminated:i>=10, gridBucket:i>=10?'Q2':'Q3'}));
        const q3Ranks = q2Ranks.slice(0,10).map((e,i)=>({...e, score:e.score + (e.singleLap||0) + (10-i)*.012})).sort((a,b)=>b.score-a.score);
        const finalOrder = [...q3Ranks.map(e=>({...e, stage:'Q3'})), ...q2.filter(e=>e.eliminated), ...q1.filter(e=>e.eliminated)];
        return finalOrder.map((e,i)=>({...e, gridPosition:i+1, qStage:e.stage || e.gridBucket || 'Q1'}));
      }
      return ranked.map((e,i)=>({...e, gridPosition:i+1, qStage:'F2-Q', polePoints:i===0?2:0}));
    }
    function sprintGridFromQualifying(qualifying, series='F2'){
      const s = seriesKey(series);
      if(s === 'F2'){
        const top = qualifying.slice(0,10).reverse();
        return [...top, ...qualifying.slice(10)].map((e,i)=>({...e, sprintGrid:i+1}));
      }
      return qualifying.map((e,i)=>({...e, sprintGrid:i+1}));
    }
    function pointsForPosition(pos, { series='F2', eventType='race', fastestLap=false, pole=false } = {}){
      const s = seriesKey(series);
      const fmt = s === 'F1' ? (eventType === 'sprint' ? formats.F1_SPRINT : formats.F1_GRAND_PRIX) : formats.F2_STANDARD;
      const table = eventType === 'sprint' ? (fmt.sprintPoints || []) : eventType === 'feature' ? (fmt.featurePoints || fmt.points || []) : (fmt.points || []);
      let pts = table[Math.max(0, Number(pos)-1)] || 0;
      if(s === 'F2' && fastestLap && pos <= 10) pts += Number(fmt.fastestLapPoint || 0);
      if(s === 'F2' && pole) pts += Number(fmt.polePoints || 0);
      return pts;
    }
    function applyPenalties(results){
      return results.map(r => {
        const penaltySeconds = (r.penalties || []).reduce((sum,id)=>sum + Number(penalties[id]?.seconds || 0), 0);
        const gridPenalty = (r.penalties || []).reduce((sum,id)=>sum + Number(penalties[id]?.gridPenalty || 0), 0);
        return {...r, penaltySeconds, gridPenalty};
      }).sort((a,b)=>(b.distance||0)-(a.distance||0) || (a.totalTime + a.penaltySeconds) - (b.totalTime + b.penaltySeconds));
    }
    function classifyRace(entries, { series='F2', eventType='race' } = {}){
      const ordered = applyPenalties(entries.map((e,i)=>({
        driver:e.driver?.short || e.driver || '', team:e.team?.id || e.team || '', distance:Number(e.distance ?? e.progress ?? 0), totalTime:Number(e.totalTime || 0), penalties:e.penalties || [], pits:Number(e.pits || 0), condition:Math.round(e.condition ?? 100), tyre:Math.round(e.tyre ?? 0), gridPosition:Number(e.gridPosition || e.pos || i+1), status:e.status || 'classified', fastestLap:Boolean(e.fastestLap)
      })));
      return ordered.map((r,i)=>({...r, pos:i+1, points:pointsForPosition(i+1,{series,eventType,fastestLap:r.fastestLap})}));
    }
    function audit(){
      const checks = [
        { id:'formats-f1-grand-prix', ok:Boolean(formats.F1_GRAND_PRIX?.sessions?.some(s=>s.id==='q3')), detail:'Q1/Q2/Q3' },
        { id:'formats-f1-sprint', ok:Boolean(formats.F1_SPRINT?.sessions?.some(s=>s.id==='sprint')), detail:'Sprint' },
        { id:'formats-f2-standard', ok:Boolean(formats.F2_STANDARD?.sessions?.some(s=>s.id==='feature')), detail:'Sprint + Feature' },
        { id:'q1-q2-q3-elimination', ok:formats.F1_GRAND_PRIX?.sessions?.filter(s=>s.type==='qualifying').length === 3, detail:'3 fases' },
        { id:'f2-reverse-grid', ok:Number(formats.F2_STANDARD?.sessions?.find(s=>s.id==='sprint')?.reverseGridTop) === 10, detail:'top10' },
        { id:'penalties-present', ok:Object.keys(penalties).length >= 6, detail:String(Object.keys(penalties).length) },
        { id:'flags-present', ok:Object.keys(flags).length >= 8, detail:String(Object.keys(flags).length) },
        { id:'classification-rules', ok:Array.isArray(classification.raceTieBreakers) && classification.raceTieBreakers.includes('penaltySeconds'), detail:'tie-breakers' },
        { id:'legal-mode', ok:Boolean(data.legalMode?.commercialStatus), detail:data.legalMode?.commercialStatus || '' }
      ];
      const failed = checks.filter(c=>!c.ok).length;
      return { schema:data.schema || 1, season:data.season || 2026, sourceTag:data.sourceTag || '', score:Math.max(0, 100-failed*12), passed:checks.length-failed, failed, checks };
    }
    return Object.freeze({ weekendFormat, sessionList, activeSessionPlan, simulateQualifyingStages, sprintGridFromQualifying, pointsForPosition, classifyRace, audit, data:clone(data) });
  }
  CORE.regulations = Object.freeze({ createRegulationEngine });
})();
