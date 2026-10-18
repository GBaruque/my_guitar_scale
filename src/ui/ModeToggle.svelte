<script lang="ts">
  // Full / Vertical / Diagonal como controle segmentado (três botões colados).
  import type { Mode } from '../state/app.svelte';

  interface Props {
    mode: Mode;
    onChange: (mode: Mode) => void;
  }
  let { mode, onChange }: Props = $props();

  const modes: { id: Mode; label: string }[] = [
    { id: 'full', label: 'Full' },
    { id: 'vertical', label: 'Vertical' },
    { id: 'diagonal', label: 'Diagonal' },
  ];
</script>

<div class="segmented" role="group" aria-label="Modo">
  {#each modes as m (m.id)}
    <button class:selected={mode === m.id} aria-pressed={mode === m.id} onclick={() => onChange(m.id)}>{m.label}</button>
  {/each}
</div>

<style>
  .segmented {
    display: flex;
    justify-content: center;
    margin: 0 auto;
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
    width: fit-content;
  }
  button {
    border: none;
    border-radius: 0;
    padding: 0.45rem 1.2rem;
    background: var(--button);
    font-weight: 600;
  }
  button + button {
    border-left: 1px solid var(--border);
  }
  button.selected {
    background: var(--root);
    color: var(--note-ink);
  }
</style>
