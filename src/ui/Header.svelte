<script lang="ts">
  import type { Theme } from '../state/app.svelte';

  interface Props {
    title: string;
    formula: string[];
    theme: Theme;
    onToggleTheme: () => void;
    playing: boolean;
    onTogglePlay: () => void;
  }
  let { title, formula, theme, onToggleTheme, playing, onTogglePlay }: Props = $props();
</script>

<header>
  <div class="title">
    <div class="title-row">
      <h1>{title}</h1>
      <button
        class="play"
        class:playing
        onclick={onTogglePlay}
        aria-label={playing ? 'Parar o som' : 'Tocar a escala'}
        title={playing ? 'Parar' : 'Tocar'}>{playing ? '■' : '▶'}</button
      >
    </div>
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
  .title-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
  }
  /* Botão redondo de som ao lado do nome da escala, como no site. */
  .play {
    width: 2.2rem;
    height: 2.2rem;
    padding: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    background: var(--root);
    border-color: var(--root-border);
    color: var(--note-ink);
  }
  .play.playing {
    background: var(--button);
    border-color: var(--border);
    color: var(--ink);
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
