import { createHash } from 'node:crypto';
import type { ReactElement } from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';
import ar from '../../../messages/lernapp/ar.json';
import de from '../../../messages/lernapp/de.json';
import entwurf from '../../../messages/lernapp/entwurf.json';
import tr from '../../../messages/lernapp/tr.json';
import { EinheitNamensnennung, NamensnennungInsel } from '@/components/lernapp/inseln/NamensnennungInsel';
import { formatiere } from '@/lib/lernapp/format';
import { RICHTUNGEN } from '@/lib/lernapp/kurse';
import { paketeImVorrat, VORRAT_PAKETE } from '@/lib/lernapp/lokal/vorrat';
import { istEigeneQuelle, nennungenAus, quellAdresse } from '@/lib/lernapp/namensnennung';
import { INHALT_LIZENZ, PAKET_FORMAT, paketAdresse } from '@/lib/lernapp/paket/kennungen';

/**
 * Namensnennung je Satz und Eintrag (Gegenprüfung L8-03-04, Mangel 1; ADR 0039 Nr. 9, ADR 0045 Nr. 4): Die Angaben aus
 * `eintraege` der Pakete im Vorrat erscheinen auf `/lern-app/<ui>/quellen` – fremde Quellen einzeln mit Text, Namensnennung
 * und Adresse, eigene Inhalte nur gezählt; ohne Netz aus dem Cache Storage, nur Pakete mit passendem Hash.
 */

const EINTRAEGE = {
  'de.a1.e01.s0001': {
    text: 'Guten Morgen!',
    sprache: 'de',
    quelle: 'tatoeba:1234',
    lizenz: 'CC-BY-2.0-FR',
    namensnennung: 'Satz #1234 von [Benutzername] (Tatoeba), CC BY 2.0 FR',
  },
  'de.a1.e01.l0001': {
    text: 'Morgen',
    sprache: 'de',
    quelle: 'wiktionary:de:Morgen',
    lizenz: 'CC-BY-SA-4.0',
    namensnennung:
      'Wörterbuchdaten nach Wiktionary, Artikel ‚Morgen‘ (https://de.wiktionary.org/wiki/Morgen), Autorinnen und Autoren siehe Versionsgeschichte; extrahiert mit Wiktextract (Tatu Ylonen) über kaikki.org; gekürzt und umformatiert; Lizenz CC BY-SA 4.0',
  },
  'de.a1.e01.s0001@tr': { text: 'Günaydın!', sprache: 'tr', quelle: 'tatoeba:5678', lizenz: 'CC-BY-2.0-FR' },
  'de.a1.e01.s0002': { text: 'Guten Abend!', sprache: 'de', quelle: 'ki:lernapp-inhalte/a1/v1', lizenz: 'CC-BY-SA-4.0' },
  'de.a1.e01.s0003': { text: 'Gute Nacht!', sprache: 'de', quelle: 'redaktion', lizenz: 'CC-BY-SA-4.0' },
  'de.a1.e01.kaputt': { text: 'ohne Quelle', sprache: 'de', lizenz: 'CC-BY-SA-4.0' },
  'de.a1.e01.fremd': { text: 'Hallo', sprache: 'xx', quelle: 'tatoeba:1', lizenz: 'CC-BY-2.0-FR' },
};

describe('nennungenAus', () => {
  it('fremde Quellen einzeln, eigene gezählt, Ungültiges fällt weg; Adresse nur, wenn sie in der Namensnennung fehlt', () => {
    const n = nennungenAus(EINTRAEGE);
    expect(n.eigene).toBe(2);
    expect(n.fremd).toEqual([
      {
        schluessel: 'de.a1.e01.l0001',
        text: 'Morgen',
        sprache: 'de',
        nennung: EINTRAEGE['de.a1.e01.l0001'].namensnennung,
      },
      {
        schluessel: 'de.a1.e01.s0001',
        text: 'Guten Morgen!',
        sprache: 'de',
        nennung: 'Satz #1234 von [Benutzername] (Tatoeba), CC BY 2.0 FR',
        adresse: 'https://tatoeba.org/de/sentences/show/1234',
      },
      // ohne Namensnennung im Paket: Quelle und Lizenzname, dazu die Adresse
      {
        schluessel: 'de.a1.e01.s0001@tr',
        text: 'Günaydın!',
        sprache: 'tr',
        nennung: 'tatoeba:5678 · CC BY 2.0 FR',
        adresse: 'https://tatoeba.org/de/sentences/show/5678',
      },
    ]);
    expect(nennungenAus(null)).toEqual({ fremd: [], eigene: 0 });
    expect(nennungenAus([])).toEqual({ fremd: [], eigene: 0 });
  });

  it('eigene Quellen wie im Lizenz-Prüfer; Adressen von Tatoeba und Wiktionary', () => {
    expect(['ki:x', 'redaktion', 'test:ton'].every(istEigeneQuelle)).toBe(true);
    expect(['tatoeba:1', 'wiktionary:de:Haus', 'redaktion2'].some(istEigeneQuelle)).toBe(false);
    expect(quellAdresse('tatoeba:42')).toBe('https://tatoeba.org/de/sentences/show/42');
    expect(quellAdresse('wiktionary:tr:ev')).toBe('https://tr.wiktionary.org/wiki/ev');
    expect(quellAdresse('ki:x')).toBeUndefined();
  });
});

/** Cache Storage im Arbeitsspeicher mit `keys()` (Anfragen mit voller Adresse, wie im Browser). */
function vorratImSpeicher(eintraege: Record<string, string>): CacheStorage {
  const voll = (r: RequestInfo | URL) => new URL(typeof r === 'string' ? r : r instanceof URL ? r.href : r.url, 'https://example.test');
  const cache = {
    async keys() {
      return Object.keys(eintraege).map((p) => new Request(voll(p)));
    },
    async match(r: RequestInfo | URL) {
      const text = eintraege[voll(r).pathname];
      return text === undefined ? undefined : new Response(text);
    },
  };
  return {
    open: async (name: string) => (name === VORRAT_PAKETE ? cache : { keys: async () => [], match: async () => undefined }),
  } as never;
}

const paketJson = (kurs: string, einheit: string) =>
  JSON.stringify({
    format: PAKET_FORMAT,
    version: 1,
    kurs,
    zielsprache: 'de',
    ausgangssprache: 'tr',
    einheit: { schluessel: einheit, stufe: 'a1', reihenfolge: 1, thema: { tr: '[Thema]' } },
    hinweis: false,
    lektionen: [{ schluessel: `${kurs}.a1.e01.l01`, art: 'lektion', aufgaben: [] }],
    eintraege: EINTRAEGE,
    tipps: [],
    audio: [],
    lizenz: INHALT_LIZENZ,
  });
const sha = (s: string) => createHash('sha256').update(s).digest('hex');

describe('paketeImVorrat', () => {
  it('liest nur Einheitenpakete mit passendem Hash und passender Einheit; ohne Cache Storage leer', async () => {
    const gut = paketJson('de-aus-tr', 'de.a1.e01');
    const andereEinheit = paketJson('de-aus-tr', 'de.a1.e09');
    const vorrat = vorratImSpeicher({
      [paketAdresse('de-aus-tr', 'de.a1.e01', sha(gut))]: gut,
      // falscher Hash, andere Einheit als in der Adresse, Kursverzeichnis, unbekannter Kurs
      [paketAdresse('de-aus-tr', 'de.a1.e02', 'f'.repeat(64))]: gut,
      [paketAdresse('de-aus-tr', 'de.a1.e03', sha(andereEinheit))]: andereEinheit,
      '/lern-app/pakete/de-aus-tr': '{}',
      [paketAdresse('xx-aus-yy', 'de.a1.e01', sha(gut))]: gut,
    });
    const liste = await paketeImVorrat({ vorrat });
    expect(liste.map((x) => [x.kurs, x.paket.einheit.schluessel])).toEqual([['de-aus-tr', 'de.a1.e01']]);
    expect(nennungenAus(liste[0]!.paket.eintraege).fremd).toHaveLength(3);
    expect(await paketeImVorrat({ vorrat: null })).toEqual([]);
  });
});

async function vorrendern(ui: ReactElement): Promise<string> {
  const { prelude } = await prerenderToNodeStream(ui);
  let html = '';
  for await (const teil of prelude) html += String(teil);
  return html;
}

describe('Anzeige', () => {
  it('Text mit Sprache und Richtung, Namensnennung deutsch, Adresse links nach rechts; eigene Einträge gezählt', async () => {
    const html = await vorrendern(<EinheitNamensnennung ui="ar" nennungen={nennungenAus(EINTRAEGE)} texte={ar.namensnennung.insel} />);
    expect(html).toMatch(/<p lang="tr" dir="ltr"[^>]*>Günaydın!<\/p>/);
    expect(html).toMatch(/<p lang="de" dir="ltr"[^>]*>Satz #1234 von \[Benutzername\] \(Tatoeba\), CC BY 2\.0 FR<\/p>/);
    expect(html).toMatch(/<p dir="ltr"[^>]*>https:\/\/tatoeba\.org\/de\/sentences\/show\/1234<\/p>/);
    // „bei jedem Eintrag“: drei fremde Einträge, zwei eigene gezählt
    expect(html.match(/<li /g)).toHaveLength(3);
    expect(html).toContain(formatiere(ar.namensnennung.insel.eigene, { n: 2 }, 'ar'));
    const nurEigene = await vorrendern(
      <EinheitNamensnennung ui="de" nennungen={{ fremd: [], eigene: 4 }} texte={de.namensnennung.insel} />,
    );
    expect(nurEigene).toContain(de.namensnennung.insel.nurEigene);
  });

  it('die statische Hülle zeigt „wird gelesen“; Texte in de/tr/ar, tr/ar als KI-Entwurf vermerkt', async () => {
    const kurse = Object.fromEntries(RICHTUNGEN.map((k) => [k, k])) as Record<(typeof RICHTUNGEN)[number], string>;
    expect(await vorrendern(<NamensnennungInsel ui="de" texte={de.namensnennung.insel} kurse={kurse} />)).toContain(
      de.namensnennung.insel.laedt,
    );
    const schluessel = (o: object, p = ''): string[] =>
      Object.entries(o).flatMap(([k, v]) => (typeof v === 'object' ? schluessel(v, `${p}${k}.`) : [`${p}${k}`]));
    const alle = schluessel(de.namensnennung, 'namensnennung.');
    expect(schluessel(tr.namensnennung, 'namensnennung.')).toEqual(alle);
    expect(schluessel(ar.namensnennung, 'namensnennung.')).toEqual(alle);
    for (const k of [...alle, 'quellen.inhalteText', 'lizenzverzeichnis.datenText']) {
      expect(entwurf.tr, k).toContain(k);
      expect(entwurf.ar, k).toContain(k);
    }
    // keine Behauptung mehr, die Namensnennung stehe „bei jedem Satz“ im Kurs (Mangel 1 der Gegenprüfung)
    expect(de.lizenzverzeichnis.datenText).not.toMatch(/bei jedem Satz/);
    expect(de.quellen.inhalteText).not.toMatch(/bei jedem Eintrag im Kurs/);
  });
});
