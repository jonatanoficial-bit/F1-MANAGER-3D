# F1 Manager 3D — Fase 20 v0.29.0-F20

**Build:** `F1M3D-0.29.0-F20`  
**Fase:** Operação beta, feedback, triagem e hotfix controlado  
**Save schema:** 20  
**Base:** v0.28.0-F19

## Implementado

- Novo `data/operations-data.js`.
- Novo `src/core/operations-system.js`.
- Novo teste `npm run test:operations`.
- Nova Central Sistema: **Operação beta F20**.
- Botões internos:
  - **AUDITAR OPERAÇÃO**
  - **SIMULAR FEEDBACK**
  - **PLANO HOTFIX**
- Coleta local de feedback do beta com categorias de bug, performance, rolagem mobile, asset ausente, balanceamento, tradução, acessibilidade e sugestão.
- Redação automática de termos sensíveis em feedback local, como token, API key e senha.
- Triagem de falhas por bucket: runtime, asset ausente, save, WebGL/fallback, cache PWA, viewport mobile e desconhecido.
- Plano de hotfix controlado com artefatos obrigatórios, gates de QA e rollback para schemas 18, 19 e 20.
- Matriz de aparelhos para beta: Android entrada, Android intermediário, iOS, tablet e desktop.
- Checklist operacional do beta público controlado.
- Produção continua bloqueada até homologação física, assets reais restaurados e revisão jurídica.
- Migração automática para save schema 20.

## Auditoria

- **757 verificações aprovadas**
- **0 falhas**
- Operação F20: **18 aprovadas / 0 falhas**
- Mobile horizontal aprovado
- Tablet aprovado
- Desktop aprovado
- Corrida sem Three.js aprovada
- ZIP sem assets binários pesados aprovado
- Manifesto SHA-256 gerado

## Política de assets mantida

A pasta `assets` contém somente:

```text
ASSET_MANIFEST.json
ASSET_PATHS_REQUIRED.txt
README_ASSETS.txt
```

Nenhuma imagem, áudio, vídeo ou modelo 3D pesado foi incluído. Os caminhos continuam preservados no manifesto e no documento `assets/ASSET_PATHS_REQUIRED.txt`.

## Observação

Esta fase não publica automaticamente o jogo. Ela prepara a operação segura de beta público, coleta local de feedback, triagem e plano de hotfix. Produção/lojas continuam bloqueadas até testes físicos e revisão jurídica.
