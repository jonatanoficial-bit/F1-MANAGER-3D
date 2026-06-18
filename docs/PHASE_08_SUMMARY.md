# F1 Manager 3D — Fase 8 concluída

**Versão:** v0.17.0-F08  
**Build:** F1M3D-0.17.0-F08  
**Data:** 18/06/2026 às 11:43 BRT  
**Save schema:** 8  
**Base preservada:** v0.16.0-F07

## Objetivo da fase

Implantar a fundação de internacionalização para transformar o jogo em um produto internacional jogável em português, inglês e espanhol, mantendo o sistema antiquebra, mobile-first e compatibilidade com saves anteriores.

## Principais entregas

- Novo catálogo trilíngue em `data/i18n.js`.
- Novo módulo central `src/core/i18n-system.js`.
- Suporte oficial a:
  - `pt-BR` — Português;
  - `en` — English;
  - `es` — Español.
- Seletor de idioma na tela inicial.
- Seletor compacto de idioma no painel mobile/fullscreen.
- Nova seção “Idioma e região” na aba Sistema.
- Persistência do idioma no save schema 8.
- Fallback seguro para português quando uma frase ainda não tiver tradução.
- Tradução automática de textos estáticos, títulos, placeholders, `aria-label`, `alt` e elementos renderizados dinamicamente.
- Formatação regional para dinheiro/números via camada i18n.
- Integração da i18n no diagnóstico do sistema.
- Auditoria específica `npm run test:i18n`.
- Cadeia `npm run audit` ampliada para incluir i18n.
- PWA app shell atualizado para cachear os novos módulos de idioma.

## Cobertura de tradução nesta fase

- **124 frases-chave catalogadas**.
- **124 frases em inglês**.
- **124 frases em espanhol**.
- Fallback em português ativo.
- Idioma não suportado volta automaticamente para `pt-BR`.

## Correção crítica adicional

Durante a auditoria da Fase 8 foi detectado um conflito entre `body[data-lang]` e botões `[data-lang]`. Isso fazia qualquer clique ser interpretado como troca de idioma e bloqueava navegação. A correção foi aplicada: apenas `.lang-btn[data-lang]` dispara troca de idioma.

## Auditoria final

Resultado consolidado do `npm run audit`:

- **404 verificações aprovadas**
- **0 falhas**
- **0 vulnerabilidades npm**
- Chromium/CDP inline memory aprovado em:
  - mobile horizontal 844×390;
  - tablet 1180×820;
  - desktop 1440×900.

Fluxo validado em navegador:

1. Home.
2. Criação de carreira.
3. Save schema 8.
4. Aba Sistema.
5. Troca de idioma para inglês.
6. Diagnóstico completo.
7. Performance.
8. Central de Assets.
9. Classificação.
10. Corrida sem Three.js.
11. Avanço real de voltas.
12. Resultado com 22 pilotos.

## Política de assets

A regra combinada foi mantida.

O ZIP não contém imagens, áudios, vídeos ou modelos 3D pesados. A pasta `assets` contém somente:

```text
ASSET_MANIFEST.json
ASSET_PATHS_REQUIRED.txt
README_ASSETS.txt
```

Foram preservados:

- **519 caminhos catalogados**;
- **416 binários originais documentados**;
- aproximadamente **176,61 MiB** de assets fora do ZIP;
- **7 assets obrigatórios ausentes desde o ZIP original** continuam registrados.

## Próxima etapa recomendada

**Fase 9 — banco esportivo autoritativo, calendários reais separados para F1/F2, regras próprias de categoria e preparação jurídica de nomes, marcas, pilotos e circuitos.**
