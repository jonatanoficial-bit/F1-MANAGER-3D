# F1 Manager 3D — Auditoria Técnica e Roadmap Comercial Internacional

**Data da auditoria:** 17/06/2026 (BRT)  
**Arquivo-base:** `F1-MANAGER-3D-main.zip`  
**SHA-256 do arquivo-base:** `65bb78db8fa96187c712f58e00d0da116b7bf90f2c15b0029ffbc5431092ff8e`  
**Tamanho do ZIP:** 180.637.352 bytes (~172,27 MiB)  
**Arquivos extraídos:** 480  
**Arquivos em `assets/`:** 416

## 1. Veredito executivo

O projeto atual é um **protótipo avançado/vertical slice jogável**, com bom volume de conteúdo, carreira F2/F1, sessões de treino/classificação/corrida, mercado, temporadas, PWA e renderização 3D procedural. Ele ainda **não está pronto para certificação comercial**, nem pode ser classificado como AAA na arquitetura atual.

A base demonstra potencial, mas precisa passar por uma estabilização estrutural antes de receber expansão de conteúdo. O risco principal hoje não é falta de telas; é a combinação de código monolítico, dados duplicados, versões divergentes, simulação simplificada, ausência de testes automatizados e dependência externa do motor 3D.

**Maturidade estimada atual:** 31/100 para o objetivo comercial internacional proposto.

## 2. Pontos positivos encontrados

- Fluxo principal completo: criação de perfil, seleção de equipe, lobby, treino, classificação, corrida e resultados.
- Base de carreira com F2 e F1, mercado, calendário, contratos, reputação e progressão.
- Interface adaptativa com comportamento aceitável em desktop, tablet e mobile horizontal.
- Estrutura PWA existente.
- 25 layouts de pista incorporados no conjunto principal de dados.
- Dados principais com chaves internas coerentes: equipes, pilotos, calendário e layouts sem duplicatas críticas.
- Sintaxe JavaScript válida e JSONs legíveis.
- Tela de corrida 3D procedural já funcional quando a biblioteca externa está disponível.

## 3. Bloqueadores críticos encontrados

### P0 — Falha funcional reproduzível

No painel **Data Lock**, `script.js` chama `driverMarketValue(d)`, função inexistente. A função presente é `driverValue(d)`. O erro reproduzido é:

```text
driverMarketValue is not defined
```

Isso interrompe a renderização da aba e prova que o QA interno atual não detecta falhas reais de execução.

### P0 — Dependência 3D externa e PWA offline incompleta

O Three.js é carregado por CDN. A biblioteca não está no App Shell do service worker. Sem rede/CDN:

- a renderização 3D não inicia;
- o loop que atualiza a simulação também não é executado;
- a corrida deixa de progredir automaticamente.

O motor de simulação não pode depender do renderizador.

### P0 — Vazamento de renderização e eventos

O `requestAnimationFrame` do `TrackRenderer3D` continua ativo após o término da corrida. O renderizador mantém sua própria referência à corrida, e o listener anônimo de `resize` não é removido. Consequências prováveis em mobile:

- consumo contínuo de CPU/GPU;
- aquecimento;
- bateria drenada;
- queda progressiva de desempenho ao disputar várias corridas.

### P0 — Versões e datas divergentes

Foram encontrados simultaneamente:

- README: `v0.8.0`;
- `BUILD_INFO.json`: `v0.9.37`;
- `data/build.json`: `v0.9.9`;
- interface/service worker/manifest: `v0.9.37`;
- exportação diagnóstica: nome `v0-9-36`.

Além disso, a data textual do `BUILD_INFO.json` não coincide com o timestamp ISO. É necessário ter uma única fonte de verdade gerada automaticamente.

### P0 — Dados esportivos e lógica de temporada

- O calendário principal possui 25 etapas e é usado também pela F2.
- O calendário oficial da F1 2026 possui 24 etapas.
- A F2 2026 possui calendário próprio, com 14 sedes.
- A carreira F2 inicia internamente no índice 5, enquanto a agenda usa `completedRaces` como índice inicial. A tela de corrida pode apontar Miami enquanto a agenda aponta a primeira etapa da lista.
- Todas as corridas usam 18 voltas, independentemente da pista e categoria.
- O elenco F2 inclui `Enzo Fittipaldi Jr.`, enquanto a formação oficial de 2026 lista Emerson Fittipaldi.

### P1 — Arquitetura monolítica

- `script.js`: aproximadamente 2.420 linhas.
- `data/game-data.js`: aproximadamente 1.712 linhas.
- `style.css`: aproximadamente 412 linhas.
- Sem módulos, tipagem, lint, bundler, testes unitários, testes E2E ou CI.
- HTML é montado por strings em vários pontos, ampliando risco de regressão e injeção de conteúdo não escapado.

### P1 — Save frágil

- Persistência somente em `localStorage`.
- Sem journal atômico, checksum, backup rotativo, rollback ou validação forte de schema.
- Sem migrações confiáveis entre versões.
- Importação manual pouco estruturada.
- Sem sincronização em nuvem.

### P1 — Internacionalização inexistente

- Textos estão codificados diretamente em português.
- `lang="pt-BR"` fixo.
- Manifesto fixo em português.
- Não há catálogo de chaves, fallback, pluralização, formatação regional ou teste de texto expandido em espanhol/inglês.

### P1 — Assets e manifesto inconsistentes

Faltam cinco retratos referenciados no conjunto principal:

```text
assets/drivers/avatars/f2/nikola_tsolov.png
assets/drivers/avatars/f2/tasanapol_inthraphuvasak.png
assets/drivers/avatars/f2/alex_dunne.png
assets/drivers/avatars/f2/enzo_fittipaldi_jr.png
assets/drivers/avatars/f2/john_bennett.png
```

Ícones PWA ausentes:

```text
assets/icons/app/icon-192.png
assets/icons/app/icon-512.png
```

Também existem caminhos antigos/duplicados em arquivos JSON secundários e um arquivo residual de 1 byte em `assets/drivers/avatars/f2/1`.

### P1 — Simulação ainda arcade

- Classificação baseada em uma única pontuação aleatória; sem Q1/Q2/Q3 realista.
- Sem formato Sprint/Feature Race correto da F2.
- Carros percorrem a mesma linha central; não há linha ideal, disputa lateral, colisão ou decisão espacial de ultrapassagem.
- Pit stop instantâneo, sem pit lane, janela, erro de equipe, unsafe release ou tráfego.
- Clima praticamente estático; sem evolução de pista, aquecimento, crossover ou regra de compostos.
- Combustível, pneus e condição têm efeitos simplificados e não produzem toda a cadeia de falhas/abandono.
- Safety Car/VSC sem agrupamento físico coerente.
- Corrida termina quando o primeiro atinge o total de voltas e classifica os demais pela distância naquele instante.
- Sem bandeiras, penalidades completas, blue flags, red flag, parque fechado, grid penalties, parc fermé, confiabilidade detalhada e investigação pós-corrida.

## 4. Arquitetura-alvo recomendada

Para o objetivo AAA mobile-first, a recomendação é uma **migração progressiva para uma arquitetura de cliente compilado e modular**, preservando dados, regras, telas, artes e identidade do protótipo.

### Caminho recomendado

- Cliente: Unity/C# com pipeline gráfico mobile-first, ou tecnologia equivalente capaz de gerar Android, iOS, Windows e tablet a partir de uma base controlada.
- Simulação: núcleo determinístico independente do renderizador.
- UI: sistema responsivo orientado a safe areas, touch, controle, teclado e mouse.
- Dados: schemas versionados e validados.
- Conteúdo: pacotes separados do código.
- Backend: contas, cloud save, telemetria, eventos e configuração remota.

### Alternativa de menor custo

Manter web e migrar para TypeScript, bundler, módulos, renderizador local e empacotamento nativo via wrapper. Pode atingir excelente qualidade comercial de manager mobile, mas exige mais cuidado para alcançar estabilidade e desempenho comparáveis a um cliente nativo.

A decisão definitiva deve ocorrer após a estabilização, porque portar bugs e dados inconsistentes apenas os transfere para outra tecnologia.

## 5. Roadmap recomendado — 18 etapas obrigatórias

### Macroetapa A — Fundação inviolável

#### Etapa 0 — Congelamento e perícia da baseline

- Registrar SHA-256, inventário, árvore de arquivos e versões.
- Criar tag de baseline imutável.
- Mapear todas as telas, estados, saves e referências de assets.
- Criar matriz de requisitos e riscos.

**Gate:** reprodução documentada do fluxo atual e baseline restaurável byte a byte.

#### Etapa 1 — Hotfix crítico e estabilização

- Corrigir `driverMarketValue`.
- Encerrar corretamente RAF, listeners e recursos 3D.
- Separar atualização da simulação da renderização.
- Corrigir fallback offline.
- Corrigir ícones PWA e referências obrigatórias.
- Corrigir inconsistência inicial F2/agenda.

**Gate:** zero erro não tratado no fluxo principal, zero loop ativo após sair da corrida e partida funcional sem CDN.

#### Etapa 2 — Fonte única de versão, build e diagnóstico

- Um único arquivo/serviço de versão.
- SemVer automático.
- Data/hora BRT e UTC.
- Commit Git, schema de save, versão de dados e manifesto de assets.
- Build visível no lobby, menu de configurações, tela de erro e pacote de diagnóstico.

**Gate:** nenhum arquivo pode exibir versão diferente da build gerada.

### Macroetapa B — Sistema antiquebra

#### Etapa 3 — Modularização e tipagem

- Separar UI, domínio, simulação, persistência, áudio, renderização e dados.
- Introduzir TypeScript ou C# tipado.
- Eliminar globals e funções gigantes.
- Contratos de interface entre subsistemas.

**Gate:** build sem erros de tipo, lint e dependências circulares críticas.

#### Etapa 4 — Registro canônico de assets e ZIP source-only

- Gerar `ASSET_PATHS_REQUIRED.txt` automaticamente.
- Criar `ASSET_MANIFEST.json` com hash, dimensões, licença, fallback e referências.
- Eliminar caminhos duplicados e arquivos residuais.
- Validar case sensitivity para GitHub/Linux/Android.
- Criar modo de pacote completo e modo `source-only` sem binários pesados.

**Gate:** nenhum caminho de asset órfão; pacote source-only abre com placeholders seguros e relatório explícito.

#### Etapa 5 — Save resiliente e migrações

- Schema formal versionado.
- Salvamento atômico com journal.
- Checksum e detecção de corrupção.
- Backups rotativos e restauração.
- Migração automática de saves antigos.
- Export/import por arquivo validado.

**Gate:** testes de queda durante gravação, corrupção deliberada e migração de todas as versões suportadas.

#### Etapa 6 — Testes automatizados, CI e auditoria por fase

- Unitários para regras e economia.
- Integração para carreira/save/dados.
- E2E para fluxo completo.
- Regressão visual.
- Testes mobile, tablet e desktop.
- Performance, memória, bateria e long-run.
- Auditoria de assets, tradução e acessibilidade.

**Gate:** pipeline verde obrigatório; nenhuma fase pode ser empacotada com teste crítico falhando.

### Macroetapa C — Produto internacional mobile-first

#### Etapa 7 — Shell mobile, fullscreen e controles

- Safe areas, notch, barras do sistema e orientação.
- Escalas de UI para telefones pequenos, tablets e desktop.
- Touch targets, gestos, teclado/mouse e controle.
- Fullscreen nativo/standalone quando permitido pela plataforma.
- Modo janela/borderless no PC.
- Acessibilidade, redução de movimento e escalabilidade de texto.

**Gate:** matriz real de aparelhos e zero corte/overflow em resoluções-alvo.

#### Etapa 8 — Internacionalização PT-BR, ES e EN

- Extrair 100% dos textos para catálogos.
- Fallback e chaves estáveis.
- Pluralização, números, moedas, datas e unidades.
- Layout preparado para expansão de texto.
- Legendas e áudio desacoplados.
- Pseudolocalização e auditoria humana.

**Gate:** zero texto fixo detectado no build e cobertura completa dos três idiomas.

#### Etapa 9 — Modelo esportivo autoritativo e licenciamento

- F1 e F2 com calendários, formatos, equipes e regras separados.
- Banco de temporadas versionado.
- Editor de dados/modding controlado.
- Abstrair nomes e imagens licenciadas.
- Inventário de direitos de marcas, logotipos, pistas, pilotos, uniformes e áudio.

**Gate:** consistência referencial total e pacote legal/licenças documentado antes da venda.

### Macroetapa D — Simulador real

#### Etapa 10 — Motor de sessões e regulamento

- Treinos completos.
- Classificação F1 Q1/Q2/Q3.
- Formatos Sprint quando aplicáveis.
- F2 Practice/Qualifying/Sprint/Feature.
- Grid penalties, parque fechado, bandeiras, protestos e classificação oficial.

**Gate:** cenários regulatórios automatizados e resultados reproduzíveis.

#### Etapa 11 — Núcleo determinístico de veículo e corrida

- Pneus: temperatura, pressão, desgaste, graining, blistering e aquecimento.
- Combustível: massa, consumo, lift-and-coast.
- ERS, DRS, motor, câmbio, freios, refrigeração e confiabilidade.
- Aero, setup, tráfego, dirty air, clima e evolução da pista.
- Sementes determinísticas para replay e auditoria.

**Gate:** mesma seed produz o mesmo resultado e telemetria dentro da tolerância definida.

#### Etapa 12 — IA, estratégia e direção de prova

- IA estratégica por equipe/piloto.
- Undercut, overcut, tráfego, janela de pit e risco.
- Ultrapassagem espacial, defesa, erro humano e habilidade.
- Pit lane/crew, falhas, unsafe release e double stacking.
- SC/VSC/red flag, relargadas e investigação de incidentes.

**Gate:** milhares de corridas simuladas sem padrões absurdos, deadlocks ou estratégias dominantes únicas.

#### Etapa 13 — Balanceamento científico

- Monte Carlo para temporadas.
- Distribuições-alvo de ultrapassagem, DNF, pit stops e gaps.
- Dificuldade adaptável sem trapaça invisível.
- Curvas de carreira, economia e progressão.
- Ferramentas internas de tuning.

**Gate:** relatório estatístico por categoria e aprovação dos limites de realismo/diversão.

### Macroetapa E — Apresentação AAA

#### Etapa 14 — Renderização 3D, câmeras e performance

- Pistas com largura, setores, pit lane, elevação, racing lines e zonas de DRS.
- Veículos, animações, LOD, instancing e streaming.
- Câmeras broadcast, onboard, helicóptero, pit wall e replay.
- VFX de chuva, spray, pneus, danos e iluminação.
- Metas de FPS e memória por classe de aparelho.

**Gate:** FPS, frame time, memória, temperatura e bateria dentro dos orçamentos definidos.

#### Etapa 15 — Áudio, UX e identidade visual

- Motor por rotação/carga, rádio, pit, torcida e ambiente.
- Mix dinâmico e opções de acessibilidade.
- Tutorial contextual.
- Design system AAA com botões, fundos, ícones e motion.
- Todos os pedidos de imagem com caminho, dimensões, safe area e variantes definidos antes da geração.

**Gate:** auditoria visual/sonora completa e consistência entre todas as telas.

#### Etapa 16 — Carreira viva, economia e conteúdo

- Staff, departamentos, pesquisa, fabricação, orçamento e patrocinadores.
- Mercado de pilotos, contratos, academia e política interna.
- Objetivos, imprensa, rivalidades e narrativa sistêmica.
- Múltiplas temporadas, mudanças de regulamento e evolução de equipes.
- Conteúdo suficiente para retenção longa sem repetição excessiva.

**Gate:** campanhas longas automatizadas, economia sem inflação/quebra e saves multitemporada íntegros.

### Macroetapa F — Operação comercial

#### Etapa 17 — Backend, segurança, certificação e lançamento

- Conta e cloud save com resolução de conflito.
- Telemetria com consentimento, crash reporting e privacidade.
- Configuração remota e rollback seguro.
- Segurança do cliente/backend e proteção contra adulteração de saves competitivos.
- Alpha fechada, beta, RC e critérios go/no-go.
- Builds Android, iOS, Windows/tablet; lojas, classificação etária, suporte e live ops.

**Gate final:** build candidata assinada, auditoria externa, crash-free target, homologação em dispositivos reais e plano de rollback.

## 6. Protocolo de auditoria obrigatório em cada etapa

Cada etapa deverá produzir:

1. `BUILD_INFO.json` gerado automaticamente.
2. `CHANGELOG.md` da etapa.
3. `AUDIT_REPORT.md` com testes executados e resultados.
4. `TEST_RESULTS/` com relatórios de unitário, integração, E2E e performance aplicáveis.
5. `FILE_MANIFEST.sha256` de todos os arquivos entregues.
6. `ASSET_PATHS_REQUIRED.txt` e `ASSET_MANIFEST.json`.
7. `KNOWN_ISSUES.md` sem ocultar falhas conhecidas.
8. Pacote de rollback ou tag restaurável.
9. ZIP completo de código/configuração/testes/documentos, excluindo apenas binários pesados de assets.

Uma etapa não deve ser marcada como concluída quando houver:

- erro de console não tratado;
- teste crítico falhando;
- save sem migração;
- asset obrigatório sem fallback/registro;
- versão divergente;
- regressão em mobile;
- queda de desempenho acima do limite aceito;
- texto sem tradução nas três línguas.

## 7. Padrão obrigatório de versão visível

Formato recomendado:

```text
v1.4.0-rc.2+20260617.1930.gA1B2C3D
```

Exibir no jogo:

```text
Versão: v1.4.0-rc.2
Build BRT: 17/06/2026 19:30
Build UTC: 17/06/2026 22:30Z
Commit: A1B2C3D
Save schema: 8
Data pack: 2026.06.17
Assets manifest: 12
```

## 8. Política de ZIP sem assets pesados

Estrutura de toda entrega futura:

```text
F1-MANAGER-X.Y.Z/
├── src/
├── data/
├── tests/
├── tools/
├── docs/
├── assets/
│   ├── ASSET_PATHS_REQUIRED.txt
│   ├── ASSET_MANIFEST.json
│   ├── README_ASSETS.txt
│   └── placeholders/               # apenas arquivos mínimos, quando necessário
├── BUILD_INFO.json
├── AUDIT_REPORT.md
├── CHANGELOG.md
├── KNOWN_ISSUES.md
└── FILE_MANIFEST.sha256
```

`ASSET_PATHS_REQUIRED.txt` deve conter um caminho relativo normalizado por linha. `ASSET_MANIFEST.json` deve registrar:

- `id` estável;
- caminho exato e case-sensitive;
- tipo/categoria;
- obrigatório ou opcional;
- largura/altura/formato;
- hash esperado, quando disponível;
- origem/licença;
- telas/código que referenciam o arquivo;
- fallback;
- status: presente, faltante, solicitado ou substituído.

O empacotador deve excluir PNG/JPG/WebP/MP3/WAV/MP4 pesados, mas nunca excluir código, dados, shaders, configurações, testes, migrações ou documentos.

## 9. Regras para imagens geradas no chat

Para cada imagem solicitada, o pedido deverá incluir:

- caminho final exato;
- nome de arquivo;
- dimensões e proporção;
- transparência;
- safe area;
- uso em mobile/tablet/PC;
- variantes de densidade;
- se pode conter texto;
- estado normal/hover/pressed/disabled, quando for botão;
- prompt visual consistente com o design system;
- exigência de licença/originalidade.

Para facilitar os três idiomas, fundos e botões devem ser preferencialmente sem texto incorporado. O texto deve permanecer na interface.

## 10. Critérios objetivos de prontidão comercial

Antes de lançamento, o produto deve atingir pelo menos:

- zero P0/P1 aberto;
- cobertura de testes definida para regras críticas;
- 100% das chaves traduzidas em PT-BR/ES/EN;
- saves recuperáveis e migráveis;
- partidas determinísticas para auditoria;
- ausência de dependência crítica remota sem fallback;
- estabilidade em sessões longas;
- metas de FPS/memória/bateria por aparelho;
- crash-free rate acordado em beta;
- direitos/licenças documentados;
- builds assinadas e rollback testado;
- homologação manual em aparelhos reais.

## 11. Próxima intervenção recomendada

Executar **Etapa 0 + Etapa 1** como uma fase de estabilização inicial, sem adicionar novas telas ou conteúdo. O objetivo é transformar a base atual em uma build confiável, diagnosticável e pronta para modularização, mantendo integralmente o conteúdo existente.
