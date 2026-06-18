# Changelog

## v0.21.0-F12 — IA, ultrapassagem e estratégia — 18/06/2026 19:05 BRT

- Corrigida a experiência de rolagem da tela Criar Carreira em PC e mobile horizontal.
- Placeholders agora indicam caminho preservado e os cards de avatar exibem o caminho exato do asset esperado.
- Adicionada explicação in-game de que os assets binários pesados ficam fora do ZIP por regra do projeto e devem ser restaurados na pasta `assets` para aparecer no Vercel/GitHub.
- Criado `data/strategy-data.js` com parâmetros de undercut/overcut, tráfego, pits, neutralizações e relargadas.
- Criado `src/core/race-strategy-ai.js` com IA de ataque/defesa, decisão de pit stop, tráfego, erro humano, pit crew, double stacking, unsafe release, Safety Car, VSC, bandeira vermelha e relargadas.
- Integrada a IA estratégica ao loop de corrida, HUD e Central Sistema.
- Adicionado teste `npm run test:strategy` e integração no `npm run audit`.
- Migrado save para schema 12 preservando compatibilidade com saves antigos.
- Mantida política de ZIP sem assets binários pesados.


## v0.20.0-F11 — Física e estado do veículo — 18/06/2026 18:46 BRT

- Adicionado núcleo `vehicle-physics` com pneus, temperatura, combustível, ERS, DRS, freios, motor, dano e pista dinâmica.
- Integrada telemetria da física no HUD da corrida e na Central Sistema.
- Adicionado teste `npm run test:vehicle` e integração no `npm run audit`.
- Migrado save para schema 11 preservando compatibilidade com saves antigos.
- Mantida política de ZIP sem assets binários pesados.


## v0.19.0-F10 — Sessões e regulamento oficial

- Adicionado motor de regulamento com formatos F1 Grand Prix, F1 Sprint e F2 Sprint/Feature.
- Classificação F1 agora registra Q1/Q2/Q3.
- F2 recebeu Sprint com grid invertido Top 10, Feature, pole points e tabela de pontos separada.
- Resultado de corrida passa por classificação oficial com distância, tempo e punições.
- Adicionadas bandeiras, punições, parque fechado e tie-breakers de classificação.
- Save migrado para schema 10.
- Auditoria consolidada: 438 aprovadas / 0 falhas.

# CHANGELOG — F1 Manager 3D

## v0.18.0-F09 — Banco esportivo autoritativo F1/F2 2026

- Criado banco esportivo versionado em `data/sporting-data.js`.
- Criado módulo `src/core/sporting-database.js`.
- Separados calendários F1 e F2 2026.
- Atualizado calendário F1 2026 para 22 etapas.
- Atualizado calendário F2 2026 para 14 etapas.
- Atualizada grade F2 2026 para 11 equipes e 22 pilotos.
- Substituído Enzo Fittipaldi Jr. por Emerson Fittipaldi na AIX Racing.
- Adicionadas regras próprias por categoria.
- Adicionado modo de revisão jurídica para comercialização.
- Adicionada seção “Banco esportivo 2026” na Central Sistema.
- Migração automática para save schema 9.
- Adicionado teste `npm run test:sporting`.
- Auditoria consolidada: 420 aprovadas, 0 falhas.
