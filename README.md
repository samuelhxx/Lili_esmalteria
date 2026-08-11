# Lili Esmalteria — Itupeva/SP

Landing page do salão. **Etapa atual: fundo animado + abertura (primeira
dobra).** Ainda não há outras seções nem menu.

## Arquivos

```
index.html            abertura: marca, frase e botão
assets/css/style.css  variáveis, degradê animado, grão, abertura
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

Ocupa a altura da tela, com o conteúdo centralizado nos dois eixos: marca
(`Lili` em Bodoni Moda itálica + `ESMALTERIA` em Jost espaçada), frase
principal em duas linhas — a primeira em display grande, a segunda de apoio,
menor — e o botão **Agendar horário**, ainda com `href="#"` até o destino ser
definido.

O contraste sobre o fundo animado vem de um véu radial translúcido
(`.abertura::before`), nunca de um bloco sólido: fechado no centro, aberto nas
bordas, deixando o degradê visível. As opacidades do véu e do texto de apoio
foram calibradas por medição na fase mais clara do ciclo — o pior caso. Todos
os elementos passam nos mínimos da WCAG AA:

| elemento | contraste | mínimo |
| --- | --- | --- |
| `Lili` (pêssego, texto grande) | 4,53:1 | 3:1 |
| `ESMALTERIA` (creme) | 5,88:1 | 4,5:1 |
| frase principal (creme, grande) | 5,89:1 | 3:1 |
| linha de apoio (creme 92%) | 5,27:1 | 4,5:1 |
| botão (creme) | 8,37:1 | 4,5:1 |

O botão tem alvo de toque de 48px (`--toque-min`) e foco de teclado visível via
`:focus-visible`. Não há animação de entrada nesta etapa — movimento fica para
uma fase própria.

## Próximo passo

Seção de agendamento: a cliente escolhe serviço, dia e período, e a mensagem
chega pronta no WhatsApp da dona. É o destino do botão da abertura.
