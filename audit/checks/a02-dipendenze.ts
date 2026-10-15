// A02 · Dipendenze: nessuna `dependencies`; `devDependencies` contenute in {typescript, esbuild}.
import type { Controllo, Esito } from './comune.ts';
import { leggi } from './comune.ts';

export const controllo: Controllo = {
  id: 'A02',
  titolo: 'Dipendenze',
  riferimento: 'ARENA_SPEC §1; CLAUDE.md §Codice',
  gates: ['G1'],
  esegui(): Esito {
    const esito: Esito = { voci: [], note: [] };
    const pkg = JSON.parse(leggi('package.json')) as Record<string, Record<string, string> | undefined>;
    const dip = Object.keys(pkg['dependencies'] ?? {});
    const dev = Object.keys(pkg['devDependencies'] ?? {});
    const altre = ['peerDependencies', 'optionalDependencies'].flatMap((k) => Object.keys(pkg[k] ?? {}));
    if (dip.length) esito.voci.push({ gravita: 'Bloccante', testo: `dependencies non ammesse: ${dip.join(', ')}`, riferimento: 'ARENA_SPEC §1', evidenza: 'package.json' });
    if (altre.length) esito.voci.push({ gravita: 'Bloccante', testo: `Altre dipendenze: ${altre.join(', ')}`, riferimento: 'ARENA_SPEC §1', evidenza: 'package.json' });
    const fuori = dev.filter((d) => d !== 'typescript' && d !== 'esbuild');
    if (fuori.length) esito.voci.push({ gravita: 'Bloccante', testo: `devDependencies fuori elenco: ${fuori.join(', ')}`, riferimento: 'ARENA_SPEC §1', evidenza: 'package.json' });
    esito.note.push(`devDependencies: ${dev.map((d) => `${d}@${pkg['devDependencies']?.[d]}`).join(', ')}`);
    const engines = (pkg['engines'] as Record<string, string> | undefined)?.['node'];
    if (!engines || !/>=\s*24/.test(engines)) esito.voci.push({ gravita: 'Minore', testo: `engines.node non dichiara Node 24+: ${engines ?? 'assente'}`, riferimento: 'ARENA_SPEC §1', evidenza: 'package.json' });
    else esito.note.push(`engines.node ${engines}`);
    const scripts = pkg['scripts'] ?? {};
    for (const s of ['dev', 'build', 'test', 'typecheck', 'sim']) {
      if (!scripts[s]) esito.voci.push({ gravita: 'Maggiore', testo: `Script npm mancante: ${s}`, riferimento: 'ARENA_SPEC §1', evidenza: 'package.json' });
    }
    if (scripts['test'] && !/node --test/.test(scripts['test'])) esito.voci.push({ gravita: 'Minore', testo: 'Lo script test non usa node --test', riferimento: 'ARENA_SPEC §1', evidenza: 'package.json' });
    if (esito.voci.length === 0) esito.note.push('Nessuna dipendenza di runtime; script dev, build, test, typecheck e sim presenti.');
    return esito;
  },
};
