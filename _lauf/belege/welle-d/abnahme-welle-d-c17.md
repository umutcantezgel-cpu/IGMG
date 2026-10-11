# Abnahme Welle D (Runde 2) und C17 – Übergabe an den Release-Lauf (11.10.2026)

Die Pakete liefen im Workflow `wf_cd843a36-d8f`. Kurz vor dem Ende kam der Plan-Modus für den neuen Auftrag. C17 und D-O4 konnten Formatierung und Lint deshalb nicht mehr selbst abschließen; das habe ich im Übergang (R-E02) nachgeholt.

| Paket | Inhalt | Vollst. | Richtig | Geprüft | Dok. | Dateihoheit | Summe | Ergebnis |
|---|---|---|---|---|---|---|---|---|
| D-Q1 | Tanzil-Leser, `quran:import` mit SHA-256-Pflicht, Abfragen (Orchestrator) | 2 | 2 | 2 | 2 | 2 | 10 | abgenommen |
| D-Q23 | `/quran`, `/quran/[sure]`: ohne Import Platzhalter, ohne Korantext (G-06), statisch | 2 | 2 | 1 | 2 | 2 | 9 | abgenommen; E2E vom Orchestrator ausgeführt |
| D-O13 | Metadaten-Prüfung von 24 Seiten, JSON-LD (Mosque, Event, NewsArticle, BreadcrumbList) | 2 | 2 | 2 | 2 | 2 | 10 | abgenommen |
| D-O4 | OG-Bilder (Standard, Nachricht, Termin) | 1 | 2 | 1 | 2 | 2 | 8 | abgenommen mit Befund: Startseite ohne `og:image`, Lint nachgeholt |
| C17 | Rollenmatrix: 48 Actions × Rollen (904 Fälle) plus Anmelde-Actions | 2 | 2 | 2 | 2 | 2 | 10 | abgenommen; 2 Befunde als `it.fails` |

## Offene Punkte (Audit-Befunde im Release-Lauf)
- **C17-1:** Ticket-Organisationsgrenze. Die Action ist strenger als die Matrix; Matrix oder Action angleichen.
- **C17-2:** Der zweite Faktor lässt sich mit Sitzung und Passwort neu einrichten, ohne die bestehende Bindung zu prüfen.
- **D-O4-1:** `og:image` der Startseite fehlt.
- **D-O13:** `meta.beschreibung` ist ein Platzhalter. Der Entwurfshinweis von Impressum und Datenschutz steht in den Metadaten. Die Anzeige sollte noindex bekommen.
- **D-Q23:** Der Untertitel verspricht Tafsir. Die Routentabellen (T5/T8) kennen `/quran` noch nicht.
- **Flakes unter Last:** 5 Verwaltungs-E2E (Weiterleitung nach 5 s). Gegenprobe bei niedriger Last im Übergang, siehe unten.

## Prüfläufe im Übergang (Last ≈ 2,5, keine Agenten)
- `pnpm typen`, `pnpm lint`: grün.
- Unit: 33 Dateien, 549 bestanden, 3 erwartet fehlschlagend.
- Integration: 30 Dateien, 1338 bestanden, 2 erwartet fehlschlagend (C17-1/2).
- `pnpm build`: grün. `/quran` statisch, OG-Routen vorgerendert.
- E2E (voll): siehe `_lauf/STATUS.md`, Endstand des Aufbau-Laufs.
