/* =========================================================
   Lili Esmalteria — serviços e preços

   Dois momentos, nesta ordem:

   1. Escolher. A seção abre com as seis categorias visíveis de uma vez
      e nenhum preço na tela. Nada vem selecionado.
   2. Ver os preços. Tocar numa categoria abre a lista logo abaixo;
      tocar na mesma de novo fecha e volta ao estado de escolha.

   Não é mais um tablist: sem seleção inicial e com fechar disponível, o
   padrão correto é divulgação (aria-expanded), e é isso que o leitor de
   tela anuncia.
   ========================================================= */
(function () {
  "use strict";

  var secao = document.querySelector(".servicos");
  if (!secao) return;

  var cartoes = Array.prototype.slice.call(secao.querySelectorAll(".cartao"));
  var paineis = Array.prototype.slice.call(secao.querySelectorAll(".painel"));
  var caixa = secao.querySelector(".servicos__paineis");
  if (!cartoes.length || !caixa) return;

  var querMenosMovimento =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var temGsap = !!window.gsap;
  var aberto = -1;            /* nenhuma categoria aberta */

  var DURACAO = 0.55;
  var SAIDA = "power2.inOut";
  var ENTRADA = "power3.out";

  /* ---------- altura do contêiner ---------- */

  /* A altura é a única coisa aqui que não dá para resolver com
     transform: escalar a caixa distorceria o texto dentro. Então ela é
     animada, uma vez por troca, num elemento só. */
  function ajustarAltura(painel, animar) {
    var alvo = painel ? painel.offsetHeight : 0;

    if (!animar || !temGsap || querMenosMovimento) {
      caixa.style.height = alvo + "px";
      return;
    }
    gsap.to(caixa, {
      height: alvo,
      duration: DURACAO,
      ease: ENTRADA,
      overwrite: true
    });
  }

  /* ---------- rolagem até a lista ---------- */

  /* Depois de abrir, o começo da lista precisa estar à vista sem a
     visitante ter que procurar. Só rola se a lista estiver fora da tela,
     e só o necessário — nunca arrasta a página sem motivo. */
  function trazerListaParaVista() {
    var topo = caixa.getBoundingClientRect().top;
    var folga = 24;
    var limite = window.innerHeight * 0.72;
    if (topo > folga && topo < limite) return;

    var destino = window.pageYOffset + topo - folga;
    if (querMenosMovimento || !window.scrollTo) {
      window.scrollTo(0, destino);
      return;
    }
    window.scrollTo({ top: destino, behavior: "smooth" });
  }

  /* ---------- abrir, trocar e fechar ---------- */

  function fecharPainel(painel, aoTerminar) {
    if (!painel) { if (aoTerminar) aoTerminar(); return; }

    if (!temGsap || querMenosMovimento) {
      painel.hidden = true;
      if (aoTerminar) aoTerminar();
      return;
    }
    gsap.to(painel, {
      opacity: 0,
      y: 10,
      duration: DURACAO * 0.82,
      ease: SAIDA,
      onComplete: function () {
        painel.hidden = true;
        gsap.set(painel, { clearProps: "opacity,transform" });
        if (aoTerminar) aoTerminar();
      }
    });
  }

  function abrirPainel(painel) {
    painel.hidden = false;

    if (!temGsap || querMenosMovimento) {
      ajustarAltura(painel, false);
      return;
    }

    var linhas = painel.querySelectorAll(".preco__linha");
    gsap.killTweensOf([painel, linhas]);
    ajustarAltura(painel, true);

    /* Sobe com deslocamento curto e desaceleração longa. Quando há uma
       lista saindo, esta entra com ela ainda visível: os dois movimentos
       se cruzam, e em nenhum quadro a área fica vazia. */
    gsap.fromTo(
      painel,
      { opacity: 0, y: 22 },
      {
        opacity: 1, y: 0,
        duration: DURACAO,
        ease: ENTRADA,
        delay: DURACAO * 0.08
      }
    );
    gsap.fromTo(
      linhas,
      { opacity: 0, y: 12 },
      {
        opacity: 1, y: 0,
        duration: 0.4,
        ease: ENTRADA,
        stagger: 0.04,
        delay: DURACAO * 0.2
      }
    );
  }

  function marcar(indice) {
    cartoes.forEach(function (cartao, i) {
      cartao.setAttribute("aria-expanded", String(i === indice));
    });
  }

  function alternar(indice) {
    var eraAberto = aberto;

    /* tocar na categoria já aberta fecha e volta ao estado de escolha */
    if (indice === eraAberto) {
      aberto = -1;
      marcar(-1);
      ajustarAltura(null, true);
      fecharPainel(paineis[eraAberto]);
      return;
    }

    aberto = indice;
    marcar(indice);

    if (eraAberto >= 0) fecharPainel(paineis[eraAberto]);
    abrirPainel(paineis[indice]);
    trazerListaParaVista();
  }

  cartoes.forEach(function (cartao, i) {
    cartao.addEventListener("click", function () { alternar(i); });

    /* setas andam pela grade; o clique já cobre Enter e espaço, que o
       navegador dispara sozinho em <button> */
    cartao.addEventListener("keydown", function (ev) {
      var colunas = window.innerWidth >= 640 ? 3 : 2;
      var passo = 0;
      if (ev.key === "ArrowRight") passo = 1;
      else if (ev.key === "ArrowLeft") passo = -1;
      else if (ev.key === "ArrowDown") passo = colunas;
      else if (ev.key === "ArrowUp") passo = -colunas;
      if (!passo) return;
      ev.preventDefault();
      var alvo = (i + passo + cartoes.length) % cartoes.length;
      cartoes[alvo].focus();
    });
  });

  /* Se a largura muda com uma lista aberta, a altura medida envelhece. */
  window.addEventListener("resize", function () {
    if (aberto >= 0) ajustarAltura(paineis[aberto], false);
  });

  /* ---------- entrada da seção ---------- */

  function revelarDeImediato() {
    secao.classList.add("servicos--revelada");
  }

  var alvos = Array.prototype.slice.call(secao.querySelectorAll(".revela-adiada"));

  if (querMenosMovimento || !temGsap || !alvos.length || !window.ScrollTrigger) {
    revelarDeImediato();
    return;
  }

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
      scrollTrigger: { trigger: secao, start: "top 78%", once: true }
    }
  );

  /* trava: o conteúdo não pode ficar escondido se os quadros não chegarem */
  setTimeout(function () {
    if (!secao.classList.contains("servicos--revelada")) {
      gsap.set(alvos, { yPercent: 0, y: 0 });
      revelarDeImediato();
    }
  }, 12000);
})();
