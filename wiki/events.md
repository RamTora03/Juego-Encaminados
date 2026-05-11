## Catálogo de eventos

El catálogo principal está en la variable `eventCatalog` dentro de `script.js`.

Cada entrada contiene: `id`, `estacion`, `titulo`, `descripcion`, `opcionA`, `opcionB`, `cambioMolestia`, `cambioFuncionamiento`.

Ejemplo (formato resumido):
- `universidad_1` — estación: `UNIVERSIDAD` — "Cientos de estudiantes entran al mismo tiempo..." — A: "Abrir acceso extra" | B: "Mantener flujo normal" — impactos: A: molestia -4, funcionamiento -5; B: molestia +6, funcionamiento +2.

Hay ~40+ eventos definidos para estaciones: `UNIVERSIDAD`, `CENTRO MÉDICO`, `PANTITLÁN`, `HIDALGO`, `ZAPATA`, `MIXCOAC`, etc.

Para ver la lista completa y las descripciones, abrir: `script.js` y buscar `const eventCatalog`.