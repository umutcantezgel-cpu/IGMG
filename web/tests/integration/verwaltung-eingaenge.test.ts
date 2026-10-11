import { and, eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { entschluessele, verschluessele } from '@/lib/krypto';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * C08/C16 (Z-04, Z-06, Z-07, G-07): Eingänge sehen nur berechtigte Rollen (je Art, Organisationsredaktion nur eigene
 * Veranstaltungen), jeder Detailabruf und jede Änderung steht im Audit-Log (ohne Personendaten), Abschluss startet
 * die Löschfrist, Löschen ist endgültig, der Löschlauf entfernt fällige Eingänge, Export nur mit Recht und Audit.
 */
const { client, db } = await verwaltungsUmgebung();
const q = await import('@/server/queries/verwaltung/eingaenge');
const actions = await import('@/server/actions/eingaenge');
const { loescheAbgelaufene } = await import('@/lib/eingaenge/loeschlauf');
const { speichereLoeschfristen } = await import('@/server/actions/einstellungen');
const { GET: exportGET } = await import('@/app/[locale]/verwaltung/(geschuetzt)/eingaenge/export/route');
const { ladeAngemeldet } = await import('@/lib/rechte/pruefe');
afterAll(() => client.close());

const [gtTermin, ktTermin] = await db
  .insert(schema.veranstaltung)
  .values([
    {
      slug: 'gt-termin',
      titel: { de: 'GT-Termin' },
      kategorie: 'jugend',
      organisation: 'gt',
      beginn: new Date(Date.now() + 5 * 86_400_000),
      status: 'veroeffentlicht',
      anmeldungAktiv: true,
    },
    {
      slug: 'kt-termin',
      titel: { de: 'KT-Termin' },
      kategorie: 'frauen',
      organisation: 'kt',
      beginn: new Date(Date.now() + 6 * 86_400_000),
      status: 'veroeffentlicht',
      anmeldungAktiv: true,
    },
  ])
  .returning({ id: schema.veranstaltung.id });

async function eingang(
  art: 'voranmeldung' | 'veranstaltungsanmeldung' | 'mitgliedsantrag' | 'kontakt',
  daten: Record<string, unknown>,
  extra: Partial<typeof schema.eingang.$inferInsert> = {},
) {
  const p = verschluessele(daten);
  const [z] = await db
    .insert(schema.eingang)
    .values({ art, datenVerschluesselt: p.daten, schluesselId: p.schluesselId, ...extra })
    .returning({ id: schema.eingang.id });
  return z.id;
}

const voran = await eingang('voranmeldung', { vorname: 'Testkind', eltern1Email: 'testperson.sechs@example.test' });
const mitglied = await eingang('mitgliedsantrag', { vorname: 'Testperson', motivation: 'Test' });
const anmGt = await eingang(
  'veranstaltungsanmeldung',
  { name: 'Testperson Sieben' },
  { bezugId: gtTermin.id, loeschenAb: new Date(Date.now() + 35 * 86_400_000) },
);
const anmKt = await eingang('veranstaltungsanmeldung', { name: 'Testperson Acht' }, { bezugId: ktTermin.id });

async function als(rollen: Parameters<typeof angemeldetAls>[0]) {
  await angemeldetAls(rollen);
  return (await ladeAngemeldet())!;
}
const auditVon = (zielId: string) => db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.zielId, zielId));

beforeEach(() => {
  aufrufe.refresh = 0;
});

describe('Sichtbarkeit je Rolle', () => {
  it('Bildung sieht nur Voranmeldungen, Mitgliederverwaltung nur Mitgliedsanfragen, Administration alles', async () => {
    const ids = async (rollen: Parameters<typeof angemeldetAls>[0]) =>
      (await q.ladeEingangsListe({ seite: 1 }, await als(rollen))).zeilen.map((z) => z.id).sort();
    expect(await ids([{ rolle: 'bildung' }])).toEqual([voran]);
    expect(await ids([{ rolle: 'mitgliederverwaltung' }])).toEqual([mitglied]);
    expect(await ids([{ rolle: 'administration' }])).toEqual([voran, mitglied, anmGt, anmKt].sort());
    // Redaktion pflegt Veranstaltungen und sieht deren Anmeldungen (Matrix), sonst nichts
    expect(await ids([{ rolle: 'redaktion' }])).toEqual([anmGt, anmKt].sort());
  });

  it('Organisationsredaktion GT sieht nur Anmeldungen zu GT-Terminen; fremdes Detail = null ohne Audit', async () => {
    const a = await als([{ rolle: 'organisationsredaktion', organisation: 'gt' }]);
    expect((await q.ladeEingangsListe({ seite: 1 }, a)).zeilen.map((z) => z.id)).toEqual([anmGt]);
    expect(await q.ladeEingangDetail(anmKt, a)).toBeNull();
    expect((await auditVon(anmKt)).filter((x) => x.aktion === 'eingang.gelesen')).toHaveLength(0);
  });

  it('Liste enthält keine Personendaten; Detail entschlüsselt und protokolliert den Abruf (ohne Personendaten)', async () => {
    const a = await als([{ rolle: 'bildung' }]);
    const liste = await q.ladeEingangsListe({ seite: 1 }, a);
    expect(JSON.stringify(liste)).not.toContain('Testkind');
    const d = await q.ladeEingangDetail(voran, a);
    expect(d?.daten).toMatchObject({ vorname: 'Testkind' });
    const audit = (await auditVon(voran)).filter((x) => x.aktion === 'eingang.gelesen');
    expect(audit).toHaveLength(1);
    expect(audit[0]).toMatchObject({ benutzerId: a.benutzerId, details: { art: 'voranmeldung' } });
    expect(JSON.stringify(audit[0])).not.toContain('Testkind');
  });

  it('Zähler neuer Eingänge je Rolle', async () => {
    expect(await q.zaehleNeueEingaenge(await als([{ rolle: 'bildung' }]))).toBe(1);
    expect(await q.zaehleNeueEingaenge(await als([{ rolle: 'organisationsredaktion', organisation: 'kt' }]))).toBe(1);
  });
});

describe('Bearbeiten', () => {
  it('Status „erledigt“ startet die Frist (180 Tage), Wiederöffnen hebt sie auf; Audit mit von/nach', async () => {
    await als([{ rolle: 'bildung' }]);
    await actions.setzeStatus(formular({ id: voran, status: 'erledigt' }));
    let [z] = await db.select().from(schema.eingang).where(eq(schema.eingang.id, voran));
    expect(z.status).toBe('erledigt');
    expect(z.erledigtAm).not.toBeNull();
    expect(Math.round((z.loeschenAb!.getTime() - z.erledigtAm!.getTime()) / 86_400_000)).toBe(180);
    await actions.setzeStatus(formular({ id: voran, status: 'in_bearbeitung' }));
    [z] = await db.select().from(schema.eingang).where(eq(schema.eingang.id, voran));
    expect(z).toMatchObject({ status: 'in_bearbeitung', erledigtAm: null, loeschenAb: null });
    const audit = (await auditVon(voran)).filter((x) => x.aktion === 'eingang.status');
    expect(audit.map((x) => x.details)).toEqual([
      { art: 'voranmeldung', von: 'neu', nach: 'erledigt' },
      { art: 'voranmeldung', von: 'erledigt', nach: 'in_bearbeitung' },
    ]);
    expect(aufrufe.refresh).toBeGreaterThan(0);
  });

  it('Anmeldung: Abschluss nimmt die frühere Frist (Termin + 30 oder Abschluss + 30); Wiederöffnen behält sie; Platzzählung erneuert', async () => {
    await als([{ rolle: 'organisationsredaktion', organisation: 'gt' }]);
    const frist = async () =>
      (await db.select({ l: schema.eingang.loeschenAb }).from(schema.eingang).where(eq(schema.eingang.id, anmGt)))[0].l;
    const vorher = await frist(); // Termin in 5 Tagen + 30 = 35 Tage
    await actions.setzeStatus(formular({ id: anmGt, status: 'abgelehnt' }));
    const nachher = await frist();
    expect(nachher!.getTime()).toBeLessThan(vorher!.getTime());
    expect(Math.round((nachher!.getTime() - Date.now()) / 86_400_000)).toBe(30);
    await actions.setzeStatus(formular({ id: anmGt, status: 'neu' }));
    expect((await frist())?.getTime()).toBe(nachher!.getTime());
    expect(aufrufe.updateTag).toContain(`anmeldungen:${gtTermin.id}`);
  });

  it('ohne Bearbeitungsrecht oder für fremde Organisation: KeinRecht, nichts geändert', async () => {
    await als([{ rolle: 'bildung' }]);
    await expect(actions.setzeStatus(formular({ id: mitglied, status: 'erledigt' }))).rejects.toThrow('KEIN_RECHT');
    await als([{ rolle: 'organisationsredaktion', organisation: 'gt' }]);
    await expect(actions.endgueltigLoeschen(formular({ id: anmKt }))).rejects.toThrow('KEIN_RECHT');
    await angemeldetAls([{ rolle: 'bildung' }], false); // ohne Zwei-Faktor
    await expect(actions.notizHinzufuegen(formular({ id: voran, text: 'x' }))).rejects.toThrow();
    const [z] = await db.select({ s: schema.eingang.status }).from(schema.eingang).where(eq(schema.eingang.id, mitglied));
    expect(z.s).toBe('neu');
  });

  it('Notiz wird verschlüsselt gespeichert und protokolliert', async () => {
    await als([{ rolle: 'bildung' }]);
    await actions.notizHinzufuegen(formular({ id: voran, text: 'Rückruf vereinbart' }));
    const [n] = await db.select().from(schema.eingangNotiz).where(eq(schema.eingangNotiz.eingangId, voran));
    expect(n.textVerschluesselt.toString('utf8')).not.toContain('Rückruf');
    expect(entschluessele<string>(n.textVerschluesselt, n.schluesselId)).toBe('Rückruf vereinbart');
    expect((await auditVon(voran)).some((x) => x.aktion === 'eingang.notiz')).toBe(true);
  });

  it('endgültig löschen: Eingang, Einwilligung, Notizen und Mail-Ausgang weg; Audit bleibt (ohne Personendaten)', async () => {
    await db.insert(schema.einwilligung).values({ eingangId: voran, textSchluessel: 't', textVersion: 'v', sprache: 'de' });
    const m = verschluessele({ an: 'testperson.sechs@example.test', daten: {} });
    await db.insert(schema.mailAusgang).values({
      vorlage: 'bestaetigung',
      sprache: 'de',
      datenVerschluesselt: m.daten,
      schluesselId: m.schluesselId,
      bezugEingangId: voran,
    });
    await als([{ rolle: 'bildung' }]);
    await expect(actions.endgueltigLoeschen(formular({ id: voran }))).rejects.toMatchObject({ ziel: '/verwaltung/eingaenge?geloescht=1' });
    expect(await db.select().from(schema.eingang).where(eq(schema.eingang.id, voran))).toHaveLength(0);
    expect(await db.select().from(schema.einwilligung).where(eq(schema.einwilligung.eingangId, voran))).toHaveLength(0);
    expect(await db.select().from(schema.eingangNotiz).where(eq(schema.eingangNotiz.eingangId, voran))).toHaveLength(0);
    expect(await db.select().from(schema.mailAusgang).where(eq(schema.mailAusgang.bezugEingangId, voran))).toHaveLength(0);
    const audit = (await auditVon(voran)).filter((x) => x.aktion === 'eingang.geloescht');
    expect(audit).toHaveLength(1);
  });
});

describe('Löschlauf (C16)', () => {
  it('löscht fällige Eingänge mit Audit (System), behält nicht fällige; versendete Mails nach 30 Tagen weg', async () => {
    const faellig = await eingang('kontakt', { name: 'Testperson Neun' }, { loeschenAb: new Date(Date.now() - 1000) });
    const spaeter = await eingang('kontakt', { name: 'Testperson Zehn' }, { loeschenAb: new Date(Date.now() + 86_400_000) });
    const m = verschluessele({ an: 'testperson.elf@example.test', daten: {} });
    const [alt] = await db
      .insert(schema.mailAusgang)
      .values({
        vorlage: 'bestaetigung',
        sprache: 'de',
        datenVerschluesselt: m.daten,
        schluesselId: m.schluesselId,
        gesendetAm: new Date(Date.now() - 31 * 86_400_000),
      })
      .returning({ id: schema.mailAusgang.id });
    const r = await loescheAbgelaufene();
    expect(r.eingaenge).toBe(1);
    expect(r.mails).toBeGreaterThanOrEqual(1);
    expect(await db.select().from(schema.eingang).where(eq(schema.eingang.id, faellig))).toHaveLength(0);
    expect(await db.select().from(schema.eingang).where(eq(schema.eingang.id, spaeter))).toHaveLength(1);
    expect(await db.select().from(schema.mailAusgang).where(eq(schema.mailAusgang.id, alt.id))).toHaveLength(0);
    const [a] = await db
      .select()
      .from(schema.auditEintrag)
      .where(and(eq(schema.auditEintrag.zielId, faellig), eq(schema.auditEintrag.aktion, 'eingang.frist_geloescht')));
    expect(a).toMatchObject({ benutzerId: null, details: { art: 'kontakt' } });
  });

  it('Wartungsroute: ohne Token 401', async () => {
    const { POST } = await import('@/app/api/wartung/loeschfristen/route');
    expect((await POST(new Request('http://localhost/api/wartung/loeschfristen', { method: 'POST' }))).status).toBe(401);
  });
});

describe('Export und Einstellungen', () => {
  it('Export CSV: BOM, Semikolon, Schutz vor Formeln, nur sichtbare Arten; Audit mit Anzahl; ohne Recht 403', async () => {
    await eingang('mitgliedsantrag', { vorname: '=HYPERLINK("x")', motivation: 'a;b' });
    const a = await als([{ rolle: 'mitgliederverwaltung' }]);
    const antwort = await exportGET(new Request('http://localhost/verwaltung/eingaenge/export?format=csv'));
    expect(antwort.headers.get('content-type')).toContain('text/csv');
    const bytes = new Uint8Array(await antwort.clone().arrayBuffer());
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]); // BOM für Excel (text() entfernt es beim Dekodieren)
    const text = await antwort.text();
    expect(text).toContain(`"'=HYPERLINK(""x"")"`);
    expect(text).toContain('"a;b"');
    expect(text).not.toContain('Testperson Sieben');
    const [audit] = await db
      .select()
      .from(schema.auditEintrag)
      .where(and(eq(schema.auditEintrag.aktion, 'eingang.exportiert'), eq(schema.auditEintrag.benutzerId, a.benutzerId)));
    expect(audit.details).toMatchObject({ anzahl: 2, format: 'csv' });
    await angemeldetAls([{ rolle: 'bildung' }], false); // ohne Zwei-Faktor
    expect((await exportGET(new Request('http://localhost/verwaltung/eingaenge/export'))).status).toBe(403);
    await angemeldetAls(null);
    expect((await exportGET(new Request('http://localhost/verwaltung/eingaenge/export'))).status).toBe(403);
  });

  it('Löschfristen speichern: nur mit Recht, Werte geprüft, Audit; Abschluss nutzt die neue Frist', async () => {
    await als([{ rolle: 'bildung' }]);
    expect(await speichereLoeschfristen({}, formular({ voranmeldung: '90' }))).toEqual({ fehler: 'keinRecht' });
    await als([{ rolle: 'administration' }]);
    const werte = { voranmeldung: '90', veranstaltungsanmeldung: '30', mitgliedsantrag: '365', kontakt: '60', moschee_anfrage: '120' };
    expect(await speichereLoeschfristen({}, formular({ ...werte, kontakt: '0' }))).toMatchObject({ fehler: 'pruefen' });
    expect(await speichereLoeschfristen({}, formular(werte))).toHaveProperty('gespeichert');
    const neu = await eingang('kontakt', { name: 'Testperson Zwölf' });
    await actions.setzeStatus(formular({ id: neu, status: 'erledigt' }));
    const [z] = await db.select().from(schema.eingang).where(eq(schema.eingang.id, neu));
    expect(Math.round((z.loeschenAb!.getTime() - z.erledigtAm!.getTime()) / 86_400_000)).toBe(60);
  });
});
