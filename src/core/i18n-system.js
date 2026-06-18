(function(){
  const CORE = globalThis.F1M_CORE = globalThis.F1M_CORE || {};
  function createManager({ catalog, storageKey = 'f1m_language', document = globalThis.document, window = globalThis.window, onError } = {}){
    const data = catalog || globalThis.F1M_I18N_CATALOG || {};
    const supported = Array.isArray(data.supported) ? data.supported : [];
    const supportedCodes = new Set(supported.map(item => item.code));
    const phrases = data.phrases || {};
    const fallback = data.fallbackLanguage || data.defaultLanguage || 'pt-BR';
    const nodeSources = new WeakMap();
    const attrSources = new WeakMap();
    let observer = null;
    let current = normalize(loadStored() || browserLanguage() || data.defaultLanguage || fallback);
    let translating = false;

    function normalize(lang){
      const clean = String(lang || '').trim();
      if(supportedCodes.has(clean)) return clean;
      const lower = clean.toLowerCase();
      if(lower.startsWith('pt')) return 'pt-BR';
      if(lower.startsWith('es')) return 'es';
      if(lower.startsWith('en')) return 'en';
      return fallback;
    }
    function browserLanguage(){
      try { return window?.navigator?.language || window?.navigator?.languages?.[0] || ''; }
      catch { return ''; }
    }
    function loadStored(){
      try { return window?.localStorage?.getItem(storageKey); }
      catch { return ''; }
    }
    function saveStored(lang){
      try { window?.localStorage?.setItem(storageKey, lang); }
      catch(error){ onError?.(error, 'i18n:saveStored'); }
    }
    function info(lang = current){ return supported.find(item => item.code === normalize(lang)) || supported[0] || { code:fallback, locale:'pt-BR', htmlLang:'pt-BR', short:'PT', name:'Português' }; }
    function t(source, vars){
      const key = String(source ?? '');
      const lang = normalize(current);
      let value = lang === fallback ? key : (phrases[key]?.[lang] || key);
      if(vars && typeof vars === 'object') for(const [k,v] of Object.entries(vars)) value = value.replaceAll(`{${k}}`, String(v));
      return value;
    }
    function exactSource(text){ return String(text || '').replace(/\s+/g, ' ').trim(); }
    function translateTextNode(node){
      if(!node || !node.nodeValue || !node.nodeValue.trim()) return;
      const parent = node.parentElement;
      if(!parent || ['SCRIPT','STYLE','TEXTAREA','CODE','PRE','NOSCRIPT','SELECT'].includes(parent.tagName)) return;
      const original = nodeSources.get(node) || exactSource(node.nodeValue);
      if(!original) return;
      nodeSources.set(node, original);
      const leading = (node.nodeValue.match(/^\s*/) || [''])[0];
      const trailing = (node.nodeValue.match(/\s*$/) || [''])[0];
      const translated = t(original);
      if(translated && translated !== exactSource(node.nodeValue)) node.nodeValue = `${leading}${translated}${trailing}`;
    }
    function translateAttr(el, attr){
      if(!el?.hasAttribute?.(attr)) return;
      const value = el.getAttribute(attr);
      const map = attrSources.get(el) || {};
      if(!map[attr]) map[attr] = value;
      attrSources.set(el, map);
      const translated = t(exactSource(map[attr]));
      if(translated && translated !== value) el.setAttribute(attr, translated);
    }
    function scan(root = document?.body){
      if(!root || translating) return;
      translating = true;
      try {
        const base = root.nodeType === 9 ? root.body : root;
        if(!base) return;
        if(base.nodeType === 3) translateTextNode(base);
        const elements = base.querySelectorAll ? [base, ...base.querySelectorAll('*')] : [];
        for(const el of elements){
          if(el?.dataset?.i18nSource) el.textContent = t(el.dataset.i18nSource);
          translateAttr(el, 'title');
          translateAttr(el, 'aria-label');
          translateAttr(el, 'placeholder');
          translateAttr(el, 'alt');
        }
        if(base.ownerDocument || base === document.body){
          const walker = document.createTreeWalker(base, NodeFilter.SHOW_TEXT, { acceptNode(node){
            const parent = node.parentElement;
            if(!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
            if(!parent || ['SCRIPT','STYLE','TEXTAREA','CODE','PRE','NOSCRIPT','SELECT'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          }});
          const nodes = [];
          while(walker.nextNode()) nodes.push(walker.currentNode);
          nodes.forEach(translateTextNode);
        }
      } catch(error){ onError?.(error, 'i18n:scan'); }
      finally { translating = false; }
    }
    function updateDocument(){
      const meta = info();
      if(document?.documentElement){
        document.documentElement.lang = meta.htmlLang || meta.code;
        document.documentElement.dataset.lang = meta.code;
      }
      if(document?.body) document.body.dataset.lang = meta.code;
    }
    function setLanguage(lang){
      current = normalize(lang);
      saveStored(current);
      updateDocument();
      renderSwitchers(document);
      scan(document.body);
      window?.dispatchEvent?.(new CustomEvent('f1m:languagechange', { detail:{ language:current, locale:info().locale } }));
      return current;
    }
    function renderSwitchers(root = document){
      try {
        const hosts = Array.from(root.querySelectorAll?.('[data-i18n-switcher]') || []);
        for(const host of hosts){
          host.innerHTML = supported.map(item => `<button type="button" class="lang-btn ${item.code === current ? 'active' : ''}" data-lang="${item.code}" aria-label="${t('Aplicar idioma')} ${item.name}">${item.short}</button>`).join('');
        }
      } catch(error){ onError?.(error, 'i18n:renderSwitchers'); }
    }
    function observe(root = document?.body){
      updateDocument();
      renderSwitchers(document);
      scan(root);
      if(observer || !root || !globalThis.MutationObserver) return;
      observer = new MutationObserver(list => {
        if(translating) return;
        for(const mutation of list){
          mutation.addedNodes?.forEach(node => {
            if(node.nodeType === 1 || node.nodeType === 3) scan(node);
          });
          if(mutation.type === 'characterData') scan(mutation.target);
        }
      });
      observer.observe(root, { childList:true, subtree:true, characterData:true });
    }
    function formatNumber(value, options){
      try { return new Intl.NumberFormat(info().locale || 'pt-BR', options).format(value); }
      catch { return String(value); }
    }
    function formatMoney(value){ return '$ ' + formatNumber(Math.round(value || 0)); }
    function audit(){
      const languageCounts = {};
      for(const lang of supported.map(item => item.code).filter(code => code !== fallback)){
        languageCounts[lang] = Object.values(phrases).filter(row => row && row[lang]).length;
      }
      return { schema:data.schema || 0, current, fallback, supported:supported.map(item=>item.code), phrases:Object.keys(phrases).length, languageCounts, ok:supported.length >= 3 && Object.keys(phrases).length >= 80 };
    }
    document?.addEventListener?.('click', event => {
      const button = event.target?.closest?.('[data-lang]');
      if(button) setLanguage(button.dataset.lang);
    });
    updateDocument();
    return { t, scan, observe, setLanguage, current:()=>current, supported:()=>supported.slice(), info, formatNumber, formatMoney, audit, renderSwitchers };
  }
  CORE.i18n = Object.freeze({ createManager });
})();
