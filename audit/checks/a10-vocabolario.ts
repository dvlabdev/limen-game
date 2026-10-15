// A10 · Vocabolario: nomi di posture, categorie, nemici e mosse identici tra DESIGN, ARENA_SPEC, dati,
// vista ed etichette della UI; termini riservati (DESIGN §5.5a: "finta") e termini di dominio (preparato).
import type { Controllo, Esito } from './comune.ts';
import { leggi, righe, sezione, tabella } from './comune.ts';
import { POSTURE, NOMI_ARCHETIPO } from '../../src/data/postures.ts';
import { trovaProfilo, ORDINE_NEMICI } from '../../src/data/enemies.ts';
import { categoriaDi } from '../../src/core/ai.ts';
import { SIMBOLI as SRC } from '../../src/ui/symbols.ts';
import { SIMBOLI as PROPOSTI } from '../../design/symbols.proposed.ts';

// Dal testo: DESIGN §5.2 (posture), ARENA_SPEC §3 (categorie), §6 e §12.2 R5 (nemici e mosse).
const POSTURE_DES = { assalto: 'Assalto', guardia: 'Guardia', attesa: 'Attesa', distanza: 'Distanza' };
const NEMICI_SPEC = ['Recluta', 'Duellante', 'Bruto', 'Lanciere', 'Mietitore'];
const MOSSE_SPEC: Record<string, string[]> = {
  recluta: ['Fendente', 'Copertura'],
  duellante: ['Stoccata', 'Battuta', 'Parata', 'Affondo', 'Invito'],
  bruto: ['Maglio', 'Spallata', 'Raccogliersi', 'Incassare'],
  lanciere: ['Affondo lungo', "Colpo d'asta", 'Tenere a bada'],
  mietitore: ['Falciata', 'Mietere', "Guardia d'osso", 'Raccogliersi', 'Carica'],
};
// SCENA_SPEC §1.4: mosse della categoria "difesa" per nemico.
const DIFESA_SCENA: Record<string, string[]> = {
  duellante: ['Parata', 'Invito'],
  bruto: ['Incassare'],
  lanciere: ['Tenere a bada'],
  recluta: ['Copertura'],
  mietitore: ["Guardia d'osso"],
};

export const controllo: Controllo = {
  id: 'A10',
  titolo: 'Vocabolario',
  riferimento: 'DESIGN §5; ARENA_SPEC §3, §6, §7; UI_SPEC §7; SCENA_SPEC §1.4',
  gates: ['G3', 'G4'],
  esegui(): Esito {
    const esito: Esito = { voci: [], note: [] };
    // Posture: DESIGN, dati, vista, segnaposto e simboli proposti.
    for (const [id, nome] of Object.entries(POSTURE_DES)) {
      const fonti: Array<[string, string | undefined]> = [
        ['src/data/postures.ts POSTURE', POSTURE[id as keyof typeof POSTURE]?.nome],
        ['src/data/postures.ts NOMI_ARCHETIPO', NOMI_ARCHETIPO[id as keyof typeof NOMI_ARCHETIPO]],
        ['src/ui/symbols.ts', SRC[`posture.${id}`]?.etichetta],
        ['design/symbols.proposed.ts', PROPOSTI[`posture.${id}`]?.etichetta],
        ['design/symbols.proposed.ts (medaglione)', PROPOSTI[`posture.${id}.medaglione`]?.etichetta],
      ];
      for (const [f, v] of fonti) if (v !== nome) esito.voci.push({ gravita: 'Minore', testo: `Postura ${id}: "${v}" in ${f} invece di "${nome}"`, riferimento: 'DESIGN §5.2', evidenza: f });
    }
    // Categorie dell'hint.
    const cat = (leggi('src/core/types.ts').match(/type Categoria = ([^;]+);/)?.[1] ?? '').replace(/'/g, '').split(/\s*\|\s*/).sort();
    if (JSON.stringify(cat) !== JSON.stringify(['difesa', 'leggero', 'pesante', 'preparazione'])) esito.voci.push({ gravita: 'Maggiore', testo: `Categorie: ${cat.join(', ')}`, riferimento: 'ARENA_SPEC §3; DESIGN §5.4', evidenza: 'src/core/types.ts' });
    // Nemici e mosse.
    const nomiCodice = ORDINE_NEMICI.map((id) => trovaProfilo(id).nome);
    if (JSON.stringify(nomiCodice) !== JSON.stringify(NEMICI_SPEC)) esito.voci.push({ gravita: 'Minore', testo: `Nemici: ${nomiCodice.join(', ')}`, riferimento: 'ARENA_SPEC §6', evidenza: 'src/data/enemies.ts' });
    for (const [id, mosse] of Object.entries(MOSSE_SPEC)) {
      const nomi = trovaProfilo(id).mosse.map((m) => m.nome).sort();
      if (JSON.stringify(nomi) !== JSON.stringify([...mosse].sort())) esito.voci.push({ gravita: 'Minore', testo: `${id}: mosse ${nomi.join(', ')} invece di ${mosse.join(', ')}`, riferimento: 'ARENA_SPEC §6, R5', evidenza: 'src/data/enemies.ts' });
      const difesa = trovaProfilo(id).mosse.filter((m) => categoriaDi(m) === 'difesa').map((m) => m.nome).sort();
      const atteso = [...(DIFESA_SCENA[id] ?? [])].sort();
      if (JSON.stringify(difesa) !== JSON.stringify(atteso)) esito.voci.push({ gravita: 'Minore', testo: `${id}: categoria difesa = ${difesa.join(', ')}; SCENA_SPEC §1.4 elenca ${atteso.join(', ')}`, riferimento: 'SCENA_SPEC §1.4', evidenza: 'src/data/enemies.ts' });
    }
    esito.note.push('Nomi di posture, nemici e mosse confrontati con DESIGN §5.2, ARENA_SPEC §6/R5 e SCENA_SPEC §1.4.');
    // DESIGN §5.2: corrispondenza con la scherma storica citata anche in SCENA_SPEC §1.2.
    const des = leggi('DESIGN.md');
    for (const [p, guardia] of [['Assalto', 'posta di donna'], ['Guardia', 'posta frontale'], ['Attesa', 'dente di zenghiaro'], ['Distanza', 'posta longa']]) {
      if (!new RegExp(`${p} = \\*${guardia}\\*`).test(des)) esito.voci.push({ gravita: 'Osservazione', testo: `DESIGN §5.2 non associa ${p} a ${guardia}`, evidenza: 'DESIGN.md §5.2' });
    }
    // Termine riservato "finta" (DESIGN §5.5a; ARENA_SPEC 1.0.2: la mossa si chiama Battuta).
    const finta = ['src/data/enemies.ts', 'src/core/view.ts', 'src/ui/render.ts', 'src/ui/arena.ts', 'src/ui/symbols.ts'].flatMap((f) => righe(f, /[Ff]inta/));
    if (finta.length) esito.voci.push({ gravita: 'Minore', testo: 'Il termine riservato "finta" compare nel codice', riferimento: 'DESIGN §5.5a', evidenza: finta.join(', ') });
    else esito.note.push('Nessun uso del termine riservato "finta" in dati, vista e UI.');
    // Etichette dei segnaposto contro UI_SPEC §7.
    const ui = new Map(tabella(sezione(leggi('docs/UI_SPEC.md'), /^## 7\./)).filter((r) => /^`/.test(r[0] ?? '')).map((r) => [(r[0] as string).replace(/`/g, ''), r[1] as string]));
    const diverse: string[] = [];
    for (const [id, s] of Object.entries(SRC)) if (ui.get(id) && ui.get(id) !== s.etichetta) diverse.push(`${id} "${s.etichetta}" → "${ui.get(id)}"`);
    const propDiverse = Object.entries(PROPOSTI).filter(([id, s]) => ui.get(id) !== s.etichetta).map(([id, s]) => `${id} "${s.etichetta}"/"${ui.get(id)}"`);
    if (propDiverse.length) esito.voci.push({ gravita: 'Minore', testo: `Etichette di design/symbols.proposed.ts diverse da UI_SPEC §7: ${propDiverse.join(', ')}`, riferimento: 'UI_SPEC §7', evidenza: 'design/symbols.proposed.ts' });
    else esito.note.push(`Etichette dei ${Object.keys(PROPOSTI).length} simboli proposti identiche a UI_SPEC §7.`);
    // "Raccolto" è il termine segnaposto per "preparato" (UI_SPEC §7): nell'arena di oggi compare ancora.
    const raccolto = ['src/ui/symbols.ts', 'src/core/view.ts'].flatMap((f) => righe(f, /[Rr]accolt/));
    if (raccolto.length) esito.voci.push({ gravita: 'Minore', testo: 'Lo stato "preparato" si legge ancora "Raccolto"/"era raccolto" nell\'interfaccia, mentre ARENA_SPEC (§3, R3) e UI_SPEC §7 usano "Preparato"', riferimento: 'ARENA_SPEC §3, §12.2 R3; UI_SPEC §7; CLAUDE.md (termini di dominio come in DESIGN)', evidenza: raccolto.join(', ') });
    if (diverse.length) esito.voci.push({ gravita: 'Osservazione', testo: `Etichette segnaposto di src/ui/symbols.ts diverse da UI_SPEC §7 (si allineano all'integrazione dei simboli): ${diverse.join('; ')}`, riferimento: 'UI_SPEC §7, §9', evidenza: 'src/ui/symbols.ts' });
    return esito;
  },
};
