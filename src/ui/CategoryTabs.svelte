<script lang="ts">
  // Abas de categoria no topo do painel de escalas, com quantas escalas cada uma tem.
  import type { ScaleCategory } from '../theory/scales';

  interface Props {
    category: ScaleCategory;
    counts: Record<ScaleCategory, number>;
    onSelect: (category: ScaleCategory) => void;
  }
  let { category, counts, onSelect }: Props = $props();

  const categories: { id: ScaleCategory; label: string }[] = [
    { id: 'common', label: 'Common' },
    { id: 'rare', label: 'Rare' },
    { id: 'exotic', label: 'Exotic' },
  ];
</script>

<div class="tabs" role="tablist" aria-label="Categoria">
  {#each categories as c (c.id)}
    <button role="tab" class="tab" class:selected={category === c.id} aria-selected={category === c.id} onclick={() => onSelect(c.id)}>
      {c.label}
      <span class="count">{counts[c.id]}</span>
    </button>
  {/each}
</div>

<style>
  .tabs {
    display: flex;
    gap: 0.25rem;
    border-bottom: 1px solid var(--border);
  }
  .tab {
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    border-radius: 0;
    margin-bottom: -1px;
    padding: 0.55rem 0.9rem;
    color: var(--muted);
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  @media (max-width: 560px) {
    .tab {
      padding: 0.5rem 0.55rem;
      font-size: 0.92rem;
    }
  }
  .tab:hover {
    color: var(--ink);
  }
  .tab.selected {
    color: var(--ink);
    border-bottom-color: var(--root);
  }
  .count {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.05rem 0.45rem;
    border-radius: 999px;
    background: var(--button);
    color: var(--muted);
  }
  .tab.selected .count {
    background: var(--root);
    color: var(--note-ink);
  }
</style>
