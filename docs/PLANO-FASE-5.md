# Plano da Fase 5 — Publicação

Plano aprovado pelo autor em 17/11/2026 (decisões D71 a D77), ajustado em 18/11/2026 ao que a
publicação mostrou (D78 e D79). O passo a passo operacional está em `docs/PUBLICACAO.md`.

Endereço final: **https://tese.profmatheuspassos.com.br**. Hospedagem: Hostinger, plano Business,
hPanel. O domínio `profmatheuspassos.com.br` tinha um WordPress de backup de profmatheus.com, que
saiu (D77).

## 1. Como o site chega à Hostinger (D71, ajustada pela D78)

1. Merge na `main` dispara `.github/workflows/publicar.yml`.
2. O workflow roda `npm ci` e `npm run build`, com todas as conferências. Qualquer falha para tudo
   e nada é publicado.
3. Se o build passar, o workflow grava o site pronto (`dist/`, com `.htaccess` e `versao.txt`) na
   branch **`publicacao`**, com commit normal por cima do anterior. Sem force push.
4. **Ajuste da D78:** a Hostinger puxa a `publicacao` pelo aplicativo **"Implante de GitHub"**,
   instalado pelo autor no GitHub, com implantação automática para `public_html/tese`. O plano
   original previa a ferramenta Git do hPanel avisada por webhook; o hPanel ofereceu a integração
   por aplicativo. **Não há webhook no repositório, e não deve ser criado.**

Em pull requests, o workflow só roda o build com as conferências. Nenhum segredo da Hostinger fica
no GitHub; o push usa só o `GITHUB_TOKEN` do workflow.

**`versao.txt` (D78):** o build grava `dist/versao.txt` com o commit da `main` que gerou o site e a
data e hora do build em UTC, sem nenhum outro dado. Todo merge muda a `publicacao` (dispara a
implantação automática), e o arquivo no ar mostra qual versão está publicada.

## 2. O que muda no site para o endereço final

- **Endereço (D72):** padrão do build em `src/lib/site.mjs`; rotas com barra no fim.
- **Compartilhamento (D73):** canonical, Open Graph e `twitter:card` só com textos aprovados (T11,
  T12, título da home); `og-home.png` em todas as páginas; 404 com `noindex`, sem canonical.
- **Sitemap e robots:** rotas estáticas do Astro, sem dependência nova.
- **`.htaccess` do subdomínio, gerado a cada build** (`scripts/gerar-htaccess.mjs`): HTTPS e host
  canônico (301), `profmatheuspassos.com.br/tese/…` → subdomínio, 404 do site, caminhos com ponto
  barrados (exceto `.well-known`), cabeçalhos de segurança (D74) e cache (D75), compressão.
- **CSP (D74, ajustada pela D79):** `default-src 'none'`; scripts e estilos só do próprio site, os
  em linha por hash; `style-src-attr 'unsafe-inline'`; **`connect-src 'self'`** (D79: sem ele, o
  Lighthouse não conseguia ler o `robots.txt` de dentro da página e baixava SEO e Agentic
  Browsing); `img-src`, `font-src`, `manifest-src` só do site; `base-uri`, `form-action` e
  `frame-ancestors` fechados. Mais HSTS de um ano, `nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: no-referrer`, COOP e CORP `same-origin` e `Permissions-Policy` restrita.
- **Cache (D75):** `/_astro/` um ano `immutable`; imagens e favicon um dia; HTML, XML e TXT
  `no-cache`. **CDN da Hostinger desligada (D78):** ligada, ela trocava cabeçalhos das imagens em
  cache.
- **Conferências no build:** imagens (nome, formato, dimensões, peso) e publicação (canonical, OG,
  sitemap, robots, CSP cobrindo tudo o que é em linha, `versao.txt`, `.htaccess` da pasta
  principal só com `mod_rewrite` e condição de host).
- **Testes no navegador** com os cabeçalhos do `.htaccess` aplicados, falhando em qualquer
  violação de CSP.

## 3. O que o autor faz no hPanel

Ordem: **A** remover o WordPress (arquivos e banco, este só se o `DB_NAME` for diferente do de
profmatheus.com) → **B** `.htaccess` do redirecionamento na pasta principal, em sequência, na
mesma sessão de trabalho, só depois do merge da Etapa 1 → **C** subdomínio e SSL → **D**
implantação. Passo a passo em `docs/PUBLICACAO.md`. **Feito pelo autor em 18/11/2026**, com o
ajuste da D78 no passo D (aplicativo no lugar da ferramenta Git e do webhook) e a CDN desligada.

## 4. Como trocar as imagens ilustrativas

Mesmo nome e mesmas dimensões, WebP com até 600 KB (`og-home.png`: PNG, até 1.000 KB), enviado
por pull request. O build confere; o merge publica; o `versao.txt` confirma; quem já visitou vê a
imagem nova em até um dia. Detalhes em `docs/PUBLICACAO.md`.

## 5. Testes depois de publicar

`npm run conferir:publicado` (sete páginas, http → https, barra final, 404, `.git`, cabeçalhos sem
nada herdado da pasta principal nem vindo da CDN, cache, compressão, sitemap, robots,
`versao.txt` com o commit esperado, domínio principal → profmatheus.com, `/tese/` → subdomínio,
links públicos com o lembrete da D41); `capturas` e `lighthouse` com o endereço publicado.
Resultados da Etapa 2 no pull request dela e em `docs/capturas/fase-5/lighthouse/resumo.md`.

## 6. README

Revisão final na Etapa 3: o que é o site, link no ar e versão oficial (D36), como foi feito e a
linha sobre IA (D37), comandos, publicação, troca de imagens, licenças (D76), pastas fora do Git,
mapa curto.

## 7. Licenças (D76)

Código sob MIT (`LICENSE`); textos e imagens sob CC BY-NC-ND 4.0 (`LICENSE-CONTEUDO.md`, com o
texto oficial); linha T49 no rodapé.

## Etapas

- **Etapa 1 — código da publicação:** aprovada, PR #13 com merge.
- **Etapa 2 — no ar:** aprovada, PR #14 com merge (`40e639d`): testes no endereço real,
  integração por aplicativo, CDN desligada, `versao.txt` (D78) e `connect-src 'self'` (D79). O merge dela serve de teste da implantação
  automática: o `versao.txt` no ar tem de mostrar o commit do merge.
- **Etapa 3 — fechamento:** README final e conclusão da fase no `CLAUDE.md`; implantação
  automática confirmada e medição no ar registradas (D80).
