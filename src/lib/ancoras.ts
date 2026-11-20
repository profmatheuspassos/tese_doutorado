/**
 * Trechos do texto aprovado que os componentes procuram para pôr um destaque ou um visual no
 * lugar certo. Ficam aqui, por idioma e por página, e não soltos nos componentes, para que cada
 * idioma tenha os seus. Se o trecho não estiver no texto, o componente para o build.
 *
 * Os valores em inglês entram com a página traduzida (Etapa 3); até lá, a entrada do inglês fica
 * vazia e pedir uma âncora em inglês faz o build falhar. O "[data de acesso]" do botão Copiar não está aqui: o ABNT é igual
 * nos dois idiomas (D99).
 */
import { IDIOMA_PADRAO, type CodigoIdioma } from './idiomas.mjs';

const PT = {
  home: {
    naoBasta: 'Não basta.',
    naoResolve: 'Não resolve.',
    precisoAlgoMais: 'É preciso algo mais.',
    noPapel: 'No papel, são democracias.',
    faltaRecall: 'Falta uma ferramenta nos dois países: o recall.',
  },
  'capitulo-2': { estarPresente: '<strong>estar presente</strong>' },
  'capitulo-3': { impossivel: 'impossível' },
  'capitulo-4': { cincoEtapas: 'cinco etapas', daPopulacao: '% da população', girarAoContrario: 'girar ao contrário' },
  'capitulo-5': { soCongresso: 'Só o Congresso Nacional convoca' },
  sobre: {
    tituloAbnt: 'Cidadania Ativa e Governança sob a perspectiva do Direito Eleitoral comparado',
    tituloApa: 'Cidadania ativa e governança sob a perspectiva do direito eleitoral comparado',
  },
} as const;

type Ancoras = typeof PT;
type Parciais = { [P in keyof Ancoras]?: { [C in keyof Ancoras[P]]?: string } };

const ANCORAS: Record<CodigoIdioma, Parciais> = {
  'pt-br': PT,
  en: {},
};

/** Trecho procurado numa página, no idioma pedido (padrão: português). */
export function ancora<P extends keyof Ancoras>(pagina: P, chave: keyof Ancoras[P], idioma: CodigoIdioma = IDIOMA_PADRAO): string {
  const valor = (ANCORAS[idioma]?.[pagina] as Record<string, string> | undefined)?.[chave as string];
  if (!valor) throw new Error(`Âncora de texto inexistente: ${idioma} ${String(pagina)} ${String(chave)}`);
  return valor;
}
