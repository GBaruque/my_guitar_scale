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
// 55 escalas: todas as Common, as 13 mais conhecidas de Rare e de Exotic e todas as de blues
// (Rare). As fórmulas foram extraídas do catálogo do próprio site (o mesmo dado que as páginas
// mostram na linha "Formula:"; uma amostra das páginas foi conferida e bateu).
// Ordem dentro de cada categoria = ordem do site.
//
// Observação: no site, Altered tem fórmula 1, b2, b3, b4, b5, b6, b7 mas os semitons guardados
// lá são 0,1,3,4,6,7,8 (erro do site). Seguimos a fórmula, que dá a escala alterada correta.
//
// Ainda faltam 53 escalas da lista do CLAUDE.md (marco 10 foi reduzido às mais populares).
// ---------------------------------------------------------------------------

export const SCALES: Scale[] = [
  // Common
  { id: 'major', name: 'Major', category: 'common', formula: ['1', '2', '3', '4', '5', '6', '7'] },
  { id: 'harmonic-minor', name: 'Harmonic Minor', category: 'common', formula: ['1', '2', 'b3', '4', '5', 'b6', '7'] },
  { id: 'melodic-minor', name: 'Melodic Minor', category: 'common', formula: ['1', '2', 'b3', '4', '5', '6', '7'] },
  { id: 'natural-minor', name: 'Natural Minor', category: 'common', formula: ['1', '2', 'b3', '4', '5', 'b6', 'b7'] },
  { id: 'pentatonic-major', name: 'Pentatonic Major', category: 'common', formula: ['1', '2', '3', '5', '6'] },
  { id: 'pentatonic-minor', name: 'Pentatonic Minor', category: 'common', formula: ['1', 'b3', '4', '5', 'b7'] },
  { id: 'pentatonic-blues', name: 'Pentatonic Blues', category: 'common', formula: ['1', 'b3', '4', 'b5', '5', 'b7'] },
  { id: 'pentatonic-neutral', name: 'Pentatonic Neutral', category: 'common', formula: ['1', '2', '4', '5', 'b7'] },
  { id: 'ionian', name: 'Ionian', category: 'common', formula: ['1', '2', '3', '4', '5', '6', '7'] },
  { id: 'dorian', name: 'Dorian', category: 'common', formula: ['1', '2', 'b3', '4', '5', '6', 'b7'] },
  { id: 'phrygian', name: 'Phrygian', category: 'common', formula: ['1', 'b2', 'b3', '4', '5', 'b6', 'b7'] },
  { id: 'lydian', name: 'Lydian', category: 'common', formula: ['1', '2', '3', '#4', '5', '6', '7'] },
  { id: 'mixolydian', name: 'Mixolydian', category: 'common', formula: ['1', '2', '3', '4', '5', '6', 'b7'] },
  { id: 'aeolian', name: 'Aeolian', category: 'common', formula: ['1', '2', 'b3', '4', '5', 'b6', 'b7'] },
  { id: 'locrian', name: 'Locrian', category: 'common', formula: ['1', 'b2', 'b3', '4', 'b5', 'b6', 'b7'] },
  { id: 'diatonic', name: 'Diatonic', category: 'common', formula: ['1', '2', '3', '5', '6'] },
  { id: 'diminished', name: 'Diminished', category: 'common', formula: ['1', '2', 'b3', '4', 'b5', 'b6', '6', '7'] },
  { id: 'diminished-half', name: 'Diminished Half', category: 'common', formula: ['1', 'b2', 'b3', '3', 'b5', '5', '6', 'b7'] },
  { id: 'diminished-whole', name: 'Diminished Whole', category: 'common', formula: ['1', '2', 'b3', '4', 'b5', 'b6', '6', '7'] },
  { id: 'diminished-whole-tone', name: 'Diminished Whole Tone', category: 'common', formula: ['1', 'b2', 'b3', '3', 'b5', 'b6', 'b7'] },
  { id: 'dominant-7th', name: 'Dominant 7th', category: 'common', formula: ['1', '2', '3', '4', '5', '6', 'b7'] },
  { id: 'lydian-augmented', name: 'Lydian Augmented', category: 'common', formula: ['1', '2', '3', '#4', '#5', '6', '7'] },
  { id: 'lydian-minor', name: 'Lydian Minor', category: 'common', formula: ['1', '2', '3', '#4', '5', 'b6', 'b7'] },
  { id: 'lydian-diminished', name: 'Lydian Diminished', category: 'common', formula: ['1', '2', 'b3', '#4', '5', '6', '7'] },
  // Rare
  { id: 'chromatic', name: 'Chromatic', category: 'rare', formula: ['1', 'b2', '2', 'b3', '3', '4', 'b5', '5', '#5', '6', 'b7', '7'] },
  { id: 'whole-tone', name: 'Whole Tone', category: 'rare', formula: ['1', '2', '3', '#4', '#5', 'b7'] },
  { id: 'auxiliary-diminished-blues', name: 'Auxiliary Diminished Blues', category: 'rare', formula: ['1', 'b2', 'b3', '3', 'b5', '5', '6', 'b7'] },
  { id: 'blues', name: 'Blues', category: 'rare', formula: ['1', 'b3', '4', '#4', '5', 'b7'] },
  { id: 'double-harmonic', name: 'Double Harmonic', category: 'rare', formula: ['1', 'b2', '3', '4', '5', 'b6', '7'] },
  { id: 'half-diminished', name: 'Half Diminished', category: 'rare', formula: ['1', 'b2', 'b3', '4', 'b5', 'b6', 'b7'] },
  { id: 'overtone-dominant', name: 'Overtone Dominant', category: 'rare', formula: ['1', '2', '3', '#4', '5', '6', 'b7'] },
  { id: 'altered', name: 'Altered', category: 'rare', formula: ['1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7'] },
  { id: 'bebop-major', name: 'Bebop Major', category: 'rare', formula: ['1', '2', '3', '4', '5', '#5', '6', '7'] },
  { id: 'bebop-minor', name: 'Bebop Minor', category: 'rare', formula: ['1', '2', 'b3', '3', '4', '5', '6', 'b7'] },
  { id: 'bebop-dominant', name: 'Bebop Dominant', category: 'rare', formula: ['1', '2', '3', '4', '5', '6', 'b7', '7'] },
  { id: 'blues-1', name: 'Blues #1', category: 'rare', formula: ['1', 'b3', '4', 'b5', '5', 'b7', '7'] },
  { id: 'blues-2', name: 'Blues #2', category: 'rare', formula: ['1', 'b3', '3', '4', 'b5', '5', 'b7', '7'] },
  { id: 'blues-3', name: 'Blues #3', category: 'rare', formula: ['1', 'b3', '3', '4', 'b5', '5', '6', 'b7', '7'] },
  { id: 'major-blues-scale', name: 'Major Blues Scale', category: 'rare', formula: ['1', '2', 'b3', '3', '5', '6'] },
  { id: 'dominant-pentatonic', name: 'Dominant Pentatonic', category: 'rare', formula: ['1', '2', '3', '5', 'b7'] },
  { id: 'phrygian-major', name: 'Phrygian Major', category: 'rare', formula: ['1', 'b2', '3', '4', '5', 'b6', 'b7'] },
  { id: 'mixo-blues', name: 'Mixo-Blues', category: 'rare', formula: ['1', 'b3', '3', '4', 'b5', '5', 'b7'] },
  // Exotic
  { id: 'algerian', name: 'Algerian', category: 'exotic', formula: ['1', '2', 'b3', '4', '#4', '5', 'b6', '7'] },
  { id: 'byzantine', name: 'Byzantine', category: 'exotic', formula: ['1', 'b2', '3', '4', '5', 'b6', '7'] },
  { id: 'egyptian', name: 'Egyptian', category: 'exotic', formula: ['1', '2', '4', '5', 'b7'] },
  { id: 'hirajoshi', name: 'Hirajoshi', category: 'exotic', formula: ['1', '2', 'b3', '5', 'b6'] },
  { id: 'hungarian-gypsy', name: 'Hungarian Gypsy', category: 'exotic', formula: ['1', '2', 'b3', '#4', '5', 'b6', '7'] },
  { id: 'hungarian-minor', name: 'Hungarian Minor', category: 'exotic', formula: ['1', '2', 'b3', '#4', '5', 'b6', '7'] },
  { id: 'kumoi', name: 'Kumoi', category: 'exotic', formula: ['1', '2', 'b3', '5', '6'] },
  { id: 'neopolitan-major', name: 'Neopolitan Major', category: 'exotic', formula: ['1', 'b2', 'b3', '4', '5', '6', '7'] },
  { id: 'neopolitan-minor', name: 'Neopolitan Minor', category: 'exotic', formula: ['1', 'b2', 'b3', '4', '5', 'b6', 'b7'] },
  { id: 'persian', name: 'Persian', category: 'exotic', formula: ['1', 'b2', '3', '4', 'b5', 'b6', '7'] },
  { id: 'spanish-gypsy', name: 'Spanish Gypsy', category: 'exotic', formula: ['1', 'b2', '3', '4', '5', 'b6', 'b7'] },
  { id: 'iwato', name: 'Iwato', category: 'exotic', formula: ['1', 'b2', '4', 'b5', 'b7'] },
  { id: 'japanese-in-sen', name: 'Japanese (in sen)', category: 'exotic', formula: ['1', 'b2', '4', '5', 'b7'] },
];

export const DEFAULT_SCALE_ID = 'major';

export function findScale(id: string): Scale | undefined {
  return SCALES.find((scale) => scale.id === id);
}

export function scalesInCategory(category: ScaleCategory): Scale[] {
  return SCALES.filter((scale) => scale.category === category);
}
