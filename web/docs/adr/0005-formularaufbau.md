# ADR 0005 – Formularaufbau (öffentliche Formulare und Eingänge)

- Status: angenommen · 2026-10-11 · P1 · Kern 1.0 · Bezug: K-07, G-07, G-08, K-11, Z-05, Z-07

## Ziel

Fünf öffentliche Formulare (Kontakt, Veranstaltungsanmeldung, Schüler-Voranmeldung, Mitglied werden, Webseite für Moscheen) mit einem Zod-Schema für Client und Server, Spam-Schutz ohne Dritte, Ratenbegrenzung, Einwilligungsprotokoll, Bestätigungs- und Benachrichtigungsmail – und Eingängen, die nur berechtigte Rollen sehen, exportieren und echt löschen können. Kinderdaten (Voranmeldung) sind besonders schutzwürdig.

## Wege

1. **Eine Tabelle je Formular** mit typisierten Spalten.
2. **Eine Tabelle `eingang`** mit Art, Status, Metadaten und den Formulardaten als **verschlüsseltem** JSON (Zod-typisiert), Einwilligungen in eigener Tabelle.
3. **Formulardaten nur per E-Mail** weiterleiten, nichts speichern.

## Bewertung

Weg 3 verfehlt Status, Export, Löschfristen (G-07, Z-07). Weg 1 erzeugt fünf fast gleiche Module, fünf Exportpfade, fünf Löschpfade. **Weg 2 gewählt:** ein Eingangsmodul, ein Export, eine Löschlogik; Verschlüsselung schützt vor Datenbank-Abzügen und Backups.

## Festlegungen

- **Schemas:** `src/lib/validierung/<formular>.ts` exportiert `schema` (Zod 4) und Typ; Fehlertexte als **Schlüssel** in `messages` (Client und Server übersetzen gleich). Nur nötige Felder (G-07); Felder aus den Seitenblättern, Pflicht wie im Design.
- **Ablauf:** Client-Komponente mit `useActionState(action, startzustand)`; Mehrstufigkeit (FormWizard) nur clientseitig, ein `<form>` für alle Schritte; Schrittwechsel prüft die Felder des Schritts mit demselben Schema (`schema.pick`); die Server Action prüft immer das ganze Schema. Fehler: Text am Feld (`aria-describedby`, `aria-invalid`), Zusammenfassung oben, Fokus auf Zusammenfassung bzw. Erfolgsmeldung (K-07, K-11).
- **Server Action (Reihenfolge fest):** 1 Ratenbegrenzung → 2 Honigtopf (`website`-Feld leer) → 3 ALTCHA prüfen + Lösung als verbraucht speichern → 4 Zod → 5 Speichern (Transaktion: `eingang` + `einwilligung`) → 6 Mails in Warteschlange → 7 Rückgabe `{ status: 'erfolg' }` ohne Personendaten. Fehlerantworten nennen keine Interna.
- **Tabellen:** `eingang(id uuid, art enum('kontakt','veranstaltungsanmeldung','voranmeldung','mitgliedsantrag','moschee_anfrage'), status enum('neu','in_bearbeitung','erledigt','abgelehnt'), sprache, bezug_id null (z. B. Veranstaltung), daten_verschluesselt bytea, schluessel_id smallint, erstellt_am, erledigt_am, loeschen_ab)`; `einwilligung(id, eingang_id → cascade, text_schluessel, text_version (SHA-256 des angezeigten Textes), sprache, erteilt_am)`; `eingang_notiz` für interne Vermerke.
- **Verschlüsselung:** AES-256-GCM in der Anwendung (`node:crypto`), Schlüssel aus `EINGANG_SCHLUESSEL` (32 Byte, Base64), Schlüssel-ID für Rotation. Entschlüsselt wird nur in Verwaltungs-Queries nach Rechteprüfung; jeder Lesezugriff schreibt Audit (G-07).
- **Spam:** ALTCHA selbst gehostet: Route `GET /api/altcha` (nie gecacht) liefert Challenge mit `expiresAt` (10 min); Widget `altcha` als Web Component in der Formularkomponente; `verbrauchte_challenge(signatur_hash, laeuft_ab)` verhindert Wiederverwendung.
- **Ratenbegrenzung:** Tabelle `ratenbegrenzung(schluessel, fenster_start, zaehler)`; Schlüssel = HMAC-SHA-256(IP + Formular, `RATE_GEHEIMNIS`) – die IP wird nie im Klartext gespeichert; Standard 5 Einsendungen je 10 min und IP und Formular, einstellbar.
- **Mails:** Ausgangstabelle `mail_ausgang` (Empfänger, Vorlage, Daten verschlüsselt, Versuche) + Versand nach Commit; Bestätigung an Absender in seiner Sprache, Benachrichtigung an die zuständige Rolle auf Deutsch, **ohne** Formulardaten im Mailtext (nur „Neuer Eingang – bitte in der Verwaltung ansehen“ mit Link), damit keine Personendaten per Mail kreisen.
- **Löschfristen:** je Art in `einstellung` (Tage nach `erledigt_am` bzw. nach Veranstaltung); Route `POST /api/wartung/loeschfristen` mit `Authorization: Bearer <WARTUNG_TOKEN>` löscht echt (inkl. Einwilligungen, Notizen, Mail-Ausgang) und schreibt Audit-Einträge ohne Personendaten.
- **Export:** CSV (UTF-8 mit BOM) und JSON je Eingang oder gefiltert; nur berechtigte Rollen; Audit.

## Umkehrprobe

Falsch, wenn Fachrollen in den Eingängen frei suchen müssen (z. B. nach Namen) – verschlüsselte Daten sind nicht per SQL durchsuchbar. Dann: Suche nach Entschlüsselung in der Anwendung über die (kleine) Menge offener Eingänge; bei sehr großen Mengen Blind-Index auf ausgewählte Felder.

## Folgen zweiter Ordnung

- Schlüsselverlust = Datenverlust: BETRIEB.md beschreibt Sicherung des Schlüssels getrennt vom Datenbank-Backup.
- E2E-Tests lesen Mails im Mail-Fänger (ADR 0011), nicht in der DB.
- Die Ticket-Meldung („Neue Meldung“ aus dem Kontomenü) ist **intern** (Verwaltung, angemeldet) und kein öffentlicher Eingang.

## Nachtrag 2026-10-11 (B02/B04, E-028)

- **Ansicht vom Server statt Client-Formular:** Felder, Fehler-Zusammenfassung und Erfolgsmeldung sind Server-Komponenten. Die öffentliche Action gibt `FormularAntwort { status, fehler?, feldFehler?, ansicht }` zurück; `ansicht` ist das auf dem Server gerenderte Formular mit Werten und Fehlern bzw. die Erfolgsmeldung. Im Browser bleibt nur `FormularInsel` (useActionState, Fokus auf `[data-fokus]`), `SendenKnopf` (useFormStatus) und `AltchaFeld`. Grund: K-12 – die Client-Variante kostete auf der Veranstaltungsdetailseite 5,1 kB und riss das Budget (182,5 kB), die Insel kostet 1,2 kB (178,7 kB). Personendaten gehen nur als Feldwerte in der Ansicht zurück, nicht als eigene Daten.
- **Zod nicht im Browser** (≈ 15 kB): Schrittprüfung im FormWizard (B01) über native Feldprüfung des sichtbaren Schritts, die Action prüft immer das ganze Schema (ersetzt „`schema.pick` im Client“).
- **ALTCHA CSP-fest:** `altcha/external` + `altcha/altcha.css` werden erst bei der ersten Interaktion nachgeladen; der PBKDF2-Worker liegt unter `/altcha/pbkdf2.js` (eigene Herkunft, `worker-src 'self'`; Kopie mit `pnpm altcha:kopieren`, Unit-Test prüft Gleichstand). Das Standardpaket startet Worker aus `blob:` und scheitert an der CSP (ADR 0012).
- **ALTCHA-Lösungen sind einmalig:** Nach jeder Fehlerantwort rendert die Action `AltchaFeld` mit neuem `key` – das Widget löst sofort eine neue Aufgabe, ein zweiter Versuch braucht kein Neuladen.
