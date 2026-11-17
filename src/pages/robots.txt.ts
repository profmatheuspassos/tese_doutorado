import type { APIRoute } from 'astro';
import { url } from '../lib/paginas';

// Tudo liberado; aponta o sitemap.
export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('Falta o "site" no astro.config.mjs.');
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL(url('/sitemap.xml'), site).href}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
