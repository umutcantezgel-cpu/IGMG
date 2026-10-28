## Kein laufender Lauf
- Lauf „Marktstart IGMG“ (IGMG-Daten für die Website) abgeschlossen am 28.10.2026: gemergt nach `main` (umutcantezgel-cpu/IGMG#5),
  Bericht `_lauf/belege/marktstart-igmg/BERICHT.md`, offene Menschen-Punkte `_lauf/MENSCHEN.md` § 8 (M-099…M-120),
  Livegang `web/docs/GO-LIVE.md` C6–C14.
- Lauf „Lern-App“ abgeschlossen am 26.10.2026 (`_lernapp/ABSCHLUSS.md`, `_lernapp/BERICHT.md`); Lauf „Gemeinde-Plattform“ am
  16.10.2026 (`_gemeinde/ABSCHLUSS.md`). Nichts automatisch fortsetzen; neue Arbeit nur auf neuen Auftrag des Nutzers.
- `_gemeinde/`, `_lernapp/` und `_archiv/` sind Unterlagen abgeschlossener Läufe: dort nur auf ausdrücklichen Auftrag ändern.
- Was nur Menschen tun können: `_lernapp/MENSCHEN.md` (LM-01…LM-40) und `_lernapp/GO-LIVE.md`.

## Übergabe 27.10.2026 (alte Umgebung beendet, neue Umgebung übernimmt)
Auf `main` (Stand dieses Commits) liegen zwei Nachträge auf Nutzerauftrag, beide schon gepusht:
- **L3-E22** Wissenskurs als „Entwurf zur Prüfung“ auf der Testdomain (live geprüft, fertig).
- **L3-E23** „Ja alles freischalten“: `lernapp_sprechen` in der Produktion an (`IN_PRODUKTION_AN`), B1 de/tr e16 frei
  (nur `status` in sechs Inhaltsdateien). Einzelheiten: `_lernapp/ENTSCHEIDUNGEN.md` L3-E23, `_lernapp/PRUEFPUNKT.md`.

Offen – in dieser Reihenfolge, wenn der Nutzer es so will:
1. **Mängelrunde 1 nicht ganz geprüft:** Commit 6aa57d43 (Sprachprüfung ohne Sackgasse bei Abbruch/Ladefehler: `Sprechen.tsx`,
   `geraet.ts`, Unit, `typen-b.spec.ts`) ist nur mit `pnpm typen`, eslint, Unit `sprechen`/`funktionen` (31/31) und
   Religion rc=0 belegt. Es fehlen: ein Produktionsbau + alle Lern-App-E2E (`tests/e2e/lernapp` + `mein-bereich-lernen.spec.ts`,
   Projekte telefon und desktop, mit `E2E_ATTRAPPEN=1`, ohne `FUNKTION_LERNAPP_SPRECHEN`).
2. **Rest der Gegenprüfung (niedrig):** E2E-Beleg „kein Abruf unter `/lern-app/modelle/` vor dem Tipp auf ‚Sprachprüfung laden‘“
   und Beleg des Rückfalls `FUNKTION_LERNAPP_SPRECHEN=aus`. Danach eine frische, unabhängige Gegenprüfung von 9cb7e754..HEAD.
3. **Live prüfen** auf https://igmg-wetzlarer.vercel.app (Bau-Kennung `data-bau` auf `/lern-app/de` = neuer `main`):
   Verzeichnisse `/lern-app/pakete/{de-aus-ar,de-aus-tr,tr-aus-ar,tr-aus-de}` enthalten `*.b1.e16`, Paket 200; HEAD auf
   `/lern-app/modelle/whisper-base-64da572/onnx/encoder_model_quantized.onnx` 200; im Browser zeigt eine de- oder
   tr-Sprechaufgabe „Sprachprüfung laden (≈ 95 MB)“ (nicht laden).
4. **Nur der Nutzer (LM-40):** Ratenregel der Vercel-Firewall für `/lern-app/modelle/` (Fixed Window 600 s, 200 Anfragen je IP,
   429). Klickfolge: `_lernapp/GO-LIVE.md`, Abschnitt „Ausnahme N-4“. Die Vercel-Verbindung der alten Umgebung sah das
   IGMG-Projekt nicht.

Hinweise: `pnpm test:integration -- <dateien>` startet die ganze Suite; gezielt `pnpm exec vitest run --project integration
<dateien>`. Bau und E2E brauchen PostgreSQL 16 und Mailpit (`web/tests/e2e/LIESMICH.md`). Commits mit Pfadangabe, `main` nur per
Fast-Forward.
