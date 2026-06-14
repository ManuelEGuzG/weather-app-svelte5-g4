<script>
  let { forecast } = $props();

  const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  function dayLabel(date, index) {
    if (index === 0) return 'Mañana';
    return DAYS_SHORT[date.getDay()]; // getDay local es más seguro si la API ya procesó la fecha
  }

  function shortDate(date) {
    return `${date.getDate()}/${date.getMonth() + 1}`;
  }
</script>

<section class="forecast" aria-label="Pronóstico de los próximos 5 días">
  <h3>Próximos 5 días</h3>
  
  <div class="forecast-scroll-container">
    <ul class="forecast-grid">
      {#each forecast as day, i (day.dayKey || i)}
        <li class="day-card" style="animation-delay: {i * 60}ms">
          <span class="day-name">{dayLabel(day.date, i)}</span>
          <span class="day-date">{shortDate(day.date)}</span>
          
          <div class="icon-wrapper">
            <img
              src={day.iconUrl}
              alt={day.description}
              class="day-icon"
              width="56"
              height="56"
            />
          </div>
          
          <div class="day-temp">
            <span class="day-max">{Math.round(day.tempMax)}°</span>
            <span class="day-min">{Math.round(day.tempMin)}°</span>
          </div>
        </li>
      {/each}
    </ul>
  </div>
</section>

<style>
  .forecast {
    margin-top: 1rem;
    padding-top: 1rem;
  }

  h3 {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-soft);
    margin: 0 0 1rem 0;
  }

  /* --- Contenedor de Scroll Inteligente --- */
  .forecast-scroll-container {
    width: 100%;
    overflow-x: auto;
    scrollbar-width: none; /* Oculta scrollbar en Firefox */
    -webkit-overflow-scrolling: touch;
    padding: 0.25rem 0; /* Espacio para que el efecto hover no se corte */
  }

  .forecast-scroll-container::-webkit-scrollbar {
    display: none; /* Oculta scrollbar en Chrome/Safari */
  }

  /* --- Grid Bento --- */
  .forecast-grid {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.65rem;
  }

  /* --- Tarjeta Individual de Día --- */
  .day-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    padding: 1rem 0.5rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 18px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    opacity: 0;
    animation: fadeUpStagger 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.02);
    transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
  }

  @keyframes fadeUpStagger {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Hover adaptativo con la variable global del clima */
  .day-card:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: var(--accent);
    transform: translateY(-2px);
  }

  .day-name {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-main, #ffffff);
  }

  .day-date {
    font-size: 0.7rem;
    color: var(--text-soft);
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50px;
    margin: 0.15rem 0;
  }

  .day-icon {
    width: 52px;
    height: 52px;
    object-fit: contain;
    filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.15));
    transition: transform 0.2s ease;
  }

  .day-card:hover .day-icon {
    transform: scale(1.08);
  }

  /* --- Bloque de Temperatura --- */
  .day-temp {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    font-variant-numeric: tabular-nums;
    margin-top: 0.15rem;
  }

  .day-max {
    font-size: 1.05rem;
    font-weight: 700;
    color: #ffffff; /* Blanco limpio para unificar la estética bento */
    line-height: 1;
  }

  .day-min {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-soft);
    line-height: 1;
  }

  /* --- Ajustes Responsivos Móviles --- */
  @media (max-width: 580px) {
    /* Forzar scroll horizontal fluido en pantallas compactas sin romper columnas */
    .forecast-grid {
      display: flex;
      gap: 0.6rem;
    }
    
    .day-card {
      flex: 0 0 calc(20% - 0.5rem);
      min-width: 78px;
      padding: 0.85rem 0.35rem;
      border-radius: 14px;
    }

    .day-max { font-size: 1rem; }
    .day-min { font-size: 0.8rem; }
  }

  @media (prefers-reduced-motion: reduce) {
    .day-card {
      animation: none;
      opacity: 1;
      transform: none;
    }
    .day-card:hover .day-icon {
      transform: none;
    }
  }
</style>