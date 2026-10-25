# HIGHFLY GENESIS — G1/G2 Source-of-Truth

Fecha: 2026-10-25. Se trata de un preview validado por GitHub Actions, no una certificación visual en el Samsung.

## Verificado CI
- Ejecuta el terrainHeight auténtico de World of ClaudeCraft (`levy-street/world-of-claudecraft@9b57e49c9676d75962700f828cc00a50a9a988b5`) y muestrea TODO el mundo a paso 4; exporta 15 zonas, 103 caminos, el terreno, metadatos de estructuras y waterLevel.
- Copia únicamente GLB presentes en allowlist de KayKit (personajes, pack medieval hexagonal) y Quaternius (criatura lobo, árboles/props), ambientCG CC0; los recursos no incluidos quedan fuera.
- Compila una página adicional `/editor.html` desde el código MIT ORIGINAL de `src/editor/main.ts` y `src/editor/app.ts` del donante, arrancando en modo 2D sin heredarse NPC/camps, con guardados HIGHFLY; el playtest se interpreta desde la aplicación HIGHFLY sin importar clases.
- El juego usa un renderizador Three.js independiente, con terreno muestreado desde el original, edificios/puerto KayKit por coordenadas de `BUILTIN_WORLD`, modelos GLB de KayKit y Quaternius, joystick y combate básico.

## Pendiente y advertencias
- NO es todavía el renderizador visual completo de World of ClaudeCraft: iluminación, terreno PBR, flora/animaciones y física compleja requieren integraciones adicionales.
- El editor 3D original se conserva accesible desde el interruptor, pero su dependencia del renderer/Sim y su carga de assets todavía NO están validadas en móvil. El editor 2D es el punto de entrada seguro.
- La comprobación en un navegador Android, los GLB runtime, el desempeño GPU, navegación por zonas extremas y la persistencia editor->juego requieren prueba manual.
- Se conserva el guardado del prototipo y NO se modifican UNIFIED/CLEAN/REBORN.

## Licencias
Código upstream MIT (LICENSE donor); media distinta de código se filtra estrictamente según CREDITS.md del commit fijado. No permitir audio CC BY-NC, arte reservado, Tripo pagado ni imágenes de marcas propias del donante.

## Pages
Juego: https://drakentzy07.github.io/HIGHFLY-GENESIS/
Editor fuente: https://drakentzy07.github.io/HIGHFLY-GENESIS/editor.html
