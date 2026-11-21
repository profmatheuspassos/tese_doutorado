/**
 * Endereço do site no ar (D72). Usado pelo astro.config.mjs e pelas conferências. SITE_URL e
 * BASE_PATH podem sobrescrevê-lo (por exemplo, para testar uma cópia em outro endereço).
 */
export const SITE_FINAL = 'https://tese.profmatheuspassos.com.br';
export const site = () => (process.env.SITE_URL || SITE_FINAL).replace(/\/$/, '');
export const base = () => (process.env.BASE_PATH || '/').replace(/\/?$/, '/');
/** Endereço absoluto de uma rota do site ("/sobre/" → "https://…/sobre/"). */
export const absoluta = (rota) => `${site()}${base().replace(/\/$/, '')}${rota}`;

/**
 * Chave de lançamento da versão em inglês (D92). Enquanto for false, o build de produção não tem
 * nenhuma rota /en/, nenhum seletor de idioma e nenhum hreflang. A variável INGLES=1 liga o inglês
 * só para pré-visualizar (build local e o build extra dos pull requests); não publica nada, e o
 * conferir-publicacao recusa INGLES=1 fora de pull request no GitHub Actions.
 */
export const INGLES_PUBLICADO = true;
export const inglesAtivo = () => INGLES_PUBLICADO || process.env.INGLES === '1';
