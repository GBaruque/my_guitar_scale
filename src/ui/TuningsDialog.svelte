<script lang="ts">
  // Botão "Tunings" + janela com as 15 afinações. Escolher uma fecha a janela.
  import type { Accidental } from '../theory/notes';
  import { type Tuning, tuningNoteNames } from '../theory/tunings';

  interface Props {
    tunings: Tuning[];
    current: Tuning;
    accidental: Accidental;
    onSelect: (id: string) => void;
  }
  let { tunings, current, accidental, onSelect }: Props = $props();

  let dialog: HTMLDialogElement;

  function choose(id: string) {
    onSelect(id);
    dialog.close();
  }
</script>

<button onclick={() => dialog.showModal()}>Tunings: {current.name}</button>

<dialog bind:this={dialog} aria-label="Tunings">
  <h2>Tunings</h2>
  <div class="list">
    {#each tunings as tuning (tuning.id)}
      <button class:active={tuning.id === current.id} aria-pressed={tuning.id === current.id} onclick={() => choose(tuning.id)}>
        <span class="name">{tuning.name}</span>
        <span class="notes">{tuningNoteNames(tuning, accidental).join('-')}</span>
      </button>
    {/each}
  </div>
  <div class="footer">
    <button onclick={() => dialog.close()}>Fechar</button>
  </div>
</dialog>

<style>
  /* Largura fixa: sem isso o <dialog> encolhe até o conteúdo e a grade vira uma coluna só. */
  dialog {
    width: min(40rem, calc(100vw - 2rem));
  }
  .list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
    gap: 0.4rem;
    margin-bottom: 1rem;
  }
  .list button {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
  .notes {
    font-family: var(--mono);
    font-size: 0.8rem;
    opacity: 0.8;
  }
  .footer {
    display: flex;
    justify-content: flex-end;
  }
</style>
