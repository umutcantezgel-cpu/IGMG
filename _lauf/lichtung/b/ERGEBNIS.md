# Lichtung (b) – Better Auth mit Zwei-Faktor läuft lokal · ERGEBNIS: GELUNGEN (2026-10-11)

**Aufbau (Spike, Node 24 mit Type-Stripping, ohne Next.js):** better-auth 1.7.7 · Drizzle-Adapter (`better-auth/adapters/drizzle`) · drizzle-orm 0.45.4 mit `drizzle-orm/pglite` · @electric-sql/pglite 0.5.8 · drizzle-kit 0.31.11 (`driver: 'pglite'`) · otpauth 9.5.2 (nur im Test, erzeugt TOTP-Codes aus der URI).
Schema mit `@better-auth/cli generate` (Tabellen user, session, account, verification, twoFactor), Migration mit `drizzle-kit generate` + `migrate`.

**Ablauf `node ablauf.ts` – Ergebnis:**
| Schritt | Ergebnis |
|---|---|
| 1 Öffentliche Registrierung per HTTP (`/sign-up/email`) | 403 – gesperrt über `hooks.before` (nur wenn `ctx.request` vorhanden) |
| 2 Einladung annehmen = serverseitiger `auth.api.signUpEmail` | Konto angelegt |
| 3 Anmeldung vor 2FA | 200, Sitzung |
| 4 `two-factor/enable` (mit Passwort) → TOTP-URI → Code → `verify-totp` | URI vorhanden, 200, 10 Backup-Codes, `two_factor_enabled = true` |
| 5 Erneute Anmeldung | `twoFactorRedirect: true`, **keine** Sitzung vor dem zweiten Faktor |
| 6 Falscher Code / richtiger Code | 401 / 200, Sitzung gültig |

**Lehren für das Fundament:**
1. „Konten nur per Einladung“ ohne Admin-Plugin: eigene Einladungstabelle (Token-Hash, Rolle, Ablauf) + Server Action ruft `auth.api.signUpEmail` serverseitig; HTTP-Registrierung per Hook gesperrt. Kein Impersonation-Risiko des Admin-Plugins.
2. 2FA-Pflicht ist **keine** eingebaute Option: Die Verwaltung erzwingt sie serverseitig (Sitzung ohne `twoFactorEnabled` bzw. ohne Passkey → nur Seite „Zwei-Faktor einrichten“ erreichbar). Gehört in die Rechteprüfung jeder Route und Server Action.
3. E2E-Test „Anmelden mit Zwei-Faktor“: TOTP-Code im Test aus dem Geheimnis erzeugen (otpauth), nur gegen localhost.
4. **Prüfauftrag Sicherheit:** In Schritt 6 wurde derselbe Code wie in Schritt 4 (gleiches 30-s-Fenster) akzeptiert – Wiederverwendungsschutz für TOTP-Codes prüfen (Sicherheitsprüfer, P2-Tor); bei Bedarf eigene Sperre „zuletzt genutzter Zeitschritt“ je Konto.
5. PGlite + drizzle-kit (`driver: 'pglite'`) funktioniert für Migrationen; Datenverzeichnis je Prozess.
