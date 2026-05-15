/**
 * Store global de la aplicación usando RUNES de Svelte 5.
 *
 * Demuestra las características distintivas de Svelte 5:
 * - $state: estado reactivo (reemplaza writable de Svelte 4)
 * - $derived: valor computado a partir de otro estado reactivo
 * - $effect.root + $effect: efectos persistentes fuera de componentes
 *
 * El archivo .svelte.js habilita el uso de runes fuera de componentes .svelte.
 */

import {
  fetchWeatherByCity,
  fetchWeatherByCoords,
  fetchForecast,
  WeatherApiError
} from '../services/weatherApi.js';

const STORAGE_KEY = 'weather-app:history';
const MAX_HISTORY = 5;

function createWeatherStore() {
  // --- ESTADO REACTIVO ---
  let currentWeather = $state(null);
  let forecast = $state([]);
  let loading = $state(false);
  let error = $state(null);
  let history = $state(loadHistoryFromStorage());

  // --- VALORES DERIVADOS ---
  const hasHistory = $derived(history.length > 0);

  /**
   * Hora local de la ciudad actual, calculada a partir del offset
   * de timezone que devuelve la API. Se actualiza cada vez que cambia
   * currentWeather. Lo dejamos como función (no $derived) para que
   * el componente pueda re-ejecutarlo cada minuto vía setInterval.
   */
  function getLocalTime() {
    if (!currentWeather) return null;
    const nowUtc = Date.now();
    const local = new Date(nowUtc + currentWeather.timezone * 1000);
    return local;
  }

  // --- EFECTOS PERSISTENTES ---
  // $effect.root permite que los efectos sigan vivos durante toda la app,
  // no solo durante el ciclo de vida de un componente.
  $effect.root(() => {
    // Persistir historial en localStorage cuando cambia.
    $effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      } catch (err) {
        console.warn('No se pudo guardar el historial:', err);
      }
    });
  });

  /**
   * Busca el clima por nombre de ciudad. Útil cuando el usuario
   * escribe y presiona Enter sin elegir sugerencia.
   */
  async function searchByName(city) {
    const trimmed = city?.trim();
    if (!trimmed) {
      error = 'Por favor escribe el nombre de una ciudad.';
      return;
    }
    await runSearch(() => fetchWeatherByCity(trimmed));
  }

  /**
   * Busca el clima por coordenadas. Se usa cuando el usuario
   * selecciona una sugerencia del autocomplete (más preciso).
   */
  async function searchByCoords(lat, lon) {
    await runSearch(() => fetchWeatherByCoords(lat, lon));
  }

  /**
   * Lógica común: ejecuta el fetcher, maneja loading/error,
   * carga el forecast en paralelo y actualiza el historial.
   */
  async function runSearch(weatherFetcher) {
    loading = true;
    error = null;

    try {
      const data = await weatherFetcher();
      currentWeather = data;
      addToHistory(data);

      // Cargamos el forecast en paralelo (no bloqueamos la UI por él).
      // Si el forecast falla, mostramos el clima actual igual.
      try {
        forecast = await fetchForecast(data.lat, data.lon);
      } catch (err) {
        console.warn('No se pudo cargar el pronóstico:', err);
        forecast = [];
      }
    } catch (err) {
      currentWeather = null;
      forecast = [];
      if (err instanceof WeatherApiError) {
        error = err.message;
      } else {
        error = 'Ocurrió un error inesperado.';
        console.error(err);
      }
    } finally {
      loading = false;
    }
  }

  /**
   * Agrega ciudad al historial: máx 5, sin duplicados, más reciente primero.
   */
  function addToHistory(weather) {
    const entry = {
      city: weather.city,
      country: weather.country,
      lat: weather.lat,
      lon: weather.lon,
      id: `${weather.lat.toFixed(2)}-${weather.lon.toFixed(2)}`
    };
    const filtered = history.filter((h) => h.id !== entry.id);
    history = [entry, ...filtered].slice(0, MAX_HISTORY);
  }

  function clearHistory() {
    history = [];
  }

  return {
    get currentWeather() { return currentWeather; },
    get forecast() { return forecast; },
    get loading() { return loading; },
    get error() { return error; },
    get history() { return history; },
    get hasHistory() { return hasHistory; },
    getLocalTime,
    searchByName,
    searchByCoords,
    clearHistory
  };
}

function loadHistoryFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const weatherStore = createWeatherStore();
