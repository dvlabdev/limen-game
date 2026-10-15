// La matrice di riferimento di ARENA_SPEC §4.6: gradi 1, fiato sufficiente, nessun vantaggio.
import { describe, it } from 'node:test';
import assert from 'node:assert';
import type { PosturaId } from '../src/core/types.ts';
import { gioca, inflitto, statoProva, subito } from './util.ts';

interface Attesa {
  subisce: number;
  infligge: number;
  note?: (r: ReturnType<typeof gioca>) => void;
}

const nemicoPreparato = (r: ReturnType<typeof gioca>) => assert.strictEqual(r.stato.nemico.preparato, true);

const MATRICE: Record<PosturaId, Record<string, Attesa>> = {
  assalto: {
    P1: { subisce: 6, infligge: 5 },
    P2: {
      subisce: 0,
      infligge: 5,
      note: (r) => {
        assert.ok(r.eventi.some((e) => e.tipo === 'interrotto' && e.chi === 'nemico'));
        assert.strictEqual(r.stato.giocatore.vantaggio, true);
      },
    },
    L1: { subisce: 3, infligge: 5 },
    L2: { subisce: 3, infligge: 5 },
    D: { subisce: 0, infligge: 2 },
    PR: {
      subisce: 0,
      infligge: 5,
      note: (r) => {
        assert.ok(r.eventi.some((e) => e.tipo === 'rotta'));
        assert.strictEqual(r.stato.nemico.preparato, false);
        assert.strictEqual(r.stato.giocatore.vantaggio, true);
      },
    },
  },
  guardia: {
    P1: { subisce: 2, infligge: 2 },
    P2: { subisce: 2, infligge: 2 },
    L1: { subisce: 1, infligge: 2 },
    L2: { subisce: 1, infligge: 2 },
    D: { subisce: 0, infligge: 1 },
    PR: { subisce: 0, infligge: 2, note: nemicoPreparato },
  },
  attesa: {
    P1: {
      subisce: 0,
      infligge: 3,
      note: (r) => assert.ok(r.eventi.some((e) => e.tipo === 'schivata' && e.chi === 'giocatore')),
    },
    P2: { subisce: 0, infligge: 0 },
    L1: { subisce: 3, infligge: 0 },
    L2: { subisce: 0, infligge: 0 },
    D: { subisce: 0, infligge: 0 },
    PR: { subisce: 0, infligge: 0, note: nemicoPreparato },
  },
  distanza: {
    P1: { subisce: 0, infligge: 0 },
    P2: { subisce: 8, infligge: 0 },
    L1: { subisce: 0, infligge: 0 },
    L2: { subisce: 4, infligge: 0 },
    D: { subisce: 0, infligge: 0 },
    PR: { subisce: 0, infligge: 0, note: nemicoPreparato },
  },
};

describe('matrice di riferimento (§4.6)', () => {
  for (const postura of Object.keys(MATRICE) as PosturaId[]) {
    for (const [mossa, atteso] of Object.entries(MATRICE[postura])) {
      it(`${postura} contro ${mossa}: subisce ${atteso.subisce}, infligge ${atteso.infligge}`, () => {
        const prima = statoProva(mossa, postura);
        const r = gioca(prima, postura);
        assert.strictEqual(subito(prima, r.stato), atteso.subisce, 'danno subito');
        assert.strictEqual(inflitto(prima, r.stato), atteso.infligge, 'danno inflitto');
        atteso.note?.(r);
      });
    }
  }
});
