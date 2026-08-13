/* =========================================================
   Lili Esmalteria — agendamento

   Três passos, um aberto de cada vez. O que já foi respondido recolhe
   numa linha de resumo que continua clicável; o seguinte desliza para
   dentro. Os dois movimentos se sobrepõem no tempo, então em nenhum
   quadro existe área vazia entre eles.

   A altura de cada passo só é escrita durante a troca. Fora dela volta
   a auto — assim uma lista que abre por dentro (os serviços da
   categoria) faz o passo crescer sozinho, sem ninguém precisar
   remedir nada.
   ========================================================= */
(function () {
  "use strict";

  var secao = document.querySelector(".agendamento");
  if (!secao) return;

  /* ===== DESTINO DO BOTÃO =============================================
     AQUI entra o número, em formato internacional e só dígitos:
     55 + DDD + número, por exemplo "5511998877665".

     Enquanto estiver vazio o botão não navega — mas a mensagem já é
     montada por montarMensagem() e fica escrita em data-mensagem do
     botão, dá para conferir pelo inspetor. Preencheu o número, o link
     passa a sair pronto, com o texto embutido.
     =================================================================== */
  var NUMERO = "";

  var passos = Array.prototype.slice.call(secao.querySelectorAll(".passo"));
  var marcas = Array.prototype.slice.call(secao.querySelectorAll(".progresso__marca"));
  var cartoes = Array.prototype.slice.call(secao.querySelectorAll(".cartao"));
  var listas = Array.prototype.slice.call(secao.querySelectorAll(".lista"));
  var caixaListas = secao.querySelector(".listas");
  var botao = secao.querySelector(".whats");
  if (passos.length !== 3 || !caixaListas || !botao) return;

  var querMenosMovimento =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var temGsap = !!window.gsap;
  var anima = temGsap && !querMenosMovimento;

  var DURACAO = 0.6;
  var SOBREPOE = 0.24;        /* o que entra começa antes do outro sair */
  var ENTRADA = "power3.out";
  var SAIDA = "power2.inOut";

  var escolhas = {
    servico: null,
    dia: null, diaLongo: null,
    periodo: null, periodoLongo: null
  };

  var aberto = 1;             /* passo expandido */
  var categoria = -1;         /* categoria aberta dentro do passo 1 */

  /* ---------- a mensagem ---------- */

  /* "Oi! Gostaria de agendar Volume brasileiro para quinta-feira, no
     período da tarde." Os três períodos pedem "da", então a regência
     não muda com a escolha. */
  function montarMensagem() {
    return "Oi! Gostaria de agendar " + escolhas.servico +
           " para " + escolhas.diaLongo +
           ", no período da " + escolhas.periodoLongo + ".";
  }

  function montarLink() {
    if (!NUMERO) return "#";
    return "https://wa.me/" + NUMERO +
           "?text=" + encodeURIComponent(montarMensagem());
  }

  function completo() {
    return !!(escolhas.servico && escolhas.dia && escolhas.periodo);
  }

  /* ---------- medidas ---------- */

  function alturaNatural(el) {
    var antes = el.style.height;
    el.style.height = "auto";
    var altura = el.offsetHeight;
    el.style.height = antes;
    return altura;
  }

  function animarAltura(el, alvo, atraso) {
    if (!anima) { el.style.height = ""; return; }
    gsap.to(el, {
      height: alvo,
      duration: DURACAO,
      ease: ENTRADA,
      delay: atraso || 0,
      overwrite: "auto",
      onComplete: function () { el.style.height = ""; }
    });
  }

  /* ---------- rolagem ---------- */

  /* Só rola se o passo ativo estiver fora de vista, e só o necessário
     para trazê-lo — nunca arrasta a página sem motivo. */
  function rolarPara(passo) {
    var topo = passo.getBoundingClientRect().top;
    var folga = 28;
    if (topo > folga && topo < window.innerHeight * 0.7) return;

    var destino = window.pageYOffset + topo - folga;
    if (querMenosMovimento || !window.scrollTo) {
      window.scrollTo(0, destino);
      return;
    }
    window.scrollTo({ top: destino, behavior: "smooth" });
  }

  /* ---------- progresso ---------- */

  function respondido(numero) {
    if (numero === 1) return !!escolhas.servico;
    if (numero === 2) return !!(escolhas.dia && escolhas.periodo);
    return false;
  }

  function marcarProgresso() {
    marcas.forEach(function (marca, i) {
      var numero = i + 1;
      var estado = "futura";
      if (numero === aberto) estado = "atual";
      else if (respondido(numero)) estado = "concluida";
      marca.setAttribute("data-estado", estado);
      if (numero === aberto) marca.setAttribute("aria-current", "step");
      else marca.removeAttribute("aria-current");
    });
  }

  /* ---------- resumos ---------- */

  function escreverResumo(numero) {
    var passo = passos[numero - 1];
    var resumo = passo.querySelector(".passo__resumo");
    if (!resumo) return;

    var texto = numero === 1
      ? escolhas.servico
      : maiuscula(escolhas.diaLongo) + " · " + escolhas.periodo;

    resumo.querySelector(".passo__resumo-texto").textContent = texto;
    resumo.setAttribute(
      "aria-label",
      (numero === 1 ? "Serviço: " : "Quando: ") + texto + ". Toque para trocar."
    );
  }

  function maiuscula(txt) {
    return txt ? txt.charAt(0).toUpperCase() + txt.slice(1) : "";
  }

  function escreverConfirmacao() {
    if (!completo()) return;
    var campos = {
      servico: escolhas.servico,
      dia: maiuscula(escolhas.diaLongo),
      periodo: escolhas.periodo
    };
    Array.prototype.forEach.call(
      secao.querySelectorAll(".confirma__item"),
      function (item) {
        item.textContent = campos[item.getAttribute("data-campo")] || "";
      }
    );
    botao.setAttribute("data-mensagem", montarMensagem());
    botao.setAttribute("href", montarLink());
  }

  /* ---------- abrir e recolher um passo ---------- */

  /* direcao 1 = avançando, -1 = voltando. A entrada vem do lado para
     onde a visitante está indo, e a saída vai para o lado oposto: ao
     voltar, o mesmo movimento roda ao contrário. */
  function trocarFace(passo, mostrar, esconder, direcao, atraso) {
    if (!mostrar) return;

    var altura = null;
    if (anima) {
      passo.style.height = passo.offsetHeight + "px";
      mostrar.hidden = false;
      if (esconder) esconder.hidden = false;
      altura = alturaNatural(passo);
    } else {
      mostrar.hidden = false;
      if (esconder) esconder.hidden = true;
      return;
    }

    animarAltura(passo, altura, atraso);

    gsap.fromTo(
      mostrar,
      { opacity: 0, y: 22 * direcao },
      {
        opacity: 1, y: 0,
        duration: DURACAO,
        ease: ENTRADA,
        delay: (atraso || 0) + DURACAO * 0.1,
        clearProps: "transform"
      }
    );

    if (esconder) {
      gsap.to(esconder, {
        opacity: 0,
        y: -14 * direcao,
        duration: DURACAO * 0.7,
        ease: SAIDA,
        delay: atraso || 0,
        onComplete: function () {
          esconder.hidden = true;
          gsap.set(esconder, { clearProps: "opacity,transform" });
        }
      });
    }
  }

  function expandir(numero, direcao, atraso) {
    var passo = passos[numero - 1];
    var corpo = passo.querySelector(".passo__corpo");
    var resumo = passo.querySelector(".passo__resumo");

    /* passo que ainda não estava na tela: entra inteiro, do zero */
    if (passo.hidden) {
      passo.hidden = false;
      if (resumo) resumo.hidden = true;
      corpo.hidden = false;

      if (!anima) return;

      var altura = alturaNatural(passo);
      passo.style.height = "0px";
      animarAltura(passo, altura, atraso);
      gsap.fromTo(
        passo,
        { opacity: 0, y: 26 },
        {
          opacity: 1, y: 0,
          duration: DURACAO,
          ease: ENTRADA,
          delay: (atraso || 0) + DURACAO * 0.08,
          clearProps: "transform"
        }
      );
      return;
    }

    if (corpo.hidden) trocarFace(passo, corpo, resumo, direcao, atraso);
  }

  function recolher(numero, direcao) {
    var passo = passos[numero - 1];
    var corpo = passo.querySelector(".passo__corpo");
    var resumo = passo.querySelector(".passo__resumo");

    /* sem resposta não há o que resumir: o passo sai da tela e volta
       quando a resposta anterior for dada de novo */
    if (!resumo || !respondido(numero)) {
      sumir(passo);
      return;
    }
    escreverResumo(numero);
    if (!corpo.hidden) trocarFace(passo, resumo, corpo, direcao, 0);
  }

  function sumir(passo) {
    if (passo.hidden) return;
    if (!anima) { passo.hidden = true; return; }

    passo.style.height = passo.offsetHeight + "px";
    gsap.to(passo, {
      height: 0, opacity: 0,
      duration: DURACAO * 0.8,
      ease: SAIDA,
      overwrite: "auto",
      onComplete: function () {
        passo.hidden = true;
        passo.style.height = "";
        gsap.set(passo, { clearProps: "opacity,transform" });
      }
    });
  }

  /* ---------- a máquina ---------- */

  /* Quem responde pelo teclado está com o foco dentro do passo que vai
     recolher. Esconder esse elemento devolveria o foco ao <body>, e a
     visitante perderia o lugar na página — então o foco acompanha e vai
     para o primeiro controle do passo que abriu. Sem rolagem: a nossa
     já está a caminho. */
  function levarFoco(passo) {
    var alvo = passo.querySelector(
      ".passo__corpo .cartao, .passo__corpo .pilula, .passo__corpo .botao");
    if (!alvo) return;
    try { alvo.focus({ preventScroll: true }); } catch (e) { alvo.focus(); }
  }

  function irPara(destino, direcao) {
    var anterior = aberto;
    var seguirFoco = secao.contains(document.activeElement);
    aberto = destino;

    if (destino === 3) escreverConfirmacao();

    /* recolhe o que estava aberto e apaga os passos à frente do destino
       que ainda não têm resposta */
    if (anterior !== destino) recolher(anterior, direcao);
    passos.forEach(function (passo, i) {
      var numero = i + 1;
      if (numero > destino && !respondido(numero)) sumir(passo);
    });

    expandir(destino, direcao, anterior === destino ? 0 : DURACAO * SOBREPOE);
    marcarProgresso();
    rolarPara(passos[destino - 1]);
    if (seguirFoco) levarFoco(passos[destino - 1]);
  }

  /* ---------- passo 1: categoria e serviço ---------- */

  function alturaLista(lista, animar) {
    var alvo = lista ? lista.offsetHeight : 0;
    if (!animar || !anima) {
      caixaListas.style.height = alvo + "px";
      return;
    }
    gsap.to(caixaListas, {
      height: alvo, duration: DURACAO * 0.9, ease: ENTRADA, overwrite: true
    });
  }

  function abrirCategoria(indice) {
    var anterior = categoria;
    if (indice === anterior) {
      categoria = -1;
      marcarCategorias();
      alturaLista(null, true);
      fecharLista(listas[anterior]);
      return;
    }

    categoria = indice;
    marcarCategorias();
    if (anterior >= 0) fecharLista(listas[anterior]);

    var lista = listas[indice];
    lista.hidden = false;
    if (!anima) { alturaLista(lista, false); return; }

    alturaLista(lista, true);
    gsap.fromTo(
      lista,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: DURACAO, ease: ENTRADA, clearProps: "transform" }
    );
  }

  function fecharLista(lista) {
    if (!lista) return;
    if (!anima) { lista.hidden = true; return; }
    gsap.to(lista, {
      opacity: 0, y: 10,
      duration: DURACAO * 0.7,
      ease: SAIDA,
      onComplete: function () {
        lista.hidden = true;
        gsap.set(lista, { clearProps: "opacity,transform" });
      }
    });
  }

  function marcarCategorias() {
    cartoes.forEach(function (cartao, i) {
      var ativo = i === categoria;
      cartao.setAttribute("aria-expanded", String(ativo));
      var texto = cartao.querySelector(".cartao__acao-texto");
      if (texto) texto.textContent = ativo ? "Fechar" : "Escolher";
    });
  }

  cartoes.forEach(function (cartao, i) {
    cartao.addEventListener("click", function () { abrirCategoria(i); });
    cartao.addEventListener("keydown", function (ev) {
      andarNaGrade(ev, cartoes, i, window.innerWidth >= 640 ? 3 : 2);
    });
  });

  /* ---------- as pílulas ---------- */

  function marcarGrupo(grupo, escolhida) {
    grupo.forEach(function (pilula) {
      pilula.setAttribute("aria-pressed", String(pilula === escolhida));
    });
  }

  var pilulasServico = Array.prototype.slice.call(
    secao.querySelectorAll(".lista .pilula"));
  var pilulasDia = Array.prototype.slice.call(
    secao.querySelectorAll(".pilulas--dias .pilula"));
  var pilulasPeriodo = Array.prototype.slice.call(
    secao.querySelectorAll(".pilulas--periodos .pilula"));

  pilulasServico.forEach(function (pilula, i) {
    pilula.addEventListener("click", function () {
      escolhas.servico = pilula.getAttribute("data-servico");
      marcarGrupo(pilulasServico, pilula);
      /* já respondido: o passo 1 recolhe e o próximo pendente assume */
      irPara(completo() ? 3 : 2, 1);
    });
    pilula.addEventListener("keydown", function (ev) {
      andarNaLinha(ev, pilulasServico, i);
    });
  });

  function escolherQuando(pilula, grupo) {
    marcarGrupo(grupo, pilula);
    if (grupo === pilulasDia) {
      escolhas.dia = pilula.getAttribute("data-dia");
      escolhas.diaLongo = pilula.getAttribute("data-longo");
    } else {
      escolhas.periodo = pilula.getAttribute("data-periodo");
      escolhas.periodoLongo = pilula.getAttribute("data-longo");
    }
    marcarProgresso();
    /* só avança quando as duas perguntas do passo estiverem respondidas */
    if (escolhas.dia && escolhas.periodo) irPara(3, 1);
  }

  [pilulasDia, pilulasPeriodo].forEach(function (grupo) {
    grupo.forEach(function (pilula, i) {
      pilula.addEventListener("click", function () {
        escolherQuando(pilula, grupo);
      });
      pilula.addEventListener("keydown", function (ev) {
        andarNaLinha(ev, grupo, i);
      });
    });
  });

  /* ---------- voltar pelos resumos ---------- */

  passos.forEach(function (passo, i) {
    var resumo = passo.querySelector(".passo__resumo");
    if (!resumo) return;
    resumo.addEventListener("click", function () { irPara(i + 1, -1); });
  });

  /* ---------- teclado ---------- */

  function andarNaLinha(ev, grupo, i) {
    var passo = 0;
    if (ev.key === "ArrowRight" || ev.key === "ArrowDown") passo = 1;
    else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") passo = -1;
    if (!passo) return;
    ev.preventDefault();
    grupo[(i + passo + grupo.length) % grupo.length].focus();
  }

  function andarNaGrade(ev, grupo, i, colunas) {
    var passo = 0;
    if (ev.key === "ArrowRight") passo = 1;
    else if (ev.key === "ArrowLeft") passo = -1;
    else if (ev.key === "ArrowDown") passo = colunas;
    else if (ev.key === "ArrowUp") passo = -colunas;
    if (!passo) return;
    ev.preventDefault();
    grupo[(i + passo + grupo.length) % grupo.length].focus();
  }

  /* ---------- o botão ---------- */

  /* Sem número de destino o link não leva a lugar nenhum: melhor não
     sair do lugar do que pular para o topo da página. */
  botao.addEventListener("click", function (ev) {
    if (!NUMERO) ev.preventDefault();
  });

  /* ---------- estado inicial e entrada da seção ---------- */

  marcarProgresso();

  function revelarDeImediato() {
    secao.classList.add("agendamento--revelada");
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
      onComplete: revelarDeImediato,
      scrollTrigger: { trigger: secao, start: "top 78%", once: true }
    }
  );

  /* trava: o título não pode ficar escondido se os quadros não chegarem */
  setTimeout(function () {
    if (!secao.classList.contains("agendamento--revelada")) {
      gsap.set(alvos, { yPercent: 0, y: 0 });
      revelarDeImediato();
    }
  }, 12000);
})();
