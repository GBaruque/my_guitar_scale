// Contrato das estratégias de digitação: dado escala + afinação + região do braço,
// devolvem a sequência ascendente de posições. Vertical e Diagonal usam a mesma estratégia;
// uma futura estratégia "N notas por corda" só precisa implementar esta interface.

import type { PitchClass } from '../notes';
import type { Position } from '../fretboard';
import type { Tuning } from '../tunings';

/**
 * Alcance da mão em casas: 4 dedos, um por casa, mais uma casa de esticada.
 * O Vertical numa âncora `a` cobre as casas `a` a `a + WINDOW_SIZE - 1`.
 */
export const WINDOW_SIZE = 5;

/** Intervalo de casas, com as duas pontas incluídas. */
export interface FretRegion {
  start: number;
  end: number;
}

export interface FingeringInput {
  /** Classes de altura da escala, já transpostas para a tônica. */
  scale: PitchClass[];
  tuning: Tuning;
  /** Vertical: { start: a, end: a + 4 }. Diagonal: { start, end } com end − start ≥ 10. */
  region: FretRegion;
}

export interface FingeringStrategy {
  id: string;
  /** Sequência ascendente de posições. Pura e determinística. */
  build(input: FingeringInput): Position[];
}
