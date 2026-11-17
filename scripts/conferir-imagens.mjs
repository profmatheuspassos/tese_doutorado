#!/usr/bin/env node
/**
 * Confere as imagens de public/img antes do build (lista única em src/lib/imagens.mjs):
 *  - cada imagem da lista existe, no formato certo e com as dimensões exatas;
 *  - nenhuma passa do teto de peso;
 *  - não há imagem solta na pasta que o site não use.
 * Assim, uma imagem final com nome, tamanho ou peso errado derruba o build em vez de ir ao ar.
 */
import { createRequire } from 'node:module';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { IMAGENS, IMAGEM_OG, TETO_KB } from '../src/lib/imagens.mjs';

const exigir = createRequire(import.meta.url);
const sharp = exigir('sharp');
const pasta = new URL('../public/img', import.meta.url).pathname;
const erros = [];
const esperadas = [...IMAGENS, IMAGEM_OG];

for (const { nome, largura, altura } of esperadas) {
  const arquivo = join(pasta, nome);
  if (!existsSync(arquivo)) { erros.push(`${nome}: arquivo ausente`); continue; }
  const formato = nome.split('.').pop();
  const meta = await sharp(arquivo).metadata();
  if (meta.format !== formato) erros.push(`${nome}: formato ${meta.format} (esperado ${formato})`);
  if (meta.width !== largura || meta.height !== altura) erros.push(`${nome}: ${meta.width}×${meta.height} (esperado ${largura}×${altura})`);
  const kb = statSync(arquivo).size / 1024;
  if (kb > TETO_KB[formato]) erros.push(`${nome}: ${Math.round(kb)} KB (teto de ${TETO_KB[formato]} KB)`);
}
const nomes = new Set(esperadas.map((i) => i.nome));
for (const f of readdirSync(pasta)) {
  if (f === 'variantes') continue;
  if (!nomes.has(f)) erros.push(`${f}: arquivo fora da lista de imagens (src/lib/imagens.mjs)`);
}

if (erros.length) {
  console.error(`conferir-imagens: ${erros.length} problema(s)`);
  erros.forEach((e) => console.error(' - ' + e));
  process.exit(1);
}
console.log(`conferir-imagens: ok (${esperadas.length} imagens com nome, formato, dimensões e peso conferidos)`);
