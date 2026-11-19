/**
 * Idiomas do site (D91, D92). Tabela única, usada pelo site (src/) e pelas conferências
 * (scripts/), para que o texto publicado e o texto conferido usem as mesmas regras.
 *
 * Etapa 2a da versão em inglês: só o português está registrado. A entrada do inglês entra na
 * Etapa 2b, com os rótulos aprovados (docs/PLANO-INGLES.md).
 *
 * Campos de cada idioma:
 *  - pasta: textos aprovados (Markdown);
 *  - colecao: coleção do Astro com esses textos (src/content.config.ts);
 *  - prefixo: começo das rotas do idioma ("/" para o português);
 *  - lang: atributo lang do <html>; ogLocale: og:locale; hreflang: valor do hreflang;
 *  - locale: locale do Intl para números;
 *  - rotulos: arquivo dos rótulos de interface.
 */
export const IDIOMAS = {
  'pt-br': {
    pasta: 'src/content/pt-br',
    colecao: 'paginas',
    prefixo: '/',
    lang: 'pt-BR',
    ogLocale: 'pt_BR',
    hreflang: 'pt-BR',
    locale: 'pt-BR',
    rotulos: 'src/i18n/pt-br.json',
  },
};

export const IDIOMA_PADRAO = 'pt-br';

/** Dados de um idioma registrado; idioma desconhecido é erro. */
export function idioma(codigo = IDIOMA_PADRAO) {
  const i = IDIOMAS[codigo];
  if (!i) throw new Error(`Idioma não registrado: ${codigo}`);
  return i;
}

/** Locale do Intl de um idioma ("pt-br" → "pt-BR"). */
export const localeDe = (codigo = IDIOMA_PADRAO) => idioma(codigo).locale;

/**
 * Idioma de uma rota do site. Tira o caminho-base da publicação (BASE_PATH) e escolhe o idioma
 * de prefixo mais longo que casa com o começo da rota. Com só o português, é sempre "pt-br".
 */
export function idiomaDaRota(rota, caminhoBase = '/') {
  const baseSemBarra = caminhoBase.replace(/\/$/, '');
  const resto = baseSemBarra && rota.startsWith(baseSemBarra) ? rota.slice(baseSemBarra.length) || '/' : rota;
  const casam = Object.entries(IDIOMAS).filter(([, i]) => resto.startsWith(i.prefixo));
  if (!casam.length) return IDIOMA_PADRAO;
  return casam.sort((a, b) => b[1].prefixo.length - a[1].prefixo.length)[0][0];
}
