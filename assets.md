## Assets referenciados

Imágenes (cargadas por `script.js`):
- trabajador_metro.png
- estudiante_universidad.png
- universidad.png
- logo_metro.png
- mapa.png
- ghost_front.png o ghost-front.png (carga tentativa entre ambos)

Notas:
- `networkMap` usa `mapa.png` y captura error para mostrar mensaje.
- Asegúrate de que los archivos estén en el mismo directorio que `index.html` o ajustar rutas.

Audio:
- No hay archivos de audio externos; el juego usa WebAudio (`AudioContext`) para tonos y ambiente.

Si falta algún asset, `script.js` contiene manejadores `.onerror` que empujan mensajes al `messageLog` para diagnóstico.