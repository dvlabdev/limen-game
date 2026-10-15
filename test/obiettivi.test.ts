// Obiettivi del simulatore (ARENA_SPEC §9, §12.4, §12.6, §12.7): riferimento `--duelli 1000 --seed 1`.
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ORDINE_NEMICI } from '../src/data/enemies.ts';
import { POLITICHE, simula } from '../sim/run.ts';
import type { Risultato } from '../sim/run.ts';

const par = { duelli: 1000, gradi: 1 as const, adattamento: true, seed: 1 };
const risultati = new Map<string, Risultato>();
for (const n of ORDINE_NEMICI) for (const p of POLITICHE) risultati.set(`${n}/${p.nome}`, simula(n, p, par));
const r = (nemico: string, politica: string): Risultato => risultati.get(`${nemico}/${politica}`) as Risultato;

describe('obiettivi del simulatore (gradi 1, adattamento attivo, seed 1)', () => {
  it('lettore: Recluta ≥ 90% in 4–8 turni', () => {
    const x = r('recluta', 'lettore');
    assert.ok(x.percVittorie >= 90, `vittorie ${x.percVittorie}`);
    assert.ok(x.turniMedi >= 4 && x.turniMedi <= 8, `turni ${x.turniMedi}`);
  });

  for (const n of ['duellante', 'bruto', 'lanciere']) {
    it(`lettore: ${n} 60–85% di vittorie e turni medi ${n === 'lanciere' ? '4–9' : '4–8'}`, () => {
      const x = r(n, 'lettore');
      assert.ok(x.percVittorie >= 60 && x.percVittorie <= 85, `vittorie ${x.percVittorie}`);
      assert.ok(x.turniMedi >= 4 && x.turniMedi <= (n === 'lanciere' ? 9 : 8), `turni ${x.turniMedi}`);
    });
  }

  it('lettore: Mietitore 35–65% in al più 14 turni', () => {
    const x = r('mietitore', 'lettore');
    assert.ok(x.percVittorie >= 35 && x.percVittorie <= 65, `vittorie ${x.percVittorie}`);
    assert.ok(x.turniMedi <= 14, `turni ${x.turniMedi}`);
  });

  for (const n of ['duellante', 'bruto', 'lanciere', 'mietitore']) {
    it(`${n}: fissa:* < 25%, casuale < 30%, fissa:distanza anche < 50% di pareggi`, () => {
      for (const p of POLITICHE) {
        if (p.nome === 'lettore') continue;
        const x = r(n, p.nome);
        if (p.nome === 'casuale') assert.ok(x.percVittorie < 30, `casuale ${x.percVittorie}`);
        else assert.ok(x.percVittorie < 25, `${p.nome} ${x.percVittorie}`);
        if (p.nome === 'fissa:distanza') assert.ok(x.percPareggi < 50, `pareggi ${x.percPareggi}`);
      }
    });
  }

  it('la Recluta è esclusa dal vincolo su fissa:distanza (ARENA_SPEC §12.6) e ha il Fendente mite', async () => {
    const { PROFILI } = await import('../src/data/enemies.ts');
    const fendente = PROFILI['recluta']?.mosse.find((m) => m.id === 'fendente')?.attacco?.danno;
    assert.deepStrictEqual(fendente, [3, 5]);
  });
});
