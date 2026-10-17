<script lang="ts">
  // Botão "Settings" + janela com as opções de mão (destro/canhoto) e acidentes (# / b).
  // Usa o <dialog> nativo do navegador: ele já cuida do fundo escurecido, do Esc e do foco.
  import type { Accidental } from '../theory/notes';

  interface Props {
    leftHanded: boolean;
    accidental: Accidental;
    onLeftHandedChange: (leftHanded: boolean) => void;
    onAccidentalChange: (accidental: Accidental) => void;
  }
  let { leftHanded, accidental, onLeftHandedChange, onAccidentalChange }: Props = $props();

  let dialog: HTMLDialogElement;
</script>

<button onclick={() => dialog.showModal()}>Settings</button>

<dialog bind:this={dialog} aria-label="Settings">
  <h2>Settings</h2>

  <fieldset>
    <legend>Mão</legend>
    <div class="options">
      <button class:active={!leftHanded} aria-pressed={!leftHanded} onclick={() => onLeftHandedChange(false)}>
        Destro
      </button>
      <button class:active={leftHanded} aria-pressed={leftHanded} onclick={() => onLeftHandedChange(true)}>
        Canhoto
      </button>
    </div>
  </fieldset>

  <fieldset>
    <legend>Acidentes</legend>
    <div class="options">
      <button class:active={accidental === 'sharp'} aria-pressed={accidental === 'sharp'} onclick={() => onAccidentalChange('sharp')}>
        Sustenido (#)
      </button>
      <button class:active={accidental === 'flat'} aria-pressed={accidental === 'flat'} onclick={() => onAccidentalChange('flat')}>
        Bemol (b)
      </button>
    </div>
  </fieldset>

  <div class="footer">
    <button onclick={() => dialog.close()}>Fechar</button>
  </div>
</dialog>

<style>
  fieldset {
    border: none;
    padding: 0;
    margin: 0 0 1rem;
  }
  legend {
    font-weight: 600;
    margin-bottom: 0.4rem;
  }
  .options {
    display: flex;
    gap: 0.5rem;
  }
  .footer {
    display: flex;
    justify-content: flex-end;
  }
</style>
