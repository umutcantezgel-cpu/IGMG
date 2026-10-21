import { describe, expect, it } from 'vitest';
import {
  belegeUnsicher,
  eigenesUrteil,
  freigabeStand,
  ordneWarteschlange,
  type Pruefung,
  pruefeUrteil,
  religioeseLage,
  type ReligioeserBaustein,
  type UrteilsAntrag,
  wissenSichtbar,
} from '@/lib/lernapp/freigabe';
import {
  istKiHerkunft,
  kiHerkunftVerboten,
  KiHerkunftVerboten,
  nurMenschlich,
  verlangeMenschlicheHerkunft,
} from '@/lib/religioes/freigabe';
import { hadithUebersetzungSchema } from '@/lib/validierung/koran';

/**
 * Zwei-Prüfer-Oberfläche und KI-Regel 2 im Werkzeug (L6-02/03, ADR 0040 Nr. 3 und 5, KERN 4.0 §2.3): Urteilsregeln je
 * Person (Rolle, Hash, Verfasser, Belege, nicht zweimal), KI-Herkunft bei menschlichen Inhaltsarten, „unsicher“ zuerst in der
 * Warteschlange. Testdaten neutral (Platzhalter), keine religiösen Texte.
 */
const HASH = 'a'.repeat(64);
const NEU = 'e'.repeat(64);
const AM = new Date('2026-10-21T10:00:00Z');
const BELEGE = [
  { id: 'beleg-1', inhaltHash: 'c'.repeat(64) },
  { id: 'beleg-2', inhaltHash: 'd'.repeat(64) },
];
const ROLLE = ['religioese_pruefung'];

const aussage = (extra: Partial<ReligioeserBaustein> = {}): ReligioeserBaustein => ({
  inhaltHash: HASH,
  verfasser: ['ki:lauf-1/modell/v1'],
  belege: BELEGE,
  belegPflicht: true,
  art: 'aussage',
  ...extra,
});

const ok = (person: string, extra: Partial<Pruefung> = {}): Pruefung => ({
  pruefendeId: person,
  pruefendeRollen: ROLLE,
  art: 'religioes',
  urteil: 'ok',
  inhaltHash: HASH,
  belegeGeprueft: BELEGE.map((b) => ({ belegId: b.id, inhaltHash: b.inhaltHash })),
  am: AM,
  ...extra,
});

const antrag = (extra: Partial<UrteilsAntrag> = {}): UrteilsAntrag => ({
  pruefendeId: 'imam',
  pruefendeRollen: ROLLE,
  baustein: aussage(),
  gesehenerHash: HASH,
  urteil: 'ok',
  belegeBestaetigt: BELEGE.map((b) => b.id),
  inhaltBestaetigt: false,
  ...extra,
});

describe('pruefeUrteil – wer darf welches Urteil abgeben', () => {
  it('Rolle religiöse Prüfung mit allen Haken zum aktuellen Hash: erlaubt', () => {
    expect(pruefeUrteil(antrag(), [])).toBeNull();
  });

  it('Administration ohne Rolle: keineRolle – auch für Einwände', () => {
    for (const urteil of ['ok', 'aenderungsvorschlag', 'abgelehnt'] as const)
      expect(pruefeUrteil(antrag({ pruefendeRollen: ['administration'], urteil }), [])).toBe('keineRolle');
  });

  it('veralteter Hash (Inhalt seit dem Öffnen geändert): veraltet', () => {
    expect(pruefeUrteil(antrag({ gesehenerHash: NEU }), [])).toBe('veraltet');
  });

  it('wer den Stand verfasst hat (Redaktion, die einen Vorschlag eingearbeitet hat), urteilt nicht', () => {
    const b = aussage({ verfasser: ['ki:lauf-1', 'redakteurin'] });
    expect(pruefeUrteil(antrag({ pruefendeId: 'redakteurin', baustein: b }), [])).toBe('verfasser');
    expect(pruefeUrteil(antrag({ pruefendeId: 'redakteurin', baustein: b, urteil: 'abgelehnt' }), [])).toBe('verfasser');
  });

  it('„ok“ nur mit jedem Beleg einzeln bestätigt', () => {
    expect(pruefeUrteil(antrag({ belegeBestaetigt: ['beleg-1'] }), [])).toBe('belegeBestaetigen');
    expect(pruefeUrteil(antrag({ belegeBestaetigt: [] }), [])).toBe('belegeBestaetigen');
  });

  it('Aussage ohne Beleg ist nie freigebbar', () => {
    expect(pruefeUrteil(antrag({ baustein: aussage({ belege: [] }), belegeBestaetigt: [] }), [])).toBe('belegFehlt');
  });

  it('ohne Belege (Quizfrage, Lektion, Bedeutung) braucht „ok“ den Inhalts-Haken', () => {
    const quiz: ReligioeserBaustein = { inhaltHash: HASH, verfasser: ['ki:lauf-1'], belege: [], belegPflicht: false, art: 'aufgabe' };
    expect(pruefeUrteil(antrag({ baustein: quiz, belegeBestaetigt: [] }), [])).toBe('inhaltBestaetigen');
    expect(pruefeUrteil(antrag({ baustein: quiz, belegeBestaetigt: [], inhaltBestaetigt: true }), [])).toBeNull();
  });

  it('gleiche Person nicht zweimal „ok“ zum selben Hash; zum neuen Hash wieder', () => {
    expect(pruefeUrteil(antrag(), [ok('imam')])).toBe('schonFreigegeben');
    expect(pruefeUrteil(antrag(), [ok('imam', { inhaltHash: NEU })])).toBeNull();
    // eigenes Urteil durch einen Einwand ersetzen ist erlaubt
    expect(pruefeUrteil(antrag({ urteil: 'aenderungsvorschlag' }), [ok('imam')])).toBeNull();
  });

  it('Einwände brauchen keine Haken', () => {
    expect(pruefeUrteil(antrag({ urteil: 'aenderungsvorschlag', belegeBestaetigt: [] }), [])).toBeNull();
    expect(pruefeUrteil(antrag({ urteil: 'abgelehnt', baustein: aussage({ belege: [] }), belegeBestaetigt: [] }), [])).toBeNull();
  });
});

describe('Zwei Freigaben: sichtbar erst nach 2, Rücksetzen, unabhängige Personen', () => {
  it('0 → 1 → 2 Freigaben; erst bei 2/2 sichtbar', () => {
    const b = aussage();
    expect(freigabeStand(religioeseLage(b, []))).toBe(0);
    expect(wissenSichtbar('veroeffentlicht', b, [ok('imam')])).toBe(false);
    expect(freigabeStand(religioeseLage(b, [ok('imam')]))).toBe(1);
    expect(wissenSichtbar('veroeffentlicht', b, [ok('imam'), ok('hoca')])).toBe(true);
    expect(freigabeStand(religioeseLage(b, [ok('imam'), ok('hoca'), ok('dritte')]))).toBe(2);
  });

  it('dieselbe Person zweimal zählt einmal', () => {
    expect(wissenSichtbar('veroeffentlicht', aussage(), [ok('imam'), ok('imam', { am: new Date(AM.getTime() + 1000) })])).toBe(false);
  });

  it('neuer Hash setzt beide Freigaben zurück', () => {
    const geaendert = aussage({ inhaltHash: NEU });
    expect(wissenSichtbar('veroeffentlicht', geaendert, [ok('imam'), ok('hoca')])).toBe(false);
    expect(eigenesUrteil('imam', NEU, [ok('imam')])).toBeNull();
  });

  it('ein Einwand der zweiten Person sperrt; ihr späteres „ok“ ersetzt den Einwand', () => {
    const einwand = ok('hoca', { urteil: 'aenderungsvorschlag', belegeGeprueft: [] });
    expect(religioeseLage(aussage(), [ok('imam'), einwand]).gesperrt).toBe(true);
    const spaeter = ok('hoca', { am: new Date(AM.getTime() + 60_000) });
    expect(wissenSichtbar('veroeffentlicht', aussage(), [ok('imam'), einwand, spaeter])).toBe(true);
  });

  it('zurückgezogen (gesperrt) ist nie sichtbar', () => {
    expect(wissenSichtbar('gesperrt', aussage(), [ok('imam'), ok('hoca')])).toBe(false);
  });
});

describe('KI-Regel 2 im Werkzeug', () => {
  it('erkennt KI-Herkunft (Kennung und ausdrückliche Angaben), nicht aber gewöhnliche Namen', () => {
    for (const w of [
      'ki:lauf-7/modell/v2',
      'AI:x',
      'KI-Übersetzung',
      'Maschinelle Übersetzung',
      'ChatGPT',
      'Sprachmodell',
      'yapay zeka',
      'DeepL',
    ])
      expect(istKiHerkunft(w), w).toBe(true);
    for (const w of ['[Übersetzerin]', 'Tanzil.net', 'Saheeh International', 'Diyanet Isleri', 'Bubenheim und Elyas', 'kiosk', null, ''])
      expect(istKiHerkunft(w), String(w)).toBe(false);
  });

  it('nur bei menschlichen Inhaltsarten verboten: Koran-Bedeutung ja, Wissens-Aussage nein', () => {
    expect(nurMenschlich('koran_bedeutung')).toBe(true);
    expect(nurMenschlich('tajwid_regel')).toBe(true);
    expect(nurMenschlich('hadith_uebersetzung')).toBe(true);
    expect(nurMenschlich('aussage')).toBe(false);
    expect(kiHerkunftVerboten('koran_bedeutung', ['ki:lauf-1'])).toBe(true);
    expect(kiHerkunftVerboten('aussage', ['ki:lauf-1'])).toBe(false);
    expect(kiHerkunftVerboten('koran_bedeutung', ['konto-der-hoca'])).toBe(false);
  });

  it('Koran-Bedeutung mit KI-Herkunft: nie geprüft, „ok“ verweigert', () => {
    const b: ReligioeserBaustein = { inhaltHash: HASH, verfasser: ['ki:lauf-1'], belege: [], belegPflicht: false, art: 'koran_bedeutung' };
    const lage = religioeseLage(b, [ok('imam', { belegeGeprueft: [] }), ok('hoca', { belegeGeprueft: [] })]);
    expect(lage.kiHerkunft).toBe(true);
    expect(lage.geprueft).toBe(false);
    expect(pruefeUrteil(antrag({ baustein: b, belegeBestaetigt: [], inhaltBestaetigt: true }), [])).toBe('kiHerkunft');
    // Ablehnen bleibt möglich
    expect(pruefeUrteil(antrag({ baustein: b, urteil: 'abgelehnt', belegeBestaetigt: [] }), [])).toBeNull();
  });

  it('Import bricht ab (ohne Inhalt in der Meldung)', () => {
    expect(() => verlangeMenschlicheHerkunft('quran_uebersetzung', 'ausgabe-x', ['Maschinelle Übersetzung'])).toThrow(KiHerkunftVerboten);
    expect(() => verlangeMenschlicheHerkunft('quran_uebersetzung', 'ausgabe-x', ['[Übersetzer]', 'Tanzil.net'])).not.toThrow();
  });

  it('Hadith-Übersetzung: Quelle oder Übersetzer mit KI-Angabe → Feldfehler kiHerkunft', () => {
    const basis = {
      nummer: '1',
      sprache: 'de',
      text: '[Platzhalter]',
      uebersetzer: '[Übersetzerin]',
      quelle: '[Quelle]',
      lizenz: '[Lizenz]',
    };
    expect(hadithUebersetzungSchema.safeParse(basis).success).toBe(true);
    for (const feld of ['uebersetzer', 'quelle'] as const) {
      const r = hadithUebersetzungSchema.safeParse({ ...basis, [feld]: 'KI (Sprachmodell)' });
      expect(r.success).toBe(false);
      expect(r.error?.issues.find((i) => i.path[0] === feld)?.message).toBe('kiHerkunft');
    }
  });
});

describe('Warteschlange: „unsicher“ zuerst', () => {
  it('Belegprüfung teilweise oder nicht belegt zum aktuellen Beleg-Hash macht unsicher', () => {
    expect(belegeUnsicher(BELEGE, [{ belegId: 'beleg-1', inhaltHash: BELEGE[0]!.inhaltHash, ergebnis: 'belegt' }])).toBe(false);
    expect(belegeUnsicher(BELEGE, [{ belegId: 'beleg-2', inhaltHash: BELEGE[1]!.inhaltHash, ergebnis: 'teilweise' }])).toBe(true);
    expect(belegeUnsicher(BELEGE, [{ belegId: 'beleg-2', inhaltHash: NEU, ergebnis: 'nicht_belegt' }])).toBe(false);
  });

  it('ordnet unsicher → noch zu prüfen → 1/2 vor 0/2 → Schlüssel', () => {
    const liste = [
      { schluessel: 'islam.grund.e01.l01.s03', unsicher: false, stand: 0, erledigt: false },
      { schluessel: 'islam.grund.e01.l01.s02', unsicher: false, stand: 1, erledigt: true },
      { schluessel: 'islam.grund.e01.l01.s01', unsicher: false, stand: 1, erledigt: false },
      { schluessel: 'islam.grund.e01.l01.s04', unsicher: true, stand: 0, erledigt: false },
      { schluessel: 'islam.grund.e01.l01.s00', unsicher: false, stand: 0, erledigt: false },
    ];
    expect(ordneWarteschlange(liste).map((x) => x.schluessel.slice(-3))).toEqual(['s04', 's01', 's00', 's03', 's02']);
  });
});
