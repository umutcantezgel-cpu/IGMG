import { randomUUID } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { MODULE, type Modul } from '@/components/verwaltung/shell/module';
import type { KennzahlModul } from '@/components/verwaltung/uebersicht/sichtbarkeit';
import { schema } from '@/lib/db';
import { verschluessele } from '@/lib/krypto';
import { angemeldetAls, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * C01 (Blatt V01): Übersicht der Verwaltung. Geprüft werden die Kennzahlen je Rolle und Organisation (Organisations-
 * redaktion nur eigene Organisation), der Ausschluss von Papierkorb, Entwürfen und Vergangenem, das Anzeigefenster von
 * Ankündigungen, ungelesene Nachrichten je Person, die Kurzlisten mit Leserecht ohne Personendaten und die Kacheln je
 * freigegebenem Modul. Jede Testperson ist fiktiv (G-04).
 */
const { client, db } = await verwaltungsUmgebung();
const { ladeUebersicht, ladeKommendeVeranstaltungen, ladeLetzteNeuigkeiten, zaehleUngelesenePostfach } =
  await import('@/server/queries/verwaltung/uebersicht');
const { sichtbareKacheln } = await import('@/components/verwaltung/uebersicht/sichtbarkeit');
const { ladeAngemeldet } = await import('@/lib/rechte/pruefe');
afterAll(() => client.close());

const JETZT = Date.now();
const TAG = 86_400_000;
const zeit = (tage: number) => new Date(JETZT + tage * TAG);
const alleModule = new Set<KennzahlModul>(['neuigkeiten', 'veranstaltungen', 'ankuendigungen', 'eingaenge', 'postfach', 'tickets']);

// ---- Datenbestand (einmal für die Datei) -----------------------------------------------------------------------------

const veranstaltungZeilen = await db
  .insert(schema.veranstaltung)
  .values([
    {
      slug: 'c01-gt-kommend',
      titel: { de: 'C01 GT kommend' },
      kategorie: 'jugend',
      organisation: 'gt',
      beginn: zeit(5),
      status: 'veroeffentlicht',
      anmeldungAktiv: true,
    },
    {
      slug: 'c01-kt-kommend',
      titel: { de: 'C01 KT kommend' },
      kategorie: 'frauen',
      organisation: 'kt',
      beginn: zeit(6),
      status: 'veroeffentlicht',
      anmeldungAktiv: true,
    },
    {
      slug: 'c01-allgemein-kommend',
      titel: { de: 'C01 Allgemein kommend' },
      kategorie: 'gemeinde',
      beginn: zeit(7),
      status: 'veroeffentlicht',
    },
    { slug: 'c01-extra-eins', titel: { de: 'C01 Extra eins' }, kategorie: 'gemeinde', beginn: zeit(10), status: 'veroeffentlicht' },
    { slug: 'c01-extra-zwei', titel: { de: 'C01 Extra zwei' }, kategorie: 'gemeinde', beginn: zeit(11), status: 'veroeffentlicht' },
    {
      slug: 'c01-vergangen',
      titel: { de: 'C01 vergangen' },
      kategorie: 'gemeinde',
      organisation: 'gt',
      beginn: zeit(-10),
      ende: new Date(JETZT - 10 * TAG + 7_200_000),
      status: 'veroeffentlicht',
    },
    { slug: 'c01-entwurf', titel: { de: 'C01 Entwurf' }, kategorie: 'bildung', organisation: 'gt', beginn: zeit(8), status: 'entwurf' },
    {
      slug: 'c01-papierkorb',
      titel: { de: 'C01 Papierkorb' },
      kategorie: 'bildung',
      organisation: 'gt',
      beginn: zeit(9),
      status: 'veroeffentlicht',
      imPapierkorbSeit: new Date(),
    },
    {
      slug: 'c01-serie',
      titel: { de: 'C01 Serie' },
      kategorie: 'gebet',
      organisation: 'gt',
      beginn: new Date('2020-01-04T18:00:00Z'),
      wiederholung: 'FREQ=WEEKLY;BYDAY=SA',
      status: 'veroeffentlicht',
    },
    {
      slug: 'c01-serie-vorbei',
      titel: { de: 'C01 Serie vorbei' },
      kategorie: 'gebet',
      organisation: 'kt',
      beginn: new Date('2020-01-04T18:00:00Z'),
      wiederholung: 'FREQ=WEEKLY;BYDAY=SA;UNTIL=20200301T000000Z',
      status: 'veroeffentlicht',
    },
  ])
  .returning({ id: schema.veranstaltung.id, slug: schema.veranstaltung.slug });
const veranstaltungId = (slug: string) => veranstaltungZeilen.find((z) => z.slug === slug)!.id;

await db.insert(schema.nachricht).values([
  { slug: 'c01-news-a', titel: { de: 'C01 News A' }, status: 'veroeffentlicht', veroeffentlichtAm: zeit(-7), erstelltAm: zeit(-8) },
  { slug: 'c01-news-b', titel: { de: 'C01 News B' }, status: 'entwurf', organisation: 'gt', erstelltAm: zeit(-6) },
  {
    slug: 'c01-news-c',
    titel: { de: 'C01 News C' },
    status: 'veroeffentlicht',
    organisation: 'kt',
    veroeffentlichtAm: zeit(-5),
    erstelltAm: zeit(-9),
  },
  {
    slug: 'c01-news-d',
    titel: { de: 'C01 News D' },
    status: 'veroeffentlicht',
    organisation: 'gt',
    veroeffentlichtAm: zeit(-4),
    erstelltAm: zeit(-9),
  },
  { slug: 'c01-news-e', titel: { de: 'C01 News E' }, status: 'entwurf', erstelltAm: zeit(-3) },
  {
    slug: 'c01-news-f',
    titel: { de: 'C01 News F' },
    status: 'veroeffentlicht',
    organisation: 'gt',
    veroeffentlichtAm: zeit(-2),
    erstelltAm: zeit(-9),
    imPapierkorbSeit: new Date(),
  },
  {
    slug: 'c01-news-g',
    titel: { de: 'C01 News G' },
    status: 'veroeffentlicht',
    organisation: 'gt',
    veroeffentlichtAm: zeit(-1),
    erstelltAm: zeit(-9),
  },
  { slug: 'c01-news-h', titel: { de: 'C01 News H' }, status: 'entwurf', organisation: 'kt', erstelltAm: zeit(-0.5) },
]);

const text = { de: 'C01 Text' };
await db.insert(schema.ankuendigung).values([
  { titel: { de: 'C01 Ankündigung allgemein' }, inhalt: text, status: 'veroeffentlicht' },
  {
    titel: { de: 'C01 Ankündigung GT' },
    inhalt: text,
    status: 'veroeffentlicht',
    organisation: 'gt',
    sichtbarAb: zeit(-1),
    laeuftAb: zeit(2),
  },
  { titel: { de: 'C01 Ankündigung KT Zukunft' }, inhalt: text, status: 'veroeffentlicht', organisation: 'kt', sichtbarAb: zeit(1) },
  { titel: { de: 'C01 Ankündigung KT abgelaufen' }, inhalt: text, status: 'veroeffentlicht', organisation: 'kt', laeuftAb: zeit(-1) },
  { titel: { de: 'C01 Ankündigung Entwurf' }, inhalt: text, status: 'entwurf', organisation: 'gt' },
  {
    titel: { de: 'C01 Ankündigung Papierkorb' },
    inhalt: text,
    status: 'veroeffentlicht',
    organisation: 'gt',
    imPapierkorbSeit: new Date(),
  },
  {
    titel: { de: 'C01 Ankündigung KT laufend' },
    inhalt: text,
    status: 'veroeffentlicht',
    organisation: 'kt',
    sichtbarAb: zeit(-2),
    laeuftAb: zeit(5),
  },
]);

await db.insert(schema.ticket).values([
  { titel: 'C01 Ticket offen', beschreibung: 'Testmeldung', status: 'offen' },
  { titel: 'C01 Ticket in Bearbeitung GT', beschreibung: 'Testmeldung', status: 'in_bearbeitung', organisation: 'gt' },
  { titel: 'C01 Ticket gelöst', beschreibung: 'Testmeldung', status: 'geloest', organisation: 'gt' },
  { titel: 'C01 Ticket geschlossen', beschreibung: 'Testmeldung', status: 'geschlossen' },
  { titel: 'C01 Ticket offen KT', beschreibung: 'Testmeldung', status: 'offen', organisation: 'kt' },
]);

const verschluesselt = (daten: Record<string, unknown>) => {
  const p = verschluessele(daten);
  return { datenVerschluesselt: p.daten, schluesselId: p.schluesselId };
};
await db.insert(schema.eingang).values([
  { art: 'voranmeldung', status: 'neu', ...verschluesselt({ vorname: 'Testkind Eins' }) },
  {
    art: 'veranstaltungsanmeldung',
    status: 'neu',
    bezugId: veranstaltungId('c01-gt-kommend'),
    ...verschluesselt({ name: 'Testperson Eins' }),
  },
  {
    art: 'veranstaltungsanmeldung',
    status: 'neu',
    bezugId: veranstaltungId('c01-kt-kommend'),
    ...verschluesselt({ name: 'Testperson Zwei' }),
  },
  { art: 'mitgliedsantrag', status: 'neu', ...verschluesselt({ vorname: 'Testperson Drei' }) },
  { art: 'kontakt', status: 'erledigt', ...verschluesselt({ name: 'Testperson Vier' }) },
]);

// ---- Hilfen -----------------------------------------------------------------------------------------------------------

/** Meldet eine Testperson an und liefert ihre Sitzung (wie die Seiten sie laden). */
async function als(rollen: Parameters<typeof angemeldetAls>[0]) {
  await angemeldetAls(rollen);
  return (await ladeAngemeldet())!;
}

const titel = <T extends { titel: string }>(zeilen: T[] | null) => zeilen?.map((z) => z.titel) ?? null;

describe('Kennzahlen je Rolle und Organisation', () => {
  it('Administration: alle Organisationen, Zählregeln für Papierkorb, Entwürfe, Vergangenes und Ankündigungsfenster', async () => {
    const u = await ladeUebersicht(await als([{ rolle: 'administration' }]), alleModule);
    expect(u.kennzahlen).toEqual({ neuigkeiten: 3, veranstaltungen: 6, ankuendigungen: 3, eingaenge: 4, postfach: 0, tickets: 3 });
  });

  it('Organisationsredaktion GT: nur Zahlen der eigenen Organisation und allgemeine Inhalte bleiben außen vor', async () => {
    const u = await ladeUebersicht(await als([{ rolle: 'organisationsredaktion', organisation: 'gt' }]), alleModule);
    expect(u.kennzahlen).toEqual({ neuigkeiten: 1, veranstaltungen: 2, ankuendigungen: 1, eingaenge: 1, postfach: 0, tickets: 1 });
  });

  it('Organisationsredaktion KT: eigene Zahlen; eine Serie, die schon beendet ist, zählt nicht', async () => {
    const u = await ladeUebersicht(await als([{ rolle: 'organisationsredaktion', organisation: 'kt' }]), alleModule);
    expect(u.kennzahlen).toEqual({ neuigkeiten: 1, veranstaltungen: 1, ankuendigungen: 1, eingaenge: 1, postfach: 0, tickets: 1 });
  });

  it('Redaktion: alle Organisationen; Eingänge nur zu Veranstaltungsanmeldungen', async () => {
    const u = await ladeUebersicht(await als([{ rolle: 'redaktion' }]), alleModule);
    expect(u.kennzahlen).toEqual({ neuigkeiten: 3, veranstaltungen: 6, ankuendigungen: 3, eingaenge: 2, postfach: 0, tickets: 3 });
  });

  it('Bildung: Voranmeldungen und Tickets; keine Zahl für Veranstaltungen, Neuigkeiten oder Ankündigungen', async () => {
    const u = await ladeUebersicht(await als([{ rolle: 'bildung' }]), alleModule);
    expect(u.kennzahlen).toEqual({ neuigkeiten: 0, veranstaltungen: 0, ankuendigungen: 0, eingaenge: 1, postfach: 0, tickets: 3 });
  });

  it('Mitgliederverwaltung: nur Mitgliedsanträge bei den Eingängen', async () => {
    const u = await ladeUebersicht(await als([{ rolle: 'mitgliederverwaltung' }]), alleModule);
    expect(u.kennzahlen).toEqual({ neuigkeiten: 0, veranstaltungen: 0, ankuendigungen: 0, eingaenge: 1, postfach: 0, tickets: 3 });
  });

  it('Angemeldet ohne Rolle: alle Zahlen 0, keine Kurzliste', async () => {
    const u = await ladeUebersicht(await als([]), alleModule);
    expect(u).toEqual({
      kennzahlen: { neuigkeiten: 0, veranstaltungen: 0, ankuendigungen: 0, eingaenge: 0, postfach: 0, tickets: 0 },
      kommend: null,
      neuigkeiten: null,
    });
  });

  it('Kennzahlen gibt es nur für die angefragten Module (die Seite zeigt nur freigegebene)', async () => {
    const u = await ladeUebersicht(await als([{ rolle: 'administration' }]), new Set<KennzahlModul>(['tickets']));
    expect(u.kennzahlen).toEqual({ tickets: 3 });
  });
});

describe('Kurzlisten', () => {
  it('Kommende Veranstaltungen: die nächsten fünf in Reihenfolge; Vergangenes, Entwürfe, Papierkorb und beendete Serien fehlen', async () => {
    const u = await ladeUebersicht(await als([{ rolle: 'administration' }]), alleModule);
    const kommend = u.kommend!;
    expect(kommend).toHaveLength(5);
    // Die Serie liegt innerhalb der nächsten sieben Tage (je nach Wochentag); deshalb als Menge geprüft
    expect([...titel(kommend)!].sort()).toEqual([
      'C01 Allgemein kommend',
      'C01 Extra eins',
      'C01 GT kommend',
      'C01 KT kommend',
      'C01 Serie',
    ]);
    const zeiten = kommend.map((z) => z.beginn.getTime());
    expect([...zeiten].sort((x, y) => x - y)).toEqual(zeiten);
    expect(kommend.every((z) => z.beginn.getTime() >= JETZT)).toBe(true);
    expect(titel(kommend)).not.toContain('C01 vergangen');
    expect(titel(kommend)).not.toContain('C01 Entwurf');
    expect(titel(kommend)).not.toContain('C01 Papierkorb');
    expect(titel(kommend)).not.toContain('C01 Serie vorbei');
    expect(titel(kommend)).not.toContain('C01 Extra zwei');
  });

  it('Kommende Veranstaltungen: Organisationsredaktion GT sieht nur die eigene Organisation', async () => {
    const u = await ladeUebersicht(await als([{ rolle: 'organisationsredaktion', organisation: 'gt' }]), alleModule);
    expect(titel(u.kommend)?.sort()).toEqual(['C01 GT kommend', 'C01 Serie']);
  });

  it('Aktuelle Neuigkeiten: die letzten fünf nach Datum mit Status; Entwürfe und Papierkorb wie vorgesehen', async () => {
    const u = await ladeUebersicht(await als([{ rolle: 'administration' }]), alleModule);
    expect(u.neuigkeiten?.map((z) => z.titel)).toEqual(['C01 News H', 'C01 News G', 'C01 News E', 'C01 News D', 'C01 News C']);
    expect(u.neuigkeiten?.map((z) => z.status)).toEqual(['entwurf', 'veroeffentlicht', 'entwurf', 'veroeffentlicht', 'veroeffentlicht']);
    expect(u.neuigkeiten?.every((z) => z.datum instanceof Date)).toBe(true);
  });

  it('Aktuelle Neuigkeiten: Organisationsredaktion GT sieht nur die eigene Organisation', async () => {
    const u = await ladeUebersicht(await als([{ rolle: 'organisationsredaktion', organisation: 'gt' }]), alleModule);
    expect(u.neuigkeiten?.map((z) => z.titel)).toEqual(['C01 News G', 'C01 News D', 'C01 News B']);
  });

  it('Aktuelle Neuigkeiten: Organisationsredaktion KT sieht Entwurf und Veröffentlichung der eigenen Organisation', async () => {
    const liste = await ladeLetzteNeuigkeiten(await als([{ rolle: 'organisationsredaktion', organisation: 'kt' }]));
    expect(liste?.map((z) => z.titel)).toEqual(['C01 News H', 'C01 News C']);
  });

  it('Ohne Leserecht gibt es keine Kurzliste (Bildung)', async () => {
    const a = await als([{ rolle: 'bildung' }]);
    expect(await ladeKommendeVeranstaltungen(a, new Date())).toBeNull();
    expect(await ladeLetzteNeuigkeiten(a)).toBeNull();
  });

  it('Einträge der Kurzlisten enthalten nur Titel, Datum, Status und Kennzeichen, keine Personendaten', async () => {
    const u = await ladeUebersicht(await als([{ rolle: 'administration' }]), alleModule);
    expect(u.kommend?.map((z) => Object.keys(z).sort()).every((k) => k.join() === 'beginn,ende,ganztaegig,id,titel')).toBe(true);
    expect(u.neuigkeiten?.map((z) => Object.keys(z).sort()).every((k) => k.join() === 'datum,id,status,titel')).toBe(true);
  });
});

describe('Postfach: ungelesene Nachrichten je Person', () => {
  it('zählt Nachrichten anderer in eigenen Unterhaltungen nach der Lesemarke; eigene und fremde Unterhaltungen zählen nicht', async () => {
    const leserId = (await angemeldetAls([{ rolle: 'administration' }]))!;
    const absenderId = randomUUID();
    await db.insert(schema.user).values({
      id: absenderId,
      name: 'Testperson Zwei',
      email: `testperson.${absenderId.slice(0, 8)}@example.test`,
      emailVerified: true,
    });
    const [gespraech] = await db
      .insert(schema.unterhaltung)
      .values({ betreff: 'C01 Testunterhaltung' })
      .returning({ id: schema.unterhaltung.id });
    await db.insert(schema.unterhaltungTeilnehmer).values([
      { unterhaltungId: gespraech.id, benutzerId: leserId },
      { unterhaltungId: gespraech.id, benutzerId: absenderId },
    ]);
    await db.insert(schema.postfachNachricht).values([
      { unterhaltungId: gespraech.id, absenderId, text: 'C01 erste', erstelltAm: zeit(-3) },
      { unterhaltungId: gespraech.id, absenderId, text: 'C01 zweite', erstelltAm: zeit(-2) },
      { unterhaltungId: gespraech.id, absenderId: leserId, text: 'C01 eigene', erstelltAm: zeit(-1) },
    ]);
    const a = (await ladeAngemeldet())!;
    expect(await zaehleUngelesenePostfach(a)).toBe(2);

    const lesemarke = (wann: Date) =>
      db
        .update(schema.unterhaltungTeilnehmer)
        .set({ gelesenBis: wann })
        .where(and(eq(schema.unterhaltungTeilnehmer.unterhaltungId, gespraech.id), eq(schema.unterhaltungTeilnehmer.benutzerId, leserId)));
    await lesemarke(zeit(-2.5));
    expect(await zaehleUngelesenePostfach(a)).toBe(1);

    // Eine Unterhaltung, an der die Person nicht teilnimmt, zählt nicht
    const [fremd] = await db
      .insert(schema.unterhaltung)
      .values({ betreff: 'C01 fremde Unterhaltung' })
      .returning({ id: schema.unterhaltung.id });
    await db.insert(schema.unterhaltungTeilnehmer).values({ unterhaltungId: fremd.id, benutzerId: absenderId });
    await db.insert(schema.postfachNachricht).values({ unterhaltungId: fremd.id, absenderId, text: 'C01 fremd', erstelltAm: zeit(-1) });
    expect(await zaehleUngelesenePostfach(a)).toBe(1);

    await lesemarke(zeit(0));
    expect(await zaehleUngelesenePostfach(a)).toBe(0);
  });
});

describe('Kacheln je freigegebenem Modul', () => {
  const modul = (schluessel: Modul['schluessel'], gebaut: boolean, recht: Modul['recht']): Modul => ({
    schluessel,
    pfad: `/verwaltung/${schluessel}`,
    recht,
    icon: schluessel,
    gebaut,
  });
  const liste: Modul[] = [
    modul('neuigkeiten', true, 'nachricht.lesen'),
    modul('veranstaltungen', true, 'veranstaltung.lesen'),
    modul('ankuendigungen', false, 'ankuendigung.lesen'),
    modul('eingaenge', true, [
      'eingang.kontakt.lesen',
      'eingang.veranstaltungsanmeldung.lesen',
      'eingang.voranmeldung.lesen',
      'eingang.mitgliedsantrag.lesen',
      'eingang.moschee_anfrage.lesen',
    ]),
    modul('audit', true, 'audit.lesen'),
  ];

  it('zeigt nur gebaute Module mit Leserecht, in Reihenfolge der Seitenleiste; Module ohne Kennzahl nie', () => {
    const schluessel = (rollen: Parameters<typeof sichtbareKacheln>[1]) => sichtbareKacheln(liste, rollen).map((k) => k.schluessel);
    expect(schluessel([{ rolle: 'bildung' }])).toEqual(['eingaenge']);
    expect(schluessel([{ rolle: 'redaktion' }])).toEqual(['neuigkeiten', 'veranstaltungen', 'eingaenge']);
    // Administration hat auch audit.lesen; ankuendigungen ist nicht gebaut, audit hat keine Kennzahl
    expect(schluessel([{ rolle: 'administration' }])).toEqual(['neuigkeiten', 'veranstaltungen', 'eingaenge']);
  });

  it('ein freigeschaltetes Modul erscheint ohne Änderung an der Übersicht', () => {
    const freigeschaltet = liste.map((m) => (m.schluessel === 'ankuendigungen' ? { ...m, gebaut: true } : m));
    expect(sichtbareKacheln(freigeschaltet, [{ rolle: 'administration' }]).map((k) => k.schluessel)).toEqual([
      'neuigkeiten',
      'veranstaltungen',
      'ankuendigungen',
      'eingaenge',
    ]);
  });

  it('die echte Modulliste liefert nur gebaute Module mit Kennzahl und ohne Leserecht nichts', () => {
    const kacheln = sichtbareKacheln(MODULE, [{ rolle: 'administration' }]);
    for (const k of kacheln) expect(MODULE.find((m) => m.schluessel === k.schluessel)?.gebaut).toBe(true);
    expect(kacheln.map((k) => k.schluessel)).not.toContain('uebersicht');
    expect(sichtbareKacheln(MODULE, [])).toEqual([]);
  });
});
