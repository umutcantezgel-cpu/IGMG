import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { entschluessele, verschluessele } from '@/lib/krypto';
import { verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * V-06 (Kern K-013): Wartung läuft als Vercel Cron. `GET` mit `Authorization: Bearer <CRON_SECRET>` (täglich),
 * `POST` mit WARTUNG_TOKEN bleibt für Handaufrufe. Beide Wege sind idempotent; die Sperre liegt in `mitSperre`
 * (Belegung auf echtem PostgreSQL: `wartung-sperre-postgres.test.ts`). Mails gehen in den Datei-Transport (G-02).
 */
const { client, db } = await verwaltungsUmgebung();
const loesch = await import('@/app/api/wartung/loeschfristen/route');
const mail = await import('@/app/api/wartung/mail-ausgang/route');
afterAll(() => client.close());

const CRON = randomBytes(32).toString('base64');
const WARTUNG = randomBytes(32).toString('base64');
const vorher = { cron: process.env.CRON_SECRET, wartung: process.env.WARTUNG_TOKEN };
beforeAll(() => {
  process.env.CRON_SECRET = CRON;
  process.env.WARTUNG_TOKEN = WARTUNG;
});
afterAll(() => {
  if (vorher.cron === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = vorher.cron;
  if (vorher.wartung === undefined) delete process.env.WARTUNG_TOKEN;
  else process.env.WARTUNG_TOKEN = vorher.wartung;
});

const anfrage = (methode: 'GET' | 'POST', auth?: string) =>
  new Request('https://example.test/api/wartung', { method: methode, headers: auth ? { authorization: auth } : {} });
const bearer = (geheimnis: string) => `Bearer ${geheimnis}`;

async function faelligerEingang(): Promise<string> {
  const p = verschluessele({ name: 'Testperson Neun', email: 'testperson.neun@example.test' });
  const [z] = await db
    .insert(schema.eingang)
    .values({
      art: 'kontakt',
      datenVerschluesselt: p.daten,
      schluesselId: p.schluesselId,
      loeschenAb: new Date(Date.now() - 86_400_000),
    })
    .returning({ id: schema.eingang.id });
  return z.id;
}

describe('Löschfristen per Cron (GET, CRON_SECRET)', () => {
  it('ohne Authorization → 401', async () => {
    expect((await loesch.GET(anfrage('GET'))).status).toBe(401);
  });

  it('mit falschem CRON_SECRET → 401', async () => {
    expect((await loesch.GET(anfrage('GET', bearer(randomBytes(32).toString('base64'))))).status).toBe(401);
  });

  it('mit dem WARTUNG_TOKEN statt CRON_SECRET → 401 (die beiden Wege sind getrennt)', async () => {
    expect((await loesch.GET(anfrage('GET', bearer(WARTUNG)))).status).toBe(401);
  });

  it('mit zu kurzem CRON_SECRET gesperrt, auch mit genau diesem Wert → 401', async () => {
    const vorherCron = process.env.CRON_SECRET;
    process.env.CRON_SECRET = 'kurz-aber-falsch-lang'; // 22 Zeichen
    try {
      expect((await loesch.GET(anfrage('GET', bearer('kurz-aber-falsch-lang')))).status).toBe(401);
    } finally {
      process.env.CRON_SECRET = vorherCron;
    }
  });

  it('mit richtigem CRON_SECRET → 200, Zähler als JSON, no-store', async () => {
    const antwort = await loesch.GET(anfrage('GET', bearer(CRON)));
    expect(antwort.status).toBe(200);
    expect(antwort.headers.get('cache-control')).toBe('no-store');
    const body = await antwort.json();
    expect(body).toEqual({
      geloeschteEingaenge: expect.any(Number),
      geloeschteMails: expect.any(Number),
      geloeschtAusPapierkorb: expect.any(Number),
      entfernteMelderdaten: expect.any(Number),
      geloeschteChatNachrichten: expect.any(Number),
      geloeschteChatMeldungen: expect.any(Number),
      geloeschtePushAbos: expect.any(Number),
      geloeschteLernende: expect.any(Number),
      geloeschteOffeneMeldungen: expect.any(Number),
      geloeschteProtokolleintraege: expect.any(Number),
      geloeschteUnzustellbareMails: expect.any(Number),
      geloeschteAuditEintraege: expect.any(Number),
      geloeschteKonten: expect.any(Number),
      geloeschteUnbestaetigteKonten: expect.any(Number),
    });
  });

  it('löscht den fälligen Eingang und ist beim zweiten Lauf ohne Wirkung (idempotent)', async () => {
    const id = await faelligerEingang();
    const erster = await (await loesch.GET(anfrage('GET', bearer(CRON)))).json();
    expect(erster.geloeschteEingaenge).toBeGreaterThanOrEqual(1);
    expect(await db.select().from(schema.eingang).where(eq(schema.eingang.id, id))).toHaveLength(0);
    const zweiter = await (await loesch.GET(anfrage('GET', bearer(CRON)))).json();
    expect(zweiter).toMatchObject({ geloeschteEingaenge: 0 });
  });
});

describe('Löschfristen per Handaufruf (POST, WARTUNG_TOKEN) bleibt', () => {
  it('mit WARTUNG_TOKEN → 200 mit Zählern', async () => {
    const antwort = await loesch.POST(anfrage('POST', bearer(WARTUNG)));
    expect(antwort.status).toBe(200);
    expect(await antwort.json()).toMatchObject({ geloeschteEingaenge: expect.any(Number) });
  });

  it('mit CRON_SECRET am POST-Weg → 401, ohne Token → 401', async () => {
    expect((await loesch.POST(anfrage('POST', bearer(CRON)))).status).toBe(401);
    expect((await loesch.POST(anfrage('POST'))).status).toBe(401);
  });
});

describe('Mail-Ausgang per Cron (GET) und Handaufruf (POST)', () => {
  async function mailEintrag(extra: Partial<typeof schema.mailAusgang.$inferInsert> = {}) {
    const p = verschluessele({ an: 'testperson.post@example.test', daten: { art: 'kontakt' } });
    const [z] = await db
      .insert(schema.mailAusgang)
      .values({
        vorlage: 'bestaetigung',
        sprache: 'de',
        datenVerschluesselt: p.daten,
        schluesselId: p.schluesselId,
        naechsterVersuch: new Date(Date.now() - 60_000),
        ...extra,
      })
      .returning({ id: schema.mailAusgang.id });
    return z.id;
  }

  it('ohne Cron-Geheimnis → 401, und keine Mail wird versendet', async () => {
    const id = await mailEintrag();
    expect((await mail.GET(anfrage('GET'))).status).toBe(401);
    const [z] = await db.select().from(schema.mailAusgang).where(eq(schema.mailAusgang.id, id));
    expect(z.gesendetAm).toBeNull();
    // Die offene Mail wegräumen, damit sie den nächsten Lauf nicht verfälscht
    await db.delete(schema.mailAusgang).where(eq(schema.mailAusgang.id, id));
  });

  it('verarbeitet offene Mails, lässt versendete und zurückgestellte unberührt', async () => {
    const offen1 = await mailEintrag();
    const offen2 = await mailEintrag();
    const schonGesendet = await mailEintrag({ gesendetAm: new Date(Date.now() - 3_600_000) });
    const spaeter = await mailEintrag({ naechsterVersuch: new Date(Date.now() + 86_400_000) });

    const antwort = await mail.GET(anfrage('GET', bearer(CRON)));
    expect(antwort.status).toBe(200);
    expect(antwort.headers.get('cache-control')).toBe('no-store');
    expect(await antwort.json()).toMatchObject({ gesendet: 2, fehler: 0 });

    const zeile = async (id: string) => (await db.select().from(schema.mailAusgang).where(eq(schema.mailAusgang.id, id)))[0];
    expect((await zeile(offen1)).gesendetAm).not.toBeNull();
    expect((await zeile(offen2)).gesendetAm).not.toBeNull();
    expect((await zeile(spaeter)).gesendetAm).toBeNull();
    expect((await zeile(schonGesendet)).versuche).toBe(0);
  });

  it('die versendete Mail ist nicht mehr offen: zweiter Lauf sendet nichts', async () => {
    expect(await (await mail.GET(anfrage('GET', bearer(CRON)))).json()).toMatchObject({ gesendet: 0, fehler: 0 });
  });

  it('POST mit WARTUNG_TOKEN → 200 (Handaufruf)', async () => {
    const id = await mailEintrag();
    const antwort = await mail.POST(anfrage('POST', bearer(WARTUNG)));
    expect(antwort.status).toBe(200);
    expect(await antwort.json()).toMatchObject({ gesendet: 1 });
    const [z] = await db.select().from(schema.mailAusgang).where(eq(schema.mailAusgang.id, id));
    expect(z.gesendetAm).not.toBeNull();
    // Der Entwurf bleibt verschlüsselt und ist nach dem Versand unverändert lesbar
    expect(entschluessele<{ an: string }>(z.datenVerschluesselt, z.schluesselId).an).toBe('testperson.post@example.test');
  });
});
