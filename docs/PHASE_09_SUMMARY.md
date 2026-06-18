# F1 Manager 3D — Fase 9 v0.18.0-F09

**Build:** F1M3D-0.18.0-F09  
**Versão:** 0.18.0  
**Fase:** 9  
**Data BRT:** 18/06/2026 14:43  
**Save schema:** 9  
**Base preservada:** v0.17.0-F08

## Tema da fase

Banco esportivo autoritativo F1/F2 2026, calendários separados por categoria, regras próprias e preparação jurídica para uso comercial internacional.

## Implementações principais

- Criado `data/sporting-data.js` com banco esportivo versionado.
- Criado `src/core/sporting-database.js` com API de calendário, regras, próxima etapa e auditoria.
- Separado calendário F1 2026 do calendário F2 2026.
- Atualizado o calendário F1 2026 para 22 etapas conforme snapshot oficial de 18/06/2026.
- Atualizado o calendário F2 2026 para 14 etapas oficiais.
- Atualizada a grade F2 2026 para 11 equipes e 22 pilotos.
- Substituído Enzo Fittipaldi Jr. por Emerson Fittipaldi na AIX Racing.
- Adicionadas regras próprias de F1 e F2, incluindo formato Sprint/Feature da F2.
- Adicionado modo de revisão jurídica: `requires-licensing-review`.
- Adicionada seção “Banco esportivo 2026” na Central Sistema.
- Migração automática para save schema 9.
- App shell PWA atualizado para cachear os novos módulos.
- Auditoria esportiva dedicada: `npm run test:sporting`.

## Resultado da auditoria

- **420 verificações aprovadas**
- **0 falhas**
- **0 vulnerabilidades npm**
- Mobile horizontal aprovado: 844×390
- Tablet aprovado: 1180×820
- Desktop aprovado: 1440×900
- Diagnóstico no navegador:
  - Mobile: 95/100
  - Tablet: 94/100
  - Desktop: 94/100

## Auditoria esportiva

- F1 2026 com 22 etapas: aprovado.
- Primeira etapa F1: Austrália: aprovado.
- Próxima etapa F1 após Barcelona: Áustria: aprovado.
- F2 2026 com 14 etapas: aprovado.
- Primeira etapa F2: Melbourne: aprovado.
- Final F2: Yas Island: aprovado.
- Grade F2 com 11 equipes e 22 pilotos: aprovado.
- Emerson Fittipaldi na AIX Racing: aprovado.
- Enzo Fittipaldi Jr. removido da grade oficial: aprovado.
- Regras F2 Sprint/Feature presentes: aprovado.
- Modo de revisão jurídica comercial presente: aprovado.

## Política de assets

A regra de entrega leve foi mantida. O ZIP contém código, dados, testes e documentação completos, mas não contém imagens, áudios, vídeos ou modelos 3D pesados.

A pasta `assets` contém somente:

- `ASSET_MANIFEST.json`
- `ASSET_PATHS_REQUIRED.txt`
- `README_ASSETS.txt`

O catálogo preserva:

- 519 caminhos conhecidos;
- 416 binários originais documentados;
- 7 assets obrigatórios ausentes desde o ZIP original.

## Próxima fase sugerida

Fase 10 — sessões e regulamento: treinos reais, Q1/Q2/Q3, Sprint, F2 Sprint Race/Feature Race, punições, parque fechado, bandeiras e classificação oficial.
