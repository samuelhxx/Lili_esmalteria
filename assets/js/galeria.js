/* =========================================================
   Lili Esmalteria — galeria elástica

   O painel ativo abre em flex 4 contra flex 1 dos outros. Toda a
   animação disso vive no CSS, com os tempos e curvas do componente de
   referência: aqui só se troca qual painel está ativo, via aria-pressed,
   e o CSS reage. Um painel está sempre ativo — nunca há estado neutro.

   O GSAP entra só na entrada da seção, pelo scroll.
   ========================================================= */
(function () {
  "use strict";

  var secao = document.querySelector(".galeria");
  if (!secao) return;

  var paineis = Array.prototype.slice.call(secao.querySelectorAll(".painel-foto"));
  if (!paineis.length) return;

  var querMenosMovimento =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ativar(alvo) {
    if (alvo.getAttribute("aria-pressed") === "true") return;
    paineis.forEach(function (p) {
      p.setAttribute("aria-pressed", String(p === alvo));
    });
  }

  paineis.forEach(function (painel, i) {
    painel.addEventListener("click", function () { ativar(painel); });

    /* só com mouse: no toque, o pointerenter dispararia junto do clique */
    painel.addEventListener("pointerenter", function (ev) {
      if (ev.pointerType === "mouse") ativar(painel);
    });

    /* chegar pelo teclado já abre o painel: quem navega por Tab vê o
       mesmo que quem passa o mouse */
    painel.addEventListener("focus", function () { ativar(painel); });

    painel.addEventListener("keydown", function (ev) {
      var passo = 0;
      if (ev.key === "ArrowRight" || ev.key === "ArrowDown") passo = 1;
      else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") passo = -1;
      else if (ev.key === "Enter" || ev.key === " " || ev.key === "Spacebar") {
        ev.preventDefault();
        ativar(painel);
        return;
      }
      if (!passo) return;
      ev.preventDefault();
      var proximo = paineis[(i + passo + paineis.length) % paineis.length];
      proximo.focus();
      ativar(proximo);
    });
  });

  /* ---------- entrada da seção ---------- */

  function revelarDeImediato() {
    secao.classList.add("galeria--revelada");
  }

  var alvos = Array.prototype.slice.call(secao.querySelectorAll(".revela-adiada"));
  var entram = Array.prototype.slice.call(secao.querySelectorAll(".entra-adiada"));

  if (querMenosMovimento || !window.gsap || !alvos.length || !window.ScrollTrigger) {
    revelarDeImediato();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* Antes só o título entrava: os seis painéis já estavam plantados na
     tela quando a seção chegava. Agora sobem em cascata atrás dele — é o
     que faz a seção parecer chegar, em vez de estar sempre lá. */
  var entrada = gsap.timeline({
    onComplete: revelarDeImediato,
    scrollTrigger: { trigger: secao, start: "top 78%", once: true }
  });

  entrada.fromTo(
    alvos,
    { yPercent: 110, y: 0 },
    { yPercent: 0, y: 0, duration: 1.1, ease: "power2.out" }
  );

  entrada.fromTo(
    entram,
    { opacity: 0, y: 26 },
    { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.06 },
    0.22
  );

  /* trava: o título não pode ficar escondido se os quadros não chegarem */
  setTimeout(function () {
    if (!secao.classList.contains("galeria--revelada")) {
      gsap.set(alvos, { yPercent: 0, y: 0 });
      gsap.set(entram, { opacity: 1, y: 0 });
      revelarDeImediato();
    }
  }, 12000);
})();
