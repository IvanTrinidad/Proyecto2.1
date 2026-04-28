// ============================================================
// ARCHIVO: main.js
// PROPOSITO: Logica principal del juego y manejo del DOM.
// Es el archivo que une todas las clases con la interfaz HTML.
// Se encarga de:
//   - Mostrar un tutorial a l iniciar el juego por primera vez
//   - Asignar eventos a los botones
//   - Navegar entre pantallas
//   - Validar el formulario de configuracion
//   - Crear los objetos del juego al empezar una partida
//   - Pintar en pantalla el inventario, herramientas y terreno
//   - Gestionar las acciones del jugador (plantar, recolectar)
//   - Guardar y cargar partidas
// ============================================================

// ============================================================
// VARIABLES GLOBALES DEL ESTADO DEL JUEGO
// Se declaran fuera de las funciones para que sean accesibles
// desde cualquier funcion de este archivo.
// ============================================================

let granjero = null;            // Objeto Granjero del jugador actual
let terreno = null;             // Objeto Terreno con todas las parcelas
let herramientas = [];          // Array con los tres objetos Herramienta
let semillaSeleccionada = null; // Semilla que el jugador ha elegido para plantar
let intervalo = null;           // Referencia al setInterval del bucle de juego

// ============================================================
// INICIO: asignacion de eventos al cargar la pagina
// DOMContentLoaded se dispara cuando el HTML esta completamente
// cargado y listo. Asi nos aseguramos de que los elementos
// del HTML existen antes de intentar acceder a ellos.
// ============================================================

document.addEventListener("DOMContentLoaded", function() {

    // Cargamos primero el XML. Nada arranca hasta que los datos esten listos.
    // DatosXML.js guarda internamente el xmlDoc parseado, lo recuperamos
    // con getXmlDoc() para pasarselo a la tienda (necesario para XPath).
    cargarDatosXML()
        .then(function() {
            inicializarTienda(getXmlDoc());
            _inicializarUI();
        })
        .catch(function(err) {
            alert("Error al cargar datos del juego: " + err.message);
        });
});

// ----------------------------------------------------------
// FUNCION: _inicializarUI
// PROPOSITO: Asigna todos los eventos de la interfaz.
// Se llama solo despues de que el XML haya cargado.
// ----------------------------------------------------------
function _inicializarUI() {

    // Si no hay partida guardada, desactivamos los botones que la necesitan
    if (!Guardado.existe()) {
        document.getElementById("btn-continuar").disabled = true;
        document.getElementById("btn-eliminar").disabled = true;
    }
    // Este tutorial solo se presentara una vez, como un mensaje emergente por defecto en la pantalla
    if (!localStorage.getItem("tutorial")) {
        alert("Bienvenido a Plantimales la granja donde nada es como lo crees \n\n- Selecciona una semilla\n- Haz clic en una parcela\n- Espera a que crezca\n- Recolecta para ganar dinero");
        localStorage.setItem("tutorial", "true");
    }

    // Asignamos una funcion a cada boton usando addEventListener.
    // Esto es mejor que usar onclick en el HTML porque separa
    // el codigo JavaScript del codigo HTML.

    // Botones del menu de inicio
    document.getElementById("btn-nueva").addEventListener("click", mostrarConfig);
    document.getElementById("btn-continuar").addEventListener("click", continuarPartida);
    document.getElementById("btn-eliminar").addEventListener("click", eliminarPartida);

    // Botones de la pantalla de configuracion
    document.getElementById("btn-volver").addEventListener("click", mostrarInicio);
    document.getElementById("btn-empezar").addEventListener("click", empezarPartida);

    // Botones de la pantalla de juego
    document.getElementById("btn-guardar").addEventListener("click", guardarPartida);
    document.getElementById("btn-menu").addEventListener("click", volverAlMenu);
    document.getElementById("btn-recargar").addEventListener("click", recargarSemillas);
    document.getElementById("btn-tienda").addEventListener("click", irATienda);

    // Botones de la pantalla de tienda
    document.getElementById("btn-tienda-volver").addEventListener("click", volverAlJuego);
    document.getElementById("btn-filtrar").addEventListener("click", filtrarSemillasXPath);
    document.getElementById("btn-limpiar-filtro").addEventListener("click", limpiarFiltro);
}

// ============================================================
// NAVEGACION ENTRE PANTALLAS
// ============================================================

// ----------------------------------------------------------
// FUNCION: mostrarPantalla
// PROPOSITO: Oculta todas las pantallas y muestra solo la
// indicada. Lo hace anadiendo y quitando la clase CSS "activa".
// PARAMETROS:
//   - id: el id del div de la pantalla que queremos mostrar
// ----------------------------------------------------------
function mostrarPantalla(id) {
    // Seleccionamos todos los elementos con clase "pantalla"
    let pantallas = document.querySelectorAll(".pantalla");

    // Quitamos la clase "activa" a todas (las ocultamos)
    pantallas.forEach(function(p) {
        p.classList.remove("activa");
    });

    // Anadimos "activa" solo a la pantalla que queremos mostrar
    document.getElementById(id).classList.add("activa");
}

// ----------------------------------------------------------
// FUNCION: mostrarInicio
// PROPOSITO: Vuelve al menu de inicio y actualiza el estado
// de los botones segun si hay partida guardada o no.
// ----------------------------------------------------------
function mostrarInicio() {
    mostrarPantalla("pantalla-inicio");

    // Activamos o desactivamos los botones segun si hay partida guardada
    if (Guardado.existe()) {
        document.getElementById("btn-continuar").disabled = false;
        document.getElementById("btn-eliminar").disabled = false;
    } else {
        document.getElementById("btn-continuar").disabled = true;
        document.getElementById("btn-eliminar").disabled = true;
    }
}

// ----------------------------------------------------------
// FUNCION: mostrarConfig
// PROPOSITO: Muestra la pantalla de configuracion de nueva
// partida, limpiando primero los campos y errores anteriores.
// ----------------------------------------------------------
function mostrarConfig() {
    // Vaciamos todos los campos del formulario
    document.getElementById("inp-nombre").value = "";
    document.getElementById("inp-granja").value = "";
    document.getElementById("inp-dificultad").value = "";
    document.getElementById("inp-terreno").value = "";

    // Borramos los mensajes de error que pudiera haber
    document.getElementById("err-nombre").textContent = "";
    document.getElementById("err-granja").textContent = "";
    document.getElementById("err-dificultad").textContent = "";
    document.getElementById("err-terreno").textContent = "";

    mostrarPantalla("pantalla-config");
}

// ----------------------------------------------------------
// FUNCION: volverAlMenu
// PROPOSITO: Vuelve al menu principal desde la pantalla de juego.
// Antes de salir para el intervalo para no dejar procesos activos.
// ----------------------------------------------------------
function volverAlMenu() {
    // Paramos el bucle de juego antes de salir de la pantalla
    if (intervalo !== null) {
        clearInterval(intervalo); // Detiene el setInterval
        intervalo = null;
    }
    mostrarInicio();
}

// ----------------------------------------------------------
// FUNCION: irATienda
// PROPOSITO: Va a la pantalla de tienda desde la pantalla
// de juego. Pausa el bucle mientras el jugador esta en la tienda.
// ----------------------------------------------------------
function irATienda() {
    if (intervalo !== null) {
        clearInterval(intervalo);
        intervalo = null;
    }
    mostrarTienda();
}

// ----------------------------------------------------------
// FUNCION: volverAlJuego
// PROPOSITO: Vuelve a la pantalla de juego desde la tienda.
// Reactiva el bucle de juego y repinta el estado actual.
// ----------------------------------------------------------
function volverAlJuego() {
    mostrarPantalla("pantalla-juego");
    pintarBarra();
    pintarHerramientas();
    pintarInventario();
    pintarTerreno();
    if (intervalo !== null) clearInterval(intervalo);
    intervalo = setInterval(function() {
        terreno.actualizar();
        pintarTerreno();
    }, 1000);
}

// ============================================================
// VALIDACION DEL FORMULARIO DE CONFIGURACION
// ============================================================

// ----------------------------------------------------------
// FUNCION: validarFormulario
// PROPOSITO: Comprueba que todos los campos del formulario
// de nueva partida esten correctamente rellenados.
// Muestra mensajes de error en rojo bajo cada campo invalido.
// DEVUELVE: true si todo es correcto, false si hay algun error
// ----------------------------------------------------------
function validarFormulario() {
    let valido = true; // Asumimos que es valido hasta que encontremos un error

    // Leemos el valor de cada campo. trim() elimina espacios al principio y al final
    let nombre = document.getElementById("inp-nombre").value.trim();
    let granja = document.getElementById("inp-granja").value.trim();
    let dificultad = document.getElementById("inp-dificultad").value;
    let tamTerreno = document.getElementById("inp-terreno").value;

    // Validacion del nombre del granjero
    if (nombre === "") {
        document.getElementById("err-nombre").textContent = "El nombre no puede estar vacio.";
        document.getElementById("inp-nombre").classList.add("campo-error"); // Borde rojo
        valido = false;
    } else {
        document.getElementById("err-nombre").textContent = "";
        document.getElementById("inp-nombre").classList.remove("campo-error");
    }

    // Validacion del nombre de la granja
    if (granja === "") {
        document.getElementById("err-granja").textContent = "El nombre de la granja no puede estar vacio.";
        document.getElementById("inp-granja").classList.add("campo-error");
        valido = false;
    } else {
        document.getElementById("err-granja").textContent = "";
        document.getElementById("inp-granja").classList.remove("campo-error");
    }

    // Validacion de la dificultad (el select tiene value="" por defecto)
    if (dificultad === "") {
        document.getElementById("err-dificultad").textContent = "Debes elegir una dificultad.";
        document.getElementById("inp-dificultad").classList.add("campo-error");
        valido = false;
    } else {
        document.getElementById("err-dificultad").textContent = "";
        document.getElementById("inp-dificultad").classList.remove("campo-error");
    }

    // Validacion del tamanio del terreno
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

// ----------------------------------------------------------
// FUNCION: empezarPartida
// PROPOSITO: Lee los datos del formulario, crea los objetos
// del juego y arranca la pantalla de juego.
// Solo se ejecuta si el formulario pasa la validacion.
// ----------------------------------------------------------
function empezarPartida() {
    // Primero validamos. Si hay errores, no continuamos
    if (!validarFormulario()) return;

    // Leemos los valores del formulario
    let nombre = document.getElementById("inp-nombre").value.trim();
    let nombreGranja = document.getElementById("inp-granja").value.trim();
    let dificultad = document.getElementById("inp-dificultad").value;

    // Number() convierte el string del select a numero entero
    let numParcelas = Number(document.getElementById("inp-terreno").value);

    // El dinero inicial depende de la dificultad elegida
    let dinero = 100; // Normal por defecto
    if (dificultad === "facil") {
        dinero = 200; // Mas dinero en facil
    } else if (dificultad === "dificil") {
        dinero = 50;  // Menos dinero en dificil
    }

    // Creamos los objetos principales del juego
    granjero = new Granjero(nombre, nombreGranja, dinero);
    terreno = new Terreno(numParcelas);

    // Creamos las tres herramientas iniciales (siempre nivel 1 en Fase 1)
    herramientas = [
        new Herramienta("Azada",     "Mejora la calidad del cultivo"),
        new Herramienta("Regadera",  "Reduce el tiempo de maduracion"),
        new Herramienta("Hoz",       "Permite obtener mas frutos")
    ];

    // Damos semillas iniciales al jugador para que pueda empezar a jugar
    granjero.agregarInventario("CerdiPlanta", 3); // 3 CerdiPlantas
    granjero.agregarInventario("VaquiPlanta", 2); // 2 VaquiPlantas
     granjero.agregarInventario("GatiPlanta", 1); // 1 GatiPlantas

    iniciarJuego();
}

// ============================================================
// CONTINUAR PARTIDA
// ============================================================

// ----------------------------------------------------------
// FUNCION: continuarPartida
// PROPOSITO: Carga los datos guardados en localStorage y
// reconstruye los objetos del juego para continuar donde
// el jugador lo dejo.
// ----------------------------------------------------------
function continuarPartida() {
    let datos = Guardado.cargar(); // Leemos del localStorage

    if (datos === null) {
        alert("No hay ninguna partida guardada.");
        return;
    }

    // Reconstruimos el objeto Granjero con los datos guardados
    granjero = new Granjero(datos.granjero.nombre, datos.granjero.nombreGranja, datos.granjero.dinero);
    granjero.inventario = datos.granjero.inventario; // Restauramos el inventario directamente
    granjero.cultivos = datos.granjero.cultivos || [];  // Restauramos los cultivos pendientes de vender

    // Reconstruimos el Terreno con el mismo numero de parcelas que tenia
    terreno = new Terreno(datos.parcelas.length);

    // Restauramos el estado de cada parcela
    for (let i = 0; i < datos.parcelas.length; i++) {
        let pd = datos.parcelas[i]; // Datos guardados de esta parcela

        if (pd.semillaNombre !== null) {
            // Buscamos el objeto Semilla completo en el array SEMILLAS por su nombre
            let semilla = SEMILLAS.find(function(s) {
                return s.nombre === pd.semillaNombre;
            });

            // Restauramos todos los atributos de la parcela
            terreno.parcelas[i].semilla = semilla;
            terreno.parcelas[i].timestampPlantado = pd.timestampPlantado; // El tiempo original
            terreno.parcelas[i].madura = pd.madura;
            terreno.parcelas[i].fase = pd.fase || 1; // Si no habia fase guardada, ponemos 1
        }
    }

    // Reconstruimos las herramientas con sus niveles guardados
    herramientas = datos.herramientas.map(function(h) {
        let her = new Herramienta(h.nombre, h.descripcion);
        her.nivel = h.nivel; // Restauramos el nivel que tenia
        return her;
    });

    iniciarJuego();
}

// ============================================================
// ELIMINAR PARTIDA
// ============================================================

// ----------------------------------------------------------
// FUNCION: eliminarPartida
// PROPOSITO: Pide confirmacion al usuario y borra la partida
// guardada del localStorage.
// ----------------------------------------------------------
function eliminarPartida() {
    // confirm() muestra un dialogo con Aceptar/Cancelar y devuelve true o false
    let confirmar = confirm("¿Seguro que quieres eliminar la partida guardada?");
    if (confirmar) {
        Guardado.borrar();
        mostrarInicio(); // Actualizamos los botones del menu
    }
}

// ============================================================
// INICIAR Y MANTENER LA PANTALLA DE JUEGO
// ============================================================

// ----------------------------------------------------------
// FUNCION: iniciarJuego
// PROPOSITO: Prepara y muestra la pantalla de juego.
// Pinta todos los elementos visuales y arranca el bucle
// de juego que actualiza el estado cada segundo.
// ----------------------------------------------------------
function iniciarJuego() {
    semillaSeleccionada = null; // Reseteamos la semilla seleccionada
    mostrarPantalla("pantalla-juego");

    // Pintamos todos los elementos de la pantalla de juego
    pintarBarra();
    pintarHerramientas();
    pintarInventario();
    pintarTerreno();

    // BUCLE DE JUEGO: se ejecuta cada 1000ms (1 segundo)
    // Es el motor del juego: actualiza las plantas y redibuja el terreno
    if (intervalo !== null) {
        clearInterval(intervalo); // Por seguridad, paramos cualquier intervalo anterior
    }
    intervalo = setInterval(function() {
        terreno.actualizar(); // Comprueba si alguna planta ha cambiado de fase o madurado
        pintarTerreno();      // Redibuja el terreno con el estado actualizado
    }, 1000);
}

// ----------------------------------------------------------
// FUNCION: pintarBarra
// PROPOSITO: Actualiza los textos de la barra superior con
// los datos actuales del granjero (nombre, granja y dinero).
// textContent cambia el texto de un elemento HTML del DOM.
// ----------------------------------------------------------
function pintarBarra() {
    document.getElementById("lbl-nombre").textContent = granjero.nombre;
    document.getElementById("lbl-granja").textContent = granjero.nombreGranja;
    document.getElementById("lbl-dinero").textContent = granjero.dinero;
}

// ============================================================
// PINTAR HERRAMIENTAS EN EL PANEL LATERAL
// ============================================================

// ----------------------------------------------------------
// FUNCION: pintarHerramientas
// PROPOSITO: Genera dinamicamente el HTML de las herramientas
// en el panel lateral. Crea un div por cada herramienta con
// su imagen y su nombre con el nivel actual.
// ----------------------------------------------------------
function pintarHerramientas() {
    let contenedor = document.getElementById("lista-herramientas");
    contenedor.innerHTML = ""; // Limpiamos el contenido anterior

    for (let i = 0; i < herramientas.length; i++) {
        let h = herramientas[i];

        // Creamos el div contenedor de la herramienta
        let div = document.createElement("div");
        div.classList.add("herramienta"); // Le ponemos la clase CSS

        // Creamos la imagen de la herramienta
        let img = document.createElement("img");
        // El nombre en minusculas coincide con el nombre del archivo de imagen
        img.src = "imagenes/" + h.nombre.toLowerCase() + ".png";
        img.alt = h.nombre;
        // Si la imagen no se encuentra, la ocultamos (no rompe la pagina)
        img.onerror = function() { this.style.display = "none"; };

        // Creamos el texto con el nombre y nivel
        let span = document.createElement("span");
        span.textContent = h.nombre + " Nv." + h.nivel;

        // Ensamblamos: imagen y texto dentro del div
        div.appendChild(img);
        div.appendChild(span);

        // Anadimos el div al contenedor del HTML
        contenedor.appendChild(div);
    }
}

// ============================================================
// PINTAR INVENTARIO EN EL PANEL LATERAL
// ============================================================

// ----------------------------------------------------------
// FUNCION: pintarInventario
// PROPOSITO: Muestra las semillas disponibles del jugador.
// Cada semilla es clicable: al hacer clic se selecciona para
// poder plantarla en una parcela.
// La semilla seleccionada se resalta con un borde naranja.
// ----------------------------------------------------------
function pintarInventario() {
    let contenedor = document.getElementById("lista-inventario");
    contenedor.innerHTML = ""; // Limpiamos el contenido anterior

    // Si el inventario esta vacio, mostramos un mensaje
    if (granjero.inventario.length === 0) {
        contenedor.innerHTML = "<p class='texto-vacio'>Inventario vacio</p>";
        return;
    }

    for (let i = 0; i < granjero.inventario.length; i++) {
        let item = granjero.inventario[i]; // { nombre, cantidad }

        // Buscamos el objeto Semilla completo para acceder a su imagen
        let semilla = SEMILLAS.find(function(s) {
            return s.nombre === item.nombre;
        });

        let div = document.createElement("div");
        div.classList.add("item-inv");

        // Si esta semilla es la que esta seleccionada, le ponemos borde naranja
        if (semillaSeleccionada !== null && semillaSeleccionada.nombre === item.nombre) {
            div.classList.add("seleccionado");
        }

        // Imagen de la semilla (fase 1, porque en el inventario siempre se ve la semilla inicial)
        let img = document.createElement("img");
        img.src = semilla ? semilla.imagenes[0] : "";
        img.alt = item.nombre;
        img.onerror = function() { this.style.display = "none"; };

        // Texto con el nombre y la cantidad disponible
        let span = document.createElement("span");
        span.textContent = item.nombre + " x" + item.cantidad;

        div.appendChild(img);
        div.appendChild(span);

        // Al hacer clic en una semilla del inventario, la seleccionamos
        // Usamos una funcion anonima para capturar el valor de "semilla" en este momento
        div.addEventListener("click", function() {
            semillaSeleccionada = semilla;
            pintarInventario(); // Repintamos para actualizar el resaltado
        });

        contenedor.appendChild(div);
    }
}

// ============================================================
// PINTAR EL TERRENO DE CULTIVO
// ============================================================

// ----------------------------------------------------------
// FUNCION: pintarTerreno
// PROPOSITO: Dibuja la cuadricula de parcelas en el terreno.
// Se llama al inicio y luego cada segundo desde el setInterval.
// Muestra la imagen correcta segun la fase de cada planta,
// el tiempo restante si esta creciendo, o "Listo!" si madura.
// ----------------------------------------------------------
function pintarTerreno() {
    let cuadricula = document.getElementById("cuadricula");
    cuadricula.innerHTML = ""; // Limpiamos y redibujamos desde cero

    // Calculamos cuantas columnas tendra la cuadricula
    // 4 parcelas -> 2 columnas, 6 o 9 parcelas -> 3 columnas
    let cols = 2;
    if (terreno.parcelas.length > 4) {
        cols = 3;
    }
    // Aplicamos las columnas con CSS Grid directamente desde JS
    cuadricula.style.gridTemplateColumns = "repeat(" + cols + ", 110px)";

    for (let i = 0; i < terreno.parcelas.length; i++) {
        let parcela = terreno.parcelas[i];
        let indice = i; // Guardamos el indice en una variable local para el closure del evento

        let div = document.createElement("div");
        div.classList.add("parcela");

        if (parcela.estaVacia()) {
            // Parcela vacia: solo mostramos el texto "Vacia"
            div.innerHTML = "<p>Vacia</p>";

        } else {
            // Parcela con cultivo: mostramos la imagen de la fase actual
            let img = document.createElement("img");

            // getImagenActual() devuelve la imagen correcta segun la fase (1, 2 o 3)
            img.src = parcela.getImagenActual();

            // Si la parcela esta madura, le ponemos el borde dorado (clase CSS "madura")
            if (parcela.madura) {
                div.classList.add("madura");
            }

            img.alt = parcela.semilla.nombre;
            img.onerror = function() { this.style.display = "none"; };

            // Texto de estado debajo de la imagen
            let texto = document.createElement("p");
            if (parcela.madura) {
                texto.textContent = "Listo!"; // Lista para recolectar
            } else {
                texto.textContent = parcela.segundosRestantes() + "s"; // Tiempo restante
            }

            div.appendChild(img);
            div.appendChild(texto);
        }

        // Evento de clic en la parcela: planta o recolecta segun el estado
        div.addEventListener("click", function() {
            clicEnParcela(indice);
        });
        
        // Con click derecho se reinicia la parcela
        div.addEventListener("contextmenu", function(event) {
        event.preventDefault();

        if (!parcela.estaVacia()) {
            parcela.plantar(semillaSeleccionada);
            pintarTerreno();
        }
});

        cuadricula.appendChild(div);
    }
}

// ============================================================
// LOGICA DE INTERACCION CON LAS PARCELAS
// ============================================================

// ----------------------------------------------------------
// FUNCION: clicEnParcela
// PROPOSITO: Gestiona lo que ocurre cuando el jugador hace
// clic en una parcela. Hay tres situaciones posibles:
//   1. Parcela vacia -> intenta plantar la semilla seleccionada
//   2. Parcela madura -> recolecta el fruto y gana dinero
//   3. Parcela creciendo -> avisa de que no esta lista aun
// PARAMETROS:
//   - indice: posicion de la parcela en el array terreno.parcelas
// ----------------------------------------------------------


// Si le das clock derecho a una parcela esta se reiniciara  
   
function clicEnParcela(indice) {
    let parcela = terreno.parcelas[indice];
    
    if (parcela.estaVacia()) {
        // CASO 1: La parcela esta vacia, intentamos plantar

        if (semillaSeleccionada === null) {
            alert("Selecciona primero una semilla del inventario.");
            return;
        }
        
        // Quitamos una semilla del inventario (devuelve false si no habia)
        let quito = granjero.quitarInventario(semillaSeleccionada.nombre);
        
        if (!quito) {
            alert("No te quedan semillas de ese tipo.");
            semillaSeleccionada = null;
            pintarInventario();
            return;
        }

        // Hay una probabilidad de fallar del (35%) al plantar
        let prob = Math.random();

        if (prob < 0.35) {
            alert("La plantación ha fallado");
            pintarInventario();
            return;
        }

        // Si no falla, planta aplicando bonificacion de Regadera al tiempo de maduracion
        // Creamos una copia temporal de la semilla con el tiempo reducido para no modificar
        // el objeto original que esta en el array SEMILLAS
        let semillaConRegadera = Object.assign(Object.create(Object.getPrototypeOf(semillaSeleccionada)), semillaSeleccionada);
        semillaConRegadera.segundosMaduracion = aplicarBonificacionRegadera(semillaSeleccionada, herramientas);
        parcela.plantar(semillaConRegadera);
        

        // Actualizamos la pantalla
        pintarBarra();
        pintarInventario();
        pintarTerreno();

    } else if (parcela.madura) {
        // CASO 2: La parcela tiene un cultivo maduro, lo recolectamos

        let nombreFruto = parcela.semilla.nombre;
        // La Hoz permite obtener unidades extra al recolectar
        let extraHoz = aplicarBonificacionHoz(herramientas);
        let unidades = 1 + extraHoz;

        // Anadimos el cultivo recolectado al almacen de venta (no al inventario de semillas)
        granjero.agregarCultivo(nombreFruto, unidades);

        // Limpiamos la parcela dejandola vacia de nuevo
        parcela.limpiar();

        let msgHoz = extraHoz > 0 ? " (+" + extraHoz + " extra por Hoz)" : "";
        alert("Has recolectado " + unidades + "x " + nombreFruto + msgHoz + ". Vendelo en la tienda.");

        // Actualizamos la pantalla
        pintarBarra();
        pintarTerreno();

    }else {
        // CASO 3: La parcela tiene un cultivo que todavia no ha madurado
        alert("No esta listo todavia. Quedan " + parcela.segundosRestantes() + " segundos.");
    }
}

// ============================================================
// BOTON PROVISIONAL: RECARGAR SEMILLAS (solo para Fase 1)
// Este boton sustituye a la tienda que se implementara en Fase 2.
// Permite al jugador reponer semillas para poder seguir probando.
// ============================================================

function recargarSemillas() {
    granjero.agregarInventario("CerdiPlanta", 3);
    granjero.agregarInventario("VaquiPlanta", 2);
    granjero.agregarInventario("GatiPlanta", 1);
    pintarInventario(); // Actualizamos el inventario en pantalla
}

// ============================================================
// GUARDAR PARTIDA
// ============================================================

// ----------------------------------------------------------
// FUNCION: guardarPartida
// PROPOSITO: Llama a Guardado.guardar() para almacenar el
// estado actual en localStorage y avisa al jugador.
// ----------------------------------------------------------
function guardarPartida() {
    Guardado.guardar(granjero, terreno, herramientas);
    alert("Partida guardada correctamente.");
}