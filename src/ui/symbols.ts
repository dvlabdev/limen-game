// Id simbolo → segnaposto { glifo, etichetta } (ARENA_SPEC §7). Proprietà di Grafica dopo la consegna dell'arena.
export interface Simbolo {
  glifo: string;
  etichetta: string;
}

export const SIMBOLI: Record<string, Simbolo> = {
  // Posture
  'posture.assalto': { glifo: '⚔', etichetta: 'Assalto' },
  'posture.guardia': { glifo: '⛨', etichetta: 'Guardia' },
  'posture.attesa': { glifo: '◔', etichetta: 'Attesa' },
  'posture.distanza': { glifo: '⤢', etichetta: 'Distanza' },
  'posture.preparazione': { glifo: '✧', etichetta: 'Preparazione' },
  // Intenzioni (hint)
  'intent.pesante': { glifo: '✸', etichetta: 'Colpo pesante' },
  'intent.leggero': { glifo: '✦', etichetta: 'Colpo leggero' },
  'intent.difesa': { glifo: '⛨', etichetta: 'Difesa' },
  'intent.preparazione': { glifo: '✧', etichetta: 'Preparazione' },
  // Stati
  'stato.vantaggio': { glifo: '★', etichetta: 'Vantaggio' },
  'stato.preparato': { glifo: '✧', etichetta: 'Raccolto' },
  'stato.fase2': { glifo: '☠', etichetta: 'Seconda fase' },
  'stato.spalle': { glifo: '▕', etichetta: 'Spalle al muro' },
  // Risorse
  'risorsa.vigore': { glifo: '♥', etichetta: 'Vigore' },
  'risorsa.fiato': { glifo: '●', etichetta: 'Fiato' },
  // Eventi
  'evento.colpo': { glifo: '✖', etichetta: 'Colpo' },
  'evento.parata': { glifo: '▣', etichetta: 'Parata' },
  'evento.schivata': { glifo: '↷', etichetta: 'Schivata' },
  'evento.contrattacco': { glifo: '↩', etichetta: 'Contrattacco' },
  'evento.evitato': { glifo: '⇢', etichetta: 'Evitato' },
  'evento.interrotto': { glifo: '✂', etichetta: 'Interrotto' },
  'evento.rotta': { glifo: '✗', etichetta: 'Rotta' },
  'evento.incalza': { glifo: '➤', etichetta: 'Incalza' },
  'evento.punta': { glifo: '✱', etichetta: 'Punta' },
  'evento.arresto': { glifo: '⊣', etichetta: 'Arresto' },
};

export function simbolo(id: string | undefined): Simbolo {
  return (id && SIMBOLI[id]) || { glifo: '?', etichetta: id ?? '' };
}
