# F1 Manager 3D — Fase 15 v0.24.0-F15

**Build:** `F1M3D-0.24.0-F15`  
**Versão:** `0.24.0`  
**Save schema:** `15`  
**Base:** `v0.23.0-F14`  
**Fase:** Áudio, interface, identidade visual, tutorial contextual e acessibilidade

## Implementado

- Sistema de áudio procedural leve usando Web Audio, sem arquivos pesados no ZIP.
- Canais separados para motor, rádio, box, torcida, chuva/ambiente e interface.
- Rádio/box com mensagens estratégicas e eventos de corrida.
- Mixagem dinâmica preparada para corrida seca, chuva, Safety Car, VSC e bandeira vermelha.
- Design system premium com foco visível, transições, estados de botão e alvo mínimo de toque.
- Animações respeitando `prefers-reduced-motion`.
- Tutorial contextual preparado para orientar o jogador sem travar a jogabilidade.
- Acessibilidade: navegação por teclado, foco claro, ARIA/live region preparado, texto escalável e controle de movimento.
- Nova seção na Central Sistema: **Áudio, UI e acessibilidade F15**.
- Novos arquivos:
  - `data/audio-ui-data.js`
  - `src/core/audio-ui-system.js`
  - `tests/audio-ui-audit.mjs`
- Novo comando: `npm run test:audio-ui`.
- Migração automática para save schema 15.

## Auditoria

- **652 verificações aprovadas**
- **0 falhas**
- Áudio/UI: **16 aprovadas / 0 falhas**
- Mobile horizontal aprovado
- Tablet aprovado
- Desktop aprovado
- Corrida sem Three.js aprovada
- ZIP sem assets binários pesados aprovado

## Política de assets mantida

A pasta `assets` contém somente:

```text
ASSET_MANIFEST.json
ASSET_PATHS_REQUIRED.txt
README_ASSETS.txt
```

Nenhuma imagem, áudio, vídeo ou modelo 3D pesado foi incluído. O áudio da Fase 15 é procedural e os caminhos de assets seguem preservados no manifesto.

## Próxima fase sugerida

**Fase 16 — carreira viva:** staff profundo, fábricas, departamentos, P&D, patrocinadores, orçamento, política interna, academia, mercado, imprensa, rivalidades, mudanças de regulamento, evolução das equipes e múltiplas temporadas consistentes.
