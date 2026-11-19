// Formata números no padrão do idioma da página (padrão: brasileiro, src/lib/idiomas.mjs).
const umaCasaPorLocale = new Map<string, Intl.NumberFormat>();
const umaCasa = (locale: string): Intl.NumberFormat => {
  let f = umaCasaPorLocale.get(locale);
  if (!f) umaCasaPorLocale.set(locale, (f = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })));
  return f;
};

// Uma casa decimal (72,4), ou o número de casas pedido (0,22).
export const formatar = (n: number, casas = 1, locale = 'pt-BR'): string =>
  casas === 1 ? umaCasa(locale).format(n) : n.toLocaleString(locale, { minimumFractionDigits: casas, maximumFractionDigits: casas });
export const formatarPct = (n: number, casas = 1, locale = 'pt-BR'): string => `${formatar(n, casas, locale)}%`;
/** Inteiro com separador de milhar (1.473.063). */
export const formatarInteiro = (n: number, locale = 'pt-BR'): string => n.toLocaleString(locale, { maximumFractionDigits: 0 });
