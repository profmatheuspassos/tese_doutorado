export interface DadosIdioma {
  pasta: string;
  colecao: 'paginas' | 'paginasEn';
  prefixo: string;
  lang: string;
  ogLocale: string;
  hreflang: string;
  locale: string;
  rotulos: string;
  licencaCc: string;
}
export type CodigoIdioma = 'pt-br' | 'en';
export const IDIOMAS: Record<CodigoIdioma, DadosIdioma>;
export const IDIOMA_PADRAO: CodigoIdioma;
export function idioma(codigo?: CodigoIdioma): DadosIdioma;
export function localeDe(codigo?: CodigoIdioma): string;
export function outroIdioma(codigo?: CodigoIdioma): CodigoIdioma;
export function idiomaDaRota(rota: string, caminhoBase?: string): CodigoIdioma;
