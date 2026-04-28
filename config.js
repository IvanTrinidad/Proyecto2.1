// ============================================================
// ARCHIVO: config.js
// PAGINA:  config.html
// PROPOSITO: Logica del formulario de configuracion.
// Valida los campos, construye la configuracion inicial y la
// guarda en sessionStorage para que juego.js la recoja al
// navegar a juego.html.
// ============================================================

document.addEventListener("DOMContentLoaded", function() {

    // --- VOLVER al menu de inicio ---
    document.getElementById("btn-volver").addEventListener("click", function() {
        window.location.href = "index.html";
    });

    // --- EMPEZAR PARTIDA ---
    document.getElementById("btn-empezar").addEventListener("click", function() {
        if (!validarFormulario()) return;

        let nombre      = document.getElementById("inp-nombre").value.trim();
        let nombreGranja = document.getElementById("inp-granja").value.trim();
        let dificultad  = document.getElementById("inp-dificultad").value;
        let numParcelas = Number(document.getElementById("inp-terreno").value);

        // Calculamos el dinero inicial segun la dificultad
        let dinero = 100;
        if (dificultad === "facil")   dinero = 200;
        if (dificultad === "dificil") dinero = 50;

        // Guardamos la configuracion en sessionStorage.
        // sessionStorage se borra al cerrar la pestana, es perfecto para
        // pasar datos entre paginas sin contaminar el guardado de partida.
        let config = {
            nombre:      nombre,
            nombreGranja: nombreGranja,
            dinero:      dinero,
            numParcelas: numParcelas
        };
        sessionStorage.setItem("accion", "nueva");
        sessionStorage.setItem("configPartida", JSON.stringify(config));

        window.location.href = "juego.html";
    });
});

// ============================================================
// VALIDACION DEL FORMULARIO
// ============================================================
function validarFormulario() {
    let valido = true;

    let nombre     = document.getElementById("inp-nombre").value.trim();
    let granja     = document.getElementById("inp-granja").value.trim();
    let dificultad = document.getElementById("inp-dificultad").value;
    let tamTerreno = document.getElementById("inp-terreno").value;

    // Nombre del granjero
    if (nombre === "") {
        document.getElementById("err-nombre").textContent = "El nombre no puede estar vacio.";
        document.getElementById("inp-nombre").classList.add("campo-error");
        valido = false;
    } else {
        document.getElementById("err-nombre").textContent = "";
        document.getElementById("inp-nombre").classList.remove("campo-error");
    }

    // Nombre de la granja
    if (granja === "") {
        document.getElementById("err-granja").textContent = "El nombre de la granja no puede estar vacio.";
        document.getElementById("inp-granja").classList.add("campo-error");
        valido = false;
    } else {
        document.getElementById("err-granja").textContent = "";
        document.getElementById("inp-granja").classList.remove("campo-error");
    }

    // Dificultad
    if (dificultad === "") {
        document.getElementById("err-dificultad").textContent = "Debes elegir una dificultad.";
        document.getElementById("inp-dificultad").classList.add("campo-error");
        valido = false;
    } else {
        document.getElementById("err-dificultad").textContent = "";
        document.getElementById("inp-dificultad").classList.remove("campo-error");
    }

    // Tamano del terreno
    if (tamTerreno === "") {
        document.getElementById("err-terreno").textContent = "Debes elegir un tamano de terreno.";
        document.getElementById("inp-terreno").classList.add("campo-error");
        valido = false;
    } else {
        document.getElementById("err-terreno").textContent = "";
        document.getElementById("inp-terreno").classList.remove("campo-error");
    }

    return valido;
}
