(() => {
  'use strict';
  const root = globalThis;
  const core = root.F1M_CORE = root.F1M_CORE || {};

  function check(id, label, ok, detail = '', level = 'critical'){
    return { id, label, ok:Boolean(ok), detail:String(detail || ''), level };
  }

  async function fetchJson(path){
    const response = await fetch(path, { cache:'no-store' });
    if(!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return response.json();
  }

  function viewportDetail(){
    const vv = root.visualViewport;
    return `${Math.round(vv?.width || root.innerWidth || 0)}×${Math.round(vv?.height || root.innerHeight || 0)} @${Number(root.devicePixelRatio || 1).toFixed(1)}x`;
  }

  async function run(context = {}){
    const data = context.data || root.F1M_DATA || {};
    const state = context.state || {};
    const saveKey = context.saveKey || '';
    const runtimeGuard = context.runtimeGuard;
    const checks = [];
    const buildConsistency = core.build?.consistency(data.build);
    (buildConsistency?.checks || []).forEach(item => checks.push(check(`build-${item.id}`, item.label, item.ok, item.detail)));

    const storage = core.runtime?.storageProbe?.() || {ok:false, detail:'módulo indisponível'};
    checks.push(check('storage', 'Armazenamento local', storage.ok, storage.detail));

    let saveValid = true;
    let saveDetail = 'sem save persistido';
    try {
      const raw = saveKey ? localStorage.getItem(saveKey) : null;
      if(raw){
        const parsed = JSON.parse(raw);
        const payload = parsed?.payload || parsed;
        saveValid = Number(payload.saveSchema || 0) <= Number(data.build?.save_schema || 0) && (!parsed?.checksum || Boolean(parsed.payload));
        saveDetail = `schema ${Number(payload.saveSchema || 0)} • ${(raw.length/1024).toFixed(1)} KiB`;
      }
    } catch (error) { saveValid = false; saveDetail = String(error?.message || error); }
    checks.push(check('save', 'Integridade do save ativo', saveValid, saveDetail));

    checks.push(check('teams', 'Banco de equipes', (data.f1Teams2026?.length || 0) >= 10 && (data.f2Teams?.length || 0) >= 10, `F1 ${data.f1Teams2026?.length || 0} • F2 ${data.f2Teams?.length || 0}`));
    checks.push(check('drivers', 'Banco de pilotos', (data.f1Drivers2026?.length || 0) >= 20 && (data.f2Drivers?.length || 0) >= 20, `F1 ${data.f1Drivers2026?.length || 0} • F2 ${data.f2Drivers?.length || 0}`));
    checks.push(check('calendar', 'Calendário carregado', (data.calendar2026?.length || 0) >= 14, `${data.calendar2026?.length || 0} etapas`));

    const contractReport = context.dataRegistry?.validation || core.contracts?.validate?.(data);
    checks.push(check('data-contract', 'Contrato central de dados', Boolean(contractReport?.ok), contractReport ? `${contractReport.score}/100 • ${contractReport.checks?.filter(item=>!item.ok).length || 0} pendência(s)` : 'módulo indisponível'));

    const careerReport = core.career?.validateState?.(state, Number(data.build?.save_schema || 0));
    checks.push(check('career-contract', 'Contrato do estado da carreira', Boolean(careerReport?.ok), careerReport ? `${careerReport.checks.filter(item=>item.ok).length}/${careerReport.checks.length} verificações` : 'módulo indisponível'));

    const persistenceInfo = context.persistence?.inspect?.();
    checks.push(check('persistence-envelope', 'Persistência modular', Boolean(persistenceInfo) && persistenceInfo.valid !== false, persistenceInfo ? `${persistenceInfo.format} • ${persistenceInfo.backups} backup(s) • ${(persistenceInfo.bytes/1024).toFixed(1)} KiB` : 'módulo indisponível'));

    const raceInfo = context.raceEngine?.inspect?.();
    checks.push(check('race-engine', 'Motor de ciclo da corrida', Boolean(raceInfo), raceInfo ? `${raceInfo.running ? 'ativo' : 'pronto'} • ${raceInfo.frames} frame(s)` : 'módulo indisponível'));

    const eventInfo = context.eventBus?.snapshot?.();
    checks.push(check('event-bus', 'Barramento de eventos', Boolean(eventInfo), eventInfo ? `${eventInfo.listeners} listener(s) • ${eventInfo.history.length} evento(s)` : 'módulo indisponível'));

    const i18nInfo = context.i18nManager?.audit?.();
    checks.push(check('i18n-catalog', 'Catálogo PT/EN/ES', Boolean(i18nInfo) && i18nInfo.ok, i18nInfo ? `${i18nInfo.supported.join(', ')} • ${i18nInfo.phrases} frases` : 'módulo indisponível'));
    checks.push(check('i18n-fallback', 'Fallback de idioma seguro', Boolean(i18nInfo) && i18nInfo.fallback === 'pt-BR' && i18nInfo.supported.length >= 3, i18nInfo ? `fallback ${i18nInfo.fallback} • ativo ${i18nInfo.current}` : 'módulo indisponível'));

    const assetInfo = context.assetRegistry?.snapshot?.();
    checks.push(check('asset-registry', 'Registro central de assets', Boolean(assetInfo) && assetInfo.ok, assetInfo ? `${assetInfo.counts.catalogued} caminhos • ${assetInfo.counts.invalid} inválido(s)` : 'módulo indisponível'));
    checks.push(check('asset-placeholders', 'Fallback visual controlado', Boolean(assetInfo), assetInfo ? `${assetInfo.counts.loaded} carregado(s) • ${assetInfo.counts.fallback} placeholder(s)` : 'módulo indisponível', 'warning'));
    checks.push(check('asset-case-safety', 'Segurança de maiúsculas/minúsculas', Boolean(assetInfo) && assetInfo.counts.caseCollisions === 0, assetInfo ? `${assetInfo.counts.caseCollisions} colisão(ões)` : 'módulo indisponível'));

    checks.push(check('viewport', 'Viewport utilizável', (root.innerWidth || 0) >= 320 && (root.innerHeight || 0) >= 240, viewportDetail(), 'warning'));
    checks.push(check('orientation', 'Orientação horizontal', (root.innerWidth || 0) >= (root.innerHeight || 0), viewportDetail(), 'warning'));
    const viewportReport = core.viewport && context.viewportController?.report ? context.viewportController.report() : null;
    checks.push(check('viewport-manager', 'Gerenciador mobile/fullscreen', Boolean(viewportReport) && viewportReport.score >= 80, viewportReport ? `${viewportReport.score}/100 • ${viewportReport.state.device} ${viewportReport.state.orientation}` : 'módulo indisponível', 'warning'));
    checks.push(check('service-worker-api', 'API Service Worker', 'serviceWorker' in navigator, 'serviceWorker' in navigator ? 'suportada' : 'indisponível', 'warning'));
    checks.push(check('cache-api', 'Cache Storage', 'caches' in root, 'caches' in root ? 'suportado' : 'indisponível', 'warning'));
    checks.push(check('webgl', 'Renderização 3D opcional', Boolean(root.WebGLRenderingContext || root.WebGL2RenderingContext), root.WebGL2RenderingContext ? 'WebGL2' : root.WebGLRenderingContext ? 'WebGL1' : 'fallback 2D', 'warning'));

    try {
      const [rootBuild, dataBuild, assetManifest] = await Promise.all([
        fetchJson('BUILD_INFO.json'),
        fetchJson('data/build.json'),
        fetchJson('assets/ASSET_MANIFEST.json')
      ]);
      const expected = data.build?.build_code;
      checks.push(check('build-root-file', 'BUILD_INFO físico', rootBuild.build_code === expected, rootBuild.build_code));
      checks.push(check('build-data-file', 'Build em data/', dataBuild.build_code === expected, dataBuild.build_code));
      checks.push(check('asset-manifest-build', 'Manifesto de assets', assetManifest.build_code === expected, `${assetManifest.build_code} • ${assetManifest.entries?.length || 0} caminhos`));
    } catch (error) {
      checks.push(check('build-files-fetch', 'Arquivos físicos de build', false, String(error?.message || error)));
    }

    if('serviceWorker' in navigator){
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        checks.push(check('service-worker-registration', 'Service Worker registrado', Boolean(registration), registration ? (registration.scope || 'registrado') : 'ainda não registrado', 'warning'));
      } catch (error) { checks.push(check('service-worker-registration', 'Service Worker registrado', false, String(error?.message || error), 'warning')); }
    }

    if(navigator.storage?.estimate){
      try {
        const estimate = await navigator.storage.estimate();
        const usage = Number(estimate.usage || 0);
        const quota = Number(estimate.quota || 0);
        const pct = quota ? (usage / quota) * 100 : 0;
        checks.push(check('storage-quota', 'Espaço de armazenamento', quota > 0 && pct < 90, `${(usage/1048576).toFixed(1)} / ${(quota/1048576).toFixed(0)} MiB (${pct.toFixed(1)}%)`, 'warning'));
      } catch (error) { checks.push(check('storage-quota', 'Espaço de armazenamento', false, String(error?.message || error), 'warning')); }
    }

    let performanceReport = null;
    if(core.performance?.run){
      try {
        performanceReport = await core.performance.run({
          document:root.document,
          state,
          storage:root.localStorage,
          persistence:context.persistence,
          assetRegistry:context.assetRegistry,
          runtimeErrorKey:context.runtimeErrorKey,
          buildCode:data.build?.build_code,
          budgets:context.performanceBudgets || {}
        });
        checks.push(check('performance-budget', 'Orçamento de performance mobile', performanceReport.score >= 85, `${performanceReport.score}/100 • ${performanceReport.passed} aprovado(s), ${performanceReport.failed} pendente(s)`, 'warning'));
        checks.push(check('performance-frame-probe', 'Sonda de frames', Boolean(performanceReport.frameProbe?.ok), performanceReport.frameProbe?.detail || 'indisponível', 'warning'));
      } catch (error) {
        checks.push(check('performance-budget', 'Orçamento de performance mobile', false, String(error?.message || error), 'warning'));
      }
    } else {
      checks.push(check('performance-module', 'Módulo de performance', false, 'módulo indisponível', 'warning'));
    }

    const runtimeErrors = runtimeGuard?.list?.() || [];
    checks.push(check('runtime-errors', 'Erros de execução registrados', runtimeErrors.length === 0, runtimeErrors.length ? `${runtimeErrors.length} ocorrência(s)` : 'nenhum erro', 'warning'));

    const critical = checks.filter(item => item.level === 'critical');
    const criticalPassed = critical.filter(item => item.ok).length;
    const totalPassed = checks.filter(item => item.ok).length;
    const score = Math.round((criticalPassed / Math.max(1, critical.length)) * 85 + (totalPassed / Math.max(1, checks.length)) * 15);
    return {
      build:data.build?.build_code || 'dev',
      generatedAt:new Date().toISOString(),
      score,
      passed:totalPassed,
      failed:checks.length - totalPassed,
      checks,
      environment:{
        userAgent:navigator.userAgent,
        language:navigator.language,
        online:navigator.onLine,
        viewport:viewportDetail(),
        standalone:Boolean(root.matchMedia?.('(display-mode: standalone)').matches),
        state:{ hasProfile:Boolean(state.profile), series:state.currentSeries || null, completedRaces:Number(state.completedRaces || 0), saveSchema:Number(state.saveSchema || 0) },
        assets:assetInfo ? assetInfo.counts : null,
        i18n:i18nInfo || null,
        viewportManager:viewportReport ? { score:viewportReport.score, state:viewportReport.state } : null,
        performance:performanceReport ? { score:performanceReport.score, metrics:performanceReport.metrics, frameProbe:performanceReport.frameProbe } : null
      }
    };
  }

  core.diagnostics = Object.freeze({ run });
})();
