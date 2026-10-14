# ENTSCHEIDUNGEN – Lauf „Gemeinde-Plattform“

## L2-E01 · 2026-10-13 · Nutzer · Sofortstart ohne Warten
- Der Nutzer verlangt, den Plan sofort und ohne Anhalten abzuarbeiten („durchballern“); die Startbedingung „ABSCHLUSS des Vorlaufs“ entfällt.
- Der Vorlauf hat am 12.10. um 23:43 UTC auf `main` (b0bcc11) ABSCHLUSS gemeldet (Kriterien 10/12, Ausnahmen A-01/A-02).
- Die neue Werkstatt liegt in `_gemeinde/`; `_werkstatt/` des Vorlaufs bleibt unverändert und wird in E7 nach `_archiv/` verschoben. Werkzeuge sind nach `_gemeinde/werkzeuge` kopiert.

## L2-E02 · 2026-10-13 · Nutzer · Fast-Forward auf `main` (Fortschreibung von L-E01)
- Arbeit auf `claude/trusting-lovelace-6nfolz`; vor jedem Fast-Forward wird `origin/main` gemergt.
- `main` nur nach grünem Tor (Build preview + production, `pnpm check`, Integration, `sprachen:pruefen`, startklar) und mit sicheren Funktionsschaltern; nie erzwungen; bei Rot Revert-Commit.

## L2-E03 · 2026-10-13 · Nutzer · Entscheidungen aus der Planung
- Lokaler Server = Helfer neben Vercel (Sicherung, Kiosk, Takt, optional Echtzeit).
- Chat = nur moderierter Gruppen- und Elternkanal; Kinderschutz S-01…S-18.
- Konten: Gemeinde, Eltern, Lehrkraft, Schüler.
- Rezitation: eigene Aufnahmen (Fatiha + Cüz 30 zuerst) und Erlaubnis eines bekannten Rezitators; Player für jede Rezitation.
- Web Push nur nach Opt-in je Person.

## L2-E04 · 2026-10-14 · Nutzer · Vercel-Import ohne Einstellungen
- Wer das Repository in Vercel importiert, klickt nur „Deploy“. Gleichwertig sind Root Directory leer (Services aus
  `/vercel.json`) und Root Directory `web` (Next.js mit `web/vercel.json`); beide Dateien bleiben gleich (Test
  `vercel-import.test.ts`). Fällt Vercel bei leerem Root Directory auf „Other“ zurück, bricht der Wächter
  `/package.json` mit Anleitung ab. Ohne `APP_URL` gilt auf Vercel die Produktionsadresse des Projekts.
- Begründung: Wunsch des Nutzers „Vercel soll beim Import alles automatisch verstehen“; ein Umzug der App in den Stamm
  wäre unverhältnismäßig (Jury im Entwurfs-Workflow).

## L2-E05 · 2026-10-14 · Orchestrator · Null in Zeiten und Daten (Sichtabnahme X-6/X-12)
- Die Null der Textschrift (Atkinson Hyperlegible Next) behält ihren Schrägstrich bzw. Punkt. Er ist ein
  Lesbarkeitsmerkmal der Schrift (0 und O unterscheidbar, gewollt für Ältere und Leseanfänger); die Schrift hat kein
  Feature `zero` zum Abschalten, eine eigene Ziffernschrift brächte eine weitere Schriftdatei und Uneinheitlichkeit.
- Wiedervorlage: wenn der Vorstand eine andere Ziffernform wünscht (MENSCHEN), dann eigenes `@font-face` mit
  `unicode-range: U+0030-0039`.
