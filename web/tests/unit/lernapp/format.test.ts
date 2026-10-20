import { createTranslator } from 'next-intl';
import { describe, expect, it } from 'vitest';
import ar from '../../../messages/lernapp/ar.json';
import de from '../../../messages/lernapp/de.json';
import tr from '../../../messages/lernapp/tr.json';
import { formatiere, intlSprache } from '@/lib/lernapp/format';

/**
 * Teilformatierer der Lern-App (ADR 0037 Nr. 5, PLAN §3.3): Jede Nachricht aus `messages/lernapp/*.json` ergibt mit
 * `formatiere` denselben Text wie `createTranslator` – mit Zahlen für alle Pluralkategorien (Arabisch: zero, one, two,
 * few, many, other) und in der arabischen Oberfläche mit östlich-arabischen und westlichen Ziffern.
 */
type Baum = { [k: string]: string | Baum };
function flach(baum: Baum, praefix = ''): [string, string][] {
  return Object.entries(baum).flatMap(([k, v]) =>
    typeof v === 'string' ? [[`${praefix}${k}`, v] as [string, string]] : flach(v, `${praefix}${k}.`),
  );
}

const ZAHLEN = [0, 1, 2, 3, 11, 100, 1234];
const SPRACHEN: [string, Baum][] = [
  ['de', de],
  ['tr', tr],
  [intlSprache('ar', 'arab'), ar],
  [intlSprache('ar', 'latn'), ar],
];

/** Argumente einer Nachricht: Name → Zahl (plural, number) oder Text. */
function argumente(nachricht: string): Map<string, 'zahl' | 'text'> {
  const aus = new Map<string, 'zahl' | 'text'>();
  for (const m of nachricht.matchAll(/\{\s*(\w+)\s*(?:,\s*(\w+))?/g)) {
    const art = m[2] === 'plural' || m[2] === 'number' ? 'zahl' : 'text';
    if (aus.get(m[1]) !== 'zahl') aus.set(m[1], art);
  }
  return aus;
}

describe('Teilformatierer gleich createTranslator', () => {
  it('die Prüfung greift (Nachrichten mit Plural und Zahl vorhanden)', () => {
    const alle = flach(de as Baum).map(([, v]) => v);
    expect(alle.length).toBeGreaterThan(100);
    expect(alle.some((v) => v.includes(', plural,'))).toBe(true);
    expect(alle.some((v) => v.includes(', number}'))).toBe(true);
  });

  for (const [sprache, nachrichten] of SPRACHEN) {
    it(`${sprache}: jede Nachricht, jede Zahl`, () => {
      const t = createTranslator({ locale: sprache, messages: nachrichten });
      for (const [schluessel, nachricht] of flach(nachrichten)) {
        const args = argumente(nachricht);
        const varianten = [...args.values()].includes('zahl') ? ZAHLEN : [1];
        for (const n of varianten) {
          const werte = Object.fromEntries([...args].map(([name, art]) => [name, art === 'zahl' ? n : 'Probe']));
          // @ts-expect-error – Schlüssel aus den Dateien, Werte passend zu den Platzhaltern
          expect(formatiere(nachricht, werte, sprache), `${sprache} ${schluessel} n=${n}`).toBe(t(schluessel, werte));
        }
      }
    });
  }

  it('Ziffern: ar östlich-arabisch (Standard) oder westlich; de/tr ohne Zahlensystem', () => {
    expect(intlSprache('ar')).toBe('ar-u-nu-arab');
    expect(intlSprache('ar', 'latn')).toBe('ar-u-nu-latn');
    expect(intlSprache('de', 'arab')).toBe('de');
    expect(intlSprache('tr')).toBe('tr');
    // U+0661 U+0662 U+0663 (östlich-arabisch) als Codepunkte (keine arabische Schrift im Quelltext, KERN 4.0 §3)
    expect(formatiere('{n, number}', { n: 123 }, 'ar-u-nu-arab')).toBe(String.fromCodePoint(0x661, 0x662, 0x663));
    expect(formatiere('{n, number}', { n: 123 }, 'ar-u-nu-latn')).toBe('123');
  });

  it('verschachtelt, exakte Auswahl vor Kategorie, # nur im Zweig, Apostroph wie ICU', () => {
    const n = '{n, plural, =0 {nichts} one {# Ding von {gesamt, number}} other {# Dinge}}';
    expect(formatiere(n, { n: 0, gesamt: 5 }, 'de')).toBe('nichts');
    expect(formatiere(n, { n: 1, gesamt: 5 }, 'de')).toBe('1 Ding von 5');
    expect(formatiere(n, { n: 1234, gesamt: 5 }, 'de')).toBe('1.234 Dinge');
    expect(formatiere("Kur'an {x}", { x: 'a' }, 'tr')).toBe("Kur'an a");
    expect(formatiere("a''b", {}, 'de')).toBe("a'b");
    expect(formatiere('ohne # Raute', {}, 'de')).toBe('ohne # Raute');
  });
});
