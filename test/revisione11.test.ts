// Test della revisione 1.1 (ARENA_SPEC §12.2 R1–R4 e §12.3).
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { cambioConsentito, motivoNonDisponibile, resolveTurn } from '../src/core/resolve.ts';
import { toDuelView } from '../src/core/view.ts';
import { dadoMatrice, gioca, inflitto, statoProva, subito } from './util.ts';

const conDistanza = (grado: 1 | 2 | 3) => ({ giocatore: { gradi: { parata: 1 as const, schivata: 1 as const, distanza: grado } } });
const tipi = (r: ReturnType<typeof gioca>) => r.eventi.map((e) => e.tipo);

describe('R4: gradi della Distanza', () => {
  it('grado 2 contro un colpo pesante: Punta 2, −1 fiato, nessun incalzare', () => {
    const s = statoProva('P1', 'distanza', conDistanza(2));
    const r = gioca(s, 'distanza');
    assert.strictEqual(subito(s, r.stato), 0);
    assert.strictEqual(inflitto(s, r.stato), 2);
    assert.ok(tipi(r).includes('punta'));
    assert.ok(!tipi(r).includes('incalza'));
    assert.strictEqual(r.stato.nemico.vantaggio, false);
    assert.strictEqual(r.stato.giocatore.fiato, 5); // 4 − 1 (Punta) + 2 (recupero della Distanza)
  });

  it('grado 2 contro un colpo leggero: nessuna Punta e incalzare', () => {
    const s = statoProva('L1', 'distanza', conDistanza(2));
    const r = gioca(s, 'distanza');
    assert.ok(!tipi(r).includes('punta'));
    assert.ok(tipi(r).includes('incalza'));
    assert.strictEqual(inflitto(s, r.stato), 0);
    assert.strictEqual(r.stato.giocatore.fiato, 6); // nessun fiato speso
  });

  it('grado 3 contro un colpo pesante non rapido: Arresto 3 e vantaggio al giocatore', () => {
    const s = statoProva('P1', 'distanza', conDistanza(3));
    const r = gioca(s, 'distanza');
    assert.strictEqual(inflitto(s, r.stato), 3);
    assert.ok(tipi(r).includes('arresto'));
    assert.ok(!tipi(r).includes('incalza'));
    assert.strictEqual(r.stato.giocatore.vantaggio, true);
    assert.strictEqual(r.stato.nemico.vantaggio, false);
  });

  it('grado 3 contro un colpo leggero rapido: nessun Arresto e incalzare', () => {
    const s = statoProva('L1', 'distanza', conDistanza(3));
    const r = gioca(s, 'distanza');
    assert.ok(!tipi(r).includes('arresto') && !tipi(r).includes('punta'));
    assert.ok(tipi(r).includes('incalza'));
    assert.strictEqual(inflitto(s, r.stato), 0);
  });

  it('grado 3 contro un colpo leggero lungo: nessun Arresto, ×1,25 e incalzare', () => {
    const l2 = statoProva('L2', 'distanza', conDistanza(3));
    const r = gioca(l2, 'distanza');
    assert.ok(!tipi(r).includes('arresto'));
    assert.strictEqual(subito(l2, r.stato), 4); // colpo lungo: ×1,25
    assert.ok(tipi(r).includes('incalza'));
  });

  it('i colpi lunghi non vengono evitati: nessuna Punta né Arresto, ×1,25 e incalzare', () => {
    const s = statoProva('P2', 'distanza', conDistanza(3));
    const r = gioca(s, 'distanza');
    assert.strictEqual(subito(s, r.stato), 8);
    assert.ok(tipi(r).includes('incalza'));
    assert.ok(!tipi(r).includes('arresto') && !tipi(r).includes('punta'));
  });

  it('fiato zero: nessuna Punta né Arresto', () => {
    for (const g of [2, 3] as const) {
      const s = statoProva('P1', 'distanza', { giocatore: { fiato: 0, gradi: { parata: 1, schivata: 1, distanza: g } } });
      const r = gioca(s, 'distanza');
      assert.strictEqual(subito(s, r.stato), 8); // 6 × 1,25 = 7,5 → 8: senza reazioni
      assert.ok(!tipi(r).includes('punta') && !tipi(r).includes('arresto'));
      assert.ok(tipi(r).includes('incalza'));
    }
  });
});

describe('R2: spazio alle spalle', () => {
  it('dopo due turni in Distanza non è disponibile; il cambio è gratuito e il contatore si azzera', () => {
    let s = statoProva('D', 'guardia', { giocatore: { fiato: 3 } });
    s = gioca(s, 'distanza').stato; // paga il cambio
    assert.strictEqual(s.giocatore.distanzaConsecutive, 1);
    const r2 = gioca(s, 'distanza');
    s = r2.stato;
    assert.strictEqual(s.giocatore.distanzaConsecutive, 2);
    assert.ok(tipi(r2).includes('spalleAlMuro'));
    // Terzo turno: la Distanza non è disponibile, per mancanza di spazio.
    assert.strictEqual(cambioConsentito(s, 'distanza'), false);
    assert.strictEqual(motivoNonDisponibile(s, 'distanza'), 'spazio');
    assert.throws(() => gioca(s, 'distanza'));
    const v = toDuelView(s);
    assert.strictEqual(v.posture.find((p) => p.id === 'distanza')?.motivo, 'spazio');
    assert.strictEqual(v.giocatore.spazio, 2);
    // Il cambio verso un'altra postura è gratuito, anche a fiato zero.
    const senzaFiato = { ...s, giocatore: { ...s.giocatore, fiato: 0 } };
    assert.strictEqual(cambioConsentito(senzaFiato, 'guardia'), true);
    const r3 = gioca(senzaFiato, 'guardia');
    const cambio = r3.eventi.find((e) => e.tipo === 'cambio' && e.chi === 'giocatore');
    assert.strictEqual(cambio && cambio.tipo === 'cambio' ? cambio.costo : -1, 0);
    assert.strictEqual(r3.stato.giocatore.distanzaConsecutive, 0);
    assert.strictEqual(cambioConsentito(r3.stato, 'distanza'), true);
  });

  it('il contatore si azzera anche se si passa per un\'altra postura', () => {
    let s = statoProva('D', 'distanza', { giocatore: { distanzaConsecutive: 1 } });
    s = gioca(s, 'attesa').stato;
    assert.strictEqual(s.giocatore.distanzaConsecutive, 0);
  });

  it('vale anche per il nemico: la vista mostra il suo spazio', () => {
    const s = statoProva('D', 'guardia', { nemico: { distanzaConsecutive: 5 } });
    assert.strictEqual(toDuelView(s).nemico.spazio, 2);
  });
});

describe('R3: l\'Attesa è una preparazione', () => {
  it('senza attacchi contro di lei diventa preparata; non si accumula', () => {
    const s = statoProva('D', 'attesa');
    const r = gioca(s, 'attesa');
    assert.strictEqual(r.stato.giocatore.preparato, true);
    assert.strictEqual(r.eventi.filter((e) => e.tipo === 'preparato' && e.chi === 'giocatore').length, 1);
    const r2 = gioca(r.stato, 'attesa');
    assert.strictEqual(r2.stato.giocatore.preparato, true);
    assert.ok(!r2.eventi.some((e) => e.tipo === 'preparato' && e.chi === 'giocatore'));
  });

  it('il bonus ×1,5 vale sul contrattacco e si consuma', () => {
    const s = statoProva('P1', 'attesa', { giocatore: { preparato: true } });
    const r = gioca(s, 'attesa');
    assert.strictEqual(inflitto(s, r.stato), 5); // 3 × 1,5 = 4,5 → 5
    assert.strictEqual(r.stato.giocatore.preparato, false);
  });

  it('il bonus ×1,5 vale sulla Punta e sull\'Arresto', () => {
    const p = statoProva('P1', 'distanza', { giocatore: { preparato: true, gradi: { parata: 1, schivata: 1, distanza: 2 } } });
    assert.strictEqual(inflitto(p, gioca(p, 'distanza').stato), 3); // 2 × 1,5
    const a = statoProva('P1', 'distanza', { giocatore: { preparato: true, gradi: { parata: 1, schivata: 1, distanza: 3 } } });
    assert.strictEqual(inflitto(a, gioca(a, 'distanza').stato), 5); // 3 × 1,5 = 4,5 → 5
  });

  it('una schivata non lascia preparati: l\'attacco ha raggiunto l\'Attesa', () => {
    const s = statoProva('L2', 'attesa');
    assert.strictEqual(gioca(s, 'attesa').stato.giocatore.preparato, false);
  });
});

describe('R1: incalzare', () => {
  it('chi attacca la Distanza prende il vantaggio, che vale dal turno dopo', () => {
    const s = statoProva('P1', 'distanza');
    const r = gioca(s, 'distanza');
    assert.strictEqual(r.stato.nemico.vantaggio, true);
    const r2 = resolveTurn({ ...r.stato }, 'attesa', { dado: dadoMatrice, saltaIA: true });
    // Il nemico con vantaggio colpisce al massimo (6, già fisso) e per primo.
    assert.ok(r2.eventi.length > 0);
  });
});
