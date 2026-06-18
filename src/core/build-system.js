(() => {
  'use strict';
  const root = globalThis;
  const core = root.F1M_CORE = root.F1M_CORE || {};

  function clone(value){
    try { return JSON.parse(JSON.stringify(value || {})); }
    catch (_) { return {...(value || {})}; }
  }

  function normalize(value){
    const build = clone(value);
    build.version = String(build.version || 'dev');
    build.build_code = String(build.build_code || `F1M3D-${build.version}`);
    build.save_schema = Number(build.save_schema || 0);
    build.phase = Number(build.phase || 0);
    return Object.freeze(build);
  }

  function getInfo(dataBuild){
    return normalize(dataBuild || root.F1M_BUILD || {});
  }

  function format(build, compact = false){
    const b = getInfo(build);
    if(compact) return `${b.build_code} • schema ${b.save_schema}`;
    return b.label || `${b.build_code} • ${b.date || ''} ${b.time_brt || ''}`.trim();
  }

  function consistency(dataBuild){
    const runtime = getInfo(root.F1M_BUILD);
    const data = getInfo(dataBuild);
    const metaCode = typeof document !== 'undefined' ? document.querySelector('meta[name="f1m-build-code"]')?.content || '' : '';
    const metaVersion = typeof document !== 'undefined' ? document.querySelector('meta[name="f1m-build-version"]')?.content || '' : '';
    const checks = [
      { id:'runtime-code', label:'Código runtime', ok:runtime.build_code === data.build_code, detail:`${runtime.build_code} / ${data.build_code}` },
      { id:'runtime-version', label:'Versão runtime', ok:runtime.version === data.version, detail:`${runtime.version} / ${data.version}` },
      { id:'save-schema', label:'Schema de save', ok:runtime.save_schema === data.save_schema, detail:String(data.save_schema) },
      { id:'html-code', label:'Meta build HTML', ok:!metaCode || metaCode === data.build_code, detail:metaCode || 'não declarado' },
      { id:'html-version', label:'Meta versão HTML', ok:!metaVersion || metaVersion === data.version, detail:metaVersion || 'não declarado' }
    ];
    return { ok:checks.every(item => item.ok), checks, runtime, data };
  }

  function applyToDocument(build){
    if(typeof document === 'undefined') return;
    const b = getInfo(build);
    const html = document.documentElement;
    html.dataset.buildCode = b.build_code;
    html.dataset.buildVersion = b.version;
    html.dataset.saveSchema = String(b.save_schema);
    html.dataset.buildPhase = String(b.phase);
  }

  core.build = Object.freeze({ getInfo, format, consistency, applyToDocument });
})();
