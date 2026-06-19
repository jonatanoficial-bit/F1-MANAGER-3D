# Fase 14 concluída — v0.23.0-F14

**Build:** `F1M3D-0.23.0-F14`  
**Fase:** Corrida 3D profissional, câmeras e replay  
**Save schema:** 14  
**Base:** v0.22.0-F13

## Implementado

- Sistema visual 3D profissional procedural.
- Pista com largura real simulada e faixas laterais.
- Elevação procedural ao longo do traçado.
- Pit lane lógica e marcação visual.
- Setores S1/S2/S3 e zonas de DRS.
- Racing lines por modo: normal, ataque, defesa e economia.
- LOD visual dos carros para preservar performance mobile.
- Dano visual em asa, lateral e unidade de potência.
- Chuva e spray procedurais sem adicionar imagens pesadas.
- Câmeras: TV dinâmica, follow, helicóptero, onboard, pit wall e replay.
- Replay lógico com buffer de estados da corrida.
- Nova Central Sistema: **Corrida 3D F14**.
- Novo teste `npm run test:visual3d`.
- Migração automática para save schema 14.

## Política de assets

Mantida a regra do projeto: o ZIP completo segue sem imagens, áudios, vídeos ou modelos 3D pesados. A pasta `assets` contém somente:

```text
ASSET_MANIFEST.json
ASSET_PATHS_REQUIRED.txt
README_ASSETS.txt
```

Os caminhos continuam preservados no manifesto para recompor a pasta pesada sem perda de referência.

## Auditoria

- **614 verificações aprovadas**
- **0 falhas**
- Visual 3D: **31 aprovadas / 0 falhas**
- Mobile horizontal aprovado
- Tablet aprovado
- Desktop aprovado
- Corrida sem Three.js aprovada
- ZIP sem assets binários pesados aprovado
