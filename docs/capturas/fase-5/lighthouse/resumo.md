# Lighthouse (Fase 5)

Gerado por `npm run lighthouse` com `LIGHTHOUSE_URL=https://tese.profmatheuspassos.com.br`, no endereço publicado. Mínimo exigido: 90 em todas as categorias. A home no celular roda 5 vezes; a linha dela é a pior rodada.

| Página | Modo | Performance | Accessibility | Best Practices | SEO | Agentic Browsing | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|---|
| home | celular, pior de 5 (desempenho: 96, 100, 100, 100, 100) | 96 | 100 | 100 | 92 | 50 | 1.4 s | 0 | 220 ms |
| home | desktop | 100 | 100 | 100 | 92 | 50 | 0.3 s | 0.002 | 0 ms |
| capitulo-1 | celular | 100 | 100 | 100 | 92 | 50 | 0.9 s | 0 | 10 ms |
| capitulo-1 | desktop | 100 | 100 | 100 | 92 | 50 | 0.3 s | 0 | 0 ms |
| capitulo-2 | celular | 100 | 100 | 100 | 92 | 50 | 0.9 s | 0 | 0 ms |
| capitulo-2 | desktop | 100 | 100 | 100 | 92 | 50 | 0.3 s | 0.001 | 0 ms |
| capitulo-3 | celular | 100 | 100 | 100 | 92 | 50 | 0.9 s | 0 | 0 ms |
| capitulo-3 | desktop | 100 | 100 | 100 | 92 | 50 | 0.3 s | 0.001 | 0 ms |
| capitulo-4 | celular | 100 | 100 | 100 | 92 | 50 | 0.9 s | 0 | 0 ms |
| capitulo-4 | desktop | 100 | 100 | 100 | 92 | 50 | 0.3 s | 0 | 0 ms |
| capitulo-5 | celular | 100 | 100 | 100 | 92 | 50 | 0.9 s | 0 | 0 ms |
| capitulo-5 | desktop | 100 | 100 | 100 | 92 | 50 | 0.3 s | 0.002 | 0 ms |
| sobre | celular | 100 | 100 | 100 | 92 | 50 | 0.9 s | 0 | 0 ms |
| sobre | desktop | 100 | 100 | 100 | 92 | 50 | 0.3 s | 0.041 | 0 ms |

## Leitura (18/11/2026, Etapa 2)

Medição feita de um contêiner na nuvem, atrás de um proxy, com o site publicado pelo commit
`e35f1fa` da branch `publicacao`.

- Desempenho, acessibilidade e boas práticas: 96 a 100 em todas as páginas.
- **SEO 92 e Agentic Browsing 50 em todas as páginas.** Causa: a CSP publicada (`default-src
  'none'`, sem `connect-src`) impedia a página de buscar qualquer coisa, inclusive no próprio site,
  e o Lighthouse lê `robots.txt`, `llms.txt` e `.well-known/ard.json` de dentro da página. Os
  robôs de busca não passam por essa restrição; só a medição era afetada.
- **Correção (D79):** `connect-src 'self'` na CSP. Conferida num servidor local com os cabeçalhos
  do `.htaccess`: com a CSP antiga, SEO 92 e Agentic Browsing 50; com a nova, 100 nas cinco
  categorias. Entra no ar com o merge da Etapa 2; a medição no ar será refeita depois dele.
