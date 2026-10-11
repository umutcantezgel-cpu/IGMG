# ENTSCHEIDUNGEN – Letzter Lauf

Kennung L-Exx. Folgenreiches mit Denkprotokoll (Ziel → drei Wege → Bewertung → Umkehrprobe → Folgen zweiter Ordnung).

## L-E01 · 2026-10-11 · Nutzer · Push auf `main` als regelmäßiges Update
- Abweichung von AUFTRAG G2/PUSH/VERÖFFENTLICHUNG auf ausdrückliche Anweisung des Nutzers („push auf main immer wieder mal als updates“).
- Regel: Arbeit zuerst auf ARBEITSBRANCH; auf `main` nur nach grünem Wellen-Build bzw. Etappentor, als Fast-Forward (`git push origin claude/blissful-edison-x3j16w:main`), nie erzwungen, keine halbfertigen ZWISCHENSTAND-Stände.
- Jeder Push auf `main` löst ein Produktions-Deployment aus → vorher V-02-Build und `pnpm check` grün; danach Prüfung des Produktions-Deployments per Vercel-MCP; bei Rot Revert-Commit auf `main`.

## L-E02 · 2026-10-11 · Nutzer · Startklar-Bausteine neu, kein Einwilligungs-Banner
- Befund: Der Release-Lauf (Kern 2.0, `_lauf/release`) endete bei P0/P1; Einwilligungs-Manager, Startklar-Cockpit, `pnpm startklar`, `release:check`, SITE_MODE (K-21), Umgebungsprüfung (K-30), GO-LIVE.md und docs/deploy fehlen.
- Entscheidung (Nutzer: „vom jetzigen Stand weiterarbeiten“): Cockpit, `pnpm startklar`, `pnpm release:check`, SITE_MODE und typisierte Umgebungsprüfung werden gebaut.
- Kein Einwilligungs-Banner: Die Website nutzt keine Drittanbieter; die einzige externe Einbettung (OpenStreetMap) lädt bereits erst nach Klick (`KarteNachKlick`); Geräte-Speicher nur für einen Hinweis-Merker (`KonzeptHinweis`, technisch erforderlich). Annahme in MENSCHEN.md (rechtliche Bestätigung).
- Folge: UNANTASTBAR „Verhalten des Einwilligungs-Managers“ ist gegenstandslos; „Prüfungen des Startklar-Cockpits“ gelten ab dessen Bau.

## L-E03 · 2026-10-11 · Opus · Wahrheit über frühere Prüfsuiten
- AUFTRAG §2 nennt `pnpm release:check` und `pnpm startklar` als Bestand; beide existieren nicht. Z-02/Z-12 werden gegen die tatsächlich vorhandenen Suiten gemessen (`check`, `test:integration`, `sprachen:pruefen`, `geheimnisse:pruefen`, Build) plus die neu gebauten `startklar`/`release:check`. Kein Kriterium wird dadurch still abgesenkt.
