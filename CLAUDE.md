# My Guitar Scale

Ferramenta web pessoal para estudar escalas na guitarra. O primeiro objetivo é ter paridade com
a ferramenta de escalas de https://www.all-guitar-chords.com/scales, mais uma melhoria:
**múltiplas âncoras no modo Vertical**.

O dono do projeto vem de Python e está aprendendo o stack web. Prefira código simples e legível
a abstrações espertas, e comente o "porquê" das decisões de teoria musical.

---

## Stack

- **TypeScript** (strict) + **Svelte 5** (runes: `$state`, `$derived`) + **Vite**
- Braço da guitarra desenhado em **SVG** (sem canvas, sem biblioteca de gráficos)
- **Vitest** para testes
- Sem backend. App 100% estático, hospedável no GitHub Pages / Netlify / Vercel
- Áudio (fase posterior) com Web Audio API nativa

Comandos:
- `npm run dev`: servidor de desenvolvimento
- `npm test`: testes
- `npm run build`: build estático

---

## Regras de arquitetura

1. **Toda lógica de teoria musical fica em `src/theory/`, como funções puras.** Nada de Svelte,
   DOM ou estado global lá dentro. Toda função de `theory/` tem teste.
2. **Fluxo de dados em um sentido só:** estado → funções de `theory/` calculam → componentes desenham.
   Componentes nunca calculam notas, casas ou intervalos.
3. **Notas são números internamente.** Classe de altura (`PitchClass`) = 0–11 (C=0). Altura absoluta =
   número MIDI. Nomes ("C#", "Db") só existem na camada de exibição.
4. **Afinação é dado, nunca suposição.** Nenhum algoritmo pode assumir afinação padrão (por exemplo,
   o intervalo de terça maior entre G e B). Sempre use as notas reais de cada corda.
5. **O desenho é uma função de geometria** `(corda, casa) → (x, y)`. O modo canhoto é só espelhar o x.
6. **A distribuição das notas nas cordas é uma estratégia plugável** (ver "Estratégias de digitação").
7. Todo número mágico do domínio vira constante nomeada (`FRET_COUNT`, `WINDOW_SIZE`, `MIN_DIAGONAL_SPAN`...).

---

## Estrutura de pastas

```
src/
  theory/
    notes.ts          PitchClass, nomes (sustenido/bemol), utilidades de intervalo
    scales.ts         catálogo de escalas (dados) + conversão fórmula → semitons
    tunings.ts        afinações (dados)
    fretboard.ts      tipos Cell/Position; nota de cada (corda, casa); modo Full
    fingering/
      types.ts        interface FingeringStrategy
      window.ts       estratégia "janela deslizante" (Vertical e Diagonal)
      nps.ts          (futuro) estratégia N notas por corda
    shapes.ts         monta Vertical (com N âncoras) e Diagonal usando a estratégia
    tab.ts            gera a tablatura (subida + descida) a partir de uma sequência
    region.ts         regra de seleção início/fim do Diagonal
  state/
    app.svelte.ts     estado único do app
    url.ts            sincroniza estado ↔ query string
  ui/
    Fretboard.svelte  SVG do braço
    Tablature.svelte
    Header.svelte     nome da escala, fórmula, botão de som
    RootPicker.svelte, ScaleGrid.svelte, CategoryTabs.svelte, ModeToggle.svelte,
    FretButtons.svelte (âncoras / região), SettingsDialog.svelte, TuningsDialog.svelte
  audio/              (fase posterior)
tests/
  theory/...          espelha src/theory
```

---

## Modelo de domínio

- `FRET_COUNT = 24`. Casas de 0 (corda solta) a 24.
- Cordas indexadas **da mais grave para a mais aguda**: índice 0 = 6ª corda (E grave), índice 5 = 1ª corda (E aguda).
  O desenho mostra a 1ª corda no topo, como no site.
- `Tuning = { id, name, strings: number[6] }` com alturas MIDI (afinação padrão: `[40, 45, 50, 55, 59, 64]`).
- `Scale = { id, name, category: 'common' | 'rare' | 'exotic', formula: string[] }`.
  A fórmula (ex.: `['1','2','b3','4','#4','5','b6','7']`) é a fonte da verdade, e os semitons são derivados
  dela (graus 1..7 → 0,2,4,5,7,9,11, com `b` = −1 e `#` = +1). Isso resolve a ambiguidade #4/b5 na exibição.
- `Position = { string: number, fret: number }`.
- Uma **sequência** é a lista ordenada de `Position` que sobe pela escala; é o que Vertical e Diagonal produzem.

---

## Escopo da v1

### Layout (de cima para baixo, igual ao site)
1. Cabeçalho: "{Tônica} {Escala}", botão de som e a fórmula embaixo (ex.: `1, 2, 3, 5, 6`).
2. Botões **Settings** (esquerda) e **Tunings** (direita).
3. Linha de casas 0–24: texto simples no modo Full; **botões** no Vertical e no Diagonal.
4. Braço: rótulos das cordas à esquerda, notas da casa 0 à esquerda do nut, marcações em
   3, 5, 7, 9, 12 (dupla), 15, 17, 19, 21, 24 (dupla).
5. Botões de modo: **Full / Vertical / Diagonal**.
6. Tablatura (só no Vertical e no Diagonal).
7. Fileira das 12 tônicas (C, C#, D... ou com bemóis, conforme a configuração).
8. Grade de escalas da categoria atual.
9. Abas de categoria: **Common / Rare / Exotic**.

### Círculos das notas
- Mostram o nome da nota. Tônica em laranja, demais notas em amarelo (modo com 1 âncora).
- Com várias âncoras, ver "Múltiplas âncoras".

### Settings (no escopo)
- Destro / Canhoto
- Sustenido (#) / Bemol (b): mapeamento simples por classe de altura, sem grafia dependente de tonalidade na v1.

### Tunings (15 opções)
Standard (E-A-D-G-B-E), Standard C (C-F-A#-D#-G-C), Standard D (D-G-C-F-A-D), Drop D (D-A-D-G-B-E),
Drop C (C-G-C-F-A-D), Drop B (B-F#-B-E-G#-C#), Drop A (A-E-A-D-F#-B), Double Drop D (D-A-D-G-B-D),
Open G (D-G-D-G-B-D), Open D (D-A-D-F#-A-D), Open E (E-B-E-G#-B-E), Open C (C-G-C-G-C-E),
Open A (E-A-C#-E-A-E), Modal C6 (C-A-C-G-C-E), DADGAD (D-A-D-G-A-D).

Nota: o site lista Drop B como `B-F#-B-E-G-C` e Drop A como `A-E-A-D#-F#-B`, o que parece erro. Usamos as
versões usuais acima. As oitavas exatas (alturas MIDI) de cada afinação devem ser definidas e testadas.

### Fora do escopo
- Orientação vertical do braço (decidido: não vale o esforço)
- "Chord Auto Sound" (configuração da parte de acordes do site)
- Backend, contas, outras páginas do site (acordes, metrônomo etc.)

---

## Catálogo de escalas

Nomes por categoria, na ordem do site. As fórmulas devem ser preenchidas a partir das páginas do próprio
site, que mostram uma linha "Formula:" (ex.: https://www.all-guitar-chords.com/scales/c/major →
`1, 2, 3, 4, 5, 6, 7`). O slug costuma ser o nome em minúsculas com hífen (`natural-minor`,
`pentatonic-major`). **Não invente fórmulas de memória:** confirme cada uma na página e, se algum slug
não for encontrado, deixe um `TODO` e liste os pendentes para o dono do projeto.

Fórmulas já confirmadas: Pentatonic Major `1,2,3,5,6` · Major `1,2,3,4,5,6,7` ·
Overtone Dominant `1,2,3,#4,5,6,b7` · Algerian `1,2,b3,4,#4,5,b6,7`.

**Common (24):** Major, Harmonic Minor, Melodic Minor, Natural Minor, Pentatonic Major, Pentatonic Minor,
Pentatonic Blues, Pentatonic Neutral, Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian,
Diatonic, Diminished, Diminished Half, Diminished Whole, Diminished Whole Tone, Dominant 7th,
Lydian Augmented, Lydian Minor, Lydian Diminished.

**Rare (36):** Chromatic, Whole Tone, Octatonic (H-W), Octatonic (W-H), Augmented, Auxiliary Diminished,
Auxiliary Augmented, Auxiliary Diminished Blues, Blues, Double Harmonic, Enigmatic, Half Diminished,
Half Diminished #2, Leading Whole Tone, Major Locrian, Nine Tone Scale, Overtone, Overtone Dominant,
Six Tone Symmetrical, Altered, Bebop Major, Bebop Minor, Bebop Dominant, Bebop Half Diminished,
Blues #1, Blues #2, Blues #3, Major Blues Scale, Dominant Pentatonic, Locrian 6, Ionian #5, Dorian #4,
Phrygian Major, Lydian #2, Ultralocrian, Mixo-Blues.

**Exotic (48):** Algerian, Arabian #1, Arabian #2, Balinese, Byzantine, Chinese, Chinese Mongolian,
Egyptian, Eight Tone Spanish, Ethiopian (A raray), Ethiopian (Geez&Ezel), Hawaiian, Hindu, Hindustan,
Hirajoshi, Hungarian Major, Hungarian Gypsy, Hungarian Gypsy Persian, Hungarian Minor, Japanese #1,
Japanese #2, Japanese (Ichikosucho), Japanese (Taishikicho), Javaneese, Jewish (Adonai Malakh),
Jewish (Ahaba Rabba), Jewish (Magen Abot), Kumoi, Mohammedan, Neopolitan, Neopolitan Major,
Neopolitan Minor, Oriental #1, Oriental #2, Pelog, Persian, Prometheus, Prometheus Neopolitan,
Roumanian Minor, Spanish Gypsy, Super Locrian, Chinese #2, Hirajoshi #2, Iwato, Japanese (in sen),
Kumoi #2, Pelog #2, Moorish Phrygian.

---

## Modos

### Full
Todas as posições `(corda, casa)` com casa 0–24 cuja nota pertence à escala.

### Vertical (posição numa âncora)
- A âncora é uma casa de **0 a 20**. Só existem botões de 0 a 20 (a última janela é 20–24).
- Usa a estratégia de digitação com janela `[âncora, âncora + 4]` em todas as cordas.
- Pode haver **várias âncoras** ao mesmo tempo (ver abaixo).

### Diagonal (região início → fim)
- Região `[início, fim]` com `fim − início ≥ MIN_DIAGONAL_SPAN` (= 10).
- **Seleção por clique** (`theory/region.ts`), com `MID = FRET_COUNT / 2` (= 12):
  - Clique na casa `f ≤ MID` → `início = f`. Se `fim − início < 10`, então `fim = início + 10`.
  - Clique na casa `f > MID` → `fim = f`. Se `fim − início < 10`, então `início = fim − 10`.
- Botões: início e fim em azul-escuro, casas entre eles em azul-claro, demais em cinza.
- Região padrão: 0–12.
- **Não copiamos o algoritmo do site** (ele não segue uma regra simples identificável). Usamos a nossa
  estratégia de janela deslizante. Diferenças em relação ao site são esperadas e aceitas.

---

## Estratégias de digitação

```ts
interface FingeringStrategy {
  id: string;
  // Retorna a sequência ascendente de posições. Puro e determinístico.
  build(input: {
    scale: PitchClass[];      // classes de altura da escala já transpostas para a tônica
    tuning: Tuning;
    region: { start: number; end: number };  // Vertical: { start: a, end: a + 4 }
  }): Position[];
}
```

Vertical e Diagonal chamam a **mesma** estratégia; o Vertical é só o caso `end = start + 4`.
A interface existe desde o início para permitir uma estratégia "N notas por corda" (2NPS, 3NPS, 3+2)
no futuro, sem mexer em braço, tablatura ou âncoras.

### Estratégia 1: janela deslizante (`fingering/window.ts`)

**Limites por corda** (k = 0 é a 6ª corda, k = 5 é a 1ª corda; `WINDOW_SIZE = 5`):
- Limite inferior: `L[k] = round(start + k × (end − 4 − start) / 5)`.
  No Vertical, `L[k] = âncora` para todas as cordas.
- Limite superior: `U[5] = L[5] + 4` e, para k < 5,
  `U[k] = max(L[k] + 4, L[k+1] + intervalo(k, k+1) − 1)`,
  onde `intervalo` é a distância em semitons entre as cordas k e k+1 na afinação atual.
  Isso garante que não exista "buraco" de alturas entre cordas vizinhas, inclusive em afinações abertas.
- Tudo limitado a `[0, FRET_COUNT]`.

**Montagem da sequência:**
1. Primeira nota: a nota da escala mais grave na corda 0 com casa em `[L[0], U[0]]`.
2. Para cada próxima nota da escala (subindo):
   - Se cabe na **corda seguinte** dentro de `[L[k+1], U[k+1]]` → muda de corda.
   - Senão, se cabe na **corda atual** dentro de `[L[k], U[k]]` → fica.
   - Senão, procura a primeira corda acima de k+1 onde caiba (salvaguarda; não deve ocorrer).
   - Se não couber em lugar nenhum → fim da sequência. **Exceção:** se ainda houver notas mais agudas
     alcançáveis na janela, a nota é pulada. Isso só ocorre quando algum `U[k]` foi cortado na casa 24
     (afinações com intervalo maior que uma quarta entre cordas, âncoras 18–20).
3. Cada altura aparece uma vez só.

### Tablatura (`theory/tab.ts`)
A sequência subindo e depois descendo, **sem repetir a nota do topo**
(ex.: mizinha `0--3--0`, não `0--3--3--0`). Renderizada como texto monoespaçado em 6 linhas,
com a 1ª corda no topo.

---

## Múltiplas âncoras (melhoria sobre o site)

- Estado: `anchors: number[]` (únicos, ordenados, valores 0–20, **mínimo 1**). Nunca uma âncora única.
- Clique num botão de casa no modo Vertical **alterna** a âncora (adiciona ou remove). Não é possível
  remover a última.
- Cada âncora gera sua sequência com a estratégia. A camada de composição (`shapes.ts`) produz, para cada
  posição do braço, `belongsTo: number[]` (índices das âncoras que a incluem).
- Visual:
  - Com 1 âncora: idêntico ao site (tônica laranja, demais amarelas).
  - Com 2 ou mais: cada âncora tem uma cor de uma paleta fixa (o botão da âncora usa a mesma cor).
    Notas compartilhadas por várias âncoras são desenhadas como círculo dividido em fatias com as cores
    correspondentes. A tônica é indicada por borda grossa e rótulo em negrito.
- Tablatura: uma tablatura por âncora, empilhadas, cada uma com o rótulo "Âncora N" na cor dela.

---

## Estado e URL

Estado único em `state/app.svelte.ts`: tônica, escala, categoria visível, modo, `anchors`, região diagonal,
afinação, destro/canhoto, sustenido/bemol.

Sincronizado com a query string para links compartilháveis, por exemplo:
`?root=C&scale=pentatonic-major&mode=vertical&anchors=0,5,12&tuning=standard`

---

## Testes

- Toda função de `theory/` tem teste em `tests/theory/`.
- Teste também em pelo menos uma afinação aberta (ex.: Open G) para garantir que nenhuma regra assume
  afinação padrão.
- **Casos de referência do Vertical** (conferidos no site, afinação padrão; frets por corda, da 6ª para a 1ª).
  A estratégia de janela deslizante **deve** reproduzir exatamente:

| Escala | Âncora | E (6ª) | A | D | G | B | e (1ª) |
|---|---|---|---|---|---|---|---|
| C Pentatonic Major | 0 | 0,3 | 0,3 | 0,2 | 0,2 | 1,3 | 0,3 |
| C Pentatonic Major | 1 | 3,5 | 3,5 | 2,5 | 2 | 1,3,5 | 3,5 |
| C Pentatonic Major | 2 | 3,5 | 3,5 | 2,5 | 2,5 | 3,5 | 3,5 |
| C Pentatonic Major | 3 | 3,5 | 3,5,7 | 5,7 | 5 | 3,5 | 3,5 |
| C Pentatonic Major | 4 | 5,8 | 5,7 | 5,7 | 5,7 | 5,8 | 5,8 |
| C Pentatonic Major | 16 | 17,20 | 17,19 | 17,19 | 17,19 | 17,20 | 17,20 |
| E Overtone Dominant | 0 | 0,2,4 | 1,2,4 | 0,2,4 | 1,3 | 0,2,3 | 0,2,4 |

- **Caso de referência do Diagonal** (resultado esperado da NOSSA estratégia, não do site):
  C Pentatonic Major, região 0–12 → E: 0,3,5 | A: 3,5,7 | D: 5,7 | G: 5,7,9 | B: 8,10 | e: 8,10,12.

---

## Marcos

1. Projeto Vite + Svelte + TS + Vitest configurado.
2. `theory/`: notas, escalas (com as fórmulas confirmadas primeiro), afinações, modo Full, com testes.
3. Braço SVG estático mostrando C Major no modo Full.
4. Controles: tônica, categorias, grade de escalas, cabeçalho com fórmula.
5. Estratégia de janela deslizante + Vertical com 1 âncora + tablatura (passando os casos de referência).
6. Múltiplas âncoras.
7. Diagonal com seleção de região.
8. Settings (canhoto, sustenido/bemol) e Tunings.
9. Estado na URL.
10. Catálogo completo de escalas (todas as fórmulas confirmadas no site).
11. Som (botão do cabeçalho toca a sequência exibida).
12. (Futuro) Estratégia N notas por corda.

---

## Registro de decisões

- Sem backend: toda a lógica é cálculo leve e roda no navegador. Python/FastAPI só entraria se surgir
  necessidade de persistência no servidor (ex.: histórico de estudo).
- O site usa "Vertical" para duas coisas; aqui, modo de forma = `position`/Vertical e orientação do braço
  ficou fora do escopo.
- Braço com 24 casas (o site tem 21). Âncoras 0–20.
- Algoritmo do Diagonal próprio (janela deslizante), unificado com o Vertical. O do site não foi copiado.
- Afinações Drop A e Drop B corrigidas em relação ao site.
- Janela deslizante: notas inalcançáveis por causa do corte na casa 24 são puladas em vez de encerrar
  a sequência (sem isso, Drop D na âncora 20 mostrava só 3 notas).
- Geometria do desenho (`(corda, casa) → (x, y)`) fica em `src/ui/geometry.ts`: é pura e testada,
  mas não é teoria musical.