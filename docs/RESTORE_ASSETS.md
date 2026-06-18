# Como restaurar os assets

1. Extraia a build da fase.
2. Copie sua pasta `assets` pesada original por cima da pasta `assets` incluída.
3. Preserve os três arquivos de controle da fase ou faça backup antes de sobrescrever.
4. Não altere nomes, extensão ou maiúsculas/minúsculas.
5. Consulte `assets/ASSET_PATHS_REQUIRED.txt`.
6. Para auditoria por hash e tamanho, consulte `assets/ASSET_MANIFEST.json`.

A build funciona sem os binários por meio de fallbacks, mas a apresentação visual completa depende da restauração dos arquivos.
