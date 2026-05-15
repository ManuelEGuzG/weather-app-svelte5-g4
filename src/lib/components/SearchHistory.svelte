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

  <!--
    {#each} es la sintaxis de bloques de Svelte para iterar.
    Le pasamos un key (item.id) para que el compilador pueda
    actualizar solo los elementos que cambian en lugar de re-renderizar todo.
  -->
  <ul class="chip-list">
    {#each history as item (item.id)}
      <li>
        <button
          class="chip"
          onclick={() => onSelect(item.city)}
          aria-label={`Buscar de nuevo ${item.city}`}
        >
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
    margin-top: 2rem;
  }

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
    gap: 0.375rem;
    padding: 0.5rem 0.875rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 999px;
    color: var(--text);
    font-family: var(--font-body);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .chip:hover {
    background: rgba(255, 184, 77, 0.15);
    border-color: var(--accent);
    transform: translateY(-1px);
  }

  .chip-city {
    font-weight: 500;
  }

  .chip-country {
    font-size: 0.75rem;
    color: var(--text-soft);
    padding: 0.125rem 0.375rem;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 4px;
  }
</style>
