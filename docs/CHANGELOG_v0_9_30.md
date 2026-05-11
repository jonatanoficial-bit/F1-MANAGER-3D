# CHANGELOG v0.9.30 — Auditoria e correções críticas

Base auditada: v0.9.29.

## Correções
- Corrigido comportamento dos botões internos com `data-tab`: agora eles ativam corretamente o botão correspondente na barra lateral.
- Adicionado botão explícito **INICIAR CORRIDA** após a classificação, removendo dependência de `confirm()`.
- Corrigido fluxo de fim de temporada ao avançar depois do último GP: o jogador volta para a agenda/revisão anual.
- Adicionada proteção caso o Three.js não carregue: a corrida não quebra a tela e mostra aviso de motor 3D indisponível.
- Barra lateral agora é rolável e responsiva, evitando perda de abas em telas menores.
- Removida chamada duplicada de inicialização de sistemas de carreira.

## Validações automáticas
- `node --check script.js`
- `node --check data/game-data.js`
- `node --check data/track-layouts.js`
- auditoria de ações, abas, IDs HTML, dados de equipes/pilotos/calendário e track layouts.
