#!/usr/bin/env node
/**
 * Gera dist/.htaccess, o arquivo do servidor da pasta do subdomínio na Hostinger (D71 a D75).
 * Roda no postbuild, depois do build, porque a Content-Security-Policy leva o hash de cada
 * <script> e <style> em linha das páginas, que muda com o código.
 *
 * Conteúdo: HTTPS e host canônico (301), página 404 do site, caminhos com ponto (.git) em 404,
 * cabeçalhos de segurança, cache por tipo de arquivo e compressão. Só usa mod_rewrite,
 * mod_headers e mod_deflate, que o LiteSpeed da Hostinger entende.
 *
 * Exporta cabecalhos() e cspDoBuild() para as conferências e para os testes no navegador.
 */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { site, base } from '../src/lib/site.mjs';

const dist = new URL('../dist', import.meta.url).pathname;

const htmls = () => {
  const lista = [];
  const andar = (d) => readdirSync(d).forEach((f) => { const p = join(d, f); statSync(p).isDirectory() ? andar(p) : p.endsWith('.html') && lista.push(p); });
  andar(dist);
  return lista.sort();
};
export const hash = (s) => `'sha256-${createHash('sha256').update(s, 'utf8').digest('base64')}'`;

/** Hashes de todo <script> sem src e de todo <style> em linha do dist/. */
export function hashesEmLinha() {
  const scripts = new Set();
  const estilos = new Set();
  for (const arquivo of htmls()) {
    const html = readFileSync(arquivo, 'utf8');
    for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) if (!/\ssrc\s*=/.test(m[1])) scripts.add(hash(m[2]));
    for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)) estilos.add(hash(m[1]));
  }
  return { scripts: [...scripts].sort(), estilos: [...estilos].sort() };
}

/** Content-Security-Policy do build atual (D74). */
export function cspDoBuild() {
  const { scripts, estilos } = hashesEmLinha();
  return [
    "default-src 'none'",
    `script-src 'self' ${scripts.join(' ')}`.trim(),
    `style-src 'self' ${estilos.join(' ')}`.trim(),
    // Atributos style="…" (barras, rótulos do círculo, cores do bloco BibTeX): sem entrada do
    // usuário num site estático, não há como injetar estilo.
    "style-src-attr 'unsafe-inline'",
    "img-src 'self'",
    "font-src 'self'",
    "manifest-src 'self'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join('; ');
}

// Recursos do navegador que o site não usa ficam negados; só a escrita na área de transferência
// (botão "Copiar" da página "Sobre a tese") fica liberada para o próprio site.
const PERMISSOES = ['accelerometer', 'autoplay', 'browsing-topics', 'camera', 'display-capture', 'encrypted-media', 'fullscreen', 'geolocation', 'gyroscope', 'hid', 'idle-detection', 'magnetometer', 'microphone', 'midi', 'payment', 'picture-in-picture', 'publickey-credentials-get', 'screen-wake-lock', 'serial', 'usb', 'xr-spatial-tracking']
  .map((p) => `${p}=()`).concat('clipboard-write=(self)').join(', ');

/** Cabeçalhos de segurança que não dependem do build (todos, menos a CSP). */
export const CABECALHOS_FIXOS = {
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy': PERMISSOES,
};

/** Cabeçalhos de segurança enviados em toda resposta, na ordem do .htaccess. */
export function cabecalhos() {
  const { 'Strict-Transport-Security': hsts, ...resto } = CABECALHOS_FIXOS;
  return { 'Strict-Transport-Security': hsts, 'Content-Security-Policy': cspDoBuild(), ...resto };
}

/** Cache por tipo de arquivo (D75). JS, CSS e fontes só existem em /_astro/, com hash no nome. */
export const CACHE = [
  { extensoes: ['js', 'css', 'woff2'], valor: 'public, max-age=31536000, immutable' },
  { extensoes: ['webp', 'png', 'svg'], valor: 'public, max-age=86400' },
  { extensoes: ['html', 'xml', 'txt'], valor: 'no-cache' },
];

export function htaccess() {
  const host = new URL(site()).host;
  const hostRegex = host.replace(/\./g, '\\.');
  const b = base();
  const linhasCabecalhos = Object.entries(cabecalhos()).map(([k, v]) => `  Header always set ${k} "${v}"`).join('\n');
  const linhasCache = CACHE.map((c) => `  <FilesMatch "\\.(${c.extensoes.join('|')})$">\n    Header set Cache-Control "${c.valor}"\n  </FilesMatch>`).join('\n');
  return `# Pasta do subdomínio ${host}.
# Gerado por scripts/gerar-htaccess.mjs a cada build (decisões D71 a D75). Não editar à mão:
# a Content-Security-Policy leva os hashes dos scripts e estilos em linha do build.

Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 ${b}404.html

AddDefaultCharset utf-8
AddCharset utf-8 .html .css .js .xml .txt .svg
AddType image/webp .webp
AddType font/woff2 .woff2

<IfModule mod_rewrite.c>
  RewriteEngine On

  # Caminhos com ponto no começo (.git, que a Hostinger cria ao clonar a branch) respondem 404.
  # Fica de fora o .well-known, usado na emissão e renovação do certificado SSL.
  RewriteRule "(^|/)\\.(?!well-known(/|$))" - [R=404,L]

  # HTTPS e host canônico numa só volta. Cobre http:// e também o acesso pela pasta do
  # domínio principal (profmatheuspassos.com.br/tese/...), que vai para o subdomínio.
  RewriteCond %{HTTPS} !=on [OR]
  RewriteCond %{HTTP_HOST} !^${hostRegex}$ [NC]
  RewriteCond %{REQUEST_URI} !^/\\.well-known/
  RewriteRule ^(.*)$ https://${host}${b}$1 [R=301,L,NE]
</IfModule>

<IfModule mod_headers.c>
${linhasCabecalhos}
  Header always unset X-Powered-By
  Header unset X-Powered-By

${linhasCache}
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/xml text/xml text/plain image/svg+xml
</IfModule>
`;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const texto = htaccess();
  writeFileSync(join(dist, '.htaccess'), texto);
  const { scripts, estilos } = hashesEmLinha();
  console.log(`gerar-htaccess: ok (dist/.htaccess para ${new URL(site()).host}; CSP com ${scripts.length} hash(es) de script e ${estilos.length} de estilo)`);
}
