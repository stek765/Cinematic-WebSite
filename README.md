# Cinematic Scroll Animation

**Live Demo:** [https://warm-crayon.surge.sh/](https://warm-crayon.surge.sh/)
![Uploading Screenshot 2026-03-07 alle 13.31.13.png…]()

Una landing page interattiva basata su sequenze di immagini controllate dallo scroll. Il progetto utilizza HTML5 Canvas e JavaScript puro per renderizzare un'animazione fluida frame-by-frame legata alla posizione di scorrimento dell'utente.

### Stack Tecnico
*   **HTML5 Canvas**: Rendering ad alte prestazioni della sequenza immagini (240 frame).
*   **Vanilla JS**: Logica di preloading "Critical Path", interpolazione lineare (Lerp) per inerzia dello scroll e gestione resize responsive.
*   **CSS3**: Layout dark theme, effetti glassmorphism e animazioni overlay.

### Caratteristiche Principali
*   **Smart Preloading**: Blocca l'interfaccia solo per i primi 60 frame critici, caricando il resto in background per ottimizzare al massimo il TTI (Time to Interactive).
*   **Physics-based Scroll**: Implementazione di inerzia custom per un movimento fluido non legato allo scroll nativo del browser (1:1).
*   **Responsive Rendering**: Logica `cover-fit` dinamica per adattare il soggetto 3D a qualsiasi viewport senza distorsioni.
