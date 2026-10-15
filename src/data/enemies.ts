import type { Mossa, Profilo } from '../core/types.ts';

// Registro dei profili. I nemici veri sono aggiunti in fondo al file; i test possono
// registrare profili propri con registraProfilo().
export const PROFILI: Record<string, Profilo> = {};

export function registraProfilo(p: Profilo): void {
  PROFILI[p.id] = p;
}

export function trovaProfilo(id: string): Profilo {
  const p = PROFILI[id];
  if (!p) throw new Error(`Profilo sconosciuto: ${id}`);
  return p;
}

export function trovaMossa(profiloId: string, mossaId: string): Mossa {
  const m = trovaProfilo(profiloId).mosse.find((x) => x.id === mossaId);
  if (!m) throw new Error(`Mossa sconosciuta: ${profiloId}/${mossaId}`);
  return m;
}

// --- I cinque nemici dell'arena (ARENA_SPEC §6) -------------------------------

function assalto(id: string, nome: string, a: NonNullable<Mossa['attacco']>): Mossa {
  return { id, nome, archetipo: 'assalto', attacco: a };
}

const RECLUTA: Profilo = {
  id: 'recluta',
  nome: 'Recluta',
  articolo: 'la',
  vigore: 11,
  fiato: 2,
  velocita: 1,
  gradi: { parata: 1, schivata: 1 },
  mosse: [
    assalto('fendente', 'Fendente', { forza: 'pesante', portata: 'corta', velocita: 'normale', danno: [3, 5] }),
    { id: 'copertura', nome: 'Copertura', archetipo: 'guardia' },
  ],
  fase1: {
    mosse: [
      { mossa: 'fendente', peso: 1 },
      { mossa: 'copertura', peso: 1 },
    ],
    sequenza: ['fendente', 'copertura'],
    adattamento: 1,
  },
};

const DUELLANTE: Profilo = {
  id: 'duellante',
  nome: 'Duellante',
  vigore: 11,
  fiato: 5,
  velocita: 3,
  gradi: { parata: 2, schivata: 1 },
  mosse: [
    assalto('stoccata', 'Stoccata', { forza: 'leggero', portata: 'corta', velocita: 'rapido', danno: [5, 6] }),
    assalto('finta', 'Finta', { forza: 'leggero', portata: 'corta', velocita: 'rapido', danno: [6, 7], sfondaGuardia: true }),
    {
      id: 'parata',
      nome: 'Parata',
      archetipo: 'guardia',
      attacco: { forza: 'leggero', portata: 'corta', velocita: 'rapido', danno: [4, 5] },
    },
    assalto('affondo', 'Affondo', { forza: 'pesante', portata: 'corta', velocita: 'normale', danno: [8, 10] }),
  ],
  fase1: {
    mosse: [
      { mossa: 'stoccata', peso: 1 },
      { mossa: 'finta', peso: 2 },
      { mossa: 'parata', peso: 10 },
      { mossa: 'affondo', peso: 10 },
    ],
    adattamento: 3,
  },
};

const BRUTO: Profilo = {
  id: 'bruto',
  nome: 'Bruto',
  vigore: 20,
  fiato: 5,
  velocita: 3,
  gradi: { parata: 1, schivata: 1 },
  mosse: [
    assalto('maglio', 'Maglio', { forza: 'pesante', portata: 'corta', velocita: 'lento', danno: [7, 9] }),
    assalto('spallata', 'Spallata', { forza: 'pesante', portata: 'corta', velocita: 'normale', danno: [7, 8], sfondaGuardia: true }),
    { id: 'raccogliersi', nome: 'Raccogliersi', archetipo: 'preparazione' },
  ],
  fase1: {
    mosse: [
      { mossa: 'maglio', peso: 1 },
      { mossa: 'spallata', peso: 10 },
      { mossa: 'raccogliersi', peso: 1, modificatori: [{ quando: { tipo: 'fiatoSotto', n: 2 }, x: 3 }] },
    ],
    adattamento: 2,
  },
};

const LANCIERE: Profilo = {
  id: 'lanciere',
  nome: 'Lanciere',
  vigore: 14,
  fiato: 5,
  velocita: 2,
  gradi: { parata: 1, schivata: 1 },
  mosse: [
    assalto('affondoLungo', 'Affondo lungo', { forza: 'leggero', portata: 'lunga', velocita: 'normale', danno: [4, 5] }),
    assalto('colpoDAsta', "Colpo d'asta", { forza: 'pesante', portata: 'lunga', velocita: 'lento', danno: [14, 15] }),
    { id: 'tenereABada', nome: 'Tenere a bada', archetipo: 'distanza' },
  ],
  fase1: {
    mosse: [
      { mossa: 'affondoLungo', peso: 10 },
      { mossa: 'colpoDAsta', peso: 3 },
      { mossa: 'tenereABada', peso: 2, modificatori: [{ quando: { tipo: 'vigoreSotto', frazione: 0.4 }, x: 2 }] },
    ],
    adattamento: 2,
  },
};

const MIETITORE: Profilo = {
  id: 'mietitore',
  nome: 'Mietitore',
  vigore: 44,
  fiato: 8,
  velocita: 2,
  gradi: { parata: 3, schivata: 2 },
  mosse: [
    assalto('falciata', 'Falciata', { forza: 'pesante', portata: 'corta', velocita: 'normale', danno: [5, 7] }),
    assalto('mietere', 'Mietere', { forza: 'leggero', portata: 'lunga', velocita: 'normale', danno: [7, 8] }),
    { id: 'guardiaDOsso', nome: "Guardia d'osso", archetipo: 'guardia' },
    { id: 'raccogliersi', nome: 'Raccogliersi', archetipo: 'preparazione' },
    assalto('carica', 'Carica', { forza: 'pesante', portata: 'corta', velocita: 'normale', danno: [10, 12], inarrestabile: true }),
  ],
  fase1: {
    mosse: [
      { mossa: 'falciata', peso: 10 },
      { mossa: 'mietere', peso: 4 },
      { mossa: 'guardiaDOsso', peso: 3 },
      { mossa: 'raccogliersi', peso: 5 },
    ],
    adattamento: 2,
  },
  fase2: {
    mosse: [
      { mossa: 'carica', peso: 9 },
      { mossa: 'falciata', peso: 7 },
      { mossa: 'mietere', peso: 2 },
      { mossa: 'guardiaDOsso', peso: 3 },
      { mossa: 'raccogliersi', peso: 4 },
    ],
    adattamento: 3,
  },
};

export const ORDINE_NEMICI = ['recluta', 'duellante', 'bruto', 'lanciere', 'mietitore'];
for (const p of [RECLUTA, DUELLANTE, BRUTO, LANCIERE, MIETITORE]) registraProfilo(p);
