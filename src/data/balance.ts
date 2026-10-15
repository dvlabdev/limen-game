// Tutti i numeri delle regole dell'arena. I valori sono quelli iniziali di ARENA_SPEC §4.
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

  // Ordinamento per velocità della mossa: più alto = prima.
  velocitaMossa: { rapido: 3, normale: 2, lento: 1 } as Record<Velocita, number>,

  // Il boss passa alla fase 2 quando il vigore scende a questa frazione del massimo (inclusa).
  sogliaFase2: 0.5,

  // Adattamento: quante scelte uguali consecutive servono, e quali mosse "battono" la postura.
  adattamentoScelte: 2,
  battute: {
    assalto: { archetipi: ['guardia', 'attesa'] },
    guardia: { sfondaGuardia: true, archetipi: ['preparazione'] },
    attesa: { velocita: 'rapido' },
    distanza: { portata: 'lunga' },
  } as Record<PosturaId, Battuta>,
};
