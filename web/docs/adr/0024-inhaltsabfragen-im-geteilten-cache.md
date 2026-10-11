# ADR 0024 – Inhaltsabfragen im geteilten Cache (`'use cache: remote'`)

Stand: 2026-10-11 · Lauf „Gestaltung aufwerten und Vercel-startklar machen“ · ergänzt ADR 0004 und 0019

## Kontext

Die öffentlichen Inhalte laufen über Abfragen in `src/server/queries/*` mit Cache-Tags; die Verwaltung invalidiert sie mit `updateTag`/`revalidateTag` (`src/lib/cache/aktualisieren.ts`). Bisher stand dort `'use cache'`.

- Next.js (lokale Doku `use-cache-remote.md`, `cacheHandlers.md`): `'use cache'` speichert im Arbeitsspeicher des Prozesses. Mehrere Instanzen teilen ihn nicht, und `revalidateTag` wirkt mit dem Standard-Handler nur auf der eigenen Instanz.
- Vercel (Doku „Runtime Cache“): `'use cache: remote'` legt Einträge im Vercel Runtime Cache ab, geteilt über Instanzen, mit Tag-Invalidierung; `'use cache'` bleibt dort flüchtiger Speicher je Instanz.
- Auf Vercel laufen mehrere Instanzen (Fluid Compute). Eine Instanz, die nach einer Änderung eine Seite neu aufbaut, könnte einen veralteten Speichereintrag einbacken (Prüfung H-V07/V10, Risiko „hoch“).

## Entscheidung

- Alle Inhaltsabfragen in `src/server/queries/*` nutzen `'use cache: remote'` (20 Stellen). Tags, `cacheLife` und die Invalidierung bleiben unverändert.
- Ausnahmen: `suche` (beliebige Suchbegriffe würden den geteilten Cache aufblähen; Ergebnisse dürfen je Instanz kurz veralten) und `heuteBerlin` (keine Datenbank) bleiben bei `'use cache'`.
- Kein eigener `cacheHandlers`-Eintrag: Auf Vercel stellt die Plattform den Remote-Handler. Lokal und unter Docker (ein Prozess, ADR 0017) nutzt Next.js ohne Konfiguration für `default` und `remote` denselben In-Memory-Cache – das Verhalten dort ändert sich nicht.

## Umkehrprobe

Falsch, wenn der Runtime Cache auf dem gewählten Tarif Kosten oder Grenzen erreicht, die den Nutzen übersteigen. Dann zurück zu `'use cache'` mit kurzer `cacheLife` (eine Zeile je Abfrage) und Annahme kurzer Veraltung.

## Folgen zweiter Ordnung

- Abfragen messen auf Vercel eine kleine Netzlatenz beim Cache-Zugriff; die öffentlichen Seiten sind ohnehin statisch vorgerendert (ADR 0004), betroffen sind vor allem Neuaufbauten nach Änderungen.
- MUSTER.md nennt für öffentliche Abfragen jetzt `'use cache: remote'`.
- Nachweis „Änderung sofort sichtbar“ über mehrere Instanzen bleibt ein Vorschau-Test mit Datenbank (Menschen-Schritt, GO-LIVE) – lokal gibt es nur eine Instanz.
