// Seleção da região do Diagonal por clique (ver CLAUDE.md, "Diagonal").

import { FRET_COUNT } from './fretboard';
import type { FretRegion } from './fingering/types';

/** Menor distância entre início e fim do Diagonal: abaixo disso ele vira quase um Vertical. */
export const MIN_DIAGONAL_SPAN = 10;
/** Desempate: com a casa clicada à mesma distância das duas pontas, até aqui move o início. */
export const MID_FRET = FRET_COUNT / 2;
export const DEFAULT_REGION: FretRegion = { start: 0, end: 12 };

/**
 * Novo intervalo depois de clicar na casa `fret`.
 *
 * O clique move a ponta mais próxima da casa clicada. Fora da região isso estica a região
 * para o lado do clique; dentro, encolhe pelo lado mais perto (ex.: 0–12, clique no 10 → 0–10).
 * Empate: até MID_FRET move o início, depois move o fim.
 *
 * Se o intervalo ficar menor que MIN_DIAGONAL_SPAN, a outra ponta é empurrada. Se nem assim
 * couber no braço (ex.: fim na casa 5), a ponta clicada para no limite possível (fim = 10).
 *
 * (A primeira versão decidia só por "≤ 12 move o início", o que tornava impossível escolher,
 * por exemplo, 0–10: clicar no 10 sempre movia o início.)
 */
export function selectRegionFret(region: FretRegion, fret: number): FretRegion {
  if (!Number.isInteger(fret) || fret < 0 || fret > FRET_COUNT) return region;

  const toStart = Math.abs(fret - region.start);
  const toEnd = Math.abs(fret - region.end);
  const moveStart = toStart < toEnd || (toStart === toEnd && fret <= MID_FRET);

  if (moveStart) {
    const start = Math.min(fret, FRET_COUNT - MIN_DIAGONAL_SPAN);
    return { start, end: Math.max(region.end, start + MIN_DIAGONAL_SPAN) };
  }
  const end = Math.max(fret, MIN_DIAGONAL_SPAN);
  return { start: Math.min(region.start, end - MIN_DIAGONAL_SPAN), end };
}

/** Uma região é válida se cabe no braço e respeita o tamanho mínimo (usado ao ler a URL). */
export function isValidRegion(region: FretRegion): boolean {
  return (
    Number.isInteger(region.start) &&
    Number.isInteger(region.end) &&
    region.start >= 0 &&
    region.end <= FRET_COUNT &&
    region.end - region.start >= MIN_DIAGONAL_SPAN
  );
}
