import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { schema } from '@/lib/db';
import { berechneTag } from '@/lib/gebetszeiten/berechnung';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { STANDARD_EINSTELLUNGEN, type Tageszeiten } from '@/lib/gebetszeiten/typen';
import { alsRouteHandler, angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * IGMG-Abgleich der Gebetszeiten (ADR 0048) mit Fake-Feed (eingesetzter Abruf bzw. `fetch`-Ersatz, kein Netz):
 * Zugang (Cron und Wartung getrennt), nichts eingerichtet, Trockenlauf, Erstlauf mit Protokoll, Audit ohne Person und
 * Cache-Tags, Lauf ohne Änderung, Änderung mit größter Abweichung, Konflikt mit dem Import (nie überschrieben, Hinweis per
 * Mail), Serverfehler mit Wiederholung, Format- und Sommerzeitfehler (nichts geschrieben), auffällige Lieferung mit
 * Freigabe, Lader mit Quelle „igmg“ und Stand, Lese-API, eingefügte Tabelle in der Verwaltung.
 */
const { client, db } = await verwaltungsUmgebung();
const route = await import('@/app/api/wartung/gebetszeiten-abgleich/route');
const { gleicheAb, gebeLaufFrei } = await import('@/lib/gebetszeiten/abgleich');
const { ladeAbgleichStand } = await import('@/server/queries/verwaltung/gebetszeiten');
const { feedQuelle } = await import('@/lib/gebetszeiten/quellen/igmg-feed');
const { ladeGebetszeitenMonat, ladeGebetszeitenFenster } = await import('@/server/queries/gebetszeiten');
const actions = await import('@/server/actions/gebetszeiten');
const leseApi = await import('@/app/api/gebetszeiten/[monat]/route');
afterAll(() => client.close());

const CRON = randomBytes(32).toString('base64');
const WARTUNG = randomBytes(32).toString('base64');
const VORLAGE = 'https://kalender.example.test/wetzlar/{stadt}/{jahr}/{monat}';
const vorher = { cron: process.env.CRON_SECRET, wartung: process.env.WARTUNG_TOKEN, url: process.env.GEBETSZEITEN_IGMG_URL };
beforeAll(() => {
  process.env.CRON_SECRET = CRON;
  process.env.WARTUNG_TOKEN = WARTUNG;
});
afterAll(() => {
  for (const [name, wert] of [
    ['CRON_SECRET', vorher.cron],
    ['WARTUNG_TOKEN', vorher.wartung],
    ['GEBETSZEITEN_IGMG_URL', vorher.url],
  ] as const) {
    if (wert === undefined) delete process.env[name];
    else process.env[name] = wert;
  }
  vi.unstubAllGlobals();
});

/** Fake-Feed: Monat aus der Adresse, Zeiten der Näherung in Wetzlar (plausibel), mit gezielten Abweichungen. */
const feed = {
  aenderungen: new Map<string, Partial<Tageszeiten>>(),
  verschiebungMin: 0,
  /** Yatsı aller Tage verschieben (gleichmäßig, also ohne Tagessprung) */
  yatsiPlusMin: 0,
  status: 200,
  abrufe: 0,
  stadtId: '20238',
};
const plus = (hhmm: string, min: number) => {
  const m = (((Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3)) + min) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};
function monatstage(jahr: number, monat: number) {
  const anzahl = new Date(Date.UTC(jahr, monat, 0)).getUTCDate();
  return Array.from({ length: anzahl }, (_, i) => {
    const datum = `${jahr}-${String(monat).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
    const z = { ...berechneTag(datum, STANDARD_EINSTELLUNGEN), ...feed.aenderungen.get(datum) };
    z.yatsi = plus(z.yatsi, feed.yatsiPlusMin);
    const verschoben = Object.fromEntries(Object.entries(z).map(([g, v]) => [g, plus(v, feed.verschiebungMin)]));
    return { datum, ...verschoben };
  });
}
const fakeAbruf = async (adresse: string): Promise<Response> => {
  feed.abrufe++;
  if (feed.status !== 200) return new Response('', { status: feed.status });
  const [, , jahr, monat] = new URL(adresse).pathname.split('/').slice(1);
  return Response.json({ stadtId: feed.stadtId, stadt: 'Wetzlar', stand: '2026-10-28', tage: monatstage(Number(jahr), Number(monat)) });
};
const fakeQuelle = () =>
  feedQuelle({ env: { GEBETSZEITEN_IGMG_URL: VORLAGE }, abruf: (adresse) => fakeAbruf(adresse), warte: async () => undefined });

const anfrage = (methode: 'GET' | 'POST', auth?: string, suche = '') =>
  new Request(`https://example.test/api/wartung/gebetszeiten-abgleich${suche}`, {
    method: methode,
    headers: auth ? { authorization: `Bearer ${auth}` } : {},
  });

function tagPlus(n: number): string {
  const [j, m, t] = berlinerDatum(new Date()).split('-').map(Number);
  return new Date(Date.UTC(j, m - 1, t + n)).toISOString().slice(0, 10);
}
const tage = () => db.select().from(schema.gebetszeitTag);
const laeufe = () => db.select().from(schema.gebetszeitAbgleich);
const mails = () => db.select().from(schema.mailAusgang).where(eq(schema.mailAusgang.vorlage, 'gebetszeiten'));
async function setzeEinstellung(wert: Record<string, unknown>) {
  await db
    .insert(schema.einstellung)
    .values({ schluessel: 'gebetszeiten', wert })
    .onConflictDoUpdate({ target: schema.einstellung.schluessel, set: { wert } });
}

beforeEach(() => {
  feed.aenderungen.clear();
  feed.verschiebungMin = 0;
  feed.yatsiPlusMin = 0;
  feed.status = 200;
  feed.abrufe = 0;
  feed.stadtId = '20238';
  aufrufe.revalidateTag.length = 0;
});

describe('Zugang zur Wartungsroute', () => {
  it('ohne bzw. mit falschem Bearer 401; CRON_SECRET und WARTUNG_TOKEN sind getrennt', async () => {
    expect((await route.GET(anfrage('GET'))).status).toBe(401);
    expect((await route.GET(anfrage('GET', WARTUNG))).status).toBe(401);
    expect((await route.POST(anfrage('POST', CRON))).status).toBe(401);
  });

  it('Cron bei ausgeschaltetem Abgleich: „inaktiv“, kein Abruf', async () => {
    vi.stubGlobal('fetch', vi.fn(fakeAbruf));
    process.env.GEBETSZEITEN_IGMG_URL = VORLAGE;
    const antwort = await route.GET(anfrage('GET', CRON));
    expect(antwort.status).toBe(200);
    expect(antwort.headers.get('cache-control')).toBe('no-store');
    expect(await antwort.json()).toMatchObject({ status: 'inaktiv' });
    expect(feed.abrufe).toBe(0);
  });

  it('ohne GEBETSZEITEN_IGMG_URL und ohne Jahresdatei: „nicht_eingerichtet“, nichts geschrieben', async () => {
    delete process.env.GEBETSZEITEN_IGMG_URL;
    const e = await (await route.POST(anfrage('POST', WARTUNG))).json();
    expect(e).toMatchObject({ status: 'nicht_eingerichtet', quelle: null });
    expect(await laeufe()).toHaveLength(0);
  });
});

describe('Abgleich mit dem Fake-Feed', () => {
  it('Trockenlauf rechnet, schreibt aber nichts (kein Lauf, keine Tage, keine Tags)', async () => {
    process.env.GEBETSZEITEN_IGMG_URL = VORLAGE;
    vi.stubGlobal('fetch', vi.fn(fakeAbruf));
    const e = await (await route.POST(anfrage('POST', WARTUNG, '?trocken=1'))).json();
    expect(e).toMatchObject({ status: 'ok', trocken: true, quelle: 'igmg-feed', konflikte: 0 });
    expect(e.tageNeu).toBeGreaterThanOrEqual(60);
    expect(await tage()).toHaveLength(0);
    expect(await laeufe()).toHaveLength(0);
    expect(aufrufe.revalidateTag).toEqual([]);
  });

  it('Erstlauf per Cron: schreibt alle Tage als „igmg“, Protokoll, Audit ohne Person, Tags je Monat', async () => {
    await setzeEinstellung({ abgleich: { aktiv: true } });
    const antwort = await alsRouteHandler(() => route.GET(anfrage('GET', CRON)));
    const e = await antwort.json();
    expect(e).toMatchObject({ status: 'ok', quelle: 'igmg-feed', tageGeaendert: 0, konflikte: 0 });
    const geschrieben = await tage();
    expect(geschrieben.length).toBe(e.tageNeu);
    expect(geschrieben.every((t) => t.quelle === 'igmg' && t.abgleichId === e.laufId && t.importId === null)).toBe(true);
    const [lauf] = await laeufe();
    expect(lauf).toMatchObject({ status: 'ok', quelle: 'igmg-feed', tageNeu: e.tageNeu, quellStand: '2026-10-28' });
    expect(lauf.inhaltSha256).toMatch(/^[0-9a-f]{64}$/);
    const [audit] = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, 'gebetszeiten.abgleich'));
    expect(audit).toMatchObject({ benutzerId: null, zielId: e.laufId, details: { status: 'ok', neu: e.tageNeu, konflikte: 0 } });
    expect(aufrufe.verfallen).toEqual(expect.arrayContaining(['gebetszeiten', `gebetszeiten:${tagPlus(0).slice(0, 7)}`]));
    expect(aufrufe.revalidateProfil.every((p) => JSON.stringify(p) === JSON.stringify({ expire: 0 }))).toBe(true);
  });

  it('öffentlich: Lader zeigen „igmg“ mit Stand; die Lese-API liefert JSON mit CORS', async () => {
    const monat = await ladeGebetszeitenMonat(tagPlus(0).slice(0, 7));
    expect(monat.tage.filter((t) => t.datum >= tagPlus(0)).every((t) => t.quelle === 'igmg')).toBe(true);
    expect(monat.stand).toBe(berlinerDatum(new Date()));
    const fenster = await ladeGebetszeitenFenster();
    expect(fenster.tage.find((t) => t.datum === tagPlus(1))?.quelle).toBe('igmg');
    const antwort = await leseApi.GET(new Request('https://example.test/'), { params: Promise.resolve({ monat: tagPlus(0).slice(0, 7) }) });
    expect(antwort.headers.get('access-control-allow-origin')).toBe('*');
    expect(antwort.headers.get('cache-control')).toBe('public, max-age=300');
    const json = await antwort.json();
    expect(json).toMatchObject({ ort: 'Wetzlar', zeitzone: 'Europe/Berlin', quellenangabe: { name: 'IGMG-Gebetskalender' } });
    expect((await leseApi.GET(new Request('https://example.test/'), { params: Promise.resolve({ monat: '2000-01' }) })).status).toBe(404);
  });

  it('zweiter Lauf ohne Änderung: „unveraendert“, nichts geschrieben, keine Tags', async () => {
    const vorherTage = await tage();
    const e = await gleicheAb({ quelle: fakeQuelle() });
    expect(e).toMatchObject({ status: 'unveraendert', tageNeu: 0, tageGeaendert: 0, monate: [] });
    expect((await tage()).map((t) => t.aktualisiertAm.getTime())).toEqual(vorherTage.map((t) => t.aktualisiertAm.getTime()));
  });

  it('Änderung eines Tages: „ok“ mit größter Abweichung, nur dieser Tag neu geschrieben', async () => {
    const datum = tagPlus(3);
    const alt = berechneTag(datum, STANDARD_EINSTELLUNGEN);
    feed.aenderungen.set(datum, { yatsi: plus(alt.yatsi, 2), imsak: plus(alt.imsak, -1) });
    const e = await gleicheAb({ quelle: fakeQuelle() });
    expect(e).toMatchObject({ status: 'ok', tageNeu: 0, tageGeaendert: 1, maxAbweichungMin: 2, monate: [datum.slice(0, 7)] });
    const [t] = await db.select().from(schema.gebetszeitTag).where(eq(schema.gebetszeitTag.datum, datum));
    expect(t.yatsi.slice(0, 5)).toBe(plus(alt.yatsi, 2));
  });

  it('Konflikt mit dem Import der Gemeinde: nie überschrieben, gezählt, einmal per Mail gemeldet; Übernahme in der Verwaltung', async () => {
    const datum = tagPlus(5);
    await db.update(schema.gebetszeitTag).set({ quelle: 'import', aksam: '17:00:00' }).where(eq(schema.gebetszeitTag.datum, datum));
    const mailsVorher = (await mails()).length;
    const e = await gleicheAb({ quelle: fakeQuelle() });
    expect(e).toMatchObject({ konflikte: 1 });
    const [t] = await db.select().from(schema.gebetszeitTag).where(eq(schema.gebetszeitTag.datum, datum));
    expect(t).toMatchObject({ quelle: 'import', aksam: '17:00:00' });
    expect((await mails()).length).toBe(mailsVorher + 1);
    // Gleiche Konflikte im nächsten Lauf: kein weiterer Hinweis
    await gleicheAb({ quelle: fakeQuelle() });
    expect((await mails()).length).toBe(mailsVorher + 1);
    // Verwaltung: IGMG-Werte übernehmen
    await angemeldetAls([{ rolle: 'redaktion' }]);
    expect(await actions.uebernehmeKonflikte({}, new FormData())).toEqual({ uebernommen: 1 });
    const [danach] = await db.select().from(schema.gebetszeitTag).where(eq(schema.gebetszeitTag.datum, datum));
    expect(danach.quelle).toBe('igmg');
    expect(danach.aksam.slice(0, 5)).toBe(berechneTag(datum, STANDARD_EINSTELLUNGEN).aksam);
    expect(aufrufe.updateTag).toContain('gebetszeiten');
  });

  it('Serverfehler: drei Versuche, Lauf „fehler“, nichts geschrieben; ab dem dritten Fehlschlag in Folge ein Hinweis', async () => {
    feed.status = 503;
    const vorherTage = (await tage()).length;
    const mailsVorher = (await mails()).length;
    for (let i = 0; i < 3; i++) {
      const e = await gleicheAb({ quelle: fakeQuelle() });
      expect(e).toMatchObject({ status: 'fehler', fehlerCode: 'status', monate: [] });
    }
    expect(feed.abrufe).toBe(9);
    expect((await tage()).length).toBe(vorherTage);
    expect((await mails()).length).toBe(mailsVorher + 1);
    // Vierter Fehlschlag: Zustand unverändert, kein weiterer Hinweis
    await gleicheAb({ quelle: fakeQuelle() });
    expect((await mails()).length).toBe(mailsVorher + 1);
  });

  it('Daten in UTC (Sommerzeitprobe) und fremde Stadt: Fehler „plausibilitaet“, nichts geschrieben', async () => {
    const vorher = (await tage()).map((t) => `${t.datum}${t.ogle}`);
    feed.verschiebungMin = -60;
    expect(await gleicheAb({ quelle: fakeQuelle() })).toMatchObject({ status: 'fehler', fehlerCode: 'plausibilitaet' });
    feed.verschiebungMin = 0;
    feed.stadtId = '20001';
    expect(await gleicheAb({ quelle: fakeQuelle() })).toMatchObject({ status: 'fehler', fehlerCode: 'plausibilitaet' });
    expect((await tage()).map((t) => `${t.datum}${t.ogle}`)).toEqual(vorher);
  });

  it('auffällige Lieferung wartet auf Freigabe; die Freigabe schreibt die Tage', async () => {
    // Yatsı überall 12 Minuten später: gleichmäßig (kein Tagessprung), aber über 10 Minuten neben der Näherung
    feed.yatsiPlusMin = 12;
    const datum = tagPlus(7);
    const alt = berechneTag(datum, STANDARD_EINSTELLUNGEN);
    const mailsVorher = (await mails()).length;
    const e = await gleicheAb({ quelle: fakeQuelle() });
    expect(e.status).toBe('auffaellig');
    expect(e.auffaellig).toBeGreaterThan(0);
    expect(e.monate).toEqual([]);
    expect((await mails()).length).toBe(mailsVorher + 1);
    const [t] = await db.select().from(schema.gebetszeitTag).where(eq(schema.gebetszeitTag.datum, datum));
    expect(t.yatsi.slice(0, 5)).toBe(alt.yatsi);
    const ich = (await angemeldetAls([{ rolle: 'redaktion' }]))!;
    const frei = await gebeLaufFrei(e.laufId!, ich);
    expect(frei?.tage).toBe(e.tageGeaendert + e.tageNeu);
    const [danach] = await db.select().from(schema.gebetszeitTag).where(eq(schema.gebetszeitTag.datum, datum));
    expect(danach.yatsi.slice(0, 5)).toBe(plus(alt.yatsi, 12));
    const [lauf] = await db.select().from(schema.gebetszeitAbgleich).where(eq(schema.gebetszeitAbgleich.id, e.laufId!));
    expect(lauf.status).toBe('freigegeben');
    // Eine bereits freigegebene Lieferung ist nicht mehr offen
    expect(await actions.gebeAbgleichFrei({}, formular({ lauf: e.laufId! }))).toEqual({ fehler: 'veraltet' });
  });

  it('„Jetzt abgleichen“ in der Verwaltung: nur mit Recht, höchstens alle 5 Minuten', async () => {
    await angemeldetAls([{ rolle: 'bildung' }]);
    await expect(actions.gleicheJetztAb({}, new FormData())).rejects.toThrow('KEIN_RECHT');
    await angemeldetAls([{ rolle: 'redaktion' }]);
    process.env.GEBETSZEITEN_IGMG_URL = VORLAGE;
    vi.stubGlobal('fetch', vi.fn(fakeAbruf));
    const erst = await actions.gleicheJetztAb({}, new FormData());
    expect(erst.abgleich).toMatchObject({ status: 'ok' });
    expect(await actions.gleicheJetztAb({}, new FormData())).toEqual({ fehler: 'zuOft' });
  });
});

describe('Eingefügte Tabelle aus dem IGMG-Gebetskalender (Verwaltung)', () => {
  it('prüft den Ort, übernimmt als „igmg“ und setzt den IGMG-Kalender als Quelle', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    const zeilen = [tagPlus(40), tagPlus(41)].map((d) => {
      const z = berechneTag(d, STANDARD_EINSTELLUNGEN);
      return `${d.split('-').reverse().join('.')} ${z.imsak} ${z.gunes} ${z.ogle} ${z.ikindi} ${z.aksam} ${z.yatsi}`;
    });
    const fremd = await actions.pruefeImport({}, formular({ tabelle: ['Aachen (DE)', ...zeilen].join('\n') }));
    expect(fremd.importFehler).toEqual([{ zeile: 0, fehler: 'stadt' }]);
    const ok = await actions.pruefeImport({}, formular({ tabelle: ['Wetzlar (DE)', 'Tarih Datum İmsak Morgen', ...zeilen].join('\n') }));
    expect(ok.pruefung).toMatchObject({ anzahl: 2, herkunft: 'igmg', ort: 'Wetzlar' });
    expect(
      await actions.uebernehmeImport(
        {},
        formular({ tage: ok.pruefung!.tage, dateiname: ok.pruefung!.dateiname, herkunft: 'igmg', alsQuelle: 'ja' }),
      ),
    ).toEqual({
      uebernommen: 2,
    });
    const [t] = await db
      .select()
      .from(schema.gebetszeitTag)
      .where(eq(schema.gebetszeitTag.datum, tagPlus(40)));
    expect(t.quelle).toBe('igmg');
    const [e] = await db.select().from(schema.einstellung).where(eq(schema.einstellung.schluessel, 'gebetszeiten'));
    expect(e.wert).toMatchObject({ aktiveQuelle: 'igmg' });
    expect((await actions.pruefeImport({}, formular({ tabelle: '   ' }))).fehler).toBe('tabelle');
  });
});

describe('Einstellungen des Abgleichs und der Näherung (Verwaltung)', () => {
  const einstellung = async () =>
    (await db.select().from(schema.einstellung).where(eq(schema.einstellung.schluessel, 'gebetszeiten')))[0]?.wert as Record<
      string,
      unknown
    >;

  it('Abgleich speichern: Stadt-ID nur Ziffern, Zeitraum begrenzt; Audit', async () => {
    const ich = (await angemeldetAls([{ rolle: 'redaktion' }]))!;
    const werte = { aktiv: 'ja', stadtId: '20238', stadtName: 'Wetzlar', tageVoraus: '90', freigabe: 'pruefen' };
    expect(await actions.speichereAbgleich({}, formular(werte))).toEqual({ ok: true });
    expect(await einstellung()).toMatchObject({ abgleich: { aktiv: true, stadtId: '20238', tageVoraus: 90, freigabe: 'pruefen' } });
    expect((await actions.speichereAbgleich({}, formular({ ...werte, stadtId: '20238; drop' }))).feldFehler).toMatchObject({
      stadtId: 'ungueltig',
    });
    expect((await actions.speichereAbgleich({}, formular({ ...werte, tageVoraus: '5000' }))).feldFehler).toMatchObject({
      tageVoraus: 'ungueltig',
    });
    const audit = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, 'gebetszeiten.einstellung'));
    expect(audit.some((a) => a.benutzerId === ich)).toBe(true);
  });

  it('Freigabe „prüfen“: jede Änderung wartet, auch ohne Auffälligkeit', async () => {
    const datum = tagPlus(9);
    feed.aenderungen.set(datum, { aksam: plus(berechneTag(datum, STANDARD_EINSTELLUNGEN).aksam, 1) });
    expect(await gleicheAb({ quelle: fakeQuelle() })).toMatchObject({ status: 'auffaellig', auffaellig: 0, monate: [] });
  });

  it('Rückfall auf die Methode umstellen und zurück; Vorschau rechnet mit dem gewählten Verfahren', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    const felder = { methode: 'Turkey', madhab: 'shafi', hoheBreite: 'seventhofthenight', breite: '50.567', laenge: '8.5' };
    const methode = await actions.speichereBerechnung({}, formular({ ...felder, rueckfall: 'methode', richtung: 'vorschau' }));
    const naeherung = await actions.speichereBerechnung({}, formular({ ...felder, rueckfall: 'naeherung', richtung: 'vorschau' }));
    expect(methode.vorschau![0].yatsi).not.toBe(naeherung.vorschau![0].yatsi);
    expect(await actions.speichereBerechnung({}, formular({ ...felder, rueckfall: 'methode', richtung: 'speichern' }))).toEqual({
      ok: true,
    });
    expect(await einstellung()).toMatchObject({ rueckfall: 'methode' });
    expect((await actions.speichereBerechnung({}, formular({ ...felder, rueckfall: 'irgendwas' }))).feldFehler).toMatchObject({
      rueckfall: 'ungueltig',
    });
  });

  it('Kalibrierung: Vorschlag aus den IGMG-Tagen der Datenbank, Übernahme speichert die Näherung als Rückfall', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    const v = await actions.schlageNaeherungVor({}, new FormData());
    expect(v.vorschlag?.tage).toBeGreaterThanOrEqual(14);
    expect(v.vorschau).toHaveLength(7);
    const vorschlag = JSON.parse(v.vorschlag!.naeherung) as { kalibriert: { basis: string } };
    expect(vorschlag.kalibriert.basis).toMatch(/^IGMG-Tage der Datenbank/);
    expect(await actions.uebernehmeNaeherung({}, formular({ naeherung: v.vorschlag!.naeherung }))).toEqual({ ok: true });
    expect(await einstellung()).toMatchObject({ rueckfall: 'naeherung', naeherung: { kalibriert: { basis: vorschlag.kalibriert.basis } } });
    expect(await actions.uebernehmeNaeherung({}, formular({ naeherung: '{"fajrWinkel": 99}' }))).toEqual({ fehler: 'pruefen' });
  });
});

describe('Gleitendes Fenster über mehrere Tage (Gegenprüfung 28.10.2026)', () => {
  const morgen = () => new Date(Date.now() + 86_400_000);
  beforeEach(async () => {
    await db.delete(schema.gebetszeitAbgleich);
    await db.delete(schema.gebetszeitTag);
    await setzeEinstellung({ aktiveQuelle: 'igmg', abgleich: { aktiv: true, stadtId: '20238', freigabe: 'sofort' } });
  });

  it('Konflikte aus zwei Läufen: nach der Übernahme ist nichts mehr offen; ein zweiter Klick schreibt nichts', async () => {
    await gleicheAb({ quelle: fakeQuelle() });
    const datum = tagPlus(5);
    await db.update(schema.gebetszeitTag).set({ quelle: 'import', aksam: '17:00:00' }).where(eq(schema.gebetszeitTag.datum, datum));
    await gleicheAb({ quelle: fakeQuelle() });
    await gleicheAb({ quelle: fakeQuelle() });
    expect((await ladeAbgleichStand('20238')).konflikte).toHaveLength(1);
    await angemeldetAls([{ rolle: 'redaktion' }]);
    expect(await actions.uebernehmeKonflikte({}, new FormData())).toEqual({ uebernommen: 1 });
    expect((await ladeAbgleichStand('20238')).konflikte).toEqual([]);
    expect(await actions.uebernehmeKonflikte({}, new FormData())).toEqual({ uebernommen: 0 });
  });

  it('dauerhafter Import: Tage, die vorne herausfallen oder hinten hineinrücken, lösen keinen neuen Konflikt-Hinweis aus', async () => {
    await gleicheAb({ quelle: fakeQuelle() });
    for (const n of [-1, 5])
      await db
        .update(schema.gebetszeitTag)
        .set({ quelle: 'import', aksam: '17:00:00' })
        .where(eq(schema.gebetszeitTag.datum, tagPlus(n)));
    const mailsVorher = (await mails()).length;
    expect(await gleicheAb({ quelle: fakeQuelle() })).toMatchObject({ konflikte: 2 });
    expect((await mails()).length).toBe(mailsVorher + 1);
    // Nächster Tag: gestern fällt heraus, das Fenster wächst hinten – kein neuer Konflikt, keine Mail
    expect(await gleicheAb({ quelle: fakeQuelle(), jetzt: morgen() })).toMatchObject({ konflikte: 1 });
    expect((await mails()).length).toBe(mailsVorher + 1);
    // Ein wirklich neuer Konflikt meldet sich
    await db
      .update(schema.gebetszeitTag)
      .set({ quelle: 'import', aksam: '17:00:00' })
      .where(eq(schema.gebetszeitTag.datum, tagPlus(8)));
    expect(await gleicheAb({ quelle: fakeQuelle(), jetzt: morgen() })).toMatchObject({ konflikte: 2 });
    expect((await mails()).length).toBe(mailsVorher + 2);
  });

  it('ein freigegebener auffälliger Tag hält die Läufe der Folgetage nicht erneut an', async () => {
    // Yatsı um Tag X ansteigend (4, 8, 12, 8, 4 Minuten): kein Tagessprung über 6 Minuten, nur X über 10 Minuten
    const x = 10;
    for (const [n, min] of [
      [-2, 4],
      [-1, 8],
      [0, 12],
      [1, 8],
      [2, 4],
    ] as const) {
      const datum = tagPlus(x + n);
      feed.aenderungen.set(datum, { yatsi: plus(berechneTag(datum, STANDARD_EINSTELLUNGEN).yatsi, min) });
    }
    const e = await gleicheAb({ quelle: fakeQuelle() });
    expect(e).toMatchObject({ status: 'auffaellig', auffaellig: 1 });
    const ich = (await angemeldetAls([{ rolle: 'redaktion' }]))!;
    expect((await gebeLaufFrei(e.laufId!, ich))?.tage).toBeGreaterThan(0);
    const mailsVorher = (await mails()).length;
    // Folgetag: X ist gespeichert und unverändert, hinten kommt ein unauffälliger Tag dazu → „ok“, keine Mail
    const folge = await gleicheAb({ quelle: fakeQuelle(), jetzt: morgen() });
    expect(folge).toMatchObject({ status: 'ok', auffaellig: 0 });
    expect(folge.tageNeu).toBeGreaterThan(0);
    expect((await mails()).length).toBe(mailsVorher);
  });

  it('Trockenlauf meldet denselben Status wie der echte Lauf (Freigabe „prüfen“)', async () => {
    await setzeEinstellung({ aktiveQuelle: 'igmg', abgleich: { aktiv: true, stadtId: '20238', freigabe: 'pruefen' } });
    expect(await gleicheAb({ quelle: fakeQuelle(), trocken: true })).toMatchObject({ status: 'auffaellig', auffaellig: 0 });
    expect(await gleicheAb({ quelle: fakeQuelle() })).toMatchObject({ status: 'auffaellig', auffaellig: 0 });
  });
});
