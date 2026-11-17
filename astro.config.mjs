// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { satteri } from '@astrojs/markdown-satteri';

// Saída 100% estática. SITE_URL e BASE_PATH ficam configuráveis para a publicação (Fase 5).
export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || 'https://example.invalid',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'always',
  // Sem aspas "inteligentes": o texto aprovado sai caractere por caractere.
  markdown: { processor: satteri({ features: { smartPunctuation: false } }) },
  vite: { plugins: [tailwindcss()] },
  devToolbar: { enabled: false },
});
