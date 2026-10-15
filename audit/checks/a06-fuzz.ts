// A06 · Invarianti con fuzz a seed fisso: oltre 10.000 turni casuali su tutti i nemici, opzioni e gradi.
// La disponibilità delle posture e la legalità dei cambi del nemico si ricalcolano qui dal testo di
// ARENA_SPEC (§4.2, §5.1, §12.2 R2), non dal codice.
import type { Controllo, Esito, Voce } from './comune.ts';
import type { Combattente, Mossa, PosturaId, StatoDuello } from '../../src/core/types.ts';
import { creaDuello, resolveTurn } from '../../src/core/resolve.ts';
import { toDuelView } from '../../src/core/view.ts';
import { trovaProfilo } from '../../src/data/enemies.ts';

const NEMICI = ['recluta', 'duellante', 'bruto', 'lanciere', 'mietitore'];
const POSTURE: PosturaId[] = ['assalto', 'guardia', 'attesa', 'distanza'];
const TURNO_MAX = 25; // §4.1
const SPAZIO_MAX = 2; // §12.2 R2

// RNG dell'Audit (xorshift32), indipendente da quello del gioco.
function rngAudit(seed: number): () => number {
  let x = seed >>> 0 || 1;
  return () => {
    x ^= x << 13;
    x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    return x / 4294967296;
  };
}

// §4.2 e R2: tenere la postura è gratis; cambiarla costa 1, ma è gratis con le spalle al muro;
// la Distanza non è disponibile con il contatore ≥ 2.
function spalle(c: Combattente): boolean {
  return c.distanzaConsecutive >= SPAZIO_MAX;
}
function costoCambio(c: Combattente): number {
  return c.postura === 'distanza' && spalle(c) ? 0 : 1;
}
function consentita(c: Combattente, archetipo: string): boolean {
  if (archetipo === 'distanza' && spalle(c)) return false;
  if (archetipo === c.postura) return true;
  return c.fiato >= costoCambio(c);
}

// JSON reversibile: solo numeri finiti, stringhe, booleani, null, array e oggetti semplici.
function nonSerializzabile(v: unknown, percorso = '$'): string | null {
  if (v === null || typeof v === 'string' || typeof v === 'boolean') return null;
  if (typeof v === 'number') return Number.isFinite(v) ? null : `${percorso} = ${v}`;
  if (Array.isArray(v)) {
    for (let i = 0; i < v.length; i++) {
      const r = nonSerializzabile(v[i], `${percorso}[${i}]`);
      if (r) return r;
    }
    return null;
  }
  if (typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype) {
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) {
      const r = nonSerializzabile(x, `${percorso}.${k}`);
      if (r) return r;
    }
    return null;
  }
  return `${percorso}: ${typeof v}`;
}

function mossaDi(s: StatoDuello): Mossa {
  return trovaProfilo(s.nemico.profiloId).mosse.find((m) => m.id === s.mossaNemico) as Mossa;
}

export const controllo: Controllo = {
  id: 'A06',
  titolo: 'Invarianti con fuzz a seed fisso',
  riferimento: 'ARENA_SPEC §4, §5.1, §7, §12.2 R2',
  gates: ['G1'],
  esegui(): Esito {
    const esito: Esito = { voci: [], note: [] };
    const problemi = new Map<string, { n: number; esempio: string }>();
    const segnala = (chiave: string, esempio: string): void => {
      const p = problemi.get(chiave);
      if (p) p.n++;
      else problemi.set(chiave, { n: 1, esempio });
    };
    const rnd = rngAudit(20261015);
    let turni = 0;
    let duelli = 0;
    let rifiutiCorretti = 0;
    let simultaneiDoppioVantaggio = 0;
    const esiti: Record<string, number> = {};

    while (turni < 12000) {
      for (const nemico of NEMICI) {
        duelli++;
        const seed = Math.floor(rnd() * 1e9);
        const g = () => (1 + Math.floor(rnd() * 3)) as 1 | 2 | 3;
        const opz = { hintCompleti: rnd() < 0.5, anteprimaDanni: rnd() < 0.3, adattamento: rnd() < 0.7 };
        let s = creaDuello(nemico, seed, opz, { parata: g(), schivata: g(), distanza: g() });
        const tag = `${nemico}/seed ${seed}`;
        if (!consentita(s.nemico, mossaDi(s).archetipo) && s.nemico.postura !== mossaDi(s).archetipo) segnala('prima mossa nemica non consentita', tag);

        while (s.esito === 'in corso') {
          const prima = JSON.stringify(s);
          const v = toDuelView(s);
          // Disponibilità delle posture: vista contro regole ricalcolate.
          for (const p of v.posture) {
            const atteso = consentita(s.giocatore, p.id);
            if (p.disponibile !== atteso) segnala('posture[].disponibile diverso dalle regole §4.2/R2', `${tag} turno ${s.turno}: ${p.id} ${p.disponibile}, atteso ${atteso}`);
            if (!p.disponibile && !p.motivo) segnala('posture[] non disponibile senza motivo (R7)', `${tag} ${p.id}`);
            if (p.disponibile && p.motivo) segnala('motivo su una postura disponibile', `${tag} ${p.id}`);
            const costoAtteso = p.attiva ? 0 : costoCambio(s.giocatore);
            if (p.costo !== costoAtteso) segnala('posture[].costo diverso da §4.2/R2', `${tag} ${p.id} ${p.costo} invece di ${costoAtteso}`);
            if (s.opzioni.anteprimaDanni && p.disponibile && !p.anteprima) segnala('anteprima mancante con anteprimaDanni', tag);
            if (!s.opzioni.anteprimaDanni && p.anteprima) segnala('anteprima presente senza anteprimaDanni', tag);
          }
          if (v.giocatore.spazio !== Math.min(s.giocatore.distanzaConsecutive, SPAZIO_MAX)) segnala('spazio del giocatore errato', tag);
          if (v.nemico.spazio !== Math.min(s.nemico.distanzaConsecutive, SPAZIO_MAX)) segnala('spazio del nemico errato', tag);
          if (!s.opzioni.hintCompleti && v.hint.dettaglio) segnala('dettaglio dell\'hint senza hintCompleti', tag);
          const ns = nonSerializzabile(v);
          if (ns) segnala('DuelView non serializzabile', `${tag}: ${ns}`);

          // Scelta casuale tra tutte e quattro: le non consentite devono essere rifiutate.
          let scelta = POSTURE[Math.floor(rnd() * 4)] as PosturaId;
          if (!consentita(s.giocatore, scelta)) {
            let lancia = false;
            try {
              resolveTurn(s, scelta);
            } catch {
              lancia = true;
            }
            if (!lancia) segnala('cambio non consentito eseguito (giocatore)', `${tag} turno ${s.turno}: ${scelta}`);
            else rifiutiCorretti++;
            const ok = POSTURE.filter((p) => consentita(s.giocatore, p));
            scelta = ok[Math.floor(rnd() * ok.length)] as PosturaId;
          }

          // Frequenza del caso dell'A05: scambio simultaneo con il vantaggio di entrambi.
          const mn = mossaDi(s);
          const ag = scelta === 'assalto' || scelta === 'guardia';
          if (ag && mn.attacco && s.giocatore.vantaggio && s.nemico.vantaggio) {
            const vg = scelta === 'assalto' ? 'normale' : 'rapido';
            if (vg === mn.attacco.velocita && s.giocatore.velocita === s.nemico.velocita) simultaneiDoppioVantaggio++;
          }

          // Legalità del cambio del nemico (§5.1, R2).
          if (mn.archetipo !== s.nemico.postura && !consentita(s.nemico, mn.archetipo)) segnala('cambio non consentito scelto dall\'IA', `${tag} turno ${s.turno}: ${mn.id}`);
          if (mn.archetipo === 'distanza' && spalle(s.nemico)) segnala('IA in Distanza senza spazio', tag);

          const copia = JSON.parse(prima) as StatoDuello;
          const r = resolveTurn(s, scelta);
          turni++;
          if (JSON.stringify(s) !== prima) segnala('resolveTurn ha modificato lo stato in ingresso', tag);
          const r2 = resolveTurn(copia, scelta);
          if (JSON.stringify(r) !== JSON.stringify(r2)) segnala('non deterministico o non reversibile in JSON', tag);
          const n = r.stato;
          const nsr = nonSerializzabile(n);
          if (nsr) segnala('stato non serializzabile', `${tag}: ${nsr}`);

          for (const [chi, c] of [['giocatore', n.giocatore], ['nemico', n.nemico]] as const) {
            if (c.fiato < 0 || c.fiato > c.fiatoMax) segnala(`fiato fuori intervallo (${chi})`, `${tag} turno ${s.turno}: ${c.fiato}/${c.fiatoMax}`);
            if (c.vigore > c.vigoreMax) segnala(`vigore oltre il massimo (${chi})`, tag);
            const pre = chi === 'giocatore' ? s.giocatore : s.nemico;
            const cont = c.postura === 'distanza' ? pre.distanzaConsecutive + 1 : 0;
            if (c.distanzaConsecutive !== cont) segnala(`contatore della Distanza errato (${chi})`, `${tag} turno ${s.turno}`);
          }
          if (n.nemico.postura !== mn.archetipo) segnala('postura del nemico diversa dall\'archetipo della mossa', tag);
          if (n.giocatore.postura !== scelta) segnala('postura del giocatore diversa dalla scelta', tag);
          if (n.turno > TURNO_MAX) segnala('turno oltre 25', tag);

          const gv = n.giocatore.vigore;
          const nv = n.nemico.vigore;
          const coerente =
            (n.esito === 'vittoria' && nv <= 0 && gv > 0) ||
            (n.esito === 'sconfitta' && gv <= 0 && nv > 0) ||
            (n.esito === 'pareggio' && ((gv <= 0 && nv <= 0) || (gv > 0 && nv > 0 && s.turno === TURNO_MAX))) ||
            (n.esito === 'in corso' && gv > 0 && nv > 0 && n.turno === s.turno + 1);
          if (!coerente) segnala('esito incoerente con vigore e turno', `${tag} turno ${s.turno}: ${n.esito}, vigore ${gv}/${nv}`);
          const vf = toDuelView(n, r.eventi);
          if (vf.registro.some((x) => !x.testo)) segnala('voce di registro senza testo', tag);
          s = n;
        }
        esiti[s.esito] = (esiti[s.esito] ?? 0) + 1;
      }
    }

    for (const [chiave, p] of problemi) {
      const voce: Voce = { gravita: 'Bloccante', testo: `${chiave}: ${p.n} casi (es. ${p.esempio})`, riferimento: 'ARENA_SPEC §4, §5, §7, R2', evidenza: 'node audit/run.ts --solo A06' };
      esito.voci.push(voce);
    }
    esito.note.push(`${turni} turni in ${duelli} duelli (seed dell'Audit 20261015); esiti: ${JSON.stringify(esiti)}.`);
    esito.note.push(`${rifiutiCorretti} scelte non consentite correttamente rifiutate da resolveTurn.`);
    esito.note.push(`Turni con scambio simultaneo e vantaggio di entrambi (caso A05 derivato): ${simultaneiDoppioVantaggio}.`);
    esito.dati = { turni, duelli, esiti, rifiutiCorretti, simultaneiDoppioVantaggio };
    return esito;
  },
};
