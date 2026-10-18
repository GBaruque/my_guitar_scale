// Toca frases de notas com a Web Audio API do navegador (sem biblioteca, sem arquivos de som).
//
// Cada nota é um "pluck" sintetizado: uma onda dente-de-serra passando por um filtro passa-baixa
// que fecha rápido, com volume que sobe em 5 ms e decai devagar. É o mesmo princípio de uma corda
// beliscada: o som começa brilhante (muitos harmônicos) e vai ficando escuro enquanto morre.
//
// O áudio é agendado no relógio do AudioContext (preciso); o destaque da nota na tela usa
// setTimeout (aproximado, o que basta para a vista).

import { midiToFrequency } from '../theory/notes';
import type { Phrase, PlaybackStep } from '../theory/playback';

/** Tempo entre o início de uma nota e o da próxima. */
export const NOTE_INTERVAL_SECONDS = 0.28;
/** Pausa extra entre frases (ex.: entre uma âncora e a seguinte). */
export const PHRASE_GAP_SECONDS = 0.6;
/** Quanto tempo cada nota fica soando (pode sobrepor a seguinte, como numa corda de verdade). */
const NOTE_RING_SECONDS = 1.1;
const PEAK_GAIN = 0.25;
/** Margem para o primeiro agendamento não cair no passado. */
const START_DELAY_SECONDS = 0.05;

let context: AudioContext | null = null;

export interface PlaybackHandle {
  stop(): void;
}

function pluck(ctx: AudioContext, output: AudioNode, frequency: number, time: number) {
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = frequency;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 1;
  filter.frequency.setValueAtTime(Math.min(frequency * 8, 8000), time);
  filter.frequency.exponentialRampToValueAtTime(Math.max(frequency * 1.5, 200), time + 0.4);

  const gain = ctx.createGain();
  // Rampas exponenciais não podem começar nem terminar em 0; 0.0001 é "silêncio" na prática.
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(PEAK_GAIN, time + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + NOTE_RING_SECONDS);

  osc.connect(filter).connect(gain).connect(output);
  osc.start(time);
  osc.stop(time + NOTE_RING_SECONDS + 0.05);
}

/**
 * Toca as frases em sequência. `onStep` é chamado com cada passo quando ele começa a soar,
 * e com `null` quando tudo termina (ou quando `stop()` é chamado).
 */
export function playPhrases(phrases: Phrase[], onStep: (step: PlaybackStep | null) => void): PlaybackHandle {
  context ??= new AudioContext();
  const ctx = context;
  // Navegadores criam o contexto "suspenso" até haver interação; o clique no botão conta.
  void ctx.resume();

  // Um volume geral por reprodução: parar = baixar este volume e desconectar.
  const master = ctx.createGain();
  master.connect(ctx.destination);

  const timers: ReturnType<typeof setTimeout>[] = [];
  const startAt = ctx.currentTime + START_DELAY_SECONDS;
  let time = startAt;

  for (const phrase of phrases) {
    for (const step of phrase) {
      pluck(ctx, master, midiToFrequency(step.midi), time);
      timers.push(setTimeout(() => onStep(step), (time - ctx.currentTime) * 1000));
      time += NOTE_INTERVAL_SECONDS;
    }
    time += PHRASE_GAP_SECONDS;
  }
  // Fim: um pouco depois da última nota começar.
  timers.push(setTimeout(() => onStep(null), (time - ctx.currentTime) * 1000));

  return {
    stop() {
      timers.forEach(clearTimeout);
      const now = ctx.currentTime;
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 0.05); // corte rápido sem estalo
      setTimeout(() => master.disconnect(), 100);
      onStep(null);
    },
  };
}
