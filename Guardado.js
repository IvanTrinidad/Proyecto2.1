// Clase Guardado
// Usa localStorage para guardar y cargar la partida

class Guardado {

    static guardar(granjero, terreno, herramientas) {
        let datos = {
            granjero: {
                nombre: granjero.nombre,
                nombreGranja: granjero.nombreGranja,
                dinero: granjero.dinero,
                inventario: granjero.inventario
            },
            herramientas: herramientas.map(function(h) {
                return { nombre: h.nombre, descripcion: h.descripcion, nivel: h.nivel };
            }),
            parcelas: terreno.parcelas.map(function(p) {
                return {
                    semillaNombre: p.semilla ? p.semilla.nombre : null,
                    timestampPlantado: p.timestampPlantado,
                    madura: p.madura,
                    fase: p.fase
                };
            })
        };

        localStorage.setItem("plantimales", JSON.stringify(datos));
    }

    static cargar() {
        let raw = localStorage.getItem("plantimales");
        if (raw === null) {
            return null;
        }
        return JSON.parse(raw);
    }

    static existe() {
        return localStorage.getItem("plantimales") !== null;
    }

    static borrar() {
        localStorage.removeItem("plantimales");
    }
}