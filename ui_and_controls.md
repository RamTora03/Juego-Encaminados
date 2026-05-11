## UI y controles

HTML: elementos principales (IDs usados en `script.js`):
- `gameCanvas` — canvas principal
- `menuScreen`, `introScreen`, `endScreen` — overlays
- `hud`, `interactionPrompt`
- `casePanel`, `caseMeta`, `caseText`, `opt1`, `opt2`
- `metroValue`, `metroBar`, `angerValue`, `angerBar`, `coopValue`, `timerValue`, `lineState`, `stressValue`, `healthValue`, `priceValue`
- `playBtn`, `exitBtn`, `nextIntroBtn`, `restartBtn`

Controles de teclado (normalizados):
- Movimiento de selección: `ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown` (o `A`/`D`).
- `E`: interactuar / entrar a estación / abrir caso / dialogo
- `1` / `2`: elegir opción A / B cuando el detalle de caso está visible
- `Q` / `Escape`: salir de la estación

Comportamiento UI relevante:
- `hud` se muestra durante la partida y contiene métricas y barras.
- `casePanel` muestra detalle cuando se entra a la estación correcta y el caso está revelado.
- Mensajes se acumulan en `state.messageLog` y se muestran en la parte inferior del UI.

Para prototipar localmente: abrir `index.html` en un navegador moderno (recomendado: Chrome/Edge/Firefox). Para audio, al hacer click en `playBtn` se inicializa `AudioContext`.