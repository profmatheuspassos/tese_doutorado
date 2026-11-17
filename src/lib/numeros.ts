// Formata números no padrão brasileiro, com uma casa decimal (72,4).
const umaCasa = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const formatar = (n: number): string => umaCasa.format(n);
export const formatarPct = (n: number): string => `${umaCasa.format(n)}%`;
