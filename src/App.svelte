<script lang="ts">
  import { app } from './state/app.svelte';
  import CategoryTabs from './ui/CategoryTabs.svelte';
  import FretButtons from './ui/FretButtons.svelte';
  import Fretboard from './ui/Fretboard.svelte';
  import Header from './ui/Header.svelte';
  import ModeToggle from './ui/ModeToggle.svelte';
  import RootPicker from './ui/RootPicker.svelte';
  import ScaleGrid from './ui/ScaleGrid.svelte';
  import SettingsDialog from './ui/SettingsDialog.svelte';
  import Tablature from './ui/Tablature.svelte';
  import TuningsDialog from './ui/TuningsDialog.svelte';
  import { TUNINGS } from './theory/tunings';
  import { anchorColor } from './ui/anchorColors';

  // Aplica o tema no <html>, onde as variáveis de cor do app.css o leem.
  $effect(() => {
    document.documentElement.dataset.theme = app.theme;
  });

  // Mantém a URL igual ao estado, para o link da barra de endereço ser compartilhável.
  // replaceState (e não pushState) para não encher o histórico do "voltar" a cada clique.
  $effect(() => {
    history.replaceState(null, '', `?${app.query}`);
  });

  // Rótulos "Âncora N" na cor de cada âncora, só quando há mais de uma.
  let tabLabels = $derived(
    app.multiAnchor
      ? app.anchors.map((fret, i) => ({ text: `Âncora ${i + 1} (casa ${fret})`, color: anchorColor(i) }))
      : null,
  );
</script>

<main>
  <Header
    title={app.title}
    formula={app.scale.formula}
    theme={app.theme}
    onToggleTheme={() => app.toggleTheme()}
  />

  <div class="toolbar">
    <SettingsDialog
      leftHanded={app.leftHanded}
      accidental={app.accidental}
      onLeftHandedChange={(v) => app.setLeftHanded(v)}
      onAccidentalChange={(v) => app.setAccidental(v)}
    />
    <TuningsDialog
      tunings={TUNINGS}
      current={app.tuning}
      accidental={app.accidental}
      onSelect={(id) => app.selectTuning(id)}
    />
  </div>

  <!-- Braço e linha de casas dividem a mesma largura, para os botões ficarem sobre as casas. -->
  <div class="board-scroll">
    <div class="board">
      <FretButtons
        mode={app.mode}
        anchors={app.anchors}
        region={app.region}
        multiAnchor={app.multiAnchor}
        leftHanded={app.leftHanded}
        onFretClick={(fret) => app.clickFret(fret)}
      />
      <Fretboard
        cells={app.cells}
        stringLabels={app.stringLabels}
        accidental={app.accidental}
        leftHanded={app.leftHanded}
        multiAnchor={app.multiAnchor}
      />
    </div>
  </div>

  <ModeToggle mode={app.mode} onChange={(mode) => app.selectMode(mode)} />

  {#if app.mode !== 'full'}
    <Tablature tabs={app.tabs} labels={tabLabels} />
  {/if}

  <section class="panel" aria-labelledby="root-title">
    <h2 id="root-title" class="panel-title">Tônica</h2>
    <RootPicker root={app.root} accidental={app.accidental} onSelect={(pc) => app.selectRoot(pc)} />
  </section>

  <!-- As abas ficam no topo do painel (no site ficam abaixo da grade): presas à grade,
       fica claro que elas filtram as escalas mostradas. -->
  <section class="panel" aria-labelledby="scale-title">
    <h2 id="scale-title" class="panel-title">Escala</h2>
    <CategoryTabs category={app.category} counts={app.categoryCounts} onSelect={(c) => app.selectCategory(c)} />
    <ScaleGrid scales={app.visibleScales} selectedId={app.scaleId} onSelect={(id) => app.selectScale(id)} />
  </section>
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
  .panel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 0.9rem 1rem 1rem;
  }
  .panel-title {
    margin: 0 0 0.7rem;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .toolbar {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .board-scroll {
    overflow-x: auto;
  }
  /* Abaixo disso as notas ficariam pequenas demais; melhor rolar de lado. */
  .board {
    min-width: 1000px;
  }
</style>
