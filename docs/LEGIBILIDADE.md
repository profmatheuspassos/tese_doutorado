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

| Índice | Faixa | Escolaridade associada |
|---|---|---|
| 75–100 | Muito fácil | até o 5º ano (antiga 4ª série) |
| 50–75 | Fácil | até o 9º ano (antiga 8ª série) |
| 25–50 | Difícil | ensino médio e superior |
| 0–25 | Muito difícil | textos acadêmicos especializados |

Leitor-alvo do site: 8º ou 9º ano. Referência de conferência: **índice de 50 ou mais**, com
média de até 20 palavras por frase.

**Grau de confirmação (17/11/2026).** A fórmula (constante 248,835 e coeficientes 1,015 e
84,6), a autoria, o ano e a origem dos 42 pontos foram confirmados em mais de uma fonte
secundária: dissertação da UnB (repositório UnB), texto para discussão do Senado Federal
(TD 357), artigo de Contabilidade Vista & Revista (UFMG) e registro bibliográfico da USP
(bdpi.usp.br, item 000906089). O relatório original de 1996 não pôde ser aberto: a rede desta
sessão bloqueia repositorio.usp.br. Uma fonte secundária reproduz a constante como 164,835;
é variante isolada e incoerente com a explicação dos 42 pontos, por isso foi descartada.
**A tabela de escolaridade das faixas não foi confirmada nesta sessão** (as fontes
consultadas confirmam as quatro faixas e os rótulos, não a série de cada uma). Conferir no
original antes de publicar o relatório.

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

| Página | Palavras | Frases | Palavras/frase | Sílabas/palavra | Índice | Faixa |
|---|---|---|---|---|---|---|
| Home | — | — | — | — | — | — |
