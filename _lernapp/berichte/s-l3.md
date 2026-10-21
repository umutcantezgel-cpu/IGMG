# S-L3 – Sicherheitsprüfung der Lern-App (L8-01)

| | |
|---|---|
| Datum | 21.10.2026 |
| Prüfer | frischer Sicherheits-Agent (Prüfstufe S, PLAN §14 L8-01, KERN 4.0 §4–§6) |
| Gegenstand | Branch `claude/trusting-lovelace-6nfolz`, Stand `7c7058d` (Code gleich `3f8c9cf`, L7 gemergt; danach nur `PRUEFPUNKT.md`), Hauptarbeitsbaum `/home/user/IGMG`, nur gelesen |
| Vergleich | Änderungen seit dem Merge von L1 (`06651b3..HEAD`, Code: 274 Dateien), Schwerpunkt auf allem, was seit S-L1 neu ist: Verwaltung v1 (L3-06/06b), Übungstypen und Sprechen (L2), Audio (L3-05), Spielelemente, Gruppen, Lehrkräfte und Eltern (L7) |
| Vorgehen | Verfahren des Skills `security-review`, angewandt auf den ganzen Stand der Lern-App: je Prüfbereich den Datenfluss vom Eingang bis zum Speicher bzw. zur Antwort verfolgen; nur ausnutzbare oder regelverletzende Befunde mit Pfad. Dazu: Kopfzeilen der Live-Umgebung `https://igmg-wetzlarer.vercel.app` nur per GET/HEAD gelesen (und drei POST ohne Inhalt an Routen, die ohne Datenbank 404 antworten); `_gemeinde/werkzeuge/religion-pruefung.mjs` einmal ausgeführt. Am Repository nichts geändert. |

## Ergebnis

**Keine kritischen, keine hohen Befunde.** 1 × mittel (latent), 4 × niedrig, 8 Hinweise. Das Kriterium „S-L3 ohne
hoch/kritisch“ ist erfüllt. **Freigabe mit Auflagen:**

- **M-1** vor dem Einschalten von `lernapp_gruppen` oder `lernapp_rangliste` in der Produktion **und** spätestens bevor
  Lektionen des Wissenskurses oder des Koran-Arabisch-Pfads ausgeliefert werden (L6) beheben (deckt sich mit D-L03/D-L04,
  ADR 0043 Fortschreibung Nr. 16).
- **N-2** vor dem Einschalten von `lernapp_sync` (setzt LM-08 voraus; schreibt S-L1 H-1 fort).
- **N-1, N-3, N-4** bis zur Abnahme (L8-05) oder als AUSNAHME mit Grund.
- Hinweise H-1 bis H-8 bei Gelegenheit; H-2 gehört in den Lasttest L8-02.

| Nr. | Schwere | Kurzfassung | Ort |
|---|---|---|---|
| M-1 | mittel (latent) | Wochen-XP, Lektionen und Lerntage aller Kurse – auch Wissenskurs und Koran-Arabisch – fließen ungetrennt in Stand der Lehrkraft, Gruppenziel und Bestenliste (Rückschluss auf religiöses Lernen, Art. 9 DSGVO) | `web/src/lib/lernapp/sync/server.ts:242-320`, `web/src/lib/db/schema/lernapp-nutzung.ts:118-131`, `web/src/lib/lernapp/gruppe/dienst.ts:104-114, 155-180, 514-600, 611-660` |
| N-1 | niedrig | Sprecher-Vereinbarung (PDF mit Personendaten) liegt als gewöhnliches Medium in der Mediathek: sichtbar für alle Rollen mit `medium.lesen`, ohne Anmeldung abrufbar über `/medien/<schlüssel>` mit `public, max-age=86400` | `web/src/server/actions/lernapp-audio.ts:33-105`, `web/src/app/medien/[...schluessel]/route.ts:24-33` |
| N-2 | niedrig (latent) | Einwilligung `lernapp`: weder Erteilen noch Widerrufen gebaut; Widerruf löscht den Server-Lernstand nicht; Export nach Art. 15/20 ohne Lern-App-Daten; Rücknahme der Bestenlisten-Zustimmung nur auf der Gruppenseite | `web/src/lib/lernen/ansicht.ts:14`, `web/src/server/actions/{kinder,schueler}.ts`, `web/src/server/queries/konto.ts:102`, `web/src/lib/lernapp/sync/server.ts:62-110` |
| N-3 | niedrig | Selbst gemeldete XP ohne Plausibilitätsgrenze: ein Konto kann seine Wochen-XP beliebig aufblähen und so Bestenliste und Gruppenziel verfälschen | `web/src/lib/lernapp/ereignisse/typen.ts:111`, `web/src/lib/lernapp/ereignisse/ableiten.ts:146`, `web/src/lib/lernapp/sync/protokoll.ts:52` |
| N-4 | niedrig | Statische Dateien unter `/lern-app/` (Modelle ≈ 95 MB, `sw.js`, Symbole) bleiben bei ausgeschaltetem Schalter `lernapp` mit 200 abrufbar und sind ungebremst; große Modell-Dateien sind ein Kostenhebel | `web/public/lern-app/**`, `web/src/proxy.ts:118`, `web/src/lib/sicherheit/header.ts:108-133` |

---

## M-1 (mittel, latent) – Art.-9-Rückschluss über Gruppe, Bestenliste und Stand der Lehrkraft

**Ort:**
- `web/src/lib/lernapp/sync/server.ts:242-320` (`erneuereTage`): Lerntage werden aus den Ereignissen `lektion` und `xp`
  **aller** Kurse abgeleitet; der Kurs geht verloren.
- `web/src/lib/db/schema/lernapp-nutzung.ts:118-131` (`lernapp_tag`): nur `benutzerId`, `tag`, `xp`, `lektionen`, `pause`,
  `zielErreicht` – keine Kursspalte.
- `web/src/lib/lernapp/gruppe/dienst.ts:104-114` (`wochenXp`), `:155-180` (`platzierungen`), `:514-600` (`standDerGruppe`),
  `:611-660` (`eigeneGruppen`, Gruppenziel): lesen die Tagessummen aus `lernapp_tag`.

**Ausnutzungspfad (Ablauf aus dem Code, kein Angreifer nötig):**
1. Eine Lernende ab 16 (oder ein Kind mit Einwilligung der Eltern) ist Mitglied einer Lerngruppe; ihre Einwilligung
   `lernapp` gilt; der Abgleich läuft.
2. Sie lernt nur im Wissenskurs bzw. im Koran-Arabisch-Pfad (ab L6 ausgeliefert). Der Spieler meldet `lektion`- und
   `xp`-Ereignisse (`grund` = Lektionsart, ohne Kurs im XP-Ereignis zwingend); `erneuereTage` schreibt Tages-XP, Lektionen
   und Lerntage nach `lernapp_tag`.
3. Die Lehrkraft der Gruppe sieht unter „Mein Bereich › Unterricht › Lern-App“ je **benannter** Person Wochen-XP,
   Lektionen und Lerntage, auch wenn sie nur Sprachkurse zugewiesen hat. Mitglieder ab 16 im gegenseitigen Kreis sehen
   „Vorname N.“ mit Wochen-XP (Gruppe und Familie); alle Mitglieder sehen die Summe des Gruppenziels.
4. Aus „viele XP, aber keine erledigte Sprach-Zuweisung“ bzw. aus dem Vergleich mit dem Sprachkurs-Stand lässt sich auf
   Beschäftigung mit religiösen Inhalten schließen – KERN 4.0 §6 stuft genau das als Art. 9 DSGVO ein.

**Stand und Auswirkung:** Heute latent: In der Produktion sind `lernapp_gruppen` und `lernapp_rangliste` aus, und der
Wissenskurs liefert noch keine Lektionen aus. Die Lücke ist in ADR 0043 Fortschreibung Nr. 16 als offene Entscheidung
D-L03/D-L04 vermerkt, aber nicht technisch gesperrt: Weder der Cockpit-Schalter noch die Auslieferung des Wissenskurses
prüfen, ob die Trennung gebaut ist.

**Behebung:**
1. `lernapp_tag` um `kursId` erweitern (Primärschlüssel `benutzerId, tag, kursId`) oder eine zweite Tabelle
   `lernapp_tag_kurs`; `erneuereTage` leitet je Kurs ab (Lektionsereignisse tragen `kurs`; XP-Ereignisse über `bezug`,
   sonst einem Kurs „unbekannt“ zuordnen, der nirgends gezählt wird).
2. Bestenliste und Gruppenziel lesen nur Sprachkurse (D-L04); der Stand der Lehrkraft nur die Kurse der eigenen
   Zuweisungen (D-L03); die Lernwoche der Eltern darf alle Kurse zeigen.
3. Bis dahin eine harte Sperre: Startklar meldet Rot, wenn `lernapp_gruppen` oder `lernapp_rangliste` an ist und Kurse
   `islam`/`koran` sichtbare Lektionen haben; dazu ein Integrationstest „Wissens-XP erscheint weder in der Bestenliste noch
   im Stand der Lehrkraft“.

## N-1 (niedrig) – Sprecher-Vereinbarung als gewöhnliches Medium

**Ort:** `web/src/server/actions/lernapp-audio.ts:33-105` (`sprecherAnlegen`: neue PDF über `verarbeiteDatei` →
`speicher().schreibe(v.schluessel …)` und Zeile in `medium`; alternativ Auswahl irgendeines vorhandenen PDF-Mediums über
`mediumId`), `web/src/app/medien/[...schluessel]/route.ts:24-33` (liefert jedes Medium mit Zeile in `medium` ohne
Anmeldung, `Cache-Control: public, max-age=86400`).

**Ausnutzungspfad:**
1. Die Bildung legt im Audio-Studio eine Sprecherin mit unterschriebener Vereinbarung an (Name, Unterschrift, ggf. Anschrift).
2. Die Datei erscheint als Medium „Vereinbarung zu Aufnahmen für die Lern-App“ in der Mediathek. Jede Person mit
   `medium.lesen` – die Grundrechte von Redaktion, Organisationsredaktion, Mitgliederverwaltung, Leitung, religiöser Prüfung
   und weiteren – kann sie öffnen und ihre Adresse `/medien/<sha256>/<name>.pdf` kopieren.
3. Unter dieser Adresse liefert die Website das PDF jedem ohne Anmeldung aus; das CDN hält es einen Tag öffentlich vor.
   Eine Redaktion kann es versehentlich in eine Seite einbinden.

**Auswirkung:** Vertrauliche Personendaten (Vertragsdokument) sind breiter zugänglich als nötig (Art. 5 Abs. 1 lit. f
DSGVO, Grundsatz der geringsten Rechte). Die Adresse ist nicht erratbar (Inhalts-Hash), deshalb nur niedrig. Das Muster
stammt aus der Rezitations-Werkstatt (`web/src/server/actions/rezitationen.ts:141-220`, ADR 0029 Nr. 4) und gilt dort ebenso.

**Behebung:** Vereinbarungen wie die Rohaufnahmen privat ablegen (Schlüssel `lernapp/vereinbarungen/<sha16>.pdf`, keine
Zeile in `medium`), eigene Spalte bzw. Tabelle statt `vereinbarungMediumId`, Abruf nur über eine Route mit
`lernapp.audio.bearbeiten` (wie `…/lernapp/audio/aufnahme/[id]`), `private, no-store`, `Content-Disposition: attachment`,
CSP `sandbox`. Bestehende Vereinbarungs-Medien umziehen und aus der Mediathek entfernen; dasselbe für die Rezitationen
vormerken.

## N-2 (niedrig, latent) – Lebenszyklus der Einwilligung `lernapp` unvollständig

**Ort:** `web/src/lib/lernen/ansicht.ts:14` (`KIND_EINWILLIGUNGEN` ohne `lernapp`), `web/src/server/actions/schueler.ts:26`
(nur `gruppenchat`, `push_kind`), `web/src/server/actions/kinder.ts:76` (nur `KIND_EINWILLIGUNGEN`),
`web/src/server/queries/konto.ts:102` (`exportiereKontodaten` ohne Lern-App-Tabellen), `web/src/lib/lernapp/sync/server.ts:62-110`
(`lernappEinwilligung` liest nur), `web/src/lib/lernapp/gruppe/dienst.ts` (`blendeAus` nur über `POST /api/lernapp/gruppe`).

**Befund:** S-L1 H-1 ist offen und betrifft mit L7 mehr Funktionen. Es gibt keinen Weg, die Einwilligung `lernapp` zu
erteilen oder zu widerrufen; ein Widerruf (etwa direkt in der Datenbank) ließe `lernapp_profil`, Ereignisse, Karten,
Lerntage und die Bestenlisten-Zustimmung stehen; der Export nach Art. 15/20 DSGVO enthält keine Lern-App-Daten
(`lernapp_ereignis`, `lernapp_karte`, `lernapp_tag`, `lernapp_rangliste_zustimmung`, `lernapp_familie`); die Zustimmung zur
Bestenliste lässt sich nur auf der Gruppenseite zurücknehmen, nicht in den Einstellungen (Einwilligungsentwurf EL4).

**Auswirkung:** Heute verarbeitet der Server keine Lernstände (ohne Einwilligung antwortet der Abgleich 403). Wird die
Einwilligung später nur „irgendwie“ ergänzt, fehlen Art. 7 Abs. 3 (Widerruf so leicht wie Erteilen), Art. 17 und Art. 15/20.

**Behebung:** Vor `lernapp_sync` (LM-08): Erteilen/Widerrufen mit Textversion (eigene Person ab 16, Eltern für Kinder) in
„Mein Bereich“ und in den Einstellungen der Lern-App; der Widerruf löscht in einer Transaktion `lernapp_profil` (Kaskade)
sowie Zustimmung und Familie und vermerkt es im Audit; Export um die Lern-App-Tabellen erweitern; Integrationstest
„Widerruf → 0 Zeilen, nächster Abgleich 403“.

## N-3 (niedrig) – Selbst gemeldete XP ohne Plausibilitätsgrenze

**Ort:** `web/src/lib/lernapp/ereignisse/typen.ts:111` (`xp.menge` 1–20 je Ereignis), `web/src/lib/lernapp/sync/protokoll.ts:52`
(bis 20.000 neue Ereignisse je 24 h), `web/src/lib/lernapp/ereignisse/ableiten.ts:146` (Tages-XP = Summe ohne Obergrenze),
`web/src/lib/lernapp/gruppe/dienst.ts:104-114` (Wochen-XP für Bestenliste und Gruppenziel).

**Ausnutzungspfad:** Ein angemeldetes Konto mit Einwilligung schickt mit eigener Sitzung `POST /api/lernapp/sync` mit 500
gültigen `xp`-Ereignissen je Anfrage (`menge` 20, `tag` beliebig in der laufenden Woche). Nach 40 Anfragen stehen
400.000 XP an einem Tag in `lernapp_tag`; die Bestenliste der Gruppe bzw. Familie und die Summe des Gruppenziels zeigen sie.

**Auswirkung:** Nur Integrität der Spielelemente unter Personen, die selbst zugestimmt haben (keine fremden Daten, keine
Rechteausweitung). Widerspricht aber „ohne Druck“ (ADR 0043), weil eine unerreichbare Zahl andere unter Druck setzen kann;
das Gruppenziel ist für alle Mitglieder (auch Kinder) betroffen.

**Behebung:** In der Ableitung für Gruppe und Bestenliste je Lerntag kappen (z. B. ≤ 500 XP und ≤ 30 Lektionen, die Zahl
an die größte reale Tagesleistung anlehnen) und XP nur zählen, wenn ein passendes `lektion`-Ereignis mit Bezug existiert;
das Gerät behält die volle Zahl für sich. Unit-Test der Kappung.

## N-4 (niedrig) – Statische Lern-App-Dateien überdauern „Schalter aus“ und sind ungebremst

**Ort:** `web/public/lern-app/{sw.js,modelle/**,symbole/**}`; `web/src/proxy.ts:118` (Matcher schließt `lern-app/modelle`
und alle Pfade mit Punkt aus); `web/src/lib/sicherheit/header.ts:108-133` (Modelle ein Jahr `immutable`).

**Befund (aus Ablage und Matcher abgeleitet, Schalter in der Produktion nicht umgelegt):** Statische Dateien unter
`public/` liefert Next vor jeder Route und vor dem Proxy aus. Bei `lernapp` aus bleiben `/lern-app/sw.js`, die Symbole und die
zwölf Modell-Dateien (Encoder 23 MB, Decoder 54 MB, ORT-WASM) mit 200 erreichbar – „ausgeschaltet heißt 404“ (ADR 0035)
gilt dort nicht; S-L1 nahm für Modelle eine eigene Schalterprüfung an, die es bei statischer Ablage (ADR 0042 Fortschreibung
S5) nicht gibt. Die großen Dateien sind zudem ohne Bremse abrufbar: wiederholte Abrufe treiben den Datentransfer des
Vercel-Projekts (Kosten, LM-15).

**Auswirkung:** Keine Personendaten, keine fremden Inhalte; ein bereits installierter Service Worker bleibt nach dem
Abschalten aktiv und zeigt offline die vorgehaltene Hülle. Kostenrisiko bei gezieltem Massenabruf.

**Behebung:** Modelle über eine kleine Route `/lern-app/modelle/[...pfad]` mit Schalterprüfung ausliefern (Blob oder Datei,
`immutable` beibehalten, CDN-Tag `einstellungen`) **oder** in der Vercel-Firewall eine Ratenregel für
`/lern-app/modelle/*` (z. B. 20 Anfragen je 10 min und IP) setzen und den Ausnahmefall in ADR 0035/0042 festhalten. Für
`sw.js` beim Abschalten einen „Abmelde-Worker“ ausliefern (`self.registration.unregister()`, Vorräte `igmg-lernapp-*`
außer Modellen löschen) bzw. die Hülle aus dem Proxy-Matcher prüfen.

---

## Hinweise (kein Befund)

- **H-1 Meldung, eigene Antwort:** Die Route nimmt `antwort` nur von angemeldeten Konten ohne `istKind`
  (`web/src/app/api/lernapp/meldung/route.ts:72-74`), nicht nach `abSechzehn` wie die Gruppe; ein Konto mit Lerndatensatz,
  dessen `sechzehnAm` nachträglich in die Zukunft korrigiert wurde, gälte als „ab 16“. Der Client schickt `antwort` heute nie
  (`web/src/lib/lernapp/oberflaeche/melden.ts:56-70`, `credentials: 'omit'`). Offene Meldungen haben keine Löschfrist. Beide
  Routen lesen den Körper ohne `Content-Length` erst ganz (`meldung/route.ts:41`, `gruppe/route.ts:138`) – wie im Abgleich
  als Strom mit Grenze lesen.
- **H-2 Last der Gruppenroute:** `GET /api/lernapp/gruppe` prüft je Mitglied jeder eigenen Gruppe die Einwilligung (drei
  Abfragen je Konto) und lädt Pakete für Zuweisungen; Bremse 60/min je Konto. Im Lasttest L8-02 messen; Einwilligungen
  gebündelt laden, ggf. Bremse 20/min.
- **H-3 Vorräte:** `igmg-lernapp-audio`, `-pakete` und `-modelle` haben keine Obergrenze und behalten alte Hashes; ein
  Bündel mit zurückgezogenem Clip bleibt auf Geräten, die es schon haben (S-L1 N-3, Neubau ohne Clip in der Audio-Kette noch
  offen). Beim Abruf des Verzeichnisses nicht mehr genannte Hashes aus den Vorräten löschen.
- **H-4 Sprecher und Aufnahmen:** Es gibt keinen Weg, eine Sprecherin samt Aufnahmen zu entfernen (Widerruf der
  Vereinbarung, Art. 7 Abs. 3/17); nur einzelnes Verwerfen. Vor den ersten echten Aufnahmen (X-02/X-03) ergänzen.
- **H-5 Gruppenziel:** Ab drei Teilnehmenden zeigt die Route die laufende Wochensumme; wer sie im Minutentakt abfragt,
  sieht, wann und wie viel andere lernen. Erwägen: Summe nur mit Tagesstand (bis gestern) zeigen.
- **H-6 Wortlaut der Zustimmung:** Die gespeicherte Version heißt `lernapp-bestenliste/2026-10-entwurf`; nach LM-08/LM-10
  Version heben und bestehende Zustimmungen neu einholen.
- **H-7 Profil auf geteilten Geräten (S-L1 H-6):** `loescheProfil` (`web/src/lib/lernapp/lokal/profile.ts:96`) ist in der
  Oberfläche nicht angebunden; „Profil von diesem Gerät löschen“ in den Einstellungen anbieten.
- **H-8 Prüfsprachen:** `pruefsprachenSetzen` erlaubt der Administration, sich selbst Prüfsprachen zu geben und dann
  allein Stichproben zu bestehen (eine Prüfung genügt nach ADR 0041). Gewollt, aber im Handbuch Sprachprüfung (L8-04) und im
  Audit-Bericht des Cockpits sichtbar machen.

## Geprüft ohne Befund

- **CSP und WASM je Bereich** (Code und Live-Kopfzeilen): `/lern-app/**` bekommt `cspLernApp` mit `'wasm-unsafe-eval'`,
  `worker-src 'self'` ohne `blob:`, `media-src 'self' blob:`, `connect-src 'self'`, `frame-ancestors 'none'`,
  `object-src 'none'`; kein `'unsafe-eval'`, kein `blob:` in `script-src`. Website ohne `'wasm-unsafe-eval'` und ohne
  `media-src blob:` (live `/de/lern-app/x.y` → öffentliche CSP, nicht „ohne CSP“ – S-L1 N-2 hält). Verwaltung der Lern-App:
  Nonce-CSP mit `'strict-dynamic'` plus nur `media-src blob:` (live `/verwaltung/lernapp/audio`). Anmeldung im Scope:
  Nonce-CSP, `noindex`, `no-store`; in der Produktion ohne Konten 404 mit `no-store` (live). Keine HTML-Senken
  (`dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`) in Lern-App, Verwaltung der Lern-App und Lehrkraft-Seiten;
  dynamische `href` nur aus geprüften Kurs-, Lektions- und Einheitsschlüsseln mit `encodeURIComponent`.
- **COOP/COEP je Bereich:** COOP `same-origin` überall; COEP `require-corp` nur `/lern-app/:pfad*` (live auf Seiten, Paketen,
  `sw.js`); Worker der Sprechübung liegt unter `/lern-app/modelle/sprechen/` und erbt die Isolation. Alle Ressourcen der
  Lern-App vom eigenen Ursprung.
- **Permissions-Policy:** Mikrofon live nur auf `…/ueben` (und `…/wiederholen`) sowie `/verwaltung/lernapp/audio`; sonst `()`.
- **Sync-API:** Reihenfolge Schalter → Ursprung → Sitzung mit Faktor → Einwilligung → Bremse → Typ und Größe (Strom,
  256 KB) → Zod strikt → Kontobindung (409) → Grenzen je Konto (429) unverändert gegenüber den Behebungen von S-L1 M-1/M-2;
  idempotent über `(benutzer, geraet, seq)` mit `ON CONFLICT DO NOTHING`, Sperre je Konto, `statement_timeout`; alle
  Abfragen mit Parametern, nur Konstanten in `sql.raw`; Zuweisungen nur mit `lernapp_gruppen`.
- **Gruppenroute:** Ursprung, Sitzung, Bremse, JSON ≤ 1 KB; Antwort ohne Kennungen anderer Konten; Gruppenisolation über
  `ladeGruppenKontext`/`darfInGruppe` (nur laufende Mitgliedschaften); „ausblenden“ immer möglich, „zustimmen“ nur ab 16 mit
  Einwilligung und beiden Schaltern; Wortlaut-Version als SHA-256 des angezeigten Textes.
- **Kinderschutz, Bestenliste ab 16:** Sperre im Code an drei Stellen (Route `ab16`, `platzierungen` filtert vor jeder
  weiteren Abfrage, `regeln.erscheint`/`siehtBestenliste`); ohne Profil gilt „Kind“; Kinderkonten nie, auch mit Zustimmung
  in der Datenbank; gegenseitiger Kreis für Gruppe und Familie; Familie nur mit bestätigtem, sorgeberechtigtem Bezug;
  Eltern sehen die Lernwoche nur bis zum Ende des Übergangs; Lehrkraft nur eigene Gruppe und nur Lernende mit Einwilligung;
  Gruppenziel erst ab drei Teilnehmenden. Keine Freitext-Kommunikation zwischen Personen; Schreibabgabe nicht aktiv
  (`ABGABE_AKTIV = false`).
- **Öffentliche Melde-Route:** Schalter → ALTCHA eingerichtet (sonst 503) → Ursprung → Bremse je IP (nur HMAC) → Größe
  ≤ 4 KB → Zod strikt, Aufgabe gehört zum Kurs und existiert → ALTCHA einmal verwendbar (Primärschlüssel) → Speichern nur
  von Aufgabenschlüssel und Kategorie, ohne Benutzerbezug; keine Cookies gesetzt; der Client sendet ohne Cookies.
- **Rechte der Verwaltung:** Jede Seite `verlangeLernappSeite(<Recht>)` (Sitzung, zweiter Faktor, Recht, Schalter);
  jede Action `mitLernappRecht` und zusätzlich die Prüfsprache (`darfSprachePruefen`, auch für die Administration);
  `sprachpruefung` nur `verwaltung.betreten`, `lernapp.lesen`, `lernapp.sprache.pruefen`; Stichproben-Entscheidung bewacht
  gegen Parallelität; Religionswächter auf Korrektur, Kommentar und Alternativen; Sperren und Entsperren nur mit Bestätigung,
  Entsperren nur zum selben Inhalts-Hash und nicht für vom Import entfernte Einträge; Audit ohne Inhalte. Die Oberfläche der
  religiösen Prüfung gibt es noch nicht (L6); `lernapp.religioes.pruefen` bleibt in `NIE_PER_ADMINISTRATION`, und
  `freigabe.ts` hält Einträge mit Religionsbezug, Wissen und Koran-Bedeutungen ohne zwei Freigaben unsichtbar.
- **Uploads im Audio-Studio:** Größe vor dem Lesen (≤ 5 MB), Format nur über Magic Bytes, Ablage privat unter
  `lernapp/aufnahmen/<sprache>/<textHash16>-<sha16>.<endung>` (Schlüsselprüfung ohne `..`), kein `medium`-Eintrag;
  Abruf nur mit `lernapp.audio.bearbeiten`, `private, no-store`, `nosniff`, Typ aus der Datenbank; nur vertonbare Einträge
  (Sprachkurs, ohne Religionsbezug, nicht gesperrt); PDF der Vereinbarung über die Medienprüfung (siehe aber N-1).
- **Pakete und Audio:** unverändert seit S-L1 N-3/N-4 (Tags `lernapp`, Kurs, `einstellungen`; 206 nie im CDN; Schalter
  `lernapp` im gecachten Laden); Bündel-Adresse nur aus fester Basis und geprüftem Schlüssel.
- **Service Worker:** nur GET vom eigenen Ursprung; nie `/api/**`, nie die Anmeldung, keine RSC- und Bereichsanfragen;
  nur 200 `basic` ohne Weiterleitung; Programmteile nur unter `/_next/static/` ohne `..`/Kodierung (S-L1 N-5 hält); Seiten
  per Bitte nur nach `istSeitePfad`, höchstens zehn; Hülle ≤ 400 Einträge; Lizenztexte nicht im Vorrat.
- **Datenfluss, 0 Drittanfragen, Whisper lokal:** `connect-src 'self'` als harte Grenze; Worker mit
  `allowRemoteModels = false`, `localModelPath` und `wasmPaths` vom eigenen Ursprung, `useWasmCache = false` (kein `blob:`);
  die Abschrift verlässt den Worker nicht, die Aufnahme verlässt das Gerät nicht (kein Upload-Pfad in der Lern-App);
  E2E `tests/e2e/lernapp/netzprotokoll.spec.ts` belegt ohne Konto nur GET an den eigenen Ursprung, keine API, keine Cookies.
  Externe Adressen nur als Links auf der Seite „Quellen“.
- **Religion-Prüfung im Ist-Stand:** `node _gemeinde/werkzeuge/religion-pruefung.mjs` grün (6.046 Dateien, arabische Schrift
  nur an erlaubten Orten, Wächter über 3 Lern-App-Dateien), rc = 0.

## KI-Regel 2

Dieser Bericht enthält keine arabische Schrift, keine religiösen Texte, Formeln, Übersetzungen oder Wortbedeutungen. Die
Religion-Prüfung lief nur lesend; ausgegeben wurden ausschließlich Zahlen.
