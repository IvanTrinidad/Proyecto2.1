// ============================================================
// ARCHIVO: tienda-init.js
// PAGINA:  tienda.html
// PROPOSITO: Arranque de la tienda cuando es una pagina separada.
// 1. Carga datos.xml (necesario para SEMILLAS, DATOS_HERRAMIENTAS y XPath).
// 2. Reconstruye los objetos granjero y herramientas desde localStorage
//    (el estado fue guardado por juego.js antes de navegar aqui).
// 3. Llama a inicializarTienda() y mostrarTienda() para pintar la UI.
// 4. Asigna los eventos de los botones de la tienda.
// ============================================================

// Variables globales que Tienda.js necesita para funcionar.
// Se rellenan aqui al cargar la pagina.
let granjero     = null;
let herramientas = [];

document.addEventListener("DOMContentLoaded", function() {

    // Paso 1: cargar el XML. Nada puede funcionar sin los datos.
    cargarDatosXML()
        .then(function() {

            // Paso 2: reconstruir el estado del juego desde localStorage.
            // juego.js guarda la partida con Guardado.guardar() justo antes
            // de hacer window.location.href = "tienda.html".
            let datos = Guardado.cargar();
            if (!datos) {
                // No hay partida guardada: volvemos al juego
                alert("Error: no se encontro el estado de la partida.");
                window.location.href = "juego.html";
                return;
            }

            // Reconstruimos el Granjero con su dinero, inventario y cultivos
            granjero = new Granjero(
                datos.granjero.nombre,
                datos.granjero.nombreGranja,
                datos.granjero.dinero
            );
            granjero.inventario = datos.granjero.inventario || [];
            granjero.cultivos   = datos.granjero.cultivos   || [];

            // Reconstruimos las herramientas con sus niveles actuales
            herramientas = datos.herramientas.map(function(h) {
                let her = new Herramienta(h.nombre, h.descripcion);
                her.nivel = h.nivel;
                return her;
            });

            // Paso 3: pasar el xmlDoc a Tienda.js para que pueda hacer XPath
            inicializarTienda(getXmlDoc());

            // Paso 4: pintar la tienda con los datos ya cargados
            mostrarTienda();

            // Paso 5: asignar eventos de botones
            _asignarEventosTienda();
        })
        .catch(function(err) {
            alert("Error al cargar los datos del juego: " + err.message);
        });
});

// ----------------------------------------------------------
// FUNCION: _asignarEventosTienda
// PROPOSITO: Conecta los botones de tienda.html con sus funciones.
// Se llama una sola vez tras cargar el XML.
// ----------------------------------------------------------
function _asignarEventosTienda() {

    // Boton volver: guarda el estado actualizado y vuelve al juego
    document.getElementById("btn-tienda-volver").addEventListener("click", function() {
        _guardarYVolverAlJuego();
    });

    // Botones de filtrado XPath
    document.getElementById("btn-filtrar").addEventListener("click", filtrarSemillasXPath);
    document.getElementById("btn-limpiar-filtro").addEventListener("click", limpiarFiltro);
}

// ----------------------------------------------------------
// FUNCION: _guardarYVolverAlJuego
// PROPOSITO: Antes de salir de la tienda, actualiza el estado
// guardado (dinero e inventario pueden haber cambiado) y
// navega de vuelta a juego.html.
// ----------------------------------------------------------
function _guardarYVolverAlJuego() {
    // Necesitamos el terreno para poder guardar, pero en la tienda
    // no tenemos el objeto terreno. Lo recuperamos del guardado anterior
    // para no perder el estado del terreno.
    let datosActuales = Guardado.cargar();
    if (datosActuales) {
        // Sobreescribimos solo granjero y herramientas; el terreno no ha cambiado
        datosActuales.granjero.dinero    = granjero.dinero;
        datosActuales.granjero.inventario= granjero.inventario;
        datosActuales.granjero.cultivos  = granjero.cultivos;
        datosActuales.herramientas = herramientas.map(function(h) {
            return { nombre: h.nombre, descripcion: h.descripcion, nivel: h.nivel };
        });
        localStorage.setItem("plantimales", JSON.stringify(datosActuales));
    }

    // Marcamos que al llegar a juego.html debe continuar la partida
    sessionStorage.setItem("accion", "continuar");
    window.location.href = "juego.html";
}
