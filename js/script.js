
/* =========================================
   CAPRIQUARIANAS — CONTAGEM REGRESSIVA
========================================= */

const dataEvento = new Date("2027-01-30T12:00:00-03:00").getTime();

function atualizarContagem() {
    const dias = document.getElementById("days");
    const horas = document.getElementById("hours");
    const minutos = document.getElementById("minutes");
    const segundos = document.getElementById("seconds");

    if (!dias || !horas || !minutos || !segundos) return;

    const diferenca = dataEvento - Date.now();

    if (diferenca <= 0) {
        dias.textContent = "00";
        horas.textContent = "00";
        minutos.textContent = "00";
        segundos.textContent = "00";
        return;
    }

    const totalSegundos = Math.floor(diferenca / 1000);

    dias.textContent = String(Math.floor(totalSegundos / 86400)).padStart(2, "0");
    horas.textContent = String(Math.floor((totalSegundos % 86400) / 3600)).padStart(2, "0");
    minutos.textContent = String(Math.floor((totalSegundos % 3600) / 60)).padStart(2, "0");
    segundos.textContent = String(totalSegundos % 60).padStart(2, "0");
}

atualizarContagem();
setInterval(atualizarContagem, 1000);


/* =========================================
   FORMULÁRIO DE PRESENÇA
========================================= */

const formulario = document.getElementById("rsvpForm");
const grupoAcompanhante = document.getElementById("companionGroup");
const grupoNomeAcompanhante = document.getElementById("companionNameGroup");
const mensagemSucesso = document.getElementById("successMessage");

function atualizarCamposAcompanhante() {
    if (!formulario) return;

    const presenca = formulario.querySelector(
        'input[name="presenca"]:checked'
    )?.value;

    const acompanhante = formulario.querySelector(
        'input[name="acompanhante"]:checked'
    )?.value;

    const confirmou = presenca === "sim";
    const informouAcompanhante = confirmou && acompanhante === "sim";

    if (grupoAcompanhante) {
        grupoAcompanhante.style.display = confirmou ? "block" : "none";
    }

    if (grupoNomeAcompanhante) {
        grupoNomeAcompanhante.style.display =
            informouAcompanhante ? "block" : "none";
    }

    const campoNomeAcompanhante = formulario.querySelector(
        '[name="nomeAcompanhante"]'
    );

    if (campoNomeAcompanhante) {
        campoNomeAcompanhante.required = informouAcompanhante;

        if (!informouAcompanhante) {
            campoNomeAcompanhante.value = "";
        }
    }
}

if (formulario) {
    formulario.querySelectorAll(
        'input[name="presenca"], input[name="acompanhante"]'
    ).forEach((campo) => {
        campo.addEventListener("change", atualizarCamposAcompanhante);
    });

    atualizarCamposAcompanhante();
}

function mostrarErro(mensagem) {
    let erro = document.getElementById("rsvpError");

    if (!erro && formulario) {
        erro = document.createElement("p");
        erro.id = "rsvpError";
        erro.setAttribute("role", "alert");
        erro.style.color = "#ff8b9f";
        erro.style.marginTop = "12px";
        erro.style.fontWeight = "600";
        formulario.appendChild(erro);
    }

    if (erro) {
        erro.textContent = mensagem;
        erro.style.display = "block";
    }
}


/* =========================================
   FIREBASE — CONFIRMAÇÃO DE PRESENÇA
========================================= */

if (formulario) {
    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const botaoEnviar = formulario.querySelector(
            'button[type="submit"]'
        );

        const erroAnterior = document.getElementById("rsvpError");

        if (erroAnterior) erroAnterior.style.display = "none";
        if (mensagemSucesso) mensagemSucesso.style.display = "none";

        if (botaoEnviar) {
            botaoEnviar.disabled = true;
            botaoEnviar.textContent = "ENVIANDO...";
        }

        try {
            const campoNome = formulario.querySelector('[name="nome"]');
            const campoAcompanhante = formulario.querySelector(
                '[name="nomeAcompanhante"]'
            );

            if (!campoNome) throw new Error("Não encontrei o campo de nome.");

            const nome = campoNome.value.trim();
            const presenca = formulario.querySelector(
                'input[name="presenca"]:checked'
            )?.value;

            const escolhaAcompanhante = formulario.querySelector(
                'input[name="acompanhante"]:checked'
            )?.value;

            const nomeAcompanhante = campoAcompanhante?.value.trim() || "";

            if (!nome) throw new Error("Digite seu nome.");
            if (nome.length > 100) {
                throw new Error("O nome deve ter no máximo 100 caracteres.");
            }

            if (!["sim", "nao"].includes(presenca)) {
                throw new Error("Selecione se você vai comparecer.");
            }

            let acompanhante = "nao";
            let nomeFinalAcompanhante = "";

            if (presenca === "sim") {
                if (!["sim", "nao"].includes(escolhaAcompanhante)) {
                    throw new Error("Informe se você levará acompanhante.");
                }

                acompanhante = escolhaAcompanhante;

                if (acompanhante === "sim") {
                    if (!nomeAcompanhante) {
                        throw new Error("Digite o nome do acompanhante.");
                    }

                    if (nomeAcompanhante.length > 100) {
                        throw new Error(
                            "O nome do acompanhante deve ter no máximo 100 caracteres."
                        );
                    }

                    nomeFinalAcompanhante = nomeAcompanhante;
                }
            }

            const firestore = await import(
                "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
            );

            const configuracao = await import("./firebase.js");

            if (!configuracao.db) {
                throw new Error("Não encontrei o banco db no firebase.js.");
            }

            await firestore.addDoc(
                firestore.collection(configuracao.db, "confirmacoes"),
                {
                    nome,
                    presenca,
                    acompanhante,
                    nomeAcompanhante: nomeFinalAcompanhante,
                    criadoEm: firestore.serverTimestamp()
                }
            );

            if (mensagemSucesso) {
                const titulo = mensagemSucesso.querySelector("h3");
                const texto = mensagemSucesso.querySelector("p");

                if (titulo) titulo.textContent = "Resposta registrada! 💗";

                if (texto) {
                    texto.textContent = presenca === "sim"
                        ? "Que alegria! Sua resposta foi salva. Mal podemos esperar por esse dia especial. ✨"
                        : "Obrigada por avisar! Sua resposta foi registrada. 💜";
                }

                mensagemSucesso.style.display = "block";
            }

            formulario.reset();
            atualizarCamposAcompanhante();
            formulario.style.display = "none";

        } catch (erro) {
            console.error("Erro ao enviar confirmação:", erro);

            if (erro.code === "permission-denied") {
                mostrarErro(
                    "O Firebase recusou a gravação. Confira as regras do Firestore."
                );
            } else {
                mostrarErro(
                    erro.message || "Não foi possível enviar sua resposta."
                );
            }
        } finally {
            if (botaoEnviar && formulario.style.display !== "none") {
                botaoEnviar.disabled = false;
                botaoEnviar.textContent = "CONFIRMAR PRESENÇA ✨";
            }
        }
    });
}


/* =========================================
   CORREIO CÓSMICO — ELEMENTOS DO HTML
========================================= */

const modalFormularioRecado = document.getElementById(
    "modalFormularioRecado"
);

const modalListaRecados = document.getElementById(
    "modalListaRecados"
);

const formularioRecado = document.getElementById("formRecado");
const botaoAbrirFormulario = document.getElementById("abrirFormularioRecado");
const botaoAbrirLista = document.getElementById("abrirModalRecados");
const botaoNovoRecado = document.getElementById("novoRecadoPeloModal");

const campoNomeRecado = document.getElementById("nomeRecado");
const campoDestinataria = document.getElementById("destinatariaRecado");
const campoMensagem = document.getElementById("mensagemRecado");
const contadorRecado = document.getElementById("contadorRecado");

const statusEnvio = document.getElementById("erroRecado");
const estadoLista = document.getElementById("estadoRecados");
const listaRecados = document.getElementById("listaRecados");
const filtroRecados = document.getElementById("filtroRecados");
const botaoEnviarRecado = document.getElementById("enviarRecado");

let pararEscutaRecados = null;
let recadosRecebidos = [];
let firestoreRecados = null;


/* =========================================
   ABRIR E FECHAR OS MODAIS
========================================= */

function abrirModal(modal) {
    if (!modal) return;

    // Fecha o outro modal, se estiver aberto.
    [modalFormularioRecado, modalListaRecados].forEach((outroModal) => {
        if (outroModal && outroModal !== modal) {
            outroModal.classList.remove("aberto");
            outroModal.hidden = true;
        }
    });

    modal.hidden = false;
    modal.classList.add("aberto");
    document.body.style.overflow = "hidden";
}

function fecharModal(modal) {
    if (!modal) return;

    modal.classList.remove("aberto");
    modal.hidden = true;

    const algumAberto = [modalFormularioRecado, modalListaRecados].some(
        (item) => item && !item.hidden
    );

    if (!algumAberto) {
        document.body.style.overflow = "";
    }

    if (modal === modalListaRecados && pararEscutaRecados) {
        pararEscutaRecados();
        pararEscutaRecados = null;
    }
}

if (botaoAbrirFormulario) {
    botaoAbrirFormulario.addEventListener("click", () => {
        abrirModal(modalFormularioRecado);
    });
}

if (botaoAbrirLista) {
    botaoAbrirLista.addEventListener("click", abrirListaRecados);
}

if (botaoNovoRecado) {
    botaoNovoRecado.addEventListener("click", () => {
        fecharModal(modalListaRecados);
        abrirModal(modalFormularioRecado);
    });
}

// Todos os botões com este atributo fecham o modal correspondente.
document.querySelectorAll("[data-fechar-correio]").forEach((botao) => {
    botao.addEventListener("click", () => {
        const modal = botao.closest(".correio-modal");
        fecharModal(modal);
    });
});

// Clicar no fundo escuro também fecha o modal.
[modalFormularioRecado, modalListaRecados].forEach((modal) => {
    if (!modal) return;

    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) {
            fecharModal(modal);
        }
    });
});

document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
        fecharModal(modalFormularioRecado);
        fecharModal(modalListaRecados);
    }
});


/* =========================================
   FIREBASE — CONEXÃO DOS RECADOS
========================================= */

async function obterFirestoreRecados() {
    if (firestoreRecados) return firestoreRecados;

    const [firestore, configuracao] = await Promise.all([
        import(
            "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
        ),
        import("./firebase.js")
    ]);

    if (!configuracao.db) {
        throw new Error("Não encontrei a conexão db no arquivo firebase.js.");
    }

    firestoreRecados = {
        db: configuracao.db,
        collection: firestore.collection,
        addDoc: firestore.addDoc,
        serverTimestamp: firestore.serverTimestamp,
        onSnapshot: firestore.onSnapshot
    };

    return firestoreRecados;
}

function mostrarStatusEnvio(texto, erro = false) {
    if (!statusEnvio) return;

    statusEnvio.textContent = texto;
    statusEnvio.style.color = erro ? "#ff9aaa" : "#d9c2ff";
}


/* =========================================
   CONTADOR DE CARACTERES
========================================= */

function atualizarContadorRecado() {
    if (!campoMensagem || !contadorRecado) return;

    contadorRecado.textContent = `${campoMensagem.value.length}/500`;
}

if (campoMensagem) {
    campoMensagem.addEventListener("input", atualizarContadorRecado);
    atualizarContadorRecado();
}


/* =========================================
   ENVIAR UM RECADO
========================================= */

if (formularioRecado) {
    formularioRecado.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        if (botaoEnviarRecado) {
            botaoEnviarRecado.disabled = true;
            botaoEnviarRecado.textContent = "ENVIANDO...";
        }

        mostrarStatusEnvio("");

        try {
            const nome = campoNomeRecado?.value.trim();
            const destinataria = campoDestinataria?.value;
            const mensagem = campoMensagem?.value.trim();

            if (!nome || nome.length > 60) {
                throw new Error("Informe seu nome, com até 60 caracteres.");
            }

            if (!mensagem || mensagem.length > 500) {
                throw new Error("Escreva uma mensagem de até 500 caracteres.");
            }

            const destinatariasPermitidas = [
                "todas",
                "Bruna",
                "Stefany",
                "Melissa",
                "Glaucia",
                "Jessica"
            ];

            if (!destinatariasPermitidas.includes(destinataria)) {
                throw new Error("Selecione uma destinatária válida.");
            }

            const firebase = await obterFirestoreRecados();

            await firebase.addDoc(
                firebase.collection(firebase.db, "recados"),
                {
                    nome,
                    mensagem,
                    destinataria,
                    criadoEm: firebase.serverTimestamp()
                }
            );

            formularioRecado.reset();
            atualizarContadorRecado();

            mostrarStatusEnvio("Seu recado foi enviado com carinho! 💜");

        } catch (erro) {
            console.error("Erro ao enviar recado:", erro);

            if (erro.code === "permission-denied") {
                mostrarStatusEnvio(
                    "O Firebase recusou o envio. Confira as regras da coleção recados.",
                    true
                );
            } else {
                mostrarStatusEnvio(
                    erro.message || "Não foi possível enviar sua carta. Tente novamente.",
                    true
                );
            }
        } finally {
            if (botaoEnviarRecado) {
                botaoEnviarRecado.disabled = false;
                botaoEnviarRecado.textContent = "Enviar recado ✨";
            }
        }
    });
}


/* =========================================
   EXIBIR E FILTRAR OS RECADOS
========================================= */

function renderizarRecados() {
    if (!listaRecados || !estadoLista) return;

    listaRecados.replaceChildren();

    const destinatariaSelecionada = filtroRecados?.value || "todas";

    const recadosFiltrados = recadosRecebidos
        .filter((recado) => {
            if (destinatariaSelecionada === "todas") return true;

            return recado.destinataria === destinatariaSelecionada
                || recado.destinataria === "todas";
        })
        .sort((a, b) => {
            const dataA = a.criadoEm?.toMillis?.() || 0;
            const dataB = b.criadoEm?.toMillis?.() || 0;
            return dataB - dataA;
        });

    if (recadosFiltrados.length === 0) {
        estadoLista.textContent = recadosRecebidos.length === 0
            ? "Ainda não chegaram recados. Que tal inaugurar o mural? 💌"
            : "Ainda não há recados para esse filtro. ✨";

        return;
    }

    estadoLista.textContent =
        `${recadosFiltrados.length} recado(s) encontrado(s) 💌`;

    recadosFiltrados.forEach((recado) => {
        const cartao = document.createElement("article");
        cartao.className = "recado-carta cartao-recado";

        const titulo = document.createElement("h3");
        titulo.textContent = `✨ ${recado.nome || "Pessoa querida"}`;

        const destinataria = document.createElement("small");
        destinataria.textContent =
            recado.destinataria === "todas"
                ? "Para todas as aniversariantes"
                : `Para ${recado.destinataria}`;

        const mensagem = document.createElement("p");
        mensagem.textContent = recado.mensagem || "";

        const data = document.createElement("small");

        if (recado.criadoEm?.toDate) {
            data.textContent = recado.criadoEm.toDate().toLocaleString(
                "pt-BR",
                {
                    dateStyle: "short",
                    timeStyle: "short"
                }
            );
        } else {
            data.textContent = "Acabou de chegar ✨";
        }

        cartao.append(titulo, destinataria, mensagem, data);
        listaRecados.appendChild(cartao);
    });
}

async function abrirListaRecados() {
    abrirModal(modalListaRecados);

    if (estadoLista) {
        estadoLista.textContent = "Carregando recados...";
    }

    try {
        if (pararEscutaRecados) return;

        const firebase = await obterFirestoreRecados();

        pararEscutaRecados = firebase.onSnapshot(
            firebase.collection(firebase.db, "recados"),
            (snapshot) => {
                recadosRecebidos = snapshot.docs.map((documento) => ({
                    id: documento.id,
                    ...documento.data()
                }));

                renderizarRecados();
            },
            (erro) => {
                console.error("Erro ao carregar recados:", erro);

                if (estadoLista) {
                    estadoLista.textContent =
                        "Não foi possível carregar os recados. Confira a conexão e as regras do Firestore.";
                }
            }
        );
    } catch (erro) {
        console.error("Erro ao abrir Correio Cósmico:", erro);

        if (estadoLista) {
            estadoLista.textContent =
                "Não foi possível conectar ao Correio Cósmico. Tente novamente.";
        }
    }
}

if (filtroRecados) {
    filtroRecados.addEventListener("change", renderizarRecados);
}
