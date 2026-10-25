import { describe, expect, it } from 'vitest';
import {
  bestandenBleibt,
  lektionSichtbar,
  type Pruefung,
  religioeseLage,
  religioesGeprueft,
  type ReligioeserBaustein,
  sprachSichtbarkeit,
  stichprobeBestanden,
  wissenSichtbar,
  zaehltReligioes,
} from '@/lib/lernapp/freigabe';

/**
 * Zwei-Prüfer-Freigabe (ADR 0040 Nr. 5, KERN 4.0 §2.3) und Sichtbarkeit der Sprachkurse (ADR 0041 Nr. 2/5/7/11).
 * Die Wahrheitstafel unten leitet die Erwartung NICHT aus `freigabe.ts` ab, sondern aus den Regeln:
 * geprüft ⇔ mindestens zwei verschiedene Personen mit Rolle `religioese_pruefung` (ohne Administration), je mit „ok“ zum
 * aktuellen Hash, keine davon Verfasser, jeder aktuelle Beleg mit aktuellem Hash bestätigt – und niemand mit der Rolle lehnt
 * zum aktuellen Hash ab.
 */
const HASH = 'a'.repeat(64);
const ALT = 'b'.repeat(64);
const AM = new Date('2026-10-17T10:00:00Z');
const BELEGE = [
  { id: 'beleg-1', inhaltHash: 'c'.repeat(64) },
  { id: 'beleg-2', inhaltHash: 'd'.repeat(64) },
];
const alleBelege = BELEGE.map((b) => ({ belegId: b.id, inhaltHash: b.inhaltHash }));

const aussage = (verfasser: string[] = ['ki:lauf-1']): ReligioeserBaustein => ({
  inhaltHash: HASH,
  verfasser,
  belege: BELEGE,
  belegPflicht: true,
});

function ok(person: string, extra: Partial<Pruefung> = {}): Pruefung {
  return {
    pruefendeId: person,
    pruefendeRollen: ['religioese_pruefung'],
    art: 'religioes',
    urteil: 'ok',
    inhaltHash: HASH,
    belegeGeprueft: alleBelege,
    am: AM,
    ...extra,
  };
}

type Merkmale = {
  rolle: 'religioese_pruefung' | 'administration';
  verfasser: boolean;
  hashAktuell: boolean;
  urteil: 'ok' | 'abgelehnt';
  belege: 'alle' | 'einer' | 'veraltet';
};

const WERTE = {
  rolle: ['religioese_pruefung', 'administration'],
  verfasser: [false, true],
  hashAktuell: [true, false],
  urteil: ['ok', 'abgelehnt'],
  belege: ['alle', 'einer', 'veraltet'],
} as const;

function alleMerkmale(): Merkmale[] {
  const ergebnis: Merkmale[] = [];
  for (const rolle of WERTE.rolle)
    for (const verfasser of WERTE.verfasser)
      for (const hashAktuell of WERTE.hashAktuell)
        for (const urteil of WERTE.urteil)
          for (const belege of WERTE.belege) ergebnis.push({ rolle, verfasser, hashAktuell, urteil, belege });
  return ergebnis;
}

function alsPruefung(person: string, m: Merkmale): Pruefung {
  const belegeGeprueft =
    m.belege === 'alle' ? alleBelege : m.belege === 'einer' ? alleBelege.slice(0, 1) : alleBelege.map((b) => ({ ...b, inhaltHash: ALT }));
  return {
    pruefendeId: person,
    pruefendeRollen: [m.rolle],
    art: 'religioes',
    urteil: m.urteil,
    inhaltHash: m.hashAktuell ? HASH : ALT,
    belegeGeprueft,
    am: AM,
  };
}

/** Soll aus den Regeln (unabhängig von freigabe.ts). */
function soll(pruefungen: { person: string; m: Merkmale }[]): boolean {
  const zaehlt = new Set<string>();
  for (const { person, m } of pruefungen) {
    const mitRolle = m.rolle === 'religioese_pruefung';
    if (mitRolle && m.hashAktuell && m.urteil !== 'ok') return false;
    if (mitRolle && m.hashAktuell && m.urteil === 'ok' && !m.verfasser && m.belege === 'alle') zaehlt.add(person);
  }
  return zaehlt.size >= 2;
}

describe('Zwei-Prüfer-Freigabe: Wahrheitstafel über zwei Prüfungen', () => {
  const merkmale = alleMerkmale();

  it(`${merkmale.length * merkmale.length * 2} Fälle (zwei Personen bzw. dieselbe Person zweimal)`, () => {
    let geprueft = 0;
    let sichtbar = 0;
    const abweichungen: string[] = [];
    for (const m1 of merkmale)
      for (const m2 of merkmale)
        for (const gleichePerson of [false, true]) {
          const p1 = 'person-1';
          const p2 = gleichePerson ? 'person-1' : 'person-2';
          // Dieselbe Person zweimal: die jüngere Prüfung zählt
          const zweite = alsPruefung(p2, m2);
          const pruefungen = [alsPruefung(p1, m1), gleichePerson ? { ...zweite, am: new Date(AM.getTime() + 1000) } : zweite];
          const verfasser = [...(m1.verfasser ? [p1] : []), ...(m2.verfasser ? [p2] : []), 'ki:lauf-1'];
          const erwartet = gleichePerson
            ? false
            : soll([
                { person: p1, m: m1 },
                { person: p2, m: m2 },
              ]);
          // Verfasser gilt je Person: ist eine Person Verfasser, zählt keine ihrer Prüfungen (auch nicht die zweite)
          const ist = religioesGeprueft(aussage(verfasser), pruefungen);
          geprueft++;
          if (ist) sichtbar++;
          if (ist !== erwartet) abweichungen.push(`${JSON.stringify(m1)} | ${JSON.stringify(m2)} | gleich=${gleichePerson}`);
        }
    expect(abweichungen.slice(0, 5)).toEqual([]);
    expect(geprueft).toBe(merkmale.length * merkmale.length * 2);
    // Nur die Kombination „beide sauber“ gibt frei
    expect(sichtbar).toBe(1);
  });
});

describe('Zwei-Prüfer-Freigabe: Einzelregeln', () => {
  it('zwei ok von verschiedenen Prüfenden → geprüft; eine → nicht; drei mit einer veralteten → geprüft', () => {
    expect(religioesGeprueft(aussage(), [ok('imam'), ok('hoca')])).toBe(true);
    expect(religioesGeprueft(aussage(), [ok('imam')])).toBe(false);
    expect(religioesGeprueft(aussage(), [ok('imam'), ok('hoca'), ok('dritte', { inhaltHash: ALT })])).toBe(true);
    expect(religioesGeprueft(aussage(), [])).toBe(false);
  });

  it('jede Änderung (neuer Hash) setzt beide Freigaben zurück', () => {
    const pruefungen = [ok('imam'), ok('hoca')];
    expect(religioesGeprueft({ ...aussage(), inhaltHash: ALT }, pruefungen)).toBe(false);
  });

  it('die Administration zählt nie – auch nicht zusammen mit religioese_pruefung (Stufe C N2, Z-L02)', () => {
    expect(religioesGeprueft(aussage(), [ok('imam'), ok('admin', { pruefendeRollen: ['administration', 'bildung'] })])).toBe(false);
    expect(religioesGeprueft(aussage(), [ok('imam'), ok('admin', { pruefendeRollen: ['administration', 'religioese_pruefung'] })])).toBe(
      false,
    );
    // zwei eigene Konten der Administration mit beiden Rollen ergeben keine Freigabe
    const beide = { pruefendeRollen: ['religioese_pruefung', 'administration'] };
    expect(religioeseLage(aussage(), [ok('admin-1', beide), ok('admin-2', beide)]).freigaben).toEqual([]);
    // … und auch keinen Einwand: ein Konto mit beiden Rollen zählt weder als Freigabe noch als Sperre
    const einwand = ok('admin-1', { ...beide, urteil: 'abgelehnt' });
    expect(religioeseLage(aussage(), [ok('imam'), ok('hoca'), einwand])).toMatchObject({ gesperrt: false, geprueft: true });
    expect(zaehltReligioes(['religioese_pruefung'])).toBe(true);
    expect(zaehltReligioes(['religioese_pruefung', 'administration'])).toBe(false);
    expect(zaehltReligioes(['administration'])).toBe(false);
  });

  it('Verfasser des aktuellen Stands (Redaktion, die einen Vorschlag eingearbeitet hat) zählt nicht', () => {
    expect(religioesGeprueft(aussage(['ki:lauf-1', 'hoca']), [ok('imam'), ok('hoca')])).toBe(false);
    expect(religioesGeprueft(aussage(['ki:lauf-1', 'hoca']), [ok('imam'), ok('hoca'), ok('dritte')])).toBe(true);
  });

  it('gelöschtes Konto (ohne Person) zählt nicht', () => {
    expect(religioesGeprueft(aussage(), [ok('imam'), ok('x', { pruefendeId: null })])).toBe(false);
  });

  it('Belege: jeder aktuelle Beleg mit aktuellem Hash bestätigt; Aussage ohne Beleg nie', () => {
    expect(religioesGeprueft(aussage(), [ok('imam'), ok('hoca', { belegeGeprueft: alleBelege.slice(1) })])).toBe(false);
    expect(religioesGeprueft(aussage(), [ok('imam'), ok('hoca', { belegeGeprueft: undefined })])).toBe(false);
    const ohneBeleg: ReligioeserBaustein = { inhaltHash: HASH, verfasser: ['ki:lauf-1'], belege: [], belegPflicht: true };
    expect(religioeseLage(ohneBeleg, [ok('imam'), ok('hoca')])).toMatchObject({ belegFehlt: true, geprueft: false });
    // Quizfrage, Formelliste, Religionsbezug: keine eigenen Belege nötig
    expect(religioesGeprueft({ ...ohneBeleg, belegPflicht: false }, [ok('imam'), ok('hoca')])).toBe(true);
  });

  it('Ablehnung, Änderungsvorschlag oder Korrektur zum aktuellen Hash sperrt; die jüngste Prüfung je Person zählt', () => {
    expect(religioesGeprueft(aussage(), [ok('imam'), ok('hoca'), ok('dritte', { urteil: 'abgelehnt' })])).toBe(false);
    expect(religioesGeprueft(aussage(), [ok('imam'), ok('hoca'), ok('dritte', { urteil: 'aenderungsvorschlag' })])).toBe(false);
    // Ablehnung zu einem alten Hash sperrt nicht
    expect(religioesGeprueft(aussage(), [ok('imam'), ok('hoca'), ok('dritte', { urteil: 'abgelehnt', inhaltHash: ALT })])).toBe(true);
    // Ablehnung ohne Rolle (z. B. Redaktion) ist keine Prüfung
    expect(
      religioesGeprueft(aussage(), [ok('imam'), ok('hoca'), ok('redaktion', { urteil: 'abgelehnt', pruefendeRollen: ['bildung'] })]),
    ).toBe(true);
    const spaeter = new Date(AM.getTime() + 60_000);
    expect(religioesGeprueft(aussage(), [ok('imam', { urteil: 'abgelehnt' }), ok('imam', { am: spaeter }), ok('hoca')])).toBe(true);
    expect(religioesGeprueft(aussage(), [ok('imam'), ok('imam', { urteil: 'abgelehnt', am: spaeter }), ok('hoca')])).toBe(false);
  });

  it('Sprachprüfungen sind keine religiösen Freigaben', () => {
    expect(religioesGeprueft(aussage(), [ok('imam'), ok('hoca', { art: 'sprache_ziel' })])).toBe(false);
  });

  it('Wissen: zurückgezogen nie sichtbar, sonst nur geprüft', () => {
    expect(wissenSichtbar('automatisch_geprueft', aussage(), [ok('imam'), ok('hoca')])).toBe(true);
    expect(wissenSichtbar('veroeffentlicht', aussage(), [ok('imam')])).toBe(false);
    expect(wissenSichtbar('gesperrt', aussage(), [ok('imam'), ok('hoca')])).toBe(false);
  });

  it('Lektion nur, wenn alle Bausteine geprüft sind; leere Lektion nie', () => {
    expect(lektionSichtbar([true, true, true])).toBe(true);
    expect(lektionSichtbar([true, false, true])).toBe(false);
    expect(lektionSichtbar([])).toBe(false);
  });
});

describe('Sprachkurse: Status, Schalter lernapp_ungeprueft, Religionsbezug (ADR 0041)', () => {
  const an = { ungeprueftZeigen: true };
  const aus = { ungeprueftZeigen: false };
  const eintrag = (status: 'entwurf' | 'automatisch_geprueft' | 'veroeffentlicht' | 'gesperrt', religionsbezug = false) => ({
    status,
    inhaltHash: HASH,
    religionsbezug,
    verfasser: ['ki:lauf-2'],
  });
  const sprach = (urteil: 'ok' | 'korrektur' | 'abgelehnt', kategorie: Pruefung['kategorie'] = null, inhaltHash = HASH): Pruefung => ({
    pruefendeId: 'sp-1',
    pruefendeRollen: ['sprachpruefung'],
    art: 'sprache_ziel',
    urteil,
    kategorie,
    inhaltHash,
    am: AM,
  });

  it('Wahrheitstafel Status × Schalter ohne Religionsbezug', () => {
    expect(sprachSichtbarkeit(eintrag('entwurf'), [], an)).toBe('verborgen');
    expect(sprachSichtbarkeit(eintrag('gesperrt'), [], an)).toBe('verborgen');
    expect(sprachSichtbarkeit(eintrag('automatisch_geprueft'), [], an)).toBe('mit_hinweis');
    expect(sprachSichtbarkeit(eintrag('automatisch_geprueft'), [], aus)).toBe('verborgen');
    expect(sprachSichtbarkeit(eintrag('veroeffentlicht'), [], an)).toBe('sichtbar');
    expect(sprachSichtbarkeit(eintrag('veroeffentlicht'), [], aus)).toBe('sichtbar');
  });

  it('abgelehnt oder kritischer Fehler zum aktuellen Hash: nie sichtbar; leichter Fehler oder alter Hash: sichtbar', () => {
    expect(sprachSichtbarkeit(eintrag('veroeffentlicht'), [sprach('abgelehnt')], an)).toBe('verborgen');
    expect(sprachSichtbarkeit(eintrag('veroeffentlicht'), [sprach('korrektur', 'bedeutung')], an)).toBe('verborgen');
    expect(sprachSichtbarkeit(eintrag('veroeffentlicht'), [sprach('korrektur', 'aussprache')], an)).toBe('verborgen');
    expect(sprachSichtbarkeit(eintrag('veroeffentlicht'), [sprach('korrektur', 'zeichensetzung')], an)).toBe('sichtbar');
    expect(sprachSichtbarkeit(eintrag('veroeffentlicht'), [sprach('abgelehnt', 'grammatik', ALT)], an)).toBe('sichtbar');
  });

  it('Religionsbezug: nur mit zwei religiösen Freigaben – unabhängig von Status und Schalter; Stichprobe ersetzt sie nie', () => {
    const anFrei = { ...an, formellisteFrei: true };
    const ausFrei = { ...aus, formellisteFrei: true };
    for (const status of ['automatisch_geprueft', 'veroeffentlicht'] as const)
      for (const o of [an, aus, anFrei, ausFrei]) {
        expect(sprachSichtbarkeit(eintrag(status, true), [], o)).toBe('verborgen');
        expect(sprachSichtbarkeit(eintrag(status, true), [sprach('ok'), ok('imam', { belegeGeprueft: [] })], o)).toBe('verborgen');
      }
    const zwei = [ok('imam', { belegeGeprueft: [] }), ok('hoca', { belegeGeprueft: [] })];
    expect(sprachSichtbarkeit(eintrag('veroeffentlicht', true), zwei, ausFrei)).toBe('sichtbar');
    expect(sprachSichtbarkeit(eintrag('automatisch_geprueft', true), zwei, anFrei)).toBe('mit_hinweis');
    expect(sprachSichtbarkeit(eintrag('automatisch_geprueft', true), zwei, ausFrei)).toBe('verborgen');
    expect(sprachSichtbarkeit(eintrag('entwurf', true), zwei, anFrei)).toBe('verborgen');
    // die Administration (auch mit der Rolle) ersetzt keine der beiden Freigaben
    const mitAdmin = [
      ok('imam', { belegeGeprueft: [] }),
      ok('admin', { belegeGeprueft: [], pruefendeRollen: ['religioese_pruefung', 'administration'] }),
    ];
    expect(sprachSichtbarkeit(eintrag('veroeffentlicht', true), mitAdmin, ausFrei)).toBe('verborgen');
  });

  it('Formelliste (Stufe C N2, Z-L10): gesperrt → Eintrag mit Religionsbezug unsichtbar trotz zwei Freigaben; freigegeben → sichtbar', () => {
    const zwei = [ok('imam', { belegeGeprueft: [] }), ok('hoca', { belegeGeprueft: [] })];
    for (const o of [an, aus]) {
      // Liste gesperrt (bzw. ohne Angabe): unsichtbar, gleich wie viele Eintragsfreigaben und welcher Status
      expect(sprachSichtbarkeit(eintrag('veroeffentlicht', true), zwei, o)).toBe('verborgen');
      expect(sprachSichtbarkeit(eintrag('veroeffentlicht', true), zwei, { ...o, formellisteFrei: false })).toBe('verborgen');
      expect(sprachSichtbarkeit(eintrag('automatisch_geprueft', true), zwei, { ...o, formellisteFrei: false })).toBe('verborgen');
      // Liste freigegeben + zwei Eintragsfreigaben: sichtbar (veröffentlicht ohne Hinweis)
      expect(sprachSichtbarkeit(eintrag('veroeffentlicht', true), zwei, { ...o, formellisteFrei: true })).toBe('sichtbar');
      // Liste freigegeben ersetzt die Eintragsfreigaben nicht
      expect(sprachSichtbarkeit(eintrag('veroeffentlicht', true), zwei.slice(0, 1), { ...o, formellisteFrei: true })).toBe('verborgen');
      // Einträge ohne Religionsbezug hängen nicht an der Liste
      expect(sprachSichtbarkeit(eintrag('veroeffentlicht'), [], { ...o, formellisteFrei: false })).toBe('sichtbar');
    }
  });

  it('Annahmeregel: 0 kritische, höchstens 2 leichte je 20 (anteilig)', () => {
    expect(stichprobeBestanden({ geprueft: 20, kritisch: 0, leicht: 2 })).toBe(true);
    expect(stichprobeBestanden({ geprueft: 20, kritisch: 0, leicht: 3 })).toBe(false);
    expect(stichprobeBestanden({ geprueft: 20, kritisch: 1, leicht: 0 })).toBe(false);
    expect(stichprobeBestanden({ geprueft: 30, kritisch: 0, leicht: 3 })).toBe(true);
    expect(stichprobeBestanden({ geprueft: 30, kritisch: 0, leicht: 4 })).toBe(false);
    expect(stichprobeBestanden({ geprueft: 10, kritisch: 0, leicht: 1 })).toBe(true);
    expect(stichprobeBestanden({ geprueft: 0, kritisch: 0, leicht: 0 })).toBe(false);
  });

  it('Änderung nach Bestehen: unter 10 % geändert und jeder geänderte Eintrag einzeln geprüft', () => {
    expect(
      bestandenBleibt(
        100,
        Array.from({ length: 9 }, () => ({ einzelnGeprueft: true })),
      ),
    ).toBe(true);
    expect(
      bestandenBleibt(
        100,
        Array.from({ length: 10 }, () => ({ einzelnGeprueft: true })),
      ),
    ).toBe(false);
    expect(bestandenBleibt(100, [{ einzelnGeprueft: true }, { einzelnGeprueft: false }])).toBe(false);
    expect(bestandenBleibt(100, [])).toBe(true);
    expect(bestandenBleibt(0, [])).toBe(false);
  });
});
