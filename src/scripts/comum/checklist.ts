/**
 * Checklist (home B2, capítulo 1 B4): as marcas de "cumpre" se desenham, regra a regra
 * (Portugal e depois Brasil), quando a lista entra na tela. Chamar só dentro de
 * prefers-reduced-motion: no-preference; sem JS, as marcas já estão desenhadas no HTML.
 */
import { gsap } from 'gsap';
import { aoEntrar } from './observar';

export function animarChecklists(obs: IntersectionObserver[]) {
  document.querySelectorAll<HTMLElement>('[data-checklist]').forEach((ul) => {
    const tl = gsap.timeline({ paused: true });
    ul.querySelectorAll('li').forEach((li, i) => {
      li.querySelectorAll('.marca').forEach((marca, j) => {
        const circulo = marca.querySelector('.marca-circulo');
        const visto = marca.querySelector('.marca-visto');
        if (!circulo || !visto) return;
        gsap.set(circulo, { opacity: 0, scale: 0.6, transformOrigin: '50% 50%' });
        gsap.set(visto, { strokeDasharray: 1, strokeDashoffset: 1 });
        const t = i * 0.16 + j * 0.08;
        tl.to(circulo, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' }, t)
          .to(visto, { strokeDashoffset: 0, duration: 0.35, ease: 'power2.out' }, t + 0.12);
      });
    });
    aoEntrar(ul, () => tl.play(), obs);
  });
}
