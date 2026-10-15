# Le posture: coerenza con la scherma storica e funzionalità nel gioco

> **Data:** 15 ottobre 2026 · **Autore:** Planning · **Stato:** analisi. Le proposte del §4 sono candidate per l'arena v1.1 e nessuna è ancora decisa.
> **Riferimenti interni:** DESIGN §5, ARENA_SPEC §4, SCENA_SPEC §1.

## 1. Coerenza con la realtà
La scherma storica italiana e tedesca offre un riscontro diretto. Fiore dei Liberi (*Flos Duellatorum*, circa 1410) chiama le guardie proprio **"poste"**, e la scuola tedesca di Liechtenauer ragiona di **iniziativa** (*Vor*, *Nach*, *Indes*). Le nostre 4 posture corrispondono a famiglie reali di guardie.

| Postura | Corrispondenza storica | Coerenza | Scarto da notare |
|---|---|---|---|
| **Assalto** | *Posta di donna* (soprana): spada caricata sopra la spalla, la guardia da cui partono i colpi più potenti. È il *Vor*, cioè prendere l'iniziativa. | Alta | Nella realtà il colpo migliore **attacca e copre insieme** (i *Meisterhau* tedeschi). Il nostro Assalto non ha reazioni e modella il colpo impegnato, che rischia il **doppio colpo**: è un fallimento reale. |
| **Guardia** | Guardie di copertura (*posta frontale* o *di corona*): spada davanti, parata e risposta | Alta | La risposta dopo la parata è centrale nella realtà. La Parata sbilanciante di grado 3, che dà vantaggio, la rappresenta bene. |
| **Attesa** | Guardie basse e pazienti (*dente di zenghiaro*, *tutta porta di ferro*): si aspetta l'attacco per colpire nel suo tempo. È il *Nach* che diventa *Indes*. | Molto alta | Che la schivata fallisca contro gli attacchi rapidi è realistico: il contrattempo richiede il tempo che un colpo veloce non concede. |
| **Distanza** | *Posta longa* o stare "fuori misura" (*misura larga*): punta protesa verso l'avversario, lo si tiene a bada | Media | **Nella realtà la posta longa minaccia:** chi entra corto finisce sulla punta. La nostra Distanza è solo passiva. Inoltre nella realtà **non si arretra all'infinito**: in pedana c'è il fondo, in battaglia il terreno. |

Altri concetti già coerenti:
- **Vantaggio = *Vor*:** chi ha l'iniziativa detta il tempo, quindi è primo nell'iniziativa e colpisce pieno. Questo sostituisce i critici casuali, in linea con l'idea che contino il tempo e le aperture, non la forza.
- **Risoluzione simultanea = *Indes*:** attacco e difesa nello stesso istante.
- **Costo in fiato del cambio = il "tempo"** speso per cambiare guardia.
- **Interruzione da colpo pesante:** chi colpisce per primo con un colpo deciso spezza l'azione dell'altro.
- **Categorie dell'hint = lettura del corpo:** spalle, peso, carica. È ciò che un tiratore osserva davvero.

Ciò che la realtà prevede e noi **non modelliamo** (per scelta, va bene così):
- il legare di spada (contatto tra le lame);
- il gioco stretto e la lotta (*abrazare*);
- la direzione dei colpi (alto, medio, basso);
- la misura come stato condiviso tra i due combattenti.

## 2. Funzionalità nel gioco
| Postura | Ruolo | Paga se… | Rischio di progetto |
|---|---|---|---|
| **Assalto** | Danno, vantaggio, rompere le preparazioni | L'hint è "preparazione", oppure si ha vantaggio | Doppio colpo contro un pesante; viene punito da difese e controattacchi |
| **Guardia** | Postura sicura, recupero del fiato, danno di logoramento | L'hint è "leggero" | **Rischio di dominanza:** è sicura, recupera e infligge un po' di danno. La contrastano Battuta, preparazione e adattamento. Lo verifica il simulatore. |
| **Attesa** | Punire i colpi pesanti | L'hint è "pesante" | Costa 2 di fiato e fallisce contro i rapidi: equilibrio sano |
| **Distanza** | Recuperare fiato, evitare i colpi corti | L'hint è "pesante" o "leggero" con fiato basso | **Stallo:** contro nemici senza colpi lunghi (Recluta, Bruto, Duellante) è sicura al 100% e gratis, e l'adattamento non può punirla. Si può tirare in lungo fino al pareggio. |

Altri rilievi funzionali:
- **Copertura della categoria "difesa":** la specifica la fa coincidere con guardia, attesa e distanza, ma **nessun nemico dell'arena usa l'Attesa**. Il giocatore non scopre mai che dietro "difesa" può esserci un contrattacco, e lo strato di lettura più interessante (Assalto punito, Guardia rapida premiata) resta inesplorato.
- **Progressione asimmetrica:** solo Parata e Schivata hanno gradi. Assalto e Distanza non crescono, quindi la progressione spinge verso Guardia e Attesa.
- **Numero di posture:** 4 famiglie funzionali sono coerenti con la tradizione storica, che conta molte guardie ma poche famiglie, e con i giochi di riferimento (Nioh ne ha 3 più il movimento). Va confermato dai dati dell'arena (domanda aperta n. 4).

## 3. Cosa fanno altri giochi
| Gioco | Sistema | Cosa prendiamo | Cosa evitiamo |
|---|---|---|---|
| **Slay the Spire** | Intenzioni del nemico esatte, con icona e numero | Leggibilità di icona più numero; intervalli di danno sempre visibili | L'intenzione esatta: abbiamo scelto la categoria, per lasciare spazio alla lettura |
| **Yomi / Fantasy Strike** (Sirlin) | Scelta simultanea a carta-forbice-sasso, dove **ogni vittoria rende in modo diverso** (parare fa pescare, schivare permette di contrattaccare) | Ogni postura vincente deve rendere qualcosa di diverso: da noi l'Attesa contrattacca, la Guardia recupera, l'Assalto dà vantaggio. Lo confermiamo come principio. | Il triangolo puro e risolto |
| **Pokémon** | Scelta simultanea, priorità delle mosse | Velocità della mossa nell'iniziativa | — |
| **Nioh** | Posture alta, media e bassa = compromesso tra potenza, velocità e stamina (Ki); a Ki finito si è vulnerabili | Il fiato come vincolo centrale; vulnerabilità a fiato zero | La dipendenza dai riflessi |
| **Ghost of Tsushima** | Una postura per ogni tipo di nemico (spadaccino, scudo, lancia, bruto) | Nemici che mettono alla prova posture diverse (Duellante, Bruto, Lanciere) | Che il nemico diventi una tabella di consultazione "nemico X → postura Y": lo evitano l'hint turno per turno e i repertori di mosse misti |
| **For Honor** | Guardie direzionali, finte, rottura della guardia; i pesanti fanno danno anche se parati | La Parata riduce ma non annulla i pesanti; Battuta come rottura della guardia; finte in prospettiva (DESIGN §5.5a) | La direzione dei colpi in tempo reale |
| **Bushido Blade** | Posture alta, media e bassa, colpi letali, conta il tempo più della forza | Il colpo pieno nasce dall'apertura (vantaggio), non dal caso | La letalità al primo colpo |
| **Kingdom Come: Deliverance** | Combattimento con consulenza di scherma storica; il **colpo maestro** attacca e para insieme | Il colpo maestro come **tecnica permanente** da boss | La precisione dei tempi richiesta al giocatore |
| **Absolver** | Grafo di posture: ogni attacco parte da una postura e termina in un'altra | In futuro, tecniche che lasciano in una postura diversa (dopo un contrattacco si finisce in Assalto) | — |
| **En Garde / Flash Duel** (gioco da tavolo) | La **distanza è uno stato condiviso**; si vince anche spingendo l'avversario verso il fondo | Il limite di arretramento (proposta P1) | La pedana completa, troppo complessa per ora |

## 4. Proposte per l'arena v1.1 (candidate, da provare con il simulatore)
| # | Proposta | Motivo realistico | Motivo funzionale | Costo |
|---|---|---|---|---|
| **P1** | **Spazio alle spalle:** dopo 2 turni consecutivi in Distanza, la terza Distanza non è disponibile finché non si torna avanti (Assalto) o si resta un turno in un'altra postura | Non si arretra all'infinito: c'è il fondo della pedana o il terreno | Elimina lo stallo; nella scena di profilo il bordo **si vede** | Basso |
| **P2** | Un **nemico con mosse di Attesa** (un Duellante paziente, o il Mietitore in fase 1) | Le guardie basse in attesa sono il cuore della scuola italiana | Copre la categoria "difesa" e il suo strato di lettura più interessante | Basso (solo dati) |
| **P3** | **Gradi della Distanza:** grado 2 *Punta* (chi entra corto con un colpo pesante subisce 1–2); grado 3 *Arresto* (il colpo d'arresto interrompe un pesante corto) | La posta longa minaccia | Rende simmetrica la progressione | Medio: va verificato che la Distanza non diventi dominante |
| **P4** | **Colpo maestro** come tecnica permanente da boss: un Assalto con Parata di grado 1 | I *Meisterhau* attaccano e coprono insieme | Una ricompensa da boss che si sente | Rimandato alle tecniche (domanda n. 5) |
| **P5** | La **misura come stato condiviso** (larga o stretta), che Assalto e Distanza spostano | È la scherma vera | Molta profondità | Alto: rimandata, da rivalutare dopo il playtest |

## 5. Conseguenze sulle pose (SCENA_SPEC §1)
- **Riferimenti storici per ogni postura:** Assalto = posta di donna; Guardia = posta frontale; Attesa = dente di zenghiaro; Distanza = posta longa.
- **Correzione per la Distanza:** l'arma è **protesa verso l'avversario all'altezza del petto**, la punta "in presenza", con il busto che arretra, invece che "protesa e bassa". È più fedele alla posta longa e rende leggibile la minaccia.

## Fonti
- Fiore dei Liberi e le poste: [Wiktenauer, immagini del Fior di Battaglia](https://www.wiktenauer.com/wiki/Fiore_de%27i_Liberi/Images); [AEMMA, Flos Duellatorum](https://aemma.org/onlineResources/liberi/liberi8_body.htm); [Guy Windsor, traduzione delle guardie](https://www.guywindsor.net/?p=4549); [Academie Duello, progressione delle poste](https://www.academieduello.com/learn/resources/wiki/fiore-poste-progression); [Posta di donna](https://longsword.fandom.com/wiki/File:Donnadistra.png)
- Vor, Nach, Indes: [Iron Gate Exhibition, Vor Nach Indes](https://igx2015.irongateexhibition.com/sessions/vor-nach-indes/); [Scuola tedesca di scherma](https://akban.org/wiki/German_school_of_swordsmanship)
- Misura, gioco largo e gioco stretto: [Guy Windsor, largo e stretto](https://guywindsor.net/2018/06/freedom-to-strike-a-lengthy-discussion-of-largo-and-stretto/); [Academie Duello, glossario](https://www.academieduello.com/learn/resources/wiki/italian-swordplay-terms)
- Nioh: [Critpoints, Ki Pulse e posture](https://critpoints.net/2017/03/09/what-makes-niohs-ki-burst-fun/); [Push Square, posture alta, media e bassa](https://www.pushsquare.com/news/2020/03/guide_nioh_2_-_when_to_use_high_mid_and_low_stances)
- Ghost of Tsushima: [Prima Games, guida alle posture](https://primagames.com/tips/ghost-tsushima-stance-guide)
- Yomi: [Sirlin Games, Yomi](https://www.sirlingames.com/yomi); [Wikipedia, Yomi](https://en.wikipedia.org/wiki/Yomi_(card_game))
- For Honor: [Ubisoft, glossario di For Honor](https://www.ubisoft.com/es-mx/game/for-honor/news-updates/6XEM2qUiwcokp753uCzgkz/for-honor-terminology-guide)
- Kingdom Come: Deliverance: [Wiki, combattimento](https://kingdomcomedeliverance.wiki.gg/wiki/Combat); [Gameranx, guida avanzata](https://gameranx.com/features/id/139409/article/kingdom-come-deliverance-advanced-combat-guide-clinches-perfect-blocks-master-strikes-more/)
- Absolver: [Fextralife, combat deck](https://absolver.wiki.fextralife.com/Combat+Deck)
- Slay the Spire: [LessWrong, recensione](https://www.lesswrong.com/posts/MEimkSwwuRgiPaZaY/review-slay-the-spire)
- Bushido Blade: [Hardcore Gaming 101](https://www.hardcoregaming101.net/bushido-blade/)
- En Garde e Flash Duel: [Regolamento di En Garde](https://rulespal.com/en-garde/rulebook); [Flash Duel](https://mikkosgameblog.com/2010/09/flash-duel/)
