import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';
import Auswahl from '@/components/lernapp/aufgaben/Auswahl';
import { AUFGABEN_LADER } from '@/components/lernapp/aufgaben/lader';
import Paare from '@/components/lernapp/aufgaben/Paare';
import Wortbank from '@/components/lernapp/aufgaben/Wortbank';
import { Fortschrittsleiste } from '@/components/lernapp/Fortschrittsleiste';
import { isoliert } from '@/components/lernapp/InhaltText';
import { ansage, Rueckmeldung } from '@/components/lernapp/Rueckmeldung';
import { Spieler } from '@/components/lernapp/Spieler';
import { naechsterIndex, verschiebeRichtung } from '@/components/lernapp/tastatur';
import { type AufgabenProps, type SpielerTexte, STANDARD_OPTIONEN } from '@/components/lernapp/typen';
import type { AuswahlAufgabe, PaareAufgabe, WortbankAufgabe } from '@/lib/lernapp/aufgaben/schema';
import ar from '../../../messages/lernapp/ar.json';
import de from '../../../messages/lernapp/de.json';
import entwurf from '../../../messages/lernapp/entwurf.json';
import tr from '../../../messages/lernapp/tr.json';
import { ar as arabisch } from './hilfen/buckwalter';
import { LEKTION } from './hilfen/lektion';

/**
 * Spieler-Bausteine (L1-04): Server-Rendering mit den echten Texten (Live-Region, Rollen, lang/dir, Tastaturhinweise),
 * Regeltests für den Client der Lern-App (kein next-intl, kein @/lib/utils, Übungstypen nur per import(), nur logische
 * Richtungen) und die Texte de/tr/ar (gleiche Schlüssel und Platzhalter, Entwurfsliste).
 */
const TEXTE: SpielerTexte = {
  spieler: de.spieler,
  aufgaben: de.aufgaben,
  aufgaben2: de.aufgaben2,
  sprechen: de.sprechen,
  schreiben: de.schreiben,
};
const [auswahl, wortbank, paare] = LEKTION.aufgaben as [AuswahlAufgabe, WortbankAufgabe, PaareAufgabe];
const nichts = () => undefined;

function props<T extends 'auswahl' | 'wortbank' | 'paare'>(
  aufgabe: AufgabenProps<T>['aufgabe'],
  teil: Partial<AufgabenProps<T>> = {},
): AufgabenProps<T> {
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
    weitere: TEXTE,
    ueberspringe: nichts,
    optionen: STANDARD_OPTIONEN,
    ...teil,
  };
}

async function vorrendern(ui: ReactElement): Promise<string> {
  const { prelude } = await prerenderToNodeStream(ui);
  let html = '';
  for await (const teil of prelude) html += String(teil);
  return html;
}

const anzahl = (html: string, muster: RegExp) => [...html.matchAll(muster)].length;

describe('Spieler', () => {
  it('rendert die erste Aufgabe mit Leiste, Stand, Anweisung, Optionen in Zielsprache und einer Live-Region', async () => {
    const html = await vorrendern(<Spieler lektion={LEKTION} texte={TEXTE} sprache="de" onEreignis={nichts} />);
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuenow="0"');
    expect(html).toContain('Aufgabe 1 von 3');
    expect(html).toMatch(/<h2[^>]*tabindex="-1"[^>]*>Wähle die richtige Übersetzung\.<\/h2>/);
    expect(html).toContain('<span lang="de" dir="ltr">Wasser</span>');
    expect(anzahl(html, /type="radio"/g)).toBe(3);
    expect(anzahl(html, /<span lang="tr" dir="ltr">/g)).toBe(3);
    expect(anzahl(html, /role="status"/g)).toBe(1);
    expect(html).toMatch(/<button type="submit" disabled=""[^>]*>Prüfen<\/button>/);
  });

  it('Lektion ohne spielbare Aufgabe: freundlicher Hinweis und Weg zurück', async () => {
    const html = await vorrendern(
      <Spieler
        lektion={{ ...LEKTION, aufgaben: [LEKTION.aufgaben[3]!] }}
        texte={TEXTE}
        sprache="de"
        onEreignis={nichts}
        zurueckHref="/lern-app/de/tr-aus-de"
      />,
    );
    expect(html).toContain(de.spieler.leer);
    expect(html).toContain('href="/lern-app/de/tr-aus-de"');
  });

  it('Übungstypen laden als eigene Module (import())', async () => {
    expect(Object.keys(AUFGABEN_LADER)).toEqual([
      'auswahl',
      'wortbank',
      'paare',
      'dialog',
      'geschichte',
      'lesen_fragen',
      'grammatik_tipp',
      'schrift_ar',
      'schrift_tr',
      'schrift_latein',
      'sprechen',
      'schreiben',
    ]);
    expect((await AUFGABEN_LADER.auswahl()).default).toBe(Auswahl);
    expect((await AUFGABEN_LADER.wortbank()).default).toBe(Wortbank);
    expect((await AUFGABEN_LADER.paare()).default).toBe(Paare);
  });
});

describe('Auswahl', () => {
  it('Radiogruppe mit Tastenhinweis, Ziffern und sichtbarem Fokus', () => {
    const html = renderToStaticMarkup(<Auswahl {...props<'auswahl'>(auswahl)} />);
    expect(html).toMatch(/<fieldset[^>]*aria-describedby="[^"]+"/);
    expect(html).toContain('Wähle mit den Pfeiltasten oder den Ziffern 1 bis 3.');
    expect(html).toContain('peer-focus-visible:outline-2');
    expect(anzahl(html, /<input type="radio"/g)).toBe(3);
  });

  it('nach dem Prüfen: richtige Option grün, gewählte falsche in Fehlerfarbe, alles gesperrt', () => {
    const html = renderToStaticMarkup(
      <Auswahl
        {...props<'auswahl'>(auswahl, {
          gesperrt: true,
          antwort: { typ: 'auswahl', wahl: 1 },
          auswertung: { urteil: 'falsch', hinweise: [], loesung: 'su', karten: [] },
        })}
      />,
    );
    expect(html).toContain('<fieldset class="flex flex-col gap-5" disabled=""');
    expect(html).toContain('border-fehler bg-fehler-toenung');
    expect(html).toContain('border-gruen-700 bg-gruen-50 text-gruen-800');
  });

  it('arabische Oberfläche: Ziffern östlich; arabischer Inhalt mit lang/dir und Kursschrift', () => {
    const a: AuswahlAufgabe = {
      ...auswahl,
      optionen: [
        { text: arabisch("mAA'"), sprache: 'ar' },
        { text: arabisch('xubozN'), sprache: 'ar' },
      ],
      richtig: 0,
    };
    const html = renderToStaticMarkup(<Auswahl {...props<'auswahl'>(a, { sprache: 'ar' })} />);
    expect(html).toContain('<span lang="ar" dir="rtl" class="font-arabic text-arabisch-3">');
    expect(html).toContain('\u0661');
  });
});

describe('Wortbank', () => {
  it('Bank als Werkzeugleiste mit wanderndem Tabindex, Antwortzeile leer', () => {
    const html = renderToStaticMarkup(<Wortbank {...props<'wortbank'>(wortbank)} />);
    expect(html).toMatch(/role="toolbar" aria-label="Wörter"/);
    expect(anzahl(html, /tabindex="0"/g)).toBe(1);
    expect(anzahl(html, /tabindex="-1"/g)).toBe(4);
    expect(html).toContain('aria-label="Su hinzufügen"');
    expect(html).toContain(de.aufgaben.wortbank.antwortLeer);
  });

  it('gelegte Kacheln stehen als Liste in der Antwortzeile, ihr Platz in der Bank bleibt frei', () => {
    const html = renderToStaticMarkup(<Wortbank {...props<'wortbank'>(wortbank, { antwort: { typ: 'wortbank', kacheln: [0, 1] } })} />);
    expect(html).toMatch(/<ol aria-labelledby="[^"]+"[^>]*lang="tr" dir="ltr"/);
    expect(html).toContain('aria-label="Su entfernen"');
    expect(html).toContain('aria-label="içiyorum entfernen"');
    expect(anzahl(html, /class="tritt-auf"/g)).toBe(2);
    expect(anzahl(html, /aria-hidden="true" class="[^"]*border-dashed/g)).toBe(2);
  });
});

describe('Paare', () => {
  it('zwei Listen mit Schaltern (aria-pressed), Überschriften und Tastenhinweis', () => {
    const html = renderToStaticMarkup(<Paare {...props<'paare'>(paare)} />);
    expect(anzahl(html, /aria-pressed="false"/g)).toBe(6);
    expect(anzahl(html, /<ul aria-labelledby=/g)).toBe(2);
    expect(html).toContain('>Wörter</h3>');
    expect(html).toContain('>Bedeutungen</h3>');
    expect(html).toContain(de.aufgaben.paare.tasten);
  });
});

describe('Rückmeldung und Leiste', () => {
  const basis = {
    texte: TEXTE.spieler,
    loesungSprache: 'tr' as const,
    wirdWiederholt: false,
    meldung: '',
    onWeiter: nichts,
    weiterRef: { current: null },
  };

  it('richtig: Achtstern füllt sich (B-18), Weiter-Knopf, Ansage in der Live-Region', () => {
    const html = renderToStaticMarkup(
      <Rueckmeldung {...basis} auswertung={{ urteil: 'richtig', hinweise: [], loesung: 'su', karten: [] }} />,
    );
    expect(html).toContain('stern-fuellt');
    expect(html).toMatch(/<p role="status" class="sr-only">Richtig!<\/p>/);
    expect(html).toContain('>Weiter</button>');
  });

  it('falsch: ohne Stern und ohne Weg (nur Deckkraft), Lösung isoliert mit lang/dir, Hinweis auf Wiederholung', () => {
    const a = { urteil: 'falsch' as const, hinweise: [], loesung: 'Su içiyorum.', karten: [] };
    const html = renderToStaticMarkup(<Rueckmeldung {...basis} wirdWiederholt auswertung={a} />);
    expect(html).not.toContain('stern-fuellt');
    expect(html).not.toContain('translate-y-6');
    expect(html).toContain('<bdi lang="tr" dir="ltr" class="font-bold">Su içiyorum.</bdi>');
    expect(html).toContain(de.spieler.spaeter);
    expect(ansage(a, TEXTE.spieler, true)).toBe(`Noch nicht ganz. Richtige Lösung: ${isoliert('Su içiyorum.')} ${de.spieler.spaeter}`);
  });

  it('Tippfehler: angenommen mit Hinweisen und Lösung', () => {
    const a = { urteil: 'tippfehler' as const, hinweise: ['tippfehler', 'sonderzeichen'] as const, loesung: 'Su içiyorum.', karten: [] };
    const html = renderToStaticMarkup(<Rueckmeldung {...basis} auswertung={{ ...a, hinweise: [...a.hinweise] }} />);
    expect(html).toContain('stern-fuellt');
    expect(html).toContain(de.spieler.hinweis.sonderzeichen);
    expect(html).toContain('translate-y-6 opacity-0 motion-reduce:translate-y-0');
  });

  it('ohne Auswertung: Live-Region steht leer bereit bzw. trägt die Meldung', () => {
    expect(renderToStaticMarkup(<Rueckmeldung {...basis} auswertung={null} />)).toContain('<p role="status" class="sr-only"></p>');
    expect(renderToStaticMarkup(<Rueckmeldung {...basis} auswertung={null} meldung="X" />)).toContain(
      '<p role="status" class="sr-only">X</p>',
    );
  });

  it('Leiste: Wert in Prozent, Füllung über scale vom Zeilenanfang, Spiegelung über rtl:', () => {
    const html = renderToStaticMarkup(<Fortschrittsleiste anteil={0.5} beschriftung="Fortschritt" wertText="Aufgabe 2 von 4" />);
    expect(html).toContain('aria-valuenow="50"');
    expect(html).toContain('aria-valuetext="Aufgabe 2 von 4"');
    expect(html).toContain('rtl:-scale-x-100');
    expect(html).toContain('scale:0.5 1');
    expect(html).toContain('motion-reduce:transition-none');
    expect(renderToStaticMarkup(<Fortschrittsleiste anteil={7} beschriftung="F" />)).toContain('aria-valuenow="100"');
  });
});

describe('Tastatur', () => {
  it('Pfeile folgen der Schreibrichtung; Pos1/Ende; Umlauf', () => {
    expect(naechsterIndex(0, 'ArrowRight', 3)).toBe(1);
    expect(naechsterIndex(0, 'ArrowLeft', 3)).toBe(2);
    expect(naechsterIndex(0, 'ArrowLeft', 3, true)).toBe(1);
    expect(naechsterIndex(2, 'ArrowDown', 3)).toBe(0);
    expect(naechsterIndex(1, 'Home', 3)).toBe(0);
    expect(naechsterIndex(1, 'End', 3)).toBe(2);
    expect(naechsterIndex(1, 'a', 3)).toBeNull();
    expect(naechsterIndex(0, 'ArrowRight', 0)).toBeNull();
    expect(verschiebeRichtung('ArrowRight')).toBe(1);
    expect(verschiebeRichtung('ArrowRight', true)).toBe(-1);
    expect(verschiebeRichtung('ArrowUp')).toBeNull();
  });
});

const WURZEL = join(import.meta.dirname, '..', '..', '..', 'src');
function dateien(ordner: string): string[] {
  return readdirSync(ordner).flatMap((n) => {
    const p = join(ordner, n);
    return statSync(p).isDirectory() ? dateien(p) : /\.tsx?$/.test(n) ? [p] : [];
  });
}
const KOMPONENTEN = dateien(join(WURZEL, 'components', 'lernapp')).map((p) => ({
  name: p.slice(WURZEL.length + 1),
  text: readFileSync(p, 'utf8'),
}));
const laufzeitImporte = (text: string) => text.split('\n').filter((z) => z.startsWith('import ') && !z.startsWith('import type '));

describe('Regeln für den Client der Lern-App', () => {
  it('kein next-intl und kein @/lib/utils', () => {
    expect(KOMPONENTEN.length).toBeGreaterThan(8);
    for (const { name, text } of KOMPONENTEN)
      expect(
        laufzeitImporte(text).filter((z) => /from '(next-intl[^']*|@\/lib\/utils)'/.test(z)),
        name,
      ).toEqual([]);
  });

  it('Übungskomponenten nur per import() aus aufgaben/lader.ts', () => {
    for (const { name, text } of KOMPONENTEN)
      expect(
        laufzeitImporte(text).filter((z) => /aufgaben\/(Auswahl|Wortbank|Paare)'/.test(z)),
        name,
      ).toEqual([]);
    expect(KOMPONENTEN.find((k) => k.name.endsWith('lader.ts'))?.text).toMatch(/import\('\.\/Auswahl'\)/);
  });

  it('nur logische Richtungen (keine ml-/mr-/pl-/pr-/left-/right-/text-left/text-right)', () => {
    const physisch = /(?:^|[\s'"`:])-?(?:ml|mr|pl|pr|left|right|text-left|text-right|rounded-l|rounded-r|border-l|border-r)-/;
    for (const { name, text } of KOMPONENTEN)
      for (const zeile of text.split('\n'))
        if (zeile.includes('className')) expect(physisch.test(zeile), `${name}: ${zeile.trim()}`).toBe(false);
  });
});

/** ICU-Platzhalter einer Vorlage (Namen), sortiert. */
const platzhalter = (t: string) => [...t.matchAll(/\{\s*(\w+)/g)].map((m) => m[1]).sort();
const flach = (o: object, p = ''): [string, string][] =>
  Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === 'object' ? flach(v, p ? `${p}.${k}` : k) : [[p ? `${p}.${k}` : k, String(v)] as [string, string]],
  );

/** Nur die Namensräume dieses Pakets; die übrigen prüft `pnpm sprachen:pruefen`. */
const eigene = (t: { spieler: object; aufgaben: object }) => ({ spieler: t.spieler, aufgaben: t.aufgaben });

describe('Texte messages/lernapp (Namensräume spieler und aufgaben)', () => {
  const dePaare = flach(eigene(de));
  it('de, tr und ar haben dieselben Schlüssel und Platzhalter, keiner ist leer', () => {
    for (const andere of [tr, ar]) {
      const m = new Map(flach(eigene(andere)));
      expect([...m.keys()].sort()).toEqual(dePaare.map(([k]) => k).sort());
      for (const [k, v] of dePaare) {
        expect(m.get(k)?.trim(), k).not.toBe('');
        expect(platzhalter(m.get(k) ?? ''), k).toEqual(platzhalter(v));
      }
    }
  });

  it('Entwurfsliste nennt alle Schlüssel für tr und ar; ar in arabischer Schrift (außer der Einheit XP)', () => {
    const alle = dePaare.map(([k]) => k);
    expect(entwurf.tr).toEqual(expect.arrayContaining(alle));
    expect(entwurf.ar).toEqual(expect.arrayContaining(alle));
    const arabisch = /[\u0600-\u06FF]/;
    for (const [k, v] of flach(eigene(ar))) expect(arabisch.test(v), k).toBe(k !== 'spieler.xp');
  });

  it('sanfter Wortlaut: keine Schuld- oder Verlustwörter', () => {
    const verboten = /verloren|verpasst|versagt|falsch|fehlgeschlagen|kaybett|kaçırd|yanlış|başarısız/i;
    for (const [k, v] of [...flach(eigene(de)), ...flach(eigene(tr))]) expect(verboten.test(v), `${k}: ${v}`).toBe(false);
  });
});
