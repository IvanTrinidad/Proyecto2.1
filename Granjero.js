// ============================================================
// CLASE: Granjero
// PROPOSITO: Representa al jugador de la partida.
// Almacena su nombre, el nombre de su granja, el dinero que
// tiene y el inventario de semillas que ha recogido.
// ============================================================
 
class Granjero {
 
    // ----------------------------------------------------------
    // CONSTRUCTOR
    // Se ejecuta automaticamente al hacer: new Granjero(...)
    // Recibe los datos iniciales del formulario de configuracion
    // y crea los atributos del objeto con la palabra clave "this"
    // ----------------------------------------------------------
    constructor(nombre, nombreGranja, dinero) {
        this.nombre = nombre;           // Nombre del granjero (ej: "Ivan")
        this.nombreGranja = nombreGranja; // Nombre de la granja (ej: "Granja El Sol")
        this.dinero = dinero;           // Dinero inicial segun la dificultad elegida
        this.inventario = [];           // Array vacio que guardara las semillas del jugador
                                        // Cada elemento tiene la forma: { nombre, cantidad }
        this.cultivos = [];             // Array de cultivos recolectados listos para vender
                                        // Cada elemento tiene la forma: { nombre, cantidad }
    }
 
    // ----------------------------------------------------------
    // METODO: agregarInventario
    // PROPOSITO: Aniade semillas al inventario del granjero.
    // Si ya existe esa semilla, aumenta la cantidad.
    // Si no existe, crea una nueva entrada en el array.
    // PARAMETROS:
    //   - nombre: nombre de la semilla (ej: "CerdiPlanta")
    //   - cantidad: cuantas semillas se anaden
    // ----------------------------------------------------------
    agregarInventario(nombre, cantidad) {
 
        // Buscamos en el inventario si ya tenemos esa semilla
        // find() recorre el array y devuelve el primer elemento que cumpla la condicion
        let item = this.inventario.find(function(i) {
            return i.nombre === nombre;
        });
 
        if (item) {
            // Si ya existe esa semilla, solo sumamos la cantidad
            item.cantidad += cantidad;
        } else {
            // Si no existe, creamos un nuevo objeto y lo metemos al final del array
            this.inventario.push({ nombre: nombre, cantidad: cantidad });
        }
    }
 
    // ----------------------------------------------------------
    // METODO: quitarInventario
    // PROPOSITO: Resta una unidad de una semilla del inventario.
    // Se llama cuando el jugador planta una semilla en una parcela.
    // PARAMETROS:
    //   - nombre: nombre de la semilla a quitar
    // DEVUELVE:
    //   - true si se pudo quitar (habia stock)
    //   - false si no habia semillas de ese tipo
    // ----------------------------------------------------------
    quitarInventario(nombre) {
 
        // Buscamos la semilla en el inventario
        let item = this.inventario.find(function(i) {
            return i.nombre === nombre;
        });
 
        // Si no se encontro o la cantidad es 0, devolvemos false
        if (!item || item.cantidad <= 0) {
            return false;
        }
 
        // Restamos una unidad
        item.cantidad--;
 
        // Si la cantidad llega a 0, eliminamos el elemento del array
        // filter() devuelve un nuevo array SIN el elemento que cumple la condicion
        if (item.cantidad === 0) {
            this.inventario = this.inventario.filter(function(i) {
                return i.nombre !== nombre;
            });
        }
 
        return true; // Se quito correctamente
    }
 
    // ----------------------------------------------------------
    // METODO: tieneSemilla
    // PROPOSITO: Comprueba si el granjero tiene al menos una
    // semilla de un tipo concreto en el inventario.
    // PARAMETROS:
    //   - nombre: nombre de la semilla a buscar
    // DEVUELVE: true o false
    // ----------------------------------------------------------
    tieneSemilla(nombre) {
        // some() devuelve true si al menos UN elemento cumple la condicion
        return this.inventario.some(function(i) {
            return i.nombre === nombre && i.cantidad > 0;
        });
    }

    // ----------------------------------------------------------
    // METODO: agregarCultivo
    // PROPOSITO: Aniade cultivos recolectados al almacen de venta.
    // Funciona igual que agregarInventario pero sobre this.cultivos.
    // ----------------------------------------------------------
    agregarCultivo(nombre, cantidad) {
        let item = this.cultivos.find(function(i) { return i.nombre === nombre; });
        if (item) {
            item.cantidad += cantidad;
        } else {
            this.cultivos.push({ nombre: nombre, cantidad: cantidad });
        }
    }

    // ----------------------------------------------------------
    // METODO: quitarCultivo
    // PROPOSITO: Resta unidades de un cultivo al venderlo.
    // DEVUELVE: true si habia stock, false si no
    // ----------------------------------------------------------
    quitarCultivo(nombre, cantidad) {
        let item = this.cultivos.find(function(i) { return i.nombre === nombre; });
        if (!item || item.cantidad < cantidad) return false;
        item.cantidad -= cantidad;
        if (item.cantidad === 0) {
            this.cultivos = this.cultivos.filter(function(i) { return i.nombre !== nombre; });
        }
        return true;
    }
}