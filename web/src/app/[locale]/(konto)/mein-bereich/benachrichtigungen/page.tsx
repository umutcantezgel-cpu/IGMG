import { BellRing, Newspaper } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { Abschnitt, Status } from '@/components/mein-bereich/Abschnitt';
import { MeinBereichRahmen } from '@/components/mein-bereich/MeinBereichRahmen';
import { Meldung } from '@/components/verwaltung/Meldung';
import type { Locale } from '@/i18n/routing';
import { verlangeMeinBereich } from '@/lib/konto/zugang';

/** Je Anfrage gerendert, wartet auf die Sitzung (siehe Layout). */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meinBereich.meta');
  return { title: t('benachrichtigungen') };
}

/**
 * Benachrichtigungen (Platzhalter bis zum Paket Push/Newsletter, ADR 0034): ehrlicher Hinweis, dass noch nichts
 * verschickt wird. Keine Schalter ohne Wirkung.
 */
export default async function BenachrichtigungenSeite() {
  const sprache = (await getLocale()) as Locale;
  const k = await verlangeMeinBereich(sprache);
  const t = await getTranslations('meinBereich.benachrichtigungen');
  return (
    <MeinBereichRahmen
      konto={k}
      aktuell="benachrichtigungen"
      titel={t('titel')}
      untertitel={t('untertitel')}
      sprachZiel="/mein-bereich/benachrichtigungen"
    >
      <Meldung art="info">{t('hinweis')}</Meldung>
      <Abschnitt id="push" Icon={BellRing} titel={t('push.titel')} rechts={<Status an={false} text={t('bald')} />} text={t('push.text')} />
      {k.istKind ? null : (
        <Abschnitt
          id="newsletter"
          Icon={Newspaper}
          titel={t('newsletter.titel')}
          rechts={<Status an={false} text={t('bald')} />}
          text={t('newsletter.text')}
        />
      )}
    </MeinBereichRahmen>
  );
}
