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

  // --- $derived: ¿hay resultados que mostrar? ---
  const hasSuggestions = $derived(suggestions.length > 0);

  /**
   * $effect con CLEANUP FUNCTION — reactividad nativa de Svelte 5.
   * Maneja el debounce de la entrada del usuario y cancela peticiones previas si cambia la query.
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

    // Debounce de 300ms
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

    // CLEANUP: Evita race conditions y peticiones innecesarias al servidor
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

    if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
      selectSuggestion(suggestions[highlightedIndex]);
      return;
    }
    if (suggestions.length > 0) {
      selectSuggestion(suggestions[0]);
      return;
    }
    onSearchName(query);
    query = '';
    isOpen = false;
  }

  /**
   * Accesibilidad: Navegación completa por teclado
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

<div class="search-wrap" use:clickOutside={handleClose}>
  <form class="search" onsubmit={handleSubmit} role="search">
    <div class="input-wrap">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
            <svg class="pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
    gap: 0.65rem;
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
    left: 1.15rem;
    width: 18px;
    height: 18px;
    color: var(--text-soft);
    pointer-events: none;
  }

  /* --- Input Estilo Cristalizado --- */
  input {
    width: 100%;
    padding: 0.875rem 2.75rem 0.875rem 3rem;
    font-size: 1rem;
    font-weight: 500;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    color: var(--text-main, #ffffff);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.05);
  }

  input::placeholder {
    color: var(--text-soft);
  }

  input:focus {
    outline: none;
    border-color: var(--accent);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.05), 
                0 4px 20px -2px rgba(0, 0, 0, 0.2);
  }

  input:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* --- Mini Spinner --- */
  .mini-spinner {
    position: absolute;
    right: 1.15rem;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* --- Botón de Envío Dinámico --- */
  button[type="submit"] {
    padding: 0 1.5rem;
    font-weight: 700;
    font-size: 0.95rem;
    background: #ffffff;
    color: #0f172a; /* Contraste oscuro e impecable */
    border: none;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  button[type="submit"]:hover:not(:disabled) {
    background: var(--accent);
    color: #ffffff;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }

  button[type="submit"]:active:not(:disabled) {
    transform: translateY(0);
  }

  button[type="submit"]:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-soft);
    box-shadow: none;
  }

  /* --- Desplegable Autocompletado Glassmorphism --- */
  .suggestions {
    position: absolute;
    top: calc(100% + 0.6rem);
    left: 0;
    right: 0;
    list-style: none;
    padding: 0.5rem;
    margin: 0;
    background: rgba(15, 23, 42, 0.45); /* Fondo adaptado a la oscuridad translucida */
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5),
                inset 0 1px 1px rgba(255, 255, 255, 0.05);
    z-index: 50;
    animation: dropIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-8px) scale(0.99); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .suggestions li {
    margin: 0;
  }

  /* --- Botón de Sugerencia Individual --- */
  .suggestion {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    width: 100%;
    padding: 0.8rem 1rem;
    background: transparent;
    border: none;
    border-radius: 12px;
    color: var(--text-main, #ffffff);
    text-align: left;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .suggestion:hover,
  .suggestion.highlighted {
    background: rgba(255, 255, 255, 0.06);
    outline: none;
  }

  .suggestion:hover .pin,
  .suggestion.highlighted .pin {
    color: var(--accent);
    transform: scale(1.1);
  }

  .pin {
    width: 16px;
    height: 16px;
    color: var(--text-soft);
    flex-shrink: 0;
    transition: all 0.15s ease;
  }

  .suggestion-text {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    flex: 1;
    min-width: 0;
  }

  .suggestion-name {
    font-size: 0.95rem;
    font-weight: 600;
  }

  .suggestion-region {
    font-size: 0.8rem;
    color: var(--text-soft);
    font-weight: 500;
  }

  /* --- Modificaciones en Móviles --- */
  @media (max-width: 480px) {
    button[type="submit"] span {
      display: none;
    }
    button[type="submit"] {
      padding: 0 1.25rem;
    }
    button[type="submit"]::after {
      content: '→';
      font-size: 1.35rem;
      font-weight: 700;
    }
    .suggestions {
      border-radius: 16px;
      padding: 0.4rem;
    }
  }
</style>