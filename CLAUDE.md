# Limen: regole per le sessioni

Il progetto è un gioco a turni in TypeScript compilato in un singolo file HTML. La lingua di lavoro è l'italiano, sia nei documenti sia nei messaggi di commit.

## Fonti di verità
- **DESIGN.md**: le decisioni di design. Una decisione esiste solo se è scritta lì.
- **docs/ARENA_SPEC.md**: la specifica operativa della fase attuale.
- Se codice e documenti non concordano, valgono i documenti. Se un documento è ambiguo, **non inventare**: chiedi (vedi "Domande").

## Sessioni e proprietà dei file
| Sessione | Possiede | Non tocca |
|---|---|---|
| **Planning** | `DESIGN.md`, `docs/*_SPEC.md`, `CLAUDE.md` | `src/`, `sim/`, `test/` |
| **Codice** | `src/` (tranne `src/ui/symbols.ts` e gli stili), `sim/`, `test/`, `scripts/`, `package.json`, `tsconfig.json`, `docs/*_REPORT.md` | I documenti di design e le specifiche |
| **Grafica/UI** | `design/`, `docs/UI_SPEC.md`; dopo la consegna dell'arena anche `src/ui/symbols.ts` e `src/ui/styles.css` | La logica in `src/core/` |
| **Audit** | `audit/` | Tutto il resto, in sola lettura. Non corregge e non decide: vedi [docs/AUDIT_PROTOCOL.md](docs/AUDIT_PROTOCOL.md) |

- Le sessioni comunicano **tramite i file del repository**.
- **Mentre l'arena è in implementazione**, Grafica lavora solo in `design/` e `docs/UI_SPEC.md`. L'integrazione in `src/ui/` avviene dopo, coordinata da Planning.
- **Git in una cartella condivisa:** si aggiungono solo i propri file con `git add <percorsi>`, mai `git add -A` o `git add .`. Se c'è un `index.lock`, aspetta e riprova.
- Il contratto tra logica e interfaccia è `src/core/view.ts` (`DuelView`). Si modifica solo d'accordo con Planning.
- Tutte le sessioni lavorano nella stessa cartella, che è su Google Drive: un solo scrittore per file, niente worktree.

## Domande
Se una regola è ambigua o un obiettivo non si può raggiungere senza cambiare le regole:
1. scrivi la domanda nella sezione "Domande per Planning" di `docs/ARENA_REPORT.md`;
2. fermati e segnalala all'utente.

Puoi cambiare solo i **numeri**: `src/data/balance.ts`, oltre a pesi, danni e vigore in `src/data/enemies.ts`. Non puoi aggiungere regole o meccaniche.

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
