# Fase 04 — Registro Central de Assets e Placeholders Seguros

## Build
- Versão: `0.13.0`
- Código: `F1M3D-0.13.0-F04`
- Save schema: `4`
- Base: `v0.12.0-F03`

## Entregas
1. Registro central runtime com 519 caminhos catalogados.
2. Catálogo gerado automaticamente a partir de `assets/ASSET_MANIFEST.json`.
3. Normalização case-sensitive e rejeição de caminhos com `..`.
4. Classificação automática de background, avatar, logo, bandeira, pista, ícone, áudio, fonte e modelo.
5. Placeholders SVG gerados em memória, sem acrescentar binários ao ZIP.
6. Monitoramento de estados carregado, carregando, placeholder e inválido.
7. MutationObserver para hidratar componentes inseridos dinamicamente.
8. Central de Assets dentro do jogo com resumo, ausências e relatório exportável.
9. Diagnóstico antiquebra integrado ao registro de assets.
10. App shell/PWA atualizado para armazenar o catálogo e o módulo central.
11. Migração automática para save schema 4.
12. Auditoria dedicada de assets adicionada ao comando `npm run audit`.

## Política de entrega
A pasta `assets/` continua contendo somente documentos de caminhos e manifesto. Nenhuma imagem, áudio, vídeo, fonte ou modelo pesado foi incluído.
