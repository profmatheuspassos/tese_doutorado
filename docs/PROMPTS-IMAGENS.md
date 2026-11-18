# Prompts das imagens ilustrativas

As imagens não são geradas neste projeto. Este arquivo traz o guia de estilo e o prompt final de
cada imagem. As oito ilustrações foram **geradas no Gemini, no plano pago, em 18/11/2026**, cada uma
numa conversa nova, com os prompts abaixo, e aprovadas pelo autor uma a uma contra este guia. Os
recortes, a redução e os desvios aceitos estão na D81 (`docs/DECISOES.md`). Os originais não estão
na árvore atual do repositório nem no site, mas ficaram no histórico da `main` (commit `67d4013`),
porque o pull request entrou por merge comum (D82). Em `public/img/` estão só os WebP finais, com o
nome e o tamanho exatos da tabela.
O script `npm run imagens` nunca sobrescreve um arquivo que já existe.

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
(`scripts/reservar-imagens.mjs`).

---

## Prompts finais (Gemini, plano pago, 18/11/2026)

Cada prompt já traz, no fim, a versão do sufixo comum usada naquela imagem, com o formato pedido.

### home-cena-2013.webp (1200×1500, seção escura)

> A generic big-city street at dusk seen from a slightly elevated viewpoint, a wide crowd of simple
> faceless silhouettes seen from behind walking in the same direction, a simple boxy city bus shape
> stopped at the side, plain blank banners held up with no marks on them, generic low buildings
> reduced to flat rectangles, dark graphite background #0F1114 with cool gray planes, the only color
> is a soft terracotta #F0956A glow from street lamps. Flat vector illustration, simplified
> geometric shapes, no outlines, flat diffuse light, limited cool-gray palette with a single
> terracotta #F0956A accent, faceless silhouettes, no text, no letters, no numbers, no logos, no
> flags, no brand devices, no police, no violence, not photographic, not 3D, no lens blur, generous
> negative space, main subject in the central third. Vertical image, 4:5 aspect ratio.

Não pode aparecer: nada escrito nas faixas, número ou letreiro no ônibus, rosto, prédio ou
monumento reconhecível, bandeira, cor ou símbolo de partido, polícia ou violência.

### home-bairro.webp (1800×1200, seção clara)

> A small neighborhood square seen from above at a distance, a loose circle of faceless silhouettes
> of neighbors standing and sitting together around a simple bench, a few trees reduced to round
> flat shapes, light background #F3F5F7 with cool gray planes, the only color is green #3D7A47 in
> the tree tops. Flat vector illustration, simplified geometric shapes, no outlines, flat diffuse
> light, no cast shadows, limited cool-gray palette with a single green #3D7A47 accent, faceless
> silhouettes, no text, no letters, no numbers, no signs, no posters, no logos, no flags, no symbols
> of any organization, not photographic, not 3D, no lens blur, generous negative space, main subject
> in the central third. Horizontal image, 3:2 aspect ratio.

Não pode aparecer: placa, cartaz, rosto, símbolo de qualquer organização.

### cap1-abertura.webp (2520×1080)

> A single empty voting booth in a calm, bare room: a simple rectangular table with four thin
> straight legs, and on top of it a freestanding three-panel privacy screen (a back panel and two
> side panels angled slightly outward), open toward the viewer. Seen from a slightly elevated
> three-quarter view with consistent, simple perspective. A plain floor and a plain back wall
> suggest the room. Everything orderly and calm, light background #F3F5F7 with cool gray planes, the
> only color is a thin green #3D7A47 line along the top edge of the screen panels. Flat vector
> illustration, simplified geometric shapes, no outlines, flat diffuse light, no cast shadows,
> limited cool-gray palette with a single green #3D7A47 accent, no people, no chair, no text, no
> letters, no numbers, no electronic voting machine, no ballot papers, no logos, no flags, no coats
> of arms, not photographic, not 3D, no lens blur, generous negative space, main subject in the
> central third. Very wide horizontal image, 21:9 aspect ratio.

Não pode aparecer: urna eletrônica de modelo reconhecível, cédula com texto, bandeira, brasão.

### cap2-abertura.webp (2520×1080)

> A plain community meeting room seen from the back of the room, slightly elevated viewpoint. Three
> neat straight rows of identical simple empty chairs, clearly separated from each other, all facing
> a blank front wall. One faceless silhouette, seen clearly from behind, sits alone in the middle of
> the middle row, back of the head and shoulders visible above the chair back. A tall plain window
> on the left wall casts a single clean parallelogram of light on the floor, reaching the lone
> sitter. Wide empty space around, dark graphite background #0F1114 with cool gray planes, the only
> color is the terracotta #F0956A window light on the floor. Flat vector illustration, simplified
> geometric shapes, no outlines, flat diffuse light, no cast shadows except the window light,
> limited cool-gray palette with a single terracotta #F0956A accent, no overlapping or merged
> chairs, no text, no letters, no numbers, no boards with writing, no posters, no logos, no flags,
> not photographic, not 3D, no lens blur, generous negative space, main subject in the central
> third. Very wide horizontal image, 21:9 aspect ratio.

Não pode aparecer: quadro com texto, cartaz, rosto.

### cap3-abertura.webp (2520×1080)

> First-person view of two hands holding a plain generic rectangular screen horizontally with
> rounded corners. The hands are drawn as very simple flat shapes: each hand is a single rounded
> palm shape with only the thumb visible, resting on the side edge of the screen; all other fingers
> are hidden behind the device and not visible. Nothing below or under the screen except the wrists.
> The screen is a blank glowing surface with nothing on it: no interface, no icons, no camera, no
> buttons, no notch, no brand shape. The screen glow casts a soft patch of light on a plain table
> below. Dark graphite background #0F1114 with cool gray planes, the only color is a terracotta
> #F0956A glow from the screen. Flat vector illustration, simplified geometric shapes, no outlines,
> flat diffuse light, limited cool-gray palette with a single terracotta #F0956A accent, no extra
> fingers, no text, no letters, no numbers, no logos, no social media symbols, not photographic, not
> 3D, no lens blur, generous negative space, main subject in the central third. Very wide horizontal
> image, 21:9 aspect ratio.

Não pode aparecer: interface com ícones ou texto, formato reconhecível de celular de qualquer
marca, logotipo de rede social.

### cap3-estadio.webp (2400×1350)

> A huge generic oval stadium seen from a high three-quarter aerial angle, close enough that the
> curved stands fill most of the frame. Every stand is completely packed: the crowd is drawn as a
> dense mass of small simple round head-and-shoulder shapes in varied cool grays, clearly readable
> as people. An empty plain oval field in the center with no markings, no goals, no stage and no
> microphone. Light background #F3F5F7 with cool gray planes, the only color is a thin green #3D7A47
> outline around the edge of the field. Flat vector illustration, simplified geometric shapes, no
> outlines except the green field edge, flat diffuse light, no cast shadows, limited cool-gray
> palette with a single green #3D7A47 accent, no scoreboard, no video screens, no advertising
> boards, no text, no letters, no numbers, no logos, no flags, no recognizable stadium architecture,
> not photographic, not 3D, no lens blur, main subject in the central third. Horizontal image, 16:9
> aspect ratio.

Não pode aparecer: placar, publicidade, palco, telão, estádio reconhecível.

### cap4-abertura.webp (2520×1080)

> A quiet neighborhood street at dusk, small houses reduced to flat simple shapes, a row of street
> lamps just turned on, a few faceless silhouettes walking calmly, light cool-gray sky #F3F5F7
> fading to darker gray, the only color is green #3D7A47 in the circles of lamp light on the ground.
> Flat vector illustration, simplified geometric shapes, no outlines, flat diffuse light, no cast
> shadows except the circles of lamp light, limited cool-gray palette with a single green #3D7A47
> accent, faceless silhouettes, no street signs, no house numbers, no cars, no text, no letters, no
> numbers, no logos, no flags, not photographic, not 3D, no lens blur, generous negative space, main
> subject in the central third. Very wide horizontal image, 21:9 aspect ratio.

Não pode aparecer: placa de rua, número de casa, carro de marca reconhecível.

### cap5-abertura.webp (2520×1080)

> A simple table reduced to a flat warm-gray shape, with several plain cardboard boxes full of neat
> stacks of completely blank sheets of paper, one stack slightly fanned out, a plain pen lying
> nearby. Light background #F3F5F7 with cool gray planes, the only color is terracotta #B4532A on
> the packing tape of the boxes. Flat vector illustration, simplified geometric shapes, no outlines,
> flat diffuse light, no cast shadows, limited cool-gray palette with a single terracotta #B4532A
> accent, no text, no letters, no numbers, no handwriting, no signatures, no stamps, no seals, no
> coats of arms, no labels on the boxes, no logos, no flags, not photographic, not 3D, no lens blur,
> generous negative space, main subject in the central third. Very wide horizontal image, 21:9
> aspect ratio.

Não pode aparecer: texto, assinatura legível, carimbo, brasão, logotipo.
