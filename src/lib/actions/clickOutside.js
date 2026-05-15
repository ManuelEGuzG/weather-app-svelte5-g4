/**
 * Acción Svelte personalizada.
 *
 * Las acciones (use:nombre) son una característica única de Svelte:
 * funciones que reciben un elemento DOM y le agregan comportamiento.
 * Se usan con la directiva `use:clickOutside` en cualquier elemento.
 *
 * Ejemplo:
 *   <div use:clickOutside={() => cerrarDropdown()}>...</div>
 *
 * Cuando el componente se desmonta, la función `destroy` se ejecuta
 * automáticamente y limpia el event listener. Sin memory leaks.
 */
export function clickOutside(node, callback) {
  function handleClick(event) {
    if (node && !node.contains(event.target) && !event.defaultPrevented) {
      callback();
    }
  }

  // Capturamos en fase de bubbling para que clicks dentro del nodo
  // tengan oportunidad de prevenir el callback con event.preventDefault().
  document.addEventListener('click', handleClick, true);

  return {
    destroy() {
      document.removeEventListener('click', handleClick, true);
    }
  };
}
