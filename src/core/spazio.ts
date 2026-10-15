// Spazio alle spalle (ARENA_SPEC §12.2 R2): UNICA implementazione, condivisa da risolutore, IA e vista.
import type { Combattente } from './types.ts';
import { BALANCE } from '../data/balance.ts';

// In Distanza da troppi turni consecutivi non si può restarci né tornarci subito.
export function senzaSpazio(c: Combattente): boolean {
  return c.distanzaConsecutive >= BALANCE.distanzaConsecutiveMax;
}

// Chi è in Distanza e non può restarci è con le spalle al muro e cambia postura gratis.
export function costoCambioDi(c: Combattente): number {
  return c.postura === 'distanza' && senzaSpazio(c) ? 0 : BALANCE.costoCambio;
}
