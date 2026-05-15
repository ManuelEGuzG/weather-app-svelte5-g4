<script>
  // $props con callbacks: en Svelte 5 los eventos personalizados se pasan
  // como funciones via props (en vez de createEventDispatcher de Svelte 4).
  // 'disabled' permite bloquear el input mientras carga.
  let { onSearch, disabled = false } = $props();

  // $state local del componente: el valor actual del input.
  let query = $state('');

  function handleSubmit(event) {
    event.preventDefault();
    if (!query.trim() || disabled) return;
    onSearch(query);
    // Limpiamos el input después de buscar.
    query = '';
  }
</script>

<form class="search" onsubmit={handleSubmit}>
  <input
    type="text"
    bind:value={query}
    placeholder="Busca una ciudad…"
    aria-label="Nombre de la ciudad"
    {disabled}
    autocomplete="off"
  />
  <button type="submit" {disabled} aria-label="Buscar">
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
    <span>Buscar</span>
  </button>
</form>

<style>
  .search {
    display: flex;
    gap: 0.5rem;
    width: 100%;
  }

  input {
    flex: 1;
    padding: 0.875rem 1.125rem;
    font-family: var(--font-body);
    font-size: 1rem;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    color: var(--text);
    transition: all 0.2s ease;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  input::placeholder {
    color: var(--text-soft);
  }

  input:focus {
    outline: none;
    border-color: var(--accent);
    background: rgba(255, 255, 255, 0.12);
    box-shadow: 0 0 0 4px rgba(255, 184, 77, 0.15);
  }

  input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0 1.25rem;
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 0.95rem;
    background: var(--accent);
    color: #1a1a2e;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: transform 0.15s ease, background 0.2s ease;
  }

  button:hover:not(:disabled) {
    background: var(--accent-strong);
    transform: translateY(-1px);
  }

  button:active:not(:disabled) {
    transform: translateY(0);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  button svg {
    width: 18px;
    height: 18px;
  }

  /* En móviles ocultamos el texto del botón para ganar espacio */
  @media (max-width: 480px) {
    button span {
      display: none;
    }
    button {
      padding: 0 1rem;
    }
  }
</style>
