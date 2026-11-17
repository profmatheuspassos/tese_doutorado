#!/usr/bin/env node
/**
 * Confere o contraste (WCAG 2.x) dos pares de cores usados no site, lendo os tokens
 * de src/styles/global.css. Texto: mínimo 4,5:1. Elementos gráficos: mínimo 3:1.
 */
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');
const cor = Object.fromEntries([...css.matchAll(/--color-([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const razao = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const claros = ['branco', 'nevoa'];
const escuros = ['grafite', 'grafite-2'];
const pares = [
  ...['tinta', 'tinta-2', 'ramo', 'semente'].flatMap((t) => claros.map((f) => [t, f, 4.5])),
  ...['linha'].flatMap((t) => claros.map((f) => [t, f, 3])),
  ...['gelo', 'gelo-2', 'ramo-escuro', 'semente-escuro', 'linha-escuro'].flatMap((t) => escuros.map((f) => [t, f, 4.5])),
];
const erros = [];
const linhas = pares.map(([t, f, min]) => {
  if (!cor[t] || !cor[f]) { erros.push(`Token ausente: ${t} ou ${f}`); return ''; }
  const r = razao(cor[t], cor[f]);
  if (r < min) erros.push(`${t} sobre ${f}: ${r.toFixed(2)} (mínimo ${min})`);
  return `${t.padEnd(15)} sobre ${f.padEnd(10)} ${r.toFixed(2).padStart(6)}  (mín. ${min})`;
});
if (process.argv.includes('--tabela')) console.log(linhas.join('\n'));
if (erros.length) { console.error('conferir-contraste: falhou'); erros.forEach((e) => console.error(' - ' + e)); process.exit(1); }
console.log(`conferir-contraste: ok (${pares.length} pares)`);
