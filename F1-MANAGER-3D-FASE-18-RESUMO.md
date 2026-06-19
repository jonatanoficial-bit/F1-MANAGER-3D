# F1 Manager 3D — Fase 18 v0.27.0-F18

**Fase:** Release Candidate comercial e polimento final  
**Save schema:** 18  
**Base:** v0.26.0-F17

## Implementado

- Novo `data/release-candidate-data.js`.
- Novo `src/core/release-candidate-system.js`.
- Central Sistema com card **Release Candidate comercial F18**.
- Botões internos: **AUDITAR RC**, **PACOTE FINAL** e **CHECKLIST LOJAS**.
- Homologação física planejada para Android, iOS, tablet, desktop e PWA.
- Checklist de lojas para PWA/Web, Google Play, App Store e Windows.
- Rascunhos de privacidade, termos, suporte, exclusão de dados e open-source notices.
- Pacote comercial lógico com bloqueios explícitos.
- Migração automática para save schema 18.
- Novo teste `npm run test:release-candidate`.

## Bloqueios mantidos por segurança

- Não publica automaticamente.
- Não conecta backend real ainda.
- Não inclui assets pesados no ZIP.
- Exige restauração dos assets reais antes de publicar.
- Exige revisão jurídica/licenciamento antes de uso comercial.
- Exige homologação física em aparelhos reais.

## Auditoria

- 712 verificações aprovadas.
- 0 falhas.
- 0 vulnerabilidades npm.
- Mobile horizontal, tablet e desktop aprovados no navegador automatizado.
- ZIP sem binários pesados em assets.
