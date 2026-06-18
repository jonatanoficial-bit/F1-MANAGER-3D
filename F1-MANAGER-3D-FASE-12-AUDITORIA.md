# Auditoria — F1 Manager 3D — Fase 12

**Build:** `F1M3D-0.21.0-F12`  
**Resultado:** `approved`  
**Gerado em:** 2026-06-18T22:04:49.166Z

## Totais

| Grupo | Aprovadas | Falhas |
|---|---:|---:|
| Estática | 47 | 0 |
| Build | 49 | 0 |
| Módulos | 41 | 0 |
| Contratos | 15 | 0 |
| Assets | 24 | 0 |
| Persistência | 14 | 0 |
| Performance | 14 | 0 |
| Mobile | 19 | 0 |
| Visual | 52 | 0 |
| CI | 42 | 0 |
| Física do veículo | 21 | 0 |
| IA e estratégia | 23 | 0 |
| Projeto integral | 155 | 0 |
| Navegador | 3 | 0 |
| **Total** | **520** | **0** |

## Cenários de navegador

- **mobile_landscape** `844x390` — aprovado — diagnóstico n/d/100 — resultados 22 pilotos.
- **tablet** `1180x820` — aprovado — diagnóstico n/d/100 — resultados 22 pilotos.
- **desktop** `1440x900` — aprovado — diagnóstico n/d/100 — resultados 22 pilotos.

## Correções da reclamação visual

- Corrigida a rolagem da tela Criar Carreira com containers roláveis em PC, tablet e mobile horizontal.
- Cards de avatar agora exibem o caminho exato esperado do asset.
- Placeholder passou de “PLACEHOLDER SEGURO” para “CAMINHO PRESERVADO”, deixando claro que o caminho existe e falta apenas o binário real.
- Central Sistema recebeu aviso explícito sobre restauração dos assets no GitHub/Vercel.

## IA estratégica validada

- ✓ strategy:factory
- ✓ strategy:audit-score — 100
- ✓ strategy:initial-plan
- ✓ strategy:undercut-overcut
- ✓ strategy:traffic
- ✓ strategy:attack-defense
- ✓ strategy:human-error
- ✓ strategy:pit-crew
- ✓ strategy:double-stacking
- ✓ strategy:unsafe-release
- ✓ strategy:safety-car
- ✓ strategy:vsc
- ✓ strategy:red-flag
- ✓ strategy:restart
- ✓ strategy:overtake-resolution
- ✓ strategy:plan-has-pit-window — {"plan":"balanced","startCompound":"soft","stopBias":"balanced","pitWindow":[6,10],"undercutLap":5,"overcutLap":11,"aggressiveness":0.53,"defenseBias":0.8555555555555555,"tyreCareBias":0.7}
- ✓ strategy:traffic-pressure — {"gapAhead":0.8199999999999825,"gapBehind":99,"carAhead":{"driver":{"short":"BBB","aggression":62,"consistency":78,"racecraft":66},"team":{"id":"t2","name":"Equipe B","car":{"pitStop":54,"reliability":58,"tyreWear":58}},"pos":1,"distance":2.11,"progress":2.11,"lap":8,"compound":"medium","tyre":43,"fuel":71,"condition":90,"pits":0,"car":{"pitStop":54,"reliability":58,"tyreWear":58},"strategy":{"plan":"conservative","startCompound":"medium","stopBias":"late","pitWindow":[9,15],"undercutLap":8,"overcutLap":16,"aggressiveness":0.19666666666666666,"defenseBias":0.7777777777777778,"tyreCareBias":0.58},"pace":"normal"},"carBehind":null,"traffic":true,"underAttack":false,"drsRange":true,"cleanAir":false}
- ✓ strategy:decision-pace — attack
- ✓ strategy:decision-intent — tráfego
- ✓ strategy:pit-service — {"label":"PIT ESTRATÉGICO -4.4s","loss":0.043615384615384625,"compound":"medium"}
- ✓ strategy:safety-car-deploys — 20.14898011444739
- ✓ strategy:red-flag-deploys — 9.702388060159716
- ✓ strategy:overtake-safe — 2.118807990836883/2.11

## Observações

- O executor automatizado continua usando modo em memória sem Three.js para garantir que a simulação não dependa da CDN gráfica.
- Homologação física em Android, iOS, tablet real, PWA instalada e sessões longas segue pendente para fases de certificação.
- Assets binários pesados continuam fora do ZIP; caminhos preservados no manifesto.
