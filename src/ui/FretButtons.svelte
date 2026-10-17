<script lang="ts">
  // Linha de casas 0–24 acima do braço. Usa a mesma geometria do braço para ficar alinhada.
  //   Full: só texto.
  //   Vertical: casas 0–20 viram botões de âncora (clique alterna).
  //   Diagonal: todas as casas viram botões; início e fim em azul-escuro, o meio em azul-claro.
  import { FRET_COUNT } from '../theory/fretboard';
  import { WINDOW_SIZE, type FretRegion } from '../theory/fingering/types';
  import { MAX_ANCHOR } from '../theory/shapes';
  import type { Mode } from '../state/app.svelte';
  import { anchorColor } from './anchorColors';
  import { BOARD_WIDTH, fretCenterX, fretWidth } from './geometry';

  interface Props {
    mode: Mode;
    anchors: number[];
    region: FretRegion;
    multiAnchor: boolean;
    leftHanded: boolean;
    onFretClick: (fret: number) => void;
  }
  let { mode, anchors, region, multiAnchor, leftHanded, onFretClick }: Props = $props();

  const frets = Array.from({ length: FRET_COUNT + 1 }, (_, f) => f);

  function percent(value: number): string {
    return `${(value / BOARD_WIDTH) * 100}%`;
  }

  function isButton(fret: number): boolean {
    if (mode === 'vertical') return fret <= MAX_ANCHOR;
    return mode === 'diagonal';
  }

  /** Casas cobertas pela janela de alguma âncora (destacadas em tom mais claro). */
  function inWindow(fret: number): boolean {
    return anchors.some((a) => fret >= a && fret < a + WINDOW_SIZE);
  }

  /** Cor do botão da âncora quando há várias (a mesma das notas dela no braço). */
  function anchorBackground(fret: number): string | undefined {
    const index = anchors.indexOf(fret);
    return multiAnchor && index >= 0 ? anchorColor(index) : undefined;
  }
</script>

<div class="row">
  {#each frets as fret (fret)}
    <div class="slot" style:left={percent(fretCenterX(fret, leftHanded))} style:width={percent(fretWidth(fret) * 0.85)}>
      {#if isButton(fret) && mode === 'vertical'}
        <button
          class:anchor={anchors.includes(fret)}
          class:colored={anchorBackground(fret) !== undefined}
          class:window={!anchors.includes(fret) && inWindow(fret)}
          style:background={anchorBackground(fret)}
          aria-pressed={anchors.includes(fret)}
          onclick={() => onFretClick(fret)}>{fret}</button
        >
      {:else if isButton(fret)}
        <button
          class:edge={fret === region.start || fret === region.end}
          class:inside={fret > region.start && fret < region.end}
          aria-pressed={fret === region.start || fret === region.end}
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
    /* As casas agudas são estreitas; a fonte pequena faz o "24" caber no botão. */
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
  button.anchor.colored {
    border-color: rgba(0, 0, 0, 0.35);
    color: #fff;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.7);
  }
  button.edge {
    background: var(--region-edge);
    border-color: var(--region-edge);
    color: var(--region-edge-text);
    font-weight: 700;
  }
  button.inside {
    background: var(--region-inside);
    border-color: var(--region-inside);
    color: var(--region-inside-text);
  }
</style>
