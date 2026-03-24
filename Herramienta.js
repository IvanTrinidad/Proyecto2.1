// ============================================================
// CLASE: Herramienta
// PROPOSITO: Representa una herramienta del granjero.
// En la Fase 1 hay tres herramientas fijas (Azada, Regadera
// y Hoz) que siempre empiezan en nivel 1.
// Las mejoras de herramientas se implementaran en la Fase 2.
// ============================================================

class Herramienta {

    // ----------------------------------------------------------
    // CONSTRUCTOR
    // Recibe el nombre y la descripcion de la herramienta.
    // El nivel siempre empieza en 1 (sin mejoras en Fase 1).
    // ----------------------------------------------------------
    constructor(nombre, descripcion) {
        this.nombre = nombre;           // Nombre de la herramienta (ej: "Azada")
        this.descripcion = descripcion; // Texto explicativo de para que sirve
        this.nivel = 1;                 // Nivel inicial. En Fase 2 se podra mejorar con dinero
    }
}