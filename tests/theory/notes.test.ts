import { describe, expect, it } from 'vitest';
import {
  allPitchClasses,
  intervalUp,
  isNatural,
  midiToFrequency,
  mod,
  noteName,
  parseNoteName,
  pitchClassOf,
  transpose,
} from '../../src/theory/notes';

describe('mod', () => {
  it('retorna resto positivo mesmo com número negativo', () => {
    expect(mod(-1, 12)).toBe(11);
    expect(mod(-13, 12)).toBe(11);
    expect(mod(25, 12)).toBe(1);
    expect(mod(0, 12)).toBe(0);
  });
});

describe('midiToFrequency', () => {
  it('A4 = 440 Hz e cada oitava dobra', () => {
    expect(midiToFrequency(69)).toBe(440);
    expect(midiToFrequency(57)).toBeCloseTo(220);
    expect(midiToFrequency(81)).toBeCloseTo(880);
  });

  it('E grave da guitarra (E2) ≈ 82,41 Hz', () => {
    expect(midiToFrequency(40)).toBeCloseTo(82.41, 2);
  });
});

describe('pitchClassOf', () => {
  it('descarta a oitava', () => {
    expect(pitchClassOf(60)).toBe(0); // C4
    expect(pitchClassOf(40)).toBe(4); // E2
    expect(pitchClassOf(59)).toBe(11); // B3
  });
});

describe('transpose', () => {
  it('sobe e desce dando a volta na oitava', () => {
    expect(transpose(0, 7)).toBe(7); // C → G
    expect(transpose(9, 5)).toBe(2); // A → D
    expect(transpose(0, -1)).toBe(11); // C → B
  });
});

describe('intervalUp', () => {
  it('mede a distância ascendente', () => {
    expect(intervalUp(0, 7)).toBe(7); // C → G: quinta
    expect(intervalUp(7, 0)).toBe(5); // G → C: quarta
    expect(intervalUp(4, 4)).toBe(0);
  });
});

describe('noteName', () => {
  it('usa sustenidos ou bemóis conforme a configuração', () => {
    expect(noteName(1, 'sharp')).toBe('C#');
    expect(noteName(1, 'flat')).toBe('Db');
    expect(noteName(10, 'flat')).toBe('Bb');
    expect(noteName(4, 'flat')).toBe('E');
  });

  it('usa sustenido por padrão', () => {
    expect(noteName(6)).toBe('F#');
  });

  it('lista as 12 tônicas na ordem do site', () => {
    expect(allPitchClasses().map((pc) => noteName(pc))).toEqual([
      'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
    ]);
  });
});

describe('isNatural', () => {
  it('7 naturais e 5 com acidente, como as teclas do piano', () => {
    expect(allPitchClasses().filter(isNatural).map((pc) => noteName(pc))).toEqual([
      'C', 'D', 'E', 'F', 'G', 'A', 'B',
    ]);
    expect(isNatural(13)).toBe(false); // C# uma oitava acima
  });
});

describe('parseNoteName', () => {
  it('lê nomes com e sem acidente', () => {
    expect(parseNoteName('C')).toBe(0);
    expect(parseNoteName('F#')).toBe(6);
    expect(parseNoteName('Bb')).toBe(10);
    expect(parseNoteName('c#')).toBe(1);
  });

  it('dá a volta na oitava (Cb = B, B# = C)', () => {
    expect(parseNoteName('Cb')).toBe(11);
    expect(parseNoteName('B#')).toBe(0);
    expect(parseNoteName('Ebb')).toBe(2);
  });

  it('é o inverso de noteName', () => {
    for (const pc of allPitchClasses()) {
      expect(parseNoteName(noteName(pc, 'sharp'))).toBe(pc);
      expect(parseNoteName(noteName(pc, 'flat'))).toBe(pc);
    }
  });

  it('retorna null para nomes inválidos', () => {
    expect(parseNoteName('H')).toBeNull();
    expect(parseNoteName('')).toBeNull();
    expect(parseNoteName('C#x')).toBeNull();
  });
});
