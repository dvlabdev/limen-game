// A01 · Purezza del core: niente Math.random, Date, document, window, localStorage o performance in src/core/.
import type { Controllo, Esito } from './comune.ts';
import { elenca, leggi } from './comune.ts';

const VIETATI: Array<[string, RegExp]> = [
  ['Math.random', /\bMath\.random\b/],
  ['Date', /\bDate\b/],
  ['document', /\bdocument\b/],
  ['window', /\bwindow\b/],
  ['localStorage', /\blocalStorage\b/],
  ['performance', /\bperformance\b/],
  ['globalThis', /\bglobalThis\b/],
  ['setTimeout/setInterval', /\bset(Timeout|Interval)\b/],
  ['import da src/ui', /from ['"]\.\.\/ui\//],
];

// Toglie i commenti, così una parola in un commento non conta come uso.
function senzaCommenti(s: string): string {
  return s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

export const controllo: Controllo = {
  id: 'A01',
  titolo: 'Purezza del core',
  riferimento: 'CLAUDE.md §Codice; ARENA_SPEC §2',
  gates: ['G1'],
  esegui(): Esito {
    const esito: Esito = { voci: [], note: [] };
    for (const dir of ['src/core', 'src/data']) {
      for (const f of elenca(dir).filter((x) => x.endsWith('.ts'))) {
        const rel = `${dir}/${f}`;
        const righe = senzaCommenti(leggi(rel)).split(/\r?\n/);
        for (const [nome, re] of VIETATI) {
          righe.forEach((r, i) => {
            if (re.test(r)) {
              esito.voci.push({
                gravita: dir === 'src/core' ? 'Bloccante' : 'Maggiore',
                testo: `Uso vietato di ${nome} in ${dir}`,
                riferimento: 'CLAUDE.md §Codice: src/core è puro',
                evidenza: `${rel}:${i + 1}`,
              });
            }
          });
        }
      }
    }
    if (esito.voci.length === 0) esito.note.push('Nessun uso vietato in src/core né in src/data (commenti esclusi).');
    return esito;
  },
};
