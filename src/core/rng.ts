import type { Dado } from './types.ts';

// mulberry32: lo stato è un intero a 32 bit, quindi serializzabile in JSON.
export function mulberry32(stato: number): { valore: number; stato: number } {
  const a = (stato + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return { valore: ((t ^ (t >>> 14)) >>> 0) / 4294967296, stato: a };
}

// Estrae un numero in [0, 1) e fa avanzare lo stato del contenitore.
export function estrai(contenitore: { rng: number }): number {
  const r = mulberry32(contenitore.rng);
  contenitore.rng = r.stato;
  return r.valore;
}

export function dadoDaStato(contenitore: { rng: number }): Dado {
  return (min, max) => min + Math.floor(estrai(contenitore) * (max - min + 1));
}

// Dadi finti per i test e per l'anteprima dei danni.
export const dadoMinimo: Dado = (min) => min;
export const dadoMassimo: Dado = (_min, max) => max;
