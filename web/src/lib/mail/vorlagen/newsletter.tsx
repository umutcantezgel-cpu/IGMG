import { render } from '@react-email/render';
import type { JSONContent } from '@tiptap/core';
import type { ReactNode } from 'react';
import { istErlaubterLink } from '@/lib/inhalt/links';
import { klartext } from '@/lib/inhalt/tiptap';
import { MAILFARBE as F, MAILMASS as M } from './farben';
import { KnopfMitLink, vorschau } from './index';
import { MailRahmen, SCHRIFT_TITEL } from './Rahmen';

/**
 * Newsletter-Mails (AUFTRAG 3.10, K-B) im Mailrahmen der Website: „Anmeldung bestätigen“ (Double-Opt-in, Knopf mit
 * Link, ohne weitere Daten) und die Ausgabe selbst (Rich-Text aus dem Editor, Abmeldelink in jeder Mail).
 * Rich-Text: nur die Knoten aus `richtextSchema` (ADR 0006), Links nur nach `istErlaubterLink`, Bilder entfallen.
 */
export type NewsletterBestaetigungTexte = { betreff: string; anrede: string; text: string; knopf: string; hinweis: string; link: string };

export async function newsletterBestaetigungMail(sprache: string, t: NewsletterBestaetigungTexte) {
  const element = (
    <MailRahmen
      sprache={sprache}
      titel={t.betreff}
      vorschau={vorschau(t.text)}
      kinder={
        <>
          <p style={{ margin: `0 0 ${M.abstand4}` }}>{t.anrede}</p>
          <p style={{ margin: `0 0 ${M.abstand6}` }}>{t.text}</p>
          <KnopfMitLink link={t.link} text={t.knopf} />
        </>
      }
      fuss={t.hinweis}
    />
  );
  return { betreff: t.betreff, html: await render(element), text: await render(element, { plainText: true }) };
}

const ABSATZ = { margin: `0 0 ${M.abstand4}` };

function inline(knoten: JSONContent[] | undefined): ReactNode[] {
  return (knoten ?? []).map((k, i) => {
    if (k.type === 'hardBreak') return <br key={i} />;
    if (k.type !== 'text' || !k.text) return null;
    let el: ReactNode = k.text;
    for (const m of k.marks ?? []) {
      if (m.type === 'bold') el = <strong>{el}</strong>;
      else if (m.type === 'italic') el = <em>{el}</em>;
      else if (m.type === 'link' && istErlaubterLink(m.attrs?.href))
        el = (
          <a href={String(m.attrs?.href)} style={{ color: F.gruen, textDecoration: 'underline' }}>
            {el}
          </a>
        );
    }
    return <span key={i}>{el}</span>;
  });
}

function bloecke(knoten: JSONContent[] | undefined): ReactNode[] {
  return (knoten ?? []).map((k, i) => {
    switch (k.type) {
      case 'paragraph':
        return (
          <p key={i} style={ABSATZ}>
            {inline(k.content)}
          </p>
        );
      case 'heading':
        return (
          <p
            key={i}
            style={{
              margin: `${M.abstand6} 0 ${M.abstand3}`,
              fontFamily: SCHRIFT_TITEL,
              fontSize: M.titel,
              fontWeight: 700,
              lineHeight: '1.3',
            }}
          >
            {inline(k.content)}
          </p>
        );
      case 'bulletList':
      case 'orderedList': {
        const Liste = k.type === 'bulletList' ? 'ul' : 'ol';
        return (
          <Liste key={i} style={{ margin: `0 0 ${M.abstand4}`, paddingLeft: M.abstand6 }}>
            {(k.content ?? []).map((li, j) => (
              <li key={j} style={{ margin: `0 0 ${M.abstand1}` }}>
                {bloecke(li.content)}
              </li>
            ))}
          </Liste>
        );
      }
      case 'blockquote':
        return (
          <div
            key={i}
            style={{ margin: `0 0 ${M.abstand4}`, paddingLeft: M.abstand4, borderLeft: `${M.akzent} solid ${F.gruen}`, color: F.tinte2 }}
          >
            {bloecke(k.content)}
          </div>
        );
      default:
        return null;
    }
  });
}

export type NewsletterAusgabeTexte = { betreff: string; inhalt: JSONContent; abmelden: string; fuss: string; abmeldeLink: string };

export async function newsletterAusgabeMail(sprache: string, a: NewsletterAusgabeTexte) {
  const element = (
    <MailRahmen
      sprache={sprache}
      titel={a.betreff}
      vorschau={vorschau(klartext(a.inhalt))}
      kinder={<>{bloecke(a.inhalt.content)}</>}
      fuss={
        <>
          {a.fuss}{' '}
          <a href={a.abmeldeLink} style={{ color: F.tinte2, textDecoration: 'underline' }}>
            {a.abmelden}
          </a>
        </>
      }
    />
  );
  return { betreff: a.betreff, html: await render(element), text: await render(element, { plainText: true }) };
}
