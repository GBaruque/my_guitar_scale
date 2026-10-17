<script lang="ts">
  interface Props {
    /** Uma tablatura por forma; cada uma é uma lista de linhas (1ª corda primeiro). */
    tabs: string[][];
    /** Rótulo e cor de cada tablatura (várias âncoras), ou null para não mostrar rótulo. */
    labels: { text: string; color: string }[] | null;
  }
  let { tabs, labels }: Props = $props();
</script>

<section>
  {#each tabs as lines, i (i)}
    {#if labels}
      <h3 style:color={labels[i].color}>{labels[i].text}</h3>
    {/if}
    <pre>{lines.join('\n')}</pre>
  {/each}
</section>

<style>
  section {
    overflow-x: auto;
  }
  h3 {
    margin: 0.75rem 0 0;
    font-size: 0.95rem;
  }
  pre {
    font-family: var(--mono);
    font-size: 0.85rem;
    line-height: 1.3;
    margin: 0.5rem 0;
  }
</style>
