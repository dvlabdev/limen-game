import type { Archetipo, Mossa, PosturaId } from '../core/types.ts';

// La postura del giocatore è anche la sua mossa.
export const POSTURE: Record<PosturaId, Mossa> = {
  assalto: {
    id: 'assalto',
    nome: 'Assalto',
    archetipo: 'assalto',
    attacco: { forza: 'pesante', portata: 'corta', velocita: 'normale', danno: [4, 6] },
  },
  guardia: {
    id: 'guardia',
    nome: 'Guardia',
    archetipo: 'guardia',
    attacco: { forza: 'leggero', portata: 'corta', velocita: 'rapido', danno: [1, 2] },
  },
  attesa: { id: 'attesa', nome: 'Attesa', archetipo: 'attesa' },
  distanza: { id: 'distanza', nome: 'Distanza', archetipo: 'distanza' },
};

export const ORDINE_POSTURE: PosturaId[] = ['assalto', 'guardia', 'attesa', 'distanza'];

export const NOMI_ARCHETIPO: Record<Archetipo, string> = {
  assalto: 'Assalto',
  guardia: 'Guardia',
  attesa: 'Attesa',
  distanza: 'Distanza',
  preparazione: 'Preparazione',
};
