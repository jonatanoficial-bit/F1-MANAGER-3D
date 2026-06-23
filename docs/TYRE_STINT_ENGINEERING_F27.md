# Fase 27 — Engenharia de pneus, stint e degradação profunda

Build: `F1M3D-0.36.0-F27`

A Fase 27 aprofunda o simulador com um modelo técnico de pneus e stint. O objetivo é aproximar a tomada de decisão de uma parede de boxes real, sem bônus arcade escondido.

## Sistemas incluídos

- Compostos: macio, médio, duro, intermediário e chuva extrema.
- Janela térmica separada entre superfície e carcaça.
- Pressão de pneu por composto.
- Desgaste por idade de stint e carga.
- Graining quando o pneu trabalha frio/escorregando.
- Blistering quando o pneu trabalha superaquecido.
- Flat spot por travamento.
- Risco de cliff e furo.
- Ritmo corrigido por combustível.
- Força de undercut e resistência ao overcut.
- Plano de pit wall com prioridade técnica.

## Decisões reais suportadas

O jogo agora pode explicar tecnicamente por que parar, estender ou resfriar pneus:

- pneu fora da janela ideal;
- alta energia de escorregamento;
- tráfego e ar sujo;
- combustível alto;
- pressão incorreta;
- freio causando flat spot;
- degradação acima da curva prevista;
- risco de penhasco de performance.

## Nota de realidade

O sistema usa um modelo plausível para simulação de gestão. Ele não contém telemetria proprietária oficial de equipes reais e não usa dados sigilosos.
