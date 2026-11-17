/**
 * Animações da home (GSAP + ScrollTrigger, empacotados no build).
 * Tudo roda só com prefers-reduced-motion: no-preference. Sem JS ou com movimento
 * reduzido, o conteúdo já está no estado final no HTML.
 *
 * Carga em duas partes, para não travar a primeira tela no celular: aqui fica só a abertura
 * (B0), que é o que aparece ao abrir a página. O resto (ScrollTrigger e as animações dos blocos
 * B1 a B8, em home-resto.ts) carrega quando o navegador fica ocioso, e cada bloco é montado numa
 * tarefa curta. A classe "anim-pronto" só entra quando tudo foi montado; se isso não acontecer
 * em 3 s, o Base.astro libera todo o conteúdo ("anim-falhou"), como antes.
 */
import { gsap } from 'gsap';

const sobe = { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' };

gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
  // B0 — abertura: o ramo se desenha, o texto sobe.
  const abertura = document.querySelector<HTMLElement>('[data-bloco="B0"]');
  if (abertura) {
    const tracos = abertura.querySelectorAll<SVGPathElement>('[data-ramo] .traco');
    gsap.set(tracos, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(abertura.querySelectorAll('[data-ramo] .folha'), { opacity: 0 });
    gsap.set(abertura.querySelectorAll('[data-revelar]'), { opacity: 0, y: 16 });

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.from(abertura.querySelector('[data-titulo]'), { y: 28, duration: 0.9, ease: 'power3.out' }, 0)
      .to(tracos, { strokeDashoffset: 0, duration: 1.6, stagger: 0.18, ease: 'power1.inOut' }, 0.1)
      .to(abertura.querySelectorAll('[data-ramo] .folha'), { opacity: 1, duration: 0.6, stagger: 0.1 }, 1.0)
      .to(abertura.querySelectorAll('[data-revelar]'), { ...sobe, stagger: 0.15 }, 0.25)
      .from(abertura.querySelectorAll('.abertura-sementes .semente'), {
        opacity: 0, y: -6, duration: 0.5, stagger: 0.12, ease: 'back.out(2)',
      }, 1.2);
  }

});

const quandoOcioso = (fn: () => void) =>
  ('requestIdleCallback' in window ? window.requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 1));
quandoOcioso(() => { import('./home-resto').then((m) => m.iniciar()); });
