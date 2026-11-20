/**
 * Marcadores de dados nos rótulos de interface: {d:caminho.no.dados.json}.
 * Usado pelo site (src/i18n) e pelas conferências (scripts/conferir-*.mjs), para que o texto
 * publicado e o texto conferido sejam montados exatamente da mesma forma.
 *
 * Formato dos números: anos (chave "ano", "anos", "de", "ate" ou "desde") ficam como estão
 * (2018); inteiros levam ponto de milhar (1.473.063); decimais saem com as casas que têm no
 * JSON, com vírgula (0,22; 92,9). O locale do Intl é um parâmetro (padrão pt-BR, src/lib/idiomas.mjs).
 *
 * Modificador {d:caminho|mil}: escreve o valor vezes mil, com separador ("60,000" em inglês). O
 * dados.json guarda 60 porque o português diz "60 mil"; o inglês precisa do número inteiro.
 */
const CHAVES_DE_ANO = /^(ano|anos|de|ate|desde)$/;

export function formatarValor(valor, chave = '', locale = 'pt-BR') {
  if (typeof valor !== 'number') return String(valor);
  if (CHAVES_DE_ANO.test(chave)) return String(valor);
  const casas = (String(valor).split('.')[1] ?? '').length;
  return valor.toLocaleString(locale, { minimumFractionDigits: casas, maximumFractionDigits: casas });
}

/** Lê um caminho ("a.b.0.c") no objeto de dados. */
export function lerCaminho(dados, caminho) {
  let v = dados;
  for (const parte of caminho.split('.')) v = v?.[parte];
  if (v === undefined || v === null || typeof v === 'object') throw new Error(`Marcador de dado inválido: {d:${caminho}}`);
  return v;
}

/** Troca cada {d:caminho} (ou {d:caminho|mil}) pelo valor formatado. A chave usada no formato é a
 * do último trecho não numérico do caminho (em "anos.0", a chave é "anos"). */
export function expandirDados(texto, dados, locale = 'pt-BR') {
  return texto.replace(/\{d:([\w.]+)(\|mil)?\}/g, (_, caminho, mil) => {
    const partes = caminho.split('.').filter((p) => !/^\d+$/.test(p));
    const valor = lerCaminho(dados, caminho);
    if (mil) {
      if (typeof valor !== 'number' || !Number.isInteger(valor)) throw new Error(`{d:${caminho}|mil} pede um inteiro no dados.json`);
      return (valor * 1000).toLocaleString(locale, { maximumFractionDigits: 0 });
    }
    return formatarValor(valor, partes[partes.length - 1], locale);
  });
}
