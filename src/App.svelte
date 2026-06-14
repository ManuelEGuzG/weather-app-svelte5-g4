<script>
  import SearchBar from './lib/components/SearchBar.svelte';
  import WeatherCard from './lib/components/WeatherCard.svelte';
  import ForecastList from './lib/components/ForecastList.svelte';
  import SearchHistory from './lib/components/SearchHistory.svelte';
  import LoadingSpinner from './lib/components/LoadingSpinner.svelte';
  import ErrorMessage from './lib/components/ErrorMessage.svelte';
  import { weatherStore } from './lib/stores/weather.svelte.js';

  const DEFAULT_CITY = 'San José, CR';

  // Cargar ciudad por defecto al montar la aplicación
  $effect(() => {
    if (!weatherStore.currentWeather && !weatherStore.error && !weatherStore.loading) {
      weatherStore.searchByName(DEFAULT_CITY);
    }
  });

  /**
   * $derived.by: Gradiente dinámico y paleta de colores según el clima actual y la hora.
   * Modifica las clases del contenedor para adaptar los fondos y los orbs decorativos.
   */
  const themeClass = $derived.by(() => {
    if (!weatherStore.currentWeather) return 'theme-default';
    const { weatherMain, iconCode } = weatherStore.currentWeather;
    const isNight = iconCode?.endsWith('n');

    if (isNight) return 'theme-night';

    switch (weatherMain) {
      case 'Clear':        return 'theme-clear';
      case 'Clouds':       return 'theme-clouds';
      case 'Rain':
      case 'Drizzle':      return 'theme-rain';
      case 'Thunderstorm': return 'theme-storm';
      case 'Snow':         return 'theme-snow';
      case 'Mist':
      case 'Fog':
      case 'Haze':
      case 'Smoke':        return 'theme-mist';
      default:             return 'theme-default';
    }
  });

  function handleSelectCity(city) {
    weatherStore.searchByCoords(city.lat, city.lon);
  }

  function handleSearchName(name) {
    weatherStore.searchByName(name);
  }

  function handleHistoryClick(item) {
    weatherStore.searchByCoords(item.lat, item.lon);
  }
</script>

<div class="background {themeClass}">
  <div class="orb orb-1" aria-hidden="true"></div>
  <div class="orb orb-2" aria-hidden="true"></div>
  <div class="orb orb-3" aria-hidden="true"></div>

  <main class="app-container">
    <header class="header">
      <div class="logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M17.5 19a4.5 4.5 0 1 0 0-9h-1.8A7 7 0 1 0 4 15.71" />
          <circle cx="6" cy="20" r="1" />
          <circle cx="10" cy="22" r="1" />
          <circle cx="14" cy="20" r="1" />
        </svg>
        <h1>Clima</h1>
      </div>
      <p class="subtitle">Svelte 5 • OpenWeatherMap</p>
    </header>

    <SearchBar
      onSelectCity={handleSelectCity}
      onSearchName={handleSearchName}
      disabled={weatherStore.loading}
    />

    <section class="results" aria-live="polite">
      {#if weatherStore.loading}
        <div class="center-flex">
          <LoadingSpinner />
        </div>
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
  /* --- Variables Globales de Diseño --- */
  :global(:root) {
    --accent: #60a5fa;
    --accent-strong: #3b82f6;
    --text-main: #ffffff;
    --text-soft: #94a3b8;
    --font-display: 'Inter', system-ui, -apple-system, sans-serif;
  }

  /* --- Lienzo de Fondo Global --- */
  .background {
    position: relative;
    width: 100%;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow-x: hidden;
    padding: 2rem 1rem;
    color: var(--text-main);
    font-family: var(--font-display);
    transition: background 1.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  /* --- Gradientes según el Clima --- */
  .theme-default { background: linear-gradient(165deg, #0f172a 0%, #1e293b 100%); }
  .theme-clear   { background: linear-gradient(165deg, #f59e0b 0%, #d946ef 50%, #4338ca 100%); }
  .theme-night   { background: linear-gradient(165deg, #030712 0%, #111827 50%, #1f2937 100%); }
  .theme-clouds  { background: linear-gradient(165deg, #475569 0%, #64748b 50%, #1e293b 100%); }
  .theme-rain    { background: linear-gradient(165deg, #1e3a8a 0%, #3b82f6 50%, #0f172a 100%); }
  .theme-storm   { background: linear-gradient(165deg, #312e81 0%, #581c87 50%, #111827 100%); }
  .theme-snow    { background: linear-gradient(165deg, #64748b 0%, #94a3b8 50%, #334155 100%); }
  .theme-mist    { background: linear-gradient(165deg, #334155 0%, #475569 50%, #1e293b 100%); }

  /* --- Esferas Difuminadas (Orbs) --- */
  .orb {
    position: fixed;
    border-radius: 50%;
    filter: blur(120px);
    pointer-events: none;
    opacity: 0.45;
    z-index: 0;
    will-change: transform;
  }

  .orb-1 {
    top: -10%;
    left: -10%;
    width: 500px;
    height: 500px;
    background: var(--orb-color-1, #60a5fa);
    animation: float1 25s ease-in-out infinite;
  }

  .orb-2 {
    top: 25%;
    right: -15%;
    width: 450px;
    height: 450px;
    background: var(--orb-color-2, #f472b6);
    animation: float2 28s ease-in-out infinite;
  }

  .orb-3 {
    bottom: -15%;
    left: 20%;
    width: 550px;
    height: 550px;
    background: var(--orb-color-3, #34d399);
    animation: float3 32s ease-in-out infinite;
  }

  /* Paletas dinámicas de los Orbs */
  .theme-clear  { --orb-color-1: #fef08a; --orb-color-2: #f472b6; --orb-color-3: #fb923c; }
  .theme-night  { --orb-color-1: #818cf8; --orb-color-2: #c084fc; --orb-color-3: #4f46e5; }
  .theme-clouds { --orb-color-1: #cbd5e1; --orb-color-2: #94a3b8; --orb-color-3: #64748b; }
  .theme-rain   { --orb-color-1: #60a5fa; --orb-color-2: #3b82f6; --orb-color-3: #1d4ed8; }
  .theme-storm  { --orb-color-1: #c084fc; --orb-color-2: #fbbf24; --orb-color-3: #818cf8; }
  .theme-snow   { --orb-color-1: #f1f5f9; --orb-color-2: #e2e8f0; --orb-color-3: #cbd5e1; }
  .theme-mist   { --orb-color-1: #e2e8f0; --orb-color-2: #cbd5e1; --orb-color-3: #94a3b8; }

  /* Animaciones Orgánicas */
  @keyframes float1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50%      { transform: translate(60px, 40px) scale(1.1); }
  }
  @keyframes float2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50%      { transform: translate(-50px, 60px) scale(1.05); }
  }
  @keyframes float3 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50%      { transform: translate(40px, -60px) scale(1.1); }
  }

  /* --- Contenedor Glassmorphism (Tarjeta Principal) --- */
  .app-container {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 580px;
    padding: 3rem 2.5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 28px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }

  /* --- Encabezado --- */
  .header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
  }

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }

  .logo svg {
    width: 36px;
    height: 36px;
    color: var(--accent);
    filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.4));
  }

  h1 {
    font-size: 2.25rem;
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.03em;
    background: linear-gradient(to bottom right, #ffffff, #cbd5e1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .subtitle {
    margin: 0;
    color: var(--text-soft);
    font-size: 0.85rem;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  /* --- Sección de Contenido --- */
  .results {
    width: 100%;
    min-height: 180px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .center-flex {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
  }

  /* --- Footer --- */
  .footer {
    padding-top: 1.5rem;
    text-align: center;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    color: var(--text-soft);
    font-size: 0.8rem;
  }

  .footer a {
    color: var(--accent);
    text-decoration: none;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .footer a:hover {
    color: #ffffff;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
  }

  /* --- Ajustes Responsivos --- */
  @media (max-width: 640px) {
    .app-container {
      padding: 2rem 1.5rem;
      border-radius: 20px;
    }
    h1 { font-size: 1.85rem; }
  }

  /* Soporte de accesibilidad para reducir movimiento */
  @media (prefers-reduced-motion: reduce) {
    .orb { animation: none; }
    .background { transition: none; }
  }
</style>