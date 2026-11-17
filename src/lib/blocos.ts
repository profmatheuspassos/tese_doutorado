/**
 * Divide o HTML renderizado de uma página aprovada nos blocos marcados com
 * <!-- Bn | título | origem: ... -->. Nada do texto é alterado: cada bloco é
 * a fatia exata do HTML que o Astro gerou a partir do .md. As marcas de origem
 * não vão para a página publicada.
 */
export interface Bloco {
  id: string; // "B3"
  titulo: string; // "Na prática"
  html: string; // fatia do HTML, sem a marca
  elementos: string[]; // elementos de topo (h2, p, ul, table, h3...), na ordem original
}

const MARCA = /<!--\s*(B\d+)\s*\|\s*([^|]+?)\s*\|[\s\S]*?-->/g;

export function dividirBlocos(html: string): Map<string, Bloco> {
  const marcas = [...html.matchAll(MARCA)];
  if (marcas.length === 0) throw new Error('Nenhuma marca de bloco encontrada.');
  const blocos = new Map<string, Bloco>();
  marcas.forEach((m, i) => {
    const inicio = m.index! + m[0].length;
    const fim = i + 1 < marcas.length ? marcas[i + 1].index! : html.length;
    const trecho = html.slice(inicio, fim).trim();
    if (blocos.has(m[1])) throw new Error(`Bloco repetido: ${m[1]}`);
    blocos.set(m[1], { id: m[1], titulo: m[2], html: trecho, elementos: elementosDeTopo(trecho) });
  });
  return blocos;
}

/** Separa o HTML em elementos de topo, contando a profundidade das tags. */
export function elementosDeTopo(html: string): string[] {
  const vazias = new Set(['br', 'hr', 'img', 'input', 'meta', 'link', 'source', 'wbr', 'col']);
  const saida: string[] = [];
  const tag = /<\/?([a-zA-Z][\w-]*)[^>]*?(\/?)>/g;
  let profundidade = 0;
  let inicio = -1;
  let m: RegExpExecArray | null;
  while ((m = tag.exec(html))) {
    const nome = m[1].toLowerCase();
    const fecha = m[0].startsWith('</');
    const autoFecha = m[2] === '/' || vazias.has(nome);
    if (!fecha) {
      if (profundidade === 0) inicio = m.index;
      if (!autoFecha) profundidade++;
      else if (profundidade === 0) saida.push(m[0]);
    } else {
      profundidade--;
      if (profundidade === 0) saida.push(html.slice(inicio, m.index + m[0].length));
    }
  }
  if (profundidade !== 0) throw new Error('HTML de bloco desequilibrado.');
  const juntos = saida.join('').replace(/\s+/g, '');
  if (juntos !== html.replace(/\s+/g, '')) throw new Error('Texto solto fora de elemento no bloco.');
  return saida;
}

/** Acrescenta atributos à primeira tag de um elemento, sem tocar no texto. */
export function comAtributos(elemento: string, atributos: Record<string, string>): string {
  const extra = Object.entries(atributos)
    .map(([k, v]) => ` ${k}="${v.replace(/"/g, '&quot;')}"`)
    .join('');
  return elemento.replace(/^<([a-zA-Z][\w-]*)/, `<$1${extra}`);
}
