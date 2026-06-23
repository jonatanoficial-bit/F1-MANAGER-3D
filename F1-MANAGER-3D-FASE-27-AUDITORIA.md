# Auditoria — F1 Manager 3D Fase 27 v0.36.0-F27

**Build:** `F1M3D-0.36.0-F27`  
**Resultado:** aprovado  
**Total:** 1089 verificações aprovadas / 0 falhas

## Auditoria específica F27

`npm run test:tyre-stint`

- 21 verificações aprovadas.
- 0 falhas.

## Escopos verificados

- Sintaxe dos novos módulos de pneus.
- Carregamento de `data/tyre-stint-data.js`.
- Carregamento de `src/core/tyre-stint-system.js`.
- API principal de pneus/stint.
- Contagem mínima de compostos.
- Sinais telemétricos de pneus.
- Fatores de degradação.
- Risco de pneu macio superaquecido.
- Estabilidade do pneu duro em stint controlado.
- Planejamento de stint.
- Recomendação do pit wall.
- Amostra de entrada de corrida.
- Card da Central Sistema.
- Ações de UI.
- Integração com corrida.
- Migração save schema 27.
- CSS F27.
- Guia técnico F27.

## Auditorias gerais preservadas

- Static audit: aprovado.
- Build consistency: aprovado.
- Modules: aprovado.
- Contracts: aprovado.
- Assets: aprovado.
- Persistence: aprovado.
- Performance: aprovado.
- Mobile UX: aprovado.
- I18N: aprovado.
- Sporting/regulations: aprovado.
- Vehicle physics: aprovado.
- Strategy AI: aprovado.
- Balance: aprovado.
- Visual 3D: aprovado.
- Audio/UI/accessibility: aprovado.
- Living career: aprovado.
- Backend/launch: aprovado.
- Release candidate: aprovado.
- Deployment/operations/assets restore: aprovado.
- Visual hotfix/public beta assets/gameplay/telemetry/setup: aprovado.
- Browser: mobile, tablet e desktop aprovados.
- Visual regression: aprovado.
- CI readiness: aprovado.
- Project audit: aprovado.

## Assets

A fase mantém a regra do projeto: ZIP completo do jogo sem binários pesados em assets. A pasta `assets` contém apenas manifestos e caminhos obrigatórios, preservando a restauração real posterior.
