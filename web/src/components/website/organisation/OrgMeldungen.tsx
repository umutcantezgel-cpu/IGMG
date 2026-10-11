import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Text, textMitSprache } from '@/components/website/Text';
import { Link } from '@/i18n/link';
import { datumLang } from '@/lib/i18n/format';
import type { Sprache } from '@/lib/i18n/inhalt';
import type { NachrichtDaten } from '@/server/queries/nachrichten';
import { MEHR_LINK } from './stil';

/**
 * Kompakte Nachrichtenliste der Organisationsseite (design/OrganizationPage.dc.html, „Aktuelle Nachrichten“):
 * Datum, Titel serifenlos fett, Kurztext und Trennlinien; „Weiterlesen“ führt zum Artikel mit dem Namen
 * „Weiterlesen: Titel“ (MUSTER §4).
 */
export async function OrgMeldungen({ meldungen, sprache }: { meldungen: NachrichtDaten[]; sprache: Sprache }) {
  const t = await getTranslations('karten');
  return (
    <ul className="flex flex-col">
      {meldungen.map((n) => {
        const titel = textMitSprache(n.titel, sprache);
        const ziel = { pathname: '/nachrichten/[slug]' as const, params: { slug: n.slug } };
        return (
          <li key={n.id} className="flex flex-col gap-1.5 border-t border-linie py-4">
            <span className="text-16 text-tinte-2">{datumLang(new Date(n.veroeffentlichtAm), sprache)}</span>
            <h3 lang={titel.lang} className="font-text text-20 leading-snug font-bold tracking-normal">
              {titel.text}
            </h3>
            <Text feld={n.kurztext} sprache={sprache} als="p" className="text-16 text-tinte-2" />
            <Link href={ziel} aria-label={`${t('weiterlesen')}: ${titel.text}`} className={MEHR_LINK}>
              <span>{t('weiterlesen')}</span>
              <ArrowRight aria-hidden className="size-5" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
