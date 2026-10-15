// Pezzi di interfaccia comuni ai due layout (griglia e scena). Nessuna logica di gioco: si legge la DuelView.
import type { CombattenteView, DuelView } from '../core/view.ts';
import { icona, simbolo } from './symbols.ts';

export interface VoceRegistro {
  turno: number;
  testo: string;
  simbolo?: string;
}

// Le icone restituite da symbols.ts sono costanti sicure: NON passano da esc().
export function esc(s: string | number): string {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
}

export function intervallo([a, b]: [number, number]): string {
  return a === b ? `${a}` : `${a}–${b}`;
}

export function fiatoPieno(c: CombattenteView): number {
  return Math.max(0, Math.min(c.fiatoMax, c.fiato));
}

// Pallini del fiato (UI_SPEC §9): pieno e vuoto si distinguono per forma. A zero: niente reazioni, in --pericolo.
export function pallini(c: CombattenteView, px = 10): string {
  const pieni = fiatoPieno(c);
  const zero = pieni === 0;
  const punti = Array.from({ length: c.fiatoMax }, (_, i) => icona(i < pieni ? 'risorsa.fiato.pieno' : 'risorsa.fiato.vuoto', { px })).join('');
  const nome = `Fiato ${pieni} su ${c.fiatoMax}${zero ? ', senza fiato' : ''}`;
  return `<span class="fiato${zero ? ' zero' : ''}" role="img" aria-label="${esc(nome)}" title="${esc(nome)}">${punti}</span>`;
}

export function barraVigore(c: CombattenteView): string {
  const pct = c.vigoreMax > 0 ? Math.max(0, Math.min(100, (100 * c.vigore) / c.vigoreMax)) : 0;
  return `<div class="vigore" role="img" aria-label="Vigore ${c.vigore} su ${c.vigoreMax}"><div class="riempimento" style="width:${pct.toFixed(1)}%"></div><span class="valore">${icona('risorsa.vigore', { px: 12 })} ${c.vigore}/${c.vigoreMax}</span></div>`;
}

// Bollini di stato (vantaggio, preparato, spalle al muro). Con testo: l'icona è decorativa; senza, parlante.
export function stati(c: CombattenteView, conTesto: boolean): string {
  const chip = (id: string, attivo: boolean): string => {
    if (!attivo) return '';
    const s = simbolo(id);
    return conTesto
      ? `<span class="chip attivo">${icona(id, { px: 16 })} ${esc(s.etichetta)}</span>`
      : `<span class="bollino">${icona(id, { px: 16, parlante: true })}</span>`;
  };
  return chip('stato.vantaggio', c.vantaggio) + chip('stato.preparato', c.preparato) + chip('stato.spalle', c.spalle);
}

export function voce(v: VoceRegistro): string {
  const colpo = v.simbolo === 'evento.colpo' ? ' colpo' : '';
  return `<div class="voce${colpo}"><span class="g">${v.simbolo ? icona(v.simbolo, { px: 16 }) : '·'}</span><span>${esc(v.testo)}</span></div>`;
}

export function attacco(h: DuelView['hint']): boolean {
  return h.categoria === 'pesante' || h.categoria === 'leggero';
}

// Fila dei modificatori dell'hint completo (UI_SPEC §2.3): portata, velocità, tratti.
export function modificatori(h: DuelView['hint']): string {
  const d = h.dettaglio;
  if (!d) return '';
  const ids: string[] = [];
  if (d.portata) ids.push(`mod.portata.${d.portata}`);
  if (d.velocita) ids.push(`mod.velocita.${d.velocita}`);
  for (const f of d.flags) if (f === 'sfondaGuardia' || f === 'inarrestabile') ids.push(`mod.${f}`);
  if (!ids.length) return '';
  return `<span class="mods${attacco(h) ? ' pericolo' : ''}">${ids.map((id) => icona(id, { px: 16, parlante: true })).join('')}</span>`;
}

export function dettaglioHint(h: DuelView['hint']): string {
  const d = h.dettaglio;
  if (!d) return '';
  const danno = d.danno ? ` · ${d.danno[0] === d.danno[1] ? d.danno[0] : `${d.danno[0]}–${d.danno[1]}`} danni` : '';
  return `<div class="dettaglio"><div>${esc(d.nome)}${esc(danno)}</div>${modificatori(h)}</div>`;
}

export function costoEtichetta(p: DuelView['posture'][number]): string {
  if (p.motivo === 'spazio') return 'niente spazio';
  if (p.motivo === 'fiato') return 'fiato insufficiente';
  return p.attiva || p.costo === 0 ? 'gratis' : `costo ${p.costo} fiato`;
}
