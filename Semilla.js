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
        "Zanahoria",
        30,
        15,
        "Captura de pantalla 2026-01-25 163036.png",  // IMAGEN: semilla/brote recien plantado
        "Captura de pantalla 2026-01-25 163630.png",  // IMAGEN: zanahoria creciendo
        "Captura de pantalla 2026-01-25 163702.png"   // IMAGEN: zanahoria madura
    ),
    new Semilla(
        "Tomate",
        60,
        30,
        "img/tomate-fase1.png",     // IMAGEN: semilla/brote recien plantado
        "img/tomate-fase2.png",     // IMAGEN: tomate creciendo
        "img/tomate-fase3.png"      // IMAGEN: tomate maduro
    )
];
