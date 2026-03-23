// Clase Parcela

class Parcela {

    constructor() {
        this.semilla = null;            // objeto Semilla o null si esta vacia
        this.timestampPlantado = null;  // Date.now() del momento en que se planto
        this.madura = false;
        this.fase = 0;                  // 0=vacia, 1=recien plantada, 2=creciendo, 3=madura
    }

    estaVacia() {
        return this.semilla === null;
    }

    plantar(semilla) {
        this.semilla = semilla;
        this.timestampPlantado = Date.now();
        this.madura = false;
        this.fase = 1;
    }

    actualizar() {
        if (this.semilla === null || this.madura) return;

        let segundosTranscurridos = (Date.now() - this.timestampPlantado) / 1000;
        let total = this.semilla.segundosMaduracion;

        // Dividimos el tiempo total en 3 tramos iguales
        if (segundosTranscurridos >= total) {
            this.madura = true;
            this.fase = 3;
        } else if (segundosTranscurridos >= total * (1.5 / 3)) {
            this.fase = 2;
        } else {
            this.fase = 1;
        }
    }

    // Devuelve la imagen que corresponde a la fase actual
    getImagenActual() {
        if (this.semilla === null) return "";
        // Las imagenes estan en el array: indice 0=fase1, 1=fase2, 2=fase3
        let indice = this.fase - 1;
        if (indice < 0) indice = 0;
        if (indice > 2) indice = 2;
        return this.semilla.imagenes[indice];
    }

    segundosRestantes() {
        if (this.semilla === null || this.madura) {
            return 0;
        }
        let transcurrido = (Date.now() - this.timestampPlantado) / 1000;
        let restante = this.semilla.segundosMaduracion - transcurrido;
        return Math.max(0, Math.ceil(restante));
    }

    limpiar() {
        this.semilla = null;
        this.timestampPlantado = null;
        this.madura = false;
        this.fase = 0;
    }
}