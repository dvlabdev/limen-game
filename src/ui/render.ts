// Disegna il menu e il duello nel DOM. Nessuna logica di gioco: si legge solo la DuelView.
import type { PosturaId } from '../core/types.ts';
import type { DuelView } from '../core/view.ts';
import type { VoceRegistro } from './comuni.ts';
import { attacco, barraVigore, costoEtichetta, dettaglioHint, esc, intervallo, pallini, stati, voce } from './comuni.ts';
import { disegnaScena } from './scena.ts';
import { icona, simbolo } from './symbols.ts';

export type { VoceRegistro } from './comuni.ts';

export type Layout = 'scena' | 'griglia';

export interface ConfigArena {
  parata: 1 | 2 | 3;
  schivata: 1 | 2 | 3;
  distanza: 1 | 2 | 3;
  seed: number;
  hintCompleti: boolean;
  anteprimaDanni: boolean;
  adattamento: boolean;
  layout: Layout;
}

export interface ModelloMenu {
  nemici: Array<{ id: string; nome: string; etichetta: string }>;
  config: ConfigArena;
  telemetria: { conteggio: number; json?: string };
}

export interface ModelloDuello {
  vista: DuelView;
  layout: Layout;
  nemicoId: string; // per la sagoma del nemico
  anima: boolean; // subito dopo la conferma: dissolvenza delle sagome e testo del colpo
  cassetto: boolean; // cassetto del registro aperto (scena)
  selezione: PosturaId | null; // mai una postura non disponibile (AUD-002)
  storico: VoceRegistro[]; // turni precedenti all'ultimo
  fine?: { esito: string; righe: string[] };
  messaggio?: string; // avviso discreto (per esempio una scelta non valida)
}

function opzioniGrado(sel: number): string {
  return [1, 2, 3].map((g) => `<option value="${g}"${g === sel ? ' selected' : ''}>${g}</option>`).join('');
}

function interruttore(chiave: string, etichetta: string, nota: string, valore: boolean): string {
  return `<div class="riga"><label for="cfg-${chiave}">${esc(etichetta)}<br><span class="tenue">${esc(nota)}</span></label>
    <input type="checkbox" id="cfg-${chiave}" data-config="${chiave}"${valore ? ' checked' : ''}></div>`;
}

export function disegnaMenu(radice: HTMLElement, m: ModelloMenu): void {
  const c = m.config;
  radice.innerHTML = `
    <div class="pagina">
    <h1>Limen · Arena</h1>
    <p class="tenue">Banco di prova del duello a posture. Scegli un nemico.</p>

    <h2>Nemici</h2>
    <div class="nemici">
      ${m.nemici
        .map((n) => `<button data-azione="nemico" data-id="${esc(n.id)}"><span>${esc(n.nome)}</span><span class="etichetta">${esc(n.etichetta)}</span></button>`)
        .join('')}
    </div>

    <h2>Configurazione</h2>
    <div class="pannello">
      <div class="riga"><label for="cfg-layout">Layout<br><span class="tenue">scena (ventaglio) o griglia classica</span></label>
        <select id="cfg-layout" data-config="layout">
          <option value="scena"${c.layout === 'scena' ? ' selected' : ''}>scena</option>
          <option value="griglia"${c.layout === 'griglia' ? ' selected' : ''}>griglia</option>
        </select></div>
      <div class="riga"><label for="cfg-parata">Grado di Parata</label>
        <select id="cfg-parata" data-config="parata">${opzioniGrado(c.parata)}</select></div>
      <div class="riga"><label for="cfg-schivata">Grado di Schivata</label>
        <select id="cfg-schivata" data-config="schivata">${opzioniGrado(c.schivata)}</select></div>
      <div class="riga"><label for="cfg-distanza">Grado di Distanza<br><span class="tenue">2 = Punta, 3 = Arresto</span></label>
        <select id="cfg-distanza" data-config="distanza">${opzioniGrado(c.distanza)}</select></div>
      <div class="riga"><label for="cfg-seed">Seed</label>
        <div class="campo"><input type="number" id="cfg-seed" data-config="seed" inputmode="numeric" value="${esc(c.seed)}">
        <button data-azione="seed-casuale">Casuale</button></div></div>
      ${interruttore('hintCompleti', 'Hint completi', 'A/B: mostra la mossa esatta e i suoi tratti', c.hintCompleti)}
      ${interruttore('anteprimaDanni', 'Anteprima dei danni', 'A/B: intervalli attesi per ogni postura', c.anteprimaDanni)}
      ${interruttore('adattamento', 'Adattamento del nemico', 'A/B: reagisce se ripeti la stessa postura', c.adattamento)}
    </div>

    <h2>Telemetria</h2>
    <div class="pannello telemetria">
      <p>Duelli registrati: <strong>${esc(m.telemetria.conteggio)}</strong></p>
      <div class="azioni">
        <button data-azione="copia"${m.telemetria.conteggio ? '' : ' disabled'}>Copia JSON</button>
        <button data-azione="azzera"${m.telemetria.conteggio ? '' : ' disabled'}>Azzera</button>
      </div>
      ${m.telemetria.json !== undefined ? `<textarea id="telemetria-json" readonly>${esc(m.telemetria.json)}</textarea>` : ''}
    </div></div>`;
  const area = radice.querySelector<HTMLTextAreaElement>('#telemetria-json');
  if (area) {
    area.focus();
    area.select();
  }
}

function combattenteGriglia(v: DuelView['giocatore'], extra: string): string {
  return `<div class="nome"><span>${esc(v.nome)}</span>${extra}</div>
      ${barraVigore(v)}
      <div class="dettagli">${pallini(v)}<span><span class="chip">${icona(v.postura.simbolo, { px: 16 })} ${esc(v.postura.nome)}</span>${stati(v, true)}</span></div>
      ${v.fiato <= 0 ? `<div class="senzafiato">${icona('risorsa.fiato', { px: 12 })} Senza fiato: niente reazioni</div>` : ''}`;
}

// Layout "griglia": la variante classica, con i nuovi simboli (UI_SPEC §5.5).
export function disegnaGriglia(radice: HTMLElement, m: ModelloDuello): void {
  const v = m.vista;
  const n = v.nemico;
  const g = v.giocatore;
  const hint = simbolo(v.hint.simbolo);

  const ultimo = v.registro.length
    ? v.registro.map(voce).join('')
    : '<p class="tenue">Il duello comincia: leggi l’hint e scegli una postura.</p>';
  let storico = '';
  let ultimoTurno = -1;
  for (const e of m.storico) {
    if (e.turno !== ultimoTurno) {
      storico += `<div class="turno-sep">Turno ${esc(e.turno)}</div>`;
      ultimoTurno = e.turno;
    }
    storico += voce(e);
  }

  const posture = v.posture
    .map((p) => {
      const classi = [p.id === m.selezione ? 'scelta' : '', p.attiva ? 'attiva' : '', p.disponibile ? '' : 'spenta'].filter(Boolean).join(' ');
      const costo = costoEtichetta(p);
      const anteprima = p.anteprima
        ? `<span class="a"><span class="giu">↓ ${intervallo(p.anteprima.subito)}</span> · <span class="su">↑ ${intervallo(p.anteprima.inflitto)}</span></span>`
        : '';
      return `<button class="${classi}" data-azione="scegli" data-id="${p.id}"${p.disponibile ? '' : ' disabled'} aria-pressed="${p.id === m.selezione}" aria-label="${esc(p.nome)}, ${esc(costo)}">
        <span class="g">${icona(p.simbolo, { px: 28 })}</span><span class="n">${esc(p.nome)}</span><span class="c">${esc(costo)}</span>${anteprima}</button>`;
    })
    .join('');

  const comandi = m.fine
    ? `<div class="pannello fine">
        <div class="esito ${esc(v.esito)}">${esc(m.fine.esito)}</div>
        <ul>${m.fine.righe.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
        <div class="azioni">
          <button class="primario" data-azione="rigioca-stesso">Rigioca (stesso seed)</button>
          <button data-azione="rigioca-nuovo">Rigioca (nuovo seed)</button>
          <button data-azione="menu">Menu</button>
        </div></div>`
    : `<div class="posture">${posture}</div>
       ${m.messaggio ? `<p class="avviso" role="status">${esc(m.messaggio)}</p>` : ''}
       <button class="primario conferma" data-azione="conferma"${m.selezione ? '' : ' disabled'}>${m.selezione ? 'Conferma' : 'Scegli una postura'}</button>`;

  radice.innerHTML = `
    <div class="pagina griglia">
    <div class="barra-alta">
      <button data-azione="menu">‹ Menu</button>
      <span class="tenue">Turno ${esc(Math.min(v.turno, v.turnoMax))}/${esc(v.turnoMax)}</span>
    </div>

    <section class="combattente nemico">
      ${combattenteGriglia(n, n.haFase2 ? `<span class="fase">${n.fase === 2 ? icona('stato.fase2', { px: 16, parlante: true }) + ' ' : ''}Fase ${n.fase}/2</span>` : '')}
    </section>

    ${
      m.fine
        ? ''
        : `<section class="hint${attacco(v.hint) ? ' pericolo' : ''}" aria-live="polite">
      <div class="glifo">${icona(v.hint.simbolo, { px: 44, parlante: true })}</div>
      <div class="titolo">${esc(hint.etichetta)}</div>
      ${dettaglioHint(v.hint)}
    </section>`
    }

    <section class="registro">
      <div class="ultimo">${ultimo}</div>
      ${storico ? `<div class="storico" id="storico">${storico}</div>` : ''}
    </section>

    <section class="combattente giocatore">
      ${combattenteGriglia(g, '')}
    </section>

    ${comandi}
    </div>`;

  const el = radice.querySelector<HTMLElement>('#storico');
  if (el) el.scrollTop = el.scrollHeight;
}

export function disegnaDuello(radice: HTMLElement, m: ModelloDuello): void {
  if (m.layout === 'scena') disegnaScena(radice, m);
  else disegnaGriglia(radice, m);
}
