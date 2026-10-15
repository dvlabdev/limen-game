// Strumenti comuni ai controlli automatici dell'Audit (docs/AUDIT_PROTOCOL.md §4.1).
// Solo Node e l'API pubblica di src/. I valori attesi vengono dai documenti, mai dai test di Codice.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

export type Gravita = 'Bloccante' | 'Maggiore' | 'Minore' | 'Osservazione';
export type Gate = 'G0' | 'G1' | 'G2' | 'G3' | 'G4';

export interface Voce {
  gravita: Gravita;
  testo: string;
  riferimento?: string;
  evidenza?: string;
}

export interface Esito {
  voci: Voce[]; // scostamenti trovati
  note: string[]; // verifiche superate e informazioni
  dati?: unknown;
}

export interface Controllo {
  id: string;
  titolo: string;
  riferimento: string;
  gates: Gate[];
  esegui: () => Esito | Promise<Esito>;
}

export const RADICE = resolve(fileURLToPath(import.meta.url), '..', '..', '..');

export function leggi(rel: string): string {
  return readFileSync(join(RADICE, rel), 'utf8');
}

export function esiste(rel: string): boolean {
  return existsSync(join(RADICE, rel));
}

export function elenca(rel: string): string[] {
  return readdirSync(join(RADICE, rel));
}

export function commit(): string {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: RADICE }).toString().trim();
  } catch {
    return 'sconosciuto';
  }
}

// Cerca un'espressione in un file e restituisce "file:riga" delle occorrenze.
export function righe(rel: string, re: RegExp): string[] {
  const out: string[] = [];
  leggi(rel)
    .split(/\r?\n/)
    .forEach((r, i) => {
      if (re.test(r)) out.push(`${rel}:${i + 1}`);
    });
  return out;
}

// Estrae una sezione markdown a partire da un titolo (incluso) fino al titolo successivo di livello ≤.
export function sezione(testo: string, titolo: RegExp): string {
  const r = testo.split(/\r?\n/);
  const i = r.findIndex((x) => /^#+ /.test(x) && titolo.test(x));
  if (i < 0) return '';
  const livello = (r[i] as string).match(/^#+/)?.[0].length ?? 1;
  let j = i + 1;
  while (j < r.length) {
    const m = (r[j] as string).match(/^(#+) /);
    if (m && (m[1] as string).length <= livello) break;
    j++;
  }
  return r.slice(i, j).join('\n');
}

// Righe di tabella markdown di una sezione, come array di celle ripulite.
export function tabella(testo: string): string[][] {
  return testo
    .split(/\r?\n/)
    .filter((r) => /^\|/.test(r) && !/^\|\s*-/.test(r))
    .map((r) =>
      r
        .replace(/^\||\|$/g, '')
        .split('|')
        .map((c) => c.trim()),
    );
}

export function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
