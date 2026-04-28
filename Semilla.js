// ============================================================
// CLASE: Semilla
// PROPOSITO: Representa un tipo de semilla que se puede plantar.
// Cada semilla tiene un nombre, un tiempo de maduracion en
// segundos, un precio de venta y tres imagenes que representan
// sus fases de crecimiento (recien plantada, creciendo, madura).
//
// En la Fase 1 solo hay 2 semillas, hardcodeadas directamente
// en el array SEMILLAS al final de este archivo.
// ============================================================

class Semilla {

    // ----------------------------------------------------------
    // CONSTRUCTOR
    // PARAMETROS:
    //   - nombre: identificador de la semilla (ej: "CerdiPlanta")
    //   - segundosMaduracion: tiempo que tarda en madurar
    //   - precioVenta: monedas que gana el jugador al recolectarla
    //   - imgFase1: imagen cuando acaba de plantarse
    //   - imgFase2: imagen cuando esta a medias de crecer
    //   - imgFase3: imagen cuando esta madura y lista para recolectar
    // ----------------------------------------------------------
    constructor(nombre, segundosMaduracion, precioVenta, imgFase1, imgFase2, imgFase3) {
        this.nombre = nombre;
        this.segundosMaduracion = segundosMaduracion;
        this.precioVenta = precioVenta;

        // Guardamos las 3 imagenes en un array para acceder a ellas
        // por indice segun la fase: imagenes[0]=fase1, imagenes[1]=fase2, imagenes[2]=fase3
        this.imagenes = [imgFase1, imgFase2, imgFase3];
    }
}

// ============================================================
// ARRAY GLOBAL: SEMILLAS
// PROPOSITO: Se rellena dinamicamente desde datos.xml mediante
// DatosXML.js al arrancar el juego. No se hardcodea aqui.
// La declaracion (let SEMILLAS = []) esta en DatosXML.js.
// ============================================================