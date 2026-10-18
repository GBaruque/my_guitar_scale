// Estado único do app. Os campos com $state são o que o usuário escolhe;
// os campos com $derived são recalculados automaticamente pelas funções de theory/
// sempre que algo de que dependem muda (parecido com uma @property em Python, mas com cache).

import { type PlaybackHandle, playPhrases } from '../audio/player';
import { fullFretboard, type Position } from '../theory/fretboard';
import type { FretRegion } from '../theory/fingering/types';
import { type Accidental, noteName, type PitchClass } from '../theory/notes';
import {
  findScale,
  SCALES,
  type ScaleCategory,
  scaleNotes,
  scalesInCategory,
} from '../theory/scales';
import { type Phrase, scaleRunPhrase, shapePhrases } from '../theory/playback';
import { selectRegionFret } from '../theory/region';
import {
  type AnchoredCell,
  buildDiagonal,
  buildVertical,
  composeShapes,
  type Shape,
  toggleAnchor,
} from '../theory/shapes';
import { renderTab, upAndDown } from '../theory/tab';
import { findTuning, TUNINGS, tuningNoteNames } from '../theory/tunings';
import { fromQuery, type Mode, toQuery, type UrlState } from './url';

export type { Mode };
export type Theme = 'light' | 'dark';

/** Chave do tema no localStorage. O mesmo nome é lido pelo script em index.html. */
export const THEME_STORAGE_KEY = 'theme';

/** Tema salvo; se não houver, segue a preferência do sistema operacional. */
function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // localStorage pode estar bloqueado (aba anônima, etc.): seguimos sem ele.
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// O estado inicial vem da URL (link compartilhado); o que faltar ou for inválido usa o padrão.
const initial = fromQuery(window.location.search);

class AppState {
  root = $state<PitchClass>(initial.root);
  scaleId = $state(initial.scaleId);
  /** Aba de categoria visível. Começa na categoria da escala; depois o usuário troca à vontade. */
  category = $state<ScaleCategory>(findScale(initial.scaleId)?.category ?? 'common');
  mode = $state<Mode>(initial.mode);
  /** Âncoras do Vertical: ordenadas, sem repetição, no mínimo uma. */
  anchors = $state<number[]>(initial.anchors);
  /** Região do Diagonal. */
  region = $state<FretRegion>(initial.region);
  tuningId = $state(initial.tuningId);
  accidental = $state<Accidental>(initial.accidental);
  leftHanded = $state(initial.leftHanded);
  /** Preferência pessoal: fica no localStorage, não na URL. */
  theme = $state<Theme>(initialTheme());

  /** Som tocando agora, e a posição da nota que está soando (destacada no braço). */
  playing = $state(false);
  nowPlaying = $state<Position | null>(null);
  /** Controle da reprodução em andamento. Não é $state: a tela não depende dele. */
  private playback: PlaybackHandle | null = null;

  scale = $derived(findScale(this.scaleId) ?? SCALES[0]);
  tuning = $derived(findTuning(this.tuningId) ?? TUNINGS[0]);
  notes = $derived(scaleNotes(this.root, this.scale));

  title = $derived(`${noteName(this.root, this.accidental)} ${this.scale.name}`);
  stringLabels = $derived(tuningNoteNames(this.tuning, this.accidental));
  visibleScales = $derived(scalesInCategory(this.category));
  /** Quantas escalas há em cada categoria (mostrado nas abas). */
  categoryCounts = {
    common: scalesInCategory('common').length,
    rare: scalesInCategory('rare').length,
    exotic: scalesInCategory('exotic').length,
  };

  /** Formas do modo atual: uma por âncora no Vertical, uma só no Diagonal, nenhuma no Full. */
  shapes = $derived.by<Shape[]>(() => {
    if (this.mode === 'vertical') {
      return this.anchors.map((anchor) => buildVertical(anchor, this.notes, this.tuning));
    }
    if (this.mode === 'diagonal') return [buildDiagonal(this.region, this.notes, this.tuning)];
    return [];
  });

  /** Com 2 ou mais âncoras cada uma ganha sua cor; com 1, o visual é o normal. */
  multiAnchor = $derived(this.mode === 'vertical' && this.anchors.length > 1);

  /** O que o braço desenha no modo atual. */
  cells = $derived<AnchoredCell[]>(
    this.mode === 'full'
      ? fullFretboard(this.tuning, this.notes).map((cell) => ({ ...cell, belongsTo: [] }))
      : composeShapes(this.shapes),
  );

  /** Query string que representa o estado atual (o App a grava na barra de endereço). */
  query = $derived(
    toQuery({
      root: this.root,
      scaleId: this.scaleId,
      mode: this.mode,
      anchors: this.anchors,
      region: this.region,
      tuningId: this.tuningId,
      leftHanded: this.leftHanded,
      accidental: this.accidental,
    } satisfies UrlState),
  );

  /** O que o botão de som toca: as sequências desenhadas, ou a escala numa oitava no Full. */
  phrases = $derived<Phrase[]>(
    this.mode === 'full'
      ? [scaleRunPhrase(this.notes, this.tuning)]
      : shapePhrases(
          this.shapes.map((s) => s.sequence),
          this.tuning,
        ),
  );

  /** Uma tablatura por forma (linhas de texto, 1ª corda no topo). */
  tabs = $derived(this.shapes.map((s) => renderTab(upAndDown(s.sequence), this.stringLabels)));

  selectRoot(root: PitchClass) {
    this.root = root;
  }

  selectScale(id: string) {
    this.scaleId = id;
  }

  selectCategory(category: ScaleCategory) {
    this.category = category;
  }

  selectMode(mode: Mode) {
    this.mode = mode;
  }

  selectTuning(id: string) {
    if (findTuning(id)) this.tuningId = id;
  }

  setLeftHanded(leftHanded: boolean) {
    this.leftHanded = leftHanded;
  }

  setAccidental(accidental: Accidental) {
    this.accidental = accidental;
  }

  togglePlayback() {
    if (this.playing) {
      this.stopPlayback();
      return;
    }
    this.playing = true;
    this.playback = playPhrases(this.phrases, (step) => {
      this.nowPlaying = step?.position ?? null;
      if (step === null) {
        this.playing = false;
        this.playback = null;
      }
    });
  }

  stopPlayback() {
    this.playback?.stop();
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(THEME_STORAGE_KEY, this.theme);
    } catch {
      // sem localStorage o tema só não é lembrado na próxima visita
    }
  }

  /** Clique num botão de casa: alterna a âncora (Vertical) ou ajusta a região (Diagonal). */
  clickFret(fret: number) {
    if (this.mode === 'vertical') this.anchors = toggleAnchor(this.anchors, fret);
    else if (this.mode === 'diagonal') this.region = selectRegionFret(this.region, fret);
  }
}

export const app = new AppState();
