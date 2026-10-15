// A05 · Matrice di accettazione indipendente (ARENA_SPEC 1.1.1 §4.4–§4.6 e §12.3), più i test dedicati
// che la specifica richiede (§4.6 "Servono anche test dedicati", §12.3 "Altri test richiesti") e alcuni
// casi derivati dal testo. I valori attesi sono scritti dall'Audit a partire dal testo, senza guardare test/.
// Scatola nera: si usano solo creaDuello, resolveTurn, toDuelView, pesiCandidate e un dado finto.
import type { Controllo, Esito, Gravita, Voce } from './comune.ts';
import type { Dado, Gradi, Mossa, PosturaId, Profilo, StatoDuello } from '../../src/core/types.ts';
import { creaDuello, resolveTurn } from '../../src/core/resolve.ts';
import { toDuelView } from '../../src/core/view.ts';
import { pesiCandidate, sceglieMossaNemico } from '../../src/core/ai.ts';
import { registraProfilo, trovaProfilo } from '../../src/data/enemies.ts';

// --- Banco di prova: le mosse nemiche di §4.6 ------------------------------------------------------
const att = (forza: 'leggero' | 'pesante', portata: 'corta' | 'lunga', velocita: 'rapido' | 'normale' | 'lento', d: number, extra = {}) => ({
  forza,
  portata,
  velocita,
  danno: [d, d] as [number, number],
  ...extra,
});
const ass = (id: string, a: ReturnType<typeof att>): Mossa => ({ id, nome: id, archetipo: 'assalto', attacco: a });

const MOSSE: Mossa[] = [
  ass('P1', att('pesante', 'corta', 'normale', 6)), // §4.6: P1 pesante, corta, normale, 6
  ass('P2', att('pesante', 'lunga', 'lento', 6)), // P2 pesante, lunga, lenta, 6
  ass('L1', att('leggero', 'corta', 'rapido', 3)), // L1 leggero, corta, rapido, 3
  ass('L2', att('leggero', 'lunga', 'normale', 3)), // L2 leggero, lunga, normale, 3
  { id: 'D', nome: 'D', archetipo: 'guardia' }, // D guardia senza attacco, parata grado 1
  { id: 'PR', nome: 'PR', archetipo: 'preparazione' }, // PR preparazione
  // Per i test dedicati (§4.6): sfondaGuardia, inarrestabile e un pesante lento interrompibile.
  ass('SG', att('pesante', 'corta', 'normale', 6, { sfondaGuardia: true })),
  ass('IN', att('pesante', 'corta', 'lento', 6, { inarrestabile: true })),
  ass('PL', att('pesante', 'corta', 'lento', 6)),
  // Per il caso derivato dello scambio simultaneo con vantaggio di entrambi.
  ass('PV', { forza: 'pesante', portata: 'corta', velocita: 'normale', danno: [5, 7] }),
];

const BANCO: Profilo = {
  id: 'audit-banco',
  nome: 'Banco',
  vigore: 60,
  fiato: 6,
  velocita: 2, // §4.6: velocità dei combattenti uguali (2)
  gradi: { parata: 1, schivata: 1, distanza: 1 },
  mosse: MOSSE,
  fase1: { mosse: MOSSE.map((m) => ({ mossa: m.id, peso: 1 })), adattamento: 1 },
};
registraProfilo(BANCO);

// Dado finto di §4.6 e §12.3: Assalto 5, Guardia 2, contrattacco 3, Punta 2, Arresto 3.
// Le mosse nemiche di prova hanno danno fisso. Contrattacco di grado 2 (3–4 +1): tiro 4.
const TIRI: Record<string, number> = { '4-6': 5, '1-2': 2, '3-4': 3, '2-3': 3, '4-5': 4 };
const dadoMatrice: Dado = (min, max) => {
  if (min === max) return min;
  const v = TIRI[`${min}-${max}`];
  if (v === undefined) throw new Error(`tiro non previsto dal banco: ${min}–${max}`);
  return v;
};
const dadoMin: Dado = (min) => min;

interface Prep {
  postura: PosturaId;
  mossa: string;
  gFiato?: number;
  nFiato?: number;
  gVant?: boolean;
  nVant?: boolean;
  gPrep?: boolean;
  gradi?: Partial<Gradi>;
  gVigore?: number;
  nVigore?: number;
  turno?: number;
  opzioni?: { hintCompleti?: boolean; anteprimaDanni?: boolean };
}

// Stato di partenza della matrice: il giocatore è già nella postura (nessun costo di cambio),
// fiato sufficiente (4 su 6), nessun vantaggio, nessun preparato; il nemico è nell'archetipo della mossa.
function banco(p: Prep): StatoDuello {
  const s = creaDuello('audit-banco', 1, { adattamento: false, hintCompleti: !!p.opzioni?.hintCompleti, anteprimaDanni: !!p.opzioni?.anteprimaDanni }, p.gradi ?? {});
  const m = MOSSE.find((x) => x.id === p.mossa) as Mossa;
  s.mossaNemico = m.id;
  s.giocatore.postura = p.postura;
  s.giocatore.fiato = p.gFiato ?? 4;
  s.giocatore.fiatoMax = 6;
  s.giocatore.vantaggio = !!p.gVant;
  s.giocatore.preparato = !!p.gPrep;
  if (p.gVigore !== undefined) s.giocatore.vigore = p.gVigore;
  s.nemico.postura = m.archetipo;
  s.nemico.fiato = p.nFiato ?? 3;
  s.nemico.fiatoMax = 6;
  s.nemico.vantaggio = !!p.nVant;
  s.nemico.preparato = false;
  if (p.nVigore !== undefined) s.nemico.vigore = p.nVigore;
  if (p.turno !== undefined) s.turno = p.turno;
  return s;
}

function gioca(s: StatoDuello, postura: PosturaId, dado: Dado = dadoMatrice) {
  const r = resolveTurn(s, postura, { dado, saltaIA: true });
  return {
    r,
    subisce: s.giocatore.vigore - r.stato.giocatore.vigore,
    infligge: s.nemico.vigore - r.stato.nemico.vigore,
    tipi: r.eventi.map((e) => `${e.tipo}${'chi' in e ? ':' + e.chi : ''}`),
  };
}

// --- Matrice §4.6 con le celle modificate dal §12.3 -----------------------------------------------
// gF/nF: fiato atteso a fine turno con i valori di §4.2 (parata 1, schivata 2; recupero assalto 0,
// guardia 2, attesa 1, distanza 2, preparazione 3), partendo da 4 (giocatore) e 3 (nemico) su 6.
interface Cella {
  p: PosturaId;
  m: string;
  subisce: number;
  infligge: number;
  gV: boolean; // vantaggio del giocatore al turno successivo
  nV: boolean;
  gP?: boolean; // preparato a fine turno
  nP?: boolean;
  gF: number;
  nF: number;
  con?: string[]; // eventi attesi (tipo:chi)
  senza?: string[]; // eventi esclusi
  testo: string; // la cella come la scrive la specifica
}

const MATRICE: Cella[] = [
  // Assalto: pesante, corta, normale, tiro 5.
  { p: 'assalto', m: 'P1', subisce: 6, infligge: 5, gV: false, nV: false, gF: 4, nF: 3, senza: ['interrotto:nemico', 'interrotto:giocatore'], testo: '§4.6 simultanei: subisce 6, infligge 5 (§12.1 5b: nessun vantaggio)' },
  { p: 'assalto', m: 'P2', subisce: 0, infligge: 5, gV: true, nV: false, gF: 4, nF: 3, con: ['interrotto:nemico'], testo: '§4.6 giocatore primo e interrompe: subisce 0, infligge 5, +vantaggio' },
  { p: 'assalto', m: 'L1', subisce: 3, infligge: 5, gV: true, nV: false, gF: 4, nF: 3, senza: ['interrotto:giocatore'], testo: '§4.6 nemico primo: subisce 3, infligge 5 (§4.4.6: il pesante a segno dopo il colpo subito dà il vantaggio)' },
  { p: 'assalto', m: 'L2', subisce: 3, infligge: 5, gV: false, nV: false, gF: 4, nF: 3, testo: '§4.6 simultanei: subisce 3, infligge 5 (§12.1 5b: chi incassa nello scambio simultaneo non tiene il vantaggio)' },
  { p: 'assalto', m: 'D', subisce: 0, infligge: 2, gV: false, nV: false, gF: 4, nF: 4, con: ['parata:nemico'], testo: '§4.6 parato: infligge 2 (5×0,4)' },
  { p: 'assalto', m: 'PR', subisce: 0, infligge: 5, gV: true, nV: false, nP: false, gF: 4, nF: 6, con: ['rotta:nemico'], testo: '§4.6 infligge 5, preparazione rotta, +vantaggio' },
  // Guardia: leggero, corta, rapido, tiro 2; Parata di grado 1.
  { p: 'guardia', m: 'P1', subisce: 2, infligge: 2, gV: false, nV: false, gF: 5, nF: 3, con: ['parata:giocatore'], testo: '§4.6 giocatore primo: infligge 2, para 6→2' },
  { p: 'guardia', m: 'P2', subisce: 2, infligge: 2, gV: false, nV: false, gF: 5, nF: 3, con: ['parata:giocatore'], testo: '§4.6 infligge 2, para 6→2' },
  { p: 'guardia', m: 'L1', subisce: 1, infligge: 2, gV: false, nV: false, gF: 5, nF: 3, con: ['parata:giocatore'], testo: '§4.6 simultanei: infligge 2, para 3→1' },
  { p: 'guardia', m: 'L2', subisce: 1, infligge: 2, gV: false, nV: false, gF: 5, nF: 3, con: ['parata:giocatore'], testo: '§4.6 infligge 2, para 3→1' },
  { p: 'guardia', m: 'D', subisce: 0, infligge: 1, gV: false, nV: false, gF: 6, nF: 4, con: ['parata:nemico'], testo: '§4.6 infligge 2×0,4 → 1' },
  { p: 'guardia', m: 'PR', subisce: 0, infligge: 2, gV: false, nV: false, nP: true, gF: 6, nF: 6, senza: ['rotta:nemico'], testo: '§4.6 infligge 2, il nemico diventa preparato' },
  // Attesa: nessun attacco; Schivata di grado 1 (−2 fiato); contrattacco 3 se il colpo è corto.
  { p: 'attesa', m: 'P1', subisce: 0, infligge: 3, gV: false, nV: false, gP: false, gF: 3, nF: 3, con: ['schivata:giocatore', 'contrattacco:giocatore'], testo: '§4.6 schivata: subisce 0, contrattacco 3 (§12.3 invariata)' },
  { p: 'attesa', m: 'P2', subisce: 0, infligge: 0, gV: false, nV: false, gP: false, gF: 3, nF: 3, con: ['schivata:giocatore'], senza: ['contrattacco:giocatore'], testo: '§4.6 schivata senza contrattacco: 0/0' },
  { p: 'attesa', m: 'L1', subisce: 3, infligge: 0, gV: false, nV: false, gP: false, gF: 5, nF: 3, senza: ['schivata:giocatore'], testo: '§4.6 schivata fallita: subisce 3' },
  { p: 'attesa', m: 'L2', subisce: 0, infligge: 0, gV: false, nV: false, gP: false, gF: 3, nF: 3, con: ['schivata:giocatore'], senza: ['contrattacco:giocatore'], testo: '§4.6 schivata senza contrattacco: 0/0' },
  { p: 'attesa', m: 'D', subisce: 0, infligge: 0, gV: false, nV: false, gP: true, gF: 5, nF: 5, con: ['preparato:giocatore'], testo: '§12.3 il giocatore diventa preparato' },
  { p: 'attesa', m: 'PR', subisce: 0, infligge: 0, gV: false, nV: false, gP: true, nP: true, gF: 5, nF: 6, con: ['preparato:giocatore', 'preparato:nemico'], testo: '§12.3 entrambi preparati' },
  // Distanza di grado 1: evita i colpi corti, ×1,25 sui lunghi; chi attacca la Distanza incalza (R1).
  { p: 'distanza', m: 'P1', subisce: 0, infligge: 0, gV: false, nV: true, gF: 6, nF: 3, con: ['evitato:giocatore', 'incalza:nemico'], testo: '§12.3 evitato, il nemico incalza (+vantaggio)' },
  { p: 'distanza', m: 'P2', subisce: 8, infligge: 0, gV: false, nV: true, gF: 6, nF: 3, con: ['incalza:nemico'], senza: ['evitato:giocatore'], testo: '§12.3 subisce 8 (6×1,25), il nemico incalza' },
  { p: 'distanza', m: 'L1', subisce: 0, infligge: 0, gV: false, nV: true, gF: 6, nF: 3, con: ['evitato:giocatore', 'incalza:nemico'], testo: '§12.3 evitato, il nemico incalza' },
  { p: 'distanza', m: 'L2', subisce: 4, infligge: 0, gV: false, nV: true, gF: 6, nF: 3, con: ['incalza:nemico'], senza: ['evitato:giocatore'], testo: '§12.3 subisce 4 (3×1,25), il nemico incalza' },
  { p: 'distanza', m: 'D', subisce: 0, infligge: 0, gV: false, nV: false, gF: 6, nF: 5, senza: ['incalza:nemico'], testo: '§12.3 niente' },
  { p: 'distanza', m: 'PR', subisce: 0, infligge: 0, gV: false, nV: false, nP: true, gF: 6, nF: 6, con: ['preparato:nemico'], testo: '§12.3 il nemico diventa preparato' },
];

function controllaCella(c: Cella): string[] {
  const s = banco({ postura: c.p, mossa: c.m });
  const g = gioca(s, c.p);
  const e: string[] = [];
  if (g.subisce !== c.subisce) e.push(`subisce ${g.subisce} invece di ${c.subisce}`);
  if (g.infligge !== c.infligge) e.push(`infligge ${g.infligge} invece di ${c.infligge}`);
  if (g.r.stato.giocatore.vantaggio !== c.gV) e.push(`vantaggio del giocatore ${g.r.stato.giocatore.vantaggio} invece di ${c.gV}`);
  if (g.r.stato.nemico.vantaggio !== c.nV) e.push(`vantaggio del nemico ${g.r.stato.nemico.vantaggio} invece di ${c.nV}`);
  if (c.gP !== undefined && g.r.stato.giocatore.preparato !== c.gP) e.push(`giocatore preparato ${g.r.stato.giocatore.preparato} invece di ${c.gP}`);
  if (c.nP !== undefined && g.r.stato.nemico.preparato !== c.nP) e.push(`nemico preparato ${g.r.stato.nemico.preparato} invece di ${c.nP}`);
  if (g.r.stato.giocatore.fiato !== c.gF) e.push(`fiato del giocatore ${g.r.stato.giocatore.fiato} invece di ${c.gF}`);
  if (g.r.stato.nemico.fiato !== c.nF) e.push(`fiato del nemico ${g.r.stato.nemico.fiato} invece di ${c.nF}`);
  for (const t of c.con ?? []) if (!g.tipi.includes(t)) e.push(`manca l'evento ${t}`);
  for (const t of c.senza ?? []) if (g.tipi.includes(t)) e.push(`evento inatteso ${t}`);
  return e;
}

// --- Casi dedicati ---------------------------------------------------------------------------------
interface Caso {
  nome: string;
  rif: string;
  gravita: Gravita;
  prova: () => string | null; // null = conforme
}

const casi: Caso[] = [
  // §4.4 gradi di Parata e Schivata
  { nome: 'Parata grado 2: colpo leggero annullato', rif: '§4.4 guardia', gravita: 'Bloccante', prova() {
    const g = gioca(banco({ postura: 'guardia', mossa: 'L1', gradi: { parata: 2 } }), 'guardia');
    return g.subisce === 0 && g.tipi.includes('parata:giocatore') ? null : `subisce ${g.subisce}, eventi ${g.tipi.join(',')}`;
  } },
  { nome: 'Parata grado 2: colpo pesante ×0,4', rif: '§4.4 guardia', gravita: 'Bloccante', prova() {
    const g = gioca(banco({ postura: 'guardia', mossa: 'P1', gradi: { parata: 2 } }), 'guardia');
    return g.subisce === 2 && !g.r.stato.giocatore.vantaggio ? null : `subisce ${g.subisce}, vantaggio ${g.r.stato.giocatore.vantaggio}`;
  } },
  { nome: 'Parata grado 3: il pesante parato dà il vantaggio', rif: '§4.4 guardia', gravita: 'Bloccante', prova() {
    const g = gioca(banco({ postura: 'guardia', mossa: 'P1', gradi: { parata: 3 } }), 'guardia');
    return g.subisce === 2 && g.r.stato.giocatore.vantaggio ? null : `subisce ${g.subisce}, vantaggio ${g.r.stato.giocatore.vantaggio}`;
  } },
  { nome: 'Schivata grado 2: contrattacco 4 (3 +1) e vantaggio', rif: '§4.4 attesa', gravita: 'Bloccante', prova() {
    const g = gioca(banco({ postura: 'attesa', mossa: 'P1', gradi: { schivata: 2 } }), 'attesa');
    return g.infligge === 4 && g.subisce === 0 && g.r.stato.giocatore.vantaggio ? null : `infligge ${g.infligge}, subisce ${g.subisce}, vantaggio ${g.r.stato.giocatore.vantaggio}`;
  } },
  { nome: 'Schivata grado 2 contro un colpo lungo: vantaggio senza contrattacco', rif: '§4.4 attesa', gravita: 'Maggiore', prova() {
    const g = gioca(banco({ postura: 'attesa', mossa: 'P2', gradi: { schivata: 2 } }), 'attesa');
    return g.infligge === 0 && g.r.stato.giocatore.vantaggio ? null : `infligge ${g.infligge}, vantaggio ${g.r.stato.giocatore.vantaggio}`;
  } },
  { nome: 'Schivata grado 2 contro un colpo rapido: fallisce', rif: '§4.4 attesa', gravita: 'Bloccante', prova() {
    const g = gioca(banco({ postura: 'attesa', mossa: 'L1', gradi: { schivata: 2 } }), 'attesa');
    return g.subisce === 3 ? null : `subisce ${g.subisce}`;
  } },
  { nome: 'Schivata grado 3: schiva anche i colpi rapidi', rif: '§4.4 attesa', gravita: 'Bloccante', prova() {
    const g = gioca(banco({ postura: 'attesa', mossa: 'L1', gradi: { schivata: 3 } }), 'attesa');
    return g.subisce === 0 && g.infligge === 4 ? null : `subisce ${g.subisce}, infligge ${g.infligge} (atteso contrattacco 3+1)`;
  } },
  // Fiato zero
  { nome: 'Fiato zero: niente Parata e danno ×1,25', rif: '§4.2, §4.4.4', gravita: 'Bloccante', prova() {
    const g = gioca(banco({ postura: 'guardia', mossa: 'P1', gFiato: 0 }), 'guardia');
    return g.subisce === 8 && !g.tipi.includes('parata:giocatore') ? null : `subisce ${g.subisce}, eventi ${g.tipi.join(',')}`;
  } },
  { nome: 'Fiato 1 in Attesa: la Schivata non scatta', rif: '§4.4 attesa (fiato ≥ 2)', gravita: 'Bloccante', prova() {
    const g = gioca(banco({ postura: 'attesa', mossa: 'P1', gFiato: 1 }), 'attesa');
    return g.subisce === 6 ? null : `subisce ${g.subisce}`;
  } },
  { nome: 'Fiato zero del bersaglio nemico: ×1,25 anche sul colpo del giocatore', rif: '§4.2, §4.4.4', gravita: 'Bloccante', prova() {
    const g = gioca(banco({ postura: 'guardia', mossa: 'P2', nFiato: 0 }), 'guardia');
    return g.infligge === 3 ? null : `infligge ${g.infligge} (atteso 2×1,25 → 3)`;
  } },
  { nome: 'Fiato zero dell\'attaccante: ×1,25 sul contrattacco', rif: '§4.4.7', gravita: 'Bloccante', prova() {
    const g = gioca(banco({ postura: 'attesa', mossa: 'P1', nFiato: 0 }), 'attesa');
    return g.infligge === 4 ? null : `infligge ${g.infligge} (atteso 3×1,25 → 4)`;
  } },
  // sfondaGuardia e inarrestabile
  { nome: 'sfondaGuardia ignora la Parata', rif: '§3, §4.4', gravita: 'Bloccante', prova() {
    const g = gioca(banco({ postura: 'guardia', mossa: 'SG' }), 'guardia');
    return g.subisce === 6 && !g.tipi.includes('parata:giocatore') ? null : `subisce ${g.subisce}`;
  } },
  { nome: 'inarrestabile: il pesante a segno non lo interrompe', rif: '§3, §4.4.6', gravita: 'Bloccante', prova() {
    const g = gioca(banco({ postura: 'assalto', mossa: 'IN', gVant: true }), 'assalto');
    return g.subisce === 6 && g.infligge === 6 && !g.tipi.includes('interrotto:nemico') ? null : `subisce ${g.subisce}, infligge ${g.infligge}, eventi ${g.tipi.join(',')}`;
  } },
  { nome: 'lo stesso pesante non inarrestabile viene interrotto', rif: '§4.4.6', gravita: 'Bloccante', prova() {
    const g = gioca(banco({ postura: 'assalto', mossa: 'PL', gVant: true }), 'assalto');
    return g.subisce === 0 && g.tipi.includes('interrotto:nemico') ? null : `subisce ${g.subisce}`;
  } },
  // Vantaggio
  { nome: 'Vantaggio: colpisce per primo, al massimo, interrompe; poi lo riprende col pesante a segno', rif: '§4.3.4, §4.4.2, §4.5', gravita: 'Bloccante', prova() {
    const g = gioca(banco({ postura: 'assalto', mossa: 'P1', gVant: true }), 'assalto');
    return g.subisce === 0 && g.infligge === 6 && g.r.stato.giocatore.vantaggio ? null : `subisce ${g.subisce}, infligge ${g.infligge}, vantaggio ${g.r.stato.giocatore.vantaggio}`;
  } },
  { nome: 'Vantaggio conservato da chi non attacca', rif: '§4.5 uso', gravita: 'Bloccante', prova() {
    const g = gioca(banco({ postura: 'attesa', mossa: 'D', gVant: true }), 'attesa');
    return g.r.stato.giocatore.vantaggio ? null : 'vantaggio perso senza attaccare';
  } },
  { nome: 'Vantaggio perso da chi incassa danno', rif: '§4.5 perdita', gravita: 'Bloccante', prova() {
    const g = gioca(banco({ postura: 'distanza', mossa: 'P2', gVant: true }), 'distanza');
    return g.subisce === 8 && !g.r.stato.giocatore.vantaggio ? null : `subisce ${g.subisce}, vantaggio ${g.r.stato.giocatore.vantaggio}`;
  } },
  { nome: 'Vantaggio in arrivo perso se dopo si incassa danno nello stesso turno', rif: '§4.5 perdita', gravita: 'Bloccante', prova() {
    // Il giocatore (vantaggio) colpisce per primo col pesante: guadagna il vantaggio in arrivo; poi l'inarrestabile lo colpisce.
    const g = gioca(banco({ postura: 'assalto', mossa: 'IN', gVant: true }), 'assalto');
    return !g.r.stato.giocatore.vantaggio ? null : 'il vantaggio guadagnato prima del colpo subito è rimasto';
  } },
  { nome: 'Guadagno differito: vale dal turno successivo', rif: '§4.5 guadagno', gravita: 'Bloccante', prova() {
    const s = banco({ postura: 'assalto', mossa: 'PR' });
    const g1 = gioca(s, 'assalto');
    const s2 = g1.r.stato;
    s2.mossaNemico = 'P1';
    s2.nemico.postura = 'assalto';
    const g2 = gioca(s2, 'assalto');
    return g2.subisce === 0 && g2.infligge === 6 ? null : `turno successivo: subisce ${g2.subisce}, infligge ${g2.infligge} (atteso primo e al massimo)`;
  } },
  { nome: 'Ordine: il vantaggio di uno solo prevale sulla velocità della mossa', rif: '§4.3.4', gravita: 'Bloccante', prova() {
    const g = gioca(banco({ postura: 'assalto', mossa: 'P2', nVant: true }), 'assalto');
    return g.subisce === 6 && g.infligge === 0 && g.tipi.includes('interrotto:giocatore') ? null : `subisce ${g.subisce}, infligge ${g.infligge}`;
  } },
  // Preparato
  { nome: 'Preparato: prossimo attacco ×1,5, poi si consuma', rif: '§4.4.2, §12.2 R3', gravita: 'Bloccante', prova() {
    const g = gioca(banco({ postura: 'assalto', mossa: 'P2', gPrep: true }), 'assalto');
    return g.infligge === 8 && !g.r.stato.giocatore.preparato ? null : `infligge ${g.infligge} (atteso 5×1,5 → 8), preparato ${g.r.stato.giocatore.preparato}`;
  } },
  // Fine del duello
  { nome: 'Vittoria: i colpi successivi non si risolvono', rif: '§4.3.5', gravita: 'Bloccante', prova() {
    const g = gioca(banco({ postura: 'guardia', mossa: 'P1', nVigore: 1 }), 'guardia');
    return g.r.stato.esito === 'vittoria' && g.subisce === 0 ? null : `esito ${g.r.stato.esito}, subisce ${g.subisce}`;
  } },
  { nome: 'Entrambi a 0 nello scambio simultaneo: pareggio', rif: '§4.3.5, §12.1 4', gravita: 'Bloccante', prova() {
    const g = gioca(banco({ postura: 'assalto', mossa: 'P1', gVigore: 6, nVigore: 5 }), 'assalto');
    return g.r.stato.esito === 'pareggio' ? null : `esito ${g.r.stato.esito}`;
  } },
  { nome: 'Pareggio al 25° turno', rif: '§4.1', gravita: 'Bloccante', prova() {
    const a = gioca(banco({ postura: 'distanza', mossa: 'D', turno: 24 }), 'distanza');
    const b = gioca(banco({ postura: 'distanza', mossa: 'D', turno: 25 }), 'distanza');
    return a.r.stato.esito === 'in corso' && b.r.stato.esito === 'pareggio' ? null : `turno 24 → ${a.r.stato.esito}, turno 25 → ${b.r.stato.esito}`;
  } },
  { nome: 'Cambio non consentito senza fiato', rif: '§4.2', gravita: 'Bloccante', prova() {
    const s = banco({ postura: 'guardia', mossa: 'D', gFiato: 0 });
    let lancia = false;
    try { resolveTurn(s, 'assalto', { dado: dadoMatrice, saltaIA: true }); } catch { lancia = true; }
    const v = toDuelView(s).posture.find((p) => p.id === 'assalto');
    const tenere = gioca(s, 'guardia');
    return lancia && v?.disponibile === false && v.motivo === 'fiato' && tenere.r.stato.esito === 'in corso' ? null : `eccezione ${lancia}, vista ${JSON.stringify(v)}`;
  } },
  { nome: 'Cambio di postura: 1 fiato; tenere la postura è gratis', rif: '§4.2', gravita: 'Bloccante', prova() {
    const a = gioca(banco({ postura: 'guardia', mossa: 'D' }), 'distanza'); // 4 −1 +2 = 5
    const b = gioca(banco({ postura: 'distanza', mossa: 'D' }), 'distanza'); // 4 +2 = 6
    return a.r.stato.giocatore.fiato === 5 && b.r.stato.giocatore.fiato === 6 ? null : `fiato ${a.r.stato.giocatore.fiato} e ${b.r.stato.giocatore.fiato} (attesi 5 e 6)`;
  } },
  // §12.3 Gradi della Distanza
  { nome: 'Distanza grado 2 contro P1: Punta 2, nessun incalzare, −1 fiato', rif: '§12.3, R4', gravita: 'Bloccante', prova() {
    const g = gioca(banco({ postura: 'distanza', mossa: 'P1', gradi: { distanza: 2 } }), 'distanza');
    return g.infligge === 2 && !g.tipi.includes('incalza:nemico') && g.tipi.includes('punta:giocatore') && !g.r.stato.nemico.vantaggio && g.r.stato.giocatore.fiato === 5 ? null : `infligge ${g.infligge}, eventi ${g.tipi.join(',')}, fiato ${g.r.stato.giocatore.fiato}`;
  } },
  { nome: 'Distanza grado 2 contro L1: nessuna Punta e incalzare', rif: '§12.3, R4', gravita: 'Bloccante', prova() {
    const g = gioca(banco({ postura: 'distanza', mossa: 'L1', gradi: { distanza: 2 } }), 'distanza');
    return g.infligge === 0 && g.tipi.includes('incalza:nemico') && g.r.stato.nemico.vantaggio ? null : `infligge ${g.infligge}, eventi ${g.tipi.join(',')}`;
  } },
  { nome: 'Distanza grado 3 contro P1: Arresto 3 e vantaggio al giocatore', rif: '§12.3, R4', gravita: 'Bloccante', prova() {
    const g = gioca(banco({ postura: 'distanza', mossa: 'P1', gradi: { distanza: 3 } }), 'distanza');
    return g.infligge === 3 && g.tipi.includes('arresto:giocatore') && g.r.stato.giocatore.vantaggio && !g.r.stato.nemico.vantaggio && g.r.stato.giocatore.fiato === 5 ? null : `infligge ${g.infligge}, eventi ${g.tipi.join(',')}`;
  } },
  { nome: 'Distanza grado 3 contro L1: nessun Arresto (rapido) e incalzare', rif: '§12.3, R4', gravita: 'Bloccante', prova() {
    const g = gioca(banco({ postura: 'distanza', mossa: 'L1', gradi: { distanza: 3 } }), 'distanza');
    return g.infligge === 0 && g.tipi.includes('incalza:nemico') ? null : `infligge ${g.infligge}, eventi ${g.tipi.join(',')}`;
  } },
  { nome: 'Distanza grado 3 contro L2: colpo lungo, ×1,25 e incalzare', rif: '§12.3, R4', gravita: 'Bloccante', prova() {
    const g = gioca(banco({ postura: 'distanza', mossa: 'L2', gradi: { distanza: 3 } }), 'distanza');
    return g.subisce === 4 && g.infligge === 0 && g.tipi.includes('incalza:nemico') ? null : `subisce ${g.subisce}, infligge ${g.infligge}`;
  } },
  { nome: 'Distanza grado 3 contro un pesante rapido: vale la Punta', rif: 'R4 tabella', gravita: 'Maggiore', prova() {
    registraProfilo({ ...BANCO, id: 'audit-banco-r', mosse: [...MOSSE, ass('PRR', att('pesante', 'corta', 'rapido', 6))], fase1: { mosse: [{ mossa: 'PRR', peso: 1 }], adattamento: 1 } });
    const s = banco({ postura: 'distanza', mossa: 'P1', gradi: { distanza: 3 } });
    s.nemico.profiloId = 'audit-banco-r';
    s.mossaNemico = 'PRR';
    const g = gioca(s, 'distanza');
    return g.infligge === 2 && g.tipi.includes('punta:giocatore') && !g.r.stato.giocatore.vantaggio ? null : `infligge ${g.infligge}, eventi ${g.tipi.join(',')}`;
  } },
  { nome: 'Fiato zero: nessuna Punta né Arresto; il colpo corto arriva ×1,25 e incalza', rif: '§12.3, R4, §12.1 6d', gravita: 'Bloccante', prova() {
    const g = gioca(banco({ postura: 'distanza', mossa: 'P1', gFiato: 0, gradi: { distanza: 3 } }), 'distanza');
    return g.subisce === 8 && g.infligge === 0 && !g.tipi.some((t) => /^(punta|arresto|evitato)/.test(t)) && g.tipi.includes('incalza:nemico') ? null : `subisce ${g.subisce}, eventi ${g.tipi.join(',')}`;
  } },
  // §12.3 Spazio alle spalle
  { nome: 'Spazio alle spalle: indisponibile al terzo turno, cambio gratuito, contatore azzerato', rif: '§12.3, R2', gravita: 'Bloccante', prova() {
    let s = banco({ postura: 'distanza', mossa: 'D' });
    const t1 = gioca(s, 'distanza');
    const t2 = gioca(t1.r.stato, 'distanza');
    s = t2.r.stato;
    const errori: string[] = [];
    if (!t2.tipi.includes('spalleAlMuro:giocatore')) errori.push('manca spalleAlMuro al secondo turno');
    const v = toDuelView(s);
    const d = v.posture.find((p) => p.id === 'distanza');
    if (d?.disponibile !== false || d.motivo !== 'spazio') errori.push(`terzo turno: Distanza ${JSON.stringify(d)}`);
    if (v.giocatore.spazio !== 2) errori.push(`spazio ${v.giocatore.spazio}`);
    let lancia = false;
    try { resolveTurn(s, 'distanza', { dado: dadoMatrice, saltaIA: true }); } catch { lancia = true; }
    if (!lancia) errori.push('resolveTurn accetta la Distanza senza spazio');
    s.giocatore.fiato = 0;
    const altre = toDuelView(s).posture.filter((p) => p.id !== 'distanza');
    if (altre.some((p) => !p.disponibile || p.costo !== 0)) errori.push(`a fiato 0 le altre posture devono essere gratuite: ${JSON.stringify(altre.map((p) => [p.id, p.disponibile, p.costo]))}`);
    const t3 = gioca(s, 'guardia');
    if (t3.r.stato.giocatore.fiato !== 2) errori.push(`fiato dopo il cambio gratuito ${t3.r.stato.giocatore.fiato} (atteso 0 + 2)`);
    if (t3.r.stato.giocatore.distanzaConsecutive !== 0) errori.push('contatore non azzerato');
    if (toDuelView(t3.r.stato).posture.find((p) => p.id === 'distanza')?.disponibile !== true) errori.push('Distanza non torna disponibile');
    return errori.length ? errori.join('; ') : null;
  } },
  { nome: 'Spazio alle spalle per l\'IA: niente mosse di Distanza, cambio gratuito', rif: 'R2', gravita: 'Bloccante', prova() {
    const s = creaDuello('lanciere', 3);
    s.nemico.postura = 'distanza';
    s.nemico.distanzaConsecutive = 2;
    s.nemico.fiato = 0;
    const ids = pesiCandidate(s).map((c) => c.mossa.id);
    return !ids.includes('tenereABada') && ids.includes('affondoLungo') && ids.includes('colpoDAsta') ? null : `candidate ${ids.join(',')}`;
  } },
  // §12.3 Attesa preparata
  { nome: 'Attesa: nessun accumulo del preparato', rif: '§12.3, R3', gravita: 'Bloccante', prova() {
    const g1 = gioca(banco({ postura: 'attesa', mossa: 'D', gPrep: true }), 'attesa');
    const s = g1.r.stato;
    if (!s.giocatore.preparato) return 'il preparato si è perso';
    s.mossaNemico = 'P2';
    s.nemico.postura = 'assalto';
    const g2 = gioca(s, 'assalto');
    return g2.infligge === 8 ? null : `infligge ${g2.infligge} (atteso 5×1,5 → 8)`;
  } },
  { nome: 'Attesa: ×1,5 sul contrattacco, poi si consuma', rif: '§12.3, R3', gravita: 'Bloccante', prova() {
    const g = gioca(banco({ postura: 'attesa', mossa: 'P1', gPrep: true }), 'attesa');
    return g.infligge === 5 && !g.r.stato.giocatore.preparato ? null : `infligge ${g.infligge} (atteso 3×1,5 → 5), preparato ${g.r.stato.giocatore.preparato}`;
  } },
  { nome: 'Preparato ×1,5 su Punta e Arresto', rif: 'R3', gravita: 'Bloccante', prova() {
    const p = gioca(banco({ postura: 'distanza', mossa: 'P1', gPrep: true, gradi: { distanza: 2 } }), 'distanza');
    const a = gioca(banco({ postura: 'distanza', mossa: 'P1', gPrep: true, gradi: { distanza: 3 } }), 'distanza');
    return p.infligge === 3 && a.infligge === 5 ? null : `Punta ${p.infligge} (atteso 3), Arresto ${a.infligge} (atteso 5)`;
  } },
  // §4.7 fasi
  { nome: 'Fase 2 del Mietitore a metà vigore', rif: '§4.7', gravita: 'Bloccante', prova() {
    const s = creaDuello('mietitore', 5);
    s.nemico.vigore = Math.floor(s.nemico.vigoreMax / 2);
    s.giocatore.fiato = 6;
    const r = resolveTurn(s, 'distanza', { dado: dadoMin });
    const sopra = creaDuello('mietitore', 5);
    sopra.nemico.vigore = Math.floor(sopra.nemico.vigoreMax / 2) + 1;
    const r2 = resolveTurn(sopra, 'distanza', { dado: dadoMin });
    const ok = r.stato.nemico.fase === 2 && r.eventi.some((e) => e.tipo === 'fase2') && (r2.stato.nemico.fase === 1 || r2.stato.nemico.vigore <= r2.stato.nemico.vigoreMax / 2);
    return ok ? null : `fase ${r.stato.nemico.fase}; sopra la soglia: fase ${r2.stato.nemico.fase}`;
  } },
  { nome: 'Fase 2: l\'IA usa il profilo della fase 2 (Carica solo in fase 2)', rif: '§4.7, §6', gravita: 'Bloccante', prova() {
    let f1 = 0;
    let f2 = 0;
    for (let seed = 1; seed <= 400; seed++) {
      const s = creaDuello('mietitore', seed);
      if (sceglieMossaNemico(s) === 'carica') f1++;
      s.nemico.fase = 2;
      if (sceglieMossaNemico(s) === 'carica') f2++;
    }
    return f1 === 0 && f2 > 0 ? null : `Carica in fase 1: ${f1}, in fase 2: ${f2}`;
  } },
  // §5 IA
  { nome: 'Candidate: senza fiato il nemico resta nell\'archetipo attuale', rif: '§5.1', gravita: 'Bloccante', prova() {
    const s = creaDuello('duellante', 2);
    s.nemico.postura = 'assalto';
    s.nemico.fiato = 0;
    const archetipi = new Set(pesiCandidate(s).map((c) => c.mossa.archetipo));
    return archetipi.size === 1 && archetipi.has('assalto') ? null : `archetipi candidati ${[...archetipi].join(',')}`;
  } },
  { nome: 'Recluta: sequenza ciclica Fendente, Copertura', rif: '§5.2, §6', gravita: 'Bloccante', prova() {
    let s = creaDuello('recluta', 9);
    const seq = [s.mossaNemico];
    for (let i = 0; i < 5 && s.esito === 'in corso'; i++) {
      const p: PosturaId = s.giocatore.distanzaConsecutive >= 2 ? 'guardia' : 'distanza';
      s = resolveTurn(s, p).stato;
      seq.push(s.mossaNemico);
    }
    const atteso = ['fendente', 'copertura', 'fendente', 'copertura', 'fendente', 'copertura'].slice(0, seq.length);
    return JSON.stringify(seq) === JSON.stringify(atteso) ? null : `sequenza ${seq.join(',')}`;
  } },
  { nome: 'Adattamento: tabella §5 con R6, rapporto dei pesi dopo 2 scelte uguali', rif: '§5.4, §12.2 R6', gravita: 'Bloccante', prova() {
    // [nemico, postura ripetuta, mosse che la battono secondo la tabella]
    const attesi: Array<[string, PosturaId, string[]]> = [
      ['duellante', 'assalto', ['parata', 'invito']], // guardia e attesa; Distanza grado 1: no
      ['lanciere', 'assalto', ['tenereABada']], // R6: distanza con grado ≥ 2
      ['bruto', 'assalto', ['incassare']],
      ['bruto', 'guardia', ['spallata', 'raccogliersi']], // sfondaGuardia e preparazione
      ['duellante', 'guardia', ['battuta']],
      ['duellante', 'attesa', ['stoccata', 'battuta', 'parata']], // attacchi rapidi
      ['lanciere', 'distanza', ['affondoLungo', 'colpoDAsta']], // portata lunga
      ['mietitore', 'distanza', ['mietere']],
      ['mietitore', 'assalto', ['guardiaDOsso']],
    ];
    const errori: string[] = [];
    for (const [nemico, p, battono] of attesi) {
      const base = creaDuello(nemico, 4, { adattamento: false });
      base.nemico.fiato = base.nemico.fiatoMax;
      base.storicoPosture = [p, p];
      const on = { ...base, opzioni: { ...base.opzioni, adattamento: true } };
      const k = (trovaProfilo(nemico).fase1.adattamento);
      const pOff = new Map(pesiCandidate(base).map((c) => [c.mossa.id, c.peso]));
      for (const c of pesiCandidate(on)) {
        const r = c.peso / (pOff.get(c.mossa.id) as number);
        const atteso = battono.includes(c.mossa.id) ? k : 1;
        if (Math.abs(r - atteso) > 1e-9) errori.push(`${nemico}/${p}: ${c.mossa.id} ×${r} invece di ×${atteso}`);
      }
    }
    return errori.length ? errori.join('; ') : null;
  } },
  { nome: 'Adattamento: una sola scelta ripetuta non basta', rif: '§5.4 (ultime 2 scelte)', gravita: 'Maggiore', prova() {
    const s = creaDuello('duellante', 4);
    s.storicoPosture = ['guardia', 'assalto'];
    const off = { ...s, opzioni: { ...s.opzioni, adattamento: false } };
    return JSON.stringify(pesiCandidate(s)) === JSON.stringify(pesiCandidate(off)) ? null : 'i pesi cambiano senza due scelte uguali';
  } },
  { nome: 'Modificatori: Bruto Raccogliersi ×3 con fiatoSotto(2); Lanciere Tenere a bada ×2 con vigoreSotto(0,4)', rif: '§6', gravita: 'Bloccante', prova() {
    const b = creaDuello('bruto', 4, { adattamento: false });
    const peso = (s: StatoDuello, id: string) => pesiCandidate(s).find((c) => c.mossa.id === id)?.peso ?? NaN;
    b.nemico.postura = 'preparazione';
    b.nemico.fiato = 2;
    const pb1 = peso(b, 'raccogliersi');
    b.nemico.fiato = 1;
    const pb2 = peso(b, 'raccogliersi');
    const l = creaDuello('lanciere', 4, { adattamento: false });
    l.nemico.postura = 'distanza';
    l.nemico.vigore = Math.ceil(0.4 * l.nemico.vigoreMax);
    const pl1 = peso(l, 'tenereABada');
    l.nemico.vigore = Math.ceil(0.4 * l.nemico.vigoreMax) - 1;
    const pl2 = peso(l, 'tenereABada');
    return pb2 === 3 * pb1 && pl2 === 2 * pl1 ? null : `Bruto ${pb1}→${pb2}, Lanciere ${pl1}→${pl2}`;
  } },
  // §4.1 valori di partenza
  { nome: 'Nemico: fiato al massimo e postura iniziale = archetipo della prima mossa', rif: '§4.1', gravita: 'Bloccante', prova() {
    const errori: string[] = [];
    for (const id of ['recluta', 'duellante', 'bruto', 'lanciere', 'mietitore']) {
      for (let seed = 1; seed <= 30; seed++) {
        const s = creaDuello(id, seed);
        const m = trovaProfilo(id).mosse.find((x) => x.id === s.mossaNemico) as Mossa;
        if (s.nemico.postura !== m.archetipo || s.nemico.fiato !== s.nemico.fiatoMax) errori.push(`${id}/${seed}`);
      }
    }
    return errori.length ? `casi: ${errori.slice(0, 5).join(', ')}` : null;
  } },
  { nome: 'Giocatore: fiato 4/6, velocità 2, Guardia, gradi 1, vigore 20 (§12.1 3)', rif: '§4.1, §12.1 3', gravita: 'Maggiore', prova() {
    const g = creaDuello('bruto', 1).giocatore;
    const ok = g.fiato === 4 && g.fiatoMax === 6 && g.velocita === 2 && g.postura === 'guardia' && g.gradi.parata === 1 && g.gradi.schivata === 1 && g.gradi.distanza === 1 && g.vigore === 20 && g.vigoreMax === 20;
    return ok ? null : JSON.stringify(g);
  } },
  // §3 categoria dell'hint
  { nome: 'Categoria dell\'hint: guardia/attesa/distanza = difesa anche con attacco; assalto per forza', rif: '§3', gravita: 'Bloccante', prova() {
    const attesi: Array<[string, string, string]> = [
      ['duellante', 'parata', 'difesa'], ['duellante', 'invito', 'difesa'], ['duellante', 'stoccata', 'leggero'], ['duellante', 'affondo', 'pesante'],
      ['bruto', 'raccogliersi', 'preparazione'], ['bruto', 'incassare', 'difesa'], ['lanciere', 'tenereABada', 'difesa'], ['lanciere', 'colpoDAsta', 'pesante'],
      ['mietitore', 'mietere', 'leggero'], ['mietitore', 'guardiaDOsso', 'difesa'], ['recluta', 'copertura', 'difesa'],
    ];
    const errori: string[] = [];
    for (const [n, m, c] of attesi) {
      const s = creaDuello(n, 1);
      s.mossaNemico = m;
      const v = toDuelView(s);
      if (v.hint.categoria !== c || v.hint.simbolo !== `intent.${c}` || v.hint.dettaglio !== undefined) errori.push(`${n}/${m}: ${v.hint.categoria}`);
    }
    return errori.length ? errori.join('; ') : null;
  } },
  // §7 anteprima
  { nome: 'Anteprima con hint completi: Assalto contro P2 → subito 0–0, inflitto 4–6', rif: '§7 anteprima', gravita: 'Maggiore', prova() {
    const s = banco({ postura: 'guardia', mossa: 'P2', opzioni: { hintCompleti: true, anteprimaDanni: true } });
    const a = toDuelView(s).posture.find((p) => p.id === 'assalto')?.anteprima;
    return JSON.stringify(a) === JSON.stringify({ subito: [0, 0], inflitto: [4, 6] }) ? null : JSON.stringify(a);
  } },
  { nome: 'Anteprima per categoria (pesante = P1, P2, SG, IN, PL, PV): Distanza → subito 0–8', rif: '§7 anteprima', gravita: 'Maggiore', prova() {
    // Distanza grado 1: i pesanti corti sono evitati (0), il P2 lungo fa 6×1,25 → 8.
    const s = banco({ postura: 'guardia', mossa: 'P1', opzioni: { anteprimaDanni: true } });
    const a = toDuelView(s).posture.find((p) => p.id === 'distanza')?.anteprima;
    return JSON.stringify(a) === JSON.stringify({ subito: [0, 8], inflitto: [0, 0] }) ? null : JSON.stringify(a);
  } },
  { nome: 'Il risolutore non modifica lo stato in ingresso', rif: '§7', gravita: 'Bloccante', prova() {
    const s = banco({ postura: 'attesa', mossa: 'P1', gPrep: true, gVant: true });
    const prima = JSON.stringify(s);
    resolveTurn(s, 'assalto', { dado: dadoMatrice });
    toDuelView(s);
    return JSON.stringify(s) === prima ? null : 'stato in ingresso modificato';
  } },
  // Caso derivato: scambio simultaneo con il vantaggio di entrambi.
  { nome: 'Derivato: scambio simultaneo con il vantaggio di entrambi, i due colpi sono al massimo', rif: '§4.3.4.4 ("sullo stato precedente"), §4.4.2, §3 (risolutore simmetrico), DESIGN §5.6', gravita: 'Maggiore', prova() {
    // Assalto (4–6) contro PV (pesante, corta, normale, 5–7): stessa velocità, entrambi col vantaggio → simultanei.
    const g = gioca(banco({ postura: 'assalto', mossa: 'PV', gVant: true, nVant: true }), 'assalto', dadoMin);
    return g.infligge === 6 && g.subisce === 7 ? null : `infligge ${g.infligge} (atteso 6), subisce ${g.subisce} (atteso 7): il colpo risolto per secondo ha perso il vantaggio durante lo scambio`;
  } },
];

export const controllo: Controllo = {
  id: 'A05',
  titolo: 'Matrice di accettazione indipendente e test dedicati',
  riferimento: 'ARENA_SPEC 1.1.1 §4.4–§4.7, §5, §7, §12.2–§12.3',
  gates: ['G1'],
  esegui(): Esito {
    const esito: Esito = { voci: [], note: [] };
    let celleOk = 0;
    for (const c of MATRICE) {
      let errori: string[];
      try {
        errori = controllaCella(c);
      } catch (e) {
        errori = [`eccezione: ${(e as Error).message}`];
      }
      if (errori.length) {
        esito.voci.push({ gravita: 'Bloccante', testo: `Matrice ${c.p} × ${c.m}: ${errori.join('; ')}`, riferimento: `ARENA_SPEC ${c.testo}`, evidenza: 'audit/checks/a05-matrice.ts (MATRICE)' });
      } else celleOk++;
    }
    esito.note.push(`Matrice: ${celleOk}/${MATRICE.length} celle conformi (danni, vantaggio, preparato, fiato ed eventi).`);
    let casiOk = 0;
    const voci: Voce[] = [];
    for (const c of casi) {
      let r: string | null;
      try {
        r = c.prova();
      } catch (e) {
        r = `eccezione: ${(e as Error).message}`;
      }
      if (r) voci.push({ gravita: c.gravita, testo: `${c.nome}: ${r}`, riferimento: `ARENA_SPEC ${c.rif}`, evidenza: 'audit/checks/a05-matrice.ts' });
      else casiOk++;
    }
    esito.voci.push(...voci);
    esito.note.push(`Test dedicati e casi derivati: ${casiOk}/${casi.length} conformi.`);
    esito.note.push('Non verificabile: "Attesa preparata quando l\'attacco nemico viene interrotto" (§12.3, §12.6 4): nessuna mossa produce il caso.');
    return esito;
  },
};
