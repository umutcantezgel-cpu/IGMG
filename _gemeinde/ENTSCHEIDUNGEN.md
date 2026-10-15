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

## L2-E06 · 2026-10-15 · Orchestrator · Rezitationen über die Route `/audio/…`, kein Rewrite (Z-11, ADR 0029 Nr. 1)
- Rezitationen liefert immer die Route `web/src/app/audio/[...pfad]/route.ts` aus, auch mit öffentlichem Audio-Speicher
  (`AUDIO_BLOB_READ_WRITE_TOKEN`). Einen Rewrite `/audio/*` in `vercel.json` gibt es nicht; ADR 0029 Nr. 1 ist
  entsprechend geändert. Das ist eine Abweichung vom AUFTRAG (§2.5 Audio, `AUFTRAG.md:208`; Z-11 „Audio-Rewrite belegt“,
  `AUFTRAG.md:564`); sie ist hiermit entschieden, Z-11 wird mit der Route belegt.
- Begründung:
  1. **Schutz nicht aktiver Rezitationen:** Die Route liefert nur Dateien mit Eintrag in `quran_audio`; Dateien einer
     nicht aktiven Rezitation nur mit `rezitation.bearbeiten` (Werkstatt), sonst 404, und dann `private, no-store`.
     Ein Rewrite auf den Blob-Speicher gäbe jede hochgeladene Datei ohne diese Prüfung heraus – auch Aufnahmen, für
     die noch keine Vereinbarung über Rechte und Stimme vorliegt (ADR 0029 Nr. 4, MN-03).
  2. **Gleicher Ursprung und Byte-Bereiche:** Die CSP bleibt `media-src 'self'`; Range-Anfragen werden durchgereicht
     (200/206/416, `liefereAudio` in `web/src/lib/audio/speicher.ts`; Test
     `web/tests/integration/verwaltung-rezitationen.test.ts`, „Auslieferung“ und „nicht aktive Rezitation“).
  3. **Import ohne Einstellungen (L2-E04):** Ein Rewrite bräuchte die Adresse des Blob-Speichers (je Speicher eine eigene
     Subdomain) fest in beiden `vercel.json`; die gibt es erst nach dem Verbinden des Speichers.
- Folgen: Jeder Abruf läuft durch eine Funktion in fra1 (Blob → Funktion → Browser); aktive Rezitationen tragen
  `public, max-age=86400`. Die Kosten im gewählten Tarif sind nicht gemessen [prüfen, ML-09]. Die Dateien liegen im
  öffentlichen Speicher unter einer Adresse mit Inhalts-Hash; wer diese Blob-Adresse kennt, kommt ohne die Route an die
  Datei. Rückfall und Wiedervorlage: wenn Messungen im Betrieb zeigen, dass die Funktion zu langsam oder zu teuer ist
  (MN-19), oder wenn nicht aktive Aufnahmen auch über die Blob-Adresse geschützt sein sollen (dann privater Speicher).
