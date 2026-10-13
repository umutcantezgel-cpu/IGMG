import { describe, expect, it } from 'vitest';
import {
  abrufVeraltet,
  betrifftOeffentlich,
  gleicherInhalt,
  hadithKennung,
  ortKennung,
  prozent,
  statusNachSpeichern,
  tageSeit,
  uebergang,
  verschiebe,
  vierAugenErfuellt,
  zerlegeKennung,
} from '@/lib/religioes/freigabe';
import { bedeutungSchema, hadithNummer, statusSchema } from '@/lib/validierung/koran';

/** Religiöse Freigabe (ADR 0030): Status-Ablauf, Vier-Augen, Cache-Wirkung, Pflegepflicht, Listen, Kennungen. */
describe('statusNachSpeichern', () => {
  it('neu: Entwurf oder direkt zur Prüfung', () => {
    expect(statusNachSpeichern(null, true, false)).toBe('entwurf');
    expect(statusNachSpeichern(null, true, true)).toBe('zur_pruefung');
  });
  it('jede Änderung an „geprüft“ setzt auf „zur Prüfung“ zurück – auch ohne Einreichen', () => {
    expect(statusNachSpeichern('geprueft', true, false)).toBe('zur_pruefung');
    expect(statusNachSpeichern('geprueft', true, true)).toBe('zur_pruefung');
  });
  it('ohne Änderung bleibt der Stand; Entwurf lässt sich einreichen', () => {
    expect(statusNachSpeichern('geprueft', false, false)).toBe('geprueft');
    expect(statusNachSpeichern('geprueft', false, true)).toBe('geprueft');
    expect(statusNachSpeichern('entwurf', false, true)).toBe('zur_pruefung');
    expect(statusNachSpeichern('zur_pruefung', false, false)).toBe('zur_pruefung');
  });
  it('Änderung in Prüfung bleibt in Prüfung, Entwurf bleibt Entwurf', () => {
    expect(statusNachSpeichern('zur_pruefung', true, false)).toBe('zur_pruefung');
    expect(statusNachSpeichern('entwurf', true, false)).toBe('entwurf');
  });
});

describe('uebergang und Vier-Augen', () => {
  it('nur die vorgesehenen Schritte', () => {
    expect(uebergang('entwurf', 'zur_pruefung')).toBe('einreichen');
    expect(uebergang('zur_pruefung', 'geprueft')).toBe('freigeben');
    expect(uebergang('zur_pruefung', 'entwurf')).toBe('zurueckweisen');
    expect(uebergang('geprueft', 'entwurf')).toBe('zurueckweisen');
    expect(uebergang('entwurf', 'geprueft')).toBeNull();
    expect(uebergang('geprueft', 'zur_pruefung')).toBeNull();
    expect(uebergang('geprueft', 'geprueft')).toBeNull();
    expect(uebergang('entwurf', 'entwurf')).toBeNull();
  });
  it('wer verfasst hat, gibt nicht frei', () => {
    expect(vierAugenErfuellt('a', 'a')).toBe(false);
    expect(vierAugenErfuellt('a', 'b')).toBe(true);
    expect(vierAugenErfuellt(null, 'b')).toBe(true);
  });
});

describe('betrifftOeffentlich', () => {
  it('nur wenn „geprüft“ vorher oder nachher und sich etwas ändert', () => {
    expect(betrifftOeffentlich('entwurf', 'zur_pruefung')).toBe(false);
    expect(betrifftOeffentlich(null, 'entwurf')).toBe(false);
    expect(betrifftOeffentlich('zur_pruefung', 'geprueft')).toBe(true);
    expect(betrifftOeffentlich('geprueft', 'zur_pruefung')).toBe(true);
    expect(betrifftOeffentlich('geprueft', null)).toBe(true);
    expect(betrifftOeffentlich('geprueft', 'geprueft', false)).toBe(false);
    expect(betrifftOeffentlich('geprueft', 'geprueft', true)).toBe(true);
  });
});

describe('Pflegepflicht (90 Tage) und Fortschritt', () => {
  const abruf = new Date('2026-07-01T00:00:00Z');
  it('Grenze: genau 90 Tage ist noch aktuell, danach veraltet', () => {
    expect(abrufVeraltet(abruf, new Date('2026-09-29T00:00:00Z'))).toBe(false);
    expect(abrufVeraltet(abruf, new Date('2026-09-29T00:00:01Z'))).toBe(true);
    expect(tageSeit(abruf, new Date('2026-09-29T12:00:00Z'))).toBe(90);
    expect(tageSeit(abruf, new Date('2026-06-01T00:00:00Z'))).toBe(0);
  });
  it('Prozent: 0 bei leer, 100 nur bei vollständig', () => {
    expect(prozent(0, 0)).toBe(0);
    expect(prozent(5, 0)).toBe(0);
    expect(prozent(199, 200)).toBe(99);
    expect(prozent(200, 200)).toBe(100);
    expect(prozent(1, 3)).toBe(33);
  });
});

describe('Listen und Kennungen', () => {
  it('verschiebe: hoch, runter, Rand und unbekannt', () => {
    expect(verschiebe(['1', '2', '3'], '3', 'hoch')).toEqual(['1', '3', '2']);
    expect(verschiebe(['1', '2', '3'], '1', 'runter')).toEqual(['2', '1', '3']);
    expect(verschiebe(['1', '2', '3'], '1', 'hoch')).toEqual(['1', '2', '3']);
    expect(verschiebe(['1', '2', '3'], '3', 'runter')).toEqual(['1', '2', '3']);
    expect(verschiebe(['1', '2'], '9', 'hoch')).toEqual(['1', '2']);
  });
  it('Kennungen wie im Freigabe-Verlauf', () => {
    expect(ortKennung({ sure: 1, vers: 2, pos: 3, sprache: 'tr' })).toBe('1|2|3|tr');
    expect(hadithKennung({ sammlungId: 'bukhari', nummer: '402.2', sprache: 'de' })).toBe('bukhari|402.2|de');
    expect(zerlegeKennung('bukhari|402.2|de', 3)).toEqual(['bukhari', '402.2', 'de']);
    expect(zerlegeKennung('bukhari||de', 3)).toBeNull();
    expect(zerlegeKennung('a|b', 3)).toBeNull();
  });
  it('gleicherInhalt ignoriert Schlüsselreihenfolge und fehlende/null-Werte', () => {
    expect(gleicherInhalt({ de: 'a', tr: 'b' }, { tr: 'b', de: 'a' })).toBe(true);
    expect(gleicherInhalt({ de: 'a', tr: undefined }, { de: 'a' })).toBe(true);
    expect(gleicherInhalt({ wurzel: null }, {})).toBe(true);
    expect(gleicherInhalt({ de: 'a' }, { de: 'b' })).toBe(false);
    expect(gleicherInhalt({ doc: { content: [{ text: 'x' }] } }, { doc: { content: [{ text: 'y' }] } })).toBe(false);
  });
});

describe('Formularschemas', () => {
  it('Hadith-Nummer nur in der Schreibweise der Quelle', () => {
    for (const ok of ['1', '402.2', '7563']) expect(hadithNummer.safeParse(ok).success).toBe(true);
    for (const falsch of ['', 'x1', '1.', '1.234', '../1', '1 2']) expect(hadithNummer.safeParse(falsch).success).toBe(false);
  });
  it('Bedeutung: Pflichtfeld, Längen, Sprache de/tr, Einreichen über den Knopf', () => {
    expect(bedeutungSchema.safeParse({ formId: '3', sprache: 'de', bedeutung: '[x]', einreichen: '1' }).data).toMatchObject({
      formId: 3,
      einreichen: true,
      wurzel: '',
    });
    expect(bedeutungSchema.safeParse({ formId: '3', sprache: 'en', bedeutung: '[x]' }).success).toBe(false);
    expect(bedeutungSchema.safeParse({ formId: '3', sprache: 'de', bedeutung: 'x'.repeat(301) }).success).toBe(false);
  });
  it('Zurückweisen und Freigabe aufheben nur mit Grund', () => {
    expect(statusSchema.safeParse({ art: 'tajwid_regel', kennung: 'ikhfa', ziel: 'entwurf', grund: '' }).success).toBe(false);
    expect(statusSchema.safeParse({ art: 'tajwid_regel', kennung: 'ikhfa', ziel: 'entwurf', grund: '[Grund]' }).success).toBe(true);
    expect(statusSchema.safeParse({ art: 'tajwid_regel', kennung: 'ikhfa', ziel: 'geprueft' }).success).toBe(true);
    expect(statusSchema.safeParse({ art: 'fremd', kennung: 'x', ziel: 'geprueft' }).success).toBe(false);
  });
});
