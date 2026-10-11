import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import styleguide from '../../messages/verwaltung/styleguide.json';
import {
  ABSCHNITTE,
  ABSCHNITTSABSTAENDE,
  ABSTAENDE,
  ABSTAND_BASIS,
  ANZEIGESTUFEN,
  BREITEN,
  DAUERN,
  EBENEN,
  FARBEN,
  HALTEPUNKTE,
  KONTRASTBEISPIELE,
  KURVEN,
  LAUFWEITE,
  RADIEN,
  SCHATTEN,
  SCHRIFTEN,
  SCHRIFTGROESSEN,
  ZEILENHOEHEN,
  remZuPx,
} from '@/components/verwaltung/styleguide/tokens';

/**
 * V14 Styleguide: Die Nachschlageseite zeigt nur Werte, die `src/app/globals.css` (@theme) tatsächlich setzt.
 * Geprüft wird: Jeder Eintrag der Liste in `tokens.ts` stimmt mit globals.css überein (@theme und :root), keine Variable
 * fehlt, die Klassen nutzen genau ihren Token, Kontrastangaben stehen im Token-Kommentar, die Beispielpaare ergeben die genannten
 * Verhältnisse, und jeder Schlüssel hat einen Text in `messages/verwaltung/styleguide.json`.
 */

const CSS = readFileSync(join(import.meta.dirname, '..', '..', 'src', 'app', 'globals.css'), 'utf8');
const THEMA = /@theme \{([\s\S]*?)\n\}/.exec(CSS)?.[1] ?? '';

/** Deklarationen des @theme-Blocks: Name → Wert und Kommentar, zeilenweise gelesen. */
const theme = new Map<string, { wert: string; kommentar: string }>();
for (const zeile of THEMA.split('\n')) {
  const m = /^\s*(--[\w-]+):\s*(.+?);\s*(?:\/\*(.*?)\*\/)?\s*$/.exec(zeile);
  if (m) theme.set(m[1], { wert: m[2].trim(), kommentar: (m[3] ?? '').trim() });
}

/** Variablen mit diesem Präfix; Zeilenhöhen (`--…--line-height`) zählen nicht als eigene Variable. */
const namen = (praefix: string) => [...theme.keys()].filter((n) => n.startsWith(praefix) && !n.endsWith('--line-height')).sort();

function wert(name: string): string {
  const e = theme.get(name);
  if (!e) throw new Error(`${name} fehlt in globals.css (@theme)`);
  return e.wert;
}

/** Deklarationen des :root-Blocks (Dauern, Ebenen): Name → Wert, zeilenweise gelesen. */
const WURZEL = /:root \{([\s\S]*?)\n\}/.exec(CSS)?.[1] ?? '';
const wurzel = new Map<string, string>();
for (const zeile of WURZEL.split('\n')) {
  const m = /^\s*(--[\w-]+):\s*(.+?);\s*(?:\/\*.*?\*\/)?\s*$/.exec(zeile);
  if (m) wurzel.set(m[1], m[2].trim());
}

const wurzelNamen = (praefix: string) => [...wurzel.keys()].filter((n) => n.startsWith(praefix)).sort();

function wurzelWert(name: string): string {
  const w = wurzel.get(name);
  if (w === undefined) throw new Error(`${name} fehlt in globals.css (:root)`);
  return w;
}

/** Ein clamp()-Wert nennt genau die Grenzen, die das Token angibt. */
function klammert(wertText: string, min: string, max: string): boolean {
  return wertText.startsWith(`clamp(${min}, `) && wertText.endsWith(`, ${max})`);
}

/** Relative Leuchtdichte nach WCAG 2.x aus einem Hex-Wert wie `#047857`. */
function leuchtdichte(hex: string): number {
  const kanal = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const [r, g, b] = [1, 3, 5].map((i) => kanal(Number.parseInt(hex.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Kontrastverhältnis nach WCAG: heller Wert plus 0,05, geteilt durch den dunkleren Wert plus 0,05. */
function verhaeltnis(a: string, b: string): number {
  const [hell, dunkel] = [leuchtdichte(a), leuchtdichte(b)].sort((x, y) => y - x);
  return (hell + 0.05) / (dunkel + 0.05);
}

/** Ausgabe wie im Design: zwei Nachkommastellen mit Komma und „:1“. */
const alsDesign = (x: number) => `${x.toFixed(2).replace('.', ',')}:1`;

/** Text aus den Messages unter dem Pfad; fehlt er oder ist er leer, kommt `undefined`. */
function text(...pfad: string[]): string | undefined {
  let o: unknown = styleguide.styleguide;
  for (const k of pfad) o = o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined;
  return typeof o === 'string' && o.trim() !== '' ? o : undefined;
}

describe('Styleguide (V14): Werte und Namen gegen globals.css', () => {
  it('globals.css enthält einen @theme-Block', () => {
    expect(THEMA.length).toBeGreaterThan(0);
  });

  it.each(FARBEN.map((f) => [f.name, f.wert]))('%s hat in globals.css den Wert aus der Liste', (name, erwartet) => {
    expect(wert(name)).toBe(erwartet);
  });

  it.each(SCHRIFTGROESSEN.map((s) => [s.name, s.wert, s.zeile]))('%s: Größe und Zeilenhöhe stimmen', (name, groesse, zeile) => {
    expect(wert(name)).toBe(groesse);
    expect(wert(`${name}--line-height`)).toBe(zeile);
  });

  it.each(SCHRIFTEN.map((s) => [s.name, s.wert]))('%s: Schriftstapel stimmt', (name, erwartet) => {
    expect(wert(name)).toBe(erwartet);
  });

  it.each(ANZEIGESTUFEN.map((s) => [s.name, s.wert, s.zeile, s.min, s.max]))(
    '%s: fließende Größe, Grenzen und Zeilenhöhe stimmen',
    (name, erwartet, zeile, min, max) => {
      expect(wert(name)).toBe(erwartet);
      expect(klammert(wert(name), min, max)).toBe(true);
      expect(wert(`${name}--line-height`)).toBe(zeile);
    },
  );

  it.each(ABSCHNITTSABSTAENDE.map((a) => [a.name, a.wert, a.min, a.max]))(
    '%s: fließender Abschnittsabstand und Grenzen stimmen',
    (name, erwartet, min, max) => {
      expect(wert(name)).toBe(erwartet);
      expect(klammert(wert(name), min, max)).toBe(true);
    },
  );

  it.each([...ZEILENHOEHEN, ...BREITEN, ...HALTEPUNKTE, ...KURVEN].map((e) => [e.name, e.wert]))(
    '%s hat den Wert aus der Liste',
    (name, erwartet) => {
      expect(wert(name)).toBe(erwartet);
    },
  );

  it.each([...DAUERN, ...EBENEN].map((e) => [e.name, e.wert]))('%s hat den Wert aus der Liste (:root)', (name, erwartet) => {
    expect(wurzelWert(name)).toBe(erwartet);
  });

  it.each([
    [LAUFWEITE.name, LAUFWEITE.wert],
    [ABSTAND_BASIS.name, ABSTAND_BASIS.wert],
    ...RADIEN.map((r) => [r.name, r.wert]),
    ...SCHATTEN.map((s) => [s.name, s.wert]),
  ])('%s hat den Wert aus der Liste', (name, erwartet) => {
    expect(wert(name)).toBe(erwartet);
  });

  it('jede Farbe aus @theme steht in der Liste, und umgekehrt', () => {
    expect(namen('--color-')).toEqual(FARBEN.map((f) => f.name).sort());
  });

  it('die Skala text-16 bis text-48 und die Anzeigestufen sind vollständig; Sonderstufen der Moschee-Anzeige stehen bewusst nicht auf der Seite', () => {
    expect(namen('--text-').filter((n) => !n.startsWith('--text-anzeige-'))).toEqual(
      [...SCHRIFTGROESSEN, ...ANZEIGESTUFEN].map((s) => s.name).sort(),
    );
  });

  it('Schriften, Laufweite, Abstände, Zeilenhöhen, Breiten, Haltepunkte, Kurven, Radien und Schatten sind vollständig', () => {
    expect(namen('--font-')).toEqual(SCHRIFTEN.map((s) => s.name).sort());
    expect(namen('--tracking-')).toEqual([LAUFWEITE.name]);
    expect(namen('--spacing')).toEqual([ABSTAND_BASIS.name, ...ABSCHNITTSABSTAENDE.map((a) => a.name)].sort());
    expect(namen('--leading-')).toEqual(ZEILENHOEHEN.map((z) => z.name).sort());
    expect(namen('--container-')).toEqual(BREITEN.map((b) => b.name).sort());
    expect(namen('--breakpoint-')).toEqual(HALTEPUNKTE.map((h) => h.name).sort());
    expect(namen('--ease-')).toEqual(KURVEN.map((k) => k.name).sort());
    expect(namen('--radius-')).toEqual(RADIEN.map((r) => r.name).sort());
    expect(namen('--shadow-')).toEqual(SCHATTEN.map((s) => s.name).sort());
  });

  it('Dauern und Ebenen stehen vollständig in :root', () => {
    expect(wurzelNamen('--dauer-')).toEqual(DAUERN.map((d) => d.name).sort());
    expect(wurzelNamen('--ebene-')).toEqual(EBENEN.map((e) => e.name).sort());
  });

  it('die Klasse jedes Eintrags nutzt genau diesen Token', () => {
    for (const f of FARBEN) expect(f.klasse).toBe(`bg-${f.name.slice('--color-'.length)}`);
    for (const s of SCHRIFTGROESSEN) expect(s.muster.split(' ')).toContain(`text-${s.name.slice('--text-'.length)}`);
    for (const s of ANZEIGESTUFEN) expect(s.muster.split(' ')).toContain(`text-${s.name.slice('--text-'.length)}`);
    for (const a of ABSCHNITTSABSTAENDE) expect(a.klasse).toBe(`py-${a.name.slice('--spacing-'.length)}`);
    for (const z of ZEILENHOEHEN) expect(z.klasse).toBe(`leading-${z.name.slice('--leading-'.length)}`);
    for (const b of BREITEN) expect(b.klasse).toBe(`max-w-${b.name.slice('--container-'.length)}`);
    for (const h of HALTEPUNKTE) expect(h.klasse).toBe(`${h.name.slice('--breakpoint-'.length)}:`);
    for (const k of KURVEN) expect(k.klasse).toBe(`ease-${k.name.slice('--ease-'.length)}`);
    for (const d of DAUERN) expect(d.klasse).toBe(`duration-(${d.name})`);
    for (const e of EBENEN) expect(e.klasse).toBe(`z-(${e.name})`);
    for (const s of SCHRIFTEN) expect(s.klasse).toBe(`font-${s.name.slice('--font-'.length)}`);
    expect(LAUFWEITE.klasse).toBe(`tracking-${LAUFWEITE.name.slice('--tracking-'.length)}`);
    for (const a of ABSTAENDE) expect(a.klasse).toBe(`w-${a.schritt}`);
    for (const r of RADIEN) expect(r.klasse).toBe(`rounded-${r.name.slice('--radius-'.length)}`);
    for (const s of SCHATTEN) expect(s.klasse).toBe(`shadow-${s.name.slice('--shadow-'.length)}`);
    for (const k of KONTRASTBEISPIELE) {
      expect(k.klasse).toContain(`bg-${k.hintergrund.slice('--color-'.length)}`);
      expect(k.klasse).toContain(`text-${k.vordergrund.slice('--color-'.length)}`);
    }
  });

  it('Kontrastangaben stehen im Token-Kommentar, und jeder Kommentar mit Verhältnis ist aufgeführt', () => {
    const genannt = [...theme.entries()]
      .filter(([n, e]) => n.startsWith('--color-') && /(?:≥\s*)?\d+(?:[.,]\d+)?:1/.test(e.kommentar))
      .map(([n]) => n)
      .sort();
    const mitAngabe = FARBEN.flatMap((f) => (f.kontrast ? [{ name: f.name, kontrast: f.kontrast }] : []));
    expect(genannt).toEqual(mitAngabe.map((f) => f.name).sort());
    for (const f of mitAngabe) expect(theme.get(f.name)?.kommentar).toContain(f.kontrast);
  });

  it.each(KONTRASTBEISPIELE.map((k) => [k.schluessel, k.vordergrund, k.hintergrund, k.verhaeltnis, k.stufe]))(
    'Kontrastbeispiel %s: Verhältnis und Stufe ergeben sich aus den Tokens',
    (_schluessel, vorder, hinter, erwartetesVerhaeltnis, stufe) => {
      const v = verhaeltnis(wert(vorder), wert(hinter));
      expect(alsDesign(v)).toBe(erwartetesVerhaeltnis);
      expect(v >= 7 ? 'AAA' : v >= 4.5 ? 'AA' : 'unter AA').toBe(stufe);
    },
  );

  it('die Basis 0.25rem ergibt 4 px je Schritt', () => {
    expect(remZuPx(ABSTAND_BASIS.wert)).toBe(4);
  });

  it('Namen und Farbschlüssel sind eindeutig', () => {
    const alle = [
      ...FARBEN,
      ...SCHRIFTGROESSEN,
      ...ANZEIGESTUFEN,
      ...SCHRIFTEN,
      ...RADIEN,
      ...SCHATTEN,
      ...ABSCHNITTSABSTAENDE,
      ...ZEILENHOEHEN,
      ...BREITEN,
      ...HALTEPUNKTE,
      ...KURVEN,
      ...DAUERN,
      ...EBENEN,
    ].map((e) => e.name);
    expect(new Set(alle).size).toBe(alle.length);
    const schluessel = FARBEN.map((f) => f.schluessel);
    expect(new Set(schluessel).size).toBe(schluessel.length);
  });
});

describe('Styleguide (V14): Texte in messages/verwaltung/styleguide.json', () => {
  it('jeder Schlüssel aus der Liste hat einen Text', () => {
    const fehlt = [
      ...FARBEN.filter((f) => !text('farben', 'verwendungen', f.schluessel)).map((f) => `farben.verwendungen.${f.schluessel}`),
      ...SCHRIFTGROESSEN.flatMap((s) => [
        ...(text('typografie', 'rollen', s.schluessel) ? [] : [`typografie.rollen.${s.schluessel}`]),
        ...(text('typografie', 'muster', s.schluessel) ? [] : [`typografie.muster.${s.schluessel}`]),
      ]),
      ...SCHRIFTEN.flatMap((s) => [
        ...(text('typografie', 'schriftVerwendung', s.schluessel) ? [] : [`typografie.schriftVerwendung.${s.schluessel}`]),
        ...(text('typografie', 'schriftMuster', s.schluessel) ? [] : [`typografie.schriftMuster.${s.schluessel}`]),
      ]),
      ...ANZEIGESTUFEN.flatMap((s) => [
        ...(text('typografie', 'anzeigeRollen', s.schluessel) ? [] : [`typografie.anzeigeRollen.${s.schluessel}`]),
        ...(text('typografie', 'anzeigeMuster', s.schluessel) ? [] : [`typografie.anzeigeMuster.${s.schluessel}`]),
      ]),
      ...ZEILENHOEHEN.filter((z) => !text('typografie', 'zeilenRollen', z.schluessel)).map(
        (z) => `typografie.zeilenRollen.${z.schluessel}`,
      ),
      ...ABSCHNITTSABSTAENDE.filter((a) => !text('abstaende', 'abschnittRollen', a.schluessel)).map(
        (a) => `abstaende.abschnittRollen.${a.schluessel}`,
      ),
      ...BREITEN.filter((b) => !text('raster', 'breiten', b.schluessel)).map((b) => `raster.breiten.${b.schluessel}`),
      ...HALTEPUNKTE.filter((h) => !text('raster', 'haltepunkte', h.schluessel)).map((h) => `raster.haltepunkte.${h.schluessel}`),
      ...KURVEN.filter((k) => !text('bewegung', 'kurve', k.schluessel)).map((k) => `bewegung.kurve.${k.schluessel}`),
      ...DAUERN.filter((d) => !text('bewegung', 'dauer', d.schluessel)).map((d) => `bewegung.dauer.${d.schluessel}`),
      ...EBENEN.filter((e) => !text('ebenen', 'ebene', e.schluessel)).map((e) => `ebenen.ebene.${e.schluessel}`),
      ...RADIEN.filter((r) => !text('radien', 'verwendungen', r.schluessel)).map((r) => `radien.verwendungen.${r.schluessel}`),
      ...SCHATTEN.filter((s) => !text('schatten', 'verwendungen', s.schluessel)).map((s) => `schatten.verwendungen.${s.schluessel}`),
      ...KONTRASTBEISPIELE.filter((k) => !text('barrierefreiheit', 'kontrastBeispiele', k.schluessel)).map(
        (k) => `barrierefreiheit.kontrastBeispiele.${k.schluessel}`,
      ),
      ...ABSCHNITTE.flatMap((a) => [...(text(a, 'titel') ? [] : [`${a}.titel`]), ...(text('nav', a) ? [] : [`nav.${a}`])]),
    ];
    expect(fehlt).toEqual([]);
  });

  it('die fest eingetragenen Schlüssel der Bausteine und Abschnitte haben einen Text', () => {
    const fest = [
      'eyebrow',
      'titel',
      'einleitung',
      'navName',
      'token',
      'wert',
      'verwendung',
      'kontrast',
      'farben.einleitung',
      'farben.gruppen.marke',
      'farben.gruppen.neutral',
      'farben.gruppen.status',
      'farben.gruppen.organisationen',
      'farben.gruppen.tags',
      'typografie.einleitung',
      'typografie.zeile',
      'typografie.schriften',
      'typografie.schriftenEinleitung',
      'typografie.laufweite',
      'typografie.laufweiteMuster',
      'abstaende.einleitung',
      'abstaende.basis',
      'abstaende.schritt',
      'abstaende.pixel',
      'radien.einleitung',
      'schatten.einleitung',
      'knoepfe.einleitung',
      'knoepfe.primaer',
      'knoepfe.sekundaer',
      'knoepfe.umriss',
      'knoepfe.tertiaer',
      'knoepfe.loeschen',
      'knoepfe.link',
      'knoepfe.deaktiviert',
      'felder.einleitung',
      'felder.pflicht',
      'felder.name',
      'felder.nameHinweis',
      'felder.email',
      'felder.emailFehler',
      'felder.nachricht',
      'felder.nachrichtHinweis',
      'felder.auswahl',
      'felder.auswahlLeer',
      'felder.optionen',
      'felder.optionErste',
      'felder.optionErsteText',
      'felder.optionZweite',
      'felder.optionZweiteText',
      'felder.haken',
      'felder.hakenText',
      'felder.einwilligung',
      'pillen.einleitung',
      'pillen.statusTitel',
      'pillen.kategorieTitel',
      'pillen.status.veroeffentlicht',
      'pillen.status.entwurf',
      'pillen.status.kommend',
      'pillen.status.vergangen',
      'pillen.status.beispiel',
      'pillen.kategorie.bildung',
      'pillen.kategorie.veranstaltung',
      'pillen.kategorie.jugend',
      'pillen.kategorie.wichtig',
      'pillen.kategorie.neuigkeiten',
      'pillen.kategorie.gemeinde',
      'karten.einleitung',
      'karten.beispielTitel',
      'karten.beispielText',
      'karten.beispielAngabe',
      'karten.beispielLink',
      'karten.toenungTitel',
      'karten.toenungText',
      'meldungen.einleitung',
      'meldungen.info',
      'meldungen.erfolg',
      'meldungen.fehler',
      'barrierefreiheit.einleitung',
      'barrierefreiheit.pruefliste',
      'barrierefreiheit.kontrastTitel',
      'barrierefreiheit.kontrastAngabe',
      'barrierefreiheit.fokusTitel',
      'barrierefreiheit.fokusText',
      'barrierefreiheit.fokusKnopf',
      'barrierefreiheit.fokusLink',
      'barrierefreiheit.regeln.kontrast',
      'barrierefreiheit.regeln.ziele',
      'barrierefreiheit.regeln.schrift',
      'barrierefreiheit.regeln.fokus',
      'barrierefreiheit.regeln.semantik',
      'barrierefreiheit.regeln.aria',
      'barrierefreiheit.regeln.tastatur',
      'barrierefreiheit.regeln.alttext',
      'barrierefreiheit.regeln.bewegung',
      'barrierefreiheit.regeln.fehler',
      'typografie.anzeigeTitel',
      'typografie.anzeigeEinleitung',
      'typografie.fliessend',
      'typografie.zeilenTitel',
      'typografie.zeilenEinleitung',
      'typografie.zeilenMuster',
      'abstaende.abschnittTitel',
      'abstaende.abschnittEinleitung',
      'raster.einleitung',
      'raster.breitenTitel',
      'raster.haltepunktTitel',
      'raster.pixel',
      'bewegung.einleitung',
      'bewegung.dauerTitel',
      'bewegung.dauerEinleitung',
      'bewegung.kurvenTitel',
      'bewegung.kurvenEinleitung',
      'bewegung.vorschau.abspielen',
      'bewegung.vorschau.zuruecksetzen',
      'bewegung.vorschau.reduziert',
      'ebenen.einleitung',
    ];
    expect(fest.filter((pfad) => !text(...pfad.split('.')))).toEqual([]);
  });
});
