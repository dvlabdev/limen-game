# Esiti del playtest

> **Proprietario:** Planning · **Dati grezzi:** `docs/playtest/dati/` (un file per sessione, mai modificati) · **Procedura:** [README](README.md)
> Qui stanno le **interpretazioni**. I numeri si ricalcolano dai dati grezzi; quando esisterà `npm run playtest` (README §3), le tabelle verranno generate in automatico.

## Riepilogo
| Data | File | Duelli | Versione | Configurazione | Vittorie |
|---|---|---|---|---|---|
| 15 ottobre 2026 | `2026-10-15-prova.json` | 4 | `154a071` | scena; anteprima accesa in 3 su 4 | 1 su 4 |
| 17 ottobre 2026 | `2026-10-17-sessione1.json` | 9 | `dba231f` | scena, anteprima accesa, hint per categoria | 6 su 9 |
| 17 ottobre 2026 | `2026-10-17-bruto.json` | 7 (tutti contro il Bruto) | `4afc1bb` | scena, anteprima accesa; hint completi in 6 su 7 | 5 su 7, di cui **3 pulite** (0 danni) |

Nota: il protocollo della sessione 1 prevedeva griglia e anteprima spenta. Le sessioni sono state giocate in layout scena con anteprima accesa, e ne teniamo conto nel confronto.

## Osservazioni
### O1. La lettura dell'hint si impara (15 → 17 ottobre)
Contro "pesante", l'Attesa sale da **3 su 16** (prova) a **13 su 21** (sessione 1, 62%). Cambi di postura: 76% e 57% dei turni, sempre sopra l'obiettivo del 30%.

### O2. Le sconfitte nascono dal fiato
Le sconfitte contro il Bruto (sessione 1 e duello 1 del 17 alle 11:40) seguono lo stesso schema: due o più schivate di fila (−2, recupero +1), fiato a zero, colpo pieno ×1,25. Il fiato **non si legge** mentre si gioca (feedback dell'utente). → ARENA_SPEC §13.2 (in implementazione).

### O3. Con la conoscenza esiste un duello pulito, e l'Assalto chiude
Con gli hint completi, contro il Bruto, l'utente ha trovato da solo una strategia in **due tempi** (3 vittorie pulite su 5):
1. Attesa contro la Spallata (schivata e contrattacco);
2. due turni in Distanza per recuperare fiato;
3. si aspetta l'apertura: Maglio (lento), preparazione o Incassare;
4. **catena di Assalti con il vantaggio:** si colpisce per primi e al massimo e si interrompono anche i colpi pesanti.

Con la sola categoria Maglio e Spallata non si distinguono, quindi l'apertura è invisibile e resta solo la difesa.

**Conseguenza di design:** l'Assalto è già premiato **come colpo finale con l'iniziativa**. Il rischio "schiva e contrattacca" dipende soprattutto dall'invisibilità delle aperture con la sola categoria. Leva candidata: **rendere leggibile la velocità** ("pesante · lento") nell'hint, oppure come conoscenza da sbloccare. Va confrontata con la linea di base del monitor (ARENA_SPEC §13.1).

### O4. L'Assalto continuo funziona contro chi si prepara spesso
Mietitore vinto con 9 Assalti su 11 turni (sessione 1): le sue preparazioni frequenti aprono finestre continue per l'Assalto.

### O5. La Distanza è poco usata
3 turni su 56 nella sessione 1. Contro il Bruto torna utile come "respiro" (O3). Da seguire dopo il fiato leggibile.

## Decisioni prese sulla base del playtest
- Fiato previsto nei pallini e bilancio nel registro (ARENA_SPEC §13.2).
- Il percorso pulito diventa uno **strumento di monitoraggio** (§13.1), non un obiettivo; la strategia deve premiare l'Assalto (revisione del ritmo, §13 parte 2, dopo la linea di base).
