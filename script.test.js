
// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";

const html = readFileSync("index.html", "utf8");

async function iniciarAplicacao() {
  document.open();
  document.write(html);
  document.close();

  localStorage.clear();

  vi.resetModules();
  await import("./script.js");
}

function preencherCampo(nome, valor) {
  const campo = document.querySelector(`[name="${nome}"]`);
  if (!campo) throw new Error(`Campo não encontrado: ${nome}`);
  campo.value = valor;
}

function cadastrarProduto({ nome, categoria, preco, descricao = "" }) {
  preencherCampo("nome", nome);
  preencherCampo("categoria", categoria);
  preencherCampo("preco", preco);
  preencherCampo("descricao", descricao);

  document.getElementById("form-produto").dispatchEvent(
    new Event("submit", { bubbles: true, cancelable: true })
  );
}

describe("NexaVarejo", () => {
  beforeEach(async () => {
    await iniciarAplicacao();
  });

  it("carrega o formulário e a lista de produtos", () => {
    expect(document.getElementById("form-produto")).not.toBeNull();
    expect(document.getElementById("lista-produtos")).not.toBeNull();
  });

  it("inicia sem produtos cadastrados", () => {
    expect(document.getElementById("lista-produtos").children.length).toBe(0);
  });

  it("mostra a mensagem de lista vazia", () => {
    expect(document.getElementById("vazio").hidden).toBe(false);
  });

  it("cadastra um produto válido", () => {
    cadastrarProduto({
      nome: "Caderno",
      categoria: "Papelaria",
      preco: "15.50",
    });

    expect(document.getElementById("lista-produtos").textContent)
      .toContain("Caderno");
    expect(JSON.parse(localStorage.getItem("nexavarejo-produtos")))
      .toHaveLength(1);
  });

  it("rejeita preço igual a zero", () => {
    cadastrarProduto({
      nome: "Caderno",
      categoria: "Papelaria",
      preco: "0",
    });

    expect(document.getElementById("mensagem").textContent)
      .toContain("preço válido");
    expect(JSON.parse(localStorage.getItem("nexavarejo-produtos") || "[]"))
      .toHaveLength(0);
  });

  it("pesquisa produtos pelo nome", () => {
    cadastrarProduto({
      nome: "Caderno",
      categoria: "Papelaria",
      preco: "15.50",
    });

    const pesquisa = document.getElementById("pesquisa");
    pesquisa.value = "caderno";
    pesquisa.dispatchEvent(new Event("input", { bubbles: true }));

    expect(document.getElementById("lista-produtos").textContent)
      .toContain("Caderno");
  });
});
