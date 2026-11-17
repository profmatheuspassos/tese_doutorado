# Fase 4 — plano (capítulos 1 a 5 e "Sobre a tese")

## Contexto

A Fase 3 entregou a home, a 404, o sistema de design e as conferências de build. Os seis textos
da Fase 2 estão aprovados, mas as rotas `/capitulos/...` e `/sobre/` ainda não existem (os links
"Leia o capítulo N" da home dão 404). A Fase 4 publica essas seis páginas, com um interativo
próprio nos capítulos 2 a 5 (o capítulo 1 fica sem, pela D53), sem mudar nenhuma palavra aprovada e
usando só rótulos aprovados.

Base de trabalho: branch `claude/cool-johnson-ervbm3`, já no mesmo commit da `main` (f6f1cf0).
`conteudo/` e `fonte/` não estão no ambiente: todo conteúdo novo de interface sai **só** dos textos
aprovados, do `dados.json`, do plano (seção 4) e das decisões. Nada vem de releitura da tese.

## 0. Decisões aprovadas com este plano (17/11/2026, D52 a D58)

A registrar em `docs/DECISOES.md` no início da Etapa 1:

- **D52 — Textos de interface da Fase 4.** Aprovados T13 a T48, exceto T19 e T20 (retirados) e com
  T40 ajustado no cartão do referendo, Portugal ("a Assembleia, o Tribunal Constitucional e o
  Presidente podem barrar", as três travas do texto).
- **D53 — Interativo só quando revela algo.** A exigência de um interativo próprio por capítulo
  não vale quando ele não revelaria nada além do texto. O capítulo 1 fica sem interativo: o
  checklist das nove regras é estático, com as marcas se desenhando como na home.
- **D54 — Capítulo 2 como modelo** da Fase 4 (dados do explorador, interação sem JS, reuso do
  círculo).
- **D55 — Legenda do estádio (T33)** aprovada; a imagem entra no B2 do capítulo 3 (D24).
- **D56 — Capturas da Fase 4** (ajusta a D49 para os capítulos): em 375 e 1440 px, só abertura,
  blocos com visual ou interativo e navegação final (cerca de 50 imagens). Blocos só de texto
  continuam testados, sem captura salva.
- **D57 — Texto corrido sem animação de entrada nos capítulos e em "Sobre".** Animação só nos
  visuais e interativos.
- **D58 — Visuais do plano que ficam de fora** (lista no fim da seção 2). Critério: só entra dado
  que está no texto aprovado ou que uma decisão já liberou (D44, no explorador).
- Checklist do capítulo 1 sem explicação por regra: o texto aprovado não traz isso regra a regra.

---

## 1. Modelo de página de capítulo

Ordem na página, de cima para baixo:

1. **Abertura (B0).** Imagem `capN-abertura.webp` no topo, largura total, `alt=""` (D47). 21:9 no
   desktop; recorte 4:3 centralizado no celular (o assunto fica no terço central, pelo guia de
   imagens). Fundo da seção segue o da imagem: névoa nos caps. 1, 4 e 5; grafite nos caps. 2 e 3.
   Abaixo: "Capítulo N" (T4, já aprovado), o `h1` do B0, o título original (T13 + `titulo_original`
   do `.md`, em tamanho menor) e os parágrafos do B0 em corpo de destaque.
2. **Barra de progresso.** Linha de 2 px presa à base do cabeçalho fixo, cor tinta. CSS puro com
   `animation-timeline: scroll()`; onde o navegador não suporta, um script de poucas linhas faz o
   mesmo. Sem JS e sem suporte: some. `aria-hidden` (não é informação, só orientação). Com movimento
   reduzido continua, porque acompanha a rolagem do próprio leitor e não se move sozinha.
3. **Texto (B1 em diante).** Coluna de leitura (`--container-texto`), seção clara. Cada bloco é a
   fatia exata do `.md` (via `dividirBlocos`); componentes só acrescentam atributos e envoltórios.
   Blocos com visual ganham faixa névoa e largura de figura.
4. **Navegação final.** Duas setas no estilo `link-capitulo`: "Anterior" (T14) e "A seguir" (T15),
   cada uma com o título da página. Cap. 1 volta para "Início" (T3); cap. 5 segue para "Sobre a
   tese". `<nav aria-label>` = T16.
5. **Rodapé** atual, com o slot vazio (o componente passa a recolher a coluna quando o slot não vem).

`<title>` = T11 já aprovado. `meta description` = primeiro parágrafo do B0 (T17: regra, sem texto
novo). Imagens com `srcset` em 840, 1680 e 2520 px, geradas no fim do build com `sharp` em `dist/`,
sem tocar em `public/img/` (as finais do autor continuam só substituindo o arquivo).

Estrutura de código:
- `src/pages/capitulos/[slug].astro`: `getStaticPaths` a partir das rotas dos `.md`.
- `src/layouts/Capitulo.astro`: abertura, progresso, artigo, navegação.
- `src/components/capitulos/Capitulo{1..5}.astro`: cada um distribui seus blocos entre
  `BlocoTexto.astro` (genérico) e os componentes de visual, e falha no build se sobrar ou faltar bloco
  (mesmo padrão de `src/pages/index.astro`).
- `src/pages/sobre.astro`, com o mesmo layout sem imagem.

---

## 2. Interativo e visuais de cada capítulo

Regra comum: interativo sem JS funciona ou mostra o estado final; com movimento reduzido, mesmo
resultado sem transição. Seletores e alternadores são `<input type="radio">` com CSS `:has()`:
funcionam sem JavaScript, por teclado (setas) e no leitor de tela. Sem suporte a `:has()`, todas as
opções aparecem empilhadas. Todo número vem do `dados.json`, conferido contra o texto aprovado.

### Capítulo 1 — No papel, está tudo certo
- **Sem interativo próprio (D53).** O resultado da conferência é fixo; tocar para conferir não
  revelaria nada.
- Visual: **checklist estático das nove regras (B4).** Cada regra da lista do texto recebe as duas
  marcas de "cumpre" (Portugal e Brasil), `aria-hidden`, com a legenda T7, como no B2 da home. As
  marcas se desenham regra a regra quando a lista entra na tela (mesmo código da home, extraído para
  módulo comum). Sem JS ou com movimento reduzido: marcas já desenhadas. Dados: nenhum número.
- Visual: **linha do tempo** súdito → governo representativo → democracia representativa (B1), T18,
  `aria-hidden` (o texto diz o mesmo).
- Visual: **tabela "Lado a lado" (B8)** com colunas Portugal (ramo) e Brasil (semente); no celular
  cada linha vira cartão, como a tabela dos sete problemas da home.

### Capítulo 2 — O que não está funcionando (modelo)
- **Interativo: explorador da confiança, Quadros 1 a 5 (B4, depois da tabela do texto).**
  Seletor das cinco instituições (T21, T22); três barras empilhadas horizontais (2006, 2010, 2017)
  com as seis respostas: as três de confiança em cinzas ordenados, "nenhuma confiança" em semente
  (destaque), as duas não respostas em cinza claro listrado. Valor escrito dentro do segmento
  quando cabe. Larguras como variáveis CSS geradas no build a partir do `dados.json`: trocar de
  instituição anima as barras por transição CSS, **sem JavaScript**. Começa em Congresso Nacional
  (primeira linha da tabela do texto). Fonte e entrevistas na legenda (T24). Barras `aria-hidden`;
  a tabela equivalente fica num `<details>` "Ver os números em tabela" (T25, T26), nativo, sem JS.
  Dados: `confianca_instituicoes_br` (90 células, já conferidas contra o plano 4.1 e as somas; a
  linha "nenhuma" já é conferida contra o texto do B4). Os outros cinco níveis não estão no texto;
  entram por força da D44.
- Visual: **círculo vicioso** (componente `Circulo` da home, estado vicioso, tema claro) ao fim do
  B0, onde o texto diz "num círculo vicioso". Rótulos T8 já aprovados.
- Visual: **escada dos três degraus (B2).** Os três parágrafos do próprio texto viram os degraus
  (só layout); o primeiro, onde a maioria fica, é marcado. Sem rótulo novo.
- Visual: **92,9%** em destaque no B4 (`NumeroGrande`, já existe).

### Capítulo 3 — O atalho que não resolve
- **Interativo: a bolha (fim do B6).** Grade de 12 cartões neutros com quatro formas (círculo,
  quadrado, triângulo, losango; forma e tom diferentes, não só cor). Formas abstratas, e não receitas
  ou notícias, para não criar exemplo novo nem tocar em política; o exemplo vegetariano fica no texto
  ao lado. Cada cartão é um botão "Curtir: {forma}" (T29). A cada curtida a grade se refaz com mais
  da forma escolhida (6, 9, 11, 12 de 12); o contador (T30) desce de 4 para 1 tipo. "Mostrar o que
  deixou de aparecer" (T31) traz de volta, apagadas, as formas sumidas; "Recomeçar" (T32). Dica (T28).
  Sem JS: uma tira estática com três grades (variada → quase uniforme → uniforme), `aria-hidden`.
  Movimento reduzido: troca instantânea. Dados: nenhum.
- Visual: **estádio (D24)** — `cap3-estadio.webp` (já reservado, 2400×1350) no B2, depois do
  primeiro parágrafo ("Reunir todos, sempre, ... é impossível"), com a legenda T33 se aprovada.
- Visual: **tabela dos sete problemas (B8)** no estilo da home (cartões no celular), sem revelação
  por etapas.

### Capítulo 4 — O cidadão no centro
- **Interativo: quem decide o quê (B3).** A lista das cinco etapas do texto ganha duas faixas de
  marcas `aria-hidden`: "Governo" (T6) e "Cidadãos" (T35). Alternador (T34) entre "Centrada no
  governo" (começa aqui: só a faixa do governo acesa) e "Centrada nos cidadãos" (as marcas dos
  cidadãos acendem etapa a etapa). Uma linha de estado (T36, `aria-live`) diz o que mudou, quase com
  as palavras do texto. Sem JS: funciona por `:has()`. Dados: nenhum.
- Visual: **0,22%** em destaque no B7 (`NumeroGrande` com duas casas).
- Visual: **ramo que engrossa e semente que brota** no B9 ("A tese propõe três mudanças"), reuso do
  motivo da home (D1), legendas T7.
- Visual: **círculo virtuoso** no B11, com a transição do vicioso já usada na home (D50).

### Capítulo 5 — As ferramentas que já existem (e uma que falta)
- **Interativo: cartões das ferramentas (entre B9 e B10, onde o texto diz "Nenhuma dessas
  ferramentas").** Cinco cartões (T38) com duas linhas, "Como funciona" e "Quanto foi usado" (T39),
  e duas colunas, Portugal e Brasil. A partir de 768 px, as duas colunas lado a lado; abaixo disso,
  alternador Portugal/Brasil (T7) por cartão. Ação popular sem a linha "Quanto foi usado" (o texto
  não traz uso). Recall com contorno tracejado (como na home), "Não existe" nos dois (T41) e um
  `<details>` "Ver o exemplo da Califórnia" (T42) com o funil 172 → 9 → 6. Conteúdo das células em
  T40, todo tirado do texto aprovado.
  Dados: referendos, consultas, assinaturas, iniciativas, petições (%), recall — novas séries no
  `dados.json`, cada uma com a frase do `.md` que a confirma.
- Visual: **caminho do referendo (B1)**: Portugal em cinco passos, Brasil em um (T37),
  `aria-hidden`.
- Visual: **barras na tabela das petições (B5)**: barra proporcional ao lado de cada número da
  própria tabela (113 a 632), sem rótulo novo.

### O que fica de fora dos "outros visuais" do plano
Gráfico de abstenção e simulação dos três eleitores (cap. 2: a série completa não está no texto e
a simulação criaria conteúdo); Atenas em números, pares promessa/problema, anatomia do populismo,
adversário x inimigo, dados de acesso (cap. 3); linha do tempo presença x decisão, "30 formas" e
"26 de 35" em destaque (cap. 4); funil do recall separado (está no cartão), pedidos de informação
por ano, escala 92x (cap. 5).

---

## 3. "Sobre a tese"

- **Abertura:** sem imagem (não há uma reservada); `h1` e parágrafo do B0, motivo das sementes.
- **Ficha (B2):** a tabela do texto vira um cartão de duas colunas, chave em cinza. A linha de
  cabeçalho vazia do `.md` recebe `aria-hidden` e some da tela. Link do depósito (D36, D38).
- **Como citar (B6):** os três blocos do texto, com quebra de linha no celular (sem rolagem
  lateral). Na tela, título em negrito no ABNT e em itálico no APA (envoltório, sem trocar palavra,
  como previa a rastreabilidade). Um botão "Copiar" (T43, nome acessível T44) por formato. Ao
  copiar: texto simples; no ABNT, "[data de acesso]" vira a data do dia no padrão ABNT ("17 nov.
  2026", meses em T48). O botão mostra "Copiado" (T45) por 2 s e uma região `aria-live` anuncia
  T46. Se a área de transferência falhar, o texto fica selecionado e aparece T47.
  **Sem JavaScript:** os botões não aparecem; as referências ficam visíveis e selecionáveis, com
  "[data de acesso]" como está no texto aprovado.
- **Contato (B7):** cartão com o link `mailto:` do próprio texto. Nada novo.
- **Navegação final:** "Anterior" (Capítulo 5) e "Voltar ao início" (T10, já aprovado).

---

## 4. Textos novos de interface (aprovados, D52)

Placeholders: `{n}`, `{forma}`, `{formato}`, `{instituicao}` vêm da própria interface; números entre
chaves vêm do `dados.json` e são conferidos no build.

**Modelo de página**
| # | Onde | Texto |
|---|---|---|
| T13 | Acima do título original | Título na tese |
| T14 | Navegação final | Anterior |
| T15 | Navegação final | A seguir |
| T16 | `aria-label` da navegação final | Continue a leitura |
| T17 | `meta description` | Regra: primeiro parágrafo do B0 de cada página (texto aprovado) |

**Capítulo 1**
| # | Onde | Texto |
|---|---|---|
| T18 | Linha do tempo | Súdito · Governo representativo · Democracia representativa |
| T19, T20 | — | Retirados (D53). A numeração não é reaproveitada. |

**Capítulo 2**
| # | Onde | Texto |
|---|---|---|
| T21 | Legenda do seletor | Escolha a instituição |
| T22 | Instituições (novas; "Congresso Nacional" e "Governo" já são T6) | Poder Judiciário · Tribunal Superior Eleitoral · Partidos políticos |
| T23 | Respostas | Muita confiança · Um pouco de confiança · Pouca confiança · Nenhuma confiança · Não sei responder · Não quero responder |
| T24 | Legenda do gráfico | Fonte: Latinobarómetro. Pergunta: "Quanta confiança você tem nesta instituição?" Entrevistas: 1.204 (2006), 1.204 (2010) e 1.200 (2017). |
| T25 | Botão da tabela | Ver os números em tabela |
| T26 | Tabela | Cabeçalho "Resposta"; legenda "{instituicao}, em %" |

**Capítulo 3**
| # | Onde | Texto |
|---|---|---|
| T27 | Formas | círculo · quadrado · triângulo · losango |
| T28 | Dica | Toque no que você curtiria e veja o que a tela passa a mostrar. |
| T29 | Nome de cada cartão | Curtir: {forma} |
| T30 | Contador | Tipos de cartão na tela: {n} de 4 |
| T31 | Botão | Mostrar o que deixou de aparecer |
| T32 | Botão | Recomeçar |
| T33 | Legenda do estádio | Imagine 30 mil pessoas num estádio, sem microfone, todas com direito de propor leis e opinar. Discutir uma única proposta já seria difícil. |

**Capítulo 4**
| # | Onde | Texto |
|---|---|---|
| T34 | Alternador | Legenda "Modelo de governança"; opções "Centrada no governo" · "Centrada nos cidadãos" |
| T35 | Faixa | Cidadãos (a outra é "Governo", T6) |
| T36 | Estado (`aria-live`) | O cidadão fica de fora das cinco etapas. · O cidadão pode entrar em qualquer uma das cinco etapas. |

**Capítulo 5**
| # | Onde | Texto |
|---|---|---|
| T37 | Caminho do referendo | Portugal: Cidadãos reúnem 60 mil assinaturas · A Assembleia da República aprova · O Tribunal Constitucional confere · O Presidente da República convoca ou recusa · Votação: só obriga se votar mais da metade dos inscritos. Brasil: Só o Congresso Nacional convoca |
| T38 | Nomes dos cartões | Referendo · Iniciativa popular · Petição · Ação popular · Recall |
| T39 | Linhas dos cartões | Como funciona · Quanto foi usado |
| T41 | Recall, nos dois países | Não existe. |
| T42 | Exemplo do recall | Botão "Ver o exemplo da Califórnia"; funil "tentativas" · "chegaram às urnas" · "tiraram o eleito do cargo"; legenda "Califórnia, cargos estaduais, de 1913 a 2019" |

**T40 — conteúdo das células dos cartões** (origem entre parênteses)
| Cartão | Portugal · Como funciona | Portugal · Quanto foi usado | Brasil · Como funciona | Brasil · Quanto foi usado |
|---|---|---|---|---|
| Referendo | Cidadãos podem propor, com 60 mil assinaturas, mas a Assembleia, o Tribunal Constitucional e o Presidente podem barrar. (B1) | 8 referendos de 1975 a 2019: 3 nacionais e 5 locais. (B2) | Só o Congresso Nacional convoca. O cidadão não pode propor. (B1) | 5 consultas de 1988 a 2019: 2 nacionais e 3 locais. (B2) |
| Iniciativa popular | 20 mil assinaturas, que podem ser enviadas pela internet. (B3) | 9 iniciativas de 2003 a 2019; 4 viraram lei. (B3) | 1% do eleitorado em pelo menos 5 estados: 1.473.063 assinaturas, com base no eleitorado de 2018, todas em papel. (B3, D32) | 4 leis federais de 1988 a 2019; formalmente, nenhuma como iniciativa popular. (B3) |
| Petição | Direito de participação política, com lei própria. Dá direito a uma resposta. (B4) | Já assinaram: 5,4% (2003 a 2011) e 21% (2016). (B5) | Direito individual, sem lei própria. Dá direito a uma resposta. (B4) | Dizem ter assinado: 25,4% (2015). (B6) |
| Ação popular | Direito de participação política. (B4) | — (linha omitida) | Direito individual; segue uma lei de 1965. (B4) | — (linha omitida) |
| Recall | Não existe. (B7) | — | Não existe. (B7) | — |

**Sobre a tese**
| # | Onde | Texto |
|---|---|---|
| T43 | Botão | Copiar |
| T44 | Nome acessível do botão | Copiar a referência {formato} |
| T45 | Botão, depois de copiar | Copiado |
| T46 | Aviso (`aria-live`) | Referência {formato} copiada. |
| T47 | Falha ao copiar | Não deu para copiar. O texto ficou selecionado: use Ctrl+C (ou Cmd+C no Mac). |
| T48 | Meses no "Acesso em" (só no texto copiado) | jan. · fev. · mar. · abr. · maio · jun. · jul. · ago. · set. · out. · nov. · dez. |

Reusados, já aprovados: T3 "Início", T4 "Capítulo N", T6, T7 "Portugal"/"Brasil", T8/T9 (círculos),
T10 "Voltar ao início", T11 (`<title>`).

---

## 5. Como os testes passam a cobrir as seis páginas

- **Texto (`conferir-texto.mjs`).** Já percorre todo `.md` que tem página no `dist/`, então as seis
  entram sozinhas na comparação palavra a palavra e na contagem de aspas. Mudanças: aceita
  `titulo_original` do `.md`; troca a regex genérica de números por "número formatado que existe no
  `dados.json`" (cobre "1.473.063", "0,22%", anos); expande rótulos com marcadores do `dados.json`;
  passa a conferir também `aria-label`, `alt` e `title` contra os rótulos aprovados.
- **Dados (`conferir-dados.mjs`).** Novas séries (plenário de freguesias, referendos, consultas,
  iniciativas, petições por legislatura, petições em %, recall) com `usos` e frases conferidas
  contra o `.md` de cada capítulo. Continua a regra de nenhum número decimal escrito à mão no código.
  O explorador declara um `uso` próprio para os Quadros 1 a 5 inteiros.
- **Contraste (`conferir-contraste.mjs`).** Novos pares: rótulos sobre os segmentos do explorador,
  formas da bolha e controles (3:1 para componentes de interface).
- **Terceiros (`conferir-terceiros.mjs`).** Sem mudança: já varre todo o `dist/`.
- **Links internos (novo, `conferir-links.mjs`).** Todo `href` interno aponta para um arquivo do
  build. Aviso nas etapas 1 a 3 (capítulos ainda não feitos), erro a partir da etapa 4.
- **Navegador (`capturas.mjs`).** Passa a rodar sobre a lista de páginas lida dos `.md` (home, cinco
  capítulos, "Sobre", 404): 3 larguras x 3 cenários, sem rolagem horizontal, todo texto visível,
  salto para cada bloco, axe (WCAG 2.2 AA), primeiro Tab no link de pular, nenhum erro de console,
  nenhuma requisição para fora. Testes de interação por página, com e sem JS: checklist do cap. 1
  (marcas visíveis no fim, nos três cenários), explorador (escolher "Partidos políticos" e conferir a largura de "nenhuma" em 2017 =
  valor do JSON, inclusive sem JS), bolha (quatro curtidas → 1 de 4), alternador do cap. 4, cartões
  em 375 px, botão copiar (área de transferência com a data do dia; sem JS, botões ausentes), barra
  de progresso (avança com a rolagem). Capturas versionadas em `docs/capturas/fase-4/` conforme o
  D56.
- **Lighthouse (`lighthouse.mjs`).** As sete páginas, celular e desktop, todas as categorias ≥ 90;
  JSON em `docs/capturas/fase-4/lighthouse/`.
- **Regressão.** A home precisa sair igual: mesmos números nas conferências e capturas de B0 a B8
  sem diferença visível. O que for extraído de `src/scripts/home.ts` para módulos comuns (círculo,
  motivo, checklist) não muda comportamento.

---

## 6. Ordem de entrega

Cada etapa termina com `npm run build`, `npm run capturas`, `npm run lighthouse`, registro em
`docs/RASTREABILIDADE.md` (escolhas de apresentação da Fase 4), `docs/DECISOES.md` e `CLAUDE.md`,
commits pequenos e push na branch da sessão. Paro e espero sua aprovação. Pull request para a
`main` só depois dela.

1. **Etapa 1 — modelo:** base comum (layout, rota, abertura, progresso, navegação, `srcset`,
   extensões das conferências e dos testes) + **capítulo 2 completo**. Parada.
2. **Etapa 2:** capítulos 1 e 3. Parada.
3. **Etapa 3:** capítulos 4 e 5. Parada.
4. **Etapa 4:** "Sobre a tese", links internos como erro, Lighthouse e capturas das sete páginas.
   Parada; com a aprovação, Fase 4 concluída.

## Arquivos principais

Novos: `src/pages/capitulos/[slug].astro`, `src/pages/sobre.astro`, `src/layouts/Capitulo.astro`,
`src/components/capitulo/*` (Abertura, BlocoTexto, Progresso, Navegacao), `src/components/capitulos/Capitulo{1..5}.astro`,
`src/components/interativos/*` (Explorador, Bolha, QuemDecide, Cartoes, Copiar),
`src/components/graficos/*` (LinhaDoTempo, Escada, CaminhoReferendo, BarrasTabela, Checklist
estático extraído do B2 da home),
`src/scripts/capitulo.ts`, `src/scripts/sobre.ts`, `scripts/conferir-links.mjs`.

Alterados: `src/lib/blocos.ts` (helpers que só acrescentam atributos por item, célula ou tag
interna, com a mesma trava de "sem texto"), `src/lib/numeros.ts` (inteiros e duas casas),
`src/i18n/pt-br.json` (T13 a T48, sem T19 e T20), `docs/DECISOES.md` (D52 a D58), `src/data/dados.json`, `src/components/site/Rodape.astro`
(slot opcional), `src/scripts/home.ts` (só extração), `scripts/conferir-*.mjs`,
`scripts/capturas.mjs`, `scripts/lighthouse.mjs`, `package.json`, `astro.config.mjs` (geração do
`srcset`).

Reusados como estão: `dividirBlocos`, `comAtributos`, `envolverTrecho`, `anexarEmCadaItem`,
`Circulo`, `NumeroGrande`, `Ramo`, `Sementes`, `Solo`, `Broto`, `LinkCapitulo`, tokens de
`global.css`, `Base.astro`, `Cabecalho.astro`.
