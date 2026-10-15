// A04 · Copertura dei simboli: gli id di ARENA_SPEC §7 (+ R7) più le 13 estensioni approvate (ARENA_S23_SPEC §2)
// corrispondono uno a uno a src/ui/symbols.ts (definitivo dalla C2), che è la copia di design/symbols.proposed.ts;
// le 9 sagome (ARENA_S23_SPEC §3) corrispondono uno a uno a design/sagome/*.svg e a src/ui/sagome.ts;
// design/symbols.proposed.ts e design/icons/*.svg coprono il contratto più le sole estensioni di UI_SPEC §8;
// ogni `simbolo` emesso da toDuelView e ogni id usato dalla UI appartiene al catalogo.
import type { Controllo, Esito } from './comune.ts';
import { elenca, leggi, sezione } from './comune.ts';
import type { PosturaId } from '../../src/core/types.ts';
import { creaDuello, resolveTurn } from '../../src/core/resolve.ts';
import { toDuelView } from '../../src/core/view.ts';
import { SIMBOLI as SRC } from '../../src/ui/symbols.ts';
import { SIMBOLI as PROPOSTI } from '../../design/symbols.proposed.ts';
import { SAGOME as SAGOME_SRC } from '../../src/ui/sagome.ts';
import { SAGOME as SAGOME_DESIGN } from '../../design/sagome.proposed.ts';

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
  riferimento: 'ARENA_SPEC §7, §12.2 R7; ARENA_S23_SPEC §2, §3; UI_SPEC §7, §8, §9',
  gates: ['G3', 'G4'],
  esegui(): Esito {
    const esito: Esito = { voci: [], note: [] };
    const contratto = idContratto();
    const estensioni = idEstensioni().filter((x) => !contratto.includes(x)); // §8 cita anche risorsa.fiato
    esito.note.push(`Contratto ARENA_SPEC §7 + R7: ${contratto.length} id; estensioni proposte in UI_SPEC §8: ${estensioni.length} id.`);

    // 1. src/ui/symbols.ts (definitivo dalla C2): contratto + 13 estensioni approvate, uno a uno.
    const src = Object.keys(SRC).sort();
    const attesoSrc = [...new Set([...contratto, ...estensioni])].sort();
    const mancaSrc = attesoSrc.filter((x) => !src.includes(x));
    const extraSrc = src.filter((x) => !attesoSrc.includes(x));
    if (mancaSrc.length) esito.voci.push({ gravita: contratto.some((c) => mancaSrc.includes(c)) ? 'Bloccante' : 'Maggiore', testo: `Id senza simbolo in src/ui/symbols.ts: ${mancaSrc.join(', ')}`, riferimento: 'ARENA_SPEC §7, R7; ARENA_S23_SPEC §2', evidenza: 'src/ui/symbols.ts' });
    if (extraSrc.length) esito.voci.push({ gravita: 'Minore', testo: `Id in src/ui/symbols.ts fuori da contratto ed estensioni approvate: ${extraSrc.join(', ')}`, riferimento: 'ARENA_S23_SPEC §2', evidenza: 'src/ui/symbols.ts' });
    if (!mancaSrc.length && !extraSrc.length) esito.note.push(`src/ui/symbols.ts: ${src.length} id = contratto (${contratto.length}) + estensioni approvate (${estensioni.length}).`);
    // 1b. src/ui/symbols.ts è la copia di design/symbols.proposed.ts: disegni, etichette, varianti piccole e taglia minima.
    const diversi: string[] = [];
    const CAMPI = ['etichetta', 'svg', 'piccolo'];
    const campi = (o: Record<string, unknown>) => JSON.stringify(CAMPI.map((k) => o[k]));
    for (const id of attesoSrc) {
      const a = SRC[id] as unknown as Record<string, unknown> | undefined;
      const b = PROPOSTI[id] as unknown as Record<string, unknown> | undefined;
      if (a && b && campi(a) !== campi(b)) {
        const qual = CAMPI.filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
        diversi.push(`${id} (${qual.join(', ')})`);
      }
    }
    const haMin = (o: unknown) => Object.values(o as Record<string, Record<string, unknown>>).some((x) => x['min'] !== undefined);
    const clampSrc = /Math\.max\(opz\.px[^)]*min/.test(leggi('src/ui/symbols.ts'));
    if (diversi.length || (haMin(PROPOSTI) && !haMin(SRC)) || (haMin(PROPOSTI) && !clampSrc)) {
      esito.voci.push({ gravita: 'Minore', testo: `src/ui/symbols.ts non è allineato a design/symbols.proposed.ts (C2a, 808711a): simboli con disegno o etichetta diversi: ${diversi.join('; ') || 'nessuno'}; campo min nei simboli: ${haMin(SRC) ? 'sì' : 'no'} (design: ${haMin(PROPOSTI) ? 'sì' : 'no'}); icona() porta le richieste al minimo: ${clampSrc ? 'sì' : 'no'}`, riferimento: 'UI_SPEC §7.1, §9 (1); ARENA_SPEC §12.8 3', evidenza: 'src/ui/symbols.ts; design/symbols.proposed.ts' });
    } else esito.note.push('src/ui/symbols.ts coincide con design/symbols.proposed.ts (disegni, etichette, varianti, min, clamp di icona()).');

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
    const approvateS23 = /\*\*Approvate\.\*\*/.test(leggi('docs/ARENA_S23_SPEC.md'));
    if (nonApprovate.length) esito.voci.push({ gravita: approvateS23 ? 'Osservazione' : 'Maggiore', testo: `${nonApprovate.length} estensioni di UI_SPEC §8 ${approvateS23 ? 'approvate in ARENA_S23_SPEC §2 ma non ancora riportate nella tabella degli id di ARENA_SPEC §7 (che non cita neppure i campi dove, breve, spalle, spazio, motivo)' : 'ancora da approvare'}: ${nonApprovate.join(', ')}`, riferimento: 'ARENA_S23_SPEC §2; ARENA_SPEC §7, §12.8 1; CLAUDE.md (contratto modificabile solo con Planning)', evidenza: 'docs/ARENA_SPEC.md §7' });

    // 3. Simboli emessi dalla vista e id usati dalla UI.
    const emessi = simboliEmessi();
    const catalogo = [...new Set([...contratto, ...estensioni])];
    const fuori = [...emessi].filter((x) => !catalogo.includes(x));
    if (fuori.length) esito.voci.push({ gravita: 'Bloccante', testo: `toDuelView emette simboli fuori catalogo: ${fuori.join(', ')}`, riferimento: 'ARENA_SPEC §7', evidenza: 'src/core/view.ts' });
    const mai = contratto.filter((x) => !emessi.has(x));
    esito.note.push(`toDuelView ha emesso ${emessi.size} id distinti, tutti nel contratto. Mai emessi dalla vista (li usa la UI o non capitano): ${mai.join(', ') || 'nessuno'}.`);
    // Id usati dalla UI: ogni stringa letterale della forma gruppo.nome in src/ui (tranne i file di simboli e sagome).
    const fileUi = elenca('src/ui').filter((f) => f.endsWith('.ts') && f !== 'symbols.ts' && f !== 'sagome.ts');
    const ui = fileUi.flatMap((f) => [...leggi(`src/ui/${f}`).matchAll(/['"`]((?:posture|intent|stato|risorsa|evento|mod)\.[A-Za-z0-9.]+)['"`]/g)].map((m) => m[1] as string));
    const uiFuori = ui.filter((x) => !catalogo.includes(x));
    if (uiFuori.length) esito.voci.push({ gravita: 'Maggiore', testo: `La UI usa id fuori catalogo: ${[...new Set(uiFuori)].join(', ')}`, riferimento: 'ARENA_SPEC §7; ARENA_S23_SPEC §2', evidenza: 'src/ui/' });
    else esito.note.push(`Id letterali usati da src/ui (${fileUi.join(', ')}): ${new Set(ui).size} distinti, tutti nel catalogo.`);
    const nonUsati = mai.filter((x) => !ui.includes(x));
    if (nonUsati.length) esito.voci.push({ gravita: 'Osservazione', testo: `Id del contratto mai emessi né usati dall'interfaccia: ${nonUsati.join(', ')}`, riferimento: 'ARENA_SPEC §7', evidenza: 'src/core/view.ts, src/ui/render.ts' });
    // 4. Sagome (ARENA_S23_SPEC §3): 4 del viandante + 5 nemici, uno a uno con design/sagome/*.svg e con src/ui/sagome.ts.
    const sagAttese = ['viandante.assalto', 'viandante.guardia', 'viandante.attesa', 'viandante.distanza', 'recluta', 'duellante', 'bruto', 'lanciere', 'mietitore'].sort();
    const sagSvg = elenca('design/sagome').filter((f) => f.endsWith('.svg')).map((f) => f.replace(/\.svg$/, '')).sort();
    const sagDesign = Object.keys(SAGOME_DESIGN).sort();
    const sagSrc = Object.keys(SAGOME_SRC).sort();
    let sagOk = true;
    for (const [nome, ids] of [['design/sagome/*.svg', sagSvg], ['design/sagome.proposed.ts', sagDesign], ['src/ui/sagome.ts', sagSrc]] as const) {
      const manca = sagAttese.filter((x) => !ids.includes(x));
      const extra = ids.filter((x) => !sagAttese.includes(x));
      if (manca.length || extra.length) {
        sagOk = false;
        esito.voci.push({ gravita: 'Maggiore', testo: `${nome}: sagome mancanti [${manca.join(', ')}] o in più [${extra.join(', ')}]`, riferimento: 'ARENA_S23_SPEC §3', evidenza: nome });
      }
    }
    const sagDiverse = sagAttese.filter((id) => JSON.stringify((SAGOME_SRC as Record<string, unknown>)[id]) !== JSON.stringify((SAGOME_DESIGN as Record<string, unknown>)[id]));
    if (sagDiverse.length) esito.voci.push({ gravita: 'Minore', testo: `src/ui/sagome.ts non coincide con design/sagome.proposed.ts: ${sagDiverse.join(', ')}`, riferimento: 'ARENA_SPEC §12.8 3', evidenza: 'src/ui/sagome.ts' });
    else if (sagOk) esito.note.push('Sagome: 9 id (4 del viandante, 5 nemici) uno a uno in design/sagome/*.svg, design/sagome.proposed.ts e src/ui/sagome.ts; la copia in src/ui coincide con quella di Grafica.');
    esito.dati = { contratto, estensioni, emessi: [...emessi].sort() };
    return esito;
  },
};
