export interface DadosIdioma {
  pasta: string;
  colecao: 'paginas';
  prefixo: string;
  lang: string;
  ogLocale: string;
  hreflang: string;
  locale: string;
  rotulos: string;
}
export type CodigoIdioma = 'pt-br';
export const IDIOMAS: Record<CodigoIdioma, DadosIdioma>;
export const IDIOMA_PADRAO: CodigoIdioma;
export function idioma(codigo?: CodigoIdioma): DadosIdioma;
export function localeDe(codigo?: CodigoIdioma): string;
export function idiomaDaRota(rota: string, caminhoBase?: string): CodigoIdioma;
