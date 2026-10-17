# Dati del playtest: procedura

> **Proprietario:** Planning · Obiettivo: tenere **tutti** i duelli giocati fuori dalla memoria delle conversazioni, in forma riproducibile e analizzabile, anche quando saranno centinaia.

## 1. Dove stanno i dati
- **`dati/`:** un file JSON per sessione di gioco, con il nome `AAAA-MM-GG-<etichetta>.json`. È il record esatto esportato dal gioco ("Copia JSON"). **Non si modifica mai**: le correzioni si fanno nelle analisi, non nei dati.
- **`ESITI.md`:** le interpretazioni di Planning (osservazioni, decisioni).
- **Identità di un duello:** il campo `id` (seed più ora). Lo stesso duello presente in più file conta una volta sola, perché il gioco esporta tutto lo storico locale a ogni copia.
- **Versione:** ogni record porta `versione` (commit e data della build), così i dati di regole diverse non si mescolano.

## 2. Come arrivano i dati, in ordine di preferenza
1. **Cartella `inbox/` via Dropbox, senza passare dalla chat:**
   - dal telefono, "Copia JSON" nel menu dell'arena;
   - nell'app Dropbox, crea un file di testo in `limen-game/docs/playtest/inbox/` e incolla.
   - Planning lo sposta in `dati/` con il nome giusto e lo analizza. **Costa zero token di conversazione** per il trasporto.
2. **Pulsante "Scarica JSON"** (da aggiungere alla prossima fase di codice). Funziona su GitHub Pages, non dentro le pagine private di Claude, che bloccano i download. Il file scaricato si carica nella stessa `inbox/`.
3. **Incolla in chat:** resta come riserva. Planning lo salva **subito** in `dati/`.
4. **Più avanti, con più giocatori:** il database della pagina privata (funziona da desktop, non dall'app mobile) oppure un piccolo servizio di raccolta, da valutare solo quando servirà.

## 3. Analisi automatica (da implementare: `npm run playtest`)
Uno script (`sim/playtest.ts`, di proprietà di Codice):
1. legge tutti i file in `dati/` ed elimina i duplicati per `id`;
2. raggruppa per versione, nemico, conoscenza (hint per categoria o completi) e layout;
3. calcola le metriche di PLAYTEST §4:
   - vittorie, turni, danni;
   - cambi di postura sul totale dei turni;
   - uso delle posture e postura più usata;
   - **tabella di lettura** (categoria dell'hint × postura scelta);
   - quota di Assalti;
   - duelli puliti;
4. scrive `docs/playtest/METRICHE.md` (generato, da non modificare a mano) e un JSON aggregato.

Così le metriche si ricalcolano in un secondo su qualunque quantità di dati, e una sessione nuova può leggerle senza conoscere la storia della conversazione.

## 4. Dimensioni
Un duello pesa circa 0,8–1,2 KB, quindi 1000 duelli occupano circa 1 MB: per il repository git va bene a lungo. Se un giorno i dati crescessero di ordini di grandezza, si archivieranno per versione in file compressi e l'analisi lavorerà sugli aggregati.
