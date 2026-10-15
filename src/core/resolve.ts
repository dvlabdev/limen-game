// Il risolutore del turno. Puro: niente DOM, niente Math.random, niente orologio.
// Tratta allo stesso modo le mosse del giocatore e quelle del nemico (ARENA_SPEC §4).
import type {
  Attacco,
  Chi,
  Combattente,
  Dado,
  EventoConTurno,
  EventoDuello,
  Gradi,
  Mossa,
  MotivoReazioneNegata,
  OpzioniArena,
  PosturaId,
  StatoDuello,
} from './types.ts';
import { BALANCE } from '../data/balance.ts';
import { trovaMossa, trovaProfilo } from '../data/enemies.ts';
import { POSTURE } from '../data/postures.ts';
import { sceglieMossaNemico } from './ai.ts';
import { dadoDaStato } from './rng.ts';
import { costoCambioDi, senzaSpazio } from './spazio.ts';

export const OPZIONI_PREDEFINITE: OpzioniArena = {
  hintCompleti: false,
  anteprimaDanni: false,
  adattamento: true,
};

export const GRADI_PREDEFINITI: Gradi = { parata: 1, schivata: 1, distanza: 1 };

export function creaDuello(
  profiloId: string,
  seed: number,
  opzioni: Partial<OpzioniArena> = {},
  gradi: Partial<Gradi> = {},
): StatoDuello {
  const p = trovaProfilo(profiloId);
  const g = BALANCE.giocatore;
  const stato: StatoDuello = {
    turno: 1,
    esito: 'in corso',
    giocatore: {
      nome: 'Viandante',
      vigore: g.vigore,
      vigoreMax: g.vigore,
      fiato: g.fiato,
      fiatoMax: g.fiatoMax,
      velocita: g.velocita,
      postura: g.posturaIniziale,
      vantaggio: false,
      preparato: false,
      distanzaConsecutive: 0,
      gradi: { ...GRADI_PREDEFINITI, ...gradi },
    },
    nemico: {
      nome: p.nome,
      vigore: p.vigore,
      vigoreMax: p.vigore,
      fiato: p.fiato,
      fiatoMax: p.fiato,
      velocita: p.velocita,
      // ARENA_SPEC §12.7 (AUD-004): il nemico parte in Guardia come il giocatore e paga il cambio
      // verso la prima mossa con le regole normali; la postura iniziale non rivela la mossa.
      postura: 'guardia',
      vantaggio: false,
      preparato: false,
      distanzaConsecutive: 0,
      gradi: { ...p.gradi },
      profiloId: p.id,
      fase: 1,
      sequenzaIdx: 0,
    },
    mossaNemico: '',
    storicoPosture: [],
    rng: seed | 0,
    seed,
    opzioni: { ...OPZIONI_PREDEFINITE, ...opzioni },
  };
  // Prima mossa: scelta dalla postura reale di partenza (AUD-019).
  stato.mossaNemico = sceglieMossaNemico(stato);
  return stato;
}

// Copia profonda scritta a mano: lo stato è piatto e questa è la parte più calda del simulatore.
export function clonaStato(s: StatoDuello): StatoDuello {
  return {
    ...s,
    giocatore: { ...s.giocatore, gradi: { ...s.giocatore.gradi } },
    nemico: { ...s.nemico, gradi: { ...s.nemico.gradi } },
    storicoPosture: s.storicoPosture.slice(),
    opzioni: { ...s.opzioni },
  };
}

export type MotivoNonDisponibile = 'fiato' | 'spazio';

// Perché una postura non si può scegliere (undefined se è disponibile).
export function motivoNonDisponibile(stato: StatoDuello, scelta: PosturaId): MotivoNonDisponibile | undefined {
  const g = stato.giocatore;
  const archetipo = POSTURE[scelta].archetipo;
  if (archetipo === 'distanza' && senzaSpazio(g)) return 'spazio';
  if (archetipo === g.postura || g.fiato >= costoCambioDi(g)) return undefined;
  return 'fiato';
}

export function cambioConsentito(stato: StatoDuello, scelta: PosturaId): boolean {
  return motivoNonDisponibile(stato, scelta) === undefined;
}

// Stato di un combattente durante la risoluzione di un turno.
interface Lato {
  chi: Chi;
  c: Combattente;
  mossa: Mossa;
  vantInizio: boolean; // per l'ordine degli attacchi
  vantAttuale: boolean; // ancora utilizzabile (non consumato né perso)
  vantArrivo: boolean; // guadagnato in questo turno, effettivo dal prossimo
  vantDaColpo: boolean; // il guadagno viene da un colpo pesante a segno
  dannoSubito: number;
  attaccoPendente: boolean;
  interrotto: boolean;
  rotta: boolean;
  raggiunto: boolean; // un attacco avversario si è risolto contro di lui (R3)
}

function creaLato(chi: Chi, c: Combattente, mossa: Mossa): Lato {
  return {
    chi,
    c,
    mossa,
    vantInizio: c.vantaggio,
    vantAttuale: c.vantaggio,
    vantArrivo: false,
    vantDaColpo: false,
    dannoSubito: 0,
    attaccoPendente: mossa.attacco !== undefined,
    interrotto: false,
    rotta: false,
    raggiunto: false,
  };
}

export function resolveTurn(
  stato: StatoDuello,
  scelta: PosturaId,
  opz: { dado?: Dado; saltaIA?: boolean } = {},
): { stato: StatoDuello; eventi: EventoConTurno[] } {
  if (stato.esito !== 'in corso') throw new Error('Il duello è già concluso');
  if (!cambioConsentito(stato, scelta)) throw new Error('Postura non disponibile: fiato insufficiente o niente spazio alle spalle');

  const s = clonaStato(stato);
  const turno = s.turno;
  const eventi: EventoConTurno[] = [];
  const ev = (e: EventoDuello): void => {
    eventi.push({ ...e, turno } as EventoConTurno);
  };
  const dado: Dado = opz.dado ?? dadoDaStato(s);

  const G = creaLato('giocatore', s.giocatore, POSTURE[scelta]);
  const N = creaLato('nemico', s.nemico, trovaMossa(s.nemico.profiloId, s.mossaNemico));
  const lati = [G, N];
  s.storicoPosture.push(scelta);

  // 3. Pagamento dei cambi di postura.
  for (const l of lati) {
    if (l.mossa.archetipo === l.c.postura) continue;
    if (l.mossa.archetipo === 'distanza' && senzaSpazio(l.c)) throw new Error(`${l.c.nome} non ha spazio per arretrare`);
    const costo = costoCambioDi(l.c);
    if (l.c.fiato < costo) throw new Error(`${l.c.nome} non ha il fiato per cambiare postura`);
    l.c.fiato -= costo;
    l.c.postura = l.mossa.archetipo;
    ev({ tipo: 'cambio', chi: l.chi, a: l.mossa.archetipo, costo });
  }

  const finito = (): boolean => G.c.vigore <= 0 || N.c.vigore <= 0;
  const altro = (l: Lato): Lato => (l === G ? N : G);

  // AUD-001: in uno scambio simultaneo entrambi i colpi si calcolano sullo stato di inizio scambio,
  // vantaggio compreso: la perdita del vantaggio attuale è rimandata a dopo i due colpi.
  let scambioSimultaneo = false;

  const infliggi = (bersaglio: Lato, danno: number): void => {
    bersaglio.c.vigore = Math.max(0, bersaglio.c.vigore - danno);
    bersaglio.dannoSubito += danno;
    if (danno > 0) {
      if (!scambioSimultaneo) {
        if (bersaglio.vantAttuale) ev({ tipo: 'vantaggioPerso', chi: bersaglio.chi });
        bersaglio.vantAttuale = false;
      }
      bersaglio.vantArrivo = false;
      bersaglio.vantDaColpo = false;
    }
  };

  // Colpo di risposta senza reazioni (contrattacco, Punta, Arresto): preparato ×1,5 e fiato zero ×1,25.
  const colpoDiRisposta = (da: Lato, a: Lato, [lo, hi]: [number, number]): number => {
    let v = dado(lo, hi);
    if (da.c.preparato) {
      v *= BALANCE.moltPreparato;
      da.c.preparato = false;
    }
    if (a.c.fiato <= 0) v *= BALANCE.moltFiatoZero;
    return Math.max(0, Math.round(v));
  };

  // 5. Risoluzione di un colpo (§4.4).
  const risolviColpo = (A: Lato, D: Lato, simultaneo: boolean): void => {
    const att = A.mossa.attacco as Attacco;
    A.attaccoPendente = false;
    D.raggiunto = true;

    let tiro = dado(att.danno[0], att.danno[1]);
    let vantaggioMassimo = false;
    if (A.vantAttuale) {
      tiro = att.danno[1];
      A.vantAttuale = false;
      vantaggioMassimo = true;
    }
    let d = tiro;
    const preparato = A.c.preparato;
    if (preparato) {
      d *= BALANCE.moltPreparato;
      A.c.preparato = false;
    }

    // Reazione di D, secondo la sua postura attuale.
    const postura = D.c.postura;
    const senzaFiato = D.c.fiato <= 0;
    let esito: 'segno' | 'evitato' | 'schivato' | 'parato' = 'segno';
    let negata: MotivoReazioneNegata | undefined;
    if (senzaFiato) {
      if (postura === 'guardia' || postura === 'attesa' || (postura === 'distanza' && att.portata === 'corta')) {
        negata = 'senzaFiato';
      }
    } else if (postura === 'distanza') {
      if (att.portata === 'corta') esito = 'evitato';
    } else if (postura === 'attesa') {
      if (D.c.fiato >= BALANCE.costoSchivata && (att.velocita !== 'rapido' || D.c.gradi.schivata === 3)) {
        esito = 'schivato';
      } else {
        negata = D.c.fiato < BALANCE.costoSchivata ? 'fiatoInsufficiente' : 'rapido';
      }
    } else if (postura === 'guardia') {
      if (att.sfondaGuardia) negata = 'sfondaGuardia';
      else if (D.c.fiato < BALANCE.costoParata) negata = 'fiatoInsufficiente';
      else esito = 'parato';
    }

    if (esito === 'evitato') {
      ev({ tipo: 'evitato', chi: D.chi, mossa: A.mossa.nome });
      // R4: Punta (grado 2) contro i colpi pesanti, Arresto (grado 3) contro quelli non rapidi.
      const g = D.c.gradi.distanza;
      const candidata = g >= 3 && att.velocita !== 'rapido' ? 'arresto' : g >= 2 && att.forza === 'pesante' ? 'punta' : null;
      // AUD-017: come Parata e Schivata, Punta e Arresto sono reazioni che costano fiato e si fanno solo se basta.
      const costoRisposta = candidata === 'arresto' ? BALANCE.costoArresto : BALANCE.costoPunta;
      const risposta = candidata && D.c.fiato >= costoRisposta ? candidata : null;
      if (risposta) {
        const arresto = risposta === 'arresto';
        D.c.fiato -= arresto ? BALANCE.costoArresto : BALANCE.costoPunta;
        const dr = colpoDiRisposta(D, A, arresto ? BALANCE.arresto : BALANCE.punta);
        infliggi(A, dr);
        ev({ tipo: arresto ? 'arresto' : 'punta', chi: D.chi, danno: dr });
        if (arresto) D.vantArrivo = true;
      } else {
        // R1: chi arretra cede l'iniziativa.
        A.vantArrivo = true;
        ev({ tipo: 'incalza', chi: A.chi });
      }
      return;
    }

    if (esito === 'schivato') {
      D.c.fiato -= BALANCE.costoSchivata;
      ev({ tipo: 'schivata', chi: D.chi, mossa: A.mossa.nome });
      if (D.c.gradi.schivata >= 2) D.vantArrivo = true;
      if (att.portata === 'corta') {
        const bonus = D.c.gradi.schivata >= 2 ? BALANCE.contrattaccoBonusDalGrado2 : 0;
        const [lo, hi] = BALANCE.contrattacco;
        const dc = colpoDiRisposta(D, A, [lo + bonus, hi + bonus]);
        infliggi(A, dc);
        ev({ tipo: 'contrattacco', chi: D.chi, danno: dc });
      }
      return;
    }

    const lungaControDistanza = postura === 'distanza' && att.portata === 'lunga';
    if (esito === 'parato') {
      D.c.fiato -= BALANCE.costoParata;
      d *= att.forza === 'leggero' && D.c.gradi.parata >= 2 ? 0 : BALANCE.moltParataNonAnnullata;
    }
    if (lungaControDistanza) d *= BALANCE.moltLungaControDistanza;
    if (senzaFiato) d *= BALANCE.moltFiatoZero;
    const danno = Math.max(0, Math.round(d));
    infliggi(D, danno);

    if (esito === 'parato') {
      ev({ tipo: 'parata', chi: D.chi, mossa: A.mossa.nome, danno, annullato: danno === 0 });
      if (att.forza === 'pesante' && D.c.gradi.parata === 3) D.vantArrivo = true;
      return;
    }

    ev({
      tipo: 'colpo',
      chi: A.chi,
      mossa: A.mossa.nome,
      danno,
      simultaneo,
      preparato,
      vantaggioMassimo,
      lungaControDistanza,
      senzaFiato,
      ...(negata ? { reazioneNegata: negata } : {}),
    });

    // R1: anche un colpo che arriva a segno contro la Distanza (lungo, o senza fiato) fa incalzare.
    if (postura === 'distanza' && D.c.vigore > 0) {
      A.vantArrivo = true;
      ev({ tipo: 'incalza', chi: A.chi });
    }

    // Colpo a segno: danno > 0.
    if (danno > 0 && att.forza === 'pesante') {
      const da = D.mossa.attacco;
      if (!simultaneo && D.attaccoPendente && da && !da.inarrestabile) {
        D.interrotto = true;
        D.attaccoPendente = false;
        ev({ tipo: 'interrotto', chi: D.chi });
      }
      if (D.mossa.archetipo === 'preparazione') {
        D.rotta = true;
        ev({ tipo: 'rotta', chi: D.chi });
      }
      A.vantArrivo = true;
      A.vantDaColpo = true;
    }
  };

  // 4. Ordine degli attacchi.
  const attaccanti = lati.filter((l) => l.mossa.attacco);
  let ordine: Lato[] = attaccanti;
  let simultaneo = false;
  if (attaccanti.length === 2) {
    const cmp = confrontaOrdine(G, N);
    if (cmp === 0) simultaneo = true;
    else ordine = cmp < 0 ? [G, N] : [N, G];
  }

  if (simultaneo) {
    scambioSimultaneo = true;
    risolviColpo(G, N, true);
    risolviColpo(N, G, true);
    scambioSimultaneo = false;
    for (const l of lati) {
      if (l.dannoSubito <= 0) continue;
      // Il vantaggio attuale non usato (non attacca) si perde dopo i due colpi.
      if (l.vantAttuale) {
        ev({ tipo: 'vantaggioPerso', chi: l.chi });
        l.vantAttuale = false;
      }
      // Uno scambio simultaneo non lascia vantaggio a chi ha incassato danno.
      if (l.vantDaColpo) l.vantArrivo = false;
    }
  } else {
    for (const a of ordine) {
      if (finito()) break;
      if (a.interrotto) continue;
      risolviColpo(a, altro(a), false);
    }
  }

  // 6. Fine turno.
  if (!finito()) {
    for (const l of lati) {
      if (l.mossa.archetipo === 'preparazione' && !l.rotta) {
        l.c.preparato = true;
        ev({ tipo: 'preparato', chi: l.chi });
      } else if (l.c.postura === 'attesa' && !l.raggiunto && !l.c.preparato) {
        // R3: l'Attesa che nessun attacco ha raggiunto diventa una preparazione.
        l.c.preparato = true;
        ev({ tipo: 'preparato', chi: l.chi });
      }
    }
  }
  for (const l of lati) {
    // R2: turni consecutivi conclusi in Distanza.
    if (l.c.postura === 'distanza') {
      l.c.distanzaConsecutive += 1;
      if (l.c.distanzaConsecutive === BALANCE.distanzaConsecutiveMax && !finito()) ev({ tipo: 'spalleAlMuro', chi: l.chi });
    } else {
      l.c.distanzaConsecutive = 0;
    }
    l.c.fiato = Math.min(l.c.fiatoMax, l.c.fiato + BALANCE.recupero[l.c.postura]);
    l.c.vantaggio = l.vantAttuale || l.vantArrivo;
    if (l.vantArrivo) ev({ tipo: 'vantaggio', chi: l.chi });
  }

  const gm = G.c.vigore <= 0;
  const nm = N.c.vigore <= 0;
  if (gm && nm) s.esito = 'pareggio';
  else if (nm) s.esito = 'vittoria';
  else if (gm) s.esito = 'sconfitta';
  else {
    const profilo = trovaProfilo(s.nemico.profiloId);
    if (s.nemico.fase === 1 && profilo.fase2 && s.nemico.vigore <= BALANCE.sogliaFase2 * s.nemico.vigoreMax) {
      s.nemico.fase = 2;
      ev({ tipo: 'fase2' });
    }
    if (turno >= BALANCE.turnoMax) s.esito = 'pareggio';
  }

  if (s.esito !== 'in corso') {
    ev({ tipo: 'fine', esito: s.esito });
  } else {
    s.turno = turno + 1;
    if (!opz.saltaIA) s.mossaNemico = sceglieMossaNemico(s);
  }
  return { stato: s, eventi };
}

// Negativo: prima il giocatore; positivo: prima il nemico; zero: simultanei.
function confrontaOrdine(G: Lato, N: Lato): number {
  if (G.vantInizio !== N.vantInizio) return G.vantInizio ? -1 : 1;
  const vg = BALANCE.velocitaMossa[(G.mossa.attacco as Attacco).velocita];
  const vn = BALANCE.velocitaMossa[(N.mossa.attacco as Attacco).velocita];
  if (vg !== vn) return vg > vn ? -1 : 1;
  if (G.c.velocita !== N.c.velocita) return G.c.velocita > N.c.velocita ? -1 : 1;
  return 0;
}
