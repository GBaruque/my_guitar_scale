// Monta as formas exibidas (Vertical, e depois Diagonal) a partir de uma estratégia de digitação.

import { cellAt, type Cell, FRET_COUNT, type Position } from './fretboard';
import type { FingeringStrategy, FretRegion } from './fingering/types';
import { WINDOW_SIZE } from './fingering/types';
import { windowStrategy } from './fingering/window';
import type { ScaleNote } from './scales';
import type { Tuning } from './tunings';

/** Âncora mais alta: a janela 20–24 é a última que cabe em 24 casas. */
export const MAX_ANCHOR = FRET_COUNT - (WINDOW_SIZE - 1);

export interface Shape {
  region: FretRegion;
  /** Posições em ordem ascendente de altura (é o que a tablatura toca). */
  sequence: Position[];
  /** As mesmas posições, descritas para o desenho (nota, grau, tônica). */
  cells: Cell[];
}

/** Região do Vertical: a âncora e as 4 casas seguintes. */
export function verticalRegion(anchor: number): FretRegion {
  return { start: anchor, end: anchor + WINDOW_SIZE - 1 };
}

export function buildShape(
  strategy: FingeringStrategy,
  notes: ScaleNote[],
  tuning: Tuning,
  region: FretRegion,
): Shape {
  const sequence = strategy.build({
    scale: notes.map((n) => n.pitchClass),
    tuning,
    region,
  });
  const cells = sequence.map((position) => {
    const cell = cellAt(tuning, position, notes);
    // A estratégia só escolhe notas da escala; se não for o caso, é bug na estratégia.
    if (!cell) throw new Error(`Estratégia ${strategy.id} gerou nota fora da escala`);
    return cell;
  });
  return { region, sequence, cells };
}

export function buildVertical(
  anchor: number,
  notes: ScaleNote[],
  tuning: Tuning,
  strategy: FingeringStrategy = windowStrategy,
): Shape {
  return buildShape(strategy, notes, tuning, verticalRegion(anchor));
}

