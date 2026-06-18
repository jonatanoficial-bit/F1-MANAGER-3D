(() => {
  'use strict';
  const root = globalThis;
  const core = root.F1M_CORE = root.F1M_CORE || {};

  function createBus(options = {}){
    const listeners = new Map();
    const history = [];
    const maxHistory = Math.max(10, Number(options.maxHistory || 60));
    const onError = typeof options.onError === 'function' ? options.onError : () => {};

    function on(eventName, handler){
      if(typeof handler !== 'function') throw new TypeError('EVENT_HANDLER_REQUIRED');
      const key = String(eventName || '*');
      const set = listeners.get(key) || new Set();
      set.add(handler);
      listeners.set(key, set);
      return () => off(key, handler);
    }

    function once(eventName, handler){
      let release = null;
      release = on(eventName, payload => {
        release?.();
        handler(payload);
      });
      return release;
    }

    function off(eventName, handler){
      const set = listeners.get(String(eventName || '*'));
      if(!set) return false;
      const deleted = set.delete(handler);
      if(set.size === 0) listeners.delete(String(eventName || '*'));
      return deleted;
    }

    function dispatch(set, packet){
      for(const handler of Array.from(set || [])){
        try { handler(packet.payload, packet); }
        catch(error){ onError(error, `event:${packet.event}`); }
      }
    }

    function emit(eventName, payload = null){
      const packet = Object.freeze({
        event:String(eventName || 'unknown'),
        payload,
        at:new Date().toISOString()
      });
      history.unshift({ event:packet.event, at:packet.at });
      if(history.length > maxHistory) history.length = maxHistory;
      dispatch(listeners.get(packet.event), packet);
      dispatch(listeners.get('*'), packet);
      return packet;
    }

    function clear(eventName){
      if(eventName === undefined) listeners.clear();
      else listeners.delete(String(eventName));
    }

    function snapshot(){
      return {
        listenerGroups:listeners.size,
        listeners:Array.from(listeners.values()).reduce((sum, set) => sum + set.size, 0),
        history:history.slice()
      };
    }

    return Object.freeze({ on, once, off, emit, clear, snapshot });
  }

  core.events = Object.freeze({ createBus });
})();
