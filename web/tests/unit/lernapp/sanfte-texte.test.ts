import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Sanfte Texte (KERN 4.0 §5, ADR 0043 Nr. 10, Tor-Regeltest nach L3-E12): Kein Text der Lern-App enthält Verlust-, Schuld-
 * oder Strafwörter – vor allem nicht rund um Serie, Tagesziel und Rückmeldung („verloren“, „verpasst“, „Serie gebrochen“).
 * Geprüft werden alle Texte in `messages/lernapp/{de,tr,ar}.json`. Die Listen je Sprache sind ein Entwurf; tr und ar prüfen
 * Muttersprachler (LM-01, LM-11). Arabische Wortstämme nur als Codepunkt-Escapes (KERN 4.0 §3).
 */
const ORDNER = join(import.meta.dirname, '../../../messages/lernapp');

/** Verbotene Wortteile je Sprache (klein, ohne Rücksicht auf Groß- und Kleinschreibung). */
const VERBOTEN: Record<'de' | 'tr' | 'ar', readonly string[]> = {
  de: [
    'verlor',
    'verlier',
    'verpass',
    'versäum',
    'versag',
    'strafe',
    'bestraf',
    'schande',
    'enttäusch',
    'aufgegeben',
    'zu spät',
    'schuld',
    // Druck rund um Serie und Tagesziel (L7-01)
    'verfehlt',
    'nicht geschafft',
    'gerissen',
    'zurückgesetzt',
    'beeil',
    'letzte chance',
  ],
  tr: [
    'kaybet',
    'kaybol',
    'kaçırd',
    'kaçırma',
    'başarısız',
    'ceza',
    'utan',
    'hayal kırıklığı',
    'bozuldu',
    'vazgeç',
    // Druck rund um Serie und Tagesziel (L7-01)
    'kırıldı',
    'sıfırlandı',
    'acele et',
    'son şans',
  ],
  ar: [
    '\u062E\u0633\u0631',
    '\u0641\u0627\u062A\u0643',
    '\u0641\u0627\u062A\u062A',
    '\u0641\u0634\u0644',
    '\u0639\u0642\u0648\u0628',
    '\u062E\u064A\u0628',
    '\u0627\u0646\u0643\u0633\u0631',
    '\u0627\u0646\u0642\u0637\u0639',
    '\u0636\u0627\u0639',
    '\u0623\u0636\u0639\u062A',
  ],
};
/** Ganze Wörter (nicht „abgebrochen“ einer abgebrochenen Anmeldung) */
const VERBOTEN_WORT: Record<'de' | 'tr' | 'ar', RegExp | null> = {
  de: /(?<![\p{L}])gebrochen(?![\p{L}])/iu,
  tr: null,
  ar: null,
};

function texte(wert: unknown, pfad = ''): [string, string][] {
  if (typeof wert === 'string') return [[pfad, wert]];
  if (!wert || typeof wert !== 'object') return [];
  return Object.entries(wert).flatMap(([k, v]) => texte(v, pfad ? `${pfad}.${k}` : k));
}

describe('Sanfte Texte der Lern-App', () => {
  it.each(['de', 'tr', 'ar'] as const)('%s: keine Verlust-, Schuld- oder Strafwörter', (sprache) => {
    const alle = texte(JSON.parse(readFileSync(join(ORDNER, `${sprache}.json`), 'utf8')));
    expect(alle.length).toBeGreaterThan(200);
    const treffer = alle.filter(([, t]) => {
      const klein = t.toLocaleLowerCase(sprache);
      return VERBOTEN[sprache].some((w) => klein.includes(w)) || (VERBOTEN_WORT[sprache]?.test(t) ?? false);
    });
    // Ausgabe nur mit Schlüsseln (ohne arabische Schrift)
    expect(treffer.map(([k]) => k)).toEqual([]);
  });

  it('die Prüfung greift (Gegenprobe mit erfundenen Sätzen)', () => {
    const greift = (sprache: 'de' | 'tr' | 'ar', t: string) =>
      VERBOTEN[sprache].some((w) => t.toLocaleLowerCase(sprache).includes(w)) || (VERBOTEN_WORT[sprache]?.test(t) ?? false);
    expect(greift('de', 'Deine Serie ist verloren.')).toBe(true);
    expect(greift('de', 'Du hast gestern verpasst zu lernen.')).toBe(true);
    expect(greift('de', 'Serie gebrochen')).toBe(true);
    expect(greift('de', 'Die Anmeldung wurde abgebrochen.')).toBe(false);
    expect(greift('tr', 'Serini kaybettin.')).toBe(true);
    expect(greift('tr', 'Dünü kaçırdın.')).toBe(true);
    expect(greift('ar', VERBOTEN.ar[0]!)).toBe(true);
    expect(greift('de', 'Schön, dass du da bist.')).toBe(false);
    expect(greift('de', 'Tagesziel verfehlt.')).toBe(true);
    expect(greift('de', 'Beeil dich, sonst ist die Serie weg!')).toBe(true);
    expect(greift('tr', 'Serin sıfırlandı.')).toBe(true);
    expect(greift('de', 'Schön, dass du wieder da bist.')).toBe(false);
  });
});
