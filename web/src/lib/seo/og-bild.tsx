import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ReactElement } from 'react';
import de from '../../../messages/de.json';
import en from '../../../messages/en.json';
import tr from '../../../messages/tr.json';
import { datumLang, zeitspanne } from '@/lib/i18n/format';
import type { Sprache } from '@/lib/i18n/inhalt';

/**
 * Open-Graph-Bilder (K-16, D-O4): 1200 × 630 px als PNG über next/og (ImageResponse) aus den Dateien
 * `opengraph-image.tsx`. Gestaltung (K-005, K-008): warmes Papier, Kennung mit Bereich und Datum, Titel in der
 * Displayschrift, kurze Akzentlinie, ein Achtstern nur am oberen Rand (nie hinter Text), Monogramm höchstens in
 * seiner Originalgröße (public/symbole/symbol-512.png, 512 px). Das IGMG-Logo wird hier nie verwendet (D-06).
 * Die Bilder lesen nur Inhalte und Dateien, keine Cookies, Header oder Suchparameter (statisch, K-01).
 * Texte kommen direkt aus messages/{de,tr,en}.json und nicht über next-intl: `generateImageMetadata` läuft in der
 * Phase von generateStaticParams, dort darf getTranslations keine Root-Parameter lesen (Fehler im Dev-Server belegt).
 * Satori (next/og) kennt keine CSS-Variablen und kein WOFF2: Farben und Maße sind benannte Spiegel der Tokens aus
 * src/app/globals.css, Schriften liegen als WOFF in node_modules (bereits Abhängigkeiten, Lizenz OFL). Fehlen sie
 * zur Laufzeit, nimmt next/og seine eingebaute Schrift; das Bild entsteht trotzdem.
 */

/** Texte eines Bildes in einer Sprache (Namensräume meta, start und ogBild). */
export type OgTexte = {
  wortmarke: string;
  untertitel: string;
  art: { nachricht: string; veranstaltung: string };
  alt: { standard: string; nachricht: string; veranstaltung: string };
};

const SPRACHDATEIEN = { de, tr, en };

/** Texte für eine Sprache; fehlende Sprachen gibt es nicht (Vollständigkeit prüft `pnpm sprachen:pruefen`). */
export function ogTexte(sprache: Sprache): OgTexte {
  const datei = SPRACHDATEIEN[sprache];
  return {
    wortmarke: datei.meta.titel,
    untertitel: datei.start.untertitel,
    art: datei.ogBild.art,
    alt: datei.ogBild.alt,
  };
}

/**
 * Sprache aus einem Routenparameter. Fehlt er oder ist er unbekannt, gilt Deutsch: Next ruft `generateImageMetadata`
 * beim Vorabzählen der Bilder teils ohne Routenparameter auf; die Ids sind davon unabhängig.
 */
export function spracheAus(wert: string | undefined): Sprache {
  return wert === 'tr' || wert === 'en' ? wert : 'de';
}

/** Setzt Werte in einen Text ein: `{name}` wird ersetzt (nur einfache Platzhalter, keine ICU-Pluralformen). */
export function fuelle(vorlage: string, werte: Record<string, string>): string {
  return vorlage.replace(/\{(\w+)\}/g, (platz, name: string) => werte[name] ?? platz);
}

/** Maße aller Open-Graph-Bilder. */
export const OG_GROESSE = { width: 1200, height: 630 } as const;

/**
 * Farben als Hex. Spiegel der Tokens in src/app/globals.css (Satori kennt keine CSS-Variablen); der Wert steht
 * jeweils am Token, damit eine Änderung dort hier sichtbar nachgezogen wird.
 */
export const OG_FARBEN = {
  /** Spiegel von --color-papier: warmer Papierton der Fläche. */
  papier: '#fcfaf6',
  /** Spiegel von --color-tinte: Titel. */
  tinte: '#1d1a17',
  /** Spiegel von --color-tinte-2: Zeile unter dem Titel. */
  tinte2: '#514c46',
  /** Spiegel von --color-gruen-800: Kennung (Bereich und Datum). */
  gruen800: '#065f46',
  /** Spiegel von --color-gruen-700: Akzentlinie. */
  gruen700: '#047857',
  /** Spiegel von --color-gruen-100: Achtstern am Rand, dezent. */
  gruen100: '#d3f0e2',
} as const;

/**
 * Schriftgrößen in Pixeln des 1200-px-Bildes. Spiegel der Tokens in src/app/globals.css (Satori kennt keine
 * CSS-Variablen; im Bild sind die Stufen unmittelbar in Pixeln gemeint, nicht in rem).
 */
export const OG_SCHRIFT = {
  /** Spiegel von --text-anzeige-96: kurze Titel (bis 20 Zeichen). */
  titelGross: 96,
  /** Spiegel von --text-anzeige-64: mittlere Titel. */
  titelMittel: 64,
  /** Spiegel von --text-48: längere Titel. */
  titelKlein: 48,
  /** Spiegel der Obergrenze von --text-display-2 (40 px): lange Titel. */
  titelLang: 40,
  /** Spiegel von --text-30: Wortmarke, Kennung und Zeile unter dem Titel. */
  zeile: 30,
  /** Spiegel von --text-display-1--line-height (1.1) für den Titel. */
  titelZeilenhoehe: 1.1,
} as const;

/**
 * Abstände und Flächen in Pixeln. Vielfache des 4-px-Rasters (Abstandsraster des Designsystems, KERN K-005).
 * Das Monogramm ist 512 px groß (Originalgröße der Datei) und wird mit 72 px nur verkleinert gezeigt.
 */
const RAND_SEITE = 80;

export const OG_MASS = {
  randOben: 72,
  randSeite: RAND_SEITE,
  /** Textspalte: volle Breite abzüglich der Seitenränder. Der Achtstern liegt außerhalb davon, im oberen Rand. */
  spalte: OG_GROESSE.width - 2 * RAND_SEITE,
  /** Lesebreite der Zeile unter dem Titel (Untertitel des Standardbildes läuft so in 2–3 Zeilen). */
  zeileBreite: 880,
  /** Monogramm in der Anzeige; Originalgröße der Quelldatei: 512 × 512 px. */
  symbol: 72,
  symbolAbstand: 24,
  /** Akzentlinie: 96 × 4 px. */
  akzentBreite: 96,
  akzentHoehe: 4,
  /** Achtstern: 240 px, ragt zur Hälfte (120 px) über die obere und rechte Kante, sodass ein ruhiges Viertel bleibt. */
  achtstern: 240,
  achtsternUeberstand: 120,
  kennungAbstand: 20,
  akzentAbstand: 32,
  zeileAbstand: 28,
} as const;

/** Achtstern aus src/components/website/Icons.tsx (Viewbox 24): Quadrat 6–18 und dasselbe um 45° gedreht. */
const ACHTSTERN_PFAD = 'M12 3.5 14.5 6H18v3.5l2.5 2.5-2.5 2.5V18h-3.5L12 20.5 9.5 18H6v-3.5L3.5 12 6 9.5V6h3.5z';

/** Schriftdateien für next/og: nur WOFF und TTF/OTF, kein WOFF2 (Fehler „Unsupported OpenType signature wOF2“). */
const SCHRIFTDATEIEN = [
  { name: 'Titel', weight: 600, datei: 'source-serif-4/files/source-serif-4-latin-600-normal.woff' },
  { name: 'Titel', weight: 600, datei: 'source-serif-4/files/source-serif-4-latin-ext-600-normal.woff' },
  { name: 'Text', weight: 400, datei: 'atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-400-normal.woff' },
  { name: 'Text', weight: 400, datei: 'atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-ext-400-normal.woff' },
  { name: 'Text', weight: 700, datei: 'atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-700-normal.woff' },
  { name: 'Text', weight: 700, datei: 'atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-ext-700-normal.woff' },
] as const;

/**
 * Längster Titel im Bild in Zeichen; darüber wird an einer Wortgrenze gekürzt. Bei 40 px passen real etwa 43–50 Zeichen
 * je Zeile, 120 Zeichen ergeben höchstens drei Zeilen (geprüft mit einem synthetischen 180-Zeichen-Titel).
 */
const TITEL_MAX = 120;

/** Emoji, Hautton, Flaggen, Verbindungs- und Variationszeichen. © ® ™ bleiben erhalten. */
const EMOJI = /(?![©®™])\p{Extended_Pictographic}|\p{Emoji_Modifier}|\p{Regional_Indicator}|[‍️⃣]/gu;

let monogramm: Promise<string> | undefined;

/**
 * Monogramm als PNG-Datenadresse. Die Datei wird einmal gelesen (Projektwurzel = process.cwd(), im Image unter /app/public);
 * ein Lesefehler wird nicht zwischengespeichert.
 */
export function ladeOgSymbol(): Promise<string> {
  monogramm ??= readFile(join(process.cwd(), 'public', 'symbole', 'symbol-512.png'))
    .then((bytes) => `data:image/png;base64,${bytes.toString('base64')}`)
    .catch((fehler: unknown) => {
      monogramm = undefined;
      throw fehler;
    });
  return monogramm;
}

/** Schrift für ImageResponse (Satori): Name, Stärke und die Bytes der Datei. */
export type OgSchrift = { name: string; weight: 400 | 600 | 700; style: 'normal'; data: Buffer };

let schriften: Promise<OgSchrift[] | undefined> | undefined;

/**
 * Schriften aus den WOFF-Dateien der Fontsource-Pakete (bereits Abhängigkeiten). Die Dateien werden einmal gelesen.
 * Fehlen sie zur Laufzeit (standalone-Bau, Vercel ohne Datei-Verfolgung, devDependencies), ist das Ergebnis `undefined`:
 * next/og nimmt dann seine eingebaute Schrift. Ein leeres Array wäre schlechter, Satori bricht dann mit „No fonts are
 * loaded“ ab. Ein Lesefehler wird nicht zwischengespeichert, beim nächsten Bild wird erneut gelesen.
 */
export function ladeOgSchriften(): Promise<OgSchrift[] | undefined> {
  schriften ??= Promise.all(
    SCHRIFTDATEIEN.map(async ({ name, weight, datei }) => ({
      name,
      weight,
      style: 'normal' as const,
      data: await readFile(join(process.cwd(), 'node_modules', '@fontsource', datei)),
    })),
  ).catch((fehler: unknown) => {
    schriften = undefined;
    console.warn('[og-bild] Schriftdateien nicht lesbar; next/og nimmt seine eingebaute Schrift.', fehler);
    return undefined;
  });
  return schriften;
}

/** Optionen für `new ImageResponse(…)`: Maße und, wenn lesbar, die Schriften (sonst die eingebaute Schrift von next/og). */
export async function ogOptionen(): Promise<{ width: number; height: number; fonts?: OgSchrift[] }> {
  const fonts = await ladeOgSchriften();
  return fonts ? { ...OG_GROESSE, fonts } : { ...OG_GROESSE };
}

/** Entfernt Emoji aus einem Text. next/og lädt für Emoji Bilder aus einem fremden Netz (K-14), das soll im Bild nicht passieren. */
export function ohneEmoji(text: string): string {
  return text.replace(EMOJI, '').replace(/\s+/g, ' ').trim();
}

/** Titel für das Bild: ohne Emoji, bei mehr als `max` Zeichen an einer Wortgrenze mit „…“ gekürzt. */
export function bildTitel(titel: string, max = TITEL_MAX): string {
  const text = ohneEmoji(titel);
  const zeichen = [...text];
  if (zeichen.length <= max) return text;
  const schnitt = zeichen.slice(0, max).join('');
  const luecke = schnitt.lastIndexOf(' ');
  const basis = luecke > schnitt.length * 0.6 ? schnitt.slice(0, luecke) : schnitt;
  return `${basis.trimEnd()}…`;
}

/** Stufe nach Gesamtlänge: bis 20 Zeichen 96 px, bis 60 64 px, bis 96 48 px, sonst 40 px. */
function stufeNachLaenge(laenge: number): number {
  if (laenge <= 20) return OG_SCHRIFT.titelGross;
  if (laenge <= 60) return OG_SCHRIFT.titelMittel;
  if (laenge <= 96) return OG_SCHRIFT.titelKlein;
  return OG_SCHRIFT.titelLang;
}

/** Stufe nach dem längsten Wort: ein Kompositum darf nicht über den Bildrand laufen (Satori bricht es sonst nicht). */
function stufeNachWort(wort: number): number {
  if (wort > 40) return OG_SCHRIFT.titelLang;
  if (wort > 30) return OG_SCHRIFT.titelKlein;
  if (wort > 19) return OG_SCHRIFT.titelMittel;
  return OG_SCHRIFT.titelGross;
}

/**
 * Schriftgröße des Titels in der Textspalte. Maßgeblich ist die kleinere von zwei Stufen: nach Gesamtlänge und nach
 * dem längsten Wort. So füllt der Titel höchstens drei Zeilen und kein Wort überläuft (Satori bricht nicht an `lineClamp`).
 */
export function titelSchriftgroesse(titel: string): number {
  const laenge = [...titel].length;
  const wort = Math.max(0, ...titel.split(/\s+/).map((w) => [...w].length));
  return Math.min(stufeNachLaenge(laenge), stufeNachWort(wort));
}

/** Zeile zum Termin: Datum und Zeitspanne wie auf den Seiten, z. B. „Sa., 2. August 2025, 18:30–20:00 Uhr“. */
export function terminZeile(beginn: Date, ende: Date | null, sprache: Sprache): string {
  return `${datumLang(beginn, sprache)}, ${zeitspanne(beginn, ende, sprache)}`;
}

/** Kennung über dem Titel: Bereich und Datum, z. B. „Neuigkeit · Sa., 2. August 2025“. */
export function kennungMitDatum(art: string, datum: Date, sprache: Sprache): string {
  return `${art} · ${datumLang(datum, sprache)}`;
}

/** Uhrzeit eines Termins (ohne Datum), z. B. „18:30–20:00 Uhr“; das Datum steht in der Kennung. */
export function terminUhrzeit(beginn: Date, ende: Date | null, sprache: Sprache): string {
  return zeitspanne(beginn, ende, sprache);
}

export type OgInhalt = {
  /** Schriftzug oben neben dem Monogramm, Text aus `meta.titel`. */
  wortmarke: string;
  /** Monogramm als PNG-Datenadresse (von `ladeOgSymbol`). */
  symbol: string;
  /** Hauptzeile: Beitragstitel, Terminname oder im Standardbild der Name der Gemeinde (höchstens drei Zeilen). */
  titel: string;
  /** Kennung über dem Titel: Bereich und Datum, z. B. „Veranstaltung · Do., 15. Oktober 2026“. */
  kennung?: string;
  /** Zeile unter dem Titel, z. B. die Uhrzeit eines Termins oder im Standardbild der Untertitel der Startseite. */
  zeile?: string;
  /** Standardbild: die Kopfzeile zeigt nur das Monogramm, weil der Name dann groß als Titel steht. */
  ohneWortmarke?: boolean;
};

/** Gestaltung eines Bildes als Element für ImageResponse. Satori kennt nur Flexbox und einen Teil der CSS-Eigenschaften. */
export function ogGestaltung({ wortmarke, symbol, titel, kennung, zeile, ohneWortmarke }: OgInhalt): ReactElement {
  const anzeige = bildTitel(titel);
  const zeileAnzeige = zeile ? ohneEmoji(zeile) : undefined;
  return (
    <div
      style={{
        display: 'flex',
        position: 'relative',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        paddingTop: OG_MASS.randOben,
        paddingBottom: OG_MASS.randOben,
        paddingLeft: OG_MASS.randSeite,
        paddingRight: OG_MASS.randSeite,
        backgroundColor: OG_FARBEN.papier,
        color: OG_FARBEN.tinte,
      }}
    >
      {/* Achtstern nur am oberen Rand, außerhalb der Textspalte und oberhalb des Titels */}
      <svg
        aria-hidden="true"
        width={OG_MASS.achtstern}
        height={OG_MASS.achtstern}
        viewBox="0 0 24 24"
        style={{
          position: 'absolute',
          top: -OG_MASS.achtsternUeberstand,
          right: -OG_MASS.achtsternUeberstand,
          display: 'flex',
        }}
      >
        <path d={ACHTSTERN_PFAD} fill={OG_FARBEN.gruen100} />
      </svg>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* next/og (Satori) rendert nur <img>, keine next/image-Komponente */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={symbol} alt="" width={OG_MASS.symbol} height={OG_MASS.symbol} />
        {ohneWortmarke ? null : (
          <div
            style={{
              display: 'flex',
              marginLeft: OG_MASS.symbolAbstand,
              fontFamily: 'Titel',
              fontWeight: 600,
              fontSize: OG_SCHRIFT.zeile,
              color: OG_FARBEN.tinte,
            }}
          >
            {wortmarke}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', width: OG_MASS.spalte }}>
        {kennung ? (
          <div
            style={{
              display: 'flex',
              marginBottom: OG_MASS.kennungAbstand,
              fontFamily: 'Text',
              fontWeight: 700,
              fontSize: OG_SCHRIFT.zeile,
              color: OG_FARBEN.gruen800,
            }}
          >
            {kennung}
          </div>
        ) : null}
        <div
          style={{
            display: 'flex',
            width: OG_MASS.akzentBreite,
            height: OG_MASS.akzentHoehe,
            marginBottom: OG_MASS.akzentAbstand,
            backgroundColor: OG_FARBEN.gruen700,
          }}
        />
        <div
          style={{
            display: 'flex',
            fontFamily: 'Titel',
            fontWeight: 600,
            fontSize: titelSchriftgroesse(anzeige),
            lineHeight: OG_SCHRIFT.titelZeilenhoehe,
            wordBreak: 'break-word',
            color: OG_FARBEN.tinte,
          }}
        >
          {anzeige}
        </div>
        {zeileAnzeige ? (
          <div
            style={{
              display: 'flex',
              marginTop: OG_MASS.zeileAbstand,
              maxWidth: OG_MASS.zeileBreite,
              fontFamily: 'Text',
              fontSize: OG_SCHRIFT.zeile,
              color: OG_FARBEN.tinte2,
            }}
          >
            {zeileAnzeige}
          </div>
        ) : null}
      </div>
    </div>
  );
}
