// A09 · Build a file singolo: dist/index.html esiste, non richiama risorse esterne ed è aggiornato.
// La build si rifà in memoria con costruisciHtml (scripts/build.ts) senza scrivere su disco.
import type { Controllo, Esito, Voce } from './comune.ts';
import { esiste, leggi } from './comune.ts';
import { costruisciHtml } from '../../scripts/build.ts';

function esterni(html: string): string[] {
  const trovati: string[] = [];
  for (const m of html.matchAll(/<(script|link|img|iframe|source|audio|video)\b[^>]*\b(src|href)\s*=\s*["']?([^"'\s>]+)/gi)) trovati.push(`${m[1]} ${m[2]}=${m[3]}`);
  for (const m of html.matchAll(/@import\s+(url\()?["']?([^"');]+)/gi)) trovati.push(`@import ${m[2]}`);
  for (const m of html.matchAll(/url\(\s*["']?(https?:|\/\/)[^)]*\)/gi)) trovati.push(m[0]);
  return trovati;
}

export const controllo: Controllo = {
  id: 'A09',
  titolo: 'Build a file singolo',
  riferimento: 'ARENA_SPEC §1; DESIGN §1.4',
  gates: ['G3'],
  async esegui(): Promise<Esito> {
    const esito: Esito = { voci: [], note: [] };
    const voci: Voce[] = esito.voci;
    if (!esiste('dist/index.html')) {
      voci.push({ gravita: 'Bloccante', testo: 'dist/index.html non esiste', riferimento: 'ARENA_SPEC §1', evidenza: 'npm run build' });
    } else {
      const dist = leggi('dist/index.html');
      const e = esterni(dist);
      if (e.length) voci.push({ gravita: 'Bloccante', testo: `dist/index.html richiama risorse esterne: ${e.join(', ')}`, riferimento: 'ARENA_SPEC §1', evidenza: 'dist/index.html' });
      else esito.note.push(`dist/index.html: ${(dist.length / 1024).toFixed(1)} KB, nessun src/href/@import verso risorse esterne.`);
      try {
        const nuova = await costruisciHtml(true);
        const en = esterni(nuova);
        if (en.length) voci.push({ gravita: 'Bloccante', testo: `La build di HEAD richiama risorse esterne: ${en.join(', ')}`, riferimento: 'ARENA_SPEC §1', evidenza: 'scripts/build.ts' });
        // Dalla C2 la build contiene versione e data (ARENA_S23_SPEC §6): si confronta il resto, e si annota la versione.
        const RE_VERSIONE = /commit:"([^"]*)",data:"([^"]*)"/;
        const vd = dist.match(RE_VERSIONE);
        const vn = nuova.match(RE_VERSIONE);
        const senzaVersione = (t: string) => t.replace(RE_VERSIONE, 'commit:"",data:""');
        if (senzaVersione(nuova) !== senzaVersione(dist)) voci.push({ gravita: 'Minore', testo: `dist/index.html non coincide con la build del commit corrente neppure ignorando versione e data (va rigenerato con npm run build)`, riferimento: 'ARENA_SPEC §10 F4', evidenza: 'dist/index.html' });
        else if (vd && vn && vd[1] === vn[1]) esito.note.push(`dist/index.html coincide con la build in memoria del commit corrente (versione ${vd[1]}).`);
        else esito.note.push(`dist/index.html coincide con la build del commit corrente salvo versione e data (dist: ${vd?.[1]} ${vd?.[2]}; HEAD: ${vn?.[1]} ${vn?.[2]}); è un file locale, non tracciato.`);
        if (!vn || !/Versione /.test(nuova)) voci.push({ gravita: 'Maggiore', testo: 'La versione della build non è visibile nel menu (ARENA_S23_SPEC §7.4)', riferimento: 'ARENA_S23_SPEC §6, §7 punto 4', evidenza: 'scripts/build.ts, src/ui' });
        if (!/<script>/.test(nuova) || !/<style>/.test(nuova)) voci.push({ gravita: 'Bloccante', testo: 'JS o CSS non inline nella build', riferimento: 'ARENA_SPEC §1' });
      } catch (err) {
        voci.push({ gravita: 'Bloccante', testo: `Build in memoria fallita: ${(err as Error).message}`, riferimento: 'ARENA_SPEC §1', evidenza: 'scripts/build.ts' });
      }
    }
    return esito;
  },
};
