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
 *  - o .htaccess da pasta principal (hospedagem/) só tem mod_rewrite, com condição de host em
 *    toda regra, sem mod_alias nem Header (D77).
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { cspDoBuild } from './gerar-htaccess.mjs';
import { SITE_FINAL, site, base, absoluta } from '../src/lib/site.mjs';
import { IMAGEM_OG } from '../src/lib/imagens.mjs';

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

// 1. Canonical e compartilhamento.
const canonicas = [];
const imagemOg = absoluta(`/img/${IMAGEM_OG.nome}`);
for (const arquivo of htmls) {
  const nome = relative(dist, arquivo);
  const html = readFileSync(arquivo, 'utf8');
  const canonical = atributo(html, ['link', 'rel', 'canonical']);
  if (nome === '404.html') {
    if (canonical) erros.push('404.html: não devia ter canonical');
    if (!/<meta name="robots" content="noindex"/.test(html)) erros.push('404.html: falta noindex');
    continue;
  }
  const rota = `/${nome.replace(/index\.html$/, '')}`;
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
  if (!atributo(html, ['meta', 'name', 'twitter:card'])) erros.push(`${nome}: falta twitter:card`);
  canonicas.push(esperada);
}
if (!existsSync(join(dist, 'img', IMAGEM_OG.nome))) erros.push(`dist/img/${IMAGEM_OG.nome} ausente`);
const paginasMd = readdirSync(join(raiz, 'src/content/pt-br')).filter((f) => f.endsWith('.md')).length;
if (canonicas.length !== paginasMd) erros.push(`${canonicas.length} páginas com canonical no build, ${paginasMd} .md aprovados`);

// 2. Sitemap e robots.
const sitemap = existsSync(join(dist, 'sitemap.xml')) ? readFileSync(join(dist, 'sitemap.xml'), 'utf8') : '';
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!sitemap) erros.push('sitemap.xml ausente');
if ([...locs].sort().join('\n') !== [...canonicas].sort().join('\n')) erros.push(`sitemap.xml não lista exatamente as páginas canônicas (${locs.length} no sitemap, ${canonicas.length} páginas)`);
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

// 5. .htaccess da pasta principal (D77).
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
console.log(`conferir-publicacao: ok (${canonicas.length} páginas com canonical e compartilhamento em ${site()}${base()}; sitemap, robots, CSP e .htaccess da pasta principal conferidos)`);
