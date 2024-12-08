const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uniqueValidator = require('mongoose-unique-validator');

// Carregar variáveis de ambiente
dotenv.config();

// Configurar e inicializar o Express
const app = express();
app.use(express.json());
app.use(cors());

const port = 3000;
const uri = process.env.MONGODB_URL;

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

const EventosCadastrados = mongoose.model('EventosCadastrados', mongoose.Schema({
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
    login: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
usuarioSchema.plugin(uniqueValidator);
const Usuario = mongoose.model('Usuario', usuarioSchema);

// Conectar ao MongoDB antes de iniciar o servidor
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Conectado ao MongoDB com sucesso');

    // Iniciar o servidor após a conexão com o MongoDB
    app.listen(port, () => {
        console.log(`Servidor rodando na porta ${port}`);
    });
}).catch(err => {
    console.error('Erro ao conectar ao MongoDB:', err.message);
});


// Rota para criar um novo evento base
app.post("/eventos", async(req, res) => {
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
app.post("/cadastro", async(req, res) => {
    console.log("Requisição recebida para /cadastro");
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
            data_cadastro
        } = req.body;

        // Validação de campos obrigatórios
        if (!nomeEvento || !dataInicio || !preco || !descricao || !endereco || !cidade || !estado || !categorias) {
            return res.status(400).send("Preencha todos os campos obrigatórios.");
        }

        // Criação de novo evento usando o modelo correto
        const novoEvento = new EventosCadastrados({
            nomeEvento: nomeEvento,
            dataInicio: dataInicio,
            horario: horario,
            preco: preco,
            descricao: descricao,
            urlLogo: urlLogo,
            urlSite: urlSite,
            cep: cep,
            endereco: endereco,
            numero: numero,
            cidade: cidade,
            estado: estado,
            bairro: bairro,
            categorias: categorias,
            data_cadastro: data_cadastro
        });

        // Salvando evento no MongoDB
        await novoEvento.save();

        // Buscando todos os eventos e retornando
        const eventos = await EventosCadastrados.find();
        res.json(eventos);
    } catch (error) {
        console.error("Erro ao salvar o evento no MongoDB:", error);
        res.status(500).send("Erro ao salvar ou buscar eventos.");
    }
});

// Endpoint para alterar um evento
app.put("/api/eventos/:id", async(req, res) => {
    try {
        const {
            nomeEvento,
            dataInicio,
            preco,
            descricao,
            urlLogo,
            urlSite,
            cep,
            endereco,
            numero,
            bairro,
            cidade,
            estado,
            categorias,
        } = req.body;

        // Atualização do evento existente
        const eventoAtualizado = await EventosCadastrados.findByIdAndUpdate(req.params.id, {
            nomeEvento,
            dataInicio,
            preco,
            descricao,
            urlLogo,
            urlSite,
            cep,
            endereco,
            numero,
            bairro,
            cidade,
            estado,
            categorias,
        }, { new: true });

        if (!eventoAtualizado) {
            return res.status(404).send("Evento não encontrado.");
        }

        res.status(200).json(eventoAtualizado);
    } catch (error) {
        console.error("Erro ao alterar o evento:", error);
        res.status(500).send("Erro ao alterar o evento.");
    }
});



// Endpoint para buscar um evento por ID
app.get("/eventos/:id", async(req, res) => {
    try {
        const evento = await EventosCadastrados.findById(req.params.id);
        if (!evento) {
            return res.status(404).send("Evento não encontrado.");
        }
        res.status(200).json(evento);
    } catch (error) {
        res.status(500).send("Erro ao buscar o evento.");
    }
});

// Endpoint para listar todos os eventos (nova rota)
app.get('/api/eventos', async(req, res) => {
    try {
        const eventos = await EventosCadastrados.find();
        res.json(eventos);
    } catch (error) {
        res.status(500).send('Erro ao buscar os eventos');
    }
});

// Endpoint para listar todos os eventos
app.get("/eventos", async(req, res) => {
    try {
        const eventos = await EventosCadastrados.find();
        res.status(200).json(eventos);
    } catch (error) {
        res.status(500).send("Erro ao buscar eventos.");
    }
});

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




// Rota para cadastro de usuário (signup)
app.post('/signup', async(req, res) => {
    const { email, nome, telefone, cpf, senha } = req.body;

    if (!email || !nome || !telefone || !cpf || !senha) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios" });
    }

    try {
        const novoUsuario = new Usuario({
            email,
            nome,
            telefone,
            cpf,
            senha: await bcrypt.hash(senha, 10), // Criptografando a senha
        });

        await novoUsuario.save();
        console.log("Usuário criado:", novoUsuario); // Adicionando um log para verificar os dados

        res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
    } catch (err) {
        console.error("Erro ao cadastrar usuário:", err);
        res.status(500).json({ message: "Erro ao cadastrar usuário, tente novamente." });
    }
});

// Rota para login de usuário
app.post('/login', async(req, res) => {
    try {
        const { login, password } = req.body;
        const usuario = await Usuario.findOne({ login });
        if (!usuario) {
            return res.status(401).json({ mensagem: "Login inválido" });
        }
        const senhaValida = await bcrypt.compare(password, usuario.password);
        if (!senhaValida) {
            return res.status(401).json({ mensagem: "Senha inválida" });
        }
        const token = jwt.sign({ login }, "chave-secreta", { expiresIn: "1h" });
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).send("Erro ao realizar login");
    }
});