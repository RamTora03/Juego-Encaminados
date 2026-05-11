## Dirección estética de la wiki

Esta wiki debe sentirse como una memoria operativa del Metro: un sistema viejo, vivo, medio roto y aun así funcional.

### Sensación general

- Como una pantalla del metro funcionando a medias.
- Como archivos internos mezclados con relatos urbanos.
- Como una wiki vieja, técnica y ligeramente inquietante.

### Inspiraciones

- Wikis viejas de videojuegos.
- Interfaces de Windows XP / 7.
- Foros urbanos y terminales de vigilancia.
- CRT monitors, señalética del Metro, Lain y Scott Pilgrim.

### Paleta de color

- Inspiración directa: estaciones del metro, luces fluorescentes, pantallas CRT, señales de advertencia, ciudad nocturna y tecnología vieja.
- Base oscura: negro y gris profundo con degradados fríos.
- Acentos: verde monitor CRT, azul eléctrico tenue, blanco sucio y rojo alerta.
- La UI no debe verse limpia: debe sentirse usada, saturada y un poco inestable.
- Sensación objetivo: una pantalla del metro funcionando a medias, con iluminación de pasillo y aviso técnico.

### Textura visual

- Glitch leve, discreto y atmosférico.
- Ruido digital, scanlines y píxeles visibles en elementos puntuales.
- Desenfoque suave, compresión tipo internet viejo e imágenes ligeramente lavadas.
- Archivos corruptos, texto tachado y módulos que parezcan incompletos o clasificados.

### Tipografía

- Títulos: una fuente tipo señalética o terminal, por ejemplo VT323, Pixelify Sans o Press Start 2P.
- Texto normal: una mono limpia y legible como IBM Plex Mono, Courier New o Inter.
- Glitches / errores: una variante más áspera o condensada para mensajes de fallo, advertencias o páginas rotas.
- La jerarquía debe parecer de sistema técnico, no de blog moderno.

### Organización de la wiki

- Menú lateral fijo o barra tipo wiki clásica, con apariencia de sistema operativo viejo.
- Secciones pensadas como módulos: estaciones, incidentes, usuarios, archivos perdidos, reportes, sistema y Alejo.
- Cada página debe sentirse como una ficha técnica, reporte o mapa operativo.
- Las páginas deben organizarse como base de datos urbana: compactas, escaneables y jerárquicas.

### Diseño de estaciones

- Cada estación debe leerse como un reporte del sistema o una tarjeta de estado.
- Incluir nivel de saturación, estado emocional, incidentes activos y flujo.
- Mostrar la estación como si fuera una ficha técnica, mapa operativo o alerta del sistema.
- El contenido debe reforzar la idea de que el sistema responde al estado humano.

### Interfaz y composición

- Menú lateral: compacto, con bordes duros, resaltado por la sección activa y sensación de panel técnico.
- Páginas: encabezado claro, módulos apilados, bloques escaneables y jerarquía tipo base de datos.
- Estaciones, incidentes y personajes: tarjetas o fichas con títulos, estado, descripción y datos rápidos.
- Ventanas: aspecto de sistema operativo viejo, con bordes visibles, sombras suaves y paneles divididos.
- Botones: rectangulares o levemente redondeados, con hover discreto, sin estética demasiado moderna.
- Módulos y tarjetas: deben parecer registros administrativos del metro, no cards genéricas de web contemporánea.

### Detalles que suman mucho

- Glitches pequeños, errores visuales y textos tachados.
- Audios rotos, mensajes automáticos, imágenes corruptas y páginas incompletas.
- Páginas ocultas que parezcan eliminadas, clasificadas o fuera de servicio.
- Alertas dinámicas, luces parpadeantes y animaciones sutiles que den la sensación de sistema vivo.

### Referencias visuales

- Interfaces retro de internet y terminales antiguas.
- Señalética del metro CDMX.
- Scott Pilgrim para energía gráfica puntual.
- Serial Experiments Lain para atmósfera técnica y extrañeza.
- Arcane solo como referencia de atmósfera urbana.
- Videojuegos indie pixel art y monitores de vigilancia.

### Frase guía

> ¿Esto parece parte de un sistema urbano cansado y vivo?

Si la respuesta es sí, encaja con Encaminados.

## Resumen del proyecto

"Encaminados" es una simulación/ficción interactiva donde el jugador toma decisiones como operador del Metro. El núcleo está en `script.js` y usa un canvas para renderizado y una UI HTML para menús y paneles.

- Plataforma: navegador (HTML5 + Canvas + JavaScript).
- Archivos clave: `index.html`, `script.js`.
- Objetivo jugable: gestionar la operación (funcionamiento) y la molestia pública durante una jornada (300s en el juego).

Mecánicas principales:
- Casos (eventos) aparecen y deben resolverse con opción A o B.
- Estadísticas: `metroFunction`, `publicAnger`, `metroSystem` (stress, unitsHealth, price).
- Navegación entre estaciones y posibilidad de entrar a la estación `UNIVERSIDAD` para escenas específicas.