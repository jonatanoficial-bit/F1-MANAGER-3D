# F1 Manager 3D — Fase 7 concluída

**Build:** `F1M3D-0.16.0-F07`  
**Versão:** `0.16.0`  
**Data:** 18/06/2026 às 11:18 BRT  
**Save schema:** 7  
**Base:** v0.15.0-F06

## Objetivo da fase

A Fase 7 transformou a camada de experiência mobile/tablet/PC em uma fundação mais próxima de produto comercial: fullscreen controlado por gesto, safe area para notch, classificação de viewport, HUD adaptativo, navegação lateral rolável e auditoria específica para dispositivos horizontais compactos.

## Principais entregas

- Novo módulo `src/core/viewport-manager.js`.
- Painel imersivo global `mobileUxPanel` com ações de tela cheia e alternância de HUD.
- Chip de viewport/debug `viewportDebugPill` para auditoria rápida.
- Fullscreen conectado ao gerenciador de viewport e fallback seguro quando o navegador bloquear a chamada.
- Bloqueio/orientação horizontal mantido sem quebrar desktop.
- Variáveis CSS `--app-height`, `--visual-height` e safe areas com `env(safe-area-inset-*)`.
- Botões com alvo mínimo de toque e `touch-action: manipulation`.
- Navegação lateral agora é rolável no mobile, evitando botões inacessíveis.
- HUD de corrida com modo automático, compacto e expandido.
- Ajustes específicos para altura reduzida em landscape.
- Nova seção na aba Sistema: **Mobile, fullscreen e safe area**.
- Migração de save para schema 7 com dados de viewport/mobile UX.
- Novo teste `npm run test:mobile`.
- Cadeia CI atualizada para incluir auditoria mobile.

## Auditoria consolidada

- **385 verificações aprovadas**
- **0 falhas**
- **0 vulnerabilidades npm**
- Mobile UX: **19 aprovadas / 0 falhas**
- Performance: **14 aprovadas / 0 falhas**
- Projeto integral: **115 aprovadas / 0 falhas**

## Cenários funcionais validados

- mobile_landscape: 844×390 — aprovado — diagnóstico 94/100
- tablet: 1180×820 — aprovado — diagnóstico 94/100
- desktop: 1440×900 — aprovado — diagnóstico 94/100

O fluxo validado incluiu: home, criação de carreira, save schema 7, aba Sistema, medição de performance, Central de Assets, classificação, corrida sem Three.js, avanço de voltas e resultado com 22 pilotos.

## Política de assets

A regra do projeto foi mantida. O ZIP final não inclui imagens, áudios, vídeos ou modelos 3D pesados.

A pasta `assets` contém apenas:

```text
ASSET_MANIFEST.json
ASSET_PATHS_REQUIRED.txt
README_ASSETS.txt
```

Catálogo preservado:

- 519 caminhos conhecidos;
- 416 binários originais documentados;
- aproximadamente 176.61 MiB removidos do pacote;
- 7 assets obrigatórios ausentes desde o ZIP original continuam documentados.

## Limitação honesta

A auditoria automatizada validou os cenários por Chromium em memória e por testes estáticos/funcionais. Ainda é necessária homologação física em Android, iOS, PWA instalada e tablets reais para confirmar temperatura, gestos de sistema, notch real, barras de navegação e comportamento de fullscreen dos navegadores.

## Próxima fase sugerida

**Fase 8 — Internacionalização PT-BR, EN e ES**, extraindo textos fixos para catálogos de idioma, preparando fallback, expansão de texto e base comercial internacional.
