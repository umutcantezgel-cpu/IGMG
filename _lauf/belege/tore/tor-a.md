# Tor A – Abnahme Welle A (öffentliche Seiten)

Stand 2026-10-11, vorläufig (Darstellungsprüfung läuft). Rückgaben: `_lauf/belege/welle-a/Axx.md` (Personennamen aus dem Bestand geschwärzt, E-005).

## L1 je Paket (5 Prüfungen × 0–2, Freigabe ab 8/10 ohne eine 0)

Prüfungen: **V** Vollständigkeit gegen Blatt/Kriterien · **M** Muster und Regeln (MUSTER, K-xx, G-xx) · **P** Prüfungen belegt (Typen, Lint, Sprachen, Seed, curl, Bildschirmfotos) · **D** Darstellung (Darstellungsprüfer, 390/1440) · **B** Bericht (Formular vollständig, ehrlich, Fundstellen)

| Paket | Inhalt | V | M | P | D | B | Summe | Ergebnis | Nacharbeit durch O |
|---|---|---|---|---|---|---|---|---|---|
| A01 | Nachrichten-Liste | 2 | 1 | 2 | – | 2 | – | vorläufig frei | Linktext „Weiterlesen“ (SEO 90) → sr-only-Kontext |
| A02 | Nachrichtendetail | 2 | 2 | 2 | – | 2 | – | vorläufig frei | – |
| A03 | Über uns | 2 | 2 | 2 | – | 2 | – | vorläufig frei | – |
| A04 | Vorstand + PersonCard | 2 | 2 | 2 | – | 2 | – | vorläufig frei | Bestandsnamen im Bericht geschwärzt |
| A05 | Projekte | 2 | 2 | 2 | – | 2 | – | vorläufig frei | – |
| A06 | Kontakt, Karte nach Klick | 2 | 2 | 1 | – | 2 | – | vorläufig frei | Klickstrecke ungeprüft (keine Koordinaten); CSP `frame-src` für OSM erst mit M-010 |
| A07 | IGMG + OrgCard | 2 | 2 | 1 | – | 2 | – | vorläufig frei | nur Dev-Server geprüft |
| A08 | OrganizationPage | 2 | 2 | 1 | – | 2 | – | vorläufig frei | Sichtprüfung erst mit A09 |
| A09 | Organisationsseiten | 2 | 2 | 1 | – | 2 | – | vorläufig frei | – |
| A10 | Korankurse + CourseCard | 2 | 2 | 2 | – | 2 | – | vorläufig frei | Kursstatus-Feld → Welle C (V06) |
| A11 | Islamisches Wissen Übersicht | 2 | 2 | 1 | – | **0** | – | **nicht frei nach L1** → von O nachgeprüft | leerer Bericht; Code von O geprüft, axe/Datenschutz über Routentabellen grün |
| A12 | Wissen-Thema | 2 | 1 | 1 | – | 2 | – | vorläufig frei | Inselogik doppelt (`ThemaInsel`/`WissenInsel`) – technische Schuld; Bedienung → A23b |
| A14 | Gebetszeiten-Seite | 2 | 1 | 2 | – | 2 | – | vorläufig frei | Vorabruf der Anzeige (+16 kB) → `prefetch={false}`; verschachtelte tabpanel |
| A15 | Qibla + Einstellungen | 2 | 1 | 1 | – | 2 | – | vorläufig frei | tabpanel doppelt, toter Link „Standort ändern“ entfernt |
| A17 | Impressum, Datenschutz (Entwurf) | 2 | 2 | 2 | – | 2 | – | vorläufig frei | – |
| A18 | 404, Fehler, Offline | 2 | 1 | 1 | – | 2 | – | vorläufig frei | Fehlergrenzen +20 kB je Route → E-030; Soft-404 der Sammelroute offen |

## Gemeinsame Prüfungen (Orchestrator)

- `pnpm check`: Typen, Lint, 226 Unit-Tests grün (inkl. `bundle-regeln`).
- `pnpm test:integration`: 66/66.
- `pnpm sprachen:pruefen`: 922 Schlüssel in de/tr/en vollständig.
- E2E Routenlauf (`barrierefreiheit.spec.ts` + `datenschutz.spec.ts`, alle 19 Routen × 3 Sprachen × 390/1440): **234 bestanden, 0 fehlgeschlagen**, 4 übersprungen.
- Leistung (`pnpm messen`, devtools): alle Messrouten 166–173 kB JS, Perf. 98–99, LCP 1,6–1,9 s, CLS ≤ 0,002 (E-030; vorher 184–206 kB).

## Offene Befunde

1. **Soft-404 und 404 ohne HTML-Inhalt** (mittel): `/gibt-es-nicht` → 200 mit noindex; dynamische Segmente → 404, Inhalt erst nach Hydrierung. Prüfen: `notFound()` in `[...rest]` + `[locale]/not-found.tsx`.
2. Darstellungsprüfung DP-A1…A3 und Sicherheitsprüfung SP-A: laufen.
