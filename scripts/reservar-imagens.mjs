#!/usr/bin/env node
/**
 * Cria os espaços reservados das imagens ilustrativas em public/img, com nome e tamanho
 * exatos (lista única em src/lib/imagens.mjs; prompts em docs/PROMPTS-IMAGENS.md). Cor lisa,
 * sem texto. Nunca sobrescreve um arquivo que já exista: as imagens finais do autor ficam
 * preservadas.
 * Gera também og-home.png a partir do desenho do motivo (feito no projeto, sem IA).
 */
import { createRequire } from 'node:module';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { IMAGENS } from '../src/lib/imagens.mjs';

const exigir = createRequire(import.meta.url);
const sharp = exigir('sharp');
const pasta = new URL('../public/img', import.meta.url).pathname;
mkdirSync(pasta, { recursive: true });

for (const { nome, largura: w, altura: h, fundo: cor } of IMAGENS) {
  const destino = join(pasta, nome);
  if (existsSync(destino)) { console.log(`  mantido (já existe): ${nome}`); continue; }
  await sharp({ create: { width: w, height: h, channels: 3, background: cor } }).webp({ quality: 80 }).toFile(destino);
  console.log(`  criado: ${nome} (${w}×${h})`);
}

// Imagem de compartilhamento: ramo (Portugal) e sementes (Brasil) sobre fundo branco.
const og = join(pasta, 'og-home.png');
if (!existsSync(og)) {
  const folha = 'M0 0C10-13 32-13 44 0C32 13 10 13 0 0Z';
  const folhas = [[74, 252, -140], [196, 142, -35], [176, 374, -40], [120, 66, -120], [153, 40, -80]]
    .map(([x, y, r]) => `<path d="${folha}" transform="translate(${x} ${y}) rotate(${r})" fill="#3d7a47" fill-opacity="0.14" stroke="#3d7a47" stroke-width="2.5" transform-origin="0 0"/>`).join('');
  const semente = (x, r) => `<g transform="translate(${x} 0) rotate(${r})"><path d="M0-9C5-9 6.5-3 6.5 1C6.5 6 3.5 9 0 9S-6.5 6-6.5 1C-6.5-3-5-9 0-9Z" fill="#b4532a" fill-opacity="0.18" stroke="#b4532a" stroke-width="0.7"/><path d="M0-5V5" stroke="#b4532a" stroke-width="0.45" opacity="0.6"/></g>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#ffffff"/>
    <g transform="translate(330 35) scale(1.0)" fill="none" stroke="#3d7a47" stroke-linecap="round" stroke-width="3.5">
      <path d="M118 560C112 470 132 400 126 320S150 170 152 40"/>
      <path stroke-width="2.5" d="M126 318C110 300 92 274 74 252M140 204C158 186 178 160 196 142M128 422C142 406 160 388 176 374M150 104C140 90 130 78 120 66"/>
      ${folhas}
    </g>
    <g transform="translate(700 470) scale(4)">${semente(0, -28)}${semente(36, 14)}${semente(72, -6)}</g>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(og);
  console.log('  criado: og-home.png (1200×630)');
}
