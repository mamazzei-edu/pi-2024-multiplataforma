const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uniqueValidator = require('mongoose-unique-validator');
const Usuario = require('./models/User'); 

// Carregar variáveis de ambiente
dotenv.config();

// Configurar e inicializar o Express
const app = express();
app.use(express.json());
app.use(cors());

// Configurações da aplicação
const port = process.env.PORT || 3000;
const mongoUrl = process.env.MONGODB_URL;

// Conectar ao MongoDB e iniciar o servidor
mongoose
    .connect(mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Conectado ao MongoDB com sucesso');
        app.listen(port, () => {
            console.log(`Servidor rodando na porta ${port}`);
        });
    })
    .catch((err) => {
        console.error('Erro ao conectar ao MongoDB:', err.message);
    });

// Definir Esquemas e Modelos do Mongoose
const PointSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true,
    },
    coordinates: {
        type: [Number],
        required: true,
    },
});

const Categorias = new mongoose.Schema({ nome: String });

const EventoBaseSchema = new mongoose.Schema({
    nome: String,
    descricao: String,
    organizador: String,
});
const EventoBase = mongoose.model('EventoBase', EventoBaseSchema);

const EventosCadastrados = mongoose.model('EventosCadastrados', new mongoose.Schema({
    nomeEvento: String,
    dataInicio: String,
    horario: String,
    preco: String,
    descricao: String,
    urlLogo: String,
    urlSite: String,
    cep: String,
    endereco: String,
    numero: String,
    cidade: String,
    estado: String,
    bairro: String,
    categorias: String,
    data_cadastro: String,
}));

const EventoSchema = new mongoose.Schema({
    nome: String,
    data_inicio: Date,
    preco: Number,
    descricao: String,
    url_logo: String,
    url_site: String,
    organizador: String,
    local: {
        type: PointSchema,
        required: true,
        index: '2dsphere',
    },
    endereco: String,
    cidade: String,
    estado: String,
    data_cadastro: Date,
    categorias: [Categorias],
});
const Evento = mongoose.model('Evento', EventoSchema);

const usuarioSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    nome: { type: String, required: true },
    telefone: { type: String, required: true },
    cpf: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
});
usuarioSchema.plugin(uniqueValidator);

// Rotas
// Rota para criar um novo evento base
app.post('/eventos', async (req, res) => {
    try {
        const { nome, descricao, organizador } = req.body;
        const eventoBase = new EventoBase({ nome, descricao, organizador });
        await eventoBase.save();
        res.status(201).json(eventoBase);
    } catch (error) {
        res.status(500).send('Erro ao criar um novo evento base');
    }
});

// Rota para cadastro de evento
app.post('/cadastro', async (req, res) => {
    console.log('Requisição recebida para /cadastro');
    try {
        const {
            nomeEvento,
            dataInicio,
            horario,
            preco,
            descricao,
            urlLogo,
            urlSite,
            cep,
            endereco,
            numero,
            cidade,
            estado,
            categorias,
            bairro,
            data_cadastro,
        } = req.body;

        if (!nomeEvento || !dataInicio || !preco || !descricao || !endereco || !cidade || !estado || !categorias) {
            return res.status(400).send('Preencha todos os campos obrigatórios.');
        }

        const novoEvento = new EventosCadastrados({
            nomeEvento,
            dataInicio,
            horario,
            preco,
            descricao,
            urlLogo,
            urlSite,
            cep,
            endereco,
            numero,
            cidade,
            estado,
            bairro,
            categorias,
            data_cadastro,
        });

        await novoEvento.save();

        const eventos = await EventosCadastrados.find();
        res.json(eventos);
    } catch (error) {
        console.error('Erro ao salvar o evento no MongoDB:', error);
        res.status(500).send('Erro ao salvar ou buscar eventos.');
    }
});


// Endpoint para alterar um evento
app.put('/api/eventos/:id', async (req, res) => {
    try {
        const eventoAtualizado = await EventosCadastrados.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!eventoAtualizado) {
            return res.status(404).send('Evento não encontrado.');
        }

        res.status(200).json(eventoAtualizado);
    } catch (error) {
        console.error('Erro ao alterar o evento:', error);
        res.status(500).send('Erro ao alterar o evento.');
    }
});

// Endpoint para buscar um evento por ID
app.get('/eventos/:id', async (req, res) => {
    try {
        const evento = await EventosCadastrados.findById(req.params.id);
        if (!evento) {
            return res.status(404).send('Evento não encontrado.');
        }
        res.status(200).json(evento);
    } catch (error) {
        res.status(500).send('Erro ao buscar o evento.');
    }
});

// Endpoint para listar todos os eventos
app.get('/eventos', async (req, res) => {
    try {
        const eventos = await EventosCadastrados.find();
        res.status(200).json(eventos);
    } catch (error) {
        res.status(500).send('Erro ao buscar eventos.');
    }
});

<<<<<<< HEAD
// Rota para buscar um evento específico por ID
app.get('/api/eventos/:id', async(req, res) => {
    try {
        const evento = await EventosCadastrados.findById(req.params.id);
        if (evento) {
            res.json(evento);
        } else {
            res.status(404).send('Evento não encontrado');
        }
    } catch (error) {
        res.status(500).send('Erro ao buscar o evento');
    }
});

// Rota para detalhes de evento
app.get('/detalhe-evento/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'detalheEvento.html'));
});



// Rota para cadastro de usuário (signup)
app.post('/signup', async(req, res) => {
=======
// cadastro usuario
app.post('/signup', async (req, res) => {
>>>>>>> 563cfa934f49de04f72d09f0a8d0c4cda497adf3
    const { email, nome, telefone, cpf, senha } = req.body;

    if (!email || !nome || !telefone || !cpf || !senha) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    try {
        const novoUsuario = new Usuario({
            email: email.toLowerCase().trim(),
            nome,
            telefone,
            cpf: cpf.trim(),
            senha: await bcrypt.hash(senha, 10)
        });
        await novoUsuario.save();
        res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
    } catch (err) {
        if (err.code === 11000) { // Erro de duplicação no MongoDB
            const campoDuplicado = Object.keys(err.keyValue)[0]; // Pega o campo duplicado
            return res.status(400).json({
                message: `O campo '${campoDuplicado}' já está em uso.`
            });
        }
        res.status(500).json({ message: 'Erro ao cadastrar usuário. Tente novamente.' });
    }
    
    
});

// login
app.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body; 
        if (!email || !senha) {
            return res.status(400).json({ mensagem: 'Preencha todos os campos obrigatórios' });
        }

        const usuario = await Usuario.findOne({ email }); 
        if (!usuario) {
            return res.status(401).json({ mensagem: 'Usuário não encontrado' });
        }

        const senhaValida = await usuario.validarSenha(senha); 
        if (!senhaValida) {
            return res.status(401).json({ mensagem: 'Senha inválida' });
        }

        const token = usuario.gerarToken(); 
        res.status(200).json({ token });
    } catch (error) {
        console.error('Erro ao realizar login:', error); 
        res.status(500).json({ mensagem: 'Erro ao realizar login' });
    }
});

