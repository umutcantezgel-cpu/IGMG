# KERN 3.0 – Gemeinde-Plattform

Gilt zusätzlich zu `_werkstatt/KERN.md` (K-001…K-0xx des Vorlaufs) und `web/docs/MUSTER.md`. Bei Widerspruch gilt dieser Kern.

## Leitidee (K-001 v3)
„Die Website lebt im Takt des Tages und im Weg des Lernens: Die sechs Gebetszeiten geben den Tag vor, der Achtstern die Ordnung,
und jeder Schritt vom ersten Buchstaben bis zum Hatim ist ein sichtbarer Weg – warm wie Papier, ruhig wie ein Lehrraum.“

## Unantastbar
- Logos, Wortlaut der bestehenden Rechtstexte (Prüfung `wortlaut.mjs`), religiöse Quellenregeln, Logik der Moschee-Gebetszeiten
  (Änderung nur per ADR + Imam), Prüfungen des Cockpits.

## Religion (ADR 0030)
- Kein Agent schreibt Verse, Hadithe, Bittgebete, Übersetzungen, Wortbedeutungen, Tajwid- oder Fiqh-Erklärungen.
- Arabisch nur aus importierten Dateien (`web/daten/**`, gepinnt mit SHA-256 und `QUELLE.md`) oder aus Codepunkten (Alphabet).
- Freigabe: Entwurf → zur Prüfung → geprüft (Rolle `religioese_pruefung`). Jede Änderung setzt zurück. Öffentlich nur „geprüft“.
- Unverändert importierte Ausgaben werden einmal je Ausgabe freigegeben (Spalten `aktiv`, `freigegebenVon/Am`).
- Prüfwerkzeug `_gemeinde/werkzeuge/religion-pruefung.mjs`: arabische Schrift außerhalb von `web/daten/**`, der Alphabetdatei
  `web/src/lib/elifbe/alphabet.ts` und der Tests ist Rot.

## Daten und Rechte
- Zwei Ebenen: Verwaltung (`rolle_zuweisung`, `darf()`), Gemeinde (`gemeinde_rolle`: gemeinde, eltern, lehrkraft, schueler) + Gruppenbezug.
- Chat-Inhalte nie über „Administration darf alles“ (`NIE_PER_ADMINISTRATION`).
- Sitzung absolut: Verwaltung 8 h, Lehrkraft/Kind 12 h, sonst 30 Tage. Lehrkraft und Verwaltung: TOTP Pflicht.
- Kinder < 16: Konto nur mit Elterneinwilligung, Benutzername statt E-Mail (`k-…@konto.invalid`, Mail-Ausgang weist `.invalid` ab).
- Funktionsschalter (ADR 0035): alles mit Personendaten ist in Produktion aus, bis Menschen freigeben.

## Gestaltung
- Neue Tokens nur als Skalen: `--font-quran`, `--text-arabisch-1/2/3`, `--color-tajwid-*` (≥ 4,5:1, mit Unterstreichungsmuster),
  `--container-lesen`, `--ebene-player`.
- Formensprache: Achtstern, 24-px-Raster, 2-px-Strich; keine Mondsichel, keine Kuppel, keine generierten Moscheebilder, kein 3D.
- Bewegung: nur CSS, jede mit reduzierter Variante; Register B-01…B-27 (AUFTRAG §4). Keine hochzählenden Zahlen, keine Ranglisten.

## Leistung
- Öffentlich ≤ 180 KB gz JS je Route; Interaktion erst nach Nutzeraktion per `import()`. Al-Baqara: HTML ≤ 150 KB gz.
- Öffentliche Seiten statisch, keine Cookies/Header; Konto-Seiten dynamisch, Nonce-CSP, noindex, no-store.

## Datenfluss
- Keine Drittanbieter-Anfragen auf öffentlichen Seiten. Standort nur im Browser (nie Koordinaten ins Netz).
- Push nur nach Opt-in; Nutzlast ohne Inhalte und Namen.

## Bewegungsregister (Fortschreibung, K-007)
| ID | Bewegung | Umsetzung | Reduziert |
|---|---|---|---|
| B-21 | Ortswechsel „Mein Ort“: Zeiten blenden über, Qibla-Nadel dreht einmal | `MeinOrtRechner.tsx` (`blendet-ein`, `transition-transform duration-(--dauer-moment)`) | ohne Drehung |
| B-26 | Seitenwechsel mit Richtung: tiefer → von rechts, höher → von links, seitlich → Überblendung; Kopf steht | `SeitenUebergang.tsx` (`data-richtung`), `globals.css` (`seite-von-rechts/links`) | kein Übergang |
