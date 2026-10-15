import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ORDINE_NEMICI, trovaMossa } from '../src/data/enemies.ts';
import { creaDuello, resolveTurn } from '../src/core/resolve.ts';
import { toDuelView } from '../src/core/view.ts';
import { dadoMassimo, dadoMinimo } from '../src/core/rng.ts';
import { SIMBOLI } from '../src/ui/symbols.ts';
import { gioca, statoProva } from './util.ts';


describe('DuelView', () => {
  it('la categoria dell\'hint deriva dall\'archetipo e dall\'attacco', () => {
    const attesa = { P1: 'pesante', L1: 'leggero', D: 'difesa', PR: 'preparazione' } as const;
    for (const [mossa, categoria] of Object.entries(attesa)) {
      const v = toDuelView(statoProva(mossa, 'guardia'));
      assert.strictEqual(v.hint.categoria, categoria);
      assert.strictEqual(v.hint.simbolo, `intent.${categoria}`);
    }
  });

  it('una guardia con un attacco leggero è comunque "difesa"', () => {
    const s = creaDuello('duellante', 1);
    s.mossaNemico = 'parata';
    s.nemico.postura = 'guardia';
    assert.strictEqual(toDuelView(s).hint.categoria, 'difesa');
  });

  it('il dettaglio dell\'hint compare solo con hintCompleti', () => {
    const s = creaDuello('bruto', 2);
    s.mossaNemico = 'spallata';
    assert.strictEqual(toDuelView(s).hint.dettaglio, undefined);
    s.opzioni.hintCompleti = true;
    const d = toDuelView(s).hint.dettaglio;
    const dati = trovaMossa('bruto', 'spallata').attacco;
    assert.deepStrictEqual(d, {
      nome: 'Spallata', forza: 'pesante', portata: 'corta', velocita: 'normale', danno: dati?.danno, flags: ['sfondaGuardia'],
    });
  });

  it('è serializzabile e usa solo simboli del catalogo', () => {
    for (const id of ORDINE_NEMICI) {
      let s = creaDuello(id, 6, { anteprimaDanni: true });
      let eventi: ReturnType<typeof resolveTurn>['eventi'] = [];
      for (let t = 0; t < 10 && s.esito === 'in corso'; t++) {
        const v = toDuelView(s, eventi);
        assert.deepStrictEqual(JSON.parse(JSON.stringify(v)), v);
        const simboli = [
          v.hint.simbolo, v.giocatore.postura.simbolo, v.nemico.postura.simbolo,
          ...v.posture.map((p) => p.simbolo), ...v.registro.flatMap((r) => (r.simbolo ? [r.simbolo] : [])),
        ];
        for (const sim of simboli) assert.ok(sim in SIMBOLI, `simbolo fuori catalogo: ${sim}`);
        const scelta = v.posture.find((p) => p.disponibile && !p.attiva) ?? v.posture.find((p) => p.disponibile);
        const r = resolveTurn(s, (scelta as { id: 'assalto' }).id);
        s = r.stato;
        eventi = r.eventi;
      }
    }
  });

  it('ogni simbolo emesso da toDuelView esiste in SIMBOLI (UI_SPEC §9.6): tutti i nemici, molti duelli, hint completi', () => {
    for (const id of ORDINE_NEMICI) {
      for (let seed = 1; seed <= 25; seed++) {
        let s = creaDuello(id, seed, { hintCompleti: true, anteprimaDanni: true }, { parata: 3, schivata: 3, distanza: (seed % 3 + 1) as 1 | 2 | 3 });
        let eventi: ReturnType<typeof resolveTurn>['eventi'] = [];
        for (let t = 0; t < 30 && s.esito === 'in corso'; t++) {
          const v = toDuelView(s, eventi);
          const d = v.hint.dettaglio;
          const mod = d ? [d.portata ? `mod.portata.${d.portata}` : '', d.velocita ? `mod.velocita.${d.velocita}` : '', ...d.flags.map((f) => `mod.${f}`)].filter(Boolean) : [];
          const simboli = [
            v.hint.simbolo, v.giocatore.postura.simbolo, v.nemico.postura.simbolo, 'risorsa.vigore', 'risorsa.fiato.pieno', 'risorsa.fiato.vuoto',
            ...mod, ...v.posture.flatMap((p) => [p.simbolo, `${p.simbolo}.medaglione`]), ...v.registro.flatMap((r) => (r.simbolo ? [r.simbolo] : [])),
          ];
          for (const sim of simboli) assert.ok(sim in SIMBOLI, `simbolo fuori catalogo: ${sim}`);
          const disp = v.posture.filter((p) => p.disponibile);
          const scelta = disp[(seed + t) % disp.length] as { id: 'assalto' };
          const r = resolveTurn(s, scelta.id);
          s = r.stato;
          eventi = r.eventi;
        }
      }
    }
  });

  it('il registro porta dove e breve per le etichette del colpo', () => {
    const s = statoProva('P2', 'assalto');
    const r = gioca(s, 'assalto');
    const v = toDuelView(r.stato, r.eventi);
    const colpo = v.registro.find((x) => x.tipo === 'colpo');
    assert.ok(colpo && colpo.dove === 'nemico' && /^−[0-9]+$/.test(colpo.breve ?? ''));
    assert.strictEqual(v.registro.find((x) => x.tipo === 'interrotto')?.dove, 'nemico');
  });

  it("l'etichetta dello stato preparato è \"Preparato\" in tutto il set (AUD-009)", () => {
    assert.strictEqual(SIMBOLI['stato.preparato']?.etichetta, 'Preparato');
    const s = statoProva('PR', 'assalto');
    const r = gioca(s, 'guardia');
    const testo = toDuelView(r.stato, r.eventi).registro.map((x) => x.testo).join(' ');
    assert.ok(/preparato/i.test(testo) && !/raccol/i.test(testo), testo);
  });

  it('le posture non raggiungibili sono disabilitate senza fiato', () => {
    const s = statoProva('D', 'guardia', { giocatore: { fiato: 0 } });
    const v = toDuelView(s);
    assert.deepStrictEqual(v.posture.map((p) => p.disponibile), [false, true, false, false]);
    assert.deepStrictEqual(v.posture.map((p) => p.costo), [1, 0, 1, 1]);
  });

  it('l\'anteprima compare solo con anteprimaDanni e solo per le posture disponibili', () => {
    const s = statoProva('P1', 'guardia', { giocatore: { fiato: 0 } });
    assert.ok(toDuelView(s).posture.every((p) => p.anteprima === undefined));
    s.opzioni.anteprimaDanni = true;
    const v = toDuelView(s);
    assert.deepStrictEqual(v.posture.map((p) => p.anteprima !== undefined), [false, true, false, false]);
  });

  it('anteprima con la mossa esatta: coincide con resolveTurn a dado minimo e massimo', () => {
    const s = statoProva('P1', 'guardia');
    s.opzioni.anteprimaDanni = true;
    s.opzioni.hintCompleti = true;
    const v = toDuelView(s);
    for (const p of v.posture) {
      const a = resolveTurn(s, p.id, { dado: dadoMinimo, saltaIA: true }).stato;
      const b = resolveTurn(s, p.id, { dado: dadoMassimo, saltaIA: true }).stato;
      const subiti = [s.giocatore.vigore - a.giocatore.vigore, s.giocatore.vigore - b.giocatore.vigore];
      const inflitti = [s.nemico.vigore - a.nemico.vigore, s.nemico.vigore - b.nemico.vigore];
      assert.deepStrictEqual(p.anteprima?.subito, [Math.min(...subiti), Math.max(...subiti)], `subito ${p.id}`);
      assert.deepStrictEqual(p.anteprima?.inflitto, [Math.min(...inflitti), Math.max(...inflitti)], `inflitto ${p.id}`);
    }
  });

  it('anteprima per categoria: copre tutte le mosse della categoria e contiene l\'esito reale', () => {
    const s = statoProva('P1', 'distanza');
    s.opzioni.anteprimaDanni = true;
    const dist = toDuelView(s).posture.find((p) => p.id === 'distanza')?.anteprima;
    // Le mosse pesanti del banco includono P2 (lunga): la Distanza rischia 6 × 1,25 → 8.
    assert.strictEqual(dist?.subito[1], 8);
    assert.strictEqual(dist?.subito[0], 0);
    const reale = gioca(s, 'distanza').stato;
    const subito = s.giocatore.vigore - reale.giocatore.vigore;
    assert.ok(dist && subito >= dist.subito[0] && subito <= dist.subito[1]);
  });

  it('l\'anteprima non modifica lo stato', () => {
    const s = creaDuello('mietitore', 8, { anteprimaDanni: true });
    const prima = JSON.stringify(s);
    toDuelView(s);
    assert.strictEqual(JSON.stringify(s), prima);
  });

  it('il registro spiega gli eventi dell\'ultimo turno', () => {
    const s = statoProva('P2', 'assalto');
    const r = gioca(s, 'assalto');
    const v = toDuelView(r.stato, r.eventi);
    assert.ok(v.registro.length >= 2);
    assert.ok(v.registro.every((x) => x.testo.length > 0 && x.turno === 1 && x.tipo.length > 0));
    assert.ok(v.registro.some((x) => x.tipo === 'interrotto'));
  });

  it('il Mietitore ha una fase 2, gli altri no', () => {
    assert.strictEqual(toDuelView(creaDuello('mietitore', 1)).nemico.haFase2, true);
    assert.strictEqual(toDuelView(creaDuello('bruto', 1)).nemico.haFase2, false);
  });
});
