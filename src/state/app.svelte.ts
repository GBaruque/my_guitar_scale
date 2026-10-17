// Estado único do app. Os campos com $state são o que o usuário escolhe;
// os campos com $derived são recalculados automaticamente pelas funções de theory/
// sempre que algo de que dependem muda (parecido com uma @property em Python, mas com cache).

import { type Cell, fullFretboard } from '../theory/fretboard';
import { type Accidental, noteName, type PitchClass } from '../theory/notes';
import {
  DEFAULT_SCALE_ID,
  findScale,
  SCALES,
  type ScaleCategory,
  scaleNotes,
  scalesInCategory,
} from '../theory/scales';
import { buildVertical, MAX_ANCHOR, type Shape } from '../theory/shapes';
import { renderTab, upAndDown } from '../theory/tab';
import { DEFAULT_TUNING_ID, findTuning, TUNINGS, tuningNoteNames } from '../theory/tunings';

export type Mode = 'full' | 'vertical' | 'diagonal';
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

class AppState {
  root = $state<PitchClass>(0);
  scaleId = $state(DEFAULT_SCALE_ID);
  /** Aba de categoria visível. Pode ser diferente da categoria da escala selecionada. */
  category = $state<ScaleCategory>('common');
  mode = $state<Mode>('full');
  /** Sempre uma lista (mínimo 1), já pensando em múltiplas âncoras (marco 6). */
  anchors = $state<number[]>([0]);
  tuningId = $state(DEFAULT_TUNING_ID);
  accidental = $state<Accidental>('sharp');
  leftHanded = $state(false);
  /** Preferência pessoal: fica no localStorage, não na URL. */
  theme = $state<Theme>(initialTheme());

  scale = $derived(findScale(this.scaleId) ?? SCALES[0]);
  tuning = $derived(findTuning(this.tuningId) ?? TUNINGS[0]);
  notes = $derived(scaleNotes(this.root, this.scale));

  title = $derived(`${noteName(this.root, this.accidental)} ${this.scale.name}`);
  stringLabels = $derived(tuningNoteNames(this.tuning, this.accidental));
  visibleScales = $derived(scalesInCategory(this.category));

  /** Uma forma por âncora (no marco 5 só há uma). */
  shapes = $derived<Shape[]>(
    this.anchors.map((anchor) => buildVertical(anchor, this.notes, this.tuning)),
  );

  /** O que o braço desenha no modo atual. */
  cells = $derived<Cell[]>(
    this.mode === 'full' ? fullFretboard(this.tuning, this.notes) : this.shapes.flatMap((s) => s.cells),
  );

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

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(THEME_STORAGE_KEY, this.theme);
    } catch {
      // sem localStorage o tema só não é lembrado na próxima visita
    }
  }

  /** Marco 5: clicar numa casa troca a âncora. No marco 6 vira "alternar". */
  clickFret(fret: number) {
    if (this.mode === 'vertical' && fret >= 0 && fret <= MAX_ANCHOR) {
      this.anchors = [fret];
    }
  }
}

export const app = new AppState();
