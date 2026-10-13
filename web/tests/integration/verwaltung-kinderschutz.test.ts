import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { verschluessele } from '@/lib/krypto';
import { angemeldetAls, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Verwaltung › Meldungen & Kinderschutz (S-08, S-09, S-11, S-17, ADR 0026): nur Rolle kinderschutz, nie Administration;
 * Pflichtgrund; Kontext nur auf Abruf und protokolliert; Notfall-Pause; Status; Kanal pausieren. Testdaten fiktiv.
 */
const { client, db } = await verwaltungsUmgebung();
const aktionen = await import('@/server/actions/kinderschutz');
const abfragen = await import('@/server/queries/verwaltung/kinderschutz');
afterAll(() => client.close());

const [g] = await db
  .insert(schema.gruppe)
  .values({ name: { de: '[Gruppe A]', tr: '[Grup A]', en: '[Group A]' }, chatModus: 'offen' })
  .returning({ id: schema.gruppe.id });
const [k] = await db.insert(schema.chatKanal).values({ gruppeId: g.id, art: 'gruppe' }).returning({ id: schema.chatKanal.id });
const kontext = verschluessele([{ id: 1, absenderId: null, text: '[Testnachricht]', zeit: '2026-10-12T10:00:00.000Z', gemeldet: true }]);
const [m] = await db
  .insert(schema.chatMeldung)
  .values({ kanalId: k.id, nachrichtId: 1, grund: 'beleidigung', kontextVerschluesselt: kontext.daten, schluesselId: kontext.schluesselId })
  .returning({ id: schema.chatMeldung.id });

const protokoll = async () => (await db.select().from(schema.moderationsprotokoll)).map((z) => z.aktion);

describe('Kinderschutz-Modul', () => {
  it('Administration, Redaktion und Bildung: kein Zugriff auf Meldungen und Kontext (ADR 0026); Notfall-Pause nur mit eigenem Recht', async () => {
    for (const rolle of ['administration', 'redaktion', 'bildung'] as const) {
      await angemeldetAls([{ rolle }]);
      expect(await aktionen.meldungsKontextLaden(m.id)).toEqual({ fehler: 'keinRecht' });
      expect(await aktionen.meldungStatusSetzen({}, formular({ id: m.id, status: 'erledigt', grund: 'Test Grund' }))).toEqual({
        fehler: 'keinRecht',
      });
      expect(await aktionen.kanalPauseSetzen({}, formular({ kanalId: k.id, pause: '1', grund: 'Test Grund' }))).toEqual({
        fehler: 'keinRecht',
      });
      // S-17: Die Notfall-Pause (ohne Einsicht in Inhalte) darf auch die Administration schalten
      if (rolle !== 'administration')
        expect(await aktionen.notfallpauseSetzen({}, formular({ an: '1', grund: 'Test Grund' }))).toEqual({ fehler: 'keinRecht' });
    }
    expect(await protokoll()).toEqual([]);
  });

  it('ohne zweiten Faktor kein Zugriff, auch nicht für kinderschutz', async () => {
    await angemeldetAls([{ rolle: 'kinderschutz' }], false);
    expect(await aktionen.meldungsKontextLaden(m.id)).toEqual({ fehler: 'keinRecht' });
  });

  it('Lage und Liste ohne Inhalte; Kontext erst auf Abruf und mit Protokolleintrag', async () => {
    await angemeldetAls([{ rolle: 'kinderschutz' }]);
    const lage = await abfragen.ladeKinderschutzLage();
    expect(lage).toMatchObject({ notfallpause: false, offen: 1, ketteIntakt: true, eintraege: 0 });
    const liste = await abfragen.ladeMeldungen({ status: 'offen_alle' });
    expect(liste).toHaveLength(1);
    expect(JSON.stringify(liste)).not.toContain('Testnachricht');
    expect(liste[0]).toMatchObject({ grund: 'beleidigung', kanalArt: 'gruppe', gruppe: '[Gruppe A]' });

    const k1 = await aktionen.meldungsKontextLaden(m.id);
    expect(k1).toMatchObject({ ok: true, kontext: [{ text: '[Testnachricht]', gemeldet: true }] });
    expect(await protokoll()).toEqual(['kontext_eingesehen']);
  });

  it('Pflichtgrund; Status, Kanal-Pause und Notfall-Pause werden protokolliert, die Kette bleibt intakt', async () => {
    await angemeldetAls([{ rolle: 'kinderschutz' }]);
    expect(await aktionen.meldungStatusSetzen({}, formular({ id: m.id, status: 'in_bearbeitung', grund: 'x' }))).toEqual({
      fehler: 'grundFehlt',
    });
    expect(await aktionen.meldungStatusSetzen({}, formular({ id: m.id, status: 'in_bearbeitung', grund: 'Prüfung begonnen' }))).toEqual({
      gespeichert: true,
    });
    expect(await aktionen.kanalPauseSetzen({}, formular({ kanalId: k.id, pause: '1', grund: 'Bis zur Klärung' }))).toEqual({
      gespeichert: true,
    });
    const [kanal] = await db.select().from(schema.chatKanal).where(eq(schema.chatKanal.id, k.id));
    expect(kanal.status).toBe('pausiert');
    expect(await aktionen.notfallpauseSetzen({}, formular({ an: '1', grund: 'Übung Notfall' }))).toEqual({ gespeichert: true });
    const lage = await abfragen.ladeKinderschutzLage();
    expect(lage).toMatchObject({ notfallpause: true, offen: 0, inBearbeitung: 1, ketteIntakt: true });
    expect(await protokoll()).toEqual(['kontext_eingesehen', 'meldung_bearbeitet', 'pausiert', 'notfallpause']);
    const eintraege = await abfragen.ladeProtokoll();
    expect(eintraege[0]).toMatchObject({ aktion: 'notfallpause', grund: 'Übung Notfall', akteur: 'Testperson Eins' });
    expect(eintraege.find((e) => e.aktion === 'pausiert')).toMatchObject({ gruppe: '[Gruppe A]', kanalArt: 'gruppe' });
    expect(await abfragen.zaehleOffeneMeldungen()).toBe(0);
  });
});
