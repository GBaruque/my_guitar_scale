// Paleta fixa das âncoras (modo Vertical com 2 ou mais âncoras).
// Tons médios, que aparecem tanto no rosewood quanto no maple. O texto por cima é sempre
// branco com contorno escuro, para ler bem até em círculos divididos em várias cores.

export const ANCHOR_COLORS = [
  '#3f88c5', // azul
  '#e07a5f', // coral
  '#4fa36a', // verde
  '#9b72cf', // roxo
  '#d9a62e', // dourado
  '#d0609a', // rosa
];

/** Cor da âncora de índice `i`. Com mais âncoras que cores, a paleta recomeça. */
export function anchorColor(i: number): string {
  return ANCHOR_COLORS[i % ANCHOR_COLORS.length];
}
