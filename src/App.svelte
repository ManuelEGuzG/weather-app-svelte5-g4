<script>
  import SearchBar from './lib/components/SearchBar.svelte';
  import WeatherCard from './lib/components/WeatherCard.svelte';
  import ForecastList from './lib/components/ForecastList.svelte';
  import SearchHistory from './lib/components/SearchHistory.svelte';
  import LoadingSpinner from './lib/components/LoadingSpinner.svelte';
  import ErrorMessage from './lib/components/ErrorMessage.svelte';
  import { weatherStore } from './lib/stores/weather.svelte.js';

  const DEFAULT_CITY = 'San José, CR';

  $effect(() => {
    if (!weatherStore.currentWeather && !weatherStore.error && !weatherStore.loading) {
      weatherStore.searchByName(DEFAULT_CITY);
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

<div class="sky-canvas">
  <div class="starfield-layer-1" aria-hidden="true"></div>
  <div class="starfield-layer-2" aria-hidden="true"></div>
  <div class="nebula nebula-cyan" aria-hidden="true"></div>
  <div class="nebula nebula-magenta" aria-hidden="true"></div>
  <div class="nebula nebula-indigo" aria-hidden="true"></div>

  <main class="app-shell">
    <div class="glass-glare" aria-hidden="true"></div>

    <header class="app-header">
      <div class="brand-group">
        <div class="icon-frame">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M17.5 19a4.5 4.5 0 1 0 0-9h-1.8A7 7 0 1 0 4 15.71" />
            <circle cx="6" cy="20" r="1" />
            <circle cx="10" cy="22" r="1" />
            <circle cx="14" cy="20" r="1" />
          </svg>
        </div>
        <h1>Skyline</h1>
      </div>
      <p class="app-tagline">Métricas Atmosféricas • Svelte 5</p>
    </header>

    <div class="interactive-zone">
      <SearchBar
        onSelectCity={handleSelectCity}
        onSearchName={handleSearchName}
        disabled={weatherStore.loading}
      />
    </div>

    <section class="stage" aria-live="polite">
      {#if weatherStore.loading}
        <div class="stage-centered">
          <LoadingSpinner />
        </div>
      {:else if weatherStore.error}
        <ErrorMessage message={weatherStore.error} />
      {:else if weatherStore.currentWeather}
        <div class="fade-in-render">
          <WeatherCard weather={weatherStore.currentWeather} />
          {#if weatherStore.forecast.length > 0}
            <ForecastList forecast={weatherStore.forecast} />
          {/if}
        </div>
      {/if}
    </section>

    {#if weatherStore.hasHistory}
      <div class="history-dock">
        <SearchHistory
          history={weatherStore.history}
          onSelect={handleHistoryClick}
          onClear={() => weatherStore.clearHistory()}
        />
      </div>
    {/if}

    <footer class="app-credit">
      <p>
        Arquitectura de datos gestionada mediante 
        <a href="https://openweathermap.org" target="_blank" rel="noopener noreferrer">OpenWeather API</a>
      </p>
    </footer>
  </main>
</div>

<style>
  /* --- Sistema de Variables de Diseño Avanzado --- */
  :global(:root) {
    --accent: #38bdf8;
    --accent-glow: rgba(56, 189, 248, 0.25);
    --text-main: #f8fafc;
    --text-soft: #94a3b8;
    --text-muted: #64748b;
    --font-display: 'Fraunces', Georgia, serif;
    --font-body: 'Outfit', system-ui, sans-serif;
  }

  /* --- Lienzo Base Cinemático --- */
  .sky-canvas {
    position: relative;
    width: 100%;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: 4rem 1.5rem;
    color: var(--text-main);
    font-family: var(--font-body);
    background-color: #040209;
    /* Composición espacial profunda */
    background-image: 
      radial-gradient(circle at 50% 40%, #0c0a21 0%, #05040f 70%, #020105 100%);
  }

  /* --- Generador de Campo de Estrellas Matemático (CSS Puro) --- */
  .starfield-layer-1, .starfield-layer-2 {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 0;
  }

  /* Estrellas pequeñas y densas */
  .starfield-layer-1 {
    background-image: 
      radial-gradient(1px 1px at 10% 15%, #ffffff 100%, transparent),
      radial-gradient(1px 1px at 30% 45%, #ffffff 80%, transparent),
      radial-gradient(1.5px 1.5px at 55% 20%, #e0f2fe 100%, transparent),
      radial-gradient(1px 1px at 75% 75%, #ffffff 90%, transparent),
      radial-gradient(2px 2px at 85% 30%, #bae6fd 100%, transparent),
      radial-gradient(1px 1px at 20% 80%, #ffffff 100%, transparent),
      radial-gradient(1.5px 1.5px at 45% 85%, #f472b6 60%, transparent),
      radial-gradient(1px 1px at 90% 85%, #ffffff 100%, transparent);
    background-size: 400px 400px;
    opacity: 0.55;
    animation: starParallax 120s linear infinite;
  }

  /* Estrellas medianas y destellos distantes */
  .starfield-layer-2 {
    background-image: 
      radial-gradient(2px 2px at 15% 70%, #ffffff 100%, transparent),
      radial-gradient(1.5px 1.5px at 60% 65%, #cbd5e1 100%, transparent),
      radial-gradient(2.5px 2.5px at 40% 10%, #38bdf8 80%, transparent),
      radial-gradient(2px 2px at 80% 40%, #ffffff 100%, transparent);
    background-size: 300px 300px;
    opacity: 0.4;
    animation: starParallax 80s linear infinite reverse;
  }

  @keyframes starParallax {
    from { transform: translateY(0); }
    to { transform: translateY(-400px); }
  }

  /* --- Orbes de Gas Lumínico (Estilo de la imagen de referencia) --- */
  .nebula {
    position: fixed;
    border-radius: 50%;
    filter: blur(150px);
    pointer-events: none;
    opacity: 0.32;
    z-index: 0;
    will-change: transform;
  }

  /* Tonos violetas y azules mezclados con precisión matemática */
  .nebula-cyan {
    top: 15%;
    left: -10%;
    width: 650px;
    height: 600px;
    background: radial-gradient(circle, #2563eb 0%, #1d4ed8 40%, transparent 70%);
    animation: drift1 40s ease-in-out infinite;
  }

  .nebula-magenta {
    top: 40%;
    right: -15%;
    width: 550px;
    height: 600px;
    background: radial-gradient(circle, #7c3aed 0%, #6d28d9 50%, transparent 75%);
    animation: drift2 45s ease-in-out infinite;
  }

  .nebula-indigo {
    bottom: -10%;
    left: 20%;
    width: 700px;
    height: 550px;
    background: radial-gradient(circle, #4f46e5 0%, #3730a3 40%, transparent 70%);
    animation: drift3 50s ease-in-out infinite;
  }

  /* Desplazamientos fluidos lentos que emulan gas nebuloso real */
  @keyframes drift1 {
    0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
    50%      { transform: translate(60px, 40px) scale(1.1) rotate(45deg); }
  }
  @keyframes drift2 {
    0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
    50%      { transform: translate(-50px, -30px) scale(1.08) rotate(-40deg); }
  }
  @keyframes drift3 {
    0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
    50%      { transform: translate(40px, -60px) scale(1.05) rotate(30deg); }
  }

  /* --- Chasis Glassmorphism de Alta Fidelidad --- */
  .app-shell {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 540px;
    padding: 3.5rem 3rem;
    display: flex;
    flex-direction: column;
    gap: 2.25rem;
    
    background: rgba(10, 8, 20, 0.45);
    backdrop-filter: blur(45px);
    -webkit-backdrop-filter: blur(45px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 32px;
    box-shadow: 
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 40px 80px -20px rgba(0, 0, 0, 0.8),
      inset 0 1px 0px rgba(255, 255, 255, 0.08);
  }

  .glass-glare {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 45%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, transparent 60%);
    border-radius: 32px 32px 0 0;
    pointer-events: none;
  }

  /* --- Encabezado Editorial --- */
  .app-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
  }

  .brand-group {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }

  .icon-frame {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    color: var(--accent);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  }

  .icon-frame svg {
    width: 24px;
    height: 24px;
    filter: drop-shadow(0 0 8px var(--accent-glow));
  }

  h1 {
    font-family: var(--font-display);
    font-size: 2.35rem;
    font-weight: 400;
    margin: 0;
    letter-spacing: -0.01em;
    background: linear-gradient(180deg, #ffffff 30%, #a5b4fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .app-tagline {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.725rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  /* --- Área de Componentes --- */
  .interactive-zone {
    position: relative;
    z-index: 2;
  }

  .stage {
    width: 100%;
    min-height: 200px;
    display: flex;
    flex-direction: column;
  }

  .stage-centered {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
  }

  .fade-in-render {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    animation: layoutReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes layoutReveal {
    from { opacity: 0; transform: scale(0.99) translateY(4px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  .history-dock {
    border-top: 1px solid rgba(255, 255, 255, 0.04);
    padding-top: 1.5rem;
  }

  /* --- Pie de Página --- */
  .app-credit {
    padding-top: 1rem;
    text-align: center;
    color: var(--text-muted);
    font-size: 0.75rem;
    font-weight: 500;
  }

  .app-credit a {
    color: var(--text-soft);
    text-decoration: none;
    font-weight: 600;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 1px;
    transition: all 0.2s ease;
  }

  .app-credit a:hover {
    color: var(--text-main);
    border-bottom-color: var(--text-main);
  }

  /* --- Adaptabilidad Móvil --- */
  @media (max-width: 640px) {
    .sky-canvas {
      padding: 1.5rem 0.5rem;
    }
    .app-shell {
      padding: 2.5rem 1.5rem;
      border-radius: 24px;
      gap: 1.75rem;
    }
    h1 { font-size: 2rem; }
    .icon-frame { width: 38px; height: 38px; }
    .icon-frame svg { width: 20px; height: 20px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .nebula { animation: none; }
    .starfield-layer-1, .starfield-layer-2 { animation: none; }
    .fade-in-render { animation: none; }
  }
</style>