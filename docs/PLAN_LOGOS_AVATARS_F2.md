# Plano — Logos F2 e Avatares F2

Build: Build v0.9.0 • 06/05/2026 • 16:39 BRT

## Objetivo
Completar a imersão visual do jogo com:
1. logo de todas as equipes da F2;
2. avatar/portrait de todos os pilotos da F2;
3. integração direta no jogo nas telas de seleção, lobby, classificação, corrida e pódio.

## Etapa 1 — Logos das equipes F2
Criar 1 logo por equipe oficial da F2 usada no jogo.
Formato recomendado: PNG quadrado com fundo transparente, 1024x1024.
Pasta: `assets/teams/logos/f2/`

Equipe-alvo:
- Campos Racing
- MP Motorsport
- Invicta Racing
- HitechGP
- DAMS Lucas Oil
- Rodin Motorsport
- ART Grand Prix
- Prema Powerteam
- Van Amersfoort Racing
- AIX Racing
- Trident

## Etapa 2 — Avatares dos pilotos F2
Criar 1 portrait por piloto do grid oficial enviado.
Formato recomendado: PNG vertical 768x1024.
Pasta: `assets/drivers/f2_grid/`

## Etapa 3 — Integração
Para cada piloto F2:
- vincular `portrait` correto em `data/game-data.js`;
- garantir `team` correto;
- usar logo da equipe nas tabelas e no HUD.

## Ordem recomendada de produção
1. Logos F2 primeiro (11 logos).
2. Avatares F2 em blocos de 5 ou 6 pilotos por vez.
3. Revisão final dentro do jogo.

## Como vamos fazer no chat
- Você diz `ok`.
- Eu gero 1 logo ou 1 avatar por vez, sempre mantendo padrão visual coerente.
- Depois eu reorganizo tudo em assets e atualizo o jogo.

## Resultado esperado
- Grid e classificação sempre com rosto do piloto + logo da equipe.
- Pódio e resultados finais mais imersivos.
- Seleção de equipes F2 visualmente muito mais forte.
