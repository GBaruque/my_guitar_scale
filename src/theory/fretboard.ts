// O braço como dado: qual nota existe em cada (corda, casa), e o modo Full.

import { type Midi, type PitchClass, pitchClassOf } from './notes';
import type { ScaleNote } from './scales';
import type { Tuning } from './tunings';

/** Casas de 0 (corda solta) a 24. */
export const FRET_COUNT = 24;

/** Um lugar no braço. `string` segue a convenção do projeto: 0 = 6ª corda (grave). */
export interface Position {
  string: number;
  fret: number;
}

/** Uma posição que contém uma nota da escala, com tudo que a exibição precisa saber. */
export interface Cell extends Position {
  midi: Midi;
  pitchClass: PitchClass;
  /** Grau da fórmula (ex.: 'b3'). */
  degree: string;
  /** A tônica é desenhada em destaque (laranja). */
  isRoot: boolean;
}

/** Altura MIDI tocada numa posição: corda solta + uma casa = um semitom. */
export function midiAt(tuning: Tuning, position: Position): Midi {
  return tuning.strings[position.string] + position.fret;
}

/**
 * Descreve uma posição em relação à escala. Retorna `null` se a nota não pertence à escala.
 * Usado pelo modo Full e, depois, para transformar as sequências do Vertical/Diagonal em células.
 */
export function cellAt(tuning: Tuning, position: Position, notes: ScaleNote[]): Cell | null {
  const midi = midiAt(tuning, position);
  const pitchClass = pitchClassOf(midi);
  const note = notes.find((n) => n.pitchClass === pitchClass);
  if (!note) return null;
  return {
    string: position.string,
    fret: position.fret,
    midi,
    pitchClass,
    degree: note.degree,
    // A tônica é sempre o primeiro grau da fórmula ('1').
    isRoot: note === notes[0],
  };
}

/**
 * Modo Full: todas as posições de casa 0 a FRET_COUNT cuja nota pertence à escala.
 * Ordenadas por corda (da 6ª para a 1ª) e depois por casa.
 */
export function fullFretboard(tuning: Tuning, notes: ScaleNote[]): Cell[] {
  const cells: Cell[] = [];
  for (let string = 0; string < tuning.strings.length; string++) {
    for (let fret = 0; fret <= FRET_COUNT; fret++) {
      const cell = cellAt(tuning, { string, fret }, notes);
      if (cell) cells.push(cell);
    }
  }
  return cells;
}
