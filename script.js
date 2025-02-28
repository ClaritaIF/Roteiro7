const API_URL = 'http://localhost:3000/partidas';

// Configuração padrão para todas as requisições fetch
const fetchConfig = {
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// Função para testar a conexão com o servidor
async function testarConexao() {
    try {
        console.log('Testando conexão com o servidor...');
        const resposta = await fetch('http://localhost:3000/');
        
        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }
        
        const dados = await resposta.json();
        console.log('Resposta do servidor:', dados);
        alert('Servidor está funcionando! ' + dados.message);
    } catch (erro) {
        console.error('Erro ao testar conexão:', erro);
        alert(`Erro ao conectar com o servidor: ${erro.message}\nVerifique se o servidor está rodando em http://localhost:3000`);
    }
}

// Função para buscar e exibir as partidas
async function carregarPartidas() {
    try {
        const listaPartidas = document.getElementById("listaPartidas");
        listaPartidas.innerHTML = "<div class='text-center'>Carregando partidas...</div>";

        console.log('Tentando carregar partidas de:', API_URL);
        const resposta = await fetch(API_URL);
        console.log('Resposta recebida:', resposta);

        if (!resposta.ok) {
            throw new Error(`Erro ao carregar partidas: ${resposta.status}`);
        }
        
        const partidas = await resposta.json();
        console.log('Partidas carregadas:', partidas);
        
        listaPartidas.innerHTML = ""; // Limpa a lista antes de carregar

        if (partidas.length === 0) {
            listaPartidas.innerHTML = "<div class='alert alert-info'>Nenhuma partida cadastrada.</div>";
            return;
        }

        partidas.forEach(partida => {
            const card = document.createElement("div");
            card.classList.add("card", "mb-3");

            card.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${partida.titulo}</h5>
                    <p class="card-text"><strong>Local:</strong> ${partida.local}</p>
                    <p class="card-text"><strong>Data:</strong> ${partida.data} às ${partida.horario}</p>
                    <a href="detalhes.html?id=${partida.id}" class="btn btn-success">Gerenciar Partida</a>
                    <button class="btn btn-danger" onclick="excluirPartida(${partida.id})">Excluir</button>
                </div>
            `;
            listaPartidas.appendChild(card);
        });
    } catch (erro) {
        console.error('Erro ao carregar partidas:', erro);
        document.getElementById("listaPartidas").innerHTML = `
            <div class="alert alert-danger">
                <h5>Erro ao carregar as partidas</h5>
                <p>Verifique se o servidor está rodando em http://localhost:3000</p>
                <p>Detalhes do erro: ${erro.message}</p>
                <button onclick="testarConexao()" class="btn btn-primary mt-2">Testar Conexão</button>
            </div>
        `;
    }
}

// Função para criar uma nova partida
document.getElementById("formNovaPartida").addEventListener("submit", async function(event) {
    event.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const local = document.getElementById("local").value;
    const data = document.getElementById("data").value;
    const horario = document.getElementById("horario").value;

    try {
        console.log('Enviando dados para criar partida:', { titulo, local, data, horario });
        const resposta = await fetch(API_URL, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ titulo, local, data, horario })
        });

        console.log('Resposta recebida:', resposta);

        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.message || `Erro ao criar partida: ${resposta.status}`);
        }

        const dados = await resposta.json();
        console.log('Partida criada:', dados);

        await carregarPartidas(); // Atualiza a lista de partidas
        this.reset(); // Limpa o formulário
        alert('Partida criada com sucesso!');
    } catch (erro) {
        console.error('Erro ao criar partida:', erro);
        alert(`Erro ao criar partida: ${erro.message}`);
    }
});

// Função para excluir uma partida
async function excluirPartida(id) {
    if (confirm("Tem certeza que deseja excluir esta partida?")) {
        try {
            console.log('Excluindo partida:', id);
            const resposta = await fetch(`${API_URL}/${id}`, { 
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Resposta recebida:', resposta);

            if (!resposta.ok) {
                const erro = await resposta.json();
                throw new Error(erro.message || `Erro ao excluir partida: ${resposta.status}`);
            }

            await carregarPartidas();
            alert('Partida excluída com sucesso!');
        } catch (erro) {
            console.error('Erro ao excluir partida:', erro);
            alert(`Erro ao excluir partida: ${erro.message}`);
        }
    }
}

// Carregar as partidas ao iniciar a página
carregarPartidas();