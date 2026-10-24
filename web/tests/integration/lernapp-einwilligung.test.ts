import { randomUUID } from 'node:crypto';
import { and, eq, isNull } from 'drizzle-orm';
import { afterAll, afterEach, describe, expect, it } from 'vitest';
import kinderTexte from '../../messages/bereiche/kinder.json';
import meinBereichTexte from '../../messages/bereiche/mein-bereich.json';
import { schema } from '@/lib/db';
import { textVersion } from '@/lib/konto/einwilligung';
import { verschluessele } from '@/lib/krypto';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import type { Ereignis } from '@/lib/lernapp/ereignisse/typen';
import { SYNC_ADRESSE } from '@/lib/lernapp/sync/protokoll';
import { formular, kontoUmgebung, umleitung } from './hilfen/konto';

/**
 * Lebenszyklus der Einwilligung `lernapp` (S-L3 N-2, SL2-Rest; Entwurf `einwilligung-lernapp.md` EL1–EL4) gegen PGlite:
 * - Erteilen in „Mein Bereich“: Erwachsene (EL1) und Jugendliche ab 16 (EL3) selbst, Eltern für ihr Kind (EL2, mit
 *   Einvernehmen und bestätigtem Bezug), versioniert als Entwurf mit dem SHA-256 des angezeigten Wortlauts; nur mit einem
 *   Schalter mit Personendaten der Lern-App; unter 16 entscheiden die Eltern.
 * - Widerruf (auch ohne Schalter): Lernstand auf dem Server (Profil, Ereignisse, Karten, Lerntage), Schreibabgaben,
 *   Zustimmung zur Bestenliste und Familien-Bestenliste gehen; der nächste Abgleich antwortet 403. Ab 16 nimmt der eigene
 *   Widerruf auch die Einwilligung der Eltern zurück.
 * - Export nach Art. 15/20 mit den Lern-App-Daten; Zustimmung zur Bestenliste in „Mein Bereich“ zurücknehmen.
 * - Ende des Eltern-Kind-Bezugs (Vier-Augen-Entscheidung, Löschen des Elternkontos): gelöscht wird nur, was allein die
 *   Einwilligung dieses Elternteils deckte.
 * Testdaten fiktiv, Namen Platzhalter, Texte neutrale Alltagssätze.
 */
const { client, db } = await kontoUmgebung();
const { auth } = await import('@/lib/auth/server');
const aktionen = await import('@/server/actions/lernapp-einwilligung');
const kinderAktionen = await import('@/server/actions/kinder');
const syncRoute = await import('@/app/api/lernapp/sync/route');
const { gleicheKontoAb, lernappEinwilligung } = await import('@/lib/lernapp/sync/server');
const { eigeneLernappEinwilligung, LERNAPP_TEXTVERSIONEN } = await import('@/lib/lernapp/einwilligung');
const { exportiereKontodaten } = await import('@/server/queries/konto');
const elternFreigabe = await import('@/lib/konto/eltern-freigabe');
const { loescheGemeindeKonto } = await import('@/lib/konto/loeschen');
const { KeinRecht } = await import('@/lib/rechte/pruefe');
afterAll(() => client.close());
afterEach(() => {
  delete process.env.FUNKTION_LERNAPP_SYNC;
  delete process.env.FUNKTION_LERNAPP_GRUPPEN;
});

const api = auth.api as unknown as Record<string, unknown>;
function als(id: string | null) {
  api.getSession = async () =>
    id
      ? {
          user: { id, name: '[Name]', email: `${id.slice(0, 8)}@example.test`, twoFactorEnabled: false, gesperrtAm: null },
          session: { id: `s-${id}`, createdAt: new Date(), userId: id },
        }
      : null;
}
const schalterAus = () => {
  process.env.FUNKTION_LERNAPP_SYNC = 'aus';
  process.env.FUNKTION_LERNAPP_GRUPPEN = 'aus';
};

type Rolle = 'gemeinde' | 'schueler' | 'eltern';
async function konto(name: string, { kind = false, rollen = ['gemeinde'] as Rolle[] } = {}): Promise<string> {
  const id = randomUUID();
  await db.insert(schema.user).values({ id, name, email: `${id.slice(0, 8)}@example.test`, emailVerified: true });
  await db.insert(schema.kontoProfil).values({ benutzerId: id, anzeigename: name, istKind: kind });
  for (const rolle of rollen) await db.insert(schema.gemeindeRolle).values({ benutzerId: id, rolle });
  return id;
}
async function lernende(benutzerId: string | null, name: string, sechzehnAm: string): Promise<string> {
  const v = verschluessele({ name });
  const [z] = await db
    .insert(schema.lernende)
    .values({ benutzerId, datenVerschluesselt: v.daten, schluesselId: v.schluesselId, anzeigename: name, sechzehnAm })
    .returning({ id: schema.lernende.id });
  return z!.id;
}
/** Kalendertag relativ zu heute (Berlin), z. B. `tag(-100)`. */
const tag = (tage: number) => berlinerDatum(new Date(Date.now() + tage * 86_400_000));
const vorTagen = (n: number) => new Date(Date.now() - n * 86_400_000);

const lernappZeilen = (benutzerId: string) =>
  db
    .select()
    .from(schema.kontoEinwilligung)
    .where(and(eq(schema.kontoEinwilligung.art, 'lernapp'), eq(schema.kontoEinwilligung.benutzerId, benutzerId)));

/** Lernstand auf dem Server über den echten Abgleich: Bewertung und Lektion → Profil, Ereignisse, Karte, Lerntage. */
async function lernstand(benutzerId: string): Promise<void> {
  const am = new Date(Date.now() - 60_000);
  const geraet = randomUUID();
  const ereignisse: Ereignis[] = [
    {
      geraet,
      seq: 0,
      am: am.toISOString(),
      tag: tag(0),
      art: 'bewertung',
      daten: { karte: 'tr-aus-de:tr.a1.e01.w001', note: 'gut', kurs: 'tr-aus-de' },
    },
    {
      geraet,
      seq: 1,
      am: am.toISOString(),
      tag: tag(0),
      art: 'lektion',
      daten: { kurs: 'tr-aus-de', lektion: 'tr-aus-de.a1.e01.l01', art: 'lektion', richtig: 4, gesamt: 4 },
    },
  ];
  const e = await gleicheKontoAb(benutzerId, { konto: benutzerId, geraet, cursor: null, ereignisse });
  expect(e.grenze).toBeUndefined();
}
async function serverStand(benutzerId: string) {
  const zahl = async (
    t: typeof schema.lernappTag | typeof schema.lernappKarte | typeof schema.lernappEreignis | typeof schema.lernappTagKurs,
  ) => (await db.select({ b: t.benutzerId }).from(t).where(eq(t.benutzerId, benutzerId))).length;
  return {
    profil: (await db.select().from(schema.lernappProfil).where(eq(schema.lernappProfil.benutzerId, benutzerId))).length,
    ereignisse: await zahl(schema.lernappEreignis),
    karten: await zahl(schema.lernappKarte),
    tage: await zahl(schema.lernappTag),
    tageJeKurs: await zahl(schema.lernappTagKurs),
    zustimmung: (
      await db.select().from(schema.lernappRanglisteZustimmung).where(eq(schema.lernappRanglisteZustimmung.benutzerId, benutzerId))
    ).length,
    familie: (await db.select().from(schema.lernappFamilie).where(eq(schema.lernappFamilie.elternId, benutzerId))).length,
    abgaben: (await db.select().from(schema.lernappSchreibabgabe).where(eq(schema.lernappSchreibabgabe.benutzerId, benutzerId))).length,
  };
}
async function abgabe(benutzerId: string, eingereichtAm: Date): Promise<string> {
  const v = verschluessele({ text: 'Ev büyük.' });
  const [z] = await db
    .insert(schema.lernappSchreibabgabe)
    .values({
      benutzerId,
      aufgabeSchluessel: 'tr.a1.e01.l04.a08',
      textVerschluesselt: v.daten,
      schluesselId: v.schluesselId,
      eingereichtAm,
      loeschenAb: new Date(eingereichtAm.getTime() + 365 * 86_400_000),
    })
    .returning({ id: schema.lernappSchreibabgabe.id });
  return z!.id;
}
async function abgleichStatus(benutzerId: string): Promise<number> {
  const r = await syncRoute.POST(
    new Request(`https://example.test${SYNC_ADRESSE}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'sec-fetch-site': 'same-origin', host: 'example.test' },
      body: JSON.stringify({ konto: benutzerId, geraet: randomUUID(), cursor: null, ereignisse: [] }),
    }),
  );
  return r.status;
}
const aendern = (werte: Record<string, string>) => umleitung(aktionen.lernappEinwilligungAendern(formular({ sprache: 'de', ...werte })));
const audit = async (aktion: 'lernapp.lernstand_geloescht' | 'lernapp.schreibabgabe_geloescht', zielId: string) =>
  (
    await db
      .select({ details: schema.auditEintrag.details })
      .from(schema.auditEintrag)
      .where(and(eq(schema.auditEintrag.aktion, aktion), eq(schema.auditEintrag.zielId, zielId)))
  ).map((z) => z.details);

const mb = meinBereichTexte.de.meinBereich.konto.lernapp;

describe('Erwachsene (EL1): erteilen, Export, widerrufen', () => {
  it('Erteilen nur mit Haken und Schalter; Version als Entwurf mit dem Hash des angezeigten Wortlauts', async () => {
    const id = await konto('[Erwachsen] A');
    als(id);
    expect((await eigeneLernappEinwilligung(id, false)).textArt).toBe('erwachsen');
    expect(await aendern({ aktion: 'erteilen' })).toContain('lernapp=haken');
    expect(await lernappZeilen(id)).toEqual([]);
    // Ohne Schalter mit Personendaten kein Erteilen
    schalterAus();
    await expect(aktionen.lernappEinwilligungAendern(formular({ sprache: 'de', aktion: 'erteilen', haken: 'ja' }))).rejects.toBeInstanceOf(
      KeinRecht,
    );
    delete process.env.FUNKTION_LERNAPP_SYNC;
    delete process.env.FUNKTION_LERNAPP_GRUPPEN;
    const ziel = await aendern({ aktion: 'erteilen', haken: 'ja' });
    expect(ziel).toContain('lernapp=erteilt');
    expect(ziel).toContain('#lern-app');
    // Wiederholtes Erteilen legt keine zweite Zeile an
    await aendern({ aktion: 'erteilen', haken: 'ja' });
    const zeilen = await lernappZeilen(id);
    expect(zeilen).toHaveLength(1);
    expect(zeilen[0]).toMatchObject({ erteiltVon: id, lernendeId: null, sprache: 'de', widerrufenAm: null });
    expect(zeilen[0]!.textVersion).toBe(textVersion(LERNAPP_TEXTVERSIONEN.erwachsen, `${mb.einwilligung.erwachsen}\n${mb.haken}`));
    expect(zeilen[0]!.textVersion.startsWith('lernapp/2026-10-entwurf+sha256:')).toBe(true);
    expect(await lernappEinwilligung(id, { istKind: false })).toBe('erteilt');
    expect(await abgleichStatus(id)).toBe(200);
  });

  it('Export (Art. 15/20) enthält Lernstand, Bestenliste und Schreibabgaben; Widerruf löscht alles und sperrt den Abgleich', async () => {
    const id = await konto('[Erwachsen] B');
    const fremd = await konto('[Erwachsen] F');
    als(id);
    await aendern({ aktion: 'erteilen', haken: 'ja' });
    await lernstand(id);
    await lernstand(fremd);
    await db.insert(schema.lernappRanglisteZustimmung).values({ benutzerId: id, textVersion: 'v1' });
    await db.insert(schema.lernappFamilie).values({ elternId: id, bestenliste: true });
    await abgabe(id, vorTagen(1));
    const daten = (await exportiereKontodaten(id)) as { lernapp: Record<string, unknown> & { ereignisse: unknown[]; karten: unknown[] } };
    expect(daten.lernapp).toMatchObject({
      profil: { oberflaeche: 'de' },
      bestenlisteZustimmung: { textVersion: 'v1' },
      familienBestenliste: { bestenliste: true },
    });
    expect(daten.lernapp.ereignisse).toHaveLength(2);
    expect(daten.lernapp.karten).toHaveLength(1);
    expect((daten.lernapp.tage as unknown[]).length).toBe(1);
    expect((daten.lernapp.tageJeKurs as unknown[]).length).toBeGreaterThan(0);
    expect((daten.lernapp.schreibabgaben as unknown[]).length).toBe(1);
    expect(JSON.stringify(daten.lernapp)).not.toContain(fremd);

    expect(await serverStand(id)).toMatchObject({ profil: 1, ereignisse: 2, karten: 1, tage: 1, zustimmung: 1, familie: 1, abgaben: 1 });
    // Widerruf auch ohne Schalter
    schalterAus();
    expect(await aendern({ aktion: 'widerrufen' })).toContain('lernapp=widerrufen');
    expect(await serverStand(id)).toEqual({
      profil: 0,
      ereignisse: 0,
      karten: 0,
      tage: 0,
      tageJeKurs: 0,
      zustimmung: 0,
      familie: 0,
      abgaben: 0,
    });
    expect((await lernappZeilen(id)).every((z) => z.widerrufenAm !== null)).toBe(true);
    expect(await audit('lernapp.lernstand_geloescht', id)).toEqual([
      { anlass: 'widerruf', lernstand: true, bestenliste: true, familie: true },
    ]);
    // Fremde Daten bleiben; der nächste Abgleich antwortet ohne Einwilligung 403
    expect((await serverStand(fremd)).ereignisse).toBe(2);
    delete process.env.FUNKTION_LERNAPP_SYNC;
    delete process.env.FUNKTION_LERNAPP_GRUPPEN;
    expect(await abgleichStatus(id)).toBe(403);
    expect((await eigeneLernappEinwilligung(id, false)).widerrufenAm).not.toBeNull();
    const nachher = (await exportiereKontodaten(id)) as { lernapp: Record<string, unknown> };
    expect(nachher.lernapp).toMatchObject({ profil: null, ereignisse: [], karten: [], bestenlisteZustimmung: null });
  });

  it('Zustimmung zur Bestenliste in „Mein Bereich“ zurücknehmen – auch ohne Schalter; ohne Anmeldung nichts', async () => {
    const id = await konto('[Erwachsen] C');
    await db.insert(schema.lernappRanglisteZustimmung).values({ benutzerId: id, textVersion: 'v1' });
    expect((await eigeneLernappEinwilligung(id, false)).bestenliste).not.toBeNull();
    als(null);
    await expect(aktionen.lernappBestenlisteZuruecknehmen(formular({ sprache: 'de' }))).rejects.toBeInstanceOf(KeinRecht);
    schalterAus();
    als(id);
    expect(await umleitung(aktionen.lernappBestenlisteZuruecknehmen(formular({ sprache: 'tr' })))).toContain('lernapp=ausgeblendet');
    expect((await serverStand(id)).zustimmung).toBe(0);
    expect((await eigeneLernappEinwilligung(id, false)).bestenliste).toBeNull();
  });
});

describe('Jugendliche ab 16 (EL3) und Kinder unter 16', () => {
  it('ab 16: eigener Text „ab16“; der Widerruf nimmt auch die Einwilligung der Eltern zurück und löscht den Lernstand', async () => {
    const id = await konto('[Jugendlich] J', { rollen: ['schueler'] });
    const eltern = await konto('[Elternteil] E', { rollen: ['gemeinde', 'eltern'] });
    // Übergang: 16. Geburtstag vor 5 Tagen – die Einwilligung der Eltern zählt noch
    const l = await lernende(id, '[Jugendlich] J', tag(-5));
    await db.insert(schema.elternKind).values({ elternId: eltern, lernendeId: l, bestaetigtAm: new Date() });
    await db.insert(schema.kontoEinwilligung).values({ lernendeId: l, art: 'lernapp', textVersion: 'v1', erteiltVon: eltern });
    const stand = await eigeneLernappEinwilligung(id, false);
    expect(stand).toMatchObject({ lage: 'uebergang', textArt: 'ab16', gilt: true, eigene: null, lernendeId: l });
    await lernstand(id);
    als(id);
    expect(await aendern({ aktion: 'erteilen', haken: 'ja' })).toContain('lernapp=erteilt');
    const [eigen] = await lernappZeilen(id);
    expect(eigen).toMatchObject({ lernendeId: l, erteiltVon: id });
    expect(eigen!.textVersion).toBe(textVersion(LERNAPP_TEXTVERSIONEN.ab16, `${mb.einwilligung.ab16}\n${mb.haken}`));
    expect(await aendern({ aktion: 'widerrufen' })).toContain('lernapp=widerrufen');
    const offen = await db
      .select()
      .from(schema.kontoEinwilligung)
      .where(
        and(
          eq(schema.kontoEinwilligung.lernendeId, l),
          eq(schema.kontoEinwilligung.art, 'lernapp'),
          isNull(schema.kontoEinwilligung.widerrufenAm),
        ),
      );
    expect(offen).toEqual([]);
    expect(await lernappEinwilligung(id, { istKind: false })).not.toBe('erteilt');
    expect((await serverStand(id)).ereignisse).toBe(0);
    // 18 und älter: Text für Erwachsene
    const alt = await konto('[Erwachsen] W', { rollen: ['schueler'] });
    await lernende(alt, '[Erwachsen] W', tag(-800));
    expect((await eigeneLernappEinwilligung(alt, false)).textArt).toBe('erwachsen');
  });

  it('unter 16: weder Erteilen noch Widerruf durch das Kind – die Eltern entscheiden', async () => {
    const kind = await konto('[Kind] K', { kind: true, rollen: ['schueler'] });
    await lernende(kind, '[Kind] K', tag(1000));
    als(kind);
    expect(await aendern({ aktion: 'erteilen', haken: 'ja' })).toContain('lernapp=eltern');
    expect(await aendern({ aktion: 'widerrufen' })).toContain('lernapp=eltern');
    expect(await lernappZeilen(kind)).toEqual([]);
  });
});

describe('Eltern für ihr Kind (EL2)', () => {
  const kd = kinderTexte.de.kinder.detail;
  async function familie() {
    const eltern = await konto('[Elternteil] M', { rollen: ['gemeinde', 'eltern'] });
    const kind = await konto('[Kind] L', { kind: true, rollen: ['schueler'] });
    const l = await lernende(kind, '[Kind] L', tag(1000));
    await db.insert(schema.elternKind).values({ elternId: eltern, lernendeId: l, bestaetigtAm: new Date() });
    return { eltern, kind, l };
  }
  const einwilligung = (lernendeId: string, werte: Record<string, string>) =>
    umleitung(kinderAktionen.einwilligungAendern(formular({ sprache: 'de', lernendeId, art: 'lernapp', ...werte })));

  it('Erteilen mit Einvernehmen und bestätigtem Bezug; Version EL2 als Entwurf; ohne Schalter kein Erteilen', async () => {
    const { eltern, kind, l } = await familie();
    // Unbestätigter Bezug eines zweiten Elternteils (N4): wirkungslos, deshalb abgelehnt
    const zweit = await konto('[Elternteil] N', { rollen: ['gemeinde', 'eltern'] });
    await db.insert(schema.elternKind).values({ elternId: zweit, lernendeId: l });
    als(zweit);
    expect(await einwilligung(l, { aktion: 'erteilen', einvernehmen: 'ja' })).toContain('fehler=unbestaetigt');
    als(eltern);
    expect(await einwilligung(l, { aktion: 'erteilen' })).toContain('fehler=einvernehmen');
    schalterAus();
    await expect(
      kinderAktionen.einwilligungAendern(
        formular({ sprache: 'de', lernendeId: l, art: 'lernapp', aktion: 'erteilen', einvernehmen: 'ja' }),
      ),
    ).rejects.toBeInstanceOf(KeinRecht);
    delete process.env.FUNKTION_LERNAPP_SYNC;
    delete process.env.FUNKTION_LERNAPP_GRUPPEN;
    expect(await einwilligung(l, { aktion: 'erteilen', einvernehmen: 'ja' })).toContain('ok=erteilt');
    const [z] = await db
      .select()
      .from(schema.kontoEinwilligung)
      .where(and(eq(schema.kontoEinwilligung.lernendeId, l), eq(schema.kontoEinwilligung.art, 'lernapp')));
    expect(z).toMatchObject({ erteiltVon: eltern, einvernehmenBestaetigt: true, benutzerId: null });
    expect(z!.textVersion).toBe(textVersion(LERNAPP_TEXTVERSIONEN.kind, `${kd.einwilligung.lernapp.text}\n${kd.einvernehmen}`));
    expect(await lernappEinwilligung(kind, { istKind: true })).toBe('erteilt');
  });

  it('Widerruf der Eltern (auch ohne Schalter) löscht Lernstand und Schreibabgaben des Kindes', async () => {
    const { eltern, kind, l } = await familie();
    als(eltern);
    await einwilligung(l, { aktion: 'erteilen', einvernehmen: 'ja' });
    await lernstand(kind);
    await abgabe(kind, new Date());
    expect(await serverStand(kind)).toMatchObject({ profil: 1, ereignisse: 2, abgaben: 1 });
    schalterAus();
    expect(await einwilligung(l, { aktion: 'widerrufen' })).toContain('ok=widerrufen');
    expect(await serverStand(kind)).toMatchObject({ profil: 0, ereignisse: 0, karten: 0, tage: 0, abgaben: 0 });
    expect(await audit('lernapp.lernstand_geloescht', kind)).toEqual([
      { anlass: 'widerruf', lernstand: true, bestenliste: false, familie: false },
    ]);
  });
});

describe('Ende des Eltern-Kind-Bezugs (SL2-Rest)', () => {
  it('gelöscht wird nur, was allein die Einwilligung dieses Elternteils deckte; mit dem zweiten Elternkonto der Rest', async () => {
    const mutter = await konto('[Elternteil] P', { rollen: ['gemeinde', 'eltern'] });
    const vater = await konto('[Elternteil] Q', { rollen: ['gemeinde', 'eltern'] });
    const verwaltung = await konto('[Verwaltung] V');
    const kind = await konto('[Kind] R', { kind: true, rollen: ['schueler'] });
    const l = await lernende(kind, '[Kind] R', tag(1000));
    await db.insert(schema.elternKind).values([
      { elternId: mutter, lernendeId: l, bestaetigtAm: new Date() },
      { elternId: vater, lernendeId: l, bestaetigtAm: new Date() },
    ]);
    // Einwilligung der Mutter seit 10 Tagen, des Vaters seit 5 Tagen (Testdaten, wie sie zwei Wege ergeben können)
    await db.insert(schema.kontoEinwilligung).values([
      { lernendeId: l, art: 'lernapp', textVersion: 'v1', erteiltVon: mutter, erteiltAm: vorTagen(10) },
      { lernendeId: l, art: 'lernapp', textVersion: 'v1', erteiltVon: vater, erteiltAm: vorTagen(5) },
    ]);
    const nurMutter = await abgabe(kind, vorTagen(8));
    const beide = await abgabe(kind, vorTagen(2));
    await lernstand(kind);

    expect(await elternFreigabe.beantrageBezugEnde(verwaltung, l, mutter)).toBe('beantragt');
    const leitung = { benutzerId: randomUUID(), email: 'leitung@example.test', rollen: [{ rolle: 'leitung' as const }] };
    expect(await elternFreigabe.entscheideBezugEnde(leitung, l, mutter, true)).toBeNull();
    const A = schema.lernappSchreibabgabe;
    expect((await db.select({ id: A.id }).from(A).where(eq(A.benutzerId, kind))).map((z) => z.id)).toEqual([beide]);
    expect(nurMutter).not.toBe(beide);
    // Die Einwilligung der Mutter ist beendet; die des Vaters deckt weiter – der Lernstand bleibt
    const zeilen = await db
      .select({ von: schema.kontoEinwilligung.erteiltVon, widerrufen: schema.kontoEinwilligung.widerrufenAm })
      .from(schema.kontoEinwilligung)
      .where(and(eq(schema.kontoEinwilligung.lernendeId, l), eq(schema.kontoEinwilligung.art, 'lernapp')));
    expect(zeilen.find((z) => z.von === mutter)?.widerrufen).not.toBeNull();
    expect(zeilen.find((z) => z.von === vater)?.widerrufen).toBeNull();
    expect((await serverStand(kind)).ereignisse).toBe(2);
    expect(await audit('lernapp.schreibabgabe_geloescht', kind)).toEqual([{ anzahl: 1, anlass: 'bezug' }]);

    // Das Elternkonto des Vaters wird gelöscht: Bezug und Einwilligung enden, der Rest geht
    expect((await loescheGemeindeKonto(vater, { akteurId: null, anlass: 'verwaltung' })).ok).toBe(true);
    expect(await serverStand(kind)).toMatchObject({ profil: 0, ereignisse: 0, abgaben: 0 });
    expect(await lernappEinwilligung(kind, { istKind: true })).toBe('eltern');
    expect(await audit('lernapp.lernstand_geloescht', kind)).toEqual([
      { anlass: 'bezug', lernstand: true, bestenliste: false, familie: false },
    ]);
  });

  it('ohne Einwilligung dieses Elternteils ändert das Ende des Bezugs nichts', async () => {
    const mutter = await konto('[Elternteil] S', { rollen: ['gemeinde', 'eltern'] });
    const vater = await konto('[Elternteil] T', { rollen: ['gemeinde', 'eltern'] });
    const verwaltung = await konto('[Verwaltung] U');
    const kind = await konto('[Kind] U', { kind: true, rollen: ['schueler'] });
    const l = await lernende(kind, '[Kind] U', tag(1000));
    await db.insert(schema.elternKind).values([
      { elternId: mutter, lernendeId: l, bestaetigtAm: new Date() },
      { elternId: vater, lernendeId: l, bestaetigtAm: new Date() },
    ]);
    await db
      .insert(schema.kontoEinwilligung)
      .values({ lernendeId: l, art: 'lernapp', textVersion: 'v1', erteiltVon: vater, erteiltAm: vorTagen(10) });
    await abgabe(kind, vorTagen(3));
    await lernstand(kind);
    await elternFreigabe.beantrageBezugEnde(verwaltung, l, mutter);
    const leitung = { benutzerId: randomUUID(), email: 'leitung@example.test', rollen: [{ rolle: 'leitung' as const }] };
    expect(await elternFreigabe.entscheideBezugEnde(leitung, l, mutter, true)).toBeNull();
    expect(await serverStand(kind)).toMatchObject({ profil: 1, ereignisse: 2, abgaben: 1 });
  });
});
