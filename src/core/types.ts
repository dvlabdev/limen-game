// Tipi di dominio dell'arena. Nessuna logica qui: solo forme dei dati (tutte serializzabili in JSON).

export type Archetipo = 'assalto' | 'guardia' | 'attesa' | 'distanza' | 'preparazione';
export type PosturaId = 'assalto' | 'guardia' | 'attesa' | 'distanza'; // il giocatore non ha 'preparazione'
export type Forza = 'leggero' | 'pesante';
export type Portata = 'corta' | 'lunga';
export type Velocita = 'rapido' | 'normale' | 'lento';
export type Categoria = 'pesante' | 'leggero' | 'difesa' | 'preparazione'; // ciò che l'hint mostra
export type Chi = 'giocatore' | 'nemico';
export type Esito = 'in corso' | 'vittoria' | 'sconfitta' | 'pareggio';

export interface Attacco {
  forza: Forza;
  portata: Portata;
  velocita: Velocita;
  danno: [number, number];
  sfondaGuardia?: boolean; // ignora la Parata
  inarrestabile?: boolean; // non può essere interrotto
}

export interface Mossa {
  id: string;
  nome: string;
  archetipo: Archetipo;
  attacco?: Attacco;
}

export interface Gradi {
  parata: 1 | 2 | 3;
  schivata: 1 | 2 | 3;
  distanza: 1 | 2 | 3; // 2 = Punta, 3 = Arresto (revisione 1.1, R4)
}

export interface Combattente {
  nome: string;
  vigore: number;
  vigoreMax: number;
  fiato: number;
  fiatoMax: number;
  velocita: number;
  postura: Archetipo;
  vantaggio: boolean;
  preparato: boolean; // il prossimo colpo a danno vale ×1,5
  distanzaConsecutive: number; // turni consecutivi conclusi in Distanza (R2)
  gradi: Gradi;
}

export interface OpzioniArena {
  hintCompleti: boolean; // A/B: l'hint mostra la mossa esatta e i suoi tratti
  anteprimaDanni: boolean; // A/B: mostra gli intervalli attesi per ogni postura
  adattamento: boolean; // A/B: il nemico si adatta alla ripetizione
}

export interface StatoNemico extends Combattente {
  profiloId: string;
  fase: 1 | 2;
  sequenzaIdx: number; // posizione nel ciclo dei profili a sequenza
}

export interface StatoDuello {
  turno: number;
  esito: Esito;
  giocatore: Combattente;
  nemico: StatoNemico;
  mossaNemico: string; // già scelta: l'hint deriva da qui
  storicoPosture: PosturaId[]; // scelte del giocatore, per l'adattamento
  rng: number; // stato di mulberry32
  seed: number;
  opzioni: OpzioniArena;
}

// --- Profili dei nemici -----------------------------------------------------

export type Condizione =
  | { tipo: 'vigoreSotto'; frazione: number }
  | { tipo: 'fiatoSotto'; n: number }
  | { tipo: 'avversarioFiatoSotto'; n: number }
  | { tipo: 'avversarioVantaggio' }
  | { tipo: 'avversarioPostura'; postura: PosturaId };

export interface PesoMossa {
  mossa: string; // id della mossa
  peso: number;
  modificatori?: Array<{ quando: Condizione; x: number }>;
}

export interface FaseProfilo {
  mosse: PesoMossa[];
  sequenza?: string[]; // ciclo di id (solo per la Recluta)
  adattamento: number; // 1 = nessun adattamento
}

export interface Profilo {
  id: string;
  nome: string;
  articolo?: 'il' | 'la'; // per le frasi del registro (default: il)
  vigore: number;
  fiato: number;
  velocita: number;
  gradi: Gradi;
  mosse: Mossa[]; // tutte le mosse, di tutte le fasi
  fase1: FaseProfilo;
  fase2?: FaseProfilo;
}

// --- Eventi -----------------------------------------------------------------

export type MotivoReazioneNegata = 'senzaFiato' | 'sfondaGuardia' | 'rapido' | 'fiatoInsufficiente';

// Una voce del bilancio del fiato: negativa se costa, positiva se recupera.
export interface VoceFiato {
  tipo: 'cambio' | 'schivata' | 'parata' | 'punta' | 'arresto' | 'recupero';
  valore: number;
}

export type EventoDuello =
  | { tipo: 'cambio'; chi: Chi; a: Archetipo; costo: number }
  | {
      tipo: 'colpo';
      chi: Chi; // chi colpisce
      mossa: string;
      danno: number;
      simultaneo: boolean;
      preparato: boolean;
      vantaggioMassimo: boolean;
      lungaControDistanza: boolean;
      senzaFiato: boolean; // il bersaglio ha il fiato a 0: danno ×1,25
      reazioneNegata?: MotivoReazioneNegata;
    }
  | { tipo: 'parata'; chi: Chi; mossa: string; danno: number; annullato: boolean } // chi = chi para
  | { tipo: 'schivata'; chi: Chi; mossa: string } // chi = chi schiva
  | { tipo: 'evitato'; chi: Chi; mossa: string } // chi = chi evita (Distanza)
  | { tipo: 'contrattacco'; chi: Chi; danno: number } // chi = chi contrattacca
  | { tipo: 'interrotto'; chi: Chi } // chi = chi viene interrotto
  | { tipo: 'rotta'; chi: Chi } // preparazione rotta
  | { tipo: 'preparato'; chi: Chi }
  | { tipo: 'vantaggio'; chi: Chi } // guadagnato: effettivo dal turno successivo
  | { tipo: 'vantaggioPerso'; chi: Chi }
  | { tipo: 'incalza'; chi: Chi } // chi = l'attaccante che prende l'iniziativa (R1)
  | { tipo: 'punta'; chi: Chi; danno: number } // chi = chi arretra e risponde (R4)
  | { tipo: 'arresto'; chi: Chi; danno: number }
  | { tipo: 'spalleAlMuro'; chi: Chi } // la Distanza non è più disponibile (R2)
  | { tipo: 'fiato'; chi: Chi; da: number; a: number; voci: VoceFiato[] } // bilancio del fiato del turno (§13.2)
  | { tipo: 'fase2' }
  | { tipo: 'fine'; esito: Esito };

export type EventoConTurno = EventoDuello & { turno: number };

export type Dado = (min: number, max: number) => number;
