import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it, vi } from 'vitest';
import { schema } from '@/lib/db';
import { besondereTage } from '@/lib/kalender/besondere-tage';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Verwaltung „Besondere Tage“ (AUFTRAG 3.10, MN-15, ADR 0030): Vorschläge übernehmen (idempotent), Datum korrigieren,
 * „bestätigt“ nur mit `religioes.freigeben`, jede Änderung ohne Freigabe setzt zurück; öffentlich nur Geprüftes, sonst
 * der berechnete Tag als „vorläufig“. Einstellungen › Spenden mit IBAN-Prüfung.
 */
vi.mock('next-intl/server', () => ({
  getTranslations: async (o: { locale: string }) => (k: string) => `${o.locale}:${k}`,
}));

const { client, db } = await verwaltungsUmgebung();
const { uebernehmeVorschlaege, speichereBesonderenTag, bestaetigeBesonderenTag, entferneBesonderenTag } =
  await import('@/server/actions/besondere-tage');
const { speichereSpenden } = await import('@/server/actions/einstellungen-spenden');
const { ladeBesondereTage } = await import('@/server/queries/kalender');
afterAll(() => client.close());

const JAHR = 2027;
const anzahl = besondereTage(JAHR).length;
const MEVLID = besondereTage(JAHR).find((v) => v.schluessel === 'mevlid')!.datum;

/** Übernommene Zeile eines Vorschlags (Titel aus dem Sprach-Mock „de:tage.<schlüssel>“). */
async function zeile(schluessel: string) {
  const alle = await db.select().from(schema.besondererTag);
  return alle.find((z) => z.titel.de === `de:tage.${schluessel}`)!;
}

describe('Vorschläge übernehmen', () => {
  it('ohne Recht (Leitung, Bildung, ohne zweiten Faktor): wirft, nichts angelegt', async () => {
    for (const [rollen, zweiFaktor] of [
      [[{ rolle: 'leitung' as const }], true],
      [[{ rolle: 'bildung' as const }], true],
      [[{ rolle: 'redaktion' as const }], false],
    ] as const) {
      await angemeldetAls([...rollen], zweiFaktor);
      await expect(uebernehmeVorschlaege(formular({ jahr: String(JAHR) }))).rejects.toThrow('KEIN_RECHT');
    }
    expect(await db.select().from(schema.besondererTag)).toHaveLength(0);
  });

  it('übernimmt alle Vorschläge des Jahres als „berechnet“ und „zur Prüfung“, Titel in drei Sprachen; zweiter Lauf legt nichts an', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    await uebernehmeVorschlaege(formular({ jahr: String(JAHR) }));
    const zeilen = await db.select().from(schema.besondererTag);
    expect(zeilen).toHaveLength(anzahl);
    expect(zeilen.every((z) => z.quelle === 'berechnet' && z.freigabe === 'zur_pruefung')).toBe(true);
    const mevlid = await zeile('mevlid');
    expect(mevlid.titel).toEqual({ de: 'de:tage.mevlid', tr: 'tr:tage.mevlid', en: 'en:tage.mevlid' });
    await uebernehmeVorschlaege(formular({ jahr: String(JAHR) }));
    expect(await db.select().from(schema.besondererTag)).toHaveLength(anzahl);
    const audit = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.zielTyp, 'besonderer_tag'));
    expect(audit).toHaveLength(1);
    expect(audit[0].details).toEqual({ jahr: JAHR, anzahl });
  });

  it('auch nach Datumskorrektur um einen Tag bleibt die Übernahme idempotent', async () => {
    const kurban = await zeile('kurbanBayrami');
    const arefe = await zeile('arefe');
    const plus = (d: string) => new Date(Date.parse(`${d}T12:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
    await db
      .update(schema.besondererTag)
      .set({ datum: plus(kurban.datum) })
      .where(eq(schema.besondererTag.id, kurban.id));
    await db
      .update(schema.besondererTag)
      .set({ datum: plus(arefe.datum) })
      .where(eq(schema.besondererTag.id, arefe.id));
    await uebernehmeVorschlaege(formular({ jahr: String(JAHR) }));
    expect(await db.select().from(schema.besondererTag)).toHaveLength(anzahl);
  });
});

describe('Bearbeiten und Freigabe (ADR 0030)', () => {
  let id = '';
  const formularWerte = (zusatz: Record<string, string> = {}) => ({
    art: 'kandil',
    datum: MEVLID,
    titelDe: 'Mevlid Kandili',
    titelTr: 'Mevlid Kandili',
    titelEn: '',
    beschreibungDe: '',
    beschreibungTr: '',
    beschreibungEn: '',
    ...zusatz,
  });

  it('öffentlich vor der Freigabe: nur der berechnete Tag, „vorläufig“', async () => {
    const tage = await ladeBesondereTage(`${JAHR}-01-01`, `${JAHR}-12-31`);
    expect(tage).toHaveLength(anzahl);
    expect(tage.every((t) => t.vorlaeufig && t.schluessel !== null)).toBe(true);
  });

  it('Redaktion darf korrigieren, aber nicht bestätigen; ihre Änderung bleibt „zur Prüfung“', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    id = (await zeile('mevlid')).id;
    expect(await speichereBesonderenTag({}, formular({ ...formularWerte({ bestaetigen: 'ja' }), id }))).toMatchObject({
      fehler: 'keinFreigaberecht',
    });
    expect(await speichereBesonderenTag({}, formular({ ...formularWerte(), id }))).toMatchObject({ gespeichert: expect.any(Number) });
    const [z] = await db.select().from(schema.besondererTag).where(eq(schema.besondererTag.id, id));
    expect(z).toMatchObject({
      datum: MEVLID,
      titel: { de: 'Mevlid Kandili', tr: 'Mevlid Kandili' },
      quelle: 'berechnet',
      freigabe: 'zur_pruefung',
      geprueftVon: null,
    });
    expect(aufrufe.updateTag).toContain('kalender');
    await expect(bestaetigeBesonderenTag(formular({ id }))).rejects.toThrow('KEIN_RECHT');
  });

  it('religiöse Prüfung bestätigt: Quelle „bestätigt“, geprüft, Audit; öffentlich ersetzt er den Vorschlag', async () => {
    const imam = (await angemeldetAls([{ rolle: 'religioese_pruefung' }]))!;
    await bestaetigeBesonderenTag(formular({ id }));
    const [z] = await db.select().from(schema.besondererTag).where(eq(schema.besondererTag.id, id));
    expect(z).toMatchObject({ quelle: 'bestaetigt', freigabe: 'geprueft', geprueftVon: imam });
    const audit = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, 'besonderer_tag.bestaetigt'));
    expect(audit).toHaveLength(1);
    const tage = await ladeBesondereTage(`${JAHR}-01-01`, `${JAHR}-12-31`);
    expect(tage).toHaveLength(anzahl);
    const bestaetigt = tage.filter((t) => !t.vorlaeufig);
    expect(bestaetigt).toEqual([
      expect.objectContaining({ id: `t-${id}`, datum: MEVLID, titel: { de: 'Mevlid Kandili', tr: 'Mevlid Kandili' } }),
    ]);
    expect(tage.some((t) => t.schluessel === 'mevlid')).toBe(false);
  });

  it('jede spätere Änderung ohne Freigabe setzt zurück; die religiöse Prüfung kann beim Speichern bestätigen', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    await speichereBesonderenTag({}, formular({ ...formularWerte({ titelDe: 'Mevlid-Nacht' }), id }));
    expect((await db.select().from(schema.besondererTag).where(eq(schema.besondererTag.id, id)))[0]).toMatchObject({
      freigabe: 'zur_pruefung',
      quelle: 'berechnet',
    });
    expect((await ladeBesondereTage(`${JAHR}-01-01`, `${JAHR}-12-31`)).every((t) => t.vorlaeufig)).toBe(true);
    await angemeldetAls([{ rolle: 'religioese_pruefung' }]);
    await speichereBesonderenTag({}, formular({ ...formularWerte({ titelDe: 'Mevlid-Nacht', bestaetigen: 'ja' }), id }));
    expect((await db.select().from(schema.besondererTag).where(eq(schema.besondererTag.id, id)))[0]).toMatchObject({
      freigabe: 'geprueft',
      quelle: 'bestaetigt',
    });
  });

  it('eigener Tag anlegen (Weiterleitung) und entfernen', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    const e = (await speichereBesonderenTag(
      {},
      formular(formularWerte({ art: 'sonstiges', titelDe: 'Tag der offenen Moschee', datum: '2027-10-03' })),
    ).catch((x: { ziel?: string }) => x)) as { ziel?: string };
    expect(e.ziel).toMatch(/^\/verwaltung\/besondere-tage\/[0-9a-f-]{36}\?angelegt=1$/);
    const neu = e.ziel!.split('/')[3].split('?')[0];
    const weg = (await entferneBesonderenTag(formular({ id: neu })).catch((x: { ziel?: string }) => x)) as { ziel?: string };
    expect(weg.ziel).toBe('/verwaltung/besondere-tage?jahr=2027');
    expect(await db.select().from(schema.besondererTag).where(eq(schema.besondererTag.id, neu))).toHaveLength(0);
  });
});

describe('Einstellungen › Spenden', () => {
  const IBAN = 'DE89370400440532013000';

  it('ohne Recht „einstellung.bearbeiten“ (Redaktion): keinRecht', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    expect(await speichereSpenden({}, formular({ empfaenger: '[Verein]', iban: IBAN }))).toEqual({ fehler: 'keinRecht' });
  });

  it('falsche IBAN abgelehnt; gültige gespeichert (normalisiert), Audit nur mit Schlüssel, Tag einstellungen', async () => {
    const admin = (await angemeldetAls([{ rolle: 'administration' }]))!;
    expect(await speichereSpenden({}, formular({ empfaenger: '[Verein]', iban: 'DE89 3704 0044 0532 0130 01' }))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { iban: 'iban' },
    });
    expect(
      await speichereSpenden(
        {},
        formular({
          empfaenger: '[Verein]',
          iban: 'de89 3704 0044 0532 0130 00',
          zweck0TitelDe: 'Moschee',
          zweck0Verwendungszweck: 'Spende Moschee',
        }),
      ),
    ).toMatchObject({ gespeichert: expect.any(Number) });
    const [z] = await db.select().from(schema.einstellung).where(eq(schema.einstellung.schluessel, 'spenden'));
    expect(z.wert).toEqual({
      empfaenger: '[Verein]',
      iban: IBAN,
      bic: '',
      zwecke: [{ titel: { de: 'Moschee' }, verwendungszweck: 'Spende Moschee' }],
    });
    const [audit] = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.zielId, 'spenden'));
    expect(audit).toMatchObject({ benutzerId: admin, aktion: 'einstellung.geaendert', details: null });
    expect(aufrufe.updateTag).toContain('einstellungen');
  });
});
