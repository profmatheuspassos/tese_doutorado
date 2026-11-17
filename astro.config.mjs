// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { satteri } from '@astrojs/markdown-satteri';
import { pluginSemQuebra } from './src/lib/plugin-sem-quebra.mjs';

// Saída 100% estática. SITE_URL e BASE_PATH ficam configuráveis para a publicação (Fase 5).
export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || 'https://example.invalid',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'always',
  // Aspas tipográficas ligadas (padrão do Astro). Palavras com hífen não quebram de linha.
  markdown: { processor: satteri({ hastPlugins: [pluginSemQuebra] }) },
  vite: { plugins: [tailwindcss()] },
  devToolbar: { enabled: false },
});
