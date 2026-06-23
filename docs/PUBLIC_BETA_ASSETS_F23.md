# Fase 23 — Beta público com assets reais restaurados

Esta fase prepara o projeto para liberar um beta público controlado usando os assets reais restaurados no GitHub/Vercel, sem incluir binários pesados no ZIP de evolução.

## Fluxo obrigatório

1. Copiar a pasta `assets` pesada original para a raiz do projeto local.
2. Conferir `assets/ASSET_PATHS_REQUIRED.txt`.
3. Rodar `npm run test:assets` e `npm run test:public-beta-assets`.
4. Subir a build para o GitHub.
5. Validar deploy/preview no Vercel.
6. Limpar cache PWA e testar em aba anônima.
7. Validar mobile 844×390, tablet e desktop.
8. Registrar prints antes de liberar link do beta.

## Bloqueios

A produção continua bloqueada enquanto existirem assets sem restauração real, licenças pendentes, ausência de teste físico ou revisão jurídica.
