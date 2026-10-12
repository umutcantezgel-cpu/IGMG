# Menü-INP am Endstand 58a3344 · Diagnose und Maßnahme

**Befund** (`C-inp.md`, INP verschränkt, Telefon 390, CPU 4×): Die längste Eingabe ist fast überall „Menü öffnen“. Auf 3500 ist sie langsamer als auf 3100:

| Route | 3100 (ms) | 3500 (ms) |
|---|---|---|
| `/veranstaltungen` | 152 | 256 |
| `/nachrichten` | 168 | 264 |
| `/` | 224 | 224 |

Zerlegt nach Anteilen (`C-inp-*-r*.json`):
- Eingabeverzug ≈ 20 ms.
- Verarbeitung ≈ 10 ms.
- Der Rest ist Darstellungsverzug: 3100 ≈ 120–150 ms, 3500 ≈ 150–310 ms.

**Spur** (`$SCRATCHPAD/menue-spur/spur2.mjs`, Ablauf wie `inp.mjs`): Die Klick-Aufgabe dauert auf beiden Ständen 170–200 ms. Davon sind ≈ 100 ms `UpdateLayoutTree` innerhalb von `showModal()`. Der modale Dialog macht die übrige Seite inert, und der Browser berechnet dafür die Stile aller ≈ 600 Elemente synchron neu. Das ist der Kostentreiber, und es gab ihn schon im Ausgangsstand. 3500 legt beim Öffnen zusätzlich die Ebenen der Schublade an (B-02/K-07: Schublade und vier gestaffelte Gruppen) und zeigt die Rückmeldung am Knopf (B-01).

**Versuch Ebenen** (`inp-menue.mjs`, Schublade, Hintergrund und Schatten per CSS abgeschaltet, 5 Runden): Der Median streut von 160 bis 376 ms, keine Variante ist klar schneller. Die Animation ist nicht der Haupttreiber.

**Maßnahme** (MobilMenue.tsx): Der Knopf öffnet den Dialog erst nach dem nächsten Bild (`requestAnimationFrame` → `setTimeout`). Das gedrückte Bild des Knopfs ist dann die sichtbare Antwort auf die Eingabe. Das Menü folgt ein Bild später mit derselben Schubladen-Bewegung. Modalität (inert), Fokus im Kreis (F-18) und Escape bleiben unverändert beim Browser. Doppeltes Öffnen verhindert `if (!d.open)`.

**Nachmessung:** am Neubau des Stands mit der Maßnahme, siehe `C3-inp.md`.
