// A07 · Valori iniziali tracciati: balance.ts ed enemies.ts contro ARENA_SPEC §4.1, §4.2, §6 e §12.2.
// Ogni numero diverso dalla specifica deve comparire, con lo stesso valore, nella tabella delle modifiche
// di ARENA_REPORT §7.2. Ogni differenza non numerica (archetipo, forza, portata, velocità, tratti,
// gradi, adattamento, modificatori, sequenza) è una regola cambiata: Bloccante.
import type { Controllo, Esito } from './comune.ts';
import { leggi, sezione, tabella } from './comune.ts';
import { BALANCE } from '../../src/data/balance.ts';
import { POSTURE } from '../../src/data/postures.ts';
import { trovaProfilo } from '../../src/data/enemies.ts';
import type { Mossa, Profilo } from '../../src/core/types.ts';

type A = [string, string, string, number, number, string?]; // forza, portata, velocità, min, max, tratto
interface MossaSpec { id: string; nome: string; arch: string; a?: A }
interface NemicoSpec {
  id: string; nome: string; vigore: number; fiato: number; velocita: number;
  gradi: [number, number, number]; mosse: MossaSpec[];
  f1: Record<string, number>; f2?: Record<string, number>; ad1: number; ad2?: number;
  sequenza?: string[]; mod: Record<string, [string, number, number]>; // mossa → [tipo, parametro, x]
}

// ARENA_SPEC §6, con le modifiche di §12.2 R4–R5 (Invito, Incassare, Distanza 3 del Lanciere).
const SPEC: NemicoSpec[] = [
  { id: 'recluta', nome: 'Recluta', vigore: 16, fiato: 4, velocita: 1, gradi: [1, 1, 1],
    mosse: [{ id: 'fendente', nome: 'Fendente', arch: 'assalto', a: ['pesante', 'corta', 'normale', 3, 5] }, { id: 'copertura', nome: 'Copertura', arch: 'guardia' }],
    f1: {}, ad1: 1, sequenza: ['fendente', 'copertura'], mod: {} },
  { id: 'duellante', nome: 'Duellante', vigore: 20, fiato: 6, velocita: 3, gradi: [2, 1, 1],
    mosse: [
      { id: 'stoccata', nome: 'Stoccata', arch: 'assalto', a: ['leggero', 'corta', 'rapido', 2, 3] },
      { id: 'battuta', nome: 'Battuta', arch: 'assalto', a: ['leggero', 'corta', 'rapido', 2, 3, 'sfondaGuardia'] },
      { id: 'parata', nome: 'Parata', arch: 'guardia', a: ['leggero', 'corta', 'rapido', 1, 2] },
      { id: 'affondo', nome: 'Affondo', arch: 'assalto', a: ['pesante', 'corta', 'normale', 4, 6] },
      { id: 'invito', nome: 'Invito', arch: 'attesa' },
    ],
    f1: { stoccata: 5, battuta: 1, parata: 2, affondo: 1, invito: 3 }, ad1: 3, mod: {} },
  { id: 'bruto', nome: 'Bruto', vigore: 30, fiato: 5, velocita: 1, gradi: [1, 1, 1],
    mosse: [
      { id: 'maglio', nome: 'Maglio', arch: 'assalto', a: ['pesante', 'corta', 'lento', 6, 8] },
      { id: 'spallata', nome: 'Spallata', arch: 'assalto', a: ['pesante', 'corta', 'normale', 4, 5, 'sfondaGuardia'] },
      { id: 'raccogliersi', nome: 'Raccogliersi', arch: 'preparazione' },
      { id: 'incassare', nome: 'Incassare', arch: 'guardia' },
    ],
    f1: { maglio: 4, spallata: 2, raccogliersi: 2, incassare: 2 }, ad1: 2, mod: { raccogliersi: ['fiatoSotto', 2, 3] } },
  { id: 'lanciere', nome: 'Lanciere', vigore: 22, fiato: 5, velocita: 2, gradi: [1, 1, 3],
    mosse: [
      { id: 'affondoLungo', nome: 'Affondo lungo', arch: 'assalto', a: ['leggero', 'lunga', 'normale', 3, 4] },
      { id: 'colpoDAsta', nome: "Colpo d'asta", arch: 'assalto', a: ['pesante', 'lunga', 'lento', 5, 6] },
      { id: 'tenereABada', nome: 'Tenere a bada', arch: 'distanza' },
    ],
    f1: { affondoLungo: 4, colpoDAsta: 2, tenereABada: 2 }, ad1: 2, mod: { tenereABada: ['vigoreSotto', 0.4, 2] } },
  { id: 'mietitore', nome: 'Mietitore', vigore: 45, fiato: 6, velocita: 2, gradi: [3, 2, 1],
    mosse: [
      { id: 'falciata', nome: 'Falciata', arch: 'assalto', a: ['pesante', 'corta', 'normale', 5, 7] },
      { id: 'mietere', nome: 'Mietere', arch: 'assalto', a: ['leggero', 'lunga', 'normale', 3, 4] },
      { id: 'guardiaDOsso', nome: "Guardia d'osso", arch: 'guardia' },
      { id: 'raccogliersi', nome: 'Raccogliersi', arch: 'preparazione' },
      { id: 'carica', nome: 'Carica', arch: 'assalto', a: ['pesante', 'corta', 'normale', 7, 9, 'inarrestabile'] },
    ],
    f1: { falciata: 3, mietere: 3, guardiaDOsso: 2, raccogliersi: 1 }, ad1: 2,
    f2: { carica: 4, falciata: 2, mietere: 2, guardiaDOsso: 1, raccogliersi: 1 }, ad2: 3, mod: {} },
];

// ARENA_SPEC §3 (posture), §4.1, §4.2, §4.4, §4.7, §5.4 e §12.2 R2/R4/R6: tutti i numeri delle regole.
const BAL: Array<[string, unknown, unknown, string]> = [
  ['giocatore.vigore', BALANCE.giocatore.vigore, 30, '§4.1 (20 accettato in §12.1 3)'],
  ['giocatore.fiato', BALANCE.giocatore.fiato, 4, '§4.1'],
  ['giocatore.fiatoMax', BALANCE.giocatore.fiatoMax, 6, '§4.1'],
  ['giocatore.velocita', BALANCE.giocatore.velocita, 2, '§4.1'],
  ['giocatore.posturaIniziale', BALANCE.giocatore.posturaIniziale, 'guardia', '§4.1'],
  ['turnoMax', BALANCE.turnoMax, 25, '§4.1'],
  ['costoCambio', BALANCE.costoCambio, 1, '§4.2'],
  ['costoParata', BALANCE.costoParata, 1, '§4.2'],
  ['costoSchivata', BALANCE.costoSchivata, 2, '§4.2'],
  ['costoPunta', BALANCE.costoPunta, 1, 'R4'],
  ['costoArresto', BALANCE.costoArresto, 1, 'R4'],
  ['recupero', BALANCE.recupero, { assalto: 0, guardia: 2, attesa: 1, distanza: 2, preparazione: 3 }, '§4.2'],
  ['moltFiatoZero', BALANCE.moltFiatoZero, 1.25, '§4.2'],
  ['moltLungaControDistanza', BALANCE.moltLungaControDistanza, 1.25, '§4.4'],
  ['moltParataNonAnnullata', BALANCE.moltParataNonAnnullata, 0.4, '§4.4'],
  ['moltPreparato', BALANCE.moltPreparato, 1.5, '§3, §4.4'],
  ['contrattacco', BALANCE.contrattacco, [3, 4], '§4.4'],
  ['contrattaccoBonusDalGrado2', BALANCE.contrattaccoBonusDalGrado2, 1, '§4.4'],
  ['punta', BALANCE.punta, [1, 2], 'R4'],
  ['arresto', BALANCE.arresto, [2, 3], 'R4'],
  ['distanzaConsecutiveMax', BALANCE.distanzaConsecutiveMax, 2, 'R2'],
  ['velocitaMossa (ordine)', Object.entries(BALANCE.velocitaMossa).sort((a, b) => b[1] - a[1]).map((x) => x[0]), ['rapido', 'normale', 'lento'], '§4.3.4'],
  ['sogliaFase2', BALANCE.sogliaFase2, 0.5, '§4.7'],
  ['adattamentoScelte', BALANCE.adattamentoScelte, 2, '§5.4'],
  ['gradoDistanzaPerBattereAssalto', BALANCE.gradoDistanzaPerBattereAssalto, 2, 'R6'],
  ['posture.assalto', POSTURE.assalto.attacco, { forza: 'pesante', portata: 'corta', velocita: 'normale', danno: [4, 6] }, '§3'],
  ['posture.guardia', POSTURE.guardia.attacco, { forza: 'leggero', portata: 'corta', velocita: 'rapido', danno: [1, 2] }, '§3'],
  ['posture.attesa', POSTURE.attesa.attacco, undefined, '§3'],
  ['posture.distanza', POSTURE.distanza.attacco, undefined, '§3'],
];

const fmt = (a: number, b: number) => `${a}–${b}`;

export const controllo: Controllo = {
  id: 'A07',
  titolo: 'Valori iniziali tracciati nel report',
  riferimento: 'ARENA_SPEC §4.1, §4.2, §6, §9, §12.2, §12.6; ARENA_REPORT §7.2, §8.1',
  gates: ['G2'],
  esegui(): Esito {
    const esito: Esito = { voci: [], note: [] };
    // Tabella delle modifiche dichiarate nel report (§7.2): nemico → voce → valore 1.1 e valore "Spec".
    const sez = sezione(leggi('docs/ARENA_REPORT.md'), /^### 7\.2/);
    const dich = new Map<string, { spec: string; v11: string }>(); // chiave "nemico|voce"
    let corrente = '';
    for (const r of tabella(sez).slice(1)) {
      const [nem, voce, spec, , v11] = r.map((c) => c.replace(/\*\*/g, '').trim());
      if (!voce || !v11 || !spec) continue;
      if (nem) corrente = nem.toLowerCase();
      if (voce.startsWith('Pesi')) {
        const fase = /fase 2/.test(voce) ? 2 : 1;
        const nomi = (voce.match(/\(([^)]*)\)/)?.[1] ?? voce.replace(/^Pesi\s+/, '')).split(/,\s*/);
        const sv = spec.split(/,\s*/);
        v11.split(/,\s*/).forEach((x, i) => dich.set(`${corrente}|peso${fase}|${nomi[i]}`, { spec: (sv[i] ?? '').replace(/[()]/g, ''), v11: x }));
      } else {
        const nomi = voce.split(/\s*·\s*/);
        const sv = spec.split(/\s*·\s*/);
        v11.split(/\s*·\s*/).forEach((x, i) => dich.set(`${corrente}|${(nomi[i] as string).toLowerCase()}`, { spec: sv[i] ?? '', v11: x }));
      }
    }
    const sez81 = sezione(leggi('docs/ARENA_REPORT.md'), /^### 8\.1/);
    const superati: string[] = [];
    const nonDich: string[] = [];
    let numeriDiversi = 0;
    const verificaNumero = (nemico: string, chiave: string, etichetta: string, codice: string, spec: string): void => {
      if (codice === spec) {
        const d = dich.get(`${nemico}|${chiave}`);
        if (d && d.v11 !== codice) {
          // Il §7.2 è storico (revisione 1.1): un valore poi riportato a quello della specifica (C2, §12.6) è
          // superato se il §8.1 lo dichiara con il valore attuale.
          const voce = (chiave.split('|').pop() ?? chiave).toLowerCase();
          if (new RegExp(`${voce}\\s+${codice}\\s*\\(era ${d.v11}`, 'i').test(sez81)) superati.push(`${nemico} · ${etichetta}: ${d.v11} (§7.2) → ${codice} (§8.1)`);
          else esito.voci.push({ gravita: 'Maggiore', testo: `${nemico} · ${etichetta}: il report dichiara ${d.v11}, il codice ha ${codice}`, riferimento: 'ARENA_REPORT §7.2, §8.1', evidenza: 'src/data/enemies.ts' });
        }
        return;
      }
      numeriDiversi++;
      const d = dich.get(`${nemico}|${chiave}`);
      if (!d) nonDich.push(`${nemico} · ${etichetta}: spec ${spec} → codice ${codice}`);
      else {
        if (d.v11 !== codice) esito.voci.push({ gravita: 'Maggiore', testo: `${nemico} · ${etichetta}: il report dichiara ${d.v11}, il codice ha ${codice}`, riferimento: 'ARENA_REPORT §7.2', evidenza: 'src/data/enemies.ts' });
        if (d.spec !== spec) esito.voci.push({ gravita: 'Minore', testo: `${nemico} · ${etichetta}: il report indica come valore di specifica ${d.spec}, la specifica dice ${spec}`, riferimento: 'ARENA_SPEC §6', evidenza: 'docs/ARENA_REPORT.md §7.2' });
      }
    };

    for (const n of SPEC) {
      let p: Profilo;
      try {
        p = trovaProfilo(n.id);
      } catch {
        esito.voci.push({ gravita: 'Bloccante', testo: `Nemico mancante: ${n.id}`, riferimento: 'ARENA_SPEC §6' });
        continue;
      }
      if (p.nome !== n.nome) esito.voci.push({ gravita: 'Minore', testo: `Nome ${p.nome} invece di ${n.nome}`, riferimento: 'ARENA_SPEC §6', evidenza: 'src/data/enemies.ts' });
      const nk = n.nome.toLowerCase();
      verificaNumero(nk, 'vigore', 'vigore', String(p.vigore), String(n.vigore));
      verificaNumero(nk, 'fiato', 'fiato', String(p.fiato), String(n.fiato));
      verificaNumero(nk, 'velocità', 'velocità', String(p.velocita), String(n.velocita));
      const gr = [p.gradi.parata, p.gradi.schivata, p.gradi.distanza];
      if (JSON.stringify(gr) !== JSON.stringify(n.gradi)) esito.voci.push({ gravita: 'Bloccante', testo: `${n.nome}: gradi P/S/D ${gr.join('/')} invece di ${n.gradi.join('/')}`, riferimento: 'ARENA_SPEC §6, R4', evidenza: 'src/data/enemies.ts' });
      const ids = p.mosse.map((m) => m.id).sort();
      if (JSON.stringify(ids) !== JSON.stringify(n.mosse.map((m) => m.id).sort())) esito.voci.push({ gravita: 'Bloccante', testo: `${n.nome}: mosse ${ids.join(', ')}`, riferimento: 'ARENA_SPEC §6, R5', evidenza: 'src/data/enemies.ts' });
      for (const ms of n.mosse) {
        const m = p.mosse.find((x) => x.id === ms.id) as Mossa | undefined;
        if (!m) continue;
        if (m.nome !== ms.nome) esito.voci.push({ gravita: 'Minore', testo: `${n.nome}: nome della mossa ${m.nome} invece di ${ms.nome}`, riferimento: 'ARENA_SPEC §6', evidenza: 'src/data/enemies.ts' });
        if (m.archetipo !== ms.arch) esito.voci.push({ gravita: 'Bloccante', testo: `${n.nome} · ${ms.nome}: archetipo ${m.archetipo} invece di ${ms.arch}`, riferimento: 'ARENA_SPEC §6', evidenza: 'src/data/enemies.ts' });
        if (!!m.attacco !== !!ms.a) esito.voci.push({ gravita: 'Bloccante', testo: `${n.nome} · ${ms.nome}: attacco ${m.attacco ? 'presente' : 'assente'} contro la specifica`, riferimento: 'ARENA_SPEC §6', evidenza: 'src/data/enemies.ts' });
        if (m.attacco && ms.a) {
          const [fo, po, ve, lo, hi, tr] = ms.a;
          const a = m.attacco;
          if (a.forza !== fo || a.portata !== po || a.velocita !== ve) esito.voci.push({ gravita: 'Bloccante', testo: `${n.nome} · ${ms.nome}: ${a.forza}, ${a.portata}, ${a.velocita} invece di ${fo}, ${po}, ${ve}`, riferimento: 'ARENA_SPEC §6', evidenza: 'src/data/enemies.ts' });
          const tratti = [a.sfondaGuardia ? 'sfondaGuardia' : '', a.inarrestabile ? 'inarrestabile' : ''].filter(Boolean).join(',');
          if (tratti !== (tr ?? '')) esito.voci.push({ gravita: 'Bloccante', testo: `${n.nome} · ${ms.nome}: tratti "${tratti}" invece di "${tr ?? ''}"`, riferimento: 'ARENA_SPEC §6', evidenza: 'src/data/enemies.ts' });
          verificaNumero(nk, ms.nome.toLowerCase(), `danno ${ms.nome}`, fmt(a.danno[0], a.danno[1]), fmt(lo, hi));
        }
      }
      for (const [fase, pesi, fp] of [[1, n.f1, p.fase1], [2, n.f2, p.fase2]] as const) {
        if (!pesi) {
          if (fp) esito.voci.push({ gravita: 'Bloccante', testo: `${n.nome}: fase 2 non prevista`, riferimento: 'ARENA_SPEC §6' });
          continue;
        }
        if (!fp) {
          esito.voci.push({ gravita: 'Bloccante', testo: `${n.nome}: fase ${fase} mancante`, riferimento: 'ARENA_SPEC §6' });
          continue;
        }
        const ad = fase === 1 ? n.ad1 : n.ad2;
        if (fp.adattamento !== ad) esito.voci.push({ gravita: 'Bloccante', testo: `${n.nome} fase ${fase}: adattamento ×${fp.adattamento} invece di ×${ad}`, riferimento: 'ARENA_SPEC §6', evidenza: 'src/data/enemies.ts' });
        if (n.sequenza && JSON.stringify(fp.sequenza) !== JSON.stringify(n.sequenza)) esito.voci.push({ gravita: 'Bloccante', testo: `${n.nome}: sequenza ${JSON.stringify(fp.sequenza)}`, riferimento: 'ARENA_SPEC §5.2, §6' });
        if (!n.sequenza && fp.sequenza) esito.voci.push({ gravita: 'Bloccante', testo: `${n.nome}: sequenza non prevista`, riferimento: 'ARENA_SPEC §5' });
        const inFase = fp.mosse.map((x) => x.mossa).sort();
        if (!n.sequenza && JSON.stringify(inFase) !== JSON.stringify(Object.keys(pesi).sort())) esito.voci.push({ gravita: 'Bloccante', testo: `${n.nome} fase ${fase}: mosse ${inFase.join(', ')}`, riferimento: 'ARENA_SPEC §6' });
        for (const pm of fp.mosse) {
          const nome = n.mosse.find((x) => x.id === pm.mossa)?.nome ?? pm.mossa;
          if (pesi[pm.mossa] !== undefined) verificaNumero(nk, `peso${fase}|${nome}`, `peso fase ${fase} ${nome}`, String(pm.peso), String(pesi[pm.mossa]));
          const mod = n.mod[pm.mossa];
          const mc = pm.modificatori ?? [];
          const atteso = mod ? [{ tipo: mod[0], v: mod[1], x: mod[2] }] : [];
          const reale = mc.map((m) => ({ tipo: m.quando.tipo, v: 'n' in m.quando ? m.quando.n : 'frazione' in m.quando ? m.quando.frazione : undefined, x: m.x }));
          if (JSON.stringify(reale) !== JSON.stringify(atteso)) esito.voci.push({ gravita: 'Bloccante', testo: `${n.nome} · ${nome}: modificatori ${JSON.stringify(reale)} invece di ${JSON.stringify(atteso)}`, riferimento: 'ARENA_SPEC §6', evidenza: 'src/data/enemies.ts' });
        }
      }
    }
    for (const x of nonDich) esito.voci.push({ gravita: 'Maggiore', testo: `Modifica di bilanciamento non annotata: ${x}`, riferimento: 'ARENA_SPEC §9', evidenza: 'docs/ARENA_REPORT.md §7.2' });

    for (const [nome, codice, spec, rif] of BAL) {
      if (JSON.stringify(codice) === JSON.stringify(spec)) continue;
      const accettato = nome === 'giocatore.vigore' && codice === 20;
      const annotato = /giocatore\.vigore[^\n]*\*\*20\*\*|`giocatore\.vigore` resta \*\*20\*\*/.test(leggi('docs/ARENA_REPORT.md'));
      if (accettato && annotato) {
        esito.note.push('balance: giocatore.vigore 20 invece di 30, annotato nel report e accettato da ARENA_SPEC §12.1 3.');
        continue;
      }
      esito.voci.push({ gravita: /^posture|recupero|molt|costo|contrattacco|punta|arresto|distanzaConsecutive|velocitaMossa|soglia|adattamento|gradoDistanza/.test(nome) ? 'Bloccante' : 'Maggiore', testo: `balance ${nome}: ${JSON.stringify(codice)} invece di ${JSON.stringify(spec)}`, riferimento: `ARENA_SPEC ${rif}`, evidenza: 'src/data/balance.ts' });
    }
    esito.note.push(`${numeriDiversi} numeri dei nemici diversi dalla specifica; ${numeriDiversi - nonDich.length} annotati in ARENA_REPORT §7.2 con lo stesso valore del codice.`);
    if (superati.length) esito.note.push(`Valori del §7.2 superati e dichiarati nel §8.1 (ARENA_SPEC §12.6, ARENA_S23_SPEC §1): ${superati.join('; ')}.`);
    esito.note.push('Gradi, archetipi, forza/portata/velocità, tratti, adattamenti, modificatori e sequenza confrontati con §6 e R4–R5.');
    return esito;
  },
};
