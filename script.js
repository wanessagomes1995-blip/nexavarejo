
const formulario = document.getElementById("form-produto");
const lista = document.getElementById("lista-produtos");
const pesquisa = document.getElementById("pesquisa");
const mensagem = document.getElementById("mensagem");
const vazio = document.getElementById("vazio");

let produtos = [];

try {
  const dadosSalvos = JSON.parse(
    localStorage.getItem("nexavarejo-produtos") || "[]"
  );

  if (Array.isArray(dadosSalvos)) {
    produtos = dadosSalvos.filter((produto) =>
      produto &&
      typeof produto.nome === "string" &&
      typeof produto.categoria === "string" &&
      Number.isFinite(produto.preco) &&
      produto.preco > 0
    );
  }
} catch {
  produtos = [];
}

function salvarProdutos() {
  try {
    localStorage.setItem(
      "nexavarejo-produtos",
      JSON.stringify(produtos)
    );
    return true;
  } catch {
    mensagem.textContent =
      "Não foi possível salvar os dados neste navegador.";
    return false;
  }
}

function renderizarProdutos() {
  const termo = pesquisa.value.trim().toLowerCase();

  const encontrados = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(termo)
  );

  lista.replaceChildren();
  vazio.hidden = encontrados.length > 0;

  encontrados.forEach((produto) => {
    const item = document.createElement("li");
    const nome = document.createElement("strong");
    const detalhes = document.createElement("p");

    nome.textContent = produto.nome;
    detalhes.textContent =
      `${produto.categoria} — R$ ${produto.preco.toFixed(2)}`
      + (produto.descricao ? ` — ${produto.descricao}` : "");

    item.append(nome, detalhes);
    lista.appendChild(item);
  });
}

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const dados = new FormData(formulario);
  const nome = String(dados.get("nome")).trim();
  const categoria = String(dados.get("categoria")).trim();
  const preco = Number(dados.get("preco"));
  const descricao = String(dados.get("descricao")).trim();

  if (!nome || !categoria || !Number.isFinite(preco) || preco <= 0) {
    mensagem.textContent =
      "Preencha os campos corretamente e informe um preço positivo.";
    return;
  }

  const produto = { nome, categoria, preco, descricao };
  produtos.push(produto);

  if (!salvarProdutos()) {
    produtos.pop();
    return;
  }

  formulario.reset();
  mensagem.textContent = "Produto cadastrado com sucesso!";
  renderizarProdutos();
});

pesquisa.addEventListener("input", renderizarProdutos);

renderizarProdutos();
