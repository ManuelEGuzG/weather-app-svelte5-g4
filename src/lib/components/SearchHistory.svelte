<script>
  let { history, onSelect, onClear } = $props();
</script>

<section class="history" aria-label="Historial de búsquedas">
  <header class="history-header">
    <h3>Búsquedas recientes</h3>
    <button class="clear-btn" onclick={onClear} aria-label="Limpiar historial">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      </svg>
      Limpiar
    </button>
  </header>

  <ul class="chip-list">
    {#each history as item (item.id)}
      <li>
        <button
          class="chip"
          onclick={() => onSelect(item)}
          aria-label={`Buscar de nuevo ${item.city}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span class="chip-city">{item.city}</span>
          {#if item.country}
            <span class="chip-country">{item.country}</span>
          {/if}
        </button>
      </li>
    {/each}
  </ul>
</section>

<style>
  .history {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-soft);
    margin: 0;
  }

  /* --- Botón Limpiar Optimizado --- */
  .clear-btn {
    background: none;
    border: none;
    color: var(--text-soft);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    cursor: pointer;
    padding: 0.4rem 0.75rem;
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .clear-btn svg {
    width: 14px;
    height: 14px;
    transition: transform 0.2s ease;
  }

  .clear-btn:hover {
    color: #ef4444; /* Color de advertencia destructiva sutil */
    background: rgba(239, 68, 68, 0.08);
  }

  .clear-btn:hover svg {
    transform: scale(1.1);
  }

  .clear-btn:active {
    transform: scale(0.95);
  }

  /* --- Lista de Chips --- */
  .chip-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 100px;
    color: var(--text-main, #ffffff);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  .chip svg {
    width: 14px;
    height: 14px;
    color: var(--text-soft);
    transition: color 0.2s ease, transform 0.2s ease;
  }

  /* Hover adaptativo usando la variable de tema --accent */
  .chip:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: var(--accent);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }

  .chip:hover svg {
    color: var(--accent);
    transform: scale(1.15);
  }

  .chip:active {
    transform: translateY(0) scale(0.98);
  }

  .chip-city { 
    font-weight: 600; 
  }

  .chip-country {
    font-size: 0.65rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.7);
    padding: 0.15rem 0.4rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.04);
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  /* Ajuste para pantallas muy pequeñas */
  @media (max-width: 400px) {
    .chip {
      width: 100%;
      justify-content: flex-start;
    }
    .chip-country {
      margin-left: auto; /* Empuja el país hacia la derecha en móviles */
    }
  }
</style>