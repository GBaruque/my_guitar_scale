import { describe, expect, it } from 'vitest';
import { SCALES, scaleNotes } from '../../src/theory/scales';
import { TUNINGS } from '../../src/theory/tunings';
import { buildVertical } from '../../src/theory/shapes';
import { scaleRunPhrase, shapePhrases } from '../../src/theory/playback';
import { scale, tuning } from '../helpers';

describe('shapePhrases', () => {
  const t = tuning('standard');
  const notes = scaleNotes(0, scale('pentatonic-major'));

  it('sobe e desce sem repetir o topo, com a posição de cada nota', () => {
    const [phrase] = shapePhrases([buildVertical(0, notes, t).sequence], t);
    // Âncora 0: E2 G2 A2 C3 D3 E3 G3 A3 C4 D4 E4 G4 (12 notas) → 12 + 11 = 23 passos.
    expect(phrase).toHaveLength(23);
    expect(phrase[0]).toEqual({ midi: 40, position: { string: 0, fret: 0 } });
    expect(phrase[11]).toEqual({ midi: 67, position: { string: 5, fret: 3 } }); // topo: G4
    expect(phrase[22]).toEqual(phrase[0]);
  });

  it('uma frase por âncora, na ordem', () => {
    const phrases = shapePhrases(
      [buildVertical(0, notes, t).sequence, buildVertical(12, notes, t).sequence],
      t,
    );
    expect(phrases).toHaveLength(2);
    expect(phrases[1][0].midi).toBe(phrases[0][0].midi + 12); // âncora 12 = mesma forma, uma oitava acima
  });

  it('ignora sequências vazias', () => {
    expect(shapePhrases([[]], t)).toEqual([]);
  });
});

describe('scaleRunPhrase', () => {
  it('C Major na afinação padrão: de C3 (48) a C4 e de volta', () => {
    const midis = scaleRunPhrase(scaleNotes(0, scale('major')), tuning('standard')).map((s) => s.midi);
    expect(midis).toEqual([48, 50, 52, 53, 55, 57, 59, 60, 59, 57, 55, 53, 52, 50, 48]);
  });

  it('E Major começa na corda solta mais grave (E2)', () => {
    const midis = scaleRunPhrase(scaleNotes(4, scale('major')), tuning('standard')).map((s) => s.midi);
    expect(midis[0]).toBe(40);
    expect(midis[7]).toBe(52);
  });

  it('usa a afinação real: em Drop A a tônica A sai de A1 (33)', () => {
    const midis = scaleRunPhrase(scaleNotes(9, scale('pentatonic-minor')), tuning('drop-a')).map((s) => s.midi);
    expect(midis[0]).toBe(33);
  });

  it('cada nota tem posição: a tônica na 6ª corda e a oitava numa janela a partir dela', () => {
    const phrase = scaleRunPhrase(scaleNotes(0, scale('major')), tuning('standard'));
    // C3 na 6ª corda, casa 8; janela 8–12.
    expect(phrase.slice(0, 8).map((s) => [s.position?.string, s.position?.fret])).toEqual([
      [0, 8], [0, 10], [0, 12], // C D E
      [1, 8], [1, 10], [1, 12], // F G A
      [2, 9], [2, 10], // B C
    ]);
    expect(phrase.every((s) => s.position !== null)).toBe(true);
  });

  it('Open G: a posição bate com a nota (usa a afinação real)', () => {
    const t = tuning('open-g');
    const phrase = scaleRunPhrase(scaleNotes(0, scale('major')), t);
    for (const step of phrase) {
      expect(t.strings[step.position!.string] + step.position!.fret).toBe(step.midi);
    }
    expect(phrase.map((s) => s.midi)).toEqual([48, 50, 52, 53, 55, 57, 59, 60, 59, 57, 55, 53, 52, 50, 48]);
  });

  it('todas as escalas e afinações: oitava completa, tônica a tônica', () => {
    for (const t of TUNINGS) {
      for (const s of SCALES) {
        const notes = scaleNotes(7, s);
        const phrase = scaleRunPhrase(notes, t);
        const top = (phrase.length + 1) / 2; // subida inclui o topo; descida não
        expect(top, `${t.id} ${s.id}`).toBe(notes.length + 1);
        expect(phrase[top - 1].midi - phrase[0].midi, `${t.id} ${s.id}`).toBe(12);
      }
    }
  });

});
