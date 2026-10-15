// Sagome statiche del viandante e dei nemici (C2a, ARENA_S23_SPEC §3).
// Dati e geometria, senza scrivere file: li usa design/genera.mjs per produrre design/sagome/*.svg,
// design/sagome.proposed.ts e le schede del catalogo.
//
// Sistema di coordinate (SCENA_SPEC §2.1): 120 unità = 120 px su S23, figura in piedi a riposo.
// Origine a terra sotto il bacino. Qui si calcola con y VERSO L'ALTO (angoli matematici: 0° = verso il
// nemico, 90° = su); l'uscita SVG ribalta y. La figura guarda a destra; il nemico si specchia con `specchia`.
//
// Stile (UI_SPEC §3 e §6): masse piene in currentColor, spigoli sfaccettati (solo segmenti rettilinei),
// nessun volto (cappuccio, elmo, maschera), pochi tagli bianchi (≈1 px) solo dove ripetono i simboli.

const R = Math.PI / 180;
const r1 = (n) => +n.toFixed(1);
const dir = (a) => [Math.cos(a * R), Math.sin(a * R)];
const piu = (p, q, k = 1) => [p[0] + q[0] * k, p[1] + q[1] * k];
const meno = (p, q) => [p[0] - q[0], p[1] - q[1]];
const lung = (p) => Math.hypot(p[0], p[1]);
const norm = (p) => { const l = lung(p) || 1; return [p[0] / l, p[1] / l]; };
const ruota = (p, c, a) => {
  const d = meno(p, c), ca = Math.cos(a * R), sa = Math.sin(a * R);
  return [c[0] + d[0] * ca - d[1] * sa, c[1] + d[0] * sa + d[1] * ca];
};

export const POLI = (pts) => 'M' + pts.map(([x, y]) => `${r1(x)} ${r1(-y)}`).join('L') + 'Z';
const quad = (A, B, wa, wb) => {
  const d = norm(meno(B, A)), n = [-d[1], d[0]];
  return [piu(A, n, wa / 2), piu(B, n, wb / 2), piu(B, n, -wb / 2), piu(A, n, -wa / 2)];
};
// Polilinea a spessore costante, come poligono sfaccettato (per aste e lame curve).
function nastro(punti, larg) {
  const su = [], giu = [];
  punti.forEach((p, i) => {
    const a = punti[Math.max(0, i - 1)], b = punti[Math.min(punti.length - 1, i + 1)];
    const d = norm(meno(b, a)), n = [-d[1], d[0]];
    const w = (typeof larg === 'function' ? larg(i / (punti.length - 1)) : larg) / 2;
    su.push(piu(p, n, w)); giu.push(piu(p, n, -w));
  });
  return [...su, ...giu.reverse()];
}
const arco = (c, rad, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => piu(c, dir(a0 + ((a1 - a0) * i) / n), rad));

// Cinematica inversa a due ossa: ginocchio verso il nemico.
function ik(H, T, l1, l2) {
  let d = lung(meno(T, H));
  const raggiunto = d <= l1 + l2 - 0.01;
  d = Math.min(d, l1 + l2 - 0.01);
  const a = Math.atan2(T[1] - H[1], T[0] - H[0]) / R;
  const A = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)))) / R;
  const K = piu(H, dir(a + A), l1);
  return { K, T: raggiunto ? T : piu(H, dir(a), d), raggiunto };
}

// Piede: l'astragalo è in (ax, 5 + sulle punte); la suola scende dal tallone alla punta.
function piede(ax, su = 0, lungh = 14) {
  const ay = 5 + su;
  return [[ax - 5, su], [ax - 3, ay + 1], [ax + 3, ay + 1], [ax + lungh - su * 0.15, 0], [ax + 8, 0]];
}

// --- Armi: disegnate in locale, lungo +x, con l'impugnatura nell'origine ---------------------------
// Ogni arma restituisce { parti: [{ pts, taglio? }] } con punti locali (y su).
const ARMI = {
  // Spada di posture.assalto: lama, guardia a barra, impugnatura, pomo a rombo.
  spada: (L = 46) => ({
    parti: [
      { pts: [[6.4, -2.3], [6.4 + L - 6, -2.3], [6.4 + L, 0], [6.4 + L - 6, 2.3], [6.4, 2.3]], taglio: [[9, -0.4], [6.4 + L - 12, -0.4], [6.4 + L - 12, 0.4], [9, 0.4]] },
      { pts: [[3.6, -8], [6.4, -8], [6.4, 8], [3.6, 8]] },
      { pts: [[-3.5, -1.3], [3.6, -1.3], [3.6, 1.3], [-3.5, 1.3]] },
      { pts: [[-3.5, 0], [-5.6, -2.1], [-7.7, 0], [-5.6, 2.1]] },
    ],
  }),
  // Spada corta della Recluta.
  spadaCorta: () => ARMI.spada(33),
  // Stocco del Duellante: lama sottile (intent.leggero), guardia a coppa.
  stocco: (L = 62) => ({
    parti: [
      { pts: [[7, -1.3], [7 + L, -0.5], [7 + L + 3, 0], [7 + L, 0.5], [7, 1.3]] },
      { pts: [[3.2, -1.1], [7, -1.1], [7, 1.1], [3.2, 1.1]] },
      { pts: [[4.5, 0], [6.4, -6.5], [8.6, -6.5], [8.6, 6.5], [6.4, 6.5]] },
      { pts: [[-3.2, -1.1], [3.2, -1.1], [3.2, 1.1], [-3.2, 1.1]] },
      { pts: [[-3.2, 0], [-4.6, -2.2], [-6.6, 0], [-4.6, 2.2]] },
    ],
  }),
  // Maglio del Bruto (intent.pesante): asta e testa larga con due fasce incise. Il grip è sull'asta.
  maglio: () => ({
    parti: [
      { pts: [[-10, -1.9], [48, -1.9], [48, 1.9], [-10, 1.9]] },
      { pts: [[46, -9], [49, -10.5], [66, -10.5], [68, -9], [68, 9], [66, 10.5], [49, 10.5], [46, 9]], taglio: [[51.5, -8], [52.7, -8], [52.7, 8], [51.5, 8]] },
    ],
  }),
  // Lancia del Lanciere (evento.punta): asta lunga, punta a foglia, contrappeso.
  lancia: (L = 128) => ({
    parti: [
      { pts: [[-30, -1.4], [L - 14, -1.4], [L - 14, 1.4], [-30, 1.4]] },
      { pts: [[L - 14, 0], [L - 9, -3.6], [L + 4, 0], [L - 9, 3.6]] },
      { pts: [[L - 17, -3.4], [L - 14, -3.4], [L - 14, 3.4], [L - 17, 3.4]] },
      { pts: [[-30, 0], [-33, -2.4], [-36, 0], [-33, 2.4]] },
    ],
  }),
};

// Scudo della Recluta (posture.guardia): stesso profilo dello scudo del simbolo, con il filo inciso.
function scudoPoligono(cx, cy, k) {
  const base = [[4, 3.5], [20, 3.5], [20, 11], [18.5, 16], [12, 21.5], [5.5, 16], [4, 11]];
  const filo = [[5.5, 5], [18.5, 5], [18.5, 10.8], [17.2, 15.3], [12, 19.6], [6.8, 15.3], [5.5, 10.8]];
  const interno = [[6.3, 5.8], [17.7, 5.8], [17.7, 10.7], [16.5, 14.9], [12, 18.6], [7.5, 14.9], [6.3, 10.7]];
  // il simbolo ha y verso il basso: si ribalta e si centra
  const m = ([x, y]) => [cx + (x - 12) * k * 0.82, cy - (y - 12.5) * k];
  return { pts: base.map(m), taglio: [...filo.map(m), ...interno.map(m).reverse()] };
}

// --- Il costruttore umanoide ---------------------------------------------------------------------
// Scheletro comune (SCENA_SPEC §2.2): bacino, busto, testa, braccia, gambe. Le figure cambiano
// proporzioni e pezzi, non lo scheletro.
const PROP_BASE = { coscia: 28, gamba: 28, busto: 36, braccio: 17, avambraccio: 16, largBusto: 1, largArti: 1, raggioTesta: 8.5, collo: 13 };

function umanoide(spec, posa) {
  const P = { ...PROP_BASE, ...spec.prop };
  const H = posa.anca;
  const uAng = 90 - posa.busto;
  const u = dir(uAng), n = [u[1], -u[0]]; // n: avanti, perpendicolare al busto
  const S = piu(H, u, P.busto);
  const C = piu(S, dir(posa.testa[0]), posa.testa[1]);
  const lb = P.largBusto;
  // coordinate nel sistema del busto: f avanti, h lungo il busto dal bacino
  const T = (f, h) => piu(piu(H, n, f), u, h);

  const parti = [];
  const aggiungi = (pts, taglio) => parti.push({ pts, taglio });

  // Gambe: caviglia e piede ancorati a terra.
  const gamba = (ax, su, w) => {
    const g = ik(H, [ax, 5 + su], P.coscia, P.gamba);
    if (!g.raggiunto) console.warn(`  ! ${spec.id}: gamba non raggiunge il piede (ax ${ax})`);
    const lw = w * P.largArti;
    const pezzi = [quad(H, g.K, 11 * lw, 8.5 * lw), quad(g.K, g.T, 8.5 * lw, 5.5 * lw), piede(ax, su, spec.pieLungo ?? 14)];
    return { K: g.K, A: g.T, pezzi };
  };
  const gPost = gamba(posa.piedePost[0], posa.piedePost[1] ?? 0, 1);
  const gAnt = gamba(posa.piedeAnt[0], posa.piedeAnt[1] ?? 0, 1);

  // Braccia.
  const braccio = (att, a1, a2, lw) => {
    const sp = piu(att, [0, 0]);
    const g = piu(sp, dir(a1), P.braccio);
    const mano = piu(g, dir(a2), P.avambraccio);
    const w = lw * P.largArti;
    return { mano, pezzi: [quad(sp, g, 6.4 * w, 5.4 * w), quad(g, mano, 5.4 * w, 4.4 * w), arco(mano, 3 * w, 0, 330, 5)] };
  };
  const spalla = T(-0.5, P.busto - 2.5);
  const bPost = braccio(spalla, posa.braccioPost[0], posa.braccioPost[1], 0.92);
  const bAnt = braccio(spalla, posa.braccioAnt[0], posa.braccioAnt[1], 1);

  const ctx = { P, H, S, C, u, n, T, uAng, gAnt, gPost, bAnt, bPost, posa, ruota, piu, dir, quad, nastro, arco };

  // Ordine dei livelli: dietro → davanti.
  for (const p of bPost.pezzi) aggiungi(p);
  for (const p of gPost.pezzi) aggiungi(p);
  if (spec.dietro) for (const p of spec.dietro(ctx)) aggiungi(p.pts, p.taglio);
  // Busto: profilo con petto e ventre.
  aggiungi([T(-6.5 * lb, 0), T(6 * lb, 0), T(7.8 * lb, 0.35 * P.busto), T(8.8 * lb, 0.72 * P.busto), T(6.4 * lb, P.busto), T(-8 * lb, P.busto), T(-8.6 * lb, 0.55 * P.busto)]);
  for (const p of gAnt.pezzi) aggiungi(p);
  // Collo.
  aggiungi(quad(S, C, 8, 7));
  // Testa e vestiti (cappuccio, elmo, cappello): ruotati con la testa.
  if (spec.testa) for (const p of spec.testa(ctx)) aggiungi(p.pts, p.taglio);
  if (spec.sopra) for (const p of spec.sopra(ctx)) aggiungi(p.pts, p.taglio);
  for (const p of bAnt.pezzi) aggiungi(p);
  // Arma.
  const armi = spec.arma(ctx, posa);
  for (const a of armi) {
    const arma = ARMI[a.tipo](...(a.args || []));
    for (const pz of arma.parti) {
      const fm = (q) => piu(a.mano, ruota([q[0] * (a.k ?? 1), q[1] * (a.specchio ? -1 : 1)], [0, 0], a.ang));
      aggiungi(pz.pts.map(fm), pz.taglio && pz.taglio.map(fm));
    }
  }
  if (spec.scudo) { const s = spec.scudo(ctx, posa); if (s) aggiungi(s.pts, s.taglio); }
  if (spec.davanti) for (const p of spec.davanti(ctx, posa)) aggiungi(p.pts, p.taglio);

  return { parti, ctx };
}

// Testa incappucciata/elmata: poligono in locale (centro testa all'origine), ruotato di `tilt`.
const sulCentro = (C, tilt, pts) => pts.map((p) => ruota(piu(C, p), C, tilt));

// Mantello: poligono nel sistema del busto, con orlo sfaccettato che segue il moto.
const mantello = (c, trascina, lunghezza = 1) => {
  const d = trascina, L = lunghezza;
  return [{ pts: [
    c.T(-5, 38), c.T(-9.5, 34), c.T(-11, 20), c.T(-13 - d * 0.6, 4),
    c.T(-17 - d, -9 * L), c.T(-14 - d * 0.5, -15 * L), c.T(-20 - d * 1.2, -24 * L), c.T(-11 - d * 0.5, -21 * L),
    c.T(-12 - d * 0.7, -32 * L), c.T(-3, -22 * L), c.T(-2, -4),
  ] }];
};

// ---------------------------------------------------------------------------------------------
// Il viandante: cappuccio, mantello, spada. Quattro posture (SCENA_SPEC §1.2).
const VIANDANTE = {
  id: 'viandante',
  prop: { largBusto: 1.12, largArti: 1.12 },
  testa: (c) => [{ pts: sulCentro(c.C, c.posa.tilt ?? 0, [[4, -8], [8.5, -3.2], [8.8, 2.2], [6.5, 8.2], [0, 11.6], [-8, 9.5], [-17, 0.5], [-10, -5.5], [-6, -9.5]]) }],
  dietro: (c) => mantello(c, c.posa.mantello ?? 4, c.posa.mantelloL ?? 1),
  arma: (c, p) => [{ tipo: 'spada', mano: c.bAnt.mano, ang: p.arma, args: [p.lama ?? 46] }],
};

// Pose in angoli (SCENA_SPEC §3.1). busto: inclinazione in gradi verso il nemico (negativo: indietro).
// testa: [direzione dalla spalla, distanza]. braccio: [direzione dell'omero, dell'avambraccio].
export const POSE_VIANDANTE = {
  // Assalto: freccia verso il nemico. Busto avanti, base larga, spada caricata alta sopra la spalla.
  assalto: { anca: [3, 47], busto: 19, testa: [78, 13], tilt: -8, piedeAnt: [32, 0], piedePost: [-23, 3], braccioAnt: [58, 98], braccioPost: [48, 92], arma: 133, mantello: 12 },
  // Guardia: muro. Eretto, testa alta, spada verticale davanti al corpo.
  guardia: { anca: [0, 50], busto: 0, testa: [90, 14.5], tilt: 0, piedeAnt: [17, 0], piedePost: [-16, 0], braccioAnt: [-38, 66], braccioPost: [-50, 64], arma: 84, mantello: 3 },
  // Attesa: molla. Basso e raccolto, testa bassa, spada bassa di traverso davanti alle gambe.
  attesa: { anca: [-1, 37], busto: 28, testa: [64, 10], tilt: -14, piedeAnt: [9, 7], piedePost: [-9, 7], braccioAnt: [-68, -22], braccioPost: [-85, -32], arma: -17, mantello: 6, mantelloL: 0.85 },
  // Distanza: ritirata con minaccia. Busto indietro, peso sul piede posteriore, punta protesa all'altezza del petto.
  distanza: { anca: [-9, 53], busto: -15, testa: [100, 12.5], tilt: 6, piedeAnt: [20, 3], piedePost: [-24, 0], braccioAnt: [12, 6], braccioPost: [160, 120], arma: 4, lama: 50, mantello: 1, mantelloL: 0.95 },
};
export const PASSO = { assalto: 1, guardia: 0, attesa: 0, distanza: -1 };

// ---------------------------------------------------------------------------------------------
// I nemici (posa neutra). Stesse ossa, altre proporzioni e altri pezzi.
const NEMICI = {
  // Recluta: soldato semplice. Elmo a calotta con nasale, scudo (posture.guardia), spada corta.
  recluta: {
    spec: {
      id: 'recluta',
      prop: { raggioTesta: 8 },
      testa: (c) => [{ pts: sulCentro(c.C, 0, [[4, -8.5], [8.5, -4], [9.2, 1.6], [7.8, 3], [7.4, 8.4], [2, 11.4], [-6, 10.8], [-10.5, 4], [-10, -4.5], [-6, -9.5]]) },
        { pts: sulCentro(c.C, 0, [[7.4, 8.4], [9.4, 1.6], [10.6, 1.6], [8.9, 8.8]]) }],
      dietro: (c) => [{ pts: [c.T(-6, 28), c.T(-8.5, 22), c.T(-9, 2), c.T(-4, -1), c.T(-6, 20)] }],
      arma: (c, p) => [{ tipo: 'spadaCorta', mano: c.bAnt.mano, ang: p.arma }],
      scudo: (c) => { const q = scudoPoligono(c.bPost.mano[0] + 7, c.bPost.mano[1] + 2, 1.25); return q; },
    },
    posa: { anca: [0, 54], busto: 3, testa: [90, 13.5], piedeAnt: [14, 0], piedePost: [-12, 0], braccioAnt: [-40, -8], braccioPost: [-70, 18], arma: -28 },
  },
  // Duellante: snello, cappello a tesa larga con piuma, stocco, braccio libero alzato dietro.
  duellante: {
    spec: {
      id: 'duellante',
      prop: { raggioTesta: 7.8, largBusto: 0.84, largArti: 0.86, collo: 13.5 },
      testa: (c) => {
        const t = (pts) => sulCentro(c.C, -4, pts);
        return [
          { pts: t([[3, -8], [7.4, -3.4], [7.8, 1.6], [5.8, 6], [-6, 8], [-9, 0], [-5.6, -8]]) },
          // tesa larga e piuma: la sagoma più riconoscibile del Duellante
          { pts: t([[-15, 5.4], [-2, 7.4], [13, 6], [19, 8.4], [11, 10.6], [3, 14.6], [-7, 13.2], [-12, 8.8]]) },
          { pts: t([[-4, 13], [-16, 17], [-27, 15], [-35, 9], [-29, 11], [-20, 12.2], [-8, 10]]) },
        ];
      },
      dietro: (c) => [{ pts: [c.T(-5, 37), c.T(-9, 33), c.T(-11, 18), c.T(-8, 6), c.T(-2, 8)] }],
      arma: (c, p) => [{ tipo: 'stocco', mano: c.bAnt.mano, ang: p.arma, args: [52] }],
    },
    posa: { anca: [-2, 53], busto: 5, testa: [88, 14], piedeAnt: [26, 0], piedePost: [-22, 0], braccioAnt: [-40, 0], braccioPost: [128, 62], arma: 12 },
  },
  // Bruto: massiccio, curvo sotto il peso. Elmo borchiato, spalle larghe, maglio con la testa a terra.
  bruto: {
    spec: {
      id: 'bruto',
      prop: { coscia: 26, gamba: 25, busto: 41, braccio: 21, avambraccio: 20, largBusto: 1.62, largArti: 1.5, raggioTesta: 8.5, collo: 11 },
      pieLungo: 17,
      testa: (c) => [
        { pts: sulCentro(c.C, 0, [[5, -9], [10, -4], [10.4, 3], [8, 7.5], [2, 10], [-6, 10], [-11, 4], [-11, -4], [-7, -9.5]]) },
        // borchie dell'elmo: due punte
        { pts: sulCentro(c.C, 0, [[-1.5, 9.4], [0.5, 15.6], [2.5, 9.4]]) },
        { pts: sulCentro(c.C, 0, [[-8.5, 7.4], [-9.6, 13.4], [-5.6, 9.2]]) },
      ],
      dietro: (c) => [{ pts: [c.T(-9, 40), c.T(-13, 30), c.T(-14, 12), c.T(-9, 4), c.T(-7, 22)] }],
      arma: (c, p) => [{ tipo: 'maglio', mano: c.bAnt.mano, ang: p.arma }],
    },
    posa: { anca: [-2, 49], busto: 20, testa: [76, 9], piedeAnt: [19, 0], piedePost: [-17, 0], braccioAnt: [-58, -30], braccioPost: [-72, -34], arma: -45 },
  },
  // Lanciere: slanciato, elmo con cresta, lunga lancia in diagonale, tabarro.
  lanciere: {
    spec: {
      id: 'lanciere',
      prop: { busto: 37, largBusto: 0.92, largArti: 0.92, raggioTesta: 7.8 },
      testa: (c) => [
        { pts: sulCentro(c.C, 0, [[4, -8.5], [8.4, -4], [8.6, 2], [6.5, 6], [1, 9.6], [-6, 9.2], [-10, 3], [-9.4, -4.6], [-6, -9.5]]) },
        // cresta
        { pts: sulCentro(c.C, 0, [[-9, 5], [-2, 10], [6, 8], [2, 15.6], [-10, 14.2], [-14, 9]]) },
        { pts: sulCentro(c.C, 0, [[6.4, 3.4], [8.6, 3.4], [7.6, -2.6]]) },
      ],
      dietro: (c) => [{ pts: [c.T(-6, 31), c.T(-8, 24), c.T(-8, 4), c.T(-3, 1), c.T(-5, 22)] }],
      sopra: (c) => [{ pts: [c.T(-6, 3), c.T(6.5, 3), c.T(7.5, -12), c.T(0, -17), c.T(-7, -12)] }],
      arma: (c, p) => [{ tipo: 'lancia', mano: c.bAnt.mano, ang: p.arma, args: [100] }],
    },
    posa: { anca: [-3, 54], busto: 6, testa: [88, 14], piedeAnt: [17, 0], piedePost: [-17, 0], braccioAnt: [-70, -30], braccioPost: [-80, -50], arma: 46 },
  },
  // Mietitore: alto, scarno, cappuccio a punta, veste a brandelli fino a terra, falce.
  mietitore: {
    spec: {
      id: 'mietitore',
      prop: { coscia: 29, gamba: 29, busto: 40, braccio: 20, avambraccio: 19, largBusto: 0.9, largArti: 0.7, raggioTesta: 8, collo: 14 },
      testa: (c) => [
        // cappuccio alto e acuminato, il volto è un vuoto (si legge come ombra nella sagoma: nessun tratto)
        { pts: sulCentro(c.C, -3, [[3, -9], [7.6, -3], [7.4, 4], [4, 9], [-2, 18], [-9, 11], [-16, -2], [-9, -8], [-5, -11]]) },
      ],
      dietro: (c) => [{
        pts: [c.T(-6, 41), c.T(-10, 34), c.T(-13, 14), c.T(-17, -8), c.T(-23, -30), c.T(-16, -35), c.T(-15, -48), c.T(-8, -42), c.T(-4, -52), c.T(2, -44), c.T(10, -52), c.T(14, -42), c.T(18, -50), c.T(20, -30), c.T(10, -8), c.T(8, 8), c.T(7, 18)],
      }],
      arma: (c, p) => {
        const mano = c.bAnt.mano;
        return [{ tipo: 'falce', mano, ang: p.arma }];
      },
    },
    posa: { anca: [0, 58], busto: 4, testa: [86, 15], piedeAnt: [10, 0], piedePost: [-11, 0], braccioAnt: [-20, 60], braccioPost: [-35, 70], arma: 90 },
  },
};

// Falce del Mietitore: asta lunga, lama a mezzaluna sfaccettata che si piega in avanti e poi in basso.
// Si disegna con l'asta in verticale (coordinate del mondo) e si converte nel sistema locale (x lungo l'asta).
ARMI.falce = () => {
  const CIMA = 44;
  const loc = ([xw, yw]) => [yw + CIMA, -xw];
  const blade = nastro(arco([0, -28], 28, 90, 18, 7), (t) => 9.5 * (1 - t) + 1.2).map(loc);
  return {
    parti: [
      { pts: [[-98, -1.4], [CIMA + 2, -1.4], [CIMA + 2, 1.4], [-98, 1.4]] },
      { pts: blade },
      { pts: [[CIMA - 7, -3.2], [CIMA + 1, -3.2], [CIMA + 1, 3.2], [CIMA - 7, 3.2]] },
      { pts: [[-98, 0], [-101, -2.2], [-104, 0], [-101, 2.2]] },
    ],
  };
};

// --- Definizione pubblica ----------------------------------------------------------------------
export const ID_SAGOME = ['viandante.assalto', 'viandante.guardia', 'viandante.attesa', 'viandante.distanza', 'recluta', 'duellante', 'bruto', 'lanciere', 'mietitore'];

export const ETICHETTE = {
  'viandante.assalto': 'Viandante · Assalto', 'viandante.guardia': 'Viandante · Guardia',
  'viandante.attesa': 'Viandante · Attesa', 'viandante.distanza': 'Viandante · Distanza',
  recluta: 'Recluta', duellante: 'Duellante', bruto: 'Bruto', lanciere: 'Lanciere', mietitore: 'Mietitore',
};

export const NOTE = {
  'viandante.assalto': 'Freccia verso il nemico: busto avanti, base larga, spada caricata alta sopra la spalla.',
  'viandante.guardia': 'Muro: eretto, testa alta, spada verticale davanti al corpo.',
  'viandante.attesa': 'Molla: basso e raccolto, testa bassa, sulle punte, spada bassa di traverso davanti alle gambe.',
  'viandante.distanza': 'Ritirata con minaccia: busto indietro, peso sul piede posteriore, punta protesa all\'altezza del petto.',
  recluta: 'Soldato semplice: elmo con nasale, scudo di posture.guardia, spada corta.',
  duellante: 'Snello, cappello a tesa larga con piuma, stocco sottile (intent.leggero), braccio libero alzato.',
  bruto: 'Massiccio e curvo, elmo con borchie, maglio di intent.pesante con la testa a terra.',
  lanciere: 'Slanciato, elmo con cresta, lunga lancia in diagonale (evento.punta): tratto permanente, si riconosce.',
  mietitore: 'Alto e scarno, cappuccio acuminato, veste a brandelli fino a terra, falce.',
};

function costruisci(id) {
  if (id.startsWith('viandante.')) {
    const nome = id.split('.')[1];
    return umanoide(VIANDANTE, POSE_VIANDANTE[nome]);
  }
  const n = NEMICI[id];
  return umanoide(n.spec, n.posa);
}

export const VIEWBOX = { x: -100, y: -158, w: 200, h: 164 };

/** Pezzi di una sagoma: ognuno è un tracciato SVG; `taglio` è la parte da ritagliare con evenodd. */
export function pezzi(id) {
  const { parti } = costruisci(id);
  return parti.map((p) => ({ d: POLI(p.pts), taglio: p.taglio ? POLI(p.taglio) : null }));
}

/** Contenuto interno dell'SVG (in currentColor). Un solo tracciato per pezzo, i tagli con evenodd. */
export function interno(id) {
  return pezzi(id).map((p) => p.taglio ? `<path fill-rule="evenodd" d="${p.d}${p.taglio}"/>` : `<path d="${p.d}"/>`).join('');
}

// --- Misure sugli assi di SCENA_SPEC §1.1 (dalla geometria disegnata) ---------------------------------
const specDi = (id) => (id.startsWith('viandante.') ? VIANDANTE : NEMICI[id].spec);

/**
 * Misure di una sagoma, in unità (= px a 120 di riferimento):
 * - busto: inclinazione in gradi verso il nemico (A); anca: altezza del bacino (A, baricentro);
 * - testa: altezza della cima della testa, cappello escluso solo se non c'è (B);
 * - arma: direzione in gradi (0 = verso il nemico, 90 = su); mano: altezza dell'impugnatura (C).
 */
export function misure(id) {
  const { ctx } = costruisci(id);
  const spec = specDi(id);
  const testa = Math.max(...spec.testa(ctx).map((p) => Math.max(...p.pts.map((q) => q[1]))));
  return {
    busto: ctx.posa.busto,
    anca: ctx.H[1],
    testa: r1(testa),
    arma: ctx.posa.arma,
    mano: r1(ctx.bAnt.mano[1]),
    centroTesta: [r1(ctx.C[0]), r1(ctx.C[1])],
  };
}

/** Poligoni grezzi (punti con y verso l'alto), per le verifiche numeriche e la rasterizzazione. */
export function poligoni(id) {
  return costruisci(id).parti;
}

// --- Regola di distinzione (SCENA_SPEC §1.2) ----------------------------------------------------------
/** Soglie con cui due posture "differiscono" su un asse, in gradi e unità (px a 120 di riferimento). */
export const SOGLIE = { busto: 10, anca: 8, testa: 8, arma: 40, mano: 25 };
export const POSTURE = ['assalto', 'guardia', 'attesa', 'distanza'];

const diffAngolo = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

/** Differenza tra due posture sugli assi A, B, C: delta misurati, assi che superano la soglia e loro numero. */
export function distinzione(p, q) {
  const m = misure('viandante.' + p), n = misure('viandante.' + q);
  const d = {
    busto: Math.abs(m.busto - n.busto), anca: Math.abs(m.anca - n.anca),
    testa: r1(Math.abs(m.testa - n.testa)), arma: diffAngolo(m.arma, n.arma), mano: r1(Math.abs(m.mano - n.mano)),
  };
  const A = d.busto >= SOGLIE.busto || d.anca >= SOGLIE.anca;
  const B = d.testa >= SOGLIE.testa;
  const C = d.arma >= SOGLIE.arma || d.mano >= SOGLIE.mano;
  return { coppia: [p, q], delta: d, A, B, C, assi: [A, B, C].filter(Boolean).length };
}
export function matriceDistinzione() {
  const out = [];
  for (let i = 0; i < POSTURE.length; i++) for (let j = i + 1; j < POSTURE.length; j++) out.push(distinzione(POSTURE[i], POSTURE[j]));
  return out;
}

// --- Somiglianza delle silhouette (verifica a 120 px, nero pieno) ---------------------------------------
// Intersezione su unione delle aree, a passo di 1 unità, con le figure allineate sul bacino.
// 1 = identiche. Serve come controllo oggettivo accanto al giudizio a vista.
const campioni = new Map();
function campione(id) {
  if (campioni.has(id)) return campioni.get(id);
  const parti = poligoni(id);
  const dentro = (pts, x, y) => {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      if ((pts[i][1] > y) !== (pts[j][1] > y) && x < ((pts[j][0] - pts[i][0]) * (y - pts[i][1])) / (pts[j][1] - pts[i][1]) + pts[i][0]) c = !c;
    }
    return c;
  };
  const s = new Set();
  for (let y = 0; y < 150; y++) for (let x = -100; x < 100; x++) {
    for (const p of parti) {
      const gruppo = [p.pts, ...(p.taglio ? [p.taglio] : [])];
      let n = 0;
      for (const g of gruppo) if (dentro(g, x + 0.5, y + 0.5)) n++;
      if (n % 2 === 1) { s.add(y * 200 + x + 100); break; }
    }
  }
  campioni.set(id, s);
  return s;
}
export function somiglianza(a, b) {
  const A = campione(a), B = campione(b);
  let inter = 0;
  for (const k of A) if (B.has(k)) inter++;
  return inter / (A.size + B.size - inter);
}
