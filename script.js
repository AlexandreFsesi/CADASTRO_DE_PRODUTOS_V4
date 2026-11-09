// Classe Produto
class Produto {

    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.preco = preco;
        this.quantidade = quantidade;
    }

    calcularSubtotal() {
        return this.preco * this.quantidade;
    }

}


// Lista de produtos
let listaDeProdutos = [];

let indiceEdicao = null;


// Elementos do HTML
const formProduto = document.getElementById("produto-form");
const tabelaProdutos = document.querySelector("#tabela-produtos tbody");
const totalEstoque = document.getElementById("total-estoque");
const botaoLimpar = document.getElementById("limpar-tabela");
const botaoEnviar = document.querySelector(".btn-primary");
const campoBusca = document.getElementById("campo-busca");


// Carregar produtos salvos
const produtosSalvos = localStorage.getItem("produtos");

if (produtosSalvos) {

    listaDeProdutos = JSON.parse(produtosSalvos).map(produto =>
        new Produto(
            produto.nome,
            produto.preco,
            produto.quantidade
        )
    );

}


// Função para salvar no localStorage
function salvarProdutos() {

    localStorage.setItem(
        "produtos",
        JSON.stringify(listaDeProdutos)
    );

}


// Função para obter produtos filtrados
function obterProdutosFiltrados() {

    const termoBusca = campoBusca.value.toLowerCase().trim();

    return listaDeProdutos

        .map((produto, index) => ({
            produto: produto,
            index: index
        }))

        .filter(item =>
            item.produto.nome.toLowerCase().includes(termoBusca)
        );

}


// Função para renderizar a tabela
function renderizarTabela() {

    tabelaProdutos.innerHTML = "";

    // Obter somente os produtos encontrados na pesquisa
    const produtosFiltrados = obterProdutosFiltrados();


    // Calcular o total somente dos produtos visíveis
    const total = produtosFiltrados.reduce(
        (soma, item) => soma + item.produto.calcularSubtotal(),
        0
    );


    // Verificar se existem produtos encontrados
    if (produtosFiltrados.length === 0) {

        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td colspan="5" class="mensagem-vazia">
                Nenhum produto encontrado.
            </td>
        `;

        tabelaProdutos.appendChild(linha);

    } else {

        produtosFiltrados.forEach(item => {

            const produto = item.produto;
            const index = item.index;
            const subtotal = produto.calcularSubtotal();
            let linha = document.createElement("tr");

            linha.innerHTML = `
                <td>${produto.nome}</td>

                <td>R$ ${produto.preco.toFixed(2)}</td>

                <td>${produto.quantidade}</td>

                <td>R$ ${subtotal.toFixed(2)}</td>

                <td>
                    <button class="btn-editar" data-index="${index}">
                        Editar
                    </button>

                    <button class="btn-remover" data-index="${index}">
                        Remover
                    </button>
                </td>
            `;

            tabelaProdutos.appendChild(linha);

        });

    }


    // Atualizar o total em estoque
    totalEstoque.textContent = `R$ ${total.toFixed(2)}`;

}


// Evento de pesquisa dinâmica
campoBusca.addEventListener("input", function() {

    renderizarTabela();

});


// Cadastro e edição de produtos
formProduto.addEventListener("submit", function(event) {

    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();

    const preco = parseFloat(document.getElementById("preco").value);

    const quantidade = parseInt(
        document.getElementById("quantidade").value,
        10
    );


    // Validação dos campos
    if (nome === "") {
        alert("Coloque um nome válido no seu produto!");
        return;
    }

    if (isNaN(preco) || preco <= 0) {
        alert("Digite um preço válido!");
        return;
    }

    if (isNaN(quantidade) || quantidade <= 0) {
        alert("Digite uma quantidade válida!");
        return;
    }


    const novoProduto = new Produto(nome, preco, quantidade);


    // Verificar se está cadastrando ou editando
    if (indiceEdicao === null) {

        listaDeProdutos.push(novoProduto);

    } else {

        listaDeProdutos[indiceEdicao] = novoProduto;

    }


    // Salvar alterações
    salvarProdutos();

    renderizarTabela();

    formProduto.reset();

    indiceEdicao = null;

    botaoEnviar.textContent = "Adicionar Produto";

});


// Preparar edição do produto
function prepararEdicao(index) {

    indiceEdicao = index;

    const produto = listaDeProdutos[index];

    document.getElementById("nome").value = produto.nome;
    document.getElementById("preco").value = produto.preco;
    document.getElementById("quantidade").value = produto.quantidade;

    botaoEnviar.textContent = "Salvar Alterações";

}


// Editar e remover produtos
tabelaProdutos.addEventListener("click", function(event) {

    const index = Number(event.target.dataset.index);


    if (event.target.classList.contains("btn-editar")) {

        prepararEdicao(index);

    }


    if (event.target.classList.contains("btn-remover")) {

        listaDeProdutos.splice(index, 1);

        salvarProdutos();

        renderizarTabela();


        // Verificar se o produto removido estava em edição
        if (indiceEdicao === index) {

            formProduto.reset();

            indiceEdicao = null;

            botaoEnviar.textContent = "Adicionar Produto";

        } else if (indiceEdicao !== null && indiceEdicao > index) {

            indiceEdicao--;

        }

    }

});


// Limpar todo o estoque
botaoLimpar.addEventListener("click", function() {

    if (confirm("Deseja realmente limpar todo o estoque?")) {

        listaDeProdutos = [];

        indiceEdicao = null;

        salvarProdutos();

        renderizarTabela();

        formProduto.reset();

        botaoEnviar.textContent = "Adicionar Produto";

    }

});


// Mostrar produtos ao abrir a página
renderizarTabela();
