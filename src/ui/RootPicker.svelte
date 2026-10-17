<script lang="ts">
  import { type Accidental, allPitchClasses, noteName, type PitchClass } from '../theory/notes';

  interface Props {
    root: PitchClass;
    accidental: Accidental;
    onSelect: (root: PitchClass) => void;
  }
  let { root, accidental, onSelect }: Props = $props();
</script>

<div class="roots" role="group" aria-label="Tônica">
  {#each allPitchClasses() as pc (pc)}
    <button class:active={pc === root} aria-pressed={pc === root} onclick={() => onSelect(pc)}>
      {noteName(pc, accidental)}
    </button>
  {/each}
</div>

<style>
  .roots {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(3rem, 1fr));
    gap: 0.4rem;
  }
</style>
