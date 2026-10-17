<script lang="ts">
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

<div class="toggle" role="group" aria-label="Modo">
  {#each modes as m (m.id)}
    <button
      class:active={mode === m.id}
      aria-pressed={mode === m.id}
      onclick={() => onChange(m.id)}>{m.label}</button
    >
  {/each}
</div>

<style>
  .toggle {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
  }
</style>
