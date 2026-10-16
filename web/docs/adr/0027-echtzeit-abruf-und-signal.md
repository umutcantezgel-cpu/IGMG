# ADR 0027 – Echtzeit: adaptiver Abruf und Centrifugo-Signal auf dem lokalen Server

- Status: angenommen (umgesetzt 13.10.2026) (Lauf Gemeinde-Plattform) · Bezug: Plan „Gemeinde-Plattform“ §2.6, §2.8 (Schalter `echtzeit`), §2.9, §6 (E6, O-C02), §7 (Risiken) · Pflicht: Abruf; Kür: Signal

## Kontext

- Der moderierte Gruppen- und Elternkanal braucht eine zeitnahe Anzeige neuer Nachrichten.
- Eine Dauerverbindung für alle Nutzer ist teuer und schwer zu betreiben. Ein Abruf in festem Takt verursacht Kosten (Risiko „Kosten durch Chat-Abruf“).
- Die Moschee stellt einen lokalen Server als Helfer neben Vercel bereit (Entscheidung des Nutzers). Der Betrieb darf nicht von ihm abhängen (Risiko „Lokaler Server fällt aus“).
- Chat-Inhalte sind verschlüsselt und dürfen nicht in Push, Mail oder Logs erscheinen (S-16). Der Server soll sie nie sehen.

## Entscheidung

1. **Pflicht: adaptiver Abruf.** `GET /api/mein/chat/[kanal]?nach=<id>`. Nach Aktivität wird im Takt von 4 s abgefragt, danach von 15 s bzw. 30 s. Pause bei verborgenem Tab und außerhalb der Öffnungszeiten (S-06: 08 bis 20 Uhr; außerhalb nur lesen).
2. **Kür K-A: Signal über Centrifugo** auf dem lokalen Server, hinter Caddy (Profil `echtzeit` im Kit, ADR 0036).
   - Next.js meldet nur „Kanal hat Neues“. Inhalte berühren den Server nie.
   - Ein JWT je Kanal, gültig 10 Minuten.
   - `wss://` nur in der CSP von Mein Bereich.
3. **Rückfall:** Fällt der Server aus, läuft der Abruf automatisch weiter.
4. **Schalter:** `echtzeit` (ADR 0035) steuert das Signal. Annahme: Der Abruf bleibt davon unabhängig und ist Grundlage.

## Alternativen

- Dauerabruf in festem Takt: verworfen (Kosten; der Plan verlangt adaptiven Takt).
- Inhalte über Centrifugo ausliefern: verworfen. Der Server bekommt nur das Signal (S-16, Datenschutz).
- Gehosteter Echtzeit-Dienst eines Drittanbieters: verworfen („ohne Drittanbieter“).
- Echtzeit als Pflicht: verworfen. Sie ist Kür, damit der lokale Server keine Voraussetzung wird.
- Centrifugo ohne öffentliche Adresse: im Plan nur als Umgebungsausnahme für die Abnahme vorgesehen. Für den Betrieb ist DynDNS nötig (MN-12).

## Folgen

- Kosten: Takt und Öffnungszeiten begrenzen die Anfragen. Die Rate-Grenze liegt bei 10 pro Minute und 200 pro Tag (S-13).
- Betrieb: Der lokale Server braucht Hardware, Installation und DynDNS (MN-12, 3 bis 4 h). Ohne ihn zeigt das Cockpit Gelb.
- Tests: Chat-Cursor (Abruf mit `nach=`), Pausen bei verborgenem Tab und außerhalb der Öffnungszeiten, Rückfall bei ausgefallenem Signal. E2E mit zwei Browser-Kontexten (Plan §6).
- Umgebungsausnahme: Centrifugo ohne öffentliche Adresse wird in der Vorschau nicht geprüft.

## Umsetzung (13.10.2026)

- Pflichtweg Abruf: `GET /api/mein/chat/<kanal>?nach=<id>` (`src/lib/chat/dienst.ts`).
- Signal: `src/lib/echtzeit/{konfig,centrifugo}.ts`, Tokens über `GET /api/mein/echtzeit?kanal=<id>`, Publish nach dem
  Senden (`after()`), `wss://` nur in der CSP der Konto-Seiten (`src/proxy.ts`). Server: `betrieb/lokal` Profil `echtzeit`.
- Server-Kit (15.10.2026, Nacharbeit Stufe C, Z-20): `betrieb/lokal/echtzeit/centrifugo.json` trägt den Namensraum `chat`
  (Kanäle `chat:<kanal-id>` wie `kanalName`); Abonnieren nur mit Abo-Token, alle `allow_*` aus, ohne Anwesenheit und
  Verlauf. Vorher wies Centrifugo jedes Abo mit „102 unknown channel“ ab. Prüfung: `tests/unit/echtzeit.test.ts` (Datei)
  und `betrieb/lokal/echtzeit/pruefen.mjs` (laufender Centrifugo; am 15.10. gegen v6.5.1 lokal 8/8 bestanden).
- Hinweis „Neues“ in Mein Bereich (15.10.2026, Nacharbeit 2, F-38, ADR 0034 Nr. 6): derselbe Abruf-Gedanke für die
  Übersicht (`src/lib/echtzeit/takt.ts`: `chatAbstand` unverändert, `uebersichtAbstand` 30/60 s) über
  `GET /api/mein/neues`; das Signal abonniert dort alle lesbaren Kanäle über eine Verbindung (`src/lib/echtzeit/signal.ts`,
  auch vom Chat genutzt). Fällt das Signal aus, fragt der Browser neue Tokens höchstens alle 5 Minuten an.
- Entfernte Nachrichten (16.10.2026, Nacharbeit 2, P4): Der Abruf trägt zusätzlich `ab=<erste angezeigte ID>` und liefert
  `entfernt` – die IDs der seither entfernten Nachrichten bis `nach`. Vorher erreichte das Entfernen (S-09) offene
  Fenster nicht, weil der Abruf nur Neues liefert; gefunden im E2E-Lauf mit zwei Browsern (`tests/e2e/chat.spec.ts`),
  Prüfung `tests/integration/chat.test.ts` („S-09: Entfernen hinterlässt Platzhalter“).
