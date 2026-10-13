# ADR 0036 – Lokaler-Server-Kit als Helfer neben Vercel

- Status: angenommen (umgesetzt 13.10.2026) (Lauf Gemeinde-Plattform) · Bezug: Plan „Gemeinde-Plattform“ Ziel, §2.9, §3.10 (Anzeige-CMS), §6 (E6, O-S01, H-S01), §7 (Z-20, Risiken), MN-00, MN-12, MN-18, V3, V4

## Kontext

- Der lokale Server der Moschee darf mitgenutzt werden (Auftrag). Die Entscheidung des Nutzers: Er ist ein Helfer neben Vercel für Sicherungen, Anzeige-Kiosk, Takt und optional Echtzeit.
- Der Minutentakt für Push und Zeitplan kommt vom lokalen Server. Ein Vercel-Pro-Cron ist nur nach Entscheidung der Menschen vorgesehen (V4).
- Der Kern muss ohne den Server laufen (Risiko „Lokaler Server fällt aus“).

## Entscheidung

Docker Compose unter `betrieb/lokal/`, mit diesen Diensten:

| Dienst | Aufgabe |
|---|---|
| `sicherung` | täglich `pg_dump` (Neon, Leserolle), mit `age` verschlüsselt, Rotation 30 Tage |
| `medien-spiegel` | Blob-Medien und Audio spiegeln, mit Prüfsummen |
| `wiederherstellungsprobe` | monatlich, mit Meldung ins Cockpit |
| `takt` | jede Minute `/api/wartung/takt` |
| `ueberwachung` | Health-Abfrage, Mail an die Technik bei Ausfall |
| `centrifugo` und `caddy` | Profil `echtzeit` (ADR 0027) |
| `aligner` | Profil `abgleich` (ADR 0029, K-B) |

- **Kiosk:** Mini-PC oder Raspberry Pi mit Chromium im Kiosk-Modus auf `/gebetszeiten/anzeige`. Die Anzeige zeigt Folien, Iqama, Freitagsmodus und Ruhephase. Sie läuft offline weiter (Plan §3.10).
- **Takt:** Standard ist lokal (MN-18).
- **Cockpit:** zeigt den Zustand des Servers. Ohne Server steht er auf Gelb.
- **Menschen-Schritte:** Hardware, Installation und DynDNS (nur für Echtzeit), 3 bis 4 h (MN-12).

## Alternativen

- Alles auf Vercel mit Pro-Cron: als Option für den Takt vorgesehen (MN-18), nicht als Standard.
- Drittanbieter für die Überwachung: verworfen („ohne Drittanbieter“). Die Überwachung läuft lokal und schickt eine Mail an die Technik.
- Ohne lokalen Server: Der Kern bleibt lauffähig. Echtzeit fällt auf den Abruf zurück (ADR 0027), der Takt auf Cron und In-Seite-Erinnerung.

## Folgen

- Tests: `docker compose config` (Z-20). Wiederherstellungstest der Sicherung.
- OFFENE FRAGE: Die Verwahrung des `age`-Schlüssels und die Zugangsdaten der Neon-Leserolle sind im Plan nicht festgelegt. Zuständig ist die Technik mit dem Vorstand.
- Die Sicherung setzt eine Produktionsdatenbank voraus. Die Neon-Vorschau-Datenbank ist MN-00 (Standard: Vorführung lokal).
- Umgebungsausnahme: Centrifugo ohne öffentliche Adresse wird in der Vorschau nicht geprüft.

## Umsetzung (13.10.2026)
- `betrieb/lokal/` (Docker Compose: takt, sicherung inkl. monatlicher Probe, medien-spiegel, ueberwachung, Profil echtzeit),
  Handbuch `betrieb/lokal/LIESMICH.md`, Kiosk `betrieb/lokal/kiosk/KIOSK.md`; Meldungen ans Cockpit `/api/wartung/lokal-meldung`.
