#!/usr/bin/env bash
# Recria ./conteudo a partir do .docx da tese em ./fonte.
#
# Uso:  bash scripts/converter.sh
#
# Requisitos: pandoc e python3.
# ./fonte e ./conteudo não são versionados: o .docx original e a conversão
# integral da tese ficam fora do repositório.
set -euo pipefail

raiz="$(cd "$(dirname "$0")/.." && pwd)"
fonte="$raiz/fonte"
saida="$raiz/conteudo"

command -v pandoc >/dev/null || { echo "pandoc não encontrado." >&2; exit 1; }
command -v python3 >/dev/null || { echo "python3 não encontrado." >&2; exit 1; }

shopt -s nullglob
arquivos=("$fonte"/*.docx)
if [ "${#arquivos[@]}" -ne 1 ]; then
  echo "Esperado exatamente um .docx em $fonte (encontrados: ${#arquivos[@]})." >&2
  exit 1
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

mkdir -p "$saida"
rm -f "$saida"/0*.md

# --wrap=none mantém um parágrafo por linha; as imagens vão para conteudo/midia.
(cd "$saida" && pandoc "${arquivos[0]}" -t markdown --wrap=none \
  --extract-media=midia -o "$tmp/tese.md")

python3 "$raiz/scripts/dividir_capitulos.py" "$tmp/tese.md" "$saida"
echo "Conversão concluída em $saida"
