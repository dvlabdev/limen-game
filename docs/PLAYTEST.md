# Protocollo di playtest dell'arena

> **Versione:** 0.1, bozza (15 ottobre 2026) · **Proprietario:** Planning
> **Quando:** passo D della [ROADMAP](ROADMAP.md), sulla build C2 pubblicata come pagina privata Claude, giocata sul Samsung S23.

## 1. Domande a cui rispondere
1. **Posture:** sono tutte utili? Ce n'è una dominante o una inutile? Ne servono 4? (DESIGN, domanda aperta n. 4)
2. **Reazioni e gradi:** cambiano davvero le scelte?
3. **Lettura e fiato:** leggere l'hint e gestire il fiato è divertente? Quando perdi, capisci perché?
4. **Layout:** la scena con il ventaglio si legge meglio o peggio della griglia?
5. **Regole facoltative:** serve "chi manca a vuoto cede l'iniziativa"? Le finte avrebbero spazio?

## 2. Sessioni
Tre sessioni brevi, possibilmente in giorni diversi. Ogni duello dura pochi minuti.

| Sessione | Configurazione | Nemici | Durata |
|---|---|---|---|
| **1. Prima impressione** | Layout griglia, gradi 1, hint per categoria, anteprima spenta, adattamento attivo | Recluta, poi Duellante, Bruto, Lanciere | Circa 15 minuti |
| **2. Il layout definitivo** | Layout scena, il resto come la sessione 1 | Tutti, Mietitore compreso | Circa 20 minuti |
| **3. Le variabili** | Scena, provando uno alla volta: anteprima danni, hint completi, adattamento spento, gradi 2 e 3 | Due nemici a scelta | Circa 20 minuti |

**Regola:** nelle prime due sessioni non si consulta la specifica. Si impara giocando, come farebbe un giocatore.

## 3. Domande dopo ogni sessione
Risposte brevi, anche a voce in chat.
1. Quale postura hai usato di più, e perché?
2. C'è stato un momento in cui hai pensato "l'avevo letto"? E uno in cui hai pensato "non potevo saperlo"?
3. Quando hai perso, ti era chiaro il motivo?
4. Il fiato ti ha costretto a scelte interessanti, o era solo un fastidio?
5. Cosa hai capito da solo del sistema? (Confronteremo con le regole.)
6. Da 1 a 5: quanto volevi rigiocare subito?

## 4. Metriche dalla telemetria
Calcolate da Planning sul database della pagina:

| Metrica | Obiettivo | Fonte |
|---|---|---|
| Cambi di postura sul totale dei turni | **> 30%** | ARENA_SPEC §2.6 |
| Uso della postura più usata | **≤ 50%** | ARENA_SPEC §2.6 |
| Vittorie contro i nemici normali dopo la prima partita | 40–80% | Indicativo |
| Turni medi per duello | 4–8 (boss ≤ 14) | ARENA_SPEC §9 |
| Pareggi | Rari (< 10%) | §12.4 |
| Uso di ciascuna postura | Ogni postura ≥ 10% | Nessuna postura inutile |

## 5. Esiti e decisioni
Dopo ogni sessione, Planning salva i dati in `docs/playtest/dati/` e scrive le interpretazioni in `docs/playtest/ESITI.md` (procedura: `docs/playtest/README.md`) le risposte, le metriche e le proposte. Poi si decide con l'utente e si registra in DESIGN:
- numero di posture e gradi;
- regole facoltative (colpo a vuoto, finte);
- layout definitivo;
- **cancello verso il nucleo:** il duello diverte? Sì → passo F. No → si itera sull'arena.
