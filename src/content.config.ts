import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Textos aprovados na Fase 2. Lidos como estão; nada aqui altera o conteúdo.
const campos = {
  pagina: z.string(),
  rota: z.string(),
  titulo: z.string(),
  subtitulo: z.string().optional(),
  capitulo: z.number().optional(),
  titulo_original: z.string().optional(),
};

const paginas = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pt-br' }),
  schema: z.object(campos),
});

// Versão em inglês (D85 a D104): tradução do texto aprovado em português, ligada ao par pelo campo
// `pagina`. Nos capítulos, `traducao_titulo_original` é a tradução do título na tese (T52); o
// original continua vindo do .md em português. Vazia até a Etapa 3.
const paginasEn = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/en' }),
  schema: z.object({ ...campos, traducao_titulo_original: z.string().optional() }),
});

export const collections = { paginas, paginasEn };
