#!/usr/bin/env node
/**
 * Conferências da publicação (Fase 5), no postbuild, depois de gerar o dist/.htaccess:
 *  - toda página tem canonical igual à própria URL no endereço final, og:url igual, og:title
 *    igual ao <title> e og:image absoluta para um arquivo que existe (D72, D73);
 *  - a 404 tem noindex e não tem canonical;
 *  - o sitemap lista exatamente as páginas canônicas; o robots aponta o sitemap;
 *  - a CSP do dist/.htaccess cobre todo <script> e <style> em linha; nenhum atributo on…= nem
 *    link javascript: (que a CSP bloquearia);
 *  - no GitHub Actions, o endereço é o final (D72);
 *  - dist/versao.txt existe, no formato certo, com o commit do Actions, e o .htaccess manda
 *    no-cache para ele (D78);
 *  - o .htaccess da pasta principal (hospedagem/) só tem mod_rewrite, com condição de host em
 *    toda regra, sem mod_alias nem Header (D77);
 *  - versão em inglês (D91, D92, D108): lang do <html> e og:locale pelo idioma da rota; hreflang
 *    pt-BR, en e x-default recíprocos, og:locale:alternate e seletor só nas páginas com par; 404
 *    sem hreflang, com seletor só se o início do outro idioma existe; sitemap com alternates;
 *    dist/en/.htaccess se e só se existir a 404 em inglês. Com a chave desligada, nada disso
 *    existe: nenhum dist/en/, hreflang, og:locale:alternate, xhtml:link nem seletor. No GitHub
 *    Actions, INGLES=1 só é aceito em pull request.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { cspDoBuild, htaccessIngles } from './gerar-htaccess.mjs';
import { SITE_FINAL, site, base, absoluta, inglesAtivo, INGLES_PUBLICADO } from '../src/lib/site.mjs';
import { IDIOMAS, IDIOMA_PADRAO, idiomaDaRota, outroIdioma } from '../src/lib/idiomas.mjs';
import { IMAGEM_OG } from '../src/lib/imagens.mjs';
import { FORMATO_VERSAO } from './gerar-versao.mjs';

const raiz = new URL('..', import.meta.url).pathname;
const dist = join(raiz, 'dist');
const erros = [];
const htmls = [];
const andar = (d) => readdirSync(d).forEach((f) => { const p = join(d, f); statSync(p).isDirectory() ? andar(p) : p.endsWith('.html') && htmls.push(p); });
andar(dist);

const atributo = (html, seletor) => {
  const [tag, attr, valor] = seletor;
  for (const m of html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'g'))) {
    if (new RegExp(`\\s${attr}="${valor}"`).test(m[0])) return m[0].match(/\s(?:content|href)="([^"]*)"/)?.[1] ?? null;
  }
  return null;
};
const desescapar = (s) => s?.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');

// Páginas aprovadas de cada idioma (campo pagina, rota), lidas dos .md.
const lerPaginas = (codigo) => {
  const pasta = join(raiz, IDIOMAS[codigo].pasta);
  if (!existsSync(pasta)) return [];
  return readdirSync(pasta).filter((f) => f.endsWith('.md')).map((f) => {
    const fm = readFileSync(join(pasta, f), 'utf8').match(/^---\n([\s\S]*?)\n---/)[1];
    return { codigo, pagina: fm.match(/^pagina:\s*"?(.*?)"?$/m)[1], rota: fm.match(/^rota:\s*"?(.*?)"?$/m)[1] };
  });
};
const aprovadas = Object.keys(IDIOMAS).flatMap(lerPaginas);
const ativo = inglesAtivo();
const esperadas = aprovadas.filter((p) => p.codigo === IDIOMA_PADRAO || ativo);
const parDe = (rota) => {
  const p = aprovadas.find((x) => x.rota === rota);
  return p && aprovadas.find((x) => x.codigo !== p.codigo && x.pagina === p.pagina);
};
const inicioDe = (codigo) => aprovadas.find((x) => x.codigo === codigo && x.pagina === 'home')?.rota;
const rotulosDe = (codigo) => JSON.parse(readFileSync(join(raiz, IDIOMAS[codigo].rotulos), 'utf8'));
// 404 de cada idioma: dist/404.html (português) e dist/en/404/index.html (inglês).
const arquivo404 = Object.fromEntries(Object.entries(IDIOMAS).map(([c, i]) => [c, c === IDIOMA_PADRAO ? '404.html' : `${i.prefixo.slice(1)}404/index.html`]));
const alternates = (html) => [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]);
// Seletor de idioma: quantos há, nome acessível e destino de cada um.
const seletores = (html) => [...html.matchAll(/<nav aria-label="([^"]*)"[^>]*data-seletor-idioma[^>]*>([\s\S]*?)<\/nav>/g)]
  .map((m) => ({ nome: m[1], destino: m[2].match(/<a href="([^"]+)"/)?.[1], atual: m[2].match(/<span aria-current="true" lang="([^"]+)"/)?.[1] }));
const comBase = (rota) => `${base().replace(/\/$/, '')}${rota}`;

// 1. Canonical e compartilhamento; idioma; hreflang e seletor.
const canonicas = [];
const imagemOg = absoluta(`/img/${IMAGEM_OG.nome}`);
for (const arquivo of htmls) {
  const nome = relative(dist, arquivo);
  const html = readFileSync(arquivo, 'utf8');
  const canonical = atributo(html, ['link', 'rel', 'canonical']);
  const rota = nome === '404.html' ? '/404/' : `/${nome.replace(/index\.html$/, '')}`;
  const codigo = idiomaDaRota(rota);
  const lang = html.match(/<html lang="([^"]*)"/)?.[1];
  if (lang !== IDIOMAS[codigo].lang) erros.push(`${nome}: <html lang="${lang}"> (esperado ${IDIOMAS[codigo].lang})`);
  const sel = seletores(html);
  const nomeT50 = rotulosDe(codigo).seletor_idioma.nome;
  sel.forEach((x) => {
    if (x.nome !== nomeT50) erros.push(`${nome}: seletor com nome acessível "${x.nome}" (esperado T50 "${nomeT50}")`);
    if (x.atual !== IDIOMAS[codigo].lang) erros.push(`${nome}: seletor marca ${x.atual} como idioma atual (esperado ${IDIOMAS[codigo].lang})`);
  });
  if (!ativo && (sel.length || alternates(html).length || /hreflang=/.test(html) || /og:locale:alternate/.test(html))) erros.push(`${nome}: seletor, hreflang ou og:locale:alternate com o inglês desligado`);
  if (nome === arquivo404[codigo]) {
    if (canonical) erros.push(`${nome}: não devia ter canonical`);
    if (!/<meta name="robots" content="noindex"/.test(html)) erros.push(`${nome}: falta noindex`);
    if (alternates(html).length) erros.push(`${nome}: a 404 não tem hreflang (D108)`);
    // D108: seletor para o início do outro idioma, só se ele existe.
    const inicio = ativo ? inicioDe(outroIdioma(codigo)) : undefined;
    if (inicio ? sel.length !== 3 || sel.some((x) => x.destino !== comBase(inicio)) : sel.length) erros.push(`${nome}: seletor ${JSON.stringify(sel)} (esperado ${inicio ? `três, para ${comBase(inicio)}` : 'nenhum'})`);
    continue;
  }
  const esperada = absoluta(rota);
  if (canonical !== esperada) erros.push(`${nome}: canonical ${canonical} (esperado ${esperada})`);
  const ogUrl = atributo(html, ['meta', 'property', 'og:url']);
  if (ogUrl !== esperada) erros.push(`${nome}: og:url ${ogUrl} (esperado ${esperada})`);
  const titulo = desescapar(html.match(/<title>([^<]*)<\/title>/)?.[1]);
  const ogTitulo = desescapar(atributo(html, ['meta', 'property', 'og:title']));
  if (!titulo || ogTitulo !== titulo) erros.push(`${nome}: og:title "${ogTitulo}" diferente do <title> "${titulo}"`);
  const descricao = desescapar(atributo(html, ['meta', 'name', 'description']));
  const ogDescricao = desescapar(atributo(html, ['meta', 'property', 'og:description']));
  if (!descricao || ogDescricao !== descricao) erros.push(`${nome}: og:description diferente da descrição`);
  const ogImagem = atributo(html, ['meta', 'property', 'og:image']);
  if (ogImagem !== imagemOg) erros.push(`${nome}: og:image ${ogImagem} (esperado ${imagemOg})`);
  for (const p of ['og:type', 'og:locale', 'og:site_name', 'og:image:width', 'og:image:height']) if (!atributo(html, ['meta', 'property', p])) erros.push(`${nome}: falta ${p}`);
  if (atributo(html, ['meta', 'property', 'og:locale']) !== IDIOMAS[codigo].ogLocale) erros.push(`${nome}: og:locale diferente de ${IDIOMAS[codigo].ogLocale}`);
  if (!atributo(html, ['meta', 'name', 'twitter:card'])) erros.push(`${nome}: falta twitter:card`);
  // hreflang (D91): com par, exatamente pt-BR, en e x-default (português), apontando para as duas
  // URLs; o par recíproco é conferido quando o laço chega na outra página. Sem par, nenhum.
  const par = ativo ? parDe(rota) : undefined;
  const alt = alternates(html).map(([h, u]) => `${h} ${u}`).sort();
  if (par) {
    const pt = codigo === IDIOMA_PADRAO ? rota : par.rota;
    const en = codigo === IDIOMA_PADRAO ? par.rota : rota;
    const certo = [`${IDIOMAS[IDIOMA_PADRAO].hreflang} ${absoluta(pt)}`, `${IDIOMAS.en.hreflang} ${absoluta(en)}`, `x-default ${absoluta(pt)}`].sort();
    if (alt.join('|') !== certo.join('|')) erros.push(`${nome}: hreflang ${JSON.stringify(alt)} (esperado ${JSON.stringify(certo)})`);
    if (atributo(html, ['meta', 'property', 'og:locale:alternate']) !== IDIOMAS[outroIdioma(codigo)].ogLocale) erros.push(`${nome}: og:locale:alternate ausente ou errado`);
    if (sel.length !== 3 || sel.some((x) => x.destino !== comBase(par.rota))) erros.push(`${nome}: seletor ${JSON.stringify(sel)} (esperado três, para ${comBase(par.rota)})`);
  } else {
    if (alt.length) erros.push(`${nome}: hreflang sem par: ${JSON.stringify(alt)}`);
    if (/og:locale:alternate/.test(html)) erros.push(`${nome}: og:locale:alternate sem par`);
    if (sel.length) erros.push(`${nome}: seletor sem par`);
  }
  canonicas.push(esperada);
}
if (!existsSync(join(dist, 'img', IMAGEM_OG.nome))) erros.push(`dist/img/${IMAGEM_OG.nome} ausente`);
if (canonicas.length !== esperadas.length) erros.push(`${canonicas.length} páginas com canonical no build, ${esperadas.length} .md aprovados ${ativo ? 'nos dois idiomas' : 'em português'}`);

// Versão em inglês: pasta en/ e o .htaccess dela.
const pastaEn = join(dist, IDIOMAS.en.prefixo.slice(1));
const temEn404 = existsSync(join(dist, arquivo404.en));
if (!ativo && existsSync(pastaEn)) erros.push('dist/en/ existe com o inglês desligado (D92)');
if (ativo && !temEn404) erros.push(`dist/${arquivo404.en} ausente com o inglês ativo`);
const htEn = join(pastaEn, '.htaccess');
if (temEn404 !== existsSync(htEn)) erros.push(`dist/en/.htaccess ${temEn404 ? 'ausente' : 'sem a 404 em inglês'}`);
else if (temEn404 && readFileSync(htEn, 'utf8') !== htaccessIngles()) erros.push(`dist/en/.htaccess diferente de ${JSON.stringify(htaccessIngles())}`);

// Inglês publicado (D92, D125): toda página aprovada tem par no outro idioma.
if (INGLES_PUBLICADO) aprovadas.filter((p) => !parDe(p.rota)).forEach((p) => erros.push(`${p.codigo} ${p.rota}: sem par no outro idioma, com o inglês publicado`));

// Trava da chave no GitHub Actions (D92): INGLES=1 só em pull request, nunca no que vai ao ar.
if (process.env.GITHUB_ACTIONS === 'true' && process.env.INGLES === '1' && process.env.GITHUB_EVENT_NAME !== 'pull_request') erros.push(`INGLES=1 no GitHub Actions fora de pull request (evento ${process.env.GITHUB_EVENT_NAME}): o inglês só vai ao ar pela chave INGLES_PUBLICADO (D92)`);

// 2. Sitemap e robots.
const sitemap = existsSync(join(dist, 'sitemap.xml')) ? readFileSync(join(dist, 'sitemap.xml'), 'utf8') : '';
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!sitemap) erros.push('sitemap.xml ausente');
if ([...locs].sort().join('\n') !== [...canonicas].sort().join('\n')) erros.push(`sitemap.xml não lista exatamente as páginas canônicas (${locs.length} no sitemap, ${canonicas.length} páginas)`);
if (!ativo && /xhtml:link|xmlns:xhtml/.test(sitemap)) erros.push('sitemap.xml com alternates com o inglês desligado');
if (ativo) {
  for (const bloco of sitemap.split('<url>').slice(1)) {
    const loc = bloco.match(/<loc>([^<]+)<\/loc>/)?.[1];
    const rota = loc && `/${loc.slice(absoluta('/').length)}`;
    const par = parDe(rota);
    const alt = [...bloco.matchAll(/<xhtml:link rel="alternate" hreflang="([^"]+)" href="([^"]+)"\/>/g)].map((m) => `${m[1]} ${m[2]}`).sort();
    const certo = !par ? [] : (() => {
      const pt = aprovadas.find((x) => x.codigo === IDIOMA_PADRAO && (x.rota === rota || x.rota === par.rota)).rota;
      const en = pt === rota ? par.rota : rota;
      return [`${IDIOMAS[IDIOMA_PADRAO].hreflang} ${absoluta(pt)}`, `${IDIOMAS.en.hreflang} ${absoluta(en)}`, `x-default ${absoluta(pt)}`].sort();
    })();
    if (alt.join('|') !== certo.join('|')) erros.push(`sitemap.xml: ${loc} com alternates ${JSON.stringify(alt)} (esperado ${JSON.stringify(certo)})`);
  }
}
const robots = existsSync(join(dist, 'robots.txt')) ? readFileSync(join(dist, 'robots.txt'), 'utf8') : '';
if (!robots.includes(`Sitemap: ${absoluta('/sitemap.xml')}`)) erros.push('robots.txt ausente ou sem a linha do sitemap');

// 3. CSP e o que ela bloquearia.
const htaccess = existsSync(join(dist, '.htaccess')) ? readFileSync(join(dist, '.htaccess'), 'utf8') : '';
const cspNoArquivo = htaccess.match(/Header always set Content-Security-Policy "([^"]*)"/)?.[1];
if (!cspNoArquivo) erros.push('dist/.htaccess ausente ou sem Content-Security-Policy');
else if (cspNoArquivo !== cspDoBuild()) erros.push('a CSP do dist/.htaccess não cobre os scripts e estilos em linha deste build (rode o gerar-htaccess depois do build)');
if (/'unsafe-inline'/.test(cspNoArquivo?.match(/script-src[^;]*/)?.[0] ?? '') || /unsafe-eval/.test(cspNoArquivo ?? '')) erros.push('a CSP não pode liberar script em linha nem eval');
for (const arquivo of htmls) {
  const html = readFileSync(arquivo, 'utf8');
  for (const m of html.matchAll(/<[a-zA-Z][\w-]*\b[^>]*\son[a-z]+\s*=[^>]*>/g)) erros.push(`${relative(dist, arquivo)}: atributo de evento em linha: ${m[0].slice(0, 80)}`);
  if (/\s(?:href|src|action)\s*=\s*["']?\s*javascript:/i.test(html)) erros.push(`${relative(dist, arquivo)}: link javascript:`);
}

// 4. Endereço final no GitHub Actions.
if (process.env.GITHUB_ACTIONS === 'true' && (site() !== SITE_FINAL || base() !== '/')) erros.push(`no Actions, o site precisa ser ${SITE_FINAL}/ (está ${site()}${base()})`);

// 5. versao.txt (D78).
const arquivoVersao = join(dist, 'versao.txt');
const versao = existsSync(arquivoVersao) ? readFileSync(arquivoVersao, 'utf8') : null;
if (versao === null) erros.push('dist/versao.txt ausente');
else if (!FORMATO_VERSAO.test(versao)) erros.push(`dist/versao.txt fora do formato (commit de 40 caracteres e data UTC): ${JSON.stringify(versao)}`);
else if (process.env.GITHUB_ACTIONS === 'true' && !versao.startsWith(`commit ${process.env.GITHUB_SHA}\n`)) erros.push(`dist/versao.txt com commit diferente do GITHUB_SHA (${process.env.GITHUB_SHA})`);
if (!/<FilesMatch "\\\.\([^)]*\btxt\b[^)]*\)\$">\s*Header set Cache-Control "no-cache"/.test(htaccess)) erros.push('o .htaccess não manda no-cache para .txt (versao.txt)');
if (locs.some((l) => l.endsWith('versao.txt'))) erros.push('versao.txt não deve entrar no sitemap');

// 6. .htaccess da pasta principal (D77).
const principal = readFileSync(join(raiz, 'hospedagem/htaccess-dominio-principal'), 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
let condicaoDeHost = false;
for (const l of principal) {
  const diretiva = l.split(/\s+/)[0];
  if (!['RewriteEngine', 'RewriteCond', 'RewriteRule'].includes(diretiva)) erros.push(`hospedagem/htaccess-dominio-principal: diretiva não permitida: ${l}`);
  if (diretiva === 'RewriteCond' && /^RewriteCond\s+%\{HTTP_HOST\}\s+\^\(www\\\.\)\?profmatheuspassos\\\.com\\\.br\$/.test(l)) condicaoDeHost = true;
  if (diretiva === 'RewriteRule') {
    if (!condicaoDeHost) erros.push(`hospedagem/htaccess-dominio-principal: regra sem condição de host: ${l}`);
    condicaoDeHost = false;
  }
}

if (erros.length) {
  console.error(`conferir-publicacao: ${erros.length} problema(s)`);
  erros.forEach((e) => console.error(' - ' + e));
  process.exit(1);
}
const modo = ativo
  ? `${INGLES_PUBLICADO ? 'inglês publicado' : 'pré-visualização com inglês'}: ${aprovadas.filter((p) => p.codigo === 'en').length} página(s) em inglês com .md, mais a 404 em inglês; hreflang e seletor conferidos`
  : 'inglês desligado: nenhuma rota /en/, nenhum hreflang, nenhum seletor';
console.log(`conferir-publicacao: ok (${canonicas.length} páginas com canonical e compartilhamento em ${site()}${base()}; sitemap, robots, CSP e .htaccess da pasta principal conferidos; ${modo})`);
