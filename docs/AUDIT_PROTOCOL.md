# Protocollo di audit

> **Versione:** 1.0 (15 ottobre 2026) · **Proprietario:** Planning · **Esecutore:** sessione Audit
> **Scopo:** trovare il prima possibile incongruenze e incoerenze tra design, specifica, codice, test, contratto UI e simboli, con verifiche ripetibili e tracciate.

## 1. Principi
1. **Indipendenza.** L'Audit non scrive codice di gioco, non corregge e non decide. Constata, porta le prove e assegna una gravità. Le correzioni spettano al proprietario del file (vedi CLAUDE.md); le decisioni a Planning.
2. **Il riferimento sono i documenti.** I valori attesi si ricavano **solo** da DESIGN.md e dalle specifiche, mai dai test o dal codice di chi implementa. Se i documenti tacciono, il caso è un rilievo di tipo "specifica ambigua", non una conformità.
3. **Prove verificabili.** Ogni rilievo cita il riferimento (documento e §) e l'evidenza (`file:riga`, output di un comando, commit).
4. **Ripetibilità.** I controlli automatici si rilanciano con un solo comando e danno lo stesso esito sullo stesso commit.
5. **Tracciabilità.** Ogni requisito ha un id e deve risultare collegato a un'implementazione e a una verifica.

## 2. Livelli di coerenza verificati
```
DESIGN.md ──(B02)── ARENA_SPEC.md ──(B01, A05–A08)── src/core, src/data
                         │                                │
                         │                          (A06, B07) test e invarianti
                         ├──(A04, B04)── contratto DuelView ── src/ui ── design/ (simboli)
                         └──(A08, B05)── ARENA_REPORT.md (ciò che Codice dichiara)
```

## 3. Catalogo dei requisiti
L'Audit mantiene `audit/REQUISITI.md`, ricavato dalle specifiche **senza modificarle**:
- **id:** `SPEC-<§>-<nn>` (per esempio `SPEC-4.4-03`) oppure `DES-<§>-<nn>`;
- **testo** sintetico del requisito e **riferimento** alla versione del documento;
- **verifica prevista:** id del controllo (A.. o B..);
- **stato:** Conforme · Parziale · Non conforme · Non verificabile · Non ancora implementato;
- **evidenza:** `file:riga` dell'implementazione e test o controllo che lo dimostra.

Quando una specifica cambia versione, il catalogo si riallinea e i requisiti toccati tornano "da verificare".

## 4. Controlli
### 4.1 Automatici
Si trovano in `audit/checks/` e si lanciano con `node audit/run.ts [--gate Gx]`. Producono `audit/out/<data>-<gate>.json` e una sintesi in console; il codice di uscita è diverso da 0 se c'è almeno un rilievo Bloccante. **Nessuna dipendenza nuova**: solo Node, `node:test`/`node:assert` e l'API pubblica di `src/core`.

| Id | Controllo | Riferimento |
|---|---|---|
| A01 | **Purezza del core:** niente `Math.random`, `Date`, `document`, `window`, `localStorage` o `performance` in `src/core/` | CLAUDE.md, SPEC §2 |
| A02 | **Dipendenze:** nessuna `dependencies`; `devDependencies` contenute in {typescript, esbuild} | SPEC §1 |
| A03 | **Configurazione TS:** `strict`, `erasableSyntaxOnly`, `allowImportingTsExtensions`, `noEmit` presenti; niente `enum` né `namespace` | SPEC §1 |
| A04 | **Copertura dei simboli:** gli id di SPEC §7 corrispondono uno a uno a `src/ui/symbols.ts`, a `design/symbols.proposed.ts` e a `design/icons/*.svg` (se esistono). Ogni `simbolo` emesso da `toDuelView` appartiene al catalogo. | SPEC §7, UI_SPEC |
| A05 | **Matrice di accettazione indipendente:** le 24 celle di SPEC §4.6, riscritte dall'Audit a partire dal testo, eseguite a scatola nera con `resolveTurn` e un dado finto | SPEC §4.4–4.6 |
| A06 | **Invarianti (fuzz con seed):** oltre 10.000 turni casuali su tutti i nemici. Si verifica: 0 ≤ fiato ≤ max; vigore ≤ max; nessun `NaN`; turno ≤ 25; esito coerente con il vigore; immutabilità dell'ingresso; determinismo; serializzazione JSON reversibile; cambi non consentiti mai eseguiti. | SPEC §4, §7 |
| A07 | **Valori iniziali tracciati:** confronto di `balance.ts` ed `enemies.ts` con SPEC §4.1, §4.2 e §6. Ogni differenza deve comparire nella tabella delle modifiche di ARENA_REPORT. | SPEC §9 |
| A08 | **Simulatore:** rilancio con seed fisso; confronto con gli obiettivi di SPEC §9 **e** con i numeri dichiarati in ARENA_REPORT (tolleranza ±2 punti percentuali) | SPEC §9, §11 |
| A09 | **Build a file singolo:** `dist/index.html` esiste e non contiene `src=` o `href=` verso risorse esterne | SPEC §1 |
| A10 | **Vocabolario:** nomi di posture, categorie, nemici e mosse identici tra DESIGN, SPEC, dati ed etichette della UI | DESIGN §5, SPEC §3, §6 |

### 4.2 Di giudizio (lettura esperta)
| Id | Controllo |
|---|---|
| B01 | **Tracciabilità:** ogni requisito del catalogo collegato al punto del codice in cui è implementato e alla sua verifica |
| B02 | **Design ↔ Spec:** la specifica contraddice, restringe o estende DESIGN.md? Ogni estensione deve avere una decisione scritta in DESIGN. |
| B03 | **Coerenza interna della spec:** contraddizioni tra sezioni (per esempio tra le regole del §4.4 e la matrice del §4.6), casi non coperti, termini usati senza definizione |
| B04 | **Contratto UI:** tutti i campi di `DuelView` sono popolati; la UI non contiene logica di gioco (cerca regole o numeri in `src/ui/`) |
| B05 | **Veridicità del report:** ciò che ARENA_REPORT afferma (fasi, comandi, prove nel browser) corrisponde alle evidenze |
| B06 | **Processo:** proprietà dei file rispettata (`git log --name-only`); un commit per fase; test e typecheck verdi su HEAD |
| B07 | **Revisione del codice:** skill `code-review` su `src/core/` e `src/data/`, per difetti di correttezza rispetto alla spec |
| B08 | **Simboli ↔ grammatica:** le icone rispettano la grammatica dichiarata in UI_SPEC (viewBox, `currentColor`, forme di famiglia, leggibilità senza colore) |

## 5. Gravità dei rilievi
| Gravità | Definizione | Effetto |
|---|---|---|
| **Bloccante** | Viola una regola o un contratto e invalida il playtest o l'integrazione | Va chiuso prima del cancello successivo |
| **Maggiore** | Falsa i risultati o la tracciabilità (bilanciamento non annotato, report non veritiero, requisito parziale) | Va chiuso o accettato da Planning |
| **Minore** | Scostamento senza effetto sui risultati del test | Si corregge alla prima occasione |
| **Osservazione** | Rischio, ambiguità o suggerimento | Valutazione di Planning |

Categorie: `design-spec`, `spec-interna`, `spec-codice`, `contratto-ui`, `simboli`, `bilanciamento`, `report`, `processo`.

## 6. Registro dei rilievi
Il registro è `audit/REGISTRO.md`: uno per riga, senza mai cancellare.

| Campo | Contenuto |
|---|---|
| Id | `AUD-<nnn>` |
| Data, gate, commit | Quando e su quale stato del repository |
| Gravità, categoria | Vedi §5 |
| Riferimento | Documento e § |
| Evidenza | `file:riga` o comando |
| Descrizione | Cosa non torna |
| Proprietario proposto | Planning, Codice o Grafica |
| Stato | Aperto → Assegnato → Risolto (verificato dall'Audit) · Accettato (scostamento approvato da Planning) · Respinto (non è un rilievo) |

Ogni esecuzione produce anche `audit/report-<data>-<gate>.md`, con la sintesi, i controlli eseguiti, l'esito e i rilievi nuovi o chiusi.

## 7. Cancelli (quando si esegue l'audit)
| Gate | Quando | Controlli |
|---|---|---|
| **G0 Base** | Subito, sui documenti | B02, B03, creazione del catalogo dei requisiti |
| **G1 Core** | Dopo il commit di F1 | A01, A02, A03, A05, A06, B01 (§4), B07 |
| **G2 Bilanciamento** | Dopo F2 | A07, A08, B01 (§5, §6, §9), B05 parziale |
| **G3 Arena** | Dopo F3 e F4 | A04 (segnaposto), A09, A10, B04, B05, B06 |
| **G4 Simboli** | Alla consegna della Grafica, prima dell'integrazione | A04 completo, A10, B08 |

- **Durante l'implementazione in corso** l'audit segue le fasi senza fermarle: i rilievi si accumulano e Planning li smista.
- **Prima del playtest** (G3) e **prima dell'integrazione dei simboli** (G4) non devono restare rilievi Bloccanti aperti.

## 8. Flusso
1. Planning comunica alla sessione Audit che un cancello è pronto (fase committata).
2. L'Audit esegue i controlli del cancello, aggiorna il catalogo e il registro, scrive il report, poi commit e push dei soli file `audit/`.
3. Planning smista i rilievi: li assegna, li accetta o li respinge, e aggiorna i documenti se il problema sta nella specifica.
4. Il proprietario corregge. Al cancello successivo l'Audit verifica la chiusura.
