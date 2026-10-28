import { and, eq, inArray, sql } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { VIDEOS_IGMG_REISEN } from '../../drizzle/seeds/bereiche/wissen';
import { ENTWURF_MERKER, entwurfZeile, seed as seedEntwuerfe, WISSEN_ENTWUERFE } from '../../drizzle/seeds/bereiche/wissen-entwuerfe';
import { wissenInhalt } from '@/components/website/wissen/inhalt';
import type { Datenbank } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { wendeSeedStaendeAn } from '@/lib/inhalt/seed-stand';
import { MIGRATION as MIGRATION_2026, wendeStand2026An } from '@/lib/inhalt/stand-2026';
import { marktstartStaende, MIGRATION, wendeStandMarktstartAn } from '@/lib/inhalt/stand-marktstart';
import { stabil } from '@/lib/inhalt/stand-2026';
import { testDatenbank } from './hilfen/db';

/**
 * Inhaltsmigration „Marktstart IGMG“ (scripts/inhalte-marktstart.ts, Welle 3): Beispielinhalte werden auf den Seed-Stand
 * gebracht und fehlende Bereiche angelegt, je mit Audit; redaktionelle Inhalte bleiben; ein zweiter Lauf ändert nichts.
 * Dazu die Wissensvideos von IGMG Reisen und die KI-Entwürfe: nur Slugs, die fehlen und die diese Datenbank nie bekommen
 * hat (Merker in `einstellung`) – endgültig Gelöschtes legt kein Bau neu an. Daten fiktiv bzw. aus den Seeds.
 */
const { client, db: pgDb } = await testDatenbank();
const db = pgDb as unknown as Datenbank;
afterAll(() => client.close());

beforeEach(async () => {
  await db.execute(sql`truncate table seiteninhalt, audit_eintrag, einstellung, wissen_thema, freigabe, revision cascade`);
});

const ZIEL = Object.fromEntries(marktstartStaende().map((s) => [s.bereich, s]));
const BEREICHE = Object.keys(ZIEL);

/** Alter Beispielstand (Auszüge der früheren Seeds): unbelegte Werte, Gründung als Platzhalter bzw. 1975. */
const ALT = {
  igmg: { ueberblick: { titel: { de: 'IGMG' } }, zahlen: { moscheen: '518', mitglieder: '350.000' } },
  'ueber-uns': {
    zeitleiste: [
      {
        kennzeichnung: { de: '[Gründungsjahr]' },
        titel: { de: '[Gründungsjahr] – Gründung' },
        bildbeschreibung: { de: 'Foto: [Test]' },
        reihenfolge: 1,
        symbol: 'standort',
      },
      {
        kennzeichnung: { de: 'Zukunft' },
        titel: { de: 'Zukunft – [Test]' },
        bildbeschreibung: { de: 'Foto: [Test]' },
        reihenfolge: 2,
        symbol: 'standort',
      },
    ],
    werte: [],
  },
  vorstand: { fuehrungSeit: '1975' },
  'organisation-ana-teskilati': { beschreibung: { de: 'Ana Teşkilatı – Anatolien [Test]' } },
};

async function lege(bereich: string, inhalt: unknown, istBeispiel: boolean) {
  await db.insert(schema.seiteninhalt).values({ bereich, inhalt, istBeispiel, quelle: '[Test]' });
}
async function zeile(bereich: string) {
  const [z] = await db.select().from(schema.seiteninhalt).where(eq(schema.seiteninhalt.bereich, bereich));
  return z;
}
const audits = () => db.select().from(schema.auditEintrag);
const migrationsAudits = async (migration: string) =>
  (await audits()).filter((a) => (a.details as { migration?: string } | null)?.migration === migration);

const SLUGS = WISSEN_ENTWUERFE.map((x) => x.slug);
const slugsDa = async () => (await db.select({ slug: schema.wissenThema.slug }).from(schema.wissenThema)).map((z) => z.slug).sort();
async function merker() {
  const [z] = await db.select().from(schema.einstellung).where(eq(schema.einstellung.schluessel, ENTWURF_MERKER));
  return z;
}
const angelegtAudits = async () => (await audits()).filter((a) => a.aktion === 'inhalt.angelegt' && a.zielTyp === 'wissen_thema');

/** Endgültig löschen wie `wissensThemaEndgueltigLoeschen` bzw. die Leerung des Papierkorbs: Thema, Revisionen, Freigabe-Verlauf. */
async function loescheEndgueltig(slug: string) {
  const [z] = await db.select({ id: schema.wissenThema.id }).from(schema.wissenThema).where(eq(schema.wissenThema.slug, slug));
  await db.delete(schema.wissenThema).where(eq(schema.wissenThema.id, z.id));
  await db.delete(schema.revision).where(and(eq(schema.revision.inhaltTyp, 'wissen_thema'), eq(schema.revision.inhaltId, z.id)));
  await db.delete(schema.freigabe).where(and(eq(schema.freigabe.inhaltTyp, 'wissen_thema'), eq(schema.freigabe.inhaltId, z.id)));
}

/** Seiteninhalt „wissen“ im alten Beispielstand: ein Video, ohne die Videos von IGMG Reisen. */
const WISSEN_ALT = wissenInhalt.parse({
  videos: [{ schluessel: 'video-1', thema: 'islam', titel: { de: 'Islam in 5 Minuten' }, dauer: '5 min', beschreibung: { de: '[Test]' } }],
});

describe('Inhaltsmigration Marktstart', () => {
  it('alter Beispielstand → Seed-Stand, fehlende Bereiche angelegt, je mit Audit; zweiter Lauf ändert nichts', async () => {
    for (const [bereich, inhalt] of Object.entries(ALT)) await lege(bereich, inhalt, true);
    await lege('wissen', WISSEN_ALT, true);

    const e = await wendeStandMarktstartAn(db);
    expect(e.bereiche).toEqual({
      igmg: 'aktualisiert',
      'ueber-uns': 'aktualisiert',
      vorstand: 'aktualisiert',
      'organisation-ana-teskilati': 'aktualisiert',
      'organisation-kadin-teskilati': 'eingefuegt',
      'organisation-genclik-teskilati': 'eingefuegt',
      'organisation-kadin-genclik-teskilati': 'eingefuegt',
      dachverband: 'eingefuegt',
      'hadsch-umra': 'eingefuegt',
    });
    expect(e.wissenVideos).toBe('aktualisiert');
    expect(e.wissenEntwuerfe.sort()).toEqual(WISSEN_ENTWUERFE.map((x) => x.slug).sort());

    for (const bereich of BEREICHE) {
      const z = await zeile(bereich);
      expect(stabil(z.inhalt), bereich).toBe(stabil(ZIEL[bereich].inhalt));
      expect(z.istBeispiel, bereich).toBe(true);
      expect(z.quelle, bereich).toBe(ZIEL[bereich].quelle);
      expect(z.aktualisiertVon, bereich).toBeNull();
    }
    expect(stabil((await zeile('igmg')).inhalt)).not.toMatch(/\b518\b|350\.000/);
    expect((await zeile('vorstand')).inhalt).toMatchObject({ fuehrungSeit: '1978' });
    const wissen = wissenInhalt.parse((await zeile('wissen')).inhalt);
    expect(wissen.videos.map((v) => v.schluessel)).toEqual(['video-1', ...VIDEOS_IGMG_REISEN.map((v) => v.schluessel)]);

    const eintraege = await audits();
    const seiten = eintraege.filter((a) => a.zielTyp === 'seiteninhalt');
    expect(seiten.map((a) => a.zielId).sort()).toEqual([...BEREICHE, 'wissen'].sort());
    expect(seiten.every((a) => a.aktion === 'inhalt.geaendert' && a.benutzerId === null)).toBe(true);
    expect(eintraege.every((a) => (a.details as { migration: string }).migration === MIGRATION)).toBe(true);
    const themen = eintraege.filter((a) => a.zielTyp === 'wissen_thema');
    expect(themen).toHaveLength(WISSEN_ENTWUERFE.length);
    expect(themen.every((a) => a.aktion === 'inhalt.angelegt')).toBe(true);
    // Entwürfe mit Antrag „zur Prüfung“ (ADR 0047) wie beim Seed
    const antraege = await db.select().from(schema.freigabe);
    expect(antraege).toHaveLength(WISSEN_ENTWUERFE.length);
    expect(antraege.every((f) => f.status === 'zur_pruefung')).toBe(true);

    const anzahl = eintraege.length;
    expect(await wendeStandMarktstartAn(db)).toEqual({
      bereiche: Object.fromEntries(BEREICHE.map((b) => [b, 'unveraendert'])),
      wissenVideos: 'unveraendert',
      wissenEntwuerfe: [],
    });
    expect(await audits()).toHaveLength(anzahl);
    expect(await db.select().from(schema.wissenThema)).toHaveLength(WISSEN_ENTWUERFE.length);
  });

  it('redaktionelle Zeilen (ist_beispiel = false) bleiben unberührt – auch „dachverband“ nach dem Hutba-Abgleich', async () => {
    const redaktionell = { ...ALT, dachverband: { eintraege: [] }, wissen: WISSEN_ALT };
    for (const [bereich, inhalt] of Object.entries(redaktionell)) await lege(bereich, inhalt, false);

    const e = await wendeStandMarktstartAn(db);
    for (const bereich of Object.keys(redaktionell).filter((b) => b !== 'wissen'))
      expect(e.bereiche[bereich], bereich).toBe('redaktionell');
    expect(e.wissenVideos).toBe('redaktionell');
    for (const [bereich, inhalt] of Object.entries(redaktionell)) {
      const z = await zeile(bereich);
      expect(z.inhalt, bereich).toEqual(inhalt);
      expect(z.istBeispiel, bereich).toBe(false);
      expect(z.quelle, bereich).toBe('[Test]');
    }
    // Nur die fehlenden Bereiche wurden angelegt
    expect(
      (await migrationsAudits(MIGRATION))
        .filter((a) => a.zielTyp === 'seiteninhalt')
        .map((a) => a.zielId)
        .sort(),
    ).toEqual(
      ['organisation-kadin-teskilati', 'organisation-genclik-teskilati', 'organisation-kadin-genclik-teskilati', 'hadsch-umra'].sort(),
    );
  });

  it('leere Datenbank: alle Bereiche angelegt, „wissen“ fehlt (der Seed legt ihn an)', async () => {
    const e = await wendeStandMarktstartAn(db);
    expect(Object.values(e.bereiche).every((a) => a === 'eingefuegt')).toBe(true);
    expect(e.wissenVideos).toBe('fehlt');
    expect(await zeile('wissen')).toBeUndefined();
    expect(await zeile('dachverband')).toMatchObject({ istBeispiel: true, quelle: ZIEL.dachverband.quelle });
    expect(await zeile('hadsch-umra')).toMatchObject({ istBeispiel: true, quelle: ZIEL['hadsch-umra'].quelle });
  });

  it('Wissens-Entwürfe einmalig: vorhandene Slugs bleiben unverändert, nur fehlende werden angelegt', async () => {
    const [erster, ...rest] = WISSEN_ENTWUERFE;
    await db
      .insert(schema.wissenThema)
      .values({ ...entwurfZeile(erster), status: 'entwurf', freigabe: 'geprueft', istBeispiel: false, titel: { de: '[Redaktion]' } });
    const e = await wendeStandMarktstartAn(db);
    expect(e.wissenEntwuerfe.sort()).toEqual(rest.map((x) => x.slug).sort());
    const [vorhanden] = await db.select().from(schema.wissenThema).where(eq(schema.wissenThema.slug, erster.slug));
    expect(vorhanden).toMatchObject({ status: 'entwurf', freigabe: 'geprueft', istBeispiel: false, titel: { de: '[Redaktion]' } });
    const neu = await db
      .select()
      .from(schema.wissenThema)
      .where(
        inArray(
          schema.wissenThema.slug,
          rest.map((x) => x.slug),
        ),
      );
    expect(neu.every((t) => t.freigabe === 'zur_pruefung' && t.istBeispiel)).toBe(true);
    expect((await wendeStandMarktstartAn(db)).wissenEntwuerfe).toEqual([]);
  });

  it('Reihenfolge inhalte-2026 → Marktstart ergibt den Seed-Stand; danach ändert inhalte-2026 nichts mehr', async () => {
    await lege('ueber-uns', ALT['ueber-uns'], true);
    expect((await wendeStand2026An(db)).ueberUns).toBe('aktualisiert');
    expect((await wendeStandMarktstartAn(db)).bereiche['ueber-uns']).toBe('aktualisiert');
    expect(stabil((await zeile('ueber-uns')).inhalt)).toBe(stabil(ZIEL['ueber-uns'].inhalt));
    expect((await wendeStand2026An(db)).ueberUns).toBe('unveraendert');
    expect(await migrationsAudits(MIGRATION_2026)).toHaveLength(1);
  });

  it('generischer Helfer: gleicher Inhalt in anderer Schlüsselfolge gilt als unverändert', async () => {
    const stand = { bereich: 'test-bereich', inhalt: { b: 1, a: { d: [1, 2], c: 'x' } }, quelle: '[Test-Quelle]' };
    await lege('test-bereich', { a: { c: 'x', d: [1, 2] }, b: 1 }, true);
    expect(await wendeSeedStaendeAn(db, 'test', [stand])).toEqual({ 'test-bereich': 'unveraendert' });
    expect(await audits()).toEqual([]);
    await db
      .update(schema.seiteninhalt)
      .set({ inhalt: { b: 2 } })
      .where(eq(schema.seiteninhalt.bereich, 'test-bereich'));
    expect(await wendeSeedStaendeAn(db, 'test', [stand])).toEqual({ 'test-bereich': 'aktualisiert' });
    expect((await audits()).map((a) => a.details)).toEqual([{ migration: 'test', ausgang: 'aktualisiert' }]);
    expect(await zeile('test-bereich')).toMatchObject({ quelle: '[Test-Quelle]', istBeispiel: true });
  });
});

describe('KI-Entwürfe einmal je Datenbank (Merker, ADR 0047 Nr. 4)', () => {
  it('frische Datenbank: Migration legt die vier an und setzt den Merker; ein zweiter Lauf ändert nichts', async () => {
    expect((await wendeStandMarktstartAn(db)).wissenEntwuerfe.sort()).toEqual([...SLUGS].sort());
    const gesetzt = await merker();
    expect([...(gesetzt.wert as { slugs: string[] }).slugs].sort()).toEqual([...SLUGS].sort());
    expect(await angelegtAudits()).toHaveLength(4);
    const anzahl = (await audits()).length;
    expect((await wendeStandMarktstartAn(db)).wissenEntwuerfe).toEqual([]);
    expect(await audits()).toHaveLength(anzahl);
    expect(await merker()).toEqual(gesetzt);
  });

  it('endgültig gelöscht bleibt gelöscht: weder der nächste Bau (Migration) noch db:seed legt den Entwurf neu an', async () => {
    await wendeStandMarktstartAn(db);
    await loescheEndgueltig('friday-prayer');
    const vorher = (await angelegtAudits()).length;
    expect((await wendeStandMarktstartAn(db)).wissenEntwuerfe).toEqual([]);
    expect(await seedEntwuerfe(db as never)).toBe(0);
    expect(await slugsDa()).toEqual(SLUGS.filter((s) => s !== 'friday-prayer').sort());
    expect(await angelegtAudits()).toHaveLength(vorher);
    // Der Merker behält den gelöschten Slug
    expect((await merker()).wert).toMatchObject({ slugs: expect.arrayContaining(['friday-prayer']) });
  });

  it('über db:seed angelegt: der Seed setzt den Merker ebenso; Löschen wirkt auch für die Migration', async () => {
    expect(await seedEntwuerfe(db as never)).toBe(4);
    expect(((await merker()).wert as { slugs: string[] }).slugs.sort()).toEqual([...SLUGS].sort());
    await loescheEndgueltig('hajj-umrah');
    expect((await wendeStandMarktstartAn(db)).wissenEntwuerfe).toEqual([]);
    expect(await slugsDa()).not.toContain('hajj-umrah');
    expect(await angelegtAudits()).toEqual([]);
  });

  it('Bestand ohne Merker (vor dem Merker angelegt): Merker aus den vorhandenen Slugs, nichts neu angelegt', async () => {
    await db.insert(schema.wissenThema).values(WISSEN_ENTWUERFE.map(entwurfZeile));
    expect((await wendeStandMarktstartAn(db)).wissenEntwuerfe).toEqual([]);
    expect(((await merker()).wert as { slugs: string[] }).slugs.sort()).toEqual([...SLUGS].sort());
    await loescheEndgueltig('islamic-calendar');
    expect((await wendeStandMarktstartAn(db)).wissenEntwuerfe).toEqual([]);
    expect(await slugsDa()).not.toContain('islamic-calendar');
  });

  it('Bestand ohne Merker, vorher schon gelöscht: was die Migration laut Audit angelegt hat, gilt als angelegt', async () => {
    const [geloescht, ...rest] = WISSEN_ENTWUERFE;
    await db.insert(schema.wissenThema).values(rest.map(entwurfZeile));
    // Spur des früheren Laufs (Audit der Migration, vor dem Merker), das Thema selbst ist endgültig gelöscht
    await db.insert(schema.auditEintrag).values({
      aktion: 'inhalt.angelegt',
      zielTyp: 'wissen_thema',
      zielId: '00000000-0000-4000-8000-000000000000',
      details: { migration: MIGRATION, slug: geloescht.slug },
    });
    expect((await wendeStandMarktstartAn(db)).wissenEntwuerfe).toEqual([]);
    expect(await slugsDa()).not.toContain(geloescht.slug);
    expect(((await merker()).wert as { slugs: string[] }).slugs.sort()).toEqual([...SLUGS].sort());
  });

  it('Merker vorhanden, ein neuer Slug fehlt darin: nur dieser wird angelegt (künftige Entwürfe kommen an)', async () => {
    await db.insert(schema.einstellung).values({ schluessel: ENTWURF_MERKER, wert: { slugs: SLUGS.slice(0, 3) } });
    expect((await wendeStandMarktstartAn(db)).wissenEntwuerfe).toEqual([SLUGS[3]]);
    expect(await slugsDa()).toEqual([SLUGS[3]]);
    expect((await angelegtAudits()).map((a) => (a.details as { slug: string }).slug)).toEqual([SLUGS[3]]);
    expect(((await merker()).wert as { slugs: string[] }).slugs.sort()).toEqual([...SLUGS].sort());
  });
});
