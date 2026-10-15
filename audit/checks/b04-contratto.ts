// B04a · Contratto UI, parte automatica: i campi di DuelView aggiunti dalla fase C2 (spalle, spazio, motivo,
// registro[].dove/.breve) sono popolati in modo coerente con ARENA_SPEC §12.2 R2/R7, §12.8 1 e §7; la vista è
// serializzabile; l'hint non rivela più di quanto dice §7. La lettura di src/ui/ (nessuna regola di gioco)
// è il controllo di giudizio B04, descritto nel report.
import type { Controllo, Esito } from './comune.ts';
import type { PosturaId } from '../../src/core/types.ts';
import { creaDuello, resolveTurn } from '../../src/core/resolve.ts';
import { toDuelView } from '../../src/core/view.ts';

const EVENTI_CON_POSIZIONE = ['colpo', 'parata', 'schivata', 'evitato', 'contrattacco', 'punta', 'arresto', 'incalza', 'interrotto', 'rotta'];

export const controllo: Controllo = {
  id: 'B04a',
  titolo: 'Contratto DuelView: campi della C2 popolati',
  riferimento: 'ARENA_SPEC §7, §12.2 R2/R7, §12.8 1; ARENA_S23_SPEC §4',
  gates: ['G3'],
  esegui(): Esito {
    const esito: Esito = { voci: [], note: [] };
    const errori = new Set<string>();
    const err = (testo: string): void => void errori.add(testo);
    const posture: PosturaId[] = ['assalto', 'guardia', 'attesa', 'distanza'];
    let viste = 0;
    let conPosizione = 0;
    let spalleViste = 0;
    let k = 0;
    for (const nemico of ['recluta', 'duellante', 'bruto', 'lanciere', 'mietitore']) {
      for (let seed = 1; seed <= 40; seed++) {
        const opzioni = { hintCompleti: seed % 2 === 0, anteprimaDanni: seed % 3 === 0, adattamento: true };
        let s = creaDuello(nemico, seed, opzioni, { parata: 1, schivata: 1, distanza: ((seed % 3) + 1) as 1 | 2 | 3 });
        let eventi: ReturnType<typeof resolveTurn>['eventi'] = [];
        for (;;) {
          const v = toDuelView(s, eventi);
          viste++;
          if (JSON.stringify(JSON.parse(JSON.stringify(v))) !== JSON.stringify(v)) err('la vista non è serializzabile in JSON');
          for (const [chi, c] of [['giocatore', v.giocatore], ['nemico', v.nemico]] as const) {
            if (c.spazio < 0 || c.spazio > 2 || !Number.isInteger(c.spazio)) err(`${chi}.spazio fuori da 0–2: ${c.spazio}`);
            if (typeof c.spalle !== 'boolean') err(`${chi}.spalle non è booleano`);
            if (c.spalle !== (c.spazio >= 2)) err(`${chi}: spalle=${c.spalle} con spazio=${c.spazio} (R2: spalle solo con il contatore a 2)`);
            if (c.spalle) spalleViste++;
          }
          if (s.esito === 'in corso') {
            const dist = v.posture.find((p) => p.id === 'distanza');
            if (v.giocatore.spalle && (!dist || dist.disponibile || dist.motivo !== 'spazio')) err('con le spalle al muro la Distanza deve essere non disponibile con motivo "spazio" (R2)');
            for (const p of v.posture) {
              if (p.disponibile && p.motivo !== undefined) err(`${p.id}: motivo presente su una postura disponibile`);
              if (!p.disponibile && p.motivo !== 'fiato' && p.motivo !== 'spazio') err(`${p.id}: postura non disponibile senza motivo (R7)`);
              if (p.motivo === 'spazio' && p.id !== 'distanza') err(`${p.id}: motivo "spazio" su una postura diversa dalla Distanza`);
              if (p.anteprima && (!v.posture.length || !s.opzioni.anteprimaDanni || !p.disponibile)) err(`${p.id}: anteprima fuori dalle condizioni di §7`);
              if (s.opzioni.anteprimaDanni && p.disponibile && !p.anteprima) err(`${p.id}: anteprima mancante con l'interruttore attivo`);
            }
            if (v.posture.filter((p) => p.attiva).length !== 1) err('deve esserci una sola postura attiva');
            if (v.posture.length !== 4) err('le posture della vista non sono 4');
          }
          if (!s.opzioni.hintCompleti && v.hint.dettaglio) err('l\'hint rivela il dettaglio senza hintCompleti (DESIGN §5.4)');
          if (s.opzioni.hintCompleti && s.esito === 'in corso' && !v.hint.dettaglio) err('hintCompleti attivo ma senza dettaglio');
          for (const r of v.registro) {
            const posizione = r.dove !== undefined || r.breve !== undefined;
            if ((r.dove === undefined) !== (r.breve === undefined)) err(`registro ${r.tipo}: dove e breve vanno insieme`);
            if (r.dove !== undefined && r.dove !== 'giocatore' && r.dove !== 'nemico') err(`registro ${r.tipo}: dove non valido (${String(r.dove)})`);
            if (r.breve !== undefined && !r.breve.trim()) err(`registro ${r.tipo}: breve vuoto`);
            if (EVENTI_CON_POSIZIONE.includes(r.tipo) && !posizione) err(`registro ${r.tipo}: manca dove/breve per il testo del colpo`);
            if (posizione) conPosizione++;
          }
          if (s.esito !== 'in corso') break;
          const ok = v.posture.filter((p) => p.disponibile).map((p) => p.id);
          const scelta = ok[(k++ * 5 + seed) % ok.length] as PosturaId;
          const r = resolveTurn(s, posture.includes(scelta) ? scelta : 'guardia');
          s = r.stato;
          eventi = r.eventi;
        }
      }
    }
    for (const e of errori) esito.voci.push({ gravita: 'Maggiore', testo: e, riferimento: 'ARENA_SPEC §7, §12.2 R7, §12.8 1', evidenza: 'src/core/view.ts' });
    esito.note.push(`${viste} viste controllate (5 nemici × 40 seed, opzioni variate): spalle/spazio/motivo coerenti con R2 e R7 (spalle viste: ${spalleViste}); ${conPosizione} voci di registro con dove/breve; vista serializzabile; hint e anteprima nei limiti di §7.`);
    return esito;
  },
};
