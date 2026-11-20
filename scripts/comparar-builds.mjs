#!/usr/bin/env node
/**
 * Prova de que o português não muda (D94; docs/PLANO-INGLES.md, seção c, e Etapa 2a).
 * Compara o build da branch (candidato, padrão: dist/) com o build da main (referência):
 *
 *   node scripts/comparar-builds.mjs --referencia <pasta do dist da main> [--candidato dist] [--controle]
 *
 *  1. Arquivos: a mesma lista nos dois, tirando /_astro/ e versao.txt.
 *  2. Bytes: imagens, favicon, sitemap e robots idênticos sem troca nenhuma. Todo .html e o
 *     .htaccess idênticos depois de uma única troca: cada referência /_astro/<nome> vira
 *     /_astro/⟨pacote⟩.<extensão>. Nada mais é trocado (nem espaços, nem os hashes da CSP).
 *  3. Texto: com o navegador, cada página (e a 404) em 375, 768 e 1440 px, nos cenários normal,
 *     movimento reduzido e sem JavaScript, depois de rolar a página inteira: innerText do body,
 *     <title>, metas e atributos lidos por leitor de tela (aria-label, title, alt) iguais.
 *  4. Pixels: captura PNG da página inteira, densidade 1, nas mesmas combinações; tolerância zero.
 *     Cada diferença grava uma imagem com os pixels marcados na pasta de saída.
 *  5. Console: qualquer erro de console, de JavaScript, violação de CSP ou pedido para fora do
 *     site, em qualquer dos dois builds, é falha.
 *  6. Pacotes de /_astro/: lista os iguais, os pares que mudaram (pareados pela posição nas
 *     páginas ou pelo nome sem o hash) e os que só existem de um lado, com tamanho e o que mudou.
 *     Esta parte informa; a justificativa de cada pacote vai no relatório da etapa.
 *
 * Com --ingles (Etapa 3; os dois builds com INGLES=1), a prova é a da chave ligada: compara só o
 * português (fica de fora o que está em en/ e o sitemap, que ganha as páginas em inglês e é conferido
 * pelo conferir-publicacao). No HTML, antes da comparação, tira dos dois lados o seletor de idioma
 * ([data-seletor-idioma], com a classe ml-auto que o menu ganha para dar lugar a ele), as linhas
 * <link rel="alternate" hreflang> e o og:locale:alternate, e conta o que tirou. O que se espera
 * tirar de cada lado sai dos pares que existem no build daquele lado, lidos do sitemap.xml dele:
 * página em português com par em inglês, os quatro itens; a 404 em português, só o seletor e a classe
 * do menu, se a home em inglês existe (D108); nas demais, nada. No .htaccess, só aceita a mais na
 * CSP hashes de trechos em linha
 * que existem apenas nas páginas em inglês. No navegador, o seletor e o og:locale:alternate saem do
 * DOM antes do texto e da captura; o resto precisa ser idêntico, texto e pixels.
 *
 * Com --controle, a referência é comparada com ela mesma (dois servidores, duas rodadas de
 * captura independentes): precisa dar zero diferença, para provar que o método não tem ruído.
 *
 * Cada build é servido por um servidor local deste script, igual para os dois, com os cabeçalhos
 * do .htaccess do próprio build (CSP incluída; HSTS fora, porque o servidor é http) e a 404 com
 * status 404. Sai com erro em qualquer diferença das partes 1 a 5.
 */
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { IDIOMAS } from '../src/lib/idiomas.mjs';
import { absoluta } from '../src/lib/site.mjs';

const exigir = createRequire(import.meta.url);
const { chromium } = exigir('playwright');
const raiz = new URL('..', import.meta.url).pathname;

const arg = (nome) => { const i = process.argv.indexOf(nome); return i > 0 ? process.argv[i + 1] : undefined; };
const controle = process.argv.includes('--controle');
const ingles = process.argv.includes('--ingles');
const pastaRef = arg('--referencia') && resolve(arg('--referencia'));
const pastaCand = controle ? pastaRef : resolve(arg('--candidato') || join(raiz, 'dist'));
const saida = resolve(arg('--saida') || join(tmpdir(), controle ? 'comparar-controle' : 'comparar'));
if (!pastaRef || !existsSync(join(pastaRef, 'index.html'))) throw new Error('Informe --referencia com a pasta do dist da main (com index.html).');
if (!existsSync(join(pastaCand, 'index.html'))) throw new Error(`Candidato sem index.html: ${pastaCand}. Rode npm run build antes.`);
mkdirSync(saida, { recursive: true });

const falhas = [];
const falhar = (parte, msg) => falhas.push(`[${parte}] ${msg}`);
const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const listar = (pasta) => {
  const lista = [];
  const andar = (d) => readdirSync(d).forEach((f) => { const p = join(d, f); statSync(p).isDirectory() ? andar(p) : lista.push(relative(pasta, p)); });
  andar(pasta);
  return lista.sort();
};
const foraDaComparacao = (f) => f.startsWith('_astro/') || f === 'versao.txt' || (ingles && (f.startsWith('en/') || f === 'sitemap.xml'));

// --ingles: o que a chave ligada acrescenta às páginas em português, tirado antes da comparação.
const TIRAR_INGLES = {
  seletor: /<nav[^>]*\bdata-seletor-idioma\b[^>]*>[\s\S]*?<\/nav>/g,
  hreflang: /<link rel="alternate" hreflang="[^"]*" href="[^"]*">/g,
  ogAlternate: /<meta property="og:locale:alternate" content="[^"]*">/g,
};
// A classe que o cabeçalho põe no menu só quando há seletor (Cabecalho.astro, "ml-auto"), para abrir
// lugar ao seletor à direita: volta ao que é sem seletor e entra na contagem como parte dele.
const MENU_COM_SELETOR = /(<nav aria-label="[^"]*" class="hidden lg:block) ml-auto"/g;
const tirados = { referencia: {}, candidato: {} };
function tirarIngles(texto, lado, f) {
  if (!ingles || !f.endsWith('.html')) return texto;
  for (const [nome, re] of Object.entries(TIRAR_INGLES)) {
    const n = (texto.match(re) ?? []).length;
    if (n) (tirados[lado][f] ??= {})[nome] = n;
    texto = texto.replace(re, '');
  }
  const nMenu = (texto.match(MENU_COM_SELETOR) ?? []).length;
  if (nMenu) (tirados[lado][f] ??= {}).menuComSeletor = nMenu;
  return texto.replace(MENU_COM_SELETOR, '$1"');
}
// --ingles: o que se espera tirar de cada lado sai dos pares que existem no build daquele lado,
// lidos do sitemap.xml dele (gerado dos .md pelo campo `pagina`; o conferir-publicacao confere os
// alternates contra o hreflang das páginas). Página em português com par em inglês: seletor, classe
// do menu, hreflang e og:locale:alternate. A 404 em português: seletor e classe do menu, se a home em
// inglês existe (D108). Qualquer outra página com algo tirado, ou página com par sem o esperado, é falha.
const COM_PAR = ['seletor', 'menuComSeletor', 'hreflang', 'ogAlternate'];
const NA_404 = ['seletor', 'menuComSeletor'];
function esperadoDosPares(pasta) {
  const arq = join(pasta, 'sitemap.xml');
  if (!existsSync(arq)) throw new Error(`--ingles: ${arq} não existe (o build foi feito com INGLES=1?).`);
  const prefixo = new URL(absoluta('/')).pathname; // base do site (src/lib/site.mjs)
  const rotaDe = (loc) => `/${new URL(loc).pathname.slice(prefixo.length)}`;
  const esperado = {};
  for (const bloco of readFileSync(arq, 'utf8').split('<url>').slice(1)) {
    const rota = rotaDe(bloco.match(/<loc>([^<]+)<\/loc>/)[1]);
    if (rota === IDIOMAS.en.prefixo) esperado['404.html'] = NA_404;
    const temPar = /hreflang="en"/.test(bloco);
    if (temPar && !rota.startsWith(IDIOMAS.en.prefixo)) esperado[`${rota.slice(1)}index.html`] = COM_PAR;
  }
  return esperado;
}
// --ingles: hashes de trechos em linha (<script>, <style>) por grupo de páginas do candidato.
function hashesEmLinha(pasta, filtro) {
  const conjunto = new Set();
  for (const f of listar(pasta).filter((x) => x.endsWith('.html') && filtro(x))) {
    for (const m of readFileSync(join(pasta, f), 'utf8').matchAll(/<(script|style)\b[^>]*>([\s\S]*?)<\/\1>/g)) {
      if (m[2]) conjunto.add(`'sha256-${createHash('sha256').update(m[2]).digest('base64')}'`);
    }
  }
  return conjunto;
}
const hashesSoIngles = [];
function cspSoComOPortugues(textoCand, textoRef) {
  if (!ingles) return textoCand;
  const daRef = new Set(textoRef.match(/'sha256-[^']+'/g) ?? []);
  const doEn = hashesEmLinha(pastaCand, (f) => f.startsWith('en/'));
  const doPt = hashesEmLinha(pastaCand, (f) => !f.startsWith('en/'));
  return textoCand.replace(/ ?'sha256-[^']+'/g, (m) => {
    const h = m.trim();
    if (daRef.has(h) || !doEn.has(h) || doPt.has(h)) return m;
    hashesSoIngles.push(h);
    return '';
  });
}

// ---------------------------------------------------------------------------------------------
// 1 e 2. Arquivos e bytes.
const arqRef = listar(pastaRef);
const arqCand = listar(pastaCand);
const compRef = arqRef.filter((f) => !foraDaComparacao(f));
const compCand = arqCand.filter((f) => !foraDaComparacao(f));
compRef.filter((f) => !compCand.includes(f)).forEach((f) => falhar('arquivos', `só na referência: ${f}`));
compCand.filter((f) => !compRef.includes(f)).forEach((f) => falhar('arquivos', `só no candidato: ${f}`));

// A única troca: o nome do pacote em /_astro/ (nome e hash) vira um marcador com a extensão.
const REF_ASTRO = /\/_astro\/([^"'\s)>,]+)/g;
const normalizar = (texto) => texto.replace(REF_ASTRO, (_, nome) => `/_astro/⟨pacote⟩.${nome.split('.').pop()}`);
const comNormalizacao = (f) => f.endsWith('.html') || f === '.htaccess';
let iguaisBytes = 0;
let iguaisNormalizados = 0;
for (const f of compRef.filter((x) => compCand.includes(x))) {
  const a = readFileSync(join(pastaRef, f));
  const b = readFileSync(join(pastaCand, f));
  if (!comNormalizacao(f)) {
    if (a.equals(b)) iguaisBytes++;
    else falhar('bytes', `${f}: conteúdo diferente (${a.length} x ${b.length} bytes)`);
    continue;
  }
  const na = normalizar(tirarIngles(a.toString('utf8'), 'referencia', f));
  let nb = normalizar(tirarIngles(b.toString('utf8'), 'candidato', f));
  if (f === '.htaccess') nb = cspSoComOPortugues(nb, na);
  if (na === nb) { iguaisNormalizados++; continue; }
  let i = 0;
  while (i < na.length && na[i] === nb[i]) i++;
  const trecho = (s) => JSON.stringify(s.slice(Math.max(0, i - 120), i + 120));
  falhar('bytes', `${f}: diferente depois da troca dos nomes de /_astro/, a partir do caractere ${i}.\n      referência: ${trecho(na)}\n      candidato:  ${trecho(nb)}`);
}
if (ingles) {
  for (const [lado, pasta] of [['referencia', pastaRef], ['candidato', pastaCand]]) {
    const esperado = esperadoDosPares(pasta);
    for (const [f, itens] of Object.entries(tirados[lado])) {
      const nomes = Object.keys(itens).sort().join();
      if (!esperado[f]) falhar('ingles', `${lado} ${f}: tinha ${JSON.stringify(itens)} (página sem par em inglês)`);
      else if (nomes !== [...esperado[f]].sort().join()) falhar('ingles', `${lado} ${f}: tinha ${JSON.stringify(itens)} (esperado ${esperado[f].join(', ')})`);
    }
    for (const f of Object.keys(esperado)) if (!tirados[lado][f]) falhar('ingles', `${lado} ${f}: sem ${esperado[f].join(', ')}`);
    console.log(`--ingles: ${lado}: pares pelo sitemap ${JSON.stringify(Object.keys(esperado))}; tirado ${JSON.stringify(tirados[lado])}`);
  }
  console.log(`--ingles: hashes da CSP só das páginas em inglês: ${hashesSoIngles.length ? hashesSoIngles.join(' ') : 'nenhum'}`);
}
console.log(`1-2. arquivos e bytes: ${compRef.length} arquivos na referência e ${compCand.length} no candidato (fora /_astro/ e versao.txt); ${iguaisBytes} idênticos byte a byte; ${iguaisNormalizados} .html/.htaccess idênticos depois da troca dos nomes de /_astro/`);

// ---------------------------------------------------------------------------------------------
// 6. Pacotes de /_astro/ (só informa).
const pacotesRef = arqRef.filter((f) => f.startsWith('_astro/')).map((f) => f.slice(7));
const pacotesCand = arqCand.filter((f) => f.startsWith('_astro/')).map((f) => f.slice(7));
const semHash = (nome) => nome.replace(/\.[A-Za-z0-9_-]{8}\.(\w+)$/, '.$1');
const pares = new Map();
// Pareamento pela posição: a mesma referência, no mesmo lugar do mesmo .html, nos dois builds.
for (const f of compRef.filter((x) => x.endsWith('.html') && compCand.includes(x))) {
  const ra = [...readFileSync(join(pastaRef, f), 'utf8').matchAll(REF_ASTRO)].map((m) => m[1]);
  const rb = [...readFileSync(join(pastaCand, f), 'utf8').matchAll(REF_ASTRO)].map((m) => m[1]);
  ra.forEach((n, k) => { if (rb[k] && n !== rb[k] && !pacotesCand.includes(n)) pares.set(n, rb[k]); });
}
// Os que não aparecem no HTML (importados por outro pacote): pelo nome sem o hash.
for (const n of pacotesRef.filter((x) => !pacotesCand.includes(x) && !pares.has(x))) {
  const outro = pacotesCand.find((m) => !pacotesRef.includes(m) && semHash(m) === semHash(n) && ![...pares.values()].includes(m));
  if (outro) pares.set(n, outro);
}
const normalizarCodigo = (s) => s.replace(/[\w.-]+?\.[A-Za-z0-9_-]{8}\.(js|css|woff2)/g, '⟨pacote⟩.$1');
const regrasCss = (s) => new Set(s.split('}').map((r) => r.trim()).filter(Boolean));
function oQueMudou(a, b) {
  const ca = readFileSync(join(pastaRef, '_astro', a), 'utf8');
  const cb = readFileSync(join(pastaCand, '_astro', b), 'utf8');
  if (ca === cb) return 'conteúdo idêntico (só o nome mudou)';
  if (normalizarCodigo(ca) === normalizarCodigo(cb)) return 'só mudou a referência a outro pacote';
  if (a.endsWith('.css')) {
    const ra = regrasCss(ca);
    const rb = regrasCss(cb);
    const tiradas = [...ra].filter((r) => !rb.has(r));
    const novas = [...rb].filter((r) => !ra.has(r));
    return `CSS: ${tiradas.length} regra(s) retirada(s), ${novas.length} acrescentada(s)${[...tiradas.map((r) => `\n        - ${r}}`), ...novas.map((r) => `\n        + ${r}}`)].join('')}`;
  }
  const na = normalizarCodigo(ca);
  const nb = normalizarCodigo(cb);
  let i = 0;
  while (i < na.length && na[i] === nb[i]) i++;
  let j = 0;
  while (j < na.length - i && j < nb.length - i && na[na.length - 1 - j] === nb[nb.length - 1 - j]) j++;
  return `código mudou:\n        - ${JSON.stringify(na.slice(Math.max(0, i - 60), na.length - j + 60))}\n        + ${JSON.stringify(nb.slice(Math.max(0, i - 60), nb.length - j + 60))}`;
}
const linhasPacotes = [];
const iguais = pacotesRef.filter((n) => pacotesCand.includes(n));
iguais.forEach((n) => { if (!readFileSync(join(pastaRef, '_astro', n)).equals(readFileSync(join(pastaCand, '_astro', n)))) falhar('pacotes', `${n}: mesmo nome, conteúdo diferente`); });
for (const [a, b] of pares) {
  const ta = statSync(join(pastaRef, '_astro', a)).size;
  const tb = statSync(join(pastaCand, '_astro', b)).size;
  linhasPacotes.push(`   ${a} -> ${b} (${ta} -> ${tb} bytes): ${oQueMudou(a, b)}`);
}
pacotesRef.filter((n) => !pacotesCand.includes(n) && !pares.has(n)).forEach((n) => linhasPacotes.push(`   só na referência: ${n}`));
pacotesCand.filter((n) => !pacotesRef.includes(n) && ![...pares.values()].includes(n)).forEach((n) => linhasPacotes.push(`   só no candidato: ${n}`));

// ---------------------------------------------------------------------------------------------
// 3 a 5. Navegador: texto, pixels e console.
const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json' };
function servir(pasta, porta) {
  const cabecalhos = Object.fromEntries([...readFileSync(join(pasta, '.htaccess'), 'utf8').matchAll(/^\s*Header always set (\S+) "(.*)"$/gm)]
    .map((m) => [m[1], m[2]]).filter(([k]) => k.toLowerCase() !== 'strict-transport-security'));
  if (!cabecalhos['Content-Security-Policy']) throw new Error(`${pasta}/.htaccess sem CSP.`);
  const servidor = createServer((pedido, resposta) => {
    let caminho = decodeURIComponent(new URL(pedido.url, 'http://x').pathname);
    if (caminho.endsWith('/')) caminho += 'index.html';
    let arquivo = join(pasta, caminho);
    let status = 200;
    if (!arquivo.startsWith(pasta) || !existsSync(arquivo) || statSync(arquivo).isDirectory()) { arquivo = join(pasta, '404.html'); status = 404; }
    resposta.writeHead(status, { ...cabecalhos, 'Content-Type': TIPOS[extname(arquivo)] || 'application/octet-stream' });
    resposta.end(readFileSync(arquivo));
  });
  return new Promise((ok) => servidor.listen(porta, '127.0.0.1', () => ok(servidor)));
}
const rotas = compRef.filter((f) => f.endsWith('index.html')).map((f) => `/${f.replace(/index\.html$/, '')}`)
  .sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)));
rotas.push('/rota-que-nao-existe/');
const larguras = [375, 768, 1440];
const cenarios = [
  { nome: 'normal', opcoes: {} },
  { nome: 'movimento-reduzido', opcoes: { reducedMotion: 'reduce' } },
  { nome: 'sem-js', opcoes: { javaScriptEnabled: false } },
];
const altura = (w) => (w < 500 ? 812 : 900);

const servidores = [await servir(pastaRef, 4341), await servir(pastaCand, 4342)];
const navegador = await chromium.launch();

async function visitar(base, rota, c, w, rotulo) {
  const ctx = await navegador.newContext({ viewport: { width: w, height: altura(w) }, deviceScaleFactor: 1, ...c.opcoes });
  await ctx.addInitScript(() => document.addEventListener('securitypolicyviolation', (e) => console.error(`CSP bloqueou: ${e.violatedDirective} ${e.blockedURI || 'em linha'}`)));
  const pagina = await ctx.newPage();
  // Na rota da 404, o Chromium registra no console o status 404 do próprio documento pedido, que
  // é o status exigido ali. Só essa mensagem, desse documento, não conta; qualquer outra conta.
  const documento404 = rota === '/rota-que-nao-existe/' ? `${base}${rota}` : null;
  pagina.on('console', (m) => {
    if (m.type() !== 'error') return;
    if (documento404 && m.location().url === documento404 && /status of 404/.test(m.text())) return;
    falhar('console', `${rotulo}: ${m.text()}`);
  });
  pagina.on('pageerror', (e) => falhar('console', `${rotulo}: erro de JS: ${e.message}`));
  pagina.on('request', (r) => { if (!r.url().startsWith(base) && !r.url().startsWith('data:')) falhar('console', `${rotulo}: pedido para fora: ${r.url()}`); });
  const resposta = await pagina.goto(`${base}${rota}`, { waitUntil: 'networkidle' });
  await pagina.evaluate(() => document.fonts.ready.then(() => true));
  // Mesma rolagem do capturas.mjs: a página inteira, devagar, para disparar as animações; volta ao topo.
  const alturaTotal = await pagina.evaluate(() => document.body.scrollHeight);
  const passo = Math.round(altura(w) * 0.6);
  for (let y = 0; y < alturaTotal; y += passo) { await pagina.mouse.wheel(0, passo); await pagina.waitForTimeout(c.nome === 'normal' ? 120 : 10); }
  await pagina.waitForTimeout(c.nome === 'normal' ? 2200 : 100);
  await pagina.evaluate(() => scrollTo(0, 0));
  if (ingles) await pagina.evaluate(() => document.querySelectorAll('[data-seletor-idioma], meta[property="og:locale:alternate"]').forEach((el) => el.remove()));
  await pagina.waitForTimeout(300);
  const texto = await pagina.evaluate(() => JSON.stringify({
    titulo: document.title,
    metas: [...document.querySelectorAll('meta')].map((m) => `${m.getAttribute('name') || m.getAttribute('property') || m.getAttribute('charset') || ''}=${m.getAttribute('content') ?? ''}`),
    corpo: document.body.innerText,
    atributos: [...document.querySelectorAll('[aria-label], [title], img, [alt]')].map((el) => [el.getAttribute('aria-label'), el.getAttribute('title'), el.getAttribute('alt')].join('|')),
  }));
  const png = await pagina.screenshot({ fullPage: true, type: 'png', animations: 'disabled', caret: 'hide' });
  const status = resposta.status();
  await ctx.close();
  return { texto, png, status };
}

// Comparação pixel a pixel no próprio Chromium (canvas), sem dependência nova.
async function compararPixels(a, b, arquivoDif) {
  const ctx = await navegador.newContext();
  const p = await ctx.newPage();
  const r = await p.evaluate(async ([da, db]) => {
    const carregar = (src) => new Promise((ok, erro) => { const i = new Image(); i.onload = () => ok(i); i.onerror = erro; i.src = src; });
    const [ia, ib] = await Promise.all([carregar(da), carregar(db)]);
    if (ia.width !== ib.width || ia.height !== ib.height) return { tamanho: `${ia.width}x${ia.height} x ${ib.width}x${ib.height}` };
    const ler = (img) => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0); return g.getImageData(0, 0, c.width, c.height); };
    const pa = ler(ia).data;
    const pb = ler(ib).data;
    const c = document.createElement('canvas'); c.width = ia.width; c.height = ia.height;
    const g = c.getContext('2d'); g.drawImage(ia, 0, 0); g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillRect(0, 0, c.width, c.height);
    const marcado = g.getImageData(0, 0, c.width, c.height);
    let n = 0; let x0 = Infinity; let y0 = Infinity; let x1 = -1; let y1 = -1;
    for (let k = 0; k < pa.length; k += 4) {
      if (pa[k] !== pb[k] || pa[k + 1] !== pb[k + 1] || pa[k + 2] !== pb[k + 2] || pa[k + 3] !== pb[k + 3]) {
        n++; const px = (k / 4) % ia.width; const py = Math.floor(k / 4 / ia.width);
        x0 = Math.min(x0, px); y0 = Math.min(y0, py); x1 = Math.max(x1, px); y1 = Math.max(y1, py);
        marcado.data[k] = 255; marcado.data[k + 1] = 0; marcado.data[k + 2] = 0; marcado.data[k + 3] = 255;
      }
    }
    if (!n) return { n };
    g.putImageData(marcado, 0, 0);
    return { n, caixa: `x ${x0} a ${x1}, y ${y0} a ${y1}`, imagem: c.toDataURL('image/png') };
  }, [`data:image/png;base64,${a.toString('base64')}`, `data:image/png;base64,${b.toString('base64')}`]);
  await ctx.close();
  if (r.imagem) writeFileSync(arquivoDif, Buffer.from(r.imagem.split(',')[1], 'base64'));
  return r;
}

let combinacoes = 0;
let pixelsIguais = 0;
let textosIguais = 0;
try {
  for (const rota of rotas) {
    for (const c of cenarios) {
      for (const w of larguras) {
        combinacoes++;
        const rotulo = `${rota} ${c.nome} ${w}px`;
        const ref = await visitar('http://127.0.0.1:4341', rota, c, w, `referência ${rotulo}`);
        const cand = await visitar('http://127.0.0.1:4342', rota, c, w, `candidato ${rotulo}`);
        const esperado = rota === '/rota-que-nao-existe/' ? 404 : 200;
        if (ref.status !== esperado || cand.status !== esperado) falhar('console', `${rotulo}: status ${ref.status} x ${cand.status} (esperado ${esperado})`);
        if (ref.texto === cand.texto) textosIguais++;
        else {
          const a = JSON.parse(ref.texto); const b = JSON.parse(cand.texto);
          const campo = Object.keys(a).find((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
          const sa = JSON.stringify(a[campo]); const sb = JSON.stringify(b[campo]);
          let i = 0; while (i < sa.length && sa[i] === sb[i]) i++;
          falhar('texto', `${rotulo}: "${campo}" diferente a partir do caractere ${i}.\n      referência: ${sa.slice(Math.max(0, i - 80), i + 80)}\n      candidato:  ${sb.slice(Math.max(0, i - 80), i + 80)}`);
        }
        const nome = `${rota.replace(/^\/|\/$/g, '').replace(/\//g, '_') || 'home'}-${c.nome}-${w}`;
        if (ref.png.equals(cand.png)) { pixelsIguais++; continue; }
        const r = await compararPixels(ref.png, cand.png, join(saida, `${nome}-diferenca.png`));
        if (r.n === 0) { pixelsIguais++; continue; }
        writeFileSync(join(saida, `${nome}-referencia.png`), ref.png);
        writeFileSync(join(saida, `${nome}-candidato.png`), cand.png);
        falhar('pixels', r.tamanho ? `${rotulo}: tamanho diferente (${r.tamanho})` : `${rotulo}: ${r.n} pixel(s) diferente(s), ${r.caixa}; imagem em ${join(saida, `${nome}-diferenca.png`)}`);
      }
    }
    console.log(`   ${rota}: ${cenarios.length * larguras.length} combinações comparadas`);
  }
} finally {
  await navegador.close();
  servidores.forEach((s) => s.close());
}
console.log(`3. texto: ${textosIguais} de ${combinacoes} combinações idênticas`);
console.log(`4. pixels: ${pixelsIguais} de ${combinacoes} capturas idênticas pixel a pixel`);
console.log(`5. console: ${falhas.filter((f) => f.startsWith('[console]')).length} problema(s)`);
console.log(`6. pacotes de /_astro/: ${iguais.length} iguais, ${pares.size} mudaram de nome, ${linhasPacotes.length - pares.size} sem par`);
linhasPacotes.forEach((l) => console.log(l));

const modo = `${controle ? 'controle (referência contra ela mesma)' : `candidato ${pastaCand} contra a referência ${pastaRef}`}${ingles ? ', chave ligada (--ingles)' : ''}`;
writeFileSync(join(saida, 'resultado.txt'), `${modo}\n${falhas.length ? falhas.join('\n') : 'nenhuma diferença'}\n\nPacotes:\n${linhasPacotes.join('\n')}\n`);
if (falhas.length) {
  console.error(`comparar-builds: ${falhas.length} diferença(s) (${modo})`);
  falhas.forEach((f) => console.error(' - ' + f));
  process.exit(1);
}
console.log(`comparar-builds: ok (${modo}; ${combinacoes} combinações; resultado em ${join(saida, 'resultado.txt')})`);
