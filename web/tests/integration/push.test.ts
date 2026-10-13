import { createECDH, randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { schema } from '@/lib/db';
import { zeitpunkt, berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { erzeugeVapid } from '@/lib/push/vapid';
import { base64url } from '@/lib/push/verschluesselung';
import { angemeldetAls, aufrufe, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Web Push (ADR 0034): Abo an-/abmelden über die API, Endpunkt verschlüsselt, Takt sendet fällige Gebetserinnerungen
 * genau einmal, dauerhafte Fehler löschen das Abo. Der Push-Dienst ist durch eine Attrappe ersetzt (fetch).
 */
const { client, db } = await verwaltungsUmgebung();
const abo = await import('@/app/api/push/abo/route');
const takt = await import('@/app/api/wartung/takt/route');
const { fuehreTaktAus } = await import('@/lib/push/abo');
const { vapidAusUmgebung } = await import('@/lib/push/vapid');
const { ladeGebetszeitenFenster } = await import('@/server/queries/gebetszeiten');
afterAll(() => client.close());

const WARTUNG = randomBytes(32).toString('base64');
const gesendet: { url: string; kopf: Record<string, string>; bytes: number }[] = [];
let antwortStatus = 201;

beforeAll(() => {
  process.env.VAPID_PRIVAT = erzeugeVapid().privat;
  process.env.VAPID_KONTAKT = 'mailto:technik@example.test';
  process.env.WARTUNG_TOKEN = WARTUNG;
  vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
    gesendet.push({ url, kopf: init.headers as Record<string, string>, bytes: (init.body as Uint8Array).length });
    return new Response(null, { status: antwortStatus });
  });
});
afterAll(() => {
  vi.unstubAllGlobals();
  delete process.env.VAPID_PRIVAT;
  delete process.env.VAPID_KONTAKT;
});
beforeEach(async () => {
  gesendet.length = 0;
  antwortStatus = 201;
  await angemeldetAls(null);
});

function browserAbo(host = 'fcm.googleapis.com') {
  const ecdh = createECDH('prime256v1');
  ecdh.generateKeys();
  return {
    endpoint: `https://${host}/fcm/send/${randomBytes(12).toString('hex')}`,
    keys: { p256dh: base64url(ecdh.getPublicKey()), auth: base64url(randomBytes(16)) },
  };
}

const anfrage = (methode: 'POST' | 'DELETE', koerper: unknown, kopf: Record<string, string> = {}) =>
  new Request('https://example.test/api/push/abo', {
    method: methode,
    headers: { 'content-type': 'application/json', 'sec-fetch-site': 'same-origin', ...kopf },
    body: JSON.stringify(koerper),
  });

const eingabe = (a = browserAbo(), extra: Record<string, unknown> = {}) => ({
  abo: a,
  themen: ['gebet'],
  gebete: ['ogle', 'aksam'],
  minutenVorher: 10,
  sprache: 'de',
  einwilligung: true,
  ...extra,
});

describe('Push-Abo über die API', () => {
  it('speichert verschlüsselt, ohne Klartext-Endpunkt, und sendet eine Probe', async () => {
    const a = browserAbo();
    const r = await abo.POST(anfrage('POST', eingabe(a)));
    expect(r.status).toBe(200);
    expect(await r.json()).toMatchObject({ gespeichert: true, neu: true });
    const zeilen = await db.select().from(schema.pushAbo);
    expect(zeilen).toHaveLength(1);
    expect(Buffer.from(zeilen[0].endpointVerschluesselt).toString('utf8')).not.toContain(a.endpoint);
    expect(zeilen[0].endpointHmac).not.toContain('fcm');
    expect(zeilen[0].einwilligungVersion).toMatch(/^push-[0-9a-f]{16}$/);
    // Probe-Benachrichtigung nach der Antwort
    for (const f of aufrufe.nachher) await f();
    expect(gesendet).toHaveLength(1);
    expect(gesendet[0].kopf['Content-Encoding']).toBe('aes128gcm');
    expect(gesendet[0].kopf.Authorization).toMatch(/^vapid t=.+, k=.+$/);
  });

  it('dasselbe Abo erneut: aktualisiert statt doppelt', async () => {
    const a = browserAbo();
    await abo.POST(anfrage('POST', eingabe(a)));
    const vorher = (await db.select().from(schema.pushAbo)).length;
    const r = await abo.POST(anfrage('POST', eingabe(a, { minutenVorher: 20 })));
    expect(await r.json()).toMatchObject({ neu: false });
    expect((await db.select().from(schema.pushAbo)).length).toBe(vorher);
  });

  it('weist fremde Herkunft, unbekannte Push-Dienste und fehlende Einwilligung ab', async () => {
    expect((await abo.POST(anfrage('POST', eingabe(), { 'sec-fetch-site': 'cross-site' }))).status).toBe(400);
    expect((await abo.POST(anfrage('POST', eingabe(browserAbo('evil.example'))))).status).toBe(400);
    expect((await abo.POST(anfrage('POST', eingabe(browserAbo(), { einwilligung: false })))).status).toBe(400);
    expect((await abo.POST(anfrage('POST', eingabe(browserAbo(), { themen: [] })))).status).toBe(400);
  });

  it('ohne Konto nur Gebet und Ankündigung (Chat/Unterricht gehören zu einer Person)', async () => {
    const r = await abo.POST(anfrage('POST', eingabe(browserAbo(), { themen: ['gebet', 'chat', 'unterricht', 'ankuendigung'] })));
    expect((await r.json()).themen).toEqual(['gebet', 'ankuendigung']);
  });

  it('Abmelden löscht das Abo und verrät nichts', async () => {
    const a = browserAbo();
    await abo.POST(anfrage('POST', eingabe(a)));
    const r = await abo.DELETE(anfrage('DELETE', { endpoint: a.endpoint }));
    expect(r.status).toBe(204);
    expect((await abo.DELETE(anfrage('DELETE', { endpoint: a.endpoint }))).status).toBe(204);
  });
});

describe('Takt: Gebetserinnerungen', () => {
  it('sendet fällige Erinnerungen genau einmal; 410 löscht das Abo', async () => {
    await db.delete(schema.pushAbo);
    const a = browserAbo();
    await abo.POST(anfrage('POST', eingabe(a, { gebete: ['ogle'], minutenVorher: 10 })));
    gesendet.length = 0;
    const fenster = await ladeGebetszeitenFenster();
    const heute = fenster.tage.find((t) => t.datum === berlinerDatum(new Date()))!;
    const jetzt = new Date(zeitpunkt(heute.datum, heute.ogle).getTime() - 10 * 60_000 + 20_000);
    const vapid = vapidAusUmgebung()!;
    expect((await fuehreTaktAus(vapid, jetzt)).gebetsErinnerungen).toBe(1);
    expect(gesendet[0].kopf.Topic).toBe('gebet-ogle');
    expect((await fuehreTaktAus(vapid, jetzt)).gebetsErinnerungen).toBe(0);
    // Zu früh: nichts
    expect((await fuehreTaktAus(vapid, new Date(jetzt.getTime() - 30 * 60_000))).gebetsErinnerungen).toBe(0);

    // Push-Dienst meldet „Gone“: Abo wird gelöscht
    await db.delete(schema.pushVersand);
    antwortStatus = 410;
    const ergebnis = await fuehreTaktAus(vapid, jetzt);
    expect(ergebnis.fehlgeschlagen).toBe(1);
    expect(await db.select().from(schema.pushAbo).where(eq(schema.pushAbo.p256dh, a.keys.p256dh))).toHaveLength(0);
  });

  it('Takt-Route nur mit Wartungs-Token', async () => {
    const ohne = new Request('https://example.test/api/wartung/takt', { method: 'POST' });
    expect((await takt.POST(ohne)).status).toBe(401);
    const mit = new Request('https://example.test/api/wartung/takt', { method: 'POST', headers: { authorization: `Bearer ${WARTUNG}` } });
    const r = await takt.POST(mit);
    expect(r.status).toBe(200);
    expect(await r.json()).toHaveProperty('gebetsErinnerungen');
  });
});

describe('Meldungen des lokalen Servers (ADR 0036)', () => {
  it('nur mit Token; speichert je Art den letzten Stand', async () => {
    const route = await import('@/app/api/wartung/lokal-meldung/route');
    const anfrage = (koerper: unknown, token = WARTUNG) =>
      new Request('https://example.test/api/wartung/lokal-meldung', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify(koerper),
      });
    expect((await route.POST(anfrage({ art: 'sicherung', ok: true, bytes: 1 }, 'falsch'.repeat(8)))).status).toBe(401);
    expect((await route.POST(anfrage({ art: 'unbekannt', ok: true, bytes: 1 }))).status).toBe(400);
    expect((await route.POST(anfrage({ art: 'sicherung', ok: true, bytes: 1234 }))).status).toBe(200);
    expect((await route.POST(anfrage({ art: 'probe', ok: false, bytes: 0 }))).status).toBe(200);
    const [z] = await db.select().from(schema.einstellung).where(eq(schema.einstellung.schluessel, 'lokaler_server'));
    expect(z.wert).toMatchObject({ sicherung: { ok: true, bytes: 1234 }, probe: { ok: false } });
  });
});
