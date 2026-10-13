import { randomUUID } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { afterAll, afterEach, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { verschluessele } from '@/lib/krypto';
import type { RollenZuweisung } from '@/lib/rechte/matrix';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Verwaltung „Gruppen, Lernende, Lehrplan“ (H-L01…L03, ADR 0026): Gruppe anlegen und ändern (Validierung S-04/S-06),
 * Leitung nur mit Kontoart Lehrkraft, zwei Erwachsene für den Chat (S-02, erzwungen im Chat-Dienst), Terminserie
 * (idempotent), Mitglieder, Austritt mit Löschfrist (DSFA D-10), Lehrplan anlegen/sortieren/umbenennen, Rechte und
 * Funktionsschalter. Testdaten fiktiv (G-04).
 */
const { client, db } = await verwaltungsUmgebung();
const gruppen = await import('@/server/actions/gruppen');
const lehrplan = await import('@/server/actions/lehrplan');
const lernende = await import('@/server/actions/lernende');
const { ladeGruppe, ladeGruppenListe } = await import('@/server/queries/verwaltung/gruppen');
const { ladeLernendeListe, ladeLernendeDetail } = await import('@/server/queries/verwaltung/lernende');
const chat = await import('@/lib/chat/dienst');
afterAll(() => client.close());
afterEach(() => {
  delete process.env.FUNKTION_LERNPLATTFORM;
});

const BILDUNG: RollenZuweisung[] = [{ rolle: 'bildung' }];
const alsBildung = () => angemeldetAls(BILDUNG);

/** Ziel einer redirect()-Ausnahme. */
async function ziel(aufruf: Promise<unknown>): Promise<string> {
  const e: unknown = await aufruf.then(
    () => null,
    (x: unknown) => x,
  );
  return (e as { ziel?: string } | null)?.ziel ?? `kein redirect: ${String(e)}`;
}

const gueltig = {
  nameDe: 'Elifbe Mittwoch [Testgruppe]',
  chatModus: 'offen',
  chatMindestalter: '10',
  chatVon: '15:00',
  chatBis: '19:00',
  status: 'aktiv',
  wochentage: ['3'],
  uhrzeitVon: '16:00',
  uhrzeitBis: '17:30',
  kursart: 'elifbe',
};

async function gruppeAnlegen(werte: Record<string, string | string[]> = gueltig): Promise<string> {
  const z = await ziel(gruppen.speichereGruppe({}, formular(werte)));
  const m = /^\/verwaltung\/gruppen\/([0-9a-f-]{36})\?meldung=angelegt$/.exec(z);
  expect(m, z).not.toBeNull();
  return m![1];
}

async function person(name: string, rolle?: 'lehrkraft' | 'eltern'): Promise<string> {
  const id = randomUUID();
  await db.insert(schema.user).values({ id, name, email: `${id.slice(0, 8)}@example.test`, emailVerified: true, twoFactorEnabled: true });
  await db.insert(schema.kontoProfil).values({ benutzerId: id, anzeigename: name });
  if (rolle) await db.insert(schema.gemeindeRolle).values({ benutzerId: id, rolle });
  return id;
}

async function lernendeAnlegen(name: string, sechzehnAm: string | null = '2031-01-01'): Promise<string> {
  const v = verschluessele({ vorname: name, nachname: 'Beispiel', geburtsdatum: null });
  const [l] = await db
    .insert(schema.lernende)
    .values({ datenVerschluesselt: v.daten, schluesselId: v.schluesselId, anzeigename: `${name} B.`, sechzehnAm })
    .returning({ id: schema.lernende.id });
  return l.id;
}

const audit = async (aktion: string) => db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, aktion));

describe('Gruppe anlegen und ändern', () => {
  it('legt an (Audit, Standardwerte), validiert Mindestalter, Chatfenster und Zeiten', async () => {
    await alsBildung();
    const id = await gruppeAnlegen();
    const [g] = await db.select().from(schema.gruppe).where(eq(schema.gruppe.id, id));
    expect(g).toMatchObject({
      kursart: 'elifbe',
      wochentage: [3],
      chatMindestalter: 10,
      chatVon: '15:00',
      chatBis: '19:00',
      status: 'aktiv',
    });
    expect((await audit('gruppe.angelegt')).map((a) => a.zielId)).toContain(id);

    const fehler = await gruppen.speichereGruppe(
      {},
      formular({ ...gueltig, chatMindestalter: '8', chatBis: '21:00', uhrzeitBis: '15:00' }),
    );
    expect(fehler).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { chatMindestalter: 'mindestalter', chatBis: 'chatFenster', uhrzeitBis: 'bisVorVon' },
    });
    const ungueltigerKurs = await gruppen.speichereGruppe({}, formular({ ...gueltig, kursId: randomUUID() }));
    expect(ungueltigerKurs).toMatchObject({ fehler: 'pruefen', feldFehler: { kursId: 'ungueltig' } });
  });

  it('ändert eine vorhandene Gruppe (gespeichert, Seite neu gerendert)', async () => {
    await alsBildung();
    const id = await gruppeAnlegen();
    const r = await gruppen.speichereGruppe(
      {},
      formular({ ...gueltig, id, nameDe: 'Elifbe Samstag [Testgruppe]', wochentage: ['6', '0'], ort: '[Raum 2]' }),
    );
    expect(r.gespeichert).toBeTypeOf('number');
    expect(aufrufe.refresh).toBe(1);
    const g = await ladeGruppe(id);
    expect(g).toMatchObject({ name: { de: 'Elifbe Samstag [Testgruppe]' }, wochentage: [0, 6], ort: '[Raum 2]' });
    expect((await audit('gruppe.geaendert')).map((a) => a.zielId)).toContain(id);
  });
});

describe('Leitung, S-02 und Termine', () => {
  it('Leitung nur mit Kontoart Lehrkraft; der Chat-Dienst zählt die Erwachsenen (S-02)', async () => {
    await alsBildung();
    const id = await gruppeAnlegen();
    const eltern = await person('Testperson Eltern', 'eltern');
    const hoca1 = await person('Testperson Hoca', 'lehrkraft');
    const hoca2 = await person('Testperson Aufsicht', 'lehrkraft');

    expect(await ziel(gruppen.leitungZuweisen(formular({ gruppeId: id, benutzerId: eltern, rolle: 'lehrkraft' })))).toBe(
      `/verwaltung/gruppen/${id}?fehler=keineLehrkraft#leitung`,
    );
    expect(await ziel(gruppen.leitungZuweisen(formular({ gruppeId: id, benutzerId: hoca1, rolle: 'lehrkraft' })))).toBe(
      `/verwaltung/gruppen/${id}?meldung=leitung#leitung`,
    );
    const kanal = (await chat.kanaeleDerGruppe(id)).gruppe;
    expect((await chat.ladeKanal(kanal))?.erwachsene).toBe(1);
    // Mit einer erwachsenen Person darf im Kanal niemand schreiben (auch nicht die Leitung)
    const { ladeGruppenKontext } = await import('@/lib/rechte/gemeinde');
    expect(await chat.schreibLage((await chat.ladeKanal(kanal))!, await ladeGruppenKontext(hoca1))).toBe('zuWenigeErwachsene');

    await ziel(gruppen.leitungZuweisen(formular({ gruppeId: id, benutzerId: hoca2, rolle: 'aufsicht' })));
    expect((await chat.ladeKanal(kanal))?.erwachsene).toBe(2);
    expect((await ladeGruppenListe()).find((g) => g.id === id)?.leitung).toBe(2);
    const [z] = await db
      .select()
      .from(schema.gruppenLeitung)
      .where(and(eq(schema.gruppenLeitung.gruppeId, id), eq(schema.gruppenLeitung.benutzerId, hoca2)));
    expect(z.rolle).toBe('aufsicht');

    await ziel(gruppen.leitungEntfernen(formular({ gruppeId: id, benutzerId: hoca2 })));
    expect((await chat.ladeKanal(kanal))?.erwachsene).toBe(1);
    expect((await audit('gruppe.leitung')).filter((a) => a.zielId === id)).toHaveLength(3);
  });

  it('Terminserie: Wochentage der Gruppe im Zeitraum, idempotent, Zeitraum höchstens ein Jahr', async () => {
    await alsBildung();
    const id = await gruppeAnlegen();
    // Mittwoche zwischen 14.10. und 11.11.2026: 14., 21., 28.10., 4., 11.11.
    expect(await ziel(gruppen.termineAnlegen(formular({ gruppeId: id, von: '2026-10-13', bis: '2026-11-11' })))).toBe(
      `/verwaltung/gruppen/${id}?meldung=termine&anzahl=5#termine`,
    );
    const termine = await db.select().from(schema.unterrichtstermin).where(eq(schema.unterrichtstermin.gruppeId, id));
    expect(termine.map((t) => t.datum).sort()).toEqual(['2026-10-14', '2026-10-21', '2026-10-28', '2026-11-04', '2026-11-11']);
    expect(termine.every((t) => t.beginn === '16:00' && t.ende === '17:30')).toBe(true);
    expect(await ziel(gruppen.termineAnlegen(formular({ gruppeId: id, von: '2026-10-13', bis: '2026-11-11' })))).toContain('anzahl=0');
    expect(await ziel(gruppen.termineAnlegen(formular({ gruppeId: id, von: '2026-10-13', bis: '2027-12-01' })))).toBe(
      `/verwaltung/gruppen/${id}?fehler=zeitraumZuLang#termine`,
    );
    expect(await ziel(gruppen.termineAnlegen(formular({ gruppeId: id, von: '2026-10-13', bis: '2026-10-01' })))).toBe(
      `/verwaltung/gruppen/${id}?fehler=zeitraum#termine`,
    );
    expect((await audit('gruppe.termine')).filter((a) => a.zielId === id)).toHaveLength(2);
  });
});

describe('Mitglieder und Lernende', () => {
  it('zuordnen, beenden (bleibt in der Historie), wieder zuordnen; Rücksprung zur Lernenden', async () => {
    await alsBildung();
    const id = await gruppeAnlegen();
    const l = await lernendeAnlegen('Testkind');
    expect(await ziel(gruppen.mitgliedHinzufuegen(formular({ gruppeId: id, lernendeId: l })))).toBe(
      `/verwaltung/gruppen/${id}?meldung=mitglied#mitglieder`,
    );
    expect((await ladeGruppe(id))?.mitglieder.map((m) => m.anzeigename)).toEqual(['Testkind B.']);
    expect(await ziel(gruppen.mitgliedEntfernen(formular({ gruppeId: id, lernendeId: l, zurueck: 'lernende' })))).toBe(
      `/verwaltung/lernende/${l}?meldung=mitgliedEntfernt#gruppen`,
    );
    expect((await ladeGruppe(id))?.mitglieder).toEqual([]);
    const [m] = await db.select().from(schema.gruppenMitglied).where(eq(schema.gruppenMitglied.lernendeId, l));
    expect(m.bis).not.toBeNull();
    await ziel(gruppen.mitgliedHinzufuegen(formular({ gruppeId: id, lernendeId: l })));
    expect((await ladeGruppe(id))?.mitglieder).toHaveLength(1);
  });

  it('Liste nur mit Anzeigename; Detail entschlüsselt und protokolliert', async () => {
    const leser = await alsBildung();
    const l = await lernendeAnlegen('Testkind Liste');
    const liste = await ladeLernendeListe({ status: 'aktiv' });
    const zeile = liste.find((z) => z.id === l)!;
    expect(Object.keys(zeile).sort()).toEqual(['anzeigename', 'aufgenommenAm', 'eltern', 'gruppen', 'id', 'konto', 'sechzehnAm', 'status']);
    const detail = await ladeLernendeDetail(l, { benutzerId: leser!, name: 'x', email: 'x', rollen: BILDUNG, zweiFaktorErfuellt: true });
    expect(detail?.daten).toMatchObject({ vorname: 'Testkind Liste', nachname: 'Beispiel' });
    const gelesen = await audit('lernende.gelesen');
    expect(gelesen.find((a) => a.zielId === l)).toMatchObject({ benutzerId: leser, details: null });
  });

  it('Austritt beendet Gruppen und setzt die Löschfrist (12 Monate); Wiederaufnahme hebt sie auf', async () => {
    await alsBildung();
    const id = await gruppeAnlegen();
    const l = await lernendeAnlegen('Testkind Austritt');
    await ziel(gruppen.mitgliedHinzufuegen(formular({ gruppeId: id, lernendeId: l })));
    expect(await ziel(lernende.setzeLernendeStatus(formular({ id: l, status: 'beendet' })))).toBe(
      `/verwaltung/lernende/${l}?meldung=status`,
    );
    const [x] = await db.select().from(schema.lernende).where(eq(schema.lernende.id, l));
    expect(x.status).toBe('beendet');
    const tage = (x.loeschenAb!.getTime() - Date.now()) / 86_400_000;
    expect(tage).toBeGreaterThan(360);
    expect(tage).toBeLessThan(370);
    expect((await ladeGruppe(id))?.mitglieder).toEqual([]);
    await ziel(lernende.setzeLernendeStatus(formular({ id: l, status: 'aktiv' })));
    const [y] = await db.select().from(schema.lernende).where(eq(schema.lernende.id, l));
    expect(y).toMatchObject({ status: 'aktiv', loeschenAb: null });
  });
});

describe('Lehrplan', () => {
  it('anlegen (am Ende), sortieren (Tausch), umbenennen (de/tr), Fehler bei leerem Titel', async () => {
    await alsBildung();
    expect(await ziel(lehrplan.stufeAnlegen(formular({ kursart: 'tecvid', titelDe: 'Stufe A [Bezeichnung]' })))).toMatch(
      /^\/verwaltung\/lehrplan\?meldung=angelegt&stufe=[0-9a-f-]{36}#kursart-tecvid$/,
    );
    await ziel(lehrplan.stufeAnlegen(formular({ kursart: 'tecvid', titelDe: 'Stufe B [Bezeichnung]', titelTr: 'Seviye B [Ad]' })));
    const stufen = () =>
      db.select().from(schema.lehrplanStufe).where(eq(schema.lehrplanStufe.kursart, 'tecvid')).orderBy(schema.lehrplanStufe.reihenfolge);
    let s = await stufen();
    expect(s.map((x) => [x.reihenfolge, x.titel.de])).toEqual([
      [1, 'Stufe A [Bezeichnung]'],
      [2, 'Stufe B [Bezeichnung]'],
    ]);
    expect(s[1].titel).toEqual({ de: 'Stufe B [Bezeichnung]', tr: 'Seviye B [Ad]' });

    await ziel(lehrplan.stufeVerschieben(formular({ id: s[1].id, richtung: 'hoch' })));
    s = await stufen();
    expect(s.map((x) => x.titel.de)).toEqual(['Stufe B [Bezeichnung]', 'Stufe A [Bezeichnung]']);
    // Am Rand bleibt alles, wie es ist
    await ziel(lehrplan.stufeVerschieben(formular({ id: s[0].id, richtung: 'hoch' })));
    expect((await stufen()).map((x) => x.titel.de)).toEqual(['Stufe B [Bezeichnung]', 'Stufe A [Bezeichnung]']);

    await ziel(lehrplan.stufeUmbenennen(formular({ id: s[1].id, titelDe: 'Stufe A neu [Bezeichnung]', titelTr: '' })));
    expect((await stufen())[1].titel).toEqual({ de: 'Stufe A neu [Bezeichnung]' });
    expect(await ziel(lehrplan.stufeUmbenennen(formular({ id: s[1].id, titelDe: 'x' })))).toContain('fehler=titel');
    expect((await audit('lehrplan.geaendert')).length).toBeGreaterThanOrEqual(4);
  });
});

describe('Rechte und Funktionsschalter', () => {
  const ohneRecht: { name: string; rollen: RollenZuweisung[] }[] = [
    { name: 'Redaktion', rollen: [{ rolle: 'redaktion' }] },
    { name: 'Leitung (nur lesen)', rollen: [{ rolle: 'leitung' }] },
    { name: 'Mitgliederverwaltung', rollen: [{ rolle: 'mitgliederverwaltung' }] },
    { name: 'Kinderschutz', rollen: [{ rolle: 'kinderschutz' }] },
  ];

  it.each(ohneRecht)('$name darf keine Gruppe, Leitung, Mitglieder, Termine, Lehrplan oder Lernende ändern', async ({ rollen }) => {
    await alsBildung();
    const id = await gruppeAnlegen();
    const hoca = await person('Testperson Hoca Recht', 'lehrkraft');
    const l = await lernendeAnlegen('Testkind Recht');
    const [stufe] = await db.select().from(schema.lehrplanStufe).limit(1);
    const vorher = await db.select().from(schema.gruppe).where(eq(schema.gruppe.id, id));

    await angemeldetAls(rollen);
    expect(await gruppen.speichereGruppe({}, formular({ ...gueltig, id, nameDe: 'Übernommen' }))).toEqual({ fehler: 'keinRecht' });
    await expect(gruppen.leitungZuweisen(formular({ gruppeId: id, benutzerId: hoca, rolle: 'lehrkraft' }))).rejects.toThrow('KEIN_RECHT');
    await expect(gruppen.mitgliedHinzufuegen(formular({ gruppeId: id, lernendeId: l }))).rejects.toThrow('KEIN_RECHT');
    await expect(gruppen.termineAnlegen(formular({ gruppeId: id, von: '2026-10-13', bis: '2026-11-11' }))).rejects.toThrow('KEIN_RECHT');
    await expect(lernende.setzeLernendeStatus(formular({ id: l, status: 'beendet' }))).rejects.toThrow('KEIN_RECHT');
    if (stufe) await expect(lehrplan.stufeVerschieben(formular({ id: stufe?.id ?? '', richtung: 'runter' }))).rejects.toThrow('KEIN_RECHT');
    await expect(lehrplan.stufeAnlegen(formular({ kursart: 'hifz', titelDe: 'Fremd [Bezeichnung]' }))).rejects.toThrow('KEIN_RECHT');
    expect(await db.select().from(schema.gruppe).where(eq(schema.gruppe.id, id))).toEqual(vorher);
    expect(await db.select().from(schema.gruppenLeitung).where(eq(schema.gruppenLeitung.gruppeId, id))).toEqual([]);
  });

  it('ohne zweiten Faktor und ohne Anmeldung: keine Änderung', async () => {
    await angemeldetAls(BILDUNG, false);
    expect(await gruppen.speichereGruppe({}, formular(gueltig))).toEqual({ fehler: 'keinRecht' });
    await angemeldetAls(null);
    expect(await gruppen.speichereGruppe({}, formular(gueltig))).toEqual({ fehler: 'keinRecht' });
  });

  it('Schalter „lernplattform“ aus: Actions lehnen ab', async () => {
    await alsBildung();
    const id = await gruppeAnlegen();
    process.env.FUNKTION_LERNPLATTFORM = 'aus';
    expect(await gruppen.speichereGruppe({}, formular(gueltig))).toEqual({ fehler: 'keinRecht' });
    await expect(gruppen.termineAnlegen(formular({ gruppeId: id, von: '2026-10-13', bis: '2026-11-11' }))).rejects.toThrow('KEIN_RECHT');
    await expect(lehrplan.stufeAnlegen(formular({ kursart: 'hifz', titelDe: 'Aus [Bezeichnung]' }))).rejects.toThrow('KEIN_RECHT');
  });
});
