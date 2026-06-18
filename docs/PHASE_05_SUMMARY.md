# F1 Manager 3D — Fase 5 v0.14.0-F05

**Build:** `F1M3D-0.14.0-F05`  
**Data:** 18/06/2026 às 10:42 BRT  
**Save schema:** 5  
**Base:** v0.13.0-F04

## Objetivo

Criar uma camada de persistência realmente antiquebra para reduzir risco de perda de carreira em navegador, PWA, GitHub Pages, futura APK e futuras migrações de versão.

## Entregas técnicas

- Novo envelope ativo: `F1M_SAVE_ENVELOPE_V2`.
- Compatibilidade de leitura com `F1M_SAVE_ENVELOPE_V1` e saves legados brutos.
- Escrita atômica com chave temporária, validação antes do commit e limpeza do temporário.
- Cinco backups rotativos automáticos.
- Journal de save com até 20 eventos recentes.
- Recuperação automática quando o save ativo estiver corrompido.
- Recuperação manual pelo botão **RECUPERAR MELHOR BACKUP**.
- Verificação manual pelo botão **VERIFICAR COFRE**.
- Exportação/importação segura por pacote `F1M_PORTABLE_SAVE_V1`.
- Checksum em pacote exportado, com rejeição de arquivo adulterado.
- Migração de carreira para save schema 5.

## Auditoria

- Total consolidado: **240 aprovadas / 0 falhas**.
- Auditoria de persistência: **14 aprovadas / 0 falhas**.
- Navegador: mobile horizontal, tablet e desktop aprovados.
- Diagnóstico interno no executor: 94/100 por ausência de Service Worker/WebGL no ambiente em memória.

## Política de assets

O ZIP continua sem imagens, áudios, vídeos ou modelos pesados. A pasta `assets` contém apenas documentos de catálogo e caminhos.

- Binários originais catalogados/removidos: **416**.
- Caminhos catalogados: **519**.
- Assets obrigatórios ausentes no projeto original: **7**.

## Observação

Esta fase fortalece a base antes de evoluir física, IA e regulamentos. Ela não altera ainda o modelo esportivo da corrida; evita perda de progresso e cria segurança para as próximas fases.
