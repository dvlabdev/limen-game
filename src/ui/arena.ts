// Arena di prova: menu, pannello di configurazione, duello e telemetria locale (ARENA_SPEC §8).
// Qui non ci sono regole di gioco: si chiamano creaDuello, resolveTurn e toDuelView.
import type { EventoConTurno, OpzioniArena, PosturaId, StatoDuello } from '../core/types.ts';
import { ORDINE_NEMICI, trovaProfilo } from '../data/enemies.ts';
import { creaDuello, resolveTurn } from '../core/resolve.ts';
import type { DuelView } from '../core/view.ts';
import { toDuelView } from '../core/view.ts';
import type { ConfigArena, ModelloDuello, ModelloMenu, VoceRegistro } from './render.ts';
import { disegnaDuello, disegnaMenu } from './render.ts';

const CHIAVE_CONFIG = 'limen.arena.config';
const CHIAVE_TELEMETRIA = 'limen.arena.telemetria';

const ETICHETTE: Record<string, string> = {
  recluta: 'sequenza semplice',
  duellante: 'rapido, si adatta',
  bruto: 'lento e pesante',
  lanciere: 'colpisce da lontano',
  mietitore: 'boss · due fasi',
};

const CONFIG_PREDEFINITA: ConfigArena = {
  parata: 1,
  schivata: 1,
  distanza: 1,
  seed: 1,
  hintCompleti: false,
  anteprimaDanni: false,
  adattamento: true,
  layout: 'scena',
};

// --- Archiviazione (sempre in try/catch) ---------------------------------------

function leggi(chiave: string): unknown {
  try {
    const t = localStorage.getItem(chiave);
    return t ? JSON.parse(t) : null;
  } catch {
    return null;
  }
}

function scrivi(chiave: string, valore: unknown): void {
  try {
    localStorage.setItem(chiave, JSON.stringify(valore));
  } catch {
    // archiviazione non disponibile: la sessione prosegue comunque
  }
}

function grado(x: unknown, predefinito: 1 | 2 | 3): 1 | 2 | 3 {
  return x === 1 || x === 2 || x === 3 ? x : predefinito;
}

function caricaConfig(): ConfigArena {
  const r = leggi(CHIAVE_CONFIG);
  if (!r || typeof r !== 'object') return { ...CONFIG_PREDEFINITA };
  const o = r as Record<string, unknown>;
  const d = CONFIG_PREDEFINITA;
  return {
    parata: grado(o['parata'], d.parata),
    schivata: grado(o['schivata'], d.schivata),
    distanza: grado(o['distanza'], d.distanza),
    seed: typeof o['seed'] === 'number' && Number.isFinite(o['seed']) ? Math.trunc(o['seed']) : d.seed,
    hintCompleti: typeof o['hintCompleti'] === 'boolean' ? o['hintCompleti'] : d.hintCompleti,
    anteprimaDanni: typeof o['anteprimaDanni'] === 'boolean' ? o['anteprimaDanni'] : d.anteprimaDanni,
    adattamento: typeof o['adattamento'] === 'boolean' ? o['adattamento'] : d.adattamento,
    layout: o['layout'] === 'griglia' || o['layout'] === 'scena' ? o['layout'] : d.layout,
  };
}

function leggiTelemetria(): unknown[] {
  const r = leggi(CHIAVE_TELEMETRIA);
  return Array.isArray(r) ? r : [];
}

// --- Stato dell'interfaccia ----------------------------------------------------

interface Sessione {
  nemicoId: string;
  stato: StatoDuello;
  eventi: EventoConTurno[]; // ultimo turno
  storico: VoceRegistro[];
  selezione: PosturaId | null; // null: nessuna scelta (mai una postura non disponibile, AUD-002)
  messaggio?: string;
  anima: boolean; // subito dopo la conferma: dissolvenza e testo del colpo per circa 1,2 s
  cassetto: boolean;
  cambi: number;
  salvata: boolean;
}

// Selezione di partenza: la postura attuale (tenerla è gratis), ma solo se è davvero disponibile.
// Con la Distanza esaurita (spalle al muro) non si seleziona nulla: tocca al giocatore (AUD-002).
function sceltaPredefinita(v: DuelView): PosturaId | null {
  const attiva = v.posture.find((p) => p.attiva);
  return attiva && attiva.disponibile ? attiva.id : null;
}

const DURATA_COLPO_MS = 1200;

export function avvia(radice: HTMLElement): void {
  let config = caricaConfig();
  let timerColpo: ReturnType<typeof setTimeout> | undefined;
  // Nella scena la scelta è a due tocchi (seleziona, poi conferma): si parte senza selezione.
  // Nella griglia si parte dalla postura attuale, se disponibile.
  const selezioneIniziale = (v: DuelView): PosturaId | null => (config.layout === 'scena' ? null : sceltaPredefinita(v));
  let sessione: Sessione | null = null;
  let jsonTelemetria: string | undefined;

  const opzioni = (): OpzioniArena => ({
    hintCompleti: config.hintCompleti,
    anteprimaDanni: config.anteprimaDanni,
    adattamento: config.adattamento,
  });

  const menu = (): void => {
    sessione = null;
    const modello: ModelloMenu = {
      nemici: ORDINE_NEMICI.map((id) => ({ id, nome: trovaProfilo(id).nome, etichetta: ETICHETTE[id] ?? '' })),
      config,
      telemetria: { conteggio: leggiTelemetria().length, ...(jsonTelemetria !== undefined ? { json: jsonTelemetria } : {}) },
    };
    disegnaMenu(radice, modello);
  };

  const nuovoDuello = (nemicoId: string): void => {
    const stato = creaDuello(nemicoId, config.seed, opzioni(), { parata: config.parata, schivata: config.schivata, distanza: config.distanza });
    sessione = { nemicoId, stato, eventi: [], storico: [], selezione: selezioneIniziale(toDuelView(stato)), anima: false, cassetto: false, cambi: 0, salvata: false };
    disegna();
  };

  const statistiche = (s: Sessione): { esito: string; righe: string[] } => {
    const st = s.stato;
    const uso: Record<PosturaId, number> = { assalto: 0, guardia: 0, attesa: 0, distanza: 0 };
    for (const p of st.storicoPosture) uso[p] += 1;
    const esito = st.esito === 'vittoria' ? 'Vittoria' : st.esito === 'sconfitta' ? 'Sconfitta' : 'Pareggio';
    return {
      esito,
      righe: [
        `Turni: ${st.turno}`,
        `Danni inflitti: ${st.nemico.vigoreMax - st.nemico.vigore} · subiti: ${st.giocatore.vigoreMax - st.giocatore.vigore}`,
        `Posture: Assalto ${uso.assalto} · Guardia ${uso.guardia} · Attesa ${uso.attesa} · Distanza ${uso.distanza}`,
        `Cambi di postura: ${s.cambi} · seed ${st.seed}`,
      ],
    };
  };

  const registraTelemetria = (s: Sessione): void => {
    if (s.salvata) return;
    s.salvata = true;
    const st = s.stato;
    const usoPosture: Record<PosturaId, number> = { assalto: 0, guardia: 0, attesa: 0, distanza: 0 };
    for (const p of st.storicoPosture) usoPosture[p] += 1;
    const tutti = leggiTelemetria();
    tutti.push({
      nemico: s.nemicoId,
      seed: st.seed,
      opzioni: st.opzioni,
      gradi: st.giocatore.gradi,
      esito: st.esito,
      turni: st.turno,
      usoPosture,
      cambi: s.cambi,
      danniInflitti: st.nemico.vigoreMax - st.nemico.vigore,
      danniSubiti: st.giocatore.vigoreMax - st.giocatore.vigore,
      data: new Date().toISOString(),
    });
    scrivi(CHIAVE_TELEMETRIA, tutti);
  };

  const disegna = (): void => {
    if (!sessione) return;
    const s = sessione;
    const modello: ModelloDuello = {
      vista: toDuelView(s.stato, s.eventi),
      layout: config.layout,
      nemicoId: s.nemicoId,
      anima: s.anima,
      cassetto: s.cassetto,
      selezione: s.selezione,
      storico: s.storico,
      ...(s.messaggio ? { messaggio: s.messaggio } : {}),
      ...(s.stato.esito !== 'in corso' ? { fine: statistiche(s) } : {}),
    };
    disegnaDuello(radice, modello);
    clearTimeout(timerColpo);
    if (s.anima) {
      // Il testo del colpo dura circa 1,2 s: poi si toglie dal DOM senza ridisegnare la scena.
      timerColpo = setTimeout(() => {
        s.anima = false;
        radice.querySelector('.colpi')?.remove();
      }, DURATA_COLPO_MS);
    }
  };

  const conferma = (): void => {
    const s = sessione;
    if (!s || s.stato.esito !== 'in corso') return;
    // AUD-002: la conferma non lancia mai eccezioni non gestite. Si verifica con la vista che la scelta
    // sia disponibile; in caso contrario si avvisa e il turno non avanza.
    const vista = toDuelView(s.stato, s.eventi);
    const scelta = s.selezione ? vista.posture.find((p) => p.id === s.selezione) : undefined;
    if (!s.selezione || !scelta || !scelta.disponibile) {
      s.selezione = selezioneIniziale(vista);
      s.messaggio = 'Scegli una postura disponibile.';
      disegna();
      return;
    }
    let r: ReturnType<typeof resolveTurn>;
    try {
      r = resolveTurn(s.stato, s.selezione);
    } catch {
      s.selezione = selezioneIniziale(vista);
      s.messaggio = 'Quella postura non è disponibile: scegline un’altra.';
      disegna();
      return;
    }
    // Il turno appena concluso passa nello storico.
    for (const e of vista.registro) s.storico.push({ turno: e.turno, testo: e.testo, ...(e.simbolo ? { simbolo: e.simbolo } : {}) });
    delete s.messaggio;
    s.cambi += r.eventi.filter((e) => e.tipo === 'cambio' && e.chi === 'giocatore').length;
    s.stato = r.stato;
    s.eventi = r.eventi;
    s.selezione = s.stato.esito === 'in corso' ? selezioneIniziale(toDuelView(s.stato)) : null;
    s.anima = true;
    if (s.stato.esito !== 'in corso') registraTelemetria(s);
    disegna();
  };

  const copia = async (): Promise<void> => {
    const testo = JSON.stringify(leggiTelemetria(), null, 2);
    try {
      await navigator.clipboard.writeText(testo);
      jsonTelemetria = undefined;
      alert('Telemetria copiata negli appunti.');
    } catch {
      jsonTelemetria = testo; // ripiego: area di testo selezionabile
    }
    menu();
  };

  radice.addEventListener('click', (ev) => {
    const el = (ev.target as HTMLElement).closest<HTMLElement>('[data-azione]');
    if (!el || (el as HTMLButtonElement).disabled) return;
    const id = el.dataset['id'] ?? '';
    switch (el.dataset['azione']) {
      case 'nemico':
        nuovoDuello(id);
        break;
      case 'menu':
        menu();
        break;
      case 'scegli':
        if (sessione) {
          const p = toDuelView(sessione.stato).posture.find((x) => x.id === id);
          if (p && p.disponibile) {
            // Scena: il secondo tocco sullo stesso medaglione conferma; un altro medaglione sposta la selezione.
            if (config.layout === 'scena' && sessione.selezione === p.id) {
              conferma();
            } else {
              sessione.selezione = p.id;
              sessione.anima = false;
              delete sessione.messaggio;
              disegna();
            }
          }
        }
        break;
      case 'conferma':
        conferma();
        break;
      case 'sfondo':
        // Un tocco fuori dai medaglioni annulla la selezione e salta il testo del colpo.
        if (sessione && sessione.stato.esito === 'in corso' && (sessione.selezione || sessione.anima || sessione.messaggio)) {
          sessione.selezione = null;
          sessione.anima = false;
          delete sessione.messaggio;
          disegna();
        }
        break;
      case 'cassetto':
        if (sessione) {
          sessione.cassetto = !sessione.cassetto;
          sessione.anima = false;
          disegna();
        }
        break;
      case 'rigioca-stesso':
        if (sessione) nuovoDuello(sessione.nemicoId);
        break;
      case 'rigioca-nuovo':
        if (sessione) {
          config = { ...config, seed: Math.floor(Math.random() * 1_000_000_000) };
          scrivi(CHIAVE_CONFIG, config);
          nuovoDuello(sessione.nemicoId);
        }
        break;
      case 'seed-casuale':
        config = { ...config, seed: Math.floor(Math.random() * 1_000_000_000) };
        scrivi(CHIAVE_CONFIG, config);
        menu();
        break;
      case 'copia':
        void copia();
        break;
      case 'azzera':
        scrivi(CHIAVE_TELEMETRIA, []);
        jsonTelemetria = undefined;
        menu();
        break;
    }
  });

  radice.addEventListener('change', (ev) => {
    const el = ev.target as HTMLInputElement;
    const chiave = el.dataset['config'];
    if (!chiave) return;
    const c: Record<string, unknown> = { ...config };
    if (chiave === 'parata' || chiave === 'schivata' || chiave === 'distanza') c[chiave] = grado(Number(el.value), 1);
    else if (chiave === 'seed') c[chiave] = Number.isFinite(Number(el.value)) && el.value !== '' ? Math.trunc(Number(el.value)) : config.seed;
    else if (chiave === 'layout') c[chiave] = el.value === 'griglia' ? 'griglia' : 'scena';
    else c[chiave] = el.checked;
    config = c as unknown as ConfigArena;
    scrivi(CHIAVE_CONFIG, config);
  });

  menu();
}
