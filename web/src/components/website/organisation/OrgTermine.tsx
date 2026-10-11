import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { terminDatum } from '@/components/website/EventCard';
import { Text, textMitSprache } from '@/components/website/Text';
import { Link } from '@/i18n/link';
import { zeitspanne } from '@/lib/i18n/format';
import type { Sprache } from '@/lib/i18n/inhalt';
import { cn } from '@/lib/utils';
import type { VeranstaltungsDaten } from '@/server/queries/veranstaltungen';
import { type Kuerzel, MEHR_LINK, STIL } from './stil';

/**
 * Kompakte Terminliste der Organisationsseite (design/OrganizationPage.dc.html, „Kommende Veranstaltungen“):
 * Titel serifenlos fett, Datumspille mit Uhrzeit, kurze Beschreibung, Trennlinien. Der Link führt zur
 * Veranstaltungsdetailseite; sein Name ist „Mehr erfahren: Titel“ (MUSTER §4).
 */
export async function OrgTermine({ termine, sprache, org }: { termine: VeranstaltungsDaten[]; sprache: Sprache; org: Kuerzel }) {
  const t = await getTranslations('karten');
  const s = STIL[org];
  const zeilen = await Promise.all(termine.map(async (v) => ({ v, datum: await terminDatum(v, sprache) })));
  return (
    <ul className="flex flex-col">
      {zeilen.map(({ v, datum }) => {
        const titel = textMitSprache(v.titel, sprache);
        const ziel = { pathname: '/veranstaltungen/[slug]' as const, params: { slug: v.slug } };
        return (
          <li key={v.id} className="flex flex-col gap-1.5 border-t border-linie py-4">
            <h3 lang={titel.lang} className="font-text text-20 leading-snug font-bold tracking-normal">
              {titel.text}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-16">
              <span className={cn('inline-flex items-center gap-1.5 rounded-pill px-2.5 font-bold', s.tint, s.ink)}>
                <Calendar aria-hidden className="size-4" />
                {datum}
              </span>
              <span className="inline-flex items-center gap-1.5 text-tinte-2">
                <Clock aria-hidden className="size-4" />
                {zeitspanne(new Date(v.beginn), v.ende ? new Date(v.ende) : null, sprache)}
              </span>
            </div>
            <Text feld={v.kurztext} sprache={sprache} als="p" className="text-16 text-tinte-2" />
            <Link href={ziel} aria-label={`${t('mehrErfahren')}: ${titel.text}`} className={MEHR_LINK}>
              <span>{t('mehrErfahren')}</span>
              <ArrowRight aria-hidden className="size-5" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
