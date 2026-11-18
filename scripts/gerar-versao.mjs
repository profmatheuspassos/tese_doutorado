#!/usr/bin/env node
/**
 * Grava dist/versao.txt (D78): o commit da main que gerou o site e a data e hora do build em UTC,
 * em duas linhas, sem nenhum outro dado. Serve para saber qual versão está no ar e faz todo merge
 * mudar a branch "publicacao" (a hora muda a cada build), o que dispara a implantação automática.
 *
 *   commit <40 caracteres do commit>
 *   gerado <AAAA-MM-DDTHH:MM:SSZ>
 *
 * No GitHub Actions o commit é o GITHUB_SHA; fora dele, o HEAD do repositório local.
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const FORMATO_VERSAO = /^commit [0-9a-f]{40}\ngerado \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z\n$/;

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dist = new URL('../dist', import.meta.url).pathname;
  const raiz = new URL('..', import.meta.url).pathname;
  const commit = process.env.GITHUB_SHA || execFileSync('git', ['rev-parse', 'HEAD'], { cwd: raiz, encoding: 'utf8' }).trim();
  const gerado = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const texto = `commit ${commit}\ngerado ${gerado}\n`;
  if (!FORMATO_VERSAO.test(texto)) throw new Error(`versao.txt fora do formato: ${JSON.stringify(texto)}`);
  writeFileSync(join(dist, 'versao.txt'), texto);
  console.log(`gerar-versao: ok (dist/versao.txt: commit ${commit.slice(0, 7)}, gerado ${gerado})`);
}
