import { describe, expect, it } from 'vitest';
import { DEFAULT_URL_STATE, fromQuery, toQuery, type UrlState } from '../../src/state/url';

describe('URL', () => {
  it('lê o exemplo do CLAUDE.md', () => {
    const state = fromQuery('?root=C&scale=pentatonic-major&mode=vertical&anchors=0,5,12&tuning=standard');
    expect(state).toEqual({
      ...DEFAULT_URL_STATE,
      root: 0,
      scaleId: 'pentatonic-major',
      mode: 'vertical',
      anchors: [0, 5, 12],
      tuningId: 'standard',
    });
  });

  it('ida e volta preserva o estado', () => {
    const state: UrlState = {
      root: 1,
      scaleId: 'algerian',
      mode: 'diagonal',
      anchors: [3, 7],
      region: { start: 2, end: 17 },
      tuningId: 'open-g',
      leftHanded: true,
      accidental: 'flat',
    };
    expect(fromQuery(toQuery(state))).toEqual(state);
  });

  it('escreve a tônica com a grafia escolhida e codifica o #', () => {
    expect(toQuery({ ...DEFAULT_URL_STATE, root: 1 })).toContain('root=C%23');
    expect(toQuery({ ...DEFAULT_URL_STATE, root: 1, accidental: 'flat' })).toContain('root=Db');
  });

  it('URL vazia dá o estado padrão', () => {
    expect(fromQuery('')).toEqual(DEFAULT_URL_STATE);
  });

  it('valores inválidos caem no padrão', () => {
    const state = fromQuery('root=H&scale=nao-existe&mode=xyz&tuning=banjo&acc=dobrado&region=5-8');
    expect(state).toEqual(DEFAULT_URL_STATE);
  });

  it('âncoras: ignora inválidas e repetidas, ordena', () => {
    expect(fromQuery('anchors=12,abc,5,5,21,-1,0').anchors).toEqual([0, 5, 12]);
    expect(fromQuery('anchors=99').anchors).toEqual([0]);
    expect(fromQuery('anchors=').anchors).toEqual([0]);
  });
});
