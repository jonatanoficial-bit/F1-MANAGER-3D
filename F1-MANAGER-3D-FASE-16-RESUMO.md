# F1 Manager 3D — Fase 16 v0.25.0-F16

**Build:** `F1M3D-0.25.0-F16`  
**Fase:** Carreira viva profunda  
**Save schema:** 16  
**Base:** v0.24.0-F15  
**Data:** 19/06/2026 às 12:39 BRT

## Implementado

- Novo banco `data/living-career-data.js`.
- Novo módulo `src/core/living-career-system.js`.
- Staff profundo com arquétipos técnicos e efeitos reais de gestão.
- Fábricas e instalações: túnel de vento, CFD, dinamômetro, materiais, simulador, pit crew, academia e marca.
- Departamentos com moral, orçamento mensal, progresso de projeto e riscos.
- P&D com projeção de regulamentos futuros e risco de preparação.
- Patrocinadores por tiers: regional, nacional, global e title sponsor.
- Orçamento e governança com saúde financeira auditável.
- Política interna do conselho com facções financeira, técnica, comercial e esportiva.
- Academia de pilotos com pipeline de karting, F4, F3 e programa elite.
- Mercado vivo, imprensa, narrativas de paddock e rivalidades.
- Mudanças de regulamento previstas para múltiplas temporadas.
- Evolução das equipes e projeção multi-temporada de três anos.
- Nova Central Sistema: **Carreira viva F16**.
- Botões internos: **AUDITAR CARREIRA** e **REVISÃO DO CONSELHO**.
- Migração automática para save schema 16.
- Novo teste `npm run test:living-career`.

## Auditoria

- **673 verificações aprovadas**
- **0 falhas**
- Carreira viva: **21 aprovadas / 0 falhas**
- Mobile horizontal aprovado
- Tablet aprovado
- Desktop aprovado
- Corrida sem Three.js aprovada
- ZIP sem assets binários pesados aprovado
- App shell PWA atualizado com os novos módulos F16

## Política de assets preservada

O ZIP continua completo com código, dados, testes e documentação, mas sem imagens, áudios, vídeos ou modelos 3D pesados.

A pasta `assets` contém somente:

```text
ASSET_MANIFEST.json
ASSET_PATHS_REQUIRED.txt
README_ASSETS.txt
```

Os caminhos continuam preservados no manifesto para restaurar os assets reais sem perder referência no jogo.

## Próxima etapa natural

**Fase 17 — backend, segurança e lançamento:** contas, cloud save, sincronização, resolução de conflitos, telemetria com consentimento, crash reporting, configuração remota, rollback, segurança, alpha, beta, release candidate, Android, iOS, Windows, lojas, privacidade, classificação etária, suporte e live ops.
