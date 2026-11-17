#!/usr/bin/env node
/**
 * Testes no navegador sobre o build (astro preview):
 *  - capturas em 375, 768 e 1440 px, nos cenários normal, movimento reduzido e sem JavaScript;
 *  - nenhuma rolagem horizontal;
 *  - todo o texto dos blocos visível (opacidade 1, com tamanho) depois da rolagem;
 *  - acessibilidade com axe-core (WCAG 2.2 A/AA), sem violações;
 *  - teclado: o primeiro Tab leva ao link "Pular para o conteúdo", visível;
 *  - nenhum erro no console e nenhuma requisição para fora do site.
 * Salva no repositório (docs/capturas/fase-3/) só o cenário normal, em 375 e 1440 px, uma
 * captura por bloco desenhado (JPEG 70, densidade 2x). As capturas de página inteira e as dos
 * outros cenários vão para uma pasta de rascunho fora do repositório (CAPTURAS_RASCUNHO).
 * Uso: node scripts/capturas.mjs B0,B1,B2,B3,B4
 */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const exigir = createRequire(import.meta.url);
const { chromium } = exigir('playwright');
const raiz = new URL('..', import.meta.url).pathname;
const saida = join(raiz, 'docs/capturas/fase-3');
const rascunho = process.env.CAPTURAS_RASCUNHO || join(tmpdir(), 'capturas-fase-3');
const destaques = (process.argv[2] || '').split(',').filter(Boolean);
mkdirSync(saida, { recursive: true });
mkdirSync(rascunho, { recursive: true });
const versionada = (cenario, w) => cenario === 'normal' && (w === 375 || w === 1440);

const PORTA = 4329;
const BASE = `http://127.0.0.1:${PORTA}/`;
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
const erros = [];
const resumo = [];
const navegador = await chromium.launch();

for (const c of cenarios) {
  for (const w of larguras) {
    const ctx = await navegador.newContext({ viewport: { width: w, height: w < 500 ? 812 : 900 }, deviceScaleFactor: 1, ...c.opcoes });
    const pagina = await ctx.newPage();
    const rotulo = `${c.nome} ${w}px`;
    pagina.on('console', (m) => { if (m.type() === 'error') erros.push(`${rotulo}: erro no console: ${m.text()}`); });
    pagina.on('pageerror', (e) => erros.push(`${rotulo}: erro de JS: ${e.message}`));
    pagina.on('request', (r) => { if (!r.url().startsWith(BASE) && !r.url().startsWith('data:')) erros.push(`${rotulo}: requisição para fora: ${r.url()}`); });

    await pagina.goto(BASE, { waitUntil: 'networkidle' });
    await pagina.evaluate(() => document.fonts.ready.then(() => true));

    // Rola a página inteira devagar, para disparar as animações, e volta ao topo.
    // A espera é feita pelo Playwright: sem JS na página, timers da página não rodam.
    const alturaTotal = await pagina.evaluate(() => document.body.scrollHeight);
    const passo = Math.round((w < 500 ? 812 : 900) * 0.6);
    for (let y = 0; y < alturaTotal; y += passo) { await pagina.mouse.wheel(0, passo); await pagina.waitForTimeout(c.nome === 'normal' ? 120 : 10); }
    await pagina.waitForTimeout(c.nome === 'normal' ? 2200 : 100);
    await pagina.evaluate(() => scrollTo(0, 0));
    await pagina.waitForTimeout(300);

    const estado = await pagina.evaluate(() => {
      const larguraExcedente = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      const invisiveis = [];
      for (const el of document.querySelectorAll('[data-bloco] :is(h1,h2,h3,p,li,th,td)')) {
        if (el.closest('[aria-hidden="true"]')) continue;
        let op = 1;
        for (let a = el; a; a = a.parentElement) op *= Number(getComputedStyle(a).opacity);
        const r = el.getBoundingClientRect();
        if (op < 0.99 || r.width === 0 || r.height === 0 || getComputedStyle(el).visibility === 'hidden') invisiveis.push(`${el.closest('[data-bloco]').dataset.bloco} <${el.tagName.toLowerCase()}> "${el.textContent.trim().slice(0, 40)}" (opacidade ${op.toFixed(2)})`);
      }
      return { larguraExcedente, invisiveis, altura: document.body.scrollHeight };
    });
    // Salto direto para cada bloco (tecla End, link de âncora): o texto na tela precisa aparecer.
    if (c.nome === 'normal') {
      const ctxSalto = await navegador.newContext({ viewport: { width: w, height: w < 500 ? 812 : 900 } });
      const ps = await ctxSalto.newPage();
      await ps.goto(BASE, { waitUntil: 'networkidle' });
      const ids = await ps.evaluate(() => [...document.querySelectorAll('[data-bloco]')].map((b) => b.dataset.bloco));
      for (const id of ids.reverse()) {
        await ps.evaluate((a) => document.querySelector(`[data-bloco="${a}"]`).scrollIntoView(), id);
        await ps.waitForTimeout(1800);
        const escondidos = await ps.evaluate((a) => [...document.querySelectorAll(`[data-bloco="${a}"] :is(h1,h2,h3,p,li,td)`)]
          .filter((e) => { const r = e.getBoundingClientRect(); return r.top < innerHeight * 0.85 && r.bottom > 0 && !e.closest('[aria-hidden="true"]'); })
          .filter((e) => { let op = 1; for (let x = e; x; x = x.parentElement) op *= Number(getComputedStyle(x).opacity); return op < 0.99; })
          .map((e) => e.textContent.trim().slice(0, 30)), id);
        escondidos.forEach((t) => erros.push(`${rotulo}: depois de saltar para ${id}, texto ainda escondido: "${t}"`));
      }
      await ctxSalto.close();
    }

    // B8: a conclusão cujo negrito é só o começo da frase tem o mesmo tamanho dos títulos das outras.
    const tamanhos = await pagina.evaluate(() => {
      const ps = [...document.querySelectorAll('[data-bloco="B8"] .conclusoes > p')];
      return ps.map((p) => ({ strong: getComputedStyle(p.querySelector('strong')).fontSize, p: getComputedStyle(p).fontSize, frase: p.classList.contains('conclusao-frase') }));
    });
    const tituloPadrao = tamanhos[0]?.strong;
    tamanhos.forEach((t, i) => {
      if (t.strong !== tituloPadrao || (t.frase && t.p !== tituloPadrao)) erros.push(`${rotulo}: B8, conclusão ${i + 1} com tamanho ${t.frase ? t.p : t.strong}, diferente dos títulos (${tituloPadrao})`);
    });
    if (estado.larguraExcedente > 0) erros.push(`${rotulo}: rolagem horizontal de ${estado.larguraExcedente}px`);
    estado.invisiveis.forEach((i) => erros.push(`${rotulo}: texto invisível: ${i}`));

    // Acessibilidade (axe-core local), no cenário de movimento reduzido.
    let violacoes = '-';
    if (c.nome === 'movimento-reduzido') {
      await pagina.addScriptTag({ path: join(raiz, 'node_modules/axe-core/axe.min.js') });
      const r = await pagina.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } })).violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`));
      violacoes = String(r.length);
      r.forEach((v) => erros.push(`${rotulo}: axe: ${v}`));
    }

    // Teclado: o primeiro Tab vai para o link de pular.
    if (c.nome !== 'sem-js' || w === 375) {
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

    await pagina.screenshot({ path: join(rascunho, `pagina-${c.nome}-${w}.jpg`), fullPage: true, type: 'jpeg', quality: 70 });
    if (destaques.length) {
      const ctx2 = await navegador.newContext({ viewport: { width: w, height: w < 500 ? 812 : 900 }, deviceScaleFactor: versionada(c.nome, w) ? 2 : 1, ...c.opcoes });
      const p2 = await ctx2.newPage();
      await p2.goto(BASE, { waitUntil: 'networkidle' });
      await p2.evaluate(() => document.fonts.ready.then(() => true));
      for (const b of destaques) {
        const loc = p2.locator(b === 'rodape' ? 'footer' : `[data-bloco="${b}"]`);
        // Percorre o bloco inteiro antes da captura, para que todas as animações tenham disparado.
        const caixa = await loc.evaluate((el) => { const r = el.getBoundingClientRect(); return { topo: r.top + scrollY, altura: r.height }; });
        for (let y = caixa.topo - 200; y <= caixa.topo + caixa.altura; y += 300) { await p2.evaluate((v) => scrollTo(0, v), y); await p2.waitForTimeout(c.nome === 'normal' ? 150 : 0); }
        await p2.waitForTimeout(c.nome === 'normal' ? 2600 : 200);
        // O cabeçalho fixo se repetiria no meio da imagem do bloco.
        const destino = versionada(c.nome, w) ? join(saida, `${b}-${w}.jpg`) : join(rascunho, `${b}-${c.nome}-${w}.jpg`);
        await loc.screenshot({ path: destino, type: 'jpeg', quality: 70, style: 'header{position:static!important}' });
      }
      await ctx2.close();
    }
    resumo.push(`${rotulo.padEnd(26)} altura ${String(estado.altura).padStart(6)}px · excedente ${estado.larguraExcedente}px · texto invisível ${estado.invisiveis.length} · axe ${violacoes}`);
    await ctx.close();
  }
}
// Página 404: sem rolagem horizontal, sem violação do axe; captura versionada no cenário normal.
for (const w of larguras) {
  for (const c of cenarios) {
    const ctx = await navegador.newContext({ viewport: { width: w, height: w < 500 ? 812 : 900 }, deviceScaleFactor: versionada(c.nome, w) ? 2 : 1, ...c.opcoes });
    const pagina = await ctx.newPage();
    const rotulo = `404 ${c.nome} ${w}px`;
    pagina.on('pageerror', (e) => erros.push(`${rotulo}: erro de JS: ${e.message}`));
    const resp = await pagina.goto(`${BASE}rota-que-nao-existe/`, { waitUntil: 'networkidle' });
    if (resp.status() !== 404) erros.push(`${rotulo}: status ${resp.status()} (esperado 404)`);
    const excedente = await pagina.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (excedente > 0) erros.push(`${rotulo}: rolagem horizontal de ${excedente}px`);
    if (c.nome === 'movimento-reduzido') {
      await pagina.addScriptTag({ path: join(raiz, 'node_modules/axe-core/axe.min.js') });
      const r = await pagina.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } })).violations.map((v) => `${v.id}: ${v.help}`));
      r.forEach((v) => erros.push(`${rotulo}: axe: ${v}`));
    }
    if (versionada(c.nome, w)) await pagina.screenshot({ path: join(saida, `404-${w}.jpg`), type: 'jpeg', quality: 70 });
    await ctx.close();
  }
}
resumo.push('404: 9 combinações testadas (status, rolagem horizontal, axe)');
await navegador.close();
servidor.kill();

console.log(resumo.join('\n'));
if (erros.length) { console.error(`capturas: ${erros.length} problema(s)`); erros.forEach((e) => console.error(' - ' + e)); process.exit(1); }
console.log(`capturas: ok (${cenarios.length * larguras.length} combinações testadas; versionadas em ${saida}; rascunho em ${rascunho})`);
