<script>
  // RUNE $props: en Svelte 5 las props se reciben con la rune $props(),
  // reemplazando al antiguo `export let prop` de Svelte 4.
  let { message } = $props();
</script>

<div class="error" role="alert" aria-live="assertive">
  <svg
    class="error-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
  <div class="error-content">
    <span class="error-title">Error de conexión</span>
    <p class="error-text">{message}</p>
  </div>
</div>

<style>
  /* --- Contenedor de Error Glassmorphism --- */
  .error {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.15rem 1.35rem;
    background: rgba(239, 68, 68, 0.06); /* Rojo premium sutil tipo Apple */
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 18px;
    color: #fca5a5;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15),
                inset 0 1px 1px rgba(255, 255, 255, 0.02);
    animation: shakeIn 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }

  /* Animación de entrada con un leve efecto de vibración de atención */
  @keyframes shakeIn {
    10%, 90% { transform: translate3d(-1px, 0, 0); }
    20%, 80% { transform: translate3d(2px, 0, 0); }
    30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
    40%, 60% { transform: translate3d(3px, 0, 0); }
    0%, 100% { transform: translate3d(0, 0, 0); }
  }

  /* --- Icono de Alerta --- */
  .error-icon {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    color: #ef4444; /* Rojo de error estándar moderno */
    filter: drop-shadow(0 2px 8px rgba(239, 68, 68, 0.4));
  }

  /* --- Estructura de Texto --- */
  .error-content {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    flex: 1;
  }

  .error-title {
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #f87171;
  }

  .error-text {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 500;
    line-height: 1.4;
    color: rgba(255, 255, 255, 0.9);
  }

  /* Respetar configuración de accesibilidad del usuario */
  @media (prefers-reduced-motion: reduce) {
    .error {
      animation: fadeIn 0.3s ease-out forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  }
</style>