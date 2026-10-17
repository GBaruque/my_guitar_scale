// Afinações como dados. Regra do projeto: nenhum algoritmo assume afinação padrão;
// tudo lê `strings` da afinação atual.

import { type Accidental, type Midi, noteName, pitchClassOf } from './notes';

/** Número de cordas. Índice 0 = 6ª corda (mais grave), índice 5 = 1ª corda (mais aguda). */
export const STRING_COUNT = 6;

export interface Tuning {
  id: string;
  name: string;
  /** Altura MIDI de cada corda solta, da mais grave (6ª) para a mais aguda (1ª). */
  strings: Midi[];
}

// Referência de oitavas: E2 = 40, A2 = 45, D3 = 50, G3 = 55, B3 = 59, E4 = 64.
// As afinações rebaixadas descem a partir daí (Drop A = A1 = 33); as abertas mexem
// o mínimo possível em cada corda (Open G: 6ª E2 → D2, 5ª A2 → G2, 1ª E4 → D4).
export const TUNINGS: Tuning[] = [
  { id: 'standard', name: 'Standard', strings: [40, 45, 50, 55, 59, 64] },      // E2 A2 D3 G3 B3 E4
  { id: 'standard-c', name: 'Standard C', strings: [36, 41, 46, 51, 55, 60] },  // C2 F2 A#2 D#3 G3 C4
  { id: 'standard-d', name: 'Standard D', strings: [38, 43, 48, 53, 57, 62] },  // D2 G2 C3 F3 A3 D4
  { id: 'drop-d', name: 'Drop D', strings: [38, 45, 50, 55, 59, 64] },          // D2 A2 D3 G3 B3 E4
  { id: 'drop-c', name: 'Drop C', strings: [36, 43, 48, 53, 57, 62] },          // C2 G2 C3 F3 A3 D4
  { id: 'drop-b', name: 'Drop B', strings: [35, 42, 47, 52, 56, 61] },          // B1 F#2 B2 E3 G#3 C#4
  { id: 'drop-a', name: 'Drop A', strings: [33, 40, 45, 50, 54, 59] },          // A1 E2 A2 D3 F#3 B3
  { id: 'double-drop-d', name: 'Double Drop D', strings: [38, 45, 50, 55, 59, 62] }, // D2 A2 D3 G3 B3 D4
  { id: 'open-g', name: 'Open G', strings: [38, 43, 50, 55, 59, 62] },          // D2 G2 D3 G3 B3 D4
  { id: 'open-d', name: 'Open D', strings: [38, 45, 50, 54, 57, 62] },          // D2 A2 D3 F#3 A3 D4
  { id: 'open-e', name: 'Open E', strings: [40, 47, 52, 56, 59, 64] },          // E2 B2 E3 G#3 B3 E4
  { id: 'open-c', name: 'Open C', strings: [36, 43, 48, 55, 60, 64] },          // C2 G2 C3 G3 C4 E4
  { id: 'open-a', name: 'Open A', strings: [40, 45, 49, 52, 57, 64] },          // E2 A2 C#3 E3 A3 E4
  { id: 'modal-c6', name: 'Modal C6', strings: [36, 45, 48, 55, 60, 64] },      // C2 A2 C3 G3 C4 E4
  { id: 'dadgad', name: 'DADGAD', strings: [38, 45, 50, 55, 57, 62] },          // D2 A2 D3 G3 A3 D4
];

export const DEFAULT_TUNING_ID = 'standard';

export function findTuning(id: string): Tuning | undefined {
  return TUNINGS.find((tuning) => tuning.id === id);
}

/** Nomes das cordas soltas, da 6ª para a 1ª. Ex.: Standard → ['E','A','D','G','B','E']. */
export function tuningNoteNames(tuning: Tuning, accidental: Accidental = 'sharp'): string[] {
  return tuning.strings.map((midi) => noteName(pitchClassOf(midi), accidental));
}

/**
 * Distância em semitons entre a corda `k` e a corda `k + 1` (a de cima).
 * Na afinação padrão é 5 em todas, exceto G→B (4); nas abertas varia bastante.
 */
export function intervalBetweenStrings(tuning: Tuning, k: number): number {
  return tuning.strings[k + 1] - tuning.strings[k];
}
