# Referencias bibliográficas

Fuentes consultadas para la implementación de esta aplicación. Mínimo 8 fuentes, de las cuales al menos 3 son documentación oficial, según los requisitos del entregable.

---

## Documentación oficial (5)

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


---

## Videos y recursos complementarios (2)

### 9. Svelte Society — "Svelte 5 Runes Tutorial"
**URL:** https://www.youtube.com/@SvelteSociety
**Tipo:** Canal oficial de la comunidad Svelte (YouTube)
**Uso:** Comprensión visual del modelo mental de las runes y cuándo usar `$state` vs `$derived` vs `$effect`.

### 10. Vercel — Deploying a Vite project
**URL:** https://vercel.com/docs/frameworks/vite
**Tipo:** Documentación oficial de Vercel
**Uso:** Guía para desplegar un proyecto Vite (SPA) en Vercel, configuración de variables de entorno en producción y reglas de rewrite para enrutado del lado del cliente (`vercel.json`).

---

## Resumen

| Categoría | Cantidad |
|-----------|----------|
| Documentación oficial | 5 |
| Videos y recursos complementarios | 2 |
| **Total** | **10** |

Se cumple el mínimo requerido (8 fuentes, 3+ de documentación oficial).
