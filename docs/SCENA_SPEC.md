# Scena del duello: specifica

> **Versione:** 0.3 (15 ottobre 2026) · **Proprietario:** Planning
> **Stato:** §1 (linguaggio delle pose) **approvata**. §2–§5 (scheletro, animazioni, contratto con la logica, laboratorio) **in bozza**, da approvare prima del prototipo.
> **Riferimenti:** DESIGN §8.1 (scena, profilo, ventaglio); CLAUDE.md (dispositivo di riferimento S23).

## 1. Linguaggio delle pose
Le pose sono **regole di gioco rese visibili**: prima di disegnare, fissiamo cosa rende riconoscibile ogni postura e ogni intenzione. I disegni si giudicano su questi criteri, non sul gusto.

### 1.1 Assi visivi
Ogni posa si descrive su cinque assi. Usarne pochi e sempre gli stessi rende le pose confrontabili e permette di verificarle.

| Asse | Valori |
|---|---|
| **A. Baricentro e busto** | Avanti (inclinato verso il nemico) · centrato ed eretto · basso e raccolto · indietro (inclinato via dal nemico) |
| **B. Altezza della testa** | Alta · media · bassa (circa −15%, accovacciato) |
| **C. Arma** | Caricata alta, pronta a colpire · davanti al corpo, a coprire · bassa lungo il fianco, pronta · protesa verso il nemico all'altezza del petto, a tenere a bada |
| **D. Base dei piedi** | Larga, piede anteriore avanzato · media · stretta, sulle punte · arretrata, peso sul piede posteriore |
| **E. Posizione in scena** | Un passo avanti · posizione base · posizione base · **un passo indietro**: lo spazio tra le figure cresce |

### 1.2 Le quattro posture del viandante
| Postura | A. Busto | B. Testa | C. Arma | D. Piedi | E. Posizione | Forma della sagoma | Riferimento storico |
|---|---|---|---|---|---|---|---|
| **Assalto** | Avanti, circa 15–20° | Media | Caricata alta, sopra la spalla | Larga, avanzata | Un passo avanti | **Freccia** verso il nemico | *Posta di donna* (Fiore) |
| **Guardia** | Centrato, eretto | Alta | Davanti al corpo | Media, ginocchia flesse | Base | **Muro**: compatta e verticale | *Posta frontale* o *di corona* |
| **Attesa** | Basso e raccolto | Bassa | Bassa, di traverso davanti alle gambe | Stretta, sulle punte | Base | **Molla**: raccolta, pronta a scattare | *Dente di zenghiaro*, *tutta porta di ferro* |
| **Distanza** | Indietro | Media | **Protesa verso il nemico all'altezza del petto**, punta "in presenza" | Arretrata | Un passo indietro | **Ritirata con minaccia**: il corpo si allontana, la punta resta | *Posta longa*, fuori misura |

Le sagome traducono il modello di DESIGN §5.2: l'**Assalto** colpisce adesso, la **Guardia** copre adesso, l'**Attesa** si carica per dopo (è una preparazione) e la **Distanza** esce dal colpo cedendo terreno.

I riferimenti storici e le loro fonti sono in [docs/ricerca/POSTURE_ANALISI.md](ricerca/POSTURE_ANALISI.md). Servono come modello per il disegno; la regola di distinzione resta comunque prioritaria.

**Regola di distinzione:** ogni postura differisce da ciascuna delle altre su **almeno 2 assi tra A, B e C**, i tre leggibili anche nella sola sagoma. Le coppie più a rischio di confusione:
- Guardia e Attesa si distinguono per altezza della testa e posizione dell'arma;
- Assalto e Distanza per direzione del busto e posizione in scena.

### 1.3 Stati sovrapposti alla postura
Gli stati modificano la posa senza cancellarla: la postura deve restare riconoscibile.

| Stato | Segno nella posa | Segno nell'interfaccia |
|---|---|---|
| **Fiato basso (≤ 2)** | Respiro di riposo più ampio e rapido | Pallini del fiato |
| **Fiato a zero** | Spalle cadute, arma più bassa di circa 10° | Pallini vuoti e lampeggianti |
| **Vantaggio** | Busto più alto di 1–2°, nessun tremito | Simbolo `stato.vantaggio` sopra la testa |
| **Preparato** (viandante e nemici) | Postura invariata, inchiostro addensato sull'arma. Per il viandante nasce dall'Attesa non raggiunta da attacchi; per il nemico dal raccogliersi o dall'Invito. | Simbolo `stato.preparato` |
| **Spazio alle spalle** (0–2) | La figura arretra di un passo per ogni Distanza consecutiva. Dietro il viandante c'è un **segno sul terreno** (bordo, solco, quinta) sempre visibile. | Contatore `spazio` |
| **Spalle al muro** (spazio = 2) | Il tallone tocca il bordo, il busto è leggermente schiacciato in avanti | Simbolo `stato.spalle`; il medaglione della Distanza è spento |
| **Cambio di postura** | Transizione di 250–350 ms con un passo, che rende visibile il costo in fiato. Il cambio gratuito con le spalle al muro è uno scatto in avanti, senza pallino speso. | Il pallino di fiato speso si svuota |

### 1.4 Telegrafi dei nemici: le quattro categorie dell'hint
Il telegrafo è la posa di **anticipazione** che il nemico tiene durante la fase di scelta, ripetuta in ciclo.

| Categoria | Criteri della posa | Ritmo del ciclo |
|---|---|---|
| **Pesante** | Carica ampia: arma dietro o sopra la testa, busto ruotato all'indietro, peso sul piede posteriore | Lento e teso, circa 1,2 s |
| **Leggero** | Carica minima: arma vicina al corpo, peso avanti sulle punte, piccoli scatti della lama | Rapido e nervoso, circa 0,5 s |
| **Difesa** | Arma o scudo davanti, baricentro basso, immobilità | Quasi fermo, respiro lento |
| **Preparazione** | Raccoglimento: busto chiuso, testa china, inchiostro che converge sulla figura | Respiro profondo, circa 1,5 s |

**Regola d'informazione, vincolante:** nella modalità normale, con l'hint per categoria, il telegrafo comunica **solo la categoria**. Portata, velocità, `sfondaGuardia` e `inarrestabile` **non** devono essere leggibili dalla posa, perché DESIGN §5.4 li tiene nascosti.
- Due mosse della stessa categoria e dello stesso nemico usano **lo stesso telegrafo**.
- I tratti permanenti del nemico, come la lancia lunga del Lanciere, restano visibili: riconoscerli fa parte del conoscere il nemico.
- Con "hint completi" attivo i telegrafi possono differenziarsi per mossa.
- **Categoria "difesa" (ARENA_SPEC 1.1):** comprende mosse con archetipi diversi, che per lo stesso nemico condividono un unico telegrafo:
  - Duellante: Parata e **Invito**;
  - Bruto: **Incassare**;
  - Lanciere: Tenere a bada;
  - Recluta: Copertura;
  - Mietitore: Guardia d'osso.

  Il giocatore non deve poter distinguere dalla posa una parata (*guardia*) da un invito al contrattacco (*attesa*): è la lettura più interessante della categoria. La differenza si scopre solo nella risoluzione.

### 1.5 Risoluzione: pose di esito
Ogni evento del risolutore ha una posa o un'animazione di esito, **nell'ordine degli eventi**: l'animazione non può mai mostrare un esito diverso da quello calcolato.

| Evento | Criteri |
|---|---|
| **Colpo a segno** | Esecuzione → fermo d'impatto di 80 ms → la vittima arretra. Intensità proporzionale al danno: leggero, pesante, con vantaggio. |
| **Parata** | L'arma intercetta il colpo; scintilla o schizzo d'inchiostro nel punto di contatto. Il difensore non arretra o arretra di poco. |
| **Schivata** | Il corpo esce dalla traiettoria (si abbassa o ruota); eventuale contrattacco subito dopo. |
| **Evitato (Distanza)** | Il colpo corto si ferma a vuoto davanti alla figura arretrata. |
| **Incalza** | Chi attacca la Distanza avanza di mezzo passo, comunque vada il colpo; la figura che arretra si avvicina al bordo. Compare `stato.vantaggio` sull'attaccante e `evento.incalza`. |
| **Punta** (Distanza 2) | L'attaccante entra e trova la punta protesa: si ferma, ha un piccolo rinculo, una goccia d'inchiostro. Nessun avanzamento. |
| **Arresto** (Distanza 3) | La punta ferma l'avanzata a metà strada: fermo d'impatto di 80 ms, l'attaccante arretra. `stato.vantaggio` passa al difensore. |
| **Preparato** | L'inchiostro converge sull'arma della figura in Attesa (o in raccoglimento) a fine turno. |
| **Interruzione** | L'animazione della vittima si spezza a metà carica; segno `evento.interrotto`. |
| **Preparazione rotta** | Il raccoglimento si spezza; l'inchiostro addensato si disperde. |
| **A terra / vittoria** | Pose finali, senza ciclo. |

### 1.6 Vincoli di disegno (approvati)
- **Niente volti espressivi:** viandante incappucciato, nemici con maschere, elmi o volti in ombra.
- **Solo profilo:** nessuna rotazione del corpo verso lo schermo e niente stoffe simulate. Il mantello ha un'inerzia semplice.
- **Giunture coperte da vesti sovrapposte;** dove restano visibili, diventano un tratto dello stile a marionetta di carta.
- **Lo scheletro umanoide è comune** al viandante e ai nemici umanoidi: cambiano disegni e proporzioni, non lo scheletro.
- **Stile della direzione A, Xilografia** (UI_SPEC): stesso tratto, stessi pesi, stessa palette delle icone.

### 1.7 Criteri di accettazione delle pose
1. **Prova della sagoma:** con riempimento nero pieno e figura alta 120px, cioè la scala reale su S23, le 4 posture e i 4 telegrafi si riconoscono **senza etichette**. Si verifica con un quiz di 16 domande in un artefatto: l'obiettivo è almeno 14 risposte corrette.
2. **Matrice di distinzione:** una tabella dimostra che ogni coppia di posture differisce su almeno 2 assi tra A, B e C.
3. **Leggibilità del telegrafo:** la categoria si riconosce entro **0,5 s** di ciclo.
4. **Scala di grigi e daltonismo:** nessuna distinzione affidata solo al colore.
5. **Regola d'informazione (§1.4):** verificata dall'Audit su tutte le coppie di mosse della stessa categoria, comprese Parata e Invito del Duellante.
6. **Spazio leggibile:** il segno del bordo e la posizione della figura comunicano lo spazio rimasto (0, 1, 2) senza bisogno di testo.
7. **Visibilità su S23:** prova a 360×780 nell'app Claude, come da CLAUDE.md.

---

## 2. Scheletro delle marionette
Lo scheletro (*rig*) e il disegno sono **separati**. Lo scheletro decide come si muove una figura, i pezzi disegnati decidono come appare. Si può ridisegnare una figura, anche affidandola a un illustratore, senza toccare pose e animazioni.

### 2.1 Coordinate
- Ogni figura vive in un proprio sistema locale in SVG. **Altezza di riferimento: 120 unità = 120 px su S23**, figura in piedi a riposo. L'origine è a terra, sotto il bacino; y cresce verso il basso, come in SVG.
- La figura guarda **a destra**. Il nemico usa lo stesso scheletro **specchiato** (`scale(-1, 1)`) e guarda a sinistra. I simboli dentro la scena non si specchiano (UI_SPEC §5.2).
- **Un passo** in scena vale 24 unità. La posizione orizzontale delle figure si esprime in passi (§4.2).

### 2.2 Ossa (scheletro umanoide comune)
| Osso | Padre | Note |
|---|---|---|
| `bacino` | — (radice) | Trasformazione della radice: x, y (abbassamento), rotazione |
| `busto` | bacino | Inclinazione: asse A di §1.1 |
| `testa` | busto | Pochi gradi: niente volti (§1.6) |
| `braccioAnt`, `avambraccioAnt` | busto | Braccio dalla parte dello spettatore |
| `braccioPost`, `avambraccioPost` | busto | Braccio dalla parte opposta |
| `arma` | avambraccioAnt (o Post, per posa) | La sagoma dell'arma ripete quella del simbolo (UI_SPEC §6.4) |
| `cosciaAnt`, `gambaAnt` | bacino | Gamba anteriore |
| `cosciaPost`, `gambaPost` | bacino | Gamba posteriore |
| `mantello1`, `mantello2` | busto | **Moto secondario** (§3.4), non si anima a mano |

Ogni osso ha: `id`, `padre`, `perno` (punto di rotazione nel sistema del padre), `lunghezza`, `angoloRiposo` e **limiti** `[min, max]`. I limiti impediscono pose anatomicamente impossibili: un validatore li controlla su ogni posa.

**Proporzioni per figura:** ogni figura dichiara fattori di scala per osso. Il Bruto, per esempio, ha busto ×1,3 e braccia ×1,2. Lo scheletro resta lo stesso; cambiano proporzioni e pezzi.

### 2.3 Pezzi e livelli
- Ogni osso porta 0..n **pezzi**: tracciati SVG nel sistema locale dell'osso, in `currentColor` su `--inchiostro`, nello stile della direzione A Xilografia (UI_SPEC §6).
- **Ordine dei livelli** di profilo: arti posteriori dietro al busto, arti anteriori davanti. Ogni figura dichiara un ordine di base; una posa può modificarlo (per esempio l'arma dietro la testa nella carica pesante).
- **Giunture:** i pezzi si sovrappongono alle giunture (maniche, gambali, mantello) come da §1.6.

### 2.4 Piedi ancorati
Il difetto più riconoscibile di un'animazione amatoriale sono i **piedi che scivolano**. Quando il bacino si abbassa o si sposta senza un passo, le gambe si risolvono con una **cinematica inversa a due ossa**, e i piedi restano dove sono. Durante un passo il piede si stacca e si riappoggia secondo i segnali della §3.3.

---

## 3. Pose e animazioni (dati)
Pose e animazioni sono **dati JSON**, mai codice. Il motore è nostro: piccolo, senza dipendenze esterne, con le funzioni di interpolazione pure e quindi testabili.

### 3.1 Posa
```ts
interface Posa {
  id: string;                              // es. 'viandante.guardia'
  radice: { x: number; y: number; rot: number };
  ossa: Record<string, number>;            // angoli in gradi, solo quelli diversi dal riposo
  livelli?: string[];                      // ordine dei livelli, se diverso da quello di base
  appoggi?: { ant: boolean; post: boolean }; // piedi ancorati (§2.4)
}
```
Le pose delle 4 posture traducono in angoli la tabella di §1.2.

### 3.2 Animazione
```ts
interface Animazione {
  id: string;                    // es. 'viandante.assalto.colpo'
  durata: number;                // ms a velocità 1×
  ciclo: boolean;                // true per riposo e telegrafi
  chiavi: Array<{ t: number;     // 0..1
                  posa: string;  // id di una Posa
                  curva: 'lineare' | 'entrata' | 'uscita' | 'entrataUscita' | 'scatto' }>;
  segnali: Array<{ t: number; tipo: 'impatto' | 'passo' | 'stacco' | 'inchiostro' | 'fine' }>;
}
```
- **`scatto`** è una curva con un leggero superamento del bersaglio (*overshoot*), per l'arrivo dei colpi e l'assestamento.
- Il segnale **`impatto`** è l'istante esatto del contatto: lì compaiono il numero del danno e il lampo, scatta il fermo d'impatto e reagisce il bersaglio.

### 3.3 Livelli di animazione
Tre livelli che si sommano, non di più:
1. **Base:** la posa della postura, con il suo ciclo di riposo.
2. **Azione:** l'animazione di un momento (colpo, parata, transizione), che prevale sulla base mentre dura.
3. **Additivo:** respiro e tremiti. Il **respiro** è un'oscillazione di busto e testa la cui ampiezza e frequenza dipendono dal fiato (§1.3: fiato basso → più ampio e rapido; fiato zero → spalle cadute).

### 3.4 Moto secondario
Mantello e punta dell'arma seguono il movimento con una **molla smorzata** (rigidità e smorzamento nei dati). Non si animano a mano: danno inerzia e continuità senza costo di produzione.

### 3.5 Tempi
| Elemento | Valore |
|---|---|
| Transizione di postura | 250–350 ms |
| Un colpo (anticipazione → impatto → ritorno) | 400–700 ms |
| Fermo d'impatto | 80 ms (120 ms con vantaggio) |
| **Risoluzione di un turno intero** | **≤ 1,6 s** a velocità 1× |
| Telegrafi | Ritmi di §1.4 |
| Velocità | 1×, 1,5×, 2× (opzione del giocatore) |
| **Tocco durante la risoluzione** | Salta alla fine: tutte le battute applicate, numeri compresi |

---

## 4. Contratto con la logica: dagli eventi alle battute
**Principio:** l'animazione non decide niente. È una funzione **pura** dello stato e degli eventi del risolutore. Così non può mai mostrare un esito diverso da quello calcolato (§1.5), e l'Audit lo può verificare.

### 4.1 Funzione
`toScena(statoPrima, eventi, statoDopo, opzioni) → Scena` vive in `src/core/scena.ts`: è pura e senza DOM, come `view.ts`. `DuelView` riceve il campo `scena: Scena`. Il renderer in `src/ui/scena/` la disegna e non contiene regole di gioco.

### 4.2 Forma
```ts
interface Scena {
  giocatore: FiguraView;
  nemico: FiguraView;
  battute: Battuta[];           // in ordine di risoluzione
}
interface FiguraView {
  figura: string;               // 'viandante', 'bruto', …
  postura: Archetipo;           // posa di base
  passo: number;                // posizione in passi: 0 base, +1 avanti, −1 e −2 indietro (spazio alle spalle)
  stati: { vantaggio: boolean; preparato: boolean; fiato: 'pieno' | 'basso' | 'zero'; spalle: boolean };
  telegrafo?: Categoria | string; // solo nemico, in fase di scelta: la categoria (o l'id della mossa con hint completi)
}
interface Battuta {
  gruppo: number;               // battute con lo stesso gruppo sono simultanee (Indes)
  attore: 'giocatore' | 'nemico';
  azione: string;               // id dell'animazione (§5.3)
  bersaglio?: 'giocatore' | 'nemico';
  esito?: 'segno' | 'parato' | 'schivato' | 'evitato' | 'interrotto' | 'punta' | 'arresto' | 'rotta';
  danno?: number;
  testo?: string;               // la riga del registro corrispondente
}
```

### 4.3 Dagli eventi alle battute
| Evento del risolutore | Battute |
|---|---|
| Cambio di postura | Transizione verso la nuova posa (cambio gratuito: scatto in avanti) |
| Colpo (qualunque esito) | Azione dell'attaccante più reazione del bersaglio, **sincronizzate sul segnale `impatto`** |
| Colpi simultanei | Stesso `gruppo`: le due esecuzioni partono insieme |
| Interruzione | L'azione della vittima parte e si spezza a metà carica |
| Contrattacco, Punta, Arresto | Battuta che segue subito quella del colpo che li ha provocati |
| Incalza | L'attaccante avanza di mezzo passo; chi è in Distanza scala il `passo` |
| Preparato, preparazione rotta | Inchiostro che converge o si disperde |
| Cambio di fase | Animazione dedicata del boss, poi le nuove pose |
| Fine del duello | Pose finali (a terra, vittoria) senza ciclo |

### 4.4 Verifiche per l'Audit (nuovo controllo A11)
- Per ogni turno, l'esito e il danno di ogni battuta coincidono con gli eventi del risolutore.
- Il telegrafo in modalità normale dipende **solo** dalla categoria: due mosse della stessa categoria e dello stesso nemico danno la stessa `FiguraView`.
- Stesso ingresso, stessa `Scena`: determinismo.

---

## 5. Prototipo di animazione (laboratorio)
Prima di produrre una sessantina di animazioni, un prototipo **isolato** verifica che tecnica, stile e tempi convincano.

### 5.1 Contenuto
- **Figure:** il viandante e il Bruto, con pezzi definitivi nella direzione A Xilografia.
- **Pose statiche:** le **4 posture del viandante** (sono solo dati) e i **3 telegrafi del Bruto** (pesante, difesa con *Incassare*, preparazione).
- **6 animazioni:**
  1. viandante, **riposo** in Guardia con respiro (ciclo);
  2. viandante, **transizione** Attesa → Guardia;
  3. viandante, **Assalto** (anticipazione, colpo, impatto, ritorno);
  4. viandante, **parata** di un colpo pesante;
  5. viandante, **colpito** (reazione al danno);
  6. Bruto, **telegrafo pesante** (ciclo) e **Maglio** (esecuzione).
- **Sequenza dimostrativa:** il Bruto telegrafa, il viandante passa in Guardia, Maglio, parata, impatto, numero del danno. È la catena completa dagli eventi alle battute, con eventi scritti a mano.

### 5.2 Pagina del laboratorio
Una pagina sola, pubblicata come **pagina privata Claude** e progettata per S23 (360×780):
- **Palco in alto** (circa 360×300): fondale semplice, terreno, segno dello spazio alle spalle.
- **Comandi:**
  - scelta di figura e animazione;
  - riproduci e pausa;
  - velocità 0,25×, 0,5× e 1×;
  - **cursore temporale**;
  - ciclo sì o no.
- **Interruttori di verifica:**
  - **scheletro visibile**;
  - **modalità sagoma**: riempimento nero pieno, per la prova di §1.7;
  - **tempo per fotogramma** a schermo.
- **Quiz delle sagome:** 8 domande con le pose statiche in ordine casuale, senza etichette. È il criterio §1.7.1 applicato alle posture.

### 5.3 Organizzazione dei file
- `design/scena-lab/`: proprietà della sessione Grafica.
  - `src/`: motore, renderer e pagina in TypeScript, con le stesse regole di sintassi del progetto;
  - `dati/`: `scheletro.json`, `figure/*.json`, `pose.json`, `animazioni.json`;
  - `pezzi/`: SVG per figura e per osso.
- **Build:** con l'`esbuild` del progetto si produce `design/scena-lab/dist/lab.html`, un file singolo.
- Il motore è scritto **per essere spostato in seguito** in `src/ui/scena/` dalla sessione Codice (passo E2): funzioni pure, nessuna variabile globale.

### 5.4 Criteri di accettazione
1. **Fluidità:** nessuno scatto visibile su S23; logica e disegno sotto gli **8 ms per fotogramma** (misurati con l'interruttore).
2. **Piedi:** nessuno scivolamento nelle transizioni e nella parata.
3. **Sincronia:** numero del danno, lampo e fermo d'impatto cadono sul segnale `impatto`.
4. **Sagome:** il quiz delle posture dà almeno 7 risposte corrette su 8 e la matrice di distinzione (§1.7.2) è rispettata.
5. **Stile:** palette, pesi e armi secondo UI_SPEC §6; niente volti (§1.6).
6. **Peso:** `lab.html` sotto i 300 KB.
7. **Revisione dell'utente:** la tecnica convince? Sì → produzione (passo E2). No → si corregge la strada.

### 5.5 Chi e quando
- **Sessione Grafica**, sul modello principale (lavoro di design), avviata dopo il trasloco della copia di lavoro (ROADMAP, passo 0).
- Per la regola di un solo lavoro pesante alla volta, parte quando l'Audit (passo B) ha chiuso, oppure in parallelo al playtest (passo D).
