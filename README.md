# HIGHFLY GENESIS — G1/G2 WORLD REAL

**Demo Android horizontal + editor original MIT en 2D**, independientes de versiones anteriores de HIGHFLY.

## Probar
- [Entrar al mundo (Pages)](https://drakentzy07.github.io/HIGHFLY-GENESIS/)
- [World Builder (editor real de ClaudeCraft adaptado a HIGHFLY)](https://drakentzy07.github.io/HIGHFLY-GENESIS/editor.html)

## Qué es real
Terreno de **las 15 zonas** y sus **103 caminos**, calculado desde el módulo original `world.ts` y `data.ts` (MIT) del donante fijo, junto a edificios históricos del pack KayKit Medieval Hexagon y modelos KayKit/Quaternius CC0. Editor original en entrada independiente con 2D offline, guardado local, herramientas de caminos/terreno/objetos y playtest vía sessionStorage adaptado.

## Qué falta
**No confundir el G1 real geográfico con la reproducción completa del motor visual original.** El motor gráfico y controlador actuales son HIGHFLY y las distancias/iluminación aún necesitan ajustar. El visor 3D del editor no está probado en Android; el catálogo se limita a GLB autorizados. Todo progreso de este proyecto está separado de UNIFIED/CLEAN/REBORN. Android pendiente de pruebas.

**Fuente MIT fija:** [world-of-claudecraft@9b57e49](https://github.com/levy-street/world-of-claudecraft/tree/9b57e49c9676d75962700f828cc00a50a9a988b5). 

**Créditos/licencias de medios:** [CREDITS.md](https://github.com/levy-street/world-of-claudecraft/blob/9b57e49c9676d75962700f828cc00a50a9a988b5/CREDITS.md).

## Build / publish
GitHub Actions descarga el código donante MIT en commit inmutable, instala pnpm 10.34.5, calcula la geografía original, copia solo modelos CC0 de lista, compila juego y editor en Vite, ejecuta tests y publica en Pages. Sin servidor de pago.
