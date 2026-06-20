# Guia F22 — Hotfix visual e rolagem

## Objetivo
Garantir que PC, tablet e mobile horizontal tenham rolagem estável, caminhos de imagens visíveis e fundos restauráveis sem incluir os binários pesados no ZIP.

## Checklist rápido
1. Substitua os arquivos do projeto pela build F22.
2. Preserve `assets/ASSET_MANIFEST.json`, `assets/ASSET_PATHS_REQUIRED.txt` e `assets/README_ASSETS.txt`.
3. Copie a pasta `assets` pesada original por cima da pasta leve quando for testar preview real.
4. Limpe cache PWA após deploy.
5. Valide Criar Carreira, Lobby, Garagem, Classificação, Corrida e Resultados em mobile horizontal e PC.
