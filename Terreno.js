// Clase Terreno

class Terreno {

    constructor(numParcelas) {
        this.parcelas = [];

        for (let i = 0; i < numParcelas; i++) {
            this.parcelas.push(new Parcela());
        }
    }

    actualizar() {
        for (let i = 0; i < this.parcelas.length; i++) {
            this.parcelas[i].actualizar();
        }
    }
}
