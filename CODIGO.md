# CODIGO.md — Anatomía técnica del proyecto

Documento de referencia con las partes del código que realmente hacen funcionar la aplicación: el flujo de datos, el estado reactivo y las decisiones técnicas no obvias. Para visión general del proyecto ver `README.md`.

## Stack y arranque

- **Svelte 5** + **Vite 5** (sin framework meta como SvelteKit — es una SPA pura de un solo archivo HTML).
- `src/main.js` monta la app con la nueva API de Svelte 5:
  ```js
  import { mount } from 'svelte';
  const app = mount(App, { target: document.getElementById('app') });
  ```
  Esto reemplaza el `new App({ target })` de Svelte 4. Es la única "raíz" de la aplicación.
- Variable de entorno obligatoria: `VITE_OPENWEATHER_API_KEY` (leída vía `import.meta.env`). Sin ella, cualquier llamada a la API lanza `WeatherApiError` con `kind: 'auth'`.

## Arquitectura general (flujo de datos)

```
SearchBar / SearchHistory  →  weatherStore (estado global)  →  App.svelte (orquesta UI)
        ↑                              ↓
   weatherApi.js (fetch + normalización)  →  OpenWeatherMap API
```

- **`src/lib/services/weatherApi.js`**: única capa que habla con la red. Todo lo demás consume datos ya normalizados.
- **`src/lib/stores/weather.svelte.js`**: único store global, singleton, dueño de todo el estado de negocio (clima actual, pronóstico, historial, loading, error).
- **`src/App.svelte`**: no tiene estado propio de negocio; solo lee el store y decide qué renderizar.
- Componentes (`SearchBar`, `WeatherCard`, `ForecastList`, `SearchHistory`, `LoadingSpinner`, `ErrorMessage`) son mayormente *dumb components* que reciben props y emiten callbacks (`onSelectCity`, `onSearchName`, `onSelect`, `onClear`).

Esta separación es la pieza de valor más importante: la lógica de negocio (qué buscar, cómo cachear, cómo manejar errores) vive 100% fuera de los componentes Svelte, en JS plano testeable.

## El store: `weather.svelte.js`

Es el corazón de la app. Puntos clave:

### Runes fuera de componentes
El archivo tiene extensión `.svelte.js` — esto es lo que habilita usar `$state`, `$derived` y `$effect` en un módulo JS normal (sin necesidad de ser un componente `.svelte`). Sin ese sufijo, el compilador de Svelte no procesaría las runes.

### Patrón singleton con getters
```js
function createWeatherStore() { /* ...estado... */
  return {
    get currentWeather() { return currentWeather; },
    ...
    searchByName, searchByCoords, clearHistory
  };
}
export const weatherStore = createWeatherStore();
```
Se expone el estado mediante **getters**, no como propiedades planas. Esto es necesario porque `$state` crea variables locales reactivas dentro de la función — exponerlas directamente perdería la reactividad fuera del closure; el getter reevalúa la señal cada vez que se accede.

### `$effect.root` para persistencia en localStorage
```js
$effect.root(() => {
  $effect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  });
});
```
Un `$effect` normal requiere un componente activo en el árbol. Como este store vive a nivel de módulo (fuera de cualquier componente), se necesita `$effect.root` para crear un contexto reactivo independiente que se mantenga vivo durante toda la vida de la app y sincronice automáticamente `history` con `localStorage` cada vez que cambia.

### Corrección de zona horaria (la parte matemática no obvia)
```js
function getLocalTime() {
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utcTime + (currentWeather.timezone * 1000));
}
```
`Date` en JS siempre se basa en la hora local del dispositivo del usuario. Para mostrar la hora real de la ciudad consultada (no la del usuario), el código:
1. Anula el offset del cliente sumando `getTimezoneOffset() * 60000` (lleva el reloj a UTC puro).
2. Suma el offset de la ciudad destino (`currentWeather.timezone`, en segundos, de ahí el `* 1000`).

Este mismo patrón se repite en `WeatherCard.svelte` para calcular `localTime`, `sunriseStr` y `sunsetStr`. Es la lógica más fácil de romper si se refactoriza sin entender el porqué.

### Orquestación de búsquedas (`runSearch`)
Todas las búsquedas (por nombre o por coordenadas) pasan por un único punto:
```js
async function runSearch(weatherFetcher) {
  loading = true; error = null;
  try {
    const data = await weatherFetcher();
    currentWeather = data;
    addToHistory(data);
    try { forecast = await fetchForecast(data.lat, data.lon); }
    catch { forecast = []; } // el pronóstico es "best effort", no bloquea
  } catch (err) {
    currentWeather = null; forecast = [];
    error = err instanceof WeatherApiError ? err.message : 'Ocurrió un error inesperado...';
  } finally { loading = false; }
}
```
Decisión de diseño clave: si falla el pronóstico de 5 días, **no** se considera un error global — solo se vacía `forecast`. El clima actual ya se mostró y es la prioridad. Esto evita que un fallo secundario tumbe toda la UI.

### Historial como pila LIFO con deduplicación
```js
function addToHistory(weather) {
  const entry = { city, country, lat, lon, id: `${lat.toFixed(2)}-${lon.toFixed(2)}` };
  const filtered = history.filter((item) => item.id !== entry.id);
  history = [entry, ...filtered].slice(0, MAX_HISTORY); // MAX_HISTORY = 5
}
```
El `id` se construye redondeando lat/lon a 2 decimales — evita duplicados cuando la misma ciudad se busca por nombre una vez y por coordenadas otra (resultarían en flotantes ligeramente distintos sin el `.toFixed(2)`).

## La capa de red: `weatherApi.js`

Tres endpoints gratuitos de OpenWeatherMap, todos pasando por `safeFetch`:

```js
async function safeFetch(url, signal) {
  try { response = await fetch(url, { signal }); }
  catch (err) {
    if (err.name === 'AbortError') throw err; // deja pasar el abort, no es un error real
    throw new WeatherApiError('No se pudo conectar...', 'network');
  }
  if (response.status === 401) throw new WeatherApiError('API Key inválida...', 'auth');
  if (response.status === 404) throw new WeatherApiError('Ciudad no encontrada.', 'not_found');
  if (!response.ok) throw new WeatherApiError(`Error inesperado (${response.status}).`, 'unknown');
  return response.json();
}
```
`WeatherApiError` tiene un campo `kind` que permite a quien consuma el error distinguir categorías (`not_found`, `network`, `auth`, `unknown`) sin parsear el mensaje. Es lo que permite mostrar mensajes en español específicos sin acoplar la UI a códigos HTTP.

### Normalización de datos (`normalizeWeatherData` / `normalizeForecast`)
La API cruda de OpenWeather tiene una forma incómoda (`main.temp`, `weather[0].description`, `sys.country`, etc.). Estas funciones la convierten a un objeto plano y estable (`{ city, temperature, feelsLike, windSpeed, iconUrl, lat, lon, timezone, ... }`) que es el único "contrato" que el resto de la app conoce. Si OpenWeather cambia su forma de respuesta, solo se toca este archivo.

### Reducción del pronóstico de 40 puntos a 5 días
La API de forecast devuelve 40 mediciones (cada 3h durante 5 días). `normalizeForecast` agrupa por día calendario (usando el `timezone` offset de la ciudad, no el del cliente) y se queda con el punto más cercano al mediodía local:
```js
const distanceToNoon = Math.abs(hour - 12);
if (!existing || distanceToNoon < existing.distanceToNoon) { byDay.set(dayKey, {...}); }
```
También descarta explícitamente el día de hoy (`day.dayKey !== todayKey`) porque el pronóstico debe mostrar "próximos 5 días", no incluir el día actual que ya se ve en `WeatherCard`.

### Cancelación de peticiones obsoletas (geocoding)
`searchCities(query, signal)` acepta un `AbortSignal` que viene del `SearchBar`. Esto es la otra mitad del patrón de debounce — ver siguiente sección.

## `SearchBar.svelte` — debounce + cancelación con `$effect`

```js
$effect(() => {
  const trimmed = query.trim();
  if (trimmed.length < 2) { suggestions = []; return; }

  loadingSuggestions = true;
  const controller = new AbortController();
  const timer = setTimeout(async () => {
    const results = await searchCities(trimmed, controller.signal);
    suggestions = results;
  }, 300);

  return () => { clearTimeout(timer); controller.abort(); }; // cleanup
});
```
Cada vez que `query` cambia, Svelte 5 ejecuta primero la función de **cleanup** devuelta por la ejecución anterior del efecto (cancela el timer pendiente y aborta el fetch en curso) antes de correr la nueva. Esto es lo que evita: (a) saturar la API con una petición por cada tecla, y (b) "race conditions" donde una respuesta vieja y lenta sobrescribe a una más nueva y rápida.

### Navegación por teclado accesible
`handleKeydown` implementa `ArrowUp`/`ArrowDown` (cíclico con `%`) y `Escape` sobre `highlightedIndex`, con atributos ARIA (`role="combobox"`, `aria-expanded`, `aria-activedescendant` vía `aria-controls`) para que el autocompletado sea operable sin mouse.

## `clickOutside.js` — acción Svelte personalizada

```js
export function clickOutside(node, callback) {
  function handleClick(event) {
    if (node && !node.contains(event.target) && !event.defaultPrevented) callback();
  }
  document.addEventListener('click', handleClick, true); // fase de captura
  return { destroy() { document.removeEventListener('click', handleClick, true); } };
}
```
Se usa como `use:clickOutside={handleClose}` en `SearchBar`. La fase de **captura** (`true` como tercer argumento) permite que un click dentro del propio nodo pueda llamar `event.preventDefault()` y evitar el cierre antes de que el listener global lo procese. El `destroy()` se invoca automáticamente al desmontar el elemento — es el mecanismo de Svelte para evitar memory leaks de listeners globales.

## `WeatherCard.svelte` — derivaciones reactivas (`$derived` / `$derived.by`)

- Reloj en vivo: un `$state(Date.now())` actualizado cada 60s vía `setInterval` dentro de un `$effect` (con cleanup de `clearInterval`).
- `$derived.by(() => ...)` se usa (en vez de `$derived(expr)`) cuando el cálculo necesita más de una expresión/sentencia — por ejemplo `cityDateObj`, `sunriseStr`, `sunsetStr`, que repiten la misma corrección de timezone descrita arriba pero a partir de fuentes distintas (`now`, `weather.sunrise`, `weather.sunset`).
- `degreesToCardinal(deg)` convierte grados de viento a punto cardinal (`N`, `NE`, `E`...) con `Math.round(((deg % 360) / 45)) % 8`.

## `App.svelte` — orquestación de la UI

```js
$effect(() => {
  if (!weatherStore.currentWeather && !weatherStore.error && !weatherStore.loading) {
    weatherStore.searchByName(DEFAULT_CITY); // 'San José, CR'
  }
});
```
Carga automáticamente una ciudad por defecto al iniciar, pero **solo si no hay ya un estado** (evita relanzar la búsqueda en cada re-render reactivo gracias a las tres guardas). El resto del componente es un `{#if}/{:else if}` simple que decide entre `LoadingSpinner`, `ErrorMessage` o `WeatherCard` + `ForecastList`, más `SearchHistory` condicionado a `weatherStore.hasHistory`.

## Resumen de por qué esto "tiene valor" como referencia

1. **Separación estricta de capas**: red (`weatherApi.js`) → estado (`weather.svelte.js`) → presentación (componentes). Cualquier cambio de proveedor de clima solo tocaría el primer archivo.
2. **Runes de Svelte 5 usadas en sus tres contextos**: dentro de componentes (`WeatherCard`, `SearchBar`), fuera de componentes con `.svelte.js` + `$effect.root` (el store), y como acción de bajo nivel (`clickOutside`).
3. **Manejo de fecha/hora correcto entre husos horarios**, replicado consistentemente en todos los puntos donde se necesita (store y `WeatherCard`).
4. **Gestión de concurrencia real**: debounce + `AbortController` para que el autocompletado no se sature ni muestre resultados obsoletos.
5. **Errores tipados (`WeatherApiError.kind`)** que permiten mensajes de usuario específicos sin acoplar la UI a detalles HTTP.
