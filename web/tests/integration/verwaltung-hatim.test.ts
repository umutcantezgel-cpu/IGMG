import { randomUUID } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Verwaltung „Hatim“ (AUFTRAG 3.10, B-19): Recht `hatim.bearbeiten`, Anlegen mit 30 freien Cüz, Ändern, Zustände
 * (veröffentlichen, abschließen, archivieren) mit Audit und Cache-Tags, Löschen nur für Entwürfe ohne Übernahmen,
 * Namen der Übernehmenden nur mit Audit-Eintrag.
 */
const { client, db } = await verwaltungsUmgebung();
const { legeHatimAnAktion, speichereHatim, setzeHatimZustand, loescheHatim } = await import('@/server/actions/hatim');
const { ladeHatimNamen } = await import('@/server/queries/verwaltung/hatim');
const { ladeHatim, uebernehmeCuz } = await import('@/lib/hatim/dienst');
afterAll(() => client.close());

const werte = (zusatz: Record<string, string> = {}) => ({
  titelDe: 'Hatim zum Ramadan',
  titelTr: 'Ramazan hatmi',
  anlassDe: 'Für die Gemeinde',
  beginn: '2027-02-08',
  ziel: '2027-03-09',
  ...zusatz,
});

async function anlegen(): Promise<string> {
  const e = (await legeHatimAnAktion({}, formular(werte())).catch((x: { ziel?: string }) => x)) as { ziel?: string };
  expect(e.ziel).toMatch(/^\/verwaltung\/hatim\/[0-9a-f-]{36}\?angelegt=1$/);
  return e.ziel!.split('/')[3].split('?')[0];
}

describe('Rechte', () => {
  it('ohne Rolle, Leitung, Bildung, religiöse Prüfung oder ohne zweiten Faktor: kein Anlegen, keine Zustandsänderung', async () => {
    for (const rollen of [
      [],
      [{ rolle: 'leitung' as const }],
      [{ rolle: 'bildung' as const }],
      [{ rolle: 'religioese_pruefung' as const }],
    ]) {
      await angemeldetAls(rollen);
      expect(await legeHatimAnAktion({}, formular(werte()))).toEqual({ fehler: 'keinRecht' });
      await expect(setzeHatimZustand(formular({ id: randomUUID(), schritt: 'veroeffentlichen' }))).rejects.toThrow('KEIN_RECHT');
    }
    await angemeldetAls([{ rolle: 'redaktion' }], false);
    expect(await legeHatimAnAktion({}, formular(werte()))).toEqual({ fehler: 'keinRecht' });
    expect(await db.select().from(schema.hatim)).toHaveLength(0);
  });
});

describe('Hatim verwalten', () => {
  let id = '';

  it('Anlegen: Entwurf mit 30 freien Cüz, Audit im selben Vorgang, nicht öffentlich', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    id = await anlegen();
    const [h] = await db.select().from(schema.hatim).where(eq(schema.hatim.id, id));
    expect(h).toMatchObject({
      titel: { de: 'Hatim zum Ramadan', tr: 'Ramazan hatmi' },
      anlass: { de: 'Für die Gemeinde' },
      beginn: '2027-02-08',
      ziel: '2027-03-09',
      oeffentlich: 'entwurf',
      status: 'offen',
    });
    expect(await db.select().from(schema.hatimTeil).where(eq(schema.hatimTeil.hatimId, id))).toHaveLength(30);
    expect(await ladeHatim(id)).toBeNull();
    const audit = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.zielId, id));
    expect(audit.map((a) => a.aktion)).toEqual(['inhalt.angelegt']);
  });

  it('Prüfung: Titel Pflicht, Ziel nicht vor Beginn, Anlass-Übersetzung nur mit deutschem Anlass', async () => {
    expect(
      await legeHatimAnAktion({}, formular(werte({ titelDe: '', ziel: '2027-01-01', anlassDe: '', anlassEn: 'For all' }))),
    ).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { titelDe: 'pflicht', ziel: 'zielVorBeginn' },
    });
    expect(await legeHatimAnAktion({}, formular(werte({ anlassDe: '', anlassEn: 'For all' })))).toMatchObject({
      feldFehler: { anlassDe: 'pflicht' },
    });
  });

  it('Ändern: neue Daten, Cache-Tags hatim und hatim:<id>', async () => {
    expect(await speichereHatim({}, formular({ ...werte({ titelDe: 'Hatim 2027', ziel: '' }), id }))).toMatchObject({
      gespeichert: expect.any(Number),
    });
    const [h] = await db.select().from(schema.hatim).where(eq(schema.hatim.id, id));
    expect(h).toMatchObject({ titel: { de: 'Hatim 2027', tr: 'Ramazan hatmi' }, ziel: null });
    expect(aufrufe.updateTag).toEqual(expect.arrayContaining(['hatim', `hatim:${id}`]));
    expect(await speichereHatim({}, formular({ ...werte(), id: 'keine-uuid' }))).toMatchObject({ fehler: 'nichtGefunden' });
  });

  it('Veröffentlichen → öffentlich mit Zahlen; Übernahme möglich; Löschen dann nicht mehr', async () => {
    await setzeHatimZustand(formular({ id, schritt: 'veroeffentlichen' }));
    expect(aufrufe.refresh).toBe(1);
    expect((await ladeHatim(id))?.teile).toHaveLength(30);
    const person = randomUUID();
    await db
      .insert(schema.user)
      .values({ id: person, name: 'Testperson Leser', email: `${person.slice(0, 8)}@example.test`, emailVerified: true });
    expect(await uebernehmeCuz(id, 7, person)).toBe('ok');
    await loescheHatim(formular({ id }));
    expect(await db.select().from(schema.hatim).where(eq(schema.hatim.id, id))).toHaveLength(1);
    const veroeffentlicht = await db
      .select()
      .from(schema.auditEintrag)
      .where(and(eq(schema.auditEintrag.zielId, id), eq(schema.auditEintrag.aktion, 'inhalt.veroeffentlicht')));
    expect(veroeffentlicht).toHaveLength(1);
  });

  it('Namen nur über ladeHatimNamen und nur mit Audit-Eintrag (ohne Namen im Protokoll)', async () => {
    const leser = (await angemeldetAls([{ rolle: 'redaktion' }]))!;
    const namen = await ladeHatimNamen(id, { benutzerId: leser });
    expect(namen).toHaveLength(30);
    expect(namen[6]).toMatchObject({ cuz: 7, name: 'Testperson Leser', gelesenAm: null });
    expect(namen[0]).toMatchObject({ cuz: 1, name: null });
    const [eintrag] = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, 'hatim.namen_gelesen'));
    expect(eintrag).toMatchObject({ benutzerId: leser, zielTyp: 'hatim', zielId: id });
    expect(JSON.stringify(eintrag)).not.toContain('Testperson');
    // Öffentlich weiter ohne Namen
    expect(JSON.stringify(await ladeHatim(id))).not.toContain('Testperson');
  });

  it('Abschließen, wieder öffnen, archivieren; unbekannter Schritt ändert nichts', async () => {
    await setzeHatimZustand(formular({ id, schritt: 'abschliessen' }));
    expect((await ladeHatim(id))?.status).toBe('abgeschlossen');
    await setzeHatimZustand(formular({ id, schritt: 'oeffnen' }));
    expect((await ladeHatim(id))?.status).toBe('offen');
    await setzeHatimZustand(formular({ id, schritt: 'archivieren' }));
    expect((await ladeHatim(id))?.status).toBe('archiviert');
    await setzeHatimZustand(formular({ id, schritt: 'loeschen' }));
    expect((await ladeHatim(id))?.status).toBe('archiviert');
  });

  it('Entwurf ohne Übernahmen lässt sich löschen (mit Audit)', async () => {
    const entwurf = await anlegen();
    const e = (await loescheHatim(formular({ id: entwurf })).catch((x: { ziel?: string }) => x)) as { ziel?: string };
    expect(e.ziel).toBe('/verwaltung/hatim?geloescht=1');
    expect(await db.select().from(schema.hatim).where(eq(schema.hatim.id, entwurf))).toHaveLength(0);
    expect(await db.select().from(schema.hatimTeil).where(eq(schema.hatimTeil.hatimId, entwurf))).toHaveLength(0);
    const audit = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.zielId, entwurf));
    expect(audit.map((a) => a.aktion).sort()).toEqual(['inhalt.angelegt', 'inhalt.geloescht']);
  });
});
