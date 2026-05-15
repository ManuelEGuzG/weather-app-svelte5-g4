<script>
  // RUNE $props: en Svelte 5 las props se reciben con la rune $props(),
  // reemplazando al antiguo `export let prop` de Svelte 4.
  let { message } = $props();
</script>

<div class="error" role="alert">
  <svg
    class="error-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
  <p class="error-text">{message}</p>
</div>

<style>
  .error {
    display: flex;
    align-items: flex-start;
    gap: 0.875rem;
    padding: 1rem 1.25rem;
    background: rgba(255, 99, 99, 0.12);
    border: 1px solid rgba(255, 99, 99, 0.4);
    border-left: 4px solid #ff6363;
    border-radius: 8px;
    color: #ffd5d5;
  }

  .error-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    margin-top: 2px;
    color: #ff6363;
  }

  .error-text {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.4;
  }
</style>
