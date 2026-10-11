import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/** Rauchtest der Prüfumgebung (D05): anlegen, Cache-Tags, Audit, Papierkorb; ohne Anmeldung kein Zugriff. */
const { client, db } = await verwaltungsUmgebung();
const { speichereVeranstaltung, inPapierkorb } = await import('@/server/actions/veranstaltungen');
afterAll(() => client.close());

const gueltig = {
  titelDe: 'Testtermin Grundlage',
  kategorie: 'gemeinde',
  datum: '2026-11-07',
  beginnZeit: '19:00',
  status: 'veroeffentlicht',
};

describe('Verwaltung › Veranstaltungen (Grundlage)', () => {
  it('Administration legt an: Datensatz, Audit, sofortige und nachlaufende Invalidierung, Weiterleitung', async () => {
    const benutzer = await angemeldetAls([{ rolle: 'administration' }]);
    const fehler = await speichereVeranstaltung({}, formular(gueltig)).catch((e: Error & { ziel?: string }) => e);
    expect(fehler).toBeInstanceOf(Error);
    expect((fehler as { ziel?: string }).ziel).toMatch(/^\/verwaltung\/veranstaltungen\/[0-9a-f-]{36}\?angelegt=1$/);
    const [z] = await db.select().from(schema.veranstaltung).where(eq(schema.veranstaltung.slug, 'testtermin-grundlage'));
    expect(z?.status).toBe('veroeffentlicht');
    expect(z?.erstelltVon).toBe(benutzer);
    expect(aufrufe.updateTag).toEqual(['veranstaltungen', `veranstaltung:${z?.id}`]);
    expect(aufrufe.nachher).toHaveLength(1);
    const audit = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.zielId, z!.id));
    expect(audit.map((a) => a.aktion).sort()).toEqual(['inhalt.angelegt', 'inhalt.veroeffentlicht']);
  });

  it('im Papierkorb: Speichern wird serverseitig abgelehnt (nur wiederherstellen oder löschen)', async () => {
    await angemeldetAls([{ rolle: 'administration' }]);
    const [z] = await db
      .select({ id: schema.veranstaltung.id })
      .from(schema.veranstaltung)
      .where(eq(schema.veranstaltung.slug, 'testtermin-grundlage'));
    await db.update(schema.veranstaltung).set({ imPapierkorbSeit: new Date() }).where(eq(schema.veranstaltung.id, z.id));
    expect(await speichereVeranstaltung({}, formular({ ...gueltig, id: z.id, titelDe: 'Geändert' }))).toMatchObject({
      fehler: 'imPapierkorb',
    });
    const [nachher] = await db
      .select({ titel: schema.veranstaltung.titel })
      .from(schema.veranstaltung)
      .where(eq(schema.veranstaltung.id, z.id));
    expect(nachher.titel.de).toBe('Testtermin Grundlage');
    await db.update(schema.veranstaltung).set({ imPapierkorbSeit: null }).where(eq(schema.veranstaltung.id, z.id));
  });

  it('ohne Anmeldung: Speichern liefert keinRecht, Papierkorb wirft', async () => {
    await angemeldetAls(null);
    expect(await speichereVeranstaltung({}, formular(gueltig))).toEqual({ fehler: 'keinRecht' });
    const [z] = await db.select({ id: schema.veranstaltung.id }).from(schema.veranstaltung).limit(1);
    await expect(inPapierkorb(formular({ id: z!.id }))).rejects.toThrow('KEIN_RECHT');
  });
});
