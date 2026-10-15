# Prompt per la concept art

> **Data:** 15 ottobre 2026 · **Proprietario:** Planning · **Uso:** immagini d'atmosfera e immagine chiave, da generare con un generatore esterno (ChatGPT, Gemini, Bing Image Creator, Midjourney).
> Sono una **mood board**, non asset del gioco: il gioco resta in SVG (UI_SPEC, SCENA_SPEC). Servono a fissare tono e direzione.

## Come usarli
- I prompt sono in **inglese**, perché i generatori rendono meglio. Ogni prompt è autosufficiente: copialo intero.
- **Formato:** **9:16** per le schermate del telefono, **16:9** per l'immagine chiave. Con Midjourney aggiungi i parametri indicati; con ChatGPT o Gemini scrivi all'inizio "Vertical 9:16 image" oppure "Wide 16:9 image".
- **Lavora per iterazioni:** genera 4 varianti, scegli la migliore, poi chiedi una sola correzione alla volta (per esempio "less red, more paper texture").
- Salva le immagini che ti convincono in `design/concept/` con il numero del prompt, per esempio `03-impatto-a.png`, e dimmi quali preferisci: le userò come riferimento per i fotogrammi bersaglio e per le marionette.

## Blocco di stile (già incluso in ogni prompt)
> *Woodcut print style, hand-carved relief print look, black ink on warm off-white paper, visible paper grain and carving marks, a single accent colour of deep blood red used sparingly, strong silhouettes, characters in strict side profile, no visible faces (hoods, masks, helmets, shadowed faces), flat theatrical layers like a paper puppet theatre, dark fantasy with a sense of quiet warmth, illustrated storybook, high contrast, no gradients, no photorealism.*

**Da evitare** (con Midjourney si aggiunge `--no …`; negli altri strumenti si scrive "avoid: …"): *photorealism, 3D render, anime, glossy, neon, gradients, lens flare, text, watermark, visible faces, front-facing characters, modern objects.*

---

## 1. Immagine chiave (16:9)
```
Wide 16:9 key art. Woodcut print style, hand-carved relief print look, black ink on warm off-white paper, visible paper grain and carving marks, a single accent colour of deep blood red used sparingly, strong silhouettes, characters in strict side profile, no visible faces, flat theatrical layers like a paper puppet theatre, dark fantasy with a sense of quiet warmth, illustrated storybook, high contrast, no gradients.
A lone hooded wanderer with a longsword stands in side profile at the threshold of a tall stone archway that opens onto a different world; behind him the warm candlelit interior of an old inn, ahead of him a misty wasteland under a pale moon. The archway glows with a thin red line. Title space left empty at the top.
Avoid: photorealism, 3D render, anime, gradients, text, watermark, visible faces.
```
Midjourney: `--ar 16:9 --style raw --no photorealism, 3d, anime, text, faces`

## 2. Il duello: il nemico telegrafa (9:16, schermata del telefono)
```
Vertical 9:16 mobile game screen mockup, full-bleed scene. Woodcut print style, black ink on warm off-white paper, visible carving marks, a single deep red accent, characters in strict side profile, no visible faces, flat layered paper-theatre stage, dark fantasy, high contrast, no gradients.
On the left a hooded wanderer in a covering guard stance, sword held vertically in front of the body. On the right a massive hulking brute in a helmet raises a huge maul high behind his head, weight on the back foot, about to strike. Above the brute's head a small bold red woodcut emblem of a falling maul. Behind the wanderer, a fan of four round paper medallions with carved icons, arranged in an arc. Simple ground line, layered ruins and a pale sky in the background.
Avoid: photorealism, 3D render, anime, gradients, text, watermark, visible faces, front-facing characters.
```
Midjourney: `--ar 9:16 --style raw --no photorealism, 3d, anime, text, faces`

## 3. L'istante dell'impatto (9:16)
```
Vertical 9:16 mobile game screen, full-bleed. Woodcut print style, black ink on warm off-white paper, visible carving marks, single deep red accent, strict side profile, no visible faces, paper-theatre layers, dark fantasy, high contrast, no gradients.
Frozen moment of impact: the hooded wanderer parries a heavy downward maul blow with his sword; at the point of contact an explosive splash of black ink and red sparks carved in woodcut lines; the brute's body is fully extended into the blow; small carved speed lines; dust rising from the ground. A bold carved number "-3" floats near the wanderer.
Avoid: photorealism, 3D render, anime, gradients, watermark, visible faces.
```

## 4. Le quattro posture (foglio dei personaggi, 16:9)
```
Wide 16:9 character pose sheet. Woodcut print style, black ink on warm off-white paper, visible carving marks, strict side profile, no visible faces, solid black silhouettes with carved highlights, no gradients.
The same hooded wanderer with a longsword shown four times side by side, facing right, each pose clearly different in silhouette: 1) attacking lunge, torso leaning forward, sword raised over the shoulder; 2) upright compact guard, sword held vertically in front of the body; 3) low crouch, coiled like a spring, sword held low across the legs; 4) stepping back, torso leaning away, arm extended with the sword point aimed at chest height. Plain paper background, small carved ground line under each figure.
Avoid: photorealism, 3D, anime, gradients, text, faces.
```

## 5. Il bestiario (16:9)
```
Wide 16:9 enemy lineup. Woodcut print style, black ink on warm off-white paper, carving marks, single deep red accent, strict side profile facing left, no visible faces (masks, helmets, hoods), solid silhouettes, dark fantasy, no gradients.
Five opponents in a row, from smallest to largest: a nervous young recruit with a short sword and a dented helmet; a slender masked duelist with a rapier; a hulking brute with a giant maul; a tall spearman holding a long spear at chest height; and a towering reaper-like boss with a great scythe and a tattered cloak, a thin red line on the scythe's edge.
Avoid: photorealism, 3D, anime, gradients, text, faces.
```

## 6. La locanda col portale (9:16)
```
Vertical 9:16 mobile game screen, full-bleed. Woodcut print style, black ink on warm off-white paper, carving marks, a single warm red accent (the hearth fire), flat paper-theatre layers, storybook dark fantasy with warmth, no gradients.
Interior of an old timber inn at night: a hearth fire, long tables, hanging lanterns, a few silhouetted patrons in profile; at the far end a great stone archway set into the wall, its opening showing a different world (a moonlit marsh). In the foreground, in side profile, the hooded wanderer resting on a bench, sword across his knees. Warm, quiet, safe.
Avoid: photorealism, 3D, anime, gradients, text, watermark, visible faces.
```

## 7. La mappa delle milestone (9:16)
```
Vertical 9:16 mobile game map screen. Woodcut print style, black ink on warm off-white paper, carving marks, single deep red accent, like an engraved map in an old book, no gradients.
A winding path climbing the page from bottom to top through a misty marshland, branching at each stop into two or three roads; each stop is a carved round medallion with a simple symbol (crossed swords, a scroll, a question mark, a hand, a hot spring, a scale). At the top, a dark red-marked stronghold where the boss waits. A tiny hooded figure in profile walks on the lowest stop. Hatched clouds and reeds at the margins.
Avoid: photorealism, 3D, anime, gradients, readable text, watermark.
```

---

## Come valutare i risultati
Le stesse domande per ogni immagine:
1. **Tono:** si sente il buio e insieme il calore? (DESIGN §1.3)
2. **Leggibilità:** posture e intenzione del nemico si capiscono dalla sola sagoma?
3. **Realizzabilità:** si può tradurre in SVG con sagome piene, tratteggi e un solo colore d'accento? Se un'immagine è bellissima ma pittorica, vale come atmosfera, non come modello.
