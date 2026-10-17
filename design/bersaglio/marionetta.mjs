// Marionette per i fotogrammi bersaglio (SCENA_SPEC §2). Lo scheletro è quello comune: bacino, busto,
// testa, braccia e gambe a due ossa, arma, due pezzi di mantello. Ogni osso diventa un gruppo SVG con la
// sua trasformazione (translate + rotate): la posa è un insieme di dati, i pezzi si possono ridisegnare.
//
// Coordinate dello schermo (y verso il basso), origine a terra sotto il bacino, figura rivolta a destra.
// Gli angoli delle ossa si danno come in design/sagome-dati.mjs: gradi matematici, 0 = verso il nemico,
// 90 = su. Il busto e la testa si inclinano in gradi "verso il nemico".

const R = Math.PI / 180;
export const f1 = (n) => +n.toFixed(1);
export const dir = (a) => [Math.cos(a * R), -Math.sin(a * R)]; // angolo matematico → verso sullo schermo
export const piu = (p, q, k = 1) => [p[0] + q[0] * k, p[1] + q[1] * k];
export const meno = (p, q) => [p[0] - q[0], p[1] - q[1]];
export const lung = (p) => Math.hypot(p[0], p[1]);
const lim = (x) => Math.max(-1, Math.min(1, x));

export const poli = (pts) => 'M' + pts.map(([x, y]) => `${f1(x)} ${f1(y)}`).join('L') + 'Z';
export const linea = (pts) => 'M' + pts.map(([x, y]) => `${f1(x)} ${f1(y)}`).join('L');
const tr = (p, rot) => `translate(${f1(p[0])} ${f1(p[1])})${rot ? ` rotate(${f1(rot)})` : ''}`;

// Cinematica inversa a due ossa. `lato` +1: il gomito o il ginocchio piega verso il nemico (avanti).
export function ik(A, T, l1, l2, lato = 1) {
  const d0 = lung(meno(T, A));
  const d = Math.min(d0, l1 + l2 - 0.01);
  const base = Math.atan2(T[1] - A[1], T[0] - A[0]);
  const off = Math.acos(lim((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
  const a1 = base - lato * off; // angolo sullo schermo, in radianti
  const K = [A[0] + l1 * Math.cos(a1), A[1] + l1 * Math.sin(a1)];
  const a2 = Math.atan2(T[1] - K[1], T[0] - K[0]);
  return { K, s1: a1 / R, s2: a2 / R, T: [K[0] + l2 * Math.cos(a2), K[1] + l2 * Math.sin(a2)], raggiunto: d0 <= l1 + l2 };
}

// Nastro sfaccettato a spessore variabile lungo una polilinea (aste, lame curve, linee di velocità).
export function nastro(punti, larg) {
  const su = [], giu = [];
  punti.forEach((p, i) => {
    const a = punti[Math.max(0, i - 1)], b = punti[Math.min(punti.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const n = [-dy / l, dx / l];
    const w = (typeof larg === 'function' ? larg(i / (punti.length - 1)) : larg) / 2;
    su.push(piu(p, n, w)); giu.push(piu(p, n, -w));
  });
  return [...su, ...giu.reverse()];
}
// Tratto inciso affusolato tra due punti (sgorbia): rombo allungato.
export function fuso(a, b, w) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
  const n = [(-dy / l) * (w / 2), (dx / l) * (w / 2)];
  const p = (t) => [a[0] + dx * t, a[1] + dy * t];
  return [a, piu(p(0.3), n), piu(p(0.7), n), b, piu(p(0.7), n, -1), piu(p(0.3), n, -1)];
}

// --- Pezzi -----------------------------------------------------------------------------------------
// Ogni pezzo: { d, cls } dove cls è 'i' (inchiostro), 'sep' (inchiostro con filo di carta attorno),
// 'cut' (taglio di sgorbia: tratto color carta), 'perno' (rivetto della marionetta di carta).
const P = (pts, cls = 'i') => ({ d: poli(pts), cls });
const T = (pts) => ({ d: linea(pts), cls: 'cut' });
const perno = (x, y, r = 1.15) => ({ perno: [x, y, r] });

// Arto lungo +x: spessore all'attacco wa, alla fine wb, con risvolto (manica, gambale) a `k` della lunghezza.
function arto(l, wa, wb, opz = {}) {
  const { risvolto = null, mano = false, stivale = null } = opz;
  const pts = [[-2, -wa / 2], [l - 1, -wb / 2]];
  if (mano) pts.push([l + 1.5, -wb / 2 - 0.6], [l + 4, -wb / 2 + 0.6], [l + 4.6, wb / 2 - 0.4], [l + 2, wb / 2 + 0.8]);
  else pts.push([l + 1.6, 0]);
  pts.push([l - 1, wb / 2], [-2, wa / 2], [-3.6, 0]);
  const out = [P(pts, opz.cls ?? 'i')];
  if (stivale) { // gambale dello stivale: più largo dal punto `stivale` in giù
    const s = l * stivale, w = wb / 2 + 1.1;
    out.push(P([[s, -w - 0.4], [l + 0.6, -w], [l + 0.6, w], [s, w + 0.4], [s - 1.6, 0]], opz.cls ?? 'i'));
    out.push(T([[s + 0.2, -w + 0.6], [s + 0.2, w - 0.6]]));
    out.push(T([[s + 3.4, -w + 0.9], [s + 4.4, w - 0.9]]));
  }
  if (risvolto != null) { const x = l * risvolto; out.push(T([[x, -wb / 2 + 0.7], [x - 0.8, wb / 2 - 0.7]])); }
  return out;
}

// --- Figure -------------------------------------------------------------------------------------------
// Ogni figura dichiara proporzioni e pezzi per osso. I pezzi della testa e del busto sono disegnati in
// piedi (su = −y, avanti = +x); quelli degli arti lungo +x.
export const VIANDANTE = {
  id: 'viandante',
  prop: { coscia: 28, gamba: 28, busto: 36, braccio: 17, avambraccio: 16, collo: 13 },
  busto: (B) => [
    P([[-8.4, 2], [7.8, 2], [9.4, -10], [11, -22], [10.4, -29], [7.6, -34], [2.5, -B - 0.5], [-6.5, -B], [-10.6, -30], [-11, -18], [-9.6, -6]]),
    T([[-9.2, -5.6], [9, -7.2]]),               // cintura
    T([[-6.8, -33], [6.4, -10]]),                // bandoliera
    T([[8.6, -15], [6.2, -13.2]]), T([[9.6, -19.5], [7, -17.6]]), T([[10, -24], [7.4, -22.2]]), // tratteggio del petto
  ],
  gonna: () => [
    P([[-10, -6], [9.8, -7.5], [11.8, 4.5], [8.6, 9.6], [3.6, 7.6], [0.6, 11.4], [-4, 8.6], [-8.4, 10.6], [-12.4, 6]], 'sep'),
    T([[-3.6, -3.2], [-5, 7.2]]), T([[2.6, -3.8], [3.2, 5.8]]), T([[7.6, -4.4], [9.2, 4]]),
  ],
  testa: () => [
    P([[4, 8.4], [8.6, 3.4], [9, -2.2], [6.6, -8.4], [0, -11.8], [-8, -9.8], [-17.4, -0.6], [-10.6, 5.4], [-7, 11], [5.8, 11.6]], 'sep'),
    T([[6.2, -6.8], [7.6, -2], [7.2, 3], [4.2, 7.6]]),  // orlo del cappuccio: dentro, il buio
    T([[0, -9.6], [-7.6, -7.4], [-14.4, -0.8]]),          // cucitura
  ],
  mantelloLungo: () => [
    P([[3, -4], [-4, -4.4], [-9.6, 6], [-11.6, 22], [-14.6, 38], [-19, 53], [-12.6, 50], [-12.4, 59], [-6.4, 52.6], [-2, 57.6], [0.8, 48], [3, 30], [4.6, 10]]),
    T([[-3, 6], [-8.4, 46]]), T([[0.4, 10], [-1.6, 44]]), T([[-6.4, 8], [-12.6, 42]]),
  ],
  mantellina: () => [
    P([[-10, -6.4], [3.6, -6.2], [8.6, -1.6], [8, 4.6], [4.2, 9.4], [0.4, 7.2], [-3.6, 11.6], [-8, 8.2], [-12.6, 9], [-13, 2]], 'sep'),
    T([[-1, -3.4], [1.6, 7]]), T([[-6, -3.4], [-6.4, 8]]), T([[4.6, -2.6], [6, 4]]),
  ],
  braccio: (l, ant) => arto(l, 8.2, 6.6, { risvolto: 0.86, cls: ant ? 'sep' : 'i' }),
  avambraccio: (l, ant) => arto(l, 6.4, 5, { mano: true, risvolto: 0.78, cls: ant ? 'sep' : 'i' }),
  coscia: (l, ant) => arto(l, 12.4, 9.4, { cls: ant ? 'sep' : 'i' }),
  gamba: (l, ant) => [...arto(l, 9.2, 6, { stivale: 0.5, cls: ant ? 'sep' : 'i' }), ...(ant ? [perno(0, 0)] : [])],
  piede: (su) => P([[-5.2, -1.6], [3.4, -1.6], [5.6, 2], [13.6, 4.4 + su * 0.2], [14.4, 5 + su], [-1, 5 + su * 0.15], [-5.6, 5 + su * 0.15 - su]]),
  arma: 'spada',
};

export const BRUTO = {
  id: 'bruto',
  prop: { coscia: 26, gamba: 25, busto: 41, braccio: 21, avambraccio: 20, collo: 11 },
  busto: (B) => [
    P([[-12.6, 2], [12, 2], [15.6, -12], [16.4, -24], [14.2, -33], [7, -B - 0.6], [-9.5, -B + 0.5], [-16.2, -B + 9.5], [-17, -22], [-14.4, -8]]),
    T([[-14.2, -6.4], [13.6, -8.6]]), T([[-14.4, -9.4], [14.4, -11.6]]),             // cinturone
    T([[15, -18], [11.6, -16.4]]), T([[15.8, -23], [12.2, -21.4]]), T([[15.6, -28], [12, -26.6]]), // ventre
    T([[-15.6, -15], [-12, -13.4]]), T([[-16.2, -20], [-12.6, -18.4]]), T([[-16, -25], [-12.4, -23.6]]), // dorso
    perno(-4, -10, 1.3), perno(4, -10.8, 1.3),                                         // borchie
  ],
  gonna: () => [
    P([[-15, -9], [14.8, -11], [15.4, 0], [11, 4.6], [5, 2.6], [0, 6], [-6, 3], [-11, 5.6], [-16.2, 1]], 'sep'),
    T([[-8, -6.6], [-9, 2.4]]), T([[0, -7.4], [0, 3.6]]), T([[8, -8.4], [8.6, 1.6]]),
  ],
  // Pelliccia sulle spalle: copre le giunture delle spalle, orlo a punte.
  mantellina: () => [
    P([[-16, -7], [-6, -11], [6, -10], [13, -5], [14, 2], [10, 1.6], [9, 7.6], [5, 3.6], [2, 10], [-1.6, 4.4], [-5.6, 10], [-8, 4], [-12.4, 8.6], [-13.6, 2.6], [-18.6, 5]], 'sep'),
    T([[-10, -6], [-9.6, 1.6]]), T([[-3.6, -7.6], [-3, 2]]), T([[3, -7], [3.6, 2.6]]), T([[8.6, -4.6], [9.6, 0.8]]),
  ],
  testa: () => [
    P([[5, 9.6], [10, 4], [10.6, -3], [8, -7.6], [2, -10], [-6, -10.2], [-11, -4], [-11.4, 4], [-8, 10.4]], 'sep'),
    P([[-1.6, -9.4], [0.6, -16.2], [2.6, -9.4]]), P([[-8.6, -7.4], [-10.6, -13], [-5.4, -9.2]]), // borchie dell'elmo
    T([[-10.6, 2.6], [10, 1.4]]),                 // orlo dell'elmo
    T([[3.6, -2.2], [10.2, -2.6]]),               // feritoia
    T([[-2, -9], [-2.6, 1.6]]),
    perno(-6, 0, 0.9), perno(-1.6, 0.4, 0.9),
  ],
  braccio: (l, ant) => [...arto(l, 13, 10, { risvolto: 0.84, cls: ant ? 'sep' : 'i' })],
  avambraccio: (l, ant) => [...arto(l, 10, 7.6, { mano: true, risvolto: 0.62, cls: ant ? 'sep' : 'i' }), ...(ant ? [perno(l * 0.4, 0, 1.1), perno(0, 0)] : [])],
  coscia: (l, ant) => arto(l, 17, 13, { cls: ant ? 'sep' : 'i' }),
  gamba: (l, ant) => [...arto(l, 13, 8.6, { stivale: 0.45, cls: ant ? 'sep' : 'i' }), ...(ant ? [perno(0, 0, 1.3)] : [])],
  piede: (su) => P([[-6.4, -2.4], [4, -2.4], [6.6, 1.6], [16.6, 4], [17.4, 5 + su], [-1, 5 + su * 0.15], [-7, 5 + su * 0.15 - su]]),
  arma: 'maglio',
};

// Armi lungo +x, impugnatura nell'origine: ripetono le sagome dei simboli (UI_SPEC §6.4).
export const ARMI = {
  // Spada di posture.assalto: lama con sgusciatura, guardia a barra, impugnatura, pomo a rombo.
  spada: (L = 46) => [
    P([[6.4, -2.3], [6.4 + L - 6, -2.3], [6.4 + L, 0], [6.4 + L - 6, 2.3], [6.4, 2.3]], 'sep'),
    T([[9.4, 0], [6.4 + L - 12, 0]]),
    P([[3.6, -8], [6.4, -8], [6.4, 8], [3.6, 8]], 'sep'),
    P([[-3.5, -1.4], [3.6, -1.4], [3.6, 1.4], [-3.5, 1.4]], 'sep'),
    P([[-3.5, 0], [-5.6, -2.2], [-7.7, 0], [-5.6, 2.2]], 'sep'),
  ],
  // Maglio di intent.pesante: asta, testa larga con due fasce incise, ghiera.
  maglio: () => [
    P([[-11, -2], [48, -2], [48, 2], [-11, 2]], 'sep'),
    P([[46, -10], [49, -11.6], [67, -11.6], [70, -10], [70, 10], [67, 11.6], [49, 11.6], [46, 10]], 'sep'),
    T([[50.6, -9.4], [50.6, 9.4]]), T([[65.4, -9.4], [65.4, 9.4]]),
    T([[54, -6], [62, -6]]), T([[54, -2], [62, -2]]), T([[54, 2], [62, 2]]),
    P([[40, -3.4], [46, -3.4], [46, 3.4], [40, 3.4]], 'sep'),
    perno(43, 0, 0.9),
  ],
};
export const TESTA_MAGLIO = 58; // centro della testa del maglio, lungo l'asta

// Fodero, per la locanda: la spada riposa al fianco.
export const FODERO = () => [
  P([[-4, -2.6], [44, -2], [47, 0], [44, 2], [-4, 2.6]], 'sep'),
  T([[2, 0], [40, 0]]),
  P([[-5, -7.4], [-2.4, -7.4], [-2.4, 7.4], [-5, 7.4]], 'sep'),
  P([[-12, -1.4], [-5, -1.4], [-5, 1.4], [-12, 1.4]], 'sep'),
  P([[-12, 0], [-14.2, -2.2], [-16.4, 0], [-14.2, 2.2]], 'sep'),
];

// --- Posa → ossa ----------------------------------------------------------------------------------
/**
 * posa: { anca: [x, h], busto: gradi verso il nemico, testa: [direzione, distanza], tilt: cenno in avanti,
 *   piedeAnt / piedePost: [x, sollevamento], braccioAnt / braccioPost: [omero, avambraccio] (angoli)
 *   oppure manoAnt / manoPost: [x, y] (cinematica inversa), arma: angolo, armaIn: 'ant' | 'post',
 *   mantello: oscillazione del mantello lungo (gradi, + = indietro), armaDietro: arma dietro il busto,
 *   lama: lunghezza della spada, fodero: true }
 */
export function ossa(fig, posa) {
  const p = fig.prop;
  const B = p.busto;
  const H = [posa.anca[0], -posa.anca[1]];
  const L = posa.busto;
  const u = dir(90 - L), n = dir(-L);
  const S = piu(H, u, B);
  const C = piu(S, dir(posa.testa[0]), posa.testa[1]);
  const spalla = piu(piu(H, u, B - 3), n, -0.5);
  const nuca = piu(piu(H, u, B - 1), n, -5);

  const braccio = (chiave) => {
    const mano = posa['mano' + chiave];
    if (mano) {
      const g = ik(spalla, mano, p.braccio, p.avambraccio, posa['gomito' + chiave] ?? -1);
      return { E: g.K, M: g.T, s1: g.s1, s2: g.s2 };
    }
    const [a1, a2] = posa['braccio' + chiave];
    const E = piu(spalla, dir(a1), p.braccio);
    return { E, M: piu(E, dir(a2), p.avambraccio), s1: -a1, s2: -a2 };
  };
  const bAnt = braccio('Ant'), bPost = braccio('Post');
  const gamba = (pd) => {
    const su = pd[1] ?? 0;
    const A = [pd[0], -(5 + su)];
    const g = ik(H, A, p.coscia, p.gamba, 1);
    if (!g.raggiunto) console.warn(`  ! ${fig.id}: la gamba non arriva al piede (${pd})`);
    return { K: g.K, A: g.T, s1: g.s1, s2: g.s2, su };
  };
  const gAnt = gamba(posa.piedeAnt), gPost = gamba(posa.piedePost);
  const manoArma = posa.armaIn === 'post' ? bPost.M : bAnt.M;
  return { H, S, C, L, spalla, nuca, bAnt, bPost, gAnt, gPost, manoArma, armaAng: posa.arma };
}

/** Punto lungo l'arma, nelle coordinate della figura (per il punto d'impatto). */
export function puntoArma(o, distanza) { return piu(o.manoArma, dir(o.armaAng), distanza); }

// --- Disegno ----------------------------------------------------------------------------------------
function rendiPezzi(pezzi, piccolo) {
  return pezzi.map((q) => {
    if (q.perno) return piccolo ? '' : `<circle class="perno" cx="${q.perno[0]}" cy="${q.perno[1]}" r="${q.perno[2]}"/>`;
    if (q.cls === 'cut') return piccolo ? '' : `<path class="cut" d="${q.d}"/>`;
    return `<path class="${q.cls}" d="${q.d}"/>`;
  }).join('');
}
const osso = (nome, trasf, pezzi, piccolo) => `<g data-osso="${nome}" transform="${trasf}">${rendiPezzi(pezzi, piccolo)}</g>`;

/**
 * SVG di una marionetta in posa. opz: { x, y (terra), k (scala), specchia, piccolo (senza tagli),
 * classe }. Restituisce { svg, o, aScena(p) } dove aScena porta un punto della figura nella scena.
 */
export function marionetta(fig, posa, opz = {}) {
  const { x = 0, y = 0, k = 1, specchia = false, piccolo = false } = opz;
  const o = ossa(fig, posa);
  const p = fig.prop;
  const s = specchia ? -1 : 1;
  const aScena = (q) => [x + s * k * q[0], y + k * q[1]];

  const arma = fig.arma === 'spada' ? ARMI.spada(posa.lama ?? 46) : ARMI[fig.arma]();
  const g = [];
  const add = (nome, trasf, pezzi) => g.push(osso(nome, trasf, pezzi, piccolo));
  const braccioDi = (b, ant, nome) => {
    add('braccio' + nome, tr(o.spalla, b.s1), fig.braccio(p.braccio, ant));
    add('avambraccio' + nome, tr(b.E, b.s2), fig.avambraccio(p.avambraccio, ant));
  };
  const gambaDi = (gm, ant, nome) => {
    add('coscia' + nome, tr(o.H, gm.s1), fig.coscia(p.coscia, ant));
    add('gamba' + nome, tr(gm.K, gm.s2), fig.gamba(p.gamba, ant));
    add('piede' + nome, tr(gm.A), [fig.piede(gm.su)]);
  };
  const armaG = () => { if (!posa.senzaArma) add('arma', tr(o.manoArma, -o.armaAng), arma); };

  // Ordine dei livelli (SCENA_SPEC §2.3): arti posteriori dietro al busto, anteriori davanti.
  if (posa.armaDietro) armaG();
  braccioDi(o.bPost, false, 'Post');
  if (fig.mantelloLungo) add('mantello2', tr(o.nuca, o.L + (posa.mantello ?? 4)), fig.mantelloLungo());
  gambaDi(o.gPost, false, 'Post');
  if (posa.fodero) add('fodero', tr(piu(o.H, dir(90 - o.L), 6), 180 - 28 + o.L * 0.3), FODERO());
  add('busto', tr(o.H, o.L), fig.busto(p.busto));
  gambaDi(o.gAnt, true, 'Ant');
  add('bacino', tr(o.H, o.L), fig.gonna());
  add('collo', tr(o.S, o.L), [P([[-3.6, 2], [3.4, 2], [3, -6], [-3.2, -6]])]);
  // Una posa può portare il braccio anteriore dietro la testa (SCENA_SPEC §2.3), per esempio nella carica.
  if (posa.bracciaDietroTesta) { braccioDi(o.bAnt, true, 'Ant'); if (!posa.armaDietro) armaG(); }
  add('testa', tr(o.C, o.L * 0.3 - (posa.tilt ?? 0)), fig.testa());
  add('mantello1', tr(o.spalla, o.L), fig.mantellina());
  if (!posa.armaDietro && posa.armaIn === 'post') armaG();
  if (!posa.bracciaDietroTesta) {
    braccioDi(o.bAnt, true, 'Ant');
    if (!posa.armaDietro && posa.armaIn !== 'post') armaG();
  }

  const trasf = `translate(${f1(x)} ${f1(y)}) scale(${f1(s * k * 100) / 100} ${f1(k * 100) / 100})`;
  const svg = `<g class="marionetta" data-figura="${fig.id}" transform="${trasf}">${g.join('')}</g>`;
  return { svg, o, aScena };
}
