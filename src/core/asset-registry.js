(() => {
  'use strict';
  const root = globalThis;
  const core = root.F1M_CORE = root.F1M_CORE || {};

  const IMAGE_EXTENSIONS = new Set(['png','jpg','jpeg','webp','gif','svg','avif']);
  const AUDIO_EXTENSIONS = new Set(['mp3','ogg','wav','m4a','aac','flac']);
  const MODEL_EXTENSIONS = new Set(['glb','gltf','fbx','obj','bin']);
  const FONT_EXTENSIONS = new Set(['woff','woff2','ttf','otf']);

  function stripQuery(value){ return String(value || '').split(/[?#]/, 1)[0]; }
  function isExternal(value){ return /^(?:data:|blob:|https?:\/\/)/i.test(String(value || '')); }
  function normalizePath(value){
    const raw = String(value || '').trim().replace(/\\/g, '/');
    if(!raw) return '';
    if(isExternal(raw)) return raw;
    const clean = stripQuery(raw).replace(/^\/+/, '').replace(/^\.\//, '');
    const parts = clean.split('/').filter(Boolean);
    if(parts.some(part => part === '..')) return '';
    const rel = parts[0] === 'assets' ? parts.slice(1).join('/') : parts.join('/');
    return rel ? `assets/${rel}` : '';
  }

  function extensionOf(value){
    const normalized = stripQuery(value);
    const match = normalized.match(/\.([a-z0-9]+)$/i);
    return match ? match[1].toLowerCase() : '';
  }

  function classify(value){
    const path = normalizePath(value).toLowerCase();
    const extension = extensionOf(path);
    if(AUDIO_EXTENSIONS.has(extension)) return 'audio';
    if(MODEL_EXTENSIONS.has(extension)) return 'model';
    if(FONT_EXTENSIONS.has(extension)) return 'font';
    if(path.includes('/backgrounds/')) return 'background';
    if(path.includes('/drivers/') || path.includes('/avatars/')) return 'avatar';
    if(path.includes('/teams/logos/')) return 'logo';
    if(path.includes('/flags/')) return 'flag';
    if(path.includes('/tracks/')) return 'track';
    if(path.includes('/icons/')) return 'icon';
    if(IMAGE_EXTENSIONS.has(extension)) return 'image';
    return 'unknown';
  }

  function labelFromPath(value){
    const path = normalizePath(value);
    const file = path.split('/').pop() || 'asset';
    return file.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase()).slice(0, 38);
  }

  function escapeXml(value){
    return String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[char]));
  }

  function svgDataUri(svg){ return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`; }

  function placeholderDataUri(value, options = {}){
    const kind = options.kind || classify(value);
    const label = escapeXml(options.label || labelFromPath(value) || 'Asset');
    const wide = kind === 'background' || kind === 'track';
    const flag = kind === 'flag';
    const width = Number(options.width || (wide ? 1280 : flag ? 320 : 512));
    const height = Number(options.height || (wide ? 720 : flag ? 200 : 512));
    const short = escapeXml(String(options.short || label).slice(0, wide ? 34 : 12));
    const accent = ({background:'#e1112b',avatar:'#4973ff',logo:'#f5c542',flag:'#47c47b',track:'#ee5c2d',icon:'#a96bff',image:'#2da9a1'})[kind] || '#e1112b';
    const icon = ({background:'▰',avatar:'◉',logo:'◆',flag:'⚑',track:'⌁',icon:'◇',image:'▧'})[kind] || '◇';
    const fontSize = wide ? 54 : flag ? 34 : 56;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#080b16"/><stop offset=".55" stop-color="#151d36"/><stop offset="1" stop-color="#070811"/></linearGradient><pattern id="p" width="34" height="34" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="17" height="34" fill="#ffffff" opacity=".025"/></pattern></defs><rect width="100%" height="100%" rx="${wide ? 0 : 34}" fill="url(#g)"/><rect width="100%" height="100%" fill="url(#p)"/><rect x="${width*.06}" y="${height*.08}" width="${width*.88}" height="${height*.84}" rx="${wide ? 30 : 28}" fill="none" stroke="${accent}" stroke-width="${Math.max(4,width/130)}" opacity=".72"/><text x="50%" y="44%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="${fontSize*1.45}" font-weight="900" fill="${accent}">${icon}</text><text x="50%" y="65%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="900" fill="#f5f7ff">${short}</text><text x="50%" y="79%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="${Math.max(18,fontSize*.38)}" font-weight="700" fill="#aab5d4">PLACEHOLDER SEGURO</text></svg>`;
    return svgDataUri(svg);
  }

  function createRegistry(options = {}){
    const catalog = options.catalog || root.F1M_ASSET_CATALOG || {entries:[]};
    const roots = (Array.isArray(options.roots) && options.roots.length ? options.roots : ['assets/']).map(rootPath => String(rootPath).replace(/\\/g,'/').replace(/^\.\//,'').replace(/\/?$/,'/'));
    const doc = options.document || root.document;
    const ImageCtor = options.Image || root.Image;
    const onError = typeof options.onError === 'function' ? options.onError : () => {};
    const onChange = typeof options.onChange === 'function' ? options.onChange : () => {};
    const entries = Array.isArray(catalog.entries) ? catalog.entries : [];
    const entryMap = new Map();
    const caseMap = new Map();
    const statusMap = new Map();
    let observer = null;

    for(const sourceEntry of entries){
      const path = normalizePath(sourceEntry.path);
      if(!path) continue;
      const entry = Object.freeze({...sourceEntry, path, type:sourceEntry.type || classify(path)});
      entryMap.set(path, entry);
      const lower = path.toLowerCase();
      const variants = caseMap.get(lower) || [];
      variants.push(path);
      caseMap.set(lower, variants);
    }

    function metadata(value){ return entryMap.get(normalizePath(value)) || null; }
    function candidates(value){
      const raw = String(value || '').trim();
      if(!raw) return [];
      if(isExternal(raw)) return [raw];
      const normalized = normalizePath(raw);
      if(!normalized) return [];
      const rel = normalized.replace(/^assets\//, '');
      return [...new Set(roots.map(rootPath => `${rootPath}${rel}`))];
    }

    function record(value, state, detail = {}){
      const path = normalizePath(value) || String(value || '');
      if(!path) return null;
      const previous = statusMap.get(path) || { path, attempts:0, contexts:[] };
      const context = detail.context ? String(detail.context) : '';
      const next = {
        ...previous,
        ...detail,
        path,
        state:String(state),
        type:classify(path),
        attempts:Number(previous.attempts || 0) + (detail.incrementAttempt ? 1 : 0),
        contexts:context ? [...new Set([...(previous.contexts || []), context])].slice(-8) : (previous.contexts || []),
        updatedAt:new Date().toISOString()
      };
      delete next.incrementAttempt;
      statusMap.set(path, next);
      try { onChange(next); } catch(error) { onError(error, 'asset-registry-onchange'); }
      return next;
    }

    function setElementState(element, state, value){
      if(!element?.dataset) return;
      element.dataset.assetState = state;
      element.dataset.assetPath = normalizePath(value) || String(value || '');
      element.classList?.toggle?.('asset-placeholder-active', state === 'fallback');
      element.classList?.toggle?.('asset-loaded', state === 'loaded');
      element.classList?.toggle?.('asset-invalid', state === 'invalid');
    }

    function bindImage(image, value, bindOptions = {}){
      if(!image || !value) return {ok:false, reason:'missing-element-or-path'};
      const normalized = normalizePath(value);
      const context = bindOptions.context || image.getAttribute?.('alt') || image.className || 'img';
      if(!normalized && !isExternal(value)){
        setElementState(image, 'invalid', value);
        record(value, 'invalid', {context, reason:'unsafe-or-empty-path'});
        image.onerror = null;
        image.src = placeholderDataUri('assets/invalid.png', {label:'Caminho inválido', kind:'icon'});
        return {ok:false, reason:'invalid-path'};
      }
      if(image.dataset?.assetBound === '1' && image.dataset.assetPath === normalized) return {ok:true, reason:'already-bound'};
      if(image.dataset) image.dataset.assetBound = '1';
      const tries = candidates(value);
      let index = 0;
      let finished = false;
      const sibling = image.parentElement?.querySelector?.('.fallback-badge');
      if(sibling) sibling.style.display = 'none';
      const fallback = reason => {
        if(finished) return;
        finished = true;
        image.onerror = null;
        image.onload = null;
        image.style.display = '';
        image.src = placeholderDataUri(normalized || value, {label:bindOptions.label || image.alt || labelFromPath(value), kind:bindOptions.kind || classify(value)});
        setElementState(image, 'fallback', normalized || value);
        record(normalized || value, 'fallback', {context, reason, candidate:tries[index] || '', originalPresent:metadata(value)?.original_present === true});
      };
      image.onload = () => {
        if(finished) return;
        finished = true;
        image.style.display = '';
        if(sibling) sibling.style.display = 'none';
        setElementState(image, 'loaded', normalized || value);
        record(normalized || value, 'loaded', {context, candidate:tries[index] || image.src});
      };
      image.onerror = () => {
        record(normalized || value, 'loading', {context, candidate:tries[index] || '', incrementAttempt:true});
        index += 1;
        if(index < tries.length) image.src = tries[index];
        else fallback('all-candidates-failed');
      };
      if(tries.length){
        setElementState(image, 'loading', normalized || value);
        image.src = tries[0];
      } else fallback('no-candidates');
      return {ok:true, path:normalized, candidates:tries};
    }

    function backgroundFallback(element, value, bindOptions = {}){
      const normalized = normalizePath(value) || String(value || '');
      const kind = bindOptions.kind || 'background';
      const label = bindOptions.label || labelFromPath(value);
      const uri = placeholderDataUri(normalized, {kind, label, width:1280, height:720});
      element.style.backgroundImage = `linear-gradient(110deg, rgba(4,7,14,.86), rgba(15,22,42,.62)), url("${uri}")`;
      setElementState(element, 'fallback', normalized);
      record(normalized, 'fallback', {context:bindOptions.context || element.id || element.className || 'background', reason:'all-candidates-failed'});
    }

    function bindBackground(element, value, bindOptions = {}){
      if(!element || !value) return {ok:false, reason:'missing-element-or-path'};
      const normalized = normalizePath(value);
      const context = bindOptions.context || element.id || element.className || 'background';
      if(!normalized && !isExternal(value)){
        backgroundFallback(element, 'assets/invalid-background.png', {...bindOptions, label:'Caminho inválido', context});
        record(value, 'invalid', {context, reason:'unsafe-or-empty-path'});
        return {ok:false, reason:'invalid-path'};
      }
      if(element.dataset?.bgBound === '1' && element.dataset.assetPath === normalized) return {ok:true, reason:'already-bound'};
      if(element.dataset) element.dataset.bgBound = '1';
      const tries = candidates(value);
      if(!ImageCtor || !tries.length){
        backgroundFallback(element, normalized || value, {...bindOptions, context});
        return {ok:true, reason:'fallback-no-image-constructor'};
      }
      let index = 0;
      const tester = new ImageCtor();
      setElementState(element, 'loading', normalized || value);
      tester.onload = () => {
        element.style.backgroundImage = `url("${tries[index]}")`;
        setElementState(element, 'loaded', normalized || value);
        record(normalized || value, 'loaded', {context, candidate:tries[index]});
      };
      tester.onerror = () => {
        record(normalized || value, 'loading', {context, candidate:tries[index] || '', incrementAttempt:true});
        index += 1;
        if(index < tries.length) tester.src = tries[index];
        else backgroundFallback(element, normalized || value, {...bindOptions, context});
      };
      tester.src = tries[0];
      return {ok:true, path:normalized, candidates:tries};
    }

    function hydrate(scope = doc){
      if(!scope?.querySelectorAll) return {images:0, backgrounds:0};
      const images = Array.from(scope.querySelectorAll('[data-asset-src]'));
      const backgrounds = Array.from(scope.querySelectorAll('[data-asset-bg]'));
      images.forEach(image => bindImage(image, image.dataset.assetSrc));
      backgrounds.forEach(element => bindBackground(element, element.dataset.assetBg));
      return {images:images.length, backgrounds:backgrounds.length};
    }

    function observe(scope = doc?.body){
      if(observer || !root.MutationObserver || !scope) return false;
      observer = new root.MutationObserver(records => {
        for(const recordItem of records){
          for(const node of recordItem.addedNodes || []){
            if(node?.nodeType !== 1) continue;
            if(node.matches?.('[data-asset-src]')) bindImage(node, node.dataset.assetSrc);
            if(node.matches?.('[data-asset-bg]')) bindBackground(node, node.dataset.assetBg);
            hydrate(node);
          }
        }
      });
      observer.observe(scope, {childList:true, subtree:true});
      return true;
    }

    function disconnect(){ observer?.disconnect?.(); observer = null; }

    function snapshot(){
      const statuses = Array.from(statusMap.values());
      const counts = {
        catalogued:entryMap.size,
        required:entries.filter(entry => entry.required).length,
        runtimeReferenced:entries.filter(entry => (entry.runtime_referenced_by || []).length > 0).length,
        originalPresent:entries.filter(entry => entry.original_present).length,
        originalMissingRequired:entries.filter(entry => entry.required && !entry.original_present).length,
        loaded:statuses.filter(entry => entry.state === 'loaded').length,
        fallback:statuses.filter(entry => entry.state === 'fallback').length,
        loading:statuses.filter(entry => entry.state === 'loading').length,
        invalid:statuses.filter(entry => entry.state === 'invalid').length,
        observed:statuses.length,
        caseCollisions:Array.from(caseMap.values()).filter(list => list.length > 1).length
      };
      return {
        ok:counts.invalid === 0 && counts.caseCollisions === 0,
        buildCode:catalog.build_code || '',
        manifestVersion:Number(catalog.manifest_version || 0),
        counts,
        statuses:statuses.slice().sort((a,b) => a.path.localeCompare(b.path)),
        missingRequired:entries.filter(entry => entry.required && !entry.original_present).map(entry => entry.path),
        caseCollisions:Array.from(caseMap.entries()).filter(([,list]) => list.length > 1).map(([key,list]) => ({key,paths:list}))
      };
    }

    function list(filter = {}){
      return entries.filter(entry => {
        if(filter.required !== undefined && Boolean(entry.required) !== Boolean(filter.required)) return false;
        if(filter.type && (entry.type || classify(entry.path)) !== filter.type) return false;
        if(filter.originalPresent !== undefined && Boolean(entry.original_present) !== Boolean(filter.originalPresent)) return false;
        if(filter.runtime && !(entry.runtime_referenced_by || []).length) return false;
        return true;
      }).map(entry => ({...entry, type:entry.type || classify(entry.path), status:statusMap.get(entry.path) || null}));
    }

    function resolve(value, resolveOptions = {}){
      const tries = candidates(value);
      if(tries.length) return tries[0];
      if(resolveOptions.placeholder !== false && IMAGE_EXTENSIONS.has(extensionOf(value))) return placeholderDataUri(value, resolveOptions);
      return '';
    }

    return Object.freeze({
      catalog,
      normalizePath,
      classify,
      metadata,
      candidates,
      resolve,
      placeholderDataUri,
      bindImage,
      bindBackground,
      hydrate,
      observe,
      disconnect,
      record,
      snapshot,
      list
    });
  }

  core.assets = Object.freeze({ normalizePath, classify, placeholderDataUri, createRegistry });
})();
