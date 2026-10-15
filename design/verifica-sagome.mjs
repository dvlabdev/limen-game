// Verifica delle sagome statiche (C2a). Uso: node design/verifica-sagome.mjs
// Controlla, sulla geometria disegnata:
// 1. regola di distinzione (SCENA_SPEC §1.2): ogni coppia di posture differisce su almeno 2 assi tra A, B e C;
// 2. somiglianza delle silhouette a 120 px, nero pieno: nessuna coppia sopra la soglia;
// 3. ogni figura sta dentro il viewBox comune (anche specchiata) e ha i piedi a terra (y = 0).
// Esce con codice 1 se un controllo fallisce.

import * as SAG from './sagome-dati.mjs';

const SOGLIA_SOMIGLIANZA = 0.6;
let errori = 0;
const no = (msg) => { errori++; console.log('  ✗ ' + msg); };

console.log('Assi A–C del viandante (unità = px a 120 di riferimento)');
console.log('  postura    busto  bacino  testa  arma  mano');
for (const p of SAG.POSTURE) {
  const m = SAG.misure('viandante.' + p);
  console.log(`  ${p.padEnd(9)} ${String(m.busto).padStart(5)}° ${String(m.anca).padStart(6)} ${String(Math.round(m.testa)).padStart(6)} ${String(m.arma).padStart(4)}° ${String(Math.round(m.mano)).padStart(5)}`);
}

console.log('\nRegola di distinzione (servono almeno 2 assi su 3) e somiglianza delle silhouette');
for (const r of SAG.matriceDistinzione()) {
  const iou = SAG.somiglianza('viandante.' + r.coppia[0], 'viandante.' + r.coppia[1]);
  console.log(`  ${r.coppia.join(' · ').padEnd(20)} A ${r.A ? 'sì' : '–'}  B ${r.B ? 'sì' : '–'}  C ${r.C ? 'sì' : '–'}  → ${r.assi}/3   somiglianza ${iou.toFixed(2)}`);
  if (r.assi < 2) no(`${r.coppia.join('-')}: ${r.assi} assi`);
  if (iou >= SOGLIA_SOMIGLIANZA) no(`${r.coppia.join('-')}: silhouette troppo simili (${iou.toFixed(2)})`);
}

console.log('\nIngombro (viewBox x ' + SAG.VIEWBOX.x + '..' + (SAG.VIEWBOX.x + SAG.VIEWBOX.w) + ', y ' + (-SAG.VIEWBOX.y - SAG.VIEWBOX.h) + '..' + -SAG.VIEWBOX.y + ' in coordinate matematiche)');
const alto = -SAG.VIEWBOX.y, basso = -(SAG.VIEWBOX.y + SAG.VIEWBOX.h);
for (const id of SAG.ID_SAGOME) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const p of SAG.poligoni(id)) for (const [x, y] of p.pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  console.log(`  ${id.padEnd(20)} x ${x0.toFixed(0)}..${x1.toFixed(0)}  y ${y0.toFixed(1)}..${y1.toFixed(0)}`);
  const lim = SAG.VIEWBOX.x, lim2 = SAG.VIEWBOX.x + SAG.VIEWBOX.w;
  if (x0 < lim || x1 > lim2 || -x0 > lim2 || -x1 < lim) no(`${id}: esce dal viewBox in orizzontale`);
  if (y1 > alto || y0 < basso) no(`${id}: esce dal viewBox in verticale`);
  if (Math.abs(y0) > 0.5) no(`${id}: i piedi non toccano terra (y min ${y0.toFixed(1)})`);
}

console.log(errori ? `\n${errori} controllo/i fallito/i` : '\nTutti i controlli superati');
process.exit(errori ? 1 : 0);
