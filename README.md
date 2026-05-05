# F1 Manager Career 2026 — Build MVP v0.1.0

Primeira build jogável do projeto **F1 Manager Career 2026**, preparada para GitHub Pages e para futura conversão em APK.

## Como rodar

1. Extraia este ZIP.
2. Copie os assets organizados dos ZIPs anteriores para a raiz deste projeto, mantendo a pasta `assets/`.
3. Abra `index.html` no navegador ou publique no GitHub Pages.

O jogo funciona sem backend. O save usa `localStorage`.

## Importante sobre assets

Este ZIP **não inclui as imagens pesadas** para manter o pacote leve. Ele já referencia os caminhos oficiais dos assets no arquivo:

- `data/game-data.js`
- `docs/ASSET_MAP_REQUIRED.md`

Quando a pasta `assets/` estiver presente, os fundos, ícones, logos, pilotos e imagens serão carregados automaticamente. Sem os assets, o jogo usa gradientes e placeholders visuais.

## Fluxo da build

- Tela inicial: continuar, novo jogo e corrida rápida.
- Novo jogo: avatar, nome, país, modo realista ou sandbox e histórico.
- Escolha de equipe inicial: F2 + equipes F1 menores desbloqueadas para teste.
- Lobby: patrocinadores, oficina, pilotos, staff, instalações, agenda, classificação.
- Próxima corrida: classificação e depois corrida.
- Corrida 3D: Miami como pista de teste com carros 3D procedurais em Three.js.
- Resultado: pontos, reputação e saldo.

## Publicação no GitHub Pages

1. Crie um repositório.
2. Envie todos os arquivos deste ZIP para a branch `main`.
3. Envie também a pasta `assets/` extraída dos ZIPs de assets.
4. Vá em `Settings > Pages`.
5. Em `Build and deployment`, selecione `Deploy from a branch`.
6. Escolha `main / root`.
7. Aguarde o link público.

## Build

- Versão: v0.1.0-mvp
- Data/hora visível dentro do jogo: sim, no canto superior da tela inicial.
