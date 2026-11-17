# Prompts das imagens ilustrativas

As imagens não são geradas neste projeto. Este arquivo traz o guia de estilo e o prompt de cada
imagem. Em `public/img/` há um espaço reservado para cada uma, com o nome e o tamanho exatos, em cor
lisa e sem texto. Para usar a imagem final, basta substituir o arquivo, mantendo o nome. O script
`npm run imagens` nunca sobrescreve um arquivo que já existe.

**Como trocar depois da publicação (Fase 5):** passo a passo em `docs/PUBLICACAO.md`, seção "Como
trocar as imagens ilustrativas". Em resumo: mesmo nome, mesmo tamanho, WebP com até 600 KB
(`og-home.png`, PNG com até 1.000 KB), enviado por pull request; o build confere tudo
(`scripts/conferir-imagens.mjs`, com a lista única de `src/lib/imagens.mjs`) e o merge publica.
As imagens ficam sob CC BY-NC-ND 4.0, como os textos (D76).

Plano aprovado na Fase 3 (17/11/2026), item 6.

---

## Guia de estilo único

Todas as imagens são **ilustrações claramente não fotográficas**, no mesmo estilo. Nenhuma pode
ser confundida com o registro de um fato real. Isso vale sobretudo para `home-cena-2013`, que fica
ao lado de um fato histórico: ela representa a ideia de um protesto de rua, não aquele protesto.

| Item | Regra |
|---|---|
| Técnica | Ilustração vetorial plana, de formas geométricas simplificadas, com recortes nítidos. Sem fotorrealismo, sem renderização 3D, sem pintura realista, sem desfoque de lente, sem textura de foto. |
| Paleta | Fundo e formas em branco #FFFFFF, névoa #F3F5F7, grafite #0F1114, grafite-2 #1A1D21 e cinzas frios (#50565E, #8C939B, #A7AEB6). **Um único acento por imagem:** ramo (verde #3D7A47 no claro, #7FC08A no escuro) ou semente (terracota #B4532A no claro, #F0956A no escuro). Imagem de seção escura: fundo grafite. Imagem de seção clara: fundo branco ou névoa. |
| Traço | Sem contorno preto. As formas se separam pela cor. Quando houver linha, é fina e de espessura uniforme, como o traço do ramo e das sementes do site. |
| Luz | Chapada e difusa, sem sombra realista nem brilho especular. A profundidade vem de dois ou três planos de cinza. |
| Pessoas | Silhuetas simplificadas, sem traço facial, sem roupa ou objeto que identifique alguém. Nunca uma pessoa real. |
| Enquadramento | Plano amplo, ponto de vista um pouco elevado, bastante espaço vazio. O assunto fica no terço central, para o recorte vertical do celular. |
| Sempre fora | Texto, letras ou números legíveis; logotipos; marcas de produto, incluindo a forma reconhecível de aparelhos de marcas conhecidas; bandeiras; símbolos de partido; pontos turísticos ou prédios reconhecíveis. |
| Formato | WebP, no tamanho exato da tabela, com até 600 KB (a `og-home.png`: PNG, até 1.000 KB). |

**Sufixo comum (acrescentar ao fim de todo prompt):**

> flat vector illustration, simplified geometric shapes, no outlines, flat diffuse light, limited
> cool-gray palette with a single [ACENTO] accent, faceless silhouettes, no text, no letters, no
> numbers, no logos, no flags, no brand devices, not photographic, not 3D, no lens blur, generous
> negative space, main subject in the central third

Troque `[ACENTO]` por `green #3D7A47` (ou `#7FC08A` em fundo escuro) ou `terracotta #B4532A` (ou
`#F0956A` em fundo escuro), conforme a imagem.

**Lista de conferência antes de usar uma imagem:** nenhuma letra ou número legível; nenhum rosto
com traços; nenhum objeto com marca reconhecível; nenhuma bandeira, símbolo ou cor de partido;
nenhum lugar reconhecível; um só acento de cor; aparência claramente de ilustração.

---

## Lista de imagens

| Arquivo | Proporção / tamanho | Onde aparece | Fundo | Acento |
|---|---|---|---|---|
| `home-cena-2013.webp` | 4:5 · 1200×1500 | Home, bloco B1 (Uma cena) | grafite | semente |
| `home-bairro.webp` | 3:2 · 1800×1200 | Home, bloco B6 (O cidadão no centro), antes dos cartões | névoa | ramo |
| `cap1-abertura.webp` | 21:9 · 2520×1080 | Capítulo 1, topo | névoa | ramo |
| `cap2-abertura.webp` | 21:9 · 2520×1080 | Capítulo 2, topo | grafite | semente |
| `cap3-abertura.webp` | 21:9 · 2520×1080 | Capítulo 3, topo | grafite | semente |
| `cap3-estadio.webp` | 16:9 · 2400×1350 | Capítulo 3, seção sobre Atenas (D24) | névoa | ramo |
| `cap4-abertura.webp` | 21:9 · 2520×1080 | Capítulo 4, topo | névoa | ramo |
| `cap5-abertura.webp` | 21:9 · 2520×1080 | Capítulo 5, topo | névoa | semente |
| `og-home.png` | 1200×630 | Compartilhamento em redes | branco | ramo e semente |

`og-home.png` não usa IA: é gerada pelo próprio projeto a partir do desenho do ramo e das sementes
(`scripts/reservar-imagens.mjs`). As imagens dos capítulos só entram no site na Fase 4.

---

## Prompts

### home-cena-2013.webp (1200×1500, seção escura)

> A generic big-city street at dusk seen from a slightly elevated viewpoint, a wide crowd of simple
> faceless silhouettes seen from behind walking in the same direction, a simple boxy city bus shape
> stopped at the side, plain blank banners held up with no marks on them, generic low buildings
> reduced to flat rectangles, dark graphite background #0F1114 with cool gray planes, the only
> color is a soft terracotta #F0956A glow from street lamps

Não pode aparecer: nada escrito nas faixas, número ou letreiro no ônibus, rosto, prédio ou
monumento reconhecível, bandeira, cor ou símbolo de partido, polícia ou violência.

### home-bairro.webp (1800×1200, seção clara)

> A small neighborhood square seen from above at a distance, a loose circle of faceless silhouettes
> of neighbors standing and sitting together around a simple bench, a few trees reduced to round
> flat shapes, light background #F3F5F7 with cool gray planes, the only color is green #3D7A47 in
> the tree tops

Não pode aparecer: placa, cartaz, rosto, símbolo de qualquer organização.

### cap1-abertura.webp (2520×1080)

> An empty, tidy voting booth in a calm room, simple geometric partition panels and a small table,
> everything orderly and symmetrical, light background #F3F5F7 with cool gray planes, the only color
> is a thin green #3D7A47 line on the booth edge

Não pode aparecer: urna eletrônica de modelo reconhecível, cédula com texto, bandeira, brasão.

### cap2-abertura.webp (2520×1080)

> A community meeting room with rows of empty chairs, a single faceless silhouette seen from behind
> sitting in the middle, wide empty space around, dark graphite background #0F1114 with cool gray
> planes, the only color is a terracotta #F0956A rectangle of light from a window on the floor

Não pode aparecer: quadro com texto, cartaz, rosto.

### cap3-abertura.webp (2520×1080)

> Two stylized hands holding a plain generic rectangular screen with rounded corners, no camera, no
> buttons, no brand shape, the screen glow lighting the space, dark graphite background #0F1114, the
> only color is a terracotta #F0956A glow coming from the screen

Não pode aparecer: interface com ícones ou texto, formato reconhecível de celular de qualquer
marca, logotipo de rede social.

### cap3-estadio.webp (2400×1350)

> A huge oval stadium seen from high above, completely full, the crowd rendered as thousands of tiny
> gray dots, an empty field in the center with no stage and no microphone, light background #F3F5F7
> with cool gray planes, the only color is a thin green #3D7A47 outline of the field

Não pode aparecer: placar, publicidade, palco, telão, estádio reconhecível.

### cap4-abertura.webp (2520×1080)

> A quiet neighborhood street at dusk, small houses reduced to flat shapes, a row of street lamps
> just turned on, a few faceless silhouettes walking, light cool-gray sky #F3F5F7 fading to darker
> gray, the only color is green #3D7A47 in the lamp light circles on the ground

Não pode aparecer: placa de rua, número de casa, carro de marca reconhecível.

### cap5-abertura.webp (2520×1080)

> A wooden-looking table reduced to a flat shape with several plain cardboard boxes full of stacks of
> blank sheets of paper, one stack slightly fanned out, a pen lying nearby, light background #F3F5F7
> with cool gray planes, the only color is terracotta #B4532A on the box tape

Não pode aparecer: texto, assinatura legível, carimbo, brasão, logotipo.
