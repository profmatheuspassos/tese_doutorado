import { getCollection, getEntry } from 'astro:content';
import { dividirBlocos } from './blocos';
import { idioma as dadosIdioma, IDIOMA_PADRAO, outroIdioma, type CodigoIdioma } from './idiomas.mjs';
import { INGLES_PUBLICADO } from './site.mjs';

// Cada função lê a coleção do idioma pedido (src/lib/idiomas.mjs); o padrão é o português.
const colecao = (idioma: CodigoIdioma) => dadosIdioma(idioma).colecao;

export async function pagina(id: string, idioma: CodigoIdioma = IDIOMA_PADRAO) {
  const entrada = await getEntry(colecao(idioma), id);
  if (!entrada?.rendered?.html) throw new Error(`Página não encontrada ou sem HTML: ${id} (${idioma})`);
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
  if (!s) throw new Error(`Página "sobre" ausente (${idioma}).`);
  return { titulo: s.data.titulo, rota: s.data.rota };
}

/**
 * Título do capítulo na tese (T13). O original vem sempre do .md em português; numa página em
 * inglês, vem também a tradução (T52, campo `traducao_titulo_original`) e o `lang` do original.
 * Capítulo traduzido sem a tradução do título faz o build falhar.
 */
export async function tituloNaTese(id: string, idioma: CodigoIdioma = IDIOMA_PADRAO): Promise<{ original: string; traducao?: string; langOriginal?: string }> {
  const original = (await getEntry(colecao(IDIOMA_PADRAO), id))?.data.titulo_original;
  if (!original) throw new Error(`Página sem titulo_original no português: ${id}`);
  if (idioma === IDIOMA_PADRAO) return { original };
  const dados = (await getEntry(colecao(idioma), id))?.data;
  const traducao = dados && 'traducao_titulo_original' in dados ? dados.traducao_titulo_original : undefined;
  if (!traducao) throw new Error(`Página sem traducao_titulo_original (${idioma}): ${id}`);
  return { original, traducao, langOriginal: dadosIdioma(IDIOMA_PADRAO).lang };
}

/** Rota do início de um idioma, se a home desse idioma existe. */
export async function inicioDe(idioma: CodigoIdioma): Promise<string | undefined> {
  return (await getEntry(colecao(idioma), 'home'))?.data.rota;
}

/**
 * Página equivalente no outro idioma (D91), pelo campo `pagina`: a rota do par, ou nada se a
 * página ainda não tem tradução.
 */
export async function parDe(rota: string, idioma: CodigoIdioma): Promise<string | undefined> {
  const daqui = (await getCollection(colecao(idioma))).find((p) => p.data.rota === rota);
  if (!daqui) return undefined;
  const outro = outroIdioma(idioma);
  return (await getCollection(colecao(outro))).find((p) => p.data.pagina === daqui.data.pagina)?.data.rota;
}

/** Item de navegação. `lang` só vem preenchido quando o item é a página em português usada no
 * lugar de uma página em inglês que ainda não existe (só em pré-visualização). */
export interface ItemNavegacao { rota: string; titulo: string; n?: number; lang?: string }

/**
 * Itens do cabeçalho, do rodapé e da navegação "Anterior / A seguir" de um idioma: título do site
 * (título da home), capítulos em ordem e "Sobre". No português, é exatamente o que as funções acima
 * devolvem. No inglês, enquanto faltar tradução (só em pré-visualização, com INGLES=1), a página em
 * português ocupa o lugar, marcada com lang="pt-BR" (plano da versão em inglês, Etapa 3). Com o
 * inglês publicado, página sem tradução faz o build falhar.
 */
export async function navegacao(idioma: CodigoIdioma = IDIOMA_PADRAO) {
  const pt = await getCollection(colecao(IDIOMA_PADRAO));
  const doIdioma = idioma === IDIOMA_PADRAO ? pt : await getCollection(colecao(idioma));
  const langPt = dadosIdioma(IDIOMA_PADRAO).lang;
  const escolher = (id: string): ItemNavegacao & { capitulo?: number } => {
    const original = pt.find((p) => p.data.pagina === id);
    if (!original) throw new Error(`Página "${id}" ausente no português.`);
    const traduzida = doIdioma.find((p) => p.data.pagina === id);
    if (traduzida) return { rota: traduzida.data.rota, titulo: traduzida.data.titulo, capitulo: traduzida.data.capitulo };
    if (INGLES_PUBLICADO) throw new Error(`Página "${id}" sem tradução (${idioma}), com o inglês publicado.`);
    return { rota: original.data.rota, titulo: original.data.titulo, capitulo: original.data.capitulo, lang: langPt };
  };
  const ids = pt.filter((p) => typeof p.data.capitulo === 'number').sort((a, b) => a.data.capitulo! - b.data.capitulo!).map((p) => p.data.pagina);
  const caps = ids.map((id) => { const { capitulo, ...item } = escolher(id); return { ...item, n: capitulo! }; });
  const { capitulo: _h, ...inicio } = escolher('home');
  const { capitulo: _s, ...pSobre } = escolher('sobre');
  return { inicio, capitulos: caps, sobre: pSobre };
}

/** Prefixa uma rota com o base configurado (publicação em subpasta). */
export function url(rota: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${rota}`;
}
