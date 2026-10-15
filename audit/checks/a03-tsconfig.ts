// A03 · Configurazione TS: strict, erasableSyntaxOnly, allowImportingTsExtensions, noEmit; niente enum né namespace.
import type { Controllo, Esito } from './comune.ts';
import { elenca, esiste, leggi } from './comune.ts';

function fileTs(dir: string): string[] {
  if (!esiste(dir)) return [];
  const out: string[] = [];
  for (const f of elenca(dir)) {
    const rel = `${dir}/${f}`;
    if (f.endsWith('.ts')) out.push(rel);
    else if (!f.includes('.')) out.push(...fileTs(rel));
  }
  return out;
}

export const controllo: Controllo = {
  id: 'A03',
  titolo: 'Configurazione TypeScript e sintassi cancellabile',
  riferimento: 'ARENA_SPEC §1; CLAUDE.md §Codice',
  gates: ['G1'],
  esegui(): Esito {
    const esito: Esito = { voci: [], note: [] };
    const tsc = JSON.parse(leggi('tsconfig.json')) as { compilerOptions: Record<string, unknown> };
    const o = tsc.compilerOptions;
    for (const k of ['strict', 'erasableSyntaxOnly', 'allowImportingTsExtensions', 'noEmit']) {
      if (o[k] !== true) esito.voci.push({ gravita: 'Bloccante', testo: `tsconfig: ${k} non è true`, riferimento: 'ARENA_SPEC §1', evidenza: 'tsconfig.json' });
    }
    if (String(o['target']).toUpperCase() !== 'ES2022') esito.voci.push({ gravita: 'Minore', testo: `target ${String(o['target'])} invece di ES2022`, riferimento: 'ARENA_SPEC §1', evidenza: 'tsconfig.json' });
    const lib = (o['lib'] as string[] | undefined)?.map((x) => x.toUpperCase()) ?? [];
    if (!lib.includes('ES2022') || !lib.includes('DOM')) esito.voci.push({ gravita: 'Minore', testo: `lib senza ES2022 + DOM: ${lib.join(', ')}`, riferimento: 'ARENA_SPEC §1', evidenza: 'tsconfig.json' });
    const mod = `${String(o['module'])}/${String(o['moduleResolution'])}`.toLowerCase();
    if (!/^(nodenext|bundler|preserve|esnext)\/(nodenext|bundler)$/.test(mod)) esito.voci.push({ gravita: 'Minore', testo: `module/moduleResolution: ${mod}`, riferimento: 'ARENA_SPEC §1', evidenza: 'tsconfig.json' });
    esito.note.push(`tsconfig: strict, erasableSyntaxOnly, allowImportingTsExtensions, noEmit verificati; module/moduleResolution ${mod}.`);

    const tutti = ['src', 'sim', 'scripts', 'test'].flatMap(fileTs);
    const vietati: Array<[string, RegExp]> = [
      ['enum', /^\s*(export\s+)?(const\s+)?enum\s/],
      ['namespace', /^\s*(export\s+)?(declare\s+)?namespace\s/],
      ['parameter property', /constructor\s*\([^)]*\b(public|private|protected|readonly)\s/],
      ['import senza estensione .ts', /^\s*import\s[^'"]*['"]\.{1,2}\/[^'"]*(?<!\.ts)['"]/],
    ];
    for (const rel of tutti) {
      leggi(rel)
        .split(/\r?\n/)
        .forEach((r, i) => {
          for (const [nome, re] of vietati) {
            if (re.test(r)) esito.voci.push({ gravita: nome.startsWith('import') ? 'Minore' : 'Bloccante', testo: `${nome} in ${rel}`, riferimento: 'CLAUDE.md §Codice', evidenza: `${rel}:${i + 1}` });
          }
        });
    }
    const trovati = esito.voci.filter((v) => v.evidenza !== 'tsconfig.json').length;
    esito.note.push(`${tutti.length} file .ts esaminati in src, sim, scripts e test: ${trovati} usi di sintassi non cancellabile o import senza .ts.`);
    if (!/"include"/.test(leggi('tsconfig.json'))) esito.voci.push({ gravita: 'Osservazione', testo: 'tsconfig senza include esplicito', evidenza: 'tsconfig.json' });
    return esito;
  },
};
