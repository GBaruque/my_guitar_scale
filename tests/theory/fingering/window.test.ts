import { describe, expect, it } from 'vitest';
import { midiAt } from '../../../src/theory/fretboard';
import { windowBounds, windowStrategy } from '../../../src/theory/fingering/window';
import { pitchClassOf } from '../../../src/theory/notes';
import { scalePitchClasses } from '../../../src/theory/scales';
import { MAX_ANCHOR, verticalRegion } from '../../../src/theory/shapes';
import { TUNINGS } from '../../../src/theory/tunings';
import { fretsByString, scale, tuning } from '../../helpers';

const C = 0;
const E = 4;

function vertical(root: number, scaleId: string, anchor: number, tuningId = 'standard') {
  return windowStrategy.build({
    scale: scalePitchClasses(root, scale(scaleId)),
    tuning: tuning(tuningId),
    region: verticalRegion(anchor),
  });
}

describe('windowBounds', () => {
  it('Vertical na afinação padrão: todas as cordas em [a, a+4]', () => {
    expect(windowBounds(tuning('standard'), verticalRegion(3))).toEqual({
      lower: [3, 3, 3, 3, 3, 3],
      upper: [7, 7, 7, 7, 7, 7],
    });
  });

  it('Open G: estica as cordas cujo intervalo para a de cima é maior que uma quarta', () => {
    // Intervalos D-G-D-G-B-D: 5, 7, 5, 4, 3. Só G2→D3 (7) exige casa extra.
    expect(windowBounds(tuning('open-g'), verticalRegion(0)).upper).toEqual([4, 6, 4, 4, 4, 4]);
  });

  it('Diagonal 0–12 na afinação padrão', () => {
    expect(windowBounds(tuning('standard'), { start: 0, end: 12 })).toEqual({
      lower: [0, 2, 3, 5, 6, 8],
      upper: [6, 7, 9, 9, 12, 12],
    });
  });

  it('nunca passa da casa 24', () => {
    const { upper } = windowBounds(tuning('open-g'), verticalRegion(MAX_ANCHOR));
    expect(Math.max(...upper)).toBe(24);
  });
});

// Casos de referência conferidos no site (CLAUDE.md). Frets por corda, da 6ª para a 1ª.
describe('Vertical: casos de referência do site', () => {
  it.each([
    [0, [[0, 3], [0, 3], [0, 2], [0, 2], [1, 3], [0, 3]]],
    [1, [[3, 5], [3, 5], [2, 5], [2], [1, 3, 5], [3, 5]]],
    [2, [[3, 5], [3, 5], [2, 5], [2, 5], [3, 5], [3, 5]]],
    [3, [[3, 5], [3, 5, 7], [5, 7], [5], [3, 5], [3, 5]]],
    [4, [[5, 8], [5, 7], [5, 7], [5, 7], [5, 8], [5, 8]]],
    [16, [[17, 20], [17, 19], [17, 19], [17, 19], [17, 20], [17, 20]]],
  ])('C Pentatonic Major, âncora %i', (anchor, expected) => {
    expect(fretsByString(vertical(C, 'pentatonic-major', anchor))).toEqual(expected);
  });

  it('E Overtone Dominant, âncora 0', () => {
    expect(fretsByString(vertical(E, 'overtone-dominant', 0))).toEqual([
      [0, 2, 4], [1, 2, 4], [0, 2, 4], [1, 3], [0, 2, 3], [0, 2, 4],
    ]);
  });
});

describe('Diagonal: caso de referência (nossa estratégia)', () => {
  it('C Pentatonic Major, região 0–12', () => {
    const sequence = windowStrategy.build({
      scale: scalePitchClasses(C, scale('pentatonic-major')),
      tuning: tuning('standard'),
      region: { start: 0, end: 12 },
    });
    expect(fretsByString(sequence)).toEqual([
      [0, 3, 5], [3, 5, 7], [5, 7], [5, 7, 9], [8, 10], [8, 10, 12],
    ]);
  });
});

describe('propriedades em todas as afinações e âncoras', () => {
  const scaleIds = ['major', 'pentatonic-major', 'overtone-dominant', 'algerian'];

  it.each(TUNINGS.map((t) => [t.id]))('%s: sequência sem buracos e dentro da janela', (tuningId) => {
    const t = tuning(tuningId);
    for (const scaleId of scaleIds) {
      const pcs = scalePitchClasses(C, scale(scaleId));
      for (let anchor = 0; anchor <= MAX_ANCHOR; anchor++) {
        const region = verticalRegion(anchor);
        const sequence = windowStrategy.build({ scale: pcs, tuning: t, region });
        const { lower, upper } = windowBounds(t, region);
        const label = `${scaleId} âncora ${anchor}`;

        // Cobre pelo menos uma oitava completa.
        expect(sequence.length, label).toBeGreaterThan(pcs.length);

        const midis = sequence.map((p) => midiAt(t, p));
        for (let i = 0; i < sequence.length; i++) {
          const p = sequence[i];
          expect(p.fret, label).toBeGreaterThanOrEqual(lower[p.string]);
          expect(p.fret, label).toBeLessThanOrEqual(upper[p.string]);
          expect(pcs, label).toContain(pitchClassOf(midis[i]));
          if (i > 0) {
            // Nunca desce de corda, e entre duas notas seguidas não sobra nenhuma nota da escala.
            expect(p.string, label).toBeGreaterThanOrEqual(sequence[i - 1].string);
            // Exceção: notas que nenhuma corda alcança dentro da janela (corte na casa 24).
            for (let m = midis[i - 1] + 1; m < midis[i]; m++) {
              if (!pcs.includes(pitchClassOf(m))) continue;
              const reachable = t.strings.some((open, s) => {
                const fret = m - open;
                return s >= sequence[i - 1].string && fret >= lower[s] && fret <= upper[s];
              });
              expect(reachable, `${label}: buraco em ${m}`).toBe(false);
            }
            expect(midis[i], label).toBeGreaterThan(midis[i - 1]);
          }
        }
      }
    }
  });

  it('afinação padrão nunca tem buracos, em nenhuma âncora', () => {
    const pcs = scalePitchClasses(C, scale('major'));
    for (let anchor = 0; anchor <= MAX_ANCHOR; anchor++) {
      const t = tuning('standard');
      const midis = windowStrategy.build({ scale: pcs, tuning: t, region: verticalRegion(anchor) })
        .map((p) => midiAt(t, p));
      for (let i = 1; i < midis.length; i++) {
        for (let m = midis[i - 1] + 1; m < midis[i]; m++) {
          expect(pcs, `âncora ${anchor}: buraco em ${m}`).not.toContain(pitchClassOf(m));
        }
      }
    }
  });

  it('Drop D, âncora 20: pula as notas inalcançáveis em vez de parar', () => {
    const sequence = vertical(C, 'major', 20, 'drop-d');
    // 6ª corda (D2) vai só até a casa 24; a 5ª (A2) começa na 20. Sem o "pular",
    // a sequência acabaria na 6ª corda.
    expect(fretsByString(sequence)[0]).toEqual([21, 22, 24]);
    expect(fretsByString(sequence)[5]).toEqual([20, 22, 24]);
  });

  it('escala vazia gera sequência vazia', () => {
    expect(windowStrategy.build({ scale: [], tuning: tuning('standard'), region: verticalRegion(0) }))
      .toEqual([]);
  });
});
