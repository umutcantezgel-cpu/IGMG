import { render } from '@react-email/render';
import { MAILFARBE as F, MAILMASS as M } from './farben';
import { KnopfMitLink, vorschau } from './index';
import { MailRahmen } from './Rahmen';

/**
 * Tägliche Zusammenfassung (ADR 0034 Nr. 6, F-38) im Mailrahmen der Website: Einleitung, je Bereich eine Zeile mit der
 * Anzahl, Knopf zu „Mein Bereich“ und im Fuß der Link zu den Einstellungen (abbestellen, Themen ändern). Die Texte kommen
 * fertig übersetzt herein; sie nennen nur Bereich und Anzahl – keine Namen, keine Titel, keine Inhalte.
 */
export type ZusammenfassungTexte = {
  betreff: string;
  einleitung: string;
  zeilen: string[];
  knopf: string;
  link: string;
  hinweis: string;
  abbestellen: string;
  einstellungenLink: string;
};

export async function zusammenfassungMail(sprache: string, t: ZusammenfassungTexte) {
  const element = (
    <MailRahmen
      sprache={sprache}
      titel={t.betreff}
      vorschau={vorschau(t.zeilen[0] ?? t.einleitung)}
      kinder={
        <>
          <p style={{ margin: `0 0 ${M.abstand4}` }}>{t.einleitung}</p>
          <ul style={{ margin: `0 0 ${M.abstand6}`, paddingLeft: M.abstand6 }}>
            {t.zeilen.map((zeile) => (
              <li key={zeile} style={{ margin: `0 0 ${M.abstand1}` }}>
                {zeile}
              </li>
            ))}
          </ul>
          <KnopfMitLink link={t.link} text={t.knopf} />
        </>
      }
      fuss={
        <>
          {t.hinweis}{' '}
          <a href={t.einstellungenLink} style={{ color: F.tinte2, textDecoration: 'underline' }}>
            {t.abbestellen}
          </a>
        </>
      }
    />
  );
  return { betreff: t.betreff, html: await render(element), text: await render(element, { plainText: true }) };
}
