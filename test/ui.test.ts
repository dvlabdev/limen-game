// Disegno dei due layout: si prova la stringa HTML prodotta, senza DOM (ARENA_S23_SPEC §4).
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { creaDuello, resolveTurn } from '../src/core/resolve.ts';
import { toDuelView } from '../src/core/view.ts';
import { disegnaDuello } from '../src/ui/render.ts';
import type { Layout, ModelloDuello } from '../src/ui/render.ts';
import { sagoma } from '../src/ui/sagome.ts';
import { gioca, statoProva } from './util.ts';

function html(m: ModelloDuello): string {
  const finto = { innerHTML: '', querySelector: () => null } as unknown as HTMLElement;
  disegnaDuello(finto, m);
  return finto.innerHTML;
}

function modello(layout: Layout, stato = creaDuello('bruto', 1), selezione: ModelloDuello['selezione'] = null): ModelloDuello {
  return { vista: toDuelView(stato), layout, nemicoId: 'bruto', anima: false, cassetto: false, selezione, storico: [] };
}

describe('layout scena', () => {
  it('ha quattro medaglioni nell\'ordine Distanza, Attesa, Guardia, Assalto, con aria-pressed', () => {
    const h = html(modello('scena'));
    const ids = [...h.matchAll(/class="med[^"]*" data-azione="scegli" data-id="(\w+)"/g)].map((x) => x[1]);
    assert.deepStrictEqual(ids, ['distanza', 'attesa', 'guardia', 'assalto']);
    assert.strictEqual((h.match(/aria-pressed="false"/g) ?? []).length, 4);
  });

  it('il medaglione selezionato è aria-pressed e il cartiglio chiede la conferma', () => {
    const h = html(modello('scena', creaDuello('bruto', 1), 'assalto'));
    assert.ok(/data-id="assalto"[^>]*aria-pressed="true"/.test(h.replace(/\n\s*/g, ' ')));
    assert.ok(h.includes('Tocca di nuovo per confermare'));
  });

  it('con la Distanza esaurita il medaglione è spento con il motivo "niente spazio" e compare il bollino', () => {
    let s = statoProva('D', 'distanza');
    for (let i = 0; i < 2; i++) {
      s = gioca(s, 'distanza').stato;
      s.mossaNemico = 'D';
    }
    const h = html(modello('scena', s));
    const med = h.slice(h.indexOf('data-id="distanza"'), h.indexOf('data-id="attesa"'));
    assert.ok(med.includes('disabled') && med.includes('niente spazio') && med.includes('class="badge"'));
    assert.ok(h.includes('aria-label="Spalle al muro"'));
  });

  it('con poco fiato le posture costose sono spente con il motivo "fiato"', () => {
    const s = creaDuello('bruto', 1);
    s.giocatore.fiato = 0;
    const h = html(modello('scena', s));
    assert.ok(h.includes('<span class="motivo">fiato</span>'));
  });

  it('mostra le tacche dello spazio alle spalle e la targhetta della postura del nemico (in Guardia all\'inizio)', () => {
    const h = html(modello('scena'));
    assert.ok((h.match(/<rect /g) ?? []).length >= 7);
    assert.ok(/targhetta nemico[^>]*>.*Guardia/s.test(h));
  });

  it('il testo del colpo compare solo subito dopo la conferma', () => {
    const s = creaDuello('bruto', 1);
    const r = resolveTurn(s, 'assalto');
    const dopo: ModelloDuello = { ...modello('scena', r.stato), vista: toDuelView(r.stato, r.eventi), anima: true };
    assert.ok(html(dopo).includes('class="colpi"'));
    assert.ok(!html({ ...dopo, anima: false }).includes('class="colpi"'));
  });

  it('a fine duello compaiono i pulsanti di rigioco', () => {
    const m: ModelloDuello = { ...modello('scena'), fine: { esito: 'Vittoria', righe: ['Turni: 3'] } };
    const h = html(m);
    assert.ok(h.includes('rigioca-stesso') && h.includes('rigioca-nuovo') && !h.includes('data-azione="scegli"'));
  });
});

describe('layout griglia', () => {
  it('Conferma è disattivata senza selezione e le posture non disponibili sono disattivate', () => {
    const s = creaDuello('bruto', 1);
    s.giocatore.fiato = 0;
    const h = html(modello('griglia', s, null));
    assert.ok(/data-azione="conferma" disabled/.test(h));
    assert.ok(/data-id="assalto" disabled/.test(h));
  });

  it('ogni pulsante porta icona, nome e costo; l\'hint usa l\'icona a 44 px', () => {
    const h = html(modello('griglia', creaDuello('bruto', 1), 'guardia'));
    assert.ok(h.includes('width="44" height="44"'));
    assert.ok(h.includes('costo 1 fiato') && h.includes('gratis'));
  });
});

describe('sagome (C2a)', () => {
  it('restituisce un SVG per ogni id (altezza di riferimento 120: riquadro 200 × 164) e specchia il nemico', () => {
    for (const id of ['viandante.assalto', 'viandante.guardia', 'viandante.attesa', 'viandante.distanza', 'recluta', 'duellante', 'bruto', 'lanciere', 'mietitore']) {
      const s = sagoma(id, { px: 120 });
      assert.ok(sagoma(id, { px: 120, specchia: true }).includes('scale(-1 1)'), id);
      assert.ok(s.startsWith('<svg') && s.includes('height="164"') && s.includes('currentColor'), id);
    }
  });
});

describe('fiato previsto (ARENA_SPEC §13.2)', () => {
  const conta = (s: string, re: RegExp): number => (s.match(re) ?? []).length;

  it('senza selezione i pallini mostrano il fiato attuale, senza etichetta', () => {
    const h = html(modello('scena'));
    assert.ok(!h.includes('class="prev"'));
    assert.strictEqual(conta(h, /icona incerto/g), 0);
  });

  it('con una postura selezionata: pieni fino al minimo, tratteggiati fino al massimo, il resto vuoti', () => {
    const s = statoProva('L1', 'guardia'); // Attesa contro un colpo leggero: fiato finale da 2 a 4
    const h = html(modello('scena', s, 'attesa'));
    assert.strictEqual(conta(h, /icona incerto/g), 2);
    const pallini = /<span class="fiato previsto"[^>]*>([\s\S]*?)<span class="prev">/.exec(h)?.[1] ?? '';
    assert.strictEqual(conta(pallini, /<svg class="icona"/g) + conta(pallini, /icona incerto/g), 6, 'sei pallini in tutto');
    assert.ok(pallini.indexOf('icona incerto') > pallini.indexOf('<svg class="icona"'), 'prima i pieni');
  });

  it("in entrambi i layout compare l'etichetta della previsione quando c'è una selezione", () => {
    const s = statoProva('L1', 'guardia');
    for (const layout of ['scena', 'griglia'] as const) {
      const h = html(modello(layout, s, 'attesa'));
      assert.ok(h.includes('class="prev">4 → 2–4<'), layout);
      assert.ok(h.includes('a fine turno tra 2 e 4'), layout);
    }
  });

  it("se il fiato previsto è certo, l'etichetta è '4 → 3' e non ci sono pallini tratteggiati", () => {
    const s = statoProva('D', 'guardia');
    const h = html(modello('scena', s, 'assalto')); // cambio −1, recupero 0: 4 → 3
    assert.ok(h.includes('class="prev">4 → 3<'));
    assert.strictEqual(conta(h, /icona incerto/g), 0);
  });
});
