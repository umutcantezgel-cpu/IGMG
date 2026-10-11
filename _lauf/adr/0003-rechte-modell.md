# ADR 0003 – Rechte-Modell

- Status: angenommen · 2026-10-11 · P1 · Kern 1.0 · Bezug: K-06, G-07, Z-04, Z-06 · Grundlage: Lichtung (b)

## Ziel
Fünf Rollen nach K-06 (Administration, Redaktion, Organisationsredaktion je Organisation, Bildung, Mitgliederverwaltung), serverseitig in jeder Route und Server Action geprüft; Zwei-Faktor Pflicht; Konten nur per Einladung; einfach testbar (T3: erlaubte Rolle kommt durch, jede andere wird abgelehnt).

## Wege
1. **Better-Auth-Organization-Plugin** mit `createAccessControl` (vier Organisationen als „organizations“, Rollen je Mitgliedschaft, Einladungen eingebaut).
2. **Better-Auth-Admin-Plugin** (`role`-Spalte, `createUser`, Ban, Impersonation) plus eigene Organisationszuordnung.
3. **Eigene Rollentabelle** `rolle_zuweisung(benutzer_id, rolle, organisation?)` + eigene Einladungstabelle + reine Prüffunktion `darf(benutzer, aktion, ziel)`; Better Auth nur für Anmeldung, Sitzung, 2FA, Passkey.

## Bewertung
- Weg 1 bildet „Organisation“ als Mandanten ab; unsere Organisationen sind aber Inhaltsbereiche derselben Gemeinde. Rollen wie „Bildung“ hängen an keiner Organisation; `acceptInvitation` verlangt ein bestehendes Konto. Passt schlecht.
- Weg 2 bringt Impersonation und Ban mit (zusätzliche Angriffsfläche, Advisory-Historie); eine Rolle je Konto reicht nicht (eine Person kann Redaktion **und** Bildung sein).
- **Weg 3 gewählt:** klein, explizit, vollständig unit-testbar; Lichtung (b) zeigt: Einladung = serverseitiges `signUpEmail`, HTTP-Registrierung per Hook gesperrt.

## Festlegungen
- Tabellen: `rolle_zuweisung(id, benutzer_id → user.id, rolle enum('administration','redaktion','organisationsredaktion','bildung','mitgliederverwaltung'), organisation enum('at','kt','gt','kgt') null, erstellt_von, erstellt_am)`, eindeutig über (benutzer, rolle, organisation); Prüfbedingung: `organisation` genau dann gesetzt, wenn `rolle = 'organisationsredaktion'`.
- `einladung(id, email, rollen jsonb, token_hash, laeuft_ab, angenommen_am, erstellt_von)`; Token 32 Byte zufällig, nur Hash gespeichert, 72 h gültig, einmalig.
- `src/lib/rechte/matrix.ts`: Aktionen als Union (`'veranstaltung.bearbeiten'`, `'eingang.lesen'`, …) und Matrix Rolle → Aktionen; Organisationsredaktion nur mit `ziel.organisation` = eigene.
- `src/lib/rechte/pruefe.ts`: `verlangeSitzung()` (Sitzung + 2FA erfüllt, sonst Umleitung auf Einrichtung), `verlangeRecht(aktion, ziel?)` wirft `KeinRecht` (→ 403/Fehlermeldung ohne Details). **Jede** Server Action und jede Verwaltungsroute ruft das als erste Zeile; der Proxy prüft höchstens optimistisch.
- **2FA-Pflicht:** gilt als erfüllt, wenn `user.twoFactorEnabled` **oder** mindestens ein Passkey vorhanden und die aktuelle Sitzung per Passkey oder mit zweitem Faktor entstand. Ohne Erfüllung ist nur `/verwaltung/zwei-faktor-einrichten` erreichbar.
- Administration kann alles außer Eingänge lesen, für die eine Fachrolle zuständig ist? → **Nein:** Administration darf alles (kleine Gemeinde, Vertretung); jeder Zugriff auf Personendaten erzeugt einen Audit-Eintrag (G-07).
- Erstes Konto: Kommandozeilen-Skript `pnpm verwaltung:einladen --email … --rolle administration` (BETRIEB.md).

## Umkehrprobe
Falsch, wenn die Gemeinde mehrere Moscheen/Mandanten verwalten will (dann Organization-Plugin) oder feingranulare Rechte pro Datensatz braucht. Beides ist nicht beauftragt.

## Folgen zweiter Ordnung
- T3-Integrationstests iterieren über alle Rollen × Aktionen aus der Matrix (generiert, keine Lücken).
- Kein Impersonation-Feature; Support erfolgt über eigene Konten.
- Better-Auth-Rate-Limit mit `storage: 'database'` (mehrere Instanzen möglich).
