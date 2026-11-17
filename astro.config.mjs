// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { satteri } from '@astrojs/markdown-satteri';
import { pluginSemQuebra } from './src/lib/plugin-sem-quebra.mjs';
import { site, base } from './src/lib/site.mjs';

// Saída 100% estática, no endereço final (D72, src/lib/site.mjs). SITE_URL e BASE_PATH ainda
// podem sobrescrevê-lo.
export default defineConfig({
  output: 'static',
  site: site(),
  base: base(),
  trailingSlash: 'always',
  // Aspas tipográficas ligadas (padrão do Astro). Palavras com hífen não quebram de linha.
  markdown: { processor: satteri({ hastPlugins: [pluginSemQuebra] }) },
  vite: { plugins: [tailwindcss()] },
  devToolbar: { enabled: false },
});
