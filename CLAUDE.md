# CLAUDE.md

## Objetivo do projeto

Site estático, público e interativo que apresenta ao público geral a tese de doutorado
**"Cidadania Ativa e Governança sob a perspectiva do Direito Eleitoral comparado"**, de
Matheus Passos Silva (Faculdade de Direito da Universidade de Lisboa, 2022; orientador:
Prof. Doutor Jorge Miranda). A tese compara Portugal e Brasil.

**Não é a publicação da tese.** É uma versão de divulgação, reescrita em linguagem simples e
fiel ao argumento original. Idioma: português do Brasil. Uma versão em inglês americano está em
preparação (D85 a D104; plano em `docs/PLANO-INGLES.md`): tradução do texto aprovado em
português, em `/en/`, desligada no build de produção até o lançamento (D92).

Repositório: https://github.com/profmatheuspassos/tese_doutorado — branch principal `main`.

## Regras permanentes

### Processo
- **Trabalhar em fases.** Ao fim de cada fase: parar, mostrar o resultado e esperar a
  aprovação do autor. Não começar a fase seguinte sem aprovação.
- **Parar ao encontrar erro.** Diante de qualquer problema no material (conversão com erro,
  trecho ilegível, dado inconsistente, dúvida sobre o sentido de um argumento), parar no
  ponto, dizer o que já foi feito, qual é o problema e a solução sugerida.
- Decisões do autor ficam em `docs/DECISOES.md` e valem para todo o site. Consultar antes de
  escrever.

### Protocolo de leitura de cada sessão
- Ler só `CLAUDE.md`, `docs/DECISOES.md`, a seção da página em questão em
  `docs/PLANO-CONTEUDO.md` e as notas de leitura do capítulo em questão em
  `docs/notas-leitura/`. O resto de `docs/` só quando for preciso algo específico.
- Ler por inteiro o corpo do capítulo original em `conteudo/`.
- Abrir as notas de rodapé só quando trouxerem dado ou argumento; nunca as que são apenas
  referência bibliográfica.

### Git
- `fonte/` (o .docx original) e `conteudo/` (a conversão integral) **nunca** vão para o
  repositório. Estão no `.gitignore`. Também ficam de fora `node_modules/`, a pasta de build
  e arquivos de ambiente.
- Commits pequenos e descritivos ao longo do trabalho.
- **Push para a branch da sessão** (a branch de trabalho indicada pelo ambiente) a qualquer
  momento e, no mínimo, ao fim de cada página, para não perder trabalho.
- **Nada vai direto para a `main`.** Cada página aprovada segue para a `main` por pull request
  logo após a aprovação, sem esperar o fim da fase. O autor faz o merge no GitHub.
- **Toda sessão nova parte da `main` atualizada**: a branch de trabalho da sessão é criada a
  partir dela.
- **Nunca usar force push.**
- Arquivos de trabalho versionados em `docs/`.

### Fidelidade à tese
- Nenhuma afirmação, dado ou conclusão que não esteja na tese. Simplificar é permitido;
  mudar o sentido não.
- Não atualizar dados nem acrescentar fatos posteriores à tese. Todo dado aparece com o ano
  a que se refere.
- Não copiar parágrafos da tese: reescrever.
- Tom explicativo e neutro. O tema é político: **nenhum nome de governante, partido ou caso
  concreto**, e nenhuma posição além da que a tese defende.
- A proposta da tese é **revigorar, não substituir** a democracia representativa. Não
  apresentá-la como democracia direta, nem como dependente de altruísmo.
- **A reescrita de cada página parte da releitura do capítulo original correspondente em
  `conteudo/`**, não do plano nem das notas de leitura. Uma página por vez.
- Cada bloco de texto do site é ligado à seção de origem em `docs/RASTREABILIDADE.md`, com
  lista à parte das escolhas de interpretação.

### Linguagem simples
- Leitor-alvo: adulto curioso, sem formação em Direito, leitura de 8º ou 9º ano.
- Frases com média de até 20 palavras; voz ativa; um assunto por parágrafo.
- Todo termo técnico explicado na primeira vez que aparece; exemplos concretos.
- Sem latim, sem juridiquês, sem notas de rodapé.
- Tamanho: cada página de capítulo entre 1.200 e 1.800 palavras. Não há teto para o site
  inteiro (D16).
- Legibilidade medida pelo Flesch adaptado ao português (Martins et al., 1996), com
  `scripts/legibilidade.py`; método em `docs/LEGIBILIDADE.md`. Referência de conferência:
  **índice de 50 ou mais** (faixa "fácil"). O índice é conferência, não meta: não piorar o
  texto para melhorar o número.

### Versão em inglês (D85 a D104)
- A fonte da tradução é o **texto aprovado em português** (`src/content/pt-br/` e
  `src/i18n/pt-br.json`), não a tese. Nenhuma ideia, dado ou nuance acrescentada ou retirada;
  explicação para o leitor estrangeiro só curta, só definição, aprovada como decisão (D85).
- Antes de traduzir, ler `docs/GLOSSARIO-EN.md`: termo aprovado é usado sempre igual (D86). As
  decisões D1 a D84 valem também para o inglês.
- O português não muda; a única adição às páginas em português é o seletor de idioma (D93). Toda
  frase em inglês que não seja tradução só entra com texto aprovado pelo autor.
- Inglês fica desligado na produção pela chave `INGLES_PUBLICADO` até a Etapa 4 (D92).
- Legibilidade em inglês: Flesch-Kincaid Grade Level 8 ou menos como conferência, com o Flesch
  Reading Ease ao lado (D89). A D16 (tamanho) não vale para o inglês.

### Site (Fases 3 a 5)
- Astro + Tailwind + GSAP (ScrollTrigger); saída 100% estática; fonte Inter hospedada
  localmente.
- Nenhum recurso de terceiros, nenhum analytics, nenhum cookie.
- Imagens ilustrativas não são geradas aqui: prompts em `docs/PROMPTS-IMAGENS.md` e espaços
  reservados com nome e tamanho exatos em `public/img`. Sem texto na imagem, sem pessoa
  real, sem rosto identificável, sem símbolo de partido.
- Acessibilidade AA, `prefers-reduced-motion` respeitado, Lighthouse acima de 90, testes em
  375, 768 e 1440 px.

## Como recriar `conteudo/`

Coloque o .docx da tese em `fonte/` (um único arquivo .docx) e rode:

```bash
bash scripts/converter.sh
```

O script usa pandoc e python3, gera um arquivo Markdown por parte em `conteudo/` e confere
se as 880 notas de rodapé foram distribuídas.

## Mapa do repositório

| Caminho | Conteúdo |
|---|---|
| `docs/PLANO-CONTEUDO.md` | Argumento em 10 linhas, estrutura do site, o que entra em cada página, dados e diagramas |
| `docs/DECISOES.md` | Decisões do autor e pontos em aberto |
| `docs/PLANO-INGLES.md` | Plano aprovado da versão em inglês (D94): inventário, arquitetura, conferências, rastreabilidade, etapas 1, 2a, 2b, 3 e 4 |
| `docs/GLOSSARIO-EN.md` | Glossário aprovado da versão em inglês: estilo, termos, títulos, referências e rótulos T1 a T52 (D86, D95 a D104) |
| `docs/notas-leitura/` | Notas detalhadas por capítulo (argumento, conceitos, dados com ano e fonte, trechos de destaque, seção de origem) |
| `docs/RASTREABILIDADE.md` | Cada bloco do site ligado à seção de origem; dados usados; escolhas de interpretação |
| `docs/LEGIBILIDADE.md` | Método do índice e resultados por página |
| `src/content/pt-br/` | Texto reescrito das páginas (Markdown; blocos marcados com `<!-- Bn \| ... -->`) |
| `src/content/en/` | Tradução aprovada das páginas em inglês, com os mesmos blocos `Bn` (D85; por enquanto, a home e os capítulos 1 a 4, D110, D112, D114, D117 e D119) |
| `docs/PROMPTS-IMAGENS.md` | Guia de estilo e prompts das imagens ilustrativas (D47) |
| `docs/PLANO-FASE-4.md` | Plano aprovado da Fase 4: modelo de página, interativos, rótulos T13 a T48, testes, etapas |
| `docs/PLANO-FASE-5.md` | Plano aprovado da Fase 5 (publicação), com os ajustes da D78 e D79 |
| `docs/capturas/fase-3/` | Capturas versionadas (cenário normal, 375 e 1440 px, por bloco) e resumo do Lighthouse |
| `docs/capturas/fase-4/` | Capturas das páginas novas (D56) e `lighthouse/resumo.md` de todas as páginas (só o resumo é versionado, D59) |
| `docs/capturas/fase-5/` | `lighthouse/resumo.md` medido no endereço publicado |
| `docs/capturas/ingles/` | Capturas versionadas das páginas em inglês (D102) e `lighthouse/resumo.md` delas, do build com `INGLES=1` |
| `src/pages/`, `src/layouts/`, `src/components/` | Site Astro: rotas da home (`index.astro`), "Sobre a tese" (`sobre.astro`) e 404, layout base (`lang`, `og:locale`, `hreflang` e seletor pelo idioma), componentes por bloco, motivo ramo/semente, gráficos e diagramas |
| `src/pages/en/[...caminho].astro`, `src/pages/en/[erro].astro` | Rotas da versão em inglês e 404 em inglês (`/en/404/`); `getStaticPaths` vazio com a chave desligada (D92) |
| `src/components/site/SeletorIdioma.astro` | Seletor "Português · English" (D91, D101, D108): só com o inglês ativo e com destino (par ou, na 404, o início do outro idioma) |
| `src/components/paginas/` | Corpo da home (`Home.astro`), de "Sobre a tese" (`Sobre.astro`) e da 404 (`Pagina404.astro`), com a prop `idioma`; as rotas só escolhem o idioma. Os demais componentes acham o idioma pela rota (`rotulosDe(Astro.url)` em `src/i18n/index.ts`) |
| `src/lib/idiomas.mjs` | Tabela única dos idiomas, português e inglês (pasta, coleção, prefixo de rota, `lang`, `og:locale`, `hreflang`, locale dos números, rótulos, link da licença) e `idiomaDaRota()` |
| `src/lib/ancoras.ts` | Trechos do texto aprovado que os componentes procuram, por idioma e por página; o inglês entra com cada página traduzida (Etapa 3) |
| `src/lib/paginas.ts` | Páginas por idioma, `parDe` (página equivalente no outro idioma), `inicioDe` e `navegacao` (em pré-visualização, página sem tradução vem em português, com `lang="pt-BR"`) |
| `src/pages/capitulos/[slug].astro`, `src/layouts/Capitulo.astro` | Rotas dos capítulos (lidas dos `.md`) e modelo das páginas internas |
| `src/components/capitulo/`, `src/components/capitulos/`, `src/components/interativos/` | Abertura, bloco de texto, progresso e navegação; composição de cada capítulo; interativos (explorador etc.) |
| `src/lib/blocos.ts` | Divide o HTML de cada `.md` nos blocos `Bn`; só acrescenta atributos, envoltórios e desenhos sem texto, nunca texto (inclui `rotularCelulas`, tabela em cartões no celular, e `anexarEmCelulas`, barras ao lado dos números de uma tabela) |
| `src/lib/checklist.ts`, `src/lib/quemDecide.ts`, `src/styles/checklist.css`, `src/scripts/comum/` | Peças comuns à home e aos capítulos: marcas do checklist e do "quem decide", observadores de entrada na tela, animação do checklist, revelação dos visuais, troca de rótulos do círculo virtuoso (`circulo.ts`), ramo que engrossa e semente que brota (`crescer.ts`); alternador em pílulas no `global.css` |
| `src/lib/rotulos.mjs` | Marcadores `{d:caminho}` nos rótulos, trocados pelos valores do `dados.json` (usado pelo site e pelas conferências); `{d:caminho\|mil}` escreve o valor vezes mil ("60,000") |
| `src/lib/plugin-sem-quebra.mjs` | Impede quebra de linha em palavras com hífen, sem trocar caractere |
| `src/data/dados.json` | Único arquivo de números do site (Quadros 1 a 5 e outros), com os usos por página |
| `src/i18n/pt-br.json`, `src/i18n/en.json` | Rótulos de interface aprovados (D43, D52, D100, D107); nenhum outro texto de interface. T50 e T51 (seletor) nos dois; T52 só no inglês; T48 só no português |
| `src/styles/global.css` | Tokens de design (D45); o Tailwind só procura classes em `src/` (`source("..")` no `@import`, D115), com `src/content/en/` fora (`@source not`, D114) |
| `src/scripts/home.ts`, `src/scripts/home-resto.ts` | Animações GSAP da home (só com `prefers-reduced-motion: no-preference`): a abertura na carga; o resto (ScrollTrigger e blocos B1 a B8) quando o navegador fica ocioso, um bloco por tarefa (D67) |
| `scripts/conferir-*.mjs` | Conferências que rodam em todo build: dados, paridade português/inglês (rótulos e pares de páginas), contraste, imagens (nome, tamanho, peso), texto por idioma (palavras, aspas, rótulos, atributos, pelo `lang` mais próximo), recursos de terceiros, links internos (link quebrado faz o build falhar) e publicação (canonical, Open Graph, `lang`, `hreflang`, seletor, sitemap, robots, CSP, `.htaccess` da pasta principal e da `en/`, trava da chave no Actions) |
| `scripts/gerar-htaccess.mjs` | Gera `dist/.htaccess` a cada build: HTTPS e host canônico, 404, `.git` escondido, cabeçalhos de segurança com a CSP por hash (D74, D79) e cache (D75); com a 404 em inglês no build, também `dist/en/.htaccess` |
| `scripts/gerar-versao.mjs` | Gera `dist/versao.txt` a cada build: commit da `main` e data/hora UTC (D78), para saber qual versão está no ar |
| `scripts/conferir-publicado.mjs` | Testes no endereço real depois de publicar (`npm run conferir:publicado`); com o inglês desligado, prova que nada em inglês está no ar |
| `scripts/comparar-builds.mjs` | Prova de que o português não muda (D94): build da branch contra o da `main` (HTML e `.htaccess` normalizados, bytes, texto e pixels nas 8 páginas x 3 larguras x 3 cenários, console) e lista dos pacotes de `/_astro/` que mudaram; `--controle` compara a `main` com ela mesma (`npm run comparar -- --referencia <dist da main>`); `--ingles` faz a prova da chave ligada (os dois builds com `INGLES=1`): português idêntico tirando seletor, `ml-auto` do menu, `hreflang` e `og:locale:alternate`, só na home e na 404 |
| `src/lib/site.mjs`, `src/lib/imagens.mjs` | Endereço final do site (D72) e chave da versão em inglês (`INGLES_PUBLICADO`, `inglesAtivo()`, D92); lista única das imagens com nome, tamanho e teto de peso |
| `src/pages/sitemap.xml.ts`, `src/pages/robots.txt.ts` | Sitemap e robots, gerados no build |
| `.github/workflows/publicar.yml` | Em todo PR, dois builds com as conferências (pré-visualização com `INGLES=1` e o de produção); a cada merge na `main`, só o de produção e a publicação na branch `publicacao` (D71), que a Hostinger implanta pelo aplicativo "Implante de GitHub", sem webhook (D78) |
| `hospedagem/htaccess-dominio-principal` | `.htaccess` da pasta principal do domínio na Hostinger: redireciona o domínio principal para profmatheus.com (D77) |
| `docs/PUBLICACAO.md` | Como o site chega ao ar, passo a passo do hPanel, troca de imagens e testes depois de publicar |
| `LICENSE`, `LICENSE-CONTEUDO.md` | Código sob MIT; textos e imagens sob CC BY-NC-ND 4.0 (D76) |
| `scripts/variantes-imagens.mjs` | Gera as larguras 840 e 1680 das imagens para o `srcset` (em `public/img/variantes/`, fora do Git) |
| `scripts/capturas.mjs`, `scripts/lighthouse.mjs` | Testes no navegador em todas as páginas do build, nos dois idiomas (3 larguras x 3 cenários, salto para cada bloco, axe, teclado, interativos, botão copiar, 404 de cada idioma, seletor e cabeçalho de 1024 a 1280 px, com os cabeçalhos do `.htaccess` e zero violações de CSP) e Lighthouse (home de cada idioma no celular em cinco rodadas, registrada a pior; D67). Com `BASE_URL` / `LIGHTHOUSE_URL`, rodam no endereço publicado |
| `scripts/reservar-imagens.mjs` | Cria os espaços reservados em `public/img/` sem sobrescrever imagens finais |
| `scripts/converter.sh` | Recria `conteudo/` a partir de `fonte/` |
| `scripts/legibilidade.py` | Mede tamanho e legibilidade de uma página |
| `scripts/legibilidade_en.py`, `scripts/requirements-legibilidade.txt` | Legibilidade em inglês (FKGL e Flesch Reading Ease, sílabas pelo CMU, D89), com `cmudict` fixado; `--teste` confere o script |
| `fonte/`, `conteudo/` | Fora do Git |

## Comandos do site

```bash
npm install
```

```bash
npm run build
```

O build roda antes e depois as conferências de dados, contraste, imagens, texto, terceiros, links
e publicação, e gera o `dist/.htaccess`; qualquer diferença em relação aos textos aprovados ou aos
dados faz o build falhar.

```bash
npm run capturas
```

Para salvar as capturas versionadas de uma ou mais páginas:

```bash
npm run capturas:salvar -- home,sobre
```

```bash
npm run lighthouse
```

Depois de publicar (detalhes em `docs/PUBLICACAO.md`):

```bash
NODE_USE_ENV_PROXY=1 npm run conferir:publicado
```

## Estado atual (20 de novembro de 2026)

- **Fase 1 concluída e aprovada.**
- **Fase 2 concluída e aprovada** (17/11/2026): home, capítulos 1 a 5 e "Sobre a tese" escritos e
  aprovados. Decisões D1 a D42 registradas (D15 estendida a todas as páginas); nenhum ponto em
  aberto. Script de legibilidade pronto.
- **Home aprovada** (`src/content/pt-br/home.md`, 1.770 palavras, índice 62,1) e enviada à
  `main` por pull request.
- **Capítulo 1 aprovado** (`src/content/pt-br/capitulo-1.md`, 1.680 palavras, índice 61,9),
  com rastreabilidade e relatório; enviado à `main` por pull request. Decisões D16 a D20
  registradas. Frase sobre Atenas ajustada depois, pela D22 (índice era 62,1).
- **Capítulo 2 aprovado** sem ajustes de texto (`src/content/pt-br/capitulo-2.md`, 1.797
  palavras, índice 63,9), com rastreabilidade e relatório; enviado à `main` por pull request.
  Decisão D21 registrada.
- **Capítulo 3 aprovado** sem ajustes de texto (`src/content/pt-br/capitulo-3.md`, 1.794
  palavras, índice 58,2), com rastreabilidade e relatório; enviado à `main` por pull request.
  Decisões D22 a D26 registradas (D22 ajusta o capítulo 1).
- **Capítulo 4 aprovado** com um ajuste (`src/content/pt-br/capitulo-4.md`, 1.791 palavras,
  índice 58,9), com rastreabilidade e relatório; enviado à `main` por pull request. Decisões D27
  a D31 registradas (D27 retira a contagem 89 x 11 de todo o site).
- **Capítulo 5 aprovado** com um ajuste (`src/content/pt-br/capitulo-5.md`, 1.800 palavras, índice
  57,8), com rastreabilidade e relatório; enviado à `main` por pull request. Decisões D32 a D35
  registradas (D32: as 1.473.063 assinaturas são 1% do eleitorado de 2018).
- **"Sobre a tese" aprovada** com um ajuste (`src/content/pt-br/sobre.md`, 446 palavras, índice
  54,4), com rastreabilidade e relatório; enviada à `main` por pull request. Decisões D36 a D42
  registradas (D36: versão oficial = link do depósito, sem "documento provisório"; D37: linha sobre
  uso de IA; D38: links com https; D41: lembrete da Fase 5).
- **Fase 3 concluída e aprovada** (17/11/2026): projeto Astro, sistema de design e home completa
  (blocos B0 a B9) e página 404, em três etapas. Decisões D43 a D51 registradas (D43: rótulos de
  interface; D44: gráfico da home; D45: paleta; D46: lista das ferramentas no `home.md`, só
  pontuação e maiúsculas; D47: imagens não fotográficas; D48: aspas tipográficas e hífen sem
  quebra; D49: capturas versionadas; D50: setas do círculo virtuoso; D51: conclusão da fase).
  Home: 1.770 palavras, índice 62,1. Lighthouse acima de 90 em tudo. Enviada à `main` por pull
  request.
- **Imagens ilustrativas finais (D81):** as oito ilustrações geradas no Gemini (plano pago,
  18/11/2026) e aprovadas pelo autor substituem os espaços reservados em `public/img/`, recortadas e
  reduzidas, em WebP. Os originais não estão na árvore atual nem no site, mas ficaram no histórico da
  `main` (commit `67d4013`), porque o PR #16 entrou por merge comum (D82). A `og-home.png` não muda.
- **Fase 4 aprovada como plano** (17/11/2026; `docs/PLANO-FASE-4.md`), com as decisões D52 a D58.
  Entrega em quatro etapas, com parada para aprovação ao fim de cada uma.
- **Fase 4, Etapa 1 aprovada com três ajustes (D59):** modelo das páginas internas e **capítulo 2**
  completo (`/capitulos/2-o-que-nao-funciona/`): abertura com o círculo vicioso, escada dos três
  degraus, 92,9% em destaque e explorador dos Quadros 1 a 5, que funciona sem JavaScript.
  Conferências e testes estendidos a várias páginas. Texto idêntico ao aprovado (1.797 palavras);
  Lighthouse 99 a 100; axe sem violações.
  Enviada à `main` (PR #9, com merge).
- **Fase 4, Etapa 2 aprovada (D61):** **capítulos 1 e 3**
  (`/capitulos/1-no-papel/`, `/capitulos/3-o-atalho-digital/`). Capítulo 1 sem interativo (D53):
  linha do tempo, checklist das nove regras e "Lado a lado" em cartões no celular. Capítulo 3:
  estádio com a legenda T33, a bolha (interativo) e os sete problemas. Home: folga do "92,9%"
  (D60). Checklist, tabela em cartões e revelação dos visuais viraram peças comuns. Textos
  idênticos aos aprovados; Lighthouse 99 a 100 nas quatro páginas; axe sem violações.
  Aprovada (D61) e enviada à `main` (PR #10, com merge).
- **Fase 4, Etapa 3 aprovada com um ajuste (D66):** **capítulos 4 e 5**
  (`/capitulos/4-o-cidadao-no-centro/`, `/capitulos/5-as-ferramentas/`). Capítulo 4: "quem decide
  o quê" (interativo, sem JS), 0,22% em destaque, ramo e semente no B9 e círculo virtuoso com a
  troca de rótulos no B11. Capítulo 5: caminho do referendo, barras na tabela das petições e cartões
  das ferramentas (interativo, sem JS; referendo de Portugal com as três travas, D52; recall com o
  funil da Califórnia). Novas séries no `dados.json`, cada uma conferida contra a frase do texto
  (a conferência aceita números por extenso). Escolhas de apresentação aprovadas (D62 a D64).
  Ajuste: as cinco etapas do B3 do capítulo 4 com inicial maiúscula e sem pontuação no fim, só
  pontuação e maiúsculas (D65; legibilidade igual, 1.791 palavras, índice 58,9). Textos idênticos
  aos aprovados; Lighthouse 98 a 100 nas seis páginas; axe sem violações. Enviada à `main` (PR #11,
  com merge).
- **Fase 4, Etapa 4 aprovada com um ajuste (D70):** página **"Sobre a tese"** (`/sobre/`): ficha em
  cartão, referências ABNT, APA e BibTeX com botão de copiar (data do dia no ABNT; "Copiado" também
  no nome acessível, D68; sem JS, sem botões) e contato em cartão. Ajuste: ABNT e APA na fonte do
  corpo, BibTeX em monoespaçada (D69). Links internos quebrados passam a derrubar o build. Home:
  oscilação do Lighthouse no celular investigada e corrigida, com as animações abaixo da primeira
  tela carregadas depois (D67; mesma aparência, nenhuma palavra muda); a home no celular roda cinco
  vezes e o resumo registra a pior. Testes nas sete páginas, 3 larguras x 3 cenários, axe sem
  violações; Lighthouse acima de 90 em tudo. PR #12.
- **Fase 4 concluída e aprovada** (17/11/2026, D70): capítulos 1 a 5 e "Sobre a tese" publicados,
  com os interativos e visuais aprovados. Decisões D52 a D70 registradas; nenhum ponto em aberto.

- **Fase 5 aprovada como plano** (17/11/2026), com as decisões D71 a D77 (publicação por branch
  `publicacao` e Git do hPanel; endereço canônico; compartilhamento; cabeçalhos de segurança; cache;
  licenças CC BY-NC-ND 4.0 e MIT, com o T49 no rodapé; domínio principal sem WordPress, redirecionado
  para profmatheus.com). Entrega em três etapas, com parada ao fim de cada uma.
- **Fase 5, Etapa 1 (código da publicação) aprovada** e enviada à `main` (PR #13, com merge):
  endereço final no build, canonical e Open Graph, sitemap e robots, `.htaccess` gerado com CSP por
  hash, conferências novas (imagens e publicação), testes no navegador com os cabeçalhos reais,
  workflow de publicação, `.htaccess` da pasta principal, licenças e linha T49 no rodapé,
  `docs/PUBLICACAO.md`. Textos aprovados idênticos.
- **Site no ar desde 18/11/2026** em https://tese.profmatheuspassos.com.br. O autor removeu o
  WordPress, pôs o redirecionamento do domínio principal, criou o subdomínio com SSL e ligou a
  implantação pelo aplicativo "Implante de GitHub" (sem webhook), com a CDN da Hostinger desligada
  (D78). Primeira implantação manual: `e35f1fa`.
- **Fase 5, Etapa 2 aprovada** e enviada à `main` (PR #14, merge `40e639d`): testes no endereço
  real, `versao.txt` (D78), `connect-src 'self'` na CSP (D79), integração por aplicativo e CDN
  desligada documentadas, plano da fase versionado em `docs/PLANO-FASE-5.md`.
- **Implantação automática confirmada (D80):** o merge da Etapa 2 entrou no ar sozinho; o
  `versao.txt` mostra `40e639d`, gerado em 2026-11-18T13:54:01Z. No ar: `conferir:publicado` passou
  (282 testes, sem CDN); Lighthouse com SEO e Agentic Browsing em 100 nas sete páginas, celular e
  computador.
- **Link do depósito conferido pelo autor** (`https://hdl.handle.net/10451/57093`, na página
  "Sobre a tese"): funciona no navegador, em 18/11/2026. O servidor da Universidade de Lisboa só
  recusa a conexão vinda da nuvem.
- **Fase 5, Etapa 3 aprovada** e enviada à `main` (PR #15, merge `ed49c91`): README final, público
  (o que é o site, endereço, como rodar, como a publicação funciona, licenças). Com ela, a **Fase 5
  está concluída**.
- **Imagens finais no ar (PR #16, merge comum `cc9168b`):** em 18/11/2026, o `versao.txt` mostra
  `cc9168b` (gerado 2026-11-18T15:43:01Z), `conferir:publicado` passou (282 testes), e as oito WebP e
  as 15 variantes de 840 e 1680 px respondem 200, idênticas byte a byte às do repositório (a
  `home-cena-2013`, com 1200 px, só tem a de 840). **Originais no histórico da `main` (D82):** o
  commit `67d4013` (cerca de 15 MB) ficou no histórico; o autor decidiu não reescrevê-lo (nada de
  force push). Não vão para o site, publicado da branch `publicacao`.
- **Linha sobre as ilustrações (D83):** frase aprovada pelo autor em 18/11/2026 no fim do parágrafo
  sobre IA da página "Sobre a tese" (bloco B1) e no README. "Sobre a tese": 464 palavras, índice
  53,4 (bloco B1: 54,7 → 51,3). Enviada à `main` (PR #17, merge `764b1e9`).
- **Maiúsculas das disciplinas (D84):** "Direito, Ciência Política e Sociologia" em "Sobre a tese",
  B3. Enviada à `main` (PR #18, merge `b9562f3`).
- **`versao.txt` que não mudou (D105):** no merge de `b9562f3`, o `rsync -a` do workflow pulou o
  `versao.txt` (mesmo tamanho, gravado no mesmo segundo do clone da `publicacao`); o conteúdo foi
  ao ar, mas o marcador ficou em `764b1e9`. Correção: `rsync -a --checksum` em
  `.github/workflows/publicar.yml`. Enviada à `main` (PR #20, merge `45fa138`). Conferido no ar em
  19/11/2026: o `versao.txt` mostra `45fa138` e `conferir:publicado` passou (282 testes).
- **Versão em inglês, Etapa 1 (documentos):** decisões D85 a D104 registradas, glossário
  (`docs/GLOSSARIO-EN.md`) e plano (`docs/PLANO-INGLES.md`) aprovados pelo autor em 19/11/2026.
  Enviada à `main` (PR #19, merge `2d01169`). Ponto em aberto: A20 ("Legal and Political Sciences", à espera de confirmação do autor).
- **Versão em inglês, Etapa 2a (só refatoração, chave desligada):** `idiomas.mjs`, locale nos
  formatadores, `paginas.ts` com idioma, corpo da home e de "Sobre" como componentes, `ancoras.ts`,
  trava do `dados.json` no `conferir-dados.mjs` (impressão de `b9562f3`, D94) e
  `scripts/comparar-builds.mjs`. Português idêntico ao da `main` pela prova. **Aprovada (D106)** e
  enviada à `main` (PR #21, merge `4064a63`); no ar conferido (282 testes).
- **Versão em inglês, Etapa 2b (estrutura bilíngue, chave desligada):** `en.json` (T1 a T52, com o
  apóstrofo curvo da D107), entrada do inglês em `idiomas.mjs`, chave `INGLES_PUBLICADO`, coleção
  `paginasEn` vazia, componentes pelo idioma da rota, `lang`/`og:locale`/`hreflang` pelo idioma,
  seletor (D101, D108), rotas `/en/` e 404 em inglês, sitemap e `dist/en/.htaccess` condicionados à
  chave; conferências por idioma (paridade nova, texto, publicação com a trava, terceiros),
  capturas, Lighthouse e `conferir-publicado` para os dois idiomas; `legibilidade_en.py`; workflow
  com dois builds em PR. Decisões D106 a D108. Português idêntico ao da `main` pela prova.
  **Aprovada (D109)** e enviada à `main` (PR #22, merge `6f66a55`); no ar, `versao.txt` com
  `6f66a55`, `conferir:publicado` passou (314 testes) e nenhum `en/` na branch `publicacao`.

- **Versão em inglês, Etapa 3, home:** tradução aprovada no plano, com uma revisão (D110: TE1 a TE8;
  "both" conta como 2 só antes de substantivo no plural). `src/content/en/home.md` (1.842 palavras;
  FKGL 7,9; FRE 58,4; "the dissertation" 4 vezes), `frase_en`/`frases_en` no `dados.json` (impressão
  igual) e conferidas pelo `conferir-dados`, âncoras em inglês, "Read chapter N" com `lang`/`hreflang`
  para capítulo ainda sem tradução (só pré-visualização), `comparar-builds --ingles`, resumo do
  Lighthouse do inglês à parte. Provas: chave desligada, zero diferença em 72 de 72 contra a `main`;
  chave ligada, português idêntico em 72 de 72 tirando seletor e `hreflang` (home e 404). Aprovada
  (D110) e enviada à `main` (PR #23, merge `46aad3b`); no ar sem nada em inglês (D111: `versao.txt`
  com `46aad3b`, 314 testes, nenhum `en/` na `publicacao`).
- **Versão em inglês, Etapa 3, capítulo 1:** tradução aprovada no plano, com uma revisão do autor
  (D112: TE9 a TE18; TE12, TE13, TE16 e TE18 no glossário). `src/content/en/capitulo-1.md` (1.735
  palavras; FKGL 8,4, acima da referência de 8, aceito pela D89; FRE 56,0; "the dissertation" 2
  vezes). Título na tese com o original em `lang="pt-BR"` e a tradução sob o T52 (`tituloNaTese` em
  `src/lib/paginas.ts`); navegação com `hreflang` para página sem tradução. Scripts: paridade lê o
  século em romanos; `comparar-builds --ingles` tira o esperado dos pares do `sitemap.xml` de cada
  build; Lighthouse com 5 rodadas no celular em cada página em inglês; espera do explorador do
  capítulo 2 até o valor esperado (limite de 2 s), depois de 1 falha em 99 combinações. Provas:
  chave desligada, zero diferença em 72 de 72; chave ligada, português idêntico em 72 de 72 tirando
  só o previsto pelos pares. Lighthouse do capítulo 1: 99 no celular (pior de 5), 100 no computador.
  Aprovada (D112) e enviada à `main` (PR #24, merge `68133af`); no ar sem nada em inglês (D113:
  `versao.txt` com `68133af`, 314 testes, nenhum `en/` na `publicacao`).
- **Versão em inglês, Etapa 3, capítulo 2:** tradução aprovada no plano, com uma revisão do autor
  (D114: TE19 a TE24; "party bylaws" e os três degraus no glossário; título com apóstrofo curvo).
  `src/content/en/capitulo-2.md` (1.850 palavras; FKGL 7,5; FRE 61,4; "the dissertation" 2 vezes).
  `Explorador.astro` compara rótulos com o `dados.json` só no português; `Capitulo2.astro` com
  `tituloNaTese`; `src/content/en/` fora da busca de classes do Tailwind (a palavra "grow" gerava
  `.grow`). Regra nova das capturas versionadas: mesmo conteúdo e só posição até 2 px entra no commit
  sem parar (D114). Provas: chave desligada, zero diferença em 72 de 72 e nenhum pacote de
  `/_astro/` mudado; chave ligada, português idêntico em 72 de 72 tirando só o previsto pelos pares.
  Lighthouse do capítulo 2: 100 no celular (pior de 5) e no computador. Aprovada (D114) e enviada à
  `main` (PR #25, merge `bee3fb3`); no ar sem nada em inglês (D115: `versao.txt` com `bee3fb3`, 314
  testes, nenhum `en/` na `publicacao`).
- **Correção do CSS (D115):** depois do merge de `bee3fb3`, o CSS publicado voltou a ter `.grow`: o
  Tailwind lia o projeto inteiro, e os commits de documentação do PR #25, posteriores à prova, citam
  "grow". `src/styles/global.css` passa a `@import "tailwindcss" source("..");` (só `src/`), mantido o
  `@source not "../content/en";`. Saem do `Base.css` só `.grow`, `.static`, `.contents`, `.rounded` e
  `.italic`, nenhuma usada em HTML algum. Prova no último commit do PR: chave desligada e ligada, zero
  diferença em 72 de 72. Regra nova: a prova final contra a `main` roda no último commit do PR, depois
  dos commits de documentação. Aprovada e enviada à `main` (PR #26, merge `45370ff`); no ar (D116):
  `versao.txt` com `45370ff`, 314 testes, nenhum `en/` na `publicacao`, CSS sem as cinco regras.
- **Versão em inglês, Etapa 3, capítulo 3:** tradução aprovada no plano, com uma revisão do autor
  (D117: TE25 a TE33; TE29 "The Brazilian city of Porto Alegre"; "by lot", "social media" e "the
  internet" no glossário). `src/content/en/capitulo-3.md` (1.861 palavras; FKGL 8,4, acima da
  referência de 8, aceito pela D89; FRE 55,6; "the dissertation" 4 vezes). `Capitulo3.astro` com
  `tituloNaTese`; âncora `impossible`; teste da bolha com o contador pelo rótulo do idioma. Bolha em
  inglês testada nos três cenários. Lighthouse do capítulo 3: 100 no celular (pior de 5) e no
  computador. Aprovada (D117) e enviada à `main` (PR #27, merge `12ba916`); no ar sem nada em inglês
  (D118: `versao.txt` com `12ba916`, 314 testes, nenhum `en/` na `publicacao`, CSS sem as cinco regras).
- **Versão em inglês, Etapa 3, capítulo 4:** tradução aprovada no plano, com uma revisão do autor
  (D119: TE34 a TE42; TE37 "what chance do they have"; "stages" e "advisory / decision-making" no
  glossário; frase de 28 palavras do B2 idêntica à da home). `src/content/en/capitulo-4.md` (1.928
  palavras; FKGL 8,7, acima da referência de 8, aceito pela D89; FRE 54,8; "the dissertation" 3
  vezes). `Capitulo4.astro` com `tituloNaTese`; âncoras `five stages`, `% of the population` e `turn the
  other way`; `frases_en` do B7 no `dados.json`. `.qd-col` com `justify-self: center` ("Government", 78
  px numa coluna de 72 em 375 px; português igual). Lighthouse do capítulo 4: 100 no celular (pior de
  5) e no computador. Em pull request, à espera da aprovação do autor.

## Próximo passo

1. **Aprovação e merge do pull request do capítulo 4 em inglês (D119)**; registrar em
   `docs/DECISOES.md` como D120 e conferir no ar (`versao.txt` com o hash completo em `COMMIT_ESPERADO`,
   `conferir:publicado`, nenhum `en/` na `publicacao`, Base CSS sem as cinco regras da D115).
2. **Capítulo 5 em inglês**, só depois da aprovação, numa branch nova a partir da `main` atualizada.
   `Capitulo5.astro` passa a usar `tituloNaTese`, como os capítulos 1 a 4; conferir os componentes do
   capítulo 5 (caminho do referendo, barras das petições, cartões das ferramentas, funil da Califórnia)
   e os testes do `scripts/capturas.mjs` que dependam de texto em português; âncora `soCongresso` em
   inglês; títulos com apóstrofo curvo ("(and one that’s missing)", D114). Na tradução de "About",
   trocar o destino do link do B9 da home de `/sobre/` para `/en/about/`.
   **Procedimento de cada página (D115):** a prova final contra a `main` (`comparar-builds`, chave
   desligada e ligada) roda no **último commit do PR, depois dos commits de documentação**; se algum
   commit entrar depois dela, a prova roda de novo.
3. **`cap4-abertura`:** aceita, mas pode ser refeita depois de vista na página montada (D81); a troca
   segue `docs/PUBLICACAO.md` (mesmo nome e dimensões, por pull request).
