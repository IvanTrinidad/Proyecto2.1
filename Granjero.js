// Clase Granjero

class Granjero {

    constructor(nombre, nombreGranja, dinero) {
        this.nombre = nombre;
        this.nombreGranja = nombreGranja;
        this.dinero = dinero;
        this.inventario = []; // array de objetos { nombre, cantidad }
    }

    agregarInventario(nombre, cantidad) {
        let item = this.inventario.find(function(i) {
            return i.nombre === nombre;
        });

        if (item) {
            item.cantidad += cantidad;
        } else {
            this.inventario.push({ nombre: nombre, cantidad: cantidad });
        }
    }

    quitarInventario(nombre) {
        let item = this.inventario.find(function(i) {
            return i.nombre === nombre;
        });

        if (!item || item.cantidad <= 0) {
            return false;
        }

        item.cantidad--;

        if (item.cantidad === 0) {
            this.inventario = this.inventario.filter(function(i) {
                return i.nombre !== nombre;
            });
        }

        return true;
    }

    tieneSemilla(nombre) {
        return this.inventario.some(function(i) {
            return i.nombre === nombre && i.cantidad > 0;
        });
    }
}
