#!/usr/bin/env python3
"""Divide o Markdown integral da tese em um arquivo por parte.

Uso: dividir_capitulos.py <tese.md> <pasta_de_saida>

Cada arquivo recebe, ao final, as notas de rodapé citadas naquela parte.
O script falha se a estrutura de títulos não for a esperada ou se o total
de notas distribuídas não coincidir com o total de notas definidas.
"""
import os
import re
import sys

PARTES = [
    "00-introducao",
    "01-capitulo-1",
    "02-capitulo-2",
    "03-capitulo-3",
    "04-capitulo-4",
    "05-capitulo-5",
    "06-consideracoes-finais",
    "07-referencias",
]


def main(origem, saida):
    linhas = open(origem, encoding="utf-8").read().split("\n")

    # As definições das notas ficam no fim do documento.
    inicio_notas = next(
        i for i, l in enumerate(linhas) if re.match(r"^\[\^\d+\]:", l)
    )
    corpo, bloco_notas = linhas[:inicio_notas], linhas[inicio_notas:]

    notas, atual = {}, None
    for l in bloco_notas:
        m = re.match(r"^\[\^(\d+)\]:", l)
        if m:
            atual = int(m.group(1))
            notas[atual] = [l]
        elif atual is not None:
            notas[atual].append(l)

    titulos = [i for i, l in enumerate(corpo) if l.startswith("# ")]
    if len(titulos) != len(PARTES):
        sys.exit(
            "Estrutura inesperada: %d títulos de nível 1, esperados %d:\n%s"
            % (len(titulos), len(PARTES), "\n".join(corpo[i] for i in titulos))
        )

    limites = [0] + titulos + [len(corpo)]
    arquivos = ["00a-pre-textual"] + PARTES
    os.makedirs(saida, exist_ok=True)

    total = 0
    for k, nome in enumerate(arquivos):
        texto = "\n".join(corpo[limites[k]:limites[k + 1]])
        citadas = sorted({int(n) for n in re.findall(r"\[\^(\d+)\]", texto)})
        total += len(citadas)
        bloco = "\n".join("\n".join(notas[n]).rstrip() + "\n" for n in citadas)
        conteudo = texto.rstrip() + "\n"
        if citadas:
            conteudo += "\n\n<!-- NOTAS DE RODAPÉ -->\n\n" + bloco
        with open(os.path.join(saida, nome + ".md"), "w", encoding="utf-8") as f:
            f.write(conteudo)
        print("%-26s %6d palavras  %4d notas" % (nome, len(texto.split()), len(citadas)))

    print("Notas distribuídas: %d | notas definidas: %d" % (total, len(notas)))
    if total != len(notas):
        sys.exit("ERRO: o total de notas não confere.")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
