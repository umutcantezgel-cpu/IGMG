import { and, eq } from 'drizzle-orm';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { belegHaken } from '@/lib/lernapp/freigabe';
import type { RollenZuweisung } from '@/lib/rechte/matrix';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Zwei-Prüfer-Freigabe religiöser Bausteine (L6-02/03, ADR 0040 Nr. 3 und 5, KERN 4.0 §2.3) gegen PGlite: Rechte (nie per
 * Administration), sichtbar erst nach zwei Freigaben verschiedener Personen zum aktuellen Hash (Aussage, Quizfrage, Lektion
 * nur ganz, Koran-Bedeutung), Rücksetzen bei neuem Hash, gleiche Person nicht zweimal, Verfasser ausgeschlossen, Haken je
 * Beleg, KI-Regel 2 (auch im Freigabeweg der Koran-Verwaltung), Verlauf und Audit ohne Inhalte, Verlauf ohne Person und
 * Kommentar der anderen Prüfenden, Warteschlange vollständig (Grenze erst nach dem Filter), Freigaben-Integration. Testdaten
 * nur Platzhalter, keine religiösen Texte.
 */
const { client, db } = await verwaltungsUmgebung();
const religioes = await import('@/server/actions/lernapp-religioes');
const freigaben = await import('@/server/actions/freigaben');
const koran = await import('@/server/actions/koran');
const { ladeReligioeseBausteine, ladeReligioesenBaustein, religioesSichtbar, lektionReligioesSichtbar, koranBedeutungHash } =
  await import('@/server/queries/lernapp/religioes');
const { ladeVerlauf, ladeWarteschlange, ladeWarteschlangeMitUeberlauf } = await import('@/server/queries/verwaltung/freigaben');

afterAll(() => client.close());
afterEach(() => {
  delete process.env.FUNKTION_LERNAPP;
});

const RELIGIOES: RollenZuweisung[] = [{ rolle: 'religioese_pruefung' }];
const h = (z: string) => z.repeat(64);
const ids = { lektion: '', aussage: '', beleg: '', aufgabe: '', bedeutung: '', kiBedeutung: '', quelle: '' };
let redaktionMitRolle = '';
let hocaVerfasserin = '';

beforeAll(async () => {
  redaktionMitRolle = (await angemeldetAls(RELIGIOES))!;
  hocaVerfasserin = (await angemeldetAls(RELIGIOES))!;
  await db.insert(schema.lernappKurs).values({ id: 'islam', art: 'wissen', zielsprache: 'de', aktiv: true });
  const [abschnitt] = await db
    .insert(schema.lernappAbschnitt)
    .values({ kursId: 'islam', stufe: 'grund', reihenfolge: 1 })
    .returning({ id: schema.lernappAbschnitt.id });
  const [einheit] = await db
    .insert(schema.lernappEinheit)
    .values({ abschnittId: abschnitt!.id, schluessel: 'islam.grund.e01', reihenfolge: 1, inhaltHash: h('1'), verfasstVon: 'ki:test' })
    .returning({ id: schema.lernappEinheit.id });
  const [lektion] = await db
    .insert(schema.lernappLektion)
    .values({
      einheitId: einheit!.id,
      schluessel: 'islam.grund.e01.l01',
      reihenfolge: 1,
      ziel: { de: '[Lernziel – Platzhalter]' },
      inhaltHash: h('2'),
      verfasstVon: 'ki:test',
      status: 'automatisch_geprueft',
    })
    .returning({ id: schema.lernappLektion.id });
  ids.lektion = lektion!.id;
  const [quelle] = await db
    .insert(schema.lernappQuelle)
    .values({
      kurz: 'quduri',
      werk: '[Werk A]',
      autor: '[Autor A]',
      ausgabe: '[Ausgabe 1997]',
      art: 'fiqh',
      openitiUri: '0428Test.Werk.Fassung-ara1',
    })
    .returning({ id: schema.lernappQuelle.id });
  ids.quelle = quelle!.id;
  const [aussage] = await db
    .insert(schema.lernappAussage)
    .values({
      lektionId: ids.lektion,
      schluessel: 'islam.grund.e01.l01.s01',
      text: '[Aussage eins – Platzhalter]',
      reihenfolge: 1,
      inhaltHash: h('3'),
      verfasstVon: 'ki:test',
      status: 'automatisch_geprueft',
    })
    .returning({ id: schema.lernappAussage.id });
  ids.aussage = aussage!.id;
  const [beleg] = await db
    .insert(schema.lernappBeleg)
    .values({
      aussageId: ids.aussage,
      quelleId: ids.quelle,
      passage: 'quduri.ms0042',
      stelle: { kitab: '[Kitab]', bab: '[Bab]', band: '1', seite: '12' },
      inhaltHash: h('4'),
      verfasstVon: 'ki:test',
    })
    .returning({ id: schema.lernappBeleg.id });
  ids.beleg = beleg!.id;
  const [aufgabe] = await db
    .insert(schema.lernappAufgabe)
    .values({
      lektionId: ids.lektion,
      schluessel: 'islam.grund.e01.l01.a01',
      typ: 'wahr_falsch',
      daten: { behauptung: '[Behauptung – Platzhalter]', richtig: true, begruendung: '[Begründung – Platzhalter]' },
      reihenfolge: 1,
      aussageId: ids.aussage,
      inhaltHash: h('5'),
      verfasstVon: 'ki:test',
      status: 'automatisch_geprueft',
    })
    .returning({ id: schema.lernappAufgabe.id });
  ids.aufgabe = aufgabe!.id;
  const [form] = await db.insert(schema.quranWortform).values({ textAr: '[wortform-test]' }).returning({ id: schema.quranWortform.id });
  const [form2] = await db.insert(schema.quranWortform).values({ textAr: '[wortform-test-2]' }).returning({ id: schema.quranWortform.id });
  const [bed] = await db
    .insert(schema.quranWortbedeutung)
    .values({ formId: form!.id, sprache: 'de', bedeutung: '[Bedeutung – Platzhalter]', freigabe: 'geprueft', verfasstVon: hocaVerfasserin })
    .returning({ id: schema.quranWortbedeutung.id });
  ids.bedeutung = bed!.id;
  const [ki] = await db
    .insert(schema.quranWortbedeutung)
    .values({
      formId: form2!.id,
      sprache: 'de',
      bedeutung: '[Bedeutung – Platzhalter]',
      freigabe: 'zur_pruefung',
      verfasstVon: 'ki:lauf-x',
    })
    .returning({ id: schema.quranWortbedeutung.id });
  ids.kiBedeutung = ki!.id;
});

/** Urteil absenden; Standard: „ok“ mit allen Haken zum aktuellen Hash. */
async function urteil(typ: string, id: string, extra: Record<string, string | string[]> = {}) {
  const b = await ladeReligioesenBaustein(typ as 'aussage', id, 'niemand');
  return religioes.religioesPruefen(
    {},
    formular({
      typ,
      id,
      hash: b?.inhaltHash ?? h('0'),
      urteil: 'ok',
      beleg: b?.belege.map(belegHaken) ?? [],
      bestaetigt: '1',
      ...extra,
    }),
  );
}

describe('Rechte (Negativfälle)', () => {
  const aufruf = () => urteil('aussage', ids.aussage);

  it('ohne Sitzung, ohne zweiten Faktor, Administration, Redaktion, Bildung: keinRecht – nichts geschrieben', async () => {
    for (const [rollen, faktor] of [
      [null, true],
      [RELIGIOES, false],
      [[{ rolle: 'administration' }], true],
      [[{ rolle: 'redaktion' }], true],
      [[{ rolle: 'bildung' }], true],
      [[{ rolle: 'sprachpruefung' }], true],
    ] as const) {
      await angemeldetAls(rollen as RollenZuweisung[] | null, faktor);
      expect(await aufruf()).toEqual({ fehler: 'keinRecht' });
    }
    expect(await db.select().from(schema.lernappPruefung)).toHaveLength(0);
    expect(await db.select().from(schema.freigabe)).toHaveLength(0);
  });

  it('Schalter lernapp aus: Hinweis statt Wirkung', async () => {
    process.env.FUNKTION_LERNAPP = 'aus';
    await angemeldetAls(RELIGIOES);
    expect(await aufruf()).toEqual({ fehler: 'aus' });
  });
});

describe('Zwei Freigaben: sichtbar erst nach zwei verschiedenen Personen zum aktuellen Hash', () => {
  it('Beleg-Haken fehlt → kein „ok“; Rückfrage ohne Text → Feldfehler', async () => {
    await angemeldetAls(RELIGIOES);
    expect(await urteil('aussage', ids.aussage, { beleg: [] })).toEqual({ fehler: 'urteil_belegeBestaetigen' });
    expect(await urteil('aussage', ids.aussage, { urteil: 'aenderungsvorschlag' })).toEqual({
      fehler: 'pruefen',
      feldFehler: { vorschlag: 'vorschlagFehlt' },
    });
    expect(await urteil('aussage', ids.aussage, { urteil: 'abgelehnt' })).toEqual({
      fehler: 'pruefen',
      feldFehler: { kommentar: 'begruendungFehlt' },
    });
    expect(await db.select().from(schema.lernappPruefung)).toHaveLength(0);
  });

  it('Aussage: 1/2 unsichtbar, gleiche Person nicht zweimal, 2/2 sichtbar; Verlauf und Audit ohne Inhalte', async () => {
    const imam = (await angemeldetAls(RELIGIOES))!;
    expect(await urteil('aussage', ids.aussage)).toMatchObject({ gespeichert: expect.any(Number), hinweis: 'stand_1' });
    expect(await religioesSichtbar('aussage', ids.aussage)).toBe(false);
    expect((await ladeReligioesenBaustein('aussage', ids.aussage, imam))!).toMatchObject({ stand: 1, eigenes: 'ok', erledigt: true });
    // dieselbe Person ein zweites Mal: verweigert
    expect(await urteil('aussage', ids.aussage)).toEqual({ fehler: 'urteil_schonFreigegeben' });
    expect(aufrufe.updateTag).toEqual([]);

    await angemeldetAls(RELIGIOES);
    expect(await urteil('aussage', ids.aussage)).toMatchObject({ hinweis: 'stand_2' });
    expect(await religioesSichtbar('aussage', ids.aussage)).toBe(true);
    // sichtbar geworden: Kursstand und Cache-Tag des Wissenskurses
    expect(aufrufe.updateTag).toContain('lernapp-kurs-islam');

    const verlauf = await db.select().from(schema.freigabe).where(eq(schema.freigabe.inhaltId, ids.aussage));
    expect(verlauf.map((v) => [v.inhaltTyp, v.art, v.status])).toEqual([
      ['lernapp_aussage', 'religioes', 'zur_pruefung'],
      ['lernapp_aussage', 'religioes', 'geprueft'],
    ]);
    const audits = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, 'lernapp.religioes_geprueft'));
    expect(audits).toHaveLength(2);
    for (const a of audits) {
      expect(a.zielTyp).toBe('lernapp_aussage');
      expect(Object.keys(a.details ?? {}).sort()).toEqual(['belege', 'geprueft', 'stand', 'urteil']);
      expect(JSON.stringify(a.details)).not.toContain('Platzhalter');
    }
    const pruefungen = await db.select().from(schema.lernappPruefung).where(eq(schema.lernappPruefung.inhaltId, ids.aussage));
    expect(pruefungen.every((p) => p.belegeGeprueft.length === 1 && p.belegeGeprueft[0]!.belegId === ids.beleg)).toBe(true);
  });

  it('Lektion nur ganz: erst wenn Lektion, Aussage und Quizfrage je zwei Freigaben haben', async () => {
    expect(await lektionReligioesSichtbar(ids.lektion)).toBe(false);
    await angemeldetAls(RELIGIOES);
    expect(await urteil('aufgabe', ids.aufgabe, { bestaetigt: '' })).toEqual({ fehler: 'urteil_inhaltBestaetigen' });
    expect(await urteil('aufgabe', ids.aufgabe)).toMatchObject({ hinweis: 'stand_1' });
    expect(await urteil('lektion', ids.lektion)).toMatchObject({ hinweis: 'stand_1' });
    expect(await religioesSichtbar('aufgabe', ids.aufgabe)).toBe(false);
    await angemeldetAls(RELIGIOES);
    expect(await urteil('aufgabe', ids.aufgabe)).toMatchObject({ hinweis: 'stand_2' });
    expect(await religioesSichtbar('aufgabe', ids.aufgabe)).toBe(true);
    expect(await lektionReligioesSichtbar(ids.lektion)).toBe(false);
    expect(await urteil('lektion', ids.lektion)).toMatchObject({ hinweis: 'stand_2' });
    expect(await lektionReligioesSichtbar(ids.lektion)).toBe(true);
  });

  it('Änderung (neuer Hash) setzt beide Freigaben zurück; altes Urteil zum alten Hash wird abgewiesen', async () => {
    const alt = (await ladeReligioesenBaustein('aussage', ids.aussage, 'niemand'))!.inhaltHash;
    await db
      .update(schema.lernappAussage)
      .set({ inhaltHash: h('6'), verfasstVon: redaktionMitRolle })
      .where(eq(schema.lernappAussage.id, ids.aussage));
    expect(await religioesSichtbar('aussage', ids.aussage)).toBe(false);
    // Quizfrage und Lektion hängen an der Aussage: ebenfalls unsichtbar
    expect(await religioesSichtbar('aufgabe', ids.aufgabe)).toBe(false);
    expect(await lektionReligioesSichtbar(ids.lektion)).toBe(false);
    await angemeldetAls(RELIGIOES);
    expect(
      await religioes.religioesPruefen({}, formular({ typ: 'aussage', id: ids.aussage, hash: alt, urteil: 'ok', beleg: ids.beleg })),
    ).toEqual({ fehler: 'urteil_veraltet' });
    // Die Redaktion, die den Vorschlag eingearbeitet hat, ist Verfasserin und prüft nicht – auch mit der Rolle
    expect((await ladeReligioesenBaustein('aussage', ids.aussage, redaktionMitRolle))!.verfasser).toBe(true);
  });

  it('Verfasserin mit Rolle wird abgewiesen', async () => {
    // Sitzung der Verfasserin herstellen: neues Konto und Verfasser auf dieses Konto setzen
    const person = (await angemeldetAls(RELIGIOES))!;
    await db.update(schema.lernappAussage).set({ verfasstVon: person }).where(eq(schema.lernappAussage.id, ids.aussage));
    expect(await urteil('aussage', ids.aussage)).toEqual({ fehler: 'urteil_verfasser' });
  });
});

describe('Koran-Bedeutungen im Lern-App-Pfad', () => {
  it('von Menschen verfasst: zwei andere Personen geben frei; die Verfasserin nicht', async () => {
    expect(await religioesSichtbar('koran_bedeutung', ids.bedeutung)).toBe(false);
    await db.insert(schema.rolleZuweisung).values({ benutzerId: hocaVerfasserin, rolle: 'religioese_pruefung' }).onConflictDoNothing();
    await angemeldetAls(RELIGIOES);
    expect(await urteil('koran_bedeutung', ids.bedeutung)).toMatchObject({ hinweis: 'stand_1' });
    await angemeldetAls(RELIGIOES);
    expect(await urteil('koran_bedeutung', ids.bedeutung)).toMatchObject({ hinweis: 'stand_2' });
    expect(await religioesSichtbar('koran_bedeutung', ids.bedeutung)).toBe(true);
    // Änderung der Bedeutung = neuer Hash → zurückgesetzt
    const [vorher] = await db.select().from(schema.quranWortbedeutung).where(eq(schema.quranWortbedeutung.id, ids.bedeutung));
    await db.update(schema.quranWortbedeutung).set({ anmerkung: '[Anmerkung]' }).where(eq(schema.quranWortbedeutung.id, ids.bedeutung));
    expect(koranBedeutungHash({ ...vorher!, anmerkung: '[Anmerkung]' })).not.toBe(koranBedeutungHash(vorher!));
    expect(await religioesSichtbar('koran_bedeutung', ids.bedeutung)).toBe(false);
  });

  it('KI-Herkunft (KI-Regel 2): nie freigebbar', async () => {
    await angemeldetAls(RELIGIOES);
    expect(await urteil('koran_bedeutung', ids.kiBedeutung)).toEqual({ fehler: 'urteil_kiHerkunft' });
    const eintrag = (await ladeReligioeseBausteine('niemand')).find((b) => b.id === ids.kiBedeutung)!;
    expect(eintrag.lage.kiHerkunft).toBe(true);
    // auch die Website-Freigabe verweigert die KI-Herkunft
    expect(
      await freigaben.entscheideFreigabe(
        {},
        formular({ inhaltTyp: 'quran_wortbedeutung', inhaltId: ids.kiBedeutung, entscheidung: 'freigeben' }),
      ),
    ).toEqual({ fehler: 'kiHerkunft' });
    // ebenso der zweite Freigabeweg derselben Inhalte: „Koran & Hadith“ › Freigeben (statusSetzen)
    expect(
      await koran.statusSetzen({}, formular({ art: 'quran_wortbedeutung', kennung: ids.kiBedeutung, ziel: 'geprueft', grund: '' })),
    ).toEqual({ fehler: 'kiRegel' });
    const [zeile] = await db.select().from(schema.quranWortbedeutung).where(eq(schema.quranWortbedeutung.id, ids.kiBedeutung));
    expect(zeile!.freigabe).toBe('zur_pruefung');
    expect(zeile!.geprueftVon).toBeNull();
  });

  it('Aufgabe im Koran-Pfad: auch mit zwei Freigaben nicht sichtbar, solange die gezeigten Bedeutungen nicht aufgelöst sind', async () => {
    await db.insert(schema.lernappKurs).values({ id: 'koran', art: 'koran', zielsprache: 'ar', aktiv: true }).onConflictDoNothing();
    const [abschnitt] = await db
      .insert(schema.lernappAbschnitt)
      .values({ kursId: 'koran', stufe: 'grund', reihenfolge: 1 })
      .returning({ id: schema.lernappAbschnitt.id });
    const [einheit] = await db
      .insert(schema.lernappEinheit)
      .values({ abschnittId: abschnitt!.id, schluessel: 'koran.grund.e01', reihenfolge: 1, inhaltHash: h('c'), verfasstVon: 'ki:test' })
      .returning({ id: schema.lernappEinheit.id });
    const [lektion] = await db
      .insert(schema.lernappLektion)
      .values({
        einheitId: einheit!.id,
        schluessel: 'koran.grund.e01.l01',
        reihenfolge: 1,
        ziel: { de: '[Lernziel – Platzhalter]' },
        inhaltHash: h('d'),
        verfasstVon: 'ki:test',
        status: 'automatisch_geprueft',
      })
      .returning({ id: schema.lernappLektion.id });
    const [aufgabe] = await db
      .insert(schema.lernappAufgabe)
      .values({
        lektionId: lektion!.id,
        schluessel: 'koran.grund.e01.l01.a01',
        typ: 'koran_wort',
        daten: { anweisung: 'waehleBedeutung', optionen: [{ kennung: 'platzhalter.eins' }, { kennung: 'platzhalter.zwei' }] },
        reihenfolge: 1,
        inhaltHash: h('e'),
        verfasstVon: 'ki:test',
        status: 'automatisch_geprueft',
      })
      .returning({ id: schema.lernappAufgabe.id });
    await angemeldetAls(RELIGIOES);
    expect(await urteil('aufgabe', aufgabe!.id)).toMatchObject({ hinweis: 'stand_1' });
    expect(await urteil('lektion', lektion!.id)).toMatchObject({ hinweis: 'stand_1' });
    await angemeldetAls(RELIGIOES);
    expect(await urteil('aufgabe', aufgabe!.id)).toMatchObject({ hinweis: 'stand_2' });
    expect(await urteil('lektion', lektion!.id)).toMatchObject({ hinweis: 'stand_2' });
    // zwei Freigaben der Aufgabe selbst reichen im Koran-Pfad nicht (koranWortSichtbar erst mit dem Paketbau L6-05)
    expect(await religioesSichtbar('aufgabe', aufgabe!.id)).toBe(false);
    expect(await lektionReligioesSichtbar(lektion!.id)).toBe(false);
  });
});

describe('Freigaben-Integration', () => {
  it('Warteschlange /verwaltung/freigaben zeigt offene Bausteine mit Stand und Prüfansicht; entschieden wird nur dort', async () => {
    const person = (await angemeldetAls(RELIGIOES))!;
    const offen = (await ladeWarteschlange(person)).filter((e) => e.inhaltTyp.startsWith('lernapp_'));
    const aussage = offen.find((e) => e.inhaltId === ids.aussage);
    expect(aussage).toMatchObject({
      inhaltTyp: 'lernapp_aussage',
      art: 'religioes',
      zweiPruefer: { stand: 0, href: `/verwaltung/lernapp/religioes/aussage-${ids.aussage}` },
    });
    // 2/2 freigegebene Bausteine stehen nicht in der Warteschlange
    expect(offen.some((e) => e.inhaltId === ids.aufgabe)).toBe(false);
    expect(
      await freigaben.entscheideFreigabe({}, formular({ inhaltTyp: 'lernapp_aussage', inhaltId: ids.aussage, entscheidung: 'freigeben' })),
    ).toEqual({ fehler: 'zweiPruefer' });
  });

  it('Überlauf der Grenze: weitere Lern-App-Bausteine werden gezählt (Verweis auf die vollständige Liste)', async () => {
    const person = (await angemeldetAls(RELIGIOES))!;
    const alle = (await ladeWarteschlangeMitUeberlauf(person)).eintraege.filter((e) => e.inhaltTyp.startsWith('lernapp_'));
    expect(alle.length).toBeGreaterThan(1);
    expect((await ladeWarteschlangeMitUeberlauf(person)).lernappWeitere).toBe(0);
    const knapp = await ladeWarteschlangeMitUeberlauf(person, 1);
    expect(knapp.eintraege.filter((e) => e.inhaltTyp.startsWith('lernapp_'))).toHaveLength(1);
    expect(knapp.lernappWeitere).toBe(alle.length - 1);
  });

  it('Hadith-Übersetzung mit KI-Angabe in Quelle oder Übersetzer: Freigabe verweigert', async () => {
    const verfasser = (await angemeldetAls([{ rolle: 'bildung' }]))!;
    await db.insert(schema.hadithUebersetzung).values({
      sammlungId: 'testsammlung',
      nummer: '1',
      sprache: 'de',
      text: '[Platzhalter]',
      uebersetzer: '[Übersetzer]',
      quelle: 'Maschinelle Übersetzung',
      lizenz: '[Lizenz]',
      freigabe: 'zur_pruefung',
      verfasstVon: verfasser,
    });
    await angemeldetAls(RELIGIOES);
    expect(
      await freigaben.entscheideFreigabe(
        {},
        formular({ inhaltTyp: 'hadith_uebersetzung', inhaltId: 'testsammlung|1|de', entscheidung: 'freigeben' }),
      ),
    ).toEqual({ fehler: 'kiHerkunft' });
    // Koran-Verwaltung (statusSetzen): Quelle bzw. Übersetzer mit KI-Angabe – ebenfalls verweigert, kein Verlaufsschritt
    expect(
      await koran.statusSetzen({}, formular({ art: 'hadith_uebersetzung', kennung: 'testsammlung|1|de', ziel: 'geprueft', grund: '' })),
    ).toEqual({ fehler: 'kiRegel' });
    await db
      .update(schema.hadithUebersetzung)
      .set({ quelle: '[Quelle]', uebersetzer: 'KI' })
      .where(eq(schema.hadithUebersetzung.sammlungId, 'testsammlung'));
    expect(
      await koran.statusSetzen({}, formular({ art: 'hadith_uebersetzung', kennung: 'testsammlung|1|de', ziel: 'geprueft', grund: '' })),
    ).toEqual({ fehler: 'kiRegel' });
    const [z] = await db
      .select()
      .from(schema.hadithUebersetzung)
      .where(and(eq(schema.hadithUebersetzung.sammlungId, 'testsammlung'), eq(schema.hadithUebersetzung.nummer, '1')));
    expect(z!.freigabe).toBe('zur_pruefung');
    expect(await db.select().from(schema.freigabe).where(eq(schema.freigabe.inhaltTyp, 'hadith_uebersetzung'))).toHaveLength(0);
  });

  it('Gegenprobe: menschliche Herkunft gibt statusSetzen frei (Vier-Augen bleibt)', async () => {
    await db
      .update(schema.hadithUebersetzung)
      .set({ quelle: '[Quelle]', uebersetzer: '[Übersetzer]' })
      .where(eq(schema.hadithUebersetzung.sammlungId, 'testsammlung'));
    await angemeldetAls(RELIGIOES);
    expect(
      await koran.statusSetzen({}, formular({ art: 'hadith_uebersetzung', kennung: 'testsammlung|1|de', ziel: 'geprueft', grund: '' })),
    ).toMatchObject({ status: 'geprueft' });
  });
});

describe('Unabhängigkeit der Prüfenden: der Freigabe-Verlauf verrät nicht, wer sonst geprüft hat und was', () => {
  it('Schritte der Lern-App ohne Person und Kommentar; andere Schritte unverändert', async () => {
    const person = (await angemeldetAls(RELIGIOES))!;
    expect(
      await urteil('aussage', ids.aussage, { urteil: 'abgelehnt', kommentar: '[Einwand – Platzhalter]', beleg: [], bestaetigt: '' }),
    ).toMatchObject({ hinweis: 'abgelehnt' });
    // Zum Vergleich ein Schritt einer freien Seite: dort bleiben Person und Kommentar sichtbar
    await db.insert(schema.freigabe).values({
      inhaltTyp: 'seite',
      inhaltId: '00000000-0000-4000-8000-000000000001',
      art: 'redaktion',
      status: 'zur_pruefung',
      von: person,
      kommentar: '[Kommentar – Platzhalter]',
    });
    const verlauf = await ladeVerlauf(500);
    const lernapp = verlauf.filter((z) => z.inhaltTyp.startsWith('lernapp_'));
    expect(lernapp.length).toBeGreaterThan(0);
    expect(lernapp.some((z) => z.inhaltId === ids.aussage && z.status === 'entwurf')).toBe(true);
    for (const z of lernapp) expect(z).toMatchObject({ von: null, kommentar: null, verdeckt: true });
    expect(JSON.stringify(lernapp)).not.toContain('Einwand');
    expect(JSON.stringify(lernapp)).not.toContain('Testperson');
    expect(verlauf.find((z) => z.inhaltTyp === 'seite')).toMatchObject({
      von: 'Testperson Eins',
      kommentar: '[Kommentar – Platzhalter]',
      verdeckt: false,
    });
    // Der Einwand selbst bleibt gespeichert (Befunde der Redaktion, ohne Namen)
    const [einwand] = await db
      .select()
      .from(schema.lernappPruefung)
      .where(and(eq(schema.lernappPruefung.inhaltId, ids.aussage), eq(schema.lernappPruefung.urteil, 'abgelehnt')));
    expect(einwand!.kommentar).toBe('[Einwand – Platzhalter]');
  });
});

describe('Warteschlange vollständig: die Grenze greift erst nach dem Filter', () => {
  it('über 500 zurückgezogene Aussagen mit früherem Schlüssel verdecken die offene Aussage nicht', async () => {
    const [l] = await db
      .select({ einheitId: schema.lernappLektion.einheitId })
      .from(schema.lernappLektion)
      .where(eq(schema.lernappLektion.id, ids.lektion));
    const [davor] = await db
      .insert(schema.lernappLektion)
      .values({
        einheitId: l!.einheitId,
        schluessel: 'islam.grund.e01.l00',
        reihenfolge: 0,
        ziel: { de: '[Lernziel – Platzhalter]' },
        inhaltHash: h('7'),
        verfasstVon: 'ki:test',
        status: 'gesperrt',
      })
      .returning({ id: schema.lernappLektion.id });
    await db.insert(schema.lernappAussage).values(
      Array.from({ length: 505 }, (_, i) => ({
        lektionId: davor!.id,
        schluessel: `islam.grund.e01.l00.s${String(i).padStart(3, '0')}`,
        text: '[Zurückgezogen – Platzhalter]',
        reihenfolge: i + 1,
        inhaltHash: h('8'),
        verfasstVon: 'ki:test',
        status: 'gesperrt' as const,
      })),
    );
    const person = (await angemeldetAls(RELIGIOES))!;
    const aussagen = (await ladeReligioeseBausteine(person)).filter((b) => b.typ === 'aussage');
    expect(aussagen.map((b) => b.id)).toEqual([ids.aussage]);
    const offen = (await ladeWarteschlange(person)).filter((e) => e.inhaltTyp === 'lernapp_aussage');
    expect(offen.map((e) => e.inhaltId)).toEqual([ids.aussage]);
  });
});
