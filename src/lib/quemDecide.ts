/**
 * Marcas do interativo "quem decide o quê" (capítulo 4, B3): cada etapa da lista do texto ganha
 * duas marcas sem texto, a do governo e a dos cidadãos, aria-hidden. Só acrescenta desenhos e
 * atributos; o texto da lista não muda (anexarEmCadaItem recusa HTML com texto).
 */
import { anexarEmCadaItem, comAtributos } from './blocos';

const marca = (classe: string) =>
  `<span class="qd-marca ${classe}" aria-hidden="true"><svg viewBox="0 0 28 28" focusable="false"><circle class="qd-circulo" cx="14" cy="14" r="12"/><path class="qd-visto" d="M8.5 14.5l3.5 3.5 7.5-8"/></svg></span>`;

export function marcasQuemDecide(lista: string): string {
  if (!lista.startsWith('<ol') || (lista.match(/<li[\s>]/g) ?? []).length !== 5) throw new Error('marcasQuemDecide: esperada a lista numerada das cinco etapas.');
  return comAtributos(anexarEmCadaItem(lista, marca('qd-governo') + marca('qd-cidadaos')), { class: 'qd-lista', 'data-quem-decide': '' });
}
