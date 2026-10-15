import type { Categoria, Condizione, FaseProfilo, Mossa, PosturaId, Profilo, StatoDuello } from './types.ts';
import { BALANCE } from '../data/balance.ts';
import { trovaProfilo } from '../data/enemies.ts';
import { estrai } from './rng.ts';

export function categoriaDi(m: Mossa): Categoria {
  if (m.archetipo === 'preparazione') return 'preparazione';
  if (m.archetipo === 'assalto' && m.attacco) return m.attacco.forza === 'pesante' ? 'pesante' : 'leggero';
  return 'difesa';
}

export function faseProfilo(p: Profilo, fase: 1 | 2): FaseProfilo {
  return fase === 2 && p.fase2 ? p.fase2 : p.fase1;
}

// Vero se la mossa m "batte" la postura p secondo la tabella dell'adattamento.
export function battePostura(m: Mossa, p: PosturaId): boolean {
  const b = BALANCE.battute[p];
  if (b.archetipi?.includes(m.archetipo)) return true;
  const a = m.attacco;
  if (!a) return false;
  if (b.sfondaGuardia && a.sfondaGuardia) return true;
  if (b.velocita && a.velocita === b.velocita) return true;
  if (b.portata && a.portata === b.portata) return true;
  if (b.forza && a.forza === b.forza) return true;
  return false;
}

function condizioneVera(c: Condizione, s: StatoDuello): boolean {
  const n = s.nemico;
  const g = s.giocatore;
  switch (c.tipo) {
    case 'vigoreSotto':
      return n.vigore < c.frazione * n.vigoreMax;
    case 'fiatoSotto':
      return n.fiato < c.n;
    case 'avversarioFiatoSotto':
      return g.fiato < c.n;
    case 'avversarioVantaggio':
      return g.vantaggio;
    case 'avversarioPostura':
      return g.postura === c.postura;
  }
}

// Postura su cui il giocatore ha insistito nelle ultime scelte, se l'adattamento è attivo.
function posturaRipetuta(s: StatoDuello): PosturaId | null {
  const h = s.storicoPosture;
  const n = BALANCE.adattamentoScelte;
  if (h.length < n) return null;
  const ultime = h.slice(h.length - n);
  return ultime.every((p) => p === ultime[0]) ? (ultime[0] as PosturaId) : null;
}

// Pesi correnti di ogni mossa candidata (utile anche ai test e al simulatore).
export function pesiCandidate(s: StatoDuello): Array<{ mossa: Mossa; peso: number }> {
  const profilo = trovaProfilo(s.nemico.profiloId);
  const fase = faseProfilo(profilo, s.nemico.fase);
  const ripetuta = s.opzioni.adattamento && fase.adattamento > 1 ? posturaRipetuta(s) : null;
  const out: Array<{ mossa: Mossa; peso: number }> = [];
  for (const pm of fase.mosse) {
    const mossa = profilo.mosse.find((m) => m.id === pm.mossa);
    if (!mossa) throw new Error(`Mossa sconosciuta nel profilo: ${pm.mossa}`);
    // Candidata: stessa postura attuale, oppure fiato per il cambio.
    if (mossa.archetipo !== s.nemico.postura && s.nemico.fiato < BALANCE.costoCambio) continue;
    let peso = pm.peso;
    for (const mod of pm.modificatori ?? []) if (condizioneVera(mod.quando, s)) peso *= mod.x;
    if (ripetuta && battePostura(mossa, ripetuta)) peso *= fase.adattamento;
    out.push({ mossa, peso });
  }
  return out;
}

// Sceglie la prossima mossa del nemico. Lavora su uno stato "di lavoro": modifica rng e sequenzaIdx.
export function sceglieMossaNemico(s: StatoDuello): string {
  const profilo = trovaProfilo(s.nemico.profiloId);
  const fase = faseProfilo(profilo, s.nemico.fase);
  const candidate = pesiCandidate(s);
  if (candidate.length === 0) {
    const prima = fase.mosse[0];
    if (!prima) throw new Error('Profilo senza mosse');
    return prima.mossa;
  }
  if (fase.sequenza && fase.sequenza.length > 0) {
    const id = fase.sequenza[s.nemico.sequenzaIdx % fase.sequenza.length] as string;
    s.nemico.sequenzaIdx += 1;
    if (candidate.some((c) => c.mossa.id === id)) return id;
    return (candidate[0] as { mossa: Mossa }).mossa.id;
  }
  const totale = candidate.reduce((somma, c) => somma + c.peso, 0);
  if (totale <= 0) return (candidate[0] as { mossa: Mossa }).mossa.id;
  let r = estrai(s) * totale;
  for (const c of candidate) {
    r -= c.peso;
    if (r < 0) return c.mossa.id;
  }
  return (candidate[candidate.length - 1] as { mossa: Mossa }).mossa.id;
}
