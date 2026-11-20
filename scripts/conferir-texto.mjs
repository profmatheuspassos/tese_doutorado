#!/usr/bin/env node
/**
 * Garante que o texto publicado é o texto aprovado, palavra por palavra, em cada idioma
 * (src/lib/idiomas.mjs).
 *  - Para cada página do build que corresponde a um .md aprovado (src/content/pt-br/ ou
 *    src/content/en/), junta o texto dos elementos [data-bloco] (sem os trechos aria-hidden e
 *    data-ui) e compara com o .md.
 *  - Todo texto visível fora dos blocos (navegação, rótulos, gráficos) precisa ser um rótulo
 *    aprovado do idioma, um título de página, um ano ou número dos dados (no formato do idioma),
 *    ou o contato da D7. O idioma de cada texto é o do lang mais próximo: numa página em inglês,
 *    o que está dentro de lang="pt-BR" (título original, página ainda sem tradução) é conferido
 *    contra o português, e vice-versa (o "English" do seletor numa página em português).
 * Lê o HTML estático (JavaScript desligado). Usa o Playwright já instalado no ambiente.
 */
import { createRequire } from 'node:module';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { expandirDados, formatarValor } from '../src/lib/rotulos.mjs';
import { IDIOMAS } from '../src/lib/idiomas.mjs';
import { INGLES_PUBLICADO } from '../src/lib/site.mjs';

const exigir = createRequire(import.meta.url);
const { chromium } = exigir('playwright');
const raiz = new URL('..', import.meta.url).pathname;
const dados = JSON.parse(readFileSync(join(raiz, 'src/data/dados.json'), 'utf8'));

const TOKEN = /[\p{L}\p{N}]+(?:[,.'-][\p{L}\p{N}]+)*%?/gu;
// Aspas retas e tipográficas contam como iguais (o Astro converte as retas do .md em curvas).
const normalizar = (s) => s.replace(/[“”„‟]/g, '"').replace(/[‘’‚‛]/g, "'");
const tokens = (s) => normalizar(s).match(TOKEN) ?? [];
const aspas = (s) => (normalizar(s).match(/"/g) ?? []).length;

function lerMd(pastaMd, arquivo) {
  const bruto = readFileSync(join(pastaMd, arquivo), 'utf8');
  const fm = bruto.match(/^---\n([\s\S]*?)\n---\n/);
  const meta = Object.fromEntries((fm?.[1] ?? '').split('\n').map((l) => l.match(/^(\w+):\s*"?(.*?)"?$/)).filter(Boolean).map((m) => [m[1], m[2]]));
  let corpo = bruto.slice(fm ? fm[0].length : 0);
  const marcas = [...corpo.matchAll(/<!--\s*(B\d+)\s*\|/g)].map((m) => m[1]);
  corpo = corpo
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/^```.*$/gm, ' ')
    // Marcador de lista numerada ("1. "): na página vira número da lista, não texto.
    .replace(/^(\s*)\d{1,2}\.\s+/gm, '$1')
    .replace(/\]\([^)]*\)/g, ']');
  return { meta, marcas, tokens: tokens(corpo), aspas: aspas(corpo) };
}

const juntar = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(juntar) : typeof v === 'object' ? Object.values(v).flatMap(juntar) : []);
const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Textos aprovados de um idioma: rótulos (com os marcadores {d:...} trocados pelos valores do
 * dados.json, no formato do idioma), títulos e títulos originais das páginas do idioma, o contato
 * da D7 e os números do dados.json, formatados como o site os mostra.
 */
function montarIdioma(codigo) {
  const I = IDIOMAS[codigo];
  const pastaMd = join(raiz, I.pasta);
  const i18n = JSON.parse(readFileSync(join(raiz, I.rotulos), 'utf8'));
  const paginas = existsSync(pastaMd) ? readdirSync(pastaMd).filter((f) => f.endsWith('.md')).map((f) => ({ arquivo: `${codigo}/${f}`, codigo, ...lerMd(pastaMd, f) })) : [];
  const permitidos = new Set();
  const padroes = [];
  const caps = paginas.filter((p) => p.meta.capitulo).map((p) => ({ n: p.meta.capitulo, titulo: p.meta.titulo }));
  // Valores possíveis de cada variável de interface (as demais variáveis fazem o build falhar).
  const variaveis = {
    instituicao: Object.values(i18n.explorador?.instituicoes ?? {}),
    forma: Object.values(i18n.bolha?.formas ?? {}),
    formato: ['ABNT', 'APA', 'BibTeX'],
    titulo: [...paginas.map((p) => p.meta.titulo), i18n.nao_encontrada],
    n: null, // número inteiro
  };
  for (const bruto of juntar(i18n)) {
    if (bruto === i18n._sobre) continue;
    const s = expandirDados(bruto, dados, I.locale);
    if (s.includes('{n}') && s.includes('{titulo}')) { caps.forEach((c) => permitidos.add(s.replace('{n}', c.n).replace('{titulo}', c.titulo))); continue; }
    if (!s.includes('{')) { permitidos.add(s); continue; }
    const re = escapar(s).replace(/\\\{(\w+)\\\}/g, (_, k) => {
      if (!(k in variaveis)) throw new Error(`Variável sem valores conhecidos no rótulo "${bruto}" (${codigo}): {${k}}`);
      return variaveis[k] ? `(?:${variaveis[k].map(escapar).join('|')})` : '\\d+';
    });
    padroes.push(new RegExp(`^${re}$`));
  }
  // Título original (português) e, nos capítulos em inglês, a tradução dele (T52). O original numa
  // página em inglês só passa dentro de lang="pt-BR", porque só o português o aprova.
  paginas.forEach((p) => {
    permitidos.add(p.meta.titulo);
    if (p.meta.titulo_original) permitidos.add(p.meta.titulo_original);
    if (p.meta.traducao_titulo_original) permitidos.add(p.meta.traducao_titulo_original);
  });
  permitidos.add('contato@profmatheus.com'); // D7
  permitidos.add('%');
  const numeros = new Set();
  const andarDados = (v, chave = '') => {
    if (typeof v === 'number') {
      const f = formatarValor(v, chave, I.locale);
      const umaCasa = v.toLocaleString(I.locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      [f, umaCasa].forEach((x) => { numeros.add(x); numeros.add(`${x}%`); });
    } else if (Array.isArray(v)) v.forEach((x) => andarDados(x, chave));
    else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => andarDados(x, k));
  };
  andarDados(dados);
  const aprovado = (s) => permitidos.has(s) || numeros.has(s) || padroes.some((r) => r.test(s));
  return { paginas, aprovado };
}

const porIdioma = Object.fromEntries(Object.keys(IDIOMAS).map((c) => [c, montarIdioma(c)]));
// lang do HTML → idioma da tabela ("pt-BR" → "pt-br"; "en-US" ou "en" → "en").
const codigoDoLang = (lang) => Object.keys(IDIOMAS).find((c) => [IDIOMAS[c].lang, IDIOMAS[c].hreflang].map((x) => x.toLowerCase()).includes(String(lang).toLowerCase()));
const aprovadoNoLang = (s, lang) => {
  const c = codigoDoLang(lang);
  return Boolean(c) && porIdioma[c].aprovado(s);
};
const paginas = Object.values(porIdioma).flatMap((x) => x.paginas);

// Pré-visualização (Etapa 3): enquanto faltar tradução, o link "Read chapter N" (T5) de uma página
// em inglês leva ao capítulo em português, com o título em português (src/lib/paginas.ts). Esse
// rótulo misto só é aceito com o inglês desligado na produção e com o título inteiro dentro de
// lang="pt-BR" (LinkCapitulo.astro). Com o inglês publicado, não há capítulo sem tradução.
const t5Provisorios = new Map();
if (!INGLES_PUBLICADO) {
  const t5En = JSON.parse(readFileSync(join(raiz, IDIOMAS.en.rotulos), 'utf8')).leia_capitulo;
  const capsEn = new Set(porIdioma.en.paginas.filter((p) => p.meta.capitulo).map((p) => p.meta.pagina));
  for (const p of porIdioma['pt-br'].paginas.filter((x) => x.meta.capitulo && !capsEn.has(x.meta.pagina))) {
    t5Provisorios.set(t5En.replace('{n}', p.meta.capitulo).replace('{titulo}', p.meta.titulo), p.meta.titulo);
  }
}
const t5ProvisorioOk = (s) => {
  const titulo = t5Provisorios.get(s.t);
  if (titulo === undefined || codigoDoLang(s.lang) !== 'en') return false;
  const emPortugues = (s.partesLang ?? []).filter((x) => codigoDoLang(x.lang) === 'pt-br').map((x) => x.t).join('').replace(/\s+/g, ' ').trim();
  return emPortugues === titulo;
};

const navegador = await chromium.launch();
const contexto = await navegador.newContext({ javaScriptEnabled: false });
const erros = [];
let conferidas = 0;

for (const p of paginas) {
  const html = join(raiz, 'dist', p.meta.rota, 'index.html');
  if (!existsSync(html)) continue;
  conferidas++;
  const pagina = await contexto.newPage();
  await pagina.goto(pathToFileURL(html).href);
  const r = await pagina.evaluate(() => {
    // Cada texto solto vai com o lang mais próximo, que escolhe o idioma da conferência.
    const comLang = (t, el) => ({ t, lang: el.closest('[lang]')?.getAttribute('lang') ?? '' });
    const pular = (el) => el.closest('[aria-hidden="true"], [data-ui], script, style, template');
    const textoDe = (raizEl, dentroBloco) => {
      const w = document.createTreeWalker(raizEl, NodeFilter.SHOW_TEXT);
      const partes = [];
      const fora = [];
      for (let n = w.nextNode(); n; n = w.nextNode()) {
        const el = n.parentElement;
        if (!el || el.closest('script, style, template, [data-rotulo]')) continue;
        const t = n.textContent;
        if (!t.trim()) continue;
        if (dentroBloco && !pular(el)) partes.push(t);
        else fora.push(comLang(t.trim(), el));
      }
      return { texto: partes.join(' '), fora };
    };
    // Rótulos divididos em vários nós (ex.: última palavra presa à seta) são conferidos inteiros.
    const rotulos = [...document.querySelectorAll('[data-rotulo]')].map((el) => ({
      ...comLang(el.textContent.replace(/\s+/g, ' ').trim(), el),
      partesLang: [...el.querySelectorAll('[lang]')].map((x) => ({ lang: x.getAttribute('lang'), t: x.textContent })),
    }));
    // Atributos que o leitor de tela lê também são texto de interface. Imagens: alt="" (D47).
    const atributos = [...document.querySelectorAll('body [aria-label], body [title]')].flatMap((el) => [el.getAttribute('aria-label'), el.getAttribute('title')].filter(Boolean).map((t) => comLang(t, el)));
    const alts = [...document.querySelectorAll('img')].map((i) => i.getAttribute('alt'));
    const blocos = [...document.querySelectorAll('[data-bloco]')];
    const porBloco = blocos.map((b) => ({ id: b.dataset.bloco, ...textoDe(b, true) }));
    // Texto fora de qualquer bloco.
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const foraDosBlocos = [];
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const el = n.parentElement;
      if (!el || el.closest('script, style, template, [data-bloco], [data-rotulo]') || !n.textContent.trim()) continue;
      foraDosBlocos.push(comLang(n.textContent.trim(), el));
    }
    return { porBloco, foraDosBlocos, rotulos, atributos, alts, titulo: document.title };
  });
  await pagina.close();

  const ids = r.porBloco.map((b) => b.id);
  if (ids.join() !== p.marcas.join()) erros.push(`${p.arquivo}: blocos fora de ordem ou faltando. Página: ${ids.join(', ')} | .md: ${p.marcas.join(', ')}`);

  const publicados = r.porBloco.flatMap((b) => tokens(b.texto));
  const n = Math.max(publicados.length, p.tokens.length);
  for (let i = 0; i < n; i++) {
    if (publicados[i] !== p.tokens[i]) {
      const ctx = (arr) => arr.slice(Math.max(0, i - 6), i + 6).join(' ');
      erros.push(`${p.arquivo}: diferença na palavra ${i + 1}.\n     .md:     …${ctx(p.tokens)}…\n     página:  …${ctx(publicados)}…`);
      break;
    }
  }

  const aspasPublicadas = r.porBloco.reduce((n, b) => n + aspas(b.texto), 0);
  if (aspasPublicadas !== p.aspas) erros.push(`${p.arquivo}: número de aspas diferente. .md: ${p.aspas} | página: ${aspasPublicadas}`);

  r.alts.forEach((a) => { if (a !== '') erros.push(`${p.arquivo}: imagem com alt diferente de "" (D47): "${a}"`); });
  const soltos = [...r.foraDosBlocos, ...r.porBloco.flatMap((b) => b.fora), ...r.rotulos, ...r.atributos];
  for (const s of soltos) {
    if (!aprovadoNoLang(s.t, s.lang) && !t5ProvisorioOk(s)) erros.push(`${p.arquivo}: texto de interface não aprovado (${s.lang}): "${s.t}"`);
  }
  console.log(`  ${p.arquivo}: ${publicados.length} palavras e ${aspasPublicadas} aspas conferidas em ${ids.length} blocos; ${soltos.length} rótulos de interface conferidos; <title>: ${r.titulo}`);
}
// Páginas sem .md (ex.: 404): todo texto visível precisa ser rótulo aprovado.
const rotasMd = new Set(paginas.map((p) => join(raiz, 'dist', p.meta.rota, 'index.html')));
const htmlDoBuild = [];
const andar = (d) => readdirSync(d, { withFileTypes: true }).forEach((e) => {
  const c = join(d, e.name);
  if (e.isDirectory()) andar(c); else if (e.name.endsWith('.html')) htmlDoBuild.push(c);
});
andar(join(raiz, 'dist'));
for (const html of htmlDoBuild.filter((h) => !rotasMd.has(h))) {
  const pagina = await contexto.newPage();
  await pagina.goto(pathToFileURL(html).href);
  const textos = await pagina.evaluate(() => {
    const comLang = (t, el) => ({ t, lang: el.closest('[lang]')?.getAttribute('lang') ?? '' });
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const saida = [];
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const el = n.parentElement;
      if (!el || el.closest('script, style, template, [data-rotulo]') || !n.textContent.trim()) continue;
      saida.push(comLang(n.textContent.trim(), el));
    }
    // Rótulos divididos em vários nós (ex.: a linha de licença com links) são conferidos inteiros.
    document.querySelectorAll('[data-rotulo]').forEach((el) => saida.push(comLang(el.textContent.replace(/\s+/g, ' ').trim(), el)));
    // Nomes acessíveis (ex.: "Menu", T50 do seletor de idioma).
    document.querySelectorAll('body [aria-label], body [title]').forEach((el) => [el.getAttribute('aria-label'), el.getAttribute('title')].filter(Boolean).forEach((t) => saida.push(comLang(t, el))));
    return { saida, titulo: document.title };
  });
  await pagina.close();
  const nome = html.slice(join(raiz, 'dist').length + 1);
  textos.saida.forEach((s) => { if (!aprovadoNoLang(s.t, s.lang)) erros.push(`${nome}: texto de interface não aprovado (${s.lang}): "${s.t}"`); });
  console.log(`  ${nome}: ${textos.saida.length} textos de interface conferidos; <title>: ${textos.titulo}`);
}
await navegador.close();

if (!conferidas) erros.push('Nenhuma página do build corresponde a um .md aprovado.');
if (erros.length) {
  console.error(`conferir-texto: ${erros.length} problema(s)`);
  erros.forEach((e) => console.error(' - ' + e));
  process.exit(1);
}
const porLingua = Object.keys(IDIOMAS).map((c) => `${porIdioma[c].paginas.filter((p) => existsSync(join(raiz, 'dist', p.meta.rota, 'index.html'))).length} em ${c}`).join(', ');
console.log(`conferir-texto: ok (${conferidas} página(s) idênticas ao texto aprovado: ${porLingua}; ${htmlDoBuild.length - conferidas} sem .md, só com rótulos aprovados)`);
