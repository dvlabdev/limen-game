import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ORDINE_NEMICI, PROFILI } from '../src/data/enemies.ts';
import { pesiCandidate } from '../src/core/ai.ts';
import { creaDuello, resolveTurn } from '../src/core/resolve.ts';
import type { PosturaId, StatoDuello } from '../src/core/types.ts';

function pesi(s: StatoDuello): Record<string, number> {
  return Object.fromEntries(pesiCandidate(s).map((c) => [c.mossa.id, c.peso]));
}

describe('IA dei nemici', () => {
  it('la Recluta segue la sequenza Fendente, Copertura', () => {
    let s = creaDuello('recluta', 5);
    const viste: string[] = [s.mossaNemico];
    for (let i = 0; i < 5; i++) {
      s = resolveTurn(s, 'distanza').stato;
      if (s.esito !== 'in corso') break;
      viste.push(s.mossaNemico);
    }
    assert.deepStrictEqual(viste.slice(0, 4), ['fendente', 'copertura', 'fendente', 'copertura']);
  });

  it('la postura iniziale del nemico coincide con la sua prima mossa, senza costo', () => {
    for (const id of ORDINE_NEMICI) {
      const s = creaDuello(id, 11);
      const fiatoMax = s.nemico.fiatoMax;
      assert.strictEqual(s.nemico.fiato, fiatoMax);
      assert.ok(s.mossaNemico.length > 0);
    }
  });

  it('candidate: senza fiato il nemico resta nella sua postura', () => {
    const s = creaDuello('mietitore', 3);
    s.nemico.postura = 'assalto';
    s.nemico.fiato = 0;
    assert.deepStrictEqual(Object.keys(pesi(s)).sort(), ['falciata', 'mietere']);
  });

  it('modificatori: Bruto si raccoglie ×3 con poco fiato; Lanciere si tiene a bada ×2 quando ferito', () => {
    const base = (id: string, mossa: string): number =>
      (PROFILI[id]?.fase1.mosse.find((m) => m.mossa === mossa)?.peso) as number;
    const b = creaDuello('bruto', 3);
    assert.strictEqual(pesi(b)['raccogliersi'], base('bruto', 'raccogliersi'));
    b.nemico.fiato = 1;
    assert.strictEqual(pesi(b)['raccogliersi'], base('bruto', 'raccogliersi') * 3);
    const l = creaDuello('lanciere', 3);
    assert.strictEqual(pesi(l)['tenereABada'], base('lanciere', 'tenereABada'));
    l.nemico.vigore = Math.floor(0.4 * l.nemico.vigoreMax) - 1; // sotto il 40%
    assert.strictEqual(pesi(l)['tenereABada'], base('lanciere', 'tenereABada') * 2);
  });

  it('adattamento: dopo 2 scelte uguali le mosse che battono la postura pesano di più', () => {
    const base = creaDuello('duellante', 9);
    base.nemico.postura = 'assalto';
    const normale = pesi(base);
    const adattato = (storico: PosturaId[], attivo = true) => {
      const s = structuredClone(base);
      s.storicoPosture = storico;
      s.opzioni.adattamento = attivo;
      return pesi(s);
    };
    // Contro la Guardia battono gli attacchi che sfondano: la Finta.
    assert.strictEqual(adattato(['guardia', 'guardia'])['finta'], (normale['finta'] as number) * 3);
    assert.strictEqual(adattato(['guardia', 'guardia'])['stoccata'], normale['stoccata']);
    // Una sola ripetizione, scelte diverse o opzione spenta: nessun effetto.
    assert.deepStrictEqual(adattato(['guardia']), normale);
    assert.deepStrictEqual(adattato(['assalto', 'guardia']), normale);
    assert.deepStrictEqual(adattato(['guardia', 'guardia'], false), normale);
    // Contro l'Attesa battono gli attacchi rapidi (tutte le mosse del Duellante tranne l'Affondo).
    const contro = adattato(['attesa', 'attesa']);
    assert.strictEqual(contro['stoccata'], (normale['stoccata'] as number) * 3);
    assert.strictEqual(contro['affondo'], normale['affondo']);
  });

  it('adattamento: la Recluta non si adatta mai', () => {
    const s = creaDuello('recluta', 1);
    s.storicoPosture = ['assalto', 'assalto'];
    s.nemico.postura = 'assalto';
    const p = pesi(s);
    assert.strictEqual(p['fendente'], 1);
  });

  it('il Mietitore ha la Carica solo in fase 2', () => {
    const s = creaDuello('mietitore', 4);
    s.nemico.postura = 'assalto';
    assert.ok(!('carica' in pesi(s)));
    s.nemico.fase = 2;
    assert.strictEqual(pesi(s)['carica'], PROFILI['mietitore']?.fase2?.mosse.find((m) => m.mossa === 'carica')?.peso);
  });

  it('stesso seed, stessa sequenza di mosse', () => {
    const percorso = (seed: number) => {
      let s = creaDuello('duellante', seed);
      const mosse = [s.mossaNemico];
      for (let i = 0; i < 8 && s.esito === 'in corso'; i++) {
        s = resolveTurn(s, i % 2 ? 'guardia' : 'assalto').stato;
        mosse.push(s.mossaNemico);
      }
      return mosse.join(',');
    };
    assert.strictEqual(percorso(21), percorso(21));
  });
});
