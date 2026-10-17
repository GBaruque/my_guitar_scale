<script lang="ts">
  import type { Theme } from '../state/app.svelte';

  interface Props {
    title: string;
    formula: string[];
    theme: Theme;
    onToggleTheme: () => void;
  }
  let { title, formula, theme, onToggleTheme }: Props = $props();
</script>

<header>
  <div class="title">
    <h1>{title}</h1>
    <p class="formula">{formula.join(', ')}</p>
  </div>
  <button class="theme" onclick={onToggleTheme} aria-label="Alternar tema claro/escuro">
    {theme === 'dark' ? '☀ Claro' : '☾ Escuro'}
  </button>
</header>

<style>
  /* Título centralizado e botão de tema à direita: três colunas, a do meio é o título. */
  header {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: start;
    text-align: center;
  }
  .title {
    grid-column: 2;
  }
  .theme {
    grid-column: 3;
    justify-self: end;
  }
  h1 {
    margin: 0;
    font-size: 1.8rem;
  }
  .formula {
    margin: 0.25rem 0 0;
    color: var(--muted);
    font-family: var(--mono);
  }
</style>
