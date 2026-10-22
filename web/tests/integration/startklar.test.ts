import { randomBytes } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/pglite';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import type { Datenbank } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { fuehreStartklarAus, type Pruefung, type StartklarErgebnis } from '@/lib/startklar/pruefungen';
import journal from '../../drizzle/migrations/meta/_journal.json';
import { testDatenbank } from './hilfen/db';

/**
 * Prüflogik des Startklar-Cockpits und von `pnpm startklar` (src/lib/startklar/pruefungen.ts, Z-12, V-11).
 * Die Datenbank kommt aus `testDatenbank()`: `migrate()` aus drizzle-orm/pglite/migrator legt das Schema `drizzle`
 * mit der Tabelle `__drizzle_migrations` an und trägt jede Migration aus `_journal.json` ein.
 * Die Umgebung wird explizit übergeben (kein process.env); DNS-Abfragen sind in allen Fällen abgeschaltet.
 */

type Umgebung = Record<string, string | undefined>;

const { client, db: pgDb } = await testDatenbank();
const db = pgDb as unknown as Datenbank;
afterAll(() => client.close());

beforeEach(async () => {
  await db.execute(sql`truncate table einstellung, seiteninhalt, veranstaltung, nachricht cascade`);
});

const geheimnis = () => randomBytes(32).toString('base64');

/** Vollständige Produktionsumgebung ohne Befund (Testwerte, keine echten Zugänge). Einzelne Felder überschreibbar. */
function produktionsUmgebung(zusatz: Umgebung = {}): Umgebung {
  return {
    NODE_ENV: 'production',
    SITE_MODE: 'produktion',
    VERCEL: '1',
    VERCEL_ENV: 'production',
    VERCEL_REGION: 'fra1',
    APP_URL: 'https://gemeinde.test',
    BETTER_AUTH_URL: 'https://gemeinde.test',
    BETTER_AUTH_SECRET: geheimnis(),
    DATABASE_URL: 'postgresql://pruefung@db.example.test:5432/igmg',
    EINGANG_SCHLUESSEL: geheimnis(),
    EINGANG_SCHLUESSEL_ID: '1',
    RATE_GEHEIMNIS: geheimnis(),
    ALTCHA_GEHEIMNIS: geheimnis(),
    WARTUNG_TOKEN: geheimnis(),
    CRON_SECRET: geheimnis(),
    PROXY_VERTRAUEN: '1',
    MAIL_TRANSPORT: 'smtp',
    MAIL_ABSENDER: 'Pruefung <pruefung@beispiel.de>',
    SMTP_HOST: 'smtp.beispiel.de',
    SMTP_PORT: '587',
    SMTP_SECURE: 'false',
    SMTP_USER: 'pruefung',
    SMTP_PASS: geheimnis(),
    SPEICHER: 's3',
    S3_REGION: 'eu-central-1',
    S3_BUCKET: 'pruefung-medien',
    S3_ZUGANG: 'pruefung',
    S3_GEHEIMNIS: geheimnis(),
    ...zusatz,
  };
}

function vorschauUmgebung(zusatz: Umgebung = {}): Umgebung {
  return produktionsUmgebung({ SITE_MODE: 'vorschau', VERCEL_ENV: 'preview', ...zusatz });
}

function befund(e: StartklarErgebnis, id: string): Pruefung {
  const gefunden = e.pruefungen.find((p) => p.id === id);
  if (!gefunden) throw new Error(`Prüfung ${id} fehlt. Vorhanden: ${e.pruefungen.map((p) => p.id).join(', ')}`);
  return gefunden;
}

async function pruefe(env: Umgebung, datenbank: Datenbank | null = db) {
  // Speicherprobe hier aus (keine Netzanfragen); eigene Fälle unten mit Attrappe und mit echtem Dateisystem
  return fuehreStartklarAus({ env, db: datenbank, dnsPruefen: false, speicherPruefen: false, jetzt: new Date('2026-10-11T12:00:00Z') });
}

async function setzeEinstellung(schluessel: string, wert: unknown) {
  await db.execute(sql`insert into einstellung (schluessel, wert) values (${schluessel}, ${JSON.stringify(wert)}::jsonb)`);
}

async function setzeSeiteninhalt(bereich: string, inhalt: unknown) {
  await db.execute(sql`insert into seiteninhalt (bereich, inhalt) values (${bereich}, ${JSON.stringify(inhalt)}::jsonb)`);
}

/** Rechtstext ohne Platzhalter. `weitere` bleibt leer, weil Absatzlisten derzeit als Platzhalter gelten (siehe unten). */
const RECHT_OHNE_PLATZHALTER = {
  impressum: {
    verantwortlich: {
      name: 'Testverein Muster e. V.',
      anschrift: 'Musterweg 1, 00000 Musterstadt',
      telefon: '00 00 0000',
      email: 'muster@beispiel.de',
      vertretung: 'Muster Vorstand',
      register: 'Muster Register 1',
    },
    weitere: [],
  },
  datenschutz: { daten: [] },
};

describe('Leere Seed-Lage: Inhalte und Einstellungen', () => {
  it('Konzept-Hinweis ohne Eintrag ist eingeschaltet: Fehler in produktion, Warnung in vorschau', async () => {
    const produktion = await pruefe(produktionsUmgebung());
    const vorschau = await pruefe(vorschauUmgebung());
    expect(befund(produktion, 'inhalte.konzepthinweis').status).toBe('fehler');
    expect(befund(vorschau, 'inhalte.konzepthinweis').status).toBe('warnung');
  });

  it('Konzept-Hinweis ausgeschaltet: ok', async () => {
    await setzeEinstellung('allgemein', { konzepthinweis: false });
    const e = await pruefe(produktionsUmgebung());
    expect(befund(e, 'inhalte.konzepthinweis').status).toBe('ok');
  });

  it('Gebetszeiten unbestätigt: Warnung; bestätigt: ok', async () => {
    const unbestaetigt = await pruefe(produktionsUmgebung());
    expect(befund(unbestaetigt, 'inhalte.gebetszeiten').status).toBe('warnung');

    await setzeEinstellung('gebetszeiten', { bestaetigt: true });
    const bestaetigt = await pruefe(produktionsUmgebung());
    expect(befund(bestaetigt, 'inhalte.gebetszeiten').status).toBe('ok');
  });

  it('Rechtstexte fehlen oder enthalten Platzhalter: Fehler in produktion, Warnung in vorschau', async () => {
    const leer = await pruefe(produktionsUmgebung());
    expect(befund(leer, 'recht.impressum').status).toBe('fehler');
    expect(befund(leer, 'recht.datenschutz').status).toBe('fehler');

    await setzeSeiteninhalt('impressum', {
      verantwortlich: { name: '[Name und Rechtsform – Vorstand]', anschrift: 'Musterweg 1' },
      weitere: [],
    });
    await setzeSeiteninhalt('datenschutz', { daten: [], hinweis: 'Frist: [Frist – Gemeinde]' });
    const mitPlatzhaltern = await pruefe(produktionsUmgebung());
    expect(befund(mitPlatzhaltern, 'recht.impressum').status).toBe('fehler');
    expect(befund(mitPlatzhaltern, 'recht.datenschutz').status).toBe('fehler');
    const vorschau = await pruefe(vorschauUmgebung());
    expect(befund(vorschau, 'recht.impressum').status).toBe('warnung');
  });

  it('Rechtstexte ohne Platzhalter (ohne Absatzlisten): ok', async () => {
    await setzeSeiteninhalt('impressum', RECHT_OHNE_PLATZHALTER.impressum);
    await setzeSeiteninhalt('datenschutz', RECHT_OHNE_PLATZHALTER.datenschutz);
    const e = await pruefe(produktionsUmgebung());
    expect(befund(e, 'recht.impressum').status).toBe('ok');
    expect(befund(e, 'recht.datenschutz').status).toBe('ok');
  });

  // BEKANNTER DEFEKT (OFFENE FRAGE 1 in _werkstatt): Die Platzhalterprüfung läuft auf dem JSON-Text. Eine Liste wie
  // `[{"art":"absatz", …}]` trifft `\[[^\]]{2,}\]` auch ohne Platzhalter. Der Test bleibt bis zur Korrektur
  // in pruefungen.ts als `fails` markiert; schlägt er nach einer Korrektur fehl, auf `it` umstellen.
  it('Absatzlisten in Rechtstexten gelten nicht als Platzhalter', async () => {
    await setzeSeiteninhalt('impressum', {
      verantwortlich: RECHT_OHNE_PLATZHALTER.impressum.verantwortlich,
      weitere: [{ art: 'absatz', text: { de: 'Angaben ohne Platzhalter.' } }],
    });
    await setzeSeiteninhalt('datenschutz', RECHT_OHNE_PLATZHALTER.datenschutz);
    const e = await pruefe(produktionsUmgebung());
    expect(befund(e, 'recht.impressum').status).toBe('ok');
  });

  it('Beispielinhalte werden aus Veranstaltungen, Nachrichten und Seiteninhalten gezählt', async () => {
    await db.execute(
      sql`insert into veranstaltung (slug, titel, kategorie, beginn, ist_beispiel) values ('bsp-1', '{"de":"Beispiel"}', 'gemeinde', now(), true)`,
    );
    await db.execute(sql`insert into nachricht (slug, titel, ist_beispiel) values ('bsp-2', '{"de":"Beispiel"}', true)`);
    await db.execute(sql`insert into seiteninhalt (bereich, inhalt, ist_beispiel) values ('projekte', '{}'::jsonb, true)`);

    const produktion = await pruefe(produktionsUmgebung());
    const beispiele = befund(produktion, 'inhalte.beispiele');
    expect(beispiele.status).toBe('warnung');
    expect(beispiele.meldung).toContain('3 Beispielinhalte');
    expect(befund(await pruefe(vorschauUmgebung()), 'inhalte.beispiele').status).toBe('hinweis');
  });

  it('ohne Beispielinhalte: ok', async () => {
    const e = await pruefe(produktionsUmgebung());
    expect(befund(e, 'inhalte.beispiele').status).toBe('ok');
  });
});

describe('Migrationen', () => {
  it('alle Journal-Einträge angewendet (Migrationstabelle aus testDatenbank): ok', async () => {
    const zeilen = await db.execute<{ n: number }>(sql`select count(*)::int as n from drizzle.__drizzle_migrations`);
    expect(zeilen.rows[0]?.n).toBe(journal.entries.length);

    const e = await pruefe(produktionsUmgebung());
    const migrationen = befund(e, 'datenbank.migrationen');
    expect(migrationen.status).toBe('ok');
    expect(migrationen.meldung).toContain(`Alle ${journal.entries.length} Migrationen`);
  });

  it('teilweise angewendet (Einträge fehlen in der Tabelle): Fehler mit Zählung', async () => {
    const { client: c2, db: pg2 } = await testDatenbank();
    try {
      const d2 = pg2 as unknown as Datenbank;
      await d2.execute(
        sql`delete from drizzle.__drizzle_migrations where id in (select id from drizzle.__drizzle_migrations order by id desc limit 3)`,
      );
      const e = await pruefe(produktionsUmgebung(), d2);
      const migrationen = befund(e, 'datenbank.migrationen');
      expect(migrationen.status).toBe('fehler');
      expect(migrationen.meldung).toContain(`${journal.entries.length - 3} von ${journal.entries.length}`);
    } finally {
      await c2.close();
    }
  });

  it('leere Datenbank ohne Migrationen: Fehler in der Migrationsprüfung, kein Abbruch der Gesamtprüfung', async () => {
    const leer = new PGlite();
    try {
      const leereDb = drizzle(leer, { schema, casing: 'snake_case' }) as unknown as Datenbank;
      const e = await pruefe(produktionsUmgebung(), leereDb);
      expect(befund(e, 'datenbank.verbindung').status).toBe('ok');
      expect(befund(e, 'datenbank.migrationen').status).toBe('fehler');
      expect(befund(e, 'inhalte.lesbar').status).toBe('fehler');
      expect(e.startklar).toBe(false);
    } finally {
      await leer.close();
    }
  });
});

describe('Datenbank nicht verbunden', () => {
  it('ohne Datenbank: Fehler in produktion, Hinweis in vorschau und entwicklung; keine Inhaltsprüfungen', async () => {
    const produktion = await pruefe(produktionsUmgebung(), null);
    expect(befund(produktion, 'datenbank.verbindung').status).toBe('fehler');
    expect(produktion.pruefungen.some((p) => p.bereich === 'inhalte' || p.bereich === 'recht')).toBe(false);

    const vorschau = await pruefe(vorschauUmgebung(), null);
    expect(befund(vorschau, 'datenbank.verbindung').status).toBe('hinweis');

    const entwicklung = await pruefe({ NODE_ENV: 'development', SITE_MODE: 'entwicklung' }, null);
    expect(befund(entwicklung, 'datenbank.verbindung').status).toBe('hinweis');
  });
});

describe('Auslieferung', () => {
  // OFFENE FRAGE 2: Die Vorgabe nennt für eine fehlende Region eine Warnung. Der Code meldet „manuell“, weil die Region
  // außerhalb von Vercel nicht feststellbar ist (VERCEL_REGION fehlt lokal). Das Verhalten bleibt wie im Code.
  it.each([
    ['fra1', 'ok'],
    ['iad1', 'warnung'],
    ['fehlt', 'manuell'],
  ] as const)('Region %s ergibt %s', async (bezeichnung, erwartet) => {
    const region = bezeichnung === 'fehlt' ? undefined : bezeichnung;
    const e = await pruefe(produktionsUmgebung({ VERCEL_REGION: region }));
    expect(befund(e, 'auslieferung.region').status).toBe(erwartet);
  });

  it('https-Adresse: ok in produktion', async () => {
    const e = await pruefe(produktionsUmgebung({ APP_URL: 'https://gemeinde.test' }));
    expect(befund(e, 'auslieferung.https').status).toBe('ok');
  });

  // OFFENE FRAGE 2: Die Vorgabe nennt für http eine Warnung. pruefungen.ts meldet in produktion einen Fehler,
  // ebenso umgebung.ts („APP_URL verwendet http://“). Das Verhalten bleibt wie im Code (strenger, nicht abgeschwächt).
  it('http-Adresse: Fehler in produktion, Hinweis in vorschau', async () => {
    const produktion = await pruefe(produktionsUmgebung({ APP_URL: 'http://gemeinde.test' }));
    expect(befund(produktion, 'auslieferung.https').status).toBe('fehler');
    const vorschau = await pruefe(vorschauUmgebung({ APP_URL: 'http://gemeinde.test' }));
    expect(befund(vorschau, 'auslieferung.https').status).toBe('hinweis');
  });

  it('vercel.app-Adresse in produktion: Warnung; eigene Domain: ok', async () => {
    const vercel = await pruefe(produktionsUmgebung({ APP_URL: 'https://igmg-pruefung.vercel.app' }));
    expect(befund(vercel, 'auslieferung.domain').status).toBe('warnung');

    const eigene = await pruefe(produktionsUmgebung({ APP_URL: 'https://gemeinde.test' }));
    expect(befund(eigene, 'auslieferung.domain').status).toBe('ok');
  });

  it('Domain-Prüfung nur in produktion', async () => {
    const vorschau = await pruefe(vorschauUmgebung({ APP_URL: 'https://igmg-pruefung.vercel.app' }));
    expect(vorschau.pruefungen.some((p) => p.id === 'auslieferung.domain')).toBe(false);
  });

  // BEKANNTER DEFEKT (OFFENE FRAGE 3): `localhost` gilt als eigene Domain (Status ok). Erwartet: Warnung.
  it('localhost gilt nicht als eigene Domain', async () => {
    const e = await pruefe(produktionsUmgebung({ APP_URL: 'https://localhost:3000' }));
    expect(befund(e, 'auslieferung.domain').status).toBe('warnung');
  });
});

describe('Mail', () => {
  it('dnsPruefen: false ergibt SPF/DMARC als manuellen Punkt', async () => {
    const e = await pruefe(produktionsUmgebung());
    expect(befund(e, 'mail.dns').status).toBe('manuell');
  });

  it('ohne Absender-Domain in produktion: manueller Punkt', async () => {
    const e = await pruefe(produktionsUmgebung({ MAIL_ABSENDER: undefined }));
    expect(befund(e, 'mail.dns').status).toBe('manuell');
  });
});

describe('Gesamtergebnis', () => {
  it('saubere Produktionslage ist startklar (keine Fehler)', async () => {
    await setzeEinstellung('allgemein', { konzepthinweis: false });
    await setzeEinstellung('gebetszeiten', { bestaetigt: true });
    await setzeSeiteninhalt('impressum', RECHT_OHNE_PLATZHALTER.impressum);
    await setzeSeiteninhalt('datenschutz', RECHT_OHNE_PLATZHALTER.datenschutz);

    const e = await pruefe(produktionsUmgebung());
    expect(e.pruefungen.filter((p) => p.status === 'fehler')).toEqual([]);
    expect(e.zaehler.fehler).toBe(0);
    expect(e.startklar).toBe(true);
  });

  it('ein Fehler macht die Lage nicht startklar', async () => {
    const e = await pruefe(produktionsUmgebung({ APP_URL: undefined }));
    expect(e.zaehler.fehler).toBeGreaterThan(0);
    expect(e.startklar).toBe(false);
  });

  it('Zähler entsprechen den Prüfungen', async () => {
    const e = await pruefe(vorschauUmgebung());
    const summe = Object.values(e.zaehler).reduce((a, b) => a + b, 0);
    expect(summe).toBe(e.pruefungen.length);
    for (const status of ['ok', 'hinweis', 'warnung', 'fehler', 'manuell'] as const) {
      expect(e.zaehler[status]).toBe(e.pruefungen.filter((p) => p.status === status).length);
    }
  });
});

describe('Medienspeicher erreichbar (V-11)', () => {
  const ort = (art: 'blob' | 's3' | 'dateisystem', erreichbar: boolean) => async () => ({ art, erreichbar, meldung: `Probe ${art}` });

  it('Nicht erreichbar: Fehler in produktion und vorschau, Warnung in entwicklung, mit Ort und Aufwand', async () => {
    const jetzt = new Date('2026-10-11T12:00:00Z');
    const produktion = await fuehreStartklarAus({
      env: produktionsUmgebung(),
      db,
      dnsPruefen: false,
      speicherProbe: ort('s3', false),
      jetzt,
    });
    const vorschau = await fuehreStartklarAus({ env: vorschauUmgebung(), db, dnsPruefen: false, speicherProbe: ort('s3', false), jetzt });
    const entwicklung = await fuehreStartklarAus({
      env: { NODE_ENV: 'development' },
      db,
      dnsPruefen: false,
      speicherProbe: ort('dateisystem', false),
      jetzt,
    });
    expect(befund(produktion, 'auslieferung.speicher').status).toBe('fehler');
    expect(befund(produktion, 'auslieferung.speicher').ort).toMatch(/S3/);
    expect(befund(produktion, 'auslieferung.speicher').aufwand).toBeTruthy();
    expect(produktion.startklar).toBe(false);
    expect(befund(vorschau, 'auslieferung.speicher').status).toBe('fehler');
    expect(befund(entwicklung, 'auslieferung.speicher').status).toBe('warnung');
  });

  it('Erreichbar: ok mit der Meldung der Probe', async () => {
    const e = await fuehreStartklarAus({
      env: produktionsUmgebung({ SPEICHER: 'blob' }),
      db,
      dnsPruefen: false,
      speicherProbe: ort('blob', true),
    });
    expect(befund(e, 'auslieferung.speicher')).toMatchObject({ status: 'ok', meldung: 'Probe blob' });
  });

  it('Echte Probe: Dateisystem beschreibbar, Blob ohne Token und S3 ohne Bucket nicht erreichbar, ohne Geheimnisse', async () => {
    const { mkdtemp, rm } = await import('node:fs/promises');
    const { tmpdir } = await import('node:os');
    const { join } = await import('node:path');
    const { pruefeSpeicher } = await import('@/lib/startklar/speicher-probe');
    const ordner = await mkdtemp(join(tmpdir(), 'igmg-probe-'));
    try {
      expect(await pruefeSpeicher({ SPEICHER: 'dateisystem', MEDIEN_VERZEICHNIS: join(ordner, 'medien') })).toMatchObject({
        art: 'dateisystem',
        erreichbar: true,
      });
    } finally {
      await rm(ordner, { recursive: true, force: true });
    }
    expect(await pruefeSpeicher({ SPEICHER: 'blob' })).toMatchObject({ art: 'blob', erreichbar: false });
    const s3 = await pruefeSpeicher({ SPEICHER: 's3', S3_GEHEIMNIS: 'geheim-wert-123' });
    expect(s3).toMatchObject({ art: 's3', erreichbar: false });
    expect(s3.meldung).not.toContain('geheim-wert-123');
  });
});

describe('Gemeinde-Plattform (PLAN 2.8/2.9, Z-12, Z-20)', () => {
  const pg = (e: StartklarErgebnis) => e.pruefungen.filter((p) => p.bereich === 'gemeinde');

  it('Produktion ohne Schalter: alles mit Personendaten aus (ok); lokaler Server ohne Meldung: Warnung, Takt nicht nötig', async () => {
    const e = await pruefe(produktionsUmgebung());
    expect(befund(e, 'gemeinde.schalter').status).toBe('ok');
    expect(befund(e, 'gemeinde.sicherung')).toMatchObject({ status: 'warnung' });
    expect(befund(e, 'gemeinde.sicherung').meldung).toContain('noch nie gemeldet');
    expect(befund(e, 'gemeinde.probe').status).toBe('warnung');
    expect(befund(e, 'gemeinde.spiegel').status).toBe('warnung');
    expect(pg(e).map((p) => p.id)).not.toContain('gemeinde.takt');
    expect(pg(e).map((p) => p.id)).not.toContain('gemeinde.push-schluessel');
    expect(befund(e, 'gemeinde.kette').status).toBe('ok');
    expect(befund(e, 'gemeinde.uebersetzungen').status).toBe('ok');
  });

  it('Vorschau: eingeschaltete Schalter nur als Hinweis, fehlende Läufe als Hinweis', async () => {
    const e = await pruefe(vorschauUmgebung());
    expect(befund(e, 'gemeinde.schalter')).toMatchObject({ status: 'hinweis' });
    expect(befund(e, 'gemeinde.schalter').meldung).toContain('Gruppenchat');
    expect(befund(e, 'gemeinde.sicherung').status).toBe('hinweis');
  });

  it('Produktion mit Chat und Push, ohne VAPID: manueller Punkt mit Voraussetzungen, Fehler beim Schlüssel, Takt fehlt', async () => {
    const e = await pruefe(produktionsUmgebung({ FUNKTION_CHAT: 'an', FUNKTION_PUSH: 'an', FUNKTION_PUSH_GEBET: 'an' }));
    const schalter = befund(e, 'gemeinde.schalter');
    expect(schalter.status).toBe('manuell');
    expect(schalter.meldung).toContain('Schutzkonzept');
    expect(befund(e, 'gemeinde.push-schluessel').status).toBe('fehler');
    expect(befund(e, 'gemeinde.takt').status).toBe('warnung');
    expect(befund(e, 'gemeinde.chat-leitung').status).toBe('ok');
    expect(e.startklar).toBe(false);
    const mitSchluessel = await pruefe(
      produktionsUmgebung({ FUNKTION_PUSH: 'an', VAPID_PRIVAT: 'x'.repeat(43), VAPID_KONTAKT: 'mailto:technik@beispiel.de' }),
    );
    expect(befund(mitSchluessel, 'gemeinde.push-schluessel').status).toBe('ok');
  });

  it('Meldungen des lokalen Servers: aktuell ok mit Größe, fehlgeschlagen Fehler, zu alt Warnung; Takt nach 15 min alt', async () => {
    await setzeEinstellung('lokaler_server', {
      sicherung: { ok: true, bytes: 52_000_000, zeit: '2026-10-11T03:00:00Z' },
      probe: { ok: false, bytes: 0, zeit: '2026-10-01T03:00:00Z' },
      spiegel: { ok: true, bytes: 0, zeit: '2026-10-08T03:00:00Z' },
      takt: { ok: true, bytes: 0, zeit: '2026-10-11T11:55:00Z' },
    });
    const e = await pruefe(produktionsUmgebung({ FUNKTION_PUSH: 'an', FUNKTION_PUSH_GEBET: 'an', VAPID_PRIVAT: 'x'.repeat(43) }));
    expect(befund(e, 'gemeinde.sicherung')).toMatchObject({ status: 'ok' });
    expect(befund(e, 'gemeinde.sicherung').meldung).toContain('52 MB');
    expect(befund(e, 'gemeinde.probe').status).toBe('fehler');
    expect(befund(e, 'gemeinde.spiegel').status).toBe('warnung');
    expect(befund(e, 'gemeinde.takt').status).toBe('ok');
    const spaeter = await fuehreStartklarAus({
      env: produktionsUmgebung({ FUNKTION_PUSH: 'an', FUNKTION_PUSH_GEBET: 'an', VAPID_PRIVAT: 'x'.repeat(43) }),
      db,
      dnsPruefen: false,
      speicherPruefen: false,
      jetzt: new Date('2026-10-11T12:20:00Z'),
    });
    expect(befund(spaeter, 'gemeinde.takt').status).toBe('warnung');
  });

  it('Lern-App (KERN 4.0 §6): Produktion ohne Angaben ohne Befund; gesperrte Schalter melden, Abgleich als Vorbehalt', async () => {
    const ohne = await pruefe(produktionsUmgebung());
    expect(befund(ohne, 'gemeinde.schalter').status).toBe('ok');
    // lernapp, lernapp_ungeprueft und lernapp_meldungen sind in der Produktion an (Nutzer 21.10.2026) – ohne Personendaten, kein Befund
    expect(pg(ohne).map((p) => p.id)).not.toContain('gemeinde.schalter-sperren');

    const gesperrt = await pruefe(produktionsUmgebung({ FUNKTION_LERNAPP_SYNC: 'an', FUNKTION_LERNAPP_RANGLISTE: 'an' }));
    const sperren = befund(gesperrt, 'gemeinde.schalter-sperren');
    expect(sperren.status).toBe('warnung');
    // lernapp ist in der Produktion an; es fehlt nur noch das Konto
    expect(sperren.meldung).toContain('Lern-App: Abgleich mit dem Konto (braucht Konten)');
    expect(sperren.meldung).toContain('Bestenliste');
    // Gesperrt heißt wirkungslos: kein offener Vorbehalt für Personendaten
    expect(befund(gesperrt, 'gemeinde.schalter').status).toBe('ok');

    const an = await pruefe(produktionsUmgebung({ FUNKTION_LERNAPP: 'an', FUNKTION_LERNAPP_SYNC: 'an', FUNKTION_KONTEN: 'an' }));
    expect(pg(an).map((p) => p.id)).not.toContain('gemeinde.schalter-sperren');
    expect(befund(an, 'gemeinde.schalter').status).toBe('manuell');
    expect(befund(an, 'gemeinde.schalter').meldung).toContain('LM-08');

    // Lern-Erinnerung wie Push: ohne VAPID-Schlüssel ein Fehler
    const erinnerung = await pruefe(produktionsUmgebung({ FUNKTION_LERNAPP: 'an', FUNKTION_PUSH: 'an', FUNKTION_PUSH_LERNAPP: 'an' }));
    expect(befund(erinnerung, 'gemeinde.push-schluessel').status).toBe('fehler');

    const vorschau = await pruefe(vorschauUmgebung());
    expect(pg(vorschau).map((p) => p.id)).not.toContain('gemeinde.schalter-sperren');
  });

  it('S-02: Gruppe mit Chat und nur einer Leitungsperson ergibt eine Warnung', async () => {
    await db
      .insert(schema.user)
      .values({ id: 'l1', name: 'Leitung', email: 'l1@beispiel.invalid', emailVerified: true })
      .onConflictDoNothing();
    const [g] = await db
      .insert(schema.gruppe)
      .values({ name: { de: '[Gruppe]', tr: '[Grup]', en: '[Group]' }, chatModus: 'offen' })
      .returning({ id: schema.gruppe.id });
    await db.insert(schema.gruppenLeitung).values({ gruppeId: g.id, benutzerId: 'l1' });
    const e = await pruefe(produktionsUmgebung({ FUNKTION_CHAT: 'an' }));
    expect(befund(e, 'gemeinde.chat-leitung').status).toBe('warnung');
    await db.execute(sql`delete from gruppe where id = ${g.id}`);
  });

  it('ADR 0030: Stau offener religiöser Freigaben – länger als 14 Tage „zur Prüfung“ ergibt eine Warnung', async () => {
    // pruefe() rechnet mit jetzt = 2026-10-11T12:00Z
    const vor20Tagen = new Date('2026-09-21T12:00:00Z');
    const vor3Tagen = new Date('2026-10-08T12:00:00Z');
    expect(befund(await pruefe(produktionsUmgebung()), 'gemeinde.freigaben')).toMatchObject({
      status: 'ok',
      meldung: 'Kein religiöser Inhalt wartet auf die Prüfung.',
    });

    // Offen, aber ohne Einreichungsdatum (berechneter besonderer Tag) bzw. frisch eingereicht: noch kein Stau
    const [tag] = await db
      .insert(schema.besondererTag)
      .values({ art: 'kandil', datum: '2026-12-01', titel: { de: '[Tag]' }, freigabe: 'zur_pruefung' })
      .returning({ id: schema.besondererTag.id });
    await db
      .insert(schema.tajwidRegel)
      .values({ schluessel: 'test_regel', familie: 'test', name: { de: '[Regel]' }, freigabe: 'zur_pruefung' });
    await db
      .insert(schema.freigabe)
      .values({ inhaltTyp: 'tajwid_regel', inhaltId: 'test_regel', art: 'religioes', status: 'zur_pruefung', am: vor3Tagen });
    let e = befund(await pruefe(produktionsUmgebung()), 'gemeinde.freigaben');
    expect(e.status).toBe('ok');
    expect(e.meldung).toContain('2 religiöse Inhalte warten auf die Prüfung, keiner länger als 14 Tage');

    // Ein älterer Verlaufseintrag ändert nichts: maßgeblich ist die jüngste Einreichung (vor 3 Tagen)
    await db
      .insert(schema.freigabe)
      .values({ inhaltTyp: 'tajwid_regel', inhaltId: 'test_regel', art: 'religioes', status: 'zur_pruefung', am: vor20Tagen });
    expect(befund(await pruefe(produktionsUmgebung()), 'gemeinde.freigaben').status).toBe('ok');

    // Folie mit Vers seit 20 Tagen ohne Verlauf (Rückfall: aktualisiertAm) und freie Seite mit religiösem Antrag vor 20 Tagen
    const [folie] = await db
      .insert(schema.anzeigeFolie)
      .values({ art: 'vers', inhalt: { sure: 1, vers: 1 }, freigabe: 'zur_pruefung', aktualisiertAm: vor20Tagen })
      .returning({ id: schema.anzeigeFolie.id });
    const [seite] = await db
      .insert(schema.seite)
      .values({ slugDe: 'test-stau', titel: { de: '[Seite]' } })
      .returning({ id: schema.seite.id });
    await db
      .insert(schema.freigabe)
      .values({ inhaltTyp: 'seite', inhaltId: seite.id, art: 'religioes', status: 'zur_pruefung', am: vor20Tagen });
    e = befund(await pruefe(produktionsUmgebung()), 'gemeinde.freigaben');
    expect(e.status).toBe('warnung');
    expect(e.meldung).toContain('2 religiöse Inhalte warten seit mehr als 14 Tagen auf die Prüfung');
    expect(e.meldung).toContain('insgesamt 4 offen');
    expect(e.ort).toContain('Verwaltung › Freigaben');

    // Entschieden: Folie geprüft, Seite zurückgewiesen (neuer Verlaufseintrag) → kein Stau mehr
    await db
      .update(schema.anzeigeFolie)
      .set({ freigabe: 'geprueft' })
      .where(sql`${schema.anzeigeFolie.id} = ${folie.id}`);
    await db.insert(schema.freigabe).values({ inhaltTyp: 'seite', inhaltId: seite.id, art: 'religioes', status: 'entwurf', am: vor3Tagen });
    expect(befund(await pruefe(produktionsUmgebung()), 'gemeinde.freigaben').status).toBe('ok');

    await db.execute(sql`delete from freigabe where inhalt_id in ('test_regel', ${seite.id})`);
    await db.execute(sql`delete from tajwid_regel where schluessel = 'test_regel'`);
    await db.execute(sql`delete from besonderer_tag where id = ${tag.id}`);
    await db.execute(sql`delete from anzeige_folie where id = ${folie.id}`);
    await db.execute(sql`delete from seite where id = ${seite.id}`);
  });

  it('F-40: Wissensthemen „zur Prüfung“ zählen mit (Rückfall aktualisiertAm, sonst jüngste Einreichung), Papierkorb nicht', async () => {
    // pruefe() rechnet mit jetzt = 2026-10-11T12:00Z; die zwölf Bestandsthemen aus Migration 0015 sind „geprüft“
    const vor20Tagen = new Date('2026-09-21T12:00:00Z');
    const vor3Tagen = new Date('2026-10-08T12:00:00Z');
    const freigaben = async () => befund(await pruefe(produktionsUmgebung()), 'gemeinde.freigaben');
    expect((await freigaben()).status).toBe('ok');

    // Seit 20 Tagen „zur Prüfung“ ohne Verlauf: Rückfall auf aktualisiertAm → Stau
    const [thema] = await db
      .insert(schema.wissenThema)
      .values({ slug: 'startklar-stau', kategorie: 'test', titel: { de: '[Thema]' }, freigabe: 'zur_pruefung', aktualisiertAm: vor20Tagen })
      .returning({ id: schema.wissenThema.id });
    let e = await freigaben();
    expect(e.status).toBe('warnung');
    expect(e.meldung).toContain('Ein religiöser Inhalt wartet seit mehr als 14 Tagen auf die Prüfung');
    expect(e.meldung).toContain('insgesamt 1 offen');

    // Im Papierkorb zählt ein offenes Thema nicht
    const [papierkorb] = await db
      .insert(schema.wissenThema)
      .values({
        slug: 'startklar-papierkorb',
        kategorie: 'test',
        titel: { de: '[Thema im Papierkorb]' },
        freigabe: 'zur_pruefung',
        aktualisiertAm: vor20Tagen,
        imPapierkorbSeit: vor3Tagen,
      })
      .returning({ id: schema.wissenThema.id });
    expect((await freigaben()).meldung).toContain('insgesamt 1 offen');

    // Erneut eingereicht vor 3 Tagen: maßgeblich ist die jüngste Einreichung → offen, aber kein Stau
    await db
      .insert(schema.freigabe)
      .values({ inhaltTyp: 'wissen_thema', inhaltId: thema.id, art: 'religioes', status: 'zur_pruefung', am: vor3Tagen });
    e = await freigaben();
    expect(e.status).toBe('ok');
    expect(e.meldung).toBe('Ein religiöser Inhalt wartet auf die Prüfung, keiner länger als 14 Tage.');

    // Geprüft → nichts offen
    await db
      .update(schema.wissenThema)
      .set({ freigabe: 'geprueft' })
      .where(sql`${schema.wissenThema.id} = ${thema.id}`);
    expect((await freigaben()).meldung).toBe('Kein religiöser Inhalt wartet auf die Prüfung.');

    await db.execute(sql`delete from freigabe where inhalt_id = ${thema.id}`);
    await db.execute(sql`delete from wissen_thema where id in (${thema.id}, ${papierkorb.id})`);
  });

  it('S-10: unveränderte Hash-Kette ok, eine eingeschobene Zeile mit falschem Hash ergibt einen Fehler', async () => {
    const { kettenHash, KETTEN_ANFANG } = await import('@/lib/chat/hashkette');
    const zeitpunkt = new Date('2026-10-10T10:00:00.000Z');
    const inhalt = { kanalId: null, nachrichtId: null, akteurId: null, aktion: 'notfallpause' as const, grund: '[Test]' };
    const hash = kettenHash(KETTEN_ANFANG, { ...inhalt, zeitpunkt: zeitpunkt.toISOString() });
    await db.insert(schema.moderationsprotokoll).values({ ...inhalt, zeitpunkt, vorgaengerHash: KETTEN_ANFANG, hash });
    expect(befund(await pruefe(produktionsUmgebung()), 'gemeinde.kette')).toMatchObject({ status: 'ok' });
    await db.insert(schema.moderationsprotokoll).values({ ...inhalt, zeitpunkt, vorgaengerHash: hash, hash: '0'.repeat(64) });
    const e = await pruefe(produktionsUmgebung());
    expect(befund(e, 'gemeinde.kette')).toMatchObject({ status: 'fehler' });
    expect(befund(e, 'gemeinde.kette').meldung).toContain('Eintrag 2 von 2');
  });
});
