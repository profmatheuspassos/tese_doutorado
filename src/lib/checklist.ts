/**
 * Marcas de "cumpre" do checklist: Portugal (ramo) e Brasil (semente), desenhos sem texto
 * (aria-hidden). Usado na home (B2) e no capítulo 1 (B4); estilos em src/styles/checklist.css.
 */
import { anexarEmCadaItem, comAtributos } from './blocos';

const marca = (pais: 'pt' | 'br') =>
  `<svg class="marca marca-${pais}" viewBox="0 0 24 24" fill="none"><circle class="marca-circulo" cx="12" cy="12" r="10.5"/><path class="marca-visto" pathLength="1" d="M7.5 12.4l3.1 3.1 6-6.4"/></svg>`;
const marcas = `<span class="marcas" aria-hidden="true">${marca('pt')}${marca('br')}</span>`;

/** Acrescenta as duas marcas a cada item da lista e as classes do checklist. Não muda o texto. */
export function comMarcas(lista: string): string {
  if (!/^<(ul|ol)[\s>]/.test(lista)) throw new Error('comMarcas: o elemento precisa ser uma lista.');
  return comAtributos(anexarEmCadaItem(lista, marcas), { class: 'checklist', 'data-checklist': '' });
}
