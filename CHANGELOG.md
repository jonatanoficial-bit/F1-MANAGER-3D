# Changelog — v0.17.0-F08

## Adicionado

- Fundação de internacionalização PT-BR, EN e ES.
- `data/i18n.js` com 124 frases-chave.
- `src/core/i18n-system.js` com seletor, fallback, persistência e tradução de DOM.
- Seletor de idioma na Home.
- Seletor compacto de idioma no painel mobile.
- Card “Idioma e região” na Central Sistema.
- Auditoria `npm run test:i18n`.
- Inclusão dos módulos i18n no PWA app shell.

## Alterado

- Save schema atualizado para 8.
- `npm run audit` agora inclui auditoria i18n.
- Diagnóstico do sistema agora verifica catálogo e fallback de idioma.
- Orçamento de qualidade atualizado para Fase 8.

## Corrigido

- Conflito entre `body[data-lang]` e botões `[data-lang]`; a troca de idioma agora usa somente `.lang-btn[data-lang]`.

## Mantido

- Sem assets binários pesados no ZIP.
- 519 caminhos preservados no manifesto.
- 416 binários originais documentados fora do pacote.
- Corrida funcional sem Three.js.
