// CONTRATTO UI (ARENA_SPEC §7). L'interfaccia disegna una DuelView senza alcuna logica di gioco.
// Si modifica solo d'accordo con Planning.
import type {
  Archetipo,
  Categoria,
  Chi,
  EventoConTurno,
  Forza,
  Mossa,
  Portata,
  PosturaId,
  StatoDuello,
  Velocita,
  VoceFiato,
} from './types.ts';
import { BALANCE } from '../data/balance.ts';
import { trovaMossa, trovaProfilo } from '../data/enemies.ts';
import { NOMI_ARCHETIPO, ORDINE_POSTURE, POSTURE } from '../data/postures.ts';
import { categoriaDi, faseProfilo, mossaAccessibile } from './ai.ts';
import { motivoNonDisponibile, resolveTurn } from './resolve.ts';
import { costoCambioDi, senzaSpazio } from './spazio.ts';
import { dadoMassimo, dadoMinimo } from './rng.ts';

export interface CombattenteView {
  nome: string;
  vigore: number;
  vigoreMax: number;
  fiato: number;
  fiatoMax: number;
  postura: { id: Archetipo; nome: string; simbolo: string };
  vantaggio: boolean;
  preparato: boolean;
  spazio: number; // turni consecutivi in Distanza, al massimo 2: la scena mostra il bordo
  spalle: boolean; // spalle al muro: la Distanza non è disponibile (la UI non ripete la soglia, AUD-021)
}

export interface DuelView {
  turno: number;
  turnoMax: number;
  esito: StatoDuello['esito'];
  giocatore: CombattenteView;
  nemico: CombattenteView & { fase: 1 | 2; haFase2: boolean };
  hint: {
    categoria: Categoria;
    simbolo: string; // es. 'intent.pesante'
    dettaglio?: {
      nome: string;
      forza?: Forza;
      portata?: Portata;
      velocita?: Velocita;
      danno?: [number, number];
      flags: string[];
    }; // solo con hintCompleti
  };
  posture: Array<{
    id: PosturaId;
    nome: string;
    simbolo: string; // es. 'posture.assalto'
    attiva: boolean;
    costo: number;
    disponibile: boolean;
    motivo?: 'fiato' | 'spazio'; // perché non è disponibile
    anteprima?: { subito: [number, number]; inflitto: [number, number] }; // solo con anteprimaDanni
    // Fiato del giocatore a fine turno se sceglie questa postura: minimo e massimo sulle mosse nemiche
    // candidate. Sempre presente, indipendente dall'anteprima dei danni (ARENA_SPEC §13.2).
    fiatoFine: [number, number];
  }>;
  // dove e breve (aggiunta di C2, da confermare con Planning): su quale figura cade l'evento e la sua
  // etichetta breve ("−5", "Parata"), per il testo del colpo della scena (UI_SPEC §5.4).
  registro: Array<{ turno: number; testo: string; simbolo?: string; tipo: string; dove?: Chi; breve?: string }>;
}

function combattenteView(c: StatoDuello['giocatore']): CombattenteView {
  return {
    nome: c.nome,
    vigore: c.vigore,
    vigoreMax: c.vigoreMax,
    fiato: c.fiato,
    fiatoMax: c.fiatoMax,
    postura: { id: c.postura, nome: NOMI_ARCHETIPO[c.postura], simbolo: `posture.${c.postura}` },
    vantaggio: c.vantaggio,
    preparato: c.preparato,
    spazio: Math.min(c.distanzaConsecutive, BALANCE.distanzaConsecutiveMax),
    spalle: senzaSpazio(c),
  };
}

function dettaglioMossa(m: Mossa): NonNullable<DuelView['hint']['dettaglio']> {
  const a = m.attacco;
  if (!a) return { nome: m.nome, flags: [] };
  const flags: string[] = [];
  if (a.sfondaGuardia) flags.push('sfondaGuardia');
  if (a.inarrestabile) flags.push('inarrestabile');
  return { nome: m.nome, forza: a.forza, portata: a.portata, velocita: a.velocita, danno: [a.danno[0], a.danno[1]], flags };
}

// Mosse nemiche possibili secondo ciò che il giocatore sa: la categoria dell'hint, oppure la mossa esatta.
function mosseCandidate(stato: StatoDuello): string[] {
  const profilo = trovaProfilo(stato.nemico.profiloId);
  const esatta = trovaMossa(profilo.id, stato.mossaNemico);
  if (stato.opzioni.hintCompleti) return [esatta.id];
  const categoria = categoriaDi(esatta);
  const ids = new Set<string>([esatta.id]);
  for (const pm of faseProfilo(profilo, stato.nemico.fase).mosse) {
    const m = profilo.mosse.find((x) => x.id === pm.mossa);
    if (!m || categoriaDi(m) !== categoria) continue;
    if (mossaAccessibile(stato, m)) ids.add(m.id);
  }
  return [...ids];
}

// Danni veri di un turno, ricavati dagli eventi: non la differenza di vigore, che si ferma a 0 (AUD-003).
function dannoDaEventi(eventi: EventoConTurno[], chi: Chi): number {
  let somma = 0;
  for (const e of eventi) {
    if (e.tipo === 'colpo' && e.chi !== chi) somma += e.danno;
    else if (e.tipo === 'parata' && e.chi === chi) somma += e.danno;
    else if ((e.tipo === 'contrattacco' || e.tipo === 'punta' || e.tipo === 'arresto') && e.chi !== chi) somma += e.danno;
  }
  return somma;
}

// Simulazione di un turno per ogni mossa nemica candidata, con dado minimo e massimo: riusa resolveTurn,
// senza duplicare le regole. Ne ricava l'anteprima dei danni e il fiato previsto a fine turno.
function simulaPostura(
  stato: StatoDuello,
  postura: PosturaId,
): { subito: [number, number]; inflitto: [number, number]; fiatoFine: [number, number] } {
  let sMin = Infinity;
  let sMax = -Infinity;
  let iMin = Infinity;
  let iMax = -Infinity;
  let fMin = Infinity;
  let fMax = -Infinity;
  for (const id of mosseCandidate(stato)) {
    for (const dado of [dadoMinimo, dadoMassimo]) {
      const r = resolveTurn({ ...stato, mossaNemico: id }, postura, { dado, saltaIA: true });
      const subito = dannoDaEventi(r.eventi, 'giocatore');
      const inflitto = dannoDaEventi(r.eventi, 'nemico');
      sMin = Math.min(sMin, subito);
      sMax = Math.max(sMax, subito);
      iMin = Math.min(iMin, inflitto);
      iMax = Math.max(iMax, inflitto);
      fMin = Math.min(fMin, r.stato.giocatore.fiato);
      fMax = Math.max(fMax, r.stato.giocatore.fiato);
    }
  }
  return { subito: [sMin, sMax], inflitto: [iMin, iMax], fiatoFine: [fMin, fMax] };
}

// --- Registro --------------------------------------------------------------

function articoli(stato: StatoDuello) {
  const la = trovaProfilo(stato.nemico.profiloId).articolo === 'la';
  const nome = stato.nemico.nome;
  return {
    Il: `${la ? 'La' : 'Il'} ${nome}`,
    il: `${la ? 'la' : 'il'} ${nome}`,
    al: `${la ? 'alla' : 'al'} ${nome}`,
    del: `${la ? 'della' : 'del'} ${nome}`,
  };
}

// Dove cade un evento e come si legge in breve nel punto del colpo (nessuna regola: solo presentazione).
function etichettaColpo(e: EventoConTurno): { dove: Chi; breve: string } | null {
  const altro = (c: Chi): Chi => (c === 'giocatore' ? 'nemico' : 'giocatore');
  switch (e.tipo) {
    case 'colpo':
      return { dove: altro(e.chi), breve: `−${e.danno}` };
    case 'parata':
      return { dove: e.chi, breve: e.annullato ? 'Parata' : `Parata −${e.danno}` };
    case 'schivata':
      return { dove: e.chi, breve: 'Schivata' };
    case 'evitato':
      return { dove: e.chi, breve: 'Evitato' };
    case 'contrattacco':
      return { dove: altro(e.chi), breve: `Contrattacco −${e.danno}` };
    case 'punta':
      return { dove: altro(e.chi), breve: `Punta −${e.danno}` };
    case 'arresto':
      return { dove: altro(e.chi), breve: `Arresto −${e.danno}` };
    case 'incalza':
      return { dove: e.chi, breve: 'Incalza' };
    case 'interrotto':
      return { dove: e.chi, breve: 'Interrotto' };
    case 'rotta':
      return { dove: e.chi, breve: 'Rotta' };
    default:
      return null;
  }
}

function frase(stato: StatoDuello, e: EventoConTurno): { testo: string; simbolo?: string } | null {
  const n = articoli(stato);
  const tu = (chi: Chi) => chi === 'giocatore';
  switch (e.tipo) {
    case 'cambio':
      return {
        testo: tu(e.chi)
          ? `Passi a ${NOMI_ARCHETIPO[e.a]}: ${e.costo} fiato.`
          : `${n.Il} passa a ${NOMI_ARCHETIPO[e.a]}: ${e.costo} fiato.`,
        simbolo: `posture.${e.a}`,
      };
    case 'colpo': {
      const extra: string[] = [];
      if (e.vantaggioMassimo) extra.push('il vantaggio dà il colpo pieno');
      if (e.preparato) extra.push('era preparato: ×1,5');
      if (e.lungaControDistanza) extra.push('la Distanza non protegge dai colpi lunghi');
      if (e.reazioneNegata === 'senzaFiato') extra.push('senza fiato non si reagisce: +25%');
      if (e.reazioneNegata === 'sfondaGuardia') extra.push('sfonda la guardia');
      if (e.reazioneNegata === 'rapido') extra.push('troppo rapido per la schivata');
      if (e.reazioneNegata === 'fiatoInsufficiente') extra.push('fiato insufficiente per reagire');
      const coda = extra.length ? ` (${extra.join('; ')})` : '';
      const testo = tu(e.chi)
        ? `Colpisci ${n.al} (${e.mossa}): ${e.danno} danni${coda}.`
        : `${n.Il} ti colpisce (${e.mossa}): ${e.danno} danni${coda}.`;
      return { testo, simbolo: 'evento.colpo' };
    }
    case 'parata':
      return {
        testo: tu(e.chi)
          ? e.annullato
            ? `Pari ${e.mossa}: la parata ferma il colpo leggero.`
            : `Pari ${e.mossa}: il danno scende a ${e.danno}.`
          : e.annullato
            ? `${n.Il} para il tuo colpo: nessun danno.`
            : `${n.Il} para il tuo colpo: il danno scende a ${e.danno}.`,
        simbolo: 'evento.parata',
      };
    case 'schivata':
      return {
        testo: tu(e.chi)
          ? `Schivi ${e.mossa}: l'Attesa ti toglie dalla traiettoria.`
          : `${n.Il} schiva il tuo colpo.`,
        simbolo: 'evento.schivata',
      };
    case 'evitato':
      return {
        testo: tu(e.chi)
          ? `Resti a Distanza: ${e.mossa} è un colpo corto e non ti raggiunge.`
          : `${n.Il} si tiene a distanza: il tuo colpo corto non arriva.`,
        simbolo: 'evento.evitato',
      };
    case 'contrattacco':
      return {
        testo: tu(e.chi)
          ? `Contrattacchi dopo la schivata: ${e.danno} danni.`
          : `${n.Il} contrattacca dopo la schivata: ${e.danno} danni.`,
        simbolo: 'evento.contrattacco',
      };
    case 'interrotto':
      return {
        testo: tu(e.chi)
          ? 'Il colpo pesante ti ferma: il tuo attacco è interrotto.'
          : `Il tuo colpo pesante interrompe l'attacco ${n.del}.`,
        simbolo: 'evento.interrotto',
      };
    case 'rotta':
      return { testo: `Il colpo pesante spezza la preparazione ${n.del}: niente bonus.`, simbolo: 'evento.rotta' };
    case 'preparato':
      return {
        testo: tu(e.chi)
          ? 'Sei preparato: il prossimo colpo farà più male.'
          : `${n.Il} è preparato: il prossimo colpo farà più male.`,
        simbolo: 'stato.preparato',
      };
    case 'vantaggio':
      return {
        testo: tu(e.chi)
          ? 'Hai il vantaggio: dal prossimo turno colpisci per primo e al massimo.'
          : `${n.Il} ha il vantaggio: dal prossimo turno colpisce per primo e al massimo.`,
        simbolo: 'stato.vantaggio',
      };
    case 'vantaggioPerso':
      return {
        testo: tu(e.chi) ? 'Perdi il vantaggio: hai incassato un colpo.' : `${n.Il} perde il vantaggio: ha incassato un colpo.`,
        simbolo: 'stato.vantaggio',
      };
    case 'incalza':
      return {
        testo: tu(e.chi)
          ? `${n.Il} arretra: incalzi e prendi l'iniziativa.`
          : `Arretri: ${n.il} incalza e prende l'iniziativa.`,
        simbolo: 'evento.incalza',
      };
    case 'punta':
      return {
        testo: tu(e.chi)
          ? `Arretri puntando la lama: ${e.danno} danni ${n.al} e nessuno ti incalza.`
          : `${n.Il} arretra puntando la lama: ${e.danno} danni a te e non lo incalzi.`,
        simbolo: 'evento.punta',
      };
    case 'arresto':
      return {
        testo: tu(e.chi)
          ? `Fermi il colpo con l'arresto: ${e.danno} danni ${n.al} e prendi il vantaggio.`
          : `${n.Il} ti ferma con l'arresto: ${e.danno} danni a te e prende il vantaggio.`,
        simbolo: 'evento.arresto',
      };
    case 'spalleAlMuro':
      return {
        testo: tu(e.chi)
          ? 'Hai le spalle al muro: non puoi più arretrare, cambia postura.'
          : `${n.Il} ha le spalle al muro: non può più arretrare.`,
        simbolo: 'stato.spalle',
      };
    case 'fiato': {
      if (!tu(e.chi)) return null; // il bilancio del nemico non si mostra
      const nomi: Record<VoceFiato['tipo'], string> = { cambio: 'cambio', schivata: 'schivata', parata: 'parata', punta: 'punta', arresto: 'arresto', recupero: 'recupero' };
      const voci = e.voci.map((x) => `${nomi[x.tipo]} ${x.valore < 0 ? '−' : '+'}${Math.abs(x.valore)}`).join(', ');
      return { testo: `Fiato ${e.da} → ${e.a}: ${voci}.`, simbolo: 'risorsa.fiato' };
    }
    case 'fase2':
      return { testo: `${n.Il} entra nella seconda fase: cambia il modo di combattere.`, simbolo: 'stato.fase2' };
    case 'fine':
      return {
        testo:
          e.esito === 'vittoria'
            ? 'Hai vinto il duello.'
            : e.esito === 'sconfitta'
              ? 'Sei caduto.'
              : 'Nessuno cede entro il limite di turni: pareggio.',
      };
  }
}

export function toDuelView(stato: StatoDuello, eventiUltimoTurno: EventoConTurno[] = []): DuelView {
  const profilo = trovaProfilo(stato.nemico.profiloId);
  const mossa = trovaMossa(profilo.id, stato.mossaNemico);
  const categoria = categoriaDi(mossa);
  const inCorso = stato.esito === 'in corso';

  const hint: DuelView['hint'] = { categoria, simbolo: `intent.${categoria}` };
  if (stato.opzioni.hintCompleti) hint.dettaglio = dettaglioMossa(mossa);

  const registro: DuelView['registro'] = [];
  for (const e of eventiUltimoTurno) {
    const f = frase(stato, e);
    if (!f) continue;
    const c = etichettaColpo(e);
    registro.push({ turno: e.turno, testo: f.testo, ...(f.simbolo ? { simbolo: f.simbolo } : {}), tipo: e.tipo, ...(c ?? {}) });
  }

  return {
    turno: stato.turno,
    turnoMax: BALANCE.turnoMax,
    esito: stato.esito,
    giocatore: combattenteView(stato.giocatore),
    nemico: { ...combattenteView(stato.nemico), fase: stato.nemico.fase, haFase2: profilo.fase2 !== undefined },
    hint,
    posture: ORDINE_POSTURE.map((id) => {
      const attiva = stato.giocatore.postura === POSTURE[id].archetipo;
      const motivo = inCorso ? motivoNonDisponibile(stato, id) : undefined;
      const disponibile = inCorso && motivo === undefined;
      const sim = disponibile ? simulaPostura(stato, id) : undefined;
      const p: DuelView['posture'][number] = {
        id,
        nome: POSTURE[id].nome,
        simbolo: `posture.${id}`,
        attiva,
        costo: attiva ? 0 : costoCambioDi(stato.giocatore),
        disponibile,
        ...(motivo ? { motivo } : {}),
        fiatoFine: sim ? sim.fiatoFine : [stato.giocatore.fiato, stato.giocatore.fiato],
      };
      if (stato.opzioni.anteprimaDanni && sim) p.anteprima = { subito: sim.subito, inflitto: sim.inflitto };
      return p;
    }),
    registro,
  };
}
