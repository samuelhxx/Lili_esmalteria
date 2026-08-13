# Lili Esmalteria — Itupeva/SP

Landing page do salão. **Etapa atual: fundo animado, abertura, serviços,
galeria e agendamento.** Falta o número do WhatsApp e as fotos.

## Arquivos

```
index.html                     abertura + serviços + galeria + agendamento
assets/css/style.css           variáveis, fundo e todas as seções
assets/js/abertura.js          timeline de entrada (mask reveal)
assets/js/servicos.js          cartões, troca de painel, entrada no scroll
assets/js/glitter.js           textura de glitter e deriva por inércia
assets/js/galeria.js           painel ativo da galeria e entrada no scroll
assets/js/agendamento.js       os três passos e a mensagem do WhatsApp
assets/js/fluidez.js           rolagem das âncoras e travessia entre seções
assets/js/gsap.min.js          GSAP 3.13.0, hospedado aqui
assets/js/ScrollTrigger.min.js plugin do GSAP, hospedado aqui
assets/img/logo-lili.svg       logo da marca
```

A marcação das seções geradas sai de `ferramentas/`: `gera_servicos.py` guarda
a tabela de preços e desenha os seis ícones das categorias; `gera_galeria.py`
monta os seis painéis da galeria; `gera_agendamento.py` monta os três passos —
e importa a tabela do `gera_servicos.py` em vez de repeti-la, para não existir
uma segunda cópia dos 29 serviços envelhecendo sozinha. Mudar preço, serviço
ou painel é mudar o script e gerar de novo — assim as linhas não divergem no
formato.

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

### O glitter suspenso

Por cima do degradê, e por baixo do conteúdo, uma textura de cacos de
purpurina. Duas decisões explicam por que não parece bolinha:

**Forma.** Ruído por pixel produz grão quadrado de 1px que o antialiasing
arredonda — vira bolinha. Aqui cada partícula é um quadrilátero irregular,
com raios diferentes em cada vértice e achatamento variável: sai torto, com
cantos vivos, e parte deles alongado como lasca. Caco de purpurina tem faceta.

**Nitidez.** Textura de ruído é rasterizada em pixels de CSS e, numa tela de
2x ou 3x, cada grão é esticado e borra. Os cacos são caminhos vetoriais dentro
de um ladrilho SVG, então o navegador rasteriza na densidade real do aparelho
e eles ficam nítidos em qualquer tela. O piso de tamanho também não desce de
~1,5px: abaixo disso o caco cai sob um pixel em tela 1x e o antialiasing o
arredonda de volta.

A massa continua sendo **textura repetida, não elemento no DOM** — são
milhares de cacos por tela, e como elementos isso seria impraticável. Cada
ladrilho traz de 255 a 440 cacos, agrupados por cor e opacidade para o arquivo
não triplicar de tamanho; os três somam 89 KB de data URI, gerados em memória
e sem custo de rede.

**A concentração é desigual de propósito:** em vez de espalhar por igual,
sorteiam-se nove núcleos por ladrilho e os cacos caem em volta deles, com
desvio variado. Purpurina não se distribui em tapete uniforme. Os ladrilhos
têm lados diferentes — 263, 341 e 421px — para as repetições nunca
coincidirem e desenharem grade.

Sete por cento dos cacos são grandes e mais opacos: são os que pegam a luz.
A presença da textura é medida diferenciando a página com e sem a camada — os
números estão mais abaixo, junto da rampa de profundidade. Vale notar que essa
medida depende da fase do degradê no momento da captura: sobre a parte escura
do ciclo os cacos destacam bem mais que sobre a clara, então só faz sentido
comparar duas versões capturadas na mesma fase.

**As centelhas** — 24 elementos, os únicos do DOM — são cacos maiores que
acendem e apagam em ciclos de 3,2s a 8,5s, fora de fase, apagados na maior
parte do tempo. São também as únicas que giram, pelo motivo explicado
adiante.

**O pó dentro do vidro.** A intenção é a de agitar um vidro de esmalte com
glitter: o gesto mexe o pó, o pó reage, e demora um instante para assentar.
Cinco comportamentos, todos em `transform` e `opacity`.

**1. Contramão.** As partículas vão para o lado oposto do conteúdo. Rolando
para baixo o conteúdo sobe e o glitter **desce**, cruzando com tudo o que se
move na tela. Não é paralaxe de velocidade diferente: é sinal trocado. Medido,
rolando para baixo as camadas dão `+38, +67, +102, +143`; para cima, os mesmos
números negativos.

**2. Inércia.** O deslocamento é proporcional à velocidade do gesto, não à
posição da rolagem — gesto rápido move muito, gesto lento move pouco, coisa
que a posição não sabe distinguir. Quando o dedo para, o pó continua e
desacelera sozinho. E o repouso é sempre zero, então nada acumula deriva ao
longo da página.

| gesto | vertical (fundo → frente) | lateral | giro | espalhamento | assenta em |
| --- | --- | --- | --- | --- | --- |
| lento (300 px/s) | 9, 15, 21, 28 px | até 3px | 3° | 2px | 0,72s |
| médio (1080 px/s) | 32, 53, 76, 100 px | até 17px | 12° | 8px | 0,97s |
| rápido (2400 px/s) | 72, 119, 168, 223 px | até 34px | 26° | 17px | 1,14s |

No pico de um gesto rápido a camada da frente desloca 223px numa tela de
900px — 25% da altura. Entre a página em repouso e o pico, **4,5% dos pixels
da tela mudam**.

**3. Deriva lateral.** Uma onda de lado, com período e fase próprios por
camada, para as partículas não parecerem correndo num trilho reto. A amplitude
acompanha o quanto a camada está deslocada: parada, a camada não fica
balançando sozinha.

**4. Giro.** O ladrilho não pode girar — a repetição mostraria as emendas —,
então a rotação vive nas centelhas, que são elementos de verdade no DOM. Só um
terço delas gira de fato; girar todas viraria engrenagem.

**5. Espalhamento na frenagem.** Quando a posição fica adiante do alvo, a
camada está voltando: é o momento de assentar. Aí as centelhas se abrem, cada
uma na sua direção, antes de pousar.

### Os números, para calibrar

Tudo no topo do bloco de deriva em `assets/js/glitter.js`:

| constante | valor | o que faz |
| --- | --- | --- |
| `GANHO` | `0.12` | segundos: converte px/s de rolagem em px de deslocamento |
| `teto` | `min(185, altura × 0.21)` | limite do deslocamento, preso à tela |
| `FATORES` | `0.45, 0.72, 1, 1.3` | profundidade: fundo → frente → centelhas |
| `LATERAL` | `14, 22, 32, 40` px | amplitude da onda de lado no deslocamento máximo |
| `PERIODO` | `70, 95, 125, 150` | px de rolagem por radiano da onda |
| `ESPALHA` | `40` px | abertura das centelhas no assentamento |
| `giro` | `±0.12°/px` em 34% delas, `±0.02` no resto | rotação |
| amortecimento | `0.82` por quadro | o quanto a velocidade morre a cada quadro |
| `segue` | `0.06 + fator × 0.045` | o atraso de cada camada em seguir o alvo |

Para **subir a intensidade**, mexer em `GANHO` e `teto` juntos — `GANHO`
sozinho satura no teto. Para **mais lado**, `LATERAL`. Para **assentar mais
devagar**, baixar o amortecimento (0.86 já alonga bastante). Se `teto` subir,
a sobra de `.glitter__camada` no CSS precisa subir junto, senão a borda da
camada aparece na tela.

**A cintilância** vai a dois lampejos com um vinco escuro no meio, e não um
só: a faceta que vira pega a luz duas vezes ao passar pelo ângulo certo. O
pico subiu para 0,78–1 (era 0,55–0,9) e o ciclo encurtou para 3,2–8,5s (era
4,5–11s). São 24 centelhas, de 10 a 19px (eram 18, de 9 a 16px).

**Custo.** Não usa GSAP: é um laço `rAF` que escreve `transform` em 4 camadas
e 24 centelhas e **dorme quando tudo zera** — medido, com a página parada ele
pede zero quadros (os dois por quadro que sobram são do GSAP e já existiam
antes). No pior caso, com os 28 elementos mudando todo quadro, o trabalho de
JS mede **33,5µs**, ou 0,2% do orçamento de 16,7ms. Nada de `scale` nas
camadas de ladrilho: mudar a escala de uma camada composta obriga o navegador
a rasterizar de novo, e é justamente o que não se pode pagar no celular —
translação e rotação nunca pedem nova rasterização.

Como a camada precisou crescer para caber o curso novo (`-34vh -72px` de
sobra, contra `-16vh 0`), a contagem de cacos por ladrilho desceu para
255/355/440 (era 300/420/520): mais área de pintura, menos coisa por ladrilho.
O peso dos três data URIs caiu de 102 KB para 89 KB.

Medida a folga da borda nos três formatos, no pico do gesto — retrato 400×760,
retrato alto 500×900 e celular deitado 740×360 —, a borda mais próxima ainda
fica 18px fora da tela.

Com `prefers-reduced-motion`, tudo isso desliga: `transform: none` nas quatro
camadas, cintilância parada e as centelhas fixas em 0,28 de opacidade.

O `html` recebe `background-color` como rede de segurança: o degradê é
dimensionado pela caixa do `body`, então qualquer área além dela — a barra do
navegador móvel se recolhendo, por exemplo — apareceria branca sem isso.

## A abertura

Ocupa a altura da tela, com o conteúdo centralizado nos dois eixos: a logo, a
frase principal em duas linhas — a primeira em display grande, a segunda de
apoio, menor — e o botão **Agendar horário**, que leva à seção de agendamento
(`href="#agendar"`).

**Não há véu por trás da abertura.** Qualquer camada escura ali apaga a cor
do fundo animado, que é o ponto da página. A legibilidade fica por conta de um
halo (`text-shadow`) mais fechado que o das outras seções — ele escurece só o
entorno imediato das letras, sem desenhar forma na tela — e, no caso do botão,
do fundo do próprio controle.

Medido na fase mais clara do ciclo, o pior caso, contra o anel de pixels ao
redor dos glifos:

| elemento | antes (com véu) | agora (sem véu) | mínimo |
| --- | --- | --- | --- |
| frase principal (texto grande) | 3,47:1 | 3,19:1 | 3:1 |
| linha de apoio | 3,31:1 | 2,31:1 | 4,5:1 ⚠️ |
| botão | 4,76:1 | 5,96:1 | 4,5:1 |

> **Pendente:** a linha de apoio é o que mais sofre sem o véu. Texto pequeno em
> creme sobre o degradê claro não alcança 4,5:1 só com sombra; seria preciso
> escurecê-la, aumentar o corpo, ou devolver alguma camada por trás. Registrado
> como desvio conhecido.

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

## Serviços e preços

Título em Bodoni Moda e dois momentos, nesta ordem.

**Primeiro, escolher.** A seção abre com as seis categorias visíveis de uma
vez — grade de duas colunas no celular, três a partir de 640px — e nenhum
preço na tela. Nada vem selecionado. A barra que rolava na horizontal foi
removida: o problema dela era exatamente esconder categorias fora da tela.

**Depois, os preços.** Tocar numa categoria abre a lista logo abaixo; tocar na
mesma de novo fecha e volta ao estado de escolha. O cartão ativo ganha filete
dourado firme, fundo mais destacado e o ícone em pêssego.

**O convite ao toque.** Cartão com ícone e nome não parece clicável: dá para
passar a seção inteira sem perceber que os preços estão atrás dele. Então cada
cartão carrega uma pílula de filete dourado — "Ver valores" e uma seta — e a
seção abre com a linha "Toque numa categoria para ver os valores.". Aberto, o
rótulo vira "Ocultar valores" e a seta gira 180°: quem já tocou vê que o mesmo
toque fecha. A pílula fica presa no rodapé do cartão (`margin-top: auto`),
senão um nome de duas linhas — "Coloração e tratamento" — empurraria só a dele
para baixo e a fileira sairia desalinhada; medido, os topos da fileira agora
coincidem no pixel (285/285, 429/429, 588/588).

Não é mais um `tablist`: sem seleção inicial e com fechar disponível, o padrão
correto é divulgação (`aria-expanded` no cartão, `role="region"` no painel), e
é isso que o leitor de tela anuncia. As setas andam pela grade, respeitando o
número de colunas de cada largura.

**As transições.** A lista sobe com deslocamento curto e desaceleração longa,
e as linhas entram em cascata de 40ms. Ao trocar de categoria, a que sai desce
enquanto a que entra já sobe — os movimentos se cruzam, sem corte seco nem
área vazia. A altura do contêiner é animada junto: é a única coisa aqui que
não dá para resolver com `transform`, já que escalar a caixa distorceria o
texto.

**A rolagem** só acontece se o começo da lista estiver fora de vista, e só o
necessário para trazê-lo — nunca arrasta a página sem motivo.

**Contraste.** O véu desta seção é mais fechado que o da abertura. São 29
linhas em corpo pequeno, e não uma frase solta: medido na fase mais clara do
ciclo, com o véu da abertura o nome do serviço dava 3,79:1. Com o véu próprio,
a lista fica em **5,53:1** e a barra de abas em **7,77:1**, contra o mínimo de
4,5:1.

**Teclado.** Setas navegam entre as abas, Home e End vão às pontas, o foco é
visível e `aria-selected` acompanha a seleção. Com `prefers-reduced-motion`,
tudo aparece sem movimento.

## Galeria

Porte fiel de um componente de referência em React com Tailwind. O painel
ativo abre em `flex: 4` contra `flex: 1` dos outros; os tempos, curvas,
proporções e opacidades são os do original:

| | valor |
| --- | --- |
| altura do trilho | 500px no celular, 600px a partir de 768px |
| direção e espaçamento | coluna com 8px; linha com 16px em tela maior |
| transição de `flex` e `filter` | 700ms, `cubic-bezier(0.25, 1, 0.5, 1)` |
| brilho | ativo 100%, inativo 50%, 75% ao passar o mouse |
| imagem | `object-cover`, transform em 1000ms, escala 1 ativo / 1,1 inativo |
| véu de leitura | preto 80% → transparente, opacidade 1/0, 500ms |
| conteúdo ativo | 500ms, de `translateY(48px)` e opacidade 0, atraso 200ms |
| rótulo inativo | opacidade 1 com atraso de 500ms; ao ativar, opacidade 0 e escala 0,5 |
| cantos | 16px |

**As transições ficam em CSS, não em GSAP.** É o mecanismo do original — as
classes do Tailwind são `transition-*`. Recriá-las em GSAP trocaria curvas
exatas por aproximações, que é justamente o que não se queria. O GSAP entra na
entrada da seção pelo scroll, e o JavaScript só troca qual painel está ativo,
via `aria-pressed`; o CSS reage a isso.

Adaptações: borda em ouro fosco a 28% no lugar do cinza neutro, título em
Bodoni Moda no lugar do peso pesado, chamada **Ver trabalhos** e seta em SVG
de traço fino, no mesmo sistema dos ícones das abas.

**As fotos ainda não existem.** Cada painel já traz o `<img>` com
`loading="lazy"`, `alt` descritivo e proporção 1200×1600 — falta só o `src`,
e há comentário no HTML marcando o lugar. Sem `src`, a imagem se esconde
(`img:not([src])`) e aparece um espaço reservado com moldura em linha fina.

Um painel está sempre ativo, o terceiro começa aberto, e os painéis são
navegáveis por Tab e pelas setas — chegar pelo teclado já abre o painel, para
quem navega assim ver o mesmo que quem passa o mouse. Com
`prefers-reduced-motion`, os painéis ficam do mesmo tamanho e nada se move.

## Agendamento

Nenhum campo, nenhuma borda cinza, nenhum `select`: a visitante toca em
opções, no mesmo vocabulário do resto da página — cartão, pílula, filete
dourado, Bodoni e Jost. Três passos, um aberto de cada vez.

**O progresso** são três traços finos com o rótulo em Jost caixa alta bem
pequena. Concluída em ouro fosco, atual em pêssego, futura só com o filete.
Sem número e sem círculo: o preenchimento do filete já diz onde ela está, e
`aria-current="step"` diz o mesmo ao leitor de tela.

**Passo 1 — o serviço.** Os mesmos seis cartões da seção de preços, com os
mesmos ícones. **Escolhida a categoria, as outras cinco somem:** no lugar da
grade entra uma linha compacta com o ícone e o nome — mesmo desenho da linha
de resumo dos passos, porque faz a mesma coisa — e os serviços logo abaixo
dela. Antes os seis cartões ficavam, e a lista nascia embaixo de três fileiras:
dava para tocar numa categoria e não ver nada acontecer, porque o que abriu
estava fora da tela. Medido, as pílulas subiram cerca de 370px, e as seis
categorias passam a caber inteiras na tela de 400×760 — a mais alta, Unhas em
Gel com sete serviços, vai de 272 a 732px. Tocar em "Trocar" devolve a grade.

Escolhido o serviço, o passo recolhe numa linha com filete dourado ao lado do
nome; tocar nela reabre a escolha.

**Passo 2 — quando.** Os seis dias em pílulas que quebram em duas linhas no
celular — nunca rolagem lateral, porque a opção que fica fora da tela é a
opção que não existe. Depois os três períodos, cada um com a faixa de horário
por baixo. O salão atende das 8h às 20h, e as três faixas cobrem exatamente
esse intervalo. O passo só recolhe quando as duas perguntas têm resposta.

**Passo 3 — confirmar.** O resumo em Bodoni, com losango pequeno em ferrugem
entre os três itens, e o botão do WhatsApp com o ícone em traço fino — mesma
viewBox 24×24 e mesmo traço 1.5 dos outros seis.

**As transições.** O que entra começa antes de o anterior terminar de sair
(`SOBREPOE`, 24% da duração), então em nenhum quadro existe área vazia entre
os dois. Resumo e corpo dividem a mesma célula do grid: um nasce exatamente
onde o outro estava. A altura só é escrita durante a troca e volta a `auto`
logo depois — assim a lista que abre dentro do passo 1 faz o passo crescer
sozinho, sem ninguém remedir nada. Voltando, o mesmo movimento roda ao
contrário.

**O foco acompanha.** Recolher um passo esconde o elemento focado, e o foco
voltaria ao `<body>` — quem responde pelo teclado perderia o lugar. Então,
quando o foco estava dentro da seção, ele vai para o primeiro controle do
passo que abriu, com `preventScroll` para não brigar com a rolagem suave.

**Ainda falta o número.** O botão é âncora vazia de propósito. O número entra
na constante `NUMERO` no topo de `assets/js/agendamento.js`, em formato
internacional e só dígitos (`55` + DDD + número). A frase já sai pronta de
`montarMensagem()`:

> Oi! Gostaria de agendar Volume brasileiro para quinta-feira, no período da
> tarde.

Enquanto `NUMERO` estiver vazia o link não navega, mas a mensagem já é escrita
em `data-mensagem` do botão — dá para conferir pelo inspetor. Preenchido o
número, o `href` passa a sair como `https://wa.me/<numero>?text=<mensagem>`.
Os três períodos pedem "da", então a regência não muda com a escolha.

## Fluidez

Revisão de movimento do site inteiro, medida no navegador. O que foi
encontrado e o que mudou:

**A âncora saltava.** O botão da abertura pulava 2304px de uma vez. Agora rola
animada, 1,2s com `expo.out` — quase toda a duração é desaceleração, que é a
sensação de deslizar até parar. Medido, a curva passa por 1863px em 25% do
tempo e gasta os últimos 400px freando.

O `scroll-behavior: smooth` do CSS resolveria em uma linha, mas tem duração
curta e fixa. Ele fica como reserva para quem está sem JS, em
`html:not(.js)` — com JS ele brigaria com a animação, suavizando cada quadro
dela.

Duas coisas que sequestrar âncora costuma quebrar, e que ficaram cobertas: o
gesto da visitante (roda, toque, setas, PageUp/Down, Home/End) cancela a
animação na hora, e o foco vai para o destino no fim, senão quem chega pelo
teclado fica com o foco no link de origem e o Tab seguinte volta ao topo.

**Metade do site aparecia sem preparação.** Só o título entrava na galeria e no
agendamento — os seis painéis e toda a máquina de passos já estavam plantados
na tela quando a seção chegava. Agora entram atrás do título: os painéis em
cascata de 60ms, o progresso e a pilha de passos em 120ms. A máscara de reveal
não serve a eles (o corte apareceria nas bordas arredondadas), então usam
`.entra-adiada` — sobem 26px e clareiam.

**Cartão, pílula e resumo não devolviam nada ao dedo.** Só o botão da abertura
tinha `:active`. No celular não existe hover, então tocar num cartão não dava
retorno nenhum até a animação seguinte começar. Agora os três respondem com
`scale(0.97)` em 120ms — `transform` puro, sem layout.

**A travessia entre seções** ganhou um deslocamento curto preso ao scroll no
título de cada uma, 14px para cada lado. É deliberadamente pequeno: não é para
ser visto, é para ser sentido. Acima disso vira exibição e compete com a
leitura.

### Sobre scroll suavizado global (Lenis e equivalentes)

Avaliado e **descartado**, pelos critérios do próprio projeto:

- No celular — a prioridade — o Lenis não suaviza toque por padrão
  (`syncTouch: false`), justamente porque substituir o momentum nativo piora a
  sensação. Ou seja: na plataforma que mais importa ele não faria nada.
- Ligado no toque, quebra o recolher da barra de endereço do navegador móvel e
  o rubber-band, e passa a rodar um laço de interpolação por cima de um fundo
  que já repinta a tela inteira a cada quadro.
- O peso e a inércia vêm da deriva do glitter e da âncora com desaceleração
  longa, sem sequestrar a rolagem de ninguém.

### Um desvio conhecido

A galeria anima `flex`, o que recalcula o layout dos seis painéis a cada
quadro — é o único lugar do site que anima layout, e o candidato natural a
engasgar em aparelho fraco. Foi mantido de propósito: o componente foi portado
com a instrução de reproduzir fielmente todos os valores, e trocar por
`transform: scale` mudaria a geometria dele. Fica registrado para trocar se
aparecer travamento real no aparelho.

### A travada na troca de passo

Relatada como "corte seco, travando" ao escolher o serviço e passar para o
passo seguinte. Eram duas causas, as duas medidas.

**1. A rolagem mirava num layout que deixava de existir.** No instante do
toque, o passo que sai ainda está com a altura cheia e o que entra ainda está
com altura zero — e era desse layout transitório que saía o destino da
rolagem. Medido: o alvo antigo ficava **408px abaixo** de onde o passo
realmente ia parar. A página passava meio segundo rolando para baixo enquanto
o conteúdo subia por baixo dela. Duas coisas discordando é exatamente o que se
sente como travada.

Agora o destino é medido no futuro: aplica-se o estado final, lê-se onde o
passo vai parar, e desfaz-se — tudo num bloco síncrono, sem pintura no meio,
então nada pisca. Com o alvo certo, o caso comum passou a **não rolar nada**:
medido numa tela de 400×760, o passo 2 pousa a 318px do topo, dentro da faixa
visível, e a página fica parada. Antes ela se mexia sem precisar.

Junto disso, a rolagem deixou de ser `scrollTo({behavior:"smooth"})` e virou um
tween do GSAP com a mesma duração e a mesma curva da animação de altura. O
suave nativo tem tempo e curva próprios: dois movimentos simultâneos governados
por relógios diferentes nunca chegam juntos. A mesma troca foi feita na seção
de preços, que tinha o mesmo arranjo.

**2. Cinquenta e duas superfícies com `backdrop-filter`.** Cartões, pílulas e
resumos pediam `blur(8px)` do fundo — 46 deles só no agendamento. Cada um
obriga o navegador a fotografar e desfocar o fundo a cada quadro, e o fundo
desta página muda a cada quadro por definição.

Medido o que isso entregava: renderizando a seção com e sem, **0,38% dos
pixels diferem**, com média de 0,177 nível sobre a tela. O motivo é simples —
o que está atrás é um degradê liso, e borrar degradê é quase a operação
identidade. O que o blur borrava de fato eram os cacos de glitter. Saiu.

Ficaram só os 6 do `.painel-foto__pilula` da galeria, que são do porte fiel do
componente e ficam sobre foto, não sobre o degradê.

**3.** Durante a troca, as duas faces recebem `will-change: transform, opacity`
e o perdem no fim. Elas carregam texto com halo — `text-shadow` em várias
camadas —, e sem a promoção cada passo da opacidade repinta esse texto inteiro.
Permanente seria pior: camada de sobra ocupa memória sem motivo.

Vale registrar o que **não** era o problema: o custo de layout da altura
animada mede 241µs por quadro, com ou sem `backdrop-filter` (241 contra 267,
diferença dentro do ruído). Animar altura é layout, mas neste tamanho de
subárvore não é o que trava.

### Segunda rodada na travada

Depois de corrigir a rolagem e tirar o `backdrop-filter`, a troca de passo
ainda foi relatada como travada. O que se mediu nesta rodada:

**O layout não é o gargalo.** Animar a altura do passo custa **90µs por
quadro** — e trocar o `display: grid` por `block` (113µs) ou pôr as faces em
`position: absolute` (125µs) só piorou. A teoria de que o grid estava
relayoutando os 111 nós do passo a cada quadro estava errada, e a reescrita
que ela pedia teria sido trabalho perdido.

O que mudou de fato:

- **A lista deixou de nascer fora da tela.** Era o efeito mais parecido com
  "travar": tocar numa categoria e não ver resposta, porque a resposta estava
  abaixo da borda. Some a grade, entra a linha compacta.
- **A altura que se anima encolheu.** Com a grade fora, o corpo do passo 1 vai
  de 428px para 241px — a animação de recolher tem quase metade do curso.
- **`contain: layout paint`** no passo e na escolha: sem isso, cada quadro da
  altura convida o navegador a reconsiderar layout e pintura de fora também.

**Não foi possível medir pintura e composição neste ambiente** — o headless
sem tela não entrega tempo de quadro confiável. As decisões de pintura
(`backdrop-filter`, véu, `contain`) foram tomadas por argumento e pela medida
do que cada uma entregava em pixels, não por perfil de quadro.

### Os véus

Clareados a pedido. O radial de fundo das seções de preços e de agendamento
foi de `0.68 / 0.52 / 0.30 / 0.12` para `0.50 / 0.37 / 0.20 / 0.07` — cerca de
26% mais claro. Medido depois da mudança, na fase mais clara do ciclo (o pior
caso), o nome do serviço dá **5,85:1** contra o mínimo de 4,5:1. Há folga para
clarear mais se ainda estiver escuro demais.

## Próximo passo

Preencher `NUMERO` em `assets/js/agendamento.js` com o WhatsApp da dona e
colocar as fotos da galeria.
