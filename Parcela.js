// ============================================================
// CLASE: Parcela
// PROPOSITO: Representa una parcela individual del terreno.
// Una parcela puede estar vacia o tener una semilla plantada.
// Controla el tiempo de crecimiento y la fase visual actual
// (1=recien plantada, 2=creciendo, 3=madura).
// ============================================================

class Parcela {

    // ----------------------------------------------------------
    // CONSTRUCTOR
    // Crea una parcela vacia. Todos los atributos empiezan en
    // null o false porque todavia no tiene nada plantado.
    // ----------------------------------------------------------
    constructor() {
        this.semilla = null;            // Objeto Semilla plantado, o null si esta vacia
        this.timestampPlantado = null;  // Momento exacto en que se planto (Date.now())
                                        // Se usa para calcular cuanto tiempo ha pasado
        this.madura = false;            // true cuando ya ha pasado el tiempo de maduracion
        this.fase = 0;                  // Fase visual: 0=vacia, 1=plantada, 2=creciendo, 3=madura
    }

    // ----------------------------------------------------------
    // METODO: estaVacia
    // PROPOSITO: Indica si la parcela no tiene nada plantado.
    // Se usa antes de plantar para saber si la parcela esta libre.
    // DEVUELVE: true si esta vacia, false si tiene algo plantado
    // ----------------------------------------------------------
    estaVacia() {
        return this.semilla === null;
    }

    // ----------------------------------------------------------
    // METODO: plantar
    // PROPOSITO: Planta una semilla en esta parcela.
    // Guarda la referencia a la semilla y registra el momento
    // exacto en que se planto para calcular el tiempo transcurrido.
    // PARAMETROS:
    //   - semilla: objeto Semilla que se va a plantar
    // ----------------------------------------------------------
    plantar(semilla) {
        this.semilla = semilla;
        this.timestampPlantado = Date.now(); // Guardamos el timestamp actual en milisegundos
        this.madura = false;
        this.fase = 1; // La planta empieza en fase 1 (recien plantada)
    }

    // ----------------------------------------------------------
    // METODO: actualizar
    // PROPOSITO: Comprueba si la planta ha avanzado de fase o
    // ya ha madurado. Se llama cada segundo desde el setInterval
    // de main.js para mantener el estado actualizado.
    //
    // LOGICA DE FASES:
    // El tiempo total se divide en 3 tramos iguales:
    //   - 0%  a 50% del tiempo -> fase 1 (recien plantada)
    //   - 50% a 100% del tiempo -> fase 2 (creciendo)
    //   - 100% del tiempo       -> fase 3 (madura)
    // ----------------------------------------------------------
    actualizar() {

        // Si no hay semilla o ya esta madura, no hay nada que actualizar
        if (this.semilla === null || this.madura) return;

        // Calculamos cuantos segundos han pasado desde que se planto
        // Date.now() devuelve milisegundos, dividimos entre 1000 para tener segundos
        let segundosTranscurridos = (Date.now() - this.timestampPlantado) / 1000;
        let total = this.semilla.segundosMaduracion;

        if (segundosTranscurridos >= total) {
            // Ha superado el tiempo total: la planta esta madura
            this.madura = true;
            this.fase = 3;
        } else if (segundosTranscurridos >= total * (1.5 / 3)) {
            // Ha superado la mitad del tiempo: fase 2 (creciendo)
            this.fase = 2;
        } else {
            // Todavia en la primera mitad del tiempo: fase 1
            this.fase = 1;
        }
    }

    // ----------------------------------------------------------
    // METODO: getImagenActual
    // PROPOSITO: Devuelve la ruta de la imagen que corresponde
    // a la fase actual de crecimiento de la planta.
    // Se usa en main.js al pintar el terreno para mostrar
    // la imagen correcta en cada parcela.
    // DEVUELVE: string con la ruta de la imagen, o "" si vacia
    // ----------------------------------------------------------
    getImagenActual() {
        if (this.semilla === null) return "";

        // Convertimos la fase (1, 2 o 3) al indice del array (0, 1 o 2)
        let indice = this.fase - 1;

        // Nos aseguramos de que el indice este dentro del rango valido
        if (indice < 0) indice = 0;
        if (indice > 2) indice = 2;

        // Devolvemos la ruta de la imagen correspondiente a esa fase
        return this.semilla.imagenes[indice];
    }

    // ----------------------------------------------------------
    // METODO: segundosRestantes
    // PROPOSITO: Calcula cuantos segundos faltan para que la
    // planta madure. Se muestra en la parcela mientras crece.
    // DEVUELVE: numero de segundos restantes (minimo 0)
    // ----------------------------------------------------------
    segundosRestantes() {
        // Si esta vacia o ya madura, no hay tiempo que mostrar
        if (this.semilla === null || this.madura) {
            return 0;
        }

        let transcurrido = (Date.now() - this.timestampPlantado) / 1000;
        let restante = this.semilla.segundosMaduracion - transcurrido;

        // Math.max(0, ...) evita que devuelva numeros negativos
        // Math.ceil() redondea hacia arriba para mostrar siempre un entero
        return Math.max(0, Math.ceil(restante));
    }

    // ----------------------------------------------------------
    // METODO: limpiar
    // PROPOSITO: Resetea la parcela dejandola vacia de nuevo.
    // Se llama cuando el jugador recolecta el fruto maduro.
    // ----------------------------------------------------------
    limpiar() {
        this.semilla = null;
        this.timestampPlantado = null;
        this.madura = false;
        this.fase = 0;
    }
}