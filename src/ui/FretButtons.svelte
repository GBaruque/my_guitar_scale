<script lang="ts">
  // Linha de casas 0–24 acima do braço. No Full é só texto; no Vertical, as casas 0–20
  // viram botões de âncora. Usa a mesma geometria do braço para ficar alinhada às casas.
  import { FRET_COUNT } from '../theory/fretboard';
  import { WINDOW_SIZE } from '../theory/fingering/types';
  import { MAX_ANCHOR } from '../theory/shapes';
  import type { Mode } from '../state/app.svelte';
  import { BOARD_WIDTH, fretCenterX, fretWidth } from './geometry';

  interface Props {
    mode: Mode;
    anchors: number[];
    leftHanded: boolean;
    onFretClick: (fret: number) => void;
  }
  let { mode, anchors, leftHanded, onFretClick }: Props = $props();

  const frets = Array.from({ length: FRET_COUNT + 1 }, (_, f) => f);

  function percent(value: number): string {
    return `${(value / BOARD_WIDTH) * 100}%`;
  }

  function isButton(fret: number): boolean {
    return mode === 'vertical' && fret <= MAX_ANCHOR;
  }

  /** Casas cobertas pela janela de alguma âncora (destacadas em tom mais claro). */
  function inWindow(fret: number): boolean {
    return anchors.some((a) => fret >= a && fret < a + WINDOW_SIZE);
  }
</script>

<div class="row">
  {#each frets as fret (fret)}
    <div class="slot" style:left={percent(fretCenterX(fret, leftHanded))} style:width={percent(fretWidth(fret) * 0.85)}>
      {#if isButton(fret)}
        <button
          class:anchor={anchors.includes(fret)}
          class:window={!anchors.includes(fret) && inWindow(fret)}
          aria-pressed={anchors.includes(fret)}
          onclick={() => onFretClick(fret)}>{fret}</button
        >
      {:else}
        <span class:window={mode === 'vertical' && inWindow(fret)}>{fret}</span>
      {/if}
    </div>
  {/each}
</div>

<style>
  .row {
    position: relative;
    height: 1.8rem;
  }
  .slot {
    position: absolute;
    top: 0;
    bottom: 0;
    transform: translateX(-50%);
    display: flex;
  }
  button,
  span {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    /* As casas agudas são estreitas; a fonte pequena faz o "20" caber no botão. */
    font-size: 0.72rem;
    border-radius: 4px;
    min-width: 0;
    padding: 0;
  }
  span {
    color: var(--muted);
  }
  button {
    border: 1px solid var(--border);
    background: var(--button);
    color: var(--ink);
    cursor: pointer;
  }
  button.window,
  span.window {
    background: var(--window);
  }
  button.anchor {
    background: var(--root);
    border-color: var(--root-border);
    color: var(--note-ink);
    font-weight: 700;
  }
</style>
