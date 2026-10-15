// Strumenti di prova: un profilo "banco" con le mosse della matrice di ARENA_SPEC §4.6.
import type { Attacco, Combattente, Dado, Mossa, PosturaId, Profilo, StatoDuello, StatoNemico } from '../src/core/types.ts';
import { registraProfilo } from '../src/data/enemies.ts';
import { resolveTurn } from '../src/core/resolve.ts';
import { POSTURE } from '../src/data/postures.ts';

function att(
  forza: Attacco['forza'],
  portata: Attacco['portata'],
  velocita: Attacco['velocita'],
  danno: number,
  extra: Partial<Attacco> = {},
): Attacco {
  return { forza, portata, velocita, danno: [danno, danno], ...extra };
}

function assalto(id: string, a: Attacco): Mossa {
  return { id, nome: id, archetipo: 'assalto', attacco: a };
}

export const MOSSE_BANCO: Record<string, Mossa> = {
  P1: assalto('P1', att('pesante', 'corta', 'normale', 6)),
  P2: assalto('P2', att('pesante', 'lunga', 'lento', 6)),
  L1: assalto('L1', att('leggero', 'corta', 'rapido', 3)),
  L2: assalto('L2', att('leggero', 'lunga', 'normale', 3)),
  D: { id: 'D', nome: 'D', archetipo: 'guardia' },
  PR: { id: 'PR', nome: 'PR', archetipo: 'preparazione' },
  // Per i test dedicati.
  SG: assalto('SG', att('pesante', 'corta', 'normale', 6, { sfondaGuardia: true })),
  SGL: assalto('SGL', att('leggero', 'corta', 'normale', 3, { sfondaGuardia: true })),
  IN: assalto('IN', att('pesante', 'corta', 'lento', 6, { inarrestabile: true })),
  PL: assalto('PL', att('pesante', 'corta', 'lento', 6)),
};

export const PROFILO_BANCO: Profilo = {
  id: 'banco',
  nome: 'Banco',
  vigore: 100,
  fiato: 5,
  velocita: 2,
  gradi: { parata: 1, schivata: 1, distanza: 1 },
  mosse: Object.values(MOSSE_BANCO),
  fase1: { mosse: Object.keys(MOSSE_BANCO).map((mossa) => ({ mossa, peso: 1 })), adattamento: 1 },
  fase2: { mosse: Object.keys(MOSSE_BANCO).map((mossa) => ({ mossa, peso: 1 })), adattamento: 1 },
};
registraProfilo(PROFILO_BANCO);

// Giocatore: 30 di vigore, 4 di fiato, velocità 2, gradi 1/1. Nemico: 100 di vigore, 5 di fiato.
export function statoProva(
  mossaNemico: string,
  posturaGiocatore: PosturaId,
  modifiche: { giocatore?: Partial<Combattente>; nemico?: Partial<StatoNemico> } = {},
): StatoDuello {
  const m = MOSSE_BANCO[mossaNemico] as Mossa;
  const stato: StatoDuello = {
    turno: 1,
    esito: 'in corso',
    giocatore: {
      nome: 'Viandante',
      vigore: 30,
      vigoreMax: 30,
      fiato: 4,
      fiatoMax: 6,
      velocita: 2,
      postura: POSTURE[posturaGiocatore].archetipo,
      vantaggio: false,
      preparato: false,
      distanzaConsecutive: 0,
      gradi: { parata: 1, schivata: 1, distanza: 1 },
    },
    nemico: {
      nome: 'Banco',
      vigore: 100,
      vigoreMax: 100,
      fiato: 5,
      fiatoMax: 5,
      velocita: 2,
      postura: m.archetipo,
      vantaggio: false,
      preparato: false,
      distanzaConsecutive: 0,
      gradi: { parata: 1, schivata: 1, distanza: 1 },
      profiloId: 'banco',
      fase: 1,
      sequenzaIdx: 0,
    },
    mossaNemico: mossaNemico,
    storicoPosture: [],
    rng: 1,
    seed: 1,
    opzioni: { hintCompleti: false, anteprimaDanni: false, adattamento: true },
  };
  Object.assign(stato.giocatore, modifiche.giocatore);
  Object.assign(stato.nemico, modifiche.nemico);
  return stato;
}

// Tiri della matrice: Assalto 5, Guardia 2 (e Punta 2), contrattacco 3, Arresto 3; le mosse nemiche hanno danno fisso.
export const dadoMatrice: Dado = (min, max) => {
  if (min === 4 && max === 6) return 5;
  if (min === 1 && max === 2) return 2;
  if (min === 3 && max === 4) return 3;
  if (min === 2 && max === 3) return 3; // Arresto
  return min;
};

export function gioca(stato: StatoDuello, scelta: PosturaId) {
  return resolveTurn(stato, scelta, { dado: dadoMatrice, saltaIA: true });
}

export function subito(prima: StatoDuello, dopo: StatoDuello): number {
  return prima.giocatore.vigore - dopo.giocatore.vigore;
}

export function inflitto(prima: StatoDuello, dopo: StatoDuello): number {
  return prima.nemico.vigore - dopo.nemico.vigore;
}
