// Estado ↔ query string, para links compartilháveis. Ex.:
//   ?root=C&scale=pentatonic-major&mode=vertical&anchors=0,5,12&tuning=standard
// Funções puras: recebem/devolvem dados, sem mexer em window.location (isso fica no app).
// Tudo que vem da URL é validado; valor inválido cai no padrão, em vez de quebrar a página.

import type { FretRegion } from '../theory/fingering/types';
import { type Accidental, noteName, parseNoteName, type PitchClass } from '../theory/notes';
import { DEFAULT_REGION, isValidRegion } from '../theory/region';
import { DEFAULT_SCALE_ID, findScale } from '../theory/scales';
import { toggleAnchor } from '../theory/shapes';
import { DEFAULT_TUNING_ID, findTuning } from '../theory/tunings';

export type Mode = 'full' | 'vertical' | 'diagonal';
const MODES: Mode[] = ['full', 'vertical', 'diagonal'];

/** A parte do estado que vai para a URL (o tema é preferência pessoal e não entra). */
export interface UrlState {
  root: PitchClass;
  scaleId: string;
  mode: Mode;
  anchors: number[];
  region: FretRegion;
  tuningId: string;
  leftHanded: boolean;
  accidental: Accidental;
}

export const DEFAULT_URL_STATE: UrlState = {
  root: 0,
  scaleId: DEFAULT_SCALE_ID,
  mode: 'full',
  anchors: [0],
  region: DEFAULT_REGION,
  tuningId: DEFAULT_TUNING_ID,
  leftHanded: false,
  accidental: 'sharp',
};

export function toQuery(state: UrlState): string {
  const params = new URLSearchParams();
  // A tônica é escrita com a grafia escolhida (C# ou Db); a leitura aceita as duas.
  params.set('root', noteName(state.root, state.accidental));
  params.set('scale', state.scaleId);
  params.set('mode', state.mode);
  params.set('anchors', state.anchors.join(','));
  params.set('region', `${state.region.start}-${state.region.end}`);
  params.set('tuning', state.tuningId);
  params.set('hand', state.leftHanded ? 'left' : 'right');
  params.set('acc', state.accidental);
  return params.toString();
}

/** Âncoras "0,5,12": só inteiros válidos, sem repetição, em ordem; vazia vira a padrão. */
function parseAnchors(text: string | null): number[] {
  if (!text) return DEFAULT_URL_STATE.anchors;
  let anchors: number[] = [];
  for (const part of text.split(',')) {
    const fret = Number(part);
    // toggleAnchor ignora casas inválidas e já mantém a lista ordenada.
    if (part.trim() !== '' && !anchors.includes(fret)) anchors = toggleAnchor(anchors, fret);
  }
  return anchors.length > 0 ? anchors : DEFAULT_URL_STATE.anchors;
}

/** Região "0-12". */
function parseRegion(text: string | null): FretRegion {
  const match = /^(\d+)-(\d+)$/.exec(text ?? '');
  if (!match) return DEFAULT_URL_STATE.region;
  const region = { start: Number(match[1]), end: Number(match[2]) };
  return isValidRegion(region) ? region : DEFAULT_URL_STATE.region;
}

export function fromQuery(query: string): UrlState {
  const params = new URLSearchParams(query);
  const d = DEFAULT_URL_STATE;
  const scaleId = params.get('scale') ?? '';
  const tuningId = params.get('tuning') ?? '';
  const mode = params.get('mode') as Mode;
  const acc = params.get('acc');
  return {
    root: parseNoteName(params.get('root') ?? '') ?? d.root,
    scaleId: findScale(scaleId) ? scaleId : d.scaleId,
    mode: MODES.includes(mode) ? mode : d.mode,
    anchors: parseAnchors(params.get('anchors')),
    region: parseRegion(params.get('region')),
    tuningId: findTuning(tuningId) ? tuningId : d.tuningId,
    leftHanded: params.get('hand') === 'left',
    accidental: acc === 'flat' || acc === 'sharp' ? acc : d.accidental,
  };
}
