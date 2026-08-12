/* =========================================================
   Lili Esmalteria — poeira suspensa

   Uma camada de pontos finos entre o degradê e o conteúdo. A ideia é
   profundidade, não decoração: a pessoa sente o espaço antes de reparar
   nos pontos.

   Duas fontes de movimento, separadas de propósito:

   - a deriva de cada ponto é animação CSS, com duração e fase próprias.
     Fica no compositor, sem custo de quadro em JavaScript;
   - o paralaxe do scroll é GSAP, aplicado às camadas de profundidade e
     não a cada ponto — quatro alvos em vez de cinquenta e quatro.
   ========================================================= */
(function () {
  "use strict";

  var caixa = document.querySelector(".poeira");
  if (!caixa) return;

  var querMenosMovimento =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var QUANTIDADE = 54;
  var CAMADAS = 4;          /* profundidades, do fundo para a frente */
  var COLUNAS = 6;

  var CORES = ["#C89B5A", "#FFC06A", "#F3E4CE"];

  /* Gerador com semente: o desenho da poeira é sempre o mesmo, então dá
     para julgar a composição em vez de sortear uma nova a cada visita. */
  function sorteio(semente) {
    return function () {
      semente |= 0;
      semente = (semente + 0x6D2B79F5) | 0;
      var t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var rnd = sorteio(20250811);

  function entre(a, b) { return a + rnd() * (b - a); }

  /* Amostragem por células com muito jitter: sorteio puro deixa buracos e
     grumos; célula sem jitter vira grade. O meio-termo cobre a tela toda
     sem nunca alinhar. */
  var linhas = Math.ceil(QUANTIDADE / COLUNAS);
  var camadas = [];
  var i;

  for (i = 0; i < CAMADAS; i++) {
    var camada = document.createElement("div");
    camada.className = "poeira__camada";
    camadas.push(camada);
  }

  for (i = 0; i < QUANTIDADE; i++) {
    var coluna = i % COLUNAS;
    var linha = Math.floor(i / COLUNAS);

    var x = ((coluna + entre(0.05, 0.95)) / COLUNAS) * 100;
    var y = ((linha + entre(0.05, 0.95)) / linhas) * 100;

    /* profundidade decide tamanho, opacidade e velocidade de uma vez só:
       ponto pequeno e apagado está longe e anda devagar; ponto maior e
       mais visível está à frente e anda mais. */
    var profundidade = Math.floor(entre(0, CAMADAS));
    var fatia = profundidade / (CAMADAS - 1);

    var tamanho = entre(1.4, 2.2) + fatia * entre(1.1, 2.4);
    var opacidade = 0.1 + fatia * 0.17 + entre(0, 0.08);
    var cor = CORES[Math.floor(entre(0, CORES.length))];

    var ponto = document.createElement("span");
    ponto.className = "poeira__ponto";
    var e = ponto.style;
    e.left = x.toFixed(2) + "%";
    e.top = y.toFixed(2) + "%";
    e.width = tamanho.toFixed(2) + "px";
    e.height = tamanho.toFixed(2) + "px";
    e.backgroundColor = cor;
    e.opacity = Math.max(0.1, Math.min(0.35, opacidade)).toFixed(3);

    /* só uma minoria ganha halo: é a variação que impede o conjunto de
       parecer padrão gerado */
    if (rnd() < 0.28) {
      e.boxShadow = "0 0 " + (tamanho * 3.5).toFixed(1) + "px " +
        (tamanho * 0.6).toFixed(1) + "px " + cor;
      /* o piso de 0.10 é a faixa combinada: sem ele o desconto do
         halo derruba o ponto para abaixo dela */
      e.opacity = Math.max(0.1, Math.min(0.3, opacidade * 0.85)).toFixed(3);
    }

    /* deriva própria: amplitude curta, ciclo longo e fase deslocada, para
       o padrão nunca se repetir de forma perceptível */
    e.setProperty("--deriva-x", entre(-9, 9).toFixed(1) + "px");
    e.setProperty("--deriva-y", entre(-11, 11).toFixed(1) + "px");
    e.setProperty("--deriva-tempo", entre(22, 48).toFixed(1) + "s");
    e.setProperty("--deriva-atraso", entre(-30, 0).toFixed(1) + "s");

    camadas[profundidade].appendChild(ponto);
  }

  var fragmento = document.createDocumentFragment();
  camadas.forEach(function (c) { fragmento.appendChild(c); });
  caixa.appendChild(fragmento);

  /* ---------- paralaxe ---------- */

  if (querMenosMovimento || !window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  camadas.forEach(function (camada, indice) {
    var fatia = indice / (CAMADAS - 1);
    /* algumas dezenas de pixels ao longo da página inteira: o suficiente
       para dar espaço, longe de chamar atenção */
    var curso = -(16 + fatia * 54);

    gsap.to(camada, {
      y: curso,
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        /* scrub com número, e não true: interpola em vez de grudar no
           pixel, então o movimento acompanha a rolagem sem travar */
        scrub: 0.8
      }
    });
  });
})();
