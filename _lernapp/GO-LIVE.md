# GO-LIVE – Lern-App: Schalter je Funktion

**Stand:** 21.10.2026 (Paket L8-03). Die Lern-App ist in der Produktion **an** – ohne Personendaten, der Fortschritt bleibt auf
dem Gerät (Entscheidung des Nutzers vom 21.10.2026, `ENTSCHEIDUNGEN.md` L3-E12a; Code `IN_PRODUKTION_AN`). Alle Schalter mit
Personendaten sind in der Produktion **aus**, bis Menschen sie freigeben (KERN 4.0 §6).

Quellen dieser Liste (bei Widerspruch gilt der Code):

- `web/src/lib/funktionen-regeln.ts`: `IN_PRODUKTION_AN`, `MIT_PERSONENDATEN`, `VORAUSSETZUNGEN` (Sperren)
- `web/src/lib/startklar/gemeinde.ts`: Vorbehalt je Schalter im Startklar-Cockpit
- `KERN.md` §6, `MENSCHEN.md` (LM-01…LM-36), ADR 0035 (Schalter), ADR 0041 (Stichprobe), ADR 0042 (Sprechen)
- Gesamtliste der Website: `web/docs/GO-LIVE.md` (Abschnitt G); dort G4 für `KONTEN`, `LERNPLATTFORM`, `PUSH`

## So wird geschaltet

1. **Umgebung (Vorrang):** Vercel › Projekt › Settings › Environment Variables (Production): `FUNKTION_<NAME>=an` bzw. `=aus`,
   danach neu bereitstellen. `<NAME>` ist der Schalter in Großbuchstaben, z. B. `FUNKTION_LERNAPP_SYNC`.
2. **Einstellung:** sonst gilt der Wert aus der Verwaltung (Einstellung `funktionen`, Startklar-Cockpit
   `/verwaltung/startklar`, Recht `einstellung.bearbeiten`).
3. **Standard:** sonst Entwicklung und Vorschau **an**, Produktion **aus** – außer den Schaltern in `IN_PRODUKTION_AN`.

- **Ausgeschaltet heißt:** Seiten und Routen antworten mit 404, Links und Knöpfe verschwinden (ADR 0035).
- **Sperre:** Ein Schalter wirkt nur, wenn alle seine Voraussetzungen wirken. Das Cockpit meldet Schalter, die an sind, aber
  gesperrt bleiben.
- **Prüfpunkt nach jedem Schritt:** Das Startklar-Cockpit führt den Schalter ohne offenen Vorbehalt, und `pnpm startklar` ist
  grün.

## Schalter

| Schalter | Personendaten | Stand Produktion | Wirkt nur mit | Voraussetzung vor dem Einschalten | Wer gibt frei |
|---|---|---|---|---|---|
| `lernapp` | nein (Fortschritt nur auf dem Gerät) | **an** (L3-E12a) | – | erledigt: Nutzerentscheidung 21.10.2026; zum Abschalten `FUNKTION_LERNAPP=aus` | Nutzer bzw. Vorstand |
| `lernapp_ungeprueft` | nein | **an** (O-1, ADR 0041 Nr. 8) | `lernapp` | Einheiten nach automatischer Prüfung und KI-Gegenprüfung zeigen den Hinweis „noch nicht von Muttersprachlern geprüft“; abgelehnte Einträge und Einträge mit `religionsbezug` ohne zwei Freigaben bleiben unsichtbar | Vorstand (LM-11; Standard ja) |
| `lernapp_meldungen` | nein (anonym, nur Aufgabenschlüssel und Kategorie, ALTCHA) | **an** | `lernapp` | erledigt; Bearbeitung der Meldungen unter Verwaltung › Lern-App › Meldungen | Redaktion |
| `lernapp_sprechen` | nein (Aufnahme bleibt im Arbeitsspeicher des Geräts) | aus | `lernapp` | Gerätetest Sprechen und Audioformat auf iPhone, Android-Mittelklasse und Laptop (LM-07, MN-19); Whisper-Modell und Ort bestätigt (LM-27) | Technik nach Gerätetest |
| `lernapp_sync` | **ja** (Ereignisprotokoll auf dem Server, Art. 9 DSGVO) | aus | `lernapp`, `konten` | DSFA-Nachtrag Lern-App, Einwilligungstext `lernapp`, Datenschutzerklärung und Löschfristen (LM-08; Entwürfe in `web/docs/recht/entwuerfe/`); `konten` nach `web/docs/GO-LIVE.md` G4 | DSB / Recht, dann Vorstand |
| `lernapp_gruppen` | **ja** (Zuweisungen, Gruppenstand, Schreibabgaben verschlüsselt) | aus | `lernapp`, `lernplattform` | DSFA-Nachtrag (LM-08); `lernplattform` nach G4; Lehrkräfte geschult (LM-14, Handbuch `web/docs/handbuch/lernapp-lehrkraefte.md`) | DSB / Recht, Vorstand, Bildung |
| `lernapp_rangliste` | **ja** (Anzeigename und XP aus Sprachkursen, nur ab 16, mit eigener Zustimmung) | aus | `lernapp`, `lernapp_gruppen` | Entscheidung zur Bestenliste (LM-10) und DSFA-Nachtrag zu R-08 (LM-08). Für Konten unter 16 ist die Bestenliste im Code gesperrt, nicht über den Schalter | Vorstand, DSB |
| `lernapp_statistik` | grenzwertig (IP-Adresse) | aus | `lernapp` | Entscheidung der Datenschutzbeauftragten; nur Summen mit n ≥ 10, nur mit Opt-in (KERN 4.0 §6) | DSB |
| `push_lernapp` | **ja** (Push-Abonnement) | aus | `lernapp`, `push` | wie Web Push: Push-Themen und Drittland-Hinweis (MN-11, MN-17); neutraler Text ohne Serienbezug; für Kinder nur mit Einwilligung `push_kind` der Eltern | Vorstand, DSB |

## Weitere Freigaben ohne eigenen Schalter

Diese Punkte entscheiden, **was** in der eingeschalteten Lern-App sichtbar ist. Ohne sie ist nichts Ungeprüftes sichtbar; sie
sind keine Hindernisse für den Schalter `lernapp`.

| Punkt | Stand | Voraussetzung | Wer gibt frei |
|---|---|---|---|
| Wissenskurs (Lektionen) | unsichtbar, bis alle Bausteine einer Lektion zwei Freigaben zum aktuellen Hash haben | zwei Konten mit `religioese_pruefung` (MN-24), Prüfung zuerst Taharah und Salah (LM-03); Handbuch `web/docs/handbuch/lernapp-imam-hoca.md` | Imam und Hoca (je zwei verschiedene Personen, nie die verfassende) |
| Sprachkurs-Einträge mit `religionsbezug`, Liste erlaubter Alltagsformeln | gesperrt | zwei religiöse Freigaben (KERN 4.0 §2.3, LM-09) | Imam und Hoca |
| Koran-Arabisch: Bedeutungen und Wurzeln | nur Wortformen ohne Bedeutung | Bedeutungen von Menschen verfasst (MN-05, LM-13), Wurzeltabelle geprüft (LM-31); je zwei Freigaben | Hoca verfasst, zwei andere Personen mit `religioese_pruefung` geben frei |
| Muttersprachliche Stichprobe je Einheit | Hinweis „noch nicht geprüft“ (`lernapp_ungeprueft`) | Konten mit Rolle `sprachpruefung`, je Sprache ≥ 2 Personen (LM-01); Handbuch `web/docs/handbuch/lernapp-sprachpruefung.md` | Muttersprachliche Prüfende |
| Audio Deutsch | Sprachausgabe Thorsten freigegeben; Hörabnahme offen (LM-06) | Blob-Speicher `lernapp` verbunden, `LERNAPP_BLOB_BASIS` gesetzt (LM-15); Bündel hochgeladen | Technik; Hörabnahme Nutzer bzw. Vorstand |
| Audio Türkisch und Arabisch | „Audio folgt“ (Hörübungen werden übersprungen) | eigene Aufnahmen oder eigene Stimme mit bestandener Prüfkette (LM-24…LM-26) | Vorstand, Technik, Muttersprachler |
| Bildkarten | Motive ohne Freigabe blockieren den Import | Motivliste freigeben (LM-34) | Redaktion |
| Lizenz der Lerninhalte | CC BY-SA 4.0, Namensnennung auf `/quellen` und `/lern-app/[ui]/quellen` (L8-03) | Bestätigung (LM-12) | Vorstand / Recht |

## Reihenfolge beim Freischalten (Vorschlag)

1. `lernapp`, `lernapp_ungeprueft`, `lernapp_meldungen` – an (seit 21.10.2026).
2. `lernapp_sprechen` – nach dem Gerätetest (LM-07).
3. `KONTEN` und `LERNPLATTFORM` der Website (G4), dann `lernapp_sync` und `lernapp_gruppen` nach LM-08.
4. `lernapp_rangliste` – nur nach LM-10.
5. `push_lernapp` – nach `PUSH` (G4).
6. `lernapp_statistik` – nur nach Entscheidung der DSB.

**Abschalten** geht jederzeit: `FUNKTION_<NAME>=aus` setzen und neu bereitstellen. Was dann schon auf dem Server liegt,
regelt das Löschkonzept (`web/docs/recht/entwuerfe/loeschkonzept.md` §3.7, Entwurf bis LM-08). Der Fortschritt auf den Geräten
bleibt in jedem Fall erhalten.
