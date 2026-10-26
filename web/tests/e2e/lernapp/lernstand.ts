import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, type Page } from '@playwright/test';
import ar from '../../../messages/lernapp/ar.json';
import de from '../../../messages/lernapp/de.json';
import tr from '../../../messages/lernapp/tr.json';
import { EreignisSchema } from '../../../src/lib/lernapp/ereignisse/typen';
import { formatiere } from '../../../src/lib/lernapp/format';

/**
 * Lernstand mit fälligen Karten aus echten Inhalten (Stufe C N9b): eine Sicherungsdatei der Lern-App (Format
 * `igmg-lernapp-export`, `src/lib/lernapp/lokal/export.ts`) mit Bewertungen „nochmal“ von vor drei Tagen, einer Lektion und
 * XP, eingelesen über die Einstellungen („Datei einlesen“) – der Weg einer Person, die ihren Stand auf ein neues Gerät bringt.
 * Die Karten sind die Ziele der Auswahl-Aufgaben in Lektion 1 der ersten echten Einheit (`inhalte/lernapp/sprache/…`), also
 * Karten, die das Einheitenpaket kennt; Wiederholen baut daraus eine Runde aus den Paketen.
 */

type Ui = 'de' | 'tr' | 'ar';
const TEXTE = { de, tr, ar } as const;

/** Ziele der Auswahl-Aufgaben in Lektion 1 einer echten Einheit (`tr.a1.e01`). */
export function kartenAusEinheit(einheit: string, anzahl = 4): string[] {
  const [ziel, stufe] = einheit.split('.');
  const datei = join(__dirname, '../../../inhalte/lernapp/sprache', ziel!, stufe!, `${einheit}.json`);
  const inhalt = JSON.parse(readFileSync(datei, 'utf8')) as { lektionen: { aufgaben: { typ: string; ziel?: string }[] }[] };
  const ziele = inhalt.lektionen[0]!.aufgaben.filter((a) => a.typ === 'auswahl' && a.ziel).map((a) => a.ziel!);
  return [...new Set(ziele)].slice(0, anzahl);
}

/**
 * Sicherungsdatei: je Karte eine Bewertung „nochmal“ vor drei Tagen, dazu Lektion 1 der Einheit und ihre XP. `karten`:
 * eigene Kartenschlüssel (ohne Kurs), etwa für den Testkurs aus dem Seed, der keine Inhaltsdatei hat.
 */
export function lernstandDatei(ui: Ui, kurs: string, einheit: string, karten?: string[]): { inhalt: string; ereignisse: number } {
  const geraet = randomUUID();
  const vor = new Date(Date.now() - 3 * 86_400_000);
  const am = vor.toISOString();
  const tag = am.slice(0, 10);
  const [, stufe, teil] = einheit.split('.');
  const lektion = `${kurs}.${stufe}.${teil}.l01`;
  const roh = [
    ...(karten ?? kartenAusEinheit(einheit)).map((k) => ({ art: 'bewertung', daten: { karte: `${kurs}:${k}`, note: 'nochmal', kurs } })),
    { art: 'lektion', daten: { kurs, lektion, art: 'lektion', richtig: 2, gesamt: 4 } },
    { art: 'xp', daten: { menge: 10, grund: 'lektion', bezug: lektion } },
  ];
  const ereignisse = roh.map((e, seq) => EreignisSchema.parse({ geraet, seq, am, tag, ...e }));
  const datei = {
    format: 'igmg-lernapp-export',
    version: 1,
    erstellt: new Date().toISOString(),
    profil: { name: '[Testprofil]', oberflaeche: ui, angelegt: am },
    ereignisse,
  };
  return { inhalt: JSON.stringify(datei), ereignisse: ereignisse.length };
}

/** Lernstand über die Einstellungen einlesen; wartet auf die Meldung „n Einträge übernommen“. */
export async function leseLernstandEin(page: Page, ui: Ui, kurs: string, einheit: string, karten?: string[]) {
  const { inhalt, ereignisse } = lernstandDatei(ui, kurs, einheit, karten);
  await page.goto(`/lern-app/${ui}/einstellungen`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(TEXTE[ui].einstellungen.titel);
  await page.locator('main input[type="file"]').setInputFiles({
    name: 'igmg-lernapp-test.json',
    mimeType: 'application/json',
    buffer: Buffer.from(inhalt),
  });
  await expect(
    page.getByRole('status').filter({ hasText: formatiere(TEXTE[ui].einstellungen.eingelesen, { n: ereignisse }, ui) }),
  ).toBeVisible({
    timeout: 15_000,
  });
}
