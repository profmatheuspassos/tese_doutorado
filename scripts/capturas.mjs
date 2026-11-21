#!/usr/bin/env node
/**
 * Testes no navegador sobre o build (astro preview), em todas as páginas que o build tem, nos
 * dois idiomas (home, capítulos, "Sobre" e a 404 de cada idioma; o inglês só com INGLES=1):
 *  - 375, 768 e 1440 px, nos cenários normal, movimento reduzido e sem JavaScript;
 *  - nenhuma rolagem horizontal;
 *  - todo o texto dos blocos visível (opacidade 1, com tamanho) depois da rolagem;
 *  - salto direto para cada bloco (tecla End, âncora): o texto na tela aparece;
 *  - acessibilidade com axe-core (WCAG 2.2 A/AA), sem violações;
 *  - teclado: o primeiro Tab leva ao link "Pular para o conteúdo", visível;
 *  - nenhum erro no console e nenhuma requisição para fora do site;
 *  - testes próprios de cada página (interativos, com e sem JS; barra de progresso), com os
 *    rótulos do idioma da página;
 *  - seletor de idioma, onde existe (D91, D101, D108): nome acessível igual ao T50 do idioma da
 *    página, idioma atual com aria-current, link com lang, hreflang e destino certo, alcançável pelo
 *    teclado; no cabeçalho a partir de 1024 px e no topo do painel do menu abaixo disso; e o
 *    cabeçalho em 1024, 1152 e 1280 px: uma linha, nada sobreposto, sem rolagem horizontal.
 *
 * Cabeçalhos (Fase 5): no servidor local, cada resposta recebe os cabeçalhos de segurança do
 * dist/.htaccess (CSP por hash incluída), e qualquer violação da CSP é erro. Com BASE_URL
 * (ex.: BASE_URL=https://tese.profmatheuspassos.com.br npm run capturas), os testes rodam no
 * endereço publicado, com os cabeçalhos reais do servidor, sem subir o servidor local.
 *
 * Capturas versionadas (cenário normal, 375 e 1440 px, densidade 2x, JPEG 70) só com --salvar:
 *   node scripts/capturas.mjs --salvar home,capitulo-2
 * Home em docs/capturas/fase-3/ (D49); páginas novas em docs/capturas/fase-4/ (D56), com os
 * blocos listados em CAPTURAS; páginas em inglês ("en-home", "en-capitulo-2"...) em
 * docs/capturas/ingles/ (D102). As demais capturas vão para a pasta de rascunho fora do
 * repositório (CAPTURAS_RASCUNHO).
 */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { IDIOMAS, IDIOMA_PADRAO, outroIdioma } from '../src/lib/idiomas.mjs';
import { INGLES_PUBLICADO } from '../src/lib/site.mjs';

const exigir = createRequire(import.meta.url);
const { chromium } = exigir('playwright');
const raiz = new URL('..', import.meta.url).pathname;
const dados = JSON.parse(readFileSync(join(raiz, 'src/data/dados.json'), 'utf8'));
// Rótulos de cada idioma. Os testes leem `i18n`, trocado para o idioma de cada página no laço.
const ROTULOS = Object.fromEntries(Object.entries(IDIOMAS).map(([c, i]) => [c, JSON.parse(readFileSync(join(raiz, i.rotulos), 'utf8'))]));
let i18n = ROTULOS['pt-br'];
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
  sobre: { pasta: 'fase-4', prefixo: 'sobre-', alvos: ['B0', 'B1', 'B2', 'B6', 'B7', 'navegacao'] },
};

// Endereço publicado (opcional). Sem ele, os testes rodam no build local.
const NO_AR = process.env.BASE_URL?.replace(/\/$/, '');

// Páginas: lidas dos .md aprovados dos dois idiomas; entram as que existem no build (ou, no
// endereço publicado, as do português e, com o inglês publicado, as do inglês).
const lerPaginas = (codigo) => {
  const pasta = join(raiz, IDIOMAS[codigo].pasta);
  if (!existsSync(pasta)) return [];
  return readdirSync(pasta).filter((f) => f.endsWith('.md')).map((f) => {
    const fm = readFileSync(join(pasta, f), 'utf8').match(/^---\n([\s\S]*?)\n---/)[1];
    const pagina = fm.match(/^pagina:\s*"?(.*?)"?$/m)[1];
    return { codigo, pagina, nome: codigo === IDIOMA_PADRAO ? pagina : `en-${pagina}`, rota: fm.match(/^rota:\s*"?(.*?)"?$/m)[1] };
  });
};
const aprovadas = Object.keys(IDIOMAS).flatMap(lerPaginas);
const paginas = aprovadas.filter((p) => (NO_AR ? p.codigo === IDIOMA_PADRAO || INGLES_PUBLICADO : existsSync(join(raiz, 'dist', p.rota, 'index.html'))))
  .sort((a, b) => a.codigo.localeCompare(b.codigo) * -1 || (a.rota === '/' || a.rota === '/en/' ? -1 : b.rota === '/' || b.rota === '/en/' ? 1 : a.rota.localeCompare(b.rota)));
// 404 de cada idioma: a do português sempre; a do inglês se existe no build (ou se está no ar).
const existe404En = NO_AR ? INGLES_PUBLICADO : existsSync(join(raiz, 'dist/en/404/index.html'));
const PAGINAS_404 = [
  { codigo: 'pt-br', nome: '404', rota: '/rota-que-nao-existe/' },
  ...(existe404En ? [{ codigo: 'en', nome: 'en-404', rota: '/en/rota-que-nao-existe/' }] : []),
];
// Destino esperado do seletor (D91, D108): o par da página; na 404, o início do outro idioma.
const parDe = (p) => aprovadas.find((x) => x.codigo !== p.codigo && x.pagina === p.pagina);
const inicioDe = (codigo) => aprovadas.find((x) => x.codigo === codigo && x.pagina === 'home');
const destinoSeletor = (p) => (p.nome.endsWith('404') ? inicioDe(outroIdioma(p.codigo)) : parDe(p))?.rota;

const PORTA = 4329;
const BASE = NO_AR || `http://127.0.0.1:${PORTA}`;
const servidor = NO_AR ? null : spawn(process.execPath, [join(raiz, 'node_modules/astro/bin/astro.mjs'), 'preview', '--ignore-lock', '--host', '127.0.0.1', '--port', String(PORTA)], { cwd: raiz, stdio: ['ignore', 'pipe', 'pipe'] });
if (servidor) {
  await new Promise((ok, erro) => {
    const t = setTimeout(() => erro(new Error('preview não subiu')), 30000);
    servidor.stdout.on('data', (d) => { if (String(d).includes(String(PORTA))) { clearTimeout(t); ok(); } });
  });
}

// Cabeçalhos de segurança do dist/.htaccess, aplicados às respostas do servidor local para testar
// a CSP real antes da publicação. HSTS fica de fora (o servidor local é http).
const CABECALHOS = NO_AR ? {} : Object.fromEntries([...readFileSync(join(raiz, 'dist/.htaccess'), 'utf8').matchAll(/^\s*Header always set (\S+) "(.*)"$/gm)]
  .map((m) => [m[1].toLowerCase(), m[2]]).filter(([k]) => k !== 'strict-transport-security'));
if (!NO_AR && !CABECALHOS['content-security-policy']) throw new Error('dist/.htaccess sem CSP: rode npm run build antes.');
// O axe entra como arquivo do próprio site (/__axe.js), que a CSP aceita, e não como script em linha.
const AXE = readFileSync(join(raiz, 'node_modules/axe-core/axe.min.js'), 'utf8');
async function novoContexto(opcoes) {
  const ctx = await navegador.newContext(opcoes);
  await ctx.route(`${BASE}/__axe.js`, (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: AXE }));
  if (!NO_AR) {
    await ctx.route(`${BASE}/**`, async (r) => {
      if (r.request().url() === `${BASE}/__axe.js`) return r.fallback();
      const resposta = await r.fetch();
      // O astro preview responde com a 404 da raiz em qualquer endereço; no servidor, o
      // dist/en/.htaccess troca, dentro de /en/, pela 404 em inglês. Aqui isso é emulado.
      if (resposta.status() === 404 && existe404En && new URL(r.request().url()).pathname.startsWith('/en/')) {
        return r.fulfill({ status: 404, headers: { ...resposta.headers(), ...CABECALHOS }, body: readFileSync(join(raiz, 'dist/en/404/index.html')) });
      }
      await r.fulfill({ response: resposta, headers: { ...resposta.headers(), ...CABECALHOS } });
    });
  }
  // Toda violação da CSP vira erro no console, que os testes já tratam como erro.
  await ctx.addInitScript(() => document.addEventListener('securitypolicyviolation', (e) => console.error(`CSP bloqueou: ${e.violatedDirective} ${e.blockedURI || 'em linha'} (${e.sourceFile || ''}:${e.lineNumber || ''})`)));
  return ctx;
}

const larguras = [375, 768, 1440];
const cenarios = [
  { nome: 'normal', opcoes: {} },
  { nome: 'movimento-reduzido', opcoes: { reducedMotion: 'reduce' } },
  { nome: 'sem-js', opcoes: { javaScriptEnabled: false } },
];
const altura = (w) => (w < 500 ? 812 : 900);
const erros = [];
const resumo = [];
// No endereço publicado, atrás de um proxy (como na nuvem), o navegador sai por ele.
const navegador = await chromium.launch(NO_AR && process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY } } : {});
const axe = (pagina) => pagina.addScriptTag({ url: `${BASE}/__axe.js` })
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
    if (estadio.alt !== '' || estadio.legenda?.trim() !== i18n.estadio_legenda) erros.push(`${rotulo}: estádio sem alt vazio ou sem a legenda T33 (${JSON.stringify(estadio)})`);
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
    if (e.contador !== i18n.bolha.contador.replace('{n}', '1') || new Set(e.formas).size !== 1 || e.formas[0] !== 'triangulo') erros.push(`${rotulo}: bolha depois de 4 curtidas: ${JSON.stringify(e)}`);
    await pagina.locator('[data-mostrar]').click();
    e = await estado();
    if (e.sumidas !== 3) erros.push(`${rotulo}: "Mostrar o que deixou de aparecer" mostrou ${e.sumidas} formas (esperado 3)`);
    await pagina.locator('[data-recomecar]').click();
    e = await estado();
    if (e.contador !== i18n.bolha.contador.replace('{n}', '4') || new Set(e.formas).size !== 4 || e.sumidas !== 0) erros.push(`${rotulo}: "Recomeçar" não voltou ao início: ${JSON.stringify(e)}`);
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
  sobre: async (pagina, rotulo, c) => {
    // Ficha (B2): cabeçalho vazio fora da tela e da leitura; a chave de cada linha é cabeçalho de linha.
    const ficha = await pagina.evaluate(() => {
      const t = document.querySelector('table.ficha');
      return { thead: getComputedStyle(t.querySelector('thead')).display, oculto: t.querySelector('thead').getAttribute('aria-hidden'), chaves: t.querySelectorAll('td[role="rowheader"]').length };
    });
    if (ficha.thead !== 'none' || ficha.oculto !== 'true' || ficha.chaves !== 8) erros.push(`${rotulo}: ficha fora do formato: ${JSON.stringify(ficha)}`);
    // O que fica em português na página em inglês leva lang="pt-BR" (D88, D98, D99): na ficha, o
    // título original, numa linha própria antes de "Translation:", e o nome da Faculdade; o ABNT
    // inteiro; o título original no APA e no BibTeX. Na página em português, nenhum desses lang.
    const langPt = IDIOMAS[IDIOMA_PADRAO].lang;
    const marcas = await pagina.evaluate(() => ({
      pagina: document.documentElement.lang,
      ficha: [...document.querySelectorAll('table.ficha [lang]')].map((e) => ({ lang: e.getAttribute('lang'), display: getComputedStyle(e).display })),
      abnt: document.querySelector('#citacao-abnt').getAttribute('lang'),
      titulos: ['#citacao-apa', '#citacao-bibtex'].map((s) => document.querySelector(`${s} [lang]`)?.getAttribute('lang') ?? null),
    }));
    const esperadoMarcas = marcas.pagina === langPt
      ? { ficha: [], abnt: null, titulos: [null, null] }
      : { ficha: [{ lang: langPt, display: 'block' }, { lang: langPt, display: 'inline' }], abnt: langPt, titulos: [langPt, langPt] };
    const { pagina: _p, ...obtidoMarcas } = marcas;
    if (JSON.stringify(obtidoMarcas) !== JSON.stringify(esperadoMarcas)) erros.push(`${rotulo}: trechos em português sem o lang esperado: ${JSON.stringify(marcas)}`);
    // Como citar (B6): ABNT e APA na fonte do corpo, com negrito e itálico no título; BibTeX
    // monoespaçado (D69). Vale em todos os cenários.
    const fontes = await pagina.evaluate(() => ['abnt', 'apa', 'bibtex'].map((f) => {
      const pre = document.querySelector(`#citacao-${f}`);
      const titulo = pre.querySelector('.cit-titulo');
      return { fonte: getComputedStyle(pre.querySelector('code') ?? pre).fontFamily, peso: titulo && getComputedStyle(titulo).fontWeight, estilo: titulo && getComputedStyle(titulo).fontStyle, quebra: getComputedStyle(pre).whiteSpace };
    }));
    const [abnt, apa, bibtex] = fontes;
    if (!abnt.fonte.startsWith('"Inter') || !apa.fonte.startsWith('"Inter') || bibtex.fonte.includes('Inter') || abnt.peso !== '700' || apa.estilo !== 'italic' || fontes.some((x) => x.quebra !== 'pre-wrap')) erros.push(`${rotulo}: fontes das referências fora do padrão: ${JSON.stringify(fontes)}`);
    // Sem JS, nenhum botão de copiar; com JS, um por formato, com o nome acessível T44.
    const botoes = await pagina.evaluate(() => [...document.querySelectorAll('[data-copiar]')].map((d) => ({ visivel: !d.hidden && d.getBoundingClientRect().height > 0, nome: d.querySelector('button').getAttribute('aria-label') })));
    if (c.nome === 'sem-js') {
      if (botoes.length !== 3 || botoes.some((b) => b.visivel)) erros.push(`${rotulo}: sem JS, os botões de copiar deviam ficar escondidos: ${JSON.stringify(botoes)}`);
      return;
    }
    const nomes = ['ABNT', 'APA', 'BibTeX'].map((f) => i18n.citar.copiar_nome.replace('{formato}', f));
    if (botoes.map((b) => b.nome).join('|') !== nomes.join('|') || botoes.some((b) => !b.visivel)) erros.push(`${rotulo}: botões de copiar errados: ${JSON.stringify(botoes)}`);
    // Copiar o ABNT: texto simples, com a data do dia no padrão ABNT no lugar de "[data de acesso]".
    await pagina.context().grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
    const hoje = new Date();
    // Meses do ABNT sempre em português (D99).
    const data = `${hoje.getDate()} ${ROTULOS['pt-br'].citar.meses[hoje.getMonth()]} ${hoje.getFullYear()}`;
    const botaoAbnt = pagina.locator('[data-copiar] button').first();
    await botaoAbnt.click();
    await pagina.waitForTimeout(150);
    const copia = await pagina.evaluate(async () => ({
      texto: await navigator.clipboard.readText(),
      botao: document.querySelector('[data-copiar] button').textContent,
      aviso: document.querySelector('[data-aviso-regiao]').textContent,
      pre: document.querySelector('#citacao-abnt').textContent,
    }));
    const esperado = copia.pre.replace('[data de acesso]', data);
    if (copia.texto !== esperado || !copia.texto.includes(`Acesso em: ${data}.`) || /[<>]/.test(copia.texto)) erros.push(`${rotulo}: cópia do ABNT errada: "${copia.texto}"`);
    const nomeCopiado = await botaoAbnt.getAttribute('aria-label');
    if (nomeCopiado !== i18n.citar.copiado) erros.push(`${rotulo}: com "Copiado" na tela, o nome acessível ficou "${nomeCopiado}"`);
    if (copia.botao !== i18n.citar.copiado || copia.aviso !== i18n.citar.aviso.replace('{formato}', 'ABNT')) erros.push(`${rotulo}: depois de copiar, botão "${copia.botao}" e aviso "${copia.aviso}"`);
    await pagina.waitForTimeout(2200);
    const volta = await botaoAbnt.textContent();
    if ((await botaoAbnt.getAttribute('aria-label')) !== nomes[0]) erros.push(`${rotulo}: o nome acessível não voltou a "${nomes[0]}"`);
    if (volta !== i18n.citar.copiar) erros.push(`${rotulo}: o botão não voltou a "${i18n.citar.copiar}" depois de 2 s ("${volta}")`);
    // Copiar o BibTeX: igual ao bloco, com as quebras de linha.
    await pagina.locator('[data-copiar] button').nth(2).click();
    await pagina.waitForTimeout(150);
    const bib = await pagina.evaluate(async () => [await navigator.clipboard.readText(), document.querySelector('#citacao-bibtex').textContent]);
    if (bib[0] !== bib[1] || !bib[0].includes('\n  author')) erros.push(`${rotulo}: cópia do BibTeX diferente do bloco`);
    // Falha da área de transferência: o texto fica selecionado e aparece T47.
    await pagina.evaluate(() => { navigator.clipboard.writeText = () => Promise.reject(new Error('teste')); });
    await pagina.locator('[data-copiar] button').nth(1).click();
    await pagina.waitForTimeout(150);
    const falha = await pagina.evaluate(() => {
      const r = document.querySelectorAll('[data-aviso-regiao]')[1];
      return { aviso: r.textContent, visivel: r.getBoundingClientRect().height > 1, selecionado: String(getSelection()), pre: document.querySelector('#citacao-apa').textContent };
    });
    if (falha.aviso !== i18n.citar.falha || !falha.visivel || falha.selecionado !== falha.pre) erros.push(`${rotulo}: falha ao copiar sem o aviso T47 ou sem a seleção: ${JSON.stringify(falha)}`);
    await pagina.evaluate(() => getSelection().removeAllRanges());
    await pagina.waitForTimeout(2200); // os botões voltam a "Copiar" antes do axe
  },
  'capitulo-2': async (pagina, rotulo, c) => {
    // Explorador: escolher cada instituição muda a largura de "nenhuma confiança" para o valor do
    // dados.json, também sem JavaScript; só a tabela da instituição escolhida fica visível.
    const serie = dados.confianca_instituicoes_br;
    const lerExplorador = (inst) => pagina.evaluate((i) => {
      const linhas = [...document.querySelectorAll('[data-explorador] .exp-linha')];
      const larguras = linhas.map((l) => { const s = l.querySelector('.exp-seg-nenhuma'); return (s.getBoundingClientRect().width / s.parentElement.getBoundingClientRect().width) * 100; });
      const tabelas = [...document.querySelectorAll('[data-explorador] .exp-tabela')].filter((t) => getComputedStyle(t).display !== 'none').map((t) => t.dataset.i);
      return { larguras, tabelas, escolhido: i };
    }, inst);
    const confere = (r, inst) => serie.anos.every((_, k) => Math.abs(r.larguras[k] - serie.instituicoes[inst].valores.nenhuma[k]) <= 0.6);
    for (const inst of ['partidos', 'tse', 'congresso']) {
      await pagina.locator(`#exp-${inst}`).check();
      let r;
      if (c.nome === 'movimento-reduzido') {
        // Até a barra mostrar o valor esperado, com limite de 2 s (antes: 50 ms fixos). Uma leitura
        // logo depois da troca falhou com a máquina carregada (1 de 99 combinações; D112).
        const limite = Date.now() + 2000;
        r = await lerExplorador(inst);
        while (!confere(r, inst) && Date.now() < limite) { await pagina.waitForTimeout(50); r = await lerExplorador(inst); }
      } else {
        await pagina.waitForTimeout(900);
        r = await lerExplorador(inst);
      }
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

// Seletor de idioma (D91, D101, D108). Onde há destino, os três seletores (cabeçalho, painel do
// menu e rodapé) existem, com o nome acessível T50 do idioma da página, o idioma atual marcado e
// o link certo; onde não há, nenhum. Visíveis: o do cabeçalho a partir de 1024 px, o do painel só
// com o menu aberto (abaixo de 1024 px) e o do rodapé sempre.
async function testarSeletor(pagina, rotulo, pg, w) {
  const destino = destinoSeletor(pg);
  const base = new URL(BASE).pathname.replace(/\/$/, '');
  const outro = outroIdioma(pg.codigo);
  const nomes = ROTULOS[pg.codigo].seletor_idioma;
  const sel = await pagina.evaluate(() => [...document.querySelectorAll('[data-seletor-idioma]')].map((n) => {
    const r = n.getBoundingClientRect();
    const a = n.querySelector('a');
    const atual = n.querySelector('[aria-current="true"]');
    return {
      onde: n.closest('header details') ? 'painel' : n.closest('header') ? 'cabecalho' : n.closest('footer') ? 'rodape' : '?',
      nome: n.getAttribute('aria-label'),
      // checkVisibility enxerga o conteúdo de um <details> fechado (content-visibility).
      visivel: r.width > 0 && r.height > 0 && n.checkVisibility({ visibilityProperty: true, contentVisibilityAuto: true }),
      atual: atual && { lang: atual.getAttribute('lang'), texto: atual.textContent.trim(), tag: atual.tagName },
      link: a && { href: a.getAttribute('href'), lang: a.getAttribute('lang'), hreflang: a.getAttribute('hreflang'), texto: a.textContent.trim() },
      textos: [...n.querySelectorAll('li')].filter((li) => !li.closest('[aria-hidden="true"]')).map((li) => li.textContent.trim()),
    };
  }));
  if (!destino) {
    if (sel.length) erros.push(`${rotulo}: seletor de idioma sem destino (sem par)`);
    return;
  }
  if (sel.map((x) => x.onde).join() !== 'cabecalho,painel,rodape') erros.push(`${rotulo}: seletores em ${sel.map((x) => x.onde).join() || 'nenhum lugar'} (esperado cabeçalho, painel e rodapé)`);
  for (const x of sel) {
    if (x.nome !== nomes.nome) erros.push(`${rotulo}: seletor (${x.onde}) com nome acessível "${x.nome}" (esperado o T50 do idioma da página: "${nomes.nome}")`);
    if (x.atual?.lang !== IDIOMAS[pg.codigo].lang || x.atual?.texto !== nomes.idiomas[pg.codigo] || x.atual?.tag === 'A') erros.push(`${rotulo}: seletor (${x.onde}) com o idioma atual errado: ${JSON.stringify(x.atual)}`);
    const certo = { href: `${base}${destino}`, lang: IDIOMAS[outro].lang, hreflang: IDIOMAS[outro].hreflang, texto: nomes.idiomas[outro] };
    if (JSON.stringify(x.link) !== JSON.stringify(certo)) erros.push(`${rotulo}: seletor (${x.onde}) com link ${JSON.stringify(x.link)} (esperado ${JSON.stringify(certo)})`);
    if (x.textos.join(' · ') !== [nomes.idiomas['pt-br'], nomes.idiomas.en].join(' · ')) erros.push(`${rotulo}: seletor (${x.onde}) com texto ${JSON.stringify(x.textos)} (T51)`);
  }
  const vis = Object.fromEntries(sel.map((x) => [x.onde, x.visivel]));
  if (vis.cabecalho !== (w >= 1024) || vis.painel || !vis.rodape) erros.push(`${rotulo}: visibilidade dos seletores ${JSON.stringify(vis)} em ${w}px`);
  // Abaixo de 1024 px: com o menu aberto, o seletor aparece no topo do painel.
  if (w < 1024) {
    await pagina.evaluate(() => scrollTo(0, 0));
    await pagina.locator('header details summary').click();
    const painel = await pagina.evaluate(() => {
      const n = document.querySelector('header details [data-seletor-idioma]');
      const lista = document.querySelector('header details nav:not([data-seletor-idioma]) > ul');
      const r = n.getBoundingClientRect();
      return { visivel: r.width > 0 && r.height > 0 && n.checkVisibility({ visibilityProperty: true }), acima: r.bottom <= lista.getBoundingClientRect().top + 1, dentro: r.right <= innerWidth };
    });
    if (!painel.visivel || !painel.acima || !painel.dentro) erros.push(`${rotulo}: seletor no painel do menu fora do lugar: ${JSON.stringify(painel)}`);
    await pagina.locator('header details summary').click();
  }
  // Teclado: o link do seletor visível no topo da página é alcançado com Tab.
  await pagina.evaluate(() => { scrollTo(0, 0); document.activeElement?.blur(); });
  if (w < 1024) await pagina.locator('header details summary').click();
  let alcancou = false;
  for (let k = 0; k < 30 && !alcancou; k++) {
    await pagina.keyboard.press('Tab');
    alcancou = await pagina.evaluate(() => Boolean(document.activeElement?.closest('header [data-seletor-idioma]')) && document.activeElement.tagName === 'A');
  }
  if (!alcancou) erros.push(`${rotulo}: o link do seletor no ${w < 1024 ? 'painel do menu' : 'cabeçalho'} não é alcançado com Tab`);
  if (w < 1024) await pagina.locator('header details summary').click();
  await pagina.evaluate(() => document.activeElement?.blur());
}

// Cabeçalho entre 1024 e 1280 px (risco 5 do plano da versão em inglês), nas páginas com seletor:
// a altura do cabeçalho não muda, cada item fica numa linha, nada se sobrepõe, sem rolagem
// horizontal. Guarda uma imagem do cabeçalho de cada largura na pasta de rascunho.
const LARGURAS_CABECALHO = [1024, 1152, 1280];
async function testarCabecalho(pg, url) {
  for (const w of LARGURAS_CABECALHO) {
    const ctx = await novoContexto({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
    const pagina = await ctx.newPage();
    const rotulo = `${pg.nome} cabeçalho ${w}px`;
    await pagina.goto(url, { waitUntil: 'networkidle' });
    await pagina.evaluate(() => document.fonts.ready.then(() => true));
    const g = await pagina.evaluate(() => {
      const caixa = (el) => { const r = el.getBoundingClientRect(); return { x0: r.left, x1: r.right, y0: r.top, y1: r.bottom, linhas: el.getClientRects().length, texto: el.textContent.trim() }; };
      const header = document.querySelector('header');
      const marca = header.querySelector(':scope > div > a');
      const itens = [...header.querySelectorAll(':scope > div > nav:not([data-seletor-idioma]) li a')];
      const seletor = header.querySelector(':scope > div > [data-seletor-idioma]');
      const partes = [marca, ...itens, ...(seletor ? [...seletor.querySelectorAll('li > a, li > span')] : [])].map(caixa);
      return { altura: header.getBoundingClientRect().height, partes, excedente: document.documentElement.scrollWidth - document.documentElement.clientWidth, temSeletor: Boolean(seletor) };
    });
    if (!g.temSeletor) erros.push(`${rotulo}: sem seletor no cabeçalho`);
    if (Math.round(g.altura) !== 49) erros.push(`${rotulo}: cabeçalho com ${g.altura}px de altura (esperado 49, uma linha)`);
    if (g.excedente > 0) erros.push(`${rotulo}: rolagem horizontal de ${g.excedente}px`);
    g.partes.forEach((p) => { if (p.linhas !== 1) erros.push(`${rotulo}: "${p.texto}" quebrou em ${p.linhas} linhas`); });
    for (let i = 1; i < g.partes.length; i++) {
      const [a, b] = [g.partes[i - 1], g.partes[i]];
      if (b.x0 < a.x1) erros.push(`${rotulo}: "${a.texto}" e "${b.texto}" se sobrepõem (${a.x1.toFixed(1)} > ${b.x0.toFixed(1)})`);
    }
    const folga = g.partes.length > 1 ? (g.partes[1].x0 - g.partes[0].x1).toFixed(0) : '-';
    resumo.push(`${rotulo.padEnd(36)} altura ${Math.round(g.altura)}px · folga entre o título e o menu ${folga}px · excedente ${g.excedente}px`);
    await pagina.locator('header').screenshot({ path: join(rascunho, `cabecalho-${pg.nome}-${w}.png`) });
    await ctx.close();
  }
}

for (const pg of paginas) {
  const URL_ = `${BASE}${pg.rota}`;
  i18n = ROTULOS[pg.codigo];
  for (const c of cenarios) {
    for (const w of larguras) {
      const ctx = await novoContexto({ viewport: { width: w, height: altura(w) }, deviceScaleFactor: 1, ...c.opcoes });
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
        const ctxSalto = await novoContexto({ viewport: { width: w, height: altura(w) } });
        const ps = await ctxSalto.newPage();
        await ps.goto(URL_, { waitUntil: 'networkidle' });
        const ids = await ps.evaluate(() => [...document.querySelectorAll('[data-bloco]')].map((b) => b.dataset.bloco));
        for (const id of ids.reverse()) {
          await ps.evaluate((a) => document.querySelector(`[data-bloco="${a}"]`).scrollIntoView(), id);
          await ps.waitForTimeout(pg.pagina === 'home' ? 1800 : 600);
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

      if (TESTES[pg.pagina]) await TESTES[pg.pagina](pagina, rotulo, c, w);
      await testarSeletor(pagina, rotulo, pg, w);
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
      const config = CAPTURAS[pg.pagina];
      const versionada = salvar.has(pg.nome) && config && c.nome === 'normal' && (w === 375 || w === 1440);
      if (versionada) {
        const pasta = join(raiz, 'docs/capturas', pg.codigo === IDIOMA_PADRAO ? config.pasta : 'ingles');
        mkdirSync(pasta, { recursive: true });
        // Só aparência: sem os cabeçalhos, porque a CSP barraria o estilo que tira o cabeçalho fixo da
        // imagem. A CSP já foi testada no contexto principal desta mesma combinação.
        const ctx2 = await navegador.newContext({ viewport: { width: w, height: altura(w) }, deviceScaleFactor: 2 });
        const p2 = await ctx2.newPage();
        await p2.goto(URL_, { waitUntil: 'networkidle' });
        await p2.evaluate(() => document.fonts.ready.then(() => true));
        for (const b of config.alvos) {
          const loc = p2.locator(b === 'rodape' ? 'footer' : b === 'navegacao' ? '[data-navegacao]' : `[data-bloco="${b}"]`);
          // Percorre o bloco inteiro antes da captura, para que todas as animações tenham disparado.
          const caixa = await loc.evaluate((el) => { const r = el.getBoundingClientRect(); return { topo: r.top + scrollY, altura: r.height }; });
          for (let y = caixa.topo - 200; y <= caixa.topo + caixa.altura; y += 300) { await p2.evaluate((v) => scrollTo(0, v), y); await p2.waitForTimeout(150); }
          await p2.waitForTimeout(pg.pagina === 'home' ? 2600 : 900);
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

// Páginas 404 de cada idioma: status, título, sem rolagem horizontal, sem violação do axe, link
// de pular no primeiro Tab, seletor (D108); a do português com captura versionada junto da home.
for (const pg of PAGINAS_404) {
  i18n = ROTULOS[pg.codigo];
  for (const w of larguras) {
    for (const c of cenarios) {
      const versionada = pg.codigo === IDIOMA_PADRAO && salvar.has('home') && c.nome === 'normal' && w !== 768;
      const ctx = await novoContexto({ viewport: { width: w, height: altura(w) }, deviceScaleFactor: versionada ? 2 : 1, ...c.opcoes });
      const pagina = await ctx.newPage();
      const rotulo = `${pg.nome} ${c.nome} ${w}px`;
      pagina.on('pageerror', (e) => erros.push(`${rotulo}: erro de JS: ${e.message}`));
      pagina.on('request', (r) => { if (!r.url().startsWith(BASE) && !r.url().startsWith('data:')) erros.push(`${rotulo}: requisição para fora: ${r.url()}`); });
      const resp = await pagina.goto(`${BASE}${pg.rota}`, { waitUntil: 'networkidle' });
      if (resp.status() !== 404) erros.push(`${rotulo}: status ${resp.status()} (esperado 404)`);
      const h1 = await pagina.evaluate(() => document.querySelector('h1')?.textContent.trim());
      if (h1 !== i18n.nao_encontrada) erros.push(`${rotulo}: título "${h1}" (esperado "${i18n.nao_encontrada}")`);
      const excedente = await pagina.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (excedente > 0) erros.push(`${rotulo}: rolagem horizontal de ${excedente}px`);
      if (c.nome === 'movimento-reduzido') (await axe(pagina)).forEach((v) => erros.push(`${rotulo}: axe: ${v}`));
      if (c.nome !== 'sem-js' || w === 375) {
        await pagina.evaluate(() => { scrollTo(0, 0); document.activeElement?.blur(); });
        await pagina.keyboard.press('Tab');
        const foco = await pagina.evaluate(() => document.activeElement.getAttribute('href'));
        if (foco !== '#conteudo') erros.push(`${rotulo}: primeiro Tab não leva ao link de pular (${foco})`);
        await pagina.evaluate(() => document.activeElement.blur());
      }
      await testarSeletor(pagina, rotulo, pg, w);
      if (versionada) await pagina.screenshot({ path: join(raiz, 'docs/capturas/fase-3', `404-${w}.jpg`), type: 'jpeg', quality: 70 });
      await ctx.close();
    }
  }
  resumo.push(`${pg.nome}: 9 combinações testadas (status, título, rolagem horizontal, axe, teclado, seletor)`);
}

// Cabeçalho entre 1024 e 1280 px em toda página (e 404) com seletor.
for (const pg of [...paginas, ...PAGINAS_404].filter((p) => destinoSeletor(p))) await testarCabecalho(pg, `${BASE}${pg.rota}`);

await navegador.close();
servidor?.kill();

console.log(resumo.join('\n'));
if (erros.length) { console.error(`capturas: ${erros.length} problema(s)`); erros.forEach((e) => console.error(' - ' + e)); process.exit(1); }
console.log(`capturas: ok (${paginas.length} página(s) x ${cenarios.length * larguras.length} combinações; ${salvar.size ? `capturas versionadas de ${[...salvar].join(', ')}` : 'sem capturas versionadas'}; rascunho em ${rascunho})`);
