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
| `docs/capturas/fase-3/` | Capturas versionadas (cenário normal, 375 e 1440 px, por bloco) e relatórios do Lighthouse |
| `docs/capturas/fase-4/` | Capturas das páginas novas (D56) e relatórios do Lighthouse de todas as páginas, com `resumo.md` |
| `src/pages/`, `src/layouts/`, `src/components/` | Site Astro: home (`index.astro`), 404, layout base, componentes por bloco, motivo ramo/semente, gráficos e diagramas |
| `src/pages/capitulos/[slug].astro`, `src/layouts/Capitulo.astro` | Rotas dos capítulos (lidas dos `.md`) e modelo das páginas internas |
| `src/components/capitulo/`, `src/components/capitulos/`, `src/components/interativos/` | Abertura, bloco de texto, progresso e navegação; composição de cada capítulo; interativos (explorador etc.) |
| `src/lib/blocos.ts` | Divide o HTML de cada `.md` nos blocos `Bn`; só acrescenta atributos, envoltórios e desenhos sem texto, nunca texto |
| `src/lib/rotulos.mjs` | Marcadores `{d:caminho}` nos rótulos, trocados pelos valores do `dados.json` (usado pelo site e pelas conferências) |
| `src/lib/plugin-sem-quebra.mjs` | Impede quebra de linha em palavras com hífen, sem trocar caractere |
| `src/data/dados.json` | Único arquivo de números do site (Quadros 1 a 5 e outros), com os usos por página |
| `src/i18n/pt-br.json` | Rótulos de interface aprovados (D43, D52); nenhum outro texto de interface |
| `src/styles/global.css` | Tokens de design (D45) |
| `src/scripts/home.ts` | Animações GSAP da home (só com `prefers-reduced-motion: no-preference`) |
| `scripts/conferir-*.mjs` | Conferências que rodam em todo build: dados, contraste, texto (palavras, aspas, rótulos, atributos), recursos de terceiros e links internos |
| `scripts/variantes-imagens.mjs` | Gera as larguras 840 e 1680 das imagens para o `srcset` (em `public/img/variantes/`, fora do Git) |
| `scripts/capturas.mjs`, `scripts/lighthouse.mjs` | Testes no navegador em todas as páginas do build (3 larguras x 3 cenários, salto para cada bloco, axe, teclado, interativos) e Lighthouse |
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

O build roda antes e depois as conferências de dados, contraste, texto e terceiros; qualquer
diferença em relação aos textos aprovados ou aos dados faz o build falhar.

```bash
npm run capturas
```

Para salvar as capturas versionadas de uma ou mais páginas:

```bash
npm run capturas:salvar -- capitulo-2
```

```bash
npm run lighthouse
```

## Estado atual (17 de novembro de 2026)

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
- As imagens ilustrativas ainda são espaços reservados (cor lisa) em `public/img/`.
- **Fase 4 aprovada como plano** (17/11/2026; `docs/PLANO-FASE-4.md`), com as decisões D52 a D58.
  Entrega em quatro etapas, com parada para aprovação ao fim de cada uma.
- **Fase 4, Etapa 1 entregue, aguardando aprovação:** modelo das páginas internas e **capítulo 2**
  completo (`/capitulos/2-o-que-nao-funciona/`): abertura com o círculo vicioso, escada dos três
  degraus, 92,9% em destaque e explorador dos Quadros 1 a 5, que funciona sem JavaScript.
  Conferências e testes estendidos a várias páginas. Texto idêntico ao aprovado (1.797 palavras);
  Lighthouse 99 a 100; axe sem violações.

## Próximo passo

1. **Aprovação da Etapa 1 da Fase 4** (capítulo 2). Com ela: pull request para a `main`.
2. Etapa 2: capítulos 1 e 3. Etapa 3: capítulos 4 e 5. Etapa 4: "Sobre a tese", links internos como
   erro (`LINKS_ESTRITO=1`), Lighthouse e capturas das sete páginas. Cada etapa para e espera
   aprovação.
3. Lembrete para a Fase 5 (D41): na publicação, conferir que o link do repositório na página
   "Sobre a tese" abre para o público. Também na Fase 5: link canônico, tags de compartilhamento
   (`og-home.png` já existe) e `SITE_URL`/`BASE_PATH` do domínio final.
