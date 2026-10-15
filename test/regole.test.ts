// Test dedicati alle regole del duello (ARENA_SPEC §4.6, elenco dopo la matrice).
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { BALANCE } from '../src/data/balance.ts';
import { cambioConsentito, creaDuello, resolveTurn } from '../src/core/resolve.ts';
import { dadoMassimo, dadoMinimo } from '../src/core/rng.ts';
import { gioca, inflitto, statoProva, subito } from './util.ts';

describe('gradi di Parata e Schivata', () => {
  it('Parata grado 2: il colpo leggero è annullato, quello pesante vale ×0,4', () => {
    const s1 = statoProva('L1', 'guardia', { giocatore: { gradi: { parata: 2, schivata: 1, distanza: 1 } } });
    assert.strictEqual(subito(s1, gioca(s1, 'guardia').stato), 0);
    const s2 = statoProva('P1', 'guardia', { giocatore: { gradi: { parata: 2, schivata: 1, distanza: 1 } } });
    const r2 = gioca(s2, 'guardia');
    assert.strictEqual(subito(s2, r2.stato), 2);
    assert.strictEqual(r2.stato.giocatore.vantaggio, false);
  });

  it('Parata grado 3: il colpo pesante parato dà il vantaggio', () => {
    const s = statoProva('P1', 'guardia', { giocatore: { gradi: { parata: 3, schivata: 1, distanza: 1 } } });
    const r = gioca(s, 'guardia');
    assert.strictEqual(subito(s, r.stato), 2);
    assert.strictEqual(r.stato.giocatore.vantaggio, true);
  });

  it('Schivata grado 2: contrattacco +1 e vantaggio; contro un colpo rapido fallisce ancora', () => {
    const s = statoProva('P1', 'attesa', { giocatore: { gradi: { parata: 1, schivata: 2, distanza: 1 } } });
    const r = gioca(s, 'attesa');
    assert.strictEqual(inflitto(s, r.stato), 4);
    assert.strictEqual(r.stato.giocatore.vantaggio, true);
    const s2 = statoProva('L1', 'attesa', { giocatore: { gradi: { parata: 1, schivata: 2, distanza: 1 } } });
    assert.strictEqual(subito(s2, gioca(s2, 'attesa').stato), 3);
  });

  it('Schivata grado 3: schiva anche i colpi rapidi', () => {
    const s = statoProva('L1', 'attesa', { giocatore: { gradi: { parata: 1, schivata: 3, distanza: 1 } } });
    const r = gioca(s, 'attesa');
    assert.strictEqual(subito(s, r.stato), 0);
    assert.strictEqual(inflitto(s, r.stato), 4);
  });

  it('la Schivata costa 2 fiato, la Parata 1', () => {
    const a = statoProva('P1', 'attesa');
    // Attesa recupera 1: 4 - 2 + 1
    assert.strictEqual(gioca(a, 'attesa').stato.giocatore.fiato, 3);
    const g = statoProva('P1', 'guardia');
    // Guardia recupera 2: 4 - 1 + 2
    assert.strictEqual(gioca(g, 'guardia').stato.giocatore.fiato, 5);
  });
});

describe('fiato zero', () => {
  it('niente reazioni e danno ×1,25', () => {
    const s = statoProva('P1', 'attesa', { giocatore: { fiato: 0 } });
    const r = gioca(s, 'attesa');
    assert.strictEqual(subito(s, r.stato), 8); // 6 × 1,25 = 7,5 → 8
    const g = statoProva('L1', 'guardia', { giocatore: { fiato: 0 } });
    assert.strictEqual(subito(g, gioca(g, 'guardia').stato), 4); // 3 × 1,25 = 3,75 → 4
    const d = statoProva('L1', 'distanza', { giocatore: { fiato: 0 } });
    assert.strictEqual(subito(d, gioca(d, 'distanza').stato), 4); // la Distanza non evita senza fiato
  });

  it('vale anche per il nemico, contrattacco compreso', () => {
    const s = statoProva('P1', 'attesa', { nemico: { fiato: 0 } });
    const r = gioca(s, 'attesa');
    assert.strictEqual(inflitto(s, r.stato), 4); // 3 × 1,25 = 3,75 → 4
  });

  it('con fiato 1 la Schivata fallisce e la postura resta quella', () => {
    const s = statoProva('P1', 'attesa', { giocatore: { fiato: 1 } });
    const r = gioca(s, 'attesa');
    assert.strictEqual(subito(s, r.stato), 6);
  });
});

describe('sfondaGuardia e inarrestabile', () => {
  it('sfondaGuardia ignora la Parata', () => {
    const s = statoProva('SG', 'guardia', { giocatore: { gradi: { parata: 3, schivata: 1, distanza: 1 } } });
    const r = gioca(s, 'guardia');
    assert.strictEqual(subito(s, r.stato), 6);
    assert.strictEqual(r.stato.giocatore.fiato, 6); // nessun fiato speso in Parata (4 + 2)
  });

  it('un colpo inarrestabile non viene interrotto', () => {
    const s = statoProva('IN', 'assalto');
    const r = gioca(s, 'assalto');
    assert.strictEqual(inflitto(s, r.stato), 5);
    assert.strictEqual(subito(s, r.stato), 6);
    assert.ok(!r.eventi.some((e) => e.tipo === 'interrotto'));
  });

  it('lo stesso colpo non inarrestabile viene interrotto', () => {
    const s = statoProva('PL', 'assalto');
    const r = gioca(s, 'assalto');
    assert.strictEqual(subito(s, r.stato), 0);
  });
});

describe('vantaggio', () => {
  it('uso: colpisce per primo, al massimo, e si consuma', () => {
    const s = statoProva('P1', 'assalto', { giocatore: { vantaggio: true } });
    const r = gioca(s, 'assalto');
    assert.strictEqual(inflitto(s, r.stato), 6); // massimo di 4–6, mentre il tiro finto darebbe 5
    assert.strictEqual(r.eventi.find((e) => e.tipo === 'colpo')?.chi, 'giocatore'); // il giocatore colpisce per primo
    // Il colpo del giocatore interrompe quello del nemico (pesante a segno).
    assert.strictEqual(subito(s, r.stato), 0);
    // Vantaggio consumato, ma ne guadagna uno nuovo con il colpo pesante.
    assert.strictEqual(r.stato.giocatore.vantaggio, true);
  });

  it('se il combattente non attacca conserva il vantaggio', () => {
    const s = statoProva('D', 'distanza', { giocatore: { vantaggio: true } });
    assert.strictEqual(gioca(s, 'distanza').stato.giocatore.vantaggio, true);
  });

  it('perdita: chi incassa danno perde il vantaggio', () => {
    const s = statoProva('L1', 'attesa', { giocatore: { vantaggio: true } });
    const r = gioca(s, 'attesa'); // schivata fallita contro un colpo rapido
    assert.strictEqual(subito(s, r.stato), 3);
    assert.strictEqual(r.stato.giocatore.vantaggio, false);
  });

  it('guadagno differito: vale dal turno successivo, non in questo', () => {
    const s = statoProva('P2', 'assalto');
    const r = gioca(s, 'assalto');
    assert.strictEqual(inflitto(s, r.stato), 5); // niente massimo in questo turno
    assert.strictEqual(r.stato.giocatore.vantaggio, true);
    const r2 = gioca({ ...r.stato, esito: 'in corso' }, 'assalto');
    assert.strictEqual(inflitto(r.stato, r2.stato), 6); // nel turno dopo sì
  });

  it('il vantaggio in arrivo guadagnato prima di un colpo subìto si perde', () => {
    const s = statoProva('IN', 'assalto'); // il giocatore colpisce per primo, poi incassa l'inarrestabile
    const r = gioca(s, 'assalto');
    assert.strictEqual(r.stato.giocatore.vantaggio, false);
  });

  it('il vantaggio decide l\'ordine: con un solo vantaggio si colpisce per primi', () => {
    const s = statoProva('P1', 'assalto', { nemico: { vantaggio: true } });
    const r = gioca(s, 'assalto');
    assert.strictEqual(subito(s, r.stato), 6);
    assert.strictEqual(inflitto(s, r.stato), 0); // il colpo del nemico interrompe il giocatore
  });
});

describe('preparato', () => {
  it('il prossimo attacco vale ×1,5 e il bonus si consuma', () => {
    const s = statoProva('P1', 'assalto', { nemico: { preparato: true } });
    const r = gioca(s, 'assalto');
    assert.strictEqual(subito(s, r.stato), 9);
    assert.strictEqual(r.stato.nemico.preparato, false);
  });

  it('un colpo pesante a segno rompe la preparazione', () => {
    const s = statoProva('PR', 'assalto');
    const r = gioca(s, 'assalto');
    assert.strictEqual(r.stato.nemico.preparato, false);
  });
});

describe('fine del duello', () => {
  it('cambio di fase del boss a metà vigore', () => {
    const s = statoProva('D', 'assalto', { nemico: { vigore: 25, vigoreMax: 40 } });
    const r = gioca(s, 'assalto'); // 25 − 2 (parata) = 23 > 20: ancora fase 1
    assert.strictEqual(r.stato.nemico.fase, 1);
    const s2 = statoProva('PR', 'assalto', { nemico: { vigore: 25, vigoreMax: 40 } });
    const r2 = gioca(s2, 'assalto'); // 25 − 5 = 20 ≤ 20
    assert.strictEqual(r2.stato.nemico.fase, 2);
    assert.ok(r2.eventi.some((e) => e.tipo === 'fase2'));
  });

  it('pareggio al 25° turno', () => {
    const s = statoProva('D', 'distanza');
    s.turno = BALANCE.turnoMax - 1;
    const r = gioca(s, 'distanza');
    assert.strictEqual(r.stato.esito, 'in corso');
    const r2 = gioca(r.stato, 'distanza');
    assert.strictEqual(r2.stato.esito, 'pareggio');
    assert.ok(r2.eventi.some((e) => e.tipo === 'fine' && e.esito === 'pareggio'));
  });

  it('vittoria: i colpi successivi non si risolvono', () => {
    const s = statoProva('P1', 'assalto', { giocatore: { vantaggio: true }, nemico: { vigore: 5 } });
    const r = gioca(s, 'assalto');
    assert.strictEqual(r.stato.esito, 'vittoria');
    assert.strictEqual(subito(s, r.stato), 0);
  });

  it('sconfitta e pareggio per colpi simultanei', () => {
    const s = statoProva('P1', 'assalto', { giocatore: { vigore: 6 } });
    assert.strictEqual(gioca(s, 'assalto').stato.esito, 'sconfitta');
    const d = statoProva('P1', 'assalto', { giocatore: { vigore: 6 }, nemico: { vigore: 5 } });
    assert.strictEqual(gioca(d, 'assalto').stato.esito, 'pareggio');
  });

  it('non si può giocare un duello concluso', () => {
    const s = statoProva('P1', 'assalto', { nemico: { vigore: 1 } });
    const fine = gioca(s, 'assalto').stato;
    assert.throws(() => gioca(fine, 'assalto'));
  });
});

describe('cambio di postura', () => {
  it('costa 1 fiato; tenere la postura è gratis', () => {
    const s = statoProva('D', 'guardia');
    assert.strictEqual(gioca(s, 'guardia').stato.giocatore.fiato, 6); // 4 + 2 (guardia)
    assert.strictEqual(gioca(s, 'attesa').stato.giocatore.fiato, 4); // 4 − 1 + 1 (attesa)
  });

  it('non è consentito senza fiato', () => {
    const s = statoProva('D', 'guardia', { giocatore: { fiato: 0 } });
    assert.strictEqual(cambioConsentito(s, 'assalto'), false);
    assert.strictEqual(cambioConsentito(s, 'guardia'), true);
    assert.throws(() => gioca(s, 'assalto'));
  });
});

describe('proprietà del risolutore', () => {
  it('non modifica lo stato in ingresso', () => {
    const s = statoProva('P1', 'assalto');
    const copia = JSON.stringify(s);
    resolveTurn(s, 'attesa', { dado: dadoMassimo });
    assert.strictEqual(JSON.stringify(s), copia);
  });

  it('è deterministico a parità di seed e scelte', () => {
    const percorso = (seed: number): string => {
      let s = creaDuello('banco', seed);
      const scelte = ['assalto', 'guardia', 'attesa', 'distanza'] as const;
      for (let i = 0; i < 12 && s.esito === 'in corso'; i++) {
        const sc = scelte[i % 4] as (typeof scelte)[number];
        if (!cambioConsentito(s, sc)) continue;
        s = resolveTurn(s, sc).stato;
      }
      return JSON.stringify(s);
    };
    assert.strictEqual(percorso(7), percorso(7));
    assert.notStrictEqual(percorso(7), percorso(8));
  });

  it('lo stato è serializzabile in JSON senza perdite', () => {
    const s = resolveTurn(creaDuello('banco', 3), 'guardia').stato;
    assert.deepStrictEqual(JSON.parse(JSON.stringify(s)), s);
  });

  it('con il dado minimo e massimo i danni restano negli intervalli', () => {
    const s = statoProva('P1', 'assalto');
    const min = resolveTurn(s, 'assalto', { dado: dadoMinimo, saltaIA: true });
    const max = resolveTurn(s, 'assalto', { dado: dadoMassimo, saltaIA: true });
    assert.strictEqual(inflitto(s, min.stato), 4);
    assert.strictEqual(inflitto(s, max.stato), 6);
  });
});
