// ============================================================
// CLASE: Guardado
// PROPOSITO: Gestiona el guardado y la carga de la partida
// usando localStorage, que es el almacenamiento del navegador.
// localStorage guarda datos en formato clave-valor de forma
// persistente: los datos no se pierden aunque se cierre el navegador.
//
// Todos los metodos son ESTATICOS, lo que significa que se pueden
// usar directamente con Guardado.guardar() sin necesidad de
// crear un objeto con new Guardado().
// ============================================================

class Guardado {

    // ----------------------------------------------------------
    // METODO ESTATICO: guardar
    // PROPOSITO: Guarda el estado actual de la partida en localStorage.
    // Solo guardamos los datos minimos necesarios para no ocupar
    // mas espacio del necesario (localStorage tiene limite de ~5MB).
    // PARAMETROS:
    //   - granjero: objeto Granjero con los datos del jugador
    //   - terreno: objeto Terreno con el estado de las parcelas
    //   - herramientas: array de objetos Herramienta
    // ----------------------------------------------------------
    static guardar(granjero, terreno, herramientas) {

        // Creamos un objeto plano con solo los datos que necesitamos guardar
        let datos = {

            // Datos del granjero
            granjero: {
                nombre: granjero.nombre,
                nombreGranja: granjero.nombreGranja,
                dinero: granjero.dinero,
                inventario: granjero.inventario // Array con las semillas que tiene
            },

            // De cada herramienta guardamos nombre, descripcion y nivel
            // map() transforma cada objeto Herramienta en un objeto simple
            herramientas: herramientas.map(function(h) {
                return { nombre: h.nombre, descripcion: h.descripcion, nivel: h.nivel };
            }),

            // De cada parcela guardamos solo lo necesario para reconstruirla:
            // que semilla tenia, cuando se planto, si estaba madura y en que fase
            parcelas: terreno.parcelas.map(function(p) {
                return {
                    semillaNombre: p.semilla ? p.semilla.nombre : null, // null si estaba vacia
                    timestampPlantado: p.timestampPlantado, // Momento en que se planto
                    madura: p.madura,
                    fase: p.fase
                };
            })
        };

        // JSON.stringify() convierte el objeto JavaScript a texto JSON
        // localStorage solo puede guardar texto, no objetos directamente
        localStorage.setItem("plantimales", JSON.stringify(datos));
    }

    // ----------------------------------------------------------
    // METODO ESTATICO: cargar
    // PROPOSITO: Lee la partida guardada del localStorage y la
    // devuelve como un objeto JavaScript.
    // DEVUELVE: el objeto con los datos, o null si no hay partida
    // ----------------------------------------------------------
    static cargar() {
        // getItem devuelve el texto guardado, o null si no existe esa clave
        let raw = localStorage.getItem("plantimales");

        if (raw === null) {
            return null; // No hay ninguna partida guardada
        }

        // JSON.parse() convierte el texto JSON de vuelta a un objeto JavaScript
        return JSON.parse(raw);
    }

    // ----------------------------------------------------------
    // METODO ESTATICO: existe
    // PROPOSITO: Comprueba si hay una partida guardada.
    // Se usa al cargar la pagina para activar o desactivar los
    // botones "Continuar Partida" y "Eliminar Partida".
    // DEVUELVE: true si hay partida guardada, false si no
    // ----------------------------------------------------------
    static existe() {
        return localStorage.getItem("plantimales") !== null;
    }

    // ----------------------------------------------------------
    // METODO ESTATICO: borrar
    // PROPOSITO: Elimina la partida guardada del localStorage.
    // Se llama cuando el jugador pulsa "Eliminar Partida".
    // ----------------------------------------------------------
    static borrar() {
        localStorage.removeItem("plantimales");
    }
}