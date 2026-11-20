# Relatório de legibilidade

O índice é conferência, não meta (CLAUDE.md). Nenhum trecho deve ser piorado para melhorar o
número. Medição com `python3 scripts/legibilidade.py ARQUIVO.md`.

## Método

**Índice:** Flesch adaptado ao português do Brasil por Martins, Ghiraldelo, Nunes e Oliveira
Jr. (*Readability formulas applied to textbooks in Brazilian Portuguese*, Notas do ICMSC-USP,
1996).

```
IFL = 248,835 − 1,015 × (palavras por frase) − 84,6 × (sílabas por palavra)
```

A constante é a do Flesch original em inglês (206,835) mais 42 pontos: os autores observaram
que textos em português pontuavam, em média, 42 pontos a menos que textos em inglês.

**Faixas de leitura:**

| Índice | Faixa | Escolaridade associada (sistema antigo / atual) |
|---|---|---|
| 75–100 | Muito fácil | 1ª a 4ª série / 1º ao 5º ano |
| 50–75 | Fácil | 5ª a 8ª série / 6º ao 9º ano |
| 25–50 | Difícil | ensino médio e superior |
| 0–25 | Muito difícil | textos acadêmicos especializados |

Leitor-alvo do site: 8º ou 9º ano. **Referência de conferência, definida pelo autor: índice de
50 ou mais** (faixa "fácil"), com média de até 20 palavras por frase.

**Grau de confirmação (17/11/2026).** A fórmula (constante 248,835 e coeficientes 1,015 e
84,6), a autoria, o ano e a origem dos 42 pontos foram confirmados em mais de uma fonte
secundária: dissertação da UnB (repositório UnB), texto para discussão do Senado Federal
(TD 357), artigo de Contabilidade Vista & Revista (UFMG) e registro bibliográfico da USP
(bdpi.usp.br, item 000906089). O relatório original de 1996 não pôde ser aberto: a rede desta
sessão bloqueia repositorio.usp.br. Uma fonte secundária reproduz a constante como 164,835;
é variante isolada e incoerente com a explicação dos 42 pontos, por isso foi descartada.
**As séries escolares de cada faixa não foram conferidas no original.** As fontes consultadas
confirmam as quatro faixas e os rótulos; a correspondência com as séries segue o uso corrente
e deve ser conferida no relatório de 1996 antes de ser citada publicamente.

**Limites da medição.**
- Sílabas contadas por regras (`scripts/legibilidade.py`). Acerta a divisão escolar nas
  palavras testadas, mas erra em alguns hiatos e ditongos raros. Para o total de uma página,
  o desvio é pequeno.
- Números contam como uma palavra de duas sílabas.
- Ficam de fora títulos, comentários HTML (que marcam a origem dos blocos), blocos de código
  e tabelas.
- O índice só vê tamanho de frase e de palavra. Não mede ordem das ideias, termos técnicos
  sem explicação nem voz passiva; isso é conferido na revisão.

## Método do inglês (D89)

Medição com `python3 scripts/legibilidade_en.py ARQUIVO.md`, num ambiente com as dependências de
`scripts/requirements-legibilidade.txt` (`cmudict==1.1.3` e as dependências dele, todas fixadas):

```bash
python3 -m venv .venv-legibilidade
```

```bash
.venv-legibilidade/bin/pip install -r scripts/requirements-legibilidade.txt
```

**Índices.** Flesch-Kincaid Grade Level (Kincaid et al., 1975) e, ao lado, Flesch Reading Ease
(Flesch, 1948), nas formas usuais:

```
FKGL = 0,39 × (palavras por frase) + 11,8 × (sílabas por palavra) − 15,59
FRE  = 206,835 − 1,015 × (palavras por frase) − 84,6 × (sílabas por palavra)
```

**Referência de conferência: FKGL 8 ou menos** (8º ano americano, perto do leitor-alvo do
português). É conferência, não meta: não piorar o texto para melhorar o número. **A D16
(tamanho de 1.200 a 1.800 palavras) não vale para o inglês**: o tamanho é o que a tradução fiel
der. As fórmulas foram conferidas pelo teste do próprio script (`--teste`, com um texto contado à
mão), não nas publicações originais.

**Sílabas.** Pelo dicionário de pronúncia CMU (pacote `cmudict`): conta as vogais da primeira
pronúncia de cada palavra. Possessivo e contração com apóstrofo reto ou curvo são procurados como
estão e, se não houver, sem o "'s". Palavras fora do dicionário (nomes portugueses e brasileiros,
siglas) caem numa regra simples (grupos de vogais, com o "e" mudo final), e **o relatório informa
quantas palavras e qual percentual caíram na regra, com a lista**. Números contam como uma palavra
de duas sílabas, como no português.

**Recorte.** O mesmo do script em português (o script em inglês importa as funções dele): o índice
usa só o texto corrido, cada item de lista conta como uma frase, e ficam de fora o cabeçalho YAML,
títulos, comentários HTML, blocos de código e tabelas. O tamanho conta todo o texto visível.

**"The dissertation".** O relatório conta as ocorrências no texto visível, com o máximo de cinco
por página (D15), e marca a página que passar.

**Conferência do script.** `python3 scripts/legibilidade_en.py --teste` confere as sílabas de nove
palavras no CMU, os dois índices de um texto contado à mão (9 palavras, 2 frases, 9 sílabas: FKGL
−2,035; FRE 117,6675), a regra de uma palavra fora do CMU e a contagem de "the dissertation".

**Licença do `cmudict`:** GPL-3.0-or-later. É instalado à parte, só para medir; nada dele é
copiado para o repositório, o build ou o site.

## Resultados por página

| Página | Palavras visíveis | Palavras no texto corrido | Frases | Palavras/frase | Sílabas/palavra | Índice | Faixa |
|---|---|---|---|---|---|---|---|
| Home | 1.770 | 1.585 | 149 | 10,6 | 2,08 | 62,1 | fácil |
| Capítulo 1 | 1.680 | 1.488 | 129 | 11,5 | 2,07 | 61,9 | fácil |
| Capítulo 2 | 1.797 | 1.714 | 157 | 10,9 | 2,05 | 63,9 | fácil |
| Capítulo 3 | 1.794 | 1.615 | 144 | 11,2 | 2,12 | 58,2 | fácil |
| Capítulo 4 | 1.791 | 1.725 | 151 | 11,4 | 2,11 | 58,9 | fácil |
| Capítulo 5 | 1.800 | 1.703 | 143 | 11,9 | 2,12 | 57,8 | fácil |
| Sobre a tese | 464 | 362 | 28 | 12,9 | 2,15 | 53,4 | fácil |

### Home (17/11/2026)

**Resultado (versão aprovada, após os ajustes do autor):** índice 62,1, acima da referência de
50. Média de 10,6 palavras por frase (limite: 20). Maior frase: 25 palavras. Tamanho dentro do alvo do plano (1.500 a 1.800 palavras).

**Histórico da medição.** Versão enviada para aprovação: 1.792 palavras, índice 62,6. Os ajustes
do autor (menos menções a "a tese", nome do autor na abertura, dois rótulos da tabela) levaram
a 1.770 palavras e índice 62,1. A primeira versão tinha 2.135 palavras visíveis e índice 61,6. O
índice já estava na faixa; o corte foi feito por tamanho, não por legibilidade. Na mesma rodada,
o script foi corrigido: ele somava uma lista inteira como uma frase de 65 palavras. Agora cada
item de lista conta como uma frase.

**Remedição após a D46 (17/11/2026).** Na lista das quatro ferramentas (bloco B7), o termo virou
título com inicial maiúscula e sem dois-pontos, e cada descrição passou a começar com maiúscula e
terminar com ponto final. Nenhuma palavra mudou. Resultado igual: 1.770 palavras, 149 frases,
índice 62,1 (cada item de lista já contava como uma frase).

**Conferência manual (o que o índice não mede).**
- Termos técnicos explicados na primeira ocorrência: democracia representativa, constituição,
  fragmentação política, democracia digital, populismo, identificação patriótica, cidadania
  ativa, políticas públicas, governança centrada nos cidadãos, freguesia, referendo, iniciativa
  popular, petição, ação popular, recall. Latinobarómetro e Portal de Opinião Pública aparecem
  como fontes.
- Rótulos da tabela dos sete problemas reescritos para leigos, com sentido conferido em 3.2
  (ver Rastreabilidade, item 18).
- Voz ativa predominante. Passivas que ficaram: "parte dos pedidos foi atendida" e "o cidadão é
  ouvido, mas não decide". As duas estão mantidas porque o sujeito (o poder público) é óbvio.
- Sem latim, sem notas de rodapé, sem número de lei ou de artigo.
- Nenhum nome de governante, partido ou caso concreto (D6). Ver ponto A6 sobre a cena de 2013.

### Capítulo 1 (17/11/2026)

**Resultado (versão aprovada, com o ajuste da D22):** índice 61,9, acima da referência de 50.
Média de 11,5 palavras por frase (limite: 20). Maior frase: 25 palavras; nenhuma acima de 25.
Tamanho: 1.680 palavras visíveis, dentro da faixa de 1.200 a 1.800 por página de capítulo (D16).

**Nova medição (17/11/2026, D22).** A frase sobre Atenas foi trocada ("todo cidadão tinha de
tomar parte" → "os cidadãos podiam tomar parte diretamente"). O tamanho não mudou (1.680
palavras visíveis); o índice passou de 62,1 para 61,9, porque "diretamente" é palavra longa.

**Histórico da medição.** Primeira versão: 1.946 palavras, índice 60,1, três frases acima de 25
palavras. Os cortes foram feitos por tamanho, não por legibilidade: causas da expansão do voto
condensadas, partidos de massa em uma frase, idades do voto brasileiro só no quadro, cassação de
direitos políticos retirada. As três frases longas foram divididas. A versão enviada estava
acima do alvo antigo do plano (1.200 a 1.400); o autor manteve o tamanho e eliminou o teto do
site inteiro (D16).

**Conferência manual (o que o índice não mede).**
- Termos técnicos explicados na primeira ocorrência: democracia representativa, governo
  representativo, notáveis, democracia partidária, partidos de massa, tirania da maioria,
  referendo, petição, ação popular, cidadania em sentido amplo e restrito, constituição,
  freguesia, iniciativa popular, cláusula de barreira, fundo partidário, lista fechada e
  aberta. "Plebiscito" é explicado no quadro.
- Voz ativa predominante. Passivas que ficaram: "são eleitos" (regras 1 e 2 e quadro), por
  serem a forma natural de falar de eleição.
- Sem latim, sem notas de rodapé, sem número de lei ou de artigo. As duas citações literais
  (constituição portuguesa e brasileira) são curtas e em linguagem comum.
- Nenhum nome de governante, partido ou caso concreto (D6). Nenhum nome de autor citado pela
  tese.
- "A tese" aparece duas vezes (D15).

### Capítulo 2 (17/11/2026)

**Resultado (versão aprovada sem ajustes de texto):** índice 63,9, acima da referência de 50. Média de
10,9 palavras por frase (limite: 20). Maior frase: 23 palavras; nenhuma acima de 25. Tamanho:
1.797 palavras visíveis, dentro da faixa de 1.200 a 1.800 por página de capítulo (D16), mas
perto do teto.

**Histórico da medição.** Primeira versão: 2.092 palavras, índice 66,1, uma frase de 27 palavras.
Os cortes foram feitos por tamanho, não por legibilidade: picos de confiança em Portugal, dois dos
quatro motivos para não votar nas europeias, abstenção brasileira de 1998, a frase dos "três em
cada quatro" sobre os partidos e várias frases de transição. Na revisão de fidelidade, algumas
frases ganharam palavras (base dos 59%, punições só no Brasil, "podem" nos acordos entre
partidos). O índice caiu de 66,1 para 63,9 com os cortes, porque saíram frases curtas de ligação.

**Conferência manual (o que o índice não mede).**
- Termos técnicos explicados na primeira ocorrência: abstenção, oligarquização, fragmentação
  política, bem comum, voto válido (pelo exemplo). Latinobarómetro e Portal de Opinião Pública
  aparecem como fontes, com uma linha de explicação para o primeiro. "Tribunal Superior Eleitoral"
  aparece só no quadro e é retomado como "Justiça Eleitoral".
- Os termos "apatia", "abulia", "acracia", "cartelização", "democracia de audiência" (só no
  título "A política virou audiência"), "concorrencial" e "comunitarista" não aparecem: as ideias
  são explicadas por situações.
- Voz ativa predominante. Passivas que ficaram: "pode ser lido como protesto" e "são ouvidos de
  verdade" (o sujeito é óbvio). "Vota-se na pessoa" é sujeito indeterminado, natural em português.
- Sem latim, sem notas de rodapé, sem número de lei ou de artigo.
- Nenhum nome de governante, partido ou caso concreto (D6). Nenhum nome de autor citado pela
  tese. "Salvadores da pátria" vem com a ressalva de que existem de qualquer lado.
- "A tese" aparece duas vezes (D15); "para o autor", uma.

### Capítulo 3 (17/11/2026)

**Resultado (versão aprovada sem ajustes de texto):** índice 58,2, acima da referência de 50. Média de
11,2 palavras por frase (limite: 20). Maior frase: 24 palavras; nenhuma acima de 25. Tamanho:
1.794 palavras visíveis, dentro da faixa de 1.200 a 1.800 por página de capítulo (D16), perto do
teto.

**Histórico da medição.** Primeira versão: 2.343 palavras, índice 58,4, duas frases de 27
palavras. Os cortes foram feitos por tamanho, não por legibilidade: a imagem do estádio, a
reeleição sem limite em Atenas, o reconhecimento internacional de Porto Alegre, parte das
promessas digitais, a checagem de notícias, a interferência estrangeira em eleições, o exemplo
hipotético do diário oficial e a promessa populista de "democratizar a democracia". Na revisão
de fidelidade, algumas frases ganharam palavras ("supostamente", "quase nunca diz com clareza",
"não são só líderes"). O índice é mais baixo que o dos capítulos 1 e 2 (cerca de 62 a 64)
porque o tema pede palavras longas que não têm substituto simples: democracia, representação,
participativa, deliberativa, inteligência artificial, institucionais.

**Conferência manual (o que o índice não mede).**
- Termos técnicos explicados na primeira ocorrência: democracia digital, magistrado (pela
  função), democracia participativa, orçamento participativo, democracia deliberativa, algoritmo,
  tirania da maioria (por exemplo e definição), fragmentação (retomada do capítulo 2), populismo
  (por traços). "Magistrado" é explicado como quem cuidava da administração, para não confundir
  com juiz.
- Os termos "corporativismo", "refeudalização", "espaço vazio", "não-povo", "democracia
  iliberal" e "identificação patriótica" não aparecem: as ideias são explicadas por situações.
- Voz ativa predominante. Passivas que ficaram: "eram sorteadas", "eram eleitos" e "é vista",
  formas naturais de falar de escolha de cargos; "se decide" e "se disputa" são sujeito
  indeterminado.
- Sem latim, sem notas de rodapé, sem número de lei ou de artigo. "Século IV antes de Cristo"
  por extenso, sem a abreviação.
- Nenhum nome de governante, partido ou caso concreto (D6). Nenhum nome de autor citado pela
  tese nem de plataforma ou empresa. Esquerda e direita aparecem sempre juntas (bolha;
  populismo).
- "A tese" aparece quatro vezes (D15).

### Capítulo 4 (17/11/2026)

**Resultado (versão aprovada, após o ajuste do autor):** índice 58,9, acima da referência de 50.
Média de 11,4 palavras por frase (limite: 20). Maior frase: 25 palavras (a da constituição
italiana); nenhuma acima de 25. Tamanho: 1.791 palavras visíveis, dentro da faixa de 1.200 a 1.800
por página de capítulo (D16), perto do teto.

**Histórico da medição.** Versão enviada para aprovação: 1.797 palavras, índice 58,8. O ajuste do
autor (retirar a contagem 89 x 11 e refazer a frase sobre Portugal, D27) levou a 1.791 palavras e
índice 58,9. Na Fase 4, a mudança só de pontuação e maiúsculas nas cinco etapas do B3 (D65) foi
remedida: igual (1.791 palavras, 151 frases, índice 58,9). Primeira versão: 2.475 palavras, índice 56,4, quatro frases acima de 25
palavras (a maior, de 36). Os cortes foram feitos por tamanho, não por legibilidade (ver
Rastreabilidade, capítulo 4, item 35). Na revisão de fidelidade, sete frases foram ajustadas para
não dizer mais que o original (itens 5, 12, 18, 23 e 32), o que acrescentou algumas palavras,
compensadas com cortes de redundância. O índice fica perto do capítulo 3 (58,2) pelo mesmo motivo:
o tema pede palavras longas sem substituto simples (participação, constituição, governança,
descentralização, extraordinária, representação).

**Conferência manual (o que o índice não mede).**
- Termos técnicos explicados na primeira ocorrência: identificação patriótica, freguesia, políticas
  públicas, governança, governança centrada no governo e nos cidadãos (por contraste), as cinco
  etapas, descentralização (por "lá"/"aqui"), plano diretor, lei básica do município, comissões
  provisórias (como direções provisórias). Petição e iniciativa popular aparecem descritas, sem o
  nome, porque são o assunto do capítulo 5. "RGPD" aparece como "regulamento europeu" de proteção de
  dados.
- Ficam sem nome técnico: comunitarismo, liberalismo procedimental, subsidiariedade, plenário de
  cidadãos eleitores, oligarquização (já explicada no capítulo 2), autoisolamento.
- Voz ativa predominante. Passivas que ficaram: "foi desenhada" (abertura, sem agente a nomear),
  "é votada" e "são indicados, não eleitos", formas naturais para regras de votação e escolha de
  cargos; "se decide" é sujeito indeterminado.
- Sem latim, sem notas de rodapé, sem número de lei ou de artigo. A lei portuguesa aparece só pelo
  ano (2013).
- Nenhum nome de governante, partido ou caso concreto (D6). Nenhum nome de autor citado pela tese.
  A Itália aparece como país, pela constituição; o RGPD, como norma.
- "A tese" aparece três vezes (D15).

### Capítulo 5 (17/11/2026)

**Resultado (versão aprovada, após o ajuste do autor):** índice 57,8, acima da referência de 50.
Média de 11,9 palavras por frase (limite: 20). Maior frase: 25 palavras; nenhuma acima de 25.
Tamanho: 1.800 palavras visíveis, no teto da faixa de 1.200 a 1.800 por página de capítulo (D16).

**Ajuste do autor (D32).** "Em 2019, eram 1.473.063 assinaturas" passou a "Com base no eleitorado
de 2018, eram 1.473.063 assinaturas" (+4 palavras); "espalhado por pelo menos cinco estados" passou
a "em pelo menos cinco estados" (−1). Versão enviada para aprovação: 1.797 palavras, índice 57,8.
O índice não mudou.

**Histórico da medição.** Primeira versão: 2.179 palavras, índice 58,5, três frases acima de 25
palavras (a maior, de 28). Os cortes foram feitos por tamanho (ver Rastreabilidade, capítulo 5, item
38). Na revisão de fidelidade, algumas frases foram ajustadas para não dizer mais nem menos que o
original (itens 8, 13, 18, 21, 22, 25, 30, 34 e 36), o que custou meio ponto de índice. O índice é o
mais baixo do site até aqui, pelo mesmo motivo dos capítulos 3 e 4: o tema pede palavras longas sem
substituto simples (constituição, participação, assinaturas, representativa, responsabilidade,
legitimidade).

**Conferência manual (o que o índice não mede).**
- Termos técnicos explicados na primeira ocorrência: democracia semidireta (por "além do voto"),
  referendo, iniciativa popular, petição, ação popular, Lei de Acesso à Informação, recall,
  impeachment (por contraste), aviso de intenção (pela descrição), mandato imperativo, orçamento
  participativo (pelo contexto, já explicado no capítulo 3), freios e contrapesos (pelo contexto).
- Ficam sem nome técnico: plebiscito (a distinção já está no capítulo 1), controle preventivo de
  constitucionalidade ("controle prévio"), comissão representativa, poliarquia, princípios liberal e
  democrático da democracia.
- Voz ativa predominante. Passivas que ficaram: "nenhuma lei foi aprovada" e "os textos podem ser
  desfigurados", formas naturais para descrever o trâmite sem nomear quem age;
  "diz-se" é sujeito indeterminado.
- Sem latim, sem notas de rodapé, sem número de lei ou de artigo. As leis aparecem só pelo ano (a lei
  brasileira da ação popular, de 1965; a Lei de Acesso à Informação, de 2011).
- Nenhum nome de governante, partido ou caso concreto (D6). Nenhum nome de autor citado pela tese.
  A Califórnia e a Suíça aparecem como lugares onde o recall existe; o recall de 2003 saiu.
- "A tese" aparece duas vezes (D15).
- Tabela de petições por legislatura: fora do índice, dentro da contagem de palavras.

### Sobre a tese (17/11/2026)

**Resultado (versão aprovada, após o ajuste do autor):** índice 54,4, acima da referência de 50. Média de 12,7
palavras por frase (limite: 20). Maior frase: 24 palavras; nenhuma acima de 25. Tamanho: 446
palavras visíveis, dentro do alvo do plano para esta página (350 a 500). A D16 trata só das páginas
de capítulo.

**Ajuste do autor (D38).** Links de hdl.handle.net passaram de http para https. Tamanho e índice não
mudaram: o endereço não entra na contagem, e as citações ficam em blocos de código.

**Nova medição (18/11/2026, D83).** O autor aprovou uma frase nova no fim do parágrafo sobre o uso
de inteligência artificial (bloco B1): "As ilustrações também foram geradas com inteligência
artificial, a partir de instruções do autor, e revisadas por ele." (18 palavras). Nenhuma outra
palavra mudou.

| Trecho | Palavras visíveis | Palavras no texto corrido | Frases | Palavras/frase | Sílabas/palavra | Índice |
|---|---|---|---|---|---|---|
| Bloco B1, antes | 104 | 94 | 6 | 15,7 | 2,11 | 54,7 |
| Bloco B1, depois | 122 | 112 | 7 | 16,0 | 2,14 | 51,3 |
| Página, antes | 446 | 344 | 27 | 12,7 | 2,15 | 54,4 |
| Página, depois | 464 | 362 | 28 | 12,9 | 2,15 | 53,4 |

O bloco foi medido isolado (do comentário `B1` ao `B2`), com o mesmo script. Os dois continuam na
faixa "fácil", acima da referência de 50. A queda vem das palavras longas da frase (ilustrações,
inteligência artificial, instruções), sem substituto simples. Maior frase da página: 24 palavras;
nenhuma acima de 25. Tamanho dentro do alvo da página (350 a 500 palavras).

**O que entra na medição.** A ficha é tabela: conta no tamanho, fica fora do índice. As três
referências (ABNT, APA, BibTeX) estão em blocos de código: ficam fora do tamanho e do índice, porque
seguem norma de citação, não linguagem simples.

**Histórico da medição.** Primeira versão: 421 palavras, índice 53,1, duas frases acima de 25
palavras (32 e 29). As duas foram divididas. A abertura ganhou a explicação de democracia
representativa, e a agenda de pesquisa, a de democracia direta. Na revisão de fidelidade, a agenda
passou a falar em "estudar formas de" (os eixos são temas de estudo, não metas), e a frase sobre a
interdisciplinaridade perdeu um "como" que sugeria relação de causa que o original não faz. O índice
é o mais baixo do site: o tema da página pede palavras longas sem substituto (universidade,
democracia, representativa, participação, inteligência artificial), e o texto corrido é curto, o que
dá mais peso a cada uma.

**Conferência manual (o que o índice não mede).**
- Termos técnicos explicados na primeira ocorrência: democracia representativa, democracia direta.
  "Versão de divulgação" é explicada pela frase seguinte.
- Ficam sem nome técnico: método dedutivo, monográfico, tipológico e estatístico; doutrina;
  jurisprudência ("decisões judiciais"); accountability ("prestar contas").
- Voz ativa predominante. Passiva que ficou: "foram adaptados [...] e revisados pelo autor", forma
  natural para dizer quem revisou; "foram geradas [...] e revisadas por ele" (D83), que repete essa
  forma de propósito; "não foram atualizados" (B5), sem agente a nomear.
- Sem latim, sem notas de rodapé, sem número de lei ou de artigo. O número do processo CAPES está
  só na ficha.
- Nenhum nome de governante, partido ou caso concreto (D6). Nenhum nome de autor citado pela tese.
  Nomes próprios só na ficha (autor, orientador, instituições).
- "A tese" aparece três vezes no corpo (D15).


## Resultados da versão em inglês (D89)

Medição com `python3 scripts/legibilidade_en.py` (CMU, `cmudict` fixado), num ambiente virtual fora
do repositório. Referência de conferência: FKGL 8 ou menos; FRE ao lado. A D16 (tamanho) não vale
para o inglês.

| Página | Palavras visíveis | Palavras no texto corrido | Frases | Palavras/frase | Sílabas/palavra | FKGL | FRE | Fora do CMU | "the dissertation" |
|---|---|---|---|---|---|---|---|---|---|
| Home | 1.842 | 1.652 | 149 | 11,1 | 1,62 | 7,9 | 58,4 | 40 (2,4%) | 4 |
| Capítulo 1 | 1.735 | 1.539 | 129 | 11,9 | 1,64 | 8,4 | 56,0 | 21 (1,4%) | 2 |
| Capítulo 2 | 1.850 | 1.776 | 157 | 11,3 | 1,58 | 7,5 | 61,4 | 51 (2,9%) | 2 |
| Capítulo 3 | 1.861 | 1.678 | 144 | 11,7 | 1,65 | 8,4 | 55,6 | 22 (1,3%) | 4 |
| Capítulo 4 | 1.928 | 1.856 | 151 | 12,3 | 1,65 | 8,7 | 54,8 | 21 (1,1%) | 3 |

### Home em inglês (20/11/2026)

`src/content/en/home.md`, tradução aprovada com TE1 a TE8 (D110). **FKGL 7,9**, dentro da referência
de 8 ou menos; **FRE 58,4**. O português da mesma página tem 1.770 palavras visíveis; o inglês, 1.842
(a tradução fiel dá o tamanho, D89).

**Palavras fora do CMU (sílabas por regra):** 40, 2,4% do texto corrido. Quase todas são números
(anos e percentuais, que contam como duas sílabas, como no português) e nomes em português
(Fundação, Latinobarómetro, Opinião, Passos, Pública, São). Nenhuma palavra comum do inglês caiu na
regra.

**Frases longas:** uma acima de 25 palavras, no B6 (28 palavras): "If they realize that harm to the
others ends up coming back to hurt them, they look for a solution that is good enough for all of
them." É a frase do exemplo das cinco pessoas, na forma ajustada pelo autor; não foi dividida, porque
dividir não é ajuste de texto aprovado.

**"The dissertation":** 4 pela contagem do script (B4, B5, B6 e o link do B9), mais "the doctoral
dissertation" no B0, que o script não conta: as mesmas cinco menções de "a tese" no português (D15).

**Estimativa do plano x medição:** a estimativa à mão, com regra simples de sílabas, deu FKGL perto
de 7,5 e FRE perto de 60; o CMU conta um pouco mais de sílabas (1,62 por palavra, contra 1,59).

### Capítulo 1 em inglês (20/11/2026)

`src/content/en/capitulo-1.md`, tradução aprovada com TE9 a TE18 e a revisão do autor (D112).
**FKGL 8,4**, um pouco acima da referência de 8 ou menos; **FRE 56,0**. Em relação à home (7,9), as
frases são um pouco mais longas (11,9 palavras, contra 11,1) e as palavras também (1,64 sílaba,
contra 1,62), com o vocabulário do capítulo (representative, constitution, democracy,
organization); as duas coisas somam. O índice é conferência, não meta: o texto aprovado não foi
simplificado para baixar o número. O
português da mesma página tem 1.680 palavras visíveis; o inglês, 1.735.

**Palavras fora do CMU (sílabas por regra):** 21, 1,4% do texto corrido. São números (anos, idades,
percentuais e o valor da multa, que contam como duas sílabas) e "reais".

**Frases longas:** nenhuma acima de 25 palavras. A maior tem 25, no B7 ("In 2006, a change to the
constitution let parties form different alliances in each race, …").

**"The dissertation":** 2 (B3 e B9), as mesmas duas menções de "a tese" no português (D15). "Para o
autor" (B7) virou "In the author's view". Na página, o rótulo T13 ("Title in the dissertation")
aparece fora do texto, como "Título na tese" no português.

**Estimativa do plano x medição:** a estimativa à mão, com regra simples de sílabas, deu FKGL entre
8,0 e 8,4 e FRE entre 56 e 59; a medição ficou no topo da faixa (8,4 e 56,0), porque o CMU conta mais
sílabas que a regra (1,64 contra 1,61).

### Capítulo 2 em inglês (20/11/2026)

`src/content/en/capitulo-2.md`, tradução aprovada com TE19 a TE24 e a revisão do autor (D114).
**FKGL 7,5**, dentro da referência de 8 ou menos; **FRE 61,4**. Frases tão curtas quanto as do
português (as mesmas 157 frases, 11,3 palavras por frase) e palavras mais curtas que as do capítulo 1
(1,58 sílaba, contra 1,64). O português da mesma página tem 1.797 palavras visíveis; o inglês, 1.850.

**Palavras fora do CMU (sílabas por regra):** 51, 2,9% do texto corrido. São números (anos e
percentuais, que contam como duas sílabas), nomes em português (Fundação, Latinobarómetro, Opinião,
Pública) e "oligarchization", que o texto já explica.

**Frases longas:** nenhuma acima de 25 palavras. A maior tem 24, no B6 ("It is up to citizens to
seek information, …" e "The way out is to give participation a positive meaning, …").

**"The dissertation":** 2 (B1 e B10), as mesmas duas menções de "a tese" no português (D15). "Para o
autor" (B7) virou "In the author's view".

**Estimativa do plano x medição:** a estimativa com regra simples de sílabas deu FKGL perto de 7,7 e
FRE perto de 60; aqui o CMU contou menos sílabas que a regra (1,58 contra 1,60), e a medição ficou
abaixo da estimativa.

### Capítulo 3 em inglês (20/11/2026)

`src/content/en/capitulo-3.md`, tradução aprovada com TE25 a TE33 e a revisão do autor (D117).
**FKGL 8,4**, um pouco acima da referência de 8 ou menos, como o capítulo 1; **FRE 55,6**. As frases
são curtas (as mesmas 144 do português, 11,7 palavras por frase), mas as palavras são longas (1,65
sílaba), com o vocabulário do capítulo (democracy, participation, representation, deliberative,
bureaucracy); o português da mesma página já é o de índice mais baixo entre os capítulos 1 a 3 (58,2).
O índice é conferência, não meta (D89): o texto aprovado não foi simplificado para baixar o número. O
português tem 1.794 palavras visíveis; o inglês, 1.861.

**Palavras fora do CMU (sílabas por regra):** 22, 1,3% do texto corrido. São números (anos,
percentuais, idades e o valor em dólares, que contam como duas sílabas) e "livestreams".

**Frases longas:** nenhuma acima de 25 palavras. A maior tem 25, no B0 ("In the face of a tired
democracy, a chorus is growing: …").

**"The dissertation":** 4 (B3, B9, B10 e B11), as mesmas quatro menções de "a tese" no português (D15).

**Estimativa do plano x medição:** a estimativa com regra simples de sílabas deu FKGL 8,6 (esperado com o
CMU, de 8,3 a 8,5) e FRE 54,3; a medição ficou dentro da faixa esperada (8,4 e 55,6).

### Capítulo 4 em inglês (20/11/2026)

`src/content/en/capitulo-4.md`, tradução aprovada com TE34 a TE42 e a revisão do autor (D119).
**FKGL 8,7**, acima da referência de 8 ou menos, como os capítulos 1 e 3; **FRE 54,8**. As frases são
um pouco mais longas que as dos capítulos anteriores (151 frases, 12,3 palavras por frase) e o
vocabulário é o do capítulo (citizenship, participation, governance, decentralization,
representation); o português da mesma página tem índice 58,9. O índice é conferência, não meta
(D89): o texto aprovado não foi simplificado para baixar o número. O português tem 1.791 palavras
visíveis; o inglês, 1.928.

**Palavras fora do CMU (sílabas por regra):** 21, 1,1% do texto corrido. São números (anos,
percentuais, quantidades), que contam como duas sílabas, e "GDPR".

**Frases longas:** uma acima de 25 palavras, no B2 (28 palavras): "If they realize that harm to the
others ends up coming back to hurt them, they look for a solution that is good enough for all of
them." É idêntica à frase da home (B6), por decisão do autor (D119). Depois dela, a maior tem 23.

**"The dissertation":** 3 (B7, B9 e B10), as mesmas três menções de "a tese" no português (D15).

**Estimativa do plano x medição:** a estimativa só com a regra de sílabas deu FKGL 8,95 (esperado com
o CMU, de 8,7 a 8,8) e FRE 52,8 (esperado de 54 a 54,5); a medição ficou dentro e um pouco acima da
faixa esperada (8,7 e 54,8).
