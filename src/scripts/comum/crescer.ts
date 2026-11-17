/**
 * Ramo que engrossa e semente que brota (home B6, capítulo 4 B9; D1): quando o gatilho entra na
 * tela, o caule do ramo de Portugal engrossa, surgem duas folhas novas e o broto do Brasil sobe.
 * Procura os desenhos dentro de `escopo`. Chamar só dentro de prefers-reduced-motion:
 * no-preference; sem JS, o HTML já mostra o estado final (ramo grosso, broto aberto).
 */
import { gsap } from 'gsap';
import { aoEntrar } from './observar';

export function crescer(escopo: ParentNode, gatilho: Element | null, obs: IntersectionObserver[]) {
  const caule = escopo.querySelector<SVGPathElement>('.ramo-cresce .ramo-caule');
  const folhasNovas = escopo.querySelectorAll('.ramo-cresce .folha-nova');
  const broto = escopo.querySelector('[data-solo] [data-broto]');
  if (!gatilho || !caule || !broto) return;
  gsap.set(caule, { attr: { 'stroke-width': 1.75 } });
  gsap.set(folhasNovas, { opacity: 0 });
  gsap.set(broto.querySelector('.broto-caule'), { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.set(broto.querySelectorAll('.broto-folha'), { opacity: 0 });
  const tl = gsap.timeline({ paused: true })
    .to(caule, { attr: { 'stroke-width': 3.5 }, duration: 1.2, ease: 'power2.inOut' }, 0)
    .to(folhasNovas, { opacity: 1, duration: 0.6, stagger: 0.2 }, 0.6)
    .to(broto.querySelector('.broto-caule'), { strokeDashoffset: 0, duration: 1, ease: 'power2.out' }, 0.2)
    .to(broto.querySelectorAll('.broto-folha'), { opacity: 1, duration: 0.5, stagger: 0.2 }, 0.9);
  aoEntrar(gatilho, () => tl.play(), obs);
}
