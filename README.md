# Lili Esmalteria — Itupeva/SP

Landing page do salão. **Etapa atual: somente o fundo.** A página não tem
conteúdo — nem texto, nem seções, nem menu. Só a camada de fundo, a paleta em
variáveis CSS e as fontes carregadas para as próximas etapas.

## Arquivos

```
index.html            <body> vazio: só o fundo
assets/css/style.css  variáveis, degradê animado, grão
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
desenhada a partir da Futura de 1927, do mesmo período da marca). As duas já
estão carregando, ainda que nenhum texto as use nesta etapa.

## Variáveis disponíveis para as próximas etapas

Declaradas em `:root`, em `assets/css/style.css`:

- **Paleta**: as cinco acima.
- **Papéis semânticos** — preferir estes ao escrever novas seções:
  `--fundo`, `--texto`, `--texto-suave`, `--destaque`, `--acento`, `--linha`.
- **Tipografia**: `--fonte-display`, `--fonte-corpo`, `--peso-display`,
  `--peso-corpo`, `--peso-medio`, `--tracking-largo`, `--tracking-medio`.
- **Ritmo**: `--espaco-1` … `--espaco-4`, `--margem-lateral`, `--largura-max`.
- **Movimento**: `--ciclo-fundo`.

## O fundo

Degradê linear a −45° com as quatro cores da paleta, dimensionado em
400% × 400%, com a `background-position` deslocando num ciclo de 15s
(`0% 50%` → `100% 50%` → `0% 50%`).

Os stops estão deslocados para o escuro: o preto quente ocupa de 0% a 44% e de
76% a 100% da linha do degradê, e ferrugem, pêssego e ouro passam como uma
brasa estreita no meio. Medido ao longo do ciclo, o fundo tem luminância média
de 72 (de 255), variando entre 22 e 137 — escuro na maior parte do tempo, com a
brasa atravessando a tela em diagonal.

Por cima, o grão de verniz a 5%: ruído SVG embutido como data URI em
`body::after`, sem requisição extra.

Animar `background-position` repinta a camada a cada quadro, em vez de compor na
GPU. É uma decisão tomada e aceita: a técnica foi mantida deliberadamente.

Com `prefers-reduced-motion: reduce`, a animação é desligada e o degradê fica
estático.

O `html` recebe `background-color` como rede de segurança: o degradê é
dimensionado pela caixa do `body`, então qualquer área além dela — a barra do
navegador móvel se recolhendo, por exemplo — apareceria branca sem isso.

## Próximo passo

Colocar conteúdo por cima do fundo, usando os papéis semânticos e a escala de
espaçamento já definidos.
