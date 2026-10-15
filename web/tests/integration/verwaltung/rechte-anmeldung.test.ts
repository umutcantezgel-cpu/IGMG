import { afterAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { verwaltungsUmgebung } from '../hilfen/verwaltung';
import { ANMELDUNG_AKTIONEN, anmelden, ausgang, formular, ladeAktionen, PERSONEN, type Person } from './rechte-hilfen';

/**
 * Anmeldung, Zwei-Faktor-Einrichtung, Einladung, Passwort und Abmelden (Paket C17, Z-06). Diese Actions sind nicht durch
 * die Rechte-Matrix geschützt: Die Anmeldung braucht keine Sitzung, die Einrichtung des zweiten Faktors braucht nur eine
 * Sitzung ohne zweiten Faktor (K-06), Abmelden funktioniert immer. Geprüft wird daher, dass die Rolle keinen Unterschied
 * macht, und dass die Weiterleitungen stimmen.
 */
const { client, db } = await verwaltungsUmgebung();
afterAll(() => client.close());

// Die Testhilfe bildet nur die Sitzungsabfrage nach. Für Abmelden genügt eine Attrappe des Abmeldeaufrufs.
const { auth } = await import('@/lib/auth/server');
(auth.api as unknown as Record<string, unknown>).signOut = async () => ({ success: true });

type Aktionen = Awaited<ReturnType<typeof ladeAktionen>>;

const anzahlAudit = async () => (await db.select().from(schema.auditEintrag)).length;

/** Öffentliche Schritte ohne gültige Eingabe: Antwort und Abbruch sind für jede Person gleich, ohne Schreiben. */
const OEFFENTLICH: { aktion: string; aufruf: (a: Aktionen) => Promise<unknown>; erwartet: Record<string, unknown> }[] = [
  {
    aktion: 'anmelden',
    aufruf: (a) => a.anmeldung.anmelden({}, formular({})),
    erwartet: { fehler: 'anmelden.fehler' },
  },
  {
    aktion: 'zweiFaktorPruefen',
    aufruf: (a) => a.anmeldung.zweiFaktorPruefen({}, formular({})),
    erwartet: { feldFehler: { code: 'zweiFaktor.fehler' } },
  },
  {
    aktion: 'einladungAnnehmen',
    aufruf: (a) => a.anmeldung.einladungAnnehmen({}, formular({})),
    erwartet: { fehler: 'einladung.ungueltig' },
  },
  {
    aktion: 'passwortVergessen',
    aufruf: (a) => a.anmeldung.passwortVergessen({}, formular({})),
    erwartet: { feldFehler: { email: 'passwortVergessen.fehlerEmail' } },
  },
  {
    aktion: 'passwortNeuSetzen',
    aufruf: (a) => a.anmeldung.passwortNeuSetzen({}, formular({})),
    erwartet: { fehler: 'passwortNeu.ungueltig' },
  },
];

describe('öffentliche Anmeldeschritte: nicht rollengeschützt', () => {
  for (const f of OEFFENTLICH) {
    for (const p of PERSONEN) {
      it(`${f.aktion} · ${p.name}: Eingabeprüfung ohne Rechteprüfung und ohne Schreiben`, async () => {
        await anmelden(p);
        const vorher = await anzahlAudit();
        const a = await ausgang(async () => f.aufruf(await ladeAktionen()));
        expect(a.kein, 'Öffentlicher Anmeldeschritt darf nicht mit KEIN_RECHT abbrechen').toBeUndefined();
        expect(a.fehler, 'Unerwarteter Fehler').toBeUndefined();
        expect(a.wert).toMatchObject(f.erwartet);
        expect(await anzahlAudit(), 'Ohne gültige Eingabe darf nichts protokolliert werden').toBe(vorher);
      });
    }
  }
});

/** Zwei-Faktor-Einrichtung: ohne Sitzung zur Anmeldung, mit Sitzung ohne zweiten Faktor die Eingabeprüfung. */
const EINRICHTUNG: { aktion: string; aufruf: (a: Aktionen) => Promise<unknown>; erwartet: Record<string, unknown> }[] = [
  {
    aktion: 'zweiFaktorStarten',
    aufruf: (a) => a.anmeldung.zweiFaktorStarten({}, formular({})),
    erwartet: { feldFehler: { passwort: 'zweiFaktorEinrichten.fehlerPasswort' } },
  },
  {
    aktion: 'zweiFaktorBestaetigen',
    aufruf: (a) => a.anmeldung.zweiFaktorBestaetigen({}, formular({})),
    erwartet: { feldFehler: { code: 'zweiFaktorEinrichten.fehlerCode' } },
  },
];

/** Sitzungen ohne zweiten Faktor: die Einrichtung ist genau dafür da (K-06 „Einrichtung ist Pflicht“). */
const OHNE_ZWEITEN_FAKTOR: Person[] = [
  { name: 'Redaktion ohne zweiten Faktor', rollen: [{ rolle: 'redaktion' }], zweiFaktor: false },
  { name: 'Administration ohne zweiten Faktor', rollen: [{ rolle: 'administration' }], zweiFaktor: false },
];

/**
 * S3: Die Einrichtung unter /verwaltung gilt nur für Konten der Verwaltung (Rolle oder offener Antrag auf eine
 * Schutzrolle). Ein Konto ohne jede Verwaltungsrolle (z. B. Gemeinde-Konto) richtet den zweiten Faktor im eigenen
 * Bereich ein und wird hier zur Anmeldung geschickt.
 */
const OHNE_VERWALTUNGSROLLE: Person = { name: 'ohne Rolle und ohne zweiten Faktor', rollen: [], zweiFaktor: false };

describe('Zwei-Faktor-Einrichtung', () => {
  for (const f of EINRICHTUNG) {
    it(`${f.aktion} · ohne Sitzung: Weiterleitung zur Anmeldung`, async () => {
      await anmelden({ name: 'ohne Sitzung', rollen: null, zweiFaktor: true });
      const a = await ausgang(async () => f.aufruf(await ladeAktionen()));
      expect(a.weiter, 'Ohne Sitzung muss zur Anmeldung weitergeleitet werden').toBe('/verwaltung/anmelden');
    });

    for (const p of OHNE_ZWEITEN_FAKTOR) {
      it(`${f.aktion} · ${p.name}: Einrichtung ist erreichbar, Eingabe wird geprüft`, async () => {
        await anmelden(p);
        const a = await ausgang(async () => f.aufruf(await ladeAktionen()));
        expect(a.weiter, 'Mit Sitzung darf keine Weiterleitung erfolgen').toBeUndefined();
        expect(a.kein, 'Die Einrichtung braucht keine Rolle').toBeUndefined();
        expect(a.wert).toMatchObject(f.erwartet);
      });
    }

    it(`${f.aktion} · ${OHNE_VERWALTUNGSROLLE.name}: Weiterleitung zur Anmeldung (S3)`, async () => {
      await anmelden(OHNE_VERWALTUNGSROLLE);
      const a = await ausgang(async () => f.aufruf(await ladeAktionen()));
      expect(a.weiter, 'Ohne Verwaltungsrolle keine Einrichtung unter /verwaltung').toBe('/verwaltung/anmelden');
    });
  }
});

describe('Abmelden', () => {
  for (const p of PERSONEN) {
    it(`abmelden · ${p.name}: leitet zur Anmeldung weiter`, async () => {
      await anmelden(p);
      const vorher = await anzahlAudit();
      const a = await ausgang(async () => (await ladeAktionen()).anmeldung.abmelden());
      expect(a.weiter).toBe('/verwaltung/anmelden?abgemeldet=1');
      // Mit Sitzung wird der Abmeldevorgang protokolliert, ohne Sitzung nicht.
      expect(await anzahlAudit()).toBe(p.rollen === null ? vorher : vorher + 1);
    });
  }
});

describe('Vollständigkeit der Anmeldung', () => {
  it('deckt alle Anmelde-Actions ab', () => {
    const geprueft = [
      ...OEFFENTLICH.map((f) => `anmeldung.${f.aktion}`),
      ...EINRICHTUNG.map((f) => `anmeldung.${f.aktion}`),
      'anmeldung.abmelden',
    ].sort();
    expect(geprueft).toEqual([...ANMELDUNG_AKTIONEN].sort());
  });
});
