# Fase 1 — Baseline e Hotfix Crítico

**Build:** F1M3D-0.10.0-F01  
**Data:** 17/06/2026 às 17:10 BRT  
**Status:** aprovada pelas auditorias automatizadas.

## Entregue

- Correção da aba Data Lock.
- Simulação desacoplada do Three.js e da CDN.
- Um único loop de corrida, cancelado ao sair da tela.
- Limpeza de WebGL, texturas, materiais, geometrias e listener de resize.
- Fallback de telemetria quando o 3D não carrega.
- Carreira F2 alinhada à primeira etapa, incluindo migração de saves sem schema.
- Build centralizada com versão, data, hora, código, schema e data pack.
- Registro de falhas de runtime e backup simples do save anterior.
- Catálogo dos 416 arquivos de assets recebidos e 519 caminhos totais conhecidos.
- ZIP sem assets binários, contendo os caminhos, tamanhos e SHA-256 originais.

## Auditorias

- 8 verificações estáticas: aprovadas.
- 44 verificações de projeto: aprovadas.
- Fluxo funcional em 844×390, 1180×820 e 1440×900: aprovado.
- Data Lock, classificação, corrida sem Three.js e resultado com 22 pilotos: aprovados.
- Servidor HTTP: resposta 200.
- Assets binários dentro do ZIP de fase: zero.

## Pendências deliberadamente fora desta fase

Calendários oficiais separados, número real de voltas, física avançada, internacionalização, save com checksum/journal, Three.js local e homologação física serão tratados nas fases correspondentes do roadmap.
