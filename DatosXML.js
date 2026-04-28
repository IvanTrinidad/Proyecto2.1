// ============================================================
// ARCHIVO: DatosXML.js
// PROPOSITO: Carga datos.xml y rellena las variables globales
// SEMILLAS y DATOS_HERRAMIENTAS que antes estaban hardcodeadas.
// Expone la funcion cargarDatosXML() que devuelve una Promise.
// El resto del juego no arranca hasta que esta Promise resuelve.
// ============================================================

// Variables globales que este archivo rellena al cargar el XML.
// Se declaran con let para que puedan reasignarse desde aqui.
let SEMILLAS = [];             // Array de objetos Semilla (igual que antes)
let DATOS_HERRAMIENTAS = [];   // Array con los datos completos de herramientas del XML
let _xmlDocCargado = null;     // Referencia al xmlDoc parseado, reutilizado por la tienda

// ============================================================
// FUNCION: cargarDatosXML
// PROPOSITO: Hace fetch de datos.xml, lo parsea y rellena
// SEMILLAS y DATOS_HERRAMIENTAS. Devuelve una Promise para
// que main.js pueda esperar antes de inicializar el juego.
// ============================================================
function cargarDatosXML() {
    return fetch("datos.xml")
        .then(function(respuesta) {
            if (!respuesta.ok) {
                throw new Error("No se pudo cargar datos.xml: " + respuesta.status);
            }
            return respuesta.text();
        })
        .then(function(textoXML) {
            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(textoXML, "application/xml");

            // Comprobamos errores de parseo del XML
            let error = xmlDoc.querySelector("parsererror");
            if (error) {
                throw new Error("Error al parsear datos.xml: " + error.textContent);
            }

            _xmlDocCargado = xmlDoc; // Guardamos para reutilizar en la tienda (XPath)
            _parsearSemillas(xmlDoc);
            _parsearHerramientas(xmlDoc);
        });
}

// ============================================================
// FUNCION PRIVADA: _parsearSemillas
// PROPOSITO: Extrae los nodos <semilla> del XML y construye
// objetos Semilla identicos a los que habia hardcodeados.
// ============================================================
function _parsearSemillas(xmlDoc) {
    SEMILLAS = []; // Vaciamos antes de rellenar

    let nodosSemilla = xmlDoc.querySelectorAll("semillas semilla");

    nodosSemilla.forEach(function(nodo) {
        let nombre             = _texto(nodo, "nombre");
        let segundosMaduracion = parseInt(_texto(nodo, "segundosMaduracion"), 10);
        let precioVenta        = parseInt(_texto(nodo, "precioVenta"), 10);
        let precioCompra       = parseInt(_texto(nodo, "precioCompra"), 10);
        let tipo               = _texto(nodo, "tipo").toLowerCase(); // guardamos en minusculas para que coincida con el filtro XPath
        let img1               = _texto(nodo, "imgFase1");
        let img2               = _texto(nodo, "imgFase2");
        let img3               = _texto(nodo, "imgFase3");

        // Creamos el objeto Semilla (usa la clase definida en Semilla.js)
        let semilla = new Semilla(nombre, segundosMaduracion, precioVenta, img1, img2, img3);

        // Anadimos los datos extra que vienen del XML (no estaban en Fase 1)
        semilla.precioCompra = precioCompra;
        semilla.tipo = tipo;

        SEMILLAS.push(semilla);
    });
}

// ============================================================
// FUNCION PRIVADA: _parsearHerramientas
// PROPOSITO: Extrae los nodos <herramienta> del XML y
// construye objetos con todos los datos de niveles y costes.
// Se guarda en DATOS_HERRAMIENTAS para usarlo en la tienda
// y al mejorar herramientas.
// ============================================================
function _parsearHerramientas(xmlDoc) {
    DATOS_HERRAMIENTAS = [];

    let nodosHerramienta = xmlDoc.querySelectorAll("herramientas herramienta");

    nodosHerramienta.forEach(function(nodo) {
        let nombre      = _texto(nodo, "nombre");
        let descripcion = _texto(nodo, "descripcion");

        let niveles = [];
        let nodosNivel = nodo.querySelectorAll("nivel");

        nodosNivel.forEach(function(nNivel) {
            niveles.push({
                id:              parseInt(nNivel.getAttribute("id"), 10),
                costeUpgrade:    parseInt(_texto(nNivel, "costeUpgrade"), 10),
                bonificacion:    parseInt(_texto(nNivel, "bonificacion"), 10),
                descripcionNivel: _texto(nNivel, "descripcionNivel")
            });
        });

        DATOS_HERRAMIENTAS.push({ nombre, descripcion, niveles });
    });
}

// ============================================================
// FUNCION PRIVADA: _texto
// PROPOSITO: Extrae el textContent de un nodo hijo por tagName.
// Devuelve "" si el nodo no existe.
// ============================================================
function _texto(nodoParent, tagName) {
    let hijo = nodoParent.querySelector(tagName);
    return hijo ? hijo.textContent.trim() : "";
}

// ============================================================
// FUNCION: obtenerDatosHerramienta
// PROPOSITO: Devuelve el objeto de DATOS_HERRAMIENTAS que
// coincide con el nombre dado. Util en la tienda y al mejorar.
// ============================================================
function obtenerDatosHerramienta(nombre) {
    return DATOS_HERRAMIENTAS.find(function(h) { return h.nombre === nombre; }) || null;
}

// ============================================================
// FUNCION: obtenerSiguienteNivel
// PROPOSITO: Dado un objeto Herramienta, devuelve el siguiente
// nivel del XML (o null si ya esta al maximo).
// ============================================================
function obtenerSiguienteNivel(herramienta) {
    let datos = obtenerDatosHerramienta(herramienta.nombre);
    if (!datos) return null;

    let siguiente = Number(herramienta.nivel) + 1;
    return datos.niveles.find(function(n) { return n.id === siguiente; }) || null;
}

// ============================================================
// FUNCION: aplicarBonificacionAzada
// PROPOSITO: Calcula el precio de venta de una semilla
// aplicando la bonificacion de la Azada segun su nivel.
// ============================================================
function aplicarBonificacionAzada(semilla, herramientas) {
    let azada = herramientas.find(function(h) { return h.nombre === "Azada"; });
    if (!azada) return semilla.precioVenta;

    let datos = obtenerDatosHerramienta("Azada");
    if (!datos) return semilla.precioVenta;

    let nivelDatos = datos.niveles.find(function(n) { return n.id === Number(azada.nivel); });
    if (!nivelDatos) return semilla.precioVenta;

    let porcentaje = nivelDatos.bonificacion; // ej: 10 significa +10%
    return Math.floor(semilla.precioVenta * (1 + porcentaje / 100));
}

// ============================================================
// FUNCION: aplicarBonificacionRegadera
// PROPOSITO: Calcula los segundos de maduracion de una semilla
// con la reduccion de la Regadera segun su nivel.
// ============================================================
function aplicarBonificacionRegadera(semilla, herramientas) {
    let regadera = herramientas.find(function(h) { return h.nombre === "Regadera"; });
    if (!regadera) return semilla.segundosMaduracion;

    let datos = obtenerDatosHerramienta("Regadera");
    if (!datos) return semilla.segundosMaduracion;

    let nivelDatos = datos.niveles.find(function(n) { return n.id === Number(regadera.nivel); });
    if (!nivelDatos) return semilla.segundosMaduracion;

    let porcentaje = nivelDatos.bonificacion; // ej: 15 significa -15%
    return Math.max(5, Math.floor(semilla.segundosMaduracion * (1 - porcentaje / 100)));
}

// ============================================================
// FUNCION: aplicarBonificacionHoz
// PROPOSITO: Calcula cuantas unidades extra se obtienen al
// recolectar segun el nivel de la Hoz.
// ============================================================
function aplicarBonificacionHoz(herramientas) {
    let hoz = herramientas.find(function(h) { return h.nombre === "Hoz"; });
    if (!hoz) return 0;

    let datos = obtenerDatosHerramienta("Hoz");
    if (!datos) return 0;

    let nivelDatos = datos.niveles.find(function(n) { return n.id === Number(hoz.nivel); });
    return nivelDatos ? nivelDatos.bonificacion : 0;
}

// ============================================================
// FUNCION: getXmlDoc
// PROPOSITO: Devuelve el documento XML ya parseado para que
// Tienda.js pueda usarlo en las consultas XPath sin volver
// a hacer fetch ni parsear de nuevo.
// ============================================================
function getXmlDoc() {
    return _xmlDocCargado;
}
