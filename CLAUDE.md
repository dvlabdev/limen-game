# Limen: regole per le sessioni

Il progetto è un gioco a turni in TypeScript compilato in un singolo file HTML. La lingua di lavoro è l'italiano, sia nei documenti sia nei messaggi di commit.

## Fonti di verità
- **DESIGN.md**: le decisioni di design. Una decisione esiste solo se è scritta lì.
- **docs/ARENA_SPEC.md**: la specifica operativa della fase attuale; ARENA_S23_SPEC, SCENA_SPEC e UI_SPEC per le rispettive parti.
- **docs/DECISIONI.md**: il registro delle decisioni con il loro **perché** (log degli intenti). Leggilo prima di proporre di cambiare una scelta già presa.
- **docs/ROADMAP.md**: la sequenza dei lavori e le **questioni aperte**.
- **docs/playtest/**: dati e esiti del playtest.
- **Per riprendere il lavoro di Planning da zero**, leggi in quest'ordine: ROADMAP (questioni aperte), DECISIONI, DESIGN, docs/playtest/ESITI.md.
- Se codice e documenti non concordano, valgono i documenti. Se un documento è ambiguo, **non inventare**: chiedi (vedi "Domande").

## Sessioni e proprietà dei file
| Sessione | Possiede | Non tocca |
|---|---|---|
| **Planning** | `DESIGN.md`, `docs/*_SPEC.md`, `docs/ROADMAP.md`, `docs/PLAYTEST.md`, `CLAUDE.md` | `src/`, `sim/`, `test/` |
| **Codice** | `src/` (tranne `src/ui/symbols.ts` e gli stili), `sim/`, `test/`, `scripts/`, `package.json`, `tsconfig.json`, `docs/*_REPORT.md`, `.github/` | I documenti di design e le specifiche |
| **Grafica/UI** | `design/`, `docs/UI_SPEC.md`. **Dalla fine della fase C2** anche `src/ui/symbols.ts` e `src/ui/styles.css`; durante C2 li integra Codice, come da ARENA_S23_SPEC | La logica in `src/core/` |
| **Audit** | `audit/` | Tutto il resto, in sola lettura. Non corregge e non decide: vedi [docs/AUDIT_PROTOCOL.md](docs/AUDIT_PROTOCOL.md) |

- Le sessioni comunicano **tramite i file del repository**.
- **Integrazioni in `src/ui/`** (simboli, stili, scena) avvengono solo quando lo prevede una specifica, coordinate da Planning. Fino ad allora Grafica lavora in `design/` e `docs/UI_SPEC.md`.
- **Git in una cartella condivisa:** si aggiungono solo i propri file con `git add <percorsi>`, mai `git add -A` o `git add .`. Se c'è un `index.lock`, aspetta e riprova.
- Il contratto tra logica e interfaccia è `src/core/view.ts` (`DuelView`). Si modifica solo d'accordo con Planning.
- La sequenza dei lavori è in [docs/ROADMAP.md](docs/ROADMAP.md).

## Cartella di lavoro
- La copia di lavoro è **`C:\Users\irond\Dropbox\Buffer\claude-yard\limen-game`** (disco locale sincronizzato da Dropbox). La vecchia cartella su Google Drive è un **archivio**: non ci lavora più nessuno.
- `node_modules/`, `dist/` e `sim-out/` sono **esclusi dalla sincronizzazione di Dropbox** con l'attributo `com.dropbox.ignored`. Se li ricrei da zero, rimetti l'attributo prima di `npm install`:
  ```powershell
  New-Item -ItemType Directory -Force node_modules; Set-Content -Path node_modules -Stream com.dropbox.ignored -Value 1
  ```
- Tutte le sessioni lavorano in questa cartella: un solo scrittore per file, niente worktree.

## Domande
Se una regola è ambigua o un obiettivo non si può raggiungere senza cambiare le regole:
1. scrivi la domanda nella sezione "Domande per Planning" di `docs/ARENA_REPORT.md`;
2. fermati e segnalala all'utente.

Puoi cambiare solo i **numeri**: `src/data/balance.ts`, oltre a pesi, danni, vigore, fiato e velocità in `src/data/enemies.ts` (come ARENA_SPEC §9). Non puoi aggiungere regole o meccaniche.

## Dispositivo di riferimento e artefatti
Il riferimento è un **Samsung Galaxy S23**: schermo 1080×2340 px, **viewport CSS 360×780**, densità ×3. Valgono per il gioco e per **ogni artefatto o pagina di revisione** (cataloghi, mockup, laboratori di animazione):
- tutto deve essere leggibile e usabile **nell'app Claude su S23**, in verticale, a 360px di larghezza, senza scroll orizzontale; l'altezza utile nell'app è di circa 700px;
- grafica **vettoriale (SVG)**; eventuali immagini raster a risoluzione ×3, così restano nitide a densità ×3;
- testo di almeno 14px, etichette di almeno 12px, bersagli tattili di almeno 44×44px;
- prima di consegnare, verifica nel browser integrato a **360×780**; il preset "mobile" (375px) non basta.

## Codice
- Node 24 o superiore. Le uniche dipendenze di sviluppo sono `typescript` ed `esbuild`; per aggiungerne altre serve l'ok di Planning.
- I `.ts` girano direttamente con il type stripping di Node, quindi va usata solo sintassi cancellabile: niente `enum`, `namespace` o parameter properties. Gli import usano l'estensione `.ts`.
- `src/core/` è **puro**: niente DOM, niente `Math.random`, niente orologio. Il caso passa sempre dall'RNG con seed e lo stato è serializzabile in JSON.
- I termini di dominio sono in italiano come in DESIGN.md (vigore, fiato, postura, mossa, vantaggio).
- `localStorage` va sempre racchiuso in try/catch.

## Comandi
```bash
npm install
npm run dev
npm test
npm run typecheck
npm run sim
npm run build
```

## Git
- Un commit per fase completata, con messaggio in italiano, seguito dal push su `origin main`.
- Prima di ogni commit `npm test` e `npm run typecheck` devono passare.
