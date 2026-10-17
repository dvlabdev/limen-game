import { describe, it } from 'node:test';
import assert from 'node:assert';
import { SIMBOLI, icona } from '../src/ui/symbols.ts';

describe('simboli (AUD-025)', () => {
  it('ogni simbolo ha la taglia minima e icona() non disegna mai sotto di essa', () => {
    for (const [id, s] of Object.entries(SIMBOLI)) {
      assert.ok(typeof s.min === 'number' && s.min > 0, `${id} senza min`);
      const larghezza = Number(/width="(\d+)"/.exec(icona(id, { px: 8 }))?.[1]);
      assert.ok(larghezza >= (s.min as number), `${id}: ${larghezza} < ${s.min}`);
    }
  });

  it('le posture dei chip e del registro (16 px richiesti) escono a 20 px', () => {
    for (const id of ['posture.assalto', 'posture.attesa', 'intent.pesante', 'intent.leggero']) {
      assert.ok(icona(id, { px: 16 }).includes('width="20"'), id);
    }
  });

  it("mod.inarrestabile non ha più il disegno vicino a evento.interrotto (AUD-023)", () => {
    assert.notStrictEqual(SIMBOLI['mod.inarrestabile']?.svg, SIMBOLI['evento.interrotto']?.svg);
    assert.ok(SIMBOLI['mod.inarrestabile']?.svg.includes('M1.5 10.4H15V7.4L22.5 12'), 'freccia orizzontale');
  });
});
