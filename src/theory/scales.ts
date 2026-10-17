// Catálogo de escalas (dados) e conversão fórmula → semitons.
//
// A fórmula é a fonte da verdade, não os semitons. Motivo: #4 e b5 são o mesmo semitom (6),
// mas a escala Overtone Dominant escreve "#4" e outras escrevem "b5". Guardando a fórmula,
// conseguimos exibir exatamente o que o site mostra.

import { type PitchClass, SEMITONES_PER_OCTAVE, transpose } from './notes';

export type ScaleCategory = 'common' | 'rare' | 'exotic';

export interface Scale {
  /** Slug usado na URL e no site de referência (ex.: 'pentatonic-major'). */
  id: string;
  name: string;
  category: ScaleCategory;
  /** Graus em relação à tônica, ex.: ['1', '2', 'b3', '4', '5', 'b6', 'b7']. */
  formula: string[];
}

/** Uma nota de uma escala já transposta: a classe de altura e o grau que ela representa. */
export interface ScaleNote {
  pitchClass: PitchClass;
  /** Grau da fórmula, ex.: '1', 'b3', '#4'. O grau '1' é a tônica. */
  degree: string;
}

export const DEGREES_PER_OCTAVE = 7;

// Semitons de cada grau da escala maior (graus 1..7). É a régua contra a qual as fórmulas
// são escritas: "b3" = grau 3 da maior (4 semitons) menos 1 = 3 semitons.
const MAJOR_DEGREE_SEMITONES = [0, 2, 4, 5, 7, 9, 11];

/**
 * Converte um grau ("b3", "#4", "bb7", "9") em semitons a partir da tônica.
 * Graus acima de 7 são compostos (9 = 2 uma oitava acima = 14 semitons).
 * Lança erro para graus mal formados: fórmula errada é bug de dados e deve aparecer cedo.
 */
export function degreeToSemitones(degree: string): number {
  const match = /^([b#]*)([1-9]\d*)$/.exec(degree);
  if (!match) throw new Error(`Grau inválido: "${degree}"`);
  const [, accidentals, numberText] = match;
  const index = Number(numberText) - 1; // grau 1 → índice 0
  const octave = Math.floor(index / DEGREES_PER_OCTAVE);
  let semitones =
    MAJOR_DEGREE_SEMITONES[index % DEGREES_PER_OCTAVE] + octave * SEMITONES_PER_OCTAVE;
  for (const sign of accidentals) {
    semitones += sign === '#' ? 1 : -1;
  }
  return semitones;
}

/** Fórmula inteira → semitons, na mesma ordem. Ex.: ['1','2','3','5','6'] → [0,2,4,7,9]. */
export function formulaToSemitones(formula: string[]): number[] {
  return formula.map(degreeToSemitones);
}

/** As notas da escala a partir de uma tônica, na ordem da fórmula (a tônica vem primeiro). */
export function scaleNotes(root: PitchClass, scale: Scale): ScaleNote[] {
  return scale.formula.map((degree) => ({
    pitchClass: transpose(root, degreeToSemitones(degree)),
    degree,
  }));
}

/** Só as classes de altura, no formato que as estratégias de digitação recebem. */
export function scalePitchClasses(root: PitchClass, scale: Scale): PitchClass[] {
  return scaleNotes(root, scale).map((note) => note.pitchClass);
}

// ---------------------------------------------------------------------------
// Catálogo
//
// Por enquanto só as fórmulas já confirmadas no site (ver CLAUDE.md). As demais escalas
// entram no marco 10, cada uma conferida na página do site; não inventar de memória.
// Ordem dentro de cada categoria = ordem do site.
// ---------------------------------------------------------------------------

export const SCALES: Scale[] = [
  { id: 'major', name: 'Major', category: 'common', formula: ['1', '2', '3', '4', '5', '6', '7'] },
  { id: 'pentatonic-major', name: 'Pentatonic Major', category: 'common', formula: ['1', '2', '3', '5', '6'] },
  { id: 'overtone-dominant', name: 'Overtone Dominant', category: 'rare', formula: ['1', '2', '3', '#4', '5', '6', 'b7'] },
  { id: 'algerian', name: 'Algerian', category: 'exotic', formula: ['1', '2', 'b3', '4', '#4', '5', 'b6', '7'] },
];

export const DEFAULT_SCALE_ID = 'major';

export function findScale(id: string): Scale | undefined {
  return SCALES.find((scale) => scale.id === id);
}

export function scalesInCategory(category: ScaleCategory): Scale[] {
  return SCALES.filter((scale) => scale.category === category);
}
