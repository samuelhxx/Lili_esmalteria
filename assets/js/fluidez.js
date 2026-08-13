/* =========================================================
   Lili Esmalteria — fluidez da página

   Duas coisas que não pertencem a nenhuma seção em particular:

   1. As âncoras internas. "Agendar horário" saltava 2304px de uma vez.
   2. A travessia entre seções, que era corte seco entre quatro blocos.
   ========================================================= */
(function () {
  "use strict";

  var querMenosMovimento =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var temGsap = !!window.gsap;

  /* =========================================================
     ÂNCORAS

     O scroll-behavior: smooth do CSS resolveria, mas tem duração curta e
     fixa, e o que se pede aqui é deslizar com desaceleração longa. Então
     a rolagem é animada — com o cuidado que sequestrar âncora exige:

     - o gesto da visitante cancela a animação na hora. Rolagem que
       insiste em terminar contra a mão de quem está rolando é pior que
       salto seco.
     - o foco vai para o destino no fim. Sem isso, quem chega pelo teclado
       ou por leitor de tela fica com o foco no link de origem, e o Tab
       seguinte volta para o topo da página.
     ========================================================= */

  var DURACAO_ANCORA = 1.2;
  var FOLGA = 8;               /* respiro acima do destino */

  var animacao = null;

  function cancelar() {
    if (!animacao) return;
    animacao.kill();
    animacao = null;
  }

  function focar(alvo) {
    /* tabindex -1 torna o alvo focável sem entrar na ordem do Tab */
    if (!alvo.hasAttribute("tabindex")) alvo.setAttribute("tabindex", "-1");
    try { alvo.focus({ preventScroll: true }); } catch (e) { alvo.focus(); }
  }

  function rolarAte(alvo) {
    var destino = window.pageYOffset + alvo.getBoundingClientRect().top - FOLGA;
    var limite = document.documentElement.scrollHeight - window.innerHeight;
    if (destino > limite) destino = limite;
    if (destino < 0) destino = 0;

    if (querMenosMovimento || !temGsap) {
      window.scrollTo(0, destino);
      focar(alvo);
      return;
    }

    cancelar();
    var estado = { y: window.pageYOffset };
    animacao = gsap.to(estado, {
      y: destino,
      duration: DURACAO_ANCORA,
      /* expo.out chega rápido e alonga o fim: quase toda a duração é
         desaceleração, que é a sensação de deslizar até parar */
      ease: "expo.out",
      onUpdate: function () { window.scrollTo(0, estado.y); },
      onComplete: function () {
        animacao = null;
        focar(alvo);
      }
    });
  }

  /* qualquer intenção de rolar da visitante interrompe a animação */
  ["wheel", "touchstart", "pointerdown"].forEach(function (evento) {
    window.addEventListener(evento, cancelar, { passive: true });
  });
  window.addEventListener("keydown", function (ev) {
    if (ev.key === "ArrowUp" || ev.key === "ArrowDown" ||
        ev.key === "PageUp" || ev.key === "PageDown" ||
        ev.key === "Home" || ev.key === "End" || ev.key === " ") {
      cancelar();
    }
  });

  document.addEventListener("click", function (ev) {
    var link = ev.target.closest && ev.target.closest('a[href^="#"]');
    if (!link) return;

    var alvo = link.getAttribute("href");
    /* "#" sozinho é âncora sem destino — o botão do WhatsApp enquanto
       não há número. Quem cuida dele é a própria seção. */
    if (!alvo || alvo === "#") return;

    var destino = document.getElementById(alvo.slice(1));
    if (!destino) return;

    ev.preventDefault();
    rolarAte(destino);
    /* o endereço acompanha, sem empurrar a rolagem de volta */
    if (window.history && history.pushState) history.pushState(null, "", alvo);
  });

  /* =========================================================
     TRAVESSIA ENTRE SEÇÕES

     Cada seção entrava uma vez e congelava. Um deslocamento curto preso
     ao scroll no título faz a página parecer um plano contínuo em vez de
     quatro slides empilhados.

     A amplitude é deliberadamente pequena — 14px para cada lado. Não é
     para ser visto, é para ser sentido: acima disso vira exibição e
     começa a competir com a leitura.
     ========================================================= */

  if (querMenosMovimento || !temGsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  var AMPLITUDE = 14;

  Array.prototype.forEach.call(
    document.querySelectorAll(".servicos__titulo, .galeria__titulo, .agendamento__titulo"),
    function (titulo) {
      var secao = titulo.closest("section");
      if (!secao) return;

      /* No próprio h2, e não no filho mascarado: aquele é o reveal de
         entrada, e dois donos no mesmo transform brigariam. */
      gsap.fromTo(
        titulo,
        { y: AMPLITUDE },
        {
          y: -AMPLITUDE,
          ease: "none",
          scrollTrigger: {
            trigger: secao,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6
          }
        }
      );
    }
  );
})();
