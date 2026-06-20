# Fase 22 concluída — v0.31.0-F22

**Build:** `F1M3D-0.31.0-F22`  
**Fase:** Hotfix visual final mobile/desktop, scroll, legibilidade e beta público com assets reais  
**Save schema:** 22  
**Base:** v0.30.0-F21

## Implementado

- Novo `data/visual-hotfix-data.js`.
- Novo `src/core/visual-hotfix-system.js`.
- Nova Central Sistema: **Hotfix visual F22**.
- Correção reforçada de rolagem para PC, tablet e mobile horizontal.
- Contratos de rolagem para home, criação de carreira, escolha de equipe, lobby, classificação, corrida, resultados e check de assets.
- Caminhos de assets mantidos visíveis em cards e placeholders.
- Fundos principais do fluxo ligados a caminhos restauráveis quando a pasta `assets` real estiver no GitHub/Vercel.
- Polimento de legibilidade, painéis, safe area, botões e HUD compacto.
- Guia `docs/VISUAL_HOTFIX_F22.md`.
- Novo teste `npm run test:visual-hotfix`.
- Migração automática para save schema 22.

## Auditoria

- **949 verificações aprovadas**
- **0 falhas**
- Mobile horizontal aprovado
- Tablet aprovado
- Desktop aprovado
- Corrida sem Three.js aprovada
- Regressão visual aprovada
- ZIP sem assets binários pesados aprovado
- Caminhos de assets preservados

## Assets

A regra foi mantida. A pasta `assets` contém somente:

```text
ASSET_MANIFEST.json
ASSET_PATHS_REQUIRED.txt
README_ASSETS.txt
```

Nenhuma imagem, áudio, vídeo ou modelo 3D pesado foi incluído. Para preview real, restaurar a pasta `assets` pesada original seguindo `docs/VISUAL_HOTFIX_F22.md` e `assets/ASSET_PATHS_REQUIRED.txt`.
