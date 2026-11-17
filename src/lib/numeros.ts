// Formata números no padrão brasileiro.
const umaCasa = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// Uma casa decimal (72,4), ou o número de casas pedido (0,22).
export const formatar = (n: number, casas = 1): string =>
  casas === 1 ? umaCasa.format(n) : n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
export const formatarPct = (n: number, casas = 1): string => `${formatar(n, casas)}%`;
/** Inteiro com ponto de milhar (1.473.063). */
export const formatarInteiro = (n: number): string => n.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
