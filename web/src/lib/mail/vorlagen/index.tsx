import { render } from '@react-email/render';
import { MAILFARBE as F } from './farben';
import { MailRahmen } from './Rahmen';

/**
 * Mailvorlagen (ADR 0005, ADR 0011). Texte kommen fertig übersetzt herein (createTranslator im Ausgang).
 * Bestätigung: an die absendende Person in ihrer Sprache, ohne Wiederholung der Formulardaten (Datensparsamkeit).
 * Benachrichtigung: an die zuständige Rolle auf Deutsch, OHNE Formulardaten – nur Hinweis und Link.
 */
export type BestaetigungTexte = { betreff: string; anrede: string; text: string; hinweis: string; gruss: string; kontakt: string };
export type BenachrichtigungTexte = { betreff: string; text: string; knopf: string; hinweis: string; link: string };

export async function bestaetigungMail(sprache: string, t: BestaetigungTexte) {
  const element = (
    <MailRahmen
      sprache={sprache}
      titel={t.betreff}
      kinder={
        <>
          <p style={{ margin: '0 0 12px' }}>{t.anrede}</p>
          <p style={{ margin: '0 0 16px' }}>{t.text}</p>
          <p style={{ margin: '0 0 8px' }}>{t.gruss}</p>
          <p style={{ margin: 0, color: F.tinte2 }}>{t.kontakt}</p>
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
      kinder={
        <>
          <p style={{ margin: '0 0 16px' }}>{t.text}</p>
          <p style={{ margin: 0 }}>
            <a
              href={t.link}
              style={{
                display: 'inline-block',
                background: F.gruen,
                color: F.weiss,
                padding: '12px 20px',
                borderRadius: '8px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              {t.knopf}
            </a>
          </p>
        </>
      }
      fuss={t.hinweis}
    />
  );
  return { betreff: t.betreff, html: await render(element), text: await render(element, { plainText: true }) };
}
