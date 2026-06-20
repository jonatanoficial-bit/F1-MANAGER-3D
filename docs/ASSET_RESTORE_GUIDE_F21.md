# Guia F21 — Restauração de Assets Reais e Preview

Build: F1M3D-0.30.0-F21

Esta fase mantém a regra do projeto: o ZIP de fase não carrega imagens, áudios, vídeos ou modelos 3D pesados. Os caminhos continuam preservados em `assets/ASSET_PATHS_REQUIRED.txt` e `assets/ASSET_MANIFEST.json`.

## Como restaurar os assets reais

1. Extraia o ZIP da Fase 21 na pasta oficial do projeto.
2. Copie a pasta `assets` pesada original por cima da pasta `assets` leve.
3. Não apague estes arquivos:
   - `assets/ASSET_MANIFEST.json`
   - `assets/ASSET_PATHS_REQUIRED.txt`
   - `assets/README_ASSETS.txt`
4. Confirme os caminhos principais:
   - `assets/avatars/selectable/avatar_01.png`
   - `assets/backgrounds/home/home_bg.png`
   - `assets/backgrounds/race/boxes/box_garage_interior_01.png`
   - `assets/backgrounds/garage/garage_base.png`
   - `assets/tracks/svg/australia.svg`
   - `assets/tracks/svg/bahrein.svg`
   - `assets/tracks/svg/monaco.svg`
5. Rode `npm run audit` antes de enviar ao GitHub.
6. Envie para GitHub e aguarde o preview do Vercel.
7. Abra em aba anônima ou limpe o cache PWA se as imagens antigas ainda aparecerem.

## Produção

Produção continua bloqueada até:

- assets obrigatórios restaurados;
- preview GitHub/Vercel validado;
- PWA cache limpo;
- homologação real em mobile;
- revisão jurídica de nomes, marcas, equipes, pilotos, circuitos e imagens.
