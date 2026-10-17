// Estratégia 1: janela deslizante.
//
// Cada corda recebe uma janela de casas [L, U]. No Vertical todas as janelas começam na âncora;
// no Diagonal elas vão andando para a direita conforme a corda fica mais aguda.
// Depois a escala é tocada de baixo para cima, sempre preferindo mudar para a corda de cima
// assim que a nota cabe nela (é o que a mão faz: não estica numa corda o que a próxima alcança).

import { FRET_COUNT, midiAt, type Position } from '../fretboard';
import { type Midi, pitchClassOf } from '../notes';
import { intervalBetweenStrings, type Tuning } from '../tunings';
import { type FingeringInput, type FingeringStrategy, type FretRegion, WINDOW_SIZE } from './types';

/** Distância da primeira à última casa de uma janela (5 casas → 4). */
const WINDOW_SPAN = WINDOW_SIZE - 1;

export interface WindowBounds {
  /** Casa mais baixa permitida em cada corda (índice 0 = 6ª corda). */
  lower: number[];
  /** Casa mais alta permitida em cada corda. */
  upper: number[];
}

function clampFret(fret: number): number {
  return Math.min(Math.max(fret, 0), FRET_COUNT);
}

/** Limites [L[k], U[k]] de cada corda para uma região. Ver fórmulas no CLAUDE.md. */
export function windowBounds(tuning: Tuning, region: FretRegion): WindowBounds {
  const stringCount = tuning.strings.length;
  const last = stringCount - 1;

  // L[k] interpola de `start` (6ª corda) até `end − 4` (1ª corda), de modo que a janela
  // da 1ª corda termina exatamente em `end`. No Vertical (end = start + 4) o passo é zero.
  const step = (region.end - WINDOW_SPAN - region.start) / last;
  const lower = tuning.strings.map((_, k) => clampFret(Math.round(region.start + k * step)));

  // U[k]: pelo menos 5 casas, mas a corda k precisa alcançar até um semitom abaixo da nota
  // mais grave permitida na corda k+1. Senão sobraria um "buraco" de alturas entre as duas.
  // Ex.: em Open G, G2 → D3 são 7 semitons; com L = 0 na corda de cima, a de baixo vai até a casa 6.
  const upper = new Array<number>(stringCount);
  upper[last] = clampFret(lower[last] + WINDOW_SPAN);
  for (let k = last - 1; k >= 0; k--) {
    const reachNextString = lower[k + 1] + intervalBetweenStrings(tuning, k) - 1;
    upper[k] = clampFret(Math.max(lower[k] + WINDOW_SPAN, reachNextString));
  }

  return { lower, upper };
}

function fitsOnString(tuning: Tuning, bounds: WindowBounds, string: number, midi: Midi): boolean {
  const fret = midi - tuning.strings[string];
  return fret >= bounds.lower[string] && fret <= bounds.upper[string];
}

/** A primeira nota: a nota da escala mais grave dentro da janela da corda mais grave. */
function firstPosition(tuning: Tuning, bounds: WindowBounds, inScale: Set<number>): Position | null {
  // Começamos na 6ª corda. As cordas seguintes são só uma salvaguarda para escalas com
  // um intervalo maior que a janela (não acontece no catálogo atual).
  for (let string = 0; string < tuning.strings.length; string++) {
    for (let fret = bounds.lower[string]; fret <= bounds.upper[string]; fret++) {
      if (inScale.has(pitchClassOf(midiAt(tuning, { string, fret })))) {
        return { string, fret };
      }
    }
  }
  return null;
}

/** Ordem de preferência para a próxima nota: corda de cima, corda atual, demais acima. */
function candidateStrings(current: number, stringCount: number): number[] {
  const candidates: number[] = [];
  if (current + 1 < stringCount) candidates.push(current + 1);
  candidates.push(current);
  for (let s = current + 2; s < stringCount; s++) candidates.push(s);
  return candidates;
}

export const windowStrategy: FingeringStrategy = {
  id: 'window',

  build({ scale, tuning, region }: FingeringInput): Position[] {
    if (scale.length === 0) return [];
    const inScale = new Set(scale);
    const bounds = windowBounds(tuning, region);

    const first = firstPosition(tuning, bounds, inScale);
    if (!first) return [];

    // Nota mais aguda que a janela alcança: acima dela, a sequência termina.
    const highest = Math.max(...tuning.strings.map((open, s) => open + bounds.upper[s]));

    const sequence: Position[] = [first];
    let current = first;
    let midi = midiAt(tuning, first);

    while (true) {
      // Próxima altura da escala acima da atual. Cada altura aparece uma vez só.
      do {
        midi++;
      } while (!inScale.has(pitchClassOf(midi)));
      if (midi > highest) break;

      const string = candidateStrings(current.string, tuning.strings.length).find((s) =>
        fitsOnString(tuning, bounds, s, midi),
      );
      // Não coube em lugar nenhum, mas ainda há notas alcançáveis acima. Isso só acontece
      // quando U[k] foi cortado na casa 24 (ex.: Drop D, âncora 20: a 6ª corda precisaria
      // ir até a casa 26 para encostar na 5ª). A nota não existe nesta janela; pulamos
      // e seguimos, em vez de encerrar a sequência depois de 3 ou 4 notas.
      if (string === undefined) continue;

      current = { string, fret: midi - tuning.strings[string] };
      sequence.push(current);
    }

    return sequence;
  },
};
