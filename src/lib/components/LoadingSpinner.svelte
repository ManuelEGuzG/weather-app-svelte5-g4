<script>
  // Componente puramente presentacional. No necesita estado ni lógica en Svelte 5.
</script>

<div class="spinner-wrap" role="status" aria-live="polite" aria-label="Cargando datos del clima">
  <div class="spinner" aria-hidden="true">
    <div class="spinner-inner"></div>
  </div>
  <span class="spinner-text">Actualizando clima…</span>
</div>

<style>
  .spinner-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.25rem;
    padding: 3rem 2rem;
    width: 100%;
    flex: 1;
  }

  /* --- Estructura del Spinner --- */
  .spinner {
    position: relative;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Anillo base translúcido estilo cristal */
  .spinner::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 3.5px solid rgba(255, 255, 255, 0.05);
    box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.05);
  }

  /* Anillo de carga giratorio con degradado suave */
  .spinner-inner {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 3.5px solid transparent;
    border-top-color: var(--accent, #60a5fa);
    border-right-color: rgba(255, 255, 255, 0.1);
    animation: spin 0.75s cubic-bezier(0.42, 0, 0.58, 1) infinite;
    filter: drop-shadow(0 0 8px var(--accent, rgba(96, 165, 250, 0.4)));
  }

  /* --- Texto de Carga Animado --- */
  .spinner-text {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-soft);
    animation: pulseText 2s ease-in-out infinite;
  }

  /* --- Animaciones --- */
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  @keyframes pulseText {
    0%, 100% { opacity: 0.5; }
    50%      { opacity: 0.9; }
  }

  /* Respetar las preferencias del sistema si se reduce el movimiento */
  @media (prefers-reduced-motion: reduce) {
    .spinner-inner {
      animation: spin 2s linear infinite;
    }
    .spinner-text {
      animation: none;
      opacity: 0.75;
    }
  }
</style>