# E0-PRUEFER-03 · Funktionsliste F-01 … F-24 · Stand http://localhost:3100

> Wiederholung F-02/F-03/F-08 (Stufe C k3)

Zeitpunkt: 2026-10-15T03:08:01.834Z · Browser: Chromium 141.0.7390.37 · Breiten: 390 und 1440, sofern nicht anders vorgesehen · Konzept-Hinweis: vorgemerkt (außer F-24) · Belegbilder: `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c/k3/bilder-funktionsliste-wdh` · Verwaltungszustand: nein.

Ergebnis je Zeile: erfüllt, nicht erfüllt oder nicht prüfbar (mit Grund). Einzelprüfungen stehen unter „Einzelbefunde“. Messwerte zählen nicht zum Ergebnis. Formular-POSTs sind aus dem Netzwerk gezählt.

| ID | Funktion | Ablauf | 390 | 1440 |
|---|---|---|---|---|
| F-02 | Leiste auf jeder Seite außer Gebetszeiten | Leiste auf 19 Seiten; Telefon: aufklappen | nicht prüfbar | erfüllt |
| F-03 | /gebetszeiten: Tabs, Tastatur, Monatstabelle, Qibla | Tabs per Tastatur; Monat; Kompass | nicht erfüllt | nicht erfüllt |
| F-08 | Über uns, Projekte, Vorstand, IGMG (Tabs) | vier Seiten; Tabs | nicht erfüllt | nicht erfüllt |

## Einzelbefunde

### F-02 · Leiste auf jeder Seite außer Gebetszeiten
- 390 px: **nicht prüfbar** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · Leiste auf / · {"status":200,"leisten":1,"vorher":"false","nachher":"true","href":"/gebetszeiten"}
  - erfüllt · Leiste auf /veranstaltungen · {"status":200,"leisten":1,"vorher":"false","nachher":"true","href":"/gebetszeiten"}
  - erfüllt · Leiste auf /nachrichten · {"status":200,"leisten":1,"vorher":"false","nachher":"true","href":"/gebetszeiten"}
  - erfüllt · Leiste auf /ueber-uns · {"status":200,"leisten":1,"vorher":"false","nachher":"true","href":"/gebetszeiten"}
  - nicht prüfbar · Werkzeug-Lauf · technischer Fehler im Werkzeug (bitte prüfen): locator.getAttribute: Timeout 10000ms exceeded.
  - Bilder: `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c/k3/bilder-funktionsliste-wdh/F-02-390-ende.jpg`
- 1440 px: **erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · Leiste auf / · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /veranstaltungen · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /nachrichten · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /ueber-uns · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /projekte · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /vorstand · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /igmg · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /organisationen/ana-teskilati · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /bildung/korankurse · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /bildung/voranmeldung · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /kontakt · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /mitglied-werden · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /webseite-fuer-moscheen · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /meldung · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /suche?q=Gebet · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /veranstaltungen/freitagsgebet-mit-anschliessendem-vortrag · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /nachrichten/neue-gebetszeiten-fuer-den-winter · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /islamisches-wissen · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · Leiste auf /quran · {"status":200,"leisten":1,"href":"/gebetszeiten"}
  - erfüllt · keine Leiste auf /gebetszeiten · {"status":200}
  - Bilder: `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c/k3/bilder-funktionsliste-wdh/F-02-1440.jpg`, `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c/k3/bilder-funktionsliste-wdh/F-02-1440-ende.jpg`

### F-03 · /gebetszeiten: Tabs, Tastatur, Monatstabelle, Qibla
- 390 px: **nicht erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · HTTP 200 · 200
  - erfüllt · keine Leiste auf /gebetszeiten · "aside-Zahl 0"
  - nicht erfüllt · vier Tabs · ["Heute","Mein Ort","Monatlich","Qibla","Einstellungen"]
  - nicht erfüllt · Tabs per Tastatur (Pfeil rechts, Ende, Pos1) · {"nachPfeil":["Mein Ort"],"nachEnde":["Einstellungen"],"nachPos1":["Heute"]}
  - Messwert · Monatlich: sichtbare Tabellenüberschriften · []
  - nicht erfüllt · Monatstabelle mit Überschrift „Gebetszeiten“ · "keine"
  - nicht prüfbar · Monat wechselt · Im Bestand gibt es kein Bedienelement für einen Monatswechsel; die Tabelle zeigt den laufenden Monat (Messwert oben). OFFENE FRAGE: Was „Monat wechselt“ genau prüfen soll.
  - erfüllt · Qibla-Kompass sichtbar · 1
  - Bilder: `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c/k3/bilder-funktionsliste-wdh/F-03-monat-390.jpg`, `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c/k3/bilder-funktionsliste-wdh/F-03-qibla-390.jpg`, `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c/k3/bilder-funktionsliste-wdh/F-03-390-ende.jpg`
- 1440 px: **nicht erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · HTTP 200 · 200
  - erfüllt · keine Leiste auf /gebetszeiten · "aside-Zahl 0"
  - nicht erfüllt · vier Tabs · ["Heute","Mein Ort","Monatlich","Qibla","Einstellungen"]
  - nicht erfüllt · Tabs per Tastatur (Pfeil rechts, Ende, Pos1) · {"nachPfeil":["Mein Ort"],"nachEnde":["Einstellungen"],"nachPos1":["Heute"]}
  - Messwert · Monatlich: sichtbare Tabellenüberschriften · ["Oktober 2026 – Gebetszeiten","November 2026 – Gebetszeiten"]
  - erfüllt · Monatstabelle mit Überschrift „Gebetszeiten“ · "Oktober 2026 – Gebetszeiten"
  - nicht prüfbar · Monat wechselt · Im Bestand gibt es kein Bedienelement für einen Monatswechsel; die Tabelle zeigt den laufenden Monat (Messwert oben). OFFENE FRAGE: Was „Monat wechselt“ genau prüfen soll.
  - erfüllt · Qibla-Kompass sichtbar · 1
  - Bilder: `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c/k3/bilder-funktionsliste-wdh/F-03-monat-1440.jpg`, `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c/k3/bilder-funktionsliste-wdh/F-03-qibla-1440.jpg`, `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c/k3/bilder-funktionsliste-wdh/F-03-1440-ende.jpg`

### F-08 · Über uns, Projekte, Vorstand, IGMG (Tabs)
- 390 px: **nicht erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · /ueber-uns: 200, H1, Inhalt · {"status":200,"h1":"Über uns","zeichen":3414}
  - nicht erfüllt · /projekte: 200, H1, Inhalt · {"status":200,"h1":"Neue Fatih-Moschee ist eröffnet","zeichen":1457}
  - erfüllt · /vorstand: 200, H1, Inhalt · {"status":200,"h1":"Unser Vorstand","zeichen":3770}
  - erfüllt · /igmg: 200, H1, Inhalt · {"status":200,"h1":"IGMG - Islamische Gemeinschaft Millî Görüş","zeichen":829}
  - erfüllt · /igmg: Tabs zeigen Inhalt · {"tabs":5,"zeichen":[699,1045,1716,1175,98]}
  - Bilder: `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c/k3/bilder-funktionsliste-wdh/F-08-igmg-390.jpg`, `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c/k3/bilder-funktionsliste-wdh/F-08-390-ende.jpg`
- 1440 px: **nicht erfüllt** · Formular-POSTs: 0 · HTTP ≥ 400: keine
  - erfüllt · /ueber-uns: 200, H1, Inhalt · {"status":200,"h1":"Über uns","zeichen":3414}
  - nicht erfüllt · /projekte: 200, H1, Inhalt · {"status":200,"h1":"Neue Fatih-Moschee ist eröffnet","zeichen":1478}
  - erfüllt · /vorstand: 200, H1, Inhalt · {"status":200,"h1":"Unser Vorstand","zeichen":3795}
  - erfüllt · /igmg: 200, H1, Inhalt · {"status":200,"h1":"IGMG - Islamische Gemeinschaft Millî Görüş","zeichen":829}
  - erfüllt · /igmg: Tabs zeigen Inhalt · {"tabs":5,"zeichen":[699,1045,1716,1175,98]}
  - Bilder: `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c/k3/bilder-funktionsliste-wdh/F-08-igmg-1440.jpg`, `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c/k3/bilder-funktionsliste-wdh/F-08-1440-ende.jpg`

Technische Fehler des Werkzeugs: 1.
