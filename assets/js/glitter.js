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
     que já está no piso.

     QUANTAS CAMADAS. Cada uma destas é uma camada composta do tamanho da
     tela mais a sobra do curso — num iPad a 2x, 21 MB de textura cada.
     Eram três, mais a das centelhas: 91 MB parados na memória do
     compositor o tempo todo, e o Safari começa a descartar ladrilho e
     engasgar muito antes disso. No toque fica uma só; no computador,
     duas. A regra é a de sempre: cortar quantidade antes de intensidade.

     Cada camada carrega o próprio fator de profundidade, amplitude de
     onda, período e fase. Antes eram quatro arrays paralelos indexados
     por posição, e mudar o número de camadas exigia acertar o índice nos
     quatro sem errar. */
  var TOQUE = !!(window.matchMedia &&
                 window.matchMedia("(pointer: coarse)").matches);

  var FUNDO  = { lado: 263, quantidade: 300, semente: 11,
                 opacidade: 0.52, porte: 1,
                 fator: 0.45, lateral: 16, periodo: 80, fase: 0 };
  var FRENTE = { lado: 421, quantidade: 520, semente: 47,
                 opacidade: 0.9, porte: 1.3,
                 fator: 1, lateral: 32, periodo: 125, fase: 3.4 };

  /* No toque sobra a da frente, que é a que se vê: mais brilhante, com
     os cacos maiores. A do fundo entrava como profundidade, e
     profundidade é a primeira coisa que se pode perder. */
  var CAMADAS = TOQUE ? [FRENTE] : [FUNDO, FRENTE];

  /* As centelhas viajam na frente de todas. */
  var DEF_CENTELHAS = { fator: 1.3, lateral: 40, periodo: 150, fase: 5.1 };

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

  /* Mais numerosas e maiores que antes: são elas que fazem a purpurina
     pegar a luz, e o pico do cintilar subiu junto. Ficam guardadas numa
     lista porque cada uma gira e se espalha por conta própria — o
     ladrilho não pode girar (a repetição mostraria as emendas), então a
     rotação vive aqui, nas partículas que existem no DOM. */
  var CENTELHAS = 24;
  var centelhas = [];
  var brilhos = document.createElement("div");
  brilhos.className = "glitter__camada glitter__camada--centelhas";

  for (var i = 0; i < CENTELHAS; i++) {
    var lado = entre(10, 19);
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
    e.setProperty("--cintila-tempo", entre(3.2, 8.5).toFixed(1) + "s");
    e.setProperty("--cintila-atraso", entre(-9, 0).toFixed(1) + "s");
    e.setProperty("--cintila-pico", entre(0.78, 1).toFixed(2));
    brilhos.appendChild(c);

    /* Só parte delas gira de verdade: girar todas viraria engrenagem.
       Duas em cada três ficam quase paradas, o resto vira o suficiente
       para o olho pegar a faceta mudando de lado. */
    var giraMesmo = rnd() < 0.34;
    var direcao = entre(0, Math.PI * 2);
    centelhas.push({
      el: c,
      giro: giraMesmo ? entre(-0.12, 0.12) : entre(-0.02, 0.02),
      dirX: Math.cos(direcao),
      dirY: Math.sin(direcao),
      escrito: ""
    });
  }
  camadas.push(brilhos);

  var fragmento = document.createDocumentFragment();
  camadas.forEach(function (c) { fragmento.appendChild(c); });
  caixa.appendChild(fragmento);

  /* ---------- o pó dentro do vidro ----------

     O gesto mexe o pó, o pó reage, e demora um instante para assentar.
     Cinco comportamentos, todos em transform e opacity:

     1. CONTRAMÃO. As partículas vão para o lado oposto do conteúdo.
        Rolando para baixo o conteúdo sobe e o glitter DESCE, cruzando
        com tudo o que se move na tela. Não é paralaxe de velocidade
        diferente: é sinal trocado.
     2. INÉRCIA. O deslocamento é proporcional à velocidade do gesto, e
        quando o dedo para o pó continua e desacelera sozinho.
     3. DERIVA LATERAL. Uma onda de lado, com período e fase próprios por
        camada, para não parecerem correndo num trilho reto. A amplitude
        acompanha o quanto a camada está deslocada — parada, não deriva.
     4. GIRO. Parte das centelhas vira enquanto anda.
     5. ESPALHAMENTO NA FRENAGEM. Quando a posição fica adiante do alvo,
        a camada está voltando: é o momento de assentar, e as centelhas
        se abrem um pouco antes de pousar.

     Nada de scale nas camadas de ladrilho: mudar a escala de uma camada
     composta obriga o navegador a rasterizar de novo, e é justamente o
     que não se pode pagar no celular. Translação e rotação nunca pedem
     nova rasterização.
     ---------------------------------------------------------------- */

  if (querMenosMovimento) return;

  /* Cada camada carrega o próprio fator, amplitude, período e fase —
     antes eram quatro arrays paralelos indexados por posição, e mudar o
     número de camadas exigia mexer nos quatro sem errar o índice. */
  var DEFS = CAMADAS.concat([DEF_CENTELHAS]);

  /* segundos: converte px/s de rolagem em px de deslocamento */
  var GANHO = 0.12;
  /* o quanto as centelhas se abrem no assentamento, em px */
  var ESPALHA = 40;

  /* Teto do deslocamento. A sobra da camada agora é fixa em px, e não em
     vh: presa à altura da tela, uma tela grande pedia uma camada grande,
     e o tamanho da camada é justamente o que custa memória no
     compositor. Com o fator 1.3 da camada da frente, o pico fica em
     195px em qualquer aparelho. */
  var teto = 150;
  function medirTeto() {
    teto = Math.min(150, window.innerHeight * 0.19);
  }
  medirTeto();
  window.addEventListener("resize", medirTeto);

  var estados = camadas.map(function (el, i) {
    var def = DEFS[i] || DEF_CENTELHAS;
    var fator = def.fator;
    return {
      el: el,
      fator: fator,
      lateral: def.lateral,
      periodo: def.periodo,
      fase: def.fase,
      atual: 0,
      lado: 0,
      escrito: "",
      /* quem está mais longe segue o alvo mais devagar: além de andar
         menos, chega atrasado */
      segue: 0.06 + fator * 0.045
    };
  });

  var frente = estados[estados.length - 1];

  var ultimoY = window.pageYOffset || 0;
  var ultimoT = 0;
  var velocidade = 0;        /* px/s, suavizada */
  var percorrido = 0;        /* px andados, alimenta a onda lateral */
  var assenta = 0;           /* 0 a 1: o quanto está assentando agora */
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
    var i, e;

    velocidade *= Math.pow(0.82, passos);
    percorrido += Math.abs(velocidade) * dt;

    /* sinal POSITIVO: rolando para baixo (velocidade > 0) o glitter
       desce, contra o conteúdo que sobe */
    var base = velocidade * GANHO;
    if (base > teto) base = teto;
    else if (base < -teto) base = -teto;

    /* Posição adiante do alvo quer dizer que a camada está voltando —
       ou seja, freando. É aí que o pó se abre antes de pousar. */
    var alvoFrente = Math.abs(base * frente.fator);
    var alcance = teto * frente.fator;
    var agora = (Math.abs(frente.atual) - alvoFrente) / alcance;
    if (agora < 0) agora = 0; else if (agora > 1) agora = 1;
    assenta += (agora - assenta) * Math.min(1, 0.3 * passos);

    var vivo = Math.abs(velocidade) > 4;

    for (i = 0; i < estados.length; i++) {
      e = estados[i];
      e.atual += (base * e.fator - e.atual) * Math.min(1, e.segue * passos);

      /* a deriva lateral só existe enquanto há deslocamento: parada, a
         camada não fica balançando sozinha */
      var quanto = Math.abs(e.atual) / (teto * e.fator);
      if (quanto > 1) quanto = 1;
      e.lado = Math.sin(percorrido / e.periodo + e.fase) * e.lateral * quanto;

      var escrita = "translate3d(" + e.lado.toFixed(1) + "px," +
                    e.atual.toFixed(1) + "px,0)";
      if (escrita !== e.escrito) {
        e.escrito = escrita;
        e.el.style.transform = escrita;
      }
      if (Math.abs(e.atual) > 0.08) vivo = true;
    }

    /* as centelhas herdam o movimento do grupo e ainda giram e se
       espalham por conta própria */
    var abre = assenta * ESPALHA;
    for (i = 0; i < centelhas.length; i++) {
      var c = centelhas[i];
      var escrita2 = "translate3d(" + (c.dirX * abre).toFixed(1) + "px," +
                     (c.dirY * abre).toFixed(1) + "px,0) rotate(" +
                     (frente.atual * c.giro).toFixed(1) + "deg)";
      if (escrita2 !== c.escrito) {
        c.escrito = escrita2;
        c.el.style.transform = escrita2;
      }
    }
    if (assenta > 0.01) vivo = true;

    if (vivo) {
      laco = requestAnimationFrame(quadro);
      return;
    }

    /* tudo em repouso: encosta no zero e devolve o quadro ao navegador */
    laco = 0;
    anterior = 0;
    velocidade = 0;
    assenta = 0;
    for (i = 0; i < estados.length; i++) {
      estados[i].atual = 0;
      estados[i].lado = 0;
      estados[i].escrito = "translate3d(0,0,0)";
      estados[i].el.style.transform = "translate3d(0,0,0)";
    }
    for (i = 0; i < centelhas.length; i++) {
      centelhas[i].escrito = "";
      centelhas[i].el.style.transform = "";
    }
  }
})();
