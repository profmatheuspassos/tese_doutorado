#!/usr/bin/env python3
"""Mede a legibilidade de textos do site em inglês (D89).

Uso:  python3 scripts/legibilidade_en.py ARQUIVO.md [ARQUIVO.md ...]
      python3 scripts/legibilidade_en.py --teste

Precisa do pacote cmudict, na versão fixada em scripts/requirements-legibilidade.txt.

Índices (Kincaid et al., 1975; Flesch, 1948):

    Flesch-Kincaid Grade Level = 0,39 x (palavras por frase) + 11,8 x (sílabas por palavra) - 15,59
    Flesch Reading Ease        = 206,835 - 1,015 x (palavras por frase) - 84,6 x (sílabas por palavra)

Referência de conferência: grau 8 ou menos (D89). É conferência, não meta: não piorar o texto
para melhorar o número.

Sílabas: pelo dicionário de pronúncia CMU (pacote cmudict); conta as vogais da primeira pronúncia
(os fonemas com marca de tonicidade). Palavras fora do dicionário (números, nomes portugueses e
brasileiros, siglas) caem em regras simples, e o relatório diz quantas e quais. Números contam
como duas sílabas, como no script em português.

O que é medido: o mesmo recorte do scripts/legibilidade.py. O índice usa só o texto corrido; cada
item de lista conta como uma frase. Ficam de fora o cabeçalho YAML, títulos, comentários HTML,
blocos de código e tabelas. O tamanho da página conta todo o texto visível, inclusive títulos e
tabelas. Também conta "the dissertation" no texto visível (no máximo cinco por página, D15).
"""
import os
import re
import sys
import unicodedata

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from legibilidade import frases, texto_corrido, texto_visivel  # noqa: E402  (mesmo recorte do português)

LIMITE_FRASE_LONGA = 25  # palavras
LIMITE_DISSERTATION = 5  # D15
_CMU = None


def cmu():
    global _CMU
    if _CMU is None:
        try:
            import cmudict
        except ImportError:
            sys.exit("Falta o pacote cmudict: pip install -r scripts/requirements-legibilidade.txt")
        _CMU = cmudict.dict()
    return _CMU


def palavras(trecho: str):
    # Números (72.4%; 1,473,063; 2017) contam como uma palavra; apóstrofo reto ou curvo dentro da
    # palavra ("doesn’t", "citizens’") fica com ela.
    return re.findall(r"[0-9]+(?:[.,][0-9]+)*%?|[A-Za-zÀ-ÿ]+(?:[-'’][A-Za-zÀ-ÿ]+)*['’]?", trecho)


def sem_acento(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")


def silabas_regra(palavra: str) -> int:
    """Regra para palavras fora do CMU: grupos de vogais, com o "e" mudo final."""
    p = re.sub(r"[^a-z]", "", sem_acento(palavra.lower()))
    if not p:
        return 1
    n = len(re.findall(r"[aeiouy]+", p))
    if p.endswith("e") and not p.endswith(("le", "ee", "ye")) and n > 1:
        n -= 1
    return max(n, 1)


def silabas_palavra(palavra: str):
    """(sílabas, veio do CMU?) de uma palavra sem hífen."""
    chave = palavra.lower().replace("’", "'")
    chave = re.sub(r"'s$", "", chave) if chave not in cmu() else chave
    chave = chave.rstrip("'")
    pron = cmu().get(chave)
    if pron:
        return sum(1 for f in pron[0] if f[-1].isdigit()), True
    return silabas_regra(palavra), False


def silabas_token(tok: str):
    """(sílabas, partes fora do CMU) de um token."""
    if tok[0].isdigit():
        return 2, [tok]
    total, fora = 0, []
    for parte in tok.split("-"):
        n, no_cmu = silabas_palavra(parte)
        total += n
        if not no_cmu:
            fora.append(parte)
    return total, fora


def medir_texto(texto_corr: str, visivel: str) -> dict:
    fs = frases(texto_corr)
    por_frase = [palavras(f) for f in fs]
    toks = [t for ws in por_frase for t in ws]
    n_pal, n_fr = len(toks), len(fs)
    n_sil, fora = 0, []
    for t in toks:
        n, f = silabas_token(t)
        n_sil += n
        fora.extend(f)
    ppf = n_pal / n_fr
    spp = n_sil / n_pal
    return {
        "visiveis": len(palavras(visivel)),
        "palavras": n_pal,
        "frases": n_fr,
        "silabas": n_sil,
        "palavras_por_frase": ppf,
        "silabas_por_palavra": spp,
        "fkgl": 0.39 * ppf + 11.8 * spp - 15.59,
        "fre": 206.835 - 1.015 * ppf - 84.6 * spp,
        "fora": fora,
        "maior_frase": max(len(ws) for ws in por_frase),
        "longas": [(len(ws), f) for ws, f in zip(por_frase, fs) if len(ws) > LIMITE_FRASE_LONGA],
        "dissertation": len(re.findall(r"\bthe dissertation\b", " ".join(visivel.split()), flags=re.I)),
    }


def medir(caminho: str) -> dict:
    with open(caminho, encoding="utf-8") as f:
        md = f.read()
    r = medir_texto(texto_corrido(md), texto_visivel(md))
    r["arquivo"] = caminho
    return r


def teste() -> int:
    """Confere o script contra contas feitas à mão."""
    erros = []
    esperadas = {"the": 1, "dissertation": 4, "democracy": 4, "citizenship": 4, "participation": 5,
                 "governance": 3, "doesn’t": 2, "citizens’": 3, "e-mail": 2}
    for palavra, n in esperadas.items():
        obtido, _ = silabas_token(palavra)
        if obtido != n:
            erros.append(f"sílabas de {palavra!r}: {obtido} (esperado {n})")
    # 9 palavras de uma sílaba em 2 frases:
    # FKGL = 0,39 x 4,5 + 11,8 x 1 - 15,59 = -2,035; FRE = 206,835 - 4,5675 - 84,6 = 117,6675.
    r = medir_texto("The cat sat on the mat. The dog ran.", "The cat sat on the mat. The dog ran.")
    if (r["palavras"], r["frases"], r["silabas"]) != (9, 2, 9):
        erros.append(f"contagem: {r['palavras']} palavras, {r['frases']} frases, {r['silabas']} sílabas (esperado 9, 2, 9)")
    if abs(r["fkgl"] - -2.035) > 1e-9 or abs(r["fre"] - 117.6675) > 1e-9:
        erros.append(f"índices: FKGL {r['fkgl']}, FRE {r['fre']} (esperado -2,035 e 117,6675)")
    # "Latinobarómetro" fica fora do CMU e cai na regra (l-a-ti-no-ba-ro-me-tro: 7 grupos de vogais).
    n, fora = silabas_token("Latinobarómetro")
    if fora != ["Latinobarómetro"] or n != 7:
        erros.append(f"Latinobarómetro: {n} sílabas, fora do CMU {fora} (esperado 7, fora)")
    # Contagem de "the dissertation".
    r = medir_texto("The dissertation is long. I read the dissertation.", "The dissertation is long. I read the dissertation.")
    if r["dissertation"] != 2:
        erros.append(f'"the dissertation": {r["dissertation"]} (esperado 2)')
    if erros:
        print("legibilidade_en --teste: falhou")
        for e in erros:
            print(" - " + e)
        return 1
    print(f"legibilidade_en --teste: ok ({len(esperadas)} palavras com sílabas conferidas no CMU, "
          "índices de um texto contado à mão, regra fora do CMU e contagem de \"the dissertation\")")
    return 0


def main(args):
    if not args:
        print(__doc__)
        return 1
    if args == ["--teste"]:
        return teste()
    for caminho in args:
        r = medir(caminho)
        fora = r["fora"]
        print(f"# {r['arquivo']}")
        print(f"Palavras visíveis (com títulos e tabelas): {r['visiveis']}")
        print(f"Palavras no texto corrido (base dos índices): {r['palavras']}")
        print(f"Frases: {r['frases']}")
        print(f"Palavras por frase (média): {r['palavras_por_frase']:.1f}")
        print(f"Sílabas por palavra (média): {r['silabas_por_palavra']:.2f}")
        print(f"Flesch-Kincaid Grade Level: {r['fkgl']:.1f} (referência: 8 ou menos)")
        print(f"Flesch Reading Ease: {r['fre']:.1f}")
        print(f"Palavras fora do dicionário CMU (sílabas por regra): {len(fora)} "
              f"({100 * len(fora) / r['palavras']:.1f}%): {', '.join(sorted(set(fora))) or '-'}")
        print(f"\"the dissertation\": {r['dissertation']} (máximo {LIMITE_DISSERTATION}, D15)"
              + ("  <-- ACIMA" if r["dissertation"] > LIMITE_DISSERTATION else ""))
        print(f"Maior frase: {r['maior_frase']} palavras")
        print(f"Frases com mais de {LIMITE_FRASE_LONGA} palavras: {len(r['longas'])}")
        for n, f in r["longas"]:
            print(f"  [{n}] {f}")
        print()
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
