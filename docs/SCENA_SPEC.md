# Scena del duello: specifica

> **Versione:** 0.2, bozza da rivedere (15 ottobre 2026): §1 allineata al modello delle posture (DESIGN §5.2) e ad ARENA_SPEC 1.1 · **Proprietario:** Planning
> **Stato:** è scritta solo la §1 (linguaggio delle pose). Le parti su rig, animazioni, contratto `DuelView.scena` e laboratorio arriveranno dopo l'approvazione della §1.
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
