import { describe, expect, it } from 'vitest';
import type { FreigabeBaustein, Pruefung, ReligioeserBaustein } from '@/lib/lernapp/freigabe';
import { istPaketKopf } from '@/lib/lernapp/lokal/vorrat';
import { abschnitte } from '@/lib/lernapp/oberflaeche/kursverzeichnis';
import { sha256Hex } from '@/lib/lernapp/paket/hash';
import { type Paket, PaketSchema } from '@/lib/lernapp/paket/typen';
import {
  baueWissensEinheit,
  freigegebenAm,
  type WissensEinheitEingabe,
  type WissensLektionRoh,
  wissensAufgabe,
} from '@/lib/lernapp/paket/wissen';

/**
 * Paketbau des Wissenskurses (Endabnahme Z-L02, ADR 0040 Nr. 5, KERN 4.0 §2.3): Quizfragen aus dem Format der Inhaltsdatei
 * werden zu Aufgaben des Spielers mit der Quellenzeile ihrer Aussage; eine Lektion nur, wenn alle Bausteine zwei Freigaben
 * haben; Prüfvermerk = Tag der letzten zweiten Freigabe; Paketformat mit `kurs: 'islam'`. Nur Platzhalter (KI-Regel 2).
 */

const HASH = 'a'.repeat(64);
const QUELLE = '[Werk], [Kitab], [Ausgabe], Bd. 1, S. 2';
const baustein = (belege: ReligioeserBaustein['belege'] = [], hash = HASH): ReligioeserBaustein => ({
  inhaltHash: hash,
  verfasser: ['ki:lauf-test'],
  belege,
  belegPflicht: belege.length > 0,
});
const ok = (person: string, b: ReligioeserBaustein, am: string, rollen = ['religioese_pruefung']): Pruefung => ({
  pruefendeId: person,
  pruefendeRollen: rollen,
  art: 'religioes',
  urteil: 'ok',
  inhaltHash: b.inhaltHash,
  belegeGeprueft: b.belege.map((x) => ({ belegId: x.id, inhaltHash: x.inhaltHash })),
  am: new Date(am),
});
/** Baustein mit Freigaben zu den Zeitpunkten `tage` (je eine andere Person). */
function mit(tage: string[], b = baustein()): FreigabeBaustein {
  return { status: 'automatisch_geprueft', baustein: b, pruefungen: tage.map((t, i) => ok(`pruefer-${i + 1}`, b, t)) };
}
const ZWEI = ['2026-10-20T10:00:00Z', '2026-10-21T10:00:00Z'];

const WF = { behauptung: '[Behauptung]', richtig: false, begruendung: '[Begründung]' };
const lektion = (s: Partial<WissensLektionRoh> = {}): WissensLektionRoh => {
  const aussage = { schluessel: 'islam.grund.e01.l01.s01', text: '[Aussage]', quelle: QUELLE, strittig: false, freigabe: mit(ZWEI) };
  return {
    schluessel: 'islam.grund.e01.l01',
    art: 'lektion',
    titel: '[Lektion]',
    kinderGeeignet: false,
    freigabe: mit(ZWEI),
    aussagen: [aussage],
    aufgaben: [{ schluessel: 'islam.grund.e01.l01.q01', typ: 'wahr_falsch', daten: WF, aussage, freigabe: mit(ZWEI) }],
    ...s,
  };
};
const einheit = (lektionen: WissensLektionRoh[], status: WissensEinheitEingabe['einheit']['status'] = 'automatisch_geprueft') => ({
  einheit: { schluessel: 'islam.grund.e01', stufe: 'grund' as const, reihenfolge: 1, thema: { de: '[Thema]' }, symbol: null, status },
  lektionen,
});

describe('wissensAufgabe: Quizfrage der Datenbank → Aufgabe des Spielers mit Quellenzeile', () => {
  const k = (typ: string, daten: unknown) => wissensAufgabe({ schluessel: 'islam.grund.e01.l01.q01', typ, daten }, QUELLE);

  it('wahr_falsch, fallfrage, reihenfolge, zuordnen (Kategorien = rechte Seiten)', () => {
    expect(k('wahr_falsch', WF)).toEqual({
      schluessel: 'islam.grund.e01.l01.q01',
      typ: 'wahr_falsch',
      anweisung: 'stimmtDas',
      sprache: 'de',
      aussage: '[Behauptung]',
      wahr: false,
      begruendung: '[Begründung]',
      quelle: QUELLE,
    });
    expect(k('fallfrage', { fall: '[Fall]', frage: '[Frage]', optionen: ['[A]', '[B]'], richtig: 1 })).toMatchObject({
      typ: 'fallfrage',
      anweisung: 'waehleAntwort',
      richtig: 1,
      quelle: QUELLE,
    });
    // die inhaltliche `anweisung` der Inhaltsdatei kommt als `frage` an (Überschrift bleibt „Ordne“/„Ordne zu“)
    expect(k('reihenfolge', { anweisung: '[x]', schritte: ['[1]', '[2]', '[3]'] })).toMatchObject({
      typ: 'reihenfolge',
      anweisung: 'ordne',
      frage: '[x]',
      schritte: ['[1]', '[2]', '[3]'],
    });
    expect(
      k('zuordnen', {
        anweisung: '[x]',
        paare: [
          { links: '[a]', rechts: '[K1]' },
          { links: '[b]', rechts: '[K2]' },
          { links: '[c]', rechts: '[K1]' },
        ],
      }),
    ).toMatchObject({
      typ: 'zuordnen',
      anweisung: 'ordneZu',
      frage: '[x]',
      kategorien: ['[K1]', '[K2]'],
      eintraege: [
        { text: '[a]', kategorie: 0 },
        { text: '[b]', kategorie: 1 },
        { text: '[c]', kategorie: 0 },
      ],
    });
  });

  it('strittige Aussage → Aufgabe mit Kennzeichnung `strittig` (ADR 0040 Nr. 4), sonst ohne', () => {
    const a = { schluessel: 'islam.grund.e01.l01.q01', typ: 'wahr_falsch', daten: WF };
    expect(wissensAufgabe(a, QUELLE, true)).toMatchObject({ strittig: true, quelle: QUELLE });
    expect(wissensAufgabe(a, QUELLE, false)).not.toHaveProperty('strittig');
  });

  it('ungültig oder ohne Quellenzeile im Spieler (auswahl, luecke) → null', () => {
    expect(k('wahr_falsch', { behauptung: '', richtig: true, begruendung: '[B]' })).toBeNull();
    expect(k('fallfrage', { fall: '[F]', frage: '[Q]', optionen: ['[A]', '[B]'], richtig: 5 })).toBeNull();
    expect(
      k('zuordnen', {
        paare: [
          { links: '[a]', rechts: '[K]' },
          { links: '[b]', rechts: '[K]' },
        ],
      }),
    ).toBeNull();
    // ohne inhaltliche Frage ist eine Zuordnung bzw. Reihenfolge nicht lösbar
    expect(k('reihenfolge', { schritte: ['[1]', '[2]'] })).toBeNull();
    expect(k('reihenfolge', { anweisung: '  ', schritte: ['[1]', '[2]'] })).toBeNull();
    expect(
      k('zuordnen', {
        paare: [
          { links: '[a]', rechts: '[K1]' },
          { links: '[b]', rechts: '[K2]' },
        ],
      }),
    ).toBeNull();
    expect(k('auswahl', { frage: '[Q]', optionen: ['[A]', '[B]'], richtig: 0 })).toBeNull();
    expect(k('luecke', { text: '[a ___ b]', loesung: '[x]', ablenker: [] })).toBeNull();
    expect(k('koran_wort', {})).toBeNull();
    expect(k('wahr_falsch', null)).toBeNull();
  });
});

describe('freigegebenAm: Tag der zweiten zählenden Freigabe', () => {
  it('zweite Freigabe, nicht die dritte; ohne zwei Freigaben null; Administration zählt nicht', () => {
    expect(freigegebenAm(mit([...ZWEI, '2026-10-25T10:00:00Z']))?.toISOString()).toBe('2026-10-21T10:00:00.000Z');
    expect(freigegebenAm(mit(ZWEI.slice(0, 1)))).toBeNull();
    const b = baustein();
    const admin: FreigabeBaustein = {
      status: 'automatisch_geprueft',
      baustein: b,
      pruefungen: [ok('p1', b, ZWEI[0]!), ok('admin', b, ZWEI[1]!, ['administration'])],
    };
    expect(freigegebenAm(admin)).toBeNull();
  });
});

describe('baueWissensEinheit: Paket nur mit vollständig freigegebenen Lektionen', () => {
  it('alle Bausteine mit zwei Freigaben → gültiges Paket unter seinem Hash, mit Prüfvermerk und Aussagen', () => {
    const r = baueWissensEinheit(einheit([lektion()]));
    expect(r).not.toBeNull();
    expect(PaketSchema.safeParse(JSON.parse(r!.json)).success).toBe(true);
    expect(r!.hash).toBe(sha256Hex(r!.json));
    expect(r!.paket.wissen).toEqual({
      'islam.grund.e01.l01': {
        geprueftAm: '2026-10-21',
        kinderGeeignet: false,
        aussagen: [{ schluessel: 'islam.grund.e01.l01.s01', text: '[Aussage]', quelle: QUELLE }],
      },
    });
    expect(istPaketKopf(JSON.parse(r!.json))).toBe(true);
  });

  it('ein Baustein mit einer Freigabe, eine ungültige Quizfrage, zurückgezogene Einheit → keine Lektion bzw. kein Paket', () => {
    expect(baueWissensEinheit(einheit([lektion({ freigabe: mit(ZWEI.slice(0, 1)) })]))).toBeNull();
    const l = lektion();
    expect(baueWissensEinheit(einheit([{ ...l, aufgaben: [{ ...l.aufgaben[0]!, typ: 'auswahl' }] }]))).toBeNull();
    expect(baueWissensEinheit(einheit([{ ...l, aufgaben: [{ ...l.aufgaben[0]!, aussage: null }] }]))).toBeNull();
    expect(baueWissensEinheit(einheit([lektion()], 'gesperrt'))).toBeNull();
    // eine zweite, nicht freigegebene Lektion fällt weg, die erste bleibt
    const zwei = baueWissensEinheit(einheit([lektion(), lektion({ schluessel: 'islam.grund.e01.l02', freigabe: mit(ZWEI.slice(0, 1)) })]));
    expect(zwei?.paket.lektionen.map((x) => x.schluessel)).toEqual(['islam.grund.e01.l01']);
  });

  it('Prüfvermerk außerhalb des Paketformats (Quellenzeile > 1.200, Text > 800 Zeichen) → Lektion fehlt, kein kaputtes Paket', () => {
    const l = lektion();
    // Aussage ohne Quizfrage: nur der Vermerk trägt ihre Quellenzeile
    const lang = { ...l.aussagen[0]!, schluessel: 'islam.grund.e01.l01.s02', quelle: 'x'.repeat(1201) };
    expect(baueWissensEinheit(einheit([{ ...l, aussagen: [...l.aussagen, lang] }]))).toBeNull();
    const langerText = { ...l.aussagen[0]!, schluessel: 'islam.grund.e01.l01.s02', text: 'x'.repeat(801) };
    expect(baueWissensEinheit(einheit([{ ...l, aussagen: [...l.aussagen, langerText] }]))).toBeNull();
    // daneben bleibt eine gültige Lektion
    const r = baueWissensEinheit(einheit([{ ...l, aussagen: [...l.aussagen, lang] }, lektion({ schluessel: 'islam.grund.e01.l02' })]));
    expect(r?.paket.lektionen.map((x) => x.schluessel)).toEqual(['islam.grund.e01.l02']);
    expect(PaketSchema.safeParse(JSON.parse(r!.json)).success).toBe(true);
  });
});

describe('PaketSchema: Wissenskurs nur auf Deutsch, mit Prüfvermerk je Lektion, ohne Einträge und Audio', () => {
  const gut = baueWissensEinheit(einheit([lektion()]))!.paket;
  const pruefe = (p: unknown) => PaketSchema.safeParse(p).success;

  it('Prüfvermerk fehlt, Einträge oder Audio im Wissenskurs, Prüfvermerk im Sprachkurs → ungültig', () => {
    expect(pruefe(gut)).toBe(true);
    expect(pruefe({ ...gut, wissen: undefined })).toBe(false);
    expect(pruefe({ ...gut, wissen: {} })).toBe(false);
    expect(pruefe({ ...gut, ausgangssprache: 'tr' })).toBe(false);
    expect(pruefe({ ...gut, eintraege: { x: { text: '[x]', sprache: 'de', quelle: 'test:x', lizenz: 'CC-BY-SA-4.0' } } })).toBe(false);
    expect(pruefe({ ...gut, audio: [{ adresse: '/lern-app/audio/de/x.lpa', bytes: 1 }] })).toBe(false);
    const sprachkurs: Paket = { ...gut, kurs: 'tr-aus-de', zielsprache: 'tr', ausgangssprache: 'de' };
    expect(pruefe(sprachkurs)).toBe(false);
    expect(pruefe({ ...sprachkurs, wissen: undefined })).toBe(true);
    expect(pruefe({ ...gut, kurs: 'koran' })).toBe(false);
    expect(istPaketKopf({ ...gut, kurs: 'koran' })).toBe(false);
  });
});

describe('Lernpfad: Prüfvermerk je Lektion aus dem Paket', () => {
  it('gültiger Vermerk erscheint an der Lektion, ein ungültiger nicht', () => {
    const r = baueWissensEinheit(einheit([lektion()]))!;
    const v = {
      format: 'igmg-lernapp-verzeichnis' as const,
      version: 1 as const,
      kurs: 'islam' as const,
      kursId: 'islam' as const,
      zielsprache: 'de' as const,
      ausgangssprache: null,
      stand: 1,
      einheiten: [
        {
          schluessel: 'islam.grund.e01',
          stufe: 'grund' as const,
          reihenfolge: 1,
          thema: { de: '[Thema]' },
          hash: r.hash,
          bytes: r.bytes,
          lektionen: 1,
          hinweis: false,
          audio: [],
        },
      ],
    };
    const lektionen = (p: typeof r.paket) => abschnitte(v, new Set(), new Map([['islam.grund.e01', p]]))[0]!.stationen[0]!.lektionen;
    // Prüfvermerk mit allen Aussagen und ihrer Quellenzeile (KERN 4.0 §2.3)
    const imPfad = { schluessel: 'islam.grund.e01.l01.s01', text: '[Aussage]', quelle: QUELLE };
    expect(lektionen(r.paket)?.[0]?.vermerk).toEqual({ geprueftAm: '2026-10-21', kinderGeeignet: false, aussagen: [imPfad] });
    const vermerk = r.paket.wissen!['islam.grund.e01.l01']!;
    const kaputt = { ...r.paket, wissen: { 'islam.grund.e01.l01': { ...vermerk, geprueftAm: 'gestern' } } };
    expect(lektionen(kaputt)?.[0]?.vermerk).toBeUndefined();
    // Kopf aus dem Vorrat (nicht voll geprüft): Aussagen ohne Text oder Quelle fallen weg, der Vermerk bleibt
    const luecken = {
      ...r.paket,
      wissen: { 'islam.grund.e01.l01': { ...vermerk, aussagen: [imPfad, { schluessel: 'x', text: '' }, null] } },
    };
    expect(lektionen(luecken as never)?.[0]?.vermerk?.aussagen).toEqual([imPfad]);

    // strittige Aussage: Paket trägt `strittig` an Aussage und Quizfrage, der Lernpfad weist die Lektion aus
    const l = lektion();
    const aussage = { ...l.aussagen[0]!, strittig: true };
    const s = baueWissensEinheit(einheit([{ ...l, aussagen: [aussage], aufgaben: [{ ...l.aufgaben[0]!, aussage }] }]))!;
    expect(PaketSchema.safeParse(JSON.parse(s.json)).success).toBe(true);
    expect(s.hash).not.toBe(r.hash);
    expect(s.paket.wissen!['islam.grund.e01.l01']!.aussagen[0]).toMatchObject({ strittig: true });
    expect(s.paket.lektionen[0]!.aufgaben[0]).toMatchObject({ strittig: true });
    expect(lektionen(s.paket)?.[0]?.vermerk).toEqual({
      geprueftAm: '2026-10-21',
      kinderGeeignet: false,
      strittig: true,
      aussagen: [{ schluessel: 'islam.grund.e01.l01.s01', text: '[Aussage]', quelle: QUELLE, strittig: true }],
    });
  });
});
