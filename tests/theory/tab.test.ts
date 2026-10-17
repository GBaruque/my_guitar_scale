import { describe, expect, it } from 'vitest';
import { renderTab, upAndDown } from '../../src/theory/tab';

const LABELS = ['E', 'A', 'D', 'G', 'B', 'e'];

describe('upAndDown', () => {
  it('sobe e desce sem repetir o topo', () => {
    const seq = [{ string: 5, fret: 0 }, { string: 5, fret: 3 }];
    expect(upAndDown(seq).map((p) => p.fret)).toEqual([0, 3, 0]);
  });

  it('lida com sequências curtas', () => {
    expect(upAndDown([])).toEqual([]);
    expect(upAndDown([{ string: 0, fret: 5 }])).toEqual([{ string: 0, fret: 5 }]);
  });
});

describe('renderTab', () => {
  it('mizinha: 0--3--0, 1ª corda no topo', () => {
    const seq = upAndDown([{ string: 5, fret: 0 }, { string: 5, fret: 3 }]);
    expect(renderTab(seq, LABELS)).toEqual([
      'e|-0--3--0-|',
      'B|---------|',
      'G|---------|',
      'D|---------|',
      'A|---------|',
      'E|---------|',
    ]);
  });

  it('alinha casas de dois dígitos', () => {
    const seq = [{ string: 0, fret: 10 }, { string: 1, fret: 7 }, { string: 1, fret: 12 }];
    const lines = renderTab(seq, LABELS);
    expect(lines[5]).toBe('E|-10--------|');
    expect(lines[4]).toBe('A|-----7--12-|');
    expect(new Set(lines.map((l) => l.length)).size).toBe(1);
  });

  it('alinha rótulos de tamanhos diferentes', () => {
    const lines = renderTab([{ string: 0, fret: 0 }], ['C#', 'A', 'D', 'G', 'B', 'e']);
    expect(lines[0]).toBe('e |---|');
    expect(lines[5]).toBe('C#|-0-|');
  });
});
