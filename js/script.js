
/* =========================================
   CAPRIQUARIANAS — CONTAGEM REGRESSIVA
========================================= */

const dataEvento = new Date("2027-01-30T12:00:00-03:00").getTime();

function atualizarContagem() {
    const dias = document.getElementById("days");
    const horas = document.getElementById("hours");
    const minutos = document.getElementById("minutes");
    const segundos = document.getElementById("seconds");

    if (!dias || !horas || !minutos || !segundos) {
        console.error("Não encontrei todos os elementos do contador.");
        return;
    }

    const diferenca = dataEvento - Date.now();

    if (diferenca <= 0) {
        dias.textContent = "00";
        horas.textContent = "00";
        minutos.textContent = "00";
        segundos.textContent = "00";
        return;
    }

    const totalSegundos = Math.floor(diferenca / 1000);

    dias.textContent = String(
        Math.floor(totalSegundos / 86400)
    ).padStart(2, "0");

    horas.textContent = String(
        Math.floor((totalSegundos % 86400) / 3600)
    ).padStart(2, "0");

    minutos.textContent = String(
        Math.floor((totalSegundos % 3600) / 60)
    ).padStart(2, "0");

    segundos.textContent = String(
        totalSegundos % 60
    ).padStart(2, "0");
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

    const presencaSelecionada = formulario.querySelector(
        'input[name="presenca"]:checked'
    );

    const acompanhanteSelecionado = formulario.querySelector(
        'input[name="acompanhante"]:checked'
    );

    const confirmouPresenca = presencaSelecionada?.value === "sim";

    if (grupoAcompanhante) {
        grupoAcompanhante.style.display =
            confirmouPresenca ? "block" : "none";
    }

    const informouAcompanhante =
        confirmouPresenca && acompanhanteSelecionado?.value === "sim";

    if (grupoNomeAcompanhante) {
        grupoNomeAcompanhante.style.display =
            informouAcompanhante ? "block" : "none";
    }

    const campoNomeAcompanhante = formulario.querySelector(
        '[name="nomeAcompanhante"]'
    );

    if (campoNomeAcompanhante) {
        campoNomeAcompanhante.required = Boolean(informouAcompanhante);

        if (!informouAcompanhante) {
            campoNomeAcompanhante.value = "";
        }
    }
}

if (formulario) {
    formulario
        .querySelectorAll(
            'input[name="presenca"], input[name="acompanhante"]'
        )
        .forEach((campo) => {
            campo.addEventListener("change", atualizarCamposAcompanhante);
        });

    atualizarCamposAcompanhante();
}


/* =========================================
   MENSAGENS DE ERRO
========================================= */

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
   GRAVAÇÃO NO FIREBASE FIRESTORE
========================================= */

if (formulario) {
    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const botaoEnviar = formulario.querySelector(
            'button[type="submit"]'
        );

        const erroAnterior = document.getElementById("rsvpError");

        if (erroAnterior) {
            erroAnterior.style.display = "none";
        }

        if (mensagemSucesso) {
            mensagemSucesso.style.display = "none";
        }

        if (botaoEnviar) {
            botaoEnviar.disabled = true;
            botaoEnviar.textContent = "ENVIANDO...";
        }

        try {
            const campoNome = formulario.querySelector('[name="nome"]');
            const campoNomeAcompanhante = formulario.querySelector(
                '[name="nomeAcompanhante"]'
            );

            if (!campoNome) {
                throw new Error("Não encontrei o campo de nome no formulário.");
            }

            const nome = campoNome.value.trim();

            const presenca = formulario.querySelector(
                'input[name="presenca"]:checked'
            )?.value;

            const acompanhanteEscolhido = formulario.querySelector(
                'input[name="acompanhante"]:checked'
            )?.value;

            const nomeAcompanhante =
                campoNomeAcompanhante?.value.trim() || "";

            if (!nome) {
                throw new Error("Digite seu nome.");
            }

            if (nome.length > 100) {
                throw new Error("O nome deve ter no máximo 100 caracteres.");
            }

            if (!["sim", "nao"].includes(presenca)) {
                throw new Error("Selecione se você vai comparecer.");
            }

            let acompanhante = "nao";
            let nomeFinalAcompanhante = "";

            if (presenca === "sim") {
                if (!["sim", "nao"].includes(acompanhanteEscolhido)) {
                    throw new Error(
                        "Informe se você levará acompanhante."
                    );
                }

                acompanhante = acompanhanteEscolhido;

                if (acompanhante === "sim") {
                    if (!nomeAcompanhante) {
                        throw new Error(
                            "Digite o nome do acompanhante."
                        );
                    }

                    if (nomeAcompanhante.length > 100) {
                        throw new Error(
                            "O nome do acompanhante deve ter no máximo 100 caracteres."
                        );
                    }

                    nomeFinalAcompanhante = nomeAcompanhante;
                }
            }

            // Importa o Firestore e a configuração do projeto.
            const firestore = await import(
                "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
            );

            const configuracaoFirebase = await import("./firebase.js");
            const db = configuracaoFirebase.db;

            if (!db) {
                throw new Error(
                    "O arquivo firebase.js não exportou o banco db."
                );
            }

            // Os campos enviados correspondem às regras publicadas.
            await firestore.addDoc(
                firestore.collection(db, "confirmacoes"),
                {
                    nome: nome,
                    presenca: presenca,
                    acompanhante: acompanhante,
                    nomeAcompanhante: nomeFinalAcompanhante,
                    criadoEm: firestore.serverTimestamp()
                }
            );

            if (mensagemSucesso) {
                const titulo = mensagemSucesso.querySelector("h3");
                const texto = mensagemSucesso.querySelector("p");

                if (titulo) {
                    titulo.textContent = "Resposta registrada! 💗";
                }

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

            if (
                erro.code === "permission-denied" ||
                erro.code === "firestore/permission-denied"
            ) {
                mostrarErro(
                    "O Firebase recusou a gravação. Confira as regras do Firestore."
                );
            } else if (
                erro.code === "unavailable" ||
                erro.code === "failed-precondition"
            ) {
                mostrarErro(
                    "Não foi possível acessar o banco. Confira a conexão e o Firebase."
                );
            } else {
                mostrarErro(
                    erro.message ||
                    "Não foi possível enviar sua resposta. Tente novamente."
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
