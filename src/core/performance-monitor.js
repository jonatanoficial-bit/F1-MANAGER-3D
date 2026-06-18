(() => {
  'use strict';
  const root = globalThis;
  const core = root.F1M_CORE = root.F1M_CORE || {};

  const DEFAULT_BUDGETS = Object.freeze({
    dom_nodes: 2200,
    buttons: 260,
    images_tracked: 180,
    local_storage_bytes: 900000,
    active_save_bytes: 260000,
    frame_probe_ms: 420,
    target_frame_ms: 34,
    warning_frame_ms: 50,
    diagnostic_score_min: 90
  });

  function now(){ return root.performance?.now?.() || Date.now(); }
  function bytes(value){ return new Blob([String(value || '')]).size; }
  function safeStorageBytes(storage){
    let total = 0;
    try {
      const target = storage || root.localStorage;
      if(!target) return 0;
      for(let index = 0; index < target.length; index++){
        const key = target.key(index);
        total += bytes(key) + bytes(target.getItem(key));
      }
    } catch(_){ return 0; }
    return total;
  }

  function runtimeErrorCount(storageKey){
    try {
      const parsed = JSON.parse(root.localStorage?.getItem(storageKey || '') || '[]');
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch(_){ return 0; }
  }

  function collectStatic(context = {}){
    const documentRef = context.document || root.document;
    const budgets = {...DEFAULT_BUDGETS, ...(context.budgets || {})};
    const assetInfo = context.assetRegistry?.snapshot?.();
    const persistenceInfo = context.persistence?.inspect?.();
    const storageBytes = safeStorageBytes(context.storage);
    const activeSaveBytes = Number(persistenceInfo?.bytes || 0);
    const checks = [
      { id:'dom-nodes', label:'DOM dentro do orçamento mobile', ok:(documentRef?.querySelectorAll?.('*').length || 0) <= budgets.dom_nodes, value:documentRef?.querySelectorAll?.('*').length || 0, budget:budgets.dom_nodes, level:'warning' },
      { id:'buttons', label:'Quantidade de controles renderizados', ok:(documentRef?.querySelectorAll?.('button').length || 0) <= budgets.buttons, value:documentRef?.querySelectorAll?.('button').length || 0, budget:budgets.buttons, level:'warning' },
      { id:'tracked-images', label:'Assets rastreados na tela', ok:(documentRef?.querySelectorAll?.('[data-asset-src], img').length || 0) <= budgets.images_tracked, value:documentRef?.querySelectorAll?.('[data-asset-src], img').length || 0, budget:budgets.images_tracked, level:'warning' },
      { id:'local-storage', label:'Uso total do armazenamento local', ok:storageBytes <= budgets.local_storage_bytes, value:storageBytes, budget:budgets.local_storage_bytes, level:'critical' },
      { id:'active-save', label:'Save ativo compacto', ok:activeSaveBytes <= budgets.active_save_bytes || activeSaveBytes === 0, value:activeSaveBytes, budget:budgets.active_save_bytes, level:'critical' },
      { id:'runtime-errors', label:'Sem erros em runtime', ok:runtimeErrorCount(context.runtimeErrorKey) === 0, value:runtimeErrorCount(context.runtimeErrorKey), budget:0, level:'critical' },
      { id:'asset-invalid', label:'Sem assets inválidos', ok:Number(assetInfo?.counts?.invalid || 0) === 0, value:Number(assetInfo?.counts?.invalid || 0), budget:0, level:'critical' },
      { id:'viewport-safe', label:'Viewport mobile mínimo', ok:(root.innerWidth || 0) >= 320 && (root.innerHeight || 0) >= 240, value:`${root.innerWidth || 0}x${root.innerHeight || 0}`, budget:'320x240', level:'critical' }
    ];
    return {
      generatedAt:new Date().toISOString(),
      budgets,
      metrics:{
        dom_nodes:documentRef?.querySelectorAll?.('*').length || 0,
        buttons:documentRef?.querySelectorAll?.('button').length || 0,
        tracked_images:documentRef?.querySelectorAll?.('[data-asset-src], img').length || 0,
        local_storage_bytes:storageBytes,
        active_save_bytes:activeSaveBytes,
        asset_counts:assetInfo?.counts || null,
        viewport:`${root.innerWidth || 0}×${root.innerHeight || 0}`
      },
      checks
    };
  }

  async function frameProbe(options = {}){
    const duration = Math.max(180, Number(options.duration || DEFAULT_BUDGETS.frame_probe_ms));
    const target = Number(options.targetFrameMs || DEFAULT_BUDGETS.target_frame_ms);
    const warning = Number(options.warningFrameMs || DEFAULT_BUDGETS.warning_frame_ms);
    const frames = [];
    const started = now();
    let previous = started;
    if(typeof root.requestAnimationFrame !== 'function'){
      return { available:false, frames:0, average_ms:0, worst_ms:0, target_ms:target, ok:true, detail:'requestAnimationFrame indisponível no ambiente' };
    }
    await new Promise(resolve => {
      function tick(ts){
        const current = Number(ts || now());
        if(current > previous) frames.push(current - previous);
        previous = current;
        if(current - started >= duration) resolve();
        else root.requestAnimationFrame(tick);
      }
      root.requestAnimationFrame(tick);
    });
    const valid = frames.filter(value => Number.isFinite(value) && value > 0);
    const average = valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : 0;
    const worst = valid.length ? Math.max(...valid) : 0;
    return {
      available:true,
      frames:valid.length,
      average_ms:Number(average.toFixed(2)),
      worst_ms:Number(worst.toFixed(2)),
      target_ms:target,
      warning_ms:warning,
      ok:valid.length >= 5 && average <= target && worst <= warning,
      detail:`${valid.length} frame(s), média ${average.toFixed(1)}ms, pior ${worst.toFixed(1)}ms`
    };
  }

  function scoreFrom(checks, probe){
    const critical = checks.filter(item => item.level === 'critical');
    const criticalScore = critical.filter(item => item.ok).length / Math.max(1, critical.length);
    const allScore = checks.filter(item => item.ok).length / Math.max(1, checks.length);
    const frameScore = probe?.ok ? 1 : probe?.available === false ? 0.85 : 0.65;
    return Math.round(criticalScore * 65 + allScore * 20 + frameScore * 15);
  }

  async function run(context = {}){
    const statics = collectStatic(context);
    const probe = await frameProbe(context.budgets || {});
    const checks = [...statics.checks, { id:'frame-probe', label:'Sonda rápida de FPS/frames', ok:probe.ok, value:probe.detail, budget:`≤${probe.target_ms}ms média`, level:'warning' }];
    const score = scoreFrom(checks, probe);
    return {
      build:context.buildCode || root.F1M_BUILD?.build_code || 'dev',
      generatedAt:new Date().toISOString(),
      score,
      passed:checks.filter(item => item.ok).length,
      failed:checks.filter(item => !item.ok).length,
      budgets:statics.budgets,
      metrics:statics.metrics,
      frameProbe:probe,
      checks,
      status:score >= Number(statics.budgets.diagnostic_score_min || 90) ? 'approved' : 'review'
    };
  }

  core.performance = Object.freeze({ DEFAULT_BUDGETS, collectStatic, frameProbe, run });
})();
