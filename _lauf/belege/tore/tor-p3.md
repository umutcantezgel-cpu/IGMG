# Tor P3 – Ergebnis und Entscheidungen (Orchestrator)

Stand 2026-10-11. Rückgaben: `tor-p3-darstellung.md` (DP), `tor-p3-sicherheit.md` (SP), `tor-p3-d08.md` (D08), `tor-p3-testlaeufer.md` (TL).

## Testläufer (vor den Korrekturen)
GRÜN: check (191 Unit), Integration 48 + 1 offen, Sprachen 429 Schlüssel, Build, E2E 131 grün / 11 übersprungen, `pnpm messen` erfüllt, `pnpm audit --prod` ohne Lücken.

## Befunde und Maßnahmen
| Befund | Schwere | Maßnahme |
|---|---|---|
| SP H1 Passkey zählte als zweiter Faktor | hoch | behoben: nur aktiviertes TOTP zählt; Passkey-Endpunkte per HTTP gesperrt bis C12 (ADR 0003 Nachtrag) |
| SP H2 Anmeldung ohne wirksame Ratenbegrenzung | hoch | behoben: Begrenzung je IP (10/10 min) und Konto (8/15 min) in den Actions; Better-Auth-Anmeldung/2FA per HTTP gesperrt; Integrationstest + E2E-Test |
| SP M1 Organisationsredaktion sah fremde Organisationen | mittel | behoben: Liste und Detail nur eigene Organisation; E2E angepasst |
| SP M2 Lesen von Kontaktangaben ohne Audit | mittel | begründet: öffentliche, dienstliche Angaben (ADR 0003 Nachtrag) |
| SP M3 IP aus ungeprüften Headern | mittel | behoben: letzter X-Forwarded-For-Eintrag (`src/lib/sicherheit/ip.ts`); BETRIEB.md Hinweis |
| SP N1/N2 Limits 2FA/Einladung | niedrig | behoben |
| SP N3 Zod für Passwort | niedrig | behoben |
| SP N4 Fallback-Geheimnis im Quelltext | niedrig | behoben (zufällig je Prozess nur in Entwicklung/Bau) |
| SP N5 Längen-Seitenkanal in `gleich()` | niedrig | behoben (SHA-256 beider Seiten) |
| SP N6 Mindestlänge Geheimnisse | niedrig | behoben (≥ 32 Zeichen) |
| SP N7 Proxy-Matcher mit Punkt | niedrig | bleibt (kein Verwaltungspfad betroffen) |
| SP N8 Sensor-Permissions global | niedrig | offen für A15 (Qibla-Kompass) |
| SP N9 CSP-Muster /de/verwaltung | niedrig | behoben |
| SP N10 iCal max-age 900 | niedrig | auf 300 s gesenkt |
| SP N11 Einladung außerhalb Transaktion | niedrig | offen für C12 (Benutzer) |
| SP N12 UUID-Prüfung | niedrig | behoben (`z.uuid()`) |
| DP H-1 AGB-Link fehlt | hoch | Abweichung A-C04, Frage M-067 |
| DP H-2/H-3 Dashboard, Seitenleiste | hoch | Ausbaustand (C01 ff.), A-V01/A-V01b ergänzt |
| DP H-4 Verwaltungstabelle 390 px breiter als Bildschirm | hoch | behoben: absolut positionierte `sr-only`-Texte entkamen dem Scrollbereich → `relative` am Scroll-Container |
| DP M-1 Bildhöhe Featured-Karte | mittel | behoben (300 px) |
| DP M-2 Abstand Teilen/Merken | mittel | behoben (leere Live-Region `empty:hidden`) |
| DP M-3 Datumsumbruch Verwaltungstabelle | mittel | behoben (kurzes Datum, kein Umbruch) |
| DP M-4 Überschriften breiter als im Design | mittel | behoben: Titelschrift mit opsz (abgeleitet, OFL-konform umbenannt); Messung h1 „Veranstaltungen“ 1440: 326 px = Referenz |
| DP N-1 Silbentrennung | niedrig | behoben (`hyphens: auto`) |
| DP N-2/N-3/N-7 | niedrig | als Abweichungen A-S04a, A-S05f, A-V02d eingetragen |
| DP N-8 Menü-Knopf ohne Beschriftung | niedrig | behoben |
| D08 offene Frage fehlendes Titelfeld | – | behoben (Zod-Fehlerschlüssel „pflicht“), Test statt `it.todo` |
| D08 Audit ohne Änderung | – | behoben (Audit nur bei geänderter Zeile) |

## Nach den Korrekturen (Orchestrator-Lauf)
check 191 Unit · Integration 51 · E2E 132 grün / 12 übersprungen (nur Desktop-Abläufe) · Build grün · `pnpm messen` (devtools): Startseite P 99 / LCP 1,6 s / CLS 0,002 / JS 172,9 kB; Veranstaltungen P 99 / 1,6 s / 175,5 kB; Detail P 98 / 1,9 s / 177,5 kB; Anzeige P 99 / 1,6 s / 166,2 kB (`_lauf/belege/lighthouse/2026-10-11-03-22/`).

**Tor P3: bestanden.**
