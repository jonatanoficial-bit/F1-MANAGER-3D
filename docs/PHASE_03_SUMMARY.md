# Fase 3 — Modularização Estrutural e Contratos de Dados

## Build

- Versão: `0.12.0`
- Código: `F1M3D-0.12.0-F03`
- Data: `17/06/2026 18:26 BRT`
- Save schema: `3`
- Base: `v0.11.0-F02`

## Entregas

1. Contrato central dos bancos de equipes, pilotos, calendário, build e assets.
2. Registro indexado de equipes e pilotos para reduzir buscas duplicadas e divergentes.
3. Barramento de eventos para comunicação desacoplada entre telas, save, carreira e corrida.
4. Repositório de persistência com envelope, checksum e três backups rotativos.
5. Migração automática de saves brutos antigos para schema 3.
6. Fábrica e validador do estado da carreira.
7. Motor de ciclo da corrida separado do renderizador Three.js.
8. Gerenciador de telas isolado da lógica esportiva.
9. Diagnóstico interno ampliado para verificar todos os módulos.
10. Testes específicos de contratos e arquitetura.

## Não alterado nesta fase

- balanceamento esportivo;
- banco oficial de calendários;
- regras completas de F1/F2;
- internacionalização;
- conteúdo visual e assets;
- física avançada e ultrapassagens.

Esses itens permanecem em fases posteriores para evitar misturar reestruturação de arquitetura com alterações de gameplay.
