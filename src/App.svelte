<script>
  import SearchBar from './lib/components/SearchBar.svelte';
  import WeatherCard from './lib/components/WeatherCard.svelte';
  import SearchHistory from './lib/components/SearchHistory.svelte';
  import LoadingSpinner from './lib/components/LoadingSpinner.svelte';
  import ErrorMessage from './lib/components/ErrorMessage.svelte';
  import { weatherStore } from './lib/stores/weather.svelte.js';

  // Ciudad por defecto: requisito del entregable.
  // La app debe mostrar una ciudad al cargar inicialmente.
  const DEFAULT_CITY = 'San José, CR';

  // $effect: se ejecuta cuando el componente se monta.
  // Aquí lo usamos para cargar la ciudad por defecto en el primer render.
  $effect(() => {
    // Solo buscamos automáticamente si no hay nada cargado todavía.
    if (!weatherStore.currentWeather && !weatherStore.error) {
      weatherStore.search(DEFAULT_CITY);
    }
  });

  function handleSearch(city) {
    weatherStore.search(city);
  }

  function handleHistoryClick(city) {
    weatherStore.search(city);
  }

  function handleClearHistory() {
    weatherStore.clearHistory();
  }
</script>

<main class="app">
  <div class="bg-glow" aria-hidden="true"></div>

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

  <SearchBar onSearch={handleSearch} disabled={weatherStore.loading} />

  <section class="results" aria-live="polite">
    <!--
      Bloques {#if}{:else if}{:else}: la forma idiomática de Svelte
      para renderizado condicional. Equivale a if/else if/else en JS.
    -->
    {#if weatherStore.loading}
      <LoadingSpinner />
    {:else if weatherStore.error}
      <ErrorMessage message={weatherStore.error} />
    {:else if weatherStore.currentWeather}
      <WeatherCard weather={weatherStore.currentWeather} />
    {/if}
  </section>

  {#if weatherStore.hasHistory}
    <SearchHistory
      history={weatherStore.history}
      onSelect={handleHistoryClick}
      onClear={handleClearHistory}
    />
  {/if}

  <footer class="footer">
    <p>
      Datos provistos por <a href="https://openweathermap.org" target="_blank" rel="noopener noreferrer">OpenWeatherMap</a>
    </p>
  </footer>
</main>

<style>
  .app {
    position: relative;
    width: 100%;
    max-width: 560px;
    margin: 0 auto;
    padding: 2.5rem 1.25rem;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* Resplandor decorativo de fondo */
  .bg-glow {
    position: fixed;
    top: -20%;
    left: 50%;
    transform: translateX(-50%);
    width: 800px;
    height: 600px;
    background: radial-gradient(
      ellipse at center,
      rgba(255, 184, 77, 0.15) 0%,
      transparent 60%
    );
    pointer-events: none;
    z-index: -1;
    filter: blur(60px);
  }

  .header {
    margin-bottom: 2rem;
  }

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
    font-size: 1.75rem;
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
  }

  .footer a:hover {
    text-decoration: underline;
  }
</style>
