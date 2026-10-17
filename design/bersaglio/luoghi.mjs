// Fotogrammi 3 e 4: la locanda col portale e la mappa delle milestone. Restituiscono il corpo dell'SVG
// (360 × 780); la cornice con i token la mette genera.mjs.
import { marionetta, VIANDANTE, poli, linea, fuso, nastro, piu, dir, f1 } from './marionetta.mjs';
import { rng, path, testo, icona, iconaD, medaglione, grana, cielo, luna, nuvola, corvi, ciuffo } from './scena.mjs';

// --- Simboli delle milestone (DESIGN §2.3), griglia 24, sfaccettati come il set (UI_SPEC §3) ------------
// Proposti qui per il fotogramma: non sono in design/symbols.proposed.ts.
const SPADA = '<path d="M12 1.5L14.2 5V15H9.8V5Z"/><path d="M6 15.5H18L17 17.5H7Z"/><path d="M11 17.5H13V20.3H11Z"/><path d="M12 20.1L13.5 21.6L12 23.1L10.5 21.6Z"/>';
// Per lo Scontro: due spade incrociate, più sottili, con le guardie agli angoli in basso.
const SPADA_SOTTILE = '<path d="M12 0.8L13.4 3.2V14.6H10.6V3.2Z"/><path d="M7.8 15H16.2L15.5 16.6H8.5Z"/><path d="M11.2 16.6H12.8V19.6H11.2Z"/><path d="M12 19.4L13.3 20.7L12 22L10.7 20.7Z"/>';
export const MILESTONE = {
  scontro: { nome: 'Scontro', d: `<g transform="rotate(45 12 12)">${SPADA_SOTTILE}</g><g transform="translate(24 0) scale(-1 1) rotate(45 12 12)">${SPADA_SOTTILE}</g>` },
  contratto: { nome: 'Contratto', d: '<path d="M4 2.8H18.5L20 4.4L18.5 6H4L2.5 4.4Z"/><path fill-rule="evenodd" d="M5 6H17V18.4H5Z M7 8.6H15V9.4H7Z M7 11H15V11.8H7Z M7 13.4H11.4V14.2H7Z"/><path d="M4 18.4H18.5L20 20L18.5 21.6H4L2.5 20Z"/><path d="M16.6 12.6L18.9 13.6L19.9 15.9L18.9 18.2L16.6 19.2L14.3 18.2L13.3 15.9L14.3 13.6Z"/>' },
  indagine: { nome: 'Indagine', d: '<path d="M6.6 8.4L8.2 4.4L12 2.6L16.2 3.6L18.2 6.8L17.6 10.4L14.4 13.2L13.8 15.6H10.2L10.6 11.8L13.8 9.2L14.2 7.4L12.8 6L10.8 6.4L9.8 9Z"/><path d="M12 16.8L14.2 19L12 21.2L9.8 19Z"/>' },
  favore: { nome: 'Favore', d: '<path d="M8.6 2.4H15.4L13.1 10.9L21.6 8.6V15.4L13.1 13.1L15.4 21.6H8.6L10.9 13.1L2.4 15.4V8.6L10.9 10.9Z"/>' },
  ristoro: { nome: 'Ristoro', d: '<path d="M2.5 11.2H21.5V13H2.5Z"/><path d="M3.6 13H20.4L18.8 17.6L15.4 20.6H8.6L5.2 17.6Z"/><path d="M7.6 9.8L6.4 7.6L8 5.4L6.8 2.8M12.2 9.8L11 7.6L12.6 5.4L11.4 2.8M16.8 9.8L15.6 7.6L17.2 5.4L16 2.8" fill="none" stroke="currentColor" stroke-width="1.7"/>' },
  mercante: { nome: 'Mercante', d: '<path d="M12 1.4L13.5 2.9L12 4.4L10.5 2.9Z"/><path d="M11.1 4.2H12.9V19H11.1Z"/><path d="M6.6 19H17.4L18.6 21.6H5.4Z"/><path d="M3.2 5.6H20.8V7.2H3.2Z"/><path d="M4.4 7.2L2.4 12.6M4.4 7.2L6.4 12.6M19.6 7.2L17.6 12.6M19.6 7.2L21.6 12.6" fill="none" stroke="currentColor" stroke-width="1.1"/><path d="M1.4 12.6H7.4L6.2 15H2.6Z M16.6 12.6H22.6L21.4 15H17.8Z"/>' },
};

// --- Fotogramma 3: la locanda col portale ---------------------------------------------------------
export function locanda() {
  const r = rng(33);
  const SUOLO = 540;
  let s = `<g style="--fondo:var(--carta-2)">`;
  s += `<rect class="k2" x="-10" y="-10" width="380" height="800"/>`;
  s += grana(r, 0, 0, 360, 780, 220);
  // parete a intonaco: tratti brevi in filo, irregolari
  let d = '';
  for (let i = 0; i < 260; i++) {
    const x = r() * 360, y = 60 + r() * 480, l = 3 + r() * 9;
    d += poli(fuso([x, y], [x + l, y + (r() - 0.5) * 2], 0.7 + r() * 0.6));
  }
  s += path(d, 'f');

  // Portale: arco di pietra a destra, la luce di un altro mondo dentro.
  const P = { cx: 262, cy: 300, ri: 64, re: 90 };
  s += aloneMondo(r, P);
  s += altroMondo(r, P, SUOLO);
  s += arcoPortale(r, P, SUOLO);

  // Travi: soffitto, montante a sinistra, trave del focolare.
  s += travi(r);
  s += lanterna(r, 168, 56, 96);
  s += lanterna(r, 262, 56, 44, 0.8);

  // Pavimento ad assi, poi il focolare (il suo bagliore cade sulle assi).
  s += pavimento(r, SUOLO);
  s += focolare(r, SUOLO);

  // Il viandante, di profilo davanti al portale: spada nel fodero, peso a riposo.
  const riposo = { anca: [0, 51], busto: 3, testa: [88, 14.5], tilt: -6, piedeAnt: [11, 0], piedePost: [-11, 0], braccioAnt: [-74, -62], braccioPost: [-96, -84], arma: -60, senzaArma: true, fodero: true, mantello: 2 };
  s += marionetta(VIANDANTE, riposo, { x: 202, y: SUOLO, k: 1.22 }).svg;

  // Ospite seduto accanto al fuoco, silhouette in seppia (quinta media).
  s += ospite(r, 136, SUOLO);

  // Interfaccia: titolo, slot delle tecniche, comando del portale.
  s += targa(10, 70, 'La locanda', 'Prima di partire');
  s += slotTecniche(574);
  s += bottonePortale(650);
  s += '</g>';
  return s;
}

function aloneMondo(r, P) {
  // luce del portale sulla parete: raggi incisi in carta, corti, fuori dai conci
  let d = '';
  for (let i = 0; i < 46; i++) {
    const a = -10 + (200 * i) / 45 + (r() - 0.5) * 3;
    const R0 = P.re + 4 + r() * 4, R1 = R0 + 10 + r() * 26;
    d += poli(fuso(piu([P.cx, P.cy], dir(a), R0), piu([P.cx, P.cy], dir(a), R1), 1.6 + r() * 1.2));
  }
  return path(d, 'c');
}
function altroMondo(r, P, suolo) {
  const apertura = [[P.cx - P.ri, suolo]];
  for (let a = 180; a >= 0; a -= 10) apertura.push(piu([P.cx, P.cy], dir(a), P.ri));
  apertura.push([P.cx + P.ri, suolo]);
  const clip = `<clipPath id="mondo"><path d="${poli(apertura)}"/></clipPath>`;
  let m = `<rect class="c" x="${P.cx - P.ri}" y="${P.cy - P.ri}" width="${P.ri * 2}" height="${suolo - P.cy + P.ri}"/>`;
  // cielo dell'altro mondo: righe lontane, luna e una palude al chiaro
  m += cielo(r, P.cy - P.ri, P.cy + 70, { passo: 5.5, cls: 'f' });
  m += luna(r, P.cx + 22, P.cy - 22, 15);
  const orizzonte = P.cy + 92;
  m += path(poli([[P.cx - P.ri, orizzonte], [P.cx - 40, orizzonte - 14], [P.cx - 18, orizzonte - 6], [P.cx + 10, orizzonte - 20], [P.cx + 40, orizzonte - 8], [P.cx + P.ri, orizzonte - 12], [P.cx + P.ri, orizzonte + 2], [P.cx - P.ri, orizzonte + 2]]), 's');
  // acqua: righe orizzontali affusolate in seppia, più fitte in basso
  let w = '';
  for (let y = orizzonte + 6, k = 0; y < suolo; y += 5 + k * 0.4, k++) {
    let x = P.cx - P.ri + r() * 10;
    while (x < P.cx + P.ri) { const l = 6 + r() * 26; w += poli(fuso([x, y], [x + l, y], 0.7 + k * 0.08)); x += l + 5 + r() * 16; }
  }
  m += path(w, 'is');
  // canne e un albero morto in primo piano dell'altro mondo
  let c = '';
  for (const [x, h] of [[P.cx - 50, 40], [P.cx - 44, 30], [P.cx - 38, 46], [P.cx + 36, 34], [P.cx + 44, 52], [P.cx + 50, 28]]) {
    c += poli(nastro([[x, suolo - 6], [x + 1, suolo - 6 - h * 0.6], [x + 2.4, suolo - 6 - h]], 1.4));
    c += poli([[x + 1.2, suolo - 6 - h * 0.92], [x + 3.6, suolo - 6 - h * 0.88], [x + 3.4, suolo - 6 - h * 0.62], [x + 1, suolo - 6 - h * 0.66]]);
  }
  c += poli(nastro([[P.cx - 6, orizzonte + 4], [P.cx - 4, orizzonte - 26], [P.cx - 10, orizzonte - 44]], (t) => 3.6 - t * 2.6));
  c += poli(nastro([[P.cx - 4.6, orizzonte - 20], [P.cx + 6, orizzonte - 34], [P.cx + 9, orizzonte - 42]], (t) => 2 - t * 1.4));
  m += path(c, 's');
  return `<defs>${clip}</defs><g clip-path="url(#mondo)">${m}</g>`;
}
function arcoPortale(r, P, suolo) {
  let s = '';
  // stipiti: blocchi di pietra impilati
  const blocchi = (x0, x1) => {
    let b = '', y = suolo;
    let k = 0;
    while (y > P.cy) {
      const h = 22 + (k % 2) * 6;
      const sporge = k % 2 ? 4 : 0;
      b += poli([[x0 - (x0 < P.cx ? sporge : 0), y], [x0 - (x0 < P.cx ? sporge : 0), Math.max(P.cy, y - h)], [x1 + (x0 > P.cx ? sporge : 0), Math.max(P.cy, y - h)], [x1 + (x0 > P.cx ? sporge : 0), y]]);
      y -= h + 2; k++;
    }
    return b;
  };
  s += path(blocchi(P.cx - P.re, P.cx - P.ri) + blocchi(P.cx + P.ri, P.cx + P.re), 'sep');
  // conci dell'arco, la chiave più grande
  let c = '';
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a0 = 180 - (180 * i) / n + 0.9, a1 = 180 - (180 * (i + 1)) / n - 0.9;
    const chiave = i === Math.floor(n / 2);
    const re = P.re + (chiave ? 10 : 0);
    c += poli([piu([P.cx, P.cy], dir(a0), P.ri), piu([P.cx, P.cy], dir(a0), re), piu([P.cx, P.cy], dir(a1), re), piu([P.cx, P.cy], dir(a1), P.ri)]);
  }
  s += path(c, 'sep');
  // tagli: venature della pietra
  let t = '';
  for (let i = 0; i < n; i++) {
    const am = 180 - (180 * (i + 0.5)) / n;
    t += linea([piu([P.cx, P.cy], dir(am - 3), P.ri + 5), piu([P.cx, P.cy], dir(am + 2), P.ri + 15)]);
  }
  for (let y = suolo - 12; y > P.cy + 6; y -= 24) t += `M${P.cx - P.re + 5} ${y}l9 -3M${P.cx + P.ri + 6} ${y - 6}l10 2`;
  s += `<path class="cut" d="${t}"/>`;
  // filo di luce sull'orlo interno: carta
  const orlo = [[P.cx - P.ri + 1.5, suolo]];
  for (let a = 180; a >= 0; a -= 10) orlo.push(piu([P.cx, P.cy], dir(a), P.ri - 1.5));
  orlo.push([P.cx + P.ri - 1.5, suolo]);
  s += `<path class="li" d="${linea(orlo)}" style="stroke-width:1.2"/>`;
  // soglia
  s += path(poli([[P.cx - P.re - 6, suolo], [P.cx - P.re - 2, suolo - 6], [P.cx + P.re + 2, suolo - 6], [P.cx + P.re + 6, suolo]]), 'i');
  return s;
}
function travi(r) {
  let s = '';
  s += path(poli([[-10, -10], [370, -10], [370, 50], [-10, 56]]), 'i');
  s += path(poli([[-10, 56], [370, 50], [370, 58], [-10, 64]]), 'i');
  let t = '';
  for (let i = 0; i < 14; i++) { const y = 6 + r() * 40, x = r() * 340; t += poli(fuso([x, y], [x + 20 + r() * 50, y + (r() - 0.5) * 2], 1 + r() * 0.8)); }
  s += path(t, 'k');
  for (const x of [20, 120, 230, 330]) s += `<circle class="perno" cx="${x}" cy="53" r="1.6"/>`;
  return s;
}
function focolare(r, suolo) {
  let s = '';
  // camino di pietra: blocchi in filo con i giunti incisi
  let b = '';
  for (let y = suolo, k = 0; y > 70; k++) {
    const h = 18 + (k % 3) * 3;
    for (let x = -10 + (k % 2) * 14; x < 122; x += 30) b += poli([[x, y - 1], [x, y - h + 1], [x + 28, y - h + 1], [x + 28, y - 1]]);
    y -= h;
  }
  s += `<g clip-path="url(#camino)">${path(b, 'f')}</g>`;
  s += `<defs><clipPath id="camino"><path d="M-10 64H112L120 330H-10Z M-10 330H128V${suolo}H-10Z"/></clipPath></defs>`;
  // bocca del focolare: buio, il fuoco è l'unico rosso
  s += path(poli([[8, suolo], [8, 400], [20, 384], [92, 384], [104, 400], [104, suolo]]), 'i');
  // mensola
  s += path(poli([[-10, 336], [128, 336], [124, 348], [-10, 348]]), 'sep');
  s += `<path class="cut" d="M4 341H118"/>`;
  // trofeo appeso: la lama di falce del Mietitore (DESIGN §2.7)
  const falce = nastro(Array.from({ length: 8 }, (_, i) => piu([56, 300], dir(170 - i * 22), 24)), (t) => 7 * (1 - t) + 1);
  s += path(poli(falce), 'sep') + path(poli([[30, 296], [84, 278], [85, 281], [31, 299]]), 'sep');
  // ceppi e fuoco
  s += path(poli([[18, suolo - 6], [86, suolo - 14], [90, suolo - 6], [22, suolo + 2]]) + poli([[24, suolo - 16], [92, suolo - 4], [88, suolo + 2], [20, suolo - 10]]), 'sep');
  let fuoco = '', luce = '';
  const lingue = [[34, 52], [46, 74], [56, 92], [66, 70], [78, 54], [52, 40]];
  for (const [x, h] of lingue) {
    const base = suolo - 14;
    fuoco += poli([[x - 9, base], [x - 7, base - h * 0.4], [x - 2, base - h * 0.62], [x - 3.6, base - h * 0.82], [x + 1, base - h], [x + 4, base - h * 0.7], [x + 7.6, base - h * 0.5], [x + 9, base]]);
    luce += poli([[x - 3, base], [x - 2, base - h * 0.4], [x + 1, base - h * 0.62], [x + 3, base - h * 0.34], [x + 3.4, base]]);
  }
  s += path(fuoco, 'p') + path(luce, 'c');
  // scintille che salgono
  let sc = '';
  for (let i = 0; i < 12; i++) { const x = 30 + r() * 56, y = 400 + r() * 50, k = 0.8 + r(); sc += poli([[x, y - k * 1.6], [x + k, y], [x, y + k * 1.6], [x - k, y]]); }
  s += path(sc, 'p');
  // bagliore del fuoco sul pavimento: tagli di carta a ventaglio
  let bg = '';
  for (let i = 0; i < 12; i++) { const x0 = 20 + i * 7; bg += poli(fuso([x0 + 6, suolo + 6], [x0 + 6 + (i - 6) * 9, suolo + 30 + r() * 30], 1.4)); }
  s += path(bg, 'c');
  return s;
}
function lanterna(r, x, y0, catena, k = 1) {
  let s = `<path class="li" d="M${x} ${y0}V${y0 + catena}" style="stroke-width:1.2;stroke-dasharray:2.4 1.2"/>`;
  const y = y0 + catena;
  const corpo = [[x - 7 * k, y + 6 * k], [x + 7 * k, y + 6 * k], [x + 9 * k, y + 24 * k], [x - 9 * k, y + 24 * k]];
  s += path(poli([[x - 4 * k, y], [x + 4 * k, y], [x + 10 * k, y + 6 * k], [x - 10 * k, y + 6 * k]]), 'i');
  s += path(poli(corpo), 'c') + `<path class="li" d="${poli(corpo)}M${x} ${y + 6 * k}V${y + 24 * k}" style="stroke-width:${1.6 * k}"/>`;
  s += path(poli([[x - 2.4 * k, y + 20 * k], [x, y + 11 * k], [x + 2.4 * k, y + 20 * k]]), 'p');
  s += path(poli([[x - 11 * k, y + 24 * k], [x + 11 * k, y + 24 * k], [x + 8 * k, y + 28 * k], [x - 8 * k, y + 28 * k]]), 'i');
  // raggi di luce
  let d = '';
  for (let i = 0; i < 10; i++) { const a = -90 + (i - 4.5) * 22, c = [x, y + 16 * k]; d += poli(fuso(piu(c, dir(a), 15 * k), piu(c, dir(a), (24 + r() * 10) * k), 1.2)); }
  return path(d, 'f') + s;
}
function pavimento(r, suolo) {
  // striscia chiara presso la parete (la luce del portale), poi assi in ombra incise in carta
  let s = path(poli([[-10, suolo], [370, suolo], [370, 790], [-10, 790]]), 'i');
  s += path(poli([[-10, suolo], [370, suolo], [370, suolo + 10], [-10, suolo + 12]]), 'k2');
  let d = '';
  let y = suolo + 24, passo = 14;
  while (y < 790) {
    d += poli(nastro([[-10, y], [370, y + (r() - 0.5) * 2]], 1 + (y - suolo) / 260));
    let x = r() * 60;
    while (x < 360) { d += poli(fuso([x, y - passo + 3], [x + 0.6, y - 2], 1.4)); x += 70 + r() * 80; }
    y += passo; passo *= 1.1;
  }
  for (let i = 0; i < 46; i++) { const x = r() * 360, yy = suolo + 18 + r() * 230, l = 8 + r() * 34; d += poli(fuso([x, yy], [x + l, yy], 0.6 + r() * 0.6)); }
  s += path(d, 'k2');
  s += `<path class="li" d="M-10 ${suolo}H370" style="stroke-width:2.4"/>`;
  return s;
}
// Ospite seduto vicino al fuoco: cappello a tesa, boccale. Sagoma piena in seppia (quinta media).
function ospite(r, x, suolo) {
  const pts = [
    [x - 16, suolo], [x - 16, suolo - 22], [x - 12, suolo - 28], [x - 13, suolo - 52], [x - 9, suolo - 64], [x - 14, suolo - 66], [x - 15, suolo - 70],
    [x - 6, suolo - 72], [x - 4, suolo - 82], [x + 4, suolo - 82], [x + 6, suolo - 73], [x + 15, suolo - 71], [x + 6, suolo - 67], [x + 6, suolo - 60],
    [x + 10, suolo - 52], [x + 18, suolo - 48], [x + 19, suolo - 54], [x + 25, suolo - 54], [x + 24, suolo - 42], [x + 12, suolo - 42], [x + 4, suolo - 40],
    [x + 4, suolo - 30], [x + 22, suolo - 28], [x + 24, suolo - 4], [x + 28, suolo], [x + 16, suolo], [x + 16, suolo - 22], [x + 2, suolo - 22],
  ];
  const panca = poli([[x - 24, suolo - 26], [x + 8, suolo - 26], [x + 8, suolo - 22], [x + 4, suolo - 22], [x + 4, suolo], [x, suolo], [x, suolo - 22], [x - 18, suolo - 22], [x - 18, suolo], [x - 22, suolo], [x - 22, suolo - 22], [x - 24, suolo - 22]]);
  return path(panca, 's') + path(poli(pts), 's') + `<path class="cut" d="M${x - 9} ${suolo - 64}L${x + 6} ${suolo - 66}"/>`;
}
function targa(x, y, titolo, sotto) {
  const w = 150, h = 46;
  const corpo = [[x, y], [x + w, y], [x + w - 6, y + h / 2], [x + w, y + h], [x, y + h]];
  return path(poli(corpo), 'c') + `<path class="li" d="${poli(corpo)}" style="stroke-width:1.5"/>` +
    testo(x + 10, y + 22, titolo, { size: 20, weight: 700 }) + testo(x + 10, y + 38, sotto, { size: 12, cls: 'ts', famiglia: 'dato', weight: 600 });
}
// Slot delle tecniche: uno per postura (DESIGN §4.2, proposta), sopra il pavimento.
function slotTecniche(y) {
  let s = testo(12, y - 6, 'TECNICHE NEGLI SLOT', { size: 12, cls: 'tc', famiglia: 'dato', weight: 700, ls: '0.08em' });
  const slot = [['assalto', 'Colpo maestro'], ['guardia', null], ['attesa', null], ['distanza', null]];
  const w = 80, gap = 8, x0 = 12;
  slot.forEach(([p, nome], i) => {
    const x = x0 + i * (w + gap), h = 66;
    const corpo = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    if (nome) {
      s += path(poli(corpo), 'c') + `<path class="li" d="${poli(corpo)}" style="stroke-width:1.6"/>`;
      s += medaglione(`posture.${p}`, x + w / 2, y + 20, 30, 'confermato');
      s += testo(x + w / 2, y + 49, 'Colpo', { size: 12, anchor: 'middle', weight: 700 });
      s += testo(x + w / 2, y + 61, 'maestro', { size: 12, anchor: 'middle', weight: 700 });
    } else {
      s += path(poli(corpo), 'k2') + `<path class="li" d="${poli(corpo)}" style="stroke-width:1.2;stroke-dasharray:4 3"/>`;
      s += medaglione(`posture.${p}`, x + w / 2, y + 20, 30, 'riposo', { spento: true });
      s += testo(x + w / 2, y + 55, 'Libero', { size: 12, anchor: 'middle', cls: 'ts' });
    }
  });
  return s;
}
function bottonePortale(y) {
  const x = 12, w = 336, h = 48;
  const corpo = [[x + 6, y], [x + w - 6, y], [x + w, y + 6], [x + w, y + h - 6], [x + w - 6, y + h], [x + 6, y + h], [x, y + h - 6], [x, y + 6]];
  let s = path(poli(corpo), 'c') + `<path class="li" d="${poli(corpo)}" style="stroke-width:2.4"/>`;
  // icona: arco del portale
  const ax = x + 30, ay = y + 34;
  const arco = [[ax - 10, ay]];
  for (let a = 180; a >= 0; a -= 20) arco.push(piu([ax, ay - 12], dir(a), 10));
  arco.push([ax + 10, ay]);
  const dentro = [[ax - 6, ay]];
  for (let a = 180; a >= 0; a -= 20) dentro.push(piu([ax, ay - 12], dir(a), 6));
  dentro.push([ax + 6, ay]);
  s += `<path class="i" fill-rule="evenodd" d="${poli(arco)}${poli(dentro)}"/>`;
  s += testo(x + w / 2 + 14, y + 30.5, 'Attraversa il portale', { size: 17, anchor: 'middle', weight: 700 });
  s += testo(x + w - 14, y + 30.5, '›', { size: 20, anchor: 'end', weight: 700 });
  return s;
}

// --- Fotogramma 4: la mappa delle milestone ---------------------------------------------------
const NODI = [
  { id: 'a', p: [180, 628], m: 'scontro', stato: 'qui' },
  { id: 'b1', p: [96, 528], m: 'contratto', stato: 'prossimo' },
  { id: 'b2', p: [266, 534], m: 'indagine', stato: 'prossimo' },
  { id: 'c1', p: [62, 418], m: 'ristoro' },
  { id: 'c2', p: [178, 428], m: 'mercante' },
  { id: 'c3', p: [296, 414], m: 'scontro' },
  { id: 'd1', p: [116, 312], m: 'favore' },
  { id: 'd2', p: [252, 306], m: 'indagine' },
];
const ARCHI = [['a', 'b1'], ['a', 'b2'], ['b1', 'c1'], ['b1', 'c2'], ['b2', 'c2'], ['b2', 'c3'], ['c1', 'd1'], ['c2', 'd1'], ['c2', 'd2'], ['c3', 'd2'], ['d1', 'boss'], ['d2', 'boss']];
const BOSS = [184, 168];

export function mappa() {
  const r = rng(44);
  let s = `<g style="--fondo:var(--carta)">`;
  s += `<rect class="c" x="-10" y="-10" width="380" height="800"/>`;
  s += grana(r, 0, 0, 360, 780, 300);
  s += acqua(r);
  s += fiume(r);
  s += colline(r);
  s += canneti(r);
  s += alberiMorti(r);
  // nubi tratteggiate ai margini, in cima
  s += nuvola(r, 52, 116, 110, 16) + nuvola(r, 316, 96, 96, 14);
  s += corvi(r, [[276, 140, 0.9], [292, 132, 0.7]]);
  s += sentieri(r);
  s += rocca(r, BOSS);
  for (const n of NODI) s += nodo(n);
  // il viandante sulla prima tappa: la stessa marionetta, in piccolo e senza tagli
  const cammino = { anca: [0, 49], busto: 6, testa: [86, 14.5], tilt: -4, piedeAnt: [16, 0], piedePost: [-14, 3], braccioAnt: [-60, -40], braccioPost: [-110, -95], arma: -40, senzaArma: true, fodero: true, mantello: 10 };
  const [qx, qy] = NODI[0].p;
  s += path(poli([[qx - 30, qy - 26.5], [qx + 30, qy - 26.5], [qx + 26, qy - 24.5], [qx - 26, qy - 24.5]]), 'i');
  s += marionetta(VIANDANTE, cammino, { x: qx - 4, y: qy - 26, k: 0.44, piccolo: true }).svg;
  // cornice incisa della carta
  s += `<path class="li" d="M6 6H354V774H6Z" style="stroke-width:2.4"/><path class="li" d="M11 11H349V769H11Z" style="stroke-width:.8"/>`;
  // interfaccia
  s += titoloMappa();
  s += presagio(4, 2);
  s += rosaDeiVenti(318, 712);
  s += testo(180, 690, 'Scegli la prossima tappa', { size: 14, anchor: 'middle', italic: true, cls: 'ts' });
  s += '</g>';
  return s;
}
const nodoDi = (id) => (id === 'boss' ? { p: [BOSS[0], BOSS[1] + 36] } : NODI.find((n) => n.id === id));

function sentieri(r) {
  let pieno = '', futuro = '';
  for (const [a, b] of ARCHI) {
    const A = nodoDi(a).p, B = nodoDi(b).p;
    // curva sfaccettata: punto di controllo spostato di lato
    const m = [(A[0] + B[0]) / 2 + (r() - 0.5) * 30, (A[1] + B[1]) / 2];
    const pts = Array.from({ length: 14 }, (_, i) => {
      const t = i / 13, u = 1 - t;
      return [u * u * A[0] + 2 * u * t * m[0] + t * t * B[0], u * u * A[1] + 2 * u * t * m[1] + t * t * B[1]];
    });
    const attivo = a === 'a';
    // trattini incisi lungo il percorso
    let d = '';
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i], q = pts[i + 1];
      const mid = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
      d += poli(fuso([p[0] + (mid[0] - p[0]) * 0.3, p[1] + (mid[1] - p[1]) * 0.3], [q[0] - (q[0] - mid[0]) * 0.3, q[1] - (q[1] - mid[1]) * 0.3], attivo ? 3 : 2));
    }
    if (attivo) pieno += d; else futuro += d;
  }
  return path(futuro, 'is') + path(pieno, 'i');
}
function nodo(n) {
  const M = MILESTONE[n.m];
  const [x, y] = n.p;
  let s = '';
  const px = n.stato === 'prossimo' ? 50 : 44;
  const stato = n.stato === 'prossimo' ? 'selezionato' : n.stato === 'qui' ? 'confermato' : 'riposo';
  s += medaglione(null, x, y, px, stato, { corpo: M.d, clsSegno: n.stato ? 'i' : 'i' });
  const tw = M.nome.length * 6.8 + 12, ly = y + px / 2 + 3;
  s += path(poli([[x - tw / 2, ly], [x + tw / 2, ly], [x + tw / 2, ly + 16], [x - tw / 2, ly + 16]]), 'c');
  s += testo(x, ly + 12, M.nome, { size: 12, anchor: 'middle', weight: n.stato === 'prossimo' ? 700 : 500, cls: n.stato || true ? 'ti' : 'ts' });
  return s;
}
function rocca(r, [x, y]) {
  let s = '';
  // colle scuro
  s += path(poli([[x - 70, y + 44], [x - 44, y + 22], [x - 20, y + 16], [x + 22, y + 14], [x + 48, y + 24], [x + 74, y + 44]]), 'i');
  let t = '';
  for (let i = 0; i < 9; i++) t += poli(fuso([x - 50 + i * 12, y + 40], [x - 44 + i * 12, y + 22 + Math.abs(i - 4) * 2], 1.2));
  s += path(t, 'k');
  // torre principale e torri minori, merlate
  const torre = (cx, w, h, base) => {
    const top = base - h, m = [];
    m.push([cx - w / 2, base], [cx - w / 2, top]);
    const n = 4, mw = w / (n * 2 - 1);
    for (let i = 0; i < n * 2 - 1; i++) {
      const xx = cx - w / 2 + i * mw;
      if (i % 2 === 0) m.push([xx, top - 5], [xx + mw, top - 5]); else m.push([xx, top], [xx + mw, top]);
    }
    m.push([cx + w / 2, top], [cx + w / 2, base]);
    return poli(m);
  };
  s += path(torre(x - 24, 16, 42, y + 20) + torre(x + 24, 16, 36, y + 20) + torre(x, 24, 76, y + 18), 'sep');
  // guglia e stendardo rosso: il pericolo in cima
  s += path(poli([[x - 13, y - 58], [x, y - 84], [x + 13, y - 58]]), 'sep');
  s += path(poli([[x - 0.8, y - 84], [x + 0.8, y - 84], [x + 0.8, y - 106], [x - 0.8, y - 106]]), 'i');
  s += path(poli([[x + 0.8, y - 106], [x + 22, y - 101], [x + 14, y - 97], [x + 22, y - 92], [x + 0.8, y - 95]]), 'p');
  // feritoie: tagli; una finestra accesa di rosso
  s += `<path class="cut" d="M${x - 24} ${y - 8}v8M${x + 24} ${y - 4}v8M${x - 6} ${y - 30}v10M${x + 6} ${y - 30}v10M${x - 6} ${y - 4}v8M${x + 6} ${y - 4}v8"/>`;
  s += path(poli([[x - 3, y - 46], [x + 3, y - 46], [x + 3, y - 36], [x, y - 33], [x - 3, y - 36]]), 'p');
  // targa del boss: sconosciuto (0 indagini, DESIGN §2.4)
  const tw = 136, ty = y + 50;
  s += path(poli([[x - tw / 2, ty], [x + tw / 2, ty], [x + tw / 2 - 6, ty + 10], [x + tw / 2, ty + 20], [x - tw / 2, ty + 20], [x - tw / 2 + 6, ty + 10]]), 'c');
  s += `<path class="li" d="${poli([[x - tw / 2, ty], [x + tw / 2, ty], [x + tw / 2 - 6, ty + 10], [x + tw / 2, ty + 20], [x - tw / 2, ty + 20], [x - tw / 2 + 6, ty + 10]])}" style="stroke-width:1.2"/>`;
  s += testo(x, ty + 14.5, 'Boss · ignoto', { size: 13, anchor: 'middle', cls: 'tp', weight: 700, italic: true });
  return s;
}
function acqua(r) {
  // specchi d'acqua della palude: gruppi di righe orizzontali in filo
  let d = '';
  for (const [cx, cy, w, h] of [[60, 600, 90, 40], [300, 640, 100, 50], [230, 470, 80, 26], [40, 340, 70, 30], [330, 330, 60, 30], [120, 250, 80, 24]]) {
    for (let y = cy - h / 2; y < cy + h / 2; y += 4.2) {
      const k = 1 - Math.abs((y - cy) / (h / 2));
      const ww = w * Math.sqrt(Math.max(0, k)), x0 = cx - ww / 2 + (r() - 0.5) * 6;
      let x = x0;
      while (x < x0 + ww) { const l = 5 + r() * 18; d += poli(fuso([x, y], [Math.min(x + l, x0 + ww), y], 0.9)); x += l + 3 + r() * 6; }
    }
  }
  return path(d, 'f');
}
function fiume(r) {
  // un corso d'acqua che scende dalla rocca verso il basso a destra, due rive incise
  const asse = [[214, 200], [232, 252], [214, 300], [196, 352], [222, 398], [250, 454], [236, 506], [214, 566], [246, 620], [296, 676], [340, 720]];
  const sx = nastro(asse, (t) => 6 + t * 14);
  const n = asse.length;
  const riva1 = sx.slice(0, n), riva2 = sx.slice(n);
  let d = '';
  for (let i = 0; i < 40; i++) {
    const t = r(), k = Math.floor(t * (n - 1)), f = t * (n - 1) - k;
    const a = asse[k], b = asse[k + 1];
    const c = [a[0] + (b[0] - a[0]) * f + (r() - 0.5) * 6, a[1] + (b[1] - a[1]) * f];
    d += poli(fuso([c[0] - 3, c[1]], [c[0] + 3, c[1]], 0.8));
  }
  return `<path class="ls" d="${linea(riva1)}M${linea(riva2).slice(1)}" style="stroke-width:1.2"/>` + path(d, 'is');
}
function colline(r) {
  // colline tratteggiate attorno alla rocca
  let s = '';
  for (const [cx, by, w, h] of [[80, 218, 120, 34], [300, 222, 110, 30], [184, 236, 220, 22]]) {
    const top = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12; top.push([cx - w / 2 + w * t, by - Math.sin(Math.PI * t) * h * (0.85 + r() * 0.3)]); }
    s += `<path class="ls" d="${linea(top)}" style="stroke-width:1.2"/>`;
    let d = '';
    for (let i = 1; i < 12; i += 1) {
      const p = top[i];
      d += poli(fuso(p, [p[0] - 3, Math.min(by, p[1] + 10 + r() * 6)], 0.9));
    }
    s += path(d, 'is');
  }
  return s;
}
function canneti(r) {
  let s = '';
  for (const [x, y] of [[26, 470], [150, 590], [328, 470], [24, 676], [128, 376], [338, 270], [210, 356], [92, 696], [300, 560]]) s += ciuffo(r, x, y, 12, 7) + path(poli([[x + 1, y - 13], [x + 3, y - 13], [x + 3, y - 7], [x + 1, y - 7]]), 'i');
  return s;
}
function alberiMorti(r) {
  let d = '';
  for (const [x, y, h] of [[30, 540, 40], [330, 380, 34], [64, 664, 30]]) {
    d += poli(nastro([[x, y], [x + 1, y - h * 0.6], [x - 2, y - h]], (t) => 3.6 - t * 2.8));
    d += poli(nastro([[x + 0.6, y - h * 0.5], [x + 8, y - h * 0.72], [x + 11, y - h * 0.9]], (t) => 2 - t * 1.4));
    d += poli(nastro([[x, y - h * 0.7], [x - 7, y - h * 0.84], [x - 9, y - h * 0.98]], (t) => 1.6 - t * 1.1));
  }
  return path(d, 'i');
}
function titoloMappa() {
  const x = 18, y = 18, w = 164, h = 48;
  const corpo = [[x, y], [x + w, y], [x + w - 6, y + h / 2], [x + w, y + h], [x, y + h]];
  return path(poli(corpo), 'c') + `<path class="li" d="${poli(corpo)}" style="stroke-width:1.5"/>` +
    testo(x + 10, y + 22, 'La Palude', { size: 20, weight: 700 }) + testo(x + 10, y + 39, 'Primo mondo · 4 tappe', { size: 12, cls: 'ts', famiglia: 'dato', weight: 600 });
}
// Presagio (DESIGN §2.5): tacche che salgono; la soglia segna quando il boss viene incontro.
function presagio(n, pieni) {
  const x = 214, y = 22, w = 128;
  let s = path(poli([[x, y], [x + w, y], [x + w, y + 40], [x, y + 40]]), 'c') + `<path class="li" d="M${x} ${y}H${x + w}V${y + 40}H${x}Z" style="stroke-width:1.2"/>`;
  s += testo(x + 8, y + 15, 'Presagio', { size: 12, famiglia: 'dato', weight: 700 });
  for (let i = 0; i < n; i++) {
    const tx = x + 8 + i * 22;
    const corpo = poli([[tx, y + 22], [tx + 18, y + 22], [tx + 15, y + 32], [tx - 3, y + 32]]);
    s += i < pieni ? path(corpo, 'i') : `<path class="li" d="${corpo}" style="stroke-width:1.1"/>`;
  }
  // soglia: il boss viene incontro (segno rosso, ciò che fa male)
  s += `<path class="lp" d="M${x + 8 + 3 * 22 - 4} ${y + 19}V${y + 35}" style="stroke-width:2"/>`;
  s += icona('stato.fase2', x + w - 13, y + 27, 16, 'p');
  return s;
}
function rosaDeiVenti(x, y) {
  let d = '';
  for (let i = 0; i < 8; i++) {
    const a = 90 - i * 45, R = i % 2 ? 9 : 17;
    d += poli([[x, y], piu([x, y], dir(a + 10), 4), piu([x, y], dir(a), R), piu([x, y], dir(a - 10), 4)]);
  }
  return path(d, 'i') + `<circle class="li" cx="${x}" cy="${y}" r="11" style="stroke-width:.8"/>` + testo(x, y - 20, 'N', { size: 12, anchor: 'middle', weight: 700 });
}
