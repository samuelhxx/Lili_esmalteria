# Lili Esmalteria — Itupeva/SP

Landing page do salão. **Etapa atual: fundo animado e abertura (primeira
dobra).** Ainda não há outras seções, menu ou agendamento.

## Arquivos

```
index.html                a abertura
assets/css/style.css      variáveis, degradê animado, grão, abertura
assets/js/abertura.js     timeline de entrada (mask reveal)
assets/js/gsap.min.js     GSAP 3.13.0, hospedado aqui
assets/img/logo-lili.svg  logo da marca
```

Abrir `index.html` direto no navegador. Não há build, framework ou dependência
além das duas fontes do Google Fonts.

## Identidade

Logo Art Déco (mulher dos anos 1920 com chapéu) e nome em serifada Didone.

| Cor          | Hex       | Variável          |
| ------------ | --------- | ----------------- |
| Pêssego      | `#FFC06A` | `--cor-pessego`   |
| Ferrugem     | `#D95A21` | `--cor-ferrugem`  |
| Preto quente | `#16110E` | `--cor-preto`     |
| Ouro fosco   | `#C89B5A` | `--cor-ouro`      |
| Creme        | `#F3E4CE` | `--cor-creme`     |

Tipografia: **Bodoni Moda** (display, itálico) e **Jost** (corpo e utilidades —
desenhada a partir da Futura de 1927, do mesmo período da marca).

## Variáveis disponíveis para as próximas etapas

Declaradas em `:root`, em `assets/css/style.css`:

- **Paleta**: as cinco acima.
- **Papéis semânticos** — preferir estes ao escrever novas seções:
  `--fundo`, `--texto`, `--texto-suave`, `--destaque`, `--acento`, `--linha`.
- **Tipografia**: `--fonte-display`, `--fonte-corpo`, `--peso-display`,
  `--peso-corpo`, `--peso-medio`, `--tracking-largo`, `--tracking-medio`.
- **Ritmo**: `--espaco-1` … `--espaco-4`, `--margem-lateral`, `--largura-max`.
- **Movimento**: `--ciclo-fundo`. O ritmo da entrada fica em `DURACAO` e
  `PASSO`, no topo de `assets/js/abertura.js`.
- **Leitura sobre o fundo**: `--veu-centro`, `--veu-meio`, `--veu-borda`,
  `--halo-forte`, `--halo-leve`.

## O fundo

Degradê linear a −45° com as quatro cores da identidade — `#16110E`,
`#D95A21`, `#FFC06A`, `#C89B5A` —, dimensionado em 400% × 400%, com a
`background-position` deslocando num ciclo de 15s
(`0% 50%` → `100% 50%` → `0% 50%`). É estado fixo: nenhuma interação o altera.

Por cima, o grão de verniz a 5%: ruído SVG embutido como data URI em
`body::after`, sem requisição extra.

Animar `background-position` repinta a camada a cada quadro, em vez de compor na
GPU. É uma decisão tomada e aceita: a técnica foi mantida deliberadamente.

Com `prefers-reduced-motion: reduce`, a animação é desligada e o degradê fica
estático.

O `html` recebe `background-color` como rede de segurança: o degradê é
dimensionado pela caixa do `body`, então qualquer área além dela — a barra do
navegador móvel se recolhendo, por exemplo — apareceria branca sem isso.

## A abertura

Ocupa a altura da tela, com o conteúdo centralizado nos dois eixos: a logo, a
frase principal em duas linhas — a primeira em display grande, a segunda de
apoio, menor — e o botão **Agendar horário**, ainda com `href="#"` até o
destino ser definido.

O contraste sobre o fundo animado vem de um véu radial translúcido
(`.abertura::before`), nunca de um bloco sólido. A queda de opacidade é
contínua e mais larga que a viewport: um platô seguido de queda rápida faz o
olho enxergar um oval, e é isso que se evita aqui.

Como o véu é claro, a legibilidade vem sobretudo de um halo (`text-shadow`)
que escurece só o entorno imediato das letras, sem desenhar forma na tela.
Medido na fase mais clara do ciclo — o pior caso — contra o anel de pixels
ao redor dos glifos:

| elemento | contraste | mínimo |
| --- | --- | --- |
| frase principal (texto grande) | 3,47:1 | 3:1 |
| linha de apoio | 3,31:1 | 4,5:1 ⚠️ |
| botão (fundo próprio) | 4,76:1 | 4,5:1 |

> **Pendente:** a linha de apoio não alcança o mínimo. É consequência direta de
> clarear o véu, decisão tomada por gosto. Os caminhos são escurecer o véu de
> volta (`--veu-centro`), aumentar o corpo da linha, ou aceitar o desvio.

O botão tem alvo de toque de 48px (`--toque-min`) e foco de teclado visível via
`:focus-visible`.

## A logo

`assets/img/logo-lili.svg` é a logo da marca, dimensionada pela largura
(`min(76vw, 26rem)`) com altura automática. O `aspect-ratio` no CSS, junto dos
atributos `width`/`height` no HTML, reserva a caixa antes do arquivo chegar,
para a página não pular durante o carregamento.

O arquivo é um SVG apenas na embalagem: dentro há um bitmap. O original tinha
duas imagens PNG embutidas em base64 — uma de cor e uma de luminância usada
como máscara de transparência — somando 621 KB. Foram compostas numa única PNG
com canal alfa de verdade, recortada nas margens vazias e reduzida a 256 cores:
**87 KB, 86% menor**, com erro médio de cor de 3,17/255 (imperceptível). Não
havia retângulo de fundo nem metadados de editor a remover; o peso era o bitmap.

> **Pendente de decisão:** as palavras *Esmalteria* e *BELEZA · ESTÉTICA ·
> PRESENTES* são pretas (`rgb(3,1,1)`) e somem sobre o fundo — contraste medido
> entre 1,98:1 e 2,85:1, contra o mínimo de 3:1. O *Lili* em ferrugem fica ainda
> pior, entre 1,50:1 e 2,16:1, porque o fundo é da mesma família de cor. Nenhuma
> cor foi alterada, à espera de definição.

## A entrada (mask reveal)

Cada bloco — a logo e as duas linhas da frase — vive dentro de um `.mascara`
com `overflow: hidden`. O conteúdo nasce 110% abaixo, fora da área visível da
máscara, e sobe até a posição final: emerge por trás da cortina, em vez de
aparecer por transparência. O botão não é texto e entra só com opacidade.

Uma timeline única do GSAP conduz a sequência, com sobreposição negativa entre
os blocos para ler como um movimento só: cada bloco parte 0,38s depois do
anterior (`PASSO`) enquanto leva 1,4s para subir (`DURACAO`), então os
movimentos convivem na tela. Fecha em ~2,4s. Só `transform` e `opacity`, com
easing `power2.out` — numa duração longa, a curva do `power3` concentra o
percurso no início e o fim arrasta.

O estado inicial fica no CSS, nunca no JavaScript, para nada piscar antes de
animar. A classe `js` no `<html>` garante que sem JavaScript a página nasça
inteira, e uma trava de 5s pula a timeline para o fim caso os quadros nunca
cheguem. Com `prefers-reduced-motion`, tudo aparece no estado final de imediato.

## Próximo passo

Seção de agendamento: a cliente escolhe serviço, dia e período, e a mensagem
chega pronta no WhatsApp da dona. É o destino do botão da abertura.
