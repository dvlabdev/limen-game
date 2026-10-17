// Elementi di scena e d'interfaccia per i fotogrammi bersaglio: carta, cielo inciso, quinte, terreno,
// HUD appesi, hint, ventaglio, cartiglio, cassetto. Tutto in SVG con i token di UI_SPEC §4.
import { SIMBOLI } from '../symbols.proposed.ts';
import { poli, linea, fuso, nastro, f1, piu, dir } from './marionetta.mjs';

// --- Caso con seme: le texture sono sempre le stesse a ogni generazione ------------------------------
export function rng(seme) {
  let a = seme >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const path = (d, cls) => `<path class="${cls}" d="${d}"/>`;
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// Testo: serif per i nomi e i titoli, sans per i dati (UI_SPEC §4: pila di sistema, niente font esterni).
export function testo(x, y, s, opz = {}) {
  const { size = 14, cls = 'ti', anchor = 'start', weight = null, famiglia = 'serif', italic = false, ls = null } = opz;
  const st = [`font-size:${size}px`];
  if (weight) st.push(`font-weight:${weight}`);
  if (italic) st.push('font-style:italic');
  if (ls) st.push(`letter-spacing:${ls}`);
  return `<text class="${cls} ${famiglia === 'serif' ? 'fs' : 'fd'}" x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="${st.join(';')}">${s}</text>`;
}

// Simbolo del set (griglia 24) a una taglia in px, centrato in (cx, cy).
export function icona(id, cx, cy, px, cls = 'i', piccolo = false) {
  const s = SIMBOLI[id];
  if (!s) throw new Error('simbolo mancante: ' + id);
  const corpo = piccolo && s.piccolo ? s.piccolo : s.svg;
  return `<g class="${cls}" transform="translate(${f1(cx - px / 2)} ${f1(cy - px / 2)}) scale(${f1((px / 24) * 1000) / 1000})">${corpo}</g>`;
}
// Simbolo da un tracciato proprio (griglia 24): per i simboli delle milestone, proposti qui.
export function iconaD(corpo, cx, cy, px, cls = 'i') {
  return `<g class="${cls}" transform="translate(${f1(cx - px / 2)} ${f1(cy - px / 2)}) scale(${f1((px / 24) * 1000) / 1000})">${corpo}</g>`;
}

// --- Medaglione del ventaglio (UI_SPEC §3) -------------------------------------------------------
const anello = (r1, r2) => `M${12 - r1} 12A${r1} ${r1} 0 1 0 ${12 + r1} 12A${r1} ${r1} 0 1 0 ${12 - r1} 12Z M${12 - r2} 12A${r2} ${r2} 0 1 0 ${12 + r2} 12A${r2} ${r2} 0 1 0 ${12 - r2} 12Z`;
const CORNICE = {
  riposo: { d: anello(11.5, 10.4), k: 0.62 },
  selezionato: { d: anello(11.5, 10.4) + ' ' + anello(9.4, 8.8), k: 0.62 },
  confermato: { d: anello(11.5, 9.2) + ' ' + anello(8.4, 7.9), k: 0.56 },
};
export function medaglione(id, cx, cy, px, stato = 'riposo', opz = {}) {
  const c = CORNICE[stato];
  const segno = opz.corpo ?? SIMBOLI[id].svg;
  const spento = opz.spento ? ' style="opacity:.3"' : '';
  return `<g transform="translate(${f1(cx - px / 2)} ${f1(cy - px / 2)}) scale(${f1((px / 24) * 1000) / 1000})">` +
    `<circle class="c" cx="12" cy="12" r="11.2"/>` +
    `<path class="${opz.clsAnello ?? 'i'}" fill-rule="evenodd" d="${c.d}"/>` +
    `<g class="${opz.clsSegno ?? 'i'}"${spento} transform="translate(12 12) scale(${c.k}) translate(-12 -12)">${segno}</g></g>`;
}

// --- Carta e cielo inciso ----------------------------------------------------------------------------
// Grana della carta: piccole fibre in filo, poche e sparse, come la carta di un libro stampato.
export function grana(r, x0, y0, w, h, n, cls = 'f') {
  let d = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * w, y = y0 + r() * h, a = r() * 180, l = 0.8 + r() * 2.2;
    const [dx, dy] = dir(a);
    d += poli(fuso([x, y], [x + dx * l, y + dy * l], 0.5 + r() * 0.5));
  }
  return path(d, cls);
}

// Cielo a righe di sgorbia: tratti orizzontali affusolati, più fitti e spessi in alto.
export function cielo(r, y0, y1, opz = {}) {
  const { cls = 'f', passo = 6.5, salta = null, scuro = 0 } = opz;
  let d = '', dScuro = '';
  for (let y = y0 + 3; y < y1; y += passo + r() * 1.4) {
    const t = (y - y0) / (y1 - y0);
    const spess = 2.1 - t * 1.6;
    let x = -6 + r() * 10;
    while (x < 360) {
      const l = 18 + r() * (60 + t * 70);
      const gap = 3 + r() * (5 + t * 30);
      const a = [x, y + (r() - 0.5) * 0.8], b = [Math.min(x + l, 366), y + (r() - 0.5) * 0.8];
      const pz = poli(fuso(a, b, Math.max(0.5, spess * (0.6 + r() * 0.6)) * (y < scuro ? 1.35 : 1)));
      if (!(salta && salta(a, b))) { if (y < scuro) dScuro += pz; else d += pz; }
      x += l + gap;
    }
  }
  return path(d, cls) + (dScuro ? path(dScuro, 'is') : '');
}

// Nuvola incisa: banco di carta chiara dal profilo a lobi sfaccettati, con i tagli sotto in seppia.
export function nuvola(r, cx, cy, w, h) {
  // lobi: archi sfaccettati di raggio diverso, appoggiati su un fondo quasi piatto
  const lobi = [];
  let x = cx - w / 2;
  while (x < cx + w / 2 - 4) {
    const t = (x - (cx - w / 2)) / w;
    const rr = Math.max(4, h * (0.35 + 0.65 * Math.sin(Math.PI * Math.min(1, t + 0.08))) * (0.6 + r() * 0.5));
    lobi.push([x + rr, rr]);
    x += rr * (1.3 + r() * 0.4);
  }
  const top = [[cx - w / 2, cy]];
  for (const [lx, rr] of lobi) for (let k = 0; k <= 5; k++) top.push(piu([lx, cy - rr * 0.2], dir(180 - k * 36), rr));
  top.push([x + 2, cy]);
  const fondo = [[x + 2, cy + 1.5], [cx, cy + 3], [cx - w / 2, cy + 1.5]];
  let s = path(poli([...top, ...fondo]), 'c');
  let d = '';
  for (let k = 0; k < 3; k++) {
    const yy = cy - 1.5 - k * 3.6, ww = (x - (cx - w / 2)) * (0.86 - k * 0.24);
    const mx = (cx - w / 2 + x) / 2;
    d += poli(fuso([mx - ww / 2 + r() * 6, yy], [mx + ww / 2 - r() * 6, yy], 1.4 - k * 0.3));
  }
  s += path(d, 'is');
  s += `<path class="ls" d="${linea(top)}" style="stroke-width:1.1"/>`;
  return s;
}
// Corvi lontani: piccole V spezzate.
export function corvi(r, punti) {
  let d = '';
  for (const [x, y, k] of punti) {
    d += poli([[x - 5 * k, y - 1.6 * k], [x - 2 * k, y - 0.4 * k], [x, y + 1.2 * k], [x + 2.2 * k, y - 0.6 * k], [x + 5.4 * k, y - 2.2 * k], [x + 2.4 * k, y + 0.6 * k], [x, y + 2.4 * k], [x - 2.2 * k, y + 0.8 * k]]);
  }
  return path(d, 'i');
}

// Luna: disco di carta, aloni incisi a tratti concentrici.
export function luna(r, cx, cy, rad) {
  let d = '';
  for (const [k, w] of [[1.28, 1.4], [1.56, 1.1], [1.86, 0.8]]) {
    const R = rad * k, n = Math.round(R * 0.9);
    for (let i = 0; i < n; i++) {
      if (r() < 0.22) continue;
      const a0 = (i / n) * 360, a1 = a0 + (360 / n) * (0.45 + r() * 0.35);
      const pts = [0, 0.5, 1].map((t) => piu([cx, cy], dir(a0 + (a1 - a0) * t), R));
      d += poli(nastro(pts, (t) => w * Math.sin(Math.PI * (0.15 + t * 0.7))));
    }
  }
  // crateri: tagli di inchiostro sottili sulla carta
  const cr = [[-0.35, -0.2, 0.22], [0.25, 0.3, 0.16], [0.2, -0.38, 0.1], [-0.1, 0.45, 0.08]];
  let c = '';
  for (const [x, y, k] of cr) {
    const R = rad * k, cx2 = cx + x * rad, cy2 = cy + y * rad;
    c += poli(Array.from({ length: 7 }, (_, i) => piu([cx2, cy2], dir(i * (360 / 7) + 10), R)));
  }
  return path(d, 'f') + `<circle class="c" cx="${cx}" cy="${cy}" r="${rad}"/>` + path(c, 'f') +
    `<circle class="li" cx="${cx}" cy="${cy}" r="${rad}" style="stroke-width:1.2"/>`;
}

// Tratteggio orizzontale dentro una cresta y = cresta(x), fino a y1 (quinte lontane incise).
export function tratteggioSotto(r, cresta, x0, x1, y1, opz = {}) {
  const { passo = 3.2, cls = 'f', w = 1 } = opz;
  let d = '';
  const ymin = Math.min(...Array.from({ length: 50 }, (_, i) => cresta(x0 + ((x1 - x0) * i) / 49)));
  for (let y = ymin + 1.5; y < y1; y += passo) {
    let dentro = null;
    for (let x = x0; x <= x1 + 2; x += 2) {
      const ok = x <= x1 && cresta(x) < y - 0.5;
      if (ok && dentro == null) dentro = x;
      if (!ok && dentro != null) {
        if (x - dentro > 4) d += poli(fuso([dentro + r() * 2, y], [x - 2 - r() * 2, y], w * (0.7 + r() * 0.5)));
        dentro = null;
      }
    }
  }
  return path(d, cls);
}
export const crestaDa = (punti) => (x) => {
  for (let i = 0; i < punti.length - 1; i++) {
    const [ax, ay] = punti[i], [bx, by] = punti[i + 1];
    if (x >= ax && x <= bx) return ay + ((by - ay) * (x - ax)) / (bx - ax || 1);
  }
  return x < punti[0][0] ? punti[0][1] : punti[punti.length - 1][1];
};

// --- Terreno e primo piano ---------------------------------------------------------------------------
export function terreno(r, y, opz = {}) {
  const { fino = 700, x0 = 0, x1 = 360 } = opz;
  let d = '';
  // linea di terra: un tratto spesso, appena irregolare
  const pts = [];
  for (let x = x0 - 4; x <= x1 + 4; x += 12) pts.push([x, y + (r() - 0.5) * 1.2]);
  d += poli(nastro(pts, () => 2.4));
  // righe del suolo, più fitte verso lo spettatore
  let yy = y + 7, passo = 9;
  while (yy < fino) {
    const t = (yy - y) / (fino - y);
    let x = x0 - 10 + r() * 30;
    while (x < x1) {
      const l = 4 + r() * (8 + t * 26), w = 0.7 + t * 1.5;
      const inc = (r() - 0.5) * 3;
      d += poli(fuso([x, yy + r() * 2], [x + l, yy + inc], w));
      x += l + 8 + r() * (40 - t * 26);
    }
    yy += passo; passo *= 0.88; if (passo < 3.4) passo = 3.4;
  }
  // sterpi e sassolini
  for (let i = 0; i < 40; i++) {
    const x = x0 + r() * (x1 - x0), yb = y + 6 + r() * (fino - y - 10), hh = 1.6 + r() * 3;
    d += poli([[x - 0.6, yb], [x + (r() - 0.5) * 2, yb - hh], [x + 0.7, yb]]);
  }
  return path(d, 'i');
}
// Ciuffi d'erba sulla linea di terra.
export function ciuffo(r, x, y, h = 8, n = 5, cls = 'i') {
  let d = '';
  for (let i = 0; i < n; i++) {
    const bx = x + (i - n / 2) * 2.2 + r(), a = 90 + (i - n / 2) * 9 + (r() - 0.5) * 12, hh = h * (0.6 + r() * 0.6);
    const tip = piu([bx, y], dir(a), hh);
    d += poli([[bx - 1, y + 0.5], tip, [bx + 1.1, y + 0.5]]);
  }
  return path(d, cls);
}
export function sasso(r, cx, cy, w, h) {
  const pts = [[cx - w / 2, cy], [cx - w * 0.42, cy - h * 0.6], [cx - w * 0.1, cy - h], [cx + w * 0.3, cy - h * 0.86], [cx + w / 2, cy - h * 0.3], [cx + w * 0.46, cy]];
  return path(poli(pts), 'i') + `<path class="cut" d="${linea([[cx - w * 0.3, cy - h * 0.55], [cx - w * 0.05, cy - h * 0.82], [cx + w * 0.22, cy - h * 0.72]])}"/>`;
}
// Primo piano: massa d'inchiostro con l'orlo d'erba, tagli bianchi, sotto la scena.
export function primoPiano(r, y, alti = []) {
  const pts = [[-4, 790], [-4, y]];
  for (let x = 0; x <= 364; x += 3) {
    let h = 3 + r() * 6;
    for (const [cx, hh, w] of alti) { const t = 1 - Math.abs(x - cx) / w; if (t > 0) h += hh * t * t * (0.5 + r() * 0.7); }
    pts.push([x - 1.4, y - 0.5 + r()], [x, y - h]);
  }
  pts.push([364, y], [364, 790]);
  let cut = '';
  for (let i = 0; i < 26; i++) {
    const x = r() * 360, yy = y + 10 + r() * 70, l = 6 + r() * 22;
    cut += poli(fuso([x, yy], [x + l * 0.3, yy - l], 0.8 + r() * 0.6));
  }
  return path(poli(pts), 'i') + path(cut, 'k');
}

// --- HUD appeso: cartellino del teatro di carta, due fili dall'alto ----------------------------------
export function hud(cx, y, c) {
  const w = 128, h = 50, x = cx - w / 2;
  const sm = 4;
  const corpo = [[x + sm, y], [x + w - sm, y], [x + w, y + sm], [x + w, y + h - sm], [x + w - sm, y + h], [x + sm, y + h], [x, y + h - sm], [x, y + sm]];
  let s = `<g class="hud">`;
  s += `<path class="lf" d="M${x + 16} 0V${y}M${x + w - 16} 0V${y}" style="stroke-width:.9"/>`;
  s += path(poli(corpo), 'c') + `<path class="li" d="${poli(corpo)}" style="stroke-width:1.4"/>`;
  s += `<circle class="i" cx="${x + 16}" cy="${y + 3.4}" r="1.6"/><circle class="i" cx="${x + w - 16}" cy="${y + 3.4}" r="1.6"/>`;
  s += testo(x + 8, y + 18, c.nome, { size: 14, weight: 600 });
  (c.stati || []).forEach((id, i) => { s += icona(id, x + w - 13 - i * 19, y + 13, 16); });
  // vigore: cuore, barra, numero
  const bx = x + 22, bw = 62, by = y + 25;
  s += icona('risorsa.vigore', x + 12, by + 3.5, 12);
  s += `<rect class="c" x="${bx}" y="${by}" width="${bw}" height="7"/>`;
  s += `<rect class="i" x="${bx}" y="${by}" width="${f1((bw * c.vig) / c.max)}" height="7"/>`;
  if (c.perso) s += `<rect class="p" x="${f1(bx + (bw * c.vig) / c.max)}" y="${by}" width="${f1((bw * c.perso) / c.max)}" height="7"/>`;
  s += `<rect class="li" x="${bx}" y="${by}" width="${bw}" height="7" style="stroke-width:1"/>`;
  s += testo(x + w - 7, by + 7.5, `${c.vig}<tspan class="ts" style="font-size:12px">/${c.max}</tspan>`, { size: 12, anchor: 'end', famiglia: 'dato', weight: 600 });
  // fiato: pallini
  for (let i = 0; i < c.fiatoMax; i++) {
    s += icona(i < c.fiato ? 'risorsa.fiato.pieno' : 'risorsa.fiato.vuoto', x + 12 + i * 11, y + 42, 10, c.speso === i ? 'p' : 'i');
  }
  s += icona('risorsa.fiato', x + w - 12, y + 42, 12, 'is');
  return s + '</g>';
}

// --- Hint sopra il nemico (UI_SPEC §5.3): simbolo su un disco di carta e nastro con la categoria ----
export function hint(cx, yBase, id, etichetta, cls = 'p') {
  const cy = yBase - 52;
  let s = '<g class="hint">';
  s += `<circle class="c" cx="${cx}" cy="${cy}" r="25"/><circle class="li" cx="${cx}" cy="${cy}" r="25" style="stroke-width:1.4"/>`;
  s += `<circle class="li" cx="${cx}" cy="${cy}" r="21.6" style="stroke-width:.7"/>`;
  s += icona(id, cx, cy, 34, cls);
  const tw = etichetta.length * 7 + 18, ny = cy + 28;
  const nx = Math.min(Math.max(cx, tw / 2 + 14), 346 - tw / 2);
  const nastroP = [[nx - tw / 2 - 6, ny], [nx + tw / 2 + 6, ny], [nx + tw / 2, ny + 9], [nx + tw / 2 + 6, ny + 18], [nx - tw / 2 - 6, ny + 18], [nx - tw / 2, ny + 9]];
  s += path(poli(nastroP), 'c') + `<path class="li" d="${poli(nastroP)}" style="stroke-width:1"/>`;
  s += testo(nx, ny + 13.4, etichetta, { size: 13, anchor: 'middle', cls: cls === 'p' ? 'tp' : 'ti', italic: true, weight: 600 });
  return s + '</g>';
}

// --- Ventaglio (UI_SPEC §5.2): arco di centro (160, 491), raggio 124 ----------------------------------
export const VENTAGLIO = [
  { p: 'distanza', nome: 'Distanza', c: [48, 543] },
  { p: 'attesa', nome: 'Attesa', c: [40, 459] },
  { p: 'guardia', nome: 'Guardia', c: [102, 382] },
  { p: 'assalto', nome: 'Assalto', c: [192, 371] },
];
export function ventaglio(attuale, selezionato) {
  let s = '<g class="ventaglio">';
  // guida tratteggiata
  const pts = [];
  for (let a = 212; a >= 66; a -= 2) pts.push(piu([160, 491], dir(a), 124));
  s += `<path class="ls" d="${linea(pts)}" style="stroke-width:1.2;stroke-dasharray:3 4"/>`;
  for (const m of VENTAGLIO) {
    const sel = m.p === selezionato;
    const px = sel ? 56 : 52;
    s += medaglione(`posture.${m.p}`, m.c[0], m.c[1], px, sel ? 'selezionato' : 'riposo');
    // etichetta: nome e costo (pallino pieno e 1 per cambiare, vuoto e 0 per restare)
    const costo = m.p === attuale ? 0 : 1;
    const tw = m.nome.length * 6.6 + 26, ly = m.c[1] + px / 2 + 4;
    const lx = Math.max(4 + tw / 2, m.c[0]);
    const nst = [[lx - tw / 2, ly], [lx + tw / 2, ly], [lx + tw / 2, ly + 17], [lx - tw / 2, ly + 17]];
    s += path(poli(nst), 'c');
    if (sel) s += `<path class="li" d="${poli(nst)}" style="stroke-width:1"/>`;
    s += testo(lx - tw / 2 + 5, ly + 12.6, m.nome, { size: 12, weight: sel ? 700 : 500 });
    s += icona(costo ? 'risorsa.fiato.pieno' : 'risorsa.fiato.vuoto', lx + tw / 2 - 13, ly + 8.5, 8);
    s += testo(lx + tw / 2 - 4, ly + 12.6, String(costo), { size: 12, anchor: 'end', famiglia: 'dato', weight: 600 });
  }
  return s + '</g>';
}

// Cartiglio dell'anteprima: sempre in (8, 288), sopra il ventaglio.
export function cartiglio(postura, nome, subito, inflitto, nota) {
  const x = 8, y = 288, w = 190, h = 46;
  const corpo = [[x, y], [x + w, y], [x + w - 5, y + h / 2], [x + w, y + h], [x, y + h]];
  let s = '<g class="cartiglio">';
  s += path(poli(corpo), 'c') + `<path class="li" d="${poli(corpo)}" style="stroke-width:1.5"/>`;
  s += icona(`posture.${postura}`, x + 14, y + 15, 16);
  s += testo(x + 26, y + 20, nome, { size: 15, weight: 700 });
  s += testo(x + 92, y + 20, `<tspan class="tp">↓</tspan>${subito}  <tspan class="tp">↑</tspan>${inflitto}`, { size: 14, famiglia: 'dato', weight: 600 });
  s += testo(x + 8, y + 38, nota, { size: 12, cls: 'ts' });
  return s + '</g>';
}

// Cassetto del registro: chiuso mostra la maniglia, l'ultimo evento e "Registro".
export function cassetto(id, frase, cls = 'i', y = 656) {
  const x = 8, w = 344, h = 44;
  let s = '<g class="cassetto">';
  const corpo = [[x, y + 4], [x + 4, y], [x + w - 4, y], [x + w, y + 4], [x + w, y + h], [x, y + h]];
  s += path(poli(corpo), 'c') + `<path class="li" d="${poli(corpo)}" style="stroke-width:1.4"/>`;
  s += `<rect class="i" x="${180 - 14}" y="${y + 5}" width="28" height="3"/>`;
  s += icona(id, x + 18, y + 26, 16, cls);
  s += testo(x + 32, y + 30.5, frase, { size: 14 });
  s += `<path class="lf" d="M${x + w - 78} ${y + 12}V${y + h - 8}" style="stroke-width:1"/>`;
  s += testo(x + w - 10, y + 30.5, 'Registro ▴', { size: 12, anchor: 'end', cls: 'ts', famiglia: 'dato', weight: 600 });
  return s + '</g>';
}

// Spazio alle spalle (UI_SPEC §5.4b): paletto di confine e due tacche nel terreno.
export function spazio(pieno = 2) {
  let s = '<g class="spazio">';
  s += path(poli([[84, 560], [84, 527], [86.5, 521], [89, 527], [89, 560]]), 'i');
  s += `<path class="cut" d="M85.6 531L87.6 533M85.6 538L87.6 540M85.6 545L87.6 547"/>`;
  s += path(poli([[81.5, 527], [91.5, 527], [91.5, 529.4], [81.5, 529.4]]), 'i');
  const t = [[116, 129], [98, 111]]; // dalla più vicina al viandante
  t.forEach(([a, b], i) => {
    if (i < pieno) s += `<rect class="i" x="${a}" y="553" width="${b - a}" height="7"/>`;
    else s += `<rect class="li" x="${a + 0.6}" y="553.6" width="${b - a - 1.2}" height="5.8" style="stroke-width:1.2"/>`;
  });
  return s + '</g>';
}
