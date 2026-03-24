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
// PROPOSITO: Almacena las dos semillas disponibles en Fase 1.
// Es una constante global accesible desde cualquier archivo JS
// que se cargue despues de este en el HTML.
// En Fase 2 se integrara con un fichero XML para gestionarlas.
// ============================================================
const SEMILLAS = [

    new Semilla(
        "CerdiPlanta",          // Nombre identificador
        30,                     // Madura en 30 segundos
        15,                     // Da 15 monedas al recolectar
        "imagenes/cerdo_1.png", // Fase 1: recien plantada
        "imagenes/Cerdo_2.png", // Fase 2: creciendo
        "imagenes/Cerdo_3.png"  // Fase 3: madura, lista para recolectar
    ),

    new Semilla(
        "VaquiPlanta",          // Nombre identificador
        60,                     // Madura en 60 segundos (el doble que la CerdiPlanta)
        30,                     // Da 30 monedas al recolectar (el doble de beneficio)
        "imagenes/Vaca_1.png",  // Fase 1: recien plantada
        "imagenes/Vaca_2.png",  // Fase 2: creciendo
        "imagenes/Vaca_3.png"   // Fase 3: madura, lista para recolectar
    )
];