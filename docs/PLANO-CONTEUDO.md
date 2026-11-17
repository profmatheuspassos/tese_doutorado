# Plano de conteúdo do site

Site de divulgação da tese **"Cidadania Ativa e Governança sob a perspectiva do Direito
Eleitoral comparado"** (Matheus Passos Silva, FDUL, 2022; orientador: Prof. Doutor Jorge
Miranda). Este plano resulta da leitura integral da tese e orienta a Fase 2 (reescrita).

Referências de seção (ex.: "2.1", "4.2.1") apontam para a tese. As notas de leitura
detalhadas ficam em `docs/notas-leitura/`. As decisões do autor sobre os pontos da seção 5
estão em `docs/DECISOES.md`.

---

## 1. O argumento em 10 linhas

1. Portugal e Brasil têm, no papel, tudo o que a teoria exige de uma democracia: eleições
   livres, partidos, liberdades, separação de poderes.
2. Na prática, a participação do cidadão ficou reduzida a votar de tempos em tempos, e a
   cidadania virou sinônimo de ter direito a voto.
3. Os sinais de desgaste aparecem nos números: pouca confiança nas instituições e entre as
   pessoas, abstenção alta, votos brancos e nulos.
4. Os partidos, que deveriam ligar cidadão e poder, fecharam-se: poucos decidem, a base não
   participa, e os partidos só procuram o eleitor em época de eleição.
5. Tudo isso se alimenta em círculo e produz a "fragmentação política": as pessoas deixam de
   se ver como parte de um todo e de acreditar que podem construir algo em comum.
6. A saída mais anunciada, a "democracia digital" (decidir tudo direto, pelo celular), não
   resolve: esbarra em acesso, desinformação e bolhas, e abre espaço ao populismo.
7. A tese propõe outro caminho, que não troca a democracia representativa por outra coisa:
   quer revigorá-la mudando quem está no centro, do governo para o cidadão.
8. O primeiro passo é reconstruir o vínculo entre as pessoas e a comunidade onde vivem (a
   "identificação patriótica"), por estímulo das instituições e por interesse racional, não
   por altruísmo.
9. Sobre esse vínculo se apoia a "cidadania ativa": o cidadão decide, junto com os outros e
   com o poder público, políticas do lugar onde mora, e responde pelo resultado. Isso também
   pressiona os partidos a se abrirem.
10. Referendo, iniciativa popular, petição e ação popular existem, mas são pouco usados e
    dependem demais dos eleitos; a tese sugere reforçá-los e adotar o recall, sempre como
    complemento. A evidência das petições mostra que, quando há canal e escuta, as pessoas
    participam.

**Frase-síntese para o site:** revigorar, não substituir.

---

## 2. Estrutura do site

Mantenho a estrutura proposta, com três ajustes que a leitura pediu.

| # | Página | Rota | Origem na tese | Palavras (alvo) |
|---|---|---|---|---|
| 0 | Home — o argumento inteiro em scroll | `/` | Introdução, sínteses dos caps. 1–5, Considerações finais | 1.500–1.800 |
| 1 | No papel, está tudo certo | `/capitulos/1-no-papel/` | Cap. 1 | 1.200–1.400 |
| 2 | O que não está funcionando | `/capitulos/2-o-que-nao-funciona/` | Cap. 2 | 1.500–1.800 |
| 3 | O atalho que não resolve | `/capitulos/3-o-atalho-digital/` | Cap. 3 | 1.400–1.700 |
| 4 | O cidadão no centro | `/capitulos/4-o-cidadao-no-centro/` | Cap. 4 | 1.500–1.800 |
| 5 | As ferramentas que já existem (e uma que falta) | `/capitulos/5-as-ferramentas/` | Cap. 5 | 1.500–1.800 |
| 6 | Sobre a tese | `/sobre/` | Pré-textuais, metodologia, agenda de pesquisa | 350–500 |

Total previsto: 8.950–10.800 no teto; o alvo de trabalho é **cerca de 9.300 palavras**,
dentro do limite de 8 a 10 mil.

Os títulos das páginas são propostas em linguagem simples; cada página traz também o título
original do capítulo, em tamanho menor.

**Ajustes em relação à proposta inicial**

1. **A Introdução e as Considerações finais não viram páginas.** A Introdução abre a home (o
   problema e a pergunta) e as Considerações finais a encerram (o que a tese conclui). É onde
   esse material rende mais.
2. **A tabela dos "sete problemas" atravessa o site.** O cap. 3 pergunta se a democracia
   digital resolve sete problemas apontados à democracia representativa (resposta: não); as
   Considerações finais retomam os mesmos sete e dizem como a cidadania ativa responde. É o
   melhor fio condutor da tese e vai para a home como elemento interativo.
3. **O círculo vicioso do cap. 2 e o círculo virtuoso do cap. 4 são o mesmo diagrama em dois
   estados.** A tese não desenha isso, mas descreve os dois ciclos com os mesmos elementos
   (cidadão, partidos, vínculo social). Um só componente, usado nas duas páginas e na home.

**Preparação para o inglês:** conteúdo em `src/content/pt-br/`; rótulos de interface em
arquivo de strings; dados numéricos em JSON separado do texto, para não duplicar na tradução.

---

## 3. Conteúdo por página

### 3.0 Home

Conta o argumento em oito blocos de scroll. Cada bloco tem uma ideia, um elemento visual e
um link para a página que aprofunda.

| Bloco | Ideia | Elemento | Origem |
|---|---|---|---|
| Abertura | Título, uma frase, "revigorar, não substituir" | Tipografia grande; motivo ramo/semente | Resumo |
| 1. Uma cena | Junho de 2013 no Brasil: protestos contra o aumento da passagem conseguem resultado. Isso basta para dizer que a democracia funciona? | Texto fixo que muda com o scroll | Introdução |
| 2. No papel | Portugal e Brasil cumprem as regras do jogo | Checklist que se completa | 1.1, 1.2 |
| 3. Na prática | A confiança despenca | Um número grande e o gráfico-resumo dos Quadros 1–5 | 2.1 |
| 4. O círculo | Desinteresse, partidos fechados, fragmentação | Diagrama do círculo vicioso | 2.1–2.3 |
| 5. O atalho | "Vamos decidir tudo pelo celular" e por que não resolve | Pares promessa/problema | 3.1–3.3 |
| 6. A proposta | Cidadão no centro: vínculo, cidadania ativa, partidos abertos | O círculo gira ao contrário; Portugal (ramos) e Brasil (sementes) | 4.1–4.3 |
| 7. As ferramentas | Cinco instrumentos, dois países | Prévia dos cartões | 5.1–5.4 |
| 8. O que a tese conclui | As pessoas participam quando há canal e escuta; os sete problemas; sem fórmula mágica | Tabela dos sete problemas | Considerações finais, 5.3 |
| Rodapé | Como citar, link para "Sobre" | — | — |

**Entra:** a cena de 2013 (sem nomes de pessoas ou partidos); a diferença entre democracia
"formal" e "de fato"; a ideia de que a tese não pede mais Estado, e sim outro papel para o
cidadão; as conclusões.

**Fica de fora:** metodologia; debate com os autores; dados de gastos de campanha de 2018
(dizem respeito a candidatos específicos).

### 3.1 Capítulo 1 — No papel, está tudo certo

**Papel na história:** montar a régua. O que se entende por democracia representativa e por
cidadania, e a conferência de que Portugal e Brasil cumprem os requisitos.

**Entra**
- De súdito a cidadão: governo representativo (poucos votavam; elegiam-se os "notáveis") e a
  passagem para a democracia representativa (voto universal, partidos). (1.1)
- Por que os partidos se tornaram a peça central. (1.1)
- Maioria é um critério de contagem, não de verdade; a maioria de hoje pode ser a minoria de
  amanhã. Semear aqui a ideia de "tirania da maioria". (1.1)
- As "regras do jogo" (nove regras) e a ideia de que um governo democrático precisa responder
  aos cidadãos. (1.1)
- Cidadania em sentido amplo e em sentido restrito, com o exemplo da tese: aos 15 anos se é
  cidadão num sentido e ainda não no outro. (1.1, nota 98)
- Comparação lado a lado das duas constituições e leis eleitorais. (1.2)
- A constituição portuguesa é mais explícita que a brasileira sobre participação e igualdade
  real; fala em direitos "cívicos" e trata o voto como direito e dever cívico. (1.2)
- Fecho: os dois países são democracias "no papel"; isso se confirma no dia a dia? (fim de 1.2)

**Fica de fora:** histórico das revisões constitucionais portuguesas; inelegibilidades;
detalhe dos sistemas eleitorais cargo a cargo; tipologia completa de Dahl; discussão sobre
direito fundamental formal e material; regras sobre militares e fidelidade partidária.

**Elemento interativo próprio:** *checklist das regras do jogo* — nove regras; o leitor toca
em cada uma e vê como Portugal e Brasil a cumprem; ao final, a pergunta que leva ao cap. 2.

**Outros visuais:** linha do tempo curta (súdito → governo representativo → democracia
representativa); cartões Portugal x Brasil:

| Tema | Portugal | Brasil |
|---|---|---|
| Voto | Direito e dever cívico; comparecer é facultativo | Obrigatório dos 18 aos 70; facultativo aos 16–17, acima de 70 e para analfabetos |
| Lista para o parlamento | Fechada (vota-se no partido) | Aberta (vota-se no candidato) |
| Quem pode apresentar candidatos | Partidos; nas eleições locais, também grupos de cidadãos | Só partidos; filiação obrigatória |
| Cláusula de barreira | Proibida pela constituição | Criada em 2017, com aplicação gradual até 2030 |
| Referendo | Vinculativo se votar mais de metade dos inscritos | Maioria simples; plebiscito antes do ato, referendo depois |
| Calendário | Presidencial e legislativa não coincidem | Eleições gerais simultâneas |

### 3.2 Capítulo 2 — O que não está funcionando

**Papel na história:** o diagnóstico. Três problemas que se alimentam.

**Entra**
- Participar não é o mesmo que se envolver; o eleitor que vota "em qualquer um". (2.1)
- Participação vai além do voto: a reunião de pais na escola e a reunião de condomínio também
  contam. (2.1)
- Três degraus de participação: estar presente, ativar-se, decidir. A maioria fica no
  primeiro. (2.1)
- **Os números da confiança no Brasil (Quadros 1–5)** e a confiança entre as pessoas. (2.1)
- Os números de Portugal: confiança no governo, no parlamento e nos partidos; abstenção nas
  legislativas e nas europeias; motivos declarados para não votar. (2.1)
- Abstenção, brancos e nulos nos dois países; a diferença de forma do protesto (abstenção em
  Portugal, branco e nulo no Brasil). (2.1)
- O exemplo dos três eleitores: uma eleição legalmente perfeita e democraticamente vazia. (2.1)
- Por que as pessoas deixam de participar: não veem canal; tentaram e nada mudou; não sabem
  como funciona. (2.1) — explicado por situações, sem os termos técnicos.
- Partidos sem democracia interna: a lei portuguesa exige, a brasileira não; mesmo em
  Portugal a prática fica aquém. Poucos decidem programa e candidatos. (2.2)
- A política virou "audiência": vota-se na pessoa, não no programa; surgem os "salvadores da
  pátria" (de qualquer lado). (2.2)
- Fragmentação política: cada um por si; a representação vira conta numérica. (2.3)
- "Bem comum" não é bondade: é saber que hoje decido e amanhã sou afetado pela decisão de
  outro. (2.3)
- Duas maneiras de ver a democracia: só como método de escolher governo, ou como construção
  em comum. As duas constituições ficam mais perto da primeira. (2.3)

**Fica de fora:** filósofos contratualistas; detalhe artigo por artigo das leis partidárias;
as quatro condições de Schumpeter; números de 1998 por cargo; volatilidade eleitoral; o
exemplo da Rússia e as menções nominais a políticos e partidos (notas 217, 237, 269).

**Elemento interativo próprio:** *Explorador da confiança (Quadros 1–5)* — seletor de
instituição (Congresso, Governo, Judiciário, TSE, Partidos), barras empilhadas para 2006,
2010 e 2017 com transição animada, destaque em "nenhuma confiança", tabela acessível
equivalente.

**Outros visuais:** número de abertura (92,9%); gráfico de abstenção (Portugal 1999–2015,
Brasil 1998–2018); diagrama do círculo vicioso; simulação dos três eleitores (controle
deslizante de comparecimento: o vencedor continua eleito); escada dos três degraus.

### 3.3 Capítulo 3 — O atalho que não resolve

**Papel na história:** descartar a solução mais sedutora antes de apresentar a da tese.

**Entra**
- A insatisfação é mundial e alimenta a ideia de "devolver o poder ao povo". (abertura, 3.1)
- **Atenas, mito e realidade**: não era "todo mundo decide tudo"; havia sorteio, rodízio,
  prestação de contas; cerca de 20% dos cidadãos na assembleia. A diferença para hoje é
  sorteio contra eleição. (3.1)
- Por que a democracia direta não cabe em sociedades de milhões. (3.1)
- Democracia participativa (com o orçamento participativo de Porto Alegre e de Lisboa) e
  democracia deliberativa: o que trazem de bom e onde travam. A proposta da tese não se
  confunde com nenhuma das duas. (3.1)
- O que a democracia digital promete. (3.1)
- Onde falha: qualidade da informação, lógica das curtidas e da divulgação paga, bolhas (o
  exemplo da cozinha vegetariana), caixas de comentários, vigilância, banalização. (3.2)
- A barreira do acesso, com os dados de Portugal e do Brasil. (3.2)
- Os sete problemas e a resposta "não resolve". (3.2)
- O risco maior: transformar adversário em inimigo. (3.2)
- Populismo: o "povo" como ideia vaga em que cada um se vê; "nós contra eles"; o líder acima
  das regras; por que a tese o chama de degeneração da democracia. (3.3)
- Mais vezes não é melhor: votar todo dia não melhora a qualidade. O digital serve como
  complemento e para difundir cultura democrática. (3.2, fecho)

**Fica de fora:** as onze críticas em lista; fases da web em detalhe; teoria da escolha
racional; validade das normas; tipologias de "democracia autoritária"; nomes de plataformas,
empresas e governantes (notas 472, 477, 531); o caso do e-Cidadania (nota 469); a lista de
protestos por país.

**Elemento interativo próprio:** *A bolha* — o leitor escolhe o que "curtir" numa grade de
cartões neutros (o exemplo vegetariano da tese); a cada escolha a grade mostra menos
variedade, até ficar de uma cor só. Um botão revela o que deixou de aparecer.

**Outros visuais:** Atenas em números (30 mil → 6 mil → 600 por sorteio → 500 no conselho);
pares promessa/problema que viram; tabela dos sete problemas (primeira coluna de respostas);
anatomia do populismo em três peças; dados de acesso.

### 3.4 Capítulo 4 — O cidadão no centro

**Papel na história:** a proposta.

**Entra**
- Um modelo de cem anos administrando uma sociedade do século XXI. (4.1)
- Identificação patriótica em linguagem direta: sentir-se parte do lugar onde se vive e
  corresponsável por ele. O que **não** é: obrigação, altruísmo, reuniões sem fim, vontade da
  maioria a qualquer custo. (4.1)
- É racional, não moral: o exemplo das cinco pessoas. (4.1)
- Por que funciona no nível local e não no nacional. (4.1)
- O Direito molda hábitos: por um século ensinou que participar é votar. (4.1, 4.2.3)
- Cidadania tradicional (passiva) e cidadania ativa. (4.2)
- **Dois modelos de governança**: centrada no governo e centrada nos cidadãos; o ciclo de uma
  política pública em cinco etapas. (4.2)
- Responsabilidade: quem decide junto responde junto. (4.2)
- Interesse geral não é interessar-se por tudo: a iluminação da rua pesa mais que a taxa de
  câmbio. (4.2)
- "As pessoas são apáticas porque se sentem impotentes, e não o contrário." (4.2)
- Um exemplo que já existe: a constituição italiana manda o poder público favorecer a
  iniciativa autônoma dos cidadãos. (4.2)
- **Portugal: os ramos são finos e precisam ser cuidados.** O que há (constituição aberta à
  participação; freguesias pequenas que se autogovernam; cidadãos podem pedir sessão
  extraordinária) e por que é frágil (0,22% da população; presença sem voto; proposta que
  pode nem ser votada; multa de 150 a 750 euros para quem intervier fora de hora). (4.2.1)
- **Brasil: as sementes estão plantadas, mas a terra é árida.** O que há (cerca de 30 formas
  de participação na constituição; Estatuto da Cidade com orçamento participativo e
  audiências) e por que não brota (participação consultiva; nenhuma via de decisão direta; a
  decisão final fica sempre com o poder público). (4.2.2)
- Presença não é decisão. (4.2.1–4.2.3)
- O que a tese propõe: abertura na constituição; regras práticas na lei; mudança cultural,
  que depende "também" do Direito. O exemplo do RGPD. (4.2.3)
- Partidos: três razões do fechamento e três saídas; o dado das comissões provisórias no
  Brasil; o círculo virtuoso. (4.3)
- As objeções que o próprio autor reconhece. (fim de 4.3)

**Fica de fora:** o debate teórico entre liberalismo e comunitarismo; liberdade dos antigos e
dos modernos; a discussão sobre a quem pertence o mandato; leitura artigo por artigo; lista
de diretrizes do Estatuto da Cidade.

**Elemento interativo próprio:** *Quem decide o quê* — as cinco etapas de uma política local
(pauta, planejamento, decisão, execução, avaliação) com um alternador entre "governança
centrada no governo" e "centrada nos cidadãos"; as etapas acendem conforme o cidadão entra.

**Outros visuais:** o motivo ramos/sementes em tela cheia, com legendas; "presença x decisão"
(linha do tempo de uma proposta numa assembleia de freguesia); números em destaque (0,22%;
30 formas e nenhuma direta; "cidadão" aparece 89 vezes na constituição portuguesa e 11 na
brasileira; 26 de 35 partidos; 8 anos de "provisório"); círculo virtuoso.

### 3.5 Capítulo 5 — As ferramentas que já existem (e uma que falta)

**Papel na história:** testar as ferramentas e fechar o argumento.

**Entra**
- Os dois países são democracias "semidiretas": além de eleger, o cidadão tem instrumentos
  próprios. (abertura)
- **Referendo**: como funciona em cada país; depende sempre dos eleitos ("só ocorre se o
  Parlamento quiser"); quase não se usa; proposta de iniciativa cidadã com controle prévio
  do tribunal constitucional. (5.1)
- **Iniciativa popular**: 20 mil assinaturas e plataforma online em Portugal; quase 1,5
  milhão em papel no Brasil; o "apadrinhamento"; poucas leis nos dois. (5.2)
- **Petição e ação popular**: o que são; lei própria e plataforma em Portugal, canais
  dispersos no Brasil. (5.3)
- **O que as petições revelam**: crescem, são coletivas, visam o interesse comum; quem
  peticiona confia; ser ouvido pesa mais do que ser atendido. O desinteresse é pela eleição,
  não pela participação. (5.3)
- Lei de Acesso à Informação no Brasil: uso crescente, mas por parcela mínima do eleitorado;
  jovens pouco presentes. (5.3)
- **Recall**: o que é; diferença para o impeachment; como funciona na Califórnia; críticas e
  respostas; 172 tentativas, 9 votações, 6 remoções em mais de um século; proposta de adoção
  gradual e local. Não é mandato imperativo. (5.4)
- O cuidado que o autor registra: esses instrumentos também podem servir a "aventuras
  políticas"; por isso, limites legais, respeito à minoria e controle judicial. (5.5)
- Eleições seguem essenciais, mas não bastam. (5.5)
- Sem igualdade econômica e social não há democracia; regras são condição necessária, não
  suficiente. (5.6)

**Fica de fora:** tramitação passo a passo dos procedimentos; teoria do poder (fica uma
frase); requisitos processuais da ação popular; lista ano a ano dos recalls; nomes de
pessoas, partidos e projetos de lei; citações de programa de TV; o dado de participação de
2022 (ver seção 5, item 6).

**Elemento interativo próprio:** *Cartões dos instrumentos* — cinco cartões (referendo,
iniciativa popular, petição, ação popular, recall), cada um com alternador Portugal/Brasil e
campos fixos: o que é; quem pode começar; quantas assinaturas; quem decide no fim; quanto já
foi usado; o que a tese diz. No recall, o verso mostra "não existe" nos dois e abre o
exemplo da Califórnia.

**Outros visuais:** funil do referendo português; funil do recall (172 → 9 → 6) e passo a
passo; petições por legislatura (Portugal) e pedidos de informação por ano (Brasil);
comparação de escala (Brasil = 92 vezes Portugal).

### 3.6 Sobre a tese

**Entra:** ficha (título, autor, orientador, instituição, ano, grau e especialidade,
financiamento CAPES); o que este site é e o que não é; como a tese foi feita, em três frases
(primeiro o texto das leis, depois os autores; comparação Portugal–Brasil; dados de opinião e
de eleições); o que fica para pesquisas futuras, em uma frase; como citar (ABNT, APA, BibTeX,
com botão de copiar); contato; aviso de que os dados são os da tese, com o ano de cada um, e
não foram atualizados.

**Fica de fora:** agradecimentos, dedicatória, epígrafe.

---

## 4. Dados, comparações e conceitos que rendem gráfico, diagrama ou interação

Todos os valores abaixo estão na tese. No site, cada dado aparece com o ano e a fonte que a
tese cita.

### 4.1 Quadros 1 a 5 — confiança nas instituições no Brasil (2.1)

Fonte citada: Latinobarómetro. Pergunta: "Quanta confiança você tem nesta instituição?".
Entrevistas: 1.204 (2006), 1.204 (2010), 1.200 (2017). Valores em %. Conferidos contra o
original; cada coluna soma entre 99,9 e 100,1.

**Quadro 1 — Congresso Nacional**

| Resposta | 2006 | 2010 | 2017 |
|---|---|---|---|
| Muita confiança | 7,9 | 7,8 | 1,9 |
| Um pouco de confiança | 22,9 | 35,9 | 8,8 |
| Pouca confiança | 34,7 | 31,9 | 26,1 |
| Nenhuma confiança | 28,7 | 20,4 | 60,2 |
| Não sei responder | 4,2 | 3,4 | 3,0 |
| Não quero responder | 1,5 | 0,6 | 0,1 |

**Quadro 2 — Governo**

| Resposta | 2006 | 2010 | 2017 |
|---|---|---|---|
| Muita confiança | 15,9 | 13,8 | 0,8 |
| Um pouco de confiança | 31,5 | 41,2 | 7,3 |
| Pouca confiança | 34,1 | 26,7 | 25,1 |
| Nenhuma confiança | 17,6 | 16,1 | 66,1 |
| Não sei responder | 0,4 | 1,5 | 0,8 |
| Não quero responder | 0,5 | 0,7 | 0,0 |

**Quadro 3 — Poder Judiciário**

| Resposta | 2006 | 2010 | 2017 |
|---|---|---|---|
| Muita confiança | 14,2 | 11,8 | 4,5 |
| Um pouco de confiança | 30,4 | 39,3 | 22,4 |
| Pouca confiança | 35,3 | 27,5 | 32,8 |
| Nenhuma confiança | 16,8 | 17,9 | 37,2 |
| Não sei responder | 2,9 | 3,1 | 2,9 |
| Não quero responder | 0,4 | 0,5 | 0,2 |

**Quadro 4 — Tribunal Superior Eleitoral**

| Resposta | 2006 | 2010 | 2017 |
|---|---|---|---|
| Muita confiança | 27,9 | 14,3 | 5,9 |
| Um pouco de confiança | 33,9 | 37,8 | 19,4 |
| Pouca confiança | 22,9 | 26,8 | 31,2 |
| Nenhuma confiança | 10,1 | 17,9 | 40,2 |
| Não sei responder | 3,9 | 2,9 | 3,1 |
| Não quero responder | 1,2 | 0,2 | 0,1 |

**Quadro 5 — Partidos políticos**

| Resposta | 2006 | 2010 | 2017 |
|---|---|---|---|
| Muita confiança | 4,1 | 4,9 | 0,5 |
| Um pouco de confiança | 18,1 | 19,1 | 6,2 |
| Pouca confiança | 35,2 | 32,8 | 19,8 |
| Nenhuma confiança | 40,1 | 40,3 | 72,4 |
| Não sei responder | 2,1 | 2,2 | 1,1 |
| Não quero responder | 0,4 | 0,7 | 0,1 |

**Como mostrar:** barras empilhadas horizontais, uma por ano, com as quatro respostas de
confiança em escala ordenada e as duas não respostas em cinza. Na home, versão-resumo: só
"nenhuma confiança" nas cinco instituições, 2006 → 2017 (28,7 → 60,2; 17,6 → 66,1;
16,8 → 37,2; 10,1 → 40,2; 40,1 → 72,4).

### 4.2 Outros dados

| Dado | Valores | Ano / fonte na tese | Uso |
|---|---|---|---|
| Confiança entre pessoas, Brasil | 6,8% acham que se pode confiar na maioria; 92,9% que não | 2017, Latinobarómetro (5,3% em 2006; 10% em 2010) | Número de abertura, cap. 2 e home |
| Confiança entre pessoas, Portugal | 4,1 numa escala de 0 a 10 (mínimo 3,6; máximo 4,2 desde 2002) | Dez. 2018, Portal de Opinião Pública | Cap. 2 |
| Confiança no governo, Portugal | 10% (mai. 2013); 56% (mai. 2017); 43% (nov. 2018) | Portal de Opinião Pública / Eurobarómetro | Cap. 2 |
| Confiança no parlamento, Portugal | 13% (mai. 2013); 48% (mar. 2018); 37% (nov. 2018) | idem | Cap. 2 |
| Confiança nos partidos, Portugal | 17% (nov. 2018); acima de 20% em só 7 de 34 medições desde 2000 | idem | Cap. 2 |
| Abstenção, legislativas, Portugal | 36,91 (1999); 36,55 (2002); 32,80 (2005); 37,23 (2009); 37,89 (2011); 40,42 (2015) | CNE | Gráfico, cap. 2 |
| Abstenção, europeias, Portugal | 69,27% | 2019, MAI | Cap. 2 |
| Motivos para não votar nas europeias, Portugal | 59% não confiam no sistema; 54% acham que o voto não muda nada; 50% sem interesse; 46% não sabem o papel do Parlamento Europeu | Mai. 2018, Eurobarómetro 89.2 | Cap. 2 |
| Abstenção / brancos / nulos, presidente, Brasil (1º turno) | 1998: 21,49 / 8,03 / 10,67 · 2002: 17,74 / 3,03 / 7,36 · 2006: 16,77 / 6,02 / 4,50 · 2010: 22,13 / 3,42 / 6,03 · 2014: 19,39 / 3,84 / 5,80 · 2018: 20,33 / 2,65 / 6,14 | TSE | Gráfico, cap. 2 |
| Atenas | cerca de 30 mil cidadãos; quórum de 6 mil (20%); cerca de 600 de 700 magistraturas por sorteio; conselho de 500; ao menos 40 assembleias por ano | Séc. IV a.C.; Manin, Held | Cap. 3 |
| Acesso à internet | Portugal: 63,9% das pessoas de 16 a 74 anos usaram nos 3 primeiros meses de 2018 · Brasil: 74,8% viviam em domicílio com acesso em 2017; 58,3% entre os mais pobres | INE; IBGE | Cap. 3 |
| Plenário de eleitores, Portugal | 129 de 3.429 freguesias; 23.466 habitantes; 0,22% da população | Censos 2011; cálculo do autor | Cap. 4 |
| Multa por intervir em sessão | 150 a 750 euros | Lei 75/2013 | Cap. 4 |
| "Cidadão(s)" nas constituições | 89 ocorrências (Portugal); 11 (Brasil) | Contagem do autor | Cap. 4 |
| Comissões provisórias, Brasil | Em 26 de 35 partidos, mais da metade da estrutura; duração de até 8 anos | Jun. 2019, reportagem citada; lei alterada em 2019 | Cap. 4 |
| Pesquisa pós-eleição, Brasil | 36,6% não sabiam os cargos em disputa; 23% não lembravam o voto para deputado estadual; 41% não sabiam o que faz um senador | 2010, TSE | Cap. 4 |
| Referendos e consultas | Portugal: 3 nacionais e 5 locais (1975–2019) · Brasil: 2 nacionais e 3 locais (1988–2019) | CNE; TSE | Cartão, cap. 5 |
| Iniciativa popular | Portugal: 20.000 assinaturas; 9 iniciativas, 4 leis (2003–2019) · Brasil: 1.473.063 assinaturas em 5 estados; 4 leis (1988–2019) | Leis citadas; estudo citado | Cartão, cap. 5 |
| Petições ao parlamento, Portugal | 113 (2002–05); 592 (2005–09); 181 (2009–11); 552 (2011–15); 632 (2015 a jun. 2019) | Assembleia da República | Gráfico, cap. 5 |
| Quem assinou petição, Portugal | 5,4% (2003–11); 8% (2013); 14% (2014); 21% (2016) | Portal de Opinião Pública | Cap. 5 |
| Perfil das petições, Portugal | dois terços coletivas; 91,5% por interesse coletivo; 93,7% esperavam tratamento adequado; 84,3% esperavam ser ouvidos | Tese de doutorado citada (2017) | Destaque, cap. 5 e home |
| Pedidos de informação, Executivo federal, Brasil | 102.423 (2015); 111.669 (2016); 121.536 (2017); 129.309 (2018); 99,27% respondidos; 14 dias em média | e-SIC | Gráfico, cap. 5 |
| Recall na Califórnia | 172 tentativas; 9 votações; 6 remoções | 1913–2019, Secretaria de Estado | Funil, cap. 5 |
| Escala | O Brasil tem 92 vezes o tamanho de Portugal | Nota 736 | Cap. 5 |

### 4.3 Conceitos que viram diagrama

| Conceito | Forma | Onde |
|---|---|---|
| Círculo vicioso → círculo virtuoso | Anel com três nós (cidadão, partidos, vínculo social) em dois estados | Home, caps. 2 e 4 |
| Sete problemas, duas respostas | Tabela de três colunas que se revela por etapas | Home, cap. 3 |
| Regras do jogo | Checklist com dois países | Home, cap. 1 |
| Três degraus da participação | Escada | Cap. 2 |
| Dois modelos de governança e ciclo de cinco etapas | Faixa com alternador | Cap. 4 |
| Presença x decisão | Linha do tempo de uma proposta | Cap. 4 |
| Funis (referendo; recall) | Funil em etapas | Cap. 5 |
| Adversário x inimigo | Par de ilustrações | Cap. 3 |

### 4.4 Motivo visual: ramos e sementes

As duas imagens vêm dos títulos das seções 4.2.1 e 4.2.2 e serão o fio visual do site:
**ramos finos** para Portugal, **sementes em terra árida** para o Brasil. Proposta de uso:
abertura da home; divisores de seção; fundo dos cartões de cada país; cores de acento (uma
para cada país, sem bandeiras); ilustrações vetoriais animadas no cap. 4 (o ramo engrossa, a
semente brota, quando a página chega às propostas). Ver ressalva na seção 5, item 1.

---

## 5. Pontos que precisam da sua decisão

Encontrei estes pontos durante a leitura. Nenhum impede a Fase 2, mas todos mudam o texto.

> **Atualização:** os pontos 1, 2, 4, 5, 6, 11 e 12 foram decididos pelo autor; os pontos 3,
> 7, 8, 9 e 10 seguem em aberto. Ver `docs/DECISOES.md`, que prevalece sobre esta seção.

1. **As metáforas existem só nos títulos.** "Os ramos são finos e precisam ser cuidados" e
   "as sementes estão plantadas, mas a terra é árida" aparecem nos títulos de 4.2.1 e 4.2.2
   (e no sumário). O corpo dessas seções não desenvolve as imagens. Para usá-las como motivo
   do site, terei de dizer o que cada elemento representa. Leitura que o texto sustenta:
   *ramos finos* = em Portugal a abertura à participação já existe na constituição e nas leis
   locais, mas é frágil (alcança 0,22% da população, não dá voto); *sementes em terra árida*
   = no Brasil há previsões no papel, mas o ambiente legal não deixa que virem decisão.
   **Confirma essa leitura ou prefere outra?**
2. **"Queda constante" da confiança no Brasil.** O texto fala em queda constante, mas os
   Quadros mostram que, somando "muita" e "um pouco de confiança", Congresso, Governo e
   Judiciário **sobem** de 2006 para 2010 (30,8 → 43,7; 47,4 → 55,0; 44,6 → 51,1) e só
   desabam em 2017 (10,7; 8,1; 26,9). Só o TSE cai nas três medições. Proponho escrever o
   que os números mostram: queda forte entre 2010 e 2017. **De acordo?**
3. **Nome da fundação.** O corpo do cap. 2 diz "Fundação Manuel dos Santos"; as notas dizem
   "Fundação Francisco Manuel dos Santos". Uso a segunda.
4. **Consultas nacionais no Brasil.** O corpo de 5.1 diz duas (1993 e 2005); a nota 730 fala
   em três. Uso duas, como no corpo.
5. **Total de partidos no Brasil.** O cap. 1 fala em 34 registrados; o cap. 4 em "26 dos 35".
   São fontes e datas diferentes. Proponho usar só o "26 de 35", com a data (junho de 2019).
6. **Participação nas legislativas de 2022 (52,19%).** A tese cita como exemplo de aumento,
   mas a série do cap. 2 termina em 2015 com abstenção de 40,42% (participação maior). Sem o
   dado de 2019, a comparação não fecha. Proponho não usar.
7. **Dados de acesso à internet em Portugal.** A tese dá 63,9% de usuários e, na mesma frase,
   69% por rede móvel; as bases parecem diferentes. Proponho usar só os 63,9%.
8. **Número de freguesias (3.429).** É o que a tese traz. Confirme se quer manter.
9. **Occupy Wall Street** aparece datado de 2009 na lista de protestos. Como a lista inteira
   fica de fora, não afeta o site; registro para seu conhecimento.
10. **Pequenos lapsos de redação** que tratarei pelo sentido: "pelo menos 215 habitantes"
    (o contexto pede "no máximo"); "Lei 75/2003" por 75/2013; LGPD como "Lei 13.708" (a nota
    traz 13.709); "§ 1º" por § 2º na definição de referendo; as Considerações finais remetem
    ao "Capítulo 4" para a análise das petições, que está no 5.3.
11. **Nomes próprios.** Várias notas citam governantes, partidos e casos concretos. Pela sua
    regra de tom, nada disso entra. No recall de 2003 direi "um governador", sem nomes.
    **Confirma?**
12. **Ficha da tese.** A capa do arquivo traz "Documento provisório". Para a página "Sobre",
    preciso saber: há data de defesa e versão final depositada (com link do repositório da
    Universidade de Lisboa)? E que contato você quer publicar?

---

## 6. O que foi lido

Lidos por inteiro, corpo e notas de rodapé: elementos pré-textuais, Introdução (notas 1–28),
Capítulo 1 (29–170), Capítulo 2 (171–327), Capítulo 3 (328–532), Capítulo 4 (533–693),
Capítulo 5 (694–880) e Considerações finais. Total: 880 notas.

**Não lido por inteiro:** as Referências bibliográficas (`07-referencias.md`, 749 linhas).
Vi apenas o início, para conferir a conversão. É uma lista de obras e leis, sem argumento
próprio; será consultada se for preciso conferir uma fonte.
