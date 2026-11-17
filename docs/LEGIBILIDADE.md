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

## Resultados por página

| Página | Palavras visíveis | Palavras no texto corrido | Frases | Palavras/frase | Sílabas/palavra | Índice | Faixa |
|---|---|---|---|---|---|---|---|
| Home | 1.770 | 1.585 | 149 | 10,6 | 2,08 | 62,1 | fácil |
| Capítulo 1 | 1.680 | 1.488 | 129 | 11,5 | 2,07 | 62,1 | fácil |
| Capítulo 2 | 1.797 | 1.714 | 157 | 10,9 | 2,05 | 63,9 | fácil |
| Capítulo 3 | 1.794 | 1.615 | 144 | 11,2 | 2,12 | 58,2 | fácil |

### Home (17/11/2026)

**Resultado (versão aprovada, após os ajustes do autor):** índice 62,1, acima da referência de
50. Média de 10,6 palavras por frase (limite: 20). Maior frase: 25 palavras. Tamanho dentro do alvo do plano (1.500 a 1.800 palavras).

**Histórico da medição.** Versão enviada para aprovação: 1.792 palavras, índice 62,6. Os ajustes
do autor (menos menções a "a tese", nome do autor na abertura, dois rótulos da tabela) levaram
a 1.770 palavras e índice 62,1. A primeira versão tinha 2.135 palavras visíveis e índice 61,6. O
índice já estava na faixa; o corte foi feito por tamanho, não por legibilidade. Na mesma rodada,
o script foi corrigido: ele somava uma lista inteira como uma frase de 65 palavras. Agora cada
item de lista conta como uma frase.

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

**Resultado (versão aprovada sem ajustes de texto):** índice 62,1, acima da referência de 50.
Média de 11,5 palavras por frase (limite: 20). Maior frase: 25 palavras; nenhuma acima de 25.
Tamanho: 1.680 palavras visíveis, dentro da faixa de 1.200 a 1.800 por página de capítulo (D16).

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

**Resultado (versão enviada para aprovação):** índice 58,2, acima da referência de 50. Média de
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

