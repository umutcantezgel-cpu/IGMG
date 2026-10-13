import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { bereicheFuer } from '@/components/mein-bereich/eintraege';
import { BENUTZERNAME_MAX, pruefeBenutzername } from '@/lib/konto/benutzername';
import { KONTO_EINWILLIGUNG_VERSION, leseTextVersion, textVersion } from '@/lib/konto/einwilligung';
import { geraetAus } from '@/lib/konto/geraet';
import { leseLesezeichen, ohneLesezeichen } from '@/lib/konto/lesezeichen';
import { passwortStaerke } from '@/lib/konto/passwort-staerke';
import { anzeigenameAus, istKinderAdresse, sichererRuecksprung, synthetischeAdresse, vornameAus } from '@/lib/konto/regeln';
import { istUnzustellbar } from '@/lib/mail/adresse';
import { kontoSpracheAusLink } from '@/lib/mail/konto-vorlagen';

/** Reine Regeln der Gemeinde-Konten (ADR 0026): Benutzernamen, `.invalid`, Einwilligungs-Hash, Rücksprung, Hinweise. */
describe('Benutzernamen der Kinderkonten', () => {
  it('gültig: 4–32 Zeichen a–z, 0–9, Punkt, Unterstrich; normalisiert auf Kleinbuchstaben ohne Leerraum', () => {
    expect(pruefeBenutzername('kind.beispiel')).toEqual({ ok: true, wert: 'kind.beispiel' });
    expect(pruefeBenutzername('  Kind_Eins2 ')).toEqual({ ok: true, wert: 'kind_eins2' });
    expect(pruefeBenutzername('abcd')).toEqual({ ok: true, wert: 'abcd' });
    expect(pruefeBenutzername('a'.repeat(BENUTZERNAME_MAX))).toMatchObject({ ok: true });
  });

  it('Länge', () => {
    expect(pruefeBenutzername('abc')).toEqual({ ok: false, fehler: 'kurz' });
    expect(pruefeBenutzername('   ')).toEqual({ ok: false, fehler: 'kurz' });
    expect(pruefeBenutzername('a'.repeat(BENUTZERNAME_MAX + 1))).toEqual({ ok: false, fehler: 'lang' });
  });

  it.each(['kind-test', 'kind test', 'kınd', 'käse', '.kind', 'kind.', '_kind', 'kind..x', 'kind._x', 'k@nd', 'ab/cd'])(
    'ungültige Zeichen oder Form: %s',
    (name) => {
      expect(pruefeBenutzername(name)).toEqual({ ok: false, fehler: 'zeichen' });
    },
  );
});

describe('Synthetische Adressen und Zustellbarkeit (`.invalid` wird abgewiesen)', () => {
  it('synthetische Adresse k-<zufall>@konto.invalid', () => {
    const a = synthetischeAdresse('0123456789abcdef0123');
    expect(a).toBe('k-0123456789abcdef0123@konto.invalid');
    expect(istKinderAdresse(a)).toBe(true);
    expect(istKinderAdresse('Person@Example.test')).toBe(false);
    expect(() => synthetischeAdresse('kurz')).toThrow();
  });

  it.each([
    ['k-0123456789abcdef@konto.invalid', true],
    ['gemeinde@beispiel.invalid', true],
    ['GEMEINDE@BEISPIEL.INVALID', true],
    ['person@beispiel.invalid.', true],
    ['Testperson <k-1@konto.invalid>', true],
    ['person@invalid', true],
    ['keine-adresse', true],
    ['person@', true],
    ['testperson.eins@example.test', false],
    ['person@invalid.de', false],
    ['Testperson <person@example.test>', false],
  ])('%s → unzustellbar %s', (adresse, erwartet) => {
    expect(istUnzustellbar(adresse)).toBe(erwartet);
  });
});

describe('Textversion der Einwilligung (Version + SHA-256 des Wortlauts)', () => {
  it('Format, Prüfvektor und Empfindlichkeit für ein einzelnes Zeichen', () => {
    expect(textVersion('1', 'abc')).toBe('1+sha256:ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    const v = textVersion(KONTO_EINWILLIGUNG_VERSION, 'Ich willige ein.');
    expect(v).toMatch(/^2026-10\+sha256:[0-9a-f]{64}$/);
    expect(v).toBe(textVersion(KONTO_EINWILLIGUNG_VERSION, 'Ich willige ein.'));
    expect(v).not.toBe(textVersion(KONTO_EINWILLIGUNG_VERSION, 'Ich willige ein!'));
    expect(leseTextVersion(v)).toEqual({
      version: '2026-10',
      sha256: createHash('sha256').update('Ich willige ein.', 'utf8').digest('hex'),
    });
    expect(leseTextVersion('ohne-hash')).toBeNull();
  });
});

describe('Anzeigename, Rücksprung, Gerät, Passwortstärke', () => {
  it('Anzeigename = Vorname + Initial (S-14)', () => {
    expect(anzeigenameAus('Testperson Eins')).toBe('Testperson E.');
    expect(anzeigenameAus('  Ali   Veli  Yılmaz ')).toBe('Ali Y.');
    expect(anzeigenameAus('ömer özdemir')).toBe('ömer Ö.');
    expect(anzeigenameAus('Ayşe')).toBe('Ayşe');
    expect(anzeigenameAus('')).toBe('');
    expect(vornameAus('Testperson E.')).toBe('Testperson');
  });

  it('Rücksprung nur auf eigene Konto-Seiten (keine offene Weiterleitung)', () => {
    expect(sichererRuecksprung('/einladung/abc_DEF-123')).toBe('/einladung/abc_DEF-123');
    expect(sichererRuecksprung('/tr/davet/abc')).toBe('/tr/davet/abc');
    expect(sichererRuecksprung('/mein-bereich/konto')).toBe('/mein-bereich/konto');
    for (const boese of ['//evil.example', 'https://evil.example/einladung/x', '/kontakt', '/einladung/../verwaltung', '/\\evil', '', 5, null]) {
      expect(sichererRuecksprung(boese)).toBeNull();
    }
  });

  it('Gerät aus dem User-Agent (nur Browser- und Systemfamilie)', () => {
    expect(geraetAus('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36')).toEqual({
      browser: 'Chrome',
      system: 'Windows',
    });
    expect(geraetAus('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1')).toEqual({
      browser: 'Safari',
      system: 'iOS',
    });
    expect(geraetAus('Mozilla/5.0 (Android 14; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0')).toEqual({ browser: 'Firefox', system: 'Android' });
    expect(geraetAus('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/140.0 Safari/537.36 Edg/140.0')).toMatchObject({ browser: 'Edge' });
    expect(geraetAus(null)).toEqual({ browser: null, system: null });
  });

  it('Passwortstärke: unter 12 Zeichen 0, Länge zählt am meisten, Muster ziehen ab', () => {
    expect(passwortStaerke('kurz')).toBe(0);
    expect(passwortStaerke('abcdefghijkm')).toBe(1);
    expect(passwortStaerke('sonne baum himmel')).toBe(2);
    expect(passwortStaerke('Sonne, Baum und Himmel 7')).toBe(3);
    expect(passwortStaerke('Passwort-1234!')).toBe(1);
  });
});

describe('Lesezeichen im Gerätespeicher (igmg.quran.lesezeichen)', () => {
  it('prüft, sortiert (neueste zuerst) und entfernt', () => {
    const roh = JSON.stringify([
      { sure: 2, vers: 255, zeit: '2026-10-10T18:30:00Z' },
      { sure: 115, vers: 1, zeit: '2026-10-11T00:00:00Z' },
      { sure: 1, vers: 0, zeit: '2026-10-11T00:00:00Z' },
      { sure: 18, vers: 10, zeit: 1791900000000 },
      { sure: 3, vers: 1, zeit: 'kein Datum' },
      'Unsinn',
    ]);
    const liste = leseLesezeichen(roh);
    expect(liste.map((z) => `${z.sure}:${z.vers}`)).toEqual(['18:10', '2:255']);
    expect(ohneLesezeichen(liste, liste[0])).toEqual([liste[1]]);
    expect(leseLesezeichen('{kaputt')).toEqual([]);
    expect(leseLesezeichen('{"sure":1}')).toEqual([]);
    expect(leseLesezeichen(null)).toEqual([]);
  });
});

describe('Mails und Navigation', () => {
  it('Passwort-Link: Verwaltung → deutsche Verwaltungsmail, sonst Konto-Mail in der Sprache des Rücksprungs', () => {
    const link = (ziel: string) => `http://localhost/api/auth/reset-password/abc?callbackURL=${encodeURIComponent(ziel)}`;
    expect(kontoSpracheAusLink(link('http://localhost/verwaltung/passwort-neu'))).toBeNull();
    expect(kontoSpracheAusLink(link('http://localhost/de/verwaltung/passwort-neu'))).toBeNull();
    expect(kontoSpracheAusLink(link('http://localhost/passwort-neu'))).toBe('de');
    expect(kontoSpracheAusLink(link('http://localhost/tr/yeni-sifre'))).toBe('tr');
    expect(kontoSpracheAusLink(link('http://localhost/en/new-password'))).toBe('en');
    expect(kontoSpracheAusLink('http://localhost/x')).toBeNull();
    expect(kontoSpracheAusLink('kein link')).toBeNull();
    expect(kontoSpracheAusLink(undefined)).toBeNull();
  });

  it('Bereiche je Kontoart; Kinder ohne Benachrichtigungen', () => {
    const schluessel = (r: Parameters<typeof bereicheFuer>[0], kind = false) => bereicheFuer(r, kind).map((b) => b.schluessel);
    expect(schluessel(['gemeinde'])).toEqual(['start', 'lesezeichen', 'benachrichtigungen', 'konto']);
    expect(schluessel(['gemeinde', 'eltern'])).toEqual(['start', 'kinder', 'lesezeichen', 'benachrichtigungen', 'konto']);
    expect(schluessel(['lehrkraft'])).toContain('unterricht');
    expect(schluessel(['schueler'], true)).toEqual(['start', 'lernweg', 'gruppe', 'lesezeichen', 'konto']);
  });
});
