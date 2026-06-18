# F1 Manager 3D — Fase 12 — IA, ultrapassagem e estratégia

**Build:** `F1M3D-0.21.0-F12`  
**Versão:** `v0.21.0-F12`  
**Data:** 18/06/2026 às 19:05 BRT  
**Save schema:** 12  
**Base:** v0.20.0-F11

## Correção emergencial aplicada

A tela Criar Carreira foi ajustada para corrigir a barra de rolagem em PC, tablet e mobile horizontal. Também corrigi a comunicação dos assets: as imagens reais continuam fora do ZIP por regra do projeto, mas os caminhos agora aparecem diretamente nos cards e o placeholder informa “CAMINHO PRESERVADO”.

Para o deploy exibir as imagens reais no Vercel/GitHub, a pasta `assets` pesada precisa ser restaurada obedecendo exatamente os caminhos em `assets/ASSET_PATHS_REQUIRED.txt`.

## Implementado na Fase 12

- IA estratégica modular em `src/core/race-strategy-ai.js`.
- Dados de estratégia em `data/strategy-data.js`.
- Undercut/overcut por janela de pit.
- Decisão de pit stop por tráfego, desgaste, Safety Car/VSC e plano de corrida.
- Modelo de ataque, defesa, DRS, slipstream, pressão e tráfego.
- Risco de erro humano sob pressão.
- Pit crew com pit lane busy, double stacking e unsafe release.
- Safety Car, VSC, bandeira vermelha e relargadas.
- HUD de corrida mostrando intenção estratégica.
- Central Sistema com card “IA e estratégia F12”.
- Migração para save schema 12.
- Teste `npm run test:strategy`.

## Auditoria

- **520 verificações aprovadas**
- **0 falhas**
- Mobile horizontal: aprovado
- Tablet: aprovado
- Desktop: aprovado
- Corrida sem Three.js: aprovada
- Resultado com 22 pilotos: aprovado
- ZIP sem assets binários pesados: aprovado

## Política de assets mantida

A pasta `assets` contém somente:

```text
ASSET_MANIFEST.json
ASSET_PATHS_REQUIRED.txt
README_ASSETS.txt
```

Nenhuma imagem, áudio, vídeo ou modelo 3D pesado foi incluído. O catálogo preserva **519 caminhos conhecidos** e **416 binários originais documentados**.
