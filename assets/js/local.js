/* =========================================================
   Lili Esmalteria — onde a gente fica, e o rodapé

   Três coisas:

   1. O mapa só carrega quando a seção se aproxima. Um iframe de mapa
      puxa scripts, tiles e fontes de terceiros — carregado de saída,
      pesa mais que toda a página somada, e a visitante paga por isso
      antes mesmo de ter rolado até lá.
   2. As duas seções entram com a mesma máscara do resto do site.
   3. Os botões de WhatsApp esperam o número, como os do agendamento.
   ========================================================= */
(function () {
  "use strict";

  var onde = document.querySelector(".onde");
  var rodape = document.querySelector(".rodape");
  if (!onde && !rodape) return;

  /* ===== DESTINO DO WHATSAPP ==========================================
     AQUI entra o número, em formato internacional e só dígitos:
     55 + DDD + número, por exemplo "5511998877665". É o mesmo número da
     constante NUMERO em assets/js/agendamento.js — preencher os dois.

     Enquanto estiver vazio, os botões não navegam.
     =================================================================== */
  var NUMERO = "";

  var querMenosMovimento =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var temGsap = !!window.gsap;

  /* ---------- o WhatsApp ---------- */

  var CONVITE = "Oi! Vim pelo site e gostaria de mais informações.";

  Array.prototype.forEach.call(
    document.querySelectorAll(".whats--local, .whats-rodape"),
    function (link) {
      if (NUMERO) {
        link.setAttribute(
          "href",
          "https://wa.me/" + NUMERO + "?text=" + encodeURIComponent(CONVITE)
        );
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener");
        return;
      }
      /* sem número, o href="#" levaria ao topo da página — pior que não
         fazer nada */
      link.addEventListener("click", function (ev) { ev.preventDefault(); });
    }
  );

  /* ---------- o mapa, adiado ---------- */

  var mapa = document.querySelector(".mapa");
  var quadro = mapa && mapa.querySelector(".mapa__quadro");

  if (quadro && quadro.getAttribute("data-src")) {
    var carregar = function () {
      if (quadro.getAttribute("src")) return;
      quadro.setAttribute("src", quadro.getAttribute("data-src"));
      quadro.addEventListener("load", function () {
        mapa.classList.add("mapa--carregado");
      });
    };

    if (!window.IntersectionObserver) {
      /* navegador sem observador: carrega assim mesmo, tarde é melhor
         que nunca */
      carregar();
    } else {
      var vigia = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
          if (!entrada.isIntersecting) return;
          vigia.disconnect();
          carregar();
        });
      }, {
        /* uma tela e meia de antecedência: o mapa termina de montar
           antes de a moldura aparecer */
        rootMargin: "150% 0px"
      });
      vigia.observe(mapa);
    }
  }

  /* ---------- entrada das duas seções ---------- */

  function preparar(secao, marca) {
    if (!secao) return;

    function revelar() { secao.classList.add(marca); }

    var alvos = Array.prototype.slice.call(
      secao.querySelectorAll(".revela-adiada"));
    var entram = Array.prototype.slice.call(
      secao.querySelectorAll(".entra-adiada"));

    if (querMenosMovimento || !temGsap || !window.ScrollTrigger ||
        (!alvos.length && !entram.length)) {
      revelar();
      return;
    }

    var entrada = gsap.timeline({
      onComplete: revelar,
      scrollTrigger: { trigger: secao, start: "top 82%", once: true }
    });

    if (alvos.length) {
      entrada.fromTo(
        alvos,
        { yPercent: 110, y: 0 },
        { yPercent: 0, y: 0, duration: 1.1, ease: "power2.out" }
      );
    }

    if (entram.length) {
      entrada.fromTo(
        entram,
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.85, ease: "power3.out", stagger: 0.12 },
        alvos.length ? 0.24 : 0
      );
    }

    /* trava: nada pode ficar escondido se os quadros não chegarem */
    setTimeout(function () {
      if (secao.classList.contains(marca)) return;
      gsap.set(alvos, { yPercent: 0, y: 0 });
      gsap.set(entram, { opacity: 1, y: 0 });
      revelar();
    }, 12000);
  }

  if (temGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  preparar(onde, "onde--revelada");
  preparar(rodape, "rodape--revelada");
})();
