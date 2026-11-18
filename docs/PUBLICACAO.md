# Publicação (Fase 5)

Endereço: **https://tese.profmatheuspassos.com.br** (D72). Hospedagem: Hostinger, plano Business,
hPanel. Decisões D71 a D79 em `docs/DECISOES.md`.

**Situação:** no ar desde 18/11/2026. Passos A a D abaixo feitos pelo autor; primeira implantação
manual do commit `e35f1fa` da `publicacao`. Implantação automática ligada (a confirmar no
primeiro merge depois da D78).

## Como o site chega ao ar (D71, D78)

1. Merge na `main` dispara o workflow `.github/workflows/publicar.yml`.
2. O workflow roda `npm ci` e `npm run build`, com todas as conferências (dados, contraste,
   imagens, texto, terceiros, links, `.htaccess` e publicação). Qualquer falha para tudo e nada é
   publicado.
3. Se o build passar, o workflow copia o site pronto (`dist/`, com o `.htaccess` e o
   `versao.txt`) para a branch **`publicacao`**, com um commit normal por cima do anterior
   ("Publica main@abc1234"). Nunca force push. Como o `versao.txt` traz a hora do build, todo
   merge gera um commit novo na `publicacao`.
4. O aplicativo **"Implante de GitHub"** da Hostinger (instalado pelo autor no GitHub) percebe o
   commit novo na `publicacao` e, com a implantação automática ligada, copia a branch para
   `public_html/tese`.

Em pull requests para a `main`, o mesmo workflow roda só o build com as conferências, sem
publicar. Para republicar sem mudar nada: GitHub → Actions → Publicar → "Run workflow".

**Nunca editar a branch `publicacao` à mão.** Ela é refeita a cada publicação.

**Não há webhook no repositório, e não deve ser criado** (D78): quem avisa a Hostinger é o
aplicativo. Nenhum segredo da Hostinger fica no GitHub; o acesso é o que o autor deu ao aplicativo
e pode ser retirado nas configurações do GitHub do autor (Applications → Installed GitHub Apps).

## Qual versão está no ar (D78)

Abra **https://tese.profmatheuspassos.com.br/versao.txt**. São duas linhas:

```text
commit 1f9019f71157947ea17ca54a8242176ac380819a
gerado 2026-11-18T13:43:15Z
```

`commit` é o commit da `main` que gerou o site no ar; `gerado`, a data e hora do build em UTC.
Compare o commit com o último da
`main` no GitHub (página de commits, ou a execução mais recente do workflow "Publicar" em
Actions). Se for o mesmo, a última publicação chegou ao ar. Se for anterior:

1. Veja em Actions se o workflow "Publicar" da `main` terminou sem erro (com erro, nada é
   publicado).
2. Veja se a branch `publicacao` tem o commit "Publica main@…" correspondente.
3. No hPanel, em "Implante de GitHub", veja o histórico e, se preciso, clique para implantar à
   mão.

O teste no ar (`npm run conferir:publicado`) faz essa comparação sozinho.

## Os dois arquivos `.htaccess`

| Arquivo | Onde fica no servidor | Como chega lá |
|---|---|---|
| `dist/.htaccess`, gerado por `scripts/gerar-htaccess.mjs` a cada build | pasta do subdomínio (`public_html/tese`) | pela branch `publicacao` |
| `hospedagem/htaccess-dominio-principal` | `public_html/.htaccess` | colado à mão uma vez (passo 9) |

O do subdomínio força HTTPS e o host canônico, serve a página 404 do site, esconde a pasta `.git`
e envia os cabeçalhos de segurança (D74) e de cache (D75). O da pasta principal só redireciona o
domínio principal e o `www` (D77), sempre com condição de host, para nunca alcançar o subdomínio.

## O que o autor faz no hPanel

Os nomes de menu do hPanel mudam de vez em quando; se algo não bater, anote o que aparece na tela.
**A ordem importa:**

- **A. Remover o WordPress** primeiro, para a pasta principal ficar só com o `.htaccess` do
  redirecionamento antes de o subdomínio nascer dentro dela.
- **B. Redirecionamento do domínio principal** logo em seguida, para não haver período com o
  domínio servindo página vazia ou listagem de pasta.
- **C. Subdomínio e SSL** antes do Git: o `.htaccess` do site manda tudo para HTTPS, então o
  certificado tem de estar ativo quando o site chegar.
- **D. Git** só depois de o workflow criar a branch `publicacao`. (Feito pelo aplicativo
  "Implante de GitHub"; ver a seção D.)

**Nada começa antes do merge da Etapa 1 da Fase 5.** O passo 9 usa o arquivo
`hospedagem/htaccess-dominio-principal`, que só existe na `main` depois desse merge. **A e B são
feitos em sequência, na mesma sessão de trabalho**, sem pausa entre eles: entre o fim de A e o
fim de B o domínio principal fica sem conteúdo. C e D vêm depois.

### A. Remover só a instalação do WordPress (arquivos e banco)

1. No hPanel, abra **Sites** e escolha **profmatheuspassos.com.br** → **Painel**.
   **Não use "Excluir site" em nenhum momento**: o site do domínio precisa continuar existindo.
2. Abra **Arquivos → Backups** e gere (ou baixe) um backup dos arquivos e do banco de dados.
   Guarde no seu computador antes de seguir.
3. Abra **Arquivos → Gerenciador de arquivos**, entre em `public_html`, abra `wp-config.php` e
   anote o valor de `DB_NAME` (o nome do banco do WordPress). Feche sem salvar.
4. **Confira que o banco não é compartilhado.** Volte a **Sites**, escolha **profmatheus.com**
   → **Painel** → **Arquivos → Gerenciador de arquivos**, abra o `wp-config.php` de
   `public_html` e compare o `DB_NAME` dele com o anotado no passo 3. Feche sem salvar.
   - **Diferentes:** siga para o passo 5.
   - **Iguais: PARE. Não exclua o banco.** Os dois sites usam o mesmo banco, e excluí-lo
     derrubaria o profmatheus.com. Pule o passo 5, faça o resto de A e B normalmente e avise;
     o banco fica como está até uma nova decisão.
   - Se o profmatheus.com não estiver nesta conta da Hostinger, os bancos são necessariamente
     separados; siga para o passo 5.
5. Volte ao Painel de **profmatheuspassos.com.br** e abra **Bancos de dados → Gerenciamento**.
   Na lista, ache o banco com o nome anotado no passo 3 e **exclua só ele** (e o usuário do
   banco ligado a ele, se aparecer em separado).
6. Abra **Avançado → Cron Jobs**. Se houver tarefa apontando para `wp-cron.php` ou para a pasta
   `public_html`, exclua.
7. Volte ao **Gerenciador de arquivos** de profmatheuspassos.com.br, entre em `public_html`,
   selecione **tudo o que está dentro** (inclusive arquivos ocultos como `.htaccess`; ative
   "mostrar arquivos ocultos" se preciso) e exclua. A pasta `public_html` em si fica, vazia. Se
   houver `.well-known`, pode manter.
8. Se o hPanel ainda listar o WordPress em **WordPress → Visão geral** ou no **Auto
   Installer**, use a opção de remover/desinstalar **a instalação** (não o site) só para limpar
   o registro; os arquivos e o banco já foram apagados. Se no passo 4 os bancos eram iguais,
   **não** use essa opção (ela pode tentar apagar o banco); só avise.

### B. Redirecionar o domínio principal para profmatheus.com (logo após A)

9. No **Gerenciador de arquivos**, em `public_html`, crie o arquivo `.htaccess` e cole o
   conteúdo de [`hospedagem/htaccess-dominio-principal`](../hospedagem/htaccess-dominio-principal),
   copiado da `main` no GitHub. Salve.

   Só `mod_rewrite` com condição de host: nada de `Redirect` (mod_alias) nem `Header`, que
   seriam herdados pela pasta do subdomínio. O caminho é mantido
   (`/algum-post/` → `https://profmatheus.com/algum-post/`). `.well-known` fica de fora para a
   renovação do SSL do domínio principal continuar funcionando.
10. Abra `https://profmatheuspassos.com.br` e `https://www.profmatheuspassos.com.br`: os dois
    devem cair em `https://profmatheus.com`. (Se o navegador reclamar de certificado, confira em
    **Segurança → SSL** que o domínio principal tem SSL ativo; ele é necessário para o
    redirecionamento em HTTPS.)

### C. Subdomínio e SSL

11. No Painel de profmatheuspassos.com.br, abra **Domínios → Subdomínios**.
12. Em "Criar um novo subdomínio", digite `tese`. **Não** marque pasta personalizada. Clique
    **Criar**.
13. Na lista, anote a pasta ao lado de `tese.profmatheuspassos.com.br` (provavelmente
    `public_html/tese`).
14. Abra **Segurança → SSL**. Se `tese.profmatheuspassos.com.br` não aparecer como ativo,
    clique **Instalar SSL** para ele (gratuito). Espere ficar "Ativo" (pode levar algumas horas).
15. **Não** ative o botão "Forçar HTTPS" do hPanel: ele escreve regras nos `.htaccess` que são
    do projeto. O HTTPS já vem nos dois arquivos.

### D. Implantação pelo aplicativo "Implante de GitHub" (D78)

O hPanel não mostrou a ferramenta Git com webhook do plano original, e sim a integração por
aplicativo. Foi feito assim:

16. No **Gerenciador de arquivos**, a pasta `public_html/tese` ficou vazia antes da primeira
    implantação.
17. Na integração **"Implante de GitHub"** do hPanel, o aplicativo da Hostinger foi instalado no
    GitHub com acesso a este repositório.
18. Configuração: repositório `profmatheuspassos/tese_doutorado`, branch **`publicacao`**,
    diretório **`public_html/tese`** (**nunca** `public_html`, onde está o `.htaccess` do
    redirecionamento), **implantação automática ligada**.
19. Primeira implantação manual: commit `e35f1fa` da `publicacao`. O site apareceu em
    `https://tese.profmatheuspassos.com.br`.
20. **Nenhum webhook** foi criado no repositório, e não deve ser.
21. A sessão de trabalho rodou os testes abaixo.

### CDN da Hostinger: desligada (D78)

A CDN da Hostinger estava ligada e foi **desligada** para este site, com o cache limpo. Ligada,
ela trocava cabeçalhos: nas imagens guardadas no cache dela, tirava a CSP e o COOP e abria o CORS
(`access-control-allow-origin: *`). Logo depois do desligamento, por um tempo, parte das
respostas ainda passou por ela (visto nos testes de 18/11/2026); depois, todas passaram a vir
direto do servidor. **Não religar**
sem rever o cache e os cabeçalhos: o teste no ar trata resposta vinda da CDN (`server: hcdn`,
`x-hcdn-*`, `age`) como erro.

## Como trocar as imagens ilustrativas

As imagens vivem em `public/img/` com nome e tamanho fixos (lista única em
`src/lib/imagens.mjs`; tabela e prompts em `docs/PROMPTS-IMAGENS.md`). Trocar é só substituir o
arquivo, sem tocar em código.

1. Exportar cada imagem em **WebP**, com o **nome e as dimensões exatos** da tabela (por exemplo
   `cap1-abertura.webp`, 2520×1080) e com **até 600 KB** (a `og-home.png`, em PNG, até 1.000 KB).
2. No GitHub: abrir `public/img/` → **Add file → Upload files** → arrastar os arquivos (mesmo
   nome substitui) → escolher "Create a new branch… and start a pull request" → abrir o PR.
   Ou entregar os arquivos a uma sessão do Claude, que faz o mesmo e roda os testes.
3. O workflow roda o build (sem publicar) no PR e mostra se as imagens passam nas conferências.
   Merge → o workflow gera as variantes de 840 e 1680 px, roda as conferências e publica. Em
   poucos minutos está no ar (o `versao.txt` mostra o commit do merge); quem já visitou vê a
   imagem nova em até um dia (cache das imagens no navegador).
4. Se uma imagem vier com nome, formato, tamanho ou peso errado, o build falha
   (`scripts/conferir-imagens.mjs`) e o site no ar não muda.

As imagens ficam sob CC BY-NC-ND 4.0, como os textos (D76).

## Testes depois de publicar

```bash
NODE_USE_ENV_PROXY=1 npm run conferir:publicado
```

```bash
BASE_URL=https://tese.profmatheuspassos.com.br npm run capturas
```

```bash
LIGHTHOUSE_URL=https://tese.profmatheuspassos.com.br npm run lighthouse
```

`conferir:publicado` confere, no ar: as sete páginas em HTTPS sem redirecionamento, com canonical
certo; http → https; rota sem barra → com barra; a 404 com status 404; `.git` barrado (403 do
servidor ou 404 do site); os cabeçalhos de segurança, sem nenhum repetido nem estranho (herdado da
pasta principal) e sem resposta vinda da CDN; cache e compressão; sitemap e robots; o `versao.txt`
com o commit esperado (o último da `main`, ou `COMMIT_ESPERADO=<commit>`); o domínio principal e o
`www` redirecionando para profmatheus.com (em `http://`, o servidor passa antes por `https://`, um
passo a mais, registrado como aviso) e `/tese/` para o subdomínio; e os links públicos
(repositório sem login, depósito, licenças). Erro de rede num site de terceiros fica como "não
testado daqui".

Numa sessão na nuvem, a rede precisa liberar `tese.profmatheuspassos.com.br`,
`profmatheuspassos.com.br`, `www.profmatheuspassos.com.br`, `hdl.handle.net`,
`repositorio.ulisboa.pt` e `creativecommons.org` (ambiente "tese_doutorado"). Atrás do proxy,
os pedidos `http://` vão pelo `curl` com túnel, e o navegador dos testes sai pelo proxy.
`capturas` roda os testes no navegador com os cabeçalhos reais (inclusive zero violações de CSP),
e `lighthouse` mede as sete páginas no endereço real (resumo em
`docs/capturas/fase-5/lighthouse/resumo.md`).
