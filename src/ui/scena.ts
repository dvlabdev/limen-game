// Layout "scena" (ARENA_S23_SPEC §4, UI_SPEC §5): scena a tutto schermo su 360 × 700 px utili, viandante a
// sinistra e nemico a destra, ventaglio dei medaglioni dietro il viandante. Nessuna logica di gioco.
import type { Chi } from '../core/types.ts';
import type { CombattenteView, DuelView } from '../core/view.ts';
import type { ModelloDuello } from './render.ts';
import { attacco, esc, fiatoPrevisto, intervallo, modificatori, pallini, stati, voce } from './comuni.ts';
import { sagoma } from './sagome.ts';
import { icona, medaglione, simbolo } from './symbols.ts';
import type { StatoMedaglione } from './symbols.ts';

export const LARGHEZZA = 360;
export const ALTEZZA = 700;
const TERRENO = 560; // y del terreno
const FIGURA_PX = 120; // altezza di riferimento (SCENA_SPEC): con px 120 un'unità del disegno vale un pixel
// Riquadro delle sagome (design/sagome.proposed.ts): 200 × 164 unità, terreno a y = 0, 6 unità sotto il terreno.
const RIQUADRO = { larg: 200, alt: 164, sottoTerreno: 6 };
const CX = { giocatore: 160, nemico: 284 } as const;

// Ventaglio (UI_SPEC §5.2): centro dei medaglioni, dalla schiena verso il nemico.
const VENTAGLIO: Array<{ id: 'distanza' | 'attesa' | 'guardia' | 'assalto'; x: number; y: number }> = [
  { id: 'distanza', x: 48, y: 543 },
  { id: 'attesa', x: 40, y: 459 },
  { id: 'guardia', x: 102, y: 382 },
  { id: 'assalto', x: 192, y: 371 },
];

const SAGOME_VIANDANTE = { assalto: 'viandante.assalto', guardia: 'viandante.guardia', preparazione: 'viandante.guardia', attesa: 'viandante.attesa', distanza: 'viandante.distanza' } as const;

function figura(chi: Chi, idSagoma: string, anima: boolean): string {
  const cx = CX[chi];
  const k = FIGURA_PX / 120;
  const top = TERRENO + RIQUADRO.sottoTerreno * k - RIQUADRO.alt * k;
  return `<div class="figura ${chi}${anima ? ' dissolve' : ''}" style="left:${cx - (RIQUADRO.larg * k) / 2}px;top:${top}px">${sagoma(idSagoma, { px: FIGURA_PX, specchia: chi === 'nemico' })}</div>`;
}

// Targhetta con la postura attuale, sotto la figura.
function targhetta(chi: Chi, c: CombattenteView): string {
  return `<div class="targhetta ${chi}" style="left:${CX[chi] - 50}px;top:${TERRENO + 6}px">${icona(c.postura.simbolo, { px: 16 })}<span>${esc(c.postura.nome)}</span></div>`;
}

// Fondale: quinta in --filo, terreno e spazio alle spalle (UI_SPEC §5.4b), il tutto in un solo SVG.
function fondale(v: DuelView): string {
  const tacche = (chi: Chi, spazio: number): string => {
    // Riferimento: viandante (cx 160). Il nemico è lo specchio rispetto alla sua figura.
    const dx = (x: number): number => (chi === 'giocatore' ? x : CX.nemico + (CX.giocatore - x));
    const rect = (x: number, larg: number, y: number, h: number, extra: string): string => {
      const x0 = chi === 'giocatore' ? x : dx(x + larg);
      return `<rect x="${x0}" y="${y}" width="${larg}" height="${h}" ${extra}/>`;
    };
    const piena = 'fill="var(--inchiostro)"';
    const vuota = 'fill="none" stroke="var(--seppia)" stroke-width="1"';
    // Ogni turno concluso in Distanza svuota una tacca, dalla più vicina alla figura.
    return (
      rect(84, 5, 522, 38, piena) +
      rect(98, 13, 553, 7, spazio >= 2 ? vuota : piena) +
      rect(116, 13, 553, 7, spazio >= 1 ? vuota : piena)
    );
  };
  return `<svg class="fondale" viewBox="0 0 ${LARGHEZZA} ${ALTEZZA}" width="${LARGHEZZA}" height="${ALTEZZA}" aria-hidden="true" focusable="false">
    <path d="M0 560V470L24 452V430L40 430V452L70 440L96 470V500L120 508V560Z" fill="var(--filo)" opacity="0.55"/>
    <path d="M360 560V455L338 440V412L326 412V440L300 428L276 462V520L250 530V560Z" fill="var(--filo)" opacity="0.55"/>
    <rect x="0" y="${TERRENO}" width="${LARGHEZZA}" height="${ALTEZZA - TERRENO}" fill="var(--carta)"/>
    <path d="M0 ${TERRENO}H${LARGHEZZA}" stroke="var(--seppia)" stroke-width="1.5"/>
    <path d="M47.6 543.4A124 124 0 0 1 192.1 371.2" fill="none" stroke="var(--seppia)" stroke-width="1.5" stroke-dasharray="3 7" stroke-linecap="round"/>
    ${tacche('giocatore', v.giocatore.spazio)}${tacche('nemico', v.nemico.spazio)}
  </svg>`;
}

function hud(chi: Chi, c: CombattenteView, extra: string, previsione?: [number, number]): string {
  const pct = c.vigoreMax > 0 ? Math.max(0, Math.min(100, (100 * c.vigore) / c.vigoreMax)) : 0;
  const zero = c.fiato <= 0;
  const left = chi === 'giocatore' ? 66 : 216;
  return `<div class="hud ${chi}" style="left:${left}px;top:230px">
    <div class="hud-nome"><span class="nm">${esc(c.nome)}</span><span class="bollini">${stati(c, false)}${extra}</span></div>
    <div class="hud-vigore" role="img" aria-label="Vigore ${c.vigore} su ${c.vigoreMax}">${icona('risorsa.vigore', { px: 12 })}<span class="barra"><i style="width:${pct.toFixed(1)}%"></i></span><span class="num">${c.vigore}/${c.vigoreMax}</span></div>
    <div class="hud-fiato">${zero && !previsione ? `<span class="zero" role="img" aria-label="Senza fiato">${icona('risorsa.fiato', { px: 12 })}<span>Senza fiato</span></span>` : pallini(c, 10, previsione)}</div>
  </div>`;
}

function hintScena(v: DuelView): string {
  const d = v.hint.dettaglio;
  const danno = d?.danno ? (d.danno[0] === d.danno[1] ? `${d.danno[0]}` : `${d.danno[0]}–${d.danno[1]}`) : '';
  return `<div class="hint-scena${attacco(v.hint) ? ' pericolo' : ''}" aria-live="polite">
    ${d ? `<div class="h-dettaglio"><div>${esc(d.nome)}${danno ? ` · ${esc(danno)}` : ''}</div>${modificatori(v.hint)}</div>` : ''}
    <div class="h-nome">${esc(simbolo(v.hint.simbolo).etichetta)}</div>
    ${icona(v.hint.simbolo, { px: 44, parlante: true })}
  </div>`;
}

function cartiglio(m: ModelloDuello): string {
  const v = m.vista;
  if (m.messaggio) return `<div class="cartiglio avviso" role="status">${esc(m.messaggio)}</div>`;
  const p = m.selezione ? v.posture.find((x) => x.id === m.selezione) : undefined;
  if (!p) return `<div class="cartiglio tenue">Tocca un medaglione per scegliere la postura.</div>`;
  const a = p.anteprima
    ? `<div class="anteprima"><span class="giu">↓ subito ${intervallo(p.anteprima.subito)}</span> · <span class="su">↑ inflitto ${intervallo(p.anteprima.inflitto)}</span></div>`
    : '';
  return `<div class="cartiglio" aria-live="polite"><div class="c-nome">${icona(p.simbolo, { px: 16 })} ${esc(p.nome)}</div>${a}<div class="tenue">Tocca di nuovo per confermare</div></div>`;
}

function ventaglio(m: ModelloDuello): string {
  const v = m.vista;
  return VENTAGLIO.map((pos) => {
    const p = v.posture.find((x) => x.id === pos.id);
    if (!p) return '';
    const scelta = p.id === m.selezione;
    const stato: StatoMedaglione = scelta ? 'selezionato' : 'riposo';
    const motivo = p.motivo === 'spazio' ? 'niente spazio' : p.motivo === 'fiato' ? 'fiato' : '';
    const costo = p.attiva || p.costo === 0 ? 0 : p.costo;
    const nota = motivo
      ? `<span class="motivo">${esc(motivo)}</span>`
      : `<span class="costo">${icona(costo === 0 ? 'risorsa.fiato.vuoto' : 'risorsa.fiato.pieno', { px: 10 })} ${costo}</span>`;
    const badge = p.disponibile ? '' : `<span class="badge">${icona(p.motivo === 'spazio' ? 'stato.spalle' : 'risorsa.fiato.vuoto', { px: 20 })}</span>`;
    const nomeAcc = motivo ? `${p.nome}, non disponibile: ${motivo}` : `${p.nome}, ${costo === 0 ? 'gratis' : `costo ${costo} fiato`}`;
    return `<button class="med${scelta ? ' scelta' : ''}${p.disponibile ? '' : ' spenta'}${p.attiva ? ' attiva' : ''}" data-azione="scegli" data-id="${p.id}"
      style="left:${pos.x - 32}px;top:${pos.y - 26}px"${p.disponibile ? '' : ' disabled'} aria-pressed="${scelta}" aria-label="${esc(nomeAcc)}">
      <span class="disco">${medaglione(p.id, stato, { px: 52 })}${badge}</span>
      <span class="et"><b>${esc(p.nome)}</b>${nota}</span></button>`;
  }).join('');
}

// Testo del colpo nel punto d'impatto: etichetta breve con l'icona dell'evento (UI_SPEC §5.4).
function etichetteColpo(v: DuelView): string {
  const conta: Record<Chi, number> = { giocatore: 0, nemico: 0 };
  return v.registro
    .filter((e) => e.dove && e.breve)
    .map((e) => {
      const chi = e.dove as Chi;
      const k = conta[chi]++;
      const colpisce = e.tipo === 'colpo' || e.tipo === 'contrattacco' || e.tipo === 'punta' || e.tipo === 'arresto' || e.tipo === 'parata';
      return `<div class="etichetta-colpo${colpisce ? ' pericolo' : ''}" style="left:${CX[chi] - 62}px;top:${436 + k * 24}px;animation-delay:${k * 0.12}s">${e.simbolo ? icona(e.simbolo, { px: 16 }) : ''}<span>${esc(e.breve as string)}</span></div>`;
    })
    .join('');
}

function cassetto(m: ModelloDuello): string {
  const v = m.vista;
  const ultima = v.registro[v.registro.length - 1];
  const righe = [...m.storico, ...v.registro];
  let corpo = '';
  let t = -1;
  for (const e of righe) {
    if (e.turno !== t) {
      corpo += `<div class="turno-sep">Turno ${esc(e.turno)}</div>`;
      t = e.turno;
    }
    corpo += voce(e);
  }
  const aperto = m.cassetto;
  return `<div class="cassetto${aperto ? ' aperto' : ''}">
    ${aperto ? `<div class="storico" id="storico">${corpo || '<p class="tenue">Ancora niente da raccontare.</p>'}</div>` : ''}
    <button class="maniglia" data-azione="cassetto" aria-expanded="${aperto}" aria-label="Registro del duello">
      <span class="presa" aria-hidden="true"></span>
      <span class="ult">${ultima ? (ultima.simbolo ? icona(ultima.simbolo, { px: 16 }) : '') + `<span class="testo">${esc(ultima.testo)}</span>` : '<span class="testo tenue">Il duello comincia.</span>'}</span>
      <span class="et-reg">Registro</span>
    </button>
  </div>`;
}

function finale(m: ModelloDuello): string {
  if (!m.fine) return '';
  return `<div class="fine-scena pannello fine" role="status">
    <div class="esito ${esc(m.vista.esito)}">${esc(m.fine.esito)}</div>
    <ul>${m.fine.righe.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
    <div class="azioni">
      <button class="primario" data-azione="rigioca-stesso">Rigioca (stesso seed)</button>
      <button data-azione="rigioca-nuovo">Rigioca (nuovo seed)</button>
      <button data-azione="menu">Menu</button>
    </div></div>`;
}

export function disegnaScena(radice: HTMLElement, m: ModelloDuello): void {
  const v = m.vista;
  const n = v.nemico;
  const inCorso = !m.fine;
  const idViandante = SAGOME_VIANDANTE[v.giocatore.postura.id];
  radice.innerHTML = `
    <div class="scena" data-azione="sfondo" style="width:${LARGHEZZA}px;height:${ALTEZZA}px">
      ${fondale(v)}
      <div class="turno">Turno ${esc(Math.min(v.turno, v.turnoMax))}/${esc(v.turnoMax)}</div>
      <button class="menu-btn" data-azione="menu">‹ Menu</button>
      ${hud('giocatore', v.giocatore, '', fiatoPrevisto(v, m.selezione))}
      ${hud('nemico', n, n.haFase2 && n.fase === 2 ? `<span class="bollino">${icona('stato.fase2', { px: 16, parlante: true })}</span>` : '')}
      ${figura('giocatore', idViandante, m.anima)}
      ${figura('nemico', m.nemicoId, false)}
      ${targhetta('giocatore', v.giocatore)}
      ${targhetta('nemico', n)}
      ${inCorso ? hintScena(v) : ''}
      ${inCorso ? cartiglio(m) : ''}
      ${inCorso ? ventaglio(m) : ''}
      ${m.anima ? `<div class="colpi" aria-hidden="true">${etichetteColpo(v)}</div>` : ''}
      ${finale(m)}
      ${cassetto(m)}
    </div>`;
  const el = radice.querySelector<HTMLElement>('#storico');
  if (el) el.scrollTop = el.scrollHeight;
}
