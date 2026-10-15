// A08 · Simulatore: rilancio a seed fisso (1000 duelli, seed 1), confronto con gli obiettivi di
// ARENA_SPEC §9 e §12.4 (con §12.1 2, §12.6 e §12.7 AUD-012) e con i numeri dichiarati in ARENA_REPORT §8.1 (±2 punti).
// Le tabelle informative di §7.4b/§7.4c (gradi 3, adattamento spento) sono storiche e non ridichiarate dopo C2: si rilanciano senza confronto.
// Inoltre: robustezza degli obiettivi su altri seed e un `lettore` riscritto dall'Audit dal testo di R8.
import type { Controllo, Esito } from './comune.ts';
import { leggi, sezione, tabella } from './comune.ts';
import { simula, POLITICHE } from '../../sim/run.ts';
import type { Politica, Risultato } from '../../sim/run.ts';
import type { DuelView } from '../../src/core/view.ts';
import type { PosturaId } from '../../src/core/types.ts';

const NEMICI = ['recluta', 'duellante', 'bruto', 'lanciere', 'mietitore'];
const NOMI: Record<string, string> = { recluta: 'Recluta', duellante: 'Duellante', bruto: 'Bruto', lanciere: 'Lanciere', mietitore: 'Mietitore' };
const TOLL = 2; // punti percentuali (AUDIT_PROTOCOL A08)

interface Config { nome: string; gradi: 1 | 2 | 3; adattamento: boolean; sezione?: RegExp }
const CONFIG: Config[] = [
  { nome: 'obiettivi (gradi 1, adattamento on)', gradi: 1, adattamento: true, sezione: /^### 8\.1/ },
  { nome: 'informativa (gradi 3, adattamento on)', gradi: 3, adattamento: true },
  { nome: 'informativa (gradi 1, adattamento off)', gradi: 1, adattamento: false },
];

function tabellaReport(re: RegExp): Map<string, { v: number; p: number; t: number }> {
  const out = new Map<string, { v: number; p: number; t: number }>();
  const tutte = tabella(sezione(leggi('docs/ARENA_REPORT.md'), re));
  const i0 = tutte.findIndex((r) => r[0] === 'Nemico');
  const righe = i0 >= 0 ? tutte.slice(i0) : [];
  const intest = righe[0] ?? [];
  for (const r of righe.slice(1)) {
    const nemico = (r[0] ?? '').toLowerCase();
    r.slice(1).forEach((cella, i) => {
      const m = cella.replace(/\*\*/g, '').match(/([\d.]+)\s*\(([\d.]+)\)\s*·\s*([\d.]+)/);
      if (m) out.set(`${nemico}|${intest[i + 1]}`, { v: Number(m[1]), p: Number(m[2]), t: Number(m[3]) });
    });
  }
  return out;
}

// `lettore` dell'Audit, dal testo di §12.2 R8. Ordine: 1, poi 3 (che altrimenti non scatterebbe mai), poi 2, poi 4.
const lettoreAudit: Politica = (v: DuelView) => {
  const p = (id: PosturaId) => v.posture.find((x) => x.id === id);
  const attuale = (v.posture.find((x) => x.attiva)?.id ?? 'guardia') as PosturaId;
  const ok = (id: PosturaId) => !!p(id)?.disponibile;
  const scegli = (id: PosturaId): PosturaId => (ok(id) ? id : ok(attuale) ? attuale : 'guardia');
  if (v.giocatore.vantaggio) return scegli('assalto');
  const h = v.hint.categoria;
  if (v.giocatore.preparato && h !== 'pesante') return scegli('assalto');
  switch (h) {
    case 'pesante': {
      const costo = p('attesa')?.costo ?? 1; // "se il fiato basta (cambio più schivata)"
      if (ok('attesa') && v.giocatore.fiato >= costo + 2) return 'attesa';
      if (ok('distanza')) return 'distanza';
      return scegli('guardia');
    }
    case 'leggero':
      return scegli('guardia');
    case 'difesa':
      return v.giocatore.fiato >= 2 ? scegli('attesa') : scegli('guardia');
    case 'preparazione':
      return scegli('assalto');
  }
};

export const controllo: Controllo = {
  id: 'A08',
  titolo: 'Simulatore: obiettivi e numeri del report',
  riferimento: 'ARENA_SPEC §9, §11, §12.4, §12.6; ARENA_REPORT §8.1',
  gates: ['G2'],
  esegui(): Esito {
    const esito: Esito = { voci: [], note: [] };
    const tutti: Record<string, Risultato[]> = {};
    for (const c of CONFIG) {
      const ris: Risultato[] = [];
      for (const n of NEMICI) for (const pol of POLITICHE) ris.push(simula(n, pol, { duelli: 1000, gradi: c.gradi, adattamento: c.adattamento, seed: 1 }));
      tutti[c.nome] = ris;
      if (!c.sezione) {
        esito.note.push(`${c.nome}: rilanciata senza confronto (tabella storica del §7.4, non ridichiarata nel §8).`);
        continue;
      }
      const rep = tabellaReport(c.sezione);
      let confrontate = 0;
      const scarti: string[] = [];
      for (const r of ris) {
        const d = rep.get(`${NOMI[r.nemico]?.toLowerCase()}|${r.politica}`);
        if (!d) {
          scarti.push(`${r.nemico}/${r.politica}: cella assente nel report`);
          continue;
        }
        confrontate++;
        if (Math.abs(d.v - r.percVittorie) > TOLL || Math.abs(d.p - r.percPareggi) > TOLL || Math.abs(d.t - r.turniMedi) > 0.15) {
          scarti.push(`${r.nemico}/${r.politica}: report ${d.v} (${d.p}) · ${d.t}, rilancio ${r.percVittorie.toFixed(1)} (${r.percPareggi.toFixed(1)}) · ${r.turniMedi.toFixed(1)}`);
        }
      }
      if (scarti.length) esito.voci.push({ gravita: 'Maggiore', testo: `Report §8.1 ${c.nome}: ${scarti.length} celle fuori tolleranza: ${scarti.slice(0, 6).join('; ')}`, riferimento: 'ARENA_REPORT §8.1; AUDIT_PROTOCOL A08', evidenza: 'node audit/run.ts --solo A08' });
      esito.note.push(`${c.nome}: ${confrontate} celle confrontate con il report, ${scarti.length} fuori tolleranza (±${TOLL} punti, ±0,15 turni).`);
    }

    // Obiettivi (§9, §12.4) sulla configurazione di riferimento.
    const base = tutti[CONFIG[0]!.nome] as Risultato[];
    const r = (n: string, p: string) => base.find((x) => x.nemico === n && x.politica === p) as Risultato;
    const obiettivi: Array<[string, boolean, string]> = [];
    const ob = (testo: string, vero: boolean, valore: string) => obiettivi.push([testo, vero, valore]);
    ob('lettore ≥ 90% contro la Recluta', r('recluta', 'lettore').percVittorie >= 90, r('recluta', 'lettore').percVittorie.toFixed(1));
    for (const n of ['duellante', 'bruto', 'lanciere']) {
      const x = r(n, 'lettore').percVittorie;
      ob(`lettore 60–85% contro ${n}`, x >= 60 && x <= 85, x.toFixed(1));
    }
    const mx = r('mietitore', 'lettore').percVittorie;
    ob('lettore 35–65% contro il Mietitore', mx >= 35 && mx <= 65, mx.toFixed(1));
    for (const n of ['duellante', 'bruto', 'lanciere', 'mietitore']) {
      for (const p of ['assalto', 'guardia', 'attesa', 'distanza']) {
        const x = r(n, `fissa:${p}`).percVittorie;
        ob(`fissa:${p} < 25% contro ${n}`, x < 25, x.toFixed(1));
      }
      const c = r(n, 'casuale').percVittorie;
      ob(`casuale < 30% contro ${n}`, c < 30, c.toFixed(1));
    }
    for (const n of NEMICI) {
      const d = r(n, 'fissa:distanza');
      // §12.4 vale per "ogni nemico"; §12.6 1 esclude la Recluta (applicato in C2): per lei si registra solo che non vince.
      if (n === 'recluta') {
        ob('fissa:distanza contro la Recluta: esclusa dal vincolo (§12.6 1), controllo informativo: vittorie < 25%', d.percVittorie < 25, `${d.percVittorie.toFixed(1)} (${d.percPareggi.toFixed(1)})`);
        continue;
      }
      ob(`fissa:distanza < 25% vittorie e < 50% pareggi contro ${n}`, d.percVittorie < 25 && d.percPareggi < 50, `${d.percVittorie.toFixed(1)} (${d.percPareggi.toFixed(1)})`);
    }
    for (const n of ['recluta', 'duellante', 'bruto']) {
      const t = r(n, 'lettore').turniMedi;
      ob(`turni medi lettore 4–8 contro ${n}`, t >= 4 && t <= 8, t.toFixed(1));
    }
    const tl = r('lanciere', 'lettore').turniMedi;
    ob('turni medi lettore contro il Lanciere: 4–9 (§12.6 2)', tl >= 4 && tl <= 9, tl.toFixed(1));
    const tm = r('mietitore', 'lettore').turniMedi;
    ob('turni medi lettore ≤ 14 contro il Mietitore', tm <= 14, tm.toFixed(1));
    const mancati = obiettivi.filter((o) => !o[1]);
    for (const [t, , v] of mancati) esito.voci.push({ gravita: 'Maggiore', testo: `Obiettivo mancato: ${t} (rilancio: ${v})`, riferimento: 'ARENA_SPEC §9, §12.4', evidenza: 'node audit/run.ts --solo A08' });
    esito.note.push(`Obiettivi §9/§12.4: ${obiettivi.length - mancati.length}/${obiettivi.length} rispettati con seed 1.`);
    if (tl > 8) esito.note.push(`Lanciere: ${tl.toFixed(1)} turni, fuori da 4–8 della 1.1 ma dentro 4–9 di §12.6 2 (accettato da Planning).`);

    // Robustezza: gli stessi obiettivi "< 25%" con altri seed (gli obiettivi non fissano il seed).
    const margini: string[] = [];
    const celleStrette: Array<[string, string]> = [];
    for (const n of ['duellante', 'bruto', 'lanciere', 'mietitore']) for (const p of ['assalto', 'guardia', 'attesa', 'distanza']) if (r(n, `fissa:${p}`).percVittorie >= 20) celleStrette.push([n, `fissa:${p}`]);
    const seeds = [9000, 20001, 31337, 777777];
    for (const [n, p] of celleStrette) {
      const pol = POLITICHE.find((x) => x.nome === p)!;
      const valori = seeds.map((s) => simula(n, pol, { duelli: 1000, gradi: 1, adattamento: true, seed: s }).percVittorie);
      margini.push(`${n}/${p}: seed 1 ${r(n, p).percVittorie.toFixed(1)}; ${seeds.map((s, i) => `seed ${s} ${valori[i]!.toFixed(1)}`).join(', ')}`);
      // §12.7 AUD-012: riferimento seed 1; con altri seed è accettato uno scarto fino a +2 punti sulle soglie fissa:* (25 + 2).
      const sopra = valori.filter((x) => x >= 27).length;
      if (sopra) esito.voci.push({ gravita: 'Osservazione', testo: `Obiettivo "< 25%" oltre la tolleranza di +2 punti (§12.7 AUD-012): ${n}/${p} supera il 27% con ${sopra} seed su ${seeds.length} (${valori.map((x) => x.toFixed(1)).join(', ')})`, riferimento: 'ARENA_SPEC §12.4, §12.7 AUD-012', evidenza: 'node audit/run.ts --solo A08' });
    }
    if (margini.length) esito.note.push(`Celle con margine stretto (≥ 20%) rilanciate su altri seed: ${margini.join(' | ')}`);

    // lettore dell'Audit contro lettore di sim/run.ts.
    const diff: string[] = [];
    for (const n of NEMICI) {
      const a = simula(n, { nome: 'lettore-audit', scegli: lettoreAudit }, { duelli: 1000, gradi: 1, adattamento: true, seed: 1 });
      const b = r(n, 'lettore');
      if (a.vittorie !== b.vittorie || a.pareggi !== b.pareggi || a.turniMedi !== b.turniMedi) diff.push(`${n}: Audit ${a.percVittorie.toFixed(1)} · ${a.turniMedi.toFixed(2)}, sim ${b.percVittorie.toFixed(1)} · ${b.turniMedi.toFixed(2)}`);
    }
    if (diff.length) esito.voci.push({ gravita: 'Minore', testo: `Il lettore di sim/run.ts non coincide con R8 riletto dall'Audit: ${diff.join('; ')}`, riferimento: 'ARENA_SPEC §12.2 R8', evidenza: 'sim/run.ts:49' });
    else esito.note.push('Il lettore riscritto dall\'Audit da R8 dà risultati identici a quello di sim/run.ts (1000 duelli × 5 nemici).');
    esito.dati = { obiettivi, celleStrette: margini };
    return esito;
  },
};
