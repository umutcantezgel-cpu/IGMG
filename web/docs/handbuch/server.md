# Handbuch lokaler Server (Kurzfassung)

Für die Menschen in der Technik der Gemeinde. Die **ausführliche Anleitung** steht in **`betrieb/lokal/LIESMICH.md`** (Einrichtung in etwa 3 Stunden, Wiederherstellung im Ernstfall) und für den Bildschirm im Gebetsraum in **`betrieb/lokal/kiosk/KIOSK.md`**. Diese Seite sagt dir nur, **was der Server tut, was du regelmäßig prüfst und was du bei Problemen machst.**

**Stand:** 13.10.2026 (Aufgabe MN-12). Die Anleitung im Repository ist gebaut und geprüft (`docker compose config`); die Einrichtung im Gemeindehaus ist noch zu tun.

## 1. Wozu der Server da ist

Der Server im Gemeindehaus **hilft** der Website. Er **ersetzt sie nicht**. Die Website läuft bei Vercel in Frankfurt. **Fällt der Server aus, läuft alles Wichtige weiter**: Gebetszeiten, Koran, Anmeldung, Chat (dann per Abruf statt Echtzeit). Das Cockpit zeigt dann **gelb**.

| Dienst | Was er tut | Wann |
| --- | --- | --- |
| **Takt** | stößt Gebetserinnerungen (Push), den Mail-Ausgang und die Löschfristen an | jede Minute, alle 5 Minuten, täglich 03:17 |
| **Sicherung** | sichert die Datenbank (`pg_dump`), verschlüsselt mit `age`, hebt 30 Tage auf | täglich 02:43 |
| **Wiederherstellungsprobe** | spielt die neueste Sicherung probeweise in eine Wegwerf-Datenbank ein | am 1. des Monats, 04:13 |
| **Medienspiegel** | kopiert Bilder, PDF und Audio mit Prüfsummen | täglich 01:37 |
| **Überwachung** | prüft, ob die Website antwortet; Mail an die Technik nach etwa 15 Minuten Ausfall | alle 5 Minuten |
| **Echtzeit** (optional) | meldet im Gruppenchat nur „Kanal hat Neues“, nie Inhalte | Profil `echtzeit` |
| **Anzeige im Gebetsraum** | Mini-PC oder Raspberry Pi mit Chromium im Kiosk-Modus | siehe `kiosk/KIOSK.md` |

## 2. Was du brauchst

- Einen kleinen Rechner mit Docker (Mini-PC oder Raspberry Pi 5 mit SSD), 2 GB RAM, 64 GB Speicher, dauerhaft am Netz.
- In Neon eine **Leserolle** (nur `SELECT`) für die Sicherung.
- Ein **age-Schlüsselpaar**. Der öffentliche Teil kommt in die Einstellungen, der **private Teil gehört dem Vorstand** (Passwortmanager und Papierkopie im Tresor).
- Für Echtzeit zusätzlich eine öffentliche Adresse (DynDNS) und Portfreigabe 80 und 443.
- Einen **abgeschlossenen Raum** für den Server [Ort – Vorstand].

## 3. Einrichtung in Kürze

Alle Befehle und Werte stehen in `betrieb/lokal/LIESMICH.md`. In Kürze:

1. Repository holen, in `betrieb/lokal` wechseln.
2. `.env.beispiel` nach `.env` kopieren, Werte eintragen, Datei **nur für dich lesbar** machen (`chmod 600 .env`).
3. Konfiguration prüfen (`docker compose config`).
4. Starten (`docker compose up -d --build`).
5. Erste Sicherung von Hand auslösen. Im **Cockpit („Startklar“)** muss „Sicherung“ **grün** werden.
6. Probe von Hand auslösen, Ergebnis „Probe ok“.
7. Optional Echtzeit einschalten (nur mit öffentlicher Adresse).

## 4. Was du regelmäßig prüfst

| Wann | Was |
| --- | --- |
| **Täglich** (automatisch) | Mail bei Ausfall; sonst nichts |
| **Wöchentlich** | Cockpit „Startklar“: Sicherung, Probe, Spiegel **grün**? Eine Meldung, die älter als 2 Tage ist, zeigt **gelb** |
| **Monatlich** | Hat die **Wiederherstellungsprobe** „ok“ gemeldet? Ist genug **Speicherplatz** frei (Sicherungen und Spiegel wachsen)? |
| **Vierteljährlich** | Docker-Images und Betriebssystem **aktualisieren**; Stichprobe: eine Sicherung **von Hand** entschlüsseln (mit dem Schlüssel des Vorstands) |
| **Jährlich** | Hardware, Raum, Zugänge, Schlüsselverwahrung **prüfen**; Liste der Personen mit Zugriff aktualisieren |

## 5. Wenn etwas schiefgeht

| Problem | Was du tust |
| --- | --- |
| Mail „Website antwortet nicht“ | Vercel-Status und das letzte Deployment prüfen (Anleitung in `web/docs/BETRIEB.md`). Ist es der Server selbst? Siehe nächste Zeilen |
| Cockpit gelb: Server meldet sich nicht | Läuft der Rechner? Netz? `docker compose ps`; Protokolle: `docker compose logs -f takt sicherung` |
| „Sicherung fehlgeschlagen“ | Platz voll? Neon-Zugang (Leserolle, Passwort) noch gültig? Sicherung von Hand wiederholen |
| „Probe fehlgeschlagen“ | Ist der Schlüssel am richtigen Ort? Datei beschädigt? Neueste Sicherung prüfen; sonst eine ältere nehmen |
| Gebetserinnerungen kommen nicht | Läuft der **Takt**? Ohne Takt gibt es keine Push-Erinnerungen. Die Website selbst bleibt benutzbar |
| Kiosk-Bildschirm schwarz | Siehe `kiosk/KIOSK.md`; Strom, Netz, Energiesparen aus |

**Im Ernstfall wiederherstellen:** Die Schritte stehen in `LIESMICH.md` („Wiederherstellen im Ernstfall“): neueste Datei holen, mit dem privaten Schlüssel des Vorstands entschlüsseln, in eine **neue, leere** Neon-Datenbank einspielen, in Vercel `DATABASE_URL` umstellen. **Danach sofort:** den **Löschlauf** ausführen und **alle Löschanträge, Widerrufe und Austritte seit dem Sicherungsdatum erneut anwenden** (Löschkonzept, Abschnitt 5), damit gelöschte Daten nicht zurückkehren.

**Wichtig:** Der **Anwendungsschlüssel** (`EINGANG_SCHLUESSEL`) liegt **nicht** auf dem Server. Ohne ihn sind Chat-Texte, Daten der Lernenden und Eingänge auch nach einer Wiederherstellung **unlesbar**. Verwahre ihn getrennt und mindestens an zwei Orten.

## 6. Datenschutz-Regeln für den Server

1. **Zugang nur für [Personen der Technik].** Kein Zugang für Unbefugte; der Raum bleibt abgeschlossen.
2. **Der private age-Schlüssel gehört nicht auf den Server**, außer der Vorstand entscheidet es anders (Entscheidung offen, DSFA D-08). Wenn er für die Probe doch dort liegt: Datei nur für dich lesbar (`chmod 600`).
3. **Die Datei `.env`** enthält Zugangsdaten. Nie ins Repository, nie per Mail.
4. **Takt und Überwachung** übertragen keine Personendaten. **Echtzeit** überträgt nur das Signal „Kanal hat Neues“.
5. **Medienspiegel löscht nie.** Widerruft jemand die Einwilligung für ein Foto oder eine Rezitation, **löschst du die Datei im Spiegel von Hand** (und die `.sha256`-Datei dazu) und notierst es (Löschkonzept L-32, Entscheidung D-06).
6. **Sicherungen** laufen nach 30 Tagen von selbst aus. Kopiere sie nicht an andere Orte.
7. **Datenpanne** (Diebstahl, Verlust, unbefugter Zugriff): sofort den Vorstand und die Datenschutzbeauftragte informieren; Meldung an die Aufsichtsbehörde binnen 72 Stunden prüfen [Verfahren – Vorstand/DSB].

## 7. Kontakte

Technik [Name, Telefon] · Vorstand [Name, Telefon] · Datenschutzbeauftragte/r [Angaben] · Mailanbieter [Anbieter, Support].
