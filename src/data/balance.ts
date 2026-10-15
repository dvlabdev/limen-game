// Tutti i numeri delle regole dell'arena (ARENA_SPEC §4 e §12). Sono i valori in vigore, non quelli
// iniziali della specifica: il vigore del giocatore, per esempio, è 20 (la specifica indicava 30,
// scala accettata in ARENA_SPEC §12.1). Ogni scostamento è annotato in docs/ARENA_REPORT.md.
import type { Archetipo, Forza, Portata, PosturaId, Velocita } from '../core/types.ts';

export interface Battuta {
  archetipi?: Archetipo[];
  sfondaGuardia?: boolean;
  velocita?: Velocita;
  portata?: Portata;
  forza?: Forza;
}

export const BALANCE = {
  turnoMax: 25,

  giocatore: {
    vigore: 20,
    fiato: 4,
    fiatoMax: 6,
    velocita: 2,
    posturaIniziale: 'guardia' as Archetipo,
  },

  costoCambio: 1,
  costoParata: 1,
  costoSchivata: 2,
  costoPunta: 1,
  costoArresto: 1,

  recupero: {
    assalto: 0,
    guardia: 2,
    attesa: 1,
    distanza: 2,
    preparazione: 3,
  } as Record<Archetipo, number>,

  moltFiatoZero: 1.25,
  moltLungaControDistanza: 1.25,
  moltParataNonAnnullata: 0.4,
  moltPreparato: 1.5,

  // Contrattacco della Schivata a portata corta.
  contrattacco: [3, 4] as [number, number],
  contrattaccoBonusDalGrado2: 1,

  // Distanza di grado 2 (Punta) e 3 (Arresto): colpo senza reazioni all'attaccante.
  punta: [1, 2] as [number, number],
  arresto: [2, 3] as [number, number],

  // Spazio alle spalle: turni consecutivi in Distanza dopo i quali non è più disponibile.
  distanzaConsecutiveMax: 2,

  // Ordinamento per velocità della mossa: più alto = prima.
  velocitaMossa: { rapido: 3, normale: 2, lento: 1 } as Record<Velocita, number>,

  // Il boss passa alla fase 2 quando il vigore scende a questa frazione del massimo (inclusa).
  sogliaFase2: 0.5,

  // Adattamento: quante scelte uguali consecutive servono, e quali mosse "battono" la postura.
  adattamentoScelte: 2,
  // L'Assalto è battuto anche da `distanza` se il nemico ha almeno questo grado della Distanza (R6).
  gradoDistanzaPerBattereAssalto: 2,
  battute: {
    assalto: { archetipi: ['guardia', 'attesa'] },
    guardia: { sfondaGuardia: true, archetipi: ['preparazione'] },
    attesa: { velocita: 'rapido' },
    distanza: { portata: 'lunga' },
  } as Record<PosturaId, Battuta>,
};
