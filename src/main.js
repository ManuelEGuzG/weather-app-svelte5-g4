import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';

// Svelte 5 usa la nueva API mount() en lugar del antiguo `new App({ target })` de Svelte 4
const app = mount(App, {
  target: document.getElementById('app')
});

export default app;
