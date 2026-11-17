#!/usr/bin/env node
/**
 * Roda o Lighthouse (pacote local) sobre o build, no celular e no desktop, com o Chromium
 * já instalado no ambiente. Falha se alguma categoria ficar abaixo de 90.
 */
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const raiz = new URL('..', import.meta.url).pathname;
const PORTA = 4331;
const URL_ = `http://127.0.0.1:${PORTA}/`;
const chrome = ['/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', process.env.CHROME_PATH].find((p) => p && existsSync(p));
if (!chrome) throw new Error('Chromium não encontrado.');
const pasta = join(raiz, 'docs/capturas/fase-3/lighthouse');
mkdirSync(pasta, { recursive: true });

const servidor = spawn(process.execPath, [join(raiz, 'node_modules/astro/bin/astro.mjs'), 'preview', '--ignore-lock', '--host', '127.0.0.1', '--port', String(PORTA)], { cwd: raiz, stdio: ['ignore', 'pipe', 'pipe'] });
await new Promise((ok, erro) => {
  const t = setTimeout(() => erro(new Error('preview não subiu')), 30000);
  servidor.stdout.on('data', (d) => { if (String(d).includes(String(PORTA))) { clearTimeout(t); ok(); } });
});

const erros = [];
try {
  for (const modo of ['celular', 'desktop']) {
    const saida = join(pasta, `home-${modo}.json`);
    const args = [join(raiz, 'node_modules/lighthouse/cli/index.js'), URL_, '--quiet', `--chrome-flags=--headless=new --no-sandbox`, '--output=json', `--output-path=${saida}`];
    if (modo === 'desktop') args.push('--preset=desktop');
    execFileSync(process.execPath, args, { env: { ...process.env, CHROME_PATH: chrome }, stdio: 'inherit', timeout: 240000 });
    const r = JSON.parse(readFileSync(saida, 'utf8'));
    const notas = Object.values(r.categories).map((c) => [c.title, Math.round(c.score * 100)]);
    console.log(`${modo.padEnd(8)} ${notas.map(([t, n]) => `${t}: ${n}`).join(' · ')} · LCP ${r.audits['largest-contentful-paint'].displayValue} · CLS ${r.audits['cumulative-layout-shift'].displayValue} · TBT ${r.audits['total-blocking-time'].displayValue}`);
    notas.forEach(([t, n]) => { if (n < 90) erros.push(`${modo}: ${t} = ${n}`); });
  }
} finally {
  servidor.kill();
}
if (erros.length) { console.error('lighthouse: abaixo de 90 -> ' + erros.join('; ')); process.exit(1); }
console.log('lighthouse: ok (todas as categorias com 90 ou mais)');
