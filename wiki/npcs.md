## Personajes / NPCs

Esta página lista los NPCs definidos en `script.js` y su comportamiento.

### NPCs de estación (`stationNpcs`)

- `npc_student`
  - Label: Estudiante
  - Posición: x: 240, y: 316, w: 22, h: 34
  - Caso asociado: "Una estudiante no tiene saldo suficiente."
    - Opción A: "Dejarla pasar" → efecto: `publicAnger -6`, `metroSystem.stress +5`
    - Opción B: "Negar acceso" → efecto: `publicAnger +10`, `metroSystem.unitsHealth +2`

- `npc_woman`
  - Label: Señora
  - Posición: x: 470, y: 316, w: 22, h: 34
  - Caso asociado: "Una señora pide que el tren espere."
    - Opción A: "Esperar" → `publicAnger -5`, `metroSystem.stress +6`
    - Opción B: "Seguir" → `publicAnger +8`, `functionBias +4`

- `npc_police`
  - Label: Policía
  - Posición: x: 720, y: 316, w: 22, h: 34
  - Caso asociado: "Un policía dice que cierres la estación."
    - Opción A: "Cerrar" → `functionBias -10`, `publicAnger +5`
    - Opción B: "Ignorar" → `metroSystem.stress +10`, `publicAnger +8`

### NPCs del evento mochila (`mochilaEventNpcs`)

- `npc_trabajador_mochila`
  - Label: Trabajador
  - Posición: x: 468, y: 197, w: 104, h: 168
  - Diálogo: "Esa mochila no debería estar ahí… va a hacer que las personas se quejen."
  - Sprite: `trabajador_metro.png` (si está presente se dibuja en la estación)

- `npc_estudiante_mochila`
  - Label: Estudiante
  - Posición: x: 642, y: 197, w: 104, h: 168
  - Diálogo: "¿De quién es eso…? Mejor me alejo."
  - Sprite: `estudiante_universidad.png`

### NPCs narrativos / de lore

- `rogelio_vargas`
  - Nombre: Rogelio Vargas
  - Edad: 46 años
  - Ocupación: Supervisor de andenes
  - Historia: Lleva más de veinte años trabajando dentro del metro. Conoce cuándo un tren viene demasiado rápido, cuándo unas puertas fallarán y cuándo una estación está a punto de colapsar emocionalmente.
  - Relación con Alejo: Fue una de las últimas personas que vio a Alejo antes del incidente en Universidad. A veces siente que la silueta azul de Alejo sigue caminando por los andenes.
  - Diálogo principal: "La gente cree que el metro solo transporta personas… pero también carga todo lo que sienten."

- `mariana_salcedo`
  - Nombre: Mariana Salcedo
  - Edad: 20 años
  - Carrera: Diseño y Comunicación Visual
  - Historia: Vive en la periferia y pasa aproximadamente cuatro horas diarias en transporte público. Hace tareas, duerme y escucha música dentro del metro; siente que todos están igual de cansados.
  - Relación con Alejo: Coincidía frecuentemente con Alejo en la estación Universidad, aunque nunca hablaron realmente. Después del incidente empezó a reconocer su figura fantasmal cerca de los andenes.
  - Diálogo principal: "A veces siento que todos aquí estamos sobreviviendo, no viviendo."

- `mochila_abandonada`
  - Estado: Objeto de incidente
  - Descripción: Una mochila oscura aparece sola cerca del borde del andén. Está desgastada, tiene llaveros escolares y un cuaderno parcialmente visible.
  - Historia: Pertenecía a un estudiante que la olvidó al salir corriendo. Con el tiempo se convirtió en símbolo del miedo colectivo; la gente proyecta ansiedad sobre ella.
  - Efecto dentro del juego: Aumenta la tensión, vuelve inestable el flujo y provoca reacciones agresivas o nerviosas si permanece mucho tiempo.
  - Registro del sistema: "Objeto sin identificar detectado en zona amarilla. Usuarios muestran alteraciones emocionales."

### Comportamiento y navegación
- Acercarse a un NPC (distancia < ~56) permite tomar su caso (tecla `E`), que abre `state.currentCase`.
- Los NPCs empujan entradas al `messageLog` y `recentCases` cuando se activan.
- Para el evento de mochila la interacción abre un diálogo que se puede cerrar con `E`.

Revisa `script.js` para ver implementaciones concretas (funciones: `nearestNpc`, `openNpcCase`, `handleMochilaInteraction`).