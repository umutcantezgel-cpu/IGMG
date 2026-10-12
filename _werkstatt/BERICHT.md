# BERICHT – Letzter Lauf

Morgenberichte (höchstens 20 Zeilen, du-Anrede, ohne Fachjargon) und am Ende der Schlussbericht mit Vorher-Nachher-Galerie (`_werkstatt/bilder/galerie.html`).

## Anleitung: Zusammenführen und Zurückrollen

**Wichtig vorab:** Auf deine Anweisung (L-E01) kamen geprüfte Stände schon während des Laufs per Fast-Forward auf `main`. Die Produktion `igmg-five.vercel.app` zeigt deshalb bereits den gestalteten Stand, aber noch ohne Datenbank: Sie zeigt Beispielinhalte, und Formulare und Verwaltung funktionieren dort nicht. Dieser Abschnitt beschreibt den Weg vom Beispielbetrieb zum echten Livegang.

1. **Vorher die Production-Variablen setzen.** Erst die Konten und Werte, dann der Code:
   - Datenbank (Neon, Frankfurt) und Dateispeicher (Vercel Blob, Frankfurt) im Vercel-Projekt `igmg` verbinden (`web/docs/deploy/VERCEL.md` Abschnitte 2 und 3).
   - Alle Variablen der Liste `web/docs/deploy/VERCEL-ENV.md` für „Production“ eintragen. Die Geheimnisse erzeugt `pnpm geheimnisse:erzeugen` (Abschnitt 4).
   - Die Schritte in dieser Reihenfolge stehen in `_werkstatt/MENSCHEN.md`, Abschnitt „Reihenfolge zum Livegang“, und in `web/docs/GO-LIVE.md`.
2. **Zusammenführen löst das Produktions-Deployment aus.**
   - Jeder neue Stand auf `main` baut und veröffentlicht die Produktion sofort, ohne weiteren Knopfdruck.
   - Den letzten Stand der Arbeitsbranche `claude/blissful-edison-x3j16w` bringst du per Pull Request nach `main`. Das geht als Fast-Forward, ohne Erzwingen (`VERCEL.md` Abschnitt 10).
   - Danach prüfst du die Hauptseiten (`VERCEL.md` Abschnitt 11) und das Startklar-Cockpit `/verwaltung/startklar`.
3. **Zurückrollen geht per Instant Rollback oder Revert.**
   - **Schnell:** Vercel › Projekt `igmg` › Deployments › letzte gute Produktion › „Instant Rollback“ [prüfen: Menüname].
   - **Über Git:** einen Revert-Commit auf `main` setzen. Vercel baut dann den alten Stand neu (`VERCEL.md` Abschnitt 12).
   - Ein Rollback setzt nur den Code zurück, nie die Datenbank. Deshalb ändern Migrationen die Datenbank nur ergänzend (ADR 0019).
4. **`_werkstatt` entfernen oder bewusst behalten.**
   - Der Ordner enthält die Laufunterlagen: Auftrag, Plan, Berichte, Prüfprotokolle, Bilder und Prüfwerkzeuge.
   - Er wird nicht mit ausgeliefert, denn `.vercelignore` schließt ihn aus.
   - **Empfehlung:** behalten, solange die Abnahme läuft; danach in einem eigenen Commit entfernen (`git rm -r _werkstatt`). Die Gestaltungsregeln stehen dann weiter in `web/docs/` und im Code; KERN.md vorher nach `web/docs/` übernehmen, wenn du sie als Nachschlagewerk willst.
   - Der Block in der Datei `CLAUDE.md` im Hauptordner wird am Laufende entfernt.
