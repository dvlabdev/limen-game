# Simboli del duello: specifica UI

> **Versione:** 1.1 (15 ottobre 2026) · **Proprietario:** Grafica/UI · **Destinatari:** Planning (approvazione delle estensioni), Codice (integrazione)
> **Prerequisiti:** [DESIGN.md](../DESIGN.md) §5, §8 e §8.1, [ARENA_SPEC.md](ARENA_SPEC.md) §3, §7 e §8, [CLAUDE.md](../CLAUDE.md).
> **Direzione scelta dall'utente:** A, **Xilografia**, con gli **stati nel bollino tondo** (dalla direzione C).
> **Novità della 1.1:** scena a tutto schermo con l'interfaccia integrata e ventaglio di medaglioni delle posture (DESIGN §8.1, commit b84c95d); misure sul dispositivo di riferimento S23 (CLAUDE.md).

| Risorsa | Dove |
|---|---|
| Sorgente unica dei disegni | `design/genera.mjs` (`node design/genera.mjs` rigenera tutto) |
| Un SVG per id | `design/icons/<id>.svg` |
| Modulo pronto per `src/ui/symbols.ts` | `design/symbols.proposed.ts` |
| Catalogo di verifica | `design/catalogo.html` · [Artifact](https://claude.ai/artifact/PM9R7nCVicu1zkRpDJu5Js) |
| Confronto delle tre direzioni | `design/direzioni.html` · [Artifact](https://claude.ai/artifact/8CkkTCYkUpcveiAYn9G5kw) |

---

## 1. Principi

Il duello si vince **leggendo l'hint e decidendo in pochi secondi**, col tocco, su schermi da 360 px. Da qui cinque principi.

1. **La forma basta.** Ogni simbolo si riconosce dalla sola silhouette, senza colore e senza testo. Il colore rafforza, non informa: il gioco deve funzionare per chi non distingue i colori (prova in scala di grigi nel catalogo).
2. **Pochi segni, molto diversi.** Le quattro posture hanno quattro sagome che non si somigliano (diagonale, chiusa, curva, orizzontale). È la lezione dell'araldica: figure semplici e marcate che si leggono da lontano.
3. **Una forma per ogni tipo di intenzione.** Come gli *intent* di Slay the Spire, ogni categoria dell'hint ha una sagoma propria; i numeri compaiono solo dove servono (danni, costi).
4. **Leggibile al primo sguardo, approfondibile al secondo.** Come in Into the Breach, il primo sguardo coglie la categoria, il secondo i dettagli (modificatori dell'hint completo, anteprima dei danni).
5. **Il simbolo insegna la regola.** Ogni postura mostra la sua *reazione* (spada: nessuna; scudo: parata; arco che aggira il colpo: schivata e contrattacco; frecce che si allontanano: evita i colpi corti). Se il giocatore ricorda il disegno, ricorda la regola.

**Riferimenti studiati, senza copiarne i disegni:**
- gli intent di Slay the Spire: una forma per tipo, numeri solo dove servono;
- Into the Breach: lettura a colpo d'occhio di tutto ciò che il nemico farà;
- Darkest Dungeon: estetica da xilografia e manoscritto, palette spenta con il rosso del sangue;
- Inscryption: icone al posto del testo quando lo stile rende il testo difficile;
- le partizioni e le figure dell'araldica: poche forme geometriche, contrasto forte.

---

## 2. Grammatica visiva

### 2.1 Famiglie
| Famiglia | Prefisso | Forma di base | Dove compare | Taglia tipica |
|---|---|---|---|---|
| **Posture** | `posture.` | Sagoma libera, una silhouette per postura | HUD (postura del nemico), registro, variante classica | 16 px; 28 px nella griglia classica |
| **Medaglioni** *(proposta)* | `posture.*.medaglione` | **Anello** con il segno della postura in positivo | Ventaglio dietro il viandante | 52 px (min 44, bersaglio del tocco) |
| **Intenzioni** | `intent.` | Sagoma libera; gli attacchi puntano in basso | Sopra la testa del nemico | 44 px |
| **Stati** | `stato.` | **Bollino**: disco pieno con filetto inciso, segno ritagliato | HUD, accanto al nome | 16 px |
| **Risorse** | `risorsa.` | Sagoma libera, sempre accanto a un numero o a pallini | HUD: barra del vigore, pallini del fiato | 10–12 px |
| **Eventi** | `evento.` | Sagoma semplice, senza tagli | Cassetto del registro; testo nel punto del colpo | 16 px |
| **Modificatori** *(proposta)* | `mod.` | Sagoma piena minima | Sotto il simbolo dell'hint, solo con `hintCompleti` | 16 px |

### 2.2 Regole che valgono per tutto il set
- **Direzione: giù è subìto, su è inflitto.** Ciò che il nemico ti scaglia contro punta **in basso**: `intent.pesante`, `intent.leggero`, gli eventi con freccia. Ciò che porti tu punta **in alto**: `posture.assalto`, `evento.contrattacco`. L'anteprima usa la stessa convenzione: ↓ subito, ↑ inflitto. Nella scena di profilo è una convenzione del segno, non dello spazio: i colpi delle figure viaggiano in orizzontale (§6).
- **Massa = forza.** Pesante è una massa larga (il maglio), leggero una sagoma sottile (il pugnale).
- **Disco pieno = stato.** Solo gli stati stanno nel bollino: si leggono come condizioni, mai come azioni.
- **Anello = scelta.** I medaglioni del ventaglio sono anelli vuoti con il segno in positivo; in grigio si distinguono subito dal disco pieno degli stati. Doppio anello vuol dire selezionato, anello spesso vuol dire confermato.
- **Nucleo.** Il rombo è la concentrazione: **converge** in `intent.preparazione`, **irradia** in `stato.preparato`, si **spacca** in `evento.rotta`.
- **Frattura.** La linea a zig-zag con le metà sfalsate significa *rotto o negato*: `mod.sfondaGuardia` (scudo), `evento.interrotto` (freccia), `evento.rotta` (nucleo).
- **Scintilla e vuoto.** La scintilla è l'impatto (`evento.colpo`, `evento.parata`); il tratteggio e lo spazio vuoto sono il colpo che non arriva (`evento.schivata`, `evento.evitato`).
- **Coppie da non confondere,** verificate in grigio:
  - pesante e leggero;
  - parata e sfonda la guardia;
  - interrotto e inarrestabile;
  - preparazione e preparato;
  - difesa e guardia (muro e scudo);
  - medaglione e bollino (anello e disco).

### 2.3 Modificatori componibili dell'hint completo *(proposta)*
Con `hintCompleti`, `hint.dettaglio` porta portata, velocità e `flags`. Sopra il nemico, sotto il simbolo dell'hint, compaiono il nome della mossa, poi una fila di modificatori a 16 px (icone parlanti, con `aria-label`), poi l'intervallo di danno.

| Campo di `dettaglio` | Valore | Id |
|---|---|---|
| `portata` | `corta` / `lunga` | `mod.portata.corta` / `mod.portata.lunga` |
| `velocita` | `rapido` / `normale` / `lento` | `mod.velocita.rapido` / `mod.velocita.normale` / `mod.velocita.lento` |
| `flags` | `sfondaGuardia` | `mod.sfondaGuardia` |
| `flags` | `inarrestabile` | `mod.inarrestabile` |
| `forza` | solo se la categoria è `difesa` e la mossa attacca (es. Parata del Duellante) | `intent.leggero` / `intent.pesante` a 16 px |

Ordine fisso nella fila: portata, velocità, tratti (`flags`), poi il danno. La regola di costruzione è `mod.portata.${portata}`, `mod.velocita.${velocita}`, `mod.${flag}`: **non serve cambiare `DuelView`**.

---

## 3. Griglia e costruzione
- **viewBox `0 0 24 24`**, area sicura **2–22**. Ne escono soltanto il bordo del bollino e del medaglione (r 11,5) e le due metà della frattura (fino a 1,8–22,2).
- **Riempimenti, non contorni.** Le sagome sono piene in `currentColor`. I pochi tratti (linee di velocità, arco dell'Attesa, linee del fiato) hanno spessore 1,6–3,2 e terminazione netta.
- **Spigoli sfaccettati.** Niente raccordi morbidi: le curve sono spezzate in faccette, come un intaglio nel legno. Uniche curve vere: arco dell'Attesa, fiato, cerchi.
- **Tagli di sgorbia.** Linee bianche di 0,7–0,8 unità, ricavate con `fill-rule="evenodd"`: il filo dello scudo, la sgusciatura della lama, le fasce del maglio, i giunti del muro. Sotto i 24 px si usa la **variante piccola senza tagli** (`piccolo`), che resta una silhouette pulita.
- **Bollino (stati):** disco r 10,5, filetto ritagliato tra r 9 e r 8,3, segno ritagliato in scala 0,58. È un solo tracciato `evenodd`: niente `mask` né id, quindi si può ripetere nella pagina senza conflitti.
- **Medaglione (posture del ventaglio):** il segno della postura è in positivo, al centro.

  | Stato | Anello | Filetto interno | Scala del segno |
  |---|---|---|---|
  | Riposo | r 11,5–10,4 | nessuno | 0,62 |
  | Selezionato | r 11,5–10,4 | r 9,4–8,8 | 0,62 |
  | Confermato | r 11,5–9,2 | r 8,4–7,9 | 0,56 |

  Il fondo carta dentro l'anello lo dà il contenitore (`border-radius: 50%; background: var(--carta)`), così il medaglione resta in `currentColor` e copre la scena dietro di sé.
- **Solo `currentColor`.** Nessun colore, font o immagine dentro gli SVG. Il colore si decide nel CSS del contenitore.
- **Taglia minima:** la colonna "Min" della §7 è la taglia sotto cui il simbolo smette di leggersi.

---

## 4. Palette
Inchiostro, carta e un solo colore di pericolo. Nessun altro accento.

| Token | Chiaro | Scuro | Uso |
|---|---|---|---|
| `--carta` | `#e9e2d3` | `#141210` | Fondo delle pagine, interno dei medaglioni, cassetto, cartiglio |
| `--carta-2` | `#ddd4c1` | `#1f1b17` | Fondo della scena |
| `--inchiostro` | `#1c1915` | `#e4d9c4` | Figure, testo e simboli |
| `--seppia` | `#685c4d` | `#a39682` | Testo secondario, guida del ventaglio, contatore dei turni |
| `--filo` | `#c2b69e` | `#3b342b` | Linee, bordi, quinta del fondale |
| `--pericolo` | `#a1311f` | `#e2654b` | Intenzioni d'attacco, danni, `evento.colpo`, frecce ↓ e ↑ dell'anteprima |

- Contrasto di `--pericolo` su `--carta`: circa 5,5:1 in entrambi i temi (AA per il testo).
- **Il rosso marca solo ciò che fa male:** `intent.pesante`, `intent.leggero`, i modificatori sotto un hint d'attacco, i danni, `evento.colpo`. `intent.difesa` e `intent.preparazione` restano in inchiostro.
- Il tema scuro non è un'inversione: la carta diventa inchiostro bruciato e l'inchiostro diventa osso; il rosso si schiarisce per mantenere il contrasto.
- **Proposta:** l'attuale `styles.css` usa anche `--accento` (oro), `--ok` (verde) e `--fiato` (azzurro). In questa palette non servono, perché vantaggio e fiato si leggono dalla forma. Da decidere con Planning al momento dell'integrazione degli stili.
- **Fiato a zero** (niente reazioni, danni ×1,25): tutti i pallini vuoti e `risorsa.fiato` in `--pericolo` con l'etichetta "Senza fiato". Nessun id nuovo.
- Nel gioco **niente font esterni** (il file HTML è autosufficiente): pila di sistema con serif per i nomi e sans per il resto. I font del catalogo servono solo al catalogo.

---

## 5. Scena del duello (DESIGN §8.1)
Telefono sempre in verticale. La scena occupa tutto lo schermo e l'interfaccia vive dentro di essa. I personaggi sono di profilo, uno di fronte all'altro: il viandante a sinistra, il nemico a destra. Fino alla fase delle marionette, i mockup usano **sagome segnaposto**.

### 5.1 Composizione su S23: 360 × 700 px utili
Il dispositivo di riferimento è il Samsung Galaxy S23 (CLAUDE.md): viewport 360 × 780, circa 700 px utili nell'app Claude. Le coordinate sono quelle del mockup del catalogo, con origine in alto a sinistra. Sono un riferimento per `SCENA_SPEC.md`, non pixel obbligatori. Le figure sono alte circa 120 px, come chiede SCENA_SPEC.

| Elemento | Posizione | Note |
|---|---|---|
| Contatore dei turni | in alto a sinistra, y 12 | Testo seppia |
| **HUD del viandante** | centrato su x 130, y 230–276, largo 128 | Nome e bollini degli stati, vigore (cuore e barra), pallini del fiato |
| **HUD del nemico** | centrato su x 280, y 230–276, largo 128 | Come sopra, con il bollino `stato.fase2` per il boss |
| **Hint** | sopra la testa del nemico (x 275); il blocco cresce verso l'alto dalla y 411, fino a y 311 con l'hint completo | §5.3 |
| **Cartiglio dell'anteprima** | x 8, y 288: sempre nello stesso punto, sopra il ventaglio | Postura selezionata, ↓ subito e ↑ inflitto, "Tocca di nuovo per confermare" |
| **Ventaglio** | arco intorno al viandante, §5.2 | Si apre solo nella fase di scelta |
| Figure | terreno a y 560; viandante a x 160, nemico a x 284, scala 1,15 (circa 120 px) | Quinta del fondale dietro, in `--filo`; sopra l'HUD resta cielo libero per il fondale |
| Testo del colpo | nel punto d'impatto, sulla figura colpita | Danno o esito in `--pericolo` con l'icona dell'evento, §5.4 |
| **Cassetto del registro** | in basso, y 656–700 | Chiuso mostra l'ultima riga; si apre con un tocco |

**Verificato a 360 × 780:** nessun elemento si sovrappone a un altro, nessuno esce dallo schermo, niente scroll orizzontale, testi di almeno 12 px, bersagli di almeno 44 px. Nel catalogo il mockup occupa l'intera larghezza dello schermo del telefono, quindi su un S23 si vede in scala 1:1.

### 5.2 Ventaglio dei medaglioni
- **Geometria:** arco di centro (160, 491), cioè il busto del viandante, e raggio 124.
- **Ordine, dalla schiena verso il nemico:**

  | Postura | Angolo | Centro (x, y) |
  |---|---|---|
  | Distanza | 205° | (48, 543) |
  | Attesa | 165° | (40, 459) |
  | Guardia | 118° | (102, 382) |
  | Assalto | 75° | (192, 371) |

  Più un medaglione è vicino al nemico, più la postura è aggressiva. Una guida tratteggiata in `--seppia` disegna l'arco.
- **Medaglioni:** 52 px, più di 44 px di bersaglio, con almeno 30 px liberi tra un medaglione e l'altro. Sotto ciascuno c'è un'etichetta con il nome e il costo: pallino pieno e "1" per cambiare, pallino vuoto e "0" per la postura attuale.
- **Stati e interazione:**

  | Stato | Aspetto | Come ci si arriva |
  |---|---|---|
  | Riposo | Anello singolo | Ventaglio aperto, nessuna scelta |
  | Selezionato | Doppio anello, ingrandito a 1,08 | **Primo tocco.** Il cartiglio fisso mostra l'anteprima |
  | Confermato | Anello spesso; gli altri medaglioni scendono al 30% | **Secondo tocco** sullo stesso medaglione. Poi il ventaglio si chiude e parte la risoluzione |
  | Non disponibile | Al 30% e senza risposta al tocco | Cambio non consentito per mancanza di fiato |

  Toccare un altro medaglione sposta la selezione.
- **Mancini (più avanti):** la scena si specchia, ma i segni dentro i medaglioni **non si capovolgono**. Si leggono come lettere.

### 5.3 Hint sopra il nemico
- Il simbolo dell'intenzione (44 px) sta in una **zona riservata sopra la testa del nemico**, accanto alla posa che telegrafa il colpo. Simbolo e posa si leggono insieme.
- Sotto il simbolo c'è il nome della categoria, e con `hintCompleti` quello della mossa. Con `hintCompleti` seguono anche la fila dei modificatori e il danno (§2.3). Il blocco cresce verso l'alto e non deve mai raggiungere l'HUD.
- Nella prima versione della scena (UI_SPEC 1.0, su 560 px utili) l'hint al centro misurava 636 px contro 513 e spingeva fuori la conferma. La collocazione sopra il nemico, ora decisa in DESIGN §8.1, è anche la più compatta.

### 5.4 Danni e registro
- **Danni nel punto del colpo:** un'etichetta breve in `--pericolo` sulla figura colpita, con l'icona dell'evento a 16 px: `evento.colpo` con il numero, oppure `evento.parata`, `evento.evitato` o `evento.schivata` con la parola.
- **Cassetto:** chiuso mostra la maniglia, l'icona e il testo dell'ultimo evento e la scritta "Registro". Aperto mostra lo storico, ogni riga con l'icona dell'evento a 16 px.

### 5.4b Spazio alle spalle e preparato (ARENA_SPEC 1.1) *(proposta, mockup da completare)*
- **Spazio** (`CombattenteView.spazio`, 0–2): sul terreno dietro il viandante, un **paletto di confine** (x 84–89) e **due tacche** (x 98 e 116, alte 7 px). Ogni turno concluso in Distanza svuota una tacca, partendo da quella più vicina al viandante (tacca vuota = rettangolo a filo). Con le marionette il viandante arretrerà davvero di una tacca per turno.
- **Spazio = 2:** bollino `stato.spalle` nell'HUD del viandante; il medaglione della Distanza è spento e porta in alto a destra lo stesso bollino a 20 px come **motivo** (`motivo: 'spazio'`). Con `motivo: 'fiato'` il badge è `risorsa.fiato.vuoto`. Il cambio è gratuito: tutte le etichette mostrano costo 0.
- **Preparato del viandante** (R3): lo stesso bollino `stato.preparato` del nemico, nell'HUD del viandante; l'anteprima del cartiglio include il ×1,5.
- **Eventi** `incalza`, `punta`, `arresto`: come testo nel punto del colpo (§5.4) e nel registro.

### 5.5 Variante classica
Come prevede DESIGN §8.1, nell'arena resta come riferimento e variante A/B la griglia 2×2 sotto la scena con il pulsante Conferma. È il terzo mockup del catalogo: pulsanti con icone a 28 px, anteprima su una riga e targhe sotto le figure.

---

## 6. Vincoli comuni tra icone e figure
Icone e marionette (DESIGN §8.1) sono **lo stesso libro stampato con lo stesso legno**. Questi vincoli valgono per entrambe, e la futura `docs/SCENA_SPEC.md` li deve riprendere.

1. **Palette.** Solo i token della §4. Le figure sono in `--inchiostro` su `--carta-2`; la quinta del fondale è in `--filo`. `--pericolo` marca soltanto la minaccia e l'impatto (il simbolo dell'hint, il lampo del colpo, i numeri del danno), mai un costume o un'arma a riposo. Niente sfumature, ombre morbide, trasparenze decorative o altri colori.
2. **Tecnica.** Masse piene, spigoli sfaccettati, nessun raccordo morbido. I dettagli interni sono **tagli bianchi** (sgorbia) e i volumi sono tratteggi di tagli paralleli, non gradienti.
3. **Pesi in pixel.** A schermo, un taglio misura quanto quello di un'icona a 32 px, cioè circa **1 px**. Le linee sottili delle figure (aste, lame, contorni dei tratteggi) misurano quanto i tratti delle icone, **2–4 px**. Sotto queste soglie i tagli si omettono, come nella variante `piccolo`.
4. **Stesse armi, stesse sagome.** Le armi delle figure ripetono le sagome dei simboli: il maglio di `intent.pesante`, il pugnale di `intent.leggero`, la spada di `posture.assalto`, lo scudo di `posture.guardia`. Così la posa e il simbolo dell'hint fanno rima.
5. **Direzione.** Nella scena i colpi viaggiano in orizzontale: il viandante colpisce verso destra, il nemico verso sinistra. Nei segni vale invece la convenzione verticale della §2.2: giù è subìto, su è inflitto.
6. **`currentColor` e temi.** Le parti delle marionette, come le icone, usano `currentColor` o i token. Così il tema scuro funziona senza ridisegnare: la carta diventa inchiostro bruciato e l'inchiostro diventa osso.
7. **Spazi riservati.** Pose e animazioni non coprono mai:
   - l'HUD sopra ciascun personaggio;
   - la zona dell'hint sopra il nemico;
   - il cartiglio;
   - i medaglioni del ventaglio aperto;
   - il cassetto.

   Le animazioni d'impatto possono passare *dietro* questi elementi, mai sopra.

---

## 7. Elenco dei simboli
"Contratto" vuol dire che l'id è già in ARENA_SPEC §7; "Proposta" che è un'estensione da approvare (§8).
Varianti:
- **T**: il simbolo ha i tagli, quindi esiste la variante `piccolo` sotto i 24 px;
- **R**: di norma è in `--pericolo`;
- **3S**: ha tre stati (riposo, selezionato, confermato).

| Id | Etichetta | Significato e disegno | Varianti | Min | Stato |
|---|---|---|---|---|---|
| `posture.assalto` | Assalto | Spada che punta in alto verso il nemico: attacca, nessuna reazione | T | 20 | Contratto |
| `posture.guardia` | Guardia | Scudo con filo inciso: para | T | 16 | Contratto |
| `posture.attesa` | Attesa | Arco che aggira il colpo (il disco): schiva e contrattacca | | 20 | Contratto |
| `posture.distanza` | Distanza | Frecce che si allontanano dal vuoto centrale: evita i colpi corti | | 16 | Contratto |
| `posture.preparazione` | Preparazione | Solo nemici. Stesso disegno di `intent.preparazione` | | 16 | Contratto |
| `posture.assalto.medaglione` | Assalto | Medaglione del ventaglio: anello e spada | 3S | 44 | Proposta |
| `posture.guardia.medaglione` | Guardia | Medaglione del ventaglio: anello e scudo | 3S | 44 | Proposta |
| `posture.attesa.medaglione` | Attesa | Medaglione del ventaglio: anello e arco | 3S | 44 | Proposta |
| `posture.distanza.medaglione` | Distanza | Medaglione del ventaglio: anello e frecce | 3S | 44 | Proposta |
| `intent.pesante` | Colpo pesante | Maglio che cala in diagonale, testa larga in basso | T, R | 20 | Contratto |
| `intent.leggero` | Colpo leggero | Pugnale che punta in basso, linee di velocità | T, R | 20 | Contratto |
| `intent.difesa` | Difesa | Muro merlato: il nemico si chiude | T | 16 | Contratto |
| `intent.preparazione` | Preparazione | Quattro punte che convergono nel nucleo | | 16 | Contratto |
| `stato.vantaggio` | Vantaggio | Bollino con due gradi in salita | | 16 | Contratto |
| `stato.preparato` | Preparato | Bollino con il nucleo che irradia: prossimo colpo ×1,5 | | 16 | Contratto |
| `stato.fase2` | Seconda fase | Bollino con il numerale II | | 16 | Contratto |
| `stato.spalle` | Spalle al muro | Bollino: la freccia che arretra tocca il muro (ARENA_SPEC §12 R2) | | 16 | Contratto 1.1 |
| `risorsa.vigore` | Vigore | Cuore sfaccettato | T | 12 | Contratto |
| `risorsa.fiato` | Fiato | Tre linee di vento | | 12 | Contratto |
| `risorsa.fiato.pieno` | Fiato disponibile | Pallino pieno | | 8 | Proposta |
| `risorsa.fiato.vuoto` | Fiato speso | Anello | | 8 | Proposta |
| `evento.colpo` | Colpo a segno | Scintilla a otto punte | R | 12 | Contratto |
| `evento.parata` | Parata | Scudo con la scintilla sull'angolo | | 12 | Contratto |
| `evento.schivata` | Schivata | Arco dell'Attesa, il colpo passa a vuoto (tratteggio) | | 12 | Contratto |
| `evento.contrattacco` | Contrattacco | Inversione: scende, gira, torna su verso il nemico | | 12 | Contratto |
| `evento.evitato` | Evitato | La freccia si ferma lontano dalla linea | | 12 | Contratto |
| `evento.interrotto` | Interrotto | Freccia spezzata dalla frattura | | 12 | Contratto |
| `evento.rotta` | Preparazione rotta | Nucleo spaccato in due | | 12 | Contratto |
| `evento.incalza` | Incalza | Freccia piena che spinge una freccia vuota verso le spalle (§12 R1) | | 16 | Contratto 1.1 |
| `evento.punta` | Punta | Lancia della Distanza che punta in alto, con la scintilla (grado 2) | | 12 | Contratto 1.1 |
| `evento.arresto` | Arresto | La stessa lancia sormontata dal grado del vantaggio (grado 3) | | 16 | Contratto 1.1 |
| `mod.portata.corta` | Portata corta | Squadra stretta | R | 16 | Proposta |
| `mod.portata.lunga` | Portata lunga | Squadra larga | R | 16 | Proposta |
| `mod.velocita.rapido` | Rapido | Due punte | R | 16 | Proposta |
| `mod.velocita.normale` | Velocità normale | Una punta | R | 16 | Proposta |
| `mod.velocita.lento` | Lento | Peso da bilancia | R | 16 | Proposta |
| `mod.sfondaGuardia` | Sfonda la guardia | Scudo spaccato dalla frattura | R | 16 | Proposta |
| `mod.inarrestabile` | Inarrestabile | Freccia che passa attraverso la barra spezzata | R | 16 | Proposta |

L'etichetta di `stato.preparato` passa da "Raccolto" (segnaposto) a **"Preparato"**, il termine di ARENA_SPEC.

---

## 8. Estensioni proposte del contratto *(da approvare da Planning)*
Sono **solo id di simboli**, cioè righe in più nella tabella di ARENA_SPEC §7. `DuelView` non cambia: l'interfaccia ricava tutto dai campi che esistono già.

| Id | Ricavato da | Perché |
|---|---|---|
| `posture.<id>.medaglione` (4) | `posture[].simbolo` + `.medaglione` | Il ventaglio di DESIGN §8.1, richiesto da Planning. Gli stati selezionato e confermato sono stato dell'interfaccia, non della logica. |
| `risorsa.fiato.pieno`, `risorsa.fiato.vuoto` | `fiato`, `fiatoMax` | Oggi i pallini ripetono `risorsa.fiato`: un disegno di vento ripetuto sei volte a 12 px non si legge. Pieno e vuoto si distinguono per forma, non per colore. |
| `mod.portata.corta`, `mod.portata.lunga` | `hint.dettaglio.portata` | Mostrare i tratti con `hintCompleti` senza testo lungo (DESIGN §5.1: poco testo). |
| `mod.velocita.rapido`, `mod.velocita.normale`, `mod.velocita.lento` | `hint.dettaglio.velocita` | Come sopra. Rapido batte l'Attesa, lento perde l'iniziativa. |
| `mod.sfondaGuardia`, `mod.inarrestabile` | `hint.dettaglio.flags` | Come sopra; sono i due tratti che cambiano la scelta della postura. |

---

## 9. Integrazione (sessione Codice, coordinata da Planning)
L'integrazione avviene **dopo la consegna dell'arena** (CLAUDE.md). Fino ad allora `src/` non si tocca da qui. La scena con le marionette arriverà con una fase dedicata: per l'arena basta la **variante classica** (§5.5) con i nuovi simboli, più il ventaglio se Planning lo vuole già nell'arena.

1. **Sostituire `src/ui/symbols.ts`** con `design/symbols.proposed.ts`. Il modulo è compatibile: esporta ancora `SIMBOLI`, `simbolo(id)` e il campo `glifo`, quindi il render attuale continua a compilare. In più esporta:
   - `icona(id, { px, classe, parlante })`, che restituisce l'SVG inline;
   - `medaglione(postura, stato, { px, classe, parlante })` per il ventaglio, con `stato` tra `'riposo'`, `'selezionato'` e `'confermato'`.

   Il file è stato verificato con `tsc --strict --erasableSyntaxOnly`.
2. **Usare `icona()` e `medaglione()` in `render.ts`** al posto di `esc(simbolo(id).glifo)`. Le stringhe restituite sono costanti e sicure: **non vanno passate a `esc()`**, altrimenti l'SVG diventa testo.

   | Punto dell'interfaccia | Chiamata |
   |---|---|
   | Hint sopra il nemico | `icona(v.hint.simbolo, { px: 44, parlante: true })`, colore `--pericolo` solo per `pesante` e `leggero` |
   | Modificatori dell'hint (con `dettaglio`) | `icona('mod.…', { px: 16, parlante: true })`, ordine della §2.3 |
   | Medaglioni del ventaglio | `medaglione(p.id, stato, { px: 52, parlante: true })` dentro un `<button>` rotondo con fondo `--carta`; etichetta e costo sotto |
   | Pulsanti della variante classica | `icona(p.simbolo, { px: 28 })`; il nome resta testo visibile; anteprima su una riga, ↓ subito e ↑ inflitto |
   | HUD: stati e fase | `icona(id, { px: 16, parlante: true })` |
   | HUD: vigore e fiato | `icona('risorsa.vigore', { px: 12 })`; pallini `risorsa.fiato.pieno` / `.vuoto` a 10 px (se Planning approva; altrimenti cerchi in CSS) |
   | Registro e testo del colpo | `icona(v.simbolo, { px: 16 })`; `evento.colpo` in `--pericolo` |
3. **CSS minimo:** `.icona { display: inline-block; vertical-align: middle; flex: none; }` e `.medaglione` dentro un contenitore con `border-radius: 50%; background: var(--carta)`. Il colore arriva dal contenitore (`color: var(--pericolo)` sull'hint d'attacco). I token della §4 sostituiscono la palette segnaposto quando Grafica prenderà `styles.css`.
4. **Accessibilità:**
   - le icone accanto a un testo visibile sono decorative (predefinito, `aria-hidden`);
   - l'hint, i modificatori e i bollini sono `parlante: true` (`role="img"` con `aria-label`);
   - i medaglioni sono pulsanti con il nome della postura come nome accessibile e `aria-pressed` per la selezione.
5. **Rigenerare:** ogni modifica ai disegni si fa in `design/genera.mjs`. `node design/genera.mjs` riscrive `design/icons/`, `design/symbols.proposed.ts` e `design/catalogo.html`. `symbols.proposed.ts` non si modifica a mano.
6. **Test suggerito** (di proprietà di Codice): ogni `simbolo` emesso da `toDuelView` esiste in `SIMBOLI`.

---

## 10. Domande per Planning
1. Approvare le estensioni della §8 (ora 13 id, con i 4 medaglioni) e aggiungerle alla tabella di ARENA_SPEC §7?
2. `posture.preparazione` e `intent.preparazione` hanno lo stesso disegno, perché sono la stessa azione vista come postura o come intenzione. Va bene, o si preferisce distinguerle?
3. Palette dell'integrazione: si possono togliere `--accento`, `--ok` e `--fiato` da `styles.css` a favore della palette a un solo colore (§4)?
4. Ventaglio: va bene l'etichetta con nome e costo sotto ogni medaglione? Aiuta a imparare le posture, ma aggiunge testo in scena; più avanti si potrebbe nasconderla.
5. Il ventaglio entra già nell'arena (come variante A/B accanto alla griglia classica) o solo con la fase della scena?
