import { describe, expect, it } from 'vitest';
import type { FingeringStrategy } from '../../src/theory/fingering/types';
import { scaleNotes } from '../../src/theory/scales';
import {
  buildDiagonal,
  buildShape,
  buildVertical,
  composeShapes,
  MAX_ANCHOR,
  toggleAnchor,
  verticalRegion,
} from '../../src/theory/shapes';
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

describe('buildDiagonal', () => {
  it('C Pentatonic Major, região 0–12 (caso de referência)', () => {
    const shape = buildDiagonal({ start: 0, end: 12 }, scaleNotes(0, scale('pentatonic-major')), tuning('standard'));
    expect(fretsByString(shape.sequence)).toEqual([
      [0, 3, 5], [3, 5, 7], [5, 7], [5, 7, 9], [8, 10], [8, 10, 12],
    ]);
  });
});

describe('composeShapes', () => {
  const notes = scaleNotes(0, scale('pentatonic-major'));
  const t = tuning('standard');

  it('com uma forma, toda célula pertence à âncora 0', () => {
    const cells = composeShapes([buildVertical(0, notes, t)]);
    expect(cells.every((c) => c.belongsTo.length === 1 && c.belongsTo[0] === 0)).toBe(true);
  });

  it('posições compartilhadas aparecem uma vez, com as duas âncoras', () => {
    // Âncoras 2 e 3 dividem quase tudo (ver casos de referência).
    const cells = composeShapes([buildVertical(2, notes, t), buildVertical(3, notes, t)]);
    const at = (string: number, fret: number) => cells.find((c) => c.string === string && c.fret === fret);
    expect(at(0, 3)?.belongsTo).toEqual([0, 1]); // E: 3,5 nas duas
    expect(at(2, 2)?.belongsTo).toEqual([0]); // D casa 2 só na âncora 2
    expect(at(1, 7)?.belongsTo).toEqual([1]); // A casa 7 só na âncora 3
    const keys = cells.map((c) => `${c.string}:${c.fret}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('ordena por corda e casa', () => {
    const cells = composeShapes([buildVertical(12, notes, t), buildVertical(0, notes, t)]);
    const keys = cells.map((c) => c.string * 100 + c.fret);
    expect(keys).toEqual([...keys].sort((a, b) => a - b));
  });
});

describe('toggleAnchor', () => {
  it('adiciona mantendo a ordem', () => {
    expect(toggleAnchor([5], 0)).toEqual([0, 5]);
    expect(toggleAnchor([0, 12], 5)).toEqual([0, 5, 12]);
  });

  it('remove se já existe', () => {
    expect(toggleAnchor([0, 5, 12], 5)).toEqual([0, 12]);
  });

  it('nunca remove a última', () => {
    expect(toggleAnchor([7], 7)).toEqual([7]);
  });

  it('ignora casas sem botão de âncora', () => {
    expect(toggleAnchor([0], 21)).toEqual([0]);
    expect(toggleAnchor([0], -1)).toEqual([0]);
  });
});
