(() => {
  'use strict';
  const root = globalThis;
  const core = root.F1M_CORE = root.F1M_CORE || {};

  const isObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  const asArray = value => Array.isArray(value) ? value : [];
  const text = value => String(value ?? '').trim();

  function result(id, label, ok, detail = '', level = 'critical'){
    return Object.freeze({ id, label, ok:Boolean(ok), detail:text(detail), level });
  }

  function duplicates(values){
    const seen = new Set();
    const dupes = new Set();
    for(const value of values){
      const key = text(value);
      if(!key) continue;
      if(seen.has(key)) dupes.add(key);
      seen.add(key);
    }
    return Array.from(dupes);
  }

  function validate(data = {}){
    const f1Teams = asArray(data.f1Teams2026);
    const f2Teams = asArray(data.f2Teams);
    const f1Drivers = asArray(data.f1Drivers2026);
    const f2Drivers = asArray(data.f2Drivers);
    const calendar = asArray(data.calendar2026);
    const teams = [...f1Teams, ...f2Teams];
    const drivers = [...f1Drivers, ...f2Drivers];
    const teamIds = new Set(teams.map(team => text(team?.id)).filter(Boolean));
    const teamDupes = duplicates(teams.map(team => team?.id));
    const driverDupes = duplicates(drivers.map(driver => driver?.short));
    const calendarDupes = duplicates(calendar.map((round, index) => round?.id || round?.slug || `${round?.name || ''}:${index}`));
    const invalidDriverTeams = drivers.filter(driver => !teamIds.has(text(driver?.team))).map(driver => `${driver?.short || driver?.name || '?'}→${driver?.team || '?'}`);
    const invalidTeamShape = teams.filter(team => !text(team?.id) || !text(team?.name));
    const invalidDriverShape = drivers.filter(driver => !text(driver?.short) || !text(driver?.name) || !text(driver?.team));
    const invalidRounds = calendar.filter(round => !text(round?.name) || !Number.isFinite(Number(round?.laps)) || Number(round?.laps) <= 0);
    const assetPaths = isObject(data.assetPaths) ? Object.values(data.assetPaths) : [];
    const invalidAssets = assetPaths.filter(path => !text(path) || /^https?:\/\//i.test(text(path)) || text(path).includes('..'));

    const checks = [
      result('build', 'Contrato de build', isObject(data.build) && text(data.build.build_code) && Number(data.build.save_schema) >= 0, data.build?.build_code || 'ausente'),
      result('f1-teams', 'Equipes F1', f1Teams.length >= 10, `${f1Teams.length} equipes`),
      result('f2-teams', 'Equipes F2', f2Teams.length >= 10, `${f2Teams.length} equipes`),
      result('f1-drivers', 'Pilotos F1', f1Drivers.length >= 20, `${f1Drivers.length} pilotos`),
      result('f2-drivers', 'Pilotos F2', f2Drivers.length >= 20, `${f2Drivers.length} pilotos`),
      result('calendar', 'Calendário', calendar.length >= 14, `${calendar.length} etapas`),
      result('team-shape', 'Formato das equipes', invalidTeamShape.length === 0, invalidTeamShape.length ? `${invalidTeamShape.length} inválida(s)` : 'válido'),
      result('driver-shape', 'Formato dos pilotos', invalidDriverShape.length === 0, invalidDriverShape.length ? `${invalidDriverShape.length} inválido(s)` : 'válido'),
      result('round-shape', 'Formato das etapas', invalidRounds.length === 0, invalidRounds.length ? `${invalidRounds.length} inválida(s)` : 'válido'),
      result('team-ids', 'IDs únicos de equipe', teamDupes.length === 0, teamDupes.join(', ') || 'sem duplicidade'),
      result('driver-ids', 'IDs únicos de piloto', driverDupes.length === 0, driverDupes.join(', ') || 'sem duplicidade'),
      result('calendar-ids', 'IDs únicos de etapa', calendarDupes.length === 0, calendarDupes.join(', ') || 'sem duplicidade', 'warning'),
      result('driver-team-links', 'Vínculo piloto/equipe', invalidDriverTeams.length === 0, invalidDriverTeams.slice(0,6).join(', ') || 'todos vinculados'),
      result('asset-paths', 'Caminhos internos de assets', invalidAssets.length === 0, invalidAssets.slice(0,5).join(', ') || `${assetPaths.length} caminhos válidos`)
    ];
    return Object.freeze({
      ok:checks.filter(item => item.level === 'critical').every(item => item.ok),
      score:Math.round((checks.filter(item => item.ok).length / Math.max(1, checks.length)) * 100),
      checks,
      counts:Object.freeze({ f1Teams:f1Teams.length, f2Teams:f2Teams.length, f1Drivers:f1Drivers.length, f2Drivers:f2Drivers.length, calendar:calendar.length, assets:assetPaths.length })
    });
  }

  function createRegistry(data = {}){
    const f1Teams = asArray(data.f1Teams2026);
    const f2Teams = asArray(data.f2Teams);
    const f1Drivers = asArray(data.f1Drivers2026);
    const f2Drivers = asArray(data.f2Drivers);
    const teamMap = new Map([...f1Teams, ...f2Teams].map(team => [text(team.id), team]));
    const driverMap = new Map([...f1Drivers, ...f2Drivers].map(driver => [text(driver.short), driver]));
    const validation = validate(data);
    return Object.freeze({
      validation,
      teamById:id => teamMap.get(text(id)) || null,
      driverByShort:short => driverMap.get(text(short)) || null,
      teamsForSeries:series => (String(series).toUpperCase() === 'F1' ? f1Teams : f2Teams).slice(),
      driversForSeries:series => (String(series).toUpperCase() === 'F1' ? f1Drivers : f2Drivers).slice(),
      allTeams:() => Array.from(teamMap.values()),
      allDrivers:() => Array.from(driverMap.values()),
      calendar:() => asArray(data.calendar2026).slice(),
      snapshot:() => ({ valid:validation.ok, score:validation.score, ...validation.counts })
    });
  }

  core.contracts = Object.freeze({ validate, createRegistry });
})();
