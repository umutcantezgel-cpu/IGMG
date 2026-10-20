import { describe, expect, it } from 'vitest';
import { AKTIONEN, MATRIX, ROLLEN, darf, organisationsFilter, type Aktion, type RollenZuweisung, type Ziel } from '@/lib/rechte/matrix';

/**
 * Negativfälle der Rechte-Matrix (K-06): Was eine Rolle nicht darf, Konten ohne Rolle, unbekannte Eingaben
 * und die Bindung an die eigene Organisation. Die Fachbereichs-Listen unten folgen dem Rollenzuschnitt aus K-06
 * und sind bewusst nicht aus MATRIX abgeleitet.
 */

const ORGANISATIONEN = ['at', 'kt', 'gt', 'kgt'] as const;

/** Aktionen, die K-06 auf die eigene Organisation begrenzt (Veranstaltungen, Nachrichten, Ankündigungen, Organisationsinhalte, Anmeldungen). */
const ORGANISATIONSGEBUNDEN: readonly Aktion[] = [
  'veranstaltung.bearbeiten',
  'veranstaltung.loeschen',
  'nachricht.bearbeiten',
  'nachricht.loeschen',
  'ankuendigung.bearbeiten',
  'ankuendigung.loeschen',
  'organisationsinhalt.bearbeiten',
  'eingang.veranstaltungsanmeldung.lesen',
  'eingang.veranstaltungsanmeldung.bearbeiten',
];

/** Gibt die Aktionen zurück, die eine einzelne Rolle ohne Ziel trotzdem ausführen dürfte. Leer heißt: nichts Verbotenes erlaubt. */
function erlaubteVerbote(rolle: RollenZuweisung, aktionen: readonly Aktion[]): Aktion[] {
  return aktionen.filter((aktion) => darf([rolle], aktion));
}

describe('Rechte-Matrix: Negativfälle (K-06)', () => {
  it('jede Aktion, die laut MATRIX nicht erlaubt ist, liefert darf() === false', () => {
    const ziele: (Ziel | undefined)[] = [undefined, { organisation: null }, { organisation: 'at' }];
    const verstoesse: string[] = [];
    let geprueft = 0;
    for (const rolle of ROLLEN) {
      const zuweisungen: RollenZuweisung[] = [{ rolle }, { rolle, organisation: 'gt' }];
      for (const aktion of AKTIONEN) {
        if (MATRIX[rolle].has(aktion)) continue;
        for (const zuweisung of zuweisungen) {
          for (const ziel of ziele) {
            geprueft++;
            if (darf([zuweisung], aktion, ziel)) verstoesse.push(`${rolle}/${aktion}/${JSON.stringify(ziel)}`);
          }
        }
      }
    }
    expect(geprueft).toBeGreaterThan(0);
    expect(verstoesse).toEqual([]);
  });

  it('unbekannte Rolle und unbekannte Aktion liefern false', () => {
    expect(darf([{ rolle: 'superuser' as never }], 'veranstaltung.lesen')).toBe(false);
    expect(darf([{ rolle: 'administration' }], 'veranstaltung.loeschen_alles' as never)).toBe(false);
    expect(darf([{ rolle: 'redaktion' }], 'unbekannt' as never, { organisation: 'gt' })).toBe(false);
    expect(organisationsFilter([{ rolle: 'superuser' as never }], 'veranstaltung.bearbeiten')).toEqual([]);
  });

  it('Rollennamen wie „constructor“, „toString“ oder „__proto__“ liefern darf() === false, ohne zu werfen', () => {
    for (const rolle of ['constructor', 'toString', '__proto__']) {
      expect(darf([{ rolle: rolle as never }], 'verwaltung.betreten')).toBe(false);
    }
  });

  it('Rollennamen wie „constructor“, „toString“ oder „__proto__“ ergeben eine leere organisationsFilter-Liste, ohne zu werfen', () => {
    for (const rolle of ['constructor', 'toString', '__proto__']) {
      expect(organisationsFilter([{ rolle: rolle as never }], 'veranstaltung.bearbeiten')).toEqual([]);
    }
  });

  it('ein Konto ohne Rolle darf nichts, auch nicht mit Ziel, und erhält keine Organisationsliste', () => {
    for (const aktion of AKTIONEN) {
      expect(darf([], aktion)).toBe(false);
      expect(darf([], aktion, { organisation: 'gt' })).toBe(false);
      expect(organisationsFilter([], aktion)).toEqual([]);
    }
  });
});

describe('Rollen und ihre Fachbereiche (K-06)', () => {
  it('Bildung bearbeitet keine Veranstaltungen, Nachrichten, Ankündigungen oder Gebetszeiten und sieht keine Anträge', () => {
    expect(
      erlaubteVerbote({ rolle: 'bildung' }, [
        'veranstaltung.bearbeiten',
        'veranstaltung.loeschen',
        'nachricht.bearbeiten',
        'ankuendigung.bearbeiten',
        'gebetszeiten.bearbeiten',
        'seiteninhalt.bearbeiten',
        'eingang.kontakt.lesen',
        'eingang.mitgliedsantrag.lesen',
        'eingang.veranstaltungsanmeldung.lesen',
        'benutzer.einladen',
        'audit.lesen',
      ]),
    ).toEqual([]);
  });

  it('Mitgliederverwaltung sieht nur Anträge, keine Kurse, Voranmeldungen, Kontakte oder Inhalte', () => {
    expect(
      erlaubteVerbote({ rolle: 'mitgliederverwaltung' }, [
        'kurs.lesen',
        'kurs.bearbeiten',
        'eingang.voranmeldung.lesen',
        'eingang.kontakt.lesen',
        'eingang.veranstaltungsanmeldung.lesen',
        'veranstaltung.bearbeiten',
        'seiteninhalt.bearbeiten',
        'gebetszeiten.bearbeiten',
        'medium.hochladen',
        'benutzer.einladen',
        'audit.lesen',
      ]),
    ).toEqual([]);
  });

  it('Redaktion verwaltet keine Benutzer, kein Audit-Log, keine Kurse und keine Anträge', () => {
    expect(
      erlaubteVerbote({ rolle: 'redaktion' }, [
        'benutzer.einladen',
        'benutzer.bearbeiten',
        'audit.lesen',
        'kurs.bearbeiten',
        'eingang.voranmeldung.bearbeiten',
        'eingang.mitgliedsantrag.bearbeiten',
      ]),
    ).toEqual([]);
  });

  it('Organisationsredaktion verwaltet keine Seiten, Gebetszeiten, Kurse, Anträge, Benutzer oder Audit-Log', () => {
    expect(
      erlaubteVerbote({ rolle: 'organisationsredaktion', organisation: 'gt' }, [
        'seiteninhalt.bearbeiten',
        'gebetszeiten.bearbeiten',
        'kurs.bearbeiten',
        'eingang.voranmeldung.lesen',
        'eingang.mitgliedsantrag.lesen',
        'benutzer.einladen',
        'audit.lesen',
      ]),
    ).toEqual([]);
  });

  it('Sprachprüfung (Lern-App) sieht weder Inhalte der Website noch Eingänge, Personen, Freigaben oder Lern-App-Redaktion', () => {
    expect(
      erlaubteVerbote({ rolle: 'sprachpruefung' }, [
        'veranstaltung.bearbeiten',
        'nachricht.bearbeiten',
        'seiteninhalt.bearbeiten',
        'kurs.lesen',
        'gruppe.lesen',
        'lernende.lesen',
        'eingang.voranmeldung.lesen',
        'eingang.kontakt.lesen',
        'gemeindekonto.lesen',
        'freigabe.lesen',
        'religioes.freigeben',
        'meldung.chat.lesen',
        'medium.hochladen',
        'lernapp.bearbeiten',
        'lernapp.veroeffentlichen',
        'lernapp.religioes.pruefen',
        'lernapp.audio.bearbeiten',
        'lernapp.statistik.lesen',
        'benutzer.einladen',
        'audit.lesen',
        'einstellung.bearbeiten',
        'funktion.schalten',
      ]),
    ).toEqual([]);
  });

  it('Benutzerverwaltung und Audit-Log sind nur der Administration vorbehalten', () => {
    for (const rolle of ROLLEN) {
      const erwartet = rolle === 'administration';
      for (const aktion of ['benutzer.lesen', 'benutzer.einladen', 'benutzer.bearbeiten', 'audit.lesen'] as const) {
        expect(darf([{ rolle }], aktion)).toBe(erwartet);
      }
    }
  });
});

describe('Organisationsredaktion: nur die eigene Organisation (K-06)', () => {
  it('ändert keine Inhalte einer fremden Organisation und keine allgemeinen Inhalte, die eigenen dagegen schon', () => {
    const ziele: Ziel[] = [{ organisation: null }, ...ORGANISATIONEN.map((organisation) => ({ organisation }))];
    const verstoesse: string[] = [];
    for (const eigene of ORGANISATIONEN) {
      expect(darf([{ rolle: 'organisationsredaktion', organisation: eigene }], 'nachricht.bearbeiten', { organisation: eigene })).toBe(
        true,
      );
      for (const ziel of ziele) {
        if (ziel.organisation === eigene) continue;
        for (const aktion of ORGANISATIONSGEBUNDEN) {
          if (darf([{ rolle: 'organisationsredaktion', organisation: eigene }], aktion, ziel)) {
            verstoesse.push(`${eigene}/${JSON.stringify(ziel)}/${aktion}`);
          }
        }
      }
    }
    expect(verstoesse).toEqual([]);
  });

  it('ohne zugeordnete Organisation ändert sie keine organisationsgebundenen Inhalte, auch nicht mit beliebigem Ziel', () => {
    const ohneOrganisation: RollenZuweisung[][] = [
      [{ rolle: 'organisationsredaktion' }],
      [{ rolle: 'organisationsredaktion', organisation: null }],
    ];
    const ziele: Ziel[] = [{}, { organisation: null }, ...ORGANISATIONEN.map((organisation) => ({ organisation }))];
    for (const rollen of ohneOrganisation) {
      for (const aktion of ORGANISATIONSGEBUNDEN) {
        for (const ziel of ziele) expect(darf(rollen, aktion, ziel)).toBe(false);
        expect(organisationsFilter(rollen, aktion)).toEqual([]);
      }
    }
  });

  it('Listenansicht ohne Ziel bleibt nur lesend, die gefilterte Liste ist ohne Organisation leer', () => {
    const rollen: RollenZuweisung[] = [{ rolle: 'organisationsredaktion' }];
    expect(darf(rollen, 'eingang.veranstaltungsanmeldung.lesen')).toBe(true);
    expect(darf(rollen, 'eingang.veranstaltungsanmeldung.bearbeiten')).toBe(false);
    expect(organisationsFilter(rollen, 'eingang.veranstaltungsanmeldung.lesen')).toEqual([]);
  });

  it('organisationsFilter nennt bei organisationsgebundenen Aktionen nur die eigene Organisation', () => {
    for (const organisation of ORGANISATIONEN) {
      for (const aktion of ORGANISATIONSGEBUNDEN) {
        expect(organisationsFilter([{ rolle: 'organisationsredaktion', organisation }], aktion)).toEqual([organisation]);
      }
    }
  });

  it('zwei Organisationen addieren sich, eine dritte bleibt gesperrt', () => {
    const rollen: RollenZuweisung[] = [
      { rolle: 'organisationsredaktion', organisation: 'kt' },
      { rolle: 'organisationsredaktion', organisation: 'gt' },
    ];
    expect(organisationsFilter(rollen, 'nachricht.bearbeiten')).toEqual(['kt', 'gt']);
    expect(darf(rollen, 'nachricht.bearbeiten', { organisation: 'at' })).toBe(false);
    expect(darf(rollen, 'nachricht.bearbeiten', { organisation: 'kgt' })).toBe(false);
  });
});
