import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  compilerOptions: {
    // Habilita el modo runes de Svelte 5 globalmente
    runes: true
  }
};
