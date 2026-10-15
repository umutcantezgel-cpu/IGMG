import { randomBytes, randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { schema } from '@/lib/db';
import { verschluessele } from '@/lib/krypto';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Push zum Thema „Ankündigung“ (ADR 0034 Nr. 3, Z-01): Beim Veröffentlichen geht genau eine Benachrichtigung an jedes Abo
 * mit diesem Thema – ohne Inhalt und ohne Namen, mit dem Pfad der Nachrichtenseite in der Sprache des Abos. Nicht bei
 * Entwurf, nicht ohne Recht `push.ankuendigung`, nicht bei ausgeschaltetem Schalter `push`, Kinder nur mit Einwilligung.
 * Ankündigungen mit späterem Beginn sendet der Minutentakt; vorher verfällt der Cache-Tag `ankuendigungen` sofort.
 * Der Push-Dienst ist eine Attrappe (`sendePush`); sie merkt sich, welche Tags beim Senden schon verfallen waren.
 */
const gesendet: { nutzlast: Record<string, unknown>; thema?: string; verfallenVorher: string[] }[] = [];
vi.mock('@/lib/push/senden', async (original) => ({
  ...(await original<typeof import('@/lib/push/senden')>()),
  sendePush: async (_ziel: unknown, nutzlast: Record<string, unknown>, _vapid: unknown, optionen: { thema?: string } = {}) => {
    gesendet.push({ nutzlast, thema: optionen.thema, verfallenVorher: [...aufrufe.revalidateTag] });
    return { ok: true, status: 201, entfernen: false };
  },
}));

const { client, db } = await verwaltungsUmgebung();
const { speichereAnkuendigung } = await import('@/server/actions/ankuendigungen');
const { sendeAnkuendigungsPush, sendeFaelligeAnkuendigungen, ankuendigungsPfad } = await import('@/lib/push/ankuendigung');
const { erzeugeVapid, vapidAusUmgebung } = await import('@/lib/push/vapid');
const { pushEinwilligungsVersion } = await import('@/lib/push/einwilligung');
const takt = await import('@/app/api/wartung/takt/route');
afterAll(() => client.close());

const WARTUNG = randomBytes(32).toString('base64');

beforeAll(() => {
  process.env.VAPID_PRIVAT = erzeugeVapid().privat;
  process.env.VAPID_KONTAKT = 'mailto:technik@example.test';
  process.env.WARTUNG_TOKEN = WARTUNG;
});
afterAll(() => {
  delete process.env.VAPID_PRIVAT;
  delete process.env.VAPID_KONTAKT;
});
beforeEach(async () => {
  gesendet.length = 0;
  await db.delete(schema.pushVersand);
  await db.delete(schema.pushAbo);
});
afterEach(() => {
  delete process.env.FUNKTION_PUSH;
});

/** Abo direkt in der Datenbank (der Abo-Weg selbst ist in push.test.ts geprüft). */
async function abo(themen: string[], sprache = 'de', benutzerId: string | null = null, version = pushEinwilligungsVersion('de', false)) {
  const v = verschluessele(`https://fcm.googleapis.com/fcm/send/${randomUUID()}`);
  const [z] = await db
    .insert(schema.pushAbo)
    .values({
      benutzerId,
      endpointVerschluesselt: v.daten,
      schluesselId: v.schluesselId,
      endpointHmac: randomUUID(),
      p256dh: 'x',
      auth: 'y',
      sprache,
      themen,
      einwilligungVersion: version,
    })
    .returning({ id: schema.pushAbo.id });
  return z.id;
}

/** Kinderkonto (Lernende/r mit Benutzerkonto), optional mit Einwilligung „Push für das Kind“. */
async function kind(mitEinwilligung: boolean): Promise<string> {
  const id = randomUUID();
  await db.insert(schema.user).values({ id, name: 'Kind T.', email: `kind.${id.slice(0, 8)}@example.test`, emailVerified: true });
  const v = verschluessele({ name: 'Kind' });
  const [l] = await db
    .insert(schema.lernende)
    .values({ benutzerId: id, datenVerschluesselt: v.daten, schluesselId: v.schluesselId, anzeigename: 'Kind T.' })
    .returning({ id: schema.lernende.id });
  if (mitEinwilligung) await db.insert(schema.kontoEinwilligung).values({ lernendeId: l.id, art: 'push_kind', textVersion: 'v1' });
  return id;
}

function eingabe(titel: string, zusatz: Record<string, string> = {}) {
  return {
    titelDe: titel,
    inhaltDe: 'Testtext für die Ankündigung.',
    prioritaet: 'mittel',
    organisation: '',
    status: 'veroeffentlicht',
    ...zusatz,
  };
}

/** Anlegen über die Action (endet mit Weiterleitung auf den Datensatz). */
async function anlegen(werte: Record<string, string>): Promise<string> {
  const ergebnis: unknown = await speichereAnkuendigung({}, formular(werte)).catch((e: unknown) => e);
  const treffer = /\/verwaltung\/ankuendigungen\/([0-9a-f-]{36})\?angelegt=1$/.exec((ergebnis as { ziel?: string }).ziel ?? '');
  expect(treffer).not.toBeNull();
  return treffer![1];
}

/** Was die Action nach der Antwort angestoßen hat (`after`), ausführen. */
async function nachDerAntwort() {
  for (const f of aufrufe.nachher.splice(0)) await f();
}

describe('Push „Ankündigung“ beim Veröffentlichen', () => {
  it('genau einmal je Abo mit Thema; Nutzlast nur Art, Pfad und Sprache; Kinder nur mit Einwilligung; alte Einwilligung nicht', async () => {
    const de = await abo(['ankuendigung']);
    await abo(['gebet', 'ankuendigung'], 'tr');
    await abo(['gebet'], 'en');
    await abo(['ankuendigung'], 'de', null, 'push-veraltet');
    await abo(['ankuendigung'], 'en', await kind(false));
    await abo(['ankuendigung'], 'en', await kind(true));

    await angemeldetAls([{ rolle: 'redaktion' }]);
    const id = await anlegen(eingabe('Push Sofort'));
    expect(gesendet).toHaveLength(0);
    await nachDerAntwort();
    expect(gesendet.map((g) => g.nutzlast).sort((a, b) => String(a.sprache).localeCompare(String(b.sprache)))).toEqual([
      { art: 'ankuendigung', pfad: '/nachrichten', sprache: 'de' },
      { art: 'ankuendigung', pfad: '/en/news', sprache: 'en' },
      { art: 'ankuendigung', pfad: '/tr/haberler', sprache: 'tr' },
    ]);
    expect(gesendet.every((g) => g.thema === 'ankuendigung')).toBe(true);
    // Kein Titel, kein Text, kein Name in der Nutzlast (S-16)
    expect(JSON.stringify(gesendet)).not.toMatch(/Push Sofort|Testtext|Kind T\./);
    expect(
      await db
        .select()
        .from(schema.pushVersand)
        .where(eq(schema.pushVersand.schluessel, `ankuendigung|${de}|${id}`)),
    ).toHaveLength(1);

    // Zweiter Lauf und erneutes Veröffentlichen nach Entwurf: kein Doppelversand
    gesendet.length = 0;
    expect(await sendeAnkuendigungsPush(id)).toBe(0);
    await angemeldetAls([{ rolle: 'redaktion' }]);
    await speichereAnkuendigung({}, formular(eingabe('Push Sofort', { id, status: 'entwurf' })));
    await speichereAnkuendigung({}, formular(eingabe('Push Sofort', { id })));
    await nachDerAntwort();
    expect(gesendet).toHaveLength(0);
  });

  it('nichts bei Entwurf, bei bloßem Bearbeiten, ohne Recht (Organisationsredaktion) und bei ausgeschaltetem Schalter', async () => {
    await abo(['ankuendigung']);
    await angemeldetAls([{ rolle: 'redaktion' }]);
    const entwurf = await anlegen(eingabe('Push Entwurf', { status: 'entwurf' }));
    await nachDerAntwort();
    expect(gesendet).toHaveLength(0);

    // Bearbeiten einer schon veröffentlichten Ankündigung löst nichts aus
    const sofort = await anlegen(eingabe('Push Bearbeiten'));
    await nachDerAntwort();
    expect(gesendet).toHaveLength(1);
    // Einmal-Schlüssel entfernen: Ein Versand fiele jetzt auf, wenn das Bearbeiten ihn auslöste
    gesendet.length = 0;
    await db.delete(schema.pushVersand);
    await speichereAnkuendigung({}, formular(eingabe('Push Bearbeiten geändert', { id: sofort })));
    await nachDerAntwort();
    expect(gesendet).toHaveLength(0);

    await angemeldetAls([{ rolle: 'organisationsredaktion', organisation: 'gt' }]);
    await anlegen(eingabe('Push Organisation', { organisation: 'gt' }));
    await nachDerAntwort();
    expect(gesendet).toHaveLength(0);

    // Auch wenn eine Person ohne Recht zuletzt gespeichert hat, sendet der Versand selbst nicht
    const ohneRecht = await angemeldetAls([{ rolle: 'organisationsredaktion', organisation: 'gt' }]);
    await db
      .update(schema.ankuendigung)
      .set({ status: 'veroeffentlicht', aktualisiertVon: ohneRecht })
      .where(eq(schema.ankuendigung.id, entwurf));
    expect(await sendeAnkuendigungsPush(entwurf)).toBe(0);

    process.env.FUNKTION_PUSH = 'aus';
    await angemeldetAls([{ rolle: 'administration' }]);
    await anlegen(eingabe('Push Schalter aus'));
    await nachDerAntwort();
    expect(gesendet).toHaveLength(0);
  });
});

describe('Push „Ankündigung“ mit späterem Beginn (Minutentakt)', () => {
  it('beim Veröffentlichen nichts; nach Beginn sendet der Takt genau einmal; abgelaufene und alte nicht', async () => {
    await abo(['ankuendigung']);
    await angemeldetAls([{ rolle: 'redaktion' }]);
    const morgen = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const datum = morgen.toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' });
    const id = await anlegen(eingabe('Push Später', { sichtbarAbDatum: datum, sichtbarAbZeit: '10:00' }));
    await nachDerAntwort();
    expect(gesendet).toHaveLength(0);

    const [z] = await db.select().from(schema.ankuendigung).where(eq(schema.ankuendigung.id, id));
    const vapid = vapidAusUmgebung()!;
    const beginn = z.sichtbarAb!.getTime();
    expect(await sendeFaelligeAnkuendigungen(vapid, new Date(beginn - 60_000))).toBe(0);
    expect(await sendeFaelligeAnkuendigungen(vapid, new Date(beginn + 60_000))).toBe(1);
    expect(gesendet[0].nutzlast).toEqual({ art: 'ankuendigung', pfad: ankuendigungsPfad('de'), sprache: 'de' });
    expect(await sendeFaelligeAnkuendigungen(vapid, new Date(beginn + 120_000))).toBe(0);
    // Nach dem Nachholfenster (2 h) nicht mehr – auch nicht für ein neues Abo
    await abo(['ankuendigung']);
    expect(await sendeFaelligeAnkuendigungen(vapid, new Date(beginn + 3 * 60 * 60 * 1000))).toBe(0);
  });

  it('Takt-Route: liefert die Zahl der Ankündigungen, auch wenn Gebetserinnerungen aus sind', async () => {
    const mit = () =>
      new Request('https://example.test/api/wartung/takt', { method: 'POST', headers: { authorization: `Bearer ${WARTUNG}` } });
    process.env.FUNKTION_PUSH_GEBET = 'aus';
    try {
      const r = await takt.POST(mit());
      expect(r.status).toBe(200);
      expect(await r.json()).toMatchObject({ gebetsErinnerungen: 0, ankuendigungen: 0 });
    } finally {
      delete process.env.FUNKTION_PUSH_GEBET;
    }
    process.env.FUNKTION_PUSH = 'aus';
    expect(await (await takt.POST(mit())).json()).toEqual({ aus: true });
  });

  it('Takt mit fälliger Ankündigung: Cache-Tag „ankuendigungen“ verfällt sofort und vor dem Versand (N3)', async () => {
    const mit = () =>
      new Request('https://example.test/api/wartung/takt', { method: 'POST', headers: { authorization: `Bearer ${WARTUNG}` } });
    await abo(['ankuendigung']);
    await angemeldetAls([{ rolle: 'redaktion' }]);
    const morgen = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' });
    const id = await anlegen(eingabe('Push Cache', { sichtbarAbDatum: morgen, sichtbarAbZeit: '10:00' }));
    // Was das Speichern selbst verfallen lässt (`inhaltGeaendert`), gehört nicht zum Takt
    aufrufe.nachher.length = 0;
    aufrufe.revalidateTag.length = 0;
    aufrufe.revalidateProfil.length = 0;
    process.env.FUNKTION_PUSH_GEBET = 'aus';
    try {
      // Vor dem Beginn: nichts fällig, nichts verfällt
      expect(await (await takt.POST(mit())).json()).toMatchObject({ ankuendigungen: 0 });
      expect(aufrufe.revalidateTag).toEqual([]);
      expect(gesendet).toHaveLength(0);

      // Beginn liegt eine Minute zurück: Tag verfällt sofort (kein veralteter Stand), erst danach geht der Push hinaus
      await db
        .update(schema.ankuendigung)
        .set({ sichtbarAb: new Date(Date.now() - 60_000) })
        .where(eq(schema.ankuendigung.id, id));
      expect(await (await takt.POST(mit())).json()).toMatchObject({ ankuendigungen: 1 });
      expect(aufrufe.revalidateTag).toEqual(['ankuendigungen']);
      expect(aufrufe.revalidateProfil).toEqual([{ expire: 0 }]);
      expect(gesendet).toHaveLength(1);
      expect(gesendet[0].verfallenVorher).toEqual(['ankuendigungen']);

      // Folgetakt im Nachholfenster: kein zweiter Push, der Tag verfällt erneut (ein verspäteter Seitenaufbau hält
      // sich höchstens eine Minute)
      expect(await (await takt.POST(mit())).json()).toMatchObject({ ankuendigungen: 0 });
      expect(gesendet).toHaveLength(1);
      expect(aufrufe.revalidateTag).toEqual(['ankuendigungen', 'ankuendigungen']);
    } finally {
      delete process.env.FUNKTION_PUSH_GEBET;
      await db.update(schema.ankuendigung).set({ status: 'entwurf' }).where(eq(schema.ankuendigung.id, id));
    }
  });
});
