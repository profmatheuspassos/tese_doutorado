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

/**
 * Envolve um trecho exato de um elemento num <span class="...">, sem mudar o texto.
 * O trecho precisa aparecer exatamente uma vez; se não, o build falha.
 */
export function envolverTrecho(elemento: string, trecho: string, classe: string): string {
  const partes = elemento.split(trecho);
  if (partes.length !== 2) throw new Error(`Trecho "${trecho}" aparece ${partes.length - 1} vez(es) no elemento; esperado: 1.`);
  return `${partes[0]}<span class="${classe}">${trecho}</span>${partes[1]}`;
}

/** Garante que um trecho de HTML a inserir não traz texto (desenhos SVG são ignorados). */
function semTexto(html: string, quem: string) {
  if (/>[^<\s][^<]*</.test(html.replace(/<svg[\s\S]*?<\/svg>/g, ''))) throw new Error(`${quem} aceita só HTML sem texto.`);
}

/** Insere HTML sem texto logo depois da tag de abertura de um elemento. */
export function prefixar(elemento: string, html: string): string {
  semTexto(html, 'prefixar');
  return elemento.replace(/^(<[a-zA-Z][\w-]*[^>]*>)/, `$1${html}`);
}

/** Acrescenta atributos à primeira ocorrência de uma tag interna (ex.: o <thead> de uma tabela). */
export function atributosEmTag(elemento: string, tag: string, atributos: Record<string, string>): string {
  const re = new RegExp(`<${tag}(?=[\\s>])`);
  if (!re.test(elemento)) throw new Error(`Tag <${tag}> não encontrada no elemento.`);
  const extra = Object.entries(atributos).map(([k, v]) => ` ${k}="${v.replace(/"/g, '&quot;')}"`).join('');
  return elemento.replace(re, `<${tag}${extra}`);
}

/** Acrescenta um trecho de HTML sem texto antes do fechamento de cada <li> de uma lista. */
export function anexarEmCadaItem(lista: string, html: string): string {
  if (/>[^<\s][^<]*</.test(html.replace(/<svg[\s\S]*?<\/svg>/g, ''))) throw new Error('anexarEmCadaItem aceita só HTML sem texto.');
  return lista.replace(/<\/li>/g, `${html}</li>`);
}

/**
 * Controla o uso dos blocos de uma página: cada bloco é pedido uma vez, e ao fim
 * `conferir()` falha se algum bloco do .md ficou sem lugar na página.
 */
export function usarBlocos(blocos: Map<string, Bloco>, pagina: string) {
  const usados = new Set<string>();
  const b = (id: string): Bloco => {
    const bloco = blocos.get(id);
    if (!bloco) throw new Error(`Bloco ausente em ${pagina}: ${id}`);
    if (usados.has(id)) throw new Error(`Bloco usado duas vezes em ${pagina}: ${id}`);
    usados.add(id);
    return bloco;
  };
  const conferir = () => {
    const sobrando = [...blocos.keys()].filter((id) => !usados.has(id));
    if (sobrando.length) throw new Error(`Blocos de ${pagina} sem lugar na página: ${sobrando.join(', ')}`);
  };
  return { b, conferir };
}

/** Texto simples de um elemento (para a meta description): sem tags, entidades decodificadas. */
export function textoSimples(html: string): string {
  const entidades: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' };
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&(#\d+|#x[\da-f]+|\w+);/gi, (m, e: string) => {
      if (e.startsWith('#x')) return String.fromCodePoint(parseInt(e.slice(2), 16));
      if (e.startsWith('#') && e !== '#39') return String.fromCodePoint(Number(e.slice(1)));
      return entidades[e] ?? m;
    })
    .replace(/\s+/g, ' ')
    .trim();
}
