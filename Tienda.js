// ============================================================
// ARCHIVO: Tienda.js
// PROPOSITO: Logica de la pantalla de tienda.
// Permite comprar semillas (cargadas del XML) y vender
// cultivos del inventario. Implementa filtrado con XPath
// segun el requisito del proyecto de integracion XML.
// ============================================================

// Referencia al documento XML cargado, necesario para XPath
let xmlDocTienda = null;

// ============================================================
// FUNCION: inicializarTienda
// PROPOSITO: Guarda la referencia al xmlDoc para poder usar
// XPath en el filtrado. Se llama desde main.js tras cargar el XML.
// ============================================================
function inicializarTienda(xmlDoc) {
    xmlDocTienda = xmlDoc;
}

// ============================================================
// FUNCION: mostrarTienda
// PROPOSITO: Navega a la pantalla de tienda y la renderiza.
// ============================================================
function mostrarTienda() {
    // En tienda.html la pantalla ya esta activa via CSS (clase activa en el div)
    // Solo pintamos el contenido
    pintarDineroTienda();
    pintarTiendaCompra(SEMILLAS);
    pintarTiendaVenta();
    pintarMejorasHerramientas();
}

// ============================================================
// FUNCION: pintarDineroTienda
// PROPOSITO: Actualiza el dinero mostrado en la barra de tienda.
// ============================================================
function pintarDineroTienda() {
    let lbl = document.getElementById("tienda-dinero");
    if (lbl) lbl.textContent = granjero.dinero;
}

// ============================================================
// FUNCION: pintarTiendaCompra
// PROPOSITO: Renderiza las tarjetas de semillas disponibles
// para comprar. Recibe el array de semillas a mostrar
// (puede ser el completo o uno filtrado por XPath).
// ============================================================
function pintarTiendaCompra(semillasAMostrar) {
    let contenedor = document.getElementById("tienda-compra-lista");
    contenedor.innerHTML = "";

    if (!semillasAMostrar || semillasAMostrar.length === 0) {
        contenedor.innerHTML = "<p class='texto-vacio'>No hay semillas con ese filtro.</p>";
        return;
    }

    semillasAMostrar.forEach(function(semilla) {
        let div = document.createElement("div");
        div.classList.add("tienda-item");

        let img = document.createElement("img");
        img.src = semilla.imagenes[0];
        img.alt = semilla.nombre;
        img.onerror = function() { this.style.display = "none"; };

        let info = document.createElement("div");
        info.classList.add("tienda-item-info");

        let nombre = document.createElement("strong");
        nombre.textContent = semilla.nombre;

        let tipo = document.createElement("span");
        tipo.textContent = "Tipo: " + semilla.tipo;

        let tiempo = document.createElement("span");
        tiempo.textContent = "Madura en: " + semilla.segundosMaduracion + "s";

        let venta = document.createElement("span");
        let precioConAzada = aplicarBonificacionAzada(semilla, herramientas);
        venta.textContent = "Venta: " + precioConAzada + " monedas";

        let precio = document.createElement("span");
        precio.textContent = "Compra: " + semilla.precioCompra + " monedas";

        let btn = document.createElement("button");
        btn.textContent = "Comprar";
        btn.addEventListener("click", function() {
            comprarSemilla(semilla);
        });

        info.appendChild(nombre);
        info.appendChild(tipo);
        info.appendChild(tiempo);
        info.appendChild(venta);
        info.appendChild(precio);
        info.appendChild(btn);

        div.appendChild(img);
        div.appendChild(info);
        contenedor.appendChild(div);
    });
}

// ============================================================
// FUNCION: comprarSemilla
// PROPOSITO: Descuenta el precio al granjero y anade la semilla
// al inventario. Actualiza la pantalla de tienda.
// ============================================================
function comprarSemilla(semilla) {
    if (granjero.dinero < semilla.precioCompra) {
        alert("No tienes suficiente dinero para comprar " + semilla.nombre + ".");
        return;
    }
    granjero.dinero -= semilla.precioCompra;
    granjero.agregarInventario(semilla.nombre, 1);
    // Refrescamos el dinero y la lista de compra para que el jugador vea el cambio
    pintarDineroTienda();
    pintarTiendaCompra(SEMILLAS);
    alert("Has comprado 1x " + semilla.nombre + ".");
}

// ============================================================
// FUNCION: pintarTiendaVenta
// PROPOSITO: Muestra los cultivos del inventario que se
// pueden vender. Aplica el bonus de la Azada al precio.
// ============================================================
function pintarTiendaVenta() {
    let contenedor = document.getElementById("tienda-venta-lista");
    contenedor.innerHTML = "";

    if (!granjero || !granjero.cultivos) {
        contenedor.innerHTML = "<p class='texto-vacio'>No tienes cultivos para vender.</p>";
        return;
    }

    let tieneCultivos = false;

    granjero.cultivos.forEach(function(item) {
        let semilla = SEMILLAS.find(function(s) { return s.nombre === item.nombre; });
        if (!semilla) return;

        tieneCultivos = true;

        let div = document.createElement("div");
        div.classList.add("tienda-item");

        let img = document.createElement("img");
        img.src = semilla.imagenes[2]; // Imagen madura para venta
        img.alt = item.nombre;
        img.onerror = function() { this.style.display = "none"; };

        let info = document.createElement("div");
        info.classList.add("tienda-item-info");

        let nombre = document.createElement("strong");
        nombre.textContent = item.nombre + " x" + item.cantidad;

        let precioConAzada = aplicarBonificacionAzada(semilla, herramientas);
        let precio = document.createElement("span");
        precio.textContent = "Precio: " + precioConAzada + " monedas/ud";

        let btn = document.createElement("button");
        btn.textContent = "Vender todo";
        btn.addEventListener("click", function() {
            venderCultivo(semilla, item.cantidad);
        });

        info.appendChild(nombre);
        info.appendChild(precio);
        info.appendChild(btn);

        div.appendChild(img);
        div.appendChild(info);
        contenedor.appendChild(div);
    });

    if (!tieneCultivos) {
        contenedor.innerHTML = "<p class='texto-vacio'>No tienes cultivos para vender.</p>";
    }
}

// ============================================================
// FUNCION: venderCultivo
// PROPOSITO: Vende todas las unidades de un cultivo,
// aplica bonus de Azada y actualiza el estado.
// ============================================================
function venderCultivo(semilla, cantidad) {
    let precioConAzada = aplicarBonificacionAzada(semilla, herramientas);
    let total = precioConAzada * cantidad;

    // Quitamos las unidades del almacen de cultivos recolectados
    granjero.quitarCultivo(semilla.nombre, cantidad);

    granjero.dinero += total;
    alert("Has vendido " + cantidad + "x " + semilla.nombre + " por " + total + " monedas.");
// Comprobar logro (si juego.js está activo, la función existe)
    if (typeof _comprobarLogro === "function") _comprobarLogro();
    
    pintarDineroTienda();
    pintarTiendaVenta();
}

// ============================================================
// FUNCION: pintarMejorasHerramientas
// PROPOSITO: Muestra las herramientas con sus niveles actuales
// y el boton para mejorarlas si tienen nivel siguiente.
// Usa DATOS_HERRAMIENTAS (cargados del XML).
// ============================================================

function pintarMejorasHerramientas() {
    let contenedor = document.getElementById("tienda-mejoras-lista");
    contenedor.innerHTML = "";

    if (!herramientas || herramientas.length === 0) {
        contenedor.innerHTML = "<p class='texto-vacio'>No hay herramientas disponibles.</p>";
        return;
    }

    herramientas.forEach(function(her) {
        let divHer = document.createElement("div");
        divHer.classList.add("tienda-item");

        let img = document.createElement("img");
        img.src = "imagenes/" + her.nombre.toLowerCase() + ".png";
        img.alt = her.nombre;
        img.onerror = function() { this.style.display = "none"; };

        let info = document.createElement("div");
        info.classList.add("tienda-item-info");

        let nombre = document.createElement("strong");
        nombre.textContent = her.nombre + " — Nivel " + her.nivel;

        let datosXML = obtenerDatosHerramienta(her.nombre);
        let nivelActualDatos = datosXML
            ? datosXML.niveles.find(function(n) { return n.id === Number(her.nivel); })
            : null;

        let descActual = document.createElement("span");
        descActual.textContent = nivelActualDatos
            ? nivelActualDatos.descripcionNivel
            : her.descripcion;

        info.appendChild(nombre);
        info.appendChild(descActual);
 // Si la herramienta está rota, mostramos solo el botón de reparar
        if (her.rota) {
            let divRota = document.createElement("span");
            divRota.textContent = "ROTA";
            divRota.style.color = "red";
            divRota.style.fontWeight = "bold";

            let precioReparacion = 40 * her.nivel;
            let btnReparar = document.createElement("button");
            btnReparar.textContent = "🔧 Reparar (" + precioReparacion + " monedas)";
            btnReparar.addEventListener("click", (function(herRef, precio) {
                return function() {
                    if (granjero.dinero < precio) {
                        alert("No tienes suficiente dinero para reparar " + herRef.nombre + ".");
                        return;
                    }
                    granjero.dinero -= precio;
                    herRef.rota = false;
                    alert(herRef.nombre + " reparada correctamente.");
                    pintarDineroTienda();
                    pintarMejorasHerramientas();
                };
            })(her, precioReparacion));

            info.appendChild(divRota);
            info.appendChild(btnReparar);
            divHer.appendChild(img);
            divHer.appendChild(info);
            contenedor.appendChild(divHer);
            return; // No mostramos opciones de mejora si está rota
        }
        let siguienteNivel = obtenerSiguienteNivel(her);
        if (siguienteNivel) {
            let descSig = document.createElement("span");
            descSig.textContent = "Siguiente: " + siguienteNivel.descripcionNivel
                + " — Coste: " + siguienteNivel.costeUpgrade + " monedas";

            let btn = document.createElement("button");
            btn.textContent = "Mejorar (" + siguienteNivel.costeUpgrade + ")";
            // Capturamos her por referencia para que al pulsar se use el nivel actual
            btn.addEventListener("click", (function(herRef) {
                return function() {
                    let sigNivel = obtenerSiguienteNivel(herRef);
                    if (sigNivel) mejorarHerramienta(herRef, sigNivel);
                };
            })(her));

            info.appendChild(descSig);
            info.appendChild(btn);
        } else {
            let max = document.createElement("span");
            max.textContent = "Nivel maximo alcanzado";
            info.appendChild(max);
        }

        divHer.appendChild(img);
        divHer.appendChild(info);
        contenedor.appendChild(divHer);

        
    });
}

// ============================================================
// FUNCION: mejorarHerramienta
// PROPOSITO: Descuenta el coste y sube el nivel de la herramienta.
// ============================================================
function mejorarHerramienta(herramienta, siguienteNivelDatos) {
    if (granjero.dinero < siguienteNivelDatos.costeUpgrade) {
        alert("No tienes suficiente dinero para mejorar " + herramienta.nombre + ".");
        return;
    }
    granjero.dinero -= siguienteNivelDatos.costeUpgrade;
    herramienta.nivel++;
    alert(herramienta.nombre + " mejorada al nivel " + herramienta.nivel + ".");
    pintarDineroTienda();
    pintarMejorasHerramientas();
}


// ============================================================
// FILTRADO XPath DE SEMILLAS EN LA TIENDA
// PROPOSITO: Usa XPath para seleccionar semillas del XML
// segun el criterio elegido por el usuario.
// ============================================================

// ----------------------------------------------------------
// FUNCION: filtrarSemillasXPath
// PROPOSITO: Lee el criterio del select de filtrado, construye
// la expresion XPath correspondiente, la evalua sobre el XML
// y llama a pintarTiendaCompra con el resultado filtrado.
// ----------------------------------------------------------
function filtrarSemillasXPath() {
    if (!xmlDocTienda) {
        pintarTiendaCompra(SEMILLAS);
        return;
    }

    let criterio = document.getElementById("filtro-criterio").value;
    let valor    = document.getElementById("filtro-valor").value.trim();

    // Si no hay valor buscado mostramos todas
    if (valor === "") {
        pintarTiendaCompra(SEMILLAS);
        return;
    }

    let expresionXPath = "";

    switch (criterio) {
        case "tipo":
            // normalize-space() elimina espacios y saltos de linea del texto del nodo
            // sin esto, la comparacion falla porque el XML tiene whitespace alrededor
            expresionXPath = "//semilla[normalize-space(tipo)='" + valor.toLowerCase() + "']";
            break;

        case "precioMax":
            // number() convierte el texto del nodo a numero para comparar
            // normalize-space() evita que el whitespace rompa la conversion
            expresionXPath = "//semilla[number(normalize-space(precioCompra))<=" + parseFloat(valor) + "]";
            break;

        case "tiempoMax":
            expresionXPath = "//semilla[number(normalize-space(segundosMaduracion))<=" + parseFloat(valor) + "]";
            break;

        case "ventaMin":
            expresionXPath = "//semilla[number(normalize-space(precioVenta))>=" + parseFloat(valor) + "]";
            break;

        default:
            pintarTiendaCompra(SEMILLAS);
            return;
    }

    // Evaluamos la expresion XPath sobre el documento XML
    let resultado;
    try {
        resultado = xmlDocTienda.evaluate(
            expresionXPath,
            xmlDocTienda,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
        );
    } catch (e) {
        alert("Error en el filtro XPath: " + e.message);
        return;
    }

    // Recogemos los nombres de las semillas que devolvio XPath
    // Usamos getElementsByTagName porque los nodos XPath no soportan querySelector
    let nombresFiltrados = [];
    for (let i = 0; i < resultado.snapshotLength; i++) {
        let nodo = resultado.snapshotItem(i);
        let nodoNombre = nodo.getElementsByTagName("nombre")[0];
        if (nodoNombre) nombresFiltrados.push(nodoNombre.textContent.trim());
    }

    // Filtramos el array global SEMILLAS por los nombres obtenidos
    let semillasFiltradas = SEMILLAS.filter(function(s) {
        return nombresFiltrados.includes(s.nombre);
    });

    pintarTiendaCompra(semillasFiltradas);
}

// ----------------------------------------------------------
// FUNCION: limpiarFiltro
// PROPOSITO: Resetea el filtro y muestra todas las semillas.
// ----------------------------------------------------------
function limpiarFiltro() {
    document.getElementById("filtro-valor").value = "";
    document.getElementById("filtro-criterio").value = "tipo";
    pintarTiendaCompra(SEMILLAS);
}
