# F1 Manager 3D — Fase 6 v0.15.0-F06

**Build:** `F1M3D-0.15.0-F06`  
**Data:** 18/06/2026 às 10:36 BRT  
**Save schema:** 6  
**Base:** v0.14.0-F05

## Objetivo

Fortalecer a esteira antiquebra antes de avançar para novas features de simulação: testes automatizados ampliados, orçamento de performance mobile, regressão visual e preparação de CI para GitHub Actions.

## Entregas

- Módulo `src/core/performance-monitor.js`.
- Botão **MEDIR PERFORMANCE** na Central Sistema.
- Orçamentos em `config/quality-budgets.json`.
- Baselines de regressão visual em `config/visual-baselines.json`.
- Novos testes:
  - `tests/performance-audit.mjs`;
  - `tests/visual-regression-audit.mjs`;
  - `tests/ci-readiness-audit.mjs`.
- Workflow `.github/workflows/quality-gate.yml` para rodar `npm run audit` no GitHub.
- App shell PWA atualizado para cachear o módulo de performance.
- Save schema migrado para 6 com registro de quality gate.

## Auditoria

- 343 verificações aprovadas.
- 0 falhas.
- 0 vulnerabilidades npm.
- Mobile horizontal, tablet e desktop aprovados.
- Diagnóstico interno no executor: 94/100.

## Política de assets

A entrega continua sem binários pesados. A pasta `assets` contém apenas manifesto, caminhos e README de recomposição.
