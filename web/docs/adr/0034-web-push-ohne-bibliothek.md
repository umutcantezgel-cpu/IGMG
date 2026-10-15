# ADR 0034 – Web Push ohne Bibliothek nach RFC 8291 und RFC 8292

- Status: angenommen (umgesetzt 13.10.2026) (Lauf Gemeinde-Plattform) · Bezug: Plan „Gemeinde-Plattform“ §2.7, §2.8 (Schalter `push`, `push_gebet`), §3.5, §3.6 (S-16), §6 (MN-17, MN-18, V4), §7 (Z-19)

## Kontext

- Push gibt es nur auf Wunsch der Person (Ziel des Plans). Themen: Gebet, Ankündigung, Chat und Elternkanal, Unterricht.
- Der Plan verlangt die Verschlüsselung nach RFC 8291 und VAPID nach RFC 8292, jeweils ohne Bibliothek.
- Kinder erhalten Push nur mit Einwilligung der Eltern („Push für das Kind“, ADR 0026).
- Die Nutzlast darf keinen Inhalt und keine Namen enthalten (S-16).
- Der Takt kommt vom lokalen Server (V4).

## Entscheidung

1. **Ohne Bibliothek.** Module: `src/lib/push/vapid.ts`, `src/lib/push/verschluesselung.ts`, `src/lib/push/senden.ts`, gebaut auf `node:crypto`. Getestet mit den RFC-Vektoren.
2. **VAPID-Schlüssel** entstehen über `pnpm geheimnisse:erzeugen`. Der Schalter `push` bleibt gesperrt, bis VAPID gesetzt ist (Cockpit-Sperre).
3. **Themen je Person wählbar:**
   - Gebetserinnerung, nur mit den Moscheezeiten für Wetzlar
   - Ankündigung
   - Chat und Elternkanal: höchstens eine Meldung je 10 Minuten; ein Kind nur mit Elternfreigabe
   - Unterricht
4. **Nutzlast** ohne Inhalt und ohne Namen. Die Texte kommen aus `push-texte/[sprache].json`. Der Handler liegt in `public/sw.js`.
5. **Versand** über `/api/wartung/takt` (`CRON_SECRET`). Der Takt ist idempotent über die Tabelle `push_versand` mit Einmal-Schlüssel. Angestoßen wird er vom lokalen Server. Vercel Pro nur nach Entscheidung der Menschen (V4, MN-18).
6. **Rückfall:** Mail-Zusammenfassung ohne Inhalt und In-Seite-`Notification`.
7. **Recht und Pflege:** Der Opt-in-Text nennt die Push-Dienste. Ein Hinweis für iOS verlangt, die Seite erst zum Home-Bildschirm hinzuzufügen. Inaktive Abos werden nach 12 Monaten gelöscht.
8. **Daten:** `push_abo` (Endpunkt verschlüsselt, Themen, Einwilligungsversion) und `push_versand`.

## Alternativen

- Push-Bibliothek aus npm: verworfen. Der Plan verlangt „ohne Bibliothek“ und setzt auf `node:crypto`.
- Nur Mail: nicht als Hauptweg. Mail ist der Rückfall.
- Inhalte in der Nutzlast: verworfen (S-16).
- Takt über den Vercel-Pro-Cron: nur als Option (V4). Der Standard ist lokal.
- Push für alle ohne Opt-in: verworfen (Ziel des Plans).

## Folgen

- Die Schalter `push` und `push_gebet` (ADR 0035) sind in der Produktion aus.
- Die echte Zustellung ist eine Umgebungsausnahme der Abnahme. Ersatz: eine Attrappe im E2E-Test (Plan §6).
- Tests: RFC-8291-Vektoren, Idempotenz des Takts, Nutzlast ohne Inhalt, Chat-Rate.
- Datenschutz: Der Opt-in-Text und die Datenschutzerklärung nennen die Push-Dienste (Plan §5).

## Umsetzung (13.10.2026)

- `src/lib/push/{verschluesselung,vapid,senden,abo}.ts`; RFC-8291-Anhang-A-Vektoren in `tests/unit/push.test.ts` (alle Zwischenwerte gleich).
- Abweichung: Es gibt nur `VAPID_PRIVAT` (geheim, erzeugbar) und `VAPID_KONTAKT`; der öffentliche Schlüssel wird aus dem
  privaten berechnet. So kann kein Paar auseinanderlaufen.
- Abo-API `/api/push/abo` (gleiche Herkunft, Ratenbegrenzung, nur bekannte Push-Dienste), Takt `/api/wartung/takt`
  (idempotent über `push_versand`), Wortlaut im Service Worker aus `/api/push/texte/<sprache>`.
- Thema „Ankündigung“ (15.10.2026, Nacharbeit Stufe C, Z-01): `src/lib/push/ankuendigung.ts`. Beim ersten Veröffentlichen
  einer sichtbaren Ankündigung (`after()` in `src/server/actions/ankuendigungen.ts`), bei späterem Beginn im Minutentakt
  (Nachholfenster 2 h); nur mit Recht `push.ankuendigung` der Person, die zuletzt gespeichert hat, Schalter `push` und
  VAPID; Kinder nur mit „Push für das Kind“; Nutzlast `{ art: 'ankuendigung', pfad: '/nachrichten' }` in der Sprache des
  Abos; idempotent über `push_versand` (`ankuendigung|<abo>|<ankündigung>`). Test `tests/integration/push-ankuendigung.test.ts`.
