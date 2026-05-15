<script>
  // Componente puramente presentacional. No necesita estado.
</script>

<div class="spinner-wrap" role="status" aria-live="polite" aria-label="Cargando">
  <div class="spinner"></div>
  <span class="spinner-text">Cargando clima…</span>
</div>

<style>
  .spinner-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(255, 255, 255, 0.2);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.9s linear infinite;
  }

  .spinner-text {
    font-family: var(--font-body);
    font-size: 0.875rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-soft);
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
