<script>
  import { searchCities } from '../services/weatherApi.js';
  import { clickOutside } from '../actions/clickOutside.js';

  let { onSelectCity, onSearchName, disabled = false } = $props();

  // --- ESTADO LOCAL ---
  let query = $state('');
  let suggestions = $state([]);
  let isOpen = $state(false);
  let highlightedIndex = $state(-1);
  let loadingSuggestions = $state(false);

  // --- $derived: hay resultados que mostrar? ---
  const hasSuggestions = $derived(suggestions.length > 0);

  /**
   * $effect con CLEANUP FUNCTION — característica clave de Svelte 5.
   *
   * Cada vez que `query` cambia, se ejecuta este efecto. La función
   * que retorna se ejecuta ANTES del próximo run o al desmontar el componente,
   * lo que nos permite implementar debounce + cancelación de fetch.
   *
   * Patrón clásico que en React necesitaría useEffect + AbortController + cleanup,
   * aquí queda en 15 líneas idiomáticas.
   */
  $effect(() => {
    const trimmed = query.trim();

    // No buscar con menos de 2 caracteres.
    if (trimmed.length < 2) {
      suggestions = [];
      loadingSuggestions = false;
      return;
    }

    loadingSuggestions = true;
    const controller = new AbortController();

    // Debounce de 300ms: solo dispara el fetch si el usuario deja de teclear.
    const timer = setTimeout(async () => {
      try {
        const results = await searchCities(trimmed, controller.signal);
        suggestions = results;
        highlightedIndex = -1;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Error al buscar sugerencias:', err);
          suggestions = [];
        }
      } finally {
        loadingSuggestions = false;
      }
    }, 300);

    // CLEANUP: cancela el timer y el fetch si query cambia antes.
    // Esto evita race conditions y peticiones obsoletas.
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  });

  function handleFocus() {
    if (query.trim().length >= 2) {
      isOpen = true;
    }
  }

  function handleInput() {
    isOpen = true;
  }

  function handleClose() {
    isOpen = false;
    highlightedIndex = -1;
  }

  function selectSuggestion(city) {
    query = '';
    suggestions = [];
    isOpen = false;
    highlightedIndex = -1;
    onSelectCity(city);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!query.trim() || disabled) return;

    // Si hay sugerencias y una está resaltada, úsala.
    if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
      selectSuggestion(suggestions[highlightedIndex]);
      return;
    }
    // Si hay sugerencias pero ninguna resaltada, usar la primera.
    if (suggestions.length > 0) {
      selectSuggestion(suggestions[0]);
      return;
    }
    // Fallback: buscar por nombre directo.
    onSearchName(query);
    query = '';
    isOpen = false;
  }

  /**
   * Navegación por teclado para accesibilidad.
   */
  function handleKeydown(event) {
    if (!isOpen || suggestions.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      highlightedIndex = (highlightedIndex + 1) % suggestions.length;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      highlightedIndex = highlightedIndex <= 0
        ? suggestions.length - 1
        : highlightedIndex - 1;
    } else if (event.key === 'Escape') {
      handleClose();
    }
  }
</script>

<!--
  use:clickOutside es una ACCIÓN SVELTE personalizada.
  Cierra el dropdown cuando el usuario hace click fuera del componente.
-->
<div class="search-wrap" use:clickOutside={handleClose}>
  <form class="search" onsubmit={handleSubmit} role="search">
    <div class="input-wrap">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        role="combobox"
        bind:value={query}
        oninput={handleInput}
        onfocus={handleFocus}
        onkeydown={handleKeydown}
        placeholder="Busca una ciudad…"
        aria-label="Nombre de la ciudad"
        aria-autocomplete="list"
        aria-expanded={isOpen && hasSuggestions}
        aria-controls="city-suggestions"
        {disabled}
        autocomplete="off"
      />
      {#if loadingSuggestions}
        <div class="mini-spinner" aria-hidden="true"></div>
      {/if}
    </div>
    <button type="submit" {disabled} aria-label="Buscar">
      <span>Buscar</span>
    </button>
  </form>

  {#if isOpen && hasSuggestions}
    <ul
      id="city-suggestions"
      class="suggestions"
      role="listbox"
      aria-label="Sugerencias de ciudades"
    >
      {#each suggestions as city, index (city.id)}
        <li>
          <button
            type="button"
            class="suggestion"
            class:highlighted={index === highlightedIndex}
            onclick={() => selectSuggestion(city)}
            onmouseenter={() => (highlightedIndex = index)}
            role="option"
            aria-selected={index === highlightedIndex}
          >
            <svg class="pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <div class="suggestion-text">
              <span class="suggestion-name">{city.name}</span>
              <span class="suggestion-region">
                {#if city.state}{city.state}, {/if}{city.country}
              </span>
            </div>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .search-wrap {
    position: relative;
    width: 100%;
  }

  .search {
    display: flex;
    gap: 0.5rem;
    width: 100%;
  }

  .input-wrap {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: 1rem;
    width: 18px;
    height: 18px;
    color: var(--text-soft);
    pointer-events: none;
  }

  input {
    width: 100%;
    padding: 0.875rem 2.75rem 0.875rem 2.875rem;
    font-family: var(--font-body);
    font-size: 1rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 14px;
    color: var(--text);
    transition: all 0.2s ease;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  input::placeholder {
    color: var(--text-soft);
  }

  input:focus {
    outline: none;
    border-color: var(--accent);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 4px rgba(255, 184, 77, 0.18);
  }

  input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .mini-spinner {
    position: absolute;
    right: 0.875rem;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  button[type="submit"] {
    padding: 0 1.5rem;
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 0.95rem;
    background: var(--accent);
    color: #1a1a2e;
    border: none;
    border-radius: 14px;
    cursor: pointer;
    transition: transform 0.15s ease, background 0.2s ease, box-shadow 0.2s ease;
  }

  button[type="submit"]:hover:not(:disabled) {
    background: var(--accent-strong);
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(255, 184, 77, 0.35);
  }

  button[type="submit"]:active:not(:disabled) {
    transform: translateY(0);
  }

  button[type="submit"]:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .suggestions {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 0;
    right: 0;
    list-style: none;
    padding: 0.375rem;
    margin: 0;
    background: rgba(26, 26, 46, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 14px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    z-index: 50;
    animation: dropIn 0.18s ease-out;
  }

  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .suggestions li {
    margin: 0;
  }

  .suggestion {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 0.875rem;
    background: transparent;
    border: none;
    border-radius: 10px;
    color: var(--text);
    text-align: left;
    cursor: pointer;
    font-family: var(--font-body);
    transition: background 0.15s ease;
  }

  .suggestion:hover,
  .suggestion.highlighted {
    background: rgba(255, 184, 77, 0.15);
  }

  .pin {
    width: 18px;
    height: 18px;
    color: var(--accent);
    flex-shrink: 0;
  }

  .suggestion-text {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    flex: 1;
    min-width: 0;
  }

  .suggestion-name {
    font-size: 0.95rem;
    font-weight: 500;
  }

  .suggestion-region {
    font-size: 0.8rem;
    color: var(--text-soft);
  }

  /* En móviles ocultamos el texto del botón para ganar espacio */
  @media (max-width: 480px) {
    button[type="submit"] span {
      display: none;
    }
    button[type="submit"] {
      padding: 0 1.125rem;
    }
    button[type="submit"]::after {
      content: '→';
      font-size: 1.25rem;
      font-weight: 600;
    }
  }
</style>
