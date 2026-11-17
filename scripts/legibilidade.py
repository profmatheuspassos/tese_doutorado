#!/usr/bin/env python3
"""Mede a legibilidade de textos do site em português.

Uso:  python3 scripts/legibilidade.py ARQUIVO.md [ARQUIVO.md ...]

Índice: Flesch adaptado ao português do Brasil (Martins, Ghiraldelo, Nunes e
Oliveira Jr., 1996, ICMSC-USP):

    IFL = 248,835 - 1,015 x (palavras por frase) - 84,6 x (sílabas por palavra)

A constante é a do Flesch original (206,835) mais 42 pontos: os autores
observaram que textos em português pontuavam, em média, 42 pontos a menos.

O índice é conferência, não meta (ver CLAUDE.md). A contagem de sílabas é
feita por regras e erra em alguns hiatos e ditongos; o desvio é pequeno no
total de um texto, mas o número deve ser lido como aproximado.

O que é medido: o índice usa só o texto corrido; cada item de lista conta
como uma frase. Ficam de fora o cabeçalho YAML, títulos (linhas com #),
comentários HTML (<!-- -->, que marcam a origem de cada bloco), blocos de
código e tabelas. O tamanho da página é dado à parte, contando todo o texto
visível, inclusive títulos e tabelas.
"""
import re
import sys
import unicodedata

VOGAIS = set("aeiouáéíóúâêôãõày")
ACENTUADAS = set("áéíóúâêôãõà")
LIMITE_FRASE_LONGA = 25  # palavras


def silabas(palavra: str) -> int:
    p = palavra.lower().replace("ü", "u")
    p = re.sub(r"[^a-záéíóúâêôãõàçy]", "", p)
    if not p:
        return 0
    # "u" depois de q/g e antes de vogal é semivogal ou mudo (que, quando, guerra).
    p = re.sub(r"(?<=[qg])u(?=[aeioáéíóâêô])", "", p)
    n = 0
    anterior = ""  # última vogal vista no grupo atual ("" fora de grupo)
    semivogal_usada = False
    for i, c in enumerate(p):
        if c not in VOGAIS:
            anterior, semivogal_usada = "", False
            continue
        if not anterior:
            n += 1
            anterior = c
            continue
        seguinte = p[i + 1 : i + 3]
        # Ditongo decrescente: vogal + i/u átono (pai, meu, foi, céu, fui).
        ditongo = c in "iuy" and not semivogal_usada and anterior != c
        # Hiato quando i/u vem antes de nh, ou de m/n/r/l/z que fecha a sílaba
        # (rainha, ruim, juiz, cair, ainda, Raul), e em -uição (constituição).
        if ditongo and (
            seguinte.startswith("nh")
            or (anterior == "u" and seguinte.startswith("ç"))  # constituição
            or re.match(r"[mnrlz]([^aeiouáéíóúâêôãõ]|$)", seguinte)
        ):
            ditongo = False
        # Ditongos nasais: ão, ãe, õe.
        if anterior in "ãõ" and c in "eo":
            ditongo = True
        if ditongo:
            semivogal_usada = True
        else:
            n += 1
            semivogal_usada = False
        anterior = c
    return max(n, 1)


def limpar(md: str) -> str:
    """Tira cabeçalho YAML, comentários HTML e blocos de código."""
    md = re.sub(r"\A---\n.*?\n---\n", "", md, flags=re.S)
    md = re.sub(r"<!--.*?-->", " ", md, flags=re.S)
    return re.sub(r"```.*?```", " ", md, flags=re.S)


def texto_visivel(md: str) -> str:
    """Todo o texto que o leitor vê, inclusive títulos e tabelas (para o tamanho)."""
    md = limpar(md)
    md = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", md)
    md = re.sub(r"^\|?[-| :]+\|?$", " ", md, flags=re.M)  # linhas separadoras de tabela
    return re.sub(r"[#*_`>|]", " ", md)


def texto_corrido(md: str) -> str:
    """Só o texto corrido (para o índice). Cada item de lista conta como uma frase."""
    linhas = []
    for linha in limpar(md).splitlines():
        s = linha.strip()
        if not s or s.startswith("#") or s.startswith("|"):
            linhas.append("")
            continue
        if re.match(r"^([-*]|\d+\.)\s+", s):
            linhas.append("")  # cada item de lista abre um bloco próprio
            s = re.sub(r"^([-*]|\d+\.)\s+", "", s)
        s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)  # links
        s = re.sub(r"[*_`>]", "", s)
        linhas.append(s)
    return unicodedata.normalize("NFC", "\n".join(linhas))


def frases(texto: str):
    blocos = [b.strip() for b in re.split(r"\n\s*\n", texto) if b.strip()]
    saida = []
    for b in blocos:
        b = " ".join(b.split())
        partes = re.split(r"(?<=[.!?…])[\"”’)]*\s+(?=[\"“‘(]?[A-ZÁÉÍÓÚÂÊÔÀ0-9])", b)
        saida.extend(p for p in partes if palavras(p))
    return saida


def palavras(trecho: str):
    # Números (63,9%; 1.473.063; 2017) contam como uma palavra.
    return re.findall(r"[0-9]+(?:[.,][0-9]+)*%?|[A-Za-zÀ-ÿ]+(?:[-'][A-Za-zÀ-ÿ]+)*", trecho)


def silabas_token(tok: str) -> int:
    if tok[0].isdigit():
        return 2  # aproximação para números; poucos no texto
    return sum(silabas(parte) for parte in tok.split("-"))


def faixa(indice: float) -> str:
    if indice >= 75:
        return "muito fácil"
    if indice >= 50:
        return "fácil"
    if indice >= 25:
        return "difícil"
    return "muito difícil"


def medir(caminho: str) -> dict:
    with open(caminho, encoding="utf-8") as f:
        md = f.read()
    texto = texto_corrido(md)
    fs = frases(texto)
    por_frase = [palavras(f) for f in fs]
    toks = [t for ws in por_frase for t in ws]
    n_pal = len(toks)
    n_fr = len(fs)
    n_sil = sum(silabas_token(t) for t in toks)
    ppf = n_pal / n_fr
    spp = n_sil / n_pal
    indice = 248.835 - 1.015 * ppf - 84.6 * spp
    longas = [(len(ws), f) for ws, f in zip(por_frase, fs) if len(ws) > LIMITE_FRASE_LONGA]
    return {
        "arquivo": caminho,
        "visiveis": len(palavras(texto_visivel(md))),
        "palavras": n_pal,
        "frases": n_fr,
        "silabas": n_sil,
        "palavras_por_frase": ppf,
        "silabas_por_palavra": spp,
        "indice": indice,
        "faixa": faixa(indice),
        "maior_frase": max(len(ws) for ws in por_frase),
        "longas": longas,
    }


def main(args):
    if not args:
        print(__doc__)
        return 1
    for caminho in args:
        r = medir(caminho)
        print(f"# {r['arquivo']}")
        print(f"Palavras visíveis (com títulos e tabelas): {r['visiveis']}")
        print(f"Palavras no texto corrido (base do índice): {r['palavras']}")
        print(f"Frases: {r['frases']}")
        print(f"Palavras por frase (média): {r['palavras_por_frase']:.1f}")
        print(f"Sílabas por palavra (média): {r['silabas_por_palavra']:.2f}")
        print(f"Índice Flesch adaptado: {r['indice']:.1f} ({r['faixa']})")
        print(f"Maior frase: {r['maior_frase']} palavras")
        print(f"Frases com mais de {LIMITE_FRASE_LONGA} palavras: {len(r['longas'])}")
        for n, f in r["longas"]:
            print(f"  [{n}] {f}")
        print()
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
