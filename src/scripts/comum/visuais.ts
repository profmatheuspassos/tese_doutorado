/**
 * Revela os visuais das páginas internas ([data-anima]) quando entram na tela. O CSS só os
 * esconde com JS ativo e sem pedido de movimento reduzido; se este script não rodar, a classe
 * "anim-falhou" (Base.astro) libera tudo em 3 s.
 */
import { MARGEM } from './observar';

document.documentElement.classList.add('anim-pronto');
const alvos = document.querySelectorAll('[data-anima]');
const io = new IntersectionObserver((entradas) => {
  entradas.filter((e) => e.isIntersecting).forEach((e) => { e.target.classList.add('visivel'); io.unobserve(e.target); });
}, { rootMargin: MARGEM });
alvos.forEach((a) => io.observe(a));
