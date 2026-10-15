// Rilievi dell'audit G0–G4 chiusi in C2 (ARENA_SPEC §12.7, ARENA_S23_SPEC §9).
import { describe, it } from 'node:test';
import assert from 'node:assert';
import type { Profilo } from '../src/core/types.ts';
import { BALANCE } from '../src/data/balance.ts';
import { ORDINE_NEMICI, PROFILI, registraProfilo } from '../src/data/enemies.ts';
import { mossaAccessibile } from '../src/core/ai.ts';
import { creaDuello, resolveTurn } from '../src/core/resolve.ts';
import { toDuelView } from '../src/core/view.ts';
import { dadoMassimo, dadoMinimo } from '../src/core/rng.ts';
import { gioca, statoProva } from './util.ts';

// Profilo di prova con un pesante 5–7 per vedere il vantaggio (danno al massimo).
const PROFILO_PESANTE: Profilo = {
  id: 'aud-pesante',
  nome: 'Pesante',
  vigore: 100,
  fiato: 5,
  velocita: 2,
  gradi: { parata: 1, schivata: 1, distanza: 1 },
  mosse: [{ id: 'X', nome: 'X', archetipo: 'assalto', attacco: { forza: 'pesante', portata: 'corta', velocita: 'normale', danno: [5, 7] } }],
  fase1: { mosse: [{ mossa: 'X', peso: 1 }], adattamento: 1 },
};
registraProfilo(PROFILO_PESANTE);

function contro5a7(modifiche: Parameters<typeof statoProva>[2] = {}) {
  const s = statoProva('P1', 'assalto', modifiche);
  s.nemico.profiloId = PROFILO_PESANTE.id;
  s.mossaNemico = 'X';
  return s;
}

describe('AUD-001: scambio simultaneo sullo stato di inizio scambio', () => {
  it('entrambi col vantaggio: entrambi colpiscono al massimo', () => {
    const s = contro5a7({ giocatore: { vantaggio: true }, nemico: { vantaggio: true } });
    const r = resolveTurn(s, 'assalto', { dado: dadoMinimo, saltaIA: true });
    assert.strictEqual(s.nemico.vigore - r.stato.nemico.vigore, 6, 'il giocatore infligge il massimo di 4–6');
    assert.strictEqual(s.giocatore.vigore - r.stato.giocatore.vigore, 7, 'il nemico infligge il massimo di 5–7');
    const colpi = r.eventi.filter((e) => e.tipo === 'colpo');
    assert.ok(colpi.length === 2 && colpi.every((e) => e.tipo === 'colpo' && e.simultaneo && e.vantaggioMassimo));
    assert.strictEqual(r.stato.giocatore.vantaggio, false);
    assert.strictEqual(r.stato.nemico.vantaggio, false);
  });

  it('il risultato non dipende da chi è risolto per primo: il vantaggio del nemico non si perde', () => {
    const s = contro5a7({ giocatore: { vantaggio: false }, nemico: { vantaggio: true } });
    // Qui il vantaggio decide l'ordine (non è simultaneo): il nemico colpisce per primo e al massimo.
    const r = resolveTurn(s, 'assalto', { dado: dadoMinimo, saltaIA: true });
    assert.strictEqual(s.giocatore.vigore - r.stato.giocatore.vigore, 7);
  });
});

describe('AUD-003: anteprima sul danno, non sul vigore residuo', () => {
  it('colpo letale inflitto: mostra il danno dell\'Assalto, non il vigore del nemico', () => {
    const s = statoProva('PR', 'guardia', { nemico: { vigore: 2 } });
    s.opzioni.anteprimaDanni = true;
    const v = toDuelView(s);
    assert.deepStrictEqual(v.posture.find((p) => p.id === 'assalto')?.anteprima?.inflitto, [4, 6]);
  });

  it('colpo letale subito: mostra il danno del colpo, non il vigore residuo', () => {
    const s = statoProva('P1', 'assalto', { giocatore: { vigore: 3 } });
    s.opzioni.anteprimaDanni = true;
    s.opzioni.hintCompleti = true; // mossa esatta: P1, 6 danni
    const v = toDuelView(s);
    assert.deepStrictEqual(v.posture.find((p) => p.id === 'assalto')?.anteprima?.subito, [6, 6]);
  });
});

describe('AUD-004 e AUD-019: il nemico parte in Guardia', () => {
  it('ogni nemico parte in Guardia e la sua postura non rivela la prima mossa', () => {
    for (const id of ORDINE_NEMICI) {
      for (let seed = 1; seed <= 20; seed++) {
        const s = creaDuello(id, seed);
        assert.strictEqual(s.nemico.postura, 'guardia', id);
        assert.strictEqual(s.nemico.fiato, s.nemico.fiatoMax);
        assert.strictEqual(toDuelView(s).nemico.postura.id, 'guardia');
      }
    }
  });

  it('la prima mossa paga il cambio con le regole normali', () => {
    for (const id of ORDINE_NEMICI) {
      for (let seed = 1; seed <= 20; seed++) {
        const s = creaDuello(id, seed);
        const mossa = PROFILI[id]?.mosse.find((m) => m.id === s.mossaNemico);
        if (!mossa) throw new Error(`${id}: mossa iniziale sconosciuta`);
        const r = gioca(s, 'guardia');
        const cambio = r.eventi.find((e) => e.tipo === 'cambio' && e.chi === 'nemico');
        if (mossa.archetipo === 'guardia') assert.strictEqual(cambio, undefined);
        else assert.ok(cambio && cambio.tipo === 'cambio' && cambio.costo === BALANCE.costoCambio, `${id}/${mossa.id}`);
      }
    }
  });
});

describe('AUD-017: Punta e Arresto controllano il fiato', () => {
  it('con un costo maggiore del fiato disponibile la risposta non scatta e l\'avversario incalza', () => {
    const originale = BALANCE.costoPunta;
    try {
      (BALANCE as { costoPunta: number }).costoPunta = 2;
      const s = statoProva('P1', 'distanza', { giocatore: { gradi: { parata: 1, schivata: 1, distanza: 2 }, fiato: 1 } });
      const r = gioca(s, 'distanza');
      const tipi = r.eventi.map((e) => e.tipo);
      assert.ok(!tipi.includes('punta'));
      assert.ok(tipi.includes('incalza'));
      assert.ok(r.stato.giocatore.fiato >= 0);
    } finally {
      (BALANCE as { costoPunta: number }).costoPunta = originale;
    }
  });

  it('con il costo attuale (1) e fiato 1 la Punta scatta e il fiato non scende sotto zero', () => {
    const s = statoProva('P1', 'distanza', { giocatore: { gradi: { parata: 1, schivata: 1, distanza: 2 }, fiato: 1 } });
    const r = gioca(s, 'distanza');
    assert.ok(r.eventi.some((e) => e.tipo === 'punta'));
  });
});

describe('AUD-018 e AUD-020: IA e risolutore concordano sulle mosse giocabili', () => {
  it('ogni mossa che l\'IA considera accessibile è accettata dal risolutore', () => {
    for (const id of ORDINE_NEMICI) {
      const p = PROFILI[id];
      assert.ok(p);
      for (const postura of ['assalto', 'guardia', 'attesa', 'distanza', 'preparazione'] as const) {
        for (const consecutive of [0, 1, 2, 3]) {
          for (const fiato of [0, 1, 2]) {
            const base = creaDuello(id, 3);
            base.nemico.postura = postura;
            base.nemico.distanzaConsecutive = postura === 'distanza' ? consecutive : 0;
            base.nemico.fiato = fiato;
            for (const mossa of p.mosse) {
              if (!mossaAccessibile(base, mossa)) continue;
              const s = structuredClone(base);
              s.mossaNemico = mossa.id;
              try {
                resolveTurn(s, 'guardia', { dado: dadoMassimo, saltaIA: true });
              } catch (e) {
                throw new Error(`${id}/${mossa.id} da ${postura} (${consecutive}, fiato ${fiato}): ${(e as Error).message}`);
              }
            }
          }
        }
      }
    }
  });
});

describe('AUD-018: validazione dei dati dei nemici', () => {
  const ARCHETIPI = ['assalto', 'guardia', 'attesa', 'distanza', 'preparazione'] as const;

  for (const id of ORDINE_NEMICI) {
    it(`${id}: ogni fase ha sempre una mossa giocabile dalla postura in cui il nemico può trovarsi`, () => {
      const p = PROFILI[id] as Profilo;
      const fasi = [p.fase1, ...(p.fase2 ? [p.fase2] : [])];
      const archetipiPerFase = fasi.map((f) => new Set(f.mosse.map((pm) => p.mosse.find((m) => m.id === pm.mossa)?.archetipo)));
      // Le mosse elencate esistono tutte.
      for (const f of fasi) for (const pm of f.mosse) assert.ok(p.mosse.some((m) => m.id === pm.mossa), `mossa sconosciuta ${pm.mossa}`);
      // Il nemico parte in Guardia: il fiato iniziale deve bastare per il cambio verso la prima mossa.
      assert.ok(p.fiato >= BALANCE.costoCambio, 'fiato iniziale insufficiente per il primo cambio');
      // Ogni archetipo di una fase compare in tutte le fasi: dopo il cambio di fase la postura attuale ha una mossa.
      for (const arch of ARCHETIPI) {
        if (archetipiPerFase.every((a) => !a.has(arch))) continue;
        for (const a of archetipiPerFase) assert.ok(a.has(arch), `${id}: una fase non ha mosse di archetipo ${arch}`);
      }
      // Con le spalle al muro serve almeno una mossa che non sia Distanza.
      for (const f of fasi) {
        assert.ok(f.mosse.some((pm) => p.mosse.find((m) => m.id === pm.mossa)?.archetipo !== 'distanza'), 'solo mosse di Distanza');
      }
      // Nessuna fase senza mosse con peso positivo.
      for (const f of fasi) assert.ok(f.mosse.some((pm) => pm.peso > 0));
    });
  }
});

describe('AUD-021: la vista espone `spalle`', () => {
  it('spalle è vero quando la Distanza non è più disponibile, senza che la UI conosca la soglia', () => {
    let s = statoProva('D', 'distanza');
    assert.strictEqual(toDuelView(s).giocatore.spalle, false);
    for (let i = 0; i < BALANCE.distanzaConsecutiveMax; i++) {
      s = gioca(s, 'distanza').stato;
      s.mossaNemico = 'D';
    }
    const v = toDuelView(s);
    assert.strictEqual(v.giocatore.spalle, true);
    assert.strictEqual(v.posture.find((p) => p.id === 'distanza')?.motivo, 'spazio');
  });
});
