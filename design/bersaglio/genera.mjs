// Fotogrammi bersaglio di Limen: come apparirà il gioco finito (direzione A, Xilografia).
// Genera design/bersaglio/0N-*.svg e design/bersaglio/bersaglio.html.
//   node design/bersaglio/genera.mjs
// Le figure sono marionette (marionetta.mjs) con lo scheletro di SCENA_SPEC §2; la scena e l'interfaccia
// seguono UI_SPEC §4–§6. Nessun colore fuori dai token, nessuna sfumatura.
import { writeFileSync, readFileSync } from 'node:fs';
import { marionetta, VIANDANTE, BRUTO, TESTA_MAGLIO, poli, linea, fuso, nastro, piu, dir, meno, f1 } from './marionetta.mjs';
import {
  rng, path, testo, icona, iconaD, medaglione, grana, cielo, luna, tratteggioSotto, crestaDa, terreno, ciuffo, sasso,
  primoPiano, nuvola, corvi, hud, hint, ventaglio, cartiglio, cassetto, spazio,
} from './scena.mjs';
import { locanda, mappa } from './luoghi.mjs';

const QUI = new URL('./', import.meta.url);
const W = 360, H = 780;

// --- Token (UI_SPEC §4) ---------------------------------------------------------------------------
export const TOKEN_CHIARO = { carta: '#e9e2d3', 'carta-2': '#ddd4c1', inchiostro: '#1c1915', seppia: '#685c4d', filo: '#c2b69e', pericolo: '#a1311f' };
export const TOKEN_SCURO = { carta: '#141210', 'carta-2': '#1f1b17', inchiostro: '#e4d9c4', seppia: '#a39682', filo: '#3b342b', pericolo: '#e2654b' };
const decl = (t) => Object.entries(t).map(([k, v]) => `--${k}:${v}`).join(';');
// Classi comuni a SVG e pagina: riempimenti e tratti dai token.
export const CLASSI = `
.i{fill:var(--inchiostro);color:var(--inchiostro)}.c{fill:var(--carta)}.k{fill:var(--fondo,var(--carta-2))}.k2{fill:var(--carta-2)}
.s{fill:var(--seppia);color:var(--seppia)}.f{fill:var(--filo);color:var(--filo)}.p{fill:var(--pericolo);color:var(--pericolo)}
.is{fill:var(--seppia);color:var(--seppia)}
.sep{fill:var(--inchiostro);stroke:var(--fondo,var(--carta-2));stroke-width:1.5;paint-order:stroke;stroke-linejoin:miter;stroke-miterlimit:2}
.cut{fill:none;stroke:var(--fondo,var(--carta-2));stroke-width:.9;stroke-linecap:butt}
.perno{fill:var(--fondo,var(--carta-2));stroke:var(--inchiostro);stroke-width:.5}
.li{fill:none;stroke:var(--inchiostro)}.lf{fill:none;stroke:var(--filo)}.ls{fill:none;stroke:var(--seppia)}.lp{fill:none;stroke:var(--pericolo)}
.ti{fill:var(--inchiostro)}.ts{fill:var(--seppia)}.tp{fill:var(--pericolo)}.tc{fill:var(--carta)}
.fs{font-family:"Iowan Old Style","Palatino Linotype",Palatino,"Book Antiqua",Georgia,serif}
.fd{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-variant-numeric:tabular-nums}
`;
const STILE_SVG = `<style>:root{${decl(TOKEN_CHIARO)}}@media (prefers-color-scheme:dark){:root{${decl(TOKEN_SCURO)}}}${CLASSI}</style>`;

function svg(id, titolo, corpo) {
  return `<svg xmlns="http://www.w3.org/2000/svg" id="${id}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${titolo}">` +
    `<title>${titolo}</title>${STILE_SVG}${corpo}</svg>`;
}

// --- Quinte del duello ---------------------------------------------------------------------------
// Fondale: cielo inciso e luna; quinta lontana a tratteggio (cresta e la rocca del boss); quinta media
// piena in filo (l'arco in rovina); terreno; primo piano d'inchiostro.
function fondaleDuello(r, opz = {}) {
  const { luna: L = [284, 104, 25] } = opz;
  let s = `<rect class="k2" x="-30" y="-30" width="${W + 60}" height="${H + 60}"/>`;
  s += grana(r, -20, -20, W + 40, 600, 260);
  s += cielo(r, -20, 498, { scuro: 120 });
  s += luna(r, ...L);
  for (const [x, y, w, h] of opz.nuvole ?? [[84, 192, 176, 26], [318, 156, 104, 17], [160, 78, 96, 14]]) s += nuvola(r, x, y, w, h);
  s += corvi(r, opz.corvi ?? [[196, 120, 1], [214, 112, 0.8], [182, 106, 0.7]]);
  // quinta lontana: cresta tratteggiata e rocca
  const cresta = crestaDa([[-20, 506], [30, 494], [70, 500], [104, 488], [150, 497], [196, 492], [246, 503], [300, 489], [340, 497], [380, 492]]);
  s += `<path class="k2" d="${poli([[-20, 560], ...Array.from({ length: 41 }, (_, i) => [-20 + i * 10, cresta(-20 + i * 10)]), [380, 560]])}"/>`;
  s += tratteggioSotto(r, cresta, -20, 380, 560, { passo: 3, w: 1.1 });
  s += path(linea(Array.from({ length: 41 }, (_, i) => [-20 + i * 10, cresta(-20 + i * 10)])).replace(/^M/, 'M'), 'lf');
  // rocca lontana sulla cresta (il boss attende in cima: rima con la mappa)
  s += path(poli([[108, 492], [108, 476], [111, 476], [111, 472], [114, 472], [114, 476], [117, 476], [117, 466], [119.5, 461], [122, 466], [122, 480], [127, 480], [127, 491]]), 'f');
  // quinta media: arco in rovina, pieno in filo, giunti incisi
  s += arcoRovina(r, 232, 560);
  return s;
}

function arcoRovina(r, cx, y) {
  let s = '';
  const pil = (x0) => poli([[x0, y], [x0, y - 66], [x0 + 1, y - 70], [x0 + 12, y - 70], [x0 + 13, y - 66], [x0 + 13, y]]);
  s += path(pil(cx - 34) + pil(cx + 21), 'f');
  // arco: conci da sinistra, spezzato a destra
  const conci = [];
  for (let i = 0; i < 6; i++) {
    const a0 = 180 - i * 20, a1 = a0 - 18;
    const c = [cx, y - 70], R1 = 27.5, R2 = 40;
    conci.push(poli([piu(c, dir(a0), R1), piu(c, dir(a0), R2), piu(c, dir(a1), R2), piu(c, dir(a1), R1)]));
  }
  s += path(conci.join(''), 'f');
  // giunti dei conci e dei pilastri
  let g = '';
  for (let yy = y - 58; yy < y; yy += 12) { g += `M${cx - 34} ${yy}H${cx - 21}M${cx + 21} ${yy + 6}H${cx + 34}`; }
  s += `<path class="cut" d="${g}"/>`;
  // macerie
  s += path(poli([[cx + 30, y], [cx + 33, y - 7], [cx + 42, y - 9], [cx + 47, y]]) + poli([[cx - 48, y], [cx - 45, y - 5], [cx - 38, y - 4], [cx - 36, y]]), 'f');
  return s;
}

function suolo(r) {
  let s = terreno(r, 560, { fino: 700 });
  for (const [x, h] of [[18, 9], [132, 7], [214, 8], [262, 6], [348, 10]]) s += ciuffo(r, x, 560, h, 6);
  s += sasso(r, 236, 571, 10, 5) + sasso(r, 72, 586, 14, 6) + sasso(r, 318, 598, 12, 5);
  return s;
}

// --- Pose ---------------------------------------------------------------------------------------
const POSE = {
  // Guardia (SCENA_SPEC §1.2, muro): eretta, testa alta, spada verticale davanti al corpo.
  guardia: { anca: [0, 50], busto: 0, testa: [90, 14.5], tilt: 0, piedeAnt: [17, 0], piedePost: [-16, 0], braccioAnt: [-38, 66], braccioPost: [-50, 64], arma: 84, mantello: 3 },
  // Bruto, telegrafo pesante (§1.4): carica ampia, maglio dietro la testa, busto indietro, peso dietro.
  brutoPesante: (() => {
    const mano = [-27, -121], ang = 172;
    return { anca: [-8, 45], busto: -17, testa: [96, 10], tilt: 4, piedeAnt: [21, 0], piedePost: [-23, 0], manoAnt: mano, manoPost: piu(mano, dir(ang), -10), gomitoAnt: -1, gomitoPost: -1, arma: ang, armaDietro: true, bracciaDietroTesta: true };
  })(),
};

// Contatore dei turni su una targhetta di carta (si legge anche sopra il cielo inciso).
function turno(n) {
  return path(poli([[6, 8], [70, 8], [66, 17], [70, 26], [6, 26]]), 'c') + `<path class="li" d="${poli([[6, 8], [70, 8], [66, 17], [70, 26], [6, 26]])}" style="stroke-width:1"/>` + testo(13, 22, `Turno ${n}`, { size: 13, cls: 'ts', famiglia: 'dato', weight: 600 });
}

// --- Fotogramma 1: duello, scelta --------------------------------------------------------------
function fotogramma1() {
  const r = rng(11);
  let s = `<g style="--fondo:var(--carta-2)">`;
  s += fondaleDuello(r);
  s += suolo(r);
  s += spazio(2);
  const v = marionetta(VIANDANTE, POSE.guardia, { x: 160, y: 560 });
  const b = marionetta(BRUTO, POSE.brutoPesante, { x: 258, y: 560, specchia: true });
  s += b.svg + v.svg;
  s += primoPiano(r, 708, [[0, 40, 40], [360, 52, 50], [300, 14, 30]]);
  // interfaccia
  s += turno(3);
  s += hud(130, 230, { nome: 'Viandante', stati: ['stato.vantaggio'], vig: 14, max: 20, fiato: 4, fiatoMax: 6 });
  s += hud(282, 230, { nome: 'Bruto', vig: 15, max: 22, fiato: 2, fiatoMax: 4 });
  const testaB = b.aScena(b.o.C);
  s += hint(f1(testaB[0]), 414, 'intent.pesante', 'Colpo pesante');
  s += ventaglio('guardia', 'guardia');
  s += cartiglio('guardia', 'Guardia', '1–2', '0', 'Tocca di nuovo per confermare');
  s += cassetto('evento.colpo', 'Turno 2 · Colpisci il Bruto: 4.', 'p');
  s += '</g>';
  console.log('f1 testa bruto', testaB.map(f1), 'testa maglio', b.aScena(piu(b.o.manoArma, dir(b.o.armaAng), TESTA_MAGLIO)).map(f1));
  return svg('f1', 'Duello, scelta: il viandante in Guardia, il Bruto carica il Maglio', s);
}

// --- Fotogramma 2: duello, impatto --------------------------------------------------------------
function fotogramma2() {
  const r = rng(22);
  // Viandante: parata alta (posta di corona), mano sinistra sul piatto della lama, ginocchia che assorbono.
  const manoV = [11, -91], angV = 50;
  const supporto = piu(manoV, dir(angV), 22);
  const parata = { anca: [-1, 47], busto: -4, testa: [94, 14], tilt: -5, piedeAnt: [18, 0], piedePost: [-18, 0], manoAnt: manoV, manoPost: supporto, arma: angV, mantello: 9 };
  const v = marionetta(VIANDANTE, parata, { x: 160, y: 560 });
  const Q = v.aScena(piu(manoV, dir(angV), 33)); // punto di contatto sulla lama
  // Bruto: tutto disteso nel colpo. Le mani sull'asta, la testa del maglio sul punto di contatto.
  const XB = 294;
  const centroMaglio = [Q[0] + 9, Q[1] - 13];
  const locale = (p) => [XB - p[0], p[1] - 560];
  const manoB = [55, -86];
  const tm = locale(centroMaglio);
  const angB = Math.atan2(-(tm[1] - manoB[1]), tm[0] - manoB[0]) * 180 / Math.PI;
  const distB = Math.hypot(tm[0] - manoB[0], tm[1] - manoB[1]);
  const colpo = { anca: [9, 43], busto: 25, testa: [70, 10], tilt: -6, piedeAnt: [37, 0], piedePost: [-19, 3], manoAnt: piu(manoB, dir(angB), distB - TESTA_MAGLIO), manoPost: piu(manoB, dir(angB), distB - TESTA_MAGLIO - 12), arma: angB, gomitoAnt: -1, gomitoPost: -1 };
  const b = marionetta(BRUTO, colpo, { x: XB, y: 560, specchia: true });
  console.log('f2 contatto', Q.map(f1), 'angolo maglio', f1(angB), 'distanza', f1(distB));

  let mondo = fondaleDuello(r);
  // lampo d'impatto dietro le figure: carta pulita e raggi incisi
  mondo += lampo(r, Q);
  mondo += velocita(b, Q);
  mondo += suolo(r);
  mondo += spazio(2);
  mondo += b.svg + v.svg;
  mondo += polvere(r, 160, 560) + polvere(r, b.aScena([37, 0])[0], 560, -1);
  mondo += schizzo(r, Q);
  mondo += primoPiano(r, 708, [[0, 40, 40], [360, 52, 50], [300, 14, 30]]);

  let s = `<g style="--fondo:var(--carta-2)">`;
  // piccolo movimento di camera: spinta di 3% e 1,2° attorno al colpo
  s += `<g transform="translate(${f1(Q[0])} ${f1(Q[1])}) rotate(-1.2) scale(1.03) translate(${f1(-Q[0])} ${f1(-Q[1])})">${mondo}</g>`;
  // danno nel punto del colpo, sulla figura colpita
  s += danno(Q[0] - 92, Q[1] + 2);
  s += turno(3);
  s += testo(348, 22, 'Tocca per saltare ›', { size: 12, cls: 'ts', anchor: 'end', famiglia: 'dato', weight: 600 });
  s += hud(130, 230, { nome: 'Viandante', stati: ['stato.vantaggio'], vig: 12, perso: 2, max: 20, fiato: 3, fiatoMax: 6 });
  s += hud(282, 230, { nome: 'Bruto', vig: 15, max: 22, fiato: 1, fiatoMax: 4 });
  s += ventaglioChiuso(40, 520);
  s += cassetto('evento.parata', 'Pari il Maglio: 5 → 2.');
  s += '</g>';
  return svg('f2', "Duello, impatto: il viandante para il Maglio, fermo d'impatto", s);
}

// Lampo: stella di carta irregolare e raggi in filo, dietro le figure.
function lampo(r, Q) {
  const pts = [];
  const n = 18;
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * 360 + r() * 6;
    const R = i % 2 ? 16 + r() * 8 : 30 + r() * 26;
    pts.push(piu(Q, dir(a), R));
  }
  let raggi = '';
  for (let i = 0; i < 26; i++) {
    const a = r() * 360, R0 = 40 + r() * 20, R1 = R0 + 30 + r() * 60;
    raggi += poli(fuso(piu(Q, dir(a), R0), piu(Q, dir(a), R1), 1.4 + r() * 1.6));
  }
  return path(raggi, 'f') + path(poli(pts), 'c');
}
// Linee di velocità: archi incisi lungo il percorso della testa del maglio.
function velocita(b, Q) {
  const spalla = b.aScena(b.o.spalla);
  const R0 = Math.hypot(Q[0] - spalla[0], Q[1] - spalla[1]);
  const a0 = Math.atan2(-(Q[1] - spalla[1]), Q[0] - spalla[0]) * 180 / Math.PI; // angolo al contatto
  let d = '';
  [[R0 + 8, 1.0, 46], [R0 - 2, 1.4, 58], [R0 - 12, 1.1, 40], [R0 - 21, 0.8, 26]].forEach(([R, w, ampiezza]) => {
    const pts = Array.from({ length: 12 }, (_, i) => piu(spalla, dir(a0 - 14 - (ampiezza * i) / 11), R));
    d += poli(nastro(pts.reverse(), (t) => w * 2.2 * Math.sin(Math.PI * Math.min(1, t * 1.1))));
  });
  return path(d, 'i');
}
// Schizzo d'inchiostro e scintille rosse nel punto di contatto (davanti alle figure).
function schizzo(r, Q) {
  let ink = '', rosso = '';
  const n = 15;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 360 + (r() - 0.5) * 10;
    const R = 5 + r() * 3, Rp = 9 + r() * 11;
    pts.push(piu(Q, dir(a - 7), R), piu(Q, dir(a), Rp));
  }
  ink += poli(pts);
  // gocce lanciate lungo il colpo (verso il viandante, in basso a sinistra) e all'insù
  for (let i = 0; i < 16; i++) {
    const a = 70 + r() * 100, R = 22 + r() * 24, c = piu(Q, dir(a), R), rr = 0.9 + r() * 2.2;
    ink += poli(Array.from({ length: 6 }, (_, k) => piu(c, dir(k * 60 + r() * 20), rr * (0.7 + r() * 0.5))));
  }
  // scintille: schegge rosse sottili, radiali
  for (let i = 0; i < 11; i++) {
    const a = -60 + r() * 230, R0 = 12 + r() * 6, R1 = R0 + 10 + r() * 20;
    rosso += poli(fuso(piu(Q, dir(a), R0), piu(Q, dir(a), R1), 1.6 + r() * 1.4));
  }
  for (let i = 0; i < 7; i++) {
    const a = -50 + r() * 210, R = 30 + r() * 18, c = piu(Q, dir(a), R);
    rosso += poli([piu(c, [0, -1.6]), piu(c, [1.6, 0]), piu(c, [0, 1.6]), piu(c, [-1.6, 0])]);
  }
  // cuore dello schizzo: un anello di carta separa il colpo dalle lame
  return path(ink, 'sep') + path(rosso, 'p') + `<circle class="c" cx="${f1(Q[0])}" cy="${f1(Q[1])}" r="3.6"/>`;
}
function polvere(r, x, y, verso = 1) {
  let d = '';
  for (let i = 0; i < 7; i++) {
    const a = verso > 0 ? 160 + r() * 30 : 0 + r() * 30 - 10, c = piu([x + (r() - 0.5) * 16, y - 2], dir(a), 8 + r() * 14);
    d += poli(fuso(piu(c, dir(a), -3), piu(c, dir(a), 4 + r() * 5), 1.2 + r()));
  }
  for (let i = 0; i < 6; i++) {
    const c = [x + (r() - 0.5) * 30, y - 3 - r() * 9], rr = 0.8 + r() * 1.2;
    d += poli(Array.from({ length: 5 }, (_, k) => piu(c, dir(k * 72), rr)));
  }
  return path(d, 'i');
}
function danno(x, y) {
  let s = '<g class="danno">';
  s += icona('evento.parata', x, y - 6, 16, 'p');
  s += testo(x + 11, y - 1, 'Parata', { size: 13, cls: 'tp', italic: true, weight: 600 });
  s += `<text class="fs" x="${f1(x + 4)}" y="${f1(y + 27)}" style="font-size:30px;font-weight:700;fill:var(--pericolo);stroke:var(--carta-2);stroke-width:3;paint-order:stroke">2</text>`;
  return s + '</g>';
}
// Ventaglio chiuso: i medaglioni impilati, in cima la postura confermata.
function ventaglioChiuso(cx, cy) {
  let s = '<g class="ventaglio-chiuso">';
  for (const [dx, dy] of [[-9, 6], [-6, 4], [-3, 2]]) s += `<circle class="c" cx="${cx + dx}" cy="${cy + dy}" r="19"/><circle class="li" cx="${cx + dx}" cy="${cy + dy}" r="19" style="stroke-width:1.2"/>`;
  s += medaglione('posture.guardia', cx, cy, 40, 'confermato');
  return s + '</g>';
}

// --- Uscita -------------------------------------------------------------------------------------
export const FOTOGRAMMI = [
  { file: '01-duello-scelta.svg', fn: fotogramma1 },
  { file: '02-duello-impatto.svg', fn: fotogramma2 },
  { file: '03-locanda.svg', fn: () => svg('f3', "La locanda col portale: il viandante davanti all'arco verso un altro mondo", locanda()) },
  { file: '04-mappa.svg', fn: () => svg('f4', 'Mappa delle milestone: il sentiero si biforca fino alla rocca del boss', mappa()) },
];

for (const f of FOTOGRAMMI) {
  writeFileSync(new URL(f.file, QUI), f.fn());
  console.log('scritto', f.file);
}

// --- Pagina di revisione: i quattro fotogrammi uno sotto l'altro ------------------------------------
const DIDASCALIE = [
  ['Duello, scelta', "Il Bruto telegrafa un colpo pesante: busto all'indietro, peso sul piede posteriore, maglio dietro la testa. L'hint sopra di lui dice la stessa cosa con il simbolo. Il ventaglio è aperto dietro il viandante in Guardia: il medaglione è selezionato e il cartiglio mostra l'anteprima, ↓ 1–2 subito e ↑ 0 inflitto. Dietro di lui, il paletto e le due tacche dello spazio alle spalle."],
  ['Duello, impatto', "Il fermo d'impatto. Il viandante para alto, con la mano sinistra sul piatto della lama, e il Bruto è tutto disteso nel colpo. Nel punto di contatto c'è uno schizzo d'inchiostro con scintille rosse, e la camera spinge del 3% ruotando di un grado. Il danno residuo compare sulla figura colpita. Il ventaglio è chiuso: in cima resta la Guardia confermata."],
  ['La locanda col portale', "Il calore viene dal fuoco, l'unico rosso della scena; la luce fredda arriva dall'altro mondo dentro l'arco. Il viandante è la stessa marionetta del duello, con la spada nel fodero. In basso ci sono gli slot delle tecniche, uno per postura, e il comando per partire."],
  ['Mappa delle milestone', "Una carta incisa, come in un vecchio libro. Il sentiero sale e si biforca, e ogni tappa porta il simbolo della sua milestone. Le due tappe raggiungibili hanno il doppio anello. In cima c'è la rocca del boss, ancora ignoto; in alto a destra il presagio, con la soglia oltre la quale il boss ti viene incontro."],
];

function pagina() {
  const fig = FOTOGRAMMI.map((f, i) => {
    const corpo = readFileSync(new URL(f.file, QUI), 'utf8').replace(/<style>.*?<\/style>/s, '');
    const [t, d] = DIDASCALIE[i];
    return `<figure class="fotogramma" id="fotogramma-${i + 1}">
  <div class="tela">${corpo}</div>
  <figcaption><span class="num">${i + 1} di 4</span><h2>${t}</h2><p>${d}</p></figcaption>
</figure>`;
  }).join('\n');
  return `<title>Limen · Visione</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Alegreya+Sans:wght@400;500;700&display=swap">
<style>
/* Colonna stretta come il telefono: i fotogrammi a piena larghezza, 1:1 su S23, le didascalie con il margine. */
:root{${decl(TOKEN_CHIARO)};--f-titolo:"IM Fell English","Iowan Old Style",Palatino,Georgia,serif;--f-testo:"Alegreya Sans",system-ui,-apple-system,"Segoe UI",sans-serif}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){${decl(TOKEN_SCURO)};color-scheme:dark}}
:root[data-theme="dark"]{${decl(TOKEN_SCURO)};color-scheme:dark}
${CLASSI}
body{background:var(--carta);color:var(--inchiostro);font:16px/1.5 var(--f-testo);padding-inline:16px}
main{max-width:392px;margin:0 auto;padding-block:28px 40px;display:grid;gap:40px}
header{display:grid;gap:10px}
.occhiello{font:700 12px/1 var(--f-testo);letter-spacing:.12em;text-transform:uppercase;color:var(--seppia)}
h1{font:400 40px/1 var(--f-titolo);margin:0;text-wrap:balance}
h1 i{color:var(--pericolo);font-style:normal}
header p{margin:0;color:var(--seppia)}
.fotogramma{margin:0;display:grid;gap:14px}
.tela{margin-inline:-16px;background:var(--carta-2);border-block:1.5px solid var(--inchiostro)}
.tela svg{display:block;width:100%;max-width:360px;height:auto;margin:0 auto}
@media (min-width:424px){.tela{margin-inline:0;border:1.5px solid var(--inchiostro)}.tela svg{max-width:none}}
figcaption{display:grid;gap:4px}
.num{font:700 12px/1 var(--f-testo);letter-spacing:.12em;text-transform:uppercase;color:var(--seppia)}
h2{font:400 26px/1.1 var(--f-titolo);margin:0}
figcaption p,section p,li{margin:0;font-size:15px}
section{display:grid;gap:10px;border-top:1.5px solid var(--inchiostro);padding-top:18px}
section h2{font-size:22px}
ul{margin:0;padding-left:18px;display:grid;gap:6px}
li::marker{color:var(--seppia)}
code{font-size:13px;background:var(--carta-2);padding:1px 4px}
</style>
<main>
<header>
  <span class="occhiello">Fotogrammi bersaglio · direzione A, Xilografia</span>
  <h1>Limen<i> · </i>Visione</h1>
  <p>Come apparirà il gioco finito su un telefono in verticale, a 360 × 780. Quattro fotogrammi interamente in SVG, con la palette e i simboli del set. Sono il riferimento visivo per le marionette animate (fase E).</p>
</header>
${fig}
<section>
  <h2>Cosa fissano</h2>
  <ul>
    <li><b>Marionette di carta.</b> Ogni osso dello scheletro di SCENA_SPEC §2 è un pezzo con la sua trasformazione. Le giunture si coprono con le vesti o diventano rivetti.</li>
    <li><b>Tre pesi di segno.</b> Masse piene, un filo di carta tra i pezzi sovrapposti e tagli di sgorbia di circa 1 px.</li>
    <li><b>Profondità per valore.</b> Fondale tratteggiato in filo, quinta media piena in filo, figure in inchiostro, primo piano nero.</li>
    <li><b>Il rosso fa male.</b> Hint d'attacco, scintille, danni, il boss. Nella locanda è il fuoco.</li>
    <li><b>I primi 700 px.</b> Tutta l'interfaccia sta lì, quanto si vede nell'app Claude. Gli ultimi 80 px sono solo primo piano e possono essere tagliati.</li>
  </ul>
</section>
<section>
  <h2>Da approvare</h2>
  <ul>
    <li>I sei simboli delle milestone (DESIGN §2.3), disegnati qui e assenti dal set dei simboli.</li>
    <li>I cartellini dell'HUD appesi a due fili, come nel teatro di carta, e la targhetta dei turni.</li>
    <li>Nella carica pesante il braccio anteriore passa dietro l'elmo, così la testa resta leggibile. È un cambio di livello per posa, ammesso da SCENA_SPEC §2.3.</li>
  </ul>
  <p>Sorgenti in <code>design/bersaglio/</code>. Si rigenerano con <code>node design/bersaglio/genera.mjs</code>.</p>
</section>
</main>
`;
}
writeFileSync(new URL('bersaglio.html', QUI), pagina());
console.log('scritto bersaglio.html');
