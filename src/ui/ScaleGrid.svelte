<script lang="ts">
  // Grade de escalas da categoria visível: chips compactos, texto à esquerda.
  import type { Scale } from '../theory/scales';

  interface Props {
    scales: Scale[];
    selectedId: string;
    onSelect: (id: string) => void;
  }
  let { scales, selectedId, onSelect }: Props = $props();
</script>

<div class="grid" role="tabpanel">
  {#each scales as scale (scale.id)}
    <button class="chip" class:selected={scale.id === selectedId} aria-pressed={scale.id === selectedId} onclick={() => onSelect(scale.id)}>
      {scale.name}
    </button>
  {/each}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(10.5rem, 1fr));
    gap: 0.35rem;
    padding-top: 0.75rem;
  }
  .chip {
    text-align: left;
    font-size: 0.88rem;
    padding: 0.4rem 0.7rem;
    border-radius: 6px;
    border: 1px solid transparent;
    background: var(--chip);
    color: var(--ink);
  }
  .chip:hover {
    border-color: var(--border);
  }
  .chip.selected {
    background: var(--root);
    border-color: var(--root-border);
    color: var(--note-ink);
    font-weight: 700;
  }
</style>
