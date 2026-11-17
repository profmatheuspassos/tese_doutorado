#!/usr/bin/env node
/**
 * Confere src/data/dados.json:
 *  1. contra as tabelas dos Quadros 1 a 5 em docs/PLANO-CONTEUDO.md (seção 4.1), célula por célula;
 *  2. soma de cada coluna entre 99,9 e 100,1;
 *  3. contra os textos aprovados: cada frase registrada em "usos" precisa aparecer, com os números
 *     do JSON, no .md da página. Nas frases, {caminho} é um valor da série, formatado como no site
 *     (src/lib/rotulos.mjs); {caminho|extenso} e {caminho|extenso_f} escrevem o número por extenso
 *     (masculino ou feminino), como o texto aprovado faz ("oito referendos", "duas nacionais");
 *     com inicial maiúscula ({caminho|Extenso_f}), o número abre a frase ("Quatro viraram lei");
 *  4. nenhum número com vírgula decimal escrito à mão nos componentes e páginas.
 * Qualquer diferença encerra com erro.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { formatarValor, lerCaminho } from '../src/lib/rotulos.mjs';

const raiz = new URL('..', import.meta.url).pathname;
const ler = (p) => readFileSync(join(raiz, p), 'utf8');
const dados = JSON.parse(ler('src/data/dados.json'));
const erros = [];
const fmt = (n) => n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const espacos = (s) => s.replace(/\s+/g, ' ');

// 1. JSON x plano
const serie = dados.confianca_instituicoes_br;
const plano = ler('docs/PLANO-CONTEUDO.md');
const secao41 = plano.split('### 4.1')[1]?.split('### 4.2')[0];
if (!secao41) erros.push('Seção 4.1 não encontrada no PLANO-CONTEUDO.md.');
let celulas = 0;
for (const [chave, inst] of Object.entries(serie.instituicoes)) {
  const cab = `**Quadro ${inst.quadro} — ${inst.nome_no_plano}**`;
  const trecho = secao41?.split(cab)[1];
  if (!trecho) { erros.push(`Plano: não achei "${cab}".`); continue; }
  const linhas = trecho.split('\n').filter((l) => l.startsWith('|')).slice(2, 8);
  for (const [resp, rotulo] of Object.entries(serie.respostas)) {
    const linha = linhas.find((l) => l.split('|')[1].trim() === rotulo);
    if (!linha) { erros.push(`Plano, Quadro ${inst.quadro}: sem a linha "${rotulo}".`); continue; }
    const doPlano = linha.split('|').slice(2, 5).map((c) => Number(c.trim().replace(',', '.')));
    doPlano.forEach((v, i) => {
      celulas++;
      const j = inst.valores[resp][i];
      if (v !== j) erros.push(`Quadro ${inst.quadro} (${chave}), ${rotulo}, ${serie.anos[i]}: plano ${fmt(v)} x JSON ${fmt(j)}.`);
    });
  }
}

// 2. Somas
for (const [chave, inst] of Object.entries(serie.instituicoes)) {
  serie.anos.forEach((ano, i) => {
    const soma = Object.values(inst.valores).reduce((s, col) => s + col[i], 0);
    if (soma < 99.9 - 1e-9 || soma > 100.1 + 1e-9) erros.push(`Soma fora de 99,9–100,1: ${chave} ${ano} = ${soma.toFixed(2)}.`);
  });
}

// 3. JSON x textos aprovados
const EXTENSO = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez'];
const EXTENSO_F = { 1: 'uma', 2: 'duas' };
function valorNaFrase(serie, caminho, formato) {
  const v = lerCaminho(serie, caminho);
  if (!formato) {
    const chaves = caminho.split('.').filter((p) => !/^\d+$/.test(p));
    return formatarValor(v, chaves[chaves.length - 1]);
  }
  if (!/^[eE]xtenso(_f)?$/.test(formato)) throw new Error(`formato desconhecido: |${formato}`);
  if (!Number.isInteger(v) || v < 0 || v >= EXTENSO.length) throw new Error(`sem extenso para ${caminho} = ${v}`);
  const palavra = formato.endsWith('_f') ? EXTENSO_F[v] ?? EXTENSO[v] : EXTENSO[v];
  return formato[0] === 'E' ? palavra[0].toUpperCase() + palavra.slice(1) : palavra;
}
let frases = 0;
for (const u of dados.usos) {
  const md = espacos(ler(`src/content/pt-br/${u.pagina}.md`));
  const procurar = (frase, rotulo) => {
    frases++;
    if (!md.includes(espacos(frase))) erros.push(`${u.pagina} ${u.bloco}: não achei no texto aprovado a frase "${frase}" (${rotulo}).`);
  };
  if (u.itens) {
    for (const item of u.itens) {
      const inst = serie.instituicoes[item.instituicao];
      const frase = item.frase.replace(/\{(\d{4})\}/g, (_, ano) => {
        const i = serie.anos.indexOf(Number(ano));
        return fmt(inst.valores[u.resposta][i]);
      });
      procurar(frase, `${item.instituicao}, ${u.resposta}`);
    }
  }
  if (u.frases) {
    const s = dados[u.serie];
    if (!s) { erros.push(`${u.pagina} ${u.bloco}: série inexistente no dados.json: ${u.serie}`); continue; }
    for (const modelo of u.frases) {
      let frase;
      try { frase = modelo.replace(/\{([\w.]+)(?:\|(\w+))?\}/g, (_, caminho, formato) => valorNaFrase(s, caminho, formato)); }
      catch (e) { erros.push(`${u.pagina} ${u.bloco}: ${e.message} (${u.serie})`); continue; }
      procurar(frase, u.serie);
    }
  }
}

// 4. Números escritos à mão no código
const pastas = ['src/components', 'src/pages', 'src/layouts', 'src/lib'];
const arquivos = [];
const andar = (d) => readdirSync(join(raiz, d)).forEach((f) => {
  const p = join(d, f);
  statSync(join(raiz, p)).isDirectory() ? andar(p) : arquivos.push(p);
});
pastas.forEach(andar);
for (const a of arquivos) {
  const linhas = ler(a).split('\n');
  linhas.forEach((l, i) => {
    if (/(^|[^\w.])\d{1,3},\d(?![\w])/.test(l) && !/^\s*(\/\/|\*)/.test(l)) erros.push(`${a}:${i + 1}: número com vírgula decimal no código: ${l.trim()}`);
  });
}

if (erros.length) {
  console.error(`conferir-dados: ${erros.length} problema(s)`);
  erros.forEach((e) => console.error(' - ' + e));
  process.exit(1);
}
console.log(`conferir-dados: ok (${celulas} células contra o plano, somas conferidas, ${frases} frases nos textos, ${arquivos.length} arquivos de código sem números soltos)`);
