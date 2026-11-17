/**
 * Círculo virtuoso com transição (home B6, capítulo 4 B11; D50): ao entrar na tela, os rótulos
 * do círculo vicioso dão lugar aos do virtuoso. Chamar só dentro de
 * prefers-reduced-motion: no-preference; sem JS, o HTML já mostra só os rótulos finais.
 */
import { gsap } from 'gsap';
import { aoEntrar } from './observar';

export function transicaoCirculos(obs: IntersectionObserver[]) {
  document.querySelectorAll<HTMLElement>('.circulo-virtuoso').forEach((c) => {
    const antes = c.querySelectorAll('.circulo-rotulo-antes');
    const depois = c.querySelectorAll('.circulo-rotulo-depois');
    if (!antes.length) return;
    gsap.set(antes, { opacity: 1 });
    gsap.set(depois, { opacity: 0 });
    const tl = gsap.timeline({ paused: true })
      .to(antes, { opacity: 0, duration: 0.5, stagger: 0.15 }, 0.4)
      .to(depois, { opacity: 1, duration: 0.6, stagger: 0.15 }, 0.75);
    aoEntrar(c, () => tl.play(), obs);
  });
}
