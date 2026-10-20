import { randomUUID } from 'node:crypto';
import { eq, sql } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Import der Lern-App-Inhalte (PLAN §6.6, ADR 0041 Nr. 6) gegen PGlite mit dem Testkurs: idempotent über SHA je Datei und
 * inhaltHash je Eintrag, Änderung setzt Status und Prüfungen zurück, menschlich geprüfte Einträge sind eingefroren
 * (Konflikt), Entferntes wird gesperrt, kaputte Verweise brechen alles ab. Testdaten neutral, ohne Religionsbezug.
 */
const { client, db } = await verwaltungsUmgebung();
const { importiereLernapp, ImportFehler } = await import('@/lib/lernapp/inhalt/import');
const { lernappTestkurs, testkursQuellen, sprachDatei, uebersetzungDatei } = await import('../../drizzle/seeds/lernapp-test');
afterAll(() => client.close());

const anzahl = async (tabelle: string, bedingung = sql`true`) =>
  (await db.execute<{ n: number }>(sql`select count(*)::int as n from ${sql.identifier(tabelle)} where ${bedingung}`)).rows[0]?.n;
const version = async (kurs: string) =>
  (await db.select({ v: schema.lernappKurs.version }).from(schema.lernappKurs).where(eq(schema.lernappKurs.id, kurs)))[0]?.v;
const satz = async (s: string) => (await db.select().from(schema.lernappSatz).where(eq(schema.lernappSatz.schluessel, s)))[0]!;

const QUELLE = { standSchluessel: 'lernapp_testkurs' };

/** Quellen des Testkurses mit geänderter Sprachdatei de. */
function mitDe(aendern: (d: ReturnType<typeof sprachDatei>) => void) {
  const d = sprachDatei('de');
  aendern(d);
  return testkursQuellen().map((q) => (q.pfad.includes('/sprache/de/') ? { ...q, text: JSON.stringify(d) } : q));
}

describe('Testkurs', () => {
  it('legt Kurse, Richtungen, Einheiten, Lektionen, Aufgaben, Lemmata, Sätze, Übersetzungen, Tipps und Clips an', async () => {
    const { bericht, clips } = await lernappTestkurs(db);
    expect(bericht.dateien).toBe(9);
    expect(bericht.konflikte).toEqual([]);
    expect(bericht.kurse).toEqual(['ar', 'de', 'tr']);
    expect(await anzahl('lernapp_kurs', sql`aktiv`)).toBe(3);
    expect(await anzahl('lernapp_richtung', sql`aktiv`)).toBe(6);
    expect(await anzahl('lernapp_einheit')).toBe(3);
    expect(await anzahl('lernapp_lektion')).toBe(6);
    expect(await anzahl('lernapp_aufgabe')).toBe(21);
    expect(await anzahl('lernapp_lemma')).toBe(12);
    expect(await anzahl('lernapp_satz')).toBe(9);
    expect(await anzahl('lernapp_uebersetzung')).toBe(6 * 7);
    expect(await anzahl('lernapp_tipp')).toBe(4);
    expect(clips).toBe(21);
    expect(await anzahl('lernapp_audio', sql`stimme = 'test:ton'`)).toBe(21);
    // Alles mit dem Stand der Datei, Herkunft und Lizenz je Eintrag, KI-/Test-Herkunft als Verfasser
    expect(await anzahl('lernapp_satz', sql`status = 'automatisch_geprueft' and lizenz = 'CC-BY-SA-4.0' and quelle like 'test:%'`)).toBe(9);
    expect((await satz('tr.a1.e01.s0001')).verfasstVon).toBe('test:lernapp-testkurs');
    expect((await satz('tr.a1.e01.s0001')).inhaltHash).toMatch(/^[0-9a-f]{64}$/);
    expect(await anzahl('lernapp_satz', sql`religionsbezug`)).toBe(0);
  });

  it('idempotent: zweiter Lauf überspringt alle Dateien, erzwungener Lauf ändert nichts', async () => {
    const vorher = await version('tr');
    const zweiter = await importiereLernapp(db, testkursQuellen(), QUELLE);
    expect(zweiter).toMatchObject({ dateien: 9, uebersprungen: 9, neu: 0, geaendert: 0, gesperrt: 0, kurse: [] });
    const erzwungen = await importiereLernapp(db, testkursQuellen(), { ...QUELLE, erzwingen: true });
    expect(erzwungen).toMatchObject({ uebersprungen: 0, neu: 0, geaendert: 0, gesperrt: 0, kurse: [] });
    expect(erzwungen.unveraendert).toBeGreaterThan(80);
    expect(await version('tr')).toBe(vorher);
  });
});

describe('Änderungen', () => {
  beforeEach(async () => {
    await importiereLernapp(db, testkursQuellen(), QUELLE);
  });

  it('geänderter Satz: neuer Hash, Status zurück, alte Prüfung gilt nicht mehr; Kursstand steigt', async () => {
    const alt = await satz('de.a1.e01.s0003');
    await db.update(schema.lernappSatz).set({ status: 'veroeffentlicht' }).where(eq(schema.lernappSatz.id, alt.id));
    const v = await version('de');
    const b = await importiereLernapp(
      db,
      mitDe((d) => {
        d.saetze[2]!.text = 'Das Buch ist alt.';
      }),
      QUELLE,
    );
    expect(b).toMatchObject({ uebersprungen: 8, geaendert: 1, neu: 0, kurse: ['de'] });
    const neu = await satz('de.a1.e01.s0003');
    expect(neu.text).toBe('Das Buch ist alt.');
    expect(neu.status).toBe('automatisch_geprueft');
    expect(neu.inhaltHash).not.toBe(alt.inhaltHash);
    expect(await version('de')).toBe((v ?? 0) + 1);
  });

  it('gleicher Inhalt: veroeffentlicht bleibt; entwurf wird automatisch_geprueft, wenn die Datei es meldet', async () => {
    const s1 = await satz('de.a1.e01.s0001');
    const s2 = await satz('de.a1.e01.s0002');
    await db.update(schema.lernappSatz).set({ status: 'veroeffentlicht' }).where(eq(schema.lernappSatz.id, s1.id));
    await db.update(schema.lernappSatz).set({ status: 'entwurf' }).where(eq(schema.lernappSatz.id, s2.id));
    await importiereLernapp(db, testkursQuellen(), { ...QUELLE, erzwingen: true });
    expect((await satz('de.a1.e01.s0001')).status).toBe('veroeffentlicht');
    expect((await satz('de.a1.e01.s0002')).status).toBe('automatisch_geprueft');
  });

  it('menschlich geprüft: KI-Stand überschreibt nicht, sondern ergibt einen Konflikt (auch in der Einstellung)', async () => {
    const s = await satz('de.a1.e01.s0002');
    await db
      .update(schema.lernappSatz)
      .set({ menschlichGeprueft: true, text: 'Das Haus ist sehr groß.' })
      .where(eq(schema.lernappSatz.id, s.id));
    const b = await importiereLernapp(
      db,
      mitDe((d) => {
        d.saetze[1]!.text = 'Das Haus ist klein.';
      }),
      QUELLE,
    );
    expect(b.konflikte).toEqual([expect.objectContaining({ tabelle: 'lernapp_satz', schluessel: 'de.a1.e01.s0002' })]);
    expect((await satz('de.a1.e01.s0002')).text).toBe('Das Haus ist sehr groß.');
    const [stand] = await db.select().from(schema.einstellung).where(eq(schema.einstellung.schluessel, 'lernapp_testkurs'));
    expect((stand?.wert as { konflikte: unknown[] }).konflikte).toHaveLength(1);
    await db.update(schema.lernappSatz).set({ menschlichGeprueft: false }).where(eq(schema.lernappSatz.id, s.id));
  });

  it('entfernte Lektion: Lektion und ihre Aufgaben gesperrt; entfernte Datei: Einheit bzw. Übersetzungen gesperrt', async () => {
    const b = await importiereLernapp(
      db,
      mitDe((d) => {
        d.lektionen = d.lektionen.slice(0, 1);
      }),
      { ...QUELLE, erzwingen: true },
    );
    expect(b.gesperrt).toBe(4);
    expect(await anzahl('lernapp_lektion', sql`schluessel = 'de.a1.e01.l02' and status = 'gesperrt'`)).toBe(1);
    expect(await anzahl('lernapp_aufgabe', sql`schluessel like 'de.a1.e01.l02.%' and status = 'gesperrt'`)).toBe(3);

    const ohne = testkursQuellen().filter((q) => !q.pfad.includes('/tr-aus-de/') && !q.pfad.includes('/sprache/ar/'));
    const c = await importiereLernapp(db, ohne, QUELLE);
    expect(await anzahl('lernapp_einheit', sql`schluessel = 'ar.a1.e01' and status = 'gesperrt'`)).toBe(1);
    expect(
      await anzahl(
        'lernapp_uebersetzung',
        sql`sprache = 'de' and status = 'gesperrt' and (satz_id in (select id from lernapp_satz where kurs_id = 'tr') or lemma_id in (select id from lernapp_lemma where kurs_id = 'tr'))`,
      ),
    ).toBe(7);
    expect(await anzahl('lernapp_tipp', sql`schluessel = 'tr.a1.e01.de.t01' and status = 'gesperrt'`)).toBe(1);
    expect(c.kurse).toEqual(['ar', 'tr']);
  });

  it('Verweis auf unbekanntes Lemma bricht ab, ohne etwas zu schreiben', async () => {
    const vorher = await anzahl('lernapp_aufgabe');
    const kaputt = mitDe((d) => {
      d.lektionen[0]!.aufgaben.push({ schluessel: 'de.a1.e01.l01.a99', typ: 'paare', lemmata: ['de.a1.e01.w001', 'de.a1.e09.w001'] });
    });
    await expect(importiereLernapp(db, kaputt, { ...QUELLE, erzwingen: true })).rejects.toBeInstanceOf(ImportFehler);
    expect(await anzahl('lernapp_aufgabe')).toBe(vorher);
  });

  it('Schema: falsche Lizenz, fehlender Schlüsselbezug und doppelte Schlüssel werden abgewiesen', async () => {
    const d = sprachDatei('tr');
    const roh = JSON.parse(JSON.stringify(d)) as Record<string, unknown> & { saetze: { lizenz: string }[] };
    roh.saetze[0]!.lizenz = 'CC-BY-NC-4.0';
    await expect(importiereLernapp(db, [{ pfad: 'x.json', text: JSON.stringify(roh) }])).rejects.toThrow(/lizenz/);
    const u = uebersetzungDatei('tr', 'de');
    u.eintraege[0]!.bezug = 'de.a1.e01.w001';
    await expect(importiereLernapp(db, [{ pfad: 'y.json', text: JSON.stringify(u) }])).rejects.toThrow(/Bezug/);
    await expect(
      importiereLernapp(db, [
        { pfad: 'a.json', text: JSON.stringify(sprachDatei('tr')) },
        { pfad: 'b.json', text: JSON.stringify(sprachDatei('tr')) },
      ]),
    ).rejects.toThrow(/auch in/);
  });

  it('eigene Quellen bleiben getrennt: der Inhalts-Import ohne Dateien sperrt den Testkurs nicht', async () => {
    const b = await importiereLernapp(db, [], { standSchluessel: `lernapp_import_${randomUUID().slice(0, 8)}` });
    expect(b).toMatchObject({ dateien: 0, gesperrt: 0 });
    expect(await anzahl('lernapp_einheit', sql`schluessel = 'tr.a1.e01' and status = 'automatisch_geprueft'`)).toBe(1);
  });
});
