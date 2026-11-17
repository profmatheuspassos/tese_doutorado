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
  // B1 — a imagem perde a cor do segundo parágrafo ("prova que a democracia funciona") ao terceiro ("Não basta").
  const cena = document.querySelector<HTMLElement>('[data-cena-imagem]');
  const passo2 = document.querySelector('[data-bloco="B1"] [data-passo="2"]');
  const passo3 = document.querySelector('[data-bloco="B1"] [data-passo="3"]');
  if (cena && passo2 && passo3) {
    gsap.fromTo(cena, { filter: 'grayscale(0)' }, {
      filter: 'grayscale(1)',
      ease: 'none',
      scrollTrigger: { trigger: passo2, start: 'top 70%', endTrigger: passo3, end: 'top 40%', scrub: true },
    });
  }

  // B2 — as marcas de "cumpre" se desenham, regra a regra (Portugal e depois Brasil).
  document.querySelectorAll<HTMLElement>('[data-checklist]').forEach((ul) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: ul, start: 'top 75%', once: true } });
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
  });
});

// B4 — o círculo: um nó acende por vez; no fim, todos acesos e os arcos giram.
function ativar(circulo: HTMLElement, no: number | 'todos') {
  circulo.dataset.ativo = String(no);
  circulo.querySelectorAll<HTMLElement | SVGElement>('[data-no]').forEach((el) => {
    el.classList.toggle('ativo', no === 'todos' || el.dataset.no === String(no));
  });
}

mm.add('(prefers-reduced-motion: no-preference) and (min-width: 1024px)', () => {
  const secao = document.querySelector<HTMLElement>('[data-bloco="B4"]');
  const circulo = secao?.querySelector<HTMLElement>('[data-circulo]');
  const final = secao?.querySelector('[data-passo-final]');
  if (!secao || !circulo || !final) return;
  ativar(circulo, 0);
  secao.querySelectorAll<HTMLElement>('[data-passo-no]').forEach((p) => {
    const no = Number(p.dataset.passoNo);
    ScrollTrigger.create({
      trigger: p, start: 'top 60%', end: 'bottom 60%',
      onEnter: () => ativar(circulo, no), onEnterBack: () => ativar(circulo, no),
    });
  });
  ScrollTrigger.create({ trigger: final, start: 'top 60%', onEnter: () => ativar(circulo, 'todos'), onLeaveBack: () => ativar(circulo, 2) });
  // Três pontos circulam pelo anel, no sentido das setas, acompanhando a rolagem.
  const fluxo = circulo.querySelector('[data-fluxo]');
  if (fluxo) {
    gsap.set(fluxo.querySelectorAll('circle'), { opacity: 1 });
    gsap.fromTo(fluxo, { rotation: 0 }, {
      rotation: 360, svgOrigin: '200 200', ease: 'none',
      scrollTrigger: { trigger: secao, start: 'top 60%', end: 'bottom 40%', scrub: true },
    });
  }
  return () => ativar(circulo, 'todos');
});

mm.add('(prefers-reduced-motion: no-preference) and (max-width: 1023.98px)', () => {
  const circulo = document.querySelector<HTMLElement>('[data-bloco="B4"] [data-circulo]');
  if (!circulo) return;
  ativar(circulo, 0);
  const tl = gsap.timeline({ scrollTrigger: { trigger: circulo, start: 'top 70%', once: true } });
  [0, 1, 2].forEach((no, k) => tl.call(() => ativar(circulo, no), [], k * 0.8));
  tl.call(() => ativar(circulo, 'todos'), [], 2.4);
  return () => ativar(circulo, 'todos');
});
