import { render } from '@react-email/render';
import { MAILFARBE as F } from './farben';
import { hintergrund, MailRahmen, type MailStil, SCHRIFT_TEXT } from './Rahmen';

/**
 * Mailvorlagen (ADR 0005, ADR 0011). Texte kommen fertig übersetzt herein (createTranslator im Ausgang).
 * Bestätigung: an die absendende Person in ihrer Sprache, ohne Wiederholung der Formulardaten (Datensparsamkeit).
 * Benachrichtigung: an die zuständige Rolle auf Deutsch, OHNE Formulardaten – nur Hinweis und Link.
 */
export type BestaetigungTexte = { betreff: string; anrede: string; text: string; hinweis: string; gruss: string; kontakt: string };
export type BenachrichtigungTexte = { betreff: string; text: string; knopf: string; hinweis: string; link: string };

/** Vorschautext: der erste Satz des Inhalts, höchstens 140 Zeichen in ganzen Wörtern. Es wird nichts hinzugefügt. */
function vorschau(text: string): string {
  const zeile = text.trim();
  const satz = /^.*?[.!?](?=\s|$)/.exec(zeile)?.[0] ?? zeile;
  if (satz.length <= 140) return satz;
  return satz.slice(0, 140).replace(/\s\S*$/, '');
}

/** Stil des Knopfs: der Link trägt den Innenabstand (Outlook über mso-padding-alt); Höhe 14 + 20 + 14 px = 48 px. */
const KNOPF: MailStil = {
  display: 'inline-block',
  boxSizing: 'border-box',
  minHeight: '48px',
  padding: '14px 24px',
  borderRadius: '8px',
  background: F.gruen,
  color: F.weiss,
  fontFamily: SCHRIFT_TEXT,
  fontSize: '16px',
  fontWeight: 700,
  lineHeight: '20px',
  textDecoration: 'none',
  msoPaddingAlt: '14px 24px',
};

/**
 * Knopf „kugelsicher“: eine Tabellenzelle mit Hintergrund. Darunter steht der Link als Text; die Textfassung nennt ihn nur über den Knopf.
 */
function KnopfMitLink({ link, text }: { link: string; text: string }) {
  return (
    <>
      <div style={{ margin: '0 0 16px' }}>
        <table role="presentation" cellPadding={0} cellSpacing={0} border={0}>
          <tbody>
            <tr>
              <td style={{ background: F.gruen, borderRadius: '8px' }} {...hintergrund(F.gruen)}>
                <a href={link} style={KNOPF}>
                  {text}
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p data-skip-in-text="true" style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', color: F.tinte2, wordBreak: 'break-all' }}>
        <a href={link} style={{ color: F.tinte2, textDecoration: 'underline', wordBreak: 'break-all' }}>
          {link}
        </a>
      </p>
    </>
  );
}

export async function bestaetigungMail(sprache: string, t: BestaetigungTexte) {
  const element = (
    <MailRahmen
      sprache={sprache}
      titel={t.betreff}
      vorschau={vorschau(t.text)}
      kinder={
        <>
          <p style={{ margin: '0 0 16px' }}>{t.anrede}</p>
          <p style={{ margin: '0 0 24px' }}>{t.text}</p>
          <p style={{ margin: '0 0 4px' }}>{t.gruss}</p>
          <p style={{ margin: 0, fontSize: '14px', color: F.tinte2 }}>{t.kontakt}</p>
        </>
      }
      fuss={t.hinweis}
    />
  );
  return { betreff: t.betreff, html: await render(element), text: await render(element, { plainText: true }) };
}

export async function benachrichtigungMail(t: BenachrichtigungTexte) {
  const element = (
    <MailRahmen
      sprache="de"
      titel={t.betreff}
      vorschau={vorschau(t.text)}
      kinder={
        <>
          <p style={{ margin: '0 0 24px' }}>{t.text}</p>
          <KnopfMitLink link={t.link} text={t.knopf} />
        </>
      }
      fuss={t.hinweis}
    />
  );
  return { betreff: t.betreff, html: await render(element), text: await render(element, { plainText: true }) };
}
