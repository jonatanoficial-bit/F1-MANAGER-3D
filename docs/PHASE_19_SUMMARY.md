# F1 Manager 3D — Fase 19 v0.28.0-F19

**Fase:** Deploy seguro, beta público controlado e restauração guiada de assets.  
**Save schema:** 19.  
**Base:** v0.27.0-F18.

## Implementado

- Novo `data/deployment-data.js`.
- Novo `src/core/deployment-system.js`.
- Novo teste `npm run test:deployment`.
- Card **Deploy e Beta Público F19** na Central Sistema.
- Auditoria de GitHub, Vercel/Web preview, PWA/cache, rollback e beta gate.
- Assistente de restauração de assets com caminhos preservados.
- Pacote lógico de beta público controlado.
- Produção e lojas permanecem bloqueadas até validação manual.
- Caminhos oficiais de upload Git Bash preservados no data pack F19.
- Migração automática para save schema 19.

## Auditoria

- **None verificações aprovadas**.
- **None falhas**.
- Mobile horizontal, tablet e desktop aprovados.
- ZIP sem assets binários pesados aprovado.

## Assets

A pasta `assets` contém somente:

```text
ASSET_MANIFEST.json
ASSET_PATHS_REQUIRED.txt
README_ASSETS.txt
```

Os caminhos continuam preservados para restaurar a pasta `assets` pesada antes do deploy final.
