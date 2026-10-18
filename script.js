const cabecalho = document.getElementById("cabecalho");
const menu = document.getElementById("menu");
const menuBotao = document.querySelector(".menu-botao");

const ecraEstreito = window.matchMedia("(max-width: 860px)");

const grupos = document.querySelectorAll(".menu-grupo");

function fecharGrupos() {
  grupos.forEach((grupo) => {
    grupo.classList.remove("aberto");
    grupo.querySelector(".menu-grupo-botao").setAttribute("aria-expanded", "false");
  });
}

grupos.forEach((grupo) => {
  const botao = grupo.querySelector(".menu-grupo-botao");
  botao.addEventListener("click", () => {
    const abrir = !grupo.classList.contains("aberto");
    fecharGrupos();
    if (abrir) {
      grupo.classList.add("aberto");
      botao.setAttribute("aria-expanded", "true");
    }
  });
});

document.addEventListener("click", (evento) => {
  if (!evento.target.closest("#cabecalho")) {
    fecharGrupos();
    fecharMenu();
  }
});

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape") {
    fecharGrupos();
    fecharMenu();
  }
});

function fecharMenu() {
  fecharGrupos();
  menu.classList.remove("aberto");
  menuBotao.setAttribute("aria-expanded", "false");
  menuBotao.setAttribute("aria-label", "Abrir menu");
}

function atualizarCabecalho() {
  const compacto = window.scrollY > 80 || ecraEstreito.matches;
  cabecalho.classList.toggle("compacto", compacto);
  if (!compacto) {
    fecharMenu();
  }
}

window.addEventListener("scroll", atualizarCabecalho);
ecraEstreito.addEventListener("change", atualizarCabecalho);
atualizarCabecalho();

menuBotao.addEventListener("click", () => {
  const aberto = menu.classList.toggle("aberto");
  menuBotao.setAttribute("aria-expanded", String(aberto));
  menuBotao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
});

menu.querySelectorAll("a").forEach((ligacao) => {
  ligacao.addEventListener("click", fecharMenu);
});

const elementos = document.querySelectorAll(
  ".bloco h2, .bloco-intro, .apresentacao-grelha, .candidato, .eixo, .info-cartao, .chamada h2, .pagina-seguinte-cartao"
);

const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (entrada.isIntersecting) {
      const alvo = entrada.target;
      alvo.classList.add("visivel");
      alvo.addEventListener("transitionend", () => {
        alvo.classList.remove("revelar", "visivel");
        alvo.style.transitionDelay = "";
      }, { once: true });
      observador.unobserve(alvo);
    }
  });
}, { threshold: 0.15 });

elementos.forEach((elemento, indice) => {
  elemento.classList.add("revelar");
  elemento.style.transitionDelay = `${(indice % 3) * 0.1}s`;
  observador.observe(elemento);
});

const ligacoesIndice = document.querySelectorAll(".indice a");

if (ligacoesIndice.length > 0) {
  const observadorIndice = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        ligacoesIndice.forEach((ligacao) => {
          ligacao.classList.toggle("ativo", ligacao.getAttribute("href") === `#${entrada.target.id}`);
        });
      }
    });
  }, { rootMargin: "-30% 0px -60% 0px" });

  document.querySelectorAll(".texto-manifesto > section").forEach((seccao) => {
    observadorIndice.observe(seccao);
  });
}