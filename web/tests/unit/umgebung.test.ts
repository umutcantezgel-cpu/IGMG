import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  betriebsart,
  hatFehler,
  oeffentlicheAdresse,
  pruefeUmgebung,
  VARIABLEN,
  type Befund,
  type Betriebsart,
  type UmgebungsWerte,
} from '@/lib/umgebung';
import { erzeugeWerte, GEHEIMNISSE, pruefeZielPfad, schreibeDatei } from '../../scripts/geheimnisse-erzeugen.mjs';

const WEB = resolve(import.meta.dirname, '../..');
const REPO = resolve(WEB, '..');

// Testwerte: keine literalen Zuweisungen an Geheimnisnamen, damit die Repo-Prüfung nicht anschlägt.
const SCHLUESSEL = Buffer.alloc(32, 7).toString('base64');
const GEHEIM = 'g'.repeat(40);
const KENNWORT = 'k'.repeat(8);
const LECK = ['GEHEIMWERT-ALPHA-4711', 'GEHEIMWERT-BETA-0815', 'GEHEIMWERT-GAMMA-2024'];

/** Vollständige Produktion auf Vercel. */
const PRODUKTION: UmgebungsWerte = {
  NODE_ENV: 'production',
  VERCEL: '1',
  VERCEL_ENV: 'production',
  VERCEL_URL: 'igmg-projekt.vercel.app',
  APP_URL: 'https://www.example.test',
  DATABASE_URL: `postgres://nutzer:${KENNWORT}@db.example.test:5432/igmg`,
  BETTER_AUTH_SECRET: GEHEIM,
  EINGANG_SCHLUESSEL: SCHLUESSEL,
  EINGANG_SCHLUESSEL_ID: '1',
  RATE_GEHEIMNIS: GEHEIM,
  ALTCHA_GEHEIMNIS: GEHEIM,
  WARTUNG_TOKEN: GEHEIM,
  CRON_SECRET: GEHEIM,
  MAIL_TRANSPORT: 'smtp',
  SMTP_HOST: 'smtp.example.test',
  SMTP_USER: 'versand',
  SMTP_PASS: GEHEIM,
  MAIL_ABSENDER: 'IGMG Wetzlar <noreply@beispiel.de>',
  SPEICHER: 's3',
  S3_BUCKET: 'medien',
  S3_ZUGANG: 'zugang',
  S3_GEHEIMNIS: GEHEIM,
  PROXY_VERTRAUEN: '1',
};

/** Vorschau auf Vercel: ohne APP_URL (Adresse aus dem Branch) und ohne CRON_SECRET (nur Produktion). */
const VORSCHAU: UmgebungsWerte = {
  ...PRODUKTION,
  VERCEL_ENV: 'preview',
  APP_URL: undefined,
  CRON_SECRET: undefined,
  MAIL_ABSENDER: undefined,
  VERCEL_BRANCH_URL: 'igmg-git-test.vercel.app',
};

const fehlerNamen = (env: UmgebungsWerte): string[] =>
  pruefeUmgebung(env)
    .befunde.filter((befund) => befund.schwere === 'fehler')
    .map((befund) => befund.variable);

const befundeZu = (env: UmgebungsWerte, variable: string, schwere?: string) =>
  pruefeUmgebung(env).befunde.filter((befund) => befund.variable === variable && (schwere === undefined || befund.schwere === schwere));

const pruefeRegel = (name: string, wert: string): boolean => {
  const variable = VARIABLEN.find((v) => v.name === name);
  if (!variable) throw new Error(`Unbekannte Variable ${name}`);
  return variable.pruefung.safeParse(wert).success;
};

const tmp = mkdtempSync(join(tmpdir(), 'igmg-geheim-'));
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

describe('betriebsart', () => {
  it.each<[string, UmgebungsWerte, Betriebsart]>([
    ['ohne Angaben ist es entwicklung', {}, 'entwicklung'],
    ['NODE_ENV=production ist produktion', { NODE_ENV: 'production' }, 'produktion'],
    ['VERCEL_ENV=production ist produktion', { VERCEL_ENV: 'production' }, 'produktion'],
    ['VERCEL_ENV=preview ist vorschau', { VERCEL_ENV: 'preview' }, 'vorschau'],
    ['VERCEL_ENV=development ist entwicklung', { VERCEL_ENV: 'development', NODE_ENV: 'production' }, 'entwicklung'],
    ['SITE_MODE gewinnt über VERCEL_ENV', { SITE_MODE: 'produktion', VERCEL_ENV: 'preview' }, 'produktion'],
    ['SITE_MODE=vorschau gewinnt über NODE_ENV', { SITE_MODE: 'vorschau', NODE_ENV: 'production' }, 'vorschau'],
    ['ungültiges SITE_MODE wird übergangen', { SITE_MODE: 'quatsch', VERCEL_ENV: 'preview' }, 'vorschau'],
    ['leeres SITE_MODE wird übergangen', { SITE_MODE: '', NODE_ENV: 'production' }, 'produktion'],
    ['unbekanntes VERCEL_ENV fällt auf NODE_ENV zurück', { VERCEL_ENV: 'quatsch', NODE_ENV: 'production' }, 'produktion'],
  ])('%s', (_name, env, erwartet) => {
    expect(betriebsart(env)).toBe(erwartet);
  });
});

describe('oeffentlicheAdresse', () => {
  it('entfernt abschließende Schrägstriche von APP_URL', () => {
    expect(oeffentlicheAdresse({ APP_URL: 'https://www.example.test//' })).toBe('https://www.example.test');
  });

  it('nutzt in der Vorschau ohne APP_URL die Branch-Adresse', () => {
    expect(
      oeffentlicheAdresse({ VERCEL_ENV: 'preview', VERCEL_BRANCH_URL: 'igmg-git-test.vercel.app', VERCEL_URL: 'igmg-abc.vercel.app' }),
    ).toBe('https://igmg-git-test.vercel.app');
  });

  it('fällt in der Vorschau auf VERCEL_URL zurück, wenn es keine Branch-Adresse gibt', () => {
    expect(oeffentlicheAdresse({ VERCEL_ENV: 'preview', VERCEL_URL: 'igmg-abc.vercel.app' })).toBe('https://igmg-abc.vercel.app');
  });

  it('liefert in der Vorschau ohne Vercel-Adresse localhost', () => {
    expect(oeffentlicheAdresse({ VERCEL_ENV: 'preview' })).toBe('http://localhost:3000');
  });

  it('leitet außerhalb der Vorschau nichts aus Vercel ab', () => {
    expect(oeffentlicheAdresse({ NODE_ENV: 'production', VERCEL_BRANCH_URL: 'igmg-git-test.vercel.app' })).toBe('http://localhost:3000');
    expect(oeffentlicheAdresse({})).toBe('http://localhost:3000');
  });

  it('nimmt APP_URL vor allem anderen', () => {
    expect(oeffentlicheAdresse({ VERCEL_ENV: 'preview', VERCEL_URL: 'igmg-abc.vercel.app', APP_URL: 'https://www.example.test' })).toBe(
      'https://www.example.test',
    );
  });
});

describe('Pflicht je Betriebsart', () => {
  it('entwicklung ohne Angaben: keine Befunde', () => {
    expect(pruefeUmgebung({}).befunde).toEqual([]);
  });

  it('produktion ohne Angaben: alle Pflichtwerte fehlen', () => {
    const fehlend = [
      'APP_URL',
      'DATABASE_URL',
      'BETTER_AUTH_SECRET',
      'EINGANG_SCHLUESSEL',
      'RATE_GEHEIMNIS',
      'ALTCHA_GEHEIMNIS',
      'WARTUNG_TOKEN',
      'CRON_SECRET',
      'MAIL_TRANSPORT',
      'MAIL_ABSENDER',
      'PROXY_VERTRAUEN',
    ];
    const leer: UmgebungsWerte = { NODE_ENV: 'production', VERCEL: '1' };
    const fehler = fehlerNamen(leer);
    for (const name of fehlend) expect(fehler, name).toContain(name);
    for (const name of fehlend) {
      const meldung = befundeZu(leer, name, 'fehler')[0]?.meldung ?? '';
      expect(meldung, name).toContain('fehlt');
      expect(meldung, name).toContain('(Betriebsart produktion)');
    }
  });

  it('vollständige Produktion auf Vercel: keine Fehler', () => {
    expect(hatFehler(pruefeUmgebung(PRODUKTION))).toBe(false);
    expect(betriebsart(PRODUKTION)).toBe('produktion');
  });

  it('Vorschau braucht keine APP_URL und keinen CRON_SECRET, meldet aber den Ableitungsweg', () => {
    expect(hatFehler(pruefeUmgebung(VORSCHAU))).toBe(false);
    expect(befundeZu(VORSCHAU, 'APP_URL', 'hinweis')).toHaveLength(1);
  });

  it('Vorschau ohne APP_URL und ohne Vercel-Adresse ist ein Fehler', () => {
    expect(fehlerNamen({ ...VORSCHAU, VERCEL_BRANCH_URL: undefined, VERCEL_URL: undefined })).toContain('APP_URL');
  });

  it('die Vorschau braucht die Geheimnisse der Produktion', () => {
    expect(fehlerNamen({ ...VORSCHAU, BETTER_AUTH_SECRET: undefined })).toContain('BETTER_AUTH_SECRET');
    expect(fehlerNamen({ ...VORSCHAU, PROXY_VERTRAUEN: undefined })).toContain('PROXY_VERTRAUEN');
  });

  it('CRON_SECRET ist nur auf Vercel in der Produktion Pflicht', () => {
    expect(fehlerNamen({ ...PRODUKTION, CRON_SECRET: undefined })).toContain('CRON_SECRET');
    expect(fehlerNamen({ ...VORSCHAU, CRON_SECRET: undefined })).not.toContain('CRON_SECRET');
    // Docker-Produktion ohne Vercel braucht keinen CRON_SECRET; ist er gesetzt, nur ein Hinweis
    const docker = { ...PRODUKTION, VERCEL: undefined, VERCEL_ENV: undefined, SPEICHER: 's3', CRON_SECRET: undefined };
    expect(fehlerNamen(docker)).not.toContain('CRON_SECRET');
    expect(befundeZu({ ...docker, CRON_SECRET: GEHEIM }, 'CRON_SECRET', 'hinweis')).toHaveLength(1);
  });

  it('ein zu kurzes Geheimnis ist ungültig, mit Abhilfe und ohne Wert', () => {
    const befunde = befundeZu({ ...PRODUKTION, BETTER_AUTH_SECRET: LECK[0] }, 'BETTER_AUTH_SECRET', 'fehler');
    expect(befunde).toHaveLength(1);
    expect(befunde[0].meldung).toContain('ungültig');
    expect(befunde[0].meldung).toContain('pnpm geheimnisse:erzeugen');
  });
});

describe('Abhängigkeiten', () => {
  it('SMTP_* gilt nur bei MAIL_TRANSPORT=smtp', () => {
    const datei = { ...PRODUKTION, MAIL_TRANSPORT: 'datei', SMTP_HOST: undefined };
    expect(fehlerNamen(datei)).not.toContain('SMTP_HOST');
    expect(befundeZu(datei, 'MAIL_TRANSPORT', 'warnung')).toHaveLength(1);
    expect(fehlerNamen({ ...PRODUKTION, SMTP_HOST: undefined })).toContain('SMTP_HOST');
  });

  it('ohne MAIL_TRANSPORT gilt im Betrieb SMTP (wie src/lib/mail/transport.ts)', () => {
    const env = { ...PRODUKTION, MAIL_TRANSPORT: undefined, SMTP_HOST: undefined };
    expect(fehlerNamen(env)).toEqual(expect.arrayContaining(['MAIL_TRANSPORT', 'SMTP_HOST']));
  });

  it('lokal mit datei ist ein gesetzter SMTP_HOST nur ein Hinweis', () => {
    const env = { MAIL_TRANSPORT: 'datei', SMTP_HOST: 'localhost' };
    expect(hatFehler(pruefeUmgebung(env))).toBe(false);
    expect(befundeZu(env, 'SMTP_HOST', 'hinweis')).toHaveLength(1);
  });

  it('SMTP_PASS ist nur Pflicht, wenn SMTP_USER gesetzt ist', () => {
    const ohneUser = { ...PRODUKTION, SMTP_USER: undefined, SMTP_PASS: undefined };
    expect(fehlerNamen(ohneUser)).not.toContain('SMTP_PASS');
    expect(fehlerNamen({ ...PRODUKTION, SMTP_PASS: undefined })).toContain('SMTP_PASS');
  });

  it('SMTP_PORT muss eine Portnummer sein', () => {
    expect(fehlerNamen({ ...PRODUKTION, SMTP_PORT: 'abc' })).toContain('SMTP_PORT');
    expect(fehlerNamen({ ...PRODUKTION, SMTP_PORT: '70000' })).toContain('SMTP_PORT');
  });

  it('S3_* ist nur bei SPEICHER=s3 Pflicht', () => {
    const ohneS3 = { ...PRODUKTION, SPEICHER: 's3', S3_BUCKET: undefined, S3_ZUGANG: undefined, S3_GEHEIMNIS: undefined };
    expect(fehlerNamen(ohneS3)).toEqual(expect.arrayContaining(['S3_BUCKET', 'S3_ZUGANG', 'S3_GEHEIMNIS']));
    const dateisystem = { ...PRODUKTION, VERCEL: undefined, SPEICHER: 'dateisystem', S3_BUCKET: undefined, S3_ZUGANG: undefined };
    expect(fehlerNamen(dateisystem)).not.toContain('S3_BUCKET');
    expect(befundeZu({ ...PRODUKTION, SPEICHER: 'dateisystem' }, 'S3_BUCKET', 'hinweis')).toHaveLength(1);
  });

  it('BLOB_READ_WRITE_TOKEN ist nur bei SPEICHER=blob Pflicht', () => {
    const blob = { ...PRODUKTION, SPEICHER: 'blob', S3_BUCKET: undefined, S3_ZUGANG: undefined, S3_GEHEIMNIS: undefined };
    expect(fehlerNamen(blob)).toContain('BLOB_READ_WRITE_TOKEN');
    expect(fehlerNamen({ ...blob, BLOB_READ_WRITE_TOKEN: 'token-wert' })).not.toContain('BLOB_READ_WRITE_TOKEN');
    expect(fehlerNamen({ ...PRODUKTION, BLOB_READ_WRITE_TOKEN: undefined })).not.toContain('BLOB_READ_WRITE_TOKEN');
    expect(befundeZu({ ...PRODUKTION, BLOB_READ_WRITE_TOKEN: 'token-wert' }, 'BLOB_READ_WRITE_TOKEN', 'hinweis')).toHaveLength(1);
  });

  it('SPEICHER=blob ist angebunden (ADR 0020) und braucht nur BLOB_READ_WRITE_TOKEN', () => {
    expect(
      fehlerNamen({ ...PRODUKTION, SPEICHER: 'blob', BLOB_READ_WRITE_TOKEN: 'vercel_blob_rw_beispiel_beispiel_beispiel' }),
    ).not.toContain('SPEICHER');
    expect(fehlerNamen({ ...PRODUKTION, SPEICHER: 'blob', BLOB_READ_WRITE_TOKEN: undefined })).toContain('BLOB_READ_WRITE_TOKEN');
    expect(befundeZu({ NODE_ENV: 'development', SPEICHER: 'blob' }, 'SPEICHER', 'warnung')).toHaveLength(0);
  });
});

describe('Dateisystem und Proxy auf Vercel', () => {
  it('produktion auf Vercel mit dateisystem ist ein Fehler', () => {
    expect(fehlerNamen({ ...PRODUKTION, SPEICHER: undefined, S3_BUCKET: undefined })).toContain('SPEICHER');
  });

  it('die Vorschau auf Vercel mit dateisystem ist ebenfalls ein Fehler', () => {
    expect(fehlerNamen({ ...VORSCHAU, SPEICHER: 'dateisystem' })).toContain('SPEICHER');
  });

  it('vercel dev (entwicklung) und Docker-Produktion ohne Vercel sind kein Fehler', () => {
    expect(fehlerNamen({ VERCEL: '1', VERCEL_ENV: 'development' })).not.toContain('SPEICHER');
    expect(fehlerNamen({ ...PRODUKTION, VERCEL: undefined, VERCEL_ENV: undefined, SPEICHER: undefined })).not.toContain('SPEICHER');
  });

  it('PROXY_VERTRAUEN=1 ist auf Vercel korrekt und ohne Befund', () => {
    expect(befundeZu(PRODUKTION, 'PROXY_VERTRAUEN')).toEqual([]);
  });

  it('PROXY_VERTRAUEN=0 in der Produktion ist ein Fehler', () => {
    const befunde = befundeZu({ ...PRODUKTION, PROXY_VERTRAUEN: '0' }, 'PROXY_VERTRAUEN', 'fehler');
    expect(befunde).toHaveLength(1);
    expect(befunde[0].meldung).toContain('muss 1 sein');
  });

  it('MIGRATION_BEIM_START=1 ist auf Vercel eine Warnung', () => {
    expect(befundeZu({ ...PRODUKTION, MIGRATION_BEIM_START: '1' }, 'MIGRATION_BEIM_START', 'warnung')).toHaveLength(1);
  });
});

describe('Adresse und Prüfregeln', () => {
  it('APP_URL muss im Betrieb https sein', () => {
    expect(fehlerNamen({ ...PRODUKTION, APP_URL: 'http://www.example.test' })).toContain('APP_URL');
    expect(befundeZu({ ...PRODUKTION, APP_URL: 'http://localhost:3000' }, 'APP_URL', 'warnung')).toHaveLength(1);
    expect(fehlerNamen({ NODE_ENV: 'development', APP_URL: 'http://localhost:3000' })).not.toContain('APP_URL');
  });

  it('BETTER_AUTH_URL weicht warnend von APP_URL ab', () => {
    expect(befundeZu({ ...PRODUKTION, BETTER_AUTH_URL: 'https://anderes.example.test' }, 'BETTER_AUTH_URL', 'warnung')).toHaveLength(1);
  });

  it('die Anmeldung in der Vorschau ohne Adresse ist eine Warnung', () => {
    expect(befundeZu({ ...VORSCHAU, APP_URL: undefined }, 'BETTER_AUTH_URL', 'warnung')).toHaveLength(1);
  });

  it('MAIL_ABSENDER mit Platzhalter-Domain ist in der Produktion ein Fehler', () => {
    expect(fehlerNamen({ ...PRODUKTION, MAIL_ABSENDER: 'IGMG Wetzlar <noreply@example.test>' })).toContain('MAIL_ABSENDER');
    expect(fehlerNamen({ ...PRODUKTION, MAIL_ABSENDER: 'noreply@beispiel.de' })).not.toContain('MAIL_ABSENDER');
  });

  it('Werte mit Leerzeichen am Rand sind ein Fehler', () => {
    const befunde = befundeZu({ ...PRODUKTION, WARTUNG_TOKEN: ` ${GEHEIM}\n` }, 'WARTUNG_TOKEN', 'fehler');
    expect(befunde).toHaveLength(1);
    expect(befunde[0].meldung).toContain('Leerzeichen');
  });

  it('SITE_MODE: ungültiger Wert ist ein Fehler, abweichend von VERCEL_ENV eine Warnung', () => {
    expect(fehlerNamen({ SITE_MODE: 'staging' })).toContain('SITE_MODE');
    expect(befundeZu({ VERCEL_ENV: 'preview', SITE_MODE: 'produktion' }, 'SITE_MODE', 'warnung')).toHaveLength(1);
  });

  it('die Vercel-Variablen gelten nur in ihrem Format', () => {
    expect(pruefeRegel('VERCEL_ENV', 'preview')).toBe(true);
    expect(pruefeRegel('VERCEL_ENV', 'staging')).toBe(false);
    expect(pruefeRegel('VERCEL_BRANCH_URL', 'https://igmg-git-test.vercel.app')).toBe(false);
    expect(pruefeRegel('VERCEL_BRANCH_URL', 'igmg-git-test.vercel.app')).toBe(true);
  });

  it('EINGANG_SCHLUESSEL: genau 32 Byte als Base64', () => {
    expect(pruefeRegel('EINGANG_SCHLUESSEL', Buffer.alloc(32).toString('base64'))).toBe(true);
    expect(pruefeRegel('EINGANG_SCHLUESSEL', Buffer.alloc(31).toString('base64'))).toBe(false);
    expect(pruefeRegel('EINGANG_SCHLUESSEL', Buffer.alloc(33).toString('base64'))).toBe(false);
    expect(pruefeRegel('EINGANG_SCHLUESSEL', 'kein-base64!')).toBe(false);
  });

  it('Geheimnisse brauchen mindestens 32 Zeichen', () => {
    expect(pruefeRegel('BETTER_AUTH_SECRET', 'a'.repeat(31))).toBe(false);
    expect(pruefeRegel('BETTER_AUTH_SECRET', 'a'.repeat(32))).toBe(true);
    expect(pruefeRegel('CRON_SECRET', 'a'.repeat(31))).toBe(false);
    expect(pruefeRegel('WARTUNG_TOKEN', 'a'.repeat(32))).toBe(true);
  });

  it('APP_URL und BETTER_AUTH_URL sind http- oder https-Adressen', () => {
    expect(pruefeRegel('APP_URL', 'https://www.example.test')).toBe(true);
    expect(pruefeRegel('APP_URL', 'www.example.test')).toBe(false);
    expect(pruefeRegel('APP_URL', 'ftp://www.example.test')).toBe(false);
  });

  it('DATABASE_URL beginnt mit postgres:// oder postgresql://', () => {
    expect(pruefeRegel('DATABASE_URL', 'postgres://a:b@h/db')).toBe(true);
    expect(pruefeRegel('DATABASE_URL', 'postgresql://a@h/db')).toBe(true);
    expect(pruefeRegel('DATABASE_URL', 'mysql://a@h/db')).toBe(false);
  });

  it('Aufzählungen: SITE_MODE, MAIL_TRANSPORT, SPEICHER, PROXY_VERTRAUEN', () => {
    expect(pruefeRegel('SITE_MODE', 'vorschau')).toBe(true);
    expect(pruefeRegel('SITE_MODE', 'staging')).toBe(false);
    expect(pruefeRegel('MAIL_TRANSPORT', 'datei')).toBe(true);
    expect(pruefeRegel('MAIL_TRANSPORT', 'postfach')).toBe(false);
    expect(pruefeRegel('SPEICHER', 'blob')).toBe(true);
    expect(pruefeRegel('SPEICHER', 'azure')).toBe(false);
    expect(pruefeRegel('PROXY_VERTRAUEN', '1')).toBe(true);
    expect(pruefeRegel('PROXY_VERTRAUEN', 'ja')).toBe(false);
  });

  it('MAIL_ABSENDER: Adresse mit oder ohne Anzeigename', () => {
    expect(pruefeRegel('MAIL_ABSENDER', 'IGMG Wetzlar <noreply@beispiel.de>')).toBe(true);
    expect(pruefeRegel('MAIL_ABSENDER', 'noreply@beispiel.de')).toBe(true);
    expect(pruefeRegel('MAIL_ABSENDER', 'kein Absender')).toBe(false);
  });

  it('EINGANG_SCHLUESSEL_ALT_<ID> wird geprüft, wenn es gesetzt ist', () => {
    expect(befundeZu({ ...PRODUKTION, EINGANG_SCHLUESSEL_ALT_2: 'zu-kurz' }, 'EINGANG_SCHLUESSEL_ALT_2', 'fehler')).toHaveLength(1);
    expect(befundeZu({ ...PRODUKTION, EINGANG_SCHLUESSEL_ALT_2: SCHLUESSEL }, 'EINGANG_SCHLUESSEL_ALT_2')).toEqual([]);
    expect(befundeZu(PRODUKTION, 'EINGANG_SCHLUESSEL_ALT_2')).toEqual([]);
  });
});

describe('NEXT_PUBLIC_', () => {
  it('ein NEXT_PUBLIC_-Name mit geheim wirkendem Teil ist ein Fehler', () => {
    const env = { ...PRODUKTION, NEXT_PUBLIC_API_TOKEN: 'oeffentlich' };
    expect(fehlerNamen(env)).toContain('NEXT_PUBLIC_API_TOKEN');
  });

  it('harmlose NEXT_PUBLIC_-Namen bleiben ohne Befund', () => {
    expect(fehlerNamen({ ...PRODUKTION, NEXT_PUBLIC_SITE_NAME: 'IGMG' })).not.toContain('NEXT_PUBLIC_SITE_NAME');
  });
});

describe('Werte erscheinen nie in Meldungen', () => {
  it('auch bei ungültigen Geheimnissen, Adressen und NEXT_PUBLIC-Namen', () => {
    const env: UmgebungsWerte = {
      ...PRODUKTION,
      BETTER_AUTH_SECRET: LECK[0],
      EINGANG_SCHLUESSEL: LECK[1],
      DATABASE_URL: `mysql://nutzer:${LECK[2]}@db.example.test/igmg`,
      WARTUNG_TOKEN: ` ${LECK[0]} `,
      CRON_SECRET: LECK[1],
      NEXT_PUBLIC_API_KEY: LECK[2],
    };
    const befunde: Befund[] = pruefeUmgebung(env).befunde;
    expect(befunde.length).toBeGreaterThan(0);
    const text = JSON.stringify(befunde);
    for (const wert of LECK) expect(text).not.toContain(wert);
  });
});

describe('Startklar-Umgebung: .env.example', () => {
  const zeilen = readFileSync(join(WEB, '.env.example'), 'utf8').split('\n');
  const werte: Record<string, string> = {};
  for (const zeile of zeilen) {
    const treffer = /^([A-Z][A-Z0-9_]*)=(.*)$/.exec(zeile);
    if (treffer) werte[treffer[1]] = treffer[2].replace(/^"(.*)"$/, '$1');
  }

  it('enthält SITE_MODE, CRON_SECRET, BLOB_READ_WRITE_TOKEN und SPEICHER, ohne echte Werte', () => {
    for (const name of ['SITE_MODE', 'CRON_SECRET', 'BLOB_READ_WRITE_TOKEN', 'SPEICHER']) expect(name in werte, name).toBe(true);
    expect(werte.SITE_MODE).toBe('');
    expect(werte.CRON_SECRET).toBe('');
    expect(werte.BLOB_READ_WRITE_TOKEN).toBe('');
    expect(werte.SPEICHER).toBe('dateisystem');
  });

  it('setzt keine Vercel-Variablen', () => {
    expect(Object.keys(werte).filter((name) => name.startsWith('VERCEL'))).toEqual([]);
  });

  it('ist in der Betriebsart entwicklung fehlerfrei', () => {
    expect(hatFehler(pruefeUmgebung(werte))).toBe(false);
  });
});

describe('Vollständigkeit gegenüber dem Quelltext', () => {
  const SRC = join(WEB, 'src');
  const quelltexte = (readdirSync(SRC, { recursive: true }) as string[])
    .filter((datei) => /\.tsx?$/.test(datei))
    .map((datei) => readFileSync(join(SRC, datei), 'utf8'));
  const literal = new Set<string>();
  const dynamisch: string[] = [];
  for (const text of quelltexte) {
    for (const treffer of text.matchAll(/process\.env\.([A-Za-z_][A-Za-z0-9_]*)/g)) literal.add(treffer[1]);
    for (const treffer of text.matchAll(/process\.env\[([^\]]+)\]/g)) dynamisch.push(treffer[1]);
  }

  /** Von Node.js bzw. Next.js gesetzt, kein Betreiberwert: nicht in VARIABLEN. */
  const AUSNAHMEN: Record<string, string> = {
    NODE_ENV: 'von Node.js gesetzt (Betriebsart fällt darauf zurück)',
    NEXT_RUNTIME: 'von Next.js gesetzt (Laufzeit, src/instrumentation.ts)',
    NEXT_PHASE: 'von Next.js gesetzt (Bauphase, Vorrendern ohne Start-Prüfung)',
  };
  /** Dynamische Lesestellen ohne Präfix: der Typ begrenzt sie auf zwei Variablen aus VARIABLEN. */
  const DYNAMISCHE_AUSNAHMEN: Record<string, string> = {
    geheimnisVariable:
      "Parameter von hmac() in src/lib/krypto/index.ts; der Typ begrenzt ihn auf 'RATE_GEHEIMNIS' | 'ALTCHA_GEHEIMNIS' (beide in VARIABLEN)",
  };
  const namen = new Set(VARIABLEN.filter((v) => !v.muster).map((v) => v.name));
  const muster = VARIABLEN.filter((v) => v.muster).map((v) => v.name.split('<ID>')[0]);

  it('findet die Lesestellen im Quelltext', () => {
    expect(literal.size).toBeGreaterThan(20);
    expect(literal.has('APP_URL')).toBe(true);
  });

  it.each([...literal].filter((name) => !(name in AUSNAHMEN)))('%s steht in VARIABLEN', (name) => {
    expect(namen.has(name)).toBe(true);
  });

  it('dynamische Lesestellen sind ein bekanntes Muster oder begründet', () => {
    for (const ausdruck of dynamisch) {
      if (ausdruck.startsWith('`')) {
        expect(muster).toContain(ausdruck.slice(1).split('${')[0]);
      } else {
        expect(DYNAMISCHE_AUSNAHMEN).toHaveProperty(ausdruck);
      }
    }
  });
});

describe('scripts/geheimnisse-erzeugen.mjs', () => {
  it('erzeugte Werte bestehen die Prüfregeln ihrer Variablen', () => {
    for (let lauf = 0; lauf < 20; lauf++) {
      for (const { name, wert } of erzeugeWerte()) {
        const variable = VARIABLEN.find((v) => v.name === name);
        expect(variable?.geheim, name).toBe(true);
        expect(variable?.pruefung.safeParse(wert).success, name).toBe(true);
      }
    }
  });

  it('erzeugt genau die als erzeugbar markierten Variablen', () => {
    const erzeugbar = VARIABLEN.filter((v) => v.erzeugbar)
      .map((v) => v.name)
      .sort();
    expect(GEHEIMNISSE.map((geheimnis) => geheimnis.name).sort()).toEqual(erzeugbar);
  });

  it('schreibt nie in das Repository oder in den App-Ordner', () => {
    expect(pruefeZielPfad(join(REPO, 'geheim.env'))).not.toBeNull();
    expect(pruefeZielPfad(join(WEB, '.env'))).not.toBeNull();
    expect(pruefeZielPfad(join(tmp, 'geheim.env'))).toBeNull();
  });

  it('schreibt eine neue Datei mit Modus 600 und überschreibt nie', () => {
    const pfad = join(tmp, 'neu.env');
    schreibeDatei(pfad, 'A=1\n');
    expect(statSync(pfad).mode & 0o777).toBe(0o600);
    expect(() => schreibeDatei(pfad, 'B=2\n')).toThrow(/existiert bereits/);
    expect(readFileSync(pfad, 'utf8')).toBe('A=1\n');
  });
});
