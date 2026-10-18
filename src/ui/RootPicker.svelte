<script lang="ts">
  // As 12 tônicas como teclas: naturais claras, com acidente escuras (como no piano).
  // Formato diferente dos outros botões para a seção ser reconhecida de relance.
  import { type Accidental, allPitchClasses, isNatural, noteName, type PitchClass } from '../theory/notes';

  interface Props {
    root: PitchClass;
    accidental: Accidental;
    onSelect: (root: PitchClass) => void;
  }
  let { root, accidental, onSelect }: Props = $props();
</script>

<div class="keys" role="group" aria-label="Tônica">
  {#each allPitchClasses() as pc (pc)}
    <button
      class="key"
      class:sharp={!isNatural(pc)}
      class:selected={pc === root}
      aria-pressed={pc === root}
      onclick={() => onSelect(pc)}>{noteName(pc, accidental)}</button
    >
  {/each}
</div>

<style>
  .keys {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 3px;
  }
  /* Em tela estreita, duas fileiras de 6. */
  @media (max-width: 560px) {
    .keys {
      grid-template-columns: repeat(6, 1fr);
    }
  }
  .key {
    padding: 0.7rem 0 0.5rem;
    border-radius: 0 0 6px 6px;
    border: 1px solid var(--key-border);
    background: var(--key-natural);
    color: var(--key-natural-text);
    font-weight: 600;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    min-height: 2.8rem;
  }
  .key.sharp {
    background: var(--key-sharp);
    color: var(--key-sharp-text);
    border-color: var(--key-sharp);
  }
  .key:hover {
    filter: brightness(0.95);
  }
  .key.selected {
    background: var(--root);
    border-color: var(--root-border);
    color: var(--note-ink);
    font-weight: 800;
    box-shadow: inset 0 -3px 0 var(--root-border);
  }
</style>
