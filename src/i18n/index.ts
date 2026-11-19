import ptBR from './pt-br.json';
import dados from '../data/dados.json';
import { expandirDados } from '../lib/rotulos.mjs';
import { localeDe } from '../lib/idiomas.mjs';

// Um dicionário por idioma de src/lib/idiomas.mjs. Hoje só há pt-BR; o en.json entra na Etapa 2b
// da versão em inglês. Os números dos marcadores {d:...} saem no locale do idioma.
const dicionarios = { 'pt-br': ptBR } as const;
export type Idioma = keyof typeof dicionarios;

function buscar(caminho: string, idioma: Idioma): unknown {
  let valor: unknown = dicionarios[idioma];
  for (const parte of caminho.split('.')) valor = (valor as Record<string, unknown> | undefined)?.[parte];
  return valor;
}

/**
 * Busca um rótulo por caminho ("grafico.partidos"), troca os marcadores de dados {d:...}
 * pelos valores do dados.json e preenche as demais {chaves}.
 */
export function t(caminho: string, vars: Record<string, string | number> = {}, idioma: Idioma = 'pt-br'): string {
  const valor = buscar(caminho, idioma);
  if (typeof valor !== 'string') throw new Error(`Rótulo inexistente: ${caminho}`);
  return expandirDados(valor, dados, localeDe(idioma)).replace(/\{(\w+)\}/g, (_: string, k: string) => {
    if (!(k in vars)) throw new Error(`Falta a variável {${k}} em ${caminho}`);
    return String(vars[k]);
  });
}

export function lista(caminho: string, idioma: Idioma = 'pt-br'): string[] {
  const valor = buscar(caminho, idioma);
  if (!Array.isArray(valor)) throw new Error(`Lista inexistente: ${caminho}`);
  return (valor as string[]).map((v) => expandirDados(v, dados, localeDe(idioma)));
}

/** Objeto de rótulos (chave → texto), já com os marcadores de dados trocados. */
export function mapa(caminho: string, idioma: Idioma = 'pt-br'): Record<string, string> {
  const valor = buscar(caminho, idioma);
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) throw new Error(`Mapa inexistente: ${caminho}`);
  return Object.fromEntries(Object.entries(valor as Record<string, string>).map(([k, v]) => [k, expandirDados(v, dados, localeDe(idioma))]));
}
