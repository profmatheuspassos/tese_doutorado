import ptBR from './pt-br.json';

// Preparado para um segundo idioma no futuro (en.json); hoje só há pt-BR.
const dicionarios = { 'pt-br': ptBR } as const;
export type Idioma = keyof typeof dicionarios;

/** Busca um rótulo por caminho ("grafico.partidos") e preenche {chaves}. */
export function t(caminho: string, vars: Record<string, string | number> = {}, idioma: Idioma = 'pt-br'): string {
  let valor: unknown = dicionarios[idioma];
  for (const parte of caminho.split('.')) {
    valor = (valor as Record<string, unknown> | undefined)?.[parte];
  }
  if (typeof valor !== 'string') throw new Error(`Rótulo inexistente: ${caminho}`);
  return valor.replace(/\{(\w+)\}/g, (_, k: string) => {
    if (!(k in vars)) throw new Error(`Falta a variável {${k}} em ${caminho}`);
    return String(vars[k]);
  });
}

export function lista(caminho: string, idioma: Idioma = 'pt-br'): string[] {
  let valor: unknown = dicionarios[idioma];
  for (const parte of caminho.split('.')) valor = (valor as Record<string, unknown>)?.[parte];
  if (!Array.isArray(valor)) throw new Error(`Lista inexistente: ${caminho}`);
  return valor as string[];
}
