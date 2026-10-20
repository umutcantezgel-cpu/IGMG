# S-L1 – Sicherheitsprüfung der Lern-App (Etappe L1)

| | |
|---|---|
| Datum | 20.10.2026 |
| Prüfer | frischer Sicherheits-Agent (Prüfstufe S, PLAN §14, KERN 4.0 §5–§6) |
| Gegenstand | Zweig `worktree-agent-a212ace6efc9226bb` (Arbeitsbaum `.claude/worktrees/agent-a212ace6efc9226bb`), Stand `68aa1c6` |
| Vergleich | `git diff claude/trusting-lovelace-6nfolz...HEAD` (Merge-Basis `c2dc80c`, 35 Commits, 238 Dateien) |
| Vorgehen | Verfahren des Skills `security-review` (der Skill selbst ließ sich nicht laden: `origin/HEAD` fehlt im Arbeitsbaum): Diff lesen, je Prüfbereich die Datenflüsse von Eingang bis Speicher bzw. Antwort verfolgen, nur ausnutzbare bzw. regelverletzende Befunde mit Pfad. Proben nur im Arbeitsspeicher; am Code nichts geändert. |

## Ergebnis

**Keine kritischen, keine hohen Befunde.** 3 × mittel, 6 × niedrig, 6 Hinweise. Das Torkriterium „S-L1 ohne hoch/kritisch“
(PLAN §14, Tor L1) ist erfüllt. **Freigabe mit Auflagen:**

- M-1 und M-2 vor dem Einschalten von `lernapp_sync` (Produktion: aus; einen Weg zum Erteilen der Einwilligung `lernapp`
  gibt es noch nicht, H-1) beheben.
- M-3 vor dem ersten Import echter Inhalte (L3-07) beheben; passt zu L3-02 („Prüfer, Wächter-Tests“).
- N-1 bis N-6 bei Gelegenheit, spätestens bis S-L2 (L5).

| Nr. | Schwere | Kurzfassung | Ort | Stand |
|---|---|---|---|---|
| M-1 | mittel | Abgleich ohne Kontobindung auf dem Server: Lernstände zweier Konten vermischen sich auf geteilten Geräten | `web/src/lib/lernapp/oberflaeche/abgleich.ts:48`, `web/src/lib/lernapp/lokal/sync.ts:161-166, 221-272`, `web/src/lib/lernapp/sync/protokoll.ts:43-48` | behoben in `8d60fe8, 6f62263` |
| M-2 | mittel | Unbegrenztes Wachstum je Konto und vollständiges Nachspielen je Anfrage (Speicher-, Rechen- und Kostenlast) | `web/src/lib/lernapp/sync/server.ts:232-249, 292-330, 401-436` | behoben in `8d60fe8` |
| M-3 | mittel | Religionswächter umgehbar; Formel-Lexikon (KERN §3 a) fehlt; `religionsbezug` kommt allein aus der Datei | `_gemeinde/werkzeuge/religion-pruefung.mjs:53, 185-205`, `web/src/lib/lernapp/inhalt/import.ts:204, 251, 460, 515` | behoben in `18726ba` |
| N-1 | niedrig | `/lern-app/anmelden` (und andere Seitennamen als „Oberflächensprache“) erreicht über den internen Rewrite echte Seiten, die Anmeldung ohne Nonce-CSP | `web/src/proxy.ts:37, 58` | behoben in `d31a4ce` |
| N-2 | niedrig | Randpfade ohne jede CSP (`/(de\|tr\|en)/lern-app/…` und `…/anmelden/…` mit Punkt im Pfad) | `web/next.config.ts:17`, `web/src/lib/sicherheit/header.ts:120`, `web/src/proxy.ts:112` | behoben in `d31a4ce` |
| N-3 | niedrig | Jahres-Kopien im CDN überdauern „Schalter aus“ und das Zurückziehen bei Audio | `…/pakete/[kurs]/[einheit]/[hash]/route.ts:31`, `…/audio/[...pfad]/route.ts:39` | behoben in `324cfc4` |
| N-4 | niedrig | 206-Teilantworten tragen den Jahres-Kopf für das CDN | `web/src/app/lern-app/audio/[...pfad]/route.ts:30-42` | behoben in `324cfc4` |
| N-5 | niedrig | Service Worker folgt `/_next/static/../`-Verweisen aus HTML und kann so beliebige eigene GET-Antworten vorhalten | `web/public/lern-app/sw.js:82-90, 110` | behoben in `324cfc4` |
| N-6 | niedrig | Rolle `sprachpruefung` erhält die Grundrechte der Verwaltung (Tickets, Postfach, Mediathek) | `web/src/lib/rechte/matrix.ts:283` | behoben in `324cfc4` |

---

## M-1 (mittel) – Abgleich ohne Kontobindung auf dem Server

**Stand (20.10.2026):** behoben in `8d60fe8` (Kontobindung: Pflichtfeld `konto`, 409 `konto` ohne Schreiben, Planer ruht, Bindungsfrage in den Einstellungen; Sitzungsprüfung je Seitenaufruf vor dem ersten Abgleich) und `6f62263` (nach einem Nein fragt die nächste Handlung erneut). Belege: Integration `lernapp-sync.test.ts` (409 ohne Zeile, geteiltes Gerät mit Kontowechsel, Planer nach 409), Unit `abgleich-oberflaeche.test.ts`, E2E `zwei-geraete.spec.ts` grün.

**Ort:** `web/src/lib/lernapp/oberflaeche/abgleich.ts:41-50` (`beimOeffnen` kehrt ohne Sitzungsprüfung zurück, wenn der
letzte Abgleich jünger als 60 s ist), `web/src/lib/lernapp/lokal/sync.ts:221-272` (`nachHandlung` gleicht ab, ohne das
Konto der Sitzung zu prüfen; `ruht` wird nur in `beimOeffnen` gesetzt), `web/src/lib/lernapp/lokal/sync.ts:160-167` (anderes
`angelegt` → ganzes Protokoll als offen markieren und neu senden), `web/src/lib/lernapp/sync/protokoll.ts:43-48` (die Anfrage
nennt das gebundene Konto nicht), `web/src/app/api/lernapp/sync/route.ts:61-78` (Server kennt nur die Sitzung).

**Nachweis (Ablauf aus dem Code):**
1. Profil P auf einem Familien-Tablet ist an Konto A (Elternteil) gebunden; letzter Abgleich zur Zeit t0.
2. A meldet sich in der Lern-App ab (`kontoAbmelden` mit Rücksprung in den Scope), Kind B meldet sich im Scope an
   (`kinderAnmelden` → geprüfter Rücksprung in die Lern-App) und öffnet vor t0 + 60 s eine Übungsseite.
3. `beimOeffnen` (UI) liest `zuletzt` < 60 s und kehrt zurück; der Planer dieser Seite ruht nicht.
4. Nach der Lektion: `nachHandlung` → `synchronisiere(P)` → `POST /api/lernapp/sync` mit der Sitzung von B. Der Server prüft
   Ursprung, Sitzung, Einwilligung und Bremse von B – nicht, ob P zu B gehört.
5. Die Antwort trägt `angelegt` des Lernstands von B; es weicht vom gespeicherten Wert (A) ab → `markiereAlleOffen(P)` →
   die nächste Runde sendet **das ganze Protokoll von P (Lernweg von A)** in das Konto B; Ereignisse von B landen in P.
   Beim nächsten Abgleich als A ist `angelegt` wieder anders → alles (jetzt auch die Ereignisse von B) geht an A.
6. Derselbe Ablauf ohne Zeitfenster, wenn das Konto in einem zweiten Tab wechselt, während eine Übung offen ist.

**Auswirkung:** Lernstände (ab L6 mit Wissenskurs, Art. 9 DSGVO) wechseln dauerhaft zwischen Konten, auch in Kinderkonten;
`vermerkeZuweisungen` vermerkt Zuweisungen für das falsche Konto als erledigt. Kein Angreifer nötig; tritt bei geteilten
Geräten im normalen Gebrauch auf.

**Behebung:**
- `SyncAnfrageSchema` um Pflichtfeld `konto` (gebundene `benutzerId` des Profils) erweitern; die Route vergleicht mit der
  Sitzung und antwortet bei Abweichung `409 { fehler: 'konto' }`, ohne zu schreiben (neuer Wert in `SYNC_FEHLER`).
- Client: bei `konto` ruhen und in den Einstellungen die Bindungsfrage zeigen (wie `anderesKonto`).
- Je Seitenaufruf vor dem ersten `nachHandlung` die Sitzung prüfen (die 60-s-Sperre nur für den Abgleich selbst, nicht für
  die Sitzungsprüfung).
- Integrationstest: Profil an A, Sitzung B → 409, keine Zeile geschrieben; Client ruht.

## M-2 (mittel) – Unbegrenztes Wachstum je Konto, vollständiges Nachspielen je Anfrage

**Stand (20.10.2026):** behoben in `8d60fe8`: `GRENZEN` je Konto (200.000 Ereignisse, 20.000 je 24 h, 50 Geräte → 429 `grenze` ohne Schreiben), Folgenummer höchstens 50.000 über der höchsten des Geräts (sonst `abgelehnt`), `statement_timeout` 15 s; Lerntage nur aus den Ereignissen der berührten Tage, Zuweisungen nur aus den Lektionen der offenen Zuweisungen. Belege: Integration `lernapp-sync.test.ts` (Geräte-, Gesamt- und 24-h-Grenze, Folgenummer, gezielte = volle Ableitung). Ohne neuen Index (Migration bleibt dem Orchestrator); die Abfragen laufen über `(benutzer_id, id)` und sind durch die Gesamtgrenze beschränkt. Zählung im Cockpit: offen (L3-06), bis dahin `console.warn` ohne Personenbezug.

**Ort:** `web/src/lib/lernapp/sync/server.ts:232-249` (`erneuereTage` lädt alle Lektions-, XP-, Ziel- und Pause-Ereignisse
des Kontos), `:171-183` (`erneuereKarten` lädt alle Bewertungen der betroffenen Karten), `:292-330` (Einfügen ohne
Obergrenze je Konto), `:423-436` (`vermerkeZuweisungen` lädt alle Lektions-Ereignisse), `protokoll.ts:30-36`,
`ereignisse/typen.ts:126-131` (`geraet` frei wählbare UUID, `seq` bis 2^31 − 1).

**Nachweis (Rechnung aus den Grenzen):** ≤ 500 Ereignisse je Anfrage × 30 Anfragen je Minute = 15.000 neue Zeilen je Minute
und Konto, ≈ 21 Mio. je Tag. Eindeutige Schlüssel sind unbegrenzt verfügbar (beliebige Geräte-UUIDs, beliebige `seq`). Es gibt
keine Obergrenze je Konto, Tag oder Gerät. Jede Anfrage mit neuen Ereignissen liest danach alle Ereignisse der vier Arten des
Kontos und leitet neu ab – unter der Sperre je Konto und in einer Transaktion; die Laufzeit wächst linear, bis Funktionen in
die Zeitgrenze laufen und die Datenbank (Speicher, CPU, Kosten) belastet ist. Eine Bewertung derselben Karte in jeder Anfrage
lässt `erneuereKarten` ebenso wachsen.

**Voraussetzung:** angemeldetes Konto mit Rolle, Einwilligung `lernapp`, Schalter `lernapp_sync`. Heute in der Produktion
nicht ausnutzbar (Schalter aus, Einwilligung nicht erteilbar) – latent.

**Behebung:**
- Obergrenzen je Konto: neue Ereignisse je Lerntag (z. B. ≤ 5.000), Ereignisse gesamt, Geräte je Konto (z. B. ≤ 20), `seq`
  nur bis „höchste gespeicherte `seq` des Geräts + Abstand“; Überschreitung → `429`/`413`, im Cockpit gezählt.
- `erneuereTage` nur über die betroffenen Tage abfragen (Index `(benutzer_id, art, tag)`), Ziele bzw. Pausen gezielt;
  `vermerkeZuweisungen` nur für die Lektionen der offenen Zuweisungen abfragen.
- `SET LOCAL statement_timeout` in der Abgleich-Transaktion.
- Integrationstest: Grenze greift, andere Konten bleiben unberührt.

## M-3 (mittel) – Religionswächter umgehbar, Formel-Lexikon fehlt

**Stand (20.10.2026):** behoben in `18726ba`: Kern `web/src/lib/lernapp/waechter/kern.mjs` für Werkzeug, Import und `lernapp:pruefen` (auch im Vercel-Bau); Normalisierung ohne Format- und kombinierende Zeichen (U+00AD, U+034F u. a.), U+2028/2029 und Homoglyphen; aufgelöst werden Codepunkte, HTML-Entitäten, `fromCharCode`/`fromCodePoint` und Prozent-Kodierung; Wissenskurs, Koran-Pfad und Textdateien der Werkstatt auch verschleiert Rot; 4-Gramme über Zeilen und Felder; Formel-Lexikon (arabisch nur als Verweise in den Tanzil-Text, deutsch/türkisch als Startliste) „fail closed“ im Import und in `lernapp:pruefen`, in `ar.json` immer Rot; Übersetzungen erben `religionsbezug`. Belege: Unit `religion-waechter.test.ts` (jede Umgehung der Tabelle oben), `religion-inhalt.test.ts` (Kennzeichen, Import-Abbruch). Offen: Bestätigung und Ergänzung des Lexikons durch die religiöse Prüfung bzw. Redaktion (LM-09); Aufruf aus den Eingaben der Verwaltung, sobald es sie gibt (L3-06).

**Ort:** `_gemeinde/werkzeuge/religion-pruefung.mjs:53` (Liste unsichtbarer Zeichen), `:185-205` (`pruefeDatei`: zeilenweise,
in Nie-Pfaden nur rohe Schrift rot), `web/src/lib/lernapp/inhalt/import.ts:204, 251, 460, 515` (`religionsbezug ?? false`
aus der Datei), `web/scripts/lernapp/pruefen.ts` (kein Wächter), `web/src/lib/lernapp/freigabe.ts` `sprachSichtbarkeit` und
`web/src/lib/lernapp/paket/bauen.ts` `zielInhalt` (vertrauen dem Kennzeichen; ohne Kennzeichen keine religiöse Freigabe nötig
und Sprachausgabe erlaubt).

**Nachweis (Probe im Arbeitsspeicher mit den exportierten Funktionen des Wächters; Skript
`/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/sl1/waechter-probe.mjs`; Ausgabe nur Zahlen,
keine Datei im Repository geschrieben, kein Text ausgegeben):**

| Probe | Befunde des Wächters | erwartet |
|---|---|---|
| Codepunkt-Folge (Backslash-u) eines neutralen Alltagsworts in `web/inhalte/lernapp/islam/probe.json` | 0 | rot (KERN §2.2 Nr. 4: keine arabische Schrift im Wissenskurs; JSON macht daraus beim Lesen Schrift) |
| dieselbe Folge in `_lernapp/probe.md` | 0 | rot (KERN §3) |
| vier Wörter aus `web/daten/tanzil`, unverändert, eine Zeile, Sprachkurs-Pfad | 1 | rot – richtig |
| dieselben vier Wörter auf zwei Zeilen | 0 | rot |
| dieselben vier Wörter mit U+00AD (weicher Trennstrich) im Wort | 0 | rot |
| dieselben vier Wörter mit U+034F im Wort | 0 | rot |
| dieselben vier Wörter als HTML-Entitäten in einer Komponente | 0 | rot |

Dazu, aus dem Code:
- Die Prüfung (a) aus KERN §3 – Formel-Lexikon mit Pflicht `religionsbezug: true` – ist nicht gebaut. Formeln und Begriffe
  unter vier Wörtern sowie deutsche und türkische Religionsbegriffe prüft nichts; das Kennzeichen setzt allein die
  Inhaltsdatei. Ein nicht gekennzeichneter Eintrag wird ohne die zwei religiösen Freigaben ausgeliefert (KERN §2.3) und
  bekommt Sprachausgabe (KERN §4).
- Der Wächter läuft als Tor und im Unit-Test, nicht im Import (`lernapp:import` läuft im Vercel-Bau) und nicht für spätere
  Eingaben der Verwaltung (L3-06).
- Bei Dialogen und Lesetexten (L2/L4) verteilt sich eine Wortfolge auf mehrere Zeilen bzw. Felder; der zeilenweise Abgleich
  sieht sie nicht.

**Auswirkung:** Die Schranke gegen eingeschleusten religiösen Wortlaut (KI-Regel 2) greift nur bei unverändertem
Vier-Wort-Wortlaut in einer Zeile. Heute gibt es nur den neutralen Testkurs, also keinen ausgelieferten Verstoß; das Risiko
entsteht mit dem KI-Entwurf der Inhalte ab L3.

**Behebung:**
1. In Nie-Pfaden auch aufgelöste Codepunkt-Folgen als „arabische Schrift“ rot werten; Inhalts-JSON zusätzlich geparst prüfen
   (jede Zeichenkette, nach `JSON.parse`).
2. Normalisierung: alle Format- und kombinierenden Zeichen außerhalb des arabischen Blocks entfernen (u. a. U+00AD, U+034F,
   U+180E, U+2028/U+2029), Homoglyphen abbilden (u. a. U+06C1, U+06BE, U+06D5); HTML-Entitäten auflösen; in Code außerhalb der
   Erlaubnisse Zahlenfolgen im arabischen Bereich (`fromCharCode`/`fromCodePoint`) melden.
3. Vier-Wort-Abgleich zusätzlich über aufeinanderfolgende Textfelder einer Datei (Dialogzeilen, Sätze einer Lektion).
4. Formel-Lexikon (a) als Prüfer in `lernapp:pruefen` und im Import, „fail closed“: Treffer ohne `religionsbezug: true` bricht
   ab. Arabische Einträge nur gepinnt nach KERN §3; deutsche und türkische Begriffe liefert die Redaktion.
5. `pruefeDatei` bzw. der Lexikon-Prüfer im Import aufrufen (Abbruch statt Tor allein); dieselbe Prüfung für Eingaben der
   Verwaltung (L3-06).
6. Unit-Tests für jede Umgehung oben (Testdaten nur als Codepunkt-Escapes bzw. aus `web/daten` im Speicher).

## N-1 (niedrig) – Interner Rewrite trifft echte Seiten, Anmeldung ohne Nonce-CSP

**Stand (20.10.2026):** behoben in `d31a4ce`: unbekanntes erstes Segment immer auf `/lern-app/de/_` (404 der Fangroute, `noindex`, `no-store`, CSP der Lern-App). Belege: Unit `proxy.test.ts` (u. a. `/lern-app/anmelden`, `/lern-app/einstellungen`, `/lern-app/tr-aus-de`), E2E `regression.spec.ts` grün.

**Ort:** `web/src/proxy.ts:37` (`intern` → `/lern-app/de/<ui><rest>`), `:58` (Rewrite ohne Kopfzeilen),
`web/src/lib/sicherheit/header.ts:120`.

**Nachweis:** `lernAppWeg('/lern-app/anmelden')` ergibt `ui = 'anmelden'` → `{ art: 'intern', ziel: '/lern-app/de/anmelden' }`.
Der Rewrite rendert die Anmeldeseite; der Proxy setzt weder Nonce-CSP noch `X-Robots-Tag`, und die Header-Regel in
`next.config.ts` (gegen den Pfad der Anfrage geprüft) liefert für `/lern-app/anmelden` die CSP der Lern-App mit
`'unsafe-inline'` statt Nonce und `'strict-dynamic'`. Ebenso liefern `/lern-app/einstellungen`, `/lern-app/fortschritt`,
`/lern-app/tr-aus-de` usw. Status 200 unter nicht kanonischer Adresse statt der angenommenen 404 der Fangroute (Kommentar
`proxy.ts:16-17`; `tests/unit/lernapp/proxy.test.ts:51-60` prüft nur unbekannte Segmente).

**Auswirkung:** Die Anmeldeseite ist mit schwächerer CSP erreichbar (Verteidigung in der Tiefe; kein Injektionspunkt
gefunden). Die Seite selbst prüft `lernapp` und `konten`; der Service Worker hält sie nicht vor (`istSeitePfad` trifft nicht).

**Behebung:** Für unbekannte Oberflächensprachen immer auf den festen Platzhalter `/lern-app/de/_` umschreiben (nicht auf
`/lern-app/de/<ui><rest>`), mit `X-Robots-Tag: noindex`; Tests für `/lern-app/anmelden`, `/lern-app/einstellungen`,
`/lern-app/tr-aus-de`.

## N-2 (niedrig) – Randpfade ohne jede CSP

**Stand (20.10.2026):** behoben in `d31a4ce`: `CSP_AUSNAHMEN` führt `lern-app` nur ohne Sprachpräfix; Ausschluss der Lern-App-CSP nur für die Anmeldung ohne Punkt im Pfad. Beleg: Unit `kopfzeilen-pfade.test.ts` (`/de/lern-app/x.y` → öffentliche CSP, `/lern-app/de/anmelden/x.y` → CSP der Lern-App).

**Ort:** `web/next.config.ts:17`, `web/src/lib/sicherheit/header.ts:120`, `web/src/proxy.ts:112`.

**Nachweis (aus Matcher und Regeln abgeleitet, nicht im Bau gemessen):** `CSP_AUSNAHMEN` nimmt auch
`/(de|tr|en)/lern-app/…` von der öffentlichen CSP aus; die Regeln der Lern-App treffen nur `/lern-app/…`. Pfade mit Punkt
erreichen den Proxy nicht. Damit antworten z. B. `/de/lern-app/x.y` (404-Seite der Website) und
`/lern-app/de/anmelden/x.y` (404 der Lern-App, Ausschluss der Lern-App-CSP greift, Nonce-CSP fehlt) ohne
Content-Security-Policy.

**Behebung:** In `CSP_AUSNAHMEN` den Eintrag `lern-app` ohne Sprachpräfix führen; den Ausschluss der Lern-App-CSP auf
`(de|tr|ar)/anmelden(?:/[^.]*)?$` begrenzen; Fälle in `tests/unit/kopfzeilen-pfade.test.ts` ergänzen.

## N-3 (niedrig) – Jahres-Kopien im CDN überdauern Schalter und Zurückziehen

**Stand (20.10.2026):** behoben in `324cfc4`: CDN-Tags der Pakete `lernapp,lernapp-kurs-<id>,einstellungen`, der Audio-Bündel zusätzlich `lernapp`, `lernapp-kurs-<sprache>`, `einstellungen`; Verzeichnis und Pakete im Daten-Cache mit `einstellungen`. Beleg: Integration `lernapp-pakete.test.ts`. Offen: Neubau eines Bündels ohne zurückgezogenen Clip (Audio-Kette L3-05) und der Nachweis MISS/404 im Vorschau-Bautest (S5 B2/B5).

**Ort:** `web/src/app/lern-app/pakete/[kurs]/[einheit]/[hash]/route.ts:27-33`,
`web/src/app/lern-app/audio/[...pfad]/route.ts:30-42`, `web/src/server/actions/startklar.ts:63`,
`web/src/lib/lernapp/veroeffentlichen.ts:15-23`.

**Nachweis:** Pakete und Bündel tragen `Vercel-CDN-Cache-Control: max-age=31536000` und nur die Tags `lernapp`,
`lernapp-kurs-<id>` bzw. `lernapp-audio(-<sprache>)`. Das Umschalten im Cockpit erneuert nur `TAG.einstellungen`. Nach
„`lernapp` aus“ oder „`lernapp_ungeprueft` aus“ liefert das CDN schon abgerufene Pakete (auch solche mit Hinweis-Einträgen)
und Bündel unter ihrer Adresse weiter – „aus heißt 404“ (ADR 0035) gilt dort nicht. Audio-Bündel tragen keinen Kurs-Tag; ein
zurückgezogener Eintrag bleibt im Bündel abrufbar (das Paket verweist nicht mehr darauf). Dass `updateTag` die CDN-Tags der
Pakete leert, sagt die Vercel-Dokumentation für `revalidateTag`; belegt ist es im Vorschau-Bautest (S5, B2/B5) noch nicht.

**Behebung:** Beim Schalten der Lern-App-Schalter zusätzlich `TAG.lernapp` und `lernapp-audio` erneuern (oder
`einstellungen` in `Vercel-Cache-Tag` aufnehmen); beim Zurückziehen eines vertonten Eintrags das Bündel der Einheit neu bauen
oder den Tag `lernapp-audio-<sprache>` leeren; Nachtrag im Bautest: nach Zurückziehen bzw. Abschalten MISS und 404.

## N-4 (niedrig) – 206-Teilantworten mit Jahres-Kopf für das CDN

**Stand (20.10.2026):** behoben in `324cfc4`: 206 mit `Vercel-CDN-Cache-Control: no-store`, ohne Tag. Beleg: Integration `lernapp-pakete.test.ts` (Dateisystem und Blob). Offen: B5 im Vorschau-Bautest.

**Ort:** `web/src/app/lern-app/audio/[...pfad]/route.ts:30-42`.

**Nachweis:** Für 200 **und** 206 setzt `kopfzeilen` `public, max-age=31536000, immutable` und
`Vercel-CDN-Cache-Control: max-age=31536000`. Der Client fragt nie mit `Range` (S4/S5), jeder Dritte kann es. S5 erwartet
für Bereichsanfragen MISS (B5); gemessen ist es nicht. Hielte das CDN eine Teilantwort unter der Adresse vor, bekämen alle
ein abgeschnittenes Bündel – ein Jahr lang.

**Behebung:** Für 206 kein `Vercel-CDN-Cache-Control` (bzw. `no-store` für das CDN) oder `Range` ignorieren und immer das
ganze Bündel mit 200 liefern; B5 im Vorschau-Bautest ausführen.

## N-5 (niedrig) – Service Worker folgt `/_next/static/../`-Verweisen

**Stand (20.10.2026):** behoben in `324cfc4`: Der Worker holt nur Programmteile unter `/_next/static/` ohne `..` (auch kodiert) und ohne Backslash. Beleg: Unit `lernapp-sw.test.ts` (Verweise auf `/api/lernapp/sitzung` und die Anmeldung werden weder geholt noch vorgehalten; ohne die Behebung rot).

**Ort:** `web/public/lern-app/sw.js:110` (Muster ohne Schutz vor `..`), `:82-90` (`dateiHolen` → `vorhalten`).

**Nachweis:** Das Muster `/\/_next\/static\/[^"'\s)\\]+/g` trifft auch `/_next/static/../../api/lernapp/sitzung`;
`fetch` normalisiert auf `/api/lernapp/sitzung`, die Antwort (Konto-Kennung, Stand der Einwilligung) landet in
`igmg-lernapp-schale-*` – Cache Storage beachtet `no-store` nicht. Voraussetzung ist eine solche Zeichenkette im HTML einer
Lern-App-Seite (z. B. ein Titel aus den Inhaltsdateien), also Redaktion bzw. Pipeline.

**Behebung:** Vor dem Holen `new URL(datei, self.location)` bilden und nur vorhalten, wenn `pathname` mit `/_next/static/`
beginnt und der Rohtext kein `..` enthält; Unit-Test in `tests/unit/lernapp/lernapp-sw.test.ts`.

## N-6 (niedrig) – Rolle `sprachpruefung` mit Grundrechten der Verwaltung

**Stand (20.10.2026):** behoben in `324cfc4`: `sprachpruefung` nur `verwaltung.betreten`, `lernapp.lesen`, `lernapp.sprache.pruefen`. Belege: Unit `matrix.test.ts`, `matrix-negativ.test.ts`; Integration `verwaltung/rechte-matrix.test.ts` grün.

**Ort:** `web/src/lib/rechte/matrix.ts:283` (`[...GRUNDRECHTE, 'lernapp.lesen', 'lernapp.sprache.pruefen']`).

**Nachweis:** `GRUNDRECHTE` umfasst `verwaltung.betreten`, `uebersicht.lesen`, `postfach.nutzen`, `ticket.lesen`,
`ticket.anlegen`, `styleguide.lesen`, `medium.lesen`. Muttersprachliche Prüfende (oft Ehrenamtliche von außen) lesen damit u. a.
alle Tickets und die Mediathek; ADR 0041 Nr. 1 sieht nur Lesen der Lern-App und Sprachprüfung in den eigenen Sprachen vor.

**Behebung:** `sprachpruefung` auf `verwaltung.betreten`, `lernapp.lesen`, `lernapp.sprache.pruefen` begrenzen (Einstieg
direkt in die Prüfoberfläche); Negativtest in `tests/unit/rechte/matrix-negativ.test.ts`.

---

## Hinweise (kein Befund)

- **H-1 Einwilligung `lernapp`:** Erteilen und Widerrufen gibt es noch nicht (`KIND_EINWILLIGUNGEN` ohne `lernapp`, keine
  eigene Aktion). Vor dem Einschalten von `lernapp_sync` bauen: Wortlaut mit Version, Eltern für Kinder, eigener Widerruf;
  der Widerruf löscht den Lernstand auf dem Server (`lernapp_profil`, Kaskade) – Art. 7 Abs. 3 und Art. 17 DSGVO.
- **H-2 Zuweisungen:** `aufgabe_erledigt` entsteht aus selbst gemeldeten `lektion`-Ereignissen (offline zuerst, das Gerät
  ist die Quelle). Lehrkräfte in der Oberfläche (L7) darauf hinweisen.
- **H-3 Zeiger:** Der Zeiger ist die fortlaufende Kennung aller Konten; er verrät grob das Gesamtaufkommen. Optional ein
  Zeiger je Konto.
- **H-4 Pausen:** `daten.von`/`daten.bis` werden nicht geklemmt (nur `am` und `tag`); Lerntage in der Zukunft sind möglich
  (nur eigene Daten, Gruppenwoche ab L7).
- **H-5 Rückkehr zu einem früheren Hash:** Wird ein Baustein auf einen früheren, schon freigegebenen Inhalts-Hash
  zurückgesetzt, gelten dessen Freigaben wieder. Fachlich vertretbar (gleicher Inhalt), aber in ADR 0040/0041 ausdrücklich
  festhalten.
- **H-6 Abmelden auf geteilten Geräten:** Das lokale Profil bleibt nach dem Abmelden mit seinem Lernstand sichtbar (gewollt:
  Daten auf dem Gerät). In den Einstellungen auf „Profil von diesem Gerät löschen“ hinweisen.

## Geprüft ohne Befund

- **Proxy-Weichen und Weiterleitungen:** `/lern-app` und `/(de|tr|en)/lern-app…` leiten immer auf `/lern-app/…` des eigenen
  Ursprungs (auch `//fremd`, `/\`, `%2F%2F`); der Suchteil wird nur angehängt. `/lern-app/en…` → `de`. Schalter aus über die
  Umgebung → 404 mit `no-store`, `noindex` und Lern-App-CSP. Pakete, Audio und Modelle sind vom Matcher ausgenommen und
  prüfen den Schalter selbst.
- **CSP:** `'wasm-unsafe-eval'`, `worker-src 'self'` ohne `blob:`, `media-src 'self' blob:` nur in `cspLernApp`; kein
  `blob:` in `script-src`, kein `'unsafe-eval'` in der Produktion; `frame-ancestors 'none'`, `object-src 'none'`,
  `base-uri`/`form-action 'self'` bleiben. Die öffentliche CSP der Website ist unverändert.
- **COOP/COEP:** `require-corp` nur für `/lern-app/:pfad*`; alle Ressourcen der Lern-App kommen vom eigenen Ursprung.
- **Permissions-Policy:** Mikrofon nur auf `/lern-app/:ui/:kurs/ueben`, `…/wiederholen` und im Audio-Studio der Verwaltung;
  sonst gesperrt.
- **Anmeldung im Scope:** Nonce je Anfrage (UUID, Base64) in Anfrage- und Antwort-CSP mit `'strict-dynamic'`, `noindex`,
  `no-store`; die Seite prüft `lernapp` und `konten`. Rückkehr-URL: `sichererRuecksprung` (nur relative Pfade, kein `//`,
  kein `..`, Länge ≤ 300) plus `istLernAppZiel` (nur `de|tr|ar`, Segmente `[a-z0-9-]`, nie die Anmeldung) bzw.
  `oberflaecheVon`; `zweiFaktorZiel`, `kinderAnmelden` und `kontoAbmelden` führen nur auf geprüfte Ziele. Cookies wie die
  Website (Sitzung der Konten), die übrigen Lern-App-Seiten setzen keine (kein next-intl).
- **Sync-API:** Reihenfolge Schalter (`lernapp_sync` mit `lernapp` und `konten`) → Ursprung (`Sec-Fetch-Site: same-origin`,
  sonst `Origin` gleich Host) → Sitzung mit Faktor und Rolle → Einwilligung (Kinder nur über sorgeberechtigte Eltern,
  Übergang 30 Tage, danach nur die eigene; Kinderkonto ohne Lerndatensatz nie) → Bremse 30/min je Konto → `Content-Type`,
  Größe vor und beim Lesen (256 KB, auch ohne `Content-Length`) → Zod strikt, Ereignisse einzeln. Alle Lese- und
  Schreibpfade filtern nach der `benutzerId` der Sitzung; Sperre je Konto; `ON CONFLICT DO NOTHING`; der Zeiger liefert nur
  eigene Ereignisse anderer Geräte; Uhrzeit-Klemme (Empfang + 5 min, Lerntag ≤ spätester Kalendertag); `no-store`.
  Cross-Site-POST scheitert zusätzlich am JSON-Typ (Preflight).
- **Pakete und Audio:** Kurs, Einheit und Hash bzw. Bündelpfad streng geprüft (Muster ohne `..`, Schlüssel gehört zum
  Kurs); Blob-Adresse nur aus fester Basis und geprüftem Schlüssel (keine fremden Ziele); Strom, `nosniff`,
  `application/octet-stream`, 416 ohne Vorhalten; keine Cookies gelesen oder gesetzt; Schalter `lernapp`. Pakete enthalten nur
  Ausgeliefertes (`freigabe.ts`), Audio nie bei `religionsbezug`; der Client prüft den SHA-256 jedes Pakets und das Paket mit
  Zod.
- **Rechte-Matrix:** neue Aktionen; `lernapp.religioes.pruefen` in `NIE_PER_ADMINISTRATION`; `freigabe.ts` zählt nur Personen
  mit der aktuellen Rolle `religioese_pruefung`, ohne Verfasser, mit bestätigten Belegen, zum aktuellen Hash, jüngste Prüfung
  je Person; `darfSprachePruefen` nur in den eigenen Sprachen (noch ohne Aufrufer).
- **Löschfristen:** Lernstand 12 Monate nach der letzten Aktivität, Kaskade auf Ereignisse, Karten und Tage sowie mit dem
  Konto; Schreibabgaben nach `loeschenAb` bzw. 12 Monaten; Verdichtung unter derselben Sperre wie der Abgleich. Ein paralleler
  Abgleich hält den Lernstand über die Zeilensperre am Leben.
- **Import:** Status aus Dateien nur `entwurf`/`automatisch_geprueft`; menschlich geprüfte Einträge eingefroren (Konflikt statt
  Überschreiben); alle Abfragen mit Parametern; `LIKE`-Muster nur aus Schlüsseln ohne Platzhalterzeichen; neuer Hash setzt
  Prüfungen und Freigaben zurück; fehlende Einträge werden gesperrt.
- **Service Worker:** nie `/api/**`, nie `/lern-app/<x>/anmelden`, nur GET vom eigenen Ursprung, keine RSC- und
  Bereichsanfragen, nur 200 `basic` ohne Weiterleitung; Seiten der Hülle sind statisch und ohne Personendaten. Der Root-Worker
  lässt `/lern-app` durch und behält `igmg-lernapp-*`.
- **IndexedDB-Export/-Import:** strikte Zod-Prüfung (Format, Version, Profil, ≤ 250.000 Ereignisse), Datei ≤ 25 Mio. Zeichen,
  keine Konto-Kennung im Export; Anzeige nur über React.
- **Oberfläche:** keine HTML-Senken in `web/src/components/lernapp/**` und `web/src/app/lern-app/**`; Tipps nur fett/kursiv
  aus dem Tiptap-JSON.
- **Religion-Prüfung im Ist-Stand:** `node _gemeinde/werkzeuge/religion-pruefung.mjs` im Arbeitsbaum grün (5.713 Dateien,
  Wächter über 1 Lern-App-Datei).

## KI-Regel 2

Dieser Bericht enthält keine arabische Schrift, keine religiösen Texte, Formeln oder Übersetzungen. Die Wächter-Probe las
vier Wörter aus den gepinnten Daten nur im Arbeitsspeicher und gab ausschließlich Befundzahlen aus.


## Nachtrag: Behebung (20.10.2026)

Alle Befunde M-1 bis M-3 und N-1 bis N-6 sind im Arbeitsbaum `agent-a212ace6efc9226bb` behoben (Stand je Befund oben). Commits
auf dem Zweig `worktree-agent-a212ace6efc9226bb`, älteste zuerst: `61732c5` (Sitzungszweig hineingemergt, Löschkonzept §3.7),
`8d60fe8` (M-1, M-2), `18726ba` (M-3), `d31a4ce` (N-1, N-2), `324cfc4` (N-3 bis N-6), `bc0768b` (niedrige Punkte der
Gegenprüfung), `6f62263` (Nacharbeit M-1, Bau-Kennung, E2E-Probe).

Hinweise H-1 bis H-6 bleiben Vormerkungen: H-1 (Einwilligung `lernapp` mit Oberfläche, Löschung nach Widerruf) vor dem
Einschalten von `lernapp_sync` in L7; H-6 teilweise – die Einstellungen sichern den Lernstand jetzt als Datei, „Profil von
diesem Gerät löschen“ folgt in L7. Der Bericht enthält weiterhin keine arabische Schrift.
