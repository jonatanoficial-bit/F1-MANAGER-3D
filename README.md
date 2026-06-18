# F1 Manager 3D — v0.19.0-F10

Build `F1M3D-0.19.0-F10` da Fase 10. Projeto mobile-first/PWA com carreira F2/F1, internacionalização PT-BR/EN/ES, assets externos por manifesto, save vault e auditoria antiquebra.

## Destaque da fase

A Fase 10 adiciona a primeira camada oficial de sessões e regulamento: F1 Grand Prix com Q1/Q2/Q3, F1 Sprint, F2 Sprint/Feature, pontuação separada, pole points F2, punições, bandeiras, parque fechado e classificação oficial.

## Rodar auditoria

```bash
npm install
npm run audit
```

Resultado desta entrega: 438 verificações aprovadas e 0 falhas.

## Assets

O ZIP de fase não inclui imagens, áudios, vídeos ou modelos 3D pesados. Use `assets/ASSET_PATHS_REQUIRED.txt` e `assets/ASSET_MANIFEST.json` para restaurar os binários no caminho exato.

## Build atual — v0.21.0-F12

Fase 12 adiciona IA estratégica de corrida: undercut/overcut, tráfego, ataque, defesa, erro humano, pit crew, double stacking, unsafe release, Safety Car, VSC, bandeira vermelha e relargadas. Também corrige a rolagem da tela Criar Carreira e torna os caminhos de assets visíveis nos placeholders.

Para auditar:

```bash
npm run audit
```

Para testar somente a física:

```bash
npm run test:vehicle
```


## Assets no Vercel/GitHub

Por regra do projeto, os ZIPs de fase não incluem imagens, áudios, vídeos ou modelos 3D pesados. Os caminhos permanecem preservados em `assets/ASSET_PATHS_REQUIRED.txt` e `assets/ASSET_MANIFEST.json`. Se o deploy exibir placeholders, copie a pasta `assets` real para os caminhos documentados.
