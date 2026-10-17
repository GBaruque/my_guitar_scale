import { describe, expect, it } from 'vitest';
import type { FingeringStrategy } from '../../src/theory/fingering/types';
import { scaleNotes } from '../../src/theory/scales';
import { buildShape, buildVertical, MAX_ANCHOR, verticalRegion } from '../../src/theory/shapes';
import { fretsByString, scale, tuning } from '../helpers';

describe('verticalRegion', () => {
  it('cobre 5 casas a partir da âncora', () => {
    expect(verticalRegion(0)).toEqual({ start: 0, end: 4 });
    expect(verticalRegion(MAX_ANCHOR)).toEqual({ start: 20, end: 24 });
  });
});

describe('buildVertical', () => {
  const notes = scaleNotes(0, scale('pentatonic-major'));
  const shape = buildVertical(0, notes, tuning('standard'));

  it('usa a estratégia de janela por padrão', () => {
    expect(fretsByString(shape.sequence)).toEqual([[0, 3], [0, 3], [0, 2], [0, 2], [1, 3], [0, 3]]);
  });

  it('descreve cada posição com grau e tônica', () => {
    expect(shape.cells).toHaveLength(shape.sequence.length);
    // 5ª corda, casa 3 = C, a tônica
    const c3 = shape.cells.find((c) => c.string === 1 && c.fret === 3);
    expect(c3?.isRoot).toBe(true);
    expect(c3?.degree).toBe('1');
    expect(shape.cells.filter((c) => c.isRoot).map((c) => [c.string, c.fret])).toEqual([
      [1, 3], [4, 1],
    ]);
  });
});

describe('buildShape', () => {
  it('aceita qualquer estratégia', () => {
    const fake: FingeringStrategy = { id: 'fake', build: () => [{ string: 0, fret: 8 }] };
    const shape = buildShape(fake, scaleNotes(0, scale('major')), tuning('standard'), { start: 0, end: 4 });
    expect(shape.cells[0].isRoot).toBe(true); // E + 8 = C
  });

  it('acusa estratégia que devolve nota fora da escala', () => {
    const broken: FingeringStrategy = { id: 'broken', build: () => [{ string: 0, fret: 2 }] }; // F#
    expect(() =>
      buildShape(broken, scaleNotes(0, scale('major')), tuning('standard'), { start: 0, end: 4 }),
    ).toThrow();
  });
});
