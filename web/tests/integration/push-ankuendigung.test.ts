import { randomBytes, randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { schema } from '@/lib/db';
import { verschluessele } from '@/lib/krypto';
import { alsRouteHandler, angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Push zum Thema „Ankündigung“ (ADR 0034 Nr. 3, Z-01): Beim Veröffentlichen geht genau eine Benachrichtigung an jedes Abo
 * mit diesem Thema – ohne Inhalt und ohne Namen, mit dem Pfad der Nachrichtenseite in der Sprache des Abos. Nicht bei
 * Entwurf, nicht ohne Recht `push.ankuendigung`, nicht bei ausgeschaltetem Schalter `push`, Kinder nur mit Einwilligung.
 * Ankündigungen mit späterem Beginn sendet der Minutentakt zweiphasig: Ein Takt lässt den Cache-Tag `ankuendigungen`
 * sofort verfallen, gesendet wird frühestens im nächsten. Der Push-Dienst ist eine Attrappe (`sendePush`); sie merkt sich,
 * welche Verfälle beim Senden schon angewendet waren – nicht bloß aufgerufen (Next wendet sie im Route Handler erst nach
 * dessen Rückkehr an, nachgebildet in `alsRouteHandler`).
 */
const gesendet: { nutzlast: Record<string, unknown>; thema?: string; verfallenBeimSenden: string[] }[] = [];
vi.mock('@/lib/push/senden', async (original) => ({
  ...(await original<typeof import('@/lib/push/senden')>()),
  sendePush: async (_ziel: unknown, nutzlast: Record<string, unknown>, _vapid: unknown, optionen: { thema?: string } = {}) => {
    gesendet.push({ nutzlast, thema: optionen.thema, verfallenBeimSenden: [...aufrufe.verfallen] });
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

/** Was das Speichern selbst verfallen lässt (`inhaltGeaendert`), gehört nicht zum Takt. */
function vergissCacheAufrufe() {
  for (const liste of [aufrufe.revalidateTag, aufrufe.revalidateProfil, aufrufe.ausstehend, aufrufe.verfallen]) liste.length = 0;
}

/** Ankündigung mit Beginn morgen 10:00 (Berliner Zeit), angelegt von der Redaktion; liefert Id und Beginn. */
async function mitSpaeteremBeginn(titel: string): Promise<{ id: string; beginn: number }> {
  await angemeldetAls([{ rolle: 'redaktion' }]);
  const morgen = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' });
  const id = await anlegen(eingabe(titel, { sichtbarAbDatum: morgen, sichtbarAbZeit: '10:00' }));
  await nachDerAntwort();
  vergissCacheAufrufe();
  const [z] = await db.select().from(schema.ankuendigung).where(eq(schema.ankuendigung.id, id));
  return { id, beginn: z.sichtbarAb!.getTime() };
}

const MINUTE = 60_000;
const STUNDE = 60 * MINUTE;

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
  // Jeder Fall beginnt ohne veröffentlichte Ankündigungen aus vorigen Fällen (alle mit Beginn morgen 10:00)
  beforeEach(async () => {
    await db.update(schema.ankuendigung).set({ status: 'entwurf' });
  });

  it('beim Veröffentlichen nichts; nach Beginn erst Verfall, im nächsten Takt genau ein Versand; alte nicht', async () => {
    await abo(['ankuendigung']);
    const { beginn } = await mitSpaeteremBeginn('Push Später');
    expect(gesendet).toHaveLength(0);
    const vapid = vapidAusUmgebung()!;
    const taktUm = (abstand: number) => sendeFaelligeAnkuendigungen(vapid, new Date(beginn + abstand));

    expect(await taktUm(-MINUTE)).toBe(0);
    expect(aufrufe.revalidateTag).toEqual([]);
    // Zwei Sekunden nach dem Beginn: noch kein Verfall – ein Seitenaufbau mit dem Stand davor könnte noch laufen
    expect(await taktUm(2_000)).toBe(0);
    expect(aufrufe.revalidateTag).toEqual([]);
    // Erster Takt danach: sofortiger Verfall, aber kein Versand in demselben Takt
    expect(await taktUm(MINUTE)).toBe(0);
    expect(aufrufe.revalidateTag).toEqual(['ankuendigungen']);
    expect(aufrufe.revalidateProfil).toEqual([{ expire: 0 }]);
    expect(gesendet).toHaveLength(0);
    // Zehn Sekunden später (kein voller Takt, z. B. ein Aufruf von Hand): weder Versand noch zweiter Verfall
    expect(await taktUm(MINUTE + 10_000)).toBe(0);
    expect(gesendet).toHaveLength(0);
    // Nächster Takt: genau ein Versand, ohne erneuten Verfall
    expect(await taktUm(2 * MINUTE)).toBe(1);
    expect(gesendet[0].nutzlast).toEqual({ art: 'ankuendigung', pfad: ankuendigungsPfad('de'), sprache: 'de' });
    expect(await taktUm(3 * MINUTE)).toBe(0);
    expect(aufrufe.revalidateTag).toEqual(['ankuendigungen']);
    // Nach dem Nachholfenster (2 h) nicht mehr – auch nicht für ein neues Abo
    await abo(['ankuendigung']);
    expect(await taktUm(3 * STUNDE)).toBe(0);
    expect(gesendet).toHaveLength(1);
  });

  it('Verfall kurz vor Ende des Nachholfensters wird nach ausgefallenen Takten noch versendet; danach kein neuer Verfall', async () => {
    await abo(['ankuendigung']);
    const vapid = vapidAusUmgebung()!;
    const spaet = await mitSpaeteremBeginn('Push Nachlauf');
    // Der Takt lag fast zwei Stunden still: Sein erster Lauf lässt verfallen, die nächsten beiden fallen aus
    expect(await sendeFaelligeAnkuendigungen(vapid, new Date(spaet.beginn + 2 * STUNDE - MINUTE))).toBe(0);
    expect(aufrufe.revalidateTag).toEqual(['ankuendigungen']);
    expect(await sendeFaelligeAnkuendigungen(vapid, new Date(spaet.beginn + 2 * STUNDE + 2 * MINUTE))).toBe(1);

    // Ohne Verfall innerhalb des Fensters beginnt nach dessen Ende nichts mehr
    await db.update(schema.ankuendigung).set({ status: 'entwurf' });
    const verpasst = await mitSpaeteremBeginn('Push Verpasst');
    expect(await sendeFaelligeAnkuendigungen(vapid, new Date(verpasst.beginn + 2 * STUNDE + MINUTE))).toBe(0);
    expect(await sendeFaelligeAnkuendigungen(vapid, new Date(verpasst.beginn + 2 * STUNDE + 2 * MINUTE))).toBe(0);
    expect(aufrufe.revalidateTag).toEqual([]);
    expect(gesendet).toHaveLength(1);
  });

  it('verschobener Beginn braucht einen eigenen Verfall, bevor gesendet wird', async () => {
    await abo(['ankuendigung']);
    const vapid = vapidAusUmgebung()!;
    const { id, beginn } = await mitSpaeteremBeginn('Push Verschoben');
    expect(await sendeFaelligeAnkuendigungen(vapid, new Date(beginn + MINUTE))).toBe(0);
    expect(aufrufe.revalidateTag).toEqual(['ankuendigungen']);
    // Vor dem Versand verschiebt die Redaktion den Beginn um zehn Minuten (zwischendurch kann der Cache den Stand ohne
    // die Ankündigung wieder aufgenommen haben); die alte Marke zählt nicht
    const neu = beginn + 10 * MINUTE;
    await db
      .update(schema.ankuendigung)
      .set({ sichtbarAb: new Date(neu) })
      .where(eq(schema.ankuendigung.id, id));
    expect(await sendeFaelligeAnkuendigungen(vapid, new Date(neu + MINUTE))).toBe(0);
    expect(aufrufe.revalidateTag).toEqual(['ankuendigungen', 'ankuendigungen']);
    expect(gesendet).toHaveLength(0);
    expect(await sendeFaelligeAnkuendigungen(vapid, new Date(neu + 2 * MINUTE))).toBe(1);
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

  it('Takt-Route wie in Next: Beim Senden ist der Verfall von „ankuendigungen“ schon angewendet, nicht bloß vermerkt (N3)', async () => {
    // Der Verfall wirkt erst nach der Rückkehr der Route (`alsRouteHandler`); die Uhr läuft von Takt zu Takt eine Minute
    const taktLauf = async () =>
      (
        await alsRouteHandler(() =>
          takt.POST(
            new Request('https://example.test/api/wartung/takt', {
              method: 'POST',
              headers: { authorization: `Bearer ${WARTUNG}` },
            }),
          ),
        )
      ).json();
    // Kern der Prüfung: Kein Push geht hinaus, solange der Verfall nur vermerkt und noch nicht angewendet ist
    const ohneAngewendetenVerfall = () => gesendet.filter((g) => !g.verfallenBeimSenden.includes('ankuendigungen'));
    await abo(['ankuendigung']);
    await abo(['ankuendigung'], 'tr');
    const { id } = await mitSpaeteremBeginn('Push Cache');
    process.env.FUNKTION_PUSH_GEBET = 'aus';
    vi.useFakeTimers({ toFake: ['Date'], now: Date.now() });
    try {
      // Vor dem Beginn: nichts fällig, nichts verfällt
      expect(await taktLauf()).toMatchObject({ ankuendigungen: 0 });
      expect(aufrufe.revalidateTag).toEqual([]);

      // Beginn liegt eine Minute zurück. Dieser Takt lässt verfallen und sendet nicht: Während er läuft, ist der Verfall
      // nur vermerkt; angewendet ist er erst, nachdem die Route ihre Antwort zurückgegeben hat
      await db
        .update(schema.ankuendigung)
        .set({ sichtbarAb: new Date(Date.now() - MINUTE) })
        .where(eq(schema.ankuendigung.id, id));
      const erster = await taktLauf();
      expect(ohneAngewendetenVerfall()).toEqual([]);
      expect(erster).toMatchObject({ ankuendigungen: 0 });
      expect(aufrufe.revalidateProfil).toEqual([{ expire: 0 }]);
      expect(aufrufe.verfallen).toEqual(['ankuendigungen']);
      expect(gesendet).toHaveLength(0);

      // Nächster Takt eine Minute später: Versand an beide Abos, jeweils mit schon angewendetem Verfall
      vi.setSystemTime(Date.now() + MINUTE);
      expect(await taktLauf()).toMatchObject({ ankuendigungen: 2 });
      expect(gesendet).toHaveLength(2);
      expect(ohneAngewendetenVerfall()).toEqual([]);

      // Folgetakt: kein zweiter Push, kein weiterer Verfall
      vi.setSystemTime(Date.now() + MINUTE);
      expect(await taktLauf()).toMatchObject({ ankuendigungen: 0 });
      expect(gesendet).toHaveLength(2);
      expect(aufrufe.revalidateTag).toEqual(['ankuendigungen']);
    } finally {
      vi.useRealTimers();
      delete process.env.FUNKTION_PUSH_GEBET;
    }
  });
});
