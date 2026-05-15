/**
 * Servicio para consumir la API de OpenWeatherMap.
 * Documentación: https://openweathermap.org/current
 *
 * La API Key se lee desde una variable de entorno con prefijo VITE_,
 * que Vite expone al cliente en tiempo de build.
 */

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Errores tipados para que el componente pueda diferenciar
 * entre ciudad no encontrada, problema de red y otros.
 */
export class WeatherApiError extends Error {
  constructor(message, kind) {
    super(message);
    this.name = 'WeatherApiError';
    this.kind = kind; // 'not_found' | 'network' | 'auth' | 'unknown'
  }
}

/**
 * Obtiene el clima actual de una ciudad.
 * @param {string} city - Nombre de la ciudad (ej: "San José", "London,GB")
 * @returns {Promise<object>} Datos del clima en formato normalizado
 */
export async function fetchWeatherByCity(city) {
  if (!API_KEY) {
    throw new WeatherApiError(
      'Falta la API Key. Crea un archivo .env con VITE_OPENWEATHER_API_KEY.',
      'auth'
    );
  }

  const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=es`;

  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    // Fallo de red (sin internet, DNS, etc.)
    throw new WeatherApiError(
      'No se pudo conectar al servidor. Verifica tu conexión a internet.',
      'network'
    );
  }

  if (response.status === 404) {
    throw new WeatherApiError(
      'Ciudad no encontrada. Verifica el nombre e inténtalo de nuevo.',
      'not_found'
    );
  }

  if (response.status === 401) {
    throw new WeatherApiError(
      'API Key inválida. Revisa tu configuración en .env.',
      'auth'
    );
  }

  if (!response.ok) {
    throw new WeatherApiError(
      `Error inesperado (${response.status}). Intenta más tarde.`,
      'unknown'
    );
  }

  const data = await response.json();
  return normalizeWeatherData(data);
}

/**
 * Normaliza la respuesta de la API a un objeto plano y predecible.
 * Esto desacopla nuestros componentes del formato exacto de OpenWeatherMap.
 */
function normalizeWeatherData(raw) {
  return {
    city: raw.name,
    country: raw.sys?.country ?? '',
    temperature: Math.round(raw.main.temp),
    feelsLike: Math.round(raw.main.feels_like),
    description: raw.weather[0].description,
    humidity: raw.main.humidity,
    windSpeed: raw.wind.speed,
    iconCode: raw.weather[0].icon,
    iconUrl: `https://openweathermap.org/img/wn/${raw.weather[0].icon}@4x.png`,
    timestamp: Date.now()
  };
}
