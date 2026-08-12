# Lili Esmalteria — Itupeva/SP

Landing page do salão. **Etapa atual: fundo animado, abertura e serviços.**
Ainda não há menu nem agendamento.

## Arquivos

```
index.html                     abertura + serviços
assets/css/style.css           variáveis, fundo, abertura, serviços
assets/js/abertura.js          timeline de entrada (mask reveal)
assets/js/servicos.js          abas, troca de painel, entrada no scroll
assets/js/glitter.js           textura de glitter e paralaxe
assets/js/galeria.js           painel ativo da galeria e entrada no scroll
assets/js/gsap.min.js          GSAP 3.13.0, hospedado aqui
assets/js/ScrollTrigger.min.js plugin do GSAP, hospedado aqui
assets/img/logo-lili.svg       logo da marca
```

A marcação das seções geradas sai de `ferramentas/`: `gera_servicos.py` guarda
a tabela de preços e desenha os seis ícones das abas; `gera_galeria.py` monta
os seis painéis da galeria. Mudar preço, serviço ou painel é mudar o script e
gerar de novo — assim as linhas não divergem no formato.

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
ladrilho traz de 300 a 520 cacos, agrupados por cor e opacidade para o arquivo
não triplicar de tamanho; os três somam 102 KB de data URI, gerados em memória
e sem custo de rede.

**A concentração é desigual de propósito:** em vez de espalhar por igual,
sorteiam-se nove núcleos por ladrilho e os cacos caem em volta deles, com
desvio variado. Purpurina não se distribui em tapete uniforme. Os ladrilhos
têm lados diferentes — 263, 341 e 421px — para as repetições nunca
coincidirem e desenharem grade.

Medida a diferença entre a página com e sem a camada, o glitter toca **4,7%
dos pixels**, com diferença máxima de 100 níveis nos cacos maiores e média de
0,57. Sete por cento deles são grandes e mais opacos: são os que pegam a luz.

**As centelhas** — 18 elementos, os únicos do DOM — são cacos maiores que
acendem e apagam em ciclos de 4,5s a 11s, fora de fase, apagados na maior
parte do tempo.

**Sem deriva:** glitter preso no esmalte não flutua. O paralaxe do scroll
continua por camada, percorrendo −16, −34, −52 e −70 px do topo ao fim da
página. Com `prefers-reduced-motion`, o glitter fica estático: sem cintilância
e sem paralaxe.

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

## Serviços e preços

Título em Bodoni Moda e um `tablist` com seis categorias. A barra é uma
pílula com fundo translúcido e `backdrop-filter`, deixando o degradê aparecer
por trás; os rótulos em Jost, caixa alta, com `--tracking-medio`.

**O destaque da aba ativa** é um bloco só, que desliza entre as posições com
mola suave (`back.out(1.5)`). Sua largura é fixa em 100px e o ajuste a cada
aba vem de `scaleX` — animar `left` e `width` forçaria layout a cada quadro;
assim só `transform` anima.

**No celular** a barra rola na horizontal com o toque arrastando, e a aba
ativa é centralizada mexendo apenas no `scrollLeft` do próprio trilho. Não se
usa `scrollIntoView` aqui: ele arrastaria a página junto, e o scroll da página
não podia ser tocado.

**Os seis ícones** são SVG inline no mesmo sistema: `viewBox` 24×24, traço
1.5, pontas e junções arredondadas, sem preenchimento. Ouro fosco quando
inativos, cor do texto ativo quando selecionados, com transição. São
decorativos (`aria-hidden`), já que o rótulo em texto identifica a aba.

**A troca de painel** é um cruzamento, não um revezamento: a lista que sai
desce perdendo opacidade enquanto a que entra já está subindo. Medida a soma
das opacidades ao longo da troca, ela fica em 1,0 ou acima em todos os
instantes — em nenhum quadro a área fica vazia. O pico do cruzamento é por
volta dos 0,15s. A troca dura o mesmo que o deslize do destaque (0,55s), então
os dois movimentos leem como um gesto só.

**O alinhamento.** As listas ficam empilhadas na mesma célula de um grid
(`grid-area: 1/1`), então a que entra nasce exatamente onde a anterior estava,
igual nas seis categorias. `align-items: start` impede que o painel se estique
até a altura do contêiner, o que permite medir a altura natural de cada
categoria; a altura do contêiner é escrita pelo JS e animada na troca, para a
diferença entre uma lista de dois itens e outra de sete não virar salto. A
altura é a única coisa aqui que não dá para resolver com `transform` —
escalar a caixa distorceria o texto.

**A lista** é um cardápio: nome em Jost leve com `--tracking-curto`, filete
pontilhado em ouro fosco esticando no vão com respiro dos dois lados, e o
valor em Bodoni Moda na cor pêssego, maior que o nome — o `R$` menor e
alinhado ao topo. A observação entre parênteses sai do nome e vira um span
próprio, em corpo menor e cor mais discreta. Sem régua horizontal entre as
linhas: com o pontilhado já estruturando cada linha, um segundo filete vira
grade de planilha.

**A entrada** revela título e barra pela máscara, via ScrollTrigger, uma vez
só (`once: true`). A classe é própria (`.revela-adiada`) e não a `.revela` da
abertura: aquela é liberada pela trava de 5s da timeline da abertura, o que
faria estes blocos aparecerem antes de o scroll chegar neles.

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

## Próximo passo

Seção de agendamento: a cliente escolhe serviço, dia e período, e a mensagem
chega pronta no WhatsApp da dona. É o destino do botão da abertura.
