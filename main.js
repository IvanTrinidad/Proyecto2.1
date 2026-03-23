// main.js
// Logica principal del juego y manejo del DOM

let granjero = null;
let terreno = null;
let herramientas = [];
let semillaSeleccionada = null;
let intervalo = null;

document.addEventListener("DOMContentLoaded", function() {

    if (!Guardado.existe()) {
        document.getElementById("btn-continuar").disabled = true;
        document.getElementById("btn-eliminar").disabled = true;
    }

    document.getElementById("btn-nueva").addEventListener("click", mostrarConfig);
    document.getElementById("btn-continuar").addEventListener("click", continuarPartida);
    document.getElementById("btn-eliminar").addEventListener("click", eliminarPartida);

    document.getElementById("btn-volver").addEventListener("click", mostrarInicio);
    document.getElementById("btn-empezar").addEventListener("click", empezarPartida);

    document.getElementById("btn-guardar").addEventListener("click", guardarPartida);
    document.getElementById("btn-menu").addEventListener("click", volverAlMenu);
    document.getElementById("btn-recargar").addEventListener("click", recargarSemillas);
});

// ============================================================
// NAVEGACION
// ============================================================

function mostrarPantalla(id) {
    let pantallas = document.querySelectorAll(".pantalla");
    pantallas.forEach(function(p) {
        p.classList.remove("activa");
    });
    document.getElementById(id).classList.add("activa");
}

function mostrarInicio() {
    mostrarPantalla("pantalla-inicio");

    if (Guardado.existe()) {
        document.getElementById("btn-continuar").disabled = false;
        document.getElementById("btn-eliminar").disabled = false;
    } else {
        document.getElementById("btn-continuar").disabled = true;
        document.getElementById("btn-eliminar").disabled = true;
    }
}

function mostrarConfig() {
    document.getElementById("inp-nombre").value = "";
    document.getElementById("inp-granja").value = "";
    document.getElementById("inp-dificultad").value = "";
    document.getElementById("inp-terreno").value = "";
    document.getElementById("err-nombre").textContent = "";
    document.getElementById("err-granja").textContent = "";
    document.getElementById("err-dificultad").textContent = "";
    document.getElementById("err-terreno").textContent = "";
    mostrarPantalla("pantalla-config");
}

function volverAlMenu() {
    if (intervalo !== null) {
        clearInterval(intervalo);
        intervalo = null;
    }
    mostrarInicio();
}

// ============================================================
// VALIDACION
// ============================================================

function validarFormulario() {
    let valido = true;

    let nombre = document.getElementById("inp-nombre").value.trim();
    let granja = document.getElementById("inp-granja").value.trim();
    let dificultad = document.getElementById("inp-dificultad").value;
    let tamTerreno = document.getElementById("inp-terreno").value;

    if (nombre === "") {
        document.getElementById("err-nombre").textContent = "El nombre no puede estar vacio.";
        document.getElementById("inp-nombre").classList.add("campo-error");
        valido = false;
    } else {
        document.getElementById("err-nombre").textContent = "";
        document.getElementById("inp-nombre").classList.remove("campo-error");
    }

    if (granja === "") {
        document.getElementById("err-granja").textContent = "El nombre de la granja no puede estar vacio.";
        document.getElementById("inp-granja").classList.add("campo-error");
        valido = false;
    } else {
        document.getElementById("err-granja").textContent = "";
        document.getElementById("inp-granja").classList.remove("campo-error");
    }

    if (dificultad === "") {
        document.getElementById("err-dificultad").textContent = "Debes elegir una dificultad.";
        document.getElementById("inp-dificultad").classList.add("campo-error");
        valido = false;
    } else {
        document.getElementById("err-dificultad").textContent = "";
        document.getElementById("inp-dificultad").classList.remove("campo-error");
    }

    if (tamTerreno === "") {
        document.getElementById("err-terreno").textContent = "Debes elegir un tamanio de terreno.";
        document.getElementById("inp-terreno").classList.add("campo-error");
        valido = false;
    } else {
        document.getElementById("err-terreno").textContent = "";
        document.getElementById("inp-terreno").classList.remove("campo-error");
    }

    return valido;
}

// ============================================================
// NUEVA PARTIDA
// ============================================================

function empezarPartida() {
    if (!validarFormulario()) return;

    let nombre = document.getElementById("inp-nombre").value.trim();
    let nombreGranja = document.getElementById("inp-granja").value.trim();
    let dificultad = document.getElementById("inp-dificultad").value;
    let numParcelas = Number(document.getElementById("inp-terreno").value);

    let dinero = 100;
    if (dificultad === "facil") {
        dinero = 200;
    } else if (dificultad === "dificil") {
        dinero = 50;
    }

    granjero = new Granjero(nombre, nombreGranja, dinero);
    terreno = new Terreno(numParcelas);
    herramientas = [
        new Herramienta("Azada", "Mejora la calidad del cultivo"),
        new Herramienta("Regadera", "Reduce el tiempo de maduracion"),
        new Herramienta("Hoz", "Permite obtener mas frutos")
    ];

    // Semillas iniciales para poder probar
    granjero.agregarInventario("CerdiPlanta", 3);
    granjero.agregarInventario("VaquiPlanta", 2);

    iniciarJuego();
}

// ============================================================
// CONTINUAR PARTIDA
// ============================================================

function continuarPartida() {
    let datos = Guardado.cargar();

    if (datos === null) {
        alert("No hay ninguna partida guardada.");
        return;
    }

    granjero = new Granjero(datos.granjero.nombre, datos.granjero.nombreGranja, datos.granjero.dinero);
    granjero.inventario = datos.granjero.inventario;

    terreno = new Terreno(datos.parcelas.length);
    for (let i = 0; i < datos.parcelas.length; i++) {
        let pd = datos.parcelas[i];
        if (pd.semillaNombre !== null) {
            let semilla = SEMILLAS.find(function(s) {
                return s.nombre === pd.semillaNombre;
            });
            terreno.parcelas[i].semilla = semilla;
            terreno.parcelas[i].timestampPlantado = pd.timestampPlantado;
            terreno.parcelas[i].madura = pd.madura;
            terreno.parcelas[i].fase = pd.fase || 1;
        }
    }

    herramientas = datos.herramientas.map(function(h) {
        let her = new Herramienta(h.nombre, h.descripcion);
        her.nivel = h.nivel;
        return her;
    });

    iniciarJuego();
}

// ============================================================
// ELIMINAR PARTIDA
// ============================================================

function eliminarPartida() {
    let confirmar = confirm("¿Seguro que quieres eliminar la partida guardada?");
    if (confirmar) {
        Guardado.borrar();
        mostrarInicio();
    }
}

// ============================================================
// PANTALLA DE JUEGO
// ============================================================

function iniciarJuego() {
    semillaSeleccionada = null;
    mostrarPantalla("pantalla-juego");

    pintarBarra();
    pintarHerramientas();
    pintarInventario();
    pintarTerreno();

    if (intervalo !== null) {
        clearInterval(intervalo);
    }
    intervalo = setInterval(function() {
        terreno.actualizar();
        pintarTerreno();
    }, 1000);
}

function pintarBarra() {
    document.getElementById("lbl-nombre").textContent = granjero.nombre;
    document.getElementById("lbl-granja").textContent = granjero.nombreGranja;
    document.getElementById("lbl-dinero").textContent = granjero.dinero;
}

// ============================================================
// HERRAMIENTAS
// ============================================================

function pintarHerramientas() {
    let contenedor = document.getElementById("lista-herramientas");
    contenedor.innerHTML = "";

    for (let i = 0; i < herramientas.length; i++) {
        let h = herramientas[i];

        let div = document.createElement("div");
        div.classList.add("herramienta");

        let img = document.createElement("img");
        img.src = "img/" + h.nombre.toLowerCase() + ".png"; // IMAGEN: icono de la herramienta
        img.alt = h.nombre;
        img.onerror = function() { this.style.display = "none"; };

        let span = document.createElement("span");
        span.textContent = h.nombre + " Nv." + h.nivel;

        div.appendChild(img);
        div.appendChild(span);
        contenedor.appendChild(div);
    }
}

// ============================================================
// INVENTARIO
// ============================================================

function pintarInventario() {
    let contenedor = document.getElementById("lista-inventario");
    contenedor.innerHTML = "";

    if (granjero.inventario.length === 0) {
        contenedor.innerHTML = "<p class='texto-vacio'>Inventario vacio</p>";
        return;
    }

    for (let i = 0; i < granjero.inventario.length; i++) {
        let item = granjero.inventario[i];

        let semilla = SEMILLAS.find(function(s) {
            return s.nombre === item.nombre;
        });

        let div = document.createElement("div");
        div.classList.add("item-inv");

        if (semillaSeleccionada !== null && semillaSeleccionada.nombre === item.nombre) {
            div.classList.add("seleccionado");
        }

        let img = document.createElement("img");
        img.src = semilla ? semilla.imagenes[0] : ""; // IMAGEN: primera fase de la semilla
        img.alt = item.nombre;
        img.onerror = function() { this.style.display = "none"; };

        let span = document.createElement("span");
        span.textContent = item.nombre + " x" + item.cantidad;

        div.appendChild(img);
        div.appendChild(span);

        div.addEventListener("click", function() {
            semillaSeleccionada = semilla;
            pintarInventario();
        });

        contenedor.appendChild(div);
    }
}

// ============================================================
// TERRENO
// ============================================================

function pintarTerreno() {
    let cuadricula = document.getElementById("cuadricula");
    cuadricula.innerHTML = "";

    let cols = 2;
    if (terreno.parcelas.length > 4) {
        cols = 3;
    }
    cuadricula.style.gridTemplateColumns = "repeat(" + cols + ", 110px)";

    for (let i = 0; i < terreno.parcelas.length; i++) {
        let parcela = terreno.parcelas[i];
        let indice = i;

        let div = document.createElement("div");
        div.classList.add("parcela");

        if (parcela.estaVacia()) {
            div.innerHTML = "<p>Vacia</p>";

        } else {
            let img = document.createElement("img");
            img.src = parcela.getImagenActual(); // IMAGEN: cambia segun la fase (1, 2 o 3)
            if (parcela.madura) {
                div.classList.add("madura");
            }
            img.alt = parcela.semilla.nombre;
            img.onerror = function() { this.style.display = "none"; };

            let texto = document.createElement("p");
            if (parcela.madura) {
                texto.textContent = "Listo!";
            } else {
                texto.textContent = parcela.segundosRestantes() + "s";
            }

            div.appendChild(img);
            div.appendChild(texto);
        }

        div.addEventListener("click", function() {
            clicEnParcela(indice);
        });

        cuadricula.appendChild(div);
    }
}

// ============================================================
// CLIC EN PARCELA
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

        parcela.plantar(semillaSeleccionada);
        pintarBarra();
        pintarInventario();
        pintarTerreno();

    } else if (parcela.madura) {
        let nombreFruto = parcela.semilla.nombre;
        let monedas = parcela.semilla.precioVenta;

        granjero.dinero += monedas;
        parcela.limpiar();

        alert("Has recolectado " + nombreFruto + " y ganado " + monedas + " monedas.");
        pintarBarra();
        pintarTerreno();

    } else {
        alert("No esta listo todavia. Quedan " + parcela.segundosRestantes() + " segundos.");
    }
}

// ============================================================
// BOTON TEST: RECARGAR SEMILLAS
// ============================================================

function recargarSemillas() {
    granjero.agregarInventario("CerdiPlanta", 3);
    granjero.agregarInventario("VaquiPlanta", 2);
    pintarInventario();
}

// ============================================================
// GUARDAR
// ============================================================

function guardarPartida() {
    Guardado.guardar(granjero, terreno, herramientas);
    alert("Partida guardada correctamente.");
}