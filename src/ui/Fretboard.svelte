<script lang="ts">
  // Só desenha. As células já chegam calculadas pelo estado (theory/); aqui só viram SVG.
  // As cores da madeira, trastes e marcações vêm de variáveis CSS do tema (app.css):
  // claro = rosewood com marcações prateadas, escuro = maple com marcações escuras.
  import { FRET_COUNT, type Position } from '../theory/fretboard';
  import type { AnchoredCell } from '../theory/shapes';
  import { anchorColor } from './anchorColors';
  import { type Accidental, noteName } from '../theory/notes';
  import {
    BOARD_BOTTOM,
    BOARD_END_X,
    BOARD_HEIGHT,
    BOARD_TOP,
    BOARD_WIDTH,
    FRET_WIRE_WIDTH,
    fretMarkers,
    fretWireX,
    horizontalSpan,
    labelX,
    MARKER_RADIUS,
    NOTE_RADIUS,
    NUT_WIDTH,
    NUT_X,
    pieSlicePaths,
    pointOf,
    stringThickness,
    stringY,
    WOUND_STRINGS,
  } from './geometry';

  interface Props {
    cells: AnchoredCell[];
    stringLabels: string[];
    accidental: Accidental;
    leftHanded: boolean;
    /** Vertical com 2+ âncoras: cada nota é pintada com a(s) cor(es) das âncoras a que pertence. */
    multiAnchor: boolean;
    /** Posição da nota que está soando agora (anel em volta dela), ou null. */
    highlight: Position | null;
  }
  let { cells, stringLabels, accidental, leftHanded, multiAnchor, highlight }: Props = $props();

  /** Sombra das cordas na madeira. Desligada em teste; para voltar, troque para true. */
  const SHOW_STRING_SHADOW = false;

  /** Trastes de metal: 1 a 24 (o 0 é o nut, desenhado à parte). */
  const wires = Array.from({ length: FRET_COUNT }, (_, i) => i + 1);

  let board = $derived(horizontalSpan(NUT_X, BOARD_END_X, leftHanded));
  let nut = $derived(horizontalSpan(NUT_X - NUT_WIDTH, NUT_X, leftHanded));
</script>

<svg viewBox="0 0 {BOARD_WIDTH} {BOARD_HEIGHT}" role="img" aria-label="Braço da guitarra">
  <defs>
    <!-- Madeira: um pouco mais escura nas bordas, como um braço levemente arredondado. -->
    <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" class="wood-edge" />
      <stop offset="0.5" class="wood-center" />
      <stop offset="1" class="wood-edge" />
    </linearGradient>
    <!-- Traste: metal arredondado, com brilho no meio. -->
    <linearGradient id="fret-metal" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" class="fret-edge" />
      <stop offset="0.45" class="fret-shine" />
      <stop offset="1" class="fret-edge" />
    </linearGradient>
    <!-- Corda: cilindro iluminado de cima. -->
    <linearGradient id="string-metal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" class="string-edge" />
      <stop offset="0.35" class="string-shine" />
      <stop offset="1" class="string-edge" />
    </linearGradient>
    <filter id="soft-shadow" x="-5%" y="-200%" width="110%" height="500%">
      <feGaussianBlur stdDeviation="0.9" />
    </filter>
  </defs>

  <rect class="board" x={board.x} y={BOARD_TOP} width={board.width} height={BOARD_BOTTOM - BOARD_TOP} />

  {#each fretMarkers(leftHanded) as marker, i (i)}
    <circle class="marker" cx={marker.x} cy={marker.y} r={MARKER_RADIUS} />
  {/each}

  {#each wires as i (i)}
    <rect
      class="wire"
      x={fretWireX(i, leftHanded) - FRET_WIRE_WIDTH / 2}
      y={BOARD_TOP}
      width={FRET_WIRE_WIDTH}
      height={BOARD_BOTTOM - BOARD_TOP}
    />
  {/each}

  <rect class="nut" x={nut.x} y={BOARD_TOP} width={nut.width} height={BOARD_BOTTOM - BOARD_TOP} />

  {#each stringLabels as label, s (s)}
    {@const t = stringThickness(s)}
    {#if SHOW_STRING_SHADOW}
      <!-- Sombra da corda na madeira, deslocada para baixo (luz vindo de cima). -->
      <rect class="string-shadow" x={board.x} y={stringY(s) + t * 0.4 + 1} width={board.width} height={t} filter="url(#soft-shadow)" />
    {/if}
    <rect class="string" x={board.x} y={stringY(s) - t / 2} width={board.width} height={t} />
    {#if WOUND_STRINGS[s]}
      <!-- Textura de fio enrolado: tracinhos bem curtos ao longo da corda. -->
      <line class="winding" x1={board.x} x2={board.x + board.width} y1={stringY(s)} y2={stringY(s)} stroke-width={t} />
    {/if}
    <text class="label" x={labelX(leftHanded)} y={stringY(s)}>{label}</text>
  {/each}

  {#each cells as cell (`${cell.string}-${cell.fret}`)}
    {@const p = pointOf(cell, leftHanded)}
    {#if multiAnchor}
      <!-- Várias âncoras: uma cor por âncora; nota compartilhada vira círculo em fatias.
           A tônica é marcada pela borda grossa e pelo rótulo em negrito. -->
      <g class="anchored" class:root={cell.isRoot}>
        {#if cell.belongsTo.length === 1}
          <circle cx={p.x} cy={p.y} r={NOTE_RADIUS} style:fill={anchorColor(cell.belongsTo[0])} />
        {:else}
          {#each pieSlicePaths(p.x, p.y, NOTE_RADIUS, cell.belongsTo.length) as d, i (i)}
            <path {d} style:fill={anchorColor(cell.belongsTo[i])} />
          {/each}
        {/if}
        <circle class="ring" cx={p.x} cy={p.y} r={NOTE_RADIUS} />
        <text x={p.x} y={p.y}>{noteName(cell.pitchClass, accidental)}</text>
      </g>
    {:else}
      <g class="note" class:root={cell.isRoot}>
        <circle cx={p.x} cy={p.y} r={NOTE_RADIUS} />
        <text x={p.x} y={p.y}>{noteName(cell.pitchClass, accidental)}</text>
      </g>
    {/if}
  {/each}

  {#if highlight}
    {@const p = pointOf(highlight, leftHanded)}
    <circle class="now-playing" cx={p.x} cy={p.y} r={NOTE_RADIUS + 4} />
  {/if}
</svg>

<style>
  svg {
    display: block;
    width: 100%;
    height: auto;
  }
  .wood-edge {
    stop-color: var(--wood-edge);
  }
  .wood-center {
    stop-color: var(--wood-center);
  }
  .fret-edge {
    stop-color: var(--fret-edge);
  }
  .fret-shine {
    stop-color: var(--fret-shine);
  }
  .string-edge {
    stop-color: var(--string-edge);
  }
  .string-shine {
    stop-color: var(--string-shine);
  }
  .board {
    fill: url(#wood);
  }
  .wire {
    fill: url(#fret-metal);
  }
  .nut {
    fill: var(--nut);
    stroke: var(--nut-border);
    stroke-width: 0.8;
  }
  .marker {
    fill: var(--inlay);
    stroke: var(--inlay-border);
    stroke-width: 0.8;
  }
  .string {
    fill: url(#string-metal);
  }
  .string-shadow {
    fill: #000;
    opacity: 0.35;
  }
  .winding {
    stroke: #000;
    opacity: 0.25;
    stroke-dasharray: 0.7 1.1;
  }
  text {
    text-anchor: middle;
    dominant-baseline: central;
    font-size: 11px;
    font-weight: 600;
  }
  .label {
    fill: var(--muted);
    font-size: 13px;
  }
  .note circle {
    fill: var(--note);
    stroke: var(--note-border);
    stroke-width: 1;
  }
  .note.root circle {
    fill: var(--root-note);
    stroke: var(--root-note-border);
  }
  .note text {
    fill: var(--note-text);
    font-weight: 700;
  }
  .note.root text {
    fill: var(--root-note-text);
    font-weight: 800;
  }
  .now-playing {
    fill: none;
    stroke: var(--playing);
    stroke-width: 3;
  }
  .anchored .ring {
    fill: none;
    stroke: var(--anchor-ring);
    stroke-width: 1;
  }
  .anchored.root .ring {
    stroke: var(--anchor-root-ring);
    stroke-width: 2.6;
  }
  /* Texto branco com contorno escuro: lê bem sobre qualquer cor da paleta e sobre as fatias. */
  .anchored text {
    fill: #fff;
    stroke: rgba(0, 0, 0, 0.55);
    stroke-width: 2.2px;
    paint-order: stroke;
    font-weight: 500;
  }
  .anchored.root text {
    font-weight: 800;
  }
</style>
