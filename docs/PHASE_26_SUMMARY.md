# F1 Manager 3D — Fase 26 v0.35.0-F26

## Identificação

- Build: `F1M3D-0.35.0-F26`
- Versão: `0.35.0`
- Fase: 26 — Setup avançado e engenharia de fim de semana realista
- Save schema: 26
- Base: v0.34.0-F25
- Canal: `advanced-setup-engineering`

## Objetivo

A Fase 26 aprofunda a realidade técnica do simulador. O foco deixa de ser apenas “correr” e passa a ser trabalhar como uma equipe real: ajustar carro, rodar treinos livres, comparar telemetria e entender tecnicamente por que o carro ganha ou perde tempo.

## Implementado

- Novo `data/setup-engineering-data.js`.
- Novo `src/core/setup-engineering-system.js`.
- Novo teste `npm run test:setup-engineering`.
- Novo guia `docs/SETUP_ENGINEERING_F26.md`.
- Nova Central Sistema: **Setup avançado F26**.
- Migração automática para save schema 26.
- Correlação entre setup, telemetria, treino livre e diagnóstico de engenharia.

## Parâmetros técnicos adicionados

- Asa dianteira e traseira.
- Altura dianteira e traseira.
- Suspensão dianteira/traseira.
- Barras estabilizadoras.
- Cambagem dianteira/traseira.
- Toe dianteiro/traseiro.
- Diferencial em aceleração e desaceleração.
- Brake bias.
- Pressão de pneus.
- Mapa de motor.

## Programas de treino

- Baseline aero e mecânico.
- Long run de corrida.
- Simulação de classificação.
- Largada e tração.

## Correlação telemétrica

O sistema cruza o acerto com sinais como temperatura de pneus, freios, ERS, DRS, arrasto, downforce, risco de bottoming, estabilidade, tração, consumo e degradação. O jogo agora consegue explicar problemas como subesterço, traseira superaquecendo, freio fora de janela, excesso de arrasto e mapa de motor agressivo drenando ERS.

## Nota de realidade

Modelo técnico plausível para simulador. Não contém telemetria proprietária oficial, dados sigilosos de equipes reais, nem pretende reproduzir valores confidenciais de engenharia de uma categoria real.

## Auditoria

- Total: **1076 aprovadas / 0 falhas**.
- Setup F26: **18 aprovadas / 0 falhas**.
- Mobile horizontal aprovado.
- Tablet aprovado.
- Desktop aprovado.
- Save schema 26 aprovado.
- ZIP sem assets binários pesados aprovado.
- Caminhos de assets preservados.

## Assets

A pasta `assets` continua leve e preserva somente documentos de caminho/manifesto. As imagens pesadas reais devem ser restauradas por fora conforme os arquivos `assets/ASSET_PATHS_REQUIRED.txt` e `assets/ASSET_MANIFEST.json`.
