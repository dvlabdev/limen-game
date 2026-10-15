// Simulatore con bot (ARENA_SPEC §9).
// Uso: npm run sim -- --duelli 1000 --gradi 1 [--adattamento on|off] [--seed N]
// I bot usano solo ciò che vede il giocatore: la DuelView (categoria dell'hint e valori di entrambi).
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PosturaId } from '../src/core/types.ts';
import { ORDINE_NEMICI } from '../src/data/enemies.ts';
import { ORDINE_POSTURE } from '../src/data/postures.ts';
import { creaDuello, resolveTurn } from '../src/core/resolve.ts';
import { estrai } from '../src/core/rng.ts';
import { toDuelView } from '../src/core/view.ts';
import type { DuelView } from '../src/core/view.ts';

export type Politica = (v: DuelView, caso: { rng: number }) => PosturaId;

function disponibili(v: DuelView): PosturaId[] {
  return v.posture.filter((p) => p.disponibile).map((p) => p.id);
}

function postureAttuale(v: DuelView): PosturaId {
  return (v.posture.find((p) => p.attiva)?.id ?? 'guardia') as PosturaId;
}

// Non cambia mai postura. Il primo turno paga il cambio, se serve.
export function fissa(p: PosturaId): Politica {
  return (v) => (v.posture.find((x) => x.id === p)?.disponibile ? p : postureAttuale(v));
}

export const casuale: Politica = (v, caso) => {
  const d = disponibili(v);
  return d[Math.floor(estrai(caso) * d.length)] as PosturaId;
};

// Euristica di riferimento: legge l'hint e gestisce il fiato.
export const lettore: Politica = (v) => {
  let scelta: PosturaId;
  if (v.giocatore.vantaggio) scelta = 'assalto';
  else {
    switch (v.hint.categoria) {
      case 'pesante': {
        const costoAttesa = postureAttuale(v) === 'attesa' ? 0 : 1;
        scelta = v.giocatore.fiato >= costoAttesa + 2 ? 'attesa' : 'distanza';
        break;
      }
      case 'leggero':
        scelta = 'guardia';
        break;
      case 'difesa':
        scelta = v.giocatore.fiato < 3 ? 'distanza' : 'guardia';
        break;
      case 'preparazione':
        scelta = 'assalto';
        break;
    }
  }
  return disponibili(v).includes(scelta) ? scelta : postureAttuale(v);
};

export const POLITICHE: Array<{ nome: string; scegli: Politica }> = [
  ...ORDINE_POSTURE.map((p) => ({ nome: `fissa:${p}`, scegli: fissa(p) })),
  { nome: 'casuale', scegli: casuale },
  { nome: 'lettore', scegli: lettore },
];

export interface Risultato {
  nemico: string;
  politica: string;
  duelli: number;
  vittorie: number;
  sconfitte: number;
  pareggi: number;
  percVittorie: number;
  percPareggi: number;
  turniMedi: number;
  turniMediVittorie: number;
}

export interface Parametri {
  duelli: number;
  gradi: 1 | 2 | 3;
  adattamento: boolean;
  seed: number;
}

export function simula(nemico: string, politica: { nome: string; scegli: Politica }, par: Parametri): Risultato {
  let vittorie = 0;
  let sconfitte = 0;
  let pareggi = 0;
  let turni = 0;
  let turniVittorie = 0;
  for (let i = 0; i < par.duelli; i++) {
    const seed = par.seed + i;
    let stato = creaDuello(nemico, seed, { adattamento: par.adattamento }, { parata: par.gradi, schivata: par.gradi });
    const caso = { rng: (seed * 2654435761) | 0 }; // caso dei bot, separato da quello del duello
    while (stato.esito === 'in corso') {
      const v = toDuelView(stato);
      stato = resolveTurn(stato, politica.scegli(v, caso)).stato;
    }
    turni += stato.turno;
    if (stato.esito === 'vittoria') {
      vittorie++;
      turniVittorie += stato.turno;
    } else if (stato.esito === 'sconfitta') sconfitte++;
    else pareggi++;
  }
  return {
    nemico,
    politica: politica.nome,
    duelli: par.duelli,
    vittorie,
    sconfitte,
    pareggi,
    percVittorie: (100 * vittorie) / par.duelli,
    percPareggi: (100 * pareggi) / par.duelli,
    turniMedi: turni / par.duelli,
    turniMediVittorie: vittorie ? turniVittorie / vittorie : 0,
  };
}

function leggiArgomenti(argv: string[]): Parametri {
  const par: Parametri = { duelli: 1000, gradi: 1, adattamento: true, seed: 1 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const val = argv[i + 1];
    if (a === '--duelli' && val) par.duelli = Math.max(1, parseInt(val, 10));
    else if (a === '--gradi' && val) par.gradi = Math.min(3, Math.max(1, parseInt(val, 10))) as 1 | 2 | 3;
    else if (a === '--adattamento' && val) par.adattamento = val !== 'off';
    else if (a === '--seed' && val) par.seed = parseInt(val, 10);
    else continue;
    i++;
  }
  return par;
}

function stampaTabella(risultati: Risultato[], par: Parametri): void {
  console.log(
    `\nDuelli per cella: ${par.duelli} · gradi ${par.gradi} · adattamento ${par.adattamento ? 'on' : 'off'} · seed ${par.seed}`,
  );
  const politiche = POLITICHE.map((p) => p.nome);
  const colonna = (s: string, n: number) => s.padStart(n);
  console.log('\nVittorie % (pareggi %) · turni medi');
  console.log('nemico'.padEnd(11) + politiche.map((p) => colonna(p, 20)).join(''));
  for (const n of ORDINE_NEMICI) {
    let riga = n.padEnd(11);
    for (const p of politiche) {
      const r = risultati.find((x) => x.nemico === n && x.politica === p) as Risultato;
      riga += colonna(`${r.percVittorie.toFixed(1)} (${r.percPareggi.toFixed(1)}) · ${r.turniMedi.toFixed(1)}`, 20);
    }
    console.log(riga);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const par = leggiArgomenti(process.argv.slice(2));
  const risultati: Risultato[] = [];
  for (const n of ORDINE_NEMICI) for (const p of POLITICHE) risultati.push(simula(n, p, par));
  stampaTabella(risultati, par);
  const cartella = resolve(fileURLToPath(import.meta.url), '..', '..', 'sim-out');
  mkdirSync(cartella, { recursive: true });
  writeFileSync(resolve(cartella, 'report.json'), JSON.stringify({ parametri: par, risultati }, null, 2));
  console.log('\nsim-out/report.json scritto');
}
