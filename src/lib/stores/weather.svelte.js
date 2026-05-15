/**
 * Store global de la aplicación usando RUNES de Svelte 5.
 *
 * Característica distintiva de Svelte 5: las runes ($state, $derived, $effect)
 * permiten reactividad granular dentro y FUERA de componentes .svelte,
 * siempre que el archivo use la extensión .svelte.js (o .svelte.ts).
 *
 * - $state: declara estado reactivo (reemplaza al antiguo `writable` de Svelte 4)
 * - $derived: valor computado a partir de otro estado reactivo
 * - $effect: efecto secundario que se re-ejecuta cuando cambia su dependencia
 *
 * Esto es JS reactivo nativo del compilador de Svelte, no es una librería externa.
 */

import { fetchWeatherByCity, WeatherApiError } from '../services/weatherApi.js';

const STORAGE_KEY = 'weather-app:history';
const MAX_HISTORY = 5;

function createWeatherStore() {
  // --- ESTADO REACTIVO con $state ---
  let currentWeather = $state(null);
  let loading = $state(false);
  let error = $state(null);
  let history = $state(loadHistoryFromStorage());

  // --- VALOR DERIVADO con $derived ---
  // hasHistory se recalcula automáticamente cuando history cambia.
  // No hace falta suscribirse manualmente como en Svelte 4.
  const hasHistory = $derived(history.length > 0);

  // --- EFECTO con $effect.root ---
  // Como estamos fuera de un componente, usamos $effect.root para que
  // el efecto persista durante toda la vida de la aplicación.
  // Cada vez que history cambia, se persiste en localStorage.
  $effect.root(() => {
    $effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      } catch (err) {
        console.warn('No se pudo guardar el historial:', err);
      }
    });
  });

  /**
   * Busca el clima de una ciudad y actualiza el estado.
   */
  async function search(city) {
    const trimmed = city?.trim();
    if (!trimmed) {
      error = 'Por favor escribe el nombre de una ciudad.';
      return;
    }

    loading = true;
    error = null;

    try {
      const data = await fetchWeatherByCity(trimmed);
      currentWeather = data;
      addToHistory(data.city, data.country);
    } catch (err) {
      currentWeather = null;
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
   * Agrega una ciudad al historial, manteniendo solo las últimas MAX_HISTORY,
   * sin duplicados y con la más reciente primero.
   */
  function addToHistory(city, country) {
    const entry = { city, country, id: `${city}-${country}`.toLowerCase() };
    // Filtramos duplicados (case-insensitive) y agregamos al inicio.
    const filtered = history.filter((h) => h.id !== entry.id);
    history = [entry, ...filtered].slice(0, MAX_HISTORY);
  }

  /**
   * Limpia el historial completo.
   */
  function clearHistory() {
    history = [];
  }

  /**
   * Devuelve un snapshot del estado. Usamos getters para que sea reactivo
   * cuando se destructura en componentes.
   */
  return {
    get currentWeather() { return currentWeather; },
    get loading() { return loading; },
    get error() { return error; },
    get history() { return history; },
    get hasHistory() { return hasHistory; },
    search,
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

// Instancia única (singleton) exportada para toda la app.
export const weatherStore = createWeatherStore();
