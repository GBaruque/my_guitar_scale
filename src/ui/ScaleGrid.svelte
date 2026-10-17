<script lang="ts">
  import type { Scale } from '../theory/scales';

  interface Props {
    scales: Scale[];
    selectedId: string;
    onSelect: (id: string) => void;
  }
  let { scales, selectedId, onSelect }: Props = $props();
</script>

<div class="grid">
  {#each scales as scale (scale.id)}
    <button class:active={scale.id === selectedId} aria-pressed={scale.id === selectedId} onclick={() => onSelect(scale.id)}>
      {scale.name}
    </button>
  {/each}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
    gap: 0.4rem;
  }
</style>
