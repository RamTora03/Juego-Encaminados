## Estaciones

Lista de estaciones definidas en `script.js` (variable `stations`). Cada entrada contiene coordenadas para dibujar en el mapa y la línea asociada.

- `INDIOS VERDES` — line: 3 — nodeX: 457, nodeY: 147 — labelX: 470, labelY: 147
- `HIDALGO` — line: 3 — nodeX: 457, nodeY: 187 — labelX: 470, labelY: 187
- `CENTRO MÉDICO` — line: "3-9" — nodeX: 457, nodeY: 237 — labelX: 470, labelY: 255
- `ZAPATA` — line: "3-12" — nodeX: 457, nodeY: 302 — labelX: 470, labelY: 320
- `VIVEROS DE COYOACÁN` — line: 3 — nodeX: 457, nodeY: 347 — labelX: 470, labelY: 347
- `UNIVERSIDAD` — line: 3 — nodeX: 457, nodeY: 390 — labelX: 470, labelY: 390
- `PANTITLÁN` — line: 9 — nodeX: 315, nodeY: 237 — labelX: 320, labelY: 255
- `CHILPANCINGO` — line: 9 — nodeX: 388, nodeY: 237 — labelX: 390, labelY: 255
- `TACUBAYA` — line: 9 — nodeX: 569, nodeY: 237 — labelX: 570, labelY: 255
- `MIXCOAC` — line: 12 — nodeX: 375, nodeY: 302 — labelX: 395, labelY: 320
- `ERMITA` — line: 12 — nodeX: 561, nodeY: 302 — labelX: 545, labelY: 320
- `TLÁHUAC` — line: 12 — nodeX: 657, nodeY: 302 — labelX: 640, labelY: 320

Uso:
- `navigateStations()` usa estas coordenadas para calcular navegación entre estaciones.
- `enterStation()` gestiona la lógica de entrar (actualmente `UNIVERSIDAD` tiene escena propia).

Puedes añadir descripciones por estación editando este archivo si quieres que la wiki tenga lore o notas de jugabilidad específicas.