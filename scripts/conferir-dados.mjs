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
 *     Nas páginas já traduzidas, frase_en e frases_en no .md em inglês, com números en-US (3b);
 *  4. nenhum número com vírgula decimal escrito à mão nos componentes e páginas;
 *  5. trava do dados.json (D94): a impressão SHA-256 do arquivo, sem os campos da versão em inglês,
 *     precisa ser a do dados.json aprovado (ver IMPRESSAO_DADOS).
 * Qualquer diferença encerra com erro.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { formatarValor, lerCaminho } from '../src/lib/rotulos.mjs';
import { idioma } from '../src/lib/idiomas.mjs';

const raiz = new URL('..', import.meta.url).pathname;
const ler = (p) => readFileSync(join(raiz, p), 'utf8');
const dados = JSON.parse(ler('src/data/dados.json'));
const erros = [];
// Textos e números em português (src/lib/idiomas.mjs).
const PT = idioma('pt-br');
const fmt = (n) => n.toLocaleString(PT.locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const espacos = (s) => s.replace(/\s+/g, ' ');

// 5. Trava do dados.json (D94). Impressão do dados.json da main em b9562f3 (idêntico ao de
// 45fa138: mesmo blob 62d305c, sem mudança desde c45fcfa). Só os campos da versão em inglês ficam
// fora da conta, e só nestes dois lugares: usos[i].frases_en e usos[i].itens[j].frase_en. Todo o
// resto entra, inclusive as frases em português e a ordem das chaves; espaços e quebras de linha
// não entram, porque não são dado. Qualquer mudança faz o build falhar. A impressão fica aqui, e
// não num "git show main", para funcionar igual no Actions (que clona um commit só) e no local.
const IMPRESSAO_DADOS = 'd1a09f15d2ed28d5ea7b558983e0f458d6c5808889ab104da307015a35066bc8';
function impressaoDados(objeto) {
  const copia = structuredClone(objeto);
  for (const u of Array.isArray(copia.usos) ? copia.usos : []) {
    if (u && typeof u === 'object') {
      delete u.frases_en;
      for (const item of Array.isArray(u.itens) ? u.itens : []) if (item && typeof item === 'object') delete item.frase_en;
    }
  }
  return createHash('sha256').update(JSON.stringify(copia), 'utf8').digest('hex');
}
const impressao = impressaoDados(dados);
if (impressao !== IMPRESSAO_DADOS) erros.push(`dados.json mudou fora de frases_en e frase_en (impressão ${impressao}, esperada ${IMPRESSAO_DADOS}). Os dados e as frases em português estão travados (D94).`);

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
    return formatarValor(v, chaves[chaves.length - 1], PT.locale);
  }
  if (!/^[eE]xtenso(_f)?$/.test(formato)) throw new Error(`formato desconhecido: |${formato}`);
  if (!Number.isInteger(v) || v < 0 || v >= EXTENSO.length) throw new Error(`sem extenso para ${caminho} = ${v}`);
  const palavra = formato.endsWith('_f') ? EXTENSO_F[v] ?? EXTENSO[v] : EXTENSO[v];
  return formato[0] === 'E' ? palavra[0].toUpperCase() + palavra.slice(1) : palavra;
}
let frases = 0;
for (const u of dados.usos) {
  const md = espacos(ler(`${PT.pasta}/${u.pagina}.md`));
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

// 3b. JSON x textos aprovados em inglês (D85, D90; docs/PLANO-INGLES.md, seção c). Para cada página
// que já tem tradução em src/content/en/, cada uso precisa da frase em inglês (frase_en nos itens,
// frases_en nos demais), com os números no formato en-US e os por extenso em inglês. Página ainda
// sem tradução: nada a conferir. Os números continuam só no dados.json.
const EN = idioma('en');
const fmtEn = (n) => n.toLocaleString(EN.locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const EXTENSO_EN = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
function valorNaFraseEn(serie, caminho, formato) {
  const v = lerCaminho(serie, caminho);
  if (!formato) {
    const chaves = caminho.split('.').filter((p) => !/^\d+$/.test(p));
    return formatarValor(v, chaves[chaves.length - 1], EN.locale);
  }
  if (!/^[eE]xtenso(_f)?$/.test(formato)) throw new Error(`formato desconhecido: |${formato}`);
  if (!Number.isInteger(v) || v < 0 || v >= EXTENSO_EN.length) throw new Error(`sem extenso em inglês para ${caminho} = ${v}`);
  const palavra = EXTENSO_EN[v];
  return formato[0] === 'E' ? palavra[0].toUpperCase() + palavra.slice(1) : palavra;
}
let frasesEn = 0;
for (const u of dados.usos) {
  const arquivoEn = join(raiz, EN.pasta, `${u.pagina}.md`);
  if (!existsSync(arquivoEn)) continue;
  const md = espacos(readFileSync(arquivoEn, 'utf8'));
  const procurar = (frase, rotulo) => {
    frasesEn++;
    if (!md.includes(espacos(frase))) erros.push(`${u.pagina} ${u.bloco} (en): não achei no texto aprovado em inglês a frase "${frase}" (${rotulo}).`);
  };
  if (u.itens) {
    for (const item of u.itens) {
      if (typeof item.frase_en !== 'string') { erros.push(`${u.pagina} ${u.bloco} (en): item ${item.instituicao} sem frase_en (a página já tem tradução).`); continue; }
      const inst = serie.instituicoes[item.instituicao];
      const frase = item.frase_en.replace(/\{(\d{4})\}/g, (_, ano) => fmtEn(inst.valores[u.resposta][serie.anos.indexOf(Number(ano))]));
      procurar(frase, `${item.instituicao}, ${u.resposta}`);
    }
  }
  if (u.frases) {
    if (!Array.isArray(u.frases_en) || u.frases_en.length !== u.frases.length) { erros.push(`${u.pagina} ${u.bloco} (en): frases_en ausente ou com quantidade diferente de frases (a página já tem tradução).`); continue; }
    const s = dados[u.serie];
    for (const modelo of u.frases_en) {
      let frase;
      try { frase = modelo.replace(/\{([\w.]+)(?:\|(\w+))?\}/g, (_, caminho, formato) => valorNaFraseEn(s, caminho, formato)); }
      catch (e) { erros.push(`${u.pagina} ${u.bloco} (en): ${e.message} (${u.serie})`); continue; }
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
console.log(`conferir-dados: ok (${celulas} células contra o plano, somas conferidas, ${frases} frases nos textos, ${frasesEn} em inglês, ${arquivos.length} arquivos de código sem números soltos, dados.json com a impressão aprovada ${IMPRESSAO_DADOS.slice(0, 12)}…)`);
