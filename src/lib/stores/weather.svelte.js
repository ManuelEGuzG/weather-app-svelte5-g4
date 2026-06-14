/**
 * Store global de la aplicación usando RUNES de Svelte 5.
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
  // --- ESTADO REACTIVO FINE-GRAINED ($state) ---
  let currentWeather = $state(null);
  let forecast = $state([]);
  let loading = $state(false);
  let error = $state(null);
  let history = $state(loadHistoryFromStorage());

  // --- VALORES DERIVADOS ($derived) ---
  const hasHistory = $derived(history.length > 0);

  /**
   * getLocalTime corrección matemática:
   * Los objetos Date en JS se inicializan usando el huso horario local de la máquina del usuario.
   * Para calcular la hora exacta de la ciudad destino sin desajustes por el horario de verano del cliente,
   * aislamos los milisegundos UTC nativos y les sumamos el offset de la API.
   */
  function getLocalTime() {
    if (!currentWeather) return null;
    const now = new Date();
    // Obtener milisegundos UTC puros actuales de la máquina cliente
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    // Sumar el offset de la ciudad destino (multiplicado por 1000 para pasar segundos a ms)
    return new Date(utcTime + (currentWeather.timezone * 1000));
  }

  // --- EFECTOS PERSISTENTES DE RUNES ---
  // Nota técnica: En Svelte 5, si inicializas un store a nivel global de archivo (módulo),
  // un $effect plano fallará porque no hay un contexto de componente activo. 
  // Usar $effect.root es el enfoque idóneo para mantener vivo el watcher del localStorage.
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
   * Busca el clima por nombre de ciudad directo (fallback).
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
   * Busca el clima por coordenadas exactas (opción preferida desde los chips/sugerencias).
   */
  async function searchByCoords(lat, lon) {
    await runSearch(() => fetchWeatherByCoords(lat, lon));
  }

  /**
   * Orquestador común de búsquedas con promesas asíncronas concurrentes.
   */
  async function runSearch(weatherFetcher) {
    loading = true;
    error = null;

    try {
      const data = await weatherFetcher();
      currentWeather = data;
      addToHistory(data);

      // Carga el forecast en paralelo (no bloqueante) para maximizar la velocidad percibida
      try {
        forecast = await fetchForecast(data.lat, data.lon);
      } catch (err) {
        console.warn('No se pudo cargar el pronóstico de los 5 días:', err);
        forecast = [];
      }
    } catch (err) {
      currentWeather = null;
      forecast = [];
      if (err instanceof WeatherApiError) {
        error = err.message;
      } else {
        error = 'Ocurrió un error inesperado al consultar el servidor.';
        console.error(err);
      }
    } finally {
      loading = false;
    }
  }

  /**
   * Inserción ordenada en pila LIFO (Last In, First Out)
   */
  function addToHistory(weather) {
    const entry = {
      city: weather.city,
      country: weather.country,
      lat: weather.lat,
      lon: weather.lon,
      id: `${weather.lat.toFixed(2)}-${weather.lon.toFixed(2)}`
    };
    
    const filtered = history.filter((item) => item.id !== entry.id);
    history = [entry, ...filtered].slice(0, MAX_HISTORY);
  }

  function clearHistory() {
    history = [];
  }

  // --- INTERFAZ PÚBLICA (GETTERS INTERNOS DE SVELTE 5) ---
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

// Exportación única como Singleton Reactivo
export const weatherStore = createWeatherStore();