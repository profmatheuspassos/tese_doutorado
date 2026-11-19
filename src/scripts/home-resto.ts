/**
 * Animações da home abaixo da primeira tela (B1 a B8), carregadas por home.ts quando o
 * navegador fica ocioso. O comportamento é o mesmo de antes da divisão: só muda quando o código
 * é montado. Cada bloco é montado numa tarefa própria (cedendo a vez entre um e outro), para
 * nenhuma tarefa longa travar a página no celular.
 *
 * Tudo o que começa escondido é revelado por IntersectionObserver (aoEntrar, revelarEmLote),
 * que informa o estado visível mesmo depois de um salto de rolagem (tecla End, link de âncora).
 * O ScrollTrigger fica só para efeitos presos à rolagem, que não escondem conteúdo.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { aoEntrar, desligar, revelarEmLote } from './comum/observar';
import { animarChecklists } from './comum/checklist';
import { transicaoCirculos } from './comum/circulo';
import { crescer } from './comum/crescer';

gsap.registerPlugin(ScrollTrigger);

// O contador usa o locale do idioma da página (atributo lang do <html>).
const formato = new Intl.NumberFormat(document.documentElement.lang || 'pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const sobe = { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' };
const mm = gsap.matchMedia();
const cederVez = () => new Promise<void>((ok) => setTimeout(ok, 0));

// Um passo por bloco, na ordem da página.
const passos: (() => void)[] = [
  () => mm.add('(prefers-reduced-motion: no-preference)', (ctx) => {
    const obs: IntersectionObserver[] = [];
    // Revelação genérica dos textos ao rolar (fora da abertura).
    const revelar = gsap.utils.toArray<HTMLElement>('[data-bloco]:not([data-bloco="B0"]) [data-revelar]');
    gsap.set(revelar, { opacity: 0, y: 20 });
    revelarEmLote(revelar, (lote) => { ctx.add(() => gsap.to(lote, { ...sobe, stagger: 0.1 })); }, obs);
    return desligar(obs);
  }),
  () => mm.add('(prefers-reduced-motion: no-preference)', (ctx) => {
    const obs: IntersectionObserver[] = [];
    // B3 — o número sobe de 0 até o valor.
    document.querySelectorAll<HTMLElement>('[data-contador]').forEach((el) => {
      const alvo = Number(el.dataset.contador);
      const estado = { v: 0 };
      el.textContent = formato.format(0);
      aoEntrar(el, () => { ctx.add(() => gsap.to(estado, {
        v: alvo,
        duration: 1.4,
        ease: 'power2.out',
        onUpdate: () => { el.textContent = formato.format(estado.v); },
        onComplete: () => { el.textContent = formato.format(alvo); },
      })); }, obs);
    });
    return desligar(obs);
  }),
  () => mm.add('(prefers-reduced-motion: no-preference)', (ctx) => {
    const obs: IntersectionObserver[] = [];
    // B3 — halteres: a barra se estende do ano inicial ao final.
    document.querySelectorAll<HTMLElement>('[data-halteres]').forEach((fig) => {
      const tl = gsap.timeline({ paused: true });
      fig.querySelectorAll<HTMLElement>('[data-linha]').forEach((linha, i) => {
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
      aoEntrar(fig, () => tl.play(), obs);
    });
    return desligar(obs);
  }),
  () => mm.add('(prefers-reduced-motion: no-preference)', (ctx) => {
    const obs: IntersectionObserver[] = [];
    // B1 — a imagem perde a cor do segundo parágrafo ("prova que a democracia funciona") ao
    // terceiro ("Não basta"). Efeito preso à rolagem; não esconde conteúdo.
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
    return desligar(obs);
  }),
  () => mm.add('(prefers-reduced-motion: no-preference)', (ctx) => {
    const obs: IntersectionObserver[] = [];
    // B2 — as marcas de "cumpre" se desenham, regra a regra (Portugal e depois Brasil).
    animarChecklists(obs);
    return desligar(obs);
  }),
  () => mm.add('(prefers-reduced-motion: no-preference)', (ctx) => {
    const obs: IntersectionObserver[] = [];
    // B5 — na bolha, os pontos coloridos se reduzem a uma cor só.
    const pontos = gsap.utils.toArray<SVGCircleElement>('.bolha-ponto');
    if (pontos.length) {
      pontos.forEach((p) => gsap.set(p, { attr: { fill: p.dataset.cor ?? '' } }));
      aoEntrar(pontos[0].closest('svg'), () => { ctx.add(() => gsap.to(pontos, {
        attr: { fill: 'var(--color-gelo-2)' }, duration: 0.6, stagger: 0.25, delay: 0.5,
      })); }, obs);
    }
    return desligar(obs);
  }),
  () => mm.add('(prefers-reduced-motion: no-preference)', (ctx) => {
    const obs: IntersectionObserver[] = [];
    // B6 — no círculo virtuoso, os rótulos do vicioso dão lugar aos novos.
    transicaoCirculos(obs);
    return desligar(obs);
  }),
  () => mm.add('(prefers-reduced-motion: no-preference)', (ctx) => {
    const obs: IntersectionObserver[] = [];
    // B6 — quando o texto chega à proposta, o ramo engrossa e a semente brota.
    crescer(document, document.querySelector('[data-crescer]'), obs);
    return desligar(obs);
  }),
  () => mm.add('(prefers-reduced-motion: no-preference)', (ctx) => {
    const obs: IntersectionObserver[] = [];
    // B7 — os cartões das ferramentas entram em sequência.
    document.querySelectorAll('[data-cartoes]').forEach((ul) => {
      const itens = [...ul.querySelectorAll('li')];
      gsap.set(itens, { opacity: 0, y: 20 });
      revelarEmLote(itens, (lote) => { ctx.add(() => gsap.to(lote, { ...sobe, stagger: 0.12 })); }, obs);
    });
    return desligar(obs);
  }),
  () => mm.add('(prefers-reduced-motion: no-preference)', (ctx) => {
    const obs: IntersectionObserver[] = [];
    // B8 — o broto do fecho se desenha.
    const brotoFinal = document.querySelector('[data-broto-final]');
    if (brotoFinal) {
      gsap.set(brotoFinal.querySelector('.broto-caule'), { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(brotoFinal.querySelectorAll('.broto-folha'), { opacity: 0 });
      const tl = gsap.timeline({ paused: true })
        .to(brotoFinal.querySelector('.broto-caule'), { strokeDashoffset: 0, duration: 1, ease: 'power2.out' })
        .to(brotoFinal.querySelectorAll('.broto-folha'), { opacity: 1, duration: 0.5, stagger: 0.2 }, 0.7);
      aoEntrar(brotoFinal, () => tl.play(), obs);
    }
    return desligar(obs);
  }),
  () => montarCirculos(),
  () => montarTabela(),
];

export async function iniciar() {
  for (const passo of passos) {
    passo();
    await cederVez();
  }
  document.documentElement.classList.add('anim-pronto');
  // As posições do ScrollTrigger dependem da fonte; recalcula quando ela termina de carregar.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

// B4 e B6 — o círculo: um nó acende por vez, conforme o texto; no fim, todos acesos.
// Nenhum nó some: os apagados continuam legíveis.
function ativar(circulo: HTMLElement, no: number | 'todos') {
  circulo.dataset.ativo = String(no);
  circulo.querySelectorAll<HTMLElement | SVGElement>('[data-no]').forEach((el) => {
    el.classList.toggle('ativo', no === 'todos' || el.dataset.no === String(no));
  });
}
const secoesComCirculo = () =>
  [...document.querySelectorAll<HTMLElement>('[data-bloco]')].filter((s) => s.querySelector('[data-circulo]') && s.querySelector('[data-passo-no]'));

function montarCirculos() {
  mm.add('(prefers-reduced-motion: no-preference) and (min-width: 1024px)', () => {
    const circulos: HTMLElement[] = [];
    secoesComCirculo().forEach((secao) => {
      const circulo = secao.querySelector<HTMLElement>('[data-circulo]')!;
      const final = secao.querySelector('[data-passo-final]');
      const passos = [...secao.querySelectorAll<HTMLElement>('[data-passo-no]')];
      circulos.push(circulo);
      ativar(circulo, Number(passos[0].dataset.passoNo));
      passos.forEach((p) => {
        const no = Number(p.dataset.passoNo);
        ScrollTrigger.create({
          trigger: p, start: 'top 60%', end: 'bottom 60%',
          onEnter: () => ativar(circulo, no), onEnterBack: () => ativar(circulo, no),
        });
      });
      if (final) {
        const ultimo = Number(passos[passos.length - 1].dataset.passoNo);
        ScrollTrigger.create({ trigger: final, start: 'top 60%', onEnter: () => ativar(circulo, 'todos'), onLeaveBack: () => ativar(circulo, ultimo) });
      }
      // Três pontos circulam pelo anel, no sentido das setas, acompanhando a rolagem.
      const fluxo = circulo.querySelector('[data-fluxo]');
      if (fluxo) {
        gsap.set(fluxo.querySelectorAll('circle'), { opacity: 1 });
        gsap.fromTo(fluxo, { rotation: 0 }, {
          rotation: 360, svgOrigin: '200 200', ease: 'none',
          scrollTrigger: { trigger: secao, start: 'top 60%', end: 'bottom 40%', scrub: true },
        });
      }
    });
    return () => circulos.forEach((c) => ativar(c, 'todos'));
  });

  mm.add('(prefers-reduced-motion: no-preference) and (max-width: 1023.98px)', () => {
    const obs: IntersectionObserver[] = [];
    const circulos: HTMLElement[] = [];
    secoesComCirculo().forEach((secao) => {
      const circulo = secao.querySelector<HTMLElement>('[data-circulo]')!;
      const ordem = [...secao.querySelectorAll<HTMLElement>('[data-passo-no]')].map((p) => Number(p.dataset.passoNo));
      circulos.push(circulo);
      ativar(circulo, ordem[0]);
      const tl = gsap.timeline({ paused: true });
      ordem.forEach((no, k) => tl.call(() => ativar(circulo, no), [], 0.6 + k * 0.8));
      tl.call(() => ativar(circulo, 'todos'), [], 0.6 + ordem.length * 0.8);
      aoEntrar(circulo, () => tl.play(), obs);
    });
    return () => { desligar(obs)(); circulos.forEach((c) => ativar(c, 'todos')); };
  });
}

// B8 — sete problemas: no desktop, a coluna "O digital resolve?" aparece primeiro e a da
// cidadania ativa depois; no celular, os cartões entram em sequência.
function montarTabela() {
  mm.add('(prefers-reduced-motion: no-preference) and (min-width: 768px)', () => {
    const obs: IntersectionObserver[] = [];
    const tabela = document.querySelector('[data-tabela]');
    if (!tabela) return;
    const col1 = tabela.querySelectorAll('td[data-col="1"]');
    const col2 = tabela.querySelectorAll('td[data-col="2"]');
    gsap.set([col1, col2], { opacity: 0 });
    const tl = gsap.timeline({ paused: true })
      .to(col1, { opacity: 1, duration: 0.4, stagger: 0.08 })
      .to(col2, { opacity: 1, duration: 0.5, stagger: 0.1 }, '+=0.2');
    aoEntrar(tabela, () => tl.play(), obs);
    return desligar(obs);
  });
  mm.add('(prefers-reduced-motion: no-preference) and (max-width: 767.98px)', (ctx) => {
    const obs: IntersectionObserver[] = [];
    const linhas = [...document.querySelectorAll('[data-tabela] tbody tr')];
    gsap.set(linhas, { opacity: 0, y: 16 });
    revelarEmLote(linhas, (lote) => { ctx.add(() => gsap.to(lote, { ...sobe, stagger: 0.1 })); }, obs);
    return desligar(obs);
  });
}
