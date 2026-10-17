import { describe, expect, it } from 'vitest';
import { DEFAULT_REGION, isValidRegion, selectRegionFret } from '../../src/theory/region';

describe('selectRegionFret', () => {
  it('clique fora da região estica para o lado do clique', () => {
    expect(selectRegionFret({ start: 5, end: 15 }, 2)).toEqual({ start: 2, end: 15 });
    expect(selectRegionFret(DEFAULT_REGION, 17)).toEqual({ start: 0, end: 17 });
    expect(selectRegionFret({ start: 5, end: 15 }, 0)).toEqual({ start: 0, end: 15 });
    expect(selectRegionFret({ start: 5, end: 15 }, 24)).toEqual({ start: 5, end: 24 });
  });

  it('clique dentro move a ponta mais próxima', () => {
    expect(selectRegionFret({ start: 0, end: 20 }, 15)).toEqual({ start: 0, end: 15 });
    expect(selectRegionFret({ start: 0, end: 20 }, 4)).toEqual({ start: 4, end: 20 });
  });

  it('o caso relatado: dá para chegar em 0–10', () => {
    expect(selectRegionFret(DEFAULT_REGION, 10)).toEqual({ start: 0, end: 10 });
    expect(selectRegionFret({ start: 0, end: 17 }, 10)).toEqual({ start: 0, end: 10 });
  });

  it('e num início depois da metade: 14–24', () => {
    expect(selectRegionFret({ start: 10, end: 24 }, 14)).toEqual({ start: 14, end: 24 });
  });

  it('empate: até a casa 12 move o início, depois o fim', () => {
    expect(selectRegionFret({ start: 0, end: 12 }, 6)).toEqual({ start: 6, end: 16 });
    expect(selectRegionFret({ start: 4, end: 24 }, 14)).toEqual({ start: 4, end: 14 });
  });

  it('empurra a outra ponta para manter 10 casas', () => {
    // 12 está mais perto do início (5) que do fim (20): início → 12, fim empurrado para 22.
    expect(selectRegionFret({ start: 5, end: 20 }, 12)).toEqual({ start: 12, end: 22 });
    // 14 está mais perto do fim (20): fim → 14, início empurrado para 4.
    expect(selectRegionFret({ start: 6, end: 20 }, 14)).toEqual({ start: 4, end: 14 });
    // 20 está mais perto do fim (24): fim → 20, início empurrado para 10.
    expect(selectRegionFret({ start: 14, end: 24 }, 20)).toEqual({ start: 10, end: 20 });
  });

  it('para no limite quando a outra ponta não pode ser empurrada', () => {
    // Fim na casa 7 exigiria início −3: o fim para em 10.
    expect(selectRegionFret({ start: 0, end: 10 }, 7)).toEqual({ start: 0, end: 10 });
    expect(selectRegionFret({ start: 0, end: 14 }, 8)).toEqual({ start: 0, end: 10 });
    // Início na casa 16 exigiria fim 26: o início para em 14.
    expect(selectRegionFret({ start: 12, end: 24 }, 16)).toEqual({ start: 14, end: 24 });
  });

  it('o resultado é sempre válido', () => {
    let region = DEFAULT_REGION;
    for (let i = 0; i < 200; i++) {
      const fret = (i * 7 + 3) % 25;
      region = selectRegionFret(region, fret);
      expect(isValidRegion(region), `${fret} → ${JSON.stringify(region)}`).toBe(true);
    }
  });

  it('ignora casas fora do braço', () => {
    expect(selectRegionFret(DEFAULT_REGION, 25)).toBe(DEFAULT_REGION);
    expect(selectRegionFret(DEFAULT_REGION, -1)).toBe(DEFAULT_REGION);
  });
});

describe('isValidRegion', () => {
  it('rejeita regiões curtas, fora do braço ou não inteiras', () => {
    expect(isValidRegion({ start: 0, end: 12 })).toBe(true);
    expect(isValidRegion({ start: 0, end: 9 })).toBe(false);
    expect(isValidRegion({ start: -1, end: 12 })).toBe(false);
    expect(isValidRegion({ start: 14, end: 25 })).toBe(false);
    expect(isValidRegion({ start: 0.5, end: 12 })).toBe(false);
  });
});
