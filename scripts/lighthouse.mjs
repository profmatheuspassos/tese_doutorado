#!/usr/bin/env node
/**
 * Roda o Lighthouse (pacote local) sobre o build, no celular e no desktop, com o Chromium já
 * instalado no ambiente, em todas as páginas que o build tem (lidas dos .md aprovados).
 * Falha se alguma categoria ficar abaixo de 90. A home no celular, onde a nota oscila mais, roda
 * RODADAS_HOME vezes (padrão 5): todas precisam passar, e o resumo registra a pior rodada, com as
 * notas de desempenho de todas. Só o resumo vai para o repositório
 * (docs/capturas/fase-4/lighthouse/resumo.md, D59); os relatórios JSON completos ficam numa pasta
 * de rascunho fora dele (LIGHTHOUSE_RASCUNHO).
 *
 * Com LIGHTHOUSE_URL (ex.: LIGHTHOUSE_URL=https://tese.profmatheuspassos.com.br npm run lighthouse),
 * mede o endereço publicado, sem subir o servidor local, e grava o resumo em
 * docs/capturas/fase-5/lighthouse/resumo.md.
 */
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const raiz = new URL('..', import.meta.url).pathname;
const PORTA = 4331;
const RODADAS_HOME = Number(process.env.RODADAS_HOME || 5);
const NO_AR = process.env.LIGHTHOUSE_URL?.replace(/\/$/, '');
const BASE = NO_AR || `http://127.0.0.1:${PORTA}`;
const chrome = ['/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', process.env.CHROME_PATH].find((p) => p && existsSync(p));
if (!chrome) throw new Error('Chromium não encontrado.');
const pasta = join(raiz, NO_AR ? 'docs/capturas/fase-5/lighthouse' : 'docs/capturas/fase-4/lighthouse');
const rascunho = process.env.LIGHTHOUSE_RASCUNHO || join(tmpdir(), 'lighthouse');
mkdirSync(pasta, { recursive: true });
mkdirSync(rascunho, { recursive: true });

const paginas = readdirSync(join(raiz, 'src/content/pt-br')).filter((f) => f.endsWith('.md')).map((f) => {
  const fm = readFileSync(join(raiz, 'src/content/pt-br', f), 'utf8').match(/^---\n([\s\S]*?)\n---/)[1];
  return { nome: f.replace(/\.md$/, ''), rota: fm.match(/^rota:\s*"?(.*?)"?$/m)[1] };
}).filter((p) => NO_AR || existsSync(join(raiz, 'dist', p.rota, 'index.html')))
  .sort((a, b) => (a.rota === '/' ? -1 : b.rota === '/' ? 1 : a.rota.localeCompare(b.rota)));

const servidor = NO_AR ? null : spawn(process.execPath, [join(raiz, 'node_modules/astro/bin/astro.mjs'), 'preview', '--ignore-lock', '--host', '127.0.0.1', '--port', String(PORTA)], { cwd: raiz, stdio: ['ignore', 'pipe', 'pipe'] });
if (servidor) {
  await new Promise((ok, erro) => {
    const t = setTimeout(() => erro(new Error('preview não subiu')), 30000);
    servidor.stdout.on('data', (d) => { if (String(d).includes(String(PORTA))) { clearTimeout(t); ok(); } });
  });
}

const erros = [];
const linhas = [];
let categorias = [];
try {
  for (const pg of paginas) {
    for (const modo of ['celular', 'desktop']) {
      const vezes = pg.nome === 'home' && modo === 'celular' ? RODADAS_HOME : 1;
      const rodadas = [];
      for (let k = 0; k < vezes; k++) {
        const saida = join(rascunho, `${pg.nome}-${modo}${vezes > 1 ? `-${k + 1}` : ''}.json`);
        // No endereço publicado, atrás de um proxy (como na nuvem), o Chrome sai por ele.
        const proxy = NO_AR && process.env.HTTPS_PROXY ? ` --proxy-server=${process.env.HTTPS_PROXY}` : '';
        const args = [join(raiz, 'node_modules/lighthouse/cli/index.js'), `${BASE}${pg.rota}`, '--quiet', `--chrome-flags=--headless=new --no-sandbox${proxy}`, '--output=json', `--output-path=${saida}`];
        if (modo === 'desktop') args.push('--preset=desktop');
        execFileSync(process.execPath, args, { env: { ...process.env, CHROME_PATH: chrome }, stdio: 'inherit', timeout: 240000 });
        const r = JSON.parse(readFileSync(saida, 'utf8'));
        const notas = Object.values(r.categories).map((c) => [c.title, Math.round(c.score * 100)]);
        const a = (k2) => r.audits[k2].displayValue;
        console.log(`${pg.nome.padEnd(11)} ${modo.padEnd(8)} ${notas.map(([t, n]) => `${t}: ${n}`).join(' · ')} · LCP ${a('largest-contentful-paint')} · CLS ${a('cumulative-layout-shift')} · TBT ${a('total-blocking-time')}${vezes > 1 ? ` (rodada ${k + 1} de ${vezes})` : ''}`);
        notas.forEach(([t, n]) => { if (n < 90) erros.push(`${pg.nome} ${modo}${vezes > 1 ? ` rodada ${k + 1}` : ''}: ${t} = ${n}`); });
        rodadas.push({ notas, lcp: a('largest-contentful-paint'), cls: a('cumulative-layout-shift'), tbt: a('total-blocking-time'), soma: notas.reduce((x, [, n]) => x + n, 0) });
      }
      // A pior rodada (menor desempenho; no empate, menor soma das notas) vai para o resumo.
      const pior = rodadas.reduce((x, y) => (y.notas[0][1] < x.notas[0][1] || (y.notas[0][1] === x.notas[0][1] && y.soma < x.soma) ? y : x));
      const { notas } = pior;
      if (!categorias.length) categorias = notas.map(([t]) => t);
      const rotuloModo = vezes > 1 ? `${modo}, pior de ${vezes} (desempenho: ${rodadas.map((x) => x.notas[0][1]).join(', ')})` : modo;
      linhas.push(`| ${pg.nome} | ${rotuloModo} | ${notas.map(([, n]) => n).join(' | ')} | ${pior.lcp} | ${pior.cls} | ${pior.tbt} |`);
    }
  }
} finally {
  servidor?.kill();
}
const origem = NO_AR ? `Fase 5)\n\nGerado por \`npm run lighthouse\` com \`LIGHTHOUSE_URL=${NO_AR}\`, no endereço publicado.` : 'Fase 4)\n\nGerado por `npm run lighthouse` sobre o build local.';
writeFileSync(join(pasta, 'resumo.md'), `# Lighthouse (${origem} Mínimo exigido: 90 em todas as categorias. A home no celular roda ${RODADAS_HOME} vezes; a linha dela é a pior rodada.\n\n${[`| Página | Modo | ${categorias.join(' | ')} | LCP | CLS | TBT |`, `|${'---|'.repeat(categorias.length + 5)}`, ...linhas].join('\n')}\n`);
if (erros.length) { console.error('lighthouse: abaixo de 90 -> ' + erros.join('; ')); process.exit(1); }
console.log(`lighthouse: ok (${paginas.length} página(s), todas as categorias com 90 ou mais; resumo em ${join(pasta, 'resumo.md')}; JSON em ${rascunho})`);
