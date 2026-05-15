<script>
  let { history, onSelect, onClear } = $props();
</script>

<section class="history" aria-label="Historial de búsquedas">
  <header class="history-header">
    <h3>Búsquedas recientes</h3>
    <button class="clear-btn" onclick={onClear} aria-label="Limpiar historial">
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
  .history { margin-top: 2rem; }

  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 0.875rem;
  }

  h3 {
    font-family: var(--font-body);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--text-soft);
    margin: 0;
  }

  .clear-btn {
    background: none;
    border: none;
    color: var(--text-soft);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    transition: color 0.2s ease, background 0.2s ease;
  }

  .clear-btn:hover {
    color: var(--text);
    background: rgba(255, 255, 255, 0.06);
  }

  .chip-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.875rem;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 999px;
    color: var(--text);
    font-family: var(--font-body);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .chip svg {
    width: 14px;
    height: 14px;
    color: var(--accent);
  }

  .chip:hover {
    background: rgba(255, 184, 77, 0.18);
    border-color: var(--accent);
    transform: translateY(-1px);
  }

  .chip-city { font-weight: 500; }

  .chip-country {
    font-size: 0.7rem;
    color: var(--text-soft);
    padding: 0.125rem 0.375rem;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
</style>
