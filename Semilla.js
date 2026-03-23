// Clase Semilla
// Fase 1: solo 2 semillas hardcodeadas
// Cada semilla tiene 3 fases visuales: semilla, creciendo, madura

class Semilla {

    constructor(nombre, segundosMaduracion, precioVenta, imgFase1, imgFase2, imgFase3) {
        this.nombre = nombre;
        this.segundosMaduracion = segundosMaduracion;
        this.precioVenta = precioVenta;
        // Las 3 imagenes de las fases de crecimiento
        this.imagenes = [imgFase1, imgFase2, imgFase3];
        // IMAGEN fase 1: semilla recien plantada       -> img/zanahoria-fase1.png
        // IMAGEN fase 2: planta a medias de crecer     -> img/zanahoria-fase2.png
        // IMAGEN fase 3: planta madura lista a cosechar-> img/zanahoria-fase3.png
    }
}

// Las dos semillas disponibles en Fase 1 (hardcodeadas)
const SEMILLAS = [
    new Semilla(
        "CerdiPlanta",
        30,
        15,
        "imagenes/Cerdo_1.png",  // IMAGEN: semilla/brote recien plantado
        "imagenes/Cerdo_2.png",  // IMAGEN: zanahoria creciendo
        "imagenes/Cerdo_3.png"   // IMAGEN: zanahoria madura
    ),
    new Semilla(
        "VaquiPlanta",
        60,
        30,
        "imagenes/Vaca_1.png",     // IMAGEN: semilla/brote recien plantado
        "imagenes/Vaca_2.png",     // IMAGEN: tomate creciendo
        "imagenes/Vaca_3.png"      // IMAGEN: tomate maduro
    )
];
