import { describe, expect, it } from 'vitest';
import {
  DEFAULT_TUNING_ID,
  findTuning,
  intervalBetweenStrings,
  STRING_COUNT,
  TUNINGS,
  tuningNoteNames,
  type Tuning,
} from '../../src/theory/tunings';

function tuning(id: string): Tuning {
  const found = findTuning(id);
  if (!found) throw new Error(`afinação ${id} não encontrada`);
  return found;
}

// Nomes das cordas como aparecem no CLAUDE.md (da 6ª para a 1ª).
const EXPECTED_NAMES: Record<string, string> = {
  'standard': 'E-A-D-G-B-E',
  'standard-c': 'C-F-A#-D#-G-C',
  'standard-d': 'D-G-C-F-A-D',
  'drop-d': 'D-A-D-G-B-E',
  'drop-c': 'C-G-C-F-A-D',
  'drop-b': 'B-F#-B-E-G#-C#',
  'drop-a': 'A-E-A-D-F#-B',
  'double-drop-d': 'D-A-D-G-B-D',
  'open-g': 'D-G-D-G-B-D',
  'open-d': 'D-A-D-F#-A-D',
  'open-e': 'E-B-E-G#-B-E',
  'open-c': 'C-G-C-G-C-E',
  'open-a': 'E-A-C#-E-A-E',
  'modal-c6': 'C-A-C-G-C-E',
  'dadgad': 'D-A-D-G-A-D',
};

const STANDARD = [40, 45, 50, 55, 59, 64];

describe('catálogo de afinações', () => {
  it('tem as 15 afinações, na ordem do site', () => {
    expect(TUNINGS.map((t) => t.id)).toEqual(Object.keys(EXPECTED_NAMES));
  });

  it('a afinação padrão tem as alturas MIDI do CLAUDE.md', () => {
    expect(tuning(DEFAULT_TUNING_ID).strings).toEqual(STANDARD);
  });

  it.each(Object.entries(EXPECTED_NAMES))('%s tem as notas %s', (id, names) => {
    expect(tuningNoteNames(tuning(id)).join('-')).toBe(names);
  });

  it.each(TUNINGS.map((t) => [t.id, t] as const))('%s: oitavas plausíveis', (_, t) => {
    expect(t.strings).toHaveLength(STRING_COUNT);
    for (let k = 0; k < STRING_COUNT; k++) {
      // Cada corda sobe em relação à anterior (afinação "linear", sem cordas reentrantes)...
      if (k > 0) expect(t.strings[k]).toBeGreaterThan(t.strings[k - 1]);
      // ...e fica a no máximo 7 semitons da corda equivalente na afinação padrão.
      // Uma oitava errada daria diferença de 12 ou mais.
      expect(Math.abs(t.strings[k] - STANDARD[k])).toBeLessThanOrEqual(7);
    }
  });

  it('nomes com bemol', () => {
    expect(tuningNoteNames(tuning('standard-c'), 'flat').join('-')).toBe('C-F-Bb-Eb-G-C');
  });
});

describe('intervalBetweenStrings', () => {
  it('padrão: quartas, exceto G→B (terça maior)', () => {
    const t = tuning('standard');
    expect([0, 1, 2, 3, 4].map((k) => intervalBetweenStrings(t, k))).toEqual([5, 5, 5, 4, 5]);
  });

  it('Open G: lê as notas reais, sem assumir afinação padrão', () => {
    const t = tuning('open-g');
    // D2→G2 = 5, G2→D3 = 7, D3→G3 = 5, G3→B3 = 4, B3→D4 = 3
    expect([0, 1, 2, 3, 4].map((k) => intervalBetweenStrings(t, k))).toEqual([5, 7, 5, 4, 3]);
  });
});
