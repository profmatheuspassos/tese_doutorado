# Plano: versão em inglês americano do site

**Aprovado pelo autor em 19/11/2026** (D94), com os ajustes já incorporados abaixo: Etapa 2 dividida
em 2a e 2b; sílabas pelo dicionário CMU; moeda sem conversão; trava do `dados.json`; contagem de
"the dissertation" no relatório de cada página.

- O glossário em vigor é `docs/GLOSSARIO-EN.md`. A seção e) abaixo é o rascunho aprovado, mantido
  como registro; se os dois divergirem, vale o glossário.
- Os pontos "A1" a "A8" da seção g) são numeração interna deste plano. Não são os pontos A1 a A19
  de `docs/DECISOES.md`. Viraram decisões entre a D95 e a D103; o único ponto que segue em aberto é o A20
  de `docs/DECISOES.md` ("Legal and Political Sciences").

## Contexto

O site em português está concluído e no ar (D1 a D84). A nova frente é uma versão em inglês
americano, traduzida do **texto aprovado em português** (não da tese), em `/en/`, lançada de uma
vez só. Todo merge na `main` publica (D71, D78); por isso o inglês fica atrás de uma chave
desligada até a última etapa. O português não muda; a única adição às páginas em português é o
seletor de idioma (e o `hreflang`, que é metadado).

Este documento vira `docs/PLANO-INGLES.md` na Etapa 1, com as decisões D85 em diante.

---

## a) Inventário do que traduzir

Contagem de palavras pelo `scripts/legibilidade.py` ("palavras visíveis": texto, títulos e
tabelas; sem blocos de código) e, para os rótulos, contagem simples por item.

| Item | Palavras (pt) | Observação |
|---|---|---|
| `home.md` | 1.770 | B0 a B9; inclui a tabela dos sete problemas |
| `capitulo-1.md` | 1.680 | B0 a B9 |
| `capitulo-2.md` | 1.797 | B0 a B10 |
| `capitulo-3.md` | 1.794 | B0 a B11 |
| `capitulo-4.md` | 1.791 | B0 a B12 |
| `capitulo-5.md` | 1.800 | B0 a B11 |
| `sobre.md` | 464 | B0 a B7, sem as três referências |
| Referências em `sobre.md` (blocos de código) | ABNT 47, APA 30, BibTeX 35 | ABNT fica em português; APA ganha a tradução do título entre colchetes e "Doctoral dissertation"; BibTeX: título original (ver glossário, seção 6) |
| Front matter: `subtitulo` (home) | 9 | Vira a descrição (T12) |
| Front matter: `titulo` das 7 páginas | 33 | Repetem o h1 (já contados no corpo) |
| Front matter: `titulo_original` dos 5 capítulos | 62 | Original continua em português; tradução ao lado (seção 6) |
| `src/i18n/pt-br.json` (T1 a T49) | 468 | 456 a traduzir; os 12 meses do T48 ficam em português (o ABNT continua em português) |
| Rótulos novos (seletor, marca de tradução) | 4 | T50 a T52, para aprovar (seção e) |
| Linha sobre a tradução com IA ("About") | 20 | Texto do autor, aprovado (A6) |
| **Total aproximado** | **~11.700** | |

**Texto fixo fora dos `.md` e do `.json`:** nenhuma palavra a traduzir. O que depende de idioma
fora deles é formato ou âncora, e entra na arquitetura:

| Onde | O que é | O que muda |
|---|---|---|
| `src/layouts/Base.astro` | `<html lang="pt-BR">`, `og:locale` `pt_BR`, `og:site_name` | Por idioma |
| `src/lib/numeros.ts`, `src/lib/rotulos.mjs`, `src/scripts/home-resto.ts` (contador do 92,9%), `scripts/conferir-dados.mjs` e `conferir-texto.mjs` | `'pt-BR'` fixo no `Intl`/`toLocaleString` | Locale por idioma |
| `src/components/site/Rodape.astro` | Link do T49 para `deed.pt-br` | `deed.en` no inglês (e liberar em `conferir-terceiros.mjs`) |
| `src/components/interativos/Copiar.astro` | Troca `[data de acesso]` pela data com os meses do T48 | Igual nas duas versões, porque o ABNT fica em português |
| Componentes que acham trechos do texto aprovado | `'Não basta.'`, `'Não resolve.'`, `'É preciso algo mais.'`, `'No papel, são democracias.'`, `'Falta uma ferramenta nos dois países: o recall.'` (home); `'<strong>estar presente</strong>'` (cap. 2); `'impossível'` (cap. 3); `'cinco etapas'`, `'% da população'`, `'girar ao contrário'` (cap. 4); `'Só o Congresso Nacional convoca'` (cap. 5); títulos do ABNT/APA (`sobre.astro`) | Mapa de âncoras por idioma, preenchido página a página na Etapa 3 |
| Contato da D7, nomes "CC BY-NC-ND 4.0" e "MIT", "ABNT", "APA", "BibTeX" | Iguais nos dois idiomas | Nada |

---

## b) Arquitetura

### Chave de lançamento (decisão 8)
- `src/lib/site.mjs` ganha `INGLES_PUBLICADO = false` (a chave única) e `inglesAtivo()`, que é
  `INGLES_PUBLICADO || process.env.INGLES === '1'`. A variável só serve para pré-visualizar
  (build local e de PR); não publica nada.
- Com `inglesAtivo()` falso: nenhuma rota `/en/`, nenhum seletor, nenhum `hreflang`, sitemap
  igual ao de hoje.
- Trava no Actions: no push para a `main`, `conferir-publicacao.mjs` falha se `INGLES=1` estiver
  definido, e, com a chave desligada, falha se existir `dist/en/`, `hreflang` ou seletor.
- Workflow (Etapa 2b): em PR, dois builds com todas as conferências, um com `INGLES=1` e outro
  como vai ao ar. No merge, um build só (como hoje), e só ele grava na `publicacao`.

### Conteúdo e idiomas
- `src/content/en/` com os 7 `.md` traduzidos. Mesmo campo `pagina` (liga os pares), `rota` em
  inglês, e `traducao_titulo_original` nos capítulos (o `titulo_original` em português vem do par).
- `src/content.config.ts`: segunda coleção `paginasEn`, mesmo schema mais o campo novo. A coleção
  `paginas` (português) fica intacta.
- `src/lib/idiomas.mjs` (novo): tabela única por idioma (pasta, prefixo de rota, `lang` do HTML
  `pt-BR`/`en-US`, `og:locale` `pt_BR`/`en_US`, `hreflang` `pt-BR`/`en`, locale do `Intl`) e
  `idiomaDaRota(pathname)`.
- `src/lib/paginas.ts`: `pagina`, `capitulos`, `sobre` recebem o idioma (padrão `pt-br`) e
  ganham `parDe(pagina, idioma)`, que devolve a rota equivalente no outro idioma (ou nada).

### Rótulos
- `src/i18n/en.json` com T1 a T52 em inglês (T48 não entra; ver seção 6). `src/i18n/index.ts` já
  aceita idioma em `t`, `lista` e `mapa`; passa a ter o dicionário `en` e a repassar o locale para
  `expandirDados`. O padrão continua `pt-br`, para o português sair igual.
- Componentes descobrem o idioma por `idiomaDaRota(Astro.url.pathname)`; nenhum componente
  recebe texto novo.

### Números e datas
- `rotulos.mjs`: `formatarValor(valor, chave, locale = 'pt-BR')` e
  `expandirDados(texto, dados, locale = 'pt-BR')`. Novo modificador `{d:caminho|mil}`, que no
  inglês escreve o valor vezes mil com separador ("60,000"), porque o português diz "60 mil" e o
  `dados.json` guarda 60. Anos continuam sem separador.
- `numeros.ts`: as três funções recebem o locale (padrão `pt-BR`).
- `home-resto.ts`: o contador lê o locale de `document.documentElement.lang`.
- Datas no texto (`.md`) são escritas pela tradução no padrão da decisão 6; não há data gerada
  por código além do "Acesso em" do ABNT, que continua em português.

### Rotas
- Português continua em `/`. Inglês em `/en/`, `/en/chapters/1-on-paper/` etc. (slugs na seção 6).
- As páginas em português continuam nos arquivos atuais; o corpo de `index.astro` e `sobre.astro`
  vira componente com parâmetro de idioma (como os capítulos já são). O inglês sai de uma rota só,
  `src/pages/en/[...caminho].astro`, cujo `getStaticPaths` devolve lista vazia com a chave
  desligada e, ligada, as páginas em inglês que existem mais a 404 em inglês.
- Componentes que conferem a estrutura do bloco (h1 + 2 parágrafos, 4 itens etc.) continuam
  valendo para o inglês. Isso obriga a tradução a manter, em cada bloco, o mesmo número de
  parágrafos, itens de lista, linhas de tabela, títulos e trechos em negrito. Dividir ou juntar
  frases dentro do parágrafo continua livre (decisão 1).
- Âncoras de texto (tabela acima) num arquivo só, `src/lib/ancoras.ts`, com o valor em português
  e em inglês. Cada valor em inglês entra junto com a página traduzida.

### Seletor de idioma (decisão 7)
- `src/components/site/SeletorIdioma.astro`, só renderizado com `inglesAtivo()`. Texto
  "Português · English"; o ponto é desenho (CSS, `aria-hidden`), não texto. Cada link com `lang`
  e `hreflang`; o idioma atual com `aria-current="true"` (não é link). Leva à página equivalente
  (pelo `parDe`); sem redirecionamento automático e sem bandeiras. Nome acessível do `<nav>`: T50.
- Lugar (decidido, A4): no cabeçalho a partir de 1024 px, à direita do menu; abaixo disso, no
  topo do painel do menu; e sempre no rodapé.
- Estilos no próprio componente (escopo do Astro), para não mexer no CSS global.

### `<head>`, sitemap e compartilhamento
- `Base.astro`: `lang`, `og:locale` e `og:site_name` pelo idioma. Com a chave ligada e o par
  existente: `<link rel="alternate" hreflang="pt-BR">`, `hreflang="en"` e `hreflang="x-default"`
  (português) em todas as páginas dos dois idiomas, e `og:locale:alternate`.
- Canonical: cada página aponta para si mesma (o inglês não aponta para o português).
- `og:title`, `og:description` (T11, T12/T17 em inglês), mesma `og-home.png` (não tem texto).
- `sitemap.xml.ts`: com a chave ligada, lista as 14 URLs com `xhtml:link` de `pt-BR`, `en` e
  `x-default` em cada uma. Sem a chave, igual ao de hoje.

### 404 em inglês e `.htaccess`
- 404 em inglês em `/en/404/` (`noindex`, sem canonical), com T9 e T10 em inglês e link para `/en/`.
- `gerar-htaccess.mjs`: com a chave ligada, grava também `dist/en/.htaccess` com uma linha só,
  `ErrorDocument 404 /en/404/`. A pasta principal continua com a 404 em português. O `.htaccess`
  de subpasta não tem regra de reescrita, então herda HTTPS, host canônico e cabeçalhos do pai.
- CSP por hash: o cálculo já varre todo `.html` do `dist/`; as páginas em inglês entram sozinhas.
  O seletor não tem script.

---

## c) Conferências

| Conferência | Mudança |
|---|---|
| `conferir-texto.mjs` | Roda por idioma: inglês palavra por palavra contra `src/content/en/` e rótulos contra `en.json`, com os números formatados em `en-US`. Página em português só aceita rótulos do `pt-br.json` mais T50/T51; página em inglês, só do `en.json`. Trechos em português nas páginas em inglês (títulos originais, ABNT, APA, BibTeX) só dentro de elemento com `lang="pt-BR"`. |
| `conferir-paridade.mjs` (novo) | Para cada par: mesmos blocos `Bn`, na mesma ordem; mesma estrutura por bloco (parágrafos, itens, linhas e colunas de tabela, títulos, negritos, links); mesmos números por bloco, depois de converter o formato e os números por extenso (pt "oito" = en "eight"); links internos do inglês apontam para o par em inglês. |
| `conferir-dados.mjs` | Cada `uso` ganha `frases_en` (ou `frase_en` nos itens), conferidas no `.md` em inglês com números `en-US` e por extenso em inglês. Os números continuam só no `dados.json`. **Trava do `dados.json` (Etapa 2a):** o script guarda a impressão (SHA-256) do `dados.json` da `main` atual (`b9562f3`), que exclui **só** os campos novos `frases_en` e `frase_en`. Todo o resto entra na impressão, inclusive os campos de frase em português que já existem. O build falha se qualquer coisa fora de `frases_en` e `frase_en` mudar. A impressão fica no script, e não num `git show main`, para funcionar igual no Actions (que clona só um commit) e no build local. |
| `conferir-links.mjs` | Já cobre tudo que estiver no `dist/`; nenhuma mudança além de achar `/en/404/`. |
| `conferir-publicacao.mjs` | Canonical e `og:url` por página nos dois idiomas; `lang` do `<html>`; `og:locale`; `hreflang` recíproco e completo (pt-BR, en, x-default); sitemap com as 14 URLs e os alternates; `dist/en/.htaccess`; trava da chave no Actions. |
| `conferir-terceiros.mjs` | Libera `creativecommons.org/.../deed.en`. |
| `capturas.mjs` e `lighthouse.mjs` | Páginas lidas das duas pastas; testes dos interativos com os rótulos do idioma da página; 404 em inglês; axe nas 14 páginas. Lighthouse nas 14; a home em inglês também roda cinco vezes no celular (D67). |
| `conferir-publicado.mjs` | Rotas em inglês, `hreflang`, 404 em inglês em `/en/rota-que-nao-existe/`, sitemap com 14 URLs. |
| `legibilidade_en.py` (novo) | Flesch-Kincaid Grade Level e Flesch Reading Ease, mesmo recorte do script em português. **Sílabas pelo dicionário de pronúncia CMU** (pacote `cmudict==1.1.3`, versão fixada em `scripts/requirements-legibilidade.txt` com as dependências também fixadas; conferido que existe no PyPI). Regras só para palavras fora do dicionário (números, nomes portugueses e brasileiros, siglas). O relatório informa quantas palavras e qual percentual caíram nas regras, e a lista delas. Também conta "the dissertation" (máximo de cinco por página, D15). Método em `docs/LEGIBILIDADE.md`. |

### Prova de que o português não muda (`scripts/comparar-builds.mjs`, novo)
1. **Chave desligada:** build da `main` atual contra build da branch. Todo `.html`, `sitemap.xml`,
   `robots.txt` e `.htaccess` precisa ser idêntico byte a byte, depois de trocar os nomes com hash
   de `/_astro/` por um marcador. `versao.txt` fica de fora. Mais: capturas das 7 páginas, nas 3
   larguras, idênticas pixel a pixel.
   - Ressalva honesta: **os pacotes JS e CSS de `/_astro/` vão mudar de hash**. O código do cliente
     muda (o contador passa a ler o locale) e o Tailwind gera classes novas. Por isso a identidade
     é do HTML normalizado, do texto e dos pixels, e o relatório lista cada pacote que mudou e por quê.
2. **Chave ligada:** o HTML normalizado das páginas em português só pode diferir em três coisas:
   as linhas `hreflang`, o `og:locale:alternate` e o seletor. O script remove esses três e exige
   identidade no resto. O sitemap ganha as URLs em inglês.

---

## d) Rastreabilidade

- Cada bloco em inglês tem o mesmo `Bn` do bloco em português, com comentário
  `<!-- B3 | Na prática | tradução de pt-br/home.md, B3 -->`. A origem na tese continua no bloco em
  português; o inglês herda a ligação pelo `Bn`. A paridade é conferida no build.
- `docs/RASTREABILIDADE.md` ganha uma parte nova, "Versão em inglês", com uma tabela por página:

| Bloco en | Título en | Bloco pt | Palavras pt → en | Escolhas de tradução |
|---|---|---|---|---|

- Seção nova **"Escolhas de tradução"**, uma linha por escolha, cada uma aprovada como decisão:

| # | Página, bloco | Trecho em português | Trecho em inglês | Tipo | Por quê | Decisão |
|---|---|---|---|---|---|---|
| TE1 | cap5, B1 | "A Assembleia da República tem de aprová-la" | "The Assembly of the Republic, Portugal's parliament, must approve it" | Explicação para leitor estrangeiro | O leitor americano não sabe que é o parlamento | Dxx |

  Tipos: **explicação** (definição curta de termo, instituição ou documento local; sem fato
  novo); **expressão** (idiomatismo que, literal, mudaria o sentido: "bater o martelo", "bola de
  neve", "cortina de fumaça", "massa de manobra"); **termo fora do glossário** (só se o glossário
  não servir no contexto, com aprovação). Dividir ou juntar frases não entra na lista.
- Candidatas a explicação já previstas (propostas com o trecho exato na página delas): Assembleia
  da República; Câmara dos Deputados; R$ (moeda); título de eleitor; Portal de Opinião Pública e
  Fundação Francisco Manuel dos Santos (nomes mantidos em português). **R$ já decidido:** "R$3.51"
  com a explicação "Brazilian reais" (TE no cap. 1, B7; forma exata proposta na página); nenhum
  valor é convertido para outra moeda. Freguesia, Estatuto da
  Cidade, plano diretor, Lei de Acesso à Informação, cláusula de barreira e comissões provisórias
  já vêm definidos no texto aprovado e não precisam de acréscimo.

---

## e) Rascunho do glossário e dos rótulos (para aprovar antes de qualquer arquivo)

### 1. Regras de estilo
| Regra | Proposta |
|---|---|
| Ortografia | Americana (-ize, center, labor, favor, nongovernmental) |
| Maiúsculas em títulos | **Sentence case** em títulos, rótulos e título do site, como no português. Exceção: a tradução do título da tese, em title case (decisão 4) |
| Vírgula serial | **Sim** ("democracy, citizenship, and participation") |
| Aspas | Duplas curvas; ponto e vírgula **dentro** das aspas, padrão americano |
| Contrações | Permitidas onde soam naturais ("isn't", "doesn't"); ajudam a linguagem simples |
| "O cidadão" genérico | **"citizens"** (plural) por padrão; singular só quando a frase pede uma pessoa ("a citizen who...") |
| Números | Algarismos onde o português usa algarismos; por extenso onde o português usa extenso. 72.4%, 0.22%, 1,473,063, 60,000 |
| Datas | November 18, 2022; November 2018; "between 2003 and 2011"; "from 1975 to 2019" |
| Séculos | 19th century; 21st century; 4th century BC |
| Moedas | R$3.51, com a explicação "Brazilian reais" (escolha de tradução); 150 to 750 euros; $5.50 (dólar americano). **Nunca converter valor para outra moeda** |
| Estado | **"the State"**, com maiúscula, para não confundir com os estados americanos; "state" minúsculo só para estado de federação ("five states", "the state of California") |

### 2. Título do site e da tese
| Português | Opção A | Opção B | Recomendo |
|---|---|---|---|
| Revigorar, não substituir | Revitalize, not replace | Reinvigorate, not replace | **A, aprovada (A1).** "Revigorar" vira "revitalize" em todo o site |
| Título da tese | Active Citizenship and Governance from the Perspective of Comparative Electoral Law | — | Fixado pela decisão 4, sempre marcado como tradução |
| Tese de doutorado | doctoral dissertation | — | Fixado pela decisão 3 |

### 3. Termos sem equivalente direto (duas opções e uma recomendação)
| Português | Opção A | Opção B | Recomendo e por quê |
|---|---|---|---|
| freguesia | parish | *freguesia*, mantido | **A**. É o termo dos textos em inglês sobre Portugal, e o texto aprovado já define ("a menor divisão do poder local") |
| assembleia de freguesia | parish assembly | parish council | **A**, literal e coerente com "parish" |
| ação popular | popular action | citizen lawsuit | **B**. "Popular action" é opaco para leigo; o texto já explica o que é |
| iniciativa popular | popular initiative | citizens' initiative | **B**. Mais claro; a definição do texto evita a confusão com a iniciativa americana que vai direto à urna |
| consulta popular | popular consultation | public vote | **B**. "Popular vote" seria falso cognato (contagem nacional de votos nos EUA) |
| título de eleitor | voter registration card | voter ID card | **A**. Descreve o documento sem sugerir identificação na hora do voto |
| Assembleia da República | Assembly of the Republic | Portugal's parliament | **A**, nome oficial, com explicação curta na primeira aparição (TE) |
| Justiça Eleitoral | Electoral Justice | electoral courts | **B**. "Electoral Justice" não diz nada a um americano; é um ramo do Judiciário |
| Lei de Acesso à Informação | Access to Information Law | freedom of information law | **A**, nome usado pelo próprio governo brasileiro; o texto já explica para que serve |
| Estatuto da Cidade | City Statute | Statute of the City | **A**, forma usual em inglês; o texto já explica |
| plano diretor | master plan | city master plan | **A**; o texto já diz "que define como a cidade cresce" |
| comissões provisórias | provisional committees | temporary committees | **A**. "Provisional" carrega a ironia do texto ("provisória" que vira permanente); "direção provisória" = "provisional leadership" |
| orçamento participativo | participatory budgeting | participatory budget | **A**, termo consagrado em inglês |
| Revigorar, não substituir | ver seção 2 | | |
| cláusula de barreira | electoral threshold | barrier clause | **A**, termo usual |
| crime de responsabilidade | impeachable offense | crime of responsibility | **A** |
| salvadores da pátria | saviors of the nation | national saviors | **A**, entre aspas como no original |
| aventuras políticas / populistas | political adventures | political adventurism | **B**, idiomático |
| versão de divulgação | outreach version | a version for the general public | **B**, linguagem simples |
| governante(s) | leader(s) | those who govern | **A**, curto; o contexto separa do "líder" populista |
| deputado | deputy | representative | **A**. "Representative" colide com "representantes" no sentido geral |
| Ciências Jurídico-Políticas | Legal and Political Sciences | Legal-Political Sciences | **A, proposta. Não conferida em fonte oficial**, marcada assim no glossário até o autor confirmar |
| Doutor em Direito | PhD in Law | Doctor of Laws | **A**. "Doctor of Laws" nos EUA costuma ser título honorário |
| Faculdade de Direito da Universidade de Lisboa | University of Lisbon School of Law | — | **Decidido (A8):** nome usado nas páginas em inglês do site da Faculdade. Na ficha, "Faculdade de Direito da Universidade de Lisboa (University of Lisbon School of Law)"; "University of Lisbon" no texto corrido |

### 4. Termos fixos (uma opção)
| Português | Inglês |
|---|---|
| democracia representativa / direta / participativa / deliberativa / digital / semidireta | representative / direct / participatory / deliberative / digital / semi-direct democracy |
| cidadania ativa | active citizenship |
| identificação patriótica | patriotic identification |
| governança centrada no governo / nos cidadãos | government-centered / citizen-centered governance |
| fragmentação política | political fragmentation |
| círculo vicioso / virtuoso | vicious / virtuous circle |
| oligarquização | oligarchization (o texto já explica) |
| democracia partidária; partidos de massa; notáveis | party democracy; mass parties; notables |
| tirania da maioria; regras do jogo | tyranny of the majority; rules of the game |
| freios e contrapesos | checks and balances |
| mandato imperativo | imperative mandate (o texto já explica) |
| referendo; plebiscito; petição; recall; impeachment | referendum; plebiscite; petition; recall; impeachment |
| poder público | public authorities |
| poder local | local government |
| eleito(s) (substantivo); eleitor; eleitorado; eleitores inscritos | elected official(s); voter; electorate; registered voters |
| filiado; direção (de partido); convenção | party member; leadership; party convention |
| abstenção; voto em branco; voto nulo | abstention; blank vote; spoiled ballot (A3) |
| lista fechada / aberta | closed list / open list |
| fundo partidário; tempo gratuito de rádio e TV | party fund; free radio and TV airtime |
| concurso público | civil service exam |
| financiadores de campanha; grupos de pressão; sindicatos; ONGs | campaign donors; pressure groups; labor unions; nongovernmental organizations |
| ir à Justiça; Poder Judiciário | go to court; Judiciary |
| Congresso Nacional; Câmara dos Deputados; Senado | National Congress; Chamber of Deputies; Senate |
| Tribunal Superior Eleitoral | Superior Electoral Court |
| Tribunal Constitucional; Presidente da República | Constitutional Court; President of the Republic |
| Câmara (municipal); vereador; prefeito; lei orgânica municipal | city council; city council member; mayor; municipal charter |
| audiência pública; sessão extraordinária; organizações de moradores | public hearing; special session; residents' organizations |
| legislatura | legislative term |
| Executivo federal | federal executive branch |
| aviso de intenção (recall) | notice of intention |
| Declaração dos Direitos do Homem e do Cidadão | Declaration of the Rights of Man and of the Citizen |
| Primeira Guerra Mundial; período militar | World War I; military rule |
| RGPD | GDPR |
| Parlamento Europeu; Itália; Lisboa; Califórnia | European Parliament; Italy; Lisbon; California |
| passagem de ônibus | bus fare |
| reunião do condomínio | condo association meeting |
| saneamento básico | water and sewage services |
| linguagem simples | plain language |
| Latinobarómetro; Portal de Opinião Pública; Fundação Francisco Manuel dos Santos; CAPES | Mantidos como estão (nomes próprios) |
| "nós contra eles"; "um de nós" | "us versus them"; "one of us" |

### 5. Títulos das páginas e rotas
| Página | Título em inglês | Rota |
|---|---|---|
| home (título do site e h1) | Revitalize, not replace | `/en/` |
| home, subtítulo (T12) | Democracy, citizenship, and participation in Portugal and Brazil | — |
| Capítulo 1 | On paper, everything is fine | `/en/chapters/1-on-paper/` |
| Capítulo 2 | What isn't working | `/en/chapters/2-what-isnt-working/` |
| Capítulo 3 | The shortcut that doesn't fix it (aprovado, A1) | `/en/chapters/3-the-digital-shortcut/` |
| Capítulo 4 | Citizens at the center | `/en/chapters/4-citizens-at-the-center/` |
| Capítulo 5 | The tools that already exist (and one that's missing) | `/en/chapters/5-the-tools/` |
| Sobre a tese | About the dissertation | `/en/about/` |
| 404 | Page not found | `/en/404/` |

### 6. Títulos originais dos capítulos e referências
- **Títulos na tese:** o original em português aparece com `lang="pt-BR"`, seguido da tradução
  marcada (T52), como na decisão 4. Traduções:
  1. The conceptual and normative construction of democracy and citizenship in Portugal and Brazil
  2. The dysfunctions of representative democracy in the 21st century
  3. Digital democracy as a false solution to the dysfunctions of representative democracy
  4. Revaluing representative democracy by giving citizens a central position in the legal and political process
  5. Civic participation as a boost to representative democracy
- **Ficha ("About"):** Title = original + linha "Translation: Active Citizenship and Governance
  from the Perspective of Comparative Electoral Law". Institution = "Faculdade de Direito da
  Universidade de Lisboa (University of Lisbon School of Law)". Degree = "PhD in Law,
  specialization in Legal and Political Sciences" (especialidade não conferida em fonte oficial).
  Advisor = Professor Jorge Miranda. Funding =
  "CAPES, a foundation of Brazil's Ministry of Education (grant BEX 1791/15-0; support from 2015 to
  2018)". Defense date = November 18, 2022.
- **ABNT:** idêntico ao português (norma brasileira), com `lang="pt-BR"`. O "Acesso em" copiado
  usa os meses em português (T48 não é traduzido).
- **APA:** `Silva, M. P. (2022). Cidadania ativa e governança sob a perspectiva do direito eleitoral comparado [Active citizenship and governance from the perspective of comparative electoral law] [Doctoral dissertation, Universidade de Lisboa]. Repositório da Universidade de Lisboa. https://hdl.handle.net/10451/57093`.
  A tradução vai em sentence case, como o APA pede; só o original fica em itálico. Universidade e
  repositório com o nome original.
- **BibTeX (A7):** título original, `type = {Doctoral dissertation in Law (Legal and Political
  Sciences)}`, o resto como está.

### 7. Rótulos T1 a T52 em inglês
| # | Português | Inglês |
|---|---|---|
| T1 | Pular para o conteúdo | Skip to content |
| T2 | Menu | Menu |
| T3 | Início | Home |
| T4 | Capítulo {n} | Chapter {n} |
| T5 | Leia o capítulo {n}: {titulo} | Read chapter {n}: {titulo} |
| T6 | Partidos · Governo · Congresso Nacional | Parties · Government · National Congress |
| T7 | Portugal · Brasil | Portugal · Brazil |
| T8 | O cidadão se afasta · Os partidos se fecham · Fragmentação política / Sentir-se parte da comunidade · Cidadania ativa · Partidos mais abertos | Citizens pull away · Parties close themselves off · Political fragmentation / Feeling part of the community · Active citizenship · More open parties. **Os negritos da home (B4, B6) usam as mesmas palavras** |
| T9 | Página não encontrada | Page not found |
| T10 | Voltar ao início | Back to home |
| T11 | {titulo} · Matheus Passos Silva / {titulo} · Revigorar, não substituir | {titulo} · Matheus Passos Silva / {titulo} · Revitalize, not replace |
| T12 | (subtítulo da home) | Democracy, citizenship, and participation in Portugal and Brazil |
| T13 | Título na tese | Title in the dissertation |
| T14 / T15 | Anterior / A seguir | Previous / Next |
| T16 | Continue a leitura | Keep reading |
| T17 | (regra: 1º parágrafo do B0) | Mesma regra, sobre o B0 em inglês |
| T18 | Súdito · Governo representativo · Democracia representativa | Subject · Representative government · Representative democracy |
| T21 | Escolha a instituição | Choose an institution |
| T22 | Poder Judiciário · Tribunal Superior Eleitoral · Partidos políticos | Judiciary · Superior Electoral Court · Political parties |
| T23 | Muita confiança · Um pouco de confiança · Pouca confiança · Nenhuma confiança · Não sei responder · Não quero responder | A lot of trust · Some trust · Little trust · No trust at all · Don't know · Prefer not to answer. **"No trust at all" é também o termo do texto do cap. 2, B4** |
| T24 | Fonte: Latinobarómetro. Pergunta: "Quanta confiança…?" Entrevistas: … | Source: Latinobarómetro. Question: "How much trust do you have in this institution?" Interviews: 1,204 (2006), 1,204 (2010), and 1,200 (2017). A pergunta é a mesma frase do cap. 2, B4 |
| T25 | Ver os números em tabela | See the numbers in a table |
| T26 | Resposta / {instituicao}, em % | Answer / {instituicao}, in % |
| T27 | círculo · quadrado · triângulo · losango | circle · square · triangle · diamond |
| T28 | Toque no que você curtiria… | Tap what you would like and see what the screen starts to show. |
| T29 | Curtir: {forma} | Like: {forma} |
| T30 | Tipos de cartão na tela: {n} de 4 | Card types on screen: {n} of 4 |
| T31 / T32 | Mostrar o que deixou de aparecer / Recomeçar | Show what stopped appearing / Start over |
| T33 | Imagine 30 mil pessoas num estádio… | Imagine 30,000 people in a stadium, with no microphone, all with the right to propose laws and give their opinion. Discussing a single proposal would already be hard. |
| T34 | Modelo de governança / Centrada no governo · Centrada nos cidadãos | Governance model / Government-centered · Citizen-centered |
| T35 | Cidadãos | Citizens |
| T36 | O cidadão fica de fora das cinco etapas. / O cidadão pode entrar em qualquer uma das cinco etapas. | Citizens are left out of all five stages. / Citizens can take part in any of the five stages. |
| T37 | (caminho do referendo) | Portugal: Citizens gather 60,000 signatures · The Assembly of the Republic approves · The Constitutional Court reviews · The President of the Republic calls it or refuses · Vote: binding only if more than half of registered voters take part. Brazil: Only the National Congress calls it |
| T38 | Referendo · Iniciativa popular · Petição · Ação popular · Recall | Referendum · Citizens' initiative · Petition · Citizen lawsuit · Recall |
| T39 | Como funciona · Quanto foi usado | How it works · How much it was used |
| T40 | Referendo, PT, como | Citizens can propose one, with 60,000 signatures, but the Assembly, the Constitutional Court, and the President can block it. |
| T40 | Referendo, PT, uso | 8 referendums from 1975 to 2019: 3 national and 5 local. |
| T40 | Referendo, BR, como | Only the National Congress calls it. Citizens cannot propose one. |
| T40 | Referendo, BR, uso | 5 public votes from 1988 to 2019: 2 national and 3 local. |
| T40 | Iniciativa, PT, como / uso | 20,000 signatures, which can be sent online. / 9 initiatives from 2003 to 2019; 4 became law. |
| T40 | Iniciativa, BR, como | 1% of the electorate in at least 5 states: 1,473,063 signatures, based on the 2018 electorate, all on paper. |
| T40 | Iniciativa, BR, uso | 4 federal laws from 1988 to 2019; formally, none as a citizens' initiative. |
| T40 | Petição, PT, como / uso | A right of political participation, with its own law. Gives the right to a reply. / Have signed one: 5.4% (2003 to 2011) and 21% (2016). |
| T40 | Petição, BR, como / uso | An individual right, with no law of its own. Gives the right to a reply. / Say they have signed one: 25.4% (2015). |
| T40 | Ação popular, PT / BR | A right of political participation. / An individual right; follows a 1965 law. |
| T41 | Não existe. | Does not exist. |
| T42 | Ver o exemplo da Califórnia / tentativas · chegaram às urnas · tiraram o eleito do cargo / Califórnia, cargos estaduais, de {de} a {ate} | See the California example / attempts · made it to the ballot · removed the official from office / California, state offices, {de} to {ate} |
| T43 a T46 | Copiar / Copiar a referência {formato} / Copiado / Referência {formato} copiada. | Copy / Copy the {formato} reference / Copied / {formato} reference copied. |
| T47 | Não deu para copiar… | Couldn't copy. The text is now selected: use Ctrl+C (or Cmd+C on a Mac). |
| T48 | jan. … dez. | **Não traduzido** (só serve ao ABNT, que fica em português) |
| T49 | Textos e imagens sob licença CC BY-NC-ND 4.0. Código sob licença MIT. | Texts and images under the CC BY-NC-ND 4.0 license. Code under the MIT license. (link para `deed.en`) |
| **T50 (novo)** | Idioma (nome acessível do seletor, **entra nas páginas em português**) | Language |
| **T51 (novo)** | Português · English | Português · English (igual nos dois) |
| **T52 (novo)** | — | Translation (marca da tradução do título da tese e dos títulos dos capítulos) |

Texto aprovado para "About" (A6; decisão 9), no fim do B1, depois da linha das ilustrações:
"This English version was translated from the Portuguese with the help of artificial
intelligence and reviewed by the author." Origem: decisão do autor, não tradução (como D37 e D83).

---

## f) Etapas (parada para aprovação ao fim de cada uma; PR por etapa e, na 3, por página)

**Etapa 1. Decisões, glossário e plano (só documentos).**
- `docs/DECISOES.md`: D85 a D93 com as nove decisões deste pedido (19/11/2026), e uma decisão por
  escolha aprovada do glossário (estilo, título do site, termos da seção 3, T50 a T52, lugar do
  seletor, capturas da versão em inglês).
- `docs/GLOSSARIO-EN.md` (o rascunho acima, depois das suas correções), `docs/PLANO-INGLES.md`.
- `CLAUDE.md`: tira "nada é traduzido agora" e o próximo passo da D82/D83 (o PR #17 e o #18 já
  entraram), põe o estado e o próximo passo da frente em inglês e acrescenta os arquivos novos ao mapa.
- PR para a `main`.

**Etapa 2a. Só refatoração, chave desligada (PR e parada).**
- Idioma em `t`, `lista` e `mapa`; locale nos formatadores (`numeros.ts`, `rotulos.mjs`,
  `home-resto.ts`, `conferir-dados.mjs`, `conferir-texto.mjs`), com `pt-BR` como padrão.
- `src/lib/idiomas.mjs` (só a entrada do português preenchida e a estrutura pronta);
  `paginas.ts` com idioma; corpo de `index.astro` e `sobre.astro` como componentes;
  `src/lib/ancoras.ts` só com os valores em português.
- Trava do `dados.json` no `conferir-dados.mjs` (impressão da `main` sem só `frases_en` e `frase_en`).
- `scripts/comparar-builds.mjs` com a prova completa contra o build da `main`: HTML normalizado
  idêntico, texto idêntico, capturas das 7 páginas e da 404 idênticas pixel a pixel nas 3
  larguras, e lista justificada de cada pacote de `/_astro/` que mudou.
- **Fora desta etapa:** nenhum arquivo em inglês, nenhum seletor, nenhuma rota `/en/`, nenhuma
  mudança no workflow.

**Etapa 2b. Estrutura bilíngue, chave desligada (PR e parada).**
- `en.json` com os rótulos aprovados; `idiomas.mjs` com a entrada do inglês; chave
  `INGLES_PUBLICADO`; seletor; rota `/en/`; 404 em inglês; `dist/en/.htaccess`; `hreflang`,
  `og:locale` e sitemap condicionados à chave.
- `conferir-paridade.mjs`, `conferir-texto.mjs` por idioma, `conferir-publicacao.mjs` e
  `conferir-terceiros.mjs` ajustados; `legibilidade_en.py` com o CMU; método do Flesch-Kincaid em
  `docs/LEGIBILIDADE.md`.
- Workflow com dois builds em PR e trava da chave no Actions.
- Prova de novo com `comparar-builds.mjs`: com a chave desligada, o português continua idêntico
  ao da `main`. Com `INGLES=1`, só a 404 em inglês existe; seletor e `hreflang` não aparecem
  porque nenhuma página tem par. A prova da chave ligada começa na primeira página da Etapa 3.

**Etapa 3. Tradução, uma página por vez:** home, capítulos 1 a 5, "About". Para cada página:
- Tradução a partir do `.md` aprovado em português; `frases_en` no `dados.json`; âncoras em
  `ancoras.ts`.
- Legibilidade (FKGL, FRE, palavras, frases longas, palavras fora do CMU) em
  `docs/LEGIBILIDADE.md`; contagem de "the dissertation" (máximo de cinco, D15); rastreabilidade e
  escolhas de tradução propostas com o trecho exato; build com `INGLES=1` e sem; prova da chave
  ligada (só seletor e `hreflang` mudam no português); capturas nas 3 larguras x 3 cenários, axe,
  Lighthouse; relatório.
- Enquanto faltarem páginas, links para páginas ainda não traduzidas levam à página em português
  (com `lang` e `hreflang`), só nos builds de pré-visualização; nada vai ao ar.
- Depois da aprovação: decisões registradas, PR da página.

**Etapa 4. Lançamento.**
- PR que muda `INGLES_PUBLICADO` para `true`. O build passa a exigir as 7 páginas com par.
- Depois do seu merge: `versao.txt` com o novo commit; `NODE_USE_ENV_PROXY=1 npm run
  conferir:publicado` passando nas 14 páginas, `hreflang`, sitemap e 404 em inglês; Lighthouse no
  ar nas 14; `docs/PUBLICACAO.md` e `CLAUDE.md` atualizados. Uma linha no README sobre a versão em
  inglês só com texto aprovado por você.

---

## g) Riscos e pontos em aberto

**Riscos**
1. **Identidade byte a byte só vale para o HTML normalizado.** Os pacotes de `/_astro/` mudam de
   hash (seção c). Se você exigir pacotes idênticos, a solução seria duplicar o script da home
   para o inglês, o que eu não recomendo.
2. **Paridade de estrutura amarra a tradução:** mesmo número de parágrafos, itens e negritos por
   bloco. Em algum trecho o inglês pode pedir outra divisão; se acontecer, paro e proponho.
3. **Sílabas fora do CMU:** nomes portugueses e brasileiros caem nas regras e podem errar. O
   relatório mostra quantas e quais; o índice continua sendo conferência, não meta.
4. **`.htaccess` de subpasta no LiteSpeed:** a 404 em inglês depende de a Hostinger honrar o
   `ErrorDocument` em `dist/en/.htaccess`. Só dá para provar no ar (Etapa 4). Se falhar, a 404 em
   português continua respondendo, e eu proponho outra saída.
5. **Cabeçalho apertado** com o seletor entre 1024 e 1280 px; conferido nas capturas da Etapa 2b.
6. **Falsos cognatos** ("popular vote", "initiative", "state", "representative") já tratados no
   glossário; a revisão por página continua atenta a eles.
7. **CI mais longo** com dois builds em PR (cerca do dobro do tempo atual, dentro do limite de 20 min).
8. **"Legal and Political Sciences"** continua sem conferência em fonte oficial.
9. **Dependência Python nova** (`cmudict`): só para a medição local, fora do build e do site.

**Decididos pelo autor (19/11/2026), registrados na Etapa 1:** A1 "Revitalize, not replace" e
"The shortcut that doesn't fix it"; A2 sentence case e vírgula serial; A3 recomendações da seção
3, com "spoiled ballot" para voto nulo; A4 seletor no menu abaixo de 1024 px, no cabeçalho a partir
de 1024 px e sempre no rodapé; A5 capturas pelo critério da D49/D56 em `docs/capturas/ingles/`;
A6 texto da linha de "About"; A7 BibTeX com `type` em inglês; A8 "University of Lisbon School of
Law".

**Ponto em aberto:** confirmação de "Legal and Political Sciences" pelo autor.

---

## Verificação (resumo)
- `npm run build` (chave desligada e com `INGLES=1`): todas as conferências, inclusive paridade,
  dados em inglês e publicação.
- `node scripts/comparar-builds.mjs` contra o build da `main`: idêntico com a chave desligada;
  só seletor e `hreflang` com a chave ligada.
- `npm run capturas` e `npm run lighthouse` nas 14 páginas mais as duas 404.
- `python3 scripts/legibilidade_en.py src/content/en/<pagina>.md` em cada página.
- Depois do lançamento: `versao.txt` e `NODE_USE_ENV_PROXY=1 npm run conferir:publicado`.
