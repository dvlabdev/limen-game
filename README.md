# Limen

*Titolo provvisorio.* Roguelite dark fantasy a turni: un viandante attraversa il portale di una locanda verso mondi sempre diversi. Si vince preparandosi e leggendo il nemico, non con i riflessi.

Il gioco è scritto in TypeScript e compilato in un singolo file HTML, giocabile nel browser da desktop e da mobile.

## Stato
Fase attuale: **arena di prova del duello a posture** (vedi [docs/ARENA_SPEC.md](docs/ARENA_SPEC.md)).

## Documenti
- [DESIGN.md](DESIGN.md): documento di design, fonte di verità.
- [docs/ARENA_SPEC.md](docs/ARENA_SPEC.md): specifica operativa dell'arena.
- [CLAUDE.md](CLAUDE.md): regole di lavoro per le sessioni.

## Comandi
Richiede Node 24 o superiore.

```bash
npm install
npm run dev        # server di sviluppo
npm test           # test
npm run sim        # simulazione di bilanciamento
npm run build      # genera dist/index.html (file singolo)
```

## Licenza
[MIT](LICENSE)
