// ============================================================
// CLASE: Terreno
// PROPOSITO: Gestiona el conjunto de todas las parcelas
// del terreno de cultivo del jugador.
// Se crea con un numero de parcelas que el jugador elige
// en el formulario de configuracion (4, 6 o 9 parcelas).
// ============================================================

class Terreno {

    // ----------------------------------------------------------
    // CONSTRUCTOR
    // PARAMETROS:
    //   - numParcelas: cantidad de parcelas del terreno (4, 6 o 9)
    // Crea el array de parcelas vacias usando un bucle for.
    // ----------------------------------------------------------
    constructor(numParcelas) {
        this.parcelas = []; // Array que contendra todos los objetos Parcela

        // Creamos tantas parcelas vacias como haya indicado el jugador
        for (let i = 0; i < numParcelas; i++) {
            this.parcelas.push(new Parcela()); // Cada Parcela empieza vacia
        }
    }

    // ----------------------------------------------------------
    // METODO: actualizar
    // PROPOSITO: Llama al metodo actualizar() de cada parcela
    // para que comprueben si su planta ha cambiado de fase o madurado.
    // Este metodo se ejecuta cada segundo desde el setInterval
    // del bucle de juego en main.js.
    // ----------------------------------------------------------
    actualizar() {
        // Recorremos todas las parcelas con un bucle for
        for (let i = 0; i < this.parcelas.length; i++) {
            this.parcelas[i].actualizar(); // Cada parcela se actualiza a si misma
        }
    }
}