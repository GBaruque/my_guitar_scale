// Tablatura em texto: a sequência subindo e descendo, uma linha por corda, 1ª corda no topo.

import type { Position } from './fretboard';

/**
 * Sobe e desce sem repetir a nota do topo: [a, b, c] → [a, b, c, b, a].
 * (Repetir o topo soaria como uma nota a mais, que não está na escala tocada.)
 */
export function upAndDown(sequence: Position[]): Position[] {
  return [...sequence, ...sequence.slice(0, -1).reverse()];
}

/**
 * Desenha a tablatura. `labels[k]` é o nome da corda k (k = 0 é a 6ª corda).
 * Cada coluna tem uma nota só; as outras cordas recebem traços da mesma largura,
 * para que casas de dois dígitos (ex.: 12) não desalinhem as linhas.
 * Retorna as linhas de cima para baixo (1ª corda primeiro).
 */
export function renderTab(sequence: Position[], labels: string[]): string[] {
  const labelWidth = Math.max(...labels.map((l) => l.length));
  const lines: string[] = [];
  for (let string = labels.length - 1; string >= 0; string--) {
    const columns = sequence.map((p) => {
      const width = String(p.fret).length;
      return p.string === string ? String(p.fret) : '-'.repeat(width);
    });
    lines.push(`${labels[string].padEnd(labelWidth)}|-${columns.join('--')}-|`);
  }
  return lines;
}
