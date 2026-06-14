<script>
  let { weather } = $props();

  // Reloj local que se actualiza cada minuto.
  let now = $state(Date.now());

  $effect(() => {
    const interval = setInterval(() => {
      now = Date.now();
    }, 60000);
    return () => clearInterval(interval);
  });

  // --- VALORES DERIVADOS ---

  const fullName = $derived(
    weather.country ? `${weather.city}, ${weather.country}` : weather.city
  );

  const descriptionCap = $derived(
    weather.description.charAt(0).toUpperCase() + weather.description.slice(1)
  );

  /**
   * Hora y fecha local de la ciudad calculada correctamente usando UTC puro
   * más el desfase (offset) de segundos entregado por OpenWeatherMap.
   */
  const cityDateObj = $derived.by(() => {
    // Calculamos los milisegundos en UTC actuales y sumamos el offset de la ciudad
    const localUtcMillis = now + (new Date().getTimezoneOffset() * 60000);
    return new Date(localUtcMillis + (weather.timezone * 1000));
  });

  const localTime = $derived(formatTime(cityDateObj));
  const localDate = $derived(formatDate(cityDateObj));

  const sunriseStr = $derived.by(() => {
    const localUtcMillis = (weather.sunrise * 1000) + (new Date().getTimezoneOffset() * 60000);
    return formatTime(new Date(localUtcMillis + (weather.timezone * 1000)));
  });

  const sunsetStr = $derived.by(() => {
    const localUtcMillis = (weather.sunset * 1000) + (new Date().getTimezoneOffset() * 60000);
    return formatTime(new Date(localUtcMillis + (weather.timezone * 1000)));
  });

  // Visibilidad en km, con un decimal.
  const visibilityKm = $derived((weather.visibility / 1000).toFixed(1));

  // Dirección del viento en texto cardinal.
  const windDir = $derived(degreesToCardinal(weather.windDeg));

  function formatTime(date) {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  function formatDate(date) {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${days[date.getDay()]} ${date.getDate()}, ${months[date.getMonth()]}`;
  }

  function degreesToCardinal(deg) {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    return dirs[Math.round(((deg % 360) / 45)) % 8];
  }
</script>

<article class="card">
  <header class="card-header">
    <div class="location">
      <h2>{fullName}</h2>
      <p class="local-date">{localDate}</p>
    </div>
    <div class="local-time" aria-label="Hora local">
      <span class="time-value">{localTime}</span>
      <span class="time-label">Hora local</span>
    </div>
  </header>

  <div class="hero">
    <div class="temp-block">
      <div class="temperature">
        <span class="temp-value">{Math.round(weather.temperature)}</span>
        <span class="temp-unit">°C</span>
      </div>
      <p class="description">{descriptionCap}</p>
      <p class="feels-like">
        Sensación térmica: <strong>{Math.round(weather.feelsLike)}°C</strong>
      </p>
      <p class="minmax">
        <span class="up">↑ {Math.round(weather.tempMax)}°</span>
        <span class="down">↓ {Math.round(weather.tempMin)}°</span>
      </p>
    </div>
    <div class="icon-container">
      <img
        src={weather.iconUrl}
        alt={weather.description}
        class="icon"
        width="160"
        height="160"
      />
    </div>
  </div>

  <div class="details-grid">
    <div class="detail-box">
      <div class="detail-icon-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
        </svg>
        <span class="detail-label">Humedad</span>
      </div>
      <span class="detail-value">{weather.humidity}%</span>
    </div>

    <div class="detail-box">
      <div class="detail-icon-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
        </svg>
        <span class="detail-label">Viento</span>
      </div>
      <span class="detail-value">{weather.windSpeed} <span class="unit">m/s</span> · <span class="dir">{windDir}</span></span>
    </div>

    <div class="detail-box">
      <div class="detail-icon-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="6" x2="12" y2="12" />
          <line x1="12" y1="12" x2="16" y2="14" />
        </svg>
        <span class="detail-label">Presión</span>
      </div>
      <span class="detail-value">{weather.pressure} <span class="unit">hPa</span></span>
    </div>

    <div class="detail-box">
      <div class="detail-icon-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <span class="detail-label">Visibilidad</span>
      </div>
      <span class="detail-value">{visibilityKm} <span class="unit">km</span></span>
    </div>

    <div class="detail-box sun-rise">
      <div class="detail-icon-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M17 18a5 5 0 0 0-10 0" />
          <line x1="12" y1="2" x2="12" y2="9" />
          <polyline points="8 6 12 2 16 6" />
        </svg>
        <span class="detail-label">Amanecer</span>
      </div>
      <span class="detail-value">{sunriseStr}</span>
    </div>

    <div class="detail-box sun-set">
      <div class="detail-icon-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M17 18a5 5 0 0 0-10 0" />
          <line x1="12" y1="9" x2="12" y2="2" />
          <polyline points="16 5 12 9 8 5" />
        </svg>
        <span class="detail-label">Atardecer</span>
      </div>
      <span class="detail-value">{sunsetStr}</span>
    </div>
  </div>
</article>

<style>
  /* --- Contenedor de la Tarjeta --- */
  .card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 24px;
    padding: 2.25rem;
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
    animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* --- Cabecera --- */
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1.5rem;
    margin-bottom: 1rem;
  }

  .location h2 {
    font-size: clamp(1.6rem, 5vw, 2.25rem);
    font-weight: 700;
    margin: 0 0 0.35rem 0;
    letter-spacing: -0.02em;
    line-height: 1.15;
    background: linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .local-date {
    margin: 0;
    color: var(--text-soft);
    font-size: 0.85rem;
    font-weight: 500;
  }

  .local-time {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    background: rgba(255, 255, 255, 0.05);
    padding: 0.5rem 0.85rem;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .time-value {
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--text-main);
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .time-label {
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-soft);
    margin-top: 0.25rem;
    font-weight: 600;
  }

  /* --- Hero Principal --- */
  .hero {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
    margin-bottom: 2.25rem;
  }

  .temp-block {
    flex: 1;
  }

  .temperature {
    display: flex;
    align-items: flex-start;
  }

  .temp-value {
    font-size: clamp(4.5rem, 15vw, 6.5rem);
    font-weight: 800;
    line-height: 0.9;
    letter-spacing: -0.04em;
    background: linear-gradient(180deg, #ffffff 30%, rgba(255, 255, 255, 0.7) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .temp-unit {
    font-size: clamp(1.5rem, 4vw, 2.25rem);
    font-weight: 400;
    color: var(--text-soft);
    margin-left: 0.15rem;
  }

  .description {
    margin: 0.5rem 0 0 0;
    color: #ffffff;
    font-size: 1.2rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .feels-like {
    margin: 0.4rem 0;
    color: var(--text-soft);
    font-size: 0.9rem;
  }

  .feels-like strong {
    color: #ffffff;
    font-weight: 600;
  }

  .minmax {
    display: flex;
    gap: 1rem;
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .minmax .up { color: #f97316; }
  .minmax .down { color: #38bdf8; }

  /* Animación sutil de respiración en el icono */
  .icon-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon {
    width: 150px;
    height: 150px;
    object-fit: contain;
    filter: drop-shadow(0 8px 24px rgba(255, 255, 255, 0.15));
    animation: pulseIcon 4s ease-in-out infinite;
  }

  @keyframes pulseIcon {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  /* --- Grid Estilo Bento --- */
  .details-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.85rem;
  }

  .detail-box {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 1rem 1.25rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 0.75rem;
    transition: background 0.3s ease, border-color 0.3s ease;
  }

  .detail-box:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .detail-icon-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .detail-icon-title svg {
    width: 18px;
    height: 18px;
    color: var(--text-soft);
  }

  .detail-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-soft);
    letter-spacing: 0.02em;
  }

  .detail-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: #ffffff;
    font-variant-numeric: tabular-nums;
    line-height: 1.1;
  }

  .detail-value .unit {
    font-size: 0.9rem;
    color: var(--text-soft);
    font-weight: 500;
  }

  .detail-value .dir {
    font-size: 1rem;
    color: var(--accent);
  }

  /* Variaciones de Color de Iconos */
  .sun-rise svg { color: #fb923c !important; }
  .sun-set svg { color: #c084fc !important; }

  /* --- Ajustes Responsivos --- */
  @media (max-width: 540px) {
    .card { padding: 1.5rem; border-radius: 20px; }
    .hero { gap: 1rem; }
    .icon { width: 110px; height: 110px; }
    .details-grid { grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .detail-box { padding: 0.85rem 1rem; }
    .detail-value { font-size: 1.15rem; }
  }

  @media (max-width: 400px) {
    .card-header { flex-direction: column; align-items: stretch; gap: 1rem; }
    .local-time { align-items: center; }
    .details-grid { grid-template-columns: 1fr; } /* Columna única en móviles pequeños */
  }
</style>