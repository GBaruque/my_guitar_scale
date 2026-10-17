<script lang="ts">
  import type { ScaleCategory } from '../theory/scales';

  interface Props {
    category: ScaleCategory;
    onSelect: (category: ScaleCategory) => void;
  }
  let { category, onSelect }: Props = $props();

  const categories: { id: ScaleCategory; label: string }[] = [
    { id: 'common', label: 'Common' },
    { id: 'rare', label: 'Rare' },
    { id: 'exotic', label: 'Exotic' },
  ];
</script>

<div class="tabs" role="tablist">
  {#each categories as c (c.id)}
    <button role="tab" class:active={category === c.id} aria-selected={category === c.id} onclick={() => onSelect(c.id)}>
      {c.label}
    </button>
  {/each}
</div>

<style>
  .tabs {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
  }
</style>
