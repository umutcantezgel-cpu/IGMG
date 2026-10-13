# Lokaler Helfer-Server der Moschee (ADR 0036)

Der Server im Gemeindehaus **hilft** der Website, er ersetzt sie nicht. Die Website läuft bei Vercel (Frankfurt). Fällt
der lokale Server aus, läuft alles Wichtige weiter: Gebetszeiten, Koran, Anmeldung, Chat (dann per Abruf statt Echtzeit).
Das Startklar-Cockpit zeigt den Zustand (Sicherung, Probe, Spiegel; gelb, wenn eine Meldung älter als 2 Tage ist).

| Dienst | Aufgabe | Wann |
|---|---|---|
| `takt` | stößt Gebetserinnerungen (Push), Mail-Ausgang und Löschfristen an | jede Minute / alle 5 Min. / täglich 03:17 |
| `sicherung` | Datenbank sichern (`pg_dump`, mit `age` verschlüsselt), 30 Tage aufheben | täglich 02:43 |
| `sicherung` (Probe) | neueste Sicherung testweise wiederherstellen | am 1. des Monats 04:13 |
| `medien-spiegel` | Bilder, PDFs und Audio aus Vercel Blob spiegeln, mit Prüfsummen | täglich 01:37 |
| `ueberwachung` | Website-Gesundheit prüfen, Mail an die Technik nach 15 Min. Ausfall | alle 5 Min. |
| `centrifugo` + `caddy` | Echtzeit-Signal für den Gruppenchat (nur „es gibt Neues“, nie Inhalte) | Profil `echtzeit` |

## Was du brauchst (MENSCHEN MN-12)
- Rechner mit Docker (Mini-PC oder Raspberry Pi 5 mit SSD), 2 GB RAM, 64 GB Speicher, dauerhaft am Netz.
- Für die Sicherung: eine **Leserolle** in Neon (nur `SELECT`), siehe `web/docs/BETRIEB.md`.
- Ein **age-Schlüsselpaar**: `age-keygen -o probe.key`. Den öffentlichen Teil (`age1…`) in `.env` als `AGE_EMPFAENGER`;
  den privaten Teil sicher beim Vorstand verwahren (Passwortmanager, Papierkopie im Tresor). Eine Kopie als
  `schluessel/probe.key` (Modus 600) nur, wenn die monatliche Probe auf diesem Server laufen soll.
- Für Echtzeit zusätzlich: öffentliche Adresse (DynDNS) und Portfreigabe 80/443 im Router.

## Einrichtung (≈ 3 Stunden)
1. Repository holen: `git clone … && cd IGMG/betrieb/lokal`
2. `cp .env.beispiel .env`, Werte eintragen (Abschnitte in der Datei). `chmod 600 .env`.
3. `mkdir -p schluessel && chmod 700 schluessel` (optional `probe.key` hinein, `chmod 600`).
4. Prüfen: `docker compose config` (zeigt die fertige Konfiguration, ohne Fehler).
5. Starten: `docker compose up -d --build`. Protokolle: `docker compose logs -f takt sicherung`.
6. Erste Sicherung von Hand: `docker compose exec sicherung sh /sicherung/sichern.sh` → im Cockpit „Sicherung“ grün.
7. Probe von Hand: `docker compose exec sicherung sh /sicherung/probe.sh` → „Probe ok“.
8. Optional Echtzeit: DNS für `ECHTZEIT_DOMAIN` auf die öffentliche Adresse, dann `docker compose --profile echtzeit up -d`.
   In Vercel `ECHTZEIT_URL=wss://<ECHTZEIT_DOMAIN>/connection/websocket` und die beiden Schlüssel setzen; Schalter `echtzeit` an.

## Wiederherstellen im Ernstfall
1. Neueste Datei aus dem Volume holen: `docker compose cp sicherung:/daten/igmg-<datum>.sql.gz.age .`
2. Entschlüsseln (nur mit dem privaten Schlüssel des Vorstands): `age -d -i probe.key igmg-<datum>.sql.gz.age | gunzip > igmg.sql`
3. In eine neue, leere Neon-Datenbank einspielen: `psql "<neue DATABASE_URL>" -f igmg.sql`
4. In Vercel `DATABASE_URL` umstellen und neu ausrollen (VERCEL.md). Medien liegen zusätzlich im Spiegel-Volume.

## Kiosk-Anzeige
Siehe `kiosk/KIOSK.md` (Raspberry Pi mit Chromium im Kiosk-Modus auf `/gebetszeiten/anzeige`).

## Datenschutz
- Die Sicherungen sind verschlüsselt; ohne den privaten age-Schlüssel sind sie unlesbar.
- Takt und Überwachung übertragen keine Personendaten. Echtzeit überträgt nur das Signal „Kanal hat Neues“.
- Eintrag im Verarbeitungsverzeichnis: siehe `web/docs/recht/` (Entwurf, MN-11).
