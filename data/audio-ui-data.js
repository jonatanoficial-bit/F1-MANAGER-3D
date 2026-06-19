(() => {
  'use strict';
  const data = {
    schema: 1,
    phase: 15,
    mode: 'procedural-no-binary-assets',
    masterDefault: 0.72,
    channels: {
      engine: { label:'Motor', volume:0.72, priority:8, synthetic:true },
      radio: { label:'Rádio', volume:0.86, priority:10, synthetic:true },
      pit: { label:'Box', volume:0.78, priority:9, synthetic:true },
      crowd: { label:'Torcida', volume:0.42, priority:4, synthetic:true },
      weather: { label:'Chuva e ambiente', volume:0.38, priority:5, synthetic:true },
      ui: { label:'Interface', volume:0.56, priority:6, synthetic:true }
    },
    events: {
      'ui.click': { channel:'ui', tone:620, duration:0.055, gain:0.20 },
      'ui.confirm': { channel:'ui', tone:880, duration:0.085, gain:0.24 },
      'ui.warning': { channel:'ui', tone:260, duration:0.16, gain:0.28 },
      'race.start': { channel:'engine', tone:118, duration:0.45, gain:0.34 },
      'race.overtake': { channel:'crowd', tone:760, duration:0.18, gain:0.26 },
      'race.pit': { channel:'pit', tone:420, duration:0.22, gain:0.30 },
      'race.safety': { channel:'radio', tone:330, duration:0.32, gain:0.30 },
      'radio.strategy': { channel:'radio', tone:510, duration:0.20, gain:0.25 },
      'weather.rain': { channel:'weather', tone:190, duration:0.60, gain:0.18 }
    },
    radioMessages: [
      { id:'box-now', text:'Box, box. Janela estratégica aberta.', priority:9 },
      { id:'save-tyres', text:'Poupe pneus nas próximas voltas.', priority:6 },
      { id:'push-now', text:'Pode atacar. Use ERS na reta principal.', priority:8 },
      { id:'safety-car', text:'Safety Car na pista. Mantenha delta positivo.', priority:10 },
      { id:'red-flag', text:'Bandeira vermelha. Corrida neutralizada.', priority:10 }
    ],
    designTokens: {
      radius:['12px','18px','24px'],
      spacing:['8px','12px','16px','24px'],
      motion:['120ms','220ms','360ms'],
      contrastTarget:'WCAG-AA',
      touchTargetMinPx:44,
      reducedMotion:true,
      focusRing:true
    },
    tutorials: [
      { id:'first-career', anchor:'[data-action="goQualifying"]', title:'Próximo fim de semana', text:'Use este botão para avançar para treino, classificação e corrida.' },
      { id:'strategy', anchor:'[data-tab="garage"]', title:'Carro e estratégia', text:'Evolua o carro e escolha setup pensando no traçado.' },
      { id:'system', anchor:'[data-tab="system"]', title:'Central antiquebra', text:'Confira diagnóstico, performance, assets, áudio, acessibilidade e auditorias.' }
    ],
    accessibility: {
      keyboardNavigation:true,
      ariaLive:true,
      reducedMotion:true,
      highContrastReady:true,
      scalableText:true,
      mobileTouch:true
    }
  };
  globalThis.F1M_AUDIO_UI_DATA = Object.freeze(data);
})();
