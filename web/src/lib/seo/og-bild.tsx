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
 * `opengraph-image.tsx`. Gestaltung: einfarbige Tiefgrün-Fläche, Monogramm aus public/symbole/symbol-512.png
 * (eigenes Zeichen, das IGMG-Logo wird nie verwendet, D-06), Schriftzug, Titel und optionale Zeile.
 * Die Bilder lesen nur Inhalte und Dateien, keine Cookies, Header oder Suchparameter (statisch, K-01).
 * Texte kommen direkt aus messages/{de,tr,en}.json und nicht über next-intl: `generateImageMetadata` läuft in der
 * Phase von generateStaticParams, dort darf getTranslations keine Root-Parameter lesen (Fehler im Dev-Server belegt).
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
 * Farben als Hex: next/og kennt keine CSS-Variablen. Werte = Tokens aus src/app/globals.css
 * (--color-gruen-950 · --color-gruen-100 · --color-weiss).
 */
export const OG_FARBEN = {
  tiefgruen: '#0e3929',
  gruen100: '#d3f0e2',
  weiss: '#ffffff',
} as const;

/** Längster Titel im Bild in Zeichen; darüber wird an einer Wortgrenze gekürzt. */
const TITEL_MAX = 180;

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

/** Schriftgröße des Titels nach Zeichenzahl: kurze Titel groß, lange kleiner, damit mehrere Zeilen Platz haben. */
export function titelSchriftgroesse(titel: string): number {
  const laenge = [...titel].length;
  if (laenge <= 36) return 80;
  if (laenge <= 64) return 68;
  if (laenge <= 100) return 58;
  return 50;
}

/** Zeile zum Termin: Datum und Zeitspanne wie auf den Seiten, z. B. „Sa., 2. August 2025, 18:30–20:00 Uhr“. */
export function terminZeile(beginn: Date, ende: Date | null, sprache: Sprache): string {
  return `${datumLang(beginn, sprache)}, ${zeitspanne(beginn, ende, sprache)}`;
}

export type OgInhalt = {
  /** Schriftzug oben links, Text aus `meta.titel`. */
  wortmarke: string;
  /** Monogramm als PNG-Datenadresse (von `ladeOgSymbol`). */
  symbol: string;
  /** Hauptzeile: Beitragstitel, Terminname oder Untertitel der Startseite. */
  titel: string;
  /** Kleine Kennung über dem Titel, z. B. „Neuigkeit“. */
  art?: string;
  /** Zeile unter dem Titel, z. B. Datum und Uhrzeit eines Termins. */
  zeile?: string;
};

/** Gestaltung eines Bildes als Element für ImageResponse. Satori kennt nur Flexbox und einen Teil der CSS-Eigenschaften. */
export function ogGestaltung({ wortmarke, symbol, titel, art, zeile }: OgInhalt): ReactElement {
  const anzeige = bildTitel(titel);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        padding: '72px 80px',
        backgroundColor: OG_FARBEN.tiefgruen,
        color: OG_FARBEN.weiss,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* next/og (Satori) rendert nur <img>, keine next/image-Komponente */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={symbol} alt="" width={96} height={96} />
        <div style={{ display: 'flex', marginLeft: 28, fontSize: 40, lineHeight: 1 }}>{wortmarke}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {art ? <div style={{ display: 'flex', marginBottom: 20, fontSize: 28, color: OG_FARBEN.gruen100 }}>{art}</div> : null}
        <div style={{ display: 'flex', fontSize: titelSchriftgroesse(anzeige), lineHeight: 1.15 }}>{anzeige}</div>
        {zeile ? <div style={{ display: 'flex', marginTop: 28, fontSize: 32, color: OG_FARBEN.gruen100 }}>{zeile}</div> : null}
      </div>
    </div>
  );
}
