/* =========================================================
   Lili Esmalteria — cartela de cores

   Duas coisas acontecem aqui:

   1. O leque abre. Os gomos partem empilhados sobre a guarda esquerda
      (rotação inicial escrita no próprio SVG, em --rot) e giram em
      cascata até a posição final.

   2. A onda. Ao tocar um gomo, uma camada daquela cor cresce do ponto
      tocado, tinge a tela e FICA. Ela não cobre nada: vive abaixo do
      conteúdo e entra com opacidade parcial, então logo, textos, botão e
      leque seguem visíveis o tempo todo. As variáveis de tema migram por
      transição enquanto a frente avança, de modo que a mudança é vista
      acontecendo — e não trocada atrás de um flash.

   O que nunca muda: a logo e a ferragem do leque em ouro fosco.
   ========================================================= */
(function () {
  "use strict";

  var raiz = document.documentElement;
  var leque = document.querySelector(".leque");
  var secao = document.querySelector(".cartela");
  var onda = document.querySelector(".onda");
  var escolha = document.querySelector(".escolha");
  var corAtual = null;
  if (!leque || !secao) return;

  var gomos = Array.prototype.slice.call(leque.querySelectorAll(".gomo"));
  var abriveis = Array.prototype.slice.call(leque.querySelectorAll("[data-abre]"));

  var querMenosMovimento =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var PRETO = [22, 17, 14];
  var CREME = [243, 228, 206];
  var OURO = [200, 155, 90];

  /* ---------- cor ---------- */

  function paraRGB(hex) {
    var h = hex.replace("#", "");
    return [
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16)
    ];
  }

  function paraHex(rgb) {
    return "#" + rgb.map(function (v) {
      var s = Math.round(Math.max(0, Math.min(255, v))).toString(16);
      return s.length === 1 ? "0" + s : s;
    }).join("");
  }

  function mistura(a, b, t) {
    return [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t
    ];
  }

  /* Luminância relativa da WCAG — é ela que decide se o texto por cima
     vira claro ou escuro, e não a impressão de "cor clara". */
  function luminancia(rgb) {
    var c = rgb.map(function (v) {
      v = v / 255;
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  function contraste(a, b) {
    var la = luminancia(a), lb = luminancia(b);
    var alto = Math.max(la, lb), baixo = Math.min(la, lb);
    return (alto + 0.05) / (baixo + 0.05);
  }

  /* Monta o tema inteiro a partir de uma cor só.

     Cores claras não podem receber texto creme: o par de texto é
     escolhido por contraste medido, não por gosto. E o véu acompanha —
     num tema claro ele precisa ser creme, senão o texto escuro perde o
     fundo que o sustenta. */
  var ALFA_VEU = 0.46;   /* o mesmo do --veu-centro, no CSS */
  var ALFA_ONDA = 0.38;  /* a camada de cor que permanece */

  /* A variação clara precisa ficar clara de verdade, senão uma cor já
     escura gera quatro tons quase iguais e o degradê morre — o preto
     ônix é o caso limite. Então mistura-se com creme até haver distância
     de luminância suficiente contra a âncora preta. */
  function variacaoClara(cor) {
    var t = 0.30;
    while (t < 0.75 && luminancia(mistura(cor, CREME, t)) - luminancia(PRETO) < 0.16) {
      t += 0.05;
    }
    return mistura(cor, CREME, t);
  }

  function montarTema(hex) {
    var cor = paraRGB(hex);

    /* Quatro pontos, sempre: o preto quente como âncora, a variação
       escura, a cor dominante e a variação clara. É isso que mantém o
       degradê com amplitude para continuar se movendo — cor chapada
       seria o mesmo tom nos quatro pontos. */
    var fundos = [
      PRETO,
      mistura(cor, PRETO, 0.45),
      cor,
      variacaoClara(cor)
    ];

    /* O texto não fica sobre a cor do gomo: fica sobre esses quatro tons,
       já tingidos pela camada de cor e cobertos pelo véu. Testa-se as
       duas combinações possíveis — véu escuro com texto creme, véu claro
       com texto preto — e fica a que garante o melhor pior caso. */
    function piorCaso(texto, veu) {
      return fundos.reduce(function (menor, f) {
        var efetivo = mistura(mistura(f, cor, ALFA_ONDA), veu, ALFA_VEU);
        return Math.min(menor, contraste(texto, efetivo));
      }, Infinity);
    }

    var escuro = { texto: CREME, veu: PRETO, nota: piorCaso(CREME, PRETO) };
    var claro = { texto: PRETO, veu: CREME, nota: piorCaso(PRETO, CREME) };
    var par = escuro.nota >= claro.nota ? escuro : claro;

    return {
      fundo1: paraHex(fundos[0]),
      fundo2: paraHex(fundos[1]),
      fundo3: paraHex(fundos[2]),
      fundo4: paraHex(fundos[3]),
      texto: paraHex(par.texto),
      contraste: paraHex(par.texto === CREME ? PRETO : CREME),
      acento: paraHex(par.veu === PRETO
        ? mistura(cor, CREME, 0.28)
        : mistura(cor, PRETO, 0.45)),
      veuRGB: par.veu.join(" "),
      onda: hex
    };
  }

  function aplicarTema(hex) {
    var t = montarTema(hex);
    var e = raiz.style;
    e.setProperty("--fundo-1", t.fundo1);
    e.setProperty("--fundo-2", t.fundo2);
    e.setProperty("--fundo-3", t.fundo3);
    e.setProperty("--fundo-4", t.fundo4);
    e.setProperty("--tema-texto", t.texto);
    e.setProperty("--tema-contraste", t.contraste);
    e.setProperty("--tema-acento", t.acento);
    e.setProperty("--tema-veu-rgb", t.veuRGB);
    return t;
  }

  /* ---------- seleção ---------- */

  function marcar(gomo) {
    gomos.forEach(function (g) {
      g.setAttribute("aria-pressed", String(g === gomo));
    });
  }

  function revelarEscolha(nome) {
    if (escolha) {
      var rotulo = escolha.querySelector(".escolha__cor");
      if (rotulo) rotulo.textContent = nome;
    }
    if (!escolha || !escolha.hidden) return;

    escolha.hidden = false;
    if (querMenosMovimento || !window.gsap) return;
    gsap.fromTo(
      escolha,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }
    );
  }

  function escolher(gomo, x, y) {
    var hex = gomo.getAttribute("data-cor");
    if (hex === corAtual) return;   /* nada a refazer */
    corAtual = hex;
    marcar(gomo);

    /* O tema entra já: são as variáveis migrando, por transição, que
       tingem o degradê e os textos enquanto a frente da onda avança. */
    aplicarTema(hex);
    revelarEscolha(gomo.getAttribute("data-nome"));

    if (querMenosMovimento || !window.gsap || !onda) return;

    onda.style.setProperty("--onda-cor", hex);

    /* Uma camada só, partindo do ponto exato do toque, animada apenas em
       transform e opacity. A saída é rápida e a desaceleração longa —
       expo.out, nunca linear —, e no fim ela fica: não há volta ao
       estado anterior, a próxima escolha tinge por cima desta. */
    gsap.killTweensOf(onda);
    gsap.set(onda, { x: x, y: y, scale: 0, opacity: 0 });
    gsap.to(onda, {
      scale: 1,
      opacity: ALFA_ONDA,
      duration: 1.05,
      ease: "expo.out"
    });
  }

  function centro(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  gomos.forEach(function (gomo) {
    var tecido = gomo.querySelector(".gomo__tecido");
    var alvo = tecido || gomo;

    alvo.addEventListener("pointerenter", function (ev) {
      if (ev.pointerType === "mouse") escolher(gomo, ev.clientX, ev.clientY);
    });

    alvo.addEventListener("click", function (ev) {
      escolher(gomo, ev.clientX, ev.clientY);
    });

    gomo.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " " || ev.key === "Spacebar") {
        ev.preventDefault();
        var c = centro(gomo);
        escolher(gomo, c.x, c.y);
      }
    });
  });

  /* ---------- abertura do leque ---------- */

  function abrirDeImediato() {
    secao.classList.add("cartela--aberta");
  }

  function abrir() {
    if (querMenosMovimento || !window.gsap) {
      abrirDeImediato();
      return;
    }

    var linha = gsap.timeline({ onComplete: abrirDeImediato });

    /* Cascata: o gomo encostado na guarda esquerda é o primeiro a
       assentar e o mais distante é o último, então o leque parece abrir
       de dentro para fora, e não todos os gomos juntos. */
    abriveis.forEach(function (el) {
      var rot = parseFloat(el.getAttribute("data-rot")) || 0;
      var ordem = parseInt(el.getAttribute("data-ordem"), 10) || 0;
      /* Anima a própria variável --rot, e não a rotação do GSAP.
         O estado fechado já vem do CSS via rotate(var(--rot)) com
         transform-origin no rebite; se o GSAP escrevesse seu próprio
         transform-origin, os dois sistemas de eixo brigariam e os gomos
         abririam tortos. Assim existe um eixo só, o do CSS. */
      linha.fromTo(
        el,
        { "--rot": rot + "deg" },
        { "--rot": "0deg", duration: 1.1, ease: "power3.out" },
        (12 - ordem) * 0.055
      );
    });

    /* Mesma trava da abertura: se os quadros nunca chegarem, o leque
       não pode ficar fechado para sempre. */
    setTimeout(function () {
      if (linha.progress() < 1) linha.progress(1);
      abrirDeImediato();
    }, 6000);
  }

  if ("IntersectionObserver" in window) {
    var olho = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) {
          olho.disconnect();
          abrir();
        }
      });
    }, { threshold: 0.25 });
    olho.observe(leque);
  } else {
    abrir();
  }
})();
