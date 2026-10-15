# Stile visivo: ricerca di mercato e tre alternative

> **Data:** 15 ottobre 2026 · **Proprietario:** Planning · **Stato:** proposta da valutare **a demo finita** (ROADMAP, dopo il passo D)
> **Tavole visive:** [Limen · Tavole di stile](https://claude.ai/artifact/PovX88CHteUZFKYA3FXuWa), pagina privata pensata per l'S23 (sorgente: `docs/ricerca/tavole-stile.html`).
> **Parte da:** DESIGN §1 e §8, UI_SPEC §2–§6 (direzione A Xilografia, già in uso), SCENA_SPEC §1–§2, CLAUDE.md (S23, file singolo).

## 0. Scopo
Il gioco oggi usa una palette di base (inchiostro, carta, un rosso) e i font di sistema. Prima di produrre marionette, scene e interfacce definitive conviene scegliere **un'identità visiva completa**: caratteri, colori, stile dell'interfaccia e trattamento della scena. Questo documento:
1. analizza cosa fa il mercato (Steam) nel genere;
2. ne ricava gli schemi ricorrenti e gli spazi liberi;
3. propone **tre alternative complete**, confrontabili tra loro;
4. spiega **come valutarle nella demo**, con un interruttore di tema invece che a parole.

---

## 1. Ricerca di mercato

### 1.1 Riferimenti analizzati
| Gioco | Genere | Linguaggio visivo | Tipografia e UI | Cosa ci insegna |
|---|---|---|---|---|
| **Darkest Dungeon** (Red Hook) | Roguelite gotico a turni | Inchiostro a pennino, alto contrasto, influenza di Mignola. Palette calda: niente grigi morti, il nero solo negli inchiostri, i freddi ingialliti come pergamena. Un po' di "tenerezza" nei personaggi per non schiacciare il giocatore. | UI pesante e materica | **Il buio funziona se resta caldo.** È esattamente il nostro pilastro "il buio accanto al calore". |
| **Pentiment** (Obsidian) | Avventura narrativa | Manoscritti miniati e xilografie del Cinquecento: mostra il passaggio dal libro dipinto a mano alla stampa | Caratteri su misura (Lettermatic) che imitano la scrittura a mano, con varianti per ogni lettera | La xilografia può essere un'**identità intera**, non solo un filtro. Però Pentiment è narrativo: la scrittura può essere ornata perché si legge con calma. |
| **Inkulinati** (Yaza) | Strategia a turni | Codice miniato medievale: le unità sono bestie delle marginalia; carattere su misura (Tosche) | Pagina come campo di battaglia | **Un duello a turni in stile manoscritto è già sul mercato** (88% positivo su 522 recensioni): è una prova di interesse ma anche un concorrente diretto per quel linguaggio. |
| **Slay the Spire 1 e 2** (MegaCrit) | Deckbuilder roguelite | Illustrazione semplice, leggibilità prima di tutto | Logo disegnato a mano, testo di gioco semplice; intenzioni nemiche con icona e numero | La leggibilità delle intenzioni vende: oltre 5 milioni di copie del secondo capitolo in pochi mesi. |
| **Inscryption** (Mullins) | Roguelite a carte | Interfaccia fisica (tavolo, carte), atmosfera inquietante | **Leggibilità come "battaglia costante"**: niente testo sulle carte, icone sopra i ritratti | Su schermi piccoli **vincono le icone**, non il testo. |
| **Hades** (Supergiant) | Roguelite d'azione | Pittorico, colori saturi, contrasto alto | Lettering su misura "inciso alla greca"; UI molto decorata ma con densità controllata | Si può decorare molto **se** l'informazione di gioco resta dominante. Hades è il nostro posizionamento (DESIGN §1.1). |
| **Curse of the Dead Gods** (Passtech) | Roguelite d'azione | Oscurità come scelta estetica **e** di gioco (le ombre potenziano i nemici) | — | L'estetica può essere regola: in Limen il buio e la luce possono **dire qualcosa**. |
| **The Banner Saga** (Stoic) | Tattico a turni | Ispirato a Eyvind Earle: forme geometriche, strati in parallasse, linea più colore piatto | — | **Gli strati in parallasse** danno profondità a figure piatte, proprio come le nostre quinte. |
| **Black Book** (Morteshka) | RPG a carte, folklore slavo | Folklore cupo; i recensori lodano i ritratti disegnati e criticano il 3D povero | — | Un'arte disegnata coerente vale più di una tecnica ambiziosa realizzata male. |
| **Cultist Simulator, Book of Hours** (Weather Factory) | Narrativi a carte | Icone vettoriali pulite più mondo illustrato | Carte come interfaccia | Due livelli funzionano: **simboli puliti** per il gioco, **illustrazione** per il mondo. È la nostra divisione tra simboli e scena. |
| **Shroom and Gloom** (2026, Devolver) | Deckbuilder roguelike | Etichette Steam "Dark Fantasy" e "Hand-drawn"; disegno a mano più spazi 3D | — | Il disegnato a mano dark fantasy è ancora apprezzato nel 2026 (93% positivo su oltre 1800 recensioni). |
| **Lotte Reiniger** (cinema, anni '20) | — | Figure di carta snodate, illuminate da sotto, su fondali di carta traslucida a strati | — | **Lo stile a marionette di carta è quasi assente nei giochi commerciali.** La ricerca ha trovato solo progetti accademici o amatoriali. |

### 1.2 Schemi ricorrenti
1. **Scuro con un solo accento.** Su 98 copertine dei più venduti di Steam (luglio 2026), il 45% ha fondo scuro e circa metà usa un fondo scuro con un unico colore forte. Il dark fantasy scuro è la norma, e proprio per questo **si confonde nella griglia del negozio**.
2. **Il disegno a mano con inchiostro** è la lingua comune del dark fantasy indipendente (Darkest Dungeon, Shroom and Gloom, Inkulinati).
3. **Caratteri:** un titolo con personalità, spesso disegnato su misura, e testi di gioco semplici. Il gotico (blackletter) **si usa solo per titoli e frammenti**: diversi studi l'hanno tolto dalle interfacce perché illeggibile.
4. **Interfacce "fisiche"** nei giochi a carte e a turni: tavoli, libri, carte. Danno atmosfera ma costano in leggibilità.
5. **Icone prima del testo** sugli schermi piccoli (Inscryption, Slay the Spire).

### 1.3 Spazi liberi e posizionamento
- **Il manoscritto miniato è occupato** da Pentiment e Inkulinati. Entrarci significa essere confrontati con loro.
- **La xilografia come interfaccia di combattimento** è poco usata: Pentiment la usa per la narrazione, non per un sistema di gioco.
- **Il teatro d'ombre e di carta è libero** nei giochi commerciali, ed è la tecnica che abbiamo già scelto per le marionette (DESIGN §8.1).
- **Il duello a turni con posture** è raro su Steam. La ricerca ha trovato pochi titoli (Polar Star, alcuni progetti su itch.io), nessuno con questo linguaggio visivo.

**Posizionamento proposto:** *"il duello che si legge"*: sagome leggibili e intenzioni in simboli, in un mondo di carta e inchiostro con un solo colore per la minaccia.

### 1.4 Vincoli che ogni alternativa deve rispettare
- **S23 a 360×780,** testo di almeno 14 px, bersagli di almeno 44 px (CLAUDE.md).
- **File HTML unico:** i font vanno **incorporati** come sottoinsieme latino in base64. Stima: circa 20–40 KB per stile e peso, quindi conviene usare al massimo 4 file di font.
- **Marionette SVG di profilo, niente volti,** sagome riconoscibili in nero pieno (SCENA_SPEC §1). Le figure devono restare **piatte e piene**.
- **Simboli esistenti** (38 id, UI_SPEC §7): ogni alternativa li **riveste**, non li ridisegna da zero.
- **Il rosso significa solo "fa male"** (UI_SPEC §4). Le alternative possono aggiungere colori, ma con ruoli scritti.
- **Due temi** (chiaro e scuro) per le pagine e per il gioco, oppure una scelta motivata di tema unico.

---

## 2. Le tre alternative
Sono tre identità **complete**: palette con i contrasti verificati, caratteri con i ruoli, stile dell'interfaccia, trattamento della scena, rischi e costi. I valori dei token si possono incollare direttamente in `styles.css`.

### Alternativa A: **Stampa** (xilografia su carta)
> *Un libro a stampa del Quattrocento in cui il duello è inciso nel legno.*

- **Riferimenti:** Pentiment (la parte xilografica), Darkest Dungeon (calore dell'inchiostro), i libri illustrati con le incisioni.
- **Perché per Limen:** è l'evoluzione diretta di ciò che c'è già (UI_SPEC, direzione A). Il rischio è minimo e la coerenza con simboli e sagome è massima.

**Palette** (è quella attuale, resa ufficiale; contrasti WCAG calcolati)
| Token | Chiaro | Scuro | Ruolo | Contrasto sul fondo |
|---|---|---|---|---|
| `--carta` | `#e9e2d3` | `#141210` | Fondo delle pagine e dei medaglioni | — |
| `--carta-2` | `#ddd4c1` | `#1f1b17` | Fondo della scena | — |
| `--inchiostro` | `#1c1915` | `#e4d9c4` | Figure, testo, simboli | 13,6 · 13,4 |
| `--seppia` | `#685c4d` | `#a39682` | Testo secondario | 5,1 · 6,4 |
| `--filo` | `#c2b69e` | `#3b342b` | Linee, bordi, quinte | decorativo |
| `--pericolo` | `#a1311f` | `#e2654b` | Solo ciò che fa male | 5,5 · 5,5 |

**Tipografia** (Google Fonts, licenza OFL)
| Ruolo | Font | Uso a 360 px |
|---|---|---|
| Titoli | **IM Fell English SC**: caratteri tipografici del Seicento digitalizzati, con l'irregolarità della stampa | Titoli 26–30 px; mai sotto i 20 |
| Testo | **Alegreya**: serif calligrafico robusto, pensato per testi lunghi | Registro e descrizioni, 16 px |
| Etichette e numeri | **Alegreya Sans SC** per le etichette; **Alegreya Sans** con cifre tabellari per i numeri | Etichette 13 px; vigore e danni 18–22 px |

**Stile dell'interfaccia**
- **Pannelli:** fogli rettangolari con un doppio filetto tipografico (spesso più sottile) e un piccolo fregio ❦ come separatore. Nessun angolo arrotondato.
- **Pulsanti:** "timbri" con il bordo inciso. Alla pressione affondano di 1 px, come un timbro.
- **Medaglioni:** tondi xilografici con un anello tratteggiato (come quelli attuali). Selezionato: anello pieno d'inchiostro. Confermato: il segno si inverte (carta su inchiostro).
- **Barre di vigore e fiato:** righelli incisi con tacche, non barre lisce; il fiato in pallini pieni o vuoti.
- **Hint:** cartiglio sopra il nemico; i colpi d'attacco in rosso.
- **Registro:** striscia di carta in basso, come una didascalia di stampa.
- **Danni:** numeri in Alegreya Sans nero corsivo, in rosso, con un piccolo schizzo d'inchiostro.
- **Movimento:** "pressione" (scala da 1,04 a 1 in 120 ms), macchie d'inchiostro che si allargano; niente scie luminose.

**Scena:** carta come fondale; quinte a strati in `--filo` con tratteggio inciso; figure in inchiostro pieno con tagli di luce bianchi (le linee della sgorbia).

**Rischi:** è la scelta meno sorprendente; si confonde con Pentiment agli occhi di chi lo conosce; su fondo chiaro la copertina Steam rischia di risultare spenta.
**Costo:** il più basso; è già in gran parte implementato.

---

### Alternativa B: **Codice** (manoscritto miniato)
> *Le pagine di un codice miniato, con rubriche rosse, lapislazzuli e oro.*

- **Riferimenti:** Pentiment (la parte miniata), Inkulinati, i libri d'ore.
- **Perché per Limen:** è la più **calda e ricca**. Dà spazio alla locanda e alla narrazione (DESIGN §7), e "il mondo ricorda" diventa un libro che si riempie.

**Palette** (tre colori con ruoli rigidi)
| Token | Chiaro | Scuro | Ruolo | Contrasto sul fondo |
|---|---|---|---|---|
| `--carta` | `#f2e6c8` | `#18120c` | Pergamena | — |
| `--carta-2` | `#e8d6a8` | `#231a11` | Fondo della scena | — |
| `--inchiostro` | `#2a1c12` | `#f0e2c0` | Inchiostro ferrogallico | 13,3 · 14,5 |
| `--seppia` | `#6e5238` | `#b89c74` | Testo secondario | 5,8 · 7,1 |
| `--pericolo` | `#a8261b` | `#e5603f` | **Vermiglio:** ciò che fa male, le rubriche | 5,7 · 5,4 |
| `--lapis` | `#1d4f91` | `#7ea6e0` | **Lapislazzuli:** ciò che è tuo (fiato, vantaggio, selezione) | 6,6 · 7,5 |
| `--oro` | `#8a6a1f` | `#d4ad55` | **Oro:** solo decorazione (cornici, capilettera) | 4,1 · 8,8 (mai per il testo nel tema chiaro) |

**Tipografia**
| Ruolo | Font | Uso a 360 px |
|---|---|---|
| Titoli e capilettera | **Grenze Gotisch**: gotico ibrido, più leggibile della Fraktur pura | **Solo** titoli brevi (28–34 px) e capilettera; mai nell'interfaccia di gioco |
| Testo | **EB Garamond**: Garamond accurato, buona leggibilità sugli schermi ad alta densità | 17 px (Garamond ha un'occhiellatura piccola) |
| Etichette e numeri | **EB Garamond** in maiuscoletto con cifre tabellari allineate | Etichette 13 px, numeri 20 px |

**Stile dell'interfaccia**
- **Pannelli:** pagine con margini ampi; titoli in rosso (rubriche); cornici a nastro d'oro solo sui pannelli importanti (locanda, fine duello).
- **Pulsanti:** etichette in maiuscoletto dentro un riquadro con un filo d'oro; alla pressione il riquadro si riempie di lapislazzuli.
- **Medaglioni:** tondi dorati; selezionato con fondo lapislazzuli, confermato con il segno in pergamena su lapislazzuli.
- **Barre:** il vigore come nastro rosso, il fiato in perle di lapislazzuli.
- **Hint:** iniziale miniata sopra il nemico, in vermiglio per gli attacchi.
- **Registro:** note a margine in corsivo, con la manicula ☞ per l'evento principale.
- **Danni:** numeri romani o arabi in vermiglio, scritti a mano.
- **Movimento:** scrittura che si traccia (testo che compare a pennino), giro di pagina nelle transizioni.

**Scena:** fondale come miniatura a strati piatti con cielo a quadretti o motivi a losanga; figure in inchiostro con campiture di colore piatte; i nemici come creature delle marginalia per i mondi più strani.

**Rischi:** è il linguaggio **più occupato** (Pentiment, Inkulinati); i tre colori complicano la regola "il rosso fa male" e richiedono disciplina; è il più costoso da produrre (cornici, capilettera); a 360 px la decorazione si impasta facilmente.
**Costo:** alto: decorazioni, un colore in più per le figure, font più pesanti.

---

### Alternativa C: **Lanterna** (teatro d'ombre)
> *Un teatro di sagome di carta: la scena è uno schermo illuminato da una lanterna, il resto è buio.*

- **Riferimenti:** Lotte Reiniger (*Le avventure del principe Achmed*, 1926), il teatro d'ombre, Darkest Dungeon (buio caldo), Banner Saga (strati), Curse of the Dead Gods (la luce come regola).
- **Perché per Limen:** è la **più coerente con le marionette** (sagome nere su uno schermo luminoso = leggibilità massima delle posture) e la **più distintiva** su Steam. Rende letterale il pilastro "il buio ha senso solo accanto al calore": l'interfaccia è notte, la scena è una lanterna.

**Palette** (tema scuro come predefinito; la scena resta illuminata in entrambi i temi)
| Token | Scuro (predefinito) | Chiaro | Ruolo | Contrasto |
|---|---|---|---|---|
| `--carta` | `#101219` | `#f1ebdf` | Fondo dell'interfaccia (notte) | — |
| `--carta-2` | `#191d27` | `#e4dccb` | Pannelli | — |
| `--inchiostro` | `#e6e1d6` | `#1b1d24` | Testo dell'interfaccia | 14,4 · 14,2 |
| `--seppia` | `#9aa0ab` | `#5b606b` | Testo secondario | 7,1 · 5,3 |
| `--pericolo` | `#ec5b3f` | `#a3271a` | Danni e minacce nell'interfaccia | 5,5 · 6,2 |
| `--schermo` | `#e9b25f` | `#e9b25f` | **Lo schermo della lanterna:** fondo della scena | 9,8 sul fondo scuro |
| `--schermo-2` | `#cf8f3e` | `#cf8f3e` | Quinte lontane | — |
| `--sagoma` | `#0a0a0c` | `#0a0a0c` | Figure, armi, quinte vicine | 10,4 sullo schermo |
| `--brace` | `#7a160d` | `#7a160d` | Il rosso **dentro la scena** (hint d'attacco, schizzi) | 5,7 sullo schermo |

**Tipografia**
| Ruolo | Font | Uso a 360 px |
|---|---|---|
| Titoli | **Marcellus SC**: capitali lapidarie romane, più morbide e meno abusate di Cinzel | Titoli 24–30 px, spaziatura +4% |
| Testo | **Spectral**: serif disegnato per gli schermi, ottimo sul fondo scuro | 16 px, peso 400–500 |
| Numeri dell'HUD | **Barlow Semi Condensed** con cifre tabellari: stretto e nitido sul buio | Vigore e danni 18–24 px |

**Stile dell'interfaccia**
- **Cornice:** la scena è incorniciata come un **boccascena**, con quinte laterali nere e un bordo di luce sottile. Nel tema chiaro la cornice in inchiostro separa lo schermo dalla carta, perché il contrasto tra i due fondi è basso (1,6).
- **Pannelli:** legno scuro, cioè `--carta-2` con un filo di luce in alto, come le assi del teatro.
- **Pulsanti:** dischi di carta ritagliata; alla pressione si "accendono" con un bordo color schermo.
- **Medaglioni:** **dischi di carta controluce**: il segno è ritagliato e lascia passare la luce. Selezionato: anello di luce. Confermato: il disco si piega in avanti.
- **Barre:** il vigore come lumino che si consuma; il fiato in pallini di luce.
- **Hint:** sagoma ritagliata in `--brace` proiettata sullo schermo sopra il nemico, come un'ombra.
- **Registro:** in basso, su fondo notte, come i cartelli dei film muti.
- **Danni:** numeri in `--brace` sullo schermo, in `--pericolo` sull'interfaccia.
- **Movimento:** la luce che tremola appena (lanterna), le quinte che scorrono in parallasse, il sipario come transizione tra le schermate.

**Scena:** schermo illuminato a strati (`--schermo` vicino, `--schermo-2` lontano, quinte nere in primo piano); figure **completamente nere** con dettagli solo per ritaglio (fori, merletti, frange del mantello); la luce è un colore piatto, senza sfumature.

**Rischi:**
- le figure perdono i dettagli interni, quindi la postura deve leggersi **solo dalla sagoma**. I criteri di SCENA_SPEC §1 lo chiedono già, ma qui è obbligatorio;
- due zone di colore (notte e lanterna) da comporre con cura;
- il tema chiaro è meno naturale e va inteso come variante.

**Costo:** medio. Le figure costano **meno** (sagome piene senza campiture), mentre luce, cornici e parallasse costano di più.

---

## 3. Confronto
| Criterio (peso) | A Stampa | B Codice | C Lanterna |
|---|---|---|---|
| Leggibilità su S23 (25) | ●●●● | ●●● | ●●●● (sagome perfette, testo su fondo scuro) |
| Coerenza con genere e tono (15) | ●●●● | ●●● (più "storico" che dark) | ●●●● |
| Distintività su Steam (15) | ●● | ●● (Pentiment e Inkulinati) | ●●●● (spazio libero) |
| Costo di produzione SVG e marionette (15) | ●●●● | ●● | ●●● |
| Coerenza con simboli e pose esistenti (10) | ●●●● | ●●● | ●●●● |
| Accessibilità (10) | ●●●● | ●●● (tre colori da distinguere) | ●●●● |
| Peso tecnico, font e file (5) | ●●●● | ●●● | ●●● |
| Copertina e marketing (5) | ●● (fondo chiaro spento) | ●●● | ●●●● (fuoco luminoso su fondo scuro) |

Punteggio pesato di partenza (voti da 1 a 4 per il peso, su 400): **A 360 · B 270 · C 380**. È un giudizio iniziale, da sostituire con i dati della demo (§4).

---

## 4. Come valutarle a demo finita
1. **Temi intercambiabili.** L'interfaccia usa già i token (UI_SPEC §4): ogni alternativa diventa un **tema** (token più font incorporati) selezionabile dal pannello dell'arena, con le stesse sagome e gli stessi simboli. Costo stimato: una piccola fase di codice su Sonnet. Per C serve in più la cornice e lo schermo della scena.
2. **Prova di lettura:** il quiz delle sagome (SCENA_SPEC §1.7) ripetuto in ogni tema. Conta le risposte giuste e il tempo per risposta.
3. **Sessione di gioco:** un duello per tema contro lo stesso nemico, con lo stesso seed. Dopo ogni duello due domande: "quanto era leggibile?" e "quanto era il *tuo* gioco?", con voti da 1 a 5.
4. **Prova di copertina:** una copertina 120×45 e 460×215 per tema, affiancata a 8 copertine reali del genere.
5. **Decisione:** punteggio pesato della §3 con i voti reali, poi la scelta viene registrata in DESIGN §8 e diventa la base di UI_SPEC 2 e della produzione delle marionette.

## 5. Raccomandazione provvisoria
- **C, Lanterna,** è la scommessa migliore: è distintiva su Steam, coerente con le marionette e con il pilastro del buio caldo, e rende le posture leggibilissime.
- **A, Stampa,** è la base sicura, già pronta: tienila come riferimento e come ripiego.
- **B, Codice,** è la più ricca ma la più affollata sul mercato e la più costosa. Merita la prova soprattutto se la locanda e la narrazione diventeranno centrali.
- **Possibile ibrido**, da valutare dopo la prova: interfaccia della A (carta e inchiostro) per locanda e mappa, scena della C (lanterna) per il duello. In questo modo il duello si distingue come "teatro" dentro il libro.

## Fonti
- Pentiment: [Game Developer, approfondimento sull'arte](https://www.gamedeveloper.com/art/deep-dive-the-art-of-pentiment); [Inverse, intervista sull'arte](https://inverse.com/gaming/pentiment-game-art-interview); [GameBanshee, i font di Pentiment](https://gamebanshee.com/9kaxf)
- Inkulinati: [pagina Steam](https://store.steampowered.com/app/957960)
- Darkest Dungeon: [GameSpot, le sensibilità gotiche](https://www.gamespot.com/articles/the-gothic-sensibilities-of-darkest-dungeon/1100-6424880/); [80.lv, Red Hook racconta la creazione](https://80.lv/articles/red-hook-studios-talks-about-the-creation-of-darkest-dungeon)
- Hades: [Jen Zee, Wikipedia](https://en.wikipedia.org/wiki/Jen_Zee); [il font di Hades](https://madegooddesigns.com/hades-font/)
- Slay the Spire: [il font di Slay the Spire](https://madegooddesigns.com/slay-the-spire-font/); mercato del genere: [classifica dei deckbuilder 2026](https://topgamerarena.com/best-roguelike-deckbuilder-games-in-2026/)
- Inscryption: [Game Developer, da una game jam a Inscryption](https://www.gamedeveloper.com/design/how-game-jam-sacrifices-became-inscryption); [DiGRA, From Paper to Pixels](https://dl.digra.org/index.php/dl/article/view/2474)
- The Banner Saga: [Wikipedia](https://en.wikipedia.org/wiki/The_Banner_Saga); [Gamereactor, intervista](https://msn.gamereactor.eu/raising-the-banners-stoics-saga/)
- Black Book: [Way Too Many Games, recensione](https://waytoomany.games/2021/08/06/review-black-book/)
- Curse of the Dead Gods: [ActuGaming, intervista](https://www.actugaming.net/interview-curse-of-the-dead-gods-agfd-2020-353686)
- Book of Hours: [Weather Factory, Early Draft Edition](https://weatherfactory.biz/boh-the-early-draft-edition/)
- Shroom and Gloom: [pagina Steam](https://store.steampowered.com/app/3271280/Shroom_and_Gloom/)
- Lotte Reiniger: [Women Film Pioneers Project](https://wfpp.columbia.edu/pioneer/lotte-reiniger/); [Criterion, Shadow Play](https://www.criterionchannel.com/shadow-play-the-animated-films-of-lotte-reiniger)
- Copertine Steam: [Steam Page Analyzer, dati sulle copertine 2026](https://www.steampageanalyzer.com/blog/steam-capsule-trends-data); [guida alle copertine 2026](https://www.strayspark.studio/blog/steam-capsule-art-store-page-conversion-guide-2026)
- Caratteri gotici e leggibilità: [Myriad, interfaccia rinascimentale](https://www.moddb.com/news/myriads-renaissance-gui-design); [Grenze](https://pimpmytype.com/grenze/)
- Duelli a turni su Steam: [Polar Star](https://steambase.io/games/polar-star/info); [Undercrown](https://tarikhavoc.itch.io/undercrown)
