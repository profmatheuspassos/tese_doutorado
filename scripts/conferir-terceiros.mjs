#!/usr/bin/env node
/**
 * Varre todo o dist/ atrás de recursos de terceiros, rastreamento e armazenamento no navegador.
 *  - HTML: nenhum src, srcset, poster, data, action ou <link href> para outro domínio.
 *    Links <a> para fora só para a lista permitida.
 *  - CSS: nenhum url() ou @import para outro domínio; nenhuma @font-face externa.
 *  - JS: nenhum fetch, sendBeacon, XMLHttpRequest, WebSocket, cookie, localStorage,
 *    sessionStorage, indexedDB ou import() de endereço externo.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { site } from '../src/lib/site.mjs';

const dist = new URL('../dist', import.meta.url).pathname;
// Links (só navegação, nada carregado de fora): depósito da tese, repositório, licenças (D76).
const LINKS_PERMITIDOS = [
  /^https:\/\/hdl\.handle\.net\//,
  /^https:\/\/github\.com\/profmatheuspassos\/tese_doutorado\/?$/,
  /^https:\/\/github\.com\/profmatheuspassos\/tese_doutorado\/blob\/main\/LICENSE$/,
  /^https:\/\/creativecommons\.org\/licenses\/by-nc-nd\/4\.0\/deed\.pt-br$/,
  /^mailto:/,
];
// Endereço absoluto do próprio site (canonical, D72) não é de terceiros.
const proprio = (v) => v.trim() === site() || v.trim().startsWith(`${site()}/`);
const externo = (v) => /^(https?:)?\/\//i.test(v.trim()) && !proprio(v);
const erros = [];
const avisos = [];
const arquivos = [];
const andar = (d) => readdirSync(d).forEach((f) => { const p = join(d, f); statSync(p).isDirectory() ? andar(p) : arquivos.push(p); });
andar(dist);

for (const a of arquivos) {
  const nome = relative(dist, a);
  if (!/\.(html|css|js|mjs|svg|json|webmanifest|xml|txt)$/.test(a)) continue;
  const s = readFileSync(a, 'utf8');

  if (/\.(html|svg)$/.test(a)) {
    for (const m of s.matchAll(/<([a-zA-Z][\w-]*)\b([^>]*)>/g)) {
      const [, tag, attrs] = m;
      for (const at of attrs.matchAll(/\s(src|srcset|href|poster|data|action|formaction|xlink:href)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
        const valor = at[3] ?? at[4] ?? at[5] ?? '';
        const valores = at[1].toLowerCase() === 'srcset' ? valor.split(',').map((x) => x.trim().split(/\s+/)[0]) : [valor];
        for (const v of valores) {
          if (tag.toLowerCase() === 'a' && at[1].toLowerCase() === 'href') {
            if ((externo(v) || /^mailto:/i.test(v)) && !LINKS_PERMITIDOS.some((r) => r.test(v))) erros.push(`${nome}: link para fora não permitido: ${v}`);
          } else if (externo(v)) {
            erros.push(`${nome}: recurso externo em <${tag} ${at[1]}>: ${v}`);
          }
        }
      }
    }
    for (const m of s.matchAll(/<style[^>]*>([\s\S]*?)<\/style>|style="([^"]*)"/g)) conferirCss(nome, m[1] ?? m[2]);
  }
  if (/\.css$/.test(a)) conferirCss(nome, s);
  if (/\.(js|mjs|html)$/.test(a)) {
    const codigo = /\.html$/.test(a) ? [...s.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n') : s;
    const proibidos = [/\bfetch\s*\(/, /sendBeacon/, /XMLHttpRequest/, /\bWebSocket\b/, /document\.cookie/, /\blocalStorage\b/, /\bsessionStorage\b/, /\bindexedDB\b/, /\bimport\s*\(\s*["'`]https?:/];
    for (const r of proibidos) if (r.test(codigo)) erros.push(`${nome}: uso proibido no JS: ${r}`);
    for (const m of codigo.matchAll(/https?:\/\/[^\s"'`)]+/g)) avisos.push(`${nome}: endereço citado no JS (não carregado): ${m[0]}`);
    for (const m of s.matchAll(/<script\b[^>]*\bsrc=["']?([^"'\s>]+)/g)) if (externo(m[1])) erros.push(`${nome}: <script src> externo: ${m[1]}`);
  }
}

function conferirCss(nome, css) {
  for (const m of css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)) if (externo(m[2])) erros.push(`${nome}: url() externa no CSS: ${m[2]}`);
  for (const m of css.matchAll(/@import\s+(?:url\()?\s*['"]?([^'");]+)/g)) if (externo(m[1])) erros.push(`${nome}: @import externo no CSS: ${m[1]}`);
}

avisos.forEach((a) => console.log('  aviso: ' + a));
if (erros.length) {
  console.error(`conferir-terceiros: ${erros.length} problema(s)`);
  erros.forEach((e) => console.error(' - ' + e));
  process.exit(1);
}
console.log(`conferir-terceiros: ok (${arquivos.length} arquivos no dist/, nenhum recurso de terceiros, cookie, armazenamento ou rastreamento)`);
