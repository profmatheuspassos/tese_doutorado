#!/usr/bin/env node
/**
 * Gera larguras menores (840 e 1680 px) de cada imagem .webp de public/img, para o srcset.
 * Grava em public/img/variantes/ (fora do Git) e nunca toca nos arquivos originais: a imagem
 * final do autor continua sendo só uma troca de arquivo com o mesmo nome. Refaz a variante
 * quando o original é mais novo que ela.
 */
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, parse } from 'node:path';

const exigir = createRequire(import.meta.url);
const sharp = exigir('sharp');
const pasta = new URL('../public/img', import.meta.url).pathname;
const destino = join(pasta, 'variantes');
const LARGURAS = [840, 1680];
mkdirSync(destino, { recursive: true });

let feitas = 0;
let mantidas = 0;
for (const nome of readdirSync(pasta).filter((f) => f.endsWith('.webp'))) {
  const original = join(pasta, nome);
  const { width } = await sharp(original).metadata();
  for (const w of LARGURAS.filter((l) => l < width)) {
    const saida = join(destino, `${parse(nome).name}-${w}.webp`);
    if (existsSync(saida) && statSync(saida).mtimeMs >= statSync(original).mtimeMs) { mantidas++; continue; }
    await sharp(original).resize({ width: w }).webp({ quality: 78 }).toFile(saida);
    feitas++;
  }
}
console.log(`variantes-imagens: ok (${feitas} gerada(s), ${mantidas} já em dia)`);
