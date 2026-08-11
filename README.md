# Lili Esmalteria — Itupeva/SP

Landing page do salão. **Etapa atual: fundo animado, abertura e cartela de
cores.** Ainda não há menu nem agendamento.

## Arquivos

```
index.html                abertura + cartela (o leque é SVG inline)
assets/css/style.css      variáveis, degradê animado, grão, abertura, cartela
assets/js/abertura.js     timeline de entrada (mask reveal)
assets/js/cartela.js      abertura do leque e a onda de cor
assets/js/gsap.min.js     GSAP 3.13.0, hospedado aqui
assets/img/logo-lili.svg  logo da marca
```

O leque não foi escrito à mão: `ferramentas/gera_leque.py` calcula a geometria
e imprime o SVG, que é colado no `index.html`. Mexer no arco, no número de
gomos ou no festonado é mexer no script e gerar de novo.

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
- **Tema dinâmico** (trocado pela cartela): `--fundo-1` … `--fundo-4`,
  `--tema-texto`, `--tema-contraste`, `--tema-acento`, `--tema-veu-rgb`.
- **Leitura sobre o fundo**: `--veu-centro`, `--veu-meio`, `--veu-borda`,
  `--halo-forte`, `--halo-leve`.

## O fundo

Degradê linear a −45° com as quatro cores da paleta, dimensionado em
400% × 400%, com a `background-position` deslocando num ciclo de 15s
(`0% 50%` → `100% 50%` → `0% 50%`).

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

## A cartela de cores

É um momento da jornada, não um brinquedo: título **Comece pela cor**, texto
de apoio, o leque no centro e — só depois da primeira escolha — a frase
*Gostou desse tom? Leve ele pro seu horário* e o botão **Agendar com essa
cor**, que entram com uma animação suave. Antes disso o bloco nem existe no
DOM acessível (`hidden`). O destino do botão segue sem definir; a cor
escolhida ficará disponível para compor a mensagem de agendamento.

**Tipografia.** Títulos em Bodoni Moda; rótulos e nomes de cor em Jost, caixa
alta, peso leve, com `--tracking-largo` — o mesmo tratamento do `ESMALTERIA`
da abertura. O salto de escala entre título (até 3,5rem) e apoio (até 1,1rem)
é o que cria hierarquia. Nenhum peso ou família fora do `:root`.

**O leque.** Arco de 150°, rebite na base, doze gomos festonados, varetas e
guardas ornamentadas em ouro fosco, filetes no arco e brilho de laca por um
degradê radial ancorado no rebite. A geometria sai de
`ferramentas/gera_leque.py`. Os gomos partem empilhados sobre a guarda
esquerda e abrem em cascata quando a seção entra em cena; o estado fechado
vem do CSS (`rotate(var(--rot))`) e o GSAP anima a própria variável `--rot`,
para não existir um segundo `transform-origin` brigando com o
`transform-box: view-box`.

**A camada de cor.** Ao tocar um gomo, uma camada única cresce do ponto exato
do toque e **permanece** — não é um flash. Ela vive em `z-index: 0`, abaixo do
conteúdo (`z-index: 1`), e entra com opacidade parcial: tinge o fundo em vez
de cobrir a tela, então logo, textos, botão e leque seguem visíveis o tempo
todo. A borda difusa vem do próprio degradê radial, nunca de um círculo de
borda dura. Anima só `transform: scale` e `opacity`, com `will-change`
declarado e `expo.out` — saída rápida, desaceleração longa. A escolha
seguinte tinge por cima, partindo do novo ponto, sem voltar ao estado
anterior.

As variáveis de tema são aplicadas no início do movimento e migram por
transição de 1,05s, a mesma duração da onda: o degradê e os textos são
tingidos progressivamente, acompanhando a frente. A mudança é vista
acontecendo.

**O fundo continua vivo.** O degradê nunca vira cor chapada: os quatro pontos
são o preto quente `#16110E` como âncora, a variação escura, a cor dominante
e a variação clara. Essa última é adaptativa — mistura-se com creme até haver
distância de luminância suficiente contra a âncora, senão uma cor já escura
geraria quatro tons quase iguais (o preto ônix é o caso limite). Medida a
amplitude de luminância do ciclo nas doze, a menor é 0,081; o movimento
sobrevive em todas.

**Legibilidade.** Cada tema escolhe seu par testando as duas combinações
possíveis — véu escuro com texto creme, véu claro com texto preto — contra os
quatro tons de fundo, já tingidos pela camada de cor e cobertos pelo véu.
Fica a que garante o melhor pior caso. Nas doze, o pior é **5,56:1**, contra
o mínimo de 4,5:1.

**O que não muda:** a logo e toda a ferragem do leque em ouro fosco. Os gomos
também mantêm suas cores reais — uma cartela que se tinge não serviria para
escolher cor.

**Acessibilidade.** Cada gomo é `role="button"`, navegável por Tab, acionável
por Enter ou espaço, com `aria-label` da cor, `aria-pressed` marcando a
seleção e foco desenhado no próprio gomo. O nome da cor escolhida é anunciado
por `aria-live`. Com `prefers-reduced-motion`, o leque nasce aberto e a cor
troca sem onda, apenas pela transição.

## Próximo passo

Seção de agendamento: a cliente escolhe serviço, dia e período, e a mensagem
chega pronta no WhatsApp da dona. É o destino do botão da abertura.
