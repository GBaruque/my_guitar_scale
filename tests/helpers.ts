// Atalhos para os testes: buscar dados do catálogo sem ficar checando undefined.

import type { Position } from '../src/theory/fretboard';
import { findScale, type Scale } from '../src/theory/scales';
import { findTuning, type Tuning } from '../src/theory/tunings';

export function scale(id: string): Scale {
  const found = findScale(id);
  if (!found) throw new Error(`escala ${id} não encontrada`);
  return found;
}

export function tuning(id: string): Tuning {
  const found = findTuning(id);
  if (!found) throw new Error(`afinação ${id} não encontrada`);
  return found;
}

/** Casas usadas em cada corda, da 6ª para a 1ª: o formato das tabelas do CLAUDE.md. */
export function fretsByString(sequence: Position[], stringCount = 6): number[][] {
  return Array.from({ length: stringCount }, (_, s) =>
    sequence.filter((p) => p.string === s).map((p) => p.fret),
  );
}
