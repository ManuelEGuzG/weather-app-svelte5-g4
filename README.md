# Weather App · Svelte 5 (G4)

Aplicación web del clima construida con **Svelte 5** que consume la API gratuita de [OpenWeatherMap](https://openweathermap.org/api). Proyecto académico del curso *Investigación Aplicada en Frameworks (IF-7102)* — Grupo G4.

🔗 **Demo en vivo:** _<inserta aquí la URL de Vercel cuando despliegues>_

📦 **Repositorio:** _<inserta aquí la URL de tu repo>_

---

## Tabla de contenidos

- [Características](#características)
- [Capturas de pantalla](#capturas-de-pantalla)
- [Stack tecnológico](#stack-tecnológico)
- [Conceptos clave de Svelte 5 usados](#conceptos-clave-de-svelte-5-usados)
- [Setup local](#setup-local)
- [Configuración de la API Key](#configuración-de-la-api-key)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Pros y contras de Svelte 5](#pros-y-contras-de-svelte-5)
- [Scripts disponibles](#scripts-disponibles)

---

## Características

Todas las funcionalidades requeridas por la rúbrica están implementadas:

- ✅ **Buscador de ciudad** con campo de texto y botón (también funciona al presionar Enter).
- ✅ **Datos del clima actual:** temperatura, descripción, humedad, velocidad del viento e icono oficial de OpenWeatherMap.
- ✅ **Historial de búsquedas:** muestra las últimas 5 ciudades buscadas como chips clicables.
- ✅ **Estado de carga:** spinner animado mientras la API responde.
- ✅ **Manejo de errores:** mensajes claros y diferenciados para ciudad no encontrada, falla de red o API Key inválida.
- ✅ **Persistencia con `localStorage`:** el historial sobrevive al recargar la página.
- ✅ **Ciudad por defecto** (San José, CR) visible al cargar la app.
- ✅ **Diseño responsivo:** funciona en escritorio y móvil.
- ✅ **Sin librerías de UI externas** — solo CSS puro.

---

## Capturas de pantalla

> _Agrega aquí 2-3 capturas:_
>
> 1. `screenshots/desktop.png` — vista de escritorio con un clima cargado.
> 2. `screenshots/mobile.png` — vista móvil.
> 3. `screenshots/error.png` — manejo de error de ciudad inexistente.

```markdown
![Desktop](./screenshots/desktop.png)
![Mobile](./screenshots/mobile.png)
```

---

## Stack tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Svelte | 5.x | Framework principal (modo runes activado) |
| Vite | 5.x | Bundler y servidor de desarrollo |
| OpenWeatherMap API | 2.5 | Fuente de datos meteorológicos |
| Vercel | — | Plataforma de despliegue |

---

## Conceptos clave de Svelte 5 usados

Svelte 5 introduce las **runes**, una nueva API explícita de reactividad. Este proyecto usa intencionalmente todas las runes principales para demostrar el dominio del framework:

### `$state` — Estado reactivo
Declara variables cuyos cambios disparan re-renders automáticos.

```js
let currentWeather = $state(null);
let loading = $state(false);
```

Usado en `src/lib/stores/weather.svelte.js` y `src/lib/components/SearchBar.svelte`.

### `$derived` — Valores computados
Calcula un valor a partir de otro estado reactivo. Se recalcula automáticamente cuando cambia su dependencia.

```js
const hasHistory = $derived(history.length > 0);
const fullName = $derived(weather.country ? `${weather.city}, ${weather.country}` : weather.city);
```

Usado en `weather.svelte.js` y `WeatherCard.svelte`.

### `$effect` y `$effect.root` — Efectos secundarios
Ejecuta código cuando cambia una dependencia reactiva. `$effect.root` permite usar efectos fuera del ciclo de vida de un componente.

```js
$effect.root(() => {
  $effect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  });
});
```

Persiste el historial en `localStorage` cada vez que cambia.

### `$props` — Recepción de props
Reemplaza al antiguo `export let prop` de Svelte 4. Permite destructuración y valores por defecto.

```js
let { onSearch, disabled = false } = $props();
```

Usado en todos los componentes hijos.

### Archivos `.svelte.js`
Permite usar runes **fuera** de un componente `.svelte`. Esto habilita stores reactivos sin necesidad de librerías externas como `svelte/store`.

### Bloques de control
Se usa la sintaxis idiomática de Svelte: `{#if}`, `{:else if}`, `{:else}`, `{/if}`, `{#each ... as ... (key)}`. Estos bloques son compilados a código JS imperativo eficiente.

### Nueva API de montaje
Svelte 5 reemplaza `new App({ target })` por `mount(App, { target })`. Ver `src/main.js`.

---

## Setup local

### Requisitos previos

- **Node.js 18+** (recomendado 20+) — [descargar](https://nodejs.org)
- **npm** (incluido con Node.js)
- **Git** — [descargar](https://git-scm.com)

### Pasos

```powershell
# 1. Clona el repositorio
git clone https://github.com/<TU-USUARIO>/weather-app-svelte5-g4.git
cd weather-app-svelte5-g4

# 2. Instala las dependencias
npm install

# 3. Configura tu API Key (ver siguiente sección)
copy .env.example .env
# Abre el archivo .env en tu editor y reemplaza el valor

# 4. Levanta el servidor de desarrollo
npm run dev
```

La app quedará disponible en `http://localhost:5173`.

---

## Configuración de la API Key

La API Key **no está incluida** en el repositorio por seguridad. Cada persona debe obtener la suya:

1. Crea una cuenta gratuita en https://openweathermap.org/users/sign_up
2. Inicia sesión y entra a **API keys** en tu perfil: https://home.openweathermap.org/api_keys
3. Copia tu key (puede tardar hasta 2 horas en activarse tras crear la cuenta).
4. En la raíz del proyecto, copia el archivo `.env.example` a `.env`:
   ```powershell
   copy .env.example .env
   ```
5. Edita `.env` y reemplaza el valor:
   ```
   VITE_OPENWEATHER_API_KEY=tu_api_key_real_aqui
   ```
6. Reinicia el servidor de desarrollo (`npm run dev`).

> ⚠️ **Importante:** el prefijo `VITE_` es obligatorio. Vite solo expone al cliente las variables con ese prefijo, por seguridad.

### Configuración en Vercel

En el dashboard de Vercel, ve a tu proyecto → **Settings** → **Environment Variables** y agrega:
- **Name:** `VITE_OPENWEATHER_API_KEY`
- **Value:** _tu API key_
- **Environments:** Production, Preview, Development

---

## Estructura del proyecto

```
weather-app-svelte5-g4/
├── public/
│   └── vite.svg                        # Favicon
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── SearchBar.svelte        # Input + botón de búsqueda
│   │   │   ├── WeatherCard.svelte      # Tarjeta con datos del clima
│   │   │   ├── SearchHistory.svelte    # Chips del historial
│   │   │   ├── LoadingSpinner.svelte   # Indicador de carga
│   │   │   └── ErrorMessage.svelte     # Mensaje de error
│   │   ├── stores/
│   │   │   └── weather.svelte.js       # Store global con runes
│   │   └── services/
│   │       └── weatherApi.js           # Cliente HTTP de OpenWeatherMap
│   ├── App.svelte                      # Componente raíz
│   ├── app.css                         # Estilos globales
│   └── main.js                         # Punto de entrada
├── .env.example                        # Plantilla de variables de entorno
├── .gitignore
├── index.html
├── package.json
├── svelte.config.js                    # Habilita modo runes
├── vite.config.js
├── vercel.json                         # Config de Vercel (SPA rewrites)
├── README.md
└── REFERENCIAS.md
```

### Decisiones arquitectónicas

- **Store separado del componente:** `weather.svelte.js` encapsula toda la lógica de estado y persistencia. Los componentes solo consumen sus getters.
- **Servicio HTTP separado:** `weatherApi.js` aísla los detalles de OpenWeatherMap. Si mañana cambiamos de API, solo editamos este archivo.
- **Normalización de datos:** la respuesta de la API se transforma a un objeto plano antes de tocar los componentes. Esto los desacopla del formato exacto del proveedor.
- **Errores tipados:** la clase `WeatherApiError` lleva un campo `kind` que permite al UI mostrar mensajes distintos para ciudad no encontrada vs. fallo de red vs. API Key inválida.

---

## Pros y contras de Svelte 5

### ✅ Pros

- **Reactividad explícita y granular** con runes: ya no hay que adivinar qué reactividad disparan los signos `$:` de Svelte 4.
- **Sin Virtual DOM:** el compilador genera código JS imperativo que actualiza el DOM directamente. Resultado: bundles más pequeños y rendimiento más rápido que React/Vue en muchos benchmarks.
- **Sintaxis cercana a HTML/JS estándar:** la curva de aprendizaje es suave para quien ya sabe JS.
- **Runes fuera de componentes** (archivos `.svelte.js`): permite stores reactivos sin librerías adicionales.
- **Bundle muy pequeño:** este proyecto pesa ~45 KB de JS sin gzip (~17 KB gzipped), incluyendo todo el framework.
- **CSS con scope automático** por componente — no hace falta CSS Modules ni styled-components.

### ⚠️ Contras

- **Ecosistema más pequeño** que React: menos librerías de terceros, menos preguntas en Stack Overflow.
- **Pocas vacantes laborales** comparado con React.
- **Cambio mayor entre Svelte 4 y Svelte 5:** las runes son una nueva forma de pensar; mucho contenido en internet aún muestra la sintaxis antigua.
- **Herramientas de debugging menos maduras** (Svelte DevTools existe pero no es tan robusto como React DevTools).
- **TypeScript con runes** todavía pulido (mejora cada release).

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo en `localhost:5173` con HMR. |
| `npm run build` | Genera build de producción en `dist/`. |
| `npm run preview` | Sirve localmente el build de producción para verificar antes de desplegar. |

---

## Autores

Grupo **G4** — Investigación Aplicada en Frameworks IF-7102

> _Agreguen aquí los nombres de los integrantes._

## Licencia

MIT — uso académico libre.
