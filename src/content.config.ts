import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Textos aprovados na Fase 2. Lidos como estão; nada aqui altera o conteúdo.
const paginas = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pt-br' }),
  schema: z.object({
    pagina: z.string(),
    rota: z.string(),
    titulo: z.string(),
    subtitulo: z.string().optional(),
    capitulo: z.number().optional(),
    titulo_original: z.string().optional(),
  }),
});

export const collections = { paginas };
