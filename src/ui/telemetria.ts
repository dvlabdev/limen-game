// Telemetria con destinazione automatica (ARENA_S23_SPEC §5).
// Dentro una pagina Claude con la capacità `db` i duelli vanno nel database (collezione `telemetria`);
// altrove (GitHub Pages, file locale) restano nella memoria del browser. Il gioco non aspetta mai il database:
// si parte subito in locale e si passa a `claude-db` quando la promessa si risolve.
import type { Categoria, OpzioniArena, PosturaId, Gradi, Esito } from '../core/types.ts';

export const CHIAVE_TELEMETRIA = 'limen.arena.telemetria';
const CHIAVE_COPIATI = 'limen.arena.telemetria.copiati';
export const COLLEZIONE = 'telemetria';
export const MAX_TURNI_DETTAGLIO = 25;

export interface TurnoDettaglio {
  turno: number;
  postura: PosturaId; // la postura scelta
  hint: Categoria; // la categoria che il giocatore vedeva
}

export interface RecordDuello {
  id: string; // seed + timestamp ISO
  nemico: string;
  seed: number;
  opzioni: OpzioniArena;
  gradi: Gradi;
  esito: Esito;
  turni: number;
  usoPosture: Record<PosturaId, number>;
  cambi: number;
  danniInflitti: number;
  danniSubiti: number;
  data: string; // ISO
  layout: 'scena' | 'griglia';
  versione: string; // hash breve del commit e data della build
  destinazione: 'claude-db' | 'locale';
  turniDettaglio: TurnoDettaglio[]; // al massimo 25 voci
}

export interface DestinazioneTelemetria {
  nome: 'claude-db' | 'locale';
  salva(record: RecordDuello): Promise<void>;
  elenca(): Promise<RecordDuello[]>;
  azzera(): Promise<void>; // solo 'locale'; su claude-db il pulsante non c'è
}

// --- Interfacce minime degli ambienti (per poterli sostituire nei test) --------

export interface ArchivioLike {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}

// Il sottoinsieme della capacità `db` che serve qui.
export interface DbLike {
  collection(path: string): {
    doc(id?: string): { set(data: Record<string, unknown>): Promise<void> };
    orderBy(campo: string, dir?: 'asc' | 'desc'): { get(): Promise<{ docs: Array<{ data(): Record<string, unknown> | undefined }> }> };
  };
}

export interface ClaudeLike {
  use?: (nome: string) => Promise<unknown> | unknown;
}

// --- Destinazione locale ---------------------------------------------------------

function archivioDelBrowser(): ArchivioLike | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

function leggiArray(archivio: ArchivioLike | undefined, chiave: string): unknown[] | null {
  try {
    const t = archivio?.getItem(chiave);
    if (!t) return [];
    const r: unknown = JSON.parse(t);
    return Array.isArray(r) ? r : [];
  } catch {
    return null; // archivio non disponibile o illeggibile
  }
}

export function destinazioneLocale(archivio: ArchivioLike | undefined = archivioDelBrowser()): DestinazioneTelemetria {
  // Se l'archivio non funziona i record restano in memoria: "Copia JSON" funziona comunque.
  let memoria: RecordDuello[] = [];
  const tutti = (): RecordDuello[] => {
    const r = leggiArray(archivio, CHIAVE_TELEMETRIA);
    return r === null ? memoria : (r as RecordDuello[]);
  };
  return {
    nome: 'locale',
    async salva(record) {
      const lista = tutti();
      lista.push(record);
      memoria = lista;
      try {
        archivio?.setItem(CHIAVE_TELEMETRIA, JSON.stringify(lista));
      } catch {
        // archiviazione piena o negata: resta la copia in memoria
      }
    },
    async elenca() {
      return tutti().slice();
    },
    async azzera() {
      memoria = [];
      try {
        archivio?.setItem(CHIAVE_TELEMETRIA, '[]');
      } catch {
        // niente da fare
      }
    },
  };
}

// --- Destinazione database di Claude ---------------------------------------------

// Un documento per duello, con l'id del record: ricopiare lo stesso record non crea doppioni.
export function destinazioneDb(db: DbLike): DestinazioneTelemetria {
  return {
    nome: 'claude-db',
    async salva(record) {
      await db.collection(COLLEZIONE).doc(record.id).set(record as unknown as Record<string, unknown>);
    },
    async elenca() {
      const snap = await db.collection(COLLEZIONE).orderBy('data', 'asc').get();
      return snap.docs.map((d) => d.data() as unknown as RecordDuello);
    },
    async azzera() {
      // Nel database non si azzera da qui: il pulsante non compare.
    },
  };
}

// --- Gestore: parte in locale, passa al database quando c'è ----------------------

const CODICI_DI_RIPIEGO = new Set(['quota_exceeded', 'not_granted', 'revoked']);

export interface Telemetria {
  /** Destinazione attiva in questo momento. */
  nome(): 'claude-db' | 'locale';
  /** Avviso discreto per il menu (per esempio dopo un ripiego), se c'è. */
  avviso(): string | undefined;
  salva(record: Omit<RecordDuello, 'destinazione'>): Promise<RecordDuello>;
  elenca(): Promise<RecordDuello[]>;
  azzera(): Promise<void>;
  /** Si risolve quando la scelta della destinazione è definitiva (utile ai test). */
  pronta: Promise<void>;
}

export function creaTelemetria(
  opz: { claude?: ClaudeLike | undefined; archivio?: ArchivioLike | undefined; sulCambio?: () => void } = {},
): Telemetria {
  const archivio = 'archivio' in opz ? opz.archivio : archivioDelBrowser();
  const locale = destinazioneLocale(archivio);
  let attiva: DestinazioneTelemetria = locale;
  let nota: string | undefined;

  const codice = (e: unknown): string => (e && typeof e === 'object' && 'code' in e ? String((e as { code: unknown }).code) : '');

  const ripiega = (e: unknown): void => {
    attiva = locale;
    nota = `Database non disponibile (${codice(e) || 'errore'}): i duelli restano su questo dispositivo.`;
    opz.sulCambio?.();
  };

  // I record già salvati in locale si copiano una volta nel database; si ricordano gli id copiati.
  const copiaLocaliNelDb = async (dest: DestinazioneTelemetria): Promise<void> => {
    const giaCopiati = new Set((leggiArray(archivio, CHIAVE_COPIATI) ?? []).map(String));
    const daCopiare = (await locale.elenca()).filter((r) => r && typeof r.id === 'string' && !giaCopiati.has(r.id));
    for (const r of daCopiare) {
      await dest.salva({ ...r, destinazione: 'claude-db' });
      giaCopiati.add(r.id);
    }
    if (daCopiare.length) {
      try {
        archivio?.setItem(CHIAVE_COPIATI, JSON.stringify([...giaCopiati]));
      } catch {
        // al prossimo avvio si ricopia: l'id del documento evita i doppioni
      }
    }
  };

  const pronta = (async (): Promise<void> => {
    const c = opz.claude ?? (globalThis as { claude?: ClaudeLike }).claude;
    if (!c || typeof c.use !== 'function') return; // GitHub Pages, file locale
    try {
      const db = (await c.use('db')) as DbLike | null | undefined;
      if (!db) return; // non concesso o non servito: si resta in locale
      const dest = destinazioneDb(db);
      await copiaLocaliNelDb(dest);
      attiva = dest;
      opz.sulCambio?.();
    } catch (e) {
      if (CODICI_DI_RIPIEGO.has(codice(e))) ripiega(e);
    }
  })();

  return {
    nome: () => attiva.nome,
    avviso: () => nota,
    pronta,
    async salva(parziale) {
      const record = { ...parziale, destinazione: attiva.nome } as RecordDuello;
      if (attiva.nome === 'claude-db') {
        try {
          await attiva.salva(record);
          return record;
        } catch (e) {
          // Errori di quota, permesso o revoca: da qui in poi si resta in locale. Altri errori: solo questo record.
          if (CODICI_DI_RIPIEGO.has(codice(e))) ripiega(e);
          const inLocale = { ...record, destinazione: 'locale' as const };
          await locale.salva(inLocale);
          return inLocale;
        }
      }
      await locale.salva(record);
      return record;
    },
    elenca: () => attiva.elenca().catch(() => locale.elenca()),
    azzera: () => (attiva.nome === 'locale' ? attiva.azzera() : Promise.resolve()),
  };
}
