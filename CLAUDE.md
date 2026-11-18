# CLAUDE.md

## Objetivo do projeto

Site estático, público e interativo que apresenta ao público geral a tese de doutorado
**"Cidadania Ativa e Governança sob a perspectiva do Direito Eleitoral comparado"**, de
Matheus Passos Silva (Faculdade de Direito da Universidade de Lisboa, 2022; orientador:
Prof. Doutor Jorge Miranda). A tese compara Portugal e Brasil.

**Não é a publicação da tese.** É uma versão de divulgação, reescrita em linguagem simples e
fiel ao argumento original. Idioma: português do Brasil, com a estrutura pronta para uma
versão em inglês no futuro (nada é traduzido agora).

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
| `docs/notas-leitura/` | Notas detalhadas por capítulo (argumento, conceitos, dados com ano e fonte, trechos de destaque, seção de origem) |
| `docs/RASTREABILIDADE.md` | Cada bloco do site ligado à seção de origem; dados usados; escolhas de interpretação |
| `docs/LEGIBILIDADE.md` | Método do índice e resultados por página |
| `src/content/pt-br/` | Texto reescrito das páginas (Markdown; blocos marcados com `<!-- Bn \| ... -->`) |
| `docs/PROMPTS-IMAGENS.md` | Guia de estilo e prompts das imagens ilustrativas (D47) |
| `docs/PLANO-FASE-4.md` | Plano aprovado da Fase 4: modelo de página, interativos, rótulos T13 a T48, testes, etapas |
| `docs/PLANO-FASE-5.md` | Plano aprovado da Fase 5 (publicação), com os ajustes da D78 e D79 |
| `docs/capturas/fase-3/` | Capturas versionadas (cenário normal, 375 e 1440 px, por bloco) e resumo do Lighthouse |
| `docs/capturas/fase-4/` | Capturas das páginas novas (D56) e `lighthouse/resumo.md` de todas as páginas (só o resumo é versionado, D59) |
| `docs/capturas/fase-5/` | `lighthouse/resumo.md` medido no endereço publicado |
| `src/pages/`, `src/layouts/`, `src/components/` | Site Astro: home (`index.astro`), "Sobre a tese" (`sobre.astro`), 404, layout base, componentes por bloco, motivo ramo/semente, gráficos e diagramas |
| `src/pages/capitulos/[slug].astro`, `src/layouts/Capitulo.astro` | Rotas dos capítulos (lidas dos `.md`) e modelo das páginas internas |
| `src/components/capitulo/`, `src/components/capitulos/`, `src/components/interativos/` | Abertura, bloco de texto, progresso e navegação; composição de cada capítulo; interativos (explorador etc.) |
| `src/lib/blocos.ts` | Divide o HTML de cada `.md` nos blocos `Bn`; só acrescenta atributos, envoltórios e desenhos sem texto, nunca texto (inclui `rotularCelulas`, tabela em cartões no celular, e `anexarEmCelulas`, barras ao lado dos números de uma tabela) |
| `src/lib/checklist.ts`, `src/lib/quemDecide.ts`, `src/styles/checklist.css`, `src/scripts/comum/` | Peças comuns à home e aos capítulos: marcas do checklist e do "quem decide", observadores de entrada na tela, animação do checklist, revelação dos visuais, troca de rótulos do círculo virtuoso (`circulo.ts`), ramo que engrossa e semente que brota (`crescer.ts`); alternador em pílulas no `global.css` |
| `src/lib/rotulos.mjs` | Marcadores `{d:caminho}` nos rótulos, trocados pelos valores do `dados.json` (usado pelo site e pelas conferências) |
| `src/lib/plugin-sem-quebra.mjs` | Impede quebra de linha em palavras com hífen, sem trocar caractere |
| `src/data/dados.json` | Único arquivo de números do site (Quadros 1 a 5 e outros), com os usos por página |
| `src/i18n/pt-br.json` | Rótulos de interface aprovados (D43, D52); nenhum outro texto de interface |
| `src/styles/global.css` | Tokens de design (D45) |
| `src/scripts/home.ts`, `src/scripts/home-resto.ts` | Animações GSAP da home (só com `prefers-reduced-motion: no-preference`): a abertura na carga; o resto (ScrollTrigger e blocos B1 a B8) quando o navegador fica ocioso, um bloco por tarefa (D67) |
| `scripts/conferir-*.mjs` | Conferências que rodam em todo build: dados, contraste, imagens (nome, tamanho, peso), texto (palavras, aspas, rótulos, atributos), recursos de terceiros, links internos (link quebrado faz o build falhar) e publicação (canonical, Open Graph, sitemap, robots, CSP, `.htaccess` da pasta principal) |
| `scripts/gerar-htaccess.mjs` | Gera `dist/.htaccess` a cada build: HTTPS e host canônico, 404, `.git` escondido, cabeçalhos de segurança com a CSP por hash (D74, D79) e cache (D75) |
| `scripts/gerar-versao.mjs` | Gera `dist/versao.txt` a cada build: commit da `main` e data/hora UTC (D78), para saber qual versão está no ar |
| `scripts/conferir-publicado.mjs` | Testes no endereço real depois de publicar (`npm run conferir:publicado`) |
| `src/lib/site.mjs`, `src/lib/imagens.mjs` | Endereço final do site (D72); lista única das imagens com nome, tamanho e teto de peso |
| `src/pages/sitemap.xml.ts`, `src/pages/robots.txt.ts` | Sitemap e robots, gerados no build |
| `.github/workflows/publicar.yml` | Build com as conferências em todo PR e, a cada merge na `main`, publicação na branch `publicacao` (D71), que a Hostinger implanta pelo aplicativo "Implante de GitHub", sem webhook (D78) |
| `hospedagem/htaccess-dominio-principal` | `.htaccess` da pasta principal do domínio na Hostinger: redireciona o domínio principal para profmatheus.com (D77) |
| `docs/PUBLICACAO.md` | Como o site chega ao ar, passo a passo do hPanel, troca de imagens e testes depois de publicar |
| `LICENSE`, `LICENSE-CONTEUDO.md` | Código sob MIT; textos e imagens sob CC BY-NC-ND 4.0 (D76) |
| `scripts/variantes-imagens.mjs` | Gera as larguras 840 e 1680 das imagens para o `srcset` (em `public/img/variantes/`, fora do Git) |
| `scripts/capturas.mjs`, `scripts/lighthouse.mjs` | Testes no navegador em todas as páginas do build (3 larguras x 3 cenários, salto para cada bloco, axe, teclado, interativos, botão copiar, com os cabeçalhos do `.htaccess` e zero violações de CSP) e Lighthouse (home no celular em cinco rodadas, registrada a pior; D67). Com `BASE_URL` / `LIGHTHOUSE_URL`, rodam no endereço publicado |
| `scripts/reservar-imagens.mjs` | Cria os espaços reservados em `public/img/` sem sobrescrever imagens finais |
| `scripts/converter.sh` | Recria `conteudo/` a partir de `fonte/` |
| `scripts/legibilidade.py` | Mede tamanho e legibilidade de uma página |
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

## Estado atual (18 de novembro de 2026)

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
  53,4 (bloco B1: 54,7 → 51,3).

## Próximo passo

1. **Aprovação e merge do pull request da D82 e da D83** (merge comum; não há arquivos grandes).
   Depois do merge, conferir que o `versao.txt` no ar mostra o novo commit (`NODE_USE_ENV_PROXY=1 npm
   run conferir:publicado`) e que a página "Sobre a tese" traz a frase das ilustrações.
2. **`cap4-abertura`:** aceita, mas pode ser refeita depois de vista na página montada (D81); a troca
   segue `docs/PUBLICACAO.md` (mesmo nome e dimensões, por pull request).
