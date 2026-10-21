import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import BildWort from '@/components/lernapp/aufgaben/BildWort';
import Formen from '@/components/lernapp/aufgaben/Formen';
import Frei from '@/components/lernapp/aufgaben/Frei';
import Harakat from '@/components/lernapp/aufgaben/Harakat';
import HoerenSchreiben from '@/components/lernapp/aufgaben/HoerenSchreiben';
import HoerenWaehlen from '@/components/lernapp/aufgaben/HoerenWaehlen';
import Luecke from '@/components/lernapp/aufgaben/Luecke';
import Minimalpaare from '@/components/lernapp/aufgaben/Minimalpaare';
import Satzbau from '@/components/lernapp/aufgaben/Satzbau';
import { AUFGABEN_LADER, bewerterFuer, ladeTyp } from '@/components/lernapp/aufgaben/lader';
import ArabischeTastatur from '@/components/lernapp/tastatur/ArabischeTastatur';
import { type AufgabenProps, type SpielerTexte, STANDARD_OPTIONEN } from '@/components/lernapp/typen';
import type { AufgabeVon, Auswertung, ImplementierterTyp } from '@/lib/lernapp/aufgaben/schema';
import de from '../../../messages/lernapp/de.json';
import { ar } from './hilfen/buckwalter';

/**
 * Bedienkomponenten der Übungstypen aus L2-01 (PLAN §4, KERN 4.0 §7–§8): Server-Rendering mit den echten Texten –
 * Rollen, Beschriftungen, `lang`/`dir`, Tastenhinweise, „Audio folgt“, Bild-Hinweis erst nach der Antwort, Kopfbezug der
 * Formentabelle, Zeichennamen bei Harakat, Bildschirmtastatur. Bedienung im Browser: E2E `typen-a.spec.ts`.
 */
const TEXTE: SpielerTexte = {
  spieler: de.spieler,
  aufgaben: de.aufgaben,
  tastatur: de.tastatur,
  aufgaben2: de.aufgaben2,
  sprechen: de.sprechen,
  schreiben: de.schreiben,
};
const nichts = () => undefined;
const T = (text: string, sprache: 'de' | 'tr' | 'ar' = 'tr') => ({ text, sprache });
const AUDIO = { buendel: '/lern-app/audio/tr/tr.a1.e01-0123456789abcdef.lpa', versatz: 100, laenge: 50 };
const anzahl = (html: string, muster: RegExp) => [...html.matchAll(muster)].length;

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
    weitere: TEXTE,
    ueberspringe: nichts,
    nurUeberspringen: nichts,
    optionen: STANDARD_OPTIONEN,
    ...teil,
  };
}
const html = (e: ReactElement) => renderToStaticMarkup(e);
const geprueft = (urteil: Auswertung['urteil'], loesung: string | null = null): Auswertung => ({
  urteil,
  hinweise: [],
  loesung,
  karten: [],
});

const bild: AufgabeVon<'bild_wort'> = {
  typ: 'bild_wort',
  schluessel: 'tr.a1.e01.l03.a01',
  anweisung: 'waehleWort',
  bild: {
    symbol: 'haus',
    pfade: ['M3 10 12 3l9 7v11H3z', 'M9 12h6v9h-6z'],
  },
  optionen: [T('ev'), T('kitap'), T('su')],
  richtig: 0,
  beschreibung: T('Haus', 'de'),
};

describe('bild_wort', () => {
  it('vor der Antwort: Bild ohne Beschreibung (nur Hinweis „Bildübung“), Linien-Symbol, Radiogruppe', () => {
    const h = html(<BildWort {...props(bild)} />);
    expect(h).toMatch(/<figcaption id="[^"]+" class="sr-only">Bildübung: Das Bild zeigt das gesuchte Wort\.<\/figcaption>/);
    expect(h).not.toContain('Haus');
    expect(h).toMatch(/<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"/);
    expect(h).toContain('<path d="M3 10 12 3l9 7v11H3z"></path>');
    expect(h).toContain('<path d="M9 12h6v9h-6z"></path>');
    expect(anzahl(h, /type="radio"/g)).toBe(3);
    expect(h).toContain('Wähle mit den Pfeiltasten oder den Ziffern 1 bis 3.');
  });

  it('nach der Antwort: Beschreibung sichtbar, mit lang/dir', () => {
    const h = html(
      <BildWort {...props(bild, { gesperrt: true, auswertung: geprueft('richtig', 'ev'), antwort: { typ: 'bild_wort', wahl: 0 } })} />,
    );
    expect(h).toMatch(/<figcaption id="[^"]+" class="text-20">Bild: <bdi lang="de" dir="ltr" class="font-bold">Haus<\/bdi><\/figcaption>/);
  });
});

describe('frei und Zeichenhilfe', () => {
  const frei: AufgabeVon<'frei'> = { typ: 'frei', schluessel: 'f1', vorgabe: T('Brot', 'de'), sprache: 'tr', loesungen: ['ekmek'] };

  it('Türkisch: beschriftetes Feld mit lang/dir, ohne Autokorrektur; Sonderzeichenleiste als Werkzeugleiste', () => {
    const h = html(<Frei {...props(frei)} />);
    expect(h).toMatch(/<label for="([^"]+)"[^>]*>Deine Antwort<\/label><input id="\1" type="text" lang="tr" dir="ltr"/);
    expect(h).toContain('autoComplete="off"');
    expect(h).toContain('spellCheck="false"');
    expect(h).toMatch(/role="toolbar" aria-label="Sonderzeichen" aria-controls="[^"]+"/);
    expect(anzahl(h, /aria-label="[^"]+ einfügen"/g)).toBe(7);
    expect(h).toContain('aria-label="İ einfügen"');
    expect(anzahl(h, /tabindex="0"/g)).toBe(1);
    // Name des Knopfs in der Oberflächensprache (Stimme der Oberfläche), nur das sichtbare Zeichen in der Zielsprache
    expect(anzahl(h, /<button type="button"[^>]*aria-label="[^"]+ einfügen"[^>]*><span lang="tr">[^<]+<\/span><\/button>/g)).toBe(7);
    expect(h).not.toMatch(/<button[^>]* lang="tr"[^>]*aria-label="[^"]+ einfügen"/);
  });

  it('Arabisch: Feld von rechts nach links in der Kursschrift; Schalter für die Bildschirmtastatur (zu)', () => {
    const h = html(<Frei {...props({ ...frei, sprache: 'ar', loesungen: [ar('xubozN')] })} />);
    expect(h).toMatch(/<input id="[^"]+" type="text" lang="ar" dir="rtl"[^>]*class="[^"]*font-arabic text-arabisch-3/);
    expect(h).toMatch(/<button type="button" aria-expanded="false" aria-controls="[^"]+"[^>]*>Arabische Tastatur<\/button>/);
    expect(h).not.toContain('role="toolbar"');
  });

  it('nach dem Prüfen: Feld gesperrt, Rand nach Urteil', () => {
    const h = html(
      <Frei {...props(frei, { gesperrt: true, auswertung: geprueft('falsch', 'ekmek'), antwort: { typ: 'frei', text: 'su' } })} />,
    );
    expect(h).toMatch(/<input[^>]*disabled=""[^>]*border-fehler/);
  });
});

describe('Hörübungen', () => {
  const hw: AufgabeVon<'hoeren_waehlen'> = {
    typ: 'hoeren_waehlen',
    schluessel: 'h1',
    anweisung: 'waehleBedeutung',
    hoeren: { ...T('su'), audio: AUDIO },
    optionen: [T('Wasser', 'de'), T('Brot', 'de')],
    richtig: 0,
  };

  it('mit Clip: Anhören, langsam, „Ich kann gerade nicht hören“, Radiogruppe', () => {
    const h = html(<HoerenWaehlen {...props(hw)} />);
    expect(h).toContain('>Anhören</button>');
    expect(h).toContain('>Langsam anhören</button>');
    expect(h).toContain('>Ich kann gerade nicht hören</button>');
    expect(anzahl(h, /type="radio"/g)).toBe(2);
    expect(h).not.toContain('Audio folgt');
  });

  it('ohne Clip: „Audio folgt“ und „Weiter ohne Hören“, keine Optionen (keine Sackgasse)', () => {
    const h = html(<HoerenWaehlen {...props({ ...hw, hoeren: T('su') })} />);
    expect(h).toContain('Audio folgt');
    expect(h).toContain(de.aufgaben.hoeren.audioFolgtText);
    expect(h).toContain('>Weiter ohne Hören</button>');
    expect(h).not.toContain('type="radio"');
  });

  it('nach der Antwort: Abschrift mit lang/dir', () => {
    const h = html(
      <HoerenWaehlen
        {...props(hw, { gesperrt: true, auswertung: geprueft('richtig', 'Wasser'), antwort: { typ: 'hoeren_waehlen', wahl: 0 } })}
      />,
    );
    expect(h).toContain('Abschrift: <span lang="tr" dir="ltr">su</span>');
    expect(h).not.toContain('Ich kann gerade nicht hören');
  });

  it('Diktat: Abspieler und Antwortfeld; Minimalpaare groß in einer Spalte', () => {
    const hs: AufgabeVon<'hoeren_schreiben'> = {
      typ: 'hoeren_schreiben',
      schluessel: 'h2',
      hoeren: { ...T('kitap'), audio: AUDIO },
      sprache: 'tr',
      loesungen: ['kitap'],
    };
    const h = html(<HoerenSchreiben {...props(hs)} />);
    expect(h).toContain('>Anhören</button>');
    expect(h).toMatch(/>Gehörter Text<\/label><input id="[^"]+" type="text" lang="tr"/);
    const mp: AufgabeVon<'minimalpaare'> = {
      typ: 'minimalpaare',
      schluessel: 'm1',
      hoeren: { ...T('üç'), audio: AUDIO },
      optionen: [T('üç'), T('uç')],
      richtig: 0,
    };
    const m = html(<Minimalpaare {...props(mp)} />);
    expect(anzahl(m, /type="radio"/g)).toBe(2);
    expect(m).toContain('text-30');
    expect(m).not.toContain('sm:grid-cols-2');
  });
});

describe('luecke', () => {
  const lw: AufgabeVon<'luecke'> = {
    typ: 'luecke',
    schluessel: 'l1',
    vor: 'Su ',
    nach: '.',
    sprache: 'tr',
    optionen: ['içiyorum', 'içiyorsun'],
    loesungen: ['içiyorum'],
    hilfe: T('Ich trinke Wasser.', 'de'),
  };

  it('mit Optionen: Satz mit lang/dir, Radiogruppe, Hilfe isoliert', () => {
    const h = html(<Luecke {...props(lw)} />);
    expect(h).toMatch(/<p lang="tr" dir="ltr" class="[^"]*">Su <span aria-hidden="true"/);
    expect(anzahl(h, /type="radio"/g)).toBe(2);
    expect(h).toContain('Bedeutung: <bdi lang="de" dir="ltr">Ich trinke Wasser.</bdi>');
    // die Radiogruppe ist mit dem Satz (mit „…“ statt der Lücke) verbunden, danach der Tastenhinweis
    const satz = /<p id="([^"]+)" lang="tr" dir="ltr" class="sr-only">Su  … \.<\/p>/.exec(h)?.[1];
    expect(satz).toBeTruthy();
    expect(h).toMatch(new RegExp(`<fieldset[^>]*aria-describedby="${satz} [^"]+-tasten"`));
  });

  it('ohne Optionen: beschriftetes Feld im Satz, Beschreibung mit „…“, arabisch von rechts nach links', () => {
    const h = html(<Luecke {...props({ ...lw, optionen: undefined })} />);
    expect(h).toMatch(
      /<label for="([^"]+)" class="sr-only">Lücke<\/label><input id="\1" type="text" lang="tr" dir="ltr"[^>]*aria-describedby="([^"]+)"/,
    );
    expect(h).toMatch(/<p id="[^"]+" lang="tr" dir="ltr" class="sr-only">Su  … .<\/p>/);
    const a = html(
      <Luecke {...props({ ...lw, optionen: undefined, sprache: 'ar', vor: `${ar('>anaA')} `, nach: '.', loesungen: [ar('>a$orabu')] })} />,
    );
    expect(a).toMatch(/<p lang="ar" dir="rtl" class="[^"]*font-arabic text-arabisch-2/);
    expect(a).toContain('>Arabische Tastatur</button>');
  });
});

describe('satzbau, formen, harakat', () => {
  it('satzbau: Bedienung der Wortbank ohne Ablenker, Übersetzung als Hilfe', () => {
    const sb: AufgabeVon<'satzbau'> = {
      typ: 'satzbau',
      schluessel: 's1',
      vorgabe: T('Ev büyük.'),
      sprache: 'de',
      kacheln: ['Das', 'Haus', 'ist', 'groß'],
      loesungen: ['Das Haus ist groß.'],
    };
    const h = html(<Satzbau {...props(sb)} />);
    expect(h).toMatch(/role="toolbar" aria-label="Wörter"/);
    expect(anzahl(h, /aria-label="[^"]+ hinzufügen"/g)).toBe(4);
    expect(h).toContain('<span lang="tr" dir="ltr">Ev büyük.</span>');
  });

  it('formen: Tabelle mit Köpfen (scope), Felder mit Kopfbezug, vorgegebene Zelle als Text; nach dem Prüfen die richtige Form', () => {
    const fo: AufgabeVon<'formen'> = {
      typ: 'formen',
      schluessel: 'fo1',
      sprache: 'de',
      titel: T('trinken', 'de'),
      zeilen: ['ich', 'du'],
      spalten: ['Präsens'],
      zellen: [
        { zeile: 0, spalte: 0, loesungen: ['trinke'], vorgabe: true },
        { zeile: 1, spalte: 0, loesungen: ['trinkst'] },
      ],
    };
    const h = html(<Formen {...props(fo)} />);
    expect(h).toContain('<caption');
    expect(h).toMatch(/<th id="([^"]+)" scope="col" lang="de" dir="ltr"[^>]*>Präsens<\/th>/);
    expect(anzahl(h, /scope="row"/g)).toBe(2);
    expect(h).toMatch(/<input id="[^"]+" type="text" lang="de" dir="ltr"[^>]*aria-labelledby="[^" ]+r1 [^" ]+s0"/);
    expect(h).toMatch(/<td lang="de" dir="ltr"[^>]*>trinke<\/td>/);
    expect(anzahl(h, /<input/g)).toBe(1);
    const n = html(
      <Formen {...props(fo, { gesperrt: true, auswertung: geprueft('falsch'), antwort: { typ: 'formen', werte: ['', 'trinke'] } })} />,
    );
    expect(n).toContain('Richtig: <bdi lang="de" dir="ltr" class="font-bold">trinkst</bdi>');
  });

  it('harakat: große Kursschrift, jede Option mit den Namen ihrer Zeichen für Screenreader', () => {
    const ha: AufgabeVon<'harakat'> = {
      typ: 'harakat',
      schluessel: 'ha1',
      anweisung: 'waehleVokalisierung',
      vorgabe: T('Buch', 'de'),
      optionen: [T(ar('kitaAb'), 'ar'), T(ar('kataAb'), 'ar')],
      richtig: 0,
    };
    const h = html(<Harakat {...props(ha)} />);
    expect(anzahl(h, /type="radio"/g)).toBe(2);
    expect(h).toContain('font-arabic text-arabisch-1');
    expect(h).toContain('Kaf Kasra, Ta Fatha, Alif, Ba');
    expect(h).toContain('Kaf Fatha, Ta Fatha, Alif, Ba');
    expect(anzahl(h, /<input type="radio"[^>]*aria-describedby=/g)).toBe(2);
    expect(h).toContain('Bedeutung: <bdi lang="de" dir="ltr" class="font-bold">Buch</bdi>');
  });
});

describe('Lader der Übungstypen', () => {
  it('jedes Modul bringt seine Bewertung mit; ladeTyp merkt sie sich für die Engine', async () => {
    expect(bewerterFuer('frei')).toBeUndefined();
    const m = await ladeTyp('frei');
    expect(typeof m.default).toBe('function');
    expect(bewerterFuer('frei')).toBe(m.bewerte);
    for (const t of Object.keys(AUFGABEN_LADER) as ImplementierterTyp[]) {
      const modul = await AUFGABEN_LADER[t]();
      expect(typeof modul.bewerte, t).toBe('function');
    }
  });
});

describe('arabische Bildschirmtastatur', () => {
  it('eine Werkzeugleiste von rechts nach links, Tasten mit Namen, wandernder Tabindex', () => {
    const h = html(
      <ArabischeTastatur
        texte={TEXTE.tastatur}
        namen={de.aufgaben.harakat.zeichen}
        feldId="f"
        gesperrt={false}
        onZeichen={nichts}
        onLoeschen={nichts}
      />,
    );
    expect(h).toMatch(/<div role="toolbar" aria-label="Arabische Tastatur" aria-controls="f" aria-describedby="[^"]+" dir="rtl"/);
    expect(anzahl(h, /<button/g)).toBe(36 + 8 + 2);
    expect(anzahl(h, /tabindex="0"/g)).toBe(1);
    for (const name of ['Ḍad', 'Ba', 'Hamza', 'Taa marbuta', 'Fatha', 'Schadda', 'Tanwin Kasra', 'Leerzeichen', 'Zeichen löschen'])
      expect(h, name).toContain(`aria-label="${name}"`);
  });
});
