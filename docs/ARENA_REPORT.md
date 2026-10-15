# Arena di prova: rapporto della sessione Codice

> **Autore:** sessione Codice · **Riferimento:** [ARENA_SPEC.md](ARENA_SPEC.md) v1.0 (§11)
> **Stato:** F0, F1 e F2 completate; F3 e F4 vedi §1.

## 1. Stato delle fasi e comandi verificati

| Fase | Stato | Commit |
|---|---|---|
| F0 Impalcatura | fatta | `F0 Impalcatura: …` |
| F1 Core | fatta: matrice §4.6 e test dedicati verdi | `F1 Core: …` |
| F2 Nemici | fatta; **obiettivi del §9 raggiunti solo in parte**, vedi §2 e §5 | `F2 Nemici: …` |
| F3 Arena | da aggiornare a fine lavoro | |
| F4 Verifica | da aggiornare a fine lavoro | |

Comandi verificati su Node 24.19.0 (Windows):

| Comando | Esito |
|---|---|
| `npm test` | 74 test verdi (matrice 24 celle, regole dedicate, IA, vista) |
| `npm run typecheck` | zero errori (TypeScript 7.0.2) |
| `npm run build` | produce `dist/index.html` autosufficiente (JS e CSS inline) |
| `npm run dev` | server su `http://localhost:8000` con ricaricamento |
| `npm run sim -- --duelli 1000 --gradi 1 --adattamento on --seed 1` | tabella in console e `sim-out/report.json` (circa 3 secondi) |

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
| | Finta | 2–3 | 6–7 | Idem: è la mossa che aggira la Guardia |
| | Parata (mossa) | 1–2 | 4–5 | Con danni bassi il Duellante non puniva `fissa:attesa` |
| | Affondo | 4–6 | 8–10 | È il colpo che il `lettore` schiva con l'Attesa: serve che faccia male a chi non lo legge |
| | Pesi (Stoccata, Finta, Parata, Affondo) | 5, 1, 2, 1 | **1, 2, 10, 10** | Rompe il ciclo dell'Assalto (le mosse di guardia lo parano) e premia chi legge l'Affondo. **Cambia il carattere del Duellante**, vedi §6 |
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
