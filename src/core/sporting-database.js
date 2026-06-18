(() => {
  const CORE = globalThis.F1M_CORE = globalThis.F1M_CORE || {};
  function clone(value){ return JSON.parse(JSON.stringify(value)); }
  function createDatabase({ data = {}, legacy = {} } = {}){
    const calendars = data.calendars || {};
    const rules = data.categoryRules || {};
    const f2DriversOfficial = Array.isArray(data.f2DriversOfficial) ? data.f2DriversOfficial : [];
    const bySeries = series => String(series || 'F2').toUpperCase() === 'F1' ? 'F1' : 'F2';
    function calendarForSeries(series){
      const key = bySeries(series);
      const calendar = calendars[key] || (key === 'F1' ? legacy.f1Calendar2026 : legacy.f2Calendar2026) || legacy.calendar2026 || [];
      return calendar;
    }
    function rulesForSeries(series){ return rules[bySeries(series)] || {}; }
    function nextRound(series, completed = 0){
      const calendar = calendarForSeries(series);
      return calendar[Math.min(Math.max(0, Number(completed || 0)), Math.max(0, calendar.length - 1))] || null;
    }
    function audit(){
      const f1 = calendarForSeries('F1');
      const f2 = calendarForSeries('F2');
      const f2Teams = new Set(f2DriversOfficial.map(d => d.team));
      const f2Drivers = new Set(f2DriversOfficial.map(d => d.short));
      const checks = [
        { id:'f1-calendar-22', ok:f1.length === 22, detail:String(f1.length) },
        { id:'f2-calendar-14', ok:f2.length === 14, detail:String(f2.length) },
        { id:'f2-drivers-22', ok:f2DriversOfficial.length === 22 && f2Drivers.size === 22, detail:String(f2DriversOfficial.length) },
        { id:'f2-teams-11', ok:f2Teams.size === 11, detail:String(f2Teams.size) },
        { id:'f2-emerson-fittipaldi', ok:f2DriversOfficial.some(d => d.short === 'E. Fittipaldi'), detail:'AIX Racing' },
        { id:'f2-no-enzo-jr', ok:!f2DriversOfficial.some(d => /Enzo Fittipaldi Jr\.?/i.test(d.name)), detail:'grid oficial 2026' },
        { id:'category-rules', ok:Boolean(rules.F1 && rules.F2 && rules.F2.featurePoints), detail:'F1/F2' },
        { id:'legal-mode', ok:Boolean(data.legalMode?.commercialStatus), detail:data.legalMode?.commercialStatus || '' }
      ];
      const failed = checks.filter(c => !c.ok).length;
      return { schema:data.schema || 1, season:data.season || 2026, sourceTag:data.sourceTag || '', score:Math.max(0, 100 - failed * 14), passed:checks.length - failed, failed, checks };
    }
    return Object.freeze({ calendarForSeries, rulesForSeries, nextRound, audit, data:clone(data) });
  }
  CORE.sporting = Object.freeze({ createDatabase });
})();
