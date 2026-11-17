import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { url } from '../lib/paginas';

// Sitemap das páginas do site (as mesmas da navegação), sem a 404 e sem lastmod.
export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('Falta o "site" no astro.config.mjs.');
  const rotas = (await getCollection('paginas')).map((p) => p.data.rota).sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)));
  const linhas = rotas.map((r) => `  <url><loc>${new URL(url(r), site).href}</loc></url>`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${linhas.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
