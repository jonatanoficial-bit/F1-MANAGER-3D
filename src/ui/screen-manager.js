(() => {
  'use strict';
  const root = globalThis;
  const core = root.F1M_CORE = root.F1M_CORE || {};

  function createManager(options = {}){
    const doc = options.document || root.document;
    const selector = String(options.selector || '.screen');
    const prefix = String(options.prefix || 'screen-');
    const activeClass = String(options.activeClass || 'active');
    const beforeChange = typeof options.beforeChange === 'function' ? options.beforeChange : () => {};
    const afterChange = typeof options.afterChange === 'function' ? options.afterChange : () => {};
    let active = null;

    function current(){
      if(active) return active;
      const element = doc?.querySelector?.(`${selector}.${activeClass}`);
      return element?.id?.startsWith(prefix) ? element.id.slice(prefix.length) : null;
    }

    function show(name){
      const next = String(name || 'home');
      const previous = current();
      const target = doc?.getElementById?.(`${prefix}${next}`) || doc?.querySelector?.(`#${prefix}${next}`);
      if(!target) return { ok:false, previous, current:previous, reason:'screen-not-found' };
      beforeChange({ previous, next, target });
      Array.from(doc.querySelectorAll(selector)).forEach(element => element.classList.remove(activeClass));
      target.classList.add(activeClass);
      active = next;
      afterChange({ previous, current:next, target });
      return { ok:true, previous, current:next };
    }

    return Object.freeze({ show, current });
  }

  core.ui = Object.freeze({ createScreenManager:createManager });
})();
