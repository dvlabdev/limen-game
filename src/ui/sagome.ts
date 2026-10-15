// SEGNAPOSTO delle sagome statiche (ARENA_S23_SPEC §3). Le sagome vere le produce la fase C2a in
// design/sagome.proposed.ts, con la stessa firma: sagoma(id, { px }). Quando il file esiste, questo modulo
// va sostituito con una copia di quello (come per symbols.ts).
//
// Convenzioni (da design/sagome-dati.mjs): viewBox -90 -150 180 156, terreno a y = 0, figura di profilo
// rivolta a destra, tutto in currentColor. Il nemico si specchia in CSS (la scena applica scaleX(-1)).
// Id: 'viandante.assalto' | 'viandante.guardia' | 'viandante.attesa' | 'viandante.distanza' e i cinque
// nemici 'recluta', 'duellante', 'bruto', 'lanciere', 'mietitore'.

export interface OpzioniSagoma {
  /** Altezza in px dell'intero riquadro (predefinito 130: la figura è alta circa 120 px). */
  px?: number;
  classe?: string;
  /** true: role="img" con aria-label. Predefinito: decorativa. */
  parlante?: boolean;
}

const ETICHETTE: Record<string, string> = {
  'viandante.assalto': 'Viandante in Assalto',
  'viandante.guardia': 'Viandante in Guardia',
  'viandante.attesa': 'Viandante in Attesa',
  'viandante.distanza': 'Viandante a Distanza',
  recluta: 'Recluta',
  duellante: 'Duellante',
  bruto: 'Bruto',
  lanciere: 'Lanciere',
  mietitore: 'Mietitore',
};

const poli = (...p: Array<[number, number]>): string => `M${p.map(([x, y]) => `${x} ${y}`).join('L')}Z`;
const asta = (x1: number, y1: number, x2: number, y2: number, w: number): string =>
  `<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="butt"/>`;

// Figura umana semplice: gambe, busto inclinato dal bacino, testa e un'arma in mano.
function umano(opz: { anca: number; busto: number; larg: number; testa: number; arma: string; extra?: string }): string {
  const { anca, busto, larg, testa, arma, extra = '' } = opz;
  const h = larg / 2;
  const gambe = `<path d="${poli([-h, -anca], [h, -anca], [h + 14, 0], [h + 4, 0], [0, -anca + 14], [-h - 6, 0], [-h - 16, 0])}"/>`;
  const busto_ = `<g transform="rotate(${busto} 0 ${-anca})"><path d="${poli([-h, -anca], [h, -anca], [h - 2, -anca - 50], [-h + 2, -anca - 50])}"/><path d="${poli([-h + 2, -anca - 50], [h - 2, -anca - 50], [h + 4, -anca - 44], [-h - 4, -anca - 44])}"/><circle cx="2" cy="${-anca - 62}" r="${testa}"/>${arma}</g>`;
  return gambe + busto_ + extra;
}

function corpo(id: string): string {
  switch (id) {
    case 'viandante.assalto':
      return umano({ anca: 47, busto: 19, larg: 22, testa: 10, arma: `${asta(8, -92, 34, -135, 3.2)}<path d="${poli([30, -134], [40, -142], [38, -128])}"/>` });
    case 'viandante.guardia':
      return umano({ anca: 50, busto: 0, larg: 22, testa: 10, arma: `${asta(16, -92, 18, -140, 3.2)}<path d="${poli([14, -138], [18, -150], [22, -138])}"/>` });
    case 'viandante.attesa':
      return umano({ anca: 39, busto: 27, larg: 22, testa: 9, arma: `${asta(10, -78, 38, -28, 3.2)}` });
    case 'viandante.distanza':
      return umano({ anca: 53, busto: -15, larg: 22, testa: 10, arma: `${asta(8, -92, 60, -92, 3.2)}<path d="${poli([58, -96], [72, -92], [58, -88])}"/>` });
    case 'recluta':
      return umano({ anca: 48, busto: 0, larg: 24, testa: 9, arma: `${asta(14, -85, 36, -85, 3)}<circle cx="16" cy="-82" r="14" fill="none" stroke="currentColor" stroke-width="4"/>` });
    case 'duellante':
      return umano({ anca: 52, busto: 6, larg: 18, testa: 9, arma: asta(10, -90, 62, -96, 1.8) });
    case 'bruto':
      return umano({ anca: 44, busto: 4, larg: 34, testa: 11, arma: `${asta(12, -70, 24, -128, 4)}<path d="${poli([10, -130], [44, -138], [44, -112], [10, -114])}"/>` });
    case 'lanciere':
      return umano({ anca: 52, busto: 0, larg: 20, testa: 9, arma: `${asta(-30, -70, 78, -100, 2.6)}<path d="${poli([74, -106], [90, -100], [75, -94])}"/>` });
    case 'mietitore':
      return umano({ anca: 58, busto: 2, larg: 24, testa: 10, arma: `${asta(8, -70, 12, -148, 3)}<path d="M12 -148 Q 56 -150 52 -118 Q 38 -136 12 -138Z"/>` });
    default:
      return `<path d="${poli([-12, 0], [12, 0], [8, -100], [-8, -100])}"/>`;
  }
}

/** Restituisce l'SVG inline della sagoma. La stringa è costante e sicura: non va passata a esc(). */
export function sagoma(id: string, opz: OpzioniSagoma = {}): string {
  const px = opz.px ?? 130;
  const larg = Math.round((px * 180) / 156);
  const a11y = opz.parlante ? `role="img" aria-label="${ETICHETTE[id] ?? id}"` : 'aria-hidden="true"';
  const classe = opz.classe ? `sagoma ${opz.classe}` : 'sagoma';
  return `<svg class="${classe}" viewBox="-90 -150 180 156" width="${larg}" height="${px}" fill="currentColor" focusable="false" ${a11y}>${corpo(id)}</svg>`;
}
