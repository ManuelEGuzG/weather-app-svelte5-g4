/**
 * Servicio para consumir las APIs de OpenWeatherMap.
 *
 * Endpoints usados (todos gratuitos):
 * - GET /data/2.5/weather       → clima actual por ciudad
 * - GET /data/2.5/forecast      → pronóstico de 5 días (intervalos de 3h)
 * - GET /geo/1.0/direct         → geocoding directo (sugerencias)
 *
 * Documentación: https://openweathermap.org/api
 */

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct';

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

function assertApiKey() {
  if (!API_KEY) {
    throw new WeatherApiError(
      'Falta la API Key. Crea un archivo .env con VITE_OPENWEATHER_API_KEY.',
      'auth'
    );
  }
}

async function safeFetch(url, signal) {
  let response;
  try {
    response = await fetch(url, { signal });
  } catch (err) {
    // AbortError no es un fallo real; lo dejamos pasar tal cual.
    if (err.name === 'AbortError') throw err;
    throw new WeatherApiError(
      'No se pudo conectar al servidor. Verifica tu conexión a internet.',
      'network'
    );
  }
  if (response.status === 401) {
    throw new WeatherApiError('API Key inválida. Revisa tu configuración en .env.', 'auth');
  }
  if (response.status === 404) {
    throw new WeatherApiError('Ciudad no encontrada.', 'not_found');
  }
  if (!response.ok) {
    throw new WeatherApiError(`Error inesperado (${response.status}).`, 'unknown');
  }
  return response.json();
}

/**
 * Obtiene el clima actual de una ciudad por nombre.
 */
export async function fetchWeatherByCity(city) {
  assertApiKey();
  const url = `${WEATHER_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=es`;
  const data = await safeFetch(url);
  return normalizeWeatherData(data);
}

/**
 * Obtiene el clima actual por coordenadas (más preciso, ideal cuando
 * el usuario seleccionó una sugerencia del geocoding).
 */
export async function fetchWeatherByCoords(lat, lon) {
  assertApiKey();
  const url = `${WEATHER_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`;
  const data = await safeFetch(url);
  return normalizeWeatherData(data);
}

/**
 * Obtiene el pronóstico de 5 días en intervalos de 3 horas.
 * Devolvemos solo un punto por día (el más cercano al mediodía).
 */
export async function fetchForecast(lat, lon) {
  assertApiKey();
  const url = `${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`;
  const data = await safeFetch(url);
  return normalizeForecast(data);
}

/**
 * Geocoding directo: busca ciudades que coincidan con el texto.
 * Devuelve hasta 5 resultados con nombre, país, estado y coordenadas.
 * Acepta un AbortSignal para cancelar peticiones obsoletas durante el debounce.
 */
export async function searchCities(query, signal) {
  assertApiKey();
  if (!query || query.trim().length < 2) return [];
  const url = `${GEO_URL}?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`;
  const data = await safeFetch(url, signal);
  return data.map((item) => ({
    name: item.name,
    country: item.country,
    state: item.state ?? '',
    lat: item.lat,
    lon: item.lon,
    // Clave estable para el bloque #each de Svelte:
    id: `${item.name}-${item.state ?? ''}-${item.country}-${item.lat}-${item.lon}`
  }));
}

// --------- Normalizadores ---------

function normalizeWeatherData(raw) {
  return {
    city: raw.name,
    country: raw.sys?.country ?? '',
    temperature: Math.round(raw.main.temp),
    feelsLike: Math.round(raw.main.feels_like),
    tempMin: Math.round(raw.main.temp_min),
    tempMax: Math.round(raw.main.temp_max),
    description: raw.weather[0].description,
    humidity: raw.main.humidity,
    pressure: raw.main.pressure,
    visibility: raw.visibility,
    windSpeed: raw.wind.speed,
    windDeg: raw.wind.deg,
    cloudiness: raw.clouds?.all ?? 0,
    iconCode: raw.weather[0].icon,
    iconUrl: `https://openweathermap.org/img/wn/${raw.weather[0].icon}@4x.png`,
    weatherMain: raw.weather[0].main,
    sunrise: raw.sys.sunrise,
    sunset: raw.sys.sunset,
    timezone: raw.timezone,
    lat: raw.coord.lat,
    lon: raw.coord.lon,
    timestamp: Date.now()
  };
}

/**
 * La API de forecast devuelve 40 puntos (5 días × 8 mediciones por día).
 * Agrupamos por fecha local y elegimos el punto más cercano al mediodía
 * para representar cada día.
 */
function normalizeForecast(raw) {
  const offset = raw.city.timezone;
  const byDay = new Map();

  for (const point of raw.list) {
    const localDate = new Date((point.dt + offset) * 1000);
    const dayKey = localDate.toISOString().slice(0, 10);
    const hour = localDate.getUTCHours();

    const existing = byDay.get(dayKey);
    const distanceToNoon = Math.abs(hour - 12);

    if (!existing || distanceToNoon < existing.distanceToNoon) {
      byDay.set(dayKey, {
        distanceToNoon,
        data: {
          dayKey,
          date: localDate,
          temp: Math.round(point.main.temp),
          tempMin: Math.round(point.main.temp_min),
          tempMax: Math.round(point.main.temp_max),
          description: point.weather[0].description,
          iconCode: point.weather[0].icon,
          iconUrl: `https://openweathermap.org/img/wn/${point.weather[0].icon}@2x.png`,
          weatherMain: point.weather[0].main
        }
      });
    }
  }

  // Omitimos el día de hoy: el pronóstico empieza desde mañana.
  const todayKey = new Date(Date.now() + offset * 1000).toISOString().slice(0, 10);
  return Array.from(byDay.values())
    .map((entry) => entry.data)
    .filter((day) => day.dayKey !== todayKey)
    .slice(0, 5);
}
