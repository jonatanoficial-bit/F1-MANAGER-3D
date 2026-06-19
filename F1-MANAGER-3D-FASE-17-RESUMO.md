# F1 Manager 3D — Fase 17 v0.26.0-F17

**Build:** `F1M3D-0.26.0-F17`  
**Fase:** Backend, segurança e lançamento  
**Save schema:** 17  
**Base:** v0.25.0-F16

## Implementado

- Fundação de contas por adaptador, sem armazenar senha no cliente.
- Cloud save preparado por adaptador seguro, ainda sem backend real conectado.
- Fila local de sincronização e pacote portátil compatível com o cofre de saves.
- Resolução de conflitos: mais novo válido, maior progresso, escolha manual e cópia separada.
- Telemetria desligada por padrão e dependente de consentimento explícito.
- Crash reporting local com redaction de dados sensíveis.
- Configuração remota local/snapshot, preparada para futura conexão segura.
- Rollback com proteção de schemas 15, 16 e 17.
- Canais de lançamento: alpha, beta, release candidate e produção.
- Targets de plataforma: PWA/Web, Android, iOS e Windows.
- Checklist de loja: política de privacidade, termos, suporte, classificação etária, revisão de licenças e open-source notices.
- Live ops planejado: notícias, balance patch, mensagem do servidor, manutenção remota, rollback switch e diagnósticos de suporte.
- Nova Central Sistema: **Backend, segurança e lançamento F17**.
- Botões internos: **AUDITAR LANÇAMENTO**, **PREPARAR RC** e **CONSENTIMENTO**.
- Novo teste `npm run test:backend-launch`.
- Migração automática para save schema 17.

## Observação honesta

A Fase 17 **não conecta um servidor real** nem coloca segredo/API key dentro do cliente. Ela prepara a arquitetura, os adaptadores, o checklist e os controles para quando o backend real for escolhido. Isso evita vazamento de credenciais e mantém o jogo jogável offline/PWA.

## Auditoria

- **693 verificações aprovadas**
- **0 falhas**
- Backend/lançamento: **23 aprovadas / 0 falhas**
- Mobile horizontal aprovado
- Tablet aprovado
- Desktop aprovado
- Corrida sem Three.js aprovada
- ZIP sem assets binários pesados aprovado
- `npm audit`: **0 vulnerabilidades**

## Assets

Mantive sua regra. O ZIP continua sem imagens, áudios, vídeos ou modelos 3D pesados.

A pasta `assets` contém somente:

```text
ASSET_MANIFEST.json
ASSET_PATHS_REQUIRED.txt
README_ASSETS.txt
```

Os caminhos continuam preservados para restaurar a pasta `assets` real no GitHub/Vercel.

## Próxima etapa natural

A próxima fase pode ser a **Fase 18 — Release Candidate comercial e polimento final: homologação física Android/iOS/PWA, checklist de lojas, revisão jurídica, telas finais de suporte/privacidade, performance real em aparelhos e pacote final para publicação**.
