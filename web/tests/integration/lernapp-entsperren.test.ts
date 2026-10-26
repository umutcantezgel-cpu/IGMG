import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { db as appDb, schema } from '@/lib/db';
import type { RollenZuweisung } from '@/lib/rechte/matrix';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * „Wieder freigeben“ in Verwaltung › Lern-App › Meldungen (L3-06b, Mängel der Gegenprüfung) gegen PGlite mit dem Testkurs:
 * Freigegeben wird nur, was über eine Meldung gesperrt wurde, seitdem gesperrt und unverändert ist (gleicher Inhalts-Hash)
 * und was der Import nicht als entfernt führt (Stand `entfernt`) – auch wenn spätere Importe die unveränderte Datei
 * überspringen. Eine zweite Sperre überschreibt den Stand der ersten nicht. Sperre bzw. Freigabe und Audit stehen in einer
 * Transaktion. Testdaten neutral und fiktiv.
 */
const { client, db } = await verwaltungsUmgebung();
const { lernappTestkurs, testkursQuellen, sprachDatei } = await import('../../drizzle/seeds/lernapp-test');
const { importiereLernapp } = await import('@/lib/lernapp/inhalt/import');
const meldungen = await import('@/server/actions/lernapp-meldungen');
const { ladeGesperrte } = await import('@/server/queries/lernapp/meldungen');
const { ladeVorschau } = await import('@/server/queries/lernapp/verwaltung');
const { gibWiederFrei, zieheZurueck } = await import('@/lib/lernapp/veroeffentlichen');

afterAll(() => client.close());
beforeAll(async () => {
  await lernappTestkurs(appDb);
});

const BILDUNG: RollenZuweisung[] = [{ rolle: 'bildung' }];
const QUELLE = { standSchluessel: 'lernapp_testkurs' };
type Datei = ReturnType<typeof sprachDatei>;

/** Quellen des Testkurses; die Sprachdatei tr nach `aendern`. */
function mitTr(...aendern: ((d: Datei) => void)[]) {
  const d = sprachDatei('tr');
  for (const f of aendern) f(d);
  return testkursQuellen().map((q) => (q.pfad.includes('/sprache/tr/') ? { ...q, text: JSON.stringify(d) } : q));
}
const ohne = (schluessel: string) => (d: Datei) => {
  for (const l of d.lektionen) l.aufgaben = l.aufgaben.filter((a) => a.schluessel !== schluessel);
};
/** Paare-Aufgabe mit umgekehrter Reihenfolge der Lemmata (neuer Inhalts-Hash) */
const geaendert = (schluessel: string) => (d: Datei) => {
  const a = d.lektionen.flatMap((l) => l.aufgaben).find((x) => x.schluessel === schluessel) as { lemmata: string[] };
  a.lemmata = [...a.lemmata].reverse();
};

const aufgabe = async (s: string) => (await db.select().from(schema.lernappAufgabe).where(eq(schema.lernappAufgabe.schluessel, s)))[0]!;
const lemma = async (s: string) => (await db.select().from(schema.lernappLemma).where(eq(schema.lernappLemma.schluessel, s)))[0]!;
const kursstand = async () => (await db.select().from(schema.lernappKurs).where(eq(schema.lernappKurs.id, 'tr')))[0]!.version;
const veroeffentliche = (s: string) =>
  db.update(schema.lernappAufgabe).set({ status: 'veroeffentlicht' }).where(eq(schema.lernappAufgabe.schluessel, s));
const standEntfernt = async () =>
  (
    (await db.select().from(schema.einstellung).where(eq(schema.einstellung.schluessel, 'lernapp_testkurs')))[0]!.wert as {
      entfernt?: string[];
    }
  ).entfernt;
async function meldung(aufgabeSchluessel: string, kategorie: 'fehler_zieltext' | 'antwort_richtig' = 'fehler_zieltext') {
  const [m] = await db
    .insert(schema.lernappMeldung)
    .values({ aufgabeSchluessel: `tr-aus-de:${aufgabeSchluessel}`, kategorie })
    .returning();
  return m!.id;
}
const sperren = (id: string, ziel: string) => meldungen.eintragSperren({}, formular({ id, ziel, bestaetigt: '1' }));
const entsperren = (ziel: string) => meldungen.eintragEntsperren({}, formular({ ziel, bestaetigt: '1' }));
const gesperrte = async () => (await ladeGesperrte()).map((g) => [g.schluessel, g.vorher]);
const GESPEICHERT = { gespeichert: expect.any(Number) };

describe('Wieder freigeben nur, was die Meldung gesperrt hat und unverändert ist (L3-06b)', () => {
  it('über eine Meldung gesperrt, danach in der Datei entfernt: nicht freizugeben, auch nach übersprungenem Import', async () => {
    const ZIEL = 'tr.a1.test.l01.a02';
    await angemeldetAls(BILDUNG);
    expect(await standEntfernt()).toEqual([]);
    expect(await sperren(await meldung(ZIEL), ZIEL)).toMatchObject(GESPEICHERT);
    expect(await gesperrte()).toEqual([[ZIEL, 'automatisch_geprueft']]);

    // Die Redaktion entfernt den Eintrag: Er war schon gesperrt (keine neue Sperre), der Stand führt ihn trotzdem als entfernt
    const b = await importiereLernapp(appDb, mitTr(ohne(ZIEL)), QUELLE);
    expect(b.gesperrt).toBe(0);
    expect(await standEntfernt()).toEqual([ZIEL]);
    expect(await gesperrte()).toEqual([]);
    expect(await entsperren(ZIEL)).toEqual({ fehler: 'nichtGefunden' });
    expect((await aufgabe(ZIEL)).status).toBe('gesperrt');
    expect((await ladeVorschau('tr-aus-de', 'tr.a1.test.l01'))!.lektion.aufgaben.some((x) => x.schluessel === ZIEL)).toBe(false);

    // Der nächste Import überspringt die unveränderten Dateien; die Liste bleibt
    const b2 = await importiereLernapp(appDb, mitTr(ohne(ZIEL)), QUELLE);
    expect(b2.uebersprungen).toBe(b2.dateien);
    expect(await standEntfernt()).toEqual([ZIEL]);
    expect(await gesperrte()).toEqual([]);

    // Mit der Datei zurück (gleicher Inhalt): Die Sperre aus der Meldung gilt weiter und ist wieder freizugeben
    await importiereLernapp(appDb, testkursQuellen(), QUELLE);
    expect(await standEntfernt()).toEqual([]);
    expect((await aufgabe(ZIEL)).status).toBe('gesperrt');
    expect(await gesperrte()).toEqual([[ZIEL, 'automatisch_geprueft']]);
    expect(await entsperren(ZIEL)).toMatchObject(GESPEICHERT);
    expect((await aufgabe(ZIEL)).status).toBe('automatisch_geprueft');
  });

  it('gesperrt bei „veroeffentlicht“, der Import ändert und entfernt ihn: nie „veroeffentlicht“ für den neuen Hash', async () => {
    const ZIEL = 'tr.a1.test.l01.a02';
    await angemeldetAls(BILDUNG);
    await veroeffentliche(ZIEL);
    const h1 = (await aufgabe(ZIEL)).inhaltHash;
    expect(await sperren(await meldung(ZIEL), ZIEL)).toMatchObject(GESPEICHERT);
    expect(await gesperrte()).toEqual([[ZIEL, 'veroeffentlicht']]);
    await importiereLernapp(appDb, mitTr(geaendert(ZIEL)), QUELLE);
    const neu = await aufgabe(ZIEL);
    expect(neu.inhaltHash).not.toBe(h1);
    expect(neu.status).toBe('automatisch_geprueft');
    await importiereLernapp(appDb, mitTr(geaendert(ZIEL), ohne(ZIEL)), QUELLE);
    expect((await aufgabe(ZIEL)).status).toBe('gesperrt');
    expect(await gesperrte()).toEqual([]);
    expect(await entsperren(ZIEL)).toEqual({ fehler: 'nichtGefunden' });
    expect((await aufgabe(ZIEL)).status).toBe('gesperrt');
  });

  it('Inhalt seit der Sperre geändert (Alternative ergänzt): nicht freizugeben; die Freigabe selbst prüft den Hash', async () => {
    const ZIEL = 'tr.a1.test.l02.a02';
    await angemeldetAls(BILDUNG);
    await veroeffentliche(ZIEL);
    const h1 = (await aufgabe(ZIEL)).inhaltHash;
    expect(await sperren(await meldung(ZIEL), ZIEL)).toMatchObject(GESPEICHERT);
    const zweite = await meldung(ZIEL, 'antwort_richtig');
    expect(await meldungen.alternativeErgaenzen({}, formular({ id: zweite, alternative: '[Fassung]' }))).toMatchObject(GESPEICHERT);
    const jetzt = await aufgabe(ZIEL);
    expect(jetzt.status).toBe('gesperrt');
    expect(jetzt.inhaltHash).not.toBe(h1);
    expect((await ladeGesperrte()).some((g) => g.schluessel === ZIEL)).toBe(false);
    expect(await entsperren(ZIEL)).toEqual({ fehler: 'nichtGefunden' });
    // bedingt: nur zum Hash der Sperre
    expect(await gibWiederFrei('aufgabe', ZIEL, 'veroeffentlicht', h1, async () => undefined)).toBe(false);
    expect((await aufgabe(ZIEL)).status).toBe('gesperrt');
  });

  it('zweite Sperre eines gesperrten Eintrags überschreibt den Stand nicht; nach einer Freigabe sperrt nur noch der Import', async () => {
    const ZIEL = 'tr.a1.test.l01.a04';
    await angemeldetAls(BILDUNG);
    await veroeffentliche(ZIEL);
    const erste = await meldung(ZIEL);
    const zweite = await meldung(ZIEL, 'antwort_richtig');
    expect(await sperren(erste, ZIEL)).toMatchObject(GESPEICHERT);
    expect(await sperren(zweite, ZIEL)).toMatchObject(GESPEICHERT);
    const audits = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, 'lernapp.meldung_bearbeitet'));
    expect(audits.find((x) => x.zielId === erste)!.details).toEqual({
      aktion: 'gesperrt',
      kategorie: 'fehler_zieltext',
      eintrag: ZIEL,
      vorher: 'veroeffentlicht',
      hash: (await aufgabe(ZIEL)).inhaltHash,
    });
    expect(audits.find((x) => x.zielId === zweite)!.details).toEqual({ aktion: 'gesperrt', kategorie: 'antwort_richtig', eintrag: ZIEL });
    expect((await gesperrte()).filter(([s]) => s === ZIEL)).toEqual([[ZIEL, 'veroeffentlicht']]);
    expect(await entsperren(ZIEL)).toMatchObject(GESPEICHERT);
    expect((await aufgabe(ZIEL)).status).toBe('veroeffentlicht');

    // Danach entfernt der Import ihn, und er kommt mit gleichem Inhalt zurück (bleibt gesperrt): Die Sperre stammt vom Import,
    // nicht aus der Meldung – auch wenn eine ältere Sperre aus einer Meldung denselben Hash trägt
    await importiereLernapp(appDb, mitTr(ohne(ZIEL)), QUELLE);
    await importiereLernapp(appDb, testkursQuellen(), QUELLE);
    expect((await aufgabe(ZIEL)).status).toBe('gesperrt');
    expect(await standEntfernt()).not.toContain(ZIEL);
    expect((await gesperrte()).filter(([s]) => s === ZIEL)).toEqual([]);
  });

  it('Sperre bzw. Freigabe und Audit in einer Transaktion: Scheitert das Audit, bleiben Status und Kursstand', async () => {
    const ZIEL = 'tr.a1.test.w003';
    const vorher = await lemma(ZIEL);
    const stand = await kursstand();
    aufrufe.updateTag.length = 0;
    const scheitert = async () => {
      throw new Error('Audit nicht geschrieben');
    };
    await expect(zieheZurueck('lemma', ZIEL, scheitert)).rejects.toThrow('Audit nicht geschrieben');
    expect((await lemma(ZIEL)).status).toBe(vorher.status);
    expect(await kursstand()).toBe(stand);
    expect(aufrufe.updateTag).toEqual([]);

    expect(await zieheZurueck('lemma', ZIEL)).toBe(true);
    expect(await kursstand()).toBe(stand + 1);
    aufrufe.updateTag.length = 0;
    await expect(gibWiederFrei('lemma', ZIEL, vorher.status as 'automatisch_geprueft', vorher.inhaltHash, scheitert)).rejects.toThrow(
      'Audit nicht geschrieben',
    );
    expect((await lemma(ZIEL)).status).toBe('gesperrt');
    expect(await kursstand()).toBe(stand + 1);
    expect(aufrufe.updateTag).toEqual([]);
    expect(await gibWiederFrei('lemma', ZIEL, 'automatisch_geprueft', vorher.inhaltHash, async () => undefined)).toBe(true);
    expect((await lemma(ZIEL)).status).toBe('automatisch_geprueft');
    expect(aufrufe.updateTag).toEqual(['lernapp-kurs-tr']);
  });
});
