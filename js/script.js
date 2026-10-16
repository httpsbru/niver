/* =========================================
   ANIVERSÁRIO STEFANY
   SCRIPT PRINCIPAL
========================================= */


/* =========================================
   ELEMENTOS DO FORMULÁRIO
========================================= */

const rsvpForm =
    document.getElementById("rsvpForm");

const companionGroup =
    document.getElementById("companionGroup");

const companionNameGroup =
    document.getElementById("companionNameGroup");

const successMessage =
    document.getElementById("successMessage");


/* =========================================
   CONTROLE DA PRESENÇA
========================================= */

const presenceInputs =
    document.querySelectorAll(
        'input[name="presenca"]'
    );


presenceInputs.forEach(input => {

    input.addEventListener("change", () => {

        if (input.value === "sim" && input.checked) {

            companionGroup.style.display = "block";

        }

        else if (input.value === "nao" && input.checked) {

            companionGroup.style.display = "none";

            companionNameGroup.style.display = "none";

        }

    });

});


/* =========================================
   CONTROLE DO ACOMPANHANTE
========================================= */

const companionInputs =
    document.querySelectorAll(
        'input[name="acompanhante"]'
    );


companionInputs.forEach(input => {

    input.addEventListener("change", () => {

        if (
            input.value === "sim" &&
            input.checked
        ) {

            companionNameGroup.style.display =
                "block";

        }

        else {

            companionNameGroup.style.display =
                "none";

        }

    });

});


/* =========================================
   ENVIO DO FORMULÁRIO
========================================= */

rsvpForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        /*
            POR ENQUANTO:

            Apenas simulamos o envio.

            Na próxima etapa vamos trocar
            esta parte pela integração com
            Firebase / Firestore.
        */


        const nome =
            document.getElementById("nome").value;


        if (!nome.trim()) {

            alert(
                "Digite seu nome para continuar."
            );

            return;

        }


        rsvpForm.style.display = "none";

        successMessage.style.display =
            "block";


        successMessage.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }
);


/* =========================================
   CONTAGEM REGRESSIVA
========================================= */

const birthdayDate =
    new Date(
        "2027-01-30T12:00:00-03:00"
    ).getTime();


function updateCountdown() {

    const now =
        new Date().getTime();


    const distance =
        birthdayDate - now;


    if (distance <= 0) {

        document.getElementById("days")
            .innerText = "00";

        document.getElementById("hours")
            .innerText = "00";

        document.getElementById("minutes")
            .innerText = "00";

        document.getElementById("seconds")
            .innerText = "00";

        return;

    }


    const days =
        Math.floor(
            distance /
            (1000 * 60 * 60 * 24)
        );


    const hours =
        Math.floor(
            (distance %
                (1000 * 60 * 60 * 24)) /
            (1000 * 60 * 60)
        );


    const minutes =
        Math.floor(
            (distance %
                (1000 * 60 * 60)) /
            (1000 * 60)
        );


    const seconds =
        Math.floor(
            (distance %
                (1000 * 60)) /
            1000
        );


    document.getElementById("days")
        .innerText =
        String(days).padStart(2, "0");


    document.getElementById("hours")
        .innerText =
        String(hours).padStart(2, "0");


    document.getElementById("minutes")
        .innerText =
        String(minutes).padStart(2, "0");


    document.getElementById("seconds")
        .innerText =
        String(seconds).padStart(2, "0");

}


updateCountdown();


setInterval(
    updateCountdown,
    1000
);


