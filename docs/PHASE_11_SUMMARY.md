# F1 Manager 3D — Fase 11 — Física e estado do veículo

**Build:** `F1M3D-0.20.0-F11`  
**Versão:** `v0.20.0-F11`  
**Data:** 18/06/2026 às 18:46 BRT  
**Save schema:** 11  
**Base:** v0.19.0-F10

## Objetivo

Esta fase adiciona uma camada modular de física e estado do veículo sem remover sistemas anteriores. A corrida passa a simular pneus, temperatura, combustível, ERS, DRS, freios, motor, danos, confiabilidade, dirty air e evolução da pista, mantendo a corrida funcionando mesmo sem Three.js/WebGL.

## Principais entregas

- Novo `data/vehicle-data.js` com compostos, modos de ritmo e coeficientes físicos.
- Novo `src/core/vehicle-physics.js` com API isolada e auditável.
- Integração da física no loop de corrida existente.
- Telemetria no HUD do piloto: pneu, temperatura, ERS, DRS, freio, motor, dano e combustível.
- Evolução dinâmica da pista por borracha e umidade.
- DRS condicionado por volta, setor, gap, Safety Car e pista molhada.
- ERS com regeneração, uso em ataque/defesa e penalidade quando baixo.
- Freios e motor com temperatura e perda de performance por superaquecimento.
- Dano aerodinâmico, chassi e unidade de potência afetando ritmo e confiabilidade.
- Migração automática para save schema 11.
- Nova seção na Central Sistema: **Física do veículo**.
- Novo teste `npm run test:vehicle`.

## Auditoria

- **479 verificações aprovadas**
- **0 falhas**
- Física veicular: **21 aprovadas / 0 falhas**
- Navegador: **3 cenários aprovados**
- Mobile horizontal, tablet e desktop validados
- Corrida sem Three.js validada
- Resultado com 22 pilotos validado

## Política de assets

A pasta assets contém somente ASSET_MANIFEST.json, ASSET_PATHS_REQUIRED.txt e README_ASSETS.txt; nenhuma imagem, áudio, vídeo ou modelo 3D pesado foi incluído.

Catálogo preservado:

- 519 caminhos conhecidos
- 416 binários originais documentados
- 7 assets obrigatórios ausentes herdados do ZIP original

## Próxima fase recomendada

**Fase 12 — IA, ultrapassagem e estratégia:** undercut/overcut, tráfego, defesa, ataque, erro humano, pit crew, double stacking, unsafe release, Safety Car, VSC, bandeira vermelha e relargadas.
