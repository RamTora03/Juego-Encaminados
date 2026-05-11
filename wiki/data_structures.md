## Estructuras de datos principales

### `state` (objeto global)
- `gameState`: "menu" | "intro" | "game" | "ending" | "exit"
- `introIndex`, `timer`, `worldTime`, `caseCooldown`
- `currentCase`, `currentCaseVisible`, `currentCaseSource`
- `functionBias` (modificador de funcionamiento)
- `publicAnger`, `metroFunction`
- `metroSystem`: { `stress`, `unitsHealth`, `price` }
- `recentCases`, `messageLog`
- `lastEventId`, `lastEventStation`, `sameStationStreak`
- `player`: { `x`, `y`, `w`, `h`, `speed`, `vx`, `floatPhase` }
- `currentStation`, `selectedStationIndex`, `keys`, `stationDialog`

### `stations` (array)
Cada elemento: `{ name, nodeX, nodeY, pointX, pointY, labelX, labelY, line }`.
Usado para dibujar el mapa, navegar y detectar estaciones objetivo.

### `eventCatalog` (array)
Eventos de la escena. Esquema por evento:
- `id`, `estacion`, `titulo`, `descripcion`
- `opcionA`, `opcionB`
- `cambioMolestia`: { A: number, B: number }
- `cambioFuncionamiento`: { A: number, B: number }

### `eventCommsById` (map)
Mensajes de comunicación asociados por `id` de evento — se usan para llenar `messageLog`.

### `globalCases` (array)
Casos no asociados a estación con `tag`, `priority`, `text`, `options` (cada opción con `text` y `effect()` que muta `state`).

### NPCs y nodos especiales
- `stationNpcs`: NPCs que pueden abrir un caso con estructura `{ id, x, y, w, h, label, case }`.
- `mochilaEventNpcs`: NPCs específicos para el evento de mochila en `UNIVERSIDAD`.
- `universidadStationNodes`: nodos visuales (ej. `Mochila` con coords y visibilidad).

### Recursos externos referenciados
Imágenes: `trabajador_metro.png`, `estudiante_universidad.png`, `universidad.png`, `logo_metro.png`, `mapa.png`, `ghost_front.png`/`ghost-front.png`.
Audio: generadores via WebAudio (`beep`, `ambience`).

Para ver implementaciones y ejemplos, revisar `script.js`.