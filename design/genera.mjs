// Generatore del set di simboli di Limen (direzione A, Xilografia; stati nel bollino tondo).
// Unica fonte di verità dei disegni. Uso: node design/genera.mjs
// Scrive: design/icons/<id>.svg, design/symbols.proposed.ts, design/catalogo.html (da catalogo.template.html).
//
// Ogni parte di un'icona è { d, taglio?, tratto? }:
// - d: sagoma piena (comandi assoluti);
// - taglio: sottotracciati aggiunti con fill-rule evenodd, i "tagli di sgorbia". Spariscono nella variante piccola (< 24 px);
// - tratto: spessore, se la parte è una linea (fill none, stroke currentColor).

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const QUI = dirname(fileURLToPath(import.meta.url));

// --- Geometria del bollino (stati) -----------------------------------------------------------
// Disco pieno r 10,5, filetto inciso tra r 9 e r 8,3, segno ritagliato dentro r 8,3 (scala 0,58).
const DISCO = (r) => `M${+(12 - r).toFixed(2)} 12A${r} ${r} 0 1 0 ${+(12 + r).toFixed(2)} 12A${r} ${r} 0 1 0 ${+(12 - r).toFixed(2)} 12Z`;
const BOLLINO = [DISCO(10.5), DISCO(9), DISCO(8.3)].join(' ');
const SCALA_BOLLINO = 0.58;

// Trasforma un tracciato fatto solo di M, L, H, V, Z assoluti.
function scala(d, k, cx = 12, cy = 12) {
  const r = (n) => +n.toFixed(2);
  const tok = d.match(/[MLHVZ]|-?\d*\.?\d+/g);
  let out = '', cmd = '', coppia = [];
  for (const t of tok) {
    if (/[MLHVZ]/.test(t)) { cmd = t; out += t; if (t === 'Z') out += ' '; continue; }
    const n = parseFloat(t);
    if (cmd === 'H') out += r(cx + (n - cx) * k) + ' ';
    else if (cmd === 'V') out += r(cy + (n - cy) * k) + ' ';
    else { coppia.push(n); if (coppia.length === 2) { out += r(cx + (coppia[0] - cx) * k) + ' ' + r(cy + (coppia[1] - cy) * k) + ' '; coppia = []; } }
  }
  return out.replace(/ ([MLHVZ])/g, '$1').trim();
}
const bollino = (segno) => [{ d: BOLLINO + ' ' + scala(segno, SCALA_BOLLINO), pari: true }];

// --- Segni riusati ----------------------------------------------------------------------------
const SCUDO = 'M4 3.5H20V11L18.5 16L12 21.5L5.5 16L4 11Z';
const SCUDO_TAGLIO = 'M5.5 5H18.5V10.8L17.2 15.3L12 19.6L6.8 15.3L5.5 10.8Z M6.3 5.8H17.7V10.7L16.5 14.9L12 18.6L7.5 14.9L6.3 10.7Z M11.3 7.5H12.7V16.3L12 17L11.3 16.3Z';
const ARCO = 'M8 20.5C3 16 3.5 7 12.6 4.5';
const PUNTA_ARCO = 'M17.4 3.2L13.4 7.6L11.8 1.4Z';
const RACCOLTA = 'M8.5 2.5H15.5L12 7Z M8.5 21.5H15.5L12 17Z M2.5 8.5V15.5L7 12Z M21.5 8.5V15.5L17 12Z M12 8.8L15.2 12L12 15.2L8.8 12Z';
const CERCHIO = (cx, cy, r) => `M${cx - r} ${cy}A${r} ${r} 0 1 0 ${cx + r} ${cy}A${r} ${r} 0 1 0 ${cx - r} ${cy}Z`;

// --- Il set -------------------------------------------------------------------------------------
// glifo: segnaposto testuale attuale di src/ui/symbols.ts, tenuto per compatibilità e come ripiego.
export const SET = [
  // Posture: la sagoma dice la reazione.
  { id: 'posture.assalto', etichetta: 'Assalto', glifo: '⚔', min: 20,
    nota: 'Spada che punta in alto verso il nemico: attacca, nessuna reazione.',
    trasf: 'rotate(45 12 12)',
    parti: [{ d: 'M12 1.5L14.2 5V15H9.8V5Z', taglio: 'M11.6 6.5V13.5H12.4V6.5Z' }, { d: 'M6 15.5H18L17 17.5H7Z' }, { d: 'M11 17.5H13V20.3H11Z' }, { d: 'M12 20.1L13.5 21.6L12 23.1L10.5 21.6Z' }] },
  { id: 'posture.guardia', etichetta: 'Guardia', glifo: '⛨', min: 16,
    nota: 'Scudo: para.',
    parti: [{ d: SCUDO, taglio: SCUDO_TAGLIO }] },
  { id: 'posture.attesa', etichetta: 'Attesa', glifo: '◔', min: 20,
    nota: 'Arco che aggira il colpo (il disco): schiva e contrattacca.',
    parti: [{ d: ARCO, tratto: 3.2 }, { d: PUNTA_ARCO }, { d: CERCHIO(15.5, 13.5, 2.3) }] },
  { id: 'posture.distanza', etichetta: 'Distanza', glifo: '⤢', min: 16,
    nota: 'Frecce che si allontanano dal vuoto centrale: evita i colpi corti.',
    parti: [{ d: 'M2 12L8 6.5V9.8H10.4V14.2H8V17.5Z M22 12L16 6.5V9.8H13.6V14.2H16V17.5Z M11.3 3.5H12.7V8H11.3Z M11.3 16H12.7V20.5H11.3Z' }] },
  { id: 'posture.preparazione', etichetta: 'Preparazione', glifo: '✧', min: 16,
    nota: 'Solo nemici. Stesso disegno di intent.preparazione: la forza converge nel nucleo.',
    parti: [{ d: RACCOLTA }] },

  // Intenzioni: gli attacchi puntano in basso, verso il giocatore. Massa = forza.
  { id: 'intent.pesante', etichetta: 'Colpo pesante', glifo: '✸', min: 20, pericolo: true,
    nota: 'Maglio che cala in diagonale: la testa larga è in basso, verso il giocatore.',
    trasf: 'translate(1 0) rotate(30 12 12)',
    parti: [{ d: 'M11 2H13V11.5H11Z' }, { d: 'M6 11.5H18L19.5 13V17L18 18.5H6L4.5 17V13Z', taglio: 'M7.1 13V17H7.9V13Z M16.1 13V17H16.9V13Z' }] },
  { id: 'intent.leggero', etichetta: 'Colpo leggero', glifo: '✦', min: 20, pericolo: true,
    nota: 'Pugnale che punta in basso: sagoma sottile, linee di velocità.',
    parti: [{ d: 'M12 22.5L13.3 19.5V9.5H10.7V19.5Z', taglio: 'M11.65 11V18.5H12.35V11Z' }, { d: 'M7.5 7.5H16.5L15.5 9.5H8.5Z' }, { d: 'M11.1 3.6H12.9V7.5H11.1Z' }, { d: 'M12 1.2L13.3 2.5L12 3.8L10.7 2.5Z' }, { d: 'M7.5 11V16M16.5 13V18', tratto: 1.6 }] },
  { id: 'intent.difesa', etichetta: 'Difesa', glifo: '⛨', min: 16,
    nota: 'Muro merlato: il nemico si chiude (guardia, attesa o distanza).',
    parti: [{ d: 'M3 7H7.5V10H9.75V7H14.25V10H16.5V7H21V20H3Z', taglio: 'M4.5 14.6H19.5V15.4H4.5Z M7.6 11H8.4V14.6H7.6Z M15.6 11H16.4V14.6H15.6Z M11.6 15.4H12.4V18.6H11.6Z' }] },
  { id: 'intent.preparazione', etichetta: 'Preparazione', glifo: '✧', min: 16,
    nota: 'Quattro punte che convergono nel nucleo: il nemico raccoglie le forze.',
    parti: [{ d: RACCOLTA }] },

  // Stati: sempre nel bollino tondo, così non si confondono con le azioni.
  { id: 'stato.vantaggio', etichetta: 'Vantaggio', glifo: '★', min: 16, bollino: true,
    nota: 'Due gradi in salita: colpisci per primo e al massimo.',
    parti: bollino('M12 2.5L20.5 11L18 13.5L12 7.5L6 13.5L3.5 11Z M12 10L20.5 18.5L18 21L12 15L6 21L3.5 18.5Z') },
  { id: 'stato.preparato', etichetta: 'Preparato', glifo: '✧', min: 16, bollino: true,
    nota: 'Il nucleo ora irradia: il prossimo colpo vale ×1,5.',
    parti: bollino('M12 7L17 12L12 17L7 12Z M9.5 5.5H14.5L12 1.5Z M9.5 18.5H14.5L12 22.5Z M5.5 9.5V14.5L1.5 12Z M18.5 9.5V14.5L22.5 12Z') },
  { id: 'stato.fase2', etichetta: 'Seconda fase', glifo: '☠', min: 16, bollino: true,
    nota: 'Numerale II: il boss cambia modo di combattere.',
    parti: bollino('M4 3H20V5.5H16.5V18.5H20V21H4V18.5H7.5V5.5H4Z M10 5.5H14V18.5H10Z') },

  // Risorse
  { id: 'risorsa.vigore', etichetta: 'Vigore', glifo: '♥', min: 12,
    nota: 'Cuore sfaccettato.',
    parti: [{ d: 'M12 21L3 12V7.5L5.8 4.5H9.2L12 7.3L14.8 4.5H18.2L21 7.5V12Z', taglio: 'M5.2 8.1L6.6 6.3H8.1L6.6 8.1V10.8H5.2Z' }] },
  { id: 'risorsa.fiato', etichetta: 'Fiato', glifo: '●', min: 12,
    nota: 'Tre linee di vento.',
    parti: [{ d: 'M2.5 8.5H13A3 3 0 1 0 10 5.5', tratto: 2.4 }, { d: 'M2.5 13H17.5A3 3 0 1 1 14.5 16', tratto: 2.4 }, { d: 'M2.5 17.5H9', tratto: 2.4 }] },
  { id: 'risorsa.fiato.pieno', etichetta: 'Fiato disponibile', glifo: '●', min: 8, estensione: true,
    nota: 'Pallino pieno. Estensione proposta.',
    parti: [{ d: CERCHIO(12, 12, 8) }] },
  { id: 'risorsa.fiato.vuoto', etichetta: 'Fiato speso', glifo: '○', min: 8, estensione: true,
    nota: 'Pallino vuoto: anello. Estensione proposta.',
    parti: [{ d: CERCHIO(12, 12, 8) + ' ' + CERCHIO(12, 12, 5), pari: true }] },

  // Eventi del registro (16 px): scintilla = impatto, frattura = rotto, vuoto = mancato.
  { id: 'evento.colpo', etichetta: 'Colpo a segno', glifo: '✖', min: 12, pericolo: true,
    nota: 'Scintilla a otto punte.',
    parti: [{ d: 'M12 2L13.53 8.3L17.66 6.34L15.7 10.47L22 12L15.7 13.53L17.66 17.66L13.53 15.7L12 22L10.47 15.7L6.34 17.66L8.3 13.53L2 12L8.3 10.47L6.34 6.34L10.47 8.3Z' }] },
  { id: 'evento.parata', etichetta: 'Parata', glifo: '▣', min: 12,
    nota: 'Scudo con la scintilla sull\'angolo.',
    parti: [{ d: 'M2.5 6.5H14.5V12.5L13.3 16.1L8.5 20L3.7 16.1L2.5 12.5Z' }, { d: 'M18 1.5L19.2 4.8L22.5 6L19.2 7.2L18 10.5L16.8 7.2L13.5 6L16.8 4.8Z' }] },
  { id: 'evento.schivata', etichetta: 'Schivata', glifo: '↷', min: 12,
    nota: 'L\'arco dell\'Attesa; il colpo passa a vuoto (tratteggio).',
    parti: [{ d: ARCO, tratto: 3.2 }, { d: PUNTA_ARCO }, { d: 'M15.6 9.5H17.6V11.7H15.6Z M15.6 13.3H17.6V15.5H15.6Z M15.6 17.1H17.6V19.3H15.6Z' }] },
  { id: 'evento.contrattacco', etichetta: 'Contrattacco', glifo: '↩', min: 12,
    nota: 'Inversione: scende, gira e torna su verso il nemico.',
    parti: [{ d: 'M6.5 3.5V12.5C6.5 17.5 8.8 20.5 12 20.5C15.2 20.5 17.5 17.5 17.5 12.5V9.5', tratto: 3 }, { d: 'M17.5 2.5L21.8 9.5H13.2Z' }] },
  { id: 'evento.evitato', etichetta: 'Evitato', glifo: '⇢', min: 12,
    nota: 'La freccia si ferma prima della linea: il colpo non arriva.',
    parti: [{ d: 'M10.9 2H13.1V6.5H10.9Z M7.5 6.5H16.5L12 11Z M6 18.5H18V21H6Z' }] },
  { id: 'evento.interrotto', etichetta: 'Interrotto', glifo: '✂', min: 12,
    nota: 'Freccia spezzata dalla frattura.',
    parti: [{ d: 'M10.8 2H13.2V7.4L12 8.8L10.8 7.8Z M12.3 12L13.5 11L14.7 12.4V15.2H18.8L13.5 21.8L8.2 15.2H12.3Z' }] },
  { id: 'evento.rotta', etichetta: 'Preparazione rotta', glifo: '✗', min: 12,
    nota: 'Il nucleo della preparazione spaccato in due.',
    parti: [{ d: 'M10.8 3L1.8 12L10.8 21L11.4 18L9.8 15L11.8 11L9.6 7.5Z M13.2 3L12 7.5L14.2 11L12.2 15L13.8 18L13.2 21L22.2 12Z' }] },

  // Modificatori dell'hint completo (estensione proposta): sagome piene, pensate per 16–20 px.
  { id: 'mod.portata.corta', etichetta: 'Portata corta', glifo: '⊔', min: 16, estensione: true,
    nota: 'Squadra stretta: arriva solo vicino.',
    parti: [{ d: 'M7.5 8H10V13.5H14V8H16.5V16.5H7.5Z' }] },
  { id: 'mod.portata.lunga', etichetta: 'Portata lunga', glifo: '⊔', min: 16, estensione: true,
    nota: 'Squadra larga: arriva anche in Distanza.',
    parti: [{ d: 'M1.5 8H4V13.5H20V8H22.5V16.5H1.5Z' }] },
  { id: 'mod.velocita.rapido', etichetta: 'Rapido', glifo: '»', min: 16, estensione: true,
    nota: 'Due punte: batte l\'Attesa.',
    parti: [{ d: 'M2.5 5H7L14 12L7 19H2.5L9.5 12Z M10 5H14.5L21.5 12L14.5 19H10L17 12Z' }] },
  { id: 'mod.velocita.normale', etichetta: 'Velocità normale', glifo: '›', min: 16, estensione: true,
    nota: 'Una punta.',
    parti: [{ d: 'M6.5 5H11L18 12L11 19H6.5L13.5 12Z' }] },
  { id: 'mod.velocita.lento', etichetta: 'Lento', glifo: '▼', min: 16, estensione: true,
    nota: 'Peso da bilancia.',
    parti: [{ d: CERCHIO(12, 5.5, 2.6) + ' ' + CERCHIO(12, 5.5, 1.1), pari: true }, { d: 'M7.5 9H16.5L20.5 20.5H3.5Z' }] },
  { id: 'mod.sfondaGuardia', etichetta: 'Sfonda la guardia', glifo: '⊘', min: 16, estensione: true,
    nota: 'Scudo spaccato dalla frattura: ignora la Parata.',
    parti: [{ d: 'M10.8 3.5H2.8V11L4.3 16L10.8 21.5L9.8 16.5L11.8 12L9.3 8Z M13.2 3.5L11.7 8L14.2 12L12.2 16.5L13.2 21.5L19.7 16L21.2 11V3.5Z' }] },
  { id: 'mod.inarrestabile', etichetta: 'Inarrestabile', glifo: '⇓', min: 16, estensione: true,
    nota: 'La freccia passa attraverso la barra spezzata: non si interrompe.',
    parti: [{ d: 'M10.8 2H13.2V15H17L12 22L7 15H10.8Z M2 10.5H8.5L7.5 12L8.5 13.5H2Z M22 10.5H15.5L16.5 12L15.5 13.5H22Z' }] },
];

// --- Rendering --------------------------------------------------------------------------------
function interno(s, piccolo) {
  if (s.raw) return s.raw;
  const parti = s.parti.map((p) => {
    if (p.tratto) return `<path d="${p.d}" fill="none" stroke="currentColor" stroke-width="${p.tratto}"/>`;
    if (p.pari) return `<path fill-rule="evenodd" d="${p.d}"/>`;
    if (p.taglio && !piccolo) return `<path fill-rule="evenodd" d="${p.d} ${p.taglio}"/>`;
    return `<path d="${p.d}"/>`;
  }).join('');
  return s.trasf ? `<g transform="${s.trasf}">${parti}</g>` : parti;
}
const haTagli = (s) => !!s.parti && s.parti.some((p) => p.taglio);
const famiglia = (id) => id.split('.')[0];

// --- Medaglioni del ventaglio delle posture (DESIGN §8.1) ---------------------------------------
// Anello con il segno in positivo: non si confonde con il bollino degli stati, che è un disco pieno.
// Il fondo carta dentro l'anello lo dà il contenitore (CSS), così il medaglione resta in currentColor.
const ANELLO = (est, int) => DISCO(est) + ' ' + DISCO(int);
const MEDAGLIONE = {
  riposo: { cornice: ANELLO(11.5, 10.4), k: 0.62 },
  selezionato: { cornice: ANELLO(11.5, 10.4) + ' ' + ANELLO(9.4, 8.8), k: 0.62 },
  confermato: { cornice: ANELLO(11.5, 9.2) + ' ' + ANELLO(8.4, 7.9), k: 0.56 },
};
const POSTURE_GIOCATORE = ['assalto', 'guardia', 'attesa', 'distanza'];
function medaglione(p, stato) {
  const base = SET.find((s) => s.id === 'posture.' + p);
  const m = MEDAGLIONE[stato];
  return '<path fill-rule="evenodd" d="' + m.cornice + '"/><g transform="translate(12 12) scale(' + m.k + ') translate(-12 -12)">' + interno(base, false) + '</g>';
}
for (const p of POSTURE_GIOCATORE) {
  const base = SET.find((s) => s.id === 'posture.' + p);
  SET.push({
    id: 'posture.' + p + '.medaglione', etichetta: base.etichetta, glifo: base.glifo, min: 44, estensione: true, famiglia: 'medaglione',
    nota: 'Medaglione del ventaglio: anello e segno in positivo. Tre stati: riposo, selezionato (doppio anello), confermato (anello spesso).',
    raw: medaglione(p, 'riposo'),
    stati: { riposo: medaglione(p, 'riposo'), selezionato: medaglione(p, 'selezionato'), confermato: medaglione(p, 'confermato') },
  });
}
const CORNICI_TS = Object.entries(MEDAGLIONE).map(([k, v]) => `  ${k}: { cornice: '${v.cornice}', k: ${v.k} },`).join('\n');

// 1. File SVG
const DIR_ICONE = join(QUI, 'icons');
mkdirSync(DIR_ICONE, { recursive: true });
for (const s of SET) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><title>${s.etichetta}</title>${interno(s, false)}</svg>\n`;
  writeFileSync(join(DIR_ICONE, `${s.id}.svg`), svg);
}

// 2. symbols.proposed.ts
const righe = SET.map((s) => {
  const piccolo = haTagli(s) ? `\n    piccolo: '${interno(s, true)}',` : '';
  return `  '${s.id}': {\n    etichetta: '${s.etichetta.replace(/'/g, "\\'")}',\n    glifo: '${s.glifo}',\n    svg: '${interno(s, false)}',${piccolo}\n  },`;
}).join('\n');

const ts = `// Id simbolo → { svg, etichetta } (ARENA_SPEC §7, più le estensioni proposte in docs/UI_SPEC.md).
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
${righe}
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
  if (!corpo) return \`<span class="icona-mancante" aria-hidden="true">\${s.glifo}</span>\`;
  const a11y = opz.parlante ? \`role="img" aria-label="\${s.etichetta}"\` : 'aria-hidden="true"';
  const classe = opz.classe ? \`icona \${opz.classe}\` : 'icona';
  return \`<svg class="\${classe}" viewBox="0 0 24 24" width="\${px}" height="\${px}" fill="currentColor" focusable="false" \${a11y}>\${corpo}</svg>\`;
}

/** Stati del medaglione nel ventaglio delle posture (DESIGN §8.1). */
export type StatoMedaglione = 'riposo' | 'selezionato' | 'confermato';

/** Cornici dei medaglioni (anelli) e scala del segno della postura al loro interno. */
const MEDAGLIONE: Record<StatoMedaglione, { cornice: string; k: number }> = {
${CORNICI_TS}
};

/**
 * Medaglione del ventaglio per una postura del giocatore: 'assalto', 'guardia', 'attesa', 'distanza'.
 * Il fondo carta dentro l'anello lo dà il contenitore (border-radius: 50%; background: var(--carta)).
 * Taglia minima 44 px, predefinita 52. La stringa è sicura: non va passata a esc().
 */
export function medaglione(postura: string, stato: StatoMedaglione = 'riposo', opz: OpzioniIcona = {}): string {
  const s = SIMBOLI[\`posture.\${postura}\`];
  if (!s) return icona(undefined, opz);
  const m = MEDAGLIONE[stato];
  const px = opz.px ?? 52;
  const a11y = opz.parlante ? \`role="img" aria-label="\${s.etichetta}"\` : 'aria-hidden="true"';
  const classe = opz.classe ? \`icona medaglione \${opz.classe}\` : 'icona medaglione';
  return \`<svg class="\${classe}" viewBox="0 0 24 24" width="\${px}" height="\${px}" fill="currentColor" focusable="false" \${a11y}><path fill-rule="evenodd" d="\${m.cornice}"/><g transform="translate(12 12) scale(\${m.k}) translate(-12 -12)">\${s.svg}</g></svg>\`;
}
`;
writeFileSync(join(QUI, 'symbols.proposed.ts'), ts);

// 3. Catalogo
const dati = SET.map((s) => ({
  id: s.id, etichetta: s.etichetta, famiglia: s.famiglia || famiglia(s.id), nota: s.nota, min: s.min,
  pericolo: !!s.pericolo, estensione: !!s.estensione, bollino: !!s.bollino,
  svg: interno(s, false), piccolo: haTagli(s) ? interno(s, true) : null, stati: s.stati || null,
}));
const tpl = readFileSync(join(QUI, 'catalogo.template.html'), 'utf8');
writeFileSync(join(QUI, 'catalogo.html'), tpl.replace('/*DATI*/[]', JSON.stringify(dati)));

console.log(`${SET.length} simboli: icons/, symbols.proposed.ts, catalogo.html`);
