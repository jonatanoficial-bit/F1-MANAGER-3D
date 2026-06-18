# Auditoria — F1 Manager 3D v0.17.0-F08

**Build:** F1M3D-0.17.0-F08  
**Versão:** 0.17.0  
**Fase:** 8 — Internacionalização PT-BR, EN e ES  
**Data:** 18/06/2026 11:43 BRT

## Resultado geral

| Grupo | Aprovadas | Falhas |
|---|---:|---:|
| Estática | 40 | 0 |
| Build | 41 | 0 |
| Módulos | 29 | 0 |
| Contratos | 15 | 0 |
| Assets | 24 | 0 |
| Persistência | 14 | 0 |
| Performance | 14 | 0 |
| Mobile | 19 | 0 |
| I18N | 16 | 0 |
| Navegador | 3 | 0 |
| Regressão visual | 41 | 0 |
| CI | 42 | 0 |
| Projeto integral | 122 | 0 |
| **Total** | **404** | **0** |

## Teste de navegador

O teste em Chromium/CDP rodou com os arquivos reais da build injetados em memória e Three.js deliberadamente ausente, validando o fallback 2D da corrida.

| Cenário | Resolução | Resultado | Diagnóstico |
|---|---:|---|---:|
| Mobile horizontal | 844×390 | Aprovado | 95/100 |
| Tablet | 1180×820 | Aprovado | 94/100 |
| Desktop | 1440×900 | Aprovado | 94/100 |

## Auditoria i18n

- Catálogo sintaticamente válido.
- Módulo i18n sintaticamente válido.
- Idiomas suportados: `pt-BR`, `en`, `es`.
- Fallback oficial: `pt-BR`.
- 124 frases-chave.
- 124 traduções em inglês.
- 124 traduções em espanhol.
- Troca de idioma validada em runtime.
- Idioma não suportado retorna para `pt-BR`.
- Arquivos de i18n incluídos no app shell e service worker.

## Salvamento e migração

- Save schema atualizado para 8.
- Saves antigos continuam migráveis.
- Migração 8 adiciona `settings.language`, `settings.locale`, `quality.i18n` e módulo `localization` na arquitetura.
- Persistência permanece em `F1M_SAVE_ENVELOPE_V2`.
- Exportação/importação portátil permanece em `F1M_PORTABLE_SAVE_V1`.

## Assets

- Nenhum binário pesado no ZIP.
- 519 caminhos conhecidos.
- 416 binários originais documentados.
- 7 assets obrigatórios ausentes no projeto original continuam documentados.
- Nenhuma colisão case-sensitive.
- Nenhum path traversal aceito.

## Observações

A internacionalização desta fase cria a fundação real para produto internacional, mas ainda não é a tradução editorial completa de 100% de todas as frases longas geradas dinamicamente por sistemas de carreira, imprensa e relatórios. A partir desta fase, novas telas devem nascer usando o catálogo i18n em vez de textos fixos.
