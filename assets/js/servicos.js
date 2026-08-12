/* =========================================================
   Lili Esmalteria — serviços e preços

   Três coisas:

   1. As abas. Trocar de categoria move um bloco de destaque entre as
      posições, com mola suave — ele nunca some e reaparece.
   2. Os painéis. A lista que sai dá lugar à que entra, e as linhas da
      nova aparecem em cascata.
   3. A entrada. Título e barra revelam pela máscara quando a seção
      chega à tela, uma vez só.
   ========================================================= */
(function () {
  "use strict";

  var secao = document.querySelector(".servicos");
  if (!secao) return;

  var trilho = secao.querySelector(".abas__trilho");
  var destaque = secao.querySelector(".abas__destaque");
  var abas = Array.prototype.slice.call(secao.querySelectorAll(".aba"));
  var paineis = Array.prototype.slice.call(secao.querySelectorAll(".painel"));
  if (!abas.length) return;

  var querMenosMovimento =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var temGsap = !!window.gsap;
  var atual = 0;

  /* ---------- o bloco de destaque ---------- */

  /* A largura base do destaque é fixa (100px, no CSS) e o ajuste vem de
     scaleX. É o que permite mover e redimensionar animando só transform:
     largura e left animados forçariam layout a cada quadro. */
  var LARGURA_BASE = 100;

  function posicionarDestaque(aba, animar) {
    if (!destaque) return;
    var x = aba.offsetLeft;
    var escala = aba.offsetWidth / LARGURA_BASE;

    if (!animar || !temGsap || querMenosMovimento) {
      gsapOuEstilo(x, escala);
      return;
    }
    gsap.to(destaque, {
      x: x,
      scaleX: escala,
      duration: 0.55,
      ease: "back.out(1.5)"   /* mola suave, sem estourar a posição */
    });
  }

  function gsapOuEstilo(x, escala) {
    if (temGsap) {
      gsap.set(destaque, { x: x, scaleX: escala });
    } else {
      destaque.style.transform = "translateX(" + x + "px) scaleX(" + escala + ")";
    }
  }

  /* ---------- rolagem horizontal da barra ---------- */

  /* Centraliza a aba ativa no trilho mexendo só no scrollLeft do próprio
     contêiner — nada de scrollIntoView, que arrastaria a página junto. */
  function trazerParaVista(aba) {
    if (!trilho) return;
    var alvo = aba.offsetLeft - (trilho.clientWidth - aba.offsetWidth) / 2;
    var limite = trilho.scrollWidth - trilho.clientWidth;
    trilho.scrollLeft = Math.max(0, Math.min(alvo, limite));
  }

  /* ---------- troca de painel ---------- */

  function trocarPainel(indice) {
    var entra = paineis[indice];
    paineis.forEach(function (p, i) {
      if (i !== indice) p.hidden = true;
    });
    entra.hidden = false;

    if (!temGsap || querMenosMovimento) return;

    var linhas = entra.querySelectorAll(".preco__linha");
    gsap.killTweensOf([entra, linhas]);

    gsap.fromTo(
      entra,
      { opacity: 0, scale: 0.95, x: 18, filter: "blur(6px)" },
      {
        opacity: 1, scale: 1, x: 0, filter: "blur(0px)",
        duration: 0.42, ease: "power2.out"
      }
    );
    /* cascata curta: as linhas chegam logo atrás do painel, não depois */
    gsap.fromTo(
      linhas,
      { opacity: 0, y: 12 },
      {
        opacity: 1, y: 0, duration: 0.35, ease: "power2.out",
        stagger: 0.045, delay: 0.06
      }
    );
  }

  function selecionar(indice, focar) {
    if (indice === atual) return;
    atual = indice;

    abas.forEach(function (aba, i) {
      var ativa = i === indice;
      aba.setAttribute("aria-selected", String(ativa));
      aba.tabIndex = ativa ? 0 : -1;
    });

    posicionarDestaque(abas[indice], true);
    trazerParaVista(abas[indice]);
    trocarPainel(indice);
    if (focar) abas[indice].focus();
  }

  abas.forEach(function (aba, i) {
    aba.addEventListener("click", function () { selecionar(i, false); });
  });

  /* Setas navegam entre as abas, Home e End vão às pontas — o padrão de
     tablist que o leitor de tela anuncia. */
  trilho.addEventListener("keydown", function (ev) {
    var passo = 0;
    if (ev.key === "ArrowRight" || ev.key === "ArrowDown") passo = 1;
    else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") passo = -1;
    else if (ev.key === "Home") return selecionar(0, true), ev.preventDefault();
    else if (ev.key === "End") return selecionar(abas.length - 1, true), ev.preventDefault();
    if (!passo) return;
    ev.preventDefault();
    var proxima = (atual + passo + abas.length) % abas.length;
    selecionar(proxima, true);
  });

  /* ---------- posição inicial e recálculo ---------- */

  function assentarDestaque() {
    posicionarDestaque(abas[atual], false);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(assentarDestaque);
  }
  assentarDestaque();
  window.addEventListener("resize", assentarDestaque);

  /* ---------- entrada da seção ---------- */

  function revelarDeImediato() {
    secao.classList.add("servicos--revelada");
  }

  var alvos = Array.prototype.slice.call(secao.querySelectorAll(".revela-adiada"));

  if (querMenosMovimento || !temGsap || !alvos.length) {
    revelarDeImediato();
  } else if (window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.fromTo(
      alvos,
      { yPercent: 110, y: 0 },
      {
        yPercent: 0, y: 0,
        duration: 1.1,
        ease: "power2.out",
        stagger: 0.14,
        onComplete: revelarDeImediato,
        scrollTrigger: {
          trigger: secao,
          start: "top 78%",
          once: true          /* dispara uma vez, não repete a cada rolagem */
        }
      }
    );
    /* Se os quadros nunca chegarem, o conteúdo não pode ficar escondido. */
    setTimeout(function () {
      if (!secao.classList.contains("servicos--revelada")) {
        gsap.set(alvos, { yPercent: 0, y: 0 });
        revelarDeImediato();
      }
    }, 12000);
  } else {
    revelarDeImediato();
  }
})();
