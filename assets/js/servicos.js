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
  var paineisCaixa = secao.querySelector(".servicos__paineis");

  /* Um tempo só para os dois movimentos: o destaque deslizando e a troca
     de lista partem juntos e terminam juntos, então leem como um gesto
     único em vez de duas animações independentes. */
  var DURACAO = 0.55;
  var SAIDA = "power2.inOut";
  var ENTRADA = "power3.out";

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
      duration: DURACAO,
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

  /* A altura do contêiner é a única coisa aqui que não dá para resolver
     com transform: escalar a caixa distorceria o texto dentro. Então ela
     é animada, uma vez por troca, num elemento só. */
  function ajustarAltura(entra, animar) {
    if (!paineisCaixa) return;
    var alvo = entra.offsetHeight;
    if (!animar || !temGsap || querMenosMovimento) {
      paineisCaixa.style.height = alvo + "px";
      return;
    }
    gsap.to(paineisCaixa, {
      height: alvo,
      duration: DURACAO,
      ease: ENTRADA,
      overwrite: true
    });
  }

  function trocarPainel(indice, anterior) {
    var entra = paineis[indice];
    var sai = paineis[anterior];
    entra.hidden = false;

    if (!temGsap || querMenosMovimento) {
      paineis.forEach(function (p, i) { if (i !== indice) p.hidden = true; });
      ajustarAltura(entra, false);
      return;
    }

    var linhas = entra.querySelectorAll(".preco__linha");
    gsap.killTweensOf([entra, sai, linhas]);
    ajustarAltura(entra, true);

    /* As duas listas se sobrepõem no tempo: a que sai desce e some
       enquanto a que entra já está subindo. Em nenhum quadro a área fica
       vazia — é essa sobreposição que dá continuidade, e não um corte
       seguido de outro. */
    if (sai && sai !== entra) {
      gsap.to(sai, {
        opacity: 0,
        y: 10,
        filter: "blur(4px)",
        duration: DURACAO * 0.82,
        ease: SAIDA,
        onComplete: function () {
          sai.hidden = true;
          gsap.set(sai, { clearProps: "opacity,transform,filter" });
        }
      });
    }

    gsap.fromTo(
      entra,
      { opacity: 0, y: -12, scale: 0.985, filter: "blur(5px)" },
      {
        opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
        duration: DURACAO,
        ease: ENTRADA,
        delay: DURACAO * 0.08   /* entra com a outra ainda bem visível */
      }
    );
    gsap.fromTo(
      linhas,
      { opacity: 0, y: 10 },
      {
        opacity: 1, y: 0,
        duration: 0.4, ease: ENTRADA,
        stagger: 0.04,
        delay: DURACAO * 0.2
      }
    );
  }

  function selecionar(indice, focar) {
    if (indice === atual) return;
    var anterior = atual;
    atual = indice;

    abas.forEach(function (aba, i) {
      var ativa = i === indice;
      aba.setAttribute("aria-selected", String(ativa));
      aba.tabIndex = ativa ? 0 : -1;
    });

    posicionarDestaque(abas[indice], true);
    trazerParaVista(abas[indice]);
    trocarPainel(indice, anterior);
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

  function assentar() {
    posicionarDestaque(abas[atual], false);
    ajustarAltura(paineis[atual], false);
  }

  /* Antes das fontes carregarem, as medidas mudam: refaz quando elas
     chegam, e a cada mudança de largura. */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(assentar);
  }
  assentar();
  window.addEventListener("resize", assentar);

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
