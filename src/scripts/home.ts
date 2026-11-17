/**
 * Animações da home (GSAP + ScrollTrigger, empacotados no build).
 * Tudo roda só com prefers-reduced-motion: no-preference. Sem JS ou com movimento
 * reduzido, o conteúdo já está no estado final no HTML.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
document.documentElement.classList.add('anim-pronto');

const formato = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const sobe = { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' };

const mm = gsap.matchMedia();

mm.add('(prefers-reduced-motion: no-preference)', () => {
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

  // Revelação genérica dos textos ao rolar (fora da abertura).
  const revelar = gsap.utils.toArray<HTMLElement>('[data-bloco]:not([data-bloco="B0"]) [data-revelar]');
  gsap.set(revelar, { opacity: 0, y: 20 });
  ScrollTrigger.batch(revelar, {
    start: 'top 88%',
    once: true,
    onEnter: (lote) => gsap.to(lote, { ...sobe, stagger: 0.1 }),
  });

  // B3 — o número sobe de 0 até o valor.
  document.querySelectorAll<HTMLElement>('[data-contador]').forEach((el) => {
    const alvo = Number(el.dataset.contador);
    const estado = { v: 0 };
    el.textContent = formato.format(0);
    gsap.to(estado, {
      v: alvo,
      duration: 1.4,
      ease: 'power2.out',
      onUpdate: () => { el.textContent = formato.format(estado.v); },
      onComplete: () => { el.textContent = formato.format(alvo); },
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });

  // B3 — halteres: a barra se estende do ano inicial ao final.
  document.querySelectorAll<HTMLElement>('[data-halteres]').forEach((fig) => {
    const linhas = fig.querySelectorAll<HTMLElement>('[data-linha]');
    const tl = gsap.timeline({ scrollTrigger: { trigger: fig, start: 'top 80%', once: true } });
    linhas.forEach((linha, i) => {
      const barra = linha.querySelector('[data-barra]');
      const ponto = linha.querySelector<HTMLElement>('[data-ponto-b]');
      const valor = linha.querySelector('[data-valor-b]');
      if (!barra || !ponto || !valor) return;
      gsap.set(barra, { scaleX: 0 });
      gsap.set(ponto, { left: `${ponto.dataset.de}%`, opacity: 0 });
      gsap.set(valor, { opacity: 0 });
      const t = i * 0.2;
      tl.to(ponto, { opacity: 1, duration: 0.2 }, t)
        .to(barra, { scaleX: 1, duration: 1, ease: 'power2.inOut' }, t)
        .to(ponto, { left: `${ponto.dataset.para}%`, duration: 1, ease: 'power2.inOut' }, t)
        .to(valor, { opacity: 1, duration: 0.4 }, t + 0.8);
    });
  });
});
