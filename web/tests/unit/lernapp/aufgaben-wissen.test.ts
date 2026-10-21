import { describe, expect, it } from 'vitest';
import { bewerteFallfrage, fallfrageReihenfolge } from '@/lib/lernapp/aufgaben/auswertung/fallfrage';
import { bewerteKoranWort, koranWortReihenfolge } from '@/lib/lernapp/aufgaben/auswertung/koran_wort';
import { bewerteReihenfolge, startFolge, stellenRichtig, verschiebe } from '@/lib/lernapp/aufgaben/auswertung/reihenfolge';
import { bewerteWahrFalsch, wahrIndex } from '@/lib/lernapp/aufgaben/auswertung/wahr_falsch';
import { bewerteZuordnen, pruefeZuordnung, vollstaendig, zuordnenReihenfolge } from '@/lib/lernapp/aufgaben/auswertung/zuordnen';
import { bewerte } from '@/lib/lernapp/aufgaben/bewerte';
import { FallfrageSchema } from '@/lib/lernapp/aufgaben/fallfrage';
import { KoranWortSchema } from '@/lib/lernapp/aufgaben/koran_wort';
import { ReihenfolgeSchema } from '@/lib/lernapp/aufgaben/reihenfolge';
import {
  AUFGABEN_TYPEN,
  AufgabeSchema,
  type AufgabeVon,
  IMPLEMENTIERT,
  istImplementiert,
  LektionSchema,
  WISSEN_TYPEN,
} from '@/lib/lernapp/aufgaben/schema';
import { WahrFalschSchema } from '@/lib/lernapp/aufgaben/wahr_falsch';
import { ZuordnenSchema } from '@/lib/lernapp/aufgaben/zuordnen';
import { starte, pruefe, weiter } from '@/lib/lernapp/engine/sitzung';
import {
  type FreigabeBaustein,
  koranWortSichtbar,
  type Pruefung,
  type ReligioeserBaustein,
  wissensAufgabeSichtbar,
} from '@/lib/lernapp/freigabe';
import { KORAN_TYPEN, sichtbareWissensLektion, WISSENSKURS_TYPEN } from '@/lib/lernapp/paket/wissen';

/**
 * Übungstypen aus L2-03 (PLAN §4 „Wissenskurs“, ADR 0040 Nr. 5): Zod-Nutzlast, reine Bewertung, Hilfen der Anzeige und die
 * Sichtbarkeit nur mit zwei Freigaben (`freigabe.ts`, `paket/wissen.ts`). KI-Regel 2: nur Platzhalter in eckigen Klammern
 * – keine religiösen Aussagen, keine Koranwörter, keine Bedeutungen; Stellen `0:0:n` zeigen auf kein echtes Wort.
 */

const WF: AufgabeVon<'wahr_falsch'> = {
  typ: 'wahr_falsch',
  schluessel: 'islam.grund.e01.l01.a01',
  karten: ['islam:islam.grund.e01.s001'],
  anweisung: 'stimmtDas',
  sprache: 'de',
  aussage: '[Aussage 1]',
  wahr: false,
  begruendung: '[Begründung 1]',
  quelle: '[Werk, Kapitel, Ausgabe]',
};
const ZO: AufgabeVon<'zuordnen'> = {
  typ: 'zuordnen',
  schluessel: 'islam.grund.e01.l01.a02',
  anweisung: 'ordneZu',
  sprache: 'de',
  kategorien: ['[Kategorie A]', '[Kategorie B]', '[Kategorie C]'],
  eintraege: [
    { text: '[Eintrag 1]', kategorie: 0 },
    { text: '[Eintrag 2]', kategorie: 1 },
    { text: '[Eintrag 3]', kategorie: 2 },
    { text: '[Eintrag 4]', kategorie: 0 },
  ],
};
const RF: AufgabeVon<'reihenfolge'> = {
  typ: 'reihenfolge',
  schluessel: 'islam.grund.e01.l01.a03',
  anweisung: 'ordne',
  sprache: 'de',
  schritte: ['[Schritt 1]', '[Schritt 2]', '[Schritt 3]', '[Schritt 4]'],
};
const FF: AufgabeVon<'fallfrage'> = {
  typ: 'fallfrage',
  schluessel: 'islam.grund.e01.l01.a04',
  anweisung: 'waehleAntwort',
  sprache: 'de',
  fall: '[Fall 1]',
  frage: '[Frage 1]',
  optionen: ['[Antwort A]', '[Antwort B]', '[Antwort C]'],
  richtig: 1,
  begruendung: '[Begründung 2]',
};
const KW: AufgabeVon<'koran_wort'> = {
  typ: 'koran_wort',
  schluessel: 'koran.grund.e01.l01.a01',
  karten: ['koran:koran.w0001'],
  anweisung: 'waehleBedeutung',
  wort: { stelle: '0:0:1', text: '[Wortform 1]', sprache: 'ar' },
  optionen: [
    { kennung: 'test.bedeutung.1', text: '[Bedeutung 1]', sprache: 'de' },
    { kennung: 'test.bedeutung.2', text: '[Bedeutung 2]', sprache: 'de' },
    { kennung: 'test.bedeutung.3', text: '[Bedeutung 3]', sprache: 'de' },
  ],
  richtig: 0,
};
const KWW: AufgabeVon<'koran_wort'> = {
  ...KW,
  schluessel: 'koran.grund.e01.l01.a02',
  anweisung: 'waehleWurzel',
  optionen: [
    { kennung: 'test.wurzel.1', text: '[Wurzel 1]', sprache: 'ar' },
    { kennung: 'test.wurzel.2', text: '[Wurzel 2]', sprache: 'ar' },
  ],
};

const fehler = (r: { success: boolean; error?: { issues: { message: string }[] } }) => r.error?.issues.map((i) => i.message) ?? [];

describe('L2-03: Typen in der Union und spielbar', () => {
  it('wahr_falsch, zuordnen, reihenfolge, fallfrage, koran_wort sind implementiert und gültig', () => {
    const typen = ['wahr_falsch', 'zuordnen', 'reihenfolge', 'fallfrage', 'koran_wort'] as const;
    expect(Object.keys(WISSEN_TYPEN)).toEqual(typen);
    for (const t of typen) {
      expect(IMPLEMENTIERT).toContain(t);
      expect(istImplementiert(t)).toBe(true);
      expect(AUFGABEN_TYPEN).toContain(t);
    }
    for (const a of [WF, ZO, RF, FF, KW, KWW]) expect(AufgabeSchema.safeParse(a).success, a.typ).toBe(true);
  });

  it('eine Lektion des Wissenskurses lässt sich als Lektion lesen', () => {
    const l = LektionSchema.safeParse({
      schluessel: 'islam.grund.e01.l01',
      kurs: 'islam',
      art: 'lektion',
      zielsprache: 'de',
      ausgangssprache: 'de',
      aufgaben: [WF, ZO, RF, FF],
    });
    expect(l.success).toBe(true);
  });
});

describe('Zod: Nutzlast je Typ', () => {
  it('wahr_falsch braucht Aussage und Begründung; die Quelle ist frei', () => {
    expect(WahrFalschSchema.safeParse({ ...WF, begruendung: '' }).success).toBe(false);
    expect(WahrFalschSchema.safeParse({ ...WF, aussage: ' ' }).success).toBe(false);
    const { quelle: _quelle, ...ohne } = WF;
    expect(WahrFalschSchema.safeParse(ohne).success).toBe(true);
    expect(WahrFalschSchema.safeParse({ ...WF, extra: 1 }).success).toBe(false);
  });

  it('zuordnen: Kategorie im Bereich, keine doppelten Kategorien oder Einträge', () => {
    expect(fehler(ZuordnenSchema.safeParse({ ...ZO, eintraege: [...ZO.eintraege, { text: '[Eintrag 5]', kategorie: 3 }] }))).toContain(
      'Kategorie außerhalb der Liste',
    );
    expect(fehler(ZuordnenSchema.safeParse({ ...ZO, kategorien: ['[A]', '[a]'] }))).toContain('Kategorien doppelt');
    expect(fehler(ZuordnenSchema.safeParse({ ...ZO, eintraege: [ZO.eintraege[0], ZO.eintraege[0]] }))).toContain('Einträge doppelt');
    expect(ZuordnenSchema.safeParse({ ...ZO, kategorien: ['[A]'] }).success).toBe(false);
  });

  it('reihenfolge: 2 bis 12 verschiedene Schritte', () => {
    expect(ReihenfolgeSchema.safeParse({ ...RF, schritte: ['[x]'] }).success).toBe(false);
    expect(fehler(ReihenfolgeSchema.safeParse({ ...RF, schritte: ['[x]', '[X]'] }))).toContain('Schritte doppelt');
  });

  it('fallfrage: richtige Option im Bereich, Optionen verschieden', () => {
    expect(fehler(FallfrageSchema.safeParse({ ...FF, richtig: 3 }))).toContain('richtig außerhalb der Optionen');
    expect(fehler(FallfrageSchema.safeParse({ ...FF, optionen: ['[a]', '[a]'] }))).toContain('Optionen doppelt');
  });

  it('koran_wort: Stelle Sure:Vers:Wort, Kennungen eindeutig, Sprache passend zur Anweisung, Wortform arabisch', () => {
    expect(KoranWortSchema.safeParse({ ...KW, wort: { ...KW.wort, stelle: '1:1' } }).success).toBe(false);
    expect(KoranWortSchema.safeParse({ ...KW, wort: { ...KW.wort, sprache: 'de' } }).success).toBe(false);
    expect(
      fehler(KoranWortSchema.safeParse({ ...KW, optionen: [KW.optionen[0], { ...KW.optionen[1], kennung: KW.optionen[0]!.kennung }] })),
    ).toContain('Kennungen doppelt');
    expect(fehler(KoranWortSchema.safeParse({ ...KW, anweisung: 'waehleWurzel' }))).toContain('Sprache der Optionen passt nicht');
    expect(fehler(KoranWortSchema.safeParse({ ...KWW, anweisung: 'waehleBedeutung' }))).toContain('Sprache der Optionen passt nicht');
    expect(fehler(KoranWortSchema.safeParse({ ...KW, richtig: 5 }))).toContain('richtig außerhalb der Optionen');
  });
});

describe('Bewertung', () => {
  it('wahr_falsch: Urteil passt zur Aussage; Lösung ist die Begründung', () => {
    expect(bewerteWahrFalsch(WF, { typ: 'wahr_falsch', wahr: false })).toEqual({
      urteil: 'richtig',
      hinweise: [],
      loesung: '[Begründung 1]',
      karten: [{ karte: 'islam:islam.grund.e01.s001', urteil: 'richtig' }],
    });
    expect(bewerte(WF, { typ: 'wahr_falsch', wahr: true }).urteil).toBe('falsch');
    expect([wahrIndex(true), wahrIndex(false)]).toEqual([0, 1]);
  });

  it('zuordnen: richtig nur, wenn jeder Eintrag stimmt; je Eintrag prüfbar; Lösung nennt alle Zuordnungen', () => {
    const alle = { typ: 'zuordnen' as const, zuordnung: [0, 1, 2, 0] };
    expect(bewerteZuordnen(ZO, alle).urteil).toBe('richtig');
    const einer = { typ: 'zuordnen' as const, zuordnung: [0, 1, 0, 0] };
    expect(bewerte(ZO, einer).urteil).toBe('falsch');
    expect(pruefeZuordnung(ZO, einer.zuordnung)).toEqual([true, true, false, true]);
    expect(bewerteZuordnen(ZO, einer).loesung).toBe(
      '[Eintrag 1]: [Kategorie A] · [Eintrag 2]: [Kategorie B] · [Eintrag 3]: [Kategorie C] · [Eintrag 4]: [Kategorie A]',
    );
    expect(vollstaendig(ZO, [0, 1, undefined, 0])).toBe(false);
    expect(vollstaendig(ZO, [0, 1, 3, 0])).toBe(false);
    expect(vollstaendig(ZO, [0, 1, 2, 0])).toBe(true);
    // Anzeige gemischt, stabil, nie in Inhaltsreihenfolge
    expect(zuordnenReihenfolge(ZO)).toEqual(zuordnenReihenfolge(ZO));
    expect(zuordnenReihenfolge(ZO)).not.toEqual([0, 1, 2, 3]);
    expect([...zuordnenReihenfolge(ZO)].sort()).toEqual([0, 1, 2, 3]);
  });

  it('reihenfolge: Start gemischt, Verschieben um eine Stelle, richtig nur in Inhaltsreihenfolge', () => {
    const start = startFolge(RF);
    expect(start).not.toEqual([0, 1, 2, 3]);
    expect([...start].sort()).toEqual([0, 1, 2, 3]);
    expect(verschiebe([2, 0, 1], 0, 1)).toEqual([0, 2, 1]);
    expect(verschiebe([2, 0, 1], 2, -1)).toEqual([2, 1, 0]);
    expect(verschiebe([2, 0, 1], 0, -1)).toEqual([2, 0, 1]);
    expect(verschiebe([2, 0, 1], 2, 1)).toEqual([2, 0, 1]);
    expect(stellenRichtig([0, 2, 1, 3])).toEqual([true, false, false, true]);
    expect(bewerteReihenfolge(RF, { typ: 'reihenfolge', folge: [0, 1, 2, 3] })).toMatchObject({
      urteil: 'richtig',
      loesung: '[Schritt 1] → [Schritt 2] → [Schritt 3] → [Schritt 4]',
    });
    expect(bewerte(RF, { typ: 'reihenfolge', folge: [1, 0, 2, 3] }).urteil).toBe('falsch');
    expect(bewerte(RF, { typ: 'reihenfolge', folge: [0, 1, 2] }).urteil).toBe('falsch');
  });

  it('fallfrage und koran_wort: nach Index, Lösung ist die richtige Option', () => {
    expect(bewerteFallfrage(FF, { typ: 'fallfrage', wahl: 1 })).toMatchObject({ urteil: 'richtig', loesung: '[Antwort B]' });
    expect(bewerte(FF, { typ: 'fallfrage', wahl: 0 }).urteil).toBe('falsch');
    expect(bewerteKoranWort(KW, { typ: 'koran_wort', wahl: 0 })).toEqual({
      urteil: 'richtig',
      hinweise: [],
      loesung: '[Bedeutung 1]',
      karten: [{ karte: 'koran:koran.w0001', urteil: 'richtig' }],
    });
    expect(bewerte(KWW, { typ: 'koran_wort', wahl: 1 }).urteil).toBe('falsch');
    expect([...fallfrageReihenfolge(FF)].sort()).toEqual([0, 1, 2]);
    expect(koranWortReihenfolge(KW)).not.toEqual([0, 1, 2]);
  });

  it('die Engine spielt die Wissens-Typen wie jede Lektion (Bewertung vom Aufrufer, Ereignisse am Ende)', () => {
    let s = starte({
      schluessel: 'islam.grund.e01.l01',
      kurs: 'islam',
      art: 'lektion',
      zielsprache: 'de',
      ausgangssprache: 'de',
      aufgaben: [WF, RF],
    });
    expect(s.aufgaben.map((a) => a.typ)).toEqual(['wahr_falsch', 'reihenfolge']);
    s = pruefe(s, { typ: 'wahr_falsch', wahr: false }, bewerte).sitzung;
    s = weiter(s).sitzung;
    const r = pruefe(s, { typ: 'reihenfolge', folge: [0, 1, 2, 3] }, bewerte);
    const ende = weiter(r.sitzung);
    expect(ende.sitzung.phase).toBe('fertig');
    expect(ende.ereignisse.map((e) => e.art)).toEqual(['lektion', 'xp']);
  });
});

// ——— Sichtbarkeit nur mit zwei Freigaben ———

const HASH = 'a'.repeat(64);
const NEU = 'e'.repeat(64);
const AM = new Date('2026-10-20T10:00:00Z');
const BELEG = { id: 'beleg-1', inhaltHash: 'c'.repeat(64) };
const baustein = (belege: ReligioeserBaustein['belege'] = [BELEG], hash = HASH): ReligioeserBaustein => ({
  inhaltHash: hash,
  verfasser: ['ki:lauf-test'],
  belege,
  belegPflicht: belege.length > 0,
});
const ok = (person: string, b: ReligioeserBaustein, rollen = ['religioese_pruefung']): Pruefung => ({
  pruefendeId: person,
  pruefendeRollen: rollen,
  art: 'religioes',
  urteil: 'ok',
  inhaltHash: b.inhaltHash,
  belegeGeprueft: b.belege.map((x) => ({ belegId: x.id, inhaltHash: x.inhaltHash })),
  am: AM,
});
/** Baustein mit `n` Freigaben verschiedener Prüfender (Rolle `religioese_pruefung`). */
function mit(n: number, b = baustein(), extra: Partial<FreigabeBaustein> = {}): FreigabeBaustein {
  const pruefungen = Array.from({ length: n }, (_, i) => ok(`pruefer-${i + 1}`, b));
  return { status: 'automatisch_geprueft', baustein: b, pruefungen, ...extra };
}
const ohneBeleg = () => baustein([]);

describe('wissensAufgabeSichtbar: Quizfrage nur mit zwei Freigaben und nur aus geprüften Aussagen', () => {
  it('zwei Freigaben für Aufgabe und Aussage → sichtbar', () => {
    expect(wissensAufgabeSichtbar(mit(2, ohneBeleg()), [mit(2)])).toBe(true);
  });

  it('eine Freigabe, keine Aussage, ungeprüfte Aussage, zurückgezogen → unsichtbar', () => {
    expect(wissensAufgabeSichtbar(mit(1, ohneBeleg()), [mit(2)])).toBe(false);
    expect(wissensAufgabeSichtbar(mit(2, ohneBeleg()), [])).toBe(false);
    expect(wissensAufgabeSichtbar(mit(2, ohneBeleg()), [mit(2), mit(1)])).toBe(false);
    expect(wissensAufgabeSichtbar(mit(2, ohneBeleg(), { status: 'gesperrt' }), [mit(2)])).toBe(false);
  });

  it('die Administration ersetzt keine Prüfung; ein neuer Hash setzt beide Freigaben zurück', () => {
    const b = ohneBeleg();
    const admin: FreigabeBaustein = {
      status: 'veroeffentlicht',
      baustein: b,
      pruefungen: [ok('admin-1', b, ['administration']), ok('admin-2', b, ['administration'])],
    };
    expect(wissensAufgabeSichtbar(admin, [mit(2)])).toBe(false);
    const alt = mit(2, ohneBeleg());
    const geaendert: FreigabeBaustein = { ...alt, baustein: { ...alt.baustein, inhaltHash: NEU } };
    expect(wissensAufgabeSichtbar(geaendert, [mit(2)])).toBe(false);
  });
});

describe('koranWortSichtbar: Bedeutungen und Wurzeltabelle nur mit zwei Freigaben', () => {
  it('jede gezeigte Bedeutung (auch Ablenker) braucht zwei Freigaben, mindestens zwei Bedeutungen', () => {
    const b = ohneBeleg;
    expect(koranWortSichtbar({ anweisung: 'waehleBedeutung', bedeutungen: [mit(2, b()), mit(2, b())] })).toBe(true);
    expect(koranWortSichtbar({ anweisung: 'waehleBedeutung', bedeutungen: [mit(2, b()), mit(1, b())] })).toBe(false);
    expect(koranWortSichtbar({ anweisung: 'waehleBedeutung', bedeutungen: [mit(2, b())] })).toBe(false);
  });

  it('Wurzeln nur aus der geprüften Wurzeltabelle', () => {
    expect(koranWortSichtbar({ anweisung: 'waehleWurzel', wurzeltabelle: mit(2, ohneBeleg()) })).toBe(true);
    expect(koranWortSichtbar({ anweisung: 'waehleWurzel', wurzeltabelle: mit(1, ohneBeleg()) })).toBe(false);
    expect(koranWortSichtbar({ anweisung: 'waehleWurzel', wurzeltabelle: null })).toBe(false);
  });

  it('von Menschen verfasste Bedeutungen: wer verfasst hat, zählt nicht als Freigabe', () => {
    const b: ReligioeserBaustein = { ...ohneBeleg(), verfasser: ['pruefer-1'] };
    expect(koranWortSichtbar({ anweisung: 'waehleBedeutung', bedeutungen: [mit(2, b), mit(2, b)] })).toBe(false);
    expect(koranWortSichtbar({ anweisung: 'waehleBedeutung', bedeutungen: [mit(3, b), mit(3, b)] })).toBe(true);
  });
});

describe('sichtbareWissensLektion: nur ganz, nur Typen des Kurses, ohne Audio', () => {
  const kopf = {
    schluessel: 'islam.grund.e01.l01',
    kurs: 'islam',
    art: 'lektion' as const,
    zielsprache: 'de' as const,
    ausgangssprache: 'de' as const,
  };
  const geprueft = (aufgabe: AufgabeVon<'wahr_falsch' | 'zuordnen' | 'reihenfolge' | 'fallfrage'>) => ({
    aufgabe,
    freigabe: mit(2, ohneBeleg()),
    aussagen: [mit(2)],
  });

  it('alle Bausteine geprüft → Lektion mit allen Aufgaben (gültig nach LektionSchema)', () => {
    const l = sichtbareWissensLektion({
      kurs: 'islam',
      lektion: kopf,
      freigabe: mit(2, ohneBeleg()),
      aufgaben: [WF, ZO, RF, FF].map(geprueft),
    });
    expect(l?.aufgaben.map((a) => a.typ)).toEqual(['wahr_falsch', 'zuordnen', 'reihenfolge', 'fallfrage']);
    expect(LektionSchema.safeParse(l).success).toBe(true);
  });

  it('ein ungeprüfter Baustein (Aufgabe, Aussage oder Lektion) → keine Lektion', () => {
    const aufgaben = [WF, ZO].map(geprueft);
    expect(sichtbareWissensLektion({ kurs: 'islam', lektion: kopf, freigabe: mit(1, ohneBeleg()), aufgaben })).toBeNull();
    expect(
      sichtbareWissensLektion({
        kurs: 'islam',
        lektion: kopf,
        freigabe: mit(2, ohneBeleg()),
        aufgaben: [aufgaben[0]!, { ...aufgaben[1]!, aussagen: [mit(1)] }],
      }),
    ).toBeNull();
    expect(sichtbareWissensLektion({ kurs: 'islam', lektion: kopf, freigabe: mit(2, ohneBeleg()), aufgaben: [] })).toBeNull();
  });

  it('fremde Typen und Audio machen die Lektion ungültig', () => {
    const koranImWissen = { aufgabe: KW as never, freigabe: mit(2, ohneBeleg()), aussagen: [mit(2)] };
    expect(sichtbareWissensLektion({ kurs: 'islam', lektion: kopf, freigabe: mit(2, ohneBeleg()), aufgaben: [koranImWissen] })).toBeNull();
    const auswahlMitAudio = {
      aufgabe: {
        typ: 'auswahl' as const,
        schluessel: 'islam.grund.e01.l01.a09',
        anweisung: 'waehleAntwort' as const,
        optionen: [
          { text: '[A]', sprache: 'de' as const, audio: { buendel: '/lern-app/audio/de/x.lpa', versatz: 0, laenge: 1 } },
          { text: '[B]', sprache: 'de' as const },
        ],
        richtig: 0,
      },
      freigabe: mit(2, ohneBeleg()),
      aussagen: [mit(2)],
    };
    expect(
      sichtbareWissensLektion({ kurs: 'islam', lektion: kopf, freigabe: mit(2, ohneBeleg()), aufgaben: [auswahlMitAudio] }),
    ).toBeNull();
    expect(WISSENSKURS_TYPEN).not.toContain('koran_wort');
    expect(KORAN_TYPEN).toEqual(['koran_wort']);
  });

  it('Koran-Pfad: nur koran_wort, jede Aufgabe mit freigegebenen Bedeutungen', () => {
    const kopfKoran = { ...kopf, schluessel: 'koran.grund.e01.l01', kurs: 'koran' };
    const frei = {
      aufgabe: KW,
      freigabe: { anweisung: 'waehleBedeutung' as const, bedeutungen: [mit(2, ohneBeleg()), mit(2, ohneBeleg())] },
    };
    const wurzel = { aufgabe: KWW, freigabe: { anweisung: 'waehleWurzel' as const, wurzeltabelle: mit(2, ohneBeleg()) } };
    expect(
      sichtbareWissensLektion({ kurs: 'koran', lektion: kopfKoran, freigabe: mit(2, ohneBeleg()), aufgaben: [frei, wurzel] })?.aufgaben,
    ).toHaveLength(2);
    expect(
      sichtbareWissensLektion({
        kurs: 'koran',
        lektion: kopfKoran,
        freigabe: mit(2, ohneBeleg()),
        aufgaben: [frei, { ...wurzel, freigabe: { anweisung: 'waehleWurzel', wurzeltabelle: null } }],
      }),
    ).toBeNull();
  });
});
