# Simboli del duello: specifica UI

> **Versione:** 1.0 (15 ottobre 2026) · **Proprietario:** Grafica/UI · **Destinatari:** Planning (approvazione delle estensioni), Codice (integrazione)
> **Prerequisiti:** [DESIGN.md](../DESIGN.md) §5 e §8, [ARENA_SPEC.md](ARENA_SPEC.md) §3, §7 e §8, [CLAUDE.md](../CLAUDE.md).
> **Direzione scelta dall'utente:** A, **Xilografia**, con gli **stati nel bollino tondo** (dalla direzione C).

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

**Riferimenti studiati, senza copiarne i disegni:** gli intent di Slay the Spire (una forma per tipo, numeri solo dove servono); Into the Breach (lettura a colpo d'occhio di tutto ciò che il nemico farà); Darkest Dungeon (estetica da xilografia e manoscritto, palette spenta con il rosso del sangue); Inscryption (icone al posto del testo quando lo stile rende il testo difficile); le partizioni e figure dell'araldica (poche forme geometriche, contrasto forte).

---

## 2. Grammatica visiva

### 2.1 Famiglie
| Famiglia | Prefisso | Forma di base | Dove compare | Taglia tipica |
|---|---|---|---|---|
| **Posture** | `posture.` | Sagoma libera, una silhouette per postura | Pulsanti 2×2, chip della postura | 32 px (pulsanti), 20 px (chip) |
| **Intenzioni** | `intent.` | Sagoma libera; gli attacchi puntano in basso | Hint, al centro | 72–96 px |
| **Stati** | `stato.` | **Bollino**: disco pieno con filetto inciso, segno ritagliato | Accanto al nome del combattente | 20–24 px |
| **Risorse** | `risorsa.` | Sagoma libera, sempre accanto a un numero o a pallini | Barra del vigore, pallini del fiato | 12–16 px |
| **Eventi** | `evento.` | Sagoma semplice, senza tagli | Registro | 16 px |
| **Modificatori** *(proposta)* | `mod.` | Sagoma piena minima | Fila sotto l'hint, solo con `hintCompleti` | 16–20 px |

### 2.2 Regole che valgono per tutto il set
- **Direzione.** Il nemico è in alto, il giocatore in basso. Ciò che il nemico scaglia contro il giocatore punta **in basso** (`intent.pesante`, `intent.leggero`, gli eventi con freccia); ciò che il giocatore scaglia contro il nemico punta **in alto** (`posture.assalto`, `evento.contrattacco`).
- **Massa = forza.** Pesante è una massa larga (il maglio), leggero una sagoma sottile (il pugnale).
- **Bollino = stato.** Solo gli stati stanno nel disco: si leggono come condizioni, mai come azioni.
- **Nucleo.** Il rombo è la concentrazione: **converge** in `intent.preparazione`, **irradia** in `stato.preparato`, si **spacca** in `evento.rotta`.
- **Frattura.** La linea a zig-zag con le metà sfalsate significa *rotto o negato*: `mod.sfondaGuardia` (scudo), `evento.interrotto` (freccia), `evento.rotta` (nucleo).
- **Scintilla e vuoto.** La scintilla è l'impatto (`evento.colpo`, `evento.parata`); il tratteggio e lo spazio vuoto sono il colpo che non arriva (`evento.schivata`, `evento.evitato`).
- **Coppie da non confondere,** verificate in grigio: pesante e leggero, parata e sfonda la guardia, interrotto e inarrestabile, preparazione e preparato, difesa e guardia (muro e scudo).

### 2.3 Modificatori componibili dell'hint completo *(proposta)*
Con `hintCompleti`, `hint.dettaglio` porta portata, velocità e `flags`. Sotto il simbolo grande dell'hint compare una fila di modificatori a 18 px, ciascuno con la sua etichetta breve, poi l'intervallo di danno.

| Campo di `dettaglio` | Valore | Id |
|---|---|---|
| `portata` | `corta` / `lunga` | `mod.portata.corta` / `mod.portata.lunga` |
| `velocita` | `rapido` / `normale` / `lento` | `mod.velocita.rapido` / `mod.velocita.normale` / `mod.velocita.lento` |
| `flags` | `sfondaGuardia` | `mod.sfondaGuardia` |
| `flags` | `inarrestabile` | `mod.inarrestabile` |
| `forza` | solo se la categoria è `difesa` e la mossa attacca (es. Parata del Duellante) | `intent.leggero` / `intent.pesante` a 18 px |

Ordine fisso nella fila: portata, velocità, tratti (`flags`), poi il danno. La regola di costruzione è `mod.portata.${portata}`, `mod.velocita.${velocita}`, `mod.${flag}`: **non serve cambiare `DuelView`**.

---

## 3. Griglia e costruzione
- **viewBox `0 0 24 24`**, area sicura **2–22**: nessuna forma ne esce, salvo la punta del bollino e due metà della frattura (fino a 1,8–22,2).
- **Riempimenti, non contorni.** Le sagome sono piene in `currentColor`. I pochi tratti (linee di velocità, arco dell'Attesa, linee del fiato) hanno spessore 1,6–3,2 e terminazione netta.
- **Spigoli sfaccettati.** Niente raccordi morbidi: le curve sono spezzate in faccette, come un intaglio nel legno. Uniche curve vere: arco dell'Attesa, fiato, cerchi.
- **Tagli di sgorbia.** Linee bianche di 0,7–0,8 unità ricavate con `fill-rule="evenodd"` (il filo dello scudo, la sgusciatura della lama, le fasce del maglio, i giunti del muro). Sotto i 24 px si usa la **variante piccola senza tagli** (`piccolo`), che resta una silhouette pulita.
- **Bollino:** disco r 10,5, filetto ritagliato tra r 9 e r 8,3, segno ritagliato in scala 0,58. È un solo tracciato `evenodd`: niente `mask` né id, quindi si può ripetere nella pagina senza conflitti.
- **Solo `currentColor`.** Nessun colore, font o immagine dentro gli SVG. Il colore si decide nel CSS del contenitore.
- **Taglia minima:** la colonna "Min" della §5 è la taglia sotto cui il simbolo smette di leggersi.

---

## 4. Palette
Inchiostro, carta e un solo colore di pericolo. Nessun altro accento.

| Token | Chiaro | Scuro | Uso |
|---|---|---|---|
| `--carta` | `#e9e2d3` | `#141210` | Fondo |
| `--carta-2` | `#ddd4c1` | `#1f1b17` | Fondo dell'hint, pannelli |
| `--inchiostro` | `#1c1915` | `#e4d9c4` | Testo e simboli |
| `--seppia` | `#685c4d` | `#a39682` | Testo secondario, costi, registro passato |
| `--filo` | `#c2b69e` | `#3b342b` | Linee e bordi |
| `--pericolo` | `#a1311f` | `#e2654b` | Intenzioni d'attacco, danni, `evento.colpo`, pulsante Conferma |

- Contrasto di `--pericolo` su `--carta`: circa 5,5:1 in entrambi i temi (AA per il testo).
- **Il rosso marca solo ciò che fa male:** `intent.pesante`, `intent.leggero`, i modificatori sotto un hint d'attacco, i danni, `evento.colpo`. `intent.difesa` e `intent.preparazione` restano in inchiostro.
- Il tema scuro non è un'inversione: la carta diventa inchiostro bruciato e l'inchiostro diventa osso; il rosso si schiarisce per mantenere il contrasto.
- **Proposta:** l'attuale `styles.css` usa anche `--accento` (oro), `--ok` (verde) e `--fiato` (azzurro). In questa palette non servono: vantaggio e fiato si leggono dalla forma. Da decidere con Planning al momento dell'integrazione degli stili.
- **Fiato a zero** (niente reazioni, danni ×1,25): tutti i pallini vuoti e `risorsa.fiato` in `--pericolo` con l'etichetta "Senza fiato". Nessun id nuovo.
- Nel gioco **niente font esterni** (il file HTML è autosufficiente): pila di sistema con serif per i nomi e sans per il resto. I font del catalogo servono solo al catalogo.

---

## 5. Elenco dei simboli
"Contratto" = id già in ARENA_SPEC §7. "Proposta" = estensione da approvare (§6). Varianti: **T** = ha i tagli, quindi esiste la variante `piccolo` sotto i 24 px; **R** = di norma in `--pericolo`.

| Id | Etichetta | Significato e disegno | Varianti | Min | Stato |
|---|---|---|---|---|---|
| `posture.assalto` | Assalto | Spada che punta in alto verso il nemico: attacca, nessuna reazione | T | 20 | Contratto |
| `posture.guardia` | Guardia | Scudo con filo inciso: para | T | 16 | Contratto |
| `posture.attesa` | Attesa | Arco che aggira il colpo (il disco): schiva e contrattacca | | 20 | Contratto |
| `posture.distanza` | Distanza | Frecce che si allontanano dal vuoto centrale: evita i colpi corti | | 16 | Contratto |
| `posture.preparazione` | Preparazione | Solo nemici. Stesso disegno di `intent.preparazione` | | 16 | Contratto |
| `intent.pesante` | Colpo pesante | Maglio che cala in diagonale, testa larga in basso | T, R | 20 | Contratto |
| `intent.leggero` | Colpo leggero | Pugnale che punta in basso, linee di velocità | T, R | 20 | Contratto |
| `intent.difesa` | Difesa | Muro merlato: il nemico si chiude | T | 16 | Contratto |
| `intent.preparazione` | Preparazione | Quattro punte che convergono nel nucleo | | 16 | Contratto |
| `stato.vantaggio` | Vantaggio | Bollino con due gradi in salita | | 16 | Contratto |
| `stato.preparato` | Preparato | Bollino con il nucleo che irradia: prossimo colpo ×1,5 | | 16 | Contratto |
| `stato.fase2` | Seconda fase | Bollino con il numerale II | | 16 | Contratto |
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
| `mod.portata.corta` | Portata corta | Squadra stretta | R | 16 | Proposta |
| `mod.portata.lunga` | Portata lunga | Squadra larga | R | 16 | Proposta |
| `mod.velocita.rapido` | Rapido | Due punte | R | 16 | Proposta |
| `mod.velocita.normale` | Velocità normale | Una punta | R | 16 | Proposta |
| `mod.velocita.lento` | Lento | Peso da bilancia | R | 16 | Proposta |
| `mod.sfondaGuardia` | Sfonda la guardia | Scudo spaccato dalla frattura | R | 16 | Proposta |
| `mod.inarrestabile` | Inarrestabile | Freccia che passa attraverso la barra spezzata | R | 16 | Proposta |

L'etichetta di `stato.preparato` passa da "Raccolto" (segnaposto) a **"Preparato"**, il termine di ARENA_SPEC.

---

## 6. Estensioni proposte del contratto *(da approvare da Planning)*
Sono **solo id di simboli**, cioè righe in più nella tabella di ARENA_SPEC §7. `DuelView` non cambia: l'interfaccia ricava tutto dai campi che esistono già.

| Id | Ricavato da | Perché |
|---|---|---|
| `risorsa.fiato.pieno`, `risorsa.fiato.vuoto` | `fiato`, `fiatoMax` | Oggi i pallini ripetono `risorsa.fiato`: un disegno di vento ripetuto sei volte a 12 px non si legge. Pieno e vuoto si distinguono per forma, non per colore. |
| `mod.portata.corta`, `mod.portata.lunga` | `hint.dettaglio.portata` | Mostrare i tratti con `hintCompleti` senza testo lungo (DESIGN §5.1: poco testo). |
| `mod.velocita.rapido`, `mod.velocita.normale`, `mod.velocita.lento` | `hint.dettaglio.velocita` | Come sopra. Rapido batte l'Attesa, lento perde l'iniziativa. |
| `mod.sfondaGuardia`, `mod.inarrestabile` | `hint.dettaglio.flags` | Come sopra; sono i due tratti che cambiano la scelta della postura. |

---

## 7. Integrazione (sessione Codice, coordinata da Planning)
L'integrazione avviene **dopo la consegna dell'arena** (CLAUDE.md). Fino ad allora `src/` non si tocca da qui.

1. **Sostituire `src/ui/symbols.ts`** con `design/symbols.proposed.ts`. Il modulo è compatibile: esporta ancora `SIMBOLI`, `simbolo(id)` e il campo `glifo`, quindi il render attuale continua a compilare. In più esporta `icona(id, { px, classe, parlante })`, che restituisce l'SVG inline. Il file è stato verificato con `tsc --strict --erasableSyntaxOnly`.
2. **Usare `icona()` in `render.ts`** al posto di `esc(simbolo(id).glifo)`. La stringa restituita è costante e sicura: **non va passata a `esc()`**, altrimenti l'SVG diventa testo.

   | Punto di `render.ts` | Chiamata |
   |---|---|
   | Hint | `icona(v.hint.simbolo, { px: 88, parlante: true })`; colore `--pericolo` solo per `pesante` e `leggero` |
   | Modificatori dell'hint (con `dettaglio`) | `icona('mod.…', { px: 18 })` più l'etichetta breve, ordine della §2.3 |
   | Pulsanti di postura | `icona(p.simbolo, { px: 32 })`; il nome resta testo visibile |
   | Chip della postura e degli stati | `icona(id, { px: 20 })` |
   | Fase del boss | `icona('stato.fase2', { px: 20 })` |
   | Registro | `icona(v.simbolo, { px: 16 })`; `evento.colpo` in `--pericolo` |
   | Vigore | `icona('risorsa.vigore', { px: 16 })` |
   | Pallini del fiato | `risorsa.fiato` a 16 px, poi `risorsa.fiato.pieno` / `.vuoto` a 12 px (se Planning approva; altrimenti cerchi in CSS) |
3. **CSS minimo:** `.icona { display: inline-block; vertical-align: middle; flex: none; }`. Il colore arriva dal contenitore (`color: var(--pericolo)` sull'hint d'attacco). I token della §4 sostituiscono la palette segnaposto quando Grafica prenderà `styles.css`.
4. **Accessibilità:** le icone accanto a un testo visibile sono decorative (predefinito, `aria-hidden`). L'icona dell'hint è `parlante: true` (`role="img"` con `aria-label`). I pulsanti mantengono il nome della postura come testo.
5. **Rigenerare:** ogni modifica ai disegni si fa in `design/genera.mjs`; `node design/genera.mjs` riscrive `design/icons/`, `design/symbols.proposed.ts` e `design/catalogo.html`. `symbols.proposed.ts` non si modifica a mano.
6. **Test suggerito** (di proprietà di Codice): ogni `simbolo` emesso da `toDuelView` esiste in `SIMBOLI`.

---

## 8. Domande per Planning
1. Approvare le estensioni della §6 e aggiungerle alla tabella di ARENA_SPEC §7?
2. `posture.preparazione` e `intent.preparazione` hanno lo stesso disegno, perché sono la stessa azione vista come postura o come intenzione. Va bene, o si preferisce distinguerle?
3. Palette dell'integrazione: si possono togliere `--accento`, `--ok` e `--fiato` da `styles.css` a favore della palette a un solo colore (§4)?
