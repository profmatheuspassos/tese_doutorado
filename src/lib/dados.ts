import dados from '../data/dados.json';

type Uso = (typeof dados.usos)[number];

/** Uso registrado em dados.json para uma página, um bloco e um tipo de gráfico. */
export function uso(pagina: string, bloco: string, grafico: string): Uso {
  const u = dados.usos.find((x) => x.pagina === pagina && x.bloco === bloco && x.grafico === grafico);
  if (!u) throw new Error(`Uso de dado não registrado: ${pagina} ${bloco} ${grafico}`);
  return u;
}

/** Valor de uma resposta de um Quadro (1 a 5) num ano. */
export function valorQuadro(instituicao: string, resposta: string, ano: number): number {
  const serie = dados.confianca_instituicoes_br;
  const inst = (serie.instituicoes as Record<string, { valores: Record<string, number[]> }>)[instituicao];
  const i = serie.anos.indexOf(ano);
  const v = inst?.valores[resposta]?.[i];
  if (v === undefined || i < 0) throw new Error(`Dado inexistente: ${instituicao} ${resposta} ${ano}`);
  return v;
}

export { dados };
