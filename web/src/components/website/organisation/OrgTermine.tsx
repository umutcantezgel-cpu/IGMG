import { Calendar, CalendarPlus, Clock } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { terminDatum, uhrzeitText } from '@/components/website/EventCard';
import { Text, textMitSprache } from '@/components/website/Text';
import { webcalAdresse } from '@/components/website/veranstaltungen/KalenderAbo';
import { Link } from '@/i18n/link';
import type { Sprache } from '@/lib/i18n/inhalt';
import { cn } from '@/lib/utils';
import type { VeranstaltungsDaten } from '@/server/queries/veranstaltungen';
import { type Kuerzel, MEHR_LINK, SLUG, STIL } from './stil';

/**
 * Kompakte Terminliste der Organisationsseite (design/OrganizationPage.dc.html, „Kommende Veranstaltungen“):
 * Titel serifenlos fett als Link zur Veranstaltungsdetailseite; die ganze Zeile ist klickbar (after:-Fläche),
 * Terminzeile aus Datum und Uhrzeit in Organisationsfarbe (H-E05: ohne Pille), kurze Beschreibung, Trennlinien.
 * Ein eigener „Mehr erfahren“-Link entfällt.
 * Darunter der Abo-Link auf den Feed dieser Organisation (K-19, webcal).
 */
export async function OrgTermine({ termine, sprache, org }: { termine: VeranstaltungsDaten[]; sprache: Sprache; org: Kuerzel }) {
  const t = await getTranslations('karten');
  const ta = await getTranslations('organisation');
  const s = STIL[org];
  const zeilen = await Promise.all(termine.map(async (v) => ({ v, datum: await terminDatum(v, sprache) })));
  return (
    <>
      <ul className="flex flex-col">
        {zeilen.map(({ v, datum }) => {
          const titel = textMitSprache(v.titel, sprache);
          const ziel = { pathname: '/veranstaltungen/[slug]' as const, params: { slug: v.slug } };
          return (
            <li key={v.id} className="relative flex flex-col gap-1.5 border-t border-linie py-4 first:border-t-0 first:pt-2">
              <h3 lang={titel.lang} className="font-text text-20 leading-snug font-bold tracking-normal">
                <Link
                  href={ziel}
                  className="text-tinte no-underline after:absolute after:inset-0 hover:text-gruen-800 hover:underline hover:underline-offset-4"
                >
                  {titel.text}
                </Link>
              </h3>
              <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-1 text-16 leading-normal font-bold tabular-nums', s.ink)}>
                <span className="inline-flex items-center gap-2">
                  <Calendar aria-hidden className="size-5 shrink-0" />
                  {datum}
                </span>
                {/* Ganztägige Termine zeigen den Hinweis statt „00:00 Uhr“ (Befund H-FIX3, wie EventCard) */}
                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                  <Clock aria-hidden className="size-5 shrink-0" />
                  {uhrzeitText(v, sprache, t('ganztaegig'))}
                </span>
              </div>
              <Text feld={v.kurztext} sprache={sprache} als="p" className="text-16 text-tinte-2" />
            </li>
          );
        })}
      </ul>
      <a href={webcalAdresse(`/api/ical/${sprache}/organisation/${SLUG[org]}`)} className={`${MEHR_LINK} text-16`}>
        <CalendarPlus aria-hidden className="size-5" />
        {ta('aboTermine')}
      </a>
    </>
  );
}
