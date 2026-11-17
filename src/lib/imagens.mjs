/**
 * Lista única das imagens ilustrativas de public/img: nome, dimensões exatas e cor do espaço
 * reservado. Usada por scripts/reservar-imagens.mjs (cria os espaços reservados) e por
 * scripts/conferir-imagens.mjs (confere as imagens finais no build). Prompts e estilo em
 * docs/PROMPTS-IMAGENS.md.
 */
export const NEVOA = '#f3f5f7';
export const GRAFITE = '#0f1114';

/** Teto de peso por arquivo, em KB (WebP das ilustrações e PNG de compartilhamento). */
export const TETO_KB = { webp: 600, png: 1000 };

export const IMAGENS = [
  { nome: 'home-cena-2013.webp', largura: 1200, altura: 1500, fundo: GRAFITE },
  { nome: 'home-bairro.webp', largura: 1800, altura: 1200, fundo: NEVOA },
  { nome: 'cap1-abertura.webp', largura: 2520, altura: 1080, fundo: NEVOA },
  { nome: 'cap2-abertura.webp', largura: 2520, altura: 1080, fundo: GRAFITE },
  { nome: 'cap3-abertura.webp', largura: 2520, altura: 1080, fundo: GRAFITE },
  { nome: 'cap3-estadio.webp', largura: 2400, altura: 1350, fundo: NEVOA },
  { nome: 'cap4-abertura.webp', largura: 2520, altura: 1080, fundo: NEVOA },
  { nome: 'cap5-abertura.webp', largura: 2520, altura: 1080, fundo: NEVOA },
];

/** Imagem de compartilhamento (Open Graph), usada em todas as páginas (D73). */
export const IMAGEM_OG = { nome: 'og-home.png', largura: 1200, altura: 630 };
