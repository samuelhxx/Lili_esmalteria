/* =========================================================
   Lili Esmalteria — glitter suspenso

   Cacos de purpurina, não bolinhas. Duas decisões explicam a diferença:

   1. FORMA. Ruído por pixel produz grão quadrado de 1px que o
      antialiasing arredonda — vira bolinha. Aqui cada partícula é um
      quadrilátero irregular, com lados desiguais e cantos vivos: caco de
      purpurina tem faceta, reflete de um lado e apaga do outro.

   2. NITIDEZ. Textura de ruído é rasterizada em pixels de CSS e, numa
      tela de 2x ou 3x, cada grão é esticado e borra. Os cacos são
      caminhos vetoriais dentro de um ladrilho SVG: o navegador rasteriza
      na densidade real do aparelho, então ficam nítidos em qualquer tela.

   A massa continua sendo textura repetida, não elemento no DOM — são
   milhares de cacos por tela, e como elementos isso seria impraticável.
   Só as centelhas, que precisam de tempo próprio, são elementos.
   ========================================================= */
(function () {
  "use strict";

  var caixa = document.querySelector(".glitter");
  if (!caixa) return;

  var querMenosMovimento =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var CORES = ["#C89B5A", "#FFC06A", "#F3E4CE"];

  function sorteio(semente) {
    return function () {
      semente |= 0;
      semente = (semente + 0x6D2B79F5) | 0;
      var t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- um caco ---------- */

  /* Quadrilátero de lados desiguais em torno de um centro. Os raios
     variam de vértice para vértice, então nunca sai losango regular nem
     quadrado — o contorno fica torto, que é o aspecto áspero. */
  function caco(rnd, cx, cy, escala) {
    var pontos = [];
    var giro = rnd() * Math.PI * 2;
    /* achatamento: parte dos cacos sai alongada, como lasca */
    var achata = 0.35 + rnd() * 0.9;
    for (var v = 0; v < 4; v++) {
      var ang = giro + (v * Math.PI) / 2 + (rnd() - 0.5) * 0.9;
      var raio = escala * (0.5 + rnd() * 0.75);
      pontos.push([
        cx + Math.cos(ang) * raio,
        cy + Math.sin(ang) * raio * achata
      ]);
    }
    var d = "M" + pontos[0][0].toFixed(1) + " " + pontos[0][1].toFixed(1);
    for (var i = 1; i < 4; i++) {
      d += "L" + pontos[i][0].toFixed(1) + " " + pontos[i][1].toFixed(1);
    }
    return d + "Z";
  }

  /* ---------- o ladrilho ---------- */

  /* Concentração desigual: em vez de espalhar por igual, sorteiam-se
     núcleos e os cacos caem em volta deles, com desvio variado. É o que
     produz áreas cheias e áreas ralas — purpurina não se distribui em
     tapete uniforme. */
  function ladrilho(lado, quantidade, semente, porte) {
    var rnd = sorteio(semente);
    var grupos = {};          /* cor + opacidade -> lista de caminhos */
    var nucleos = [];
    var n;

    for (n = 0; n < 9; n++) {
      nucleos.push([rnd() * lado, rnd() * lado, 0.10 + rnd() * 0.30]);
    }

    for (n = 0; n < quantidade; n++) {
      var nucleo = nucleos[Math.floor(rnd() * nucleos.length)];
      var espalha = nucleo[2] * lado;
      /* soma de dois sorteios: agrupa perto do núcleo e ainda solta
         alguns cacos longe, sem deixar buraco perfeito */
      var cx = nucleo[0] + (rnd() + rnd() - 1) * espalha;
      var cy = nucleo[1] + (rnd() + rnd() - 1) * espalha;
      cx = ((cx % lado) + lado) % lado;
      cy = ((cy % lado) + lado) % lado;

      /* A maioria pequena, poucos maiores — são estes que dão o cintilar
         quando a luz bate. O piso não desce mais: abaixo de ~1,5px o caco
         cai sob um pixel em tela 1x, o antialiasing arredonda e ele volta
         a parecer bolinha. */
      var grande = rnd() < 0.07;
      var escala = (grande ? 1.9 + rnd() * 1.7 : 0.78 + rnd() * 0.95) * porte;

      var cor = CORES[Math.floor(rnd() * CORES.length)];
      var opacidade = grande
        ? (0.5 + rnd() * 0.4).toFixed(2)
        : (0.14 + rnd() * 0.34).toFixed(2);

      var chave = cor + "|" + opacidade;
      if (!grupos[chave]) grupos[chave] = [];
      grupos[chave].push(caco(rnd, cx, cy, escala));
    }

    /* agrupa por cor e opacidade: repetir fill e opacity em cada caminho
       triplicaria o tamanho do ladrilho */
    var corpo = "";
    Object.keys(grupos).forEach(function (chave) {
      var partes = chave.split("|");
      corpo += '<g fill="' + partes[0] + '" opacity="' + partes[1] + '">' +
        '<path d="' + grupos[chave].join("") + '"/></g>';
    });

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + lado +
      '" height="' + lado + '" viewBox="0 0 ' + lado + " " + lado + '">' +
      corpo + "</svg>";
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  }

  /* Ladrilhos de lados diferentes para as repetições nunca coincidirem —
     dois do mesmo tamanho desenhariam grade.

     A ordem é de profundidade, do fundo para a frente, e as três coisas
     andam juntas: quem está longe é menor, mais apagado e mais denso;
     quem está perto é maior, mais brilhante e mais esparso. Antes a
     opacidade caía nessa ordem enquanto o deslocamento subia — o olho
     via a camada apagada correr na frente da brilhante, que é o
     contrário do que a profundidade pede.

     O porte não desce de 1: abaixo disso o caco cai sob um pixel em
     tela 1x, o antialiasing arredonda e ele volta a parecer bolinha. A
     distância se lê pela opacidade e pela densidade, não encolhendo o
     que já está no piso. */
  var CAMADAS = [
    { lado: 263, quantidade: 300, semente: 11, opacidade: 0.5,  porte: 1 },
    { lado: 341, quantidade: 420, semente: 29, opacidade: 0.68, porte: 1.12 },
    { lado: 421, quantidade: 520, semente: 47, opacidade: 0.9,  porte: 1.35 }
  ];

  var camadas = [];

  CAMADAS.forEach(function (def) {
    var camada = document.createElement("div");
    camada.className = "glitter__camada";
    camada.style.backgroundImage =
      ladrilho(def.lado, def.quantidade, def.semente, def.porte);
    camada.style.backgroundSize = def.lado + "px " + def.lado + "px";
    camada.style.opacity = def.opacidade;
    camadas.push(camada);
  });

  /* ---------- as centelhas ---------- */

  var rnd = sorteio(20250812);
  function entre(a, b) { return a + rnd() * (b - a); }

  var CENTELHAS = 18;
  var brilhos = document.createElement("div");
  brilhos.className = "glitter__camada glitter__camada--centelhas";

  for (var i = 0; i < CENTELHAS; i++) {
    var lado = entre(9, 16);
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
      lado + " " + lado + '">' +
      '<path fill="' + CORES[Math.floor(entre(0, CORES.length))] + '" d="' +
      caco(rnd, lado / 2, lado / 2, lado * 0.34) + '"/></svg>';

    var c = document.createElement("span");
    c.className = "glitter__centelha";
    var e = c.style;
    e.left = entre(2, 98).toFixed(2) + "%";
    e.top = entre(2, 98).toFixed(2) + "%";
    e.width = lado.toFixed(1) + "px";
    e.height = lado.toFixed(1) + "px";
    e.backgroundImage = 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
    /* ciclos longos e fora de fase: nenhuma acende junto com outra */
    e.setProperty("--cintila-tempo", entre(4.5, 11).toFixed(1) + "s");
    e.setProperty("--cintila-atraso", entre(-11, 0).toFixed(1) + "s");
    e.setProperty("--cintila-pico", entre(0.55, 0.9).toFixed(2));
    brilhos.appendChild(c);
  }
  camadas.push(brilhos);

  var fragmento = document.createDocumentFragment();
  camadas.forEach(function (c) { fragmento.appendChild(c); });
  caixa.appendChild(fragmento);

  /* ---------- deriva por inércia ----------

     O paralaxe antigo prendia a posição da camada à posição da rolagem:
     70px de curso ao longo de 2264px de página, ou seja 3%. Medido, dava
     6 a 28 pixels por tela inteira rolada — numa textura que cobre a tela
     toda, isso é o efeito não existir.

     Agora o que comanda é a VELOCIDADE do gesto, não a posição. O
     deslocamento é proporcional à velocidade instantânea, contrário ao
     sentido da rolagem, e volta ao repouso sozinho quando o dedo para —
     mas não na hora: a camada continua e desacelera, como pó suspenso.

     Duas vantagens sobre o paralaxe: gesto rápido move muito e gesto
     lento move pouco (a posição não sabe a diferença), e o estado de
     descanso é sempre zero, então nada acumula deriva ao longo da
     página.

     Sem GSAP aqui de propósito: é um laço rAF que escreve translate3d em
     quatro camadas e DORME quando tudo zera. Enquanto a página está
     parada — que é a maior parte do tempo — não custa um quadro sequer.
     ---------------------------------------------------------------- */

  if (querMenosMovimento) return;

  /* Profundidade: a camada do fundo se desloca um terço do que a da
     frente se desloca. É a diferença entre os fatores que o olho lê como
     distância. As centelhas vão na frente de todas. */
  var FATORES = [0.35, 0.6, 1, 1.25];

  /* segundos: converte px/s de rolagem em px de deslocamento. A 2000px/s
     (um gesto rápido de celular) dá 90px antes do teto. */
  var GANHO = 0.045;

  /* Teto do deslocamento. Preso à altura da tela porque a camada
     transborda 16vh de cada lado: passar disso descobriria a borda. */
  var teto = 72;
  function medirTeto() {
    teto = Math.min(72, window.innerHeight * 0.11);
  }
  medirTeto();
  window.addEventListener("resize", medirTeto);

  var estados = camadas.map(function (el, i) {
    var fator = FATORES[i] || 1;
    return {
      el: el,
      fator: fator,
      atual: 0,
      escrito: 0,
      /* quem está mais longe segue o alvo mais devagar: além de andar
         menos, chega atrasado. É o que dá peso diferente a cada camada. */
      segue: 0.06 + fator * 0.045
    };
  });

  var ultimoY = window.pageYOffset || 0;
  var ultimoT = 0;
  var velocidade = 0;        /* px/s, suavizada */
  var anterior = 0;
  var laco = 0;

  window.addEventListener("scroll", function () {
    var y = window.pageYOffset || 0;
    var agora = (window.performance && performance.now()) || Date.now();
    var dt = ultimoT ? (agora - ultimoT) / 1000 : 0;
    ultimoT = agora;

    /* dt fora dessa faixa é aba que voltou do fundo ou primeiro evento:
       a velocidade calculada ali não significa nada */
    if (dt > 0 && dt < 0.25) {
      velocidade += ((y - ultimoY) / dt - velocidade) * 0.35;
    }
    ultimoY = y;
    if (!laco) laco = requestAnimationFrame(quadro);
  }, { passive: true });

  function quadro(t) {
    var dt = anterior ? Math.min((t - anterior) / 1000, 0.05) : 1 / 60;
    anterior = t;
    var passos = dt * 60;    /* normaliza o amortecimento para 60fps */

    velocidade *= Math.pow(0.82, passos);

    var base = -velocidade * GANHO;
    if (base > teto) base = teto;
    else if (base < -teto) base = -teto;

    var vivo = Math.abs(velocidade) > 4;

    for (var i = 0; i < estados.length; i++) {
      var e = estados[i];
      e.atual += (base * e.fator - e.atual) * Math.min(1, e.segue * passos);
      /* só escreve quando muda de verdade: abaixo disso o navegador
         recompõe à toa */
      if (Math.abs(e.atual - e.escrito) > 0.05) {
        e.escrito = e.atual;
        e.el.style.transform = "translate3d(0," + e.atual.toFixed(2) + "px,0)";
      }
      if (Math.abs(e.atual) > 0.08) vivo = true;
    }

    if (vivo) {
      laco = requestAnimationFrame(quadro);
      return;
    }

    /* tudo em repouso: encosta no zero e devolve o quadro ao navegador */
    laco = 0;
    anterior = 0;
    velocidade = 0;
    for (var j = 0; j < estados.length; j++) {
      estados[j].atual = 0;
      estados[j].escrito = 0;
      estados[j].el.style.transform = "translate3d(0,0,0)";
    }
  }
})();
