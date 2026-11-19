import { getCollection, getEntry } from 'astro:content';
import { dividirBlocos } from './blocos';
import { idioma as dadosIdioma, IDIOMA_PADRAO, type CodigoIdioma } from './idiomas.mjs';

// Cada função lê a coleção do idioma pedido (src/lib/idiomas.mjs); o padrão é o português.
const colecao = (idioma: CodigoIdioma) => dadosIdioma(idioma).colecao;

export async function pagina(id: string, idioma: CodigoIdioma = IDIOMA_PADRAO) {
  const entrada = await getEntry(colecao(idioma), id);
  if (!entrada?.rendered?.html) throw new Error(`Página não encontrada ou sem HTML: ${id}`);
  return { dados: entrada.data, blocos: dividirBlocos(entrada.rendered.html) };
}

/** Capítulos em ordem, para a navegação e os links "Leia o capítulo N". */
export async function capitulos(idioma: CodigoIdioma = IDIOMA_PADRAO) {
  const todas = await getCollection(colecao(idioma));
  return todas
    .filter((p) => typeof p.data.capitulo === 'number')
    .sort((a, b) => a.data.capitulo! - b.data.capitulo!)
    .map((p) => ({ n: p.data.capitulo!, titulo: p.data.titulo, rota: p.data.rota }));
}

export async function sobre(idioma: CodigoIdioma = IDIOMA_PADRAO) {
  const s = await getEntry(colecao(idioma), 'sobre');
  if (!s) throw new Error('Página "sobre" ausente.');
  return { titulo: s.data.titulo, rota: s.data.rota };
}

/** Prefixa uma rota com o base configurado (publicação em subpasta). */
export function url(rota: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${rota}`;
}
