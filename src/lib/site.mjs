/**
 * Endereço do site no ar (D72). Usado pelo astro.config.mjs e pelas conferências. SITE_URL e
 * BASE_PATH podem sobrescrevê-lo (por exemplo, para testar uma cópia em outro endereço).
 */
export const SITE_FINAL = 'https://tese.profmatheuspassos.com.br';
export const site = () => (process.env.SITE_URL || SITE_FINAL).replace(/\/$/, '');
export const base = () => (process.env.BASE_PATH || '/').replace(/\/?$/, '/');
/** Endereço absoluto de uma rota do site ("/sobre/" → "https://…/sobre/"). */
export const absoluta = (rota) => `${site()}${base().replace(/\/$/, '')}${rota}`;
