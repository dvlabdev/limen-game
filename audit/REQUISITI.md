# Catalogo dei requisiti

> **Proprietario:** Audit · **Allineato a:** ARENA_SPEC 1.1.1 con §12.6–§12.8 (la §12 prevale), ARENA_S23_SPEC 1.0, DESIGN v0.2 (con le modifiche di `f81cf46`), UI_SPEC 1.2 (C2a), SCENA_SPEC 0.3 §1 · **Commit verificato:** `154a071` (tornata 2; la tornata 1 era su `b678030`) · **Data:** 15 ottobre 2026
> Ricavato dai documenti **senza modificarli** (AUDIT_PROTOCOL §3). Quando una specifica cambia versione, i requisiti toccati tornano "da verificare".

**Id.** `SPEC-<§>-<nn>` per ARENA_SPEC; `DES-<§>-<nn>` per DESIGN; per gli altri documenti `UI-<§>-<nn>` (UI_SPEC), `SCENA-<§>-<nn>` (SCENA_SPEC) e `PROC-<nn>` (CLAUDE.md).
**Stati:** Conforme · Parziale · Non conforme · Non verificabile · Non ancora implementato.
**Verifiche:** i controlli automatici `A01`–`A10`, `B04a` e `B08a` si rilanciano con `node audit/run.ts`; `B01`–`B08` sono letture esperte (vedi il report). Nelle evidenze, "A05 Matrice" e "A05 casi" rimandano ad `audit/checks/a05-matrice.ts`.
**Test di Codice** citati solo come collegamento (B01), mai come fonte dei valori attesi.

## Riepilogo
| Stato | Numero |
|---|---|
| Conforme | 162 |
| Parziale | 4 |
| Non conforme | 0 |
| Non verificabile | 3 |
| Non ancora implementato | 3 |
| **Totale** | **172** |

Stati dopo la tornata 2 (fase C2, commit `154a071`): i requisiti **Parziali** sono collegati ad AUD-025 (UI-2.2-02, UI-3-05, S23-2-01) e ai due rilievi ancora Aperti AUD-008 e AUD-023; S23-9-01 riassume lo stato dei 24 rilievi. Vedi il [registro](REGISTRO.md). Le evidenze `file:riga` dei requisiti non toccati dalla C2 si riferiscono ancora al commit `5ba2e95` (le righe sono cambiate; i controlli A01–A10 e la prova a 360×780 sono stati rilanciati su `154a071`).

---

## ARENA_SPEC §1–§2: stack, comandi e struttura
| Id | Requisito | Verifica | Stato | Evidenza |
|---|---|---|---|---|
| SPEC-1-01 | Node 24+, TypeScript `strict` | A02, A03 | Conforme | `package.json` (engines ≥ 24), `tsconfig.json` |
| SPEC-1-02 | Dipendenze di sviluppo solo `typescript` ed `esbuild`, nessuna dipendenza di runtime | A02 | Conforme | `package.json` |
| SPEC-1-03 | `tsconfig`: `erasableSyntaxOnly`, `allowImportingTsExtensions`, `noEmit`, `strict`, ES2022 + DOM, `nodenext` | A03 | Conforme | `tsconfig.json` |
| SPEC-1-04 | Import con estensione `.ts`; niente `enum`, `namespace`, parameter properties | A03 | Conforme | 22 file esaminati |
| SPEC-1-05 | Test con `node --test` e `node:assert` | A02, B06 | Conforme | `package.json` (script `test`); 89 test verdi |
| SPEC-1-06 | Script `dev`, `build`, `test`, `typecheck`, `sim` | A02 | Conforme | `package.json` |
| SPEC-1-07 | `build` produce `dist/index.html` autosufficiente (JS e CSS inline, nessun file esterno) | A09 | Conforme | `scripts/build.ts:8`; `dist/index.html` = build di HEAD |
| SPEC-1-08 | `typecheck` con zero errori | B06 | Conforme | `npm run typecheck` su HEAD |
| SPEC-2-01 | Struttura dei file come in §2 | B01 | Conforme | `src/core`, `src/data`, `src/ui`, `sim/run.ts`, `scripts/`; in più `types/node-shim.d.ts` (ARENA_REPORT §4.2) |
| SPEC-2-02 | `src/core/` puro: niente DOM, `Math.random`, `Date` | A01 | Conforme | A01: nessun uso in `src/core` né in `src/data` |
| SPEC-2-03 | Stato dell'RNG (mulberry32) dentro `StatoDuello` | A06, B07 | Conforme | `src/core/rng.ts:4`, `src/core/types.ts:67` |

## ARENA_SPEC §3: modello dei dati
| Id | Requisito | Verifica | Stato | Evidenza |
|---|---|---|---|---|
| SPEC-3-01 | Tipi `Archetipo`, `PosturaId`, `Forza`, `Portata`, `Velocita`, `Categoria` come in §3 | A10, B07 | Conforme | `src/core/types.ts:3-8` |
| SPEC-3-02 | `Attacco` con `sfondaGuardia` e `inarrestabile`; `Mossa` con archetipo e attacco facoltativo | B07 | Conforme | `src/core/types.ts:12-26` |
| SPEC-3-03 | `Combattente` con vigore, fiato, velocità, postura, vantaggio, preparato, gradi (+ `gradi.distanza`, `distanzaConsecutive` da R2/R4) | B07, A06 | Conforme | `src/core/types.ts:28-46` |
| SPEC-3-04 | `OpzioniArena` con i tre interruttori A/B | B04 | Conforme | `src/core/types.ts:48` |
| SPEC-3-05 | `StatoDuello` serializzabile con `mossaNemico` già scelta, `storicoPosture`, `rng`, `seed` | A06 | Conforme | `src/core/types.ts:60`; A06: 12.031 turni reversibili in JSON |
| SPEC-3-06 | Posture del giocatore: Assalto pesante/corta/normale 4–6, Guardia leggero/corta/rapido 1–2, Attesa e Distanza senza attacco | A07 | Conforme | `src/data/postures.ts:4-19` |
| SPEC-3-07 | Risolutore simmetrico tra giocatore e nemico | A05, B07 | Conforme | A05 caso derivato (6 e 7) e fuzz: nessuna asimmetria nello scambio simultaneo; AUD-001 risolto in C2 |
| SPEC-3-08 | Categoria dell'hint: preparazione → preparazione; guardia/attesa/distanza → difesa anche con attacco; assalto → pesante/leggero | A05 casi | Conforme | `src/core/ai.ts:6`; test `view.test.ts:19`, `:28` |

## ARENA_SPEC §4: regole del duello
| Id | Requisito | Verifica | Stato | Evidenza |
|---|---|---|---|---|
| SPEC-4.1-01 | Giocatore: fiato 4/6, velocità 2, Guardia, gradi 1 (vigore 20 per §12.1 3) | A05 casi, A07 | Conforme | `src/data/balance.ts:15-21`, `src/core/resolve.ts:42` |
| SPEC-4.1-02 | Nemico: valori da `enemies.ts`, fiato al massimo, postura iniziale = archetipo della prima mossa, senza costo | A05 casi | Conforme | `src/core/resolve.ts:55-79`; vedi AUD-004 (effetto sull'informazione) e AUD-019 |
| SPEC-4.1-03 | Limite di 25 turni: pareggio | A05 casi, A06 | Conforme | `src/core/resolve.ts:398`; `regole.test.ts:172` |
| SPEC-4.2-01 | Cambio di postura: 1 fiato; non consentito senza fiato | A05 casi, A06 | Conforme | `src/core/resolve.ts:107-117`, `:174-182`; `regole.test.ts:204`, `:210` |
| SPEC-4.2-02 | Parata 1 fiato, Schivata 2 fiato | A05 Matrice (fiato) | Conforme | `src/core/resolve.ts:273`, `:288`; `regole.test.ts:42` |
| SPEC-4.2-03 | Recupero a fine turno per archetipo 0/2/1/2/3, fino al massimo | A05 Matrice, A06, A07 | Conforme | `src/core/resolve.ts:382`, `src/data/balance.ts:29` |
| SPEC-4.2-04 | Fiato 0 quando si subisce un colpo: niente reazioni, danno ×1,25 | A05 casi | Conforme | `src/core/resolve.ts:231-237`, `:292`; `regole.test.ts:53`, `:63` |
| SPEC-4.3-01 | Sequenza: hint, scelta, pagamento dei cambi, ordine, risoluzione, fine turno | B07 | Conforme | `src/core/resolve.ts:152-407` |
| SPEC-4.3-02 | Ordine: vantaggio di uno solo, poi velocità della mossa, poi del combattente, poi simultanei | A05 Matrice e casi | Conforme | `src/core/resolve.ts:411-418`; `regole.test.ts:138` |
| SPEC-4.3-03 | Simultanei: entrambi i colpi si risolvono sullo stato precedente, nessuno interrompe l'altro | A05 casi (derivato), B07 | Conforme | `resolve.ts` `scambioSimultaneo`: la perdita del vantaggio si applica dopo i due colpi; A05 caso derivato |
| SPEC-4.3-04 | Vigore a 0: i colpi successivi non si risolvono, tranne i simultanei | A05 casi | Conforme | `src/core/resolve.ts:354-358`; `regole.test.ts:182`, `:189` |
| SPEC-4.3-05 | Fine turno: preparato, recupero, vantaggio, fase, limite, scelta dell'IA | A06, B07 | Conforme | `src/core/resolve.ts:362-406` |
| SPEC-4.4-01 | Attacco interrotto: non si risolve | A05 Matrice (Assalto × P2) | Conforme | `src/core/resolve.ts:356` |
| SPEC-4.4-02 | Danno base: tiro nell'intervallo; col vantaggio il massimo, poi il vantaggio si consuma; preparato ×1,5 e si consuma | A05 casi | Conforme | `src/core/resolve.ts:215-227` |
| SPEC-4.4-03 | Distanza: colpo corto evitato senza costo, lungo ×1,25 | A05 Matrice | Conforme | `src/core/resolve.ts:238-239`, `:291` |
| SPEC-4.4-04 | Attesa: Schivata con fiato ≥ 2 e colpo non rapido (o grado 3); contrattacco 3–4 se corto (+1 dal grado 2); vantaggio dal grado 2 | A05 Matrice e casi | Conforme | `src/core/resolve.ts:240-245`, `:272-284`; `regole.test.ts:26`, `:35` |
| SPEC-4.4-05 | Guardia: Parata se non `sfondaGuardia` e fiato ≥ 1; leggero annullato dal grado 2, altrimenti ×0,4; pesante parato al grado 3 dà il vantaggio | A05 Matrice e casi | Conforme | `src/core/resolve.ts:246-249`, `:287-299`; `regole.test.ts:10`, `:19` |
| SPEC-4.4-06 | Assalto e preparazione: danno pieno | A05 Matrice | Conforme | `src/core/resolve.ts:232` |
| SPEC-4.4-07 | Ordine dei moltiplicatori e `Math.round`, minimo 0 | A05 casi (×1,25 e ×1,5 con arrotondamento) | Conforme | `src/core/resolve.ts:222-293` |
| SPEC-4.4-08 | Pesante a segno: interrompe qualunque attacco ancora da risolvere (§12.1 5a), salvo `inarrestabile`; l'attaccante guadagna il vantaggio | A05 Matrice e casi | Conforme | `src/core/resolve.ts:322-335`; `regole.test.ts:84`, `:92` |
| SPEC-4.4-09 | Pesante a segno contro la preparazione: la rompe, +vantaggio | A05 Matrice (Assalto × PR) | Conforme | `src/core/resolve.ts:329-332`; `regole.test.ts:154` |
| SPEC-4.4-10 | Contrattacco: colpo senza reazioni, non interrompe (moltiplicatori come da R3) | A05 casi | Conforme | `src/core/resolve.ts:199-207` |
| SPEC-4.5-01 | Uso: il vantaggio a inizio turno decide l'ordine e rende massimo il primo attacco; chi non attacca lo conserva | A05 casi | Conforme | `src/core/resolve.ts:217-221`; `regole.test.ts:100`, `:111` |
| SPEC-4.5-02 | Guadagno differito al turno successivo | A05 casi | Conforme | `src/core/resolve.ts:383`; `regole.test.ts:123` |
| SPEC-4.5-03 | Perdita: chi subisce danno > 0 perde il vantaggio attuale e quello in arrivo guadagnato prima | A05 casi | Conforme | `src/core/resolve.ts:187-196`; `regole.test.ts:116`, `:132`. Effetto collaterale sui simultanei: AUD-001 |
| SPEC-4.5-04 | Scambio simultaneo: chi incassa non tiene il vantaggio (§12.1 5b) | A05 Matrice (Assalto × P1, L2) | Conforme | `src/core/resolve.ts:352` |
| SPEC-4.6-01 | Matrice di riferimento, 24 celle (con §12.3) | A05 Matrice | Conforme | 24/24 celle conformi (danni, vantaggio, preparato, fiato, eventi); `matrice.test.ts:84` |
| SPEC-4.6-02 | Test dedicati: gradi di Parata e Schivata, fiato zero, `sfondaGuardia`/`inarrestabile`, vantaggio, preparato, fase, pareggio al 25°, cambio non consentito | A05 casi, B01 | Conforme | A05: tutti conformi; Codice: `regole.test.ts:10-210` |
| SPEC-4.7-01 | Fase 2 a fine turno con vigore ≤ 50%: evento e profilo della fase 2 | A05 casi | Conforme | `src/core/resolve.ts:394-397`; `regole.test.ts:162`, `ai.test.ts:84` |

## ARENA_SPEC §5: IA dei nemici
| Id | Requisito | Verifica | Stato | Evidenza |
|---|---|---|---|---|
| SPEC-5-01 | Candidate: stesso archetipo della postura attuale, oppure fiato ≥ costo del cambio | A05 casi, A06 | Conforme | `src/core/ai.ts:59-65`; `ai.test.ts:33`. Ripiego senza candidate: AUD-018 |
| SPEC-5-02 | Sequenza ciclica (Recluta); se non disponibile, prima candidata | A05 casi | Conforme | `src/core/ai.ts:95-100`; `ai.test.ts:13` |
| SPEC-5-03 | Peso × modificatori `vigoreSotto`, `fiatoSotto`, `avversarioFiatoSotto`, `avversarioVantaggio`, `avversarioPostura` | A05 casi (modificatori dei dati), B07 | Conforme | `src/core/ai.ts:31-46`, `:78`; `ai.test.ts:40` |
| SPEC-5-04 | Adattamento: dopo 2 scelte uguali, mosse che battono P × `adattamento` (tabella §5 + R6) | A05 casi | Conforme | `src/core/ai.ts:17-29`, `:49-55`, `:79`; `ai.test.ts:53`, `:76` |
| SPEC-5-05 | Estrazione pesata con l'RNG dello stato | A06 (determinismo) | Conforme | `src/core/ai.ts:101-108`; `ai.test.ts:92` |

## ARENA_SPEC §6: nemici
| Id | Requisito | Verifica | Stato | Evidenza |
|---|---|---|---|---|
| SPEC-6-01 | Recluta: mosse, tratti, gradi, sequenza, nessun adattamento | A07 | Conforme | `src/data/enemies.ts:29`; numeri cambiati e annotati in ARENA_REPORT §7.2 |
| SPEC-6-02 | Duellante: mosse (Battuta, ex Finta), gradi 2/1, adattamento ×3 | A07, A10 | Conforme | `src/data/enemies.ts:51` |
| SPEC-6-03 | Bruto: mosse, `fiatoSotto(2)` ×3, adattamento ×2 | A07 | Conforme | `src/data/enemies.ts:82` |
| SPEC-6-04 | Lanciere: mosse, `vigoreSotto(0,4)` ×2, adattamento ×2 | A07 | Conforme | `src/data/enemies.ts:106` |
| SPEC-6-05 | Mietitore: gradi 3/2, fase 1 e fase 2 con la Carica `inarrestabile`, adattamento ×2/×3 | A07 | Conforme | `src/data/enemies.ts:128` |

## ARENA_SPEC §7: contratto con l'interfaccia
| Id | Requisito | Verifica | Stato | Evidenza |
|---|---|---|---|---|
| SPEC-7-01 | `toDuelView` restituisce una `DuelView` serializzabile con la forma del §7 (+ R7) | A06, B04 | Conforme | `src/core/view.ts:22-63`, `:264` |
| SPEC-7-02 | `hint.dettaglio` solo con `hintCompleti` | A05 casi, A06 | Conforme | `src/core/view.ts:271`; `view.test.ts:35` |
| SPEC-7-03 | Id dei simboli del §7 mappati in `symbols.ts`; ogni simbolo emesso appartiene al catalogo | A04 | Conforme | 25 id uno a uno; 23 emessi, tutti nel contratto |
| SPEC-7-04 | Anteprima: per ogni postura disponibile, mosse candidate della categoria (o la mossa esatta), dado minimo e massimo, minimo e massimo dei risultati | A05 casi, B07 | Conforme | `view.ts` `dannoDaEventi`; A05: colpo letale inflitto [4,6] e subìto [3,3]; AUD-003 risolto, AUD-015 chiarito in §12.7 |
| SPEC-7-05 | L'anteprima riusa `resolveTurn` con dado iniettabile e `saltaIA` | B07 | Conforme | `src/core/view.ts:111` |
| SPEC-7-06 | Registro: una frase breve in italiano per evento, che spiega il perché | B04, A10 | Conforme | `src/core/view.ts:136-262`; termine "raccolto": AUD-009 |
| SPEC-7-07 | Firma di `resolveTurn(stato, scelta, opz?)` | B07 | Conforme | `src/core/resolve.ts:152` |
| SPEC-7-08 | `resolveTurn` non modifica lo stato in ingresso | A05 casi, A06 | Conforme | A06: 12.031 turni; `regole.test.ts:219` |

## ARENA_SPEC §8: arena (interfaccia segnaposto)
| Id | Requisito | Verifica | Stato | Evidenza |
|---|---|---|---|---|
| SPEC-8-01 | Mobile prima di tutto, 360×780, nessuno scroll orizzontale | B05 (prova nel browser) | Conforme | Misura dell'Audit a 360×780: nessun elemento oltre 360 px in menu e duello |
| SPEC-8-02 | Menu con i 5 nemici e pannello: gradi (Parata, Schivata e, da R4, Distanza), seed con "casuale", tre interruttori A/B | B04 | Conforme | `src/ui/render.ts:48-85` |
| SPEC-8-03 | Configurazione in `localStorage` (`limen.arena.config`) dentro try/catch | B04 | Conforme | `src/ui/arena.ts:10`, `:33-48` |
| SPEC-8-04 | Schermata del duello dall'alto in basso: nemico, hint, registro, giocatore, griglia 2×2 con costo, anteprima, disabilitato | B04, B05 | Conforme | `src/ui/render.ts:130-207` |
| SPEC-8-05 | Un tocco seleziona; Conferma risolve il turno | B04, B05 | Conforme | AUD-002 risolto: nessuna selezione predefinita su postura non disponibile, Conferma non lancia (prova a 360×780, scena e griglia) |
| SPEC-8-06 | Fine duello: esito, statistiche, "Rigioca (stesso seed)", "Rigioca (nuovo seed)", "Menu" | B04 | Conforme | `src/ui/render.ts:162-170` |
| SPEC-8-07 | Telemetria `limen.arena.telemetria` con i campi del §8 | B04 | Conforme | `src/ui/arena.ts:131-152` |
| SPEC-8-08 | Contatore, "Copia JSON" con ripiego sull'area di testo, "Azzera" | B04 | Conforme | `src/ui/arena.ts:180-190`, `:230` |
| SPEC-8-09 | Segnaposto testuali da `symbols.ts`, palette sobria | A04, B04 | Conforme | `src/ui/symbols.ts`, `src/ui/styles.css` |

## ARENA_SPEC §9: simulatore
| Id | Requisito | Verifica | Stato | Evidenza |
|---|---|---|---|---|
| SPEC-9-01 | Uso `--duelli --gradi --adattamento --seed`; tabella in console e `sim-out/report.json` | A08, B05 | Conforme | `sim/run.ts:123-165` |
| SPEC-9-02 | Politiche `fissa:*`, `casuale`, `lettore` con le sole informazioni visibili | A08, B07 | Conforme | `sim/run.ts:27-60`: i bot leggono solo la `DuelView` |
| SPEC-9-03 | Obiettivi `lettore` (Recluta ≥ 90%; Duellante, Bruto, Lanciere 60–85%; Mietitore 35–65%) | A08 | Conforme | Rilancio seed 1: 100 · 69,3 · 68,6 · 61,7 · 53,6 |
| SPEC-9-04 | `fissa:*` < 25% e `casuale` < 30% contro i nemici non Recluta | A08 | Conforme | Massimo 24,1% (Bruto, `fissa:attesa`) e 23,9% (Lanciere, `fissa:assalto`); margine stretto: AUD-012 |
| SPEC-9-05 | Turni medi `lettore` 4–8 (Lanciere 4–9 per §12.6 2) e ≤ 14 contro il Mietitore | A08 | Conforme | 7,0 · 7,4 · 7,8 · 8,7 (Lanciere) · 11,1 |
| SPEC-9-06 | Risultati informativi con gradi 3 e adattamento spento | A08, B05 | Conforme | ARENA_REPORT §7.4b e §7.4c, uguali al rilancio |
| SPEC-9-07 | Bilanciamento solo sui numeri ammessi, annotato nel report con prima, dopo e motivo | A07 | Conforme | 36 numeri cambiati, tutti in ARENA_REPORT §7.2; vedi AUD-006 sul perimetro dei numeri |

## ARENA_SPEC §10–§11: fasi e consegna
| Id | Requisito | Verifica | Stato | Evidenza |
|---|---|---|---|---|
| SPEC-10-01 | Un commit per fase F0–F4, con test verdi e typecheck pulito | B06 | Conforme | `070d0c1`, `d6fa0fb`, `82d0e13`, `bae46d3`, `1536fb8` |
| SPEC-10-02 | F4: prova nel browser a 360×780, un duello per nemico, ogni interruttore provato | B05 | Non verificabile | Dichiarato in ARENA_REPORT §1 e §7.8, senza tracce riproducibili; misure dell'Audit coerenti |
| SPEC-11-01 | Report con fasi, tabelle, modifiche, scostamenti, domande, osservazioni | B05 | Conforme | `docs/ARENA_REPORT.md`; inesattezze minori: AUD-010 |

## ARENA_SPEC §12: revisione 1.1
| Id | Requisito | Verifica | Stato | Evidenza |
|---|---|---|---|---|
| SPEC-12.2-01 | R1: chi attacca la Distanza incalza qualunque sia l'esito, salvo Punta o Arresto; evento `incalza` | A05 Matrice e casi | Conforme | `src/core/resolve.ts:264-268`, `:316-319`; `revisione11.test.ts:147` |
| SPEC-12.2-02 | R2: `distanzaConsecutive`; Distanza non disponibile con contatore ≥ 2; cambio gratuito; evento `spalleAlMuro` | A05 casi, A06 | Conforme | `src/core/resolve.ts:95-102`, `:375-381`; `revisione11.test.ts:78`, `:103` |
| SPEC-12.2-03 | R2 per l'IA: mosse di Distanza escluse senza spazio | A05 casi, A06 | Conforme | `src/core/ai.ts:61-63` |
| SPEC-12.2-04 | R3: Attesa non raggiunta da attacchi diventa preparata; nessun accumulo; ×1,5 sul prossimo colpo a danno (attacco, contrattacco, Punta, Arresto) | A05 Matrice e casi | Conforme | `src/core/resolve.ts:199-207`, `:367-371`; `revisione11.test.ts:116-140` |
| SPEC-12.2-05 | R3: vale anche se l'attacco avversario è stato interrotto | — | Non verificabile | Nessuna mossa produce il caso; accettato senza test da §12.6 4 |
| SPEC-12.2-06 | R4: `gradi.distanza`; Punta (grado 2, pesanti) e Arresto (grado 3, non rapidi) costano 1 fiato, non scattano a fiato zero né sui colpi lunghi; l'Arresto dà il vantaggio | A05 casi, A07 | Conforme | `src/core/resolve.ts:252-270`; `revisione11.test.ts:12-66`. Costo verificato in C2 (AUD-017): con costo 2 e fiato 1 la Punta non scatta (A05). |
| SPEC-12.2-07 | R4: grado della Distanza regolabile nel pannello | B04 | Conforme | `src/ui/render.ts:67` |
| SPEC-12.2-08 | R5: Invito (Duellante), Incassare (Bruto), Lanciere con Distanza 3 | A07 | Conforme | `src/data/enemies.ts:68`, `:93`, `:112` |
| SPEC-12.2-09 | R6: l'Assalto è battuto anche dalla Distanza con grado ≥ 2 | A05 casi | Conforme | `src/core/ai.ts:21` |
| SPEC-12.2-10 | R7: `posture[].motivo`, `CombattenteView.spazio` (max 2), id `stato.spalle`, `evento.incalza`, `evento.punta`, `evento.arresto` | A04, A06 | Conforme | `src/core/view.ts:31`, `:59`, `:75`; `src/ui/symbols.ts:23-37` |
| SPEC-12.2-11 | R8: `lettore` aggiornato; `fissa:distanza` ripiega sulla Guardia | A08 | Conforme | Il `lettore` riscritto dall'Audit da R8 dà risultati identici; ordine delle regole: AUD-014 |
| SPEC-12.3-01 | Celle modificate della matrice (Attesa × D e PR, riga della Distanza) | A05 Matrice | Conforme | 24/24 |
| SPEC-12.3-02 | Altri test del §12.3 (gradi della Distanza, spazio alle spalle, Attesa, fiato zero) | A05 casi, B01 | Conforme | Tutti conformi tranne il caso non verificabile SPEC-12.2-05 |
| SPEC-12.4-01 | `fissa:distanza` < 25% di vittorie e < 50% di pareggi contro ogni nemico | A08 | Conforme | A08 con seed 1: Duellante 0,5% (15,4% pareggi), Bruto 0,0%, Lanciere 0,0%, Mietitore 0,0% (0,6%); la Recluta è esclusa (§12.6 1) |
| SPEC-12.4-02 | Bruto: < 25% (eccezione < 30% se serve) | A08 | Conforme | `fissa:assalto` 17,0%, `fissa:attesa` 24,1% |
| SPEC-12.5-01 | F2b con R1–R8, test del §12.3, bilanciamento e sezione "Revisione 1.1" nel report; poi F4 a 360×780 | B05, B06 | Conforme | `8881ea8`, `5ba2e95`; ARENA_REPORT §7 |
| SPEC-12.6-01 | Recluta esclusa dal vincolo su `fissa:distanza` | — | Conforme | A08: `fissa:distanza` contro la Recluta 2,0% vittorie e 98% pareggi, esclusa dal vincolo (informativo) |
| SPEC-12.6-02 | Fendente della Recluta di nuovo intorno a 3–5, con un nuovo bilanciamento | — | Conforme | `src/data/enemies.ts:38`: Fendente 3–5; A07 lo riconosce come valore superato e dichiarato in ARENA_REPORT §8.1 |
| SPEC-12.6-03 | Obiettivo 4–9 turni per il Lanciere | A08 | Conforme | 8,7 turni |
| SPEC-12.6-04 | Stallo di `fissa:attesa` contro il Lanciere accettato, nessuna regola nuova | A08 | Conforme | 0,0% vittorie, 68% pareggi; nessuna regola aggiunta |

## DESIGN.md (parti pertinenti all'arena)
| Id | Requisito | Verifica | Stato | Evidenza |
|---|---|---|---|---|
| DES-1.4-01 | Un singolo file HTML, solo clic o tocco | A09, B04 | Conforme | `dist/index.html` |
| DES-5.1-01 | Turni simultanei; hint della mossa nemica; posture con reazioni | B02 | Conforme | ARENA_SPEC §4 |
| DES-5.2-01 | Quattro posture dall'incrocio intento × tempo; ognuna compra e paga (vigore, fiato, iniziativa) | B02, A07 | Conforme | Recupero basso/alto/medio/alto = 0/2/1/2 |
| DES-5.2-02 | Mantenere la postura è gratis, cambiarla costa fiato | A05 casi | Conforme | Eccezione del cambio gratuito con le spalle al muro non scritta in DESIGN: AUD-005 |
| DES-5.2-03 | Arretrare cede l'iniziativa (incalzare), salvo Punta o Arresto | A05 | Conforme | SPEC-12.2-01 |
| DES-5.2-04 | Spazio alle spalle: dopo 2 turni in Distanza, non disponibile per un turno | A05 casi | Conforme | SPEC-12.2-02 |
| DES-5.2-05 | L'Attesa è una preparazione (×1,5), un solo sistema per tutti | A05 | Conforme | SPEC-12.2-04 |
| DES-5.2-06 | Gradi della Distanza: Punta (2) e Arresto (3) | A05 | Conforme | SPEC-12.2-06 |
| DES-5.2-07 | Ogni nemico ha una risposta all'Assalto | A07, A05 casi | Conforme | Copertura, Parata e Invito, Incassare, Tenere a bada (Distanza 3), Guardia d'osso |
| DES-5.2-08 | Le 4 posture corrispondono alle guardie storiche | A10 | Conforme | DESIGN §5.2 |
| DES-5.3-01 | Ogni reazione ha 2–3 gradi | A05 casi | Conforme | Parata, Schivata e Distanza a 3 gradi |
| DES-5.4-01 | Hint per categoria; portata, velocità e tratti nascosti | A05 casi, B03 | Conforme | Eccezione al primo turno: AUD-004 |
| DES-5.4-02 | Iniziativa: prima il vantaggio, poi la velocità | A05 | Conforme | SPEC-4.3-02 |
| DES-5.4-03 | Recupero del fiato in base all'azione; a fiato zero niente reazioni e danni aumentati | A05 | Conforme | SPEC-4.2-03, SPEC-4.2-04 |
| DES-5.5-01 | Nemico con profili pesati che si adattano alla ripetizione | A05 casi | Conforme | SPEC-5-04 |
| DES-5.5-02 | Danni in intervalli stretti, sempre visibili | B02 | Conforme | Nell'arena l'anteprima è un interruttore A/B (DESIGN §9.2a): AUD-016 |
| DES-5.5-03 | Niente critici casuali: il colpo pieno arriva dal vantaggio | A05 | Conforme | SPEC-4.4-02 |
| DES-5.5a-01 | "Finta" è un termine riservato; la mossa che apre la guardia si chiama Battuta | A10 | Conforme | Nessun uso nel codice |
| DES-5.6-01 | I nemici usano lo stesso sistema del viandante | A05, B07 | Conforme | Vedi SPEC-3-07 |
| DES-8-01 | Simbologia chiara, poco testo; estetica da xilografia | B08 | Conforme | `design/` (direzione A) |
| DES-8.1-01 | Scena a tutto schermo con interfaccia integrata e figure di profilo | — | Conforme | Scena a 360×700 con figure di profilo (sagome statiche); le animazioni sono della fase E (`src/ui/scena.ts`) |
| DES-8.1-02 | Ventaglio dei medaglioni (Distanza, Attesa, Guardia, Assalto), doppio tocco, bersagli ≥ 44 px; griglia classica come variante A/B | B08 | Conforme | Ventaglio con medaglioni 64×84 px nell'ordine Distanza, Attesa, Guardia, Assalto; due tocchi; griglia classica come variante (prova a 360×780) |
| DES-9.2a-01 | Arena: menu dei nemici, interruttori A/B, telemetria locale, simulatore con bot | B04, A08 | Conforme | SPEC-8, SPEC-9 |

## UI_SPEC 1.1 (simboli)
| Id | Requisito | Verifica | Stato | Evidenza |
|---|---|---|---|---|
| UI-2.2-01 | Direzione: giù subito, su inflitto; massa = forza; disco pieno = stato; anello = scelta | B08 | Conforme | Revisione visiva in scala di grigi a 16, 28 e 44 px |
| UI-2.2-02 | Coppie da non confondere, verificate in grigio | B08 | **Parziale** | Interrotto e inarrestabile distinti a 16 px nel disegno di Grafica (assi diversi); ma `src/ui/symbols.ts` ha il vecchio `mod.inarrestabile`: AUD-023, AUD-025 |
| UI-3-01 | viewBox 24, riempimenti in `currentColor`, nessun colore, font o immagine | B08a | Conforme | 38/38 icone |
| UI-3-02 | Bollino: disco r 10,5 con filetto tra r 9 e r 8,3, un solo tracciato evenodd, niente mask né id | B08a | Conforme | 4 stati |
| UI-3-03 | Medaglione: anelli e scala del segno per riposo, selezionato, confermato | B08a | Conforme | `design/symbols.proposed.ts` (MEDAGLIONE) |
| UI-3-04 | Variante `piccolo` senza tagli per i simboli T | B08a | Conforme | 6 simboli |
| UI-3-05 | Taglia minima (colonna "Min") rispettata dagli usi previsti | B08 | **Parziale** | UI_SPEC 1.2 §7.1 allinea le taglie d'uso ai minimi e `design/symbols.proposed.ts` ha il clamp; nel gioco `posture.assalto` e `posture.attesa` restano a 16 px: AUD-008, AUD-025 |
| UI-7-01 | Un SVG per id; 38 id = contratto (25) + estensioni (13) | A04 | Conforme | `design/icons/`, `design/symbols.proposed.ts` |
| UI-7-02 | Etichette come nella tabella §7 | A10 | Conforme | A10: etichette dei 38 simboli identiche a UI_SPEC §7, anche in `src/ui/symbols.ts` ("Preparato", "Colpo a segno", "Preparazione rotta") |
| UI-8-01 | Estensioni del contratto approvate da Planning | A04 | Conforme | Approvate in ARENA_S23_SPEC §2 e presenti in `src/ui/symbols.ts` (A04: 38 id); la tabella di ARENA_SPEC §7 non è riallineata: AUD-026 |
| UI-9-01 | `symbols.proposed.ts` compatibile (SIMBOLI, `simbolo`, `glifo`, `icona`, `medaglione`) e compilabile con `--strict --erasableSyntaxOnly` | B08a | Conforme | `tsc` dell'Audit |
| UI-9-02 | Integrazione di `icona()` e `medaglione()` in `render.ts` | — | Conforme | `icona()` e `medaglione()` in `src/ui/comuni.ts`, `render.ts`, `scena.ts`; A04: id usati dalla UI tutti nel catalogo |

## SCENA_SPEC 0.3 §1 (approvata)
| Id | Requisito | Verifica | Stato | Evidenza |
|---|---|---|---|---|
| SCENA-1.2-01 | Ogni postura differisce dalle altre su almeno 2 assi tra A, B e C | B02 | Conforme | Tabella §1.2: Guardia/Attesa (B, C, A), Assalto/Distanza (A, C) |
| SCENA-1.4-01 | Regola d'informazione: nel modo normale la posa comunica solo la categoria; mosse della stessa categoria e dello stesso nemico, stesso telegrafo | A10, B03 | Non ancora implementato | Niente pose telegrafate nell'arena. Il nemico parte in Guardia (AUD-004 risolto): la vista del primo turno non rivela più l'archetipo |
| SCENA-1.4-02 | Composizione della categoria "difesa" per nemico (Parata e Invito, Incassare, Tenere a bada, Copertura, Guardia d'osso) | A10 | Conforme | `src/data/enemies.ts` |
| SCENA-1.5-01 | Le animazioni derivano dagli eventi del risolutore, nell'ordine | — | Non ancora implementato | Gli eventi esistono (`EventoDuello`); scena in fase E |
| SCENA-1.7-05 | L'Audit verifica la regola d'informazione su tutte le coppie della stessa categoria | — | Non ancora implementato | Da eseguire quando esisteranno i telegrafi (G5) |

## ARENA_S23_SPEC 1.0 (fase C2)
| Id | Requisito | Verifica | Stato | Evidenza |
|---|---|---|---|---|
| S23-2-01 | Simboli definitivi: `src/ui/symbols.ts` = 25 id del contratto + 13 estensioni, con `icona()` e `medaglione()` | A04 | **Parziale** | 38 id presenti; non riallineato a `design/symbols.proposed.ts` (`min`, clamp, `mod.inarrestabile`): AUD-025 |
| S23-2-02 | Palette a un solo colore (UI_SPEC §4): tolti `--accento`, `--ok`, `--fiato` | B04 | Conforme | `src/ui/styles.css`: nessuna occorrenza; palette chiara e scura |
| S23-2-03 | Etichetta con nome e costo sotto i medaglioni; ventaglio come variante A/B | B04 | Conforme | Prova a 360×780: `.et` con nome e costo (o motivo) |
| S23-3-01 | 9 sagome statiche (4 del viandante, 5 nemici) in `design/sagome/`, modulo `design/sagome.proposed.ts` con `sagoma(id, { px })` | A04 | Conforme | 9 id uno a uno in svg, modulo e `src/ui/sagome.ts` (copia identica) |
| S23-3-02 | Le 4 sagome del viandante si distinguono su almeno 2 assi tra A, B e C (SCENA_SPEC §1.7 punto 2) | `design/verifica-sagome.mjs` | Conforme | 6 coppie su 6 con almeno 2 assi, somiglianza massima 0,40; soglie scelte da Grafica: AUD-031; quiz umano non eseguito |
| S23-4-01 | Scena a 360×700, nessuno scroll orizzontale, sagoma della postura attuale, HUD con vigore, pallini del fiato, stati e tacche dello spazio | B04, prova a 360×780 | Conforme | `scrollWidth` 360 in menu, scena e griglia; B04a: `spalle`/`spazio` coerenti con R2 |
| S23-4-02 | Ventaglio: 4 medaglioni nell'ordine Distanza, Attesa, Guardia, Assalto, bersaglio ≥ 44 px, primo tocco seleziona (`aria-pressed`), secondo conferma, altro medaglione cambia, tocco fuori annulla | B04 | Conforme | Prova con clic: 64×84 px; selezione, cambio, annullamento e conferma come da §4 |
| S23-4-03 | Medaglione non disponibile spento con il motivo ("fiato" o "niente spazio") | B04, B04a | Conforme | "Distanza · niente spazio" dopo due turni di Distanza; B04a: motivo sempre presente |
| S23-4-04 | Risoluzione senza animazioni: etichette del colpo per circa 1,2 s con l'icona dell'evento, dissolvenza di 200 ms; un tocco salta | B04 | Conforme | `.colpi` con 2 etichette ("−1", "Parata −4"), rimosse dopo 1,3 s; classe `dissolve` sulla sagoma |
| S23-4-05 | Cassetto del registro: chiuso mostra l'ultima riga, aperto lo storico | B04 | Conforme | Altezza 45 → 315 px entro i 700 px della scena |
| S23-4-06 | Interruttore "Layout: scena / griglia", predefinito scena, salvato nella configurazione e registrato nella telemetria | B04, B05 | Conforme | `#cfg-layout` = scena; record con `layout` `scena` e `griglia` |
| S23-4-07 | Nessuna logica di gioco in `src/ui/` | B04 | Conforme | Lettura di `arena.ts`, `render.ts`, `scena.ts`, `comuni.ts`; due residui di presentazione: AUD-029 |
| S23-5-01 | Telemetria con destinazione automatica (`claude-db` o `locale`), mai bloccante, copia una volta dei record locali, ripiego su `quota_exceeded`, `not_granted`, `revoked` | B05, B04 | Conforme | `src/ui/telemetria.ts`; 15 test dedicati (verificati con `npm test`); lettura del codice |
| S23-5-02 | Record: campi di ARENA_SPEC §8 più `layout`, `versione`, `destinazione`, `id`, `turniDettaglio` (≤ 25) | B05 | Conforme | Record reale letto da `localStorage` dopo 10 duelli: tutti i campi presenti, `turniDettaglio` fino a 10 voci. Id con `:` e `.`: AUD-032 |
| S23-5-03 | Menu: contatore, "Copia JSON", destinazione attiva; "Azzera" solo in locale | B04 | Conforme | Menu a 360×780: destinazione "questo dispositivo (browser)", versione `154a071 · 2026-10-15` |
| S23-5-04 | Scrittura e lettura nel database vero di Claude con la pagina pubblicata | — | Non verificabile | Fuori ambito (verifica di Planning con l'utente); artifact `8ib2HCY2fAPmyVWzSEkiY2` con `capabilities` `db` e `user` |
| S23-6-01 | Workflow `.github/workflows/pages.yml`: push su `main` e manuale; `npm ci`, `npm test`, `npm run typecheck`, `npm run build`, upload di `dist/`; deploy con `pages: write` e `id-token: write` | B05 | Conforme | Lettura del file; `https://dvlabdev.github.io/limen-game/` risponde 200 e serve la versione `154a071` (HEAD) |
| S23-6-02 | Versione della build (hash e data) visibile nel menu e nella telemetria | A09, B05 | Conforme | `scripts/build.ts`; menu e record con "154a071 · 2026-10-15" |
| S23-7-01 | Duello completo contro ogni nemico, entrambi i layout, a 360×780 | B05 | Conforme | 10 duelli su 10 conclusi (5 nemici × 2 layout) con un bot semplice, nessuno scroll orizzontale, nessun errore |
| S23-9-01 | I 24 rilievi della tornata 1 chiusi o assegnati in C2 secondo la tabella della §9 | registro | Parziale | 20 Risolti, 2 Accettati, 2 Aperti (AUD-008, AUD-023, per AUD-025) |

## CLAUDE.md (processo)
| Id | Requisito | Verifica | Stato | Evidenza |
|---|---|---|---|---|
| PROC-01 | Proprietà dei file rispettata | B06 | Conforme | `git log --name-only`: Codice in `src/`, `sim/`, `test/`, `scripts/`, `docs/ARENA_REPORT.md`; Grafica in `design/` e `docs/UI_SPEC.md`; Planning nei documenti |
| PROC-02 | `git add` per percorsi, mai `-A` | B06 | Conforme | F0 e F1 con `-A` (dichiarato), ma con soli file di Codice; racconto inesatto: AUD-010 |
| PROC-03 | Test e typecheck verdi prima di ogni commit; un commit per fase; push su `origin/main` | B06 | Conforme | HEAD `b678030` = `origin/main`; 89 test, 0 errori |
| PROC-04 | `localStorage` sempre in try/catch | B04 | Conforme | `src/ui/arena.ts:33-48` |
| PROC-05 | Termini di dominio come in DESIGN | A10 | Conforme | Eccezione "raccolto": AUD-009 |
| PROC-06 | Solo i numeri si cambiano (balance.ts; pesi, danni e vigore in enemies.ts) | A07, B03 | Conforme | Fiato e velocità dei nemici cambiati come ammette ARENA_SPEC §9 ma non CLAUDE.md: AUD-006 |
| PROC-07 | Artefatti e gioco leggibili su S23 (360×780), bersagli ≥ 44 px, testo ≥ 12 px | B05 | Conforme | Misure dell'Audit: nessun overflow, testo minimo 12 px; caselle del menu: AUD-022 |
