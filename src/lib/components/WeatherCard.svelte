<script>
  let { weather } = $props();

  // Reloj local que se actualiza cada minuto.
  // $state inicial + $effect con setInterval.
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
   * Hora local de la ciudad: combinamos el "now" actual del navegador
   * con el offset de timezone que envía la API.
   */
  const localTime = $derived.by(() => {
    const local = new Date(now + weather.timezone * 1000 - new Date().getTimezoneOffset() * 60000 * 0);
    // Trabajamos en UTC y le sumamos el offset manualmente para evitar
    // que el navegador re-aplique su propia timezone.
    const utc = now;
    const cityTime = new Date(utc + weather.timezone * 1000);
    return formatTime(cityTime);
  });

  const localDate = $derived.by(() => {
    const cityTime = new Date(now + weather.timezone * 1000);
    return formatDate(cityTime);
  });

  const sunriseStr = $derived(
    formatTime(new Date((weather.sunrise + weather.timezone) * 1000))
  );

  const sunsetStr = $derived(
    formatTime(new Date((weather.sunset + weather.timezone) * 1000))
  );

  // Visibilidad en km, con un decimal.
  const visibilityKm = $derived((weather.visibility / 1000).toFixed(1));

  // Dirección del viento en texto cardinal.
  const windDir = $derived(degreesToCardinal(weather.windDeg));

  function formatTime(date) {
    // Usamos getUTC* porque ya aplicamos el offset manualmente arriba.
    const h = String(date.getUTCHours()).padStart(2, '0');
    const m = String(date.getUTCMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  function formatDate(date) {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${days[date.getUTCDay()]}, ${date.getUTCDate()} de ${months[date.getUTCMonth()]}`;
  }

  function degreesToCardinal(deg) {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    return dirs[Math.round(((deg % 360) / 45)) % 8];
  }
</script>

<article class="card">
  <!-- Cabecera: ciudad + hora local -->
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

  <!-- Hero: temperatura + icono -->
  <div class="hero">
    <div class="temp-block">
      <div class="temperature">
        <span class="temp-value">{weather.temperature}</span>
        <span class="temp-unit">°C</span>
      </div>
      <p class="description">{descriptionCap}</p>
      <p class="feels-like">
        Sensación térmica: <strong>{weather.feelsLike}°C</strong>
      </p>
      <p class="minmax">
        <span class="up">↑ {weather.tempMax}°</span>
        <span class="down">↓ {weather.tempMin}°</span>
      </p>
    </div>
    <img
      src={weather.iconUrl}
      alt={weather.description}
      class="icon"
      width="160"
      height="160"
    />
  </div>

  <!-- Detalles en grid -->
  <div class="details">
    <div class="detail">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
      </svg>
      <div>
        <span class="detail-label">Humedad</span>
        <span class="detail-value">{weather.humidity}%</span>
      </div>
    </div>

    <div class="detail">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
      </svg>
      <div>
        <span class="detail-label">Viento</span>
        <span class="detail-value">{weather.windSpeed} m/s · {windDir}</span>
      </div>
    </div>

    <div class="detail">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="6" x2="12" y2="12" />
        <line x1="12" y1="12" x2="16" y2="14" />
      </svg>
      <div>
        <span class="detail-label">Presión</span>
        <span class="detail-value">{weather.pressure} hPa</span>
      </div>
    </div>

    <div class="detail">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <div>
        <span class="detail-label">Visibilidad</span>
        <span class="detail-value">{visibilityKm} km</span>
      </div>
    </div>

    <div class="detail sunrise">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M17 18a5 5 0 0 0-10 0" />
        <line x1="12" y1="2" x2="12" y2="9" />
        <line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
        <line x1="1" y1="18" x2="3" y2="18" />
        <line x1="21" y1="18" x2="23" y2="18" />
        <line x1="18.36" y1="11.64" x2="19.78" y2="10.22" />
        <line x1="23" y1="22" x2="1" y2="22" />
        <polyline points="8 6 12 2 16 6" />
      </svg>
      <div>
        <span class="detail-label">Amanecer</span>
        <span class="detail-value">{sunriseStr}</span>
      </div>
    </div>

    <div class="detail sunset">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M17 18a5 5 0 0 0-10 0" />
        <line x1="12" y1="9" x2="12" y2="2" />
        <line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
        <line x1="1" y1="18" x2="3" y2="18" />
        <line x1="21" y1="18" x2="23" y2="18" />
        <line x1="18.36" y1="11.64" x2="19.78" y2="10.22" />
        <line x1="23" y1="22" x2="1" y2="22" />
        <polyline points="16 5 12 9 8 5" />
      </svg>
      <div>
        <span class="detail-label">Atardecer</span>
        <span class="detail-value">{sunsetStr}</span>
      </div>
    </div>
  </div>
</article>

<style>
  .card {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.14) 0%,
      rgba(255, 255, 255, 0.05) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 28px;
    padding: 2rem;
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    animation: fadeUp 0.5s cubic-bezier(0.21, 1, 0.32, 1);
  }

  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* --- Cabecera --- */
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  .location h2 {
    font-family: var(--font-display);
    font-size: clamp(1.5rem, 4.5vw, 2.125rem);
    font-weight: 500;
    margin: 0 0 0.25rem 0;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  .local-date {
    margin: 0;
    color: var(--text-soft);
    font-size: 0.85rem;
    text-transform: capitalize;
  }

  .local-time {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: right;
  }

  .time-value {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 500;
    color: var(--accent);
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .time-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-soft);
    margin-top: 0.25rem;
  }

  /* --- Hero --- */
  .hero {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin: 0.5rem 0 1.5rem;
  }

  .temp-block {
    flex: 1;
    min-width: 0;
  }

  .temperature {
    display: flex;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .temp-value {
    font-family: var(--font-display);
    font-size: clamp(4.5rem, 16vw, 7rem);
    font-weight: 200;
    line-height: 1;
    letter-spacing: -0.04em;
    background: linear-gradient(135deg, var(--accent) 0%, #ffd28d 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .temp-unit {
    font-family: var(--font-display);
    font-size: clamp(1.5rem, 4vw, 2rem);
    font-weight: 300;
    margin-top: 0.75rem;
    color: var(--text-soft);
  }

  .description {
    margin: 0;
    color: var(--text);
    font-size: 1.05rem;
    font-weight: 500;
  }

  .feels-like {
    margin: 0.375rem 0 0.25rem 0;
    color: var(--text-soft);
    font-size: 0.9rem;
  }

  .feels-like strong {
    color: var(--text);
    font-weight: 500;
  }

  .minmax {
    display: flex;
    gap: 0.875rem;
    margin: 0.5rem 0 0 0;
    font-size: 0.95rem;
    font-variant-numeric: tabular-nums;
  }

  .minmax .up { color: #ff9966; }
  .minmax .down { color: #7ec8ff; }

  .icon {
    width: 160px;
    height: 160px;
    object-fit: contain;
    filter: drop-shadow(0 12px 32px rgba(255, 184, 77, 0.4));
    margin: -1.5rem -1rem -1.5rem 0;
    flex-shrink: 0;
  }

  /* --- Detalles --- */
  .details {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem 1.25rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
  }

  .detail {
    display: flex;
    align-items: center;
    gap: 0.875rem;
  }

  .detail svg {
    width: 22px;
    height: 22px;
    color: var(--accent);
    flex-shrink: 0;
  }

  .sunrise svg { color: #ffaa6b; }
  .sunset svg { color: #d990ff; }

  .detail-label {
    display: block;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-soft);
    margin-bottom: 0.125rem;
  }

  .detail-value {
    display: block;
    font-size: 1rem;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }

  /* --- Responsive --- */
  @media (max-width: 520px) {
    .card { padding: 1.5rem; border-radius: 22px; }
    .icon {
      width: 110px;
      height: 110px;
      margin: -1rem -0.5rem -1rem 0;
    }
    .details {
      grid-template-columns: 1fr 1fr;
      gap: 0.875rem 1rem;
    }
  }

  @media (max-width: 380px) {
    .card-header { flex-direction: column; gap: 0.5rem; }
    .local-time { align-items: flex-start; text-align: left; flex-direction: row; gap: 0.5rem; align-items: baseline; }
  }
</style>
