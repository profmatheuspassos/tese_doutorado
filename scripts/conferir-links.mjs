#!/usr/bin/env node
/**
 * Confere os links internos do build: todo href que aponta para o próprio site precisa abrir um
 * arquivo do dist/ (e toda âncora #id, um elemento com esse id na página de destino).
 * Enquanto a Fase 4 não termina, links para páginas ainda não feitas são só avisos; com
 * LINKS_ESTRITO=1 (ou --estrito), qualquer link quebrado faz o build falhar.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = new URL('../dist', import.meta.url).pathname;
const estrito = process.env.LINKS_ESTRITO === '1' || process.argv.includes('--estrito');
const base = (process.env.BASE_PATH || '/').replace(/\/?$/, '/');
const htmls = [];
const andar = (d) => readdirSync(d).forEach((f) => { const p = join(d, f); statSync(p).isDirectory() ? andar(p) : p.endsWith('.html') && htmls.push(p); });
andar(dist);

const ids = new Map();
const idsDe = (arquivo) => {
  if (!ids.has(arquivo)) ids.set(arquivo, new Set([...readFileSync(arquivo, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  return ids.get(arquivo);
};
const destino = (caminho) => {
  const limpo = decodeURIComponent(caminho.slice(base.length - 1));
  const candidatos = [join(dist, limpo), join(dist, limpo, 'index.html')];
  return candidatos.find((c) => existsSync(c) && statSync(c).isFile());
};

const quebrados = [];
let conferidos = 0;
for (const arquivo of htmls) {
  const nome = relative(dist, arquivo);
  const html = readFileSync(arquivo, 'utf8');
  for (const m of html.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)) {
    const href = m[1].replace(/&amp;/g, '&');
    if (/^(https?:|mailto:|tel:)/i.test(href)) continue;
    conferidos++;
    const [caminho, ancora] = href.split('#');
    const alvo = caminho === '' ? arquivo : destino(caminho);
    if (!alvo) { quebrados.push(`${nome}: ${href} (página inexistente)`); continue; }
    if (ancora && !idsDe(alvo).has(ancora)) quebrados.push(`${nome}: ${href} (âncora inexistente)`);
  }
}

const unicos = [...new Set(quebrados)];
if (unicos.length && estrito) {
  console.error(`conferir-links: ${unicos.length} link(s) interno(s) quebrado(s)`);
  unicos.forEach((q) => console.error(' - ' + q));
  process.exit(1);
}
unicos.forEach((q) => console.log('  aviso: link interno ainda sem página: ' + q));
console.log(`conferir-links: ok (${conferidos} links internos em ${htmls.length} páginas${unicos.length ? `; ${unicos.length} aviso(s), páginas ainda não feitas` : ''})`);
