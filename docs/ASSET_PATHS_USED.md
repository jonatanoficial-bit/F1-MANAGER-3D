# F1 Manager Career 2026 — Asset Paths Used (Build v0.4.0)

## Correções aplicadas nesta build
- Corrigidos caminhos dos backgrounds de UI.
- Corrigidos caminhos dos ícones de carro e HUD.
- Corrigidos caminhos dos avatars do gestor.
- Integrados portraits para pilotos F1 disponíveis nos assets.
- Integrados portraits genéricos para pilotos F2 usando `assets/avatars/generated/`.
- Integradas logos/cards/lobbies de equipes F1 quando disponíveis.
- Adicionado fallback automático para buscar arquivos tanto em `assets/` quanto em pastas `f1_assets_part_XX/assets/`.

## Estrutura-base esperada
O jogo agora aceita duas formas de deploy:

### Opção A — recomendada
```
/assets/...
/index.html
/style.css
/script.js
```

### Opção B — fallback automático
```
/f1_assets_part_01/assets/...
/f1_assets_part_02/assets/...
...
/f1_assets_part_15/assets/...
/index.html
/style.css
/script.js
```

## Principais caminhos usados
- `backgrounds/ui/global_lobby.png`
- `backgrounds/ui/classification_clean.png`
- `backgrounds/ui/calendar_world_map.png`
- `backgrounds/garage/garage_base.png`
- `backgrounds/race/tracks/miami_base_isometric.png`
- `backgrounds/podium/podium_stage.png`
- `icons/car_parts/engine.png`
- `icons/car_parts/aerodynamics_rear_wing.png`
- `icons/car_parts/chassis.png`
- `icons/car_parts/fuel_efficiency_orange.png`
- `icons/car_parts/reliability_shield.png`
- `icons/race_controls/pit_stop_timer_with_text.png`
- `icons/race_controls/attack_mode_orange_01.png`
- `icons/race_controls/save_tires_green.png`
- `icons/race_controls/save_fuel_green_01.png`
- `icons/race_controls/strategy_change_blue_01.png`
- `icons/hud/mini_car_topdown.png`
- `icons/hud/position_badge_01.png`
- `avatars/selectable/avatar_01.png` até `avatar_08.png`
- `avatars/generated/avatar_generated_01.png` até `avatar_generated_08.png`
- `drivers/current_grid/*.png`
- `teams/logos/*.png`
- `teams/cards/*.png`
- `backgrounds/teams/lobby/*.png`
- `flags/all/*.png`

## Observação importante
Se o deploy for feito sem nenhuma pasta de assets, o jogo continuará funcionando em lógica e layout, mas as imagens continuarão ausentes no navegador porque o servidor retornará 404. Esta build corrige a integração do lado do jogo, mas os arquivos precisam existir no deploy.
