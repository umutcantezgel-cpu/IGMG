import { BookOpen, Calendar, Check, Heart, Users } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { Text } from '@/components/website/Text';
import type { Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import type { SeitenInhalt } from '@/server/queries/seiteninhalte';
import { KARTE, UEBERSCHRIFT_GROSS } from './stil';

/**
 * Angebote (Liste aus dem Seiteninhalt) und die Karte „Besucher willkommen“ mit zwei Chips
 * (design/Contact.dc.html:59–67).
 */
export async function AngeboteBesuch({ kontakt }: { kontakt: SeitenInhalt<'kontakt'> }) {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('kontakt');
  const chip = 'inline-flex items-center gap-1.5 rounded-pill bg-weiss px-3 py-0.5 text-16 font-bold text-gruen-950';
  return (
    <div className="flex flex-wrap gap-6">
      <section aria-labelledby="kontakt-angebote" className={cn(KARTE, 'flex-[2_1_480px] gap-4')}>
        <h2 id="kontakt-angebote" className={UEBERSCHRIFT_GROSS}>
          <Heart aria-hidden className="size-7 shrink-0 text-gruen-700" />
          {t('angebote.titel')}
        </h2>
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-6 gap-y-2">
          {kontakt.angebote.map((angebot, nummer) => (
            <li key={nummer} className="flex items-start gap-2.5">
              <Check aria-hidden className="mt-1 size-5 shrink-0 text-gruen-700" />
              <Text feld={angebot} sprache={sprache} />
            </li>
          ))}
        </ul>
      </section>
      <section
        aria-labelledby="kontakt-besuch"
        className="flex min-w-0 flex-[1_1_320px] flex-col gap-3 rounded-lg bg-gruen-950 p-6 text-weiss"
      >
        <h2 id="kontakt-besuch" className={cn(UEBERSCHRIFT_GROSS, 'text-weiss')}>
          <Users aria-hidden className="size-7 shrink-0 text-gruen-100" />
          {t('besuch.titel')}
        </h2>
        <Text feld={kontakt.besuchstext} sprache={sprache} als="p" className="text-gruen-50" />
        <ul className="flex flex-wrap gap-2">
          <li className={chip}>
            <BookOpen aria-hidden className="size-4" />
            {t('besuch.fuehrungen')}
          </li>
          <li className={chip}>
            <Calendar aria-hidden className="size-4" />
            {t('besuch.termine')}
          </li>
        </ul>
      </section>
    </div>
  );
}
