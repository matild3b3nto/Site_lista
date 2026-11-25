const cabecalho = document.getElementById("cabecalho");
const menu = document.getElementById("menu");
const menuBotao = document.querySelector(".menu-botao");

const ecraEstreito = window.matchMedia("(max-width: 1230px)");

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
  if (compacto !== cabecalho.classList.contains("compacto")) {
    cabecalho.classList.add("sem-transicao");
    cabecalho.classList.toggle("compacto", compacto);
    void cabecalho.offsetWidth;
    requestAnimationFrame(() => cabecalho.classList.remove("sem-transicao"));
  }
  if (!compacto) {
    fecharMenu();
  }
}

function medirCabecalho() {
  document.documentElement.style.setProperty("--altura-cabecalho", `${cabecalho.offsetHeight}px`);
}

new ResizeObserver(() => {
  if (window.scrollY <= 80) medirCabecalho();
}).observe(cabecalho, { box: "border-box" });

window.addEventListener("scroll", atualizarCabecalho);
ecraEstreito.addEventListener("change", atualizarCabecalho);
atualizarCabecalho();
medirCabecalho();

menuBotao.addEventListener("click", () => {
  const aberto = menu.classList.toggle("aberto");
  menuBotao.setAttribute("aria-expanded", String(aberto));
  menuBotao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
});

menu.querySelectorAll("a").forEach((ligacao) => {
  ligacao.addEventListener("click", fecharMenu);
});

const elementos = document.querySelectorAll(
  ".bloco h2, .bloco-intro, .apresentacao-grelha, .hemiciclo, .facto, .competencia, .candidato, .eixo, .info-cartao, .testemunhos-cartao, .testemunho, .chamada-cartao, .pagina-seguinte-cartao"
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

const URL_TESTEMUNHOS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRbOKl3MzG0iKupV3dfKJN7K0Cjowpw09EPHcHfMGXc8lOzdaDjqH0VFg0I-Y3SVvgBho7_K1T6gXdT/pub?gid=1809321943&single=true&output=csv";
const TESTEMUNHOS_VISIVEIS = 6;

function lerCSV(texto) {
  const linhas = [];
  let linha = [];
  let campo = "";
  let entreAspas = false;

  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (entreAspas) {
      if (c === '"' && texto[i + 1] === '"') {
        campo += '"';
        i++;
      } else if (c === '"') {
        entreAspas = false;
      } else {
        campo += c;
      }
    } else if (c === '"') {
      entreAspas = true;
    } else if (c === ",") {
      linha.push(campo);
      campo = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      linha.push(campo);
      linhas.push(linha);
      linha = [];
      campo = "";
    } else {
      campo += c;
    }
  }
  if (campo !== "" || linha.length > 0) {
    linha.push(campo);
    linhas.push(linha);
  }
  return linhas;
}

function criarTestemunho({ texto, nome, curso }) {
  const figura = document.createElement("figure");
  figura.className = "testemunho";

  const citacao = document.createElement("blockquote");
  citacao.textContent = texto;

  const legenda = document.createElement("figcaption");
  const autor = document.createElement("strong");
  autor.textContent = nome || "Anónimo";
  legenda.append(autor);
  if (curso) legenda.append(curso);

  figura.append(citacao, legenda);
  return figura;
}

async function carregarTestemunhos() {
  const lista = document.querySelector(".testemunhos-lista");
  const botao = document.querySelector(".testemunhos-mais");
  if (!lista || !URL_TESTEMUNHOS.startsWith("http")) return;

  try {
    const resposta = await fetch(URL_TESTEMUNHOS, { cache: "no-store" });
    if (!resposta.ok) return;

    const [cabecalho, ...linhas] = lerCSV(await resposta.text());
    const coluna = (nome) => cabecalho.findIndex((c) => c.trim().toLowerCase() === nome);
    const iTexto = coluna("texto");
    const iNome = coluna("nome");
    const iCurso = coluna("curso");
    if (iTexto === -1) return;

    const testemunhos = linhas
      .map((l) => ({
        texto: (l[iTexto] || "").trim(),
        nome: (l[iNome] || "").trim(),
        curso: (l[iCurso] || "").trim(),
      }))
      .filter((t) => t.texto)
      .reverse();

    testemunhos.forEach((t, indice) => {
      const cartao = criarTestemunho(t);
      if (indice >= TESTEMUNHOS_VISIVEIS) cartao.hidden = true;
      lista.append(cartao);
    });

    if (testemunhos.length > TESTEMUNHOS_VISIVEIS) {
      botao.hidden = false;
      botao.addEventListener("click", () => {
        lista.querySelectorAll(".testemunho[hidden]").forEach((c) => (c.hidden = false));
        botao.hidden = true;
      });
    }
  } catch (erro) {
    return;
  }
}

carregarTestemunhos();


const hemiciclo = document.querySelector(".hemiciclo");

if (hemiciclo) {
  const nota = hemiciclo.querySelector(".hemiciclo-nota");
  const notaInicial = nota.textContent;
  const textos = {
    "estudantes-12": "4 lugares para os representantes dos estudantes de licenciatura e mestrado, eleitos por ti. É a estes lugares que a Ser Universidade de Coimbra se candidata.",
    "estudantes-3": "1 lugar para os representantes dos estudantes de doutoramento, eleito numa votação própria.",
    "docentes": "18 professores e investigadores, eleitos pelos seus pares. São o maior grupo do Conselho.",
    "trabalhadores": "2 representantes dos trabalhadores não docentes e não investigadores.",
    "externos": "10 personalidades de fora da UC, escolhidas pelos membros eleitos, incluindo os estudantes."
  };
  const botoes = hemiciclo.querySelectorAll(".grupo");
  let fixo = "";

  const mostrar = (grupo) => {
    hemiciclo.dataset.ativo = grupo;
    nota.textContent = grupo ? textos[grupo] : notaInicial;
    botoes.forEach((b) => b.classList.toggle("ativo", b.dataset.grupo === grupo));
  };

  botoes.forEach((botao) => {
    const grupo = botao.dataset.grupo;
    botao.addEventListener("mouseenter", () => mostrar(grupo));
    botao.addEventListener("mouseleave", () => mostrar(fixo));
    botao.addEventListener("click", () => {
      fixo = fixo === grupo ? "" : grupo;
      mostrar(fixo);
    });
  });

  hemiciclo.querySelectorAll(".lugar").forEach((lugar) => {
    lugar.addEventListener("mouseenter", () => mostrar(lugar.dataset.grupo));
    lugar.addEventListener("mouseleave", () => mostrar(fixo));
  });
}