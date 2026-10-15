// Arena di prova: menu, pannello di configurazione, duello e telemetria locale (ARENA_SPEC §8).
// Qui non ci sono regole di gioco: si chiamano creaDuello, resolveTurn e toDuelView.
import type { EventoConTurno, OpzioniArena, PosturaId, StatoDuello } from '../core/types.ts';
import { ORDINE_NEMICI, trovaProfilo } from '../data/enemies.ts';
import { creaDuello, resolveTurn } from '../core/resolve.ts';
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
  selezione: PosturaId;
  cambi: number;
  salvata: boolean;
}

export function avvia(radice: HTMLElement): void {
  let config = caricaConfig();
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
    const attiva = stato.giocatore.postura as PosturaId;
    sessione = { nemicoId, stato, eventi: [], storico: [], selezione: attiva, cambi: 0, salvata: false };
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
      selezione: s.selezione,
      storico: s.storico,
      ...(s.stato.esito !== 'in corso' ? { fine: statistiche(s) } : {}),
    };
    disegnaDuello(radice, modello);
  };

  const conferma = (): void => {
    const s = sessione;
    if (!s || s.stato.esito !== 'in corso') return;
    // Il turno appena concluso passa nello storico.
    for (const e of toDuelView(s.stato, s.eventi).registro) s.storico.push({ turno: e.turno, testo: e.testo, ...(e.simbolo ? { simbolo: e.simbolo } : {}) });
    const r = resolveTurn(s.stato, s.selezione);
    s.cambi += r.eventi.filter((e) => e.tipo === 'cambio' && e.chi === 'giocatore').length;
    s.stato = r.stato;
    s.eventi = r.eventi;
    s.selezione = s.stato.giocatore.postura as PosturaId;
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
          sessione.selezione = id as PosturaId;
          disegna();
        }
        break;
      case 'conferma':
        conferma();
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
    else c[chiave] = el.checked;
    config = c as unknown as ConfigArena;
    scrivi(CHIAVE_CONFIG, config);
  });

  menu();
}
