/**
 * Observadores de entrada na tela, comuns à home e às páginas internas. Usam
 * IntersectionObserver, que informa o estado visível mesmo depois de um salto de rolagem.
 */
export const MARGEM = '0px 0px -8% 0px';

/** Chama fn uma vez, quando o elemento entra na tela (inclusive depois de um salto). */
export function aoEntrar(alvo: Element | null, fn: () => void, observadores: IntersectionObserver[]) {
  if (!alvo) return;
  const io = new IntersectionObserver((entradas) => {
    if (entradas.some((e) => e.isIntersecting)) { io.disconnect(); fn(); }
  }, { rootMargin: MARGEM });
  io.observe(alvo);
  observadores.push(io);
}

/** Revela elementos em lotes, à medida que entram na tela. */
export function revelarEmLote(alvos: Element[], animar: (lote: Element[]) => void, observadores: IntersectionObserver[]) {
  if (!alvos.length) return;
  const io = new IntersectionObserver((entradas) => {
    const lote = entradas.filter((e) => e.isIntersecting).map((e) => e.target);
    lote.forEach((t) => io.unobserve(t));
    if (lote.length) animar(lote);
  }, { rootMargin: MARGEM });
  alvos.forEach((a) => io.observe(a));
  observadores.push(io);
}

export const desligar = (observadores: IntersectionObserver[]) => () => observadores.forEach((io) => io.disconnect());
