# Limen: Documento di Design

> **Stato:** scheletro preliminare, v0.2 (15 ottobre 2026)
> **Titolo:** Limen, provvisorio (repository: `dvlabdev/limen-game`, licenza MIT)
> **Fase attuale:** arena di prova del duello, vedi [docs/ARENA_SPEC.md](docs/ARENA_SPEC.md)
> **Uso:** fonte di verità condivisa tra le sessioni di Planning, Codice e Grafica/UI. Una decisione esiste solo se è scritta qui.

Legenda: ✅ deciso · 🟡 ipotesi di lavoro · ⬜ da definire

---

## 1. Fondamenta

### 1.1 Visione ✅
Un roguelite dark fantasy a turni. Un viandante solitario attraversa il portale di una locanda verso mondi sempre diversi, alla ricerca di un tesoro dal valore inestimabile. Si vince **preparandosi e leggendo il nemico**, non con i riflessi.

Posizionamento: *un Hades a turni*, con la struttura a spedizioni di Hades e Curse of the Dead Gods e un combattimento basato sulla lettura e sulle posture.

### 1.2 Pilastri ✅
1. **La preparazione vince.** Ogni scontro è l'esame di come hai giocato prima, sia nella run sia alla locanda.
2. **Il mondo ricorda.** Ferite, favori e relazioni pesano dentro la run, e le relazioni anche tra le run. *(Strato opzionale: vedi 7.3)*
3. **Ogni viaggio è diverso.** Biomi, percorsi, boss e tecniche cambiano cosa impari e chi diventi.

### 1.3 Cosa il gioco NON è ✅
- Non è in tempo reale e non richiede riflessi.
- Non è un open world.
- Non punta sulla crescita verticale: il viandante non diventa invulnerabile.
- Il "dark" non è miseria costante: il buio ha senso solo accanto a momenti di calore.

### 1.4 Piattaforma e stack ✅
- TypeScript compilato in **un singolo file HTML**.
- Browser desktop e mobile, giocabile solo col clic o col tocco, senza controller.
- Gioco a turni, senza vincoli di tempo reale.

### 1.5 Scopo del gioco ✅
**Scopo unico**, scritto con cura e capace di ispirare (modello Hades). Niente background selezionabili nella prima versione; l'architettura resta aperta ad aggiungerli come modalità futura.
- ⬜ Contenuto dello scopo e natura del tesoro: dalla sorgente autoriale.

---

## 2. Struttura della campagna e della run

### 2.1 Tre livelli ✅
```
PARTITA   molte run, un solo viandante, uno scopo → il tesoro alla fine
  └ RUN   30–45 min, un mondo oltre il portale → milestone, presagio, boss
      └ DUELLO   pochi turni → posture, hint, fiato, iniziativa
```
- Il tesoro si trova **alla fine della partita**, non della run. La run serve alla progressione.
- Durata della partita: 🟡 indicativamente 10 ore circa (15–20 run), da rivedere se fuori scala.

### 2.2 La locanda-portale ✅
- La base è una locanda con un portale verso mondi diversi (ispirazione: The Yawning Portal).
- Il viandante è **sempre lo stesso personaggio**.
- Alcuni NPC lo riconoscono anche in mondi diversi: è un **mistero narrativo** che si può legare al tesoro. ⬜ Spiegazione dalla sorgente autoriale.
- Alla locanda: potenziamenti, scelta delle tecniche negli slot, controllo degli achievement.

### 2.3 Forma della run ✅
- **Macro, al portale:** scelta tra 3 mondi (biomi).
- **Micro, nel mondo:** percorso a milestone; a ogni milestone la strada si **biforca** in 2–3 direzioni.
- Ogni direzione mostra con un **simbolo** il tipo di ricompensa, così il giocatore pianifica.
- I tipi di milestone sono **trasversali**: funzionano in qualunque bioma, che ne cambia solo l'aspetto e i dettagli.
- 🟡 4–5 milestone per run, da 6–8 minuti l'una, più il boss.

| Simbolo 🟡 | Milestone | Ricompensa |
|---|---|---|
| ⚔ | Scontro | Tecnica temporanea |
| ✦ | Contratto | Denaro |
| ? | Indagine | Conoscenza sul boss |
| ☩ | Favore | Aiuto monouso per il boss |
| ♨ | Ristoro | Cure e fiato |
| ⚖ | Mercante | Consumabili |

### 2.4 Il boss della zona ✅
- Ogni mondo pesca il suo boss da un **roster di boss intermedi**, a caso e in modo nascosto all'inizio della run.
- Le **indagini** servono a scoprire chi sarà il boss e come prepararsi.

🟡 Proposta di conoscenza a gradi:

| Indagini completate | Cosa sai del boss |
|---|---|
| 0 | Niente: affronti un'incognita, gli hint sono oscurati |
| 1 | **Identità:** sai chi è, quindi puoi orientare le scelte successive |
| 2 | **Schema:** gli hint del boss diventano leggibili |
| 3 | **Debolezza:** un punto debole, o una postura che lo punisce |

- Anche il bestiario persistente (vedi 2.6) riduce le indagini necessarie per i boss già incontrati.

### 2.5 Presagio: l'orologio della run ✅
- Un **indicatore di presagio** sale con certe scelte, in particolare con le milestone più ricche o rischiose.
- Il presagio **potenzia il boss** mentre tu ti potenzi con le milestone: la pianificazione passa anche da qui.
- Oltre una soglia, **è il boss a venirti incontro**, prima della fine del percorso.

⬜ Equilibrio da definire: quanto conviene affrontare il boss presto. Principio proposto 🟡:
- il boss cresce **a scatti**, a soglie di presagio (per esempio una fase in più, un hint nascosto, una reazione nuova), mentre il giocatore cresce **in modo continuo**, milestone dopo milestone;
- tra una soglia e l'altra conviene accumulare; **appena prima di una soglia** conviene valutare se andare dal boss;
- affrontare il boss in anticipo dà un **premio** (per esempio "Prima del tempo": ricompensa o trofeo extra), così la scelta di andare presto è una strategia e non solo una fuga.

### 2.6 Sconfitta e persistenza ✅ (da raffinare)
| Si perde alla sconfitta | Si conserva |
|---|---|
| Consumabili | Achievement di favori e quest completate |
| Indizi | Trofei dei boss |
| Tecniche temporanee | Eventuali valute persistenti |
| | Conoscenza (bestiario) |
| | Relazioni con gli NPC ricorrenti *(se attivo lo strato 7.3)* |

### 2.7 Achievement dei boss ✅
Sconfiggere un boss lascia tre tracce:
- **nel mondo:** un portale o una scorciatoia si apre stabilmente;
- **alla locanda:** il trofeo sblocca qualcosa (servizio, mercante, maestro);
- **nel repertorio:** la tecnica del boss diventa **permanente**, ma va inserita negli slot limitati prima di partire.

Le varianti di un boss per bioma insegnano tecniche diverse. Le *specificità* del boss (effetti legati al bioma o alla run) restano confinate nella run.

---

## 3. Loop nei luoghi ⬜
Da definire nel blocco 3: contenuto di ogni tipo di milestone, valute (denaro, indizi, favori), mantenimento (cure, fiato), eventi di viaggio tra le milestone.

---

## 4. Il viandante

### 4.1 Parametri 🟡
| Parametro | Ruolo |
|---|---|
| **Vigore** | Salute. Sotto certe soglie si subiscono ferite. |
| **Fiato** | Risorsa che si rigenera; consumata da azioni, reazioni e cambi di postura |
| **Velocità** | Pesa sull'iniziativa a parità di vantaggio |
| **Peso** | Dato dall'equipaggiamento; riduce velocità e rigenerazione del fiato |

- ⬜ Ferite persistenti nella run (per esempio riducono il fiato massimo).
- ⬜ Quali parametri intaccano i danni.

### 4.2 Progressione ✅
- **Orizzontale, non verticale:** più strumenti, più cure, più opzioni; parametri al massimo con piccoli incrementi e un tetto.
- **Slot limitati** per le tecniche (🟡 una per postura): imparare qualcosa significa rinunciare ad altro.

### 4.3 Fonti delle tecniche ✅
| Fonte | Durata | Note |
|---|---|---|
| **Boss** | Permanente | Si sceglie se equipaggiarla negli slot alla locanda |
| **Osservazione** | Temporanea (run) | Un evento (duello, scontro osservato) che vale come aver sconfitto un boss |
| **Achievement** | Da definire | Quest, artefatti |

- 🟡 Per apprendere da un boss potrebbe servire averlo **studiato** (indagini o bestiario).
- ⬜ Elenco delle tecniche temporanee e permanenti, con bilanciamento.

---

## 5. Combattimento (duello a posture)

### 5.1 Principi ✅
- **Turni simultanei**, come scegliere un'azione in una lotta Pokémon.
- Il giocatore imposta una **postura**; le **reazioni** dipendono dalla postura e migliorano con la progressione.
- Il nemico mostra un **hint** di cosa sta per fare: il giocatore mantiene la postura o la cambia per parare o contrattaccare.
- Tutto si legge con **simboli chiari**, con poco testo a schermo.

### 5.2 Posture 🟡 (numero da confermare: 4)
| Postura | Effetto | Reazione base | Recupero fiato |
|---|---|---|---|
| **Assalto** | Attacchi più forti | Nessuna, incassi tutto | Basso |
| **Guardia** | Attacchi deboli, danni subiti ridotti | Parata | Alto |
| **Attesa** | Nessun attacco | Schivata + contrattacco | Medio |
| **Distanza** | Nessun attacco ravvicinato | Evita i colpi corti | Alto |

- Mantenere la postura è gratuito; **cambiarla costa fiato**.
- L'equipaggiamento può aggiungere o modificare posture (per esempio la lancia aggiunge *Ricevere*).
- Il terreno può abilitare o vietare posture.

### 5.3 Reazioni ✅ principio, ⬜ dettaglio
Ogni reazione ha 2–3 gradi di miglioramento (per esempio Parata → Parata ferma → Parata sbilanciante).

### 5.4 Risoluzione del turno 🟡
1. **Hint:** il nemico mostra la **categoria** della sua intenzione (attacco pesante, attacco leggero, difesa, preparazione), non la mossa esatta. ✅ Portata, velocità e tratti speciali restano nascosti; in futuro la conoscenza (indagini, bestiario) li rivela.
2. **Scelta simultanea:** mantenere la postura, cambiarla, usare un oggetto o un favore.
3. **Rivelazione.**
4. **Iniziativa:** prima il **vantaggio** (scambio precedente vinto, condizioni a contorno), poi la **velocità**.
5. **Risoluzione** in ordine di iniziativa; le reazioni scattano se c'è fiato.
6. **Fine turno:** recupero del fiato **in base all'azione compiuta**; aggiornamento del vantaggio.

- A fiato zero: niente reazioni, danni subiti aumentati.

### 5.5 Caso ✅
- Nella **strategia del nemico**: profili di comportamento con tendenze pesate che cambiano con la situazione, e il nemico si adatta se ripeti la stessa postura.
- Nei **danni**: intervalli stretti (🟡 circa ±20–30%), **sempre visibili** nell'interfaccia, sia inflitti sia subiti.
- Niente critici casuali: il colpo pieno arriva dal vantaggio.

### 5.6 Nemici ✅
- Usano lo **stesso sistema** del viandante, ma con posture e nomi propri dal sapore più fantasioso (per esempio la "Carica" del Mietitore).
- ⬜ Boss a più fasi: ogni fase premia un tipo di preparazione (conoscenza, equipaggiamento, alleati).

---

## 6. Indagine ✅ formato, ⬜ meccanica
- Indagini **brevi**: 2–3 indizi, una risoluzione, 1–2 esiti possibili in base alle interazioni.
- Funzione principale: scoprire **identità, schema e debolezza** del boss della zona (vedi 2.4).
- ⬜ Come si raccolgono gli indizi, cosa succede con una risoluzione sbagliata.

---

## 7. Contenuti e narrativa

### 7.1 Architettura 🟡
**Storylet:** frammenti narrativi che si attivano in base a condizioni (bioma, conoscenza, relazioni). I contenuti vivono in **file di dati** separati dalla logica, così la sorgente autoriale si innesta senza toccare il codice.

### 7.2 Sorgente autoriale ⬜
Sorgente separata: scopo, tesoro, mistero della locanda e degli NPC che ricordano.

### 7.3 NPC ricorrenti 🟡 (strato opzionale)
- 3–5 NPC ricorrenti con pochi stati di relazione: ostile, neutrale, debitore, alleato.
- Tutti gli altri NPC sono funzionali.
- Si costruisce **dopo** il nucleo; se non convince, si toglie senza rompere il resto.

---

## 8. Interfaccia e direzione artistica ⬜
Principi già fissati:
- **Simbologia chiara** per posture, reazioni, hint, milestone e intervalli di danno.
- Poco testo a schermo durante il combattimento.
- 🟡 Estetica da libro illustrato o xilografia (palette limitata, inchiostro, carta, icone forti), realizzabile via codice.

---

## 9. Produzione

### 9.1 Sessioni 🟡
| Sessione | Responsabilità | Possiede |
|---|---|---|
| **Planning** | Spec, criteri di accettazione, contenuti | `DESIGN.md`, spec, file dati dei contenuti |
| **Codice** | Logica di gioco, motore del duello, generazione della run | `src/` |
| **Grafica/UI** | Interfacce, simboli, stili | Asset, stili, `UI_SPEC.md` |

- Le sessioni comunicano **tramite i file del repository**, non tramite messaggi.
- 🟡 Contratto dati tra UI e logica: per l'arena è `DuelView` in `src/core/view.ts` (vedi ARENA_SPEC §7); per le altre schermate resta da definire.
- ✅ Tutte le sessioni nella stessa cartella (su Google Drive), un solo scrittore per file, niente worktree. Le regole operative sono in [CLAUDE.md](CLAUDE.md).

### 9.2a Passo 0: arena di prova ✅
Obiettivo: verificare **posture, reazioni e divertimento** del duello prima di costruire il resto. È un banco di prova senza progressione: si sceglie un nemico da un menu, si combatte e si ricomincia, con interruttori A/B (hint completi, anteprima danni, adattamento) e telemetria locale. C'è anche un simulatore con bot per scovare le strategie dominanti. Specifica completa: [docs/ARENA_SPEC.md](docs/ARENA_SPEC.md).

### 9.2 Nucleo di prova (prima versione giocabile) ✅
Obiettivo: capire se il duello e le tecniche temporanee sono divertenti.
- 1 bioma, 5 milestone con biforcazioni
- 3 tipi di milestone: scontro, ristoro, mercante
- 4 posture con reazioni base
- 5–6 nemici con profili di comportamento diversi
- 6–8 tecniche temporanee
- 1 boss a due fasi
- Niente locanda: alla sconfitta si ricomincia

Fuori dal nucleo, solo se il nucleo funziona: indagini, favori, presagio, roster di boss, NPC ricorrenti, locanda e persistenza.

### 9.3 Prototipo testuale ✅ chiuso
Lo sostituisce l'arena (9.2a): il motore del duello è TypeScript puro, separato dall'interfaccia, quindi il prototipo è già il gioco vero.

---

## Registro delle domande aperte
| # | Domanda | Blocco | Blocca l'arena? |
|---|---|---|---|
| 1 | Bilanciamento del presagio: premio per l'anticipo e scatti del boss | 2 | No |
| 2 | Contenuto di ogni milestone e valute | 3 | No |
| 3 | Parametri intaccati dai danni; ferite persistenti | 4–5 | No: nell'arena i danni toccano solo il vigore |
| 4 | Numero definitivo di posture | 5 | Si prova con 4; l'arena darà la risposta |
| 5 | Elenco e bilanciamento delle tecniche (temporanee e permanenti) | 4 | No |
| 6 | Meccanica di raccolta degli indizi | 6 | No |
| 7 | Scopo, tesoro e mistero della locanda | 7 | No |
| 8 | Contratto dati UI ↔ logica | 9 | Risolta per l'arena (`DuelView`) |
| 9 | Il duello è divertente? Posture dominanti? Valore dei gradi delle reazioni? | 5 | È la domanda dell'arena |
