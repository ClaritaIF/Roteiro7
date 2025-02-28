// index.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware para parse de JSON
app.use(express.json());

// Caminho para o arquivo JSON que armazenará os dados
const dbPath = path.join(__dirname, 'db.json');

// Função para ler os dados do arquivo JSON
const readData = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return { partidas: [] };
  }
};

// Função para escrever os dados no arquivo JSON
const writeData = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// Rota para criar uma nova partida
app.post('/partidas', (req, res) => {
  const { titulo, local, data, horario } = req.body;
  if (!titulo || !local || !data || !horario) {
    return res.status(400).json({ message: 'Campos obrigatórios ausentes.' });
  }
  const db = readData();
  const novaPartida = {
    id: Date.now(), // id simples baseado em timestamp
    titulo,
    local,
    data,
    horario,
    jogadores: [] // lista de jogadores inicialmente vazia
  };
  db.partidas.push(novaPartida);
  writeData(db);
  res.status(201).json(novaPartida);
});

// Rota para listar todas as partidas
app.get('/partidas', (req, res) => {
  const db = readData();
  res.json(db.partidas);
});

// Rota para obter detalhes de uma partida específica
app.get('/partidas/:id', (req, res) => {
  const db = readData();
  const partida = db.partidas.find(p => p.id == req.params.id);
  if (!partida) {
    return res.status(404).json({ message: 'Partida não encontrada.' });
  }
  res.json(partida);
});

// Rota para atualizar uma partida (ex: editar título, local, etc.)
app.put('/partidas/:id', (req, res) => {
  const db = readData();
  const index = db.partidas.findIndex(p => p.id == req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Partida não encontrada.' });
  }
  const { titulo, local, data, horario } = req.body;
  db.partidas[index] = {
    ...db.partidas[index],
    titulo: titulo || db.partidas[index].titulo,
    local: local || db.partidas[index].local,
    data: data || db.partidas[index].data,
    horario: horario || db.partidas[index].horario,
  };
  writeData(db);
  res.json(db.partidas[index]);
});

// Rota para excluir uma partida
app.delete('/partidas/:id', (req, res) => {
  const db = readData();
  const filtered = db.partidas.filter(p => p.id != req.params.id);
  if (filtered.length === db.partidas.length) {
    return res.status(404).json({ message: 'Partida não encontrada.' });
  }
  db.partidas = filtered;
  writeData(db);
  res.json({ message: 'Partida excluída com sucesso.' });
});

// Rota para adicionar um jogador a uma partida
app.post('/partidas/:id/jogadores', (req, res) => {
  const db = readData();
  const partida = db.partidas.find(p => p.id == req.params.id);
  if (!partida) {
    return res.status(404).json({ message: 'Partida não encontrada.' });
  }
  const { nome, telefone } = req.body;
  if (!nome || !telefone) {
    return res.status(400).json({ message: 'Nome e telefone são obrigatórios.' });
  }
  const novoJogador = {
    id: Date.now(), // id simples baseado em timestamp
    nome,
    telefone,
    confirmado: false // status de presença
  };
  partida.jogadores.push(novoJogador);
  writeData(db);
  res.status(201).json(novoJogador);
});

// Rota para remover um jogador de uma partida
app.delete('/partidas/:id/jogadores/:jogadorId', (req, res) => {
  const db = readData();
  const partida = db.partidas.find(p => p.id == req.params.id);
  if (!partida) {
    return res.status(404).json({ message: 'Partida não encontrada.' });
  }
  const filtered = partida.jogadores.filter(j => j.id != req.params.jogadorId);
  if (filtered.length === partida.jogadores.length) {
    return res.status(404).json({ message: 'Jogador não encontrado.' });
  }
  partida.jogadores = filtered;
  writeData(db);
  res.json({ message: 'Jogador removido com sucesso.' });
});

// Rota para confirmar a presença de um jogador
app.patch('/partidas/:id/jogadores/:jogadorId', (req, res) => {
  const db = readData();
  const partida = db.partidas.find(p => p.id == req.params.id);
  if (!partida) {
    return res.status(404).json({ message: 'Partida não encontrada.' });
  }
  const jogador = partida.jogadores.find(j => j.id == req.params.jogadorId);
  if (!jogador) {
    return res.status(404).json({ message: 'Jogador não encontrado.' });
  }
  jogador.confirmado = true; // pode ser atualizado conforme a lógica desejada
  writeData(db);
  res.json(jogador);
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
