# L0-PRUEFER · Planprüfung (Rückgabe, vom Orchestrator abgelegt)

GEÄNDERTE DATEIEN
keine (nur gelesen).

WAS UND WARUM
Planprüfung nach AUFTRAG §E1 gegen PLAN, ABNAHME, KERN 1.1, ENTSCHEIDUNGEN, REFERENZ und git-Stand (letzter Commit 18:35). Ergebnis: nicht freigabefähig; eine Korrekturrunde genügt.

GEMEINSAME DATEIEN
keine. PLAN und ABNAHME korrigiert der Orchestrator.

PRÜFUNG UND ERGEBNIS

| Punkt | Ergebnis | Fundstelle |
|---|---|---|
| 1 Z-01–Z-12 | Lücke: Z-02 (E0-PRUEFER-03 offen), Z-04 (drei Erzählansichten nur als Momente), Z-05 (B-05-Nachweis ohne Paket), Z-08 (kein Leistungspaket), Z-12 (Wortlaut-Snapshot fehlt) | PLAN E0, E2–E5; ABNAHME |
| 1 V-01–V-13 | Lücke: V-07, V-08, V-10, V-12 ohne Paket; V-02 und V-09 nur als Prüfung | PLAN E2–E5 |
| 2 Modell, Kriterium | Modell genannt; Kriterium in keiner Tabelle; Kür ohne Z-Bezug | PLAN E0–E5 |
| 3 Schreibrechte | Lücke: E3/E4 ohne Spalte; vermutlich Überschneidung H-A02/H-A03 (EventCard, Morph) und H-G01/H-Z01 (Layout) | PLAN E3, E4 |
| 4 Muster, Maßstab | Teilweise: nur H-A01–A07 und Kür nennen REFERENZ; H-G, H-Z, H-W, H-D, H-S, H-V ohne Muster; H-B ohne Maßstab | PLAN E2–E5 |
| 5 Status | Lücke: PLAN (zuletzt deab7cc, 18:12) fehlen 9 Commits | s. u. |
| 6 Mengen, Pfad | Lücke: H-B nicht gezählt; 8 Opus benannt statt ≈12; Kür 9 eindeutig statt ≈20; kein kritischer Pfad | PLAN Mengengerüst |

Veraltete Zeilen (Punkt 5)
- „offen“, aber erledigt: H-V01 (0c224da), H-V03, H-V06 (c596742), H-S01 (0cd8173), H-S02 (8df9556), O-05/O-06/O-07 (0c224da, 47ed617, c596742), H-D01/H-D02 (berichte/).
- „läuft“, aber fertig: E0-PRUEFER-02, E0-KUNDSCHAFTER-06 (berichte/), E2-TOR (protokolle/E2-TOR-*).
- Falsch: STATUS „E0 abgeschlossen“ (E0-PRUEFER-03 offen); STATUS „Pflicht 14/≈45“ (belegt sind mindestens 24, ohne H-FIX2); ADR 0018–0023 „mit E3“ (erledigt, de04689).
- Verweise: PLAN und ABNAHME nennen KERN 1.0 (aktuell 1.1, 44bd7ee); Z-07/Z-08 nennen `…ausgangswerte.md` (vorhanden: `.txt`); E0-Bilder liegen nur im Scratchpad, `_werkstatt/bilder` ist leer.

KORREKTURVORSCHLÄGE
1. Status nach Commits und Zählung korrigieren; E0 bleibt offen, bis E0-PRUEFER-03 die Funktionsliste liefert.
2. E3/E4 um Schreibrechte, Abhängigkeiten und Kriterium ergänzen; H-A02/H-A03 zu einem Paket zusammenlegen oder Morph als eigenes Opus-Paket.
3. H-G01–G04 und H-Z01–Z03 vor H-A01–A07 einplanen, sonst wechseln die Bausteine nach den Ansichten. Kritischer Pfad: O-04 → E2-TOR → B-05-Nachweis → H-A → E3-TOR → H-G/H-Z → E4-TOR → Stufe C → Endprüfung; parallel O-05 → H-D01 → V-13.
4. Ergänzen: Über uns, Projekte, Organisationsseite als Gesamtansichten (Opus, dann 11); Pakete für V-07, V-08 (ADR 0023 umsetzen), V-10, V-12; Leistungspaket für Z-08 (E0-Spanne 80–94 unter Last); Wortlaut-Snapshot der Rechtstexte; E0-Bilder ins Repo (AUFTRAG §8).
5. ABNAHME Z-12 an L-E02 anpassen (Einwilligungsprüfungen entfallen), Version erhöhen. Z-03 an REFERENZ §5 angleichen: Stufe A verlangt 0 Funde in geänderten Dateien, nicht nur „0 neue“.
6. H-B-Befundpakete schätzen und einrechnen (Obergrenze 2 × Ansichten × Kategorien). Kür auf 20 benannte Pakete bringen, Duplikate streichen: Bildschirm-Anzeige (= H-W02), Verwaltungs-Übersicht (≈ H-W03); Fehlerseite ist nach AUFTRAG §6 Pflicht. „Islamisches Wissen“ und „Quran-Seiten“ nur mit geprüfter Quelle. Opus-Pakete nicht gegen Haiku-Plätze rechnen.

OFFENE FRAGEN
- AUFTRAG §10 nennt fünf Kategorien, der Ansichtswert ist aber das „Mittel der sechs Kategorien“. Welche sechs? Davon hängen Z-04 und die Befundzahl ab.
- Sichtabnahme: §9 (E2) verlangt einen frischen Opus-Unteragenten, §10 „durch dich“. Welche Regel gilt?

BILDBELEGE
keine.

=== ENDE L0-PRUEFER · BEREIT ZUR RÜCKGABE ===
