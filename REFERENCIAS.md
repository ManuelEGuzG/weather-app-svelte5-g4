# Referencias bibliográficas

Fuentes consultadas para la implementación de esta aplicación. Mínimo 8 fuentes, de las cuales al menos 3 son documentación oficial, según los requisitos del entregable.

---

## Documentación oficial (6)

### 1. Svelte — Getting Started
**URL:** https://svelte.dev/docs/svelte/getting-started
**Tipo:** Documentación oficial
**Uso:** Guía inicial para crear el proyecto con la nueva CLI `npx sv create` y entender la estructura base de un proyecto Svelte 5 con Vite.

### 2. Svelte — Runes (`$state`, `$derived`, `$effect`, `$props`)
**URL:** https://svelte.dev/docs/svelte/what-are-runes
**Tipo:** Documentación oficial
**Uso:** Comprensión y aplicación de las runes de Svelte 5, que reemplazan al sistema reactivo de Svelte 4 (`let`, `$:`, `export let`). Sección crítica usada en `weather.svelte.js` y en todos los componentes.

### 3. Svelte — Component fundamentals (script, markup, style)
**URL:** https://svelte.dev/docs/svelte/svelte-files
**Tipo:** Documentación oficial
**Uso:** Sintaxis de archivos `.svelte`, bloques `{#if}`, `{#each}`, binding (`bind:value`), eventos (`onclick`, `onsubmit`).

### 4. OpenWeatherMap — Current Weather Data API
**URL:** https://openweathermap.org/current
**Tipo:** Documentación oficial
**Uso:** Especificación del endpoint `api.openweathermap.org/data/2.5/weather`, parámetros (`q`, `appid`, `units`, `lang`), formato de respuesta JSON, códigos HTTP de error.

### 5. Vite — Variables de entorno y modos
**URL:** https://vitejs.dev/guide/env-and-mode
**Tipo:** Documentación oficial
**Uso:** Manejo seguro de la API Key mediante variables de entorno con prefijo `VITE_` y archivos `.env`.

### 6. Vercel — Deploying a Vite project
**URL:** https://vercel.com/docs/frameworks/vite
**Tipo:** Documentación oficial
**Uso:** Guía para desplegar un proyecto Vite (SPA) en Vercel, configuración de variables de entorno en producción y reglas de rewrite para enrutado del lado del cliente (`vercel.json`).

---

## Artículos de blog (3)

### 7. Web Reactiva — "Svelte 5 vs React 19, ¿cuál es la mejor opción?"
**URL:** https://www.webreactiva.com/blog/svelte-vs-react
**Tipo:** Artículo de blog (español)
**Uso:** Comparación entre el modelo de Virtual DOM de React y la estrategia de compilación de Svelte, que genera JavaScript optimizado en tiempo de build en lugar de incluir un runtime en el navegador. Respalda la sección de "Pros y contras" del README sobre rendimiento y diferencias de ecosistema entre ambos frameworks.

### 8. Rootstack — "Svelte vs React: Pros, contras y casos de uso"
**URL:** https://rootstack.com/es/blog/svelte-vs-react-pros-contras-y-casos-de-uso
**Tipo:** Artículo de blog (español)
**Uso:** Listado de ventajas de Svelte frente a React: mejor rendimiento al no depender del Virtual DOM, sintaxis más sencilla con menos boilerplate, menos dependencias y aplicaciones más livianas. Usado como respaldo adicional para justificar los pros y contras documentados en el README.

### 9. Econox Digital — "Dominando la Reactividad con Runes en Svelte 5"
**URL:** https://www.econox.digital/article/svelte-5-runes
**Tipo:** Artículo de blog (español)
**Uso:** Explicación de las runes como funciones especiales que el compilador de Svelte interpreta para gestionar estado y reactividad, identificadas con el prefijo $ (como $state, $derived, $effect). Apoyo conceptual en español para comprender `$state`, `$derived` y `$effect` antes de implementarlos en el store del proyecto.

---

## Videos (2)

### 10. Bluuweb (YouTube) — Curso de Svelte
**URL:** https://www.youtube.com/watch?v=77oMfyugtCk&list=PLPl81lqbj-4J6xcUu7SW4f3Y1ou8X8rRY
**Tipo:** Video / canal de YouTube (español)
**Uso:** Video del canal [Bluuweb](https://www.youtube.com/@bluuweb) usado como referencia complementaria en español para reforzar la sintaxis y los conceptos base de Svelte antes de aplicarlos con runes en Svelte 5.

### 11. Svelte Society — "Svelte 5 Runes - How to talk to the compiler ft Rich Harris"
**URL:** https://www.youtube.com/watch?v=_SpO5T96AYY
**Tipo:** Video / canal oficial de la comunidad Svelte (YouTube)
**Uso:** Charla presentada por Rich Harris, creador de Svelte, explicando el propósito y funcionamiento de las runes como mecanismo para comunicarse con el compilador. Apoyo visual para entender cuándo usar `$state`, `$derived` y `$effect`.

---

## Resumen

| Categoría | Cantidad |
|-----------|----------|
| Documentación oficial | 6 |
| Artículos de blog | 3 |
| Videos | 2 |
| **Total** | **11** |

Se cumple el mínimo requerido (8 fuentes, 3+ de documentación oficial).