// Id simbolo → { svg, etichetta } (ARENA_SPEC §7, più le estensioni proposte in docs/UI_SPEC.md).
// GENERATO da design/genera.mjs: non modificare a mano. Pronto a sostituire src/ui/symbols.ts.
// Direzione A (Xilografia), stati nel bollino tondo. Tutto in currentColor, griglia 24.

export interface Simbolo {
  /** Nome leggibile, anche per aria-label e title. */
  etichetta: string;
  /** Segnaposto testuale: ripiego e compatibilità con il render attuale. */
  glifo: string;
  /** Contenuto interno dell'SVG (viewBox 0 0 24 24), dettaglio pieno. */
  svg: string;
  /** Variante senza tagli per le taglie sotto i 24 px. Se manca si usa svg. */
  piccolo?: string;
}

export const SIMBOLI: Record<string, Simbolo> = {
  'posture.assalto': {
    etichetta: 'Assalto',
    glifo: '⚔',
    svg: '<g transform="rotate(45 12 12)"><path fill-rule="evenodd" d="M12 1.5L14.2 5V15H9.8V5Z M11.6 6.5V13.5H12.4V6.5Z"/><path d="M6 15.5H18L17 17.5H7Z"/><path d="M11 17.5H13V20.3H11Z"/><path d="M12 20.1L13.5 21.6L12 23.1L10.5 21.6Z"/></g>',
    piccolo: '<g transform="rotate(45 12 12)"><path d="M12 1.5L14.2 5V15H9.8V5Z"/><path d="M6 15.5H18L17 17.5H7Z"/><path d="M11 17.5H13V20.3H11Z"/><path d="M12 20.1L13.5 21.6L12 23.1L10.5 21.6Z"/></g>',
  },
  'posture.guardia': {
    etichetta: 'Guardia',
    glifo: '⛨',
    svg: '<path fill-rule="evenodd" d="M4 3.5H20V11L18.5 16L12 21.5L5.5 16L4 11Z M5.5 5H18.5V10.8L17.2 15.3L12 19.6L6.8 15.3L5.5 10.8Z M6.3 5.8H17.7V10.7L16.5 14.9L12 18.6L7.5 14.9L6.3 10.7Z M11.3 7.5H12.7V16.3L12 17L11.3 16.3Z"/>',
    piccolo: '<path d="M4 3.5H20V11L18.5 16L12 21.5L5.5 16L4 11Z"/>',
  },
  'posture.attesa': {
    etichetta: 'Attesa',
    glifo: '◔',
    svg: '<path d="M8 20.5C3 16 3.5 7 12.6 4.5" fill="none" stroke="currentColor" stroke-width="3.2"/><path d="M17.4 3.2L13.4 7.6L11.8 1.4Z"/><path d="M13.2 13.5A2.3 2.3 0 1 0 17.8 13.5A2.3 2.3 0 1 0 13.2 13.5Z"/>',
  },
  'posture.distanza': {
    etichetta: 'Distanza',
    glifo: '⤢',
    svg: '<path d="M2 12L8 6.5V9.8H10.4V14.2H8V17.5Z M22 12L16 6.5V9.8H13.6V14.2H16V17.5Z M11.3 3.5H12.7V8H11.3Z M11.3 16H12.7V20.5H11.3Z"/>',
  },
  'posture.preparazione': {
    etichetta: 'Preparazione',
    glifo: '✧',
    svg: '<path d="M8.5 2.5H15.5L12 7Z M8.5 21.5H15.5L12 17Z M2.5 8.5V15.5L7 12Z M21.5 8.5V15.5L17 12Z M12 8.8L15.2 12L12 15.2L8.8 12Z"/>',
  },
  'intent.pesante': {
    etichetta: 'Colpo pesante',
    glifo: '✸',
    svg: '<g transform="translate(1 0) rotate(30 12 12)"><path d="M11 2H13V11.5H11Z"/><path fill-rule="evenodd" d="M6 11.5H18L19.5 13V17L18 18.5H6L4.5 17V13Z M7.1 13V17H7.9V13Z M16.1 13V17H16.9V13Z"/></g>',
    piccolo: '<g transform="translate(1 0) rotate(30 12 12)"><path d="M11 2H13V11.5H11Z"/><path d="M6 11.5H18L19.5 13V17L18 18.5H6L4.5 17V13Z"/></g>',
  },
  'intent.leggero': {
    etichetta: 'Colpo leggero',
    glifo: '✦',
    svg: '<path fill-rule="evenodd" d="M12 22.5L13.3 19.5V9.5H10.7V19.5Z M11.65 11V18.5H12.35V11Z"/><path d="M7.5 7.5H16.5L15.5 9.5H8.5Z"/><path d="M11.1 3.6H12.9V7.5H11.1Z"/><path d="M12 1.2L13.3 2.5L12 3.8L10.7 2.5Z"/><path d="M7.5 11V16M16.5 13V18" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    piccolo: '<path d="M12 22.5L13.3 19.5V9.5H10.7V19.5Z"/><path d="M7.5 7.5H16.5L15.5 9.5H8.5Z"/><path d="M11.1 3.6H12.9V7.5H11.1Z"/><path d="M12 1.2L13.3 2.5L12 3.8L10.7 2.5Z"/><path d="M7.5 11V16M16.5 13V18" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  },
  'intent.difesa': {
    etichetta: 'Difesa',
    glifo: '⛨',
    svg: '<path fill-rule="evenodd" d="M3 7H7.5V10H9.75V7H14.25V10H16.5V7H21V20H3Z M4.5 14.6H19.5V15.4H4.5Z M7.6 11H8.4V14.6H7.6Z M15.6 11H16.4V14.6H15.6Z M11.6 15.4H12.4V18.6H11.6Z"/>',
    piccolo: '<path d="M3 7H7.5V10H9.75V7H14.25V10H16.5V7H21V20H3Z"/>',
  },
  'intent.preparazione': {
    etichetta: 'Preparazione',
    glifo: '✧',
    svg: '<path d="M8.5 2.5H15.5L12 7Z M8.5 21.5H15.5L12 17Z M2.5 8.5V15.5L7 12Z M21.5 8.5V15.5L17 12Z M12 8.8L15.2 12L12 15.2L8.8 12Z"/>',
  },
  'stato.vantaggio': {
    etichetta: 'Vantaggio',
    glifo: '★',
    svg: '<path fill-rule="evenodd" d="M1.5 12A10.5 10.5 0 1 0 22.5 12A10.5 10.5 0 1 0 1.5 12Z M3 12A9 9 0 1 0 21 12A9 9 0 1 0 3 12Z M3.7 12A8.3 8.3 0 1 0 20.3 12A8.3 8.3 0 1 0 3.7 12Z M12 6.49L16.93 11.42L15.48 12.87L12 9.39L8.52 12.87L7.07 11.42ZM12 10.84L16.93 15.77L15.48 17.22L12 13.74L8.52 17.22L7.07 15.77Z"/>',
  },
  'stato.preparato': {
    etichetta: 'Preparato',
    glifo: '✧',
    svg: '<path fill-rule="evenodd" d="M1.5 12A10.5 10.5 0 1 0 22.5 12A10.5 10.5 0 1 0 1.5 12Z M3 12A9 9 0 1 0 21 12A9 9 0 1 0 3 12Z M3.7 12A8.3 8.3 0 1 0 20.3 12A8.3 8.3 0 1 0 3.7 12Z M12 9.1L14.9 12L12 14.9L9.1 12ZM10.55 8.23H13.45L12 5.91ZM10.55 15.77H13.45L12 18.09ZM8.23 10.55V13.45L5.91 12ZM15.77 10.55V13.45L18.09 12Z"/>',
  },
  'stato.fase2': {
    etichetta: 'Seconda fase',
    glifo: '☠',
    svg: '<path fill-rule="evenodd" d="M1.5 12A10.5 10.5 0 1 0 22.5 12A10.5 10.5 0 1 0 1.5 12Z M3 12A9 9 0 1 0 21 12A9 9 0 1 0 3 12Z M3.7 12A8.3 8.3 0 1 0 20.3 12A8.3 8.3 0 1 0 3.7 12Z M7.36 6.78H16.64V8.23H14.61V15.77H16.64V17.22H7.36V15.77H9.39V8.23H7.36ZM10.84 8.23H13.16V15.77H10.84Z"/>',
  },
  'stato.spalle': {
    etichetta: 'Spalle al muro',
    glifo: '▌',
    svg: '<path fill-rule="evenodd" d="M1.5 12A10.5 10.5 0 1 0 22.5 12A10.5 10.5 0 1 0 1.5 12Z M3 12A9 9 0 1 0 21 12A9 9 0 1 0 3 12Z M3.7 12A8.3 8.3 0 1 0 20.3 12A8.3 8.3 0 1 0 3.7 12Z M6.78 6.78H9.39V17.22H6.78ZM10.55 12L14.03 8.52V10.72H17.22V13.28H14.03V15.48Z"/>',
  },
  'risorsa.vigore': {
    etichetta: 'Vigore',
    glifo: '♥',
    svg: '<path fill-rule="evenodd" d="M12 21L3 12V7.5L5.8 4.5H9.2L12 7.3L14.8 4.5H18.2L21 7.5V12Z M5.2 8.1L6.6 6.3H8.1L6.6 8.1V10.8H5.2Z"/>',
    piccolo: '<path d="M12 21L3 12V7.5L5.8 4.5H9.2L12 7.3L14.8 4.5H18.2L21 7.5V12Z"/>',
  },
  'risorsa.fiato': {
    etichetta: 'Fiato',
    glifo: '●',
    svg: '<path d="M2.5 8.5H13A3 3 0 1 0 10 5.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M2.5 13H17.5A3 3 0 1 1 14.5 16" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M2.5 17.5H9" fill="none" stroke="currentColor" stroke-width="2.4"/>',
  },
  'risorsa.fiato.pieno': {
    etichetta: 'Fiato disponibile',
    glifo: '●',
    svg: '<path d="M4 12A8 8 0 1 0 20 12A8 8 0 1 0 4 12Z"/>',
  },
  'risorsa.fiato.vuoto': {
    etichetta: 'Fiato speso',
    glifo: '○',
    svg: '<path fill-rule="evenodd" d="M4 12A8 8 0 1 0 20 12A8 8 0 1 0 4 12Z M7 12A5 5 0 1 0 17 12A5 5 0 1 0 7 12Z"/>',
  },
  'evento.colpo': {
    etichetta: 'Colpo a segno',
    glifo: '✖',
    svg: '<path d="M12 2L13.53 8.3L17.66 6.34L15.7 10.47L22 12L15.7 13.53L17.66 17.66L13.53 15.7L12 22L10.47 15.7L6.34 17.66L8.3 13.53L2 12L8.3 10.47L6.34 6.34L10.47 8.3Z"/>',
  },
  'evento.parata': {
    etichetta: 'Parata',
    glifo: '▣',
    svg: '<path d="M2.5 6.5H14.5V12.5L13.3 16.1L8.5 20L3.7 16.1L2.5 12.5Z"/><path d="M18 1.5L19.2 4.8L22.5 6L19.2 7.2L18 10.5L16.8 7.2L13.5 6L16.8 4.8Z"/>',
  },
  'evento.schivata': {
    etichetta: 'Schivata',
    glifo: '↷',
    svg: '<path d="M8 20.5C3 16 3.5 7 12.6 4.5" fill="none" stroke="currentColor" stroke-width="3.2"/><path d="M17.4 3.2L13.4 7.6L11.8 1.4Z"/><path d="M15.6 9.5H17.6V11.7H15.6Z M15.6 13.3H17.6V15.5H15.6Z M15.6 17.1H17.6V19.3H15.6Z"/>',
  },
  'evento.contrattacco': {
    etichetta: 'Contrattacco',
    glifo: '↩',
    svg: '<path d="M6.5 3.5V12.5C6.5 17.5 8.8 20.5 12 20.5C15.2 20.5 17.5 17.5 17.5 12.5V9.5" fill="none" stroke="currentColor" stroke-width="3"/><path d="M17.5 2.5L21.8 9.5H13.2Z"/>',
  },
  'evento.evitato': {
    etichetta: 'Evitato',
    glifo: '⇢',
    svg: '<path d="M10.9 2H13.1V6.5H10.9Z M7.5 6.5H16.5L12 11Z M6 18.5H18V21H6Z"/>',
  },
  'evento.interrotto': {
    etichetta: 'Interrotto',
    glifo: '✂',
    svg: '<path d="M10.8 2H13.2V7.4L12 8.8L10.8 7.8Z M12.3 12L13.5 11L14.7 12.4V15.2H18.8L13.5 21.8L8.2 15.2H12.3Z"/>',
  },
  'evento.rotta': {
    etichetta: 'Preparazione rotta',
    glifo: '✗',
    svg: '<path d="M10.8 3L1.8 12L10.8 21L11.4 18L9.8 15L11.8 11L9.6 7.5Z M13.2 3L12 7.5L14.2 11L12.2 15L13.8 18L13.2 21L22.2 12Z"/>',
  },
  'evento.incalza': {
    etichetta: 'Incalza',
    glifo: '«',
    svg: '<path fill-rule="evenodd" d="M2 12L7.5 6.5V9.5H10.5V14.5H7.5V17.5Z M4.6 12L6.5 10.1V11H9V13H6.5V13.9Z"/><path d="M11.8 12L18 5.5V9.2H22V14.8H18V18.5Z"/>',
  },
  'evento.punta': {
    etichetta: 'Punta',
    glifo: '↑',
    svg: '<path d="M12 0.8L13.4 3.6L16.2 5L13.4 6.4L12 9.2L10.6 6.4L7.8 5L10.6 3.6Z"/><path d="M12 10L15.5 14.2L13.8 17.2H10.2L8.5 14.2Z"/><path d="M10.9 17.2H13.1V22.5H10.9Z"/>',
  },
  'evento.arresto': {
    etichetta: 'Arresto',
    glifo: '⤒',
    svg: '<path d="M12 1L19 8L16.4 10.6L12 6.2L7.6 10.6L5 8Z"/><path d="M12 11.2L15.5 15.2L13.8 18H10.2L8.5 15.2Z"/><path d="M10.9 18H13.1V22.5H10.9Z"/>',
  },
  'mod.portata.corta': {
    etichetta: 'Portata corta',
    glifo: '⊔',
    svg: '<path d="M7.5 8H10V13.5H14V8H16.5V16.5H7.5Z"/>',
  },
  'mod.portata.lunga': {
    etichetta: 'Portata lunga',
    glifo: '⊔',
    svg: '<path d="M1.5 8H4V13.5H20V8H22.5V16.5H1.5Z"/>',
  },
  'mod.velocita.rapido': {
    etichetta: 'Rapido',
    glifo: '»',
    svg: '<path d="M2.5 5H7L14 12L7 19H2.5L9.5 12Z M10 5H14.5L21.5 12L14.5 19H10L17 12Z"/>',
  },
  'mod.velocita.normale': {
    etichetta: 'Velocità normale',
    glifo: '›',
    svg: '<path d="M6.5 5H11L18 12L11 19H6.5L13.5 12Z"/>',
  },
  'mod.velocita.lento': {
    etichetta: 'Lento',
    glifo: '▼',
    svg: '<path fill-rule="evenodd" d="M9.4 5.5A2.6 2.6 0 1 0 14.6 5.5A2.6 2.6 0 1 0 9.4 5.5Z M10.9 5.5A1.1 1.1 0 1 0 13.1 5.5A1.1 1.1 0 1 0 10.9 5.5Z"/><path d="M7.5 9H16.5L20.5 20.5H3.5Z"/>',
  },
  'mod.sfondaGuardia': {
    etichetta: 'Sfonda la guardia',
    glifo: '⊘',
    svg: '<path d="M10.8 3.5H2.8V11L4.3 16L10.8 21.5L9.8 16.5L11.8 12L9.3 8Z M13.2 3.5L11.7 8L14.2 12L12.2 16.5L13.2 21.5L19.7 16L21.2 11V3.5Z"/>',
  },
  'mod.inarrestabile': {
    etichetta: 'Inarrestabile',
    glifo: '⇓',
    svg: '<path d="M10.8 2H13.2V15H17L12 22L7 15H10.8Z M2 10.5H8.5L7.5 12L8.5 13.5H2Z M22 10.5H15.5L16.5 12L15.5 13.5H22Z"/>',
  },
  'posture.assalto.medaglione': {
    etichetta: 'Assalto',
    glifo: '⚔',
    svg: '<path fill-rule="evenodd" d="M0.5 12A11.5 11.5 0 1 0 23.5 12A11.5 11.5 0 1 0 0.5 12Z M1.6 12A10.4 10.4 0 1 0 22.4 12A10.4 10.4 0 1 0 1.6 12Z"/><g transform="translate(12 12) scale(0.62) translate(-12 -12)"><g transform="rotate(45 12 12)"><path fill-rule="evenodd" d="M12 1.5L14.2 5V15H9.8V5Z M11.6 6.5V13.5H12.4V6.5Z"/><path d="M6 15.5H18L17 17.5H7Z"/><path d="M11 17.5H13V20.3H11Z"/><path d="M12 20.1L13.5 21.6L12 23.1L10.5 21.6Z"/></g></g>',
  },
  'posture.guardia.medaglione': {
    etichetta: 'Guardia',
    glifo: '⛨',
    svg: '<path fill-rule="evenodd" d="M0.5 12A11.5 11.5 0 1 0 23.5 12A11.5 11.5 0 1 0 0.5 12Z M1.6 12A10.4 10.4 0 1 0 22.4 12A10.4 10.4 0 1 0 1.6 12Z"/><g transform="translate(12 12) scale(0.62) translate(-12 -12)"><path fill-rule="evenodd" d="M4 3.5H20V11L18.5 16L12 21.5L5.5 16L4 11Z M5.5 5H18.5V10.8L17.2 15.3L12 19.6L6.8 15.3L5.5 10.8Z M6.3 5.8H17.7V10.7L16.5 14.9L12 18.6L7.5 14.9L6.3 10.7Z M11.3 7.5H12.7V16.3L12 17L11.3 16.3Z"/></g>',
  },
  'posture.attesa.medaglione': {
    etichetta: 'Attesa',
    glifo: '◔',
    svg: '<path fill-rule="evenodd" d="M0.5 12A11.5 11.5 0 1 0 23.5 12A11.5 11.5 0 1 0 0.5 12Z M1.6 12A10.4 10.4 0 1 0 22.4 12A10.4 10.4 0 1 0 1.6 12Z"/><g transform="translate(12 12) scale(0.62) translate(-12 -12)"><path d="M8 20.5C3 16 3.5 7 12.6 4.5" fill="none" stroke="currentColor" stroke-width="3.2"/><path d="M17.4 3.2L13.4 7.6L11.8 1.4Z"/><path d="M13.2 13.5A2.3 2.3 0 1 0 17.8 13.5A2.3 2.3 0 1 0 13.2 13.5Z"/></g>',
  },
  'posture.distanza.medaglione': {
    etichetta: 'Distanza',
    glifo: '⤢',
    svg: '<path fill-rule="evenodd" d="M0.5 12A11.5 11.5 0 1 0 23.5 12A11.5 11.5 0 1 0 0.5 12Z M1.6 12A10.4 10.4 0 1 0 22.4 12A10.4 10.4 0 1 0 1.6 12Z"/><g transform="translate(12 12) scale(0.62) translate(-12 -12)"><path d="M2 12L8 6.5V9.8H10.4V14.2H8V17.5Z M22 12L16 6.5V9.8H13.6V14.2H16V17.5Z M11.3 3.5H12.7V8H11.3Z M11.3 16H12.7V20.5H11.3Z"/></g>',
  },
};

export function simbolo(id: string | undefined): Simbolo {
  return (id && SIMBOLI[id]) || { etichetta: id ?? '', glifo: '?', svg: '' };
}

export interface OpzioniIcona {
  /** Lato in px (predefinito 24). Sotto i 24 si usa la variante piccola. */
  px?: number;
  /** Classe CSS aggiuntiva. */
  classe?: string;
  /** true: l'icona porta significato da sola (role="img" con aria-label). Predefinito: decorativa. */
  parlante?: boolean;
}

/** Restituisce l'SVG inline. La stringa è costante e sicura: non va passata a esc(). */
export function icona(id: string | undefined, opz: OpzioniIcona = {}): string {
  const s = simbolo(id);
  const px = opz.px ?? 24;
  const corpo = (px < 24 && s.piccolo) || s.svg;
  if (!corpo) return `<span class="icona-mancante" aria-hidden="true">${s.glifo}</span>`;
  const a11y = opz.parlante ? `role="img" aria-label="${s.etichetta}"` : 'aria-hidden="true"';
  const classe = opz.classe ? `icona ${opz.classe}` : 'icona';
  return `<svg class="${classe}" viewBox="0 0 24 24" width="${px}" height="${px}" fill="currentColor" focusable="false" ${a11y}>${corpo}</svg>`;
}

/** Stati del medaglione nel ventaglio delle posture (DESIGN §8.1). */
export type StatoMedaglione = 'riposo' | 'selezionato' | 'confermato';

/** Cornici dei medaglioni (anelli) e scala del segno della postura al loro interno. */
const MEDAGLIONE: Record<StatoMedaglione, { cornice: string; k: number }> = {
  riposo: { cornice: 'M0.5 12A11.5 11.5 0 1 0 23.5 12A11.5 11.5 0 1 0 0.5 12Z M1.6 12A10.4 10.4 0 1 0 22.4 12A10.4 10.4 0 1 0 1.6 12Z', k: 0.62 },
  selezionato: { cornice: 'M0.5 12A11.5 11.5 0 1 0 23.5 12A11.5 11.5 0 1 0 0.5 12Z M1.6 12A10.4 10.4 0 1 0 22.4 12A10.4 10.4 0 1 0 1.6 12Z M2.6 12A9.4 9.4 0 1 0 21.4 12A9.4 9.4 0 1 0 2.6 12Z M3.2 12A8.8 8.8 0 1 0 20.8 12A8.8 8.8 0 1 0 3.2 12Z', k: 0.62 },
  confermato: { cornice: 'M0.5 12A11.5 11.5 0 1 0 23.5 12A11.5 11.5 0 1 0 0.5 12Z M2.8 12A9.2 9.2 0 1 0 21.2 12A9.2 9.2 0 1 0 2.8 12Z M3.6 12A8.4 8.4 0 1 0 20.4 12A8.4 8.4 0 1 0 3.6 12Z M4.1 12A7.9 7.9 0 1 0 19.9 12A7.9 7.9 0 1 0 4.1 12Z', k: 0.56 },
};

/**
 * Medaglione del ventaglio per una postura del giocatore: 'assalto', 'guardia', 'attesa', 'distanza'.
 * Il fondo carta dentro l'anello lo dà il contenitore (border-radius: 50%; background: var(--carta)).
 * Taglia minima 44 px, predefinita 52. La stringa è sicura: non va passata a esc().
 */
export function medaglione(postura: string, stato: StatoMedaglione = 'riposo', opz: OpzioniIcona = {}): string {
  const s = SIMBOLI[`posture.${postura}`];
  if (!s) return icona(undefined, opz);
  const m = MEDAGLIONE[stato];
  const px = opz.px ?? 52;
  const a11y = opz.parlante ? `role="img" aria-label="${s.etichetta}"` : 'aria-hidden="true"';
  const classe = opz.classe ? `icona medaglione ${opz.classe}` : 'icona medaglione';
  return `<svg class="${classe}" viewBox="0 0 24 24" width="${px}" height="${px}" fill="currentColor" focusable="false" ${a11y}><path fill-rule="evenodd" d="${m.cornice}"/><g transform="translate(12 12) scale(${m.k}) translate(-12 -12)">${s.svg}</g></svg>`;
}
