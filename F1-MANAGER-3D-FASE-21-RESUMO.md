# Fase 21 concluída — v0.30.0-F21

**Build:** `F1M3D-0.30.0-F21`  
**Fase:** Restauração guiada de assets reais e validação de preview  
**Save schema:** 21  
**Base:** v0.29.0-F20

## Implementado

- Novo `data/asset-restore-data.js`.
- Novo `src/core/asset-restore-system.js`.
- Novo teste `npm run test:asset-restore`.
- Nova Central Sistema: **Assets reais e preview F21**.
- Plano guiado para restaurar a pasta `assets` pesada original por cima do ZIP leve.
- Validação de caminhos críticos para avatares, fundos, boxes, garagem e pistas SVG.
- Verificação lógica de preview GitHub/Vercel/PWA/cache.
- Bloqueio explícito de produção enquanto assets obrigatórios, preview e mobile físico não forem homologados.
- Guia `docs/ASSET_RESTORE_GUIDE_F21.md` com passos objetivos para recompor imagens reais.
- Migração automática para save schema 21.

## Auditoria

- **932 verificações aprovadas**
- **0 falhas**
- Asset Restore F21: aprovado
- Mobile horizontal aprovado
- Tablet aprovado
- Desktop aprovado
- Corrida sem Three.js aprovada
- ZIP sem assets binários pesados aprovado
- Manifesto SHA-256 gerado

## Assets

Mantive sua regra. A pasta `assets` contém somente:

```text
ASSET_MANIFEST.json
ASSET_PATHS_REQUIRED.txt
README_ASSETS.txt
```

Nenhuma imagem, áudio, vídeo ou modelo 3D pesado foi incluído. Os caminhos continuam preservados e agora há um guia de restauração para fazer as imagens reais voltarem no GitHub/Vercel.
