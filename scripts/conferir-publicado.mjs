#!/usr/bin/env node
/**
 * Testes depois de publicar (Fase 5, Etapa 2), contra os endereços reais:
 *   npm run conferir:publicado
 *
 * Subdomínio (tese.profmatheuspassos.com.br):
 *  - as páginas do site respondem 200 em HTTPS, sem redirecionamento, com canonical e og:url certos;
 *  - http → https (301); rota sem barra final → com barra (301);
 *  - página inexistente → 404 com a página "Página não encontrada"; /.git/HEAD → 404;
 *  - cabeçalhos de segurança com os valores do build (D74), CSP cobrindo os scripts e estilos em
 *    linha que a página publicada traz; nenhum cabeçalho repetido nem fora da lista fechada
 *    (o que pegaria algo herdado da pasta principal);
 *  - cache por tipo de arquivo (D75) e compressão;
 *  - sitemap e robots, e toda URL do sitemap responde 200; og-home.png como image/png.
 * Domínio principal (D77):
 *  - profmatheuspassos.com.br e www, em http e https → 301 para https://profmatheus.com, mesmo
 *    caminho; /tese/... → 301 para o subdomínio.
 * Links públicos: repositório no GitHub sem login (D41), depósito da tese, licenças (D76).
 *
 * Atrás de um proxy (como na nuvem), rode com NODE_USE_ENV_PROXY=1.
 */
import { CABECALHOS_FIXOS, CACHE, hash } from './gerar-htaccess.mjs';
import { SITE_FINAL, site } from '../src/lib/site.mjs';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const raiz = new URL('..', import.meta.url).pathname;
const S = site();
const HOST_S = new URL(S).host;
const PRINCIPAL = 'profmatheuspassos.com.br';
const DESTINO = 'https://profmatheus.com';
const rotas = readdirSync(join(raiz, 'src/content/pt-br')).filter((f) => f.endsWith('.md'))
  .map((f) => readFileSync(join(raiz, 'src/content/pt-br', f), 'utf8').match(/^rota:\s*"?(.*?)"?$/m)[1]).sort();

const erros = [];
const avisos = [];
let testes = 0;
const conferir = (ok, msg) => { testes++; if (!ok) erros.push(msg); };
const pedir = (url, opcoes = {}) => fetch(url, { redirect: 'manual', headers: { 'User-Agent': 'conferir-publicado', 'Accept-Encoding': 'gzip, br' }, ...opcoes });

// Cabeçalhos que podem aparecer: os nossos e os que o servidor sempre manda. Os da Hostinger que
// não vêm de .htaccess nenhum (nível do servidor) são aceitos, mas listados como aviso.
const NOSSOS = new Set(['strict-transport-security', 'content-security-policy', 'x-content-type-options', 'x-frame-options', 'referrer-policy', 'cross-origin-opener-policy', 'cross-origin-resource-policy', 'permissions-policy', 'cache-control']);
const PADRAO_HTTP = new Set(['date', 'server', 'content-type', 'content-length', 'content-encoding', 'transfer-encoding', 'connection', 'keep-alive', 'etag', 'last-modified', 'accept-ranges', 'vary', 'alt-svc', 'location', 'expires']);
const DO_SERVIDOR = new Set(['platform', 'panel', 'x-turbo-charged-by', 'x-litespeed-cache', 'x-litespeed-tag', 'x-litespeed-cache-control', 'cf-cache-status', 'cf-ray', 'x-hcdn-cache-status', 'x-hcdn-request-id', 'x-hcdn-upstream-rt', 'x-hcdn-cache-key']);

function conferirCabecalhos(rotulo, r, html) {
  const h = r.headers;
  for (const [nome, valor] of Object.entries(CABECALHOS_FIXOS)) conferir(h.get(nome) === valor, `${rotulo}: ${nome} = ${h.get(nome)} (esperado ${valor})`);
  const csp = h.get('content-security-policy') || '';
  conferir(csp.startsWith("default-src 'none'") && !/, *default-src/.test(csp), `${rotulo}: CSP ausente ou repetida: ${csp.slice(0, 80)}`);
  const scriptSrc = csp.match(/script-src[^;]*/)?.[0] ?? '';
  conferir(!/unsafe-inline|unsafe-eval/.test(scriptSrc), `${rotulo}: script-src libera script em linha ou eval`);
  if (html) {
    for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) if (!/\ssrc\s*=/.test(m[1])) conferir(scriptSrc.includes(hash(m[2])), `${rotulo}: script em linha sem hash na CSP`);
    const styleSrc = csp.match(/style-src [^;]*/)?.[0] ?? '';
    for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)) conferir(styleSrc.includes(hash(m[1])), `${rotulo}: estilo em linha sem hash na CSP`);
  }
  conferir(!h.get('x-powered-by'), `${rotulo}: x-powered-by presente`);
  for (const [nome, valor] of h) {
    if (NOSSOS.has(nome) || PADRAO_HTTP.has(nome)) continue;
    if (DO_SERVIDOR.has(nome)) { avisos.push(`${rotulo}: cabeçalho do servidor: ${nome}: ${valor}`); continue; }
    erros.push(`${rotulo}: cabeçalho fora da lista (herdado?): ${nome}: ${valor}`);
  }
}
const cacheEsperado = (url) => CACHE.find((c) => c.extensoes.includes((new URL(url).pathname.match(/\.(\w+)$/)?.[1]) || 'html'))?.valor;

// --- Subdomínio ---
let primeiroHtml = '';
for (const rota of rotas) {
  const url = `${S}${rota}`;
  const r = await pedir(url);
  const html = await r.text();
  conferir(r.status === 200, `${url}: status ${r.status} (esperado 200, sem redirecionamento)`);
  if (r.status !== 200) continue;
  if (!primeiroHtml) primeiroHtml = html;
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  conferir(canonical === url, `${url}: canonical ${canonical}`);
  conferir(html.match(/<meta property="og:url" content="([^"]+)"/)?.[1] === url, `${url}: og:url diferente`);
  conferirCabecalhos(rota, r, html);
  conferir(r.headers.get('cache-control') === cacheEsperado(url), `${url}: cache-control ${r.headers.get('cache-control')}`);
  conferir(/^(gzip|br)$/.test(r.headers.get('content-encoding') || ''), `${url}: sem compressão (content-encoding ${r.headers.get('content-encoding')})`);
}

const redireciona = async (de, para, rotulo) => {
  const r = await pedir(de);
  conferir(r.status === 301 && r.headers.get('location') === para, `${rotulo}: ${de} → ${r.status} ${r.headers.get('location')} (esperado 301 ${para})`);
};
await redireciona(`http://${HOST_S}/`, `${S}/`, 'http → https');
await redireciona(`http://${HOST_S}/sobre/`, `${S}/sobre/`, 'http → https');
const semBarra = rotas.find((r) => r !== '/').replace(/\/$/, '');
const rSemBarra = await pedir(`${S}${semBarra}`);
conferir(rSemBarra.status === 301 && new URL(rSemBarra.headers.get('location') || '', S).href === `${S}${semBarra}/`, `${S}${semBarra}: ${rSemBarra.status} ${rSemBarra.headers.get('location')} (esperado 301 para a rota com barra)`);

const r404 = await pedir(`${S}/rota-que-nao-existe/`);
const h404 = await r404.text();
conferir(r404.status === 404 && h404.includes('Página não encontrada'), `404: status ${r404.status}, página "Página não encontrada" ${h404.includes('Página não encontrada') ? 'presente' : 'ausente'}`);
conferirCabecalhos('404', r404, h404);
for (const caminho of ['/.git/HEAD', '/.git/config', '/.htaccess']) {
  const r = await pedir(`${S}${caminho}`);
  // O próprio servidor já barra o .htaccess (403); o resto que começa com ponto responde 404.
  const aceitos = caminho === '/.htaccess' ? [403, 404] : [404];
  conferir(aceitos.includes(r.status), `${caminho}: status ${r.status} (esperado ${aceitos.join(' ou ')})`);
}

const asset = (padrao) => primeiroHtml.match(padrao)?.[1];
for (const caminho of [asset(/href="(\/_astro\/[^"]+\.css)"/), asset(/src="(\/_astro\/[^"]+\.js)"/), asset(/href="(\/_astro\/[^"]+\.woff2)"/), '/img/og-home.png', '/favicon.svg', '/sitemap.xml', '/robots.txt'].filter(Boolean)) {
  const url = `${S}${caminho}`;
  const r = await pedir(url);
  conferir(r.status === 200, `${url}: status ${r.status}`);
  conferir(r.headers.get('cache-control') === cacheEsperado(url), `${url}: cache-control ${r.headers.get('cache-control')} (esperado ${cacheEsperado(url)})`);
  conferirCabecalhos(caminho, r);
  if (caminho.endsWith('.png')) conferir(r.headers.get('content-type') === 'image/png', `${url}: content-type ${r.headers.get('content-type')}`);
}
const sitemap = await (await pedir(`${S}/sitemap.xml`)).text();
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
conferir(locs.length === rotas.length, `sitemap com ${locs.length} URLs (esperado ${rotas.length})`);
for (const loc of locs) conferir((await pedir(loc)).status === 200, `sitemap: ${loc} não responde 200`);
const robots = await (await pedir(`${S}/robots.txt`)).text();
conferir(robots.includes(`Sitemap: ${S}/sitemap.xml`), 'robots.txt sem a linha do sitemap');

// --- Domínio principal ---
for (const host of [PRINCIPAL, `www.${PRINCIPAL}`]) {
  for (const esquema of ['http', 'https']) {
    for (const caminho of ['/', '/algum/caminho/?q=1']) await redireciona(`${esquema}://${host}${caminho}`, `${DESTINO}${caminho}`, 'domínio principal');
  }
  await redireciona(`https://${host}/tese/`, `${S}/`, '/tese/ no domínio principal');
  await redireciona(`https://${host}/tese/capitulos/1-no-papel/`, `${S}/capitulos/1-no-papel/`, '/tese/ no domínio principal');
}

// --- Links públicos ---
for (const url of ['https://github.com/profmatheuspassos/tese_doutorado', 'https://github.com/profmatheuspassos/tese_doutorado/blob/main/LICENSE', 'https://hdl.handle.net/10451/57093', 'https://creativecommons.org/licenses/by-nc-nd/4.0/deed.pt-br']) {
  try {
    const r = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'conferir-publicado' } });
    conferir(r.status === 200, `${url}: status ${r.status} sem login (esperado 200)`);
  } catch (e) { erros.push(`${url}: ${e.cause?.code || e.message}`); }
}

if (S !== SITE_FINAL) avisos.push(`conferindo ${S}, não o endereço final ${SITE_FINAL}`);
avisos.forEach((a) => console.log('  aviso: ' + a));
if (erros.length) {
  console.error(`conferir-publicado: ${erros.length} problema(s) em ${testes} testes`);
  erros.forEach((e) => console.error(' - ' + e));
  process.exit(1);
}
console.log(`conferir-publicado: ok (${testes} testes em ${S} e ${PRINCIPAL})`);
