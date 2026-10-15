// Disegna il menu e il duello nel DOM. Nessuna logica di gioco: si legge solo la DuelView.
import type { PosturaId } from '../core/types.ts';
import type { CombattenteView, DuelView } from '../core/view.ts';
import { simbolo } from './symbols.ts';

export interface VoceRegistro {
  turno: number;
  testo: string;
  simbolo?: string;
}

export interface ConfigArena {
  parata: 1 | 2 | 3;
  schivata: 1 | 2 | 3;
  seed: number;
  hintCompleti: boolean;
  anteprimaDanni: boolean;
  adattamento: boolean;
}

export interface ModelloMenu {
  nemici: Array<{ id: string; nome: string; etichetta: string }>;
  config: ConfigArena;
  telemetria: { conteggio: number; json?: string };
}

export interface ModelloDuello {
  vista: DuelView;
  selezione: PosturaId;
  storico: VoceRegistro[]; // turni precedenti all'ultimo
  fine?: { esito: string; righe: string[] };
}

function esc(s: string | number): string {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
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
      <div class="riga"><label for="cfg-parata">Grado di Parata</label>
        <select id="cfg-parata" data-config="parata">${opzioniGrado(c.parata)}</select></div>
      <div class="riga"><label for="cfg-schivata">Grado di Schivata</label>
        <select id="cfg-schivata" data-config="schivata">${opzioniGrado(c.schivata)}</select></div>
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
    </div>`;
  const area = radice.querySelector<HTMLTextAreaElement>('#telemetria-json');
  if (area) {
    area.focus();
    area.select();
  }
}

function pallini(c: CombattenteView): string {
  const pieni = Math.max(0, Math.min(c.fiatoMax, c.fiato));
  const glifo = simbolo('risorsa.fiato').glifo;
  return `<span class="fiato" title="Fiato ${pieni}/${c.fiatoMax}" aria-label="Fiato ${pieni} su ${c.fiatoMax}">${glifo.repeat(pieni)}<span class="vuoto">${glifo.repeat(c.fiatoMax - pieni)}</span></span>`;
}

function barra(c: CombattenteView): string {
  const pct = c.vigoreMax > 0 ? Math.max(0, Math.min(100, (100 * c.vigore) / c.vigoreMax)) : 0;
  return `<div class="vigore"><div class="riempimento" style="width:${pct.toFixed(1)}%"></div><span class="valore">${simbolo('risorsa.vigore').glifo} ${c.vigore}/${c.vigoreMax}</span></div>`;
}

function stati(c: CombattenteView): string {
  const chip = (id: string, attivo: boolean) =>
    attivo ? `<span class="chip attivo">${esc(simbolo(id).glifo)} ${esc(simbolo(id).etichetta)}</span>` : '';
  return chip('stato.vantaggio', c.vantaggio) + chip('stato.preparato', c.preparato);
}

function voce(v: VoceRegistro): string {
  return `<div class="voce"><span class="g">${esc(v.simbolo ? simbolo(v.simbolo).glifo : '·')}</span><span>${esc(v.testo)}</span></div>`;
}

function dettaglioHint(h: DuelView['hint']): string {
  const d = h.dettaglio;
  if (!d) return '';
  const parti = [d.nome];
  if (d.forza) parti.push(d.forza);
  if (d.portata) parti.push(`portata ${d.portata}`);
  if (d.velocita) parti.push(d.velocita);
  if (d.danno) parti.push(`${d.danno[0]}–${d.danno[1]} danni`);
  for (const f of d.flags) parti.push(f === 'sfondaGuardia' ? 'sfonda la guardia' : f === 'inarrestabile' ? 'inarrestabile' : f);
  return `<div class="dettaglio">${esc(parti.join(' · '))}</div>`;
}

function intervallo([a, b]: [number, number]): string {
  return a === b ? `${a}` : `${a}–${b}`;
}

export function disegnaDuello(radice: HTMLElement, m: ModelloDuello): void {
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
      const s = simbolo(p.simbolo);
      const classi = [p.id === m.selezione ? 'scelta' : '', p.attiva ? 'attiva' : ''].filter(Boolean).join(' ');
      const costo = p.attiva ? 'gratis' : `costo ${p.costo} fiato`;
      const anteprima = p.anteprima
        ? `<span class="a">subisci ${intervallo(p.anteprima.subito)} · infliggi ${intervallo(p.anteprima.inflitto)}</span>`
        : '';
      return `<button class="${classi}" data-azione="scegli" data-id="${p.id}"${p.disponibile ? '' : ' disabled'} aria-pressed="${p.id === m.selezione}" aria-label="${esc(p.nome)}, ${esc(costo)}">
        <span class="g">${esc(s.glifo)}</span><span class="n">${esc(p.nome)}</span><span class="c">${esc(costo)}</span>${anteprima}</button>`;
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
       <button class="primario conferma" data-azione="conferma">Conferma</button>`;

  radice.innerHTML = `
    <div class="barra-alta">
      <button data-azione="menu">‹ Menu</button>
      <span class="tenue">Turno ${esc(Math.min(v.turno, v.turnoMax))}/${esc(v.turnoMax)}</span>
    </div>

    <section class="combattente nemico">
      <div class="nome"><span>${esc(n.nome)}</span>${n.haFase2 ? `<span class="fase">${n.fase === 2 ? esc(simbolo('stato.fase2').glifo) + ' ' : ''}Fase ${n.fase}/2</span>` : ''}</div>
      ${barra(n)}
      <div class="dettagli">${pallini(n)}<span><span class="chip">${esc(simbolo(n.postura.simbolo).glifo)} ${esc(n.postura.nome)}</span>${stati(n)}</span></div>
    </section>

    ${
      m.fine
        ? ''
        : `<section class="hint" aria-live="polite">
      <div class="glifo">${esc(hint.glifo)}</div>
      <div class="titolo">${esc(hint.etichetta)}</div>
      ${dettaglioHint(v.hint)}
    </section>`
    }

    <section class="registro">
      <div class="ultimo">${ultimo}</div>
      ${storico ? `<div class="storico" id="storico">${storico}</div>` : ''}
    </section>

    <section class="combattente giocatore">
      <div class="nome"><span>${esc(g.nome)}</span></div>
      ${barra(g)}
      <div class="dettagli">${pallini(g)}<span><span class="chip">${esc(simbolo(g.postura.simbolo).glifo)} ${esc(g.postura.nome)}</span>${stati(g)}</span></div>
    </section>

    ${comandi}`;

  const el = radice.querySelector<HTMLElement>('#storico');
  if (el) el.scrollTop = el.scrollHeight;
}
