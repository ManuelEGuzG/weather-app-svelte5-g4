<script>
  let { forecast } = $props();

  const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  function dayLabel(date, index) {
    if (index === 0) return 'Mañana';
    return DAYS_SHORT[date.getUTCDay()];
  }

  function shortDate(date) {
    return `${date.getUTCDate()}/${date.getUTCMonth() + 1}`;
  }
</script>

<section class="forecast" aria-label="Pronóstico de los próximos 5 días">
  <h3>Próximos 5 días</h3>
  <ul class="forecast-grid">
    {#each forecast as day, i (day.dayKey)}
      <li class="day-card" style="animation-delay: {i * 60}ms">
        <span class="day-name">{dayLabel(day.date, i)}</span>
        <span class="day-date">{shortDate(day.date)}</span>
        <img
          src={day.iconUrl}
          alt={day.description}
          class="day-icon"
          width="56"
          height="56"
        />
        <span class="day-temp">
          <span class="day-max">{day.tempMax}°</span>
          <span class="day-min">{day.tempMin}°</span>
        </span>
      </li>
    {/each}
  </ul>
</section>

<style>
  .forecast {
    margin-top: 2rem;
  }

  h3 {
    font-family: var(--font-body);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--text-soft);
    margin: 0 0 0.875rem 0;
  }

  .forecast-grid {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.5rem;
  }

  .day-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.875rem 0.5rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
    opacity: 0;
    animation: fadeUpStagger 0.4s ease-out forwards;
  }

  @keyframes fadeUpStagger {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .day-card:hover {
    background: rgba(255, 184, 77, 0.1);
    border-color: rgba(255, 184, 77, 0.4);
    transform: translateY(-3px);
  }

  .day-name {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text);
  }

  .day-date {
    font-size: 0.7rem;
    color: var(--text-soft);
    font-variant-numeric: tabular-nums;
  }

  .day-icon {
    width: 56px;
    height: 56px;
    object-fit: contain;
    margin: -0.25rem 0;
    filter: drop-shadow(0 4px 12px rgba(255, 184, 77, 0.2));
  }

  .day-temp {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.125rem;
    font-variant-numeric: tabular-nums;
  }

  .day-max {
    font-size: 1.05rem;
    font-weight: 600;
    color: #ff9966;
    line-height: 1;
  }

  .day-min {
    font-size: 0.85rem;
    color: #7ec8ff;
    line-height: 1;
  }

  /* En pantallas pequeñas pasamos a scroll horizontal para no apretar tanto */
  @media (max-width: 480px) {
    .forecast-grid {
      grid-template-columns: repeat(5, minmax(72px, 1fr));
    }
    .day-card { padding: 0.75rem 0.25rem; }
    .day-icon { width: 48px; height: 48px; }
    .day-name { font-size: 0.7rem; }
  }
</style>
