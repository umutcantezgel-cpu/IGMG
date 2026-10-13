import { randomUUID } from 'node:crypto';
import { eq, sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { uhrzeitBerlin } from '@/lib/gebetszeiten/naechstes';
import { pruefeKette } from '@/lib/chat/hashkette';
import { verschluessele } from '@/lib/krypto';
import { darf } from '@/lib/rechte/matrix';
import { verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Gruppenchat mit Kinderschutz (S-01…S-18) gegen PGlite: Kanäle je Gruppe, Rechte je Rolle, Einwilligung und Widerruf,
 * Mindestalter, Öffnungszeiten, Stummschalten, Entfernen, Melden mit Kontext, Notfall-Pause, unveränderliches
 * Protokoll mit Hash-Kette, Löschfristen. Testdaten fiktiv (G-04).
 */
const { client, db } = await verwaltungsUmgebung();
const dienst = await import('@/lib/chat/dienst');
const { ladeGruppenKontext } = await import('@/lib/rechte/gemeinde');
afterAll(() => client.close());

async function person(name: string, art?: 'lehrkraft' | 'eltern' | 'schueler', kind = false): Promise<string> {
  const id = randomUUID();
  await db
    .insert(schema.user)
    .values({ id, name, email: `${id.slice(0, 8)}@${kind ? 'konto.invalid' : 'example.test'}`, emailVerified: true });
  await db.insert(schema.kontoProfil).values({ benutzerId: id, anzeigename: name, istKind: kind });
  if (art) await db.insert(schema.gemeindeRolle).values({ benutzerId: id, rolle: art });
  return id;
}

async function lernende(benutzerId: string | null, sechzehnAm: string): Promise<string> {
  const v = verschluessele({ name: 'Testkind' });
  const [z] = await db
    .insert(schema.lernende)
    .values({ benutzerId, datenVerschluesselt: v.daten, schluesselId: v.schluesselId, anzeigename: 'Testkind', sechzehnAm })
    .returning({ id: schema.lernende.id });
  return z.id;
}

/** Datum in Berlin, verschoben um Tage (für den Übergang nach dem 16. Geburtstag). */
function berlinerHeute(tage: number): string {
  const d = new Date(Date.now() + tage * 86_400_000);
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(d);
}

let gruppeId: string;
let kanal: { gruppe: string; eltern: string };
const ids = {} as Record<'hoca1' | 'hoca2' | 'kind' | 'kind2' | 'eltern' | 'fremd', string>;
const lern = {} as Record<'kind' | 'kind2', string>;
const k = (id: string) => ladeGruppenKontext(id);
const lage = async (art: 'gruppe' | 'eltern') => (await dienst.ladeKanal(kanal[art]))!;

beforeAll(async () => {
  const [g] = await db
    .insert(schema.gruppe)
    .values({ name: { de: 'Elifbe Gruppe A' }, chatModus: 'offen', chatVon: '00:00', chatBis: '23:59', chatMindestalter: 10 })
    .returning({ id: schema.gruppe.id });
  gruppeId = g.id;
  ids.hoca1 = await person('Hoca Eins', 'lehrkraft');
  ids.hoca2 = await person('Aufsicht Zwei', 'lehrkraft');
  ids.kind = await person('Ali Kaya', 'schueler', true);
  ids.kind2 = await person('Zeynep Demir', 'schueler', true);
  ids.eltern = await person('Mutter Kaya', 'eltern');
  ids.fremd = await person('Fremde Person', 'eltern');
  await db.insert(schema.gruppenLeitung).values([
    { gruppeId, benutzerId: ids.hoca1, rolle: 'lehrkraft' },
    { gruppeId, benutzerId: ids.hoca2, rolle: 'aufsicht' },
  ]);
  lern.kind = await lernende(ids.kind, '2030-03-01'); // 12 Jahre
  lern.kind2 = await lernende(ids.kind2, '2033-03-01'); // 9 Jahre
  await db.insert(schema.gruppenMitglied).values([
    { gruppeId, lernendeId: lern.kind },
    { gruppeId, lernendeId: lern.kind2 },
  ]);
  await db.insert(schema.elternKind).values({ elternId: ids.eltern, lernendeId: lern.kind });
  await db.insert(schema.kontoEinwilligung).values([
    { lernendeId: lern.kind, art: 'gruppenchat', textVersion: 'v1', erteiltVon: ids.eltern, einvernehmenBestaetigt: true },
    { lernendeId: lern.kind2, art: 'gruppenchat', textVersion: 'v1', erteiltVon: ids.eltern, einvernehmenBestaetigt: true },
  ]);
  kanal = await dienst.kanaeleDerGruppe(gruppeId);
  for (const id of Object.values(ids)) await dienst.bestaetigeRegeln(id);
});

describe('Kanäle und Rechte (S-01, S-02, S-11)', () => {
  it('genau ein Gruppen- und ein Elternkanal je Gruppe', async () => {
    const nochmal = await dienst.kanaeleDerGruppe(gruppeId);
    expect(nochmal).toEqual(kanal);
    expect(await db.select().from(schema.chatKanal).where(eq(schema.chatKanal.gruppeId, gruppeId))).toHaveLength(2);
  });

  it('Kind schreibt in den Gruppenkanal, liest den Elternkanal nicht; Eltern umgekehrt; Fremde nichts', async () => {
    const gesendet = await dienst.sendeNachricht(await lage('gruppe'), await k(ids.kind), 'Selam! https://example.org');
    expect(gesendet.ok).toBe(true);
    expect(await dienst.ladeNachrichten(await lage('eltern'), await k(ids.kind))).toBeNull();
    expect(await dienst.ladeNachrichten(await lage('gruppe'), await k(ids.eltern))).toBeNull();
    expect((await dienst.sendeNachricht(await lage('eltern'), await k(ids.eltern), 'Frage zum Termin')).ok).toBe(true);
    expect(await dienst.ladeNachrichten(await lage('gruppe'), await k(ids.fremd))).toBeNull();
    expect((await dienst.sendeNachricht(await lage('gruppe'), await k(ids.fremd), 'Hallo')).ok).toBe(false);
  });

  it('Abruf: Text entschlüsselt, Name Vorname + Initial, keine Lesebestätigung', async () => {
    const r = (await dienst.ladeNachrichten(await lage('gruppe'), await k(ids.hoca1)))!;
    expect(r.nachrichten[0]).toMatchObject({ name: 'Ali K.', text: 'Selam! https://example.org', eigen: false });
    expect(Object.keys(r.nachrichten[0])).not.toContain('gelesen');
    const nachher = (await dienst.ladeNachrichten(await lage('gruppe'), await k(ids.hoca1), r.nachrichten[0].id))!;
    expect(nachher.nachrichten).toHaveLength(0);
  });

  it('Text liegt nur verschlüsselt in der Datenbank (S-16)', async () => {
    const zeilen = await db.select().from(schema.chatNachricht);
    for (const z of zeilen) expect(Buffer.from(z.textVerschluesselt).toString('utf8')).not.toContain('Selam');
  });

  it('Administration hat kein Leserecht auf Chats und Meldungen (NIE_PER_ADMINISTRATION)', () => {
    const admin = [{ rolle: 'administration' as const, organisation: null }];
    expect(darf(admin, 'meldung.chat.lesen')).toBe(false);
    expect(darf(admin, 'moderationsprotokoll.lesen')).toBe(false);
    expect(darf([{ rolle: 'kinderschutz' as const, organisation: null }], 'meldung.chat.lesen')).toBe(true);
  });

  it('S-02: mit nur einer erwachsenen Leitung ist der Kanal zu', async () => {
    await db.delete(schema.gruppenLeitung).where(eq(schema.gruppenLeitung.benutzerId, ids.hoca2));
    expect(await dienst.schreibLage(await lage('gruppe'), await k(ids.kind))).toBe('zuWenigeErwachsene');
    await db.insert(schema.gruppenLeitung).values({ gruppeId, benutzerId: ids.hoca2, rolle: 'aufsicht' });
  });
});

describe('Kinder: Einwilligung, Alter, Regeln, Zeiten (S-03…S-06, S-13, S-15)', () => {
  it('S-04: unter dem Mindestalter nur lesen', async () => {
    expect(await dienst.schreibLage(await lage('gruppe'), await k(ids.kind2))).toBe('zuJung');
    expect(await dienst.ladeNachrichten(await lage('gruppe'), await k(ids.kind2))).not.toBeNull();
  });

  it('S-03: Widerruf der Elterneinwilligung wirkt sofort', async () => {
    await db.update(schema.kontoEinwilligung).set({ widerrufenAm: new Date() }).where(eq(schema.kontoEinwilligung.lernendeId, lern.kind));
    expect((await dienst.sendeNachricht(await lage('gruppe'), await k(ids.kind), 'Noch da?')).ok).toBe(false);
    expect(await dienst.schreibLage(await lage('gruppe'), await k(ids.kind))).toBe('einwilligungFehlt');
    // D-01: auch Lesen endet sofort – nur der Grund kommt zurück
    expect(await dienst.ladeNachrichten(await lage('gruppe'), await k(ids.kind))).toMatchObject({
      nachrichten: [],
      schreiben: 'einwilligungFehlt',
    });
    await db
      .insert(schema.kontoEinwilligung)
      .values({ lernendeId: lern.kind, art: 'gruppenchat', textVersion: 'v1', erteiltVon: ids.eltern });
  });

  it('D-11: ab 16 und nach 30 Tagen Übergang zählt nur die eigene Einwilligung', async () => {
    await db.update(schema.lernende).set({ sechzehnAm: '2026-01-01' }).where(eq(schema.lernende.id, lern.kind));
    expect(await dienst.schreibLage(await lage('gruppe'), await k(ids.kind))).toBe('einwilligungFehlt');
    const [eigene] = await db
      .insert(schema.kontoEinwilligung)
      .values({ lernendeId: lern.kind, art: 'gruppenchat', textVersion: 'v1', erteiltVon: ids.kind })
      .returning({ id: schema.kontoEinwilligung.id });
    expect(await dienst.schreibLage(await lage('gruppe'), await k(ids.kind))).toBe('ok');
    await db.delete(schema.kontoEinwilligung).where(eq(schema.kontoEinwilligung.id, eigene.id));
    // Im Übergang (weniger als 30 Tage nach dem 16. Geburtstag) gilt die Elterneinwilligung noch
    await db
      .update(schema.lernende)
      .set({ sechzehnAm: berlinerHeute(-10) })
      .where(eq(schema.lernende.id, lern.kind));
    expect(await dienst.schreibLage(await lage('gruppe'), await k(ids.kind))).toBe('ok');
    await db.update(schema.lernende).set({ sechzehnAm: '2030-03-01' }).where(eq(schema.lernende.id, lern.kind));
  });

  it('S-15: ohne bestätigte Regeln kein Schreiben', async () => {
    await db.delete(schema.chatRegelnBestaetigt).where(eq(schema.chatRegelnBestaetigt.benutzerId, ids.kind));
    expect(await dienst.schreibLage(await lage('gruppe'), await k(ids.kind))).toBe('regelnFehlen');
    await dienst.bestaetigeRegeln(ids.kind);
  });

  it('S-06: außerhalb der Öffnungszeiten nur lesen – Leitung darf schreiben', async () => {
    const jetzt = uhrzeitBerlin(new Date());
    const [h] = jetzt.split(':').map(Number);
    const von = `${String((h + 2) % 24).padStart(2, '0')}:00`;
    const bis = `${String((h + 3) % 24).padStart(2, '0')}:00`;
    await db.update(schema.gruppe).set({ chatVon: von, chatBis: bis }).where(eq(schema.gruppe.id, gruppeId));
    expect(await dienst.schreibLage(await lage('gruppe'), await k(ids.kind))).toBe('geschlossen');
    expect(await dienst.schreibLage(await lage('gruppe'), await k(ids.hoca1))).toBe('ok');
    await db.update(schema.gruppe).set({ chatVon: '00:00', chatBis: '23:59' }).where(eq(schema.gruppe.id, gruppeId));
  });

  it('S-05: zu lang oder leer wird abgewiesen', async () => {
    expect(await dienst.sendeNachricht(await lage('gruppe'), await k(ids.kind), 'x'.repeat(501))).toEqual({ ok: false, grund: 'zuLang' });
    expect(await dienst.sendeNachricht(await lage('gruppe'), await k(ids.kind), '   ')).toEqual({ ok: false, grund: 'leer' });
  });

  it('S-13: höchstens 10 Nachrichten je Minute', async () => {
    const kanalLage = await lage('gruppe');
    const kontext = await k(ids.hoca2);
    const ergebnisse = [];
    for (let i = 0; i < 11; i++) ergebnisse.push(await dienst.sendeNachricht(kanalLage, kontext, `Nachricht ${i}`));
    expect(ergebnisse.filter((e) => e.ok)).toHaveLength(10);
    expect(ergebnisse.at(-1)).toEqual({ ok: false, grund: 'rate' });
  });
});

describe('Moderation und Meldung (S-07…S-11, S-17)', () => {
  let nachrichtId: number;

  it('S-09: Stummschalten nur durch Leitung, mit Grund', async () => {
    const kanalLage = await lage('gruppe');
    expect(await dienst.stummschalten(await k(ids.kind), kanalLage, ids.kind2, 30, 'Test')).toBe('keinRecht');
    expect(await dienst.stummschalten(await k(ids.hoca1), kanalLage, ids.kind, 30, '')).toBe('grundFehlt');
    expect(await dienst.stummschalten(await k(ids.hoca1), kanalLage, ids.kind, 30, 'Bitte kurz Pause')).toBeNull();
    expect(await dienst.schreibLage(kanalLage, await k(ids.kind))).toBe('stumm');
    expect(await dienst.stummschalten(await k(ids.hoca1), kanalLage, ids.kind, 0, 'Pause vorbei')).toBeNull();
    expect(await dienst.schreibLage(kanalLage, await k(ids.kind))).toBe('ok');
  });

  it('S-07/S-08: Melden sichert ±10 Nachrichten verschlüsselt', async () => {
    const r = await dienst.sendeNachricht(await lage('gruppe'), await k(ids.kind), 'Eine unfreundliche Nachricht');
    expect(r.ok).toBe(true);
    nachrichtId = (r as { id: number }).id;
    const m = await dienst.meldeNachricht(await k(ids.kind2), nachrichtId, 'beleidigung', 'War gemein');
    expect(m.ok).toBe(true);
    const [zeile] = await db.select().from(schema.chatMeldung);
    expect(Buffer.from(zeile.kontextVerschluesselt).toString('utf8')).not.toContain('unfreundliche');
    const fremd = await dienst.meldeNachricht(await k(ids.fremd), nachrichtId, 'spam', null);
    expect(fremd.ok).toBe(false);
  });

  it('S-11: Kontext lesen protokolliert die Einsicht', async () => {
    const [m] = await db.select({ id: schema.chatMeldung.id }).from(schema.chatMeldung);
    const kontext = (await dienst.meldungsKontext(m.id, ids.hoca1))!;
    expect(kontext.kontext.find((z) => z.gemeldet)?.text).toBe('Eine unfreundliche Nachricht');
    expect(kontext.freitext).toBe('War gemein');
    const protokoll = await db
      .select()
      .from(schema.moderationsprotokoll)
      .where(eq(schema.moderationsprotokoll.aktion, 'kontext_eingesehen'));
    expect(protokoll).toHaveLength(1);
  });

  it('S-09: Entfernen hinterlässt Platzhalter', async () => {
    expect(await dienst.entferneNachricht(await k(ids.kind2), nachrichtId, 'nicht erlaubt')).toBe('keinRecht');
    expect(await dienst.entferneNachricht(await k(ids.hoca1), nachrichtId, 'Beleidigung entfernt')).toBeNull();
    const r = (await dienst.ladeNachrichten(await lage('gruppe'), await k(ids.kind)))!;
    expect(r.nachrichten.find((n) => n.id === nachrichtId)?.text).toBeNull();
  });

  it('S-17: Notfall-Pause sperrt alle Kanäle sofort, auch für die Leitung', async () => {
    expect(await dienst.setzeNotfallpause(ids.hoca1, true, 'Vorfall wird geprüft')).toBeNull();
    expect(await dienst.schreibLage(await lage('gruppe'), await k(ids.hoca1))).toBe('notfallpause');
    // Kinder sehen in der Pause nichts, die Leitung liest weiter (Aufarbeitung)
    expect((await dienst.ladeNachrichten(await lage('gruppe'), await k(ids.kind)))?.nachrichten).toEqual([]);
    expect((await dienst.ladeNachrichten(await lage('gruppe'), await k(ids.hoca1)))?.nachrichten.length).toBeGreaterThan(0);
    expect(await dienst.setzeNotfallpause(ids.hoca1, false, 'Geprüft, alles in Ordnung')).toBeNull();
    expect(await dienst.schreibLage(await lage('gruppe'), await k(ids.kind))).toBe('ok');
  });

  it('S-10: Protokoll unveränderlich (Trigger) und Kette intakt', async () => {
    await expect(db.execute(sql`update moderationsprotokoll set grund = 'geändert'`)).rejects.toThrow();
    await expect(db.execute(sql`delete from moderationsprotokoll`)).rejects.toThrow();
    const zeilen = await db.select().from(schema.moderationsprotokoll).orderBy(schema.moderationsprotokoll.id);
    expect(zeilen.length).toBeGreaterThanOrEqual(6);
    expect(
      pruefeKette(
        zeilen.map((z) => ({
          zeitpunkt: z.zeitpunkt.toISOString(),
          kanalId: z.kanalId,
          nachrichtId: z.nachrichtId,
          akteurId: z.akteurId,
          aktion: z.aktion,
          grund: z.grund,
          vorgaengerHash: z.vorgaengerHash,
          hash: z.hash,
        })),
      ),
    ).toBeNull();
  });
});

describe('Meldung gegen die Leitung, Kinderschutz, Mitglied entfernen (D-02, S-09)', () => {
  it('die gemeldete Lehrkraft bekommt keine Hinweis-Mail; Kinderschutz kann entfernen und pausieren', async () => {
    const r = await dienst.sendeNachricht(await lage('gruppe'), await k(ids.hoca1), 'Nachricht der Lehrkraft');
    const id = (r as { id: number }).id;
    const m = await dienst.meldeNachricht(await k(ids.kind), id, 'unangemessen', null);
    expect(m.ok && m.absenderId).toBe(ids.hoca1);
    const adressen = await dienst.leitungsAdressen(gruppeId, ids.hoca1);
    expect(adressen).toHaveLength(1);
    expect(await dienst.entferneAlsKinderschutz('kinderschutz-person', id, 'Prüfung durch Kinderschutz')).toBeNull();
    const [z] = await db.select().from(schema.chatNachricht).where(eq(schema.chatNachricht.id, id));
    expect(z.entferntAm).not.toBeNull();
    expect(await dienst.pausiereAlsKinderschutz('kinderschutz-person', kanal.gruppe, true, 'Prüfung läuft')).toBeNull();
    expect(await dienst.schreibLage(await lage('gruppe'), await k(ids.kind))).toBe('pausiert');
    expect(await dienst.pausiereAlsKinderschutz('kinderschutz-person', kanal.gruppe, false, 'Prüfung beendet')).toBeNull();
  });

  it('Mitglied entfernen beendet den Zugang sofort (nur Leitung, mit Grund)', async () => {
    expect(await dienst.entferneMitglied(await k(ids.kind), gruppeId, lern.kind2, 'kein Recht')).toBe('keinRecht');
    expect(await dienst.entferneMitglied(await k(ids.hoca1), gruppeId, lern.kind2, 'Gruppe gewechselt')).toBeNull();
    expect(await dienst.ladeNachrichten(await lage('gruppe'), await k(ids.kind2))).toBeNull();
  });
});

describe('Löschfristen (S-12)', () => {
  it('Nachrichten nach 90 Tagen und 30 Tage nach Gruppenende', async () => {
    const v = verschluessele('alt');
    await db.insert(schema.chatNachricht).values({
      kanalId: kanal.gruppe,
      absenderId: ids.hoca1,
      textVerschluesselt: v.daten,
      schluesselId: v.schluesselId,
      erstelltAm: new Date(Date.now() - 91 * 86_400_000),
    });
    const vorher = (await db.select().from(schema.chatNachricht)).length;
    const r = await dienst.chatLoeschlauf();
    expect(r.nachrichten).toBe(1);
    expect((await db.select().from(schema.chatNachricht)).length).toBe(vorher - 1);
    await db.update(schema.gruppe).set({ ende: '2026-01-01' }).where(eq(schema.gruppe.id, gruppeId));
    expect((await dienst.chatLoeschlauf()).nachrichten).toBe(vorher - 1);
  });
});
