<script lang="ts">
  import { app } from './state/app.svelte';
  import CategoryTabs from './ui/CategoryTabs.svelte';
  import FretButtons from './ui/FretButtons.svelte';
  import Fretboard from './ui/Fretboard.svelte';
  import Header from './ui/Header.svelte';
  import ModeToggle from './ui/ModeToggle.svelte';
  import RootPicker from './ui/RootPicker.svelte';
  import ScaleGrid from './ui/ScaleGrid.svelte';
  import Tablature from './ui/Tablature.svelte';

  // Aplica o tema no <html>, onde as variáveis de cor do app.css o leem.
  $effect(() => {
    document.documentElement.dataset.theme = app.theme;
  });
</script>

<main>
  <Header
    title={app.title}
    formula={app.scale.formula}
    theme={app.theme}
    onToggleTheme={() => app.toggleTheme()}
  />

  <!-- Braço e linha de casas dividem a mesma largura, para os botões ficarem sobre as casas. -->
  <div class="board-scroll">
    <div class="board">
      <FretButtons
        mode={app.mode}
        anchors={app.anchors}
        leftHanded={app.leftHanded}
        onFretClick={(fret) => app.clickFret(fret)}
      />
      <Fretboard
        cells={app.cells}
        stringLabels={app.stringLabels}
        accidental={app.accidental}
        leftHanded={app.leftHanded}
      />
    </div>
  </div>

  <ModeToggle mode={app.mode} onChange={(mode) => app.selectMode(mode)} />

  {#if app.mode !== 'full'}
    <Tablature tabs={app.tabs} />
  {/if}

  <RootPicker root={app.root} accidental={app.accidental} onSelect={(pc) => app.selectRoot(pc)} />
  <ScaleGrid scales={app.visibleScales} selectedId={app.scaleId} onSelect={(id) => app.selectScale(id)} />
  <CategoryTabs category={app.category} onSelect={(c) => app.selectCategory(c)} />
</main>

<style>
  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .board-scroll {
    overflow-x: auto;
  }
  /* Abaixo disso as notas ficariam pequenas demais; melhor rolar de lado. */
  .board {
    min-width: 1000px;
  }
</style>
