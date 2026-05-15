<script>
  import SearchBar from './lib/components/SearchBar.svelte';
  import WeatherCard from './lib/components/WeatherCard.svelte';
  import ForecastList from './lib/components/ForecastList.svelte';
  import SearchHistory from './lib/components/SearchHistory.svelte';
  import LoadingSpinner from './lib/components/LoadingSpinner.svelte';
  import ErrorMessage from './lib/components/ErrorMessage.svelte';
  import { weatherStore } from './lib/stores/weather.svelte.js';

  const DEFAULT_CITY = 'San José, CR';

  // Cargar ciudad por defecto al montar.
  $effect(() => {
    if (!weatherStore.currentWeather && !weatherStore.error && !weatherStore.loading) {
      weatherStore.searchByName(DEFAULT_CITY);
    }
  });

  /**
   * $derived: gradiente dinámico que cambia según el clima actual.
   *
   * Combinamos el tipo de clima (Clear, Rain, Clouds, Snow, etc.) con
   * la hora local (día vs noche, según el icono que termina en 'd' o 'n')
   * para elegir una paleta apropiada. Esto es lo que da el efecto
   * glassmorphism vibrante.
   */
  const themeClass = $derived.by(() => {
    if (!weatherStore.currentWeather) return 'theme-default';
    const { weatherMain, iconCode } = weatherStore.currentWeather;
    const isNight = iconCode?.endsWith('n');

    if (isNight) return 'theme-night';

    switch (weatherMain) {
      case 'Clear':         return 'theme-clear';
      case 'Clouds':        return 'theme-clouds';
      case 'Rain':
      case 'Drizzle':       return 'theme-rain';
      case 'Thunderstorm':  return 'theme-storm';
      case 'Snow':          return 'theme-snow';
      case 'Mist':
      case 'Fog':
      case 'Haze':
      case 'Smoke':         return 'theme-mist';
      default:              return 'theme-default';
    }
  });

  function handleSelectCity(city) {
    // Cuando viene del autocomplete, tenemos lat/lon. Más preciso.
    weatherStore.searchByCoords(city.lat, city.lon);
  }

  function handleSearchName(name) {
    weatherStore.searchByName(name);
  }

  function handleHistoryClick(item) {
    // El historial guarda lat/lon, así que vamos por coords directamente.
    weatherStore.searchByCoords(item.lat, item.lon);
  }
</script>

<!-- El wrapper aplica la clase de tema dinámico que controla el fondo -->
<div class="background {themeClass}">
  <!-- Capas decorativas: blobs/orbs animados que crean el efecto vibrante -->
  <div class="orb orb-1" aria-hidden="true"></div>
  <div class="orb orb-2" aria-hidden="true"></div>
  <div class="orb orb-3" aria-hidden="true"></div>

  <main class="app">
    <header class="header">
      <div class="logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M17.5 19a4.5 4.5 0 1 0 0-9h-1.8A7 7 0 1 0 4 15.71" />
          <circle cx="6" cy="20" r="1" />
          <circle cx="10" cy="22" r="1" />
          <circle cx="14" cy="20" r="1" />
        </svg>
        <h1>Clima</h1>
      </div>
      <p class="subtitle">Construido con Svelte 5 + OpenWeatherMap</p>
    </header>

    <SearchBar
      onSelectCity={handleSelectCity}
      onSearchName={handleSearchName}
      disabled={weatherStore.loading}
    />

    <section class="results" aria-live="polite">
      {#if weatherStore.loading}
        <LoadingSpinner />
      {:else if weatherStore.error}
        <ErrorMessage message={weatherStore.error} />
      {:else if weatherStore.currentWeather}
        <WeatherCard weather={weatherStore.currentWeather} />
        {#if weatherStore.forecast.length > 0}
          <ForecastList forecast={weatherStore.forecast} />
        {/if}
      {/if}
    </section>

    {#if weatherStore.hasHistory}
      <SearchHistory
        history={weatherStore.history}
        onSelect={handleHistoryClick}
        onClear={() => weatherStore.clearHistory()}
      />
    {/if}

    <footer class="footer">
      <p>
        Datos provistos por
        <a href="https://openweathermap.org" target="_blank" rel="noopener noreferrer">OpenWeatherMap</a>
      </p>
    </footer>
  </main>
</div>

<style>
  .background {
    position: relative;
    width: 100%;
    min-height: 100vh;
    overflow-x: hidden;
    transition: background 1.2s ease;
  }

  /* --- Temas dinámicos según el clima --- */
  .theme-default { background: linear-gradient(165deg, #1a1a2e 0%, #16213e 100%); }
  .theme-clear   { background: linear-gradient(165deg, #ff8a5b 0%, #c54b8c 45%, #2b1b5e 100%); }
  .theme-night   { background: linear-gradient(165deg, #0f0c29 0%, #302b63 50%, #24243e 100%); }
  .theme-clouds  { background: linear-gradient(165deg, #3e5172 0%, #4a5b7a 45%, #1f2a44 100%); }
  .theme-rain    { background: linear-gradient(165deg, #355c7d 0%, #4a6b8a 40%, #1a2a44 100%); }
  .theme-storm   { background: linear-gradient(165deg, #2c3e50 0%, #4a3b6b 45%, #1a1a2e 100%); }
  .theme-snow    { background: linear-gradient(165deg, #5e7390 0%, #8aa1bd 40%, #2e3e5e 100%); }
  .theme-mist    { background: linear-gradient(165deg, #4f5b6e 0%, #6b7a8f 45%, #2a3340 100%); }

  /* --- Orbs decorativos (glassmorphism vibrante) --- */
  .orb {
    position: fixed;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
    opacity: 0.55;
    z-index: 0;
    will-change: transform;
  }

  .orb-1 {
    top: -15%;
    left: -10%;
    width: 480px;
    height: 480px;
    background: var(--orb-color-1, #ffb84d);
    animation: float1 18s ease-in-out infinite;
  }

  .orb-2 {
    top: 20%;
    right: -15%;
    width: 420px;
    height: 420px;
    background: var(--orb-color-2, #d990ff);
    animation: float2 22s ease-in-out infinite;
  }

  .orb-3 {
    bottom: -20%;
    left: 30%;
    width: 520px;
    height: 520px;
    background: var(--orb-color-3, #7ec8ff);
    animation: float3 26s ease-in-out infinite;
  }

  /* Colores de los orbs por tema */
  .theme-clear  { --orb-color-1: #ffd28d; --orb-color-2: #ff6b9d; --orb-color-3: #ff8a5b; }
  .theme-night  { --orb-color-1: #6b5dd3; --orb-color-2: #b794f4; --orb-color-3: #4c51bf; }
  .theme-clouds { --orb-color-1: #a0aec0; --orb-color-2: #cbd5e0; --orb-color-3: #7c8a99; }
  .theme-rain   { --orb-color-1: #7ec8ff; --orb-color-2: #5b8db8; --orb-color-3: #4a90c2; }
  .theme-storm  { --orb-color-1: #b794f4; --orb-color-2: #f6d55c; --orb-color-3: #6b5dd3; }
  .theme-snow   { --orb-color-1: #e0e7ff; --orb-color-2: #c7d2fe; --orb-color-3: #a5b4fc; }
  .theme-mist   { --orb-color-1: #cbd5e0; --orb-color-2: #a0aec0; --orb-color-3: #94a3b8; }

  @keyframes float1 {
    0%, 100% { transform: translate(0, 0); }
    50%      { transform: translate(40px, 60px); }
  }
  @keyframes float2 {
    0%, 100% { transform: translate(0, 0); }
    50%      { transform: translate(-50px, 40px); }
  }
  @keyframes float3 {
    0%, 100% { transform: translate(0, 0); }
    50%      { transform: translate(30px, -50px); }
  }

  /* --- Layout principal --- */
  .app {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 640px;
    margin: 0 auto;
    padding: 2.5rem 1.25rem;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .header { margin-bottom: 2rem; }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .logo svg {
    width: 32px;
    height: 32px;
    color: var(--accent);
  }

  h1 {
    font-family: var(--font-display);
    font-size: 1.875rem;
    font-weight: 600;
    margin: 0;
    letter-spacing: -0.02em;
  }

  .subtitle {
    margin: 0;
    color: var(--text-soft);
    font-size: 0.875rem;
    letter-spacing: 0.02em;
  }

  .results {
    margin-top: 1.5rem;
    min-height: 200px;
  }

  .footer {
    margin-top: auto;
    padding-top: 3rem;
    text-align: center;
    color: var(--text-soft);
    font-size: 0.8rem;
  }

  .footer a {
    color: var(--accent);
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .footer a:hover { color: var(--accent-strong); }

  /* Reduce motion: desactiva animaciones de orbs */
  @media (prefers-reduced-motion: reduce) {
    .orb { animation: none; }
    .background { transition: none; }
  }
</style>
