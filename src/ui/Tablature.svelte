<script lang="ts">
  interface Props {
    /** Uma tablatura por âncora; cada uma é uma lista de linhas (1ª corda primeiro). */
    tabs: string[][];
  }
  let { tabs }: Props = $props();
</script>

<section>
  {#each tabs as lines, i (i)}
    <pre>{lines.join('\n')}</pre>
  {/each}
</section>

<style>
  section {
    overflow-x: auto;
  }
  pre {
    font-family: var(--mono);
    font-size: 0.85rem;
    line-height: 1.3;
    margin: 0.5rem 0;
  }
</style>
