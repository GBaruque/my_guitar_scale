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

/** Diagonal: a mesma estratégia, só que com uma região larga. */
export function buildDiagonal(
  region: FretRegion,
  notes: ScaleNote[],
  tuning: Tuning,
  strategy: FingeringStrategy = windowStrategy,
): Shape {
  return buildShape(strategy, notes, tuning, region);
}

export function buildVertical(
  anchor: number,
  notes: ScaleNote[],
  tuning: Tuning,
  strategy: FingeringStrategy = windowStrategy,
): Shape {
  return buildShape(strategy, notes, tuning, verticalRegion(anchor));
}

// ---------------------------------------------------------------------------
// Múltiplas âncoras
// ---------------------------------------------------------------------------

/** Uma célula do braço junto com as formas (índices em `anchors`) que a incluem. */
export interface AnchoredCell extends Cell {
  /** Vazio no modo Full; no Vertical, as âncoras cuja forma passa por esta posição. */
  belongsTo: number[];
}

/**
 * Junta várias formas numa lista só de células. Uma posição que aparece em mais de uma
 * forma vira uma célula só, com todos os índices em `belongsTo` (desenhada em fatias).
 * Ordenada por corda e depois por casa.
 */
export function composeShapes(shapes: Shape[]): AnchoredCell[] {
  const byPosition = new Map<string, AnchoredCell>();
  shapes.forEach((shape, index) => {
    for (const cell of shape.cells) {
      const key = `${cell.string}:${cell.fret}`;
      const existing = byPosition.get(key);
      if (existing) existing.belongsTo.push(index);
      else byPosition.set(key, { ...cell, belongsTo: [index] });
    }
  });
  return [...byPosition.values()].sort((a, b) => a.string - b.string || a.fret - b.fret);
}

/**
 * Clique num botão de casa no Vertical: adiciona a âncora se não existe, remove se existe.
 * A lista fica sempre ordenada e sem repetição, e nunca fica vazia (a última não sai).
 */
export function toggleAnchor(anchors: number[], fret: number): number[] {
  if (!Number.isInteger(fret) || fret < 0 || fret > MAX_ANCHOR) return anchors;
  if (anchors.includes(fret)) {
    return anchors.length === 1 ? anchors : anchors.filter((a) => a !== fret);
  }
  return [...anchors, fret].sort((a, b) => a - b);
}
