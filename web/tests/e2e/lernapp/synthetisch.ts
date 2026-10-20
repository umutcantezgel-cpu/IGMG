import { createHash } from 'node:crypto';
import type { Page } from '@playwright/test';
import type { Lektion } from '../../../src/lib/lernapp/aufgaben/schema';
import { INHALT_LIZENZ, PAKET_FORMAT, VERZEICHNIS_FORMAT } from '../../../src/lib/lernapp/paket/kennungen';

/**
 * Synthetische Kurspakete für E2E (nur im Test): Kursverzeichnis und Einheitenpakete werden über `page.route` ausgeliefert,
 * ohne Datenbank – für Übungstypen, deren Inhalte erst später aus geprüften Quellen kommen (Wissenskurs, Koran-Arabisch:
 * nur Platzhalter in eckigen Klammern, KI-Regel 2) und für eine Einstufung über mehrere Stufen. Der Client prüft wie im
 * Betrieb: SHA-256 der Bytes gegen die Adresse, Paket gegen `PaketSchema`. Der Service Worker muss im Test gesperrt sein
 * (`test.use({ serviceWorkers: 'block' })`), damit `page.route` jede Anfrage sieht.
 */

export type SynthEinheit = {
  schluessel: string;
  stufe: 'a1' | 'a2' | 'b1' | 'b2' | 'c1';
  thema: string;
  lektionen: Lektion[];
};

const sha256 = (text: string) => createHash('sha256').update(text, 'utf8').digest('hex');

/** Verzeichnis und Pakete einer Richtung (Standard `tr-aus-de`) anbieten; liefert die Lektionsschlüssel je Einheit. */
export async function bietePaketeAn(page: Page, einheiten: SynthEinheit[], kurs = 'tr-aus-de'): Promise<void> {
  const [ziel, ausgang] = kurs.split('-aus-') as ['de' | 'tr' | 'ar', 'de' | 'tr' | 'ar'];
  const pakete = einheiten.map((e, i) => {
    const json = JSON.stringify({
      format: PAKET_FORMAT,
      version: 1,
      kurs,
      zielsprache: ziel,
      ausgangssprache: ausgang,
      einheit: { schluessel: e.schluessel, stufe: e.stufe, reihenfolge: i + 1, thema: { de: e.thema } },
      hinweis: false,
      lektionen: e.lektionen,
      eintraege: {},
      tipps: [],
      audio: [],
      lizenz: INHALT_LIZENZ,
    });
    return { e, i, json, hash: sha256(json) };
  });
  const verzeichnis = JSON.stringify({
    format: VERZEICHNIS_FORMAT,
    version: 1,
    kurs,
    kursId: ziel,
    zielsprache: ziel,
    ausgangssprache: ausgang,
    stand: 1,
    einheiten: pakete.map(({ e, i, json, hash }) => ({
      schluessel: e.schluessel,
      stufe: e.stufe,
      reihenfolge: i + 1,
      thema: { de: e.thema },
      hash,
      bytes: Buffer.byteLength(json),
      lektionen: e.lektionen.length,
      hinweis: false,
      audio: [],
    })),
  });
  const antwort = (body: string) => ({ status: 200, contentType: 'application/json; charset=utf-8', body });
  await page.route(`**/lern-app/pakete/${kurs}`, (route) => route.fulfill(antwort(verzeichnis)));
  for (const p of pakete)
    await page.route(`**/lern-app/pakete/${kurs}/${p.e.schluessel}/${p.hash}`, (route) => route.fulfill(antwort(p.json)));
}

/** Lektion im Paketformat (Kurs `tr-aus-de`, Ausgangssprache Deutsch). */
export const lektion = (schluessel: string, aufgaben: Lektion['aufgaben'], kurs = 'tr-aus-de'): Lektion => ({
  schluessel,
  kurs,
  art: 'lektion',
  zielsprache: kurs.split('-aus-')[0] as 'tr',
  ausgangssprache: kurs.split('-aus-')[1] as 'de',
  aufgaben,
});

/** Skripte, die eine Seite lädt, mit Inhalt (für „lädt kein Zod“: zod/mini trägt den Namen `$ZodType` als Zeichenkette). */
export function sammleSkripte(page: Page): { texte: string[] } {
  const ergebnis = { texte: [] as string[] };
  page.on('response', (r) => {
    if (r.request().resourceType() !== 'script') return;
    void r
      .text()
      .then((t) => ergebnis.texte.push(t))
      .catch(() => undefined);
  });
  return ergebnis;
}
export const ZOD_MARKE = '$ZodType';
