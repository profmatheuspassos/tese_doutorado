#!/usr/bin/env node
/**
 * Paridade entre o português e o inglês (D85, D94; docs/PLANO-INGLES.md, seção c). Roda no
 * prebuild, sobre os arquivos-fonte.
 *
 *  1. Rótulos: o src/i18n/en.json tem as mesmas chaves do pt-br.json, menos citar.meses (T48 não
 *     é traduzido, D99), mais traducao (T52). Cada rótulo tem as mesmas {variáveis} e os mesmos
 *     marcadores {d:...} do português; {d:caminho|mil} só onde o português diz "{d:caminho} mil".
 *     Exceção registrada: a pergunta do T24 vem do dados.json no português e fica escrita no
 *     inglês (o dados.json está travado, D94).
 *  2. Páginas, para cada par (.md em português e em inglês com o mesmo campo `pagina`):
 *     - os mesmos blocos Bn, na mesma ordem;
 *     - por bloco, o mesmo número de parágrafos, itens de lista, títulos, linhas e colunas de
 *       tabela, blocos de código, trechos em negrito e links;
 *     - por bloco, os mesmos números, depois de ler cada formato (1.473.063 / 1,473,063;
 *       92,9 / 92.9; "60 mil" / 60,000) e os números por extenso de dois a mil; no inglês, "both"
 *       conta como 2 só antes de substantivo no plural (D110); no português, o século em romanos
 *       ("século XIX") conta como o número, que o inglês escreve em algarismos ("19th century");
 *     - os links internos do inglês levam a páginas em inglês (em pré-visualização, também a uma
 *       página em português que ainda não tem tradução).
 *
 *   node scripts/conferir-paridade.mjs [--pt <pasta>] [--en <pasta>] [--rotulos-pt <json>] [--rotulos-en <json>]
 * As opções servem para testar a conferência com arquivos de exemplo.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { IDIOMAS } from '../src/lib/idiomas.mjs';
import { INGLES_PUBLICADO } from '../src/lib/site.mjs';

const raiz = new URL('..', import.meta.url).pathname;
const arg = (nome, padrao) => { const i = process.argv.indexOf(nome); return i > 0 ? resolve(process.argv[i + 1]) : join(raiz, padrao); };
const pastaPt = arg('--pt', IDIOMAS['pt-br'].pasta);
const pastaEn = arg('--en', IDIOMAS.en.pasta);
const rotulosPt = JSON.parse(readFileSync(arg('--rotulos-pt', IDIOMAS['pt-br'].rotulos), 'utf8'));
const rotulosEn = JSON.parse(readFileSync(arg('--rotulos-en', IDIOMAS.en.rotulos), 'utf8'));
const erros = [];

// ---------------------------------------------------------------------------------------------
// 1. Rótulos.
const SO_PT = [/^citar\.meses(\.|$)/];
const SO_EN = [/^traducao$/];
// Marcadores do português que o inglês escreve por extenso, com o motivo.
const MARCADORES_SO_PT = { 'explorador.fonte': ['confianca_instituicoes_br.pergunta'] };
const achatar = (v, prefixo = '') => (typeof v === 'string' ? [[prefixo, v]]
  : Object.entries(v).flatMap(([k, x]) => achatar(x, prefixo ? `${prefixo}.${k}` : k)));
const pt = new Map(achatar(rotulosPt).filter(([k]) => k !== '_sobre'));
const en = new Map(achatar(rotulosEn).filter(([k]) => k !== '_sobre'));
for (const k of pt.keys()) if (!en.has(k) && !SO_PT.some((r) => r.test(k))) erros.push(`rótulos: "${k}" falta no en.json`);
for (const k of en.keys()) if (!pt.has(k) && !SO_EN.some((r) => r.test(k))) erros.push(`rótulos: "${k}" existe no en.json e não no pt-br.json`);
const variaveis = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
const marcadores = (s) => [...s.matchAll(/\{d:([\w.]+)(\|mil)?\}/g)].map((m) => ({ caminho: m[1], mil: Boolean(m[2]) }));
let rotulosConferidos = 0;
for (const [k, vEn] of en) {
  const vPt = pt.get(k);
  if (vPt === undefined) continue;
  rotulosConferidos++;
  if (variaveis(vPt) !== variaveis(vEn)) erros.push(`rótulos: "${k}" com variáveis diferentes (pt: ${variaveis(vPt) || '-'}; en: ${variaveis(vEn) || '-'})`);
  const mPt = marcadores(vPt).filter((m) => !(MARCADORES_SO_PT[k] ?? []).includes(m.caminho));
  const mEn = marcadores(vEn);
  const lista = (ms) => ms.map((m) => m.caminho).sort().join(',');
  if (lista(mPt) !== lista(mEn)) erros.push(`rótulos: "${k}" com marcadores {d:...} diferentes (pt: ${lista(mPt) || '-'}; en: ${lista(mEn) || '-'})`);
  for (const m of mEn.filter((x) => x.mil)) {
    if (!vPt.includes(`{d:${m.caminho}} mil`)) erros.push(`rótulos: "${k}" usa {d:${m.caminho}|mil}, mas o português não diz "{d:${m.caminho}} mil"`);
  }
  for (const m of mPt) if (vPt.includes(`{d:${m.caminho}} mil`) && !mEn.some((x) => x.caminho === m.caminho && x.mil)) erros.push(`rótulos: "${k}": o português diz "{d:${m.caminho}} mil", o inglês precisa de {d:${m.caminho}|mil}`);
}

// ---------------------------------------------------------------------------------------------
// 2. Páginas.
function lerMd(pasta, arquivo) {
  const bruto = readFileSync(join(pasta, arquivo), 'utf8');
  const fm = bruto.match(/^---\n([\s\S]*?)\n---\n/);
  const meta = Object.fromEntries((fm?.[1] ?? '').split('\n').map((l) => l.match(/^(\w+):\s*"?(.*?)"?$/)).filter(Boolean).map((m) => [m[1], m[2]]));
  const corpo = bruto.slice(fm ? fm[0].length : 0);
  const partes = corpo.split(/(?=<!--\s*B\d+\s*\|)/).filter((p) => /^<!--\s*B\d+/.test(p));
  const blocos = partes.map((p) => ({ id: p.match(/^<!--\s*(B\d+)/)[1], texto: p.replace(/^<!--[\s\S]*?-->/, '') }));
  return { arquivo, meta, blocos };
}

/** Estrutura de um bloco em Markdown. */
function estrutura(texto) {
  const linhas = texto.split('\n');
  const e = { paragrafos: 0, itens: 0, titulos: 0, linhasTabela: 0, colunas: [], codigos: 0, negritos: 0, links: 0 };
  let emCodigo = false;
  let emParagrafo = false;
  for (const l of linhas) {
    if (/^```/.test(l)) { if (!emCodigo) e.codigos++; emCodigo = !emCodigo; emParagrafo = false; continue; }
    if (emCodigo) continue;
    if (!l.trim() || /^<!--.*-->$/.test(l.trim())) { emParagrafo = false; continue; }
    if (/^#{1,6}\s/.test(l)) { e.titulos++; emParagrafo = false; continue; }
    if (/^\s*([-*+]|\d{1,2}\.)\s+/.test(l)) { e.itens++; emParagrafo = false; continue; }
    if (/^\|/.test(l)) {
      if (!/^\|[\s:|-]+\|\s*$/.test(l)) { e.linhasTabela++; e.colunas.push(l.split('|').length - 2); }
      emParagrafo = false;
      continue;
    }
    if (!emParagrafo) { e.paragrafos++; emParagrafo = true; }
  }
  const semCodigo = texto.replace(/```[\s\S]*?```/g, '');
  e.negritos = (semCodigo.match(/\*\*[^*]+\*\*/g) ?? []).length;
  e.links = (semCodigo.match(/\]\([^)]*\)/g) ?? []).length;
  e.colunas = e.colunas.join(',');
  return e;
}

// Números por extenso (de dois em diante: "um"/"uma" e "one" são também artigo e pronome).
const EXTENSO = {
  pt: { dois: 2, duas: 2, três: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10, onze: 11, doze: 12, treze: 13, catorze: 14, quatorze: 14, quinze: 15, dezesseis: 16, dezessete: 17, dezoito: 18, dezenove: 19, vinte: 20, trinta: 30, quarenta: 40, cinquenta: 50, sessenta: 60, setenta: 70, oitenta: 80, noventa: 90, cem: 100, mil: 1000 },
  en: { two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100, thousand: 1000 },
};
// "both" (D110, pedido do autor): conta como 2 só logo antes de um substantivo no plural ("both
// countries", "both sides"), que traduz "os dois países". "Both ... and" não conta, porque traduz
// "tanto ... quanto" ("both in the constitution ... and in the electoral laws"). Sem dicionário, o
// plural é a palavra seguinte terminada em "s" que não seja uma palavra gramatical terminada em "s",
// ou um plural irregular da lista. "Both of", "both in", "both the" não contam.
const BOTH_PLURAL = /\bboth\s+([\p{L}]+)/giu;
const NAO_PLURAIS = new Set(['as', 'is', 'was', 'has', 'does', 'this', 'thus', 'his', 'its', 'us', 'yes', 'less', 'unless']);
const PLURAIS_IRREGULARES = new Set(['people', 'children', 'men', 'women']);
const ehPlural = (palavra) => {
  const p = palavra.toLowerCase();
  return PLURAIS_IRREGULARES.has(p) || (p.endsWith('s') && !NAO_PLURAIS.has(p));
};
// Séculos em algarismos romanos no português ("século XIX", "séculos XVIII") contam como o número
// (19, 18), porque o inglês escreve "19th century" e o "19" entra na conta (capítulo 1, B1 e B2).
// Só logo depois de "século" ou "séculos"; nenhum outro romano conta.
const ROMANOS = { I: 1, V: 5, X: 10, L: 50, C: 100 };
const romano = (r) => [...r].reduce((t, c, i, a) => t + (ROMANOS[c] < (ROMANOS[a[i + 1]] ?? 0) ? -ROMANOS[c] : ROMANOS[c]), 0);
const SECULO = /(?<![\p{L}])(séculos?)\s+([IVXLC]+)(?![\p{L}])/gu;
/** Números de um bloco, como valores ("60 mil" = 60000; "1.473.063" = 1473063; "92,9" = 92.9). */
function numeros(texto, lingua) {
  let s = texto.replace(/\]\([^)]*\)/g, ']').replace(/<!--[\s\S]*?-->/g, ' ');
  const valores = [];
  if (lingua === 'pt') s = s.replace(SECULO, (_, palavra, r) => { valores.push(romano(r)); return palavra; });
  const [milhar, decimal] = lingua === 'pt' ? ['\\.', ','] : [',', '\\.'];
  // No português, "60 mil" é um número só (o "mil" é consumido junto).
  const mil = lingua === 'pt' ? '(\\s+mil\\b)?' : '()';
  const re = new RegExp(`(\\d{1,3}(?:${milhar}\\d{3})+(?:${decimal}\\d+)?|\\d+(?:${decimal}\\d+)?)${mil}`, 'g');
  s = s.replace(re, (_, n, vezesMil) => {
    const limpo = lingua === 'pt' ? n.replace(/\./g, '').replace(',', '.') : n.replace(/,/g, '');
    valores.push(Number(limpo) * (vezesMil ? 1000 : 1));
    return ' ';
  });
  for (const palavra of s.toLowerCase().match(/[\p{L}]+/gu) ?? []) {
    const v = EXTENSO[lingua][palavra];
    if (v !== undefined) valores.push(v);
  }
  if (lingua === 'en') for (const _ of s.matchAll(BOTH_PLURAL)) if (ehPlural(_[1])) valores.push(2);
  return valores.sort((a, b) => a - b);
}

const ler = (pasta) => (existsSync(pasta) ? readdirSync(pasta).filter((f) => f.endsWith('.md')).map((f) => lerMd(pasta, f)) : []);
const paginasPt = ler(pastaPt);
const paginasEn = ler(pastaEn);
const prefixoEn = IDIOMAS.en.prefixo;
let pares = 0;
for (const e of paginasEn) {
  const p = paginasPt.find((x) => x.meta.pagina === e.meta.pagina);
  if (!p) { erros.push(`${e.arquivo} (en): sem par em português (pagina: ${e.meta.pagina})`); continue; }
  pares++;
  const rotulo = `${e.meta.pagina}`;
  if (!e.meta.rota?.startsWith(prefixoEn)) erros.push(`${rotulo}: rota em inglês fora de ${prefixoEn}: ${e.meta.rota}`);
  const idsPt = p.blocos.map((b) => b.id).join(',');
  const idsEn = e.blocos.map((b) => b.id).join(',');
  if (idsPt !== idsEn) { erros.push(`${rotulo}: blocos diferentes (pt: ${idsPt}; en: ${idsEn})`); continue; }
  p.blocos.forEach((bp, i) => {
    const be = e.blocos[i];
    const ep = estrutura(bp.texto);
    const ee = estrutura(be.texto);
    for (const k of Object.keys(ep)) if (ep[k] !== ee[k]) erros.push(`${rotulo} ${bp.id}: ${k} diferente (pt: ${ep[k]}; en: ${ee[k]})`);
    const np = numeros(bp.texto, 'pt').join(' ');
    const ne = numeros(be.texto, 'en').join(' ');
    if (np !== ne) erros.push(`${rotulo} ${bp.id}: números diferentes (pt: ${np || '-'}; en: ${ne || '-'})`);
    for (const m of be.texto.matchAll(/\]\((\/[^)#\s]*)/g)) {
      const destino = m[1];
      const emIngles = paginasEn.some((x) => x.meta.rota === destino);
      const ptSemTraducao = !INGLES_PUBLICADO && paginasPt.some((x) => x.meta.rota === destino && !paginasEn.some((y) => y.meta.pagina === x.meta.pagina));
      if (!emIngles && !ptSemTraducao) erros.push(`${rotulo} ${bp.id}: link interno para ${destino}, que não é página em inglês${INGLES_PUBLICADO ? '' : ' nem página em português ainda sem tradução'}`);
    }
  });
}

if (erros.length) {
  console.error(`conferir-paridade: ${erros.length} problema(s)`);
  erros.forEach((x) => console.error(' - ' + x));
  process.exit(1);
}
console.log(`conferir-paridade: ok (${rotulosConferidos} rótulos em inglês com as mesmas chaves, variáveis e marcadores do português; ${pares} par(es) de páginas conferido(s))`);
