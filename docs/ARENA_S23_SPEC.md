# Arena giocabile su S23: specifica operativa (passo C2)

> **Versione:** 1.0, **approvata dall'utente** (15 ottobre 2026) · **Proprietario:** Planning · **Esecutore:** sessione Codice (Sonnet 5.5, effort high), più un piccolo compito Grafica (§3)
> **Parte da:** ARENA_SPEC 1.1.1 (le regole del duello non cambiano, salvo le decisioni della §12.6); UI_SPEC (simboli, scena, ventaglio); SCENA_SPEC §1 (pose); CLAUDE.md.
> **Prerequisito:** l'audit G0–G4 senza rilievi Bloccanti aperti (ROADMAP, passo B). Questa specifica può cambiare in base ai rilievi.

## 0. Scopo
Rendere l'arena **giocabile sul Samsung S23** per il playtest (ROADMAP, passo D):
1. **simboli definitivi** al posto dei segnaposto Unicode;
2. **layout "scena"**: ventaglio, interfaccia dentro la scena, sagome statiche. Resta come variante A/B accanto alla griglia classica;
3. **telemetria** che finisce in un database quando la pagina gira dentro Claude, e nella memoria del browser altrimenti;
4. **un solo file per due destinazioni:** pagina privata Claude (per il playtest) e **GitHub Pages** (link pubblico).

**Fuori ambito:** marionette e animazioni (passi E1 ed E2), installazione come app (PWA), audio.

---

## 1. Decisioni della §12.6 da applicare
- **Recluta** esclusa dal vincolo su `fissa:distanza`, con danni miti: Fendente intorno a 3–5. Nuovo bilanciamento della sola Recluta, nel rispetto dei suoi obiettivi (lettore ≥ 90%).
- **Lanciere:** obiettivo dei turni medi del `lettore` 4–9.
- Aggiornare il simulatore e la sezione del report.

---

## 2. Simboli definitivi
Si segue **UI_SPEC §9** alla lettera:
- `design/symbols.proposed.ts` diventa `src/ui/symbols.ts`;
- si usano `icona()` e `medaglione()`, i cui risultati **non** passano da `esc()`;
- CSS minimo e accessibilità come da §9.

**Risposte alle domande di UI_SPEC §10:**

| # | Domanda | Decisione |
|---|---|---|
| 1 | Estensioni della §8 (13 id) | **Approvate.** Entrano nella tabella degli id dell'arena. |
| 2 | `posture.preparazione` e `intent.preparazione` con lo stesso disegno | **Va bene:** è la stessa azione vista da due lati. |
| 3 | Palette a un solo colore | **Sì:** si tolgono `--accento`, `--ok` e `--fiato` e si adotta la palette di UI_SPEC §4. |
| 4 | Etichetta con nome e costo sotto i medaglioni | **Sì per il playtest:** aiuta a imparare. Più avanti diventa un'opzione. |
| 5 | Ventaglio nell'arena | **Sì,** come variante A/B (§4). |
| 6 | Spazio alle spalle del nemico | **Sì,** tacche specchiate dietro il nemico, come in UI_SPEC §5.4b. |
| 7 | `stato.spalle` nell'HUD | **Sì,** visibile per tutto il turno in cui la Distanza non è disponibile, oltre al segno sul medaglione. |

---

## 3. Sagome statiche (compito Grafica, prima del codice)
Per il playtest servono sagome ferme, **non** le marionette. Una sessione Grafica (Sonnet) produce in `design/sagome/`:
- **4 sagome del viandante**, una per postura, che rispettano i criteri di SCENA_SPEC §1.2: assi A–E, forma e regola di distinzione;
- **5 sagome dei nemici**, una per nemico, in posa neutra, con le armi che ripetono i simboli (UI_SPEC §6.4): lancia per il Lanciere, maglio per il Bruto, falce per il Mietitore;
- un modulo `design/sagome.proposed.ts` con lo stesso schema di `symbols.proposed.ts`: `sagoma(id, { px })` restituisce un SVG inline;
- requisiti: sagoma piena in `currentColor`, altezza di riferimento 120 px su S23, profilo, niente volti, palette di UI_SPEC §4;
- **verifica:** le 4 sagome del viandante si distinguono in nero pieno a 120 px (SCENA_SPEC §1.7, criteri 1 e 2), con una tabella degli assi in `docs/UI_SPEC.md`.

Queste sagome restano utili anche dopo, come riferimento per il prototipo delle marionette e per il quiz delle sagome.

---

## 4. Layout "scena" (variante A/B)
Composizione, misure e stati come in **UI_SPEC §5** (§5.1–§5.4b): scena a tutto schermo su 360×700 utili, viandante a sinistra, nemico a destra.

- **Sagome:** il viandante mostra la sagoma della postura **attuale**. Durante la scelta la sagoma non cambia; cambia dopo la conferma. Il nemico mostra la sua sagoma neutra con l'hint sopra la testa.
- **Indicatori sui personaggi:** vigore, pallini del fiato (`risorsa.fiato.pieno` / `.vuoto`), stati (vantaggio, preparato, spalle, fase 2), tacche dello spazio alle spalle per entrambi.
- **Ventaglio:** 4 medaglioni ad arco dietro il viandante, nell'ordine Distanza, Attesa, Guardia, Assalto; bersagli di almeno 44 px; etichetta con nome e costo.
  - **Primo tocco:** seleziona (`aria-pressed`) e, con l'anteprima attiva, mostra "↓ subito · ↑ inflitto" vicino al medaglione.
  - **Secondo tocco** sullo stesso medaglione: conferma. Un tocco su un altro medaglione cambia la selezione; un tocco fuori la annulla.
  - Un medaglione non disponibile è spento, con il motivo: "fiato" o "niente spazio".
- **Risoluzione senza animazioni:** dopo la conferma, le etichette del danno compaiono nel punto del colpo, con l'icona dell'evento, per circa 1,2 s. Le sagome passano alle nuove posture con una dissolvenza CSS di 200 ms. Un tocco salta subito allo stato finale.
- **Registro:** cassetto in basso. Chiuso mostra l'ultima riga; con un tocco si apre lo storico.
- **Interruttore "Layout: scena / griglia"** nel pannello di configurazione. È salvato nella configurazione e registrato nella telemetria. Predefinito: scena.
- La **griglia classica** resta com'è, con i nuovi simboli (UI_SPEC §5.5).

**Limiti:**
- nessuna logica di gioco in `src/ui/`: tutto arriva da `DuelView`;
- **nessun cambiamento** alle regole né al contratto, salvo l'aggiunta degli id approvati.

---

## 5. Telemetria con destinazione automatica
Un modulo `src/ui/telemetria.ts` espone un'unica interfaccia:

```ts
interface DestinazioneTelemetria {
  nome: 'claude-db' | 'locale';
  salva(record: RecordDuello): Promise<void>;
  elenca(): Promise<RecordDuello[]>;
  azzera(): Promise<void>;        // solo 'locale'; su claude-db il pulsante non c'è
}
```

- **Scelta a runtime:** se `globalThis.claude?.use` esiste, `await claude.use('db')`. Se restituisce un namespace → `claude-db`; se restituisce `null`, o non esiste `claude` (GitHub Pages, file locale) → `locale` (`localStorage`, chiave `limen.arena.telemetria`, sempre in try/catch).
- **Mai bloccare il gioco** in attesa del database: si parte subito con `locale` come riserva e si passa a `claude-db` quando la promessa si risolve. I record salvati nel frattempo vengono **copiati una volta** nel database.
- **`claude-db`:** collezione `telemetria`, un documento per duello con `db.collection('telemetria').add(record)`. Gli errori `quota_exceeded`, `not_granted` e `revoked` fanno ripiegare su `locale`, con un avviso discreto nel menu.
- **Record:** i campi attuali (ARENA_SPEC §8), più:
  - `layout`: `'scena'` o `'griglia'`;
  - `versione`: hash breve del commit e data della build;
  - `destinazione`;
  - `id`: seed più timestamp ISO;
  - `turniDettaglio`: per ogni turno la postura scelta e la categoria dell'hint, al massimo 25 voci. Serve al playtest per misurare la lettura.
- **Menu:** contatore, "Copia JSON" (resta per entrambe le destinazioni) e l'indicazione della destinazione attiva.
- **Lettura da Planning:** con ArtifactData, lista della collezione `telemetria`.

**Pubblicazione come pagina privata** (a cura di Planning dopo ogni build):
- `dist/index.html` pubblicato sullo stesso Artifact, così l'URL resta stabile;
- `capabilities: { db: {}, user: {} }`, con le regole predefinite: scrive il proprietario, cioè l'utente che gioca.

---

## 6. GitHub Pages
- **Workflow** `.github/workflows/pages.yml` (proprietà di Codice):
  - parte a ogni push su `main` e a mano (`workflow_dispatch`);
  - **build:** checkout, Node 24, `npm ci`, `npm test`, `npm run typecheck`, `npm run build`, `actions/upload-pages-artifact` con la cartella `dist/`;
  - **deploy:** `actions/deploy-pages`, con `permissions: { pages: write, id-token: write }`;
  - se i test falliscono, la pubblicazione non avviene.
- **esbuild e `npm ci`:** in locale npm avverte che lo script di installazione di esbuild non è autorizzato, ma la build funziona perché usa il binario della piattaforma. Va verificato che succeda lo stesso in CI. Se serve, si autorizza lo script nel modo previsto da npm 11, documentandolo nel report.
- **Versione della build:** `scripts/build.ts` inietta hash del commit e data (`define` di esbuild), mostrati in piccolo nel menu e registrati nella telemetria.
- **Nessun percorso esterno:** il file è già autosufficiente, quindi l'indirizzo `/limen-game/` di Pages non crea problemi.
- **Azione dell'utente, una sola volta:** nelle impostazioni del repository su GitHub, Pages → Source → **GitHub Actions**. L'indirizzo sarà `https://dvlabdev.github.io/limen-game/`.

---

## 7. Criteri di accettazione
1. `npm test` e `npm run typecheck` verdi, con test nuovi per:
   - la scelta della destinazione della telemetria, con `claude` finto o assente;
   - la copia dei record nel database;
   - l'esistenza in `SIMBOLI` di ogni simbolo emesso da `toDuelView` (UI_SPEC §9.6).
2. Il simulatore rispetta gli obiettivi aggiornati (§1).
3. **Su 360×780**, entrambi i layout: un duello completo contro ogni nemico, nessuno scroll orizzontale, ventaglio con due tocchi, medaglioni spenti con il motivo, spazio alle spalle visibile.
4. **Build:** `dist/index.html` autosufficiente, con la versione visibile nel menu.
5. **Workflow:** passa su GitHub (verificabile dopo l'azione dell'utente del §6).
6. **Report:** `docs/ARENA_REPORT.md`, nuova sezione "C2", con i comandi verificati, le misure, gli scostamenti e le domande.

## 8. Fasi
| Fase | Chi | Contenuto |
|---|---|---|
| **C2a** | Grafica (Sonnet) | Sagome statiche (§3), commit su `design/` e `docs/UI_SPEC.md` |
| **C2b** | Codice (Sonnet, high) | Decisioni della §12.6 (§1), simboli (§2), layout scena (§4), telemetria (§5), workflow e versione (§6), report. Un commit per sotto-fase. |
| **C2c** | Planning | Pubblicazione come pagina privata con `db`, prova di un duello e lettura del database; verifica del link di Pages; audit di chiusura (Sonnet, cancello G3 sulla nuova interfaccia, più A04) |

## 9. Rilievi dell'audit da chiudere in C2
Smistamento di Planning dei 24 rilievi di `audit/REGISTRO.md` (audit G0–G4, nessun Bloccante). Le decisioni sulle regole sono in ARENA_SPEC §12.7.

| Fase | Rilievi | Cosa fare |
|---|---|---|
| **C2a** (Grafica) | AUD-008 | Allineare in UI_SPEC le taglie d'uso ai minimi: niente simboli con minimo 20 px usati a 16 px, oppure ridisegno della variante piccola |
| | AUD-023 | Distinguere `evento.interrotto` e `mod.inarrestabile` a 16 px |
| | AUD-009 (etichette) | Etichetta "Preparato" coerente in tutto il set |
| **C2b** (Codice) | **AUD-001** | Scambio simultaneo calcolato sullo stato di inizio scambio, vantaggio compreso (ARENA_SPEC §12.7), con test |
| | **AUD-002** | Mai una selezione predefinita su una postura non disponibile, in entrambi i layout; Conferma non lancia mai eccezioni non gestite |
| | **AUD-003** | Anteprima calcolata sul danno, non sulla differenza di vigore limitata a 0, con test sul colpo letale |
| | AUD-004, AUD-019 | Nemico che parte in Guardia (ARENA_SPEC §12.7); prima mossa scelta da quella postura |
| | AUD-009 (testi) | "Preparato" al posto di "Raccolto" nel registro e negli stati |
| | AUD-010 | Report: aggiornare §1 (test, versione della specifica) e la data di §4.8 |
| | AUD-017 | Punta e Arresto controllano il fiato come Parata e Schivata |
| | AUD-018 | Ripiego dell'IA (ARENA_SPEC §12.7) e test di validazione dei dati |
| | AUD-020 | Una sola implementazione della regola del cambio con le spalle al muro, condivisa da risolutore e IA; commento di `balance.ts` corretto |
| | AUD-021 | La vista espone `spalle: boolean` invece di far ripetere la soglia alla UI |
| | AUD-022 | Caselle del menu con bersaglio di almeno 44×44 px |
| **Planning** (fatto) | AUD-004, -005, -006, -007, -012, -013, -014, -015, -016, -018 (regola), -024 | Decisioni in ARENA_SPEC §12.7, DESIGN §5.2 e §9.1, CLAUDE.md |
| **Verifica in C2c** | AUD-011 | Le 13 estensioni dei simboli sono approvate (§2): l'audit di chiusura ne verifica l'integrazione |

**Audit di chiusura (C2c, Sonnet):** cancelli G1 e G3 sui file toccati, A04, verifica e aggiornamento dello stato di tutti i rilievi qui sopra.
