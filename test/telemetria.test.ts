// Telemetria con destinazione automatica (ARENA_S23_SPEC §5 e §7.1).
import { describe, it } from 'node:test';
import assert from 'node:assert';
import type { ArchivioLike, DbLike, RecordDuello } from '../src/ui/telemetria.ts';
import { CHIAVE_TELEMETRIA, COLLEZIONE, creaTelemetria } from '../src/ui/telemetria.ts';

function archivio(): ArchivioLike & { dati: Map<string, string> } {
  const dati = new Map<string, string>();
  return { dati, getItem: (k) => dati.get(k) ?? null, setItem: (k, v) => void dati.set(k, v) };
}

// Database finto: una collezione in memoria, con gli errori configurabili.
function dbFinto(errore?: { code: string }): DbLike & { docs: Map<string, Record<string, unknown>> } {
  const docs = new Map<string, Record<string, unknown>>();
  return {
    docs,
    collection(path: string) {
      assert.strictEqual(path, COLLEZIONE);
      return {
        doc: (id?: string) => ({
          async set(data: Record<string, unknown>) {
            if (errore) throw errore;
            docs.set(id ?? `auto${docs.size}`, data);
          },
        }),
        orderBy: () => ({ get: async () => ({ docs: [...docs.values()].map((d) => ({ data: () => d })) }) }),
      };
    },
  };
}

let n = 0;
function record(extra: Partial<RecordDuello> = {}): Omit<RecordDuello, 'destinazione'> {
  n++;
  return {
    id: `${n}_2026-10-15T10:00:0${n % 10}.000Z`,
    nemico: 'bruto',
    seed: n,
    opzioni: { hintCompleti: false, anteprimaDanni: false, adattamento: true },
    gradi: { parata: 1, schivata: 1, distanza: 1 },
    esito: 'vittoria',
    turni: 7,
    usoPosture: { assalto: 3, guardia: 2, attesa: 1, distanza: 1 },
    cambi: 4,
    danniInflitti: 22,
    danniSubiti: 9,
    data: `2026-10-15T10:00:0${n % 10}.000Z`,
    layout: 'scena',
    versione: 'abc1234 · 2026-10-15',
    turniDettaglio: [{ turno: 1, postura: 'guardia', hint: 'pesante' }],
    ...extra,
  };
}

describe('telemetria: scelta della destinazione', () => {
  it('senza `claude` (GitHub Pages, file locale) resta in locale', async () => {
    const a = archivio();
    const t = creaTelemetria({ claude: undefined, archivio: a });
    await t.pronta;
    assert.strictEqual(t.nome(), 'locale');
    const r = await t.salva(record());
    assert.strictEqual(r.destinazione, 'locale');
    assert.strictEqual((await t.elenca()).length, 1);
    assert.strictEqual(JSON.parse(a.dati.get(CHIAVE_TELEMETRIA) as string).length, 1);
  });

  it('claude esiste ma `use` manca: locale', async () => {
    const t = creaTelemetria({ claude: {}, archivio: archivio() });
    await t.pronta;
    assert.strictEqual(t.nome(), 'locale');
  });

  it('`use("db")` restituisce null (non concesso): locale', async () => {
    let chiesto = '';
    const t = creaTelemetria({ claude: { use: async (nome) => ((chiesto = nome), null) }, archivio: archivio() });
    await t.pronta;
    assert.strictEqual(chiesto, 'db');
    assert.strictEqual(t.nome(), 'locale');
  });

  it('`use("db")` restituisce un namespace: claude-db, e i record vanno nella collezione `telemetria`', async () => {
    const db = dbFinto();
    const t = creaTelemetria({ claude: { use: async () => db }, archivio: archivio() });
    await t.pronta;
    assert.strictEqual(t.nome(), 'claude-db');
    const r = await t.salva(record());
    assert.strictEqual(r.destinazione, 'claude-db');
    assert.strictEqual(db.docs.size, 1);
    assert.strictEqual((await t.elenca()).length, 1);
  });

  it('`use` che si rifiuta non blocca il gioco: si resta in locale', async () => {
    const t = creaTelemetria({ claude: { use: async () => { throw new Error('boh'); } }, archivio: archivio() });
    await t.pronta;
    assert.strictEqual(t.nome(), 'locale');
    await t.salva(record());
    assert.strictEqual((await t.elenca()).length, 1);
  });

  it('non si blocca in attesa del database: si parte in locale e si passa a claude-db dopo', async () => {
    const db = dbFinto();
    let sblocca: (v: unknown) => void = () => undefined;
    const lento = new Promise((r) => (sblocca = r));
    const t = creaTelemetria({ claude: { use: () => lento }, archivio: archivio() });
    assert.strictEqual(t.nome(), 'locale');
    const r = await t.salva(record()); // salvato mentre il database non è ancora pronto
    assert.strictEqual(r.destinazione, 'locale');
    sblocca(db);
    await t.pronta;
    assert.strictEqual(t.nome(), 'claude-db');
  });
});

describe('telemetria: copia dei record nel database', () => {
  it('i record salvati in locale nel frattempo si copiano una volta nel database', async () => {
    const a = archivio();
    const db = dbFinto();
    let sblocca: (v: unknown) => void = () => undefined;
    const t = creaTelemetria({ claude: { use: () => new Promise((r) => (sblocca = r)) }, archivio: a });
    await t.salva(record());
    await t.salva(record());
    sblocca(db);
    await t.pronta;
    assert.strictEqual(db.docs.size, 2);
    assert.ok([...db.docs.values()].every((d) => d['destinazione'] === 'claude-db'));
    // Un secondo avvio sulla stessa memoria non ricopia nulla e non crea doppioni.
    const t2 = creaTelemetria({ claude: { use: async () => db }, archivio: a });
    await t2.pronta;
    assert.strictEqual(db.docs.size, 2);
  });

  it('la copia è idempotente anche se la memoria dei già copiati si perde (stesso id, un solo documento)', async () => {
    const a = archivio();
    const db = dbFinto();
    const loc = creaTelemetria({ claude: undefined, archivio: a });
    await loc.salva(record());
    const t = creaTelemetria({ claude: { use: async () => db }, archivio: a });
    await t.pronta;
    a.dati.delete('limen.arena.telemetria.copiati');
    const t2 = creaTelemetria({ claude: { use: async () => db }, archivio: a });
    await t2.pronta;
    assert.strictEqual(db.docs.size, 1);
  });
});

describe('telemetria: ripiego e archivio non disponibile', () => {
  for (const code of ['quota_exceeded', 'not_granted', 'revoked']) {
    it(`l'errore ${code} fa ripiegare su locale, con un avviso`, async () => {
      const a = archivio();
      const db = dbFinto();
      const t = creaTelemetria({ claude: { use: async () => db }, archivio: a });
      await t.pronta;
      assert.strictEqual(t.nome(), 'claude-db');
      const fallito = dbFinto({ code });
      const t2 = creaTelemetria({ claude: { use: async () => fallito }, archivio: a });
      await t2.pronta; // la copia dei locali non c'è: nessun errore
      const r = await t2.salva(record());
      assert.strictEqual(r.destinazione, 'locale');
      assert.strictEqual(t2.nome(), 'locale');
      assert.ok(t2.avviso()?.includes(code));
      assert.strictEqual((await t2.elenca()).length, 1);
    });
  }

  it('un errore di quota durante la copia iniziale ripiega su locale senza perdere record', async () => {
    const a = archivio();
    await creaTelemetria({ claude: undefined, archivio: a }).salva(record());
    const t = creaTelemetria({ claude: { use: async () => dbFinto({ code: 'quota_exceeded' }) }, archivio: a });
    await t.pronta;
    assert.strictEqual(t.nome(), 'locale');
    assert.strictEqual((await t.elenca()).length, 1);
  });

  it('un errore transitorio salva solo quel record in locale e resta su claude-db', async () => {
    const db = dbFinto({ code: 'unavailable' });
    const t = creaTelemetria({ claude: { use: async () => db }, archivio: archivio() });
    await t.pronta;
    const r = await t.salva(record());
    assert.strictEqual(r.destinazione, 'locale');
    assert.strictEqual(t.nome(), 'claude-db');
  });

  it('con localStorage che lancia eccezioni i record restano in memoria e il gioco non si ferma', async () => {
    const rotto: ArchivioLike = {
      getItem: () => { throw new Error('negato'); },
      setItem: () => { throw new Error('negato'); },
    };
    const t = creaTelemetria({ claude: undefined, archivio: rotto });
    await t.salva(record());
    await t.salva(record());
    assert.strictEqual((await t.elenca()).length, 2);
    await t.azzera();
    assert.strictEqual((await t.elenca()).length, 0);
  });

  it('azzera vale solo per locale: su claude-db non cancella nulla', async () => {
    const db = dbFinto();
    const t = creaTelemetria({ claude: { use: async () => db }, archivio: archivio() });
    await t.pronta;
    await t.salva(record());
    await t.azzera();
    assert.strictEqual(db.docs.size, 1);
  });
});
