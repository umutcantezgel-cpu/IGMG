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
  return fuehreStartklarAus({ env, db: datenbank, dnsPruefen: false, jetzt: new Date('2026-10-11T12:00:00Z') });
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
