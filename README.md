# F1 Manager Career 2026 — Build v0.7.0

Build focada em melhoria da corrida 3D, clareza do modo carreira e integração visual dos assets.

## Melhorias desta versão
- ajuste dos caminhos que estavam quebrados;
- uso real de backgrounds de lobby, classificação, calendário e oficina;
- portraits de pilotos F1 quando disponíveis;
- avatars gerados para pilotos F2;
- logos/cards/lobbies das equipes F1 quando disponíveis;
- fallback automático para deploy com `assets/` consolidado ou com pastas `f1_assets_part_XX/assets/`.

## Importante
Esta build continua sendo enviada **sem assets pesados no ZIP**, conforme solicitado.
Para visualizar imagens, publique junto a pasta `assets/` ou as pastas `f1_assets_part_XX/`.


## v0.7.0
Grid F2 com 22 pilotos, avatars/fallbacks no leaderboard e botões de ação funcionais.


## Build v0.7.0
Os SVGs oficiais das pistas enviados pelo usuário foram incorporados em `assets/tracks/svg/` e processados em `data/track-layouts.js`. A corrida 3D passa a carregar o traçado da etapa atual pelo calendário.
