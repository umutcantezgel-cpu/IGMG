import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { arbeitsspeicher } from '@/lib/lernapp/lokal/db';
import { ladePaketKopf, paketeImVorrat, raeumeAuf, speichereOffline, VORRAT_PAKETE } from '@/lib/lernapp/lokal/vorrat';
import { INHALT_LIZENZ, PAKET_FORMAT, paketAdresse, VERZEICHNIS_FORMAT, verzeichnisAdresse } from '@/lib/lernapp/paket/kennungen';
import type { Verzeichnis } from '@/lib/lernapp/paket/typen';

/**
 * Alte Paketfassungen im Vorrat (Restliste der Gegenprüfungen, ADR 0039 Nr. 12): Je Einheit liegt höchstens die aktuelle
 * Fassung auf dem Gerät – beim Ablegen einer neuen Fassung, beim Lesen für die Quellen-Seite (`paketeImVorrat`, nur der Hash
 * aus dem gespeicherten Kursverzeichnis) und beim Aufräumen nach dem Laden des Verzeichnisses (`raeumeAuf`, auch Pakete ohne
 * Eintrag im Speicher). Testdaten: Platzhalter in eckigen Klammern.
 */

const KURS = 'de-aus-tr';
const sha = (s: string) => createHash('sha256').update(s).digest('hex');

/** Cache Storage im Arbeitsspeicher mit `keys`, `match`, `put` und `delete` (Anfragen mit voller Adresse wie im Browser). */
function vorrat() {
  const inhalt = new Map<string, Map<string, string>>();
  const pfad = (r: RequestInfo | URL) =>
    new URL(typeof r === 'string' ? r : r instanceof URL ? r.href : r.url, 'https://example.test').pathname;
  const speicher = {
    inhalt,
    async open(name: string) {
      const c = inhalt.get(name) ?? new Map<string, string>();
      inhalt.set(name, c);
      return {
        async keys() {
          return [...c.keys()].map((p) => new Request(new URL(p, 'https://example.test')));
        },
        async match(r: RequestInfo | URL) {
          const text = c.get(pfad(r));
          return text === undefined ? undefined : new Response(text);
        },
        async put(r: RequestInfo | URL, antwort: Response) {
          c.set(pfad(r), await antwort.text());
        },
        async delete(r: RequestInfo | URL) {
          return c.delete(pfad(r));
        },
      };
    },
  };
  return speicher as unknown as CacheStorage & { inhalt: Map<string, Map<string, string>> };
}

const paketJson = (einheit: string, fassung: string) =>
  JSON.stringify({
    format: PAKET_FORMAT,
    version: 1,
    kurs: KURS,
    zielsprache: 'de',
    ausgangssprache: 'tr',
    einheit: { schluessel: einheit, stufe: 'a1', reihenfolge: 1, thema: { tr: `[Thema ${fassung}]` } },
    hinweis: false,
    lektionen: [{ schluessel: `${KURS}.a1.${einheit.split('.').at(-1)}.l01`, art: 'lektion', aufgaben: [] }],
    eintraege: {},
    tipps: [],
    audio: [],
    lizenz: INHALT_LIZENZ,
  });

const verzeichnis = (einheiten: Record<string, string>): Verzeichnis => ({
  format: VERZEICHNIS_FORMAT,
  version: 1,
  kurs: KURS,
  kursId: 'de',
  zielsprache: 'de',
  ausgangssprache: 'tr',
  stand: 1,
  einheiten: Object.entries(einheiten).map(([schluessel, json], i) => ({
    schluessel,
    stufe: 'a1',
    reihenfolge: i + 1,
    thema: { tr: '[Thema]' },
    hash: sha(json),
    bytes: json.length,
    lektionen: 1,
    hinweis: false,
    audio: [],
  })),
});

/** Netz: liefert die Pakete unter ihren Adressen. */
const netz = (pakete: readonly string[]) => {
  const je = new Map(pakete.map((json) => [paketAdresse(KURS, JSON.parse(json).einheit.schluessel, sha(json)), json]));
  return async (adresse: string) => {
    const json = je.get(adresse);
    return json ? new Response(json) : new Response(null, { status: 404 });
  };
};

const adressen = (v: ReturnType<typeof vorrat>) => [...(v.inhalt.get(VORRAT_PAKETE)?.keys() ?? [])].sort();

describe('alte Paketfassungen', () => {
  const e01 = 'de.a1.e01';
  const alt = paketJson(e01, 'alt');
  const neu = paketJson(e01, 'neu');

  it('eine neue Fassung ersetzt die alte im Vorrat und im Speicher', async () => {
    const sp = arbeitsspeicher();
    const v = vorrat();
    const abruf = netz([alt, neu]);
    const [eAlt] = verzeichnis({ [e01]: alt }).einheiten;
    const [eNeu] = verzeichnis({ [e01]: neu }).einheiten;
    expect(await ladePaketKopf(sp, KURS, eAlt!, { abruf, vorrat: v })).not.toBeNull();
    expect(adressen(v)).toEqual([paketAdresse(KURS, e01, sha(alt))]);
    expect(await ladePaketKopf(sp, KURS, eNeu!, { abruf, vorrat: v })).not.toBeNull();
    expect(adressen(v)).toEqual([paketAdresse(KURS, e01, sha(neu))]);
    expect(await sp.lies('pakete', [KURS, e01])).toMatchObject({ hash: sha(neu) });
  });

  it('paketeImVorrat zählt je Einheit nur den Hash des gespeicherten Verzeichnisses und räumt Altes auf', async () => {
    const e02 = 'de.a1.e02';
    const weg = paketJson(e02, 'zurückgezogen');
    const v = vorrat();
    const cache = await v.open(VORRAT_PAKETE);
    for (const json of [alt, neu, weg])
      await cache.put(paketAdresse(KURS, JSON.parse(json).einheit.schluessel, sha(json)), new Response(json));
    // ohne gespeichertes Verzeichnis: alles, was zum Hash passt
    expect((await paketeImVorrat({ vorrat: v })).map((x) => x.paket.einheit.thema.tr).sort()).toEqual([
      '[Thema alt]',
      '[Thema neu]',
      '[Thema zurückgezogen]',
    ]);
    await cache.put(verzeichnisAdresse(KURS), new Response(JSON.stringify(verzeichnis({ [e01]: neu }))));
    const liste = await paketeImVorrat({ vorrat: v });
    expect(liste.map((x) => [x.kurs, x.paket.einheit.schluessel, x.paket.einheit.thema.tr])).toEqual([[KURS, e01, '[Thema neu]']]);
    expect(adressen(v)).toEqual([paketAdresse(KURS, e01, sha(neu)), verzeichnisAdresse(KURS)].sort());
  });

  it('raeumeAuf entfernt auch Pakete ohne Eintrag im Speicher; offline gespeicherte Einheiten kommen zum Nachladen', async () => {
    const sp = arbeitsspeicher();
    const v = vorrat();
    const abruf = netz([alt]);
    const [eAlt] = verzeichnis({ [e01]: alt }).einheiten;
    await ladePaketKopf(sp, KURS, eAlt!, { abruf, vorrat: v, offline: true });
    // eine Fassung ohne Eintrag (z. B. aus einer Zeit ohne IndexedDB) und ein Paket eines anderen Kurses
    const cache = await v.open(VORRAT_PAKETE);
    const ohne = paketJson(e01, 'ohne Eintrag');
    await cache.put(paketAdresse(KURS, e01, sha(ohne)), new Response(ohne));
    await cache.put(paketAdresse('tr-aus-de', 'tr.a1.e01', sha(ohne)), new Response(ohne));
    const v2 = verzeichnis({ [e01]: neu });
    expect(await raeumeAuf(sp, v2, { vorrat: v })).toEqual(v2.einheiten);
    // die alte Fassung verlässt den Vorrat; der Vermerk „offline“ bleibt bis zum Nachladen (alter Hash)
    expect(await sp.lies('pakete', [KURS, e01])).toMatchObject({ hash: sha(alt), offline: true });
    expect(adressen(v)).toEqual([paketAdresse('tr-aus-de', 'tr.a1.e01', sha(ohne))]);
    // ohne Cache Storage läuft es weiter
    expect(await raeumeAuf(arbeitsspeicher(), v2, { vorrat: null })).toEqual([]);
  });

  it('leeres Verzeichnis (z. B. Vorschau des Wissenskurses ausgeschaltet, L3-E22): alle Pakete des Kurses verlassen Vorrat und Speicher, andere Kurse bleiben', async () => {
    const e02 = 'de.a1.e02';
    const zweite = paketJson(e02, 'zweite');
    const sp = arbeitsspeicher();
    const v = vorrat();
    for (const e of verzeichnis({ [e01]: alt, [e02]: zweite }).einheiten)
      await ladePaketKopf(sp, KURS, e, { abruf: netz([alt, zweite]), vorrat: v, offline: true });
    // Paket eines anderen Kurses mit Eintrag im Speicher
    const fremd = paketJson(e01, 'fremd').replaceAll(KURS, 'tr-aus-de').replace('"zielsprache":"de"', '"zielsprache":"tr"');
    const fremdeEinheit = { schluessel: e01, hash: sha(fremd), bytes: fremd.length };
    const fremdNetz = async () => new Response(fremd);
    expect(await ladePaketKopf(sp, 'tr-aus-de', fremdeEinheit, { abruf: fremdNetz, vorrat: v, offline: true })).not.toBeNull();
    expect(await raeumeAuf(sp, verzeichnis({}), { vorrat: v })).toEqual([]);
    expect(await sp.lies('pakete', [KURS, e01])).toBeUndefined();
    expect(await sp.lies('pakete', [KURS, e02])).toBeUndefined();
    expect(adressen(v)).toEqual([paketAdresse('tr-aus-de', e01, sha(fremd))]);
    expect(await sp.lies('pakete', ['tr-aus-de', e01])).toMatchObject({ hash: sha(fremd), offline: true });
  });

  it('Netz bricht beim Nachladen ab: die Markierung „offline“ bleibt, das nächste Aufräumen nennt die Einheit erneut', async () => {
    const e02 = 'de.a1.e02';
    const weg = paketJson(e02, 'zurückgezogen');
    const sp = arbeitsspeicher();
    const v = vorrat();
    const vorher = verzeichnis({ [e01]: alt, [e02]: weg }).einheiten;
    for (const e of vorher) await ladePaketKopf(sp, KURS, e, { abruf: netz([alt, weg]), vorrat: v, offline: true });
    // neue Fassung von e01, e02 zurückgezogen
    const v2 = verzeichnis({ [e01]: neu });
    expect(await raeumeAuf(sp, v2, { vorrat: v })).toEqual(v2.einheiten);
    // zurückgezogen: sofort weg, auch offline (KERN §2.3)
    expect(await sp.lies('pakete', [KURS, e02])).toBeUndefined();
    // Nachladen ohne Netz scheitert
    const ohneNetz = async () => Promise.reject(new TypeError('offline'));
    expect((await speichereOffline(sp, KURS, v2.einheiten, { abruf: ohneNetz, vorrat: v, nachladen: true })).fehlgeschlagen).toEqual([e01]);
    expect(await sp.lies('pakete', [KURS, e01])).toMatchObject({ hash: sha(alt), offline: true });
    expect(adressen(v)).toEqual([]);
    // nächster Versuch mit Netz: neue Fassung, weiter offline
    expect(await raeumeAuf(sp, v2, { vorrat: v })).toEqual(v2.einheiten);
    await speichereOffline(sp, KURS, v2.einheiten, { abruf: netz([neu]), vorrat: v, nachladen: true });
    expect(await sp.lies('pakete', [KURS, e01])).toMatchObject({ hash: sha(neu), offline: true });
    expect(adressen(v)).toEqual([paketAdresse(KURS, e01, sha(neu))]);
    expect(await raeumeAuf(sp, v2, { vorrat: v })).toEqual([]);
  });
});
