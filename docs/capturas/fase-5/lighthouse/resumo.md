# Lighthouse (Fase 5)

Gerado por `npm run lighthouse` com `LIGHTHOUSE_URL=https://tese.profmatheuspassos.com.br`, no endereço publicado. Mínimo exigido: 90 em todas as categorias. A home no celular roda 5 vezes; a linha dela é a pior rodada.

| Página | Modo | Performance | Accessibility | Best Practices | SEO | Agentic Browsing | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|---|
| home | celular, pior de 5 (desempenho: 98, 100, 100, 100, 99) | 98 | 100 | 100 | 100 | 100 | 1.5 s | 0 | 140 ms |
| home | desktop | 100 | 100 | 100 | 100 | 100 | 0.3 s | 0 | 0 ms |
| capitulo-1 | celular | 100 | 100 | 100 | 100 | 100 | 0.9 s | 0 | 10 ms |
| capitulo-1 | desktop | 100 | 100 | 100 | 100 | 100 | 0.3 s | 0.001 | 0 ms |
| capitulo-2 | celular | 100 | 100 | 100 | 100 | 100 | 0.9 s | 0 | 0 ms |
| capitulo-2 | desktop | 100 | 100 | 100 | 100 | 100 | 0.3 s | 0 | 0 ms |
| capitulo-3 | celular | 100 | 100 | 100 | 100 | 100 | 1.1 s | 0 | 0 ms |
| capitulo-3 | desktop | 100 | 100 | 100 | 100 | 100 | 0.3 s | 0 | 0 ms |
| capitulo-4 | celular | 100 | 100 | 100 | 100 | 100 | 1.0 s | 0 | 30 ms |
| capitulo-4 | desktop | 100 | 100 | 100 | 100 | 100 | 0.3 s | 0 | 0 ms |
| capitulo-5 | celular | 100 | 100 | 100 | 100 | 100 | 1.0 s | 0 | 10 ms |
| capitulo-5 | desktop | 100 | 100 | 100 | 100 | 100 | 0.3 s | 0 | 0 ms |
| sobre | celular | 100 | 100 | 100 | 100 | 100 | 0.9 s | 0 | 0 ms |
| sobre | desktop | 100 | 100 | 100 | 100 | 100 | 0.3 s | 0.041 | 0 ms |

## Leitura (18/11/2026, Etapa 3)

Medição feita de um contêiner na nuvem, atrás de um proxy, com o site publicado a partir do commit
`40e639d` da `main` (merge da Etapa 2, com a D79), conforme o `versao.txt` no ar.

- **SEO e Agentic Browsing em 100 em todas as páginas**, no celular e no computador. A correção da
  D79 (`connect-src 'self'`) resolveu no ar o que a Etapa 2 tinha medido (92 e 50).
- Acessibilidade e boas práticas: 100 em tudo. Desempenho: 100 em todas as páginas, exceto a home
  no celular, 98 na pior de cinco rodadas.
- Nenhuma resposta da CDN (nenhum cabeçalho `x-hcdn-*`), como pede a D78.
