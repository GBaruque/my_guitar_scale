// Notas como números. Aqui não existe "C#" nem "Db" internamente: só 0–11.
// Nomes aparecem apenas na camada de exibição (ver noteName).

/** Classe de altura: 0–11, com C = 0. Ignora a oitava (todo C é 0). */
export type PitchClass = number;

/** Altura absoluta como número MIDI (C4 = 60, E grave da guitarra = 40). */
export type Midi = number;

/** Como escrever as notas pretas: C# (sustenido) ou Db (bemol). */
export type Accidental = 'sharp' | 'flat';

/** Semitons numa oitava. */
export const SEMITONES_PER_OCTAVE = 12;

// Na v1 o nome depende só da classe de altura, sem grafia dependente de tonalidade
// (ex.: em F maior o 4º grau seria "Bb", mas no modo sustenido aparece "A#").
const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Posição das notas naturais, usada para interpretar nomes como "F#" ou "Bb".
const NATURAL_PITCH: Record<string, PitchClass> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
};

/**
 * Resto sempre positivo. O `%` do JavaScript mantém o sinal (-1 % 12 === -1),
 * diferente do Python; por isso precisamos deste ajuste.
 */
export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/** Referência de afinação: o Lá central (A4, MIDI 69) vibra a 440 Hz. */
export const A4_MIDI = 69;
export const A4_FREQUENCY = 440;

/**
 * Frequência em Hz de uma nota MIDI. Cada semitom multiplica a frequência por 2^(1/12)
 * (temperamento igual), então uma oitava (12 semitons) dobra a frequência.
 */
export function midiToFrequency(midi: Midi): number {
  return A4_FREQUENCY * 2 ** ((midi - A4_MIDI) / SEMITONES_PER_OCTAVE);
}

/** Classe de altura de uma nota MIDI (descarta a oitava). */
export function pitchClassOf(midi: Midi): PitchClass {
  return mod(midi, SEMITONES_PER_OCTAVE);
}

/** Sobe (ou desce, se negativo) uma classe de altura, dando a volta na oitava. */
export function transpose(pc: PitchClass, semitones: number): PitchClass {
  return mod(pc + semitones, SEMITONES_PER_OCTAVE);
}

/** Distância ascendente de `from` até `to`, em semitons (0–11). Ex.: C → G = 7, G → C = 5. */
export function intervalUp(from: PitchClass, to: PitchClass): number {
  return mod(to - from, SEMITONES_PER_OCTAVE);
}

/** Nome de exibição de uma classe de altura. */
export function noteName(pc: PitchClass, accidental: Accidental = 'sharp'): string {
  const names = accidental === 'sharp' ? SHARP_NAMES : FLAT_NAMES;
  return names[mod(pc, SEMITONES_PER_OCTAVE)];
}

/**
 * Nota natural (sem acidente: C, D, E, F, G, A, B), as "teclas brancas" do piano.
 * As outras cinco são as que levam # ou b no nome (as "teclas pretas").
 */
export function isNatural(pc: PitchClass): boolean {
  return Object.values(NATURAL_PITCH).includes(mod(pc, SEMITONES_PER_OCTAVE));
}

/** As 12 tônicas na ordem de exibição (C, C#, D...). */
export function allPitchClasses(): PitchClass[] {
  return Array.from({ length: SEMITONES_PER_OCTAVE }, (_, i) => i);
}

/**
 * Converte um nome ("C", "F#", "Bb", "c#") em classe de altura.
 * Aceita vários acidentes ("Cbb", "F##"). Retorna `null` se o nome for inválido.
 * Útil para ler a tônica da URL (`?root=C#`).
 */
export function parseNoteName(name: string): PitchClass | null {
  const match = /^([A-Ga-g])([#b]*)$/.exec(name.trim());
  if (!match) return null;
  const [, letter, accidentals] = match;
  let pc = NATURAL_PITCH[letter.toUpperCase()];
  for (const sign of accidentals) {
    pc += sign === '#' ? 1 : -1;
  }
  return mod(pc, SEMITONES_PER_OCTAVE);
}
