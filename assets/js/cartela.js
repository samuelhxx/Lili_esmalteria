/* =========================================================
   Lili Esmalteria — cartela de cores

   Duas coisas acontecem aqui:

   1. O leque abre. Os gomos partem empilhados sobre a guarda esquerda
      (rotação inicial escrita no próprio SVG, em --rot) e giram em
      cascata até a posição final.

   2. A onda. Ao tocar um gomo, um círculo daquela cor cresce do ponto
      tocado e inunda a tela; no meio do percurso as variáveis de tema
      trocam, e quando a onda se dissipa o site já está na cor nova.

   O que nunca muda: a logo e a ferragem do leque em ouro fosco.
   ========================================================= */
(function () {
  "use strict";

  var raiz = document.documentElement;
  var leque = document.querySelector(".leque");
  var secao = document.querySelector(".cartela");
  var onda = document.querySelector(".onda");
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
  var ALFA_VEU = 0.46;  /* o mesmo do --veu-centro, no CSS */

  function montarTema(hex) {
    var cor = paraRGB(hex);
    var claro = luminancia(cor) > 0.35;

    var fundos = claro
      ? [mistura(cor, CREME, 0.42), mistura(cor, PRETO, 0.22), cor,
         mistura(cor, CREME, 0.6)]
      : [mistura(cor, PRETO, 0.88), mistura(cor, PRETO, 0.52), cor,
         mistura(cor, OURO, 0.3)];

    var veu = claro ? CREME : PRETO;

    /* O texto não fica sobre a cor do gomo: fica sobre os quatro tons
       derivados dela, já cobertos pelo véu. Escolher o par olhando a cor
       crua erra feio — a ferrugem, por exemplo, pede texto preto se
       comparada consigo mesma, mas o fundo que ela gera é escuro, e o
       preto sumiria nele. Então mede-se contra os quatro tons reais e
       fica o par que garante o melhor pior caso. */
    function piorCaso(candidato) {
      return fundos.reduce(function (menor, f) {
        return Math.min(menor, contraste(candidato, mistura(f, veu, ALFA_VEU)));
      }, Infinity);
    }

    var texto = piorCaso(CREME) >= piorCaso(PRETO) ? CREME : PRETO;

    return {
      fundo1: paraHex(fundos[0]),
      fundo2: paraHex(fundos[1]),
      fundo3: paraHex(fundos[2]),
      fundo4: paraHex(fundos[3]),
      texto: paraHex(texto),
      contraste: paraHex(texto === CREME ? PRETO : CREME),
      acento: paraHex(claro ? mistura(cor, PRETO, 0.45) : mistura(cor, CREME, 0.28)),
      veuRGB: veu.join(" "),
      onda: paraHex(claro ? cor : mistura(cor, PRETO, 0.35))
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

  function escolher(gomo, x, y) {
    var hex = gomo.getAttribute("data-cor");
    marcar(gomo);

    /* Sem onda: a transição das variáveis, declarada no CSS, já entrega
       a troca suave que a preferência pede. */
    if (querMenosMovimento || !window.gsap || !onda) {
      aplicarTema(hex);
      return;
    }

    var t = montarTema(hex);
    onda.style.backgroundColor = t.onda;

    gsap.killTweensOf(onda);
    gsap.set(onda, { x: x, y: y, scale: 0, opacity: 1 });
    gsap.timeline()
      .to(onda, { scale: 1, duration: 0.85, ease: "power2.out" })
      /* a troca acontece com a tela já coberta: ninguém vê o salto */
      .add(function () { aplicarTema(hex); }, 0.42)
      .to(onda, { opacity: 0, duration: 0.55, ease: "power1.out" }, 0.6);
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
