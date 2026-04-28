// ============================================================
// ARCHIVO: inicio.js
// PAGINA:  index.html
// PROPOSITO: Logica del menu de inicio.
// Gestiona los botones Nueva Partida, Continuar, Eliminar
// y el estado de habilitado segun si hay partida guardada.
// La navegacion entre paginas se hace con window.location.href.
// ============================================================

document.addEventListener("DOMContentLoaded", function() {

    // Tutorial: se muestra solo la primera vez que el jugador abre el juego
    if (!localStorage.getItem("tutorial")) {
        alert("Bienvenido a Plantimales la granja donde nada es como lo crees \n\n- Selecciona una semilla\n- Haz clic en una parcela\n- Espera a que crezca\n- Recolecta para ganar dinero\n- Vendelo en la tienda");
        localStorage.setItem("tutorial", "true");
    }

    // Activamos o desactivamos los botones segun si hay partida guardada
    let hayPartida = Guardado.existe();
    document.getElementById("btn-continuar").disabled = !hayPartida;
    document.getElementById("btn-eliminar").disabled  = !hayPartida;

    // --- NUEVA PARTIDA: va a config.html ---
    document.getElementById("btn-nueva").addEventListener("click", function() {
        window.location.href = "config.html";
    });

    // --- CONTINUAR PARTIDA: va directamente a juego.html ---
    // juego.js detectara que hay datos en localStorage y los cargara
    document.getElementById("btn-continuar").addEventListener("click", function() {
        // Marcamos en sessionStorage que venimos de "continuar"
        // para que juego.js sepa que debe cargar la partida guardada
        sessionStorage.setItem("accion", "continuar");
        window.location.href = "juego.html";
    });

    // --- ELIMINAR PARTIDA ---
    document.getElementById("btn-eliminar").addEventListener("click", function() {
        let confirmar = confirm("¿Seguro que quieres eliminar la partida guardada?");
        if (confirmar) {
            Guardado.borrar();
            // Desactivamos los botones porque ya no hay partida
            document.getElementById("btn-continuar").disabled = true;
            document.getElementById("btn-eliminar").disabled  = true;
            alert("Partida eliminada.");
        }
    });
});
