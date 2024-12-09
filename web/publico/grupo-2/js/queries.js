const protocolo = 'http://'
const baseURL = 'localhost:3000'

async function cadastrarEvento() {
    //pega os inputs que contém os valores que o usuário digitou
    let nomeInput = document.querySelector('#nomeInput')
    let descricaoInput = document.querySelector('#descricaoInput')
    let urlBannerInput = document.querySelector('#urlBannerInput')
    let dataInicioInput = document.querySelector('#dataInicioInput')
    let dataFimInput = document.querySelector('#dataFimInput')
    let horarioInicioInput = document.querySelector('#horarioInicioInput')
    let horarioFimInput = document.querySelector('#horarioFimInput')
    let valorInput = document.querySelector('#valorInput')
    let urlIngressoInput = document.querySelector('#urlIngressoInput')
    let ruaInput = document.querySelector('#ruaInput')
    let numeroInput = document.querySelector('#numeroInput')
    let bairroInput = document.querySelector('#bairroInput')
    let estadoInput = document.querySelector('#estadoInput')
    let cepInput = document.querySelector('#cepInput')
    let complementoInput = document.querySelector('#complementoInput')
    let categoriaInput = document.querySelector('#categoriaInput')

    //pega os valores digitados pelo usuário
    let nome = nomeInput.value
    let descricao = descricaoInput.value
    let urlBanner = urlBannerInput.value
    let dataInicio = dataInicioInput.value
    let dataFim = dataFimInput.value
    let horarioInicio = horarioInicioInput.value
    let horarioFim = horarioFimInput.value
    let categoria = categoriaInput.value

    let ingresso = {
        valor: valorInput.value,
        urlIngresso: urlIngressoInput.value
    }

    let endereco = {
        rua: ruaInput.value,
        numero: numeroInput.value,
        bairro: bairroInput.value,
        estado: estadoInput.value,
        cep: cepInput.value,
        complemento: complementoInput.value
    }
    
    //limpa os campos que o usuário digitou
    nomeInput.value = ""
    descricaoInput.value = ""
    urlBannerInput.value = ""
    dataInicioInput.value = ""
    dataFimInput.value = ""
    horarioInicioInput.value = ""
    horarioFimInput.value = ""
    valorInput.value = ""
    urlIngressoInput.value = ""
    ruaInput.value = ""
    numeroInput.value = ""
    bairroInput.value = ""
    estadoInput.value = ""
    cepInput.value = ""
    complementoInput.value = ""

    const usuario = JSON.parse(localStorage.getItem("Usuario"))
    console.log(usuario)
    if(!usuario){
        alert("Faça login antes de cadastrar um evento!")
        return
    }

    try{
        //envia os dados ao servidor (back end)
        const eventosEndpoint = '/evento'
        const URLCompleta = `${protocolo}${baseURL}${eventosEndpoint}`

        const eventos = (await axios.post(URLCompleta, {
                    nome,
                    descricao,
                    usuario,
                    urlBanner,
                    dataInicio,
                    dataFim,
                    horarioInicio,
                    horarioFim,
                    ingresso,
                    endereco,
                    categoria
                }
            )
        ).data

        console.log(eventos)
        exibirAlerta("Evento cadastrado com sucesso!","alert-success")
    }catch(error){
        exibirAlerta("Ocorreu um erro ao tentar cadastrar o evento","alert-danger")
        console.log(error)
    }
}

async function buscarEventos(){
    const eventosEndpoint = '/eventos'
    const URLCompleta = `${protocolo}${baseURL}${eventosEndpoint}`
    const eventos = (await axios.get(URLCompleta)).data

    eventos.forEach(evento => {
        let dataInicio = evento.dataInicio 
        let dataInicioSeparada = dataInicio.split('-')
        dataInicio = `${dataInicioSeparada[2]}/${dataInicioSeparada[1]}`
        evento.dataInicio = dataInicio

        let dataFim = evento.dataFim
        let dataFimSeparada = dataInicio.split('-')
        dataFim = `${dataFimSeparada[2]}/${dataFimSeparada[1]}`
        evento.dataFim = dataFim

        addHtml(evento)
    })
}

function addHtml(evento){
    const eventoHtml = document.createElement('div')
    eventoHtml.classList.add('col-sm-4','evento-card')
    eventoHtml.dataset.eventoId = evento.id
    eventoHtml.dataset.eventoNome = evento.nome

    eventoHtml.innerHTML = `
        <div class="card">
            <img src="img/capa-evento.png" class="card-img-top" alt="Imagem do evento">
            <div class="card-body">
                <h5 class="card-title">${evento.nome}</h5>
                <h6 class="card-subtitle">${evento.dataInicio} - ${evento.horarioInicio}</h6>
                <p class="card-text">${evento.descricao}</p>
                <div class="categories">
                    <span class="card-link">Categoria</span>
                </div>
            </div>
        </div>
    `
    eventoHtml.addEventListener('click', () => {
        console.log(evento._id)
        window.location.href = "evento.html"
    })

    const eventos = document.querySelector('.eventos-carousel')
    eventos.appendChild(eventoHtml)
}

async function cadastrarUsuario() {
    let nomeInput = document.querySelector('#nomeCadastroInput')
    let nomeUsuarioInput = document.querySelector('#usuarioCadastroInput')
    let emailInput = document.querySelector('#emailCadastroInput')
    let senhaInput = document.querySelector('#senhaCadastroInput')
    let cpfInput = document.querySelector('#cpfCadastroInput')

    let nome = nomeInput.value
    let nomeUsuario = nomeUsuarioInput.value
    let email = emailInput.value
    let senha = senhaInput.value
    let cpf = cpfInput.value

    try {
        const cadastroEndpoint = '/cadastro'
        const URLCompleta = `${protocolo}${baseURL}${cadastroEndpoint}`

        const usuario = (await axios.post(URLCompleta, {
                    nome,
                    nomeUsuario,
                    email,
                    senha,
                    cpf
                }
            )
        ).data

        nomeUsuarioInput.value = ""
        senhaInput.value = ""
        emailInput.value = ""
        cpfInput.value = ""
        console.log(usuario)
        exibirAlerta("Usuário cadastrado com sucesso!","alert-success")
    }
    catch (error) {
        exibirAlerta("Ocorreu um erro ao cadastrar usuário","alert-danger")
        console.log(error)
    }
}

const fazerLogin = async () => {
    let emailLoginInput = document.querySelector('#emailLoginInput')
    let senhaLoginInput = document.querySelector('#senhaLoginInput')

    let email = emailLoginInput.value
    let senha = senhaLoginInput.value

    try {
        const loginEndpoint = '/login'
        const URLCompleta = `${protocolo}${baseURL}${loginEndpoint}`
        const resposta = (await axios.post(URLCompleta, {
                    email: email,
                    senha: senha
                }
            )   
        ).data
        console.log(resposta.usuario)
        localStorage.setItem("Usuario",JSON.stringify(resposta.usuario))
        console.log(localStorage.getItem("Usuario"))

        emailLoginInput.value=""
        senhaLoginInput.value=""
        window.location.href = "index.html"
        alert("Bem-vindo!")
    }catch (error) {
        console.log(error)
    }
}

function exibirAlerta(alerta, classe){
    let divAlerta = document.getElementById('alert')
    console.log(divAlerta)
    divAlerta.style.display = "block"
    divAlerta.classList.add(classe)
    
    divAlerta.innerHTML = alerta
}


 
