# G1/G2 — integración del mundo y GLB originales

Esta rama no cambia la página pública hasta pasar CI y una revisión del runtime en celular.

## G1 REAL

`scripts/bake-original-world.mjs` importa **terrainHeight y BUILTIN_WORLD directamente del código MIT fijado** de World of ClaudeCraft (no fórmulas imitadas) y exporta los 15 biomas/zonas, carreteras, posiciones y alturas muestreadas de todo el mundo, a `public/genesis/`. El espacio de muestreo es de 4 unidades, coincidente con el mallado de vista previa en móvil. Incluye metadatos completos de estructuras; los elementos no autorizados se pueden excluir sin perder la topología.

## G1 editor original

El editor original en `src/editor/*` es un sistema entero y su vista tridimensional llama a Sim/Renderer con depedencias de clase. **No integrado ni funcional todavía** en esta rama. No presentar el editor sencillo de la demo como si fuese el original.

## G2 REAL

El pipeline copia únicamente la lista positiva de GLB CC0 indicada en `scripts/copy-cc0-assets.mjs`; genera hashes y licencias. Falta conectar el render con GLTFLoader, revisar esqueletos y clips y verificar la ejecución Android.

## Restricciones

No importar recursos restringidos, branded ni CC BY-NC. No introducir motores de servidor externo, servicios de ClaudeCraft ni borrar el código de prueba existente. El escenario actualmente en Pages es maqueta hasta que la rama esté integrada y validada.
