# Revigorar, não substituir — site de divulgação da tese

Site público que explica, em linguagem simples, a tese de doutorado **"Cidadania Ativa e
Governança sob a perspectiva do Direito Eleitoral comparado"**, de Matheus Passos Silva
(Faculdade de Direito da Universidade de Lisboa, 2022; orientador: Prof. Doutor Jorge Miranda).
A tese compara Portugal e Brasil e propõe formas de revigorar a democracia representativa, sem
substituí-la.

**No ar:** https://tese.profmatheuspassos.com.br

O site não é a publicação da tese. É uma versão de divulgação, reescrita para um leitor sem
formação em Direito e fiel ao argumento original. A versão oficial da tese está no repositório
da Universidade de Lisboa: https://hdl.handle.net/10451/57093

## Como foi feito

Os textos foram adaptados para linguagem simples com apoio de inteligência artificial e revisados
pelo autor. Cada trecho do site está ligado à seção da tese de onde veio, em
[`docs/RASTREABILIDADE.md`](docs/RASTREABILIDADE.md). As decisões do autor sobre o conteúdo e o
site estão em [`docs/DECISOES.md`](docs/DECISOES.md).

O site é estático (Astro, Tailwind e GSAP), não usa cookies, não tem analytics e não carrega nada
de terceiros. Os textos e os interativos funcionam sem JavaScript; o site respeita a preferência
por menos movimento e segue o nível AA de acessibilidade.

## Como rodar localmente

Precisa de Node.js 22.

```bash
npm install
```

```bash
npm run dev
```

Para gerar o site pronto em `dist/`, com todas as conferências (dados, contraste, imagens, texto,
recursos de terceiros, links e publicação):

```bash
npm run build
```

Qualquer diferença em relação aos textos aprovados ou aos dados faz o build falhar. Testes no
navegador e Lighthouse:

```bash
npm run capturas
```

```bash
npm run lighthouse
```

## Como a publicação funciona

1. Toda mudança entra na `main` por pull request. Em cada pull request, o GitHub Actions roda o
   build com todas as conferências.
2. O merge na `main` dispara o workflow [`publicar.yml`](.github/workflows/publicar.yml), que
   roda o build de novo e, se tudo passar, grava o site pronto na branch `publicacao`.
3. A Hostinger acompanha a branch `publicacao` pelo aplicativo **"Implante de GitHub"** e publica
   cada commit novo sozinha. Não há webhook nem segredo da hospedagem no repositório.
4. O arquivo https://tese.profmatheuspassos.com.br/versao.txt mostra o commit da `main` que gerou
   a versão no ar e a hora do build.

Depois de publicar, os testes no endereço real rodam assim:

```bash
NODE_USE_ENV_PROXY=1 npm run conferir:publicado
```

```bash
LIGHTHOUSE_URL=https://tese.profmatheuspassos.com.br npm run lighthouse
```

O passo a passo completo, incluindo a troca das imagens ilustrativas (mesmo nome, mesmas
dimensões, enviadas por pull request), está em [`docs/PUBLICACAO.md`](docs/PUBLICACAO.md).

## Licenças

- **Código** (scripts, componentes, estilos, configuração e workflow): licença MIT, no arquivo
  [`LICENSE`](LICENSE).
- **Textos e imagens** do site e da pasta `docs/`: Creative Commons Atribuição-NãoComercial-
  SemDerivações 4.0 Internacional (CC BY-NC-ND 4.0), no arquivo
  [`LICENSE-CONTEUDO.md`](LICENSE-CONTEUDO.md). Podem ser copiados e compartilhados, com crédito
  ao autor, sem fins comerciais e sem alterações.

A tese original não está neste repositório e segue as condições do repositório da Universidade de
Lisboa.

## O que fica fora do Git

`fonte/` (o .docx original da tese) e `conteudo/` (a conversão integral) nunca são versionados.
Para recriar `conteudo/`, coloque o .docx em `fonte/` e rode:

```bash
bash scripts/converter.sh
```

Também ficam fora `node_modules/`, `dist/` e as variantes de imagem geradas no build.

## Mapa curto

| Caminho | Conteúdo |
|---|---|
| `src/content/pt-br/` | Texto das páginas |
| `src/pages/`, `src/layouts/`, `src/components/` | Páginas, modelos e componentes do site |
| `src/data/dados.json` | Todos os números mostrados no site |
| `public/img/` | Imagens ilustrativas |
| `scripts/` | Conferências do build, testes e geração do `.htaccess` e do `versao.txt` |
| `docs/` | Plano de conteúdo, decisões, rastreabilidade, legibilidade, planos das fases e capturas |
| `hospedagem/` | `.htaccess` da pasta principal do domínio |
| `CLAUDE.md` | Regras do projeto e estado atual |
