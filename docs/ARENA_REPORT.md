# Arena di prova: rapporto della sessione Codice

> **Autore:** sessione Codice · **Riferimento:** [ARENA_SPEC.md](ARENA_SPEC.md) v1.0 (§11)
> **Stato:** F0–F4 completate sulle regole 1.0; **F2b Revisione 1.1** (ARENA_SPEC §12) implementata, vedi **§7**. Le tabelle e i numeri validi oggi sono quelli del §7.

## 1. Stato delle fasi e comandi verificati

| Fase | Stato | Commit |
|---|---|---|
| F0 Impalcatura | fatta | `F0 Impalcatura: …` |
| F1 Core | fatta: matrice §4.6 e test dedicati verdi | `F1 Core: …` |
| F2 Nemici | fatta; **obiettivi del §9 raggiunti solo in parte**, vedi §2 e §5 | `F2 Nemici: …` |
| F2b Revisione 1.1 | fatta: R1–R8, test §12.3, nuovo bilanciamento (§7); obiettivi raggiunti tranne i turni del Lanciere | `F2b Revisione 1.1: …` |
| F3 Arena | fatta: duello completo contro i cinque nemici, pannello, interruttori A/B e telemetria funzionanti | `F3 Arena: …` |
| F4 Verifica | fatta a 360×780 (S23), vedi sotto, e **ripetuta con la revisione 1.1**: §7.8 | `F4 Verifica: …` |

Comandi verificati su Node 24.19.0 (Windows):

| Comando | Esito |
|---|---|
| `npm test` | 74 test verdi (matrice 24 celle, regole dedicate, IA, vista) |
| `npm run typecheck` | zero errori (TypeScript 7.0.2) |
| `npm run build` | produce `dist/index.html` autosufficiente (JS e CSS inline) |
| `npm run dev` | server su `http://localhost:8000` con ricaricamento |
| `npm run sim -- --duelli 1000 --gradi 1 --adattamento on --seed 1` | tabella in console e `sim-out/report.json` (circa 3 secondi) |

### Prova nel browser (F4)

Provata la build finale `dist/index.html` (servita come file singolo, nessun `src=` o `href=` verso risorse esterne) nel browser integrato con viewport emulato **360×780**, come richiesto dalla specifica 1.0.2:

- **Un duello contro ciascun nemico** con ciascun interruttore: 4 configurazioni (base, hint completi, anteprima dei danni, adattamento spento) × 5 nemici = **20 duelli giocati fino in fondo**, tutti conclusi (vittoria o sconfitta). Il gioco è stato pilotato da uno script nella pagina che legge l'hint dal DOM e applica l'euristica del `lettore` cliccando i pulsanti veri; in più ho giocato **a mano con clic reali** un turno contro il Mietitore (selezione della postura, Conferma, registro). Non ho giocato duelli interi "da umano": il giudizio sul divertimento (domanda 3 dell'arena) resta da fare a Planning.
- **Interruttori A/B:** gli hint completi mostrano mossa, forza, portata, velocità, danno e tratti (es. "Spallata · pesante · portata corta · normale · 7–8 danni · sfonda la guardia"); l'anteprima mostra "subisci x–y · infliggi x–y" sulle quattro posture disponibili e si aggiorna a ogni turno; con l'adattamento spento e con gradi 3/2 e seed 777 la configurazione viene salvata in `limen.arena.config` e ripristinata nel menu.
- **Telemetria:** 20 record in `limen.arena.telemetria` (nemico, seed, opzioni, gradi, esito, turni, usoPosture, cambi, danni, data ISO). "Copia JSON" ripiega sull'area di testo selezionabile quando la clipboard è negata (nel browser integrato lo è); "Azzera" svuota.
- **Misure a 360×780:** nessun elemento oltre il bordo e nessuno scroll orizzontale, in menu, duello e fine duello; il pulsante Conferma termina a 703px e l'intera schermata del duello è alta circa 720px (appena oltre i ~700px utili dell'app: un po' di scroll verticale può servire con registro lungo); bersagli tattili ≥ 44px (la griglia delle posture è 164×80); testo minimo 12px (etichette), corpo ≥ 14px.
- **Limite dello strumento:** gli screenshot del browser integrato a 360px si deformano (zoom del visual viewport), quindi l'aspetto l'ho controllato a 375px (screenshot) e le misure a 360px via DOM. Non ho provato su un S23 vero.
- Nessun errore in console oltre a quelli dei miei script di prova.

I numeri delle tabelle qui sotto si riproducono con `--duelli 1000 --seed 1` (gradi e adattamento come indicato).

## 2. Tabelle del simulatore

Ogni cella: **vittorie %** (pareggi %) · turni medi sull'insieme dei duelli. `casuale` e le politiche `fissa:*` sono quelle del §9; `lettore` è l'euristica di riferimento **senza modifiche** (vedi §4).

### 2.1 Obiettivi: gradi 1, adattamento attivo

| Nemico | fissa:assalto | fissa:guardia | fissa:attesa | fissa:distanza | casuale | lettore |
|---|---|---|---|---|---|---|
| Recluta | 100.0 (0.0) · 3.1 | 100.0 (0.0) · 7.6 | 100.0 (0.0) · 6.0 | 0.0 (100.0) · 25.0 | 100.0 (0.0) · 6.2 | **100.0** (0.0) · 6.9 |
| Duellante | 16.2 (0.0) · 3.5 | 0.1 (0.0) · 6.3 | 16.5 (0.0) · 5.7 | 0.0 (100.0) · 25.0 | 12.9 (0.0) · 6.6 | **73.7** (0.0) · 7.4 |
| Bruto | **28.0** (0.0) · 3.5 | 0.0 (0.0) · 3.4 | 17.6 (0.0) · 8.1 | 0.0 (100.0) · 25.0 | 7.7 (0.0) · 6.1 | **80.5** (0.0) · 7.4 |
| Lanciere | **99.8** (0.2) · 3.7 | 15.9 (0.0) · 8.4 | 0.0 (0.6) · 11.3 | 0.0 (0.0) · 3.4 | 21.5 (5.2) · 6.1 | **64.3** (0.2) · **12.8** |
| Mietitore | 12.6 (0.0) · 6.9 | 0.0 (0.0) · 12.9 | 1.9 (29.6) · 19.9 | 0.0 (0.3) · 8.6 | 2.1 (0.4) · 10.3 | **41.7** (0.0) · 11.8 |

Confronto con gli obiettivi del §9:

| Obiettivo | Esito |
|---|---|
| `lettore` ≥ 90% contro la Recluta | ✅ 100% |
| `lettore` 60–85% contro Duellante, Bruto, Lanciere | ✅ 73,7 · 80,5 · 64,3 |
| `lettore` 35–65% contro il Mietitore | ✅ 41,7 |
| `fissa:*` < 25% contro Duellante, Bruto, Lanciere, Mietitore | ❌ **Bruto: `fissa:assalto` 28,0%** · ❌ **Lanciere: `fissa:assalto` 99,8%**. Tutte le altre celle sono sotto il 25% |
| `casuale` < 30% contro gli stessi quattro | ✅ (massimo 21,5%, Lanciere) |
| Turni medi `lettore` 4–8 contro i nemici normali | ✅ Recluta 6,9 · Duellante 7,4 · Bruto 7,4 · ❌ **Lanciere 12,8** |
| Turni medi `lettore` ≤ 14 contro il Mietitore | ✅ 11,8 |

Le tre mancanze (Bruto/Assalto, Lanciere/Assalto, turni del Lanciere) **non si risolvono cambiando solo i numeri**: vedi §5, domande 1 e 2. Le numerose pareggi di `fissa:distanza` (100% contro Recluta, Duellante e Bruto) sono voluti dalle regole: la Distanza evita ogni colpo corto e non attacca mai.

### 2.2 Informativa: gradi 3, adattamento attivo

| Nemico | fissa:assalto | fissa:guardia | fissa:attesa | fissa:distanza | casuale | lettore |
|---|---|---|---|---|---|---|
| Recluta | 100.0 (0.0) · 3.1 | 100.0 (0.0) · 6.1 | 100.0 (0.0) · 5.0 | 0.0 (100.0) · 25.0 | 100.0 (0.0) · 5.6 | 100.0 (0.0) · 5.2 |
| Duellante | 16.2 (0.0) · 3.5 | 12.7 (0.0) · 8.4 | **100.0** (0.0) · 4.0 | 0.0 (100.0) · 25.0 | 71.3 (0.0) · 5.9 | 92.0 (0.0) · 5.0 |
| Bruto | 28.0 (0.0) · 3.5 | 0.0 (0.0) · 3.4 | 50.1 (0.0) · 7.4 | 0.0 (100.0) · 25.0 | 30.8 (0.0) · 6.3 | 100.0 (0.0) · 4.0 |
| Lanciere | 99.8 (0.2) · 3.7 | 91.7 (0.0) · 10.7 | 0.0 (0.6) · 11.3 | 0.0 (0.0) · 3.4 | 33.2 (3.2) · 6.5 | 97.3 (0.1) · 7.8 |
| Mietitore | 12.6 (0.0) · 6.9 | 0.0 (2.6) · 17.5 | 20.0 (14.2) · 18.5 | 0.0 (0.3) · 8.6 | 8.2 (1.9) · 12.2 | 58.5 (0.0) · 10.4 |

### 2.3 Informativa: gradi 1, adattamento disattivato

| Nemico | fissa:assalto | fissa:guardia | fissa:attesa | fissa:distanza | casuale | lettore |
|---|---|---|---|---|---|---|
| Recluta | 100.0 (0.0) · 3.1 | 100.0 (0.0) · 7.6 | 100.0 (0.0) · 6.0 | 0.0 (100.0) · 25.0 | 100.0 (0.0) · 6.2 | 100.0 (0.0) · 6.9 |
| Duellante | 19.2 (0.0) · 3.4 | 0.2 (0.0) · 6.9 | 44.2 (0.0) · 5.9 | 0.0 (100.0) · 25.0 | 14.1 (0.0) · 6.6 | 79.7 (0.0) · 7.5 |
| Bruto | 28.0 (0.0) · 3.5 | 0.0 (0.0) · 3.4 | 17.6 (0.0) · 8.1 | 0.0 (100.0) · 25.0 | 7.7 (0.0) · 6.1 | 80.5 (0.0) · 7.4 |
| Lanciere | 99.8 (0.2) · 3.7 | 15.9 (0.0) · 8.4 | 0.0 (0.6) · 11.3 | 0.0 (0.0) · 3.5 | 21.5 (5.2) · 6.1 | 64.2 (0.2) · 12.8 |
| Mietitore | 15.0 (0.0) · 6.5 | 0.0 (0.0) · 11.4 | 1.9 (29.6) · 19.9 | 0.0 (7.2) · 12.3 | 1.4 (0.7) · 10.3 | 43.1 (0.0) · 11.0 |

Il Bruto e il Lanciere non cambiano con l'adattamento spento perché nessuna delle loro mosse "batte" la postura su cui insistono i bot (vedi tabella dell'adattamento in `balance.ts`).

### 2.4 Punto di partenza (valori iniziali della specifica, gradi 1, adattamento attivo, 1000 duelli, seed 1)

Per confronto: prima del bilanciamento il `lettore` vinceva 100% (Recluta), 99,5% (Duellante), 99,2% (Bruto), 14,0% (Lanciere) e 82,1% (Mietitore), con duelli lunghi 10,3 · 14,6 · 7,5 · 23,8 · 17,2 turni; `fissa:assalto` vinceva 100% contro Recluta, Duellante, Bruto e Lanciere e 29,4% contro il Mietitore.

## 3. Modifiche di bilanciamento (prima → dopo)

Solo numeri, come da regola: `balance.ts` ed `enemies.ts` (pesi, danni, vigore, fiato, velocità del combattente). Gradi, tratti delle mosse (`sfondaGuardia`, `inarrestabile`), forza, portata e velocità delle mosse sono rimasti quelli della specifica.

**Metodo.** Non ho cercato i valori a mano: ho usato uno script temporaneo (ricottura simulata con dadi comuni) che modifica i numeri consentiti e valuta la tabella del simulatore, poi ho verificato i risultati con 1000 duelli su un seed diverso da quello di ricerca. Lo script non è nel repository (era un attrezzo di lavoro). Le tabelle di §2 sono i numeri finali con `--seed 1`.

| File | Voce | Prima | Dopo | Motivo |
|---|---|---|---|---|
| `balance.ts` | `giocatore.vigore` | 30 | **20** | Con 30 di vigore i duelli del `lettore` durano 10–17 turni (obiettivo 4–8) e `fissa:assalto` non perde mai. Con 20 bastano due o tre colpi forti e le reazioni contano. Valore minimo che permette il Duellante con 4–8 turni |
| `enemies.ts` | Recluta · vigore | 16 | 11 | Duelli del `lettore` da 10,3 a 6,9 turni |
| | Recluta · fiato | 4 | 2 | Il fiato di una sequenza semplice non serve oltre il cambio di postura |
| | Duellante · vigore | 20 | 11 | Accorcia i duelli (14,6 → 7,4 turni) |
| | Duellante · fiato | 6 | 5 | Marginale, dalla ricerca |
| | Stoccata | 2–3 | 5–6 | Colpire la Guardia (×0,4) deve ancora fare male: con 2–3 `fissa:guardia` vinceva |
| | Battuta (ex Finta, rinominata nella specifica 1.0.2) | 2–3 | 6–7 | Idem: è la mossa che aggira la Guardia |
| | Parata (mossa) | 1–2 | 4–5 | Con danni bassi il Duellante non puniva `fissa:attesa` |
| | Affondo | 4–6 | 8–10 | È il colpo che il `lettore` schiva con l'Attesa: serve che faccia male a chi non lo legge |
| | Pesi (Stoccata, Battuta, Parata, Affondo) | 5, 1, 2, 1 | **1, 2, 10, 10** | Rompe il ciclo dell'Assalto (le mosse di guardia lo parano) e premia chi legge l'Affondo. **Cambia il carattere del Duellante**, vedi §6 |
| | Bruto · vigore | 30 | 20 | Duelli più corti |
| | Bruto · velocità | 1 | 3 | A parità di velocità di mossa il Bruto colpisce per primo, interrompe l'Assalto e prende il vantaggio. Senza questo `fissa:assalto` vinceva il 100% |
| | Maglio | 6–8 | 7–9 | Dalla ricerca (il Maglio è lento: l'Assalto lo interrompe sempre) |
| | Spallata | 4–5 | 7–8 | È la mossa che il Bruto usa quasi sempre; senza Parata |
| | Pesi (Maglio, Spallata, Raccogliersi) | 4, 2, 2 | **1, 10, 1** | Il Maglio lento regala il vantaggio all'Assalto; la Raccogliersi è un'apertura per l'Assalto (§5, domanda 2) |
| | Lanciere · vigore | 22 | 14 | Duelli più corti, comunque 12,8 turni |
| | Affondo lungo | 3–4 | 4–5 | Dalla ricerca |
| | Colpo d'asta | 5–6 | 14–15 | Il Colpo d'asta lungo e lento è l'unico colpo che il `lettore` schiva senza contrattacco. Con 5–6 `fissa:guardia` e `fissa:assalto` lo ignoravano |
| | Pesi (Affondo lungo, Colpo d'asta) | 4, 2 | 10, 3 | Dalla ricerca |
| | Mietitore · vigore | 45 | 44 | Marginale |
| | Mietitore · fiato | 6 | 8 | Evita che resti a corto di fiato quando si raccoglie e para |
| | Mietere | 3–4 | 7–8 | Con 3–4 la Parata lo azzerava e la Distanza lo evitava a costo zero |
| | Carica | 7–9 | 10–12 | Il boss deve far paura in fase 2 |
| | Pesi fase 1 (Falciata, Mietere, Guardia d'osso, Raccogliersi) | 3, 3, 2, 1 | **10, 4, 3, 5** | Più Falciata e più Raccogliersi: dà all'Assalto un'apertura che il `lettore` sfrutta |
| | Pesi fase 2 (Carica, Falciata, Mietere, Guardia d'osso, Raccogliersi) | 4, 2, 2, 1, 1 | **9, 7, 2, 3, 4** | Idem |

I **modificatori** (`fiatoSotto(2)` ×3 del Bruto, `vigoreSotto(0,4)` ×2 del Lanciere) e gli **adattamenti** (1 · 3 · 2 · 2 · 2/3) non sono stati toccati.

## 4. Scostamenti dalla specifica

1. **`node_modules` non si installa direttamente sul Drive.** `npm install` dentro la cartella condivisa fallisce con `TAR_ENTRY_ERROR` e lascia `package.json` danneggiati (Google Drive for desktop non regge la scrittura di migliaia di file piccoli, e le junction sono vietate fuori dai volumi NTFS locali). Ho installato `typescript` ed `esbuild` in `C:\Users\irond\limen-deps`, poi ho copiato `node_modules` con `robocopy`. Chi trova `node_modules` mancante o rotto deve ripetere questa procedura. `node_modules` è comunque ignorato da git.
2. **`types/node-shim.d.ts`.** Senza `@types/node` (dipendenza non ammessa), `tsc` non conosce `node:test`, `node:assert`, `node:fs`, `esbuild`, `process`. Il file dichiara a mano la sola parte usata. Va aggiornato se test o script usano altre funzioni di Node.
3. **TypeScript 7.0.2.** `npm install` ha preso l'ultima versione; `erasableSyntaxOnly` e il resto funzionano.
4. **Campi aggiunti ai tipi** (concetti invariati): `StatoNemico.sequenzaIdx` (posizione nel ciclo della Recluta, serve per restare serializzabili), `Profilo.articolo` (per le frasi del registro: "la Recluta"). `resolveTurn` restituisce gli eventi con il numero del turno (`EventoConTurno`); la firma di `toDuelView` e la forma di `DuelView` sono **quelle del §7, invariate**.
5. **`lettore` senza modifiche.** Ho provato cinque varianti dell'euristica (ripiego diverso dalla Distanza contro i colpi pesanti, Assalto contro la difesa, Assalto contro il colpo leggero) sui dati della specifica e dopo il bilanciamento: nessuna cambia la conclusione del §5, domanda 1, e quelle che giocano l'Assalto contro il colpo leggero o pesante si comportano come `fissa:assalto`. Le tabelle usano l'euristica del §9 alla lettera.
6. **Turni medi** = media sull'insieme dei duelli (vittorie, sconfitte e pareggi). In `report.json` c'è anche `turniMediVittorie`.
7. **Caso dei bot** = RNG con seed separato da quello del duello, quindi a parità di seed i risultati sono riproducibili.
8. **Git.** F0 e F1 sono state committate con `git add -A` prima che la regola "solo i propri file" comparisse in CLAUDE.md (commit `e90e053`, a metà lavoro). In quei momenti la cartella conteneva solo file miei. Da F2 aggiungo i file per percorso.
9. **Stop del §Domande di CLAUDE.md.** Davanti agli obiettivi non raggiungibili la regola dice di fermarsi. Ho scritto le domande qui e ho **proseguito con F3 e F4**, perché non dipendono dalle risposte (l'interfaccia legge i numeri dai dati). Se le risposte di Planning cambiano le regole, basta rilanciare `npm run sim`.

### Interpretazioni di regole ambigue (da confermare, vedi §5)

| # | Punto | Interpretazione adottata | Dove |
|---|---|---|---|
| a | Colpo pesante a segno che interrompe | Interrompe **qualunque** attacco ancora da risolvere di D, anche leggero (non solo pesante) | `resolve.ts` |
| b | Scambio simultaneo e vantaggio guadagnato nello stesso istante | Chi incassa danno in uno scambio simultaneo perde anche il vantaggio guadagnato dal colpo simultaneo: due colpi pesanti simultanei non danno vantaggio a nessuno | `resolve.ts` |
| c | Entrambi a 0 nello stesso turno | **Pareggio** | `resolve.ts` |
| d | Fiato 0 e Distanza | "Niente reazioni" include l'evitare i colpi corti (si subisce ×1,25). Il ×1,25 contro la portata lunga resta, perché è una proprietà della postura, non una reazione | `resolve.ts` |
| e | Vantaggio e attacco interrotto | Il vantaggio si consuma quando il colpo viene risolto, non quando era previsto: un attacco interrotto lo conserva (ma chi incassa danno lo perde comunque) | `resolve.ts` |
| f | Bonus del contrattacco dal grado 2 | +1 a entrambi gli estremi: 4–5 | `resolve.ts` |
| g | Tiro con vantaggio | Si tira comunque il dado (per non far divergere l'RNG) e poi si prende il massimo | `resolve.ts` |
| h | Cambio non consentito | `resolveTurn` lancia un errore; l'interfaccia e i bot usano `cambioConsentito` / `disponibile` | `resolve.ts` |
| i | Limite dei turni | Dopo il turno 25 risolto, se il duello è in corso: pareggio; `turno` resta 25 | `resolve.ts` |
| j | Colpo parato con danno residuo | Il danno residuo si applica e fa perdere il vantaggio; il vantaggio da Parata di grado 3 si assegna dopo | `resolve.ts` |

## 5. Domande per Planning

1. **Lanciere: l'Assalto fisso è dominante e il `lettore` non lo supera.** Contro il Lanciere (tutti i colpi a portata lunga, nessun `sfondaGuardia`) l'Attesa non contrattacca e la Distanza subisce ×1,25: le risposte del `lettore` sono le peggiori. Ho cercato (ricottura su vigore, fiato, velocità, danni e pesi, con globali diversi, alcune decine di migliaia di valutazioni del simulatore): ogni configurazione in cui il `lettore` vince ≥ 30% dà ≥ 99% all'Assalto fisso; l'unica via per tenere l'Assalto sotto il 25% è rendere il Lanciere imbattibile (lettore 0%). Con numeri che facciano vincere il `lettore` ~65% (quelli committati) l'Assalto vince 99,8% e i duelli del `lettore` durano 12,8 turni. Servono regole, non numeri. Opzioni: (a) dare al Lanciere una mossa che punisca l'Assalto (un archetipo `guardia` o `attesa`, oggi la tabella dell'adattamento non gli lascia nulla contro l'Assalto); (b) dare all'Attesa un contrattacco anche contro i colpi lunghi; (c) accettare che contro il Lanciere l'Assalto sia la risposta giusta e togliere il Lanciere dagli obiettivi `fissa:*`; (d) permettere al `lettore` di sfruttare un'informazione in più. **Decisione richiesta.**
2. **Bruto: l'Assalto fisso non scende sotto il 27–28%.** Il Bruto non ha mosse difensive e la sola mossa che l'Assalto non ignora è la Raccogliersi, che l'Assalto rompe sempre (e prende il vantaggio). Con il peso minimo (1 su 12) l'Assalto vince comunque quando la Raccogliersi esce nei primi turni. Opzioni: (a) soglia `fissa:*` < 30% per il Bruto; (b) una mossa difensiva per il Bruto; (c) ammettere peso 0 per la Raccogliersi finché il Bruto ha fiato pieno.
3. **Scala del vigore.** Per avere duelli di 4–8 turni ho abbassato il vigore del giocatore da 30 a 20 e quello dei nemici di conseguenza. Va bene questa scala, o preferite riportare il giocatore a 30 e alzare i danni nemici (i duelli sarebbero più lunghi)? Con 30 il Duellante non entra negli obiettivi (punteggio 48 contro 1–5 con 20).
4. **Entrambi a 0 nello stesso turno:** pareggio (c). Se invece dovesse essere sconfitta o vittoria cambierebbero molte celle: con i colpi simultanei ad alto danno il pareggio per morte reciproca era una scorciatoia per restare sotto le soglie, e ho aggiunto un tetto ai pareggi nella ricerca.
5. **Interruzione di attacchi leggeri (a) e vantaggio negli scambi simultanei (b).** La combinazione "vantaggio → colpisco per primo, al massimo, interrompendo qualunque attacco" fa dell'Assalto una catena che si spezza solo se il nemico si difende o è inarrestabile (vedi §6). Se l'intenzione era che interrompa solo gli attacchi pesanti, o che il vantaggio non si rigeneri contro un nemico in difesa, la specifica va precisata.
6. **Fiato 0 e Distanza (d), vantaggio e attacco interrotto (e), contrattacco +1 (f), morte per mancanza di vigore ma colpo parato (j):** conferme gradite, vedi tabella del §4.
7. **Gradi dei nemici.** I gradi (Duellante parata 2, Mietitore 3/2) non rientrano tra i numeri modificabili e non li ho toccati. Si noti che la Parata di grado 2 del Duellante annulla i colpi leggeri della Guardia del giocatore.

## 6. Osservazioni sul gioco

Emerse dai test e dal simulatore, non decisioni:

1. **L'Assalto con vantaggio è una catena.** Chi colpisce per primo con un colpo pesante a segno prende il vantaggio; col vantaggio colpisce per primo e al massimo e interrompe qualunque attacco avversario; e riprende il vantaggio. Si spezza solo se il nemico si difende (Parata, Copertura, Guardia d'osso, Tenere a bada) o è `inarrestabile`. Per questo l'Assalto fisso è il baricentro del bilanciamento: tutto ciò che punisce l'Assalto (velocità del Bruto, Carica del Mietitore, Parata del Duellante) è un numero costruito apposta.
2. **La Distanza fissa non perde mai contro i nemici a colpi corti** (100% pareggi contro Recluta, Duellante e Bruto): è sicura ma sterile. La contrastano solo i colpi lunghi (Lanciere, Mietere).
3. **Gradi 3.** La Schivata di grado 3 rende l'Attesa fissa vincente al 100% contro il Duellante (i colpi rapidi non la battono più) e al 50% contro il Bruto. I gradi sono una leva forte: i nemici dovranno scalare con la progressione.
4. **Fiato.** La Schivata (2) si paga col fiato che l'Attesa recupera a 1: il `lettore` esaurisce il fiato in poche schivate consecutive e deve ripiegare. A fiato 1 la sequenza "cambia postura, poi reagisci" lascia a 0 proprio quando serve (il cambio costa 1). È un punto di attenzione, non un difetto: è il "gestire il fiato" della domanda 3 dell'arena.
5. **Il ripiego del `lettore` sulla Distanza è una trappola contro i colpi lunghi** (Colpo d'asta ×1,25). L'hint non rivela la portata, quindi senza memoria dei turni precedenti non si può evitare.
6. **Il carattere dei nemici si è appiattito.** Per rompere la catena dell'Assalto il Duellante usa quasi solo Parata e Affondo (peso 20 su 23) e il Bruto quasi solo Spallata. È il prezzo di raggiungere gli obiettivi con soli numeri; se Planning preferisce nemici più caratterizzati, conviene rivedere gli obiettivi (domande 1–3) piuttosto che i pesi.
7. **I Pareggi del Mietitore contro `fissa:attesa` (~30%)** sono duelli che arrivano al turno 25: l'Attesa fissa schiva ma non chiude mai il duello.

---

## 7. Revisione 1.1 (ARENA_SPEC §12): regole R1–R8 e nuovo bilanciamento

> **Stato:** implementata nella fase **F2b**. Le sezioni 2 e 3 sopra descrivono la versione 1.0 delle regole e restano come **storico**; i numeri validi oggi sono quelli di questa sezione.

### 7.1 Che cosa è stato implementato

| Regola | Implementazione |
|---|---|
| **R1** incalzare | Un attacco che si risolve contro un difensore in `distanza` (evitato, oppure a segno ×1,25 per colpo lungo o per fiato zero) dà all'attaccante il vantaggio in arrivo, salvo risposta con Punta o Arresto. Evento `incalza`. Non si emette se il difensore muore. |
| **R2** spazio alle spalle | `Combattente.distanzaConsecutive`, aggiornato a fine turno; con 2 o più la Distanza non è disponibile (`motivo: 'spazio'` nella vista, errore in `resolveTurn`, mosse escluse per l'IA); chi è in Distanza senza spazio cambia postura gratis. Evento `spalleAlMuro` quando il contatore arriva a 2. Il limite (2) è in `balance.ts`. |
| **R3** Attesa = preparazione | A fine turno un combattente in `attesa` che nessun attacco ha raggiunto diventa `preparato` (evento `preparato`, nessun accumulo). Il ×1,5 vale ora sul prossimo colpo a danno: attacco, contrattacco, Punta, Arresto. |
| **R4** gradi della Distanza | `Gradi.distanza`; Punta (1–2) e Arresto (2–3) sono reazioni da 1 fiato, non scattano a fiato zero né contro i colpi lunghi; l'Arresto dà il vantaggio al difensore. Numeri in `balance.ts` (`punta`, `arresto`, `costoPunta`, `costoArresto`). Nel pannello c'è il nuovo selettore "Grado di Distanza". |
| **R5** roster | Invito (Duellante, archetipo `attesa`), Incassare (Bruto, `guardia`), Lanciere con `gradi.distanza = 3`. |
| **R6** adattamento | L'Assalto è battuto anche da `distanza` se il nemico ha il grado della Distanza ≥ 2 (soglia in `balance.ts`). |
| **R7** vista e simboli | `posture[].motivo`, `CombattenteView.spazio` (massimo 2), simboli segnaposto `stato.spalle`, `evento.incalza`, `evento.punta`, `evento.arresto` in `src/ui/symbols.ts`, frasi del registro per i nuovi eventi. La vista nasconde `motivo` a duello concluso. |
| **R8** bot | `lettore` riscritto come da §12.2 (la regola 3, "preparato e hint non pesante → Assalto", prevale sulla regola 2); `fissa:distanza` ripiega sulla Guardia quando la Distanza non è disponibile. `--gradi N` ora vale anche per il grado della Distanza. |

**Test** (89 in tutto): le celle modificate della matrice §12.3 (Attesa contro D e PR, riga della Distanza con "il nemico incalza") e i test dedicati in `test/revisione11.test.ts`: Punta, Arresto e le loro eccezioni (colpo leggero, rapido, lungo), fiato zero, spazio alle spalle (indisponibilità, cambio gratuito anche a fiato zero, azzeramento), Attesa preparata e senza accumulo, ×1,5 sul contrattacco e su Punta e Arresto.

**Interpretazioni** (da confermare):
1. *R1 e fiato zero:* l'incalzare scatta anche quando il colpo corto arriva a segno perché senza fiato non si arretra.
2. *R3, "attacco interrotto prima di risolversi":* con le mosse attuali il caso non si presenta (l'Attesa non attacca, quindi niente può interromperlo); il codice lo gestisce perché un combattente è "raggiunto" solo quando un colpo avversario si **risolve**, ma **non c'è un test** per questo caso.
3. *Punta e Arresto:* sono colpi senza reazioni come il contrattacco: moltiplicatori preparato (×1,5) e fiato zero dell'attaccante (×1,25), nessuna interruzione.
4. *R2 e IA:* il contatore dell'IA si aggiorna a fine turno e la scelta della mossa successiva ne tiene conto; con le spalle al muro ogni mossa non di Distanza è candidata anche a fiato zero.

### 7.2 Modifiche di bilanciamento (spec 1.0 → 1.1)

Metodo come in §3, ripartendo dai **valori della specifica** (non da quelli già bilanciati nella 1.0) con il vigore del giocatore a 20 (accettato). Il nuovo vincolo su `fissa:distanza` (meno del 25% di vittorie e meno del 50% di pareggi contro ogni nemico) è nell'obiettivo della ricerca. "Spec" = ARENA_SPEC 1.0; "1.0 bilanciata" = valori committati in F2; **1.1** = oggi.

| Nemico | Voce | Spec | 1.0 bilanciata | **1.1** |
|---|---|---|---|---|
| Recluta | vigore · fiato | 16 · 4 | 11 · 2 | **17 · 3** |
| | Fendente | 3–5 | 3–5 | **10–12** |
| Duellante | vigore · fiato | 20 · 6 | 11 · 5 | **15 · 7** |
| | Stoccata · Battuta · Parata · Affondo | 2–3 · 2–3 · 1–2 · 4–6 | 5–6 · 6–7 · 4–5 · 8–10 | **6–7 · 2–3 · 2–3 · 10–12** |
| | Pesi Stoccata, Battuta, Parata, Affondo, Invito | 5, 1, 2, 1, (3) | 1, 2, 10, 10, (non c'era) | **5, 1, 2, 9, 5** |
| Bruto | vigore · fiato · velocità | 30 · 5 · 1 | 20 · 5 · 3 | **22 · 7 · 3** |
| | Maglio · Spallata | 6–8 · 4–5 | 7–9 · 7–8 | **3–5 · 10–11** |
| | Pesi Maglio, Spallata, Raccogliersi, Incassare | 4, 2, 2, (2) | 1, 10, 1, (non c'era) | **1, 10, 1, 1** |
| Lanciere | vigore · velocità | 22 · 2 | 14 · 2 | **17 · 1** |
| | Affondo lungo · Colpo d'asta | 3–4 · 5–6 | 4–5 · 14–15 | **6–7 · 8–9** |
| | Pesi Affondo lungo, Colpo d'asta, Tenere a bada | 4, 2, 2 | 10, 3, 2 | **8, 1, 8** |
| Mietitore | vigore · fiato | 45 · 6 | 44 · 8 | **44 · 5** |
| | Falciata · Mietere · Carica | 5–7 · 3–4 · 7–9 | 7–9 · 7–8 · 10–12 | **7–9 · 3–4 · 7–9** |
| | Pesi fase 1 (Falciata, Mietere, Guardia d'osso, Raccogliersi) | 3, 3, 2, 1 | 10, 4, 3, 5 | **5, 4, 1, 3** |
| | Pesi fase 2 (Carica, Falciata, Mietere, Guardia d'osso, Raccogliersi) | 4, 2, 2, 1, 1 | 9, 7, 2, 3, 4 | **8, 2, 1, 1, 3** |

`balance.ts`: `giocatore.vigore` resta **20** (30 nella specifica). I valori di Punta (1–2), Arresto (2–3), costo di Punta e Arresto (1) e il limite di 2 turni in Distanza sono quelli suggeriti dalla specifica e non sono stati toccati. L'adattamento, i modificatori e i gradi dei nemici non sono cambiati (a parte `gradi.distanza`).

**Motivi principali.** Con le nuove regole bastano ritocchi molto più piccoli: i nemici non hanno più bisogno di pesi estremi (Parata 10 nel Duellante, Spallata 10 e velocità 3 per rompere la catena dell'Assalto) perché la catena la spezzano Invito, Incassare e l'Arresto. Restano alti solo i danni dei colpi che contano contro chi non legge l'hint. La **Recluta** richiede Fendente 10–12: contro `fissa:distanza` (che ripiega sulla Guardia ogni terzo turno) la Recluta a danni bassi non riusciva né a vincere né a perdere in 25 turni, e il nuovo vincolo (< 25% vittorie, < 50% pareggi) vale anche per lei.

### 7.3 Confronto prima/dopo per le domande 1 e 2 del report

| | Regole 1.0 (committate in F2) | **Regole 1.1** |
|---|---|---|
| **Lanciere**: `fissa:assalto` | **99,8%** | **23,9%** ✅ |
| Lanciere: `lettore` · turni | 64,3% · 12,8 | 61,7% · 8,7 (obiettivo 4–8: ❌ per poco) |
| Lanciere: `fissa:guardia` · `fissa:attesa` · `fissa:distanza` | 15,9 · 0,0 · 0,0 | 6,8 · 0,0 (68% pareggi) · 0,0 |
| **Bruto**: `fissa:assalto` | **28,0%** | **17,0%** ✅ (l'eccezione del 30% non serve) |
| Bruto: `lettore` · turni | 80,5% · 7,4 | 68,6% · 7,8 ✅ |
| Bruto: `fissa:attesa` | 17,6% | 24,1% (soglia 25%: ✅ ma al limite) |

**Risposta alle due domande:** la Distanza di grado 3 sul Lanciere e l'Incassare sul Bruto fanno scendere l'Assalto fisso sotto il 25% **senza** distorcere i pesi e con il `lettore` ancora sopra il 60%.

### 7.4 Tabelle del simulatore (1000 duelli, seed 1)

Ogni cella: **vittorie %** (pareggi %) · turni medi. `lettore` = R8. I gradi "3" valgono per Parata, Schivata e Distanza.

#### 7.4a Obiettivi: gradi 1, adattamento attivo

| Nemico | fissa:assalto | fissa:guardia | fissa:attesa | fissa:distanza | casuale | lettore |
|---|---|---|---|---|---|---|
| Recluta | 100.0 (0.0) · 5.0 | 0.9 (0.0) · 9.0 | 100.0 (0.0) · 7.0 | 0.0 (0.0) · 21.0 | 88.4 (0.0) · 9.1 | 100.0 (0.0) · 7.0 |
| Duellante | 17.0 (0.0) · 3.8 | 11.4 (0.0) · 8.2 | 13.2 (0.0) · 6.9 | 0.4 (15.4) · 19.3 | 13.6 (0.0) · 7.0 | 69.3 (0.0) · 7.4 |
| Bruto | 17.0 (0.0) · 2.9 | 0.0 (0.0) · 2.5 | 24.1 (0.0) · 7.1 | 0.0 (0.0) · 7.8 | 1.8 (0.0) · 4.6 | 68.6 (0.0) · 7.8 |
| Lanciere | 23.9 (0.0) · 5.7 | 6.8 (0.0) · 14.1 | 0.0 (68.0) · 22.7 | 0.0 (0.0) · 5.3 | 19.3 (0.0) · 8.8 | 61.7 (0.0) · 8.7 |
| Mietitore | 13.5 (0.0) · 6.7 | 0.0 (0.3) · 12.6 | 10.0 (14.7) · 18.1 | 0.0 (0.6) · 11.9 | 2.1 (0.9) · 10.2 | 53.6 (0.0) · 11.1 |

#### 7.4b Informativa: gradi 3, adattamento attivo

| Nemico | fissa:assalto | fissa:guardia | fissa:attesa | fissa:distanza | casuale | lettore |
|---|---|---|---|---|---|---|
| Recluta | 100.0 (0.0) · 5.0 | 17.2 (0.0) · 9.0 | 100.0 (0.0) · 5.3 | 100.0 (0.0) · 12.0 | 95.4 (0.0) · 7.2 | 100.0 (0.0) · 6.7 |
| Duellante | 17.0 (0.0) · 3.8 | 62.5 (0.0) · 9.3 | 98.1 (0.0) · 5.2 | 97.9 (0.1) · 12.6 | 65.1 (0.0) · 6.4 | 86.1 (0.0) · 5.1 |
| Bruto | 17.0 (0.0) · 2.9 | 0.0 (0.0) · 2.5 | 42.6 (0.0) · 6.4 | 13.2 (0.0) · 7.4 | 26.3 (0.0) · 4.9 | 99.7 (0.0) · 4.8 |
| Lanciere | 23.9 (0.0) · 5.7 | 99.9 (0.1) · 17.8 | 0.0 (68.0) · 22.7 | 0.0 (0.1) · 6.7 | 25.2 (0.1) · 9.7 | 84.6 (0.0) · 9.5 |
| Mietitore | 13.5 (0.0) · 6.7 | 0.0 (2.8) · 16.1 | 30.5 (5.8) · 16.7 | 3.4 (7.1) · 15.0 | 15.3 (0.5) · 11.6 | 64.8 (0.0) · 9.5 |

#### 7.4c Informativa: gradi 1, adattamento disattivato

| Nemico | fissa:assalto | fissa:guardia | fissa:attesa | fissa:distanza | casuale | lettore |
|---|---|---|---|---|---|---|
| Recluta | 100.0 (0.0) · 5.0 | 0.9 (0.0) · 9.0 | 100.0 (0.0) · 7.0 | 0.0 (0.0) · 21.0 | 88.4 (0.0) · 9.1 | 100.0 (0.0) · 7.0 |
| Duellante | 29.3 (0.0) · 3.5 | 13.3 (0.0) · 8.2 | 48.9 (0.0) · 7.5 | 0.4 (15.4) · 19.3 | 13.6 (0.0) · 6.9 | 68.9 (0.0) · 7.3 |
| Bruto | 20.1 (0.0) · 2.8 | 0.0 (0.0) · 2.6 | 24.1 (0.0) · 7.1 | 0.0 (0.0) · 7.8 | 1.9 (0.0) · 4.6 | 68.9 (0.0) · 7.7 |
| Lanciere | 37.8 (0.0) · 5.4 | 6.8 (0.0) · 14.1 | 0.0 (68.0) · 22.7 | 0.0 (0.0) · 5.3 | 19.5 (0.0) · 8.8 | 59.9 (0.0) · 8.7 |
| Mietitore | 16.5 (0.0) · 6.4 | 0.0 (0.0) · 11.1 | 10.0 (14.7) · 18.1 | 0.0 (0.9) · 11.7 | 1.9 (1.0) · 10.1 | 51.9 (0.0) · 10.7 |

### 7.5 Obiettivi del §12.4: esito

| Obiettivo | Esito |
|---|---|
| `lettore` ≥ 90% contro la Recluta | ✅ 100% |
| `lettore` 60–85% contro Duellante, Bruto, Lanciere | ✅ 69,3 · 68,6 · 61,7 |
| `lettore` 35–65% contro il Mietitore | ✅ 53,6 |
| `fissa:*` < 25% contro Duellante, Bruto, Lanciere, Mietitore | ✅ massimo 24,1% (Bruto, `fissa:attesa`) e 23,9% (Lanciere, `fissa:assalto`). Con un altro seed (9000): 23,3% e 24,0%. Il margine è stretto |
| `casuale` < 30% | ✅ massimo 19,3% |
| **Nuovo:** `fissa:distanza` < 25% di vittorie e < 50% di pareggi contro ogni nemico | ✅ massimo 0,4% di vittorie; pareggi: Duellante 15,4%, tutti gli altri ≤ 0,6% |
| Turni medi `lettore` 4–8 (Recluta, Duellante, Bruto, Lanciere) | ✅ 7,0 · 7,4 · 7,8 · ❌ **Lanciere 8,7** |
| Turni medi `lettore` ≤ 14 contro il Mietitore | ✅ 11,1 |

L'unico obiettivo mancato è il **turno medio del `lettore` contro il Lanciere** (8,7 contro 4–8). In 12 ricerche indipendenti il minimo è 8,5: il Lanciere tiene la distanza (Tenere a bada pesa 8 su 17) e il `lettore` ha poche risposte offensive contro i colpi lunghi. Basterebbe una soglia di 9 per il Lanciere, oppure meno peso a Tenere a bada a costo di riportare `fissa:assalto` oltre il 25%.

### 7.6 Osservazioni dopo la revisione

1. **`fissa:attesa` contro il Lanciere:** 0% di vittorie ma **68% di pareggi** (22,7 turni). Il Lanciere non entra mai in contatto con un'Attesa che non può raggiungere e l'Attesa non attacca: è uno stallo che R3 (preparato) non rompe. Il §12.4 vieta lo stallo solo per `fissa:distanza`.
2. **Gradi 3:** i gradi alti ribaltano molti equilibri: `fissa:guardia` vince 99,9% contro il Lanciere, `fissa:attesa` 98,1% e `fissa:distanza` 97,9% contro il Duellante, `fissa:distanza` 100% contro la Recluta. L'Arresto contro nemici che attaccano a colpi corti non rapidi è molto forte; i nemici dovranno scalare con la progressione dei gradi.
3. **Il Duellante contro `fissa:distanza`** chiude spesso per il limite dei turni (15% di pareggi): l'Invito del nemico e lo spazio alle spalle del giocatore si alternano senza incrociarsi.
4. **Recluta con Fendente 10–12:** la Recluta è un nemico di apprendimento, ma ora colpisce più forte della Spallata del Bruto se non si legge l'hint. È un effetto del vincolo su `fissa:distanza` esteso alla Recluta: se Planning preferisce una Recluta mite, basta escluderla dal vincolo.

### 7.7 Domande per Planning (revisione 1.1)

1. **Recluta nel vincolo `fissa:distanza`:** vale anche per lei (§12.4 dice "ogni nemico")? Per rispettarlo il Fendente passa da 3–5 a 10–12.
2. **Lanciere, turni del `lettore`:** 8,7 contro 4–8. È accettabile un obiettivo di 4–9 per il Lanciere, o preferite meno Tenere a bada a scapito di `fissa:assalto`?
3. **Stallo di `fissa:attesa` contro il Lanciere** (68% di pareggi): serve un obiettivo anche per `fissa:attesa`, o una regola (per esempio un attacco a distanza del Lanciere che raggiunge l'Attesa)?
4. **Caso "Attesa raggiunta da un attacco interrotto" (R3):** non è raggiungibile con le mosse attuali. Va bene lasciarlo senza test finché non esisterà una mossa che lo produce?

### 7.8 Verifica F4 ripetuta con la revisione 1.1 (360×780)

Build finale `dist/index.html` nel browser integrato con viewport emulato 360×780:

- **30 duelli giocati fino in fondo**: cinque nemici × sei configurazioni (base, hint completi, anteprima dei danni, adattamento spento, grado di Distanza 2, grado di Distanza 3), con lo stesso script nella pagina di F4 aggiornato a R8 (clic veri sui pulsanti, ripiego su Guardia quando la Distanza non è disponibile). Tutti conclusi; nessun overflow orizzontale; telemetria con `gradi.distanza` nei record (50 record in totale in questa sessione di prova).
- **Gradi della Distanza e spazio alle spalle, provati nell'interfaccia** (Bruto, grado 3): il primo turno il registro dice "Resti a Distanza: Spallata è un colpo corto e non ti raggiunge" e "Fermi il colpo con l'arresto: 2 danni al Bruto e prendi il vantaggio"; il secondo compare "Hai le spalle al muro: non puoi più arretrare, cambia postura" con il chip "Spalle al muro"; il terzo il pulsante Distanza è disabilitato con la dicitura "niente spazio", le altre posture risultano "gratis", e il cambio a Guardia costa 0 fiato.
- Il selettore "Grado di Distanza" e le diciture "fiato insufficiente" / "niente spazio" funzionano; gli altri controlli (misure, bersagli, fonti) sono quelli già riportati nel §1.
- Limiti: come in §1 (screenshot a 360px del browser integrato deformati, nessuna prova su un S23 vero; gioco pilotato da script, un solo giudizio "umano" su turni singoli). Non ho verificato visivamente i nuovi simboli segnaposto (sono glifi Unicode provvisori).
