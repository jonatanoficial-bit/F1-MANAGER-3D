# Fase 13 concluída — v0.22.0-F13

**Build:** `F1M3D-0.22.0-F13`  
**Data:** 19/06/2026 às 09:55 BRT  
**Save schema:** 13  
**Base:** v0.21.0-F12

## O que foi implementado

- Novo `data/balance-data.js`.
- Novo `src/core/balance-simulator.js`.
- Simulação **Monte Carlo determinística** com seed reproduzível.
- Distribuições para abandono/DNF, ultrapassagens, pit stops, gaps de vitória e espalhamento do pelotão.
- Análise de força por pelotão: equipes top, meio e fundo.
- Projeção de progressão de equipes por temporadas.
- Auditoria de dificuldade para garantir que o jogo ajuste economia, custos, metas e crescimento rival, sem alterar velocidade oculta contra o jogador.
- Nova seção na Central Sistema: **Balanceamento F13**.
- Botões internos para **AUDITAR BALANCEAMENTO** e **RODAR MONTE CARLO**.
- Migração automática para save schema 13.
- Novo teste `npm run test:balance` integrado ao `npm run audit`.

## Correções preservadas

- Rolagem da tela Criar Carreira mantida corrigida.
- Caminhos exatos das imagens continuam visíveis nos placeholders.
- Assets reais continuam fora do ZIP por regra do projeto, mas todos os caminhos seguem preservados no manifesto.

## Auditoria

- **563 verificações aprovadas**
- **0 falhas**
- Balanceamento: **25 aprovadas / 0 falhas**
- Monte Carlo auditado: **64 simulações de amostra**
- Mobile horizontal aprovado
- Tablet aprovado
- Desktop aprovado
- Corrida sem Three.js aprovada
- Resultado com 22 pilotos aprovado
- ZIP sem assets binários pesados aprovado

## Métricas de amostra Monte Carlo

```json
{
  "dnfRate": 0.0599,
  "pitStopsPerDriver": 1.224,
  "overtakesPerRace": 5.0469,
  "winningGapSeconds": 16.3791,
  "fieldSpreadSeconds": 70.5091,
  "topTeamWinShare": 0.6875,
  "midfieldPointsShare": 0.3187,
  "backmarkerPointsShare": 0.2494
}
```

## Política de assets mantida

A pasta `assets` contém somente:

```text
ASSET_MANIFEST.json
ASSET_PATHS_REQUIRED.txt
README_ASSETS.txt
```

Nenhuma imagem, áudio, vídeo ou modelo 3D pesado foi incluído. Os caminhos continuam preservados no manifesto.

## Próxima etapa natural

**Fase 14 — corrida 3D profissional:** pista com largura real, elevação, pit lane, setores, zonas de DRS, racing lines, LOD, streaming visual, danos visuais, chuva, spray, câmeras de TV, onboard, helicóptero, pit wall e replay.
