
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

const campoNome = document.getElementById("nome");
const sugestoesProdutos = document.getElementById("sugestoes-produtos");


// NOVO: Elementos das mensagens e do modal
const mensagemErro = document.getElementById("mensagem-erro");

const modalFundo = document.getElementById("modal-fundo");
const modalTitulo = document.getElementById("modal-titulo");
const modalMensagem = document.getElementById("modal-mensagem");
const modalCancelar = document.getElementById("modal-cancelar");
const modalConfirmar = document.getElementById("modal-confirmar");
const botaoBootstrap = document.getElementById("botao-bootstrap");

let acaoConfirmacao = null;


// NOVO: Mostrar mensagem de erro na página
function mostrarMensagemErro(mensagem) {

    mensagemErro.textContent = mensagem;

    mensagemErro.style.display = "block";

}


// NOVO: Limpar mensagem de erro
function limparMensagemErro() {

    mensagemErro.textContent = "";

    mensagemErro.style.display = "none";

}


// NOVO: Abrir modal personalizado
function abrirModal(titulo, mensagem, acao) {

    modalTitulo.textContent = titulo;

    modalMensagem.textContent = mensagem;

    acaoConfirmacao = acao;

    modalCancelar.textContent = "Cancelar";

    modalConfirmar.style.display = "inline-block";

    modalFundo.style.display = "flex";

}


// NOVO: Fechar modal
function fecharModal() {

    modalFundo.style.display = "none";

    acaoConfirmacao = null;

}


// NOVO: Botão cancelar
modalCancelar.addEventListener("click", function() {

    fecharModal();

});


// NOVO: Botão confirmar
modalConfirmar.addEventListener("click", function() {

    if (acaoConfirmacao !== null) {

        acaoConfirmacao();

    }

    fecharModal();

});



// NOVO: Fechar modal clicando fora
modalFundo.addEventListener("click", function(event) {

    if (event.target === modalFundo) {

        fecharModal();

    }

});


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

    const produtosFiltrados = obterProdutosFiltrados();

    // Calcular o total dos produtos visíveis
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


// Pesquisa dinâmica da tabela
campoBusca.addEventListener("input", function() {

    renderizarTabela();

});


// Mostrar sugestões de produtos cadastrados
function mostrarSugestoes() {

    const termo = campoNome.value.toLowerCase().trim();

    sugestoesProdutos.innerHTML = "";

    if (termo === "") {

        sugestoesProdutos.style.display = "none";
        return;

    }


    // Procurar produtos correspondentes
    const produtosEncontrados = listaDeProdutos

        .map((produto, index) => ({
            produto: produto,
            index: index
        }))

        .filter(item =>
            item.produto.nome.toLowerCase().includes(termo)
        );


    if (produtosEncontrados.length === 0) {

        sugestoesProdutos.style.display = "none";
        return;

    }


    // Criar sugestões
    produtosEncontrados.forEach(item => {

        const sugestao = document.createElement("div");
        sugestao.classList.add("sugestao-produto");
        sugestao.textContent = item.produto.nome;
        sugestao.dataset.index = item.index;
        sugestoesProdutos.appendChild(sugestao);

    });


    sugestoesProdutos.style.display = "block";

}


// Mostrar sugestões enquanto digita
campoNome.addEventListener("input", function() {

    mostrarSugestoes();

});


// Selecionar produto pela sugestão
sugestoesProdutos.addEventListener("click", function(event) {

    if (event.target.classList.contains("sugestao-produto")) {

        const index = Number(event.target.dataset.index);

        prepararEdicao(index);

        sugestoesProdutos.style.display = "none";

    }

});


// Fechar sugestões ao clicar fora
document.addEventListener("click", function(event) {

    if (!event.target.closest(".campo-nome")) {

        sugestoesProdutos.style.display = "none";

    }

});


formProduto.addEventListener("submit", function(event) {

    event.preventDefault();

    limparMensagemErro();

    const nome = campoNome.value.trim();

    const preco = parseFloat(document.getElementById("preco").value);

    const quantidade = parseInt(
        document.getElementById("quantidade").value,
        10
    );


    // Validação dos campos
    if (nome === "") {

        mostrarMensagemErro("Coloque um nome válido no seu produto!");
        return;

    }

    if (isNaN(preco) || preco <= 0) {

        mostrarMensagemErro("Digite um preço válido!");
        return;

    }

    if (isNaN(quantidade) || quantidade <= 0) {

        mostrarMensagemErro("Digite uma quantidade válida!");
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

    sugestoesProdutos.style.display = "none";

    indiceEdicao = null;

    botaoEnviar.textContent = "Adicionar Produto";

    limparMensagemErro();

});


// NOVO: Limpar erro quando começar a digitar
campoNome.addEventListener("input", limparMensagemErro);
document.getElementById("preco").addEventListener("input", limparMensagemErro);
document.getElementById("quantidade").addEventListener("input", limparMensagemErro);


// Preparar edição do produto
function prepararEdicao(index) {

    indiceEdicao = index;

    const produto = listaDeProdutos[index];

    campoNome.value = produto.nome;

    document.getElementById("preco").value = produto.preco;

    document.getElementById("quantidade").value = produto.quantidade;

    botaoEnviar.textContent = "Salvar Alterações";

}


tabelaProdutos.addEventListener("click", function(event) {

    const index = Number(event.target.dataset.index);


    if (event.target.classList.contains("btn-editar")) {

        prepararEdicao(index);

    }


    if (event.target.classList.contains("btn-remover")) {

        // NOVO: Pedir confirmação antes de remover
        abrirModal(
            "Remover Produto",
            "Tem certeza de que deseja remover este produto do estoque?",
            function() {

                listaDeProdutos.splice(index, 1);

                salvarProdutos();

                renderizarTabela();


                // Verificar se o produto removido estava em edição
                if (indiceEdicao === index) {

                    formProduto.reset();

                    sugestoesProdutos.style.display = "none";

                    indiceEdicao = null;

                    botaoEnviar.textContent = "Adicionar Produto";

                } else if (indiceEdicao !== null && indiceEdicao > index) {

                    indiceEdicao--;

                }

            }
        );

    }

});


botaoLimpar.addEventListener("click", function() {

    // NOVO: Modal para limpar todo o estoque
    abrirModal(
        "Limpar Estoque",
        "Deseja realmente limpar todo o estoque? Essa ação não poderá ser desfeita.",
        function() {

            listaDeProdutos = [];

            indiceEdicao = null;

            salvarProdutos();

            renderizarTabela();

            formProduto.reset();

            sugestoesProdutos.style.display = "none";

            botaoEnviar.textContent = "Adicionar Produto";

            limparMensagemErro();

        }
    );

});


// Mostrar produtos ao abrir a página
renderizarTabela();
