#!/usr/bin/env node
/**
 * Testes no navegador sobre o build (astro preview), em todas as páginas que o build tem
 * (home, capítulos já feitos, "Sobre", 404):
 *  - 375, 768 e 1440 px, nos cenários normal, movimento reduzido e sem JavaScript;
 *  - nenhuma rolagem horizontal;
 *  - todo o texto dos blocos visível (opacidade 1, com tamanho) depois da rolagem;
 *  - salto direto para cada bloco (tecla End, âncora): o texto na tela aparece;
 *  - acessibilidade com axe-core (WCAG 2.2 A/AA), sem violações;
 *  - teclado: o primeiro Tab leva ao link "Pular para o conteúdo", visível;
 *  - nenhum erro no console e nenhuma requisição para fora do site;
 *  - testes próprios de cada página (interativos, com e sem JS; barra de progresso).
 *
 * Capturas versionadas (cenário normal, 375 e 1440 px, densidade 2x, JPEG 70) só com --salvar:
 *   node scripts/capturas.mjs --salvar home,capitulo-2
 * Home em docs/capturas/fase-3/ (D49); páginas novas em docs/capturas/fase-4/ (D56), com os
 * blocos listados em CAPTURAS. As demais capturas vão para a pasta de rascunho fora do
 * repositório (CAPTURAS_RASCUNHO).
 */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const exigir = createRequire(import.meta.url);
const { chromium } = exigir('playwright');
const raiz = new URL('..', import.meta.url).pathname;
const dados = JSON.parse(readFileSync(join(raiz, 'src/data/dados.json'), 'utf8'));
const rascunho = process.env.CAPTURAS_RASCUNHO || join(tmpdir(), 'capturas');
mkdirSync(rascunho, { recursive: true });
const argSalvar = process.argv.indexOf('--salvar');
const salvar = new Set(argSalvar > 0 ? (process.argv[argSalvar + 1] || '').split(',').filter(Boolean) : []);

// Blocos com captura versionada (D49 para a home; D56 para as páginas novas).
const CAPTURAS = {
  home: { pasta: 'fase-3', prefixo: '', alvos: ['B0', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'rodape'] },
  'capitulo-2': { pasta: 'fase-4', prefixo: 'cap2-', alvos: ['B0', 'B2', 'B4', 'navegacao'] },
};

// Páginas: lidas dos .md aprovados; entram as que existem no build.
const paginas = readdirSync(join(raiz, 'src/content/pt-br')).filter((f) => f.endsWith('.md')).map((f) => {
  const fm = readFileSync(join(raiz, 'src/content/pt-br', f), 'utf8').match(/^---\n([\s\S]*?)\n---/)[1];
  const rota = fm.match(/^rota:\s*"?(.*?)"?$/m)[1];
  return { nome: f.replace(/\.md$/, ''), rota };
}).filter((p) => existsSync(join(raiz, 'dist', p.rota, 'index.html')))
  .sort((a, b) => (a.rota === '/' ? -1 : b.rota === '/' ? 1 : a.rota.localeCompare(b.rota)));

const PORTA = 4329;
const BASE = `http://127.0.0.1:${PORTA}`;
const servidor = spawn(process.execPath, [join(raiz, 'node_modules/astro/bin/astro.mjs'), 'preview', '--ignore-lock', '--host', '127.0.0.1', '--port', String(PORTA)], { cwd: raiz, stdio: ['ignore', 'pipe', 'pipe'] });
await new Promise((ok, erro) => {
  const t = setTimeout(() => erro(new Error('preview não subiu')), 30000);
  servidor.stdout.on('data', (d) => { if (String(d).includes(String(PORTA))) { clearTimeout(t); ok(); } });
});

const larguras = [375, 768, 1440];
const cenarios = [
  { nome: 'normal', opcoes: {} },
  { nome: 'movimento-reduzido', opcoes: { reducedMotion: 'reduce' } },
  { nome: 'sem-js', opcoes: { javaScriptEnabled: false } },
];
const altura = (w) => (w < 500 ? 812 : 900);
const erros = [];
const resumo = [];
const navegador = await chromium.launch();
const axe = (pagina) => pagina.addScriptTag({ path: join(raiz, 'node_modules/axe-core/axe.min.js') })
  .then(() => pagina.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } })).violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')})`)));

// Testes próprios de cada página. Recebem a página já carregada e rolada.
const TESTES = {
  home: async (pagina, rotulo) => {
    // B8: a conclusão cujo negrito é só o começo da frase tem o mesmo tamanho dos títulos das outras.
    const tamanhos = await pagina.evaluate(() => [...document.querySelectorAll('[data-bloco="B8"] .conclusoes > p')]
      .map((p) => ({ strong: getComputedStyle(p.querySelector('strong')).fontSize, p: getComputedStyle(p).fontSize, frase: p.classList.contains('conclusao-frase') })));
    const tituloPadrao = tamanhos[0]?.strong;
    tamanhos.forEach((t, i) => {
      if (t.strong !== tituloPadrao || (t.frase && t.p !== tituloPadrao)) erros.push(`${rotulo}: B8, conclusão ${i + 1} com tamanho ${t.frase ? t.p : t.strong}, diferente dos títulos (${tituloPadrao})`);
    });
  },
  'capitulo-2': async (pagina, rotulo, c) => {
    // Explorador: escolher cada instituição muda a largura de "nenhuma confiança" para o valor do
    // dados.json, também sem JavaScript; só a tabela da instituição escolhida fica visível.
    const serie = dados.confianca_instituicoes_br;
    for (const inst of ['partidos', 'tse', 'congresso']) {
      await pagina.locator(`#exp-${inst}`).check();
      await pagina.waitForTimeout(c.nome === 'movimento-reduzido' ? 50 : 900);
      const r = await pagina.evaluate((i) => {
        const linhas = [...document.querySelectorAll('[data-explorador] .exp-linha')];
        const larguras = linhas.map((l) => { const s = l.querySelector('.exp-seg-nenhuma'); return (s.getBoundingClientRect().width / s.parentElement.getBoundingClientRect().width) * 100; });
        const tabelas = [...document.querySelectorAll('[data-explorador] .exp-tabela')].filter((t) => getComputedStyle(t).display !== 'none').map((t) => t.dataset.i);
        return { larguras, tabelas, escolhido: i };
      }, inst);
      serie.anos.forEach((ano, k) => {
        const esperado = serie.instituicoes[inst].valores.nenhuma[k];
        if (Math.abs(r.larguras[k] - esperado) > 0.6) erros.push(`${rotulo}: explorador, ${inst} ${ano}: "nenhuma" com ${r.larguras[k].toFixed(1)}%, esperado ${esperado}%`);
      });
      if (r.tabelas.join() !== inst) erros.push(`${rotulo}: explorador, tabelas visíveis ${JSON.stringify(r.tabelas)} com ${inst} escolhido`);
    }
    // Teclado: as setas trocam a instituição.
    await pagina.locator('#exp-congresso').focus();
    await pagina.keyboard.press('ArrowRight');
    const marcado = await pagina.evaluate(() => document.querySelector('[data-explorador] input:checked')?.value);
    if (marcado !== 'governo') erros.push(`${rotulo}: explorador, seta para a direita não passou de Congresso para Governo (${marcado})`);
    await pagina.locator('#exp-congresso').check();
  },
};

// Barra de progresso (páginas internas): avança com a rolagem, exceto sem JS em navegador sem
// animation-timeline, onde não aparece. O Chromium tem animation-timeline, então ela aparece sempre.
async function testarProgresso(pagina, rotulo) {
  const existe = await pagina.locator('[data-progresso]').count();
  if (!existe) return;
  await pagina.evaluate(() => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) / 2));
  await pagina.waitForTimeout(200);
  const escala = await pagina.evaluate(() => {
    const m = getComputedStyle(document.querySelector('[data-progresso]')).transform.match(/matrix\(([^,]+)/);
    return m ? Number(m[1]) : 0;
  });
  if (escala < 0.35 || escala > 0.65) erros.push(`${rotulo}: barra de progresso em ${escala.toFixed(2)} no meio da página`);
  await pagina.evaluate(() => scrollTo(0, 0));
}

for (const pg of paginas) {
  const URL_ = `${BASE}${pg.rota}`;
  for (const c of cenarios) {
    for (const w of larguras) {
      const ctx = await navegador.newContext({ viewport: { width: w, height: altura(w) }, deviceScaleFactor: 1, ...c.opcoes });
      const pagina = await ctx.newPage();
      const rotulo = `${pg.nome} ${c.nome} ${w}px`;
      pagina.on('console', (m) => { if (m.type() === 'error') erros.push(`${rotulo}: erro no console: ${m.text()}`); });
      pagina.on('pageerror', (e) => erros.push(`${rotulo}: erro de JS: ${e.message}`));
      pagina.on('request', (r) => { if (!r.url().startsWith(BASE) && !r.url().startsWith('data:')) erros.push(`${rotulo}: requisição para fora: ${r.url()}`); });

      await pagina.goto(URL_, { waitUntil: 'networkidle' });
      await pagina.evaluate(() => document.fonts.ready.then(() => true));

      // Rola a página inteira devagar, para disparar as animações, e volta ao topo.
      // A espera é feita pelo Playwright: sem JS na página, timers da página não rodam.
      const alturaTotal = await pagina.evaluate(() => document.body.scrollHeight);
      const passo = Math.round(altura(w) * 0.6);
      for (let y = 0; y < alturaTotal; y += passo) { await pagina.mouse.wheel(0, passo); await pagina.waitForTimeout(c.nome === 'normal' ? 120 : 10); }
      await pagina.waitForTimeout(c.nome === 'normal' ? 2200 : 100);
      await pagina.evaluate(() => scrollTo(0, 0));
      await pagina.waitForTimeout(300);

      const estado = await pagina.evaluate(() => {
        const larguraExcedente = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        const invisiveis = [];
        for (const el of document.querySelectorAll('[data-bloco] :is(h1,h2,h3,p,li,th,td)')) {
          if (el.closest('[aria-hidden="true"], details:not([open])')) continue;
          let op = 1;
          for (let a = el; a; a = a.parentElement) op *= Number(getComputedStyle(a).opacity);
          const r = el.getBoundingClientRect();
          // Tabelas do explorador que não são a escolhida ficam fora de propósito (display: none).
          if (el.closest('.exp-tabela') && getComputedStyle(el.closest('.exp-tabela')).display === 'none') continue;
          if (op < 0.99 || r.width === 0 || r.height === 0 || getComputedStyle(el).visibility === 'hidden') invisiveis.push(`${el.closest('[data-bloco]').dataset.bloco} <${el.tagName.toLowerCase()}> "${el.textContent.trim().slice(0, 40)}" (opacidade ${op.toFixed(2)})`);
        }
        return { larguraExcedente, invisiveis, altura: document.body.scrollHeight };
      });
      if (estado.larguraExcedente > 0) erros.push(`${rotulo}: rolagem horizontal de ${estado.larguraExcedente}px`);
      estado.invisiveis.forEach((i) => erros.push(`${rotulo}: texto invisível: ${i}`));

      // Salto direto para cada bloco: o texto na tela precisa aparecer.
      if (c.nome === 'normal') {
        const ctxSalto = await navegador.newContext({ viewport: { width: w, height: altura(w) } });
        const ps = await ctxSalto.newPage();
        await ps.goto(URL_, { waitUntil: 'networkidle' });
        const ids = await ps.evaluate(() => [...document.querySelectorAll('[data-bloco]')].map((b) => b.dataset.bloco));
        for (const id of ids.reverse()) {
          await ps.evaluate((a) => document.querySelector(`[data-bloco="${a}"]`).scrollIntoView(), id);
          await ps.waitForTimeout(pg.nome === 'home' ? 1800 : 600);
          const escondidos = await ps.evaluate((a) => [...document.querySelectorAll(`[data-bloco="${a}"] :is(h1,h2,h3,p,li,td)`)]
            .filter((e) => { const r = e.getBoundingClientRect(); return r.top < innerHeight * 0.85 && r.bottom > 0 && !e.closest('[aria-hidden="true"]'); })
            .filter((e) => { let op = 1; for (let x = e; x; x = x.parentElement) op *= Number(getComputedStyle(x).opacity); return op < 0.99; })
            .map((e) => e.textContent.trim().slice(0, 30)), id);
          escondidos.forEach((t) => erros.push(`${rotulo}: depois de saltar para ${id}, texto ainda escondido: "${t}"`));
        }
        await ctxSalto.close();
      }

      // Teclado: o primeiro Tab vai para o link de pular.
      if (c.nome !== 'sem-js' || w === 375) {
        await pagina.evaluate(() => { scrollTo(0, 0); document.activeElement?.blur(); });
        await pagina.keyboard.press('Tab');
        const foco = await pagina.evaluate(() => {
          const a = document.activeElement;
          const r = a.getBoundingClientRect();
          return { texto: a.textContent.trim(), visivel: r.width > 1 && r.height > 1, href: a.getAttribute('href') };
        });
        if (foco.href !== '#conteudo' || !foco.visivel) erros.push(`${rotulo}: primeiro Tab não leva ao link de pular visível (${JSON.stringify(foco)})`);
        await pagina.keyboard.press('Escape');
        await pagina.evaluate(() => document.activeElement.blur());
      }

      if (TESTES[pg.nome]) await TESTES[pg.nome](pagina, rotulo, c, w);
      await testarProgresso(pagina, rotulo);

      // Acessibilidade (axe-core local), no cenário de movimento reduzido.
      let violacoes = '-';
      if (c.nome === 'movimento-reduzido') {
        const r = await axe(pagina);
        violacoes = String(r.length);
        r.forEach((v) => erros.push(`${rotulo}: axe: ${v}`));
      }

      await pagina.screenshot({ path: join(rascunho, `${pg.nome}-${c.nome}-${w}.jpg`), fullPage: true, type: 'jpeg', quality: 70 });
      const config = CAPTURAS[pg.nome];
      const versionada = salvar.has(pg.nome) && config && c.nome === 'normal' && (w === 375 || w === 1440);
      if (versionada) {
        const pasta = join(raiz, 'docs/capturas', config.pasta);
        mkdirSync(pasta, { recursive: true });
        const ctx2 = await navegador.newContext({ viewport: { width: w, height: altura(w) }, deviceScaleFactor: 2 });
        const p2 = await ctx2.newPage();
        await p2.goto(URL_, { waitUntil: 'networkidle' });
        await p2.evaluate(() => document.fonts.ready.then(() => true));
        for (const b of config.alvos) {
          const loc = p2.locator(b === 'rodape' ? 'footer' : b === 'navegacao' ? '[data-navegacao]' : `[data-bloco="${b}"]`);
          // Percorre o bloco inteiro antes da captura, para que todas as animações tenham disparado.
          const caixa = await loc.evaluate((el) => { const r = el.getBoundingClientRect(); return { topo: r.top + scrollY, altura: r.height }; });
          for (let y = caixa.topo - 200; y <= caixa.topo + caixa.altura; y += 300) { await p2.evaluate((v) => scrollTo(0, v), y); await p2.waitForTimeout(150); }
          await p2.waitForTimeout(pg.nome === 'home' ? 2600 : 900);
          // O cabeçalho fixo e a barra de progresso se repetiriam no meio da imagem do bloco.
          await loc.screenshot({ path: join(pasta, `${config.prefixo}${b}-${w}.jpg`), type: 'jpeg', quality: 70, style: 'header{position:static!important}[data-progresso]{display:none!important}' });
        }
        await ctx2.close();
      }
      resumo.push(`${rotulo.padEnd(36)} altura ${String(estado.altura).padStart(6)}px · excedente ${estado.larguraExcedente}px · texto invisível ${estado.invisiveis.length} · axe ${violacoes}`);
      await ctx.close();
    }
  }
}

// Página 404: status, sem rolagem horizontal, sem violação do axe; captura versionada com a home.
for (const w of larguras) {
  for (const c of cenarios) {
    const ctx = await navegador.newContext({ viewport: { width: w, height: altura(w) }, deviceScaleFactor: salvar.has('home') && c.nome === 'normal' && w !== 768 ? 2 : 1, ...c.opcoes });
    const pagina = await ctx.newPage();
    const rotulo = `404 ${c.nome} ${w}px`;
    pagina.on('pageerror', (e) => erros.push(`${rotulo}: erro de JS: ${e.message}`));
    const resp = await pagina.goto(`${BASE}/rota-que-nao-existe/`, { waitUntil: 'networkidle' });
    if (resp.status() !== 404) erros.push(`${rotulo}: status ${resp.status()} (esperado 404)`);
    const excedente = await pagina.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (excedente > 0) erros.push(`${rotulo}: rolagem horizontal de ${excedente}px`);
    if (c.nome === 'movimento-reduzido') (await axe(pagina)).forEach((v) => erros.push(`${rotulo}: axe: ${v}`));
    if (salvar.has('home') && c.nome === 'normal' && w !== 768) await pagina.screenshot({ path: join(raiz, 'docs/capturas/fase-3', `404-${w}.jpg`), type: 'jpeg', quality: 70 });
    await ctx.close();
  }
}
resumo.push('404: 9 combinações testadas (status, rolagem horizontal, axe)');
await navegador.close();
servidor.kill();

console.log(resumo.join('\n'));
if (erros.length) { console.error(`capturas: ${erros.length} problema(s)`); erros.forEach((e) => console.error(' - ' + e)); process.exit(1); }
console.log(`capturas: ok (${paginas.length} página(s) x ${cenarios.length * larguras.length} combinações; ${salvar.size ? `capturas versionadas de ${[...salvar].join(', ')}` : 'sem capturas versionadas'}; rascunho em ${rascunho})`);
