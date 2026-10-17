# Roadmap

> **Aggiornata:** 15 ottobre 2026 · **Proprietario:** Planning
> Ordine di lavoro concordato con l'utente. Ogni passo ha una specifica in `docs/` prima di partire.

| # | Passo | Chi | Dipende da | Stato |
|---|---|---|---|---|
| A | **Chiusura dell'arena 1.1**: fase F2b e nuova F4; simboli della 1.1 e mockup dello spazio | Codice, Grafica | — | **Fatto** (F2b `8881ea8`, F4 `5ba2e95`, simboli `5bc2252`) |
| 0 | **Trasloco della copia di lavoro** da Google Drive a `C:\Users\irond\Dropbox\Buffer\claude-yard\limen-game`, con `node_modules`, `dist` e `sim-out` esclusi dalla sincronizzazione | Planning | A | **Fatto** |
| B | **Audit sulla 1.1**: cancelli G0–G3 in un solo passaggio, più G4 sui simboli ([AUDIT_PROTOCOL](AUDIT_PROTOCOL.md)) | Audit (Opus) | 0 | **Fatto**: 0 Bloccanti, 3 Maggiori, 7 Minori, 14 Osservazioni (`eb7ab9d`), smistati (`f81cf46`) |
| C1 | **SCENA_SPEC §1 v0.2**: pose allineate al modello delle posture | Planning | — | **Approvata** |
| C2 | **Arena giocabile su S23** (ARENA_SPEC 1.2): simboli definitivi, ventaglio e interfaccia nella scena con sagome statiche (A/B con la griglia), pubblicazione come pagina privata Claude con telemetria su database | Grafica (sagome), Codice | B (rilievi bloccanti chiusi) | **Fatto**: Pages e pagina privata online; audit di chiusura `da4dbf9` senza Bloccanti né Maggiori (aperto AUD-025, minore, e osservazioni). Nell'app mobile la telemetria non riceve il database: si usa "Copia JSON" |
| V | **Visione del risultato finale**: prompt per concept art (`docs/ricerca/PROMPT_CONCEPT.md`) e fotogrammi bersaglio in SVG (`design/bersaglio/`) | Planning, Grafica (Opus) | — | **Fatto**: prompt, [fotogrammi bersaglio](https://claude.ai/artifact/GjaJd9bzj7A9SajMkKZZM9) (`dba231f`), studio dello stile |
| D | **Playtest** con l'utente ([PLAYTEST](PLAYTEST.md)), analisi della telemetria, decisioni in DESIGN; cancello verso il nucleo | Planning con l'utente | C2 | **In corso**: sessione 1 |
| S | **Scelta dello stile visivo** tra le tre alternative di [STILE_ALTERNATIVE](STILE_ALTERNATIVE.md) (Stampa, Codice, Lanterna; [tavole](https://claude.ai/artifact/PovX88CHteUZFKYA3FXuWa)): ogni alternativa diventa un tema dell'arena, poi quiz delle sagome, duelli e prova di copertina; la scelta entra in DESIGN §8 | Codice (Sonnet) per i temi, Planning con l'utente | D (demo finita) | Ricerca e alternative pronte |
| E1 | **Specifica della scena** (SCENA_SPEC §2–§5) e **prototipo di animazione**: viandante e Bruto, 6 animazioni, laboratorio pubblicato come pagina privata | Planning, poi Grafica | C1 approvata | Specifica in bozza (SCENA_SPEC 0.3) |
| E2 | Produzione completa della scena, integrazione, audit G5 | Grafica, Codice, Audit | E1 approvato, D | — |
| F | **Nucleo** (DESIGN §9.2) | Tutte | D positivo, budget dei contenuti | — |

## Questioni aperte (aggiornate al 17 ottobre 2026)
| Questione | Stato | Prossimo passo |
|---|---|---|
| **Linea di base del monitor** (ARENA_SPEC §13.1) | In corso: sessione `monitor-fiato` (Sonnet), che fa anche il fiato leggibile (§13.2) e AUD-025 | Planning legge i numeri e propone le leve |
| **Ritmo del duello che premia l'Assalto** (D22) | Leve candidate: L1 Attesa che prepara invece di contrattaccare · L2 slancio dell'Assalto · L3 pressione sulla passività · L4 scambi meno sbilanciati · **velocità leggibile nell'hint** ("pesante · lento"), da ESITI O3 | Scegliere sui numeri del monitor; approvazione dell'utente; ARENA_SPEC §13 parte 2 |
| **Duello pulito con la conoscenza** (D20) | Deciso; i dati del Bruto lo confermano (3 duelli puliti su 5 con hint completi) | Scriverlo in DESIGN §5.2 insieme alla parte 2 |
| **Momento di apprendimento** (Recluta che insegna, suggerimento al primo errore) | Da decidere con le sessioni 2–3 del playtest | Dopo il fiato leggibile |
| **SCENA_SPEC §2–§5** (scheletro, animazioni, laboratorio) | Bozza, da approvare | Approvazione dell'utente; prototipo dopo la scelta dello stile, oppure subito in sagoma pura |
| **Analisi automatica del playtest** (`npm run playtest`) e **"Scarica JSON"** su Pages | Specificati in docs/playtest/README.md | Nella prossima fase di codice |
| **Concept art** | Prompt pronti (docs/ricerca/PROMPT_CONCEPT.md) | Generazione da parte dell'utente; preferenze in `design/concept/` |
| **Telemetria su database** | Non funziona nell'app mobile; da desktop non provata | Facoltativo: un duello da claude.ai su desktop |
| **Sessione `c2a-sagome`** | Lavoro chiuso, archiviazione rifiutata dall'app per attività residua | Archiviarla dalla barra laterale |
| **Rimandati** | Finte (DESIGN §5.5a) · misura condivisa (P5) · Colpo maestro (P4) · opzione per mancini · installazione come app | Dopo il playtest o con il nucleo |

## Da preparare prima del nucleo
- **Budget dei contenuti:** quanti biomi, nemici, boss, tecniche e storylet servono per la 1.0.
- **Sorgente autoriale** (DESIGN §7.2): scopo, tesoro, mistero della locanda.
- **Tecniche** (domanda aperta n. 5), compreso il *Colpo maestro*.

## Regole di esecuzione
- **Un solo lavoro pesante alla volta**, per non esaurire i limiti di utilizzo.
- **Il modello più efficiente che regge il compito:**

  | Modello | Compiti |
  |---|---|
  | **Opus** | Sessione master di Planning, design di gioco e visivo, primo audit completo o con molto giudizio |
  | **Sonnet** | Implementazione da specifica, integrazioni, rilancio dei controlli e verifica della chiusura dei rilievi, cancelli d'audit meccanici |
  | **Haiku** | Letture e ricerche semplici |
- Ogni passo si chiude con commit e push su `main`; ogni sessione aggiunge solo i propri percorsi.
- Gli artefatti di revisione si verificano a 360×780 (Samsung S23).
