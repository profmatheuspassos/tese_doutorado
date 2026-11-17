#!/usr/bin/env node
/**
 * Roda o Lighthouse (pacote local) sobre o build, no celular e no desktop, com o Chromium já
 * instalado no ambiente, em todas as páginas que o build tem (lidas dos .md aprovados).
 * Falha se alguma categoria ficar abaixo de 90. Só o resumo vai para o repositório
 * (docs/capturas/fase-4/lighthouse/resumo.md, D59); os relatórios JSON completos ficam numa pasta
 * de rascunho fora dele (LIGHTHOUSE_RASCUNHO).
 */
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const raiz = new URL('..', import.meta.url).pathname;
const PORTA = 4331;
const BASE = `http://127.0.0.1:${PORTA}`;
const chrome = ['/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', process.env.CHROME_PATH].find((p) => p && existsSync(p));
if (!chrome) throw new Error('Chromium não encontrado.');
const pasta = join(raiz, 'docs/capturas/fase-4/lighthouse');
const rascunho = process.env.LIGHTHOUSE_RASCUNHO || join(tmpdir(), 'lighthouse');
mkdirSync(pasta, { recursive: true });
mkdirSync(rascunho, { recursive: true });

const paginas = readdirSync(join(raiz, 'src/content/pt-br')).filter((f) => f.endsWith('.md')).map((f) => {
  const fm = readFileSync(join(raiz, 'src/content/pt-br', f), 'utf8').match(/^---\n([\s\S]*?)\n---/)[1];
  return { nome: f.replace(/\.md$/, ''), rota: fm.match(/^rota:\s*"?(.*?)"?$/m)[1] };
}).filter((p) => existsSync(join(raiz, 'dist', p.rota, 'index.html')))
  .sort((a, b) => (a.rota === '/' ? -1 : b.rota === '/' ? 1 : a.rota.localeCompare(b.rota)));

const servidor = spawn(process.execPath, [join(raiz, 'node_modules/astro/bin/astro.mjs'), 'preview', '--ignore-lock', '--host', '127.0.0.1', '--port', String(PORTA)], { cwd: raiz, stdio: ['ignore', 'pipe', 'pipe'] });
await new Promise((ok, erro) => {
  const t = setTimeout(() => erro(new Error('preview não subiu')), 30000);
  servidor.stdout.on('data', (d) => { if (String(d).includes(String(PORTA))) { clearTimeout(t); ok(); } });
});

const erros = [];
const linhas = [];
let categorias = [];
try {
  for (const pg of paginas) {
    for (const modo of ['celular', 'desktop']) {
      const saida = join(rascunho, `${pg.nome}-${modo}.json`);
      const args = [join(raiz, 'node_modules/lighthouse/cli/index.js'), `${BASE}${pg.rota}`, '--quiet', `--chrome-flags=--headless=new --no-sandbox`, '--output=json', `--output-path=${saida}`];
      if (modo === 'desktop') args.push('--preset=desktop');
      execFileSync(process.execPath, args, { env: { ...process.env, CHROME_PATH: chrome }, stdio: 'inherit', timeout: 240000 });
      const r = JSON.parse(readFileSync(saida, 'utf8'));
      const notas = Object.values(r.categories).map((c) => [c.title, Math.round(c.score * 100)]);
      const a = (k) => r.audits[k].displayValue;
      console.log(`${pg.nome.padEnd(11)} ${modo.padEnd(8)} ${notas.map(([t, n]) => `${t}: ${n}`).join(' · ')} · LCP ${a('largest-contentful-paint')} · CLS ${a('cumulative-layout-shift')} · TBT ${a('total-blocking-time')}`);
      if (!categorias.length) categorias = notas.map(([t]) => t);
      linhas.push(`| ${pg.nome} | ${modo} | ${notas.map(([, n]) => n).join(' | ')} | ${a('largest-contentful-paint')} | ${a('cumulative-layout-shift')} | ${a('total-blocking-time')} |`);
      notas.forEach(([t, n]) => { if (n < 90) erros.push(`${pg.nome} ${modo}: ${t} = ${n}`); });
    }
  }
} finally {
  servidor.kill();
}
writeFileSync(join(pasta, 'resumo.md'), `# Lighthouse (Fase 4)\n\nGerado por \`npm run lighthouse\` sobre o build local. Mínimo exigido: 90 em todas as categorias.\n\n${[`| Página | Modo | ${categorias.join(' | ')} | LCP | CLS | TBT |`, `|${'---|'.repeat(categorias.length + 5)}`, ...linhas].join('\n')}\n`);
if (erros.length) { console.error('lighthouse: abaixo de 90 -> ' + erros.join('; ')); process.exit(1); }
console.log(`lighthouse: ok (${paginas.length} página(s), todas as categorias com 90 ou mais; resumo em ${join(pasta, 'resumo.md')}; JSON em ${rascunho})`);
