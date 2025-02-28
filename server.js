const express = require('express');
const cors = require('cors');
const app = express();

// Configuração mais específica do CORS
const corsOptions = {
    origin: '*', // Permite todas as origens
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Aplica as configurações do CORS
app.use(cors(corsOptions));

// Middleware para processar JSON
app.use(express.json());

// Array para armazenar as partidas (você pode substituir por um banco de dados)
let partidas = [];

// Middleware para logging de requisições
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Rota para listar todas as partidas
app.get('/partidas', (req, res) => {
    console.log('Partidas atuais:', partidas);
    res.json(partidas);
});

// Rota para criar uma nova partida
app.post('/partidas', (req, res) => {
    console.log('Dados recebidos:', req.body);
    const novaPartida = {
        id: Date.now(), // ID único baseado no timestamp
        ...req.body
    };
    partidas.push(novaPartida);
    console.log('Nova partida criada:', novaPartida);
    res.status(201).json(novaPartida);
});

// Rota para excluir uma partida
app.delete('/partidas/:id', (req, res) => {
    const id = parseInt(req.params.id);
    partidas = partidas.filter(partida => partida.id !== id);
    res.status(204).send();
});

// Inicia o servidor na porta 3000
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
    console.log('CORS configurado para aceitar requisições de qualquer origem');
}); 