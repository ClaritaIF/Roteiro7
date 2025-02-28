const API_URL = 'http://localhost:3000/partidas';
const urlParams = new URLSearchParams(window.location.search);
const partidaId = urlParams.get('id');

// Verifica se tem ID na URL
if (!partidaId) {
    document.getElementById("detalhesPartida").innerHTML = `
        <div class="card-body">
            <h5 class="card-title">Erro</h5>
            <p class="card-text text-danger">ID da partida não fornecido</p>
            <a href="index.html" class="btn btn-primary">Voltar para a lista</a>
        </div>
    `;
} else {
    // Carregar os detalhes da partida ao iniciar a página
    carregarDetalhes();
}

// Função para carregar os detalhes da partida
async function carregarDetalhes() {
    try {
        const resposta = await fetch(`${API_URL}/${partidaId}`);
        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.message || dados.erro || 'Erro ao carregar partida');
        }
        
        document.getElementById("detalhesPartida").innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${dados.titulo}</h5>
                <p class="card-text"><strong>Local:</strong> ${dados.local}</p>
                <p class="card-text"><strong>Data:</strong> ${dados.data} às ${dados.horario}</p>
            </div>
        `;
        
        // Mostra o formulário quando a partida é encontrada
        document.getElementById("formAdicionarJogador").style.display = 'block';
        
        exibirJogadores(dados.jogadores || []);
    } catch (erro) {
        console.error('Erro:', erro);
        document.getElementById("detalhesPartida").innerHTML = `
            <div class="card-body">
                <h5 class="card-title">Partida não encontrada</h5>
                <p class="card-text text-danger">${erro.message}</p>
                <a href="index.html" class="btn btn-primary">Voltar para a lista</a>
            </div>
        `;
        document.getElementById("listaJogadores").innerHTML = '';
        document.getElementById("formAdicionarJogador").style.display = 'none';
    }
}

// Função para exibir os jogadores da partida
function exibirJogadores(jogadores) {
    const listaJogadores = document.getElementById("listaJogadores");
    listaJogadores.innerHTML = ""; // Limpa a lista antes de carregar

    if (jogadores.length === 0) {
        listaJogadores.innerHTML = '<div class="alert alert-info">Nenhum jogador cadastrado ainda.</div>';
        return;
    }

    jogadores.forEach(jogador => {
        const jogadorDiv = document.createElement("div");
        jogadorDiv.classList.add("card", "mb-3");
        jogadorDiv.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${jogador.nome}</h5>
                <p class="card-text"><strong>Telefone:</strong> ${jogador.telefone}</p>
                <p class="card-text"><strong>Presença:</strong> ${jogador.confirmado ? 'Confirmado' : 'Não confirmado'}</p>
                <button class="btn btn-success me-2" onclick="confirmarPresenca(${jogador.id})">${jogador.confirmado ? 'Presença Confirmada' : 'Confirmar Presença'}</button>
                <button class="btn btn-danger" onclick="removerJogador(${jogador.id})">Remover</button>
            </div>
        `;
        listaJogadores.appendChild(jogadorDiv);
    });
}

// Função para adicionar um novo jogador à partida
document.getElementById("formAdicionarJogador").addEventListener("submit", async function(event) {
    event.preventDefault();

    try {
        const nome = document.getElementById("nome").value;
        const telefone = document.getElementById("telefone").value;

        const resposta = await fetch(`${API_URL}/${partidaId}/jogadores`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, telefone })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.message || dados.erro || 'Erro ao adicionar jogador');
        }

        await carregarDetalhes(); // Atualiza a lista de jogadores
        this.reset(); // Limpa o formulário
        alert('Jogador adicionado com sucesso!');
    } catch (erro) {
        console.error('Erro:', erro);
        alert(erro.message);
    }
});

// Função para remover um jogador
async function removerJogador(jogadorId) {
    if (confirm("Tem certeza que deseja remover este jogador?")) {
        try {
            const resposta = await fetch(`${API_URL}/${partidaId}/jogadores/${jogadorId}`, { 
                method: "DELETE" 
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.message || dados.erro || 'Erro ao remover jogador');
            }

            await carregarDetalhes(); // Atualiza a lista de jogadores
            alert('Jogador removido com sucesso!');
        } catch (erro) {
            console.error('Erro:', erro);
            alert(erro.message);
        }
    }
}

// Função para confirmar a presença de um jogador
async function confirmarPresenca(jogadorId) {
    try {
        const resposta = await fetch(`${API_URL}/${partidaId}/jogadores/${jogadorId}`, {
            method: "PATCH"
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.message || dados.erro || 'Erro ao confirmar presença');
        }

        await carregarDetalhes(); // Atualiza a lista de jogadores
    } catch (erro) {
        console.error('Erro:', erro);
        alert(erro.message);
    }
}