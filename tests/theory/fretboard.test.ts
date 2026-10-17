import { describe, expect, it } from 'vitest';
import { cellAt, FRET_COUNT, fullFretboard, midiAt, type Cell } from '../../src/theory/fretboard';
import { scaleNotes } from '../../src/theory/scales';
import { scale, tuning } from '../helpers';
/** Casas que aparecem numa corda, para comparar com tabelas legíveis. */
function fretsOn(cells: Cell[], string: number): number[] {
  return cells.filter((c) => c.string === string).map((c) => c.fret);
}

const C = 0;
const E = 4;

describe('midiAt', () => {
  it('soma a casa à corda solta', () => {
    const t = tuning('standard');
    expect(midiAt(t, { string: 0, fret: 0 })).toBe(40); // E2
    expect(midiAt(t, { string: 0, fret: 5 })).toBe(45); // A2 = 5ª corda solta
    expect(midiAt(t, { string: 5, fret: 24 })).toBe(88); // E6
  });
});

describe('cellAt', () => {
  const notes = scaleNotes(C, scale('major'));
  const t = tuning('standard');

  it('identifica a tônica', () => {
    // 5ª corda, casa 3 = C3
    expect(cellAt(t, { string: 1, fret: 3 }, notes)).toEqual({
      string: 1, fret: 3, midi: 48, pitchClass: 0, degree: '1', isRoot: true,
    });
  });

  it('identifica outro grau', () => {
    const cell = cellAt(t, { string: 0, fret: 0 }, notes); // E = 3º grau de C
    expect(cell?.degree).toBe('3');
    expect(cell?.isRoot).toBe(false);
  });

  it('retorna null fora da escala', () => {
    expect(cellAt(t, { string: 0, fret: 2 }, notes)).toBeNull(); // F#
  });
});

describe('fullFretboard', () => {
  it('C Major na 6ª corda (padrão), casas 0–24', () => {
    const cells = fullFretboard(tuning('standard'), scaleNotes(C, scale('major')));
    expect(fretsOn(cells, 0)).toEqual([0, 1, 3, 5, 7, 8, 10, 12, 13, 15, 17, 19, 20, 22, 24]);
  });

  it('cobre as 6 cordas e não passa de FRET_COUNT', () => {
    const cells = fullFretboard(tuning('standard'), scaleNotes(C, scale('major')));
    // 25 casas × 7/12 das notas: 14 ou 15 por corda conforme a nota da corda solta.
    for (let s = 0; s < 6; s++) {
      expect(fretsOn(cells, s).length).toBeGreaterThanOrEqual(14);
    }
    expect(Math.max(...cells.map((c) => c.fret))).toBe(FRET_COUNT);
    expect(Math.min(...cells.map((c) => c.fret))).toBe(0);
  });

  it('é ordenado por corda e depois por casa', () => {
    const cells = fullFretboard(tuning('standard'), scaleNotes(C, scale('pentatonic-major')));
    const keys = cells.map((c) => c.string * 100 + c.fret);
    expect(keys).toEqual([...keys].sort((a, b) => a - b));
  });

  it('casas 0–4 batem com o caso de referência do Vertical (C Pentatonic Major, âncora 0)', () => {
    // Nesta janela cada corda tem exatamente as notas da escala, então Full e Vertical coincidem.
    const cells = fullFretboard(tuning('standard'), scaleNotes(C, scale('pentatonic-major')))
      .filter((c) => c.fret <= 4);
    const expected = [[0, 3], [0, 3], [0, 2], [0, 2], [1, 3], [0, 3]];
    expect([0, 1, 2, 3, 4, 5].map((s) => fretsOn(cells, s))).toEqual(expected);
  });

  it('E Overtone Dominant, casas 0–4 (padrão)', () => {
    const cells = fullFretboard(tuning('standard'), scaleNotes(E, scale('overtone-dominant')))
      .filter((c) => c.fret <= 4);
    // Full mostra tudo; o Vertical (marco 5) escolhe um subconjunto destas.
    expect([0, 1, 2, 3, 4, 5].map((s) => fretsOn(cells, s))).toEqual([
      [0, 2, 4], [1, 2, 4], [0, 2, 4], [1, 3, 4], [0, 2, 3], [0, 2, 4],
    ]);
  });

  it('Open G: usa as notas reais das cordas', () => {
    const t = tuning('open-g'); // D G D G B D
    const cells = fullFretboard(t, scaleNotes(C, scale('major')));
    // 6ª corda é D: D(0) E(2) F(3) G(5) A(7) B(9) C(10) D(12)
    expect(fretsOn(cells, 0).filter((f) => f <= 12)).toEqual([0, 2, 3, 5, 7, 9, 10, 12]);
    // 1ª corda também é D (e não E como na padrão)
    expect(fretsOn(cells, 5).filter((f) => f <= 12)).toEqual([0, 2, 3, 5, 7, 9, 10, 12]);
    // Tônica (C) na 6ª corda fica na casa 10
    expect(cells.filter((c) => c.string === 0 && c.isRoot).map((c) => c.fret)).toEqual([10, 22]);
  });
});
