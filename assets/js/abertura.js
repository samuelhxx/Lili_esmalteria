/* =========================================================
   Lili Esmalteria — entrada da abertura (mask reveal)

   Cada bloco de texto vive dentro de um .mascara com overflow: hidden.
   O texto nasce deslocado 110% para baixo — fora da área visível da
   máscara — e sobe até a posição final: o texto emerge por trás da
   cortina, em vez de aparecer por transparência.

   O estado inicial vem do CSS, não daqui, para nada piscar antes de
   animar. Este arquivo só conduz o movimento.
   ========================================================= */
(function () {
  "use strict";

  var raiz = document.documentElement;
  var linha = null;

  /* Estado final imediato: reduced-motion, GSAP ausente, ou fim da timeline.

     Pular a timeline para o fim não é opcional. Assim que a timeline é
     criada, o GSAP escreve transform inline em cada alvo, e estilo inline
     vence qualquer classe — a classe .pronto sozinha não desfaz isso.
     Sem o progress(1), o conteúdo ficaria escondido para sempre se os
     quadros nunca chegassem. */
  function assentar() {
    if (linha) {
      linha.progress(1);
    }
    raiz.classList.add("pronto");
  }

  var querMenosMovimento =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Se o GSAP não carregar, a página não pode ficar em branco: o conteúdo
     aparece no estado final e ninguém percebe que faltou a animação. */
  if (querMenosMovimento || !window.gsap) {
    assentar();
    return;
  }

  function alvo(n) {
    return document.querySelector('[data-revela="' + n + '"]');
  }

  function animar() {
    linha = gsap.timeline({
      defaults: { duration: 0.9, ease: "power3.out" },
      delay: 0.15,
      onComplete: assentar
    });

    /* fromTo explícito: o "de" repete o que o CSS já pintou, então não há
       salto entre o estado inicial e o primeiro quadro.

       O y: 0 nos dois lados não é enfeite. O estado inicial do CSS é
       translate3d(0, 110%, 0); o GSAP lê isso da matriz computada já
       convertido em pixels, e essa componente em px sobrevive ao
       yPercent: 0 — o texto para no meio da máscara e nunca aparece.
       Fixar y em 0 deixa só o yPercent variando.

       As sobreposições negativas são o ponto do efeito — cada bloco parte
       antes de o anterior assentar, e a sequência lê como um movimento só,
       não como cinco animações enfileiradas. Fecha em ~1,5s. */
    linha
      /* 1 é a logo — revelada pela máscara igual ao texto */
      .fromTo(alvo(1), { yPercent: 110, y: 0 }, { yPercent: 0, y: 0 })
      .fromTo(alvo(2), { yPercent: 110, y: 0 }, { yPercent: 0, y: 0 }, "-=0.70")
      .fromTo(alvo(3), { yPercent: 110, y: 0 }, { yPercent: 0, y: 0 }, "-=0.72")
      /* o botão não é texto: entra só com opacidade, sem máscara */
      .fromTo(
        ".botao",
        { opacity: 0 },
        { opacity: 1, duration: 0.6 },
        "-=0.50"
      );
  }

  /* Trava de segurança: o conteúdo da abertura não pode depender de a
     animação terminar. Se em 5s a timeline não tiver assentado — quadro
     nunca disparado, aba em segundo plano no carregamento, qualquer
     imprevisto —, o estado final entra de qualquer jeito. */
  setTimeout(assentar, 5000);

  /* Espera as fontes antes de medir: o deslocamento é 110% da altura do
     bloco, e essa altura muda quando a Bodoni substitui a fonte de
     fallback. O teto de 1,2s evita reféns de uma conexão ruim. */
  if (document.fonts && document.fonts.ready) {
    var soltou = false;
    var soltar = function () {
      if (soltou) return;
      soltou = true;
      animar();
    };
    document.fonts.ready.then(soltar);
    setTimeout(soltar, 1200);
  } else {
    animar();
  }
})();
