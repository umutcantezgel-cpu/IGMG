import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { angemeldetAls, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * C11b (ADR 0007): Neuigkeiten, Veranstaltungen und Kurse verweisen per `bildId` auf die Mediathek, Neuigkeiten
 * zusätzlich per Bildknoten im Text. Gespeichert wird nur ein vorhandenes Bild außerhalb des Papierkorbs (kein PDF);
 * öffentlich liefern die Abfragen Adresse, Maße und Alt-Text – Bilder im Papierkorb fallen weg (Platzhalter).
 */
const { client, db } = await verwaltungsUmgebung();
const neuigkeiten = await import('@/server/actions/neuigkeiten');
const veranstaltungen = await import('@/server/actions/veranstaltungen');
const kurse = await import('@/server/actions/kurse');
const { ladeNachricht, ladeNachrichten } = await import('@/server/queries/nachrichten');
const { ladeVeranstaltung } = await import('@/server/queries/veranstaltungen');
const { ladeKurse } = await import('@/server/queries/kurse');
const { ladeBildAuswahl } = await import('@/server/queries/verwaltung/medien');
const { bildIdsAus } = await import('@/lib/medien/bild');
afterAll(() => client.close());

async function medium(name: string, w: Partial<typeof schema.medium.$inferInsert> = {}): Promise<string> {
  const [z] = await db
    .insert(schema.medium)
    .values({
      schluessel: `${name.padEnd(16, '0').slice(0, 16)}/${name}.jpg`,
      typ: 'image/jpeg',
      groesse: 1234,
      breite: 1600,
      hoehe: 900,
      alt: { de: `Testbild ${name}`, tr: `Test görseli ${name}` },
      dateiname: `${name}.jpg`,
      ...w,
    })
    .returning({ id: schema.medium.id });
  return z.id;
}
const ziel = (e: unknown) => (e as { ziel?: string } | null)?.ziel ?? '';
const idAus = (pfad: string) => (z: string) => new RegExp(`^/verwaltung/${pfad}/([0-9a-f-]{36})\\?angelegt=1$`).exec(z)?.[1];
const doc = (mediumId: string) =>
  JSON.stringify({
    type: 'doc',
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: 'Vor dem Bild' }] },
      { type: 'image', attrs: { mediumId } },
    ],
  });

const bild = await medium('abcdefabcdef0001');
const pdf = await medium('abcdefabcdef0002', {
  typ: 'application/pdf',
  breite: null,
  hoehe: null,
  schluessel: 'abcdefabcdef0002/datei.pdf',
});
const papierkorb = await medium('abcdefabcdef0003', { imPapierkorbSeit: new Date() });

describe('Neuigkeiten', () => {
  it('Titelbild und Bildknoten speichern; öffentlich mit Adresse, Maßen und Alt-Text', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    const e = await neuigkeiten
      .speichereNeuigkeit(
        {},
        formular({ titelDe: 'C11b Mit Bild', kategorie: 'gemeinde', status: 'veroeffentlicht', bildId: bild, inhaltDe: doc(bild) }),
      )
      .catch((f: unknown) => f);
    const id = idAus('neuigkeiten')(ziel(e))!;
    const [z] = await db.select().from(schema.nachricht).where(eq(schema.nachricht.id, id));
    expect(z.bildId).toBe(bild);
    expect(bildIdsAus(z.inhalt)).toEqual([bild]);
    const n = (await ladeNachricht(z.slug))!;
    expect(n.bild).toEqual({
      id: bild,
      url: '/medien/abcdefabcdef0001/abcdefabcdef0001.jpg',
      breite: 1600,
      hoehe: 900,
      alt: { de: 'Testbild abcdefabcdef0001', tr: 'Test görseli abcdefabcdef0001' },
    });
    expect(Object.keys(n.textBilder)).toEqual([bild]);
    expect((await ladeNachrichten()).find((x) => x.id === id)?.bild?.id).toBe(bild);
  });

  it('PDF, Papierkorb oder unbekannte ID: Feldfehler bildUngueltig, nichts gespeichert', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    const vorher = (await db.select().from(schema.nachricht)).length;
    for (const [feld, wert] of [
      ['bildId', pdf],
      ['bildId', papierkorb],
      ['bildId', '00000000-0000-4000-8000-000000000009'],
      ['inhaltDe', doc(papierkorb)],
    ] as const)
      expect(
        await neuigkeiten.speichereNeuigkeit({}, formular({ titelDe: 'C11b Falsch', kategorie: 'gemeinde', [feld]: wert })),
      ).toMatchObject({
        fehler: 'pruefen',
        feldFehler: { [feld]: 'bildUngueltig' },
      });
    expect(
      await neuigkeiten.speichereNeuigkeit({}, formular({ titelDe: 'C11b Format', kategorie: 'gemeinde', bildId: 'kein-uuid' })),
    ).toMatchObject({
      feldFehler: { bildId: 'ungueltig' },
    });
    expect((await db.select().from(schema.nachricht)).length).toBe(vorher);
  });

  it('Bild später im Papierkorb: öffentlich kein Bild (Platzhalter), Bildknoten fehlt in der Karte', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    const spaeter = await medium('abcdefabcdef0004');
    const e = await neuigkeiten
      .speichereNeuigkeit(
        {},
        formular({ titelDe: 'C11b Später weg', kategorie: 'gemeinde', status: 'veroeffentlicht', bildId: spaeter, inhaltDe: doc(spaeter) }),
      )
      .catch((f: unknown) => f);
    const id = idAus('neuigkeiten')(ziel(e))!;
    await db.update(schema.medium).set({ imPapierkorbSeit: new Date() }).where(eq(schema.medium.id, spaeter));
    const [z] = await db.select().from(schema.nachricht).where(eq(schema.nachricht.id, id));
    const n = (await ladeNachricht(z.slug))!;
    expect(n.bild).toBeNull();
    expect(n.textBilder).toEqual({});
  });
});

describe('Veranstaltungen und Kurse', () => {
  it('Veranstaltung mit Bild: gespeichert und öffentlich; PDF abgelehnt', async () => {
    await angemeldetAls([{ rolle: 'administration' }]);
    const werte = { titelDe: 'C11b Termin', kategorie: 'gemeinde', datum: '2027-03-06', beginnZeit: '19:00', status: 'veroeffentlicht' };
    expect(await veranstaltungen.speichereVeranstaltung({}, formular({ ...werte, bildId: pdf }))).toMatchObject({
      feldFehler: { bildId: 'bildUngueltig' },
    });
    const e = await veranstaltungen.speichereVeranstaltung({}, formular({ ...werte, bildId: bild })).catch((f: unknown) => f);
    const id = idAus('veranstaltungen')(ziel(e))!;
    const [z] = await db.select().from(schema.veranstaltung).where(eq(schema.veranstaltung.id, id));
    expect(z.bildId).toBe(bild);
    expect((await ladeVeranstaltung(z.slug))?.bild?.id).toBe(bild);
  });

  it('Kurs mit Bild: gespeichert und in der Kursliste; ohne Bild bleibt bildId leer', async () => {
    await angemeldetAls([{ rolle: 'bildung' }]);
    const e = await kurse
      .speichereKurs({}, formular({ titelDe: 'C11b Kurs', status: 'veroeffentlicht', bildId: bild }))
      .catch((f: unknown) => f);
    const id = idAus('kurse')(ziel(e))!;
    expect((await ladeKurse()).find((k) => k.id === id)?.bild?.alt.de).toBe('Testbild abcdefabcdef0001');
    const ohne = await kurse
      .speichereKurs({}, formular({ titelDe: 'C11b Kurs ohne Bild', status: 'veroeffentlicht' }))
      .catch((f: unknown) => f);
    const [k] = await db
      .select({ bildId: schema.kurs.bildId })
      .from(schema.kurs)
      .where(eq(schema.kurs.id, idAus('kurse')(ziel(ohne))!));
    expect(k.bildId).toBeNull();
  });
});

describe('Bildauswahl', () => {
  it('nur Bilder außerhalb des Papierkorbs, mit Adresse und deutschem Alt-Text', async () => {
    const liste = await ladeBildAuswahl();
    const ids = liste.map((b) => b.id);
    expect(ids).toContain(bild);
    expect(ids).not.toContain(pdf);
    expect(ids).not.toContain(papierkorb);
    expect(liste.find((b) => b.id === bild)).toMatchObject({
      url: '/medien/abcdefabcdef0001/abcdefabcdef0001.jpg',
      alt: 'Testbild abcdefabcdef0001',
    });
  });
});
