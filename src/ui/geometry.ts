// Geometria do braço: (corda, casa) → (x, y) em coordenadas do SVG.
// Tudo que é desenhado passa por aqui; o modo canhoto é só espelhar o x.

import { FRET_COUNT, type Position } from '../theory/fretboard';
import { SEMITONES_PER_OCTAVE } from '../theory/notes';
import { STRING_COUNT } from '../theory/tunings';

/**
 * Comprimento de escala (nut → ponte) em unidades do SVG. As casas seguem a proporção real:
 * cada traste fica a 2^(-1/12) da distância restante até a ponte, então a casa 12 fica
 * exatamente no meio da escala e a casa 24 a 3/4. Com 1600, a casa 1 tem ~90 de largura
 * e a casa 24 ~24 (cabe um círculo de nota).
 */
export const SCALE_LENGTH = 1600;
/** Distância vertical entre duas cordas. */
export const STRING_GAP = 30;
/** Coluna dos nomes das cordas, à esquerda de tudo. */
export const LABEL_WIDTH = 28;
/** Espaço entre os rótulos e o nut, onde ficam as notas das cordas soltas (casa 0). */
export const OPEN_WIDTH = 40;
export const PADDING_Y = 27;
export const PADDING_RIGHT = 10;
export const NOTE_RADIUS = 11;
export const MARKER_RADIUS = 5.5;

/** Espessura dos trastes e do nut. */
export const FRET_WIRE_WIDTH = 3;
export const NUT_WIDTH = 7;
/** Quanto a escala (madeira) passa do último traste. */
export const BOARD_OVERHANG = 10;
/** Margem da madeira acima da 1ª corda e abaixo da 6ª (folga entre as notas e a borda). */
export const BOARD_EDGE = 17;

/**
 * Calibre das cordas em polegadas (jogo .010–.046, o mais comum em guitarra), da 6ª para a 1ª.
 * Só influencia a espessura do desenho; não tem nada a ver com a afinação.
 */
export const STRING_GAUGES = [0.046, 0.036, 0.026, 0.017, 0.013, 0.01];
/** As três mais graves são encapadas (fio enrolado), o que aparece como textura no desenho. */
export const WOUND_STRINGS = [true, true, true, false, false, false];
/** Polegadas → unidades do SVG. Exagerado em relação à escala real para a corda fina aparecer. */
const GAUGE_SCALE = 80;

/** x do nut (onde começa a casa 1). */
export const NUT_X = LABEL_WIDTH + OPEN_WIDTH;

/** Distância do nut até o traste `i`, pela regra de 2^(1/12). */
function distanceFromNut(i: number): number {
  return SCALE_LENGTH * (1 - 2 ** (-i / SEMITONES_PER_OCTAVE));
}

/** Fim da madeira (um pouco depois do último traste). */
export const BOARD_END_X = NUT_X + distanceFromNut(FRET_COUNT) + BOARD_OVERHANG;
export const BOARD_WIDTH = BOARD_END_X + PADDING_RIGHT;
export const BOARD_HEIGHT = 2 * PADDING_Y + (STRING_COUNT - 1) * STRING_GAP;

/** Casas com marcação no braço. 12 e 24 (oitavas) têm marcação dupla. */
export const SINGLE_MARKERS = [3, 5, 7, 9, 15, 17, 19, 21];
export const DOUBLE_MARKERS = [12, 24];

function mirror(x: number, leftHanded: boolean): number {
  return leftHanded ? BOARD_WIDTH - x : x;
}

/** Faixa horizontal entre dois x (já espelhada), no formato que <rect> espera. */
export function horizontalSpan(x1: number, x2: number, leftHanded = false): { x: number; width: number } {
  const a = mirror(x1, leftHanded);
  const b = mirror(x2, leftHanded);
  return { x: Math.min(a, b), width: Math.abs(b - a) };
}

/** x do traste `i` (i = 0 é o nut; o traste i fica no fim da casa i). */
export function fretWireX(i: number, leftHanded = false): number {
  return mirror(NUT_X + distanceFromNut(i), leftHanded);
}

/** Largura da casa `fret`. A casa 0 é a área das cordas soltas, antes do nut. */
export function fretWidth(fret: number): number {
  if (fret === 0) return OPEN_WIDTH;
  return distanceFromNut(fret) - distanceFromNut(fret - 1);
}

/** x do centro de uma casa (onde vai o círculo da nota). A casa 0 fica à esquerda do nut. */
export function fretCenterX(fret: number, leftHanded = false): number {
  const x =
    fret === 0
      ? LABEL_WIDTH + OPEN_WIDTH / 2
      : NUT_X + (distanceFromNut(fret - 1) + distanceFromNut(fret)) / 2;
  return mirror(x, leftHanded);
}

/** x da coluna de rótulos das cordas. */
export function labelX(leftHanded = false): number {
  return mirror(LABEL_WIDTH / 2, leftHanded);
}

/** y de uma corda. A 1ª corda (índice 5) fica no topo, como no site. */
export function stringY(string: number): number {
  return PADDING_Y + (STRING_COUNT - 1 - string) * STRING_GAP;
}

/** Espessura desenhada de uma corda: mais grossa nas graves, como na guitarra. */
export function stringThickness(string: number): number {
  return STRING_GAUGES[string] * GAUGE_SCALE;
}

/** Topo e base da madeira. */
export const BOARD_TOP = stringY(STRING_COUNT - 1) - BOARD_EDGE;
export const BOARD_BOTTOM = stringY(0) + BOARD_EDGE;

export function pointOf(position: Position, leftHanded = false): { x: number; y: number } {
  return { x: fretCenterX(position.fret, leftHanded), y: stringY(position.string) };
}

/** Pontos das marcações: simples no meio do braço, duplas entre a 2ª/3ª e a 4ª/5ª cordas. */
export function fretMarkers(leftHanded = false): { x: number; y: number }[] {
  const middle = (stringY(2) + stringY(3)) / 2;
  const upper = (stringY(3) + stringY(4)) / 2;
  const lower = (stringY(1) + stringY(2)) / 2;
  const points = SINGLE_MARKERS.map((f) => ({ x: fretCenterX(f, leftHanded), y: middle }));
  for (const f of DOUBLE_MARKERS) {
    points.push({ x: fretCenterX(f, leftHanded), y: upper }, { x: fretCenterX(f, leftHanded), y: lower });
  }
  return points;
}

/**
 * Fatias de um círculo dividido em `n` partes iguais, como caminhos SVG (atributo `d`).
 * Usado nas notas compartilhadas por várias âncoras. A primeira fatia começa no topo
 * e elas seguem no sentido horário. Com n < 2 não há fatias (desenhe um círculo inteiro).
 */
export function pieSlicePaths(cx: number, cy: number, r: number, n: number): string[] {
  if (n < 2) return [];
  const paths: string[] = [];
  const step = (2 * Math.PI) / n;
  for (let i = 0; i < n; i++) {
    const a0 = -Math.PI / 2 + i * step;
    const a1 = a0 + step;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    // Nenhuma fatia passa de meia volta quando n ≥ 2, então o arco é sempre o "pequeno" (0).
    paths.push(`M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1} Z`);
  }
  return paths;
}
