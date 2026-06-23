# F1 Manager 3D — Fase 25 — Resumo

**Versão:** v0.34.0-F25  
**Build:** F1M3D-0.34.0-F25  
**Save schema:** 25  
**Base:** v0.33.0-F24  
**Fase:** Telemetria realista e simulador técnico de engenharia de corrida

## Objetivo

Atender à prioridade de máximo realismo: transformar a corrida em um simulador técnico com dados telemétricos plausíveis, diagnóstico de engenharia e consequências claras para cada decisão do jogador.

## Sistemas adicionados

- `data/telemetry-data.js`
- `src/core/telemetry-system.js`
- `tests/telemetry-audit.mjs`
- `docs/TELEMETRY_SIMULATOR_F25.md`

## Telemetria F25

A fase adiciona canais de telemetria para:

- velocidade em km/h;
- RPM;
- marcha;
- acelerador e freio;
- ângulo de volante;
- G lateral e longitudinal;
- temperatura de pneus de superfície e carcaça;
- pressão dos pneus;
- desgaste dos pneus;
- temperatura dos freios;
- temperatura do motor;
- combustível em kg lógico;
- ERS: carga, deploy e recuperação;
- DRS e ganho estimado;
- perda por ar sujo;
- equilíbrio de downforce;
- delta por setor e mini-setor.

## Diagnóstico de engenharia

O jogo agora consegue explicar tecnicamente perda de tempo, como:

- pneus acima da janela ideal;
- freios em temperatura crítica;
- ERS baixo para ataque;
- ar sujo reduzindo downforce;
- pressão de pneus alta;
- carro pesado por combustível;
- necessidade de poupar, atacar ou antecipar pit.

## Regras de realismo preservadas

- Sem boost arcade escondido.
- Jogador e IA usam os mesmos sinais técnicos.
- Ganhos e perdas precisam aparecer na telemetria.
- Ruído de corrida é pequeno e auditável.
- Os dados são plausíveis para simulador e não usam telemetria proprietária oficial.

## Auditoria consolidada

- **1046 verificações aprovadas**
- **0 falhas**
- Telemetria F25: **20 aprovadas / 0 falhas**
- Browser mobile/tablet/desktop: **3 casos aprovados / 0 falhas**
- Visual: **106 aprovadas / 0 falhas**

## Assets

A entrega mantém a regra do projeto: ZIP completo do jogo sem assets binários pesados. Os caminhos permanecem preservados em:

- `assets/ASSET_MANIFEST.json`
- `assets/ASSET_PATHS_REQUIRED.txt`
- `assets/README_ASSETS.txt`

## Próxima fase recomendada

Fase 26 — Modelo de setup avançado e engenharia de fim de semana: cambagem, asa, suspensão, pressão, altura, mapa de motor, simulação de treino livre e correlação entre setup e telemetria.
