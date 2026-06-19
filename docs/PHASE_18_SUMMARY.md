# Fase 18 — Release Candidate comercial

Build v0.27.0-F18 prepara o jogo para uma etapa de Release Candidate comercial, sem publicar automaticamente e sem esconder pendências críticas.

## Escopo

- Homologação física Android, iOS, tablet, desktop e PWA.
- Checklist de lojas para PWA/Web, Android, iOS e Windows.
- Privacidade, suporte, data deletion e open-source notices como documentos finais de publicação.
- Matriz de performance real por aparelho.
- Pacote comercial lógico com bloqueios explícitos.
- Auditoria F18 integrada ao sistema antiquebra.

## Bloqueios intencionais antes de publicação

- Restaurar assets pesados reais no GitHub/Vercel seguindo `assets/ASSET_PATHS_REQUIRED.txt`.
- Executar homologação física em aparelhos reais.
- Fazer revisão jurídica/licenciamento de nomes, marcas, pilotos, equipes, circuitos e imagens.
- Escolher e conectar backend real sem expor segredos no cliente.
