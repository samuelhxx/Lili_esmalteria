# Lili Esmalteria — Itupeva/SP

Landing page do salão. **Etapa 1: apenas o fundo, a paleta, a tipografia base e o
marcador provisório com o nome.** Sem seções de conteúdo, menu ou outras páginas.

## Arquivos

```
index.html            marcação mínima: camadas de fundo + marcador central
assets/css/style.css  variáveis, camadas do fundo, tipografia
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

- **Paleta**: as cinco acima, mais os tons derivados `--cor-preto-2`,
  `--cor-preto-3` e `--cor-brasa` (usados só para dar profundidade ao fundo).
- **Papéis semânticos** — preferir estes ao escrever novas seções:
  `--fundo`, `--texto`, `--texto-suave`, `--destaque`, `--acento`, `--linha`.
- **Tipografia**: `--fonte-display`, `--fonte-corpo`, `--peso-display`,
  `--peso-corpo`, `--peso-medio`, `--tracking-largo`, `--tracking-medio`.
- **Ritmo**: `--espaco-1` … `--espaco-4`, `--margem-lateral`, `--largura-max`.
- **Movimento**: `--ciclo-base`, `--ciclo-brasa`.

## O fundo

Quatro camadas fixas dentro de `.backdrop`, todas decorativas
(`aria-hidden`, sem eventos de ponteiro):

1. `.backdrop__base` — degradê linear em preto quente com brasas de ferrugem e
   pêssego, superdimensionado e em deriva lenta (18s, ida e volta).
2. `.backdrop__embers` — pulso de opacidade das brasas (15s), fora de fase com a base.
3. `.backdrop__rays` — raios de leque Art Déco em ouro fosco
   (`repeating-conic-gradient` a partir do topo central), mascarados por um
   gradiente radial que os esmaece em direção ao rodapé.
4. `.backdrop__vignette` e `.backdrop__grain` — vinheta e grão de verniz a 5%.

O conceito descrito era um degradê 400% × 400% deslocando `background-position`.
Deslocar `background-position` repinta a camada a cada quadro; aqui o mesmo
efeito vem de uma camada superdimensionada movida por `transform`, composta na
GPU. As únicas propriedades animadas são `transform` e `opacity`.

Com `prefers-reduced-motion: reduce`, todas as animações são desligadas e o
degradê fica estático.

## Próximo passo

Substituir o bloco `.mark` do `index.html` pela logo definitiva quando ela chegar.
