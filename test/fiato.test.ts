// Fiato previsto a fine turno e bilancio nel registro (ARENA_SPEC §13.2).
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ORDINE_NEMICI } from '../src/data/enemies.ts';
import { ORDINE_POSTURE } from '../src/data/postures.ts';
import { creaDuello, resolveTurn } from '../src/core/resolve.ts';
import { dadoMassimo, dadoMinimo } from '../src/core/rng.ts';
import { toDuelView } from '../src/core/view.ts';
import type { EventoConTurno, PosturaId, StatoDuello } from '../src/core/types.ts';
import { gioca, statoProva } from './util.ts';

const fiatoFine = (s: StatoDuello, p: PosturaId): [number, number] =>
  toDuelView(s).posture.find((x) => x.id === p)?.fiatoFine as [number, number];

function bilancio(eventi: EventoConTurno[], chi: 'giocatore' | 'nemico' = 'giocatore') {
  const e = eventi.find((x) => x.tipo === 'fiato' && x.chi === chi);
  return e && e.tipo === 'fiato' ? e : undefined;
}

describe('fiato a fine turno (§13.2)', () => {
  it('cambio di postura: costa 1 e il recupero della nuova postura lo compensa', () => {
    const s = statoProva('D', 'guardia'); // fiato 4; il nemico si difende senza attaccare
    const r = gioca(s, 'attesa');
    const b = bilancio(r.eventi);
    assert.deepStrictEqual(b?.voci, [
      { tipo: 'cambio', valore: -1 },
      { tipo: 'recupero', valore: 1 },
    ]);
    assert.strictEqual(b?.da, 4);
    assert.strictEqual(b?.a, 4);
    assert.deepStrictEqual(fiatoFine(s, 'attesa'), [4, 4]);
  });

  it('recupero secondo la postura (assalto 0, guardia 2, attesa 1, distanza 2), con il tetto al massimo', () => {
    const s = statoProva('D', 'guardia');
    const atteso: Record<PosturaId, number> = { assalto: 3, guardia: 6, attesa: 4, distanza: 5 };
    for (const p of ORDINE_POSTURE) {
      const r = gioca(s, p);
      assert.strictEqual(r.stato.giocatore.fiato, atteso[p], p);
      assert.deepStrictEqual(fiatoFine(s, p), [atteso[p], atteso[p]], p);
    }
    // La guardia da 4 recupererebbe 2 ma il massimo è 6: la voce di recupero è quella vera (+2 qui, +1 da 5).
    const alto = statoProva('D', 'guardia', { giocatore: { fiato: 5 } });
    assert.deepStrictEqual(bilancio(gioca(alto, 'guardia').eventi)?.voci, [{ tipo: 'recupero', valore: 1 }]);
    // Senza variazioni (fiato al massimo, nessun costo) non c'è bilancio da mostrare.
    const pieno = statoProva('D', 'guardia', { giocatore: { fiato: 6 } });
    assert.strictEqual(bilancio(gioca(pieno, 'guardia').eventi), undefined);
  });

  it('schivata riuscita e fallita, e intervallo con più mosse candidate', () => {
    const s = statoProva('P1', 'guardia');
    // Contro un pesante, in Attesa: cambio −1, schivata −2, recupero +1 (4 → 2).
    const riuscita = bilancio(gioca(s, 'attesa').eventi);
    assert.deepStrictEqual(riuscita?.voci, [
      { tipo: 'cambio', valore: -1 },
      { tipo: 'schivata', valore: -2 },
      { tipo: 'recupero', valore: 1 },
    ]);
    assert.deepStrictEqual([riuscita?.da, riuscita?.a], [4, 2]);
    // L1 è rapido: la schivata fallisce e non costa (4 → 4).
    const l1 = statoProva('L1', 'guardia');
    const fallita = bilancio(gioca(l1, 'attesa').eventi);
    assert.deepStrictEqual(fallita?.voci, [
      { tipo: 'cambio', valore: -1 },
      { tipo: 'recupero', valore: 1 },
    ]);
    assert.strictEqual(fallita?.a, 4);
    // Hint "leggero" = {L1 rapido, L2 normale, SGL normale}: in Attesa il fiato finale è 4 (L1) o 2 (L2, SGL).
    assert.deepStrictEqual(fiatoFine(l1, 'attesa'), [2, 4]);
    // Con gli hint completi la mossa è una sola.
    l1.opzioni.hintCompleti = true;
    assert.deepStrictEqual(fiatoFine(l1, 'attesa'), [4, 4]);
  });

  it('parata: −1, e non scatta contro un colpo che sfonda la guardia', () => {
    const s = statoProva('L1', 'guardia');
    assert.deepStrictEqual(bilancio(gioca(s, 'guardia').eventi)?.voci, [
      { tipo: 'parata', valore: -1 },
      { tipo: 'recupero', valore: 2 },
    ]);
    assert.deepStrictEqual(fiatoFine(s, 'guardia'), [5, 6]); // SGL sfonda: niente parata, 4 + 2
  });

  it('fiato zero: niente cambio né reazioni, solo il recupero', () => {
    const s = statoProva('P1', 'guardia', { giocatore: { fiato: 0 } });
    const v = toDuelView(s);
    assert.strictEqual(v.posture.find((p) => p.id === 'attesa')?.disponibile, false);
    // Una postura non scelta resta al fiato attuale.
    assert.deepStrictEqual(fiatoFine(s, 'attesa'), [0, 0]);
    assert.deepStrictEqual(bilancio(gioca(s, 'guardia').eventi)?.voci, [{ tipo: 'recupero', valore: 2 }]);
    assert.deepStrictEqual(fiatoFine(s, 'guardia'), [2, 2]);
  });

  it('spalle al muro: il cambio dalla Distanza è gratis', () => {
    const s = statoProva('D', 'distanza', { giocatore: { fiato: 0, distanzaConsecutive: 2 } });
    const r = gioca(s, 'guardia');
    const b = bilancio(r.eventi);
    assert.ok(!b?.voci.some((x) => x.tipo === 'cambio'));
    assert.deepStrictEqual([b?.da, b?.a], [0, 2]);
    assert.deepStrictEqual(fiatoFine(s, 'guardia'), [2, 2]);
  });

  it('Punta e Arresto costano 1 e compaiono nel bilancio', () => {
    const s = statoProva('P1', 'distanza', { giocatore: { gradi: { parata: 1, schivata: 1, distanza: 3 } } });
    const b = bilancio(gioca(s, 'distanza').eventi);
    assert.deepStrictEqual(b?.voci, [
      { tipo: 'arresto', valore: -1 },
      { tipo: 'recupero', valore: 2 },
    ]);
  });

  it('il registro riporta il bilancio del giocatore nella forma "Fiato 4 → 2: …" e non quello del nemico', () => {
    const s = statoProva('P1', 'guardia');
    const r = gioca(s, 'attesa');
    const reg = toDuelView(r.stato, r.eventi).registro;
    const voci = reg.filter((x) => x.tipo === 'fiato');
    assert.strictEqual(voci.length, 1);
    assert.strictEqual(voci[0]?.testo, 'Fiato 4 → 2: cambio −1, schivata −2, recupero +1.');
    assert.strictEqual(voci[0]?.simbolo, 'risorsa.fiato');
  });

  it('fiatoFine c\'è sempre, anche con l\'anteprima dei danni spenta, ed è serializzabile', () => {
    const s = creaDuello('bruto', 3);
    assert.strictEqual(s.opzioni.anteprimaDanni, false);
    const v = toDuelView(s);
    for (const p of v.posture) {
      assert.ok(Array.isArray(p.fiatoFine) && p.fiatoFine.length === 2);
      assert.ok(p.fiatoFine[0] <= p.fiatoFine[1]);
      assert.strictEqual(p.anteprima, undefined);
    }
    assert.deepStrictEqual(JSON.parse(JSON.stringify(v)), v);
  });

  it('con gli hint completi il fiato previsto è quello vero con il dado minimo e massimo', () => {
    for (const id of ORDINE_NEMICI) {
      for (let seed = 1; seed <= 12; seed++) {
        let s = creaDuello(id, seed, { hintCompleti: true });
        for (let t = 0; t < 12 && s.esito === 'in corso'; t++) {
          const v = toDuelView(s);
          for (const p of v.posture.filter((x) => x.disponibile)) {
            const f = [dadoMinimo, dadoMassimo].map((dado) => resolveTurn(s, p.id, { dado, saltaIA: true }).stato.giocatore.fiato);
            assert.deepStrictEqual(p.fiatoFine, [Math.min(...f), Math.max(...f)], `${id}/${seed}/${t}/${p.id}`);
          }
          const scelte = v.posture.filter((x) => x.disponibile);
          s = resolveTurn(s, (scelte[(seed + t) % scelte.length] as { id: PosturaId }).id).stato;
        }
      }
    }
  });

  it('il bilancio è coerente: da + voci = a, e coincide con il fiato prima e dopo il turno (entrambi)', () => {
    for (const id of ORDINE_NEMICI) {
      for (let seed = 1; seed <= 15; seed++) {
        let s = creaDuello(id, seed);
        for (let t = 0; t < 25 && s.esito === 'in corso'; t++) {
          const v = toDuelView(s);
          const scelte = v.posture.filter((x) => x.disponibile);
          const scelta = (scelte[(seed * 7 + t * 3) % scelte.length] as { id: PosturaId }).id;
          const prima = { giocatore: s.giocatore.fiato, nemico: s.nemico.fiato };
          const r = resolveTurn(s, scelta);
          for (const chi of ['giocatore', 'nemico'] as const) {
            const b = bilancio(r.eventi, chi);
            const dopo = r.stato[chi].fiato;
            if (!b) {
              assert.strictEqual(dopo, prima[chi], `${id}/${seed}/${t}/${chi}: variazione senza bilancio`);
              continue;
            }
            assert.strictEqual(b.da, prima[chi]);
            assert.strictEqual(b.a, dopo);
            assert.strictEqual(b.da + b.voci.reduce((somma, x) => somma + x.valore, 0), b.a);
            assert.ok(b.voci.every((x) => x.valore !== 0));
          }
          s = r.stato;
        }
      }
    }
  });
});
