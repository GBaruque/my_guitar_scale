<script lang="ts">
  import type { Mode } from '../state/app.svelte';

  interface Props {
    mode: Mode;
    onChange: (mode: Mode) => void;
  }
  let { mode, onChange }: Props = $props();

  const modes: { id: Mode; label: string; enabled: boolean }[] = [
    { id: 'full', label: 'Full', enabled: true },
    { id: 'vertical', label: 'Vertical', enabled: true },
    { id: 'diagonal', label: 'Diagonal', enabled: false }, // marco 7
  ];
</script>

<div class="toggle" role="group" aria-label="Modo">
  {#each modes as m (m.id)}
    <button
      class:active={mode === m.id}
      aria-pressed={mode === m.id}
      disabled={!m.enabled}
      title={m.enabled ? '' : 'Em breve'}
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
