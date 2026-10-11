# ADR 0017 – Image-Bau ohne Produktionsdatenbank, frische Inhalte beim Start

- Status: angenommen (Prüfung im Durchstich D04) · 2026-10-11 · P2 · Bezug: K-01, K-12, K-19, ADR 0004, Z-04, Z-11

## Ziel

Öffentliche Seiten werden beim Bau statisch vorgerendert (`ensureStatic`, `'use cache'`), dafür braucht `next build` Inhalte aus der Datenbank. Das Docker-Image soll aber reproduzierbar ohne Zugriff auf die Produktionsdatenbank und ohne Netz gebaut werden, und nach jedem Start müssen die echten Inhalte erscheinen.

## Wege

1. **Bau gegen die Produktionsdatenbank** (Build-Argument DATABASE_URL, Netz „host“).
2. **Bau beim Containerstart** (`next build` im Entrypoint, Image enthält Quelltext und Dev-Abhängigkeiten).
3. **Bau gegen eine Bau-Datenbank** (PGlite im Bau-Container, Migrationen + Seeds), danach **beim Start alle Inhalts-Tags verfallen lassen**, sodass die erste Anfrage je Seite aus der echten Datenbank neu rendert.

## Bewertung

Weg 1 koppelt den Bau an Netz und Zugangsdaten (Geheimnis im Build, auf Docker Desktop unzuverlässig). Weg 2 macht jeden Neustart langsam und anfällig (Bau-Fehler erst im Betrieb), das Image ist groß. **Weg 3 gewählt:** reproduzierbarer Bau, kleines standalone-Image, frische Inhalte nach jedem Start.

## Festlegungen

- `src/lib/db` verbindet erst beim ersten Zugriff (Proxy). Mit `BAU_PGLITE=1` ist PGlite auch bei `NODE_ENV=production` erlaubt (nur im Bau-Container).
- Dockerfile-Bau-Stufe: `pnpm db:bau-vorbereiten` (PGlite-Verzeichnis mit allen Migrationen und Seeds), dann `pnpm build` mit `BAU_PGLITE=1`.
- Beim Start ruft das Startskript nach erfolgreichem Health-Check `POST /api/wartung/cache-erneuern` (Bearer `WARTUNG_TOKEN`) auf; die Route ruft `revalidateTag(tag, { expire: 0 })` für alle Tags aus `src/lib/cache/tags.ts`.
- **Prüfauftrag D04:** belegen, dass dadurch auch die beim Bau vorgerenderten Seiten neu entstehen (curl vor/nach Änderung in der echten DB); sonst Weg 2 als Rückfall.

## Umkehrprobe

Falsch, wenn `revalidateTag` die beim Bau erzeugten Routen-Einträge nicht erfasst – dann zeigt eine Seite nach dem Start Seed-Inhalte. Genau das prüft D04; Rückfall ist Weg 2.

## Folgen zweiter Ordnung

- Nach einem Neustart rendert die erste Anfrage je Seite blockierend neu (kurz langsamer).
- Seeds müssen ohne Personendaten auskommen (ADR 0015) – sie landen im Image.
