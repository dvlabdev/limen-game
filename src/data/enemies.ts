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
