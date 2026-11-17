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
| Home | 1.792 | 1.610 | 150 | 10,7 | 2,07 | 62,6 | fácil |

### Home (17/11/2026)

**Resultado:** índice 62,6, acima da referência de 50. Média de 10,7 palavras por frase (limite:
20). Maior frase: 25 palavras. Tamanho dentro do alvo do plano (1.500 a 1.800 palavras).

**Histórico da medição.** A primeira versão tinha 2.135 palavras visíveis e índice 61,6. O
índice já estava na faixa; o corte foi feito por tamanho, não por legibilidade. Na mesma rodada,
o script foi corrigido: ele somava uma lista inteira como uma frase de 65 palavras. Agora cada
item de lista conta como uma frase.

**Conferência manual (o que o índice não mede).**
- Termos técnicos explicados na primeira ocorrência: democracia representativa, constituição,
  fragmentação política, democracia digital, populismo, identificação patriótica, cidadania
  ativa, políticas públicas, governança centrada nos cidadãos, freguesia, referendo, iniciativa
  popular, petição, ação popular, recall. Latinobarómetro e Portal de Opinião Pública aparecem
  como fontes.
- Rótulos da tabela dos sete problemas reescritos para leigos (ver Rastreabilidade, item 18).
- Voz ativa predominante. Passivas que ficaram: "parte dos pedidos foi atendida" e "o cidadão é
  ouvido, mas não decide". As duas estão mantidas porque o sujeito (o poder público) é óbvio.
- Sem latim, sem notas de rodapé, sem número de lei ou de artigo.
- Nenhum nome de governante, partido ou caso concreto (D6). Ver ponto A6 sobre a cena de 2013.
