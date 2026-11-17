/**
 * Cálculo da grade da bolha (capítulo 3, B6), usado no build (estado inicial e tira estática)
 * e no navegador. A forma preferida ocupa 3, 6, 9, 11 e depois 12 dos 12 cartões, conforme o
 * número de curtidas; o resto se divide entre as outras formas, na ordem fixa.
 */
export const FORMAS = ['circulo', 'quadrado', 'triangulo', 'losango'] as const;
export type Forma = (typeof FORMAS)[number];

const OCUPACAO = [3, 6, 9, 11, 12];
// Ordem das posições na grade (4 x 3): espalha cada forma, sem repetir lado a lado no início.
const POSICOES = [0, 5, 10, 3, 6, 9, 1, 4, 11, 2, 7, 8];

export function grade(preferida: Forma, curtidas: number): Forma[] {
  const n = OCUPACAO[Math.min(curtidas, OCUPACAO.length - 1)];
  const outras = FORMAS.filter((f) => f !== preferida);
  const resto = 12 - n;
  const contagem = outras.map((_, i) => Math.floor(resto / outras.length) + (i < resto % outras.length ? 1 : 0));
  // As outras formas entram nas primeiras posições da ordem fixa, uma de cada por vez.
  const sequencia: Forma[] = [];
  const faltam = [...contagem];
  while (faltam.some((c) => c > 0)) outras.forEach((f, i) => { if (faltam[i]-- > 0) sequencia.push(f); });
  while (sequencia.length < 12) sequencia.push(preferida);
  const saida = new Array<Forma>(12);
  POSICOES.forEach((pos, k) => { saida[pos] = sequencia[k]; });
  // Estado inicial: as outras formas e a preferida se alternam pela ordem fixa.
  if (curtidas === 0) {
    const inicial = POSICOES.map((_, k) => FORMAS[k % 4]);
    POSICOES.forEach((pos, k) => { saida[pos] = inicial[k]; });
  }
  return saida;
}
