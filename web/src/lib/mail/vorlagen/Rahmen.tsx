/* eslint-disable @next/next/no-head-element -- E-Mail-HTML, keine Next.js-Seite */
import type { CSSProperties, ReactNode } from 'react';
import { MAILFARBE as F, MAILMASS as M } from './farben';

/**
 * Gemeinsamer Mailrahmen in der Bauweise der Website: warmes Papier, Tiefgrün, Serifen-Titel, ruhige Abstände.
 * E-Mail-Programme kennen keine CSS-Variablen und keine Webfonts: Tabellen-Layout (role=presentation), Inline-Stile,
 * Hex-Werte nur aus farben.ts (Tokens aus web/src/app/globals.css), keine Bilder, kein SVG.
 * Schmale Bildschirme regelt eine Medienregel im <head>; Programme ohne sie zeigen die Desktop-Abstände.
 */

/** Stil mit Outlook-Eigenschaften, die die React-Typen nicht kennen (React schreibt `msoHide` als `mso-hide`). */
export type MailStil = CSSProperties & { msoHide?: string; msoLineHeightRule?: string; msoPaddingAlt?: string };

/** Schrift für Fließtext und für den Titel (Georgia ersetzt die Titelschrift der Website). */
export const SCHRIFT_TEXT = 'Arial, Helvetica, sans-serif';
export const SCHRIFT_TITEL = "Georgia, 'Times New Roman', serif";

/** Hintergrund für Zellen: `bgcolor` als Rückfall für Outlook neben `background`. React-Typen kennen es nur für Tabellen, daher als Spread. */
export function hintergrund(farbe: string): { bgcolor: string } {
  return { bgcolor: farbe };
}

const MOBIL_CSS = `
@media (max-width: ${M.schmal}) {
  .igmg-kopf, .igmg-fuss { padding-left: ${M.abstand6} !important; padding-right: ${M.abstand6} !important; }
  .igmg-innen { padding: ${M.abstand6} !important; }
}`;

/** Outlook (Word-Darstellung) bekommt eine feste Breite von 600 px; andere Programme sehen nur Kommentare. */
const MSO_AUF =
  '<!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->';
const MSO_ZU = '<!--[if mso]></td></tr></table><![endif]-->';

/** Unsichtbarer Vorschautext: Fülltext nach dem Vorschautext, damit Programme keinen Textrest aus dem Körper zeigen. */
const VORSCHAU_FUELL = '\u034F\u200C\u00A0'.repeat(40);

const KOERPER: MailStil = {
  margin: 0,
  padding: 0,
  background: F.papier,
  color: F.tinte,
  fontFamily: SCHRIFT_TEXT,
  fontSize: M.text,
  lineHeight: '1.6',
  WebkitTextSizeAdjust: '100%',
};

/** Vorschautext nach dem üblichen Muster; `data-skip-in-text` hält ihn aus der Textfassung heraus. */
const VORSCHAU: MailStil = {
  display: 'none',
  maxHeight: M.aus,
  maxWidth: M.aus,
  opacity: 0,
  overflow: 'hidden',
  fontSize: M.haar,
  lineHeight: M.haar,
  color: F.papier,
  msoHide: 'all',
};

const KOPF: MailStil = {
  background: F.tiefgruen,
  color: F.weiss,
  padding: `${M.abstand5} ${M.abstand8}`,
  borderRadius: `${M.radius} ${M.radius} 0 0`,
  fontFamily: SCHRIFT_TITEL,
  fontSize: M.titel,
  fontWeight: 700,
  lineHeight: '1.3',
};

/** Feine Akzentlinie unter dem Kopf: 2 px hoch, ohne Text und ohne Innenabstand. */
const AKZENT: MailStil = {
  height: M.akzent,
  fontSize: M.aus,
  lineHeight: M.akzent,
  msoLineHeightRule: 'exactly',
  background: F.gruen,
  padding: 0,
};

const INNEN: MailStil = {
  padding: M.abstand8,
  background: F.weiss,
  color: F.tinte,
  fontFamily: SCHRIFT_TEXT,
  fontSize: M.text,
  lineHeight: '1.6',
};

const FUSS: MailStil = {
  padding: `${M.abstand5} ${M.abstand8}`,
  background: F.sand,
  color: F.tinte2,
  fontFamily: SCHRIFT_TEXT,
  fontSize: M.textKlein,
  lineHeight: '1.5',
  borderRadius: `0 0 ${M.radius} ${M.radius}`,
};

export function MailRahmen({
  sprache,
  titel,
  vorschau,
  kinder,
  fuss,
}: {
  sprache: string;
  titel: string;
  vorschau: string;
  kinder: ReactNode;
  fuss: ReactNode;
}) {
  return (
    <html lang={sprache}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <title>{titel}</title>
        <style data-skip-in-text="true">{MOBIL_CSS}</style>
      </head>
      <body style={KOERPER} {...hintergrund(F.papier)}>
        <div data-skip-in-text="true" style={VORSCHAU}>
          {vorschau}
          {VORSCHAU_FUELL}
        </div>
        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          border={0}
          style={{ background: F.papier }}
          {...hintergrund(F.papier)}
        >
          <tbody>
            <tr>
              <td align="center" style={{ padding: `${M.abstand6} ${M.abstand3}` }} {...hintergrund(F.papier)}>
                <div dangerouslySetInnerHTML={{ __html: MSO_AUF }} />
                <table
                  role="presentation"
                  width="100%"
                  cellPadding={0}
                  cellSpacing={0}
                  border={0}
                  style={{ maxWidth: M.breite, background: F.weiss, border: `${M.haar} solid ${F.linie}`, borderRadius: M.radius }}
                  {...hintergrund(F.weiss)}
                >
                  <tbody>
                    <tr>
                      <td className="igmg-kopf" style={KOPF} {...hintergrund(F.tiefgruen)}>
                        IGMG Wetzlar
                      </td>
                    </tr>
                    <tr>
                      <td height={2} style={AKZENT} {...hintergrund(F.gruen)} />
                    </tr>
                    <tr>
                      <td className="igmg-innen" style={INNEN} {...hintergrund(F.weiss)}>
                        {kinder}
                      </td>
                    </tr>
                    <tr>
                      <td className="igmg-fuss" style={FUSS} {...hintergrund(F.sand)}>
                        {fuss}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div dangerouslySetInnerHTML={{ __html: MSO_ZU }} />
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
