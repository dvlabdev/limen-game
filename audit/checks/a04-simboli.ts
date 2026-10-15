// A04 · Copertura dei simboli: gli id di ARENA_SPEC §7 (+ R7) corrispondono uno a uno a src/ui/symbols.ts;
// design/symbols.proposed.ts e design/icons/*.svg coprono il contratto più le sole estensioni di UI_SPEC §8;
// ogni `simbolo` emesso da toDuelView e ogni id usato dalla UI appartiene al catalogo.
import type { Controllo, Esito } from './comune.ts';
import { elenca, leggi, sezione } from './comune.ts';
import type { PosturaId } from '../../src/core/types.ts';
import { creaDuello, resolveTurn } from '../../src/core/resolve.ts';
import { toDuelView } from '../../src/core/view.ts';
import { SIMBOLI as SRC } from '../../src/ui/symbols.ts';
import { SIMBOLI as PROPOSTI } from '../../design/symbols.proposed.ts';

const RE_ID = /`((?:posture|intent|stato|risorsa|evento|mod)\.[A-Za-z0-9.]+)`/g;

export function idContratto(): string[] {
  const spec = leggi('docs/ARENA_SPEC.md');
  const s7 = sezione(spec, /^## 7\./);
  const tab = s7.split(/\r?\n/).filter((r) => /^\| (Posture|Intenzioni|Stati|Risorse|Eventi) /.test(r)).join('\n');
  const r7 = (spec.match(/Nuovi id di simbolo:[^\n]*/) ?? [''])[0];
  return [...new Set([...tab.matchAll(RE_ID), ...r7.matchAll(RE_ID)].map((m) => m[1] as string))].sort();
}

export function idEstensioni(): string[] {
  const s8 = sezione(leggi('docs/UI_SPEC.md'), /^## 8\./);
  const out = new Set<string>();
  for (const m of s8.matchAll(RE_ID)) out.add(m[1] as string);
  // `posture.<id>.medaglione` (4): una riga per i quattro medaglioni.
  if (/posture\.<id>\.medaglione/.test(s8)) for (const p of ['assalto', 'guardia', 'attesa', 'distanza']) out.add(`posture.${p}.medaglione`);
  return [...out].sort();
}

// Raccoglie tutti i simboli emessi dalla vista in duelli giocati con scelte variate e tutte le opzioni.
export function simboliEmessi(): Set<string> {
  const visti = new Set<string>();
  const posture: PosturaId[] = ['assalto', 'guardia', 'attesa', 'distanza'];
  let k = 0;
  for (const nemico of ['recluta', 'duellante', 'bruto', 'lanciere', 'mietitore']) {
    for (let seed = 1; seed <= 60; seed++) {
      const gr = ((seed % 3) + 1) as 1 | 2 | 3;
      let s = creaDuello(nemico, seed, { hintCompleti: seed % 2 === 0, anteprimaDanni: seed % 5 === 0, adattamento: true }, { parata: gr, schivata: gr, distanza: gr });
      let eventi = resolveTurn(s, 'guardia').eventi;
      while (true) {
        const v = toDuelView(s, eventi);
        visti.add(v.hint.simbolo);
        for (const p of v.posture) visti.add(p.simbolo);
        visti.add(v.giocatore.postura.simbolo);
        visti.add(v.nemico.postura.simbolo);
        for (const r of v.registro) if (r.simbolo) visti.add(r.simbolo);
        if (s.esito !== 'in corso') break;
        const ok = v.posture.filter((p) => p.disponibile).map((p) => p.id);
        const scelta = ok[(k++ * 7 + seed) % ok.length] as PosturaId;
        const r = resolveTurn(s, posture.includes(scelta) ? scelta : 'guardia');
        s = r.stato;
        eventi = r.eventi;
      }
    }
  }
  return visti;
}

export const controllo: Controllo = {
  id: 'A04',
  titolo: 'Copertura dei simboli',
  riferimento: 'ARENA_SPEC §7, §12.2 R7; UI_SPEC §7, §8',
  gates: ['G3', 'G4'],
  esegui(): Esito {
    const esito: Esito = { voci: [], note: [] };
    const contratto = idContratto();
    const estensioni = idEstensioni().filter((x) => !contratto.includes(x)); // §8 cita anche risorsa.fiato
    esito.note.push(`Contratto ARENA_SPEC §7 + R7: ${contratto.length} id; estensioni proposte in UI_SPEC §8: ${estensioni.length} id.`);

    // 1. src/ui/symbols.ts (segnaposto) uno a uno con il contratto.
    const src = Object.keys(SRC).sort();
    const mancaSrc = contratto.filter((x) => !src.includes(x));
    const extraSrc = src.filter((x) => !contratto.includes(x));
    if (mancaSrc.length) esito.voci.push({ gravita: 'Bloccante', testo: `Id del contratto senza segnaposto in src/ui/symbols.ts: ${mancaSrc.join(', ')}`, riferimento: 'ARENA_SPEC §7, R7', evidenza: 'src/ui/symbols.ts' });
    if (extraSrc.length) esito.voci.push({ gravita: 'Minore', testo: `Id in src/ui/symbols.ts fuori contratto: ${extraSrc.join(', ')}`, riferimento: 'ARENA_SPEC §7', evidenza: 'src/ui/symbols.ts' });
    if (!mancaSrc.length && !extraSrc.length) esito.note.push(`src/ui/symbols.ts: ${src.length} id, uno a uno con il contratto.`);

    // 2. design/symbols.proposed.ts e design/icons/*.svg.
    const prop = Object.keys(PROPOSTI).sort();
    const icone = elenca('design/icons').filter((f) => f.endsWith('.svg')).map((f) => f.replace(/\.svg$/, '')).sort();
    const atteso = [...new Set([...contratto, ...estensioni])].sort();
    for (const [nome, ids, ev] of [['design/symbols.proposed.ts', prop, 'design/symbols.proposed.ts'], ['design/icons', icone, 'design/icons/']] as const) {
      const manca = atteso.filter((x) => !ids.includes(x));
      const extra = ids.filter((x) => !atteso.includes(x));
      if (manca.length) esito.voci.push({ gravita: contratto.some((c) => manca.includes(c)) ? 'Bloccante' : 'Maggiore', testo: `${nome}: mancano ${manca.join(', ')}`, riferimento: 'UI_SPEC §7, §8', evidenza: ev });
      if (extra.length) esito.voci.push({ gravita: 'Minore', testo: `${nome}: id né nel contratto né tra le estensioni: ${extra.join(', ')}`, riferimento: 'UI_SPEC §8', evidenza: ev });
      if (!manca.length && !extra.length) esito.note.push(`${nome}: ${ids.length} id = contratto (${contratto.length}) + estensioni (${estensioni.length}).`);
    }
    const tabUi = new Set([...sezione(leggi('docs/UI_SPEC.md'), /^## 7\./).matchAll(/^\| `([^`]+)`/gm)].map((m) => m[1] as string));
    const diffUi = [...atteso.filter((x) => !tabUi.has(x)), ...[...tabUi].filter((x) => !atteso.includes(x))];
    if (diffUi.length) esito.voci.push({ gravita: 'Minore', testo: `UI_SPEC §7 non elenca esattamente contratto + estensioni: ${diffUi.join(', ')}`, riferimento: 'UI_SPEC §7', evidenza: 'docs/UI_SPEC.md §7' });
    else esito.note.push(`UI_SPEC §7 elenca ${tabUi.size} id: coincide con contratto + estensioni.`);
    const contrattoUi = sezione(leggi('docs/ARENA_SPEC.md'), /^## 7\./);
    const nonApprovate = estensioni.filter((x) => !contrattoUi.includes(x));
    if (nonApprovate.length) esito.voci.push({ gravita: 'Osservazione', testo: `${nonApprovate.length} estensioni di UI_SPEC §8 ancora da approvare e da aggiungere ad ARENA_SPEC §7 (UI_SPEC §10 domanda 1): ${nonApprovate.join(', ')}`, riferimento: 'UI_SPEC §8, §10; CLAUDE.md (contratto modificabile solo con Planning)', evidenza: 'docs/ARENA_SPEC.md §7' });

    // 3. Simboli emessi dalla vista e id usati dalla UI.
    const emessi = simboliEmessi();
    const fuori = [...emessi].filter((x) => !contratto.includes(x));
    if (fuori.length) esito.voci.push({ gravita: 'Bloccante', testo: `toDuelView emette simboli fuori catalogo: ${fuori.join(', ')}`, riferimento: 'ARENA_SPEC §7', evidenza: 'src/core/view.ts' });
    const mai = contratto.filter((x) => !emessi.has(x));
    esito.note.push(`toDuelView ha emesso ${emessi.size} id distinti, tutti nel contratto. Mai emessi dalla vista (li usa la UI o non capitano): ${mai.join(', ') || 'nessuno'}.`);
    const ui = [...leggi('src/ui/render.ts').matchAll(/simbolo\('([^']+)'\)/g)].map((m) => m[1] as string);
    const uiFuori = ui.filter((x) => !contratto.includes(x));
    if (uiFuori.length) esito.voci.push({ gravita: 'Maggiore', testo: `La UI usa id fuori contratto: ${uiFuori.join(', ')}`, riferimento: 'ARENA_SPEC §7', evidenza: 'src/ui/render.ts' });
    else esito.note.push(`Id letterali usati da src/ui/render.ts (${[...new Set(ui)].join(', ')}): tutti nel contratto.`);
    const nonUsati = mai.filter((x) => !ui.includes(x));
    if (nonUsati.length) esito.voci.push({ gravita: 'Osservazione', testo: `Id del contratto mai emessi né usati dall'interfaccia: ${nonUsati.join(', ')}`, riferimento: 'ARENA_SPEC §7', evidenza: 'src/core/view.ts, src/ui/render.ts' });
    esito.dati = { contratto, estensioni, emessi: [...emessi].sort() };
    return esito;
  },
};
