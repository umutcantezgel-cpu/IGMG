/* eslint-disable @next/next/no-head-element -- E-Mail-HTML, keine Next.js-Seite */
import type { ReactNode } from 'react';
import { MAILFARBE as F } from './farben';

/** Gemeinsamer Mailrahmen: Kopf „IGMG Wetzlar“, Inhalt, Fußzeile. Einfaches Tabellen-Layout für E-Mail-Programme. */
export function MailRahmen({ sprache, titel, kinder, fuss }: { sprache: string; titel: string; kinder: ReactNode; fuss: ReactNode }) {
  return (
    <html lang={sprache}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{titel}</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          background: F.papier,
          color: F.tinte,
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '16px',
          lineHeight: 1.6,
        }}
      >
        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ background: F.papier }}>
          <tbody>
            <tr>
              <td align="center" style={{ padding: '24px 12px' }}>
                <table
                  role="presentation"
                  width="100%"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{ maxWidth: '600px', background: F.weiss, border: `1px solid ${F.linie}`, borderRadius: '12px' }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          background: F.tiefgruen,
                          color: F.weiss,
                          padding: '16px 24px',
                          borderRadius: '12px 12px 0 0',
                          fontFamily: 'Georgia, serif',
                          fontSize: '22px',
                          fontWeight: 600,
                        }}
                      >
                        IGMG Wetzlar
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '24px' }}>{kinder}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '16px 24px', borderTop: `1px solid ${F.linie}`, color: F.tinte2, fontSize: '14px' }}>{fuss}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
