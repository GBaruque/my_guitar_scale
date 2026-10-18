import { describe, expect, it } from 'vitest';
import { noteName } from '../../src/theory/notes';
import {
  degreeToSemitones,
  findScale,
  formulaToSemitones,
  SCALES,
  scaleNotes,
  scalePitchClasses,
  scalesInCategory,
  type Scale,
} from '../../src/theory/scales';

function scale(id: string): Scale {
  const found = findScale(id);
  if (!found) throw new Error(`escala ${id} não encontrada`);
  return found;
}

describe('degreeToSemitones', () => {
  it('graus naturais seguem a escala maior', () => {
    expect(['1', '2', '3', '4', '5', '6', '7'].map(degreeToSemitones)).toEqual([0, 2, 4, 5, 7, 9, 11]);
  });

  it('b abaixa e # sobe um semitom', () => {
    expect(degreeToSemitones('b3')).toBe(3);
    expect(degreeToSemitones('#4')).toBe(6);
    expect(degreeToSemitones('b5')).toBe(6); // mesmo semitom que #4, grafia diferente
    expect(degreeToSemitones('bb7')).toBe(9);
  });

  it('graus compostos somam uma oitava', () => {
    expect(degreeToSemitones('8')).toBe(12);
    expect(degreeToSemitones('9')).toBe(14);
    expect(degreeToSemitones('b9')).toBe(13);
  });

  it('rejeita graus mal formados', () => {
    expect(() => degreeToSemitones('')).toThrow();
    expect(() => degreeToSemitones('0')).toThrow();
    expect(() => degreeToSemitones('3b')).toThrow();
    expect(() => degreeToSemitones('x')).toThrow();
  });
});

describe('formulaToSemitones', () => {
  it('converte as fórmulas confirmadas', () => {
    expect(formulaToSemitones(scale('pentatonic-major').formula)).toEqual([0, 2, 4, 7, 9]);
    expect(formulaToSemitones(scale('major').formula)).toEqual([0, 2, 4, 5, 7, 9, 11]);
    expect(formulaToSemitones(scale('overtone-dominant').formula)).toEqual([0, 2, 4, 6, 7, 9, 10]);
    expect(formulaToSemitones(scale('algerian').formula)).toEqual([0, 2, 3, 5, 6, 7, 8, 11]);
  });
});

describe('scaleNotes', () => {
  it('transpõe para a tônica mantendo o grau', () => {
    expect(scaleNotes(0, scale('pentatonic-major'))).toEqual([
      { pitchClass: 0, degree: '1' },
      { pitchClass: 2, degree: '2' },
      { pitchClass: 4, degree: '3' },
      { pitchClass: 7, degree: '5' },
      { pitchClass: 9, degree: '6' },
    ]);
  });

  it('dá a volta na oitava: E Overtone Dominant', () => {
    const names = scalePitchClasses(4, scale('overtone-dominant')).map((pc) => noteName(pc));
    expect(names).toEqual(['E', 'F#', 'G#', 'A#', 'B', 'C#', 'D']);
  });

  it('A Major tem três sustenidos', () => {
    const names = scalePitchClasses(9, scale('major')).map((pc) => noteName(pc));
    expect(names).toEqual(['A', 'B', 'C#', 'D', 'E', 'F#', 'G#']);
  });
});

describe('catálogo', () => {
  it('ids são únicos', () => {
    const ids = SCALES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('toda fórmula começa na tônica, é válida e não repete semitons', () => {
    for (const s of SCALES) {
      expect(s.formula[0], s.name).toBe('1');
      const semitones = formulaToSemitones(s.formula);
      expect(new Set(semitones).size, s.name).toBe(semitones.length);
      // Ascendente dentro de uma oitava.
      for (let i = 1; i < semitones.length; i++) {
        expect(semitones[i], s.name).toBeGreaterThan(semitones[i - 1]);
      }
      expect(semitones[semitones.length - 1], s.name).toBeLessThan(12);
    }
  });

  it('tem 55 escalas: 24 Common, 18 Rare (13 + 5 de blues), 13 Exotic', () => {
    expect(SCALES).toHaveLength(55);
    expect(scalesInCategory('common')).toHaveLength(24);
    expect(scalesInCategory('rare')).toHaveLength(18);
    expect(scalesInCategory('exotic')).toHaveLength(13);
  });

  it('filtra por categoria mantendo a ordem do site', () => {
    expect(scalesInCategory('common').slice(0, 4).map((s) => s.id)).toEqual([
      'major', 'harmonic-minor', 'melodic-minor', 'natural-minor',
    ]);
    expect(scalesInCategory('exotic')[0].id).toBe('algerian');
  });

  // Conferência musical independente do site: escalas conhecidas, em semitons.
  it.each([
    ['harmonic-minor', [0, 2, 3, 5, 7, 8, 11]],
    ['dorian', [0, 2, 3, 5, 7, 9, 10]],
    ['pentatonic-minor', [0, 3, 5, 7, 10]],
    ['blues', [0, 3, 5, 6, 7, 10]],
    ['altered', [0, 1, 3, 4, 6, 8, 10]], // a fórmula do site; os semitons do site estão errados
    ['phrygian-major', [0, 1, 4, 5, 7, 8, 10]],
    ['hirajoshi', [0, 2, 3, 7, 8]],
    ['chromatic', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]],
  ])('%s', (id, semitones) => {
    expect(formulaToSemitones(scale(id).formula)).toEqual(semitones);
  });

  it('inclui todas as escalas de blues do site', () => {
    const blues = SCALES.filter((s) => /blues/i.test(s.name)).map((s) => s.id);
    expect(blues).toEqual([
      'pentatonic-blues', 'auxiliary-diminished-blues', 'blues', 'blues-1', 'blues-2', 'blues-3',
      'major-blues-scale', 'mixo-blues',
    ]);
  });

  it('as 4 fórmulas confirmadas no CLAUDE.md continuam iguais', () => {
    expect(scale('pentatonic-major').formula.join(',')).toBe('1,2,3,5,6');
    expect(scale('major').formula.join(',')).toBe('1,2,3,4,5,6,7');
    expect(scale('overtone-dominant').formula.join(',')).toBe('1,2,3,#4,5,6,b7');
    expect(scale('algerian').formula.join(',')).toBe('1,2,b3,4,#4,5,b6,7');
  });

  it('findScale retorna undefined para id desconhecido', () => {
    expect(findScale('nao-existe')).toBeUndefined();
  });
});
