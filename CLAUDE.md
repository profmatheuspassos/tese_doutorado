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
- Tamanho: 8 a 10 mil palavras no site inteiro; cada página de capítulo entre 1.200 e 1.800.
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
| `scripts/converter.sh` | Recria `conteudo/` a partir de `fonte/` |
| `scripts/legibilidade.py` | Mede tamanho e legibilidade de uma página |
| `fonte/`, `conteudo/` | Fora do Git |

## Estado atual (17 de novembro de 2026)

- **Fase 1 concluída e aprovada.**
- **Fase 2 em andamento.** Decisões D1 a D15 registradas; nenhum ponto em aberto. Script de
  legibilidade pronto.
- **Home aprovada** (`src/content/pt-br/home.md`, 1.770 palavras, índice 62,1), com
  rastreabilidade e relatório; enviada à `main` por pull request.
- Ainda não existe código de site.

## Próximo passo

1. Em sessão nova, partindo da `main` (depois do merge da home): recriar `conteudo/` com
   `bash scripts/converter.sh`.
2. Capítulo 1, a partir da releitura integral do capítulo original. Depois, capítulos 2 a 5 e
   "Sobre a tese", uma página por vez. Para cada página: escrever, medir, rastrear, push na
   branch da sessão, parar para aprovação e, aprovada, abrir pull request para a `main`.
