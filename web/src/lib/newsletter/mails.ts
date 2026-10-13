import 'server-only';
import type { JSONContent } from '@tiptap/core';
import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import { createTranslator } from 'next-intl';
import { db, schema } from '@/lib/db';
import { entschluessele } from '@/lib/krypto';
import { newsletterAusgabeMail, newsletterBestaetigungMail } from '@/lib/mail/vorlagen/newsletter';
import { basisUrl } from '@/lib/seo/metadaten';
import { BEREICHE } from '../../../messages/bereiche';
import { abmeldeToken } from './dienst';
import { NEWSLETTER_VORLAGE, newsletterLink } from './vorlagen';

/**
 * Newsletter im Mail-Ausgang (ADR 0005): Die Zeilen einer Ausgabe tragen als Empfänger nur „newsletter:<Abo-ID>“ –
 * die Adresse wird erst beim Versand entschlüsselt, und nur, solange die Anmeldung bestätigt ist. Wer sich zwischen
 * Planung und Versand abmeldet (Abo gelöscht), bekommt nichts mehr.
 */
export const NEWSLETTER_EMPFAENGER = 'newsletter:';

type Sprache = 'de' | 'tr' | 'en';
type Uebersetzer = (schluessel: string, werte?: Record<string, string>) => string;

function uebersetzer(sprache: Sprache): Uebersetzer {
  const datei = BEREICHE.newsletter;
  const messages = { ...(sprache === 'de' ? {} : datei.de), ...datei[sprache] } as Record<string, unknown>;
  return createTranslator({ locale: sprache, messages, namespace: 'newsletter.mail' } as never) as unknown as Uebersetzer;
}

/** Empfängeradresse einer bestätigten, nicht abgemeldeten Anmeldung (sonst keine). */
export async function newsletterEmpfaenger(aboId: string): Promise<string[]> {
  if (!/^[0-9a-f-]{36}$/i.test(aboId)) return [];
  const [abo] = await db
    .select({ email: schema.newsletterAbo.emailVerschluesselt, schluesselId: schema.newsletterAbo.schluesselId })
    .from(schema.newsletterAbo)
    .where(
      and(eq(schema.newsletterAbo.id, aboId), isNotNull(schema.newsletterAbo.bestaetigtAm), isNull(schema.newsletterAbo.abgemeldetAm)),
    );
  return abo ? [entschluessele<string>(abo.email, abo.schluesselId)] : [];
}

/** Mail einer Newsletter-Vorlage bauen; `null` für fremde Vorlagen. */
export async function baueNewsletterMail(vorlage: string, sprache: Sprache, daten: Record<string, string>) {
  if (vorlage === NEWSLETTER_VORLAGE.bestaetigen) {
    const t = uebersetzer(sprache);
    return newsletterBestaetigungMail(sprache, {
      betreff: t('bestaetigen.betreff'),
      anrede: t('bestaetigen.anrede'),
      text: t('bestaetigen.text'),
      knopf: t('bestaetigen.knopf'),
      hinweis: t('bestaetigen.hinweis'),
      link: newsletterLink(basisUrl(), 'bestaetigen', daten.token ?? '', sprache),
    });
  }
  if (vorlage === NEWSLETTER_VORLAGE.ausgabe) {
    const [a] = await db
      .select()
      .from(schema.newsletterAusgabe)
      .where(eq(schema.newsletterAusgabe.id, daten.ausgabeId ?? ''));
    if (!a) throw new Error('AusgabeFehlt');
    const t = uebersetzer(sprache);
    // Fehlt die Sprachfassung, geht die deutsche Ausgabe hinaus (ADR 0002)
    const mitSprache = Boolean(a.betreff[sprache]?.trim() && a.inhalt[sprache]);
    const s: Sprache = mitSprache ? sprache : 'de';
    return newsletterAusgabeMail(s, {
      betreff: (s === 'de' ? a.betreff.de : a.betreff[s]) ?? a.betreff.de,
      inhalt: ((s === 'de' ? a.inhalt.de : a.inhalt[s]) ?? a.inhalt.de) as JSONContent,
      abmelden: t('ausgabe.abmelden'),
      fuss: t('ausgabe.fuss'),
      abmeldeLink: newsletterLink(basisUrl(), 'abmelden', abmeldeToken(daten.aboId ?? ''), sprache),
    });
  }
  return null;
}
