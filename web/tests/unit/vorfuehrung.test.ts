import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IN_VORFUEHRUNG_AN, standardFuer } from '@/lib/funktionen-regeln';
import { darf } from '@/lib/rechte/matrix';
import { entpackeSchnappschuss, INHALT_DATEI, packeSchnappschuss } from '@/lib/vorfuehrung/entpacken';
import { kontoZuSchluessel, pruefeTestzugang, VORFUEHRUNG_KONTEN, VORFUEHRUNG_PASSWORT } from '@/lib/vorfuehrung/konten';
import { vorfuehrung, VORFUEHRUNG_SCHLUESSEL } from '@/lib/vorfuehrung/modus';

/** Vorführung mit Testzugang (ADR 0052): Kennzeichen, Testzugänge, Schalter und Schnappschuss der Datenbank. */
afterEach(() => vi.unstubAllEnvs());

describe('Kennzeichen der Vorführung', () => {
  it('nur mit VORFUEHRUNG=1 und ohne DATABASE_URL', () => {
    vi.stubEnv('VORFUEHRUNG', '');
    vi.stubEnv('DATABASE_URL', '');
    expect(vorfuehrung()).toBe(false);
    vi.stubEnv('VORFUEHRUNG', '1');
    expect(vorfuehrung()).toBe(true);
  });

  it('eine echte Datenbank bekommt nie den Testzugang', () => {
    vi.stubEnv('VORFUEHRUNG', '1');
    vi.stubEnv('DATABASE_URL', 'postgres://beispiel');
    expect(vorfuehrung()).toBe(false);
  });

  it('der feste Schlüssel ist 32 Byte lang', () => {
    expect(Buffer.from(VORFUEHRUNG_SCHLUESSEL, 'base64')).toHaveLength(32);
  });
});

describe('Testzugänge', () => {
  it('neun Benutzernamen: sechs Rollen der Verwaltung, drei Kontoarten in „Mein Bereich“', () => {
    expect(VORFUEHRUNG_KONTEN.map((k) => k.benutzername)).toEqual([
      'admin',
      'redaktion',
      'bildung',
      'vorstand',
      'imam',
      'mitglieder',
      'lehrkraft',
      'eltern',
      'kind',
    ]);
    expect(VORFUEHRUNG_KONTEN.filter((k) => k.bereich === 'verwaltung').every((k) => k.ziel === '/verwaltung')).toBe(true);
    expect(VORFUEHRUNG_KONTEN.filter((k) => k.bereich === 'mein-bereich').every((k) => k.ziel === '/mein-bereich')).toBe(true);
  });

  it('je Benutzername eigene Rechte: Die Rollen unterscheiden sich, und nur „admin“ darf Benutzer verwalten', () => {
    const verwaltung = VORFUEHRUNG_KONTEN.filter((k) => k.bereich === 'verwaltung');
    const rechte = (k: (typeof verwaltung)[number]) => k.rollen.map((rolle) => ({ rolle }));
    expect(new Set(verwaltung.map((k) => k.rollen.join('+'))).size).toBe(verwaltung.length);
    for (const k of verwaltung) {
      expect(darf(rechte(k), 'verwaltung.betreten'), k.benutzername).toBe(true);
      expect(darf(rechte(k), 'benutzer.einladen'), k.benutzername).toBe(k.schluessel === 'admin');
    }
    const konto = (s: string) => rechte(verwaltung.find((k) => k.schluessel === s)!);
    expect(darf(konto('redaktion'), 'nachricht.bearbeiten')).toBe(true);
    expect(darf(konto('redaktion'), 'lernende.lesen')).toBe(false);
    expect(darf(konto('bildung'), 'lernende.lesen')).toBe(true);
    expect(darf(konto('bildung'), 'nachricht.bearbeiten')).toBe(false);
    expect(darf(konto('vorstand'), 'leitung.lesen')).toBe(true);
    expect(darf(konto('vorstand'), 'nachricht.bearbeiten')).toBe(false);
    expect(darf(konto('imam'), 'religioes.freigeben')).toBe(true);
    expect(darf(konto('imam'), 'nachricht.bearbeiten')).toBe(false);
    expect(darf(konto('mitglieder'), 'eingang.mitgliedsantrag.lesen')).toBe(true);
    expect(darf(konto('mitglieder'), 'kurs.lesen')).toBe(false);
  });

  it('Benutzername ohne Rücksicht auf Schreibweise und Leerraum, Passwort genau', () => {
    expect(pruefeTestzugang('admin', VORFUEHRUNG_PASSWORT)?.schluessel).toBe('admin');
    expect(pruefeTestzugang('  Eltern ', VORFUEHRUNG_PASSWORT)?.schluessel).toBe('eltern');
    expect(pruefeTestzugang('IMAM', VORFUEHRUNG_PASSWORT)?.schluessel).toBe('imam');
    expect(pruefeTestzugang('admin', 'falsch')).toBeNull();
    expect(pruefeTestzugang('admin', ` ${VORFUEHRUNG_PASSWORT}`)).toBeNull();
    expect(pruefeTestzugang('unbekannt', VORFUEHRUNG_PASSWORT)).toBeNull();
    expect(pruefeTestzugang(null, null)).toBeNull();
  });

  it('der frühere Benutzername „verwaltung“ gilt weiter als „admin“', () => {
    expect(pruefeTestzugang('verwaltung', VORFUEHRUNG_PASSWORT)?.schluessel).toBe('admin');
    expect(kontoZuSchluessel('verwaltung')?.schluessel).toBe('admin');
  });

  it('Cookie-Wert: nur bekannte Schlüssel', () => {
    expect(kontoZuSchluessel('lehrkraft')?.schluessel).toBe('lehrkraft');
    expect(kontoZuSchluessel('administration')).toBeNull();
    expect(kontoZuSchluessel(undefined)).toBeNull();
  });
});

describe('Funktionsschalter in der Vorführung', () => {
  const produktion = { NODE_ENV: 'production', VERCEL_ENV: 'production' } as const;

  it('ohne Vorführung bleiben Konten in der Produktion aus', () => {
    vi.stubEnv('VORFUEHRUNG', '');
    expect(standardFuer(produktion, 'konten')).toBe(false);
  });

  it('in der Vorführung sind die Bereiche hinter der Anmeldung an, Echtzeit und Push nicht', () => {
    vi.stubEnv('VORFUEHRUNG', '1');
    vi.stubEnv('DATABASE_URL', '');
    for (const f of IN_VORFUEHRUNG_AN) expect(standardFuer(produktion, f), f).toBe(true);
    expect(standardFuer(produktion, 'echtzeit')).toBe(false);
    expect(standardFuer(produktion, 'push')).toBe(false);
  });
});

describe('Schnappschuss der Datenbank', () => {
  it('packen und entpacken ergibt dieselben Dateien samt leerer Ordner', () => {
    const basis = mkdtempSync(join(tmpdir(), 'igmg-schnappschuss-'));
    try {
      const quelle = join(basis, 'quelle');
      mkdirSync(join(quelle, 'base', '1'), { recursive: true });
      mkdirSync(join(quelle, 'pg_notify'), { recursive: true });
      writeFileSync(join(quelle, 'PG_VERSION'), '17\n');
      writeFileSync(join(quelle, 'base', '1', '2619'), Buffer.alloc(8192, 7));
      const inhalt = packeSchnappschuss(quelle, join(basis, 'gepackt'));
      expect(inhalt.dateien).toEqual(['PG_VERSION', 'base/1/2619']);
      expect(inhalt.verzeichnisse).toEqual(['base', 'base/1', 'pg_notify']);
      expect(entpackeSchnappschuss(join(basis, 'gepackt'), join(basis, 'ziel'))).toBe(2);
      expect(readFileSync(join(basis, 'ziel', 'PG_VERSION'), 'utf8')).toBe('17\n');
      expect(readFileSync(join(basis, 'ziel', 'base', '1', '2619')).equals(Buffer.alloc(8192, 7))).toBe(true);
      expect(() => readFileSync(join(basis, 'ziel', 'pg_notify', 'x'))).toThrow(/ENOENT/);
    } finally {
      rmSync(basis, { recursive: true, force: true });
    }
  });

  it('Pfade, die aus dem Ziel hinausführen, brechen ab', () => {
    const basis = mkdtempSync(join(tmpdir(), 'igmg-schnappschuss-'));
    try {
      mkdirSync(join(basis, 'gepackt'), { recursive: true });
      writeFileSync(join(basis, 'gepackt', INHALT_DATEI), JSON.stringify({ verzeichnisse: ['../raus'], dateien: [] }));
      expect(() => entpackeSchnappschuss(join(basis, 'gepackt'), join(basis, 'ziel'))).toThrow(/ungültiger Pfad/);
    } finally {
      rmSync(basis, { recursive: true, force: true });
    }
  });
});
