# Arena di prova del duello: specifica operativa

> **Versione:** 1.1.1 (15 ottobre 2026): modello delle posture, nuove regole e risposte al report. **La §12 prevale sulle sezioni precedenti dove le modifica.** · **Proprietario:** Planning · **Esecutore:** sessione Codice
> Storico: 1.0.1 dispositivo di riferimento S23 · 1.0.2 la mossa "Finta" del Duellante diventa "Battuta" · 1.1.1 risposte alle domande del report dopo la F2b (§12.6)
> **Prerequisiti:** [DESIGN.md](../DESIGN.md) §5 (combattimento) e [CLAUDE.md](../CLAUDE.md) (regole delle sessioni).

## 0. Scopo
L'arena è un **banco di prova**, non il gioco. Si sceglie un nemico da un menu, si combatte, si ricomincia. Deve rispondere a tre domande:
1. Le **posture** sono tutte utili, o ce n'è una dominante?
2. Le **reazioni** e i loro gradi cambiano davvero le scelte?
3. Leggere l'hint e gestire il fiato è **divertente**?

**Fuori ambito:** oggetti, favori, tecniche, ferite, peso, locanda, milestone, progressione, audio, animazioni elaborate, grafica definitiva. La grafica usa segnaposto e la cura una sessione parallela.

---

## 1. Stack e comandi
- **Node 24+**, TypeScript `strict`. **Dipendenze di sviluppo: solo `typescript` ed `esbuild`.**
- I `.ts` girano direttamente con Node (type stripping). In `tsconfig.json` vanno impostati `erasableSyntaxOnly`, `allowImportingTsExtensions`, `noEmit`, `strict`, `target`/`lib` ES2022 + DOM e `module`/`moduleResolution` `nodenext` o `bundler`. Gli import usano l'estensione `.ts`.
- Test con `node --test` e `node:assert`, senza librerie esterne.

| Script | Comando indicativo | Risultato |
|---|---|---|
| `dev` | `node scripts/dev.ts` | esbuild in serve e watch su `http://localhost:8000` |
| `build` | `node scripts/build.ts` | **`dist/index.html` autosufficiente**, con JS e CSS inline e nessun file esterno |
| `test` | `node --test "test/**/*.test.ts"` | Tutti i test |
| `typecheck` | `tsc` | Zero errori |
| `sim` | `node sim/run.ts` | Tabella in console e `sim-out/report.json` |

---

## 2. Struttura dei file
```
src/
  index.html          template con i segnaposto per script e stile
  main.ts             avvio dell'interfaccia
  core/               PURO: niente DOM, niente Math.random, niente Date
    types.ts          tipi di dominio
    rng.ts            mulberry32; lo stato dell'RNG vive in StatoDuello
    resolve.ts        creaDuello(), resolveTurn()
    ai.ts             scelta della mossa nemica
    view.ts           CONTRATTO UI: toDuelView() → DuelView
  data/
    balance.ts        tutti i numeri delle regole
    postures.ts       le 4 posture del giocatore
    enemies.ts        i 5 nemici
  ui/
    symbols.ts        id simbolo → segnaposto (proprietà di Grafica dopo la consegna)
    styles.css        stile minimo (proprietà di Grafica dopo la consegna)
    render.ts         disegna DuelView nel DOM
    arena.ts          menu, pannello di configurazione, telemetria
sim/run.ts
scripts/build.ts, scripts/dev.ts
test/*.test.ts
```

---

## 3. Modello dei dati
I nomi sono indicativi: si possono rifinire, ma i concetti vanno mantenuti.

```ts
type Archetipo = 'assalto' | 'guardia' | 'attesa' | 'distanza' | 'preparazione';
type PosturaId = 'assalto' | 'guardia' | 'attesa' | 'distanza'; // il giocatore non ha 'preparazione'
type Forza = 'leggero' | 'pesante';
type Portata = 'corta' | 'lunga';
type Velocita = 'rapido' | 'normale' | 'lento';
type Categoria = 'pesante' | 'leggero' | 'difesa' | 'preparazione'; // ciò che l'hint mostra

interface Attacco {
  forza: Forza; portata: Portata; velocita: Velocita;
  danno: [number, number];
  sfondaGuardia?: boolean;   // ignora la Parata
  inarrestabile?: boolean;   // non può essere interrotto
}
interface Mossa { id: string; nome: string; archetipo: Archetipo; attacco?: Attacco }

interface Combattente {
  nome: string;
  vigore: number; vigoreMax: number;
  fiato: number; fiatoMax: number;
  velocita: number;
  postura: Archetipo;
  vantaggio: boolean;
  preparato: boolean;                 // il prossimo attacco vale ×1,5
  gradi: { parata: 1 | 2 | 3; schivata: 1 | 2 | 3 };
}

interface OpzioniArena {
  hintCompleti: boolean;      // A/B: l'hint mostra la mossa esatta e i suoi tratti
  anteprimaDanni: boolean;    // A/B: mostra gli intervalli attesi per ogni postura
  adattamento: boolean;       // A/B: il nemico si adatta alla ripetizione
}

interface StatoDuello {
  turno: number;
  esito: 'in corso' | 'vittoria' | 'sconfitta' | 'pareggio';
  giocatore: Combattente;
  nemico: Combattente & { profiloId: string; fase: 1 | 2 };
  mossaNemico: string;               // già scelta: l'hint deriva da qui
  storicoPosture: PosturaId[];       // scelte del giocatore, per l'adattamento
  rng: number;                       // stato di mulberry32
  seed: number;
  opzioni: OpzioniArena;
}
```

**La postura del giocatore è anche la sua mossa.** `postures.ts` definisce:

| Postura | Archetipo | Attacco |
|---|---|---|
| Assalto | assalto | pesante, corta, normale, 4–6 |
| Guardia | guardia | leggero, corta, rapido, 1–2 |
| Attesa | attesa | nessuno |
| Distanza | distanza | nessuno |

Il risolutore è **simmetrico**: tratta allo stesso modo le mosse del giocatore e quelle del nemico.

**Categoria dell'hint**, ricavata dalla mossa:
- archetipo `preparazione` → `preparazione`;
- archetipo `guardia`, `attesa` o `distanza` → `difesa`, **anche se la mossa contiene un attacco leggero**;
- archetipo `assalto` → `pesante` o `leggero`, secondo `attacco.forza`.

---

## 4. Regole del duello
Tutti i numeri sono in `balance.ts`. I valori qui sotto sono **iniziali**.

### 4.1 Valori di partenza
- **Giocatore:** vigore 30, fiato 4 su 6, velocità 2, postura iniziale Guardia, gradi 1/1 (modificabili dal pannello).
- **Nemico:** valori da `enemies.ts`, fiato al massimo, postura iniziale uguale all'archetipo della prima mossa scelta, senza costo.
- **Limite di 25 turni:** oltre si ha un **pareggio**, che non conta come vittoria.

### 4.2 Costi e recupero
| Voce | Valore |
|---|---|
| Cambio di postura (o di archetipo, per il nemico) | 1 fiato; **non consentito** se il fiato è insufficiente |
| Parata | 1 fiato |
| Schivata | 2 fiato |
| Recupero a fine turno, secondo l'archetipo | assalto 0 · guardia 2 · attesa 1 · distanza 2 · preparazione 3 (fino al massimo) |
| Fiato a 0 nel momento in cui si subisce un colpo | Niente reazioni, danno ×1,25 |

### 4.3 Sequenza del turno
1. **Hint:** la mossa nemica è già scelta (`mossaNemico`) e la vista ne mostra la categoria.
2. **Scelta:** il giocatore sceglie una postura. Tenere quella attuale è gratis.
3. **Pagamento dei cambi:** giocatore e nemico pagano l'eventuale cambio e aggiornano la postura.
4. **Ordine degli attacchi** (solo se attaccano entrambi):
   1. chi ha il **vantaggio** a inizio turno, se lo ha uno solo;
   2. la **velocità della mossa**: rapido > normale > lento;
   3. la **velocità del combattente**;
   4. a parità: **simultanei**, cioè entrambi i colpi si risolvono sullo stato precedente e nessuno interrompe l'altro.
5. **Risoluzione dei colpi** in quell'ordine (§4.4). Se un vigore scende a 0 o sotto, il duello finisce: i colpi successivi non si risolvono, tranne quelli simultanei.
6. **Fine turno:**
   - il nemico in preparazione non interrotta diventa `preparato`;
   - si applica il recupero del fiato;
   - si consolida il vantaggio (§4.5);
   - si controllano il cambio di fase (§4.7) e il limite di turni;
   - **l'IA sceglie la prossima mossa** (§5).

### 4.4 Risoluzione di un colpo (attaccante A, difensore D)
1. Se l'attacco di A è stato **interrotto** in questo turno, non si risolve.
2. **Danno base:** un tiro intero nell'intervallo. Se A ha il vantaggio, si prende il **massimo** e il vantaggio si consuma. Se A è `preparato`, il danno vale ×1,5 e `preparato` si consuma.
3. **Reazione di D**, secondo la sua postura attuale:

| Postura di D | Condizione | Esito |
|---|---|---|
| **distanza** | portata corta | **Evitato**, senza costo |
| | portata lunga | Danno ×1,25 |
| **attesa** | fiato ≥ 2 e (velocità ≠ rapido, oppure schivata di grado 3) | **Schivata**, −2 fiato, colpo evitato. Se la portata è corta, **contrattacco** di 3–4 (+1 dal grado 2) ad A. Dal grado 2 D guadagna il vantaggio. |
| | altrimenti | Danno pieno |
| **guardia** | non `sfondaGuardia` e fiato ≥ 1 | **Parata**, −1 fiato. Colpo leggero con parata di grado ≥ 2: danno 0; altrimenti danno ×0,4. Colpo pesante con parata di grado 3: D guadagna il vantaggio. |
| | altrimenti | Danno pieno |
| **assalto / preparazione** | sempre | Danno pieno |

4. Se il fiato di D è 0 (§4.2), il danno vale ×1,25.
5. **Ordine dei moltiplicatori:** tiro → preparato → reazione → lunga contro distanza → fiato zero. Il risultato si arrotonda con `Math.round`, minimo 0.
6. **Colpo a segno:** un colpo non evitato, non schivato, non parato e con danno > 0.
   - Un colpo **pesante a segno** interrompe l'attacco di D ancora da risolvere, a meno che non sia `inarrestabile`. A guadagna il vantaggio.
   - Un colpo **pesante a segno** contro D in `preparazione` rompe la preparazione (D non diventa `preparato`). A guadagna il vantaggio.
7. **Contrattacco:** è un colpo senza reazioni, con il solo moltiplicatore del fiato zero. Non interrompe nulla, perché l'attacco di A si è già risolto.

### 4.5 Vantaggio
- **Uso:** il vantaggio a inizio turno serve per l'ordine degli attacchi e rende massimo il primo attacco del turno, poi si consuma. Se il combattente non attacca, lo conserva.
- **Guadagno:** il vantaggio guadagnato durante il turno diventa effettivo **dal turno successivo**.
- **Perdita:** chi subisce danno > 0, contrattacchi compresi, perde sia il vantaggio attuale sia quello in arrivo guadagnato **prima** di quel colpo nello stesso turno.

### 4.6 Matrice di riferimento (base dei test)
Condizioni: gradi 1, fiato sufficiente, nessun vantaggio, nessun `preparato`, velocità dei combattenti uguali (2). Tiri fissati con il dado finto: giocatore Assalto 5, Guardia 2, contrattacco 3.

Mosse nemiche di prova:
- **P1** pesante, corta, normale, 6
- **P2** pesante, lunga, lenta, 6
- **L1** leggero, corta, rapido, 3
- **L2** leggero, lunga, normale, 3
- **D** guardia senza attacco, parata grado 1
- **PR** preparazione

| Giocatore ↓ / Nemico → | P1 | P2 | L1 | L2 | D | PR |
|---|---|---|---|---|---|---|
| **Assalto** | simultanei: subisce 6, infligge 5 | giocatore primo e interrompe: subisce 0, infligge 5, +vantaggio | nemico primo: subisce 3, infligge 5 | simultanei: subisce 3, infligge 5 | parato: infligge 2 | infligge 5, preparazione rotta, +vantaggio |
| **Guardia** | giocatore primo: infligge 2, para 6→2 | infligge 2, para 6→2 | simultanei: infligge 2, para 3→1 | infligge 2, para 3→1 | infligge 2×0,4 → 1 | infligge 2, il nemico diventa preparato |
| **Attesa** | schivata: subisce 0, contrattacco 3 | schivata senza contrattacco: 0/0 | schivata fallita: subisce 3 | schivata senza contrattacco: 0/0 | niente | il nemico diventa preparato |
| **Distanza** | evitato | subisce 6×1,25 → 8 | evitato | subisce 3×1,25 → 4 | niente | il nemico diventa preparato |

Servono anche test dedicati per:
- gradi 2 e 3 di Parata e Schivata;
- fiato zero (niente reazioni, ×1,25);
- `sfondaGuardia` e `inarrestabile`;
- vantaggio: uso, perdita, guadagno differito;
- `preparato` ×1,5;
- cambio di fase;
- pareggio al 25° turno;
- cambio non consentito senza fiato.

### 4.7 Fasi del boss
A fine turno, se il nemico ha una fase 2, è in fase 1 e il suo vigore è ≤ 50% del massimo:
- passa in **fase 2**;
- si genera un evento di cambio fase;
- da quel momento l'IA usa il profilo della fase 2.

---

## 5. IA dei nemici (`ai.ts`)
Ogni profilo di fase contiene un elenco di **mosse con peso**, oppure una **sequenza** ciclica (solo per la Recluta).

1. **Candidate:** le mosse della fase corrente con lo stesso archetipo della postura attuale, oppure con fiato ≥ costo del cambio.
2. **Sequenza:** se il profilo ne ha una, si prende la prossima mossa del ciclo; se non è disponibile, la prima candidata.
3. **Peso:** il peso base moltiplicato per i **modificatori** dichiarati nei dati. I modificatori possibili sono:
   - `vigoreSotto(frazione)`;
   - `fiatoSotto(n)`;
   - `avversarioFiatoSotto(n)`;
   - `avversarioVantaggio`;
   - `avversarioPostura(p)`, cioè la postura che il giocatore tiene a fine turno.
4. **Adattamento** (se l'opzione è attiva e il profilo ha `adattamento > 1`): se le **ultime 2 scelte** del giocatore sono la stessa postura P, il peso delle mosse che **battono P** si moltiplica per `adattamento`. La tabella è in `balance.ts`:

| Postura P | Mosse che la battono |
|---|---|
| assalto | archetipi guardia e attesa |
| guardia | attacchi `sfondaGuardia` e archetipo preparazione |
| attesa | attacchi rapidi |
| distanza | attacchi a portata lunga |

5. **Estrazione** pesata con l'RNG dello stato.

---

## 6. Nemici iniziali (`enemies.ts`)
Gli attacchi sono indicati come *forza, portata, velocità, danno*. In "Profilo" i numeri sono i pesi.

| Nemico | Vig. | Fiato | Vel. | Gradi P/S | Mosse | Profilo |
|---|---|---|---|---|---|---|
| **Recluta** | 16 | 4 | 1 | 1/1 | Fendente (assalto: pesante, corta, normale, 3–5); Copertura (guardia, senza attacco) | Sequenza Fendente, Copertura. Nessun adattamento. |
| **Duellante** | 20 | 6 | 3 | 2/1 | Stoccata (assalto: leggero, corta, rapido, 2–3); Battuta (assalto: leggero, corta, rapido, 2–3, `sfondaGuardia`: colpo sulla lama che apre la guardia); Parata (guardia: leggero, corta, rapido, 1–2); Affondo (assalto: pesante, corta, normale, 4–6) | Stoccata 5, Battuta 1, Parata 2, Affondo 1. Adattamento ×3. |
| **Bruto** | 30 | 5 | 1 | 1/1 | Maglio (assalto: pesante, corta, lento, 6–8); Spallata (assalto: pesante, corta, normale, 4–5, `sfondaGuardia`); Raccogliersi (preparazione) | Maglio 4, Spallata 2, Raccogliersi 2 (×3 con `fiatoSotto(2)`). Adattamento ×2. |
| **Lanciere** | 22 | 5 | 2 | 1/1 | Affondo lungo (assalto: leggero, lunga, normale, 3–4); Colpo d'asta (assalto: pesante, lunga, lento, 5–6); Tenere a bada (distanza) | Affondo lungo 4, Colpo d'asta 2, Tenere a bada 2 (×2 con `vigoreSotto(0.4)`). Adattamento ×2. |
| **Mietitore** (boss) | 45 | 6 | 2 | 3/2 | **Fase 1:** Falciata (assalto: pesante, corta, normale, 5–7); Mietere (assalto: leggero, lunga, normale, 3–4); Guardia d'osso (guardia); Raccogliersi (preparazione). **Fase 2:** le stesse più **Carica** (assalto: pesante, corta, normale, 7–9, `inarrestabile`). | **Fase 1:** Falciata 3, Mietere 3, Guardia d'osso 2, Raccogliersi 1. Adattamento ×2. **Fase 2:** Carica 4, Falciata 2, Mietere 2, Guardia d'osso 1, Raccogliersi 1. Adattamento ×3. |

---

## 7. Contratto con l'interfaccia (`view.ts`)
`toDuelView(stato, eventiUltimoTurno)` restituisce un oggetto **serializzabile** che l'interfaccia disegna senza alcuna logica di gioco. Si modifica solo d'accordo con Planning.

```ts
interface DuelView {
  turno: number; turnoMax: number;
  esito: StatoDuello['esito'];
  giocatore: CombattenteView;
  nemico: CombattenteView & { fase: 1 | 2; haFase2: boolean };
  hint: {
    categoria: Categoria; simbolo: string;          // es. 'intent.pesante'
    dettaglio?: { nome: string; forza?: Forza; portata?: Portata; velocita?: Velocita;
                  danno?: [number, number]; flags: string[] }; // solo con hintCompleti
  };
  posture: Array<{
    id: PosturaId; nome: string; simbolo: string;   // es. 'posture.assalto'
    attiva: boolean; costo: number; disponibile: boolean;
    anteprima?: { subito: [number, number]; inflitto: [number, number] }; // solo con anteprimaDanni
  }>;
  registro: Array<{ turno: number; testo: string; simbolo?: string; tipo: string }>;
}
interface CombattenteView {
  nome: string; vigore: number; vigoreMax: number; fiato: number; fiatoMax: number;
  postura: { id: Archetipo; nome: string; simbolo: string };
  vantaggio: boolean; preparato: boolean;
}
```

**Id dei simboli**, che `symbols.ts` mappa a `{ glifo, etichetta }` segnaposto:

| Gruppo | Id |
|---|---|
| Posture | `posture.assalto`, `posture.guardia`, `posture.attesa`, `posture.distanza`, `posture.preparazione` |
| Intenzioni | `intent.pesante`, `intent.leggero`, `intent.difesa`, `intent.preparazione` |
| Stati | `stato.vantaggio`, `stato.preparato`, `stato.fase2` |
| Risorse | `risorsa.vigore`, `risorsa.fiato` |
| Eventi | `evento.colpo`, `evento.parata`, `evento.schivata`, `evento.contrattacco`, `evento.evitato`, `evento.interrotto`, `evento.rotta` |

**Anteprima dei danni:**
- Per ogni postura **disponibile**, simula il turno contro ogni mossa nemica candidata: tutte le mosse della fase corrente con la stessa categoria dell'hint, oppure solo la mossa esatta con `hintCompleti`.
- Per ogni mossa usa due volte il **dado finto**, una con tutti i tiri al minimo e una con tutti al massimo.
- Restituisce, per il danno subito e per quello inflitto, il minimo e il massimo tra tutti i risultati.
- **Deve riusare `resolveTurn`**, senza duplicare le regole. Per questo `resolveTurn` accetta un dado iniettabile e un flag che salta la scelta dell'IA.

**Registro:** a ogni evento corrisponde una frase breve in italiano che spiega il *perché*. Esempio: "Il Bruto si raccoglie: il prossimo colpo farà più male."

Firma del risolutore:
```ts
resolveTurn(stato: StatoDuello, scelta: PosturaId,
            opz?: { dado?: Dado; saltaIA?: boolean }): { stato: StatoDuello; eventi: EventoDuello[] }
```
`resolveTurn` **non modifica** lo stato in ingresso: va verificato con un test.

---

## 8. Arena (interfaccia segnaposto)
- **Mobile prima di tutto:** dispositivo di riferimento Samsung Galaxy S23 (viewport 360×780, vedi CLAUDE.md), solo clic o tocco, nessuno scroll orizzontale.
- **Menu:**
  - i 5 nemici;
  - il **pannello di configurazione**: gradi di Parata e Schivata (1–3), seed (campo numerico più pulsante "casuale") e i tre interruttori A/B (§3).
  - La configurazione si salva in `localStorage` con la chiave `limen.arena.config`, dentro try/catch.
- **Schermata del duello,** dall'alto in basso:
  1. il nemico: nome, barra del vigore, pallini del fiato, postura, vantaggio o preparato, fase;
  2. l'**hint**, grande e al centro;
  3. il **registro** dell'ultimo turno, con lo storico scorrevole;
  4. il giocatore: vigore, fiato, vantaggio;
  5. **4 pulsanti di postura** in griglia 2×2, con costo, anteprima facoltativa e stato disabilitato se il cambio non è consentito.
  - Un tocco **seleziona** la postura; il pulsante **Conferma** risolve il turno.
- **Fine duello:**
  - esito e statistiche sintetiche;
  - "Rigioca (stesso seed)", "Rigioca (nuovo seed)", "Menu".
- **Telemetria:**
  - a fine duello aggiunge un record a `limen.arena.telemetria` in `localStorage`;
  - campi: `nemico`, `seed`, `opzioni`, `gradi`, `esito`, `turni`, `usoPosture` (conteggio per postura), `cambi`, `danniInflitti`, `danniSubiti`, `data` (ISO);
  - nel menu: contatore, "Copia JSON" (clipboard, con un'area di testo selezionabile come ripiego) e "Azzera".
- **Segnaposto grafici:** testo e Unicode da `symbols.ts`, palette sobria in `styles.css`. Lo stile curato non fa parte di questa fase.

---

## 9. Simulatore (`sim/run.ts`)
- **Uso:** `npm run sim -- --duelli 1000 --gradi 1 [--adattamento on|off] [--seed N]`.
- **Uscita:** una tabella in console (nemico × politica: % vittorie, % pareggi, turni medi) e `sim-out/report.json`.

**Politiche dei bot.** Usano solo informazioni visibili al giocatore: categoria dell'hint e valori di entrambi, mai la mossa esatta.

| Politica | Comportamento |
|---|---|
| `fissa:<postura>` (×4) | Non cambia mai postura. Il primo turno paga il cambio, se serve. |
| `casuale` | Sceglie a caso tra le posture disponibili. |
| `lettore` | L'euristica di riferimento descritta sotto. |

Euristica `lettore` (si può rifinire, sempre con le sole informazioni visibili):
1. Se ha il vantaggio → **Assalto**.
2. Altrimenti, in base all'hint:
   - **pesante** → **Attesa** se il fiato basta (cambio più schivata), altrimenti **Distanza**;
   - **leggero** → **Guardia**;
   - **difesa** → **Distanza** se il fiato è < 3, altrimenti **Guardia**;
   - **preparazione** → **Assalto**.
3. Se il cambio non è consentito, resta nella postura attuale.

### Obiettivi (gradi 1, adattamento attivo, hint per categoria)
| Politica | Recluta | Duellante, Bruto, Lanciere | Mietitore |
|---|---|---|---|
| `lettore` | ≥ 90% | **60–85%** | **35–65%** |
| `fissa:*` (ognuna) | libera | **< 25%** | **< 25%** |
| `casuale` | libera | **< 30%** | **< 30%** |

- Turni medi (`lettore`): **4–8** contro i nemici normali, **≤ 14** contro il Mietitore.
- Solo a titolo informativo, senza obiettivo, riportare anche i risultati con gradi 3 e con adattamento disattivato.

### Regole di bilanciamento
- Per centrare gli obiettivi si possono cambiare **solo i numeri**:
  - `balance.ts`;
  - pesi, danni, vigore, fiato e velocità in `enemies.ts`.
- Ogni modifica va annotata in `docs/ARENA_REPORT.md`, con il valore prima, il valore dopo e il motivo.
- Se gli obiettivi restano irraggiungibili dopo un tentativo ragionevole, o se servirebbe una regola nuova: **fermarsi** e scrivere la domanda per Planning nel report.

---

## 10. Fasi di lavoro (ognuna: test verdi, typecheck pulito, commit, push)
| Fase | Contenuto | Fatto quando |
|---|---|---|
| **F0 Impalcatura** | `package.json`, `tsconfig`, script di build e dev, template HTML, un test vuoto | `npm test`, `npm run typecheck` e `npm run build` funzionano e `dist/index.html` si apre |
| **F1 Core** | `types`, `rng`, `postures`, `balance`, `resolve` | Matrice §4.6 e test dedicati verdi; determinismo, serializzazione e immutabilità verificati |
| **F2 Nemici** | `enemies`, `ai`, `view` (con anteprima), simulatore, bilanciamento | Obiettivi del §9 raggiunti, oppure domanda aperta nel report; report scritto |
| **F3 Arena** | `symbols`, `styles`, `render`, `arena`, `main` | Duello completo giocabile contro tutti i nemici; pannello e telemetria funzionanti |
| **F4 Verifica** | Build finale e prova nel browser a 360×780 (S23): un duello per nemico, ciascun interruttore A/B provato | Report finale aggiornato |

## 11. Consegna: `docs/ARENA_REPORT.md`
1. Stato delle fasi e comandi verificati.
2. Tabelle del simulatore: obiettivi, gradi 3, adattamento disattivato.
3. Modifiche di bilanciamento: prima, dopo, motivo.
4. Scostamenti dalla specifica, con il motivo.
5. **Domande per Planning.**
6. Osservazioni sul gioco emerse dai test, per esempio "la Distanza contro il Bruto è troppo sicura".

---

## 12. Revisione 1.1: modello delle posture
Questa revisione rende l'arena coerente con il **modello delle posture** di DESIGN §5.2: ogni postura compra qualcosa adesso e lascia un debito. Risponde anche alle domande di `docs/ARENA_REPORT.md` §5. **Dove modifica le sezioni precedenti, prevale.**

### 12.1 Risposte al report
| Domanda | Decisione |
|---|---|
| **1. Lanciere** (l'Assalto fisso domina) | Si risolve con le regole: il Lanciere ottiene la **Distanza di grado 3 (Arresto)** sulla mossa *Tenere a bada* (§12.2 R4 ed R5). Resta negli obiettivi `fissa:*`. |
| **2. Bruto** (Assalto fisso al 28%) | Nuova mossa difensiva **Incassare** (§12.2 R5). L'obiettivo resta < 25%; se dopo il bilanciamento non si scende sotto, è accettato < 30% **solo per il Bruto**, da riportare nel report. |
| **3. Scala del vigore** | **Accettata:** giocatore a 20, nemici come da bilanciamento. |
| **4. Entrambi a 0** | **Pareggio:** confermato. |
| **5a. Interruzione** | Un colpo pesante a segno interrompe **qualunque** attacco ancora da risolvere: confermato. |
| **5b. Vantaggio negli scambi simultanei** | Confermato. La catena dell'Assalto con vantaggio è voluta: chi ha l'iniziativa la tiene finché l'avversario non si difende bene. La spezzano le difese nel roster e la lettura dell'hint (§12.2 R5 ed R6). |
| **6d. Fiato 0 e Distanza** | Confermato: senza fiato non si arretra. Il colpo corto arriva con danno ×1,25. È coerente con il modello: arretrare è un movimento. |
| **6e, 6f, 6g, 6h, 6i, 6j** | Interpretazioni confermate così come implementate. |
| **7. Gradi dei nemici** | Invariati. Si aggiunge il grado della Distanza: §12.2 R4. |

### 12.2 Nuove regole
**R1. Arretrare cede l'iniziativa (incalzare).**
- Quando un attacco si risolve contro un difensore in postura `distanza`, **qualunque sia l'esito** (evitato, oppure a segno con ×1,25), l'attaccante guadagna il vantaggio, secondo le regole del vantaggio in arrivo (§4.5).
- Eccezione: non succede se il difensore risponde con *Punta* o *Arresto* (R4).
- Evento: `incalza`.

**R2. Spazio alle spalle.**
- Ogni combattente ha un contatore `distanzaConsecutive`: i turni consecutivi **conclusi** in `distanza`. Si azzera a fine turno se la postura è un'altra.
- Se a inizio turno il contatore è ≥ 2, l'archetipo `distanza` **non è disponibile**. Per il giocatore: la postura risulta non disponibile per mancanza di spazio. Per l'IA: le mosse `distanza` sono escluse.
- Chi è in Distanza e non può restarci **cambia postura gratis**: è con le spalle al muro, e questo evita il blocco a fiato zero.
- Evento: `spalleAlMuro`, quando il contatore arriva a 2.

**R3. L'Attesa è una preparazione.**
- A fine turno un combattente in `attesa` che **non è stato raggiunto da nessun attacco** diventa `preparato`. Vale se l'avversario non aveva attacco, oppure se il suo attacco è stato interrotto prima di risolversi.
- Se è già `preparato`, resta tale: il bonus non si accumula.
- Il bonus `preparato` (×1,5) vale per il **prossimo colpo a danno** del combattente: attacco, contrattacco, *Punta* o *Arresto*. Poi si consuma. Questo vale ora anche per i nemici: la §4.4 diceva "prossimo attacco".
- Il recupero di fiato dell'Attesa resta +1.
- Evento: `preparato` (lo stesso del nemico che si raccoglie).

**R4. Gradi della Distanza.**
- Nuovo campo `gradi.distanza: 1 | 2 | 3`. Il giocatore parte da 1 e il grado si regola nel pannello dell'arena, come gli altri. *Punta* e *Arresto* sono **reazioni**: costano 1 fiato e non scattano a fiato zero.

| Grado | Contro un colpo corto evitato | Effetto |
|---|---|---|
| 1 | — | Come prima: evita senza costo e cede l'iniziativa (R1) |
| 2 · ***Punta*** | Colpo **pesante** | −1 fiato; l'attaccante subisce 1–2, un colpo senza reazioni come il contrattacco; **nessun** incalzare |
| 3 · ***Arresto*** | Colpo pesante o leggero **non rapido** | −1 fiato; l'attaccante subisce 2–3; il difensore **guadagna il vantaggio**; nessun incalzare. Contro un colpo rapido vale la Punta, se il colpo è pesante. |

- I colpi **lunghi** non vengono evitati (danno ×1,25 come prima), quindi Punta e Arresto non scattano.

**R5. Roster: ogni nemico ha una risposta all'Assalto.** I pesi iniziali sono indicativi e regolabili nel bilanciamento.

| Nemico | Modifica |
|---|---|
| **Duellante** | Nuova mossa **Invito** (archetipo `attesa`, senza attacco). Nella scherma l'invito è aprire una linea apposta per provocare l'attacco. Peso iniziale 3. |
| **Bruto** | Nuova mossa **Incassare** (archetipo `guardia`, senza attacco; Parata di grado 1). Peso iniziale 2. |
| **Lanciere** | `gradi.distanza = 3`: *Tenere a bada* diventa la minaccia dell'Arresto. |
| Recluta, Mietitore | Invariati. |

**R6. Adattamento.**
- Nella tabella del §5, l'Assalto è battuto dagli archetipi `guardia` e `attesa` **e da `distanza` se il nemico ha grado della Distanza ≥ 2**.
- Il resto della tabella non cambia.

**R7. Vista e simboli (contratto `DuelView`).**
- Ogni elemento di `posture[]` riceve `motivo?: 'fiato' | 'spazio'` quando `disponibile` è falso.
- `CombattenteView` riceve `spazio: number`, cioè `distanzaConsecutive` limitato a 2, così la scena può mostrare il bordo.
- Nuovi id di simbolo: `stato.spalle`, `evento.incalza`, `evento.punta`, `evento.arresto`. Finché la Grafica non li disegna si usano segnaposto in `src/ui/symbols.ts`.
- Il registro spiega il perché, per esempio: "Arretri: il Bruto incalza e prende l'iniziativa."

**R8. Bot `lettore` aggiornato.** Usa sempre e solo le informazioni visibili.
1. Se ha il vantaggio → **Assalto**.
2. Altrimenti, in base all'hint:
   - **pesante** → **Attesa** se il fiato basta (cambio più schivata); altrimenti **Distanza** se è disponibile; altrimenti **Guardia**;
   - **leggero** → **Guardia**;
   - **difesa** → **Attesa** (per prepararsi) se il fiato è ≥ 2; altrimenti **Guardia**;
   - **preparazione** → **Assalto**.
3. Se ha il bonus `preparato` e l'hint non è "pesante" → **Assalto**.
4. Se il cambio non è consentito, resta nella postura attuale.

`fissa:distanza`: quando la Distanza non è disponibile, ripiega su **Guardia**.

### 12.3 Matrice di riferimento: celle modificate (§4.6)
Condizioni del §4.6, con in più il grado della Distanza 1. Dado finto: Punta 2, Arresto 3.

| Giocatore ↓ / Nemico → | P1 | P2 | L1 | L2 | D | PR |
|---|---|---|---|---|---|---|
| **Attesa** | invariata | invariata | invariata | invariata | **il giocatore diventa preparato** | **entrambi preparati** |
| **Distanza** | evitato, **il nemico incalza** (+vantaggio) | subisce 8, **il nemico incalza** | evitato, **il nemico incalza** | subisce 4, **il nemico incalza** | niente | il nemico diventa preparato |

Altri test richiesti:
- Distanza di grado 2 contro P1: Punta 2, nessun incalzare, −1 fiato.
- Distanza di grado 2 contro L1: nessuna Punta (colpo leggero) e incalzare.
- Distanza di grado 3 contro P1: Arresto 3 e vantaggio al giocatore.
- Distanza di grado 3 contro L1: nessun Arresto (colpo rapido) e incalzare.
- Distanza di grado 3 contro L2: colpo lungo, ×1,25 e incalzare.
- Spazio alle spalle: indisponibilità al terzo turno, cambio gratuito, azzeramento del contatore.
- Attesa: diventa preparata quando l'attacco nemico viene interrotto; nessun accumulo; ×1,5 sul contrattacco.
- Fiato zero: nessuna Punta né Arresto.

### 12.4 Obiettivi del simulatore
- **Invariati** rispetto al §9, con l'eccezione del Bruto (§12.1).
- **Nuovo obiettivo:** `fissa:distanza` deve stare sotto il 25% di vittorie **e** sotto il 50% di pareggi contro ogni nemico. Lo stallo non deve più essere una strategia.
- Bilanciamento: valgono le regole del §9, cioè solo numeri. Sono numeri anche i pesi delle nuove mosse e i danni di Punta e Arresto (in `balance.ts`).

### 12.5 Ordine di lavoro per la sessione Codice
1. **F2b Revisione 1.1**, da fare prima di F4:
   - R1–R8 e test del §12.3;
   - nuovo bilanciamento;
   - nel report: tabelle aggiornate e una sezione "Revisione 1.1", con il confronto prima/dopo per le domande 1 e 2.
   - Commit: `F2b Revisione 1.1: …`.
2. **F4 Verifica**, come da §10, a 360×780 (S23), provando anche i gradi della Distanza e lo spazio alle spalle.

### 12.6 Decisioni dopo la F2b (risposte a ARENA_REPORT §7.7)
Approvate dall'utente. **Si applicano nella prossima fase di codice** (arena giocabile su S23, ARENA_SPEC 1.2): fino ad allora il codice committato in `8881ea8` è conforme alla 1.1.

| Domanda | Decisione |
|---|---|
| **1. Recluta e vincolo su `fissa:distanza`** | La **Recluta è esclusa** dal vincolo del §12.4: è il nemico con cui si impara. I suoi danni tornano miti: Fendente di nuovo intorno a 3–5, con un nuovo bilanciamento che rispetti gli altri obiettivi della Recluta. |
| **2. Turni del `lettore` contro il Lanciere** | Obiettivo **4–9 turni** per il Lanciere, che tiene la distanza per natura. Gli altri nemici restano a 4–8. |
| **3. Stallo di `fissa:attesa` contro il Lanciere** | **Accettato senza nuove regole.** Una strategia che non attacca mai non vince, e il pareggio conta come non vittoria. Il vincolo anti-stallo resta solo su `fissa:distanza`. |
| **4. Attesa raggiunta da un attacco interrotto (R3)** | Va bene **senza test** finché non esiste una mossa che produce il caso. L'Audit lo registra come requisito "non verificabile". |
