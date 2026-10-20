import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import Fallfrage from '@/components/lernapp/aufgaben/Fallfrage';
import KoranWort from '@/components/lernapp/aufgaben/KoranWort';
import { AUFGABEN_LADER, bewerterFuer, ladeTyp } from '@/components/lernapp/aufgaben/lader';
import Reihenfolge from '@/components/lernapp/aufgaben/Reihenfolge';
import WahrFalsch from '@/components/lernapp/aufgaben/WahrFalsch';
import Zuordnen from '@/components/lernapp/aufgaben/Zuordnen';
import type { AufgabenProps, SpielerTexte } from '@/components/lernapp/typen';
import type { AufgabeVon, Auswertung, ImplementierterTyp } from '@/lib/lernapp/aufgaben/schema';
import ar from '../../../messages/lernapp/ar.json';
import de from '../../../messages/lernapp/de.json';

/**
 * Bedienkomponenten aus L2-03 (PLAN §4, KERN 4.0 §7–§8): Server-Rendering mit den echten Texten – Radiogruppen, Legenden mit
 * `lang`, Inhalte in ihrer Sprache (Wissenskurs Deutsch auch in der arabischen Oberfläche), Ergebnis in Worten nach der
 * Antwort, Quellenzeile aufklappbar, Hinweis „keine Auskunft für eigene Fälle“, Wortform in der Koranschrift. Nur Platzhalter.
 * Bedienung im Browser: E2E `typen-wissen.spec.ts`.
 */
const TEXTE: SpielerTexte = { spieler: de.spieler, aufgaben: de.aufgaben, tastatur: de.tastatur };
const TEXTE_AR = { spieler: ar.spieler, aufgaben: ar.aufgaben, tastatur: ar.tastatur } as unknown as SpielerTexte;
const nichts = () => undefined;
const anzahl = (html: string, muster: RegExp) => [...html.matchAll(muster)].length;
const html = (e: ReactElement) => renderToStaticMarkup(e);
const geprueft = (urteil: Auswertung['urteil'], loesung: string | null = null): Auswertung => ({
  urteil,
  hinweise: [],
  loesung,
  karten: [],
});

function props<T extends ImplementierterTyp>(aufgabe: AufgabeVon<T>, teil: Partial<AufgabenProps<T>> = {}): AufgabenProps<T> {
  return {
    aufgabe,
    texte: TEXTE.aufgaben,
    sprache: 'de',
    ziffern: 'oestlich',
    gesperrt: false,
    auswertung: null,
    antwort: null,
    setzeAntwort: nichts,
    gibAb: nichts,
    melde: nichts,
    tastatur: TEXTE.tastatur,
    ueberspringe: nichts,
    nurUeberspringen: nichts,
    ...teil,
  };
}

const WF: AufgabeVon<'wahr_falsch'> = {
  typ: 'wahr_falsch',
  schluessel: 'islam.grund.e01.l01.a01',
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
  kategorien: ['[Kategorie A]', '[Kategorie B]'],
  eintraege: [
    { text: '[Eintrag 1]', kategorie: 0 },
    { text: '[Eintrag 2]', kategorie: 1 },
    { text: '[Eintrag 3]', kategorie: 0 },
  ],
};
const RF: AufgabeVon<'reihenfolge'> = {
  typ: 'reihenfolge',
  schluessel: 'islam.grund.e01.l01.a03',
  anweisung: 'ordne',
  sprache: 'de',
  schritte: ['[Schritt 1]', '[Schritt 2]', '[Schritt 3]'],
};
const FF: AufgabeVon<'fallfrage'> = {
  typ: 'fallfrage',
  schluessel: 'islam.grund.e01.l01.a04',
  anweisung: 'waehleAntwort',
  sprache: 'de',
  fall: '[Fall 1]',
  frage: '[Frage 1]',
  optionen: ['[Antwort A]', '[Antwort B]'],
  richtig: 1,
};
const KW: AufgabeVon<'koran_wort'> = {
  typ: 'koran_wort',
  schluessel: 'koran.grund.e01.l01.a01',
  anweisung: 'waehleBedeutung',
  wort: { stelle: '0:0:1', text: '[Wortform 1]', sprache: 'ar' },
  optionen: [
    { kennung: 'test.bedeutung.1', text: '[Bedeutung 1]', sprache: 'de' },
    { kennung: 'test.bedeutung.2', text: '[Bedeutung 2]', sprache: 'de' },
  ],
  richtig: 0,
};

describe('wahr_falsch', () => {
  it('Aussage mit lang/dir, „Stimmt“ und „Stimmt nicht“ als Radiogruppe ohne Kursschrift', () => {
    const h = html(<WahrFalsch {...props(WF)} />);
    expect(h).toContain('<p lang="de" dir="ltr" class="text-24">[Aussage 1]</p>');
    expect(anzahl(h, /type="radio"/g)).toBe(2);
    expect(h).toContain('<span>Stimmt</span>');
    expect(h).toContain('<span>Stimmt nicht</span>');
    expect(h).toContain('Wähle mit den Pfeiltasten oder den Ziffern 1 bis 2.');
    expect(h).not.toContain('[Begründung 1]');
  });

  it('nach der Antwort: Ergebnis in Worten, Begründung, Quelle aufklappbar', () => {
    const h = html(
      <WahrFalsch
        {...props(WF, { gesperrt: true, auswertung: geprueft('falsch', '[Begründung 1]'), antwort: { typ: 'wahr_falsch', wahr: true } })}
      />,
    );
    expect(h).toContain('Die Aussage stimmt nicht.');
    expect(h).toContain('<bdi lang="de" dir="ltr">[Begründung 1]</bdi>');
    expect(h).toMatch(/<details[^>]*><summary[^>]*>Quelle zeigen<\/summary>/);
    expect(h).toContain('[Werk, Kapitel, Ausgabe]');
    expect(h).toMatch(/<fieldset[^>]*disabled=""/);
  });

  it('arabische Oberfläche: Bedienung arabisch, Inhalt deutsch von links nach rechts', () => {
    const h = html(<WahrFalsch {...props(WF, { sprache: 'ar', texte: TEXTE_AR.aufgaben })} />);
    expect(h).toContain(`<span>${ar.aufgaben.wahr_falsch.stimmt}</span>`);
    expect(h).toContain('<p lang="de" dir="ltr" class="text-24">[Aussage 1]</p>');
    // östlich-arabische Ziffern auf den Optionen
    expect(h).toContain('\u0661');
  });
});

describe('zuordnen', () => {
  it('je Eintrag eine Radiogruppe mit Legende in der Sprache des Inhalts', () => {
    const h = html(<Zuordnen {...props(ZO)} />);
    expect(anzahl(h, /<fieldset/g)).toBe(3);
    expect(anzahl(h, /type="radio"/g)).toBe(6);
    expect(h).toMatch(/<legend class="sr-only" lang="de" dir="ltr">\[Eintrag 1\]<\/legend>/);
    expect(h).toContain('Wähle je Eintrag die Kategorie mit den Pfeiltasten oder den Ziffern 1 bis 2.');
  });

  it('nach dem Prüfen: je Eintrag in Worten, ob er stimmt bzw. wohin er gehört', () => {
    const h = html(
      <Zuordnen {...props(ZO, { gesperrt: true, auswertung: geprueft('falsch'), antwort: { typ: 'zuordnen', zuordnung: [0, 0, 0] } })} />,
    );
    expect(anzahl(h, /Richtig zugeordnet\./g)).toBe(2);
    expect(h).toContain('Gehört zu: <bdi lang="de" dir="ltr">[Kategorie B]</bdi>');
  });
});

describe('reihenfolge', () => {
  it('geordnete Liste, gemischt; je Schritt „nach oben“/„nach unten“, am Rand gesperrt', () => {
    const h = html(<Reihenfolge {...props(RF)} />);
    expect(h).toMatch(/<ol aria-label="Schritte" aria-describedby="[^"]+"/);
    expect(anzahl(h, /<li /g)).toBe(3);
    expect(anzahl(h, /aria-label="\[Schritt \d\] nach oben"/g)).toBe(3);
    expect(anzahl(h, /aria-label="\[Schritt \d\] nach unten"/g)).toBe(3);
    expect(anzahl(h, /disabled=""/g)).toBe(2);
    expect(h).toContain('Alt und Pfeil nach oben oder unten verschiebt einen Schritt.');
    const reihe = [...h.matchAll(/<span lang="de" dir="ltr" class="text-20">(\[Schritt \d\])<\/span>/g)].map((m) => m[1]);
    expect(reihe).not.toEqual(['[Schritt 1]', '[Schritt 2]', '[Schritt 3]']);
  });

  it('nach dem Prüfen: je Stelle in Worten', () => {
    const h = html(
      <Reihenfolge {...props(RF, { gesperrt: true, auswertung: geprueft('falsch'), antwort: { typ: 'reihenfolge', folge: [0, 2, 1] } })} />,
    );
    expect(h).toContain('An der richtigen Stelle.');
    expect(h).toContain('Gehört an Stelle 3.');
    expect(h).toContain('Gehört an Stelle 2.');
  });
});

describe('fallfrage', () => {
  it('Übungsfall mit Hinweis „keine Auskunft für eigene Fälle“, Optionen als Radiogruppe', () => {
    const h = html(<Fallfrage {...props(FF)} />);
    expect(h).toContain('Übungsfall');
    expect(h).toContain(de.aufgaben.fallfrage.hinweis);
    expect(h).toContain('<p lang="de" dir="ltr" class="text-20">[Fall 1]</p>');
    expect(anzahl(h, /type="radio"/g)).toBe(2);
  });
});

describe('koran_wort', () => {
  it('Wortform in der Koranschrift mit Stelle; Bedeutungen als Radiogruppe mit lang', () => {
    const h = html(<KoranWort {...props(KW)} />);
    expect(h).toContain('<p lang="ar" dir="rtl" class="font-quran text-arabisch-1">[Wortform 1]</p>');
    expect(h).toContain('Stelle 0:0:1');
    expect(h).toContain('<span lang="de" dir="ltr">[Bedeutung 1]</span>');
    expect(anzahl(h, /type="radio"/g)).toBe(2);
  });
});

describe('Lader: eigene Chunks mit Bewertung', () => {
  it.each(['wahr_falsch', 'zuordnen', 'reihenfolge', 'fallfrage', 'koran_wort'] as const)(
    '%s lädt Komponente und Bewertung',
    async (typ) => {
      expect(AUFGABEN_LADER[typ]).toBeTypeOf('function');
      const m = await ladeTyp(typ);
      expect(m.default).toBeTypeOf('function');
      expect(bewerterFuer(typ)).toBe(m.bewerte);
    },
  );
});
