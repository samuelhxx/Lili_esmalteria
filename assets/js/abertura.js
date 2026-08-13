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

  /* Ritmo da entrada. DURACAO é quanto cada bloco leva para subir;
     PASSO é o intervalo entre a partida de um bloco e a do seguinte.
     Como PASSO é bem menor que DURACAO, os movimentos convivem na tela
     e a sequência lê como uma coisa só. Fecha em ~2,4s. */
  var DURACAO = 1.4;
  var PASSO = 0.38;

  function animar() {
    linha = gsap.timeline({
      /* power2.out, e não power3: numa duração mais longa a curva do
         power3 concentra quase todo o percurso no início e o fim fica
         arrastando. A power2 distribui melhor — desacelera sem frear. */
      defaults: { duration: DURACAO, ease: "power2.out" },
      delay: 0.2,
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
    var emenda = "-=" + (DURACAO - PASSO);

    linha
      /* 1 é a logo — revelada pela máscara igual ao texto */
      .fromTo(alvo(1), { yPercent: 110, y: 0 }, { yPercent: 0, y: 0 })
      .fromTo(alvo(2), { yPercent: 110, y: 0 }, { yPercent: 0, y: 0 }, emenda)
      .fromTo(alvo(3), { yPercent: 110, y: 0 }, { yPercent: 0, y: 0 }, emenda)
      /* o botão não é texto: entra só com opacidade, sem máscara */
      .fromTo(
        ".botao",
        { opacity: 0 },
        { opacity: 1, duration: 1.0 },
        "-=0.95"
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
