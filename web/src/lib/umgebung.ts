import { z } from 'zod';

/**
 * Umgebungsprüfung (K-13, V-03). Beschreibt jede Umgebungsvariable der App typisiert (Zweck, Pflicht je Betriebsart,
 * Bereich auf Vercel, Herkunft, Prüfregel) und leitet Betriebsart und öffentliche Adresse ab.
 *
 * Reine Funktionen ohne Seiteneffekte: Der Aufrufer übergibt das Umgebungsobjekt (process.env oder eine Testkopie).
 * Kein `server-only`, weil die CLI (scripts/, Startklar-Cockpit) dasselbe Modul lädt.
 * Geheimniswerte erscheinen weder in Befunden noch in Meldungen.
 */

export const BETRIEBSARTEN = ['entwicklung', 'vorschau', 'produktion'] as const;
export type Betriebsart = (typeof BETRIEBSARTEN)[number];

export const BEREICHE = ['Production', 'Preview', 'Development'] as const;
export type Bereich = (typeof BEREICHE)[number];

export type UmgebungsWerte = Readonly<Record<string, string | undefined>>;
export type Schwere = 'fehler' | 'warnung' | 'hinweis';
export type Befund = { variable: string; schwere: Schwere; meldung: string };
export type Pruefergebnis = { betriebsart: Betriebsart; befunde: Befund[] };

export type Variable = {
  /** Name. Muster mit `<ID>` (EINGANG_SCHLUESSEL_ALT_<ID>) gelten für alle Namen mit diesem Präfix. */
  name: string;
  zweck: string;
  muster: boolean;
  /** Fehlt der Wert in dieser Betriebsart, ist das ein Fehler – sofern die Variable gilt. */
  pflicht: Record<Betriebsart, boolean>;
  /** Abhängigkeit: die Variable gilt nur, wenn die Funktion `true` liefert. */
  gilt?: (env: UmgebungsWerte) => boolean;
  /** Ist die Variable Pflicht, muss der Wert genau dieser sein (PROXY_VERTRAUEN=1). */
  pflichtWert?: string;
  /** Vercel-Bereiche, in denen die Variable gesetzt wird. Leer: nur Docker, lokal oder ein Skript. */
  bereich: readonly Bereich[];
  beispiel: string;
  herkunft: string;
  geheim: boolean;
  /** Erzeugt `pnpm geheimnisse:erzeugen` (scripts/geheimnisse-erzeugen.mjs). */
  erzeugbar: boolean;
  pruefung: z.ZodType<string>;
  /** Regel in Worten, für Meldungen. */
  regel: string;
  /** Abhilfe in Worten, für Meldungen. */
  abhilfe: string;
};

/** Anzahl Bytes eines Base64-Textes mit Auffüllung. */
function base64Bytes(text: string): number {
  const auffuellung = text.endsWith('==') ? 2 : text.endsWith('=') ? 1 : 0;
  return (text.length * 3) / 4 - auffuellung;
}

/** http- oder https-Adresse mit Host; localhost und IP-Adressen sind erlaubt (z. B. lokal und im Docker-Betrieb). */
const httpUrl = z.string().refine((text) => {
  try {
    const url = new URL(text);
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname !== '';
  } catch {
    return false;
  }
});
const geheimnis = z.string().min(32);
const schluessel32 = z.base64().refine((text) => base64Bytes(text) === 32);
const hostname = z.string().regex(/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i);
const port = z
  .string()
  .regex(/^\d{1,5}$/)
  .refine((text) => Number(text) >= 1 && Number(text) <= 65535);
const nichtLeer = z.string().min(1);
const mailAdresse = z.string().regex(/^(?:[^<>]*<[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+>|[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+)$/);
const postgresUrl = z.string().regex(/^postgres(?:ql)?:\/\/\S+$/);
const nullEins = z.enum(['0', '1']);

const GEHEIM_ABHILFE = 'Mit `pnpm geheimnisse:erzeugen` erzeugen und in Vercel eintragen.';
const ALLE: readonly Bereich[] = ['Production', 'Preview', 'Development'];

/** Pflicht je Betriebsart (entwicklung, vorschau, produktion). */
function je(entwicklung: boolean, vorschau: boolean, produktion: boolean): Record<Betriebsart, boolean> {
  return { entwicklung, vorschau, produktion };
}
const NIE = je(false, false, false);
const NUR_PRODUKTION = je(false, false, true);
/** Vorschau und Produktion laufen mit NODE_ENV=production und brauchen dieselben Geheimnisse. */
const BETRIEB = je(false, true, true);

/** Vorgabe der App für den Speicher, wenn SPEICHER fehlt (src/lib/storage/index.ts). */
function speicherArt(env: UmgebungsWerte): string {
  return gesetzt(env, 'SPEICHER') ?? 'dateisystem';
}

/** Spiegelt src/lib/mail/transport.ts: smtp mit Angabe; ohne Angabe im Betrieb und mit SMTP_HOST lokal. */
function smtpAktiv(env: UmgebungsWerte): boolean {
  const transport = gesetzt(env, 'MAIL_TRANSPORT');
  if (transport === 'smtp') return true;
  if (transport === 'datei') return false;
  return betriebsart(env) !== 'entwicklung' || gesetzt(env, 'SMTP_HOST') !== undefined;
}

/** Leer gilt als nicht gesetzt. */
function gesetzt(env: UmgebungsWerte, name: string): string | undefined {
  const wert = env[name];
  return wert === undefined || wert === '' ? undefined : wert;
}

export const VARIABLEN: readonly Variable[] = [
  {
    name: 'APP_URL',
    zweck: 'Öffentliche Adresse der Website; Grundlage für Links in Mails, Metadaten und Sicherheitsheader',
    muster: false,
    pflicht: NUR_PRODUKTION,
    bereich: ['Production', 'Preview'],
    beispiel: 'https://<domain der Gemeinde>',
    herkunft: 'Von Menschen eingetragen (Domain, BETRIEB.md 2). In der Vorschau entfällt sie: Die Adresse kommt aus VERCEL_BRANCH_URL.',
    geheim: false,
    erzeugbar: false,
    pruefung: httpUrl,
    regel: 'eine http- oder https-Adresse, in Produktion und Vorschau https',
    abhilfe: 'Die öffentliche Adresse mit https:// eintragen, z. B. https://<domain>.',
  },
  {
    name: 'BETTER_AUTH_URL',
    zweck: 'Adresse der Anmeldung (Better Auth); fehlt sie, gilt APP_URL',
    muster: false,
    pflicht: NIE,
    bereich: ['Production', 'Preview'],
    beispiel: 'https://<domain der Gemeinde>',
    herkunft: 'Von Menschen eingetragen; gleich APP_URL halten',
    geheim: false,
    erzeugbar: false,
    pruefung: httpUrl,
    regel: 'eine http- oder https-Adresse',
    abhilfe: 'Die öffentliche Adresse eintragen oder die Variable weglassen.',
  },
  {
    name: 'BETTER_AUTH_SECRET',
    zweck: 'Schlüssel für Sitzungen und Anmeldung (Better Auth)',
    muster: false,
    pflicht: BETRIEB,
    bereich: ['Production', 'Preview'],
    beispiel: '<mindestens 32 Zeichen, nie ein echter Wert im Repository>',
    herkunft: 'pnpm geheimnisse:erzeugen',
    geheim: true,
    erzeugbar: true,
    pruefung: geheimnis,
    regel: 'mindestens 32 Zeichen',
    abhilfe: GEHEIM_ABHILFE,
  },
  {
    name: 'DATABASE_URL',
    zweck: 'PostgreSQL-Verbindung für Inhalte, Konten, Eingänge und Audit',
    muster: false,
    pflicht: BETRIEB,
    bereich: ['Production', 'Preview'],
    beispiel: 'postgres://<nutzer>:<…>@<host>:5432/<datenbank>',
    herkunft: 'Vercel Marketplace (Neon, Frankfurt). Die Vorschau nutzt einen Neon-Branch, nie die Produktionsdatenbank (V-04).',
    geheim: true,
    erzeugbar: false,
    pruefung: postgresUrl,
    regel: 'beginnt mit postgres:// oder postgresql://',
    abhilfe: 'Die Verbindungs-URL des Datenbankanbieters eintragen.',
  },
  {
    name: 'DATABASE_URL_UNPOOLED',
    zweck: 'Direkte PostgreSQL-Verbindung ohne Pooler, nur für die Migration im Bau (Sitzungssperre, ADR 0019)',
    muster: false,
    pflicht: NIE,
    gilt: (env) => gesetzt(env, 'DATABASE_URL') !== undefined,
    bereich: ['Production', 'Preview'],
    beispiel: 'postgres://<nutzer>:<…>@<host ohne -pooler>/<datenbank>',
    herkunft: 'Vercel Marketplace (Neon) setzt sie zusammen mit DATABASE_URL',
    geheim: true,
    erzeugbar: false,
    pruefung: postgresUrl,
    regel: 'beginnt mit postgres:// oder postgresql://',
    abhilfe: 'Die direkte Verbindungs-URL des Datenbankanbieters eintragen (ohne Pooler).',
  },
  {
    name: 'PGLITE_VERZEICHNIS',
    zweck: 'Datenordner der eingebetteten Datenbank (PGlite); nur ohne DATABASE_URL',
    muster: false,
    pflicht: NIE,
    gilt: (env) => gesetzt(env, 'DATABASE_URL') === undefined,
    bereich: ['Development'],
    beispiel: '.pglite',
    herkunft: 'Lokal (Standard .pglite) für Entwicklung und Tests',
    geheim: false,
    erzeugbar: false,
    pruefung: nichtLeer,
    regel: 'ein Ordnername',
    abhilfe: 'Weglassen oder einen Ordnernamen wie .pglite eintragen.',
  },
  {
    name: 'BAU_PGLITE',
    zweck: 'Erlaubt den Bau ohne Produktionsdatenbank (vorgerenderte Seiten, ADR 0017)',
    muster: false,
    pflicht: NIE,
    bereich: [],
    beispiel: '1',
    herkunft: 'Setzt das Skript vercel-build in package.json selbst; nicht in Vercel eintragen',
    geheim: false,
    erzeugbar: false,
    pruefung: z.literal('1'),
    regel: 'nur 1',
    abhilfe: 'Nicht von Hand setzen; das Bauskript setzt 1.',
  },
  {
    name: 'MIGRATION_BEIM_START',
    zweck: 'Wendet beim Start der App die Migrationen an',
    muster: false,
    pflicht: NIE,
    bereich: [],
    beispiel: '1',
    herkunft: 'Docker-Image setzt 1. Auf Vercel nicht setzen (BETRIEB.md 9)',
    geheim: false,
    erzeugbar: false,
    pruefung: nullEins,
    regel: '0 oder 1',
    abhilfe: 'Auf 1 nur im Docker-Betrieb; auf Vercel weglassen.',
  },
  {
    name: 'MIGRATIONEN_VERZEICHNIS',
    zweck: 'Ordner mit den Migrationsdateien, wenn er vom Standard abweicht',
    muster: false,
    pflicht: NIE,
    bereich: [],
    beispiel: '/app/drizzle/migrations',
    herkunft: 'Docker-Image; sonst nicht setzen',
    geheim: false,
    erzeugbar: false,
    pruefung: nichtLeer,
    regel: 'ein Ordnername',
    abhilfe: 'Weglassen oder den Ordner eintragen.',
  },
  {
    name: 'CACHE_ERNEUERN_BEIM_START',
    zweck: 'Lässt beim Start die vorgerenderten Inhalte verfallen (ADR 0017)',
    muster: false,
    pflicht: NIE,
    bereich: [],
    beispiel: '0',
    herkunft: 'Docker-Image und .env.example. Auf Vercel nicht setzen (BETRIEB.md 9)',
    geheim: false,
    erzeugbar: false,
    pruefung: nullEins,
    regel: '0 oder 1',
    abhilfe: 'Auf 0 setzen oder weglassen.',
  },
  {
    name: 'EINGANG_SCHLUESSEL',
    zweck: 'AES-256-Schlüssel für die verschlüsselten Formulareingänge',
    muster: false,
    pflicht: BETRIEB,
    bereich: ['Production', 'Preview'],
    beispiel: '<32 Byte als Base64, 44 Zeichen, nie ein echter Wert im Repository>',
    herkunft: 'pnpm geheimnisse:erzeugen. Getrennt vom Datenbank-Backup sichern (BETRIEB.md 3)',
    geheim: true,
    erzeugbar: true,
    pruefung: schluessel32,
    regel: 'genau 32 Byte als Base64',
    abhilfe: GEHEIM_ABHILFE,
  },
  {
    name: 'EINGANG_SCHLUESSEL_ID',
    zweck: 'Kennung des aktuellen Eingangsschlüssels (für die Rotation)',
    muster: false,
    pflicht: NIE,
    bereich: ['Production', 'Preview'],
    beispiel: '1',
    herkunft: 'Von Menschen; Standard 1, bei einer Rotation hochzählen',
    geheim: false,
    erzeugbar: false,
    pruefung: z.string().regex(/^[1-9]\d{0,8}$/),
    regel: 'eine positive ganze Zahl',
    abhilfe: 'Auf 1 lassen oder bei einer Schlüsselrotation hochzählen.',
  },
  {
    name: 'EINGANG_SCHLUESSEL_ALT_<ID>',
    zweck: 'Alter Eingangsschlüssel bei einer Rotation, damit ältere Eingänge lesbar bleiben',
    muster: true,
    pflicht: NIE,
    bereich: ['Production'],
    beispiel: '<32 Byte als Base64, nie ein echter Wert im Repository>',
    herkunft: 'Nur bei einer Schlüsselrotation; der bisherige Schlüssel bleibt zum Lesen',
    geheim: true,
    erzeugbar: false,
    pruefung: schluessel32,
    regel: 'genau 32 Byte als Base64',
    abhilfe: 'Den bisherigen Schlüssel eintragen oder die Variable weglassen.',
  },
  {
    name: 'RATE_GEHEIMNIS',
    zweck: 'Geheimnis für den IP-Hash der Ratenbegrenzung (die IP steht nie im Klartext)',
    muster: false,
    pflicht: BETRIEB,
    bereich: ['Production', 'Preview'],
    beispiel: '<mindestens 32 Zeichen, nie ein echter Wert im Repository>',
    herkunft: 'pnpm geheimnisse:erzeugen',
    geheim: true,
    erzeugbar: true,
    pruefung: geheimnis,
    regel: 'mindestens 32 Zeichen',
    abhilfe: GEHEIM_ABHILFE,
  },
  {
    name: 'ALTCHA_GEHEIMNIS',
    zweck: 'Geheimnis für die signierten ALTCHA-Aufgaben (Spam-Schutz der Formulare)',
    muster: false,
    pflicht: BETRIEB,
    bereich: ['Production', 'Preview'],
    beispiel: '<mindestens 32 Zeichen, nie ein echter Wert im Repository>',
    herkunft: 'pnpm geheimnisse:erzeugen',
    geheim: true,
    erzeugbar: true,
    pruefung: geheimnis,
    regel: 'mindestens 32 Zeichen',
    abhilfe: GEHEIM_ABHILFE,
  },
  {
    name: 'WARTUNG_TOKEN',
    zweck: 'Zugang zu den Wartungsrouten (POST, Bearer-Token), z. B. Cache-Erneuerung',
    muster: false,
    pflicht: BETRIEB,
    bereich: ['Production', 'Preview'],
    beispiel: '<mindestens 32 Zeichen, nie ein echter Wert im Repository>',
    herkunft: 'pnpm geheimnisse:erzeugen (64 Zeichen, URL-sicher)',
    geheim: true,
    erzeugbar: true,
    pruefung: geheimnis,
    regel: 'mindestens 32 Zeichen',
    abhilfe: GEHEIM_ABHILFE,
  },
  {
    name: 'CRON_SECRET',
    zweck: 'Schutz der Cron-Aufrufe; Vercel Cron schickt ihn als Bearer-Token mit',
    muster: false,
    pflicht: NUR_PRODUKTION,
    // Nur dort, wo Vercel Cron läuft. Docker-Betrieb ruft die Aufgaben von außen auf (BETRIEB.md 9).
    gilt: (env) => env.VERCEL === '1',
    bereich: ['Production'],
    beispiel: '<mindestens 32 Zeichen, nie ein echter Wert im Repository>',
    herkunft: 'pnpm geheimnisse:erzeugen. Vercel Cron nutzt den Wert selbst (V-06)',
    geheim: true,
    erzeugbar: true,
    pruefung: geheimnis,
    regel: 'mindestens 32 Zeichen',
    abhilfe: GEHEIM_ABHILFE,
  },
  {
    name: 'VAPID_PRIVAT',
    zweck: 'Geheimer Schlüssel für Web Push (VAPID, ADR 0034); der öffentliche Schlüssel wird daraus berechnet',
    muster: false,
    pflicht: NIE,
    bereich: ['Production', 'Preview'],
    beispiel: '<32 Byte base64url, 43 Zeichen, nie ein echter Wert im Repository>',
    herkunft: 'pnpm geheimnisse:erzeugen. Erst setzen, wenn Push freigegeben ist (MENSCHEN MN-17); ohne Wert bleibt Push aus',
    geheim: true,
    erzeugbar: true,
    pruefung: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
    regel: 'genau 32 Byte als base64url (43 Zeichen)',
    abhilfe: GEHEIM_ABHILFE,
  },
  {
    name: 'VAPID_KONTAKT',
    zweck: 'Kontakt für die Push-Dienste (VAPID „sub“): mailto:-Adresse oder https-Seite der Gemeinde',
    muster: false,
    pflicht: NIE,
    gilt: (env) => gesetzt(env, 'VAPID_PRIVAT') !== undefined,
    bereich: ['Production', 'Preview'],
    beispiel: 'mailto:technik@<domain der Gemeinde>',
    herkunft: 'Von Menschen (Technik-Postfach), zusammen mit VAPID_PRIVAT',
    geheim: false,
    erzeugbar: false,
    pruefung: z.string().regex(/^(mailto:\S+@\S+|https:\/\/\S+)$/),
    regel: 'mailto:-Adresse oder https-Adresse',
    abhilfe: 'Technik-Postfach als mailto: eintragen.',
  },
  {
    name: 'ECHTZEIT_URL',
    zweck: 'WebSocket-Adresse des Echtzeit-Signals auf dem lokalen Server (Centrifugo, ADR 0027); ohne Wert gilt der Abruf',
    muster: false,
    pflicht: NIE,
    bereich: ['Production', 'Preview'],
    beispiel: 'wss://echtzeit.<domain der Gemeinde>/connection/websocket',
    herkunft: 'Von Menschen nach Einrichtung des Profils „echtzeit“ (betrieb/lokal/LIESMICH.md, MN-12)',
    geheim: false,
    erzeugbar: false,
    pruefung: z.string().regex(/^wss:\/\/\S+$/),
    regel: 'wss://-Adresse',
    abhilfe: 'Adresse des lokalen Servers eintragen oder leer lassen (Abruf).',
  },
  {
    name: 'ECHTZEIT_API_URL',
    zweck: 'HTTP-Schnittstelle von Centrifugo für das Signal „Kanal hat Neues“',
    muster: false,
    pflicht: NIE,
    gilt: (env) => gesetzt(env, 'ECHTZEIT_URL') !== undefined,
    bereich: ['Production', 'Preview'],
    beispiel: 'https://echtzeit.<domain der Gemeinde>/api',
    herkunft: 'Von Menschen, zusammen mit ECHTZEIT_URL',
    geheim: false,
    erzeugbar: false,
    pruefung: z.string().regex(/^https:\/\/\S+$/),
    regel: 'https://-Adresse',
    abhilfe: 'Adresse der Centrifugo-Schnittstelle eintragen.',
  },
  {
    name: 'ECHTZEIT_GEHEIMNIS',
    zweck: 'HMAC-Schlüssel für die Echtzeit-Tokens (gleich CENTRIFUGO_CLIENT_TOKEN_HMAC_SECRET_KEY auf dem lokalen Server)',
    muster: false,
    pflicht: NIE,
    gilt: (env) => gesetzt(env, 'ECHTZEIT_URL') !== undefined,
    bereich: ['Production', 'Preview'],
    beispiel: '<mindestens 32 Zeichen, nie ein echter Wert im Repository>',
    herkunft: 'pnpm geheimnisse:erzeugen; derselbe Wert in betrieb/lokal/.env',
    geheim: true,
    erzeugbar: true,
    pruefung: geheimnis,
    regel: 'mindestens 32 Zeichen',
    abhilfe: GEHEIM_ABHILFE,
  },
  {
    name: 'ECHTZEIT_API_SCHLUESSEL',
    zweck: 'Schlüssel der Centrifugo-Schnittstelle (gleich CENTRIFUGO_HTTP_API_KEY auf dem lokalen Server)',
    muster: false,
    pflicht: NIE,
    gilt: (env) => gesetzt(env, 'ECHTZEIT_URL') !== undefined,
    bereich: ['Production', 'Preview'],
    beispiel: '<mindestens 32 Zeichen, nie ein echter Wert im Repository>',
    herkunft: 'pnpm geheimnisse:erzeugen; derselbe Wert in betrieb/lokal/.env',
    geheim: true,
    erzeugbar: true,
    pruefung: geheimnis,
    regel: 'mindestens 32 Zeichen',
    abhilfe: GEHEIM_ABHILFE,
  },
  {
    name: 'SITE_MODE',
    zweck: 'Betriebsart: entwicklung, vorschau oder produktion; leer: aus VERCEL_ENV bzw. NODE_ENV',
    muster: false,
    pflicht: NIE,
    bereich: ['Production', 'Preview', 'Development'],
    beispiel: 'vorschau',
    herkunft: 'Von Menschen je Vercel-Bereich: Vorschau = vorschau, Produktion = produktion',
    geheim: false,
    erzeugbar: false,
    pruefung: z.enum(BETRIEBSARTEN),
    regel: 'entwicklung, vorschau oder produktion',
    abhilfe: 'Einen der drei Werte eintragen oder die Variable weglassen.',
  },
  {
    name: 'MAIL_TRANSPORT',
    zweck: 'Mailweg: smtp (echter Dienst) oder datei (nur lokal)',
    muster: false,
    pflicht: BETRIEB,
    bereich: ['Production', 'Preview'],
    beispiel: 'smtp',
    herkunft: 'Von Menschen; im Betrieb immer smtp',
    geheim: false,
    erzeugbar: false,
    pruefung: z.enum(['smtp', 'datei']),
    regel: 'smtp oder datei',
    abhilfe: 'Auf smtp setzen; datei gibt es nur lokal.',
  },
  {
    name: 'MAIL_ABSENDER',
    zweck: 'Absenderadresse der Mails, optional mit Anzeigename',
    muster: false,
    pflicht: NUR_PRODUKTION,
    bereich: ['Production', 'Preview'],
    beispiel: 'IGMG Wetzlar <noreply@<domain der Gemeinde>>',
    herkunft: 'Von Menschen; die Domain braucht SPF, DKIM und DMARC (MENSCHEN.md)',
    geheim: false,
    erzeugbar: false,
    pruefung: mailAdresse,
    regel: 'eine E-Mail-Adresse, optional mit Anzeigename',
    abhilfe: 'Eine Absenderadresse der eigenen Domain eintragen.',
  },
  {
    name: 'SMTP_HOST',
    zweck: 'Mailserver (SMTP)',
    muster: false,
    pflicht: BETRIEB,
    gilt: smtpAktiv,
    bereich: ['Production', 'Preview'],
    beispiel: '<smtp-host des Mailanbieters>',
    herkunft: 'Mailanbieter; lokal Mailpit (localhost)',
    geheim: false,
    erzeugbar: false,
    pruefung: nichtLeer,
    regel: 'ein Hostname oder eine IP',
    abhilfe: 'Den Hostnamen des Mailanbieters eintragen.',
  },
  {
    name: 'SMTP_PORT',
    zweck: 'Port des Mailservers',
    muster: false,
    pflicht: NIE,
    gilt: smtpAktiv,
    bereich: ['Production', 'Preview'],
    beispiel: '587',
    herkunft: 'Mailanbieter (587 mit STARTTLS, 465 mit TLS); Standard 587',
    geheim: false,
    erzeugbar: false,
    pruefung: port,
    regel: 'eine Zahl von 1 bis 65535',
    abhilfe: 'Den Port des Mailanbieters eintragen oder weglassen.',
  },
  {
    name: 'SMTP_SECURE',
    zweck: 'TLS direkt beim Verbindungsaufbau (true nur bei Port 465)',
    muster: false,
    pflicht: NIE,
    gilt: smtpAktiv,
    bereich: ['Production', 'Preview'],
    beispiel: 'false',
    herkunft: 'Mailanbieter',
    geheim: false,
    erzeugbar: false,
    pruefung: z.enum(['true', 'false']),
    regel: 'true oder false',
    abhilfe: 'Auf false setzen, außer der Anbieter verlangt Port 465.',
  },
  {
    name: 'SMTP_USER',
    zweck: 'Benutzername für den Mailversand',
    muster: false,
    pflicht: NIE,
    gilt: smtpAktiv,
    bereich: ['Production', 'Preview'],
    beispiel: '<Benutzername des Postfachs>',
    herkunft: 'Mailanbieter',
    geheim: false,
    erzeugbar: false,
    pruefung: nichtLeer,
    regel: 'nicht leer',
    abhilfe: 'Den Benutzernamen des Postfachs eintragen oder weglassen.',
  },
  {
    name: 'SMTP_PASS',
    zweck: 'Passwort für den Mailversand (mit SMTP_USER)',
    muster: false,
    pflicht: BETRIEB,
    gilt: (env) => smtpAktiv(env) && gesetzt(env, 'SMTP_USER') !== undefined,
    bereich: ['Production', 'Preview'],
    beispiel: '<Passwort des Postfachs>',
    herkunft: 'Mailanbieter (vom Anbieter vergeben, nicht erzeugbar)',
    geheim: true,
    erzeugbar: false,
    pruefung: nichtLeer,
    regel: 'nicht leer',
    abhilfe: 'Das Passwort des Postfachs aus dem Konto des Mailanbieters eintragen.',
  },
  {
    name: 'SPEICHER',
    zweck: 'Ablage der Medien: dateisystem (lokal, Docker), s3 oder blob (Vercel Blob, ADR 0020)',
    muster: false,
    pflicht: NIE,
    bereich: ['Production', 'Preview'],
    beispiel: 'blob',
    herkunft: 'Von Menschen; auf Vercel blob (das Dateisystem ist schreibgeschützt). Fehlt die Variable, gilt dateisystem',
    geheim: false,
    erzeugbar: false,
    pruefung: z.enum(['dateisystem', 's3', 'blob']),
    regel: 'dateisystem, s3 oder blob',
    abhilfe: 'dateisystem (lokal, Docker), s3 oder blob eintragen.',
  },
  {
    name: 'MEDIEN_VERZEICHNIS',
    zweck: 'Ordner für hochgeladene Medien im Dateisystem',
    muster: false,
    pflicht: NIE,
    gilt: (env) => speicherArt(env) === 'dateisystem',
    bereich: [],
    beispiel: '/app/.medien',
    herkunft: 'Docker-Image und lokal (Standard .medien)',
    geheim: false,
    erzeugbar: false,
    pruefung: nichtLeer,
    regel: 'ein Ordnername',
    abhilfe: 'Weglassen oder einen Ordner eintragen.',
  },
  {
    name: 'S3_ENDPUNKT',
    zweck: 'Adresse eines S3-kompatiblen Speichers (außer AWS)',
    muster: false,
    pflicht: NIE,
    gilt: (env) => speicherArt(env) === 's3',
    bereich: ['Production', 'Preview'],
    beispiel: 'https://<endpunkt des Speicheranbieters>',
    herkunft: 'Speicheranbieter; bei AWS leer lassen',
    geheim: false,
    erzeugbar: false,
    pruefung: httpUrl,
    regel: 'eine http- oder https-Adresse',
    abhilfe: 'Den Endpunkt des Speicheranbieters eintragen oder weglassen.',
  },
  {
    name: 'S3_REGION',
    zweck: 'Region des Speichers; Standard eu-central-1 (Frankfurt)',
    muster: false,
    pflicht: NIE,
    gilt: (env) => speicherArt(env) === 's3',
    bereich: ['Production', 'Preview'],
    beispiel: 'eu-central-1',
    herkunft: 'Speicheranbieter',
    geheim: false,
    erzeugbar: false,
    pruefung: nichtLeer,
    regel: 'nicht leer',
    abhilfe: 'Die Region eintragen (Frankfurt: eu-central-1) oder weglassen.',
  },
  {
    name: 'S3_BUCKET',
    zweck: 'Name des Speicher-Buckets für die Medien',
    muster: false,
    pflicht: BETRIEB,
    gilt: (env) => speicherArt(env) === 's3',
    bereich: ['Production', 'Preview'],
    beispiel: '<bucket-name>',
    herkunft: 'Speicheranbieter (Bucket in der EU)',
    geheim: false,
    erzeugbar: false,
    pruefung: nichtLeer,
    regel: 'nicht leer',
    abhilfe: 'Den Namen des Buckets eintragen.',
  },
  {
    name: 'S3_ZUGANG',
    zweck: 'Zugangsschlüssel (Kennung) für den Speicher',
    muster: false,
    pflicht: BETRIEB,
    gilt: (env) => speicherArt(env) === 's3',
    bereich: ['Production', 'Preview'],
    beispiel: '<Zugangsschlüssel-Kennung>',
    herkunft: 'Speicheranbieter (vom Anbieter vergeben)',
    geheim: true,
    erzeugbar: false,
    pruefung: nichtLeer,
    regel: 'nicht leer',
    abhilfe: 'Den Zugangsschlüssel des Speicheranbieters eintragen.',
  },
  {
    name: 'S3_GEHEIMNIS',
    zweck: 'Geheimer Zugangsschlüssel für den Speicher',
    muster: false,
    pflicht: BETRIEB,
    gilt: (env) => speicherArt(env) === 's3',
    bereich: ['Production', 'Preview'],
    beispiel: '<geheimer Zugangsschlüssel>',
    herkunft: 'Speicheranbieter (vom Anbieter vergeben)',
    geheim: true,
    erzeugbar: false,
    pruefung: nichtLeer,
    regel: 'nicht leer',
    abhilfe: 'Den geheimen Zugangsschlüssel des Speicheranbieters eintragen.',
  },
  {
    name: 'BLOB_READ_WRITE_TOKEN',
    zweck: 'Zugang zu Vercel Blob (SPEICHER=blob, ADR 0020)',
    muster: false,
    pflicht: BETRIEB,
    gilt: (env) => speicherArt(env) === 'blob',
    bereich: ['Production', 'Preview'],
    beispiel: '<von Vercel gesetzt>',
    herkunft: 'Vercel setzt ihn, sobald der Blob-Speicher mit dem Projekt verbunden ist (V-05)',
    geheim: true,
    erzeugbar: false,
    pruefung: nichtLeer,
    regel: 'nicht leer',
    abhilfe: 'Den Blob-Speicher im Vercel-Projekt verbinden; Vercel setzt den Wert dann.',
  },
  {
    name: 'AUDIO_BLOB_READ_WRITE_TOKEN',
    zweck: 'Öffentlicher Blob-Speicher „audio“ für Rezitationen (ADR 0029); ohne ihn liegen sie im allgemeinen Speicher',
    muster: false,
    pflicht: NIE,
    gilt: (env) => speicherArt(env) === 'blob',
    bereich: ['Production', 'Preview'],
    beispiel: '<von Vercel gesetzt>',
    herkunft: 'Vercel, sobald ein zweiter, öffentlicher Blob-Speicher „audio“ (fra1) verbunden ist; Variablenname beim Verbinden anpassen',
    geheim: true,
    erzeugbar: false,
    pruefung: nichtLeer,
    regel: 'nicht leer',
    abhilfe: 'Optional: öffentlichen Blob-Speicher „audio“ verbinden und den Schlüssel unter diesem Namen eintragen.',
  },
  {
    name: 'LERNAPP_BLOB_BASIS',
    zweck: 'Öffentliche Basisadresse des Blob-Speichers „lernapp“ (Audio-Bündel der Lern-App, ADR 0039); ohne sie nur Testbündel',
    muster: false,
    pflicht: NIE,
    bereich: ['Production', 'Preview'],
    beispiel: 'https://<speicher>.public.blob.vercel-storage.com',
    herkunft: 'Von Menschen: Adresse des öffentlichen Blob-Speichers „lernapp“ aus dem Vercel-Dashboard, sobald es Audio gibt',
    geheim: false,
    erzeugbar: false,
    pruefung: httpUrl,
    regel: 'eine http- oder https-Adresse',
    abhilfe: 'Die öffentliche Adresse des Blob-Speichers „lernapp“ eintragen oder weglassen (dann liefert /lern-app/audio nur Testbündel).',
  },
  {
    name: 'LERNAPP_AUDIO_LOKAL',
    zweck: 'Ordner mit lokal gebauten Audio-Bündeln der Lern-App (<sprache>/<datei>.lpa) zum Anhören vor dem Hochladen',
    muster: false,
    pflicht: NIE,
    bereich: [],
    beispiel: '/pfad/zum/scratchpad/lpa',
    herkunft: 'Lokal: Ausgabeordner von pnpm lernapp:audio-manifest (L3-05); nie auf Vercel, nie zusammen mit LERNAPP_BLOB_BASIS',
    geheim: false,
    erzeugbar: false,
    pruefung: nichtLeer,
    regel: 'ein Ordnerpfad',
    abhilfe: 'Weglassen (dann nur Testbündel bzw. Blob) oder den Ausgabeordner der Audio-Kette eintragen.',
  },
  {
    name: 'PROXY_VERTRAUEN',
    zweck: 'Vertraut dem vorgeschalteten Proxy, damit Ratenbegrenzungen die echte Besucheradresse sehen (E-041)',
    muster: false,
    pflicht: BETRIEB,
    pflichtWert: '1',
    bereich: ['Production', 'Preview'],
    beispiel: '1',
    herkunft: 'Von Menschen. Auf Vercel 1, weil Vercel X-Forwarded-For selbst setzt',
    geheim: false,
    erzeugbar: false,
    pruefung: nullEins,
    regel: '0 oder 1',
    abhilfe: 'Auf 1 setzen: Vercel und ein eigener TLS-Proxy setzen X-Forwarded-For (BETRIEB.md 5a).',
  },
  {
    name: 'PORT',
    zweck: 'Port des Servers (Standalone und Docker)',
    muster: false,
    pflicht: NIE,
    bereich: [],
    beispiel: '3000',
    herkunft: 'Lokal und Docker (Standard 3000); auf Vercel nicht nötig',
    geheim: false,
    erzeugbar: false,
    pruefung: port,
    regel: 'eine Zahl von 1 bis 65535',
    abhilfe: 'Den Port eintragen oder weglassen.',
  },
  {
    name: 'HOSTNAME',
    zweck: 'Adresse, auf der der Standalone-Server lauscht',
    muster: false,
    pflicht: NIE,
    bereich: [],
    beispiel: '0.0.0.0',
    herkunft: 'Standalone-Server (Docker, pnpm start:standalone)',
    geheim: false,
    erzeugbar: false,
    pruefung: nichtLeer,
    regel: 'ein Hostname oder eine IP',
    abhilfe: 'Weglassen oder 0.0.0.0 eintragen.',
  },
  {
    name: 'VERCEL',
    zweck: 'Kennzeichen, dass die App auf Vercel läuft',
    muster: false,
    pflicht: NIE,
    bereich: ALLE,
    beispiel: '1',
    herkunft: 'Vercel setzt automatisch (nicht eintragen)',
    geheim: false,
    erzeugbar: false,
    pruefung: nichtLeer,
    regel: 'gesetzt',
    abhilfe: 'Nicht von Hand setzen.',
  },
  {
    name: 'VERCEL_ENV',
    zweck: 'Vercel-Bereich des Deployments; Grundlage der Betriebsart',
    muster: false,
    pflicht: NIE,
    bereich: ALLE,
    beispiel: 'production',
    herkunft: 'Vercel setzt automatisch: production, preview oder development (nicht eintragen)',
    geheim: false,
    erzeugbar: false,
    pruefung: z.enum(['production', 'preview', 'development']),
    regel: 'production, preview oder development',
    abhilfe: 'Nicht von Hand setzen.',
  },
  {
    name: 'VERCEL_URL',
    zweck: 'Adresse dieses Deployments (ohne https://)',
    muster: false,
    pflicht: NIE,
    bereich: ALLE,
    beispiel: '<deployment>.vercel.app',
    herkunft: 'Vercel setzt automatisch (nicht eintragen)',
    geheim: false,
    erzeugbar: false,
    pruefung: hostname,
    regel: 'ein Hostname ohne https://',
    abhilfe: 'Nicht von Hand setzen.',
  },
  {
    name: 'VERCEL_BRANCH_URL',
    zweck: 'Adresse des Branch-Deployments (ohne https://); Grundlage der Vorschau-Adresse',
    muster: false,
    pflicht: NIE,
    bereich: ALLE,
    beispiel: '<branch>-<projekt>.vercel.app',
    herkunft: 'Vercel setzt automatisch (nicht eintragen)',
    geheim: false,
    erzeugbar: false,
    pruefung: hostname,
    regel: 'ein Hostname ohne https://',
    abhilfe: 'Nicht von Hand setzen.',
  },
  {
    name: 'VERCEL_PROJECT_PRODUCTION_URL',
    zweck: 'Produktionsadresse des Vercel-Projekts (ohne https://)',
    muster: false,
    pflicht: NIE,
    bereich: ALLE,
    beispiel: '<projekt>.vercel.app',
    herkunft: 'Vercel setzt automatisch (nicht eintragen)',
    geheim: false,
    erzeugbar: false,
    pruefung: hostname,
    regel: 'ein Hostname ohne https://',
    abhilfe: 'Nicht von Hand setzen.',
  },
];

const VERCEL_BETRIEBSART = new Map<string, Betriebsart>([
  ['production', 'produktion'],
  ['preview', 'vorschau'],
  ['development', 'entwicklung'],
]);

export function istBetriebsart(wert: string | undefined): wert is Betriebsart {
  return wert !== undefined && (BETRIEBSARTEN as readonly string[]).includes(wert);
}

/** Betriebsart: SITE_MODE (wenn gültig), sonst VERCEL_ENV, sonst NODE_ENV. */
export function betriebsart(env: UmgebungsWerte): Betriebsart {
  const gewaehlt = gesetzt(env, 'SITE_MODE');
  if (istBetriebsart(gewaehlt)) return gewaehlt;
  const vercel = gesetzt(env, 'VERCEL_ENV');
  const ausVercel = vercel === undefined ? undefined : VERCEL_BETRIEBSART.get(vercel);
  if (ausVercel !== undefined) return ausVercel;
  return env.NODE_ENV === 'production' ? 'produktion' : 'entwicklung';
}

/** Vercel-Adresse ohne https://: Branch-Adresse, sonst die des Deployments. */
function vercelHost(env: UmgebungsWerte): string | undefined {
  const host = gesetzt(env, 'VERCEL_BRANCH_URL') ?? gesetzt(env, 'VERCEL_URL');
  return host?.replace(/\/+$/, '');
}

/**
 * Produktionsadresse eines Vercel-Projekts ohne https:// (von Vercel gesetzt), nur im Produktions-Deployment auf Vercel
 * (VERCEL_ENV=production – Vercel setzt die Variable auch in Vorschauen, die dürfen sie nie übernehmen). Damit läuft ein
 * frisch importiertes Projekt ohne eingetragene APP_URL (Import ohne Handgriffe); die eigene Domain bleibt APP_URL.
 */
export function vercelProduktionsHost(env: UmgebungsWerte): string | undefined {
  if (env.VERCEL !== '1' || gesetzt(env, 'VERCEL_ENV') !== 'production' || betriebsart(env) !== 'produktion') return undefined;
  return gesetzt(env, 'VERCEL_PROJECT_PRODUCTION_URL')?.replace(/\/+$/, '');
}

/**
 * Öffentliche Adresse ohne abschließenden Schrägstrich: APP_URL; sonst auf Vercel in der Vorschau die Branch-Adresse und in
 * der Produktion die Produktionsadresse des Projekts; sonst localhost.
 */
export function oeffentlicheAdresse(env: UmgebungsWerte): string {
  const adresse = gesetzt(env, 'APP_URL');
  if (adresse !== undefined) return adresse.replace(/\/+$/, '');
  const host = vercelHost(env);
  if (host !== undefined && betriebsart(env) === 'vorschau') return `https://${host}`;
  const produktion = vercelProduktionsHost(env);
  if (produktion !== undefined) return `https://${produktion}`;
  return 'http://localhost:3000';
}

type Melder = (variable: string, schwere: Schwere, meldung: string) => void;

function pruefeVariable(v: Variable, name: string, env: UmgebungsWerte, ba: Betriebsart, melde: Melder): void {
  const wert = gesetzt(env, name);
  const gilt = v.gilt ? v.gilt(env) : true;
  if (!gilt) {
    if (wert !== undefined) melde(name, 'hinweis', `${name} ist gesetzt, wird bei dieser Einstellung aber nicht gelesen.`);
    return;
  }
  if (wert === undefined) {
    // Frisch importiertes Vercel-Projekt: die Produktionsadresse kommt von Vercel – lauffähig, aber die Domain fehlt noch
    const produktion = name === 'APP_URL' ? vercelProduktionsHost(env) : undefined;
    if (produktion !== undefined) {
      // Mit eigener Domain liefert Vercel die kürzeste – das kann eine nur weiterleitende sein; deshalb APP_URL setzen
      melde(
        name,
        'warnung',
        produktion.endsWith('.vercel.app')
          ? `APP_URL fehlt; es gilt die Vercel-Adresse https://${produktion}. Für die eigene Domain APP_URL eintragen.`
          : `APP_URL fehlt; es gilt https://${produktion} (von Vercel gewählt). APP_URL auf die Hauptdomain setzen und neu deployen.`,
      );
      return;
    }
    if (v.pflicht[ba]) melde(name, 'fehler', `${name} fehlt (Betriebsart ${ba}). ${v.abhilfe}`);
    return;
  }
  if (wert.trim() !== wert) {
    melde(
      name,
      'fehler',
      `${name} beginnt oder endet mit einem Leerzeichen bzw. Zeilenumbruch. Den Wert ohne diese Zeichen neu eintragen.`,
    );
    return;
  }
  if (!v.pruefung.safeParse(wert).success) {
    melde(name, 'fehler', `${name} ist ungültig (erwartet: ${v.regel}). ${v.abhilfe}`);
    return;
  }
  if (v.pflichtWert !== undefined && v.pflicht[ba] && wert !== v.pflichtWert) {
    melde(name, 'fehler', `${name} muss ${v.pflichtWert} sein (Betriebsart ${ba}). ${v.abhilfe}`);
  }
}

function urspr(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}

const PLATZHALTER_DOMAIN = /@(?:[^\s>]*\.)?(?:example\.(?:test|com|org)|test|invalid)>?$/i;
const GEHEIM_NAME = /SECRET|TOKEN|PASS|KEY|SCHLUESSEL|GEHEIMNIS/i;

/** Regeln, die mehrere Variablen betreffen oder über das Schema hinausgehen. */
function pruefeZusammenhaenge(env: UmgebungsWerte, ba: Betriebsart, melde: Melder): void {
  const betrieb = ba !== 'entwicklung';
  const aufVercel = env.VERCEL === '1';
  const vercelBetrieb = aufVercel && betrieb;
  const app = gesetzt(env, 'APP_URL');
  const auth = gesetzt(env, 'BETTER_AUTH_URL');
  const speicher = speicherArt(env);
  const site = gesetzt(env, 'SITE_MODE');
  const vercelEnv = gesetzt(env, 'VERCEL_ENV');

  // Adresse: im Betrieb https; localhost nur als Warnung
  if (app !== undefined && betrieb && app.startsWith('http://')) {
    if (/^http:\/\/(localhost|127\.0\.0\.1)([:/]|$)/.test(app)) {
      melde('APP_URL', 'warnung', 'APP_URL zeigt auf localhost. Für den Livebetrieb die https-Adresse eintragen.');
    } else {
      melde(
        'APP_URL',
        'fehler',
        'APP_URL verwendet http://. Im Betrieb https:// eintragen, sonst fehlen HSTS und upgrade-insecure-requests (BETRIEB.md 5b).',
      );
    }
  }
  if (ba === 'vorschau' && app === undefined) {
    if (vercelHost(env) !== undefined) {
      melde('APP_URL', 'hinweis', 'APP_URL fehlt; die Vorschau-Adresse wird aus VERCEL_BRANCH_URL bzw. VERCEL_URL abgeleitet.');
    } else {
      melde(
        'APP_URL',
        'fehler',
        'APP_URL fehlt, und Vercel liefert keine Vorschau-Adresse (VERCEL_BRANCH_URL, VERCEL_URL). APP_URL eintragen.',
      );
    }
  }

  // Anmeldung: Sie folgt oeffentlicheAdresse (lib/auth/optionen.ts); nur ohne jede Adresse zeigt sie auf localhost
  if (ba === 'vorschau' && app === undefined && auth === undefined && vercelHost(env) === undefined) {
    melde(
      'BETTER_AUTH_URL',
      'warnung',
      'Weder BETTER_AUTH_URL noch APP_URL gesetzt, und Vercel liefert keine Vorschau-Adresse: Die Anmeldung zeigt dann auf localhost. Eine Adresse eintragen.',
    );
  }
  if (betrieb && app !== undefined && auth !== undefined && urspr(app) !== urspr(auth)) {
    melde('BETTER_AUTH_URL', 'warnung', 'BETTER_AUTH_URL weicht von APP_URL ab. Anmeldung und Links sollten dieselbe Adresse nutzen.');
  }

  // Mail
  if (betrieb && gesetzt(env, 'MAIL_TRANSPORT') === 'datei') {
    melde('MAIL_TRANSPORT', 'warnung', 'datei ist für die lokale Entwicklung gedacht. Im Betrieb zählt SMTP: MAIL_TRANSPORT=smtp setzen.');
  }
  const absender = gesetzt(env, 'MAIL_ABSENDER');
  if (ba === 'produktion' && absender !== undefined && PLATZHALTER_DOMAIN.test(absender)) {
    melde(
      'MAIL_ABSENDER',
      'fehler',
      'MAIL_ABSENDER verwendet eine Platzhalter-Domain (example.*, .test). Eine Absenderadresse der eigenen Domain eintragen.',
    );
  }

  // Speicher: auf Vercel ist das Dateisystem schreibgeschützt
  if (vercelBetrieb && speicher === 'dateisystem') {
    melde(
      'SPEICHER',
      'fehler',
      'SPEICHER steht auf dateisystem. Auf Vercel ist das Dateisystem schreibgeschützt, Uploads würden scheitern. SPEICHER=blob setzen und Vercel Blob (Frankfurt) verbinden (ADR 0020, docs/deploy/VERCEL.md).',
    );
  }

  // Cron-artige Startläufe gehören nicht auf Vercel (BETRIEB.md 9)
  if (aufVercel) {
    for (const name of ['MIGRATION_BEIM_START', 'CACHE_ERNEUERN_BEIM_START']) {
      if (gesetzt(env, name) === '1') {
        melde(name, 'warnung', `${name}=1 auf Vercel entfernen: Der Lauf passiert bei jedem Kaltstart jeder Instanz (BETRIEB.md 9).`);
      }
    }
  }

  // Betriebsart: SITE_MODE gegen VERCEL_ENV
  if (aufVercel && site === undefined) {
    melde(
      'SITE_MODE',
      'hinweis',
      'SITE_MODE ist nicht gesetzt; die Betriebsart folgt VERCEL_ENV. Für Klarheit je Vercel-Bereich setzen: Vorschau = vorschau, Produktion = produktion.',
    );
  }
  const erwartet = vercelEnv === undefined ? undefined : VERCEL_BETRIEBSART.get(vercelEnv);
  if (site !== undefined && istBetriebsart(site) && erwartet !== undefined && site !== erwartet) {
    melde('SITE_MODE', 'warnung', `SITE_MODE=${site} passt nicht zu VERCEL_ENV=${vercelEnv} (erwartet ${erwartet}). Es gilt SITE_MODE.`);
  }

  // Öffentliche Variablen dürfen keine Geheimnisse tragen. Namen werden gemeldet, Werte nie.
  for (const name of Object.keys(env)) {
    if (name.startsWith('NEXT_PUBLIC_') && GEHEIM_NAME.test(name) && env[name] !== undefined) {
      melde(
        name,
        'fehler',
        `${name} wird an den Browser ausgeliefert, der Name klingt aber nach einem Geheimnis. Geheimnisse ohne NEXT_PUBLIC_-Präfix setzen; ist der Name harmlos, ihn ändern.`,
      );
    }
  }
}

/**
 * Prüft die Umgebung. Liefert die Betriebsart und alle Befunde auf Deutsch, mit Abhilfe.
 * Werte von Geheimnissen erscheinen nie in einer Meldung.
 */
export function pruefeUmgebung(env: UmgebungsWerte): Pruefergebnis {
  const ba = betriebsart(env);
  const befunde: Befund[] = [];
  const melde: Melder = (variable, schwere, meldung) => {
    befunde.push({ variable, schwere, meldung });
  };

  for (const v of VARIABLEN) {
    if (!v.muster) pruefeVariable(v, v.name, env, ba, melde);
  }
  for (const v of VARIABLEN) {
    if (!v.muster) continue;
    const praefix = v.name.split('<ID>')[0];
    for (const name of Object.keys(env)) {
      if (name.startsWith(praefix) && /^\d+$/.test(name.slice(praefix.length))) pruefeVariable(v, name, env, ba, melde);
    }
  }
  pruefeZusammenhaenge(env, ba, melde);

  return { betriebsart: ba, befunde };
}

/** Gibt es mindestens einen Befund der Schwere „fehler“? */
export function hatFehler(ergebnis: Pruefergebnis): boolean {
  return ergebnis.befunde.some((befund) => befund.schwere === 'fehler');
}
