// O que o botão de som toca, como dados. A parte que realmente produz som (Web Audio)
// fica em src/audio/; aqui só decidimos quais notas, em que ordem e onde estão no braço.

import { midiAt, type Position } from './fretboard';
import type { FingeringStrategy } from './fingering/types';
import { windowStrategy } from './fingering/window';
import { intervalUp, type Midi, pitchClassOf, SEMITONES_PER_OCTAVE } from './notes';
import type { ScaleNote } from './scales';
import { verticalRegion } from './shapes';
import { upAndDown } from './tab';
import type { Tuning } from './tunings';

export interface PlaybackStep {
  midi: Midi;
  /** Onde a nota está no braço (para destacar enquanto toca), ou null se não houver posição. */
  position: Position | null;
}

/** Uma frase = uma sequência tocada de uma vez; entre frases há uma pausa. */
export type Phrase = PlaybackStep[];

/**
 * Vertical e Diagonal: cada sequência sobe e desce, igual à tablatura.
 * Com várias âncoras, uma frase por âncora, na ordem das âncoras.
 */
export function shapePhrases(sequences: Position[][], tuning: Tuning): Phrase[] {
  return sequences
    .filter((sequence) => sequence.length > 0)
    .map((sequence) =>
      upAndDown(sequence).map((position) => ({ midi: midiAt(tuning, position), position })),
    );
}

/**
 * Modo Full (não há uma sequência desenhada): a escala por uma oitava, subindo e descendo sem
 * repetir o topo, a partir da tônica mais grave da corda mais grave (6ª).
 *
 * Para poder destacar as notas no braço, cada uma ganha uma posição: usamos a mesma janela
 * deslizante do Vertical, ancorada na casa dessa tônica, e pegamos só a oitava tônica → tônica.
 * Como a janela começa exatamente na tônica, a primeira nota dela é a própria tônica.
 */
export function scaleRunPhrase(
  notes: ScaleNote[],
  tuning: Tuning,
  strategy: FingeringStrategy = windowStrategy,
): Phrase {
  if (notes.length === 0) return [];
  const lowestOpen = tuning.strings[0];
  const rootFret = intervalUp(pitchClassOf(lowestOpen), notes[0].pitchClass); // 0–11
  const root = lowestOpen + rootFret;

  const sequence = strategy.build({
    scale: notes.map((n) => n.pitchClass),
    tuning,
    region: verticalRegion(rootFret),
  });
  const up = sequence
    .map((position) => ({ midi: midiAt(tuning, position), position }))
    .filter((step) => step.midi >= root && step.midi <= root + SEMITONES_PER_OCTAVE);
  return [...up, ...up.slice(0, -1).reverse()];
}
