/**
 * Plugin de HTML do processador de Markdown (satteri, o equivalente ao rehype no Astro 7).
 * Envolve palavras ligadas por hífen ("revigorá-la", "Sentir-se") num
 * <span class="sem-quebra">, para a linha não quebrar no hífen. Nenhum caractere muda:
 * o nó de texto só é dividido em partes, na mesma ordem. Blocos de código ficam de fora,
 * porque <pre> e <code> não estão no filtro.
 */
const HIFENIZADA = /[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)+/gu;

/** Divide um texto em pedaços: texto comum e palavras com hífen envolvidas. */
function dividir(valor) {
  const partes = [];
  let ultimo = 0;
  for (const m of valor.matchAll(HIFENIZADA)) {
    if (m.index > ultimo) partes.push({ type: 'text', value: valor.slice(ultimo, m.index) });
    partes.push({
      type: 'element',
      tagName: 'span',
      properties: { className: ['sem-quebra'] },
      children: [{ type: 'text', value: m[0] }],
    });
    ultimo = m.index + m[0].length;
  }
  if (!partes.length) return null;
  if (ultimo < valor.length) partes.push({ type: 'text', value: valor.slice(ultimo) });
  // Garantia: a junção das partes é exatamente o texto original.
  const junto = partes.map((p) => (p.type === 'text' ? p.value : p.children[0].value)).join('');
  if (junto !== valor) throw new Error(`plugin-sem-quebra alteraria o texto: "${valor}"`);
  return partes;
}

export const pluginSemQuebra = {
  name: 'sem-quebra-no-hifen',
  element: {
    filter: ['p', 'li', 'td', 'th', 'h1', 'h2', 'h3', 'strong', 'em', 'a'],
    visit(node, ctx) {
      let mudou = false;
      const filhos = node.children.flatMap((filho) => {
        if (filho.type !== 'text') return [filho];
        const partes = dividir(filho.value);
        if (!partes) return [filho];
        mudou = true;
        return partes;
      });
      if (mudou) ctx.setField(node, 'children', filhos);
    },
  },
};
