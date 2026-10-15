# Roadmap

> **Aggiornata:** 15 ottobre 2026 · **Proprietario:** Planning
> Ordine di lavoro concordato con l'utente. Ogni passo ha una specifica in `docs/` prima di partire.

| # | Passo | Chi | Dipende da | Stato |
|---|---|---|---|---|
| A | **Chiusura dell'arena 1.1**: fase F2b e nuova F4; simboli della 1.1 e mockup dello spazio | Codice, Grafica | — | **Fatto** (F2b `8881ea8`, F4 `5ba2e95`, simboli `5bc2252`) |
| 0 | **Trasloco della copia di lavoro** da Google Drive a `C:\Users\irond\Dropbox\Buffer\claude-yard\limen-game`, con `node_modules`, `dist` e `sim-out` esclusi dalla sincronizzazione | Planning | A | **Fatto** |
| B | **Audit sulla 1.1**: cancelli G0–G3 in un solo passaggio, più G4 sui simboli ([AUDIT_PROTOCOL](AUDIT_PROTOCOL.md)) | Audit | 0 | Da fare |
| C1 | **SCENA_SPEC §1 v0.2**: pose allineate al modello delle posture | Planning | — | **Approvata** |
| C2 | **Arena giocabile su S23** (ARENA_SPEC 1.2): simboli definitivi, ventaglio e interfaccia nella scena con sagome statiche (A/B con la griglia), pubblicazione come pagina privata Claude con telemetria su database | Codice | B (rilievi bloccanti chiusi) | Da specificare |
| D | **Playtest** con l'utente ([PLAYTEST](PLAYTEST.md)), analisi della telemetria, decisioni in DESIGN; cancello verso il nucleo | Planning con l'utente | C2 | Bozza del protocollo pronta |
| E1 | **Specifica della scena** (SCENA_SPEC §2–§5) e **prototipo di animazione**: viandante e Bruto, 6 animazioni, laboratorio pubblicato come pagina privata | Planning, poi Grafica | C1 approvata | Specifica in bozza (SCENA_SPEC 0.3) |
| E2 | Produzione completa della scena, integrazione, audit G5 | Grafica, Codice, Audit | E1 approvato, D | — |
| F | **Nucleo** (DESIGN §9.2) | Tutte | D positivo, budget dei contenuti | — |

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
