<script>
  let { weather } = $props();

  // $derived: valor computado a partir de la prop weather.
  // Se recalcula automáticamente si weather cambia.
  // Aquí formateamos el nombre completo de la ciudad.
  const fullName = $derived(
    weather.country ? `${weather.city}, ${weather.country}` : weather.city
  );

  // Otro $derived: capitalizamos la descripción ("nubes dispersas" → "Nubes dispersas").
  const descriptionCap = $derived(
    weather.description.charAt(0).toUpperCase() + weather.description.slice(1)
  );
</script>

<article class="card">
  <header class="card-header">
    <div>
      <h2>{fullName}</h2>
      <p class="description">{descriptionCap}</p>
    </div>
    <img
      src={weather.iconUrl}
      alt={weather.description}
      class="icon"
      width="120"
      height="120"
    />
  </header>

  <div class="temperature">
    <span class="temp-value">{weather.temperature}</span>
    <span class="temp-unit">°C</span>
  </div>
  <p class="feels-like">Sensación térmica: {weather.feelsLike}°C</p>

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
        <span class="detail-value">{weather.windSpeed} m/s</span>
      </div>
    </div>
  </div>
</article>

<style>
  .card {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.08) 0%,
      rgba(255, 255, 255, 0.03) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 24px;
    padding: 2rem;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: fadeUp 0.45s ease-out;
  }

  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .card-header h2 {
    font-family: var(--font-display);
    font-size: clamp(1.5rem, 4vw, 2rem);
    font-weight: 600;
    margin: 0 0 0.25rem 0;
    letter-spacing: -0.02em;
  }

  .description {
    margin: 0;
    color: var(--text-soft);
    font-size: 1rem;
  }

  .icon {
    width: 120px;
    height: 120px;
    object-fit: contain;
    filter: drop-shadow(0 8px 24px rgba(255, 184, 77, 0.3));
    margin: -1rem -0.5rem -1rem 0;
  }

  .temperature {
    display: flex;
    align-items: flex-start;
    gap: 0.25rem;
    margin-top: 0.5rem;
  }

  .temp-value {
    font-family: var(--font-display);
    font-size: clamp(4.5rem, 14vw, 6.5rem);
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

  .feels-like {
    margin: 0 0 1.5rem 0;
    color: var(--text-soft);
    font-size: 0.95rem;
  }

  .details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .detail {
    display: flex;
    align-items: center;
    gap: 0.875rem;
  }

  .detail svg {
    width: 24px;
    height: 24px;
    color: var(--accent);
    flex-shrink: 0;
  }

  .detail-label {
    display: block;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-soft);
    margin-bottom: 0.125rem;
  }

  .detail-value {
    display: block;
    font-size: 1.125rem;
    font-weight: 600;
  }

  @media (max-width: 480px) {
    .card {
      padding: 1.5rem;
    }
    .icon {
      width: 90px;
      height: 90px;
    }
    .details {
      grid-template-columns: 1fr;
    }
  }
</style>
