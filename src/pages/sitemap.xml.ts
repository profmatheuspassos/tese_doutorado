import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { url } from '../lib/paginas';
import { idioma, IDIOMA_PADRAO } from '../lib/idiomas.mjs';
import { inglesAtivo } from '../lib/site.mjs';

const ordenar = (a: string, b: string) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b));

// Sitemap das páginas do site (as mesmas da navegação), sem a 404 e sem lastmod.
// Com o inglês ativo (D91, D92): as páginas dos dois idiomas e, em cada página com par, os
// alternates pt-BR, en e x-default (português). Com a chave desligada, o arquivo é o de antes.
export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('Falta o "site" no astro.config.mjs.');
  const pt = await getCollection('paginas');
  if (!inglesAtivo()) {
    const rotas = pt.map((p) => p.data.rota).sort(ordenar);
    const linhas = rotas.map((r) => `  <url><loc>${new URL(url(r), site).href}</loc></url>`);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${linhas.join('\n')}\n</urlset>\n`;
    return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
  }
  const en = await getCollection('paginasEn');
  const abs = (r: string) => new URL(url(r), site).href;
  const hPt = idioma(IDIOMA_PADRAO).hreflang;
  const hEn = idioma('en').hreflang;
  const entradas = [
    ...pt.map((p) => ({ rota: p.data.rota, ptRota: p.data.rota, enRota: en.find((e) => e.data.pagina === p.data.pagina)?.data.rota })),
    ...en.map((e) => ({ rota: e.data.rota, enRota: e.data.rota, ptRota: pt.find((p) => p.data.pagina === e.data.pagina)?.data.rota })),
  ].sort((a, b) => ordenar(a.rota, b.rota));
  const linhas = entradas.map((e) => {
    if (!e.ptRota || !e.enRota) return `  <url><loc>${abs(e.rota)}</loc></url>`;
    const alt = [[hPt, e.ptRota], [hEn, e.enRota], ['x-default', e.ptRota]]
      .map(([h, r]) => `\n    <xhtml:link rel="alternate" hreflang="${h}" href="${abs(r)}"/>`).join('');
    return `  <url>\n    <loc>${abs(e.rota)}</loc>${alt}\n  </url>`;
  });
  // O espaço de nomes xhtml só entra quando há alternates (página com par).
  const xhtml = entradas.some((e) => e.ptRota && e.enRota) ? ' xmlns:xhtml="http://www.w3.org/1999/xhtml"' : '';
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${xhtml}>\n${linhas.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
