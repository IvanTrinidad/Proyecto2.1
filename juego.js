// ============================================================
// ARCHIVO: juego.js
// PAGINA:  juego.html
// PROPOSITO: Logica completa de la pantalla de juego.
// Al cargar, lee sessionStorage para saber si debe iniciar
// una partida nueva (con config de config.js) o continuar
// una guardada (desde localStorage via Guardado.js).
// Antes de ir a tienda.html guarda el estado en localStorage
// para que tienda.js lo recoja y lo devuelva al volver.
// ============================================================

// ============================================================
// VARIABLES GLOBALES DEL ESTADO DEL JUEGO
// ============================================================
let granjero          = null;
let terreno           = null;
let herramientas      = [];
let semillaSeleccionada = null;
let intervalo         = null;

// ============================================================
// ARRANQUE: esperamos al XML y luego inicializamos
// ============================================================
document.addEventListener("DOMContentLoaded", function() {
    cargarDatosXML()
        .then(function() {
            let accion = sessionStorage.getItem("accion");

            if (accion === "nueva") {
                _empezarPartidaNueva();
            } else if (accion === "continuar") {
                _continuarPartida();
            } else {
                // Acceso directo a juego.html sin pasar por inicio
                // Intentamos continuar; si no hay partida, volvemos al inicio
                if (Guardado.existe()) {
                    _continuarPartida();
                } else {
                    window.location.href = "index.html";
                }
            }
        })
        .catch(function(err) {
            alert("Error al cargar datos del juego: " + err.message);
        });
});

// ============================================================
// NUEVA PARTIDA
// ============================================================
function _empezarPartidaNueva() {
    let raw = sessionStorage.getItem("configPartida");
    if (!raw) { window.location.href = "index.html"; return; }

    let config = JSON.parse(raw);
    sessionStorage.removeItem("configPartida");
    sessionStorage.removeItem("accion");

    granjero = new Granjero(config.nombre, config.nombreGranja, config.dinero);
    terreno  = new Terreno(config.numParcelas);

    herramientas = [
        new Herramienta("Azada",    "Mejora la calidad del cultivo"),
        new Herramienta("Regadera", "Reduce el tiempo de maduracion"),
        new Herramienta("Hoz",      "Permite obtener mas frutos")
    ];

    // Semillas iniciales para que el jugador pueda empezar a jugar
    granjero.agregarInventario("CerdiPlanta", 3);
    granjero.agregarInventario("VaquiPlanta", 2);
    granjero.agregarInventario("GatiPlanta",  1);

    _iniciarJuego();
}

// ============================================================
// CONTINUAR PARTIDA
// ============================================================
function _continuarPartida() {
    sessionStorage.removeItem("accion");

    let datos = Guardado.cargar();
    if (!datos) { window.location.href = "index.html"; return; }

    granjero = new Granjero(datos.granjero.nombre, datos.granjero.nombreGranja, datos.granjero.dinero);
    granjero.inventario = datos.granjero.inventario;
    granjero.cultivos   = datos.granjero.cultivos || [];

    terreno = new Terreno(datos.parcelas.length);
    for (let i = 0; i < datos.parcelas.length; i++) {
        let pd = datos.parcelas[i];
        if (pd.semillaNombre !== null) {
            let semilla = SEMILLAS.find(function(s) { return s.nombre === pd.semillaNombre; });
            terreno.parcelas[i].semilla           = semilla;
            terreno.parcelas[i].timestampPlantado = pd.timestampPlantado;
            terreno.parcelas[i].madura            = pd.madura;
            terreno.parcelas[i].fase              = pd.fase || 1;
        }
    }

    herramientas = datos.herramientas.map(function(h) {
        let her = new Herramienta(h.nombre, h.descripcion);
        her.nivel = h.nivel;
        return her;
    });

    _iniciarJuego();
}

// ============================================================
// INICIAR UI Y BUCLE DE JUEGO
// ============================================================
function _iniciarJuego() {
    semillaSeleccionada = null;

    pintarBarra();
    pintarHerramientas();
    pintarInventario();
    pintarTerreno();
    _asignarEventos();

    if (intervalo !== null) clearInterval(intervalo);
    intervalo = setInterval(function() {
        terreno.actualizar();
        pintarTerreno();
    }, 1000);
}

function _asignarEventos() {
    document.getElementById("btn-guardar").addEventListener("click",   _guardarPartida);
    document.getElementById("btn-menu").addEventListener("click",      _volverAlMenu);
    document.getElementById("btn-tienda").addEventListener("click",    _irATienda);
}

// ============================================================
// NAVEGACION
// ============================================================

// Guarda el estado actual y va a tienda.html
function _irATienda() {
    if (intervalo !== null) { clearInterval(intervalo); intervalo = null; }
    // Guardamos el estado completo para que tienda.js lo use y lo devuelva
    Guardado.guardar(granjero, terreno, herramientas);
    sessionStorage.setItem("accion", "continuar");
    window.location.href = "tienda.html";
}

// Vuelve al menu de inicio
function _volverAlMenu() {
    if (intervalo !== null) { clearInterval(intervalo); intervalo = null; }
    window.location.href = "index.html";
}

// ============================================================
// PINTAR PANTALLA
// ============================================================
function pintarBarra() {
    document.getElementById("lbl-nombre").textContent = granjero.nombre;
    document.getElementById("lbl-granja").textContent = granjero.nombreGranja;
    document.getElementById("lbl-dinero").textContent = granjero.dinero;
}

function pintarHerramientas() {
    let contenedor = document.getElementById("lista-herramientas");
    contenedor.innerHTML = "";

    for (let i = 0; i < herramientas.length; i++) {
        let h = herramientas[i];

        let div = document.createElement("div");
        div.classList.add("herramienta");

        let img = document.createElement("img");
        img.src = "imagenes/" + h.nombre.toLowerCase() + ".png";
        img.alt = h.nombre;
        img.onerror = function() { this.style.display = "none"; };

        let span = document.createElement("span");
        span.textContent = h.nombre + " Nv." + h.nivel;

        div.appendChild(img);
        div.appendChild(span);
        contenedor.appendChild(div);
    }
}

function pintarInventario() {
    let contenedor = document.getElementById("lista-inventario");
    contenedor.innerHTML = "";

    if (granjero.inventario.length === 0) {
        contenedor.innerHTML = "<p class='texto-vacio'>Inventario vacio</p>";
        return;
    }

    for (let i = 0; i < granjero.inventario.length; i++) {
        let item   = granjero.inventario[i];
        let semilla = SEMILLAS.find(function(s) { return s.nombre === item.nombre; });

        let div = document.createElement("div");
        div.classList.add("item-inv");
        if (semillaSeleccionada !== null && semillaSeleccionada.nombre === item.nombre) {
            div.classList.add("seleccionado");
        }

        let img = document.createElement("img");
        img.src = semilla ? semilla.imagenes[0] : "";
        img.alt = item.nombre;
        img.onerror = function() { this.style.display = "none"; };

        let span = document.createElement("span");
        span.textContent = item.nombre + " x" + item.cantidad;

        div.appendChild(img);
        div.appendChild(span);

        div.addEventListener("click", (function(s) {
            return function() {
                semillaSeleccionada = s;
                pintarInventario();
            };
        })(semilla));

        contenedor.appendChild(div);
    }
}

function pintarTerreno() {
    let cuadricula = document.getElementById("cuadricula");
    cuadricula.innerHTML = "";

    let cols = terreno.parcelas.length > 4 ? 3 : 2;
    cuadricula.style.gridTemplateColumns = "repeat(" + cols + ", 110px)";

    for (let i = 0; i < terreno.parcelas.length; i++) {
        let parcela = terreno.parcelas[i];
        let indice  = i;

        let div = document.createElement("div");
        div.classList.add("parcela");

        if (parcela.estaVacia()) {
            div.innerHTML = "<p>Vacia</p>";
        } else {
            let img = document.createElement("img");
            img.src = parcela.getImagenActual();
            img.alt = parcela.semilla.nombre;
            img.onerror = function() { this.style.display = "none"; };

            if (parcela.madura) div.classList.add("madura");

            let texto = document.createElement("p");
            texto.textContent = parcela.madura ? "Listo!" : parcela.segundosRestantes() + "s";

            div.appendChild(img);
            div.appendChild(texto);
        }

        div.addEventListener("click", function() { clicEnParcela(indice); });

        // Click derecho: reinicia la parcela
        div.addEventListener("contextmenu", function(event) {
            event.preventDefault();
            if (!parcela.estaVacia()) {
                parcela.limpiar();
                pintarTerreno();
            }
        });

        cuadricula.appendChild(div);
    }
}

// ============================================================
// INTERACCION CON PARCELAS
// ============================================================
function clicEnParcela(indice) {
    let parcela = terreno.parcelas[indice];

    if (parcela.estaVacia()) {
        if (semillaSeleccionada === null) {
            alert("Selecciona primero una semilla del inventario.");
            return;
        }

        let quito = granjero.quitarInventario(semillaSeleccionada.nombre);
        if (!quito) {
            alert("No te quedan semillas de ese tipo.");
            semillaSeleccionada = null;
            pintarInventario();
            return;
        }

        // Probabilidad de fallo al plantar (35%)
        if (Math.random() < 0.35) {
            // Devolvemos la semilla porque no se ha llegado a plantar
            granjero.agregarInventario(semillaSeleccionada.nombre, 1);
            alert("La plantacion ha fallado. Se te devuelve la semilla.");
            pintarInventario();
            return;
        }

        // Aplicamos el bonus de Regadera al tiempo de maduracion
        let semillaConRegadera = Object.assign(
            Object.create(Object.getPrototypeOf(semillaSeleccionada)),
            semillaSeleccionada
        );
        semillaConRegadera.segundosMaduracion = aplicarBonificacionRegadera(semillaSeleccionada, herramientas);
        parcela.plantar(semillaConRegadera);

        pintarBarra();
        pintarInventario();
        pintarTerreno();

    } else if (parcela.madura) {
        let nombreFruto = parcela.semilla.nombre;
        let extraHoz    = aplicarBonificacionHoz(herramientas);
        let unidades    = 1 + extraHoz;

        granjero.agregarCultivo(nombreFruto, unidades);
        parcela.limpiar();

        let msgHoz = extraHoz > 0 ? " (+" + extraHoz + " extra por Hoz)" : "";
        alert("Has recolectado " + unidades + "x " + nombreFruto + msgHoz + ". Vendelo en la tienda.");

        pintarBarra();
        pintarTerreno();

    } else {
        alert("No esta listo todavia. Quedan " + parcela.segundosRestantes() + " segundos.");
    }
}

// ============================================================
// OTRAS ACCIONES
// ============================================================
function _guardarPartida() {
    Guardado.guardar(granjero, terreno, herramientas);
    alert("Partida guardada correctamente.");
}

