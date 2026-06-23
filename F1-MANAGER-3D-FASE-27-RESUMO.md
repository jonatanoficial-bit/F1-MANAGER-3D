# F1 Manager 3D — Fase 27 v0.36.0-F27

**Build:** `F1M3D-0.36.0-F27`  
**Fase:** Engenharia de pneus, stints e degradação profunda realista  
**Save schema:** 27  
**Base:** v0.35.0-F26

## Objetivo

A Fase 27 aprofunda o F1 Manager 3D como verdadeiro simulador técnico, reforçando a prioridade do projeto: máxima realidade possível, telemetria plausível, decisões explicáveis e ausência de bônus arcade escondido.

## Implementado

- Novo sistema `data/tyre-stint-data.js`.
- Novo motor `src/core/tyre-stint-system.js`.
- Novo teste `npm run test:tyre-stint`.
- Novo guia `docs/TYRE_STINT_ENGINEERING_F27.md`.
- Nova Central Sistema: **Pneus e stint F27**.
- Migração automática para save schema 27.
- Integração com corrida, telemetria, setup, pit wall e HUD de piloto.

## Simulação de pneus adicionada

- Compostos: macio, médio, duro, intermediário e chuva extrema.
- Janela térmica separada entre superfície e carcaça.
- Pressão de pneus por composto.
- Desgaste por idade de stint, combustível, ar sujo e escorregamento.
- Graining quando o pneu trabalha frio/escorregando.
- Blistering quando o pneu trabalha superaquecido.
- Flat spot por travamento.
- Risco de cliff e furo.
- Ritmo corrigido por combustível.
- Força de undercut e resistência ao overcut.
- Plano de pit wall com recomendação técnica.

## Decisão técnica

O jogo passa a explicar tecnicamente situações como:

- parar agora porque o pneu entrou no cliff;
- cobrir undercut de rival;
- estender stint com pneu ainda saudável;
- resfriar pneus por blistering;
- aquecer sem escorregar para reduzir graining;
- ajustar pilotagem/freio para evitar flat spot.

## Auditoria

- Auditoria total: **1089 verificações aprovadas / 0 falhas**.
- Auditoria F27 pneus/stint: **21 aprovadas / 0 falhas**.
- Mobile horizontal aprovado.
- Tablet aprovado.
- Desktop aprovado.
- Save schema 27 aprovado.
- ZIP sem assets binários pesados aprovado.
- Caminhos de assets preservados.

## Observação de realismo

O modelo é técnico e plausível para simulador de gestão. Ele não contém telemetria proprietária oficial de equipes reais nem dados sigilosos.
