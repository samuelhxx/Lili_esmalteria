/* =========================================================
   Lili Esmalteria — glitter suspenso

   Pó de purpurina, não bolinhas. A diferença está na técnica:

   - a massa de grãos é TEXTURA, não elemento. Um ladrilho SVG com
     feTurbulence cortado por limiar alto rende milhares de grãos
     irregulares por tela ao custo de um background-image. Como elementos
     no DOM, essa quantidade seria impraticável;
   - a variação de concentração vem de um segundo ruído, de frequência
     baixa, multiplicando o alfa do primeiro: onde a mancha é forte os
     grãos se juntam, onde é fraca eles rareiam. Sem isso a distribuição
     fica uniforme, que é o oposto de purpurina;
   - só as centelhas — as poucas que pegam a luz — são elementos, porque
     precisam cintilar em tempos próprios.

   Nada de deriva: glitter preso no esmalte não flutua. O paralaxe do
   scroll continua por camada, como antes.
   ========================================================= */
(function () {
  "use strict";

  var caixa = document.querySelector(".glitter");
  if (!caixa) return;

  var querMenosMovimento =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- o ladrilho de grãos ---------- */

  /* limiar: alfa = GANHO * ruído - CORTE. Como o ruído fractal se
     concentra perto de 0,5, um corte alto deixa passar só os picos — e é
     essa passagem estreita que produz grão áspero de borda dura em vez
     de bolha suave. */
  function ladrilho(lado, cor, freq, semente, ganho, corte, manchaFreq, manchaSemente) {
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + lado + '" height="' + lado + '">' +
      '<filter id="g" x="0" y="0" width="100%" height="100%" ' +
      'color-interpolation-filters="sRGB">' +
        '<feTurbulence type="fractalNoise" baseFrequency="' + freq + '" ' +
        'numOctaves="1" seed="' + semente + '" stitchTiles="stitch" result="fino"/>' +
        '<feColorMatrix in="fino" type="matrix" values="' +
          '0 0 0 0 0 ' +
          '0 0 0 0 0 ' +
          '0 0 0 0 0 ' +
          ganho + ' 0 0 0 ' + corte + '" result="graos"/>' +
        /* mancha de concentração: ruído largo que multiplica o alfa */
        '<feTurbulence type="fractalNoise" baseFrequency="' + manchaFreq + '" ' +
        'numOctaves="2" seed="' + manchaSemente + '" stitchTiles="stitch" result="largo"/>' +
        '<feColorMatrix in="largo" type="matrix" values="' +
          '0 0 0 0 0 ' +
          '0 0 0 0 0 ' +
          '0 0 0 0 0 ' +
          '2.1 0 0 0 -0.72" result="mancha"/>' +
        '<feComposite in="graos" in2="mancha" operator="in" result="densidade"/>' +
        '<feFlood flood-color="' + cor + '" result="cor"/>' +
        '<feComposite in="cor" in2="densidade" operator="in"/>' +
      '</filter>' +
      '<rect width="100%" height="100%" filter="url(#g)"/>' +
      '</svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  }

  /* Três camadas, uma por cor. Ladrilhos de lados diferentes para as
     repetições nunca coincidirem — dois ladrilhos do mesmo tamanho
     desenhariam grade. */
  /* Ganho e corte foram calibrados medindo a cobertura de grãos no
     ladrilho renderizado. Acima de baseFrequency 1 o ruído fica alto
     demais e nenhum pico passa do limiar: a tela sai limpa. Em 0,9, o
     par 16/-10,8 rende 2,2% de cobertura; 19/-13,3 rende 1,2%; e
     22/-16 rende 0,44%. Somadas, as três camadas dão textura sem
     virar enfeite. */
  var CAMADAS = [
    { lado: 263, cor: "#C89B5A", freq: 0.9,  semente: 11, ganho: 16, corte: -10.8,
      manchaFreq: 0.009, manchaSemente: 3, opacidade: 0.4 },
    { lado: 341, cor: "#FFC06A", freq: 0.85, semente: 29, ganho: 19, corte: -13.3,
      manchaFreq: 0.012, manchaSemente: 7, opacidade: 0.32 },
    { lado: 421, cor: "#F3E4CE", freq: 0.95, semente: 47, ganho: 22, corte: -16,
      manchaFreq: 0.007, manchaSemente: 5, opacidade: 0.26 }
  ];

  var camadas = [];

  CAMADAS.forEach(function (def) {
    var camada = document.createElement("div");
    camada.className = "glitter__camada";
    camada.style.backgroundImage = ladrilho(
      def.lado, def.cor, def.freq, def.semente, def.ganho, def.corte,
      def.manchaFreq, def.manchaSemente
    );
    camada.style.backgroundSize = def.lado + "px " + def.lado + "px";
    camada.style.opacity = def.opacidade;
    camadas.push(camada);
  });

  /* ---------- as centelhas ---------- */

  function sorteio(semente) {
    return function () {
      semente |= 0;
      semente = (semente + 0x6D2B79F5) | 0;
      var t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var rnd = sorteio(20250812);
  function entre(a, b) { return a + rnd() * (b - a); }

  var CENTELHAS = 16;
  var CORES = ["#C89B5A", "#FFC06A", "#F3E4CE"];

  var brilhos = document.createElement("div");
  brilhos.className = "glitter__camada glitter__camada--centelhas";

  for (var i = 0; i < CENTELHAS; i++) {
    var c = document.createElement("span");
    c.className = "glitter__centelha";
    var e = c.style;
    e.left = entre(2, 98).toFixed(2) + "%";
    e.top = entre(2, 98).toFixed(2) + "%";
    var lado = entre(2.2, 3.8);
    e.width = lado.toFixed(2) + "px";
    e.height = lado.toFixed(2) + "px";
    e.backgroundColor = CORES[Math.floor(entre(0, CORES.length))];
    /* ciclos longos e fora de fase: nenhuma acende junto com outra */
    e.setProperty("--cintila-tempo", entre(4.5, 11).toFixed(1) + "s");
    e.setProperty("--cintila-atraso", entre(-11, 0).toFixed(1) + "s");
    e.setProperty("--cintila-pico", entre(0.5, 0.85).toFixed(2));
    brilhos.appendChild(c);
  }
  camadas.push(brilhos);

  var fragmento = document.createDocumentFragment();
  camadas.forEach(function (c) { fragmento.appendChild(c); });
  caixa.appendChild(fragmento);

  /* ---------- paralaxe ---------- */

  if (querMenosMovimento || !window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  camadas.forEach(function (camada, indice) {
    var fatia = indice / (camadas.length - 1);
    var curso = -(16 + fatia * 54);

    gsap.to(camada, {
      y: curso,
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.8
      }
    });
  });
})();
