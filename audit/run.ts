// Esegue i controlli automatici dell'Audit (docs/AUDIT_PROTOCOL.md §4.1).
// Uso: node audit/run.ts [--gate G1|G2|G3|G4] [--solo A05,A06] [--etichetta C2]
// Scrive audit/out/<data>-<gate>.json; esce con codice 1 se c'è almeno un rilievo Bloccante.
import { mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Controllo, Esito, Gate, Gravita } from './checks/comune.ts';
import { RADICE, commit } from './checks/comune.ts';

const ORDINE: Gravita[] = ['Bloccante', 'Maggiore', 'Minore', 'Osservazione'];

function argomento(nome: string): string | undefined {
  const i = process.argv.indexOf(nome);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const gate = argomento('--gate') as Gate | undefined;
const solo = argomento('--solo')?.split(',').map((x) => x.trim().toUpperCase());

const cartella = join(RADICE, 'audit', 'checks');
const moduli = readdirSync(cartella).filter((f) => /^[ab]\d\d.*\.ts$/.test(f)).sort();
const controlli: Controllo[] = [];
for (const f of moduli) {
  const m = (await import(pathToFileURL(join(cartella, f)).href)) as { controllo?: Controllo };
  if (m.controllo) controlli.push(m.controllo);
}

const scelti = controlli.filter((c) => (!gate || c.gates.includes(gate)) && (!solo || solo.includes(c.id.toUpperCase())));
if (gate === 'G0') console.log('G0 è un cancello di giudizio (B02, B03, catalogo): nessun controllo automatico.');

const risultati: Array<{ id: string; titolo: string; riferimento: string; gates: Gate[]; ms: number } & Esito> = [];
for (const c of scelti) {
  const t0 = performance.now();
  let e: Esito;
  try {
    e = await c.esegui();
  } catch (err) {
    e = { voci: [{ gravita: 'Bloccante', testo: `Il controllo è fallito con un'eccezione: ${(err as Error).stack ?? String(err)}` }], note: [] };
  }
  const ms = Math.round(performance.now() - t0);
  risultati.push({ id: c.id, titolo: c.titolo, riferimento: c.riferimento, gates: c.gates, ms, ...e });
  const conta = ORDINE.map((g) => [g, e.voci.filter((v) => v.gravita === g).length] as const).filter(([, n]) => n > 0);
  const stato = e.voci.length === 0 ? 'OK' : conta.map(([g, n]) => `${n} ${g}`).join(', ');
  console.log(`\n${c.id} · ${c.titolo} (${ms} ms): ${stato}`);
  for (const n of e.note) console.log(`   · ${n}`);
  for (const v of [...e.voci].sort((a, b) => ORDINE.indexOf(a.gravita) - ORDINE.indexOf(b.gravita))) {
    console.log(`   ✗ [${v.gravita}] ${v.testo}${v.evidenza ? ` (${v.evidenza})` : ''}`);
  }
}

const tutte = risultati.flatMap((r) => r.voci);
const totali = Object.fromEntries(ORDINE.map((g) => [g, tutte.filter((v) => v.gravita === g).length]));
const data = new Date().toISOString().slice(0, 10);
// Con --etichetta C2 il file diventa 2026-10-15-C2-G3.json: le tornate dello stesso giorno non si sovrascrivono.
const etichetta = argomento('--etichetta');
const nome = `${data}-${etichetta ? etichetta + '-' : ''}${gate ?? 'tutti'}${solo ? '-' + solo.join('_') : ''}.json`;
mkdirSync(join(RADICE, 'audit', 'out'), { recursive: true });
writeFileSync(
  join(RADICE, 'audit', 'out', nome),
  JSON.stringify({ data, commit: commit(), gate: gate ?? 'tutti', node: process.version, totali, controlli: risultati }, null, 2) + '\n',
);
console.log(`\nTotale: ${ORDINE.map((g) => `${totali[g]} ${g}`).join(' · ')} → audit/out/${nome}`);
process.exitCode = (totali['Bloccante'] ?? 0) > 0 ? 1 : 0;
