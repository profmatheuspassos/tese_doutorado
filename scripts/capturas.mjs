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
const i18n = JSON.parse(readFileSync(join(raiz, 'src/i18n/pt-br.json'), 'utf8'));
const rascunho = process.env.CAPTURAS_RASCUNHO || join(tmpdir(), 'capturas');
mkdirSync(rascunho, { recursive: true });
const argSalvar = process.argv.indexOf('--salvar');
const salvar = new Set(argSalvar > 0 ? (process.argv[argSalvar + 1] || '').split(',').filter(Boolean) : []);

// Blocos com captura versionada (D49 para a home; D56 para as páginas novas).
const CAPTURAS = {
  home: { pasta: 'fase-3', prefixo: '', alvos: ['B0', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'rodape'] },
  'capitulo-1': { pasta: 'fase-4', prefixo: 'cap1-', alvos: ['B0', 'B1', 'B4', 'B8', 'navegacao'] },
  'capitulo-2': { pasta: 'fase-4', prefixo: 'cap2-', alvos: ['B0', 'B2', 'B4', 'navegacao'] },
  'capitulo-3': { pasta: 'fase-4', prefixo: 'cap3-', alvos: ['B0', 'B2', 'B6', 'B8', 'navegacao'] },
  'capitulo-4': { pasta: 'fase-4', prefixo: 'cap4-', alvos: ['B0', 'B3', 'B7', 'B9', 'B11', 'navegacao'] },
  'capitulo-5': { pasta: 'fase-4', prefixo: 'cap5-', alvos: ['B0', 'B1', 'B5', 'B10', 'navegacao'] },
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
  'capitulo-1': async (pagina, rotulo, c, w) => {
    // Checklist (D53): nove regras, cada uma com as duas marcas visíveis e desenhadas no fim.
    const marcas = await pagina.evaluate(() => [...document.querySelectorAll('[data-bloco="B4"] [data-checklist] > li')].map((li) => [...li.querySelectorAll('.marca')].map((m) => {
      const circulo = m.querySelector('.marca-circulo');
      const visto = m.querySelector('.marca-visto');
      return Number(getComputedStyle(circulo).opacity) > 0.99 && Math.abs(parseFloat(getComputedStyle(visto).strokeDashoffset || '0')) < 0.01;
    })));
    if (marcas.length !== 9 || marcas.some((l) => l.length !== 2 || l.includes(false))) erros.push(`${rotulo}: checklist com marcas faltando ou não desenhadas: ${JSON.stringify(marcas)}`);
    // Linha do tempo: três etapas visíveis.
    const etapas = await pagina.evaluate(() => [...document.querySelectorAll('.linha-tempo-etapa')].map((e) => Number(getComputedStyle(e).opacity)));
    if (etapas.length !== 3 || etapas.some((o) => o < 0.99)) erros.push(`${rotulo}: linha do tempo incompleta ou escondida: ${JSON.stringify(etapas)}`);
    // "Lado a lado": cartões abaixo de 768 px, tabela acima.
    const exibicao = await pagina.evaluate(() => getComputedStyle(document.querySelector('[data-lado-a-lado] tbody tr')).display);
    if ((w < 768) !== (exibicao === 'block')) erros.push(`${rotulo}: "Lado a lado" com exibição ${exibicao} em ${w}px`);
  },
  'capitulo-3': async (pagina, rotulo, c) => {
    const estado = () => pagina.evaluate(() => ({
      contador: document.querySelector('[data-contador]').textContent,
      formas: [...document.querySelectorAll('.bl-cartao')].map((b) => b.dataset.forma),
      sumidas: [...document.querySelectorAll('[data-sumidas] li')].filter((l) => !l.hidden && !l.parentElement.hidden).length,
    }));
    // Estádio (D24, D55): alt vazio e a legenda T33.
    const estadio = await pagina.evaluate(() => ({ alt: document.querySelector('.estadio img')?.getAttribute('alt'), legenda: document.querySelector('.estadio figcaption')?.textContent }));
    if (estadio.alt !== '' || !estadio.legenda?.startsWith('Imagine 30 mil pessoas')) erros.push(`${rotulo}: estádio sem alt vazio ou sem a legenda T33 (${JSON.stringify(estadio)})`);
    const interativo = await pagina.locator('[data-bolha]').isVisible();
    const tira = await pagina.locator('[data-bolha-tira]').isVisible();
    if (c.nome === 'sem-js') {
      if (interativo || !tira) erros.push(`${rotulo}: sem JS, a bolha devia mostrar só a tira estática (interativo ${interativo}, tira ${tira})`);
      return;
    }
    if (!interativo || tira) erros.push(`${rotulo}: com JS, a bolha devia mostrar só o interativo (interativo ${interativo}, tira ${tira})`);
    // Quatro curtidas na mesma forma: um tipo só na tela.
    for (let k = 0; k < 4; k++) await pagina.locator('.bl-cartao[data-forma="triangulo"]').first().click();
    let e = await estado();
    if (!e.contador.endsWith('1 de 4') || new Set(e.formas).size !== 1 || e.formas[0] !== 'triangulo') erros.push(`${rotulo}: bolha depois de 4 curtidas: ${JSON.stringify(e)}`);
    await pagina.locator('[data-mostrar]').click();
    e = await estado();
    if (e.sumidas !== 3) erros.push(`${rotulo}: "Mostrar o que deixou de aparecer" mostrou ${e.sumidas} formas (esperado 3)`);
    await pagina.locator('[data-recomecar]').click();
    e = await estado();
    if (!e.contador.endsWith('4 de 4') || new Set(e.formas).size !== 4 || e.sumidas !== 0) erros.push(`${rotulo}: "Recomeçar" não voltou ao início: ${JSON.stringify(e)}`);
    // Teclado: Enter num cartão conta como curtida.
    const curtida = await pagina.locator('.bl-cartao').first().getAttribute('data-forma');
    await pagina.locator('.bl-cartao').first().focus();
    await pagina.keyboard.press('Enter');
    e = await estado();
    const preferida = e.formas.filter((f) => f === curtida).length;
    if (preferida < 6) erros.push(`${rotulo}: Enter no cartão não contou como curtida (${JSON.stringify(e)})`);
    await pagina.locator('[data-recomecar]').click();
  },
  'capitulo-4': async (pagina, rotulo, c) => {
    // Quem decide o quê (B3): começa no governo; em "Centrada nos cidadãos" as cinco marcas dos
    // cidadãos acendem e a linha de estado muda (T36). Funciona sem JS (:has()).
    const estado = () => pagina.evaluate(() => {
      const acesa = (m) => { const c = getComputedStyle(m.querySelector('.qd-circulo')).fill; return c !== 'none' && c !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(c); };
      return {
        governo: [...document.querySelectorAll('.qd-lista .qd-governo')].map(acesa),
        cidadaos: [...document.querySelectorAll('.qd-lista .qd-cidadaos')].map(acesa),
        vistos: [...document.querySelectorAll('.qd-lista .qd-cidadaos .qd-visto')].map((v) => Number(getComputedStyle(v).opacity)),
        texto: [...document.querySelectorAll('.qd-estado span')].filter((s) => getComputedStyle(s).display !== 'none').map((s) => s.textContent),
      };
    });
    const espera = c.nome === 'movimento-reduzido' ? 60 : 1500;
    let e = await estado();
    if (e.governo.length !== 5 || e.governo.includes(false) || e.cidadaos.includes(true) || e.texto.join() !== i18n.quem_decide.estado.governo) erros.push(`${rotulo}: quem decide, estado inicial errado: ${JSON.stringify(e)}`);
    await pagina.locator('#qd-cidadaos').check();
    await pagina.waitForTimeout(espera);
    e = await estado();
    if (e.cidadaos.length !== 5 || e.cidadaos.includes(false) || e.vistos.some((v) => v < 0.99) || e.governo.includes(false) || e.texto.join() !== i18n.quem_decide.estado.cidadaos) erros.push(`${rotulo}: quem decide, "Centrada nos cidadãos" não acendeu tudo: ${JSON.stringify(e)}`);
    await pagina.locator('#qd-cidadaos').focus();
    await pagina.keyboard.press('ArrowLeft');
    const marcado = await pagina.evaluate(() => document.querySelector('input[name="quem-decide"]:checked')?.value);
    if (marcado !== 'governo') erros.push(`${rotulo}: quem decide, a seta não voltou para "Centrada no governo" (${marcado})`);
    await pagina.waitForTimeout(espera);
    e = await estado();
    if (e.cidadaos.includes(true)) erros.push(`${rotulo}: quem decide, voltar ao governo não apagou as marcas dos cidadãos`);
    // Círculo virtuoso (B11): no fim, só os rótulos do virtuoso. Ramo e broto (B9) no estado final.
    const fim = await pagina.evaluate(() => ({
      depois: [...document.querySelectorAll('.circulo-virtuoso .circulo-rotulo-depois')].map((r) => Number(getComputedStyle(r).opacity)),
      antes: [...document.querySelectorAll('.circulo-virtuoso .circulo-rotulo-antes')].map((r) => Number(getComputedStyle(r).opacity)),
      caule: Number(document.querySelector('[data-crescimento] .ramo-caule')?.getAttribute('stroke-width')),
      folhas: [...document.querySelectorAll('[data-crescimento] .folha-nova, [data-crescimento] .broto-folha')].map((f) => Number(getComputedStyle(f).opacity)),
    }));
    if (fim.depois.length !== 3 || fim.depois.some((o) => o < 0.99) || fim.antes.some((o) => o > 0.01)) erros.push(`${rotulo}: círculo virtuoso sem os rótulos finais: ${JSON.stringify(fim)}`);
    if (fim.caule !== 3.5 || fim.folhas.length !== 4 || fim.folhas.some((o) => o < 0.99)) erros.push(`${rotulo}: ramo e semente fora do estado final: ${JSON.stringify(fim)}`);
  },
  'capitulo-5': async (pagina, rotulo, c, w) => {
    // Caminho do referendo (B1): cinco passos em Portugal (três portas) e um no Brasil, visíveis.
    const caminho = await pagina.evaluate(() => [...document.querySelectorAll('.caminho-faixa')].map((f) => ({
      passos: [...f.querySelectorAll('.caminho-passo')].map((p) => Number(getComputedStyle(p).opacity)),
      portas: f.querySelectorAll('.caminho-passo[data-porta]').length,
    })));
    if (caminho.length !== 2 || caminho[0].passos.length !== 5 || caminho[0].portas !== 3 || caminho[1].passos.length !== 1 || caminho.flatMap((f) => f.passos).some((o) => o < 0.99)) erros.push(`${rotulo}: caminho do referendo incompleto ou escondido: ${JSON.stringify(caminho)}`);
    // Barras das petições (B5): proporcionais aos números do dados.json.
    const barras = await pagina.evaluate(() => [...document.querySelectorAll('.tabela-peticoes .peticoes-barra')].map((b) => b.getBoundingClientRect().width));
    const valores = dados.peticoes_ar_pt.valores;
    const maior = Math.max(...valores);
    if (barras.length !== valores.length || barras.some((b, i) => Math.abs(b / Math.max(...barras) - valores[i] / maior) > 0.02)) erros.push(`${rotulo}: barras das petições fora de proporção: ${JSON.stringify(barras)}`);
    // Cartões: abaixo de 768 px, um país por vez (alternador); acima, os dois lado a lado.
    const paises = () => pagina.evaluate(() => [...document.querySelectorAll('.ft-cartao')].map((cartao) => ({
      f: cartao.dataset.ferramenta,
      visiveis: [...cartao.querySelectorAll('.ft-pais')].filter((p) => getComputedStyle(p).display !== 'none').map((p) => p.dataset.pais).join(),
      alternador: !!cartao.querySelector('.ft-alternador') && getComputedStyle(cartao.querySelector('.ft-alternador')).display !== 'none',
    })));
    let r = await paises();
    const nomes = Object.keys(i18n.ferramentas.nomes);
    if (r.map((x) => x.f).join() !== nomes.join()) erros.push(`${rotulo}: cartões fora da ordem T38: ${r.map((x) => x.f).join()}`);
    for (const x of r) {
      const esperado = w < 768 && x.f !== 'recall' ? 'pt' : 'pt,br';
      if (x.visiveis !== esperado || x.alternador !== (w < 768 && x.f !== 'recall')) erros.push(`${rotulo}: cartão ${x.f} mostra "${x.visiveis}" (esperado "${esperado}"), alternador ${x.alternador}`);
    }
    if (w < 768) {
      await pagina.locator('#ft-peticao-br').check();
      r = await paises();
      const pet = r.find((x) => x.f === 'peticao');
      if (pet.visiveis !== 'br') erros.push(`${rotulo}: cartão Petição, "Brasil" escolhido mostra "${pet.visiveis}"`);
      await pagina.locator('#ft-peticao-br').focus();
      await pagina.keyboard.press('ArrowLeft');
      r = await paises();
      if (r.find((x) => x.f === 'peticao').visiveis !== 'pt') erros.push(`${rotulo}: cartão Petição, a seta não voltou para Portugal`);
    }
    // Recall: tracejado; o funil da Califórnia abre e traz 172, 9 e 6.
    const recall = pagina.locator('.ft-cartao[data-ferramenta="recall"]');
    const borda = await recall.evaluate((el) => getComputedStyle(el).borderTopStyle);
    if (borda !== 'dashed') erros.push(`${rotulo}: cartão do recall sem contorno tracejado (${borda})`);
    await recall.locator('summary').click();
    const funil = await recall.evaluate((el) => [...el.querySelectorAll('.ft-funil-n')].filter((n) => n.getBoundingClientRect().height > 0).map((n) => n.textContent));
    const rc = dados.recall_california;
    if (funil.join() !== [rc.tentativas, rc.votacoes, rc.remocoes].join()) erros.push(`${rotulo}: funil da Califórnia mostra ${JSON.stringify(funil)}`);
    await recall.locator('summary').click();
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

// Números em destaque: a tinta do último algarismo ou da vírgula (medida num canvas com a mesma
// fonte) fica pelo menos 8 px acima do elemento seguinte, quando ele está embaixo do número. Se o
// elemento seguinte fica ao lado (sem sobreposição horizontal), não há o que medir.
async function testarNumeros(pagina, rotulo) {
  const folgas = await pagina.evaluate(() => [...document.querySelectorAll('[data-bloco] .numero-grande')].map((el) => {
    const span = el.querySelector('span');
    const cs = getComputedStyle(el);
    const g = document.createElement('canvas').getContext('2d');
    g.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const m = g.measureText(span.textContent);
    const caixa = el.getBoundingClientRect();
    const base = caixa.top + caixa.height / 2 + (m.fontBoundingBoxAscent - m.fontBoundingBoxDescent) / 2;
    const prox = el.nextElementSibling?.getBoundingClientRect();
    const embaixo = prox && prox.left < caixa.right && prox.right > caixa.left && prox.top > caixa.top;
    return { texto: span.textContent, folga: embaixo ? prox.top - (base + m.actualBoundingBoxDescent) : Infinity };
  }));
  folgas.forEach((f) => { if (f.folga < 8) erros.push(`${rotulo}: número em destaque "${f.texto}" a ${f.folga.toFixed(1)}px do texto seguinte (mínimo 8)`); });
}

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
          // Fora da conta: o que é decorativo, o que fica num <details> fechado e o que está
          // escondido de propósito (hidden: o interativo da bolha sem JS, as formas ainda não mostradas).
          if (el.closest('[aria-hidden="true"], details:not([open]), [hidden]')) continue;
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
      await testarNumeros(pagina, rotulo);

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
