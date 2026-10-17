import { describe, expect, it } from 'vitest';
import {
  BOARD_WIDTH,
  fretCenterX,
  fretMarkers,
  fretWidth,
  fretWireX,
  horizontalSpan,
  NOTE_RADIUS,
  NUT_X,
  pieSlicePaths,
  pointOf,
  SCALE_LENGTH,
  stringThickness,
  stringY,
} from '../../src/ui/geometry';

describe('geometria do braço', () => {
  it('casas na proporção real: a casa 12 fica no meio da escala, a 24 a 3/4', () => {
    expect(fretWireX(12) - NUT_X).toBeCloseTo(SCALE_LENGTH / 2);
    expect(fretWireX(24) - NUT_X).toBeCloseTo((SCALE_LENGTH * 3) / 4);
  });

  it('cada casa é 2^(-1/12) da anterior', () => {
    for (let f = 2; f <= 24; f++) {
      expect(fretWidth(f) / fretWidth(f - 1)).toBeCloseTo(2 ** (-1 / 12));
    }
  });

  it('o círculo da nota cabe até na casa 24', () => {
    expect(fretWidth(24)).toBeGreaterThan(2 * NOTE_RADIUS);
  });

  it('casa 0 fica à esquerda do nut, as demais no meio da casa', () => {
    expect(fretCenterX(0)).toBeLessThan(NUT_X);
    expect(fretCenterX(1)).toBeCloseTo(NUT_X + fretWidth(1) / 2);
    expect(fretCenterX(12)).toBeGreaterThan(fretWireX(11));
    expect(fretCenterX(12)).toBeLessThan(fretWireX(12));
  });

  it('1ª corda no topo e mais fina que a 6ª', () => {
    expect(stringY(5)).toBeLessThan(stringY(0));
    for (let s = 1; s < 6; s++) {
      expect(stringThickness(s)).toBeLessThan(stringThickness(s - 1));
    }
  });

  it('canhoto espelha o x e mantém o y', () => {
    const right = pointOf({ string: 2, fret: 7 });
    const left = pointOf({ string: 2, fret: 7 }, true);
    expect(left.x).toBeCloseTo(BOARD_WIDTH - right.x);
    expect(left.y).toBe(right.y);
    expect(fretCenterX(0, true)).toBeGreaterThan(fretCenterX(24, true));
  });

  it('horizontalSpan funciona nos dois sentidos', () => {
    expect(horizontalSpan(10, 30)).toEqual({ x: 10, width: 20 });
    expect(horizontalSpan(10, 30, true)).toEqual({ x: BOARD_WIDTH - 30, width: 20 });
  });

  it('marcações: 8 simples + 2 duplas', () => {
    expect(fretMarkers()).toHaveLength(12);
  });
});

describe('pieSlicePaths', () => {
  it('uma fatia por âncora; nenhuma com uma só', () => {
    expect(pieSlicePaths(0, 0, 10, 1)).toEqual([]);
    expect(pieSlicePaths(0, 0, 10, 3)).toHaveLength(3);
  });

  it('duas fatias: metade de cima até embaixo pela direita, e de volta pela esquerda', () => {
    const [right, left] = pieSlicePaths(0, 0, 10, 2);
    // Começa no topo (0, -10) e termina embaixo (0, 10).
    expect(right).toMatch(/^M 0 0 L [-\de.]+ -10 A 10 10 0 0 1 [-\de.]+ 10 Z$/);
    expect(left).toMatch(/L [-\de.]+ 10 A/);
  });
});
