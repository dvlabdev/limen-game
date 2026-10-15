// B08 (parte automatica) · Simboli ↔ grammatica di UI_SPEC §3 e §7: viewBox 24, solo currentColor,
// niente testo, immagini, maschere, id o stili; bollino degli stati e anelli dei medaglioni con i raggi
// dichiarati; variante `piccolo` esattamente per i simboli con tagli (T); icone allineate al modulo;
// symbols.proposed.ts compila con --strict --erasableSyntaxOnly (UI_SPEC §9.1).
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import type { Controllo, Esito } from './comune.ts';
import { RADICE, elenca, leggi, sezione, tabella } from './comune.ts';
import { SIMBOLI } from '../../design/symbols.proposed.ts';

const BOLLINO = ['M1.5 12A10.5 10.5', 'M3 12A9 9', 'M3.7 12A8.3 8.3']; // UI_SPEC §3: disco r 10,5, filetto tra r 9 e r 8,3
const ANELLO = ['M0.5 12A11.5 11.5', 'M1.6 12A10.4 10.4']; // medaglione a riposo: r 11,5–10,4

export const controllo: Controllo = {
  id: 'B08a',
  titolo: 'Grammatica dei simboli (parte automatica di B08)',
  riferimento: 'UI_SPEC §2–§3, §7, §9',
  gates: ['G4'],
  esegui(): Esito {
    const esito: Esito = { voci: [], note: [] };
    const tab = tabella(sezione(leggi('docs/UI_SPEC.md'), /^## 7\./)).filter((r) => /^`/.test(r[0] ?? ''));
    const varianti = new Map(tab.map((r) => [(r[0] as string).replace(/`/g, ''), r[3] ?? '']));
    const icone = elenca('design/icons').filter((f) => f.endsWith('.svg'));
    let ok = 0;
    for (const f of icone) {
      const id = f.replace(/\.svg$/, '');
      const svg = leggi(`design/icons/${f}`);
      const errori: string[] = [];
      if (!/viewBox="0 0 24 24"/.test(svg)) errori.push('viewBox diverso da 0 0 24 24');
      if (!/<svg[^>]*fill="currentColor"/.test(svg)) errori.push('fill del contenitore non currentColor');
      const colori = [...svg.matchAll(/(fill|stroke)="([^"]+)"/g)].map((m) => m[2]).filter((c) => c !== 'currentColor' && c !== 'none');
      if (colori.length) errori.push(`colori: ${colori.join(', ')}`);
      if (/#[0-9a-f]{3,6}\b|rgb\(|hsl\(/i.test(svg)) errori.push('colore esplicito');
      if (/<(text|image|mask|use|style|font|linearGradient|radialGradient|filter)\b/i.test(svg)) errori.push('elemento vietato (testo, immagine, maschera, stile o sfumatura)');
      if (/\sid=|\sstyle=|opacity=/.test(svg)) errori.push('attributo id, style o opacity');
      const titolo = svg.match(/<title>([^<]*)<\/title>/)?.[1];
      if (titolo !== SIMBOLI[id]?.etichetta) errori.push(`title "${titolo}" diverso dall'etichetta "${SIMBOLI[id]?.etichetta}"`);
      const interno = svg.replace(/^<svg[^>]*>(<title>[^<]*<\/title>)?/, '').replace(/<\/svg>\s*$/, '');
      if (SIMBOLI[id] && interno !== SIMBOLI[id].svg) errori.push('contenuto diverso da design/symbols.proposed.ts');
      if (id.startsWith('stato.') && !BOLLINO.every((b) => svg.includes(b))) errori.push('bollino senza i raggi di UI_SPEC §3');
      if (id.endsWith('.medaglione') && !ANELLO.every((b) => svg.includes(b))) errori.push('anello del medaglione senza i raggi di UI_SPEC §3');
      if (errori.length) esito.voci.push({ gravita: 'Minore', testo: `${id}: ${errori.join('; ')}`, riferimento: 'UI_SPEC §3', evidenza: `design/icons/${f}` });
      else ok++;
    }
    esito.note.push(`${ok}/${icone.length} icone conformi: viewBox 24, solo currentColor, niente id/maschere/testo, title = etichetta, uguali al modulo proposto; bollini e anelli con i raggi dichiarati.`);

    // Variante piccola: esiste esattamente per i simboli marcati T.
    const conT = [...varianti].filter(([, v]) => /\bT\b/.test(v)).map(([id]) => id).sort();
    const conPiccolo = Object.entries(SIMBOLI).filter(([, s]) => s.piccolo).map(([id]) => id).sort();
    if (JSON.stringify(conT) !== JSON.stringify(conPiccolo)) esito.voci.push({ gravita: 'Minore', testo: `Variante piccola: T in UI_SPEC §7 = ${conT.join(', ')}; piccolo nel modulo = ${conPiccolo.join(', ')}`, riferimento: 'UI_SPEC §3, §7', evidenza: 'design/symbols.proposed.ts' });
    else esito.note.push(`Variante piccola presente esattamente per i ${conT.length} simboli con tagli (T).`);
    for (const id of conPiccolo) if (/evenodd/.test(SIMBOLI[id]?.piccolo ?? '')) esito.voci.push({ gravita: 'Osservazione', testo: `${id}: la variante piccola contiene ancora tagli (evenodd)`, riferimento: 'UI_SPEC §3', evidenza: 'design/symbols.proposed.ts' });

    // Tre stati del medaglione: raggi e scala del segno (UI_SPEC §3).
    const src = leggi('design/symbols.proposed.ts');
    const attesi: Record<string, [string[], string]> = {
      riposo: [['A11.5 11.5', 'A10.4 10.4'], '0.62'],
      selezionato: [['A11.5 11.5', 'A10.4 10.4', 'A9.4 9.4', 'A8.8 8.8'], '0.62'],
      confermato: [['A11.5 11.5', 'A9.2 9.2', 'A8.4 8.4', 'A7.9 7.9'], '0.56'],
    };
    for (const [stato, [raggi, k]] of Object.entries(attesi)) {
      const riga = src.match(new RegExp(`${stato}: \\{ cornice: '([^']+)', k: ([\\d.]+) \\}`));
      if (!riga || !raggi.every((r) => (riga[1] as string).includes(r)) || riga[2] !== k) esito.voci.push({ gravita: 'Minore', testo: `Medaglione ${stato}: cornice o scala diverse da UI_SPEC §3`, riferimento: 'UI_SPEC §3', evidenza: 'design/symbols.proposed.ts' });
    }
    esito.note.push('Medaglioni: riposo, selezionato e confermato confrontati con la tabella di UI_SPEC §3.');

    // UI_SPEC §9.1: "verificato con tsc --strict --erasableSyntaxOnly".
    try {
      execFileSync(process.execPath, [join(RADICE, 'node_modules/typescript/bin/tsc'), '--ignoreConfig', '--noEmit', '--strict', '--erasableSyntaxOnly', '--target', 'es2022', '--lib', 'es2022', '--types', '', join(RADICE, 'design/symbols.proposed.ts')], { cwd: RADICE, stdio: 'pipe', timeout: 120000 });
      esito.note.push('design/symbols.proposed.ts compila con tsc --strict --erasableSyntaxOnly.');
    } catch (e) {
      const out = String((e as { stdout?: Buffer }).stdout ?? '') + String((e as { stderr?: Buffer }).stderr ?? '');
      esito.voci.push({ gravita: 'Minore', testo: `design/symbols.proposed.ts non compila con --strict --erasableSyntaxOnly: ${out.slice(0, 300)}`, riferimento: 'UI_SPEC §9.1', evidenza: 'design/symbols.proposed.ts' });
    }
    // Compatibilità dichiarata in UI_SPEC §9.1: esporta SIMBOLI, simbolo(), icona(), medaglione() e il campo glifo.
    for (const nome of ['export const SIMBOLI', 'export function simbolo', 'export function icona', 'export function medaglione']) if (!src.includes(nome)) esito.voci.push({ gravita: 'Minore', testo: `Manca ${nome}`, riferimento: 'UI_SPEC §9.1', evidenza: 'design/symbols.proposed.ts' });
    const senzaGlifo = Object.entries(SIMBOLI).filter(([, s]) => !s.glifo).map(([id]) => id);
    if (senzaGlifo.length) esito.voci.push({ gravita: 'Minore', testo: `Simboli senza glifo di ripiego: ${senzaGlifo.join(', ')}`, riferimento: 'UI_SPEC §9.1', evidenza: 'design/symbols.proposed.ts' });
    return esito;
  },
};
